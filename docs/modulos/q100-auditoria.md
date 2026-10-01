# Q100 — Comparación auditoría vs. implementación + plan de mejoras

Fecha: 30 de septiembre de 2026. Compara la auditoría externa de la plataforma
original (`planes-de-accion.dinamicaplataforma.com`, revisión usuario por usuario)
con el módulo `modules/q100/` que construimos. Fuente autoritativa de datos:
`catalogo_acciones.csv` de la auditoría (316 tareas finales: 187 C2 + 129 C3,
con área = `responsable_visible`, % exacto, criticidad, estado, fechas).

## Veredicto

El **núcleo es fiel** a lo que la auditoría pudo observar del original y los
números clave calzan exactos. Los faltantes eran (a) un hueco de datos del
Ciclo 2, (b) historial de avances, (c) diferencias de modelo que la propia
auditoría no pudo resolver (IDs de excepciones perdidos), y (d) funciones que la
auditoría marca como **propuestas** (no existían en el original).

## Lo que ya estaba correcto (confirmado)

| Aspecto | Auditoría | Implementación |
|---|---|---|
| Jerarquía Meta→Línea→Acción | 10 / 53 / 129 (C3) | 10 / 53 / 129 ✓ |
| Avance integrado C3 | 74,2868% → 74% | 74,29% → 74% ✓ |
| Críticas C3 | 58 | 58 ✓ |
| Promedio = media de tareas finales (sin doble conteo) | requerido | ✓ |
| Dashboard (general, críticas, <30, meta/área, heatmap) | observado | ✓ |
| Drill-down (título, criticidad, %, slider, comentario, guardar) | observado | ✓ |
| Corporativo ve el área, no las personas | requerido | ✓ |
| Seguridad server-side (RLS + RPC SECURITY DEFINER) | requerido | ✓ |

## Hecho el 30/09/2026 (ítems 1 y 2 del plan)

- **Ítem 1 · Ciclo 2 completo.** Antes 40/187 avances. Recargado desde el
  catálogo autoritativo: **187 tareas, 85,877% → 86%, 85 críticas, 2 críticas
  <30, promedio de críticas 88%** — idéntico a la auditoría. Área por tarea
  tomada de `responsable_visible` (`1 Resp.` = Protección/Meta 10). El Ciclo 3
  no se tocó. Migración: `2026-09-30_q100_ciclo2_completo.sql`.
- **Ítem 2 · Historial append-only.** Tabla `q100.avances_hist` (RLS, acceso
  solo por RPC) con valor anterior/nuevo, actor, fecha (America/Santiago) y
  procedencia. `q100_guardar_avance` registra cada cambio; `q100_avance_historial`
  lo lee. Baseline de 316 entradas. Migración:
  `2026-09-30_q100_avances_historial.sql`. *(Falta mostrarlo en la UI del
  drill-down — pendiente de front.)*

## Ítem 3 · Visibilidad cruzada por grants (hecho el 30/09/2026)

Tabla `q100.grants(user_id, ambito ['area'|'meta'|'linea'|'accion'], ref_id,
nivel ['ver'|'editar'])`. La regla pasa de `usuario.area = tarea.area` a **área
propia + grants**. Helpers `puede_ver_accion` (nuevo) y `puede_editar_accion`
(extendido); `q100_dashboard` y `q100_acciones` se scopean por `puede_ver`.
RPCs de administración (solo corporativo): `q100_grant_asignar/quitar/listar`,
`q100_admin_datos`, `q100_buscar_accion`. UI: botón **🔐 Permisos** en Q100
(visible solo a corporativo) para asignar ver/editar por área/meta/línea/acción.
Migración: `2026-09-30_q100_grants_visibilidad_cruzada.sql`.

> ⚠️ **Cambio de comportamiento:** antes TODOS los usuarios q100 veían TODAS las
> tareas (solo se restringía editar). Ahora cada **no-corporativo ve solo su
> área** hasta que se le asignen grants. Corporativo/admin ven todo. Los casos
> cruzados concretos (Marisol 32, Agustín 32, Pablo/Daniela 28, Héctor 7,
> Christian 12) se **cargan desde la UI de Permisos con validación** — los IDs
> exactos de la auditoría se perdieron y no se adivinan.

## Ítem 4 · Roles + comentarios (parte 1 hecha el 30/09/2026)

- **Roles:** `q100.usuarios.rol` admite ahora `corporativo | area | ejecutor |
  lector`. `lector` nunca edita; `ejecutor` edita solo tareas con grant 'editar'
  (no toda su área); `area` edita su área + grants. `puede_editar_accion`
  actualizado. UI: selector de rol por usuario en 🔐 Permisos (corporativo).
- **Comentarios con historial:** tabla `q100.comentarios` (hilo por acción, RLS,
  acceso por RPC) con `q100_comentarios_listar` / `q100_comentario_agregar`
  (fecha America/Santiago; `lector` no comenta). UI: botón **💬 Comentarios** en
  el drill-down. Columnas `evidencia_url`/`evidencia_nombre` listas para la
  parte 2. Migración: `2026-09-30_q100_roles_y_comentarios.sql`.

## Gaps pendientes (modelo)

- **Evidencia** (archivo opcional 50 MB por comentario): parte 2 del ítem 4,
  requiere bucket de Supabase Storage + RLS + flujo de subida/descarga.
- **Subacciones** (6 C3, 8 C2): aplanadas dentro de las tareas finales (no afecta
  el promedio; sí la estructura jerárquica fina).

## Funciones propuestas (no existían en el original observado)

- Crear acción/subacción/**hito** (la auditoría confirma que "Hito" **no era**
  una entidad en el original).
- Importador Excel con preview.
- Selector de año/ciclo, continuidad de acciones, regla de estados configurable,
  acumulación entre ciclos.

## Plan (por prioridad y riesgo)

| # | Mejora | Riesgo | Estado |
|---|---|---|---|
| 1 | Completar datos del Ciclo 2 | Bajo | ✅ hecho |
| 2 | Historial de avances append-only | Bajo | ✅ hecho (falta UI) |
| 3 | Grants por tarea/ámbito (visibilidad cruzada) | Medio | ✅ hecho (falta cargar los casos) |
| 4 | Roles ejecutor/lector + comentarios con historial + evidencia | Medio | ✅ roles+comentarios; evidencia (parte 2) pendiente |
| 5 | Subacciones como entidad | Medio | pendiente |
| 6 | Crear acción/hito + importador Excel con preview | Alto | pendiente (diseño aparte) |

## Nota sobre la auditoría

No se conectó ni modificó la plataforma original. Los IDs de excepciones de
visibilidad por usuario se perdieron en el reinicio del entorno de la auditoría
y **no deben reconstruirse por conjetura** (se asignan desde validación
documentada). Discrepancias históricas (p.ej. PPT 80% vs 74% actual) se
conservan con fuente/fecha, no se sustituyen.
