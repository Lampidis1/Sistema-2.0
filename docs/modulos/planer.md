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

## Los dos tipos de fila (columna `tipo`)

| | `pendiente` | `todo` (rutina) |
|---|---|---|
| Qué es | Tarea puntual con fecha | Rutina que se repite |
| Repetición | Genera **copias independientes**, una fila por ocurrencia | **Una sola fila**; las ocurrencias se calculan al vuelo |
| Frecuencias | semanal, mensual | diaria, semanal, mensual |
| Cumplimiento | `estado` en la propia fila | una fila por día en `planer_todo_checks` |

**Por qué las rutinas no se materializan:** una rutina diaria a un año serían
365 filas. En vez de eso se guarda la regla (`fecha_inicio` + `recurrencia` +
`recurrencia_hasta`) y `aplicaEnDia()` en `planer.js` decide si cae en un día
dado. Solo se guardan los días efectivamente marcados como cumplidos.

Consecuencia: editar una rutina cambia **todas** sus ocurrencias; editar un
pendiente de una serie repetida cambia **solo esa**. Es intencional.

## Vistas: mes, semana, día

`VISTA` (`lista`|`mes`|`semana`|`dia`) y `FOCO` (fecha de referencia) son el
estado de navegación. Las flechas ‹ › mueven el foco un mes, una semana o un
día según la vista activa.

- **Mes** — `vanilla-calendar-pro`. Un punto bajo el número marca los días con
  compromisos (teal) o feriados (rojo); al pasar por encima se ve el detalle.
  Clic en un día → vista Día de ese día.
  ⚠️ El `modifier` de la librería se aplica sobre el `<button>` (`.vc-date__btn`),
  **no** sobre el `.vc-date` que lo contiene. El selector CSS depende de eso.
- **Semana** — 7 columnas hechas a mano (sin librería). En teléfono se apilan
  como filas. Clic en un día → vista Día. El `＋` de cada columna crea un
  registro con esa fecha ya puesta.
- **Día** — dos secciones: *Rutinas del día* (con casilla para marcar
  cumplido/no cumplido) y *Pendientes del día*.

## Eliminar

Borrado lógico (`estado_registro = 'Eliminado'`), igual que el resto del
sistema: nada se borra de verdad, deja de listarse. La política `planer_update`
ya permitía `autor_id = auth.uid()`, así que **cada quien puede eliminar lo
suyo** sin cambios de RLS; un admin puede eliminar cualquiera.

Eliminar una rutina la quita de **todos** los días — el `confirm()` lo advierte.

## Columnas de `planer_items`

`item_id` (texto, generado en el cliente) · `autor_id` (uuid, `auth.uid()`) ·
`autor_nombre` (texto, para mostrar/filtrar) · `tipo` (`pendiente`/`todo`) ·
`titulo` · `descripcion` · `estado` (`pendiente`/`en_progreso`/`hecho`) ·
`prioridad` (`baja`/`media`/`alta`) · `fecha_inicio` · `fecha_limite` ·
`recurrencia` (`ninguna`/`diaria`/`semanal`/`mensual`) · `recurrencia_hasta` ·
`serie_id` (agrupa las filas generadas por una misma recurrencia) · `origen`
(`manual`/`ia` — el segundo valor queda reservado para cuando se conecte
PlanIA-Personal) · `estado_registro` (borrado lógico).

## Tabla `planer_todo_checks`

Un día marcado como cumplido de una rutina. PK compuesta `(todo_id, fecha)`;
desmarcar **borra la fila**. RLS: lectura conjunta (`es_admin() or es_planer()`),
insert/delete solo del propio autor.

## Trampa conocida: IDs duplicados en el HTML

El filtro de estado de la barra y el campo de estado del formulario tenían
**ambos** `id="fEstado"`. `getElementById` devuelve el primero, así que el
formulario leía y escribía el filtro. El campo del formulario ahora es
`fEstadoItem`. Al agregar campos, revisar que no se repitan IDs:

```bash
grep -o 'id="[^"]*"' index.html | sort | uniq -d
```

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
