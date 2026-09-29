# Sistema de Lavanderías Sierra Gorda — Manual de funcionamiento

> Documento en dos niveles.
> **Nivel 1** — para entender el flujo completo sin ser informático (lectura general).
> **Nivel 2** — para un informático: cómo se guarda la información, cómo instalarlo
> para que funcione de forma independiente y cómo usar la API.
>
> Última actualización: 29-09-2026.

---

# NIVEL 1 — Cómo funciona (explicación general)

## 1. Para qué sirve

Es un sistema de **trazabilidad de bolsas de ropa** para las lavanderías que operan
en Sierra Gorda. Cada bolsa de ropa (de trabajo o de cama) que entra a lavado se
registra con su **contenido** (qué prendas y cuántas) y recibe un **código único de
7 caracteres**. Con ese código, cualquiera puede consultar después qué contenía la
bolsa y a qué lavandería pertenece. El objetivo es que **nunca haya dudas** sobre
qué se entregó, cuánto y de quién.

## 2. Quiénes participan (los tres roles)

1. **Administrador AMSA** — la persona de Relaciones Comunitarias que supervisa todo.
   Aprueba a las lavanderías, ve las métricas y administra el catálogo de prendas.
2. **La lavandería** — la empresa que recibe la ropa. Crea sus contratos y registra
   las bolsas con su contenido.
3. **Quien consulta** — cualquier persona (un trabajador, un supervisor de faena)
   que tiene un código de bolsa y quiere ver qué contenía. **No necesita cuenta ni
   contraseña**: entra a una página pública, escribe el código y ve el resultado.

## 3. El flujo, paso a paso

### Paso 1 — Se crea (registra) una lavandería
La lavandería entra al sistema, se registra con sus datos (nombre, RUT, dirección,
contacto) y queda en estado **«pendiente»**. Todavía no puede operar.

### Paso 2 — El administrador la aprueba
El administrador AMSA revisa la solicitud y la **aprueba**. Desde ese momento la
lavandería queda **«aprobada»** y ya puede crear contratos y registrar bolsas.
(Si algo no cuadra, puede quedar «rechazada».)

### Paso 3 — La lavandería crea un contrato
Un **contrato** es simplemente el marco bajo el cual se agrupan las bolsas: un
nombre, un número y a quién se le retira/entrega la ropa. Sirve para ordenar las
bolsas por cliente o por faena.

### Paso 4 — Se crea una bolsa (y nace su código)
Al recibir ropa, la lavandería crea una **bolsa**: elige el contrato, marca las
prendas del **catálogo** (por ejemplo *Pantalón Mezclilla ×3*, *Cobertor 2 Plaza ×1*)
y opcionalmente anota los kilos. Al guardar, el sistema:
- genera un **código único de 7 caracteres** (3 letras + 4 números, mezclados, por
  ejemplo `A3B7K92`),
- guarda el **detalle completo** de prendas y cantidades,
- registra **fecha y hora** y qué lavandería la creó.

Ese código se **imprime/pega en la bolsa física**. Es la «matrícula» de la bolsa.

### Paso 5 — Se consulta una bolsa
Cualquiera con el código entra a la **página pública de búsqueda**, escribe los 7
caracteres y ve: la lavandería, la fecha, los kilos, el total de prendas y el
**detalle por prenda**. Puede descargarlo en PDF. No hace falta iniciar sesión.

## 4. Cómo y dónde se guarda la información

- Toda la información vive **en la nube** (base de datos Supabase), no en el
  computador ni en la tableta. Si se pierde el equipo, **no se pierde ningún dato**.
- Cada bolsa guarda: código, lavandería, contrato, fecha, kilos y el detalle de
  prendas. Nada se guarda «suelto» en el navegador.
- **Los códigos vencen a los 3 meses.** Una bolsa consultada después de 3 meses ya no
  aparece en la búsqueda pública (se considera un ciclo cerrado), y el código puede
  volver a usarse en una bolsa nueva. Esto mantiene el sistema liviano y evita
  confusiones entre bolsas viejas y nuevas.
