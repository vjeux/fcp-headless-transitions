// HGBS — Helium factory namespace (a class used as a free-function container:
// each method here is a `static` factory that news up an HGColorMatrix and
// programs its 4 rows).  Two overloads live in this port:
//
//   0x00000000001f0bf0  HGBS::createColorMaskNode(float, float, float)
//   0x00000000001f0cc0  HGBS::createColorMaskNode(int)
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGBS.createColorMaskNode.s      (float,float,float @0x1f0bf0)
//   raw-port/re/disasm/Helium.HGBS.createColorMaskNode_int.s  (int              @0x1f0cc0)
// Framework: Final Cut Pro / Helium.framework.
//
// ── DECODED FLOAT LITERALS ──────────────────────────────────────────────────
// Both bodies load two RIP-relative single-precision constants.  Address
// resolution done as `RIP_after_instruction + disp32`, cross-checked against
// the fat-header + `__TEXT,__const` file offsets of the x86_64 slice
// (fat sub-arch offset 0x4000).  Values, verified byte-exact by reading the
// mach-o file at fat_off+addr:
//   K1 = 1.0f     @Helium 0x3c7cc0  (bytes 00 00 80 3f)
//                — the "identity / row's active channel" weight.
//   K2 = 0.4f     @Helium 0x3ca11c  (bytes cd cc cc 3e)
//                — the "dimmed / suppressed channel" weight in the int overload.
// K1 is loaded 4 times in the (float,float,float) overload (@0x1f0c22,
// @0x1f0c53, @0x1f0c74, @0x1f0c93) — the 4th `setRow` arg (xmm3 = alpha).
// K1+K2 are loaded together in the int overload (@0x1f0ce0, @0x1f0ce8).
//
// ── SEMANTICS ───────────────────────────────────────────────────────────────
// createColorMaskNode(r, g, b):
//   1. `HGObject::operator new(unsigned long size = 0x1f0)` — call @0x1f0c0f.
//      The 0x1f0 (496) is sizeof(HGColorMatrix) in the Helium ABI.
//   2. `HGColorMatrix::HGColorMatrix()` — call @0x1f0c1a (placement-ctor
//      into the just-allocated storage).
//   3. Four vtable dispatches through `*0x60(vtable)`:  the classic
//      Helium "colour-matrix row setter" slot.  Each call fills one 4-wide
//      row (R,G,B,A) of the 4x4 colour transform:
//         setRow(rowIndex=0, xmm0=r, xmm1=0, xmm2=0, xmm3=1.0)   @0x1f0c3a
//         setRow(rowIndex=1, xmm0=0, xmm1=g, xmm2=0, xmm3=1.0)   @0x1f0c5b
//         setRow(rowIndex=2, xmm0=0, xmm1=0, xmm2=b, xmm3=1.0)   @0x1f0c7c
//         setRow(rowIndex=3, xmm0=0, xmm1=0, xmm2=0, xmm3=1.0)   @0x1f0c9b
//      The zero-source registers come from `xorps` instructions that clear
//      the xmm slots before each call (@0x1f0c2a-@0x1f0c2d, @0x1f0c40-@0x1f0c43,
//      etc.); we mirror those with plain 0.0 literals here.
//   4. Return the allocated `HGColorMatrix*` (which was preserved in `%rbx`
//      throughout and moved to `%rax` @0x1f0c9e).
//
//   On an exception from the ctor or any setRow, the landing pad @0x1f0caa
//   calls `HGObject::operator delete(void*)` on the just-`new`'d storage and
//   then `__Unwind_Resume`.  We do NOT model that path in TS: JS exceptions
//   let GC reclaim, and no user-visible cleanup is meaningful.
//
// createColorMaskNode(int i):
//   1. Compute `(i - 1) mod 3` via clang's magic-number reciprocal-mul idiom
//      (`imulq $0x55555556` + shr 0x3f + shr 0x20 + reconstruct via
//       `leal (%rcx,%rcx,2), %ecx; subl %ecx, %eax`).
//   2. Load xmm2 = K1 (@0x1f0ce0) and xmm3 = K2 (@0x1f0ce8).  Set xmm0 = xmm2.
//   3. A 3-way switch on `(i-1) mod 3` (0/1/2 → red/green/blue mask) selects
//      one (r,g,b) triple then tail-jumps to the float overload:
//         mod 0  → (r,g,b) = (K1, K2, K2)  — red-preserving mask
//         mod 1  → (r,g,b) = (K2, K1, K2)  — green-preserving mask
//         mod 2  → (r,g,b) = (K2, K2, K1)  — blue-preserving mask
//      The exact instruction path that reaches each triple is transcribed
//      block-by-block in the switch below with cited addresses.
//
// ── FRONTIER CALLEES (throw-stubs) ─────────────────────────────────────────
// Every callee this port touches is a separate raw-port unit; each is
// exposed here as a documented throw-stub per PORTING_SPEC.md rule 3:
//   `HGObject::operator new(unsigned long)`   @Helium 0x1f0c0f
//   `HGColorMatrix::HGColorMatrix()`          @Helium 0x1f0c1a
//   `HGColorMatrix::setRow(u32, f32, f32, f32, f32)` (vtable slot +0x60)
//                                             @Helium 0x1f0c3a/@0x1f0c5b/
//                                             @0x1f0c7c/@0x1f0c9b
//   `HGObject::operator delete(void*)`        @Helium 0x1f0cb0 (unwind path)
//   `__Unwind_Resume`                         @Helium 0x1f0cb8

