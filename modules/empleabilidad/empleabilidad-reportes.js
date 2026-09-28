// ═══════════════════════════════════════════════════════════════════════════
// empleabilidad-reportes.js — Reportes de la Oficina Móvil (atenciones)
// Sistema AM · Antofagasta Minerals
//
// Ventana en Empleabilidad que lista TODAS las atenciones del móvil con sus datos
// completos por columna (RUT, nombre, apellido, comuna, género, antecedentes,
// servicios y cada pregunta del cuestionario), más fecha, ejecutivo y ubicación
// (nombre + lat/long). Se puede VER en pantalla, apagar columnas, filtrar por
// fecha y por ubicación (mapa u operativo), y EXPORTAR a Excel con encabezado
// agrupado (nombre del cuestionario sobre sus preguntas).
//
// Reutiliza globales de Empleabilidad (SB, esc, toast) y shared/js/mapa.js.
// <script src> clásico, nunca type="module" (CLAUDE.md §6). Prefijo rep/REP.
// ═══════════════════════════════════════════════════════════════════════════

let REP = { ats:[], ops:[], opById:{}, cvById:{}, cargado:false, mapa:null, base:null,
            desde:'', hasta:'', opFiltro:'', cols:null };

// Preguntas del cuestionario complementario (espejo de CUEST en movil.js —
// mantener en sync; la reestructuración de preguntas unificará esto a futuro).
const REP_CUEST=[
  {k:'q_postulacion',t:'Si postuló a vacantes, ¿interna o externa?'},
  {k:'q_apresto',t:'Si hubo orientación (apresto), ¿qué temática?'},
  {k:'q_tipo_cap',t:'Si registró capacitación, ¿a qué tipo postula?'}
];
// Columnas agrupadas. g='' = columna suelta (sin cuestionario encima).
const REP_GRUPOS=[
  {g:'', cols:[
    {k:'rut',t:'RUT'},{k:'nombre',t:'Nombre'},{k:'apellido',t:'Apellido'},{k:'comuna',t:'Comuna'},{k:'sexo',t:'Género'}]},
  {g:'Antecedentes', cols:[
    {k:'nacionalidad',t:'Nacionalidad'},{k:'residencia',t:'Residencia definitiva'},{k:'nivel_estudios',t:'Nivel de estudios'},{k:'cesantia',t:'Tiempo de cesantía'},
    {k:'discapacidad',t:'Discapacidad'},{k:'contra',t:'Contraindicaciones'}]},
  {g:'Servicios realizados', cols:[
    {k:'apresto',t:'Apresto'},{k:'intermediacion',t:'Intermediación'},{k:'formacion',t:'Formación'}]},
  {g:'Cuestionario complementario', cols: REP_CUEST.map(q=>({k:q.k,t:q.t}))},
  {g:'', cols:[
    {k:'fecha',t:'Fecha del reporte'},{k:'ejecutivo',t:'Ejecutivo'},{k:'ubicacion',t:'Ubicación'},{k:'lat',t:'Latitud'},{k:'lng',t:'Longitud'}]}
];
function repColsPlanas(){ const o=[]; REP_GRUPOS.forEach(gr=>gr.cols.forEach(c=>o.push({...c,g:gr.g}))); return o; }
function repInitCols(){ if(REP.cols) return; REP.cols={}; repColsPlanas().forEach(c=>REP.cols[c.k]=true); }

async function repRender(){
  const cont=document.getElementById('page-reportes'); if(!cont) return;
  repInitCols();
  cont.innerHTML=`
    <div class="rep-head">
      <div class="rep-title">📋 Reportes de la Oficina Móvil</div>
      <div class="rep-actions">
        <button class="btn sec" onclick="repToggleCols()">⚙ Columnas</button>
        <button class="btn gold" onclick="repExportar()">⬇ Exportar Excel</button>
      </div>
    </div>
    <div class="rep-filtros">
      <label>Desde <input type="date" id="repDesde" value="${REP.desde}" onchange="repSetFecha()"></label>
      <label>Hasta <input type="date" id="repHasta" value="${REP.hasta}" onchange="repSetFecha()"></label>
      <label>Ubicación
        <select id="repOp" onchange="repSetOp(this.value)"><option value="">Todas</option></select></label>
      <button class="btn gray" onclick="repLimpiar()">Limpiar filtros</button>
      <span id="repCount" class="rep-count"></span>
    </div>
    <div class="rep-wrap">
      <div id="repMapa" class="rep-mapa"></div>
      <div class="rep-tbl-wrap"><div id="repTabla"></div></div>
    </div>
    <div id="repColsPanel" class="rep-cols" style="display:none"></div>`;
  if(!REP.cargado){ document.getElementById('repTabla').innerHTML='<div class="rep-nota">Cargando…</div>'; await repCargar(); }
  repLlenarOps();
  repMapaInit();
  repPintar();
}

