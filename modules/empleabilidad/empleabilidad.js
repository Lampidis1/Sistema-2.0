
// ═══════════════════════ CONFIG ═══════════════════════
// Login, registro y restauración de sesión: shared/js/auth-guard.js (P-6).
// window.AUTH_CFG se define en index.html, antes de cargar ese script.
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m,t){ const e=document.getElementById('toast'); e.textContent=m; e.className='toast '+(t||''); e.style.display='block'; setTimeout(()=>e.style.display='none',2600); }
let _mdownTarget=null;
function ovDown(e){ _mdownTarget=e.target; }
function ovClick(e,closeFn){ if(_mdownTarget===e.currentTarget && e.target===e.currentTarget){ closeFn(); } _mdownTarget=null; }

async function _empOnAcceso(user){
  document.getElementById('gate').style.display='none';
  document.getElementById('app').classList.remove('hidden');
  document.body.classList.toggle('is-user', !ES_ADMIN);
  document.getElementById('hUser').textContent=(user.email||'')+(ES_ADMIN?' · admin':'');
  await cargarTodo();
}

// ═══════════════════════ CARGA DE DATOS ═══════════════════════
let CVS=[], OFERTAS=[], POSTUL=[], VISTA='tabla', OFERTA_MATCH='';
async function cargarTodo(){
  await Promise.all([cargarCVs(), cargarOfertas(), cargarPostulaciones(), cargarBecados(), cargarDiccionarioOficios()]);
  mConstruirIDF(CVS);   // el peso de cada palabra depende del conjunto de CVs
  poblarFiltros(); renderDir(); abrirDesdeAncla();
}
function abrirDesdeAncla(){
  const m=(location.hash||'').match(/cv=([^&]+)/);
  if(m){ const id=decodeURIComponent(m[1]); if(CVS.find(c=>c.cv_id===id)){ setTimeout(()=>abrirCV(id),300); } }
}
async function cargarCVs(){
  const {data,error}=await SB.from('cv_personas').select('*').neq('estado_registro','Eliminado').order('apellidos');
  if(error){ toast('Error cargando CV: '+error.message,'err'); return; }
  CVS=(data||[]).map(c=>({...c,
    experiencia:parseJ(c.experiencia_json), academico:parseJ(c.academico_json), cursos:parseJ(c.cursos_json),
    idiomas:parseJ(c.idiomas_json), software:parseJ(c.software_json), adjuntos:parseJ(c.adjuntos_json)
  }));
  // el peso de cada palabra depende del conjunto de CVs: si cambia, se recalcula
  if(typeof mConstruirIDF==='function') mConstruirIDF(CVS);
}
async function cargarOfertas(){ const {data}=await SB.from('cv_ofertas').select('*').neq('estado_registro','Eliminado'); OFERTAS=(data||[]).map(o=>({...o,criterios:parseJ(o.criterios_json)})); }
async function cargarPostulaciones(){ const {data}=await SB.from('cv_postulaciones').select('*').neq('estado_registro','Eliminado'); POSTUL=data||[]; }
function parseJ(s){ try{ const v=JSON.parse(s||'[]'); return Array.isArray(v)?v:[]; }catch(e){ return []; } }
function miNombre(){ return (USER&&USER.email)||''; }

// ═══════════════════════ MATCHING ═══════════════════════
// Normaliza texto: minúsculas, sin acentos, sin puntuación → para comparar de forma flexible
function _norm(t){ return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9áéíóúñ ]/gi,' ').replace(/\s+/g,' ').trim(); }
// Palabras vacías que no aportan al match
const _STOP=new Set(['de','la','el','en','y','o','a','con','del','los','las','un','una','para','por','al','que','se','su','sus','experiencia','anos','años','ano','minimo','minima','curso','cursos','nivel','tipo','clase']);
// Todo el texto del CV, incluyendo campos del formulario móvil
function cvTexto(cv){
  return _norm([cv.resumen, cv.nombres, cv.apellidos, cv.oficios, cv.exp_mineria, cv.educacion, cv.certificaciones, cv.comuna, cv.disponibilidad, cv.tipo_licencia, (cv.licencia?('licencia '+cv.tipo_licencia):''),
    (cv.experiencia||[]).map(e=>[e.cargo,e.empresa,e.ciudad,(e.funciones||[]).join(' '),e.logro].join(' ')).join(' '),
    (cv.academico||[]).map(a=>[a.titulo,a.institucion].join(' ')).join(' '),
    (cv.cursos||[]).map(c=>[c.evento,c.tema,c.institucion].join(' ')).join(' '),
    (cv.idiomas||[]).map(i=>i.idioma).join(' '),
    (cv.software||[]).map(s=>s.nombre).join(' ')
  ].join(' '));
}
// Un criterio se cumple (parcial o total) según cuántas de sus palabras clave aparecen en el CV
function _critScore(criterioTexto, txtCV){
  const kw=_norm(criterioTexto);
  if(!kw) return 0;
  // coincidencia exacta de frase → 100%
  if(txtCV.includes(kw)) return 1;
  // si no, proporción de palabras significativas del criterio presentes en el CV
  const palabras=kw.split(' ').filter(w=>w.length>2 && !_STOP.has(w));
  if(!palabras.length) return txtCV.includes(kw)?1:0;
  const palabrasCV=txtCV.split(' ');
  let hits=0;
  palabras.forEach(w=>{
    // raíz de la palabra (primeros caracteres) para tolerar minero/minera/minería
    const raiz=w.slice(0,Math.max(4,Math.floor(w.length*0.7)));
    if(txtCV.includes(w) || palabrasCV.some(pw=>pw.startsWith(raiz)||w.startsWith(pw.slice(0,Math.max(4,Math.floor(pw.length*0.7)))))) hits++;
  });
  const frac=hits/palabras.length;
  return frac>=0.4 ? frac : 0;
}
// El puntaje lo calcula empleabilidad-match.js (BM25 + diccionario de oficios).
// Esta función se mantiene porque la llaman varias pantallas; si el motor nuevo
// todavía no cargó, cae al conteo simple de antes en vez de fallar.
function matchPct(cv,oferta){
  if(typeof matchPct2==='function') return matchPct2(cv,oferta);
  const crits=((oferta&&oferta.criterios)||[]).filter(c=>(c.texto||'').trim());
  if(!crits.length) return 0;
  const txt=cvTexto(cv);
  const sumP=crits.reduce((a,c)=>a+(Math.max(0,+c.ponderacion||0)),0)||crits.length;
  let got=0;
  crits.forEach(c=>{ const pond=Math.max(0,+c.ponderacion||0)||(100/crits.length); got+=pond*_critScore(c.texto,txt); });
  return Math.round(got/sumP*100);
}
function mejorMatch(cv){ if(!OFERTAS.length) return 0; return Math.max(0,...OFERTAS.map(o=>matchPct(cv,o))); }

// ═══════════════════════ FILTROS ═══════════════════════
function poblarFiltros(){
  const comunas=[...new Set(CVS.map(c=>c.comuna).filter(Boolean))].sort();
  const nacs=[...new Set(CVS.map(c=>c.nacionalidad).filter(Boolean))].sort();
  const selC=document.getElementById('fComuna'), selN=document.getElementById('fNac'), selO=document.getElementById('fOferta');
  selC.innerHTML='<option value="">Todas</option>'+comunas.map(c=>`<option>${esc(c)}</option>`).join('');
  selN.innerHTML='<option value="">Todas</option>'+nacs.map(n=>`<option>${esc(n)}</option>`).join('');
  selO.innerHTML='<option value="">— sin match —</option>'+OFERTAS.map(o=>`<option value="${o.oferta_id}">${esc(o.cargo||o.empresa)}</option>`).join('');
}
function limpiarFiltros(){ ['fComuna','fSexo','fNac','fOferta'].forEach(id=>document.getElementById(id).value=''); document.getElementById('fMatch').value=0; document.getElementById('dirSearch').value=''; renderDir(); }
function setVista(v){ VISTA=v; document.getElementById('vtTabla').classList.toggle('active',v==='tabla'); document.getElementById('vtAgenda').classList.toggle('active',v==='agenda'); renderDir(); }

