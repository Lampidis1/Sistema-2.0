// ═══════════════════════════════════════════════════════════════════════════
// reclamos.js — Reclamos Comunitarios · Antofagasta Minerals (AAPP)
//
// Mejora del "Filtrador TMRC" que vivía dentro de Proveedores. Carga el Excel
// maestro semanal (tmrc_export) EN MEMORIA — nunca se guarda: trae datos
// personales del reclamante (cols D–K). El informe que se arma/copia usa solo
// 11 columnas (sin PII del reclamante), igual que el correo semanal.
//
// FASE 1: vista AAPP Norte (filtro + tabla editable + eliminar filas + copiar).
// FASE 2 (pendiente): candado → histórico + link con clave. FASE 3: gráficas.
// Vista MLP: criterio pendiente de definición.
//
// Sin type="module": funciones globales (CLAUDE.md §6). SB/USER/ES_ADMIN los
// declara shared/js/auth-guard.js.
// ═══════════════════════════════════════════════════════════════════════════

// Mapa de columnas del Excel maestro (0-based), idéntico al TMRC.
const REC_COL={cod:0,cat:1,sub:2,estado:11,cia:12,titulo:13,monto:15,loc:16,creacion:23,elim:24,macro:25,denunciada:27,montoCorr:28,tgestion:29,provAfect:31,anio:33};

// Columnas del informe (las 11 del correo, sin CONCEPTO).
const REP_COLS=['RECLAMO','FECHA INGRESO','ESTADO RECLAMO','DÍAS EN GESTIÓN','COMPAÑÍA','CATEGORÍA','MONTO','EMPRESA DENUNCIADA','PROVEEDOR AFECTADO','LOCALIDAD AFECTADO','ESTATUS'];
const CIAS=['Centinela','Antucoya','Zaldivar'];

let REC={
  vista:'norte',
  subvista:'informe',  // 'informe' | 'graficas'
  gAnio:null,          // año seleccionado en gráficas (null = se resuelve al más reciente)
  gOpen:new Set(['GN']), // grupos (compañías) expandidos en el acordeón
  rows:[], file:'', loaded:false,
  fCia:new Set(CIAS),
  fMacro:new Set(), fCat:new Set(), fAnio:new Set(),
  estatus:{},          // cod -> texto ESTATUS editado
  deleted:new Set(),   // cods eliminados del informe
  colW:{},             // índice de columna -> ancho px
  editMode:false
};

function toast(msg,tipo){
  const t=document.getElementById('toast'); if(!t)return;
  t.textContent=msg; t.className=(tipo||'')+' show';
  clearTimeout(window._rtt); window._rtt=setTimeout(()=>{t.className=t.className.replace('show','').trim();},2800);
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function _norm(v){ return String(v==null?'':v).trim(); }
function _ciaNorm(v){ const c=_norm(v).toLowerCase(); if(c.startsWith('antucoya'))return 'Antucoya'; if(c.startsWith('zald'))return 'Zaldivar'; if(c.startsWith('centinela'))return 'Centinela'; return _norm(v); }

// Llamado por auth-guard tras validar acceso.
async function reclamosAcceso(user){
  document.getElementById('gate').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('hUser').textContent=(user&&user.email)||'';
  recVista('norte');
}

function recVista(v){
  REC.vista=v;
  document.getElementById('tabNorte').classList.toggle('active',v==='norte');
  document.getElementById('tabMlp').classList.toggle('active',v==='mlp');
  document.getElementById('subCtx').textContent = v==='norte'?'Informe semanal · AAPP Norte':'Informe semanal · MLP';
  render();
}

function render(){
  const cont=document.getElementById('vistaContenido');
  if(REC.vista==='mlp'){
    cont.innerHTML=`<div class="placeholder">
      <div class="emoji">🚧</div>
      <h2>MLP — criterio en definición</h2>
      <p>La vista <b>MLP</b> funcionará igual que AAPP Norte, con su propio criterio de filtrado.
      Falta definir sus reglas (compañías, estados y categorías que incluye).<br><br>
      Cuando lo definamos, se habilita esta pestaña sin tocar AAPP Norte.</p>
    </div>`;
    return;
  }
  if(!REC.loaded){ renderDropzone(cont); return; }
  renderInforme(cont);
}

function renderDropzone(cont){
  cont.innerHTML=`<div class="dropzone">
    <div class="emoji">📊</div>
    <div class="dz-t">Carga el Excel semanal de reclamos</div>
    <div class="dz-s">Sube el archivo <b>tmrc_export…</b> exportado del sistema de gestión.
      El archivo solo se usa para filtrar en pantalla.</div>
    <input type="file" accept=".xlsx,.xls" onchange="reclamosCargarExcel(this.files[0])">
    <div class="dz-warn">🔒 El Excel <b>no se guarda</b> en el sistema (contiene datos personales del reclamante).
      Solo el informe revisado —sin esos datos— podrá archivarse al cerrar con el candado.</div>
    <div style="margin-top:16px"><button class="btn" onclick="recHistorico()">🗂 Ver histórico de informes</button></div>
  </div>`;
}

function reclamosCargarExcel(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const wb=XLSX.read(e.target.result,{type:'array',cellDates:false});
      const ws=wb.Sheets['Reclamos']||wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:true});
      REC.rows=rows.slice(1).filter(r=>r[REC_COL.cod]);
      REC.file=file.name; REC.loaded=true;
      REC.fMacro=new Set(); REC.fCat=new Set(); REC.fAnio=new Set();
      REC.estatus={}; REC.deleted=new Set(); REC.editMode=false;
      REC.subvista='informe'; REC.gAnio=null; REC.gOpen=new Set(['GN']);
      toast('Excel cargado: '+REC.rows.length+' reclamos (solo en memoria)','ok');
      render();
    }catch(err){ toast('No se pudo leer el Excel: '+err.message,'err'); }
  };
  reader.readAsArrayBuffer(file);
}

