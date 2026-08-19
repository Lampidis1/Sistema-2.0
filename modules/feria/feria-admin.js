// ═══════════════════════════════════════════════════════════════════════════
// feria-admin.js — Panel administrador de la Feria Digital (AMSA)
// Sistema AM · Antofagasta Minerals
//
// Crea/gestiona ferias, empresas y sus usuarios de stand, cargos, inscritos y
// reportes. auth-guard declara SB/USER/ES_ADMIN globales (slug 'feria').
// <script src> clásico, nunca type="module" (CLAUDE.md §6).
// ═══════════════════════════════════════════════════════════════════════════

let FA = { ferias:[], actual:null, tab:'empresas', empresas:[], cargos:[], inscritos:[], postulaciones:[], bitacora:[], usuarios:[] };
let OF_EDIT = null;   // cargo en edición

// helpers
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function toast(m,t){ const e=document.getElementById('toast'); e.textContent=m; e.className='toast show'+(t==='err'?' err':t==='ok'?' ok':''); clearTimeout(e._to); e._to=setTimeout(()=>e.className='toast',3200); }
function uid(p){ return (p||'id')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6); }
function val(id){ const e=document.getElementById(id); return e?e.value.trim():''; }
function quien(){ try{ const u=USER; return (u&&u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||(u&&u.email||'').split('@')[0]||''; }catch(e){ return ''; } }
function nowISO(){ return new Date().toISOString(); }
function fnum(n){ return (+n||0).toLocaleString('es-CL'); }
function abrirModal(html){ document.getElementById('modalHost').innerHTML=`<div class="modal-ov" onclick="if(event.target===this)cerrarModal()"><div class="modal-box">${html}</div></div>`; }
function cerrarModal(){ document.getElementById('modalHost').innerHTML=''; }
function base(){ return location.origin + location.pathname.replace(/\/index\.html$/,'').replace(/\/$/,''); }

async function feriaAdminOnAcceso(user){
  document.getElementById('gate').style.display='none';
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('hUser').textContent=(user&&user.email)||'';
  await cargarFerias(); verLista();
}

async function cargarFerias(){
  const {data,error}=await SB.from('ferias').select('*').neq('estado_registro','Eliminado').order('created_at',{ascending:false});
  if(error){ toast('Error al cargar ferias: '+error.message,'err'); FA.ferias=[]; return; }
  FA.ferias=data||[];
}

// ══ LISTA DE FERIAS ══════════════════════════════════════════════════════════
function verLista(){
  FA.actual=null;
  document.getElementById('vistaDetalle').classList.add('hidden');
  const c=document.getElementById('vistaLista'); c.classList.remove('hidden');
  c.innerHTML=`
    <div class="lista-head">
      <div><div class="lista-t">Ferias laborales</div>
        <div class="lista-s">Crea una feria, define su código de acceso y administra empresas, cargos, inscritos y reportes.</div></div>
      <button class="btn primary" onclick="feriaModal()">➕ Nueva feria</button>
    </div>
    ${!FA.ferias.length?`<div class="vacio">Aún no hay ferias.<br><span>Crea la primera con «Nueva feria».</span></div>`
      :`<div class="grid-cards">${FA.ferias.map(tarjetaFeria).join('')}</div>`}`;
}
function tarjetaFeria(f){
  const est={borrador:'gray',activa:'',cerrada:'gold'}[f.estado]||'gray';
  return `<div class="card click" onclick="abrirFeria('${f.feria_id}')">
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
      <div class="det-cod" style="font-size:1.15rem">${esc(f.nombre||'Feria')}</div>
      <span class="chip ${est}">${esc(f.estado||'borrador')}</span></div>
    <div style="margin:6px 0"><span class="chip">Código ${esc(f.codigo)}</span></div>
    <div class="det-sub">${esc(f.lugar||'')}${f.fecha_inicio?` · ${esc(f.fecha_inicio)}`:''}</div>
    <div style="margin-top:10px;font-size:.82rem;font-weight:700;color:var(--teal)">Administrar →</div>
  </div>`;
}

// ══ CRUD FERIA ════════════════════════════════════════════════════════════════
function feriaModal(id){
  const f=id?FA.ferias.find(x=>x.feria_id===id):{};
  abrirModal(`
    <h3>${id?'Editar feria':'Nueva feria'}</h3>
    <div class="g2">
      <div><label>Nombre</label><input id="fNom" value="${esc(f.nombre||'')}" placeholder="Feria Laboral Minera 2026"></div>
      <div><label>Código de acceso *</label><input id="fCod" value="${esc(f.codigo||'')}" placeholder="FERIA2026"></div>
    </div>
    <div class="g3">
      <div><label>Lugar</label><input id="fLugar" value="${esc(f.lugar||'')}"></div>
      <div><label>Inicio</label><input id="fIni" type="date" value="${(f.fecha_inicio||'').slice(0,10)}"></div>
      <div><label>Término</label><input id="fFin" type="date" value="${(f.fecha_fin||'').slice(0,10)}"></div>
    </div>
    <label>Estado</label>
    <select id="fEstado"><option value="borrador" ${f.estado==='borrador'?'selected':''}>Borrador (no recibe postulantes)</option>
      <option value="activa" ${(f.estado==='activa'||!f.estado)?'selected':''}>Activa (recibe postulantes)</option>
      <option value="cerrada" ${f.estado==='cerrada'?'selected':''}>Cerrada</option></select>
    <label>Descripción</label><textarea id="fDesc" rows="2">${esc(f.descripcion||'')}</textarea>
    <div class="modal-acc">
      ${id?`<button class="btn danger ghost" onclick="borrarFeria('${id}')">🗑 Eliminar</button>`:'<span></span>'}
      <div><button class="btn ghost" onclick="cerrarModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarFeria('${id||''}')">Guardar</button></div>
    </div>`);
}
async function guardarFeria(id){
  const cod=val('fCod'); if(!cod){ toast('El código es obligatorio','err'); return; }
  const fila={ codigo:cod, nombre:val('fNom')||null, lugar:val('fLugar')||null,
    fecha_inicio:val('fIni')||null, fecha_fin:val('fFin')||null,
    estado:val('fEstado')||'borrador', descripcion:val('fDesc')||null, updated_at:nowISO(), updated_by:quien() };
  try{
    if(id){ const {error}=await SB.from('ferias').update(fila).eq('feria_id',id); if(error) throw error; }
    else{ fila.feria_id=uid('feria'); fila.created_by=quien(); const {error}=await SB.from('ferias').insert(fila); if(error) throw error; }
    cerrarModal(); await cargarFerias();
    if(id&&FA.actual&&FA.actual.feria_id===id){ FA.actual=FA.ferias.find(x=>x.feria_id===id); renderDetalle(); } else verLista();
    toast('✅ Feria guardada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function borrarFeria(id){
  if(!confirm('¿Eliminar esta feria?')) return;
  try{ const {error}=await SB.from('ferias').update({estado_registro:'Eliminado',updated_at:nowISO()}).eq('feria_id',id); if(error) throw error;
    cerrarModal(); await cargarFerias(); verLista(); toast('🗑 Eliminada','ok'); }catch(e){ toast('Error: '+e.message,'err'); }
}

// ══ DETALLE DE UNA FERIA ══════════════════════════════════════════════════════
async function abrirFeria(id){
  const f=FA.ferias.find(x=>x.feria_id===id); if(!f) return;
  FA.actual=f; FA.tab='empresas';
  document.getElementById('vistaLista').classList.add('hidden');
  const d=document.getElementById('vistaDetalle'); d.classList.remove('hidden'); d.innerHTML='<div class="vacio">Cargando…</div>';
  await cargarDatosFeria(id); renderDetalle();
}
async function cargarDatosFeria(id){
  const [emp,car,ins,pos,bit]=await Promise.all([
    SB.from('feria_empresas').select('*').eq('feria_id',id).neq('estado_registro','Eliminado').order('nombre'),
    SB.from('cv_ofertas').select('*').eq('feria_id',id).neq('estado_registro','Eliminado'),
    SB.from('feria_participantes').select('*').eq('feria_id',id).neq('estado_registro','Eliminado').order('inscrito_at',{ascending:false}),
    SB.from('cv_postulaciones').select('*').eq('feria_id',id).neq('estado_registro','Eliminado'),
    SB.from('feria_bitacora').select('*').eq('feria_id',id).neq('estado_registro','Eliminado').order('created_at',{ascending:false}),
  ]);
  FA.empresas=emp.data||[]; FA.cargos=(car.data||[]).map(o=>({...o,criterios:parseJ(o.criterios_json)}));
  FA.inscritos=ins.data||[]; FA.postulaciones=pos.data||[]; FA.bitacora=bit.data||[];
  const ids=FA.empresas.map(e=>e.feria_empresa_id);
  if(ids.length){ const {data}=await SB.from('feria_empresa_usuarios').select('*').in('feria_empresa_id',ids).neq('estado_registro','Eliminado'); FA.usuarios=data||[]; }
  else FA.usuarios=[];
}
function parseJ(s){ try{ return JSON.parse(s||'[]'); }catch(e){ return []; } }

function renderDetalle(){
  const f=FA.actual;
  const tabs=[['empresas','🏢 Empresas'],['cargos','💼 Cargos'],['inscritos','🧑‍🏭 Inscritos'],['reportes','📊 Reportes']];
  const d=document.getElementById('vistaDetalle');
  d.innerHTML=`
    <div class="det-top">
      <button class="btn ghost" onclick="verLista()">← Todas las ferias</button>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="chip">Código ${esc(f.codigo)}</span>
        <span class="chip ${f.estado==='activa'?'':'gray'}">${esc(f.estado)}</span>
        <button class="btn ghost" onclick="copiarLink()">🔗 Link del postulante</button>
        <button class="btn ghost" onclick="feriaModal('${f.feria_id}')">✏ Editar feria</button>
      </div>
    </div>
    <div class="det-cod">${esc(f.nombre||'Feria')}</div>
    <div class="det-sub">${esc(f.lugar||'')}</div>
    <div class="tabs2" style="margin-top:14px">
      ${tabs.map(([k,t])=>`<button class="tab2 ${FA.tab===k?'active':''}" onclick="setTab('${k}')">${t}</button>`).join('')}
    </div>
    <div id="tabBody"></div>`;
  renderTab();
}
function setTab(t){ FA.tab=t; renderTab(); document.querySelectorAll('.tab2').forEach(b=>b.classList.toggle('active', b.getAttribute('onclick').includes("'"+t+"'"))); }
function copiarLink(){
  const url=base().replace(/\/modules\/feria$/,'/modules/feria')+'/postulante.html';
  const full=url+'?codigo='+encodeURIComponent(FA.actual.codigo);
  navigator.clipboard&&navigator.clipboard.writeText(full);
  toast('🔗 Link copiado: '+full,'ok');
}

function renderTab(){
  const b=document.getElementById('tabBody'); if(!b) return;
  if(FA.tab==='empresas') b.innerHTML=tabEmpresas();
  else if(FA.tab==='cargos') b.innerHTML=tabCargos();
  else if(FA.tab==='inscritos') b.innerHTML=tabInscritos();
  else if(FA.tab==='reportes') b.innerHTML=tabReportes();
}

// ── EMPRESAS ─────────────────────────────────────────────────────────────────
function tabEmpresas(){
  return `<div class="sub-head"><div class="sub-t">Empresas participantes</div>
    <button class="btn primary" onclick="empresaModal()">➕ Agregar empresa</button></div>
    ${!FA.empresas.length?`<div class="vacio">Sin empresas.<br><span>Agrega las empresas contratistas que tendrán stand.</span></div>`
    :`<div class="grid-cards">${FA.empresas.map(tarjetaEmpresa).join('')}</div>`}`;
}
function tarjetaEmpresa(e){
  const nCargos=FA.cargos.filter(c=>c.feria_empresa_id===e.feria_empresa_id).length;
  const users=FA.usuarios.filter(u=>u.feria_empresa_id===e.feria_empresa_id);
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;gap:8px"><div style="font-weight:700">${esc(e.nombre)}</div>
      ${e.stand?`<span class="chip">Stand ${esc(e.stand)}</span>`:''}</div>
    <div class="det-sub" style="margin:4px 0">${esc(e.rubro||'')}${e.rut?` · ${esc(e.rut)}`:''}</div>
    <div style="font-size:.82rem;color:var(--muted)">💼 ${nCargos} cargo(s) · 👤 ${users.length} usuario(s)</div>
    ${users.length?`<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">${users.map(u=>`<span class="chip gray">${esc(u.nombre||'usuario')} · ${esc(u.rol)}</span>`).join('')}</div>`:''}
    <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
      <button class="mini" onclick="empresaModal('${e.feria_empresa_id}')">✏ Editar</button>
      <button class="mini" onclick="asignarModal('${e.feria_empresa_id}')">👤 Usuarios</button>
      <button class="mini danger" onclick="borrarEmpresa('${e.feria_empresa_id}')">🗑</button>
    </div>
  </div>`;
}
function empresaModal(id){
  const e=id?FA.empresas.find(x=>x.feria_empresa_id===id):{};
  abrirModal(`
    <h3>${id?'Editar empresa':'Nueva empresa'}</h3>
    <div class="g2"><div><label>Nombre *</label><input id="eNom" value="${esc(e.nombre||'')}"></div>
      <div><label>RUT</label><input id="eRut" value="${esc(e.rut||'')}"></div></div>
    <div class="g3"><div><label>Rubro</label><input id="eRubro" value="${esc(e.rubro||'')}"></div>
      <div><label>Stand</label><input id="eStand" value="${esc(e.stand||'')}"></div>
      <div><label>Contacto</label><input id="eCont" value="${esc(e.contacto||'')}"></div></div>
    <label>Descripción</label><textarea id="eDesc" rows="2">${esc(e.descripcion||'')}</textarea>
    <div class="modal-acc"><span></span><div>
      <button class="btn ghost" onclick="cerrarModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarEmpresa('${id||''}')">Guardar</button></div></div>`);
}
async function guardarEmpresa(id){
  const nom=val('eNom'); if(!nom){ toast('El nombre es obligatorio','err'); return; }
  const fila={ feria_id:FA.actual.feria_id, nombre:nom, rut:val('eRut')||null, rubro:val('eRubro')||null,
    stand:val('eStand')||null, contacto:val('eCont')||null, descripcion:val('eDesc')||null, updated_at:nowISO(), updated_by:quien() };
  try{
    if(id){ const {error}=await SB.from('feria_empresas').update(fila).eq('feria_empresa_id',id); if(error) throw error; }
    else{ fila.feria_empresa_id=uid('femp'); fila.created_by=quien(); const {error}=await SB.from('feria_empresas').insert(fila); if(error) throw error; }
    cerrarModal(); await cargarDatosFeria(FA.actual.feria_id); renderTab(); toast('✅ Guardada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function borrarEmpresa(id){
  if(!confirm('¿Eliminar esta empresa? Sus cargos quedarán sin empresa.')) return;
  try{ const {error}=await SB.from('feria_empresas').update({estado_registro:'Eliminado',updated_at:nowISO()}).eq('feria_empresa_id',id); if(error) throw error;
    await cargarDatosFeria(FA.actual.feria_id); renderTab(); toast('🗑 Eliminada','ok'); }catch(e){ toast('Error: '+e.message,'err'); }
}
function asignarModal(id){
  const e=FA.empresas.find(x=>x.feria_empresa_id===id);
  const users=FA.usuarios.filter(u=>u.feria_empresa_id===id);
  abrirModal(`
    <h3>👤 Usuarios de ${esc(e.nombre)}</h3>
    <p class="modal-nota">Enlaza cuentas ya registradas a este stand. El usuario además necesita el acceso <b>feria_empresa</b>, que se asigna en «Gestión de usuarios».</p>
    ${users.length?`<div style="margin-bottom:12px">${users.map(u=>`<div style="display:flex;justify-content:space-between;align-items:center;border:1px solid var(--border);border-radius:9px;padding:8px 10px;margin-bottom:6px">
      <div>${esc(u.nombre||'usuario')} <span class="chip gray">${esc(u.rol)}</span></div>
      <button class="mini danger" onclick="quitarUsuario('${u.id}','${id}')">Quitar</button></div>`).join('')}</div>`:'<div class="vacio" style="padding:16px;margin-bottom:12px">Sin usuarios enlazados.</div>'}
    <div class="g2"><div><label>Correo del usuario</label><input id="auEmail" placeholder="persona@empresa.cl"></div>
      <div><label>Rol</label><select id="auRol"><option value="empresa">Empresa (publica cargos)</option><option value="reclutador">Reclutador (escanea en stand)</option></select></div></div>
    <div class="modal-acc"><span></span><div>
      <button class="btn ghost" onclick="cerrarModal()">Cerrar</button>
      <button class="btn primary" onclick="asignarUsuario('${id}')">Enlazar</button></div></div>`);
}
async function asignarUsuario(id){
  const email=val('auEmail'); if(!email){ toast('Escribe el correo','err'); return; }
  try{ const {data,error}=await SB.rpc('feria_asignar_usuario',{p_feria_empresa_id:id,p_email:email,p_rol:val('auRol')}); if(error) throw error;
    await cargarDatosFeria(FA.actual.feria_id); asignarModal(id); toast('✅ '+(data.nombre||'Usuario')+' enlazado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function quitarUsuario(uid_,empId){
  try{ const {error}=await SB.from('feria_empresa_usuarios').update({estado_registro:'Eliminado'}).eq('id',uid_); if(error) throw error;
    await cargarDatosFeria(FA.actual.feria_id); asignarModal(empId); }catch(e){ toast('Error: '+e.message,'err'); }
}

// ── CARGOS ───────────────────────────────────────────────────────────────────
function tabCargos(){
  if(!FA.empresas.length) return `<div class="vacio">Primero agrega una empresa en la pestaña «Empresas».</div>`;
  return `<div class="sub-head"><div class="sub-t">Cargos de la feria</div>
    <button class="btn primary" onclick="cargoModal()">➕ Nuevo cargo</button></div>
    ${!FA.cargos.length?`<div class="vacio">Sin cargos.<br><span>Publica los cargos que ofrecen las empresas, con sus criterios.</span></div>`
    :`<div class="grid-cards">${FA.cargos.map(tarjetaCargo).join('')}</div>`}`;
}
function tarjetaCargo(o){
  const emp=FA.empresas.find(e=>e.feria_empresa_id===o.feria_empresa_id);
  const nPost=FA.postulaciones.filter(p=>p.oferta_id===o.oferta_id).length;
  return `<div class="card">
    <div style="font-weight:700">${esc(o.cargo||'Cargo')}</div>
    <div class="det-sub">${esc(emp?emp.nombre:o.empresa||'')}</div>
    <div style="font-size:.82rem;color:var(--muted);margin-top:6px">🎯 ${(o.criterios||[]).length} criterio(s) · 📨 ${nPost} postulación(es)</div>
    <div style="margin-top:10px;display:flex;gap:6px"><button class="mini" onclick="cargoModal('${o.oferta_id}')">✏ Editar</button>
      <button class="mini danger" onclick="borrarCargo('${o.oferta_id}')">🗑</button></div>
  </div>`;
}
function cargoModal(id){
  const o=id?FA.cargos.find(x=>x.oferta_id===id):{criterios:[]};
  OF_EDIT=JSON.parse(JSON.stringify(o)); OF_EDIT.criterios=OF_EDIT.criterios||[];
  const opts=FA.empresas.map(e=>`<option value="${e.feria_empresa_id}" ${o.feria_empresa_id===e.feria_empresa_id?'selected':''}>${esc(e.nombre)}</option>`).join('');
  abrirModal(`
    <h3>${id?'Editar cargo':'Nuevo cargo'}</h3>
    <div class="g2"><div><label>Empresa *</label><select id="oEmp">${opts}</select></div>
      <div><label>Cargo *</label><input id="oCargo" value="${esc(o.cargo||'')}"></div></div>
    <label>Descripción</label><textarea id="oDesc" rows="2">${esc(o.descripcion||'')}</textarea>
    <label>Comuna</label><input id="oComuna" value="${esc(o.comuna||'')}">
    <label>Criterios de compatibilidad (texto + ponderación %)</label>
    <div id="oCrits"></div>
    <button class="mini" onclick="addCrit()">➕ Agregar criterio</button>
    <div id="oPond" style="font-size:.8rem;color:var(--muted);margin-top:6px"></div>
    <div class="modal-acc"><span></span><div>
      <button class="btn ghost" onclick="cerrarModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarCargo('${id||''}')">Guardar</button></div></div>`);
  renderCrits();
}
function renderCrits(){
  const c=document.getElementById('oCrits'); if(!c) return;
  c.innerHTML=(OF_EDIT.criterios||[]).map((cr,i)=>`<div class="crit-row">
    <input type="text" value="${esc(cr.texto||'')}" oninput="OF_EDIT.criterios[${i}].texto=this.value" placeholder="Ej: experiencia CAEX, licencia D, trabajo en altura…">
    <input type="number" min="0" max="100" value="${cr.ponderacion||0}" oninput="OF_EDIT.criterios[${i}].ponderacion=parseInt(this.value)||0;pond()"> %
    <button class="mini danger" onclick="delCrit(${i})">✕</button></div>`).join('');
  pond();
}
function addCrit(){ OF_EDIT.criterios.push({texto:'',ponderacion:0}); renderCrits(); }
function delCrit(i){ OF_EDIT.criterios.splice(i,1); renderCrits(); }
function pond(){ const s=(OF_EDIT.criterios||[]).reduce((a,c)=>a+(+c.ponderacion||0),0); const e=document.getElementById('oPond'); if(e) e.textContent='Suma de ponderaciones: '+s+'%'+(s===100?' ✓':' (ideal 100%)'); }
async function guardarCargo(id){
  const empId=document.getElementById('oEmp').value; const cargo=val('oCargo');
  if(!empId||!cargo){ toast('Empresa y cargo son obligatorios','err'); return; }
  const emp=FA.empresas.find(e=>e.feria_empresa_id===empId);
  const fila={ empresa:emp?emp.nombre:'', cargo, descripcion:val('oDesc')||null, comuna:val('oComuna')||null,
    criterios_json:JSON.stringify((OF_EDIT.criterios||[]).filter(c=>(c.texto||'').trim())),
    estado:'Abierta', estado_registro:'Activo', feria_id:FA.actual.feria_id, feria_empresa_id:empId, updated_at:nowISO(), updated_by:quien() };
  try{
    if(id){ const {error}=await SB.from('cv_ofertas').update(fila).eq('oferta_id',id); if(error) throw error; }
    else{ fila.oferta_id=uid('of'); fila.created_by=quien(); fila.created_at=nowISO(); const {error}=await SB.from('cv_ofertas').insert(fila); if(error) throw error; }
    cerrarModal(); await cargarDatosFeria(FA.actual.feria_id); renderTab(); toast('✅ Cargo guardado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function borrarCargo(id){
  if(!confirm('¿Eliminar este cargo?')) return;
  try{ const {error}=await SB.from('cv_ofertas').update({estado_registro:'Eliminado',updated_at:nowISO()}).eq('oferta_id',id); if(error) throw error;
    await cargarDatosFeria(FA.actual.feria_id); renderTab(); toast('🗑 Eliminado','ok'); }catch(e){ toast('Error: '+e.message,'err'); }
}

// ── INSCRITOS ────────────────────────────────────────────────────────────────
function tabInscritos(){
  const ins=FA.inscritos;
  return `<div class="sub-head"><div class="sub-t">Inscritos (${ins.length})</div>
    <button class="btn ghost" onclick="exportInscritos()">⬇ Excel</button></div>
    ${!ins.length?`<div class="vacio">Aún no hay inscritos. Comparte el link del postulante.</div>`
    :`<div class="tabla-scroll"><table class="tabla"><thead><tr><th>Nombre</th><th>RUT</th><th>Teléfono</th><th>Comuna</th><th>Inscrito</th><th>Postulaciones</th></tr></thead>
      <tbody>${ins.map(p=>{ const np=FA.postulaciones.filter(x=>x.cv_id===p.cv_id).length;
        return `<tr><td>${esc(p.nombre||'')}</td><td>${esc(p.rut||'')}</td><td>${esc(p.telefono||'')}</td><td>${esc(p.comuna||'')}</td>
        <td>${esc((p.inscrito_at||'').slice(0,10))}</td><td>${np}</td></tr>`; }).join('')}</tbody></table></div>`}`;
}

// ── REPORTES ─────────────────────────────────────────────────────────────────
function tabReportes(){
  const ins=FA.inscritos, pos=FA.postulaciones, bit=FA.bitacora;
  const escaneos=bit.filter(b=>b.accion==='escaneo').length;
  const porComuna=agrupa(ins,p=>p.comuna||'Sin comuna');
  const porEmpresa=agrupa(pos,p=>{ const e=FA.empresas.find(x=>x.feria_empresa_id===p.feria_empresa_id); return e?e.nombre:'—'; });
  const porStand=agrupa(bit.filter(b=>b.accion==='escaneo'),b=>{ const e=FA.empresas.find(x=>x.feria_empresa_id===b.feria_empresa_id); return e?(e.nombre+(e.stand?' ('+e.stand+')':'')):'—'; });
  const porCargo=agrupa(pos,p=>{ const o=FA.cargos.find(x=>x.oferta_id===p.oferta_id); return o?o.cargo:'—'; });
  return `<div class="sub-head"><div class="sub-t">Reportes</div><button class="btn ghost" onclick="exportConsolidado()">⬇ Base consolidada (Excel)</button></div>
    <div class="kpis">
      <div class="kpi"><div class="kpi-n">${ins.length}</div><div class="kpi-l">Inscritos</div></div>
      <div class="kpi"><div class="kpi-n">${FA.empresas.length}</div><div class="kpi-l">Empresas</div></div>
      <div class="kpi"><div class="kpi-n">${FA.cargos.length}</div><div class="kpi-l">Cargos</div></div>
      <div class="kpi"><div class="kpi-n">${pos.length}</div><div class="kpi-l">Postulaciones</div></div>
      <div class="kpi"><div class="kpi-n">${escaneos}</div><div class="kpi-l">Escaneos en stand</div></div>
    </div>
    <div class="charts">
      ${barChart('Inscritos por comuna',porComuna)}
      ${barChart('Postulaciones por empresa',porEmpresa)}
      ${barChart('Escaneos por stand',porStand)}
      ${barChart('Cargos con más postulaciones',porCargo)}
    </div>`;
}
function agrupa(arr,fn){ const m={}; arr.forEach(x=>{ const k=fn(x)||'—'; m[k]=(m[k]||0)+1; }); return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,10); }
function barChart(titulo,pares){
  const max=Math.max(1,...pares.map(p=>p[1]));
  return `<div class="chart-box"><h4>${esc(titulo)}</h4>
    ${!pares.length?'<div style="color:var(--muted);font-size:.85rem">Sin datos aún.</div>':
    pares.map(([k,v])=>`<div class="bar-row"><div class="lbl" title="${esc(k)}">${esc(k)}</div>
      <div class="bar"><div style="width:${(v/max*100).toFixed(0)}%"></div></div><div class="val">${v}</div></div>`).join('')}</div>`;
}
function exportInscritos(){
  const aoa=[['Nombre','RUT','Teléfono','Comuna','Inscrito','Postulaciones']];
  FA.inscritos.forEach(p=>aoa.push([p.nombre,p.rut,p.telefono,p.comuna,(p.inscrito_at||'').slice(0,10),FA.postulaciones.filter(x=>x.cv_id===p.cv_id).length]));
  descargar(aoa,'Inscritos','feria_inscritos');
}
function exportConsolidado(){
  const wb=XLSX.utils.book_new();
  const ins=[['Nombre','RUT','Teléfono','Comuna','Inscrito']]; FA.inscritos.forEach(p=>ins.push([p.nombre,p.rut,p.telefono,p.comuna,(p.inscrito_at||'').slice(0,10)]));
  const pos=[['Postulante(cv_id)','Cargo','Empresa','Canal','Match %','Fecha']];
  FA.postulaciones.forEach(p=>{ const o=FA.cargos.find(x=>x.oferta_id===p.oferta_id); const e=FA.empresas.find(x=>x.feria_empresa_id===p.feria_empresa_id);
    pos.push([p.cv_id,o?o.cargo:'',e?e.nombre:'',p.canal||'',p.match_pct||'',(p.fecha_postulacion||'').slice(0,10)]); });
  const bit=[['Fecha','Empresa','Stand','Reclutador','Acción','Estado','Comentario']];
  FA.bitacora.forEach(b=>{ const e=FA.empresas.find(x=>x.feria_empresa_id===b.feria_empresa_id);
    bit.push([(b.created_at||'').slice(0,16).replace('T',' '),e?e.nombre:'',b.stand||'',b.reclutador_nombre||'',b.accion||'',b.estado||'',b.comentario||'']); });
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(ins),'Inscritos');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(pos),'Postulaciones');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(bit),'Bitacora');
  XLSX.writeFile(wb,'feria_'+(FA.actual.codigo||'')+'_consolidado.xlsx');
}
function descargar(aoa,hoja,nombre){ const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(aoa),hoja); XLSX.writeFile(wb,nombre+'.xlsx'); }
