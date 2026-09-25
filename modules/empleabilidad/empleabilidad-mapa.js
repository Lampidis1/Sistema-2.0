// ═══════════════════════════════════════════════════════════════════════════
// empleabilidad-mapa.js — Dashboard con mapa de operativos (Fase 5)
// Sistema AM · Antofagasta Minerals
//
// Mapa de la Región de Antofagasta (motor propio MapaAM, sin tiles). Cada
// OPERATIVO del móvil es un punto; el pin muestra cuántas personas se atendieron
// ahí en el rango de tiempo elegido (día/semana/mes/año/todo). Al ALEJAR (ver la
// región completa) los pines se agrupan por CIUDAD/comuna (valor combinado); al
// ACERCAR se separan por operativo. Al hacer clic en un pin: ficha con hombres/
// mujeres, servicios realizados y desglose por comuna.
//
// Reutiliza globales de Empleabilidad (SB, esc, toast) y shared/js/mapa.js.
// <script src> clásico, nunca type="module" (CLAUDE.md §6). Prefijo map/EM.
// ═══════════════════════════════════════════════════════════════════════════

let EM = { operativos:[], atenciones:[], base:null, mapa:null, filtro:'mes', ref:null, modo:'', thresh:2500, cargado:false };
const EM_FLABEL={dia:'Día',semana:'Semana',mes:'Mes',anio:'Año',todo:'Todo'};
function emHoy(){ const d=new Date(); d.setHours(0,0,0,0); return d; }
function emRef(){ if(!EM.ref) EM.ref=emHoy(); return EM.ref; }
function emYmd(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function emSemana(r){ const a=new Date(r); const dow=(a.getDay()+6)%7; a.setDate(a.getDate()-dow); a.setHours(0,0,0,0); const b=new Date(a); b.setDate(a.getDate()+7); return [a,b]; } // lunes→lunes

async function mapRender(){
  const cont=document.getElementById('page-mapa'); if(!cont) return;
  cont.innerHTML=`
    <div class="em-head">
      <div class="em-title">🗺 Mapa de operativos del móvil</div>
      <div id="emFiltros" class="em-filtros"></div>
    </div>
    <div class="em-rango" id="emRango"></div>
    <div class="em-kpis" id="emKpis"></div>
    <div class="em-wrap">
      <div id="emMapa" class="em-mapa"></div>
      <div id="emLista" class="em-lista"></div>
    </div>
    <div id="emFicha"></div>`;
  if(!EM.cargado){ document.getElementById('emLista').innerHTML='<div class="em-nota">Cargando…</div>'; await mapCargar(); }
  await mapInit();
  mapFiltrosRender();
}
async function mapCargar(){
  try{
    const [op,at,base]=await Promise.all([
      SB.from('operativos').select('*').neq('estado','Eliminado').order('created_at',{ascending:false}),
      SB.from('atenciones').select('operativo_id,comuna,sexo,apresto,intermediacion,formacion,nivel_estudios,created_at').neq('estado_registro','Eliminado'),
      MapaAM.cargar({comunas:'../../shared/assets/geo/comunas-antofagasta.geojson?v=20260925b',
                     localidades:'../../shared/assets/geo/localidades-antofagasta.geojson?v=20260925b'})
    ]);
    EM.operativos=(op.data||[]).filter(o=>o.lat!=null&&o.lng!=null);
    EM.atenciones=(at.data||[]).filter(a=>a.operativo_id);
    EM.base=base;
    EM.cargado=true;
  }catch(e){ toast('Error al cargar el mapa: '+(e.message||e),'err'); }
}

// ── filtro de tiempo (con fecha de referencia + navegación) ──────────────────
function mapEnRango(iso){
  if(EM.filtro==='todo') return true;
  const d=new Date(iso); if(isNaN(d)) return false;
  const r=emRef();
  if(EM.filtro==='dia')   return d.getFullYear()===r.getFullYear()&&d.getMonth()===r.getMonth()&&d.getDate()===r.getDate();
  if(EM.filtro==='semana'){ const [a,b]=emSemana(r); return d>=a && d<b; }
  if(EM.filtro==='mes')   return d.getFullYear()===r.getFullYear()&&d.getMonth()===r.getMonth();
  if(EM.filtro==='anio')  return d.getFullYear()===r.getFullYear();
  return true;
}
function mapRangoTxt(){
  const r=emRef();
  if(EM.filtro==='todo')  return 'Todo el historial';
  if(EM.filtro==='dia')   return r.toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  if(EM.filtro==='semana'){ const [a,b]=emSemana(r); const fin=new Date(b-86400000);
    return 'Semana del '+a.getDate()+' al '+fin.toLocaleDateString('es-CL',{day:'numeric',month:'long',year:'numeric'}); }
  if(EM.filtro==='mes')   return r.toLocaleDateString('es-CL',{month:'long',year:'numeric'});
  if(EM.filtro==='anio')  return String(r.getFullYear());
  return '';
}
function mapFiltrosRender(){
  const el=document.getElementById('emFiltros'); if(!el) return;
  const r=emRef();
  el.innerHTML=`
    ${Object.keys(EM_FLABEL).map(f=>`<button class="em-fbtn ${EM.filtro===f?'on':''}" onclick="mapFiltro('${f}')">${EM_FLABEL[f]}</button>`).join('')}
    ${EM.filtro!=='todo'?`
      <span class="em-nav">
        <button class="em-arrow" onclick="mapNav(-1)" title="Anterior">‹</button>
        <input type="date" class="em-date" value="${emYmd(r)}" onchange="mapFecha(this.value)">
        <button class="em-arrow" onclick="mapNav(1)" title="Siguiente">›</button>
      </span>
      <button class="em-hoy" onclick="mapHoy()">Hoy</button>`:''}`;
  const rg=document.getElementById('emRango'); if(rg) rg.innerHTML=`📅 <b>${esc(mapRangoTxt())}</b>`;
}
function mapFiltro(f){ EM.filtro=f; if(!EM.ref) EM.ref=emHoy(); mapFiltrosRender(); mapPintar(); }
function mapFecha(v){ const d=new Date(v+'T00:00:00'); if(!isNaN(d)){ EM.ref=d; mapFiltrosRender(); mapPintar(); } }
function mapHoy(){ EM.ref=emHoy(); mapFiltrosRender(); mapPintar(); }
function mapNav(dir){
  const r=new Date(emRef());
  if(EM.filtro==='dia')    r.setDate(r.getDate()+dir);
  else if(EM.filtro==='semana') r.setDate(r.getDate()+7*dir);
  else if(EM.filtro==='mes')    r.setMonth(r.getMonth()+dir);
  else if(EM.filtro==='anio')   r.setFullYear(r.getFullYear()+dir);
  EM.ref=r; mapFiltrosRender(); mapPintar();
}

// atenciones vigentes según filtro, con su operativo resuelto
function mapAtenciones(){
  const opById={}; EM.operativos.forEach(o=>opById[o.operativo_id]=o);
  return EM.atenciones.filter(a=>opById[a.operativo_id] && mapEnRango(a.created_at)).map(a=>({...a, _op:opById[a.operativo_id]}));
}

// Ciudades con calles vectorizadas (GeoJSON del repo). Se cargan por DEMANDA al
// hacer zoom en la ciudad (evita bajar ~1.5 MB al abrir el dashboard).
const EM_CIUDADES=[
  {slug:'antofagasta',  lng:-70.3980, lat:-23.6464, file:'calles-antofagasta.geojson'},
  {slug:'calama',       lng:-68.9272, lat:-22.4624, file:'calles-calama.geojson'},
  {slug:'tocopilla',    lng:-70.1979, lat:-22.0920, file:'calles-tocopilla.geojson'},
  {slug:'mejillones',   lng:-70.4483, lat:-23.1002, file:'calles-mejillones.geojson'},
  {slug:'peine',        lng:-68.0617, lat:-23.6836, file:'calles-peine.geojson'},
  {slug:'baquedano',    lng:-69.8435, lat:-23.3338, file:'calles-baquedano.geojson'},
  {slug:'sierra-gorda', lng:-69.3202, lat:-22.8915, file:'sierra-gorda-calles.geojson'}
];
EM.calles = EM.calles || {};

async function mapInit(){
  const cont=document.getElementById('emMapa'); if(!cont) return;
  if(EM.mapa){ try{EM.mapa.destroy();}catch(e){} EM.mapa=null; }
  EM.mapa=MapaAM.crear(cont, { onPinClick:mapFicha, onView:mapOnView });
  EM.baseObj={ poligonos:[EM.base&&EM.base.comunas].filter(Boolean), lineas:[],
    puntos:[EM.base&&EM.base.localidades].filter(Boolean),
    estilos:{fondo:'#eef3f2', poligonoFill:'rgba(0,163,153,.08)', poligonoStroke:'rgba(0,105,115,.35)', poligonoW:1,
             lineaStroke:'#c2ccca', lineaW:1,
             puntoColor:'#7a8790', puntoR:2.6, puntoLabelColor:'#3a4550', puntoFont:'11px system-ui,sans-serif', puntoHalo:'rgba(238,243,242,.9)',
             puntoLabelSiempre:['Ciudad','Pueblo']} };
  EM.mapa.setBase(EM.baseObj);
  EM.mapa.fit(30);
  const b=EM.mapa.bounds(); if(b){ EM.mapa.setLimites(b,{minMult:0.9, maxPpd:400000}); EM.thresh=EM.mapa.minppd*3.2; }
  // Al alejar solo ciudades/pueblos rotulados y sin calles; al acercar, todo.
  EM.baseObj.estilos.puntoLabelMinPpd=EM.thresh;
  EM.baseObj.estilos.lineaMinPpd=EM.thresh*1.4;
  EM.modo=''; mapPintar();
}
function mapOnView(m){
  const nuevo = m.view.ppd < EM.thresh ? 'comuna' : 'operativo';
  if(nuevo!==EM.modo){ EM.modo=nuevo; mapPintar(false); }
  // Carga diferida de calles de la ciudad cuando se hace zoom en ella.
  if(m.view.ppd >= EM.thresh){
    const c=mapCiudadCercana(m.view.cx, m.view.cy);
    if(c && !EM.calles[c.slug]) mapCargarCalles(c);
  }
}
function mapCiudadCercana(lng,lat){
  let best=null, bd=0.4; // ~40 km de radio
  EM_CIUDADES.forEach(c=>{ const d=Math.hypot((c.lng-lng)*Math.cos(lat*Math.PI/180), c.lat-lat); if(d<bd){ bd=d; best=c; } });
  return best;
}
async function mapCargarCalles(c){
  EM.calles[c.slug]='cargando';
  try{
    const r=await fetch('../../shared/assets/geo/'+c.file+'?v=20260925');
    if(!r.ok) throw new Error('HTTP '+r.status);
    const gj=await r.json();
    EM.calles[c.slug]=gj;
    if(EM.baseObj && EM.mapa){ EM.baseObj.lineas.push(gj); EM.mapa.setBase(EM.baseObj); }
  }catch(e){ EM.calles[c.slug]='error'; }
}

// ── pintar pines + lista + KPIs ──────────────────────────────────────────────
function mapPintar(refit){
  if(!EM.mapa) return;
  const ats=mapAtenciones();
  EM.modo = EM.modo || (EM.mapa.view.ppd < EM.thresh ? 'comuna':'operativo');
  let pines=[], grupos=[];
  if(EM.modo==='comuna'){
    const g={};
    ats.forEach(a=>{ const c=a.comuna||a._op.comuna||'Sin comuna';
      (g[c]=g[c]||{comuna:c, n:0, lat:0, lng:0, ats:[]}); g[c].n++; g[c].lat+=a._op.lat; g[c].lng+=a._op.lng; g[c].ats.push(a); });
    grupos=Object.values(g).map(x=>({...x, lat:x.lat/x.n, lng:x.lng/x.n}));
    pines=grupos.map((x,i)=>({id:'c'+i, lat:x.lat, lng:x.lng, label:x.n, r:mapR(x.n), color:'#00A399', data:{tipo:'comuna',g:x}}));
  }else{
    const g={};
    ats.forEach(a=>{ const id=a.operativo_id; (g[id]=g[id]||{op:a._op, n:0, ats:[]}); g[id].n++; g[id].ats.push(a); });
    grupos=Object.values(g);
    pines=grupos.map((x,i)=>({id:'o'+i, lat:x.op.lat, lng:x.op.lng, label:x.n, r:mapR(x.n), color:'#5b4fcf', data:{tipo:'operativo',g:x}}));
  }
  EM.mapa.setPines(pines);
  if(refit!==false && grupos.length){ /* no re-encuadrar en cada modo para no marear */ }
  mapKpis(ats);
  mapLista(grupos);
}
function mapR(n){ return Math.max(11, Math.min(26, 9+Math.round(Math.sqrt(n)*3))); }
function mapKpis(ats){
  const el=document.getElementById('emKpis'); if(!el) return;
  const h=ats.filter(a=>/^m/i.test(a.sexo||'')).length, m=ats.filter(a=>/^f/i.test(a.sexo||'')).length;
  const ap=ats.filter(a=>a.apresto).length, it=ats.filter(a=>a.intermediacion).length, fo=ats.filter(a=>a.formacion).length;
  el.innerHTML=`
    <div class="em-kpi"><b>${ats.length}</b><span>Atenciones (${EM_FLABEL[EM.filtro]})</span></div>
    <div class="em-kpi"><b>${new Set(ats.map(a=>a.operativo_id)).size}</b><span>Puntos</span></div>
    <div class="em-kpi"><b>${h}/${m}</b><span>Hombres / Mujeres</span></div>
    <div class="em-kpi"><b>${ap}</b><span>Apresto</span></div>
    <div class="em-kpi"><b>${it}</b><span>Intermediación</span></div>
    <div class="em-kpi"><b>${fo}</b><span>Formación</span></div>`;
}
function mapLista(grupos){
  const el=document.getElementById('emLista'); if(!el) return;
  const ord=grupos.slice().sort((a,b)=>b.n-a.n);
  el.innerHTML=`<div class="em-lista-t">${EM.modo==='comuna'?'Por ciudad / comuna':'Por punto de atención'} · ${EM_FLABEL[EM.filtro]}</div>`+
    (!ord.length?'<div class="em-nota">Sin atenciones en este rango. Cambia el filtro de tiempo.</div>'
    : ord.map(x=>{
        const nom=EM.modo==='comuna'?x.comuna:((x.op.lugar?x.op.lugar+' · ':'')+(x.op.comuna||''));
        return `<div class="em-row"><div>${esc(nom||'—')}</div><b>${x.n}</b></div>`;
      }).join(''));
  // enlazar cada fila a su grupo para abrir la ficha (sin serializar en el HTML)
  [...el.querySelectorAll('.em-row')].forEach((r,i)=>{ r.onclick=()=>mapFichaGrupo(ord[i]); });
}

// ── ficha del pin / fila ─────────────────────────────────────────────────────
function mapFicha(pin){ if(pin&&pin.data&&pin.data.g) mapFichaGrupo(pin.data.g); }
function mapFichaGrupo(g){
  const ats=g.ats||[];
  const nom = g.comuna || ((g.op&&g.op.lugar?g.op.lugar+' · ':'')+((g.op&&g.op.comuna)||'')) || 'Punto';
  const h=ats.filter(a=>/^m/i.test(a.sexo||'')).length, m=ats.filter(a=>/^f/i.test(a.sexo||'')).length, sx=ats.length-h-m;
  const ap=ats.filter(a=>a.apresto).length, it=ats.filter(a=>a.intermediacion).length, fo=ats.filter(a=>a.formacion).length;
  const pct=n=>ats.length?Math.round(n/ats.length*100):0;
  const porComuna={}; ats.forEach(a=>{const c=a.comuna||(a._op&&a._op.comuna)||'—';porComuna[c]=(porComuna[c]||0)+1;});
  const el=document.getElementById('emFicha');
  el.innerHTML=`<div class="em-ov" onmousedown="if(event.target===this)mapCerrarFicha()"><div class="em-fbox">
    <div class="em-fh"><div>📍 ${esc(nom)}</div><button onclick="mapCerrarFicha()">✕</button></div>
    <div class="em-fkpis">
      <div><b>${ats.length}</b><span>Atenciones</span></div>
      <div><b>${h}</b><span>Hombres</span></div>
      <div><b>${m}</b><span>Mujeres</span></div>
      ${sx?`<div><b>${sx}</b><span>Otro/ND</span></div>`:''}
    </div>
    <div class="em-fsec">Servicios realizados</div>
    <div class="em-fbars">
      ${mapBar('Apresto',ap,pct(ap),'#1e7e34')}
      ${mapBar('Intermediación',it,pct(it),'#5b4fcf')}
      ${mapBar('Formación',fo,pct(fo),'#F2A900')}
    </div>
    ${Object.keys(porComuna).length>1?`<div class="em-fsec">Por comuna de la persona</div>
      <div class="em-fcom">${Object.entries(porComuna).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`<span>${esc(c)}: <b>${n}</b></span>`).join('')}</div>`:''}
  </div></div>`;
}
function mapBar(t,n,pc,col){ return `<div class="em-bar"><div class="em-bar-l">${t}</div>
  <div class="em-bar-t"><div class="em-bar-in" style="width:${pc}%;background:${col}"></div></div>
  <div class="em-bar-v">${n} · ${pc}%</div></div>`; }
function mapCerrarFicha(){ const el=document.getElementById('emFicha'); if(el) el.innerHTML=''; }
