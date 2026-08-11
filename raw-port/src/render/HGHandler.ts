// HGHandler.ts — FCP Ozone HGHandler:
// Read-only view over a Helium rendering handle. Every method observed here is
// either a pointer/field getter (GetRenderer, OffsetX, OffsetY, ScaleX, ScaleY)
// or a delegated setter (SetFilter → virtual dispatch through the vtable at
// slot *0x30).
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Ozone.HGHandler.*.s
//         (captured mangled symbols __ZN{K,}9HGHandler* at x86_64 slice VAs
//          0x687790, 0x6877c0, 0x6ad0c0, 0x6ad0e0, 0x6ad100, 0x6ad140.)
//
// STRUCT LAYOUT (recovered from the six observed methods):
//   +0x000  vtable pointer         (SetFilter @0x6877a9 loads `(%rdi) → %rax`
//                                    and calls `*0x30(%rax)` — see FRONTIER below.)
//   +0x090  HGRenderer* m_renderer (GetRenderer @0x6877cc: `movq 0x90(%rax),%rax`)
//   +0x0dc  HGRect      m_rect     (ScaleX @0x6ad110-0x6ad117: `addq $0xdc,%rdi ;
//                                    callq HGRect::w() const`. Also serves as the
//                                    input to ScaleY, so the field at +0xdc is
//                                    passed to both HGRect::w() and HGTile::Height()
//                                    — either two identically-shaped C structs live
//                                    at overlapping VTs, or (more likely) the class
//                                    at +0xdc is a HGTile-derived HGRect. The nearest
//                                    ported sibling `HGTile.Width/Height/Position`
//                                    in raw-port/re/disasm/ shows HGTile uses the
//                                    HGRect layout, so this is an in-place HGTile
//                                    sub-object at +0xdc.)
//   +0x0f0  int32       m_offsetX  (OffsetX @0x6ad0cc: `movl 0xf0(%rax),%eax`)
//   +0x0f4  int32       m_offsetY  (OffsetY @0x6ad0ec: `movl 0xf4(%rax),%eax`)
//
//   Every other byte of the object is untouched by the six observed methods
//   and is inherited from a base class this port has NOT decoded (frontier).
//
// EXPORTED SYMBOLS (six member functions per the brief):
//   @Ozone 0x687790  __ZN9HGHandler9SetFilterEi              SetFilter(int)
//   @Ozone 0x6877c0  __ZNK9HGHandler11GetRendererEv          GetRenderer() const
//   @Ozone 0x6ad0c0  __ZNK9HGHandler7OffsetXEv               OffsetX() const
//   @Ozone 0x6ad0e0  __ZNK9HGHandler7OffsetYEv               OffsetY() const
//   @Ozone 0x6ad100  __ZNK9HGHandler6ScaleXEv                ScaleX() const
//   @Ozone 0x6ad140  __ZNK9HGHandler6ScaleYEv                ScaleY() const
//
// SCALE-CONSTANT (@Ozone __literal4 0x706f50 = 1.0f):
//   Both ScaleX (@0x6ad123 movss 0x59e25(%rip),%xmm0 ; next-instr 0x6ad12b →
//   target 0x706f50) and ScaleY (@0x6ad163 movss 0x59de5(%rip),%xmm0 ; next-instr
//   0x6ad16b → target 0x706f50) load the SAME __literal4 slot. Value read via
//   `struct.unpack('<f', file[0x4000+0x706f50:...])` on the Ozone x86_64 slice =
//   `1.0f`. So the two scale methods compute `1.0f / width` and `1.0f / height`
//   respectively — a pixel-space → normalised-space conversion factor.
//
// FRONTIER (deferred — every stub cites its @0xADDR):
//   • HGRect::w() const                — called @0x6ad117 by ScaleX. Reads the
//                                         HGTile/HGRect sub-object at this+0xdc
//                                         and returns an unsigned int width.
//                                         (Existing decoded HGRect in
//                                          raw-port/src/infra/HGRect.ts does not
//                                          yet expose a `w()` method matching this
//                                          symbol — a future decode pass will
//                                          collapse this stub into the shared
//                                          HGRect port.)
//   • HGTile::Height() const           — called @0x6ad157 by ScaleY. Same idea,
//                                         reading height from the HGTile at
//                                         this+0xdc. The two symbol calls
//                                         (`HGRect::w` vs `HGTile::Height`) hint
//                                         that HGTile IS-a HGRect (or holds one)
//                                         but exposes its dimensions under two
//                                         different names — width via HGRect::w
//                                         and height via HGTile::Height. The port
//                                         mirrors that asymmetry exactly.
//   • (vtable) *0x30(%rax)             — called @0x6877ac by SetFilter. The
//                                         vtable slot's owner cannot be resolved
//                                         without HGHandler's own vtable decode;
//                                         the raw disasm passes SetFilter's `int`
//                                         parameter through TWICE (once as %esi
//                                         and once as %edx — see the "raw ABI
//                                         quirk" note below).
//
// The SetFilter ABI quirk: the disasm at @0x6877a3-@0x6877a6 spills the
// incoming `int` (arg2, %esi) to the stack and then reloads it into BOTH %esi
// and %edx before the vcall. So the vtable slot's signature is
//   `void (*)(HGHandler*, int arg2, int arg3)`
// where `arg2 == arg3 == the SetFilter caller's `int`. The vtable slot at
// *0x30 is thus a two-argument (int, int) sink that HGHandler::SetFilter
// invokes with the same value for both arguments — a raw datum this port
// reproduces literally, without inventing a plausibly-cleaner signature.

