// OZChannelPosition — 2D animated position channel with a CACHED arc-length parametrization
// of the (x(t), y(t)) polyline sampled from the two child animation curves. Extends OZChannel2D
// (which itself extends OZCompoundChannel/OZChannelFolder). Faithful port from ProChannel.framework.
//
// Class size 0x2c0 (allocated in clone() @ProChannel 0x73f6c: `movl $0x2c0, %edi`).
//
// Struct layout recovered from ctor + dtor + willBeModified + getLength (see re/disasm/
// ProChannel.OZChannelPosition.*):
//   +0x000..+0x087  OZCompoundChannel / OZChannel2D base subobject (vtable @+0, DR-vtable @+0x10)
//   +0x088..+0x11f  X sub-channel (OZChannel, 152 bytes) — read via OZChannel::getValueAsDouble
//                   / OZChannel::getCurveValue (see setPosition @0x741a8, offsetPosition @0x74238,
//                   getPosition @0x808e6)
//   +0x120..+0x1b7  Y sub-channel (OZChannel, 152 bytes) — same pattern (@0x741c0 / @0x7425f / @0x80908)
//   +0x1b8          bool  — flag copied wholesale in copy() @0x740a1 and in clone() @0x74026;
//                            set to true by ctors (@0x73740, @0x73978, @0x73b7d).
//                            Meaning not yet decoded (likely "path-cache-eligible" — willBeModified
//                            leaves it alone).
//   +0x1c0..+0x23f  cached 4x4 double matrix M (16 doubles). Reset to IDENTITY in ctors / copy /
//                   willBeModified (@0x742fc..0x74355: writes 1.0 at +0x1c0/+0x1e8/+0x210/+0x238
//                   which are M[0][0],M[1][1],M[2][2],M[3][3], and zeroes the 12 off-diagonal
//                   slots). getLength @0x7460e..0x74651 compares this cached matrix against the
//                   caller-supplied PCMatrix44<double>* element-wise with |a-b|>1e-7 (const
//                   @0xb03b0 = 1e-7) using an SSE fabs mask (const @0xb0390 = 0x7fffffffffffffff
//                   ×2).
//   +0x240..+0x257  std::vector<double> #0 — arc-length cache buffer (24 bytes: begin/end/end_cap)
//   +0x258..+0x26f  std::vector<double> #1 — arc-length prefix sums (getLength returns
//                   *(vec1.end - 1) — @0x746b0/0x746b9/0x746c9: `movq 0x260(r14),%rax; movsd
//                   -0x8(%rax), %xmm0`)
//   +0x270..+0x287  std::vector<double> #2
//   +0x288..+0x29f  std::vector<double> #3
//   +0x2a0..+0x2b7  std::vector<double> #4
//                   (all five vectors are `clear()`-ed in willBeModified: end<-begin @0x742b6..)
//   +0x2b8          uint32 cacheValid flag (0 = "cache is stale, must recompute";
//                   getLength @0x745fc branches on cmpl $0x0; ctors/willBeModified/copy set to 0).
//   +0x2bc..+0x2bf  PCSpinLock guarding the cache (@0x742b1 lock, @0x74363 unlock in willBeModified;
//                   also in getLength/dtor/copy — see re/disasm/*.willBeModified.s).
//
// vtable @ProChannel 0xdd018 (from `python3 army/tools/resolve.py ProChannel vtable
// OZChannelPosition`): slot 0xe8 = copy (used by operator= @0x73f51), slot 0xf8 = clone,
// slot 0x58 = getObjCWrapperName, slot 0 / 0x8 = dtors. All other slots inherit from
// OZChannelFolder / OZCompoundChannel / OZChannelBase / OZFactoryBase.
//
// The BULK of this class — getCachedVectors (791-line arc-length + tangent computation),
// getPositionOnPath (749-line reparametrization along the cached polyline), getNormals,
// getPositionsReparametrizedWithRange, generatePathFromShape — is not yet transcribed and
// throws citing its @0xADDR. The trivial accessors, ctors, dtor, copy/clone, setPosition,
// offsetPosition, willBeModified are faithfully transcribed here.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { CMTime } from "../infra/CMTime.js";

