// ═══════════════════════════════════════════════════════════════════════════
// planer.js — Planificación de la semana, el mes y el día
// Sistema AM · Antofagasta Minerals
//
// Vista conjunta: cualquiera con el slug 'planer' ve TODOS los pendientes
// (RLS: planer_select). Solo se puede crear/editar/borrar a nombre propio
// (RLS: planer_insert/planer_update via autor_id = auth.uid()). Los filtros
// de la interfaz NO son seguridad — la seguridad vive en RLS (CLAUDE.md §3).
//
// DOS TIPOS DE FILA (columna `tipo`):
//   'pendiente' → algo puntual con fecha. Si se marca como repetido, se
//                 generan copias independientes (una fila por ocurrencia).
//   'todo'      → una rutina diaria/semanal/mensual. Es UNA sola fila; sus
//                 ocurrencias se calculan al vuelo y el cumplimiento de cada
//                 día se guarda en la tabla planer_todo_checks.
//
// ⚠️ Al editar este archivo hay que subir el ?v= del <script> en index.html,
//    o los navegadores seguirán sirviendo la copia vieja.
// ═══════════════════════════════════════════════════════════════════════════

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function toast(m, t) { const e = document.getElementById('toast'); e.textContent = m; e.className = 'toast show ' + (t || ''); setTimeout(() => { e.className = 'toast'; }, 3500); }

// ── FECHAS ──────────────────────────────────────────────────────────────────
// Siempre 'YYYY-MM-DD' en hora LOCAL. No usar toISOString() para esto: convierte
// a UTC y en Chile (UTC-3/-4) puede devolver el día equivocado.
function isoLocal(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function parseISO(s) { return new Date(s + 'T00:00:00'); }
function hoyISO() { return isoLocal(new Date()); }
function sumarDias(fechaISO, dias) { const d = parseISO(fechaISO); d.setDate(d.getDate() + dias); return isoLocal(d); }
function sumarMeses(fechaISO, n) { const d = parseISO(fechaISO); d.setMonth(d.getMonth() + n); return isoLocal(d); }
function lunesDe(fechaISO) { const d = parseISO(fechaISO); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return isoLocal(d); }
const DIAS_LARGO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DIAS_CORTO = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
function nombreDia(fechaISO) { return DIAS_LARGO[(parseISO(fechaISO).getDay() + 6) % 7]; }
function fechaLarga(fechaISO) { const d = parseISO(fechaISO); return nombreDia(fechaISO) + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()].toLowerCase() + ' de ' + d.getFullYear(); }

// ── FERIADOS CHILE ──────────────────────────────────────────────────────────
// Feriados legales, sin API externa. No incluye feriados por elecciones (se
// decretan aparte) ni feriados regionales.
// ⚠️ Hay que agregar el año siguiente a mano — no se actualiza solo.
const FERIADOS_CL = {
  '2026': [
    ['2026-01-01', 'Año Nuevo'], ['2026-04-03', 'Viernes Santo'], ['2026-04-04', 'Sábado Santo'],
    ['2026-05-01', 'Día del Trabajo'], ['2026-05-21', 'Glorias Navales'],
    ['2026-06-21', 'Día Nac. de los Pueblos Indígenas'], ['2026-06-29', 'San Pedro y San Pablo'],
    ['2026-07-16', 'Virgen del Carmen'], ['2026-08-15', 'Asunción de la Virgen'],
    ['2026-09-18', 'Independencia Nacional'], ['2026-09-19', 'Glorias del Ejército'],
    ['2026-10-12', 'Encuentro de Dos Mundos'], ['2026-10-31', 'Iglesias Evangélicas y Protestantes'],
    ['2026-11-01', 'Día de Todos los Santos'], ['2026-12-08', 'Inmaculada Concepción'], ['2026-12-25', 'Navidad'],
  ],
  '2027': [
    ['2027-01-01', 'Año Nuevo'], ['2027-03-26', 'Viernes Santo'], ['2027-03-27', 'Sábado Santo'],
    ['2027-05-01', 'Día del Trabajo'], ['2027-05-21', 'Glorias Navales'],
    ['2027-06-21', 'Día Nac. de los Pueblos Indígenas'], ['2027-06-28', 'San Pedro y San Pablo'],
    ['2027-07-16', 'Virgen del Carmen'], ['2027-08-15', 'Asunción de la Virgen'],
    ['2027-09-18', 'Independencia Nacional'], ['2027-09-19', 'Glorias del Ejército'],
    ['2027-10-12', 'Encuentro de Dos Mundos'], ['2027-10-31', 'Iglesias Evangélicas y Protestantes'],
    ['2027-11-01', 'Día de Todos los Santos'], ['2027-12-08', 'Inmaculada Concepción'], ['2027-12-25', 'Navidad'],
  ],
};
function feriadoDe(fechaISO) {
  const lista = FERIADOS_CL[fechaISO.slice(0, 4)] || [];
  const f = lista.find(x => x[0] === fechaISO);
  return f ? f[1] : null;
}

