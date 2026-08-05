# Sistema AM

Sistema interno de Relaciones Comunitarias · **Antofagasta Minerals**

Hub de módulos sobre HTML + JavaScript vanilla y Supabase. Sin build, sin
dependencias que instalar.

---

## Arranque rápido

No hay nada que compilar. Cualquier servidor estático sirve:

```bash
cd sistema-am
python3 -m http.server 8000
# abrir http://localhost:8000
```

> Abrir `index.html` con doble clic **no funciona**: el navegador bloquea el
> `<script src>` a `config/` por política de archivos locales (`file://`).

## Despliegue

Subir el repositorio a Vercel. Se publica solo, como sitio estático.
`.vercelignore` ya excluye `database/` y `docs/`.

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

## ⚠️ Acción pendiente para el administrador

Hay un script SQL **escrito y sin ejecutar** que cierra un agujero real: hoy
cualquiera puede listar y descargar el bucket de documentos completo, sin
tener cuenta. Y como `signUp()` está abierto, basta con registrarse para
seguir teniendo acceso aunque quedes pendiente de aprobación.

**→ `database/migraciones/2026-07-21_p1a_bloquear_listado_anonimo.sql`**

Se pega en Supabase → SQL Editor → ejecutar. No rompe nada, es reversible y
re-ejecutable; el propio archivo trae los pasos de verificación. Detalle en
`docs/PENDIENTES.md` → P-1.

`database/setup_database.sql` ya quedó actualizado con la misma política, así
que reinstalar desde cero no reabre el agujero.
