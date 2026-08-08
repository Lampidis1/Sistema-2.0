// ═══════════════════════════════════════════════════════════════════════════
// modules.config.js — REGISTRO CENTRAL DE MÓDULOS
// Sistema AM · Antofagasta Minerals
//
// Este archivo es la ÚNICA fuente de verdad sobre qué módulos existen.
// El Home (index.html) no sabe nada de módulos: solo lee esta lista y pinta
// los botones. Para agregar un módulo al menú, se agrega aquí. No se toca
// el Home.
//
// ───────────────────────────────────────────────────────────────────────────
// CAMPO `acceso` — LEER ANTES DE EDITAR
// ───────────────────────────────────────────────────────────────────────────
// `acceso` NO es un nombre libre: es el slug real que el usuario maestro
// guarda en el JWT del usuario (app_metadata.accesos) al aprobarlo con la
// función aprobar_usuario_v2(uid, rol, accesos[]).
//
// Ese mismo slug lo valida la base de datos en las políticas RLS a través de
// tiene_acceso('<slug>'). Si aquí se escribe un slug que no existe en la
// base, el módulo queda inaccesible aunque el botón aparezca.
//
// OJO: el slug NO siempre coincide con el nombre del módulo.
//   proveedores  → slug 'principal'   (histórico, NO es 'proveedores')
//
// El valor 'lector' que puede aparecer en accesos NO es un módulo: es un flag
// que marca al usuario como solo-lectura. Nunca debe registrarse acá.
//
// CAMPO `homeTier` — controla dónde y de qué tamaño aparece en el Home.
//   'principal' → arriba, en el par grande (hoy: Proveedores + Empleabilidad)
//   'medio'     → fila del medio, tamaño normal, EN EL ORDEN DEL ARRAY
//                 (hoy: MGI, Móvil, [reservado], Centinela, Antucoya, Zaldívar)
//   omitido     → ícono chico, al final de la página ("el resto") — hoy:
//                 Planer, Gestión de usuarios
// El orden dentro de cada nivel es el orden en que aparecen en este array.
//
// CAMPO `icono` — normalmente un emoji. Si el valor termina en `.png` (ruta
// a shared/assets/), el Home lo pinta como <img> en vez de texto — se usa
// para las 3 faenas, que muestran la marca "A" de Antofagasta Minerals en
// vez de un emoji.
// ═══════════════════════════════════════════════════════════════════════════

