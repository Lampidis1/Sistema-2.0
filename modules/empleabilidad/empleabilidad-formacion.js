// ═══════════════════════════════════════════════════════════════════════════
// empleabilidad-formacion.js — Pestaña "Formación" (cursos)
// Sistema AM · Antofagasta Minerals
//
// Se crean los cursos de formación (como las vacantes de Intermediación); el
// Móvil los lista en su ruta de Formación para inscribir a las personas.
// Usa los globales de empleabilidad (SB, esc, toast, miNombre). Prefijo fl/FL.
// <script src> clásico, nunca type="module" (CLAUDE.md §6).
// ═══════════════════════════════════════════════════════════════════════════

let FL = { cursos:[], loaded:false };
function flVal(id){ const e=document.getElementById(id); return e?e.value.trim():''; }
function flUid(){ return 'curso_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6); }
function flModal(html){ let h=document.getElementById('flModalHost'); if(!h){ h=document.createElement('div'); h.id='flModalHost'; document.body.appendChild(h); }
  h.innerHTML='<div class="il-ov" onclick="if(event.target===this)flCerrar()"><div class="il-box">'+html+'</div></div>'; }
function flCerrar(){ const h=document.getElementById('flModalHost'); if(h) h.innerHTML=''; }

async function renderFormacion(){
  const cont=document.getElementById('page-formacion');
  if(!FL.loaded){ cont.innerHTML='<div class="il-vacio">Cargando…</div>'; await flCargar(); }
  flRender();
}
async function flCargar(){
  try{ const {data,error}=await SB.from('cursos').select('*').neq('estado_registro','Eliminado').order('created_at',{ascending:false});
    if(error) throw error; FL.cursos=data||[]; FL.loaded=true;
  }catch(e){ FL.cursos=[]; toast('Error al cargar cursos: '+e.message,'err'); }
}
function flRender(){
  const cont=document.getElementById('page-formacion');
  const abiertos=FL.cursos.filter(c=>c.estado!=='cerrado').length;
  cont.innerHTML=`
    <div class="il-head"><div><div class="il-t">Formación · Cursos</div>
      <div class="il-s">Publica los cursos disponibles. El Móvil los lista en la ruta de Formación para inscribir personas.</div></div></div>
    <div class="il-kpis"><div class="il-kpi"><b>${abiertos}</b><span>Cursos abiertos</span></div>
      <div class="il-kpi"><b>${FL.cursos.reduce((a,c)=>a+(+c.cupos||0),0)}</b><span>Cupos totales</span></div></div>
    <div class="il-sub"><div class="il-sub-t">Cursos</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="il-btn g" onclick="flExport()">⬇ Excel</button>
      <button class="il-btn" onclick="flCursoModal()">➕ Nuevo curso</button></div></div>
    ${!FL.cursos.length?`<div class="il-vacio">Aún no hay cursos. Crea el primero con «Nuevo curso».</div>`
    :`<div class="il-grid">${FL.cursos.map(flCard).join('')}</div>`}`;
}
function flCard(c){
  return `<div class="il-card${c.estado==='cerrado'?' cerr':''}">
    <div class="il-card-h"><div><div class="il-card-cargo">${esc(c.nombre||'Curso')}</div>
      <div class="il-card-emp">${esc(c.institucion||'')}${c.area?' · '+esc(c.area):''}</div></div>
      <span class="il-chip ${c.ruta==='amsa'?'prop':'ext'}">${c.ruta==='amsa'?'AMSA':'EECC'}</span></div>
    <div class="il-card-meta">${[c.modalidad,c.duracion,c.cupos?c.cupos+' cupos':''].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div>
    ${c.descripcion?`<div style="font-size:.8rem;color:var(--text-muted,#6b7780);margin:6px 0">${esc(c.descripcion).slice(0,120)}</div>`:''}
    <div class="il-card-f"><span class="il-card-nd">${c.fecha_inicio?'📅 '+esc(c.fecha_inicio):''}</span>
      <div style="display:flex;gap:6px"><button class="il-mini" onclick="flCursoModal('${c.curso_id}')">✏</button>
        <button class="il-mini d" onclick="flBorrar('${c.curso_id}')">🗑</button></div></div>
  </div>`;
}
function flCursoModal(id){
  const c=id?FL.cursos.find(x=>x.curso_id===id):{};
  flModal(`<h3>${id?'Editar curso':'Nuevo curso'}</h3>
    <div class="il-g2"><div><label>Nombre del curso *</label><input id="cNombre" value="${esc(c.nombre||'')}"></div>
      <div><label>Institución</label><input id="cInst" value="${esc(c.institucion||'')}"></div></div>
    <div class="il-g3"><div><label>Área</label><input id="cArea" value="${esc(c.area||'')}"></div>
      <div><label>Modalidad</label><select id="cModal"><option value="">—</option><option ${c.modalidad==='Presencial'?'selected':''}>Presencial</option><option ${c.modalidad==='Online'?'selected':''}>Online</option><option ${c.modalidad==='Mixta'?'selected':''}>Mixta</option></select></div>
      <div><label>Duración</label><input id="cDur" value="${esc(c.duracion||'')}" placeholder="40 hrs, 2 meses…"></div></div>
    <div class="il-g3"><div><label>Cupos</label><input id="cCupos" type="number" min="0" value="${c.cupos||''}"></div>
      <div><label>Ruta</label><select id="cRuta"><option value="amsa" ${c.ruta!=='eecc'?'selected':''}>Ruta formativa AMSA</option><option value="eecc" ${c.ruta==='eecc'?'selected':''}>Empresa colaboradora</option></select></div>
      <div><label>Fecha inicio</label><input id="cFecha" type="date" value="${(c.fecha_inicio||'').slice(0,10)}"></div></div>
    <label>Requisitos</label><input id="cReq" value="${esc(c.requisitos||'')}">
    <label>Descripción</label><textarea id="cDesc" rows="2">${esc(c.descripcion||'')}</textarea>
    <div class="il-modal-acc">${id?`<button class="il-btn d g" onclick="flBorrar('${id}')">🗑 Eliminar</button>`:'<span></span>'}
      <div><button class="il-btn g" onclick="flCerrar()">Cancelar</button>
      <button class="il-btn" onclick="flGuardar('${id||''}')">Guardar</button></div></div>`);
}
async function flGuardar(id){
  const nombre=flVal('cNombre'); if(!nombre){ toast('El nombre del curso es obligatorio','err'); return; }
  const fila={ nombre, institucion:flVal('cInst')||null, area:flVal('cArea')||null, modalidad:flVal('cModal')||null,
    duracion:flVal('cDur')||null, cupos:parseInt(flVal('cCupos'))||null, ruta:flVal('cRuta'), fecha_inicio:flVal('cFecha')||null,
    requisitos:flVal('cReq')||null, descripcion:flVal('cDesc')||null, updated_at:new Date().toISOString(), updated_by:miNombre() };
  try{
    if(id){ const {error}=await SB.from('cursos').update(fila).eq('curso_id',id); if(error) throw error; }
    else{ fila.curso_id=flUid(); fila.created_by=miNombre(); const {error}=await SB.from('cursos').insert(fila); if(error) throw error; }
    flCerrar(); await flCargar(); flRender(); toast('✅ Curso guardado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function flBorrar(id){
  if(!confirm('¿Eliminar este curso?')) return;
  try{ const {error}=await SB.from('cursos').update({estado_registro:'Eliminado',updated_at:new Date().toISOString()}).eq('curso_id',id); if(error) throw error;
    flCerrar(); await flCargar(); flRender(); toast('🗑 Eliminado','ok'); }catch(e){ toast('Error: '+e.message,'err'); }
}
function flExport(){
  const aoa=[['Curso','Institución','Área','Modalidad','Duración','Cupos','Ruta','Fecha inicio','Requisitos','Descripción']];
  FL.cursos.forEach(c=>aoa.push([c.nombre,c.institucion,c.area,c.modalidad,c.duracion,c.cupos,c.ruta,(c.fecha_inicio||'').slice(0,10),c.requisitos,c.descripcion]));
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(aoa),'Cursos');
  XLSX.writeFile(wb,'formacion_cursos_'+new Date().toISOString().slice(0,10)+'.xlsx');
}
