// ═══════════════════════════════════════════════════════════════════════════
// mgi-planilla.js — Planilla de hospedajes del programa MGI
// Sistema AM · Antofagasta Minerals
//
// Es lo primero que ve MGI al abrir Hotelería: la lista de hospedajes que
// participan del programa, editable en la misma línea. Reemplaza el Excel
// "Informe Disponibilidad Hospedajes" que se llevaba aparte.
//
// DÓNDE SE GUARDA CADA COSA — no se duplica nada:
//   proveedores      → nombre, dirección, RUT
//   hoteleria        → habitaciones simples/dobles y cuáles tienen baño privado
//   contactos        → encargado (principal) y dueño
//   hospedajes_mgi   → lo propio del programa: código MGI, participación,
//                      arriendo a empresa colaboradora, cuándo volver a llamar
// Por eso lo que MGI edite acá se ve de inmediato en el directorio de
// proveedores y en la página pública de Hoteles SG.
//
// BAJA: nunca se borra un hospedaje. Se marca fuera del programa, con motivo
// obligatorio, y la fila queda en rojo.
//
// <script src> clásico, nunca type="module" — CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════

let PLAN = {};          // proveedor_id → fila de hospedajes_mgi
let PLAN_EDIT = {};     // proveedor_id → {campo: valorNuevo} pendientes de guardar
let PLAN_NUEVAS = [];   // filas agregadas que todavía no existen en la base
let PLAN_FILTRO = 'todos';
let PLAN_ORDEN  = {col:'codigo', dir:'asc'};  // col = clave de columna · dir = asc|desc
let PLAN_SEL    = null;       // pid de la fila marcada (para no perderse al llamar)

// ── Carga ───────────────────────────────────────────────────────────────────
async function planCargar(){
  planCargarColumnas();
  try{
    const {data,error}=await SB.from('hospedajes_mgi').select('*');
    if(error) throw error;
    PLAN={}; (data||[]).forEach(r=>{ PLAN[r.proveedor_id]=r; });
  }catch(e){ console.warn('hospedajes_mgi',e); }
}

// Los del programa MGI, rubro hotelería. Los dados de baja siguen apareciendo
// (en rojo): la idea es no perderlos de vista, no esconderlos.
function planFilas(){
  const q=(document.getElementById('q')?.value||'').toLowerCase().trim();
  let arr=DATA.filter(p=>p.programa_mgi===true && (p.programa_mgi_rubro||'hoteleria')==='hoteleria');
  // los dados de baja quedan fuera de programa_mgi, así que se recuperan aparte
  Object.keys(PLAN).forEach(pid=>{
    if(PLAN[pid].baja && !arr.some(p=>p.proveedor_id===pid)){
      const p=DATA.find(x=>x.proveedor_id===pid); if(p) arr.push(p);
    }
  });
  if(PLAN_FILTRO==='llamar')      arr=arr.filter(p=>planDiasLlamar(p.proveedor_id)!==null && planDiasLlamar(p.proveedor_id)<=0 && !planV(p,'baja'));
  else if(PLAN_FILTRO==='arrendados') arr=arr.filter(p=>planV(p,'arrendado_completo')===true);
  else if(PLAN_FILTRO==='disponibles') arr=arr.filter(p=>!planV(p,'arrendado_completo') && !planV(p,'baja'));
  else if(PLAN_FILTRO==='baja')   arr=arr.filter(p=>planV(p,'baja'));
  if(q) arr=arr.filter(p=>((dispName(p)||'')+' '+(p.direccion||'')+' '+(p.rut_empresa||'')+' '+
                           (planV(p,'codigo_mgi')||'')+' '+(planV(p,'eecc_hospeda')||'')).toLowerCase().includes(q));
  const az=(a,b)=>dispName(a).localeCompare(dispName(b),'es');
  const dir = PLAN_ORDEN.dir==='desc' ? -1 : 1;
  return arr.sort((a,b)=>{
    const r = planCmpCol(a,b,PLAN_ORDEN.col);
    return (r!==0 ? r*dir : az(a,b));   // desempate estable por nombre
  });
}
// Valor de una columna para ordenar. Números como número, texto como texto.
function planOrdenValor(p,col){
  const pid=p.proveedor_id;
  if(col==='codigo'){ const n=parseInt(planV(pid,'codigo_mgi')); return isNaN(n)?Infinity:n; }
  if(col==='nombre')      return dispName(p);
  if(col==='contacto')    return (planV(pid,'enc_nombre')||planV(pid,'due_nombre')||'');
  if(col==='hab_totales') return planTotalHab(pid);
  if(col==='cap_maxima')  return planCapMax(pid);
  const NUM=new Set(['simples_priv','simples_comp','dobles_priv','dobles_comp','camas_instaladas',
    'hab_disponibles','n_hospedados','camas_disponibles']);
  const v=planV(pid,col);
  if(NUM.has(col)){ const n=parseInt(v); return isNaN(n)?-1:n; }
  return String(v==null?'':v);
}
// Compara dos hospedajes por una columna (texto o número).
function planCmpCol(a,b,col){
  const x=planOrdenValor(a,col), y=planOrdenValor(b,col);
  if(typeof x==='number' && typeof y==='number') return x-y;
  return String(x).localeCompare(String(y),'es',{numeric:true});
}
// Clic en el título de una columna: ordena por ella; otro clic invierte.
function planOrdenarCol(col){
  const NUM=new Set(['codigo','hab_totales','cap_maxima','simples_priv','simples_comp','dobles_priv',
    'dobles_comp','camas_instaladas','hab_disponibles','n_hospedados','camas_disponibles']);
  if(PLAN_ORDEN.col===col) PLAN_ORDEN={col, dir: PLAN_ORDEN.dir==='asc'?'desc':'asc'};
  else PLAN_ORDEN={col, dir: NUM.has(col)?'desc':'asc'};   // números: mayor a menor primero
  planRender();
}
// Desde el selector de arriba (mapea a la nueva forma {col,dir}).
function planSetOrden(v){
  const M={codigo:['codigo','asc'], az:['nombre','asc'], za:['nombre','desc'],
    cont_az:['contacto','asc'], cont_za:['contacto','desc'],
    disp_desc:['hab_disponibles','desc'], disp_asc:['hab_disponibles','asc']};
  const m=M[v]||['codigo','asc'];
  PLAN_ORDEN={col:m[0], dir:m[1]};
  planRender();
}
// Marca la fila completa: al llamar por teléfono, no perder de vista cuál es.
function planMarcarFila(pid, ev){
  if(ev && (ev.target.closest('input,select,button,a,textarea'))) return;  // no al editar una celda
  PLAN_SEL = (PLAN_SEL===pid ? null : pid);
  document.querySelectorAll('.pl-tabla tr.marcada').forEach(t=>t.classList.remove('marcada'));
  if(PLAN_SEL){ const tr=document.querySelector(`tr[data-pid="${PLAN_SEL}"]`); if(tr) tr.classList.add('marcada'); }
}

