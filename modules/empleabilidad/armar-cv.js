// ═══════════════════════════════════════════════════════════════════════════
// armar-cv.js — Armador de CV a dos columnas (Apresto Laboral · Fase B)
// Sistema AM · Antofagasta Minerals
//
// Página PÚBLICA: se abre con un link por TOKEN aleatorio (no el RUT en la URL,
// Regla 5). Muestra a la derecha el CV adjunto (foto/PDF/Word) y a la izquierda
// la plantilla del Modelo CV para transcribir. Genera PDF (formato Harvard) y
// guarda en cv_personas ligado al RUT (RPC cv_link_guardar).
//
// Reutiliza el motor de empleabilidad:
//   empleabilidad-lectura.js  → leerDocumento(), estructurarCV()  (OCR local)
//   empleabilidad-harvard.js  → generarCVHarvard()                (PDF)
// <script src> clásico, nunca type="module" (CLAUDE.md §6).
// ═══════════════════════════════════════════════════════════════════════════

const SB = window.supabase.createClient(window.SUPA_CFG.url, window.SUPA_CFG.key);
let TOKEN = new URLSearchParams(location.search).get('t') || '';
let CV = { rut:'',nombres:'',apellidos:'',direccion:'',comuna:'',telefono:'',email:'',resumen:'',
  experiencia:[], academico:[], cursos:[], idiomas:[], software:[], observaciones:'' };

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function acToast(m,t){ const e=document.getElementById('acToast'); e.textContent=m; e.className='ac-toast show'+(t==='err'?' err':''); clearTimeout(e._to); e._to=setTimeout(()=>e.className='ac-toast',3200); }
function acOverlay(t){ document.getElementById('acOvTxt').textContent=t||'Procesando…'; document.getElementById('acOverlay').classList.add('show'); }
function acOverlayOff(){ document.getElementById('acOverlay').classList.remove('show'); }
function acErr(m){ const e=document.getElementById('acErr'); e.textContent=m||''; e.style.display=m?'block':'none'; }
function v(id){ const e=document.getElementById(id); return e?e.value:''; }
function set(id,val){ const e=document.getElementById(id); if(e) e.value=val==null?'':val; }

document.addEventListener('DOMContentLoaded', acInit);
async function acInit(){
  if(!TOKEN){ acErr('Link no válido. Pide a la Oficina Móvil que te genere tu link para armar el CV.'); return; }
  acOverlay('Abriendo tu CV…');
  try{
    const {data,error}=await SB.rpc('cv_link_abrir',{p_token:TOKEN});
    if(error) throw error;
    if(data.cv) acDesdeFila(data.cv); else CV.rut=data.rut||'';
    acLlenar();
  }catch(e){ acErr('No se pudo abrir el link: '+e.message); }
  finally{ acOverlayOff(); }
}

function _pj(s){ try{ const x=JSON.parse(s||'[]'); return Array.isArray(x)?x:[]; }catch(e){ return []; } }
function acDesdeFila(row){
  CV.rut=row.rut||''; CV.nombres=row.nombres||''; CV.apellidos=row.apellidos||''; CV.direccion=row.direccion||'';
  CV.comuna=row.comuna||''; CV.telefono=row.telefono||''; CV.email=row.email||''; CV.resumen=row.resumen||''; CV.observaciones=row.observaciones||'';
  CV._nivel=(row.educacion||'').split(' — ')[0]||'';   // nivel captado en Móvil (para precargar académicos)
  CV.experiencia=_pj(row.experiencia_json).map(e=>{ const fx=(e.funciones||[]).filter(Boolean);
    return {empresa:e.empresa||'',ciudad:e.ciudad||'',periodo:e.periodo||'',cargo:e.cargo||'',funciones:[fx[0]||'',fx[1]||'',fx[2]||''],logro:e.logro||''}; });
  CV.academico=_pj(row.academico_json).map(a=>({nivel:'',titulo:a.titulo||'',institucion:a.institucion||'',ciudad:'',periodo:a.periodo||''}));
  CV.cursos=_pj(row.cursos_json).map(c=>({evento:c.evento||c.tema||'',institucion:c.institucion||'',ciudad:'',anio:c.anio||''}));
  CV.idiomas=_pj(row.idiomas_json).map(i=>({idioma:i.idioma||'',nivel:i.nivel||''}));
  CV.software=_pj(row.software_json).map(s=>({nombre:s.nombre||'',nivel:s.nivel||''}));
}

