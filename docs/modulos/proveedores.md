# Módulo: Proveedores

| | |
|---|---|
| **id** | `proveedores` |
| **Slug de acceso** | **`principal`** ⚠️ no es `proveedores` |
| **Ruta** | `modules/proveedores/index.html` |
| **En el Home** | Sí |
| **Estado** | Activo · en producción |
| **Archivos** | `index.html` 876 · `proveedores.css` 904 · `proveedores.js` 6.451 líneas |

## Qué problema resuelve

Es la plataforma principal de Relaciones Comunitarias. Concentra el
seguimiento de proveedores de la región: quiénes son, qué compromisos se
tomaron con ellos, qué se les compró, en qué programas participan y cómo van
sus estándares.

## Qué contiene

- **Directorio** de proveedores regionales y sus contactos
- **Hotelería** — establecimientos y trabajadores alojados
- **Visitas** — participantes, compromisos, seguimiento y firmas
- **Acuerdos** y compromisos con responsables asignados
- **Programas** — catálogo e inscripciones
- **Licitaciones** y **compras**
- **Contratistas** y sus contactos
- **Estandarización** — criterios y avance
- **Kanban** de gestión
- **MOLI** — beneficiarios
- **Registro de ediciones** — auditoría de cambios
- **Panel de administración de usuarios** ← ver nota abajo

## Cómo funciona

Separado en `index.html` + `.css` + `.js`. Login propio con
`signInWithPassword`, valida que `accesos` incluya `principal` y a partir de
ahí consulta Supabase directo.

Toca **24 tablas**. Es el módulo más acoplado a la base de datos.

Roles dentro del módulo:
- **admin** → todo, incluido eliminar
- **principal** (editor) → ver, crear, editar
- **principal + flag `lector`** → solo ver

## Notas importantes

**El panel de administración de usuarios está acá adentro.** Aprobar
usuarios (`aprobar_usuario_v2`), ver pendientes y rechazar se hace desde este
módulo. O sea que el usuario maestro tiene que entrar a Proveedores para
administrar accesos de todo el sistema. Ver `PENDIENTES.md` → P-7.

**Vuelca datos a `localStorage`.** `saveDB()` escribe visitas, hoteles,
acuerdos, programas, licitaciones y contactos en el navegador, en texto
plano, siempre. Ver `PENDIENTES.md` → P-2. **Es el punto más urgente de este
módulo.**

**Sube archivos al bucket `documentos`**, que hoy es de lectura pública sin
autenticación. Ver `PENDIENTES.md` → P-1.

## Si vas a trabajar acá

No lo reescribas de una. Son 8.215 líneas en producción. Se parte por
secciones, empezando por las más independientes, y una por vez.