// ═══════════════════════ RENDER DIRECTORIO ═══════════════════════
function telLink(raw){ let n=String(raw||'').replace(/[^0-9+]/g,''); if(!n) return ''; if(n[0]!=='+'){ if(n.startsWith('56')) n='+'+n; else if(n.length===9) n='+56'+n; else n='+'+n; } return n; }
function filtrarCVs(){
  const q=(document.getElementById('dirSearch').value||'').toLowerCase().trim();
  const fc=document.getElementById('fComuna').value, fs=document.getElementById('fSexo').value, fn=document.getElementById('fNac').value;
  OFERTA_MATCH=document.getElementById('fOferta').value;
  const fm=parseInt(document.getElementById('fMatch').value)||0;
  const oferta=OFERTAS.find(o=>o.oferta_id===OFERTA_MATCH);
  return CVS.filter(cv=>{
    if(fc&&cv.comuna!==fc) return false;
    if(fs&&cv.sexo!==fs) return false;
    if(fn&&cv.nacionalidad!==fn) return false;
    const pct = oferta?matchPct(cv,oferta):mejorMatch(cv);
    cv._pct=pct;
    if(fm&&pct<fm) return false;
    if(q){ const t=[cv.nombres,cv.apellidos,cv.rut,cv.comuna,(cv.experiencia||[]).map(e=>e.cargo).join(' ')].join(' ').toLowerCase(); if(!t.includes(q)) return false; }
    return true;
  }).sort((a,b)=>(b._pct||0)-(a._pct||0));
}
function renderDir(){
  const list=filtrarCVs();
  document.getElementById('dirCount').textContent=list.length+' persona'+(list.length===1?'':'s')+(OFERTA_MATCH?' · match vs oferta seleccionada':'');
  const cont=document.getElementById('dirContent');
  if(!list.length){ cont.innerHTML='<div class="empty">Sin resultados. Ajusta los filtros o agrega un CV.</div>'; return; }
  if(VISTA==='agenda'){ renderAgenda(list,cont); return; }
  let h='<table class="cv-tbl"><thead><tr><th>Nombre</th><th>Comuna</th><th>Sexo</th><th>Nacionalidad</th><th>% Match</th><th></th></tr></thead><tbody>';
  list.forEach(cv=>{
    const pct=cv._pct||0; const col=pct>=70?'#1e7e34':pct>=40?'#b8860b':'#c0311b';
    h+=`<tr>
      <td><b>${esc((cv.nombres||'')+' '+(cv.apellidos||''))}</b>${(cv.origen_plataforma==='movil'||cv.fuente==='movil')?' <span class="chip" style="background:#fff3d6;color:#8a6100">móvil</span>':''}<br><span style="font-size:.74rem;color:var(--text-muted)">${esc(cv.rut||'')}</span></td>
      <td>${esc(cv.comuna||'-')}</td><td>${esc(cv.sexo||'-')}</td><td>${esc(cv.nacionalidad||'-')}</td>
      <td><span class="match-bar"><div style="width:${pct}%;background:${col}"></div></span> <b style="color:${col}">${pct}%</b>
        ${OFERTA_MATCH?`<button class="mx-btn" title="Ver el desglose del puntaje" onclick="matchExplicar('${cv.cv_id}','${OFERTA_MATCH}')">¿por qué?</button>`:''}
      </td>
      <td><button class="btn sec" style="padding:5px 11px" onclick="abrirCV('${cv.cv_id}')">✏ Editar</button></td>
    </tr>`;
  });
  h+='</tbody></table>';
  cont.innerHTML=h;
}
function renderAgenda(list,cont){
  let h='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">';
  list.forEach(cv=>{
    const pct=cv._pct||0; const col=pct>=70?'#1e7e34':pct>=40?'#b8860b':'#c0311b';
    const tel=telLink(cv.telefono);
    h+=`<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px">
      <div style="font-weight:700;font-size:.95rem">${esc((cv.nombres||'')+' '+(cv.apellidos||''))}</div>
      <div style="font-size:.76rem;color:var(--text-muted);margin-bottom:8px">${esc(cv.comuna||'')} ${cv.nacionalidad?'· '+esc(cv.nacionalidad):''}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span class="match-bar" style="flex:1;width:auto"><div style="width:${pct}%;background:${col}"></div></span><b style="color:${col}">${pct}%</b></div>
      <div style="display:flex;gap:6px">
        ${tel?`<a class="btn" style="flex:1;justify-content:center;text-decoration:none" href="tel:${tel}">📞 Llamar</a>`:'<span style="flex:1;font-size:.76rem;color:var(--text-muted);align-self:center">Sin teléfono</span>'}
        <button class="btn sec" onclick="abrirCV('${cv.cv_id}')">✏</button>
      </div>
    </div>`;
  });
  h+='</div>';
  cont.innerHTML=h;
}

// ═══════════════════════ NAVEGACIÓN ═══════════════════════
function showPage(p,btn){
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.getElementById('page-'+p).classList.add('active');
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  if(p==='kanban') renderKanban();
  if(p==='ofertas') renderOfertas();
  if(p==='becados') renderBecados();
}
// ═══════════════════════ KANBAN (compartido con Proveedores · tabla kanban_cards) ═══════════════════════
// Tableros propios de empleabilidad + los compartidos con Proveedores (misma base de datos).
const KB_BOARDS={
  empleo:     { titulo:'Gestión de empleo',       cols:['Prospecto','En proceso','Colocado','Cerrado'] },
  apresto:    { titulo:'Apresto laboral',         cols:['Convocado','En taller','Completado','Seguimiento'] },
  proyectos:  { titulo:'Proyectos / Iniciativas', cols:['Idea','En curso','En pausa','Cerrado'] },
  reuniones:  { titulo:'Reuniones',               cols:['Por agendar','Agendada','Realizada'] },
  contactos:  { titulo:'Contactos',               cols:['Nuevo','En contacto','Activo','Inactivo'] }
};
let KB={ board:'empleo', cards:[], loaded:false };
async function renderKanban(){
  if(!KB.loaded){ await cargarKanban(); }
  kbSelect(KB.board);
}
async function cargarKanban(){
  const {data,error}=await SB.from('kanban_cards').select('*').neq('estado_registro','Eliminado');
  if(error){ toast('Error Kanban: '+error.message,'err'); KB.cards=[]; }
  else KB.cards=(data||[]).map(c=>({...c, datos: (typeof c.datos==='string'? (function(){try{return JSON.parse(c.datos)}catch(e){return {}}})() : (c.datos||{})) }));
  KB.loaded=true;
}
function kbSelect(board,btn){
  KB.board=board;
  document.querySelectorAll('.kb-nav').forEach(b=>b.classList.toggle('active', b.dataset.board===board));
  renderBoard(board);
}
function renderBoard(board){
  const def=KB_BOARDS[board]; const cont=document.getElementById('kanbanContent');
  if(!def){ cont.innerHTML='<div class="empty">Tablero no encontrado.</div>'; return; }
  const cards=KB.cards.filter(c=>c.tablero===board);
  let h=`<div class="kb-head"><div class="kb-title">${esc(def.titulo)}</div>
    <button class="kb-add" onclick="kbOpenCard('${board}',null)">＋ Nueva tarjeta</button></div>`;
  h+='<div class="kb-cols">';
  def.cols.forEach(col=>{
    const colCards=cards.filter(c=>(c.columna||def.cols[0])===col);
    h+=`<div class="kb-col" ondragover="event.preventDefault()" ondrop="kbDrop(event,'${col}')">
      <div class="kb-col-h">${esc(col)}<span class="cnt">${colCards.length}</span></div>`;
    colCards.forEach(c=>{ h+=kbCardHtml(c); });
    h+='</div>';
  });
  h+='</div>';
  cont.innerHTML=h;
}
function kbCardHtml(c){
  const pri=(c.prioridad||'media');
  const col=pri==='alta'?'#D0311B':pri==='baja'?'#16a34a':'#F2A900';
  return `<div class="kb-card" draggable="true" ondragstart="kbDragStart(event,'${c.card_id}')" ondragend="this.classList.remove('drag')" onclick="kbOpenCard('${c.tablero}','${c.card_id}')" style="border-left-color:${col}">
    <div class="kb-card-t">${esc(c.titulo||'(sin título)')}</div>
    ${c.descripcion?`<div class="kb-card-d">${esc(c.descripcion).slice(0,120)}</div>`:''}
    <div class="kb-card-m">${c.responsable?`<span>👤 ${esc(c.responsable)}</span>`:''}${c.fecha_limite?`<span>📅 ${esc(c.fecha_limite)}</span>`:''}</div>
  </div>`;
}
let KB_DRAG=null;
function kbDragStart(ev,id){ KB_DRAG=id; ev.target.classList.add('drag'); }
async function kbDrop(ev,col){
  ev.preventDefault();
  const card=KB.cards.find(c=>c.card_id===KB_DRAG); KB_DRAG=null;
  if(!card || card.columna===col) return;
  card.columna=col;
  renderBoard(KB.board);
  const {error}=await SB.from('kanban_cards').update({columna:col,updated_by:miNombre(),updated_at:new Date().toISOString()}).eq('card_id',card.card_id);
  if(error) toast('Error moviendo: '+error.message,'err');
}
// crear/editar tarjeta (usa prompts simples para mantener el módulo compacto)
async function kbOpenCard(board,id){
  const def=KB_BOARDS[board];
  let card = id ? KB.cards.find(c=>c.card_id===id) : null;
  const isNew=!card;
  const titulo=prompt(isNew?'Título de la nueva tarjeta:':'Título:', card?card.titulo:''); if(titulo===null) return;
  const descripcion=prompt('Descripción (opcional):', card?card.descripcion||'':'')||'';
  const responsable=prompt('Responsable (opcional):', card?card.responsable||'':'')||'';
  const columna = card?card.columna:def.cols[0];
  if(isNew){ card={ card_id:'kb_'+board+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), tablero:board, columna, datos:{} }; }
  card.titulo=titulo; card.descripcion=descripcion; card.responsable=responsable;
  const row={ card_id:card.card_id, tablero:card.tablero, columna:card.columna||def.cols[0],
    titulo:card.titulo, descripcion:card.descripcion, responsable:card.responsable,
    prioridad:card.prioridad||'media', fecha_limite:card.fecha_limite||'',
    datos:card.datos||{}, estado_registro:'Activo', updated_by:miNombre(), updated_at:new Date().toISOString() };
  if(isNew){ row.created_by=miNombre(); KB.cards.push(card); }
  const {error}=await SB.from('kanban_cards').upsert(row,{onConflict:'card_id'});
  if(error){ toast('Error: '+error.message,'err'); return; }
  toast('✅ Tarjeta guardada','ok');
  await cargarKanban(); renderBoard(KB.board);
}

// ═══════════════════════ FICHA CV (crear / editar / guardar) ═══════════════════════
let CV_EDIT=null; // objeto en edición

function nuevoCV(){
  CV_EDIT={ cv_id:'cv_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    rut:'',nombres:'',apellidos:'',fecha_nacimiento:'',sexo:'',nacionalidad:'',direccion:'',comuna:'',ciudad:'',
    telefono:'',telefono2:'',email:'',resumen:'',experiencia:[],academico:[],cursos:[],idiomas:[],software:[],adjuntos:[],
    fuente:'manual', _nuevo:true };
  renderFicha(); document.getElementById('cvModal').classList.add('show');
}
function abrirCV(id){
  const cv=CVS.find(c=>c.cv_id===id); if(!cv) return;
  CV_EDIT=JSON.parse(JSON.stringify(cv)); // copia editable
  CV_EDIT.experiencia=CV_EDIT.experiencia||[]; CV_EDIT.academico=CV_EDIT.academico||[];
  CV_EDIT.cursos=CV_EDIT.cursos||[]; CV_EDIT.idiomas=CV_EDIT.idiomas||[]; CV_EDIT.software=CV_EDIT.software||[];
  renderFicha(); document.getElementById('cvModal').classList.add('show');
}
function cerrarCV(){ document.getElementById('cvModal').classList.remove('show'); CV_EDIT=null; }
async function postularDesdeFicha(ofertaId,pct){
  if(!CV_EDIT||CV_EDIT._nuevo){ toast('Guarda el CV antes de postular','err'); return; }
  await postular(CV_EDIT.cv_id, ofertaId, pct);
  renderFicha();
}

