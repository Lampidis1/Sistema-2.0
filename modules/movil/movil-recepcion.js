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

let RC = { servicios:{apresto:false,intermediacion:false,formacion:false},
           vacantes:[], vacLoaded:false, cursos:[], curLoaded:false, cvPdf:null,
           did:{apresto:false,intermediacion:false,formacion:false}, cuestAbierto:false,
           homolog:{mineria:'',contra:'',exam:''}, formTab:'inscripcion' };

// Preguntas HOMOLOGABLES (van en Intermediación y Formación; si se responden en
// una, se precargan en la otra). Se cargan de la ficha de la persona (cv_personas).
function rcHomologCargar(){
  const a=(typeof ACTUAL!=='undefined'&&ACTUAL)||{};
  if(!RC.homolog.mineria && a.exp_mineria) RC.homolog.mineria=a.exp_mineria;
  if(!RC.homolog.contra && a.contraindicacion_medica) RC.homolog.contra=a.contraindicacion_medica;
  if(!RC.homolog.exam && a.examenes_preocupacionales) RC.homolog.exam=a.examenes_preocupacionales;
}
const RC_CONTRA=['No presenta','Hipertensión','Diabetes','Alergias','Problemas cardíacos','Asma u otra enfermedad respiratoria','Condición musculoesquelética','En tratamiento médico activo','Otras'];
const RC_EXAM=['Sí, cuenta con disponibilidad total','Sí, con ciertas restricciones','No, no cuenta con disponibilidad'];
function rcHomologHTML(pref){
  const h=RC.homolog;
  const opt=(arr,val)=>'<option value="">—</option>'+arr.map(o=>`<option ${o===val?'selected':''}>${esc(o)}</option>`).join('');
  return `<div class="rc-homolog">
    <div class="rc-nota" style="margin:0 0 4px"><b>Datos comunes</b> (se comparten con el otro servicio)</div>
    <div class="fld"><label>¿Experiencia en minería?</label>
      <select id="${pref}_min" onchange="RC.homolog.mineria=this.value;rcHomologSync('${pref}')"><option value="">—</option><option ${h.mineria==='Sí'?'selected':''}>Sí</option><option ${h.mineria==='No'?'selected':''}>No</option></select></div>
    <div class="fld"><label>¿Presenta alguna contraindicación médica actualmente?</label>
      <select id="${pref}_contra" onchange="RC.homolog.contra=this.value;rcHomologSync('${pref}')">${opt(RC_CONTRA,h.contra)}</select></div>
    <div class="fld"><label>¿Cuenta con disponibilidad para exámenes preocupacionales?</label>
      <select id="${pref}_exam" onchange="RC.homolog.exam=this.value;rcHomologSync('${pref}')">${opt(RC_EXAM,h.exam)}</select></div>
  </div>`;
}
// Refleja el cambio en el otro apartado si está visible.
function rcHomologSync(from){
  ['inter','form'].filter(p=>p!==from).forEach(p=>{
    const m=document.getElementById(p+'_min'), c=document.getElementById(p+'_contra'), e=document.getElementById(p+'_exam');
    if(m) m.value=RC.homolog.mineria||''; if(c) c.value=RC.homolog.contra||''; if(e) e.value=RC.homolog.exam||'';
  });
}

function rcVal(id){ const e=document.getElementById(id); return e?e.value.trim():''; }
// La persona sale de los campos de identificación (ya estáticos en la página).
function rcPersona(){ return { rut:rcVal('cRut'), nombre:[rcVal('fNombres'),rcVal('fApellidos')].filter(Boolean).join(' '),
  telefono:rcVal('fTel'), comuna:rcVal('fComuna'), sexo:rcVal('fSexo') }; }

// Desplegable "Datos completos del CV" (el contenido es estático en el HTML).
function rcToggleDatos(){ const b=document.getElementById('rcDatosBody'), c=document.getElementById('rcDatosCaret'); if(!b) return;
  const abrir=b.style.display==='none'; b.style.display=abrir?'':'none'; if(c) c.textContent=abrir?'▲':'▼'; }

