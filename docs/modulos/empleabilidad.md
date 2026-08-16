# Módulo: Empleabilidad

| | |
|---|---|
| **id** | `empleabilidad` |
| **Slug de acceso** | `empleabilidad` (o `movil` — cualquiera de los dos habilita) |
| **Ruta** | `modules/empleabilidad/index.html` |
| **En el Home** | Sí |
| **Estado** | Activo · en producción |
| **Archivos** | `index.html` · `empleabilidad.css` · `empleabilidad.js` + 3 archivos de apoyo (ver §Estructura) |

## Qué problema resuelve

Conecta a personas de las comunidades con oportunidades laborales. Mantiene la
base de currículums, publica ofertas, las cruza con los perfiles y hace
seguimiento de postulaciones y becados.

## Qué contiene

- **Base de CV** (`cv_personas`) — ficha completa por persona
- **Ofertas laborales** (`cv_ofertas`)
- **Matching** — cruce entre perfiles y ofertas
- **Postulaciones** (`cv_postulaciones`) con seguimiento
- **Becados** (`becados`)
- **Kanban** de gestión

## Estructura de archivos

El módulo se partió en cuatro `.js` porque hacía tres cosas muy distintas en un
solo archivo. Todos se cargan como `<script src>` clásico, **nunca**
`type="module"` (CLAUDE.md §6), y comparten un único ámbito global — por eso
antes de agregar una función hay que revisar que el nombre no exista en los
otros archivos.

| Archivo | De qué se hace cargo |
|---|---|
| `empleabilidad.js` | Pantallas, filtros, ofertas, postulaciones, becados, kanban |
| `empleabilidad-lectura.js` | Leer el documento que entra: PDF, Word, escaneo o foto → estructura de CV |
| `empleabilidad-match.js` | Comparar un cargo con la lista de CVs, con su explicación |
| `empleabilidad-harvard.js` | Revisar y exportar el CV en formato Harvard |

Orden de carga en `index.html`: `empleabilidad.js` primero (define `CVS`,
`OFERTAS`, `toast`, `esc`), después los tres de apoyo.

---

## 1 · Lectura de documentos (`empleabilidad-lectura.js`)

### El problema que resuelve

`pdf.js` lee la **capa de texto** de un PDF. Si el CV es una foto del papel o un
escaneo, esa capa no existe: la lectura devolvía vacío y la ficha quedaba en
blanco **sin avisar**. Ahora ese caso se detecta y se pasa por OCR.

### Cómo decide

```
archivo
 ├── .pdf   → pdf.js
 │            ├── ≥ 120 caracteres por página  → sirve, se usa el texto
 │            └── < 120 caracteres por página  → es un escaneo → OCR
 ├── .docx  → mammoth
 ├── .doc   → no se puede en el navegador: se avisa y se pide guardarlo como .docx
 └── imagen → OCR directo
```

El umbral vive en `UMBRAL_OCR`. Un CV de una página con texto real trae miles
de caracteres; uno escaneado trae cero o basura suelta.

### OCR: Tesseract.js, con carga diferida

- **Librería:** `tesseract.js` 5.1.1, Apache-2.0, WebAssembly.
- **Peso:** la librería más el diccionario de español suman ~17 MB.
- **Por eso no se carga al entrar.** `ocrDisponible()` inyecta el `<script>` la
  primera vez que un documento lo necesita; después queda en caché del
  navegador. Los CVs que sí traen texto no pagan nada.
- **Privacidad:** corre entero en el navegador. Ningún CV se sube a un tercero
  (Reglas 5 y 6). Tesseract es WebAssembly local, no un servicio.
- Mientras trabaja se muestra una barra de progreso (`ocrAviso`): sin ella
  parece que el sistema se colgó.

### Por qué se guardan las coordenadas

