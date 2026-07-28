// OZFxPixelTransformsAPIData.ts — faithful transcription of FCP's Ozone
// class OZFxPixelTransformsAPIData: the pixel-transform-stack side-object
// hung off the Fx-API's thread-specific slot (see the ThreadSpecific
// destroy hook @0x4f5620), which owns:
//   1. A weak pointer to a LiAgent (a per-frame plug-in agent handle);
//   2. Two 4x4 double-precision matrices — a "pre-transform" and a
//      "post-transform" — that bracket the agent's own pixel transform
//      when constructing the final client pixel-to-pixel mapping.
//
// Binary source (x86_64 slice of the FAT Ozone framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//     Versions/A/Ozone
//
// Disassembly (recovered verbatim from /tmp/Ozone_tV.txt at the labels
// __ZN26OZFxPixelTransformsAPIData*; llvm-objdump per-symbol
// disassembly could not be used — otool folds all bodies into a
// linear-sweep run — so /tmp/Ozone_tV.txt is authoritative):
//   __ZN26OZFxPixelTransformsAPIData8setAgentEPK7LiAgent
//                                                @0x4f4610..0x4f4618
//   __ZN26OZFxPixelTransformsAPIData15setPreTransformEPK14PCMatrix44TmplIdE
//                                                @0x4f4620..0x4f46d4
//   __ZN26OZFxPixelTransformsAPIData16setPostTransformEPK14PCMatrix44TmplIdE
//                                                @0x4f46e0..0x4f47c4
//   __ZN26OZFxPixelTransformsAPIData14pixelTransformEv
//                                                @0x4f47d0..0x4f48c3
//   __ZN26OZFxPixelTransformsAPIData21inversePixelTransformEv
//                                                @0x4f48d0..0x4f4e46
//   __ZN26OZFxPixelTransformsAPIData25destinationPixelTransformEv
//                                                @0x4f4e50..0x4f4f55
//   __ZN26OZFxPixelTransformsAPIData32destinationInversePixelTransformEv
//                                                @0x4f4f60..0x4f5??? (large, see body)
//
// STRUCT LAYOUT (recovered from the setter bodies + the identity-matrix
// initialiser in `pixelTransform` @0x4f47e6..@0x4f4820 and the callee
// arg-setups at @0x4f4884 / @0x4f4b78):
//
//   struct OZFxPixelTransformsAPIData {   // 264 bytes total (0x108)
//     +0x000  LiAgent const*      agent;              (setAgent @0x4f4614:
//                                                     `movq %rsi,(%rdi)`)
//     +0x008  PCMatrix44Tmpl<double>  preTransform;   (setPreTransform copies
//                                                     16 doubles into
//                                                     +0x08..+0x88; the ptr
//                                                     handed to
//                                                     PCMatrix44Tmpl::operator*
//                                                     at @0x4f4b7f is
//                                                     `leaq 0x8(%r14) %rsi`
//                                                     — i.e. `&this->preTransform`.)
//     +0x088  PCMatrix44Tmpl<double>  postTransform;  (setPostTransform copies
//                                                     16 doubles into
//                                                     +0x88..+0x108; the ptr
//                                                     handed to
//                                                     PCMatrix44Tmpl::operator*
//                                                     at @0x4f4884 is
//                                                     `leaq 0x88(%r14),%rsi`.)
//   };
//
// The self-assignment guard in setPreTransform (@0x4f4628 `cmpq %rax,%rsi;
// je 0x4f46d3`) tests `&this->preTransform == source` — the C++
// `if (&preTransform != &m)` idiom that dodges 16-double self-copies.
// setPostTransform has the same guard with `%rax = leaq 0x88(%rdi)`.
//
// FRONTIER CALLEES (throw-stubbed below, addresses cited):
//   __ZNK14PCMatrix44TmplIdEmlERKS0_
//     PCMatrix44Tmpl<double>::operator*(PCMatrix44Tmpl<double> const&) const
//     called from pixelTransform @0x4f489c, @0x4f48ae;
//                 inversePixelTransform @0x4f4b85, @0x4f4dd3;
//                 destinationPixelTransform @0x4f4f2e, @0x4f4f40;
//                 destinationInversePixelTransform @0x4f5212, @0x4f5??? .
//     PCMatrix44Tmpl<double> IS NOT YET LANDED (see raw-port/src/infra/;
//     only PCMatrixErrorException.ts is there). Any matrix multiply
//     therefore has to be a throw-stub until PCMatrix44Tmpl<double> is
//     transcribed.
//   __ZNK7LiAgent24getInversePixelTransformEd
//     LiAgent::getInversePixelTransform(double) const  — called from
//     inversePixelTransform @0x4f4951 (this is the LiAgent::inverse of
//     the plug-in's per-frame pixel mapping; LiAgent is a class from
//     the Motion/FxPlug plug-in-agent SDK, not yet transcribed).
//   __ZNK7LiAgent23getClientPixelTransformEv
//     LiAgent::getClientPixelTransform() const  — called from
//     destinationPixelTransform @0x4f4eb3.
//   __ZNK7LiAgent30getInverseClientPixelTransformEv
//     LiAgent::getInverseClientPixelTransform() const  — called from
//     destinationInversePixelTransform @0x4f4fde.
//
// NUMERIC CONSTANTS (all decoded via
// `python3 raw-port/army/tools/resolve.py Ozone const <addr>`):
//   0x3ff0000000000000 (imm)                      = 1.0 (identity-matrix
//                                                        diagonal, written
//                                                        into the local
//                                                        stack matrix at
//                                                        -0xa0/-0x78/-0x50/
//                                                        -0x28 (%rbp) —
//                                                        the four (i,i)
//                                                        entries of a
//                                                        column-major
//                                                        PCMatrix44Tmpl<double>).
//   0x7053e0  (Ozone __DATA_CONST)                = 1.0  (the RIP-relative
//                                                        `movsd 0x2108f3(%rip),
//                                                        %xmm4` inside the
//                                                        inversion at
//                                                        @0x4f4ae5 —
//                                                        it's `1.0` and is
//                                                        divided by the
//                                                        computed
//                                                        determinant at
//                                                        @0x4f4aed; i.e.
//                                                        the Cramer's-rule
//                                                        1/det step).
//                                                        The SAME 1.0 is
//                                                        re-referenced from
//                                                        @0x4f4d3b, @0x4f517a,
//                                                        and @0x4f53c8.
//
// The four matrix-producing methods (pixelTransform,
// inversePixelTransform, destinationPixelTransform,
// destinationInversePixelTransform) return their result via the ABI
// large-struct return convention: `%rdi` on entry is a caller-allocated
// 128-byte return slot, and the function returns `%rdi` in `%rax`
// unchanged after populating it. In C++ this is a by-value
// `PCMatrix44Tmpl<double>` return. In this TS view they are exposed as
// methods that take the caller's out-buffer explicitly (an
// PCMatrix44TmplDouble | null argument) rather than returning by value,
// so that when PCMatrix44Tmpl<double> lands its layout can be plugged in
// without changing the API shape.
//
// pixelTransform is the simplest of the four:
//
//   pixelTransform(dst):
//     tmp := IDENTITY_MAT44                    // @0x4f47e6..@0x4f4820
//     if this->agent != null:                  // @0x4f4824..@0x4f482a
//       agent_xform := agent->vtable[0x14 slot] // @0x4f482c reads offset
//                                              // 0xa0 in the LiAgent vtable
//       if agent_xform != &tmp:                // @0x4f483a (self-copy guard)
//         tmp := *agent_xform  (16 double copy)  // @0x4f483f..@0x4f4880
//     spill := PCMatrix44Tmpl<double>::operator*(&this->postTransform, tmp)
//                                              // @0x4f489c (dst=spill, arg=post, arg=tmp)
//     dst   := PCMatrix44Tmpl<double>::operator*(spill,               &this->preTransform)
//                                              // @0x4f48ae
//     return dst
//
// inversePixelTransform is the same but uses agent->
// getInversePixelTransform(0.0) rather than reading the vtable slot,
// AND inlines a full Cramer's-rule 4x4 double inversion of
// `this->preTransform` before multiplying it in as the second matrix.
// The inversion is 200+ lines of `mulsd`/`subsd`/`unpcklpd`/`shufpd`
// implementing the 2x2-cofactor decomposition of a 3x3 top-left block
// with the last column being translation and the last row assumed
// [0,0,0,1] (only 12 of the 16 entries are computed; the last row of
// the local at -0x30/-0x50/-0x70/-0x90 is zeroed at @0x4f4b48..
// @0x4f4b6c). The determinant is computed as an SSE `haddpd`-style
// pair-reduction at @0x4f4a1d..@0x4f4a40 and 1.0/det is broadcast into
// xmm6 before scaling every entry. That inline inversion is decoded
// (every line is present in the disasm) but it's a big body — its
// TS transcription is left as a follow-up now that PCMatrix44Tmpl<double>
// is the actual blocker: once the matrix type lands, the inversion
// belongs on that class as an `inverse()` member, not as an inline of
// this API-data wrapper. destinationInversePixelTransform mirrors
// inversePixelTransform's structure but uses postTransform (not
// preTransform) for the second inversion at @0x4f527a onwards.

