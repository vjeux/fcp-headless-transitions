// AUTrimLevel.ts — Flexo's AUTrimLevel, a concrete Apple Audio Unit
// subclass of `ausdk::AUEffectBase` (Audio Unit SDK) implementing the
// per-clip "Trim Level" audio effect used inside Flexo's audio graph.
//
// Transcribed from the disassembly of /Applications/Final Cut Pro.app/
// Contents/Frameworks/Flexo.framework/Versions/A/Flexo. This file ports
// ONLY the two destructor variants currently listed in the ledger for
// AUTrimLevel; all other virtual methods (parameter get/set, DSP kernel
// entry points, etc.) live on the base `ausdk::AUEffectBase` vtable and
// have NOT been transcribed here.
//
// See re/disasm/Flexo.AUTrimLevel.~AUTrimLevel.s for the raw source
// disassembly of the D0 (deleting) destructor at @0x1244730 and the
// preceding D1 (complete-object non-deleting) destructor at @0x12446a0.
// Both bodies are byte-for-byte transcribed below; the offsets 0x250
// and 0x258 are read straight out of the assembly.
//
// STRUCT LAYOUT (partial — recovered from the two destructors only):
//   +0x000  vtbl : *const void       // vtable pointer. The dtors reinstall
//                                    // `ausdk::AUEffectBase`'s vtable
//                                    // (RIP-relative literal
//                                    // `__ZTVN5ausdk12AUEffectBaseE`
//                                    // + 0x10 typeinfo header, read at
//                                    // @0x12446ad / @0x1244744) before
//                                    // delegating to `AUBase::~AUBase()`.
//   +0x250  memberVector.first : *T* // begin() of an owned-pointer vector
//                                    // (see loop @0x12446ce..@0x1244700).
//   +0x258  memberVector.last  : *T* // end()   of same vector.
//                                    // The elements are pointers to some
//                                    // polymorphic type whose D1 dtor is
//                                    // reached through vtable slot *0x08
//                                    // (see the `callq *0x8(%rax)` inside
//                                    // the walk-and-destroy loop, i.e.
//                                    // the Itanium-ABI complete-object
//                                    // destructor is at slot 1 = 0x08).
//                                    // The concrete element class is NOT
//                                    // decoded yet.
//                                    // Fields between +0x008 and +0x250
//                                    // belong to `ausdk::AUEffectBase`
//                                    // and its bases and are not decoded
//                                    // in this file.
//
// FRONTIER — un-transcribed neighbours, each cited by @0xADDR:
//   * `ausdk::AUEffectBase` vtable literal @Flexo 0x12446ad + 0x10 offset
//     (RIP-relative __ZTVN5ausdk12AUEffectBaseE, also read at @0x1244744).
//   * `ausdk::AUBase::~AUBase()`  imported stub @Flexo 0x1496bc4 (D2).
//   * `operator delete(void*)`    imported stub @Flexo 0x1497404 (__ZdlPv).
//   * per-element `T::~T()` reached via `*0x8(%rax)` vtable slot 1
//     inside the member-vector destruction loop @Flexo 0x12446fd (D1)
//     and @Flexo 0x124478d (D0).

// ── Frontier stubs ────────────────────────────────────────────────────
// Each throws citing the exact @0xADDR that would call into it, so the
// frontier tool can enumerate the real demand signal without any of
// this code silently no-op'ing at runtime.

/** The `ausdk::AUEffectBase` vtable, referenced RIP-relatively as
 *  `__ZTVN5ausdk12AUEffectBaseE` at @0x12446ad (D1) and @0x1244744 (D0).
 *  Both destructors compute `vtbl + 0x10` (skipping the two-slot Itanium
 *  typeinfo header) and store the result into `(this+0x00)` — i.e. they
 *  reinstall the base-class vtable pointer as the first step of the
 *  destructor chain, exactly as gcc/clang emit for a derived-class dtor.
 *  The vtable contents themselves are not transcribed here. */
export const AUEFFECTBASE_VTABLE_LITERAL_ADDRESS =
  "@Flexo 0x12446ad/@0x1244744 (RIP-relative __ZTVN5ausdk12AUEffectBaseE, +0x10)";

/** `ausdk::AUBase::~AUBase()` D2 base-object destructor. Imported symbol
 *  `__ZN5ausdk6AUBaseD2Ev`, called via stub @Flexo 0x1496bc4:
 *    - from D1 via `jmp 0x1496bc4` at @0x1244722 (tail call, no return)
 *    - from D0 via `callq 0x1496bc4` at @0x12447a8.
 *  Not yet transcribed. */
function ausdk_AUBase_D2(_this_: AUTrimLevel): void {
  throw new Error(
    "ausdk::AUBase::~AUBase() @Flexo 0x1496bc4 (__ZN5ausdk6AUBaseD2Ev) not yet transcribed",
  );
}

