# Módulo: Gestión de usuarios

| | |
|---|---|
| **id** | `admin` |
| **Slug de acceso** | ninguno — solo `rol === 'admin'` (bypasea `tiene_acceso()`) |
| **Ruta** | `modules/admin/index.html` |
| **En el Home** | **No** — se entra por URL directa, igual que `movil`/`mgi`/las 3 faenas |
| **Estado** | Activo · en producción |
| **Archivos** | `index.html` · `admin.css` · `admin.js` |

## Qué problema resuelve

Aprobar o rechazar las solicitudes de acceso al sistema (`aprobar_usuario_v2`,
`rechazar_usuario`, `listar_solicitudes`).

Antes vivía dentro de `modules/proveedores/`, un archivo de más de 8.000
líneas dedicado a otra cosa — para administrar accesos había que entrar a
Proveedores. Se sacó a un módulo propio (P-7, `docs/PENDIENTES.md`).

## Por qué no está en el Home

P-7 originalmente pedía "visible en el Home solo si `rol === 'admin'`", pero
el Home no tiene ninguna lógica de sesión (lee `config/modules.config.js` y
pinta botones a cualquiera — ver P-3). Condicionar el Home por rol hubiera
requerido resolver P-3 primero, que es un cambio de comportamiento aparte y
no aprobado en este cambio.

En su lugar se usa el mismo patrón que ya tienen `movil`/`mgi`/las 3 faenas:
`visibleEnHome: false`. Dentro de Proveedores aparece un link "👤 Usuarios"
en la barra superior, visible únicamente cuando `ES_ADMIN_ACTUAL` es `true`
(ese chequeo ya existía).

## Cómo funciona

Login propio vía `shared/js/auth-guard.js`, con el modo `adminOnly: true`
(agregado en este cambio): sin slug de acceso, entra solo si el JWT trae
`rol === 'admin'`. No tiene formulario de registro — nadie se auto-asigna
admin.

Doble protección, como en todo el sistema (`CLAUDE.md` §3): aunque alguien
abriera la consola y llamara a `aprobar_usuario_v2` directo, la función en sí
revisa `es_admin()` del lado del servidor y devuelve `NO_AUTORIZADO` si no lo
es.

## Sensibilidad de los datos

Alta: nombres, correos y estado de solicitud de cada persona que pidió
acceso al sistema.