function renderFicha(){
  const c=CV_EDIT;
  document.getElementById('cvModalTitle').textContent=(c._nuevo?'Nuevo CV':'Editar CV')+((c.nombres||c.apellidos)?' · '+esc((c.nombres||'')+' '+(c.apellidos||'')):'');
  const inp=(k,ph,val)=>`<input value="${esc(val==null?'':val)}" oninput="CV_EDIT.${k}=this.value" placeholder="${ph}">`;
  let h='';
  // datos personales
  h+='<div class="sec-t">Datos personales</div>';
  h+=`<div class="grid2"><div class="fld"><label>Nombres</label>${inp('nombres','Nombres',c.nombres)}</div><div class="fld"><label>Apellidos</label>${inp('apellidos','Apellidos',c.apellidos)}</div></div>`;
  h+=`<div class="grid3"><div class="fld"><label>RUT</label>${inp('rut','12.345.678-9',c.rut)}</div>
    <div class="fld"><label>Fecha nacimiento</label>${inp('fecha_nacimiento','dd-mm-aaaa',c.fecha_nacimiento)}</div>
    <div class="fld"><label>Sexo</label><select onchange="CV_EDIT.sexo=this.value"><option value="">—</option>${['Femenino','Masculino','Otro'].map(o=>`<option ${c.sexo===o?'selected':''}>${o}</option>`).join('')}</select></div></div>`;
  h+=`<div class="grid3"><div class="fld"><label>Nacionalidad</label>${inp('nacionalidad','Chilena',c.nacionalidad)}</div>
    <div class="fld"><label>Comuna</label>${inp('comuna','Comuna',c.comuna)}</div>
    <div class="fld"><label>Ciudad</label>${inp('ciudad','Ciudad',c.ciudad)}</div></div>`;
  h+=`<div class="fld"><label>Dirección</label>${inp('direccion','Calle, número',c.direccion)}</div>`;
  h+=`<div class="grid3"><div class="fld"><label>Teléfono</label>${inp('telefono','+56 9 ...',c.telefono)}</div>
    <div class="fld"><label>Teléfono 2</label>${inp('telefono2','',c.telefono2)}</div>
    <div class="fld"><label>Email</label>${inp('email','correo@...',c.email)}</div></div>`;
  h+=`<div class="fld"><label>Resumen / Perfil</label><textarea oninput="CV_EDIT.resumen=this.value" placeholder="Breve descripción profesional...">${esc(c.resumen||'')}</textarea></div>`;

  // experiencia
  h+='<div class="sec-t">Experiencia laboral <button class="btn sec" style="float:right;padding:4px 10px;font-size:.78rem" onclick="addExp()">＋ Agregar</button></div>';
  h+='<div id="expList">'+(c.experiencia||[]).map((e,i)=>expItem(e,i)).join('')+'</div>';

  // académico
  h+='<div class="sec-t">Formación académica <button class="btn sec" style="float:right;padding:4px 10px;font-size:.78rem" onclick="addEdu()">＋ Agregar</button></div>';
  h+='<div id="eduList">'+(c.academico||[]).map((e,i)=>eduItem(e,i)).join('')+'</div>';

  // cursos
  h+='<div class="sec-t">Cursos y certificaciones <button class="btn sec" style="float:right;padding:4px 10px;font-size:.78rem" onclick="addCur()">＋ Agregar</button></div>';
  h+='<div id="curList">'+(c.cursos||[]).map((e,i)=>curItem(e,i)).join('')+'</div>';

  // ── Sección Ofertas: postular este CV directamente ──
  if(!c._nuevo){
    h+='<div class="sec-t">💼 Ofertas — postular este CV</div>';
    if(!OFERTAS.length){ h+='<div style="font-size:.82rem;color:var(--text-muted)">No hay ofertas creadas aún.</div>'; }
    else {
      h+='<div style="display:flex;flex-direction:column;gap:6px">';
      OFERTAS.forEach(o=>{
        const yaPost=POSTUL.find(p=>p.oferta_id===o.oferta_id&&p.cv_id===c.cv_id);
        const pct=matchPct(c,o); const col=pct>=70?'#1e7e34':pct>=40?'#b8860b':'#c0311b';
        h+=`<div style="display:flex;align-items:center;gap:10px;background:#f7fafa;border:1px solid var(--border);border-radius:8px;padding:8px 12px">
          <div style="flex:1;font-size:.85rem"><b>${esc(o.cargo||'')}</b> <span style="color:var(--text-muted)">· ${esc(o.empresa||'')}</span></div>
          <b style="color:${col};font-size:.82rem">${pct}%</b>
          ${yaPost?`<span class="chip" style="background:#e6f4ea;color:#1e7e34">✓ ${esc(yaPost.estado||'Postulado')}</span>`:`<button class="btn sec" style="padding:5px 12px" onclick="postularDesdeFicha('${o.oferta_id}',${pct})">Postula</button>`}
        </div>`;
      });
      h+='</div>';
    }
  }

  document.getElementById('cvModalBody').innerHTML=h;
}
function expItem(e,i){
  return `<div class="exp-item"><span class="del-item" onclick="delExp(${i})">✕</span>
    <div class="grid2"><div class="fld"><label>Cargo</label><input value="${esc(e.cargo||'')}" oninput="CV_EDIT.experiencia[${i}].cargo=this.value"></div>
    <div class="fld"><label>Empresa</label><input value="${esc(e.empresa||'')}" oninput="CV_EDIT.experiencia[${i}].empresa=this.value"></div></div>
    <div class="grid3"><div class="fld"><label>Ciudad</label><input value="${esc(e.ciudad||'')}" oninput="CV_EDIT.experiencia[${i}].ciudad=this.value"></div>
    <div class="fld"><label>País</label><input value="${esc(e.pais||'')}" oninput="CV_EDIT.experiencia[${i}].pais=this.value"></div>
    <div class="fld"><label>Desde – Hasta</label><input value="${esc((e.desde||'')+(e.hasta?' – '+e.hasta:''))}" oninput="CV_EDIT.experiencia[${i}]._periodo=this.value;var p=this.value.split('–');CV_EDIT.experiencia[${i}].desde=(p[0]||'').trim();CV_EDIT.experiencia[${i}].hasta=(p[1]||'').trim()"></div></div>
    <div class="fld"><label>Funciones (una por línea)</label><textarea oninput="CV_EDIT.experiencia[${i}].funciones=this.value.split(String.fromCharCode(10)).filter(x=>x.trim())">${esc((e.funciones||[]).join(String.fromCharCode(10)))}</textarea></div>
    <div class="fld"><label>Logro destacado</label><input value="${esc(e.logro||'')}" oninput="CV_EDIT.experiencia[${i}].logro=this.value"></div></div>`;
}
function eduItem(e,i){
  return `<div class="edu-item"><span class="del-item" onclick="delEdu(${i})">✕</span>
    <div class="grid2"><div class="fld"><label>Título</label><input value="${esc(e.titulo||'')}" oninput="CV_EDIT.academico[${i}].titulo=this.value"></div>
    <div class="fld"><label>Institución</label><input value="${esc(e.institucion||'')}" oninput="CV_EDIT.academico[${i}].institucion=this.value"></div></div>
    <div class="grid2"><div class="fld"><label>Período</label><input value="${esc(e.periodo||'')}" oninput="CV_EDIT.academico[${i}].periodo=this.value"></div>
    <div class="fld"><label>Ciudad</label><input value="${esc(e.ciudad||'')}" oninput="CV_EDIT.academico[${i}].ciudad=this.value"></div></div></div>`;
}
function curItem(e,i){
  return `<div class="cur-item"><span class="del-item" onclick="delCur(${i})">✕</span>
    <div class="grid2"><div class="fld"><label>Curso / Evento</label><input value="${esc(e.evento||'')}" oninput="CV_EDIT.cursos[${i}].evento=this.value"></div>
    <div class="fld"><label>Tema</label><input value="${esc(e.tema||'')}" oninput="CV_EDIT.cursos[${i}].tema=this.value"></div></div>
    <div class="grid2"><div class="fld"><label>Institución</label><input value="${esc(e.institucion||'')}" oninput="CV_EDIT.cursos[${i}].institucion=this.value"></div>
    <div class="fld"><label>Año</label><input value="${esc(e.anio||'')}" oninput="CV_EDIT.cursos[${i}].anio=this.value"></div></div></div>`;
}
function addExp(){ CV_EDIT.experiencia.push({cargo:'',empresa:'',ciudad:'',pais:'',desde:'',hasta:'',funciones:[],logro:''}); document.getElementById('expList').insertAdjacentHTML('beforeend',expItem(CV_EDIT.experiencia[CV_EDIT.experiencia.length-1],CV_EDIT.experiencia.length-1)); }
function delExp(i){ CV_EDIT.experiencia.splice(i,1); renderFicha(); }
function addEdu(){ CV_EDIT.academico.push({titulo:'',institucion:'',periodo:'',ciudad:''}); document.getElementById('eduList').insertAdjacentHTML('beforeend',eduItem(CV_EDIT.academico[CV_EDIT.academico.length-1],CV_EDIT.academico.length-1)); }
function delEdu(i){ CV_EDIT.academico.splice(i,1); renderFicha(); }
function addCur(){ CV_EDIT.cursos.push({evento:'',tema:'',institucion:'',anio:''}); document.getElementById('curList').insertAdjacentHTML('beforeend',curItem(CV_EDIT.cursos[CV_EDIT.cursos.length-1],CV_EDIT.cursos.length-1)); }
function delCur(i){ CV_EDIT.cursos.splice(i,1); renderFicha(); }