// Aplica los defaults de AAPP Norte la primera vez (según el criterio actual).
function _aplicarDefaultsNorte(macros,cats,anios){
  if(!REC.fMacro.size) macros.forEach(m=>{ if(!/con resoluci/i.test(m)) REC.fMacro.add(m); });
  if(!REC.fCat.size)   cats.forEach(c=>{ if(!/tu voz|otra|plan preventivo/i.test(c)) REC.fCat.add(c); });
  if(!REC.fAnio.size && anios.length) REC.fAnio.add(anios[anios.length-1]); // año más reciente
}

function _toggleVistaHTML(){
  return `<div class="seg">
    <button class="seg-b ${REC.subvista==='informe'?'on':''}" onclick="recSubvista('informe')">📋 Informe</button>
    <button class="seg-b ${REC.subvista==='graficas'?'on':''}" onclick="recSubvista('graficas')">📊 Gráficas</button>
  </div>`;
}
function recSubvista(v){ REC.subvista=v; render(); }

function renderInforme(cont){
  if(REC.subvista==='graficas'){ renderGraficas(cont); return; }
  const macros=[...new Set(REC.rows.map(r=>_norm(r[REC_COL.macro])).filter(Boolean))].sort();
  const cats=[...new Set(REC.rows.map(r=>_norm(r[REC_COL.cat])).filter(c=>c&&!/tu voz/i.test(c)))].sort();
  const anios=[...new Set(REC.rows.map(r=>_norm(r[REC_COL.anio])).filter(Boolean))].sort();
  _aplicarDefaultsNorte(macros,cats,anios);

  const filtradas=REC.rows.filter(r=>{
    if(_norm(r[REC_COL.elim])!=='') return false;                          // Col Y: solo vacías
    if(!REC.fCia.has(_ciaNorm(r[REC_COL.cia]))) return false;              // Col M
    const cat=_norm(r[REC_COL.cat]); if(/tu voz/i.test(cat)) return false; if(!REC.fCat.has(cat)) return false;
    if(!REC.fMacro.has(_norm(r[REC_COL.macro]))) return false;            // Col Z
    if(!REC.fAnio.has(_norm(r[REC_COL.anio]))) return false;              // Col AH
    if(REC.deleted.has(_norm(r[REC_COL.cod]))) return false;             // eliminadas del informe
    return true;
  });

  const chip=(set,val,fn)=>`<label class="chip ${set.has(val)?'on':''}"><input type="checkbox" ${set.has(val)?'checked':''} onchange="${fn}('${esc(val).replace(/'/g,"\\'")}')">${esc(val)}</label>`;

  let h=`<div class="info-bar">
    <div class="file">📄 <b>${esc(REC.file)}</b> · ${filtradas.length} de ${REC.rows.length} reclamos</div>
    ${_toggleVistaHTML()}
    <div class="spacer"></div>
    <button class="btn" onclick="recHistorico()">🗂 Histórico</button>
    <button class="btn ${REC.editMode?'on':''}" onclick="recToggleEdit()">${REC.editMode?'✓ Listo':'🗑 Eliminar filas'}</button>
    <button class="btn primary" onclick="recCopiar()">⧉ Copiar tabla</button>
    <button class="btn gold" onclick="recArchivar()">🔒 Cerrar y archivar</button>
    <button class="btn" onclick="recReset()">↻ Cargar otro Excel</button>
  </div>`;

  h+=`<div class="filtros">
    <div class="grp-t">Compañía</div>
    <div>${CIAS.map(c=>chip(REC.fCia,c,'recTogCia')).join('')}</div>
    <div class="grp-t">Macro estado</div>
    <div>${macros.map(m=>chip(REC.fMacro,m,'recTogMacro')).join('')}</div>
    <div class="grp-t">Categoría <span style="font-weight:400;text-transform:none">(Tu Voz excluida)</span></div>
    <div>${cats.map(c=>chip(REC.fCat,c,'recTogCat')).join('')}</div>
    <div class="grp-t">Año</div>
    <div>${anios.map(a=>chip(REC.fAnio,a,'recTogAnio')).join('')}</div>
    <div class="nota">✓ Fecha de eliminación: solo registros vacíos · Tiempo de gestión: <span class="pill-red">rojo &gt; 30 días</span></div>
  </div>`;

  if(!filtradas.length){
    h+=`<div class="placeholder"><div class="emoji">🔍</div><h2>Sin resultados</h2><p>Ningún reclamo cumple los filtros actuales.</p></div>`;
    cont.innerHTML=h; return;
  }

  CIAS.filter(c=>REC.fCia.has(c)).forEach(cia=>{
    let rows=filtradas.filter(r=>_ciaNorm(r[REC_COL.cia])===cia);
    if(!rows.length) return;
    rows.sort((a,b)=>_norm(a[REC_COL.denunciada]).localeCompare(_norm(b[REC_COL.denunciada]))||_norm(a[REC_COL.creacion]).localeCompare(_norm(b[REC_COL.creacion])));
    // rowspans por empresa denunciada
    const spanStart={};
    rows.forEach((r,i)=>{ const d=_norm(r[REC_COL.denunciada]); if(i===0||d!==_norm(rows[i-1][REC_COL.denunciada])){ let n=1; for(let j=i+1;j<rows.length&&_norm(rows[j][REC_COL.denunciada])===d;j++)n++; spanStart[i]=n; } });

    h+=`<div class="cia-h">${cia} <small>(${rows.length})</small></div>`;
    h+=`<div class="tabla-wrap"><table class="rep" data-cia="${esc(cia)}">`;
    h+=`<thead><tr>${REC.editMode?'<th class="del-col"></th>':''}${REP_COLS.map((t,ci)=>`<th data-col="${ci}"${REC.colW[ci]?` style="width:${REC.colW[ci]}px"`:''}>${t}<span class="col-resizer" onmousedown="recResizeStart(event,${ci})"></span></th>`).join('')}</tr></thead><tbody>`;

    rows.forEach((r,i)=>{
      const cod=_norm(r[REC_COL.cod]);
      const dias=parseInt(r[REC_COL.tgestion])||0;
      const fecha=_norm(r[REC_COL.creacion]).slice(0,10).split('-').reverse().join('-');
      const montoRaw=r[REC_COL.montoCorr]!=null&&r[REC_COL.montoCorr]!==''?r[REC_COL.montoCorr]:r[REC_COL.monto];
      const monto=(montoRaw!==''&&!isNaN(Number(montoRaw)))?('$ '+Number(montoRaw).toLocaleString('es-CL')):'-';
      const est=REC.estatus[cod]!=null?REC.estatus[cod]:'';
      h+='<tr>'
        +(REC.editMode?`<td class="del-col"><button class="btn-del" title="Quitar del informe" onclick="recEliminar('${esc(cod).replace(/'/g,"\\'")}')">✕</button></td>`:'')
        +`<td class="c-cod">${esc(cod)}</td>`
        +`<td>${esc(fecha)}</td>`
        +`<td>${esc(_norm(r[REC_COL.macro]))}</td>`
        +`<td class="c-num"><span class="dias ${dias>30?'late':'ok'}">${dias}</span></td>`
        +`<td>${esc(cia)}</td>`
        +`<td>${esc(_norm(r[REC_COL.cat]))}</td>`
        +`<td class="c-monto">${monto}</td>`
        +(spanStart[i]?`<td class="c-den" rowspan="${spanStart[i]}">${esc(_norm(r[REC_COL.denunciada])||'-')}</td>`:'')
        +`<td>${esc(_norm(r[REC_COL.provAfect])||'-')}</td>`
        +`<td>${esc(_norm(r[REC_COL.loc])||'-')}</td>`
        +`<td class="c-estatus"><div class="estatus-edit" contenteditable="true" data-ph="escribe el estatus…" data-cod="${esc(cod)}" onblur="recEstatus(this)">${esc(est)}</div></td>`
        +'</tr>';
    });
    h+='</tbody></table></div>';
  });

  cont.innerHTML=h;
}

