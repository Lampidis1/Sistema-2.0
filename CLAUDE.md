# Sistema AM — Reglas del proyecto

> Este archivo es la fuente de verdad del proyecto. Si vas a trabajar en este
> código (persona nueva, o Claude en otro chat sin contexto), **lee esto
> completo antes de tocar nada**. No hace falta ningún otro contexto previo.

---

## 1. Qué es esto

Sistema interno de **Relaciones Comunitarias de Antofagasta Minerals (AMSA)**.
Es un *hub de botones*: una página de inicio que funciona como menú, y desde
ahí se entra a módulos independientes (proveedores, empleabilidad, captura en
terreno, habitabilidad, consultas por faena).

Está en **producción y en uso real**. No es un prototipo.

---

## 2. Stack

| Capa | Qué se usa | Nota |
|---|---|---|
| Frontend | HTML + CSS + JavaScript **vanilla** | Sin framework, sin build, sin `npm install` |
| Backend | **Supabase** (PostgreSQL + Auth + RLS) | Proyecto `sistema-am-v2`, región `sa-east-1` |
| Hosting | **Vercel**, sitio 100% estático | Sin funciones serverless |
| Librerías | 7, todas por CDN | Ver §7 |

**No hay paso de compilación.** Se editan los archivos y se suben. Cada módulo
son tres piezas: `index.html` (estructura), `<id>.css` y `<id>.js`.

---

## 3. Reglas de oro

### 🥇 Regla 1 — No cambiar el comportamiento sin que te lo pidan

El sistema **está en uso**. Reordenar, documentar y limpiar es bienvenido;
cambiar lo que el usuario ve o cómo funciona, no. Si al ordenar descubres algo
que te parece mal, **anótalo en `docs/PENDIENTES.md` y pregunta**. No lo
arregles de pasada en el mismo cambio.

### 🥇 Regla 2 — El slug de acceso manda

Los permisos por módulo viven en el JWT del usuario
(`app_metadata.accesos`) y los valida la base de datos vía
`tiene_acceso('<slug>')` en las políticas RLS.

**Los slugs no siempre coinciden con el nombre del módulo.** El caso
histórico: `proveedores` usa el slug **`principal`**.

Nunca inventes un slug nuevo en el frontend. Si un módulo necesita uno, se
crea primero en la base de datos y el usuario maestro lo asigna. Ver §5.

### 🥇 Regla 3 — La seguridad real está en la base, no en el navegador

El frontend esconde botones. **Eso no protege nada.** Cualquiera puede abrir
la consola y llamar a Supabase directo. Lo único que protege de verdad son
Auth + las políticas RLS. Si agregas una tabla, agrégale RLS **en el mismo
cambio**.

### 🥇 Regla 4 — `anon key` sí, `service_role` jamás

La `anon key` de `config/supabase.config.js` es pública por diseño: corre en
el navegador. Está bien que esté en el repo.

La **`service_role` key nunca entra a este repositorio**, ni en un archivo, ni
en un comentario, ni "temporalmente para probar". Salta RLS por completo.

### 🥇 Regla 5 — Cero datos personales fuera de Supabase

Este sistema maneja datos de personas (RUT, nombres, teléfonos, CVs), de
empresas proveedoras y datos internos de AMSA. Nada de eso se guarda en
`localStorage`, ni se manda a un tercero, ni viaja en una URL.

En `localStorage` solo pueden vivir preferencias de interfaz y el token de
sesión que maneja Supabase.

> ⚠️ El sistema ya no escribe datos personales en el navegador, pero queda un
> volcado histórico inerte en los equipos que ya lo tenían. No se borró porque
> contiene visitas sin copia en ninguna tabla. Ver `docs/PENDIENTES.md` → P-2.

### 🥇 Regla 6 — Sin servicios externos nuevos

Nada de analytics, tracking, ni APIs de terceros. Solo Supabase y las 7
librerías ya presentes. Agregar una dependencia es una decisión del dueño del
proyecto, no del que está programando.

### 🥇 Regla 7 — El Home casi no tiene lógica

`index.html` lee `config/modules.config.js` y pinta botones. No sabe qué es
un proveedor ni qué es una faena, y así debe seguir. Para agregar un módulo
al menú se edita el config, **nunca el Home**.

> ⚠️ **Única excepción (P-3, `docs/PENDIENTES.md`), acotada a propósito:**
> el Home lee las `storageKey` de sesión de los 8 módulos en `localStorage`
> (sin red, sin cargar Supabase) para **ocultar** — nunca para revelar — las
> tarjetas de `proveedores`/`empleabilidad` si la sesión existente no tiene
> ese acceso. Sigue sin saber qué es un módulo: solo compara el slug
> `acceso`/`accesoAlterno` de cada entrada contra `accesos` del JWT. Los 6
> módulos ocultos por `visibleEnHome: false` siguen ocultos siempre, sin
> importar el acceso real — eso seguiría siendo un cambio de comportamiento
> mayor, no cubierto por esta excepción.