async function guardarCV(){
  const c=CV_EDIT; if(!c){ return; }
  if(!(c.nombres||'').trim() && !(c.apellidos||'').trim()){ toast('Ingresa al menos nombre o apellido','err'); return; }
  const row={ cv_id:c.cv_id, rut:c.rut||'', nombres:c.nombres||'', apellidos:c.apellidos||'',
    fecha_nacimiento:c.fecha_nacimiento||'', sexo:c.sexo||'', nacionalidad:c.nacionalidad||'',
    direccion:c.direccion||'', comuna:c.comuna||'', ciudad:c.ciudad||'', telefono:c.telefono||'', telefono2:c.telefono2||'', email:c.email||'',
    resumen:c.resumen||'',
    experiencia_json:JSON.stringify(c.experiencia||[]), academico_json:JSON.stringify(c.academico||[]),
    cursos_json:JSON.stringify(c.cursos||[]), idiomas_json:JSON.stringify(c.idiomas||[]),
    software_json:JSON.stringify(c.software||[]), adjuntos_json:JSON.stringify(c.adjuntos||[]),
    fuente:c.fuente||'manual', origen_plataforma:'empleabilidad',
    estado_registro:'Activo', updated_by:miNombre(), updated_at:new Date().toISOString() };
  if(c._nuevo) row.created_by=miNombre();
  const {error}=await SB.from('cv_personas').upsert(row,{onConflict:'cv_id'});
  if(error){ toast('Error: '+error.message,'err'); return; }
  toast('✅ CV guardado','ok');
  await cargarCVs(); poblarFiltros(); renderDir(); cerrarCV();
}
async function eliminarCV(){
  if(!ES_ADMIN){ toast('Solo un administrador puede eliminar','err'); return; }
  if(!CV_EDIT||CV_EDIT._nuevo){ cerrarCV(); return; }
  if(!confirm('¿Eliminar este CV? (borrado lógico)')) return;
  const {error}=await SB.from('cv_personas').update({estado_registro:'Eliminado',updated_at:new Date().toISOString()}).eq('cv_id',CV_EDIT.cv_id);
  if(error){ toast('Error: '+error.message,'err'); return; }
  toast('CV eliminado','ok'); await cargarCVs(); renderDir(); cerrarCV();
}

// ═══════════════════════ EXPORTAR CV A PDF ═══════════════════════
function exportarCVpdf(){ if(!CV_EDIT) return; generarCVpdf(CV_EDIT); }

