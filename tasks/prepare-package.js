const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const util = require.resolve('../src/olgm/util');
const lines = fs.readFileSync(util, 'utf-8').split('\n');
const versionRegEx = /const VERSION = '(.*)';$/;
for (let i = 0, ii = lines.length; i < ii; ++i) {
  const line = lines[i];
  if (versionRegEx.test(line)) {
    lines[i] = line.replace(versionRegEx, `const VERSION = '${pkg.version}';`);
    break;
  }
}
fs.writeFileSync(util, lines.join('\n'), 'utf-8');

const src = path.posix.join('src', 'olgm');
const packageJson = path.resolve(__dirname, '..', src, 'package.json');
delete pkg.scripts;
delete pkg.devDependencies;
delete pkg.style;
delete pkg.eslintConfig;
const main = path.posix.relative(path.posix.resolve(__dirname, '..', src), path.posix.resolve(__dirname, '..', pkg.main));
pkg.main = pkg.module = main;
pkg.name = 'olgm';

fs.writeFileSync(packageJson, JSON.stringify(pkg, null, 2), 'utf-8');