/** 4x4 double matrix, row-major. Mirrors PCMatrix44Tmpl<double> layout used by getLength /
 *  getCachedVectors / getPositionOnPath. Represented as a length-16 Float64 array. */
export type Mat44d = readonly number[];

/** Interface of a scalar OZChannel — the two children of this position channel. Full class
 *  is transcribed elsewhere (see src/channels/OZChannel.ts). We only need the read paths this
 *  class actually invokes. */
export interface IOZScalarChannel {
  /** OZChannel::getValueAsDouble(CMTime const&, double) const — used by setPosition @0x741a8 /
   *  @0x741c0 and by getPosition @0x808e6 / @0x80908. */
  getValueAsDouble(t: CMTime, fallback: number): number;
  /** OZChannel::getCurveValue(CMTime const&, bool) — used by offsetPosition @0x74238 / @0x7425f
   *  after mapping the global time to local via OZChannelBase::globalToLocalTime. */
  getCurveValue(localT: CMTime, wrap: boolean): number;
}

/** Facade for OZChannel2D::setValue(CMTime, double, double, bool) — the write path invoked by
 *  offsetPosition @0x74283. Full transcription lives with the OZChannel2D port. */
export interface IOZChannel2DHost {
  setValue2D(t: CMTime, x: number, y: number, keyframed: boolean): void;
  /** OZChannelBase::globalToLocalTime(CMTime const&) — @0x7422b/@0x74252. */
  globalToLocalTime(x: IOZScalarChannel, globalT: CMTime): CMTime;
  /** OZCompoundChannel::willBeModified(unsigned int) — the base tail-jump at @0x74377. */
  compoundWillBeModified(flags: number): void;
  /** OZChannel2D::copy(OZChannelBase const*, bool) — the base tail-jump at @0x74179. */
  channel2DCopy(rhs: unknown, keyframed: boolean): void;
}

/** The mutable spinlock-guarded cache lifted out of the C++ struct at +0x1c0..+0x2bf. */
export interface OZChannelPositionCache {
  /** 4x4 matrix (row-major, 16 doubles) — the matrix that WAS used to compute the cached
   *  polyline. getLength @0x74625..0x74651 rejects the cache if this differs from the caller's
   *  matrix by more than 1e-7 in any component (`ucomisd 1e-7, |a-b|; jbe recompute`). Reset to
   *  identity in ctors/willBeModified/copy. */
  matrix: number[]; // length 16
  /** std::vector<double>[5] — arc-length polyline buffers rebuilt by getCachedVectors. Vector 1
   *  (index 1) is the arc-length prefix-sum array whose LAST element getLength returns
   *  (@0x746c9: `movsd -0x8(%rax), %xmm0`). */
  vecs: number[][]; // 5 entries, each a JS array (models std::vector<double>)
  /** 0 = cache invalid (must recompute); non-zero = valid. Read @0x745fc; set 0 by
   *  ctors / willBeModified / copy / dtor. */
  valid: number;
}

/** Build the reset cache — identity matrix, 5 empty vectors, valid=0. Mirrors the writes at
 *  @0x742fc..0x74355 (willBeModified) / @0x740f5..0x7414e (copy) / @0x73fa5..0x73ff4 (clone) /
 *  the ctor bodies. */
function newResetCache(): OZChannelPositionCache {
  const m = new Array<number>(16).fill(0);
  m[0] = 1.0;   // +0x1c0 = M[0][0]
  m[5] = 1.0;   // +0x1e8 = M[1][1]
  m[10] = 1.0;  // +0x210 = M[2][2]
  m[15] = 1.0;  // +0x238 = M[3][3]
  return { matrix: m, vecs: [[], [], [], [], []], valid: 0 };
}