window.AM_MODULES = [
  {
    id: 'proveedores',
    nombre: 'Proveedores',
    descripcion: 'Directorio regional, hotelería, visitas, licitaciones, programas y estandarización.',
    icono: '🏭',
    ruta: 'modules/proveedores/',
    acceso: 'principal',          // ⚠ NO es 'proveedores'
    estado: 'activo',
    visibleEnHome: true,
    homeTier: 'principal',
    doc: 'docs/modulos/proveedores.md',
  },
  {
    id: 'empleabilidad',
    nombre: 'Empleabilidad',
    descripcion: 'Base de CV, ofertas laborales, matching, postulaciones y apresto laboral.',
    icono: '👥',
    ruta: 'modules/empleabilidad/',
    acceso: 'empleabilidad',
    // 'movil' habilita este módulo (documentado); 'principal' también lo
    // habilita en el código real (verificado en empleabilidad.js/movil.js
    // al investigar P-6) aunque no estaba anotado acá antes.
    accesoAlterno: ['movil', 'principal'],
    estado: 'activo',
    visibleEnHome: true,
    homeTier: 'principal',
    doc: 'docs/modulos/empleabilidad.md',
  },
  {
    id: 'mgi',
    nombre: 'MGI Habitabilidad',
    descripcion: 'Modelo de gestión integral de habitabilidad y estándares de alojamiento.',
    icono: '🏘️',
    ruta: 'modules/mgi/',
    acceso: 'mgi',
    estado: 'activo',
    visibleEnHome: true,
    homeTier: 'medio',
    doc: 'docs/modulos/mgi.md',
  },
  {
    id: 'movil',
    nombre: 'Oficina Móvil',
    descripcion: 'Vehículo de captura de datos en terreno: registro de CV y cuestionario de apresto.',
    icono: '🚐',
    ruta: 'modules/movil/',
    acceso: 'movil',
    accesoAlterno: 'empleabilidad',
    estado: 'activo',
    visibleEnHome: true,
    homeTier: 'medio',
    doc: 'docs/modulos/movil.md',
  },
  {
    // Reservado: próxima función a definir. Solo ocupa el espacio en el
    // grid de 3 columnas para que las faenas empiecen su propia fila.
    id: 'proximo-medio-1',
    nombre: '',
    descripcion: 'Nueva función en camino.',
    icono: '✨',
    ruta: '#',
    acceso: null,
    estado: 'proximamente',
    visibleEnHome: true,
    homeTier: 'medio',
  },
  {
    id: 'centinela',
    nombre: 'CEN',
    descripcion: 'Proveedores listos para Trabajar',
    icono: 'shared/assets/logo-amsa-mark.png',
    ruta: 'modules/centinela/',
    acceso: 'centinela',
    estado: 'activo',
    visibleEnHome: true,
    homeTier: 'medio',
    doc: 'docs/modulos/faenas.md',
  },
  {
    id: 'antucoya',
    nombre: 'ANT',
    descripcion: 'Proveedores listos para Trabajar',
    icono: 'shared/assets/logo-amsa-mark.png',
    ruta: 'modules/antucoya/',
    acceso: 'antucoya',
    estado: 'activo',
    visibleEnHome: true,
    homeTier: 'medio',
    doc: 'docs/modulos/faenas.md',
  },
  {
    id: 'zaldivar',
    nombre: 'CMZ',
    descripcion: 'Proveedores listos para Trabajar',
    icono: 'shared/assets/logo-amsa-mark.png',
    ruta: 'modules/zaldivar/',
    acceso: 'zaldivar',
    estado: 'activo',
    visibleEnHome: true,
    homeTier: 'medio',
    doc: 'docs/modulos/faenas.md',
  },
  {
    id: 'planer',
    nombre: 'Planer',
    descripcion: 'Pendientes y acciones por especialista de Proveedores, vista conjunta con filtro por autor.',
    icono: '📋',
    ruta: 'modules/planer/',
    acceso: 'planer',
    estado: 'activo',
    visibleEnHome: true,
    doc: 'docs/modulos/planer.md',
    // sin 'homeTier': va en el bloque chico de abajo ("el resto"), igual que admin
  },
  {
    id: 'admin',
    nombre: 'Gestión de usuarios',
    descripcion: 'Aprobar o rechazar solicitudes de acceso al sistema.',
    icono: '👤',
    ruta: 'modules/admin/',
    acceso: null,             // sin slug: solo entra rol === 'admin' (bypasea tiene_acceso())
    estado: 'activo',
    visibleEnHome: true,
    doc: 'docs/modulos/admin.md',
    // sin 'homeTier': va en el bloque chico de abajo ("el resto")
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PLANTILLA PARA UN MÓDULO NUEVO — copiar, descomentar y completar.
  // Recordar: el slug de `acceso` debe existir primero en la base de datos,
  // y el maestro debe asignárselo a alguien. Hasta entonces solo lo ve el
  // admin (que tiene acceso a todo por definición en tiene_acceso()).
  // ─────────────────────────────────────────────────────────────────────────
  // {
  //   id: 'mi-modulo',
  //   nombre: 'Mi Módulo',
  //   descripcion: 'Qué resuelve, en una línea.',
  //   icono: '📊',
  //   ruta: 'modules/mi-modulo/',
  //   acceso: 'mi_modulo',
  //   estado: 'proximamente',    // 'activo' | 'proximamente'
  //   visibleEnHome: true,
  //   doc: 'docs/modulos/mi-modulo.md',
  // },
];