/**
 * HGRenderer — opaque handle (see HGRenderer references elsewhere in the raw
 * port; not decoded here). Returned by `GetRenderer` @0x6877cc.
 *
 * @Ozone 0x6877cc  movq 0x90(%rax), %rax   ; this->+0x90 is the m_renderer field.
 */
export interface HGRenderer {
  readonly __brand_HGRenderer: unique symbol;
}

/**
 * HGRect_w_result — the exact return type of the vcall `HGRect::w()` invoked at
 * @Ozone 0x6ad117 by ScaleX. The disasm reads %rax's low 32 bits (`movl %eax,%eax`
 * @0x6ad11c zero-extends) then converts to fp32 via `cvtsi2ss %rax,%xmm1`. So the
 * return is an unsigned 32-bit width whose float image is then divided into 1.0f.
 * We model it as `number` (which in TS is fp64) and require the caller to preserve
 * integer-domain semantics.
 */
export type HGRectDimension = number;

/**
 * HGTile_Height_result — the exact return type of the vcall `HGTile::Height()`
 * invoked at @Ozone 0x6ad157 by ScaleY. Same ABI as HGRect::w() (unsigned int
 * zero-extended, then converted to fp32).
 */
export type HGTileDimension = number;

/**
 * HGRect_at_offset_dc — opaque handle for the HGRect/HGTile sub-object embedded
 * at this+0xdc. We can't decompose it here without decoding HGRect's & HGTile's
 * full layouts; both `HGRect::w()` and `HGTile::Height()` reach into it directly.
 */
export interface HGRect_at_offset_dc {
  readonly __brand_HGRect_at_offset_dc: unique symbol;
}

// ── Frontier stubs ───────────────────────────────────────────────────────────

/**
 * `HGRect::w() const` — the direct member call issued at @Ozone 0x6ad117.
 *   0x6ad110  movq -0x8(%rbp), %rdi              ; %rdi = this
 *   0x6ad117  addq $0xdc, %rdi                   ; %rdi = &this->m_rect_at_dc
 *   0x6ad117  callq __ZNK6HGRect1wEv             ; HGRect::w() const
 *
 * The existing port `raw-port/src/infra/HGRect.ts` does not yet expose a
 * matching `w()` accessor — a future decode pass should collapse this stub into
 * that shared port. Raising here preserves the demand signal.
 */
function HGRect_w_stub(_rect: HGRect_at_offset_dc): HGRectDimension {
  throw new Error(
    "raise: HGRect::w() const @Ozone 0x6ad117 is not yet decoded — the sub-" +
      "object at HGHandler+0xdc exposes width via this mangled accessor.",
  );
}

/**
 * `HGTile::Height() const` — the direct member call issued at @Ozone 0x6ad157.
 *   0x6ad150  movq -0x8(%rbp), %rdi              ; %rdi = this
 *   0x6ad157  addq $0xdc, %rdi                   ; %rdi = &this->m_rect_at_dc
 *   0x6ad157  callq __ZNK6HGTile6HeightEv        ; HGTile::Height() const
 *
 * Same address as the ScaleX pointer (this+0xdc) but a different accessor —
 * strongly suggesting an in-place HGTile sub-object whose HGRect part is also
 * accessible under the `HGRect::w()` name. Raising here preserves the demand
 * signal until either HGTile or the shared HGRect decode covers it.
 */
function HGTile_Height_stub(_rect: HGRect_at_offset_dc): HGTileDimension {
  throw new Error(
    "raise: HGTile::Height() const @Ozone 0x6ad157 is not yet decoded — the " +
      "sub-object at HGHandler+0xdc exposes height via this mangled accessor.",
  );
}

