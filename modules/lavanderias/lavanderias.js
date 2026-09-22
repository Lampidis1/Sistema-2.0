// ═══════════════════════════════════════════════════════════════════════════
// lavanderias.js — App de la lavandería (Lavanderías Sierra Gorda)
// Sistema AM · Antofagasta Minerals
//
// Reusa Supabase Auth para el login; el acceso al módulo lo controla el slug
// 'lavanderias' (lo aprueba el admin). Toda la data pasa por funciones
// public.lav_* (SECURITY DEFINER) — el esquema lavanderias no se toca directo.
//
// <script src> clásico, nunca type="module" — CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════
let SB=null, USER=null, EMP=null;
let CONTRATOS=[], CONTRATO=null, BOLSAS=[];
let CAT={cama:[], trabajo:[]};   // nombres de prendas por categoría
let CNT={cama:{}, trabajo:{}};   // nombre -> cantidad
let TAB='cama';                  // categoría activa al crear bolsa
let YA_LOGUEADO=false;           // registro de empresa con sesión ya iniciada

const esc = s => String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const val = id => { const e=document.getElementById(id); return e?e.value.trim():''; };
const CAT_LABEL = { cama:'Ropa de cama', trabajo:'Ropa de trabajo' };

function toast(msg, tipo){
  const t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.className='lav-toast on '+(tipo||''); clearTimeout(t._t);
  t._t=setTimeout(()=>{ t.className='lav-toast'; }, 3200);
}
function gateErr(msg){ const e=document.getElementById('gateErr'); if(e){ e.textContent=msg||''; e.className='lavg-err'+(msg?' on':''); } }
function fechaHora(iso){ if(!iso) return ''; const d=new Date(iso); return d.toLocaleDateString('es-CL')+' · '+d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}); }

