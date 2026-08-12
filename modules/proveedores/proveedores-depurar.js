// ═══════════════════════════════════════════════════════════════════════════
// proveedores-depurar.js — Depurar la base desde el Excel de revisión
// Sistema AM · Antofagasta Minerals
//
// POR QUÉ EXISTE ESTO
// El importador normal ("Subir Excel") NO sirve para depurar, por dos razones:
//
//   1. Lee las columnas POR POSICIÓN (row[0], row[5]…) según el orden de la
//      plantilla. El Excel de "Bajar base" tiene otro orden y otras columnas,
//      así que se leería todo corrido.
//   2. Hace un merge que solo RELLENA campos vacíos: nunca pisa un valor que
//      ya existe. Corregir un dato mal escrito era imposible.
//
//   Y lo más grave: identifica al proveedor por su RUT. Si corriges un RUT
//   mal escrito, deja de calzar con el de la base y en vez de arreglarlo
//   CREA UN DUPLICADO.
//
// Esta ventana hace lo contrario:
//   · empareja por la columna «ID (no editar)», no por el RUT, así corregir
//     un RUT funciona;
//   · SÍ sobreescribe, pero muestra antes cada cambio uno por uno y solo
//     aplica los aprobados;
//   · lee las columnas por su NOMBRE, así da igual el orden.
//
// Se carga DESPUÉS de proveedores.js: usa PROVEEDORES, DB, saveDB, showToast,
// gSyncPush y registrarLog, que son globales. Nunca type="module" (CLAUDE.md §6).
// ═══════════════════════════════════════════════════════════════════════════

let DEP_CAMBIOS = [];     // diferencias detectadas entre el Excel y la base
let DEP_FUSIONES = [];    // duplicados marcados para fusionar

// Columna del Excel → campo del proveedor. Solo estos se pueden depurar:
// lo demás del libro es informativo o calculado.
const DEP_MAPA = {
  'RUT empresa': 'rut_empresa',
  'Razón social': 'razon_social',
  'Nombre fantasía': 'nombre_fantasia',
  'Localidad': 'localidad',
  'Dirección': 'direccion',
  'Correo empresa': 'correo',
  'Teléfono empresa': 'fono',
  'Actividad principal': 'actividad_principal',
  'Categoría SII': 'categoria_sii',
  'Facturación': 'facturar',
  'Agrupación gremial': 'agrupacion',
  'Servicios con AM': 'servicio_am',
  'Rango de trabajos': 'rango_trabajos',
  'Descripción': 'descripcion',
  'Notas': 'notas_ficha',
  'Estado': 'estado',
};
const DEP_SI = v => /^(s[ií]|si|true|1|x)$/i.test(String(v || '').trim());

function abrirDepurar() {
  DEP_CAMBIOS = []; DEP_FUSIONES = [];
  document.getElementById('depPaso1').style.display = '';
  document.getElementById('depPaso2').style.display = 'none';
  document.getElementById('depArchivo').value = '';
  document.getElementById('depResumen').innerHTML = '';
  document.getElementById('depModal').style.display = 'flex';
}
function cerrarDepurar() { document.getElementById('depModal').style.display = 'none'; }

// ── PASO 1: leer el Excel corregido ─────────────────────────────────────────
function depLeerArchivo(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const lector = new FileReader();
  lector.onload = e => {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      // La hoja "Proveedores" es la que trae todo; si el usuario mandó solo la
      // hoja "Revisar", también sirve — ambas llevan la columna ID.
      const hoja = wb.SheetNames.includes('Proveedores') ? 'Proveedores'
                 : wb.SheetNames.includes('Revisar') ? 'Revisar'
                 : wb.SheetNames[0];
      const filas = XLSX.utils.sheet_to_json(wb.Sheets[hoja], { defval: '' });
      depComparar(filas, hoja);
    } catch (err) {
      showToast('No se pudo leer el archivo: ' + err.message, 'err');
    }
  };
  lector.readAsArrayBuffer(file);
}

