# Respaldo de la estructura anterior — Sistema-2.0

Esta carpeta es una copia exacta de lo que había en el repositorio
`Lampidis1/Sistema-2.0` en GitHub al momento de reemplazarlo por la
estructura reorganizada (`modules/` + `shared/` + `database/` + `docs/`).

**Descargada:** 2026-08-05, desde `main` (commit `98010fa`).

## Por qué existe

Antes de reemplazar el contenido del repo, se archiva tal cual estaba: 16
archivos HTML monolíticos en la raíz (HTML+CSS+JS mezclados, sin `modules/`
ni control de versiones real — se editaba subiendo archivos por la web de
GitHub). Es el estado "antes" que describe `CLAUDE.md` §8.

Apunta al mismo proyecto Supabase (`txshloeobpolanyedlva`) que la versión
nueva — no es una base de datos distinta, es la misma, con otra forma de
presentar el frontend.

## Qué NO es

No es código activo. No se sirve, no se enlaza desde `index.html`, no entra
en `config/modules.config.js`. Es solo referencia histórica y material de
reversión si algo de la reorganización se comportara distinto a como se
esperaba.

## Contenido

16 archivos: `index.html` (home viejo) + 7 módulos monolíticos
(`proveedores.html`, `empleabilidad.html`, `movil.html`, `mgi.html`,
`centinela.html`, `antucoya.html`, `zaldivar.html`) + variantes sueltas de
edición manual (`index1.html`, `index2.html`, `proveedores1.html`,
`proveedores3.html`, `checklist.html`, `hoteles.html`) + `config.js`
(la misma anon key que `config/supabase.config.js` en la raíz del proyecto
nuevo) + `README.md` original.
