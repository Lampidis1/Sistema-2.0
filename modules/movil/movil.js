
// ═══════════ CONFIG ═══════════
const CFG={ url:(window.SUPA_CFG&&window.SUPA_CFG.url)||'', key:(window.SUPA_CFG&&window.SUPA_CFG.key)||'' };
let SB=null, USER=null, ES_ADMIN=false;
function initSB(){ if(SB)return true; if(!CFG.url||!CFG.key){gateErr('Falta config.js');return false;} SB=supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true,storageKey:'am_mov_auth'}}); return true; }
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m,t){ const e=document.getElementById('toast'); e.textContent=m; e.className='toast '+(t||''); e.style.display='block'; setTimeout(()=>e.style.display='none',2600); }
function gateErr(m){ const e=document.getElementById('gateErr'); if(!m){e.style.display='none';return;} e.textContent=m; e.style.display='block'; }
function miNombre(){ return (USER&&USER.email)||''; }

// ═══════════ AUTH ═══════════
function verRegistro(){ document.getElementById('loginStep').style.display='none'; document.getElementById('regStep').style.display='block'; gateErr(''); }
function verLogin(){ document.getElementById('regStep').style.display='none'; document.getElementById('pendStep').style.display='none'; document.getElementById('loginStep').style.display='block'; gateErr(''); }
async function entrar(){
  gateErr(''); if(!initSB())return;
  const email=document.getElementById('lgEmail').value.trim().toLowerCase(), pass=document.getElementById('lgPass').value;
  if(!email||!pass){gateErr('Ingresa correo y contraseña');return;}
  const btn=document.getElementById('lgBtn'); btn.disabled=true; btn.textContent='Ingresando…';
  try{ const {data,error}=await SB.auth.signInWithPassword({email,password:pass}); if(error)throw error; await trasLogin(data.user); }
  catch(e){ gateErr(e.message.includes('Invalid')?'Correo o contraseña incorrectos':e.message); }
  finally{ btn.disabled=false; btn.textContent='Ingresar'; }
}
async function registrarse(){
  gateErr(''); if(!initSB())return;
  const nombre=document.getElementById('rgNombre').value.trim(), apellido=document.getElementById('rgApellido').value.trim();
  const email=document.getElementById('rgEmail').value.trim().toLowerCase(), pass=document.getElementById('rgPass').value;
  if(!nombre||!email||!pass){gateErr('Completa nombre, correo y contraseña');return;}
  if(pass.length<6){gateErr('Mínimo 6 caracteres');return;}
  const btn=document.getElementById('rgBtn'); btn.disabled=true; btn.textContent='Creando…';
  try{
    const {data,error}=await SB.auth.signUp({email,password:pass}); if(error)throw error;
    const uid=data.user&&data.user.id;
    if(uid){ try{ await SB.rpc('registrar_solicitud',{p_uid:uid,p_nombre:nombre,p_apellido:apellido,p_email:email,p_origen:'movil',p_rol_sol:'usuario',p_faena_sol:'movil'}); }catch(e){} }
    verLogin(); toast('✅ Solicitud enviada. Un administrador debe aprobarte.','ok');
  }catch(e){ gateErr(e.message.includes('already registered')?'Ese correo ya está registrado':e.message); }
  finally{ btn.disabled=false; btn.textContent='Solicitar acceso'; }
}
async function salir(){ try{ await SB.auth.signOut(); }catch(e){} location.reload(); }
async function trasLogin(user){
  USER=user; const md=(user&&user.app_metadata)||{};
  ES_ADMIN=(md.rol==='admin');
  const accesos=md.accesos||[];
  const ok = ES_ADMIN || (md.estado==='aprobado' && (accesos.includes('movil')||accesos.includes('empleabilidad')||accesos.includes('principal')));
  if(!ok){ document.getElementById('loginStep').style.display='none'; document.getElementById('regStep').style.display='none'; document.getElementById('pendStep').style.display='block'; return; }
  document.getElementById('gate').style.display='none';
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('hUser').textContent=(user.email||'').split('@')[0];
  await cargarLevantados();
  construirCuestionario();
}
window.addEventListener('DOMContentLoaded',async()=>{ if(!initSB())return; const {data}=await SB.auth.getSession(); if(data&&data.session&&data.session.user){
  // Refrescar el token para traer los accesos actualizados. Sin esto, si el
  // usuario maestro cambia los permisos de alguien, esa persona sigue con el
  // JWT viejo hasta cerrar sesion. Ver docs/PENDIENTES.md P-10.
  let usuario=data.session.user;
  try{ const {data:ref}=await SB.auth.refreshSession(); if(ref&&ref.session&&ref.session.user) usuario=ref.session.user; }catch(e){}
  await trasLogin(usuario);
} });

