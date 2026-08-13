// ═══════════════════════════════════════════════════════════════════════════
// proveedores-dashboard.js — Dashboard de gestión (para gerencia)
// Sistema AM · Antofagasta Minerals
//
// Responde una sola pregunta: ¿QUÉ HIZO EL EQUIPO en el período?
// Por eso es visual: se lee de un vistazo, sin listas que haya que recorrer.
//
// El dashboard anterior contaba el estado de la BASE (cuántos proveedores hay,
// de qué rubro). Eso no es gestión: es inventario. Acá se mide actividad —
// visitas, compromisos, contratos, cobertura — sobre una línea de tiempo.
//
// Usa Chart.js, que ya venía cargado en el módulo. Se carga DESPUÉS de
// proveedores.js: usa PROVEEDORES, DB, SUPA y esc, que son globales.
// Nunca type="module" (CLAUDE.md §6).
// ═══════════════════════════════════════════════════════════════════════════

let DASH_PERIODO = '12m';        // 12m | anio | todo
let DASH_CHARTS = [];            // instancias vivas, para destruirlas al repintar
let DASH_DATOS = null;           // {visitas, compromisos} traídos de la base

const DASH_MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const DASH_COLOR = {
  teal:'#00A399', tealDk:'#006973', oro:'#F2A900', verde:'#1a7a38',
  rojo:'#c0392b', gris:'#9aa3af', azul:'#2563eb', morado:'#5b4fcf',
};

async function renderDashboard(){
  const cont = document.getElementById('dashboardContent');
  if(!cont) return;
  if(!SUPA.client){
    cont.innerHTML = '<div class="dash-vacio">Inicia sesión para ver la gestión del equipo.</div>';
    return;
  }
  if(!DASH_DATOS){
    cont.innerHTML = '<div class="dash-vacio">Cargando gestión…</div>';
    try{
      const [v,c] = await Promise.all([
        SUPA.client.from('visitas').select('visita_id,fecha,responsable_nombre,faena,comuna,proveedor_id,origen_plataforma').neq('estado_registro','Eliminado'),
        SUPA.client.from('visita_compromisos').select('compromiso_id,visita_id,cerrado,fecha_limite,responsable'),
      ]);
      if(v.error) throw v.error;
      DASH_DATOS = { visitas: v.data||[], compromisos: c.data||[] };
    }catch(e){
      cont.innerHTML = '<div class="dash-vacio">No se pudo cargar: '+esc(e.message)+'</div>';
      return;
    }
  }
  dashPintar();
}

function dashSetPeriodo(p){ DASH_PERIODO = p; dashPintar(); }

// Rango de meses a mostrar, del más antiguo al más nuevo.
function dashRango(){
  const hoy = new Date();
  if(DASH_PERIODO==='anio'){
    return Array.from({length: hoy.getMonth()+1}, (_,i)=>({y:hoy.getFullYear(), m:i}));
  }
  if(DASH_PERIODO==='12m'){
    return Array.from({length:12}, (_,i)=>{
      const d = new Date(hoy.getFullYear(), hoy.getMonth()-11+i, 1);
      return {y:d.getFullYear(), m:d.getMonth()};
    });
  }
  // todo: desde la primera visita registrada
  const fechas = DASH_DATOS.visitas.map(v=>v.fecha).filter(Boolean).sort();
  if(!fechas.length) return [{y:hoy.getFullYear(), m:hoy.getMonth()}];
  const [ay,am] = fechas[0].split('-').map(Number);
  const out=[]; let d=new Date(ay, am-1, 1);
  while(d <= hoy){ out.push({y:d.getFullYear(), m:d.getMonth()}); d=new Date(d.getFullYear(), d.getMonth()+1, 1); }
  return out;
}
const dashClave = r => r.y+'-'+String(r.m+1).padStart(2,'0');

function dashVisitasDelPeriodo(){
  const claves = new Set(dashRango().map(dashClave));
  return DASH_DATOS.visitas.filter(v => v.fecha && claves.has(String(v.fecha).slice(0,7)));
}

