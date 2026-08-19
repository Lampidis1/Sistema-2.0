// ═══════════════════════════════════════════════════════════════════════════
// rca.js — Módulo RCA · Cumplimiento de compromisos ambientales
// Sistema AM · Antofagasta Minerals
//
// QUÉ RESUELVE
// Una RCA (Resolución de Calificación Ambiental) compromete que un % del gasto
// de cada empresa colaboradora (EECC) sea con proveedores LOCALES/REGIONALES.
// El seguimiento funciona así:
//   1. Se carga una RCA por CÓDIGO (cada una con su % de meta, 10% por defecto).
//   2. Cada EECC declara por CARTA FORMAL un monto total a gastar. La meta es el
//      pct_meta% de ese monto declarado.
//   3. Las EECC envían mes a mes un Excel con sus facturas de compra. El sistema
//      cruza el RUT de cada factura contra el registro de proveedores regionales
//      validados (rca_proveedores_validados, sembrado del Excel oficial).
//   4. Solo las facturas de proveedores REGIONALES validados suman al avance del
//      10%. Un RUT desconocido dispara una ALERTA de revisión manual.
//
// La seguridad real está en la base (RLS con tiene_acceso('rca') o es_principal),
// no acá. Este archivo solo pinta y calcula. Ver CLAUDE.md Reglas 2, 3.
//
// Cada RCA tiene DOS pestañas: Proveedores (operativa) y Mano de Obra Local
// (pendiente de desarrollo). El foco de esta entrega es Proveedores.
//
// auth-guard.js declara SB / USER / ES_ADMIN como globales: NO se re-declaran.
// <script src> clásico, nunca type="module" (CLAUDE.md §6).
// ═══════════════════════════════════════════════════════════════════════════

// ── estado ──────────────────────────────────────────────────────────────────
let RCA_LISTA = [];      // rca_normativas
let RCA_ACTUAL = null;   // objeto rca abierto
let RCA_EECC = [];       // eecc del rca abierto
let RCA_FACT = [];       // facturas del rca abierto
let RCA_VALID = [];      // registro de validados (se carga una vez)
let RCA_VMAP = {};       // rut canónico → registro validado
let RCA_TAB = 'prov';    // prov | mol
let _rcaFileCb = null;   // callback pendiente del <input file>

// Comunas de la Región de Antofagasta (para pistas de validación regional).
const RCA_COMUNAS_REGION = ['ANTOFAGASTA','MEJILLONES','SIERRA GORDA','TALTAL',
  'CALAMA','OLLAGUE','OLLAGÜE','SAN PEDRO DE ATACAMA','TOCOPILLA','MARIA ELENA','MARÍA ELENA'];