/** OZChannelPosition — see file header. */
export class OZChannelPosition {
  /** X sub-channel at C++ offset +0x88. Populated by the ctor via
   *  OZChannel::replaceInfo(OZChannelPosition_valueInfo::getInstance()) @0x73727 (path
   *  taken when the caller passed a null info arg — @0x73703 `cmpq $0x0, 0x18(%rbp)`). */
  x!: IOZScalarChannel;
  /** Y sub-channel at C++ offset +0x120 (@0x7373b `replaceInfo` on +0x120). */
  y!: IOZScalarChannel;
  /** Flag at C++ offset +0x1b8. Set to true in ctors (@0x73740 `movb $0x1, 0x1b8(%rbx)`); copied
   *  verbatim in copy() @0x740a1 and in clone() @0x74026. Meaning: not yet decoded. */
  flag1b8 = true;
  /** Spinlock-guarded cache (+0x1c0..+0x2b8). See {@link OZChannelPositionCache}. */
  cache: OZChannelPositionCache = newResetCache();

  /** Handle to the OZChannel2D / OZCompoundChannel base — used by methods that end in a
   *  `jmp __ZN..` tail-call to the parent class (offsetPosition, willBeModified, copy). */
  private readonly host: IOZChannel2DHost;

  /**
   * Faithful transcription of the ctor family — collapsed here into one TypeScript constructor
   * because in ASM they all differ only in which OZChannel2D ctor they delegate to and the trivia
   * of whether they pre-set an (x,y) default:
   *   - @0x735d6 / @0x737f0  OZChannelPosition(PCString, OZChannelFolder*, uint,uint,uint, Impl, Info)
   *   - @0x737fa / @0x73a28  OZChannelPosition(double,double, PCString, OZChannelFolder*, ..., Impl, Info)
   *   - @0x73a32 / @0x73c2e  OZChannelPosition(OZFactory*, PCString, uint,uint, Impl, Info)
   *   - @0x73cfc / @0x73c38  OZChannelPosition(OZChannelPosition const&, OZChannelFolder*)   (copy-ctor)
   * Each first delegates to the matching OZChannel2D ctor (transcribed with the OZChannel2D port),
   * then unconditionally OVERRIDES the two vtable slots (`(this)=0x??? ; (this+0x10)=0x???`) —
   * we honor this in TS by using `this` being an OZChannelPosition-typed object (dynamic dispatch
   * to the overrides is what class inheritance already gives us).
   *
   * Body common to all six ctors (excluding delegation):
   *   1. Set +0x1c0..+0x238 diagonal to 1.0 (@0x7366a/@0x738a2/@0x73aa9). See newResetCache.
   *   2. Zero +0x1c8..+0x228 non-diagonal matrix slots (@0x73693..0x736b6 etc).
   *   3. Zero cache-valid flag +0x2bc (@0x736bd/@0x738f5/@0x73afc: `movl $0x0, 0x2bc(%rbx)`).
   *   4. Zero the five std::vector<double> triples at +0x240..+0x2b0 (@0x736c7..0x736f8 etc).
   *   5. If the caller passed NO custom OZChannelInfo (arg checked @0x73703/@0x7393b/@0x73b42
   *      via `cmpq $0x0, 0x18(%rbp)` / `testq %r14, %r14`), install
   *      OZChannelPosition_valueInfo::getInstance() into BOTH X (+0x88) and Y (+0x120) via
   *      OZChannel::replaceInfo (@0x73727 / @0x7373b).
   *   6. Set +0x1b8 = 1 (@0x73740).
   *   7. Set +0x2b8 = 0 (@0x73747).
   *
   * Because sibling channel classes (OZChannel / OZChannel2D / OZFactory / OZChannelInfo /
   * OZChannelImpl) are not yet ported, the ctor is a caller-provided-dependency thin wrapper:
   * the caller passes in the already-constructed X/Y sub-channels and the host adapter for the
   * parent-class tail-jumps.
   */
  constructor(deps: { x: IOZScalarChannel; y: IOZScalarChannel; host: IOZChannel2DHost }) {
    this.x = deps.x;
    this.y = deps.y;
    this.host = deps.host;
    // 1-4: newResetCache() already provides identity M + 5 empty vecs + valid=0.
    this.cache = newResetCache();
    // 6-7: mirrors @0x73740 / @0x73747 unconditionally.
    this.flag1b8 = true;
    // (Step 5 is the OZChannelInfo install; that lives inside the sub-channel construction the
    // caller already performed. We do not synthesize a fake ChannelInfo here.)
  }

