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

Separado en `index.html` + `.css` + `.js`, con su propio login. Interfaz pensada para
pantalla chica.

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
