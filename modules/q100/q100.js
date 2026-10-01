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
    const bp=document.getElementById('btnPermisos'); if(bp) bp.classList.toggle('hidden', !Q_CTX.es_corporativo);
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

function q100AreaId(nombre){
  const a=(Q_CTX&&Q_CTX.areas||[]).find(x=>x.nombre===nombre);
  return a?a.area_id:null;
}
function q100Render(d){
  window.Q_DASH=d; window.Q_CICLO=d.ciclo;
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
    <div class="row clickable ${m.avg<40?'flag':''}" role="button" tabindex="0"
         onclick="q100Detalle({meta:${m.numero}})" onkeydown="if(event.key==='Enter')q100Detalle({meta:${m.numero}})">
      <div class="tag">M${m.numero}</div>
      <div class="body"><div class="name" title="${esc(m.titulo)}">${esc(shortMeta(m.titulo))}</div>
        <div class="track"><i class="${barClass(m.avg)}" style="width:${m.avg}%"></i></div></div>
      <div class="val tnum">${m.avg}% <small>${m.n} acc·${m.criticas} cr</small></div>
    </div>`).join('');

  // Barras área
  document.getElementById('areas').innerHTML=(d.areas||[]).map(a=>{
    const aid=q100AreaId(a.area);
    return `<div class="row clickable ${a.avg<40?'flag':''}" role="button" tabindex="0"
         onclick='q100Detalle({area:${JSON.stringify(aid)}})' onkeydown="if(event.key==='Enter')this.click()">
      <div class="tag"></div>
      <div class="body"><div class="name" title="${esc(a.area)}">${esc(a.area)}</div>
        <div class="track"><i class="${barClass(a.avg)}" style="width:${a.avg}%"></i></div></div>
      <div class="val tnum">${a.avg}% <small>${a.n} acc·${a.riesgo} rg</small></div>
    </div>`;}).join('');

  // Heatmap
  const mx={}; (d.matriz||[]).forEach(c=>{ (mx[c.meta]=mx[c.meta]||{})[c.area]=c.avg; });
  const areasPresentes=[...new Set((d.matriz||[]).map(c=>c.area))];
  const cols=AREA_ORDER.filter(a=>areasPresentes.includes(a)).concat(areasPresentes.filter(a=>!AREA_ORDER.includes(a)));
  let h='<tr><th class="rowh">Meta</th>'+cols.map(c=>`<th>${esc(AREA_ABBR[c]||c.slice(0,4))}</th>`).join('')+'</tr>';
  (d.metas||[]).forEach(m=>{
    h+=`<tr><th class="rowh" title="${esc(m.titulo)}">M${m.numero} · ${esc(shortMeta(m.titulo))}</th>`;
    cols.forEach(c=>{ const v=mx[m.numero]&&mx[m.numero][c];
      h+=(v===undefined||v===null)?'<td class="empty">·</td>'
        :`<td class="hm-cell" title="Meta ${m.numero} · ${esc(c)}"
             onclick='q100Detalle({meta:${m.numero},area:${JSON.stringify(q100AreaId(c))}})'
             style="background:${hmColor(v)};color:${hmFg(v)}">${v}</td>`; });
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

// ─────────────────────────────────────────────────────────────────────────────
// Drill-down interactivo + edición por área
// ─────────────────────────────────────────────────────────────────────────────
let Q_FILTRO=null;   // filtro actual del modal (para refrescar tras guardar)
const EST_OPC=['LISTA','EN RIESGO','ATRASADA','SIN INICIAR'];

function estadoChip(e){
  const k=(e||'').toUpperCase();
  const cls = k==='LISTA'?'ok' : (k==='EN RIESGO'?'warn' : (k==='ATRASADA'?'bad':'mute'));
  return `<span class="chip ${cls}">${esc(e||'sin estado')}</span>`;
}
function critChip(c){
  return c==='critica' ? '<span class="chip crit">Crítica</span>' : '<span class="chip mute">No crítica</span>';
}
function barMini(v){ v=(v==null?0:v); return `<div class="mini"><i class="${barClass(v)}" style="width:${v}%"></i></div>`; }

function q100TituloFiltro(f){
  let t='Detalle', s='';
  if(f.meta!=null){ const m=(Q_DASH&&Q_DASH.metas||[]).find(x=>x.numero===f.meta);
    t='Meta '+f.meta; s=m?shortMeta(m.titulo):''; }
  if(f.area!=null){ const a=(Q_CTX&&Q_CTX.areas||[]).find(x=>x.area_id===f.area);
    const an=a?a.nombre:f.area;
    if(f.meta!=null){ s=(s?s+' · ':'')+'Área: '+an; } else { t='Área: '+an; s='Acciones del área en este ciclo'; } }
  return {t,s};
}

async function q100Detalle(filtro){
  Q_FILTRO=filtro;
  const mask=document.getElementById('detMask'), body=document.getElementById('detBody');
  const tt=q100TituloFiltro(filtro);
  document.getElementById('detTitle').textContent=tt.t;
  document.getElementById('detSub').textContent=tt.s;
  mask.classList.remove('hidden');
  body.innerHTML='<div class="det-load">Cargando acciones…</div>';
  try{
    const {data,error}=await SB.rpc('q100_acciones',{
      p_meta: filtro.meta!=null?filtro.meta:null,
      p_area: filtro.area!=null?filtro.area:null,
      p_ciclo: document.getElementById('selCiclo').value||null});
    if(error) throw error;
    if(!data||data.error) throw new Error((data&&data.error)||'sin datos');
    q100RenderDetalle(data.acciones||[]);
  }catch(e){ body.innerHTML='<div class="det-load">No se pudo cargar ('+esc(e.message||e)+').</div>'; }
}

function q100RenderDetalle(acc){
  const body=document.getElementById('detBody');
  if(!acc.length){ body.innerHTML='<div class="det-load">Sin acciones para este filtro.</div>'; return; }
  body.innerHTML = acc.map((a,i)=>{
    const resp = (a.ver_personas && Array.isArray(a.responsables) && a.responsables.length)
      ? a.responsables.map(esc).join(', ')
      : esc(a.area);
    const fecha = a.fecha_termino ? ('Término '+esc(a.fecha_termino)) : '';
    const actualiza = a.actualizado_por ? `· actualizó ${esc(a.actualizado_por)}` : '';
    return `<div class="acc" id="acc-${i}">
      <div class="acc-top">
        <div class="acc-pct tnum ${barClass(a.pct||0)==='bad'?'bad':''}">${a.pct==null?'—':a.pct+'%'}</div>
        <div class="acc-main">
          <div class="acc-t">${esc(a.accion)}</div>
          <div class="acc-meta">${critChip(a.criticidad)} ${estadoChip(a.estado)}
            <span class="acc-dim">${esc(a.linea)} · ${resp} ${fecha?'· '+fecha:''}</span></div>
          ${barMini(a.pct)}
          <div class="acc-com ${a.comentario?'':'vacio'}">${a.comentario?('“'+esc(a.comentario)+'” '+actualiza):'Sin comentario registrado — el porqué del avance se explica al editar.'}</div>
        </div>
      </div>
      <div class="acc-actions">
        <button class="mini-btn ghost" onclick="q100VerHistorial('${esc(a.accion_id)}',${i})">🕑 Historial</button>
        <button class="mini-btn ghost" onclick="q100VerComentarios('${esc(a.accion_id)}',${i})">💬 Comentarios</button>
        ${a.puede_editar?`<button class="mini-btn" onclick="q100Editar(${i})">✎ Registrar avance</button>`:''}
      </div>
      ${a.puede_editar?`<div class="acc-edit hidden" id="edit-${i}">
          <div class="ef-row">
            <label>% avance<input type="number" min="0" max="100" id="ef-pct-${i}" value="${a.pct==null?'':a.pct}"></label>
            <label>Estado<select id="ef-est-${i}">${EST_OPC.map(o=>`<option ${o===(a.estado||'')?'selected':''}>${o}</option>`).join('')}${EST_OPC.includes(a.estado)?'':`<option selected>${esc(a.estado||'')}</option>`}</select></label>
          </div>
          <label class="ef-full">¿Qué se hizo / por qué está en este avance?
            <textarea id="ef-com-${i}" rows="2" placeholder="Explica el avance del período…">${esc(a.comentario||'')}</textarea></label>
          ${a.ver_personas?`<label class="ef-full">Responsables internos (separados por coma)
            <input id="ef-resp-${i}" value="${a.ver_personas&&a.responsables?a.responsables.map(esc).join(', '):''}"></label>`:''}
          <div class="ef-btns">
            <button class="mini-btn ghost" onclick="q100CancelEdit(${i})">Cancelar</button>
            <button class="mini-btn ok" onclick="q100GuardarAvance('${esc(a.accion_id)}',${i},${a.ver_personas?'true':'false'})">Guardar</button>
          </div>
        </div>`:''}
      <div class="acc-hist hidden" id="hist-${i}"></div>
      <div class="acc-coment hidden" id="coment-${i}"></div>
    </div>`;
  }).join('');
}

function q100Editar(i){ const e=document.getElementById('edit-'+i); if(e) e.classList.remove('hidden'); }
function q100CancelEdit(i){ const e=document.getElementById('edit-'+i); if(e) e.classList.add('hidden'); }

// Historial append-only de una acción (quién cambió el % y cuándo).
async function q100VerHistorial(accionId, i){
  const box=document.getElementById('hist-'+i); if(!box) return;
  if(!box.classList.contains('hidden')){ box.classList.add('hidden'); return; }  // toggle
  box.classList.remove('hidden'); box.innerHTML='<div class="det-load">Cargando historial…</div>';
  try{
    const {data,error}=await SB.rpc('q100_avance_historial',
      {p_accion:accionId, p_ciclo:document.getElementById('selCiclo').value||null});
    if(error) throw error;
    if(data && data.error) throw new Error(data.error);
    const arr=Array.isArray(data)?data:[];
    if(!arr.length){ box.innerHTML='<div class="acc-com vacio">Sin historial.</div>'; return; }
    box.innerHTML='<div class="hist-wrap">'+arr.map(h=>{
      const de=h.pct_anterior==null?'—':h.pct_anterior+'%';
      const a =h.pct_nuevo==null?'—':h.pct_nuevo+'%';
      const proc=h.procedencia==='Carga inicial'?' · carga inicial':'';
      return `<div class="hist-it">
        <span class="hist-pct tnum">${de} → <b>${a}</b></span>
        <span class="hist-dim">${esc(h.estado_nuevo||'')} · ${esc(h.actor||'')} · ${esc(h.fecha||'')}${proc}</span>
        ${h.comentario?`<div class="hist-com">“${esc(h.comentario)}”</div>`:''}
      </div>`;
    }).join('')+'</div>';
  }catch(e){ box.innerHTML='<div class="acc-com vacio">No se pudo cargar: '+esc(e.message||e)+'</div>'; }
}

// Hilo de comentarios de una acción (texto; evidencia en la parte 2).
async function q100VerComentarios(accionId, i){
  const box=document.getElementById('coment-'+i); if(!box) return;
  if(!box.classList.contains('hidden')){ box.classList.add('hidden'); return; }  // toggle
  box.classList.remove('hidden'); box.innerHTML='<div class="det-load">Cargando comentarios…</div>';
  await q100CargarComentarios(accionId, i);
}
async function q100CargarComentarios(accionId, i){
  const box=document.getElementById('coment-'+i); if(!box) return;
  try{
    const {data,error}=await SB.rpc('q100_comentarios_listar',
      {p_accion:accionId, p_ciclo:document.getElementById('selCiclo').value||null});
    if(error) throw error; if(data && data.error) throw new Error(data.error);
    const arr=Array.isArray(data)?data:[];
    const lista = arr.length ? arr.map(c=>`<div class="cm-it">
        <div class="cm-txt">${esc(c.texto)}</div>
        <div class="cm-dim">${esc(c.autor||'')} · ${esc(c.fecha||'')}${c.evidencia_url?` · <a href="${esc(c.evidencia_url)}" target="_blank" rel="noopener">${esc(c.evidencia_nombre||'evidencia')}</a>`:''}</div>
      </div>`).join('') : '<div class="acc-com vacio">Sin comentarios aún.</div>';
    box.innerHTML=`<div class="cm-wrap">${lista}</div>
      <div class="cm-add">
        <textarea id="cm-new-${i}" rows="2" placeholder="Escribe un comentario…"></textarea>
        <button class="mini-btn ok" onclick="q100ComentAgregar('${esc(accionId)}',${i})">Comentar</button>
      </div>`;
  }catch(e){ box.innerHTML='<div class="acc-com vacio">No se pudo cargar: '+esc(e.message||e)+'</div>'; }
}
async function q100ComentAgregar(accionId, i){
  const ta=document.getElementById('cm-new-'+i); const texto=(ta.value||'').trim();
  if(!texto){ toast('Escribe un comentario','err'); return; }
  try{
    const {data,error}=await SB.rpc('q100_comentario_agregar',
      {p_accion:accionId, p_texto:texto, p_ciclo:document.getElementById('selCiclo').value||null});
    if(error) throw error;
    if(data && data.error){ toast(data.error==='solo_lectura'?'Tu rol es de solo lectura':('No se pudo: '+data.error),'err'); return; }
    toast('Comentario agregado','ok');
    await q100CargarComentarios(accionId, i);
  }catch(e){ toast('No se pudo comentar: '+(e.message||e),'err'); }
}

async function q100GuardarAvance(accionId, i, verPersonas){
  const pctEl=document.getElementById('ef-pct-'+i);
  const pct=pctEl.value===''?null:Number(pctEl.value);
  if(pct!=null && (pct<0||pct>100)){ toast('El % debe estar entre 0 y 100','err'); return; }
  const estado=document.getElementById('ef-est-'+i).value;
  const comentario=document.getElementById('ef-com-'+i).value;
  try{
    const {data,error}=await SB.rpc('q100_guardar_avance',
      {p_accion:accionId, p_pct:pct, p_estado:estado, p_comentario:comentario,
       p_ciclo:document.getElementById('selCiclo').value||null});
    if(error) throw error;
    if(!data||data.error) throw new Error((data&&data.error)||'error');
    if(verPersonas){
      const raw=(document.getElementById('ef-resp-'+i)||{}).value||'';
      const personas=raw.split(',').map(s=>s.trim()).filter(Boolean);
      const r=await SB.rpc('q100_responsable_guardar',{p_accion:accionId, p_personas:personas});
      if(r.error) throw r.error;
    }
    toast('Avance guardado','ok');
    await q100Detalle(Q_FILTRO);        // refresca el detalle
    q100CargarDashboard();              // refresca los números del tablero
  }catch(e){ toast('No se pudo guardar: '+(e.message||e),'err'); }
}

function cerrarDetalle(){ document.getElementById('detMask').classList.add('hidden'); Q_FILTRO=null; }
// Cerrar con Esc (NO al hacer clic fuera — convención del sistema).
document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){
    const m=document.getElementById('detMask'); if(m&&!m.classList.contains('hidden')){ cerrarDetalle(); return; }
    const p=document.getElementById('permMask'); if(p&&!p.classList.contains('hidden')) q100CerrarPermisos();
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Permisos / grants cruzados (solo corporativo). Da ver/editar fuera del área.
// ═══════════════════════════════════════════════════════════════════════════
let Q_ADMIN=null, Q_PERM_ACC=null;

async function q100AbrirPermisos(){
  document.getElementById('permMask').classList.remove('hidden');
  const body=document.getElementById('permBody'); body.innerHTML='<div class="det-load">Cargando…</div>';
  try{
    const [d,g]=await Promise.all([SB.rpc('q100_admin_datos'), SB.rpc('q100_grants_listar')]);
    if(d.error) throw d.error; if(g.error) throw g.error;
    if(d.data&&d.data.error) throw new Error(d.data.error);
    Q_ADMIN=d.data; Q_PERM_ACC=null;
    q100RenderPermisos(Q_ADMIN, Array.isArray(g.data)?g.data:[]);
  }catch(e){ body.innerHTML='<div class="acc-com vacio">No se pudo cargar: '+esc(e.message||e)+'</div>'; }
}
function q100CerrarPermisos(){ document.getElementById('permMask').classList.add('hidden'); }

function q100RenderPermisos(d, grants){
  const uOpts=(d.usuarios||[]).map(u=>`<option value="${u.user_id}">${esc(u.nombre)}${u.rol==='corporativo'?' · corporativo':(u.area?' · '+esc(u.area):'')}</option>`).join('');
  const aOpts=(d.areas||[]).map(a=>`<option value="${a.area_id}">${esc(a.nombre)}</option>`).join('');
  const mOpts=(d.metas||[]).map(m=>`<option value="${m.meta_id}">Meta ${String(m.numero).padStart(2,'0')} — ${esc((m.titulo||'').slice(0,50))}</option>`).join('');
  const lOpts=(d.lineas||[]).map(l=>`<option value="${l.linea_id}">${esc((l.titulo||'').slice(0,70))}</option>`).join('');
  document.getElementById('permBody').innerHTML=`
    <div class="perm-form">
      <div class="pf-row">
        <label class="pf-fld">Persona<select id="pf-user">${uOpts}</select></label>
        <label class="pf-fld">Nivel<select id="pf-nivel"><option value="editar">Ver y editar</option><option value="ver">Solo ver</option></select></label>
      </div>
      <div class="pf-row">
        <label class="pf-fld">Ámbito<select id="pf-ambito" onchange="q100PermAmbito()">
          <option value="accion">Acción (tarea específica)</option>
          <option value="area">Área completa</option>
          <option value="meta">Meta completa</option>
          <option value="linea">Línea completa</option>
        </select></label>
        <label class="pf-fld hidden" id="pf-ref-area">Área<select id="pf-area">${aOpts}</select></label>
        <label class="pf-fld hidden" id="pf-ref-meta">Meta<select id="pf-meta">${mOpts}</select></label>
        <label class="pf-fld hidden" id="pf-ref-linea">Línea<select id="pf-linea">${lOpts}</select></label>
      </div>
      <div id="pf-ref-accion" class="pf-fld">
        <label>Buscar acción<input id="pf-accion-q" placeholder="escribe parte del título…" oninput="q100BuscarAccion()" autocomplete="off"></label>
        <div id="pf-accion-res" class="pf-res"></div>
        <div id="pf-accion-sel" class="pf-sel"></div>
      </div>
      <div><button class="mini-btn ok" onclick="q100GrantAsignar()">➕ Asignar acceso</button></div>
    </div>
    <div class="perm-h">Accesos asignados</div>
    <div class="perm-list" id="perm-list">${q100GrantsHTML(grants)}</div>
    <div class="perm-h" style="margin-top:20px">Roles de usuarios</div>
    <div class="perm-list">${q100RolesHTML(d.usuarios||[])}</div>`;
  q100PermAmbito();
}

const Q_ROLES=[['corporativo','Corporativo (ve todo)'],['area','Responsable de área (edita su área)'],['ejecutor','Ejecutor (solo tareas asignadas)'],['lector','Lector (solo ver)']];
function q100RolesHTML(usuarios){
  if(!usuarios.length) return '<div class="acc-com vacio">Sin usuarios.</div>';
  return usuarios.map(u=>`<div class="perm-it">
    <div class="perm-it-main"><b>${esc(u.nombre)}</b> <span class="pf-dim">· ${esc(u.area||'')}</span></div>
    <select class="pf-rol" onchange="q100CambiarRol('${u.user_id}', this.value)">
      ${Q_ROLES.map(r=>`<option value="${r[0]}" ${u.rol===r[0]?'selected':''}>${r[1]}</option>`).join('')}
    </select>
  </div>`).join('');
}
async function q100CambiarRol(userId, rol){
  try{
    const {data,error}=await SB.rpc('q100_usuario_rol',{p_user:userId, p_rol:rol});
    if(error) throw error; if(data&&data.error) throw new Error(data.error);
    toast('Rol actualizado','ok');
    if(Q_ADMIN&&Q_ADMIN.usuarios){ const u=Q_ADMIN.usuarios.find(x=>x.user_id===userId); if(u) u.rol=rol; }
  }catch(e){ toast('No se pudo cambiar el rol: '+(e.message||e),'err'); }
}

function q100PermAmbito(){
  const amb=document.getElementById('pf-ambito').value;
  document.getElementById('pf-ref-area').classList.toggle('hidden', amb!=='area');
  document.getElementById('pf-ref-meta').classList.toggle('hidden', amb!=='meta');
  document.getElementById('pf-ref-linea').classList.toggle('hidden', amb!=='linea');
  document.getElementById('pf-ref-accion').classList.toggle('hidden', amb!=='accion');
}

let _q100BuscTO=null;
function q100BuscarAccion(){
  clearTimeout(_q100BuscTO);
  const q=document.getElementById('pf-accion-q').value.trim();
  const res=document.getElementById('pf-accion-res');
  if(q.length<3){ res.innerHTML=''; return; }
  _q100BuscTO=setTimeout(async()=>{
    try{
      const {data,error}=await SB.rpc('q100_buscar_accion',{p_texto:q});
      if(error) throw error;
      const arr=Array.isArray(data)?data:[];
      res.innerHTML=arr.length? arr.map(a=>`<div class="pf-res-it" onclick="q100SelAccion('${esc(a.accion_id)}','${esc((a.accion||'').replace(/'/g,"\\'").slice(0,60))}')">${esc(a.accion)} <span class="pf-dim">· M${a.meta} · ${esc(a.area||'')}</span></div>`).join('')
        : '<div class="pf-dim" style="padding:6px">Sin coincidencias.</div>';
    }catch(e){ res.innerHTML='<div class="pf-dim" style="padding:6px">Error: '+esc(e.message||e)+'</div>'; }
  },280);
}
function q100SelAccion(id,txt){ Q_PERM_ACC=id;
  document.getElementById('pf-accion-sel').innerHTML='✓ '+esc(txt);
  document.getElementById('pf-accion-res').innerHTML=''; document.getElementById('pf-accion-q').value='';
}