  /**
   * OZChannelPosition::~OZChannelPosition() @ProChannel 0x73dc0 (D2Ev — base destructor).
   * D0Ev @0x73f00 calls D2Ev then operator delete (@0xace04). D1Ev @0x73ee8 is Itanium-ABI-
   * aliased to D2Ev (no vbase). Faithful port:
   *   1. Overwrite the two vptrs (@0x73dca/@0x73dd4) — implicit in JS class semantics.
   *   2. Lock the spinlock (@0x73de9), reset matrix diagonals to 1.0 and zero off-diagonals
   *      (@0x73dee..0x73e3a), zero the cache-valid flag +0x2b8 (@0x73e41), unlock (@0x73e4e),
   *      destruct the PCSpinLock (@0x73e56).
   *   3. Free each of the five std::vector<double> data buffers via `operator delete` (@0x73e5b..
   *      0x73ece: five `test+jz+store-end+delete` blocks).
   *   4. Tail-jump to OZChannel2D::~OZChannel2D() (@0x73eda).
   * In TypeScript with GC we do not free explicitly; we reset the cache to match the C++ visible
   * end-state (empty vectors, identity matrix, valid=0).
   */
  destroy(): void {
    this.cache = newResetCache();
    // OZChannel2D::~OZChannel2D() would be invoked by C++; JS relies on GC.
  }

  /**
   * OZChannelPosition::getObjCWrapperName() @ProChannel 0x76b46 — the disassembly returns a
   * literal "bad cfstring ref" (@0x76b4a: `leaq 0x6eddf(%rip), %rax` -> the Objective-C
   * CFString ref slot that mig did not resolve for our thin x86_64 slice). In practice this
   * name is only used by ObjC bridging and never referenced by the pure-math paths the port
   * cares about. We return the literal string so any consumer that DOES read it sees the exact
   * bytes the disassembly points at.
   */
  getObjCWrapperName(): string {
    return "bad cfstring ref"; // @0x76b4a (see re/disasm/ProChannel.OZChannelPosition.getObjCWrapperName.s)
  }

  /**
   * OZChannelPosition::getPosition(CMTime const&, double*, double*, double) const
   * @ProChannel 0x808b2. Faithful transcription:
   *   1. If outX (rdx) non-null (@0x808cd `testq %rdx, %rdx; je 0x808f6`): store
   *      OZChannel::getValueAsDouble(X @+0x88, t, fallback) at *outX (@0x808e6/@0x808eb).
   *   2. If outY (rcx) non-null (@0x808f9 `testq %rbx, %rbx; je 0x80911`): store
   *      OZChannel::getValueAsDouble(Y @+0x120, t, fallback) at *outY (@0x80908/@0x8090d).
   * The `fallback` arg (xmm0, `double`) is saved to -0x28(%rbp) @0x808dc and re-loaded before
   * each call — i.e. both calls get the SAME fallback.
   */
  getPosition(t: CMTime, wantX: boolean, wantY: boolean, fallback: number): { x?: number; y?: number } {
    const out: { x?: number; y?: number } = {};
    if (wantX) {
      out.x = this.x.getValueAsDouble(t, fallback); // @0x808e6
    }
    if (wantY) {
      out.y = this.y.getValueAsDouble(t, fallback); // @0x80908
    }
    return out;
  }

