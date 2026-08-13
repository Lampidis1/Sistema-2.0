// ═══════════════════════════════════════════════════════════════════════════
// proveedores-rca.js — Compromiso RCA
// Sistema AM · Antofagasta Minerals
//
// Una ficha por empresa contratista. Sobre el monto del contrato se calcula el
// 10% comprometido en compras a proveedores locales, y se cargan los
// documentos que lo respaldan.
//
// El reporte de compras (las tablas de Excel con las compras asociadas a cada
// proveedor local) viene después: por ahora se registra la empresa, se ve el
// avance y se suben los documentos.
//
// Se carga DESPUÉS de proveedores.js: usa SUPA, showToast, esc y uid, que son
// globales. Nunca type="module" (CLAUDE.md §6).
// ═══════════════════════════════════════════════════════════════════════════

let RCA_EMPRESAS = [];
let RCA_DOCS = [];
let RCA_EDIT = null;      // empresa_id en edición, null = nueva

const _clp = n => '$' + (Math.round(+n || 0)).toLocaleString('es-CL');
const _fecha = f => f ? String(f).slice(0, 10).split('-').reverse().join('-') : '—';

async function rcaCargar() {
  const cont = document.getElementById('rcaContent');
  if (!cont) return;
  if (!SUPA.client) { cont.innerHTML = '<div class="rca-vacio">Inicia sesión para ver el Compromiso RCA.</div>'; return; }
  cont.innerHTML = '<div class="rca-vacio">Cargando…</div>';
  try {
    const [e, d] = await Promise.all([
      SUPA.client.from('rca_empresas').select('*').neq('estado_registro', 'Eliminado').order('nombre'),
      SUPA.client.from('rca_documentos').select('*').neq('estado_registro', 'Eliminado'),
    ]);
    if (e.error) throw e.error;
    RCA_EMPRESAS = e.data || [];
    RCA_DOCS = d.data || [];
    rcaRender();
  } catch (err) {
    cont.innerHTML = '<div class="rca-vacio">Error al cargar: ' + esc(err.message) + '</div>';
  }
}

// Lo comprometido es un % del monto del contrato; el avance es cuánto de eso
// ya se reportó en compras a proveedores locales.
function rcaCalculo(e) {
  const total = +e.monto_total || 0;
  const pct = +e.pct_compromiso || 10;
  const meta = total * pct / 100;
  const rep = +e.monto_reportado || 0;
  return { total, pct, meta, rep, avance: meta > 0 ? Math.min(100, Math.round(rep / meta * 100)) : 0 };
}

