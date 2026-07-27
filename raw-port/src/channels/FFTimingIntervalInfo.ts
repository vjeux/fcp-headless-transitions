// FCP `FFTimingIntervalInfo` (Flexo framework) — faithful transcription.
//
// Class fingerprint recovered from ctor+record disassembly (see
// raw-port/re/disasm/Flexo.FFTimingIntervalInfo.*.s).
//
// Instance layout (byte offsets from `this`):
//   +0x00  NSString *name           // copy of ctor `name` arg (from -[name copy] @0xd62f27)
//   +0x08  uint64_t numBuckets      // ctor `count` arg, stored @0xd62ed8
//   +0x10  uint64_t sampleCount     // # samples recorded (incq @0xd6204d)
//   +0x18  double   totalTime       // sum of elapsed (@0xd6205f)
//   +0x20  double   maxTime         // max of elapsed (@0xd6206d)
//   +0x28  MapNode* mapBegin        // std::map __begin_node_ (initially → &mapEnd)
//   +0x30  MapNode* mapEndLeft      // std::map __end_node_.left (root ptr) — 0 init
//   +0x38  uint64_t mapSize         // std::map size — 0 init
//   +0x40  uint64_t peakBucketHits  // max hits observed in any single bucket
//   +0x48  uint64_t peakBucketIndex // max bucket index ever seen
//   +0x50  double   period          // ctor `period` arg (bucket width), @0xd62f03
//   +0x58  FFSynchronizable subobject  (ctor call @0xd62f18)
//
// Total sizeof ≈ 0x58 + sizeof(FFSynchronizable). The map is
// `std::map<uint32_t, FFAudioPlayerSourceInfo*>` populated with keys 0..numBuckets-1 → nullptr
// during construction (node size = 0x30, allocated via ::operator new @0xd62fb8).
//
// Methods:
//   0x0000000000d62ec0  FFTimingIntervalInfo(NSString*, uint64, double)
//   0x0000000000d62020  record(double elapsed)
//   0x0000000000d599e0  report(FFPMRLogFunnel*, bool, NSString*, bool)   — DEFERRED (stub)

/**
 * FFAudioPlayerSourceInfo — opaque pointer type used as the map value. The
 * ctor stores nullptr into every bucket; `record` never dereferences it and
 * only increments the per-bucket hit counter stored at MapNode+0x28.
 */
export type FFAudioPlayerSourceInfoPtr = unknown | null;

/**
 * MapNode — libc++ `std::__tree_node<std::__value_type<uint32_t, FFAudioPlayerSourceInfo*>,
 * void*>` reconstructed from the 0x30-byte allocation @0xd620ec / @0xd62fb8:
 *   +0x00 left, +0x08 right, +0x10 parent, +0x18 (padding/color bit),
 *   +0x20 key (stored as u64; only low 32 bits are the uint32_t key),
 *   +0x28 value (u64 — used as hit-counter in record; nullptr FFAudioPlayerSourceInfoPtr in ctor).
 */
interface MapNode {
  left: MapNode | null;
  right: MapNode | null;
  parent: MapNode | null; // may point at the __end_node (mapEnd) sentinel
  key: bigint;            // uint64_t view; represents unsigned int key
  count: bigint;          // u64 hit counter (record) / u64 view of value ptr (ctor)
}

/**
 * FFSynchronizable subobject stub — the real thing lives in Flexo. Symbols observed:
 *   __ZN16FFSynchronizableC1EPFvbPKvES1_   (called @0xd62f18)
 *   __ZN16FFSynchronizable4LockEv          (called @0xd62048)
 *   __ZN16FFSynchronizable6UnlockEv        (called @0xd621f2)
 * None of them are decoded yet; ctor/record call into deferred stubs.
 */
function FFSynchronizable_ctor(_arg1: null, _arg2: null): unknown {
  // @callq __ZN16FFSynchronizableC1EPFvbPKvES1_ (Flexo, called @0xd62f18)
  throw new Error("FFSynchronizable::FFSynchronizable @Flexo (called @0xd62f18) not yet transcribed");
}
function FFSynchronizable_Lock(_this: unknown): void {
  // @callq __ZN16FFSynchronizable4LockEv (called @0xd62048 in record)
  throw new Error("FFSynchronizable::Lock @Flexo (called @0xd62048) not yet transcribed");
}
function FFSynchronizable_Unlock(_this: unknown): void {
  // @callq __ZN16FFSynchronizable6UnlockEv (called @0xd621f2 in record)
  throw new Error("FFSynchronizable::Unlock @Flexo (called @0xd621f2) not yet transcribed");
}

