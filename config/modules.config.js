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
    doc: 'docs/modulos/proveedores.md',
  },
  {
    id: 'empleabilidad',
    nombre: 'Empleabilidad',
    descripcion: 'Base de CV, ofertas laborales, matching, postulaciones y apresto laboral.',
    icono: '👥',
    ruta: 'modules/empleabilidad/',
    acceso: 'empleabilidad',
    accesoAlterno: 'movil',       // tener 'movil' también habilita este módulo
    estado: 'activo',
    visibleEnHome: true,
    doc: 'docs/modulos/empleabilidad.md',
  },
  {
    id: 'movil',
    nombre: 'Oficina Móvil',
    descripcion: 'Captura de datos en terreno: registro de CV y cuestionario de apresto.',
    icono: '📱',
    ruta: 'modules/movil/',
    acceso: 'movil',
    accesoAlterno: 'empleabilidad',
    estado: 'activo',
    visibleEnHome: false,         // hoy se entra por URL directa, no desde el Home
    doc: 'docs/modulos/movil.md',
  },
  {
    id: 'mgi',
    nombre: 'MGI Habitabilidad',
    descripcion: 'Modelo de gestión integral de habitabilidad y estándares de alojamiento.',
    icono: '🏘️',
    ruta: 'modules/mgi/',
    acceso: 'mgi',
    estado: 'activo',
    visibleEnHome: false,
    doc: 'docs/modulos/mgi.md',
  },
  {
    id: 'centinela',
    nombre: 'Faena Centinela',
    descripcion: 'Consulta de solo lectura para la faena Centinela.',
    icono: '⛏️',
    ruta: 'modules/centinela/',
    acceso: 'centinela',
    estado: 'activo',
    visibleEnHome: false,
    doc: 'docs/modulos/faenas.md',
  },
  {
    id: 'antucoya',
    nombre: 'Faena Antucoya',
    descripcion: 'Consulta de solo lectura para la faena Antucoya.',
    icono: '⛏️',
    ruta: 'modules/antucoya/',
    acceso: 'antucoya',
    estado: 'activo',
    visibleEnHome: false,
    doc: 'docs/modulos/faenas.md',
  },
  {
    id: 'zaldivar',
    nombre: 'Faena Zaldívar',
    descripcion: 'Consulta de solo lectura para la faena Zaldívar.',
    icono: '⛏️',
    ruta: 'modules/zaldivar/',
    acceso: 'zaldivar',
    estado: 'activo',
    visibleEnHome: false,
    doc: 'docs/modulos/faenas.md',
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
