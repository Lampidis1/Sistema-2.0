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
  h.innerHTML=`<div class="im-ov"><div class="im-box">${html}</div></div>`;  /* no cierra al clic fuera (solo ✕/Cancelar) */
}
function imCerrar(){ const h=document.getElementById('imModalHost'); if(h) h.innerHTML=''; }
const IM_FAENAS=['Centinela','Zaldívar','Antucoya','Los Pelambres','El Soldado','Minera Centinela'];
function imNueva(){ IM.comp=[]; imForm(null); }
function imEditar(id){ const v=IM.vacantes.find(x=>x.vacante_id===id); if(!v) return; IM.comp=(v.competencias||[]).map(c=>({...c})); imForm(v); }
// Mismo formulario y estética que Empleabilidad (empleabilidad-intermediacion.js):
// tipo de contrato, competencias por fila con casilla ⛔ excluyente y "Agregar".
function imForm(v){
  v=v||{};
  const faenaOpts=IM_FAENAS.map(f=>`<option ${v.compania===f?'selected':''}>${esc(f)}</option>`).join('');
  imModal(`
    <h3>${v.vacante_id?'Editar vacante':'Nueva vacante'}</h3>
    <div class="g2">
      <div class="fld"><label>Empresa (EECC) que contrata</label><input id="ivEmpresa" value="${esc(v.empresa||'')}"></div>
      <div class="fld"><label>Compañía / faena</label><input id="ivCompania" list="imFaenas" value="${esc(v.compania||'')}" placeholder="Centinela, Zaldívar…"><datalist id="imFaenas">${faenaOpts}</datalist></div>
    </div>
    <div class="g2">
      <div class="fld"><label>Tipo de contrato</label>
        <select id="ivTipo" onchange="imTipoChange()">
          <option value="externo" ${v.tipo_contrato!=='propio'?'selected':''}>Empresa colaboradora (EECC)</option>
          <option value="propio" ${v.tipo_contrato==='propio'?'selected':''}>Contrato propio (AMSA / faena)</option>
        </select></div>
      <div class="fld"><label id="ivCodLbl">Código del puesto</label><input id="ivCodigo" value="${esc(v.codigo_puesto||'')}" placeholder="—"></div>
    </div>
    <div class="rc-nota" id="ivCodNota" style="margin:-4px 0 4px"></div>
    <div class="g2">
      <div class="fld"><label>Cargo *</label><input id="ivCargo" value="${esc(v.cargo||'')}"></div>
      <div class="fld"><label>N° de vacantes</label><input id="ivN" type="number" min="1" value="${v.n_vacantes||1}"></div>
    </div>
    <div class="g2">
      <div class="fld"><label>Formación requerida</label><input id="ivForm" value="${esc(v.formacion||'')}"></div>
      <div class="fld"><label>Residencia / localidad</label><input id="ivResi" value="${esc(v.residencia||'')}"></div>
    </div>
    <div class="g2">
      <div class="fld"><label>Turno</label><input id="ivTurno" value="${esc(v.turno||'')}" placeholder="7x7, 5x2…"></div>
      <div class="fld"><label>Fecha ingreso estimada</label><input id="ivFecha" type="date" value="${(v.fecha_ingreso||'').slice(0,10)}"></div>
    </div>
    <div class="fld"><label>Descripción breve</label><textarea id="ivDesc" rows="2">${esc(v.descripcion||'')}</textarea></div>
    <div class="fld"><label>Datos adicionales (renta, beneficios…)</label><textarea id="ivDatos" rows="2">${esc(v.datos_adicionales||'')}</textarea></div>
    <div class="fld"><label>Competencias del cargo</label>
      <div class="rc-nota" style="margin:0 0 6px">Marca ⛔ si es <b>excluyente</b> (obligatoria) o déjala como no excluyente (deseable).</div>
      <div id="ivComps"></div>
      <button class="btn gray" type="button" onclick="imCompAdd()">➕ Agregar competencia</button></div>
    <div class="btn-row" style="justify-content:space-between">
      ${v.vacante_id?`<button class="btn gray" onclick="imBorrar('${v.vacante_id}')">🗑 Eliminar</button>`:'<span></span>'}
      <div style="display:flex;gap:8px"><button class="btn gray" onclick="imCerrar()">Cancelar</button>
      <button class="btn" onclick="imGuardar('${v.vacante_id||''}')">Guardar</button></div>
    </div>`);
  imTipoChange(); imCompRender();
}
function imTipoChange(){
  const t=(document.getElementById('ivTipo')||{}).value;
  const lbl=document.getElementById('ivCodLbl'), nota=document.getElementById('ivCodNota'), inp=document.getElementById('ivCodigo');
  if(!lbl) return;
  if(t==='propio'){ lbl.textContent='Código del puesto *'; nota.textContent='Contrato propio: el código del puesto es obligatorio.'; inp.placeholder='Ej: AMSA-2026-0123'; }
  else{ lbl.textContent='Código del puesto (opcional)'; nota.textContent='Empresa colaboradora: si lo dejas vacío, se genera un código automático.'; inp.placeholder='se genera solo'; }
}
function imCompRender(){ const c=document.getElementById('ivComps'); if(!c) return;
  c.innerHTML=(IM.comp||[]).map((cp,i)=>`<div class="im-comp-row">
    <input type="text" value="${esc(cp.texto||'')}" oninput="IM.comp[${i}].texto=this.value" placeholder="Ej: Licencia D, 3 años CAEX, certificación rigger…">
    <label class="im-exc"><input type="checkbox" ${cp.excluyente?'checked':''} onchange="IM.comp[${i}].excluyente=this.checked"> ⛔ excluyente</label>
    <button class="btn gray im-comp-del" type="button" onclick="imCompDel(${i})">✕</button></div>`).join('')||'<div class="rc-nota">Sin competencias aún.</div>'; }
function imCompAdd(){ IM.comp.push({texto:'',excluyente:false}); imCompRender(); }
function imCompDel(i){ IM.comp.splice(i,1); imCompRender(); }
async function imGuardar(id){
  const cargo=imVal('ivCargo'); if(!cargo){ toast('El cargo es obligatorio','err'); return; }
  const tipo=(document.getElementById('ivTipo')||{}).value||'externo';
  let codigo=imVal('ivCodigo');
  if(tipo==='propio' && !codigo){ toast('En contrato propio el código del puesto es obligatorio','err'); return; }
  if(tipo!=='propio' && !codigo) codigo='VAC-'+Date.now().toString(36).toUpperCase().slice(-6);
  const comp=(IM.comp||[]).filter(c=>(c.texto||'').trim()).map(c=>({texto:c.texto.trim(),excluyente:!!c.excluyente}));
  const fila={
    empresa:imVal('ivEmpresa')||null, compania:imVal('ivCompania')||null, tipo_contrato:tipo,
    codigo_puesto:codigo, cargo, n_vacantes:parseInt(imVal('ivN'))||1,
    formacion:imVal('ivForm')||null, residencia:imVal('ivResi')||null, turno:imVal('ivTurno')||null,
    fecha_ingreso:imVal('ivFecha')||null,
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