/**
 * -[NSString copy] — invoked @0xd62f27 through selector at Flexo __objc_selrefs
 * VA 0x1bb85e0 → __objc_methname "copy". Preserves identity for immutable strings.
 */
function nsstring_copy(_s: unknown): unknown {
  // @Objc msgSend selector "copy" @0xd62f27
  throw new Error('-[NSString copy] @Flexo (called @0xd62f27) not yet transcribed');
}

/**
 * libc++ `void std::__tree_balance_after_insert[abi:nqe210106]<__tree_node_base<void*>*>(header, newNode)`
 * — red-black rebalance after linking `newNode` under `header`. Called @0xd62f5b (ctor) and
 * @0xd6212a / @0xd621ba (record). Not transcribed here; our port MUST call into it to preserve
 * bit-for-bit tree structure (ordering of nodes, __end_node.left / mapBegin identity).
 */
function tree_balance_after_insert(_header: MapNode, _newNode: MapNode): void {
  // @callq __ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_
  throw new Error(
    "std::__tree_balance_after_insert @Flexo (called @0xd62f5b/@0xd6212a/@0xd621ba) not yet transcribed"
  );
}

/**
 * Flexo `__TEXT,__const` constant at VA 0x156cac8 = double(2^63) = 9.223372036854776e18
 * (u64 0x43e0000000000000). Used @0xd62083 as the pivot in the classic
 * `double → uint64` sign-branchless conversion (record's bucket-index math).
 */
const K_TWO_POW_63: number = 9223372036854775808.0; // @Flexo __TEXT,__const 0x156cac8

/**
 * Faithful port of the disassembled `double -> uint64` conversion pattern
 * emitted for `(uint64_t)f` on x86_64 macOS SysV:
 *
 *   cvttsd2si rax, f           ; signed 64-bit truncation
 *   mov rcx, rax
 *   sar rcx, 63                ; rcx = -1 if rax<0, else 0
 *   subsd  f, K_TWO_POW_63
 *   cvttsd2si rdx, f-K
 *   and rdx, rcx
 *   or  rdx, rax               ; if rax<0 -> rdx else rax
 *
 * Disassembly locus @0xd62077..@0xd62093 in record.
 */
function double_to_u64(f: number): bigint {
  // signed 64-bit truncation. JavaScript BigInt truncation is toward zero, matching cvttsd2si;
  // but cvttsd2si returns 0x8000000000000000 on out-of-range / NaN. We mirror bit patterns.
  let rax: bigint;
  if (Number.isNaN(f) || f >= 9.223372036854776e18 || f < -9.223372036854776e18) {
    rax = -0x8000000000000000n; // cvttsd2si "invalid" sentinel
  } else {
    rax = BigInt(Math.trunc(f));
  }
  const rcx = rax < 0n ? -1n : 0n; // sar rax, 63
  let rdx: bigint;
  const f2 = f - K_TWO_POW_63; // subsd
  if (Number.isNaN(f2) || f2 >= 9.223372036854776e18 || f2 < -9.223372036854776e18) {
    rdx = -0x8000000000000000n;
  } else {
    rdx = BigInt(Math.trunc(f2));
  }
  // AND / OR are 64-bit signed here; libc++ pattern is bit-exact, mask to 64 bits.
  const mask64 = (1n << 64n) - 1n;
  const raxU = rax & mask64;
  const rcxU = rcx & mask64;
  const rdxU = rdx & mask64;
  return ((rdxU & rcxU) | raxU) & mask64;
}

export class FFTimingIntervalInfo {
  // +0x00
  name: unknown; // NSString*
  // +0x08
  numBuckets: bigint;
  // +0x10
  sampleCount: bigint = 0n;
  // +0x18
  totalTime: number = 0;
  // +0x20
  maxTime: number = 0;
  // std::map<uint32_t, FFAudioPlayerSourceInfo*> — layout mirrors libc++ __tree
  //  +0x28 __begin_node_  ; +0x30 __end_node_.__left_  ; +0x38 __size_
  mapBegin: MapNode; // initially set to a sentinel = &mapEndNode (this+0x30)
  private mapEndNode: MapNode; // dummy sentinel holding root at .left
  mapSize: bigint = 0n;
  // +0x40
  peakBucketHits: bigint = 0n;
  // +0x48
  peakBucketIndex: bigint = 0n;
  // +0x50
  period: number;
  // +0x58: FFSynchronizable subobject
  private sync: unknown;

