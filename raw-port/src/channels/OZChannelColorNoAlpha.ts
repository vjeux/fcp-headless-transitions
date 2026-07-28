// OZChannelColorNoAlpha — Ozone compound channel that groups three OZChannel
// sub-channels (red, green, blue — the alpha-less sibling of `OZChannelColor`)
// plus a fourth `OZChannelEnum`-typed sub-channel (colour space / gamma flag).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
// Versions/A/Ozone (x86_64 fat sub-slice; sub-arch file offset 0x4000).
//
// ONLY the complete-object destructor (D1) is exported from Ozone for this
// class. The three ctor variants (default / RGB / RGB-with-info) all live in
// the U-extern set and are not disassemblable from this framework — every
// per-instance-state-setup path is therefore surfaced as a throwing frontier
// stub with the exact call site cited (see below).
//
// Source disassembly:
//   raw-port/re/disasm/OZChannelColorNoAlpha.~OZChannelColorNoAlpha.s   @Ozone 0x8d590
//
// SYMBOLS EXPOSED ON THIS CLASS (nm -a Ozone):
//   __ZN21OZChannelColorNoAlphaD1Ev  ->  OZChannelColorNoAlpha::~OZChannelColorNoAlpha()   @0x8d590
//
// VTABLE — recovered from the D1 install:
//   @Ozone 0x8d599:  movq 0x795350(%rip), %rax       ; %rax = &_ZTV21OZChannelColorNoAlpha
//   @Ozone 0x8d59d:  next-insn PC = 0x8d5a0, so vtable VA = 0x8d5a0 + 0x795350 = 0x8228f0.
//   Primary vptr    = vtable + 0x10 = 0x822900     (written to *(this+0)     @0x8d5a4)
//   Secondary vptr  = vtable + 0x370 = 0x822c60    (written to *(this+0x10)  @0x8d5ad)
//   This is the same two-vptr install pattern used by every OZChannel-lineage
//   compound channel (cf. OZChannelShearAngle, OZChannel2D, OZChannel3D,
//   OZChannelAngle, OZChannelDouble — they all install a primary at
//   `vtable + 0x10` and a secondary at `vtable + 0x370`).
//
// STRUCT LAYOUT — recovered from the D1 dtor:
//   +0x000  primary vptr                     (= vtable+0x10 = 0x822900, install @0x8d5a4)
//   +0x008..+0x00f                           (opaque — OZCompoundChannel base subobject slot 0)
//   +0x010  secondary vptr                   (= vtable+0x370 = 0x822c60, install @0x8d5ad)
//   +0x018..+0x087                           (rest of OZCompoundChannel base subobject; the base
//                                             dtor `OZCompoundChannel::~OZCompoundChannel()`
//                                             tail-jmp @0x8d5f6 handles the teardown of everything
//                                             that lives in this range)
//   +0x088  OZChannel sub-channel  #1         (dtor call @0x8d5e1..0x8d5e8 → OZChannel::~OZChannel)
//   +0x120  OZChannel sub-channel  #2         (dtor call @0x8d5d5..0x8d5dc → OZChannel::~OZChannel)
//   +0x1b8  OZChannel sub-channel  #3         (dtor call @0x8d5c9..0x8d5d0 → OZChannel::~OZChannel)
//   +0x250  OZChannel sub-channel  #4         (dtor call @0x8d5bd..0x8d5c4 → OZChannel::~OZChannel)
//   +0x2e8  OZChannelEnum sub-channel         (dtor call @0x8d5b1..0x8d5b8 → OZChannelEnum::~OZChannelEnum)
//
// The FOUR contiguous OZChannel-shaped sub-objects are each 0x98 bytes wide
// (0x120-0x88 = 0x1b8-0x120 = 0x250-0x1b8 = 0x2e8-0x250 = 0x98 — the exact
// sizeof(OZChannelShearAngle) / sizeof(OZChannelDouble) recovered from
// clone-time `operator new(0x98)` in the sibling classes). The FIFTH
// (`OZChannelEnum`) sub-object begins at +0x2e8; its width is not observable
// from this dtor alone (the base-dtor tail-jmp closes out the layout at the
// class boundary), but every OZChannelEnum instance is at minimum 0x98 wide
// as well (same OZChannel-derived base).
//
// The dtor visits the sub-objects in **reverse construction order** — the
// OZChannelEnum at +0x2e8 (last-constructed → first-destructed), then the
// four OZChannels at +0x250, +0x1b8, +0x120, +0x88, then the base dtor.
// This is the standard C++ dtor unwind pattern.
//
// This class corresponds to the FCP colour-channel scope used by material
// pipelines that do NOT need an alpha component — the paired class
// `OZMaterialCompoundLayer::createDiffuseLayer(..., OZChannelColorNoAlpha*,
// OZChannelColorNoAlpha*, ...)` takes exactly TWO pointers to this class as
// its diffuse + emissive colour inputs. This is the ONLY consumer of the
// type visible in the Ozone symbol table.