- El **catálogo de prendas** (hoy 50 de ropa de trabajo y 23 de ropa de cama) es
  común a todas las lavanderías y lo mantiene el administrador. Cada lavandería puede,
  además, agregar prendas propias si lo necesita.

## 5. Pensado para tabletas

La interfaz está **diseñada para trabajar desde una tableta** en el mostrador de la
lavandería: botones grandes, campos cómodos para el dedo y buscador de prendas. No
requiere instalar ninguna aplicación: **funciona dentro del navegador**.

### Dejarlo como «acceso directo» en Chrome (tableta o computador)
Para que se abra como si fuera una app, con su propio ícono:

- **Android / Chrome:** abrir el sistema en Chrome → menú **⋮** → **«Agregar a
  pantalla de inicio»** (o «Instalar app»). Queda un ícono en el escritorio de la
  tableta que abre directo el sistema, a pantalla completa.
- **iPad / Safari:** botón **Compartir** → **«Agregar a pantalla de inicio»**.
- **Computador / Chrome:** menú **⋮** → **«Guardar y compartir» → «Crear acceso
  directo»** (marcar «Abrir como ventana»).

Se recomienda dejar **dos accesos directos**: uno a la **página de la lavandería**
(para registrar bolsas, requiere sesión) y otro a la **página pública de búsqueda**
(para consultar, sin sesión).

---

# NIVEL 2 — Documentación técnica (para informático)

## 1. Arquitectura general

- **Frontend:** HTML + CSS + JavaScript **vanilla**, sin framework y **sin paso de
  compilación**. Se editan archivos y se publican. (Ver `CLAUDE.md` del repositorio.)
- **Backend:** **Supabase** (PostgreSQL + Auth + RLS). **No hay servidor propio ni
  funciones serverless**: el navegador habla directo con Supabase usando la `anon key`
  pública, y toda la seguridad real está en las **políticas RLS** y en funciones
  `SECURITY DEFINER` (RPCs). El frontend solo esconde botones; no protege datos.
- **Hosting:** Vercel, sitio 100 % estático.
- La `anon key` es pública por diseño (corre en el navegador). La `service_role` key
  **nunca** debe estar en el repo ni en el navegador.

Proyecto Supabase actual: `https://txshloeobpolanyedlva.supabase.co`

## 2. Archivos del módulo

```
modules/lavanderias/
├── index.html            App de la lavandería (registrar/ver bolsas). Requiere sesión.
├── lavanderias.js        Lógica de la app de la lavandería.
├── lavanderias.css       Estilos (compartidos por las 3 páginas).
├── admin.html            Panel del administrador AMSA. Requiere slug 'lavanderias' o admin.
├── lavanderias-admin.js  Lógica del panel admin (empresas, catálogo, métricas, API keys).
├── buscar.html           Página PÚBLICA de búsqueda por código. Sin sesión.
└── buscar.js             Lógica de la búsqueda pública.
```

La app de la lavandería y el panel admin usan `shared/js/auth-guard.js` para el login.
La página `buscar.html` es anónima.

## 3. Modelo de datos (schema `lavanderias`)

Todas las tablas viven en el **schema `lavanderias`** (no en `public`) y tienen **RLS
activo**.

