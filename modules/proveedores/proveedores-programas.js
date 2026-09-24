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
function _pgv(id){ const e=document.getElementById(id); return e?e.value:''; }
function _pgset(id,v){ const e=document.getElementById(id); if(e) e.value=v||''; }
function abrirNuevoPrograma(){
  PROG_EDIT_ID=null;
  ['progCatTitulo','progCatContexto','progCatIni','progCatFin',
   'progCatEjecutor','progCatEjecCont','progCatRepo','progCatDatos'].forEach(x=>_pgset(x,''));
  document.getElementById('progCatModalTitle').textContent='Nuevo programa / iniciativa';
  document.getElementById('progCatDelBtn').style.display='none';
  document.getElementById('progCatModal').style.display='flex';
}
function editarProgramaCat(id){
  const p=PROGRAMAS_CAT.find(x=>x.programa_cat_id===id); if(!p) return;
  PROG_EDIT_ID=id;
  _pgset('progCatTitulo',p.titulo); _pgset('progCatContexto',p.contexto);
  _pgset('progCatIni',p.fecha_inicio); _pgset('progCatFin',p.fecha_fin);
  _pgset('progCatEjecutor',p.ejecutor); _pgset('progCatEjecCont',p.ejecutor_contacto);
  _pgset('progCatRepo',p.repo_url); _pgset('progCatDatos',p.datos_url);
  document.getElementById('progCatModalTitle').textContent='Editar programa';
  document.getElementById('progCatDelBtn').style.display='inline-block';
  document.getElementById('progCatModal').style.display='flex';
}
function cerrarProgCat(){ document.getElementById('progCatModal').style.display='none'; }

