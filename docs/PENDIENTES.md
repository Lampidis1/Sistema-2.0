# Pendientes y deuda técnica

Todo lo que se detectó al reorganizar el proyecto y **no se tocó**, por la
Regla 1 (`CLAUDE.md` §3): no cambiar el comportamiento sin que lo pidan.

Cada punto se decide y se aplica por separado. Los marcados 🟢 ya están
resueltos y se dejan documentados porque explican por qué el código quedó como
quedó.

Estado: 🔴 sin decidir · 🟡 aprobado, sin hacer · 🟢 resuelto

---

## Seguridad y privacidad

### P-1 · 🟢 RESUELTO — P-1a y P-1b aplicados (2026-08-05)

> **P-1a EJECUTADO EN PRODUCCIÓN el 2026-08-05.** La enumeración anónima quedó
> cerrada: `doc_public_read` fue reemplazada por `doc_auth_read`, restringida a
> `to authenticated` + `es_aprobado()`.
>
> **Verificado contra la base real, antes y después:**
>
> | Prueba (solo con la `anon key`, sin cuenta) | Antes | Después |
> |---|---|---|
> | `list()` en la raíz del bucket | `fichas`, `minutas`, `visitas` | `[]` |
> | `list()` sobre `fichas` y sobre `minutas` | devolvía contenido | `[]` |
>
> Reversión: `backups/2026-08-05/01-politicas-storage-ANTES-de-P1.sql`.
>
> **P-1b EJECUTADO EN PRODUCCIÓN el 2026-08-05, después de desplegar el
> frontend con URLs firmadas** (commit `3d0e0cd`, verificado en
> `sistema-2-0.vercel.app` antes de tocar la base — ver §"Alcance real de
> P-1b" abajo). El bucket `documentos` quedó `public = false`.
>
> **Verificado contra la base real con un archivo real (no inventado):**
>
> | Prueba | Antes | Después |
> |---|---|---|
> | `GET /object/public/documentos/fichas/re_/mr53cyk6_cpt4r3.jpg` (sin sesión) | 200, descargaba el archivo | `400` |
> | `createSignedUrl()` con la `anon key`, sin sesión | — | `404 Object not found` (RLS enmascara como no-encontrado; es el comportamiento esperado de Supabase Storage) |
>
> No rompió nada: `subirArchivo()`/`subirArchivoMGI()` siguen usando
> `getPublicUrl()` para construir la ruta (el formato de URL guardado no
> cambió, no hubo backfill), y cada punto de lectura/exportación firma esa
> URL al momento de usarla con `createSignedUrl()`. Reversión de P-1b:
> `update storage.buckets set public = true where id = 'documentos';`.

**Dónde (histórico, ya corregido):** `database/setup_database.sql:566` y `:571`

```sql
values ('documentos','documentos', true)          -- ← bucket público
...
create policy doc_public_read on storage.objects for select
using (bucket_id = 'documentos');                 -- ← sin cláusula `to`, sin auth
```

Son **dos agujeros distintos**, y conviene no confundirlos:

**(a) Enumeración anónima.** La política de `select` no tiene cláusula `to`,
así que aplica al rol `public`, que incluye a `anon`. Como la `anon key` es
pública por diseño (va en `config.js` y en cada navegador), cualquiera puede
llamar a `storage.from('documentos').list()` y **listar el bucket completo**,
sin cuenta. No hace falta adivinar ninguna URL.

**(b) Descarga sin sesión.** El bucket es `public = true` y el frontend arma
las URLs con `getPublicUrl()`, que son permanentes y sin firmar. Quien tenga
el enlace descarga el archivo, aunque no tenga cuenta.

**Por qué importa:** ahí viven minutas de visitas, fotos de fichas de
proveedores y PDFs de licitaciones.

**Arreglo — en dos pasos, en este orden:**

| Paso | Script | Rompe algo | Cierra |
|---|---|---|---|
| **P-1a** | `database/migraciones/2026-07-21_p1a_bloquear_listado_anonimo.sql` | **No** | (a) enumeración |
| **P-1b** | `database/migraciones/2026-07-21_p1b_bucket_privado.sql` | Sí, si se ejecuta antes de desplegar el frontend | (b) descarga |

P-1a es seguro porque el frontend **solo usa `upload()` y `getPublicUrl()`** —
nunca `list()`, `download()` ni `remove()`. Verificado en los 7 módulos.

La política de P-1a exige `es_aprobado()`, no solo `to authenticated`. Motivo:
`signUp()` está expuesto en **los 7 módulos**, o sea que el registro es
abierto. Una cuenta recién creada tiene JWT con rol `authenticated` aunque
quede pendiente de aprobación, y sin ese filtro bastaría con registrarse para
descargar todo el bucket.

#### Alcance real de P-1b — corregido: 3 archivos, no 4 módulos

Una primera auditoría incluía `empleabilidad` por error. Se verificó a mano:
su único `fetch()` es a `api.qrserver.com` (API externa de códigos QR para el
PDF del CV), no toca el bucket `documentos` en absoluto. `empleabilidad.js`
no tiene ningún `upload()`, `getPublicUrl()` ni columna `_url` de storage.

Los que sí consumen URLs de storage, y el fix aplicado en cada uno:

| Archivo | Dónde | Fix |
|---|---|---|
| `modules/proveedores/proveedores.js` | `_urlToBase64`, `openLightbox`, miniatura de visita, fotos de licitación, links de PDF/minuta (8 sitios) | `resolverUrlFirmada()` + `abrirFirmado()` |
| `modules/mgi/mgi.js` | `_urlToBase64MGI`, link de minuta, galería de fotos (5 sitios) | `resolverUrlFirmadaMGI()` + `abrirFirmadoMGI()` |
| `shared/js/faena-consulta.js` (Centinela/Antucoya/Zaldívar, solo lectura) | galería `<img>` + `fetch()` de exportación PDF (2 sitios) | `resolverUrlFirmadaFaena()` |

Las dos trampas que se tuvieron presentes al implementar:

1. **Un `<img src="...">` no lleva el JWT.** Se resolvió con `data-firmar="<url>"`
   + un `MutationObserver` que hidrata cada `<img>` insertada en el DOM,
   firmando la URL antes de asignar `src`.
2. **Los `fetch()` de exportación estaban envueltos en `.catch(()=>null)`**,
   así que fallarían en silencio. Se mantiene ese comportamiento (una foto
   que no carga no debe romper el PDF completo), pero ahora `fetch()` recibe
   la URL ya firmada, así que no debería fallar en el camino normal.

**No se guardó solo la ruta ni se hizo backfill.** Se evaluó y se descartó:
las URLs guardadas en la base siguen con el mismo formato de siempre
(`getPublicUrl()`); cada punto de lectura extrae la ruta por regex y la firma
al momento de usarla. Cero riesgo de dejar filas con URLs muertas.

---

### P-2 · 🟡 PARCIAL — panel de autoservicio agregado (2026-08-07)

> **Cambiado el 2026-07-21.** `saveDB()` ahora persiste únicamente preferencias
> (`tarifas`, `gsync`, `_inclHotel`) bajo la clave nueva `am_v6_prefs`.
> **El sistema dejó de escribir datos personales en el navegador.**
>
> **Lo que falta:** el volcado antiguo (`am_v6_db`) sigue en los equipos que ya
> lo tienen. `loadDB()` lo **lee** pero no lo reescribe, así que está congelado
> y deja de crecer. **No se borra**, y la razón es importante:

#### ⚠️ Corrección de un diagnóstico previo — casi provoco pérdida de datos

Una primera versión de este arreglo borraba `am_v6_db` al arrancar, apoyada en
la afirmación de que todo se repoblaba desde Supabase. **Esa afirmación era
falsa.** Una auditoría posterior lo desmintió y se verificó a mano:

| Campo | ¿Se repuebla desde Supabase? |
|---|---|
| `contactos`, `acuerdos`, `programas`, `licitaciones` | Sí, en `hydrateFromSupabase()` |
| `hoteles` | Sí, pero por merge (`DB.hoteles \|\| {}`), no por reset |
| `tarifas`, `gsync`, `_inclHotel` | Sí, siguen en `am_v6_prefs` |
| **`visitas`** | **NO. No existe en ninguna tabla.** |
| **`_eliminados`** | **NO.** |
| **`usuarioActual`** | **NO.** |

`DB.visitas` **solo existe en el navegador**. Son visitas históricas con fotos
en base64 incrustadas, sin ninguna copia en Supabase. Borrarlas habría sido
irreversible, y además se leen todavía: alimentan el panel de visitas del
dashboard y el badge "sin visitar" de cada ficha. Al borrarlas, el panel
quedaba vacío y **todos** los proveedores pasaban a "sin visitar".

Por eso no se borran. (Después, al arreglar los indicadores en P-14, se dejó
además de leerlas: ver abajo.)

#### El histórico ya no se usa para nada (2026-07-21)

Al investigar qué eran esas visitas se descubrió que **el sistema viejo de
visitas está muerto**: `guardarVisita`, `toggleFormVisita`, `setFotoV` y
`renderVisitas` solo se llaman entre ellas, ningún botón las invoca. La
pestaña "Visitas" de cada ficha va a `montarVisitasV3`, que usa la tabla
`visitas` de Supabase.

O sea que ese histórico está congelado desde la migración a V3, y los dos
indicadores del dashboard que lo leían **estaban mostrando datos obsoletos**
(ver más abajo, ya corregido).

**Estado actual del volcado `am_v6_db`:**

- El sistema **no escribe** nada en él.
- Ya **no se leen** las visitas de ahí: el dashboard usa Supabase.
- Solo se rescatan `_eliminados`, `hoteles` y `usuarioActual`, que cubren
  casos borde y no viven en ninguna otra parte.
- **No se borra.** Contiene visitas históricas con fotos en base64 sin copia
  en ninguna tabla; borrarlo sería irreversible.

#### Cómo cerrar P-2 del todo

> **2026-08-07 — no se puede cerrar desde acá.** El dato que hay que purgar
> vive en `localStorage` de equipos de terreno específicos — no está en
> Supabase, no hay ninguna consulta que lo mida o lo borre en forma remota.
> Solo quien esté sentado frente a esa máquina puede hacerlo.
>
> **Lo que sí se hizo:** un panel de autoservicio dentro de Proveedores
> (botón **"🗄️ Histórico local"**, junto a "Resetear local" en el header)
> para que cualquiera pueda hacerlo con un par de clics en vez de pegar
> código en la consola del navegador. Mide proveedores con visitas, total de
> visitas, cuántas tienen fotos y la fecha más reciente; ofrece
> **"📥 Descargar respaldo (JSON)"** (siempre disponible); y solo habilita
> **"🗑 Borrar histórico local"** después de haber descargado — salvo que ya
> esté vacío, en cuyo caso se habilita directo. El borrado solo toca
> `am_v6_db`, no las preferencias actuales (`am_v6_prefs`) ni la sesión.
>
> Funciones nuevas en `proveedores.js`: `abrirHistoricoLocal()`,
> `_histLocalResumen()`, `descargarHistoricoLocal()`,
> `borrarHistoricoLocal()`. Verificado con datos simulados, en aislamiento
> (sin tocar ningún dato real): el resumen calcula bien proveedores/
> visitas/fotos/fecha más reciente; `borrarHistoricoLocal()` se rechaza si
> hay datos y no se descargó antes; se habilita tras descargar; y el caso
> "ya está vacío" habilita el borrado sin exigir descarga.
>
> **Sigue sin poder cerrarse del todo:** hace falta que alguien lo corra en
> cada equipo de terreno que tenga el histórico viejo. Eso no es una tarea
> de código — es coordinación con la gente que usa esas máquinas.

`resetearDatos()` sigue existiendo y también borra `am_v6_db` (entre otras
cosas), pero sin la opción de descargar antes — para eso está el panel
nuevo.

**Descripción original del problema:**

**Dónde:** `modules/proveedores/index.html:1364-1365` (guardar) y `:1373` (leer)

```js
async function saveDB(){
  try{ await window.storage.set('am_v6_db', ...); }
  catch(e){ try{ localStorage.setItem('am_v6_db', JSON.stringify(DB)); }catch(e2){} }
}
```

`window.storage` **no está definido en ninguna parte del proyecto**. No lo
define el archivo, ni ninguna de las 7 librerías CDN. O sea que
`window.storage.set(...)` lanza `TypeError` siempre, se va al `catch`, y el
`localStorage` **no es un fallback: es el camino real, el 100% de las veces**.

Lo que queda escrito en texto plano en el navegador: `visitas`, `hoteles`,
`acuerdos`, `programas`, `licitaciones` y `contactos`.

**Por qué importa:** contradice directamente la Regla 5. En un equipo
compartido de faena, la persona siguiente abre la consola y lee todo, sin
credenciales. Y como es `localStorage`, sobrevive a cerrar sesión.

**Arreglo:** decidir si esa caché local se necesita de verdad. Si no, eliminar
`saveDB`/`loadDB` y leer siempre de Supabase. Si sí, limitarla a datos no
personales y limpiarla al cerrar sesión.

> `resetearDatos()` (`:4967`) ya la borra, pero es un botón manual que hay que
> saber apretar.

---

### P-3 · 🟡 PARCIAL — resuelto para ocultar (2026-08-06); nunca revela

`index.html` no tenía autenticación. Mostraba las tarjetas de Proveedores y
Empleabilidad a quien abriera la URL, sin mirar quién es.

> **Tensión real con `CLAUDE.md` §7** ("el Home no tiene lógica"): filtrar
> por sesión **es lógica**, aunque sea liviana y sin red. Se decidió con el
> dueño del proyecto un alcance acotado: **el Home solo oculta, nunca
> revela.** Las 2 tarjetas visibles hoy (`proveedores`, `empleabilidad`) se
> ocultan si existe una sesión que no da acceso a ellas. Los 6 módulos ya
> ocultos (`movil`, `mgi`, `admin`, las 3 faenas) siguen ocultos siempre,
> sin importar el acceso real — se sigue entrando por URL directa, sin
> cambio ahí. Un filtro completo (mostrar todo lo que corresponda, `Home`
> como dashboard personalizado) quedó fuera de alcance — es una decisión de
> producto más grande, no solo un fix de seguridad.
>
> **Detalle técnico real:** no existe "la sesión" — cada uno de los 8
> módulos guarda la suya bajo su propia `storageKey` de Supabase
> (`am_v2_auth`, `am_emp_auth`, `am_mov_auth`, `am_mgi`,
> `am_pub_centinela/antucoya/zaldivar`, `am_admin_auth`). El Home lee las 8
> claves de `localStorage` directo (sin cargar Supabase, sin red) y
> decodifica el JWT de la primera que tenga un token no vencido — misma
> técnica que ya usan los módulos entre sí para leer `app_metadata`.
>
> **Sin sesión en ninguna de las 8 claves → se muestran ambas tarjetas,
> exactamente como antes.** Solo se oculta cuando hay una sesión real que
> confirma que esa cuenta no tiene el acceso.
>
> Se aprovechó para documentar en `config/modules.config.js` un
> comportamiento real no anotado antes (encontrado al investigar P-6):
> `empleabilidad` también se habilita con el slug `'principal'`, no solo
> `'movil'`. `accesoAlterno` ahora acepta un array.
>
> **Verificado** (inyección aislada, mismo método que P-6/P-7, sin tocar
> datos reales): sin sesión → 2 tarjetas; sesión con acceso solo a `mgi` →
> 0 tarjetas; sesión `rol:'admin'` → 2 tarjetas; sesión con solo `movil` →
> Empleabilidad sí, Proveedores no.
>
> `lector` no aparece como `acceso`/`accesoAlterno` de ningún módulo, así
> que el riesgo de "botón fantasma" que mencionaba este punto no llega a
> producirse con el alcance implementado.

---

### P-4 · 🟢 RESUELTO — `supabase-js` fijado a 2.110.7

Los 7 módulos cargan:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

`@2` significa "la última 2.x". El CDN puede servir una versión distinta
mañana, y el sistema en producción cambia sin que nadie toque el código.

Las otras 6 librerías sí están fijadas (jsPDF 2.5.1, xlsx 0.18.5, pdf.js
3.11.174, mammoth 1.6.0, Chart.js 4.4.0, pptxgenjs 3.12.0).

> **Resuelto el 2026-07-21.** Los 7 módulos cargan ahora
> `@supabase/supabase-js@2.110.7`.
>
> Se verificó antes de fijar que `@2` resolvía **exactamente** a esa versión:
> se descargaron ambas URLs del CDN y son byte a byte idénticas (208.014
> bytes, mismo md5). O sea que fijar no cambió nada hoy; solo impide que
> cambie solo mañana.
>
> **Al actualizar en el futuro:** cambiar el número en los 7 `index.html`,
> probar, y recién ahí desplegar. Nunca volver a `@2`.

---

### P-5 · 🔴 Google Fonts expone la IP de cada usuario

Las 8 páginas cargan tipografías desde `fonts.googleapis.com`, así que cada
usuario le entrega su IP y el referrer a Google al abrir el sistema.

**Arreglo:** descargar las fuentes a `shared/assets/fonts/` y servirlas desde
el propio dominio. No cambia nada visual.

---

## Estructura y mantenibilidad

### P-6 · 🟡 PARCIAL (cerrado en lo razonable) — fase 1 hecha, grupos B y C evaluados y descartados

Cada módulo trae su propia copia del bloque `signInWithPassword` +
`getSession`. Un bug de autenticación hay que arreglarlo en 7 archivos, y si
se olvida uno queda una puerta con comportamiento distinto.

**No son 7 copias idénticas — son 3 "dialectos" distintos.** Se comparó a
mano (archivo por archivo, con `diff`) antes de tocar nada:

| Grupo | Archivos | Patrón |
|---|---|---|
| **A — casi idénticos** | `movil.js` + `empleabilidad.js` | mismos IDs de DOM (`lgEmail`, `gateErr`...), misma lógica de acceso |
| **B — similares entre sí** | `mgi.js` + `faena-consulta.js` | IDs propios (`gEmail`, `gErr`...), flujo de "completar perfil" inline |
| **C — el outlier** | `proveedores.js` | IDs propios, restricción `@aminerals.cl`, y el panel de administración completo vive ahí adentro (ver P-7) |

**Fase 1 (hecha):** se extrajo el grupo A a `shared/js/auth-guard.js`,
parametrizado vía `window.AUTH_CFG` (mismo patrón que `FAENA_CFG` de
`faena-consulta.js`): `storageKey`, `slug`, `altSlugs`, los 3 parámetros de
`registrar_solicitud`, el texto de "contraseña muy corta", un
`onRegistroOk` opcional, y `onAcceso(user)` — el módulo hace ahí lo que le
es propio (qué mostrar, qué cargar).

Dos diferencias reales entre `movil` y `empleabilidad` que había que
preservar, no homogeneizar — se encontraron con un `diff` directo, no a
simple vista:
- El texto de "contraseña muy corta" es distinto entre los dos.
- `empleabilidad` muestra un `alert()` extra tras registrarse; `movil` no.

Ambos quedaron parametrizados en `AUTH_CFG`, cada módulo con su propio valor.

**Corregido de paso:** `empleabilidad` y `movil` conceden acceso también a
cualquiera con el slug `'principal'`, no solo entre ellos dos — es
comportamiento real en producción, no documentado en `CLAUDE.md` §5. Se
preservó tal cual (no se "corrigió"); solo se deja anotado acá.

**Grupo B (investigado 2026-08-06, sin tocar código):** se comparó
`mgi.js` contra `faena-consulta.js` función por función con `diff` directo,
aplicando el mismo criterio que en la fase 1 — extraer solo lo verificado
idéntico. El resultado: **casi nada calificó.**

| Función | ¿Idéntica de verdad? |
|---|---|
| `salir()` | Sí, byte a byte — la única 100% segura |
| `initSB()` | Casi: llama a `gateErr`/`gErr` — nombre de función **y** de `id` del DOM distintos entre grupos |
| `entrar()` | **No.** IDs de DOM distintos (`lgEmail` vs `gEmail`); el email se pasa a minúsculas en un lado y no en el otro; texto del botón distinto ("Ingresando…" vs "Verificando..."); el chequeo de credenciales inválidas es `includes('Invalid')` en un grupo vs comparación exacta `==='Invalid login credentials'` en el otro |
| `guardarPerfilPub()` | Casi: un mensaje de error trae `'Error: '+e.message`, el otro solo `e.message` |
| `trasLogin()` / `registrarse()` | **No.** Ver más abajo — flujo estructuralmente distinto |

Además, el flujo de "acceso denegado" **no es una variación de texto, es otro
flujo**: el grupo A (fase 1) muestra un panel estático de "pendiente" y
mantiene la sesión abierta; `mgi`/faenas hacen `signOut()` activo y muestran
un mensaje dinámico (con distinta granularidad entre sí: `mgi.js` distingue
2 casos, `faena-consulta.js` distingue 3, incluyendo el nombre de la faena).
`mgi.js` además hace un paso extra — vuelve a pedir la sesión y decodifica el
JWT a mano — que `faena-consulta.js` no tiene, probablemente corrigiendo un
bug puntual pasado. Y los nombres de función están invertidos entre los dos:
`mgi.js` usa `registrarse()`/`verReg()`, las 3 faenas usan
`registrarsePub()`/`verRegistro()`.

**Conclusión:** compartir solo `salir()` requeriría separar `SB`/`USER` de
una declaración `let` combinada con 6-8 variables propias en cada archivo, y
editar los 4 `index.html` para agregar las etiquetas `<script>` — demasiado
movimiento para una función de una línea que casi nunca cambia. **Se decide
no tocar el grupo B.** Si en el futuro se quiere revisitar, esta tabla ya
tiene el trabajo de comparación hecho — no hace falta rehacerlo.

**Grupo C — `proveedores.js` (investigado 2026-08-07, sin tocar código):**
con el panel de admin ya afuera (P-7) y el archivo más chico (P-8), se
reinvestigó si ahora calificaba. **No.** Es peor que el grupo B, no mejor:

- Usa un objeto `SUPA = {client, session}` en vez de las variables sueltas
  `SB`/`USER` que usan los otros 6 módulos — una diferencia de arquitectura
  que aparece **144 veces** en el archivo (`SUPA.client.from(...)` en cada
  llamada a Supabase). Migrar eso a un `SB` suelto es una reescritura
  mecánica de 144 sitios en 6.250 líneas — desproporcionado para compartir
  el login.
- `onSesionIniciada()` sigue siendo genuinamente propia: refresca el JWT
  con manejo de error particular, verifica denegación por **dos** motivos
  separados (no aprobado / no tiene `'principal'`), y tiene un respaldo vía
  RPC (`listar_solicitudes`) para confirmar si alguien es admin aunque el
  JWT local esté desactualizado. Nada de esto existe en los otros módulos.

Hallazgo menor de paso, sin tocar: `onSesionIniciada()` tiene una rama
`if(false){...}` — código muerto, nunca se ejecuta, duplica un mensaje que
ya cubren las dos ramas de arriba. Candidato para una futura limpieza tipo
P-13, no relacionado con esta decisión.

**Con los 3 grupos evaluados, P-6 se da por resuelto en lo que es
razonable resolver.** No se revisita sin que cambie la arquitectura de
`proveedores.js` (p. ej. si algún día se migra `SUPA.client` a `SB` suelto
por otro motivo).

⚠️ Al tocar `shared/js/auth-guard.js`, cargar con `<script src>` clásico.
**Nunca `type="module"`**: hay 457 `onclick=` en el HTML que dependen de que
las funciones sean globales.
Ver `CLAUDE.md` §6.

---

### P-7 · 🟢 RESUELTO (2026-08-06) — panel de admin movido a `modules/admin/`

`aprobar_usuario_v2`, la lista de pendientes y los rechazos vivían dentro de
`modules/proveedores/index.html`, un archivo de miles de líneas dedicado a
otra cosa. Para administrar accesos, el maestro tenía que entrar a
Proveedores.

> **Se movió `renderUsuarios()`, `urolChange()`, `_initUrolVis()`,
> `aprobarUsuario()`, `rechazarUsuario()`, `actualizarBadgeUsuarios()` y su
> HTML a `modules/admin/`** (index.html + admin.css + admin.js). Código
> copiado tal cual, sin reescribir — solo se adaptó `SUPA.client`/
> `ES_ADMIN_ACTUAL` a `SB`/`ES_ADMIN` (la convención de
> `shared/js/auth-guard.js`).
>
> **Detalle encontrado al implementar:** el enunciado original decía
> "visible en el Home solo si `rol === 'admin'`", pero **el Home no tiene
> ninguna lógica de sesión** (P-3, sin resolver) — lee
> `config/modules.config.js` y pinta botones a cualquiera, sin mirar quién
> es. Condicionar el Home por rol hubiera requerido resolver P-3 primero,
> fuera de alcance de este cambio. Se usó en su lugar el mismo patrón que ya
> tienen `movil`/`mgi`/las 3 faenas: `visibleEnHome: false` en
> `modules.config.js`, se llega por URL directa. Dentro de Proveedores
> aparece un link "👤 Usuarios" en la barra superior, visible solo cuando
> `ES_ADMIN_ACTUAL` es `true` (ese chequeo ya existía).
>
> **`auth-guard.js` ganó un modo nuevo, `adminOnly: true`** (aditivo, no
> afecta a `movil`/`empleabilidad`): sin slug de acceso, entra solo si
> `rol === 'admin'`. Verificado con un usuario simulado que tenía
> `principal`+`mgi`+`empleabilidad` pero no admin — quedó correctamente
> rechazado.
>
> **Limpieza de paso:** un poller (`setInterval` cada 1.5s) que sincronizaba
> la visibilidad del tab "Usuarios" al menú móvil quedó muerto al sacar el
> tab — se eliminó junto con el HTML del ítem móvil y la línea de
> `switchPage()` que llamaba a la función ya movida.
>
> Verificado en local (inyección aislada, sin credenciales reales: login
> admin exitoso invoca `listar_solicitudes` y renderiza igual que antes;
> login no-admin queda bloqueado) y visualmente en el navegador: Proveedores
> sin errores de consola, Home sin el módulo nuevo, `modules/admin/` con el
> mismo estilo del resto del sistema.

---

### P-8 · 🟡 PARCIAL — cuarto corte hecho (2026-08-08): Exportar PDF + Subir minuta

El módulo ya está separado (`index.html` 876 · `.css` 904 · `.js` 6.451), pero
el `.js` sigue concentrando directorio, hotelería, visitas, compromisos,
licitaciones, programas, estandarización, kanban, contratistas, compras.
Toca 24 tablas.

**Arreglo:** partirlo por secciones, de a una, empezando por las más
independientes. Nunca de golpe.

Al partirlo, los archivos resultantes se cargan como `<script src>` sucesivos
en el mismo orden. Las funciones tienen que seguir siendo globales por los
257 `onclick=` de este módulo.

> **Mapa completo del archivo, hecho con los propios banners de comentario**
> (no adivinado) antes de tocar nada — 17 secciones lógicas, de 57 a 1.482
> líneas cada una. Las de mayor riesgo (capa de datos Supabase, directorio,
> licitaciones, estandarización — esta última **compartida con MGI**) se
> dejan para el final, si es que se tocan.
>
> **Primer corte: Catálogo de Programas** (101 líneas, la más chica y más
> aislada de las candidatas) → `modules/proveedores/proveedores-programas.js`,
> cargado con `<script src>` justo después de `proveedores.js`. Código
> movido tal cual, sin reescribir.
>
> Verificado antes de mover: qué funciones se llaman desde fuera de la
> sección (`cargarProgramasCatalogo`, `PROGRAMAS_CAT`, ambas desde
> `renderProgramasDash()` y desde el flujo de sesión) y qué globals de
> `proveedores.js` usa la sección (`SUPA`, `showToast`, `registrarLog`,
> `miNombre`, `esc`, `DB`, `PROGRAMAS_LIST`) — ninguna es ejecución
> inmediata a nivel superior, así que el orden de carga entre archivos no
> importa mientras ambos carguen antes de que alguien haga clic.
>
> Verificado después: inyección aislada confirma que las 7 funciones
> quedan globales sin errores, y que `renderProgramasDash()` (que se queda
> en `proveedores.js`) puede llamar a `catalogoProgramasHTML()` (que se fue
> al archivo nuevo) sin problema — la dependencia cruzada real funciona.
> Visualmente sin cambios ni errores de consola.
>
> **Detalle encontrado de paso, sin tocar:** el banner de la sección
> "GESTIÓN DE USUARIOS v5.0" (línea ~5597) quedó desactualizado tras P-7 —
> las funciones de aprobar/rechazar ya no están ahí, solo queda el estado
> de auth (`ES_ADMIN_ACTUAL`) y el registro público. Se arregla en la
> próxima ronda que toque esa zona.
>
> **Segundo corte (2026-08-07) — las secciones fáciles se habían acabado.**
> Al revisar las 4 candidatas anotadas arriba, **ninguna era un bloque
> limpio** a pesar de que el banner de comentario las agrupa como si lo
> fueran:
>
> | Candidata | Por qué no era limpia |
> |---|---|
> | Agenda telefónica | Contiene `registrarLog`, usada 20 veces en todo el archivo |
> | MOLI | Contiene `montarVisitasV3` — el sistema de visitas real y activo |
> | Trabajadores de Hotelería | Contiene `puedeEliminar` (6 usos) y `enviarCorreoVisita` (la usa `montarVisitasV3`) |
> | **Dashboard de Compromisos** | Casi limpia — 3 funciones ajenas al final del bloque |
>
> Se eligió Compromisos por ser la más cercana a limpia, y se hizo
> **extracción quirúrgica**: de las 15 funciones/variables físicamente
> dentro del banner, se movieron las 12 realmente propias de Compromisos
> (`COMPROMISOS_CACHE`, `renderCompromisosDash`, `diasRestantesComp`,
> `pintarCompromisos`, `marcarCumplido`, `reabrirCompromiso`,
> `LLAMADA_CID`, `abrirLlamada`, `cerrarLlamada`, `llamModoChange`,
> `guardarLlamada`, `verSeguimiento`) a
> `modules/proveedores/proveedores-compromisos.js`. Se dejaron **3** en
> `proveedores.js`, verificadas por sus llamadores reales antes de mover
> nada:
>
> - `badgeOrigenVisita` — la llama `montarVisitasV3`.
> - `editarContrato` — lo llama la sección de Hotelería/Acuerdos (línea ~1895).
> - `abrirCorreoMinuta` — **resultó ser código muerto**: cero llamadores en
>   todo el archivo, ni en el HTML. No se tocó (fuera de alcance de esta
>   extracción), candidata para una futura ronda tipo P-13.
>
> Resultó ser un bloque contiguo después de todo — las 3 funciones que se
> quedan estaban todas juntas al final del banner, así que no hizo falta
> extracción salteada.
>
> Verificado: sintaxis de ambos archivos; inyección aislada confirma las 6
> funciones movidas como globales sin errores, y que las 3 que debían
> quedarse siguen en `proveedores.js`; HTML balanceado (`<div>`/`</div>`)
> tras agregar el `<script src>`.
>
> **Tercer corte (2026-08-07): Agenda telefónica.** De las 4 candidatas
> "chicas" del primer corte, esta era la que menos código ajeno tenía
> mezclado — solo una función: `registrarLog()` (19 usos en todo el
> archivo), físicamente en medio del bloque pero conceptualmente una
> utilidad compartida, no algo de la agenda.
>
> Se movieron 5 funciones (`telLink`, `renderAgenda`, `openNuevoProveedor`,
> `cerrarNuevoProveedor`, `guardarNuevoProveedor`) a
> `modules/proveedores/proveedores-agenda.js`, dejando `registrarLog()` en
> `proveedores.js`. A diferencia del corte de Compromisos, acá la función
> que se queda estaba **en medio** del bloque, no al final — la extracción
> no fue de un rango contiguo único: se armó el archivo nuevo con las 5
> funciones (sin el banner ni `registrarLog`) y se dejó `registrarLog` en su
> lugar original dentro de `proveedores.js`.
>
> Verificado antes de mover: `telLink` se llama también desde la sección
> de Kanban/contratistas (línea ~4224) y `renderAgenda` desde el flujo
> principal de filtros (línea ~573) — ambas son llamadas cruzadas normales
> entre archivos, no bloquean la extracción.
>
> Verificado después: sintaxis de ambos archivos; cero residuos de las 5
> funciones en `proveedores.js`; inyección aislada confirma las 5 globales
> sin errores y que `registrarLog` sigue disponible; HTML balanceado.
>
> `proveedores.js` bajó a 6.039 líneas (de 6.451 al empezar P-8).
>
> **Quedan 14 secciones.** De las 4 candidatas "chicas" originales, ya se
> usaron las 2 viables (Compromisos, Agenda); MOLI y Trabajadores de
> Hotelería siguen descartadas (código del sistema de visitas activo
> mezclado).
>
> **Cuarto corte (2026-08-08): Exportar ficha a PDF + Subir minuta manual.**
> Se tomó del bloque final del archivo ("Menú móvil v11" → "Exportar PDF
> v12" → "v14 Edición: maquinaria" → "Subir minuta manual"). Otro caso de
> extracción no contigua: el bloque de maquinaria (`CAT_MAQ`, `_efFlota`,
> `efRubrosChange`, `efRenderMaq`, `efAddMaq`, `efDelMaq`) quedó **en medio**
> de los dos clusters que sí se movieron — pertenece al modal de edición de
> ficha (usado desde ~987-1107), no a exportar/subir PDFs. Tampoco se
> movieron los 4 toggles del menú móvil (`toggleMobileNav`, `mobileGo`,
> `toggleMobileSidebar` — este último ya estaba antes del corte —, más
> `toggleMnavCargar`, que sí se movió por estar pegado al cluster de
> exportar): son de una línea cada uno, no valía la pena separarlos.
>
> Se movieron 8 funciones/variables (`LOGO_AMSA_PDF`, `LOGOS_FAENA`,
> `_urlToBase64`, `exportarFichaPDF`, `toggleMnavCargar`, `_smPid`,
> `abrirSubirMinutaManual`, `cerrarSubirMinutaManual`,
> `confirmarSubirMinutaManual`) a `modules/proveedores/proveedores-pdf.js`.
>
> **Un error real durante la extracción, detectado por la propia
> verificación:** `LOGO_AMSA_PDF` es un string base64 de una sola línea
> pero enorme (una imagen PNG completa) — imposible de pegar entero en una
> herramienta de edición de texto. Se usó `sed` por número de línea en su
> lugar, y en el primer intento el rango quedó desalineado: a
> `toggleMnavCargar()` le faltó la llave de cierre, dejando
> `proveedores-pdf.js` con un `SyntaxError: Unexpected end of input`. Se
> detectó con `node --check` (el mismo paso de verificación de siempre, no
> uno nuevo) antes de llegar a probarlo en el navegador, y se corrigió
> agregando la llave faltante. Verificación extra que se sumó por este
> susto: contar `{`/`}` en el archivo completo antes y después del corte —
> la diferencia (60 en cada lado) coincidió exactamente con el conteo de
> llaves del archivo nuevo, confirmando que no se perdió ni se duplicó nada.
>
> Verificado después: sintaxis de ambos archivos; inyección aislada
> confirma las 4 funciones movidas como globales sin errores, y que las 7
> que debían quedarse (mobile nav + maquinaria) siguen en `proveedores.js`;
> HTML balanceado.
>
> `proveedores.js` bajó a **5.829 líneas** (de 6.451 al empezar P-8 — ya se
> movieron 622 líneas en 4 rondas). Quedan **13 secciones**. La próxima
> ronda sigue necesitando el mismo nivel de disección quirúrgica —
> candidatas medianas: Hotelería+Acuerdos, Visitas/Hotelería/Dashboard v6,
> Storage+Licitaciones v3, Kanban.

---

### P-9 · 🟢 RESUELTO — las 3 faenas ya comparten código

> **Resuelto el 2026-07-21.** Sin ningún cambio visible para el usuario.

Ahora:

```
shared/css/faena-consulta.css     ← una copia (los 3 .css eran idénticos)
shared/js/faena-consulta.js       ← una copia, parametrizada

modules/centinela/index.html  ┐
modules/antucoya/index.html   ├─ cada uno declara su window.FAENA_CFG
modules/zaldivar/index.html   ┘   y carga los dos archivos compartidos
```

Cada `index.html` conserva sus textos visibles (título, encabezado, pie) y
declara su faena antes de cargar el compartido:

```html
<script>window.FAENA_CFG = { nombre:'Zaldívar', clave:'Zaldivar', slug:'zaldivar' };</script>
<script src="../../shared/js/faena-consulta.js"></script>
```

**Se eliminaron 6 archivos** (`centinela.js/.css`, `antucoya.js/.css`,
`zaldivar.js/.css`): ~1.700 líneas duplicadas. Los 3 botones, las 3 URLs y los
3 slugs de acceso quedaron intactos.

#### ⚠️ La trampa que casi me como: Zaldívar tiene DOS nombres

```js
const FAENA     = 'Zaldívar';   // con tilde   → se muestra al usuario
const FAENA_KEY = 'Zaldivar';   // SIN tilde   → clave de datos
```

En Centinela y Antucoya coinciden, así que parametrizar con un solo nombre
parecía razonable — y habría roto Zaldívar en silencio. Por eso el config
tiene `nombre` **y** `clave` por separado. **No los unifiques.**

#### Cómo se verificó

Se reconstruyó el `.js` original de cada faena a partir del compartido más su
configuración, y se comparó **byte por byte** contra los archivos previos: las
tres reconstruyen exactamente (60.954 / 60.947 / 60.947 bytes). El diff de
cada `index.html` es de 2 líneas.

#### Diagnóstico original

Al separar el JS y el CSS quedó cuantificado:

- **Los 3 `.css` son byte a byte idénticos** (188 líneas cada uno).
- **Los 3 `.js` difieren en 14 líneas** de 383, y las 14 son el nombre y el
  slug de la faena (`FAENA`, `FAENA_KEY`, `PAGINA_ORIGEN`, `PUB_COL`, el
  `accesos.includes(...)`, el mensaje de error y el encabezado del PDF).

O sea: **el 96% del código está triplicado**. Un arreglo hay que aplicarlo
tres veces, y si se olvida una, esa faena queda distinta.

**Se decidió NO fusionarlas** en un módulo con selector, para no cambiar lo
que ve el usuario.

**Pero sí se pueden unificar sin cambio visible alguno:** mover el código a
`shared/js/faena-consulta.js` + `shared/css/faena-consulta.css` y dejar en
cada `index.html` solo la configuración de su faena. Los 3 botones, las 3
URLs y los 3 slugs quedan intactos. Receta completa en
`docs/modulos/faenas.md`.

> Es el pendiente con mejor relación beneficio/riesgo de la lista, y el
> candidato natural para estrenar `shared/`.

---

### P-10 · 🟢 RESUELTO — los permisos ya se refrescan en los 7 módulos

`rol`, `estado` y `accesos` viven en el JWT. Si no se refresca el token, la
persona sigue con los permisos viejos hasta cerrar sesión y volver a entrar.

**Corrección de un diagnóstico anterior:** esto **no** afecta a todo el
sistema. Al revisarlo módulo por módulo:

| Módulo | `refreshSession()` al cargar | |
|---|---|---|
| `proveedores` | Sí (`:4952`) | ✓ |
| `mgi` | Sí | ✓ |
| `centinela` / `antucoya` / `zaldivar` | Sí | ✓ |
| `empleabilidad` | **No** | ✗ |
| `movil` | **No** | ✗ |

Así que el reporte de *"me diste acceso y no me aparece"* solo puede venir de
Empleabilidad y Móvil. En los otros cinco ya está resuelto.

> **Resuelto el 2026-07-21.** Se agregó `refreshSession()` a `empleabilidad`
> y `movil`, con el mismo patrón que ya usaban los otros cinco: al restaurar
> la sesión se pide un token nuevo y, si llega, se usa ese usuario.
>
> **Efecto:** si el maestro le cambia los accesos a alguien, ahora basta con
> recargar la página. Antes había que cerrar sesión y volver a entrar.
>
> Envuelto en `try/catch`: si el refresh falla (sin red, token vencido), cae
> al usuario de la sesión existente y el módulo sigue funcionando como antes.

---

### P-14 · 🟢 RESUELTO — el dashboard mostraba visitas obsoletas

> **Resuelto el 2026-07-21.**

Había **dos sistemas de visitas en paralelo**, y el dashboard leía el muerto:

| Indicador | Leía antes | Lee ahora |
|---|---|---|
| Panel "Últimas Visitas Realizadas" | `DB.visitas` local congelado | tabla `visitas` de Supabase |
| Contador "Visitas registradas" | idem | idem |
| Badge "N días sin visitar" por ficha | idem | idem |
| Pestaña "Visitas" de cada ficha | ya usaba Supabase ✓ | sin cambios |

**El síntoma que esto causaba:** un proveedor visitado la semana pasada y
registrado correctamente en el sistema aparecía igual como "sin visitar" en el
dashboard, porque el badge consultaba una fuente que nadie alimentaba desde la
migración a V3. Y el panel de visitas recientes mostraba registros de años
atrás.

**Cómo se arregló:** `cargarDesdeNube()` ahora trae también las visitas, y
`hydrateFromSupabase()` rellena `DB.visitas` mapeando los campos a los nombres
que el render ya esperaba (`resumen`→`texto`, `responsable_nombre`→`autor`,
`fotos_json`→`fotos`). **No hubo que tocar el dashboard ni `getDiasSinVisita`.**

Detalles del mapeo:
- `resumen` cae a `titulo` si viene vacío.
- Un `fotos_json` corrupto degrada a lista vacía en vez de lanzar excepción.
- Las visitas sin `proveedor_id` se descartan.
- Se filtran las que tienen `estado_registro = 'Eliminado'`.

⚠️ Las fotos ahora son URLs de storage, no base64. Bajo **P-1b** habrá que
firmarlas antes de pintarlas o el thumbnail del dashboard queda roto.

---

### P-11 · 🔴 El JWT queda legible en `localStorage` (preexistente)

Los 7 módulos crean el cliente con `persistSession:true` y su propio
`storageKey` (`am_v6_auth`, `am_mgi`, `am_emp_auth`, `am_mov_auth`,
`am_pub_*`). Eso deja el token de sesión en el navegador, y un JWT se
**decodifica sin ninguna clave**: quedan legibles el correo, el rol y los
accesos del usuario.

`SEGURIDAD.md` ya contempla el token de sesión como aceptable, y quitarlo
obligaría a reautenticarse en cada recarga. Pero en un PC compartido de faena,
el correo y el rol del último usuario quedan a la vista desde la consola.

**Arreglo posible:** usar almacenamiento en memoria o `sessionStorage` para la
sesión, asumiendo que se pierde al cerrar la pestaña.

---

### P-12 · 🟡 PARCIAL — endurecido (2026-08-07): dominio de Proveedores ya no se salta

Cualquiera puede crear una cuenta. Queda en estado `pendiente` y el frontend
la bloquea, pero **es una cuenta autenticada real** frente a la API de
Supabase. Toda política que se apoye solo en `to authenticated` sin verificar
`estado='aprobado'` queda expuesta a cualquiera que se registre.

> **Auditoría de las 30 políticas RLS del schema `public`, hecha el
> 2026-08-06.** Se verificó primero que `tiene_acceso()`, `es_principal()`,
> `es_mgi()`, `es_empleabilidad()` y `es_editor()` exigen `estado='aprobado'`
> internamente (o `es_admin()`, que lo bypasea a propósito) — así que
> cualquier política que use alguna de esas funciones ya estaba bien. De 29
> políticas de datos, **27 estaban correctas.** Dos no:
>
> | Política | Antes | Después |
> |---|---|---|
> | `perfiles_read` | `using (true)` — cualquier autenticado leía la tabla completa | `using (id = auth.uid() OR es_admin())` |
> | `cvlogs_ins` | `with check (true)` — cualquier autenticado insertaba | `with check (es_admin() OR es_principal() OR es_empleabilidad())` |
>
> `perfiles` tiene nombre/apellido/email/estado/rol_solicitado de **todos**
> los usuarios — se verificó el frontend completo (los 3 usos de
> `.from('perfiles')`, en proveedores/mgi/faena-consulta) y ninguno necesita
> leer el perfil de otro; siempre filtran por `id=auth.uid()`. El panel de
> admin usa `listar_solicitudes()` (`SECURITY DEFINER`), no pasa por esta
> política.
>
> **Verificado con la `anon key` real, sin sesión, antes y después:**
> `perfiles` pasó de devolver la tabla completa a `[]`; el insert en
> `cv_logs` pasó de aceptarse a rechazarse con `42501` (RLS violation).
>
> No rompe nada: cada módulo sigue leyendo su propio perfil, y `movil` (el
> único que inserta en `cv_logs`) sigue pudiendo hacerlo — ya estaba
> gateado por `movil`/`empleabilidad`/`principal` en el frontend, ahora
> también en la base.

**Sigue sin resolver:** el registro (`signUp`) en sí sigue abierto en los 7
módulos — cualquiera puede crear una cuenta, solo que ahora esa cuenta no
puede leer/escribir nada hasta que un admin la apruebe. Cerrar el registro
en sí sería un cambio de comportamiento visible (afecta el flujo de "pedir
acceso"), no una migración de RLS — quedó explícitamente fuera de alcance
de esta ronda por decisión del dueño del proyecto (ver más abajo).

> **Ronda 2, 2026-08-07 — endurecido sin cerrar el flujo.** Se le preguntó
> al dueño del proyecto qué tan agresivo debía ser el cierre: apagar el
> autoregistro por completo (rompe "Solicitar acceso" en los 7 módulos) vs.
> mover a la base la única restricción real que existe hoy (Proveedores
> exige `@aminerals.cl`, pero **solo en el frontend** — se salta llamando
> la API directo). Se eligió la segunda.
>
> **Por qué no se pudo aplicar a los 7 por igual:** solo `proveedores.js`
> restringe dominio. Los otros 6 (`movil`, `empleabilidad`, `mgi`, las 3
> faenas) aceptan cualquier correo **a propósito** — proveedores externos,
> especialistas de terreno. Verificado con `grep` antes de tocar nada.
>
> **Mecanismo:** trigger `BEFORE INSERT` en `auth.users`
> (`trg_bloquear_registro_no_aminerals`), no un Auth Hook de Supabase — no
> depende de una función del dashboard que pueda estar bloqueada por plan
> (como pasó con P-15). El frontend de Proveedores ahora manda
> `origen_registro:'principal'` en `options.data` de `signUp()` (queda en
> `raw_user_meta_data`, disponible al trigger en el mismo insert). Si ese
> campo no llega o no dice `'principal'`, el trigger no restringe nada —
> mismo comportamiento de siempre para los demás módulos. No hay forma de
> escalar enviando o quitando el campo: en el peor caso el resultado es
> igual al de hoy, nunca peor.
>
> **Verificado contra la API real** (sin crear ninguna cuenta real):
> `signUp` con `origen_registro:'principal'` y un correo `@gmail.com` →
> rechazado (`P0001`, con el mensaje exacto). Confirmado además que no
> quedó ninguna fila huérfana en `auth.users` — Postgres revierte toda la
> transacción al lanzar la excepción.

---

### P-13 · 🟡 PARCIAL — 2 de 3 resueltos (2026-08-07)

- ✅ **`gSyncDelete` ya no puede afectar 0 filas en silencio.** Ahora
  encadena `.select('proveedor_id')` al `update`, y si no coincide ninguna
  fila lanza un error explícito en vez de "tener éxito" sin haber borrado
  nada. `eliminarProveedor()` ya capturaba ese error y mostraba un toast —
  antes solo nunca se disparaba porque el `update` no fallaba. Ahora, si
  falla, tampoco se toca el estado local (`PROVEEDORES`, `DB._eliminados`),
  así que el proveedor no desaparece de la pantalla sin haberse borrado de
  verdad.
- ✅ **`renderVisitas` y `DB.usuarioActual` eran código muerto — eliminados.**
  Verificado antes de borrar: `visitasPane_` (el `div` que `renderVisitas`
  necesitaba) no existe en `index.html`, así que la función nunca hacía
  nada. La captura de visitas real es `montarVisitasV3`
  (`docs/PENDIENTES.md`, ver el propio código). Se eliminó todo el bloque
  autocontenido: `renderVisitas`, `toggleFormVisita`, `setFotoV`,
  `guardarVisita`, `borrarVisita`, `_fvTemp`, y `DB.usuarioActual` de sus 3
  lugares. Verificado con `grep` que ningún nombre queda huérfano fuera de
  ese bloque, y con inyección aislada que el archivo carga sin errores tras
  el borrado.
- 🔴 **`DB.hoteles` importado por Excel y no empujado a la nube se pierde al
  recargar — sin tocar.** No tiene un arreglo obvio sin decidir un
  comportamiento nuevo (¿guardado automático a `localStorage` mientras no
  se empuja? ¿aviso antes de salir con cambios sin guardar?). Caso borde,
  depende del flujo de trabajo — queda pendiente de decisión, no de
  ejecución.

---

### P-15 · 🔴 Sin protección de contraseñas filtradas — bloqueado por plan

El linter de seguridad de Supabase marca `auth_leaked_password_protection`
como deshabilitado: no se valida al registrarse ni al cambiar clave si la
contraseña ya apareció en una filtración conocida (HaveIBeenPwned).

**Intentado y bloqueado (2026-08-05):** Supabase lo rechaza con
`Configuring leaked password protection via HaveIBeenPwned.org is available
on Pro Plans and up`. La organización (`mavro spa`) está en plan **Free**. No
es una decisión pendiente, es un límite del plan — se revisa si algún día se
pasa a Pro.

**Por qué el riesgo real es menor de lo que parece:** el registro no es
autoservicio libre. `signUp()` deja al usuario en `estado: 'pendiente'` y un
admin aprueba manualmente con `aprobar_usuario_v2()` — hay un humano
revisando antes de dar acceso real (ver §5 de `CLAUDE.md`).

**Mitigación sin costo, pendiente de aprobar:** agregar una validación mínima
de fuerza de contraseña (longitud, no solo dígitos) en el `signUp()` del
frontend. Está duplicado en los 7 módulos — mismo alcance que P-6, mejor
resolverlos juntos.

---

### P-16 · 🟡 Módulo Planer creado (2026-08-07); integración con PlanIA-Personal pendiente

Se creó `modules/planer/` — pendientes y acciones por especialista de
Proveedores, vista conjunta (todos ven todo) con filtro por autor en el
frontend. Detalle técnico completo en `docs/modulos/planer.md`.

Es la **primera tabla del sistema con RLS "por autor de fila"**
(`autor_id = auth.uid()`) — hasta ahora todas las políticas eran por
rol/acceso. `planer_select` deja ver todo con el slug `planer`;
`planer_insert`/`planer_update` restringen a la fila propia (o admin).
Verificado con la `anon key` sin sesión: `[]`.

**Pendiente real:** conectar la generación por IA (**PlanIA-Personal**,
proyecto en desarrollo en paralelo). Falta decidir dónde vive la llamada al
modelo — una key de proveedor de IA no puede quedar expuesta en el
navegador. Candidato natural: una Supabase Edge Function. No se ha
construido nada de esto todavía; la tabla ya trae la columna `origen`
(`'manual'`/`'ia'`) lista para cuando se conecte.

**El maestro debe asignar el slug `planer`** a los especialistas de
Proveedores que correspondan (`aprobar_usuario_v2`, vía `modules/admin/`).
Un módulo nuevo nace invisible — nadie lo tiene todavía.

---

## P-15 · Retirar la versión vieja de "Compromiso RCA" de Proveedores

El módulo nuevo `modules/rca/` reemplaza el seguimiento de compromiso RCA que
había quedado **a medio hacer dentro de Proveedores**, en dos formas paralelas:

- `modules/proveedores/proveedores-rca.js` + tablas `rca_empresas`,
  `rca_documentos` (fichas por empresa con el 10% y documentos).
- El sistema `KB.contratistas` / `compras` en `proveedores.js`
  (`rcaProcesarExcelCompras`, `renderRCA`), con import de compras pero **sin**
  cruce por RUT contra un registro de validados ni validación regional.

El nuevo `modules/rca/` sí hace el cruce por RUT, la validación regional y el
avance del 10% sobre el monto declarado por carta formal. **Pendiente:** una vez
que RC valide el módulo nuevo con datos reales, retirar la pestaña "Compromiso
RCA" del `index.html` de Proveedores y decidir si se migran o archivan
`rca_empresas` / `compras`. No borrar nada hasta confirmarlo (Regla 1).

---

## Orden sugerido

| # | Pendiente | Estado | Por qué en esa posición |
|---|---|---|---|
| — | **P-4** fijar `supabase-js` | 🟢 hecho | Fijado a 2.110.7, verificado idéntico a `@2` |
| — | **P-10** refrescar permisos | 🟢 hecho | `refreshSession()` en los 7 módulos |
| — | **P-9** unificar las 3 faenas | 🟢 hecho | `shared/` estrenado; 6 archivos eliminados |
| — | **P-14** indicadores del dashboard | 🟢 hecho | Ya leen la tabla `visitas` de Supabase |
| 1 | **P-1a** bloquear lectura anónima del bucket | 🟡 SQL listo | Cierra el agujero más grave sin romper nada. **Ejecutar ya.** |
| 2 | **P-2** exportar y purgar el histórico local | 🟡 parcial | El dato ya quedó inerte; falta medirlo y purgarlo |
| 3 | **P-12** auditar RLS contra `signUp` abierto | 🔴 | Mismo error que P-1a puede estar en otras políticas |
| 4 | **P-1b** bucket privado + URLs firmadas | 🔴 | 5 módulos. Necesita el frontend desplegado antes |
| 7 | **P-6** login a `shared/` | 🔴 | Habilita arreglar bien todo lo demás |
| 8 | **P-3** guardia en el Home | 🔴 | Depende de P-6 |
| 9 | **P-7** módulo admin | 🔴 | Ya aprobado, es el que más comodidad da |
| 9 | P-5, P-11, P-13 | 🔴 | Mejoras sin urgencia |
| 11 | **P-8** partir `proveedores.js` | 🔴 | El más grande. Al final y por partes |