/** `operator delete(void*)` — the C++ deallocation function, imported
 *  symbol `__ZdlPv`, called via stub @Flexo 0x1497404:
 *    - from D1 body at @0x1244710 (frees the member vector's storage)
 *    - from D0 body at @0x12447a0 (frees the member vector's storage)
 *    - from D0 tail at @0x12447ba (frees `this` itself — deleting dtor).
 *  Not yet transcribed. In a real JS port the corresponding vector /
 *  object storage is GC-owned, so the frees are logical no-ops; we
 *  route them through this throwing stub instead of silently dropping
 *  the operation, because the porting spec forbids silent fallbacks. */
function operator_delete(_p: unknown): void {
  throw new Error(
    "operator delete(void*) @Flexo 0x1497404 (__ZdlPv) not yet transcribed",
  );
}

/** The polymorphic type stored in the AUTrimLevel member-pointer vector
 *  at (this+0x250 .. this+0x258). Its identity is NOT decoded — the
 *  destructor loop only touches it through vtable slot 1 (offset 0x08),
 *  the Itanium complete-object destructor. */
export interface AUTrimLevelMember {
  /** The vtable pointer at (member+0x00). Slot 1 (byte offset 0x08) is
   *  the complete-object destructor (D1), reached at @0x12446fd (D1) /
   *  @0x124478d (D0) via `callq *0x8(%rax)`. */
  readonly vtbl: {
    /** vtable *0x00 — non-destroyed offset-to-top / typeinfo header
     *  (unused by the dtor path — the dtors here call *0x08 directly). */
    readonly slot0: unknown;
    /** vtable *0x08 — `T::~T()` complete-object destructor. */
    destroy(self: AUTrimLevelMember): void;
  };
}

// ── The class itself ──────────────────────────────────────────────────

/** AUTrimLevel — Flexo's audio-unit implementing the per-clip trim
 *  level effect. Only the two destructors are transcribed here; all
 *  behavioural methods live on `ausdk::AUEffectBase` and further up
 *  the Audio Unit SDK class hierarchy and are not yet transcribed. */
export class AUTrimLevel {
  /** (this+0x00) — the installed vtable pointer. Both destructors
   *  overwrite this with `ausdk::AUEffectBase`'s vtable+0x10 as the
   *  first step of the destruction chain. Modelled as opaque here. */
  vtbl: unknown = null;

  /** (this+0x250) — begin() of an owned-pointer vector of member
   *  helpers. `null` when the vector was never allocated. */
  memberBegin: (AUTrimLevelMember | null)[] | null = null;

  /** (this+0x258) — end() sentinel of the same vector, as an index into
   *  `memberBegin`. The disassembly walks pointer arithmetic
   *  `%r15 = end; %r14 = begin; loop: %r15 -= 8; if %r15 == %r14 stop`
   *  which is the standard reverse-iteration of a std::vector<T*>
   *  destroying elements from back to front. We mirror that literally.
   *  When `memberBegin` is null, `memberEnd` is 0. */
  memberEnd: number = 0;

  // NOTE: fields between +0x008 and +0x250 belong to `ausdk::AUEffectBase`
  // and its bases; not decoded, not modelled.

