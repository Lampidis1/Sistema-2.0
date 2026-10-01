# AGENTS.md — Sistema AM · Antofagasta Minerals

> Punto de entrada para cualquier agente de IA (Claude Code, Cursor, Codex,
> Copilot, Gemini, etc.). Es un **resumen de arranque**: da el contexto y las
> reglas que rompen cosas si se ignoran. La **fuente de verdad completa y
> detallada es [`CLAUDE.md`](CLAUDE.md)** — léelo antes de tocar código.
> La documentación por módulo está en [`docs/`](docs/).

## Qué es
Sistema interno de **Relaciones Comunitarias de AMSA**, en **producción y uso
real**. Es un *hub de botones*: un Home que lee `config/modules.config.js` y pinta
tarjetas hacia módulos independientes (proveedores, empleabilidad, móvil, mgi,
faenas, lavanderías, feria, q100…).

## Stack
HTML + CSS + **JavaScript vanilla** (sin framework, **sin build**) · **Supabase**
(Postgres + Auth + RLS) · **Vercel** (estático; deploy = push a `main`) ·
8 librerías por CDN a versión exacta. No hay `npm install`.

## Reglas críticas (rompen el sistema si se ignoran)
1. **Nunca `type="module"`** ni IIFE/scope propio: hay 457 `onclick` que dependen
   de funciones **globales**. Falla en silencio. (CLAUDE.md §6)
2. **La seguridad real está en la base**, no en el navegador: si agregas una
   tabla, agrégale **RLS en el mismo cambio**. El frontend solo esconde botones.
3. **`anon key` sí, `service_role` jamás** en el repo. La `anon key` es pública
   por diseño (corre en el navegador).
4. **El slug de acceso no siempre coincide con el nombre del módulo**
   (histórico: Proveedores usa el slug `principal`). No inventes slugs nuevos en
   el frontend; se crean primero en la base.
5. **Cero datos personales fuera de Supabase** (nada en `localStorage` salvo
   preferencias de UI y el token de sesión). Nada de servicios externos nuevos.
6. **`?v=` cache-busting**: sube el número en el `<link>`/`<script>` **cada vez**
   que edites un `.css`/`.js`, o el navegador sirve la versión vieja.
7. **No cambies el comportamiento sin que te lo pidan**: está en producción. Si
   ves algo que arreglar de pasada, anótalo en `docs/PENDIENTES.md` y pregunta.
8. **Un módulo no depende de otro**: lo común va a `shared/`, nunca copiar/pegar.

## Cómo crear una página/módulo nuevo (mantener la lógica)
Cada módulo = una carpeta autocontenida con **tres piezas**:
```
modules/<id>/
├── index.html   estructura (el <link> css en <head>, los <script> al final)
├── <id>.css     estilos
└── <id>.js      toda la lógica (funciones globales, sin type="module")
```
Pasos (detalle en CLAUDE.md §6):
1. Crear `modules/<id>/` con esas 3 piezas. Rutas **dos niveles abajo**
   (`../../config/…`, `../../shared/…`, `../../index.html`).
2. Registrar la entrada en **`config/modules.config.js`** (no se toca el Home).
3. En la base: crear el **slug** de acceso + sus **políticas RLS**; el maestro lo
   asigna. La lectura pública, si aplica, va por **RPC `SECURITY DEFINER`** que
   valida `tiene_acceso('<slug>')` — **el schema no se expone directo** (patrón
   lavanderías/q100).
4. Login: reutilizar `shared/js/auth-guard.js` (`window.AUTH_CFG`) + mantener el
   `refreshSession()` al restaurar sesión.
5. Documentar el módulo en `docs/modulos/<id>.md`.

## Estética
Marca **Antofagasta Minerals**: fondo blanco/limpio, teal `#00A399` dominante,
dorado `#F2A900` de acento, tipografía **Barlow / Barlow Condensed**. (Skill de
marca `amsa-brand` para piezas gráficas.)

## Deploy
Push a `main` → Vercel publica solo (sitio estático). `.vercelignore` excluye
`database/`, `docs/`, `CLAUDE.md`, `README.md`, `AGENTS.md` → no se publican.
Subir `?v=` en lo que se toque.

## Memoria y documentación
- **Memoria persistente** de Claude Code: carpeta `memory/` (fuera del repo, por
  proyecto). Guarda decisiones y contexto entre sesiones; ver su índice `MEMORY.md`.
- **Documentación viva**: `docs/ARQUITECTURA.md`, `docs/SEGURIDAD.md`,
  `docs/PENDIENTES.md` (deuda técnica) y `docs/modulos/<id>.md`.
- **Migraciones** con fecha en `database/migraciones/`.

---
**Antes de programar: lee [`CLAUDE.md`](CLAUDE.md) completo.** Cada decisión
visual o de arquitectura debe poder justificarse con una regla de ese archivo.