// ── Lectura de un campo, con lo editado sin guardar por encima ──────────────
function planV(p, campo){
  const pid=typeof p==='string'?p:p.proveedor_id;
  if(PLAN_EDIT[pid] && campo in PLAN_EDIT[pid]) return PLAN_EDIT[pid][campo];
  const prov=typeof p==='string'?DATA.find(x=>x.proveedor_id===pid):p;
  const h=HOT[pid]||{};
  const cs=CONT[pid]||[];
  const enc=cs.find(c=>String(c.principal).toUpperCase()==='TRUE')||cs.find(c=>/encarg/i.test(c.cargo||''))||cs[0]||{};
  const due=cs.find(c=>/due/i.test(c.cargo||''))||{};
  const m=PLAN[pid]||{};
  switch(campo){
    case 'nombre':      return prov?dispName(prov):'';
    case 'direccion':   return prov?(prov.direccion||''):'';
    case 'rut':         return prov?(prov.rut_empresa||''):'';
    case 'enc_nombre':  return enc.nombre||'';
    case 'enc_correo':  return enc.correo||'';
    case 'enc_fono':    return enc.fono||'';
    case 'due_nombre':  return due.nombre||'';
    case 'due_correo':  return due.correo||'';
    case 'due_fono':    return due.fono||'';
    case 'simples_priv':  return parseInt(h.simples_banio)||0;
    case 'simples_comp':  return Math.max(0,(parseInt(h.simples)||0)-(parseInt(h.simples_banio)||0));
    case 'dobles_priv':   return parseInt(h.dobles_banio)||0;
    case 'dobles_comp':   return Math.max(0,(parseInt(h.dobles)||0)-(parseInt(h.dobles_banio)||0));
    case 'arrendado_completo': return m.arrendado_completo===true;
    case 'baja':        return m.baja===true;
    default:            return m[campo]!=null?m[campo]:'';
  }
}
// Totales: siempre calculados, nunca escritos a mano.
function planTotalHab(pid){
  return (parseInt(planV(pid,'simples_priv'))||0)+(parseInt(planV(pid,'simples_comp'))||0)
       + (parseInt(planV(pid,'dobles_priv'))||0)+(parseInt(planV(pid,'dobles_comp'))||0);
}
function planCapMax(pid){
  return (parseInt(planV(pid,'simples_priv'))||0)+(parseInt(planV(pid,'simples_comp'))||0)
       + ((parseInt(planV(pid,'dobles_priv'))||0)+(parseInt(planV(pid,'dobles_comp'))||0))*2;
}