/**
 * Virtual slot *0x30 on HGHandler's own vtable.
 *
 *   @Ozone 0x6877a9  movq  (%rdi), %rax          ; %rax = this->vtable
 *   @Ozone 0x6877ac  callq *0x30(%rax)           ; vtable[0x30](this, i, i)
 *
 * The signature the disasm uses is `void (*)(HGHandler*, int, int)` where the
 * two `int` arguments are identical — the value SetFilter received. HGHandler's
 * vtable layout is not yet decoded, so the concrete callee (and its per-slot
 * semantics) are not yet known. This stub preserves the exact vcall shape.
 */
function HGHandler_vtable_slot_0x30_stub(
  _self: HGHandler,
  _arg2: number,
  _arg3: number,
): void {
  throw new Error(
    "raise: HGHandler vtable slot *0x30 @Ozone 0x6877ac is not yet decoded " +
      "— SetFilter dispatches to this two-`int` sink with `arg2 == arg3 == " +
      "the caller's filter index`.",
  );
}

// ── The class ────────────────────────────────────────────────────────────────

/**
 * Ozone HGHandler — a rendering-view handle. See the header comment for the
 * struct-layout summary. This TS port models the six observed methods
 * faithfully; other fields (inherited from an undecoded base class) are not
 * exposed. Every access to a not-yet-decoded external symbol raises.
 */
export class HGHandler {
  /**
   * +0x090 — HGRenderer* m_renderer. Populated by whoever constructs this
   * object (not decoded in the six methods here). GetRenderer reads it raw.
   */
  m_renderer: HGRenderer;

  /**
   * +0x0dc — the embedded HGRect / HGTile sub-object. Both `ScaleX` and
   * `ScaleY` reach into it via `addq $0xdc, %rdi`; the two dimension
   * accessors (`HGRect::w()`, `HGTile::Height()`) are external symbols that
   * are not yet decoded (see the frontier stubs above).
   */
  m_rect_at_dc: HGRect_at_offset_dc;

  /**
   * +0x0f0 — int32 m_offsetX. Read raw by OffsetX @0x6ad0cc.
   */
  m_offsetX: number;

  /**
   * +0x0f4 — int32 m_offsetY. Read raw by OffsetY @0x6ad0ec.
   */
  m_offsetY: number;

  /**
   * Construct an HGHandler view. HGHandler has no ctor in the six-method brief
   * — this ctor is the port's own boundary for wiring the four observed fields.
   * (A real HGHandler ctor lives inside Ozone's framework initializer path; it
   * is not in the surface exposed by this decode pass.)
   */
  constructor(
    renderer: HGRenderer,
    rectAtDc: HGRect_at_offset_dc,
    offsetX: number,
    offsetY: number,
  ) {
    this.m_renderer = renderer;
    this.m_rect_at_dc = rectAtDc;
    this.m_offsetX = offsetX;
    this.m_offsetY = offsetY;
  }

  /**
   * SetFilter(int) — dispatches to vtable slot *0x30 on `this`, passing the
   * caller's `int` twice (as both %esi and %edx).
   *
   * @Ozone 0x687790  __ZN9HGHandler9SetFilterEi
   *
   * DECODE (raw-port/re/disasm/Ozone.HGHandler.SetFilter.s):
   *   0x687798  movq %rdi, -0x8(%rbp)              ; spill this to stack
   *   0x68779c  movl %esi, -0xc(%rbp)              ; spill filter arg to stack
   *   0x68779f  movq -0x8(%rbp), %rdi              ; %rdi = this
   *   0x6877a3  movl -0xc(%rbp), %esi              ; %esi = filter arg
   *   0x6877a6  movl -0xc(%rbp), %edx              ; %edx = filter arg  (SAME VALUE)
   *   0x6877a9  movq (%rdi), %rax                  ; %rax = this->vtable
   *   0x6877ac  callq *0x30(%rax)                  ; vtable[0x30](this, %esi, %edx)
   *   0x6877b4  retq                               ; void return
   *
   * The two-`int` vcall signature is a raw ABI quirk of the compiler's decision
   * to lower `(this, filter, filter)` from what may have been a wider inline;
   * we mirror it here without collapsing the two args into one.
   */
  SetFilter(filter: number): void {
    // @0x6877ac  vtable[0x30](this, filter, filter)
    HGHandler_vtable_slot_0x30_stub(this, filter, filter);
  }