  /** AUTrimLevel::~AUTrimLevel() — D1 (complete-object, non-deleting)
   *  destructor.  Symbol `__ZN11AUTrimLevelD1Ev`  @Flexo 0x12446a0.
   *
   *  Raw asm (see re/disasm/Flexo.AUTrimLevel.~AUTrimLevel.s):
   *    0x12446a0  prologue (rbp/r15/r14/rbx save)
   *    0x12446ad  load `__ZTVN5ausdk12AUEffectBaseE` (rip-rel)
   *    0x12446b4  add  0x10 (skip Itanium typeinfo header)
   *    0x12446b8  mov  %rax, (%rdi)            ; reinstall base vtable
   *    0x12446bb  mov  0x250(%rdi), %r14       ; r14 = memberBegin
   *    0x12446c2  test %r14, %r14
   *    0x12446c5  je   0x1244715               ; skip if null
   *    0x12446c7  mov  0x258(%rbx), %r15       ; r15 = memberEnd
   *    ...        walk-and-destroy loop @0x12446d0..@0x1244700
   *    0x1244702  mov  0x250(%rbx), %rdi       ; reload begin for free
   *    0x1244709  mov  %r14, 0x258(%rbx)       ; memberEnd = begin
   *                                            ;   (i.e. vector.clear())
   *    0x1244710  callq __ZdlPv                ; free storage
   *    0x1244715  mov  %rbx, %rdi
   *    0x1244722  jmp  __ZN5ausdk6AUBaseD2Ev   ; tail-call base dtor
   *
   *  The walk-and-destroy loop @0x12446d0..@0x1244700 iterates from
   *  `memberEnd` down to `memberBegin` (8-byte pointer stride), and for
   *  each non-null pointer calls the element's D1 destructor via
   *  vtable slot 0x08 (`callq *0x8(%rax)` @0x12446fd) — while nulling
   *  the slot before the call (`movq $0x0, -0x8(%r15)` @0x12446ed) so
   *  a re-entrant destructor won't see it. */
  destructD1(): void {
    // @0x12446ad/@0x12446b4/@0x12446b8 — reinstall base vtable ptr.
    this.vtbl = AUEFFECTBASE_VTABLE_LITERAL_ADDRESS;

    // @0x12446bb — r14 = memberBegin
    const begin = this.memberBegin;
    // @0x12446c2/@0x12446c5 — if (begin != null) { ... } else skip to base
    if (begin !== null) {
      // @0x12446c7 — r15 = memberEnd (index sentinel, in pointer units)
      let r15 = this.memberEnd;
      // @0x12446d1/@0x12446d4/@0x12446d6 — cmp r15,r14; jne 0x12446e9
      //     initial entry: if r15 == 0 (i.e. empty vector) fall
      //     through to the free at @0x1244702.
      if (r15 !== 0) {
        // Walk-and-destroy loop @0x12446e0..@0x1244700 — reverse iterate.
        // Each iteration:
        //   @0x12446e9  rdi = slot[r15-1]         ; load pointer
        //   @0x12446ed  slot[r15-1] = 0           ; null it out
        //   @0x12446f5  if rdi != null:
        //   @0x12446fa    rax = vtbl of *rdi
        //   @0x12446fd    call *0x8(%rax)         ; element D1
        //   @0x1244700  jmp back to top
        //   @0x12446e0  r15 -= 8 (one pointer)
        //   @0x12446e4  if r15 == r14: break
        while (true) {
          // First step of the top-of-loop: process slot at (r15-1).
          const p = begin[r15 - 1];
          begin[r15 - 1] = null; // @0x12446ed
          if (p !== null) {
            // @0x12446fa/@0x12446fd — virtual D1 via vtable slot 0x08.
            p.vtbl.destroy(p);
          }
          // @0x12446e0 — advance the reverse cursor (one pointer step).
          r15 = r15 - 1;
          // @0x12446e4 — done when we hit begin (r15 == 0 in JS terms).
          if (r15 === 0) break;
        }
      }
      // @0x1244702/@0x1244709 — vector.clear(): memberEnd = begin-index
      //     (in JS we store an index, so end := 0 means "no elements").
      // @0x1244710 — operator delete on the vector's storage.
      this.memberEnd = 0;
      operator_delete(begin);
    }
    // @0x1244715..@0x1244722 — tail-call `ausdk::AUBase::~AUBase()`.
    ausdk_AUBase_D2(this);
  }

  /** AUTrimLevel::~AUTrimLevel() — D0 (deleting) destructor.
   *  Symbol `__ZN11AUTrimLevelD0Ev`  @Flexo 0x1244730.
   *
   *  Body is identical to D1 up to and including the base-class dtor
   *  call, then additionally frees `this` itself via `operator delete`.
   *  Raw asm delta vs D1:
   *    0x12447a8  callq __ZN5ausdk6AUBaseD2Ev   ; (not a tail-jmp)
   *    0x12447ad  mov   %rbx, %rdi              ; arg1 = this
   *    0x12447ba  jmp   __ZdlPv                 ; tail-call operator delete
   */
  destructD0(): void {
    // @0x1244744/@0x1244748 — reinstall base vtable ptr (same literal).
    this.vtbl = AUEFFECTBASE_VTABLE_LITERAL_ADDRESS;

    // @0x124474b — r14 = memberBegin
    const begin = this.memberBegin;
    // @0x1244752/@0x1244755 — if (begin != null) { ... }
    if (begin !== null) {
      // @0x1244757 — r15 = memberEnd
      let r15 = this.memberEnd;
      // @0x1244761/@0x1244764/@0x1244766 — initial cmp; if empty skip.
      if (r15 !== 0) {
        // Walk-and-destroy loop @0x1244770..@0x1244790 — identical to D1.
        while (true) {
          const p = begin[r15 - 1];                // @0x1244779
          begin[r15 - 1] = null;                   // @0x124477d
          if (p !== null) {                        // @0x1244785/@0x1244788
            p.vtbl.destroy(p);                     // @0x124478a/@0x124478d
          }
          r15 = r15 - 1;                           // @0x1244770
          if (r15 === 0) break;                    // @0x1244774
        }
      }
      // @0x1244792/@0x1244799 — vector.clear(): memberEnd = begin-index.
      // @0x12447a0 — operator delete on the vector's storage.
      this.memberEnd = 0;
      operator_delete(begin);
    }
    // @0x12447a5..@0x12447a8 — call `ausdk::AUBase::~AUBase()` (not tail).
    ausdk_AUBase_D2(this);
    // @0x12447ad..@0x12447ba — free `this` itself.
    operator_delete(this);
  }
}