function rcaRender() {
  const cont = document.getElementById('rcaContent');
  const tot = RCA_EMPRESAS.reduce((a, e) => {
    const c = rcaCalculo(e);
    a.contratos += c.total; a.meta += c.meta; a.rep += c.rep; return a;
  }, { contratos: 0, meta: 0, rep: 0 });
  const avanceGlobal = tot.meta > 0 ? Math.min(100, Math.round(tot.rep / tot.meta * 100)) : 0;

  cont.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
      <div class="dash-title" style="margin:0">Compromiso RCA · Empresas contratistas</div>
      <button class="btn-save" onclick="rcaNueva()">➕ Crear empresa</button>
    </div>

    <div class="hab-kpis">
      <div class="hab-kpi"><div class="hab-kpi-n">${RCA_EMPRESAS.length}</div><div class="hab-kpi-l">Empresas</div></div>
      <div class="hab-kpi"><div class="hab-kpi-n" style="font-size:1.35rem">${_clp(tot.contratos)}</div><div class="hab-kpi-l">Monto de contratos</div></div>
      <div class="hab-kpi"><div class="hab-kpi-n" style="font-size:1.35rem">${_clp(tot.meta)}</div><div class="hab-kpi-l">Comprometido (10%)</div></div>
      <div class="hab-kpi"><div class="hab-kpi-n" style="font-size:1.35rem;color:var(--green)">${_clp(tot.rep)}</div><div class="hab-kpi-l">Reportado</div></div>
      <div class="hab-kpi"><div class="hab-kpi-n" style="color:${avanceGlobal >= 80 ? '#1e7e34' : avanceGlobal >= 40 ? '#b8860b' : '#c0311b'}">${avanceGlobal}%</div><div class="hab-kpi-l">Avance global</div></div>
    </div>

    ${!RCA_EMPRESAS.length ? `<div class="rca-vacio">
        Todavía no hay empresas cargadas.<br>
        <span style="font-size:.84rem">Cada empresa contratista lleva su ficha con el contrato, el 10% comprometido y sus documentos.</span>
      </div>` : `<div class="rca-grid">${RCA_EMPRESAS.map(rcaTarjeta).join('')}</div>`}`;
}

function rcaTarjeta(e) {
  const c = rcaCalculo(e);
  const col = c.avance >= 80 ? '#1e7e34' : c.avance >= 40 ? '#b8860b' : '#c0311b';
  const docs = RCA_DOCS.filter(d => d.empresa_id === e.empresa_id);
  const verif = docs.filter(d => d.verificado).length;
  const vence = e.fecha_hasta ? Math.ceil((new Date(e.fecha_hasta) - new Date()) / 86400000) : null;
  return `<div class="rca-card">
    <div class="rca-card-h">
      <div>
        <div class="rca-n">${esc(e.nombre)}</div>
        <div class="rca-sub">${e.numero_contrato ? 'Contrato ' + esc(e.numero_contrato) : 'Sin N° de contrato'}
          ${e.administrador ? ' · ADC ' + esc(e.administrador) : ''}</div>
      </div>
      ${vence !== null ? `<span class="rca-vig ${vence < 0 ? 'venc' : vence < 60 ? 'porvenc' : ''}">
        ${vence < 0 ? 'Vencido' : vence + ' días'}</span>` : ''}
    </div>
    <div class="rca-card-b">
      <div class="rca-avance">
        <div class="rca-barra"><div class="rca-barra-in" style="width:${c.avance}%;background:${col}"></div></div>
        <div class="rca-avance-t"><b style="color:${col}">${c.avance}%</b> del compromiso reportado</div>
      </div>
      <div class="rca-montos">
        <div><span>Contrato</span><b>${_clp(c.total)}</b></div>
        <div><span>Compromiso ${c.pct}%</span><b>${_clp(c.meta)}</b></div>
        <div><span>Reportado</span><b style="color:var(--green)">${_clp(c.rep)}</b></div>
      </div>
      ${e.descripcion ? `<div class="rca-desc">${esc(e.descripcion)}</div>` : ''}
      <div class="rca-meta">
        📅 ${_fecha(e.fecha_desde)} → ${_fecha(e.fecha_hasta)}
        ${e.contacto_nombre ? '<br>👤 ' + esc(e.contacto_nombre) : ''}
        ${e.contacto_fono ? ' · 📞 ' + esc(e.contacto_fono) : ''}
      </div>
      <div class="rca-docs-n">📎 ${docs.length} documento(s)${verif ? ` · ${verif} verificado(s)` : ''}</div>
    </div>
    <div class="rca-card-f">
      <button class="mini-btn" onclick="rcaEditar('${e.empresa_id}')">✏ Editar</button>
      <button class="mini-btn" onclick="rcaAbrirDocs('${e.empresa_id}')">📎 Documentos</button>
    </div>
  </div>`;
}

// ── CREAR / EDITAR ──────────────────────────────────────────────────────────
function rcaNueva() { RCA_EDIT = null; rcaLlenarForm({}); document.getElementById('rcaModal').style.display = 'flex'; }
function rcaEditar(id) {
  const e = RCA_EMPRESAS.find(x => x.empresa_id === id); if (!e) return;
  RCA_EDIT = id; rcaLlenarForm(e); document.getElementById('rcaModal').style.display = 'flex';
}
function rcaCerrar() { document.getElementById('rcaModal').style.display = 'none'; }

function rcaLlenarForm(e) {
  document.getElementById('rcaTitulo').textContent = e.empresa_id ? 'Editar empresa' : 'Nueva empresa contratista';
  const v = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
  v('rcaNombre', e.nombre); v('rcaRut', e.rut);
  v('rcaContNombre', e.contacto_nombre); v('rcaContFono', e.contacto_fono); v('rcaContMail', e.contacto_correo);
  v('rcaNumContrato', e.numero_contrato); v('rcaAdmin', e.administrador);
  v('rcaDesde', e.fecha_desde); v('rcaHasta', e.fecha_hasta);
  v('rcaDesc', e.descripcion);
  v('rcaMonto', e.monto_total || ''); v('rcaPct', e.pct_compromiso ?? 10);
  document.getElementById('rcaBorrar').style.display = e.empresa_id ? '' : 'none';
  rcaPreview();
}
// Muestra el 10% mientras se escribe el monto: evita cargar un número con un
// cero de más sin darse cuenta.
function rcaPreview() {
  const m = +document.getElementById('rcaMonto').value || 0;
  const p = +document.getElementById('rcaPct').value || 10;
  document.getElementById('rcaCalc').innerHTML = m
    ? `Contrato <b>${_clp(m)}</b> → compromiso <b>${_clp(m * p / 100)}</b>`
    : 'Escribe el monto para ver el compromiso.';
}

async function rcaGuardar() {
  const nombre = document.getElementById('rcaNombre').value.trim();
  if (!nombre) { showToast('El nombre de la empresa es obligatorio', 'err'); return; }
  const desde = document.getElementById('rcaDesde').value || null;
  const hasta = document.getElementById('rcaHasta').value || null;
  if (desde && hasta && hasta < desde) { showToast('La fecha de término es anterior al inicio', 'err'); return; }

  const fila = {
    nombre,
    rut: document.getElementById('rcaRut').value.trim() || null,
    contacto_nombre: document.getElementById('rcaContNombre').value.trim() || null,
    contacto_fono: document.getElementById('rcaContFono').value.trim() || null,
    contacto_correo: document.getElementById('rcaContMail').value.trim() || null,
    numero_contrato: document.getElementById('rcaNumContrato').value.trim() || null,
    administrador: document.getElementById('rcaAdmin').value.trim() || null,
    fecha_desde: desde, fecha_hasta: hasta,
    descripcion: document.getElementById('rcaDesc').value.trim() || null,
    monto_total: +document.getElementById('rcaMonto').value || 0,
    pct_compromiso: +document.getElementById('rcaPct').value || 10,
    updated_at: new Date().toISOString(),
    updated_by: (typeof kbWhoSafe === 'function' ? kbWhoSafe() : ''),
  };
  try {
    if (RCA_EDIT) {
      const { error } = await SUPA.client.from('rca_empresas').update(fila).eq('empresa_id', RCA_EDIT);
      if (error) throw error;
    } else {
      fila.empresa_id = 'rca_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      fila.created_by = fila.updated_by;
      const { error } = await SUPA.client.from('rca_empresas').insert(fila);
      if (error) throw error;
    }
    showToast('✅ Guardado', 'success');
    rcaCerrar(); await rcaCargar();
  } catch (e) { showToast('Error: ' + e.message, 'err'); }
}

async function rcaBorrarEmpresa() {
  if (!RCA_EDIT) return;
  const e = RCA_EMPRESAS.find(x => x.empresa_id === RCA_EDIT);
  if (!confirm(`¿Eliminar «${e ? e.nombre : ''}» y sus documentos?`)) return;
  try {
    const { error } = await SUPA.client.from('rca_empresas')
      .update({ estado_registro: 'Eliminado', updated_at: new Date().toISOString() }).eq('empresa_id', RCA_EDIT);
    if (error) throw error;
    showToast('🗑 Eliminada', 'success');
    rcaCerrar(); await rcaCargar();
  } catch (err) { showToast('Error: ' + err.message, 'err'); }
}

// ── DOCUMENTOS ──────────────────────────────────────────────────────────────
let RCA_DOC_EMPRESA = null;
function rcaAbrirDocs(id) {
  RCA_DOC_EMPRESA = id;
  const e = RCA_EMPRESAS.find(x => x.empresa_id === id);
  document.getElementById('rcaDocsTitulo').textContent = '📎 Documentos · ' + (e ? e.nombre : '');
  rcaRenderDocs();
  document.getElementById('rcaDocsModal').style.display = 'flex';
}
function rcaCerrarDocs() { document.getElementById('rcaDocsModal').style.display = 'none'; }

function rcaRenderDocs() {
  const docs = RCA_DOCS.filter(d => d.empresa_id === RCA_DOC_EMPRESA);
  document.getElementById('rcaDocsLista').innerHTML = docs.length
    ? docs.map(d => `<div class="rca-doc ${d.verificado ? 'ok' : ''}">
        <span class="rca-doc-ico">${/\.pdf$/i.test(d.archivo_nombre || '') ? '📄' : '🖼'}</span>
        <div style="flex:1;min-width:0">
          <div class="rca-doc-t">${esc(d.titulo)}</div>
          <div class="rca-doc-s">${esc(d.tipo || 'otro')} · ${esc(d.archivo_nombre || '')}
            ${d.verificado ? ' · <b style="color:var(--green)">✓ verificado</b>' : ''}</div>
        </div>
        <div style="display:flex;gap:6px">
          ${d.archivo_path ? `<button class="mini-btn" onclick="rcaVerDoc('${esc(d.archivo_path)}')" title="Abrir">👁</button>` : ''}
          <button class="mini-btn" onclick="rcaVerificar('${d.doc_id}',${!d.verificado})" title="${d.verificado ? 'Quitar verificación' : 'Marcar verificado'}">${d.verificado ? '↩' : '✓'}</button>
          <button class="mini-btn danger" onclick="rcaBorrarDoc('${d.doc_id}')" title="Eliminar">🗑</button>
        </div>
      </div>`).join('')
    : '<div class="rca-vacio" style="padding:26px">Sin documentos cargados.</div>';
}

async function rcaSubirDoc(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const titulo = document.getElementById('rcaDocTitulo').value.trim() || file.name;
  const tipo = document.getElementById('rcaDocTipo').value;
  if (file.size > 15 * 1024 * 1024) { showToast('El archivo supera los 15 MB', 'err'); input.value = ''; return; }
  try {
    showToast('Subiendo…');
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const path = `rca/${RCA_DOC_EMPRESA}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
    // El bucket `documentos` es privado (P-1): se guarda la ruta y el archivo
    // se abre después con una URL firmada de duración corta.
    const { error: upErr } = await SUPA.client.storage.from('documentos').upload(path, file, { upsert: false });
    if (upErr) throw upErr;
    const { error } = await SUPA.client.from('rca_documentos').insert({
      doc_id: 'rcadoc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      empresa_id: RCA_DOC_EMPRESA, titulo, tipo,
      archivo_path: path, archivo_nombre: file.name,
      created_by: (typeof kbWhoSafe === 'function' ? kbWhoSafe() : ''),
    });
    if (error) throw error;
    document.getElementById('rcaDocTitulo').value = '';
    input.value = '';
    showToast('✅ Documento cargado', 'success');
    await rcaCargar(); rcaRenderDocs();
  } catch (e) { showToast('Error al subir: ' + e.message, 'err'); input.value = ''; }
}

