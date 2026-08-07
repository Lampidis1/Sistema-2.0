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
(`baja`/`media`/`alta`) · `fecha_limite` · `origen` (`manual`/`ia` — el
segundo valor queda reservado para cuando se conecte PlanIA-Personal) ·
`estado_registro` (borrado lógico, mismo trigger que el resto del sistema).

## Pendiente: la integración con PlanIA-Personal

Ver `docs/PENDIENTES.md`. La parte de generación por IA está en desarrollo
en paralelo. Cuando esté lista, la pieza que falta decidir es **dónde vive
la llamada al modelo** — una API key de un proveedor de IA no puede quedar
expuesta en el navegador (a diferencia de la `anon key` de Supabase). La
opción que mejor encaja con la arquitectura actual (sitio estático, sin
servidor propio) es una Supabase Edge Function.
