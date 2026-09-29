// ═══════════════════════════════════════════════════════════════════════════
// q100.js — Plan de Acción Q100 · Antofagasta Minerals (VPAC)
// Dashboard corporativo en vivo. Lee de Supabase por RPCs públicas
// (q100_contexto / q100_dashboard) que validan tiene_acceso('q100') y
// respetan RLS. Sin type="module": funciones globales (CLAUDE.md §6).
// SB / USER / ES_ADMIN los declara shared/js/auth-guard.js.
// ═══════════════════════════════════════════════════════════════════════════

let Q_CTX = null;   // contexto (ciclos, áreas, rol)

function toast(msg, tipo){
  const t=document.getElementById('toast'); if(!t)return;
  t.textContent=msg; t.className=(tipo||'')+' show';
  clearTimeout(window._qtt); window._qtt=setTimeout(()=>{t.className=t.className.replace('show','').trim();},2600);
}

// Llamado por auth-guard tras validar acceso.
async function q100Acceso(user){
  document.getElementById('gate').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  const email=(user&&user.email)||'';
  document.getElementById('hUser').textContent=email;
  try{
    const {data,error}=await SB.rpc('q100_contexto');
    if(error) throw error;
    if(data && data.error){ toast('Sin acceso al módulo','err'); return; }
    Q_CTX=data;
    // Selector de ciclos (por plan, ciclo más reciente primero).
    const sel=document.getElementById('selCiclo');
    const ciclos=(Q_CTX.ciclos||[]).slice().sort((a,b)=>(b.numero-a.numero));
    sel.innerHTML=ciclos.map(c=>`<option value="${c.ciclo_id}">${c.nombre}${c.estado==='abierto'?' · abierto':''}</option>`).join('');
    const abierto=ciclos.find(c=>c.estado==='abierto');
    if(abierto) sel.value=abierto.ciclo_id;
    const rol=Q_CTX.es_corporativo?'vista corporativa':(Q_CTX.mi_rol?('vista '+Q_CTX.mi_rol):'vista corporativa');
    document.getElementById('subCtx').textContent='VPAC · '+rol;
    await q100CargarDashboard();
  }catch(e){ toast('Error cargando: '+(e.message||e),'err'); document.getElementById('loader').textContent='No se pudo cargar.'; }
}

async function q100CargarDashboard(){
  const loader=document.getElementById('loader'), dash=document.getElementById('dash');
  dash.classList.add('hidden'); loader.classList.remove('hidden'); loader.textContent='Cargando…';
  const ciclo=document.getElementById('selCiclo').value || null;
  try{
    const {data,error}=await SB.rpc('q100_dashboard',{p_ciclo:ciclo});
    if(error) throw error;
    if(!data || data.error) throw new Error((data&&data.error)||'sin datos');
    q100Render(data);
    loader.classList.add('hidden'); dash.classList.remove('hidden');
  }catch(e){ loader.textContent='No se pudo cargar el ciclo ('+(e.message||e)+').'; }
}

