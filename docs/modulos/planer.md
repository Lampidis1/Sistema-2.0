# Módulo: Planer

| | |
|---|---|
| **id** | `planer` |
| **Slug de acceso** | `planer` |
| **Ruta** | `modules/planer/index.html` |
| **En el Home** | **No** — se entra por URL directa, igual que `movil`/`mgi`/las 3 faenas |
| **Estado** | Activo · en producción (2026-08-07) |
| **Archivos** | `index.html` · `planer.css` · `planer.js` |
| **Tabla** | `planer_items` |

## Qué problema resuelve

Los especialistas de Proveedores necesitan registrar pendientes y acciones a
tomar. Pensado como base para conectar más adelante con **PlanIA-Personal**
(proyecto de generación de planes con IA, en desarrollo aparte) — hoy
funciona como registro manual.

## Cómo funciona el filtro por autor

**Vista conjunta, no privada.** Cualquiera con el slug `planer` ve **todos**
los pendientes del equipo — no solo los suyos. El filtro "por autor" es un
`<select>` en el frontend sobre datos que ya llegaron completos, no una
restricción de acceso.

Lo que sí está restringido por RLS: cada quien solo puede **crear o editar**
sus propios pendientes (`autor_id = auth.uid()`). Un admin puede editar
cualquiera. Eliminar (borrado lógico) es solo admin, mismo patrón que el
resto del sistema.

## Detalle técnico: primera tabla con RLS "por autor de fila"

Hasta este módulo, todas las políticas RLS del sistema eran por **rol/acceso**
(`es_principal()`, `es_mgi()`...), nunca por quién creó la fila. `planer_items`
es la primera excepción — se agregó `autor_id uuid` específicamente para que
`autor_id = auth.uid()` funcione en las políticas de `update`/`insert`.

```sql
create policy planer_select on planer_items for select
  using (es_admin() or es_planer());              -- ve TODO
create policy planer_insert on planer_items for insert
  with check ((es_admin() or es_planer()) and autor_id = auth.uid());
create policy planer_update on planer_items for update
  using (es_admin() or autor_id = auth.uid());     -- solo lo propio
```

## Columnas de `planer_items`

`item_id` (texto, generado en el cliente) · `autor_id` (uuid, `auth.uid()`) ·
`autor_nombre` (texto, para mostrar/filtrar) · `titulo` · `descripcion` ·
`estado` (`pendiente`/`en_progreso`/`hecho`) · `prioridad`
(`baja`/`media`/`alta`) · `fecha_inicio` · `fecha_limite` · `recurrencia`
(`ninguna`/`semanal`/`mensual`) · `recurrencia_hasta` · `serie_id` (agrupa
las filas generadas por una misma recurrencia) · `origen` (`manual`/`ia` — el
segundo valor queda reservado para cuando se conecte PlanIA-Personal) ·
`estado_registro` (borrado lógico, mismo trigger que el resto del sistema).

## Calendario, recurrencia, voz y exportación (2026-08-08)

- **Calendario visual**: librería `vanilla-calendar-pro@3.1.0` vía CDN
  (jsDelivr, `+esm`, ~15KB gzip) — agregada con aprobación explícita del
  dueño del proyecto (Regla de Oro 6). Se carga con `import()` dinámico
  dentro de un `<script>` clásico (sin `type="module"`) para no tocar el
  scope global — ver CLAUDE.md §6.
- **Feriados de Chile**: hardcodeados en `FERIADOS_CL` (planer.js), sin API
  externa. Cubre 2026-2027. **Hay que agregar el año siguiente a mano** —
  no se actualiza solo. No incluye feriados por elecciones (variables).
- **Recurrencia**: al guardar un pendiente con `recurrencia` distinta de
  `ninguna`, se generan de una vez todas las filas de la serie (tope 104
  ocurrencias) con el mismo `serie_id`. Editar una ocurrencia no afecta a
  las demás — no hay edición masiva de serie todavía.
- **Dictado por voz**: Web Speech API nativa (`SpeechRecognition`), sin
  librería ni servicio externo. Funciona en Chrome/Edge. Safari/iOS no
  expone esta API por JS — el botón de micrófono se oculta solo ahí
  (feature detection); el teclado de iPhone ya trae su propio dictado sobre
  los mismos campos de texto.
- **Exportar a calendario**: genera archivos `.ics` (RFC 5545) en el
  cliente, sin backend nuevo. Botón individual por pendiente y botón
  "Descargar todo" (respeta los filtros activos). Lo abre igual iPhone
  (Calendario), Android (Google Calendar) y Outlook — no depende de ninguno
  de los tres en particular.

## Pendiente: la integración con PlanIA-Personal

Ver `docs/PENDIENTES.md`. La parte de generación por IA está en desarrollo
en paralelo. Cuando esté lista, la pieza que falta decidir es **dónde vive
la llamada al modelo** — una API key de un proveedor de IA no puede quedar
expuesta en el navegador (a diferencia de la `anon key` de Supabase). La
opción que mejor encaja con la arquitectura actual (sitio estático, sin
servidor propio) es una Supabase Edge Function.