| Tabla | Qué guarda | Notas |
|---|---|---|
| `empresas` | Cada lavandería (nombre, razón social, RUT, dirección, contacto). | `empresa_id` = `lav_xxxxxxxxxx`. |
| `usuarios` | Vincula un usuario de Auth (`user_id`) con su empresa y su estado. | `estado`: `pendiente` / `aprobado` / `rechazado`. `rol`: `lavanderia`. |
| `prendas_catalogo` | Catálogo de prendas por categoría (`cama` / `trabajo`). | `empresa_id NULL` = global (lo mantiene el admin); `NOT NULL` = propia de una lavandería. |
| `contratos` | Contratos bajo los que se agrupan las bolsas. | Enlaza empresa que entrega y quien retira. |
| `bolsas` | Cada bolsa: `codigo`, contrato, empresa, kilos, `total_prendas`, fechas. | `expira_at` = `created_at + 3 meses`. |
| `bolsa_items` | Detalle de la bolsa: `categoria`, `prenda_nombre`, `cantidad`. | Guarda el **nombre como texto** (no FK al catálogo) → el historial no se rompe si el catálogo cambia. |
| `api_keys` | Llaves de API por lavandería para sistemas externos. | `api_key` única; `activo`; `last_used_at`. |

**Índices relevantes:** `bolsas(codigo)`, `bolsas(expira_at)`, `bolsa_items(bolsa_id)`,
`bolsas(contrato_id)`.

## 4. Seguridad y roles

- El acceso a los módulos se decide por un **slug** en el JWT del usuario
  (`app_metadata.accesos`), validado en las políticas RLS con `tiene_acceso('<slug>')`.
  El slug de este módulo es **`lavanderias`** (app de la lavandería y panel admin).
- La **página pública `buscar.html` no usa slug**: consulta con la `anon key` mediante
  una función con `GRANT EXECUTE` a `anon` (ver `lav_buscar`).
- Un usuario `admin` (rol maestro) pasa todos los chequeos sin tener el slug.
- El flujo de aprobación: la lavandería se registra (`estado='pendiente'`) y el
  administrador la aprueba. Una lavandería no aprobada no puede crear contratos ni
  bolsas (lo imponen las RPC/RLS, no el frontend).

## 5. Generación del código de bolsa

Función `lavanderias.nuevo_codigo()`:
- **3 letras** `A–Z` + **4 dígitos** `1–9` (sin 0 para evitar confusión con la O),
  **mezclados** aleatoriamente → 7 caracteres, p. ej. `A3B7K92`.
- Debe ser **único entre las bolsas vigentes** (`expira_at > now()`). Reintenta hasta
  300 veces; si no logra uno único, lanza excepción.
- **A los 3 meses el código se libera** y puede reutilizarse en una bolsa nueva. Por
  eso las búsquedas y la unicidad siempre filtran por `expira_at > now()`.

## 6. RPCs internas (usadas por el frontend, requieren sesión)

Todas son `SECURITY DEFINER` con `search_path` fijo. Se llaman con
`SB.rpc('<nombre>', {...})`.

| RPC | Para qué |
|---|---|
| `lav_mi_acceso()` | Devuelve el acceso/rol del usuario actual. |
| `lav_registrar(p_empresa jsonb, p_correo text)` | Registra la lavandería + su usuario (`pendiente`). |
| `lav_empresa_guardar(p_empresa jsonb)` | Actualiza los datos de la empresa. |
| `lav_contrato_crear(p_nombre, p_numero, p_retira_nombre)` | Crea un contrato. |
| `lav_contratos()` | Lista los contratos de la empresa. |
| `lav_catalogo(p_categoria)` | Devuelve las prendas de una categoría (`cama`/`trabajo`). |
| `lav_bolsa_crear(p_contrato_id, p_items jsonb, p_kilos numeric)` | Crea una bolsa y devuelve su código. |
| `lav_bolsas(p_contrato_id)` | Lista las bolsas de un contrato. |
| `lav_buscar(p_codigo)` | **Búsqueda pública** (grant a `anon`); solo bolsas no vencidas. |

**Panel admin:** `lav_admin_empresas`, `lav_admin_lavanderias`,
`lav_admin_lavanderia_borrar`, `lav_admin_catalogo`, `lav_admin_prenda_crear`,
`lav_admin_prenda_borrar`, `lav_admin_metricas`, `lav_admin_keys`,
`lav_admin_key_crear`, `lav_admin_key_borrar`.

## 7. API para sistemas externos

