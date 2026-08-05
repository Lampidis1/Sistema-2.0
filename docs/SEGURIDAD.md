# Seguridad y manejo de datos

Reglas acordadas con el dueño del proyecto. Aplican a todo el código.

## Qué datos maneja el sistema

| Tipo | Ejemplos | Sensibilidad |
|---|---|---|
| Personales | RUT, nombres, teléfonos, correos, CVs, becados | **Alta** — Ley 19.628 / 21.719 |
| De empresas | Razón social, RUT de empresa, contactos comerciales | Media |
| Internos AMSA | Licitaciones, evaluaciones, datos de faenas | Media-alta |

## Las reglas

**1. Sin backend propio.** Todo corre en el navegador contra Supabase. Sin
funciones serverless. La seguridad es Auth + RLS.

**2. `anon key` pública, `service_role` jamás.** La `anon key` está en el repo
a propósito: corre en el navegador y no puede ser secreta. La `service_role`
salta RLS por completo y **nunca** entra al repositorio.

**3. Nada personal fuera de Supabase.** Ni `localStorage`, ni terceros, ni
URLs. En `localStorage` solo preferencias de interfaz y el token de sesión.
> ⚠️ Se incumple hoy. Ver `PENDIENTES.md` → P-2.

**4. Autenticación en todos los módulos.** Ningún módulo alcanzable sin
sesión.
> El Home todavía no la tiene. Ver `PENDIENTES.md` → P-3.

**5. Cero analytics, cero tracking, cero APIs de terceros.** Solo Supabase y
las 7 librerías de exportación ya presentes. Agregar una dependencia es
decisión del dueño del proyecto.

**6. SQL y documentación fuera del despliegue.** `.vercelignore` excluye
`database/` y `docs/`. Los `.sql` traen el esquema y las funciones de
seguridad completas.

**7. Nada personal en las URLs.** Sin RUT ni identificadores de persona en
query strings: quedan registrados en los logs de Vercel y en el historial del
navegador.

## Si agregas una tabla

1. `alter table ... enable row level security;`
2. Políticas de `select` / `insert` / `update` / `delete`.
3. Patrón: ver → roles con acceso · escribir → `es_editor()` · borrar → `es_admin()`.
4. Probar con un usuario **sin** el acceso y confirmar que no ve nada.

Una tabla sin RLS queda legible por cualquier usuario autenticado, sin
importar sus `accesos`.

## Hallazgos abiertos

Al reorganizar se detectaron dos exposiciones reales, sin resolver:

- **P-1** — el bucket `documentos` se lee sin autenticación, desde internet.
- **P-2** — la base local se vuelca completa a `localStorage`, siempre.

Detalle y arreglo propuesto en [PENDIENTES.md](PENDIENTES.md).