  /**
   * FFTimingIntervalInfo::FFTimingIntervalInfo(NSString* name, uint64 numBuckets, double period)
   * @Flexo 0x0000000000d62ec0 (__ZN20FFTimingIntervalInfoC2EP8NSStringmd)
   *
   * Mirrors the ctor disasm line-for-line:
   *   1. Store numBuckets   -> this+0x08                                    @0xd62ed8
   *   2. Zero-init map/pair fields; mapBegin ← &mapEndNode                   @0xd62ee8..@0xd62efb
   *   3. Zero this+0x40 / this+0x48                                          @0xd62eff
   *   4. Store period       -> this+0x50                                    @0xd62f03
   *   5. FFSynchronizable::FFSynchronizable(nullptr, nullptr)                @0xd62f18
   *   6. this+0x00 ← -[name copy]                                            @0xd62f27..@0xd62f31
   *   7. If numBuckets != 0: for r15 in [0..numBuckets):                     @0xd62f34..@0xd63012
   *        - locate lower-bound insertion point in the RB tree keyed by r15
   *        - `new(0x30)` a MapNode; set key=r15, value(=count slot)=0
   *        - link into tree, call tree_balance_after_insert(header, node)
   *        - update mapBegin if a left descent went past current leftmost
   */
  constructor(name: unknown, numBuckets: bigint, period: number) {
    // step 1
    this.numBuckets = numBuckets; // @0xd62ed8
    // step 2 — mapEndNode is a sentinel; mapBegin initially aliases it
    this.mapEndNode = { left: null, right: null, parent: null, key: 0n, count: 0n }; // @0xd62eeb
    this.mapBegin = this.mapEndNode; // @0xd62efb (movq %r12, 0x28(%rdi))
    // step 3 — this+0x40/+0x48 = 0
    this.peakBucketHits = 0n; // @0xd62eff (movups xmm1, 0x40(%rdi))
    this.peakBucketIndex = 0n;
    // step 4
    this.period = period; // @0xd62f03
    // step 5
    this.sync = FFSynchronizable_ctor(null, null); // @0xd62f18
    // step 6
    this.name = nsstring_copy(name); // @0xd62f27

    // step 7 — insert keys 0..numBuckets-1 → nullptr
    if (numBuckets !== 0n) {
      // %r15 = current key (uint64), starts at 0
      for (let r15 = 0n; r15 < numBuckets; r15++) {
        // Walk RB tree from root (= mapEndNode.left) looking for insertion parent.
        // Since keys are inserted in ascending order and the map is empty at start,
        // every new node goes to the right of the previous rightmost — but we mirror
        // the disasm's generic lower-bound descent (@0xd62f79..@0xd62fb3).
        let rax: MapNode | null = this.mapEndNode.left; // (%r12) i.e. this+0x30's left  @0xd62f79
        let parent: MapNode = this.mapEndNode;          // %r14
        // `linkSlot` is the parent field we'll write the new node into:
        // either parent.left (default) or parent.right (if we descended right).
        let linkRight = false;                          // %rbx modelled as {parent, side}
        while (rax !== null) {
          parent = rax;                                 // @0xd62f9b (movq %rax, %r14)
          const cmpKey = rax.key;                       // @0xd62f9e (0x20(%rax))
          if (cmpKey > r15) {
            // key < node.key -> descend left  @0xd62fa2 (ja  0xd62f90)
            rax = rax.left;
            linkRight = false;
          } else if (cmpKey === r15) {
            // key already present — the disasm's "jae" fallthrough goes to a different arm
            // in `record`, but the ctor path (which inserts unique ascending keys) can never
            // land here. If it does, we must fail loudly (undecoded arm).
            throw new Error(
              "FFTimingIntervalInfo::FFTimingIntervalInfo @Flexo 0xd62fa4 duplicate-key arm not exercised by ctor"
            );
          } else {
            // key > node.key -> descend right; disasm walks parent.right chain @0xd62fa6..
            rax = rax.right;
            linkRight = true;
          }
        }

        // Allocate the 0x30-byte node (@0xd62fb8 __Znwm).
        const node: MapNode = {
          left: null,          // (%rax)+0x00 = 0                @0xd62fcf (movups xmm0, (%rax))
          right: null,         // (%rax)+0x08 = 0
          parent: parent,      // (%rax)+0x10 = %r14              @0xd62fd2
          key: r15,            // (%rax)+0x20 = %r15              @0xd62fc0
          count: 0n,           // (%rax)+0x28 = 0                 @0xd62fc4 (nullptr FFAudioPlayerSourceInfo*)
        };
        // Link into parent  @0xd62fd6 (movq %rax, (%rbx))
        if (parent === this.mapEndNode) {
          // First insertion: root goes into mapEndNode.left
          this.mapEndNode.left = node;
        } else if (linkRight) {
          parent.right = node;
        } else {
          parent.left = node;
        }

        // Update mapBegin (@0xd62fd9..@0xd62fef): if mapBegin.left was 0 and we linked left,
        // walk mapBegin down to leftmost. In the disassembly the code re-fetches
        // (%rcx) = mapBegin, then (%rax) = mapBegin.left; if left != 0 replace mapBegin.
        // For our ascending-key insertion order the leftmost node is always the FIRST inserted
        // (key 0). We reproduce the disasm's conditional exactly.
        {
          // -0x30(%rbp) is the address of the mapBegin field. We read its value:
          let cur: MapNode = this.mapBegin;
          const curLeft = cur.left;
          if (curLeft !== null) {
            this.mapBegin = curLeft;
          }
        }

        // Red-black fixup and size bookkeeping.  @0xd62f5b..@0xd62f64
        tree_balance_after_insert(this.mapEndNode, node);
        this.mapSize++; // incq 0x38(%rbx)  @0xd62f60
      }
    }
  }

