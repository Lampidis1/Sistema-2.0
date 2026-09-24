# Programas · vínculo con el repo del ejecutor (contrato JSON)

## Qué resuelve

En **Proveedores → Programas / Iniciativas**, cada programa puede tener una
**empresa/consultora que lo ejecuta** (ej: *Proveedor Seguro* lo ejecuta
*Dos Barbas*) y un **informe público en un repositorio** (GitHub u otro enlace).

El sistema **sincroniza** los participantes y sus avances desde ese informe hacia
Supabase (tabla `programa_participantes`) y arma un **dashboard por programa** al
hacer clic en su tarjeta. Los datos personales quedan **solo en Supabase**, nunca
en el sitio estático (Regla 5). El repo queda como enlace "Ver informe ↗".

## Campos del programa (ventana Programas)

| Campo | Para qué |
|---|---|
| Empresa / consultora que ejecuta | Quién lleva el programa (ej: Dos Barbas). |
| Contacto del ejecutor | Nombre o correo, opcional. |
| Repositorio / informe | Enlace público al informe (botón "Ver informe ↗"). |
| Datos del dashboard (JSON) | **URL raw** del JSON con el formato de abajo. Es lo que se sincroniza. |

> Si el JSON no está configurado, el programa igual funciona: solo muestra el
> enlace al repo, sin dashboard.

## Contrato de datos (JSON estándar)

Para que **cualquier programa** se conecte igual, la empresa ejecutora publica en
su repo un archivo JSON (por ejemplo `data/informe.json`) y entrega su **URL raw**
(ej: `https://raw.githubusercontent.com/usuario/repo/main/data/informe.json`).
GitHub sirve los `raw.githubusercontent.com` con CORS abierto, así el sistema
puede leerlo desde el navegador.

Formato (`contrato: "proveedor-seguro/informe@1"`):

```json
{
  "contrato": "proveedor-seguro/informe@1",
  "programa": "Proveedor Seguro",
  "ejecutor": "Dos Barbas",
  "generado": "2026-09-24",
  "participantes": [
    {
      "rut": "15.042.128-4",
      "representante": "Ingrid Fernanda Guerrero Guerrero",
      "empresas": ["Hostal Tronar 1", "Hostal Tronar 2"],
      "empresa_principal": "Hostal Tronar 1",
      "localidad": "Sierra Gorda",
      "avance_plataforma": 0,
      "categoria": "Sin conexión",
      "estado_plataforma": "sin_conexion"
    }
  ]
}
```

### Reglas de cada participante

- `rut` — **obligatorio**; es la llave (una fila por RUT y por programa). En este
  informe es el RUT de la **persona representante**.
- `representante` — nombre de la persona.
- `empresas` — arreglo con una o **varias sucursales** (si una persona participa
  con más de un local). `empresa_principal` es la primera si se omite.
- `localidad` — para el gráfico "por localidad".
- `avance_plataforma` — número 0–100.
- `estado_plataforma` — `completo` | `en_curso` | `sin_conexion`. Si se omite, se
  deduce del avance (100 → completo, >0 → en curso, 0 → sin conexión).
- `categoria` / `metricas` — texto/objeto libre para el detalle.

## Cómo se usa

1. En la tarjeta del programa → **Abrir →** (o clic en la tarjeta).
2. **🔄 Sincronizar desde repo**: lee el JSON de `datos_url` y actualiza
   `programa_participantes` (upsert por `programa_cat_id + rut`). Deja historial y
   `ultima_sync`.
3. El dashboard muestra KPIs (participantes, empresas/sucursales, completaron, en
   curso, sin conexión, avance promedio), gráficos (estado, por localidad) y la
   tabla de participantes con sus sucursales.
4. **➕ Crear faltantes en directorio** (opcional): crea en el directorio de
   proveedores los participantes que aún no existen (dedupe por RUT), marcados con
   `origen = programa:<título>`. En el directorio se aíslan con el filtro
   **🧩 Creados por subsistema**.

> ⚠️ El RUT del informe *Proveedor Seguro* es el de la persona representante, no el
> de la empresa. Por eso la creación en el directorio es una **acción manual**
> (botón), no automática, y los registros quedan etiquetados y filtrables.

## Datos (Supabase, con RLS)

Migración: `programas_ejecutor_repo_participantes`.

| Tabla / columna | Qué guarda |
|---|---|
| `programas_catalogo.ejecutor`, `ejecutor_contacto`, `repo_url`, `datos_url`, `ultima_sync` | Ejecutor y vínculo al informe. |
| `programa_participantes` | Participantes sincronizados (rut, representante, empresas[], sucursales, localidad, avance, estado, métricas, proveedor_id). RLS `es_admin() or es_principal()`. |
| `proveedores.origen`, `origen_ref` | Marca de qué subsistema creó el registro (para el filtro del directorio). |

El adaptador HTML→JSON del informe actual de Dos Barbas (que hoy solo tiene los
`chapters/*.html`) se generó una vez; lo ideal es que el ejecutor publique el JSON
en su repo para que "Sincronizar" quede automático.