async function rcaVerDoc(path) {
  try {
    const { data, error } = await SUPA.client.storage.from('documentos').createSignedUrl(path, 300);
    if (error) throw error;
    window.open(data.signedUrl, '_blank', 'noopener');
  } catch (e) { showToast('No se pudo abrir: ' + e.message, 'err'); }
}

async function rcaVerificar(id, v) {
  try {
    const { error } = await SUPA.client.from('rca_documentos').update({
      verificado: v,
      verificado_por: v ? (typeof kbWhoSafe === 'function' ? kbWhoSafe() : '') : null,
      verificado_en: v ? new Date().toISOString() : null,
    }).eq('doc_id', id);
    if (error) throw error;
    await rcaCargar(); rcaRenderDocs();
  } catch (e) { showToast('Error: ' + e.message, 'err'); }
}

async function rcaBorrarDoc(id) {
  if (!confirm('¿Eliminar este documento?')) return;
  try {
    const { error } = await SUPA.client.from('rca_documentos')
      .update({ estado_registro: 'Eliminado' }).eq('doc_id', id);
    if (error) throw error;
    await rcaCargar(); rcaRenderDocs();
  } catch (e) { showToast('Error: ' + e.message, 'err'); }
}


// ═══════════════════════════════════════════════════════════════════════════
// GESTIÓN INTERNA · PANEL DEL PLANER
//
// Trae los pendientes y rutinas que el equipo cargó en el Planer y los muestra
// acá como alertas, para no tener que saltar entre módulos.
//
// SOLO LECTURA. Crear o editar sigue siendo del Planer: la RLS de
// planer_items permite leer a quien tiene el acceso principal, pero escribir
// exige el slug 'planer' y ser el autor de la fila.
// ═══════════════════════════════════════════════════════════════════════════

