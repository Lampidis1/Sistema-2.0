# API de MGI — Guía de integración para desarrolladores

API para que un sistema externo lea y **proponga cambios** sobre las empresas del
programa **MGI Habitabilidad** de Antofagasta Minerals: hospedajes (ficha
completa + camas/habitaciones), lavanderías y alimentación (ficha editable), y en
los **tres rubros** los **criterios de estandarización**.

> **Modelo de validación (importante).** La API **no escribe directo** en el
> sistema. Cada cambio que envías queda **PENDIENTE** en una cola y un
> administrador de MGI lo **aprueba o rechaza**. Recién al aprobarlo se aplica a
> los datos reales. Esto cumple la regla de "todo cambio se valida". Consulta el
> estado de tu cambio con `mgi_api_estado_cambio`.

## 1. Autenticación

Dos credenciales, ambas en cada llamada:

1. **`apikey`** (encabezado HTTP): el *anon key* público del proyecto Supabase.
2. **`p_key`** (en el cuerpo JSON): tu **llave de integración** MGI, que el
   administrador te entrega desde el panel de MGI. La llave identifica y autoriza
   a tu integración. **Nunca va en la URL.**

Las llamadas son **POST** a:

```
https://<PROYECTO>.supabase.co/rest/v1/rpc/<funcion>
Headers:  apikey: <ANON_KEY>
          Content-Type: application/json
```

Si la llave es inválida o fue revocada, la respuesta es `{"error":"llave_invalida"}`.

## 2. Lectura

### `mgi_api_empresas` — listar empresas del programa
Cuerpo: `{ "p_key": "...", "p_rubro": "hoteleria" }` (`p_rubro` opcional:
`hoteleria` | `lavanderia` | `alimentacion`; omítelo para todas).
Respuesta: `{ ok, empresas: [{ proveedor_id, nombre, rut, localidad, rubro, es_hoteleria }] }`.

### `mgi_api_empresa` — ficha completa de una empresa
Cuerpo: `{ "p_key": "...", "p_proveedor_id": "re_766262473" }`.
Respuesta:
```json
{ "ok": true,
  "ficha": { "proveedor_id","razon_social","nombre_fantasia","rut","direccion",
             "localidad","correo","fono","rubro","descripcion" },
  "capacidad": { "hab_simples","hab_dobles","hab_banio","camas_disponibles","habitaciones_json" },
  "hospedaje_mgi": { ... campos del programa ... },
  "contactos": [ { "contacto_id","nombre","cargo","fono","correo","principal" } ],
  "avance_criterios": [ { "criterio_id","hitos_done":[0,1] } ] }
```
`capacidad` y `hospedaje_mgi` vienen en `null` cuando la empresa no es hospedaje.

### `mgi_api_criterios` — criterios de estandarización (para mapear decretos)
Cuerpo: `{ "p_key": "...", "p_rubro": "hoteleria" }` (opcional).
Respuesta: `{ ok, criterios: [{ criterio_id, rubro, nombre, ponderacion, hitos }] }`
donde `hitos` es `[{ "n": "Firma SEC", "p": 30 }, ...]` (nombre del hito y su peso).

## 3. Los criterios de estandarización ↔ decretos supremos

Este es el corazón de la integración. El modelo es:

- Un **criterio** (`est_criterios`) pertenece a un **rubro** y tiene una
  **ponderación** (peso del criterio en el % total) y una lista de **hitos**
  (`hitos`: `[{n, p}]`), cada hito con su propio peso `p` (los `p` de los hitos
  suman 100 dentro del criterio).
- El **avance** de una empresa (`avance_criterios`) es, por criterio, la lista de
  **índices de hitos cumplidos** (`hitos_done`). Ej.: `hitos_done: [0, 2]` = el
  1er y 3er hito de ese criterio están cumplidos.

**Cómo lo mapea tu sistema (decretos):** en tu lado, asocia cada `criterio_id`
(y cada hito por su índice/nombre) al artículo del **decreto supremo** que
corresponda (D.S. N° 594, D.S. N° 40, etc.). Cuando tu sistema determine que una
empresa cumplió un requisito de un decreto, **propones** marcar el hito
correspondiente con `criterio_avance` (ver abajo). El % de estandarización lo
calcula MGI a partir de los pesos.

