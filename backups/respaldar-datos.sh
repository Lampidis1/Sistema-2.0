#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Respaldo completo de datos · sistema-am-v2
#
# POR QUÉ ESTE SCRIPT LO CORRES TÚ Y NO CLAUDE
#   Necesita la contraseña de la base, y las credenciales no se le entregan a
#   un asistente ni quedan escritas en el repositorio (Regla de oro 4).
#
# DÓNDE SACAR LA CADENA DE CONEXIÓN
#   Supabase → Project Settings → Database → Connection string → URI
#   Copiar la de "Session pooler" y reemplazar [YOUR-PASSWORD].
#
# USO
#   chmod +x backups/respaldar-datos.sh
#   ./backups/respaldar-datos.sh "postgresql://postgres.xxxx:CLAVE@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
#
# El archivo queda en backups/<fecha>/ , que está en .gitignore y NUNCA
# debe subirse: contiene RUTs, nombres, teléfonos, firmas y CVs.
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

DB_URL="${1:-}"
if [ -z "$DB_URL" ]; then
  echo "ERROR: falta la cadena de conexión."
  echo "Uso: $0 \"postgresql://postgres.xxxx:CLAVE@...pooler.supabase.com:5432/postgres\""
  exit 1
fi

FECHA="$(date +%Y-%m-%d)"
DIR="$(cd "$(dirname "$0")" && pwd)/$FECHA"
mkdir -p "$DIR"

# pg_dump 17 para que coincida con el servidor (Postgres 17.6)
DUMP="pg_dump"
if ! command -v pg_dump >/dev/null 2>&1; then
  if [ -x /opt/homebrew/opt/postgresql@17/bin/pg_dump ]; then
    DUMP=/opt/homebrew/opt/postgresql@17/bin/pg_dump
  elif [ -x /usr/local/opt/postgresql@17/bin/pg_dump ]; then
    DUMP=/usr/local/opt/postgresql@17/bin/pg_dump
  else
    echo "ERROR: no hay pg_dump. Instalar con:  brew install postgresql@17"
    exit 1
  fi
fi

echo "→ Respaldando esquema + datos de public/ ..."
"$DUMP" "$DB_URL" \
  --schema=public \
  --no-owner --no-privileges \
  --file "$DIR/datos-completo-$FECHA.sql"

gzip -f "$DIR/datos-completo-$FECHA.sql"

echo
echo "✅ Listo: $DIR/datos-completo-$FECHA.sql.gz"
echo "   $(du -h "$DIR/datos-completo-$FECHA.sql.gz" | cut -f1)"
echo
echo "⚠️  Contiene datos personales. No lo subas a ningún lado."
echo "   backups/ ya está en .gitignore — verifícalo con:  git status"
