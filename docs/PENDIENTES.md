# Pendientes y deuda técnica

Todo lo que se detectó al reorganizar el proyecto y **no se tocó**, por la
Regla 1 (`CLAUDE.md` §3): no cambiar el comportamiento sin que lo pidan.

Cada punto se decide y se aplica por separado. Los marcados 🟢 ya están
resueltos y se dejan documentados porque explican por qué el código quedó como
quedó.

Estado: 🔴 sin decidir · 🟡 aprobado, sin hacer · 🟢 resuelto

---

## Seguridad y privacidad

### P-1 · 🟡 El bucket `documentos` está abierto — se enumera y se lee sin cuenta

**Dónde:** `database/setup_database.sql:566` y `:571`

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

#### Alcance real de P-1b — son 5 módulos, no 2

Una auditoría corrigió el alcance. Consumen URLs de storage:

| Módulo | Dónde | Cómo falla con bucket privado |
|---|---|---|
| `proveedores` | `_urlToBase64`, fotos de fichas y visitas, PDFs | Imágenes rotas + PDF sin fotos |
| `mgi` | `_urlToBase64MGI`, minutas | Igual |
| `centinela` / `antucoya` / `zaldivar` | `<img>` de `fotos_json` y `fetch()` de exportación | Igual |
| `empleabilidad` | `fetch(url)` + `blob()` | Igual |

Dos trampas que hay que tener presentes:

1. **Un `<img src="...">` no lleva el JWT.** El navegador no adjunta la sesión
   a una etiqueta `<img>`, así que hay que firmar cada URL **antes** de
   pintarla, no solo al abrir un documento.
2. **Varios `fetch()` de exportación están envueltos en `.catch(()=>null)`**,
   así que fallarían **en silencio**: el PDF o el PPT sale sin fotos y nadie
   ve un error. La verificación tiene que incluir *exportar una ficha a PDF y
   a PPT* desde proveedores, MGI y una faena — no basta con abrir un documento.

Además, hoy se guarda en la base la URL absoluta devuelta por
`getPublicUrl()`. Bajo P-1b hay que **guardar solo la ruta**, o las filas
nuevas quedarán con URLs muertas. Para las filas viejas, el helper debe
extraer la ruta de la URL guardada.

> Prioridad más alta de esta lista.

---

### P-2 · 🟡 PARCIAL — ya no se escriben datos personales, pero el histórico sigue ahí

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

El dato quedó inerte, pero sigue en disco. Para purgarlo:

1. **Medir** cuánto hay. En la consola del navegador (solo lectura):

```js
(()=>{const d=JSON.parse(localStorage.getItem('am_v6_db')||'{}').visitas||{};
const n=Object.values(d).flat();
console.log('Proveedores:',Object.keys(d).length,'| Visitas:',n.length,
            '| Con fotos:',n.filter(v=>v.fotos&&v.fotos.length).length,
            '| Más reciente:',n.map(v=>v.fecha).sort().pop()||'—');})()
```

2. Si sale **0**, purgar sin más.
3. Si hay contenido, **exportarlo** y migrarlo a la tabla `visitas` antes de
   borrar.

`resetearDatos()` ya lo borra, pero con confirmación explícita del usuario.

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

### P-3 · 🔴 El Home no pide sesión y muestra los botones a cualquiera

`index.html` no tiene autenticación. Muestra las tarjetas de Proveedores y
Empleabilidad a quien abra la URL.

Hoy no se filtran los botones según los `accesos` del usuario, simplemente
porque el Home no sabe quién es. Entrar igual no se puede: cada módulo tiene
su propio login y RLS protege los datos. Lo que se filtra es información sobre
qué sistemas existen.

**Arreglo:** poner la guardia de sesión también en el Home y filtrar
`AM_MODULES` contra `app_metadata.accesos`. El config ya trae el campo
`acceso` de cada módulo, así que es casi solo conectarlo.

⚠️ Al filtrar, hay que excluir `lector`: está dentro del arreglo `accesos`
pero **no es un módulo**, y aparecería como botón fantasma.

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

### P-6 · 🔴 El login está duplicado 7 veces

Cada módulo trae su propia copia del bloque `signInWithPassword` +
`getSession`. Un bug de autenticación hay que arreglarlo en 7 archivos, y si
se olvida uno queda una puerta con comportamiento distinto.

**Arreglo:** extraer a `shared/js/auth-guard.js` y que los 7 lo carguen.

> Ya es posible: al separar el JS de los HTML, el login quedó accesible en
> `modules/<id>/<id>.js`. Antes estaba enterrado dentro del HTML y no se podía
> compartir.

⚠️ Al hacerlo, cargar con `<script src>` clásico. **Nunca `type="module"`**:
hay 457 `onclick=` en el HTML que dependen de que las funciones sean globales.
Ver `CLAUDE.md` §6.

---

### P-7 · 🔴 El panel de administración vive dentro de Proveedores

`aprobar_usuario_v2`, la lista de pendientes y los rechazos están dentro de
`modules/proveedores/index.html`, un archivo de 8.215 líneas dedicado a otra
cosa.

Para administrar accesos, el maestro tiene que entrar a Proveedores.

**Arreglo:** sacarlo a `modules/admin/`, visible en el Home solo si
`rol === 'admin'`. Ya estaba aprobado en conversación, pero es un cambio de
comportamiento y quedó fuera de la Fase 1.

---

### P-8 · 🔴 `proveedores.js` tiene 6.451 líneas

El módulo ya está separado (`index.html` 876 · `.css` 904 · `.js` 6.451), pero
el `.js` sigue concentrando directorio, hotelería, visitas, compromisos,
licitaciones, programas, estandarización, kanban, contratistas, compras **y**
el panel de administración. Toca 24 tablas.

**Arreglo:** partirlo por secciones, de a una, empezando por las más
independientes. Nunca de golpe.

Al partirlo, los archivos resultantes se cargan como `<script src>` sucesivos
en el mismo orden. Las funciones tienen que seguir siendo globales por los
257 `onclick=` de este módulo.

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

### P-12 · 🔴 El registro (`signUp`) está abierto en los 7 módulos

Cualquiera puede crear una cuenta. Queda en estado `pendiente` y el frontend
la bloquea, pero **es una cuenta autenticada real** frente a la API de
Supabase. Toda política que se apoye solo en `to authenticated` sin verificar
`estado='aprobado'` queda expuesta a cualquiera que se registre.

Ya se corrigió en la política de storage de P-1a. **Conviene auditar el resto
de las políticas RLS con el mismo criterio.**

---

### P-13 · 🔴 Detalles menores detectados en la auditoría

- **`gSyncDelete` puede afectar 0 filas sin devolver error.** Calcula el id
  como `p._proveedorId || ('re_'+rut)`; si no coincide con ninguna fila, el
  `update` no falla y el proveedor "eliminado" reaparece al recargar. Antes
  quedaba oculto por `DB._eliminados` en el navegador.
- **`DB.hoteles` importado por Excel y no empujado a la nube se pierde al
  recargar.** Caso borde, depende del flujo de trabajo.
- **`renderVisitas` y `DB.usuarioActual` son código muerto**: la captura de
  visitas real es `montarVisitasV3`, que lee de la tabla `visitas`. Conviene
  borrarlos para que nadie los confunda con código vivo.

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
