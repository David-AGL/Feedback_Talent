#!/usr/bin/env bash
set -euo pipefail

# Configurables (puedes inyectar BACKEND_DIR o REACT_SECRET_PATH desde Render)
BACKEND_DIR="${BACKEND_DIR:-./backend}"
SRC="${RENDER_SECRET_PATH:-/etc/secrets/.env}"  # ruta del secret montado en Render
DEST="$BACKEND_DIR/.env"

echo "[render-start] BACKEND_DIR=$BACKEND_DIR SRC=$SRC DEST=$DEST"

# Copiar .env si el secret existe; no fallar si no existe (Render puede exponer variables de entorno en lugar de archivo)
if [ -f "$SRC" ]; then
	mkdir -p "$(dirname "$DEST")"
	cp "$SRC" "$DEST"
	chmod 600 "$DEST" || true
	echo "[render-start] Copiado $SRC -> $DEST"
else
	echo "[render-start] Aviso: no se encontró el archivo secreto en $SRC. Continuando — asegúrate de definir las variables de entorno en Render."
fi

# Comprobar que node está disponible
if ! command -v node >/dev/null 2>&1; then
	echo "[render-start] Error: node no está disponible en PATH. Asegúrate de usar la imagen correcta en Render."
	exit 1
fi

# Ir al directorio del backend
cd "$BACKEND_DIR"
echo "[render-start] Directorio actual: $(pwd)"

# Ejecutar el comando de arranque preferido
if [ -f package.json ] && grep -q '"start"' package.json; then
	echo "[render-start] Ejecutando: npm run start"
	exec npm run start
elif [ -f dist/server.js ]; then
	echo "[render-start] Ejecutando: node dist/server.js"
	exec node dist/server.js
elif [ -f server.js ]; then
	echo "[render-start] Ejecutando: node server.js"
	exec node server.js
else
	echo "[render-start] Error: no se encontró un entrypoint (package.json start o dist/server.js). Asegúrate de haber ejecutado 'npm run build' en el paso de build o ajusta BACKEND_DIR."
	exit 1
fi
