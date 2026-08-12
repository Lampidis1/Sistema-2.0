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

## Cargar Excel vs Depurar — cuál usar (2026-08-09)

Son dos cosas distintas y no son intercambiables:

| | **Subir Excel** (plantilla) | **🧹 Depurar** |
|---|---|---|
| Para qué | Cargar proveedores **nuevos** | **Corregir** los que ya están |
| Empareja por | RUT | columna `ID (no editar)` |
| Campos existentes | **solo rellena los vacíos**, nunca pisa | **sobreescribe**, previa aprobación |
| Lee las columnas | por **posición** | por **nombre** |
| Corregir un RUT | ❌ crea un duplicado | ✅ funciona |

**Por qué el importador no sirve para depurar.** `finishLoad()` hace un merge
que solo completa campos vacíos (`if (valNuevo && !valExist)`). Y busca al
proveedor por su RUT: si corriges un RUT mal escrito, deja de calzar con el de
la base y en vez de arreglarlo **crea una ficha nueva**. Justo lo contrario de
depurar.

### La ventana Depurar (`proveedores-depurar.js`)

1. Se baja la base con **📤 Bajar base**.
2. Se corrige en Excel **sin tocar la columna `ID (no editar)`** — esa columna
   es la que permite encontrar la ficha aunque cambie el RUT.
3. Se sube en **🧹 Depurar**: muestra cada diferencia (valor actual tachado en
   rojo → valor nuevo en verde) y solo aplica las marcadas.

Detalles que importan:

- **Una celda vacía no borra**. Para dejar un campo en blanco hay que escribir
  `-`. Así una columna que se borró sin querer en Excel no vacía media base.
- Los cambios de **RUT** se resaltan aparte y se avisa si el RUT nuevo tampoco
  pasa la validación de módulo 11.
- Las filas con un ID que ya no existe se ignoran y se informan.
- Todo cambio queda en `registro_ediciones` con la acción `depurar`.

### Fusionar fichas repetidas

En la misma ventana, **«Ver fichas repetidas»** agrupa por RUT. Al fusionar,
la ficha que se queda absorbe contactos, habitaciones, programas y visitas de
la otra, y completa sus propios campos vacíos con los de ella. La absorbida
queda con `estado = 'Eliminado'` — nada se borra de verdad.

> ⚠️ **Un mismo RUT repetido no siempre es un error.** Un dueño puede tener
> varios hospedajes (HAI 1/2/3, Hostal Minero 1 al 5, Casa Besalco 1 al 4).
> La ventana lo advierte: fusionar solo cuando sean literalmente el mismo lugar.

### La plantilla

Tiene **24 columnas** y el lector las toma **por posición**, no por nombre. Si
se agrega una columna al medio, hay que mover también los índices en
`handleFiles()`. Las tres últimas (baño privado y disponibilidad) faltaban en
la plantilla aunque el lector ya las leía.
