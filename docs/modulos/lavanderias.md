# Lavanderías Sierra Gorda

Plataforma de **trazabilidad de bolsas** de ropa entre las lavanderías de Sierra
Gorda y la empresa que retira las prendas lavadas. Cuando hay un reclamo (pérdida,
daño, mal lavado), se busca el **código** de la bolsa y aparece su contenido
registrado.

> **Diseñada para independizarse.** Vive en su propio esquema Postgres
> `lavanderias` (no en `public`) y sin llaves foráneas a otros módulos, así se
> exporta y migra sola con `pg_dump -n lavanderias`. Hoy es parte del sistema AM;
> mañana puede ser su propia base.

## Arquitectura

- **Datos:** esquema `lavanderias` (tablas `empresas`, `usuarios`, `contratos`,
  `bolsas`, `bolsa_items`, `prendas_catalogo`). RLS activa **sin políticas** →
  nadie las lee por la API directa.
- **API:** funciones `public.lav_*` (SECURITY DEFINER) son la única puerta a esos
  datos. El frontend llama `SB.rpc('lav_*')`. Esto también sirve de base para la
  API a sistemas externos (Fase 2).
- **Login:** reusa Supabase Auth. El mapeo usuario→empresa vive en
  `lavanderias.usuarios`. El acceso al módulo se controla con el slug
  **`lavanderias`** (lo aprueba el admin en el panel de siempre).

## El código de la bolsa

`lavanderias.nuevo_codigo()` genera **3 letras (A-Z) + 4 dígitos (1-9)** mezclados
al azar (7 caracteres, ej. `A9Y52T8`). Es **único entre las bolsas vigentes**; a
los **3 meses** la bolsa vence (`expira_at`) y el código se puede **reutilizar**
(el dato queda para historial).

## RPCs (Fase 1)

| Función | Rol | Qué hace |
|---|---|---|
| `lav_mi_acceso()` | authenticated | Estado del que llama: anon / no_registrado / pendiente / aprobado, rol y empresa. |
| `lav_registrar(empresa, correo)` | authenticated | Crea la empresa (lavandería) + su usuario tras el signUp. Queda pendiente. |
| `lav_contrato_crear(nombre, numero, retira)` | authenticated | Crea un contrato de la empresa. |
| `lav_contratos()` | authenticated | Lista los contratos de la empresa (admin ve todos). |
| `lav_catalogo(categoria)` | authenticated | Prendas de `'cama'` o `'trabajo'` (global + de la empresa). |
| `lav_bolsa_crear(contrato, items, kilos)` | authenticated | Genera el código, guarda items y kilos. Devuelve el código. |
| `lav_bolsas(contrato)` | authenticated | Lista las bolsas de un contrato. |
| **`lav_buscar(codigo)`** | **anon** | **Búsqueda pública**: lavandería, fecha/hora, prendas y kilos. |

## Páginas

- **`buscar.html`** — pública, sin login: barra para poner el código → muestra la
  lavandería, fecha/hora, listado de prendas por categoría, kilos, y **exporta PDF**.
- **`index.html`** — la app de la lavandería: login/registro (con datos de la
  empresa) → contratos → crear bolsa con sumadores (verde suma, rojo resta) de
  ropa de cama/trabajo, buscador de prendas, "agregar otra prenda", kilos y
  Finalizar → genera el código. La aprobación la hace el admin en su panel de
  siempre (marca el acceso 🧺 Lavanderías). Ya registrado en el Home
  (`config/modules.config.js`) y el slug en CLAUDE.md §5.

- **`admin.html`** — panel del administrador del sistema (solo `es_admin`):
  **métricas** (bolsas, prendas y kilos por lavandería, con detalle por prenda) y
  **catálogo de prendas** (agregar/quitar prendas de cama/trabajo, globales o por
  lavandería). Ese catálogo es el que valida «agregar prenda» en la app. RPCs
  `lav_admin_metricas / lav_admin_empresas / lav_admin_catalogo /
  lav_admin_prenda_crear / lav_admin_prenda_borrar`. Al abrir `index.html`, un
  admin es enviado a este panel.

## Pendiente (Fase 2)

- **API para sistemas externos** de las lavanderías (llaves por empresa) para que
  se vinculen a sus propios sistemas.
