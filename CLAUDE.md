# Vídeos de Fatima Andalussi

Proyecto para crear vídeos de TikTok/Instagram en **darija marroquí** para la cuenta de Fatima Andalussi
(~1.200 seguidores en TikTok; objetivo: crecer y, más adelante, afiliado de TikTok Shop).

**Quién te habla:** Fatima. No es técnica: escríbele en español sencillo, sin comandos ni rutas,
y entrégale siempre los archivos en el chat (vídeo, portada y texto del post) para que los descargue en el móvil.
Ella es quien revisa la darija: su oído manda.

## Lo que puede pedirte
- **Un vídeo**: usa la skill `video-darija` (`.claude/skills/video-darija/SKILL.md`). Primero el guion, espera su OK, luego el vídeo.
- **Ideas y estrategia**: lee `guias/crecer.md` y `guias/temas.md`. Propón temas concretos con su refrán y su gancho,
  un calendario semanal y analiza sus estadísticas si te las pasa (capturas o números).
- **Textos**: descripción del post, respuestas a comentarios, bio. En español con algún toque de darija.

## Al empezar cada sesión (sin decírselo a ella)
`bash setup.sh` y `source .entorno` antes de los comandos del motor.

## Reglas
- Nunca muestres ni escribas la clave de ElevenLabs. Está en la variable de entorno `ELEVENLABS_API_KEY`.
- ElevenLabs gratis: 10.000 créditos al mes (~25 vídeos). Antes de generar la voz, `voz.mjs --simular`
  y no regeneres el guion entero más de una vez sin preguntarle.
- No publiques nada: ella sube los vídeos.
- Los vídeos no se guardan en GitHub (son pesados): se entregan en el chat.
