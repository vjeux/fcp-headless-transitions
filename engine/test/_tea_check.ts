import { teaRand } from '../src/compositor/emitter-sim.js';
for (const [a,b,c] of [[0,0,0],[1,0,0],[0,1,0],[18155,0,0],[25785,1,0]] as [number,number,number][]) {
  console.log(`teaRand(${a},${b},${c}) = ${teaRand(a,b,c).toFixed(6)}`);
}
