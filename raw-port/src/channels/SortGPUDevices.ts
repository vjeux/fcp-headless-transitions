/**
 * SortGPUDevices — sort predicate for `shared_ptr<HGGPUComputeDevice const>`.
 *
 * Faithful transcription of Helium's
 *   SortGPUDevices::operator()(
 *     std::__1::shared_ptr<HGGPUComputeDevice const> const&,
 *     std::__1::shared_ptr<HGGPUComputeDevice const> const&) const
 * @0x0000000000119110  (mangled: __ZNK14SortGPUDevicesclERKNSt3__110shared_ptrIK18HGGPUComputeDeviceEES6_)
 *
 * Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
 * Disasm: raw-port/re/disasm/Helium.SortGPUDevices.operator().s
 *
 * ============================================================================
 * Semantics recovered from disasm
 * ============================================================================
 *
 * INPUTS (via std::__1::shared_ptr's inline `__ptr_` at offset 0):
 *   a  = *(HGGPUComputeDevice**) &lhs   (@0x119140 movq (%rsi), %rax)
 *   b  = *(HGGPUComputeDevice**) &rhs   (@0x1191d0 movq (%rax), %rax  after rdx dereference)
 *
 * FIELDS READ ON HGGPUComputeDevice (recovered from the raw offsets used):
 *   +0x68  uint64  registryID     (matched byte-for-byte against
 *                                  -[<MTLDevice> registryID] on each active
 *                                  display's currently-attached Metal device)
 *   +0x78  uint64  tie-break key  (unsigned; higher value sorts first)
 *
 * The registryID identification is grounded in the disasm itself:
 *   @0x119174   movq @Objc selector ref: registryID
 *   @0x119198   callq *[objc_msgSend(mtl, sel_registryID)]  -> uint64 in %rax
 *   @0x1191a8   movq 0x68(%rax), %rbx   ; a->[+0x68] loaded and compared with
 *   @0x1191b5   cmpq %rbx, %r13         ; the display's Metal device registryID
 * The equality test proves +0x68 stores the same uint64 registryID that
 * MTLDevice reports.
 *
 * ALGORITHM (mirrors branch-for-branch):
 *
 *   1. Ask CoreGraphics for the list of active displays via
 *      CGGetActiveDisplayList(maxCount=0x20, out displays[32], out count).
 *      Stub target: 0x3c4bc8 -> _CGGetActiveDisplayList.
 *      If it returns non-zero OR count == 0, "A is on active display" is
 *      considered FALSE (bl = 0) and the A-loop is skipped.
 *      (@0x11915d call; @0x119166 jne skip; @0x11916f je skip)
 *
 *   2. A-LOOP: for each display i in [0, count):
 *        mtlA_i = CGDirectDisplayCopyCurrentMetalDevice(displays[i])
 *          Stub target: 0x3c4bc2 -> _CGDirectDisplayCopyCurrentMetalDevice.
 *        rid_i  = [mtlA_i registryID]        (Obj-C msg via cached selector)
 *        rid_A  = a->[+0x68]
 *        objc_release(mtlA_i)                (stub @literal-pool _objc_release)
 *        if (rid_i == rid_A) { bl = 1; break; }
 *        else                { bl = 0; continue; }
 *      Falls out of the loop with bl either 1 (A found) or 0 (A not found).
 *      (@0x119180-0x1191c7)
 *
 *   3. RE-QUERY for B: reload the display list AGAIN with
 *      CGGetActiveDisplayList(0x20, displays[32], &count).  The binary
 *      really does call it twice — I mirror that faithfully rather than
 *      caching, because display topology is racy and Apple's ordering
 *      is what a faithful port must reproduce.
 *      Same error/empty short-circuit lands at 0x11925a.
 *      (@0x1191ed call; @0x1191f4 jne; @0x1191fd je)
 *
 *   4. B-LOOP: identical shape, comparing rid_i to b->[+0x68].
 *      On match  -> jumps to 0x119262 (BOTH-QUAD test).
 *      On loop-exhaust (B not found) -> falls to 0x11925a (A?-B0 test).
 *      (@0x119210-0x119258)
 *
 *   5. FINAL DECISION MATRIX:
 *
 *      +--------+--------+-------------------------------+
 *      |   A    |   B    | return                        |
 *      +--------+--------+-------------------------------+
 *      | found  | !found | 1   (A wins by presence)      |  @0x11925a-0x119260
 *      | !found | found  | 0   (B wins by presence)      |  @0x119262-0x1192a7
 *      | found  | found  | (a->[+0x78] >  b->[+0x78])    |  @0x119266
 *      | !found | !found | (a->[+0x78] >  b->[+0x78])    |  @0x119266
 *      +--------+--------+-------------------------------+
 *
 *      The 0x78 tie-break is UNSIGNED (`seta`, not `setg`) — higher value
 *      of the +0x78 field sorts BEFORE lower.  This is a strict-weak-order
 *      predicate suitable for std::sort.
 *
 * NON-DECODED CALLEES DEFERRED AS THROWING STUBS
 * ============================================================================
 * The three foreign functions this touches are all standard system APIs
 * (CoreGraphics + libobjc), NOT unresolved FCP code:
 *   _CGGetActiveDisplayList              stub @0x3c4bc8 (public CG API)
 *   _CGDirectDisplayCopyCurrentMetalDevice  stub @0x3c4bc2 (public CG API)
 *   -[MTLDevice registryID]              cached selector, sel_registryID
 *   _objc_release                        libobjc runtime
 * At this layer of the port we have no headless-FCP equivalent for these,
 * so the function is expressed against an INJECTED SystemHooks interface
 * that a caller must supply.  A no-hooks caller path throws citing the
 * exact @0xADDR of the CG/objc call it can't complete, per Rule 3.
 *
 * ============================================================================
 * Verification (transcription-level, matrix logic from disasm)
 * ============================================================================
 * The decision matrix above is derived directly by reading the four jump
 * targets 0x11925a / 0x119262 / 0x1192a7 / 0x119266 and their subsequent
 * moves into %al.  Unit tests in test/ exercise all four rows with a stub
 * SystemHooks.
 */

