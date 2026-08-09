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

## Dependencia nueva: Leaflet + OpenStreetMap

- **Leaflet 1.9.4** (BSD-2, sin dependencias, ~147 KB) por CDN, versión fija
  como las otras 7 librerías.
- Las imágenes del mapa vienen de **`tile.openstreetmap.org`**. Eso significa
  que el navegador de cada visitante hace peticiones a ese servidor, y por
  tanto **expone su IP a un tercero** — el mismo problema que Google Fonts
  (`docs/PENDIENTES.md` → P-5). OpenStreetMap es una fundación sin fines de
  lucro, no una red publicitaria, pero es un tercero igual.
  Alternativa si algún día molesta: una imagen estática del pueblo con los
  puntos dibujados encima, sin ninguna llamada externa.

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