// ── ESTADO ──────────────────────────────────────────────────────────────────
let ITEMS = [];              // todas las filas de planer_items
let CHECKS = new Set();      // "todoId|YYYY-MM-DD" de los to-dos ya cumplidos
let FILTRO_AUTOR = '';
let FILTRO_ESTADO = '';
let EDIT_ID = null;
let VISTA = 'semana';        // lista | mes | semana | dia
let FOCO = hoyISO();         // fecha de referencia de la vista actual
let CAL_INSTANCE = null;

const ESTADO_LABEL = { pendiente: 'Pendiente', en_progreso: 'En progreso', hecho: 'Hecho' };
const PRIORIDAD_LABEL = { baja: 'Baja', media: 'Media', alta: 'Alta' };
const RECURRENCIA_LABEL = { ninguna: 'No se repite', diaria: 'Cada día', semanal: 'Cada semana', mensual: 'Cada mes' };
const PRIORIDAD_RANGO = { alta: 0, media: 1, baja: 2 };

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
    const [resItems, resChecks] = await Promise.all([
      SB.from('planer_items').select('*').neq('estado_registro', 'Eliminado').order('creado_en', { ascending: false }),
      SB.from('planer_todo_checks').select('todo_id,fecha'),
    ]);
    if (resItems.error) throw resItems.error;
    ITEMS = resItems.data || [];
    // Si la tabla de checks fallara, los to-dos siguen viéndose (sin marcar).
    CHECKS = new Set((resChecks.data || []).map(c => c.todo_id + '|' + c.fecha));
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

function pasaFiltros(i) {
  if (FILTRO_AUTOR && i.autor_nombre !== FILTRO_AUTOR) return false;
  if (FILTRO_ESTADO && i.estado !== FILTRO_ESTADO) return false;
  return true;
}
function filtrados() {
  return ITEMS.filter(pasaFiltros).sort((a, b) => {
    const pr = (PRIORIDAD_RANGO[a.prioridad] ?? 1) - (PRIORIDAD_RANGO[b.prioridad] ?? 1);
    if (pr !== 0) return pr;
    return (a.fecha_limite || a.fecha_inicio || '9999').localeCompare(b.fecha_limite || b.fecha_inicio || '9999');
  });
}

// ── OCURRENCIAS ─────────────────────────────────────────────────────────────
// ¿Este item aplica al día `f`? Los pendientes puntuales caen en su fecha; los
// to-dos se calculan según su regla de repetición, sin materializar filas.
function aplicaEnDia(i, f) {
  if (i.tipo === 'todo') {
    const desde = i.fecha_inicio || i.fecha_limite;
    if (!desde || f < desde) return false;
    if (i.recurrencia_hasta && f > i.recurrencia_hasta) return false;
    if (i.recurrencia === 'diaria') return true;
    if (i.recurrencia === 'semanal') return parseISO(f).getDay() === parseISO(desde).getDay();
    if (i.recurrencia === 'mensual') return parseISO(f).getDate() === parseISO(desde).getDate();
    return f === desde;                       // to-do sin repetición: solo ese día
  }
  const fi = i.fecha_inicio, ff = i.fecha_limite;
  if (fi && ff) return f >= fi && f <= ff;     // pendiente con rango de fechas
  return f === (ff || fi);
}
function itemsDelDia(f) {
  const todos = [], pendientes = [];
  ITEMS.filter(pasaFiltros).forEach(i => {
    if (!aplicaEnDia(i, f)) return;
    (i.tipo === 'todo' ? todos : pendientes).push(i);
  });
  pendientes.sort((a, b) => (PRIORIDAD_RANGO[a.prioridad] ?? 1) - (PRIORIDAD_RANGO[b.prioridad] ?? 1));
  return { todos, pendientes };
}
function contarDia(f) { const d = itemsDelDia(f); return d.todos.length + d.pendientes.length; }
function todoCumplido(id, f) { return CHECKS.has(id + '|' + f); }

