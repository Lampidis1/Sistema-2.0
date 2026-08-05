# Arquitectura

## Panorama

```
Navegador                          Supabase (sa-east-1)
┌────────────────────────┐        ┌──────────────────────────┐
│ index.html (Home)      │        │  Auth  → JWT con:        │
│   └ modules.config.js  │        │          rol             │
│                        │        │          estado          │
│ modules/<id>/          │◄──────►│          accesos[]       │
│   login + UI + queries │  anon  │                          │
│                        │   key  │  PostgreSQL + RLS        │
│ config/supabase.config │        │  Storage: 'documentos'   │
└────────────────────────┘        └──────────────────────────┘
```

No hay servidor propio. El navegador habla directo con Supabase usando la
`anon key`, que es pública por diseño.

## Por qué esto es seguro (y dónde no lo es)

Quien decide qué puede leer o escribir cada usuario es **PostgreSQL**, con
Row Level Security, evaluando el JWT que Supabase firmó al iniciar sesión.

El frontend no protege nada: esconder un botón no impide que alguien abra la
consola y llame a la API. **El frontend es comodidad; RLS es la seguridad.**

Corolario: si agregas una tabla sin política RLS, queda abierta a cualquier
usuario autenticado. Siempre se agregan juntas.

> La excepción está en el bucket `documentos`, que hoy se lee sin
> autenticación. Ver `PENDIENTES.md` → P-1.

## Funciones de autorización en la base

Definidas en `database/setup_database.sql`, leen el JWT:

| Función | Devuelve verdadero si |
|---|---|
| `es_admin()` | `app_metadata.rol = 'admin'` |
| `tiene_acceso(slug)` | es admin, **o** está aprobado y `accesos` contiene el slug |
| `es_principal()` | `tiene_acceso('principal')` |
| `es_mgi()` | tiene acceso a `mgi` |
| `es_empleabilidad()` | tiene acceso a `empleabilidad` **o** a `movil` |
| `es_lector()` | `accesos` contiene el flag `lector` → bloquea escritura |
| `es_editor()` | admin, o (principal/mgi/empleabilidad) y **no** lector |

Patrón general de las políticas:

- **ver** → admin / principal / empleabilidad / mgi
- **crear y editar** → `es_editor()` (excluye a los lectores)
- **eliminar** → solo admin

Además, un trigger impide que un no-admin marque registros como `'Eliminado'`,
para que el borrado lógico no se pueda saltar desde el frontend.

## Flujo de un usuario nuevo

```
se registra → perfiles.estado = 'pendiente'
                     │
        el maestro decide
         ┌───────────┴───────────┐
   aprobar_usuario_v2      rechazar_usuario
   (uid, rol, accesos[])          │
         │                  estado='rechazado'
   escribe en el JWT:
   rol · estado='aprobado' · accesos[]
         │
   debe volver a iniciar sesión para
   que el JWT nuevo tome efecto  ← causa común de confusión
```

## Reglas de dependencia

```
index.html  ──►  config/modules.config.js
modules/*   ──►  config/supabase.config.js
modules/*   ──►  shared/**            (a futuro)
modules/A   ──X──►  modules/B         ← prohibido
```

Ningún módulo importa nada de otro. Lo compartido va a `shared/`.

## El Home no tiene lógica

`index.html` no sabe qué es un proveedor ni una faena. Lee `AM_MODULES`,
filtra por `visibleEnHome` y pinta tarjetas. Agregar un módulo al menú es
editar el config; el Home no se toca.

## Convención de rutas

Un módulo está dos niveles bajo la raíz (`modules/<id>/index.html`):

```html
<script src="../../config/supabase.config.js"></script>
<a href="../../index.html">⌂ Inicio</a>
```

`vercel.json` redirige las URLs antiguas (`/proveedores.html` →
`/modules/proveedores/`) para no romper enlaces guardados ni los QR de fichas
de CV ya repartidos. El fragmento `#cv=...` sobrevive a la redirección porque
los navegadores lo reaplican en el destino.