  /**
   * FFTimingIntervalInfo::record(double elapsed)
   * @Flexo 0x0000000000d62020 (__ZN20FFTimingIntervalInfo6recordEd)
   *
   * Line-for-line:
   *   Lock                                                                    @0xd62048
   *   sampleCount++                                                           @0xd6204d
   *   totalTime += elapsed                                                    @0xd6205f
   *   maxTime = max(maxTime, elapsed)                                         @0xd6206d
   *   idx = (uint64)(elapsed / period)                                        @0xd62072..@0xd62093
   *   idx = min(idx, numBuckets - 1)                                          @0xd62096..@0xd620a4
   *   node = find_or_insert(map, idx)                                         @0xd620ac..@0xd62139
   *   node.count += 1                                                         @0xd6213c
   *   node = find(map, idx)  // re-lookup mirroring `hits[idx]++` idiom       @0xd62140..@0xd621c8
   *   peakBucketHits  = max(peakBucketHits,  node.count)                      @0xd621cc..@0xd621df
   *   peakBucketIndex = max(peakBucketIndex, idx)                             @0xd621e3..@0xd621ea
   *   Unlock                                                                  @0xd621f2
   */
  record(elapsed: number): void {
    FFSynchronizable_Lock(this.sync); // @0xd62048

    this.sampleCount++;                                                        // @0xd6204d
    this.totalTime = this.totalTime + elapsed;                                 // @0xd6205f (addsd 0x18(%rbx),xmm1;movsd xmm0,0x18)
    // maxsd semantics: maxsd(a,b) = (a > b) ? a : (b if !NaN(a) else b). For non-NaN inputs
    // this is just Math.max; NaN handling of x87/SSE differs but we mirror the disasm intent.
    this.maxTime = elapsed > this.maxTime ? elapsed : this.maxTime;            // @0xd6206d

    // idx = (uint64)(elapsed / period)                                         @0xd62072..@0xd62093
    const div = elapsed / this.period;
    let idx = double_to_u64(div);

    // clamp idx to [0, numBuckets - 1]                                         @0xd62096..@0xd620a4
    //   r12 = numBuckets - 1
    //   cmp idx, r12 ; cmovaeq r12 -> idx    ('above or equal' means idx >= r12 -> idx = r12)
    const cap = this.numBuckets - 1n; // decq %r12 @0xd6209e
    if (idx >= cap) {
      idx = cap;
    }

    // First find-or-insert (@0xd620ac..@0xd62139). Search from root = mapEndNode.left.
    let rax: MapNode | null = this.mapEndNode.left; // @0xd6209a (movq 0x30(%rbx), %rax)
    let parent: MapNode = this.mapEndNode;          // %r13
    let linkRight = false;
    let found: MapNode | null = null;
    while (rax !== null) {
      parent = rax;
      const cmpKey = rax.key;
      if (idx < cmpKey) {
        rax = rax.left;
        linkRight = false;
      } else if (idx === cmpKey) {
        // "jbe 0xd62139" — key found; %r15 = current node
        found = rax;
        break;
      } else {
        rax = rax.right;
        linkRight = true;
      }
    }