// ── NAVEGACIÓN ENTRE VISTAS ─────────────────────────────────────────────────
function cambiarVista(v) {
  VISTA = v;
  ['lista', 'mes', 'semana', 'dia'].forEach(k => {
    const b = document.getElementById('tab_' + k);
    if (b) b.classList.toggle('active', k === v);
  });
  render();
}
function irHoy() { FOCO = hoyISO(); render(); }
function navegar(dir) {
  if (VISTA === 'mes') FOCO = sumarMeses(FOCO, dir);
  else if (VISTA === 'semana') FOCO = sumarDias(FOCO, dir * 7);
  else FOCO = sumarDias(FOCO, dir);
  render();
}
function abrirDia(f) { FOCO = f; cambiarVista('dia'); }

function render() {
  const panes = { lista: 'paneLista', mes: 'paneMes', semana: 'paneSemana', dia: 'paneDia' };
  Object.keys(panes).forEach(k => { document.getElementById(panes[k]).style.display = k === VISTA ? '' : 'none'; });
  document.getElementById('navFechas').style.display = VISTA === 'lista' ? 'none' : '';
  if (VISTA === 'lista') renderLista();
  else if (VISTA === 'mes') renderMes();
  else if (VISTA === 'semana') renderSemana();
  else renderDia();
}

// ── VISTA LISTA ─────────────────────────────────────────────────────────────
function renderLista() {
  const data = filtrados();
  document.getElementById('count').textContent = data.length + (data.length === 1 ? ' registro' : ' registros');
  const cont = document.getElementById('lista');
  if (!data.length) { cont.innerHTML = '<div class="kb-empty">Sin registros para este filtro.</div>'; return; }
  cont.innerHTML = data.map(tarjetaItem).join('');
}

function puedeEditar(i) { return ES_ADMIN || i.autor_id === (USER && USER.id); }

function tarjetaItem(i) {
  const ed = puedeEditar(i);
  const esTodo = i.tipo === 'todo';
  return `<div class="item-card ${i.estado === 'hecho' ? 'hecho' : ''}">
    <div style="flex:1;min-width:200px">
      <div class="item-titulo">${esTodo ? '🔁 ' : ''}${esc(i.titulo)}</div>
      <div class="item-meta">
        👤 ${esc(i.autor_nombre || '—')}
        <span class="pill ${esc(i.estado)}">${esc(ESTADO_LABEL[i.estado] || i.estado)}</span>
        <span class="pill ${esc(i.prioridad)}">${esc(PRIORIDAD_LABEL[i.prioridad] || i.prioridad)}</span>
        ${i.fecha_inicio ? '· 🟢 ' + esc(i.fecha_inicio) : ''}
        ${i.fecha_limite ? '· 📅 ' + esc(i.fecha_limite) : ''}
        ${i.recurrencia && i.recurrencia !== 'ninguna' ? '· 🔁 ' + esc(RECURRENCIA_LABEL[i.recurrencia] || i.recurrencia) : ''}
        ${i.origen === 'ia' ? '· 🤖 IA' : ''}
      </div>
      ${i.descripcion ? `<div class="item-desc">${esc(i.descripcion)}</div>` : ''}
    </div>
    <div class="item-acciones">
      ${(i.fecha_limite || i.fecha_inicio) ? `<button class="mini-btn" onclick="descargarICS('${i.item_id}')" title="Descargar al calendario">⬇️</button>` : ''}
      ${ed ? `<button class="mini-btn" onclick="abrirEditar('${i.item_id}')" title="Editar">✏</button>` : ''}
      ${ed && !esTodo && i.estado !== 'hecho' ? `<button class="mini-btn" onclick="marcarHecho('${i.item_id}')" title="Marcar como hecho">✓</button>` : ''}
      ${ed ? `<button class="mini-btn danger" onclick="borrarItem('${i.item_id}')" title="Eliminar">🗑</button>` : ''}
    </div>
  </div>`;
}