  /**
   * OZChannelPosition::setPosition(CMTime const&, double x, double y, bool keyframed)
   * @ProChannel 0x7417e. Faithful transcription:
   *   1. Read current X via OZChannel::getValueAsDouble(X @+0x88, t, 0.0) (@0x741a8).
   *   2. Read current Y via OZChannel::getValueAsDouble(Y @+0x120, t, 0.0) (@0x741c0).
   *      (Both calls pass xmm0 = 0.0 as the fallback — `xorpd %xmm0,%xmm0` @0x741a4/@0x741b9.)
   *   3. Compute dx = x - curX (@0x741c5..0x741ca `movsd -0x28; subsd -0x20`).
   *   4. Compute dy = y - curY (@0x741cf..0x741d4 `movsd -0x30; subsd %xmm0`).
   *   5. Tail-jump to OZChannelPosition::offsetPosition(t, dx, dy, keyframed) (@0x741ee).
   */
  setPosition(t: CMTime, x: number, y: number, keyframed: boolean): void {
    const curX = this.x.getValueAsDouble(t, 0.0); // @0x741a8
    const curY = this.y.getValueAsDouble(t, 0.0); // @0x741c0
    const dx = x - curX;                            // @0x741ca
    const dy = y - curY;                            // @0x741d4
    this.offsetPosition(t, dx, dy, keyframed);      // @0x741ee jmp
  }

  /**
   * OZChannelPosition::offsetPosition(CMTime const&, double dx, double dy, bool keyframed)
   * @ProChannel 0x741f4. Faithful transcription:
   *   1. Map global t to local for X via OZChannelBase::globalToLocalTime(X, t) (@0x7422b) — the
   *      three-word CMTime result is written to a stack slot at -0x58(%rbp), addressed by r13.
   *   2. Read curX via OZChannel::getCurveValue(X, localT, wrap=false) (@0x74238) — note this is
   *      getCurveValue (unclamped) NOT getValueAsDouble.
   *   3. Same globalToLocalTime for Y (@0x74252) and read curY via getCurveValue(Y, localT, false)
   *      (@0x7425f).
   *   4. Compute newX = curX + dx (@0x74269 `addsd -0x38, %xmm2`).
   *   5. Compute newY = curY + dy (@0x74273 `addsd %xmm0, %xmm1`).
   *   6. Tail-call OZChannel2D::setValue(t, newX, newY, keyframed) (@0x74283).
   */
  offsetPosition(t: CMTime, dx: number, dy: number, keyframed: boolean): void {
    const localTX = this.host.globalToLocalTime(this.x, t);      // @0x7422b
    const curX = this.x.getCurveValue(localTX, false);           // @0x74238
    const localTY = this.host.globalToLocalTime(this.y, t);      // @0x74252
    const curY = this.y.getCurveValue(localTY, false);           // @0x7425f
    const newX = curX + dx;                                       // @0x74269
    const newY = curY + dy;                                       // @0x74273
    this.host.setValue2D(t, newX, newY, keyframed);              // @0x74283
  }

  /**
   * OZChannelPosition::willBeModified(unsigned int flags) @ProChannel 0x74298. Faithful:
   *   1. Lock the cache spinlock (@0x742b1 `PCSpinLock::lock`).
   *   2. clear() each of the 5 std::vector<double>'s at +0x240/+0x258/+0x270/+0x288/+0x2a0 by
   *      writing end<-begin (@0x742b6..0x742ee — SEE the file header layout notes; capacity is
   *      not freed here, matching libc++ std::vector::clear which just sets end=begin).
   *   3. Reset the 4x4 matrix at +0x1c0..+0x238 to identity: diagonals to 1.0, off-diagonals to
   *      0.0 (@0x742fc..0x74355).
   *   4. Zero the cache-valid flag at +0x2b8 (@0x74355 `movl $0x0, 0x2b8`).
   *   5. Unlock (@0x74363).
   *   6. Tail-jump to OZCompoundChannel::willBeModified(flags) (@0x74377).
   */
  willBeModified(flags: number): void {
    // spinlock lock @0x742b1 — TS is single-threaded so a lock is a no-op modelled here.
    this.cache = newResetCache(); // steps 2-4
    // spinlock unlock @0x74363
    this.host.compoundWillBeModified(flags); // @0x74377
  }

