// ═══════════════════════════════════════════════════════════════════════════
// feria-postulante.js — Flujo público del postulante · Feria CV Minero QR
// Sistema AM · Antofagasta Minerals
//
// Página PÚBLICA (sin sesión), como Hoteles SG: usa la anon key y solo llama a
// RPCs acotados (feria_buscar_cv, feria_guardar_cv, feria_cargos_publicos,
// feria_postular). El OCR y el matching corren en el navegador (tesseract +
// diccionario minero) — ningún CV sale a terceros (CLAUDE.md Reglas 5 y 6).
//
// Reutiliza el motor de empleabilidad:
//   ../empleabilidad/empleabilidad-lectura.js → leerDocumento(), estructurarCV()
//   ../empleabilidad/empleabilidad-match.js   → matchDetalle(), cargarDiccionarioOficios()
// `cvTexto` vive en empleabilidad.js (que aquí no se carga), así que se define
// localmente con los mismos campos.
//
// <script src> clásico, nunca type="module" (CLAUDE.md §6).
// ═══════════════════════════════════════════════════════════════════════════

const SB = window.supabase.createClient(window.SUPA_CFG.url, window.SUPA_CFG.key);

const FP = { codigo:'', feriaId:'', rut:'', cv:{}, token:'', nombre:'', participante:'' };

// ── helpers UI ───────────────────────────────────────────────────────────────
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function fpToast(msg,tipo){ const t=document.getElementById('fpToast'); t.textContent=msg;
  t.className='fp-toast show'+(tipo==='err'?' err':tipo==='ok'?' ok':''); clearTimeout(t._to);
  t._to=setTimeout(()=>t.className='fp-toast',3400); }
function fpOverlay(txt){ document.getElementById('fpOverlayTxt').textContent=txt||'Procesando…';
  document.getElementById('fpOverlay').classList.add('show'); }
function fpOverlayOff(){ document.getElementById('fpOverlay').classList.remove('show'); }
function fpErr(id,msg){ const e=document.getElementById(id); if(!e)return; e.textContent=msg||''; e.style.display=msg?'block':'none'; }
function val(id){ const e=document.getElementById(id); return e?e.value.trim():''; }
function set(id,v){ const e=document.getElementById(id); if(e) e.value=v==null?'':v; }

function fpIr(step){
  document.querySelectorAll('.fp-step').forEach(s=>s.classList.remove('active'));
  document.getElementById('step-'+step).classList.add('active');
  window.scrollTo(0,0);
}

// cvTexto local (mismos campos que empleabilidad.js) para que matchDetalle funcione.
function cvTexto(cv){
  const arr=a=>Array.isArray(a)?a:[];
  return [cv.resumen,cv.nombres,cv.apellidos,cv.oficios,cv.exp_mineria,cv.educacion,cv.certificaciones,
    cv.comuna,cv.disponibilidad,cv.tipo_licencia,(cv.licencia?('licencia '+(cv.tipo_licencia||'')):''),cv.equipos,
    arr(cv.experiencia).map(e=>[e.cargo,e.empresa,(e.funciones||[]).join(' ')].join(' ')).join(' '),
    arr(cv.academico).map(a=>[a.titulo,a.institucion].join(' ')).join(' '),
    arr(cv.cursos).map(c=>[c.evento,c.tema,c.institucion].join(' ')).join(' ')
  ].filter(Boolean).join(' ');
}

document.addEventListener('DOMContentLoaded',()=>{ try{ cargarDiccionarioOficios(); }catch(e){} });

// ── Paso 0 · comenzar ────────────────────────────────────────────────────────
async function fpComenzar(){
  fpErr('fpInicioErr','');
  const codigo=val('fpCodigo');
  if(!codigo){ fpErr('fpInicioErr','Escribe el código de la feria.'); return; }
  if(!document.getElementById('fpConsent').checked){ fpErr('fpInicioErr','Debes autorizar el uso de tus datos para continuar.'); return; }
  fpOverlay('Validando el código…');
  try{
    const {data,error}=await SB.rpc('feria_feria_por_codigo',{p_codigo:codigo});
    if(error) throw error;
    if(!data){ fpErr('fpInicioErr','Código de feria no válido o feria cerrada.'); return; }
    FP.codigo=codigo; FP.feriaId=data;
    fpIr('rut');
  }catch(e){ fpErr('fpInicioErr','No se pudo validar: '+e.message); }
  finally{ fpOverlayOff(); }
}