// ── Toggles de filtro ──
function recTogCia(v){ REC.fCia.has(v)?REC.fCia.delete(v):REC.fCia.add(v); render(); }
function recTogMacro(v){ REC.fMacro.has(v)?REC.fMacro.delete(v):REC.fMacro.add(v); render(); }
function recTogCat(v){ REC.fCat.has(v)?REC.fCat.delete(v):REC.fCat.add(v); render(); }
function recTogAnio(v){ REC.fAnio.has(v)?REC.fAnio.delete(v):REC.fAnio.add(v); render(); }

// ── Edición del informe ──
function recToggleEdit(){ REC.editMode=!REC.editMode; render(); }
function recEliminar(cod){ REC.deleted.add(cod); render(); }
function recEstatus(el){ const cod=el.getAttribute('data-cod'); REC.estatus[cod]=el.innerText.trim(); }
function recReset(){
  REC={...REC, rows:[], file:'', loaded:false, fCia:new Set(CIAS), fMacro:new Set(), fCat:new Set(), fAnio:new Set(), estatus:{}, deleted:new Set(), colW:{}, editMode:false};
  render();
}

// ── Redimensionar columnas (arrastrar el borde del encabezado) ──
function recResizeStart(ev,ci){
  ev.preventDefault(); ev.stopPropagation();
  const th=ev.target.closest('th'); ev.target.classList.add('drag');
  const startX=ev.clientX, startW=th.offsetWidth;
  function mv(e){ const w=Math.max(60,startW+(e.clientX-startX)); REC.colW[ci]=w;
    document.querySelectorAll(`table.rep th[data-col="${ci}"]`).forEach(t=>t.style.width=w+'px'); }
  function up(){ document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); ev.target.classList.remove('drag'); }
  document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up);
}

