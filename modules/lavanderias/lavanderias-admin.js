// ═══════════════════════════════════════════════════════════════════════════
// lavanderias-admin.js — Panel de administración (Lavanderías Sierra Gorda)
// Sistema AM · Antofagasta Minerals
//
// Solo para el administrador del sistema (es_admin). Muestra métricas por
// lavandería (prendas y kilos) y gestiona el catálogo de prendas (cama/trabajo)
// que valida "agregar prenda" en la app de la lavandería. Todo por RPCs
// public.lav_admin_*. <script src> clásico, nunca type="module" — CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════
let SB=null, MET=[], EMPRESAS=[], CAT_EMP='', API_EMP='';   // *_EMP: empresa activa

const esc = s => String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const val = id => { const e=document.getElementById(id); return e?e.value.trim():''; };
function toast(msg,tipo){ const t=document.getElementById('toast'); if(!t)return; t.textContent=msg; t.className='lav-toast on '+(tipo||''); clearTimeout(t._t); t._t=setTimeout(()=>t.className='lav-toast',3200); }
function gateErr(m){ const e=document.getElementById('gateErr'); if(e){ e.textContent=m||''; e.className='lavg-err'+(m?' on':''); } }

async function adBoot(){
  SB = window.supabase.createClient(window.SUPA_CFG.url, window.SUPA_CFG.key);
  SB.auth.onAuthStateChange((ev)=>{ if(ev==='PASSWORD_RECOVERY') verGate('recovery'); });
  if(location.hash.includes('type=recovery')){ verGate('recovery'); return; }
  const { data:{ session } } = await SB.auth.getSession();
  if(session){ try{ await SB.auth.refreshSession(); }catch(e){} await rutear(); }
  else verGate('login');
}
async function rutear(){
  try{
    const { data, error } = await SB.rpc('lav_mi_acceso');
    if(error) throw error;
    if(data.rol==='admin'){ mostrarApp(); }
    else verGate('noadmin');
  }catch(e){ verGate('login'); }
}
function verGate(v){
  document.getElementById('app').classList.add('hidden');
  document.getElementById('gate').classList.remove('hidden');
  document.getElementById('loginStep').style.display = v==='login'?'':'none';
  document.getElementById('noAdmin').style.display = v==='noadmin'?'':'none';
  const rec=document.getElementById('recoveryStep'); if(rec) rec.style.display = v==='recovery'?'':'none';
  gateErr('');
}
async function adOlvide(){
  let email = val('lgEmail');
  if(!email){ email = (prompt('Escribe tu correo y te enviaremos un enlace para restablecer la contraseña:')||'').trim(); }
  if(!email) return;
  const { error } = await SB.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
  if(error){ gateErr('No se pudo enviar el correo: '+error.message); return; }
  gateErr(''); toast('📧 Te enviamos un correo para restablecer la contraseña','ok');
}
async function adNuevaClave(){
  const p1=document.getElementById('rcPass1').value, p2=document.getElementById('rcPass2').value;
  if(!p1 || p1.length<6){ gateErr('La contraseña debe tener al menos 6 caracteres'); return; }
  if(p1!==p2){ gateErr('Las contraseñas no coinciden'); return; }
  const { error } = await SB.auth.updateUser({ password:p1 });
  if(error){ gateErr('No se pudo cambiar la contraseña: '+error.message); return; }
  history.replaceState(null,'',location.pathname);
  toast('✅ Contraseña actualizada','ok');
  await rutear();
}
async function adEntrar(){
  const email=val('lgEmail'), pass=document.getElementById('lgPass').value;
  if(!email||!pass){ gateErr('Escribe correo y contraseña'); return; }
  const { error } = await SB.auth.signInWithPassword({ email, password:pass });
  if(error){ gateErr('No se pudo ingresar: '+error.message); return; }
  try{ await SB.auth.refreshSession(); }catch(e){}
  await rutear();
}
async function adSalir(){ try{ await SB.auth.signOut(); }catch(e){} location.reload(); }

