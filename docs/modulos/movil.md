# Módulo: Oficina Móvil

| | |
|---|---|
| **id** | `movil` |
| **Slug de acceso** | `movil` (o `empleabilidad`) |
| **Ruta** | `modules/movil/index.html` |
| **En el Home** | **No** — se entra por URL directa |
| **Estado** | Activo · en producción |
| **Archivos** | `index.html` 161 · `movil.css` 56 · `movil.js` 362 líneas |

## Qué problema resuelve

Captura de datos en terreno. Es la versión liviana y orientada a celular de
Empleabilidad, para registrar personas durante operativos en comunidad, donde
no se anda con un computador.

## Qué contiene

- Alta y edición rápida de personas (`cv_personas`)
- **Cuestionario de apresto laboral**
- Generación del enlace y QR de la ficha de CV
- Exportación a Excel
- **Registro de auditoría** (`cv_logs`) — cada creación y cada campo editado
  queda registrado con quién, qué campo, valor anterior y valor nuevo

## Cómo funciona

Separado en `index.html` + `.css` + `.js`, con su propio login.

### La interfaz se diseña desde el escritorio

**"Móvil" es el vehículo, no el teléfono.** La oficina se desplaza por la
ciudad, pero buena parte del trabajo — revisar lo levantado, completar fichas,
exportar — se hace después en el computador. Por eso `movil.css` está escrito
de mayor a menor:

| Tamaño | Qué cambia |
|---|---|
| **Escritorio** (base, sin media query) | Cabecera blanca con el logo de Antofagasta Minerals, pestañas arriba, ancho de 1240 px y la captura en **dos columnas**: Datos personales y Laboral lado a lado |
| **Tableta** (≤1023 px) | Una columna de tarjetas, pero los campos siguen de a dos. Un iPad vertical mide 768 px: tratarlo como teléfono desperdicia media pantalla |
| **Teléfono** (≤599 px) | Barra de pestañas abajo (al alcance del pulgar), una columna, botones a todo el ancho, título abreviado |

Hay **dos juegos de pestañas** en el HTML: `.navtabs` (arriba) y `.tabbar`
(abajo). Solo una se ve a la vez según el ancho, pero `movTab()` marca las dos,
para que al girar la tableta o cambiar el tamaño de la ventana quede coherente.

> ⚠️ La cabecera es **blanca, no teal**. El logo de Antofagasta Minerals lleva
> texto oscuro y sobre el teal no se lee. Es el mismo criterio del resto del
> sistema.

Los ajustes comunes de tableta y teléfono (16 px en los campos para que iPhone
no haga zoom, áreas táctiles de 40 px) los pone `shared/css/responsive.css`,
que se carga **después** de `movil.css`.

El campo `origen` de `cv_logs` guarda el literal `'movil.html'` para distinguir
lo capturado en terreno de lo cargado en oficina.

> ⚠️ **`'movil.html'` es un valor de datos, no una ruta.** Está en registros ya
> guardados en la base. Aunque el archivo ahora se llame `index.html`, ese
> literal **no se cambia**: cambiarlo parte el historial de auditoría en dos.

## Sobre trabajo sin conexión

**No tiene modo offline.** Si no hay señal, no guarda. Se decidió no agregar
caché local para no dejar datos personales en el equipo (`SEGURIDAD.md`,
regla 3).

Si en algún momento se necesita capturar sin señal, hay que diseñarlo con
reglas explícitas de cifrado y borrado tras sincronizar. No se improvisa.

## Sensibilidad de los datos

Alta: datos personales capturados en terreno. Además suele usarse en equipos
compartidos, lo que hace que la regla de no dejar nada en `localStorage`
importe todavía más acá.