  /**
   * GetRenderer() const → HGRenderer*
   *
   * @Ozone 0x6877c0  __ZNK9HGHandler11GetRendererEv
   *
   * DECODE (raw-port/re/disasm/Ozone.HGHandler.GetRenderer.s):
   *   0x6877c8  movq -0x8(%rbp), %rax              ; %rax = this
   *   0x6877cc  movq 0x90(%rax), %rax              ; %rax = this->m_renderer
   *   0x6877d4  retq
   *
   * A raw pointer load with no null-check or refcount touch.
   */
  GetRenderer(): HGRenderer {
    // @0x6877cc  return this->m_renderer
    return this.m_renderer;
  }

  /**
   * OffsetX() const → int
   *
   * @Ozone 0x6ad0c0  __ZNK9HGHandler7OffsetXEv
   *
   * DECODE (raw-port/re/disasm/Ozone.HGHandler.OffsetX.s):
   *   0x6ad0c8  movq -0x8(%rbp), %rax              ; %rax = this
   *   0x6ad0cc  movl 0xf0(%rax), %eax              ; %eax = this->m_offsetX (int32)
   *   0x6ad0d3  retq
   *
   * Raw 32-bit int load — signed-int semantics per the `movl` (the ABI zero-
   * extends the low 32 bits into %rax's low half, but downstream users treat
   * it as a signed int per the return-type convention).
   */
  OffsetX(): number {
    // @0x6ad0cc  return this->m_offsetX
    return this.m_offsetX | 0;
  }

  /**
   * OffsetY() const → int
   *
   * @Ozone 0x6ad0e0  __ZNK9HGHandler7OffsetYEv
   *
   * DECODE (raw-port/re/disasm/Ozone.HGHandler.OffsetY.s):
   *   0x6ad0e8  movq -0x8(%rbp), %rax              ; %rax = this
   *   0x6ad0ec  movl 0xf4(%rax), %eax              ; %eax = this->m_offsetY (int32)
   *   0x6ad0f3  retq
   */
  OffsetY(): number {
    // @0x6ad0ec  return this->m_offsetY
    return this.m_offsetY | 0;
  }

  /**
   * ScaleX() const → float
   *
   * @Ozone 0x6ad100  __ZNK9HGHandler6ScaleXEv
   *
   * DECODE (raw-port/re/disasm/Ozone.HGHandler.ScaleX.s):
   *   0x6ad108  movq %rdi, -0x8(%rbp)              ; spill this
   *   0x6ad10c  movq -0x8(%rbp), %rdi              ; %rdi = this
   *   0x6ad110  addq $0xdc, %rdi                   ; %rdi = &this->m_rect_at_dc
   *   0x6ad117  callq __ZNK6HGRect1wEv             ; %eax = HGRect::w()  (unsigned int)
   *   0x6ad11c  movl %eax, %eax                    ; zero-extend low 32 into %rax
   *   0x6ad11e  cvtsi2ss %rax, %xmm1               ; %xmm1 = (float)(unsigned int)
   *   0x6ad123  movss 0x59e25(%rip), %xmm0         ; %xmm0 = 1.0f  (@Ozone 0x706f50)
   *   0x6ad12b  divss %xmm1, %xmm0                 ; %xmm0 = 1.0f / (float)width
   *   0x6ad134  retq
   *
   * Semantics: pixel-space → normalised-space scale factor for the X axis.
   * The value at @Ozone 0x706f50 was recovered as exactly `1.0f` via
   *   `struct.unpack('<f', file[0x4000+0x706f50:0x4000+0x706f54])`.
   */
  ScaleX(): number {
    // @0x6ad117  w = HGRect::w()
    const w = HGRect_w_stub(this.m_rect_at_dc);
    // @0x6ad11e  cvtsi2ss %rax, %xmm1 — the cvtsi2ss instruction converts a
    // 64-bit int (already zero-extended from the 32-bit HGRect::w() result at
    // @0x6ad11c `movl %eax,%eax`) to fp32. Preserve the exact rounding by
    // using Math.fround on the divisor and dividend.
    const wF = Math.fround(w);
    // @0x6ad123  xmm0 = 1.0f   (@Ozone __literal4 0x706f50 = 1.0f)
    const K_ONE = Math.fround(1.0);
    // @0x6ad12b  divss xmm1, xmm0  → xmm0 = K_ONE / wF
    return Math.fround(K_ONE / wF);
  }