// ── Copiar la tabla lista para pegar en el correo (estilo del informe semanal) ──
function recCopiar(){
  const filtradas=REC.rows.filter(r=>{
    if(_norm(r[REC_COL.elim])!=='') return false;
    if(!REC.fCia.has(_ciaNorm(r[REC_COL.cia]))) return false;
    const cat=_norm(r[REC_COL.cat]); if(/tu voz/i.test(cat)) return false; if(!REC.fCat.has(cat)) return false;
    if(!REC.fMacro.has(_norm(r[REC_COL.macro]))) return false;
    if(!REC.fAnio.has(_norm(r[REC_COL.anio]))) return false;
    if(REC.deleted.has(_norm(r[REC_COL.cod]))) return false;
    return true;
  });
  if(!filtradas.length){ toast('No hay filas para copiar','err'); return; }

  // Ordenado por compañía y luego por empresa denunciada (como el correo).
  const orden={Centinela:0,Antucoya:1,Zaldivar:2};
  filtradas.sort((a,b)=>(orden[_ciaNorm(a[REC_COL.cia])]-orden[_ciaNorm(b[REC_COL.cia])])
    ||_norm(a[REC_COL.denunciada]).localeCompare(_norm(b[REC_COL.denunciada]))
    ||_norm(a[REC_COL.creacion]).localeCompare(_norm(b[REC_COL.creacion])));

  const thS='padding:6px 9px;border:1px solid #9fb3b5;background:#006973;color:#fff;font-family:Calibri,Arial,sans-serif;font-size:12px;text-align:center';
  const tdS='padding:5px 8px;border:1px solid #cdd7d8;font-family:Calibri,Arial,sans-serif;font-size:12px;vertical-align:middle';
  let t=`<table style="border-collapse:collapse;border:1px solid #9fb3b5">`;
  t+=`<thead><tr>${REP_COLS.map(c=>`<th style="${thS}">${c}</th>`).join('')}</tr></thead><tbody>`;

  // rowspans por empresa denunciada (dentro de cada compañía)
  const spanStart={};
  filtradas.forEach((r,i)=>{ const key=_ciaNorm(r[REC_COL.cia])+'|'+_norm(r[REC_COL.denunciada]);
    if(i===0||key!==(_ciaNorm(filtradas[i-1][REC_COL.cia])+'|'+_norm(filtradas[i-1][REC_COL.denunciada]))){
      let n=1; for(let j=i+1;j<filtradas.length&&(_ciaNorm(filtradas[j][REC_COL.cia])+'|'+_norm(filtradas[j][REC_COL.denunciada]))===key;j++)n++; spanStart[i]=n; } });

  filtradas.forEach((r,i)=>{
    const cod=_norm(r[REC_COL.cod]);
    const dias=parseInt(r[REC_COL.tgestion])||0;
    const fecha=_norm(r[REC_COL.creacion]).slice(0,10).split('-').reverse().join('-');
    const montoRaw=r[REC_COL.montoCorr]!=null&&r[REC_COL.montoCorr]!==''?r[REC_COL.montoCorr]:r[REC_COL.monto];
    const monto=(montoRaw!==''&&!isNaN(Number(montoRaw)))?('$'+Number(montoRaw).toLocaleString('es-CL')):'-';
    const est=(REC.estatus[cod]!=null?REC.estatus[cod]:'').replace(/\n/g,'<br>');
    const diasS=tdS+';text-align:center;font-weight:700;color:#fff;background:'+(dias>30?'#D0311B':'#1a7a38');
    t+='<tr>'
      +`<td style="${tdS};white-space:nowrap">${esc(cod)}</td>`
      +`<td style="${tdS};white-space:nowrap">${esc(fecha)}</td>`
      +`<td style="${tdS}">${esc(_norm(r[REC_COL.macro]))}</td>`
      +`<td style="${diasS}">${dias}</td>`
      +`<td style="${tdS}">${esc(_ciaNorm(r[REC_COL.cia]))}</td>`
      +`<td style="${tdS}">${esc(_norm(r[REC_COL.cat]))}</td>`
      +`<td style="${tdS};white-space:nowrap;text-align:right">${monto}</td>`
      +(spanStart[i]?`<td style="${tdS};text-align:center;font-weight:600" rowspan="${spanStart[i]}">${esc(_norm(r[REC_COL.denunciada])||'-')}</td>`:'')
      +`<td style="${tdS}">${esc(_norm(r[REC_COL.provAfect])||'-')}</td>`
      +`<td style="${tdS}">${esc(_norm(r[REC_COL.loc])||'-')}</td>`
      +`<td style="${tdS};text-align:center">${est}</td>`
      +'</tr>';
  });
  t+='</tbody></table>';

  const plano=filtradas.map(r=>{
    const cod=_norm(r[REC_COL.cod]);
    return [cod,_norm(r[REC_COL.creacion]).slice(0,10).split('-').reverse().join('-'),_norm(r[REC_COL.macro]),(parseInt(r[REC_COL.tgestion])||0),_ciaNorm(r[REC_COL.cia]),_norm(r[REC_COL.cat]),_norm(r[REC_COL.denunciada]),_norm(r[REC_COL.provAfect]),_norm(r[REC_COL.loc]),(REC.estatus[cod]||'')].join('\t');
  }).join('\n');

  _copiarHTML(t,plano);
}

function _copiarHTML(html,plano){
  if(navigator.clipboard&&window.ClipboardItem){
    const item=new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([plano],{type:'text/plain'})});
    navigator.clipboard.write([item]).then(()=>toast('Tabla copiada — pégala en el correo','ok'),()=>_copiarFallback(html));
  }else{ _copiarFallback(html); }
}
function _copiarFallback(html){
  const d=document.createElement('div'); d.contentEditable='true'; d.style.cssText='position:fixed;left:-9999px;top:0;opacity:0'; d.innerHTML=html;
  document.body.appendChild(d); const rng=document.createRange(); rng.selectNodeContents(d);
  const sel=getSelection(); sel.removeAllRanges(); sel.addRange(rng);
  try{ document.execCommand('copy'); toast('Tabla copiada — pégala en el correo','ok'); }
  catch(e){ toast('No se pudo copiar automáticamente','err'); }
  sel.removeAllRanges(); document.body.removeChild(d);
}

// ═══════════════════════════════════════════════════════════════════════════
// FASE 2 · Candado → histórico + link con clave + imagen
// ═══════════════════════════════════════════════════════════════════════════

// Devuelve el informe actual como datos estructurados (11 columnas, sin PII).
function recFilasInforme(){
  const orden={Centinela:0,Antucoya:1,Zaldivar:2};
  const f=REC.rows.filter(r=>{
    if(_norm(r[REC_COL.elim])!=='') return false;
    if(!REC.fCia.has(_ciaNorm(r[REC_COL.cia]))) return false;
    const cat=_norm(r[REC_COL.cat]); if(/tu voz/i.test(cat)) return false; if(!REC.fCat.has(cat)) return false;
    if(!REC.fMacro.has(_norm(r[REC_COL.macro]))) return false;
    if(!REC.fAnio.has(_norm(r[REC_COL.anio]))) return false;
    if(REC.deleted.has(_norm(r[REC_COL.cod]))) return false;
    return true;
  });
  f.sort((a,b)=>(orden[_ciaNorm(a[REC_COL.cia])]-orden[_ciaNorm(b[REC_COL.cia])])
    ||_norm(a[REC_COL.denunciada]).localeCompare(_norm(b[REC_COL.denunciada]))
    ||_norm(a[REC_COL.creacion]).localeCompare(_norm(b[REC_COL.creacion])));
  return f.map(r=>{
    const cod=_norm(r[REC_COL.cod]);
    const montoRaw=r[REC_COL.montoCorr]!=null&&r[REC_COL.montoCorr]!==''?r[REC_COL.montoCorr]:r[REC_COL.monto];
    return {
      cod, fecha:_norm(r[REC_COL.creacion]).slice(0,10).split('-').reverse().join('-'),
      estado:_norm(r[REC_COL.macro]), dias:parseInt(r[REC_COL.tgestion])||0,
      cia:_ciaNorm(r[REC_COL.cia]), cat:_norm(r[REC_COL.cat]),
      monto:(montoRaw!==''&&!isNaN(Number(montoRaw)))?('$ '+Number(montoRaw).toLocaleString('es-CL')):'-',
      denunciada:_norm(r[REC_COL.denunciada])||'-', provAfect:_norm(r[REC_COL.provAfect])||'-',
      loc:_norm(r[REC_COL.loc])||'-', estatus:(REC.estatus[cod]!=null?REC.estatus[cod]:'')
    };
  });
}

