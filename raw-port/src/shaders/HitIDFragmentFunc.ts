// Faithful transcription @0x000000000305c6 — MDPKit hit-id readback fragment
// @shader HitIDFragmentFunc (MDPKit)
// @0x000000000305c6 — MDPKit.framework/Versions/A/Resources/default.metallib
//
// Purpose: record which "hit IDs" were rasterized on this frame. Each hit-testable
// object draws its geometry with a per-object `hitID` (32-bit uint fragment input);
// this shader runs once per covered fragment and — when writes are enabled — atomically
// appends the hitID to a flat "list texture" using a global counter. It also returns
// the hitID unchanged to the color attachment (a uint render target, air.render_target
// !31 with air.arg_type_name "uint"), so a subsequent readback can see the value there
// as well. IDs of value 0 are skipped (0 is the "no hit" sentinel).
//
// Source LLVM IR: raw-port/re/shaders/HitIDFragmentFunc.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh HitIDFragmentFunc MDPKit`).
// Original Metal source: MDPKit/Shaders/MDPHitID.metal, entry at line 37
// (from !DISubprogram !39, scopeLine 41).
//
// AIR signature (from air.fragment !29 and !33..!38):
//   define <{ i32 }> @HitIDFragmentFunc(
//     <4 x float> position                                            ; !33 unused (air.arg_unused)
//     i32         hitID                                                ; !34 fragment input (flat)
//     texture2d<uint, write>           listTexture                     ; !35 (write-only, location 1)
//     device metal::_atomic<uint>*      listIndex                      ; !36 (device, read-write, 4B)
//     constant uint*                    listWrite                      ; !38 (4B, address_space=2)
//   ) -> struct { uint hitID }                                         ; !31 render target 0
//
// IR line map (%N → semantics), with source-line !DILocation callouts:
//   %6  = icmp eq i32 hitID, 0                          ; @MDPHitID.metal:42:20
//         br i1 %6, %20 (return), %7 (record path)      ; skip when hitID==0
//   %7  path (hitID != 0):
//     %8  = &listIndex->__s                             ; !44 (inlined atomic op at line 46:27)
//     %9  = air.atomic.global.add.u.i32(%8, 1, order=0=relaxed, scope=2=device, volatile=true)
//           ; == fetch_add(listIndex, 1)  → the pre-increment slot index
//     %10 = load i32 from listWrite (align 4, tbaa "int")   ; @48:13
//     %11 = icmp eq i32 %10, 0                              ; if (listWrite == 0) skip texture write
//         br i1 %11, %20 (return), %12 (write path)
//   %12 write path:
//     %13 = air.get_width_texture_2d(listTexture, lod=0)    ; @50:45 (listTexture width in pixels)
//     %14 = urem i32 %9, %13                                ; x = slotIndex % width
//     %15 = <2 x i32> [%14, undef]                          ; !67 build coord
//     %16 = udiv i32 %9, %13                                ; y = slotIndex / width
//     %17 = <2 x i32> [%14, %16]                            ; final (x,y) texel coord
//     %18 = <4 x i32> [hitID, poison, poison, poison]
//     %19 = shufflevector <4 x i32> %18, poison, <0,0,0,0>  ; broadcast: (hitID, hitID, hitID, hitID)
//     air.write_texture_2d.u.v4i32(listTexture, %17, %19, lod=0, cache_hint=2)  ; store
//   %20 return: build <{ i32 }> = { hitID } and ret
//
// Notes on the atomic op arguments (from Metal stdlib metal_atomic
// atomic_fetch_add_explicit inlined at !47): the AIR builtin
// `air.atomic.global.add.u.i32` takes (ptr, val, order, scope, volatile).
// Here (i32 1, i32 0, i32 2, i1 true) means order=memory_order_relaxed(0),
// scope=device(2), volatile=true. The return value is the previous value of
// *listIndex — i.e. the fresh slot index this fragment claims. Faithful
// transcription uses a monotonically increasing counter on `state.listIndex`
// and hands back the pre-increment value.
//
// Fast-math attributes on the function are #0 = { unsafe-fp-math, no-nans-fp-math,
// no-infs-fp-math, no-signed-zeros-fp-math, approx-func-fp-math } and
// !air.compile.fast_math_enable — irrelevant here (this shader is entirely integer
// math). No Math.fround needed.
//
// The `listWrite` uniform is a plain `constant uint*` (4-byte scalar dereferenced
// once as an i32). It acts as a boolean toggle: nonzero means "also stamp the
// listTexture", zero means "just bump the counter and return". No shortcut
// language of any kind — the transcription mirrors the IR branch structure exactly.
//
// The render target is a *uint* attachment (see !31: air.arg_type_name "uint"),
// so the returned struct's single i32 lane is the raw hitID as a uint. We keep
// it as a JS `number` in the [0, 2^32) range (coerced with `>>> 0` on write so
// downstream readers cannot see a sign-extended negative).