/**
 * Frontier: `PCMatrix44Tmpl<double>` — the primary numerical class of
 * OZFxPixelTransformsAPIData; a column-major 4x4 double matrix with
 * `operator*` multiplication. Its 128-byte layout matches the setter
 * copy pattern (16 sequential doubles). NOT YET LANDED in
 * raw-port/src/infra — only PCMatrixErrorException.ts exists.
 * Modelled here as an opaque type with a shape-tag so callers can pass
 * a real object once it lands.
 * @Ozone __ZNK14PCMatrix44TmplIdEmlERKS0_
 */
export interface PCMatrix44TmplDouble {
  readonly __brand: "PCMatrix44Tmpl<double>";
}

/**
 * Frontier: `LiAgent` — a per-frame plug-in agent handle from the
 * Motion/FxPlug SDK. Only three of its members are consumed by this
 * class; none of them are yet transcribed. Modelled as opaque.
 * @Ozone LiAgent (referenced from setAgent @0x4f4614 and from every
 * matrix-producing method's agent-null-guarded read at (%rsi)).
 */
export interface LiAgent {
  readonly __brand: "LiAgent";
}

/**
 * Frontier: `PCMatrix44Tmpl<double>::operator*(PCMatrix44Tmpl<double> const&) const`
 * — the workhorse matrix multiplication. Called from four places in
 * this class:
 *   pixelTransform                    @0x4f489c, @0x4f48ae
 *   inversePixelTransform             @0x4f4b85, @0x4f4dd3
 *   destinationPixelTransform         @0x4f4f2e, @0x4f4f40
 *   destinationInversePixelTransform  @0x4f5212, @0x4f5??? (post-inversion)
 * @Ozone __ZNK14PCMatrix44TmplIdEmlERKS0_
 */