// Tabla con estilos en línea (para copiar a Outlook, imagen y vista pública).
function recTablaInline(filas, forImage){
  const br=forImage?'<br/>':'<br>';
  const thS='padding:6px 9px;border:1px solid #9fb3b5;background:#006973;color:#fff;font-family:Calibri,Arial,sans-serif;font-size:12px;text-align:center';
  const tdS='padding:5px 8px;border:1px solid #cdd7d8;font-family:Calibri,Arial,sans-serif;font-size:12px;vertical-align:middle';
  let t=`<table style="border-collapse:collapse;border:1px solid #9fb3b5">`;
  t+=`<thead><tr>${REP_COLS.map(c=>`<th style="${thS}">${c}</th>`).join('')}</tr></thead><tbody>`;
  const spanStart={};
  filas.forEach((r,i)=>{ const key=r.cia+'|'+r.denunciada;
    if(i===0||key!==(filas[i-1].cia+'|'+filas[i-1].denunciada)){
      let n=1; for(let j=i+1;j<filas.length&&(filas[j].cia+'|'+filas[j].denunciada)===key;j++)n++; spanStart[i]=n; } });
  filas.forEach((r,i)=>{
    const diasS=tdS+';text-align:center;font-weight:700;color:#fff;background:'+(r.dias>30?'#D0311B':'#1a7a38');
    t+='<tr>'
      +`<td style="${tdS};white-space:nowrap">${esc(r.cod)}</td>`
      +`<td style="${tdS};white-space:nowrap">${esc(r.fecha)}</td>`
      +`<td style="${tdS}">${esc(r.estado)}</td>`
      +`<td style="${diasS}">${r.dias}</td>`
      +`<td style="${tdS}">${esc(r.cia)}</td>`
      +`<td style="${tdS}">${esc(r.cat)}</td>`
      +`<td style="${tdS};white-space:nowrap;text-align:right">${esc(r.monto)}</td>`
      +(spanStart[i]?`<td style="${tdS};text-align:center;font-weight:600" rowspan="${spanStart[i]}">${esc(r.denunciada)}</td>`:'')
      +`<td style="${tdS}">${esc(r.provAfect)}</td>`
      +`<td style="${tdS}">${esc(r.loc)}</td>`
      +`<td style="${tdS};text-align:center">${esc(r.estatus).replace(/\n/g,br)}</td>`
      +'</tr>';
  });
  return t+'</tbody></table>';
}

// ── Modal genérico ──
function openModal(html,ancho){
  let m=document.getElementById('modalMask');
  m.querySelector('#modalBox').style.maxWidth=(ancho||'560px');
  m.querySelector('#modalBox').innerHTML=html;
  m.classList.remove('hidden');
}
function cerrarModal(){ document.getElementById('modalMask').classList.add('hidden'); }
document.addEventListener('keydown',e=>{ if(e.key==='Escape')cerrarModal(); });

function _randClave(){
  const abc='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s='';
  const a=new Uint32Array(8); (crypto||window.crypto).getRandomValues(a);
  for(let i=0;i<8;i++) s+=abc[a[i]%abc.length];
  return s.slice(0,4)+'-'+s.slice(4);
}

// ── Candado: cerrar y archivar ──
function recArchivar(){
  const filas=recFilasInforme();
  if(!filas.length){ toast('No hay filas para archivar','err'); return; }
  window._recArcFilas=filas;
  const hoy=new Date(), dd=String(hoy.getDate()).padStart(2,'0'), mm=String(hoy.getMonth()+1).padStart(2,'0');
  const titDef=`Reclamos ${REC.vista==='norte'?'AAPP Norte':'MLP'} al ${dd}/${mm}`;
  openModal(`
    <div class="m-head"><h3>🔒 Cerrar y archivar informe</h3><button class="m-x" onclick="cerrarModal()">✕</button></div>
    <p class="m-p">Se guarda una copia <b>congelada</b> de <b>${filas.length} reclamos</b> (sin datos personales del reclamante) en el histórico, y se genera un enlace para adjuntar al correo.</p>
    <label class="m-l">Título del informe</label>
    <input class="m-in" id="arcTit" value="${esc(titDef)}">
    <label class="m-chk"><input type="checkbox" id="arcClave" checked> Proteger el enlace con una clave (recomendado)</label>
    <label class="m-l">Vigencia del enlace</label>
    <select class="m-in" id="arcDias"><option value="7" selected>7 días</option><option value="30">30 días</option><option value="0">Sin expiración</option></select>
    <div class="m-acts"><button class="btn" onclick="cerrarModal()">Cancelar</button><button class="btn gold" id="arcGo" onclick="recArchivarConfirmar()">Archivar y generar enlace</button></div>
  `);
}
async function recArchivarConfirmar(){
  const filas=window._recArcFilas||[];
  const titulo=(document.getElementById('arcTit').value||'').trim()||'Informe de reclamos';
  const usarClave=document.getElementById('arcClave').checked;
  const dias=parseInt(document.getElementById('arcDias').value)||0;
  const clave=usarClave?_randClave():null;
  const btn=document.getElementById('arcGo'); btn.disabled=true; btn.textContent='Guardando…';
  const meta={file:REC.file, filtros:{cia:[...REC.fCia],macro:[...REC.fMacro],cat:[...REC.fCat],anio:[...REC.fAnio]}, n:filas.length};
  try{
    const {data,error}=await SB.rpc('reclamos_guardar',{p_vista:REC.vista,p_titulo:titulo,p_fecha:new Date().toISOString().slice(0,10),p_filas:filas,p_meta:meta,p_clave:clave,p_dias:dias});
    if(error) throw error;
    if(data&&data.error) throw new Error(data.error);
    const url=_verUrl(data.token);
    recModalResultado(url,clave,titulo,filas);
    toast('Informe archivado en el histórico','ok');
  }catch(e){ toast('No se pudo archivar: '+(e.message||e),'err'); btn.disabled=false; btn.textContent='Archivar y generar enlace'; }
}
function _verUrl(token){ return location.origin+location.pathname.replace(/index\.html$/,'')+'ver.html?t='+token; }