// ---------------------------------------------------------------------------
// HGGPUComputeDevice partial layout
// ---------------------------------------------------------------------------
// Only the two fields this comparator touches.  The full class ctor
// (HGGPUComputeDevice(HGMTLDeviceType), Helium symbol
// __ZN18HGGPUComputeDeviceC2E15HGMTLDeviceType) is not yet transcribed;
// when it lands it must place these fields at the same offsets or all
// existing consumers (this comparator, HGGPUReadbackJob, HGRenderQueue::*)
// break.  Documenting the offsets here as a hard contract.
//
//   +0x68  uint64   registryID
//   +0x78  uint64   tie-break sort key
export interface HGGPUComputeDeviceSortView {
  /** HGGPUComputeDevice+0x68 — uint64 registryID (matches MTLDevice.registryID). */
  registryID: bigint;
  /** HGGPUComputeDevice+0x78 — uint64 secondary sort key (higher = first). */
  sortKey: bigint;
}

/**
 * Environment hooks — the three CoreGraphics/Metal/libobjc entry points the
 * comparator relies on.  A production port wires these to a real backend;
 * tests wire a stub.  Every method's presence here corresponds to a specific
 * @0xADDR call-site in the disasm.
 */
export interface SortGPUDevicesHooks {
  /**
   * _CGGetActiveDisplayList  (stub @Helium 0x3c4bc8, called @0x11915d and
   * @0x1191ed).  Returns (err, displayIDs[]) with at most `maxDisplays`
   * entries; err == 0 on success.  The FCP binary asks for up to 0x20 (32).
   */
  cgGetActiveDisplayList(maxDisplays: number): {
    err: number;
    displayIDs: readonly number[];
  };

  /**
   * -[MTLDevice registryID] applied to
   *   _CGDirectDisplayCopyCurrentMetalDevice(displayID)  (stub @0x3c4bc2,
   *   called @0x11918a and @0x11921a).
   * Bundled into a single hook because the caller doesn't need the MTLDevice
   * pointer for anything else — it just reads registryID and immediately
   * calls _objc_release on it (@0x1191af / @0x119243).
   * Returns undefined if the display has no attached Metal device.
   */
  displayRegistryID(displayID: number): bigint | undefined;
}

/**
 * A JS callable that answers "if I don't have any real system hooks, what
 * should I do?"  Following Rule 3: refuse loudly with a throw citing the
 * @0xADDR that would have called into the missing hook.  Never silently
 * pretend the display list is empty — that would fabricate an answer.
 */
function throwUnhookedCG(): never {
  throw new Error(
    "SortGPUDevices: no SystemHooks provided — cannot resolve " +
      "_CGGetActiveDisplayList @Helium 0x3c4bc8 (called from " +
      "SortGPUDevices::operator() @0x11915d, @0x1191ed).",
  );
}

/**
 * Ports Helium `SortGPUDevices` — a stateless functor (empty struct in C++)
 * used as a std::sort predicate.  Returns TRUE iff `a` should be ordered
 * BEFORE `b` in the sorted list.
 *
 * Because operator() takes references to shared_ptr but only ever reads the
 * managed pointer's +0x0 (the __ptr_), we accept the pointed-to objects
 * directly here.  Callers that already have shared_ptr semantics can pass
 * `sharedA.get()` / `sharedB.get()`.
 */
export class SortGPUDevices {
  private readonly hooks: SortGPUDevicesHooks;

  constructor(hooks?: SortGPUDevicesHooks) {
    // The C++ ctor is trivial (empty type). We only carry the environment
    // hooks needed to service the operator()'s system calls.
    this.hooks = hooks ?? {
      cgGetActiveDisplayList: throwUnhookedCG,
      displayRegistryID: throwUnhookedCG,
    };
  }

