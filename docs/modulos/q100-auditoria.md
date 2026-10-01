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

## Gaps pendientes (modelo)

- **Visibilidad por área vs. por tarea (el más de fondo).** La auditoría muestra
  gerentes que ven tareas **cruzando áreas** (Agustín/Marisol comparten 32 en C3;
  Pablo/Daniela ven Com+AACC; Héctor ve PCG+FMLP; Christian FMLP+PCG). El modelo
  actual da 1 área por usuario y 1 por tarea, así que p.ej. **Marisol ve 11 y
  debería ver 32**. ⚠️ Los IDs exactos de esas excepciones **se perdieron** en la
  auditoría y no deben adivinarse: el arreglo correcto es una tabla de **grants
  por tarea/ámbito** + asignación validada por el usuario (ítem 3, pendiente).
- **Roles:** hoy 2 (corporativo/área); la auditoría propone 5 (admin,
  corporativo, responsable de área, ejecutor, lector).
- **Comentarios con historial + evidencia** (archivo opcional 50 MB): hoy un solo
  campo de comentario, sin evidencia.
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
| 3 | Grants por tarea/ámbito (visibilidad cruzada) | Medio | pendiente (necesita validación del usuario) |
| 4 | Roles ejecutor/lector + comentarios con historial + evidencia | Medio | pendiente |
| 5 | Subacciones como entidad | Medio | pendiente |
| 6 | Crear acción/hito + importador Excel con preview | Alto | pendiente (diseño aparte) |

## Nota sobre la auditoría

No se conectó ni modificó la plataforma original. Los IDs de excepciones de
visibilidad por usuario se perdieron en el reinicio del entorno de la auditoría
y **no deben reconstruirse por conjetura** (se asignan desde validación
documentada). Discrepancias históricas (p.ej. PPT 80% vs 74% actual) se
conservan con fuente/fecha, no se sustituyen.