  /**
   * OZChannelPosition::copy(OZChannelBase const* rhs, bool keyframed) @ProChannel 0x7404e.
   * Faithful transcription:
   *   1. If rhs is null (@0x74068 `testq %rsi, %rsi; je 0x74161`), skip straight to step 5.
   *   2. Dynamic-cast rhs to OZChannelPosition (@0x74081 `___dynamic_cast(rhs, &ti_Base,
   *      &ti_OZChannelPosition, 0)`). If the cast fails (@0x74089 `testq %rax,%rax; je 0x74161`),
   *      skip to step 5.
   *   3. Under spinlock (@0x7409c lock / @0x7415c unlock):
   *      a. Copy the +0x1b8 flag from rhs into this (@0x740a1..0x740a8).
   *      b. clear() the 5 vectors and reset the cached matrix to identity + zero cache-valid flag
   *         (SAME body as willBeModified — see @0x740af..0x7414e).
   *   4. Fall through to step 5.
   *   5. Tail-jump to OZChannel2D::copy(rhs, keyframed) (@0x74179).
   */
  copy(rhs: OZChannelPosition | null | undefined, keyframed: boolean): void {
    if (rhs != null) {
      // spinlock lock @0x7409c
      this.flag1b8 = rhs.flag1b8;  // @0x740a1..0x740a8
      this.cache = newResetCache(); // @0x740af..0x7414e
      // spinlock unlock @0x7415c
    }
    // Tail-jump @0x74179: OZChannel2D::copy handles the actual channel-data deep copy.
    this.host.channel2DCopy(rhs, keyframed);
  }

  /**
   * OZChannelPosition::clone() const @ProChannel 0x73f62. Faithful transcription:
   *   1. Allocate 0x2c0 bytes via `operator new` (@0x73f6c-@0x73f71: `movl $0x2c0,%edi;
   *      callq __Znwm`).
   *   2. Invoke OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder* (nullptr))
   *      copy-ctor on the new object (@0x73f81 — folder arg is xor'ed to zero @0x73f7f).
   *   3. Override both vptrs to the OZChannelPosition vtable slots (@0x73f86/@0x73f90) — implicit
   *      in the TS class.
   *   4. Zero the entire cache region +0x1c0..+0x2b8 EXCEPT put 1.0 on the matrix diagonal
   *      (@0x73f9b..0x74025). Note: clone zeros MORE than willBeModified/copy — including the
   *      5 std::vector triples (`movups %xmm0, 0x240..0x2b0` — 15 xmm writes) — this is standard
   *      "new object gets empty vectors" behavior.
   *   5. Copy the +0x1b8 flag from source (@0x74026..0x7402d).
   *   6. Return the new object (@0x74033 `movq %rbx,%rax`).
   *   7. Exception path (@0x7403b..0x74049): delete the partially-constructed heap object and
   *      rethrow.
   *
   * NOTE: because OZChannel2D copy-ctor @ProChannel 0x47856 is not yet transcribed, this method
   * throws citing its address rather than approximating.
   * A plausible JS deep-copy of x/y would be a Rule 3 violation (guessing at what the base ctor
   * actually copies — flags, defaults, curve data, etc.).
   */
  clone(): OZChannelPosition {
    throw new Error(
      "OZChannelPosition::clone() @ProChannel 0x73f62 not yet transcribed " +
      "(delegates to OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*) copy-ctor " +
      "@ProChannel 0x47856 which is not yet ported — see re/disasm/ProChannel.OZChannel2D.ctor_copy.s)"
    );
  }

  /**
   * OZChannelPosition::operator=(OZChannelPosition const&) @ProChannel 0x73f40.
   * Faithful: reads slot 0xe8 of *this's vtable and calls it with (rhs, true) (@0x73f4c:
   * `movl $0x1, %edx; callq *0xe8(%rax)`). Slot 0xe8 for OZChannelPosition = ::copy
   * (verified by `python3 army/tools/resolve.py ProChannel vtable OZChannelPosition`:
   * *0xe8 -> 0x7404e OZChannelPosition::copy). So this is just `this->copy(rhs, true)`.
   */
  assign(rhs: OZChannelPosition): this {
    this.copy(rhs, true); // @0x73f51 (vtable *0xe8 = copy)
    return this;
  }

