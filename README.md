# Sistema AM

Sistema interno de Relaciones Comunitarias · **Antofagasta Minerals**

Hub de módulos sobre HTML + JavaScript vanilla y Supabase. Sin build, sin
dependencias que instalar.

---

## Arranque rápido

No hay nada que compilar. Cualquier servidor estático sirve:

```bash
python3 -m http.server 5500 --bind 127.0.0.1
# abrir http://127.0.0.1:5500
```

> `--bind 127.0.0.1` no es opcional en algunos entornos: sin él el proceso
> arranca pero no queda escuchando, y el navegador no muestra nada.

> Abrir `index.html` con doble clic **no funciona**: el navegador bloquea el
> `<script src>` a `config/` por política de archivos locales (`file://`).

En Claude Code, `.claude/launch.json` ya trae esa configuración lista.

### Qué revisar antes de subir un cambio

Con el servidor arriba, que carguen sin error de consola el Home y los 7
módulos. Los módulos deben quedarse en la pantalla de login: si alguno muestra
datos sin haber iniciado sesión, hay un problema de RLS y no se sube.

## Control de versiones y despliegue

El repositorio es **privado**: contiene el esquema SQL, las funciones de
seguridad y documentación interna de AMSA.

```bash
git add -A
git commit -m "descripción del cambio"
git push
```

Vercel está conectado al repositorio y publica solo en cada push.
`.vercelignore` excluye `database/` y `docs/` del sitio publicado — siguen
versionados en git, pero no llegan a internet.

> `.gitignore` y `.vercelignore` **no son lo mismo**:
> `.gitignore` decide qué no entra al repo; `.vercelignore`, qué está en el
> repo pero no se publica.

## Estructura

```
index.html            Home: lee config/modules.config.js y pinta los botones
config/               credenciales de Supabase + registro de módulos
shared/               código común (ver CLAUDE.md §8)
modules/<id>/         index.html + <id>.css + <id>.js
docs/                 arquitectura, seguridad, pendientes, doc por módulo
database/             scripts SQL de Supabase — NO se publican
  migraciones/        cambios posteriores al setup, con fecha
```

## Antes de tocar el código

Leer **[CLAUDE.md](CLAUDE.md)**. Está todo ahí: stack, reglas de oro, cómo
funcionan los permisos y cómo agregar un módulo.

Dos cosas que muerden a todo el mundo la primera vez:

- El slug de acceso de Proveedores es **`principal`**, no `proveedores`.
- Los permisos viven en el JWT (el token de sesión), no se consultan en cada
  operación. Los 7 módulos refrescan el token al cargar, así que cambiar los
  accesos de alguien aplica **cuando esa persona recargue la página**.

## Estado

| | |
|---|---|
| Módulos | 7 (`proveedores`, `empleabilidad`, `movil`, `mgi`, y 3 faenas) |
| En el menú del Home | 2 — el resto se entra por URL directa |
| Estructura | HTML, CSS y JS separados en los 7 módulos |
| `shared/` | las 3 faenas ya comparten código (`faena-consulta.js/.css`) |
| Librerías | las 7 fijadas a versión exacta |
| Deuda técnica | ver [docs/PENDIENTES.md](docs/PENDIENTES.md) |

## Seguridad del bucket de documentos — resuelto (2026-08-05)

**P-1a y P-1b quedaron aplicados el 2026-08-05.** El bucket `documentos` ya
no se puede enumerar ni descargar sin sesión:

- `doc_public_read` fue reemplazada por `doc_auth_read` (sesión + usuario
  aprobado) — cierra la enumeración anónima.
- El bucket pasó a `public = false` — cierra la descarga por URL conocida.
  Antes de este paso se desplegó y verificó en producción el frontend
  (`proveedores.js`, `mgi.js`, `shared/js/faena-consulta.js`) firmando cada
  URL con `createSignedUrl()` al momento de usarla, no al guardarla.

Verificado contra la base real, antes y después, con un archivo real: la
descarga directa pasó de `200` a `400`, y `createSignedUrl()` con la `anon
key` sin sesión se rechaza. `database/setup_database.sql` ya trae la política
corregida. Detalle completo en `docs/PENDIENTES.md` → P-1.
