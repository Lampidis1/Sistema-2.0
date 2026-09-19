// ═══════════════════════════════════════════════════════════════════════════
// rca.js — Módulo RCA · Cumplimiento de compromisos ambientales
// Sistema AM · Antofagasta Minerals
//
// QUÉ RESUELVE
// Una RCA (Resolución de Calificación Ambiental) compromete que un % del gasto
// de cada empresa colaboradora (EECC) sea con proveedores LOCALES/REGIONALES.
// El seguimiento funciona así:
//   1. Se carga una RCA por CÓDIGO (cada una con su % de meta, 10% por defecto).
//   2. Cada EECC declara por CARTA FORMAL un monto total a gastar. La meta es el
//      pct_meta% de ese monto declarado.
//   3. Las EECC envían mes a mes un Excel con sus facturas de compra. El sistema
//      cruza el RUT de cada factura contra el registro de proveedores regionales
//      validados (rca_proveedores_validados, sembrado del Excel oficial).
//   4. Solo las facturas de proveedores REGIONALES validados suman al avance del
//      10%. Un RUT desconocido dispara una ALERTA de revisión manual.
//
// La seguridad real está en la base (RLS con tiene_acceso('rca') o es_principal),
// no acá. Este archivo solo pinta y calcula. Ver CLAUDE.md Reglas 2, 3.
//
// Cada RCA tiene DOS pestañas: Proveedores (operativa) y Mano de Obra Local
// (pendiente de desarrollo). El foco de esta entrega es Proveedores.
//
// auth-guard.js declara SB / USER / ES_ADMIN como globales: NO se re-declaran.
// <script src> clásico, nunca type="module" (CLAUDE.md §6).
// ═══════════════════════════════════════════════════════════════════════════

// ── estado ──────────────────────────────────────────────────────────────────
let RCA_LISTA = [];      // rca_normativas
let RCA_ACTUAL = null;   // objeto rca abierto
let RCA_EECC = [];       // eecc del rca abierto
let RCA_FACT = [];       // facturas del rca abierto
let RCA_VALID = [];      // registro de validados (se carga una vez)
let RCA_VMAP = {};       // rut canónico → registro validado
let RCA_TAB = 'prov';    // prov | mol
let _rcaFileCb = null;   // callback pendiente del <input file>
let _facturasAbiertas = null;  // eecc_id con la ventana Facturas abierta (para refrescar tras importar)

// Comunas de la Región de Antofagasta (para pistas de validación regional).
const RCA_COMUNAS_REGION = ['ANTOFAGASTA','MEJILLONES','SIERRA GORDA','TALTAL',
  'CALAMA','OLLAGUE','OLLAGÜE','SAN PEDRO DE ATACAMA','TOCOPILLA','MARIA ELENA','MARÍA ELENA'];

