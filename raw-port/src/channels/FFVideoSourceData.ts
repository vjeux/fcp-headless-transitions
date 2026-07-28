// FFVideoSourceData.ts — Flexo's source-video geometry snapshot.
// Faithful transcription of the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// -----------------------------------------------------------------------------
// SHAPE
// -----------------------------------------------------------------------------
// FFVideoSourceData is a 48-byte plain-old struct that captures two 24-byte
// geometry records read from an FFSourceVideoFig* Objective-C object at
// construction time.  The two 24-byte fields sit at:
//
//   +0x00..+0x18  primary   : { double, double, double }   — return-slot of
//                                [fig <sel1>]   (objc_msgSend_stret)
//   +0x18..+0x30  secondary : { double, double, double }   — return-slot of
//                                [[fig _notifyOfFirstDrawing:<sel1>] <sel2>]
//                                — but ONLY if the intermediate id is non-nil
//
// Both selectors are pulled from the Objective-C __objc_selrefs table via
// RIP-relative reads in the compiled body (@0xec6dd3, @0xe8ed90, @0xe8e72b
// respectively).  The exact selector names are undecoded here — the RIP-
// relative reference table maps to selector strings that require walking the
// __objc_methname / __objc_selrefs sections; we cite each addr so a later
// pass can back-fill.  Naming-wise, based on the containing FFSourceVideoFig
// domain, these are likely `[fig imageAperture]` and `[first-drawing
// referenceAperture]` (or equivalent CG geometry-property selectors), but
// FAITHFULNESS demands we NOT invent the name — we throw with the objc-
// selref address.
//
// Both C1 (complete-object) and C2 (base-subobject) forms are emitted; the
// bodies are identical, per the Itanium ABI for a class with no virtual
// bases.  Same applies to the copy-ctor pair.
//
// -----------------------------------------------------------------------------
// FFVideoSourceData::FFVideoSourceData(FFSourceVideoFig*)  @0xd2a4d0 (C2)
//                                                          @0xd2a570 (C1 — identical body)
// -----------------------------------------------------------------------------
// Disassembly (from /tmp/Flexo_tV.txt line 3289128 — C2 form; C1 identical):
//     pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx / subq $0x20,%rsp
//     movq  %rsi, %r14                                        ; r14 = fig (FFSourceVideoFig*)
//     movq  %rdi, %rbx                                        ; rbx = this
//     testq %rsi, %rsi / je 0xd2a4fb                          ; if (fig == nil) skip msgSend
//     movq  <selref@0xec6dd3>(%rip), %rdx                     ; rdx = @selector(sel1)
//     leaq  -0x30(%rbp), %rdi                                 ; rdi = stret return-slot
//     movq  %r14, %rsi                                        ; rsi = fig
//     callq _objc_msgSend_stret                               ; [fig sel1]  -> 24 bytes @ -0x30
//     jmp   0xd2a50a
//   fig == nil branch (0xd2a4fb):
//     xorps %xmm0, %xmm0
//     movaps %xmm0, -0x30(%rbp)                               ; zero first 16 bytes
//     movq  $0x0, -0x20(%rbp)                                 ; zero trailing 8 bytes
//   join (0xd2a50a):
//     movq  -0x20(%rbp), %rax
//     movq  %rax, 0x10(%rbx)                                  ; this[+0x10] = high 8 bytes
//     movaps -0x30(%rbp), %xmm0
//     movups %xmm0, (%rbx)                                    ; this[+0x00..+0x10] = low 16 bytes
//
//     ; -- second read: [[fig _notifyOfFirstDrawing:sel1] sel2] --
//     movq  <selref@0xe8ed90>(%rip), %rsi                     ; rsi = @selector("<sel1a>")
//     movq  %r14, %rdi                                        ; rdi = fig
//     callq *<selstub@0xbc3197>(%rip)                         ; rax = objc_msgSend(fig, sel1a)
//                                                              ;   NOTE the disassembler comment
//                                                              ;   says "-[_notifyOfFirstDrawing:]"
//                                                              ;   — this is otool's guess for the
//                                                              ;   stub's owning class; the ACTUAL
//                                                              ;   selector at the sel-ref is not
//                                                              ;   necessarily _notifyOfFirstDrawing.
//     testq %rax, %rax / je 0xd2a543                          ; if returned nil, zero the field
//   nonnil branch (0xd2a52e):
//     movq  <selref@0xe8e72b>(%rip), %rdx                     ; rdx = @selector(sel2)
//     leaq  -0x30(%rbp), %rdi
//     movq  %rax, %rsi                                        ; rsi = intermediate id
//     callq _objc_msgSend_stret                               ; [id sel2] -> 24 bytes @ -0x30
//     jmp   0xd2a552
//   nil branch (0xd2a543):
//     xorps %xmm0, %xmm0
//     movaps %xmm0, -0x30(%rbp)
//     movq  $0x0, -0x20(%rbp)
//   join (0xd2a552):
//     movq  -0x20(%rbp), %rax
//     movq  %rax, 0x28(%rbx)                                  ; this[+0x28] = high 8 bytes
//     movaps -0x30(%rbp), %xmm0
//     movups %xmm0, 0x18(%rbx)                                ; this[+0x18..+0x28] = low 16 bytes
//     ...pop / ret
//
// -----------------------------------------------------------------------------
// FFVideoSourceData::FFVideoSourceData(FFVideoSourceData const&)  @0xd2a610 (C2)
//                                                                 @0xd2a640 (C1)
// -----------------------------------------------------------------------------
// Trivial member-wise byte copy — verbatim (both bodies identical):
//     pushq %rbp / movq %rsp,%rbp
//     movq  0x10(%rsi), %rax
//     movq  %rax, 0x10(%rdi)                                  ; this[+0x10] = src[+0x10]
//     movups (%rsi), %xmm0
//     movups %xmm0, (%rdi)                                    ; this[+0x00..+0x10] = src[+0x00..+0x10]
//     movups 0x18(%rsi), %xmm0
//     movups %xmm0, 0x18(%rdi)                                ; this[+0x18..+0x28] = src[+0x18..+0x28]
//     movq  0x28(%rsi), %rax
//     movq  %rax, 0x28(%rdi)                                  ; this[+0x28] = src[+0x28]
//     popq %rbp / ret
//
// -----------------------------------------------------------------------------
// TypeScript port
// -----------------------------------------------------------------------------