function recModalResultado(url,clave,titulo,filas){
  window._recUltFilas=filas; window._recUltTit=titulo;
  openModal(`
    <div class="m-head"><h3>✅ Informe archivado</h3><button class="m-x" onclick="cerrarModal()">✕</button></div>
    <p class="m-p"><b>${esc(titulo)}</b> · ${filas.length} reclamos. Adjunta al correo el enlace${clave?' y la clave':''}, más la imagen de la tabla.</p>
    <label class="m-l">Enlace</label>
    <input class="m-in" id="resUrl" readonly value="${esc(url)}" onclick="this.select()">
    ${clave?`<label class="m-l">Clave</label><input class="m-in m-clave" id="resClave" readonly value="${esc(clave)}" onclick="this.select()">`:''}
    <div class="m-acts" style="flex-wrap:wrap">
      <button class="btn primary" onclick="recCopiarAcceso('${esc(url)}','${clave?esc(clave):''}')">⧉ Copiar enlace${clave?' y clave':''}</button>
      <button class="btn" onclick="recCopiarFilas(window._recUltFilas)">⧉ Copiar tabla</button>
      <button class="btn gold" onclick="recImagenPNG(window._recUltFilas,'${esc(titulo).replace(/[^\w\-]+/g,'_')}.png')">🖼 Descargar imagen</button>
      <a class="btn" href="${esc(url)}" target="_blank" rel="noopener">↗ Abrir enlace</a>
    </div>
    <p class="m-note">La clave no se vuelve a mostrar. Si la pierdes, archiva de nuevo o revoca el enlace desde el histórico.</p>
  `,'600px');
}
function recCopiarAcceso(url,clave){
  const txt=clave?`Enlace: ${url}\nClave: ${clave}`:`Enlace: ${url}`;
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(()=>toast('Enlace copiado','ok'),()=>toast('No se pudo copiar','err')); }
  else toast('No se pudo copiar','err');
}
function recCopiarFilas(filas){ _copiarHTML(recTablaInline(filas,false), filas.map(r=>[r.cod,r.fecha,r.estado,r.dias,r.cia,r.cat,r.monto,r.denunciada,r.provAfect,r.loc,r.estatus].join('\t')).join('\n')); }

// ── Histórico ──
async function recHistorico(){
  openModal(`<div class="m-head"><h3>🗂 Histórico de informes</h3><button class="m-x" onclick="cerrarModal()">✕</button></div><div id="histBody" class="m-p">Cargando…</div>`,'760px');
  try{
    const {data,error}=await SB.rpc('reclamos_historico',{p_vista:null});
    if(error) throw error;
    const arr=Array.isArray(data)?data:[];
    if(!arr.length){ document.getElementById('histBody').innerHTML='<p class="m-p">Aún no hay informes archivados.</p>'; return; }
    let h=`<div class="hist-list">`;
    arr.forEach(x=>{
      const estado = !x.activo?'<span class="badge rev">revocado</span>' : (x.vencido?'<span class="badge venc">vencido</span>':'<span class="badge ok">activo</span>');
      h+=`<div class="hist-row">
        <div class="hist-main">
          <div class="hist-t">${esc(x.titulo)}</div>
          <div class="hist-s">${esc(x.vista==='norte'?'AAPP Norte':'MLP')} · ${x.n_filas} reclamos · ${esc(x.fecha_informe)} · ${esc(x.creado_por||'')} ${x.tiene_clave?'· 🔑':''} ${estado}</div>
        </div>
        <div class="hist-acts">
          <button class="btn" onclick="recVerGuardado('${x.id}')">Ver</button>
          ${x.activo?`<button class="btn ghost-danger" onclick="recRevocar('${x.id}')">Revocar</button>`:`<button class="btn" onclick="recReactivar('${x.id}')">Reactivar 7d</button>`}
        </div>
      </div>`;
    });
    h+='</div>';
    document.getElementById('histBody').innerHTML=h;
  }catch(e){ document.getElementById('histBody').innerHTML='<p class="m-p">Error: '+esc(e.message||e)+'</p>'; }
}
async function recVerGuardado(id){
  try{
    const {data,error}=await SB.rpc('reclamos_ver',{p_id:id});
    if(error) throw error; if(data&&data.error) throw new Error(data.error);
    const filas=data.filas||[]; window._recUltFilas=filas; window._recUltTit=data.titulo;
    const url=_verUrl(data.token);
    const venc = data.expira && new Date(data.expira)<new Date();
    openModal(`
      <div class="m-head"><h3>${esc(data.titulo)}</h3><button class="m-x" onclick="cerrarModal()">✕</button></div>
      <p class="m-p">${esc(data.vista==='norte'?'AAPP Norte':'MLP')} · ${filas.length} reclamos · ${esc(data.fecha_informe)} ${data.activo?(venc?'· <b>vencido</b>':'· activo'):'· <b>revocado</b>'}</p>
      <div class="m-acts" style="flex-wrap:wrap">
        <input class="m-in" style="flex:1;min-width:220px" readonly value="${esc(url)}" onclick="this.select()">
        <button class="btn" onclick="recCopiarFilas(window._recUltFilas)">⧉ Copiar tabla</button>
        <button class="btn gold" onclick="recImagenPNG(window._recUltFilas,'${esc(data.titulo).replace(/[^\w\-]+/g,'_')}.png')">🖼 Imagen</button>
      </div>
      <div class="ro-tabla">${recTablaInline(filas,false)}</div>
    `,'900px');
  }catch(e){ toast('No se pudo abrir: '+(e.message||e),'err'); }
}
async function recRevocar(id){
  try{ const {data,error}=await SB.rpc('reclamos_link_estado',{p_id:id,p_activo:false,p_dias:null}); if(error)throw error; toast('Enlace revocado','ok'); recHistorico(); }
  catch(e){ toast('Error: '+(e.message||e),'err'); }
}
async function recReactivar(id){
  try{ const {data,error}=await SB.rpc('reclamos_link_estado',{p_id:id,p_activo:true,p_dias:7}); if(error)throw error; toast('Enlace reactivado (7 días)','ok'); recHistorico(); }
  catch(e){ toast('Error: '+(e.message||e),'err'); }
}