Pensada para que una lavandería con **su propio software** (ERP, balanza, etiquetadora)
integre el registro y la consulta sin usar la interfaz web. Se autentica con una
**API key** que el administrador genera para esa lavandería
(`lav_admin_key_crear`). La llave identifica a la empresa vía
`lavanderias.empresa_por_key()` (mínimo 12 caracteres, marca `last_used_at`).

Las funciones de API tienen `GRANT EXECUTE` a `anon`, así que se llaman como cualquier
RPC de Supabase (endpoint REST `/rest/v1/rpc/<fn>`), pasando **siempre** la `api_key`
propia como primer parámetro `p_key`.

### Endpoints

| RPC | Parámetros | Devuelve |
|---|---|---|
| `lav_api_contratos(p_key)` | — | `{ ok, contratos:[{contrato_id,nombre,numero}] }` |
| `lav_api_bolsa_crear(p_key, p_contrato_id, p_items, p_kilos)` | `p_items`=`[{categoria,nombre,cantidad}]` | `{ ok, codigo, bolsa_id, total }` |
| `lav_api_buscar(p_key, p_codigo)` | — | `{ ok, codigo, creado_at, kilogramos, total_prendas, items:[…] }` |

Errores posibles: `{"error":"llave_invalida"}`, `{"error":"contrato_invalido"}`,
`{"error":"no_encontrado"}`.

### Cabeceras HTTP (todas las llamadas)

```
apikey: <ANON_KEY del proyecto>
Content-Type: application/json
```

> La `anon key` identifica al **proyecto**; la `api_key` (en el cuerpo, `p_key`)
> identifica a la **lavandería**. Son dos cosas distintas y ambas son necesarias.

### Ejemplos `curl`

Listar contratos de la lavandería:
```bash
curl -X POST 'https://txshloeobpolanyedlva.supabase.co/rest/v1/rpc/lav_api_contratos' \
  -H 'apikey: <ANON_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"p_key":"<API_KEY_DE_LA_LAVANDERIA>"}'
```

Crear una bolsa (devuelve el código a imprimir):
```bash
curl -X POST 'https://txshloeobpolanyedlva.supabase.co/rest/v1/rpc/lav_api_bolsa_crear' \
  -H 'apikey: <ANON_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "p_key":"<API_KEY_DE_LA_LAVANDERIA>",
    "p_contrato_id":"<CONTRATO_ID>",
    "p_kilos":12.5,
    "p_items":[
      {"categoria":"trabajo","nombre":"Pantalón Mezclilla","cantidad":3},
      {"categoria":"cama","nombre":"Cobertor 2 Plaza","cantidad":1}
    ]
  }'
```

Consultar una bolsa por su código:
```bash
curl -X POST 'https://txshloeobpolanyedlva.supabase.co/rest/v1/rpc/lav_api_buscar' \
  -H 'apikey: <ANON_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"p_key":"<API_KEY_DE_LA_LAVANDERIA>","p_codigo":"A3B7K92"}'
```

## 8. Instalación / migración para que funcione de forma independiente

El sistema es portable porque son **archivos estáticos + un proyecto Supabase**. Para
levantarlo aparte (otro cliente, otro entorno) sin depender de la instalación actual:

**A. Base de datos (Supabase propio)**
1. Crear un proyecto Supabase nuevo (Postgres + Auth).
2. Aplicar las migraciones del repo, en `database/migraciones/`, en orden por fecha.
   Las de lavanderías son:
   - `2026-09-22_lavanderias_plataforma.sql` — schema, tablas, RLS, catálogo inicial.
   - Las migraciones de funciones/RPC (`lavanderias_funciones_rpc`,
     `lavanderias_admin_rpc`, `lavanderias_api_keys`) — funciones, RPCs y grants.
   - `2026-09-29_lavanderias_catalogo_reemplazo.sql` — catálogo vigente (73 prendas).
   > El archivo `2026-09-22_lavanderias_plataforma.sql` incluye, en comentarios, el
   > resumen de las funciones ya aplicadas; el detalle canónico está en Supabase. Para
   > un entorno nuevo conviene **exportar las funciones actuales**
   > (`pg_get_functiondef`) y versionarlas como un `.sql` de creación.
