// ═══════════════════════════════════════════════════════════════════════════
// movil-recepcion.js — Recepción con encuesta que deriva a 3 rutas (Fase C)
// Sistema AM · Antofagasta Minerals
//
// Al visitante SIEMPRE se le recibe con una encuesta que lo deriva a:
//   1. Apresto laboral   → link para CREAR su CV (Fase B, tabla cv_links)
//   2. Intermediación     → vacantes disponibles y derivación (Fase A)
//   3. Formación          → inscripción a un curso (tablas cursos / formaciones)
//
// El cuestionario COMPLETO va desplegable bajo la encuesta breve. Al guardar la
// atención se registra una fila en `atenciones` (día/hora automáticos, comuna,
// sexo, y qué servicios se hicieron) que alimenta el dashboard del Cuestionario.
//
// Reutiliza globales del Móvil: SB, ACTUAL, CUEST, esc, toast, miNombre, movTab.
// <script src> clásico, nunca type="module" (CLAUDE.md §6). Prefijo rc/RC.
// ═══════════════════════════════════════════════════════════════════════════

let RC = { servicio:null, vacantes:[], vacLoaded:false, cursos:[], curLoaded:false,
           did:{apresto:false,intermediacion:false,formacion:false}, cuestAbierto:false };

function rcVal(id){ const e=document.getElementById(id); return e?e.value.trim():''; }
function rcPersona(){ return { rut:rcVal('rcRut'), nombre:rcVal('rcNombre'), telefono:rcVal('rcTel'), comuna:rcVal('rcComuna'), sexo:rcVal('rcSexo') }; }

function rcRender(){
  const cont=document.getElementById('page-recepcion'); if(!cont) return;
  const a=ACTUAL||{};
  const rut=(a.rut)||'', nom=[a.nombres,a.apellidos].filter(Boolean).join(' '), tel=a.telefono||'', com=a.comuna||'', sx=a.sexo||'';
  cont.innerHTML=`
    <div class="card card-ancho">
      <div class="sec-t">🎯 Recepción · ¿a quién atiendes?</div>
      <div class="g2">
        <div class="fld"><label>RUT</label><input id="rcRut" value="${esc(rut)}" placeholder="12.345.678-9"></div>
        <div class="fld"><label>Nombre y apellido</label><input id="rcNombre" value="${esc(nom)}"></div>
      </div>
      <div class="g2">
        <div class="fld"><label>Teléfono</label><input id="rcTel" value="${esc(tel)}" inputmode="tel"></div>
        <div class="fld"><label>Comuna</label><input id="rcComuna" value="${esc(com)}"></div>
      </div>
      <div class="fld"><label>Sexo</label><select id="rcSexo"><option value="">—</option>
        <option ${sx==='Femenino'?'selected':''}>Femenino</option><option ${sx==='Masculino'?'selected':''}>Masculino</option><option ${sx==='Otro'?'selected':''}>Otro</option></select></div>
      <div class="rc-nota">Para el CV completo puedes ir a <span class="rc-link" onclick="movTab('captura',document.querySelector('.navtabs button[data-p=captura]'))">👤 Captura</span>.</div>
    </div>

    <div class="card">
      <div class="sec-t">📋 Encuesta breve</div>
      <div class="g2">
        <div class="fld"><label>Situación laboral</label>
          <select id="rcSituacion"><option value="">—</option><option>Empleado dependiente</option><option>Independiente</option><option>Informal</option><option>Cesante</option></select></div>
        <div class="fld"><label>¿Le gustaría capacitarse?</label>
          <select id="rcCapacitar"><option value="">—</option><option>Sí</option><option>No</option></select></div>
      </div>
      <div class="fld"><label>¿Qué servicio necesita? — deriva la atención</label></div>
      <div class="rc-serv">
        <button class="rc-serv-btn ${RC.servicio==='apresto'?'on':''}" onclick="rcSetServicio('apresto')">
          <div class="rc-serv-ic">📝</div><b>Apresto laboral</b><span>Crear su CV y preparar entrevista</span></button>
        <button class="rc-serv-btn ${RC.servicio==='intermediacion'?'on':''}" onclick="rcSetServicio('intermediacion')">
          <div class="rc-serv-ic">🔗</div><b>Intermediación</b><span>Derivar a un puesto disponible</span></button>
        <button class="rc-serv-btn ${RC.servicio==='formacion'?'on':''}" onclick="rcSetServicio('formacion')">
          <div class="rc-serv-ic">🎓</div><b>Formación</b><span>Inscribir en un curso</span></button>
      </div>
    </div>

    <div id="rcPanel"></div>

    <div class="card">
      <div class="rc-cuest-head" onclick="rcToggleCuest()">
        <div class="sec-t" style="margin:0">📝 Cuestionario completo</div>
        <span class="rc-caret" id="rcCaret">${RC.cuestAbierto?'▲':'▼'}</span>
      </div>
      <div id="rcCuestBody" style="${RC.cuestAbierto?'':'display:none'}">
        <div class="q-help">Se guarda con la atención. Puedes dejarlo incompleto.</div>
        ${rcCuestHTML()}
      </div>
    </div>

    <div class="btn-row btn-row-final">
      <button class="btn" onclick="rcGuardarAtencion()">💾 Guardar atención</button>
    </div>`;
  rcRenderPanel();
}