// ── El contador de "volver a llamar" ────────────────────────────────────────
// Un hospedaje arrendado completo hasta diciembre no se llama todas las
// semanas. Se guarda hasta cuándo no hay que llamar y acá se cuentan los días.
function planHoyISO(){
  const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function planDiasLlamar(pid){
  const f=planV(pid,'volver_a_llamar'); if(!f) return null;
  const a=new Date(planHoyISO()+'T00:00:00'), b=new Date(String(f).slice(0,10)+'T00:00:00');
  if(isNaN(b)) return null;
  return Math.round((b-a)/86400000);
}
function planLlamarHTML(pid){
  const d=planDiasLlamar(pid);
  if(d===null){
    const fin=planV(pid,'contrato_fin');
    if(planV(pid,'arrendado_completo') && fin)
      return `<button class="pl-sug" onclick="planSugerirLlamada('${pid}')" title="Usar la fecha de término del contrato">usar ${String(fin).slice(0,10)}</button>`;
    return '<span class="pl-dim">sin fecha</span>';
  }
  if(d>0)  return `<span class="pl-chip ok">faltan ${d} día${d===1?'':'s'}</span>`;
  if(d===0) return '<span class="pl-chip hoy">llamar hoy</span>';
  return `<span class="pl-chip tarde">atrasado ${-d} día${d===-1?'':'s'}</span>`;
}
function planSugerirLlamada(pid){
  planSet(pid,'volver_a_llamar', String(planV(pid,'contrato_fin')).slice(0,10));
  planRender();
}

// ── Edición ─────────────────────────────────────────────────────────────────
function planSet(pid, campo, valor){
  const actual=planV(pid,campo);
  if(!PLAN_EDIT[pid]) PLAN_EDIT[pid]={};
  if(String(actual)===String(valor) && !(campo in PLAN_EDIT[pid])){ return; }
  PLAN_EDIT[pid][campo]=valor;
  planMarcarSucia(pid);
  planBarra();
}
function planMarcarSucia(pid){
  const tr=document.querySelector(`tr[data-pid="${pid}"]`);
  if(tr){ tr.classList.add('sucia'); const b=tr.querySelector('.pl-guardar'); if(b) b.style.visibility='visible'; }
  const t=document.getElementById('plTot_'+pid); if(t) t.textContent=planTotalHab(pid);
  const c=document.getElementById('plCap_'+pid); if(c) c.textContent=planCapMax(pid);
  const l=document.getElementById('plLlam_'+pid); if(l) l.innerHTML=planLlamarHTML(pid);
}
const planSucias = () => Object.keys(PLAN_EDIT).filter(k=>Object.keys(PLAN_EDIT[k]||{}).length);

function planBarra(){
  const n=planSucias().length;
  const b=document.getElementById('plBarra'); if(!b) return;
  b.className=n?'pl-barra activa':'pl-barra';
  b.innerHTML=n
    ? `<div><b>${n}</b> hospedaje${n===1?'':'s'} con cambios sin guardar</div>
       <div class="pl-barra-btns">
         <button class="pl-b2" onclick="planDescartar()">Descartar</button>
         <button class="pl-b1" onclick="planGuardarTodo()">💾 Guardar los ${n}</button>
       </div>`
    : '<div class="pl-dim">Edita cualquier casilla y aparecerá el botón de guardar en esa línea.</div>';
}
function planDescartar(){
  if(!confirm('¿Descartar todos los cambios sin guardar?')) return;
  PLAN_EDIT={}; PLAN_NUEVAS=[]; planRender();
}

// ── Guardar ─────────────────────────────────────────────────────────────────
async function planGuardarFila(pid){
  const cambios=PLAN_EDIT[pid]; if(!cambios||!Object.keys(cambios).length) return true;
  const now=new Date().toISOString();
  const quien=miNombreMGI();
  try{
    const nueva=PLAN_NUEVAS.includes(pid);
    let p=DATA.find(x=>x.proveedor_id===pid);

    // ── proveedores ──
    const provCambios={};
    if('nombre' in cambios){ provCambios.nombre_fantasia=cambios.nombre; provCambios.razon_social=cambios.nombre; }
    if('direccion' in cambios) provCambios.direccion=cambios.direccion;
    if('rut' in cambios)       provCambios.rut_empresa=cambios.rut;

    if(nueva){
      const nombre=(cambios.nombre||'').trim();
      if(!nombre){ alert('El hospedaje necesita un nombre'); return false; }
      const ins={ proveedor_id:pid, razon_social:nombre, nombre_fantasia:nombre,
        rut_empresa:cambios.rut||'', direccion:cambios.direccion||'', localidad:'Sierra Gorda',
        rubros_norm:'Hotelería / Hospedaje', giros_sii:'Hospedaje', es_hoteleria:true,
        programa_mgi:true, programa_mgi_rubro:'hoteleria',
        estado_registro:'Activo', fuente:'mgi_planilla', created_by:quien, updated_at:now };
      const {error}=await SB.from('proveedores').insert(ins); if(error) throw error;
      p={...ins}; DATA.push(p);
      PLAN_NUEVAS=PLAN_NUEVAS.filter(x=>x!==pid);
    } else if(Object.keys(provCambios).length){
      provCambios.updated_at=now;
      const {error}=await SB.from('proveedores').update(provCambios).eq('proveedor_id',pid);
      if(error) throw error;
      Object.assign(p,provCambios);
    }

    // ── baja: sale del programa, no se borra ──
    if('baja' in cambios && cambios.baja===true){
      await SB.from('proveedores').update({programa_mgi:false,updated_at:now}).eq('proveedor_id',pid);
      if(p) p.programa_mgi=false;
    }
    if('baja' in cambios && cambios.baja===false){
      await SB.from('proveedores').update({programa_mgi:true,programa_mgi_rubro:'hoteleria',updated_at:now}).eq('proveedor_id',pid);
      if(p){ p.programa_mgi=true; p.programa_mgi_rubro='hoteleria'; }
    }

    // ── hoteleria: habitaciones y baños ──
    const tocaHab=['simples_priv','simples_comp','dobles_priv','dobles_comp'].some(k=>k in cambios);
    if(tocaHab || nueva){
      const sp=parseInt(planV(pid,'simples_priv'))||0, sc=parseInt(planV(pid,'simples_comp'))||0;
      const dp=parseInt(planV(pid,'dobles_priv'))||0,  dc=parseInt(planV(pid,'dobles_comp'))||0;
      const h=HOT[pid]||{contratos:[],servicios:[]};
      const json=JSON.stringify({ total:sp+sc+dp+dc, contratos:h.contratos||[], servicios:h.servicios||[],
                                  simples_banio:sp, dobles_banio:dp });
      // Upsert por hotel_id (siempre 'hot_'+proveedor_id): si la fila ya existe
      // la actualiza, si no la crea. Antes se hacía delete+insert, pero el delete
      // no borraba (RLS sin política DELETE + trigger trg_bloq_borrado) y el
      // insert chocaba con la PK -> "duplicate key value violates hoteleria_pkey".
      const {error}=await SB.from('hoteleria').upsert({hotel_id:'hot_'+pid, proveedor_id:pid,
        hab_simples:sp+sc, hab_dobles:dp+dc, contratos_json:json, estado_registro:'Activo', updated_at:now},
        {onConflict:'hotel_id'});
      if(error) throw error;
      HOT[pid]={simples:sp+sc, dobles:dp+dc, simples_banio:sp, dobles_banio:dp,
                total:sp+sc+dp+dc, contratos:h.contratos||[], servicios:h.servicios||[]};
    }

    // ── contactos: encargado (principal) y dueño ──
    await planGuardarContacto(pid, cambios, 'enc', 'Encargado', true);
    await planGuardarContacto(pid, cambios, 'due', 'Dueño', false);

    // ── hospedajes_mgi ──
    const CAMPOS_MGI=['codigo_mgi','participa','camas_instaladas','eecc_hospeda','es_eecc_mcen',
      'contrato_inicio','contrato_fin','arrendado_completo','hab_disponibles','n_hospedados',
      'camas_disponibles','al_dia_pagos','volver_a_llamar','notas','baja','baja_motivo'];
    const mgiCambios={};
    CAMPOS_MGI.forEach(k=>{ if(k in cambios) mgiCambios[k]=cambios[k]===''?null:cambios[k]; });
    if(Object.keys(mgiCambios).length || nueva){
      if('baja' in mgiCambios && mgiCambios.baja===true){
        mgiCambios.baja_fecha=now; mgiCambios.baja_por=quien;
      }
      const fila={ proveedor_id:pid, ...PLAN[pid], ...mgiCambios, updated_by:quien, updated_at:now };
      delete fila.created_by;
      const {error}=await SB.from('hospedajes_mgi').upsert(fila,{onConflict:'proveedor_id'});
      if(error) throw error;
      PLAN[pid]=fila;
    }

    // ── log ──
    const detalle=(nueva?'Creó hospedaje ':'Editó ')+(planV(pid,'nombre')||pid)+
      ' — '+Object.keys(cambios).map(k=>PLAN_ETIQ[k]||k).join(', ')+
      (cambios.baja===true?(' · BAJA: '+(cambios.baja_motivo||planV(pid,'baja_motivo')||'')):'');
    try{ await SB.from('registro_ediciones').insert({usuario_email:USER.email, usuario_nombre:quien,
      entidad:'hospedaje_mgi', entidad_id:pid, accion:nueva?'crear':(cambios.baja===true?'baja':'editar'),
      detalle:detalle.slice(0,480)}); }catch(e){}

    delete PLAN_EDIT[pid];
    return true;
  }catch(e){ alert('No se pudo guardar: '+e.message); return false; }
}

async function planGuardarContacto(pid, cambios, pre, cargo, principal){
  const keys=[pre+'_nombre',pre+'_correo',pre+'_fono'];
  if(!keys.some(k=>k in cambios)) return;
  const cs=CONT[pid]||[];
  let c = principal
    ? (cs.find(x=>String(x.principal).toUpperCase()==='TRUE')||cs.find(x=>/encarg/i.test(x.cargo||''))||cs[0])
    : cs.find(x=>/due/i.test(x.cargo||''));
  const datos={ nombre:planV(pid,pre+'_nombre')||'', correo:planV(pid,pre+'_correo')||'', fono:planV(pid,pre+'_fono')||'' };
  if(c && c.contacto_id){
    await SB.from('contactos').update(datos).eq('contacto_id',c.contacto_id);
    Object.assign(c,datos);
  } else if(datos.nombre||datos.correo||datos.fono){
    const cid='cont_'+pid+'_'+pre+'_'+Date.now().toString(36);
    const nuevo={contacto_id:cid, proveedor_id:pid, cargo:cargo, ...datos,
                 principal:principal?'TRUE':'FALSE', estado_registro:'Activo'};
    await SB.from('contactos').insert(nuevo);
    (CONT[pid]=CONT[pid]||[]).push(nuevo);
  }
}

async function planGuardarUna(pid){
  const ok=await planGuardarFila(pid);
  if(ok){ planRender(); alert('✅ Guardado'); }
}
async function planGuardarTodo(){
  const pids=planSucias();
  if(!pids.length) return;
  let ok=0;
  for(const pid of pids){ if(await planGuardarFila(pid)) ok++; else break; }
  planRender();
  alert('✅ '+ok+' de '+pids.length+' guardado'+(pids.length===1?'':'s'));
}

// ── Baja y alta ─────────────────────────────────────────────────────────────
function planDarBaja(pid){
  const motivo=prompt('¿Por qué sale "'+planV(pid,'nombre')+'" del conteo?\n\nEl motivo es obligatorio y queda en el registro.');
  if(motivo===null) return;
  if(!motivo.trim()){ alert('Sin motivo no se puede dar de baja.'); return; }
  planSet(pid,'baja',true);
  planSet(pid,'baja_motivo',motivo.trim());
  planRender();
}
function planReactivar(pid){
  if(!confirm('¿Volver a incluir "'+planV(pid,'nombre')+'" en el conteo del programa?')) return;
  planSet(pid,'baja',false);
  planSet(pid,'baja_motivo','');
  planRender();
}
// Abre la ficha completa del hospedaje (mismo formulario a fondo del directorio)
// para editar datos que la planilla no toca: correo/teléfono de la empresa,
// contratos, visitas, servicios. Es "aparte de la lista de verificación de camas".
function planAbrirFicha(pid){
  if(PLAN_EDIT[pid] && Object.keys(PLAN_EDIT[pid]).length){
    if(!confirm('Esta línea tiene cambios sin guardar en la planilla. La ficha muestra lo que ya está en la base.\n\n¿Abrir la ficha de todas formas? (guarda la planilla primero para no perder lo editado)')) return;
  }
  if(typeof abrirEdit==='function') abrirEdit(pid);
  else if(typeof verFichaMGI==='function') verFichaMGI(pid);
}

function planAgregar(){
  const pid='mgi_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  PLAN_NUEVAS.push(pid);
  DATA.push({proveedor_id:pid, razon_social:'', nombre_fantasia:'', direccion:'', rut_empresa:'',
             localidad:'Sierra Gorda', programa_mgi:true, programa_mgi_rubro:'hoteleria', _nueva:true});
  PLAN_EDIT[pid]={nombre:'', participa:'SI'};
  planRender();
  setTimeout(()=>{
    const tr=document.querySelector(`tr[data-pid="${pid}"]`);
    if(tr){ tr.scrollIntoView({behavior:'smooth',block:'center'}); const i=tr.querySelector('input'); if(i) i.focus(); }
  },80);
}

// ═══════════════════════════════════════════════════════════════════════════
// COLUMNAS
//
// Son 26. Nadie las necesita todas a la vez: para la llamada semanal bastan
// cinco, y con las otras 21 en pantalla hay que ir y volver con el scroll
// horizontal para anotar un dato. De acá salen el encabezado, las celdas y el
// panel para ocultarlas, así no se pueden desalinear entre sí.
//
// `grupo` es solo para ordenar el panel. `k` es la clave que se guarda en
// localStorage (preferencia de interfaz, no dato de nadie — CLAUDE.md Regla 5).
// ═══════════════════════════════════════════════════════════════════════════
const PLAN_COLUMNAS = [
  {k:'codigo_mgi', grupo:'Identificación', th:'Cód.<br>MGI', clase:'c-cod',
   td:pid=>txt(pid,'codigo_mgi',52)},
  {k:'nombre', grupo:'Identificación', th:'Establecimiento', clase:'c-nom', fija:true,
   td:pid=>txt(pid,'nombre',190)+(planV(pid,'baja')
     ? `<div class="pl-motivo" title="${esc(planV(pid,'baja_motivo')||'')}">fuera: ${esc((planV(pid,'baja_motivo')||'').slice(0,40))}</div>`
     : '')},
  {k:'direccion', grupo:'Identificación', th:'Dirección', td:pid=>txt(pid,'direccion',170)},
  {k:'participa', grupo:'Identificación', th:'Participa 2026',
   td:pid=>sel(pid,'participa',['SI','NO','En reparación','Dirección inexistente',
     'Casa arrendada, no a trabajadores','Construirán más adelante','No contesta'])},
  {k:'rut', grupo:'Identificación', th:'RUT', td:pid=>txt(pid,'rut',110)},

  {k:'enc_nombre', grupo:'Contactos', th:'Encargado', td:pid=>txt(pid,'enc_nombre',150)},
  {k:'enc_correo', grupo:'Contactos', th:'Correo encargado', td:pid=>txt(pid,'enc_correo',190)},
  {k:'enc_fono',   grupo:'Contactos', th:'Teléfono encargado', td:pid=>txt(pid,'enc_fono',120)},
  {k:'due_nombre', grupo:'Contactos', th:'Dueño', td:pid=>txt(pid,'due_nombre',150)},
  {k:'due_correo', grupo:'Contactos', th:'Correo dueño', td:pid=>txt(pid,'due_correo',190)},
  {k:'due_fono',   grupo:'Contactos', th:'Teléfono dueño', td:pid=>txt(pid,'due_fono',120)},

  {k:'simples_priv', grupo:'Capacidad', th:'Simples<br>baño priv.', num:true, td:pid=>num(pid,'simples_priv')},
  {k:'simples_comp', grupo:'Capacidad', th:'Simples<br>baño comp.', num:true, td:pid=>num(pid,'simples_comp')},
  {k:'dobles_priv',  grupo:'Capacidad', th:'Dobles<br>baño priv.',  num:true, td:pid=>num(pid,'dobles_priv')},
  {k:'dobles_comp',  grupo:'Capacidad', th:'Dobles<br>baño comp.',  num:true, td:pid=>num(pid,'dobles_comp')},
  {k:'hab_totales',  grupo:'Capacidad', th:'Hab.<br>totales', num:true, calc:true,
   td:pid=>`<span id="plTot_${pid}">${planTotalHab(pid)}</span>`},
  {k:'cap_maxima',   grupo:'Capacidad', th:'Capacidad<br>máxima', num:true, calc:true,
   td:pid=>`<span id="plCap_${pid}">${planCapMax(pid)}</span>`},
  {k:'camas_instaladas', grupo:'Capacidad', th:'Camas<br>instaladas', num:true,
   td:pid=>num(pid,'camas_instaladas')},

  {k:'eecc_hospeda', grupo:'Ocupación', th:'Empresa colaboradora', td:pid=>txt(pid,'eecc_hospeda',180)},
  {k:'es_eecc_mcen', grupo:'Ocupación', th:'¿EECC de MCEN?', td:pid=>sel(pid,'es_eecc_mcen',['Si','No','No sabe'])},
  {k:'contrato_inicio', grupo:'Ocupación', th:'Contrato desde', td:pid=>fecha(pid,'contrato_inicio')},
  {k:'contrato_fin',    grupo:'Ocupación', th:'Contrato hasta', td:pid=>fecha(pid,'contrato_fin')},
  {k:'arrendado_completo', grupo:'Ocupación', th:'¿Arrendado<br>completo?',
   td:pid=>`<select class="pl-in sel" onchange="planSet('${pid}','arrendado_completo',this.value==='Si')">
      <option value="No" ${!planV(pid,'arrendado_completo')?'selected':''}>No</option>
      <option value="Si" ${planV(pid,'arrendado_completo')?'selected':''}>Sí</option></select>`},
  {k:'hab_disponibles',   grupo:'Ocupación', th:'Hab.<br>disponibles', num:true, td:pid=>num(pid,'hab_disponibles')},
  {k:'n_hospedados',      grupo:'Ocupación', th:'Nº<br>hospedados', num:true, td:pid=>num(pid,'n_hospedados')},
  {k:'camas_disponibles', grupo:'Ocupación', th:'Camas<br>disponibles', num:true, td:pid=>num(pid,'camas_disponibles')},
  {k:'al_dia_pagos',      grupo:'Ocupación', th:'¿Al día<br>con pagos?', td:pid=>sel(pid,'al_dia_pagos',['Si','No','No sabe'])},

  {k:'volver_a_llamar', grupo:'Seguimiento', th:'Volver a llamar', clase:'c-llam',
   td:pid=>`<div id="plLlam_${pid}">${planLlamarHTML(pid)}</div>${fecha(pid,'volver_a_llamar')}`},
  {k:'notas', grupo:'Seguimiento', th:'Notas', clase:'c-not', td:pid=>txt(pid,'notas',220)},
];

// Vistas armadas para lo que se hace de verdad. La llamada semanal es cinco
// columnas: a quién llamo, a qué número, cuánto le queda y cuándo vuelvo.
const PLAN_VISTAS = {
  llamada:   {n:'📞 Llamada semanal', cols:['codigo_mgi','nombre','enc_nombre','enc_fono',
              'arrendado_completo','hab_disponibles','camas_disponibles','volver_a_llamar','notas']},
  capacidad: {n:'🛏 Capacidad', cols:['codigo_mgi','nombre','direccion','simples_priv','simples_comp',
              'dobles_priv','dobles_comp','hab_totales','cap_maxima','camas_instaladas']},
  contactos: {n:'👥 Contactos', cols:['codigo_mgi','nombre','direccion','rut','enc_nombre','enc_correo',
              'enc_fono','due_nombre','due_correo','due_fono']},
  todas:     {n:'Todas', cols:null},
};

let PLAN_OCULTAS = new Set();
const PLAN_LS = 'am_mgi_columnas';

function planCargarColumnas(){
  try{
    const g=localStorage.getItem(PLAN_LS);
    if(g) PLAN_OCULTAS=new Set(JSON.parse(g));
  }catch(e){}
}
function planGuardarColumnas(){
  try{ localStorage.setItem(PLAN_LS, JSON.stringify([...PLAN_OCULTAS])); }catch(e){}
}
// El nombre no se puede esconder: sin él no se sabe qué línea se está editando.
const planColVisible = k => k==='nombre' || !PLAN_OCULTAS.has(k);

function planToggleCol(k){
  if(k==='nombre') return;
  if(PLAN_OCULTAS.has(k)) PLAN_OCULTAS.delete(k); else PLAN_OCULTAS.add(k);
  planGuardarColumnas(); planRender(); planAbrirColumnas(true);
}
function planVista(v){
  const cfg=PLAN_VISTAS[v]; if(!cfg) return;
  PLAN_OCULTAS = cfg.cols
    ? new Set(PLAN_COLUMNAS.map(c=>c.k).filter(k=>!cfg.cols.includes(k)))
    : new Set();
  planGuardarColumnas(); planRender(); planAbrirColumnas(true);
}
// Qué vista está puesta, si es que calza con alguna
function planVistaActual(){
  for(const v of Object.keys(PLAN_VISTAS)){
    const cfg=PLAN_VISTAS[v];
    const esperado=cfg.cols
      ? PLAN_COLUMNAS.map(c=>c.k).filter(k=>!cfg.cols.includes(k))
      : [];
    if(esperado.length===PLAN_OCULTAS.size && esperado.every(k=>PLAN_OCULTAS.has(k))) return v;
  }
  return null;
}

function planAbrirColumnas(mantener){
  const p=document.getElementById('plCols');
  if(!p) return;
  if(!mantener && p.classList.contains('abierto')){ p.classList.remove('abierto'); return; }
  const actual=planVistaActual();
  const grupos={};
  PLAN_COLUMNAS.forEach(c=>{ (grupos[c.grupo]=grupos[c.grupo]||[]).push(c); });
  p.innerHTML=`
    <div class="plc-vistas">
      ${Object.keys(PLAN_VISTAS).map(v=>`<button class="plc-v ${actual===v?'active':''}"
         onclick="planVista('${v}')">${PLAN_VISTAS[v].n}</button>`).join('')}
    </div>
    <div class="plc-grupos">
      ${Object.keys(grupos).map(g=>`<div class="plc-g">
        <div class="plc-gt">${esc(g)}</div>
        ${grupos[g].map(c=>`<label class="plc-i ${c.fija?'fija':''}">
          <input type="checkbox" ${planColVisible(c.k)?'checked':''} ${c.fija?'disabled':''}
                 onchange="planToggleCol('${c.k}')">
          <span>${c.th.replace(/<br>/g,' ')}</span></label>`).join('')}
      </div>`).join('')}
    </div>
    <div class="plc-pie">${PLAN_COLUMNAS.length-PLAN_OCULTAS.size} de ${PLAN_COLUMNAS.length} columnas a la vista</div>`;
  p.classList.add('abierto');
}
function planCerrarColumnas(e){
  const p=document.getElementById('plCols');
  if(p && p.classList.contains('abierto') && !p.contains(e.target) &&
     !(e.target.closest && e.target.closest('.pl-cols-btn'))) p.classList.remove('abierto');
}
document.addEventListener('click', planCerrarColumnas);

// ── Render ──────────────────────────────────────────────────────────────────
const PLAN_ETIQ={codigo_mgi:'código MGI',participa:'participación',rut:'RUT',nombre:'nombre',
  direccion:'dirección',enc_nombre:'encargado',enc_correo:'correo encargado',enc_fono:'teléfono encargado',
  due_nombre:'dueño',due_correo:'correo dueño',due_fono:'teléfono dueño',
  simples_priv:'simples baño privado',simples_comp:'simples baño compartido',
  dobles_priv:'dobles baño privado',dobles_comp:'dobles baño compartido',
  camas_instaladas:'camas instaladas',eecc_hospeda:'empresa colaboradora',es_eecc_mcen:'es EECC de MCEN',
  contrato_inicio:'inicio de contrato',contrato_fin:'término de contrato',
  arrendado_completo:'arrendado completo',hab_disponibles:'habitaciones disponibles',
  n_hospedados:'hospedados',camas_disponibles:'camas disponibles',al_dia_pagos:'al día con pagos',
  volver_a_llamar:'volver a llamar',notas:'notas',baja:'baja del conteo',baja_motivo:'motivo de baja'};

function txt(pid,campo,ancho){
  return `<input class="pl-in" style="width:${ancho||110}px" value="${esc(planV(pid,campo))}"
    oninput="planSet('${pid}','${campo}',this.value)">`;
}
function num(pid,campo){
  return `<input class="pl-in num" type="number" min="0" value="${planV(pid,campo)===''?'':planV(pid,campo)}"
    oninput="planSet('${pid}','${campo}',this.value===''?'':parseInt(this.value)||0)">`;
}
function fecha(pid,campo){
  return `<input class="pl-in fecha" type="date" value="${String(planV(pid,campo)||'').slice(0,10)}"
    onchange="planSet('${pid}','${campo}',this.value)">`;
}
function sel(pid,campo,opciones){
  const v=String(planV(pid,campo)||'');
  const extra=(v && !opciones.includes(v))?[v]:[];
  return `<select class="pl-in sel" onchange="planSet('${pid}','${campo}',this.value)">
    <option value=""></option>
    ${[...opciones,...extra].map(o=>`<option ${v===o?'selected':''}>${esc(o)}</option>`).join('')}
  </select>`;
}

function planRender(){
  const cont=document.getElementById('cont');
  const filas=planFilas();

  // resumen de arriba: lo que MGI reporta
  const vivos=filas.filter(p=>!planV(p,'baja'));
  const tHab=vivos.reduce((s,p)=>s+planTotalHab(p.proveedor_id),0);
  const tCap=vivos.reduce((s,p)=>s+planCapMax(p.proveedor_id),0);
  const arr=vivos.filter(p=>planV(p,'arrendado_completo')).length;
  const porLlamar=vivos.filter(p=>{const d=planDiasLlamar(p.proveedor_id); return d!==null&&d<=0;}).length;

  let h=`<div class="pl-kpis">
      <div class="pl-kpi"><div class="pl-kn">${vivos.length}</div><div class="pl-kl">Hospedajes en el programa</div></div>
      <div class="pl-kpi"><div class="pl-kn">${tHab}</div><div class="pl-kl">Habitaciones</div></div>
      <div class="pl-kpi"><div class="pl-kn">${tCap}</div><div class="pl-kl">Capacidad máxima (camas)</div></div>
      <div class="pl-kpi"><div class="pl-kn">${arr}</div><div class="pl-kl">Arrendados completos</div></div>
      <div class="pl-kpi ${porLlamar?'alerta':''}"><div class="pl-kn">${porLlamar}</div><div class="pl-kl">Por llamar</div></div>
    </div>
    <div class="pl-tools">
      ${[['todos','Todos'],['disponibles','Con disponibilidad'],['arrendados','Arrendados completos'],
         ['llamar','Por llamar'],['baja','Fuera del conteo']]
        .map(([k,t])=>`<button class="pl-f ${PLAN_FILTRO===k?'active':''}" onclick="planSetFiltro('${k}')">${t}</button>`).join('')}
      <span class="pl-sep"></span>
      <label class="pl-orden">Ordenar
        ${(()=>{ const o=PLAN_ORDEN, sel=(c,d)=>o.col===c&&o.dir===d?'selected':'';
          return `<select onchange="planSetOrden(this.value)">
          <option value="codigo" ${sel('codigo','asc')}>Código MGI</option>
          <optgroup label="Por hospedaje">
            <option value="az" ${sel('nombre','asc')}>Hospedaje A → Z</option>
            <option value="za" ${sel('nombre','desc')}>Hospedaje Z → A</option>
          </optgroup>
          <optgroup label="Por contacto">
            <option value="cont_az" ${sel('contacto','asc')}>Encargado A → Z</option>
            <option value="cont_za" ${sel('contacto','desc')}>Encargado Z → A</option>
          </optgroup>
          <optgroup label="Por camas disponibles">
            <option value="disp_desc" ${sel('hab_disponibles','desc')}>Mayor a menor</option>
            <option value="disp_asc" ${sel('hab_disponibles','asc')}>Menor a mayor</option>
          </optgroup>
        </select>`; })()}
      </label>
      <div class="pl-cols-wrap">
        <button class="pl-imp pl-cols-btn" onclick="planAbrirColumnas()">🧩 Columnas
          <span class="pl-cols-n">${PLAN_COLUMNAS.length-PLAN_OCULTAS.size}/${PLAN_COLUMNAS.length}</span></button>
        <div class="plc-panel" id="plCols"></div>
      </div>
      <button class="pl-add" onclick="planAgregar()">➕ Agregar hospedaje</button>
      <button class="pl-imp" onclick="impAbrir()">⬆ Importar Excel</button>
      <button class="pl-imp" onclick="planExportar()">⬇ Excel</button>
    </div>
    <div class="pl-barra" id="plBarra"></div>`;

  if(!filas.length){
    cont.innerHTML=h+'<div class="empty">Sin hospedajes en este filtro.</div>';
    planBarra(); return;
  }

  // La tabla se arma desde PLAN_COLUMNAS: el encabezado, las celdas y el panel
  // de "Columnas" salen de la misma lista, así no se pueden desalinear.
  const visibles = PLAN_COLUMNAS.filter(c => planColVisible(c.k));

  // la columna del nombre se ordena por 'nombre'; las demás por su propia clave
  const colOrden=c=>c.k==='nombre'?'nombre':c.k;
  const flecha=c=>{ const k=colOrden(c); return PLAN_ORDEN.col===k
    ? `<span class="pl-fl">${PLAN_ORDEN.dir==='asc'?'▲':'▼'}</span>` : '<span class="pl-fl off">↕</span>'; };
  h+=`<div class="pl-wrap"><table class="pl-tabla"><thead><tr>
      <th class="c-acc"></th>
      ${visibles.map(c=>`<th class="${c.clase||''} ${c.num?'num':''} ${c.calc?'calc':''} pl-th-ord ${PLAN_ORDEN.col===colOrden(c)?'activo':''}"
           data-c="${c.k}" title="Ordenar por esta columna"
           onclick="planOrdenarCol('${colOrden(c)}')">${c.th}${flecha(c)}</th>`).join('')}
    </tr></thead><tbody>`;

  h+=filas.map(p=>{
    const pid=p.proveedor_id;
    const baja=planV(pid,'baja');
    const nueva=PLAN_NUEVAS.includes(pid);
    const sucia=(PLAN_EDIT[pid]&&Object.keys(PLAN_EDIT[pid]).length);
    const mk=(PLAN_SEL===pid)?'marcada':'';
    return `<tr data-pid="${pid}" class="${baja?'baja':''} ${nueva?'nueva':''} ${sucia?'sucia':''} ${mk}" onclick="planMarcarFila('${pid}',event)">
      <td class="c-acc">
        <button class="pl-guardar" style="visibility:${sucia?'visible':'hidden'}"
                onclick="planGuardarUna('${pid}')" title="Guardar esta línea">💾</button>
        ${nueva ? '' : `<button class="pl-ficha" onclick="planAbrirFicha('${pid}')"
                title="Abrir la ficha completa para editar a fondo">✎</button>`}
        ${baja
          ? `<button class="pl-baja" onclick="planReactivar('${pid}')" title="${esc(planV(pid,'baja_motivo')||'')}">↩</button>`
          : `<button class="pl-baja" onclick="planDarBaja('${pid}')" title="Sacar del conteo">✕</button>`}
      </td>
      ${visibles.map(c=>`<td class="${c.clase||''} ${c.num?'num':''} ${c.calc?'calc':''}"
           data-c="${c.k}">${c.td(pid,p)}</td>`).join('')}
    </tr>`;
  }).join('');

  h+='</tbody></table></div>';
  cont.innerHTML=h;
  planBarra();
}

function planSetFiltro(f){ PLAN_FILTRO=f; planRender(); }

// ── Excel de la planilla, con las mismas columnas ───────────────────────────
function planExportar(){
  if(typeof XLSX==='undefined'){ alert('No se pudo cargar el generador de Excel.'); return; }
  const filas=planFilas().map(p=>{
    const pid=p.proveedor_id;
    return {
      'Codigo MGI':planV(pid,'codigo_mgi'), 'Nombre Establecimiento':planV(pid,'nombre'),
      'Direccion':planV(pid,'direccion'), 'Participa Programa Centinela 2026':planV(pid,'participa'),
      'RUT':planV(pid,'rut'),
      'Encargado':planV(pid,'enc_nombre'), 'Correo Encargado':planV(pid,'enc_correo'), 'Teléfono Encargado':planV(pid,'enc_fono'),
      'Dueño':planV(pid,'due_nombre'), 'Correo Dueño':planV(pid,'due_correo'), 'Teléfono Dueño':planV(pid,'due_fono'),
      'Simples baño privado':planV(pid,'simples_priv'), 'Simples baño compartido':planV(pid,'simples_comp'),
      'Dobles baño privado':planV(pid,'dobles_priv'), 'Dobles baño compartido':planV(pid,'dobles_comp'),
      'Habitaciones totales':planTotalHab(pid), 'Capacidad maxima':planCapMax(pid),
      'Nº Camas Instaladas':planV(pid,'camas_instaladas'),
      'EECC que hospeda':planV(pid,'eecc_hospeda'), 'Es EECC de MCEN':planV(pid,'es_eecc_mcen'),
      'Inicio contrato':String(planV(pid,'contrato_inicio')||'').slice(0,10),
      'Termino contrato':String(planV(pid,'contrato_fin')||'').slice(0,10),
      'Arrendado completo':planV(pid,'arrendado_completo')?'Si':'No',
      'Habitaciones disponibles':planV(pid,'hab_disponibles'), 'Nº hospedados':planV(pid,'n_hospedados'),
      'Camas disponibles':planV(pid,'camas_disponibles'), 'Al dia con pagos':planV(pid,'al_dia_pagos'),
      'Volver a llamar':String(planV(pid,'volver_a_llamar')||'').slice(0,10),
      'Notas':planV(pid,'notas'),
      'Fuera del conteo':planV(pid,'baja')?('SI — '+(planV(pid,'baja_motivo')||'')):'',
    };
  });
  const ws=XLSX.utils.json_to_sheet(filas);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'Hospedajes MGI');
  XLSX.writeFile(wb,'Hospedajes_MGI_'+planHoyISO()+'.xlsx');
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTAR EL EXCEL DE MGI
//
// Lee la hoja "Hostales SG" del informe de disponibilidad. La columna del
// establecimiento viene como «17. Hospedaje Ines - Diego Portales #108»:
// código MGI, nombre y dirección en una sola celda. Acá se separa en tres.
//
// NO escribe nada sin mostrar antes qué va a pasar con cada fila: a qué
// hospedaje de la base se parece, si se va a crear o actualizar, y qué campos
// cambian. Recién ahí se aplica.
// ═══════════════════════════════════════════════════════════════════════════
let IMP = { filas: [], archivo: '' };

// «17. Hospedaje Ines - Diego Portales #108» → {cod:'17', nombre, direccion}
// Tolera «72.- Nombre, Calle 235» y «Nombre (Calle 104)», que también aparecen.
function impPartir(txt){
  let s=String(txt||'').trim();
  let cod='';
  const mc=s.match(/^\s*(\d+|XX)\s*\.?\s*-?\s*(.*)$/i);
  if(mc){ cod=mc[1]; s=mc[2]; }
  let nombre=s, direccion='';
  const mp=s.match(/^(.*?)\s*\((.+)\)\s*$/);              // Nombre (Dirección)
  if(mp){ nombre=mp[1]; direccion=mp[2]; }
  else {
    const mg=s.match(/^(.*?)\s+-\s+(.+)$/) || s.match(/^(.*?),\s*(.+)$/);
    if(mg){ nombre=mg[1]; direccion=mg[2]; }
  }
  return {cod:cod.trim(), nombre:nombre.trim(), direccion:direccion.trim()};
}
const impRut  = r => String(r||'').replace(/[^0-9kK]/g,'').toUpperCase();
const impNorm = t => String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
                       .replace(/[^a-z0-9]+/g,' ').trim();

// A qué hospedaje de la base corresponde: primero por RUT + nombre parecido,
// después por nombre, y si no, por dirección. Sin coincidencia = alta nueva.
function impBuscar(f){
  const rut=impRut(f.rut), nom=impNorm(f.nombre), dir=impNorm(f.direccion);
  const cand=DATA.filter(p=>p.proveedor_id);
  let m=cand.find(p=>rut && impRut(p.rut_empresa)===rut && impNorm(dispName(p))===nom);
  if(m) return {p:m, como:'RUT y nombre'};
  m=cand.find(p=>impNorm(dispName(p))===nom);
  if(m) return {p:m, como:'nombre'};
  if(dir){
    m=cand.find(p=>rut && impRut(p.rut_empresa)===rut && impNorm(p.direccion)===dir);
    if(m) return {p:m, como:'RUT y dirección'};
  }
  return null;
}

function impAbrir(){
  const inp=document.createElement('input');
  inp.type='file'; inp.accept='.xlsx,.xls';
  inp.onchange=()=>{ if(inp.files[0]) impLeer(inp.files[0]); };
  inp.click();
}

// Cada campo con los nombres de encabezado que puede tener. Se compara sin
// tildes ni mayúsculas. Así el importador entiende TANTO el Excel que exporta
// esta misma página ("Hospedajes MGI") COMO el informe viejo ("Hostales SG"),
// y no se rompe si alguien reordena o renombra levemente una columna.
const IMP_COLS = {
  cod:        ['codigo mgi','cod mgi','codigo'],
  nombre:     ['nombre establecimiento','establecimiento','hospedaje','nombre'],
  direccion:  ['direccion','direccion '],
  participa:  ['participa programa centinela 2026','participara del programa centinela 2026','participa','participa 2026'],
  rut:        ['rut','rut empresa'],
  enc_nombre: ['encargado'],
  enc_correo: ['correo encargado','correo electronico encargado','correo electronico  encargado'],
  enc_fono:   ['telefono encargado','telefono  encargado','fono encargado'],
  due_nombre: ['dueno','dueño'],
  due_correo: ['correo dueno','correo electronico dueno','correo dueño'],
  due_fono:   ['telefono dueno','fono dueno','telefono dueño'],
  simples_priv:['simples bano privado','cantidad habitaciones simples bano privado','habitaciones que solo pueden ser simples simples bano privado'],
  simples_comp:['simples bano compartido','cantidad habitaciones simples bano compartido','habitaciones que solo pueden ser simples simples sin  privado'],
  dobles_priv: ['dobles bano privado','cantidad habitaciones dobles bano privado','habitaciiones que pueden ser dobles o simples con bano privado'],
  dobles_comp: ['dobles bano compartido','cantidad habitaciones dobles bano compartido','habitaciiones que pueden ser dobles o simples con sin  privado'],
  camas_instaladas:['no camas instaladas','n camas instaladas','camas instaladas','camas instaladas mgi 2026','camas instaladas 2026'],
  eecc_hospeda:['eecc que hospeda','eecc que hospeda','indique el nombre de la empresa colaboradora de minera centinela que hospeda en su establecimiento'],
  es_eecc_mcen:['es eecc de mcen','es eecc de mcen'],
  contrato_inicio:['inicio contrato','fehca de inicicio contrato','fecha de inicio contrato'],
  contrato_fin:['termino contrato','fecha de termino de contrato','fecha de termino contrato'],
  arrendado_completo:['arrendado completo','su hospedaje esta completamente arrendado a la empresa colaboradora mencionada anteriormente'],
  hab_disponibles:['habitaciones disponibles','cuantas habitaciones le quedan disponibles'],
  n_hospedados:['no hospedados','n hospedados','hopedados','nº hopedados','cuantos trabajadores de la empresa colaboradora de minera centinela indicada anteriormente alojan en su hospedaje'],
  camas_disponibles:['camas disponibles','camas disponibles (si no arrendo hostal completo)'],
  al_dia_pagos:['al dia con pagos','la empresa mencionada anteriormente se encuentra al dia con los pagos'],
  volver_a_llamar:['volver a llamar','volver a llamar dia'],
  notas:['notas','observaciones'],
  fuera:['fuera del conteo'],
};

// Localiza la fila de encabezados y arma el mapa columna→campo.
function impMapa(matriz){
  for(let i=0;i<Math.min(6,matriz.length);i++){
    const fila=matriz[i].map(c=>impNorm(c));
    const mapa={}; let aciertos=0;
    fila.forEach((txt,col)=>{
      if(!txt) return;
      for(const campo in IMP_COLS){
        if(mapa[campo]!=null) continue;
        if(IMP_COLS[campo].some(h=>txt===impNorm(h))){ mapa[campo]=col; aciertos++; break; }
      }
    });
    if(mapa.nombre!=null && aciertos>=4) return {fila:i, mapa};
  }
  return null;
}

function impLeer(file){
  if(typeof XLSX==='undefined'){ alert('No se pudo cargar el lector de Excel.'); return; }
  const fr=new FileReader();
  fr.onload=e=>{
    try{
      const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});
      // hoja preferida: la que exporta esta página o el informe conocido; si no,
      // la primera que tenga encabezados reconocibles.
      let hoja=wb.SheetNames.find(n=>/hospedajes mgi|hostales sg/.test(impNorm(n)));
      let matriz, m=null;
      const hojas = hoja ? [hoja] : wb.SheetNames;
      for(const nom of hojas){
        matriz=XLSX.utils.sheet_to_json(wb.Sheets[nom],{header:1,defval:''});
        m=impMapa(matriz);
        if(m){ hoja=nom; break; }
      }
      if(!m){
        alert('No reconocí las columnas del Excel. Debe tener una fila de encabezados con al menos "Nombre Establecimiento" y otras columnas de la planilla MGI.');
        return;
      }
      const g=(r,campo)=>{ const c=m.mapa[campo]; return c==null?'':String(r[c]==null?'':r[c]).trim(); };
      const gN=(r,campo)=>{ const v=g(r,campo); return v===''?null:(parseInt(v)||0); };
      IMP={archivo:file.name, hoja:hoja, filas:[]};
      matriz.slice(m.fila+1).forEach(r=>{
        const nombreCel=g(r,'nombre');
        if(!nombreCel) return;
        // el nombre puede venir limpio ("Hospedaje Inés") o como
        // "17. Hospedaje Inés - Diego Portales #108": impPartir separa ambos.
        const par=impPartir(nombreCel);
        const codCel=g(r,'cod');
        const rutCel=g(r,'rut');
        const f={
          cod: codCel || par.cod,
          nombre: par.nombre || nombreCel,
          direccion: g(r,'direccion') || par.direccion,
          participa: g(r,'participa'),
          rut: (impRut(rutCel).length>=7 ? rutCel : ''),
          enc_nombre:g(r,'enc_nombre'), enc_correo:g(r,'enc_correo'), enc_fono:g(r,'enc_fono'),
          due_nombre:g(r,'due_nombre'), due_correo:g(r,'due_correo'), due_fono:g(r,'due_fono'),
          simples_priv:gN(r,'simples_priv')||0, simples_comp:gN(r,'simples_comp')||0,
          dobles_priv:gN(r,'dobles_priv')||0,   dobles_comp:gN(r,'dobles_comp')||0,
          camas_instaladas:gN(r,'camas_instaladas'),
          eecc_hospeda:g(r,'eecc_hospeda'),
          es_eecc_mcen:(/,/.test(g(r,'es_eecc_mcen'))?'':g(r,'es_eecc_mcen')),  // "Si, No, No Sabe" es el enunciado, no la respuesta
          contrato_inicio:g(r,'contrato_inicio'), contrato_fin:g(r,'contrato_fin'),
          arrendado_completo:/^s[ií]/i.test(g(r,'arrendado_completo')),
          hab_disponibles:gN(r,'hab_disponibles'),
          n_hospedados:gN(r,'n_hospedados'),
          camas_disponibles:gN(r,'camas_disponibles'),
          al_dia_pagos:g(r,'al_dia_pagos'),
          volver_a_llamar:g(r,'volver_a_llamar'),
          notas:g(r,'notas'),
        };
        f.match=impBuscar(f);
        IMP.filas.push(f);
      });
      impPreview();
    }catch(err){ alert('No se pudo leer el archivo: '+err.message); }
  };
  fr.readAsArrayBuffer(file);
}