function q100GrantsHTML(grants){
  if(!grants||!grants.length) return '<div class="acc-com vacio">Aún no hay accesos cruzados asignados. Cada gerente ve solo su área.</div>';
  const nivelTxt=n=>n==='editar'?'ver y editar':'solo ver';
  const ambTxt={area:'Área',meta:'Meta',linea:'Línea',accion:'Acción'};
  return grants.map(g=>`<div class="perm-it">
    <div class="perm-it-main"><b>${esc(g.usuario)}</b> — ${ambTxt[g.ambito]||g.ambito}: ${esc(g.etiqueta||g.ref_id)}
      <span class="pf-dim">· ${nivelTxt(g.nivel)}</span></div>
    <button class="mini-btn ghost" onclick="q100GrantQuitar(${g.grant_id})">Quitar</button>
  </div>`).join('');
}

async function q100GrantAsignar(){
  const user=document.getElementById('pf-user').value;
  const amb=document.getElementById('pf-ambito').value;
  const nivel=document.getElementById('pf-nivel').value;
  let ref=null;
  if(amb==='area') ref=document.getElementById('pf-area').value;
  else if(amb==='meta') ref=document.getElementById('pf-meta').value;
  else if(amb==='linea') ref=document.getElementById('pf-linea').value;
  else if(amb==='accion') ref=Q_PERM_ACC;
  if(!user){ toast('Elige una persona','err'); return; }
  if(!ref){ toast(amb==='accion'?'Busca y elige una acción':'Elige el ámbito','err'); return; }
  try{
    const {data,error}=await SB.rpc('q100_grant_asignar',{p_user:user, p_ambito:amb, p_ref:ref, p_nivel:nivel});
    if(error) throw error; if(data&&data.error) throw new Error(data.error);
    toast('Acceso asignado','ok');
    const g=await SB.rpc('q100_grants_listar');
    document.getElementById('perm-list').innerHTML=q100GrantsHTML(Array.isArray(g.data)?g.data:[]);
    Q_PERM_ACC=null; document.getElementById('pf-accion-sel').innerHTML='';
  }catch(e){ toast('No se pudo asignar: '+(e.message||e),'err'); }
}
async function q100GrantQuitar(id){
  try{
    const {data,error}=await SB.rpc('q100_grant_quitar',{p_grant_id:id});
    if(error) throw error; if(data&&data.error) throw new Error(data.error);
    toast('Acceso quitado','ok');
    const g=await SB.rpc('q100_grants_listar');
    document.getElementById('perm-list').innerHTML=q100GrantsHTML(Array.isArray(g.data)?g.data:[]);
  }catch(e){ toast('No se pudo quitar: '+(e.message||e),'err'); }
}