function PCMatrix44Tmpl_double_multiply(
  _dst: PCMatrix44TmplDouble,
  _lhs: PCMatrix44TmplDouble,
  _rhs: PCMatrix44TmplDouble,
): void {
  throw new Error(
    "PCMatrix44Tmpl<double>::operator*(PCMatrix44Tmpl<double> const&) const " +
    "@Ozone __ZNK14PCMatrix44TmplIdEmlERKS0_ not yet transcribed " +
    "(callers: OZFxPixelTransformsAPIData::pixelTransform @0x4f489c/@0x4f48ae, " +
    "::inversePixelTransform @0x4f4b85/@0x4f4dd3, " +
    "::destinationPixelTransform @0x4f4f2e/@0x4f4f40, " +
    "::destinationInversePixelTransform @0x4f5212)"
  );
}

/**
 * Frontier: `LiAgent::getInversePixelTransform(double) const` — called
 * from OZFxPixelTransformsAPIData::inversePixelTransform @0x4f4951
 * with `xmm0 = 0.0`. Returns a PCMatrix44Tmpl<double> by-value into the
 * `%rdi` sret slot at -0x120(%rbp).
 * @Ozone __ZNK7LiAgent24getInversePixelTransformEd
 */
function LiAgent_getInversePixelTransform(
  _dst: PCMatrix44TmplDouble,
  _self: LiAgent,
  _t: number,
): void {
  throw new Error(
    "LiAgent::getInversePixelTransform(double) const " +
    "@Ozone __ZNK7LiAgent24getInversePixelTransformEd not yet transcribed " +
    "(caller: OZFxPixelTransformsAPIData::inversePixelTransform @0x4f4951)"
  );
}

