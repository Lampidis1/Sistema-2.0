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

function renderInforme(cont){
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
    <div class="spacer"></div>
    <button class="btn ${REC.editMode?'on':''}" onclick="recToggleEdit()">${REC.editMode?'✓ Listo':'🗑 Eliminar filas'}</button>
    <button class="btn primary" onclick="recCopiar()">⧉ Copiar tabla</button>
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
