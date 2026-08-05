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