/**
 * `HGColorMatrix` — Helium's 4x4 colour transform, allocated at 496 bytes
 * (`operator new` arg = 0x1f0 @0x1f0c0a) and configured by four calls to a
 * per-row setter dispatched through the vtable slot at `*0x60(vtable)`.
 *
 * The class itself is not the assigned unit for this file; we treat it as an
 * opaque handle whose only observable surface here is (a) construction and
 * (b) the row-setter.  A future HGColorMatrix port will pin the field
 * layout of the 496 bytes and remove the throw-stubs below.
 */
export type HGColorMatrix = { readonly __hgColorMatrix: unique symbol };

// ── Frontier stubs ────────────────────────────────────────────────────────

/**
 * `HGObject::operator new(unsigned long)` — mangled `__ZN8HGObjectnwEm` —
 * called @Helium 0x1f0c0f with `%edi = 0x1f0` (496 bytes) as its sole arg.
 * Returns raw storage for an `HGColorMatrix`.  Not yet transcribed.
 */
function HGObject_new(_size: number): HGColorMatrix {
  throw new Error(
    "HGBS::createColorMaskNode(f,f,f): HGObject::operator new @Helium 0x1f0c0f " +
      "(mangled __ZN8HGObjectnwEm) not yet transcribed"
  );
}

/**
 * `HGColorMatrix::HGColorMatrix()` — mangled `__ZN13HGColorMatrixC1Ev` —
 * default in-place ctor invoked @Helium 0x1f0c1a on the storage returned by
 * `HGObject::operator new`.  Not yet transcribed.
 */
function HGColorMatrix_ctor(_self: HGColorMatrix): void {
  throw new Error(
    "HGBS::createColorMaskNode(f,f,f): HGColorMatrix::HGColorMatrix @Helium 0x1f0c1a " +
      "(mangled __ZN13HGColorMatrixC1Ev) not yet transcribed"
  );
}

/**
 * Row-setter vtable slot at `*0x60(vtable)` — call sites @Helium 0x1f0c3a,
 * 0x1f0c5b, 0x1f0c7c, 0x1f0c9b.  Signature inferred from the register-use
 * pattern: `(u32 rowIndex, f32 r, f32 g, f32 b, f32 a)` where `rowIndex`
 * arrives in `%esi` (values 0,1,2,3 across the four calls) and the four
 * f32s arrive in `%xmm0..%xmm3`.  Not yet transcribed (vtable target's
 * concrete symbol depends on the runtime class stored in `*(HGColorMatrix)`
 * at +0x00 — the ctor's job to install).
 */
function HGColorMatrix_setRow_slot60(
  _self: HGColorMatrix,
  _rowIndex: number,
  _r: number,
  _g: number,
  _b: number,
  _a: number,
): void {
  throw new Error(
    "HGBS::createColorMaskNode(f,f,f): HGColorMatrix::(*0x60)(u32,f32,f32,f32,f32) @Helium " +
      "0x1f0c3a/0x1f0c5b/0x1f0c7c/0x1f0c9b (vtable slot +0x60) not yet transcribed"
  );
}

// ── Class (namespace-shaped) ──────────────────────────────────────────────

/**
 * `HGBS` is a Helium namespace-as-class — every visible member is a static
 * factory that returns an owned `HGColorMatrix*`.  No fields are decoded in
 * this port (neither method reads any); the class has no ctor either.
 */