// ── Frontier stubs — undecoded base-class callees ────────────────────────

/**
 * `OZChannelEnum::~OZChannelEnum()` — @Ozone symbol stub 0x6dd9d4, mangled
 * `__ZN13OZChannelEnumD1Ev`. Not yet transcribed. Called from
 * `~OZChannelColorNoAlpha` @Ozone 0x8d5b8 with `%rdi = this + 0x2e8`
 * (destructs the trailing OZChannelEnum sub-object). The `OZChannelEnum`
 * base class itself is not yet ported; when it lands, this stub should be
 * replaced by a call into that TS module.
 */
function OZChannelEnum_dtor_stub(_p: unknown): void {
  throw new Error(
    "OZChannelEnum::~OZChannelEnum() @Ozone stub 0x6dd9d4 " +
      "(__ZN13OZChannelEnumD1Ev — not yet transcribed) — " +
      "invoked by OZChannelColorNoAlpha::~OZChannelColorNoAlpha() @Ozone 0x8d5b8",
  );
}

/**
 * `OZChannel::~OZChannel()` — @Ozone symbol stub 0x6df480, mangled
 * `__ZN9OZChannelD2Ev` (base-only D2 destructor). Not yet transcribed.
 * Called FOUR times from `~OZChannelColorNoAlpha`:
 *   @0x8d5c4  with %rdi = this + 0x250   (sub-channel #4)
 *   @0x8d5d0  with %rdi = this + 0x1b8   (sub-channel #3)
 *   @0x8d5dc  with %rdi = this + 0x120   (sub-channel #2)
 *   @0x8d5e8  with %rdi = this + 0x088   (sub-channel #1)
 * The OZChannel base dtor is undecoded here; when it lands, this stub
 * should be replaced by a direct call.
 */
function OZChannel_dtor_stub(_p: unknown): void {
  throw new Error(
    "OZChannel::~OZChannel() @Ozone stub 0x6df480 " +
      "(__ZN9OZChannelD2Ev — not yet transcribed) — " +
      "invoked by OZChannelColorNoAlpha::~OZChannelColorNoAlpha() @Ozone " +
      "0x8d5c4 (sub-channel@+0x250), 0x8d5d0 (sub-channel@+0x1b8), " +
      "0x8d5dc (sub-channel@+0x120), 0x8d5e8 (sub-channel@+0x88)",
  );
}

/**
 * `OZCompoundChannel::~OZCompoundChannel()` — @Ozone symbol stub 0x6de2b6,
 * mangled `__ZN17OZCompoundChannelD2Ev`. Not yet transcribed. Tail-jmp'd
 * from `~OZChannelColorNoAlpha` @Ozone 0x8d5f6 with `%rdi = this`,
 * finishing the destruction of the OZCompoundChannel base subobject
 * (which owns everything at +0x00..+0x87 that this dtor does not touch
 * directly). When OZCompoundChannel lands, this stub should be replaced
 * by a call into that TS module.
 */