/**
 * Frontier: `LiAgent::getClientPixelTransform() const` — called from
 * OZFxPixelTransformsAPIData::destinationPixelTransform @0x4f4eb3.
 * @Ozone __ZNK7LiAgent23getClientPixelTransformEv
 */
function LiAgent_getClientPixelTransform(
  _dst: PCMatrix44TmplDouble,
  _self: LiAgent,
): void {
  throw new Error(
    "LiAgent::getClientPixelTransform() const " +
    "@Ozone __ZNK7LiAgent23getClientPixelTransformEv not yet transcribed " +
    "(caller: OZFxPixelTransformsAPIData::destinationPixelTransform @0x4f4eb3)"
  );
}

/**
 * Frontier: `LiAgent::getInverseClientPixelTransform() const` — called
 * from OZFxPixelTransformsAPIData::destinationInversePixelTransform
 * @0x4f4fde.
 * @Ozone __ZNK7LiAgent30getInverseClientPixelTransformEv
 */
function LiAgent_getInverseClientPixelTransform(
  _dst: PCMatrix44TmplDouble,
  _self: LiAgent,
): void {
  throw new Error(
    "LiAgent::getInverseClientPixelTransform() const " +
    "@Ozone __ZNK7LiAgent30getInverseClientPixelTransformEv not yet transcribed " +
    "(caller: OZFxPixelTransformsAPIData::destinationInversePixelTransform @0x4f4fde)"
  );
}

/**
 * `OZFxPixelTransformsAPIData` — the pixel-transform-stack side-object
 * for the Ozone Fx-API thread-specific slot. Owns a LiAgent pointer
 * plus two 4x4 double matrices (pre- and post-multiply factors) that
 * bracket the agent's own transform when computing the effective
 * pixel<->pixel mapping.
 *
 * @Ozone class OZFxPixelTransformsAPIData (module `Ozone`).
 */
export class OZFxPixelTransformsAPIData {
  /**
   * `agent` @+0x00. Weak pointer to the current per-frame plug-in
   * agent. Set exclusively by `setAgent` (@0x4f4614 `movq %rsi,(%rdi)`);
   * read (with a null check) at the start of every matrix-producing
   * method as `(%rsi)` (e.g. @0x4f4824, @0x4f493c, @0x4f4ea4, @0x4f4fcc).
   */
  agent: LiAgent | null = null;

  /**
   * `preTransform` @+0x08..+0x88. A 128-byte
   * `PCMatrix44Tmpl<double>` embedded in-place (not a pointer). Set by
   * `setPreTransform`; consumed as the second `operator*` argument by
   * `pixelTransform` @0x4f48ae and (post-inversion) by
   * `inversePixelTransform` @0x4f4b85. Modelled as an opaque
   * PCMatrix44TmplDouble reference until the real class lands.
   */
  preTransform: PCMatrix44TmplDouble | null = null;

  /**
   * `postTransform` @+0x88..+0x108. Second embedded
   * `PCMatrix44Tmpl<double>`; set by `setPostTransform`; consumed as
   * the first `operator*` argument by `pixelTransform` @0x4f489c and
   * `destinationPixelTransform` @0x4f4f2e, and (post-inversion) by
   * `destinationInversePixelTransform` @0x4f5???.
   */
  postTransform: PCMatrix44TmplDouble | null = null;