// Metal texture2d<uint, write> — minimal shape the shader uses.
export interface UintWriteTexture2D {
  /** width in pixels (returned by air.get_width_texture_2d lod=0). */
  width: number;
  /** 4-channel uint texel store. `coord` is (x,y); `rgba` is broadcast (hitID,hitID,hitID,hitID). */
  write(coord: { x: number; y: number }, rgba: [number, number, number, number]): void;
}

// metal::_atomic<uint> at listIndex — one 32-bit counter with relaxed device-scope fetch_add.
export interface AtomicUint32 {
  value: number; // read-modify-written by fetchAddRelaxed
}

/**
 * atomic_fetch_add_explicit(&listIndex, 1, memory_order_relaxed) — device scope.
 * Returns the PRE-INCREMENT value (the slot this fragment claims), matches
 * `air.atomic.global.add.u.i32(ptr, 1, 0, 2, volatile=true)` at %9. Wraps modulo
 * 2^32 (unsigned).
 */
export function fetchAddRelaxedU32(atom: AtomicUint32): number {
  const prev = atom.value >>> 0;
  atom.value = (prev + 1) >>> 0;
  return prev;
}

/**
 * HitIDFragmentFunc — faithful transcription of the AIR body.
 *
 * @param hitID       flat uint fragment input (from vertex-generated attribute "hitID")
 * @param listTexture texture2d<uint, write> — the flat list of recorded hit IDs
 * @param listIndex   device metal::_atomic<uint>* — monotonic counter
 * @param listWrite   constant uint — nonzero means also stamp listTexture; zero means counter-only
 * @returns           the hitID (identity: render target 0 receives it unchanged)
 */
export function HitIDFragmentFunc(
  hitID: number,
  listTexture: UintWriteTexture2D,
  listIndex: AtomicUint32,
  listWrite: number,
): number {
  const id = hitID >>> 0;

  // %6..br: if (hitID == 0) return hitID.  @0x305c6 line 42
  if (id === 0) {
    return id;
  }

  // %7..%9: slotIndex = fetch_add(listIndex, 1, relaxed).  @0x305c6 line 46
  const slotIndex = fetchAddRelaxedU32(listIndex); // pre-increment value

  // %10..%11: if (listWrite == 0) return.  @0x305c6 line 48
  const listWriteU = listWrite >>> 0;
  if (listWriteU === 0) {
    return id;
  }

  // %13..%17: (x,y) = (slotIndex % width, slotIndex / width).  @0x305c6 lines 50-51
  const width = listTexture.width >>> 0;
  const x = (slotIndex % width) >>> 0;
  const y = ((slotIndex / width) | 0) >>> 0; // udiv — width>0 by construction; truncate

  // %18..%19: broadcast (hitID, hitID, hitID, hitID).  @0x305c6 line 52
  const rgba: [number, number, number, number] = [id, id, id, id];

  // air.write_texture_2d.u.v4i32(listTexture, (x,y), rgba, lod=0, hint=2).  @0x305c6 line 52
  listTexture.write({ x, y }, rgba);

  // %20..%21: ret <{ i32 }> = { hitID }.  @0x305c6 line 58
  return id;
}