// ── PASO 2: comparar contra la base ─────────────────────────────────────────
function depComparar(filas, hoja) {
  if (!filas.length) { showToast('El archivo no tiene filas', 'err'); return; }
  if (!('ID (no editar)' in filas[0])) {
    showToast('Ese Excel no tiene la columna «ID (no editar)». Usa el que baja el botón «Bajar base».', 'err');
    return;
  }

  DEP_CAMBIOS = [];
  const sinId = [];
  filas.forEach(fila => {
    const id = String(fila['ID (no editar)'] || '').trim();
    if (!id) return;
    const p = PROVEEDORES.find(x => x._id === id);
    if (!p) { sinId.push(id); return; }

    Object.keys(DEP_MAPA).forEach(col => {
      if (!(col in fila)) return;
      const campo = DEP_MAPA[col];
      const nuevo = String(fila[col] ?? '').trim();
      const actual = String(p[campo] ?? '').trim();
      if (nuevo === actual) return;
      // Una celda vacía NO borra un dato: para vaciar hay que escribir "-"
      if (!nuevo) return;
      DEP_CAMBIOS.push({
        id, nombre: p.nombre_fantasia || p.razon_social || id,
        col, campo, actual, nuevo: nuevo === '-' ? '' : nuevo,
        ok: true,   // aprobado por defecto; se puede desmarcar
      });
    });

    // Programa MGI (columna con Sí/No)
    if ('Programa MGI' in fila) {
      const v = String(fila['Programa MGI'] || '').trim();
      if (v && !/sin definir/i.test(v)) {
        const nuevo = DEP_SI(v);
        if (p.programa_mgi !== nuevo) {
          DEP_CAMBIOS.push({ id, nombre: p.nombre_fantasia || p.razon_social || id,
            col: 'Programa MGI', campo: 'programa_mgi',
            actual: p.programa_mgi === true ? 'Sí' : p.programa_mgi === false ? 'No' : '(sin definir)',
            nuevo: nuevo ? 'Sí' : 'No', bool: true, ok: true });
        }
      }
    }
    // Experiencia en faenas
    [['Exp. CEN', 'pub_centinela'], ['Exp. ANT', 'pub_antucoya'], ['Exp. CMZ', 'pub_zaldivar']]
      .forEach(([col, campo]) => {
        if (!(col in fila)) return;
        const nuevo = DEP_SI(fila[col]);
        if (!!p[campo] !== nuevo) {
          DEP_CAMBIOS.push({ id, nombre: p.nombre_fantasia || p.razon_social || id,
            col, campo, actual: p[campo] ? 'Sí' : 'No', nuevo: nuevo ? 'Sí' : 'No', bool: true, ok: true });
        }
      });
  });

  document.getElementById('depPaso1').style.display = 'none';
  document.getElementById('depPaso2').style.display = '';
  depRender(sinId, hoja, filas.length);
}

function depRender(sinId, hoja, nFilas) {
  const cont = document.getElementById('depResumen');
  const nOk = DEP_CAMBIOS.filter(c => c.ok).length;

  let html = `<div class="dep-info">
    Hoja leída: <b>${esc(hoja)}</b> · ${nFilas} fila(s) ·
    <b>${DEP_CAMBIOS.length}</b> diferencia(s) encontrada(s)
    ${sinId.length ? `<br><span class="dep-warn">⚠ ${sinId.length} fila(s) con un ID que ya no existe en la base — se ignoran.</span>` : ''}
  </div>`;

  if (!DEP_CAMBIOS.length) {
    html += '<div class="dep-vacio">No hay diferencias: la base ya coincide con el archivo.</div>';
    cont.innerHTML = html;
    document.getElementById('depBtnAplicar').style.display = 'none';
    return;
  }

  // agrupado por proveedor, para revisar en contexto
  const porProv = {};
  DEP_CAMBIOS.forEach((c, i) => { (porProv[c.id] = porProv[c.id] || []).push({ ...c, i }); });

  html += `<div class="dep-acciones">
    <button class="mini-btn" onclick="depTodos(true)">Aprobar todo</button>
    <button class="mini-btn" onclick="depTodos(false)">Rechazar todo</button>
    <span class="dep-cuenta"><b id="depCuenta">${nOk}</b> de ${DEP_CAMBIOS.length} se aplicarán</span>
  </div>`;

  html += Object.keys(porProv).map(id => {
    const g = porProv[id];
    return `<div class="dep-prov">
      <div class="dep-prov-h">${esc(g[0].nombre)} <span class="dep-id">${esc(id)}</span></div>
      ${g.map(c => `<label class="dep-fila ${c.campo === 'rut_empresa' ? 'dep-rut' : ''}">
        <input type="checkbox" ${c.ok ? 'checked' : ''} onchange="depToggle(${c.i},this.checked)">
        <span class="dep-campo">${esc(c.col)}</span>
        <span class="dep-antes">${c.actual ? esc(c.actual) : '(vacío)'}</span>
        <span class="dep-flecha">→</span>
        <span class="dep-despues">${c.nuevo ? esc(c.nuevo) : '(vaciar)'}</span>
        ${c.campo === 'rut_empresa' ? `<span class="dep-nota">${rutValido(c.nuevo) ? '✓ RUT válido' : '⚠ el RUT nuevo tampoco valida'}</span>` : ''}
      </label>`).join('')}
    </div>`;
  }).join('');

  cont.innerHTML = html;
  document.getElementById('depBtnAplicar').style.display = '';
}

