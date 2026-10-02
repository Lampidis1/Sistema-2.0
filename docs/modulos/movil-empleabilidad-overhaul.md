# Oficina Móvil + Empleabilidad — Rediseño (encargo de 47 ítems, 2026-10-02)

Modelo objetivo: **1 persona → 1 RUT → 1 ficha → N atenciones históricas**.
Todo en HTML/CSS/JS vanilla + Supabase (sin frameworks, sin `type="module"`).

## Migraciones aplicadas
- `2026-10-02_movil_atencion_relaciones.sql` — `atenciones` +comentario/localidad/
  telefono/resultado; `derivaciones`/`formaciones` +`atencion_id`; `formaciones`
  +`licencias_json`.
- `2026-10-02_operativos_programacion.sql` — `operativos` +nombre/hora_inicio/
  hora_termino/inicio_real/responsable; RPCs `operativos_cerrar_vencidos`,
  `operativo_activar`; trigger `trg_atenciones_operativo`. **pg_cron habilitado**
  con el job `operativos-cerrar-vencidos` (*/5 * * * *).

## Fase 1 — Oficina Móvil (`modules/movil/`)
| # | Ítem | Resolución |
|---|------|-----------|
| 1 | Menú | Recepción · Vacantes · Formación · Resumen (fuera Dashboard y Levantados; `movil-dashboard.js` eliminado) |
| 2,10 | Formación compartida | Pestaña `movil-formacion.js` sobre la tabla `cursos` (misma fuente que Empleabilidad) |
| 3,4 | Resumen + filtros | Lista de atenciones con filtros fecha (desde/hasta) y servicios (multi, **combinación = AND**) + Todos |
| 5 | RUT/precarga | Al borrar/cambiar el RUT se limpia la persona anterior (`_limpiarPersonaTemporal`) |
| 6,7 | Botones CV | Quitados "Cargar CV (PDF/Word)" y "CV PDF" del móvil |
| 8 | Apresto reutiliza | El apresto ya guarda la ficha y reutiliza antecedentes; la navegación no borra el estado |
| 9 | Intermediación | Sin pregunta "interna/externa"; derivación con `atencion_id` |
| 11 | Licencias habilitantes | Multi-selección; catálogo único `AMForm.LICENCIAS` (6 clases) |
| 12 | Guardar levantamiento | Persiste en `RC` (reaparece al volver); `atencion_id`; no finaliza la atención |
| 13 | Guardar atención | Finaliza; limpia todo para nueva persona **solo tras confirmar backend** |
| 14 | Comentario de la atención | Campo al final, ligado a la visita (`atenciones.comentario`), visible en historial |
| 15 | Recurrentes/historial | Indicador "🕑 Historial (N)" + resumen de última atención + modal de historial |
| 16,17 | Operativos | Programados desde Empleabilidad; activación en el móvil (inicio real = activar); **cierre automático server-side** (RPC + pg_cron + trigger); bloqueo si finalizado/vencido; "operativo rápido" con término obligatorio |

## Fase 2 — Empleabilidad (`modules/empleabilidad/`)
| # | Ítem | Resolución |
|---|------|-----------|
| 18 | Menú | Directorio · Intermediación · Formación · Mapa · Reportes Móvil · Operativos |
| 19 | Kanban | Fuera del menú (código y página se conservan) |
| 20 | Grupo "Futuro" | Desplegable (cerrado por defecto) con Ofertas y Becados |
| 17 | Config operativos | `empleabilidad-operativos.js`: programar (nombre, fecha, horario, zona, responsable), estados, finalizar |
| 21 | Mapa etiquetas | Anti-solapamiento en el motor (`shared/js/mapa.js`); las capas ya tenían visibilidad por zoom (`_min`) |
| 22 | "Plaza Sotomayor" | **Causa:** respaldo al centroide de comuna para atenciones sin operativo. **Fix:** sin punto falso → "Sin georreferenciar" |
| 23 | Validar coordenadas | `emCoordValida` (rangos, descarta 0,0) + `emNum` (coma decimal) |
| 24 | Vista satélite | **Revisada, se conserva:** es Sentinel-2 cloudless auto-alojado (CC BY 4.0), georreferenciado, que hace zoom/pan; ya es opt-in y secundario (vectorial por defecto). Un proveedor de tiles real exige servicio externo → prohibido por Reglas 5 y 6 |

## Fase 3 — Modelo y trazabilidad
- **#25** Ficha única por RUT: `guardarRegistro` adopta la ficha existente si el
  RUT ya existe (anti-duplicado), además de la precarga por RUT normalizado.
- **#26** Atenciones: `atencion_id`, cv_id, rut, fecha/hora (`created_at`),
  operativo, ejecutivo, servicios, comentario, nivel_estudios, localidad,
  teléfono; derivaciones e inscripciones/levantamientos ligados por `atencion_id`.
- **#27** Flujo: RUT → buscar → precarga + historial → recepción → servicios →
  levantamiento parcial → comentario → guardar atención → limpieza.

## Decisiones de criterio (a confirmar si se desea otro comportamiento)
- Resumen: varios servicios = **combinación (AND)**. "Todos" = sin filtro de servicio.
- Satélite: se conserva la imagen propia (no se integra proveedor externo por Reglas 5/6).