// rcRender ahora solo pinta la parte dinámica (#rcBody): encuesta, servicios y
// cuestionario. La identificación y los datos completos son estáticos.
function rcRender(){
  const cont=document.getElementById('rcBody'); if(!cont) return;
  cont.innerHTML=`
    <div class="card">
      <div class="sec-t">¿Qué servicio necesita? — deriva la atención</div>
      <div class="rc-nota">Marca uno o más. Se registran los servicios que se le harán a la persona.</div>
      <div id="rcElegMsg" class="rc-eleg"></div>
      <div class="rc-serv">
        ${rcServChk('apresto','📝','Apresto laboral','Crear su CV y preparar entrevista')}
        ${rcServChk('intermediacion','🔗','Intermediación','Derivar a un puesto disponible')}
        ${rcServChk('formacion','🎓','Formación','Inscribir en curso / capacitación')}
      </div>
    </div>

    <div id="rcPaneles"></div>

    <div class="card">
      <div class="rc-cuest-head" onclick="rcToggleCuest()">
        <div class="sec-t" style="margin:0">📝 Cuestionario complementario</div>
        <span class="rc-caret" id="rcCaret">${RC.cuestAbierto?'▲':'▼'}</span>
      </div>
      <div id="rcCuestBody" style="${RC.cuestAbierto?'':'display:none'}">
        <div class="q-help">Se guarda con la atención. Puedes dejarlo incompleto.</div>
        ${rcCuestHTML()}
      </div>
    </div>

    <div class="btn-row btn-row-final">
      <button class="btn" onclick="rcGuardarTodo()">💾 Guardar atención</button>
    </div>`;
  rcEjecutivoMostrar();
  rcEligibilidad();
}

// Casilla de un servicio (marcable), con candado si está bloqueado.
function rcServChk(s,ico,tit,sub){
  return `<label class="rc-serv-btn ${RC.servicios[s]?'on':''}" id="rcSrv_${s}">
    <input type="checkbox" ${RC.servicios[s]?'checked':''} onchange="rcToggleServicio('${s}',this.checked)">
    <div class="rc-serv-ic">${ico}</div><b>${esc(tit)}</b><span>${esc(sub)}</span>
    <span class="rc-serv-lock" id="rcLock_${s}"></span></label>`;
}
function rcEjecutivoMostrar(){
  const e=document.getElementById('rcEjecutivo');
  if(e) e.innerHTML='👤 Atiende: <b>'+esc((typeof miNombre==='function'&&miNombre())||'')+'</b>';
}

// ── Elegibilidad: nacionalidad / residencia / nivel de estudios ──────────────
// · Extranjero/a sin residencia definitiva → solo Apresto.
// · Nivel «Básica completa» → bloquea Intermediación.
function rcEligibilidad(){
  const val=id=>{ const e=document.getElementById(id); return e?e.value:''; };
  const nac=val('fNacion'), resid=val('fResid'), est=val('fEstudios');
  const extranjero=!!nac && !/chilen/i.test(nac);
  const rowR=document.getElementById('rowResid'); if(rowR) rowR.style.display=extranjero?'':'none';
  const residOK = !extranjero || resid==='Sí';
  const basica = est==='Básica completa';
  const reglas={
    apresto:       { ok:true, motivo:'' },
    intermediacion:{ ok: residOK && !basica, motivo: !residOK?'Requiere residencia definitiva':(basica?'Requiere sobre básica completa':'') },
    formacion:     { ok: residOK, motivo: !residOK?'Requiere residencia definitiva':'' }
  };
  ['apresto','intermediacion','formacion'].forEach(s=>{
    const lab=document.getElementById('rcSrv_'+s), lock=document.getElementById('rcLock_'+s);
    if(!lab) return;
    const inp=lab.querySelector('input');
    if(!reglas[s].ok){
      lab.classList.add('bloq');
      if(inp){ inp.disabled=true; if(inp.checked){ inp.checked=false; RC.servicios[s]=false; lab.classList.remove('on'); } }
      if(lock) lock.textContent='🔒 '+reglas[s].motivo;
    }else{
      lab.classList.remove('bloq'); if(inp) inp.disabled=false; if(lock) lock.textContent='';
    }
  });
  const msg=document.getElementById('rcElegMsg');
  if(msg) msg.innerHTML = (extranjero && !residOK)
    ? '⚠ Persona extranjera sin residencia definitiva: solo <b>Apresto laboral</b>.'
    : (basica ? 'ⓘ Nivel «Básica completa»: <b>Intermediación</b> bloqueada.' : '');
  rcRenderPaneles();
}
function rcToggleServicio(s,val){
  RC.servicios[s]=!!val;
  const l=document.getElementById('rcSrv_'+s); if(l) l.classList.toggle('on',!!val);
  rcRenderPaneles();
}
function rcRenderPaneles(){
  const p=document.getElementById('rcPaneles'); if(!p) return;
  rcHomologCargar();
  let h='';
  if(RC.servicios.apresto)        h+=rcAprestoHTML();
  if(RC.servicios.intermediacion) h+=rcInterHTML();
  if(RC.servicios.formacion)      h+=rcFormacionHTML();
  p.innerHTML=h;
  if(RC.servicios.intermediacion){ if(RC.vacLoaded) rcRenderVacantes(); else rcCargarVacantes(); }
  if(RC.servicios.formacion){ if(RC.curLoaded) rcRenderCursos(); else rcCargarCursos(); }
}