function dashPintar(){
  DASH_CHARTS.forEach(c=>{ try{ c.destroy(); }catch(e){} });
  DASH_CHARTS = [];

  const rango = dashRango();
  const visitas = dashVisitasDelPeriodo();
  const idsVis = new Set(visitas.map(v=>v.visita_id));
  const comps = DASH_DATOS.compromisos.filter(c=>idsVis.has(c.visita_id));
  const hoyISO = new Date().toISOString().slice(0,10);

  const cerrados = comps.filter(c=>c.cerrado).length;
  const vencidos = comps.filter(c=>!c.cerrado && c.fecha_limite && c.fecha_limite < hoyISO).length;
  const abiertos = comps.length - cerrados - vencidos;
  const pctComp  = comps.length ? Math.round(cerrados/comps.length*100) : 0;

  // contratos vigentes hoy
  const acuerdos = Object.values(DB.acuerdos||{}).flat();
  const vigentes = acuerdos.filter(a=>{
    const f = a.fecha_fin || a.fin;
    return !f || f >= hoyISO;
  });
  const monto = vigentes.reduce((s,a)=>s+(+a.monto_clp||+a.monto||0),0);

  const provVisitados = new Set(visitas.map(v=>v.proveedor_id).filter(Boolean)).size;
  const mesesConVisita = new Set(visitas.map(v=>String(v.fecha).slice(0,7))).size;
  const promMes = mesesConVisita ? (visitas.length/mesesConVisita).toFixed(1) : '0';

  const cont = document.getElementById('dashboardContent');
  cont.innerHTML = `
    <div class="dash-top">
      <div>
        <div class="dash-h1">Gestión del equipo de Proveedores</div>
        <div class="dash-h2">${dashEtiquetaPeriodo(rango)}</div>
      </div>
      <div class="dash-per">
        ${[['12m','Últimos 12 meses'],['anio','Este año'],['todo','Todo']]
          .map(([k,t])=>`<button class="dash-per-b ${DASH_PERIODO===k?'active':''}" onclick="dashSetPeriodo('${k}')">${t}</button>`).join('')}
      </div>
    </div>

    <div class="dash-hero">
      ${dashTarjeta('🗓️', visitas.length, 'Visitas realizadas', promMes+' por mes en promedio', DASH_COLOR.tealDk)}
      ${dashTarjeta('✅', pctComp+'%', 'Compromisos cumplidos', cerrados+' de '+comps.length, pctComp>=80?DASH_COLOR.verde:pctComp>=50?DASH_COLOR.oro:DASH_COLOR.rojo)}
      ${dashTarjeta('🤝', provVisitados, 'Proveedores visitados', 'de '+PROVEEDORES.filter(p=>p.estado!=='Eliminado').length+' en la base', DASH_COLOR.azul)}
      ${dashTarjeta('📄', vigentes.length, 'Contratos vigentes', monto?_clp(monto):'sin monto cargado', DASH_COLOR.morado)}
    </div>

    <div class="dash-card dash-ancho">
      <div class="dash-card-t">Ritmo de trabajo · visitas por mes</div>
      <div class="dash-chart" style="height:230px"><canvas id="dashRitmo"></canvas></div>
    </div>

    <div class="dash-fila">
      <div class="dash-card">
        <div class="dash-card-t">Aporte por especialista</div>
        <div class="dash-chart" style="height:230px"><canvas id="dashEquipo"></canvas></div>
      </div>
      <div class="dash-card">
        <div class="dash-card-t">Estado de los compromisos</div>
        <div class="dash-chart" style="height:230px"><canvas id="dashComp"></canvas></div>
        ${vencidos ? `<div class="dash-alerta">⚠ ${vencidos} compromiso(s) vencido(s) sin cerrar</div>` : ''}
      </div>
    </div>

    <div class="dash-fila">
      <div class="dash-card">
        <div class="dash-card-t">Cobertura territorial · visitas por localidad</div>
        <div class="dash-chart" style="height:250px"><canvas id="dashTerritorio"></canvas></div>
      </div>
      <div class="dash-card">
        <div class="dash-card-t">Avance de estandarización</div>
        <div id="dashEst" class="dash-est"></div>
      </div>
    </div>`;

  dashChartRitmo(rango, visitas);
  dashChartEquipo(visitas);
  dashChartCompromisos(cerrados, abiertos, vencidos);
  dashChartTerritorio(visitas);
  dashEstandarizacion();
}

function dashTarjeta(ico, valor, titulo, sub, color){
  return `<div class="dash-hero-c">
    <div class="dash-hero-ico">${ico}</div>
    <div class="dash-hero-n" style="color:${color}">${valor}</div>
    <div class="dash-hero-t">${titulo}</div>
    <div class="dash-hero-s">${esc(String(sub))}</div>
  </div>`;
}
function dashEtiquetaPeriodo(rango){
  if(!rango.length) return '';
  const a=rango[0], b=rango[rango.length-1];
  return DASH_MESES[a.m]+' '+a.y+' — '+DASH_MESES[b.m]+' '+b.y;
}