// ── VISTA MES ───────────────────────────────────────────────────────────────
function renderMes() {
  const d = parseISO(FOCO);
  document.getElementById('navTitulo').textContent = MESES[d.getMonth()] + ' ' + d.getFullYear();
  const cont = document.getElementById('calendario');
  if (!window.VanillaCalendar) { cont.innerHTML = '<div class="kb-empty">No se pudo cargar el calendario (sin conexión al CDN). Usa la vista Semana o Lista.</div>'; return; }

  // Un popup por día: marca los días con compromisos (modifier = clase CSS) y
  // muestra el detalle al pasar por encima. Los feriados se suman al mismo mapa.
  const popups = {};
  const ini = FOCO.slice(0, 8) + '01';
  const finMes = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  for (let n = 1; n <= finMes; n++) {
    const f = FOCO.slice(0, 8) + String(n).padStart(2, '0');
    const { todos, pendientes } = itemsDelDia(f);
    const total = todos.length + pendientes.length;
    const fer = feriadoDe(f);
    if (!total && !fer) continue;
    const partes = [];
    if (fer) partes.push('🇨🇱 ' + esc(fer));
    pendientes.slice(0, 4).forEach(i => partes.push('• ' + esc(i.titulo)));
    todos.slice(0, 4).forEach(i => partes.push('🔁 ' + esc(i.titulo)));
    if (total > 8) partes.push('… y ' + (total - 8) + ' más');
    popups[f] = {
      modifier: total ? 'vc-con-items' : 'vc-feriado',
      html: '<span class="vc-pop">' + partes.join('<br>') + '</span>',
    };
  }
  (FERIADOS_CL[FOCO.slice(0, 4)] || []).forEach(([f, nombre]) => {
    if (!popups[f]) popups[f] = { modifier: 'vc-feriado', html: '<span class="vc-pop">🇨🇱 ' + esc(nombre) + '</span>' };
  });

  cont.innerHTML = '';
  if (CAL_INSTANCE && CAL_INSTANCE.destroy) { try { CAL_INSTANCE.destroy(); } catch (e) { /* instancia ya descartada */ } }
  CAL_INSTANCE = new window.VanillaCalendar(cont, {
    locale: 'es',
    firstWeekday: 1,
    selectionDatesMode: 'single',
    selectedMonth: d.getMonth(),
    selectedYear: d.getFullYear(),
    selectedDates: [FOCO],
    popups,
    onClickDate(self) {
      const sel = self.context.selectedDates[0];
      if (sel) abrirDia(sel);          // clic en un día → vista Día de ese día
    },
  });
  CAL_INSTANCE.init();
  void ini;
}

// ── VISTA SEMANA ────────────────────────────────────────────────────────────
function renderSemana() {
  const lunes = lunesDe(FOCO);
  const domingo = sumarDias(lunes, 6);
  const dl = parseISO(lunes), dd = parseISO(domingo);
  document.getElementById('navTitulo').textContent =
    dl.getDate() + ' ' + MESES[dl.getMonth()].slice(0, 3).toLowerCase() +
    ' – ' + dd.getDate() + ' ' + MESES[dd.getMonth()].slice(0, 3).toLowerCase() + ' ' + dd.getFullYear();

  const hoy = hoyISO();
  let html = '<div class="semana-grid">';
  for (let n = 0; n < 7; n++) {
    const f = sumarDias(lunes, n);
    const { todos, pendientes } = itemsDelDia(f);
    const fer = feriadoDe(f);
    html += `<div class="dia-col ${f === hoy ? 'es-hoy' : ''} ${fer ? 'es-feriado' : ''}">
      <div class="dia-col-head" onclick="abrirDia('${f}')">
        <span class="dc-dow">${DIAS_CORTO[n]}</span>
        <span class="dc-num">${parseISO(f).getDate()}</span>
        ${fer ? `<span class="dc-fer" title="${esc(fer)}">🇨🇱</span>` : ''}
      </div>
      <div class="dia-col-body">`;
    if (!todos.length && !pendientes.length) {
      html += '<div class="dia-vacio">—</div>';
    } else {
      todos.forEach(i => {
        const ok = todoCumplido(i.item_id, f);
        html += `<div class="mini-item todo ${ok ? 'ok' : ''}" onclick="abrirDia('${f}')" title="${esc(i.titulo)}">${ok ? '☑' : '☐'} ${esc(i.titulo)}</div>`;
      });
      pendientes.forEach(i => {
        html += `<div class="mini-item pri-${esc(i.prioridad || 'media')} ${i.estado === 'hecho' ? 'ok' : ''}" onclick="abrirDia('${f}')" title="${esc(i.titulo)}">${esc(i.titulo)}</div>`;
      });
    }
    html += `</div><button class="dia-col-add" onclick="abrirNuevoEnFecha('${f}')" title="Agregar en este día">＋</button></div>`;
  }
  html += '</div>';
  document.getElementById('paneSemana').innerHTML = html;
}

