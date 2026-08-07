// ═══════════════════════════════════════════════════════════════════════════
// planer.js — Pendientes y acciones por especialista (Planer / PlanIA-Personal)
// Sistema AM · Antofagasta Minerals
//
// Vista conjunta: cualquiera con el slug 'planer' ve TODOS los pendientes
// (RLS: planer_select). Solo se puede crear/editar a nombre propio (RLS:
// planer_insert/planer_update via autor_id = auth.uid()). El filtro "por
// quién lo generó" es un filtro de UI sobre datos que ya llegaron completos
// — no reemplaza la seguridad, que vive en RLS (CLAUDE.md §3).
//
// origen: 'manual' | 'ia' — el segundo queda listo para cuando se conecte
// PlanIA-Personal (aún en desarrollo aparte, ver docs/PENDIENTES.md).
// ═══════════════════════════════════════════════════════════════════════════

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function toast(m, t) { const e = document.getElementById('toast'); e.textContent = m; e.className = 'toast show ' + (t || ''); setTimeout(() => { e.className = 'toast'; }, 3500); }

let ITEMS = [];
let FILTRO_AUTOR = '';
let FILTRO_ESTADO = '';
let EDIT_ID = null;

async function _planerOnAcceso(user) {
  document.getElementById('gate').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('hUser').textContent = (user.email || '').split('@')[0];
  await cargarItems();
}

async function cargarItems() {
  const cont = document.getElementById('lista');
  cont.innerHTML = '<div class="kb-empty">Cargando…</div>';
  try {
    const { data, error } = await SB.from('planer_items').select('*').neq('estado_registro', 'Eliminado').order('creado_en', { ascending: false });
    if (error) throw error;
    ITEMS = data || [];
    poblarFiltroAutor();
    render();
  } catch (e) {
    cont.innerHTML = '<div class="kb-empty">Error al cargar: ' + esc(e.message) + '</div>';
  }
}

function poblarFiltroAutor() {
  const sel = document.getElementById('fAutor');
  const actual = sel.value;
  const autores = [...new Set(ITEMS.map(i => i.autor_nombre).filter(Boolean))].sort();
  sel.innerHTML = '<option value="">Todos los autores</option>' + autores.map(a => `<option value="${esc(a)}">${esc(a)}</option>`).join('');
  if (autores.includes(actual)) sel.value = actual;
}

function setFiltroAutor(v) { FILTRO_AUTOR = v; render(); }
function setFiltroEstado(v) { FILTRO_ESTADO = v; render(); }

function filtrados() {
  return ITEMS.filter(i => {
    if (FILTRO_AUTOR && i.autor_nombre !== FILTRO_AUTOR) return false;
    if (FILTRO_ESTADO && i.estado !== FILTRO_ESTADO) return false;
    return true;
  });
}

const ESTADO_LABEL = { pendiente: 'Pendiente', en_progreso: 'En progreso', hecho: 'Hecho' };
const PRIORIDAD_LABEL = { baja: 'Baja', media: 'Media', alta: 'Alta' };

function render() {
  const data = filtrados();
  document.getElementById('count').textContent = data.length + ' pendiente' + (data.length === 1 ? '' : 's');
  const cont = document.getElementById('lista');
  if (!data.length) { cont.innerHTML = '<div class="kb-empty">Sin pendientes para este filtro.</div>'; return; }
  cont.innerHTML = data.map(i => {
    const puedeEditar = ES_ADMIN || i.autor_id === (USER && USER.id);
    return `<div class="item-card ${i.estado === 'hecho' ? 'hecho' : ''}">
      <div style="flex:1;min-width:220px">
        <div class="item-titulo">${esc(i.titulo)}</div>
        <div class="item-meta">
          👤 ${esc(i.autor_nombre || '—')}
          <span class="pill ${esc(i.estado)}">${esc(ESTADO_LABEL[i.estado] || i.estado)}</span>
          <span class="pill ${esc(i.prioridad)}">${esc(PRIORIDAD_LABEL[i.prioridad] || i.prioridad)}</span>
          ${i.fecha_limite ? '· 📅 ' + esc(i.fecha_limite) : ''}
          ${i.origen === 'ia' ? '· 🤖 IA' : ''}
        </div>
        ${i.descripcion ? `<div class="item-desc">${esc(i.descripcion)}</div>` : ''}
      </div>
      <div class="item-acciones">
        ${puedeEditar ? `<button class="mini-btn" onclick="abrirEditar('${i.item_id}')">✏ Editar</button>` : ''}
        ${puedeEditar && i.estado !== 'hecho' ? `<button class="mini-btn" onclick="marcarHecho('${i.item_id}')">✓ Hecho</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function abrirNuevo() {
  EDIT_ID = null;
  document.getElementById('formTitle').textContent = 'Nuevo pendiente';
  document.getElementById('fTitulo').value = '';
  document.getElementById('fDescripcion').value = '';
  document.getElementById('fEstado').value = 'pendiente';
  document.getElementById('fPrioridad').value = 'media';
  document.getElementById('fFecha').value = '';
  document.getElementById('formModal').style.display = 'flex';
}

function abrirEditar(id) {
  const i = ITEMS.find(x => x.item_id === id); if (!i) return;
  EDIT_ID = id;
  document.getElementById('formTitle').textContent = 'Editar pendiente';
  document.getElementById('fTitulo').value = i.titulo || '';
  document.getElementById('fDescripcion').value = i.descripcion || '';
  document.getElementById('fEstado').value = i.estado || 'pendiente';
  document.getElementById('fPrioridad').value = i.prioridad || 'media';
  document.getElementById('fFecha').value = i.fecha_limite || '';
  document.getElementById('formModal').style.display = 'flex';
}

function cerrarForm() { document.getElementById('formModal').style.display = 'none'; }

async function guardarItem() {
  const titulo = document.getElementById('fTitulo').value.trim();
  if (!titulo) { toast('El título es obligatorio', 'err'); return; }
  const payload = {
    titulo,
    descripcion: document.getElementById('fDescripcion').value.trim(),
    estado: document.getElementById('fEstado').value,
    prioridad: document.getElementById('fPrioridad').value,
    fecha_limite: document.getElementById('fFecha').value || null,
    updated_at: new Date().toISOString(),
  };
  try {
    if (EDIT_ID) {
      const { error } = await SB.from('planer_items').update(payload).eq('item_id', EDIT_ID);
      if (error) throw error;
      toast('✅ Pendiente actualizado', 'success');
    } else {
      payload.item_id = 'plan_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      payload.autor_id = USER.id;
      payload.autor_nombre = miNombre();
      payload.origen = 'manual';
      const { error } = await SB.from('planer_items').insert(payload);
      if (error) throw error;
      toast('✅ Pendiente creado', 'success');
    }
    cerrarForm();
    await cargarItems();
  } catch (e) { toast('Error: ' + e.message, 'err'); }
}

async function marcarHecho(id) {
  try {
    const { error } = await SB.from('planer_items').update({ estado: 'hecho', updated_at: new Date().toISOString() }).eq('item_id', id);
    if (error) throw error;
    await cargarItems();
    toast('✅ Marcado como hecho', 'success');
  } catch (e) { toast('Error: ' + e.message, 'err'); }
}

function miNombre() {
  try { return (USER.user_metadata && (USER.user_metadata.full_name || USER.user_metadata.name)) || (USER.email || '').split('@')[0]; }
  catch (e) { return ''; }
}
