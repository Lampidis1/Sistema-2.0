// ═══════════════════════════════════════════════════════════════════════════
// hoteles-sg.js — Disponibilidad pública de hospedajes de Sierra Gorda
// Sistema AM · Antofagasta Minerals
//
// PÁGINA PÚBLICA, SIN LOGIN. Por eso NO lee la tabla `proveedores` (trae RUT,
// correos y teléfonos de toda la región): lee la vista `hoteles_sg_publico`,
// que expone solo lo necesario para buscar alojamiento y únicamente de los
// hospedajes del programa MGI en Sierra Gorda.
//
// El RUT no viaja al navegador. Para agrupar los hospedajes de un mismo dueño
// se usa `grupo`, un hash del RUT: sirve para agrupar, no para reconstruirlo.
//
// CAMAS: una habitación doble puede ocuparse como simple, así que el máximo
// de camas es simples + dobles×2. Eso lo calcula la vista, no el cliente.
// ═══════════════════════════════════════════════════════════════════════════

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let DATOS = [];
let VISTA = 'disponibles';
let MODO = 'fichas';
let MAPA = null;
let MARCADORES = [];

const SIERRA_GORDA = [-22.8917, -69.3196];   // centro del pueblo

document.addEventListener('DOMContentLoaded', cargar);

async function cargar() {
  const cont = document.getElementById('listaDisp');
  try {
    const SB = window.supabase.createClient(window.SUPA_CFG.url, window.SUPA_CFG.key);
    const { data, error } = await SB.from('hoteles_sg_publico').select('*');
    if (error) throw error;
    DATOS = (data || []).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
    pintarKpis();
    render();
  } catch (e) {
    cont.innerHTML = '<div class="cargando">No se pudo cargar la disponibilidad: ' + esc(e.message) + '</div>';
  }
}

// Con habitaciones LIBRES ahora mismo: la vista ya descuenta las que estan
// comprometidas en contratos. Un hospedaje lleno (o sin capacidad cargada) no
// aparece aca — si en "Todos por empresa".
const disponibles = () => DATOS.filter(h => h.hab_disponibles > 0);

// Orden de la lista: se hace clic en el encabezado de la columna.
let ORDEN = { col: 'nombre', asc: true };
function ordenarPor(col) {
  if (ORDEN.col === col) ORDEN.asc = !ORDEN.asc;
  // los textos parten A→Z; los numeros, de mayor a menor (lo util primero)
  else ORDEN = { col: col, asc: (col === 'nombre' || col === 'direccion') };
  render();
}
function aplicarOrden(arr) {
  const c = ORDEN.col, s = ORDEN.asc ? 1 : -1;
  return arr.slice().sort((a, b) => {
    const x = a[c], y = b[c];
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * s;
    return String(x || '').localeCompare(String(y || ''), 'es') * s;
  });
}
const flecha = c => ORDEN.col === c ? (ORDEN.asc ? ' ▲' : ' ▼') : '';

function pintarKpis() {
  const d = disponibles();
  const habs = d.reduce((s, h) => s + h.hab_disponibles, 0);
  const camas = d.reduce((s, h) => s + h.camas_max, 0);
  document.getElementById('kpis').innerHTML = `
    <div class="kpi"><div class="kpi-n">${d.length}</div><div class="kpi-l">Hospedajes con disponibilidad</div></div>
    <div class="kpi"><div class="kpi-n">${habs}</div><div class="kpi-l">Habitaciones libres</div></div>
    <div class="kpi"><div class="kpi-n">${camas}</div><div class="kpi-l">Camas disponibles</div></div>
    <div class="kpi"><div class="kpi-n">${DATOS.length}</div><div class="kpi-l">En el programa MGI</div></div>`;
}