let GI_ITEMS = [];
let GI_FILTRO = 'alertas';   // alertas | semana | todos

const _hoyISO = () => { const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };

async function giCargarPlaner(){
  const cont = document.getElementById('kanbanContent');
  cont.innerHTML = '<div class="kb-empty">Cargando pendientes del equipo…</div>';
  try{
    const { data, error } = await SUPA.client.from('planer_items')
      .select('*').neq('estado_registro','Eliminado').order('fecha_limite',{ascending:true});
    if(error) throw error;
    GI_ITEMS = data || [];
    giRender();
  }catch(e){
    // Si el usuario no tiene permiso, se dice con todas sus letras en vez de
    // mostrar una lista vacía que parezca "no hay nada pendiente".
    cont.innerHTML = `<div class="kb-empty">No se pudieron leer los pendientes del Planer.<br>
      <span style="font-size:.82rem">${esc(e.message)}</span></div>`;
  }
}

function giSetFiltro(f){ GI_FILTRO = f; giRender(); }

// Un pendiente es alerta si vence hoy o ya venció y no está hecho.
function giEsAlerta(i){
  if(i.estado === 'hecho') return false;
  const f = i.fecha_limite || i.fecha_inicio;
  return !!f && f <= _hoyISO();
}
function giDiasRestantes(i){
  const f = i.fecha_limite || i.fecha_inicio; if(!f) return null;
  return Math.round((new Date(f+'T00:00:00') - new Date(_hoyISO()+'T00:00:00'))/86400000);
}

