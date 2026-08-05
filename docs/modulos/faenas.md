# Módulos: Consulta por Faena (Centinela · Antucoya · Zaldívar)

| | |
|---|---|
| **ids** | `centinela` · `antucoya` · `zaldivar` |
| **Slugs de acceso** | `centinela` · `antucoya` · `zaldivar` (uno por faena) |
| **Rutas** | `modules/<faena>/index.html` |
| **En el Home** | **No** — se entra por URL directa |
| **Estado** | Activos · en producción |
| **Archivos** | cada faena: solo `index.html` (87 líneas).<br>El resto es compartido: `shared/js/faena-consulta.js` · `shared/css/faena-consulta.css` |

> Un solo documento para los tres: son el mismo módulo con distinta faena.
> Duplicar la documentación garantizaría que se desincronice.

## Qué problema resuelve

Da acceso de **solo lectura** al directorio de proveedores a personas de cada
faena, sin dejarlas entrar a la plataforma completa de Proveedores ni
permitirles modificar nada.

Es el nivel de acceso más restringido del sistema.

## Qué contiene

Consulta de `proveedores` y `contactos`, filtrada por faena. Sin edición, sin
creación, sin eliminación.

## Cómo funciona

Las tres comparten `shared/js/faena-consulta.js`. Cada `index.html` declara su faena en `window.FAENA_CFG` y luego carga el compartido. Cada una tiene su propio login y valida su slug: `centinela/index.html`
exige que `accesos` incluya `centinela`, y así los tres.

Usan un `storageKey` propio de sesión (`am_pub_<faena>`) para no pisarse entre
sí ni con los otros módulos.

## Por qué siguen siendo tres módulos

Se evaluó fusionarlos en un módulo con selector de faena, y **se decidió no
hacerlo**: cambiaría lo que ve el usuario, y la regla del proyecto es que nada
funcione distinto a hoy.

Lo que **sí** se hizo fue unificar el código: las tres comparten un solo
archivo en `shared/`, así que un arreglo se aplica una vez y llega a las tres.
Lo que el usuario ve —tres botones, tres URLs, tres slugs— no cambió.

### Qué tan idénticos son (medido)

Tras separar el JS y el CSS quedó a la vista:

- **Los `.css` son byte a byte idénticos** entre las tres faenas.
- **Los `.js` difieren en 14 líneas**, y las 14 son la faena:

```js
const FAENA='Centinela';  const FAENA_KEY='Centinela';
const PAGINA_ORIGEN='centinela';  const PUB_COL='pub_centinela';
accesos.includes('centinela')        // el chequeo de acceso
'Tu cuenta no tiene acceso a Centinela.'   // el mensaje de error
'Faena Centinela · '                        // el encabezado del PDF
```

O sea que **el 96% del código está triplicado sin ninguna razón**.

### Cómo unificarlas sin cambiar nada visible

Como la diferencia son 4 constantes más 3 textos derivables de ellas, se puede
mover todo a `shared/js/faena-consulta.js` y `shared/css/faena-consulta.css`,
y dejar en cada `modules/<faena>/index.html` solo:

```html
<script>window.FAENA_CFG = { nombre:'Centinela', slug:'centinela' };</script>
<script src="../../shared/js/faena-consulta.js"></script>
```

Los 3 botones siguen existiendo, las 3 URLs siguen existiendo, los 3 slugs de
acceso siguen intactos. **El usuario no nota absolutamente nada** — y un
arreglo pasa a aplicarse una vez en vez de tres.

Ver `PENDIENTES.md` → P-9.

## Si agregas una faena nueva

1. Copiar una carpeta existente y ajustar el slug y las etiquetas.
2. Crear el slug en la base con sus políticas RLS.
3. Registrar el módulo en `config/modules.config.js`.
4. El maestro asigna el acceso.
5. Agregar la faena a este documento.
