// ═══════════════════════════════════════════════════════════════════════════
// integraciones.js — MGI · panel de la API (cola de validación + llaves)
// Sistema AM · Antofagasta Minerals
//
// Solo para admin de MGI (tiene_acceso('mgi') o es_admin). Revisa la cola de
// cambios propuestos por la API externa (aprobar/rechazar) y gestiona las
// llaves de integración. Autocontenido (no toca mgi.js). RPCs public.mgi_*.
// <script src> clásico, nunca type="module" — CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════
let SB=null;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const val=id=>{const e=document.getElementById(id);return e?e.value.trim():'';};
function toast(m,t){const el=document.getElementById('toast');if(!el)return;el.textContent=m;el.className='toast on '+(t||'');clearTimeout(el._t);el._t=setTimeout(()=>el.className='toast',3200);}
function gateErr(m){const e=document.getElementById('gateErr');if(e){e.textContent=m||'';e.className='err'+(m?' on':'');}}

async function boot(){
  SB = window.supabase.createClient(window.SUPA_CFG.url, window.SUPA_CFG.key);
  const { data:{ session } } = await SB.auth.getSession();
  if(session){ try{ await SB.auth.refreshSession(); }catch(e){} await rutear(); }
  else verGate('login');
}
async function rutear(){
  // Si mgi_admin_keys responde ok, el usuario tiene acceso a MGI.
  const { data } = await SB.rpc('mgi_admin_keys');
  if(data && data.ok){ document.getElementById('gate').classList.add('hidden'); document.getElementById('app').classList.remove('hidden'); cargarCola(); }
  else verGate('noacc');
}
function verGate(v){
  document.getElementById('app').classList.add('hidden');
  document.getElementById('gate').classList.remove('hidden');
  document.getElementById('loginStep').style.display = v==='login'?'':'none';
  document.getElementById('noAcc').style.display = v==='noacc'?'':'none';
  gateErr('');
}
async function entrar(){
  const email=val('lgEmail'), pass=document.getElementById('lgPass').value;
  if(!email||!pass){ gateErr('Escribe correo y contraseña'); return; }
  const { error } = await SB.auth.signInWithPassword({ email, password:pass });
  if(error){ gateErr('No se pudo ingresar: '+error.message); return; }
  try{ await SB.auth.refreshSession(); }catch(e){}
  await rutear();
}
async function salir(){ try{ await SB.auth.signOut(); }catch(e){} location.reload(); }
function tab(t){
  document.getElementById('tabCola').classList.toggle('on', t==='cola');
  document.getElementById('tabKeys').classList.toggle('on', t==='keys');
  document.getElementById('vCola').classList.toggle('hidden', t!=='cola');
  document.getElementById('vKeys').classList.toggle('hidden', t!=='keys');
  if(t==='keys') cargarKeys();
}

// ── Cola de cambios ──────────────────────────────────────────────────────────
const TIPO_LBL={ficha:'Ficha de empresa',contacto:'Contacto',capacidad:'Camas / habitaciones',hospedaje_mgi:'Datos programa MGI',criterio_avance:'Avance de criterio',empresa_crear:'Alta de empresa'};
async function cargarCola(){
  const { data, error } = await SB.rpc('mgi_cambios_pendientes');
  const arr = (!error && data && data.cambios) ? data.cambios : [];
  const cont=document.getElementById('vCola');
  cont.innerHTML = `
    <div class="card">
      <div class="sec-t">📥 Cambios propuestos por la API</div>
      <div class="hint">Cada cambio queda <b>pendiente</b> hasta que lo apruebes. Al aprobar, se aplica a los datos reales de MGI. Revisa el detalle antes de aprobar.</div>
      <div class="row"><button class="btn sec" onclick="cargarCola()">↻ Actualizar</button></div>
    </div>
    ${!arr.length ? '<div class="empty">No hay cambios pendientes. 👌</div>'
      : arr.map(c=>`<div class="card">
          <div class="item" style="border:none;padding:0;margin:0">
            <div>
              <div><span class="badge">${esc(TIPO_LBL[c.tipo]||c.tipo)}</span> <b>${esc(c.empresa)}</b></div>
              <div class="mut" style="margin-top:3px">Integración: ${esc(c.integracion||'—')} · ${new Date(c.created_at).toLocaleString('es-CL')}${c.rubro?(' · '+esc(c.rubro)):''}</div>
            </div>
            <div class="row">
              <button class="btn ok" onclick="aplicar('${c.cambio_id}')">✓ Aprobar</button>
              <button class="btn danger" onclick="rechazar('${c.cambio_id}')">✕ Rechazar</button>
            </div>
          </div>
          <pre>${esc(JSON.stringify(c.payload,null,2))}</pre>
        </div>`).join('')}`;
}
async function aplicar(id){
  if(!confirm('¿Aprobar y aplicar este cambio a los datos reales de MGI?')) return;
  const { data, error } = await SB.rpc('mgi_cambio_aplicar', { p_cambio_id:id });
  if(error || (data&&data.error)){ toast('No se pudo aplicar: '+((data&&(data.detalle||data.error))||error.message),'err'); return; }
  toast('✓ '+(data.resultado||'Aplicado'),'ok');
  cargarCola();
}
async function rechazar(id){
  const motivo = prompt('Motivo del rechazo (opcional):')||'';
  const { data, error } = await SB.rpc('mgi_cambio_rechazar', { p_cambio_id:id, p_comentario:motivo });
  if(error || (data&&data.error)){ toast('No se pudo rechazar','err'); return; }
  toast('Cambio rechazado','ok');
  cargarCola();
}

