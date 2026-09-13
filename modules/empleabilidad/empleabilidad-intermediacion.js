// ═══════════════════════════════════════════════════════════════════════════
// empleabilidad-intermediacion.js — Pestaña "Intermediación Laboral"
// Sistema AM · Antofagasta Minerals
//
// Publica puestos disponibles (vacantes) y lleva el seguimiento de las
// derivaciones (personas enviadas a una vacante). Reemplaza las planillas
// "Ficha Vacantes EECC-AMSA" y "Seguimiento Derivaciones EECC".
//
// Convive con la pestaña "Ofertas" (match %): acá el calce es por competencias
// EXCLUYENTES / no excluyentes, sin porcentaje (se guarda el % para después).
//
// Usa los globales de empleabilidad: SB, USER, esc, toast, miNombre.
// <script src> clásico, nunca type="module" (CLAUDE.md §6). Todo con prefijo
// `il`/`IL` para no chocar con el resto del módulo (ámbito global compartido).
// ═══════════════════════════════════════════════════════════════════════════

let IL = { vacantes:[], derivaciones:[], vista:'vacantes', comp:[], loaded:false };
const IL_FAENAS = ['Antucoya','Centinela','Zaldívar','Los Pelambres','Minera Centinela','AMSA','Otra'];

function ilUid(p){ return (p||'id')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6); }
function ilNow(){ return new Date().toISOString(); }
function ilVal(id){ const e=document.getElementById(id); return e?e.value.trim():''; }
function ilParse(s){ try{ const v=JSON.parse(s||'[]'); return Array.isArray(v)?v:[]; }catch(e){ return []; } }
function ilModal(html){ let h=document.getElementById('ilModalHost'); if(!h){ h=document.createElement('div'); h.id='ilModalHost'; document.body.appendChild(h); }
  h.innerHTML='<div class="il-ov" onclick="if(event.target===this)ilCerrar()"><div class="il-box">'+html+'</div></div>'; }
function ilCerrar(){ const h=document.getElementById('ilModalHost'); if(h) h.innerHTML=''; }

async function renderIntermediacion(){
  const cont=document.getElementById('page-intermediacion');
  if(!IL.loaded){ cont.innerHTML='<div class="il-vacio">Cargando…</div>'; await ilCargar(); }
  ilRender();
}
async function ilCargar(){
  try{
    const [v,d]=await Promise.all([
      SB.from('vacantes').select('*').neq('estado_registro','Eliminado').order('created_at',{ascending:false}),
      SB.from('derivaciones').select('*').neq('estado_registro','Eliminado').order('fecha_derivacion',{ascending:false})
    ]);
    IL.vacantes=(v.data||[]).map(x=>({...x,competencias:ilParse(x.competencias_json)}));
    IL.derivaciones=d.data||[]; IL.loaded=true;
  }catch(e){ IL.vacantes=[]; IL.derivaciones=[]; toast('Error al cargar intermediación: '+e.message,'err'); }
}

function ilRender(){
  const cont=document.getElementById('page-intermediacion');
  const abiertas=IL.vacantes.filter(v=>v.estado!=='cerrada').length;
  const cupos=IL.vacantes.filter(v=>v.estado!=='cerrada').reduce((a,v)=>a+(+v.n_vacantes||0),0);
  const efect=IL.derivaciones.filter(d=>d.estado==='efectiva').length;
  cont.innerHTML=`
    <div class="il-head">
      <div><div class="il-t">Intermediación Laboral</div>
        <div class="il-s">Publica puestos disponibles y registra las derivaciones de personas a las vacantes.</div></div>
    </div>
    <div class="il-kpis">
      <div class="il-kpi"><b>${abiertas}</b><span>Vacantes abiertas</span></div>
      <div class="il-kpi"><b>${cupos}</b><span>Cupos disponibles</span></div>
      <div class="il-kpi"><b>${IL.derivaciones.length}</b><span>Derivaciones</span></div>
      <div class="il-kpi"><b style="color:#1e7e34">${efect}</b><span>Efectivas</span></div>
    </div>
    <div class="il-tabs">
      <button class="il-tab ${IL.vista==='vacantes'?'on':''}" onclick="ilVista('vacantes')">💼 Vacantes</button>
      <button class="il-tab ${IL.vista==='derivaciones'?'on':''}" onclick="ilVista('derivaciones')">➡ Derivaciones</button>
    </div>
    <div id="ilBody"></div>`;
  ilRenderBody();
}
function ilVista(v){ IL.vista=v; ilRender(); }
function ilRenderBody(){
  const b=document.getElementById('ilBody'); if(!b) return;
  if(IL.vista==='vacantes') b.innerHTML=ilVacantesHTML(); else b.innerHTML=ilDerivHTML();
}