function setVista(v) {
  VISTA = v;
  ['disponibles', 'mapa', 'todos'].forEach(k => {
    document.getElementById('tab_' + (k === 'disponibles' ? 'disp' : k === 'mapa' ? 'mapa' : 'todos'))
      .classList.toggle('active', k === v);
  });
  document.getElementById('vDisponibles').style.display = v === 'disponibles' ? '' : 'none';
  document.getElementById('vMapa').style.display = v === 'mapa' ? '' : 'none';
  document.getElementById('vTodos').style.display = v === 'todos' ? '' : 'none';
  render();
}
function setModo(m) {
  MODO = m;
  document.getElementById('mv_fichas').classList.toggle('active', m === 'fichas');
  document.getElementById('mv_lista').classList.toggle('active', m === 'lista');
  render();
}

function render() {
  if (VISTA === 'disponibles') renderDisponibles();
  else if (VISTA === 'mapa') renderMapa();
  else renderTodos();
}

// ── 1 · DISPONIBLES ─────────────────────────────────────────────────────────
function renderDisponibles() {
  const q = (document.getElementById('q').value || '').toLowerCase().trim();
  let d = disponibles();
  if (q) d = d.filter(h => ((h.nombre || '') + ' ' + (h.direccion || '')).toLowerCase().includes(q));
  const cont = document.getElementById('listaDisp');
  if (!d.length) { cont.innerHTML = '<div class="cargando">Sin hospedajes para esta búsqueda.</div>'; return; }

  d = aplicarOrden(d);

  if (MODO === 'lista') {
    // Encabezados ordenables: un clic ordena, otro invierte.
    cont.innerHTML = `<div class="tabla-wrap"><table class="tabla">
      <thead><tr>
        <th class="orden" onclick="ordenarPor('nombre')">Hospedaje${flecha('nombre')}</th>
        <th class="orden" onclick="ordenarPor('direccion')">Dirección${flecha('direccion')}</th>
        <th>Contacto</th>
        <th class="orden num" onclick="ordenarPor('hab_disponibles')">Hab. libres${flecha('hab_disponibles')}</th>
        <th class="orden num" onclick="ordenarPor('camas_max')">Camas${flecha('camas_max')}</th>
        <th class="orden num" onclick="ordenarPor('hab_total')">Instaladas${flecha('hab_total')}</th>
      </tr></thead>
      <tbody>${d.map(h => `<tr onclick="verFicha('${h.id}')">
        <td><b>${esc(h.nombre)}</b></td>
        <td>${esc(h.direccion || '—')}</td>
        <td>${contactoHTML(h)}</td>
        <td class="num"><b>${h.hab_disponibles}</b></td>
        <td class="num"><b>${h.camas_max}</b></td>
        <td class="num sec">${h.hab_total}</td>
      </tr>`).join('')}</tbody></table></div>`;
    return;
  }
  cont.innerHTML = '<div class="fichas">' + d.map(h => `
    <article class="ficha" onclick="verFicha('${h.id}')">
      <div class="ficha-h">
        <div class="ficha-n">${esc(h.nombre)}</div>
        <div class="ficha-d">📍 ${esc(h.direccion || 'Dirección no registrada')}</div>
      </div>
      <div class="ficha-b">
        <div class="cap">
          <div class="cap-i"><div class="cap-n">${h.hab_disponibles}</div><div class="cap-l">Hab. libres</div></div>
          <div class="cap-i"><div class="cap-n">${h.camas_max}</div><div class="cap-l">Camas</div></div>
        </div>
        <div class="detalle">${h.hab_simples} simple${h.hab_simples === 1 ? '' : 's'} · ${h.hab_dobles} doble${h.hab_dobles === 1 ? '' : 's'}${h.hab_ocupadas ? ` · <span class="ocup">${h.hab_ocupadas} ocupada${h.hab_ocupadas === 1 ? '' : 's'}</span>` : ''}</div>
        ${contactoHTML(h, true)}
      </div>
      <button class="ficha-btn">Ver ficha →</button>
    </article>`).join('') + '</div>';
}

function contactoHTML(h, bloque) {
  const tel = (h.fono || '').replace(/[^0-9+]/g, '');
  const partes = [];
  if (tel) partes.push(`<a href="tel:${tel}" onclick="event.stopPropagation()" class="ct tel">📞 ${esc(h.fono)}</a>`);
  if (h.correo) partes.push(`<a href="mailto:${esc(h.correo)}" onclick="event.stopPropagation()" class="ct mail">✉ ${esc(h.correo)}</a>`);
  if (!partes.length) return bloque ? '<div class="ct-vacio">Sin datos de contacto</div>' : '—';
  return `<div class="ct-box">${partes.join('')}</div>`;
}