// ── Paso 1 · buscar por RUT ──────────────────────────────────────────────────
async function fpBuscar(){
  fpErr('fpRutErr','');
  const rut=val('fpRut');
  if(rutCanon(rut).length<7){ fpErr('fpRutErr','Escribe tu RUT completo.'); return; }
  FP.rut=rut;
  fpOverlay('Buscando tu CV…');
  try{
    const {data,error}=await SB.rpc('feria_buscar_cv',{p_codigo:FP.codigo,p_rut:rut});
    if(error) throw error;
    if(data){
      FP.cv=fpDesdeFila(data);
      fpLlenarForm(FP.cv);
      set('cvRut',rut);
      fpToast('✅ Encontramos tu CV, revísalo','ok');
      fpIr('cv');
    }else{
      document.getElementById('fpOrigenMsg').textContent='No encontramos un CV con ese RUT. Sube tu CV o créalo desde cero.';
      fpIr('origen');
    }
  }catch(e){ fpErr('fpRutErr','No se pudo buscar: '+e.message); }
  finally{ fpOverlayOff(); }
}

function rutCanon(r){ return String(r==null?'':r).toUpperCase().replace(/[^0-9K]/g,''); }

// ── Paso 2 · origen del CV ───────────────────────────────────────────────────
function fpArchivo(){ document.getElementById('fpFile').click(); }
function fpDesdeCero(){ FP.cv={rut:FP.rut}; fpLlenarForm(FP.cv); set('cvRut',FP.rut); fpIr('cv'); }

async function fpLeerArchivo(input){
  const file=input.files&&input.files[0]; input.value='';
  if(!file) return;
  fpOverlay('Leyendo tu CV… (si es una foto, la primera vez descarga el lector)');
  try{
    const lectura=await leerDocumento(file);
    const cv=estructurarCV(lectura, file.name);
    cv.rut=FP.rut||cv.rut||'';
    FP.cv=cv;
    fpLlenarForm(cv);
    set('cvRut', FP.rut||cv.rut||'');
    fpToast('✅ Leímos tu CV, revísalo y corrige lo que falte','ok');
    fpIr('cv');
  }catch(e){ fpToast('No se pudo leer el archivo: '+e.message,'err'); }
  finally{ fpOverlayOff(); }
}

// Normaliza una fila de cv_personas (campos *_json string) a objeto con arrays.
function fpDesdeFila(row){
  const pj=s=>{ try{ return JSON.parse(s||'[]'); }catch(e){ return []; } };
  return {
    rut:row.rut||'', nombres:row.nombres||'', apellidos:row.apellidos||'', telefono:row.telefono||'',
    email:row.email||'', comuna:row.comuna||'', region:row.region||'', resumen:row.resumen||'',
    oficios:row.oficios||'', anios_exp:row.anios_exp||'', exp_mineria:row.exp_mineria||'', equipos:row.equipos||'',
    licencia:row.licencia||'', tipo_licencia:row.tipo_licencia||'', disponibilidad:row.disponibilidad||'',
    educacion:row.educacion||'', certificaciones:row.certificaciones||'',
    experiencia:pj(row.experiencia_json), academico:pj(row.academico_json), cursos:pj(row.cursos_json)
  };
}

// ── Paso 3 · llenar / leer el formulario ─────────────────────────────────────
function fpLlenarForm(cv){
  set('cvNombres',cv.nombres); set('cvApellidos',cv.apellidos); set('cvRut',cv.rut);
  set('cvTelefono',cv.telefono); set('cvEmail',cv.email); set('cvComuna',cv.comuna);
  set('cvResumen',cv.resumen); set('cvOficios',cv.oficios); set('cvAnios',cv.anios_exp);
  set('cvExpMin',cv.exp_mineria); set('cvEquipos',cv.equipos);
  set('cvExperiencia',(cv.experiencia||[]).map(e=>`${e.cargo||''}${e.empresa?(' — '+e.empresa):''}`).filter(s=>s.trim()&&s!==' — ').join('\n'));
  set('cvLicencia', cv.licencia? (cv.tipo_licencia?('Clase '+cv.tipo_licencia):'Sí') : (cv.tipo_licencia?('Clase '+cv.tipo_licencia):''));
  set('cvDisp',cv.disponibilidad); set('cvEducacion',cv.educacion);
  const cursos=(cv.cursos||[]).map(c=>c.evento||c.tema||'').filter(Boolean);
  set('cvCursos', cursos.length?cursos.join('\n'):(cv.certificaciones||''));
}

