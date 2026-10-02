
// ═══════════ CONFIG ═══════════
// Login, registro y restauración de sesión: shared/js/auth-guard.js (P-6).
// window.AUTH_CFG se define en index.html, antes de cargar ese script.
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m,t){ const e=document.getElementById('toast'); e.textContent=m; e.className='toast '+(t||''); e.style.display='block'; setTimeout(()=>e.style.display='none',2600); }
function miNombre(){ return (USER&&USER.email)||''; }

async function _movilOnAcceso(user){
  document.getElementById('gate').style.display='none';
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('hUser').textContent=(user.email||'').split('@')[0];
  await cargarLevantados();
  try{ await resumenCargar(); }catch(e){}            // atenciones (para historial e indicador)
  if(typeof opBootstrap==='function') opBootstrap();   // carga el operativo activo (Fase 5)
  if(typeof rcRender==='function') rcRender();   // pinta la Recepción (pestaña de entrada)
}

// ═══════════ NAVEGACIÓN ═══════════
// Hay dos juegos de pestañas: la barra de arriba (escritorio y tableta) y la
// barra inferior estilo app (teléfono). Solo una se ve a la vez, pero las dos
// se marcan, para que al girar el equipo o cambiar de tamaño quede coherente.
function movTab(p,btn){
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  const pg=document.getElementById('page-'+p); if(pg) pg.classList.add('active');
  document.querySelectorAll('.tabbar button, .navtabs button').forEach(b=>{
    b.classList.toggle('active', b.dataset.p===p);
  });
  if(p==='recepcion' && typeof rcRender==='function')rcRender();
  if(p==='intermediacion' && typeof imRender==='function')imRender();
  if(p==='formacion' && typeof mfRender==='function')mfRender();
  if(p==='resumen')renderResumen();
  window.scrollTo(0,0);
}

// ═══════════ ESTADO DE CAPTURA ═══════════
let ACTUAL=null;      // registro en edición {cv_id,...}
let LEVANTADOS=[];    // cache de personas
let ES_EDICION=false; // si se está complementando un registro existente

