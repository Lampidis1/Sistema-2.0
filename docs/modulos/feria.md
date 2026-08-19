# Módulo Feria Digital · CV Minero QR

Digitaliza la feria laboral minera: el postulante arma su **Currículum Minero**
(foto/PDF/Word → OCR → estructura → valida), obtiene una **credencial con QR**
reutilizable y postula a cargos. Las empresas publican cargos y ven candidatos;
los reclutadores **escanean el QR** en el stand y registran la interacción; el
administrador (AMSA) crea ferias, gobierna datos y saca reportes.

Nace de la propuesta *CV Minero QR* (PPT). **Todo el motor corre en el navegador**
(tesseract para OCR, diccionario minero para el matching): ningún CV sale a
terceros. **No usa Azure ni OpenAI** — cumple las Reglas 5 y 6. El QR lleva solo
un token aleatorio, nunca el RUT ni el nombre.

## Los 4 roles y sus páginas

| Rol | Página | Acceso |
|---|---|---|
| **Postulante** | `postulante.html` | **Público**, por `?codigo=` (código del evento) + consentimiento. Sin sesión. |
| **Administrador (AMSA)** | `index.html` | Autenticado, slug `feria`. |
| **Empresa** | `empresa.html` | Autenticado, slug `feria_empresa`. Publica cargos, ve candidatos. |
| **Reclutador** | `empresa.html` (pestaña Escanear) | Igual, rol `reclutador` en el stand. |

## Flujo del postulante (público)

Código de feria + consentimiento → RUT (busca CV precargado) → **subir foto/PDF/Word
(OCR) o crear desde cero** → editar Currículum Minero → **credencial con QR** (PDF) →
**empresas recomendadas por compatibilidad** con explicación *cumple/brecha* → postular.

## Panel empresa / reclutador

- **Escanear QR** con la cámara (jsQR) → resuelve el token → muestra el CV al
  instante, sugiere el mejor cargo por compatibilidad, y permite marcar estado +
  comentario (queda en la **bitácora**).
- **Candidatos**: 3 bases — *postulados* (app), *escaneados* (stand) y *todos* —
  ordenados por match, con «Ver CV» y exportación a Excel.
- **Mis cargos**: publicar/editar cargos con criterios y ponderación.
- **Bitácora**: trazabilidad completa (fecha, candidato, acción, estado, comentario).

## Panel administrador

Ferias (crear, código de acceso, estado) → por feria: **Empresas** (alta + enlazar
usuarios por correo con `feria_asignar_usuario`), **Cargos**, **Inscritos**, y
**Reportes** (inscritos por comuna, postulaciones por empresa, escaneos por stand,
cargos con más demanda) con **exportación consolidada** a Excel.

> El administrador enlaza usuarios a un stand, pero el **slug `feria_empresa`** se
> asigna aparte en «Gestión de usuarios» (`aprobar_usuario_v2`), como el resto.

## Datos (Supabase, con RLS)

Migración `database/migraciones/2026-08-19_feria_digital.sql`.

| Tabla | Qué guarda |
|---|---|
| `ferias` | El evento y su código de acceso. |
| `feria_empresas` | Empresas con stand en la feria. |
| `feria_empresa_usuarios` | Enlace usuario↔empresa (rol empresa/reclutador). |
| `feria_participantes` | Inscritos, con `credencial_token` (el del QR) y consentimiento. |
| `feria_bitacora` | Trazabilidad: cada escaneo/acción en un stand. |

Reutiliza `cv_personas` (Currículum Minero), `cv_ofertas` (cargos) y
`cv_postulaciones` (postulaciones), con columnas `feria_id`/`feria_empresa_id`.

**RPCs** `SECURITY DEFINER`: `feria_feria_por_codigo`, `feria_buscar_cv`,
`feria_guardar_cv`, `feria_cargos_publicos`, `feria_postular` (anon, flujo
público); `feria_resolver_qr` (reclutador, resuelve el token→CV);
`feria_asignar_usuario` (admin).

## Archivos

```
modules/feria/
├── postulante.html + feria-postulante.js + feria-postulante.css   (público)
├── index.html + feria-admin.js                                     (admin)
├── empresa.html + feria-empresa.js                                 (empresa/reclutador)
└── feria.css                                                       (estilos de los paneles autenticados)
```

Reutiliza `../empleabilidad/empleabilidad-lectura.js` (OCR) y
`../empleabilidad/empleabilidad-match.js` (matching explicable), y el diccionario
`shared/assets/oficios-mineria.json`.

## Pendientes / ideas futuras

- Check-in de asistencia por escaneo en la entrada (hoy el check-in se marca en el
  primer escaneo de stand).
- El postulante ve el estado de sus postulaciones (hoy es de ida).
- La búsqueda por RUT del flujo público permite, con el código del evento, saber si
  un RUT tiene CV. Está acotada por el código; si se quiere endurecer, agregar un
  segundo factor (p. ej. verificar teléfono) antes de prellenar.
