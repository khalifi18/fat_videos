# Clips de vídeo (Mixkit)

`node motor/scripts/stock.mjs videos/<slug>` busca en Mixkit un clip por línea con la palabra entre
corchetes, **solo con "Stock Video Free License"** (gratis, uso comercial y en redes, sin atribución),
prefiere verticales y descarta títulos con personas (man, woman, girl, family…).
Los créditos quedan en `out/creditos.txt`.

## Buenas búsquedas (1–2 palabras en inglés, sin personas)
| Idea | Búsquedas |
|---|---|
| paciencia, tiempo | `clock`, `hourglass`, `sunrise`, `seasons` |
| crecer, lo que no se ve | `tree`, `roots`, `seed`, `plant`, `forest` |
| esperanza | `sunrise`, `light`, `candle`, `flower`, `sky` |
| tristeza, dificultad | `rain`, `storm`, `fog`, `winter` |
| soltar, libertad | `birds`, `ocean`, `wind`, `clouds`, `balloons` |
| hogar, familia, madre | `tea`, `bread`, `kitchen`, `window`, `home` |
| camino, seguir adelante | `road`, `path`, `stairs`, `bridge` |
| Dios, noche, dua | `night sky`, `moon`, `stars` |
| Marruecos | `morocco`, `desert`, `sahara`, `mosque` |

## Si un clip no sirve
- Mira `out/hoja.jpg`. Si un clip tiene una persona, no pega o se ve mal:
  `node motor/scripts/stock.mjs videos/<slug> --otro N` (N = número de línea) → siguiente candidato.
- O cambia la búsqueda en el guion y vuelve a ejecutar stock.mjs (solo rehace esa línea).
- "SIN CLIP" → prueba una palabra más simple (`roots` en vez de `tree roots`).
- Si Mixkit responde "pide esperar", el script espera solo; si se corta, vuelve a ejecutarlo y sigue donde iba.
- No repitas el mismo clip en un vídeo (el script ya lo evita).
