// Crea un vídeo nuevo:  node motor/scripts/nuevo.mjs videos/<slug>
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.log('Uso: node motor/scripts/nuevo.mjs videos/<slug>');
  process.exit(1);
}
fs.mkdirSync(path.join(dir, 'out'), {recursive: true});
const g = path.join(dir, 'guion.txt');
if (!fs.existsSync(g)) {
  fs.writeFileSync(
    g,
    `# tema: …
# formato: nasiha | historia
# Una línea = un clip.  [búsqueda en inglés] frase en darija | subtítulo en español con *clave*
# [texto] = tarjeta con el texto en árabe grande (aleya), sin clip.
[sunset] … | …
`,
  );
}
console.log(`OK · ${g}`);