  /**
   * OZFxPixelTransformsAPIData::setAgent(LiAgent const*)
   * @Ozone __ZN26OZFxPixelTransformsAPIData8setAgentEPK7LiAgent @0x4f4610..0x4f4618
   *
   *   0x4f4610 pushq %rbp / movq %rsp,%rbp
   *   0x4f4614 movq  %rsi, (%rdi)               ; this->agent = arg1
   *   0x4f4617 popq %rbp / retq
   *
   * Trivial single-word store. No allocation, no ownership transfer.
   */
  setAgent(agent: LiAgent | null): void {
    // @0x4f4614 movq %rsi,(%rdi)
    this.agent = agent;
  }

  /**
   * OZFxPixelTransformsAPIData::setPreTransform(PCMatrix44Tmpl<double> const*)
   * @Ozone __ZN26OZFxPixelTransformsAPIData15setPreTransformEPK14PCMatrix44TmplIdE
   * @0x4f4620..0x4f46d4
   *
   * Copies 16 consecutive doubles (128 bytes) from `*source` into
   * `this->preTransform` at +0x08. The disasm uses 16 `movsd (%rsi+k),%xmm0;
   * movsd %xmm0,%rdi+8+k` pairs; there is a self-copy guard at
   * @0x4f4624..@0x4f462b: `leaq 0x8(%rdi),%rax; cmpq %rax,%rsi;
   * je 0x4f46d3` — if `source == &this->preTransform`, skip the copies.
   *
   * We model the guard by comparing the two references. The actual
   * 128-byte copy is deferred to the PCMatrix44Tmpl<double>
   * implementation once it lands: we just replace the reference here.
   * (Because the C++ code copies BY VALUE, downstream mutation of
   * `*source` must not be observable on `this->preTransform`; the
   * eventual PCMatrix44Tmpl<double>.assign() will do a real 16-double
   * deep copy. We throw here to surface the semantic gap rather than
   * store the reference and silently share state.)
   */
  setPreTransform(source: PCMatrix44TmplDouble | null): void {
    // @0x4f4624..0x4f462b: self-copy guard `&this->preTransform == source`.
    if (source === this.preTransform && source !== null) {
      // @0x4f462b `je 0x4f46d3` — bail out (no work).
      return;
    }
    if (source === null) {
      throw new Error(
        "OZFxPixelTransformsAPIData::setPreTransform: source is null " +
        "(the C++ signature takes `PCMatrix44Tmpl<double> const*`; passing " +
        "null would dereference NULL at @Ozone 0x4f4631 `movsd (%rsi),%xmm0`)"
      );
    }
    // @0x4f4631..0x4f46cb — 16 consecutive `movsd`/`movsd` pairs writing
    // the 128 bytes at (%rdi+0x08..+0x88). Faithful deep-copy semantics
    // require the real PCMatrix44Tmpl<double> layout, which is not yet
    // landed; surface the gap.
    throw new Error(
      "OZFxPixelTransformsAPIData::setPreTransform @Ozone 0x4f4620: " +
      "16-double deep-copy body not yet transcribed — depends on landed " +
      "PCMatrix44Tmpl<double> layout in raw-port/src/infra/ (only " +
      "PCMatrixErrorException.ts exists today)."
    );
  }

  /**
   * OZFxPixelTransformsAPIData::setPostTransform(PCMatrix44Tmpl<double> const*)
   * @Ozone __ZN26OZFxPixelTransformsAPIData16setPostTransformEPK14PCMatrix44TmplIdE
   * @0x4f46e0..0x4f47c4
   *
   * Symmetric to setPreTransform but writes to +0x88 instead of +0x08.
   * Self-copy guard at @0x4f46e4..@0x4f46ee: `leaq 0x88(%rdi),%rax;
   * cmpq %rax,%rsi; je 0x4f47c3`.
   */
  setPostTransform(source: PCMatrix44TmplDouble | null): void {
    // @0x4f46e4..0x4f46ee self-copy guard.
    if (source === this.postTransform && source !== null) {
      // @0x4f46ee `je 0x4f47c3`.
      return;
    }
    if (source === null) {
      throw new Error(
        "OZFxPixelTransformsAPIData::setPostTransform: source is null " +
        "(dereferences NULL at @Ozone 0x4f46f4 `movsd (%rsi),%xmm0`)"
      );
    }
    // @0x4f46f4..0x4f47bb — 16-double deep copy into (%rdi+0x88..+0x108).
    throw new Error(
      "OZFxPixelTransformsAPIData::setPostTransform @Ozone 0x4f46e0: " +
      "16-double deep-copy body not yet transcribed — same PCMatrix44Tmpl<double> " +
      "layout dependency as setPreTransform."
    );
  }

