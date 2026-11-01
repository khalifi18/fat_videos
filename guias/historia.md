# Formato historia: cómo hacer un vídeo que la gente comenta

Ejemplo aprobado: `videos/marruecos-1956/guion.txt`. 40–45 s, ~85 palabras en darija, trato en plural (نتوما).

## 1 · El guion (receta)
1. **Gancho polémico en el segundo 0**: una frase que muchos marroquíes han oído y les remueve
   ("كاين اللي كيقول: المغرب تزاد ف1956"). No se explica todavía: se plantea.
2. **Giro corto**: "غير تسناو شوية…" (2–3 palabras, crea la espera).
3. **Desmontarlo con un dato comprobable** (1956 = se fue Francia, no nació Marruecos).
4. **Viaje en el tiempo**: retroceder fechas hasta el origen (788 Idris I). Las fechas que corren hacia atrás enganchan.
5. **Una persona concreta**: la historia se cuenta a través de alguien (Fatima al-Fihri), con un detalle humano (la herencia del padre).
6. **Comparación que pique**: Marruecos frente a Europa (Qarawiyyin 859 antes que Bolonia 1088 y Oxford 1096). Es lo que más se comparte.
7. **Remate en una frase**: "المغرب ماشي عندو 70 عام… عندو كثر من 1200 عام".
8. **CTA doble**: una pregunta fácil + pedir la próxima historia ("شنو القصة الجاية اللي بغيتو؟ كتبوها فالكومونتير").

Reglas: cada dato verificado en la web (anota las fuentes en un comentario `#` del guion); nada de política actual ni de
Ceuta/Melilla en la voz (enciende insultos y TikTok limita el vídeo); números en letra en darija para la voz.

## 2 · Lo visual (listón: los vídeos de Prográmelo)
- **Modelo a imitar: `guias/referencia-google-maps.md`** (léelo antes de dibujar): un mundo continuo y la cámara viaja de posición en posición dentro de él, con parallax. Lo que se mueve es la cámara, nunca el fotograma temblando.
- **Un solo mundo continuo**, no escenas sueltas: la cámara viaja (mapa visto desde arriba → zoom a la ciudad → calle → edificio).
- **Cámara de verdad, no imagen temblando**: `Camara2D` hace UN movimiento continuo por escena (acercarse, paneo, alejarse, subir…),
  alternando entre escenas; nunca va y vuelve. Para que se sienta profundidad, divide cada dibujo en capas con
  `<Capa z={0}>` (cielo/fondo), `<Capa z={0.5}>` (edificios) y `<Capa z={1}>` (primer plano): el parallax hace que la cámara
  parezca moverse dentro del mundo. Para viajes (Kairouan → Fez) usa un foco que se mueve con la ruta.
- **Cada frase = una imagen nueva que muestra exactamente lo que se dice**: fecha → número grande que se tacha;
  viaje → ruta sobre el mapa (`mapa-norte-africa`); edificio → el edificio real replicado (Qarawiyyin: patio con fuente,
  arcos de herradura, tejas verdes, alminar blanco cuadrado); comparación → línea de tiempo con las tres fechas; cifra → contador que corre.
- **Calidad del dibujo**: degradados, luz cálida, sombras, grano, siluetas sin cara; detalles marroquíes (zellige, faroles, arcos).
  Nada de formas planas sueltas. Si una escena parece un icono, no vale.
- **Revisión obligatoria**: `render.mjs --hoja` y mirar cada fotograma: ¿se entiende sin sonido? ¿algo cortado? ¿el texto tapa el dibujo?
  Si una escena no está a la altura, se rehace antes de montar.

## 3 · Interacción
- La primera frase de la descripción repite la polémica: "¿Marruecos nació en 1956? 👀".
- Pregunta concreta en la descripción ("¿Lo sabíais?") + "dime la próxima historia".
- Fijar un comentario propio con 3 opciones de próximas historias para que voten.
- Responder a los comentarios la primera hora; si alguien discute, responder con datos y educación (o con otro vídeo).
- Serie: "Historia de Marruecos que no te contaron · parte N".
