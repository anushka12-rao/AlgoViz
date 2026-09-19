import fs from 'fs';
import path from 'path';

const testsDir = __dirname;
const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.ts'));

for (const file of testFiles) {
  require(path.join(testsDir, file));
}