/** Opaque handle for FFSourceVideoFig* — an Objective-C class, not decoded. */
export type FFSourceVideoFig = { readonly __brand: "FFSourceVideoFig" };

/**
 * A single 24-byte geometry record.  Byte layout as observed in the compiled
 * body: 16 bytes at +0x00..+0x10 (SSE lane), 8 bytes at +0x10..+0x18.
 *
 * Interpreted as three consecutive 8-byte doubles (the standard C ABI for a
 * struct returned via `_stret` at this exact size on x86_64).  Whether they
 * represent {x, y, z}, {width, height, angle}, or something FFSourceVideoFig-
 * specific isn't decoded here — the two RIP-relative selrefs @0xec6dd3 and
 * @0xe8e72b that name the source Objective-C properties are undecoded.
 */
export interface FFGeom24 {
  /** @native +0x00 : double */ a: number;
  /** @native +0x08 : double */ b: number;
  /** @native +0x10 : double */ c: number;
}

/** Zero-initialised FFGeom24 — used when the source Objective-C message is nil. */
const ZERO_GEOM24: FFGeom24 = { a: 0, b: 0, c: 0 };

/**
 * Objective-C dispatch shim.  Not implemented — throws with the compiled
 * selref address so any real invocation lands on the frontier.
 */
function objc_msgSend_stret_geom24_stub(
  target: unknown,
  selrefAddr: number,
  callsite: string,
): FFGeom24 {
  throw new Error(
    "objc_msgSend_stret returning FFGeom24 — not yet ported. " +
      `selref @Flexo 0x${selrefAddr.toString(16)}, callsite @${callsite}. ` +
      `Target type: FFSourceVideoFig* (or a first-drawing id).`,
  );
  void target;
}

/**
 * Objective-C dispatch shim for the intermediate `id` returned by the
 * `_notifyOfFirstDrawing:`-family call at @0xd2a523.
 */
function objc_msgSend_id_stub(
  target: unknown,
  selrefAddr: number,
  callsite: string,
): unknown {
  throw new Error(
    "objc_msgSend returning id — not yet ported. " +
      `selref @Flexo 0x${selrefAddr.toString(16)}, callsite @${callsite}.`,
  );
  void target;
}