export class HGBS {
  /**
   * `HGColorMatrix* HGBS::createColorMaskNode(float r, float g, float b)`
   * @Helium 0x1f0bf0.
   *
   * See file-level comment for the full block-by-block walk.  Every SSE
   * register clear (`xorps %xmmN, %xmmN`) is a 0.0f source — the asm never
   * uses those slots as `%xmmN`-preserved values, so this is safe to mirror
   * with plain `0.0` literals.
   *
   * Single-precision math: every callee argument arrives via `movss` (a
   * 32-bit float load).  We wrap each incoming `r`, `g`, `b` in
   * `Math.fround` to enforce the single-precision truncation the machine
   * does before the callee sees them.
   */
  static createColorMaskNode(r: number, g: number, b: number): HGColorMatrix {
    // @0x1f0bfb..@0x1f0c05 — spill the three floats to `-0x1c/-0x18/-0x14(%rbp)`.
    // The spills exist because the vtable-call ABI overwrites %xmm0..%xmm2
    // between calls; we don't need spills in TS (locals persist across calls).
    // Still `fround` each so the value bit-matches what `movss` reloaded.
    const R: number = Math.fround(r);
    const G: number = Math.fround(g);
    const B: number = Math.fround(b);

    // @0x1f0c0a-@0x1f0c0f — HGObject::operator new(0x1f0).
    const self: HGColorMatrix = HGObject_new(0x1f0);
    // @0x1f0c14-@0x1f0c17 — %rbx = %rdi = self (preserved for the tail).

    // @0x1f0c1a — HGColorMatrix::HGColorMatrix().
    HGColorMatrix_ctor(self);

    // K1 = 1.0f — loaded at each setRow's %xmm3 slot (@0x1f0c22 / @0x1f0c53 /
    // @0x1f0c74 / @0x1f0c93 — all four references target Helium 0x3c7cc0).
    const K1: number = Math.fround(1.0);

    // @0x1f0c1f..@0x1f0c3a — setRow(0, r, 0, 0, K1).
    //   xorps %xmm1,%xmm1 @0x1f0c2a  → 0.0f
    //   xorps %xmm2,%xmm2 @0x1f0c2d  → 0.0f
    //   %rdi = %rbx = self          @0x1f0c30
    //   xorl %esi,%esi              @0x1f0c33  (rowIndex = 0)
    //   %xmm0 = R                    @0x1f0c35
    //   callq *0x60(%rax)            @0x1f0c3a
    HGColorMatrix_setRow_slot60(self, 0, R, Math.fround(0.0), Math.fround(0.0), K1);

    // @0x1f0c3d..@0x1f0c5b — setRow(1, 0, g, 0, K1).
    HGColorMatrix_setRow_slot60(self, 1, Math.fround(0.0), G, Math.fround(0.0), K1);

    // @0x1f0c5e..@0x1f0c7c — setRow(2, 0, 0, b, K1).
    HGColorMatrix_setRow_slot60(self, 2, Math.fround(0.0), Math.fround(0.0), B, K1);

    // @0x1f0c7f..@0x1f0c9b — setRow(3, 0, 0, 0, K1)  (identity alpha row).
    HGColorMatrix_setRow_slot60(
      self,
      3,
      Math.fround(0.0),
      Math.fround(0.0),
      Math.fround(0.0),
      K1,
    );

    // @0x1f0c9e — %rax = %rbx = self.  @0x1f0ca1..@0x1f0ca9 — epilogue + retq.
    return self;
  }