### 🥇 Regla 8 — Un módulo no depende de otro

`modules/mgi/` no importa nada de `modules/proveedores/`. Si dos módulos
necesitan lo mismo, eso va a `shared/`. Nunca se copia y pega entre módulos.

---

## 4. Estructura de carpetas

```
sistema-am/
├── CLAUDE.md                     ← este archivo
├── README.md                     ← arranque rápido
├── vercel.json                   ← redirecciones de las URLs antiguas
├── .vercelignore                 ← qué NO se publica
│
├── index.html                    ← HOME. Solo lee el config y pinta botones.
│
├── config/
│   ├── supabase.config.js        ← window.SUPA_CFG (url + anon key)
│   └── modules.config.js         ← REGISTRO CENTRAL de módulos
│
├── shared/                       ← código común (ver §8)
│   ├── css/faena-consulta.css    ← Centinela · Antucoya · Zaldívar
│   ├── js/faena-consulta.js      ← Centinela · Antucoya · Zaldívar
│   └── assets/logo-amsa-*.png    ← los logos, antes incrustados en cada HTML
│
├── modules/                      ← un módulo = una carpeta = autocontenido
│   ├── proveedores/
│   │   ├── index.html            ← solo estructura
│   │   ├── proveedores.css       ← estilos
│   │   └── proveedores.js        ← lógica
│   ├── empleabilidad/            ← mismo patrón: index.html + .css + .js
│   ├── movil/
│   ├── mgi/
│   ├── centinela/                ← solo index.html: usa shared/
│   ├── antucoya/                 ← solo index.html: usa shared/
│   └── zaldivar/                 ← solo index.html: usa shared/
│
├── docs/
│   ├── ARQUITECTURA.md
│   ├── SEGURIDAD.md
│   ├── PENDIENTES.md             ← deuda técnica: resuelta y pendiente
│   ├── Traspaso_Sistema_AM.docx
│   └── modulos/                  ← un .md por módulo
│
├── database/                     ← scripts SQL. NO se publican.
│   ├── setup_database.sql
│   ├── setup_database_parte2.sql
    └── migraciones/              ← cambios posteriores, con fecha
```

---

## 5. Cómo funcionan los permisos

Hay un **usuario maestro** (`rol: 'admin'`) que decide quién entra a qué.

1. Alguien se registra → queda en `perfiles` con `estado: 'pendiente'`.
2. El maestro lo aprueba con `aprobar_usuario_v2(uid, rol, accesos[])`.
3. Esa función escribe en el JWT del usuario:
   - `rol` → `'admin'` | `'usuario'`
   - `estado` → `'aprobado'` | `'pendiente'` | `'rechazado'`
   - `accesos` → arreglo de slugs

**Slugs existentes:**

| Slug | Abre | Ojo |
|---|---|---|
| `principal` | Proveedores | ⚠️ **no** se llama `proveedores` |
| `empleabilidad` | Empleabilidad | tener `movil` también la habilita |
| `movil` | Oficina Móvil | tener `empleabilidad` también la habilita |
| `mgi` | MGI Habitabilidad | |
| `centinela` | Faena Centinela | |
| `antucoya` | Faena Antucoya | |
| `zaldivar` | Faena Zaldívar | |
| `lector` | — | **no es un módulo**: flag de solo-lectura |

Un `admin` pasa todos los chequeos de `tiene_acceso()` sin tener los slugs.

### Los permisos viven en el JWT

Los accesos no se consultan en cada operación: van firmados dentro del token
que Supabase entrega al iniciar sesión. Un token viejo trae permisos viejos.

Por eso los 7 módulos llaman a `refreshSession()` al restaurar la sesión: piden
un token nuevo antes de decidir qué mostrar.

**Consecuencia práctica:** si el maestro le cambia los accesos a alguien, a esa
persona le basta con **recargar la página**. Antes había que cerrar sesión y
volver a entrar.

⚠️ Si agregas un módulo, no olvides el `refreshSession()`. Sin él vuelve el
reporte de *"me diste acceso y no me aparece"*.

---

## 6. Cómo agregar un módulo nuevo

1. `mkdir modules/mi-modulo/` y crear ahí su `index.html`.
2. En `config/modules.config.js`, agregar la entrada (hay una plantilla
   comentada al final del archivo).
3. En la base de datos, crear el slug de acceso y sus políticas RLS.
4. El maestro asigna el slug a quien corresponda.
5. Documentar el módulo en `docs/modulos/mi-modulo.md`.

Un módulo nuevo **nace invisible**: nadie tiene su slug todavía, así que solo
lo ve el admin hasta que el maestro lo asigne. Es intencional.

### Anatomía de un módulo

```
modules/<id>/
├── index.html     estructura: el <link> al css en el <head>,
│                  los <script src> al final del <body>
├── <id>.css       los estilos
└── <id>.js        toda la lógica
```