function depToggle(i, v) {
  DEP_CAMBIOS[i].ok = v;
  document.getElementById('depCuenta').textContent = DEP_CAMBIOS.filter(c => c.ok).length;
}
function depTodos(v) {
  DEP_CAMBIOS.forEach(c => { c.ok = v; });
  document.querySelectorAll('#depResumen .dep-fila input').forEach(ch => { ch.checked = v; });
  document.getElementById('depCuenta').textContent = DEP_CAMBIOS.filter(c => c.ok).length;
}

// ── PASO 3: aplicar ─────────────────────────────────────────────────────────
async function depAplicar() {
  const aplicar = DEP_CAMBIOS.filter(c => c.ok);
  if (!aplicar.length) { showToast('No hay cambios marcados', 'err'); return; }
  const rutsCambian = aplicar.filter(c => c.campo === 'rut_empresa').length;
  if (!confirm(`Se aplicarán ${aplicar.length} cambio(s) sobre ${new Set(aplicar.map(c => c.id)).size} proveedor(es).`
    + (rutsCambian ? `\n\nIncluye ${rutsCambian} cambio(s) de RUT.` : '')
    + '\n\n¿Continuar?')) return;

  const tocados = new Set();
  aplicar.forEach(c => {
    const p = PROVEEDORES.find(x => x._id === c.id); if (!p) return;
    p[c.campo] = c.bool ? (c.nuevo === 'Sí') : c.nuevo;
    if (c.campo === 'programa_mgi' && c.nuevo === 'Sí' && !p.programa_mgi_rubro) p.programa_mgi_rubro = 'hoteleria';
    p._edited = true;
    tocados.add(c.id);
  });

  try {
    await saveDB();
    for (const id of tocados) {
      await registrarLog('proveedor', id, 'depurar', 'Corregido desde el Excel de revisión');
      if (SUPA.session) await gSyncPush(id);
    }
    showToast(`✅ ${aplicar.length} cambio(s) aplicados en ${tocados.size} proveedor(es)`, 'success');
    cerrarDepurar();
    applyFilters(); updateHeroStats();
  } catch (e) {
    showToast('Error al guardar: ' + e.message, 'err');
  }
}

