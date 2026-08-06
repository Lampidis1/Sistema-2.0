// ═══════════════════════════════════════════════════════════════════════════
// admin.js — Gestión de usuarios (aprobar / rechazar solicitudes de acceso)
// Sistema AM · Antofagasta Minerals
//
// P-7 (docs/PENDIENTES.md): antes vivía dentro de modules/proveedores/.
// Código movido tal cual desde proveedores.js — mismas funciones, misma
// lógica, solo adaptado a SB/ES_ADMIN (shared/js/auth-guard.js) en vez de
// SUPA.client/ES_ADMIN_ACTUAL.
// ═══════════════════════════════════════════════════════════════════════════

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function showToast(msg,type=''){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast show '+(type||'');
  setTimeout(()=>{ t.className='toast'; },3500);
}

async function registrarLog(entidad, entidadId, accion, detalle){
  try{
    if(!SB || !USER) return;
    const nombre=(USER.user_metadata && (USER.user_metadata.full_name||USER.user_metadata.name)) || (USER.email||'').split('@')[0];
    await SB.from('registro_ediciones').insert({
      usuario_email:USER.email||'', usuario_nombre:nombre||'',
      entidad:entidad, entidad_id:String(entidadId||''), accion:accion, detalle:detalle||''
    });
  }catch(e){ /* el log no debe romper la operación */ }
}