  /**
   * operator()(a, b) — strict weak ordering.  See file header for full
   * decision matrix.
   */
  call(
    a: HGGPUComputeDeviceSortView,
    b: HGGPUComputeDeviceSortView,
  ): boolean {
    // ---------------------------------------------------------------
    // A-LOOP: is `a` currently on an active display?
    // Mirrors @0x11915d..@0x1191c7.
    // ---------------------------------------------------------------
    let aOnDisplay = false;
    {
      const { err, displayIDs } = this.hooks.cgGetActiveDisplayList(0x20);
      // @0x119164 testl %eax,%eax + @0x119166 jne skip
      // @0x119168 cmpl $0, count + @0x11916f je skip
      if (err === 0 && displayIDs.length !== 0) {
        // @0x119171 xorl %r14d,%r14d  (i = 0)
        for (let i = 0; i < displayIDs.length; i++) {
          // @0x119183 movl -0xb0(%rbp,%rax,4),%edi   ; displayIDs[i]
          const displayID = displayIDs[i]!;
          // @0x11918a call CGDirectDisplayCopyCurrentMetalDevice
          // @0x119198 [mtl registryID]
          // @0x1191af _objc_release(mtl)
          // The hook bundles those three ops (see interface doc).
          const ridDisplay = this.hooks.displayRegistryID(displayID);
          // @0x1191a8 movq 0x68(a),%rbx  ; rid_A = a->registryID
          const ridA = a.registryID;
          // @0x1191b5 cmpq %rbx,%r13 + @0x1191b8 sete %bl + @0x1191bb je exit
          if (ridDisplay !== undefined && ridDisplay === ridA) {
            aOnDisplay = true;
            break;
          }
          aOnDisplay = false;
          // @0x1191bd incl %r14d + @0x1191c0 cmpl count,%r14d + jne top
        }
      }
      // Falls to 0x1191c9 (start of B-LOOP) with aOnDisplay set.
    }

    // ---------------------------------------------------------------
    // B-LOOP: is `b` currently on an active display?
    // Re-queries the display list (@0x1191ed), matching the binary.
    // Mirrors @0x1191c9..@0x119258.
    // ---------------------------------------------------------------
    let bOnDisplay = false;
    let bLoopBrokeOnMatch = false;
    {
      const { err, displayIDs } = this.hooks.cgGetActiveDisplayList(0x20);
      if (err === 0 && displayIDs.length !== 0) {
        for (let i = 0; i < displayIDs.length; i++) {
          const displayID = displayIDs[i]!;
          const ridDisplay = this.hooks.displayRegistryID(displayID);
          // @0x11923c movq 0x68(%rax), %r15  — rid_B = b->registryID.
          // The binary reloads b->[0x68] into %r15 every iteration; since
          // %rax stays pointing at *b, the value is invariant across the
          // loop.  Hoisted here as a single JS read.
          const ridB = b.registryID;
          if (ridDisplay !== undefined && ridDisplay === ridB) {
            bOnDisplay = true;
            bLoopBrokeOnMatch = true;
            break;
          }
        }
      }
      // If we fell through without a match:
      //   - either the CG call errored / list empty -> path @0x11925a
      //   - or the loop exhausted with no match     -> also path @0x11925a
      // Both set %al = 1 and then test %bl.
      // If we broke on match: %rip is at @0x119262 which tests %bl.
    }

    // ---------------------------------------------------------------
    // FINAL DECISION (@0x11925a..@0x1192a7).
    // ---------------------------------------------------------------
    if (!bLoopBrokeOnMatch) {
      // @0x11925a movb $1,%al ; @0x11925c testb %bl,%bl
      //   %bl == 0 (aOnDisplay==false)  -> je 0x119266 (tie-break)
      //   %bl == 1 (aOnDisplay==true)   -> jmp 0x119285 return %al==1
      if (aOnDisplay) {
        return true; // A on display, B not -> A first
      }
      // fall through to tie-break
    } else {
      // @0x119262 testb %bl,%bl
      //   %bl == 0 (aOnDisplay==false) -> 0x1192a7 return %al=0
      //   %bl == 1 (aOnDisplay==true)  -> fall to 0x119266 (tie-break)
      if (!aOnDisplay) {
        return false; // B on display, A not -> B first
      }
      // fall through to tie-break
    }

    // @0x119266..@0x119282 : tie-break on unsigned +0x78.
    // seta %al  ==>  ( a->[+0x78] > b->[+0x78] )
    // BigInts are unbounded but we're comparing two uint64s; the > compare
    // gives the same answer as an unsigned qword compare so long as callers
    // store the field as a non-negative BigInt (which uint64 always is).
    return a.sortKey > b.sortKey;
  }
}