  /**
   * ScaleY() const → float
   *
   * @Ozone 0x6ad140  __ZNK9HGHandler6ScaleYEv
   *
   * DECODE (raw-port/re/disasm/Ozone.HGHandler.ScaleY.s):
   *   0x6ad148  movq %rdi, -0x8(%rbp)              ; spill this
   *   0x6ad14c  movq -0x8(%rbp), %rdi              ; %rdi = this
   *   0x6ad150  addq $0xdc, %rdi                   ; %rdi = &this->m_rect_at_dc
   *   0x6ad157  callq __ZNK6HGTile6HeightEv        ; %eax = HGTile::Height()  (unsigned int)
   *   0x6ad15c  movl %eax, %eax                    ; zero-extend low 32 into %rax
   *   0x6ad15e  cvtsi2ss %rax, %xmm1               ; %xmm1 = (float)(unsigned int)
   *   0x6ad163  movss 0x59de5(%rip), %xmm0         ; %xmm0 = 1.0f  (@Ozone 0x706f50 — SAME slot as ScaleX)
   *   0x6ad16b  divss %xmm1, %xmm0                 ; %xmm0 = 1.0f / (float)height
   *   0x6ad174  retq
   *
   * Semantics: pixel-space → normalised-space scale factor for the Y axis.
   * Note the accessor symbol is `HGTile::Height` (not `HGRect::h`), matching
   * the asymmetric API on the sub-object at this+0xdc.
   */
  ScaleY(): number {
    // @0x6ad157  h = HGTile::Height()
    const h = HGTile_Height_stub(this.m_rect_at_dc);
    const hF = Math.fround(h);
    // @0x6ad163  xmm0 = 1.0f  (SAME __literal4 slot as ScaleX @Ozone 0x706f50)
    const K_ONE = Math.fround(1.0);
    // @0x6ad16b  divss xmm1, xmm0  → xmm0 = K_ONE / hF
    return Math.fround(K_ONE / hF);
  }

  /**
   * `HGHandler::~HGHandler()` [D2, base-object destructor] — @Helium 0xa6fb0
   * (`__ZN9HGHandlerD2Ev`).
   *
   * SECOND FRAMEWORK. Everything above this method was transcribed from Ozone, which is where
   * HGHandler's rendering-view methods live; the class's CONSTRUCTOR AND DESTRUCTORS are emitted
   * in Helium instead (C2 @Helium 0xa6f40, D2 @Helium 0xa6fb0, D1 @Helium 0x3c1960,
   * D0 @Helium 0x3c1970 — Ozone defines none of the four). This unit is the Helium D2, its own
   * ledger entry at its own address; D0/D1/C2 are separate units and are not ported here.
   *
   * FULL transcription — the body is 3 executed instructions and nothing else:
   *
   *   0xa6fb0  pushq %rbp                ; frame setup (no TS counterpart)
   *   0xa6fb1  movq  %rsp, %rbp          ; frame setup (no TS counterpart)
   *   0xa6fb4  popq  %rbp                ; frame teardown (no TS counterpart)
   *   0xa6fb5  retq
   *   0xa6fb6  nopw  %cs:(%rax,%rax)     ; inter-function alignment padding, never executed
   *
   * Empty in the strict sense: no `callq`, no `jmp` to a base destructor or to `operator delete`,
   * no memory operand at all, and `this` (%rdi) is never dereferenced — so the base-object
   * destructor releases nothing and does not run a base-class dtor. `depgraph.py deps` lists no
   * dependency. Note this is D2, NOT the deleting D0 @0x3c1970: it does not free the object.
   *
   * Disassembly (regenerate with
   *   `bash raw-port/tools/disasm.sh --sym __ZN9HGHandlerD2Ev Helium`):
   *   raw-port/re/disasm/Helium.__ZN9HGHandlerD2Ev.s   (6 lines)
   *
   * ORACLE (executed, not read): the symbol is exported (nm `T`), so it was dlsym'd in a Rosetta
   * x86_64 process (Helium loaded by walking its @rpath chain) and called five times on a 1 KiB
   * receiver poisoned with 0xa5. It returned normally and left every byte of the object
   * unchanged — evidence the body really is empty rather than merely looking empty.
   */
  dtor_d2(): void {
    // @0xa6fb0..0xa6fb5: prologue + ret only. Nothing freed, no base dtor, no field touched.
  }
}

/**
 * The literal `1.0f` at @Ozone __literal4 0x706f50 is loaded by both ScaleX
 * (@0x6ad123 movss 0x59e25(%rip); next-instr 0x6ad12b → 0x706f50) and ScaleY
 * (@0x6ad163 movss 0x59de5(%rip); next-instr 0x6ad16b → 0x706f50). Value read
 * via `struct.unpack('<f', ozone_x86_64_slice[0x4000+0x706f50:...])` = 1.0.
 */
export const HGHandler_scale_numerator_addr = "@Ozone __literal4 0x706f50 = 1.0f" as const;