// ── Llaves de API ────────────────────────────────────────────────────────────
async function cargarKeys(){
  const { data } = await SB.rpc('mgi_admin_keys');
  const keys = (data && data.keys) || [];
  const base = window.SUPA_CFG.url + '/rest/v1/rpc/mgi_api_proponer';
  document.getElementById('vKeys').innerHTML = `
    <div class="card">
      <div class="sec-t">🔑 Llaves de integración</div>
      <div class="hint">Entrega una llave a cada sistema externo que se conecte. La llave va en el cuerpo de la llamada (no en la URL) junto con el <i>anon key</i>. Documentación: <code>docs/modulos/mgi-api.md</code>.</div>
      <div class="row" style="margin-top:8px">
        <input id="keyNombre" placeholder="Nombre de la integración (opcional)" style="flex:1;min-width:170px">
        <button class="btn" onclick="crearKey()">＋ Generar llave</button>
      </div>
      <div id="keyNueva"></div>
    </div>
    ${!keys.length ? '<div class="empty">Aún no hay llaves.</div>'
      : keys.map(k=>`<div class="card"><div class="item" style="border:none;padding:0;margin:0">
          <div>
            <div style="font-family:monospace;font-weight:700">${esc(k.mascara)} ${k.activo?'':'<span class="mut">(revocada)</span>'}</div>
            <div class="mut" style="margin-top:3px">${esc(k.nombre||'sin nombre')} · creada ${new Date(k.created_at).toLocaleDateString('es-CL')}${k.last_used_at?(' · usada '+new Date(k.last_used_at).toLocaleDateString('es-CL')):' · sin uso'}</div>
          </div>
          ${k.activo?`<button class="btn gray" onclick="borrarKey('${k.key_id}')">Revocar</button>`:''}
        </div></div>`).join('')}
    <div class="card"><div class="sec-t" style="font-size:1rem">Endpoint (para el desarrollador)</div>
      <pre>POST ${esc(base)}
{ "p_key":"<LLAVE>", "p_proveedor_id":"...", "p_tipo":"ficha",
  "p_payload": { ... } }
Headers: apikey: &lt;anon key&gt; · Content-Type: application/json</pre></div>`;
}
async function crearKey(){
  const { data, error } = await SB.rpc('mgi_admin_key_crear', { p_nombre: val('keyNombre') });
  if(error || (data&&data.error)){ toast('No se pudo generar','err'); return; }
  await cargarKeys();
  const box=document.getElementById('keyNueva');
  if(box) box.innerHTML = `<div class="keynew"><div style="font-weight:700;margin-bottom:4px">🔑 Llave generada — cópiala ahora (no se vuelve a mostrar completa):</div>
    <div class="row"><input readonly value="${esc(data.api_key)}" style="flex:1;font-family:monospace" onclick="this.select()">
      <button class="btn" onclick="copiar('${esc(data.api_key)}')">📋 Copiar</button></div></div>`;
  toast('✓ Llave generada','ok');
}
async function borrarKey(id){
  if(!confirm('¿Revocar esta llave? El sistema externo que la use dejará de tener acceso.')) return;
  const { data, error } = await SB.rpc('mgi_admin_key_borrar', { p_key_id:id });
  if(error || (data&&data.error)){ toast('No se pudo revocar','err'); return; }
  toast('Llave revocada','ok'); cargarKeys();
}
function copiar(t){ try{ navigator.clipboard.writeText(t); }catch(e){} toast('Copiado','ok'); }

window.addEventListener('DOMContentLoaded', boot);