// ═══════════ GENERADOR CV PDF · formato limpio estilo "Apresto Laboral" (sin logo AMSA) ═══════════
// Reutilizable desde empleabilidad.html y movil.html. opts.qrUrl → agrega QR.
function generarCVpdf(c, opts){
  opts=opts||{};
  const { jsPDF }=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=210, H=297, M=20; let y=22;
  const dark=[34,34,34], gray=[110,110,110], rule=[180,180,180];
  const nl=(g)=>{ if(y>H-24){ doc.addPage(); y=22; } };
  const wrap=(t,w)=>doc.splitTextToSize(String(t||''),w);
  function titulo(t){ nl(); y+=2; doc.setFont('times','bold'); doc.setFontSize(13); doc.setTextColor.apply(doc,dark);
    doc.text(t,M,y); y+=1.5; doc.setDrawColor.apply(doc,rule); doc.setLineWidth(.3); doc.line(M,y,W-M,y); y+=6; }
  // ── Encabezado: NOMBRES APELLIDOS ──
  doc.setFont('times','bold'); doc.setFontSize(20); doc.setTextColor.apply(doc,dark);
  const nombre=((c.nombres||'')+' '+(c.apellidos||'')).trim().toUpperCase()||'CURRÍCULUM VITAE';
  doc.text(nombre,M,y); y+=7;
  // datos personales (líneas simples, como el modelo)
  doc.setFont('times','normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc,dark);
  const datos=[];
  if(c.rut) datos.push('RUT: '+c.rut);
  if(c.fecha_nacimiento) datos.push('Fecha de nacimiento: '+c.fecha_nacimiento);
  if(c.nacionalidad) datos.push('Nacionalidad: '+c.nacionalidad);
  const dir=[c.direccion,c.comuna,c.ciudad].filter(Boolean).join(', ');
  if(dir) datos.push(dir);
  const tel=[c.telefono,c.telefono2].filter(Boolean).join('  ');
  if(tel) datos.push(tel);
  if(c.email) datos.push(c.email);
  if(c.licencia||c.tipo_licencia){ datos.push('Licencia de conducir: '+[c.licencia,c.tipo_licencia].filter(Boolean).join(' ')); }
  datos.forEach(d=>{ nl(); doc.text(d,M,y); y+=5; });
  y+=2; doc.setDrawColor.apply(doc,rule); doc.setLineWidth(.4); doc.line(M,y,W-M,y); y+=7;

  // ── Resumen Profesional ──
  if((c.resumen||'').trim()){ titulo('Resumen Profesional');
    doc.setFont('times','normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc,dark);
    wrap(c.resumen,W-2*M).forEach(l=>{ nl(); doc.text(l,M,y); y+=5; }); y+=3; }

  // ── Antecedentes Laborales ──
  if((c.experiencia||[]).length){ titulo('Antecedentes Laborales');
    c.experiencia.forEach(e=>{
      nl();
      // línea 1: Empresa. Ciudad.                        Mes año – Mes año
      doc.setFont('times','bold'); doc.setFontSize(10.5); doc.setTextColor.apply(doc,dark);
      const emp=[(e.empresa||''), (e.ciudad||'')].filter(Boolean).join('. ')+((e.empresa||e.ciudad)?'.':'');
      const per=[e.desde,e.hasta].filter(Boolean).join(' – ');
      doc.text(emp,M,y);
      if(per){ doc.setFont('times','italic'); doc.setFontSize(9.5); doc.text(per,W-M,y,{align:'right'}); }
      y+=5;
      // cargo
      if(e.cargo){ doc.setFont('times','bold'); doc.setFontSize(10); doc.text(e.cargo,M,y); y+=5; }
      // funciones (viñetas)
      doc.setFont('times','normal'); doc.setFontSize(10); doc.setTextColor.apply(doc,dark);
      (e.funciones||[]).forEach(fn=>{ wrap('•  '+fn,W-2*M-3).forEach((l,i)=>{ nl(); doc.text(l,M+(i?3:0),y); y+=4.8; }); });
      if(e.logro){ doc.setFont('times','italic'); wrap('Logro: '+e.logro,W-2*M-3).forEach(l=>{ nl(); doc.text(l,M,y); y+=4.8; }); doc.setFont('times','normal'); }
      y+=3;
    });
  }

  // ── Antecedentes Académicos ──
  if((c.academico||[]).length){ titulo('Antecedentes Académicos');
    c.academico.forEach(a=>{
      nl(); doc.setFont('times','normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc,gray);
      doc.text(a.periodo||'',M,y);
      doc.setTextColor.apply(doc,dark);
      const der=[a.titulo,[a.institucion,a.ciudad].filter(Boolean).join(', ')].filter(Boolean).join(' — ');
      wrap(der,W-M-45).forEach((l,i)=>{ if(i)nl(); doc.text(l,M+30,y); y+=5; });
      y+=1;
    });
    y+=2;
  }

  // ── Información Adicional (licencias, disponibilidad, experiencia minería, idiomas, software) ──
  const info=[];
  if(c.licencia||c.tipo_licencia) info.push('Licencia de conducir: '+[c.licencia,c.tipo_licencia].filter(Boolean).join(' '));
  if(c.disponibilidad) info.push('Disponibilidad: '+c.disponibilidad);
  if(c.exp_mineria) info.push('Experiencia en minería: '+c.exp_mineria+(c.anios_exp?(' ('+c.anios_exp+' años)'):''));
  if(c.oficios) info.push('Oficios/cargos: '+c.oficios);
  (c.idiomas||[]).forEach(i=>{ if(i.idioma) info.push('Idioma: '+i.idioma+(i.nivel?(' — '+i.nivel):'')); });
  (c.software||[]).forEach(sw=>{ if(sw.nombre) info.push('Software: '+sw.nombre+(sw.nivel?(' — '+sw.nivel):'')); });
  if(c.certificaciones) info.push('Certificaciones: '+c.certificaciones);
  if(info.length){ titulo('Información Adicional');
    doc.setFont('times','normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc,dark);
    info.forEach(d=>{ wrap('•  '+d,W-2*M-3).forEach((l,i)=>{ nl(); doc.text(l,M+(i?3:0),y); y+=4.8; }); }); y+=3;
  }

  // ── Seminarios y Cursos ──
  if((c.cursos||[]).length){ titulo('Seminarios y Cursos');
    c.cursos.forEach(cu=>{
      nl(); doc.setFont('times','normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc,gray);
      doc.text(String(cu.anio||''),M,y); doc.setTextColor.apply(doc,dark);
      const t=[cu.evento,cu.tema,cu.institucion].filter(Boolean).join(' — ');
      wrap(t,W-M-45).forEach((l,i)=>{ if(i)nl(); doc.text(l,M+18,y); y+=5; });
    });
    y+=3;
  }

  // ── QR (fase Ferias Laborales) ──
  if(opts.qrUrl){
    try{
      const qy=Math.min(y+4, H-40);
      doc.addImage(opts.qrUrl,'PNG',W-M-26,qy,26,26);
      doc.setFont('times','italic'); doc.setFontSize(7.5); doc.setTextColor.apply(doc,gray);
      doc.text('Ficha digital',W-M-13,qy+29,{align:'center'});
    }catch(e){}
  }
  doc.save(('CV_'+(c.nombres||'')+'_'+(c.apellidos||'')).replace(/\s+/g,'_').replace(/[^\w\-]/g,'')+'.pdf');
}

// Genera un dataURL de QR usando la API pública de imágenes QR (para incrustar en el PDF).
async function generarQRDataUrl(texto){
  try{
    const url='https://api.qrserver.com/v1/create-qr-code/?size=180x180&data='+encodeURIComponent(texto);
    const resp=await fetch(url); const blob=await resp.blob();
    return await new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=()=>res(null); r.readAsDataURL(blob); });
  }catch(e){ return null; }
}
// Exporta con QR (para la fase Ferias Laborales): construye la URL de ficha y adjunta el QR
async function exportarCVpdfConQR(){
  if(!CV_EDIT) return;
  const fichaUrl=location.origin+location.pathname.replace(/modules\/[^/]*\/.*$/,'modules/empleabilidad/')+'#cv='+encodeURIComponent(CV_EDIT.cv_id);
  const qr=await generarQRDataUrl(fichaUrl);
  generarCVpdf(CV_EDIT,{qrUrl:qr});
}

// ═══════════════════════ CARGA DE CV DESDE ARCHIVO (PDF / Word) ═══════════════════════
async function cargarCVArchivo(files){
  if(!files||!files.length) return;
  for(const file of files){
    try{
      // Lectura con estructura: PDF con texto, PDF escaneado (OCR), Word o foto.
      const lectura=await leerDocumento(file);
      const cv=estructurarCV(lectura,file.name);
      CV_EDIT=cv; renderFicha(); document.getElementById('cvModal').classList.add('show');
      const et=ORIGEN_ETIQUETA[lectura.origen]||lectura.origen;
      toast('Leído desde '+et+' · '+(cv._completitud||0)+'% de los datos reconocidos. Revisa antes de guardar.','ok');
      if((cv._avisos||[]).length) setTimeout(()=>alert('Al leer el documento:\n\n• '+cv._avisos.join('\n• ')),400);
    }catch(e){ toast('Error leyendo '+file.name+': '+e.message,'err'); }
  }
  document.getElementById('cvFileInput').value='';
}
async function leerPDF(file){
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const buf=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buf}).promise;
  let txt='';
  for(let i=1;i<=pdf.numPages;i++){ const page=await pdf.getPage(i); const c=await page.getTextContent(); txt+=c.items.map(it=>it.str).join(' ')+'\n'; }
  return txt;
}
async function leerWord(file){
  const buf=await file.arrayBuffer();
  const res=await mammoth.extractRawText({arrayBuffer:buf});
  return res.value||'';
}
// Estandariza texto libre → estructura CV (heurística; el usuario corrige)
function estandarizarTexto(texto,fname){
  const cv={ cv_id:'cv_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    rut:'',nombres:'',apellidos:'',fecha_nacimiento:'',sexo:'',nacionalidad:'',direccion:'',comuna:'',ciudad:'',
    telefono:'',telefono2:'',email:'',resumen:'',experiencia:[],academico:[],cursos:[],idiomas:[],software:[],adjuntos:[],
    licencia:'',tipo_licencia:'',oficios:'',exp_mineria:'',certificaciones:'',educacion:'',
    fuente:'pdf', _nuevo:true };
  const t=texto.replace(/\r/g,'');
  const lineas=t.split('\n').map(l=>l.trim()).filter(Boolean);
  const bajo=t.toLowerCase();

  // ── RUT ──
  const mrut=t.match(/(\d{1,2}\.?\d{3}\.?\d{3}\s*[\-\.]?\s*[\dkK])/); if(mrut) cv.rut=mrut[1].replace(/\s/g,'');
  // ── email ──
  const mail=t.match(/[\w.\-]+@[\w.\-]+\.\w+/); if(mail) cv.email=mail[0];
  // ── teléfonos (hasta 2) ──
  const tels=t.match(/(\+?56\s?9\s?\d{4}\s?\d{4}|\b9\s?\d{4}\s?\d{4}\b|\+?56\s?2\s?\d{3,4}\s?\d{4})/g)||[];
  if(tels[0]) cv.telefono=tels[0].trim();
  if(tels[1]) cv.telefono2=tels[1].trim();
  // ── fecha de nacimiento ──
  const mfn=t.match(/(?:nacimiento|nacid[oa]|f\.?\s*nac)[^\d]{0,15}(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i); if(mfn) cv.fecha_nacimiento=mfn[1];
  // ── nacionalidad ──
  const mnac=bajo.match(/nacionalidad\s*:?\s*([a-záéíóúñ]+)/i); if(mnac) cv.nacionalidad=mnac[1].charAt(0).toUpperCase()+mnac[1].slice(1);
  else if(/chilen[oa]/.test(bajo)) cv.nacionalidad='Chilena';
  // ── sexo ──
  if(/\bfemenino\b|\bmujer\b/.test(bajo)) cv.sexo='Femenino'; else if(/\bmasculino\b|\bhombre\b/.test(bajo)) cv.sexo='Masculino';
  // ── comuna / dirección ──
  const mcom=t.match(/comuna\s*:?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ ]{3,30})/i); if(mcom) cv.comuna=mcom[1].trim();
  const mdir=t.match(/(?:direcci[oó]n|domicilio)\s*:?\s*([^\n]{5,60})/i); if(mdir) cv.direccion=mdir[1].trim();
  // ── licencia de conducir ──
  const mlic=t.match(/licencia[^\n]{0,30}(clase\s*)?([A-E]\-?\d?)/i); if(mlic){ cv.licencia='Sí'; cv.tipo_licencia=(mlic[2]||'').toUpperCase(); }
  else if(/licencia de conducir/i.test(bajo)) cv.licencia='Sí';
  // ── experiencia en minería ──
  if(/miner[íia]|faena|caex|extracci[oó]n|planta concentradora/i.test(bajo)) cv.exp_mineria='Sí';

  // ── nombre: primera línea "de nombre" (2-5 palabras, mayúsculas, sin dígitos ni @) ──
  for(const l of lineas.slice(0,8)){
    const p=l.split(/\s+/);
    if(p.length>=2 && p.length<=5 && /^[A-ZÁÉÍÓÚÑ]/.test(l) && !/@|\d{3}|rut|curr[íi]culum|vitae|cv\b/i.test(l) && p.every(w=>/^[A-ZÁÉÍÓÚÑa-záéíóúñ.\-]+$/.test(w))){
      const mid=Math.ceil(p.length/2); cv.nombres=p.slice(0,mid).join(' '); cv.apellidos=p.slice(mid).join(' '); break;
    }
  }

  // ── secciones por encabezados ──
  function seccion(regexIni){
    const encs=/(perfil|resumen|objetivo|experiencia|antecedentes laborales|formaci[oó]n|educaci[oó]n|antecedentes acad[eé]micos|cursos|seminarios|capacitaci|certificaci|idiomas|software|habilidades|informaci[oó]n adicional|referencias)/i;
    for(let i=0;i<lineas.length;i++){
      if(regexIni.test(lineas[i])){
        const out=[];
        for(let j=i+1;j<lineas.length;j++){ if(encs.test(lineas[j]) && lineas[j].length<40){ break; } out.push(lineas[j]); }
        return out;
      }
    }
    return null;
  }
  // resumen
  const resL=seccion(/perfil|resumen|objetivo/i); if(resL) cv.resumen=resL.slice(0,6).join(' ').replace(/\s+/g,' ').trim().slice(0,600);
  // experiencia
  const expL=seccion(/experiencia|antecedentes laborales/i);
  if(expL && expL.length){
    // cada bloque: línea con empresa/cargo seguida de viñetas
    let cur=null;
    expL.forEach(l=>{
      const esBullet=/^[\-•·*]/.test(l);
      const tienePeriodo=/\b(19|20)\d{2}\b/.test(l) || /(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/i.test(l);
      if(!esBullet && (tienePeriodo || l.length<60)){
        if(cur) cv.experiencia.push(cur);
        cur={cargo:l.replace(/\s{2,}.*$/,'').trim(),empresa:'',ciudad:'',pais:'',desde:'',hasta:'',funciones:[],logro:''};
        const per=l.match(/((19|20)\d{2}).{0,6}((19|20)\d{2}|actual|presente)/i); if(per){ cur.desde=per[1]; cur.hasta=per[3]; }
      } else if(cur){ cur.funciones.push(l.replace(/^[\-•·*]\s*/,'').trim()); }
    });
    if(cur) cv.experiencia.push(cur);
  }
  // educación / académico
  const eduL=seccion(/formaci[oó]n|educaci[oó]n|antecedentes acad/i);
  if(eduL && eduL.length){
    eduL.slice(0,8).forEach(l=>{ if(l.length>4){ const per=(l.match(/((19|20)\d{2})/)||[])[1]||''; cv.academico.push({periodo:per,titulo:l.replace(/^[\-•·*]\s*/,'').trim(),institucion:'',ciudad:''}); } });
    cv.educacion=eduL.slice(0,4).join(' · ');
  }
  // cursos / seminarios / certificaciones
  const curL=seccion(/cursos|seminarios|capacitaci|certificaci/i);
  if(curL && curL.length){
    curL.slice(0,12).forEach(l=>{ if(l.length>3){ const anio=(l.match(/((19|20)\d{2})/)||[])[1]||''; cv.cursos.push({anio,evento:l.replace(/^[\-•·*]\s*/,'').replace(/(19|20)\d{2}/,'').trim(),tema:'',institucion:''}); } });
    cv.certificaciones=curL.slice(0,6).map(l=>l.replace(/^[\-•·*]\s*/,'').trim()).join('; ');
  }

  cv.adjuntos=[{nombre:fname,url:''}];
  return cv;
}

// ═══════════════════════ CARGA MASIVA EXCEL ═══════════════════════
async function cargarExcelMasivo(file){
  if(!file) return;
  try{
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    const ws=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
    if(!rows.length){ toast('El Excel está vacío','err'); return; }
    // mapeo flexible de columnas
    const norm=s=>String(s||'').toLowerCase().trim();
    const pick=(row,keys)=>{ for(const k of Object.keys(row)){ if(keys.some(x=>norm(k).includes(x))) return row[k]; } return ''; };
    const nuevos=[];
    rows.forEach(r=>{
      const nombres=pick(r,['nombre']), apellidos=pick(r,['apellido']);
      if(!nombres&&!apellidos) return;
      nuevos.push({ cv_id:'cv_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),
        rut:String(pick(r,['rut'])||''), nombres:String(nombres), apellidos:String(apellidos),
        fecha_nacimiento:String(pick(r,['nacim','fecha nac'])||''), sexo:String(pick(r,['sexo','genero'])||''),
        nacionalidad:String(pick(r,['nacional'])||''), direccion:String(pick(r,['direcc'])||''),
        comuna:String(pick(r,['comuna'])||''), ciudad:String(pick(r,['ciudad'])||''),
        telefono:String(pick(r,['telefono','fono','celular'])||''), email:String(pick(r,['email','correo'])||''),
        resumen:String(pick(r,['resumen','perfil'])||''),
        experiencia_json:'[]',academico_json:'[]',cursos_json:'[]',idiomas_json:'[]',software_json:'[]',adjuntos_json:'[]',
        fuente:'excel', origen_plataforma:'empleabilidad', estado_registro:'Activo', created_by:miNombre(), updated_by:miNombre(), updated_at:new Date().toISOString() });
    });
    if(!nuevos.length){ toast('No se detectaron filas con nombre/apellido','err'); return; }
    const {error}=await SB.from('cv_personas').insert(nuevos);
    if(error){ toast('Error: '+error.message,'err'); return; }
    toast('✅ '+nuevos.length+' CV cargados desde Excel','ok');
    await cargarCVs(); poblarFiltros(); renderDir();
  }catch(e){ toast('Error leyendo Excel: '+e.message,'err'); }
  document.getElementById('xlsInput').value='';
}

// ═══════════════════════ DUPLICADOS POR RUT ═══════════════════════
function revisarDuplicados(){
  const map={};
  CVS.forEach(cv=>{ const r=(cv.rut||'').replace(/[.\-\s]/g,'').toLowerCase(); if(!r) return; (map[r]=map[r]||[]).push(cv); });
  const grupos=Object.values(map).filter(g=>g.length>1);
  const body=document.getElementById('dupBody');
  if(!grupos.length){ body.innerHTML='<div class="empty">✅ No se detectaron RUT duplicados.</div>'; document.getElementById('dupModal').classList.add('show'); return; }
  let h=`<div style="font-size:.85rem;color:var(--text-muted);margin-bottom:12px">${grupos.length} RUT con registros repetidos. Elige cuál conservar; los demás se eliminan.</div>`;
  grupos.forEach((g,gi)=>{
    h+=`<div class="dup-group"><div style="font-weight:700;margin-bottom:8px">RUT: ${esc(g[0].rut||'(sin formato)')}</div>`;
    g.forEach(cv=>{
      const exp=(cv.experiencia||[]).length, cur=(cv.cursos||[]).length;
      h+=`<div style="display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--border);border-radius:8px;padding:9px 12px;margin-bottom:6px">
        <div style="flex:1"><b>${esc((cv.nombres||'')+' '+(cv.apellidos||''))}</b>
        <span style="font-size:.74rem;color:var(--text-muted)"> · ${esc(cv.comuna||'')} · ${exp} exp · ${cur} cursos · fuente: ${esc(cv.fuente||'')}</span></div>
        <button class="btn sec" style="padding:5px 11px" onclick="abrirCV('${cv.cv_id}');document.getElementById('dupModal').classList.remove('show')">Ver</button>
        <button class="btn" style="padding:5px 11px" onclick="conservarCV('${cv.cv_id}',${JSON.stringify(g.map(x=>x.cv_id)).replace(/"/g,'&quot;')})">✓ Conservar este</button>
      </div>`;
    });
    h+='</div>';
  });
  body.innerHTML=h;
  document.getElementById('dupModal').classList.add('show');
}
async function conservarCV(keepId,allIds){
  if(!ES_ADMIN){ toast('Solo un administrador puede resolver duplicados','err'); return; }
  const ids=(typeof allIds==='string')?JSON.parse(allIds.replace(/&quot;/g,'"')):allIds;
  const borrar=ids.filter(i=>i!==keepId);
  if(!borrar.length){ return; }
  if(!confirm('Conservar 1 registro y eliminar '+borrar.length+' duplicado(s)?')) return;
  const {error}=await SB.from('cv_personas').update({estado_registro:'Eliminado',updated_at:new Date().toISOString()}).in('cv_id',borrar);
  if(error){ toast('Error: '+error.message,'err'); return; }
  toast('✅ Duplicados resueltos','ok');
  await cargarCVs(); poblarFiltros(); renderDir(); revisarDuplicados();
}

// ═══════════════════════ EXPORTAR DIRECTORIO A EXCEL ═══════════════════════
function exportarExcelDir(){
  const list=filtrarCVs();
  if(!list.length){ toast('No hay CV para exportar','err'); return; }
  const rows=list.map(cv=>({
    RUT:cv.rut||'', Nombres:cv.nombres||'', Apellidos:cv.apellidos||'',
    'Fecha Nac':cv.fecha_nacimiento||'', Sexo:cv.sexo||'', Nacionalidad:cv.nacionalidad||'',
    Comuna:cv.comuna||'', Ciudad:cv.ciudad||'', Direccion:cv.direccion||'',
    Telefono:cv.telefono||'', Email:cv.email||'', Resumen:cv.resumen||'',
    // experiencia combinada en una celda, cada experiencia separada por " | ", campos por ";"
    Experiencia:(cv.experiencia||[]).map(e=>[e.cargo,e.empresa,e.ciudad,e.pais,(e.desde||'')+'-'+(e.hasta||''),(e.funciones||[]).join(', ')].join(';')).join(' | '),
    Educacion:(cv.academico||[]).map(a=>[a.titulo,a.institucion,a.periodo,a.ciudad].join(';')).join(' | '),
    Cursos:(cv.cursos||[]).map(c=>[c.evento,c.tema,c.institucion,c.anio].join(';')).join(' | '),
    'Match %':cv._pct||0
  }));
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb,ws,'Directorio CV');
  // hoja de instrucciones para análisis / CSV
  const instr=[
    ['INSTRUCCIONES PARA ANÁLISIS DE DATOS'],[''],
    ['Este archivo consolida los CV del directorio de Empleabilidad AM.'],
    ['Las columnas Experiencia, Educacion y Cursos combinan varios registros en una sola celda:'],
    ['  • Cada registro (ej. cada experiencia laboral) se separa con el símbolo " | " (barra vertical).'],
    ['  • Dentro de cada registro, los campos se separan con ";" (punto y coma).'],
    [''],
    ['Ejemplo de Experiencia:'],
    ['  Operador CAEX;Minera X;Calama;Chile;2018-2022;Operación de equipos, mantención | Ayudante;Empresa Y;Antofagasta;Chile;2015-2018;Apoyo terreno'],
    [''],
    ['Para análisis en Python/CSV:'],
    ['  1. Exportar esta hoja "Directorio CV" a .csv (Archivo → Guardar como → CSV UTF-8).'],
    ['  2. Separar la columna Experiencia por " | " para obtener cada empleo como fila (explode).'],
    ['  3. Separar cada empleo por ";" para obtener: cargo, empresa, ciudad, pais, periodo, funciones.'],
    ['  4. Repetir el mismo procedimiento con Educacion y Cursos.'],
    [''],
    ['La columna "Match %" corresponde al match contra la oferta filtrada (o el mejor match si no hay filtro).']
  ];
  const wsI=XLSX.utils.aoa_to_sheet(instr);
  XLSX.utils.book_append_sheet(wb,wsI,'Instrucciones');
  XLSX.writeFile(wb,'Directorio_CV_Empleabilidad_'+new Date().toISOString().slice(0,10)+'.xlsx');
  toast('✅ Excel exportado ('+list.length+' CV)','ok');
}