async function repCargar(){
  try{
    const [at,op]=await Promise.all([
      SB.from('atenciones').select('*').neq('estado_registro','Eliminado').order('created_at',{ascending:false}),
      SB.from('operativos').select('*').neq('estado','Eliminado')
    ]);
    REP.ats=at.data||[]; REP.ops=(op.data||[]);
    REP.opById={}; REP.ops.forEach(o=>REP.opById[o.operativo_id]=o);
    // Enriquecer nombre/apellido/comuna desde cv_personas por cv_id.
    const ids=[...new Set(REP.ats.map(a=>a.cv_id).filter(Boolean))];
    REP.cvById={};
    if(ids.length){
      const {data}=await SB.from('cv_personas').select('cv_id,nombres,apellidos,comuna,nacionalidad,discapacidad,tipo_discapacidad,contraindicaciones_json').in('cv_id',ids);
      (data||[]).forEach(c=>REP.cvById[c.cv_id]=c);
    }
    REP.cargado=true;
  }catch(e){ toast('Error al cargar reportes: '+(e.message||e),'err'); }
}

// ── valores por atención ─────────────────────────────────────────────────────
function repCuest(a){ try{ return JSON.parse(a.cuestionario_json||'{}')||{}; }catch(e){ return {}; } }
function repNombreApellido(a){
  const cv=a.cv_id&&REP.cvById[a.cv_id];
  if(cv && (cv.nombres||cv.apellidos)) return [cv.nombres||'', cv.apellidos||''];
  const p=String(a.nombre||'').trim().split(/\s+/);
  if(p.length<=1) return [a.nombre||'', ''];
  return [p.slice(0,-1).join(' '), p.slice(-1).join(' ')]; // heurística si no hay CV
}
function repVal(a,k){
  const cv=a.cv_id&&REP.cvById[a.cv_id]||{};
  const na=repNombreApellido(a);
  const op=a.operativo_id&&REP.opById[a.operativo_id];
  switch(k){
    case 'rut': return a.rut||'';
    case 'nombre': return na[0];
    case 'apellido': return na[1];
    case 'comuna': return a.comuna||cv.comuna||'';
    case 'sexo': return a.sexo||'';
    case 'nacionalidad': return a.nacionalidad||cv.nacionalidad||'';
    case 'residencia': return a.residencia||'';
    case 'nivel_estudios': return a.nivel_estudios||'';
    case 'cesantia': return a.cesantia||'';
    case 'discapacidad': return cv.discapacidad ? (cv.discapacidad==='Sí'?('Sí'+(cv.tipo_discapacidad?(' · '+cv.tipo_discapacidad):'')):cv.discapacidad) : '';
    case 'contra': { try{ const o=JSON.parse(cv.contraindicaciones_json||'{}'); return (o.items||[]).join(', '); }catch(e){ return ''; } }
    case 'apresto': return a.apresto?'Sí':'—';
    case 'intermediacion': return a.intermediacion?'Sí':'—';
    case 'formacion': return a.formacion?'Sí':'—';
    case 'fecha': return (a.created_at||'').slice(0,10);
    case 'ejecutivo': return a.ejecutivo||'';
    case 'ubicacion': return op?((op.lugar||'')||(op.comuna||'')):'';
    case 'lat': return op&&op.lat!=null?op.lat:'';
    case 'lng': return op&&op.lng!=null?op.lng:'';
    default: return repCuest(a)[k]||''; // preguntas del cuestionario
  }
}