  // --------------------------------------------------------------------------------------------
  // The following methods are the "cached arc-length polyline" heart of OZChannelPosition. They
  // build / consume the +0x240..+0x2b8 vectors under the spinlock. NONE of them are transcribed
  // yet — each throws citing its @0xADDR so any user hits a loud gap instead of getting a
  // plausible-but-wrong number. (Per raw-port/army/PORTING_SPEC.md Rule 3 and
  // raw-port/army/ANTI_SHORTCUT.md.)
  // --------------------------------------------------------------------------------------------

  /**
   * OZChannelPosition::getCachedVectors(double**, double**, double**, double**, int*,
   * PCMatrix44Tmpl<double>*) @ProChannel 0x746ec — the 791-line arc-length + tangent
   * precomputation that populates the 5 std::vector<double>'s at +0x240..+0x2b0 under the
   * spinlock, using X/Y sample points transformed by the given 4x4 matrix. See
   * re/disasm/ProChannel.OZChannelPosition.getCachedVectors.s.
   */
  getCachedVectors(
    _outSamples0: unknown, _outSamples1: unknown, _outSamples2: unknown, _outSamples3: unknown,
    _outCount: unknown, _matrix: Mat44d | null
  ): void {
    throw new Error(
      "OZChannelPosition::getCachedVectors @ProChannel 0x746ec not yet transcribed " +
      "(791-line arc-length + tangent precomputation; see re/disasm/ProChannel." +
      "OZChannelPosition.getCachedVectors.s — populates +0x240..+0x2b0 std::vectors and " +
      "+0x1c0 matrix, sets +0x2b8 valid=1 under spinlock @0x2bc)"
    );
  }

  /**
   * OZChannelPosition::getLength(CMTime const&, PCMatrix44Tmpl<double>*) @ProChannel 0x745d2.
   * Faithful description (not yet transcribed as executable code because it depends on
   * getCachedVectors):
   *   1. Lock spinlock at +0x2bc (@0x745ef).
   *   2. If cache-valid flag +0x2b8 == 0 (@0x745fc), unconditionally recompute via
   *      getCachedVectors(this, nullptr,nullptr,nullptr,nullptr, matrix) (@0x74690).
   *   3. Else, if matrix arg is non-null (@0x74601), compare the 16 cached-matrix doubles at
   *      +0x1c0 to matrix element-by-element using |a-b| > 1e-7 (const @0xb03b0) with a fabs
   *      mask (const @0xb0390 = 0x7fffffffffffffff ×2). If ANY diff > 1e-7, recompute
   *      (@0x74676); else skip to step 5.
   *   4. If matrix arg is NULL, still recompute unconditionally (@0x74690 branch).
   *   5. Read the last element of vector #1 (+0x258 begin / +0x260 end): if empty
   *      (@0x746a1 `cmpq %rax, 0x258(%r14); je 0x746aa`) return 0.0; else return
   *      *(end - 1) (@0x746c9 `movsd -0x8(%rax), %xmm0`).
   *   6. Unlock spinlock (@0x746d6), return xmm0.
   *
   * Not yet executable because getCachedVectors is not yet ported. Constants:
   *   @0xb0390 = 0x7fffffffffffffff (fabs mask for 128-bit vector) — see disasm line 0x74610.
   *   @0xb03b0 = 1e-7 — see disasm line 0x74618.
   */
  getLength(_t: CMTime, _matrix: Mat44d | null): number {
    throw new Error(
      "OZChannelPosition::getLength @ProChannel 0x745d2 not yet transcribed " +
      "(depends on getCachedVectors @0x746ec; matrix-diff epsilon 1e-7 @0xb03b0, " +
      "fabs mask 0x7fffffffffffffff @0xb0390)"
    );
  }

