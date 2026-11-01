---
name: video-darija
description: Crea vídeos verticales (< 30 s) en darija marroquí para la cuenta de Fatima Andalussi en 3 formatos (historia, hikma, lección) con voz de ElevenLabs y subtítulos en español. Úsala cuando pida un vídeo, un guion o ideas de vídeos.
---

# Vídeo en darija · Fatima Andalussi

Quien pide es Fatima, desde el móvil. Háblale en español sencillo, sin comandos. Entrégale en el chat
`video.mp4`, `portada.jpg` y `texto-del-post.txt`.

## 0 · Preparar (cada sesión, en silencio)
`bash setup.sh && source .entorno`. Si avisa de que falta la clave de ElevenLabs, díselo a Fatima con estas
palabras: "falta configurar la voz; pídele a tu hermano que revise la clave de ElevenLabs".

## 1 · Elegir formato según el tema
| Formato | Cuándo | Cabecera del guion |
|---|---|---|
| **hikma** | un refrán o una frase sabia | `# formato: hikma` · `# pov: POV: …` · `# color: ciruela` · `# elemento: luna` |
| **historia** | historias reales (personajes, hechos: Fatima al-Fihri…) | `# formato: historia` — líneas con `[escena]`; escenas 2D a medida en `motor/src/historias/<slug>.tsx` (ver `fatima-fihri.tsx`) |
| **leccion** | consejos de vida | `# formato: leccion` — líneas con `[búsqueda en inglés]` (un clip de Mixkit por frase) |

- Colores hikma: noche, terracota, verde, arena, azul, rosa, ciruela. Elementos: luna, estrella, te, vela, hoja, corazon, llave, arco, pajaro.
- Historia: verifica los hechos en la web; dibuja con las piezas de `motor/src/dibujos/base.tsx`; la cámara nunca quieta
  (mapas vistos desde arriba para viajes, zooms, paneos). Última línea = CTA: que propongan la próxima historia.
- Trato: historia en plural (نتوما); hikma y lección en femenino (نتي) cuando encaje.
- Voz: tono de cuentacuentos, pausado; al principio del guion puedes poner `[storytelling]` en la primera línea.
- Si dudas, pregúntale a Fatima qué formato quiere.

## 2 · Guion → `videos/<slug>/guion.txt`
Lee `guias/guion.md`. Lo esencial:
- **< 30 s**: 40–55 palabras en darija, 6–8 líneas. Cada línea: `darija | español con *clave*`.
- **Darija pura** como se habla en casa, nada de árabe estándar. Trato نتي. Palabras con ق con tashkil (`تْقُولِي`).
- Voz natural: como mucho `[short pause]` y un `[warmly]`. Nada de suspiros ni susurros.
- Refrán o aleya (exacta, comprobada en quran.com) en una línea `[texto]`.
- **Enséñale el guion en darija con la traducción y espera su OK.** Ella corrige la darija.

## 3 · Voz
`node motor/scripts/voz.mjs videos/<slug> --simular` (caracteres) → `node motor/scripts/voz.mjs videos/<slug>`.
Solo cuesta si cambia la darija. La voz debe durar ≤ 26 s; si no, recorta.

## 4 · Imágenes y montaje
- lección: `node motor/scripts/stock.mjs videos/<slug>` (descarga clips; `--otro N` cambia uno).
- `node motor/scripts/render.mjs videos/<slug> --hoja` → abre `out/hoja.jpg` con Read y revisa: textos legibles, nada cortado,
  sin personas en los clips, el árabe completo.
- `node motor/scripts/render.mjs videos/<slug>` → `out/video.mp4` + `out/portada.jpg`.

## 5 · Entrega
Escribe `out/texto-del-post.txt`: gancho + 1–2 líneas + pregunta para comentarios + "Envíaselo a alguien que lo necesite"
+ 5–8 hashtags (#darija #marruecos #consejos #refranes …). Envíale los tres archivos y una línea de resumen.
Sugiere la mejor hora para publicarlo (ver `guias/crecer.md`).
