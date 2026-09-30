# Módulo Reclamos Comunitarios

Informe semanal de reclamos comunitarios (TMRC). Es la evolución del
"Filtrador TMRC" que vivía dentro de Proveedores → Gestión Interna → Reclamos;
ahora es un módulo propio, accesible desde el Home entre RCA y Gestión de
usuarios.

## Acceso

- Slug: **`reclamos`** (`accesoAlterno: 'principal'` — el equipo de Proveedores
  también lo opera).
- Flujo estándar: la persona se registra → queda `pendiente` → el admin la
  aprueba asignándole el slug `reclamos` (ya figura en la lista de
  `modules/admin/admin.js`).

## Cómo funciona

1. Se carga el **Excel maestro semanal** (`tmrc_export…`, hoja "Reclamos", 35
   columnas). ⚠️ **No se guarda**: contiene datos personales del reclamante
   (cols D–K: nombre, apellido, email, dirección, teléfono). Solo se usa en
   memoria para filtrar.
2. **Dos vistas** (pestañas): **AAPP Norte** (operativa) y **MLP** (criterio
   pendiente de definir).
3. **AAPP Norte** — filtros por Compañía (Centinela/Antucoya/Zaldivar), Macro
   estado, Categoría (Tu Voz excluida) y Año. Defaults que replican el informe
   actual: excluye "Con resolución", "Otra" y "Plan preventivo PL"; año más
   reciente. Fecha de eliminación vacía; tiempo de gestión > 30 días en rojo.
4. La tabla del informe tiene **11 columnas** (las del correo, sin CONCEPTO),
   agrupada por compañía y con **rowspan por empresa denunciada**.
5. **Edición:** columna **ESTATUS** editable (texto libre, auto-alto, centrado),
   **eliminar filas** del informe, y **ancho de columnas ajustable** (arrastrar
   el borde del encabezado).
6. **Copiar tabla:** genera la tabla con estilos en línea lista para pegar en
   Outlook (mismo formato del correo semanal).
7. **Candado (Cerrar y archivar):** congela el informe y lo guarda en el
   histórico (Supabase, solo las 11 columnas, sin PII), genera un **enlace
   público** con **clave aleatoria** y **vigencia** (7/30 días o sin
   expiración) para adjuntar al correo, y permite **descargar la imagen PNG**
   de la tabla (dibujada a mano sobre canvas, sin dependencias).
8. **Histórico:** lista los informes archivados; cada uno se puede **ver**
   (solo lectura), copiar, descargar imagen, y **revocar/reactivar** su enlace.

## Base de datos (Fase 2)

Tabla `public.reclamos_informes` (RLS habilitado, **sin políticas** → todo
acceso por RPCs `SECURITY DEFINER`; patrón de vacante_links/q100/lavanderías).
RPCs: `reclamos_guardar`, `reclamos_historico`, `reclamos_ver`,
`reclamos_link_estado` (authenticated con acceso) y `reclamos_ver_publico`
(anon, exige clave si el informe la tiene). La clave viaja solo en la
verificación server-side; se guarda su **hash bcrypt** (`extensions.crypt`).
Migración: `database/migraciones/2026-09-30_reclamos_historico_y_links.sql`.

## Página pública

`modules/reclamos/ver.html?t=<token>` — sin login; pide la clave y muestra el
informe congelado (llama a `reclamos_ver_publico`). Permite copiar la tabla y
descargar la imagen. Es el enlace que se adjunta al correo.

## Mapa de columnas del Excel (0-based)

`cod:0, cat:1, sub:2, estado:11, cia:12, titulo:13, monto:15, loc:16,
creacion:23, elim:24, macro:25, denunciada:27, montoCorr:28, tgestion:29,
provAfect:31, anio:33`

## Pendiente (fases siguientes)

- **Fase 3:** gráficas nativas (Chart.js) desplegables por compañía
  (reemplazan las imágenes del PPT de Power BI: CEN/ANT/CMZ + GN).
- **MLP:** definir su criterio de filtrado.

## Archivos

- `modules/reclamos/index.html` · `reclamos.css` · `reclamos.js` ·
  `reclamos-imagen.js` (PNG de la tabla) · `ver.html` (página pública)
- `database/migraciones/2026-09-30_reclamos_historico_y_links.sql`
- Registrado en `config/modules.config.js` y en la lista de slugs de
  `modules/admin/admin.js`.