`pdfLineas()` no toma el texto de corrido: agrupa los trozos por coordenada Y
para reconstruir las **líneas reales** y los ordena por X. Sin eso, un CV a dos
columnas mezcla la columna izquierda con la derecha y el resultado es ilegible.
De paso conserva el **tamaño de letra** de cada línea, que se usa después para
detectar los títulos de sección.

### Parseo por secciones

Antes se buscaba a ciegas en todo el texto. Ahora el CV se parte primero en
secciones (`partirEnSecciones`) y cada una se lee con sus propias reglas: un
año dentro de *Experiencia* es el periodo de un trabajo; el mismo año dentro de
*Cursos* es la fecha del curso.

El corte de sección se detecta por dos señales: que el texto coincida con un
encabezado conocido (`SECCIONES`), o que la línea sea corta, en mayúsculas y
con letra más grande que el cuerpo del documento.

> ⚠️ Las **dos primeras líneas** nunca se tratan como encabezado de sección.
> El nombre de la persona va en mayúsculas y en letra grande, igual que un
> título: sin esta excepción, el nombre se perdía.

**Cargo vs. empresa.** «2019-2024 Minera Centinela - Operador de cargador
frontal» y «2019-2024 Operador de cargador frontal - Minera Centinela» son
ambos habituales. Cuál es cuál lo decide el diccionario de oficios
(`esOficioConocido`), no el orden.

**Lo que el sistema NO adivina.** Si el OCR leyó la arroba como `Q` u `O`, el
correo no se reconstruye por su cuenta: se deja vacío y se avisa con el texto
tal cual salió. Un correo inventado le escribe a nadie y nadie se entera.

Cada CV leído guarda de dónde salió (`_origen_lectura`) y qué tan completo
quedó (`_completitud`): un CV leído por OCR merece más revisión que uno leído
de la capa de texto.

---

## 2 · Comparar cargos con la lista de CVs (`empleabilidad-match.js`)

### Por qué no se usó un modelo de IA

Un modelo de embeddings (`transformers.js` + `multilingual-e5-small`) entiende
que «operario de maquinaria pesada» y «operador de cargador frontal» se
parecen, sin escribir sinónimos. Pero pesa **118 MB** cuantizado y, sobre todo,
**no puede explicar por qué dio 62%**. Acá se deciden postulaciones de
personas: hay que poder mirar a alguien y decirle qué le faltó.

### Qué reemplazó al conteo de palabras

Lo anterior contaba cuántas palabras del criterio aparecían en el CV, dándole
el mismo peso a «LHD» que a «trabajo». Ahora:

1. **Sinónimos primero.** El criterio y el CV se expanden con el diccionario de
   oficios, así «scoop» encuentra «cargador frontal LHD».
2. **BM25 para el resto.** Pondera las palabras poco frecuentes: una que
   aparece en 3 de 200 CVs identifica; una que aparece en 190 no. El `idf` se
   recalcula cada vez que cambia la lista de CVs (`mConstruirIDF`).
3. **La ponderación de cada criterio** la sigue definiendo quien publica la
   oferta. Eso no cambió.

### El diccionario de oficios

`shared/assets/oficios-mineria.json` — 42 oficios y 18 competencias del rubro,
cada uno con sus sinónimos tal como los escribe la gente.

- **Fuentes:** CIUO 08.CL (INE, clasificador chileno oficial) y ESCO (Comisión
  Europea, versión en español).
- **Por qué es local:** se extrajo una vez y vive en el repositorio, igual que
  el mapa de Sierra Gorda. Sin llamadas a terceros y sin exponer datos de las
  personas (Regla 6).
- **Cómo ampliarlo:** agregar una entrada a `oficios` con su código CIUO, el
  nombre canónico y los sinónimos. Se comparan sin tildes y en minúsculas.

### El desglose

`matchDetalle()` devuelve el porcentaje **y** el detalle criterio por criterio:
peso, qué palabras se encontraron, cuáles no, y cuánto aportó cada uno. El
botón «¿por qué?» de la lista abre ese desglose. `matchResumen()` da la versión
de una línea: *«Falta: licencia clase D, curso de altura física»*.

