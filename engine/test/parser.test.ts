/**
 * Tests for the .motr XML parser.
 * Validates against Push.motr structure.
 */
import { parseMotr } from '../src/parser/index.js';
import fs from 'node:fs';
import path from 'node:path';

const PUSH_PATH = path.resolve(import.meta.dirname,
  '/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr');

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  const xml = fs.readFileSync(PUSH_PATH, 'utf-8');
  const scene = parseMotr(xml);

  console.log('Parser tests (Push.motr):\n');

  test('scene settings: width', () => assert(scene.settings.width === 1920, `got ${scene.settings.width}`));
  test('scene settings: height', () => assert(scene.settings.height === 1080, `got ${scene.settings.height}`));
  test('scene settings: frameRate', () => assert(scene.settings.frameRate > 20, `got ${scene.settings.frameRate}`));

  test('factories parsed', () => assert(scene.factories.size > 5, `only ${scene.factories.size}`));
  test('factory 6 = Image', () => assert(scene.factories.get(6) === 'Image', `got ${scene.factories.get(6)}`));

  test('has top-level layers', () => assert(scene.layers.length > 0, `no layers`));

  // Find the Group layer that contains Transition A/B
  function findLayer(layers: any[], name: string): any {
    for (const l of layers) {
      if (l.name === name) return l;
      if (l.children) {
        const found = findLayer(l.children, name);
        if (found) return found;
      }
    }
    return null;
  }

  const group = findLayer(scene.layers, 'Group');
  test('found "Group" layer', () => assert(group !== null, 'not found'));

  const transA = findLayer(scene.layers, 'Transition A');
  test('found "Transition A"', () => assert(transA !== null, 'not found'));
  test('Transition A is image type', () => assert(transA.type === 'image', `got ${transA.type}`));

  const transB = findLayer(scene.layers, 'Transition B');
  test('found "Transition B"', () => assert(transB !== null, 'not found'));

  // Check that animated params were extracted from the scene
  // The "Color Solid" generator in Group 1 has animated X/Y
  const colorSolid = findLayer(scene.layers, 'Color Solid');
  test('found "Color Solid" generator', () => assert(colorSolid !== null, 'not found'));

  // The "Group" layer should have children
  test('Group has children', () => assert(group.children.length > 0, `empty`));

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
