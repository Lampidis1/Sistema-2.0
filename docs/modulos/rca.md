# Módulo RCA · Cumplimiento de compromisos ambientales

## Qué es

Una **RCA** (Resolución de Calificación Ambiental) puede comprometer que un
porcentaje del gasto de cada **empresa colaboradora (EECC)** se haga con
**proveedores locales/regionales**. El caso base es el **10%**.

> Cita del RCA 20250200199 (EIA Zaldívar): *"…comprometiéndose llegar a un 10%
> de contratación de proveedores locales mediante nuestro Programa de
> Proveedores para un Futuro Mejor…"*

Este módulo hace el seguimiento de ese compromiso, por RCA y por EECC.

## Cómo funciona

1. Se carga una **RCA por código** (cada una con su `% de meta`, 10% por defecto).
2. Cada **EECC** declara por **carta formal** un monto total a gastar en el
   proyecto. La **meta** es el `% de meta` de ese monto declarado.
3. Las EECC envían mes a mes un **Excel con sus facturas de compra**. El sistema
   lo carga y **cruza el RUT** de cada factura contra el registro de proveedores
   regionales validados.
4. Solo las facturas de proveedores **regionales validados** suman al avance del
   10%. Un **RUT desconocido** dispara una **alerta de revisión manual**: se
   valida (pasa a sumar) o se marca fuera de región.
5. Se ve el **avance por EECC** y el **avance global** de la RCA, y se puede
   exportar un **informe Excel** (resumen + facturas).

Cada EECC lleva **inicio y término de contrato** (`fecha_desde` / `fecha_hasta`).
Con eso, la tarjeta muestra un **conteo de días de contrato restantes** (verde si
faltan más de 30, ámbar si 30 o menos, rojo si ya venció) junto al **% que falta
para cumplir la meta** — así se ve de un vistazo cuánto le queda por cumplir y
cuánto tiempo de contrato le queda. Los días y el % faltante también salen en el
informe Excel.

### Reporte HTML (gerencia / por EECC)

Dos botones generan un **documento HTML autónomo** (estilos incrustados, sin
dependencias; se abre en el navegador y se descarga como respaldo):

- **📄 Reporte gerencia** (barra superior del detalle): un **resumen general** de
  todas las EECC (meta, reportado, avance global, facturas contadas/reportadas) +
  **una hoja por cada EECC**.
- **📄 Reporte** (en cada tarjeta EECC): solo la hoja de esa EECC, para enviársela
  a la empresa colaboradora.

Cada hoja muestra el **avance de lo comprometido** (reportado que suma vs meta) y
la **gestión de facturas**: cuántas se reportaron (total del Excel) vs cuántas
realmente se contaron, y los montos que **no sumaron**, en tres listas
desplegables (clic para ver el detalle de cada factura mal): **datos incompletos**
(sin N° de factura o sin fecha, con el motivo), **otra comuna** (fuera de región) y
**por revisar** (proveedor no reconocido).

> ⚠️ **Cambio en la carga (2026-09-16):** antes, las filas sin N° de factura, RUT
> o monto se **descartaban en silencio**. Ahora se **guardan** con
> `estado_revision='incompleta'` y `motivo_descarte` para poder listarlas en el
> reporte. Además una fila **sin fecha** (sin año ni mes) también cuenta como
> incompleta y **no suma** — antes sí sumaba. No cambia lo ya cargado; aplica a
> las próximas cargas de Excel.

En la ventana **🧾 Facturas** de una EECC se pueden borrar facturas una por una
(🗑 en cada fila) o por **día de carga**. La caja **«Excel cargados (por día)»**
agrupa las facturas por la fecha (`created_at`) en que se subió el Excel y permite
**eliminar la carga de un día concreto** (útil para deshacer un Excel subido con
errores sin tocar los otros). Cuando hay más de un día, aparece además **🗑 Eliminar
todos**. Todo es borrado lógico (`estado_registro='Eliminado'`); la EECC deja de
sumar hasta que se vuelva a cargar.

> ⚠️ Hoy cada **carga de Excel reemplaza** las facturas previas de esa EECC (el
> Excel auditado es la fuente de verdad), así que normalmente hay **un solo día de
> carga** por EECC. La columna **Cargado** y el borrado por día muestran esa fecha
> y permiten eliminarla. Si se quisiera que las cargas **se acumulen** por día
> (para comparar varios Excel), habría que cambiar la carga de "reemplazar" a
> "sumar" — es un cambio con riesgo de doble conteo, por eso queda anotado y no se
> hizo de oficio.

> **Modales:** el formulario se cierra solo con un clic **deliberado** en el
> fondo oscuro (la presión empieza y termina ahí) o con **Escape**. Un clic
> dentro de la caja, o arrastrar para seleccionar texto y soltar afuera, ya no
> lo cierra: antes eso cerraba el formulario y se perdía lo escrito.

Tiene dos pestañas: **Proveedores** (operativa) y **Mano de Obra Local**
(reservada, se desarrollará después).

## Datos (Supabase, con RLS)

Migración: `database/migraciones/2026-08-18_modulo_rca.sql`. Acceso por slug
`rca` o `principal` (`tiene_acceso('rca') or es_principal()`).

| Tabla | Qué guarda |
|---|---|
| `rca_normativas` | Una fila por RCA: código, faena, `pct_meta`, texto del compromiso. |
| `rca_eecc` | Empresas colaboradoras por RCA, con `monto_declarado` (carta formal) y la ruta de la carta. |
| `rca_facturas` | Líneas de factura cargadas del Excel, con el resultado del cruce (`estado_revision`: `ok` / `pendiente` / `no_regional`). |
| `rca_proveedores_validados` | Registro propio de proveedores regionales validados. Sembrado con 137 del Excel oficial *BD Provedores* (121 regionales, 16 fuera de región). |

El registro de validados es **propio del RCA**, separado del directorio de
Proveedores (decisión del dueño). Al validar un RUT nuevo desde una alerta, se
agrega ahí y sus facturas pendientes pasan a `ok`.

## Registro de validados: región

Cuentan como regionales las comunas de la **Región de Antofagasta**: Antofagasta,
Mejillones, Sierra Gorda, Taltal, Calama, Ollagüe, San Pedro de Atacama,
Tocopilla, María Elena. El Excel oficial marca el resto como `OTRO`
(`es_regional = false`).

## Archivos

```
modules/rca/
├── index.html     estructura + gate (auth-guard) + carga de XLSX y jsPDF
├── rca.css        estilos
└── rca.js         toda la lógica (cruce, avance, alertas, informe)
```

Reutiliza `shared/js/auth-guard.js` (login unificado), SheetJS para leer/escribir
Excel y el bucket privado `documentos` (URLs firmadas) para la carta formal.

## Pendiente

- Pestaña **Mano de Obra Local**.
- El módulo **reemplaza** la ventana "Compromiso RCA" a medio hacer que quedó
  dentro de Proveedores (`proveedores-rca.js` y las tablas `rca_empresas` /
  `compras`). Retirar esa versión antigua una vez validada esta. Ver
  `docs/PENDIENTES.md`.