// Arma el objeto CV (con arrays) desde el formulario, para matching y guardado.
function fpLeerForm(){
  const exp=val('cvExperiencia').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{
    const p=l.split(/\s+[—-]\s+/); return {cargo:(p[0]||'').trim(), empresa:(p[1]||'').trim(), funciones:[]};
  });
  const cursos=val('cvCursos').split('\n').map(l=>l.trim()).filter(Boolean).map(t=>({evento:t}));
  const licTxt=val('cvLicencia');
  const tipoLic=(licTxt.match(/\b([A-E]\-?\d?)\b/i)||[])[1]||'';
  return {
    rut:val('cvRut'), nombres:val('cvNombres'), apellidos:val('cvApellidos'),
    telefono:val('cvTelefono'), email:val('cvEmail'), comuna:val('cvComuna'),
    resumen:val('cvResumen'), oficios:val('cvOficios')||(exp[0]&&exp[0].cargo)||'',
    anios_exp:val('cvAnios'), exp_mineria:val('cvExpMin'), equipos:val('cvEquipos'),
    licencia:licTxt?'Sí':'', tipo_licencia:tipoLic.toUpperCase(),
    disponibilidad:val('cvDisp'), educacion:val('cvEducacion'),
    certificaciones:cursos.map(c=>c.evento).join(' · ').slice(0,300),
    experiencia:exp, cursos:cursos, academico:FP.cv.academico||[]
  };
}

// ── Paso 3 · guardar ─────────────────────────────────────────────────────────
async function fpGuardar(){
  fpErr('fpCvErr','');
  const cv=fpLeerForm();
  if(!cv.nombres && !cv.apellidos){ fpErr('fpCvErr','Escribe al menos tu nombre.'); return; }
  if(!cv.telefono){ fpErr('fpCvErr','Escribe un teléfono de contacto.'); return; }
  FP.cv=cv;
  const payload={
    rut:cv.rut, nombres:cv.nombres, apellidos:cv.apellidos, telefono:cv.telefono, email:cv.email,
    comuna:cv.comuna, resumen:cv.resumen, oficios:cv.oficios, anios_exp:cv.anios_exp,
    exp_mineria:cv.exp_mineria, equipos:cv.equipos, licencia:cv.licencia, tipo_licencia:cv.tipo_licencia,
    disponibilidad:cv.disponibilidad, educacion:cv.educacion, certificaciones:cv.certificaciones,
    experiencia_json:JSON.stringify(cv.experiencia||[]), cursos_json:JSON.stringify(cv.cursos||[]),
    academico_json:JSON.stringify(cv.academico||[])
  };
  fpOverlay('Guardando tu CV y generando tu QR…');
  try{
    const {data,error}=await SB.rpc('feria_guardar_cv',{p_codigo:FP.codigo,p_cv:payload,p_consentimiento:true});
    if(error) throw error;
    FP.token=data.credencial_token; FP.nombre=data.nombre||((cv.nombres+' '+cv.apellidos).trim()); FP.participante=data.participante_id;
    fpRenderCredencial();
    fpIr('listo');
  }catch(e){ fpErr('fpCvErr','No se pudo guardar: '+e.message); }
  finally{ fpOverlayOff(); }
}

// ── Paso 4 · credencial con QR ───────────────────────────────────────────────
function fpRenderCredencial(){
  document.getElementById('fpCredNombre').textContent=FP.nombre||'—';
  document.getElementById('fpCredSub').textContent=[FP.cv.oficios,FP.cv.telefono].filter(Boolean).join(' · ');
  const cont=document.getElementById('fpQR'); cont.innerHTML='';
  // El QR lleva SOLO el token aleatorio (no el RUT ni el nombre).
  new QRCode(cont,{ text:FP.token, width:190, height:190, correctLevel:QRCode.CorrectLevel.M });
}

