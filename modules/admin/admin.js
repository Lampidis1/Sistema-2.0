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

// Plataformas asignables (slug + etiqueta). Fuente única: se usa en la tabla
// de Gestión de usuarios y al aprobar. (q100 queda fuera: tiene su propio
// criterio en la UI de Permisos del módulo.)
const Q_PLATS=[
  ['principal','🏠 Plataforma'],['mgi','🏨 MGI'],['empleabilidad','👥 Empleabilidad'],['movil','📱 Móvil'],
  ['centinela','⛏ Centinela'],['antucoya','⛏ Antucoya'],['zaldivar','⛏ Zaldívar'],
  ['lavanderias','🧺 Lavanderías'],['reclamos','📣 Reclamos'],['rca','📄 RCA'],['planer','📋 Planer'],
  ['feria','🎪 Feria admin'],['feria_empresa','🎪 Feria empresa']
];

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

    const thead=`<thead><tr>
      <th class="ua-uh">Usuario · acción</th>
      ${Q_PLATS.map(p=>{ const parts=p[1].split(' '); const emo=parts.shift(); const nm=parts.join(' ');
        return `<th class="ua-ph"><span class="ua-emo">${emo}</span><span class="ua-pn">${esc(nm)}</span></th>`; }).join('')}
    </tr></thead>`;

    const rows=sols.map(s=>{
      const estadoCls = s.estado==='pendiente'?'pend':s.estado==='aprobado'?'aprob':'rech';
      const estadoTxt = s.estado==='pendiente'?'PENDIENTE':s.estado==='aprobado'?'APROBADO':'RECHAZADO';
      const origen = s.origen||'principal';
      const nombre = ((s.nombre||'')+' '+(s.apellido||'')).trim()||'(sin nombre)';
      const accesosActuales = (s.faena_solicitada||'').toLowerCase().split(',').map(x=>x.trim());
      const yaAprobado = s.estado==='aprobado';
      const chks = Q_PLATS.map(p=>{ const pl=p[0];
        const pre = yaAprobado ? accesosActuales.includes(pl)
          : ((origen===pl) || (pl==='centinela'&&/centinela/i.test(s.faena_solicitada||'')) || (pl==='antucoya'&&/antucoya/i.test(s.faena_solicitada||'')) || (pl==='zaldivar'&&/zaldivar/i.test(s.faena_solicitada||'')) || (pl==='principal'&&origen==='principal') || (pl==='mgi'&&origen==='mgi'));
        return `<td class="ua-chk"><input type="checkbox" id="uacc_${s.id}_${pl}" ${pre?'checked':''}></td>`;
      }).join('');
      return `<tr id="row_${s.id}" class="ua-row">
        <td class="ua-user">
          <div class="ua-name">${esc(nombre)} <span class="ua-badge ${estadoCls}">${estadoTxt}</span></div>
          <div class="ua-info">✉ ${esc(s.email||'')}<br>solicitó desde <b>${esc(origen)}</b>${s.faena_solicitada?' · faena '+esc(s.faena_solicitada):''}</div>
          <select id="urol_${s.id}" class="ua-rol" onchange="urolChange('${s.id}')">
            <option value="lector" ${(s.rol_solicitado==='lector')?'selected':''}>Solo ver</option>
            <option value="usuario" ${(s.rol_solicitado!=='admin'&&s.rol_solicitado!=='lector')?'selected':''}>Usuario (ve, crea, edita)</option>
            <option value="admin" ${s.rol_solicitado==='admin'?'selected':''}>Administrador (full)</option>
          </select>
          <div class="ua-btns">
            <button class="ua-b ok" onclick="aprobarUsuario('${s.id}')">✓ Aprobar</button>
            <button class="ua-b warn" onclick="rechazarUsuario('${s.id}')">✕ Rechazar</button>
            <button class="ua-b del" onclick="eliminarUsuario('${s.id}','${esc((s.email||s.nombre||'').replace(/'/g,''))}')">🗑</button>
          </div>
        </td>
        ${chks}
      </tr>`;
    }).join('');

    cont.innerHTML=`<div class="ua-wrap"><table class="ua-table">${thead}<tbody>${rows}</tbody></table></div>
      <div class="ua-nota">Marca las plataformas y pulsa <b>✓ Aprobar</b>. “Administrador (full)” da acceso a todo (las casillas se ignoran). Q100 se gestiona desde su propia ventana de Permisos.</div>`;
    _initUrolVis();
  }catch(e){ cont.innerHTML='<div class="kb-empty">Error: '+esc(e.message)+'</div>'; }
}

// rol=admin → las casillas de plataforma se atenúan (el acceso es total).
function urolChange(uid){
  const row=document.getElementById('row_'+uid);
  const rol=(document.getElementById('urol_'+uid)||{}).value;
  if(row) row.classList.toggle('is-admin', rol==='admin');
}
function _initUrolVis(){ document.querySelectorAll('[id^="urol_"]').forEach(sel=>{ urolChange(sel.id.replace('urol_','')); }); }

async function aprobarUsuario(uid){
  const rolSel=document.getElementById('urol_'+uid).value;
  let accesos=[];
  let rol = rolSel==='admin' ? 'admin' : 'usuario';   // en la base solo hay admin/usuario
  if(rolSel==='admin'){
    accesos=Q_PLATS.map(p=>p[0]);
  } else {
    Q_PLATS.map(p=>p[0]).forEach(pl=>{
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

// Elimina el usuario de Supabase (auth) con sus datos asociados (perfil en
// cascada + vínculo de lavandería). No borra registros de negocio compartidos.
async function eliminarUsuario(uid, quien){
  if(!confirm('¿ELIMINAR al usuario '+(quien||'')+' de Supabase?\n\nSe borra su cuenta, su perfil y sus vínculos. No se puede deshacer.')) return;
  try{
    const {data,error}=await SB.rpc('eliminar_usuario',{p_uid:uid});
    if(error) throw error;
    if(String(data)!=='OK'){
      showToast(data==='NO_TE_PUEDES_BORRAR'?'No puedes eliminar tu propia cuenta':'No autorizado','err'); return;
    }
    showToast('🗑 Usuario eliminado','success');
    try{ await registrarLog('usuario',uid,'eliminar','Cuenta eliminada de Supabase'); }catch(e){}
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