async function mostrarApp(){
  document.getElementById('gate').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  await Promise.all([cargarMetricas(), cargarEmpresas()]);
}
function adTab(t){
  ['met','cat','api'].forEach(x=>{
    document.getElementById('tab'+x[0].toUpperCase()+x.slice(1)).classList.toggle('on', t===x);
    document.getElementById('v'+x[0].toUpperCase()+x.slice(1)).classList.toggle('hidden', t!==x);
  });
  if(t==='api') renderApi();
}

// ── Métricas ─────────────────────────────────────────────────────────────────
async function cargarMetricas(){
  const { data, error } = await SB.rpc('lav_admin_metricas');
  if(error || (data&&data.error)){ toast('Error al cargar métricas','err'); return; }
  MET = (data&&data.empresas) || [];
  renderMetricas();
}
function renderMetricas(){
  const tot = MET.reduce((a,e)=>{ a.b+=+e.n_bolsas||0; a.p+=+e.prendas||0; a.k+=+e.kg||0; return a; },{b:0,p:0,k:0});
  const cont=document.getElementById('vMet');
  cont.innerHTML = `
    <div class="lav-card">
      <div class="lav-sec-t">📊 Resumen general</div>
      <div class="lavr-kpis" style="grid-template-columns:repeat(3,1fr)">
        <div><b>${MET.length}</b><span>Lavanderías</span></div>
        <div><b>${tot.p}</b><span>Prendas lavadas</span></div>
        <div><b>${(Math.round(tot.k*10)/10)}</b><span>Kilos en total</span></div>
      </div>
    </div>
    ${!MET.length ? '<div class="lav-empty">Aún no hay lavanderías con bolsas registradas.</div>'
      : MET.map((e,i)=>{
        const det=(e.detalle||[]);
        return `<div class="lav-card">
          <div class="lav-sec-t" style="font-size:1.05rem;margin-bottom:6px">🧺 ${esc(e.nombre)}${e.rut?` <span style="font-size:.8rem;color:var(--lav-muted)">${esc(e.rut)}</span>`:''}</div>
          <div class="lavr-kpis" style="grid-template-columns:repeat(3,1fr);margin-bottom:10px">
            <div><b>${e.n_bolsas||0}</b><span>Bolsas</span></div>
            <div><b>${e.prendas||0}</b><span>Prendas lavadas</span></div>
            <div><b>${Math.round((+e.kg||0)*10)/10}</b><span>Kilos</span></div>
          </div>
          ${det.length?`<details class="lav-det"><summary>Ver prendas (${det.length})</summary>
            <table class="lavr-tabla" style="margin-top:8px"><thead><tr><th>Prenda</th><th>Categoría</th><th class="num">Cantidad</th></tr></thead>
            <tbody>${det.map(d=>`<tr><td>${esc(d.nombre)}</td><td>${d.categoria==='cama'?'Ropa de cama':'Ropa de trabajo'}</td><td class="num">${d.cantidad}</td></tr>`).join('')}</tbody></table>
          </details>`:'<div class="lav-hint">Sin prendas registradas todavía.</div>'}
        </div>`;
      }).join('')}`;
}

