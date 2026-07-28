// FFHCopyAlpha.ts — Flexo's "copy alpha" filter node. Faithful transcription
// of all three externally-visible FFHCopyAlpha methods from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//     Versions/A/Flexo
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.FFHCopyAlpha.GetDOD.s         @0x654bf0
//   raw-port/re/disasm/Flexo.FFHCopyAlpha.D1.s             @0x654c10  (D1 complete-object dtor)
//   raw-port/re/disasm/Flexo.FFHCopyAlpha.~FFHCopyAlpha.s  @0x654c20  (D0 deleting     dtor)
//
// nm confirms these are the ONLY externally-visible FFHCopyAlpha methods in
// Flexo:
//   0000000000654bf0 T FFHCopyAlpha::GetDOD(HGRenderer*, int, HGRect)
//                       [__ZN12FFHCopyAlpha6GetDODEP10HGRendereri6HGRect]
//   0000000000654c10 T FFHCopyAlpha::~FFHCopyAlpha()           [D1]  __ZN12FFHCopyAlphaD1Ev
//   0000000000654c20 T FFHCopyAlpha::~FFHCopyAlpha()           [D0]  __ZN12FFHCopyAlphaD0Ev
// (both destructor entries are listed by nm as "~FFHCopyAlpha()" — the D-mangling
// letter distinguishes them: D1 = complete-object dtor, D0 = deleting dtor.)
//
// ---------------------------------------------------------------------------
// Class relationships (recovered from the dtor call graph):
//   FFHCopyAlpha  is-a  HgcCopyAlpha                (both dtor entries chain
//                                                     into HgcCopyAlpha::~HgcCopyAlpha()
//                                                     — Itanium ABI vtable
//                                                     inheritance pattern)
//   HgcCopyAlpha  is-a  HGObject                    (the D0 deleting dtor
//                                                     tail-calls HGObject::operator delete
//                                                     — HGObject provides the
//                                                     custom operator delete)
// Neither HgcCopyAlpha nor HGObject is ported yet. Their entry points are
// surfaced here as throwing stubs; that IS the demand signal that this class
// needs those ports next.
//
// ---------------------------------------------------------------------------
// Cited callees / RIP constants:
//   HgcCopyAlpha::~HgcCopyAlpha()   @Flexo  __ZN12HgcCopyAlphaD2Ev  (base-object dtor)
//                                    invoked @0x654c15 (D1 tail-call) and @0x654c29 (D0 call).
//   HGObject::operator delete(void*)  @Flexo __stubs @0x1496d8c  (__ZN8HGObjectdlEPv)
//                                     tail-jumped @0x654c37 (deleting dtor's final free).
//   _HGRectNull                       @Flexo  literal-pool @0x654bfc reference
//                                     (already ported: raw-port/src/render/HGRect.ts HGRectNull).
//
// ---------------------------------------------------------------------------
// FFHCopyAlpha::GetDOD semantics (see raw-port/re/disasm/Flexo.FFHCopyAlpha.GetDOD.s):
//
// The "GetDOD" method family across HG*/FFH* filter nodes returns the filter's
// "domain of definition" (DOD) for a given rendering mode. FFHCopyAlpha is a
// simple alpha-copy pass whose output has the SAME bounds as its input when
// operating in the pass-through mode (mode == 1); in every other mode it
// declares an empty DOD (HGRectNull).
//
// The assembly encodes exactly this two-branch table:
//
//   FFHCopyAlpha::GetDOD(HGRenderer* renderer, int mode, HGRect r):
//     @0x654bf0 movq %rcx,%rax                       ; rax = r.lo    (x|y<<32)
//     @0x654bf3 cmpl $0x1,%edx                       ; if (mode == 1)
//     @0x654bf6 je   0x654c0b                        ;   goto pass_through
//     @0x654bf8..@0x654bf9 pushq %rbp / movq %rsp,%rbp
//     @0x654bfc movq _HGRectNull(%rip),%rcx          ; rcx = &_HGRectNull
//     @0x654c03 movq (%rcx),%rax                     ; rax = HGRectNull.lo  = 0
//     @0x654c06 movq 0x8(%rcx),%r8                   ; r8  = HGRectNull.hi  = 0
//     @0x654c0a popq %rbp
//     @0x654c0b (pass_through / null-fallthrough):
//     @0x654c0b movq %r8,%rdx                        ; rdx = hi qword
//     @0x654c0e retq                                 ; return (rax, rdx) = (lo, hi) of HGRect
//
// Note that FFHCopyAlpha::GetDOD IGNORES both `renderer` and `this` — they
// are input parameters by the vtable signature but never read (rdi, rsi are
// never touched). The DOD depends only on `mode` and the incoming HGRect.

