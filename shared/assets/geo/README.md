# Recurso cartográfico del sistema (`shared/assets/geo/`)

Datos vectoriales **públicos** (geometría de límites y calles) para dibujar mapas
**autocontenidos**, sin tiles ni librerías externas. Se usan en varios módulos:

- **Región de Antofagasta** → Empleabilidad y Oficina Móvil (georreferenciar
  operativos y atenciones, dashboard por punto/ciudad con filtro de tiempo).
- **Sierra Gorda (detalle urbano)** → Hoteles SG (georreferenciar hospedajes).

## Archivos

| Archivo | Qué es | Origen |
|---|---|---|
| `comunas-antofagasta.geojson` | Las 9 comunas de la Región de Antofagasta (polígonos). | IGN/BCN (shapefile oficial), reproyectado y simplificado. |
| `provincias-antofagasta.geojson` | Las 3 provincias (Antofagasta, El Loa, Tocopilla). | ídem |
| `localidades-antofagasta.geojson` | 34 localidades habitadas (Ciudad/Pueblo/Caleta/Aldea) como puntos, con nombre, comuna, entidad y población 2017. | INE 2017 / OpenStreetMap. |
| `sierra-gorda-calles.geojson` | Calles de Sierra Gorda. | OpenStreetMap. |
| `calles-<ciudad>.geojson` | Calles de Antofagasta, Calama, Tocopilla, Mejillones, Peine y Baquedano (líneas). Extraídas una vez de OSM (Overpass) y simplificadas. Las usa el dashboard de Empleabilidad **por demanda** (se cargan al hacer zoom en la ciudad). | OpenStreetMap (ODbL). |
| `sierra-gorda-edificios.geojson` | Edificios. | OpenStreetMap. |
| `sierra-gorda-servicios.geojson` | Puntos de servicio. | OpenStreetMap. |
| `sierra-gorda-espacios.geojson` | Espacios/áreas. | OpenStreetMap. |

## Detalles técnicos

- **Proyección de los datos:** WGS84 lat/long (EPSG:4326). Los shapefiles venían
  en Web Mercator (EPSG:3857) y se reproyectaron con la fórmula inversa estándar.
- **Coordenadas** redondeadas a 5 decimales; polígonos simplificados
  (Douglas–Peucker) para overview de región. Total ~210 KB.
- Los hospedajes de Sierra Gorda **no** viven aquí: salen de Supabase en tiempo
  de ejecución (traen RUT y datos sensibles — Regla 5). Este recurso es solo el
  **fondo** (comunas, calles, edificios).

## ⚠️ Sin servicios externos (Reglas 5 y 6)

Estos datos se dibujan con un **motor vectorial propio** (Canvas/SVG). **No** se
usan tiles online (Google/Mapbox/OSM tiles) ni MapLibre/Leaflet: mandarían las
coordenadas y la IP del usuario a un tercero. El mapa embebible que venía con
MapLibre + tiles OSM **no se usa tal cual** por esto; se aprovecharon solo sus
capas GeoJSON.

- **Imagen satelital:** solo es posible como **imagen estática incrustada**
  (un raster georreferenciado guardado como asset), nunca como tiles en vivo.

## Cómo se proyecta en pantalla (equirectangular con corrección de latitud)

```
x = pad + (lon - lonMin) * cos(latMedia) * escala
y = alto - pad - (lat - latMin) * escala
```

Confirmado: un pin en lat/long cae en la comuna correcta (prueba de Antofagasta,
Calama y Sierra Gorda).