// ── Catálogo de prendas ──────────────────────────────────────────────────────
async function cargarEmpresas(){
  const { data } = await SB.rpc('lav_admin_empresas');
  EMPRESAS = (data&&data.empresas) || [];
  await cargarCatalogo();
}
async function cargarCatalogo(){
  const { data, error } = await SB.rpc('lav_admin_catalogo', { p_empresa_id: CAT_EMP || null });
  const prendas = (!error && data && data.prendas) ? data.prendas : [];
  renderCatalogo(prendas);
}
function adSetEmpresa(v){ CAT_EMP=v; cargarCatalogo(); }
function renderCatalogo(prendas){
  const porCat = { cama:[], trabajo:[] };
  prendas.forEach(p=>{ (porCat[p.categoria]=porCat[p.categoria]||[]).push(p); });
  const bloque = cat => {
    const arr = porCat[cat]||[];
    return `<div class="lav-card">
      <div class="lav-sec-t">${cat==='cama'?'🛏 Ropa de cama':'👕 Ropa de trabajo'}</div>
      ${arr.length ? arr.map(p=>`<div class="lav-item" style="padding:9px 12px">
          <div><span class="nm">${esc(p.nombre)}</span> ${p.global?'<span class="lav-chip-g">global</span>':''}</div>
          ${p.global && CAT_EMP ? '<span class="mt">del listado global</span>'
            : `<button class="lav-btn gray" style="padding:6px 12px" onclick="adBorrarPrenda('${p.prenda_id}')">🗑 Quitar</button>`}
        </div>`).join('') : '<div class="lav-hint">Sin prendas en esta categoría.</div>'}
      <div class="lav-row" style="margin-top:10px">
        <input class="lav-in" id="np_${cat}" placeholder="Nueva prenda…" style="flex:1;min-width:150px" onkeydown="if(event.key==='Enter')adCrearPrenda('${cat}')">
        <button class="lav-btn" onclick="adCrearPrenda('${cat}')">＋ Agregar</button>
      </div>
    </div>`;
  };
  document.getElementById('vCat').innerHTML = `
    <div class="lav-card">
      <div class="lav-sec-t">🧾 Catálogo de prendas</div>
      <div class="lav-row">
        <label style="font-weight:700;font-size:.85rem">Aplicar a</label>
        <select class="lav-in" onchange="adSetEmpresa(this.value)">
          <option value="" ${CAT_EMP===''?'selected':''}>Global (todas las lavanderías)</option>
          ${EMPRESAS.map(e=>`<option value="${esc(e.empresa_id)}" ${CAT_EMP===e.empresa_id?'selected':''}>${esc(e.nombre)}</option>`).join('')}
        </select>
      </div>
      <div class="lav-hint">Las prendas <b>globales</b> las ven todas las lavanderías. Si eliges una lavandería, agregas prendas <b>solo para ella</b> (además de las globales). Este listado es el que valida «agregar prenda» en la app.</div>
    </div>
    ${bloque('cama')}
    ${bloque('trabajo')}`;
}
async function adCrearPrenda(cat){
  const nombre = val('np_'+cat); if(!nombre){ toast('Escribe el nombre de la prenda','err'); return; }
  const { data, error } = await SB.rpc('lav_admin_prenda_crear', { p_empresa_id: CAT_EMP||null, p_categoria:cat, p_nombre:nombre });
  if(error || (data&&data.error)){
    const m = (data&&data.error)==='ya_existe' ? 'Esa prenda ya está en el listado' : ('No se pudo agregar: '+((data&&data.error)||error.message));
    toast(m,'err'); return;
  }
  toast('✅ Prenda agregada','ok');
  await cargarCatalogo();
}
async function adBorrarPrenda(id){
  if(!confirm('¿Quitar esta prenda del listado? Dejará de aparecer al crear bolsas.')) return;
  const { data, error } = await SB.rpc('lav_admin_prenda_borrar', { p_prenda_id:id });
  if(error || (data&&data.error)){ toast('No se pudo quitar','err'); return; }
  toast('🗑 Prenda quitada','ok');
  await cargarCatalogo();
}

