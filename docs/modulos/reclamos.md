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

## Mapa de columnas del Excel (0-based)

`cod:0, cat:1, sub:2, estado:11, cia:12, titulo:13, monto:15, loc:16,
creacion:23, elim:24, macro:25, denunciada:27, montoCorr:28, tgestion:29,
provAfect:31, anio:33`

## Pendiente (fases siguientes)

- **Fase 2:** candado → congela el informe y lo guarda como **histórico** en
  Supabase (solo las 11 columnas, sin PII), genera **link público con clave
  aleatoria y expiración de 7 días** (patrón SECURITY DEFINER como
  lavanderías/q100) y la **imagen** de la tabla para adjuntar al correo.
- **Fase 3:** gráficas nativas (Chart.js) desplegables por compañía
  (reemplazan las imágenes del PPT de Power BI: CEN/ANT/CMZ + GN).
- **MLP:** definir su criterio de filtrado.

## Archivos

- `modules/reclamos/index.html` · `reclamos.css` · `reclamos.js`
- Registrado en `config/modules.config.js` y en la lista de slugs de
  `modules/admin/admin.js`.