function rcToggleCuest(){ RC.cuestAbierto=!RC.cuestAbierto;
  const b=document.getElementById('rcCuestBody'), c=document.getElementById('rcCaret');
  if(b) b.style.display=RC.cuestAbierto?'':'none'; if(c) c.textContent=RC.cuestAbierto?'▲':'▼'; }

function rcCuestHTML(){
  // CUEST es global (definido en movil.js). Se rinde con ids rcq_<key>.
  const q=(ACTUAL&&ACTUAL.cuestionario)||{};
  return (typeof CUEST!=='undefined'?CUEST:[]).map(c=>{
    const val=q[c.k]||'';
    if(c.op) return `<div class="fld"><label>${esc(c.t)}</label><select id="rcq_${c.k}"><option value="">—</option>${c.op.map(o=>`<option ${o===val?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`;
    return `<div class="fld"><label>${esc(c.t)}</label><input id="rcq_${c.k}" value="${esc(val)}"></div>`;
  }).join('');
}
function rcLeerCuest(){
  const out={}; (typeof CUEST!=='undefined'?CUEST:[]).forEach(c=>{ const el=document.getElementById('rcq_'+c.k); if(el&&el.value) out[c.k]=el.value; });
  return out;
}

function rcSetServicio(s){ RC.servicio=s; document.querySelectorAll('.rc-serv-btn').forEach(b=>b.classList.toggle('on', b.getAttribute('onclick').includes("'"+s+"'"))); rcRenderPanel(); }
function rcRenderPanel(){
  const p=document.getElementById('rcPanel'); if(!p) return;
  if(RC.servicio==='apresto') p.innerHTML=rcAprestoHTML();
  else if(RC.servicio==='intermediacion'){ p.innerHTML=rcInterHTML(); if(RC.vacLoaded) rcRenderVacantes(); else rcCargarVacantes(); }
  else if(RC.servicio==='formacion'){ p.innerHTML=rcFormacionHTML(); if(RC.curLoaded) rcRenderCursos(); else rcCargarCursos(); }
  else p.innerHTML='';
}

// ── 1 · APRESTO → link para crear el CV ──────────────────────────────────────
function rcAprestoHTML(){
  return `<div class="card"><div class="sec-t">📝 Apresto laboral</div>
    <div class="rc-nota">Genera un link personal para que la persona <b>cree su CV</b> paso a paso (con ejemplos de qué poner) y lo descargue en PDF. Va por token; no expone el RUT.</div>
    <div class="btn-row"><button class="btn" onclick="rcGenerarLinkCV()">🔗 Generar link para crear CV</button></div>
    <div id="rcLinkOut"></div></div>`;
}
async function rcGenerarLinkCV(){
  const per=rcPersona(); if(!per.rut){ toast('Escribe el RUT','err'); return; }
  try{
    const {data,error}=await SB.from('cv_links').insert({rut:per.rut, nombre:per.nombre||null, created_by:miNombre()}).select('token').single();
    if(error) throw error;
    RC.did.apresto=true;
    const url=location.origin+'/modules/empleabilidad/armar-cv.html?t='+data.token;
    document.getElementById('rcLinkOut').innerHTML=`<div class="rc-nota" style="margin-top:10px">Link generado:</div>
      <div style="display:flex;gap:8px"><input id="rcLinkUrl" readonly value="${esc(url)}" style="flex:1">
      <button class="btn sec" onclick="rcCopiar('rcLinkUrl')">Copiar</button></div>
      <div class="rc-nota"><a href="${esc(url)}" target="_blank" rel="noopener">Abrir el creador de CV ↗</a></div>`;
    toast('✅ Link de apresto creado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ── 2 · INTERMEDIACIÓN → vacantes + derivar ──────────────────────────────────
function rcInterHTML(){
  return `<div class="card"><div class="sec-t">🔗 Intermediación laboral</div>
    <div class="rc-nota">Deriva a la persona a un puesto disponible. Necesita su CV (usa el link de apresto o cárgalo en Captura).</div>
    <input class="search" id="rcVacBuscar" placeholder="🔍 Buscar cargo o empresa" oninput="rcRenderVacantes()">
    <div id="rcVacLista"><div class="rc-nota">Cargando vacantes…</div></div></div>`;
}
async function rcCargarVacantes(){
  try{ const {data,error}=await SB.from('vacantes').select('*').neq('estado_registro','Eliminado').neq('estado','cerrada').order('created_at',{ascending:false});
    if(error) throw error; RC.vacantes=data||[]; RC.vacLoaded=true; rcRenderVacantes();
  }catch(e){ const l=document.getElementById('rcVacLista'); if(l) l.innerHTML='<div class="rc-nota">Error: '+esc(e.message)+'</div>'; }
}
function rcRenderVacantes(){
  const l=document.getElementById('rcVacLista'); if(!l) return;
  const q=(rcVal('rcVacBuscar')||'').toLowerCase();
  const lista=RC.vacantes.filter(v=>!q||[v.cargo,v.empresa,v.compania].join(' ').toLowerCase().includes(q));
  l.innerHTML=!lista.length?'<div class="rc-nota">Sin vacantes abiertas.</div>'
    :lista.map(v=>`<div class="rc-vac">
      <div><div class="rc-vac-cargo">${esc(v.cargo||'Cargo')}</div>
        <div class="rc-vac-emp">${esc(v.empresa||'')}${v.compania?' · '+esc(v.compania):''}${v.codigo_puesto?' · '+esc(v.codigo_puesto):''}</div></div>
      <button class="btn sec" onclick="rcDerivar('${v.vacante_id}')">Derivar</button>
    </div>`).join('');
}
async function rcDerivar(vacanteId){
  const per=rcPersona(); if(!per.rut && !per.nombre){ toast('Identifica a la persona (RUT o nombre)','err'); return; }
  const v=RC.vacantes.find(x=>x.vacante_id===vacanteId); if(!v) return;
  const partes=(per.nombre||'').split(' ');
  try{
    const {error}=await SB.from('derivaciones').insert({
      derivacion_id:'der_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),
      vacante_id:vacanteId, cargo_txt:v.cargo, rut:per.rut||null,
      nombre:partes[0]||null, apellidos:partes.slice(1).join(' ')||null, telefono:per.telefono||null,
      eecc:v.empresa||null, localidad:per.comuna||v.residencia||null,
      estado:'registrada', fecha_derivacion:new Date().toISOString().slice(0,10),
      derivado_por:miNombre(), created_by:miNombre() });
    if(error) throw error;
    RC.did.intermediacion=true;
    toast('✅ Derivado a '+(v.cargo||'la vacante'),'ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ── 3 · FORMACIÓN → cursos + inscribir ───────────────────────────────────────
function rcFormacionHTML(){
  return `<div class="card"><div class="sec-t">🎓 Formación</div>
    <div class="rc-nota">Inscribe a la persona en un curso disponible.</div>
    <input class="search" id="rcCurBuscar" placeholder="🔍 Buscar curso" oninput="rcRenderCursos()">
    <div id="rcCurLista"><div class="rc-nota">Cargando cursos…</div></div></div>`;
}
async function rcCargarCursos(){
  try{ const {data,error}=await SB.from('cursos').select('*').neq('estado_registro','Eliminado').neq('estado','cerrado').order('created_at',{ascending:false});
    if(error) throw error; RC.cursos=data||[]; RC.curLoaded=true; rcRenderCursos();
  }catch(e){ const l=document.getElementById('rcCurLista'); if(l) l.innerHTML='<div class="rc-nota">Error: '+esc(e.message)+'</div>'; }
}
function rcRenderCursos(){
  const l=document.getElementById('rcCurLista'); if(!l) return;
  const q=(rcVal('rcCurBuscar')||'').toLowerCase();
  const lista=RC.cursos.filter(c=>!q||[c.nombre,c.institucion,c.area].join(' ').toLowerCase().includes(q));
  l.innerHTML=!lista.length?'<div class="rc-nota">Sin cursos abiertos. Créalos en Empleabilidad → Formación.</div>'
    :lista.map(c=>`<div class="rc-vac">
      <div><div class="rc-vac-cargo">${esc(c.nombre||'Curso')}</div>
        <div class="rc-vac-emp">${esc(c.institucion||'')}${c.modalidad?' · '+esc(c.modalidad):''}${c.ruta==='amsa'?' · AMSA':' · EECC'}</div></div>
      <button class="btn sec" onclick="rcInscribirCurso('${c.curso_id}')">Inscribir</button>
    </div>`).join('');
}
async function rcInscribirCurso(cursoId){
  const per=rcPersona(); if(!per.rut && !per.nombre){ toast('Identifica a la persona','err'); return; }
  const c=RC.cursos.find(x=>x.curso_id===cursoId); if(!c) return;
  try{
    const {error}=await SB.from('formaciones').insert({
      formacion_id:'form_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),
      curso_id:cursoId, rut:per.rut||null, nombre:per.nombre||null, telefono:per.telefono||null, comuna:per.comuna||null,
      ruta:c.ruta||'amsa', tipo:c.nombre, registrado_por:miNombre() });
    if(error) throw error;
    RC.did.formacion=true;
    toast('✅ Inscrito en '+(c.nombre||'el curso'),'ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ── Guardar la atención (alimenta el dashboard) ──────────────────────────────
async function rcGuardarAtencion(){
  const per=rcPersona();
  if(!per.rut && !per.nombre){ toast('Identifica a la persona (RUT o nombre)','err'); return; }
  const cuest=rcLeerCuest();
  const totalQ=(typeof CUEST!=='undefined'?CUEST:[]).length||1;
  const completo = Object.keys(cuest).length >= Math.ceil(totalQ*0.7);
  const partes=(per.nombre||'').split(' ');
  try{
    const {error}=await SB.from('atenciones').insert({
      atencion_id:'at_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),
      cv_id:(ACTUAL&&ACTUAL.cv_id)||null, rut:per.rut||null, nombre:per.nombre||null,
      comuna:per.comuna||null, sexo:per.sexo||null,
      apresto:RC.did.apresto, intermediacion:RC.did.intermediacion, formacion:RC.did.formacion,
      cuestionario_completo:completo, cuestionario_json:JSON.stringify(cuest), ejecutivo:miNombre() });
    if(error) throw error;
    // Si hay una persona cargada, también deja el cuestionario en su ficha.
    if(ACTUAL && ACTUAL.cv_id && Object.keys(cuest).length){
      try{ await SB.from('cv_personas').update({cuestionario_json:JSON.stringify(cuest),updated_at:new Date().toISOString()}).eq('cv_id',ACTUAL.cv_id); }catch(e){}
    }
    toast('✅ Atención guardada','ok');
    RC.did={apresto:false,intermediacion:false,formacion:false}; RC.servicio=null; rcRender();
  }catch(e){ toast('Error al guardar: '+e.message,'err'); }
}

function rcCopiar(id){ const i=document.getElementById(id); if(!i) return; i.select();
  try{ navigator.clipboard.writeText(i.value); }catch(e){ try{document.execCommand('copy');}catch(_){} } toast('🔗 Copiado','ok'); }
