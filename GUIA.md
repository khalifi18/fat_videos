# Guía paso a paso

## Parte 1 · Ayoub (una sola vez, desde un ordenador, con la cuenta de Claude de Fatima abierta)

1. **ElevenLabs de Fatima**
   - Crear cuenta gratis en elevenlabs.io con su correo.
   - Voice Library → buscar la voz `ugVysa6SU3kBjf7zmeSV` → "Add to my voices".
   - Perfil → API Keys → crear una clave. Copiarla (no pegarla en ningún chat).
2. **Claude de Fatima → Ajustes → Capacidades**
   - Dominios permitidos, añadir: `api.elevenlabs.io`, `mixkit.co`, `assets.mixkit.co`, `fonts.googleapis.com`, `fonts.gstatic.com`, `registry.npmjs.org`.
3. **Entorno en la nube de Claude de Fatima**
   - En la configuración del entorno (donde se eligen repositorio y red), añadir la variable
     `ELEVENLABS_API_KEY` = la clave del paso 1.
4. **Prueba juntos**: nueva conversación con el repositorio `khalifi18/fat_videos` y escribir
   "Hazme un vídeo hikma sobre دير الخير وانساه". Revisar que llega el vídeo.

## Parte 2 · Fatima (cada vez, desde el móvil)

1. Abre Claude → nueva conversación con el proyecto **fat_videos**.
2. Escribe lo que quieres, por ejemplo:
   - "Dame 5 ideas para esta semana"
   - "Hazme un vídeo hikma sobre الصبر"
   - "Hazme una historia de una madre que…"
   - "Hazme una lección sobre las amistades falsas"
3. Claude te enseña el guion en darija con la traducción. Corrige lo que no digas así y responde "OK".
4. Espera unos minutos. Te llegan **el vídeo, la portada y el texto**. Descárgalos.
5. Súbelo a TikTok con el texto. Claude te dice la mejor hora.
6. Una vez por semana: pásale a Claude una captura de tus estadísticas y te dirá qué repetir.