// ── filtros ──────────────────────────────────────────────────────────────────
function repSetFecha(){ REP.desde=(document.getElementById('repDesde')||{}).value||''; REP.hasta=(document.getElementById('repHasta')||{}).value||''; repPintar(); }
function repSetOp(v){ REP.opFiltro=v||''; const s=document.getElementById('repOp'); if(s&&s.value!==REP.opFiltro) s.value=REP.opFiltro; repMapaSel(); repPintar(); }
function repLimpiar(){ REP.desde=''; REP.hasta=''; REP.opFiltro='';
  ['repDesde','repHasta'].forEach(id=>{const e=document.getElementById(id); if(e) e.value='';});
  const s=document.getElementById('repOp'); if(s) s.value=''; repMapaSel(); repPintar(); }
function repFiltradas(){
  return REP.ats.filter(a=>{
    const f=(a.created_at||'').slice(0,10);
    if(REP.desde && f<REP.desde) return false;
    if(REP.hasta && f>REP.hasta) return false;
    if(REP.opFiltro && a.operativo_id!==REP.opFiltro) return false;
    return true;
  });
}
function repLlenarOps(){
  const s=document.getElementById('repOp'); if(!s) return;
  const ops=REP.ops.filter(o=>o.lat!=null&&o.lng!=null);
  s.innerHTML='<option value="">Todas</option>'+ops.map(o=>{
    const nom=(o.lugar||o.comuna||'operativo')+(o.created_at?(' · '+o.created_at.slice(0,10)):'');
    return `<option value="${esc(o.operativo_id)}" ${REP.opFiltro===o.operativo_id?'selected':''}>${esc(nom)}</option>`;
  }).join('');
}

// ── mapa de ubicaciones (clic en un pin filtra por ese operativo) ────────────
function repMapaInit(){
  const cont=document.getElementById('repMapa'); if(!cont||typeof MapaAM==='undefined') return;
  if(REP.mapa){ try{REP.mapa.destroy();}catch(e){} REP.mapa=null; }
  const dibujar=(base)=>{
    REP.mapa=MapaAM.crear(cont,{ onPinClick:pin=>repSetOp(pin&&pin.data&&pin.data.opId||'') });
    REP.mapa.setBase({ poligonos:[base&&base.comunas].filter(Boolean), lineas:[], puntos:[],
      estilos:{fondo:'#eef3f2', poligonoFill:'rgba(0,163,153,.08)', poligonoStroke:'rgba(0,105,115,.35)', poligonoW:1} });
    REP.mapa.fit(24); const b=REP.mapa.bounds(); if(b) REP.mapa.setLimites(b,{minMult:0.9,maxPpd:400000});
    repMapaPines();
  };
  if(REP.base) dibujar(REP.base);
  else MapaAM.cargar({comunas:'../../shared/assets/geo/comunas-antofagasta.geojson?v=20260925b'})
        .then(b=>{ REP.base=b; dibujar(b); }).catch(()=>{ cont.innerHTML='<div class="rep-nota">Mapa no disponible.</div>'; });
}
function repMapaPines(){
  if(!REP.mapa) return;
  const cont={}; repFiltradasBase().forEach(a=>{ if(a.operativo_id) cont[a.operativo_id]=(cont[a.operativo_id]||0)+1; });
  const pines=REP.ops.filter(o=>o.lat!=null&&o.lng!=null).map((o,i)=>({
    id:'op'+i, lat:o.lat, lng:o.lng, label:cont[o.operativo_id]||0,
    r:REP.opFiltro && REP.opFiltro!==o.operativo_id?8:12,
    color:REP.opFiltro===o.operativo_id?'#F2A900':'#5b4fcf', data:{opId:o.operativo_id}}));
  REP.mapa.setPines(pines);
}
// atenciones en el rango de fecha (para contar pines, sin el filtro de operativo)
function repFiltradasBase(){
  return REP.ats.filter(a=>{ const f=(a.created_at||'').slice(0,10);
    if(REP.desde && f<REP.desde) return false; if(REP.hasta && f>REP.hasta) return false; return true; });
}
function repMapaSel(){ repMapaPines(); }