// ── VACANTES ─────────────────────────────────────────────────────────────────
function ilVacantesHTML(){
  return `<div class="il-sub"><div class="il-sub-t">Puestos disponibles</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="il-btn g" onclick="ilLinkCV()">🔗 Link para armar CV</button>
    <button class="il-btn g" onclick="ilExportVacantes()">⬇ Excel</button>
    <button class="il-btn" onclick="ilVacanteModal()">➕ Nueva vacante</button></div></div>
    ${!IL.vacantes.length?`<div class="il-vacio">Aún no hay vacantes. Crea la primera con «Nueva vacante».</div>`
    :`<div class="il-grid">${IL.vacantes.map(ilVacCard).join('')}</div>`}`;
}
function ilVacCard(v){
  const nd=IL.derivaciones.filter(d=>d.vacante_id===v.vacante_id).length;
  const exc=(v.competencias||[]).filter(c=>c.excluyente).length;
  const cerr=v.estado==='cerrada';
  return `<div class="il-card${cerr?' cerr':''}">
    <div class="il-card-h">
      <div><div class="il-card-cargo">${esc(v.cargo||'Cargo')}</div>
        <div class="il-card-emp">${esc(v.empresa||'')}${v.compania?' · '+esc(v.compania):''}</div></div>
      <span class="il-chip ${v.tipo_contrato==='propio'?'prop':'ext'}">${v.tipo_contrato==='propio'?'Propio':'EECC'}</span>
    </div>
    <div class="il-card-cod">Código: <b>${esc(v.codigo_puesto||'—')}</b>${v.n_vacantes?` · ${v.n_vacantes} cupo(s)`:''}</div>
    <div class="il-card-meta">${[v.turno,v.con_campamento?'con campamento':'', v.residencia].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div>
    ${(v.competencias||[]).length?`<div class="il-comps">${v.competencias.slice(0,5).map(c=>`<span class="il-comp ${c.excluyente?'exc':''}">${c.excluyente?'⛔ ':''}${esc(c.texto)}</span>`).join('')}${v.competencias.length>5?` +${v.competencias.length-5}`:''}</div>`:''}
    <div class="il-card-f">
      <span class="il-card-nd">➡ ${nd} derivación(es)${exc?` · ⛔ ${exc} excluyente(s)`:''}</span>
      <div style="display:flex;gap:6px">
        <button class="il-mini" onclick="ilDerivarModal('${v.vacante_id}')">Derivar</button>
        <button class="il-mini" onclick="ilVacanteModal('${v.vacante_id}')">✏</button>
        <button class="il-mini d" onclick="ilBorrarVacante('${v.vacante_id}')">🗑</button>
      </div>
    </div>
  </div>`;
}
function ilVacanteModal(id){
  const v=id?IL.vacantes.find(x=>x.vacante_id===id):{}; IL.comp=(v.competencias||[]).map(c=>({...c}));
  const faenaOpts=IL_FAENAS.map(f=>`<option ${v.compania===f?'selected':''}>${esc(f)}</option>`).join('');
  ilModal(`
    <h3>${id?'Editar vacante':'Nueva vacante'}</h3>
    <div class="il-g2">
      <div><label>Empresa (EECC) que contrata</label><input id="vEmpresa" value="${esc(v.empresa||'')}"></div>
      <div><label>Compañía / faena</label><input id="vCompania" list="ilFaenas" value="${esc(v.compania||'')}"><datalist id="ilFaenas">${faenaOpts}</datalist></div>
    </div>
    <div class="il-g2">
      <div><label>Tipo de contrato</label>
        <select id="vTipo" onchange="ilTipoChange()">
          <option value="externo" ${v.tipo_contrato!=='propio'?'selected':''}>Empresa colaboradora (EECC)</option>
          <option value="propio" ${v.tipo_contrato==='propio'?'selected':''}>Contrato propio (AMSA / faena)</option>
        </select></div>
      <div><label id="vCodLbl">Código del puesto</label><input id="vCodigo" value="${esc(v.codigo_puesto||'')}" placeholder="—"></div>
    </div>
    <div id="vCodNota" class="il-nota"></div>
    <div class="il-g2">
      <div><label>Cargo *</label><input id="vCargo" value="${esc(v.cargo||'')}"></div>
      <div><label>N° de vacantes</label><input id="vNvac" type="number" min="1" value="${v.n_vacantes||1}"></div>
    </div>
    <div class="il-g2">
      <div><label>Formación requerida</label><input id="vForm" value="${esc(v.formacion||'')}"></div>
      <div><label>Residencia / localidad</label><input id="vResi" value="${esc(v.residencia||'')}"></div>
    </div>
    <div class="il-g3">
      <div><label>Turno</label><input id="vTurno" value="${esc(v.turno||'')}" placeholder="7x7, 5x2…"></div>
      <div><label>Con campamento</label><select id="vCamp"><option value="">—</option><option ${v.con_campamento===true?'selected':''}>Sí</option><option ${v.con_campamento===false?'selected':''}>No</option></select></div>
      <div><label>Fecha ingreso estimada</label><input id="vFecha" type="date" value="${(v.fecha_ingreso||'').slice(0,10)}"></div>
    </div>
    <label>Descripción breve</label><textarea id="vDesc" rows="2">${esc(v.descripcion||'')}</textarea>
    <label>Datos adicionales (renta, beneficios…)</label><textarea id="vDatos" rows="2">${esc(v.datos_adicionales||'')}</textarea>
    <label>Competencias del cargo</label>
    <div class="il-nota">Marca ⛔ si es <b>excluyente</b> (obligatoria) o déjala como no excluyente (deseable).</div>
    <div id="vComps"></div>
    <button class="il-mini" onclick="ilCompAdd()">➕ Agregar competencia</button>
    <div class="il-modal-acc">
      ${id?`<button class="il-btn d g" onclick="ilBorrarVacante('${id}')">🗑 Eliminar</button>`:'<span></span>'}
      <div><button class="il-btn g" onclick="ilCerrar()">Cancelar</button>
      <button class="il-btn" onclick="ilGuardarVacante('${id||''}')">Guardar</button></div>
    </div>`);
  ilTipoChange(); ilCompRender();
}
function ilTipoChange(){
  const t=document.getElementById('vTipo').value;
  const lbl=document.getElementById('vCodLbl'), nota=document.getElementById('vCodNota'), inp=document.getElementById('vCodigo');
  if(t==='propio'){ lbl.textContent='Código del puesto *'; nota.textContent='Contrato propio: el código del puesto es obligatorio.'; inp.placeholder='Ej: AMSA-2026-0123'; }
  else{ lbl.textContent='Código del puesto (opcional)'; nota.textContent='Empresa colaboradora: si lo dejas vacío, se genera un código automático.'; inp.placeholder='se genera solo'; }
}
function ilCompRender(){ const c=document.getElementById('vComps'); if(!c) return;
  c.innerHTML=(IL.comp||[]).map((cp,i)=>`<div class="il-comp-row">
    <input type="text" value="${esc(cp.texto||'')}" oninput="IL.comp[${i}].texto=this.value" placeholder="Ej: Licencia D, 3 años CAEX, certificación rigger…">
    <label class="il-exc"><input type="checkbox" ${cp.excluyente?'checked':''} onchange="IL.comp[${i}].excluyente=this.checked"> ⛔ excluyente</label>
    <button class="il-mini d" onclick="ilCompDel(${i})">✕</button></div>`).join('')||'<div class="il-nota">Sin competencias aún.</div>'; }
