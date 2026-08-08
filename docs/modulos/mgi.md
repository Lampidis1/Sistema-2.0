# Módulo: MGI Habitabilidad

| | |
|---|---|
| **id** | `mgi` |
| **Slug de acceso** | `mgi` |
| **Ruta** | `modules/mgi/index.html` |
| **En el Home** | **No** — se entra por URL directa |
| **Estado** | Activo · en producción |
| **Archivos** | `index.html` 279 · `mgi.css` 134 · `mgi.js` 1.031 líneas |

## Qué problema resuelve

Modelo de Gestión Integral de habitabilidad: evalúa y hace seguimiento de las
condiciones de alojamiento de trabajadores en los establecimientos de la
región, contra criterios estandarizados.

## Qué contiene

- **Hotelería** — establecimientos y trabajadores alojados
- **Visitas** de evaluación con participantes, compromisos y firmas
- **Estandarización** — criterios (`est_criterios`) y avance (`est_avance`)
- **Documentos** adjuntos por establecimiento
- **Gráficos** de avance (Chart.js)
- **Registro de ediciones** — auditoría

## Cómo funciona

Separado en `index.html` + `.css` + `.js`, con su propio login. Comparte **14 tablas** con
el módulo de Proveedores (`hoteleria`, `visitas`, `proveedores`, `contactos`,
`est_*`, `visita_*`...): son dos vistas distintas sobre los mismos datos, con
distinto enfoque.

`es_mgi()` da acceso de lectura y escritura sobre ese conjunto; eliminar sigue
siendo solo de admin.

## La ficha emergente (2026-08-08)

Al hacer clic en **Ver ficha** de una tarjeta se abre la misma ventana que en
Proveedores: cabecera con acciones, pestañas y cuerpo a dos columnas. Los
estilos son literalmente el mismo archivo (`shared/css/ficha-modal.css`); MGI
solo define su morado con las variables `--fm-*` en `mgi.css`.

| | Proveedores | MGI |
|---|---|---|
| Pestañas | Datos · Visitas · Hotelería · Contratos · Licitaciones · Programas | Datos · Hotelería · Visitas · Trabajadores |
| Acciones | Exportar · Editar · Estandarización · Selección · Eliminar | Exportar · Editar · Estandarización · Nueva visita |

**No se duplicó lógica.** Las pestañas Visitas y Trabajadores las llenan las
mismas funciones que ya usaba el modal de edición: `cargarVisitasMGI()` y
`cargarTrabajadoresMGI()` ahora reciben el id del contenedor donde pintar
(por omisión, el del modal de edición — el comportamiento anterior). Cargan
al abrir la pestaña, no antes.

> ⚠️ El modal de edición se llamaba `.modal` / `.modal-box`. En el CSS
> compartido `.modal` es la caja blanca de la ficha, así que el de edición
> pasó a `.medit-ov` / `.medit-box`. Si algo del modal de edición se ve mal,
> revisar primero ahí.

## Notas importantes

**Sube archivos al bucket `documentos`** con `getPublicUrl()`
(`index.html:885`), que hoy genera enlaces legibles sin autenticación desde
internet. Ver `PENDIENTES.md` → P-1.

**Comparte tablas con Proveedores.** Un cambio de esquema acá afecta al otro
módulo. Los dos se revisan juntos.

## Sensibilidad de los datos

Media-alta: condiciones de alojamiento de trabajadores identificados y
evaluaciones de proveedores. Los documentos adjuntos pueden contener
información contractual.