// ── API: llaves por lavandería ───────────────────────────────────────────────
function renderApi(){
  const base = window.SUPA_CFG.url + '/rest/v1/rpc/lav_api_bolsa_crear';
  document.getElementById('vApi').innerHTML = `
    <div class="lav-card">
      <div class="lav-sec-t">🔌 Llaves de API por lavandería</div>
      <div class="lav-hint" style="margin-bottom:10px">Cada lavandería puede conectar su propio sistema con una <b>llave</b>. La llave se envía en el cuerpo de la llamada (no en la URL) junto con el <i>anon key</i> del proyecto.</div>
      <div class="lav-row">
        <label style="font-weight:700;font-size:.85rem">Lavandería</label>
        <select class="lav-in" onchange="adSetApiEmpresa(this.value)">
          <option value="">— elegir —</option>
          ${EMPRESAS.map(e=>`<option value="${esc(e.empresa_id)}" ${API_EMP===e.empresa_id?'selected':''}>${esc(e.nombre)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="apiKeys"></div>
    <div class="lav-card">
      <div class="lav-sec-t" style="font-size:1rem">Cómo se usa (para el sistema externo)</div>
      <div class="lav-hint">Endpoints REST (POST). Encabezados: <code>apikey: &lt;anon key&gt;</code> y <code>Content-Type: application/json</code>.</div>
      <pre class="lav-code">POST ${esc(base)}
{ "p_key": "&lt;LLAVE&gt;", "p_contrato_id": "ctr_…",
  "p_items": [{"categoria":"cama","nombre":"Sábana","cantidad":3}],
  "p_kilos": 12.5 }

# Otros: lav_api_contratos { "p_key" }
#        lav_api_buscar   { "p_key", "p_codigo" }</pre>
    </div>`;
  cargarApiKeys();
}
function adSetApiEmpresa(v){ API_EMP=v; cargarApiKeys(); }
async function cargarApiKeys(){
  const cont=document.getElementById('apiKeys'); if(!cont) return;
  if(!API_EMP){ cont.innerHTML='<div class="lav-empty">Elige una lavandería para ver o generar sus llaves.</div>'; return; }
  const { data } = await SB.rpc('lav_admin_keys', { p_empresa_id:API_EMP });
  const keys = (data&&data.keys) || [];
  cont.innerHTML = `
    <div class="lav-card">
      <div class="lav-row" style="margin-bottom:10px">
        <input class="lav-in" id="keyNombre" placeholder="Nombre de la llave (opcional)" style="flex:1;min-width:160px">
        <button class="lav-btn" onclick="adGenerarKey()">＋ Generar llave</button>
      </div>
      <div id="keyNueva"></div>
      ${!keys.length ? '<div class="lav-hint">Esta lavandería aún no tiene llaves.</div>'
        : keys.map(k=>`<div class="lav-item" style="padding:10px 12px">
            <div>
              <div class="nm" style="font-family:monospace">${esc(k.mascara)} ${k.activo?'':'<span class="mt">(revocada)</span>'}</div>
              <div class="mt">${esc(k.nombre||'sin nombre')} · creada ${new Date(k.created_at).toLocaleDateString('es-CL')}${k.last_used_at?(' · usada '+new Date(k.last_used_at).toLocaleDateString('es-CL')):' · sin uso'}</div>
            </div>
            ${k.activo?`<button class="lav-btn gray" style="padding:6px 12px" onclick="adBorrarKey('${k.key_id}')">Revocar</button>`:''}
          </div>`).join('')}
    </div>`;
}
async function adGenerarKey(){
  const { data, error } = await SB.rpc('lav_admin_key_crear', { p_empresa_id:API_EMP, p_nombre: val('keyNombre') });
  if(error || (data&&data.error)){ toast('No se pudo generar','err'); return; }
  await cargarApiKeys();   // primero refresca la lista (recrea #keyNueva vacío)
  const box=document.getElementById('keyNueva');
  if(box) box.innerHTML = `<div class="lav-key-new">
    <div style="font-weight:700;margin-bottom:4px">🔑 Llave generada — cópiala ahora, no se vuelve a mostrar completa:</div>
    <div class="lav-row"><input class="lav-in" style="flex:1;font-family:monospace" readonly value="${esc(data.api_key)}" onclick="this.select()">
      <button class="lav-btn" onclick="adCopiar('${esc(data.api_key)}')">📋 Copiar</button></div>
  </div>`;
  toast('✅ Llave generada','ok');
}
async function adBorrarKey(id){
  if(!confirm('¿Revocar esta llave? El sistema externo que la use dejará de tener acceso.')) return;
  const { data, error } = await SB.rpc('lav_admin_key_borrar', { p_key_id:id });
  if(error || (data&&data.error)){ toast('No se pudo revocar','err'); return; }
  toast('🗑 Llave revocada','ok'); cargarApiKeys();
}
function adCopiar(txt){ try{ navigator.clipboard.writeText(txt); }catch(e){} toast('🔗 Copiado','ok'); }

window.addEventListener('DOMContentLoaded', adBoot);