    let bucketNode: MapNode;
    if (found !== null) {
      bucketNode = found; // @0xd62139 movq %r13, %r15
    } else {
      const node: MapNode = {
        left: null,
        right: null,
        parent: parent,
        key: idx,       // @0xd620f4
        count: 0n,      // @0xd620f8
      };
      if (parent === this.mapEndNode) {
        this.mapEndNode.left = node;
      } else if (linkRight) {
        parent.right = node;
      } else {
        parent.left = node;
      }

      // mapBegin update mirror (@0xd62113..@0xd62123):
      //   rax = *(mapBegin_field)   // in the disasm rbx→ this, mapBegin field is 0x28(%rbx)
      //   rax = *rax                // mapBegin.left
      //   if rax != 0: mapBegin = rax
      const cur = this.mapBegin;
      if (cur.left !== null) {
        this.mapBegin = cur.left;
      }

      tree_balance_after_insert(this.mapEndNode, node); // @0xd6212a
      this.mapSize++;                                    // @0xd6212f
      bucketNode = node;
    }

    // node.count += 1                                                         @0xd6213c (incq 0x28(%r15))
    bucketNode.count++;

    // Second find (idempotent re-lookup) @0xd62140..@0xd621c8.
    // In our port this is guaranteed to hit the same node (RB balance never moves nodes),
    // but we mirror the disasm structure to preserve any observable side-effects.
    let rax2: MapNode | null = this.mapEndNode.left; // (movq 0x30(%rbx),%rax @0xd62133)
    let parent2: MapNode = this.mapEndNode;
    let linkRight2 = false;
    let found2: MapNode | null = null;
    while (rax2 !== null) {
      parent2 = rax2;
      const cmpKey = rax2.key;
      if (idx < cmpKey) {
        rax2 = rax2.left;
        linkRight2 = false;
      } else if (idx === cmpKey) {
        found2 = rax2;
        break;
      } else {
        rax2 = rax2.right;
        linkRight2 = true;
      }
    }
    let bucketNode2: MapNode;
    if (found2 !== null) {
      bucketNode2 = found2; // @0xd621c5 (movq %r13, %r15)
    } else {
      // Unreachable in a correct RB — but mirror the disasm arm.
      const node: MapNode = {
        left: null,
        right: null,
        parent: parent2,
        key: idx,
        count: 0n,
      };
      if (parent2 === this.mapEndNode) {
        this.mapEndNode.left = node;
      } else if (linkRight2) {
        parent2.right = node;
      } else {
        parent2.left = node;
      }
      const cur = this.mapBegin;
      if (cur.left !== null) {
        this.mapBegin = cur.left;
      }
      tree_balance_after_insert(this.mapEndNode, node); // @0xd621ba
      this.mapSize++;
      bucketNode2 = node;
    }

    // peakBucketHits  = max(peakBucketHits, bucketNode2.count)                 @0xd621cc..@0xd621df
    //   rax = *(r15+0x28)  ; rcx = this+0x40 ; cmp rax,rcx ; cmovaq rcx,rax ; mov rax->this+0x40
    {
      const rax = bucketNode2.count;
      const rcx = this.peakBucketHits;
      this.peakBucketHits = rcx > rax ? rcx : rax;
    }
    // peakBucketIndex = max(peakBucketIndex, idx)                              @0xd621e3..@0xd621ea
    {
      const r12 = idx;
      const rcx = this.peakBucketIndex;
      this.peakBucketIndex = rcx > r12 ? rcx : r12;
    }

    FFSynchronizable_Unlock(this.sync); // @0xd621f2
  }

  /**
   * FFTimingIntervalInfo::report(FFPMRLogFunnel*, bool, NSString*, bool)
   * @Flexo 0x0000000000d599e0 (__ZN20FFTimingIntervalInfo6reportEP14FFPMRLogFunnelbP8NSStringb)
   *
   * DEFERRED — 407 lines of Objective-C runtime plumbing (NSMutableArray,
   * NSString formatting, dispatch blocks, FFPMRLogFunnel accessors, __NSConcreteStackBlock).
   * Not part of the pure-timing math. Faithful transcription requires decoding:
   *   - the selector table entries at Flexo __objc_selrefs (multiple)
   *   - FFPMRLogFunnel's vtable / logging entry points
   *   - the block descriptor "___block_descriptor_56_e8_32o_e9_v16?0^v8l"
   *     and its invoke stub ____ZN20FFTimingIntervalInfo6reportEP14FFPMRLogFunnelbP8NSStringb_block_invoke.
   * Kept as an explicit gap so it shows up on the frontier for a later pass.
   */
  report(
    _logFunnel: unknown,   // FFPMRLogFunnel *
    _flag1: boolean,       // bool  (edx / r15b)
    _headerName: unknown,  // NSString *
    _flag2: boolean        // bool  (r8b / -0xcc(%rbp))
  ): void {
    throw new Error(
      "FFTimingIntervalInfo::report @Flexo 0xd599e0 not yet transcribed (ObjC logging, deferred)"
    );
  }
}