// ═══════════════════════ OFERTAS Y MATCHING (Fase 2) ═══════════════════════
let OF_EDIT=null;

function renderOfertas(){
  const cont=document.getElementById('ofListado');
  document.getElementById('ofCount').textContent=OFERTAS.length+' oferta'+(OFERTAS.length===1?'':'s');
  if(!OFERTAS.length){ cont.innerHTML='<div class="empty">Sin ofertas aún. Crea la primera con "Generar oferta".</div>'; return; }
  let h='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">';
  OFERTAS.forEach(o=>{
    const nPost=POSTUL.filter(p=>p.oferta_id===o.oferta_id).length;
    const nCrit=(o.criterios||[]).length;
    // top match
    const matches=CVS.map(cv=>matchPct(cv,o));
    const topM=matches.length?Math.max(0,...matches):0;
    const conMatch=matches.filter(m=>m>=50).length;
    h+=`<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.05)">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:1.2rem;font-weight:800;color:var(--teal);text-transform:uppercase">${esc(o.cargo||'(sin cargo)')}</div>
      <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:8px">${esc(o.empresa||'')}${o.comuna?' · '+esc(o.comuna):''}</div>
      <div style="display:flex;gap:14px;margin-bottom:12px;font-size:.78rem">
        <div><b style="font-size:1.1rem;color:var(--teal)">${nCrit}</b><br>criterios</div>
        <div><b style="font-size:1.1rem;color:var(--teal)">${conMatch}</b><br>≥50% match</div>
        <div><b style="font-size:1.1rem;color:var(--gold)">${nPost}</b><br>postulan</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn" style="flex:1;justify-content:center" onclick="verPostulantes('${o.oferta_id}')">👥 Ver candidatos</button>
        <button class="btn sec" onclick="editarOferta('${o.oferta_id}')">✏</button>
      </div>
    </div>`;
  });
  h+='</div>';
  cont.innerHTML=h;
}