// Qué cambiaría en la base si se aplica esta fila.
function impDiffs(f){
  if(!f.match) return [];
  const pid=f.match.p.proveedor_id, d=[];
  const cmp=(campo,nuevo)=>{
    if(nuevo===''||nuevo===null||nuevo===undefined) return;
    const viejo=planV(pid,campo);
    if(String(viejo||'')!==String(nuevo)) d.push({campo, viejo:viejo===''?'—':viejo, nuevo});
  };
  ['direccion','rut','enc_nombre','enc_correo','enc_fono','due_nombre','due_correo','due_fono',
   'simples_priv','simples_comp','dobles_priv','dobles_comp','camas_instaladas','eecc_hospeda',
   'es_eecc_mcen','contrato_inicio','contrato_fin','hab_disponibles','al_dia_pagos',
   'n_hospedados','camas_disponibles','notas']
    .forEach(k=>cmp(k,f[k]));
  if(f.cod) cmp('codigo_mgi',f.cod);
  if(f.participa) cmp('participa',f.participa.toUpperCase()==='SI'?'SI':f.participa);
  if(f.arrendado_completo===true && planV(pid,'arrendado_completo')!==true)
    d.push({campo:'arrendado_completo', viejo:'No', nuevo:'Sí'});
  return d;
}

