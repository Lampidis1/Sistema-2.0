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
let VISTA = 'lista';
let CAL_INSTANCE = null;

// ── FERIADOS CHILE ──────────────────────────────────────────────────────────
// Feriados legales fijos + los que dependen de Pascua (calculados a mano cada
// año). Fuente: Diario Oficial / gob.cl. No incluye feriados por elecciones
// (se decretan aparte, fecha variable) ni feriados regionales.
// ⚠️ Revisar y agregar el año siguiente cuando corresponda — no se actualiza solo.
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
  const anio = fechaISO.slice(0, 4);
  const lista = FERIADOS_CL[anio] || [];
  const f = lista.find(x => x[0] === fechaISO);
  return f ? f[1] : null;
}

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

const PRIORIDAD_RANGO = { alta: 0, media: 1, baja: 2 };
function filtrados() {
  return ITEMS.filter(i => {
    if (FILTRO_AUTOR && i.autor_nombre !== FILTRO_AUTOR) return false;
    if (FILTRO_ESTADO && i.estado !== FILTRO_ESTADO) return false;
    return true;
  }).sort((a, b) => {
    const pr = (PRIORIDAD_RANGO[a.prioridad] ?? 1) - (PRIORIDAD_RANGO[b.prioridad] ?? 1);
    if (pr !== 0) return pr;
    return (a.fecha_limite || a.fecha_inicio || '9999').localeCompare(b.fecha_limite || b.fecha_inicio || '9999');
  });
}

function cambiarVista(v) {
  VISTA = v;
  document.getElementById('tabLista').classList.toggle('active', v === 'lista');
  document.getElementById('tabCal').classList.toggle('active', v === 'calendario');
  document.getElementById('lista').style.display = v === 'lista' ? '' : 'none';
  document.getElementById('vistaCalendario').style.display = v === 'calendario' ? '' : 'none';
  if (v === 'calendario') renderCalendario();
}