// ── Pintar el formulario desde CV ────────────────────────────────────────────
function acLlenar(){
  set('fNombres',CV.nombres); set('fApellidos',CV.apellidos); set('fRut',CV.rut);
  set('fTelefono',CV.telefono); set('fEmail',CV.email); set('fComuna',CV.comuna);
  set('fDireccion',CV.direccion); set('fResumen',CV.resumen); set('fOtros',CV.observaciones);
  // Precarga: académicos y cursos parten con una fila lista (con el nivel captado
  // en Móvil si viene), para que la persona solo complete y no vea secciones vacías.
  if(!CV.academico.length) CV.academico.push({nivel:CV._nivel||'',titulo:'',institucion:'',ciudad:'',periodo:''});
  if(!CV.cursos.length) CV.cursos.push({evento:'',institucion:'',ciudad:'',anio:''});
  acRenderExp(); acRenderAca(); acRenderCur(); acRenderIdi(); acRenderSof();
}
function acRenderExp(){
  document.getElementById('acExp').innerHTML=CV.experiencia.map((e,i)=>`<div class="ac-item">
    <div class="ac-item-h">Empleo ${i+1}<button class="ac-del" onclick="acDel('exp',${i})">✕</button></div>
    <div class="ac-g2"><label class="ac-f"><span>Empresa</span><input id="exp${i}_empresa" value="${esc(e.empresa)}"></label>
      <label class="ac-f"><span>Ciudad</span><input id="exp${i}_ciudad" value="${esc(e.ciudad)}"></label></div>
    <div class="ac-g2"><label class="ac-f"><span>Cargo</span><input id="exp${i}_cargo" value="${esc(e.cargo)}"></label>
      <label class="ac-f"><span>Periodo (Mes año – Mes año)</span><input id="exp${i}_periodo" value="${esc(e.periodo)}"></label></div>
    <label class="ac-f"><span>Función 1</span><input id="exp${i}_f0" value="${esc((e.funciones||[])[0]||'')}" placeholder="Qué hacías (principal)"></label>
    <label class="ac-f"><span>Función 2</span><input id="exp${i}_f1" value="${esc((e.funciones||[])[1]||'')}"></label>
    <label class="ac-f"><span>Función 3</span><input id="exp${i}_f2" value="${esc((e.funciones||[])[2]||'')}"></label>
    <label class="ac-f"><span>Logro <span style="color:#8a949a;font-weight:400">(opcional)</span></span><textarea id="exp${i}_logro" rows="2">${esc(e.logro)}</textarea></label>
  </div>`).join('')||'<div class="ac-empty">Sin experiencia aún. Usa «＋ agregar».</div>';
}
function acRenderAca(){
  document.getElementById('acAca').innerHTML=CV.academico.map((a,i)=>`<div class="ac-item">
    <div class="ac-item-h">Estudio ${i+1}<button class="ac-del" onclick="acDel('aca',${i})">✕</button></div>
    <div class="ac-g2"><label class="ac-f"><span>Nivel</span><input id="aca${i}_nivel" value="${esc(a.nivel)}" placeholder="Enseñanza Media / Técnico / Título / Magíster"></label>
      <label class="ac-f"><span>Título / carrera</span><input id="aca${i}_titulo" value="${esc(a.titulo)}"></label></div>
    <div class="ac-g2"><label class="ac-f"><span>Institución</span><input id="aca${i}_inst" value="${esc(a.institucion)}"></label>
      <label class="ac-f"><span>Ciudad · años</span><input id="aca${i}_ciudad" value="${esc((a.ciudad||'')+(a.periodo?(' · '+a.periodo):''))}"></label></div>
  </div>`).join('')||'<div class="ac-empty">Sin estudios aún.</div>';
}
function acRenderCur(){
  document.getElementById('acCur').innerHTML=CV.cursos.map((c,i)=>`<div class="ac-item ac-item-row">
    <input class="ac-f-in" id="cur${i}_evento" value="${esc(c.evento)}" placeholder="Curso / seminario / diplomado">
    <input class="ac-f-in" id="cur${i}_inst" value="${esc(c.institucion)}" placeholder="Institución">
    <input class="ac-f-in ac-yr" id="cur${i}_anio" value="${esc(c.anio)}" placeholder="Año">
    <button class="ac-del" onclick="acDel('cur',${i})">✕</button></div>`).join('')||'<div class="ac-empty">Sin cursos aún.</div>';
}
function acRenderIdi(){
  document.getElementById('acIdi').innerHTML=CV.idiomas.map((x,i)=>`<div class="ac-item-row">
    <input class="ac-f-in" id="idi${i}_idioma" value="${esc(x.idioma)}" placeholder="Idioma">
    <input class="ac-f-in" id="idi${i}_nivel" value="${esc(x.nivel)}" placeholder="básico/intermedio/avanzado">
    <button class="ac-del" onclick="acDel('idi',${i})">✕</button></div>`).join('');
}
function acRenderSof(){
  document.getElementById('acSof').innerHTML=CV.software.map((x,i)=>`<div class="ac-item-row">
    <input class="ac-f-in" id="sof${i}_nombre" value="${esc(x.nombre)}" placeholder="Software">
    <input class="ac-f-in" id="sof${i}_nivel" value="${esc(x.nivel)}" placeholder="nivel">
    <button class="ac-del" onclick="acDel('sof',${i})">✕</button></div>`).join('');
}