`matchPct()` en `empleabilidad.js` quedó como puente: delega en el motor nuevo
y, si todavía no cargó, cae al conteo anterior en vez de fallar.

---

## 3 · CV en formato Harvard (`empleabilidad-harvard.js`)

### Qué es

No es una librería, es una norma de estructura: una sola columna, sin colores
ni gráficos, cada entrada con fecha, y cada viñeta empezando con un verbo de
acción y terminando en un resultado medible.

```
Encabezado (nombre + contacto)
Perfil            ← opcional
Educación         ← va primero
Experiencia       ← de lo más reciente a lo más antiguo
Cursos y certificaciones
Habilidades       ← idiomas, software, licencia
```

### La adaptación local, y por qué

El estándar Harvard excluye foto, RUT, fecha de nacimiento y estado civil. En
Chile el RUT y el teléfono se piden igual, y sin ellos el CV no sirve para
postular. Se mantiene la **estructura** Harvard con un encabezado de contacto
local. **La foto sí se omite**, como manda el estándar.

### Revisión antes de exportar

`hvRevisar()` no corrige: **avisa**. El texto es de la persona, no del sistema.
Marca en rojo lo que impide usar el CV (sin nombre, sin forma de contacto, sin
formación) y en ámbar lo mejorable (entradas sin fecha, viñetas que no empiezan
con verbo de acción, viñetas sin ningún número).

Dos botones en la ficha: **«Revisar formato»** muestra las observaciones sin
generar nada; **«CV formato Harvard»** exporta el PDF (avisando antes si hay
observaciones).

Se genera con el `jsPDF` que el módulo ya cargaba: **cero dependencias nuevas**
para esta parte.

---

## Dependencias

| Librería | Versión | Para qué | ¿Nueva? |
|---|---|---|---|
| `pdf.js` | 3.11.174 | Leer PDF y rasterizar páginas para el OCR | ya estaba |
| `mammoth` | 1.6.0 | Leer `.docx` | ya estaba |
| `jsPDF` | 2.5.1 | Exportar el CV Harvard | ya estaba |
| `xlsx` | 0.18.5 | Carga masiva y exportación | ya estaba |
| **`tesseract.js`** | **5.1.1** | **OCR de escaneos y fotos** | **sí — carga diferida** |

> ⚠️ `tesseract.js` es la **única dependencia nueva**. Se agregó con carga
> diferida justamente para no encarecer la visita de quien nunca sube un
> escaneo. Si hay que quitarla, `leerDocumento()` sigue funcionando para PDF
> con texto y Word; solo dejan de leerse los escaneos.

---

## Cómo funciona (base)

Separado en `index.html` + `.css` + `.js`, con su propio login.

**Ficha de CV compartible:** genera un enlace directo a una persona con el
formato `.../modules/empleabilidad/#cv=<cv_id>`, que también se reparte como
QR. La URL se arma desde `location.pathname` en tiempo de ejecución, así que
funciona en cualquier dominio.

> ⚠️ Esa construcción de URL depende de la ruta. Si el módulo se mueve de
> carpeta, hay que ajustarla o los QR ya repartidos dejan de funcionar. Las
> URLs antiguas (`/empleabilidad.html#cv=...`) siguen vivas gracias a las
> redirecciones de `vercel.json`.

## Relación con Oficina Móvil

Son las dos caras del mismo dato. `movil` captura en terreno, `empleabilidad`
administra desde la oficina. Los slugs son intercambiables a propósito: tener
uno habilita el otro.

Ambos escriben en `cv_personas`, y `movil` además registra auditoría en
`cv_logs`.

## Sensibilidad de los datos

**Es el módulo con más datos personales de todo el sistema**: RUT, nombres,
teléfonos, correos y CVs completos de personas de las comunidades. Cualquier
cambio acá se revisa contra `SEGURIDAD.md`.
