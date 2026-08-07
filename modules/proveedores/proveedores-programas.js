// ═══════════════════════════════════════════════════════════════════════════
// proveedores-programas.js — Catálogo de Programas / Iniciativas
// Sistema AM · Antofagasta Minerals
//
// P-8 (docs/PENDIENTES.md), primer corte: proveedores.js tenía 6.434 líneas.
// Esta sección se movió tal cual, sin reescribir. Depende de globals
// declaradas en proveedores.js (SUPA, showToast, registrarLog, miNombre,
// esc, DB, PROGRAMAS_LIST, renderProgramasDash) — por eso se carga DESPUÉS
// de proveedores.js en index.html, como <script src> clásico. Nunca
// type="module": los onclick del HTML necesitan que estas funciones sean
// globales. Ver CLAUDE.md §6.
// ═══════════════════════════════════════════════════════════════════════════

// Crear programas (título + contexto + fechas) y luego asignarlos a proveedores.
let PROGRAMAS_CAT = []; // [{programa_cat_id, titulo, contexto, fecha_inicio, fecha_fin}]

async function cargarProgramasCatalogo(){
  if(!SUPA.client || !SUPA.session) return;
  try{
    const {data}=await SUPA.client.from('programas_catalogo').select('*').neq('estado_registro','Eliminado').order('titulo');
    PROGRAMAS_CAT=data||[];
    // sincronizar PROGRAMAS_LIST (nombres) para compatibilidad
    PROGRAMAS_LIST=PROGRAMAS_CAT.map(p=>p.titulo);
  }catch(e){ console.warn('cat programas',e); }
}

// ── Modal crear/editar programa ──
let PROG_EDIT_ID=null;
function abrirNuevoPrograma(){
  PROG_EDIT_ID=null;
  document.getElementById('progCatTitulo').value='';
  document.getElementById('progCatContexto').value='';
  document.getElementById('progCatIni').value='';
  document.getElementById('progCatFin').value='';
  document.getElementById('progCatModalTitle').textContent='Nuevo programa / iniciativa';
  document.getElementById('progCatDelBtn').style.display='none';
  document.getElementById('progCatModal').style.display='flex';
}
function editarProgramaCat(id){
  const p=PROGRAMAS_CAT.find(x=>x.programa_cat_id===id); if(!p) return;
  PROG_EDIT_ID=id;
  document.getElementById('progCatTitulo').value=p.titulo||'';
  document.getElementById('progCatContexto').value=p.contexto||'';
  document.getElementById('progCatIni').value=p.fecha_inicio||'';
  document.getElementById('progCatFin').value=p.fecha_fin||'';
  document.getElementById('progCatModalTitle').textContent='Editar programa';
  document.getElementById('progCatDelBtn').style.display='inline-block';
  document.getElementById('progCatModal').style.display='flex';
}
function cerrarProgCat(){ document.getElementById('progCatModal').style.display='none'; }

async function guardarProgramaCat(){
  const titulo=document.getElementById('progCatTitulo').value.trim();
  const contexto=document.getElementById('progCatContexto').value.trim();
  const ini=document.getElementById('progCatIni').value;
  const fin=document.getElementById('progCatFin').value;
  if(!titulo){ showToast('El título es obligatorio','err'); return; }
  if(!contexto){ showToast('Describe el contexto del programa','err'); return; }
  if(!ini){ showToast('Indica la fecha de inicio','err'); return; }
  if(!fin){ showToast('Indica la fecha de término','err'); return; }
  if(fin<ini){ showToast('La fecha de término no puede ser anterior al inicio','err'); return; }
  const id=PROG_EDIT_ID||('progcat_'+Date.now().toString(36));
  try{
    const {error}=await SUPA.client.from('programas_catalogo').upsert({
      programa_cat_id:id, titulo, contexto, fecha_inicio:ini, fecha_fin:fin,
      estado_registro:'Activo',
      created_by: PROG_EDIT_ID?undefined:miNombre(), updated_by:miNombre(), updated_at:new Date().toISOString()
    },{onConflict:'programa_cat_id'});
    if(error) throw error;
    await registrarLog('programa_catalogo', id, PROG_EDIT_ID?'editar':'crear', (PROG_EDIT_ID?'Editó':'Creó')+' programa "'+titulo+'"');
    window._progCatTried=true; await cargarProgramasCatalogo();
    cerrarProgCat();
    renderProgramasDash();
    showToast('✅ Programa guardado','success');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

async function eliminarProgramaCat(){
  if(!PROG_EDIT_ID) return;
  if(!confirm('¿Eliminar este programa del catálogo? (No quita las asignaciones ya hechas a proveedores)')) return;
  try{
    await SUPA.client.from('programas_catalogo').update({estado_registro:'Eliminado'}).eq('programa_cat_id',PROG_EDIT_ID);
    await registrarLog('programa_catalogo',PROG_EDIT_ID,'eliminar','Eliminó programa del catálogo');
    await cargarProgramasCatalogo();
    cerrarProgCat(); renderProgramasDash();
    showToast('🗑 Programa eliminado','success');
  }catch(e){ showToast('Error: '+e.message,'err'); }
}

// Tarjetas del catálogo (se muestran arriba del dashboard de programas)
function catalogoProgramasHTML(){
  if(!PROGRAMAS_CAT.length){
    return '<div class="kb-empty" style="margin-bottom:14px">Aún no hay programas. Crea el primero con "➕ Nuevo programa".</div>';
  }
  return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-bottom:18px">'+
    PROGRAMAS_CAT.map(p=>{
      const nAsign=Object.values(DB.programas||{}).flat().filter(x=>x.programa_cat_id===p.programa_cat_id||x.nombre===p.titulo).length;
      return `<div style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:14px;border-left:4px solid #5b4fcf">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.05rem;color:#5b4fcf">${esc(p.titulo)}</div>
        <div style="font-size:.8rem;color:var(--text-muted);margin:5px 0;line-height:1.5">${esc((p.contexto||'').slice(0,120))}${(p.contexto||'').length>120?'…':''}</div>
        <div style="font-size:.74rem;color:var(--text-muted)">📅 ${esc(p.fecha_inicio||'?')} → ${esc(p.fecha_fin||'?')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:9px">
          <span style="font-size:.74rem;background:#ede9fb;color:#5b4fcf;border-radius:5px;padding:2px 9px;font-weight:700">${nAsign} proveedor${nAsign===1?'':'es'}</span>
          <button class="mini-btn" style="width:auto;padding:4px 10px" onclick="editarProgramaCat('${p.programa_cat_id}')">✏ Editar</button>
        </div>
      </div>`;
    }).join('')+'</div>';
}