// ── VISTA DÍA ───────────────────────────────────────────────────────────────
function renderDia() {
  const f = FOCO;
  const fer = feriadoDe(f);
  document.getElementById('navTitulo').textContent = fechaLarga(f) + (f === hoyISO() ? ' · hoy' : '');
  const { todos, pendientes } = itemsDelDia(f);

  let html = '';
  if (fer) html += `<div class="dia-feriado">🇨🇱 Feriado: ${esc(fer)}</div>`;

  html += `<div class="dia-sec">
    <div class="dia-sec-t">🔁 Rutinas del día <span class="dia-sec-n">${todos.length}</span></div>`;
  if (!todos.length) {
    html += '<div class="kb-empty">Sin rutinas para este día.</div>';
  } else {
    html += todos.map(i => {
      const ok = todoCumplido(i.item_id, f);
      const ed = puedeEditar(i);
      return `<div class="todo-row ${ok ? 'ok' : ''}">
        <button class="todo-check" onclick="toggleTodo('${i.item_id}','${f}')" ${ed ? '' : 'disabled title="Solo su autor puede marcarla"'}>${ok ? '☑' : '☐'}</button>
        <div class="todo-main">
          <div class="todo-t">${esc(i.titulo)}</div>
          <div class="todo-m">👤 ${esc(i.autor_nombre || '—')} · ${esc(RECURRENCIA_LABEL[i.recurrencia] || i.recurrencia)}${i.descripcion ? ' · ' + esc(i.descripcion) : ''}</div>
        </div>
        <div class="item-acciones">
          ${ed ? `<button class="mini-btn" onclick="abrirEditar('${i.item_id}')" title="Editar">✏</button>` : ''}
          ${ed ? `<button class="mini-btn danger" onclick="borrarItem('${i.item_id}')" title="Eliminar la rutina completa">🗑</button>` : ''}
        </div>
      </div>`;
    }).join('');
  }
  html += '</div>';

  html += `<div class="dia-sec">
    <div class="dia-sec-t">📌 Pendientes del día <span class="dia-sec-n">${pendientes.length}</span></div>`;
  html += pendientes.length ? pendientes.map(tarjetaItem).join('') : '<div class="kb-empty">Sin pendientes para este día.</div>';
  html += '</div>';

  html += `<button class="kb-add" style="width:100%;margin-top:6px" onclick="abrirNuevoEnFecha('${f}')">➕ Agregar en ${esc(nombreDia(f).toLowerCase())} ${parseISO(f).getDate()}</button>`;
  document.getElementById('paneDia').innerHTML = html;
}

// ── CHECK DE RUTINAS ────────────────────────────────────────────────────────
async function toggleTodo(id, f) {
  const key = id + '|' + f;
  const estaba = CHECKS.has(key);
  try {
    if (estaba) {
      const { error } = await SB.from('planer_todo_checks').delete().eq('todo_id', id).eq('fecha', f);
      if (error) throw error;
      CHECKS.delete(key);
    } else {
      const { error } = await SB.from('planer_todo_checks').insert({ todo_id: id, fecha: f, autor_id: USER.id });
      if (error) throw error;
      CHECKS.add(key);
    }
    render();
  } catch (e) { toast('No se pudo actualizar: ' + e.message, 'err'); }
}