// ── Helpers de estilo ──
function barClass(v){ return v<40?'bad':v<70?'gold':v<85?'mid':''; }
function shortMeta(t){ return String(t||'').replace(/^Meta\s*\d+\s*:\s*/,''); }
const AREA_ABBR={'Asuntos Corporativos':'AACC','Comunicaciones':'COM','Norte':'NOR','MLP':'MLP','MLP - LP':'M-LP','FMLP':'FMLP','Planificación y Control de Gestión':'PCG','Protección Industrial':'PI','(s/á)':'s/á','(sin área)':'s/á'};
const AREA_ORDER=['Asuntos Corporativos','Comunicaciones','Norte','MLP','MLP - LP','FMLP','Planificación y Control de Gestión','Protección Industrial'];
function hmColor(v){ return v<40?'var(--red)':v<55?'var(--gold-dk)':v<70?'var(--gold)':v<85?'#4dbdb3':'var(--teal)'; }
function hmFg(v){ return (v<55)?'#fff':(v>=85||(v>=70&&v<85))?'#fff':'#3a2c00'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function q100Render(d){
  const g=d.global||{};
  // KPIs
  const pctLista = g.n?Math.round(g.lista/g.n*100):0;
  const pctRiesgo= g.n?Math.round(g.riesgo/g.n*100):0;
  document.getElementById('kpis').innerHTML=`
    <div class="kpi"><div class="lbl">Avance global</div><div class="big tnum">${g.avg}%</div>
      <div class="bar"><i style="width:${g.avg}%"></i></div><div class="hint">${g.n} acciones · ${(d.metas||[]).length} metas</div></div>
    <div class="kpi"><div class="lbl">Listas</div><div class="big tnum">${g.lista}</div><div class="hint">de ${g.n} (${pctLista}%)</div></div>
    <div class="kpi"><div class="lbl">En riesgo</div><div class="big warn tnum">${g.riesgo}</div><div class="hint">${pctRiesgo}% del total</div></div>
    <div class="kpi"><div class="lbl">Críticas</div><div class="big tnum">${g.criticas}</div><div class="hint">avanzan <strong>${g.avg_crit}%</strong> · ${g.crit_bajo30} bajo 30%</div></div>
    <div class="kpi"><div class="lbl">Vencidas s/cierre</div><div class="big ${g.vencidas>0?'bad':''} tnum">${g.vencidas}</div><div class="hint">hitos vencidos abiertos</div></div>`;

  // Barras meta
  document.getElementById('metas').innerHTML=(d.metas||[]).map(m=>`
    <div class="row ${m.avg<40?'flag':''}">
      <div class="tag">M${m.numero}</div>
      <div class="body"><div class="name" title="${esc(m.titulo)}">${esc(shortMeta(m.titulo))}</div>
        <div class="track"><i class="${barClass(m.avg)}" style="width:${m.avg}%"></i></div></div>
      <div class="val tnum">${m.avg}% <small>${m.n} acc·${m.criticas} cr</small></div>
    </div>`).join('');

  // Barras área
  document.getElementById('areas').innerHTML=(d.areas||[]).map(a=>`
    <div class="row ${a.avg<40?'flag':''}">
      <div class="tag"></div>
      <div class="body"><div class="name" title="${esc(a.area)}">${esc(a.area)}</div>
        <div class="track"><i class="${barClass(a.avg)}" style="width:${a.avg}%"></i></div></div>
      <div class="val tnum">${a.avg}% <small>${a.n} acc·${a.riesgo} rg</small></div>
    </div>`).join('');

  // Heatmap
  const mx={}; (d.matriz||[]).forEach(c=>{ (mx[c.meta]=mx[c.meta]||{})[c.area]=c.avg; });
  const areasPresentes=[...new Set((d.matriz||[]).map(c=>c.area))];
  const cols=AREA_ORDER.filter(a=>areasPresentes.includes(a)).concat(areasPresentes.filter(a=>!AREA_ORDER.includes(a)));
  let h='<tr><th class="rowh">Meta</th>'+cols.map(c=>`<th>${esc(AREA_ABBR[c]||c.slice(0,4))}</th>`).join('')+'</tr>';
  (d.metas||[]).forEach(m=>{
    h+=`<tr><th class="rowh" title="${esc(m.titulo)}">M${m.numero} · ${esc(shortMeta(m.titulo))}</th>`;
    cols.forEach(c=>{ const v=mx[m.numero]&&mx[m.numero][c];
      h+=(v===undefined||v===null)?'<td class="empty">·</td>':`<td style="background:${hmColor(v)};color:${hmFg(v)}">${v}</td>`; });
    h+='</tr>';
  });
  document.getElementById('hm').innerHTML=h;

  // Cruces (dinámicos)
  const worstArea=(d.areas||[]).slice().sort((a,b)=>a.avg-b.avg)[0];
  const worstMeta=(d.metas||[]).slice().sort((a,b)=>a.avg-b.avg)[0];
  const deltaCrit=(g.avg_crit||0)-(g.avg_nocrit||0);
  const mom=d.momentum; const dMom=mom?((mom.cur||0)-(mom.prev||0)):null;
  const dashArr=`${pctLista} ${100-pctLista}`;
  document.getElementById('cruces').innerHTML=`
    <div class="insight">
      <h3>La paradoja del “en riesgo”</h3>
      <div style="display:flex;align-items:center;gap:14px">
        <svg width="92" height="92" viewBox="0 0 42 42" aria-label="${g.lista} listas, ${g.riesgo} en riesgo">
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--gray-lt)" stroke-width="6"></circle>
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--teal)" stroke-width="6"
            stroke-dasharray="${dashArr}" stroke-dashoffset="25" transform="rotate(-90 21 21)"></circle>
          <text x="21" y="20.5" text-anchor="middle" font-size="8" font-weight="800" fill="var(--dark)" font-family="Barlow Condensed">${pctRiesgo}%</text>
          <text x="21" y="27" text-anchor="middle" font-size="3.4" fill="var(--gray)" font-family="Barlow">en riesgo</text>
        </svg>
        <p>${pctRiesgo}% de las acciones están “en riesgo” aunque el avance global es ${g.avg}%. Conviene distinguir el riesgo real (bajo %) de la inercia de la etiqueta.</p>
      </div>
    </div>
    <div class="insight gold">
      <h3>Lo crítico se protege; lo “no crítico” se atrasa</h3>
      <div class="duo">
        <div class="b"><div class="col" style="height:${g.avg_crit}%;background:var(--teal)"></div><div class="cap">${g.avg_crit}%</div><div class="k">Críticas (${g.criticas})</div></div>
        <div class="b"><div class="col" style="height:${g.avg_nocrit}%;background:var(--gold)"></div><div class="cap">${g.avg_nocrit}%</div><div class="k">No críticas (${g.nocriticas})</div></div>
        <div class="b"><div class="col" style="height:${g.avg}%;background:var(--teal-dk)"></div><div class="cap">${g.avg}%</div><div class="k">Global</div></div>
      </div>
      <p>Las críticas avanzan <strong>${deltaCrit} pts ${deltaCrit>=0?'más':'menos'}</strong> que las no críticas.</p>
    </div>
    <div class="insight red">
      <h3>Foco de atención</h3>
      <p><span class="fig">${worstArea?worstArea.avg:'—'}%</span> avance de <strong>${worstArea?esc(worstArea.area):'—'}</strong> (${worstArea?worstArea.riesgo:0} en riesgo). La meta más rezagada es <strong>M${worstMeta?worstMeta.numero:'—'}</strong> (${worstMeta?esc(shortMeta(worstMeta.titulo)):''}) con <strong>${worstMeta?worstMeta.avg:'—'}%</strong>.</p>
    </div>
    <div class="insight">
      <h3>Momentum del ciclo</h3>
      ${mom?`<p><span class="fig">${dMom>=0?'+':''}${dMom} pts</span> en las ${mom.n} acciones comparables con el ciclo anterior (${mom.prev}% → ${mom.cur}%).</p>`
            :`<p>Sin ciclo anterior para comparar en este plan.</p>`}
    </div>`;

  // Footer
  const cn=(Q_CTX&&(Q_CTX.ciclos||[]).find(c=>c.ciclo_id===d.ciclo));
  document.getElementById('foot').innerHTML=`Ciclo: <strong>${cn?esc(cn.nombre):esc(d.ciclo)}</strong>. Los <strong>responsables se muestran por área</strong>; la asignación interna de cada gerencia se gestiona aguas abajo y no se expone en esta vista corporativa. Datos en vivo desde el sistema · Antofagasta Minerals.`;
}