function giRender(){
  const cont = document.getElementById('kanbanContent');
  const hoy = _hoyISO();
  const en7 = new Date(Date.now()+7*86400000).toISOString().slice(0,10);

  const alertas = GI_ITEMS.filter(giEsAlerta);
  const semana  = GI_ITEMS.filter(i=>{
    const f=i.fecha_limite||i.fecha_inicio;
    return i.estado!=='hecho' && f && f>hoy && f<=en7;
  });
  const hechos  = GI_ITEMS.filter(i=>i.estado==='hecho').length;

  const lista = GI_FILTRO==='alertas' ? alertas
              : GI_FILTRO==='semana'  ? semana
              : GI_ITEMS.filter(i=>i.estado!=='hecho');

  // por autor, para ver la carga de cada especialista
  const porAutor = {};
  GI_ITEMS.filter(i=>i.estado!=='hecho').forEach(i=>{
    const a=i.autor_nombre||'—'; porAutor[a]=(porAutor[a]||0)+1;
  });

  cont.innerHTML = `
    <div class="kb-head">
      <div class="kb-title">📌 Pendientes del equipo</div>
      <a class="kb-add" href="../planer/" target="_blank" rel="noopener" style="text-decoration:none">Abrir Planer ↗</a>
    </div>
    <div class="gi-nota">Se ven los pendientes cargados en el Planer. Para crear o editar, entra al Planer.</div>

    <div class="gi-kpis">
      <div class="gi-kpi ${alertas.length?'alerta':''}"><div class="gi-kpi-n">${alertas.length}</div><div class="gi-kpi-l">Vencidos o de hoy</div></div>
      <div class="gi-kpi"><div class="gi-kpi-n">${semana.length}</div><div class="gi-kpi-l">Próximos 7 días</div></div>
      <div class="gi-kpi"><div class="gi-kpi-n">${GI_ITEMS.filter(i=>i.estado!=='hecho').length}</div><div class="gi-kpi-l">Abiertos</div></div>
      <div class="gi-kpi"><div class="gi-kpi-n" style="color:var(--green)">${hechos}</div><div class="gi-kpi-l">Cerrados</div></div>
    </div>

    ${Object.keys(porAutor).length ? `<div class="gi-autores">
      ${Object.keys(porAutor).sort((a,b)=>porAutor[b]-porAutor[a])
        .map(a=>`<span class="gi-autor">👤 ${esc(a)} <b>${porAutor[a]}</b></span>`).join('')}
    </div>` : ''}

    <div class="gi-filtros">
      ${[['alertas','⚠ Alertas',alertas.length],['semana','📆 Esta semana',semana.length],['todos','📋 Todos los abiertos',GI_ITEMS.filter(i=>i.estado!=='hecho').length]]
        .map(([k,t,n])=>`<button class="gi-f ${GI_FILTRO===k?'active':''}" onclick="giSetFiltro('${k}')">${t} <span>${n}</span></button>`).join('')}
    </div>

    ${!lista.length ? `<div class="kb-empty">${GI_FILTRO==='alertas'?'Nada vencido. Al día. 👌':'Sin pendientes en este filtro.'}</div>`
      : `<div class="gi-lista">${lista.map(giFilaHTML).join('')}</div>`}`;
}