function fpDescargarCredencial(){
  try{
    const { jsPDF }=window.jspdf; const doc=new jsPDF({unit:'mm',format:[90,120]});
    doc.setFillColor(0,105,115); doc.rect(0,0,90,18,'F');
    doc.setTextColor(255); doc.setFont('helvetica','bold'); doc.setFontSize(11);
    doc.text('Feria Laboral Minera',45,11,{align:'center'});
    doc.setTextColor(28,38,50); doc.setFontSize(13);
    doc.text((FP.nombre||'').slice(0,28),45,30,{align:'center'});
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(95,105,115);
    doc.text([FP.cv.oficios||'',FP.cv.telefono||''].filter(Boolean).join(' · ').slice(0,40),45,37,{align:'center'});
    const canvas=document.querySelector('#fpQR canvas');
    if(canvas){ doc.addImage(canvas.toDataURL('image/png'),'PNG',22.5,44,45,45); }
    doc.setFontSize(7); doc.text('Credencial CV Minero · Antofagasta Minerals',45,98,{align:'center'});
    doc.save('credencial_feria.pdf');
  }catch(e){ fpToast('No se pudo generar el PDF: '+e.message,'err'); }
}

// ── Paso 4 · empresas recomendadas ───────────────────────────────────────────
async function fpVerEmpresas(){
  document.getElementById('fpEmpresasCard').style.display='block';
  const cont=document.getElementById('fpEmpresas'); cont.innerHTML='<div class="fp-vacio">Buscando empresas…</div>';
  document.getElementById('fpEmpresasCard').scrollIntoView({behavior:'smooth'});
  try{
    try{ await cargarDiccionarioOficios(); }catch(e){}   // sinónimos (CAEX, LHD, etc.)
    const {data,error}=await SB.rpc('feria_cargos_publicos',{p_codigo:FP.codigo});
    if(error) throw error;
    const cargos=(data||[]).map(o=>({ ...o, criterios: fpParse(o.criterios_json) }));
    if(!cargos.length){ cont.innerHTML='<div class="fp-vacio">Todavía no hay cargos publicados en esta feria.</div>'; return; }
    const cvObj=FP.cv;
    // Construir el índice IDF con este CV: fija el largo promedio para que la
    // normalización de BM25 no aplaste los puntajes (sin esto, avg=1 vs CV largo).
    try{ mConstruirIDF([cvObj]); }catch(e){}
    const rank=cargos.map(o=>{ const d=matchDetalle(cvObj,{criterios:o.criterios}); return {o, pct:d.pct, det:d}; })
                     .sort((a,b)=>b.pct-a.pct);
    cont.innerHTML=rank.map(fpTarjetaEmpresa).join('');
  }catch(e){ cont.innerHTML='<div class="fp-vacio">No se pudieron cargar las empresas: '+esc(e.message)+'</div>'; }
}
function fpParse(s){ try{ return JSON.parse(s||'[]'); }catch(e){ return []; } }

function fpTarjetaEmpresa(r){
  const col=r.pct>=70?'#1e7e34':r.pct>=40?'#b8860b':'#c0311b';
  const cumple=(r.det.criterios||[]).filter(c=>c.score>=0.5).slice(0,3).map(c=>esc(c.texto));
  const falta=(r.det.criterios||[]).filter(c=>c.score<0.5).slice(0,3).map(c=>esc(c.texto));
  return `<div class="fp-emp">
    <div class="fp-emp-top">
      <div><div class="fp-emp-cargo">${esc(r.o.cargo||'Cargo')}</div>
        <div class="fp-emp-nom">${esc(r.o.empresa||'')}${r.o.stand?` · Stand ${esc(r.o.stand)}`:''}</div></div>
      <div class="fp-emp-pct" style="color:${col}">${r.pct}%</div>
    </div>
    ${r.o.descripcion?`<div class="fp-emp-desc">${esc(r.o.descripcion)}</div>`:''}
    ${cumple.length?`<div class="fp-emp-line"><b>Cumples:</b> ${cumple.join(', ')}</div>`:''}
    ${falta.length?`<div class="fp-emp-line brecha"><b>Te falta:</b> ${falta.join(', ')}</div>`:''}
    <button class="fp-btn sm" onclick="fpPostular('${esc(r.o.oferta_id)}',${r.pct},this)">Postular a este cargo</button>
  </div>`;
}

async function fpPostular(ofertaId,pct,btn){
  btn.disabled=true; btn.textContent='Enviando…';
  try{
    const {data,error}=await SB.rpc('feria_postular',{p_codigo:FP.codigo,p_token:FP.token,p_oferta_id:ofertaId,p_match:pct});
    if(error) throw error;
    btn.textContent = data && data.nuevo===false ? '✓ Ya postulado' : '✓ Postulado';
    btn.classList.add('ok');
    fpToast('✅ Postulación enviada','ok');
  }catch(e){ btn.disabled=false; btn.textContent='Postular a este cargo'; fpToast('No se pudo postular: '+e.message,'err'); }
}