3. Verificar los grants: `lav_buscar`, `lav_api_buscar`, `lav_api_bolsa_crear`,
   `lav_api_contratos` deben tener `EXECUTE` para `anon`; el resto solo `authenticated`.
4. Confirmar que las funciones `SECURITY DEFINER` tengan `SET search_path` fijo (ya lo
   traen) y que **RLS esté activo** en las 7 tablas.

**B. Frontend (Vercel u otro estático)**
1. Editar `config/supabase.config.js` con la **URL** y la **anon key** del proyecto
   nuevo.
2. Publicar el sitio estático (Vercel: push a `main`; o cualquier hosting estático).
   `.vercelignore` excluye `database/` y `docs/` — mantenerlo así (los `.sql` traen el
   esquema y funciones de seguridad; no deben quedar públicos).
3. Rutas: `modules/lavanderias/index.html` (app), `admin.html` (admin),
   `buscar.html` (búsqueda pública).

**C. Primer arranque**
1. Crear el **usuario administrador** en Auth y asignarle el slug `lavanderias` (o rol
   `admin`).
2. Registrar la primera lavandería y aprobarla desde el panel admin.
3. (Opcional) Generar su **API key** si va a integrar un sistema externo.

**Independencia de terceros en tiempo de ejecución:** el sistema solo depende de
Supabase y de librerías por CDN fijadas a versión exacta (Supabase JS 2.110.7, jsPDF
2.5.1). No hay analytics ni servicios externos. Si se requiere independencia total del
CDN, descargar esas dos librerías y servirlas desde el propio hosting.

## 9. Cómo desarrollarlo para que dure 5 años

- **Fijar versiones de librerías** (ya está: versión exacta, nunca rangos `@2`). Un
  rango haría que el CDN sirva una versión nueva sin avisar y podría romper en
  producción.
- **Mantener el stack simple** (vanilla + Supabase). Sin framework no hay que migrar
  cada 1–2 años por obsolescencia de dependencias.
- **No usar `type="module"` ni IIFE con ámbito propio**: los botones dependen de
  funciones globales (`onclick`). Migrar eso exigiría reescribir el HTML.
- **Respaldos automáticos:** activar snapshots/backups periódicos del proyecto
  Supabase. Guardar además un export mensual de `bolsas` + `bolsa_items` (histórico).
- **Ciclo de vida de datos:** los códigos vencen a los 3 meses, pero las **filas
  permanecen**. Para 5 años conviene una tarea de archivado/purga de bolsas vencidas
  (p. ej. mover a una tabla histórica anual) para mantener las tablas activas livianas.
- **Rotación de API keys:** revisar `last_used_at`, desactivar llaves sin uso y rotar
  las activas periódicamente. Nunca exponer la `service_role`.
- **Catálogo mantenido por el admin:** las prendas se actualizan desde el panel, sin
  tocar código. Al cambiar el catálogo, el historial no se rompe porque `bolsa_items`
  guarda el nombre como texto.
- **Monitoreo del plan Supabase:** vigilar límites de almacenamiento/consultas y subir
  de plan antes de topar. Revisar que RLS siga activo tras cualquier migración.
- **Documentación viva:** mantener este archivo y `docs/modulos/lavanderias.md`
  actualizados con cada cambio de esquema o RPC.

---

## Resumen de una línea

Una lavandería aprobada crea bolsas; cada bolsa recibe un **código único de 7
caracteres** con su contenido; **cualquiera consulta ese código** en una página
pública; todo se guarda en **Supabase con RLS**; los códigos **vencen a los 3
meses**; y hay una **API con llave por lavandería** para integrar sistemas externos.
Funciona en el navegador, pensado para **tabletas**, y puede dejarse como **acceso
directo en Chrome**.