// ── Arranque y ruteo ─────────────────────────────────────────────────────────
async function lavBoot(){
  SB = window.supabase.createClient(window.SUPA_CFG.url, window.SUPA_CFG.key);
  // Restablecer contraseña: si llega desde el enlace del correo, mostrar el
  // formulario de nueva contraseña en vez de entrar a la app.
  SB.auth.onAuthStateChange((ev)=>{ if(ev==='PASSWORD_RECOVERY') lavVer('recovery'); });
  if(location.hash.includes('type=recovery')){ lavVer('recovery'); return; }
  const { data:{ session } } = await SB.auth.getSession();
  if(session){ try{ await SB.auth.refreshSession(); }catch(e){} await rutear(); }
  else lavVer('login');
}
async function rutear(){
  try{
    const { data:{ user } } = await SB.auth.getUser(); USER=user;
    const { data, error } = await SB.rpc('lav_mi_acceso');
    if(error) throw error;
    const est = data.estado;
    if(data.rol==='admin'){ lavVer('admin'); return; }   // admin → panel de administración
    if(est==='aprobado'){ EMP=data.empresa; mostrarApp(); await cargarContratos(); }
    else if(est==='pendiente'){ lavVer('pend'); }
    else if(est==='no_registrado'){ YA_LOGUEADO=true; lavVer('reg'); }
    else lavVer('login');
  }catch(e){ toast('Error al validar acceso: '+e.message,'err'); lavVer('login'); }
}
function lavVer(v){
  document.getElementById('app').classList.add('hidden');
  document.getElementById('gate').classList.remove('hidden');
  ['loginStep','regStep','pendStep','adminStep','recoveryStep'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
  gateErr('');
  document.getElementById('gate').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
  if(v==='admin'){ const a=document.getElementById('adminStep'); if(a) a.style.display=''; return; }
  if(v==='recovery'){ const r=document.getElementById('recoveryStep'); if(r) r.style.display=''; return; }
  if(v==='login'){ document.getElementById('loginStep').style.display=''; }
  else if(v==='reg'){
    document.getElementById('regStep').style.display='';
    // si ya inició sesión (solo falta registrar la empresa), ocultar contraseña y fijar correo
    const pw=document.getElementById('rgPassWrap');
    if(YA_LOGUEADO && USER){ if(pw) pw.style.display='none';
      const c=document.getElementById('rgCorreo'); if(c){ c.value=USER.email||''; c.readOnly=true; } }
    else { if(pw) pw.style.display=''; }
  }
  else if(v==='pend'){ document.getElementById('pendStep').style.display=''; }
}
function mostrarApp(){
  document.getElementById('gate').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('hEmpresa').textContent = EMP ? (EMP.nombre||'') : '';
  verVista('vContratos');
}
function verVista(id){
  ['vContratos','vBolsas','vCrear'].forEach(v=>{ const el=document.getElementById(v); if(el) el.classList.toggle('hidden', v!==id); });
  window.scrollTo(0,0);
}

// ── Login / registro / salir ─────────────────────────────────────────────────
async function lavEntrar(){
  const email=val('lgEmail'), pass=document.getElementById('lgPass').value;
  if(!email || !pass){ gateErr('Escribe correo y contraseña'); return; }
  gateErr('');
  const { error } = await SB.auth.signInWithPassword({ email, password:pass });
  if(error){ gateErr('No se pudo ingresar: '+error.message); return; }
  try{ await SB.auth.refreshSession(); }catch(e){}
  await rutear();
}
async function lavRegistrar(){
  const email=val('rgCorreo');
  const emp={ nombre:val('rgNombre'), razon_social:val('rgRazon'), rut:val('rgRut'),
    direccion:val('rgDir'), contacto_nombre:val('rgContacto'), contacto_fono:val('rgFono'), contacto_correo:email };
  if(!emp.nombre){ gateErr('Escribe el nombre de la empresa'); return; }
  if(!email){ gateErr('Escribe el correo'); return; }
  let { data:{ session } } = await SB.auth.getSession();
  if(!session){
    const pass=document.getElementById('rgPass').value;
    if(!pass || pass.length<6){ gateErr('La contraseña debe tener al menos 6 caracteres'); return; }
    const { error } = await SB.auth.signUp({ email, password:pass });
    if(error){ gateErr('No se pudo crear la cuenta: '+error.message); return; }
    session = (await SB.auth.getSession()).data.session;
    if(!session){ alert('Cuenta creada. Confirma tu correo, ingresa y completa el registro de la empresa.'); lavVer('login'); return; }
  }
  try{
    const { data, error } = await SB.rpc('lav_registrar', { p_empresa:emp, p_correo:email });
    if(error) throw error;
    // que el admin la vea en el panel de aprobación de siempre
    try{ await SB.rpc('registrar_solicitud', { p_uid:session.user.id, p_nombre:emp.nombre, p_apellido:'',
      p_email:email, p_origen:'lavanderias', p_rol_sol:'usuario', p_faena_sol:'lavanderias' }); }catch(e){}
    lavVer('pend');
  }catch(e){ gateErr('No se pudo registrar: '+e.message); }
}
async function lavSalir(){ try{ await SB.auth.signOut(); }catch(e){} location.reload(); }

// ── Restablecer contraseña ───────────────────────────────────────────────────
async function lavOlvide(){
  let email = val('lgEmail');
  if(!email){ email = (prompt('Escribe tu correo y te enviaremos un enlace para restablecer la contraseña:')||'').trim(); }
  if(!email){ return; }
  const redirectTo = location.origin + location.pathname;   // vuelve a esta misma página
  const { error } = await SB.auth.resetPasswordForEmail(email, { redirectTo });
  if(error){ gateErr('No se pudo enviar el correo: '+error.message); return; }
  gateErr('');
  toast('📧 Te enviamos un correo para restablecer la contraseña','ok');
}
async function lavNuevaClave(){
  const p1 = document.getElementById('rcPass1').value, p2 = document.getElementById('rcPass2').value;
  if(!p1 || p1.length < 6){ gateErr('La contraseña debe tener al menos 6 caracteres'); return; }
  if(p1 !== p2){ gateErr('Las contraseñas no coinciden'); return; }
  const { error } = await SB.auth.updateUser({ password: p1 });
  if(error){ gateErr('No se pudo cambiar la contraseña: '+error.message); return; }
  history.replaceState(null, '', location.pathname);   // limpiar el token del enlace
  toast('✅ Contraseña actualizada','ok');
  await rutear();
}

// ── Contratos ────────────────────────────────────────────────────────────────
async function cargarContratos(){
  const { data, error } = await SB.rpc('lav_contratos');
  if(error){ toast('Error al cargar contratos: '+error.message,'err'); return; }
  CONTRATOS = (data && data.contratos) || [];
  renderContratos();
}
function renderContratos(){
  const cont=document.getElementById('vContratos');
  cont.innerHTML = `
    <div class="lav-card">
      <div class="lav-sec-t">📄 Contratos</div>
      <div class="lav-row" style="margin-bottom:6px">
        <button class="lav-btn" onclick="toggleNuevoContrato()">＋ Nuevo contrato</button>
      </div>
      <div id="nuevoContrato" class="hidden" style="margin-top:12px;border-top:1px solid var(--lav-border);padding-top:12px">
        <div class="lav-row">
          <input class="lav-in" id="cNombre" placeholder="Nombre del contrato" style="flex:1;min-width:180px">
          <input class="lav-in" id="cNumero" placeholder="N° de contrato" style="width:150px">
        </div>
        <div class="lav-row" style="margin-top:8px">
          <input class="lav-in" id="cRetira" placeholder="Empresa que retira" style="flex:1;min-width:180px">
          <button class="lav-btn" onclick="crearContrato()">Crear</button>
        </div>
      </div>
    </div>
    ${!CONTRATOS.length ? '<div class="lav-empty">Aún no tienes contratos. Crea el primero para empezar a registrar bolsas.</div>'
      : CONTRATOS.map(c=>`
        <div class="lav-item">
          <div>
            <div class="nm">${esc(c.nombre)}</div>
            <div class="mt">${c.numero?('N° '+esc(c.numero)+' · '):''}${c.empresa_retira_nombre?('Retira: '+esc(c.empresa_retira_nombre)+' · '):''}${c.n_bolsas||0} bolsa(s)</div>
          </div>
          <button class="lav-btn sec" onclick="abrirContrato('${c.contrato_id}')">Ver bolsas →</button>
        </div>`).join('')}`;
}
function toggleNuevoContrato(){ document.getElementById('nuevoContrato').classList.toggle('hidden'); }
async function crearContrato(){
  const nombre=val('cNombre'); if(!nombre){ toast('Escribe el nombre del contrato','err'); return; }
  const { data, error } = await SB.rpc('lav_contrato_crear', { p_nombre:nombre, p_numero:val('cNumero'), p_retira_nombre:val('cRetira') });
  if(error || (data&&data.error)){ toast('No se pudo crear: '+((data&&data.error)||error.message),'err'); return; }
  toast('✅ Contrato creado','ok');
  await cargarContratos();
}

// ── Bolsas de un contrato ────────────────────────────────────────────────────
async function abrirContrato(id){
  CONTRATO = CONTRATOS.find(c=>c.contrato_id===id) || {contrato_id:id};
  verVista('vBolsas');
  await cargarBolsas();
}
async function cargarBolsas(){
  const { data, error } = await SB.rpc('lav_bolsas', { p_contrato_id:CONTRATO.contrato_id });
  if(error || (data&&data.error)){ toast('Error al cargar bolsas','err'); BOLSAS=[]; }
  else BOLSAS = (data && data.bolsas) || [];
  renderBolsas();
}
function renderBolsas(){
  const cont=document.getElementById('vBolsas');
  cont.innerHTML = `
    <button class="lav-back" onclick="verVista('vContratos')">← Contratos</button>
    <div class="lav-card">
      <div class="lav-sec-t">🧺 ${esc(CONTRATO.nombre||'Contrato')}</div>
      <div class="lav-row"><button class="lav-btn" onclick="crearBolsaUI()">＋ Crear bolsa de entrega</button></div>
    </div>
    ${!BOLSAS.length ? '<div class="lav-empty">Este contrato aún no tiene bolsas registradas.</div>'
      : BOLSAS.map(b=>{
        const vig = new Date(b.expira_at) > new Date();
        return `<div class="lav-item">
          <div>
            <div class="nm" style="letter-spacing:.12em">${esc(b.codigo)} ${vig?'':'<span class="mt">(vencida)</span>'}</div>
            <div class="mt">${fechaHora(b.created_at)} · ${b.total_prendas||0} prenda(s) · ${b.kilogramos!=null?b.kilogramos+' kg':'sin kg'}</div>
          </div>
          <a class="lav-btn sec" href="buscar.html?codigo=${encodeURIComponent(b.codigo)}" target="_blank">Ver ↗</a>
        </div>`; }).join('')}`;
}

// ── Crear bolsa (sumadores + buscador) ───────────────────────────────────────
async function crearBolsaUI(){
  CNT={cama:{}, trabajo:{}}; CAT={cama:[], trabajo:[]}; TAB='cama';
  verVista('vCrear');
  document.getElementById('vCrear').innerHTML = `
    <button class="lav-back" onclick="verVista('vBolsas')">← Bolsas</button>
    <div class="lav-card">
      <div class="lav-sec-t">＋ Nueva bolsa · ${esc(CONTRATO.nombre||'')}</div>
      <div class="lav-tabs">
        <button class="lav-tab" id="tabCama" onclick="bolsaTab('cama')">🛏 Ropa de cama</button>
        <button class="lav-tab" id="tabTrabajo" onclick="bolsaTab('trabajo')">👕 Ropa de trabajo</button>
      </div>
      <input class="lav-in" id="bBuscar" placeholder="🔍 Buscar prenda…" style="width:100%;margin-bottom:12px" oninput="renderPrendas()">
      <div id="bLista"></div>
      <div class="lav-row" style="margin-top:10px">
        <input class="lav-in" id="bNueva" list="bDatalist" placeholder="Agregar prenda del listado…" style="flex:1;min-width:160px"
               onkeydown="if(event.key==='Enter')agregarPrenda()">
        <datalist id="bDatalist"></datalist>
        <button class="lav-btn gray" onclick="agregarPrenda()">＋ Agregar prenda</button>
      </div>
      <div class="lav-hint">Solo prendas del listado del administrador. ¿Falta una? Pídele al administrador que la agregue.</div>
    </div>
    <div class="lav-crear-foot">
      <div class="lav-kilos-row">
        <span class="lav-total-chip" id="bTotal">0 prendas</span>
        <label style="font-weight:700;font-size:.85rem">Kilogramos del bulto</label>
        <input class="lav-in" id="bKilos" type="number" min="0" step="0.1" placeholder="0.0">
        <button class="lav-btn" onclick="finalizarBolsa()">✅ Finalizar</button>
      </div>
    </div>`;
  await Promise.all([cargarCatalogo('cama'), cargarCatalogo('trabajo')]);
  bolsaTab('cama');
}
async function cargarCatalogo(cat){
  const { data, error } = await SB.rpc('lav_catalogo', { p_categoria:cat });
  CAT[cat] = (!error && data && data.prendas) ? data.prendas.slice() : [];
}
function bolsaTab(cat){
  TAB=cat;
  document.getElementById('tabCama').classList.toggle('on', cat==='cama');
  document.getElementById('tabTrabajo').classList.toggle('on', cat==='trabajo');
  const b=document.getElementById('bBuscar'); if(b) b.value='';
  renderPrendas();
}
function llenarDatalist(){
  const dl=document.getElementById('bDatalist'); if(!dl) return;
  // solo prendas del catálogo del administrador de la categoría activa
  dl.innerHTML=CAT[TAB].map(n=>`<option value="${esc(n)}"></option>`).join('');
}
function renderPrendas(){
  const q=(document.getElementById('bBuscar').value||'').toLowerCase().trim();
  const lista=CAT[TAB].filter(n=>!q || n.toLowerCase().includes(q));
  llenarDatalist();
  const cont=document.getElementById('bLista');
  if(!lista.length){ cont.innerHTML='<div class="lav-empty">Sin prendas. Usa «Agregar prenda» para añadir una.</div>'; return; }
  cont.innerHTML = lista.map(n=>{
    const q2=CNT[TAB][n]||0;
    const id='pq_'+TAB+'_'+btoa(unescape(encodeURIComponent(n))).replace(/[^a-zA-Z0-9]/g,'');
    return `<div class="lav-prenda">
      <span class="pn">${esc(n)}</span>
      <span class="lav-sum">
        <button class="menos" onclick="bolsaSum('${encodeURIComponent(n)}',-1)">−</button>
        <span class="qty" id="${id}">${q2}</span>
        <button class="mas" onclick="bolsaSum('${encodeURIComponent(n)}',1)">＋</button>
      </span></div>`;
  }).join('');
}
function bolsaSum(nombreEnc, delta){
  const n=decodeURIComponent(nombreEnc);
  const actual=CNT[TAB][n]||0;
  const nuevo=Math.max(0, actual+delta);
  CNT[TAB][n]=nuevo;
  const id='pq_'+TAB+'_'+btoa(unescape(encodeURIComponent(n))).replace(/[^a-zA-Z0-9]/g,'');
  const el=document.getElementById(id); if(el) el.textContent=nuevo;
  actualizarTotal();
}
function agregarPrenda(){
  const inp=document.getElementById('bNueva'); const nombre=(inp.value||'').trim();
  if(!nombre) return;
  // Validar contra el listado del administrador: solo se puede sumar una prenda
  // que exista en el catálogo de esta categoría. No se inventan prendas nuevas.
  const oficial=CAT[TAB].find(n=>n.toLowerCase()===nombre.toLowerCase());
  if(!oficial){
    toast('«'+nombre+'» no está en el listado del administrador','err');
    return;
  }
  CNT[TAB][oficial]=(CNT[TAB][oficial]||0)+1;   // suma 1 a la prenda oficial
  inp.value=''; document.getElementById('bBuscar').value='';
  renderPrendas(); actualizarTotal();
}
function actualizarTotal(){
  let t=0; ['cama','trabajo'].forEach(c=>{ Object.values(CNT[c]).forEach(q=>t+=(+q||0)); });
  const el=document.getElementById('bTotal'); if(el) el.textContent=t+' prenda'+(t===1?'':'s');
}
async function finalizarBolsa(){
  const items=[];
  ['cama','trabajo'].forEach(cat=>{ Object.entries(CNT[cat]).forEach(([nombre,q])=>{ if((+q||0)>0) items.push({categoria:cat, nombre, cantidad:+q}); }); });
  if(!items.length){ toast('Agrega al menos una prenda','err'); return; }
  const kilos = parseFloat(document.getElementById('bKilos').value);
  const { data, error } = await SB.rpc('lav_bolsa_crear', {
    p_contrato_id:CONTRATO.contrato_id, p_items:items, p_kilos:isNaN(kilos)?null:kilos });
  if(error || (data&&data.error)){ toast('No se pudo guardar: '+((data&&data.error)||error.message),'err'); return; }
  mostrarCodigo(data.codigo, data.total, isNaN(kilos)?null:kilos);
}
function mostrarCodigo(codigo, total, kilos){
  const url = new URL('buscar.html', location.href).href.split('?')[0] + '?codigo=' + encodeURIComponent(codigo);
  document.getElementById('vCrear').innerHTML = `
    <div class="lav-card lav-cod-ok">
      <div style="font-size:2.2rem">✅</div>
      <div class="lav-sec-t" style="text-align:center">Bolsa registrada</div>
      <div class="sub">Este es el código de la bolsa (guárdalo en la bolsa):</div>
      <div class="big">${esc(codigo)}</div>
      <div class="sub">${total||0} prenda(s)${kilos!=null?(' · '+kilos+' kg'):''} · válido por 3 meses</div>
      <div class="lav-row" style="justify-content:center;margin-top:16px">
        <button class="lav-btn sec" onclick="lavCopiar('${esc(codigo)}')">📋 Copiar código</button>
        <a class="lav-btn sec" href="${esc(url)}" target="_blank">🔍 Ver público</a>
        <button class="lav-btn" onclick="crearBolsaUI()">＋ Nueva bolsa</button>
      </div>
      <div style="margin-top:14px"><button class="lav-back" onclick="verVista('vBolsas');cargarBolsas()">← Volver a las bolsas</button></div>
    </div>`;
}
function lavCopiar(txt){
  try{ navigator.clipboard.writeText(txt); }catch(e){}
  toast('🔗 Código copiado','ok');
}

window.addEventListener('DOMContentLoaded', lavBoot);