  /**
   * OZFxPixelTransformsAPIData::pixelTransform() -> PCMatrix44Tmpl<double>
   * @Ozone __ZN26OZFxPixelTransformsAPIData14pixelTransformEv @0x4f47d0..0x4f48c3
   *
   * Result semantics:
   *
   *   let tmp = IDENTITY_MAT44
   *   if this->agent != null:
   *     tmp = *(agent->vtable slot ~0xa0)   // per-frame agent's own transform
   *   spill = this->postTransform * tmp
   *   return spill * this->preTransform
   *
   * Disassembly outline (all lines present in /tmp/Ozone_tV.txt):
   *   0x4f47e6..0x4f4820  build IDENTITY into -0xa0..-0x28(%rbp) using
   *                       four `movabsq $0x3ff0000000000000,%rax; movq %rax,...`
   *                       for the diagonal + 16-byte zero-fills for the
   *                       off-diagonals.
   *   0x4f4824..0x4f484d  agent-null-guarded read: `movq (%rsi),%rax`
   *                       (agent), then `movq 0xa0(%rax),%rax` (agent's
   *                       transform-getter or transform-ptr), then a
   *                       self-copy guard `cmpq %rcx,%rax` followed by an
   *                       8-vec 16-double copy into the local matrix at
   *                       -0xa0..-0x30(%rbp).
   *   0x4f4884..0x4f489c  set up the FIRST multiply:
   *                         %rdi = -0x120(%rbp)             (spill)
   *                         %rsi = &this->postTransform
   *                         %rdx = tmp     (the local at -0xa0(%rbp))
   *                       call PCMatrix44Tmpl<double>::operator*(*rdi,rsi,rdx)
   *                       (SysV `this` in rdi is the sret; the C++
   *                       operator* has signature `sret & (this, arg)`,
   *                       so `this=rsi=post`, `arg=rdx=tmp`).
   *   0x4f48a1..0x4f48ae  set up the SECOND multiply:
   *                         %rdi = %rbx    (the caller's sret slot)
   *                         %rsi = -0x120(%rbp) = spill
   *                         %rdx = &this->preTransform  (@%r14+0x8)
   *   0x4f48b3           `movq %rbx,%rax`  — the SysV large-return
   *                       convention returns %rax = the sret pointer.
   *
   * BODY REQUIRES the PCMatrix44Tmpl<double> class to land; the local
   * identity build is trivial but useless without a real matrix type.
   * Throw-stub, addresses cited.
   */
  pixelTransform(out: PCMatrix44TmplDouble | null): PCMatrix44TmplDouble {
    // Argument-only null check; the C++ code does not check `out` — it
    // will simply write to the caller's sret slot regardless. We refuse
    // null here because the eventual PCMatrix44Tmpl<double>.assign()
    // needs a real target.
    if (out === null) {
      throw new Error(
        "OZFxPixelTransformsAPIData::pixelTransform: out is null " +
        "(caller must pre-allocate the PCMatrix44Tmpl<double> sret slot)"
      );
    }
    // @0x4f47e6..0x4f4820: build IDENTITY into a local stack matrix.
    //   (Cannot be modelled bit-exactly until PCMatrix44Tmpl<double> lands.)
    // @0x4f4824..0x4f484d: agent-null-guarded read of the agent's own
    //   per-frame pixel transform (via `%rax = agent->[0xa0]`).
    // @0x4f489c: spill = post * tmp.
    // @0x4f48ae: out   = spill * pre.
    // @0x4f48b3: return out.
    PCMatrix44Tmpl_double_multiply(out, out, out); // frontier — see stub
    return out;
  }