// ── 2 · MAPA ────────────────────────────────────────────────────────────────
function renderMapa() {
  const conUbic = disponibles().filter(h => h.lat && h.lng);
  const sinUbic = disponibles().filter(h => !h.lat || !h.lng);

  if (!MAPA) {
    MAPA = L.map('mapa').setView(SIERRA_GORDA, 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© colaboradores de OpenStreetMap',
    }).addTo(MAPA);
  }
  MARCADORES.forEach(m => MAPA.removeLayer(m));
  MARCADORES = [];

  // Varios hospedajes comparten esquina: se separan un poco para que no se
  // tapen entre ellos. El desplazamiento es de metros, no cambia la calle.
  const usados = {};
  conUbic.forEach(h => {
    const k = h.lat.toFixed(5) + ',' + h.lng.toFixed(5);
    const n = (usados[k] = (usados[k] || 0) + 1) - 1;
    const ang = n * 2.4, rad = n === 0 ? 0 : 0.00012 * Math.sqrt(n);
    const lat = h.lat + rad * Math.cos(ang), lng = h.lng + rad * Math.sin(ang);
    const m = L.marker([lat, lng]).addTo(MAPA);
    m.bindPopup(`<b>${esc(h.nombre)}</b><br>${esc(h.direccion || '')}<br>
      <span style="color:#006973"><b>${h.hab_total}</b> hab · <b>${h.camas_max}</b> camas máx.</span><br>
      ${h.fono ? '📞 ' + esc(h.fono) : ''}`);
    MARCADORES.push(m);
  });
  setTimeout(() => MAPA.invalidateSize(), 60);   // el mapa nace oculto en su pestaña

  document.getElementById('sinUbicacion').innerHTML = sinUbic.length ? `
    <div class="aviso">
      <b>${sinUbic.length} hospedaje${sinUbic.length === 1 ? '' : 's'} sin ubicación en el mapa.</b>
      Su calle todavía no está registrada en el mapa base; sí aparecen en las otras pestañas.
      <div class="aviso-lista">${sinUbic.map(h => `<span onclick="verFicha('${h.id}')">${esc(h.nombre)}</span>`).join('')}</div>
    </div>` : '';
}