async function renderUsuarios(){
  const cont=document.getElementById('usuariosContent');
  if(!cont) return;
  cont.innerHTML='<div class="kb-empty">Cargando…</div>';
  try{
    const {data,error}=await SB.rpc('listar_solicitudes');
    if(error) throw error;
    const sols=data||[];
    const pend=sols.filter(s=>s.estado==='pendiente');
    actualizarBadgeUsuarios(pend.length);
    if(!sols.length){ cont.innerHTML='<div class="kb-empty">No hay solicitudes todavía.</div>'; return; }
    cont.innerHTML=sols.map(s=>{
      const badge = s.estado==='pendiente'?'<span style="background:#FFF3DF;color:#b8780a;border-radius:5px;padding:2px 9px;font-size:.72rem;font-weight:700">PENDIENTE</span>'
        : s.estado==='aprobado'?'<span style="background:#E4F6EF;color:#0f7a3d;border-radius:5px;padding:2px 9px;font-size:.72rem;font-weight:700">APROBADO</span>'
        : '<span style="background:#fdecea;color:#c0311b;border-radius:5px;padding:2px 9px;font-size:.72rem;font-weight:700">RECHAZADO</span>';
      const origen = s.origen||'principal';
      const nombre = ((s.nombre||'')+' '+(s.apellido||'')).trim()||'(sin nombre)';
      return `<div style="border:1px solid var(--border);border-radius:11px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-weight:700;font-size:.98rem">${esc(nombre)} ${badge}</div>
            <div style="font-size:.8rem;color:var(--text-muted)">✉ ${esc(s.email||'')} · 📄 solicitó desde: <b>${esc(origen)}</b>${s.faena_solicitada?' · faena '+esc(s.faena_solicitada):''}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;align-items:center">
          <select id="urol_${s.id}" onchange="urolChange('${s.id}')" style="border:1.5px solid var(--border);border-radius:7px;padding:6px 10px;font-size:.84rem">
            <option value="lector" ${(s.rol_solicitado==='lector')?'selected':''}>Solo ver (no crea ni elimina)</option>
            <option value="usuario" ${(s.rol_solicitado!=='admin'&&s.rol_solicitado!=='lector')?'selected':''}>Usuario (ve, crea y edita, no elimina)</option>
            <option value="admin" ${s.rol_solicitado==='admin'?'selected':''}>Administrador (acceso full)</option>
          </select>
        </div>
        <div id="uaccesos_${s.id}" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;padding:10px;background:#f4f7f7;border-radius:9px">
          <span style="font-size:.78rem;font-weight:700;color:var(--text-muted);align-self:center">Acceso a:</span>
          ${['principal','mgi','empleabilidad','movil','centinela','antucoya','zaldivar'].map(pl=>{
            const label={principal:'🏠 Plataforma',mgi:'🏨 MGI',empleabilidad:'👥 Empleabilidad',movil:'📱 Móvil',centinela:'⛏ Centinela',antucoya:'⛏ Antucoya',zaldivar:'⛏ Zaldívar'}[pl];
            const accesosActuales = (s.faena_solicitada||'').toLowerCase().split(',').map(x=>x.trim());
            const yaAprobado = s.estado==='aprobado';
            const pre = yaAprobado ? accesosActuales.includes(pl)
                        : ((origen===pl) || (pl==='centinela'&&/centinela/i.test(s.faena_solicitada||'')) || (pl==='antucoya'&&/antucoya/i.test(s.faena_solicitada||'')) || (pl==='zaldivar'&&/zaldivar/i.test(s.faena_solicitada||'')) || (pl==='principal'&&origen==='principal') || (pl==='mgi'&&origen==='mgi'));
            return `<label style="display:flex;align-items:center;gap:5px;font-size:.82rem;cursor:pointer"><input type="checkbox" id="uacc_${s.id}_${pl}" ${pre?'checked':''} style="width:auto">${label}</label>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;align-items:center">
          <button class="kb-add" style="background:linear-gradient(135deg,#16834a,#0f7a3d)" onclick="aprobarUsuario('${s.id}')">✓ Aprobar</button>
          <button class="mini-btn" style="width:auto;padding:6px 12px;color:#c0311b;border-color:#f1b0a5" onclick="rechazarUsuario('${s.id}')">✕ Rechazar</button>
        </div>
      </div>`;
    }).join('');
    _initUrolVis();
  }catch(e){ cont.innerHTML='<div class="kb-empty">Error: '+esc(e.message)+'</div>'; }
}

function urolChange(uid){
  const rol=document.getElementById('urol_'+uid).value;
  const acc=document.getElementById('uaccesos_'+uid);
  if(acc) acc.style.display = rol==='admin' ? 'none' : 'flex';
}
// aplicar visibilidad inicial de accesos según rol premarcado
function _initUrolVis(){ document.querySelectorAll('[id^="urol_"]').forEach(sel=>{ const uid=sel.id.replace('urol_',''); urolChange(uid); }); }

async function aprobarUsuario(uid){
  const rolSel=document.getElementById('urol_'+uid).value;
  let accesos=[];
  let rol = rolSel==='admin' ? 'admin' : 'usuario';   // en la base solo hay admin/usuario
  if(rolSel==='admin'){
    accesos=['principal','mgi','empleabilidad','movil','centinela','antucoya','zaldivar'];
  } else {
    ['principal','mgi','empleabilidad','movil','centinela','antucoya','zaldivar'].forEach(pl=>{
      if(document.getElementById('uacc_'+uid+'_'+pl)?.checked) accesos.push(pl);
    });
    if(!accesos.length){ showToast('Marca al menos una plataforma de acceso','err'); return; }
    // "Solo ver" = usuario con el flag 'lector' en sus accesos (bloquea escritura vía RLS)
    if(rolSel==='lector') accesos.push('lector');
  }
  try{
    const {data,error}=await SB.rpc('aprobar_usuario_v2',{p_uid:uid,p_rol:rol,p_accesos:accesos});
    if(error) throw error;
    if(String(data).startsWith('OK')){ showToast('✅ Usuario aprobado','success'); renderUsuarios(); }
    else showToast('No se pudo aprobar: '+data,'err');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

async function rechazarUsuario(uid){
  if(!confirm('¿Rechazar / revocar el acceso de este usuario?')) return;
  try{
    const {error}=await SB.rpc('rechazar_usuario',{p_uid:uid});
    if(error) throw error;
    showToast('Usuario rechazado','success');
    await registrarLog('usuario',uid,'rechazar','Acceso revocado');
    renderUsuarios();
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

function actualizarBadgeUsuarios(n){
  const b=document.getElementById('badgeUsuarios');
  if(b){ b.textContent=n; b.style.display=n>0?'inline-block':'none'; }
}

async function _adminOnAcceso(user){
  document.getElementById('gate').style.display='none';
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('hUser').textContent=(user.email||'').split('@')[0];
  renderUsuarios();
}