Las rutas son **dos niveles abajo** de la raíz:

```html
<link rel="stylesheet" href="mi-modulo.css">
<script src="../../config/supabase.config.js"></script>
<script src="mi-modulo.js"></script>
<a href="../../index.html">⌂ Inicio</a>
```

### 🚨 Nunca uses `type="module"`

Hay **457 atributos `onclick=` en el HTML** de los módulos (257 solo en
Proveedores). Funcionan porque las funciones del `.js` son **globales**.

```html
<script src="mi-modulo.js"></script>                 ✓ funciones globales
<script type="module" src="mi-modulo.js"></script>   ✗ rompe los 457 botones
```

Los módulos ES tienen ámbito propio: las funciones dejan de ser globales y
cada `onclick` deja de encontrarlas. **Y falla en silencio** — no hay error en
la consola, los botones simplemente no hacen nada.

Lo mismo aplica a envolver el archivo en un IIFE o en `'use strict'` con
ámbito propio. Si algún día quieres ámbitos aislados, hay que migrar antes los
457 `onclick` a `addEventListener`.

---

## 7. Librerías externas (CDN)

| Librería | Versión | Para qué |
|---|---|---|
| `@supabase/supabase-js` | 2.110.7 | Cliente de base de datos y auth |
| jsPDF | 2.5.1 | Exportar a PDF |
| SheetJS (xlsx) | 0.18.5 | Exportar/importar Excel |
| pdf.js | 3.11.174 | Leer PDF (CVs) |
| mammoth | 1.6.0 | Leer .docx (CVs) |
| Chart.js | 4.4.0 | Gráficos |
| pptxgenjs | 3.12.0 | Exportar a PowerPoint |

Las 7 están fijadas a versión exacta. **Mantenerlo así.** Usar un rango como
`@2` hace que el CDN sirva la última 2.x, y el sistema en producción cambiaría
solo, sin que nadie toque el código.

Para actualizar una: cambiar el número en los `index.html` que la usen,
probar, y recién ahí desplegar.

Además se cargan fuentes desde Google Fonts, lo que expone la IP de cada
usuario a Google. Ver `docs/PENDIENTES.md` → P-5.

---

## 8. Estado actual de `shared/`

Ya no está vacío. Lo que vive ahí hoy:

| Archivo | Qué es | Quién lo usa |
|---|---|---|
| `js/auth-guard.js` | Bloque de login unificado (`window.AUTH_CFG`) | movil, empleabilidad, admin, planer |
| `js/faena-consulta.js` | Consulta de solo lectura por faena | centinela, antucoya, zaldivar |
| `css/faena-consulta.css` | Estilos de lo anterior | centinela, antucoya, zaldivar |
| `css/ficha-modal.css` | **Ficha emergente del proveedor** | proveedores, mgi |
| `assets/logo-amsa-*.png` | Logos | todos |

### La ficha emergente (`css/ficha-modal.css`)

La ventana que se abre al hacer clic en una tarjeta: cabecera con acciones,
pestañas y cuerpo a dos columnas. **Proveedores y MGI deben verse igual**, así
que los estilos viven acá y cada módulo solo pone su color:

```css
/* en mgi.css, DESPUÉS de cargar el shared */
:root{--fm-primary:#5b4fcf;--fm-primary-lt:#EFECFB;
      --fm-accent:#5b4fcf;--fm-accent-dk:#4338ca;--fm-accent-lt:#EFECFB}
```

Sin definir nada, cae al teal de Proveedores. Son **dos** tonos
(`--fm-primary` para cabecera/pestañas, `--fm-accent-*` para el cuerpo) porque
Proveedores ya usaba colores distintos en cada zona y no se quiso alterar lo
que está en producción.

> ⚠️ **Cuidado con los nombres de clase al compartir CSS.** En ese archivo
> `.modal` es la CAJA blanca y `.modal-overlay` el fondo oscuro. MGI llamaba
> `.modal` a su fondo oscuro: hubo que renombrarlo a `.medit-ov` para poder
> compartir. Antes de mover estilos a `shared/`, comparar los nombres de clase
> de los dos módulos.

### Lo que todavía falta

El bloque de login sigue duplicado en **proveedores, mgi y los 3 de faena**
(los otros 4 ya usan `auth-guard.js`). Arreglar un bug de autenticación ahí
obliga a editar varios archivos sin olvidarse de ninguno. Va módulo por
módulo con aprobación explícita — orden sugerido en `docs/PENDIENTES.md`.

---

## 9. Despliegue

Se sube el repositorio a Vercel y se publica solo. Sitio estático puro.

`.vercelignore` excluye `database/` y `docs/`. **Eso importa:** los
`.sql` traen el esquema completo y las funciones de seguridad, y no deben
quedar accesibles desde internet.

`vercel.json` mantiene vivas las URLs antiguas (`/proveedores.html` →
`/modules/proveedores/`) para que los enlaces guardados y los QR que ya se
repartieron sigan funcionando.