// ── helpers ─────────────────────────────────────────────────────────────────
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function toast(msg, tipo){
  const t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.className='toast show'+(tipo==='err'?' err':tipo==='ok'?' ok':'');
  clearTimeout(t._to); t._to=setTimeout(()=>t.className='toast',3200);
}
const _clp = n => '$' + Math.round(+n||0).toLocaleString('es-CL');
function _fecha(f){ return f ? String(f).slice(0,10).split('-').reverse().join('-') : '—'; }
function uid(p){ return (p||'id')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6); }
function quien(){ try{ const u=USER; return (u&&u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||(u&&u.email||'').split('@')[0]||''; }catch(e){ return ''; } }
function nowISO(){ return new Date().toISOString(); }

// RUT canónico: sin puntos, sin guión, sin espacios, en mayúscula. Sirve para
// comparar "76.604.002-0", "76604002-0" y "766040020" como el mismo RUT.
function rutCanon(r){ return String(r==null?'':r).toUpperCase().replace(/[^0-9K]/g,''); }
// Formato de presentación con guión: 76604002-0
function rutFmt(r){ const c=rutCanon(r); if(c.length<2) return c; return c.slice(0,-1)+'-'+c.slice(-1); }
// Monto desde una celda de Excel (número o texto con separadores).
function parseMonto(v){
  if(typeof v==='number') return Math.round(v);
  const s=String(v==null?'':v).replace(/[^0-9,.-]/g,'');
  // CLP no usa decimales; se quitan separadores de miles y cualquier decimal.
  const n=parseInt(s.replace(/[.,]/g,''),10);
  return isNaN(n)?0:n;
}

// ── arranque ────────────────────────────────────────────────────────────────
async function rcaOnAcceso(user){
  document.getElementById('gate').style.display='none';
  document.getElementById('app').classList.remove('hidden');
  const hu=document.getElementById('hUser');
  if(hu) hu.textContent=(user&&user.email)||'';
  await cargarValidados();
  await cargarNormativas();
  verLista();
}

async function cargarValidados(){
  try{
    const {data,error}=await SB.from('rca_proveedores_validados').select('*').neq('estado_registro','Eliminado');
    if(error) throw error;
    RCA_VALID=data||[];
    RCA_VMAP={};
    RCA_VALID.forEach(v=>{ RCA_VMAP[rutCanon(v.rut)]=v; });
  }catch(e){ RCA_VALID=[]; RCA_VMAP={}; toast('No se pudo cargar el registro de validados: '+e.message,'err'); }
}

async function cargarNormativas(){
  try{
    const {data,error}=await SB.from('rca_normativas').select('*').neq('estado_registro','Eliminado').order('codigo');
    if(error) throw error;
    RCA_LISTA=data||[];
  }catch(e){ RCA_LISTA=[]; toast('Error al cargar RCA: '+e.message,'err'); }
}

// ══ VISTA: LISTA DE RCA ══════════════════════════════════════════════════════
function verLista(){
  RCA_ACTUAL=null;
  document.getElementById('vistaDetalle').classList.add('hidden');
  const cont=document.getElementById('vistaLista');
  cont.classList.remove('hidden');
  cont.innerHTML=`
    <div class="lista-head">
      <div>
        <div class="lista-t">Resoluciones de Calificación Ambiental</div>
        <div class="lista-s">Cada RCA agrupa a sus empresas colaboradoras y el avance del compromiso de proveedores locales.</div>
      </div>
      <button class="btn primary" onclick="rcaModal()">➕ Nueva RCA</button>
    </div>
    ${!RCA_LISTA.length
      ? `<div class="vacio">Todavía no hay ninguna RCA cargada.<br><span>Crea la primera con «Nueva RCA»: código, faena y el % de compromiso (10% por defecto).</span></div>`
      : `<div class="rca-grid">${RCA_LISTA.map(tarjetaRCA).join('')}</div>`}`;
}

function tarjetaRCA(r){
  return `<div class="rca-card" onclick="abrirRCA('${r.rca_id}')">
    <div class="rca-card-cod">RCA ${esc(r.codigo)}</div>
    <div class="rca-card-nom">${esc(r.nombre||'Sin nombre')}</div>
    <div class="rca-card-meta">
      ${r.faena?`<span class="chip">🏭 ${esc(r.faena)}</span>`:''}
      <span class="chip">🎯 meta ${(+r.pct_meta||10)}%</span>
    </div>
    ${r.descripcion?`<div class="rca-card-desc">${esc(r.descripcion)}</div>`:''}
    <div class="rca-card-go">Abrir seguimiento →</div>
  </div>`;
}

// ══ VISTA: DETALLE DE UNA RCA ════════════════════════════════════════════════
async function abrirRCA(id){
  const r=RCA_LISTA.find(x=>x.rca_id===id); if(!r) return;
  RCA_ACTUAL=r; RCA_TAB='prov';
  document.getElementById('vistaLista').classList.add('hidden');
  const det=document.getElementById('vistaDetalle');
  det.classList.remove('hidden');
  det.innerHTML='<div class="vacio">Cargando…</div>';
  await cargarEECC(id);
  await cargarFacturas(id);
  renderDetalle();
}

async function cargarEECC(rcaId){
  try{
    const {data,error}=await SB.from('rca_eecc').select('*').eq('rca_id',rcaId).neq('estado_registro','Eliminado').order('nombre');
    if(error) throw error;
    RCA_EECC=data||[];
  }catch(e){ RCA_EECC=[]; toast('Error al cargar EECC: '+e.message,'err'); }
}
async function cargarFacturas(rcaId){
  try{
    const {data,error}=await SB.from('rca_facturas').select('*').eq('rca_id',rcaId).neq('estado_registro','Eliminado');
    if(error) throw error;
    RCA_FACT=data||[];
  }catch(e){ RCA_FACT=[]; toast('Error al cargar facturas: '+e.message,'err'); }
}

// Avance de una EECC: reportado = suma de facturas OK (regional validado).
function calcEECC(e){
  const pct=+RCA_ACTUAL.pct_meta||10;
  const decl=+e.monto_declarado||0;
  const meta=decl*pct/100;
  const facts=RCA_FACT.filter(f=>f.eecc_id===e.eecc_id);
  const rep=facts.filter(f=>f.estado_revision==='ok').reduce((a,f)=>a+(+f.monto_clp||0),0);
  const pend=facts.filter(f=>f.estado_revision==='pendiente').length;
  const avance=meta>0?Math.min(100,Math.round(rep/meta*100)):0;
  return {decl,meta,rep,pend,avance,nfact:facts.length};
}

function renderDetalle(){
  const r=RCA_ACTUAL;
  const tot=RCA_EECC.reduce((a,e)=>{ const c=calcEECC(e); a.decl+=c.decl; a.meta+=c.meta; a.rep+=c.rep; return a; },{decl:0,meta:0,rep:0});
  const avanceG=tot.meta>0?Math.min(100,Math.round(tot.rep/tot.meta*100)):0;
  const pendTot=RCA_FACT.filter(f=>f.estado_revision==='pendiente').length;

  const det=document.getElementById('vistaDetalle');
  det.innerHTML=`
    <div class="det-top">
      <button class="btn ghost" onclick="verLista()">← Todas las RCA</button>
      <div class="det-acc">
        <button class="btn ghost" onclick="rcaModal('${r.rca_id}')">✏ Editar RCA</button>
        <button class="btn ghost" onclick="exportarInforme()">⬇ Informe Excel</button>
      </div>
    </div>
    <div class="det-titulo">
      <div class="det-cod">RCA ${esc(r.codigo)}</div>
      <div class="det-nom">${esc(r.nombre||'')}</div>
      ${r.texto_compromiso?`<div class="det-cita">“${esc(r.texto_compromiso)}”</div>`:''}
    </div>

    <div class="tabs2">
      <button class="tab2 ${RCA_TAB==='prov'?'active':''}" onclick="setTab('prov')">🏪 Proveedores</button>
      <button class="tab2 ${RCA_TAB==='mol'?'active':''}" onclick="setTab('mol')">👷 Mano de Obra Local</button>
    </div>

    <div id="tabBody">${RCA_TAB==='prov'?bodyProveedores(tot,avanceG,pendTot):bodyMOL()}</div>`;
}

function setTab(t){ RCA_TAB=t; renderDetalle(); }

function bodyProveedores(tot,avanceG,pendTot){
  const col=avanceG>=80?'#1e7e34':avanceG>=40?'#b8860b':'#c0311b';
  return `
    <div class="kpis">
      <div class="kpi"><div class="kpi-n">${RCA_EECC.length}</div><div class="kpi-l">Empresas colaboradoras</div></div>
      <div class="kpi"><div class="kpi-n sm">${_clp(tot.decl)}</div><div class="kpi-l">Monto declarado (cartas)</div></div>
      <div class="kpi"><div class="kpi-n sm">${_clp(tot.meta)}</div><div class="kpi-l">Meta ${(+RCA_ACTUAL.pct_meta||10)}%</div></div>
      <div class="kpi"><div class="kpi-n sm" style="color:#1e7e34">${_clp(tot.rep)}</div><div class="kpi-l">Reportado regional</div></div>
      <div class="kpi"><div class="kpi-n" style="color:${col}">${avanceG}%</div><div class="kpi-l">Avance global RCA</div></div>
    </div>

    ${pendTot?`<div class="alerta-barra" onclick="verAlertas()">
      ⚠ Hay <b>${pendTot}</b> factura(s) de proveedores no reconocidos esperando tu revisión. <span>Revisar →</span>
    </div>`:''}

    <div class="sub-head">
      <div class="sub-t">Empresas colaboradoras</div>
      <button class="btn primary" onclick="eeccModal()">➕ Agregar EECC</button>
    </div>

    ${!RCA_EECC.length
      ? `<div class="vacio">Sin empresas colaboradoras.<br><span>Agrega una EECC con el monto que declaró por carta formal; sobre ese monto se calcula el 10%.</span></div>`
      : `<div class="eecc-lista">${RCA_EECC.map(tarjetaEECC).join('')}</div>`}`;
}

function tarjetaEECC(e){
  const c=calcEECC(e);
  const col=c.avance>=80?'#1e7e34':c.avance>=40?'#b8860b':'#c0311b';
  return `<div class="eecc-card">
    <div class="eecc-h">
      <div class="eecc-nom">${esc(e.nombre)}${e.rut?` <span class="eecc-rut">${esc(rutFmt(e.rut))}</span>`:''}</div>
      ${e.numero_contrato?`<span class="chip">Contrato ${esc(e.numero_contrato)}</span>`:''}
    </div>
    <div class="eecc-barra"><div class="eecc-barra-in" style="width:${c.avance}%;background:${col}"></div></div>
    <div class="eecc-montos">
      <div><span>Declarado</span><b>${_clp(c.decl)}</b></div>
      <div><span>Meta ${(+RCA_ACTUAL.pct_meta||10)}%</span><b>${_clp(c.meta)}</b></div>
      <div><span>Reportado</span><b style="color:#1e7e34">${_clp(c.rep)}</b></div>
      <div><span>Avance</span><b style="color:${col}">${c.avance}%</b></div>
    </div>
    <div class="eecc-info">
      🧾 ${c.nfact} factura(s)${c.pend?` · <b style="color:#c0311b">${c.pend} por revisar</b>`:''}
      ${e.carta_path?` · 📄 carta cargada`:` · <span style="color:#c0311b">sin carta</span>`}
      ${e.contacto_nombre?`<br>👤 ${esc(e.contacto_nombre)}`:''}${e.contacto_fono?` · 📞 ${esc(e.contacto_fono)}`:''}
    </div>
    <div class="eecc-acc">
      <button class="mini" onclick="importarExcel('${e.eecc_id}')">📥 Cargar Excel</button>
      <button class="mini" onclick="verFacturas('${e.eecc_id}')">🧾 Facturas</button>
      <button class="mini" onclick="eeccModal('${e.eecc_id}')">✏ Editar</button>
      <button class="mini" onclick="subirCarta('${e.eecc_id}')">📄 Carta</button>
    </div>
  </div>`;
}

function bodyMOL(){
  return `<div class="vacio mol">
    <div style="font-size:2.2rem">👷</div>
    <div style="font-weight:700;margin:6px 0">Mano de Obra Local</div>
    <div><span>Esta pestaña queda reservada para el seguimiento de contratación de mano de obra local.
    Se desarrollará en una etapa posterior, con sus propios criterios.</span></div>
  </div>`;
}

// ══ CRUD RCA (normativa) ═════════════════════════════════════════════════════
function rcaModal(id){
  const r=id?RCA_LISTA.find(x=>x.rca_id===id):{};
  abrirModal(`
    <h3>${id?'Editar RCA':'Nueva RCA'}</h3>
    <div class="g2">
      <div><label>Código *</label><input id="mCod" value="${esc(r.codigo||'')}" placeholder="20250200199"></div>
      <div><label>% de meta</label><input id="mPct" type="number" min="0" max="100" value="${r.pct_meta!=null?r.pct_meta:10}"></div>
    </div>
    <label>Nombre / proyecto</label><input id="mNom" value="${esc(r.nombre||'')}" placeholder="EIA Zaldívar…">
    <label>Faena</label><input id="mFaena" value="${esc(r.faena||'')}" placeholder="Zaldívar / Centinela / Antucoya…">
    <label>Descripción</label><textarea id="mDesc" rows="2">${esc(r.descripcion||'')}</textarea>
    <label>Texto del compromiso (cita del RCA)</label><textarea id="mTexto" rows="3">${esc(r.texto_compromiso||'')}</textarea>
    <div class="modal-acc">
      ${id?`<button class="btn danger ghost" onclick="borrarRCA('${id}')">🗑 Eliminar</button>`:'<span></span>'}
      <div><button class="btn ghost" onclick="cerrarModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarRCA('${id||''}')">Guardar</button></div>
    </div>`);
}

async function guardarRCA(id){
  const cod=val('mCod').trim();
  if(!cod){ toast('El código es obligatorio','err'); return; }
  const fila={
    codigo:cod, nombre:val('mNom').trim()||null, faena:val('mFaena').trim()||null,
    descripcion:val('mDesc').trim()||null, texto_compromiso:val('mTexto').trim()||null,
    pct_meta:+val('mPct')||10, updated_at:nowISO(), updated_by:quien()
  };
  try{
    if(id){ const {error}=await SB.from('rca_normativas').update(fila).eq('rca_id',id); if(error) throw error; }
    else{ fila.rca_id=uid('rca'); fila.created_by=quien(); const {error}=await SB.from('rca_normativas').insert(fila); if(error) throw error; }
    cerrarModal(); await cargarNormativas();
    if(id&&RCA_ACTUAL&&RCA_ACTUAL.rca_id===id){ RCA_ACTUAL=RCA_LISTA.find(x=>x.rca_id===id); renderDetalle(); }
    else verLista();
    toast('✅ RCA guardada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

async function borrarRCA(id){
  const r=RCA_LISTA.find(x=>x.rca_id===id);
  if(!confirm(`¿Eliminar la RCA ${r?r.codigo:''} y su seguimiento?`)) return;
  try{
    const {error}=await SB.from('rca_normativas').update({estado_registro:'Eliminado',updated_at:nowISO()}).eq('rca_id',id);
    if(error) throw error;
    cerrarModal(); await cargarNormativas(); verLista(); toast('🗑 Eliminada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ══ CRUD EECC ════════════════════════════════════════════════════════════════
function eeccModal(id){
  const e=id?RCA_EECC.find(x=>x.eecc_id===id):{};
  abrirModal(`
    <h3>${id?'Editar empresa colaboradora':'Nueva empresa colaboradora'}</h3>
    <div class="g2">
      <div><label>Nombre *</label><input id="eNom" value="${esc(e.nombre||'')}"></div>
      <div><label>RUT</label><input id="eRut" value="${esc(e.rut||'')}" placeholder="76xxxxxxx-x"></div>
    </div>
    <div class="g2">
      <div><label>Monto declarado (carta formal, CLP)</label><input id="eMonto" type="number" value="${e.monto_declarado||''}" oninput="previewMeta()"></div>
      <div><label>N° de contrato</label><input id="eContrato" value="${esc(e.numero_contrato||'')}"></div>
    </div>
    <div id="mMetaPrev" class="meta-prev"></div>
    <div class="g3">
      <div><label>Contacto</label><input id="eCNom" value="${esc(e.contacto_nombre||'')}"></div>
      <div><label>Teléfono</label><input id="eCFono" value="${esc(e.contacto_fono||'')}"></div>
      <div><label>Correo</label><input id="eCMail" value="${esc(e.contacto_correo||'')}"></div>
    </div>
    <div class="g2">
      <div><label>Administrador (ADC)</label><input id="eAdc" value="${esc(e.administrador||'')}"></div>
      <div><label>Fecha carta</label><input id="eCarta" type="date" value="${(e.carta_fecha||'').slice(0,10)}"></div>
    </div>
    <label>Notas</label><textarea id="eNotas" rows="2">${esc(e.notas||'')}</textarea>
    <div class="modal-acc">
      ${id?`<button class="btn danger ghost" onclick="borrarEECC('${id}')">🗑 Eliminar</button>`:'<span></span>'}
      <div><button class="btn ghost" onclick="cerrarModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarEECC('${id||''}')">Guardar</button></div>
    </div>`);
  previewMeta();
}
function previewMeta(){
  const m=+val('eMonto')||0; const pct=+RCA_ACTUAL.pct_meta||10;
  const el=document.getElementById('mMetaPrev'); if(!el) return;
  el.innerHTML=m?`Meta ${pct}% → <b>${_clp(m*pct/100)}</b> en proveedores regionales`:'Escribe el monto declarado para ver la meta.';
}
async function guardarEECC(id){
  const nom=val('eNom').trim();
  if(!nom){ toast('El nombre es obligatorio','err'); return; }
  const fila={
    rca_id:RCA_ACTUAL.rca_id, nombre:nom, rut:val('eRut').trim()||null,
    monto_declarado:+val('eMonto')||0, numero_contrato:val('eContrato').trim()||null,
    contacto_nombre:val('eCNom').trim()||null, contacto_fono:val('eCFono').trim()||null,
    contacto_correo:val('eCMail').trim()||null, administrador:val('eAdc').trim()||null,
    carta_fecha:val('eCarta')||null, notas:val('eNotas').trim()||null,
    updated_at:nowISO(), updated_by:quien()
  };
  try{
    if(id){ const {error}=await SB.from('rca_eecc').update(fila).eq('eecc_id',id); if(error) throw error; }
    else{ fila.eecc_id=uid('eecc'); fila.created_by=quien(); const {error}=await SB.from('rca_eecc').insert(fila); if(error) throw error; }
    cerrarModal(); await cargarEECC(RCA_ACTUAL.rca_id); renderDetalle(); toast('✅ Guardada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}
async function borrarEECC(id){
  const e=RCA_EECC.find(x=>x.eecc_id===id);
  if(!confirm(`¿Eliminar «${e?e.nombre:''}» y sus facturas?`)) return;
  try{
    const {error}=await SB.from('rca_eecc').update({estado_registro:'Eliminado',updated_at:nowISO()}).eq('eecc_id',id);
    if(error) throw error;
    cerrarModal(); await cargarEECC(RCA_ACTUAL.rca_id); await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle(); toast('🗑 Eliminada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ══ CARTA FORMAL (documento) ═════════════════════════════════════════════════
function subirCarta(id){
  _rcaFileCb=(file)=>guardarCarta(id,file);
  const inp=document.getElementById('rcaFile');
  inp.accept='.pdf,.jpg,.jpeg,.png';
  inp.click();
}
async function guardarCarta(id,file){
  if(file.size>15*1024*1024){ toast('El archivo supera los 15 MB','err'); return; }
  try{
    toast('Subiendo carta…');
    const ext=(file.name.split('.').pop()||'bin').toLowerCase();
    const path=`rca/cartas/${id}/${Date.now()}_${Math.random().toString(36).slice(2,7)}.${ext}`;
    const {error:up}=await SB.storage.from('documentos').upload(path,file,{upsert:false});
    if(up) throw up;
    const {error}=await SB.from('rca_eecc').update({carta_path:path,carta_nombre:file.name,updated_at:nowISO(),updated_by:quien()}).eq('eecc_id',id);
    if(error) throw error;
    await cargarEECC(RCA_ACTUAL.rca_id); renderDetalle(); toast('✅ Carta cargada','ok');
  }catch(e){ toast('Error al subir: '+e.message,'err'); }
}

// ══ IMPORTAR EXCEL DE FACTURAS + CRUCE POR RUT ═══════════════════════════════
function importarExcel(eeccId){
  _rcaFileCb=(file)=>procesarExcel(eeccId,file);
  const inp=document.getElementById('rcaFile');
  inp.accept='.xlsx,.xls,.csv';
  inp.click();
}
function rcaFileElegido(input){
  const file=input.files&&input.files[0];
  input.value='';
  if(file&&typeof _rcaFileCb==='function'){ const cb=_rcaFileCb; _rcaFileCb=null; cb(file); }
}

// Encuentra el valor de una columna por NOMBRE de encabezado (tolerante a
// tildes, mayúsculas y variantes). Así sirve el Excel de MGI y el de la EECC.
function normHdr(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,''); }
function pickCol(rowObj, alternativas){
  for(const k of Object.keys(rowObj)){
    const nk=normHdr(k);
    if(alternativas.some(a=>nk.includes(a))) return rowObj[k];
  }
  return '';
}
// La plantilla EECC trae 3 filas de rótulos antes del encabezado real. Se busca
// la fila que tenga "RUT" y "Monto" para saber desde dónde leer.
function localizarHeader(matriz){
  for(let i=0;i<Math.min(matriz.length,12);i++){
    const fila=matriz[i].map(normHdr);
    if(fila.includes('rut') && fila.some(c=>c.includes('monto')||c.includes('clp'))) return i;
  }
  return 0;
}

async function procesarExcel(eeccId,file){
  const e=RCA_EECC.find(x=>x.eecc_id===eeccId); if(!e){ toast('EECC no encontrada','err'); return; }
  try{
    toast('Leyendo Excel…');
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    // hoja de datos de la EECC (o la primera)
    let hoja=wb.SheetNames.find(n=>/ee\.?cc|datos|factura/i.test(n))||wb.SheetNames[0];
    const ws=wb.Sheets[hoja];
    const matriz=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
    if(!matriz.length){ toast('La hoja está vacía','err'); return; }
    const h=localizarHeader(matriz);
    const headers=matriz[h].map(x=>String(x||''));
    const filas=[];
    for(let i=h+1;i<matriz.length;i++){
      const obj={}; headers.forEach((k,j)=>{ if(k) obj[k]=matriz[i][j]; });
      filas.push(obj);
    }
    // construir facturas cruzando el RUT
    const nuevas=[]; let okC=0, pendC=0, noReg=0;
    for(const r of filas){
      const rut=pickCol(r,['rut']);
      const monto=parseMonto(pickCol(r,['clpmonto','montoclp','clp','montodelacontratacion','monto','montoneto']));
      const numFact=String(pickCol(r,['ndefactura','nfactura','numfactura','factura','folio'])||'').trim();
      if(!rutCanon(rut) && !monto && !numFact) continue; // fila vacía
      const canon=rutCanon(rut);
      const reg=RCA_VMAP[canon];
      let estado='pendiente', esReg=false, rvpId=null, razon=String(pickCol(r,['razonsocial','razon','nombre','fantasia'])||'').trim(), comuna=String(pickCol(r,['comunacasamatriz','comuna'])||'').trim();
      if(reg){
        rvpId=reg.rvp_id;
        if(reg.es_regional){ estado='ok'; esReg=true; okC++; }
        else{ estado='no_regional'; noReg++; }
        if(!razon) razon=reg.razon_social||'';
        if(!comuna) comuna=reg.comuna||'';
      }else{
        pendC++;
      }
      nuevas.push({
        factura_id:uid('fac'), rca_id:RCA_ACTUAL.rca_id, eecc_id:eeccId,
        anio:String(pickCol(r,['ano','anio','year'])||'').trim(),
        mes:String(pickCol(r,['mes','month'])||'').trim(),
        num_factura:numFact, eecc_nombre:String(pickCol(r,['eecc','empresacolaboradora'])||e.nombre).trim()||e.nombre,
        rut_proveedor:rutFmt(rut), razon_social:razon, comuna:comuna,
        bien_servicio:String(pickCol(r,['bienoservicio','bienservicio','servicio','bien'])||'').trim(),
        clasificacion:String(pickCol(r,['clasificacion','clasif'])||'').trim(),
        monto_clp:monto, monto_usd:parseMonto(pickCol(r,['usd','dolar'])),
        rvp_id:rvpId, es_regional:esReg, estado_revision:estado, origen:'excel',
        created_by:quien(), updated_by:quien()
      });
    }
    if(!nuevas.length){ toast('No se encontraron facturas en el Excel','err'); return; }
    const {error}=await SB.from('rca_facturas').insert(nuevas);
    if(error) throw error;
    await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle();
    toast(`✅ ${nuevas.length} factura(s): ${okC} regionales · ${pendC} por revisar · ${noReg} fuera de región`,'ok');
    if(pendC) verAlertas();
  }catch(err){ toast('Error al procesar: '+err.message,'err'); }
}

// ══ ALERTAS: proveedores no reconocidos ══════════════════════════════════════
function verAlertas(){
  const pend=RCA_FACT.filter(f=>f.estado_revision==='pendiente');
  // agrupar por RUT para validar de una sola vez
  const grupos={};
  pend.forEach(f=>{ const k=rutCanon(f.rut_proveedor)||('_'+f.factura_id); (grupos[k]=grupos[k]||{rut:f.rut_proveedor,razon:f.razon_social,comuna:f.comuna,facts:[]}).facts.push(f); });
  const arr=Object.entries(grupos);
  abrirModal(`
    <h3>⚠ Proveedores por revisar</h3>
    <p class="modal-nota">Estos RUT no están en el registro de proveedores regionales validados.
    Revisa cada uno: si es de la Región de Antofagasta, valídalo (sus facturas pasarán a sumar al 10%);
    si no, márcalo fuera de región.</p>
    ${!arr.length?'<div class="vacio">No hay pendientes. 👌</div>':`
    <div class="alert-lista">
      ${arr.map(([k,g])=>{
        const monto=g.facts.reduce((a,f)=>a+(+f.monto_clp||0),0);
        const comReg=RCA_COMUNAS_REGION.includes(String(g.comuna||'').toUpperCase());
        return `<div class="alert-row">
          <div class="alert-info">
            <div class="alert-rut">${esc(rutFmt(g.rut)||'sin RUT')}</div>
            <div class="alert-razon">${esc(g.razon||'—')}</div>
            <div class="alert-sub">${esc(g.comuna||'sin comuna')} ${comReg?'<span class="ok-tag">comuna regional</span>':'<span class="warn-tag">revisar comuna</span>'} · ${g.facts.length} factura(s) · ${_clp(monto)}</div>
          </div>
          <div class="alert-acc">
            <button class="mini ok" onclick="validarProveedor('${encodeURIComponent(g.rut)}','${encodeURIComponent(g.razon||'')}','${encodeURIComponent(g.comuna||'')}')">✓ Validar regional</button>
            <button class="mini danger" onclick="marcarFueraRegion('${encodeURIComponent(g.rut)}')">✕ Fuera de región</button>
          </div>
        </div>`;
      }).join('')}
    </div>`}
    <div class="modal-acc"><span></span><button class="btn ghost" onclick="cerrarModal()">Cerrar</button></div>`);
}

// Valida un proveedor: lo agrega al registro regional y pasa sus facturas a OK.
async function validarProveedor(rutE,razonE,comunaE){
  const rut=decodeURIComponent(rutE), razon=decodeURIComponent(razonE), comuna=decodeURIComponent(comunaE);
  const canon=rutCanon(rut);
  if(!canon){ toast('Sin RUT no se puede validar; edita la factura primero','err'); return; }
  try{
    let reg=RCA_VMAP[canon];
    if(!reg){
      const ins={rut:rutFmt(rut), razon_social:razon||null, comuna:comuna||null,
        region:'Antofagasta', es_regional:true, validado:true, validado_por:quien(), validado_en:nowISO(),
        created_by:quien()};
      const {data,error}=await SB.from('rca_proveedores_validados').insert(ins).select().single();
      if(error) throw error;
      reg=data; RCA_VALID.push(reg); RCA_VMAP[canon]=reg;
    }else if(!reg.es_regional){
      const {error}=await SB.from('rca_proveedores_validados').update({es_regional:true,region:'Antofagasta',validado_por:quien(),validado_en:nowISO()}).eq('rvp_id',reg.rvp_id);
      if(error) throw error; reg.es_regional=true;
    }
    // actualizar todas las facturas pendientes de ese RUT
    const ids=RCA_FACT.filter(f=>rutCanon(f.rut_proveedor)===canon && f.estado_revision!=='ok').map(f=>f.factura_id);
    if(ids.length){
      const {error}=await SB.from('rca_facturas').update({estado_revision:'ok',es_regional:true,rvp_id:reg.rvp_id,updated_at:nowISO()}).in('factura_id',ids);
      if(error) throw error;
    }
    await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle(); verAlertas(); toast('✅ Proveedor validado','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

async function marcarFueraRegion(rutE){
  const rut=decodeURIComponent(rutE); const canon=rutCanon(rut);
  try{
    const ids=RCA_FACT.filter(f=>rutCanon(f.rut_proveedor)===canon && f.estado_revision==='pendiente').map(f=>f.factura_id);
    if(ids.length){
      const {error}=await SB.from('rca_facturas').update({estado_revision:'no_regional',es_regional:false,updated_at:nowISO()}).in('factura_id',ids);
      if(error) throw error;
    }
    await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle(); verAlertas(); toast('Marcado fuera de región','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ══ FACTURAS DE UNA EECC ═════════════════════════════════════════════════════
function verFacturas(eeccId){
  const e=RCA_EECC.find(x=>x.eecc_id===eeccId);
  const facts=RCA_FACT.filter(f=>f.eecc_id===eeccId).sort((a,b)=>String(b.anio+b.mes).localeCompare(String(a.anio+a.mes)));
  const badge=s=>s==='ok'?'<span class="est ok">Regional ✓</span>':s==='no_regional'?'<span class="est off">Fuera región</span>':'<span class="est pend">Por revisar</span>';
  abrirModal(`
    <h3>🧾 Facturas · ${esc(e?e.nombre:'')}</h3>
    ${!facts.length?'<div class="vacio">Esta EECC aún no tiene facturas. Usa «Cargar Excel».</div>':`
    <div class="tabla-scroll"><table class="tabla-fact">
      <thead><tr><th>Año</th><th>Mes</th><th>N° factura</th><th>RUT</th><th>Proveedor</th><th>Comuna</th><th>Monto CLP</th><th>Estado</th><th></th></tr></thead>
      <tbody>${facts.map(f=>`<tr class="${f.estado_revision}">
        <td>${esc(f.anio||'')}</td><td>${esc(f.mes||'')}</td><td>${esc(f.num_factura||'')}</td>
        <td>${esc(rutFmt(f.rut_proveedor)||'')}</td><td>${esc(f.razon_social||'')}</td><td>${esc(f.comuna||'')}</td>
        <td style="text-align:right">${_clp(f.monto_clp)}</td><td>${badge(f.estado_revision)}</td>
        <td><button class="mini danger" title="Eliminar" onclick="borrarFactura('${f.factura_id}','${eeccId}')">🗑</button></td>
      </tr>`).join('')}</tbody>
    </table></div>`}
    <div class="modal-acc"><span></span><button class="btn ghost" onclick="cerrarModal()">Cerrar</button></div>`);
}
async function borrarFactura(id,eeccId){
  if(!confirm('¿Eliminar esta factura?')) return;
  try{
    const {error}=await SB.from('rca_facturas').update({estado_registro:'Eliminado',updated_at:nowISO()}).eq('factura_id',id);
    if(error) throw error;
    await cargarFacturas(RCA_ACTUAL.rca_id); renderDetalle(); verFacturas(eeccId); toast('🗑 Eliminada','ok');
  }catch(e){ toast('Error: '+e.message,'err'); }
}

// ══ INFORME EXCEL ════════════════════════════════════════════════════════════
function exportarInforme(){
  const r=RCA_ACTUAL;
  // Hoja 1: resumen por EECC
  const resumen=[['RCA',r.codigo,r.nombre||''],['Meta',(+r.pct_meta||10)+'%'],[],
    ['EECC','RUT','Monto declarado','Meta','Reportado regional','Avance %','Facturas','Por revisar']];
  RCA_EECC.forEach(e=>{ const c=calcEECC(e);
    resumen.push([e.nombre,rutFmt(e.rut||''),c.decl,c.meta,c.rep,c.avance,c.nfact,c.pend]); });
  // Hoja 2: todas las facturas
  const fdet=[['EECC','Año','Mes','N° factura','RUT','Proveedor','Comuna','Bien/servicio','Clasificación','Monto CLP','Estado']];
  RCA_FACT.forEach(f=>{ const e=RCA_EECC.find(x=>x.eecc_id===f.eecc_id);
    fdet.push([e?e.nombre:'',f.anio,f.mes,f.num_factura,rutFmt(f.rut_proveedor||''),f.razon_social,f.comuna,f.bien_servicio,f.clasificacion,f.monto_clp,
      f.estado_revision==='ok'?'Regional':f.estado_revision==='no_regional'?'Fuera región':'Por revisar']); });
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(resumen),'Resumen');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(fdet),'Facturas');
  XLSX.writeFile(wb,`RCA_${r.codigo}_informe.xlsx`);
}

// ══ modal genérico ═══════════════════════════════════════════════════════════
function abrirModal(html){
  const host=document.getElementById('modalHost');
  host.innerHTML=`<div class="modal-ov" onclick="if(event.target===this)cerrarModal()"><div class="modal-box">${html}</div></div>`;
}
function cerrarModal(){ document.getElementById('modalHost').innerHTML=''; }
function val(id){ const el=document.getElementById(id); return el?el.value:''; }