// ── helpers ─────────────────────────────────────────────────────────────────
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function toast(msg, tipo){
  const t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.className='toast show'+(tipo==='err'?' err':tipo==='ok'?' ok':'');
  clearTimeout(t._to); t._to=setTimeout(()=>t.className='toast',3200);
}
const _clp = n => '$' + Math.round(+n||0).toLocaleString('es-CL');
function _fecha(f){ return f ? String(f).slice(0,10).split('-').reverse().join('-') : '—'; }
function uid(p){ return (p||'id')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6); }
function quien(){ try{ const u=USER; return (u&&u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||(u&&u.email||'').split('@')[0]||''; }catch(e){ return ''; } }
function nowISO(){ return new Date().toISOString(); }

// RUT canónico: sin puntos, sin guión, sin espacios, en mayúscula. Sirve para
// comparar "76.604.002-0", "76604002-0" y "766040020" como el mismo RUT.
function rutCanon(r){ return String(r==null?'':r).toUpperCase().replace(/[^0-9K]/g,''); }
// Formato de presentación con guión: 76604002-0
function rutFmt(r){ const c=rutCanon(r); if(c.length<2) return c; return c.slice(0,-1)+'-'+c.slice(-1); }
// Monto desde una celda de Excel (número o texto con separadores).
function parseMonto(v){
  if(typeof v==='number') return Math.round(v);
  const s=String(v==null?'':v).replace(/[^0-9,.-]/g,'');
  // CLP no usa decimales; se quitan separadores de miles y cualquier decimal.
  const n=parseInt(s.replace(/[.,]/g,''),10);
  return isNaN(n)?0:n;
}

// ── arranque ────────────────────────────────────────────────────────────────
async function rcaOnAcceso(user){
  document.getElementById('gate').style.display='none';
  document.getElementById('app').classList.remove('hidden');
  const hu=document.getElementById('hUser');
  if(hu) hu.textContent=(user&&user.email)||'';
  await cargarValidados();
  await cargarNormativas();
  verLista();
}

async function cargarValidados(){
  try{
    const {data,error}=await SB.from('rca_proveedores_validados').select('*').neq('estado_registro','Eliminado');
    if(error) throw error;
    RCA_VALID=data||[];
    RCA_VMAP={};
    RCA_VALID.forEach(v=>{ RCA_VMAP[rutCanon(v.rut)]=v; });
  }catch(e){ RCA_VALID=[]; RCA_VMAP={}; toast('No se pudo cargar el registro de validados: '+e.message,'err'); }
}

async function cargarNormativas(){
  try{
    const {data,error}=await SB.from('rca_normativas').select('*').neq('estado_registro','Eliminado').order('codigo');
    if(error) throw error;
    RCA_LISTA=data||[];
  }catch(e){ RCA_LISTA=[]; toast('Error al cargar RCA: '+e.message,'err'); }
}

// ══ VISTA: LISTA DE RCA ══════════════════════════════════════════════════════
function verLista(){
  RCA_ACTUAL=null;
  document.getElementById('vistaDetalle').classList.add('hidden');
  const cont=document.getElementById('vistaLista');
  cont.classList.remove('hidden');
  cont.innerHTML=`
    <div class="lista-head">
      <div>
        <div class="lista-t">Resoluciones de Calificación Ambiental</div>
        <div class="lista-s">Cada RCA agrupa a sus empresas colaboradoras y el avance del compromiso de proveedores locales.</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn ghost" onclick="verBaseProveedores()">⚙ Base de proveedores</button>
        <button class="btn primary" onclick="rcaModal()">➕ Nueva RCA</button>
      </div>
    </div>
    ${!RCA_LISTA.length
      ? `<div class="vacio">Todavía no hay ninguna RCA cargada.<br><span>Crea la primera con «Nueva RCA»: código, faena y el % de compromiso (10% por defecto).</span></div>`
      : `<div class="rca-grid">${RCA_LISTA.map(tarjetaRCA).join('')}</div>`}`;
}

function tarjetaRCA(r){
  return `<div class="rca-card" onclick="abrirRCA('${r.rca_id}')">
    <div class="rca-card-cod">RCA ${esc(r.codigo)}</div>
    <div class="rca-card-nom">${esc(r.nombre||'Sin nombre')}</div>
    <div class="rca-card-meta">
      ${r.faena?`<span class="chip">🏭 ${esc(r.faena)}</span>`:''}
      <span class="chip">🎯 meta ${(+r.pct_meta||10)}%</span>
    </div>
    ${r.descripcion?`<div class="rca-card-desc">${esc(r.descripcion)}</div>`:''}
    <div class="rca-card-go">Abrir seguimiento →</div>
  </div>`;
}

// ══ VISTA: DETALLE DE UNA RCA ════════════════════════════════════════════════
async function abrirRCA(id){
  const r=RCA_LISTA.find(x=>x.rca_id===id); if(!r) return;
  RCA_ACTUAL=r; RCA_TAB='prov';
  document.getElementById('vistaLista').classList.add('hidden');
  const det=document.getElementById('vistaDetalle');
  det.classList.remove('hidden');
  det.innerHTML='<div class="vacio">Cargando…</div>';
  await cargarEECC(id);
  await cargarFacturas(id);
  renderDetalle();
}

async function cargarEECC(rcaId){
  try{
    const {data,error}=await SB.from('rca_eecc').select('*').eq('rca_id',rcaId).neq('estado_registro','Eliminado').order('nombre');
    if(error) throw error;
    RCA_EECC=data||[];
  }catch(e){ RCA_EECC=[]; toast('Error al cargar EECC: '+e.message,'err'); }
}
async function cargarFacturas(rcaId){
  try{
    const {data,error}=await SB.from('rca_facturas').select('*').eq('rca_id',rcaId).neq('estado_registro','Eliminado');
    if(error) throw error;
    RCA_FACT=data||[];
  }catch(e){ RCA_FACT=[]; toast('Error al cargar facturas: '+e.message,'err'); }
}

// Avance de una EECC: reportado = suma de facturas OK (regional validado).
// Fecha de hoy en ISO (a medianoche, sin hora) para contar días de contrato.
function rcaHoyISO(){ const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
// Días que faltan hasta una fecha (negativo = ya vencida, null = sin fecha).
function diasRestantes(fecha){
  if(!fecha) return null;
  const a=new Date(rcaHoyISO()+'T00:00:00'), b=new Date(String(fecha).slice(0,10)+'T00:00:00');
  if(isNaN(b)) return null;
  return Math.round((b-a)/86400000);
}
function calcEECC(e){
  const pct=+RCA_ACTUAL.pct_meta||10;
  const decl=+e.monto_declarado||0;
  const meta=decl*pct/100;
  const facts=RCA_FACT.filter(f=>f.eecc_id===e.eecc_id);
  const suma=arr=>arr.reduce((a,f)=>a+(+f.monto_clp||0),0);
  const fOk    =facts.filter(f=>f.estado_revision==='ok');
  const fPend  =facts.filter(f=>f.estado_revision==='pendiente');
  const fNoReg =facts.filter(f=>f.estado_revision==='no_regional');
  const fIncomp=facts.filter(f=>f.estado_revision==='incompleta');
  const rep=suma(fOk);
  const avance=meta>0?Math.min(100,Math.round(rep/meta*100)):0;
  const faltaPct=Math.max(0,100-avance);          // cuánto falta para cumplir la meta
  const faltaClp=Math.max(0,meta-rep);            // lo mismo en pesos regionales
  const dias=diasRestantes(e.fecha_hasta);        // días de contrato restantes
  // Reportado = todo lo que llegó en el Excel; contado = solo lo que suma (ok).
  const montoReportado=suma(facts);
  return {decl,meta,rep,pend:fPend.length,avance,faltaPct,faltaClp,dias,
    nfact:facts.length, nContadas:fOk.length, nTotal:facts.length,
    nPend:fPend.length, nNoReg:fNoReg.length, nIncomp:fIncomp.length,
    montoReportado, montoContado:rep, montoPend:suma(fPend), montoNoReg:suma(fNoReg), montoIncomp:suma(fIncomp),
    fOk, fPend, fNoReg, fIncomp};
}
// Etiqueta de días de contrato, con color según urgencia.
function chipDias(dias){
  if(dias===null) return '<span class="chip dias sinf">📅 sin fecha de término</span>';
  if(dias>0)   return `<span class="chip dias ${dias<=30?'gold':'ok'}">⏳ ${dias} día${dias===1?'':'s'} de contrato</span>`;
  if(dias===0) return '<span class="chip dias hoy">⏳ contrato vence hoy</span>';
  return `<span class="chip dias vencido">⚠ contrato vencido hace ${-dias} día${dias===-1?'':'s'}</span>`;
}

function renderDetalle(){
  const r=RCA_ACTUAL;
  const tot=RCA_EECC.reduce((a,e)=>{ const c=calcEECC(e); a.decl+=c.decl; a.meta+=c.meta; a.rep+=c.rep; return a; },{decl:0,meta:0,rep:0});
  const avanceG=tot.meta>0?Math.min(100,Math.round(tot.rep/tot.meta*100)):0;
  const pendTot=RCA_FACT.filter(f=>f.estado_revision==='pendiente').length;

  const det=document.getElementById('vistaDetalle');
  det.innerHTML=`
    <div class="det-top">
      <button class="btn ghost" onclick="verLista()">← Todas las RCA</button>
      <div class="det-acc">
        <button class="btn ghost" onclick="rcaModal('${r.rca_id}')">✏ Editar RCA</button>
        <button class="btn ghost" onclick="exportarInforme()">⬇ Informe Excel</button>
        <button class="btn primary" onclick="rcaAbrirReporteGerencia()" title="Link constante + descarga">📄 Reporte gerencia</button>
      </div>
    </div>
    <div class="det-titulo">
      <div class="det-cod">RCA ${esc(r.codigo)}</div>
      <div class="det-nom">${esc(r.nombre||'')}</div>
      ${r.texto_compromiso?`<div class="det-cita">“${esc(r.texto_compromiso)}”</div>`:''}
    </div>

    <div class="tabs2">
      <button class="tab2 ${RCA_TAB==='prov'?'active':''}" onclick="setTab('prov')">🏪 Proveedores</button>
      <button class="tab2 ${RCA_TAB==='mol'?'active':''}" onclick="setTab('mol')">👷 Mano de Obra Local</button>
    </div>

    <div id="tabBody">${RCA_TAB==='prov'?bodyProveedores(tot,avanceG,pendTot):bodyMOL()}</div>`;
}

function setTab(t){ RCA_TAB=t; renderDetalle(); }

function bodyProveedores(tot,avanceG,pendTot){
  const col=avanceG>=80?'#1e7e34':avanceG>=40?'#b8860b':'#c0311b';
  return `
    <div class="kpis">
      <div class="kpi"><div class="kpi-n">${RCA_EECC.length}</div><div class="kpi-l">Empresas colaboradoras</div></div>
      <div class="kpi"><div class="kpi-n sm">${_clp(tot.meta)}</div><div class="kpi-l">Meta ${(+RCA_ACTUAL.pct_meta||10)}% comprometida</div></div>
      <div class="kpi"><div class="kpi-n sm" style="color:#1e7e34">${_clp(tot.rep)}</div><div class="kpi-l">Reportado regional</div></div>
      <div class="kpi"><div class="kpi-n" style="color:${col}">${avanceG}%</div><div class="kpi-l">Avance global RCA</div></div>
    </div>

    ${pendTot?`<div class="alerta-barra" onclick="verAlertas()">
      ⚠ Hay <b>${pendTot}</b> factura(s) de proveedores no reconocidos esperando tu revisión. <span>Revisar →</span>
    </div>`:''}

    <div class="sub-head">
      <div class="sub-t">Empresas colaboradoras</div>
      <button class="btn primary" onclick="eeccModal()">➕ Agregar EECC</button>
    </div>

    ${!RCA_EECC.length
      ? `<div class="vacio">Sin empresas colaboradoras.<br><span>Agrega una EECC con el monto que declaró por carta formal; sobre ese monto se calcula el 10%.</span></div>`
      : `<div class="eecc-lista">${RCA_EECC.map(tarjetaEECC).join('')}</div>`}`;
}

function tarjetaEECC(e){
  const c=calcEECC(e);
  const col=c.avance>=80?'#1e7e34':c.avance>=40?'#b8860b':'#c0311b';
  const cumplida=c.avance>=100;
  const periodo=(e.fecha_desde||e.fecha_hasta)
    ? `${e.fecha_desde?String(e.fecha_desde).slice(0,10):'—'} → ${e.fecha_hasta?String(e.fecha_hasta).slice(0,10):'—'}` : '';
  return `<div class="eecc-card">
    <div class="eecc-h">
      <div class="eecc-nom">${esc(e.nombre)}${e.rut?` <span class="eecc-rut">${esc(rutFmt(e.rut))}</span>`:''}</div>
      <div class="eecc-chips">
        ${chipDias(c.dias)}
        ${e.numero_contrato?`<span class="chip">Contrato ${esc(e.numero_contrato)}</span>`:''}
      </div>
    </div>
    <div class="eecc-barra"><div class="eecc-barra-in" style="width:${c.avance}%;background:${col}"></div></div>
    <div class="eecc-montos">
      <div><span>Meta ${(+RCA_ACTUAL.pct_meta||10)}%</span><b>${_clp(c.meta)}</b></div>
      <div><span>Reportado</span><b style="color:#1e7e34">${_clp(c.rep)}</b></div>
      <div><span>Avance</span><b style="color:${col}">${c.avance}%</b></div>
      <div><span>Falta meta</span><b style="color:${cumplida?'#1e7e34':col}" title="${cumplida?'Meta cumplida':'Faltan '+_clp(c.faltaClp)+' regionales'}">${cumplida?'✓ cumplida':c.faltaPct+'%'}</b></div>
    </div>
    ${periodo?`<div class="eecc-plazo">📅 Contrato: <b>${esc(periodo)}</b></div>`:''}
    <div class="eecc-info">
      🧾 ${c.nfact} factura(s)${c.pend?` · <b style="color:#c0311b">${c.pend} por revisar</b>`:''}
      ${e.carta_path?` · 📄 carta cargada`:` · <span style="color:#c0311b">sin carta</span>`}
      ${e.contacto_nombre?`<br>👤 ${esc(e.contacto_nombre)}`:''}${e.contacto_fono?` · 📞 ${esc(e.contacto_fono)}`:''}
    </div>
    <div class="eecc-acc">
      <button class="mini" onclick="importarExcel('${e.eecc_id}')">📥 Cargar Excel</button>
      <button class="mini" onclick="verFacturas('${e.eecc_id}')">🧾 Facturas</button>
      <button class="mini" onclick="rcaAbrirReporteEECC('${e.eecc_id}')" title="Link + descarga de esta EECC">📄 Reporte</button>
      <button class="mini" onclick="eeccModal('${e.eecc_id}')">✏ Editar</button>
      ${e.carta_path?`<button class="mini" onclick="verCarta('${esc(e.carta_path)}')">👁 Ver carta</button>`:''}
      <button class="mini" onclick="subirCarta('${e.eecc_id}')">📄 ${e.carta_path?'Reemplazar carta':'Subir carta'}</button>
    </div>
  </div>`;
}

function bodyMOL(){
  return `<div class="vacio mol">
    <div style="font-size:2.2rem">👷</div>
    <div style="font-weight:700;margin:6px 0">Mano de Obra Local</div>
    <div><span>Esta pestaña queda reservada para el seguimiento de contratación de mano de obra local.
    Se desarrollará en una etapa posterior, con sus propios criterios.</span></div>
  </div>`;
}

// ══ CRUD RCA (normativa) ═════════════════════════════════════════════════════
function rcaModal(id){
  const r=id?RCA_LISTA.find(x=>x.rca_id===id):{};
  abrirModal(`
    <h3>${id?'Editar RCA':'Nueva RCA'}</h3>
    <div class="g2">
      <div><label>Código *</label><input id="mCod" value="${esc(r.codigo||'')}" placeholder="20250200199"></div>
      <div><label>% de meta</label><input id="mPct" type="number" min="0" max="100" value="${r.pct_meta!=null?r.pct_meta:10}"></div>
    </div>
    <label>Nombre / proyecto</label><input id="mNom" value="${esc(r.nombre||'')}" placeholder="EIA Zaldívar…">
    <label>Faena</label><input id="mFaena" value="${esc(r.faena||'')}" placeholder="Zaldívar / Centinela / Antucoya…">
    <label>Descripción</label><textarea id="mDesc" rows="2">${esc(r.descripcion||'')}</textarea>
    <label>Texto del compromiso (cita del RCA)</label><textarea id="mTexto" rows="3">${esc(r.texto_compromiso||'')}</textarea>
    <div class="modal-acc">
      ${id?`<button class="btn danger ghost" onclick="borrarRCA('${id}')">🗑 Eliminar</button>`:'<span></span>'}
      <div><button class="btn ghost" onclick="cerrarModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarRCA('${id||''}')">Guardar</button></div>
    </div>`);
}

async function guardarRCA(id){
  const cod=val('mCod').trim();
  if(!cod){ toast('El código es obligatorio','err'); return; }
  const fila={
    codigo:cod, nombre:val('mNom').trim()||null, faena:val('mFaena').trim()||null,
    descripcion:val('mDesc').trim()||null, texto_compromiso:val('mTexto').trim()||null,
    pct_meta:+val('mPct')||10, updated_at:nowISO(), updated_by:quien()
  };
  try{
    if(id){ const {error}=await SB.from('rca_normativas').update(fila).eq('rca_id',id); if(error) throw error; }
    else{ fila.rca_id=uid('rca'); fila.created_by=quien(); const {error}=await SB.from('rca_normativas').insert(fila); if(error) throw error; }
    cerrarModal(); await cargarNormativas();
    if(id&&RCA_ACTUAL&&RCA_ACTUAL.rca_id===id){ RCA_ACTUAL=RCA_LISTA.find(x=>x.rca_id===id); renderDetalle(); }
    else verLista();
    toast('✅ RCA guardada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

async function borrarRCA(id){
  const r=RCA_LISTA.find(x=>x.rca_id===id);
  if(!confirm(`¿Eliminar la RCA ${r?r.codigo:''} y su seguimiento?`)) return;
  try{
    const {error}=await SB.from('rca_normativas').update({estado_registro:'Eliminado',updated_at:nowISO()}).eq('rca_id',id);
    if(error) throw error;
    cerrarModal(); await cargarNormativas(); verLista(); toast('🗑 Eliminada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ══ CRUD EECC ════════════════════════════════════════════════════════════════
function eeccModal(id){
  const e=id?RCA_EECC.find(x=>x.eecc_id===id):{};
  abrirModal(`
    <h3>${id?'Editar empresa colaboradora':'Nueva empresa colaboradora'}</h3>
    <div class="g2">
      <div><label>Nombre *</label><input id="eNom" value="${esc(e.nombre||'')}"></div>
      <div><label>RUT</label><input id="eRut" value="${esc(e.rut||'')}" placeholder="76xxxxxxx-x"></div>
    </div>
    <div class="g2">
      <div><label>Monto declarado (carta formal, CLP)</label><input id="eMonto" type="number" value="${e.monto_declarado||''}" oninput="previewMeta()"></div>
      <div><label>N° de contrato</label><input id="eContrato" value="${esc(e.numero_contrato||'')}"></div>
    </div>
    <div id="mMetaPrev" class="meta-prev"></div>
    <div class="g3">
      <div><label>Contacto</label><input id="eCNom" value="${esc(e.contacto_nombre||'')}"></div>
      <div><label>Teléfono</label><input id="eCFono" value="${esc(e.contacto_fono||'')}"></div>
      <div><label>Correo</label><input id="eCMail" value="${esc(e.contacto_correo||'')}"></div>
    </div>
    <div class="g2">
      <div><label>Inicio de contrato</label><input id="eDesde" type="date" value="${(e.fecha_desde||'').slice(0,10)}"></div>
      <div><label>Término de contrato</label><input id="eHasta" type="date" value="${(e.fecha_hasta||'').slice(0,10)}"></div>
    </div>
    <div class="g2">
      <div><label>Administrador (ADC)</label><input id="eAdc" value="${esc(e.administrador||'')}"></div>
      <div><label>Fecha carta</label><input id="eCarta" type="date" value="${(e.carta_fecha||'').slice(0,10)}"></div>
    </div>
    <label>Notas</label><textarea id="eNotas" rows="2">${esc(e.notas||'')}</textarea>
    <div class="modal-acc">
      ${id?`<button class="btn danger ghost" onclick="borrarEECC('${id}')">🗑 Eliminar</button>`:'<span></span>'}
      <div><button class="btn ghost" onclick="cerrarModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarEECC('${id||''}')">Guardar</button></div>
    </div>`);
  previewMeta();
}
function previewMeta(){
  const m=+val('eMonto')||0; const pct=+RCA_ACTUAL.pct_meta||10;
  const el=document.getElementById('mMetaPrev'); if(!el) return;
  el.innerHTML=m?`Meta ${pct}% → <b>${_clp(m*pct/100)}</b> en proveedores regionales`:'Escribe el monto declarado para ver la meta.';
}
async function guardarEECC(id){
  const nom=val('eNom').trim();
  if(!nom){ toast('El nombre es obligatorio','err'); return; }
  const fila={
    rca_id:RCA_ACTUAL.rca_id, nombre:nom, rut:val('eRut').trim()||null,
    monto_declarado:+val('eMonto')||0, numero_contrato:val('eContrato').trim()||null,
    contacto_nombre:val('eCNom').trim()||null, contacto_fono:val('eCFono').trim()||null,
    contacto_correo:val('eCMail').trim()||null, administrador:val('eAdc').trim()||null,
    fecha_desde:val('eDesde')||null, fecha_hasta:val('eHasta')||null,
    carta_fecha:val('eCarta')||null, notas:val('eNotas').trim()||null,
    updated_at:nowISO(), updated_by:quien()
  };
  try{
    if(id){ const {error}=await SB.from('rca_eecc').update(fila).eq('eecc_id',id); if(error) throw error; }
    else{ fila.eecc_id=uid('eecc'); fila.created_by=quien(); const {error}=await SB.from('rca_eecc').insert(fila); if(error) throw error; }
    cerrarModal(); await cargarEECC(RCA_ACTUAL.rca_id); renderDetalle(); toast('✅ Guardada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function borrarEECC(id){
  const e=RCA_EECC.find(x=>x.eecc_id===id);
  if(!confirm(`¿Eliminar «${e?e.nombre:''}» y sus facturas?`)) return;
  try{
    const {error}=await SB.from('rca_eecc').update({estado_registro:'Eliminado',updated_at:nowISO()}).eq('eecc_id',id);
    if(error) throw error;
    cerrarModal(); await cargarEECC(RCA_ACTUAL.rca_id); await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle(); toast('🗑 Eliminada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ══ CARTA FORMAL (documento) ═════════════════════════════════════════════════
function subirCarta(id){
  _rcaFileCb=(file)=>guardarCarta(id,file);
  const inp=document.getElementById('rcaFile');
  inp.accept='.pdf,.jpg,.jpeg,.png';
  inp.click();
}
async function guardarCarta(id,file){
  if(file.size>15*1024*1024){ toast('El archivo supera los 15 MB','err'); return; }
  try{
    toast('Subiendo carta…');
    const ext=(file.name.split('.').pop()||'bin').toLowerCase();
    const path=`rca/cartas/${id}/${Date.now()}_${Math.random().toString(36).slice(2,7)}.${ext}`;
    const {error:up}=await SB.storage.from('documentos').upload(path,file,{upsert:false});
    if(up) throw up;
    const {error}=await SB.from('rca_eecc').update({carta_path:path,carta_nombre:file.name,updated_at:nowISO(),updated_by:quien()}).eq('eecc_id',id);
    if(error) throw error;
    await cargarEECC(RCA_ACTUAL.rca_id); renderDetalle(); toast('✅ Carta cargada','ok');
  }catch(e){ toast('Error al subir: '+e.message,'err'); }
}
// Abre la carta formal con una URL firmada de duración corta (bucket privado).
async function verCarta(path){
  try{
    const {data,error}=await SB.storage.from('documentos').createSignedUrl(path,300);
    if(error) throw error;
    window.open(data.signedUrl,'_blank','noopener');
  }catch(e){ toast('No se pudo abrir la carta: '+e.message,'err'); }
}

// ══ IMPORTAR EXCEL DE FACTURAS + CRUCE POR RUT ═══════════════════════════════
function importarExcel(eeccId){
  _rcaFileCb=(file)=>procesarExcel(eeccId,file);
  const inp=document.getElementById('rcaFile');
  inp.accept='.xlsx,.xls,.csv';
  inp.click();
}
function rcaFileElegido(input){
  const file=input.files&&input.files[0];
  input.value='';
  if(file&&typeof _rcaFileCb==='function'){ const cb=_rcaFileCb; _rcaFileCb=null; cb(file); }
}

// Encuentra el valor de una columna por NOMBRE de encabezado (tolerante a
// tildes, mayúsculas y variantes). Así sirve el Excel de MGI y el de la EECC.
function normHdr(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,''); }
function pickCol(rowObj, alternativas){
  for(const k of Object.keys(rowObj)){
    const nk=normHdr(k);
    if(alternativas.some(a=>nk.includes(a))) return rowObj[k];
  }
  return '';
}
// La plantilla EECC trae 3 filas de rótulos antes del encabezado real. Se busca
// la fila que tenga "RUT" y "Monto" para saber desde dónde leer.
function localizarHeader(matriz){
  for(let i=0;i<Math.min(matriz.length,12);i++){
    const fila=matriz[i].map(normHdr);
    if(fila.includes('rut') && fila.some(c=>c.includes('monto')||c.includes('clp'))) return i;
  }
  return 0;
}

async function procesarExcel(eeccId,file){
  const e=RCA_EECC.find(x=>x.eecc_id===eeccId); if(!e){ toast('EECC no encontrada','err'); return; }
  try{
    toast('Leyendo Excel…');
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    // hoja de datos de la EECC (o la primera)
    let hoja=wb.SheetNames.find(n=>/ee\.?cc|datos|factura/i.test(n))||wb.SheetNames[0];
    const ws=wb.Sheets[hoja];
    const matriz=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
    if(!matriz.length){ toast('La hoja está vacía','err'); return; }
    const h=localizarHeader(matriz);
    const headers=matriz[h].map(x=>String(x||''));
    const filas=[];
    for(let i=h+1;i<matriz.length;i++){
      const obj={}; headers.forEach((k,j)=>{ if(k) obj[k]=matriz[i][j]; });
      filas.push(obj);
    }
    // REEMPLAZO TOTAL: el Excel auditado es la fuente de verdad. Al cargarlo se
    // reemplazan TODAS las facturas ya cargadas de esta EECC por las del archivo
    // (así se reflejan correcciones, eliminaciones y agregados). La identidad
    // dentro del archivo es EECC + N° de factura, para descartar repetidos.
    const claveFactura=(num)=>eeccId+'|'+String(num||'').trim().toUpperCase().replace(/\s+/g,'');

    // Se recorre el Excel a un mapa por clave: si el mismo N° de factura viene
    // dos veces en el archivo, queda una sola (gana la última fila).
    const porClave={}, vistoArchivo={}, dupArchivo=[], incompletasArr=[]; let incompletas=0;
    for(const r of filas){
      const rut=pickCol(r,['rut']);
      const canon=rutCanon(rut);
      const monto=parseMonto(pickCol(r,['clpmonto','montoclp','clp','montodelacontratacion','monto','montoneto']));
      const numFact=String(pickCol(r,['ndefactura','nfactura','numfactura','factura','folio'])||'').trim();
      const anioR=String(pickCol(r,['ano','anio','year'])||'').trim();
      const mesR =String(pickCol(r,['mes','month'])||'').trim();
      const razonR=String(pickCol(r,['razonsocial','razon','nombre','fantasia'])||'').trim();
      const comunaR=String(pickCol(r,['comunacasamatriz','comuna'])||'').trim();
      const algo = canon || monto || numFact || razonR;
      if(!algo) continue;                       // fila totalmente vacía: se ignora
      // FILA INCOMPLETA: sin N° de factura, sin fecha, sin RUT o sin monto. Ya no
      // se descarta en silencio: se guarda con el motivo para verla en el reporte.
      const faltas=[];
      if(!numFact)          faltas.push('N° de factura');
      if(!anioR && !mesR)   faltas.push('fecha');
      if(!canon)            faltas.push('RUT');
      if(monto<=0)          faltas.push('monto');
      if(faltas.length){
        incompletas++;
        incompletasArr.push({
          rca_id:RCA_ACTUAL.rca_id, eecc_id:eeccId, anio:anioR, mes:mesR,
          num_factura:numFact||null, eecc_nombre:e.nombre, rut_proveedor:rut?rutFmt(rut):null,
          razon_social:razonR||null, comuna:comunaR||null, monto_clp:monto||0,
          estado_revision:'incompleta', motivo_descarte:'Falta: '+faltas.join(', '),
          origen:'excel', es_regional:false, updated_by:quien(), updated_at:nowISO()
        });
        continue;
      }
      const reg=RCA_VMAP[canon];
      let estado='pendiente', esReg=false, rvpId=null;
      let razon=String(pickCol(r,['razonsocial','razon','nombre','fantasia'])||'').trim();
      let comuna=String(pickCol(r,['comunacasamatriz','comuna'])||'').trim();
      if(reg){
        rvpId=reg.rvp_id;
        if(reg.es_regional){ estado='ok'; esReg=true; } else { estado='no_regional'; }
        if(!razon) razon=reg.razon_social||'';
        if(!comuna) comuna=reg.comuna||'';
      }
      const _clv=claveFactura(numFact);
      // Mismo N° de factura repetido DENTRO del archivo con distinto monto o RUT.
      const prev=vistoArchivo[_clv];
      if(prev && (Number(prev.monto)!==monto || rutCanon(prev.rut)!==canon)){
        dupArchivo.push({num:numFact,rut:rutFmt(rut),antes:prev.monto,despues:monto,rutAntes:prev.rut});
      }
      vistoArchivo[_clv]={monto,rut:rutFmt(rut)};
      porClave[_clv]={
        rca_id:RCA_ACTUAL.rca_id, eecc_id:eeccId,
        anio:String(pickCol(r,['ano','anio','year'])||'').trim(),
        mes:String(pickCol(r,['mes','month'])||'').trim(),
        num_factura:numFact, eecc_nombre:String(pickCol(r,['eecc','empresacolaboradora'])||e.nombre).trim()||e.nombre,
        rut_proveedor:rutFmt(rut), razon_social:razon, comuna:comuna,
        bien_servicio:String(pickCol(r,['bienoservicio','bienservicio','servicio','bien'])||'').trim(),
        clasificacion:String(pickCol(r,['clasificacion','clasif'])||'').trim(),
        monto_clp:monto, monto_usd:parseMonto(pickCol(r,['usd','dolar'])),
        rvp_id:rvpId, es_regional:esReg, estado_revision:estado, origen:'excel', updated_by:quien(), updated_at:nowISO()
      };
    }
    const claves=Object.keys(porClave);
    // SALVAGUARDA: si el archivo no trae ninguna factura válida, NO se borra nada.
    if(!claves.length){
      toast(incompletas?`No se cargó nada: ${incompletas} fila(s) sin N° de factura, RUT o monto. No se tocó lo ya cargado.`:'No se encontraron facturas en el Excel. No se tocó lo ya cargado.','err');
      return;
    }
    // Confirmar el reemplazo cuando ya hay facturas cargadas para esta EECC.
    const previas=RCA_FACT.filter(f=>f.eecc_id===eeccId).length;
    if(previas && !confirm(`Este Excel REEMPLAZARÁ las ${previas} factura(s) ya cargadas de «${e.nombre}» por las ${claves.length} del archivo.\n\nEs lo correcto si subes el Excel auditado completo. ¿Continuar?`)){
      toast('Carga cancelada','err'); return;
    }
    // Clasificar y preparar las filas nuevas (todas con id nuevo).
    const filasNuevas=[]; let okC=0, pendC=0, noReg=0;
    claves.forEach(k=>{
      const fac=porClave[k];
      fac.factura_id=uid('fac'); fac.created_by=quien();
      if(fac.estado_revision==='ok') okC++; else if(fac.estado_revision==='pendiente') pendC++; else noReg++;
      filasNuevas.push(fac);
    });
    // Las incompletas también se guardan (con su motivo), para verlas en el reporte.
    incompletasArr.forEach(fac=>{ fac.factura_id=uid('fac'); fac.created_by=quien(); filasNuevas.push(fac); });
    // 1) Borrado lógico de lo previo de esta EECC. 2) Insertar lo del archivo.
    if(previas){
      const {error:delErr}=await SB.from('rca_facturas')
        .update({estado_registro:'Eliminado',updated_at:nowISO(),updated_by:quien()})
        .eq('eecc_id',eeccId).neq('estado_registro','Eliminado');
      if(delErr) throw delErr;
    }
    const {error}=await SB.from('rca_facturas').insert(filasNuevas);
    if(error) throw error;
    await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle();
    toast(`✅ ${filasNuevas.length} factura(s) cargadas${previas?` (reemplazaron a ${previas})`:''}${incompletas?` · ${incompletas} incompleta(s) marcada(s)`:''} — ${okC} regionales · ${pendC} por revisar · ${noReg} fuera de región`,'ok');
    if(dupArchivo.length) alertaMontos(dupArchivo,[]);
    else if(pendC) verAlertas();
    else if(_facturasAbiertas===eeccId) verFacturas(eeccId);   // refrescar la ventana abierta
  }catch(err){ toast('Error al procesar: '+err.message,'err'); }
}

// ══ ALERTA: mismo N° de factura con distinto monto ═══════════════════════════
// Se dispara al cargar un Excel donde una factura ya cargada (o repetida dentro
// del archivo) trae un monto distinto. Los montos ya se actualizaron (para
// permitir correcciones de auditoría), pero se avisa para que se revise que no
// sea una carga duplicada por error.
function alertaMontos(dupArchivo,cambios){
  const fila=x=>{
    const rutCambio = x.rutAntes && rutCanon(x.rutAntes)!==rutCanon(x.rut);
    const montoCambio = Number(x.antes)!==Number(x.despues);
    return `<div class="alert-row"><div class="alert-info">
      <div class="alert-rut">Factura ${esc(x.num||'—')} · ${esc(rutFmt(x.rut)||'')}</div>
      <div class="alert-sub">
        ${montoCambio?`Monto <b>${_clp(x.antes)}</b> → <b>${_clp(x.despues)}</b>`:''}
        ${rutCambio?`${montoCambio?' · ':''}RUT <b>${esc(rutFmt(x.rutAntes))}</b> → <b>${esc(rutFmt(x.rut))}</b>`:''}
      </div>
    </div></div>`;
  };
  abrirModal(`
    <h3>⚠ Revisar montos de facturas</h3>
    <p class="modal-nota">Se cargaron facturas con el <b>mismo N° pero distinto monto</b>. El sistema tomó el
    monto nuevo (útil si corregiste algo en la auditoría), pero revisa que no sea una carga duplicada por error.</p>
    ${dupArchivo.length?`<div class="sub-t" style="font-size:1rem;margin:8px 0 6px">Repetidas dentro del mismo Excel (${dupArchivo.length})</div>
      <div class="alert-lista">${dupArchivo.map(fila).join('')}</div>`:''}
    ${cambios.length?`<div class="sub-t" style="font-size:1rem;margin:12px 0 6px">Cambiaron respecto a lo ya cargado (${cambios.length})</div>
      <div class="alert-lista">${cambios.map(fila).join('')}</div>`:''}
    <div class="modal-acc"><span></span><button class="btn ghost" onclick="cerrarModal()">Entendido</button></div>`);
}

// ══ ALERTAS: proveedores no reconocidos ══════════════════════════════════════
function verAlertas(){
  const pend=RCA_FACT.filter(f=>f.estado_revision==='pendiente');
  // agrupar por RUT para validar de una sola vez
  const grupos={};
  pend.forEach(f=>{ const k=rutCanon(f.rut_proveedor)||('_'+f.factura_id); (grupos[k]=grupos[k]||{rut:f.rut_proveedor,razon:f.razon_social,comuna:f.comuna,facts:[]}).facts.push(f); });
  const arr=Object.entries(grupos);
  abrirModal(`
    <h3>⚠ Proveedores por revisar</h3>
    <p class="modal-nota">Estos RUT no están en el registro de proveedores regionales validados.
    Revisa cada uno: si es de la Región de Antofagasta, valídalo (sus facturas pasarán a sumar al 10%);
    si no, márcalo fuera de región.</p>
    ${!arr.length?'<div class="vacio">No hay pendientes. 👌</div>':`
    <div class="alert-lista">
      ${arr.map(([k,g])=>{
        const monto=g.facts.reduce((a,f)=>a+(+f.monto_clp||0),0);
        const comReg=RCA_COMUNAS_REGION.includes(String(g.comuna||'').toUpperCase());
        return `<div class="alert-row">
          <div class="alert-info">
            <div class="alert-rut">${esc(rutFmt(g.rut)||'sin RUT')}</div>
            <div class="alert-razon">${esc(g.razon||'—')}</div>
            <div class="alert-sub">${esc(g.comuna||'sin comuna')} ${comReg?'<span class="ok-tag">comuna regional</span>':'<span class="warn-tag">revisar comuna</span>'} · ${g.facts.length} factura(s) · ${_clp(monto)}</div>
          </div>
          <div class="alert-acc">
            <button class="mini ok" onclick="validarProveedor('${encodeURIComponent(g.rut)}','${encodeURIComponent(g.razon||'')}','${encodeURIComponent(g.comuna||'')}')">✓ Validar regional</button>
            <button class="mini danger" onclick="marcarFueraRegion('${encodeURIComponent(g.rut)}')">✕ Fuera de región</button>
          </div>
        </div>`;
      }).join('')}
    </div>`}
    <div class="modal-acc"><span></span><button class="btn ghost" onclick="cerrarModal()">Cerrar</button></div>`);
}

// Valida un proveedor: lo agrega al registro regional y pasa sus facturas a OK.
async function validarProveedor(rutE,razonE,comunaE){
  const rut=decodeURIComponent(rutE), razon=decodeURIComponent(razonE), comuna=decodeURIComponent(comunaE);
  const canon=rutCanon(rut);
  if(!canon){ toast('Sin RUT no se puede validar; edita la factura primero','err'); return; }
  try{
    const previo=RCA_VMAP[canon];
    // upsert por RUT: si el proveedor ya existe (sembrado o validado antes) se
    // actualiza a regional; si no, se crea. Evita el error de RUT duplicado.
    const payload={
      rut:rutFmt(rut),
      razon_social:razon||(previo&&previo.razon_social)||null,
      comuna:comuna||(previo&&previo.comuna)||null,
      region:'Antofagasta', es_regional:true, validado:true,
      validado_por:quien(), validado_en:nowISO(), updated_at:nowISO(), updated_by:quien()
    };
    if(!previo) payload.created_by=quien();
    const {data,error}=await SB.from('rca_proveedores_validados')
      .upsert(payload,{onConflict:'rut'}).select().single();
    if(error) throw error;
    const reg=data;
    const i=RCA_VALID.findIndex(v=>rutCanon(v.rut)===canon);
    if(i>=0) RCA_VALID[i]=reg; else RCA_VALID.push(reg);
    RCA_VMAP[canon]=reg;
    // actualizar todas las facturas pendientes de ese RUT
    const ids=RCA_FACT.filter(f=>rutCanon(f.rut_proveedor)===canon && f.estado_revision!=='ok').map(f=>f.factura_id);
    if(ids.length){
      const {error}=await SB.from('rca_facturas').update({estado_revision:'ok',es_regional:true,rvp_id:reg.rvp_id,updated_at:nowISO()}).in('factura_id',ids);
      if(error) throw error;
    }
    await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle(); verAlertas(); toast('✅ Proveedor validado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

async function marcarFueraRegion(rutE){
  const rut=decodeURIComponent(rutE); const canon=rutCanon(rut);
  try{
    const ids=RCA_FACT.filter(f=>rutCanon(f.rut_proveedor)===canon && f.estado_revision==='pendiente').map(f=>f.factura_id);
    if(ids.length){
      const {error}=await SB.from('rca_facturas').update({estado_revision:'no_regional',es_regional:false,updated_at:nowISO()}).in('factura_id',ids);
      if(error) throw error;
    }
    await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle(); verAlertas(); toast('Marcado fuera de región','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ══ FACTURAS DE UNA EECC ═════════════════════════════════════════════════════
// Fecha de carga (created_at) en DD-MM-AAAA, para distinguir cada Excel subido.
function fmtDia(iso){ if(!iso) return 'sin fecha'; const p=String(iso).slice(0,10).split('-');
  return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:String(iso).slice(0,10); }
// Agrupa las facturas de una EECC por el día en que se cargó el Excel.
function cargasPorDia(eeccId){
  const g={};
  RCA_FACT.filter(f=>f.eecc_id===eeccId).forEach(f=>{
    const d=String(f.created_at||'').slice(0,10)||'—';
    (g[d]=g[d]||{dia:d,n:0,monto:0}).n++; g[d].monto+=(+f.monto_clp||0);
  });
  return Object.values(g).sort((a,b)=>String(b.dia).localeCompare(String(a.dia)));  // más reciente arriba
}
function verFacturas(eeccId){
  _facturasAbiertas=eeccId;
  const e=RCA_EECC.find(x=>x.eecc_id===eeccId);
  const facts=RCA_FACT.filter(f=>f.eecc_id===eeccId).sort((a,b)=>String(b.anio+b.mes).localeCompare(String(a.anio+a.mes)));
  const badge=s=>s==='ok'?'<span class="est ok">Regional ✓</span>':s==='no_regional'?'<span class="est off">Fuera región</span>':s==='incompleta'?'<span class="est inc">Datos incompletos</span>':'<span class="est pend">Por revisar</span>';
  const cargas=cargasPorDia(eeccId);
  abrirModal(`
    <h3>🧾 Facturas · ${esc(e?e.nombre:'')}</h3>
    ${!facts.length?'<div class="vacio">Esta EECC aún no tiene facturas. Usa «Cargar Excel».</div>':`
    ${cargas.length?`<div class="cargas-box">
      <div class="cargas-t">Excel cargados (por día)</div>
      ${cargas.map(g=>`<div class="carga-row">
        <div class="carga-info">📅 <b>${fmtDia(g.dia)}</b> · ${g.n} factura(s) · ${_clp(g.monto)}</div>
        <button class="mini danger" onclick="borrarCargaDia('${eeccId}','${g.dia}')" title="Eliminar el Excel cargado ese día">🗑 Eliminar esta carga</button>
      </div>`).join('')}
    </div>`:''}
    <div class="tabla-scroll"><table class="tabla-fact">
      <thead><tr><th>Cargado</th><th>Año</th><th>Mes</th><th>N° factura</th><th>RUT</th><th>Proveedor</th><th>Comuna</th><th>Monto CLP</th><th>Estado</th><th></th></tr></thead>
      <tbody>${facts.map(f=>`<tr class="${f.estado_revision}">
        <td title="Día en que se cargó el Excel">${fmtDia(f.created_at)}</td>
        <td>${esc(f.anio||'')}</td><td>${esc(f.mes||'')}</td><td>${esc(f.num_factura||'')}</td>
        <td>${esc(rutFmt(f.rut_proveedor)||'')}</td><td>${esc(f.razon_social||'')}</td><td>${esc(f.comuna||'')}</td>
        <td style="text-align:right">${_clp(f.monto_clp)}</td><td>${badge(f.estado_revision)}</td>
        <td><button class="mini danger" title="Eliminar" onclick="borrarFactura('${f.factura_id}','${eeccId}')">🗑</button></td>
      </tr>`).join('')}</tbody>
    </table></div>`}
    <div class="modal-acc">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn ghost" onclick="exportarInforme('${eeccId}')">⬇ Descargar para auditar</button>
        <button class="btn primary" onclick="importarExcel('${eeccId}')">📥 Cargar Excel auditado</button>
        ${cargas.length>1?`<button class="btn danger ghost" onclick="borrarFacturasEECC('${eeccId}')">🗑 Eliminar todos (${facts.length})</button>`:''}
      </div>
      <button class="btn ghost" onclick="cerrarModal()">Cerrar</button>
    </div>`);
}
// Elimina solo las facturas cargadas un día concreto (un Excel subido ese día),
// para deshacer una carga con errores sin tocar las de otros días.
async function borrarCargaDia(eeccId,dia){
  const e=RCA_EECC.find(x=>x.eecc_id===eeccId);
  const ids=RCA_FACT.filter(f=>f.eecc_id===eeccId && String(f.created_at||'').slice(0,10)===dia).map(f=>f.factura_id);
  if(!ids.length){ toast('No hay facturas de esa carga','err'); return; }
  if(!confirm(`¿Eliminar el Excel cargado el ${fmtDia(dia)} de «${e?e.nombre:''}» (${ids.length} factura(s))?\n\nSirve para deshacer una carga con errores. No toca las facturas cargadas otros días.`)) return;
  try{
    const {error}=await SB.from('rca_facturas')
      .update({estado_registro:'Eliminado',updated_at:nowISO(),updated_by:quien()})
      .in('factura_id',ids);
    if(error) throw error;
    await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle(); verFacturas(eeccId);
    toast(`🗑 Carga del ${fmtDia(dia)} eliminada (${ids.length})`,'ok');
  }catch(err){ toast('Error: '+err.message,'err'); }
}
// Borrado masivo: vacía TODAS las facturas cargadas de una EECC (todos los días),
// sin tener que borrarlas una por una. Borrado lógico, como el resto.
async function borrarFacturasEECC(eeccId){
  const e=RCA_EECC.find(x=>x.eecc_id===eeccId);
  const n=RCA_FACT.filter(f=>f.eecc_id===eeccId).length;
  if(!n){ toast('No hay facturas cargadas para esta EECC','err'); return; }
  if(!confirm(`¿Eliminar TODAS las ${n} factura(s) cargadas de «${e?e.nombre:''}» (de todos los días)?\n\nEsto vacía el Excel subido para esta EECC y deja de sumar a la meta. Puedes volver a cargar el Excel cuando quieras.`)) return;
  try{
    const {error}=await SB.from('rca_facturas')
      .update({estado_registro:'Eliminado',updated_at:nowISO(),updated_by:quien()})
      .eq('eecc_id',eeccId).neq('estado_registro','Eliminado');
    if(error) throw error;
    await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle(); verFacturas(eeccId);
    toast(`🗑 ${n} factura(s) eliminadas`,'ok');
  }catch(err){ toast('Error: '+err.message,'err'); }
}
async function borrarFactura(id,eeccId){
  if(!confirm('¿Eliminar esta factura?')) return;
  try{
    const {error}=await SB.from('rca_facturas').update({estado_registro:'Eliminado',updated_at:nowISO()}).eq('factura_id',id);
    if(error) throw error;
    await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle(); verFacturas(eeccId); toast('🗑 Eliminada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ══ INFORME EXCEL ════════════════════════════════════════════════════════════
// Informe de auditoría. La hoja "Facturas" usa los MISMOS encabezados de la
// plantilla EECC, así se puede descargar, corregir y volver a subir: al recargar
// se actualizan las facturas existentes (mismo N° de factura) en vez de duplicar.
function exportarInforme(eeccId){
  const r=RCA_ACTUAL;
  const eecc = eeccId ? RCA_EECC.filter(e=>e.eecc_id===eeccId) : RCA_EECC;
  const facts = eeccId ? RCA_FACT.filter(f=>f.eecc_id===eeccId) : RCA_FACT;
  const resumen=[['RCA',r.codigo,r.nombre||''],['Meta',(+r.pct_meta||10)+'%'],[],
    ['EECC','RUT','Monto declarado','Meta','Reportado regional','Avance %','Falta %',
     'Contrato desde','Contrato hasta','Días de contrato','Facturas','Por revisar']];
  eecc.forEach(e=>{ const c=calcEECC(e);
    resumen.push([e.nombre,rutFmt(e.rut||''),c.decl,c.meta,c.rep,c.avance,c.faltaPct,
      String(e.fecha_desde||'').slice(0,10), String(e.fecha_hasta||'').slice(0,10),
      c.dias===null?'':c.dias, c.nfact,c.pend]); });
  const fdet=[['Año','Mes','N° de Factura','EE.CC','RUT','Razón social o nombre de fantasía',
    'Comuna casa matriz','Bien o servicio contratado','Clasificación','CLP Monto de la contratación','Estado revisión']];
  facts.forEach(f=>{ const e=RCA_EECC.find(x=>x.eecc_id===f.eecc_id);
    fdet.push([f.anio,f.mes,f.num_factura,e?e.nombre:(f.eecc_nombre||''),rutFmt(f.rut_proveedor||''),
      f.razon_social,f.comuna,f.bien_servicio,f.clasificacion,f.monto_clp,
      f.estado_revision==='ok'?'Regional':f.estado_revision==='no_regional'?'Fuera región':'Por revisar']); });
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(resumen),'Resumen');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(fdet),'Facturas');
  const suf = eeccId ? '_'+(eecc[0]?eecc[0].nombre.replace(/[^\w]+/g,'_').slice(0,20):'eecc') : '';
  XLSX.writeFile(wb,`RCA_${r.codigo}${suf}_auditoria.xlsx`);
}

// ══ REPORTE HTML (gerencia / por EECC) ═══════════════════════════════════════
// El render vive en shared/js/rca-reporte.js (window.RCAReporte), compartido con
// la página pública reporte.html. Acá solo se arman los datos, la descarga y los
// links compartibles.

// Descarga/abre el documento HTML del reporte (respaldo local, además del link).
function generarReporteRCA(modo, eeccId){
  const r=RCA_ACTUAL; if(!r){ toast('Abre una RCA primero','err'); return; }
  const lista = modo==='eecc' ? RCA_EECC.filter(x=>x.eecc_id===eeccId) : RCA_EECC.slice();
  if(!lista.length){ toast('No hay EECC para reportar','err'); return; }
  const html=RCAReporte.documento({rca:r, lista, facturas:RCA_FACT, modo});
  const base = modo==='eecc'
    ? `Reporte_${r.codigo}_${(lista[0].nombre||'EECC').replace(/[^\w]+/g,'_').slice(0,24)}`
    : `Reporte_gerencia_${r.codigo}`;
  _descargarHTML(html, base+'.html');
}
function _descargarHTML(html, nombre){
  try{
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=nombre;
    document.body.appendChild(a); a.click(); a.remove();
    const w=window.open(url,'_blank');
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    toast(w?'📄 Reporte generado (se abrió y se descargó)':'📄 Reporte descargado','ok');
  }catch(e){ toast('No se pudo generar el reporte: '+e.message,'err'); }
}

// ── Links compartibles (tabla rca_reportes + página pública reporte.html) ─────
function rcaReporteURL(token){
  return new URL('reporte.html', location.href).href.split('#')[0].split('?')[0] + '?t=' + token;
}
// gerencia: token FIJO por RCA (link constante, se reusa si ya existe).
async function rcaTokenGerencia(){
  const {data:ex}=await SB.from('rca_reportes').select('token')
    .eq('rca_id',RCA_ACTUAL.rca_id).eq('tipo','gerencia').eq('activo',true).maybeSingle();
  if(ex&&ex.token) return ex.token;
  const {data,error}=await SB.from('rca_reportes')
    .insert({rca_id:RCA_ACTUAL.rca_id, tipo:'gerencia', eecc_id:null, created_by:quien()})
    .select('token').single();
  if(error){ // carrera con otro que lo creó: reintentar la lectura
    const {data:r2}=await SB.from('rca_reportes').select('token')
      .eq('rca_id',RCA_ACTUAL.rca_id).eq('tipo','gerencia').maybeSingle();
    if(r2&&r2.token) return r2.token; throw error;
  }
  return data.token;
}
// eecc: token nuevo por EECC (opcional caducidad en días).
async function rcaTokenEECC(eeccId, dias){
  const expira = dias?new Date(Date.now()+(+dias)*86400000).toISOString():null;
  const {data,error}=await SB.from('rca_reportes')
    .insert({rca_id:RCA_ACTUAL.rca_id, tipo:'eecc', eecc_id:eeccId, expira, created_by:quien()})
    .select('token').single();
  if(error) throw error;
  return data.token;
}
function _rcaLinkBox(url){
  return `<div class="rca-linkbox">
    <input id="rcaLinkUrl" readonly value="${esc(url)}" onclick="this.select()">
    <button class="btn primary" onclick="rcaCopiarLink()">📋 Copiar</button>
    <a class="btn ghost" href="${esc(url)}" target="_blank" rel="noopener">Abrir ↗</a>
  </div>`;
}
function rcaCopiarLink(){
  const i=document.getElementById('rcaLinkUrl'); if(!i) return; i.select();
  try{ navigator.clipboard.writeText(i.value); }catch(e){ try{document.execCommand('copy');}catch(_){} }
  toast('🔗 Link copiado','ok');
}
// Modal del reporte de gerencia: link constante + descarga.
async function rcaAbrirReporteGerencia(){
  if(!RCA_EECC.length){ toast('Agrega EECC antes de reportar','err'); return; }
  abrirModal(`<h3>📄 Reporte para gerencia</h3><p class="modal-nota">Generando el link…</p>`);
  try{
    const url=rcaReporteURL(await rcaTokenGerencia());
    abrirModal(`<h3>📄 Reporte para gerencia</h3>
      <p class="modal-nota">Link <b>constante</b> con el resumen general y una hoja por cada EECC.
      Siempre muestra los datos actualizados (tipo dashboard). Compártelo con gerencia.</p>
      ${_rcaLinkBox(url)}
      <div class="modal-acc"><span></span>
        <button class="btn ghost" onclick="generarReporteRCA('gerencia')">⬇ Descargar HTML</button>
        <button class="btn ghost" onclick="cerrarModal()">Cerrar</button></div>`);
  }catch(e){ cerrarModal(); toast('Error al generar el link: '+e.message,'err'); }
}
// Modal del reporte de una EECC: generar link (con caducidad opcional) + descarga.
function rcaAbrirReporteEECC(eeccId){
  const e=RCA_EECC.find(x=>x.eecc_id===eeccId);
  abrirModal(`<h3>📄 Reporte · ${esc(e?e.nombre:'')}</h3>
    <p class="modal-nota">Genera un link con <b>solo esta EECC</b> para enviárselo. Puedes ponerle caducidad.</p>
    <label>Caducidad del link</label>
    <select id="rcaExp">
      <option value="">Sin caducidad</option>
      <option value="7">7 días</option>
      <option value="30" selected>30 días</option>
      <option value="90">90 días</option>
    </select>
    <div id="rcaEeccLink" style="margin-top:12px"></div>
    <div class="modal-acc">
      <button class="btn ghost" onclick="generarReporteRCA('eecc','${eeccId}')">⬇ Descargar HTML</button>
      <div><button class="btn primary" onclick="rcaGenerarLinkEECC('${eeccId}')">🔗 Generar link</button>
      <button class="btn ghost" onclick="cerrarModal()">Cerrar</button></div>
    </div>`);
}
async function rcaGenerarLinkEECC(eeccId){
  try{
    const dias=val('rcaExp');
    const url=rcaReporteURL(await rcaTokenEECC(eeccId, dias||null));
    const cad=dias?`Caduca en ${dias} días.`:'Sin caducidad.';
    document.getElementById('rcaEeccLink').innerHTML=`<p class="modal-nota" style="margin:0 0 8px">${cad}</p>${_rcaLinkBox(url)}`;
    toast('🔗 Link creado','ok');
  }catch(e){ toast('Error al crear el link: '+e.message,'err'); }
}


// ══ BASE DE PROVEEDORES VALIDADOS (Ajustes) ═════════════════════════════════
// Registro que se acumula con el tiempo y sirve para todas las RCAs. Cada vez
// que se valida un proveedor nuevo desde una alerta, entra acá.
let _bpFiltro='';
function verBaseProveedores(){
  abrirModal(`
    <h3>⚙ Base de proveedores regionales</h3>
    <p class="modal-nota">Registro que se acumula con el tiempo y sirve para todas las RCAs. Los marcados
    <b>regional</b> suman al 10%; los de fuera de la Región de Antofagasta quedan registrados pero no suman.</p>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <input id="bpBuscar" placeholder="Buscar por RUT, razón social o comuna…" oninput="bpRender()" style="flex:1">
      <button class="btn primary" onclick="validadoModal()">➕ Agregar</button>
    </div>
    <div id="bpLista"></div>
    <div class="modal-acc">
      <button class="btn ghost" onclick="exportarValidados()">⬇ Descargar registro</button>
      <button class="btn ghost" onclick="cerrarModal()">Cerrar</button>
    </div>`);
  const inp=document.getElementById('bpBuscar'); if(inp) inp.value=_bpFiltro;
  bpRender();
}
function bpRender(){
  const cont=document.getElementById('bpLista'); if(!cont) return;
  const q=(document.getElementById('bpBuscar')||{}).value||''; _bpFiltro=q;
  const nq=q.toLowerCase().trim();
  const lista=RCA_VALID
    .filter(v=>!nq || (rutCanon(v.rut)+' '+(v.razon_social||'')+' '+(v.comuna||'')).toLowerCase().includes(nq))
    .sort((a,b)=>String(a.razon_social||'').localeCompare(String(b.razon_social||'')));
  const reg=RCA_VALID.filter(v=>v.es_regional).length;
  cont.innerHTML=`<div class="bp-tot">${RCA_VALID.length} proveedores · <b style="color:var(--green)">${reg} regionales</b> · ${RCA_VALID.length-reg} fuera de región${nq?` · ${lista.length} coinciden`:''}</div>
  <div class="tabla-scroll"><table class="tabla-fact">
    <thead><tr><th>RUT</th><th>Razón social</th><th>Comuna</th><th>Región</th><th></th></tr></thead>
    <tbody>${lista.map(v=>`<tr class="${v.es_regional?'':'no_regional'}">
      <td>${esc(rutFmt(v.rut))}</td><td>${esc(v.razon_social||'')}</td><td>${esc(v.comuna||'')}</td>
      <td>${v.es_regional?'<span class="est ok">Regional</span>':'<span class="est off">Fuera</span>'}</td>
      <td><button class="mini" onclick="validadoModal(${v.rvp_id})">✏</button></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}
function validadoModal(id){
  const v=id?RCA_VALID.find(x=>x.rvp_id===id):{};
  abrirModal(`
    <h3>${id?'Editar proveedor':'Nuevo proveedor validado'}</h3>
    <div class="g2">
      <div><label>RUT *</label><input id="vRut" value="${esc(v.rut||'')}" placeholder="76xxxxxxx-x"></div>
      <div><label>Comuna casa matriz</label><input id="vComuna" value="${esc(v.comuna||'')}" placeholder="Antofagasta, Calama…"></div>
    </div>
    <label>Razón social o nombre de fantasía</label><input id="vRazon" value="${esc(v.razon_social||'')}">
    <div class="g2">
      <div><label>Clasificación</label><input id="vClasif" value="${esc(v.clasificacion||'')}" placeholder="BIENES / SERVICIOS"></div>
      <div><label>Bien o servicio</label><input id="vBien" value="${esc(v.bien_servicio||'')}"></div>
    </div>
    <label style="display:flex;align-items:center;gap:8px;margin-top:12px">
      <input type="checkbox" id="vRegional" style="width:auto" ${(v.rvp_id?v.es_regional:true)?'checked':''}>
      <span>Es proveedor regional (Región de Antofagasta) — suma al 10%</span>
    </label>
    <div class="modal-acc">
      ${id?`<button class="btn danger ghost" onclick="borrarValidado(${id})">🗑 Eliminar</button>`:'<span></span>'}
      <div><button class="btn ghost" onclick="verBaseProveedores()">Cancelar</button>
      <button class="btn primary" onclick="guardarValidado(${id||'null'})">Guardar</button></div>
    </div>`);
}
async function guardarValidado(id){
  const rut=val('vRut').trim();
  if(!rutCanon(rut)){ toast('El RUT es obligatorio','err'); return; }
  const esReg=document.getElementById('vRegional').checked;
  const fila={
    rut:rutFmt(rut), razon_social:val('vRazon').trim()||null, comuna:val('vComuna').trim()||null,
    clasificacion:val('vClasif').trim()||null, bien_servicio:val('vBien').trim()||null,
    es_regional:esReg, region:esReg?'Antofagasta':null, validado:true,
    validado_por:quien(), validado_en:nowISO(), updated_by:quien(), updated_at:nowISO()
  };
  try{
    if(id){ const {error}=await SB.from('rca_proveedores_validados').update(fila).eq('rvp_id',id); if(error) throw error; }
    else{
      // upsert por RUT: si ya existe, se actualiza en vez de fallar por el unique
      fila.created_by=quien();
      const {error}=await SB.from('rca_proveedores_validados').upsert(fila,{onConflict:'rut'}); if(error) throw error;
    }
    await cargarValidados(); verBaseProveedores(); toast('✅ Guardado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function borrarValidado(id){
  if(!confirm('¿Eliminar este proveedor del registro? No afecta las facturas ya cargadas.')) return;
  try{
    const {error}=await SB.from('rca_proveedores_validados').update({estado_registro:'Eliminado',updated_at:nowISO()}).eq('rvp_id',id);
    if(error) throw error;
    await cargarValidados(); verBaseProveedores(); toast('🗑 Eliminado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
function exportarValidados(){
  const aoa=[['RUT','Razón social','Comuna','Clasificación','Bien o servicio','Región','Regional']];
  RCA_VALID.slice().sort((a,b)=>String(a.razon_social||'').localeCompare(String(b.razon_social||'')))
    .forEach(v=>aoa.push([rutFmt(v.rut),v.razon_social,v.comuna,v.clasificacion,v.bien_servicio,v.region,v.es_regional?'Sí':'No']));
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(aoa),'Proveedores');
  XLSX.writeFile(wb,'RCA_base_proveedores_regionales.xlsx');
}

// ══ modal genérico ═══════════════════════════════════════════════════════════
function abrirModal(html){
  const host=document.getElementById('modalHost');
  host.innerHTML=`<div class="modal-ov"><div class="modal-box">${html}</div></div>`;
  // El modal se cierra SOLO con un clic deliberado en el fondo oscuro: la
  // presión debe empezar Y terminar sobre el overlay. Antes bastaba con que el
  // clic terminara ahí (onclick), así que arrastrar para seleccionar texto en un
  // campo y soltar el mouse fuera de la caja cerraba el formulario y se perdía lo
  // escrito. Ahora un clic que empieza dentro de la caja nunca la cierra.
  const ov=host.querySelector('.modal-ov'); if(!ov) return;
  let _downOv=false;
  ov.addEventListener('pointerdown', e=>{ _downOv=(e.target===ov); });
  ov.addEventListener('pointerup',   e=>{ if(_downOv && e.target===ov) cerrarModal(); _downOv=false; });
}
function cerrarModal(){ document.getElementById('modalHost').innerHTML=''; _facturasAbiertas=null; }
// Escape también cierra el modal abierto (un solo listener para todo el módulo).
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && document.querySelector('.modal-ov')) cerrarModal(); });
function val(id){ const el=document.getElementById(id); return el?el.value:''; }