// ── FORMULARIO ──────────────────────────────────────────────────────────────
function abrirNuevo() { abrirNuevoEnFecha(VISTA === 'lista' || VISTA === 'mes' ? '' : FOCO); }

function abrirNuevoEnFecha(f) {
  EDIT_ID = null;
  document.getElementById('formTitle').textContent = 'Nuevo registro';
  document.getElementById('fTipo').value = 'pendiente';
  document.getElementById('fTitulo').value = '';
  document.getElementById('fDescripcion').value = '';
  document.getElementById('fEstadoItem').value = 'pendiente';
  document.getElementById('fPrioridad').value = 'media';
  document.getElementById('fFechaInicio').value = f || '';
  document.getElementById('fFecha').value = f || '';
  document.getElementById('fRecurrencia').value = 'ninguna';
  document.getElementById('fRecurrenciaHasta').value = '';
  document.getElementById('btnBorrarForm').style.display = 'none';
  onTipoChange();
  document.getElementById('formModal').style.display = 'flex';
}

function abrirEditar(id) {
  const i = ITEMS.find(x => x.item_id === id); if (!i) return;
  EDIT_ID = id;
  document.getElementById('formTitle').textContent = 'Editar registro';
  document.getElementById('fTipo').value = i.tipo || 'pendiente';
  document.getElementById('fTitulo').value = i.titulo || '';
  document.getElementById('fDescripcion').value = i.descripcion || '';
  document.getElementById('fEstadoItem').value = i.estado || 'pendiente';
  document.getElementById('fPrioridad').value = i.prioridad || 'media';
  document.getElementById('fFechaInicio').value = i.fecha_inicio || '';
  document.getElementById('fFecha').value = i.fecha_limite || '';
  document.getElementById('fRecurrencia').value = i.recurrencia || 'ninguna';
  document.getElementById('fRecurrenciaHasta').value = i.recurrencia_hasta || '';
  document.getElementById('btnBorrarForm').style.display = puedeEditar(i) ? '' : 'none';
  onTipoChange();
  document.getElementById('formModal').style.display = 'flex';
}