function OZCompoundChannel_dtor_stub(_p: unknown): void {
  throw new Error(
    "OZCompoundChannel::~OZCompoundChannel() @Ozone stub 0x6de2b6 " +
      "(__ZN17OZCompoundChannelD2Ev — not yet transcribed) — " +
      "tail-jmp'd from OZChannelColorNoAlpha::~OZChannelColorNoAlpha() @Ozone 0x8d5f6",
  );
}

// ── Frontier stubs — the three ctors (all U-externs, not disassemblable) ─

/**
 * The class's C2 constructors are NOT emitted in the Ozone framework — they
 * are U-externs (undefined-symbol references) that must be resolved by
 * another framework at load time. They are surfaced here as throwing stubs
 * so that a caller who reaches for construction gets a loud, cited failure
 * instead of a silent zero-state instance.
 *
 * The consumer confirmed by the symbol table is
 *   OZMaterialCompoundLayer::createDiffuseLayer(...)
 * which takes TWO `OZChannelColorNoAlpha*` pointers as inputs.
 */
function OZChannelColorNoAlpha_ctor_stub(): OZChannelColorNoAlpha {
  throw new Error(
    "OZChannelColorNoAlpha::OZChannelColorNoAlpha(...) @Ozone U-extern " +
      "(all ctor variants not emitted in Ozone; the class is constructed by " +
      "another framework loader — no disassembly available on this side)",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelColorNoAlpha` — alpha-less compound colour channel. See file
 * header for layout, vtable install addresses, and consumer information.
 *
 * We model the observable per-instance state ONLY as opaque sub-object
 * slots — the four contiguous OZChannel sub-objects and the trailing
 * OZChannelEnum — because their base-class internals are frontier stubs.
 * Field names use the byte-offset suffix to keep the mapping to the C++
 * layout unambiguous.
 */
export class OZChannelColorNoAlpha {
  /** Primary vptr — @Ozone install site 0x8d5a4 loads vtable+0x10 (= VA
   *  0x822900) via the RIP-relative `0x795350(%rip)` at insn 0x8d599 whose
   *  next-insn PC is 0x8d5a0. Implicit in JS via prototype identity. */
  // (primary vtable slot is implicit)

  /** Secondary vptr — @Ozone install site 0x8d5ad loads vtable+0x370
   *  (= VA 0x822c60). Implicit. */
  // (secondary vtable slot is implicit)

  /** OZChannel sub-channel at C++ offset +0x88 (0x98 bytes wide).
   *  Destructed by ~OZChannelColorNoAlpha @0x8d5e8. */
  subChannel_0x88!: unknown;

  /** OZChannel sub-channel at C++ offset +0x120 (0x98 bytes wide).
   *  Destructed by ~OZChannelColorNoAlpha @0x8d5dc. */
  subChannel_0x120!: unknown;

  /** OZChannel sub-channel at C++ offset +0x1b8 (0x98 bytes wide).
   *  Destructed by ~OZChannelColorNoAlpha @0x8d5d0. */
  subChannel_0x1b8!: unknown;

  /** OZChannel sub-channel at C++ offset +0x250 (0x98 bytes wide).
   *  Destructed by ~OZChannelColorNoAlpha @0x8d5c4. */
  subChannel_0x250!: unknown;

  /** OZChannelEnum sub-channel at C++ offset +0x2e8.
   *  Destructed by ~OZChannelColorNoAlpha @0x8d5b8. */
  subChannelEnum_0x2e8!: unknown;

  /**
   * The C++ ctor set is not emitted in Ozone (all three variants are
   * U-externs — see the frontier stub above). Any TS caller reaching for
   * construction gets a loud, cited failure via this factory.
   */
  static construct(): OZChannelColorNoAlpha {
    return OZChannelColorNoAlpha_ctor_stub();
  }

  /**
   * `OZChannelColorNoAlpha::~OZChannelColorNoAlpha()` @Ozone 0x8d590 [D1].
   *
   * DISASM (raw-port/re/disasm/OZChannelColorNoAlpha.~OZChannelColorNoAlpha.s):
   *
   *   0x8d590  pushq %rbp
   *   0x8d591  movq  %rsp, %rbp
   *   0x8d594  pushq %rbx
   *   0x8d595  pushq %rax                             ; align stack (8 bytes pad)
   *   0x8d596  movq  %rdi, %rbx                       ; rbx = this
   *   0x8d599  movq  0x795350(%rip), %rax             ; rax = &_ZTV21OZChannelColorNoAlpha (VA 0x8228f0)
   *   0x8d5a0  leaq  0x10(%rax), %rcx                 ; rcx = vtable + 0x10 = 0x822900
   *   0x8d5a4  movq  %rcx, (%rdi)                     ; *(this+0)    = primary vptr
   *   0x8d5a7  addq  $0x370, %rax                     ; rax = vtable + 0x370 = 0x822c60
   *   0x8d5ad  movq  %rax, 0x10(%rdi)                 ; *(this+0x10) = secondary vptr
   *   0x8d5b1  addq  $0x2e8, %rdi                     ; rdi = this + 0x2e8
   *   0x8d5b8  callq __ZN13OZChannelEnumD1Ev          ; OZChannelEnum::~OZChannelEnum()
   *   0x8d5bd  leaq  0x250(%rbx), %rdi                ; rdi = this + 0x250
   *   0x8d5c4  callq __ZN9OZChannelD2Ev               ; OZChannel::~OZChannel()  (sub-channel #4)
   *   0x8d5c9  leaq  0x1b8(%rbx), %rdi                ; rdi = this + 0x1b8
   *   0x8d5d0  callq __ZN9OZChannelD2Ev               ; sub-channel #3
   *   0x8d5d5  leaq  0x120(%rbx), %rdi                ; rdi = this + 0x120
   *   0x8d5dc  callq __ZN9OZChannelD2Ev               ; sub-channel #2
   *   0x8d5e1  leaq  0x88(%rbx), %rdi                 ; rdi = this + 0x088
   *   0x8d5e8  callq __ZN9OZChannelD2Ev               ; sub-channel #1
   *   0x8d5ed  movq  %rbx, %rdi                       ; rdi = this
   *   0x8d5f0  addq  $0x8, %rsp                       ; unwind align pad
   *   0x8d5f4  popq  %rbx
   *   0x8d5f5  popq  %rbp
   *   0x8d5f6  jmp   __ZN17OZCompoundChannelD2Ev      ; tail-jmp OZCompoundChannel::~OZCompoundChannel()
   *
   * Semantic mirror below: vptr installs are IMPLICIT in the TS model
   * (JS objects derive their vtable identity from `.prototype`, matching
   * the C++ vtable slot). Sub-object destruction runs in reverse-of-
   * construction order (enum first, then channels 4→1, then base).
   */
  destructor(): void {
    // @0x8d5a4 / @0x8d5ad — vptr installs are implicit in JS (prototype
    // identity == C++ vtable identity).

    // @0x8d5b8 — enum sub-channel dtor on this+0x2e8.
    OZChannelEnum_dtor_stub(this.subChannelEnum_0x2e8);

    // @0x8d5c4 — sub-channel #4 dtor on this+0x250.
    OZChannel_dtor_stub(this.subChannel_0x250);

    // @0x8d5d0 — sub-channel #3 dtor on this+0x1b8.
    OZChannel_dtor_stub(this.subChannel_0x1b8);

    // @0x8d5dc — sub-channel #2 dtor on this+0x120.
    OZChannel_dtor_stub(this.subChannel_0x120);

    // @0x8d5e8 — sub-channel #1 dtor on this+0x88.
    OZChannel_dtor_stub(this.subChannel_0x88);

    // @0x8d5f6 — tail-jmp OZCompoundChannel::~OZCompoundChannel() on this.
    OZCompoundChannel_dtor_stub(this);
  }
}