// ── FUSIONAR DUPLICADOS ─────────────────────────────────────────────────────
// Dos fichas del mismo lugar: una se queda con todo (contactos, habitaciones,
// visitas, programas) y la otra se marca como eliminada. No se borra nada de
// verdad — el borrado del sistema siempre es lógico.
function depFusionar(idQueda, idSeVa) {
  const a = PROVEEDORES.find(p => p._id === idQueda);
  const b = PROVEEDORES.find(p => p._id === idSeVa);
  if (!a || !b) { showToast('No se encontró alguno de los dos', 'err'); return; }
  if (!confirm(`Fusionar:\n\n  SE QUEDA: ${a.nombre_fantasia || a.razon_social}\n  SE VA:    ${b.nombre_fantasia || b.razon_social}\n\n`
    + 'Los contactos, habitaciones y programas del segundo pasan al primero, y el segundo queda marcado como eliminado.\n\n¿Continuar?')) return;

  // campos vacíos del que queda se completan con los del otro
  ['rut_empresa', 'razon_social', 'nombre_fantasia', 'direccion', 'correo', 'fono',
    'actividad_principal', 'descripcion', 'categoria_sii', 'facturar', 'agrupacion',
    'servicio_am', 'rango_trabajos', 'notas_ficha'].forEach(k => {
      if (!String(a[k] || '').trim() && String(b[k] || '').trim()) a[k] = b[k];
    });
  ['pub_centinela', 'pub_antucoya', 'pub_zaldivar'].forEach(k => { a[k] = a[k] || b[k]; });
  if (a.programa_mgi !== true && b.programa_mgi === true) {
    a.programa_mgi = true; a.programa_mgi_rubro = a.programa_mgi_rubro || b.programa_mgi_rubro;
  }
  a.giros = [...new Set([...(a.giros || []), ...(b.giros || [])])];
  a.rubrosNorm = [...new Set([...(a.rubrosNorm || []), ...(b.rubrosNorm || [])])];

  // contactos que no estén ya
  const ca = DB.contactos[idQueda] || [], cb = DB.contactos[idSeVa] || [];
  cb.forEach(c => {
    if (!ca.find(e => (c.rut && e.rut === c.rut) || (c.nombre && e.nombre === c.nombre))) ca.push(c);
  });
  DB.contactos[idQueda] = ca; delete DB.contactos[idSeVa];

  // habitaciones: se queda la mayor de cada tipo
  const ha = DB.hoteles[idQueda], hb = DB.hoteles[idSeVa];
  if (hb) {
    DB.hoteles[idQueda] = ha || { simples: 0, dobles: 0, contratos: [], servicios: [] };
    const h = DB.hoteles[idQueda];
    ['simples', 'dobles', 'simples_banio', 'dobles_banio'].forEach(k => {
      h[k] = Math.max(parseInt(h[k]) || 0, parseInt(hb[k]) || 0);
    });
    h.contratos = [...(h.contratos || []), ...(hb.contratos || [])];
    h.servicios = [...new Set([...(h.servicios || []), ...(hb.servicios || [])])];
    delete DB.hoteles[idSeVa];
  }
  // programas y visitas
  (DB.programas[idSeVa] || []).forEach(pg => {
    DB.programas[idQueda] = DB.programas[idQueda] || [];
    if (!DB.programas[idQueda].find(e => e.nombre === pg.nombre)) DB.programas[idQueda].push(pg);
  });
  delete DB.programas[idSeVa];
  if (DB.visitas[idSeVa]) {
    DB.visitas[idQueda] = [...(DB.visitas[idQueda] || []), ...DB.visitas[idSeVa]];
    delete DB.visitas[idSeVa];
  }

  b.estado = 'Eliminado';
  a._edited = true; b._edited = true;

  saveDB().then(async () => {
    await registrarLog('proveedor', idQueda, 'fusionar', 'Absorbió a ' + idSeVa);
    await registrarLog('proveedor', idSeVa, 'eliminar', 'Fusionado en ' + idQueda);
    if (SUPA.session) { await gSyncPush(idQueda); await gSyncPush(idSeVa); }
    showToast('✅ Fusionados', 'success');
    applyFilters(); updateHeroStats();
    if (document.getElementById('depModal').style.display === 'flex') depListarDuplicados();
  });
}

// ── FICHAS QUE COMPARTEN RUT ────────────────────────────────────────────────
// Compartir RUT NO es un error: el RUT identifica a la EMPRESA, no al local.
// Una misma empresa puede tener varias sucursales (Hostal Minero 1 al 5, Casa
// Besalco 1 al 4, los Tronar), y hasta dos negocios de rubro distinto en la
// misma dirección (una lavandería y un hospedaje).
//
// Por eso esta pantalla NO habla de «duplicados»: lista los locales de cada
// empresa y solo destaca los que de verdad parecen la misma ficha repetida.
function depListarDuplicados() {
  const porRut = {};
  PROVEEDORES.filter(p => p.estado !== 'Eliminado').forEach(p => {
    const r = _valRut(p.rut_empresa); if (r) (porRut[r] = porRut[r] || []).push(p);
  });
  const grupos = Object.keys(porRut).filter(r => porRut[r].length > 1)
    .sort((a, b) => porRut[b].length - porRut[a].length);

  const cont = document.getElementById('depResumen');
  document.getElementById('depPaso1').style.display = 'none';
  document.getElementById('depPaso2').style.display = '';
  document.getElementById('depBtnAplicar').style.display = 'none';

  if (!grupos.length) { cont.innerHTML = '<div class="dep-vacio">No hay empresas con más de un local.</div>'; return; }

  // ¿Alguna pareja del grupo parece la MISMA ficha repetida?
  const sospechas = {};
  grupos.forEach(r => {
    const g = porRut[r]; sospechas[r] = [];
    for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) {
      const razon = _mismoLocal(g[i], g[j]);
      if (razon) sospechas[r].push({ a: g[i], b: g[j], razon });
    }
  });
  const conSospecha = grupos.filter(r => sospechas[r].length && !porRut[r][0].multi_verificado);
  const soloSucursales = grupos.filter(r => !conSospecha.includes(r));

  cont.innerHTML = `<div class="dep-info">
      <b>${grupos.length}</b> empresa(s) con más de un local · <b>${conSospecha.length}</b> con algo que revisar.
      <span class="dep-ok">Compartir RUT es normal: el RUT es de la empresa, no del local.
      Una empresa puede tener varias sucursales, y hasta dos negocios distintos en la misma dirección.</span>
    </div>` +

    (conSospecha.length ? `<div class="dep-sec-t">⚠ Parecen la misma ficha repetida</div>` +
      conSospecha.map(r => depGrupoHTML(r, porRut[r], sospechas[r])).join('') : '') +

    (soloSucursales.length ? `<div class="dep-sec-t">✓ Locales distintos de una misma empresa</div>` +
      soloSucursales.map(r => depGrupoHTML(r, porRut[r], [])).join('') : '');
}

