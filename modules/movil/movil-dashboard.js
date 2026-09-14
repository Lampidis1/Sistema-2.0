// ═══════════════════════════════════════════════════════════════════════════
// movil-dashboard.js — Dashboard de atenciones (reemplaza la ventana Cuestionario)
// Sistema AM · Antofagasta Minerals
//
// Lee la tabla `atenciones` (una fila por recepción, con día/hora automáticos).
// Muestra totales, por comuna, por sexo, por servicio (apresto/intermediación/
// formación) con %, combinaciones, y un gráfico de barra/línea donde X SIEMPRE
// es el tiempo (día/semana/mes/año) y las series se eligen (servicio/comuna/sexo).
//
// Usa Chart.js (CDN) + globales del Móvil (SB, esc, toast). Prefijo db/DB.
// <script src> clásico, nunca type="module" (CLAUDE.md §6).
// ═══════════════════════════════════════════════════════════════════════════

let DB = { atenciones:[], loaded:false, rango:'mes', cruce:'servicio', tipo:'bar', chart:null };

async function dbRender(){
  const cont=document.getElementById('page-cuestionario'); if(!cont) return;
  if(!DB.loaded){ cont.innerHTML='<div class="card"><div class="q-help">Cargando dashboard…</div></div>'; await dbCargar(); }
  dbPintar();
}
async function dbCargar(){
  try{ const {data,error}=await SB.from('atenciones').select('*').neq('estado_registro','Eliminado').order('created_at',{ascending:true});
    if(error) throw error; DB.atenciones=data||[]; DB.loaded=true;
  }catch(e){ DB.atenciones=[]; toast('Error al cargar dashboard: '+e.message,'err'); }
}
const _pc=(n,t)=>t>0?Math.round(n/t*100):0;

function dbPintar(){
  const A=DB.atenciones, t=A.length;
  const comp=A.filter(a=>a.cuestionario_completo).length;
  const ap=A.filter(a=>a.apresto).length, im=A.filter(a=>a.intermediacion).length, fo=A.filter(a=>a.formacion).length;
  // combinaciones de servicios
  const combo={}; A.forEach(a=>{ const k=[a.apresto&&'Apresto',a.intermediacion&&'Intermediación',a.formacion&&'Formación'].filter(Boolean).join(' + ')||'Sin servicio'; combo[k]=(combo[k]||0)+1; });
  const los3=A.filter(a=>a.apresto&&a.intermediacion&&a.formacion).length;
  const porComuna=dbAgrupar(A,a=>a.comuna||'Sin comuna');
  const porSexo=dbAgrupar(A,a=>a.sexo||'Sin dato');

  const cont=document.getElementById('page-cuestionario');
  cont.innerHTML=`
    <div class="card">
      <div class="sec-t">📊 Dashboard de atenciones</div>
      <div class="db-kpis">
        <div class="db-kpi"><b>${t}</b><span>Atenciones</span></div>
        <div class="db-kpi"><b>${comp}</b><span>Cuestionarios completos<br>(${_pc(comp,t)}%)</span></div>
        <div class="db-kpi"><b>${ap}</b><span>Apresto (${_pc(ap,t)}%)</span></div>
        <div class="db-kpi"><b>${im}</b><span>Intermediación (${_pc(im,t)}%)</span></div>
        <div class="db-kpi"><b>${fo}</b><span>Formación (${_pc(fo,t)}%)</span></div>
        <div class="db-kpi"><b>${los3}</b><span>Los 3 (${_pc(los3,t)}%)</span></div>
      </div>
    </div>

    <div class="card">
      <div class="sec-t">Evolución en el tiempo</div>
      <div class="db-controls">
        <label>Cruzar por
          <select id="dbCruce" onchange="DB.cruce=this.value;dbChart()">
            <option value="servicio" ${DB.cruce==='servicio'?'selected':''}>Servicio</option>
            <option value="comuna" ${DB.cruce==='comuna'?'selected':''}>Comuna</option>
            <option value="sexo" ${DB.cruce==='sexo'?'selected':''}>Sexo</option>
            <option value="total" ${DB.cruce==='total'?'selected':''}>Total</option>
          </select></label>
        <label>Rango
          <select id="dbRango" onchange="DB.rango=this.value;dbChart()">
            <option value="dia" ${DB.rango==='dia'?'selected':''}>Día</option>
            <option value="semana" ${DB.rango==='semana'?'selected':''}>Semana</option>
            <option value="mes" ${DB.rango==='mes'?'selected':''}>Mes</option>
            <option value="anio" ${DB.rango==='anio'?'selected':''}>Año</option>
          </select></label>
        <div class="db-tipo">
          <button class="db-tbtn ${DB.tipo==='bar'?'on':''}" onclick="DB.tipo='bar';dbChart()">▮ Barra</button>
          <button class="db-tbtn ${DB.tipo==='line'?'on':''}" onclick="DB.tipo='line';dbChart()">╱ Línea</button>
        </div>
      </div>
      <div style="position:relative;height:320px"><canvas id="dbCanvas"></canvas></div>
    </div>

    <div class="db-grid">
      ${dbBarras('Por comuna',porComuna,t)}
      ${dbBarras('Por sexo',porSexo,t)}
      ${dbBarras('Combinación de servicios',Object.entries(combo).sort((a,b)=>b[1]-a[1]),t)}
    </div>`;
  dbChart();
}
function dbAgrupar(A,fn){ const m={}; A.forEach(a=>{ const k=fn(a)||'—'; m[k]=(m[k]||0)+1; }); return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,12); }
function dbBarras(titulo,pares,total){
  const max=Math.max(1,...pares.map(p=>p[1]));
  return `<div class="card"><div class="db-bt">${esc(titulo)}</div>
    ${!pares.length?'<div class="q-help">Sin datos.</div>':pares.map(([k,v])=>`<div class="db-bar-row">
      <div class="db-bar-l" title="${esc(k)}">${esc(k)}</div>
      <div class="db-bar"><div style="width:${(v/max*100).toFixed(0)}%"></div></div>
      <div class="db-bar-v">${v} · ${_pc(v,total)}%</div></div>`).join('')}</div>`;
}