/**
 * FFVideoSourceData — 48-byte struct of two FFGeom24 records.
 *
 * @native sizeof = 0x30 (48 bytes)
 * @native +0x00 primary   : FFGeom24
 * @native +0x18 secondary : FFGeom24
 *
 * @asm ctor(FFSourceVideoFig*)  C2 @0xd2a4d0 / C1 @0xd2a570  (identical bodies)
 * @asm ctor(const FFVideoSourceData&) C2 @0xd2a610 / C1 @0xd2a640 (identical, trivial copy)
 */
export class FFVideoSourceData {
  /** @native +0x00..+0x18 — primary FFGeom24 read from [fig <sel@0xec6dd3>]. */
  primary: FFGeom24;
  /** @native +0x18..+0x30 — secondary FFGeom24 read from [[fig <sel@0xe8ed90>] <sel@0xe8e72b>]. */
  secondary: FFGeom24;

  /**
   * `FFVideoSourceData(FFSourceVideoFig* fig)`  @0xd2a4d0 (C2) / @0xd2a570 (C1).
   *
   * Reads two 24-byte geometry records from `fig` via Objective-C messaging.
   *
   * If `fig` is nil, `primary` is zeroed (via `xorps/movaps` @0xd2a4fb).
   * If the intermediate object returned by the second `_notifyOfFirstDrawing:`-
   * family message is nil, `secondary` is zeroed (via the same idiom @0xd2a543).
   *
   * The two `objc_msgSend_stret` calls and one `objc_msgSend` call are throw-
   * stubs: their selectors sit at compile-time-fixed selref addresses inside
   * Flexo but we don't decode the __objc_selrefs table.  This function will
   * therefore crash on real invocation, faithfully mirroring the frontier.
   *
   * @param fig FFSourceVideoFig* or nil — the source Objective-C fig object.
   */
  constructor(fig: FFSourceVideoFig | null | undefined);
  /**
   * `FFVideoSourceData(FFVideoSourceData const&)`  @0xd2a610 (C2) / @0xd2a640 (C1).
   *
   * Trivial member-wise copy — verbatim 48-byte block from src to this.
   */
  constructor(src: FFVideoSourceData);
  constructor(arg: FFSourceVideoFig | FFVideoSourceData | null | undefined) {
    // ------ Copy ctor path -------------------------------------------------
    if (arg instanceof FFVideoSourceData) {
      // @0xd2a614..@0xd2a62e — 48-byte member copy in three SSE moves + two qword moves.
      this.primary = { a: arg.primary.a, b: arg.primary.b, c: arg.primary.c };
      this.secondary = {
        a: arg.secondary.a,
        b: arg.secondary.b,
        c: arg.secondary.c,
      };
      return;
    }

    // ------ FFSourceVideoFig* ctor path ------------------------------------
    // @0xd2a4e1: testq %rsi,%rsi ; je 0xd2a4fb  — fig == nil branch zeroes primary.
    if (arg == null) {
      // Match the compiled `xorps xmm0,xmm0 ; movaps xmm0,-0x30(%rbp) ; movq $0,-0x20(%rbp)` idiom.
      this.primary = { ...ZERO_GEOM24 };
    } else {
      // @0xd2a4e6..@0xd2a4f4 — [fig <selector-at-selref@0xec6dd3>]  → 24 bytes.
      this.primary = objc_msgSend_stret_geom24_stub(arg, 0xec6dd3, "0xd2a4f4");
    }

    // @0xd2a519..@0xd2a523 — id intermediate = [fig <selector-at-selref@0xe8ed90>]
    // NOTE: this call uses a plain objc_msgSend (via the sel-stub at 0xbc3197);
    //       the disassembler's inline comment identifies the stub as
    //       "-[_notifyOfFirstDrawing:]" but that comes from the stub's implementing
    //       class, not from this call site's selector.  Faithful to compiled body:
    //       we dispatch through the sel-ref regardless of what the stub is called.
    const intermediate =
      arg == null ? null : objc_msgSend_id_stub(arg, 0xe8ed90, "0xd2a523");

    // @0xd2a529: testq %rax,%rax ; je 0xd2a543  — nil-check on intermediate.
    if (intermediate == null) {
      this.secondary = { ...ZERO_GEOM24 };
    } else {
      // @0xd2a52e..@0xd2a53c — [intermediate <selector-at-selref@0xe8e72b>] → 24 bytes.
      this.secondary = objc_msgSend_stret_geom24_stub(
        intermediate,
        0xe8e72b,
        "0xd2a53c",
      );
    }
  }
}
