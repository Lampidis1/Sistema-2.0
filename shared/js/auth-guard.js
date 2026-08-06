// ═══════════════════════════════════════════════════════════════════════════
// auth-guard.js — Login + registro + restauración de sesión, compartido
// Sistema AM · Antofagasta Minerals
//
// P-6 (docs/PENDIENTES.md), fase 1: extrae el bloque de login que hoy está
// duplicado en cada módulo. Cubre por ahora los dos módulos cuyo flujo era
// prácticamente idéntico: movil y empleabilidad. mgi, las 3 faenas y
// proveedores tienen flujos genuinamente distintos entre sí (DOM propio,
// reglas de acceso propias) y quedan para fases siguientes.
//
// CADA MÓDULO DEBE DEFINIR window.AUTH_CFG ANTES DE CARGAR ESTE ARCHIVO:
//
//   <script>window.AUTH_CFG = {
//     storageKey: 'am_mov_auth',
//     slug: 'movil',                        // slug de acceso propio del módulo
//     altSlugs: ['empleabilidad','principal'], // otros slugs que TAMBIÉN dan acceso
//     origen: 'movil',                      // p_origen para registrar_solicitud
//     rolSolicitado: 'usuario',             // p_rol_sol
//     faenaSolicitada: 'movil',             // p_faena_sol
//     msgPassCorta: 'Mínimo 6 caracteres',  // texto exacto que ya mostraba el módulo
//     onRegistroOk: null,                   // opcional: algo extra tras registrarse
//     onAcceso: function(user){ ... }       // lo propio del módulo tras validar acceso
//   };</script>
//   <script src="../../shared/js/auth-guard.js"></script>
//
// Cargar con <script src> clásico. NUNCA type="module": los onclick del HTML
// necesitan que estas funciones sean globales. Ver CLAUDE.md §6.
//
// El módulo que lo usa SIGUE declarando y usando SB / USER / ES_ADMIN como
// globales (no re-declararlos con let/const ahí -- ya quedan declarados acá).
// ═══════════════════════════════════════════════════════════════════════════

const AG_CFG = window.AUTH_CFG || {};
if(!AG_CFG.slug || !AG_CFG.storageKey || typeof AG_CFG.onAcceso!=='function'){
  document.addEventListener('DOMContentLoaded', ()=>{
    document.body.innerHTML = '<div style="font:16px system-ui;padding:40px;text-align:center">'
      + 'Error de configuración: falta <code>window.AUTH_CFG</code>.<br>'
      + 'Revisa el index.html de este módulo.</div>';
  });
  throw new Error('auth-guard.js: falta window.AUTH_CFG');
}

let SB=null, USER=null, ES_ADMIN=false;

const _AG_SUPA = { url:(window.SUPA_CFG&&window.SUPA_CFG.url)||'', key:(window.SUPA_CFG&&window.SUPA_CFG.key)||'' };
function initSB(){
  if(SB) return true;
  if(!_AG_SUPA.url||!_AG_SUPA.key){ gateErr('Falta config.js'); return false; }
  SB=supabase.createClient(_AG_SUPA.url,_AG_SUPA.key,{auth:{persistSession:true,autoRefreshToken:true,storageKey:AG_CFG.storageKey}});
  return true;
}

function gateErr(m){ const e=document.getElementById('gateErr'); if(!m){e.style.display='none';return;} e.textContent=m; e.style.display='block'; }
function verRegistro(){ document.getElementById('loginStep').style.display='none'; document.getElementById('regStep').style.display='block'; gateErr(''); }
function verLogin(){ document.getElementById('regStep').style.display='none'; document.getElementById('pendStep').style.display='none'; document.getElementById('loginStep').style.display='block'; gateErr(''); }

async function entrar(){
  gateErr(''); if(!initSB())return;
  const email=document.getElementById('lgEmail').value.trim().toLowerCase(), pass=document.getElementById('lgPass').value;
  if(!email||!pass){gateErr('Ingresa correo y contraseña');return;}
  const btn=document.getElementById('lgBtn'); btn.disabled=true; btn.textContent='Ingresando…';
  try{ const {data,error}=await SB.auth.signInWithPassword({email,password:pass}); if(error)throw error; await _agTrasLogin(data.user); }
  catch(e){ gateErr(e.message.includes('Invalid')?'Correo o contraseña incorrectos':e.message); }
  finally{ btn.disabled=false; btn.textContent='Ingresar'; }
}

async function registrarse(){
  gateErr(''); if(!initSB())return;
  const nombre=document.getElementById('rgNombre').value.trim(), apellido=document.getElementById('rgApellido').value.trim();
  const email=document.getElementById('rgEmail').value.trim().toLowerCase(), pass=document.getElementById('rgPass').value;
  if(!nombre||!email||!pass){gateErr('Completa nombre, correo y contraseña');return;}
  if(pass.length<6){gateErr(AG_CFG.msgPassCorta||'Mínimo 6 caracteres');return;}
  const btn=document.getElementById('rgBtn'); btn.disabled=true; btn.textContent='Creando…';
  try{
    const {data,error}=await SB.auth.signUp({email,password:pass}); if(error)throw error;
    const uid=data.user&&data.user.id;
    if(uid){ try{ await SB.rpc('registrar_solicitud',{p_uid:uid,p_nombre:nombre,p_apellido:apellido,p_email:email,p_origen:AG_CFG.origen,p_rol_sol:AG_CFG.rolSolicitado,p_faena_sol:AG_CFG.faenaSolicitada}); }catch(e){} }
    verLogin(); if(typeof toast==='function') toast('✅ Solicitud enviada. Un administrador debe aprobarte.','ok');
    if(typeof AG_CFG.onRegistroOk==='function') AG_CFG.onRegistroOk();
  }catch(e){ gateErr(e.message.includes('already registered')?'Ese correo ya está registrado':e.message); }
  finally{ btn.disabled=false; btn.textContent='Solicitar acceso'; }
}

async function salir(){ try{ await SB.auth.signOut(); }catch(e){} location.reload(); }

async function _agTrasLogin(user){
  USER=user; const md=(user&&user.app_metadata)||{};
  ES_ADMIN=(md.rol==='admin');
  const accesos=Array.isArray(md.accesos)?md.accesos:[];
  const slugs=[AG_CFG.slug].concat(AG_CFG.altSlugs||[]);
  const ok = ES_ADMIN || (md.estado==='aprobado' && slugs.some(s=>accesos.includes(s)));
  if(!ok){
    document.getElementById('loginStep').style.display='none';
    document.getElementById('regStep').style.display='none';
    document.getElementById('pendStep').style.display='block';
    return;
  }
  await AG_CFG.onAcceso(user);
}

window.addEventListener('DOMContentLoaded',async()=>{ if(!initSB())return; const {data}=await SB.auth.getSession(); if(data&&data.session&&data.session.user){
  // Refrescar el token para traer los accesos actualizados. Sin esto, si el
  // usuario maestro cambia los permisos de alguien, esa persona sigue con el
  // JWT viejo hasta cerrar sesion. Ver docs/PENDIENTES.md P-10.
  let usuario=data.session.user;
  try{ const {data:ref}=await SB.auth.refreshSession(); if(ref&&ref.session&&ref.session.user) usuario=ref.session.user; }catch(e){}
  await _agTrasLogin(usuario);
} });