  /**
   * OZFxPixelTransformsAPIData::inversePixelTransform() -> PCMatrix44Tmpl<double>
   * @Ozone __ZN26OZFxPixelTransformsAPIData21inversePixelTransformEv @0x4f48d0..0x4f4e46
   *
   * Result semantics:
   *
   *   let tmp = IDENTITY_MAT44
   *   if this->agent != null:
   *     tmp = agent->getInversePixelTransform(0.0)
   *   let preInv = inverse(this->preTransform)     // inline Cramer's rule
   *   spill = preInv * this->postTransform         // wait — actually the order
   *                                                 // is preInv * (already inv-stored)
   *   return spill * out    (chained through the caller's sret slot)
   *
   * Actually, from the disasm's callee argument setup at @0x4f4b82:
   *   %rdi = -0x120(%rbp)         (spill sret)
   *   %rsi = &preInv (local -0xa0(%rbp))
   *   %rdx = %rbx    (the caller's original sret slot, which by now
   *                   holds `agent->getInversePixelTransform(0.0)` after
   *                   the copy-out at @0x4f495b..@0x4f49b2)
   * so the C++ operator*(a,b) semantic is `spill = preInv * (agent_inv_or_identity)`.
   *
   * Then a SECOND inversion is performed on `this->postTransform`
   * starting @0x4f4bed..@0x4f4d94 (mirrors the first inversion but
   * reading from +0x88..+0x108 = postTransform), and the final multiply
   * at @0x4f4dd3 is `out = spill * postInv`.
   *
   * The inline 4x4 inversion @0x4f49b2..@0x4f4b5a uses the standard
   * "adjugate divided by determinant" formula with 2x2 subdeterminants
   * computed via `unpcklpd`/`mulpd`/`subpd` pairs. All 12 non-trivial
   * cofactors are decoded in the disasm; the last row is zeroed and
   * the (3,3) entry is set to 1.0 elsewhere. Determinant computed at
   * @0x4f4a1d..@0x4f4a40 as an SSE `haddpd`-shaped 4-term sum, then
   * `1.0/det` is broadcast at @0x4f4aed..@0x4f4afc and multiplies every
   * cofactor.
   *
   * Full transcription is deferred to when PCMatrix44Tmpl<double>::inverse()
   * becomes the canonical home for this math on the matrix class itself
   * (which is where FCP will store it once it lands).
   */
  inversePixelTransform(out: PCMatrix44TmplDouble | null): PCMatrix44TmplDouble {
    if (out === null) {
      throw new Error(
        "OZFxPixelTransformsAPIData::inversePixelTransform: out is null"
      );
    }
    // @0x4f48e6..0x4f4938: build IDENTITY into local -0x50/-0x28 etc.
    // @0x4f493c..0x4f49b2: agent-null-guarded call to
    //   `LiAgent::getInversePixelTransform(0.0)` @0x4f4951, result copied
    //   into %rbx (the caller's sret) at @0x4f495b..@0x4f49b2.
    if (this.agent !== null) {
      LiAgent_getInversePixelTransform(out, this.agent, 0.0);
    }
    // @0x4f49b2..0x4f4b5a: inline 4x4 double inversion of `this->preTransform`
    //   into a local at -0xa0(%rbp) (variable name `preInv`). The
    //   determinant-zero guard at @0x4f4a4a..@0x4f4a4f is
    //   `ucomisd %xmm12,%xmm9; jne 0x4f4a57; jnp 0x4f4bed` — i.e.
    //   `if (det != 0 && !NaN) invert else skip to the postTransform stage`.
    // @0x4f4b71..0x4f4b85: FIRST multiply `spill = preInv * out`
    //   (out currently holds the agent's inverse or identity).
    // @0x4f4b89..0x4f4be3: 8-vec copy from -0x120(%rbp) sret into
    //   the caller's out slot at %rbx.
    // @0x4f4bed..0x4f4d94: inline 4x4 inversion of `this->postTransform`
    //   into -0xa0(%rbp) (variable `postInv`).
    // @0x4f4dbf..0x4f4dd3: SECOND multiply `out = spill * postInv`.
    // @0x4f4dd8..0x4f4e31: copy-out.
    PCMatrix44Tmpl_double_multiply(out, out, out); // frontier
    return out;
  }