// ── Leer el DOM de vuelta a CV (antes de re-render o guardar) ─────────────────
function acSync(){
  CV.nombres=v('fNombres').trim(); CV.apellidos=v('fApellidos').trim(); CV.rut=v('fRut').trim();
  CV.telefono=v('fTelefono').trim(); CV.email=v('fEmail').trim(); CV.comuna=v('fComuna').trim();
  CV.direccion=v('fDireccion').trim(); CV.resumen=v('fResumen').trim(); CV.observaciones=v('fOtros').trim();
  CV.experiencia.forEach((e,i)=>{ e.empresa=v('exp'+i+'_empresa'); e.ciudad=v('exp'+i+'_ciudad'); e.cargo=v('exp'+i+'_cargo'); e.periodo=v('exp'+i+'_periodo'); e.funciones=[v('exp'+i+'_f0'),v('exp'+i+'_f1'),v('exp'+i+'_f2')]; e.logro=v('exp'+i+'_logro'); });
  CV.academico.forEach((a,i)=>{ a.nivel=v('aca'+i+'_nivel'); a.titulo=v('aca'+i+'_titulo'); a.institucion=v('aca'+i+'_inst'); a.ciudad=v('aca'+i+'_ciudad'); a.periodo=''; });
  CV.cursos.forEach((c,i)=>{ c.evento=v('cur'+i+'_evento'); c.institucion=v('cur'+i+'_inst'); c.anio=v('cur'+i+'_anio'); });
  CV.idiomas.forEach((x,i)=>{ x.idioma=v('idi'+i+'_idioma'); x.nivel=v('idi'+i+'_nivel'); });
  CV.software.forEach((x,i)=>{ x.nombre=v('sof'+i+'_nombre'); x.nivel=v('sof'+i+'_nivel'); });
}
function acAdd(t){ acSync();
  if(t==='exp'){ CV.experiencia.push({empresa:'',ciudad:'',periodo:'',cargo:'',funciones:['','',''],logro:''}); acRenderExp(); }
  if(t==='aca'){ CV.academico.push({nivel:'',titulo:'',institucion:'',ciudad:'',periodo:''}); acRenderAca(); }
  if(t==='cur'){ CV.cursos.push({evento:'',institucion:'',ciudad:'',anio:''}); acRenderCur(); }
  if(t==='idi'){ CV.idiomas.push({idioma:'',nivel:''}); acRenderIdi(); }
  if(t==='sof'){ CV.software.push({nombre:'',nivel:''}); acRenderSof(); }
}
function acDel(t,i){ acSync();
  ({exp:CV.experiencia,aca:CV.academico,cur:CV.cursos,idi:CV.idiomas,sof:CV.software})[t].splice(i,1);
  ({exp:acRenderExp,aca:acRenderAca,cur:acRenderCur,idi:acRenderIdi,sof:acRenderSof})[t]();
}