function giFilaHTML(i){
  const d = giDiasRestantes(i);
  const venc = d!==null && d<0;
  const hoyMismo = d===0;
  const esRutina = i.tipo==='todo';
  return `<div class="gi-item ${venc?'venc':hoyMismo?'hoy':''}">
    <div class="gi-pri pri-${esc(i.prioridad||'media')}" title="Prioridad ${esc(i.prioridad||'media')}"></div>
    <div style="flex:1;min-width:0">
      <div class="gi-t">${esRutina?'🔁 ':''}${esc(i.titulo)}</div>
      <div class="gi-m">
        👤 ${esc(i.autor_nombre||'—')}
        ${i.fecha_limite||i.fecha_inicio ? ' · 📅 '+esc(i.fecha_limite||i.fecha_inicio) : ''}
        ${d!==null ? ` · <b class="${venc?'gi-venc':hoyMismo?'gi-hoy':''}">${venc?`${Math.abs(d)} día(s) atrasado`:hoyMismo?'vence hoy':`en ${d} día(s)`}</b>` : ''}
        · ${esc({pendiente:'Pendiente',en_progreso:'En progreso',hecho:'Hecho'}[i.estado]||i.estado)}
      </div>
      ${i.descripcion?`<div class="gi-d">${esc(i.descripcion)}</div>`:''}
    </div>
  </div>`;
}
