# Referencia: «¿Cómo sabe Google Maps dónde empieza un atasco?» (@nuncateloexplicaron)

Archivo: `referencias/google_maps.mp4` · 68,5 s · 576×1024 (copia de TikTok) · analizado el 31-10-2026.
Es el listón para Curiosidades. Si un vídeo nuestro no aguanta la comparación lado a lado con este, no está listo.

## 1. La clave: un solo mundo y una cámara que no para
- **3 cortes en 68 s** (54,0 · 58,2 · 64,5 s). Todo lo demás es la cámara moviéndose dentro de UNA autopista nocturna.
- La cámara cambia de encuadre en cada frase (cada 2–4 s) y nunca se queda quieta: sube a vista de plano, baja al atasco, se mete dentro de un coche y sale a la ciudad entera. Siempre con suavizado.
- Las transiciones las hace la cámara, no un corte ni un fundido. «carretera desde arriba» = la cámara sube a vista cenital. «tu móvil» = baja hasta un coche y lo enseña por dentro.
- Escala enorme en la misma escena: de miles de edificios a un coche llenando la pantalla. Ese salto es el «wow».
- Cierre circular: termina en la misma autopista atascada del principio.

## 2. Guion (estructura)
1. Gancho 0–5 s: pregunta que todos se han hecho («¿Cómo sabe Google Maps que hay un atasco delante de ti, justo dónde empieza?»).
2. Giro 5–9 s: «Nadie está vigilando… el chivato es tu móvil.»
3. Mecanismo paso a paso, una idea por frase: ubicación → dos puntos + tiempo = velocidad (108 km/h) → muchos móviles a la vez → 100 km/h se pinta verde, 10 km/h rojo → precisión de 5 m = un coche → donde frenan juntos empieza el rojo → histórico (lunes, martes, miércoles 8:15) → predicción («Llegas 8:52»).
4. Anécdota final: el artista de Berlín con 99 móviles en un carrito que inventó un atasco.
5. Cierre: «La próxima vez que estés parado en ese rojo, piensa que tu móvil también lo está pintando.»
- Cada palabra clave aparece en imagen en el mismo instante en que se dice («velocidad» → etiqueta 108 km/h).
- No hay CTA propia; el final es la animación de TikTok.

## 3. Dirección de arte
- **Paleta corta:** noche azul marino/índigo; edificios azul-violeta con ventanas amarillas encendidas; parques verdes; río azul; horizonte con degradado rosa-violeta y niebla.
- **Acentos de dato (los de Google):** verde/ámbar/rojo del tráfico, punto azul con anillo blanco y halo, pin rojo.
- **Estilo:** low-poly con sombreado plano, sin texturas. La luz sale de los objetos: conos de faros sobre el asfalto, farolas con resplandor, halos en los puntos. Brillo suave (bloom).
- **Coches:** cuerpo redondeado, parabrisas oscuro, faros y pilotos que emiten luz, unos 8 colores. Cientos a la vez. El atasco es creíble: la densidad sube y se acumulan pilotos rojos.
- **Capa de dato:** la línea de tráfico está pintada SOBRE la carretera, brilla y cambia de color en directo según la historia.
- **Rótulos:** pastillas redondeadas pequeñas (108 km/h, 99 móviles), líneas finas de medida (30 m, 5 m, 1 coche), horas, círculos de radar que laten. Pegados al objeto 3D y siguiéndolo. Aparecen solo cuando la voz los nombra.
- Sin «marca» encima: ni marcador, ni cabecera, ni sellos. Solo el mundo, los rótulos y los subtítulos.

## 4. Subtítulos
- Sans semibold redondeada (tipo Montserrat), blanca, centrada arriba (~8–12 % del alto), máximo 2 líneas.
- Palabra a palabra: las ya dichas en gris (~45 %), la actual en blanco, y la palabra clave dentro de un recuadro fino azul claro con tiradores en las esquinas (como una selección de Figma).
- La acción ocurre siempre en el centro y la parte de abajo; el texto nunca la tapa.

## 5. Sonido
- **Solo voz**: −20 LUFS, sin música de fondo y sin efectos audibles; los silencios entre frases quedan limpios.
- Voz natural, conversacional, ritmo ágil sin pausas largas.
- Conclusión: lo que engancha es la imagen y el guion, no la mezcla.

## 6. Diferencias con lo nuestro (Zara, datáfono)
| Ellos | Nosotros |
|---|---|
| Un mundo continuo | Escenas sueltas que no tienen relación |
| La cámara lleva la narración | Planos fijos con zooms pequeños |
| Objeto protagonista llenando la pantalla | Pieza en una caja al 20 % |
| Rótulo solo cuando se nombra | Rótulos, marcador y fuentes siempre visibles |
| Solo voz | Música + 36–77 efectos |

## 7. Cómo se haría en Remotion (`@remotion/three`)
- Ciudad: cajas instanciadas con alturas deterministas y textura de ventanas que emite luz.
- Carretera: curva extruida con carriles; línea de tráfico como segunda malla con colores por vértice animados.
- Coches: una geometría redondeada en InstancedMesh con colores por instancia; posiciones desde una simulación de tráfico determinista a lo largo de la curva.
- Conos de faros: planos con mezcla aditiva (falsos, baratos). Resplandor con postproceso bloom.
- Cámara: recorrido por fotogramas clave sincronizado con las marcas de tiempo de las palabras.
- Coche en «rayos X» con el móvil dentro: carrocería transparente + pieza interior.
