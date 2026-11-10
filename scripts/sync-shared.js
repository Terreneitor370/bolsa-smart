// Copia shared/ a mobile/src/lib y watch/src/lib.
// Edita SIEMPRE en shared/ y corre `npm run sync` (los scripts mobile y watch ya lo hacen).
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'shared');
const targets = [path.join(root, 'mobile', 'src', 'lib'), path.join(root, 'watch', 'src', 'lib')];

for (const target of targets) {
  fs.mkdirSync(target, { recursive: true });
  for (const file of fs.readdirSync(source)) {
    if (!file.endsWith('.ts')) continue;
    fs.copyFileSync(path.join(source, file), path.join(target, file));
  }
  console.log('sincronizado ->', path.relative(root, target));
}