function ilCompAdd(){ IL.comp.push({texto:'',excluyente:false}); ilCompRender(); }
function ilCompDel(i){ IL.comp.splice(i,1); ilCompRender(); }

async function ilGuardarVacante(id){
  const cargo=ilVal('vCargo'); if(!cargo){ toast('El cargo es obligatorio','err'); return; }
  const tipo=document.getElementById('vTipo').value;
  let codigo=ilVal('vCodigo');
  if(tipo==='propio' && !codigo){ toast('En contrato propio el código del puesto es obligatorio','err'); return; }
  if(tipo!=='propio' && !codigo) codigo='VAC-'+Date.now().toString(36).toUpperCase().slice(-6);
  const camp=document.getElementById('vCamp').value;
  const fila={
    empresa:ilVal('vEmpresa')||null, compania:ilVal('vCompania')||null, tipo_contrato:tipo, codigo_puesto:codigo,
    cargo, n_vacantes:parseInt(ilVal('vNvac'))||1, formacion:ilVal('vForm')||null, residencia:ilVal('vResi')||null,
    turno:ilVal('vTurno')||null, con_campamento: camp===''?null:(camp==='Sí'), fecha_ingreso:ilVal('vFecha')||null,
    descripcion:ilVal('vDesc')||null, datos_adicionales:ilVal('vDatos')||null,
    competencias_json:JSON.stringify((IL.comp||[]).filter(c=>(c.texto||'').trim())),
    updated_at:ilNow(), updated_by:miNombre()
  };
  try{
    if(id){ const {error}=await SB.from('vacantes').update(fila).eq('vacante_id',id); if(error) throw error; }
    else{ fila.vacante_id=ilUid('vac'); fila.created_by=miNombre(); const {error}=await SB.from('vacantes').insert(fila); if(error) throw error; }
    ilCerrar(); await ilCargar(); ilRender(); toast('✅ Vacante guardada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function ilBorrarVacante(id){
  if(!confirm('¿Eliminar esta vacante?')) return;
  try{ const {error}=await SB.from('vacantes').update({estado_registro:'Eliminado',updated_at:ilNow()}).eq('vacante_id',id); if(error) throw error;
    ilCerrar(); await ilCargar(); ilRender(); toast('🗑 Eliminada','ok'); }catch(e){ toast('Error: '+e.message,'err'); }
}

// ── DERIVACIONES ─────────────────────────────────────────────────────────────
function ilDerivarModal(vacanteId){
  const v=IL.vacantes.find(x=>x.vacante_id===vacanteId); if(!v) return;
  ilModal(`
    <h3>Derivar a: ${esc(v.cargo)}</h3>
    <div class="il-nota">${esc(v.empresa||'')}${v.compania?' · '+esc(v.compania):''} · Código ${esc(v.codigo_puesto||'—')}</div>
    <div class="il-g2">
      <div><label>Nombre</label><input id="dNombre"></div>
      <div><label>Apellidos</label><input id="dApellidos"></div>
    </div>
    <div class="il-g2">
      <div><label>RUT</label><input id="dRut" placeholder="12.345.678-9"></div>
      <div><label>Teléfono</label><input id="dTel"></div>
    </div>
    <div class="il-g2">
      <div><label>EECC</label><input id="dEecc" value="${esc(v.empresa||'')}"></div>
      <div><label>Localidad</label><input id="dLoc" value="${esc(v.residencia||'')}"></div>
    </div>
    <label>Comentarios</label><textarea id="dComent" rows="2"></textarea>
    <div class="il-modal-acc"><span></span><div>
      <button class="il-btn g" onclick="ilCerrar()">Cancelar</button>
      <button class="il-btn" onclick="ilGuardarDerivacion('${vacanteId}')">Registrar derivación</button></div></div>`);
}
async function ilGuardarDerivacion(vacanteId){
  const v=IL.vacantes.find(x=>x.vacante_id===vacanteId);
  const nombre=ilVal('dNombre'), rut=ilVal('dRut');
  if(!nombre && !rut){ toast('Indica al menos nombre o RUT','err'); return; }
  const fila={ derivacion_id:ilUid('der'), vacante_id:vacanteId, cargo_txt:v?v.cargo:'',
    nombre, apellidos:ilVal('dApellidos')||null, rut:rut||null, telefono:ilVal('dTel')||null,
    eecc:ilVal('dEecc')||null, localidad:ilVal('dLoc')||null, comentarios:ilVal('dComent')||null,
    estado:'registrada', fecha_derivacion:new Date().toISOString().slice(0,10), derivado_por:miNombre(),
    created_by:miNombre(), created_at:ilNow(), updated_at:ilNow() };
  try{ const {error}=await SB.from('derivaciones').insert(fila); if(error) throw error;
    ilCerrar(); await ilCargar(); IL.vista='derivaciones'; ilRender(); toast('✅ Derivación registrada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
function ilDerivHTML(){
  const d=IL.derivaciones;
  const badge=s=>`<select class="il-est ${s}" onchange="ilCambiarEstado(this)">${['registrada','efectiva','descartada'].map(o=>`<option ${o===s?'selected':''}>${o}</option>`).join('')}</select>`;
  return `<div class="il-sub"><div class="il-sub-t">Seguimiento de derivaciones</div>
    <button class="il-btn g" onclick="ilExportDerivaciones()">⬇ Excel</button></div>
    ${!d.length?`<div class="il-vacio">Sin derivaciones. Usa «Derivar» en una vacante.</div>`
    :`<div class="il-scroll"><table class="il-tabla"><thead><tr><th>Fecha</th><th>Vacante</th><th>Nombre</th><th>RUT</th><th>Teléfono</th><th>EECC</th><th>Estado</th><th>Seguimiento EECC</th><th></th></tr></thead>
      <tbody>${d.map(r=>`<tr data-id="${r.derivacion_id}">
        <td>${esc((r.fecha_derivacion||'').slice(0,10))}</td>
        <td>${esc(r.cargo_txt||'')}</td>
        <td>${esc([r.nombre,r.apellidos].filter(Boolean).join(' '))}</td>
        <td>${esc(r.rut||'')}</td><td>${esc(r.telefono||'')}</td><td>${esc(r.eecc||'')}</td>
        <td>${badge(r.estado||'registrada')}</td>
        <td><input class="il-seg" value="${esc(r.seguimiento_eecc||'')}" onchange="ilGuardarSeguimiento(this)" placeholder="respuesta EECC…"></td>
        <td><button class="il-mini d" onclick="ilBorrarDerivacion('${r.derivacion_id}')">🗑</button></td>
      </tr>`).join('')}</tbody></table></div>`}`;
}
function _ilRowId(el){ const tr=el.closest('tr'); return tr&&tr.getAttribute('data-id'); }
async function ilCambiarEstado(sel){
  const id=_ilRowId(sel); if(!id) return;
  try{ await SB.from('derivaciones').update({estado:sel.value,updated_at:ilNow(),updated_by:miNombre()}).eq('derivacion_id',id);
    const d=IL.derivaciones.find(x=>x.derivacion_id===id); if(d) d.estado=sel.value; sel.className='il-est '+sel.value;
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function ilGuardarSeguimiento(inp){
  const id=_ilRowId(inp); if(!id) return;
  try{ await SB.from('derivaciones').update({seguimiento_eecc:inp.value,updated_at:ilNow(),updated_by:miNombre()}).eq('derivacion_id',id);
    const d=IL.derivaciones.find(x=>x.derivacion_id===id); if(d) d.seguimiento_eecc=inp.value; toast('Guardado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function ilBorrarDerivacion(id){
  if(!confirm('¿Eliminar esta derivación?')) return;
  try{ await SB.from('derivaciones').update({estado_registro:'Eliminado',updated_at:ilNow()}).eq('derivacion_id',id);
    await ilCargar(); ilRender(); }catch(e){ toast('Error: '+e.message,'err'); }
}

// ── EXPORTACIÓN A EXCEL ──────────────────────────────────────────────────────
function ilExportVacantes(){
  const aoa=[['Empresa','Compañía','Tipo contrato','Código','Cargo','Vacantes','Formación','Requisitos/Competencias','Turno','Con campamento','Fecha ingreso','Residencia','Datos adicionales']];
  IL.vacantes.forEach(v=>aoa.push([v.empresa||'',v.compania||'',v.tipo_contrato||'',v.codigo_puesto||'',v.cargo||'',v.n_vacantes||'',v.formacion||'',
    (v.competencias||[]).map(c=>(c.excluyente?'[EXCL] ':'')+c.texto).join(' · '),v.turno||'',v.con_campamento===true?'Sí':v.con_campamento===false?'No':'',
    (v.fecha_ingreso||'').slice(0,10),v.residencia||'',v.datos_adicionales||'']));
  ilDescargar(aoa,'Vacantes','intermediacion_vacantes');
}
function ilExportDerivaciones(){
  const aoa=[['Fecha Derivación','EECC','Localidad','Vacante derivada','Nombre','Apellidos','RUT','Número','Estado','Seguimiento EECC','Comentarios']];
  IL.derivaciones.forEach(d=>aoa.push([(d.fecha_derivacion||'').slice(0,10),d.eecc||'',d.localidad||'',d.cargo_txt||'',d.nombre||'',d.apellidos||'',d.rut||'',d.telefono||'',d.estado||'',d.seguimiento_eecc||'',d.comentarios||'']));
  ilDescargar(aoa,'Derivaciones','intermediacion_derivaciones');
}
function ilDescargar(aoa,hoja,nombre){
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(aoa),hoja);
  XLSX.writeFile(wb,nombre+'_'+new Date().toISOString().slice(0,10)+'.xlsx');
}

// ── Link para armar CV (apresto) ─────────────────────────────────────────────
// Genera un link personal por token (no expone el RUT en la URL, Regla 5) para
// que la persona arme/edite su CV en armar-cv.html.
function ilLinkCV(){
  ilModal(`<h3>🔗 Link para armar CV</h3>
    <div class="il-nota">Genera un link personal para que la persona arme o edite su CV (apresto). Va por token; no expone el RUT.</div>
    <div class="il-g2"><div><label>RUT</label><input id="lkRut" placeholder="12.345.678-9"></div>
      <div><label>Nombre (opcional)</label><input id="lkNom"></div></div>
    <div id="lkOut"></div>
    <div class="il-modal-acc"><span></span><div>
      <button class="il-btn g" onclick="ilCerrar()">Cerrar</button>
      <button class="il-btn" onclick="ilGenerarLink()">Generar link</button></div></div>`);
}
async function ilGenerarLink(){
  const rut=ilVal('lkRut'); if(!rut){ toast('Escribe el RUT','err'); return; }
  try{
    const {data,error}=await SB.from('cv_links').insert({rut, nombre:ilVal('lkNom')||null, created_by:miNombre()}).select('token').single();
    if(error) throw error;
    const url=location.origin+location.pathname.replace(/[^/]*$/,'')+'armar-cv.html?t='+data.token;
    document.getElementById('lkOut').innerHTML=`<div class="il-nota" style="margin-top:12px">Link generado — cópialo y compártelo:</div>
      <div style="display:flex;gap:8px"><input id="lkUrl" readonly value="${esc(url)}" style="flex:1">
      <button class="il-btn" onclick="ilCopiarLink()">Copiar</button></div>
      <div class="il-nota"><a href="${esc(url)}" target="_blank" rel="noopener">Abrir en una pestaña nueva ↗</a></div>`;
  }catch(e){ toast('Error al generar link: '+e.message,'err'); }
}
function ilCopiarLink(){ const i=document.getElementById('lkUrl'); if(!i) return; i.select();
  try{ navigator.clipboard.writeText(i.value); }catch(e){ try{document.execCommand('copy');}catch(_){} } toast('🔗 Link copiado','ok'); }