// ── 3 · TODOS, AGRUPADOS POR EMPRESA ────────────────────────────────────────
function renderTodos() {
  const grupos = {};
  DATOS.forEach(h => { (grupos[h.grupo || 'sin'] = grupos[h.grupo || 'sin'] || []).push(h); });
  // Se ordena por el nombre del primer hospedaje de cada grupo (alfabético).
  const orden = Object.values(grupos).map(g => g.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')))
    .sort((a, b) => a[0].nombre.localeCompare(b[0].nombre, 'es'));

  document.getElementById('listaTodos').innerHTML = orden.map(g => {
    const habs = g.reduce((s, h) => s + h.hab_total, 0);
    const camas = g.reduce((s, h) => s + h.camas_max, 0);
    return `<div class="grupo">
      <div class="grupo-h">
        <span class="grupo-n">${g.length === 1 ? esc(g[0].nombre) : esc(g[0].nombre) + ' y ' + (g.length - 1) + ' más'}</span>
        <span class="grupo-m">${g.length} hospedaje${g.length === 1 ? '' : 's'} · ${habs} hab · ${camas} camas máx.</span>
      </div>
      ${g.map(h => `<div class="grupo-i" onclick="verFicha('${h.id}')">
        <div><div class="gi-n">${esc(h.nombre)}</div><div class="gi-d">${esc(h.direccion || 'Sin dirección registrada')}</div></div>
        <div class="gi-c">${h.hab_total ? `<b>${h.hab_total}</b> hab<br><span>${h.camas_max} camas</span>` : '<span class="gi-sd">sin capacidad registrada</span>'}</div>
      </div>`).join('')}
    </div>`;
  }).join('');
}

// ── FICHA ───────────────────────────────────────────────────────────────────
function verFicha(id) {
  const h = DATOS.find(x => x.id === id); if (!h) return;
  const hermanos = DATOS.filter(x => x.grupo === h.grupo && x.id !== h.id);
  document.getElementById('fichaBox').innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-loc">📍 Sierra Gorda</div>
        <div class="modal-title">${esc(h.nombre)}</div>
        <div class="modal-subtitle">${esc(h.direccion || 'Dirección no registrada')}</div>
      </div>
      <div class="modal-header-right"><button class="modal-close" onclick="cerrarFicha()">×</button></div>
    </div>
    <div class="modal-body">
      <div class="dcf-layout">
        <div class="dcf-left">
          <div class="dcf-sec-t">Disponibilidad ahora</div>
          <div class="dcf-item"><span class="dcf-ico">🛏</span><div><div class="dcf-l">Simples libres</div><div class="dcf-v">${h.hab_simples}</div></div></div>
          <div class="dcf-item"><span class="dcf-ico">🛏</span><div><div class="dcf-l">Dobles libres</div><div class="dcf-v">${h.hab_dobles}</div></div></div>
          <div class="dcf-item"><span class="dcf-ico">✅</span><div><div class="dcf-l">Habitaciones libres</div><div class="dcf-v"><b>${h.hab_disponibles}</b></div></div></div>
          <div class="dcf-item"><span class="dcf-ico">🧍</span><div><div class="dcf-l">Camas disponibles</div><div class="dcf-v"><b>${h.camas_max}</b><br><span style="font-size:.72rem;color:var(--text-muted)">una doble puede usarse como simple</span></div></div></div>
          <div class="dcf-sec-t" style="margin-top:18px">Capacidad instalada</div>
          <div class="dcf-item"><span class="dcf-ico">🏨</span><div><div class="dcf-l">Total del hospedaje</div><div class="dcf-v">${h.hab_total} habitaciones${h.hab_ocupadas ? ` · ${h.hab_ocupadas} con contrato` : ''}</div></div></div>
        </div>
        <div class="dcf-right">
          <div class="dcf-sec-t">Contacto</div>
          ${h.fono ? `<div class="dcf-item"><span class="dcf-ico">📞</span><div><div class="dcf-l">Teléfono</div><div class="dcf-v"><a href="tel:${esc((h.fono || '').replace(/[^0-9+]/g, ''))}">${esc(h.fono)}</a></div></div></div>` : ''}
          ${h.correo ? `<div class="dcf-item"><span class="dcf-ico">✉</span><div><div class="dcf-l">Correo</div><div class="dcf-v" style="word-break:break-all"><a href="mailto:${esc(h.correo)}">${esc(h.correo)}</a></div></div></div>` : ''}
          ${!h.fono && !h.correo ? '<div style="font-size:.85rem;color:var(--text-muted)">Sin datos de contacto registrados.</div>' : ''}
          ${hermanos.length ? `<div class="dcf-sec-t" style="margin-top:18px">Otros hospedajes de la misma empresa</div>
            ${hermanos.map(x => `<div class="dcf-giro" style="cursor:pointer" onclick="verFicha('${x.id}')">• ${esc(x.nombre)} ${x.hab_total ? `<span style="color:var(--text-muted)">(${x.hab_total} hab)</span>` : ''}</div>`).join('')}` : ''}
          ${h.lat && h.lng ? `<div class="dcf-sec-t" style="margin-top:18px">Ubicación</div>
            <button class="ficha-btn" style="width:auto;padding:8px 16px" onclick="cerrarFicha();setVista('mapa');setTimeout(()=>MAPA.setView([${h.lat},${h.lng}],18),150)">📍 Ver en el mapa</button>` : ''}
        </div>
      </div>
    </div>`;
  document.getElementById('fichaOv').classList.add('open');
}
function cerrarFicha() { document.getElementById('fichaOv').classList.remove('open'); }
