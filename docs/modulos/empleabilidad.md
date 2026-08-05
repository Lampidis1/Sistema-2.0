# Módulo: Empleabilidad

| | |
|---|---|
| **id** | `empleabilidad` |
| **Slug de acceso** | `empleabilidad` (o `movil` — cualquiera de los dos habilita) |
| **Ruta** | `modules/empleabilidad/index.html` |
| **En el Home** | Sí |
| **Estado** | Activo · en producción |
| **Archivos** | `index.html` 217 · `empleabilidad.css` 101 · `empleabilidad.js` 1.077 líneas |

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

## Cómo funciona

Separado en `index.html` + `.css` + `.js`, con su propio login. Usa `pdf.js` y `mammoth`
para leer CVs subidos en PDF y Word, y `jsPDF` / `xlsx` para exportar.

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
