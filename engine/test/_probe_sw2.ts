import { parseMotr } from '../src/parser/index.js';
import fs from 'node:fs';
const s = parseMotr(fs.readFileSync('../fct/minimized/Movements__Switch/case.motr','utf8'));
console.log('scene.settings.width x height:', s.settings.width, 'x', s.settings.height);