// La imagen PNG la genera reclamos-imagen.js (window.recImagenPNG), dibujando
// la tabla a mano sobre un canvas — sin dependencias ni foreignObject.

// ═══════════════════════════════════════════════════════════════════════════
// FASE 3 · Gráficas nativas por compañía (Chart.js) — reemplazan el PPT Power BI
// ═══════════════════════════════════════════════════════════════════════════
const G_TEAL='#00A399', G_TEALDK='#006973', G_GOLD='#F2A900', G_RED='#D0311B', G_GRAY='#5F6973';
const MESES=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const GRUPOS=[
  {key:'GN', cia:'Todas',    label:'Todas las compañías (GN)'},
  {key:'CEN',cia:'Centinela',label:'Centinela'},
  {key:'ANT',cia:'Antucoya', label:'Antucoya'},
  {key:'CMZ',cia:'Zaldivar', label:'Zaldívar'}
];
function _yearOf(r){ const a=_norm(r[REC_COL.anio]); if(/^\d{4}$/.test(a))return a; const c=_norm(r[REC_COL.creacion]); return /^\d{4}/.test(c)?c.slice(0,4):''; }
function _monthOf(r){ const c=_norm(r[REC_COL.creacion]); const m=parseInt(c.slice(5,7)); return (m>=1&&m<=12)?m:0; }
function _catNorm(v){ const c=_norm(v); if(/tu voz/i.test(c))return 'Tu Voz - Compliance'; return c||'(sin categoría)'; }

function recGAnio(v){ REC.gAnio=v; render(); }
function recToggleGrupo(key){ if(REC.gOpen.has(key))REC.gOpen.delete(key); else REC.gOpen.add(key); render(); }

// "Todas" (GN) = solo las 3 compañías de AAPP Norte, no todo el TMRC.
function _ciaMatch(r, cia){ const c=_ciaNorm(r[REC_COL.cia]); return cia==='Todas' ? CIAS.includes(c) : c===cia; }

function _rowsGrupo(cia, anio){
  return REC.rows.filter(r=> _norm(r[REC_COL.elim])===''
    && _ciaMatch(r, cia)
    && (anio==='Todos' || _yearOf(r)===anio));
}

// Métricas de un grupo (compañía) para el año seleccionado.
function recStatsGrupo(cia, anio){
  const rows=_rowsGrupo(cia, anio);
  const baseAll=REC.rows.filter(r=> _norm(r[REC_COL.elim])==='' && _ciaMatch(r, cia));
  const allYearsCia=[...new Set(baseAll.map(_yearOf).filter(Boolean))].sort();
  const porAnio={}; allYearsCia.forEach(y=>porAnio[y]=0); baseAll.forEach(r=>{ const y=_yearOf(r); if(y)porAnio[y]++; });
  const monthYears = anio==='Todos' ? allYearsCia : [anio];
  const monthly={}; monthYears.forEach(y=>monthly[y]=Array(12).fill(0));
  const macro={}, categoria={}; let apelado=0, atrasado=0, enCurso=0, enGestion=0;
  rows.forEach(r=>{
    const y=_yearOf(r), m=_monthOf(r);
    if(monthly[y]&&m) monthly[y][m-1]++;
    const mac=_norm(r[REC_COL.macro])||'(sin estado)'; macro[mac]=(macro[mac]||0)+1;
    const cat=_catNorm(r[REC_COL.cat]); categoria[cat]=(categoria[cat]||0)+1;
    if(/en gesti/i.test(mac)){ enGestion++;
      const est=_norm(r[REC_COL.estado]); const dias=parseInt(r[REC_COL.tgestion])||0;
      if(/apel/i.test(est)) apelado++; else if(dias>30) atrasado++; else enCurso++;
    }
  });
  return {total:rows.length, allYearsCia, porAnio, monthYears, monthly, macro, categoria,
          avance:{Apelado:apelado,'En Curso':enCurso,Atrasado:atrasado}, enGestion};
}