import { HGRect, HGRectNull } from "./HGRect";

/** HGRenderer — forward-declared for FFHCopyAlpha's method signature. Not
 *  ported yet; FFHCopyAlpha::GetDOD does not read it (see file header). */
export interface HGRenderer {
  readonly __hgRenderer: true;
}

/**
 * FFHCopyAlpha::GetDOD(HGRenderer*, int mode, HGRect r)          @Flexo 0x654bf0
 *
 * Two-branch table (see file header):
 *   mode == 1: return r unchanged                         (pass-through DOD)
 *   otherwise: return HGRectNull                          (empty DOD)
 *
 * `renderer` and `this` are unused by the asm (see file header) — accepted
 * only to match the vtable signature.
 */
export function FFHCopyAlpha_GetDOD(
  _self: FFHCopyAlpha,
  _renderer: HGRenderer,
  mode: number,
  r: HGRect,
): HGRect {
  // @0x654bf3: cmpl $0x1,%edx  ;  @0x654bf6: je 0x654c0b
  if ((mode | 0) === 1) {
    // @0x654c0b..@0x654c0e pass-through: return the input HGRect.
    // (In asm this is achieved by rax = r.lo (@0x654bf0) and rdx = r.hi
    // via r8 (@0x654c0b) — the same 16-byte value.)
    return r;
  }
  // @0x654bfc..@0x654c06: rax = _HGRectNull.lo, r8 = _HGRectNull.hi.
  // @0x654c0b..@0x654c0e: rdx = r8; ret. Returned value is _HGRectNull.
  return HGRectNull;
}

/**
 * FFHCopyAlpha instance shape. Since neither externally-visible method reads
 * any FFHCopyAlpha field, the struct layout of FFHCopyAlpha itself is NOT
 * observable from these three disassemblies — the fields it inherits from
 * HgcCopyAlpha / HGObject / etc. will come in with those base-class ports.
 * For now we surface only the polymorphic shape (the vtable-slot 0 -> the
 * complete-object dtor is what the dtor path uses).
 */
export interface FFHCopyAlpha {
  /** Concrete-class marker. Zero fields visible from FFHCopyAlpha's own methods. */
  readonly __ffhCopyAlpha: true;
}

/**
 * FFHCopyAlpha::~FFHCopyAlpha() [D1 — complete-object dtor]      @Flexo 0x654c10
 *
 * Chains directly to the base HgcCopyAlpha destructor and returns (there are
 * no FFHCopyAlpha-owned members visible from this frame — the entire body is
 * a `jmp` into the base dtor).
 *
 *   @0x654c10..@0x654c11  pushq %rbp / movq %rsp,%rbp
 *   @0x654c14            popq  %rbp
 *   @0x654c15            jmp   __ZN12HgcCopyAlphaD2Ev            ; HgcCopyAlpha::~HgcCopyAlpha()
 *
 * The `jmp` (rather than `call`+`ret`) is a compiler tail-call — same
 * observable effect: run the base dtor and return to the caller of the D1.
 */
