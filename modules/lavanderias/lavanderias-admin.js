// ═══════════════════════════════════════════════════════════════════════════
// lavanderias-admin.js — Panel de administración (Lavanderías Sierra Gorda)
// Sistema AM · Antofagasta Minerals
//
// Solo para el administrador del sistema (es_admin). Muestra métricas por
// lavandería (prendas y kilos) y gestiona el catálogo de prendas (cama/trabajo)
// que valida "agregar prenda" en la app de la lavandería. Todo por RPCs
// public.lav_admin_*. <script src> clásico, nunca type="module" — CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════
let SB=null, MET=[], EMPRESAS=[], CAT_EMP='';   // CAT_EMP: empresa activa del catálogo ('' = global)

const esc = s => String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const val = id => { const e=document.getElementById(id); return e?e.value.trim():''; };
function toast(msg,tipo){ const t=document.getElementById('toast'); if(!t)return; t.textContent=msg; t.className='lav-toast on '+(tipo||''); clearTimeout(t._t); t._t=setTimeout(()=>t.className='lav-toast',3200); }
function gateErr(m){ const e=document.getElementById('gateErr'); if(e){ e.textContent=m||''; e.className='lavg-err'+(m?' on':''); } }

async function adBoot(){
  SB = window.supabase.createClient(window.SUPA_CFG.url, window.SUPA_CFG.key);
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
  gateErr('');
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
  document.getElementById('tabMet').classList.toggle('on', t==='met');
  document.getElementById('tabCat').classList.toggle('on', t==='cat');
  document.getElementById('vMet').classList.toggle('hidden', t!=='met');
  document.getElementById('vCat').classList.toggle('hidden', t!=='cat');
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

window.addEventListener('DOMContentLoaded', adBoot);