  /**
   * `HGColorMatrix* HGBS::createColorMaskNode(int i)` @Helium 0x1f0cc0.
   *
   * Implements a compile-time-picked 3-way mask (red / green / blue) that
   * tail-jumps into the float overload.  See file-level comment for the
   * decoded (r,g,b) triples.
   *
   * The magic-number modulo idiom @0x1f0cc9-@0x1f0cdd computes
   * `eax = (i-1) mod 3` unsigned in 32-bit space; we express it directly.
   * Note the asm uses SIGNED extension (`movslq %edi, %rax` @0x1f0cc6) so a
   * negative `i` sign-extends before the mul — we mirror that with an int32
   * dance to keep the modulo result bit-identical.
   */
  static createColorMaskNodeInt(i: number): HGColorMatrix {
    // @0x1f0cc4 — decl %edi  → edi = i - 1.
    // @0x1f0cc6 — movslq %edi, %rax  → rax = (int64_t)(i - 1).  We keep it
    //             as a plain JS number since the value stays within int32.
    const shifted: number = (i - 1) | 0;

    // @0x1f0cc9-@0x1f0ce0 — the standard clang "signed division by 3" idiom.
    // For any 32-bit signed x, `floor(x/3)` equals ((x * 0x55555556) >> 32
    // (arithmetic)) + (x < 0 ? 1 : 0).  We compute it directly since the port
    // has to reproduce the same integer mod-3 the asm derives.
    const q: number = Math.trunc(shifted / 3);
    // @0x1f0cdd — leal (%rcx,%rcx,2), %ecx → ecx = q * 3.
    // @0x1f0cf3 — subl %ecx, %eax          → eax = shifted - q*3 = shifted mod 3.
    const mod3: number = (shifted - q * 3) | 0;

    // K1 = 1.0f loaded @0x1f0ce0 (RIP-target Helium 0x3c7cc0).
    // K2 = 0.4f loaded @0x1f0ce8 (RIP-target Helium 0x3ca11c).
    const K1: number = Math.fround(1.0);
    const K2: number = Math.fround(0.4);

    // @0x1f0cf0 — movaps %xmm2, %xmm0  → xmm0 = K1  (initial).
    // Track the four SSE slots as plain locals.  xmm2 starts as K1, xmm3 as
    // K2.  xmm0 = xmm2 (initial).  xmm1 is uninitialised until the switch
    // stores into it — but every code path stores before use, so we init
    // to a sentinel and TS's "assigned before use" is preserved by control
    // flow analysis.
    let xmm0: number = K1;
    let xmm1: number;
    let xmm2: number = K1;
    // (xmm3 is only used as a source — no need to track.)

    // @0x1f0cf3 — subl %ecx, %eax  →  eax = mod3  (already computed above).
    // @0x1f0cf5 — jne 0x1f0d0a          (if mod3 != 0 → red-branch-of-else).
    if (mod3 !== 0) {
      // @0x1f0d0a — movaps %xmm3, %xmm0  → xmm0 = K2.
      xmm0 = K2;
      // @0x1f0d0d — movaps %xmm2, %xmm1  → xmm1 = K1.
      xmm1 = K1;
      // @0x1f0d10 — cmpl $1, %eax; je 0x1f0cff.
      if (mod3 === 1) {
        // @0x1f0cff — cmpl $2, %eax; jne 0x1f0d1d.  mod3==1, so jne fires.
        // @0x1f0d1d — movaps %xmm3, %xmm2 → xmm2 = K2.
        xmm2 = K2;
        // Fall through to @0x1f0d20 tail-jmp (float overload).
      } else {
        // @0x1f0d15 — movaps %xmm3, %xmm1  → xmm1 = K2.
        xmm1 = K2;
        // @0x1f0d18 — cmpl $2, %eax; je 0x1f0d04.
        if (mod3 === 2) {
          // @0x1f0d04 — popq %rbp; jmp float-overload.
          // xmm2 unchanged (still K1).
        } else {
          // Any other value of mod3 (>=3 or negative for signed): fall through
          // to @0x1f0d1d.  In practice mod3 ∈ {0,1,2} so this arm is
          // unreachable when `i` is any int32; keep the mirror for
          // completeness.  The native asm reaches @0x1f0d1d unconditionally
          // when both `cmpl $1` AND `cmpl $2` failed after the initial jne,
          // which requires mod3 ∉ {0,1,2} — impossible after `x - 3*(x/3)`.
          // We honour the exact instruction path anyway.
          xmm2 = K2;
        }
      }
    } else {
      // @0x1f0cf7 — movaps %xmm2, %xmm1  → xmm1 = K1  (initial for the mod3==0 branch).
      xmm1 = K1;
      // @0x1f0cfa — cmpl $1, %eax; jne 0x1f0d15.  eax==0, so jne fires.
      // @0x1f0d15 — movaps %xmm3, %xmm1  → xmm1 = K2.
      xmm1 = K2;
      // @0x1f0d18 — cmpl $2, %eax; je 0x1f0d04.  eax==0, so je NOT taken.
      // Fall through to @0x1f0d1d — movaps %xmm3, %xmm2  → xmm2 = K2.
      xmm2 = K2;
      // @0x1f0d20 tail-jmp.
    }

    // @0x1f0d04 or @0x1f0d20 — tail-jmp __ZN4HGBS19createColorMaskNodeEfff.
    // The float overload's args are (r=xmm0, g=xmm1, b=xmm2); it will treat
    // its own xmm3 slot as the K1 alpha loaded from Helium 0x3c7cc0.
    return HGBS.createColorMaskNode(xmm0, xmm1, xmm2);
  }
}
