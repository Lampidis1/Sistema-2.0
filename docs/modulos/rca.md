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