// El más parecido por palabras del nombre: no alcanza para dar por hecho que
// es el mismo, pero sí para que alguien lo mire antes de crear un duplicado.
function impParecido(f){
  const t=impNorm(f.nombre).split(' ').filter(x=>x.length>2);
  if(!t.length) return null;
  let mejor=null, mejorN=0;
  DATA.forEach(p=>{
    const n=impNorm(dispName(p));
    const c=t.filter(x=>n.includes(x)).length;
    if(c>mejorN){ mejorN=c; mejor=p; }
  });
  return mejorN>=Math.max(1,t.length-1) ? mejor : null;
}
function impMarcar(i, crear){ if(IMP.filas[i]) IMP.filas[i].crear=crear; }

function impPreview(){
  const nuevos=IMP.filas.filter(f=>!f.match);
  const conCambios=IMP.filas.filter(f=>f.match && impDiffs(f).length);
  const iguales=IMP.filas.length-nuevos.length-conCambios.length;
  document.getElementById('impBody').innerHTML=`
    <div class="imp-res">
      <b>${IMP.filas.length}</b> filas leídas de <i>${esc(IMP.archivo)}</i> · hoja «${esc(IMP.hoja)}»
      <div class="imp-nums">
        <span class="imp-n crea">${nuevos.length} se crearían</span>
        <span class="imp-n edita">${conCambios.length} se actualizarían</span>
        <span class="imp-n igual">${iguales} ya están igual</span>
      </div>
    </div>
    ${nuevos.length?`<div class="imp-sec">Hospedajes que no están en la base y se crearían</div>
      <div class="imp-dim">Desmarca los que no correspondan crear. Si alguno es el mismo que ya existe
        con otro nombre, aparece el parecido al lado.</div>
      <div class="imp-lista">${nuevos.map((f,i)=>{
        const par=impParecido(f);
        return `<label class="imp-nuevo">
          <input type="checkbox" ${f.crear===false?'':'checked'} onchange="impMarcar(${IMP.filas.indexOf(f)},this.checked)">
          <span><b>${esc(f.nombre)}</b> ${f.direccion?'— '+esc(f.direccion):'<i>sin dirección</i>'}
            ${f.rut?'· RUT '+esc(f.rut):'<i>· sin RUT</i>'}
            ${par?`<span class="imp-parecido">¿es <b>${esc(dispName(par))}</b>${par.direccion?' — '+esc(par.direccion):''}?</span>`:''}
          </span></label>`;
      }).join('')}</div>`:''}
    ${conCambios.length?`<div class="imp-sec">Hospedajes que ya existen y cambiarían</div>
      ${conCambios.map(f=>{
        const d=impDiffs(f);
        return `<div class="imp-item">
          <div class="imp-it-h"><b>${esc(f.nombre)}</b> <span class="imp-como">encontrado por ${f.match.como}</span></div>
          <div class="imp-difs">${d.map(x=>`<span class="imp-dif">${esc(PLAN_ETIQ[x.campo]||x.campo)}:
            <s>${esc(String(x.viejo))}</s> → <b>${esc(String(x.nuevo))}</b></span>`).join('')}</div>
        </div>`;
      }).join('')}`:''}
    <div class="imp-aviso">Nada se guarda todavía. Al aplicar, los cambios quedan cargados en la
      planilla marcados en amarillo; se escriben en la base cuando aprietas <b>Guardar</b>.</div>`;
  document.getElementById('impAplicar').style.display=(nuevos.length||conCambios.length)?'':'none';
  document.getElementById('impModal').style.display='flex';
}
function impCerrar(){ document.getElementById('impModal').style.display='none'; }