// ── Ayuda / ejemplos por sección (basados en el Modelo CV de AMSA) ──────────
const AC_INFO={
  datos:'Escribe tu nombre completo, RUT, un teléfono y correo donde te puedan contactar, y tu comuna. Ej: "Juan Pérez · +56 9 1234 5678 · juan.perez@gmail.com · Antofagasta".',
  resumen:'Un párrafo que te presente. Pon tu oficio o profesión, de qué institución, cuántos años de experiencia, en qué rubros, y 3 fortalezas ligadas al cargo al que postulas.\n\nEjemplo:\n"Técnico en mantención del INACAP, con más de 5 años de experiencia en faenas mineras. Se ha desempeñado en mantención mecánica de equipos pesados. Responsable, con foco en la seguridad y buen trabajo en equipo."',
  exp:'Por cada empleo (del más reciente al más antiguo): empresa, ciudad, cargo y el periodo (Mes año – Mes año).\n\n• Función 1, 2 y 3: escribe hasta tres tareas concretas que hacías, una en cada línea.\n• Logro (opcional): un resultado medible que integre una habilidad blanda.\n\nEjemplo:\nEmpresa: Minera Centinela · Ciudad: Antofagasta\nCargo: Operador de camión de extracción · Periodo: Ene 2018 – Ago 2020\nFunción 1: "Operación de camión tolva en botadero cumpliendo procedimientos de seguridad."\nFunción 2: "Chequeo básico del equipo y reporte de anomalías."\nFunción 3: "Coordinación con mantención."\nLogro: "Reduje en 15% los tiempos de detención."',
  aca:'Tus estudios, del más alto al más básico. Por cada uno: nivel (Enseñanza Media / Técnico / Título / Magíster), el título o carrera, la institución y la ciudad con los años.\n\nEjemplo:\nNivel: Técnico Nivel Superior · Título: Mantención Industrial\nInstitución: INACAP · Ciudad y años: Antofagasta · 2015 – 2018',
  cur:'Cursos, diplomados, charlas, talleres o seminarios a los que asististe. Pon el nombre, la institución y el año.\n\nEjemplo: "Trabajo en altura" · Mutual de Seguridad · 2022.',
  info:'Idiomas y software con su nivel, y en "Otros" actividades que reflejen habilidades blandas.\n\nEjemplos:\nIdioma: Inglés · nivel intermedio\nSoftware: MS Office · nivel intermedio\nOtros: "Voluntariado en cuerpo de bomberos."'
};
function acInfo(key){
  const txt=AC_INFO[key]||''; if(!txt) return;
  const host=document.getElementById('acInfoHost');
  host.innerHTML='<div class="ac-info-ov" onclick="if(event.target===this)acInfoCerrar()"><div class="ac-info-box">'+
    '<div class="ac-info-h">\u2139 Ejemplo de qué poner</div>'+
    '<div class="ac-info-b">'+esc(txt).replace(/\n/g,'<br>')+'</div>'+
    '<button class="ac-btn" onclick="acInfoCerrar()">Entendido</button></div></div>';
}
function acInfoCerrar(){ const h=document.getElementById('acInfoHost'); if(h) h.innerHTML=''; }

// ── Mapear CV → objeto para el exportador Harvard / payload ──────────────────
function _expH(){ return CV.experiencia.map(e=>({cargo:e.cargo,empresa:e.empresa,ciudad:e.ciudad,periodo:e.periodo,desde:e.periodo,
  funciones:(e.funciones||[]).map(s=>(s||'').trim()).filter(Boolean),logro:e.logro})); }
// Títulos exactos del Modelo CV de AMSA para el PDF (el exportador Harvard los acepta por opción).
const AC_TITULOS={perfil:'Resumen Profesional',educacion:'Antecedentes Académicos',experiencia:'Antecedentes Laborales',cursos:'Seminarios y Cursos',habilidades:'Información Adicional'};
function _acaH(){ return CV.academico.map(a=>({titulo:(a.nivel?a.nivel+' · ':'')+(a.titulo||''),institucion:(a.institucion||'')+(a.ciudad?', '+a.ciudad:''),periodo:a.periodo})); }
function _curH(){ return CV.cursos.map(c=>({evento:c.evento,tema:'',institucion:(c.institucion||'')+(c.ciudad?', '+c.ciudad:''),anio:c.anio})); }

function acDescargarPDF(){
  acSync();
  try{
    const cvH={ nombres:CV.nombres,apellidos:CV.apellidos,rut:CV.rut,direccion:CV.direccion,comuna:CV.comuna,
      telefono:CV.telefono,email:CV.email,resumen:CV.resumen,
      experiencia:_expH(), academico:_acaH(), cursos:_curH(), idiomas:CV.idiomas, software:CV.software };
    const doc=generarCVHarvard(cvH, {titulos:AC_TITULOS});
    doc.save('CV_'+((CV.apellidos||CV.nombres||CV.rut||'curriculum').replace(/\W+/g,'_'))+'.pdf');
  }catch(e){ acToast('No se pudo generar el PDF: '+e.message,'err'); }
}

async function acGuardar(){
  acSync();
  if(!CV.rut){ acToast('Falta tu RUT','err'); return; }
  if(!CV.nombres && !CV.apellidos){ acToast('Escribe tu nombre','err'); return; }
  const payload={ rut:CV.rut,nombres:CV.nombres,apellidos:CV.apellidos,direccion:CV.direccion,comuna:CV.comuna,
    telefono:CV.telefono,email:CV.email,resumen:CV.resumen,observaciones:CV.observaciones,
    oficios:(CV.experiencia[0]&&CV.experiencia[0].cargo)||'',
    experiencia_json:JSON.stringify(_expH()), academico_json:JSON.stringify(_acaH()),
    cursos_json:JSON.stringify(_curH()), idiomas_json:JSON.stringify(CV.idiomas), software_json:JSON.stringify(CV.software) };
  acOverlay('Guardando tu CV…');
  try{
    const {data,error}=await SB.rpc('cv_link_guardar',{p_token:TOKEN,p_cv:payload});
    if(error) throw error;
    acToast('✅ Tu CV quedó guardado. Ya puedes descargarlo en PDF.');
  }catch(e){ acToast('No se pudo guardar: '+e.message,'err'); }
  finally{ acOverlayOff(); }
}
