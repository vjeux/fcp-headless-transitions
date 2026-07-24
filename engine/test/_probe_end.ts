import { parseMotr } from '../src/parser/index.js';
import fs from 'node:fs';
const xml = fs.readFileSync(process.argv[2] || '/Users/vjeux/random/final-cut-pro-transitions/fct/minimized/Stylized__Center/case.motr','utf8');
const scene = parseMotr(xml);
console.log('animationEndSec', scene.settings.animationEndSec, 'duration', JSON.stringify(scene.settings.duration));
