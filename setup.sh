#!/usr/bin/env bash
# Prepara el proyecto en una sesión nueva (nube o Linux). Se ejecuta solo una vez por sesión.
#   bash setup.sh
set -e
cd "$(dirname "$0")"
if [ ! -d motor/node_modules/remotion ]; then
  echo "Instalando el motor (1–2 min)…"
  (cd motor && npm install --no-audit --no-fund --loglevel=error)
fi
command -v ffmpeg >/dev/null || { echo "FALLO · falta ffmpeg"; exit 1; }
# Chromium ya instalado en la nube (Playwright): Remotion lo usa en vez de descargar el suyo
if [ -z "$REMOTION_BROWSER" ]; then
  CH=$(node -e "try{console.log(require('playwright').chromium.executablePath())}catch(e){}" 2>/dev/null || true)
  [ -n "$CH" ] && echo "export REMOTION_BROWSER=$CH" > .entorno
fi
grep -q REMOTION_GL .entorno 2>/dev/null || echo "export REMOTION_GL=swangle" >> .entorno
if [ -z "$ELEVENLABS_API_KEY" ] && [ ! -f .env ]; then
  echo "AVISO · falta ELEVENLABS_API_KEY (variable del entorno en la nube): sin ella no hay voz"
fi
echo "OK · listo. Antes de cada comando:  source .entorno"