  /**
   * OZChannelPosition::getNormals(CMTime const&, double* outNx, double* outNy,
   * PCMatrix44Tmpl<double>*) @ProChannel 0x7437c — 144-line normal-vector lookup on the
   * cached polyline. See re/disasm/ProChannel.OZChannelPosition.getNormals.s.
   */
  getNormals(_t: CMTime, _outNx: unknown, _outNy: unknown, _matrix: Mat44d | null): void {
    throw new Error(
      "OZChannelPosition::getNormals @ProChannel 0x7437c not yet transcribed " +
      "(144-line normal-vector computation over the +0x240..+0x2b0 arc-length cache)"
    );
  }

  /**
   * OZChannelPosition::getPositionOnPath(CMTime const&, double s, double* outX, double* outY,
   * double* outDx, double* outDy, double* outCurvature, PCMatrix44Tmpl<double>*)
   * @ProChannel 0x7557e — 749-line reparametrization along the cached polyline: given arc-
   * length parameter `s`, produce (x, y), tangent (dx, dy), and curvature. See
   * re/disasm/ProChannel.OZChannelPosition.getPositionOnPath.s.
   */
  getPositionOnPath(
    _t: CMTime, _s: number, _outX: unknown, _outY: unknown,
    _outDx: unknown, _outDy: unknown, _outCurvature: unknown, _matrix: Mat44d | null
  ): void {
    throw new Error(
      "OZChannelPosition::getPositionOnPath @ProChannel 0x7557e not yet transcribed " +
      "(749-line arc-length reparametrization along the +0x240..+0x2b0 polyline cache)"
    );
  }

  /**
   * OZChannelPosition::getPositionReparametrizedWithRange(CMTime, double s, double* x,
   * double* y, double* curvature) @ProChannel 0x76346. Faithful transcription — thin wrapper:
   * calls getPositionOnPath(t, s, x, y, nullptr, nullptr, curvature, nullptr) (@0x76356).
   * The two `xorl %r8d,%r8d`/`xorl %r9d,%r9d` and two pushes at @0x76353/@0x76355 encode the
   * two nullptr tangent-out params and the trailing nullptr matrix arg on the stack.
   */
  getPositionReparametrizedWithRange(
    t: CMTime, s: number, outX: unknown, outY: unknown, outCurvature: unknown
  ): void {
    // Faithful @0x76356: (t, s, outX, outY, /*dx=*/null, /*dy=*/null, outCurvature, /*matrix=*/null).
    this.getPositionOnPath(t, s, outX, outY, null, null, outCurvature, null);
  }

  /**
   * OZChannelPosition::getPositionsReparametrizedWithRange(CMTime, double, vector<double>&,
   * vector<double>&, vector<double>&, PCMatrix44Tmpl<double>*) @ProChannel 0x76362 — 304-line
   * batch variant of getPositionReparametrizedWithRange over a swept range. See
   * re/disasm/ProChannel.OZChannelPosition.getPositionsReparametrizedWithRange.s.
   */
  getPositionsReparametrizedWithRange(
    _t: CMTime, _s: number,
    _outX: number[], _outY: number[], _outCurvature: number[],
    _matrix: Mat44d | null
  ): void {
    throw new Error(
      "OZChannelPosition::getPositionsReparametrizedWithRange @ProChannel 0x76362 " +
      "not yet transcribed (304-line batch sweep along the arc-length cache)"
    );
  }

  /**
   * OZChannelPosition::generatePathFromShape(CMTime const&, OZChannelCurve&, bool)
   * @ProChannel 0x7686e — 184-line routine that writes an OZChannelCurve representation of the
   * current path shape at time t. Depends on OZChannelCurve which is not yet ported. See
   * re/disasm/ProChannel.OZChannelPosition.generatePathFromShape.s.
   */
  generatePathFromShape(_t: CMTime, _outCurve: unknown, _flag: boolean): void {
    throw new Error(
      "OZChannelPosition::generatePathFromShape @ProChannel 0x7686e not yet transcribed " +
      "(184-line OZChannelCurve emitter; depends on OZChannelCurve port)"
    );
  }
}