function nuevaOferta(){
  OF_EDIT={ oferta_id:'of_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6), empresa:'',cargo:'',descripcion:'',comuna:'',criterios:[], _nuevo:true };
  document.getElementById('ofModalTitle').textContent='Nueva oferta';
  document.getElementById('ofEmpresa').value=''; document.getElementById('ofCargo').value='';
  document.getElementById('ofComuna').value=''; document.getElementById('ofDesc').value='';
  renderCriterios();
  document.getElementById('ofModal').classList.add('show');
}
function editarOferta(id){
  const o=OFERTAS.find(x=>x.oferta_id===id); if(!o) return;
  OF_EDIT=JSON.parse(JSON.stringify(o)); OF_EDIT.criterios=OF_EDIT.criterios||[];
  document.getElementById('ofModalTitle').textContent='Editar oferta';
  document.getElementById('ofEmpresa').value=o.empresa||''; document.getElementById('ofCargo').value=o.cargo||'';
  document.getElementById('ofComuna').value=o.comuna||''; document.getElementById('ofDesc').value=o.descripcion||'';
  renderCriterios();
  document.getElementById('ofModal').classList.add('show');
}
function cerrarOferta(){ document.getElementById('ofModal').classList.remove('show'); OF_EDIT=null; }
function renderCriterios(){
  const cont=document.getElementById('ofCriterios');
  cont.innerHTML=(OF_EDIT.criterios||[]).map((c,i)=>`<div style="display:flex;gap:8px;margin-bottom:7px;align-items:center">
    <input value="${esc(c.texto||'')}" oninput="OF_EDIT.criterios[${i}].texto=this.value" placeholder="Ej: 5 años minería, licencia B, curso CAEX, residencia Calama..." style="flex:1;border:1.5px solid var(--border);border-radius:7px;padding:8px 10px;font-size:.85rem">
    <input type="number" min="0" max="100" value="${c.ponderacion||0}" oninput="OF_EDIT.criterios[${i}].ponderacion=parseInt(this.value)||0;actualizarPondWarn()" style="width:64px;border:1.5px solid var(--border);border-radius:7px;padding:8px;text-align:center;font-size:.85rem"> %
    <b onclick="delCriterio(${i})" style="cursor:pointer;color:#c0311b">✕</b></div>`).join('');
  actualizarPondWarn();
}
function addCriterio(){ OF_EDIT.criterios.push({id:'c'+Date.now().toString(36),texto:'',ponderacion:0,tipo:'keyword'}); renderCriterios(); }
function delCriterio(i){ OF_EDIT.criterios.splice(i,1); renderCriterios(); }
function actualizarPondWarn(){
  const suma=(OF_EDIT.criterios||[]).reduce((a,c)=>a+(+c.ponderacion||0),0);
  const w=document.getElementById('ofPondWarn');
  if(!OF_EDIT.criterios.length){ w.textContent=''; return; }
  w.textContent='Suma de ponderaciones: '+suma+'%'+(suma===100?' ✓':' (ideal 100%)');
  w.style.color=suma===100?'#1e7e34':'#b8860b';
}
async function guardarOferta(){
  const o=OF_EDIT; if(!o) return;
  o.empresa=document.getElementById('ofEmpresa').value.trim();
  o.cargo=document.getElementById('ofCargo').value.trim();
  o.comuna=document.getElementById('ofComuna').value.trim();
  o.descripcion=document.getElementById('ofDesc').value.trim();
  if(!o.cargo && !o.empresa){ toast('Ingresa al menos empresa o cargo','err'); return; }
  const row={ oferta_id:o.oferta_id, empresa:o.empresa, cargo:o.cargo, descripcion:o.descripcion, comuna:o.comuna,
    criterios_json:JSON.stringify(o.criterios||[]), estado:'Abierta', estado_registro:'Activo',
    updated_by:miNombre(), updated_at:new Date().toISOString() };
  if(o._nuevo) row.created_by=miNombre();
  const {error}=await SB.from('cv_ofertas').upsert(row,{onConflict:'oferta_id'});
  if(error){ toast('Error: '+error.message,'err'); return; }
  toast('✅ Oferta guardada','ok');
  await cargarOfertas(); poblarFiltros(); renderOfertas(); renderDir(); cerrarOferta();
}
async function eliminarOferta(){
  if(!ES_ADMIN){ toast('Solo un administrador puede eliminar','err'); return; }
  if(!OF_EDIT||OF_EDIT._nuevo){ cerrarOferta(); return; }
  if(!confirm('¿Eliminar esta oferta?')) return;
  const {error}=await SB.from('cv_ofertas').update({estado_registro:'Eliminado',updated_at:new Date().toISOString()}).eq('oferta_id',OF_EDIT.oferta_id);
  if(error){ toast('Error: '+error.message,'err'); return; }
  toast('Oferta eliminada','ok'); await cargarOfertas(); poblarFiltros(); renderOfertas(); renderDir(); cerrarOferta();
}

// ── Postulantes de una oferta ──
let POST_OFERTA=null;
function verPostulantes(id){
  POST_OFERTA=OFERTAS.find(o=>o.oferta_id===id); if(!POST_OFERTA) return;
  document.getElementById('postTitle').textContent='Candidatos · '+(POST_OFERTA.cargo||POST_OFERTA.empresa);
  document.getElementById('postMin').value=0;
  renderPostulantes();
  document.getElementById('postModal').classList.add('show');
}
function renderPostulantes(){
  const o=POST_OFERTA; if(!o) return;
  const min=parseInt(document.getElementById('postMin').value)||0;
  const rank=CVS.map(cv=>({cv,pct:matchPct(cv,o)})).filter(x=>x.pct>=min).sort((a,b)=>b.pct-a.pct);
  const body=document.getElementById('postBody');
  if(!rank.length){ body.innerHTML='<div class="empty">Sin candidatos con ese % mínimo.</div>'; return; }
  let h='';
  rank.forEach(({cv,pct})=>{
    const col=pct>=70?'#1e7e34':pct>=40?'#b8860b':'#c0311b';
    const post=POSTUL.find(p=>p.oferta_id===o.oferta_id&&p.cv_id===cv.cv_id);
    h+=`<div style="display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--border);border-radius:10px;padding:11px 14px;margin-bottom:8px">
      <div style="flex:1"><b>${esc((cv.nombres||'')+' '+(cv.apellidos||''))}</b>
        <span style="font-size:.74rem;color:var(--text-muted)"> · ${esc(cv.comuna||'')} ${cv.telefono?'· '+esc(cv.telefono):''}</span></div>
      <span class="match-bar"><div style="width:${pct}%;background:${col}"></div></span><b style="color:${col};width:44px;text-align:right">${pct}%</b>
      ${post
        ? `<span class="chip" style="background:#e6f4ea;color:#1e7e34">✓ ${esc(post.estado||'Postulado')}</span><button class="btn sec" style="padding:5px 10px" onclick="seguimientoPost('${post.postulacion_id}')">Seguimiento</button>`
        : `<button class="btn" style="padding:6px 14px" onclick="postular('${cv.cv_id}','${o.oferta_id}',${pct})">Postula</button>`}
    </div>`;
  });
  body.innerHTML=h;
}
async function postular(cvId,ofertaId,pct){
  const row={ postulacion_id:'ps_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),
    cv_id:cvId, oferta_id:ofertaId, estado:'Postulado',
    fecha_postulacion:new Date().toISOString().slice(0,10), match_pct:pct||0,
    estado_registro:'Activo', created_by:miNombre(), updated_by:miNombre(), updated_at:new Date().toISOString() };
  const {error}=await SB.from('cv_postulaciones').insert(row);
  if(error){ toast('Error: '+error.message,'err'); return; }
  toast('✅ Postulación registrada','ok');
  await cargarPostulaciones(); renderPostulantes(); renderOfertas();
}
async function seguimientoPost(pid){
  const p=POSTUL.find(x=>x.postulacion_id===pid); if(!p) return;
  const estados=['Postulado','En proceso','Entrevista','Seleccionado','Descartado'];
  const nuevoEstado=prompt('Estado de la postulación ('+estados.join(' / ')+'):', p.estado||'Postulado');
  if(nuevoEstado===null) return;
  const comentarios=prompt('Comentarios / seguimiento:', p.comentarios||'')||'';
  let motivo=p.motivo_no||'', resultado=p.resultado||'';
  if(/descart/i.test(nuevoEstado)) motivo=prompt('Motivo por el que no quedó seleccionado:', p.motivo_no||'')||'';
  if(/seleccion/i.test(nuevoEstado)) resultado=prompt('Resultado final:', p.resultado||'Seleccionado')||'';
  const {error}=await SB.from('cv_postulaciones').update({estado:nuevoEstado,comentarios,motivo_no:motivo,resultado,updated_by:miNombre(),updated_at:new Date().toISOString()}).eq('postulacion_id',pid);
  if(error){ toast('Error: '+error.message,'err'); return; }
  toast('✅ Seguimiento actualizado','ok');
  await cargarPostulaciones(); renderPostulantes();
}

// ═══════════════════════ BECADOS (alumnos becados · línea de tiempo de hitos) ═══════════════════════
let BECADOS=[], BEC_EDIT=null;
const BEC_TIPOS=['Ingreso','Práctica','Beca','Examen/Título','Egreso','Otro'];

async function cargarBecados(){
  const {data,error}=await SB.from('becados').select('*').neq('estado_registro','Eliminado').order('nombre');
  if(error){ toast('Error cargando becados: '+error.message,'err'); BECADOS=[]; return; }
  BECADOS=(data||[]).map(b=>({...b, hitos:(function(){try{const h=JSON.parse(b.hitos_json||'[]');return Array.isArray(h)?h:[]}catch(e){return[]}})() }));
}

function renderBecados(){
  const cont=document.getElementById('becContent'); if(!cont) return;
  const q=(document.getElementById('becSearch')?.value||'').toLowerCase().trim();
  const list=BECADOS.filter(b=>{ if(!q)return true; return [b.nombre,b.carrera,b.institucion].join(' ').toLowerCase().includes(q); });
  document.getElementById('becCount').textContent=list.length+' becado'+(list.length===1?'':'s');
  if(!list.length){ cont.innerHTML='<div class="empty">Sin becados aún. Usa "＋ Nuevo becado".</div>'; return; }
  cont.innerHTML=list.map(b=>becCardHtml(b)).join('');
}
function becEstadoColor(e){ e=(e||'').toLowerCase(); if(e.includes('egres'))return '#1e7e34'; if(e.includes('retir'))return '#c0311b'; return '#006973'; }
function becHitoColor(e){ e=(e||'').toLowerCase(); if(e.includes('cumpl'))return '#1e7e34'; if(e.includes('curso'))return '#b8860b'; return '#9aa5ac'; }
function becCardHtml(b){
  const hitos=(b.hitos||[]).slice().sort((x,y)=>String(x.fecha||'').localeCompare(String(y.fecha||'')));
  const cumplidos=hitos.filter(h=>(h.estado||'').toLowerCase().includes('cumpl')).length;
  let h='<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.05)">';
  // encabezado
  h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">';
  h+='<div style="flex:1;min-width:200px"><div style="font-family:\'Barlow Condensed\',sans-serif;font-size:1.25rem;font-weight:800;color:var(--teal);text-transform:uppercase">'+esc(b.nombre)+'</div>';
  h+='<div style="font-size:.84rem;color:var(--text-muted);margin-top:2px">'+esc(b.carrera||'')+(b.institucion?' · '+esc(b.institucion):'')+'</div>';
  h+='<div style="font-size:.78rem;color:var(--text-muted);margin-top:2px">'+[b.duracion?('Duración: '+esc(b.duracion)):'',(b.anio_inicio||b.anio_termino)?('('+esc(b.anio_inicio||'?')+' – '+esc(b.anio_termino||'?')+')'):''].filter(Boolean).join(' · ')+'</div></div>';
  h+='<div style="text-align:right"><span class="chip" style="background:#e4f6f5;color:'+becEstadoColor(b.estado)+';font-weight:700">'+esc(b.estado||'Vigente')+'</span>';
  h+='<div style="font-size:.74rem;color:var(--text-muted);margin-top:4px">'+cumplidos+'/'+hitos.length+' hitos</div></div></div>';
  // LÍNEA DE TIEMPO
  if(hitos.length){
    h+='<div style="margin-top:16px;padding-left:6px">';
    hitos.forEach((ht,i)=>{
      const col=becHitoColor(ht.estado); const last=(i===hitos.length-1);
      h+='<div style="display:flex;gap:12px;position:relative">';
      // columna del punto + línea
      h+='<div style="display:flex;flex-direction:column;align-items:center">';
      h+='<div style="width:16px;height:16px;border-radius:50%;background:'+col+';border:2px solid #fff;box-shadow:0 0 0 2px '+col+';flex-shrink:0"></div>';
      if(!last) h+='<div style="width:2px;flex:1;background:#e0e6e9;min-height:26px"></div>';
      h+='</div>';
      // contenido del hito
      h+='<div style="padding-bottom:'+(last?'0':'16px')+';flex:1">';
      h+='<div style="font-size:.82rem;font-weight:700">'+esc(ht.titulo||ht.tipo||'Hito')+' <span style="font-weight:400;color:var(--text-muted)">'+(ht.tipo?('· '+esc(ht.tipo)):'')+'</span></div>';
      h+='<div style="font-size:.74rem;color:'+col+';font-weight:600">'+esc(ht.estado||'Pendiente')+(ht.fecha?(' · '+esc(ht.fecha)):'')+'</div>';
      if(ht.comentario) h+='<div style="font-size:.76rem;color:var(--text-muted);background:#f5f8f9;border-radius:6px;padding:5px 8px;margin-top:4px">'+esc(ht.comentario)+'</div>';
      h+='</div></div>';
    });
    h+='</div>';
  } else {
    h+='<div style="font-size:.8rem;color:var(--text-muted);margin-top:12px;font-style:italic">Sin hitos registrados aún.</div>';
  }
  h+='<div style="margin-top:14px;text-align:right"><button class="btn sec" style="padding:6px 14px" onclick="editarBecado(\''+b.becado_id+'\')">✏ Editar / hitos</button></div>';
  h+='</div>';
  return h;
}

function nuevoBecado(){
  BEC_EDIT={ becado_id:'bec_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),
    nombre:'',carrera:'',institucion:'',duracion:'',anio_inicio:'',anio_termino:'',estado:'Vigente',
    contacto:'',telefono:'',email:'',observaciones:'',hitos:[], _nuevo:true };
  renderBecadoForm(); document.getElementById('becModal').classList.add('show');
}
function editarBecado(id){
  const b=BECADOS.find(x=>x.becado_id===id); if(!b) return;
  BEC_EDIT=JSON.parse(JSON.stringify(b)); BEC_EDIT.hitos=BEC_EDIT.hitos||[];
  renderBecadoForm(); document.getElementById('becModal').classList.add('show');
}
function cerrarBecado(){ document.getElementById('becModal').classList.remove('show'); BEC_EDIT=null; }

function renderBecadoForm(){
  const b=BEC_EDIT;
  document.getElementById('becModalTitle').textContent=(b._nuevo?'Nuevo becado':'Editar becado')+(b.nombre?(' · '+b.nombre):'');
  const inp=(k,ph)=>'<input value="'+esc(b[k]==null?'':b[k])+'" oninput="BEC_EDIT.'+k+'=this.value" placeholder="'+ph+'">';
  let h='<div class="sec-t">Datos del alumno</div>';
  h+='<div class="fld"><label>Nombre del alumno *</label>'+inp('nombre','Nombre completo')+'</div>';
  h+='<div class="grid2"><div class="fld"><label>Carrera</label>'+inp('carrera','Ej: Técnico en Minería')+'</div>';
  h+='<div class="fld"><label>Institución</label>'+inp('institucion','Universidad / Instituto')+'</div></div>';
  h+='<div class="grid3"><div class="fld"><label>Duración</label>'+inp('duracion','Ej: 8 semestres')+'</div>';
  h+='<div class="fld"><label>Año inicio</label>'+inp('anio_inicio','2025')+'</div>';
  h+='<div class="fld"><label>Año término (est.)</label>'+inp('anio_termino','2029')+'</div></div>';
  h+='<div class="grid3"><div class="fld"><label>Estado</label><select onchange="BEC_EDIT.estado=this.value">'+['Vigente','Egresado','Retirado'].map(o=>'<option '+(b.estado===o?'selected':'')+'>'+o+'</option>').join('')+'</select></div>';
  h+='<div class="fld"><label>Teléfono</label>'+inp('telefono','+56 9 ...')+'</div>';
  h+='<div class="fld"><label>Email</label>'+inp('email','correo@...')+'</div></div>';
  h+='<div class="fld"><label>Observaciones</label><textarea oninput="BEC_EDIT.observaciones=this.value" placeholder="Notas de seguimiento...">'+esc(b.observaciones||'')+'</textarea></div>';
  // HITOS (línea de tiempo editable)
  h+='<div class="sec-t">Hitos / línea de tiempo <button class="btn sec" style="float:right;padding:4px 10px;font-size:.78rem" onclick="addHitoBec()">＋ Agregar hito</button></div>';
  h+='<div style="font-size:.75rem;color:var(--text-muted);margin-bottom:8px">Registra prácticas, becas, exámenes y demás hitos con su fecha y estado. Se ordenan por fecha en la línea de tiempo.</div>';
  h+='<div id="becHitos"></div>';
  document.getElementById('becModalBody').innerHTML=h;
  renderHitosBec();
}
function renderHitosBec(){
  const cont=document.getElementById('becHitos');
  cont.innerHTML=(BEC_EDIT.hitos||[]).map((ht,i)=>
    '<div style="background:#f7fafa;border:1px solid var(--border);border-radius:9px;padding:12px;margin-bottom:9px;position:relative">'
    +'<span style="position:absolute;top:8px;right:10px;color:#c0311b;cursor:pointer;font-weight:700" onclick="delHitoBec('+i+')">✕</span>'
    +'<div class="grid2"><div class="fld"><label>Tipo</label><select onchange="BEC_EDIT.hitos['+i+'].tipo=this.value">'+BEC_TIPOS.map(o=>'<option '+(ht.tipo===o?'selected':'')+'>'+o+'</option>').join('')+'</select></div>'
    +'<div class="fld"><label>Título / detalle</label><input value="'+esc(ht.titulo||'')+'" oninput="BEC_EDIT.hitos['+i+'].titulo=this.value" placeholder="Ej: Práctica profesional I"></div></div>'
    +'<div class="grid2"><div class="fld"><label>Fecha</label><input type="date" value="'+esc(ht.fecha||'')+'" oninput="BEC_EDIT.hitos['+i+'].fecha=this.value"></div>'
    +'<div class="fld"><label>Estado</label><select onchange="BEC_EDIT.hitos['+i+'].estado=this.value">'+['Pendiente','En curso','Cumplido'].map(o=>'<option '+(ht.estado===o?'selected':'')+'>'+o+'</option>').join('')+'</select></div></div>'
    +'<div class="fld"><label>Comentario</label><input value="'+esc(ht.comentario||'')+'" oninput="BEC_EDIT.hitos['+i+'].comentario=this.value" placeholder="Nota del hito..."></div>'
    +'</div>').join('');
}
function addHitoBec(){ BEC_EDIT.hitos.push({id:'h'+Date.now().toString(36),tipo:'Práctica',titulo:'',fecha:'',estado:'Pendiente',comentario:''}); renderHitosBec(); }
function delHitoBec(i){ BEC_EDIT.hitos.splice(i,1); renderHitosBec(); }

async function guardarBecado(){
  const b=BEC_EDIT; if(!b) return;
  if(!(b.nombre||'').trim()){ toast('El becado debe tener nombre','err'); return; }
  const row={ becado_id:b.becado_id, nombre:b.nombre.trim(), carrera:b.carrera||'', institucion:b.institucion||'',
    duracion:b.duracion||'', anio_inicio:b.anio_inicio||'', anio_termino:b.anio_termino||'', estado:b.estado||'Vigente',
    contacto:b.contacto||'', telefono:b.telefono||'', email:b.email||'', observaciones:b.observaciones||'',
    hitos_json:JSON.stringify(b.hitos||[]), estado_registro:'Activo', updated_by:miNombre(), updated_at:new Date().toISOString() };
  if(b._nuevo) row.created_by=miNombre();
  const {error}=await SB.from('becados').upsert(row,{onConflict:'becado_id'});
  if(error){ toast('Error: '+error.message,'err'); return; }
  toast('✅ Becado guardado','ok');
  await cargarBecados(); renderBecados(); cerrarBecado();
}
async function eliminarBecado(){
  if(!ES_ADMIN){ toast('Solo un administrador puede eliminar','err'); return; }
  if(!BEC_EDIT||BEC_EDIT._nuevo){ cerrarBecado(); return; }
  if(!confirm('¿Eliminar este becado?')) return;
  const {error}=await SB.from('becados').update({estado_registro:'Eliminado',updated_at:new Date().toISOString()}).eq('becado_id',BEC_EDIT.becado_id);
  if(error){ toast('Error: '+error.message,'err'); return; }
  toast('Becado eliminado','ok'); await cargarBecados(); renderBecados(); cerrarBecado();
}