// Deja todo cargado como edición pendiente: el paso de escribir en la base es
// el mismo botón Guardar de siempre, así nada entra sin que alguien lo apruebe.
function impAplicar(){
  let creados=0, editados=0;
  IMP.filas.forEach(f=>{
    let pid;
    if(f.match){
      pid=f.match.p.proveedor_id;
      const d=impDiffs(f); if(!d.length) return;
      editados++;
    } else {
      if(f.crear===false) return;            // desmarcado en el previo
      pid='mgi_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
      PLAN_NUEVAS.push(pid);
      DATA.push({proveedor_id:pid, razon_social:f.nombre, nombre_fantasia:f.nombre, direccion:f.direccion||'',
                 rut_empresa:f.rut||'', localidad:'Sierra Gorda', programa_mgi:true,
                 programa_mgi_rubro:'hoteleria', _nueva:true});
      creados++;
    }
    PLAN_EDIT[pid]=PLAN_EDIT[pid]||{};
    const poner=(k,v)=>{ if(v!==''&&v!==null&&v!==undefined) PLAN_EDIT[pid][k]=v; };
    if(!f.match){ poner('nombre',f.nombre); poner('direccion',f.direccion); poner('rut',f.rut); }
    else { poner('direccion',f.direccion); poner('rut',f.rut); }
    ['enc_nombre','enc_correo','enc_fono','due_nombre','due_correo','due_fono','simples_priv',
     'simples_comp','dobles_priv','dobles_comp','camas_instaladas','eecc_hospeda','es_eecc_mcen',
     'contrato_inicio','contrato_fin','hab_disponibles','al_dia_pagos','n_hospedados',
     'camas_disponibles','notas'].forEach(k=>poner(k,f[k]));
    if(f.cod) poner('codigo_mgi',f.cod);
    if(f.participa) poner('participa',f.participa.toUpperCase()==='SI'?'SI':f.participa);
    if(f.arrendado_completo===true) PLAN_EDIT[pid]['arrendado_completo']=true;
  });
  impCerrar();
  planRender();
  alert('Cargado en la planilla: '+creados+' nuevo(s) y '+editados+' con cambios.\n\n'+
        'Revisa lo marcado en amarillo y aprieta Guardar cuando esté correcto.');
}
