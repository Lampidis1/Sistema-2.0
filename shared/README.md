# shared/ — código común a varios módulos

**Regla:** si dos módulos necesitan lo mismo, vive acá. Nunca se copia y pega
entre módulos.

```
shared/
├── css/
│   └── faena-consulta.css   ← Centinela · Antucoya · Zaldívar
├── js/
│   └── faena-consulta.js    ← Centinela · Antucoya · Zaldívar
└── assets/
    ├── logo-amsa-600.png    ← Home
    ├── logo-amsa-873.png    ← los 7 módulos (login y cabecera)
    └── logo-amsa-900.png    ← Proveedores (menú móvil)
```

## Los logos

Antes iban incrustados como base64 dentro de cada `index.html`: el de 873px
aparecía **13 veces**, y sumaban 1,1 MB de HTML. Ahora son 3 archivos que el
navegador descarga y cachea una sola vez.

Se guardaron **sin recomprimir**, byte a byte como estaban, así que se ven
exactamente igual.

### 🚨 Los logos del JS son otra cosa — no los toques

En `proveedores.js`, `mgi.js` y `faena-consulta.js` hay constantes
`LOGO_AMSA_PDF`, `LOGOS_FAENA` y `LOGO` que **siguen en base64 a propósito**.
Las consumen jsPDF y pptxgenjs para incrustar el logo en los PDF y las
presentaciones, y necesitan los datos crudos: una ruta de archivo no les
sirve.

Si las reemplazas por rutas, **los PDF salen sin logo y sin ningún error
visible**, porque varias de esas llamadas están envueltas en `.catch(()=>null)`.

## Cómo se consume

El módulo declara su configuración **antes** de cargar el archivo compartido:

```html
<link rel="stylesheet" href="../../shared/css/faena-consulta.css">
...
<script>window.FAENA_CFG = { nombre:'Zaldívar', clave:'Zaldivar', slug:'zaldivar' };</script>
<script src="../../shared/js/faena-consulta.js"></script>
```

## 🚨 Siempre con `<script src>` clásico

**Nunca `type="module"`.** Hay 457 atributos `onclick=` en el HTML de los
módulos que dependen de que estas funciones sean globales. Con módulos ES
dejan de serlo y los botones fallan **en silencio**, sin error en consola.
Ver `CLAUDE.md` §6.

## Qué falta mudar acá

El **login está duplicado 7 veces**, una por módulo. Es el siguiente
candidato: `shared/js/auth-guard.js`. Ver `docs/PENDIENTES.md` → P-6.