## 4. Proponer un cambio (queda en la cola de validación)

### `mgi_api_proponer`
Cuerpo: `{ "p_key","p_proveedor_id","p_tipo","p_payload" }`.
Respuesta: `{ ok, cambio_id, estado:"pendiente" }`.

`p_tipo` y su `p_payload` (solo los campos que quieras cambiar; lo omitido no se toca):

| `p_tipo` | Aplica a | `p_payload` |
|---|---|---|
| `ficha` | ficha de la empresa (los 3 rubros) | `{razon_social, nombre_fantasia, rut, direccion, localidad, correo, fono, descripcion}` |
| `contacto` | contacto de la empresa | `{contacto_id?, nombre, cargo, fono, correo, principal}` (sin `contacto_id` crea uno) |
| `capacidad` | camas/habitaciones (hospedajes) | `{hab_simples, hab_dobles, hab_banio, camas_disponibles, habitaciones_json}` |
| `hospedaje_mgi` | datos del programa (hospedajes) | `{codigo_mgi, participa, camas_instaladas, eecc_hospeda, arrendado_completo, hab_disponibles, n_hospedados, camas_disponibles, al_dia_pagos, notas}` |
| `criterio_avance` | avance de un criterio (los 3 rubros) | `{criterio_id, hitos_done:[0,1,2]}` |
| `empresa_crear` | alta de empresa MGI | `{razon_social, nombre_fantasia, rut, direccion, localidad, correo, fono, descripcion, rubro}` (con `empresa_crear`, `p_proveedor_id` va vacío) |

### `mgi_api_estado_cambio` — consultar el estado de tu cambio
Cuerpo: `{ "p_key","p_cambio_id" }`.
Respuesta: `{ ok, cambio_id, tipo, estado: "pendiente"|"aplicado"|"rechazado", resultado, comentario, creado }`.
Sondea este endpoint para saber cuándo el admin aprobó (o rechazó, con motivo) tu propuesta.

## 5. Ejemplos (curl)

Listar hospedajes:
```bash
curl -X POST 'https://<PROYECTO>.supabase.co/rest/v1/rpc/mgi_api_empresas' \
  -H 'apikey: <ANON_KEY>' -H 'Content-Type: application/json' \
  -d '{"p_key":"<LLAVE_MGI>","p_rubro":"hoteleria"}'
```

Proponer marcar un hito de un criterio (mapeo de decreto):
```bash
curl -X POST 'https://<PROYECTO>.supabase.co/rest/v1/rpc/mgi_api_proponer' \
  -H 'apikey: <ANON_KEY>' -H 'Content-Type: application/json' \
  -d '{"p_key":"<LLAVE_MGI>","p_proveedor_id":"re_766262473",
       "p_tipo":"criterio_avance","p_payload":{"criterio_id":"ec_elec_hot","hitos_done":[0,1]}}'
```

Actualizar camas de un hospedaje:
```bash
curl -X POST 'https://<PROYECTO>.supabase.co/rest/v1/rpc/mgi_api_proponer' \
  -H 'apikey: <ANON_KEY>' -H 'Content-Type: application/json' \
  -d '{"p_key":"<LLAVE_MGI>","p_proveedor_id":"re_766262473",
       "p_tipo":"capacidad","p_payload":{"hab_simples":10,"hab_dobles":4,"camas_disponibles":6}}'
```

## 6. Modelo de datos (referencia)

Todo vive en `public` (con RLS) y se toca **solo** por estas funciones
(`SECURITY DEFINER`). Tablas de la API: `mgi_api_keys` (llaves) y
`mgi_api_cambios` (la cola). Tablas de MGI que se leen/escriben al aprobar:
`proveedores` (ficha), `contactos`, `hoteleria` (capacidad), `hospedajes_mgi`
(programa), `est_criterios` (criterios) y `est_avance` (avance).

## 7. Notas de operación

- **Aislamiento inicial:** antes de habilitar la API se tomó una copia de
  seguridad de las tablas de MGI (esquema `respaldo_mgi_20260922`), para poder
  volver a la foto previa si hiciera falta.
- **Revocar una integración:** el admin desactiva la llave; a partir de ahí toda
  llamada responde `llave_invalida`.
- **Errores comunes:** `llave_invalida`, `empresa_no_existe`, `tipo_invalido`,
  `no_encontrado`.