// ═══════════ NAVEGACIÓN ═══════════
function movTab(p,btn){ document.querySelectorAll('.page').forEach(x=>x.classList.remove('active')); document.getElementById('page-'+p).classList.add('active'); document.querySelectorAll('.tabbar button').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); if(p==='listado')renderListado(); if(p==='cuestionario')refrescarCuestionarioActual(); window.scrollTo(0,0); }

// ═══════════ ESTADO DE CAPTURA ═══════════
let ACTUAL=null;      // registro en edición {cv_id,...}
let LEVANTADOS=[];    // cache de personas
let ES_EDICION=false; // si se está complementando un registro existente

function limpiarForm(){
  ['fNombres','fApellidos','fNac','fNacion','fComuna','fRegion','fDir','fTel','fEmail','fTipoLic','fDisp','fAnios','fOficios','fEducacion','fCursos','fCertif','fObs'].forEach(id=>document.getElementById(id).value='');
  ['fSexo','fResid','fLic','fMineria','fEstudios'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('fNacion').value='Chilena';
  document.getElementById('rutWarn').style.display='none';
  document.getElementById('editInfo').textContent='';
}
function nuevoRegistro(){
  ACTUAL={ cv_id:'cv_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6), cuestionario:{}, _nuevo:true };
  ES_EDICION=false; limpiarForm();
  const rut=document.getElementById('cRut').value.trim(); // conservar rut escrito
  document.getElementById('editInfo').textContent='Nuevo registro — RUT: '+(rut||'(sin rut)');
  toast('Nuevo registro en blanco','ok');
}
function formToObj(){
  const g=id=>document.getElementById(id).value.trim();
  const cursos=g('fCursos').split('\n').filter(x=>x.trim()).map(x=>({evento:x.trim(),tema:'',institucion:'',anio:''}));
  return {
    cv_id:(ACTUAL&&ACTUAL.cv_id)||('cv_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),
    rut:document.getElementById('cRut').value.trim(), nombres:g('fNombres'), apellidos:g('fApellidos'),
    fecha_nacimiento:g('fNac'), sexo:g('fSexo'), nacionalidad:g('fNacion'), comuna:g('fComuna'), region:g('fRegion'),
    direccion:g('fDir'), telefono:g('fTel'), email:g('fEmail'),
    licencia:g('fLic'), tipo_licencia:g('fTipoLic'), disponibilidad:g('fDisp'),
    exp_mineria:g('fMineria'), anios_exp:g('fAnios'), oficios:g('fOficios'),
    educacion:[g('fEstudios'),g('fEducacion')].filter(Boolean).join(' — '),
    certificaciones:g('fCertif'), observaciones:g('fObs'),
    cursos, cuestionario:(ACTUAL&&ACTUAL.cuestionario)||{}
  };
}
function objToForm(c){
  const s=(id,v)=>document.getElementById(id).value=v||'';
  s('cRut',c.rut); s('fNombres',c.nombres); s('fApellidos',c.apellidos); s('fNac',c.fecha_nacimiento);
  s('fSexo',c.sexo); s('fNacion',c.nacionalidad); s('fComuna',c.comuna); s('fRegion',c.region);
  s('fDir',c.direccion); s('fTel',c.telefono); s('fEmail',c.email);
  s('fLic',c.licencia); s('fTipoLic',c.tipo_licencia); s('fDisp',c.disponibilidad);
  s('fMineria',c.exp_mineria); s('fAnios',c.anios_exp); s('fOficios',c.oficios);
  s('fCertif',c.certificaciones); s('fObs',c.observaciones);
  s('fCursos',(c.cursos||[]).map(x=>x.evento||'').filter(Boolean).join('\n'));
  // educación: separar estudios formales del detalle si viene con —
  if(c.educacion){ const parts=c.educacion.split(' — '); document.getElementById('fEstudios').value=parts[0]||''; document.getElementById('fEducacion').value=parts.slice(1).join(' — '); }
}

// ═══════════ BUSCAR POR RUT ═══════════
let _rutTimer=null;
function normRut(r){ return String(r||'').replace(/[.\-\s]/g,'').toLowerCase(); }
function buscarPorRut(){
  clearTimeout(_rutTimer);
  _rutTimer=setTimeout(async()=>{
    const rut=normRut(document.getElementById('cRut').value); const warn=document.getElementById('rutWarn');
    if(rut.length<7){ warn.style.display='none'; return; }
    const encontrado=LEVANTADOS.find(c=>normRut(c.rut)===rut);
    if(encontrado){
      warn.style.display='block';
      warn.innerHTML='⚠ Ya existe: <b>'+esc((encontrado.nombres||'')+' '+(encontrado.apellidos||''))+'</b>. <span style="color:var(--teal);text-decoration:underline;cursor:pointer" onclick="complementar(\''+encontrado.cv_id+'\')">Complementar este registro</span>';
    } else { warn.style.display='none'; }
  },350);
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
  if(!nuevo.nombres && !nuevo.apellidos){ toast('Ingresa al menos nombre o apellido','err'); return; }
  const previo = ES_EDICION ? LEVANTADOS.find(c=>c.cv_id===nuevo.cv_id) : null;
  const row={
    cv_id:nuevo.cv_id, rut:nuevo.rut, nombres:nuevo.nombres, apellidos:nuevo.apellidos,
    fecha_nacimiento:nuevo.fecha_nacimiento, sexo:nuevo.sexo, nacionalidad:nuevo.nacionalidad,
    comuna:nuevo.comuna, region:nuevo.region, direccion:nuevo.direccion, telefono:nuevo.telefono, email:nuevo.email,
    licencia:nuevo.licencia, tipo_licencia:nuevo.tipo_licencia, disponibilidad:nuevo.disponibilidad,
    exp_mineria:nuevo.exp_mineria, anios_exp:nuevo.anios_exp, oficios:nuevo.oficios,
    educacion:nuevo.educacion, certificaciones:nuevo.certificaciones, observaciones:nuevo.observaciones,
    cursos_json:JSON.stringify(nuevo.cursos||[]),
    cuestionario_json:JSON.stringify(nuevo.cuestionario||{}),
    fuente:'movil', origen_plataforma:'movil',
    fecha_levantamiento:(previo&&previo.fecha_levantamiento)||new Date().toISOString().slice(0,10),
    levantado_por:(previo&&previo.levantado_por)||miNombre(),
    estado_registro:'Activo', updated_by:miNombre(), updated_at:new Date().toISOString()
  };
  if(!previo) row.created_by=miNombre();
  const {error}=await SB.from('cv_personas').upsert(row,{onConflict:'cv_id'});
  if(error){ toast('Error: '+error.message,'err'); return; }
  // logs de trazabilidad campo por campo
  await registrarCambios(previo, nuevo);
  toast('✅ Registro guardado','ok');
  ACTUAL={cv_id:nuevo.cv_id, cuestionario:nuevo.cuestionario, ...nuevo}; ES_EDICION=true;
  document.getElementById('editInfo').textContent='Guardado ✓ · '+((nuevo.nombres||'')+' '+(nuevo.apellidos||''));
  await cargarLevantados();
}
async function registrarCambios(previo, nuevo){
  const campos=['rut','nombres','apellidos','fecha_nacimiento','sexo','nacionalidad','comuna','region','direccion','telefono','email','licencia','tipo_licencia','disponibilidad','exp_mineria','anios_exp','oficios','educacion','certificaciones','observaciones'];
  const logs=[];
  if(!previo){ logs.push({cv_id:nuevo.cv_id,usuario_email:miNombre(),accion:'crear',campo:'(registro)',valor_anterior:'',valor_nuevo:(nuevo.nombres||'')+' '+(nuevo.apellidos||''),origen:'movil.html'}); }
  else { campos.forEach(k=>{ const a=String(previo[k]||''), b=String(nuevo[k]||''); if(a!==b) logs.push({cv_id:nuevo.cv_id,usuario_email:miNombre(),accion:'editar',campo:k,valor_anterior:a,valor_nuevo:b,origen:'movil.html'}); }); }
  if(logs.length){ try{ await SB.from('cv_logs').insert(logs); }catch(e){} }
}

// ═══════════ CUESTIONARIO ═══════════
const CUEST=[
  {k:'q_residencia',t:'¿Posee residencia definitiva?',op:['Sí','No']},
  {k:'q_discapacidad',t:'¿Cuenta con algún tipo de discapacidad?',op:['No','Sí']},
  {k:'q_discapacidad_cual',t:'En caso afirmativo, ¿cuál?',op:null},
  {k:'q_estudios',t:'Máximo nivel de estudios',op:['Media completa','Técnico nivel medio completo','Técnico nivel superior completo','Profesional completa','Profesional con especialización']},
  {k:'q_especializacion',t:'Si cuenta con especialización, registrar',op:null},
  {k:'q_situacion',t:'Situación laboral actual',op:['Empleado dependiente','Independiente','Informal','Cesante']},
  {k:'q_cesante_tiempo',t:'Si está cesante, ¿cuánto tiempo?',op:['1 a 3 meses','3 a 6 meses','Más de 6 meses','Un año o más']},
  {k:'q_capacitarse',t:'¿Le gustaría capacitarse?',op:['Sí','No']},
  {k:'q_servicio',t:'¿Qué servicio le entrega el ejecutivo/a?',op:['Orientación laboral (apresto)','Postulación a vacantes disponibles','Registro de capacitación']},
  {k:'q_postulacion',t:'Si postuló a vacantes, ¿interna o externa?',op:['Interna (Antofagasta Minerals)','Externa (Empresa colaboradora)']},
  {k:'q_apresto',t:'Si hubo orientación (apresto), ¿qué temática?',op:['Mejora de curriculum vitae','Postulación digital efectiva','Preparación para entrevista laboral']},
  {k:'q_tipo_cap',t:'Si registró capacitación, ¿a qué tipo postula?',op:['Ruta formativa Antofagasta Minerals','Capacitación de empresa colaboradora']},
  {k:'q_vacante_antucoya',t:'¿Postula a vacante interna Antucoya (Operador/a de Producción y Equipos de Apoyo)?',op:['Sí','No']},
  {k:'q_ejecutivo',t:'¿Qué ejecutivo/a realizó la atención?',op:null}
];
function construirCuestionario(){
  const cont=document.getElementById('qForm'); let h='';
  CUEST.forEach(q=>{
    h+='<div class="fld"><label>'+esc(q.t)+'</label>';
    if(q.op){ h+='<select id="'+q.k+'"><option value="">—</option>'+q.op.map(o=>'<option>'+esc(o)+'</option>').join('')+'</select>'; }
    else { h+='<input id="'+q.k+'">'; }
    h+='</div>';
  });
  cont.innerHTML=h;
}
function refrescarCuestionarioActual(){
  const info=document.getElementById('qActual');
  if(!ACTUAL||(!ACTUAL.nombres&&!ACTUAL.apellidos&&!ACTUAL.rut)){ info.textContent='⚠ Primero crea o carga una persona en la pestaña Captura.'; return; }
  info.innerHTML='Cuestionario de: <b>'+esc((ACTUAL.nombres||'')+' '+(ACTUAL.apellidos||''))+'</b>'+(ACTUAL.rut?' ('+esc(ACTUAL.rut)+')':'');
  const q=(ACTUAL.cuestionario)||{};
  CUEST.forEach(c=>{ const el=document.getElementById(c.k); if(el) el.value=q[c.k]||''; });
}
async function guardarCuestionario(){
  if(!ACTUAL||(!ACTUAL.nombres&&!ACTUAL.apellidos&&!ACTUAL.rut)){ toast('Primero crea o carga una persona','err'); return; }
  const q={}; CUEST.forEach(c=>{ const el=document.getElementById(c.k); if(el&&el.value) q[c.k]=el.value; });
  ACTUAL.cuestionario=q;
  const {error}=await SB.from('cv_personas').update({cuestionario_json:JSON.stringify(q),updated_by:miNombre(),updated_at:new Date().toISOString()}).eq('cv_id',ACTUAL.cv_id);
  if(error){ toast('Error: '+error.message,'err'); return; }
  try{ await SB.from('cv_logs').insert([{cv_id:ACTUAL.cv_id,usuario_email:miNombre(),accion:'cuestionario',campo:'cuestionario',valor_anterior:'',valor_nuevo:JSON.stringify(q).slice(0,500),origen:'movil.html'}]); }catch(e){}
  toast('✅ Cuestionario guardado','ok');
  await cargarLevantados();
}

// ═══════════ LISTADO ═══════════
async function cargarLevantados(){
  const {data,error}=await SB.from('cv_personas').select('*').neq('estado_registro','Eliminado').order('updated_at',{ascending:false});
  if(error){ toast('Error: '+error.message,'err'); return; }
  LEVANTADOS=(data||[]).map(c=>({...c,
    cursos:(function(){try{return JSON.parse(c.cursos_json||'[]')}catch(e){return[]}})(),
    cuestionario:(function(){try{return JSON.parse(c.cuestionario_json||'{}')}catch(e){return{}}})()
  }));
}
function renderListado(){
  const q=(document.getElementById('lSearch').value||'').toLowerCase().trim();
  const cont=document.getElementById('listadoBody');
  const list=LEVANTADOS.filter(c=>{ if(!q)return true; return [c.nombres,c.apellidos,c.rut,c.comuna].join(' ').toLowerCase().includes(q); });
  if(!list.length){ cont.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:20px">Sin registros.</div>'; return; }
  cont.innerHTML=list.map(c=>{
    const desdeMovil=(c.origen_plataforma==='movil'||c.fuente==='movil');
    const qCount=Object.keys(c.cuestionario||{}).length;
    return '<div class="list-item"><div class="info"><div class="nm">'+esc((c.nombres||'')+' '+(c.apellidos||''))+'</div>'
      +'<div class="mt">'+esc(c.rut||'sin rut')+' · '+esc(c.comuna||'')+(desdeMovil?' · <span class="badge">móvil</span>':'')+(qCount?' · '+qCount+' resp.':'')+'</div></div>'
      +'<button class="btn sec" style="width:auto;padding:8px 12px" onclick="complementar(\''+c.cv_id+'\');movTab(\'captura\',document.querySelector(\'.tabbar button\'))">✏</button>'
      +'<button class="btn gold" style="width:auto;padding:8px 12px" onclick="exportarCVde(\''+c.cv_id+'\')">📄</button></div>';
  }).join('');
}

// ═══════════ CARGA DE ARCHIVO (PDF/Word) ═══════════
async function cargarArchivo(files){
  if(!files||!files.length)return;
  const file=files[0];
  try{
    let texto='';
    if(/\.pdf$/i.test(file.name)){ pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; const buf=await file.arrayBuffer(); const pdf=await pdfjsLib.getDocument({data:buf}).promise; for(let i=1;i<=pdf.numPages;i++){ const p=await pdf.getPage(i); const t=await p.getTextContent(); texto+=t.items.map(x=>x.str).join(' ')+'\n'; } }
    else if(/\.docx?$/i.test(file.name)){ const buf=await file.arrayBuffer(); const r=await mammoth.extractRawText({arrayBuffer:buf}); texto=r.value||''; }
    else { toast('Formato no soportado','err'); return; }
    nuevoRegistro();
    const S=(id,v)=>{ if(v)document.getElementById(id).value=v; };
    const bajo=texto.toLowerCase();
    // RUT, email, teléfonos
    const mrut=texto.match(/(\d{1,2}\.?\d{3}\.?\d{3}\s*[\-\.]?\s*[\dkK])/); if(mrut)S('cRut',mrut[1].replace(/\s/g,''));
    const mail=texto.match(/[\w.\-]+@[\w.\-]+\.\w+/); if(mail)S('fEmail',mail[0]);
    const tels=texto.match(/(\+?56\s?9\s?\d{4}\s?\d{4}|\b9\s?\d{4}\s?\d{4}\b)/g)||[]; if(tels[0])S('fTel',tels[0].trim());
    // fecha nac, nacionalidad, sexo, comuna, dirección
    const mfn=texto.match(/(?:nacimiento|nacid[oa]|f\.?\s*nac)[^\d]{0,15}(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i); if(mfn)S('fNac',mfn[1]);
    if(/chilen[oa]/.test(bajo)) S('fNacion','Chilena');
    if(/femenino|mujer/.test(bajo)) S('fSexo','Femenino'); else if(/masculino|hombre/.test(bajo)) S('fSexo','Masculino');
    const mcom=texto.match(/comuna\s*:?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ ]{3,30})/i); if(mcom)S('fComuna',mcom[1].trim());
    const mdir=texto.match(/(?:direcci[oó]n|domicilio)\s*:?\s*([^\n]{5,60})/i); if(mdir)S('fDir',mdir[1].trim());
    // licencia
    const mlic=texto.match(/licencia[^\n]{0,30}(clase\s*)?([A-E]\-?\d?)/i); if(mlic){ S('fLic','Sí'); S('fTipoLic',(mlic[2]||'').toUpperCase()); } else if(/licencia de conducir/i.test(bajo)) S('fLic','Sí');
    // experiencia minera
    if(/miner[íia]|faena|caex|extracci[oó]n|planta concentradora/i.test(bajo)) S('fMineria','Sí');
    // nombre
    const lineas=texto.split('\n').map(l=>l.trim()).filter(Boolean);
    for(const l of lineas.slice(0,8)){ const p=l.split(/\s+/); if(p.length>=2&&p.length<=5&&/^[A-ZÁÉÍÓÚÑ]/.test(l)&&!/@|\d{3}|rut|curr[íi]culum|vitae/i.test(l)&&p.every(w=>/^[A-ZÁÉÍÓÚÑa-záéíóúñ.\-]+$/.test(w))){ const mid=Math.ceil(p.length/2); S('fNombres',p.slice(0,mid).join(' ')); S('fApellidos',p.slice(mid).join(' ')); break; } }
    // secciones: cursos/certificaciones/educación por encabezado
    function sec(re){ const encs=/(perfil|resumen|experiencia|formaci[oó]n|educaci[oó]n|cursos|seminarios|capacitaci|certificaci|idiomas|habilidades|referencias)/i; for(let i=0;i<lineas.length;i++){ if(re.test(lineas[i])){ const out=[]; for(let j=i+1;j<lineas.length;j++){ if(encs.test(lineas[j])&&lineas[j].length<40)break; out.push(lineas[j]); } return out; } } return null; }
    const cur=sec(/cursos|seminarios|capacitaci|certificaci/i); if(cur&&cur.length) S('fCursos',cur.slice(0,8).map(l=>l.replace(/^[\-•·*]\s*/,'').trim()).join(String.fromCharCode(10)));
    const edu=sec(/formaci[oó]n|educaci[oó]n|estudios/i); if(edu&&edu.length) S('fEducacion',edu.slice(0,4).join(' · '));
    toast('Datos extraídos. Revisa y completa.','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
  document.getElementById('cvArch').value='';
}

// ═══════════ EXPORTAR CV PDF (formato modelo, con QR) ═══════════
async function exportarCVactual(){
  const c=formToObj();
  if(!c.nombres&&!c.apellidos){ toast('Completa el nombre primero','err'); return; }
  await exportarCVpdfObj(c);
}
async function exportarCVde(id){ const c=LEVANTADOS.find(x=>x.cv_id===id); if(!c)return; await exportarCVpdfObj(normalizarParaPDF(c)); }
function normalizarParaPDF(c){
  return {...c, experiencia:[], academico:[], cursos:c.cursos||[],
    idiomas:[], software:[] };
}
async function exportarCVpdfObj(c){
  const fichaUrl=location.origin+location.pathname.replace(/modules\/[^/]*\/.*$/,'modules/empleabilidad/')+'#cv='+encodeURIComponent(c.cv_id);
  let qr=null; try{ const u='https://api.qrserver.com/v1/create-qr-code/?size=180x180&data='+encodeURIComponent(fichaUrl); const b=await (await fetch(u)).blob(); qr=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.onerror=()=>r(null);fr.readAsDataURL(b);}); }catch(e){}
  generarCVpdf(c,{qrUrl:qr});
}

// ═══════════ GENERADOR CV PDF · formato limpio "Apresto Laboral" (sin logo) ═══════════
function generarCVpdf(c,opts){
  opts=opts||{};
  const { jsPDF }=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=210,H=297,M=20; let y=22;
  const dark=[34,34,34],gray=[110,110,110],rule=[180,180,180];
  const nl=()=>{ if(y>H-24){doc.addPage();y=22;} };
  const wrap=(t,w)=>doc.splitTextToSize(String(t||''),w);
  function titulo(t){ nl(); y+=2; doc.setFont('times','bold'); doc.setFontSize(13); doc.setTextColor.apply(doc,dark); doc.text(t,M,y); y+=1.5; doc.setDrawColor.apply(doc,rule); doc.setLineWidth(.3); doc.line(M,y,W-M,y); y+=6; }
  doc.setFont('times','bold'); doc.setFontSize(20); doc.setTextColor.apply(doc,dark);
  doc.text((((c.nombres||'')+' '+(c.apellidos||'')).trim().toUpperCase())||'CURRÍCULUM VITAE',M,y); y+=7;
  doc.setFont('times','normal'); doc.setFontSize(10.5);
  const datos=[];
  if(c.rut)datos.push('RUT: '+c.rut);
  if(c.fecha_nacimiento)datos.push('Fecha de nacimiento: '+c.fecha_nacimiento);
  if(c.nacionalidad)datos.push('Nacionalidad: '+c.nacionalidad);
  const dir=[c.direccion,c.comuna,c.region].filter(Boolean).join(', '); if(dir)datos.push(dir);
  if(c.telefono)datos.push('Teléfono: '+c.telefono);
  if(c.email)datos.push(c.email);
  datos.forEach(d=>{ nl(); doc.text(d,M,y); y+=5; });
  y+=2; doc.setDrawColor.apply(doc,rule); doc.setLineWidth(.4); doc.line(M,y,W-M,y); y+=7;
  if((c.resumen||'').trim()){ titulo('Resumen Profesional'); doc.setFont('times','normal'); doc.setFontSize(10.5); wrap(c.resumen,W-2*M).forEach(l=>{nl();doc.text(l,M,y);y+=5;}); y+=3; }
  if((c.experiencia||[]).length){ titulo('Antecedentes Laborales');
    c.experiencia.forEach(e=>{ nl(); doc.setFont('times','bold'); doc.setFontSize(10.5);
      const emp=[(e.empresa||''),(e.ciudad||'')].filter(Boolean).join('. ')+((e.empresa||e.ciudad)?'.':'');
      doc.text(emp,M,y); const per=[e.desde,e.hasta].filter(Boolean).join(' – ');
      if(per){doc.setFont('times','italic');doc.setFontSize(9.5);doc.text(per,W-M,y,{align:'right'});} y+=5;
      if(e.cargo){doc.setFont('times','bold');doc.setFontSize(10);doc.text(e.cargo,M,y);y+=5;}
      doc.setFont('times','normal');doc.setFontSize(10);
      (e.funciones||[]).forEach(fn=>{ wrap('•  '+fn,W-2*M-3).forEach((l,i)=>{nl();doc.text(l,M+(i?3:0),y);y+=4.8;}); });
      if(e.logro){doc.setFont('times','italic');wrap('Logro: '+e.logro,W-2*M-3).forEach(l=>{nl();doc.text(l,M,y);y+=4.8;});doc.setFont('times','normal');}
      y+=3;
    });
  }
  // Educación (texto directo del móvil)
  if((c.educacion||'').trim()){ titulo('Antecedentes Académicos'); doc.setFont('times','normal'); doc.setFontSize(10.5); wrap(c.educacion,W-2*M).forEach(l=>{nl();doc.text(l,M,y);y+=5;}); y+=3; }
  // Información adicional
  const info=[];
  if(c.licencia||c.tipo_licencia)info.push('Licencia de conducir: '+[c.licencia,c.tipo_licencia].filter(Boolean).join(' '));
  if(c.disponibilidad)info.push('Disponibilidad: '+c.disponibilidad);
  if(c.exp_mineria)info.push('Experiencia en minería: '+c.exp_mineria+(c.anios_exp?(' ('+c.anios_exp+' años)'):''));
  if(c.oficios)info.push('Oficios/cargos: '+c.oficios);
  if(c.certificaciones)info.push('Certificaciones: '+c.certificaciones);
  if(info.length){ titulo('Información Adicional'); doc.setFont('times','normal'); doc.setFontSize(10.5); info.forEach(d=>{ wrap('•  '+d,W-2*M-3).forEach((l,i)=>{nl();doc.text(l,M+(i?3:0),y);y+=4.8;}); }); y+=3; }
  if((c.cursos||[]).length){ titulo('Seminarios y Cursos'); c.cursos.forEach(cu=>{ nl(); doc.setFont('times','normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc,gray); doc.text(String(cu.anio||''),M,y); doc.setTextColor.apply(doc,dark); const t=[cu.evento,cu.tema,cu.institucion].filter(Boolean).join(' — '); wrap(t,W-M-42).forEach((l,i)=>{if(i)nl();doc.text(l,M+16,y);y+=5;}); }); y+=3; }
  if(opts.qrUrl){ try{ const qy=Math.min(y+4,H-40); doc.addImage(opts.qrUrl,'PNG',W-M-26,qy,26,26); doc.setFont('times','italic'); doc.setFontSize(7.5); doc.setTextColor.apply(doc,gray); doc.text('Ficha digital',W-M-13,qy+29,{align:'center'}); }catch(e){} }
  doc.save(('CV_'+(c.nombres||'')+'_'+(c.apellidos||'')).replace(/\s+/g,'_').replace(/[^\w\-]/g,'')+'.pdf');
}

// ═══════════ EXPORTAR CUESTIONARIO CONSOLIDADO (Excel) ═══════════
function exportarCuestionario(){
  if(!LEVANTADOS.length){ toast('No hay personas levantadas','err'); return; }
  const rows=LEVANTADOS.map(c=>{
    const q=c.cuestionario||{};
    const base={
      RUT:c.rut||'', 'Nombre completo':((c.nombres||'')+' '+(c.apellidos||'')).trim(),
      Comuna:c.comuna||'', Region:c.region||'', Telefono:c.telefono||'', Correo:c.email||'',
      Sexo:c.sexo||'', Nacionalidad:c.nacionalidad||'',
      'Fecha levantamiento':c.fecha_levantamiento||'', 'Levantado por':c.levantado_por||'',
      'Estado CV':(c.origen_plataforma==='movil'?'Móvil':'Empleabilidad'),
      Licencia:[c.licencia,c.tipo_licencia].filter(Boolean).join(' '),
      Disponibilidad:c.disponibilidad||'', 'Exp. minería':c.exp_mineria||'', 'Años exp':c.anios_exp||'',
      Educacion:c.educacion||'', Certificaciones:c.certificaciones||'', Observaciones:c.observaciones||''
    };
    CUEST.forEach(qq=>{ base[qq.t]=q[qq.k]||''; });
    base['Link ficha CV']=location.origin+location.pathname.replace(/modules\/[^/]*\/.*$/,'modules/empleabilidad/')+'#cv='+c.cv_id;
    return base;
  });
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Cuestionario');
  XLSX.writeFile(wb,'Cuestionario_OficinaMovil_'+new Date().toISOString().slice(0,10)+'.xlsx');
  toast('✅ Cuestionario exportado ('+rows.length+')','ok');
}
