// ═══════════════════════════════════════════════════════════════════════════
// movil-intermediacion.js — Vacantes desde la Oficina Móvil (Fase 3)
// Sistema AM · Antofagasta Minerals
//
// Los ejecutivos del móvil crean y listan VACANTES en la misma tabla `vacantes`
// que Empleabilidad (RLS permite 'movil'), así que aparecen en ambas plataformas.
// Además generan el LINK del portal de la empresa (vacante_links → token →
// gestion-vacante.html) para que la EECC gestione a los candidatos derivados.
//
// Reutiliza globales del Móvil: SB, toast, miNombre, esc, rcCopiar.
// <script src> clásico, nunca type="module" (CLAUDE.md §6). Prefijo im/IM.
// ═══════════════════════════════════════════════════════════════════════════

let IM = { vacantes:[], loaded:false, comp:[] };
const imNow=()=>new Date().toISOString();
const imUid=p=>(p||'id')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
function imVal(id){ const e=document.getElementById(id); return e?e.value.trim():''; }

async function imCargar(){
  try{
    const {data,error}=await SB.from('vacantes').select('*').neq('estado_registro','Eliminado').order('created_at',{ascending:false});
    if(error) throw error;
    IM.vacantes=(data||[]).map(v=>({...v, competencias:(()=>{try{return JSON.parse(v.competencias_json||'[]');}catch(e){return [];}})()}));
    IM.loaded=true;
  }catch(e){ toast('Error al cargar vacantes: '+e.message,'err'); }
}
async function imRender(){
  const cont=document.getElementById('page-intermediacion'); if(!cont) return;
  if(!IM.loaded){ cont.innerHTML='<div class="card"><div class="rc-nota">Cargando vacantes…</div></div>'; await imCargar(); }
  cont.innerHTML=`
    <div class="card">
      <div class="sec-t">🔗 Vacantes · Intermediación</div>
      <div class="rc-nota">Las vacantes que creas aquí también aparecen en Empleabilidad. Deriva candidatos desde la <b>Recepción</b>. Genera el <b>link para la empresa</b> para que gestione a los derivados.</div>
      <div class="btn-row"><button class="btn" onclick="imNueva()">➕ Nueva vacante</button></div>
    </div>
    ${!IM.vacantes.length?'<div class="card"><div class="rc-nota">Aún no hay vacantes. Crea la primera.</div></div>'
      : IM.vacantes.map(imCard).join('')}`;
}
function imCard(v){
  return `<div class="card">
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.12rem;color:var(--teal-dk,#006973)">${esc(v.cargo||'Cargo')}</div>
    <div class="rc-nota" style="margin:2px 0 6px">${esc(v.empresa||'')}${v.compania?' · '+esc(v.compania):''}${v.codigo_puesto?' · '+esc(v.codigo_puesto):''}${v.n_vacantes?' · '+v.n_vacantes+' vac.':''}</div>
    ${v.descripcion?`<div class="rc-nota">${esc(v.descripcion)}</div>`:''}
    ${(v.competencias||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:5px;margin:6px 0">${v.competencias.map(c=>`<span style="font-size:.72rem;border:1px solid var(--border,#D7DEE4);border-radius:6px;padding:2px 8px;${c.excluyente?'background:#fbe9e6;color:#c0311b;font-weight:600':''}">${c.excluyente?'⛔ ':''}${esc(c.texto||'')}</span>`).join('')}</div>`:''}
    <div class="btn-row">
      <button class="btn sec" onclick="imEditar('${v.vacante_id}')">✏ Editar</button>
      <button class="btn gray" onclick="imLinkEmpresa('${v.vacante_id}')">🔗 Link para la empresa</button>
    </div>
    <div id="imLink_${v.vacante_id}"></div>
  </div>`;
}

// ── Modal crear / editar ─────────────────────────────────────────────────────
function imModal(html){
  let h=document.getElementById('imModalHost');
  if(!h){ h=document.createElement('div'); h.id='imModalHost'; document.body.appendChild(h); }
  h.innerHTML=`<div class="im-ov" onmousedown="if(event.target===this)imCerrar()"><div class="im-box">${html}</div></div>`;
}
function imCerrar(){ const h=document.getElementById('imModalHost'); if(h) h.innerHTML=''; }
function imNueva(){ IM.comp=[]; imForm(null); }
function imEditar(id){ const v=IM.vacantes.find(x=>x.vacante_id===id); if(!v) return; IM.comp=(v.competencias||[]).map(c=>({...c})); imForm(v); }
function imForm(v){
  v=v||{};
  imModal(`
    <h3>${v.vacante_id?'Editar vacante':'Nueva vacante'}</h3>
    <div class="g2">
      <div class="fld"><label>Empresa (EECC)</label><input id="ivEmpresa" value="${esc(v.empresa||'')}"></div>
      <div class="fld"><label>Compañía / faena</label><input id="ivCompania" value="${esc(v.compania||'')}" placeholder="Centinela, Zaldívar…"></div>
    </div>
    <div class="g2">
      <div class="fld"><label>Cargo *</label><input id="ivCargo" value="${esc(v.cargo||'')}"></div>
      <div class="fld"><label>N° de vacantes</label><input id="ivN" type="number" min="1" value="${v.n_vacantes||1}"></div>
    </div>
    <div class="g2">
      <div class="fld"><label>Código del puesto</label><input id="ivCodigo" value="${esc(v.codigo_puesto||'')}" placeholder="se genera solo si lo dejas vacío"></div>
      <div class="fld"><label>Turno</label><input id="ivTurno" value="${esc(v.turno||'')}" placeholder="7x7, 5x2…"></div>
    </div>
    <div class="g2">
      <div class="fld"><label>Formación requerida</label><input id="ivForm" value="${esc(v.formacion||'')}"></div>
      <div class="fld"><label>Residencia / localidad</label><input id="ivResi" value="${esc(v.residencia||'')}"></div>
    </div>
    <div class="fld"><label>Descripción breve</label><textarea id="ivDesc" rows="2">${esc(v.descripcion||'')}</textarea></div>
    <div class="fld"><label>Datos adicionales (renta, beneficios…)</label><textarea id="ivDatos" rows="2">${esc(v.datos_adicionales||'')}</textarea></div>
    <div class="fld"><label>Competencias del cargo (una por línea; antepón <b>!</b> si es excluyente)</label>
      <textarea id="ivComp" rows="3" placeholder="!Licencia D\n3 años CAEX">${esc((IM.comp||[]).map(c=>(c.excluyente?'!':'')+(c.texto||'')).join('\n'))}</textarea></div>
    <div class="btn-row" style="justify-content:space-between">
      ${v.vacante_id?`<button class="btn gray" onclick="imBorrar('${v.vacante_id}')">🗑 Eliminar</button>`:'<span></span>'}
      <div style="display:flex;gap:8px"><button class="btn gray" onclick="imCerrar()">Cancelar</button>
      <button class="btn" onclick="imGuardar('${v.vacante_id||''}')">Guardar</button></div>
    </div>`);
}
async function imGuardar(id){
  const cargo=imVal('ivCargo'); if(!cargo){ toast('El cargo es obligatorio','err'); return; }
  let codigo=imVal('ivCodigo'); if(!codigo) codigo='VAC-'+Date.now().toString(36).toUpperCase().slice(-6);
  const comp=imVal('ivComp').split('\n').map(s=>s.trim()).filter(Boolean).map(l=>{
    const exc=l.startsWith('!'); return {texto:(exc?l.slice(1):l).trim(), excluyente:exc};
  });
  const fila={
    empresa:imVal('ivEmpresa')||null, compania:imVal('ivCompania')||null, tipo_contrato:'externo',
    codigo_puesto:codigo, cargo, n_vacantes:parseInt(imVal('ivN'))||1,
    formacion:imVal('ivForm')||null, residencia:imVal('ivResi')||null, turno:imVal('ivTurno')||null,
    descripcion:imVal('ivDesc')||null, datos_adicionales:imVal('ivDatos')||null,
    competencias_json:JSON.stringify(comp), estado:'abierta',
    updated_at:imNow(), updated_by:miNombre()
  };
  try{
    if(id){ const {error}=await SB.from('vacantes').update(fila).eq('vacante_id',id); if(error) throw error; }
    else{ fila.vacante_id=imUid('vac'); fila.created_by=miNombre(); const {error}=await SB.from('vacantes').insert(fila); if(error) throw error; }
    imCerrar(); IM.loaded=false; await imRender(); toast('✅ Vacante guardada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function imBorrar(id){
  if(!confirm('¿Eliminar esta vacante?')) return;
  try{ const {error}=await SB.from('vacantes').update({estado_registro:'Eliminado',updated_at:imNow()}).eq('vacante_id',id); if(error) throw error;
    imCerrar(); IM.loaded=false; await imRender(); toast('🗑 Vacante eliminada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
// Genera el link del portal de la empresa (token) para esta vacante.
async function imLinkEmpresa(vid){
  const v=IM.vacantes.find(x=>x.vacante_id===vid);
  try{
    const {data,error}=await SB.from('vacante_links').insert({vacante_id:vid, empresa:(v&&v.empresa)||null, created_by:miNombre()}).select('token').single();
    if(error) throw error;
    const url=location.origin+'/modules/empleabilidad/gestion-vacante.html?t='+data.token;
    const box=document.getElementById('imLink_'+vid);
    if(box) box.innerHTML=`<div class="rc-linkrow" style="margin-top:8px"><input id="imUrl_${vid}" readonly value="${esc(url)}" onclick="this.select()">
      <button class="btn sec" onclick="rcCopiar('imUrl_${vid}')">Copiar</button></div>
      <div class="rc-nota">Envía este link a la empresa: verá los candidatos derivados, descargará sus CV y marcará el seguimiento de contratación.</div>`;
    toast('🔗 Link de empresa creado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