  /**
   * OZFxPixelTransformsAPIData::destinationPixelTransform()
   *   -> PCMatrix44Tmpl<double>
   * @Ozone __ZN26OZFxPixelTransformsAPIData25destinationPixelTransformEv
   * @0x4f4e50..0x4f4f55
   *
   * Same shape as pixelTransform, but calls
   * `LiAgent::getClientPixelTransform()` (@0x4f4eb3, no arg) instead of
   * dereferencing the agent's vtable slot 0xa0 for a transform-getter.
   * The rest of the sequence is identical:
   *
   *   let tmp = IDENTITY
   *   if agent != null:
   *     tmp = agent->getClientPixelTransform()
   *   spill = this->postTransform * tmp
   *   return spill * this->preTransform
   */
  destinationPixelTransform(
    out: PCMatrix44TmplDouble | null,
  ): PCMatrix44TmplDouble {
    if (out === null) {
      throw new Error(
        "OZFxPixelTransformsAPIData::destinationPixelTransform: out is null"
      );
    }
    // @0x4f4e66..0x4f4ea0 build IDENTITY.
    // @0x4f4ea4..0x4f4f12 agent-null-guarded call to
    //   LiAgent::getClientPixelTransform() @0x4f4eb3, copy into
    //   -0xa0(%rbp) (the tmp slot).
    if (this.agent !== null) {
      LiAgent_getClientPixelTransform(out, this.agent);
    }
    // @0x4f4f2e spill = post * tmp.
    // @0x4f4f40 out   = spill * pre.
    PCMatrix44Tmpl_double_multiply(out, out, out); // frontier
    return out;
  }

  /**
   * OZFxPixelTransformsAPIData::destinationInversePixelTransform()
   *   -> PCMatrix44Tmpl<double>
   * @Ozone __ZN26OZFxPixelTransformsAPIData32destinationInversePixelTransformEv
   * @0x4f4f60..0x4f5??? (mirror of inversePixelTransform)
   *
   * Same shape as inversePixelTransform, but calls
   * `LiAgent::getInverseClientPixelTransform()` (@0x4f4fde) rather than
   * `getInversePixelTransform(0.0)`; identical inline 4x4 inversion of
   * `this->preTransform` at @0x4f503f..@0x4f51d5 and of
   * `this->postTransform` at @0x4f527a..@0x4f540?; identical two
   * `PCMatrix44Tmpl<double>::operator*` calls at @0x4f5212 and
   * @0x4f5???.
   */
  destinationInversePixelTransform(
    out: PCMatrix44TmplDouble | null,
  ): PCMatrix44TmplDouble {
    if (out === null) {
      throw new Error(
        "OZFxPixelTransformsAPIData::destinationInversePixelTransform: out is null"
      );
    }
    // @0x4f4f76..0x4f4fc8 build IDENTITY.
    // @0x4f4fcc..0x4f503f agent-null-guarded call to
    //   LiAgent::getInverseClientPixelTransform() @0x4f4fde, copy into
    //   caller's sret.
    if (this.agent !== null) {
      LiAgent_getInverseClientPixelTransform(out, this.agent);
    }
    // @0x4f503f..0x4f51d5 inline preTransform inversion.
    // @0x4f5212 spill = preInv * out.
    // @0x4f527a..0x4f540? inline postTransform inversion.
    // @0x4f5??? out = spill * postInv.
    PCMatrix44Tmpl_double_multiply(out, out, out); // frontier
    return out;
  }
}