// ── Serie temporal ───────────────────────────────────────────────────────────
function dbBucket(iso,rango){
  const d=new Date(iso); if(isNaN(d)) return '—';
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  if(rango==='anio') return ''+y;
  if(rango==='mes')  return y+'-'+m;
  if(rango==='dia')  return y+'-'+m+'-'+day;
  // semana ISO
  const t=new Date(Date.UTC(y,d.getMonth(),d.getDate())); const dn=t.getUTCDay()||7; t.setUTCDate(t.getUTCDate()+4-dn);
  const ys=new Date(Date.UTC(t.getUTCFullYear(),0,1)); const wk=Math.ceil((((t-ys)/86400000)+1)/7);
  return t.getUTCFullYear()+'-S'+String(wk).padStart(2,'0');
}
function dbSeries(A){
  // devuelve {series:{nombre:{bucket:count}}}
  const s={};
  const add=(nombre,b)=>{ (s[nombre]=s[nombre]||{})[b]=(s[nombre][b]||0)+1; };
  A.forEach(a=>{ const b=dbBucket(a.created_at,DB.rango);
    if(DB.cruce==='servicio'){ if(a.apresto)add('Apresto',b); if(a.intermediacion)add('Intermediación',b); if(a.formacion)add('Formación',b); }
    else if(DB.cruce==='comuna') add(a.comuna||'Sin comuna',b);
    else if(DB.cruce==='sexo') add(a.sexo||'Sin dato',b);
    else add('Atenciones',b);
  });
  return s;
}
const DB_COLORS=['#006973','#F2A900','#5b4fcf','#1e7e34','#c0311b','#00A399','#b8860b','#8a90a0'];
function dbChart(){
  const cv=document.getElementById('dbCanvas'); if(!cv||typeof Chart==='undefined') return;
  const s=dbSeries(DB.atenciones);
  const buckets=[...new Set(Object.values(s).flatMap(o=>Object.keys(o)))].sort();
  const nombres=Object.keys(s).slice(0,8);
  const datasets=nombres.map((n,i)=>({ label:n, data:buckets.map(b=>s[n][b]||0),
    backgroundColor:DB_COLORS[i%DB_COLORS.length], borderColor:DB_COLORS[i%DB_COLORS.length],
    borderWidth:2, fill:false, tension:.25 }));
  if(DB.chart){ DB.chart.destroy(); }
  DB.chart=new Chart(cv.getContext('2d'),{ type:DB.tipo,
    data:{labels:buckets, datasets},
    options:{responsive:true,maintainAspectRatio:false,
      scales:{x:{title:{display:true,text:'Tiempo'}},y:{beginAtZero:true,ticks:{precision:0}}},
      plugins:{legend:{position:'bottom'}} } });
}
