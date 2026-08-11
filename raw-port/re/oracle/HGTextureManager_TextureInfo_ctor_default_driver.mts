// HGTextureManager_TextureInfo_ctor_default_driver.mts — runs the SHIPPED port.
//
// The probe beside this file measures the live Helium ctor and proves it clears exactly
// 58 bytes. This half asks the TypeScript the same question in the model's own terms:
// every field of a TextureInfo pre-filled with junk must read back 0 / 0n after
// `TextureInfo.construct(dst)`. It also reports whether the junk was really non-zero
// first, so "all zero" cannot pass by accident on an already-zero object.
//
//   raw-port/node_modules/.bin/tsx HGTextureManager_TextureInfo_ctor_default_driver.mts
//
// tsx rather than `node --experimental-strip-types`: this graph imports siblings without
// a file extension, which plain type stripping does not resolve.
const M = await import("../../src/render/HGTextureManager.ts");

const dst = new M.TextureInfo(1, 2, 3, 4, 5, 6);
// Junk in EVERY field, including the ones the 6-arg ctor already zeroed, so each of the
// four `movups` ranges has something to clear.
dst.pixels = 0x1122334455667788n;
dst.f20 = 0xdeadbeefcafef00dn;
dst.f28 = 0x0102030405060708n;
dst.f30 = 0xfedcba9876543210n;
dst.f38 = 0xab;
dst.f39 = 0xcd;

const snap = (o: typeof dst) => ({
  target: o.target, width: o.width, height: o.height, internalFormat: o.internalFormat,
  format: o.format, type: o.type,
  pixels: o.pixels.toString(), f20: o.f20.toString(), f28: o.f28.toString(),
  f30: o.f30.toString(), f38: o.f38, f39: o.f39,
});

const before = snap(dst);
const junkWasNonZero = Object.values(before).every((v) => v !== 0 && v !== "0");

M.TextureInfo.construct(dst);

const fields = snap(dst);
const allZero = Object.values(fields).every((v) => v === 0 || v === "0");

process.stdout.write(JSON.stringify({ before, fields, allZero, junkWasNonZero }));