function renderCalendario() {
  const cont = document.getElementById('calendario');
  if (!window.VanillaCalendar) { cont.innerHTML = '<div class="kb-empty">No se pudo cargar el calendario (sin conexión al CDN). Usa la vista de lista.</div>'; return; }
  const data = filtrados();
  const porDia = {};
  data.forEach(i => {
    const d = i.fecha_limite || i.fecha_inicio;
    if (!d) return;
    (porDia[d] = porDia[d] || []).push(i);
  });
  const feriadosAnio = [...new Set(data.map(i => (i.fecha_limite || i.fecha_inicio || '').slice(0, 4)))]
    .concat([String(new Date().getFullYear())])
    .flatMap(a => FERIADOS_CL[a] || []);
  const popupsFeriados = {};
  feriadosAnio.forEach(([f, nombre]) => { popupsFeriados[f] = { html: '🇨🇱 ' + esc(nombre) }; });

  cont.innerHTML = '';
  if (CAL_INSTANCE && CAL_INSTANCE.destroy) { try { CAL_INSTANCE.destroy(); } catch (e) {} }
  CAL_INSTANCE = new window.VanillaCalendar(cont, {
    locale: 'es',
    firstWeekday: 1,
    selectionDatesMode: 'single',
    popups: popupsFeriados,
    selectedDates: [],
    onClickDate(self) {
      const sel = self.context.selectedDates[0];
      if (!sel) return;
      const items = porDia[sel] || [];
      const cd = document.getElementById('calDiaSel');
      const feriado = feriadoDe(sel);
      let html = `<div class="cal-dia-t">${sel}${feriado ? ' · 🇨🇱 ' + esc(feriado) : ''}</div>`;
      if (!items.length) html += '<div class="kb-empty">Sin pendientes este día.</div>';
      else items.forEach(i => {
        html += `<div class="item-card ${i.estado === 'hecho' ? 'hecho' : ''}">
          <div style="flex:1"><div class="item-titulo">${esc(i.titulo)}</div>
          <div class="item-meta"><span class="pill ${esc(i.prioridad)}">${esc(PRIORIDAD_LABEL[i.prioridad] || i.prioridad)}</span> 👤 ${esc(i.autor_nombre || '—')}</div></div>
          <div class="item-acciones"><button class="mini-btn" onclick="descargarICS('${i.item_id}')">⬇️ ICS</button></div>
        </div>`;
      });
      cd.innerHTML = html;
    },
  });
  CAL_INSTANCE.init();
  // marcar días con pendientes
  Object.keys(porDia).forEach(d => {
    const el = cont.querySelector(`[data-vc-date="${d}"]`);
    if (el) el.classList.add('cal-tiene-item');
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
          ${i.fecha_inicio ? '· 🟢 ' + esc(i.fecha_inicio) : ''}
          ${i.fecha_limite ? '· 📅 ' + esc(i.fecha_limite) : ''}
          ${i.recurrencia && i.recurrencia !== 'ninguna' ? '· 🔁 ' + esc(i.recurrencia) : ''}
          ${i.origen === 'ia' ? '· 🤖 IA' : ''}
        </div>
        ${i.descripcion ? `<div class="item-desc">${esc(i.descripcion)}</div>` : ''}
      </div>
      <div class="item-acciones">
        ${(i.fecha_limite || i.fecha_inicio) ? `<button class="mini-btn" onclick="descargarICS('${i.item_id}')">⬇️ Calendario</button>` : ''}
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
  document.getElementById('fFechaInicio').value = '';
  document.getElementById('fFecha').value = '';
  document.getElementById('fRecurrencia').value = 'ninguna';
  document.getElementById('fRecurrenciaHasta').value = '';
  toggleRecurrenciaHasta();
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
  document.getElementById('fFechaInicio').value = i.fecha_inicio || '';
  document.getElementById('fFecha').value = i.fecha_limite || '';
  document.getElementById('fRecurrencia').value = i.recurrencia || 'ninguna';
  document.getElementById('fRecurrenciaHasta').value = i.recurrencia_hasta || '';
  toggleRecurrenciaHasta();
  document.getElementById('formModal').style.display = 'flex';
}

function toggleRecurrenciaHasta() {
  const rec = document.getElementById('fRecurrencia').value;
  document.getElementById('fldRecurrenciaHasta').style.display = rec === 'ninguna' ? 'none' : '';
}

function cerrarForm() { document.getElementById('formModal').style.display = 'none'; }

function sumarDias(fechaISO, dias) {
  const d = new Date(fechaISO + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}
function sumarMes(fechaISO) {
  const d = new Date(fechaISO + 'T00:00:00');
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
function nuevoId() { return 'plan_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6); }

async function guardarItem() {
  const titulo = document.getElementById('fTitulo').value.trim();
  if (!titulo) { toast('El título es obligatorio', 'err'); return; }
  const recurrencia = document.getElementById('fRecurrencia').value;
  const recurrenciaHasta = document.getElementById('fRecurrenciaHasta').value || null;
  const fechaBase = document.getElementById('fFecha').value || document.getElementById('fFechaInicio').value || null;
  if (recurrencia !== 'ninguna' && (!fechaBase || !recurrenciaHasta)) {
    toast('Para repetir, indica fecha (inicio o término) y hasta cuándo', 'err'); return;
  }
  const base = {
    titulo,
    descripcion: document.getElementById('fDescripcion').value.trim(),
    estado: document.getElementById('fEstado').value,
    prioridad: document.getElementById('fPrioridad').value,
    fecha_inicio: document.getElementById('fFechaInicio').value || null,
    fecha_limite: document.getElementById('fFecha').value || null,
    recurrencia,
    recurrencia_hasta: recurrenciaHasta,
    updated_at: new Date().toISOString(),
  };
  try {
    if (EDIT_ID) {
      const { error } = await SB.from('planer_items').update(base).eq('item_id', EDIT_ID);
      if (error) throw error;
      toast('✅ Pendiente actualizado', 'success');
    } else if (recurrencia === 'ninguna') {
      const payload = { ...base, item_id: nuevoId(), autor_id: USER.id, autor_nombre: miNombre(), origen: 'manual' };
      const { error } = await SB.from('planer_items').insert(payload);
      if (error) throw error;
      toast('✅ Pendiente creado', 'success');
    } else {
      const filas = generarSerieRecurrente(base, recurrencia, recurrenciaHasta);
      const { error } = await SB.from('planer_items').insert(filas);
      if (error) throw error;
      toast('✅ ' + filas.length + ' pendientes creados (repetición ' + recurrencia + ')', 'success');
    }
    cerrarForm();
    await cargarItems();
  } catch (e) { toast('Error: ' + e.message, 'err'); }
}

function generarSerieRecurrente(base, recurrencia, hasta) {
  const serieId = 'ser_' + Date.now().toString(36);
  const paso = recurrencia === 'semanal' ? (f => sumarDias(f, 7)) : sumarMes;
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

function miNombre() {
  try { return (USER.user_metadata && (USER.user_metadata.full_name || USER.user_metadata.name)) || (USER.email || '').split('@')[0]; }
  catch (e) { return ''; }
}

// ── DICTADO POR VOZ ──────────────────────────────────────────────────────────
// Web Speech API nativa del navegador (sin librería, sin servicio externo).
// Chrome/Edge (Android y desktop) la soportan bien. Safari/iOS no expone
// reconocimiento de voz por JS — ahí el botón se oculta solo (feature
// detection) y el teclado de iPhone ya trae su propio micrófono de dictado,
// que funciona igual sobre estos mismos campos de texto sin necesitar nada más.
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
function dictar(campoId, btnId) {
  if (!SpeechRec) { toast('El dictado por voz no está disponible en este navegador. En iPhone usa el micrófono del teclado.', 'err'); return; }
  const btn = document.getElementById(btnId);
  const campo = document.getElementById(campoId);
  const rec = new SpeechRec();
  rec.lang = 'es-CL';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  btn.classList.add('mic-on'); btn.textContent = '🔴';
  rec.onresult = (ev) => {
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
    document.querySelectorAll('.mic-btn').forEach(b => b.style.display = 'none');
  });
})();

// ── EXPORTAR A CALENDARIO (.ics) ─────────────────────────────────────────────
// Formato estándar RFC 5545, lo abren iPhone (Calendario), Android (Google
// Calendar) y Outlook por igual — sin depender de ninguno de los tres.
function icsEscape(s) { return String(s || '').replace(/[\\,;]/g, m => '\\' + m).replace(/\n/g, '\\n'); }
function icsFecha(fechaISO) { return fechaISO.replace(/-/g, ''); }
function icsBloque(item) {
  const dt = item.fecha_limite || item.fecha_inicio;
  if (!dt) return '';
  const ini = item.fecha_inicio || dt;
  const uid = item.item_id + '@sistema-am';
  return [
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    'DTSTART;VALUE=DATE:' + icsFecha(ini),
    'DTEND;VALUE=DATE:' + icsFecha(sumarDias(dt, 1)),
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
  if (!i.fecha_limite && !i.fecha_inicio) { toast('Este pendiente no tiene fecha', 'err'); return; }
  descargarArchivo('pendiente-' + id + '.ics', icsArchivo([icsBloque(i)]));
  toast('⬇️ Archivo descargado. Ábrelo para agregarlo a tu calendario.', 'success');
}
function descargarTodosICS() {
  const data = filtrados().filter(i => i.fecha_limite || i.fecha_inicio);
  if (!data.length) { toast('No hay pendientes con fecha para descargar', 'err'); return; }
  descargarArchivo('planer-pendientes.ics', icsArchivo(data.map(icsBloque)));
  toast('⬇️ ' + data.length + ' pendientes descargados. Ábrelos para agregarlos a tu calendario (iPhone, Android u Outlook).', 'success');
}