// Guarda el CV completo (cv_personas) y la atención en un solo paso, para que no
// se pierdan datos al cruzar entre secciones.
async function rcGuardarTodo(){
  if(!rcVal('fNombres') && !rcVal('fApellidos') && !rcVal('cRut')){ toast('Identifica a la persona (RUT o nombre)','err'); return; }
  if(typeof guardarRegistro==='function'){ try{ await guardarRegistro(); }catch(e){} }
  await rcGuardarAtencion();
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
    // Persiste lo ya escrito en la ficha (RUT, nombre, correo, teléfono, comuna,
    // etc.) ANTES de generar el link, para que la persona lo abra con esos datos
    // precargados. Regla 5: nada viaja en la URL; el token los trae desde Supabase.
    let cvId=null;
    if((rcVal('fNombres')||rcVal('fApellidos')) && typeof guardarRegistro==='function'){
      try{ await guardarRegistro(); }catch(e){}
      cvId=(typeof ACTUAL!=='undefined'&&ACTUAL&&ACTUAL.cv_id)||null;
    }
    const {data,error}=await SB.from('cv_links').insert({rut:per.rut, nombre:per.nombre||null, cv_id:cvId, created_by:miNombre()}).select('token').single();
    if(error) throw error;
    RC.did.apresto=true;
    const url=location.origin+'/modules/empleabilidad/armar-cv.html?t='+data.token;
    document.getElementById('rcLinkOut').innerHTML=`
      <div class="rc-qr-box">
        <div class="rc-qr" id="rcQR"></div>
        <div class="rc-qr-side">
          <div class="rc-nota" style="margin:0 0 6px"><b>La persona escanea el QR</b> con su cámara y arma su CV en el teléfono.</div>
          <div class="rc-linkrow"><input id="rcLinkUrl" readonly value="${esc(url)}" onclick="this.select()">
            <button class="btn sec" onclick="rcCopiar('rcLinkUrl')">Copiar</button></div>
          <div class="btn-row" style="margin-top:8px">
            <button class="btn gray" onclick="window.open('${esc(url)}','_blank','noopener')">🖥 Abrir en otra pestaña</button>
          </div>
        </div>
      </div>`;
    // Genera el QR (qrcodejs, sin servicios externos: dibuja en canvas local)
    const qc=document.getElementById('rcQR');
    if(qc && typeof QRCode!=='undefined'){ qc.innerHTML=''; new QRCode(qc,{text:url,width:150,height:150,correctLevel:QRCode.CorrectLevel.M}); }
    toast('✅ Link de apresto creado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ── 2 · INTERMEDIACIÓN → vacantes + derivar ──────────────────────────────────
function rcInterHTML(){
  return `<div class="card"><div class="sec-t">🔗 Intermediación laboral</div>
    <div class="rc-nota">Deriva a la persona a un puesto. El CV va con la derivación: el de <b>apresto</b> o un <b>PDF</b> que cargues.</div>
    <div id="rcCvBlock"></div>
    <input class="search" id="rcVacBuscar" placeholder="🔍 Buscar cargo o empresa" oninput="rcRenderVacantes()">
    <div id="rcVacLista"><div class="rc-nota">Cargando vacantes…</div></div>
    ${rcHomologHTML('inter')}</div>`;
}
// Estado del CV que se adjuntará al derivar (apresto y/o PDF cargado).
function rcCvRender(){
  const el=document.getElementById('rcCvBlock'); if(!el) return;
  const tieneApresto = !!(typeof ACTUAL!=='undefined' && ACTUAL && ACTUAL.cv_id);
  el.innerHTML=`<div class="rc-cvblock">
    <div class="rc-cv-txt">${tieneApresto?'✓ <b>CV de apresto</b> disponible':'Sin CV de apresto'}${RC.cvPdf?` · 📄 <b>${esc(RC.cvPdf.name)}</b>`:''}</div>
    <button class="btn gray" onclick="document.getElementById('rcCvFile').click()">📄 ${RC.cvPdf?'Cambiar PDF':'Cargar CV (PDF)'}</button>
    <input type="file" id="rcCvFile" accept="application/pdf" style="display:none" onchange="rcCargarCVpdf(this.files)">
  </div>`;
}
async function rcCargarCVpdf(files){
  const f=files&&files[0]; if(!f) return;
  if(f.type!=='application/pdf'){ toast('Solo se acepta PDF','err'); return; }
  if(f.size>10*1024*1024){ toast('El PDF supera los 10 MB','err'); return; }
  const per=rcPersona();
  try{
    toast('Subiendo CV…');
    const rc=String(per.rut||'').replace(/[^0-9kK]/g,'')||('x'+Date.now());
    const path='cv/derivaciones/'+rc+'/'+Date.now()+'_'+Math.random().toString(36).slice(2,6)+'.pdf';
    const {error:up}=await SB.storage.from('documentos').upload(path,f,{upsert:false,contentType:'application/pdf'});
    if(up) throw up;
    const {data:sg,error:se}=await SB.storage.from('documentos').createSignedUrl(path,31536000); // 1 año
    if(se) throw se;
    RC.cvPdf={url:sg.signedUrl, name:f.name, path};
    rcCvRender(); toast('✅ CV en PDF cargado','ok');
  }catch(e){ toast('Error al subir: '+e.message,'err'); }
}
async function rcCargarVacantes(){
  try{ const {data,error}=await SB.from('vacantes').select('*').neq('estado_registro','Eliminado').neq('estado','cerrada').order('created_at',{ascending:false});
    if(error) throw error; RC.vacantes=data||[]; RC.vacLoaded=true; rcCvRender(); rcRenderVacantes();
  }catch(e){ const l=document.getElementById('rcVacLista'); if(l) l.innerHTML='<div class="rc-nota">Error: '+esc(e.message)+'</div>'; }
}
function _rcComps(v){ try{ return JSON.parse(v.competencias_json||'[]')||[]; }catch(e){ return []; } }
function rcRenderVacantes(){
  const l=document.getElementById('rcVacLista'); if(!l) return;
  rcCvRender();
  const q=(rcVal('rcVacBuscar')||'').toLowerCase();
  const lista=RC.vacantes.filter(v=>!q||[v.cargo,v.empresa,v.compania].join(' ').toLowerCase().includes(q));
  l.innerHTML=!lista.length?'<div class="rc-nota">Sin vacantes abiertas.</div>'
    :lista.map(v=>{
      const det=[v.turno&&('Turno '+v.turno), v.residencia, v.formacion&&('Formación: '+v.formacion), v.n_vacantes&&(v.n_vacantes+' cupo(s)')].filter(Boolean);
      const comps=_rcComps(v);
      return `<div class="rc-vac-wrap">
        <div class="rc-vac">
          <div><div class="rc-vac-cargo">${esc(v.cargo||'Cargo')}</div>
            <div class="rc-vac-emp">${esc(v.empresa||'')}${v.compania?' · '+esc(v.compania):''}${v.codigo_puesto?' · '+esc(v.codigo_puesto):''}</div></div>
          <div class="rc-vac-btns">
            <button class="btn gray" onclick="rcVacDet('${v.vacante_id}')">ⓘ Detalle</button>
            <button class="btn sec" onclick="rcDerivar('${v.vacante_id}')">Derivar</button></div>
        </div>
        <div class="rc-vac-det" id="rcVacDet_${v.vacante_id}" style="display:none">
          ${v.descripcion?`<div>${esc(v.descripcion)}</div>`:''}
          ${det.length?`<div class="rc-vac-meta">${det.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}
          ${v.datos_adicionales?`<div><b>Datos adicionales:</b> ${esc(v.datos_adicionales)}</div>`:''}
          ${comps.length?`<div class="rc-vac-comps">${comps.map(c=>`<span class="${c.excluyente?'exc':''}">${c.excluyente?'⛔ ':''}${esc(c.texto||'')}</span>`).join('')}</div>`:''}
          ${!v.descripcion&&!det.length&&!v.datos_adicionales&&!comps.length?'<div class="rc-nota" style="margin:0">Sin más detalle cargado.</div>':''}
        </div>
      </div>`;
    }).join('');
}
function rcVacDet(id){ const d=document.getElementById('rcVacDet_'+id); if(d) d.style.display=d.style.display==='none'?'':'none'; }
async function rcDerivar(vacanteId){
  const per=rcPersona(); if(!per.rut && !per.nombre){ toast('Identifica a la persona (RUT o nombre)','err'); return; }
  const v=RC.vacantes.find(x=>x.vacante_id===vacanteId); if(!v) return;
  const partes=(per.nombre||'').split(' ');
  try{
    const {error}=await SB.from('derivaciones').insert({
      derivacion_id:'der_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),
      vacante_id:vacanteId, cargo_txt:v.cargo, rut:per.rut||null,
      cv_id:(typeof ACTUAL!=='undefined'&&ACTUAL&&ACTUAL.cv_id)||null,
      cv_pdf_url:(RC.cvPdf&&RC.cvPdf.url)||null,
      nombre:partes[0]||null, apellidos:partes.slice(1).join(' ')||null, telefono:per.telefono||null,
      eecc:v.empresa||null, localidad:per.comuna||v.residencia||null,
      estado:'registrada', fecha_derivacion:new Date().toISOString().slice(0,10),
      derivado_por:miNombre(), created_by:miNombre() });
    if(error) throw error;
    RC.did.intermediacion=true;
    toast('✅ Derivado a '+(v.cargo||'la vacante')+(RC.cvPdf?' (con CV PDF)':''),'ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ── 3 · FORMACIÓN → 2 apartados: Inscripción a cursos / Levantamiento ─────────
function rcFormacionHTML(){
  return `<div class="card"><div class="sec-t">🎓 Formación</div>
    <div class="rc-subtabs">
      <button class="rc-subtab ${RC.formTab==='inscripcion'?'on':''}" onclick="rcFormTab('inscripcion')">📋 Inscripción a cursos</button>
      <button class="rc-subtab ${RC.formTab==='levantamiento'?'on':''}" onclick="rcFormTab('levantamiento')">📝 Levantamiento de capacitación</button>
    </div>
    <div id="rcFormBody">${RC.formTab==='inscripcion'?rcInscripcionHTML():rcLevantamientoHTML()}</div>
  </div>`;
}
function rcFormTab(t){
  RC.formTab=t;
  const b=document.getElementById('rcFormBody');
  if(b){ b.innerHTML=t==='inscripcion'?rcInscripcionHTML():rcLevantamientoHTML();
    if(t==='inscripcion'){ if(RC.curLoaded) rcRenderCursos(); else rcCargarCursos(); } }
  document.querySelectorAll('.rc-subtab').forEach(x=>x.classList.toggle('on',
    x.textContent.includes(t==='inscripcion'?'Inscripción':'Levantamiento')));
}
function rcInscripcionHTML(){
  const puedeCrear=(typeof ES_ADMIN!=='undefined'&&ES_ADMIN);
  return `<div class="rc-nota">La persona postula a un curso difundido en el móvil (igual que la derivación a vacantes).</div>
    ${puedeCrear?'<div class="btn-row"><button class="btn" onclick="rcCursoNuevo()">➕ Crear curso</button></div>':''}
    <input class="search" id="rcCurBuscar" placeholder="🔍 Buscar curso" oninput="rcRenderCursos()">
    <div id="rcCurLista"><div class="rc-nota">Cargando cursos…</div></div>`;
}
function rcLevantamientoHTML(){
  return `<div class="rc-nota">Levantamiento del interés de capacitación de la persona (homologación del formulario).</div>
    <div class="fld"><label>Área de interés</label><input id="lvArea" placeholder="Operación, mantención, administración…"></div>
    <div class="g2">
      <div class="fld"><label>Modalidad preferida</label><select id="lvModal"><option value="">—</option><option>Presencial</option><option>Online</option><option>Mixta</option></select></div>
      <div class="fld"><label>Disponibilidad</label><select id="lvDisp"><option value="">—</option><option>Inmediata</option><option>Por turnos</option><option>Fines de semana</option><option>Horario limitado</option></select></div>
    </div>
    ${rcHomologHTML('form')}
    <div class="fld"><label>Comentario</label><textarea id="lvComent" rows="2"></textarea></div>
    <div class="btn-row"><button class="btn" onclick="rcGuardarLevantamiento()">💾 Guardar levantamiento</button></div>`;
}
async function rcCargarCursos(){
  try{ const {data,error}=await SB.from('cursos').select('*').neq('estado_registro','Eliminado').neq('estado','cerrado').order('created_at',{ascending:false});
    if(error) throw error; RC.cursos=data||[]; RC.curLoaded=true; rcRenderCursos();
  }catch(e){ const l=document.getElementById('rcCurLista'); if(l) l.innerHTML='<div class="rc-nota">Error: '+esc(e.message)+'</div>'; }
}
function rcRenderCursos(){
  const l=document.getElementById('rcCurLista'); if(!l) return;
  const q=(rcVal('rcCurBuscar')||'').toLowerCase();
  const puedeEditar=(typeof ES_ADMIN!=='undefined'&&ES_ADMIN);
  const lista=RC.cursos.filter(c=>!q||[c.nombre,c.institucion,c.area].join(' ').toLowerCase().includes(q));
  l.innerHTML=!lista.length?'<div class="rc-nota">Sin cursos abiertos.</div>'
    :lista.map(c=>{
      const det=[c.area, c.duracion&&('Duración: '+c.duracion), c.cupos&&(c.cupos+' cupos'),
        c.fecha_inicio&&('Inicio: '+String(c.fecha_inicio).slice(0,10)), c.ruta==='eecc'?'EECC':'AMSA'].filter(Boolean);
      return `<div class="rc-vac-wrap">
        <div class="rc-vac">
          <div><div class="rc-vac-cargo">${esc(c.nombre||'Curso')}</div>
            <div class="rc-vac-emp">${esc(c.institucion||'')}${c.modalidad?' · '+esc(c.modalidad):''}</div></div>
          <div class="rc-vac-btns">
            <button class="btn gray" onclick="rcCurDet('${c.curso_id}')">ⓘ Detalle</button>
            <button class="btn sec" onclick="rcInscribirCurso('${c.curso_id}')">Inscribir</button></div>
        </div>
        <div class="rc-vac-det" id="rcCurDet_${c.curso_id}" style="display:none">
          ${c.descripcion?`<div>${esc(c.descripcion)}</div>`:''}
          ${det.length?`<div class="rc-vac-meta">${det.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}
          ${c.requisitos?`<div><b>Requisitos:</b> ${esc(c.requisitos)}</div>`:''}
          ${puedeEditar?`<div><button class="btn gray" onclick="rcCursoNuevo('${c.curso_id}')">✏ Editar curso</button></div>`:''}
          ${!c.descripcion&&!det.length&&!c.requisitos?'<div class="rc-nota" style="margin:0">Sin más detalle.</div>':''}
        </div>
      </div>`;
    }).join('');
}
function rcCurDet(id){ const d=document.getElementById('rcCurDet_'+id); if(d) d.style.display=d.style.display==='none'?'':'none'; }
// Crear/editar curso desde el móvil (solo admin) — misma tabla que Empleabilidad.
function rcCursoNuevo(id){
  const c=id?RC.cursos.find(x=>x.curso_id===id):{}; if(id&&!c) return;
  imModal(`<h3>${id?'Editar curso':'Nuevo curso'}</h3>
    <div class="fld"><label>Nombre del curso *</label><input id="cuNombre" value="${esc(c.nombre||'')}"></div>
    <div class="g2"><div class="fld"><label>Institución</label><input id="cuInst" value="${esc(c.institucion||'')}"></div>
      <div class="fld"><label>Área</label><input id="cuArea" value="${esc(c.area||'')}"></div></div>
    <div class="g2"><div class="fld"><label>Modalidad</label><select id="cuModal"><option value="">—</option>${['Presencial','Online','Mixta'].map(o=>`<option ${c.modalidad===o?'selected':''}>${o}</option>`).join('')}</select></div>
      <div class="fld"><label>Ruta</label><select id="cuRuta"><option value="amsa" ${c.ruta!=='eecc'?'selected':''}>AMSA</option><option value="eecc" ${c.ruta==='eecc'?'selected':''}>EECC</option></select></div></div>
    <div class="g2"><div class="fld"><label>Duración</label><input id="cuDur" value="${esc(c.duracion||'')}" placeholder="40 h, 3 días…"></div>
      <div class="fld"><label>Cupos</label><input id="cuCupos" type="number" min="1" value="${c.cupos||''}"></div></div>
    <div class="fld"><label>Fecha de inicio</label><input id="cuFecha" type="date" value="${(c.fecha_inicio||'').slice(0,10)}"></div>
    <div class="fld"><label>Requisitos</label><input id="cuReq" value="${esc(c.requisitos||'')}"></div>
    <div class="fld"><label>Descripción</label><textarea id="cuDesc" rows="2">${esc(c.descripcion||'')}</textarea></div>
    <div class="btn-row" style="justify-content:flex-end"><button class="btn gray" onclick="imCerrar()">Cancelar</button>
      <button class="btn" onclick="rcGuardarCurso('${id||''}')">Guardar</button></div>`);
}
async function rcGuardarCurso(id){
  const g=i=>{const e=document.getElementById(i);return e?e.value.trim():'';};
  const nombre=g('cuNombre'); if(!nombre){ toast('El nombre es obligatorio','err'); return; }
  const fila={ nombre, institucion:g('cuInst')||null, area:g('cuArea')||null, modalidad:g('cuModal')||null,
    ruta:document.getElementById('cuRuta').value, duracion:g('cuDur')||null, cupos:parseInt(g('cuCupos'))||null,
    fecha_inicio:g('cuFecha')||null, requisitos:g('cuReq')||null, descripcion:g('cuDesc')||null,
    estado:'abierto', updated_at:new Date().toISOString(), updated_by:miNombre() };
  try{
    if(id){ const {error}=await SB.from('cursos').update(fila).eq('curso_id',id); if(error) throw error; }
    else{ fila.curso_id='curso_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6); fila.created_by=miNombre(); const {error}=await SB.from('cursos').insert(fila); if(error) throw error; }
    imCerrar(); RC.curLoaded=false; await rcCargarCursos(); toast('✅ Curso guardado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
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
async function rcGuardarLevantamiento(){
  const per=rcPersona(); if(!per.rut && !per.nombre){ toast('Identifica a la persona','err'); return; }
  const g=i=>{const e=document.getElementById(i);return e?e.value.trim():'';};
  try{
    const {error}=await SB.from('formaciones').insert({
      formacion_id:'form_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),
      rut:per.rut||null, nombre:per.nombre||null, telefono:per.telefono||null, comuna:per.comuna||null,
      ruta:'amsa', tipo:'Levantamiento de capacitación',
      area_interes:g('lvArea')||null, modalidad:g('lvModal')||null, disponibilidad:g('lvDisp')||null,
      comentario:g('lvComent')||null, registrado_por:miNombre() });
    if(error) throw error;
    RC.did.formacion=true;
    toast('✅ Levantamiento de capacitación guardado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ── Guardar la atención (alimenta el dashboard) ──────────────────────────────
async function rcGuardarAtencion(){
  const per=rcPersona();
  if(!per.rut && !per.nombre){ toast('Identifica a la persona (RUT o nombre)','err'); return; }
  // Al menos un servicio marcado (los que se le harán a la persona).
  const svc=RC.servicios||{};
  if(!svc.apresto && !svc.intermediacion && !svc.formacion){ toast('Marca al menos un servicio','err'); return; }
  const cuest=rcLeerCuest();
  const totalQ=(typeof CUEST!=='undefined'?CUEST:[]).length||1;
  const completo = Object.keys(cuest).length >= Math.ceil(totalQ*0.7);
  const val=id=>{ const e=document.getElementById(id); return e&&e.value?e.value:null; };
  try{
    const {error}=await SB.from('atenciones').insert({
      atencion_id:'at_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),
      cv_id:(ACTUAL&&ACTUAL.cv_id)||null, rut:per.rut||null, nombre:per.nombre||null,
      comuna:per.comuna||null, sexo:per.sexo||null,
      // Servicios que se le harán a la persona (casillas marcadas)
      apresto:!!svc.apresto, intermediacion:!!svc.intermediacion, formacion:!!svc.formacion,
      // Antecedentes de la recepción (para el dashboard y los filtros)
      nacionalidad:val('fNacion'), residencia:val('fResid'),
      nivel_estudios:val('fEstudios'), cesantia:val('fCesantia'),
      operativo_id:(typeof opActivoId==='function'?opActivoId():null),
      cuestionario_completo:completo, cuestionario_json:JSON.stringify(cuest),
      ejecutivo:(typeof miNombre==='function'?miNombre():null) });
    if(error) throw error;
    // Si hay una persona cargada, deja en su ficha el cuestionario y las respuestas
    // homologables (minería, contraindicación médica, exámenes preocupacionales).
    if(ACTUAL && ACTUAL.cv_id){
      const upd={updated_at:new Date().toISOString()};
      if(Object.keys(cuest).length) upd.cuestionario_json=JSON.stringify(cuest);
      if(RC.homolog.mineria) upd.exp_mineria=RC.homolog.mineria;
      if(RC.homolog.contra)  upd.contraindicacion_medica=RC.homolog.contra;
      if(RC.homolog.exam)    upd.examenes_preocupacionales=RC.homolog.exam;
      if(Object.keys(upd).length>1){ try{ await SB.from('cv_personas').update(upd).eq('cv_id',ACTUAL.cv_id);
        Object.assign(ACTUAL,{exp_mineria:RC.homolog.mineria||ACTUAL.exp_mineria,contraindicacion_medica:RC.homolog.contra||ACTUAL.contraindicacion_medica,examenes_preocupacionales:RC.homolog.exam||ACTUAL.examenes_preocupacionales}); }catch(e){} }
    }
    toast('✅ Atención guardada','ok');
    RC.did={apresto:false,intermediacion:false,formacion:false};
    RC.servicios={apresto:false,intermediacion:false,formacion:false};
    RC.cvPdf=null; RC.homolog={mineria:'',contra:'',exam:''}; rcRender();
  }catch(e){ toast('Error al guardar: '+e.message,'err'); }
}

function rcCopiar(id){ const i=document.getElementById(id); if(!i) return; i.select();
  try{ navigator.clipboard.writeText(i.value); }catch(e){ try{document.execCommand('copy');}catch(_){} } toast('🔗 Copiado','ok'); }
