# Módulo: Hoteles SG

| | |
|---|---|
| **id** | `hoteles-sg` |
| **Slug de acceso** | — **ninguno: es pública** |
| **Ruta** | `modules/hoteles-sg/index.html` |
| **En el Home** | Sí, fila de módulos |
| **Estado** | Activo · 2026-08-08 |
| **Archivos** | `index.html` · `hoteles-sg.css` · `hoteles-sg.js` |
| **Lee** | vista `hoteles_sg_publico` (**no** la tabla `proveedores`) |

## Qué problema resuelve

Mostrar públicamente qué hospedajes del programa MGI Habitabilidad tienen
capacidad en el pueblo de Sierra Gorda, con sus datos de contacto y ubicación,
para que las empresas colaboradoras encuentren dónde alojar trabajadores.

## 🔒 Lo más importante: por qué NO lee `proveedores`

Esta página **no pide contraseña**, así que cualquiera en internet ve lo que
ella cargue. La tabla `proveedores` trae RUT, correos y teléfonos de todos los
proveedores de la región, muchos personas naturales: abrirla a `anon` habría
publicado datos personales (CLAUDE.md Regla 5).

En su lugar hay una **vista** con solo lo necesario:

```sql
create view hoteles_sg_publico as
select ... from proveedores p left join hoteleria h ...
where p.programa_mgi is true
  and coalesce(p.programa_mgi_rubro,'hoteleria')='hoteleria'
  and lower(coalesce(p.localidad,'')) like '%sierra gorda%';
grant select on hoteles_sg_publico to anon;
```

**El RUT no se publica.** Para poder agrupar los hospedajes de un mismo dueño
(un RUT puede tener varios) la vista expone `grupo`, que es `sha256(rut)`:
sirve para agrupar, no permite reconstruir el RUT.

Verificado: `proveedores` sigue devolviendo `[]` a un cliente sin sesión.

> ⚠️ Si alguna vez se agrega un campo a esta vista, recordar que va directo a
> internet sin login.

## Las tres vistas

1. **Disponibles** — hospedajes con habitaciones registradas, en fichas o
   lista, con buscador. Los que no tienen capacidad cargada **no** aparecen
   acá: sin ese dato no se puede afirmar que haya disponibilidad.
2. **Mapa** — Leaflet sobre el pueblo. Los hospedajes que comparten esquina se
   separan unos metros para no taparse entre ellos.
3. **Todos por empresa** — el listado completo, alfabético y agrupado por
   `grupo`, para ver qué hospedajes son del mismo dueño.

## Cómo se calculan las camas

`camas_max = simples + dobles × 2`, porque **una habitación doble puede
ocuparse como simple**. Lo calcula la vista, no el navegador.

## El mapa no depende de ningún servidor de mapas

**Leaflet 1.9.4** (BSD-2, sin dependencias) por CDN, versión fija como las
otras librerías. Pero **el mapa en sí es un archivo del repositorio**:

`shared/assets/mapa-sierra-gorda.geojson` — 55 KB con el pueblo completo:
124 elementos entre calles, manzanas, edificios y la línea férrea.

Ventajas de tenerlo local en vez de pedir imágenes a un servidor de mapas:

- **Ningún tercero ve la IP** de quien entra a la página (a diferencia de
  `tile.openstreetmap.org` o Google Maps).
- **Funciona aunque el servicio de mapas de turno se caiga** o cambie sus
  condiciones de uso.
- Pesa menos que las imágenes de un solo nivel de zoom, y se ve nítido en
  cualquier zoom porque es vectorial.
- Los marcadores también son propios (`divIcon` con CSS) y muestran las
  habitaciones libres: los iconos que trae Leaflet se bajan de su CDN.

**Atribución obligatoria:** los datos son de OpenStreetMap bajo ODbL, así que
el mapa muestra «Calles © colaboradores de OpenStreetMap (ODbL)». No se puede
quitar.

### Cómo actualizar el plano del pueblo

```bash
curl -s -X POST https://overpass-api.de/api/interpreter --data-binary @- <<'EOF' -o osm.json
[out:json][timeout:90];
(
  way["highway"](-22.9010,-69.3320,-22.8820,-69.3090);
  way["building"](-22.9010,-69.3320,-22.8820,-69.3090);
  way["landuse"](-22.9010,-69.3320,-22.8820,-69.3090);
  way["railway"](-22.9010,-69.3320,-22.8820,-69.3090);
);
out geom;
EOF
```

Después se convierte a GeoJSON con las clases que usa el CSS (`principal`,
`calle`, `camino`, `edificio`, `tren`, `zona`) y coordenadas a 5 decimales
(≈1 m, suficiente y mantiene el archivo chico).

### Por qué faltan hospedajes de calle Díaz Gana

**Esa calle no existe en OpenStreetMap** — se verificó con Overpass: el pueblo
tiene 15 calles con nombre y Díaz Gana no está entre ellas. Por eso esos
hospedajes no se pudieron geocodificar y aparecen listados bajo el mapa.

Dos salidas: agregar la calle a OpenStreetMap (queda para todos y en la
próxima extracción aparece sola), o cargar a mano `lat`/`lng` de esos
hospedajes editando el proveedor.

### Sobre Google Maps

Se evaluó. **Descargar sus mapas no es viable**: sus condiciones prohíben
almacenar o servir sus imágenes por fuera de su API. Usar la API en vivo
exige una clave con facturación asociada (visible en el navegador, aunque se
puede restringir por dominio), cobra pasado un tramo gratuito, y hace que
Google vea la IP de cada visitante. Para un pueblo de 15 calles, el GeoJSON
local cubre la necesidad sin ninguna de esas contras.

## Las coordenadas

Se geocodificaron **una sola vez** con Nominatim (OpenStreetMap) desde el
equipo de desarrollo y se guardaron en `proveedores.lat/lng`. **La página
pública no llama a Nominatim**: solo lee lo guardado.

- 53 de 68 tienen coordenada.
- Los 15 restantes son casi todos de calle **Díaz Gana**, que no está mapeada
  en OpenStreetMap. Aparecen listados bajo el mapa, no se ocultan.
- Se descartaron coordenadas fuera de un recuadro alrededor del pueblo: una
  búsqueda había devuelto un punto a 60 km.

Para corregir una ubicación a mano: editar `lat`/`lng` del proveedor.

## De dónde salen los datos

De Proveedores. Un hospedaje aparece acá cuando tiene marcado **Programa MGI
Habitabilidad** con sección *Hotelería*, está en Sierra Gorda, y tiene
habitaciones cargadas en MGI.
