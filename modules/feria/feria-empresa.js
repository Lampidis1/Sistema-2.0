// ═══════════════════════════════════════════════════════════════════════════
// feria-empresa.js — Panel de empresa y reclutador · Feria Digital
// Sistema AM · Antofagasta Minerals
//
// El usuario está enlazado a una o más empresas (feria_empresa_usuarios). Puede:
//   · Escanear el QR del postulante con la cámara (jsQR) → ve el CV al instante,
//     marca estado y comenta (queda en la bitácora de trazabilidad).
//   · Ver sus candidatos (escaneados en stand + postulados en la app).
//   · Publicar/editar sus cargos con criterios.
//   · Revisar la bitácora.
//
// Matching explicable reutilizando empleabilidad-match.js (local, sin terceros).
// auth-guard declara SB/USER/ES_ADMIN (slug 'feria_empresa'). Nunca type=module.
// ═══════════════════════════════════════════════════════════════════════════

let FE = { user:null, empresas:[], links:[], empresa:null, feria:null, cargos:[], postulaciones:[], bitacora:[], participantes:[], tab:'escanear', scanning:false, stream:null, _canvas:null, scanCV:null, scanInfo:null };
let OFE=null;

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function toast(m,t){ const e=document.getElementById('toast'); e.textContent=m; e.className='toast show'+(t==='err'?' err':t==='ok'?' ok':''); clearTimeout(e._to); e._to=setTimeout(()=>e.className='toast',3200); }
function uid(p){ return (p||'id')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6); }
function val(id){ const e=document.getElementById(id); return e?e.value.trim():''; }
function quien(){ try{ const u=USER; return (u&&u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||(u&&u.email||'').split('@')[0]||''; }catch(e){ return ''; } }
function nowISO(){ return new Date().toISOString(); }
function parseJ(s){ try{ return JSON.parse(s||'[]'); }catch(e){ return []; } }
function abrirModal(html){ document.getElementById('modalHost').innerHTML=`<div class="modal-ov" onclick="if(event.target===this)cerrarModal()"><div class="modal-box">${html}</div></div>`; }
function cerrarModal(){ document.getElementById('modalHost').innerHTML=''; }

// cvTexto local (para matchDetalle), igual que en el postulante.
function cvTexto(cv){ const arr=a=>Array.isArray(a)?a:[];
  return [cv.resumen,cv.nombres,cv.apellidos,cv.oficios,cv.exp_mineria,cv.educacion,cv.certificaciones,cv.comuna,cv.disponibilidad,cv.tipo_licencia,(cv.licencia?('licencia '+(cv.tipo_licencia||'')):''),cv.equipos,
    arr(cv.experiencia).map(e=>[e.cargo,e.empresa].join(' ')).join(' '),
    arr(cv.cursos).map(c=>[c.evento,c.tema].join(' ')).join(' ')].filter(Boolean).join(' '); }
function cvDesdeFila(row){ if(!row) return {}; const pj=s=>{try{return JSON.parse(s||'[]');}catch(e){return [];}};
  return {...row, experiencia:pj(row.experiencia_json), cursos:pj(row.cursos_json), academico:pj(row.academico_json)}; }

async function feEmpresaOnAcceso(user){
  FE.user=user;
  try{ await cargarDiccionarioOficios(); }catch(e){}
  const {data:links}=await SB.from('feria_empresa_usuarios').select('*').eq('user_id',user.id).neq('estado_registro','Eliminado');
  FE.links=links||[];
  let empresas=[];
  if(FE.links.length){
    const ids=FE.links.map(l=>l.feria_empresa_id);
    const {data}=await SB.from('feria_empresas').select('*').in('feria_empresa_id',ids).neq('estado_registro','Eliminado');
    empresas=data||[];
  }else if(ES_ADMIN){
    const {data}=await SB.from('feria_empresas').select('*').neq('estado_registro','Eliminado').order('nombre').limit(200);
    empresas=data||[];
  }
  if(!empresas.length){
    document.getElementById('loginStep').style.display='none';
    document.getElementById('regStep').style.display='none';
    document.getElementById('pendStep').style.display='block';
    return;
  }
  FE.empresas=empresas;
  document.getElementById('gate').style.display='none';
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('hUser').textContent=(user&&user.email)||'';
  const sel=document.getElementById('selEmpresa');
  if(empresas.length>1){ sel.style.display='inline-block'; sel.innerHTML=empresas.map(e=>`<option value="${e.feria_empresa_id}">${esc(e.nombre)}</option>`).join(''); }
  FE.empresa=empresas[0];
  await feCargar();
  feSetTab('escanear');
}
async function cambiarEmpresa(id){ FE.empresa=FE.empresas.find(e=>e.feria_empresa_id===id)||FE.empresas[0]; await feCargar(); feSetTab(FE.tab); }

async function feCargar(){
  const e=FE.empresa; if(!e) return;
  document.getElementById('hEmpresa').textContent=e.nombre+(e.stand?(' · Stand '+e.stand):'');
  const [fer,car,pos,bit,par]=await Promise.all([
    SB.from('ferias').select('*').eq('feria_id',e.feria_id).limit(1),
    SB.from('cv_ofertas').select('*').eq('feria_empresa_id',e.feria_empresa_id).neq('estado_registro','Eliminado'),
    SB.from('cv_postulaciones').select('*').eq('feria_empresa_id',e.feria_empresa_id).neq('estado_registro','Eliminado'),
    SB.from('feria_bitacora').select('*').eq('feria_empresa_id',e.feria_empresa_id).neq('estado_registro','Eliminado').order('created_at',{ascending:false}),
    SB.from('feria_participantes').select('*').eq('feria_id',e.feria_id).neq('estado_registro','Eliminado'),
  ]);
  FE.feria=(fer.data||[])[0]||null;
  FE.cargos=(car.data||[]).map(o=>({...o,criterios:parseJ(o.criterios_json)}));
  FE.postulaciones=pos.data||[]; FE.bitacora=bit.data||[]; FE.participantes=par.data||[];
}
function partePorCv(cv_id){ return FE.participantes.find(p=>p.cv_id===cv_id); }
function partePorId(id){ return FE.participantes.find(p=>p.feria_participante_id===id); }

// ── tabs ─────────────────────────────────────────────────────────────────────
function feSetTab(t){
  if(FE.tab==='escanear' && t!=='escanear') feDetenerCamara();
  FE.tab=t;
  document.querySelectorAll('#feTabs .tab2').forEach(b=>b.classList.toggle('active', b.getAttribute('onclick').includes("'"+t+"'")));
  const b=document.getElementById('feBody');
  if(t==='escanear') b.innerHTML=tabEscanear();
  else if(t==='candidatos') b.innerHTML=tabCandidatos();
  else if(t==='cargos') b.innerHTML=tabCargos();
  else if(t==='bitacora') b.innerHTML=tabBitacora();
}

// ── ESCANEAR ─────────────────────────────────────────────────────────────────
function tabEscanear(){
  return `<div class="scan-wrap">
    <div class="sub-t" style="margin-bottom:10px">Escanear credencial</div>
    <video id="scanVideo" muted playsinline></video>
    <div class="scan-hint">Apunta la cámara al código QR de la credencial del postulante.</div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button class="btn primary" id="scanBtn" onclick="feIniciarCamara()">▶ Encender cámara</button>
      <button class="btn ghost" onclick="feTokenManual()">⌨ Ingresar código manual</button>
    </div>
    <div id="scanPerfil"></div>
  </div>`;
}
async function feIniciarCamara(){
  const video=document.getElementById('scanVideo'); if(!video) return;
  try{
    FE.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    video.srcObject=FE.stream; await video.play();
    FE.scanning=true; document.getElementById('scanBtn').textContent='⏹ Escaneando…';
    requestAnimationFrame(feTick);
  }catch(e){ toast('No se pudo abrir la cámara: '+e.message+'. Usa «código manual».','err'); }
}
function feTick(){
  if(!FE.scanning) return;
  const video=document.getElementById('scanVideo');
  if(!video||video.readyState!==video.HAVE_ENOUGH_DATA){ requestAnimationFrame(feTick); return; }
  const c=FE._canvas||(FE._canvas=document.createElement('canvas'));
  c.width=video.videoWidth; c.height=video.videoHeight;
  const ctx=c.getContext('2d',{willReadFrequently:true}); ctx.drawImage(video,0,0,c.width,c.height);
  let code=null; try{ const img=ctx.getImageData(0,0,c.width,c.height); code=jsQR(img.data,img.width,img.height); }catch(e){}
  if(code&&code.data){ feDetenerCamara(); feResolver(code.data.trim()); return; }
  requestAnimationFrame(feTick);
}
function feDetenerCamara(){ FE.scanning=false; if(FE.stream){ FE.stream.getTracks().forEach(t=>t.stop()); FE.stream=null; } const b=document.getElementById('scanBtn'); if(b) b.textContent='▶ Encender cámara'; }
function feTokenManual(){
  const t=prompt('Pega el código de la credencial (token):'); if(t) feResolver(t.trim());
}
async function feResolver(token){
  toast('Buscando credencial…');
  try{
    const {data,error}=await SB.rpc('feria_resolver_qr',{p_token:token});
    if(error) throw error;
    FE.scanInfo=data; FE.scanCV=cvDesdeFila(data.cv||{});
    feRenderPerfil();
  }catch(e){ toast('No se pudo leer la credencial: '+e.message,'err'); }
}
function feRenderPerfil(){
  const d=FE.scanInfo, cv=FE.scanCV;
  // sugerir mejor cargo
  let sugerido='';
  try{ mConstruirIDF([cv]);
    const rank=FE.cargos.map(o=>({o, pct:matchDetalle(cv,{criterios:o.criterios}).pct})).sort((a,b)=>b.pct-a.pct);
    if(rank.length) sugerido=`<div class="perfil-campo"><b>Mejor calce:</b> ${esc(rank[0].o.cargo)} · <b style="color:var(--teal)">${rank[0].pct}%</b></div>`;
  }catch(e){}
  const opts=FE.cargos.map(o=>`<option value="${o.oferta_id}">${esc(o.cargo)}</option>`).join('');
  const cont=document.getElementById('scanPerfil');
  cont.innerHTML=`<div class="perfil-box">
    <div class="perfil-nom">${esc(d.nombre||'—')}</div>
    <div class="perfil-sub">${esc(d.comuna||'')}${d.telefono?(' · '+esc(d.telefono)):''}</div>
    ${cv.oficios?`<div class="perfil-campo"><b>Oficio:</b> ${esc(cv.oficios)}</div>`:''}
    ${cv.exp_mineria?`<div class="perfil-campo"><b>Exp. minera:</b> ${esc(cv.exp_mineria)}</div>`:''}
    ${cv.anios_exp?`<div class="perfil-campo"><b>Años exp.:</b> ${esc(cv.anios_exp)}</div>`:''}
    ${cv.equipos?`<div class="perfil-campo"><b>Equipos:</b> ${esc(cv.equipos)}</div>`:''}
    ${cv.tipo_licencia?`<div class="perfil-campo"><b>Licencia:</b> ${esc(cv.tipo_licencia)}</div>`:''}
    ${cv.disponibilidad?`<div class="perfil-campo"><b>Disponibilidad:</b> ${esc(cv.disponibilidad)}</div>`:''}
    ${cv.resumen?`<div class="perfil-campo">${esc(cv.resumen)}</div>`:''}
    ${sugerido}
    <hr style="border:none;border-top:1px solid var(--border);margin:12px 0">
    <label style="font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase">Derivar a cargo</label>
    <select id="scDeriva">${opts||'<option value="">(sin cargos)</option>'}</select>
    <label style="font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;margin-top:8px;display:block">Estado</label>
    <select id="scEstado"><option value="nuevo">Nuevo contacto</option><option value="preseleccionado">Preseleccionado</option><option value="contactar">Contactar</option><option value="descartado">Descartado</option></select>
    <label style="font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;margin-top:8px;display:block">Comentario</label>
    <textarea id="scComent" rows="2" style="width:100%;border:1.5px solid var(--border);border-radius:9px;padding:9px"></textarea>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn primary" onclick="feGuardarEscaneo()">Guardar en bitácora</button>
      <button class="btn ghost" onclick="document.getElementById('scanPerfil').innerHTML=''">Cerrar</button>
    </div>
  </div>`;
}
async function feGuardarEscaneo(){
  const d=FE.scanInfo, cv=FE.scanCV; if(!d) return;
  const ofertaId=val('scDeriva')||null;
  let pct=null; try{ if(ofertaId){ const o=FE.cargos.find(x=>x.oferta_id===ofertaId); if(o){ mConstruirIDF([cv]); pct=matchDetalle(cv,{criterios:o.criterios}).pct; } } }catch(e){}
  const fila={ bitacora_id:uid('bit'), feria_id:FE.empresa.feria_id, feria_empresa_id:FE.empresa.feria_empresa_id,
    feria_participante_id:d.participante_id, cv_id:(cv&&cv.cv_id)||null, reclutador_user:FE.user.id, reclutador_nombre:quien(),
    stand:FE.empresa.stand||null, accion:'escaneo', estado:val('scEstado')||'nuevo', comentario:val('scComent')||null,
    oferta_id:ofertaId, match_pct:pct, created_at:nowISO() };
  try{
    const {error}=await SB.from('feria_bitacora').insert(fila); if(error) throw error;
    // marcar check-in del participante (primera vez)
    try{ await SB.from('feria_participantes').update({checkin_at:nowISO(),estado:'asistió',updated_at:nowISO()}).eq('feria_participante_id',d.participante_id).is('checkin_at',null); }catch(e){}
    document.getElementById('scanPerfil').innerHTML='';
    await feCargar(); toast('✅ Registrado en la bitácora','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ── CANDIDATOS (3 bases) ─────────────────────────────────────────────────────
let FE_FILTRO='postulados';
function tabCandidatos(){
  return `<div class="sub-head"><div class="sub-t">Candidatos</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="mini" onclick="feFiltro('postulados')" id="fc-postulados">📨 Postulados</button>
      <button class="mini" onclick="feFiltro('escaneados')" id="fc-escaneados">📷 Escaneados</button>
      <button class="mini" onclick="feFiltro('todos')" id="fc-todos">Todos</button>
      <button class="btn ghost" onclick="feExportCandidatos()">⬇ Excel</button>
    </div></div>
    <div id="feCandBody"></div>`;
}
function feFiltro(f){ FE_FILTRO=f; renderCandidatos(); }
function feCandidatosData(){
  // combinar postulaciones (canal app) y escaneos (bitácora) por participante
  const map={};
  const add=(pid,cvid,origen)=>{ const k=pid||cvid; if(!k) return; if(!map[k]) map[k]={pid,cvid,origen:new Set(),cargos:new Set(),best:0}; map[k].origen.add(origen); };
  FE.postulaciones.forEach(p=>{ const par=partePorCv(p.cv_id); add(par&&par.feria_participante_id,p.cv_id,'postulado');
    const k=(par&&par.feria_participante_id)||p.cv_id; if(map[k]){ const o=FE.cargos.find(x=>x.oferta_id===p.oferta_id); if(o) map[k].cargos.add(o.cargo); map[k].best=Math.max(map[k].best,+p.match_pct||0); } });
  FE.bitacora.filter(b=>b.accion==='escaneo').forEach(b=>{ add(b.feria_participante_id,b.cv_id,'escaneado');
    const k=b.feria_participante_id||b.cv_id; if(map[k]){ if(b.oferta_id){ const o=FE.cargos.find(x=>x.oferta_id===b.oferta_id); if(o) map[k].cargos.add(o.cargo);} map[k].best=Math.max(map[k].best,+b.match_pct||0); } });
  return Object.values(map).map(m=>{ const par=partePorId(m.pid)||partePorCv(m.cvid)||{};
    return {pid:m.pid,cvid:m.cvid,nombre:par.nombre||'—',comuna:par.comuna||'',token:par.credencial_token,
      cargos:[...m.cargos].join(', '),best:m.best,origen:[...m.origen]}; });
}
function renderCandidatos(){
  const cont=document.getElementById('feCandBody'); if(!cont) return;
  document.querySelectorAll('#feCandBody, .mini').forEach(()=>{});
  ['postulados','escaneados','todos'].forEach(f=>{ const b=document.getElementById('fc-'+f); if(b) b.style.borderColor= (f===FE_FILTRO)?'var(--teal)':''; });
  let data=feCandidatosData();
  if(FE_FILTRO==='postulados') data=data.filter(d=>d.origen.includes('postulado'));
  else if(FE_FILTRO==='escaneados') data=data.filter(d=>d.origen.includes('escaneado'));
  data.sort((a,b)=>b.best-a.best);
  cont.innerHTML=!data.length?`<div class="vacio">Sin candidatos en esta base todavía.</div>`
    :`<div class="tabla-scroll"><table class="tabla"><thead><tr><th>Nombre</th><th>Comuna</th><th>Cargos</th><th>Match</th><th>Origen</th><th></th></tr></thead>
      <tbody>${data.map(d=>`<tr><td>${esc(d.nombre)}</td><td>${esc(d.comuna)}</td><td>${esc(d.cargos||'—')}</td>
        <td>${d.best?d.best+'%':'—'}</td><td>${d.origen.map(o=>`<span class="chip gray">${o}</span>`).join(' ')}</td>
        <td>${d.token?`<button class="mini" onclick="feVerCV('${d.token}')">Ver CV</button>`:''}</td></tr>`).join('')}</tbody></table></div>`;
}
async function feVerCV(token){
  try{ const {data,error}=await SB.rpc('feria_resolver_qr',{p_token:token}); if(error) throw error;
    const cv=cvDesdeFila(data.cv||{});
    abrirModal(`<h3>${esc(data.nombre||'Candidato')}</h3>
      <div class="perfil-sub">${esc(data.comuna||'')}${data.telefono?(' · '+esc(data.telefono)):''}</div>
      <div style="margin-top:10px">
      ${cv.oficios?`<div class="perfil-campo"><b>Oficio:</b> ${esc(cv.oficios)}</div>`:''}
      ${cv.exp_mineria?`<div class="perfil-campo"><b>Exp. minera:</b> ${esc(cv.exp_mineria)}</div>`:''}
      ${cv.anios_exp?`<div class="perfil-campo"><b>Años:</b> ${esc(cv.anios_exp)}</div>`:''}
      ${cv.equipos?`<div class="perfil-campo"><b>Equipos:</b> ${esc(cv.equipos)}</div>`:''}
      ${cv.tipo_licencia?`<div class="perfil-campo"><b>Licencia:</b> ${esc(cv.tipo_licencia)}</div>`:''}
      ${cv.disponibilidad?`<div class="perfil-campo"><b>Disponibilidad:</b> ${esc(cv.disponibilidad)}</div>`:''}
      ${(cv.experiencia||[]).length?`<div class="perfil-campo"><b>Experiencia:</b> ${(cv.experiencia||[]).map(e=>esc([e.cargo,e.empresa].filter(Boolean).join(' — '))).join('; ')}</div>`:''}
      ${cv.resumen?`<div class="perfil-campo" style="margin-top:6px">${esc(cv.resumen)}</div>`:''}
      </div>
      <div class="modal-acc"><span></span><button class="btn ghost" onclick="cerrarModal()">Cerrar</button></div>`);
  }catch(e){ toast('No se pudo abrir el CV: '+e.message,'err'); }
}
function feExportCandidatos(){
  const data=feCandidatosData();
  const aoa=[['Nombre','Comuna','Cargos','Match %','Origen']];
  data.forEach(d=>aoa.push([d.nombre,d.comuna,d.cargos,d.best||'',d.origen.join('+')]));
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(aoa),'Candidatos');
  XLSX.writeFile(wb,'candidatos_'+(FE.empresa.nombre||'').replace(/\W+/g,'_')+'.xlsx');
}

// ── MIS CARGOS ───────────────────────────────────────────────────────────────
function tabCargos(){
  return `<div class="sub-head"><div class="sub-t">Mis cargos</div><button class="btn primary" onclick="ofeModal()">➕ Nuevo cargo</button></div>
    ${!FE.cargos.length?`<div class="vacio">Aún no publicas cargos.<br><span>Publica un cargo con sus criterios para que los postulantes calcen contigo.</span></div>`
    :`<div class="grid-cards">${FE.cargos.map(o=>{ const n=FE.postulaciones.filter(p=>p.oferta_id===o.oferta_id).length;
      return `<div class="card"><div style="font-weight:700">${esc(o.cargo)}</div>
        <div style="font-size:.82rem;color:var(--muted);margin-top:6px">🎯 ${(o.criterios||[]).length} criterio(s) · 📨 ${n} postulación(es)</div>
        <div style="margin-top:10px;display:flex;gap:6px"><button class="mini" onclick="ofeModal('${o.oferta_id}')">✏ Editar</button>
          <button class="mini danger" onclick="ofeBorrar('${o.oferta_id}')">🗑</button></div></div>`; }).join('')}</div>`}`;
}
function ofeModal(id){
  const o=id?FE.cargos.find(x=>x.oferta_id===id):{criterios:[]}; OFE=JSON.parse(JSON.stringify(o)); OFE.criterios=OFE.criterios||[];
  abrirModal(`<h3>${id?'Editar cargo':'Nuevo cargo'}</h3>
    <label>Cargo *</label><input id="oCargo" value="${esc(o.cargo||'')}">
    <label>Descripción</label><textarea id="oDesc" rows="2">${esc(o.descripcion||'')}</textarea>
    <label>Comuna</label><input id="oComuna" value="${esc(o.comuna||'')}">
    <label>Criterios (texto + ponderación %)</label><div id="oCrits"></div>
    <button class="mini" onclick="ofeAdd()">➕ Agregar criterio</button><div id="oPond" style="font-size:.8rem;color:var(--muted);margin-top:6px"></div>
    <div class="modal-acc"><span></span><div><button class="btn ghost" onclick="cerrarModal()">Cancelar</button>
      <button class="btn primary" onclick="ofeGuardar('${id||''}')">Guardar</button></div></div>`);
  ofeRender();
}
function ofeRender(){ const c=document.getElementById('oCrits'); if(!c) return;
  c.innerHTML=(OFE.criterios||[]).map((cr,i)=>`<div class="crit-row">
    <input type="text" value="${esc(cr.texto||'')}" oninput="OFE.criterios[${i}].texto=this.value" placeholder="Ej: experiencia CAEX, licencia D…">
    <input type="number" min="0" max="100" value="${cr.ponderacion||0}" oninput="OFE.criterios[${i}].ponderacion=parseInt(this.value)||0;ofePond()"> %
    <button class="mini danger" onclick="ofeDel(${i})">✕</button></div>`).join(''); ofePond(); }
function ofeAdd(){ OFE.criterios.push({texto:'',ponderacion:0}); ofeRender(); }
function ofeDel(i){ OFE.criterios.splice(i,1); ofeRender(); }
function ofePond(){ const s=(OFE.criterios||[]).reduce((a,c)=>a+(+c.ponderacion||0),0); const e=document.getElementById('oPond'); if(e) e.textContent='Suma: '+s+'%'+(s===100?' ✓':''); }
async function ofeGuardar(id){
  const cargo=val('oCargo'); if(!cargo){ toast('El cargo es obligatorio','err'); return; }
  const fila={ empresa:FE.empresa.nombre, cargo, descripcion:val('oDesc')||null, comuna:val('oComuna')||null,
    criterios_json:JSON.stringify((OFE.criterios||[]).filter(c=>(c.texto||'').trim())), estado:'Abierta', estado_registro:'Activo',
    feria_id:FE.empresa.feria_id, feria_empresa_id:FE.empresa.feria_empresa_id, updated_at:nowISO(), updated_by:quien() };
  try{
    if(id){ const {error}=await SB.from('cv_ofertas').update(fila).eq('oferta_id',id); if(error) throw error; }
    else{ fila.oferta_id=uid('of'); fila.created_by=quien(); fila.created_at=nowISO(); const {error}=await SB.from('cv_ofertas').insert(fila); if(error) throw error; }
    cerrarModal(); await feCargar(); feSetTab('cargos'); toast('✅ Cargo guardado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function ofeBorrar(id){ if(!confirm('¿Eliminar este cargo?')) return;
  try{ const {error}=await SB.from('cv_ofertas').update({estado_registro:'Eliminado',updated_at:nowISO()}).eq('oferta_id',id); if(error) throw error;
    await feCargar(); feSetTab('cargos'); toast('🗑 Eliminado','ok'); }catch(e){ toast('Error: '+e.message,'err'); } }

// ── BITÁCORA ─────────────────────────────────────────────────────────────────
function tabBitacora(){
  const b=FE.bitacora;
  return `<div class="sub-head"><div class="sub-t">Bitácora de trazabilidad (${b.length})</div></div>
    ${!b.length?`<div class="vacio">Sin registros. Los escaneos y cambios de estado aparecen aquí.</div>`
    :`<div class="tabla-scroll"><table class="tabla"><thead><tr><th>Fecha</th><th>Candidato</th><th>Acción</th><th>Estado</th><th>Cargo</th><th>Comentario</th><th>Reclutador</th></tr></thead>
      <tbody>${b.map(r=>{ const par=partePorId(r.feria_participante_id)||partePorCv(r.cv_id)||{}; const o=FE.cargos.find(x=>x.oferta_id===r.oferta_id);
        return `<tr><td>${esc((r.created_at||'').slice(0,16).replace('T',' '))}</td><td>${esc(par.nombre||'—')}</td>
        <td>${esc(r.accion||'')}</td><td><span class="chip gray">${esc(r.estado||'')}</span></td><td>${esc(o?o.cargo:'')}</td>
        <td>${esc(r.comentario||'')}</td><td>${esc(r.reclutador_nombre||'')}</td></tr>`; }).join('')}</tbody></table></div>`}`;
}