// ── tabla + KPIs ─────────────────────────────────────────────────────────────
function repVisibles(){ return repColsPlanas().filter(c=>REP.cols[c.k]); }
function repPintar(){
  const rows=repFiltradas();
  const cnt=document.getElementById('repCount'); if(cnt) cnt.textContent=rows.length+' atención'+(rows.length===1?'':'es');
  repMapaPines(); repLlenarOps();
  const vis=repVisibles();
  const el=document.getElementById('repTabla'); if(!el) return;
  if(!rows.length){ el.innerHTML='<div class="rep-nota">Sin atenciones para los filtros elegidos.</div>'; return; }
  // encabezado agrupado (2 filas)
  let h1='', h2='', i=0, plan=vis;
  while(i<plan.length){
    const col=plan[i];
    if(col.g){ let j=i; while(j<plan.length && plan[j].g===col.g) j++;
      h1+=`<th colspan="${j-i}" class="rep-grp">${esc(col.g)}</th>`;
      for(let x=i;x<j;x++) h2+=`<th>${esc(plan[x].t)}</th>`;
      i=j;
    }else{ h1+=`<th rowspan="2" class="rep-solo">${esc(col.t)}</th>`; i++; }
  }
  let body='';
  rows.forEach(a=>{ body+='<tr>'+vis.map(c=>`<td>${esc(String(repVal(a,c.k)))}</td>`).join('')+'</tr>'; });
  el.innerHTML=`<table class="rep-tbl"><thead><tr>${h1}</tr><tr>${h2}</tr></thead><tbody>${body}</tbody></table>`;
}

// ── panel de columnas on/off ─────────────────────────────────────────────────
function repToggleCols(){ const p=document.getElementById('repColsPanel'); if(!p) return;
  const abrir=p.style.display==='none'; p.style.display=abrir?'':'none'; if(abrir) repColsRender(); }
function repColsRender(){
  const p=document.getElementById('repColsPanel'); if(!p) return;
  p.innerHTML=`<div class="rep-cols-head"><b>Columnas a mostrar / exportar</b>
      <span><button class="btn gray" onclick="repColsTodas(true)">Todas</button>
      <button class="btn gray" onclick="repColsTodas(false)">Ninguna</button></span></div>`+
    REP_GRUPOS.map(gr=>`<div class="rep-cols-grp">${gr.g?`<div class="rep-cols-gt">${esc(gr.g)}</div>`:''}
      ${gr.cols.map(c=>`<label class="rep-chk"><input type="checkbox" ${REP.cols[c.k]?'checked':''} onchange="repColSet('${c.k}',this.checked)"> ${esc(c.t)}</label>`).join('')}</div>`).join('');
}
function repColSet(k,v){ REP.cols[k]=v; repPintar(); }
function repColsTodas(v){ repColsPlanas().forEach(c=>REP.cols[c.k]=v); repColsRender(); repPintar(); }

// ── exportar a Excel (encabezado agrupado con celdas combinadas) ─────────────
function repExportar(){
  if(typeof XLSX==='undefined'){ toast('No se pudo preparar el Excel','err'); return; }
  const rows=repFiltradas(); const vis=repVisibles();
  if(!vis.length){ toast('No hay columnas seleccionadas','err'); return; }
  const row1=new Array(vis.length).fill(''), row2=new Array(vis.length).fill('');
  const merges=[]; let i=0;
  while(i<vis.length){
    const col=vis[i];
    if(col.g){ let j=i; while(j<vis.length && vis[j].g===col.g) j++;
      row1[i]=col.g; for(let x=i;x<j;x++) row2[x]=vis[x].t;
      if(j-i>1) merges.push({s:{r:0,c:i},e:{r:0,c:j-1}});
      i=j;
    }else{ row1[i]=col.t; merges.push({s:{r:0,c:i},e:{r:1,c:i}}); i++; }
  }
  const aoa=[row1,row2];
  rows.forEach(a=>aoa.push(vis.map(c=>{ const v=repVal(a,c.k); return v===''?'':v; })));
  const ws=XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges']=merges;
  ws['!cols']=vis.map(c=>({wch: c.k==='rut'?13:(c.k==='ejecutivo'?26:(c.g==='Cuestionario complementario'?34:(['nombre','apellido','ubicacion','nacionalidad','nivel_estudios','cesantia'].includes(c.k)?18:14)))}));
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Reporte Móvil');
  XLSX.writeFile(wb,'reporte_movil_'+new Date().toISOString().slice(0,10)+'.xlsx');
  toast('✅ Excel exportado ('+rows.length+' atenciones)','ok');
}