// Una rutina no tiene "estado" ni fecha de término propia: tiene desde-cuándo,
// cada-cuánto y hasta-cuándo. Se marca día a día.
function onTipoChange() {
  const esTodo = document.getElementById('fTipo').value === 'todo';
  document.getElementById('fldEstado').style.display = esTodo ? 'none' : '';
  document.getElementById('fldFechaFin').style.display = esTodo ? 'none' : '';
  document.getElementById('optDiaria').style.display = esTodo ? '' : 'none';
  document.getElementById('lblFechaIni').textContent = esTodo ? 'Empieza el' : 'Fecha inicio';
  document.getElementById('ayudaTipo').textContent = esTodo
    ? 'Rutina que se repite y se marca cada día en la vista Día.'
    : 'Tarea puntual con fecha. Si la repites, se crean copias independientes.';
  if (!esTodo && document.getElementById('fRecurrencia').value === 'diaria') {
    document.getElementById('fRecurrencia').value = 'ninguna';
  }
  toggleRecurrenciaHasta();
}
function toggleRecurrenciaHasta() {
  const rec = document.getElementById('fRecurrencia').value;
  document.getElementById('fldRecurrenciaHasta').style.display = rec === 'ninguna' ? 'none' : '';
}
function cerrarForm() { document.getElementById('formModal').style.display = 'none'; }
function nuevoId() { return 'plan_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6); }
function miNombre() {
  try { return (USER.user_metadata && (USER.user_metadata.full_name || USER.user_metadata.name)) || (USER.email || '').split('@')[0]; }
  catch (e) { return ''; }
}

async function guardarItem() {
  const titulo = document.getElementById('fTitulo').value.trim();
  if (!titulo) { toast('El título es obligatorio', 'err'); return; }
  const tipo = document.getElementById('fTipo').value;
  const esTodo = tipo === 'todo';
  const recurrencia = document.getElementById('fRecurrencia').value;
  const recurrenciaHasta = document.getElementById('fRecurrenciaHasta').value || null;
  const fIni = document.getElementById('fFechaInicio').value || null;
  const fFin = esTodo ? null : (document.getElementById('fFecha').value || null);

  if (esTodo && !fIni) { toast('Indica desde qué día empieza la rutina', 'err'); return; }
  if (esTodo && recurrencia === 'ninguna') { toast('Una rutina necesita repetirse: elige diaria, semanal o mensual', 'err'); return; }
  if (!esTodo && recurrencia !== 'ninguna' && (!(fFin || fIni) || !recurrenciaHasta)) {
    toast('Para repetir, indica fecha y hasta cuándo', 'err'); return;
  }

  const base = {
    tipo, titulo,
    descripcion: document.getElementById('fDescripcion').value.trim(),
    estado: esTodo ? 'pendiente' : document.getElementById('fEstadoItem').value,
    prioridad: document.getElementById('fPrioridad').value,
    fecha_inicio: fIni,
    fecha_limite: fFin,
    recurrencia,
    recurrencia_hasta: recurrenciaHasta,
    updated_at: new Date().toISOString(),
  };
  try {
    if (EDIT_ID) {
      const { error } = await SB.from('planer_items').update(base).eq('item_id', EDIT_ID);
      if (error) throw error;
      toast('✅ Actualizado', 'success');
    } else if (esTodo || recurrencia === 'ninguna') {
      // Una rutina es UNA fila: sus ocurrencias se calculan, no se guardan.
      const payload = { ...base, item_id: nuevoId(), autor_id: USER.id, autor_nombre: miNombre(), origen: 'manual' };
      const { error } = await SB.from('planer_items').insert(payload);
      if (error) throw error;
      toast(esTodo ? '✅ Rutina creada' : '✅ Pendiente creado', 'success');
    } else {
      const filas = generarSerieRecurrente(base, recurrencia, recurrenciaHasta);
      const { error } = await SB.from('planer_items').insert(filas);
      if (error) throw error;
      toast('✅ ' + filas.length + ' pendientes creados', 'success');
    }
    cerrarForm();
    await cargarItems();
  } catch (e) { toast('Error: ' + e.message, 'err'); }
}

function generarSerieRecurrente(base, recurrencia, hasta) {
  const serieId = 'ser_' + Date.now().toString(36);
  const paso = recurrencia === 'semanal' ? (f => sumarDias(f, 7)) : (f => sumarMeses(f, 1));
  const filas = [];
  let fi = base.fecha_inicio;
  let ff = base.fecha_limite || base.fecha_inicio;
  let guard = 0;
  while (ff && ff <= hasta && guard < 104) {
    filas.push({ ...base, item_id: nuevoId(), autor_id: USER.id, autor_nombre: miNombre(), origen: 'manual', serie_id: serieId, fecha_inicio: fi, fecha_limite: ff });
    if (fi) fi = paso(fi);
    ff = paso(ff);
    guard++;
  }
  return filas;
}

async function marcarHecho(id) {
  try {
    const { error } = await SB.from('planer_items').update({ estado: 'hecho', updated_at: new Date().toISOString() }).eq('item_id', id);
    if (error) throw error;
    await cargarItems();
    toast('✅ Marcado como hecho', 'success');
  } catch (e) { toast('Error: ' + e.message, 'err'); }
}

// Borrado lógico (estado_registro), mismo criterio que el resto del sistema:
// nada se borra de verdad, deja de listarse. La RLS solo deja borrar lo propio.
async function borrarItem(id) {
  const i = ITEMS.find(x => x.item_id === id); if (!i) return;
  const esTodo = i.tipo === 'todo';
  const aviso = esTodo
    ? '¿Eliminar la rutina "' + i.titulo + '"?\n\nDeja de aparecer en todos los días.'
    : '¿Eliminar "' + i.titulo + '"?';
  if (!confirm(aviso)) return;
  try {
    const { error } = await SB.from('planer_items')
      .update({ estado_registro: 'Eliminado', updated_at: new Date().toISOString() })
      .eq('item_id', id);
    if (error) throw error;
    cerrarForm();
    await cargarItems();
    toast('🗑 Eliminado', 'success');
  } catch (e) { toast('No se pudo eliminar: ' + e.message, 'err'); }
}
function borrarDesdeForm() { if (EDIT_ID) borrarItem(EDIT_ID); }

// ── DICTADO POR VOZ ─────────────────────────────────────────────────────────
// Web Speech API nativa del navegador (sin librería, sin servicio externo).
// Chrome/Edge la soportan. Safari/iOS no la expone por JS — ahí el botón se
// oculta solo, y el teclado del iPhone ya trae su propio micrófono de dictado
// que funciona sobre estos mismos campos sin necesitar nada más.
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
function dictar(campoId, btnId) {
  if (!SpeechRec) { toast('El dictado no está disponible en este navegador. En iPhone usa el micrófono del teclado.', 'err'); return; }
  const btn = document.getElementById(btnId);
  const campo = document.getElementById(campoId);
  const rec = new SpeechRec();
  rec.lang = 'es-CL';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  btn.classList.add('mic-on'); btn.textContent = '🔴';
  rec.onresult = ev => {
    const texto = ev.results[0][0].transcript;
    campo.value = campo.value ? campo.value + ' ' + texto : texto;
  };
  rec.onerror = () => toast('No se pudo escuchar. Intenta de nuevo.', 'err');
  rec.onend = () => { btn.classList.remove('mic-on'); btn.textContent = '🎤'; };
  rec.start();
}
(function ocultarMicSiNoSoportado() {
  if (SpeechRec) return;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.mic-btn').forEach(b => { b.style.display = 'none'; });
  });
})();

