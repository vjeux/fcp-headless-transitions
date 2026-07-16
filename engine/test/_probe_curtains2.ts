import { parseMotr } from '../src/parser/index.js';
import { readFileSync } from 'fs';
const path = process.argv[2];
const scene: any = parseMotr(readFileSync(path, 'utf-8'));
// find all clones or things with cloneSourceId
function walk(l: any, depth = 0) {
  if (l.type === 'clone' || l.cloneSourceId !== undefined) {
    console.log('CLONE ', depth, l.id, l.type, 'cloneSourceId=', l.cloneSourceId, 'filters=', (l.filters||[]).map((f:any)=>f.type||f.pluginName));
  }
  for (const c of (l.children || [])) walk(c, depth + 1);
}
for (const layer of scene.layers) walk(layer);
console.log('---all layers by id---');
function all(l: any) { console.log(l.id, l.type, l.name, 'filters=', (l.filters||[]).length); for (const c of (l.children||[])) all(c); }
for (const layer of scene.layers) all(layer);