export function FFHCopyAlpha_D1_dtor(self: FFHCopyAlpha): void {
  // @0x654c15 jmp __ZN12HgcCopyAlphaD2Ev (HgcCopyAlpha::~HgcCopyAlpha())
  // HgcCopyAlpha is not ported yet. Surfacing this as a throwing stub is
  // the correct demand signal per the decode-before-implement rule; the
  // base dtor will attach when HgcCopyAlpha is transcribed.
  HgcCopyAlpha_D2_dtor(self as unknown as HgcCopyAlpha);
}

/**
 * FFHCopyAlpha::~FFHCopyAlpha() [D0 — deleting dtor]             @Flexo 0x654c20
 *
 * Runs the base dtor and then frees the object via HGObject's operator delete.
 *
 *   @0x654c20..@0x654c21 pushq %rbp / movq %rsp,%rbp
 *   @0x654c24            pushq %rbx                            ; save
 *   @0x654c25            pushq %rax                            ; align (dummy)
 *   @0x654c26            movq  %rdi,%rbx                       ; rbx = this
 *   @0x654c29            callq __ZN12HgcCopyAlphaD2Ev          ; HgcCopyAlpha::~HgcCopyAlpha()
 *   @0x654c2e            movq  %rbx,%rdi                       ; rdi = this  (arg for op delete)
 *   @0x654c31            addq  $0x8,%rsp                        ; unwind align
 *   @0x654c35            popq  %rbx
 *   @0x654c36            popq  %rbp
 *   @0x654c37            jmp   __ZN8HGObjectdlEPv              ; HGObject::operator delete(void*)
 *
 * Standard Itanium ABI D0 pattern: run D2 base, then tail-call the class's
 * chosen `operator delete` on `this`. FFHCopyAlpha uses HGObject::operator
 * delete, confirming HGObject is somewhere in its inheritance chain.
 */
export function FFHCopyAlpha_D0_dtor(self: FFHCopyAlpha): void {
  // @0x654c29 callq HgcCopyAlpha::~HgcCopyAlpha()
  HgcCopyAlpha_D2_dtor(self as unknown as HgcCopyAlpha);
  // @0x654c37 jmp HGObject::operator delete(void*)  (tail-call, so the D2
  // return address is the caller of D0 — same behavior as call+ret).
  HGObject_operator_delete(self);
}

// ---------------------------------------------------------------------------
// Frontier stubs — the two undecoded callees this class demands.
// Each stub throws citing its exact call site so the port graph reveals
// which base class needs transcribing next.
// ---------------------------------------------------------------------------

/** HgcCopyAlpha — base class of FFHCopyAlpha. Not ported yet. */
export interface HgcCopyAlpha {
  readonly __hgcCopyAlpha: true;
}

/**
 * HgcCopyAlpha::~HgcCopyAlpha()  [D2 base-object dtor]           @Flexo (unresolved)
 * @stub — called from FFHCopyAlpha D1 @0x654c15 and D0 @0x654c29
 *         (__ZN12HgcCopyAlphaD2Ev). Not ported yet.
 */
export function HgcCopyAlpha_D2_dtor(_self: HgcCopyAlpha): void {
  throw new Error(
    "HgcCopyAlpha::~HgcCopyAlpha() [D2] not ported — called from " +
      "FFHCopyAlpha D1@0x654c15 / D0@0x654c29 (Flexo __ZN12HgcCopyAlphaD2Ev)",
  );
}

/**
 * HGObject::operator delete(void*)                               @Flexo __stubs 0x1496d8c
 * @stub — tail-jumped from FFHCopyAlpha D0 @0x654c37 (__ZN8HGObjectdlEPv).
 * HGObject provides FCP's HG* memory-pool free path. Not ported yet.
 */
export function HGObject_operator_delete(_p: unknown): void {
  throw new Error(
    "HGObject::operator delete(void*) not ported — tail-called from " +
      "FFHCopyAlpha D0@0x654c37 (Flexo __stubs 0x1496d8c __ZN8HGObjectdlEPv)",
  );
}
