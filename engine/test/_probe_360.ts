import { parseMotr } from '../src/parser/index.js';
import { detect360Band } from '../src/compositor/transition360.js';
import fs from 'node:fs';
const s = parseMotr(process.env.M360!);
const b = detect360Band(s);
console.log('band360:', JSON.stringify(b));
console.log('scene', s.settings.width, 'x', s.settings.height, 'endSec', s.settings.animationEndSec);