function renderGraficas(cont){
  const allYears=[...new Set(REC.rows.filter(r=>_norm(r[REC_COL.elim])===''&&_ciaMatch(r,'Todas')).map(_yearOf).filter(Boolean))].sort();
  if(REC.gAnio==null || (REC.gAnio!=='Todos' && !allYears.includes(REC.gAnio)))
    REC.gAnio = allYears.length ? allYears[allYears.length-1] : 'Todos';
  const anio=REC.gAnio;
  const anios=['Todos'].concat(allYears);

  let h=`<div class="info-bar">
    <div class="file">📄 <b>${esc(REC.file)}</b></div>
    ${_toggleVistaHTML()}
    <div class="spacer"></div>
    <span class="g-lbl">Año</span>
    <select class="g-sel" onchange="recGAnio(this.value)">${anios.map(a=>`<option ${anio===a?'selected':''}>${a}</option>`).join('')}</select>
    <button class="btn" onclick="recReset()">↻ Cargar otro Excel</button>
  </div>`;

  const mostrarDonut = anio==='Todos';
  GRUPOS.forEach(g=>{
    const total=_rowsGrupo(g.cia, anio).length;
    const open=REC.gOpen.has(g.key);
    h+=`<div class="acc ${open?'open':''}">
      <button class="acc-h" onclick="recToggleGrupo('${g.key}')">
        <span class="acc-chev">${open?'▾':'▸'}</span>
        <span class="acc-t">${esc(g.label)}</span>
        <span class="acc-badge">${total} reclamos · ${esc(String(anio))}</span>
      </button>`;
    if(open){
      h+=`<div class="acc-body"><div class="g-grid">
        <div class="g-card g-kpi">
          <div class="g-kpi-n" id="gTotal_${g.key}">${total}</div>
          <div class="g-kpi-l">Total reclamos · ${esc(g.label)} · ${esc(String(anio))}</div>
          ${mostrarDonut?`<div class="chart-box" style="height:180px"><canvas id="gAnio_${g.key}"></canvas></div>`:''}
        </div>
        <div class="g-card g-wide"><div class="g-h">Cantidad de reclamos mensuales</div><div class="chart-box" style="height:230px"><canvas id="gMes_${g.key}"></canvas></div></div>
        <div class="g-card"><div class="g-h">Por macro estado</div><div class="chart-box" style="height:190px"><canvas id="gMacro_${g.key}"></canvas></div></div>
        <div class="g-card"><div class="g-h">Estado de avance en gestión</div><div class="chart-box" style="height:190px"><canvas id="gAvance_${g.key}"></canvas></div></div>
        <div class="g-card"><div class="g-h">Por categoría de operación</div><div class="chart-box" style="height:210px"><canvas id="gCat_${g.key}"></canvas></div></div>
      </div></div>`;
    }
    h+=`</div>`;
  });
  h+=`<div class="g-nota">La gestión “Atrasado” es mayor estricto a 30 días. Haz clic en cada compañía para desplegar sus gráficas. El año aplica a todas.</div>`;
  cont.innerHTML=h;

  _destroyCharts();
  GRUPOS.filter(g=>REC.gOpen.has(g.key)).forEach(g=>drawGrupo(g.key, recStatsGrupo(g.cia, anio), anio));
}

function _destroyCharts(){ (window._recCharts||[]).forEach(c=>{ try{c.destroy();}catch(e){} }); window._recCharts=[]; }
function _reg(c){ (window._recCharts=window._recCharts||[]).push(c); return c; }

function drawGrupo(key, s, anio){
  if(typeof Chart==='undefined'){ toast('No se pudo cargar Chart.js','err'); return; }
  Chart.defaults.font.family="'Barlow',sans-serif"; Chart.defaults.font.size=12; Chart.defaults.color='#475259';
  const hBar={indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
    scales:{x:{beginAtZero:true,ticks:{precision:0}},y:{grid:{display:false}}}};
  const $=id=>document.getElementById(id+'_'+key);

  const donutEl=$('gAnio');
  if(donutEl && s.allYearsCia.length){ const ys=s.allYearsCia, yc=ys.map(y=>s.porAnio[y]);
    _reg(new Chart(donutEl,{type:'doughnut',
      data:{labels:ys,datasets:[{data:yc,backgroundColor:[G_TEALDK,G_TEAL,G_GOLD,G_GRAY,'#9BB0B5','#C8D2D5']}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'60%',plugins:{legend:{position:'bottom'}}}})); }

  const mcolors=[G_TEALDK,G_TEAL,G_GOLD,G_GRAY,'#9BB0B5'];
  _reg(new Chart($('gMes'),{type:'bar',
    data:{labels:MESES,datasets:s.monthYears.map((y,i)=>({label:y,data:s.monthly[y],backgroundColor:mcolors[i%mcolors.length],borderRadius:3}))},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:s.monthYears.length>1,position:'bottom'}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,ticks:{precision:0}}}}}));

  const macL=Object.keys(s.macro).sort((a,b)=>s.macro[b]-s.macro[a]);
  const macColor=l=>/en gesti/i.test(l)?G_TEAL:/detenid/i.test(l)?G_GOLD:/resoluci/i.test(l)?G_TEALDK:G_GRAY;
  _reg(new Chart($('gMacro'),{type:'bar',
    data:{labels:macL,datasets:[{data:macL.map(l=>s.macro[l]),backgroundColor:macL.map(macColor),borderRadius:3}]},options:hBar}));

  const avL=['Apelado','En Curso','Atrasado'];
  _reg(new Chart($('gAvance'),{type:'bar',
    data:{labels:avL,datasets:[{data:avL.map(l=>s.avance[l]),backgroundColor:[G_TEALDK,G_TEAL,G_RED],borderRadius:3}]},options:hBar}));

  const catL=Object.keys(s.categoria).sort((a,b)=>s.categoria[b]-s.categoria[a]);
  _reg(new Chart($('gCat'),{type:'bar',
    data:{labels:catL,datasets:[{data:catL.map(l=>s.categoria[l]),backgroundColor:catL.map(l=>/tu voz/i.test(l)?G_TEALDK:G_TEAL),borderRadius:3}]},options:hBar}));
}