// ── GRÁFICOS ────────────────────────────────────────────────────────────────
// Barras por mes: se ve de una si el trabajo es constante o a tirones.
function dashChartRitmo(rango, visitas){
  const conteo = {};
  visitas.forEach(v=>{ const k=String(v.fecha).slice(0,7); conteo[k]=(conteo[k]||0)+1; });
  const datos = rango.map(r=>conteo[dashClave(r)]||0);
  const prom = datos.length ? datos.reduce((a,b)=>a+b,0)/datos.length : 0;

  DASH_CHARTS.push(new Chart(document.getElementById('dashRitmo'), {
    type:'bar',
    data:{
      labels: rango.map(r=>DASH_MESES[r.m]+(rango.length>12?' '+String(r.y).slice(2):'')),
      datasets:[
        { label:'Visitas', data:datos, backgroundColor:DASH_COLOR.teal, borderRadius:6, maxBarThickness:44 },
        { label:'Promedio', data:rango.map(()=>prom), type:'line', borderColor:DASH_COLOR.oro,
          borderWidth:2, borderDash:[6,4], pointRadius:0, fill:false },
      ],
    },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:true, position:'bottom', labels:{boxWidth:12,font:{size:11}} } },
      scales:{ y:{ beginAtZero:true, ticks:{precision:0} }, x:{ grid:{display:false} } } },
  }));
}

// Cuánto puso cada especialista. Barras horizontales: los nombres se leen.
function dashChartEquipo(visitas){
  const porPersona = {};
  visitas.forEach(v=>{ const n=(v.responsable_nombre||'Sin asignar').trim()||'Sin asignar';
    porPersona[n]=(porPersona[n]||0)+1; });
  const orden = Object.keys(porPersona).sort((a,b)=>porPersona[b]-porPersona[a]).slice(0,8);

  DASH_CHARTS.push(new Chart(document.getElementById('dashEquipo'), {
    type:'bar',
    data:{ labels:orden, datasets:[{ data:orden.map(n=>porPersona[n]),
      backgroundColor:DASH_COLOR.tealDk, borderRadius:5, maxBarThickness:26 }] },
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false} },
      scales:{ x:{ beginAtZero:true, ticks:{precision:0} }, y:{ grid:{display:false} } } },
  }));
}

function dashChartCompromisos(cerrados, abiertos, vencidos){
  DASH_CHARTS.push(new Chart(document.getElementById('dashComp'), {
    type:'doughnut',
    data:{ labels:['Cumplidos','Abiertos','Vencidos'],
      datasets:[{ data:[cerrados,abiertos,vencidos],
        backgroundColor:[DASH_COLOR.verde,DASH_COLOR.oro,DASH_COLOR.rojo], borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'62%',
      plugins:{ legend:{position:'bottom', labels:{boxWidth:12,font:{size:11}}} } },
  }));
}

// Dónde estuvo el equipo. Responde «¿hay localidades desatendidas?».
function dashChartTerritorio(visitas){
  const porLoc = {};
  visitas.forEach(v=>{
    let loc = (v.comuna||'').trim();
    if(!loc){ const p=PROVEEDORES.find(x=>x._id===v.proveedor_id); loc=(p&&p.localidad)||'Sin localidad'; }
    porLoc[loc]=(porLoc[loc]||0)+1;
  });
  const orden = Object.keys(porLoc).sort((a,b)=>porLoc[b]-porLoc[a]).slice(0,10);
  DASH_CHARTS.push(new Chart(document.getElementById('dashTerritorio'), {
    type:'bar',
    data:{ labels:orden, datasets:[{ data:orden.map(l=>porLoc[l]),
      backgroundColor:DASH_COLOR.azul, borderRadius:5, maxBarThickness:24 }] },
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false} },
      scales:{ x:{ beginAtZero:true, ticks:{precision:0} }, y:{ grid:{display:false} } } },
  }));
}

// Barras de avance por rubro: no es un gráfico, pero se lee igual de rápido.
function dashEstandarizacion(){
  const cont = document.getElementById('dashEst');
  if(typeof EST2==='undefined' || !EST2.loaded){
    cont.innerHTML = '<div class="dash-sinest">Abre Estandarización una vez para cargar los criterios.</div>';
    return;
  }
  const rubros = ['Hotelería','Lavandería','Alimentación'];
  cont.innerHTML = rubros.map(r=>{
    const provs = PROVEEDORES.filter(p=>p.estado!=='Eliminado'
      && (typeof rubrosHabitabilidad==='function' ? rubrosHabitabilidad(p).includes(r) : false));
    if(!provs.length) return '';
    const pct = Math.round(provs.reduce((a,p)=>a+estPctProveedor(p._id,r),0)/provs.length);
    const col = pct>=80?DASH_COLOR.verde:pct>=50?DASH_COLOR.oro:DASH_COLOR.rojo;
    return `<div class="dash-est-i">
      <div class="dash-est-h"><span>${r}</span><b style="color:${col}">${pct}%</b></div>
      <div class="dash-est-b"><div class="dash-est-in" style="width:${pct}%;background:${col}"></div></div>
      <div class="dash-est-s">${provs.length} proveedor(es)</div>
    </div>`;
  }).join('') || '<div class="dash-sinest">Sin proveedores en los rubros de habitabilidad.</div>';
}