async function guardarProgramaCat(){
  const titulo=_pgv('progCatTitulo').trim();
  const contexto=_pgv('progCatContexto').trim();
  const ini=_pgv('progCatIni');
  const fin=_pgv('progCatFin');
  const ejecutor=_pgv('progCatEjecutor').trim();
  const ejecutor_contacto=_pgv('progCatEjecCont').trim();
  const repo_url=_pgv('progCatRepo').trim();
  const datos_url=_pgv('progCatDatos').trim();
  if(!titulo){ showToast('El título es obligatorio','err'); return; }
  if(!contexto){ showToast('Describe el contexto del programa','err'); return; }
  if(!ini){ showToast('Indica la fecha de inicio','err'); return; }
  if(!fin){ showToast('Indica la fecha de término','err'); return; }
  if(fin<ini){ showToast('La fecha de término no puede ser anterior al inicio','err'); return; }
  if(datos_url && !/^https?:\/\//i.test(datos_url)){ showToast('El JSON de datos debe ser una URL http(s)','err'); return; }
  const id=PROG_EDIT_ID||('progcat_'+Date.now().toString(36));
  try{
    const {error}=await SUPA.client.from('programas_catalogo').upsert({
      programa_cat_id:id, titulo, contexto, fecha_inicio:ini, fecha_fin:fin,
      ejecutor:ejecutor||null, ejecutor_contacto:ejecutor_contacto||null,
      repo_url:repo_url||null, datos_url:datos_url||null,
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
  return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-bottom:18px">'+
    PROGRAMAS_CAT.map(p=>{
      const nAsign=Object.values(DB.programas||{}).flat().filter(x=>x.programa_cat_id===p.programa_cat_id||x.nombre===p.titulo).length;
      const tieneDash = !!(p.datos_url || p.repo_url);
      return `<div style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:14px;border-left:4px solid #5b4fcf;cursor:pointer;transition:box-shadow .15s"
           onmouseover="this.style.boxShadow='0 6px 18px rgba(91,79,207,.18)'" onmouseout="this.style.boxShadow='none'"
           onclick="abrirProgramaDetalle('${p.programa_cat_id}')">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.05rem;color:#5b4fcf">${esc(p.titulo)}</div>
          ${tieneDash?'<span style="font-size:.66rem;background:#e7f4ec;color:#1e7e34;border-radius:5px;padding:2px 7px;font-weight:700;white-space:nowrap">📊 Dashboard</span>':''}
        </div>
        ${p.ejecutor?`<div style="font-size:.74rem;color:#5b4fcf;font-weight:700;margin-top:3px">🏢 Ejecuta: ${esc(p.ejecutor)}</div>`:''}
        <div style="font-size:.8rem;color:var(--text-muted);margin:5px 0;line-height:1.5">${esc((p.contexto||'').slice(0,110))}${(p.contexto||'').length>110?'…':''}</div>
        <div style="font-size:.74rem;color:var(--text-muted)">📅 ${esc(p.fecha_inicio||'?')} → ${esc(p.fecha_fin||'?')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:9px">
          <span style="font-size:.74rem;background:#ede9fb;color:#5b4fcf;border-radius:5px;padding:2px 9px;font-weight:700">${nAsign} proveedor${nAsign===1?'':'es'}</span>
          <div style="display:flex;gap:6px">
            <button class="mini-btn" style="width:auto;padding:4px 10px" onclick="event.stopPropagation();editarProgramaCat('${p.programa_cat_id}')">✏ Editar</button>
            <button class="mini-btn" style="width:auto;padding:4px 10px;background:#5b4fcf;color:#fff" onclick="event.stopPropagation();abrirProgramaDetalle('${p.programa_cat_id}')">Abrir →</button>
          </div>
        </div>
      </div>`;
    }).join('')+'</div>';
}

// ═══════════════════════════════════════════════════════════════════════════
// DETALLE DE UN PROGRAMA — participantes + dashboard desde el repo del ejecutor
// Los datos viven en la tabla programa_participantes (sincronizados del informe
// del ejecutor). No se exponen fuera de Supabase (Regla 5). El repo queda solo
// como enlace. Charts con Chart.js (ya cargado en index.html).
// ═══════════════════════════════════════════════════════════════════════════
let PROG_DET_ID=null, PROG_DET_PARTS=[], PROG_DET_CHARTS=[];
const PROG_LOC_FILTRO={loc:'',estado:''};

async function abrirProgramaDetalle(id){
  PROG_DET_ID=id; PROG_LOC_FILTRO.loc=''; PROG_LOC_FILTRO.estado='';
  const ov=document.getElementById('progDetalleOverlay');
  document.getElementById('progDetalleBody').innerHTML='<div style="padding:40px;text-align:center;color:#5b4fcf">Cargando programa…</div>';
  ov.style.display='block';
  await cargarParticipantesPrograma(id);
  renderProgramaDetalle();
}
function cerrarProgramaDetalle(){
  PROG_DET_CHARTS.forEach(c=>{try{c.destroy();}catch(e){}}); PROG_DET_CHARTS=[];
  document.getElementById('progDetalleOverlay').style.display='none';
  PROG_DET_ID=null;
}
async function cargarParticipantesPrograma(id){
  PROG_DET_PARTS=[];
  try{
    const {data,error}=await SUPA.client.from('programa_participantes')
      .select('*').eq('programa_cat_id',id).neq('estado_registro','Eliminado')
      .order('avance_plataforma',{ascending:false});
    if(error) throw error;
    PROG_DET_PARTS=data||[];
  }catch(e){ console.warn('participantes',e); showToast('No se pudieron cargar los participantes','err'); }
}

// Sincroniza desde el JSON estándar publicado por el ejecutor (datos_url).
async function sincronizarPrograma(id){
  const p=PROGRAMAS_CAT.find(x=>x.programa_cat_id===id); if(!p) return;
  if(!p.datos_url){ showToast('Este programa no tiene URL de datos (JSON) configurada. Edítalo para agregarla.','err'); return; }
  showToast('Sincronizando desde el informe del ejecutor…');
  let doc;
  try{
    const r=await fetch(p.datos_url,{cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    doc=await r.json();
  }catch(e){ showToast('No se pudo leer el JSON del repo: '+e.message+' (¿está publicado y es público?)','err'); return; }
  const parts=(doc&&doc.participantes)||[];
  if(!parts.length){ showToast('El JSON no trae participantes. Revisa el formato (ver docs).','err'); return; }
  const canon=r=>String(r||'').toUpperCase().replace(/[^0-9K]/g,'');
  const filas=parts.filter(x=>x.rut).map(x=>{
    const emps=Array.isArray(x.empresas)?x.empresas:(x.empresa_principal?[x.empresa_principal]:[]);
    const av=+x.avance_plataforma||0;
    return {
      pp_id:'pp_'+id+'_'+canon(x.rut), programa_cat_id:id, rut:x.rut,
      representante:x.representante||x.nombre||'', empresa_principal:x.empresa_principal||emps[0]||'',
      empresas:emps, sucursales:emps.length||1, localidad:x.localidad||'',
      avance_plataforma:av, categoria:x.categoria||'',
      estado_plataforma:x.estado_plataforma||(av>=100?'completo':av>0?'en_curso':'sin_conexion'),
      metricas:x.metricas||{categoria:x.categoria||''}, origen:'repo',
      estado_registro:'Activo', updated_by:miNombre(), updated_at:new Date().toISOString()
    };
  });
  try{
    const {error}=await SUPA.client.from('programa_participantes').upsert(filas,{onConflict:'programa_cat_id,rut'});
    if(error) throw error;
    await SUPA.client.from('programas_catalogo').update({ultima_sync:new Date().toISOString(),updated_by:miNombre()}).eq('programa_cat_id',id);
    await registrarLog('programa_catalogo',id,'sincronizar','Sincronizó '+filas.length+' participante(s) desde el repo');
    p.ultima_sync=new Date().toISOString();
    await cargarParticipantesPrograma(id);
    renderProgramaDetalle();
    showToast('✅ Sincronizados '+filas.length+' participantes','success');
  }catch(e){ showToast('Error al guardar: '+e.message,'err'); }
}

// Crea en el directorio los participantes que aún no existen como proveedor.
// Quedan marcados con origen='programa:<título>' para el filtro del directorio.
// Nota: el RUT del informe es el de la PERSONA representante (no el de la empresa).
async function crearProveedoresDePrograma(id){
  const p=PROGRAMAS_CAT.find(x=>x.programa_cat_id===id); if(!p) return;
  if(!PROG_DET_PARTS.length){ showToast('Primero sincroniza los participantes','err'); return; }
  const canon=r=>String(r||'').toUpperCase().replace(/[^0-9K]/g,'');
  const existentes=new Set((typeof PROVEEDORES!=='undefined'?PROVEEDORES:[]).map(x=>canon(x.rut_empresa)).filter(Boolean));
  const nuevos=PROG_DET_PARTS.filter(x=>x.rut && !x.proveedor_id && !existentes.has(canon(x.rut)));
  const yaExisten=PROG_DET_PARTS.filter(x=>x.rut && !x.proveedor_id && existentes.has(canon(x.rut))).length;
  if(!nuevos.length){ showToast('No hay participantes nuevos por crear'+(yaExisten?` (${yaExisten} ya existen en el directorio por su RUT)`:'')+'.','success'); return; }
  if(!confirm(`Se crearán ${nuevos.length} proveedor(es) en el directorio, marcados como creados por el programa «${p.titulo}».\n\nⓘ El RUT del informe es el de la persona representante. Podrás aislarlos con el filtro «🧩 Creados por subsistema».${yaExisten?`\n\n(${yaExisten} participantes ya existen en el directorio y no se duplicarán.)`:''}\n\n¿Continuar?`)) return;
  const now=new Date().toISOString();
  const rows=nuevos.map(x=>({
    proveedor_id:'re_prog_'+id+'_'+canon(x.rut),
    rut_empresa:x.rut||'', razon_social:x.empresa_principal||x.representante||'',
    nombre_fantasia:x.empresa_principal||'', localidad:x.localidad||'',
    descripcion_general:'Representante: '+(x.representante||'—')+' · Programa: '+(p.titulo||'')+(x.sucursales>1?' · '+x.sucursales+' sucursales: '+(Array.isArray(x.empresas)?x.empresas.join(', '):''):''),
    multi_verificado:false, origen:'programa:'+(p.titulo||''), origen_ref:id,
    estado_registro:'Activo', created_by:miNombre(), updated_by:miNombre(), created_at:now, updated_at:now
  }));
  try{
    const {error}=await SUPA.client.from('proveedores').upsert(rows,{onConflict:'proveedor_id'});
    if(error) throw error;
    for(const x of nuevos){
      const pid='re_prog_'+id+'_'+canon(x.rut);
      x.proveedor_id=pid;
      await SUPA.client.from('programa_participantes').update({proveedor_id:pid,updated_at:now}).eq('pp_id',x.pp_id);
    }
    await registrarLog('programa_catalogo',id,'crear_proveedores','Creó '+rows.length+' proveedor(es) en el directorio desde el programa "'+p.titulo+'"');
    renderProgramaDetalle();
    showToast('✅ '+rows.length+' proveedor(es) creados. Recarga el directorio y usa el filtro «🧩 Creados por subsistema».','success');
  }catch(e){ showToast('Error al crear proveedores: '+e.message,'err'); }
}

function _pgFmtDia(iso){ if(!iso) return '—'; const d=new Date(iso); return isNaN(d)?'—':d.toLocaleDateString('es-CL'); }
function renderProgramaDetalle(){
  const p=PROGRAMAS_CAT.find(x=>x.programa_cat_id===PROG_DET_ID); if(!p) return;
  const body=document.getElementById('progDetalleBody'); if(!body) return;
  // filtro
  let parts=PROG_DET_PARTS.slice();
  if(PROG_LOC_FILTRO.loc) parts=parts.filter(x=>x.localidad===PROG_LOC_FILTRO.loc);
  if(PROG_LOC_FILTRO.estado) parts=parts.filter(x=>x.estado_plataforma===PROG_LOC_FILTRO.estado);
  const n=parts.length;
  const comp=parts.filter(x=>x.estado_plataforma==='completo').length;
  const curso=parts.filter(x=>x.estado_plataforma==='en_curso').length;
  const sinc=parts.filter(x=>x.estado_plataforma==='sin_conexion').length;
  const prom = n? Math.round(parts.reduce((a,x)=>a+(+x.avance_plataforma||0),0)/n*10)/10 : 0;
  const nEmp = parts.reduce((a,x)=>a+(x.sucursales||1),0);
  const locs=[...new Set(PROG_DET_PARTS.map(x=>x.localidad).filter(Boolean))].sort();

  body.innerHTML=`
    <div style="background:linear-gradient(135deg,#5b4fcf,#4338ca);color:#fff;border-radius:16px 16px 0 0;padding:20px 24px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:800;text-transform:uppercase;line-height:1.1">${esc(p.titulo)}</div>
          <div style="font-size:.86rem;opacity:.92;margin-top:4px">${p.ejecutor?'🏢 Ejecuta: <b>'+esc(p.ejecutor)+'</b>':'Sin ejecutor asignado'}${p.ejecutor_contacto?' · '+esc(p.ejecutor_contacto):''}</div>
          <div style="font-size:.8rem;opacity:.85;margin-top:2px">📅 ${esc(p.fecha_inicio||'?')} → ${esc(p.fecha_fin||'?')} · Última sincronización: ${_pgFmtDia(p.ultima_sync)}</div>
        </div>
        <button onclick="cerrarProgramaDetalle()" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:1.2rem;border-radius:9px;width:38px;height:38px;cursor:pointer">✕</button>
      </div>
      <div style="font-size:.82rem;opacity:.9;margin-top:10px;max-width:70ch;line-height:1.5">${esc(p.contexto||'')}</div>
      <div style="display:flex;gap:9px;margin-top:14px;flex-wrap:wrap">
        ${p.repo_url?`<a href="${esc(p.repo_url)}" target="_blank" rel="noopener" style="background:#fff;color:#5b4fcf;text-decoration:none;border-radius:8px;padding:7px 13px;font-weight:700;font-size:.82rem">📄 Ver informe ↗</a>`:''}
        <button onclick="sincronizarPrograma('${p.programa_cat_id}')" style="background:#F2A900;color:#1c2632;border:none;border-radius:8px;padding:7px 13px;font-weight:800;font-size:.82rem;cursor:pointer">🔄 Sincronizar desde repo</button>
        ${PROG_DET_PARTS.length?`<button onclick="crearProveedoresDePrograma('${p.programa_cat_id}')" style="background:rgba(255,255,255,.16);color:#fff;border:none;border-radius:8px;padding:7px 13px;font-weight:700;font-size:.82rem;cursor:pointer" title="Crea en el directorio los participantes que aún no existen (quedan marcados como creados por subsistema)">➕ Crear faltantes en directorio</button>`:''}
        <button onclick="editarProgramaCat('${p.programa_cat_id}')" style="background:rgba(255,255,255,.16);color:#fff;border:none;border-radius:8px;padding:7px 13px;font-weight:700;font-size:.82rem;cursor:pointer">✏ Editar programa</button>
      </div>
    </div>

    <div style="padding:20px 24px">
      ${!PROG_DET_PARTS.length?`<div style="text-align:center;padding:40px 16px;color:var(--text-muted)">
        <div style="font-size:2rem">📊</div>
        <div style="font-weight:700;margin:8px 0;color:var(--text)">Aún no hay participantes sincronizados</div>
        <div style="font-size:.86rem;max-width:52ch;margin:0 auto">Configura la <b>URL del JSON</b> del informe del ejecutor (botón «Editar programa») y pulsa <b>«Sincronizar desde repo»</b>. Formato estándar en <code>docs/modulos/programas-repo.md</code>.</div>
      </div>`
      : `
      <!-- KPIs -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:16px">
        <div style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:12px;text-align:center"><div style="font-size:1.5rem;font-weight:800;color:#5b4fcf">${n}</div><div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase">Participantes</div></div>
        <div style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:12px;text-align:center"><div style="font-size:1.5rem;font-weight:800;color:#1c2632">${nEmp}</div><div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase">Empresas / sucursales</div></div>
        <div style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:12px;text-align:center"><div style="font-size:1.5rem;font-weight:800;color:#1e7e34">${comp}</div><div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase">Completaron</div></div>
        <div style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:12px;text-align:center"><div style="font-size:1.5rem;font-weight:800;color:#b8860b">${curso}</div><div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase">En curso</div></div>
        <div style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:12px;text-align:center"><div style="font-size:1.5rem;font-weight:800;color:#c0311b">${sinc}</div><div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase">Sin conexión</div></div>
        <div style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:12px;text-align:center"><div style="font-size:1.5rem;font-weight:800;color:#5b4fcf">${prom}%</div><div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase">Avance promedio</div></div>
      </div>

      <!-- Filtros -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;align-items:center">
        <select onchange="PROG_LOC_FILTRO.loc=this.value;renderProgramaDetalle()" style="padding:7px 10px;border:1.5px solid var(--border);border-radius:8px">
          <option value="">Todas las localidades</option>
          ${locs.map(l=>`<option value="${esc(l)}" ${PROG_LOC_FILTRO.loc===l?'selected':''}>${esc(l)}</option>`).join('')}
        </select>
        <select onchange="PROG_LOC_FILTRO.estado=this.value;renderProgramaDetalle()" style="padding:7px 10px;border:1.5px solid var(--border);border-radius:8px">
          <option value="">Todos los estados</option>
          <option value="completo" ${PROG_LOC_FILTRO.estado==='completo'?'selected':''}>Completaron</option>
          <option value="en_curso" ${PROG_LOC_FILTRO.estado==='en_curso'?'selected':''}>En curso</option>
          <option value="sin_conexion" ${PROG_LOC_FILTRO.estado==='sin_conexion'?'selected':''}>Sin conexión</option>
        </select>
        <span style="font-size:.78rem;color:var(--text-muted)">${n} de ${PROG_DET_PARTS.length} participantes</span>
      </div>

      <!-- Gráficos -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
        <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px"><div style="font-weight:700;font-size:.82rem;color:#5b4fcf;margin-bottom:8px">Estado en plataforma</div><div style="height:220px"><canvas id="progChartEstado"></canvas></div></div>
        <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px"><div style="font-weight:700;font-size:.82rem;color:#5b4fcf;margin-bottom:8px">Participantes por localidad</div><div style="height:220px"><canvas id="progChartLoc"></canvas></div></div>
      </div>

      <!-- Tabla participantes -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:12px;overflow:hidden">
        <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.82rem;min-width:640px">
          <thead><tr style="background:#f2f0fb;color:#5b4fcf;text-align:left">
            <th style="padding:9px 12px">Representante</th><th style="padding:9px 12px">RUT</th>
            <th style="padding:9px 12px">Empresa(s) / sucursales</th><th style="padding:9px 12px">Localidad</th>
            <th style="padding:9px 12px">Avance</th><th style="padding:9px 12px">Estado</th>
          </tr></thead>
          <tbody>
            ${parts.map(x=>{
              const emps=Array.isArray(x.empresas)?x.empresas:[];
              const badge=x.estado_plataforma==='completo'?'<span style="background:#e7f4ec;color:#1e7e34;border-radius:5px;padding:1px 8px;font-weight:700">Completo</span>'
                :x.estado_plataforma==='en_curso'?'<span style="background:#fbf3dd;color:#b8860b;border-radius:5px;padding:1px 8px;font-weight:700">En curso</span>'
                :'<span style="background:#fbe9e6;color:#c0311b;border-radius:5px;padding:1px 8px;font-weight:700">Sin conexión</span>';
              const av=+x.avance_plataforma||0;
              return `<tr style="border-top:1px solid #eef2f3">
                <td style="padding:9px 12px;font-weight:600">${esc(x.representante||'—')}</td>
                <td style="padding:9px 12px;color:var(--text-muted)">${esc(x.rut||'—')}</td>
                <td style="padding:9px 12px">${esc(emps.join(' · ')||x.empresa_principal||'—')}${x.sucursales>1?` <span style="font-size:.7rem;background:#ede9fb;color:#5b4fcf;border-radius:4px;padding:1px 6px;font-weight:700">${x.sucursales} sucursales</span>`:''}</td>
                <td style="padding:9px 12px">${esc(x.localidad||'—')}</td>
                <td style="padding:9px 12px"><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;min-width:44px;background:#eef2f3;border-radius:4px;height:7px;overflow:hidden"><div style="width:${av}%;height:7px;background:${av>=100?'#1e7e34':av>0?'#b8860b':'#c0311b'}"></div></div><span style="font-variant-numeric:tabular-nums">${av}%</span></div></td>
                <td style="padding:9px 12px">${badge}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        </div>
      </div>
      `}
    </div>`;

  if(PROG_DET_PARTS.length){
    PROG_DET_CHARTS.forEach(c=>{try{c.destroy();}catch(e){}}); PROG_DET_CHARTS=[];
    const porLoc={}; parts.forEach(x=>{const l=x.localidad||'Sin localidad';porLoc[l]=(porLoc[l]||0)+1;});
    const ceEl=document.getElementById('progChartEstado');
    const clEl=document.getElementById('progChartLoc');
    if(ceEl&&window.Chart) PROG_DET_CHARTS.push(new Chart(ceEl,{type:'doughnut',
      data:{labels:['Completaron','En curso','Sin conexión'],datasets:[{data:[comp,curso,sinc],backgroundColor:['#1e7e34','#F2A900','#c0311b']}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}}));
    if(clEl&&window.Chart) PROG_DET_CHARTS.push(new Chart(clEl,{type:'bar',
      data:{labels:Object.keys(porLoc),datasets:[{label:'Participantes',data:Object.values(porLoc),backgroundColor:'#5b4fcf'}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}}));
  }
}