function limpiarForm(){
  const set=(id,v)=>{ const e=document.getElementById(id); if(e) e.value=v||''; };
  ['fNombres','fApellidos','fNac','fComuna','fLocalidad','fRegion','fTel','fEmail','fTipoLic','fAnios','fOficios','fEducacion','fCursos','fCertif','fObs',
   'fSexo','fResid','fLic','fMineria','fEstudios','fCesantia','fDiscap','fDiscapTipo','fDiscapDet'].forEach(id=>set(id,''));
  set('fNacion','Chilena'); set('fRegion','Antofagasta');
  if(typeof RC!=='undefined'){ RC.contra={items:[],alergia:'',tratamiento:'',otras:''}; }
  if(typeof rcContraRender==='function') rcContraRender();
  if(typeof rcDiscapCambio==='function') rcDiscapCambio();
  const rw=document.getElementById('rutWarn'); if(rw) rw.style.display='none';
  const ei=document.getElementById('editInfo'); if(ei) ei.textContent='';
  if(typeof rcEligibilidad==='function') rcEligibilidad();
}
function nuevoRegistro(){
  ACTUAL={ cv_id:'cv_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6), cuestionario:{}, _nuevo:true };
  ES_EDICION=false; limpiarForm();
  const rut=document.getElementById('cRut').value.trim(); // conservar rut escrito
  document.getElementById('editInfo').textContent='Nuevo registro — RUT: '+(rut||'(sin rut)');
  toast('Nuevo registro en blanco','ok');
}
function formToObj(){
  const g=id=>{ const e=document.getElementById(id); return e?e.value.trim():''; };
  const cursos=g('fCursos').split('\n').filter(x=>x.trim()).map(x=>({evento:x.trim(),tema:'',institucion:'',anio:''}));
  return {
    cv_id:(ACTUAL&&ACTUAL.cv_id)||('cv_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),
    rut:document.getElementById('cRut').value.trim(), nombres:g('fNombres'), apellidos:g('fApellidos'),
    fecha_nacimiento:g('fNac'), sexo:g('fSexo'), nacionalidad:g('fNacion'), comuna:g('fComuna'), localidad:g('fLocalidad'), region:g('fRegion'),
    direccion:g('fDir'), telefono:fonoFmt(g('fTel')), email:g('fEmail'),
    licencia:g('fLic'), tipo_licencia:g('fTipoLic'), disponibilidad:g('fDisp'),
    exp_mineria:g('fMineria'), anios_exp:g('fAnios'), oficios:g('fOficios'),
    educacion:[g('fEstudios'),g('fEducacion')].filter(Boolean).join(' — '),
    certificaciones:g('fCertif'), observaciones:g('fObs'),
    // Salud (Recepción): discapacidad + contraindicación médica.
    discapacidad:g('fDiscap'),
    tipo_discapacidad:(g('fDiscap')==='Sí'?g('fDiscapTipo'):''),
    discapacidad_detalle:(g('fDiscap')==='Sí'&&g('fDiscapTipo')==='Otra'?g('fDiscapDet'):''),
    contraindicaciones_json:(typeof RC!=='undefined'&&RC.contra)?rcContraJSON():null,
    cursos, cuestionario:(ACTUAL&&ACTUAL.cuestionario)||{}
  };
}
function objToForm(c){
  const s=(id,v)=>{ const e=document.getElementById(id); if(e) e.value=v||''; };
  s('cRut',c.rut); s('fNombres',c.nombres); s('fApellidos',c.apellidos); s('fNac',c.fecha_nacimiento);
  s('fSexo',c.sexo); s('fNacion',c.nacionalidad); s('fComuna',c.comuna); s('fRegion',c.region);
  if(typeof rcLlenarLocalidades==='function') rcLlenarLocalidades(); s('fLocalidad',c.localidad);
  s('fDir',c.direccion); s('fTel',c.telefono); s('fEmail',c.email);
  s('fLic',c.licencia); s('fTipoLic',c.tipo_licencia); s('fDisp',c.disponibilidad);
  s('fMineria',c.exp_mineria); s('fAnios',c.anios_exp); s('fOficios',c.oficios);
  s('fCertif',c.certificaciones); s('fObs',c.observaciones);
  s('fCursos',(c.cursos||[]).map(x=>x.evento||'').filter(Boolean).join('\n'));
  // educación: separar estudios formales del detalle si viene con —
  if(c.educacion){ const parts=c.educacion.split(' — '); document.getElementById('fEstudios').value=parts[0]||''; document.getElementById('fEducacion').value=parts.slice(1).join(' — '); }
  // Salud: discapacidad + contraindicación.
  s('fDiscap',c.discapacidad); s('fDiscapTipo',c.tipo_discapacidad); s('fDiscapDet',c.discapacidad_detalle);
  if(typeof rcDiscapCambio==='function') rcDiscapCambio();
  if(typeof rcContraCargar==='function') rcContraCargar(c.contraindicaciones_json);
}

// ═══════════ TELÉFONO / RUT / CORREO — reglas comunes (shared/js/validaciones.js)
function fonoFmt(v){ return AMForm.fonoFormat(v); }
function normFono(el){ if(!el) return; el.value=fonoFmt(el.value); el.classList.toggle('campo-mal', !!el.value && !AMForm.fonoValido(el.value)); }

let _rutTimer=null, _rutCargado=null;
function normRut(r){ return String(r||'').replace(/[.\-\s]/g,'').toLowerCase(); }
function rutFmt(v){ return AMForm.rutFormat(v); }
// Valida los campos de contacto de Recepción; devuelve mensaje de error o ''.
function movValidarContacto(){
  const g=id=>{const e=document.getElementById(id);return e?e.value.trim():'';};
  const rut=g('cRut'), tel=g('fTel'), mail=g('fEmail');
  if(rut && !AMForm.rutValido(rut)) return 'El RUT no es válido (revisa el dígito verificador).';
  if(tel && !AMForm.fonoValido(fonoFmt(tel))) return 'El teléfono debe ser +569 seguido de 8 dígitos.';
  if(mail && !AMForm.emailValido(mail)) return 'El correo no tiene un formato válido.';
  return '';
}
// Al salir del campo: deja el RUT con formato, marca si es inválido, y busca.
function rutBlur(el){ if(!el) return; el.value=rutFmt(el.value);
  el.classList.toggle('campo-mal', !!el.value && !AMForm.rutValido(el.value));
  buscarPorRut(true); }
function emailBlur(el){ if(!el) return; el.classList.toggle('campo-mal', !!el.value.trim() && !AMForm.emailValido(el.value)); }
function buscarPorRut(inmediato){
  clearTimeout(_rutTimer);
  // #5 — Al borrar, modificar o reemplazar el RUT, limpiar de inmediato TODA la
  // información temporal de la persona anterior (antes de consultar el nuevo RUT).
  const rutAhora=normRut((document.getElementById('cRut')||{}).value||'');
  if(_rutCargado){
    const prev=LEVANTADOS.find(c=>c.cv_id===_rutCargado);
    if(!prev || normRut(prev.rut)!==rutAhora){ _limpiarPersonaTemporal(); }
  }
  const run=async()=>{
    const rut=normRut((document.getElementById('cRut')||{}).value||''); const warn=document.getElementById('rutWarn');
    const histN=movHistorialAtenciones(rut).length;
    const histLink=histN?` · <span class="hist-link" onclick="movHistorialAbrir('${rut}')">🕑 Historial (${histN})</span>`:'';
    if(rut.length<7){ if(warn){warn.style.display='none';} return; }
    const encontrado=LEVANTADOS.find(c=>normRut(c.rut)===rut);
    if(encontrado){
      // Precarga automática (una sola vez por persona): trae todos sus datos.
      if(_rutCargado!==encontrado.cv_id){ _rutCargado=encontrado.cv_id; complementar(encontrado.cv_id); toast('Datos precargados','ok'); }
      const nom=((encontrado.nombres||'')+' '+(encontrado.apellidos||'')).trim()||'registro existente';
      const ult=movUltimaAtencion(rut); const uc=ult&&ult.comentario?(' · última: “'+esc(ult.comentario.slice(0,48))+(ult.comentario.length>48?'…':'')+'”'):'';
      if(warn){ warn.style.display='block'; warn.innerHTML='✔ Ya existe: '+esc(nom)+' — datos precargados'+histLink+uc; }
    } else if(histN){
      if(warn){ warn.style.display='block'; warn.innerHTML='🕑 Esta persona tiene atenciones previas'+histLink; }
    } else { if(warn){warn.style.display='none';} }
  };
  if(inmediato===true){ run(); } else { _rutTimer=setTimeout(run,350); }
}
// #5 — Deja la ficha en blanco para una persona nueva, conservando SOLO el RUT
// que se está escribiendo. Limpia nombre, datos, CV, servicios y estado local.
function _limpiarPersonaTemporal(){
  _rutCargado=null;
  ACTUAL={ cv_id:'cv_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6), cuestionario:{}, _nuevo:true };
  ES_EDICION=false; limpiarForm();
  if(typeof RC!=='undefined'){
    RC.servicios={apresto:false,intermediacion:false,formacion:false};
    RC.did={apresto:false,intermediacion:false,formacion:false};
    RC.cvPdf=null; RC.homolog={mineria:'',exam:''}; RC.contra={items:[],alergia:'',tratamiento:'',otras:''};
    RC.oficios=[]; RC.oficiosOtras=''; RC.licencias=[]; RC.dirCV=false; RC.comentario='';
  }
  const ei=document.getElementById('editInfo'); if(ei) ei.textContent='';
  if(typeof rcRender==='function') rcRender();
}
function complementar(id){
  const c=LEVANTADOS.find(x=>x.cv_id===id); if(!c)return;
  ACTUAL=JSON.parse(JSON.stringify(c)); ACTUAL.cursos=ACTUAL.cursos||[]; ACTUAL.cuestionario=ACTUAL.cuestionario||{};
  ES_EDICION=true;
  objToForm(ACTUAL);
  document.getElementById('rutWarn').style.display='none';
  document.getElementById('editInfo').textContent='✏ Complementando registro existente de '+((ACTUAL.nombres||'')+' '+(ACTUAL.apellidos||''));
  toast('Registro cargado para complementar','ok');
  window.scrollTo(0,0);
}

// ═══════════ GUARDAR (con logs de trazabilidad) ═══════════
async function guardarRegistro(){
  const nuevo=formToObj();
  if(!nuevo.nombres && !nuevo.apellidos){ toast('Ingresa al menos nombre o apellido','err'); return false; }
  const errC=movValidarContacto(); if(errC){ toast(errC,'err'); return false; }
  // #25 — Ficha única por RUT: si no estamos editando pero el RUT ya existe en el
  // sistema, se adopta esa ficha (misma persona) en lugar de crear un duplicado.
  if(!ES_EDICION && nuevo.rut && typeof AMForm!=='undefined' && AMForm.rutValido(nuevo.rut)){
    const ya=LEVANTADOS.find(c=>normRut(c.rut)===normRut(nuevo.rut));
    if(ya && ya.cv_id!==nuevo.cv_id){ nuevo.cv_id=ya.cv_id; if(ACTUAL) ACTUAL.cv_id=ya.cv_id; ES_EDICION=true; }
  }
  const previo = ES_EDICION ? LEVANTADOS.find(c=>c.cv_id===nuevo.cv_id) : null;
  const row={
    cv_id:nuevo.cv_id, rut:nuevo.rut, nombres:nuevo.nombres, apellidos:nuevo.apellidos,
    fecha_nacimiento:nuevo.fecha_nacimiento, sexo:nuevo.sexo, nacionalidad:nuevo.nacionalidad,
    comuna:nuevo.comuna, localidad:nuevo.localidad, region:nuevo.region, direccion:nuevo.direccion, telefono:nuevo.telefono, email:nuevo.email,
    licencia:nuevo.licencia, tipo_licencia:nuevo.tipo_licencia, disponibilidad:nuevo.disponibilidad,
    exp_mineria:nuevo.exp_mineria, anios_exp:nuevo.anios_exp, oficios:nuevo.oficios,
    educacion:nuevo.educacion, certificaciones:nuevo.certificaciones, observaciones:nuevo.observaciones,
    discapacidad:nuevo.discapacidad||null, tipo_discapacidad:nuevo.tipo_discapacidad||null,
    discapacidad_detalle:nuevo.discapacidad_detalle||null, contraindicaciones_json:nuevo.contraindicaciones_json||null,
    cursos_json:JSON.stringify(nuevo.cursos||[]),
    cuestionario_json:JSON.stringify(nuevo.cuestionario||{}),
    fuente:'movil', origen_plataforma:'movil',
    fecha_levantamiento:(previo&&previo.fecha_levantamiento)||new Date().toISOString().slice(0,10),
    levantado_por:(previo&&previo.levantado_por)||miNombre(),
    estado_registro:'Activo', updated_by:miNombre(), updated_at:new Date().toISOString()
  };
  if(!previo) row.created_by=miNombre();
  // "Vincular al Directorio CV": solo se toca si la casilla está en pantalla
  // (apresto abierto); si no, se conserva el valor previo.
  const dc=document.getElementById('rcDirCV'); if(dc) row.directorio_cv=dc.checked;
  const {error}=await SB.from('cv_personas').upsert(row,{onConflict:'cv_id'});
  if(error){ toast('Error: '+error.message,'err'); return false; }
  // logs de trazabilidad campo por campo
  await registrarCambios(previo, nuevo);
  // Observación nueva → al historial (cv_observaciones), sin perder las anteriores.
  try{ if(nuevo.observaciones && nuevo.observaciones!==((previo&&previo.observaciones)||''))
    await SB.from('cv_observaciones').insert({cv_id:nuevo.cv_id, texto:nuevo.observaciones, creado_por:miNombre()}); }catch(e){}
  toast('✅ Registro guardado','ok');
  ACTUAL={cv_id:nuevo.cv_id, cuestionario:nuevo.cuestionario, ...nuevo}; ES_EDICION=true;
  document.getElementById('editInfo').textContent='Guardado ✓ · '+((nuevo.nombres||'')+' '+(nuevo.apellidos||''));
  await cargarLevantados();
  return true;
}
async function registrarCambios(previo, nuevo){
  const campos=['rut','nombres','apellidos','fecha_nacimiento','sexo','nacionalidad','comuna','region','direccion','telefono','email','licencia','tipo_licencia','disponibilidad','exp_mineria','anios_exp','oficios','educacion','certificaciones','observaciones'];
  const logs=[];
  if(!previo){ logs.push({cv_id:nuevo.cv_id,usuario_email:miNombre(),accion:'crear',campo:'(registro)',valor_anterior:'',valor_nuevo:(nuevo.nombres||'')+' '+(nuevo.apellidos||''),origen:'movil.html'}); }
  else { campos.forEach(k=>{ const a=String(previo[k]||''), b=String(nuevo[k]||''); if(a!==b) logs.push({cv_id:nuevo.cv_id,usuario_email:miNombre(),accion:'editar',campo:k,valor_anterior:a,valor_nuevo:b,origen:'movil.html'}); }); }
  if(logs.length){ try{ await SB.from('cv_logs').insert(logs); }catch(e){} }
}

// ═══════════ CUESTIONARIO (preguntas reubicadas a sus servicios) ═══════════
// Las preguntas de residencia, nivel de estudios, especialización, situación/
// cesantía y "qué servicio" ya se responden en los ANTECEDENTES de la recepción.
// El ejecutivo se toma automáticamente del usuario logueado. Las que quedan se
// muestran dentro de su panel de servicio:
//   q_apresto → Apresto · q_tipo_cap → Formación
// (La pregunta "¿postuló interna/externa?" se eliminó — requerimiento #9.)
const CUEST=[
  {k:'q_apresto',t:'Si hubo orientación (apresto), ¿qué temática?',op:['Mejora de curriculum vitae','Postulación digital efectiva','Preparación para entrevista laboral']},
  {k:'q_tipo_cap',t:'Si registró capacitación, ¿a qué tipo postula?',op:['Ruta formativa Antofagasta Minerals','Capacitación de empresa colaboradora']}
];

// ═══════════ CACHE DE PERSONAS (para la precarga por RUT) ═══════════
async function cargarLevantados(){
  const {data,error}=await SB.from('cv_personas').select('*').neq('estado_registro','Eliminado').order('updated_at',{ascending:false});
  if(error){ toast('Error: '+error.message,'err'); return; }
  LEVANTADOS=(data||[]).map(c=>({...c,
    cursos:(function(){try{return JSON.parse(c.cursos_json||'[]')}catch(e){return[]}})(),
    cuestionario:(function(){try{return JSON.parse(c.cuestionario_json||'{}')}catch(e){return{}}})()
  }));
}
// ═══════════ RESUMEN DE ATENCIONES (pestaña Resumen · #3, #4) ═══════════
// Lista consolidada de TODAS las atenciones (una fila por recepción). Filtros
// combinables por fecha (desde/hasta) y por servicios (Apresto/Intermediación/
// Formación, selección múltiple + "Todos"). Cada fila lleva al detalle y al
// historial de la persona.
let RESUMEN={ atenciones:[], operativos:{}, loaded:false, desde:'', hasta:'',
  serv:{apresto:false,intermediacion:false,formacion:false}, todos:true, q:'' };

async function resumenCargar(){
  try{
    const {data,error}=await SB.from('atenciones').select('*').neq('estado_registro','Eliminado').order('created_at',{ascending:false});
    if(error) throw error; RESUMEN.atenciones=data||[]; RESUMEN.loaded=true;
    try{ const {data:ops}=await SB.from('operativos').select('operativo_id,lugar,comuna,fecha');
      RESUMEN.operativos={}; (ops||[]).forEach(o=>{ RESUMEN.operativos[o.operativo_id]=o; }); }catch(e){}
  }catch(e){ RESUMEN.atenciones=[]; toast('Error al cargar el resumen: '+e.message,'err'); }
}
async function renderResumen(){
  const cont=document.getElementById('page-resumen'); if(!cont) return;
  if(!RESUMEN.loaded){ cont.innerHTML='<div class="card"><div class="rc-nota">Cargando atenciones…</div></div>'; await resumenCargar(); }
  resumenPintar();
}
function resumenPintar(){
  const cont=document.getElementById('page-resumen'); if(!cont) return;
  const chip=(id,on,txt,h)=>`<label class="rsm-chip ${on?'on':''}"><input type="checkbox" ${on?'checked':''} onchange="${h}"> ${txt}</label>`;
  cont.innerHTML=`<div class="card">
    <div class="sec-t">📋 Resumen de atenciones</div>
    <div class="rsm-filtros">
      <div class="fld"><label>Desde</label><input type="date" value="${esc(RESUMEN.desde)}" onchange="RESUMEN.desde=this.value;resumenAplicar()"></div>
      <div class="fld"><label>Hasta</label><input type="date" value="${esc(RESUMEN.hasta)}" onchange="RESUMEN.hasta=this.value;resumenAplicar()"></div>
      <div class="fld rsm-servf"><label>Servicios</label><div class="rsm-chips">
        ${chip('todos',RESUMEN.todos,'Todos','resumenTodos(this.checked)')}
        ${chip('ap',RESUMEN.serv.apresto,'Apresto','resumenServ(\'apresto\',this.checked)')}
        ${chip('in',RESUMEN.serv.intermediacion,'Intermediación','resumenServ(\'intermediacion\',this.checked)')}
        ${chip('fo',RESUMEN.serv.formacion,'Formación','resumenServ(\'formacion\',this.checked)')}
      </div></div>
    </div>
    <div class="rsm-filtros2">
      <input class="search" placeholder="🔍 Buscar por nombre o RUT" value="${esc(RESUMEN.q||'')}" oninput="RESUMEN.q=this.value;resumenAplicar()">
      <button class="btn gray" onclick="resumenLimpiar()">Limpiar filtros</button>
    </div>
    <div id="rsmTabla"></div>
  </div>`;
  resumenAplicar();
}
// "Todos" es la selección general: excluye combinaciones con las otras.
function resumenTodos(v){ RESUMEN.todos=!!v; if(v) RESUMEN.serv={apresto:false,intermediacion:false,formacion:false}; resumenPintar(); }
function resumenServ(s,v){ RESUMEN.serv[s]=!!v;
  RESUMEN.todos=!(RESUMEN.serv.apresto||RESUMEN.serv.intermediacion||RESUMEN.serv.formacion); resumenPintar(); }
function resumenLimpiar(){ RESUMEN.desde='';RESUMEN.hasta='';RESUMEN.serv={apresto:false,intermediacion:false,formacion:false};RESUMEN.todos=true;RESUMEN.q=''; resumenPintar(); }

function _atFechaHora(a){
  const iso=String(a.created_at||''); const d=new Date(iso);
  const f=(typeof AMForm!=='undefined')?AMForm.fmtFechaDMY(iso.slice(0,10)):iso.slice(0,10);
  const h=isNaN(d)?'':String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  return {f,h,iso:iso.slice(0,10)};
}
function resumenFiltradas(){
  const q=(RESUMEN.q||'').toLowerCase().trim(), s=RESUMEN.serv;
  return (RESUMEN.atenciones||[]).filter(a=>{
    const iso=String(a.created_at||'').slice(0,10);
    if(RESUMEN.desde && iso<RESUMEN.desde) return false;
    if(RESUMEN.hasta && iso>RESUMEN.hasta) return false;
    if(!RESUMEN.todos){ // debe incluir TODOS los servicios marcados (combinación)
      if(s.apresto && !a.apresto) return false;
      if(s.intermediacion && !a.intermediacion) return false;
      if(s.formacion && !a.formacion) return false;
    }
    if(q && ![a.nombre,a.rut].join(' ').toLowerCase().includes(q)) return false;
    return true;
  });
}
function resumenAplicar(){
  const el=document.getElementById('rsmTabla'); if(!el) return;
  const list=resumenFiltradas();
  if(!list.length){ el.innerHTML='<div class="rc-nota" style="text-align:center;padding:18px">Sin atenciones para el filtro.</div>'; return; }
  const sn=v=>v?'<span class="rsm-si">Sí</span>':'<span class="rsm-no">No</span>';
  el.innerHTML=`<div class="rsm-count">${list.length} atención(es)</div>
   <div class="rsm-wrap"><table class="rsm-table">
    <thead><tr><th>Fecha</th><th>Hora</th><th>RUT</th><th>Nombre</th><th>Apr.</th><th>Int.</th><th>For.</th><th>Operativo</th><th>Atendió</th><th>Estado</th><th></th></tr></thead>
    <tbody>${list.map(a=>{ const fh=_atFechaHora(a);
      const op=RESUMEN.operativos[a.operativo_id]; const opt=op?((op.lugar||'')+(op.comuna?(' · '+op.comuna):'')):(a.operativo_id?'—':'');
      return `<tr>
        <td>${esc(fh.f)}</td><td>${esc(fh.h)}</td>
        <td>${esc(a.rut||'')}</td><td>${esc(a.nombre||'')}</td>
        <td class="rsm-c">${sn(a.apresto)}</td><td class="rsm-c">${sn(a.intermediacion)}</td><td class="rsm-c">${sn(a.formacion)}</td>
        <td class="rsm-op">${esc(opt)}</td>
        <td>${esc((a.ejecutivo||'').split('@')[0])}</td>
        <td><span class="rsm-estado">${esc(a.estado_registro||'Activo')}</span></td>
        <td class="rsm-acc"><button class="btn gray" onclick="resumenDetalle('${a.atencion_id}')">Ver</button>${a.rut?`<button class="btn sec" onclick="movHistorialAbrir('${esc(normRut(a.rut))}')">Historial</button>`:''}</td>
      </tr>`; }).join('')}</tbody></table></div>`;
}
function resumenDetalle(id){
  const a=(RESUMEN.atenciones||[]).find(x=>x.atencion_id===id); if(!a||typeof imModal!=='function') return;
  const fh=_atFechaHora(a);
  const serv=[a.apresto&&'Apresto',a.intermediacion&&'Intermediación',a.formacion&&'Formación'].filter(Boolean).join(', ')||'—';
  const op=RESUMEN.operativos[a.operativo_id];
  imModal(`<h3>Atención · ${esc(fh.f)} ${esc(fh.h)}</h3>
    <div class="rsm-det">
      <div><b>Persona:</b> ${esc(a.nombre||'—')}${a.rut?(' · '+esc(a.rut)):''}</div>
      <div><b>Comuna:</b> ${esc(a.comuna||'—')}${a.localidad?(' · '+esc(a.localidad)):''}</div>
      <div><b>Servicios:</b> ${esc(serv)}</div>
      <div><b>Atendió:</b> ${esc(a.ejecutivo||'—')}</div>
      <div><b>Operativo:</b> ${op?esc((op.lugar||'')+(op.comuna?(' · '+op.comuna):'')):(a.operativo_id?'(sin datos)':'—')}</div>
      ${a.nivel_estudios?`<div><b>Nivel de estudios:</b> ${esc(a.nivel_estudios)}</div>`:''}
      ${a.resultado?`<div><b>Resultado:</b> ${esc(a.resultado)}</div>`:''}
      ${a.comentario?`<div class="rsm-com"><b>Comentario de la visita:</b> ${esc(a.comentario)}</div>`:''}
    </div>
    <div class="btn-row" style="justify-content:flex-end;margin-top:12px">
      ${a.rut?`<button class="btn sec" onclick="imCerrar();movHistorialAbrir('${esc(normRut(a.rut))}')">Ver historial de la persona</button>`:''}
      <button class="btn gray" onclick="imCerrar()">Cerrar</button></div>`);
}

// ═══════════ HISTORIAL DE LA PERSONA (#15) ═══════════
function movHistorialAtenciones(rutNorm){
  return (RESUMEN.atenciones||[]).filter(a=>normRut(a.rut)===rutNorm)
    .sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')));
}
// Resumen compacto de la última atención, para mostrar al cargar una persona.
function movUltimaAtencion(rutNorm){ return movHistorialAtenciones(rutNorm)[0]||null; }
function movHistorialAbrir(rutNorm){
  if(typeof imModal!=='function') return;
  const list=movHistorialAtenciones(rutNorm);
  const per=LEVANTADOS.find(c=>normRut(c.rut)===rutNorm);
  const nom=per?((per.nombres||'')+' '+(per.apellidos||'')).trim():((list[0]&&list[0].nombre)||'');
  const filas=list.map(a=>{ const fh=_atFechaHora(a);
    const serv=[a.apresto&&'Apresto',a.intermediacion&&'Intermediación',a.formacion&&'Formación'].filter(Boolean).join(', ')||'—';
    return `<div class="hist-item"><div class="hist-top"><b>${esc(fh.f)} ${esc(fh.h)}</b> · ${esc((a.ejecutivo||'').split('@')[0]||'—')}</div>
      <div class="hist-serv">${esc(serv)}</div>
      ${a.comentario?`<div class="hist-com">💬 ${esc(a.comentario)}</div>`:''}</div>`; }).join('');
  imModal(`<h3>Historial de ${esc(nom||'la persona')} (${list.length})</h3>
    ${list.length?filas:'<div class="rc-nota">Sin atenciones previas registradas.</div>'}
    <div class="btn-row" style="justify-content:flex-end;margin-top:12px"><button class="btn gray" onclick="imCerrar()">Cerrar</button></div>`);
}

// (El móvil ya no carga CV por archivo ni genera CV PDF — requerimientos #6 y #7.
//  La creación del CV se hace por el link de apresto; el PDF se arma en
//  Empleabilidad con el generador Harvard compartido.)