// ── EXPORTAR A CALENDARIO (.ics) ────────────────────────────────────────────
// Formato estándar RFC 5545: lo abren igual iPhone (Calendario), Android
// (Google Calendar) y Outlook, sin depender de ninguno en particular.
function icsEscape(s) { return String(s || '').replace(/[\\,;]/g, m => '\\' + m).replace(/\n/g, '\\n'); }
function icsFecha(fechaISO) { return fechaISO.replace(/-/g, ''); }
function icsBloque(item) {
  const ini = item.fecha_inicio || item.fecha_limite;
  if (!ini) return '';
  const fin = item.tipo === 'todo' ? ini : (item.fecha_limite || ini);
  const RRULE = { diaria: 'DAILY', semanal: 'WEEKLY', mensual: 'MONTHLY' }[item.recurrencia];
  return [
    'BEGIN:VEVENT',
    'UID:' + item.item_id + '@sistema-am',
    'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    'DTSTART;VALUE=DATE:' + icsFecha(ini),
    'DTEND;VALUE=DATE:' + icsFecha(sumarDias(fin, 1)),
    // Las rutinas viajan como regla de repetición nativa del calendario, no
    // como cientos de eventos sueltos.
    (item.tipo === 'todo' && RRULE)
      ? 'RRULE:FREQ=' + RRULE + (item.recurrencia_hasta ? ';UNTIL=' + icsFecha(item.recurrencia_hasta) : '')
      : '',
    'SUMMARY:' + icsEscape(item.titulo),
    item.descripcion ? 'DESCRIPTION:' + icsEscape(item.descripcion) : '',
    'PRIORITY:' + (item.prioridad === 'alta' ? 1 : item.prioridad === 'baja' ? 9 : 5),
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Recordatorio', 'TRIGGER:-P0DT9H0M0S', 'END:VALARM',
    'END:VEVENT',
  ].filter(Boolean).join('\r\n');
}
function icsArchivo(bloques) {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sistema AM//Planer//ES', 'CALSCALE:GREGORIAN']
    .concat(bloques).concat('END:VCALENDAR').join('\r\n');
}
function descargarArchivo(nombre, contenido) {
  const blob = new Blob([contenido], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function descargarICS(id) {
  const i = ITEMS.find(x => x.item_id === id); if (!i) return;
  if (!i.fecha_limite && !i.fecha_inicio) { toast('Este registro no tiene fecha', 'err'); return; }
  descargarArchivo('planer-' + id + '.ics', icsArchivo([icsBloque(i)]));
  toast('⬇️ Descargado. Ábrelo para agregarlo a tu calendario.', 'success');
}
function descargarTodosICS() {
  const data = filtrados().filter(i => i.fecha_limite || i.fecha_inicio);
  if (!data.length) { toast('No hay registros con fecha para descargar', 'err'); return; }
  descargarArchivo('planer-pendientes.ics', icsArchivo(data.map(icsBloque)));
  toast('⬇️ ' + data.length + ' registros descargados (iPhone, Android u Outlook).', 'success');
}