function depGrupoHTML(rut, g, sospechas) {
  const verif = g.some(p => p.multi_verificado);
  return `<div class="dep-prov ${sospechas.length ? 'dep-alerta' : ''}">
    <div class="dep-prov-h">
      ${esc(g[0].razon_social || g[0].nombre_fantasia || 'RUT ' + rut)}
      <span class="dep-id">RUT ${esc(rut)} · ${g.length} locales${verif ? ' · ✓ revisado' : ''}</span>
      ${!verif ? `<button class="mini-btn" style="margin-left:auto" onclick="depMarcarSucursales('${rut}')"
          title="Confirmar que son locales distintos y dejar de verlos como pendientes">✓ Son locales distintos</button>` : ''}
    </div>
    ${sospechas.map(sp => `<div class="dep-sospecha">
      ⚠ <b>${esc(sp.a.nombre_fantasia || sp.a.razon_social)}</b> y
        <b>${esc(sp.b.nombre_fantasia || sp.b.razon_social)}</b>: ${esc(sp.razon)}
      <div class="dep-dup-btns">
        <button class="mini-btn" onclick="depFusionar('${sp.a._id}','${sp.b._id}')">Dejar «${esc((sp.a.nombre_fantasia || sp.a.razon_social || '').slice(0, 20))}» y fusionar</button>
        <button class="mini-btn" onclick="depFusionar('${sp.b._id}','${sp.a._id}')">Dejar «${esc((sp.b.nombre_fantasia || sp.b.razon_social || '').slice(0, 20))}» y fusionar</button>
      </div>
    </div>`).join('')}
    ${g.map(p => {
      const h = DB.hoteles[p._id] || {};
      const habs = (parseInt(h.simples) || 0) + (parseInt(h.dobles) || 0);
      const nVis = (DB.visitas[p._id] || []).length;
      return `<div class="dep-dup">
        <div>
          <div class="dep-dup-n">${esc(p.nombre_fantasia || p.razon_social || p._id)}</div>
          <div class="dep-dup-d">📍 ${esc(p.direccion || 'sin dirección')}
            · ${esc((p.rubrosNorm || []).join(', ') || 'sin rubro')}
            ${habs ? ' · ' + habs + ' hab' : ''}${nVis ? ' · ' + nVis + ' visita(s)' : ''}</div>
        </div>
        <div class="dep-dup-btns">
          <button class="mini-btn" onclick="depPonerSucursal('${p._id}')" title="Ponerle nombre a este local">🏷 Sucursal</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// Confirma que las fichas de ese RUT son locales distintos: dejan de aparecer
// como pendientes de revisar, tanto acá como en el Excel.
async function depMarcarSucursales(rut) {
  const g = PROVEEDORES.filter(p => _valRut(p.rut_empresa) === rut && p.estado !== 'Eliminado');
  if (!g.length) return;
  if (!confirm(`Confirmar que estos ${g.length} locales son establecimientos distintos de la misma empresa.\n\n`
    + g.map(p => '  · ' + (p.nombre_fantasia || p.razon_social) + ' — ' + (p.direccion || 'sin dirección')).join('\n')
    + '\n\nDejarán de aparecer como pendientes de revisar.')) return;
  g.forEach(p => { p.multi_verificado = true; p._edited = true; });
  await saveDB();
  for (const p of g) if (SUPA.session) await gSyncPush(p._id);
  showToast('✓ Marcados como locales distintos', 'success');
  depListarDuplicados();
}

// Nombre del local, para no confundir fichas de la misma empresa.
async function depPonerSucursal(id) {
  const p = PROVEEDORES.find(x => x._id === id); if (!p) return;
  const v = prompt('Nombre de este local (ej: «Colón #32», «Sucursal 2»):', p.sucursal || p.direccion || '');
  if (v === null) return;
  p.sucursal = v.trim(); p._edited = true;
  await saveDB();
  if (SUPA.session) await gSyncPush(id);
  showToast('✓ Guardado', 'success');
  depListarDuplicados();
}
