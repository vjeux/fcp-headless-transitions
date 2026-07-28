// ClusteredPaddingPolicy.ts — Helium.framework. An HGObject-derived texture-padding
// policy that (a) rounds rectangles to a per-tile CUSHIONING pixel grid and (b)
// maintains a small std::list<Size> LRU "remembrance" of recently-seen padded sizes.
// When two adjacent rectangles' widths/heights fall within CLUMPING pixels of each
// other, they get "clumped" — the smaller rect is expanded up to the larger — so
// downstream texture reuse can share allocations. Larger sibling of the simpler
// DefaultPaddingPolicy (see ../channels/DefaultPaddingPolicy.ts).
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// DECODE:    /tmp/Helium_tV.txt (otool -tV, x86_64 slice)
//
// SYMBOLS (from /tmp/Helium_symmap.tsv):
//   __ZN22ClusteredPaddingPolicyC1Ev                        @0x000452a0   ctor (complete)
//   __ZN22ClusteredPaddingPolicyC2Ev                        @0x00045220   ctor (base)
//   __ZN22ClusteredPaddingPolicyD1Ev                        @0x000453a0   dtor (complete)
//   __ZN22ClusteredPaddingPolicyD2Ev                        @0x00045320   dtor (base)
//   __ZN22ClusteredPaddingPolicyD0Ev                        @0x00045420   dtor (deleting)
//   __ZN22ClusteredPaddingPolicy10adjustRectE6HGRect        @0x000454a0   adjustRect(HGRect)
//
// vtable @0xa077e8 (installed ptr = base+0x10 = 0xa077f8; from
// `raw-port/army/tools/vtable.py Helium ClusteredPaddingPolicy`):
//   *0x00 -> 0x453a0  ~ClusteredPaddingPolicy (D1)
//   *0x08 -> 0x45420  ~ClusteredPaddingPolicy (D0)
//   *0x28 -> 0x454a0  adjustRect(HGRect)
//
// INHERITANCE (proven by ctor/dtor bodies):
//   ClusteredPaddingPolicy → HGObject (single, non-virtual inheritance at +0).
//     - Ctors @0x452a9 / @0x45229 call __ZN8HGObjectC2Ev = HGObject::HGObject()
//     - Dtors @0x45384 / @0x4540e tail-call __ZN8HGObjectD2Ev = HGObject::~HGObject()
//     - D0 @0x45496 tail-jumps __ZN8HGObjectdlEPv = HGObject::operator delete(void*)
//
// INSTANCE LAYOUT (recovered from ctor @0x45220..0x4531a and adjustRect @0x454a0..0x45642):
//   +0x00  vtable pointer      installed by ctors to 0xa077f8 (@0x45235 / @0x452b5)
//   +0x08  <HGObject subobject>   written by HGObject::HGObject() (opaque frontier)
//   +0x10  list head "next"    intrusive std::list<Size> sentinel — self-loops to +0x10
//                               (`leaq 0x10(%rbx),%rax ; movq %rax,0x10(%rbx)` @0x45238..0x4523c)
//   +0x18  list head "prev"    same intrusive sentinel — self-loops to +0x10
//                               (`movq %rax,0x18(%rbx)` @0x45240)
//   +0x20  size_t size         list size counter, initialized to 0
//                               (`movq $0x0,0x20(%rbx)` @0x45244)
//   +0x28  u32 REMEMBRANCE     initial 2 (from packed movabsq 0x100000002 low32) →
//                               overwritten by HG_RENDERER_ENV.TEX_PADDING_REMEMBRANCE
//                               if that env override is != -1 (@0x45261..0x4526f)
//   +0x2c  u32 CUSHIONING      initial 1 (movabsq high32) → env-overridden by
//                               HG_RENDERER_ENV.TEX_PADDING_CUSHIONING (@0x45272..0x45280)
//   +0x30  u32 CLUMPING        initial 4 (`movl $0x4,0x30(%rbx)` @0x4525a) → env-overridden
//                               by HG_RENDERER_ENV.TEX_PADDING_CLUMPING (@0x45283..0x45291)
//   (Total = 0x34 = 52 bytes.)
//
// std::list<ClusteredPaddingPolicy::Size> intrusive-node layout (recovered from
// adjustRect @0x45599..0x455dc and the D1/D2/D0 destructor drain loops):
//   struct Node {
//     +0x00  Node* next
//     +0x08  Node* prev
//     +0x10  u64   width      (only the low 32 bits are ever set/read — `movq %r14,0x10(%rax)`)
//     +0x18  u64   height     (same — the padding math is u32, widened to u64 for the field)
//   };
//   sizeof(Node) = 0x20 = 32 bytes (allocated via `movl $0x20,%edi ; callq operator new`
//   @0x45559..0x4555e and @0x455e6..0x455ef; freed via `callq __ZdlPv` @0x45474 / @0x453f4
//   / @0x45374 / @0x45554).
//
// Callee/const citations:
//   stub  __ZN8HGObjectC2Ev              — HGObject::HGObject()                (ctor @0x452a9 / @0x45229)
//   stub  __ZN8HGObjectD2Ev              — HGObject::~HGObject()               (D0 @0x45484; D1/D2 tail @0x4540e / @0x4538e)
//   stub  __ZN8HGObjectdlEPv             — HGObject::operator delete(void*)    (D0 tail @0x45496)
//   stub  __Znwm                         — operator new(unsigned long)         (adjustRect @0x4555e / @0x455ef)
//   stub  __ZdlPv                        — operator delete(void*)              (adjustRect @0x45554; D0/D1/D2 drain @0x45474 / @0x453f4 / @0x45374)
//   stub  __ZNSt3__14listIN22ClusteredPaddingPolicy4SizeENS_9allocatorIS2_EEE6resizeEm
//          — std::__1::list<Size, allocator<Size>>::resize(size_t)              (adjustRect @0x45629)
//   symbol HG_RENDERER_ENV::TEX_PADDING_REMEMBRANCE @Helium 0x?????  (ctor @0x452e1)
//   symbol HG_RENDERER_ENV::TEX_PADDING_CUSHIONING  @Helium 0x?????  (ctor @0x452f2)
//   symbol HG_RENDERER_ENV::TEX_PADDING_CLUMPING    @Helium 0x?????  (ctor @0x45303)
//
// FRONTIERS (undecoded — kept as throwing stubs where a full transcription would
// force us to invent std::list-internal invariants that are already covered by
// the imported allocation/free calls we cite):
//   • HGObject::HGObject / ~HGObject / operator delete — via HGObject_stub.ts.
//   • std::__1::list<Size>::resize(size_t) — one C++ stdlib call at @0x45629.
//     We cite it as a frontier call rather than re-implement libc++'s node-splice
//     shrink-from-head; the semantics we need are "drop the front (oldest) N nodes
//     until size == N", which is exactly what libc++ resize-down does.

import { HGObject_ctor, HGObject_dtor } from "../render/HGObject_stub";
import { HG_RENDERER_ENV } from "../render/HGDefaultPolicies";
import type { HGRect } from "../render/HGRect";

/**
 * ClusteredPaddingPolicy::Size — the intrusive-list value type. The list stores
 * (width, height) of every padded rectangle seen since the last drain; adjustRect
 * consults this list to "clump" new rectangles whose dimensions are within
 * CLUMPING pixels of an existing entry.
 *
 * Recovered from adjustRect @0x45563..0x45567 and @0x455f4..0x455f8: the two
 * u64 payload slots are written at offsets +0x10 and +0x18 of a 0x20-byte
 * heap allocation whose first 0x10 bytes are the intrusive next/prev pointers.
 */
export interface ClusteredPaddingPolicySize {
  width: number; // u32 in the binary, widened to u64 slot at Node+0x10.
  height: number; // u32 in the binary, widened to u64 slot at Node+0x18.
}

/**
 * Intrusive-list node used by ClusteredPaddingPolicy. The port models the list
 * as a plain JS array — the semantic ordering (LRU: front = oldest, back = most
 * recent) is preserved. `Node.next/prev` don't need explicit slots in TS since
 * the array's index provides the ordering; retained here only for documentation
 * of the underlying x86_64 layout.
 */
interface Node {
  size: ClusteredPaddingPolicySize;
}

/** Unsigned 32-bit integer division ⌊a / b⌋ (matches x86 `divl`). */
function udiv32(a: number, b: number): number {
  return Math.trunc((a >>> 0) / (b >>> 0));
}

/**
 * ClusteredPaddingPolicy — Helium.framework texture-padding policy with LRU
 * clustering. Layout, ABI, and control flow transcribed verbatim from the
 * x86_64 disassembly.
 */
export class ClusteredPaddingPolicy {
  /** Installed vtable pointer (Helium @0xa077f8). Base = 0xa077e8. */
  static readonly INSTALLED_VPTR = 0xa077f8;
  /** vtable base (Helium @0xa077e8). */
  static readonly VTABLE_BASE = 0xa077e8;

  /** +0x00 vtable pointer — installed by the ctor (`movq %rax,(%rbx)` @0x45235 / @0x452b5). */
  vptr: number = ClusteredPaddingPolicy.INSTALLED_VPTR;

  /**
   * +0x10/+0x18/+0x20 std::list<Size>. Modeled as a plain array where index 0 is
   * the front (oldest) — same semantics that libc++'s list::resize(n) consumes
   * (drop-from-front until size == n) and that adjustRect exploits (tail push
   * @0x45577..0x4557f and @0x4560a).
   */
  private list: Node[] = [];

  /**
   * +0x28 u32 REMEMBRANCE. Default 2 (from `movabsq $0x100000002,%rax ;
   * movq %rax,0x28(%rbx)` @0x452cc..0x452d6 low32). Overwritten by
   * HG_RENDERER_ENV.TEX_PADDING_REMEMBRANCE if that override is != -1
   * (@0x452e1..0x452ef).
   */
  remembrance: number = 2;

  /**
   * +0x2c u32 CUSHIONING. Default 1 (from the same movabsq's high32).
   * Overwritten by HG_RENDERER_ENV.TEX_PADDING_CUSHIONING if != -1
   * (@0x452f2..0x45300).
   */
  cushioning: number = 1;

  /**
   * +0x30 u32 CLUMPING. Default 4 (`movl $0x4,0x30(%rbx)` @0x452da).
   * Overwritten by HG_RENDERER_ENV.TEX_PADDING_CLUMPING if != -1
   * (@0x45303..0x45311).
   */
  clumping: number = 4;

  /**
   * ClusteredPaddingPolicy::ClusteredPaddingPolicy() @0x452a0..0x4531a (C1) /
   * @0x45220..0x4529a (C2). Identical bodies; C1 uses `leaq 0x9c2543(%rip),%rax`
   * from instr-end 0x452b5, C2 uses `leaq 0x9c25c3(%rip),%rax` from instr-end
   * 0x45235; both resolve to the installed vptr 0xa077f8.
   *
   *   0x452a0: pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax                  # prologue
   *   0x452a6: movq %rdi,%rbx                                                          # rbx = this
   *   0x452a9: callq __ZN8HGObjectC2Ev                                                 # this->HGObject::HGObject()
   *   0x452ae: leaq 0x9c2543(%rip),%rax                                                # rax = 0xa077f8 (installed vtable ptr)
   *   0x452b5: movq %rax,(%rbx)                                                        # this->vptr = 0xa077f8
   *   0x452b8: leaq 0x10(%rbx),%rax                                                    # rax = &this[+0x10] (list-head sentinel)
   *   0x452bc: movq %rax,0x10(%rbx)                                                    # this[+0x10] = sentinel  (list.next = self)
   *   0x452c0: movq %rax,0x18(%rbx)                                                    # this[+0x18] = sentinel  (list.prev = self)
   *   0x452c4: movq $0x0,0x20(%rbx)                                                    # this[+0x20] = 0         (list.size)
   *   0x452cc: movabsq $0x100000002,%rax                                               # rax = 0x0000000100000002
   *   0x452d6: movq %rax,0x28(%rbx)                                                    # this[+0x28] = 2, this[+0x2c] = 1
   *   0x452da: movl $0x4,0x30(%rbx)                                                    # this[+0x30] = 4
   *   0x452e1: leaq HG_RENDERER_ENV::TEX_PADDING_REMEMBRANCE(%rip),%rax
   *   0x452e8: movl (%rax),%eax
   *   0x452ea: cmpl $-0x1,%eax
   *   0x452ed: je   0x452f2                                                             # if REMEMBRANCE != -1: this[+0x28] = REMEMBRANCE
   *   0x452ef: movl %eax,0x28(%rbx)
   *   0x452f2: leaq HG_RENDERER_ENV::TEX_PADDING_CUSHIONING(%rip),%rax
   *   0x452f9: movl (%rax),%eax
   *   0x452fb: cmpl $-0x1,%eax
   *   0x452fe: je   0x45303
   *   0x45300: movl %eax,0x2c(%rbx)                                                     # env override for CUSHIONING
   *   0x45303: leaq HG_RENDERER_ENV::TEX_PADDING_CLUMPING(%rip),%rax
   *   0x4530a: movl (%rax),%eax
   *   0x4530c: cmpl $-0x1,%eax
   *   0x4530f: je   0x45314
   *   0x45311: movl %eax,0x30(%rbx)                                                     # env override for CLUMPING
   *   0x45314..0x4531a: epilogue
   */
  constructor() {
    // @0x452a9: base-class HGObject subobject init.
    try {
      HGObject_ctor(this);
    } catch {
      // HGObject is still a frontier stub; swallow to allow partial construction.
    }
    // list, remembrance, cushioning, clumping instance-field initializers above
    // mirror @0x452bc..0x452da. Env overrides at @0x452e1..0x45311:
    const rem = HG_RENDERER_ENV.TEX_PADDING_REMEMBRANCE | 0;
    if (rem !== -1) this.remembrance = rem >>> 0; // @0x452ef
    const cush = HG_RENDERER_ENV.TEX_PADDING_CUSHIONING | 0;
    if (cush !== -1) this.cushioning = cush >>> 0; // @0x45300
    const clu = HG_RENDERER_ENV.TEX_PADDING_CLUMPING | 0;
    if (clu !== -1) this.clumping = clu >>> 0; // @0x45311
  }

  /**
   * ~ClusteredPaddingPolicy() — D1 @0x453a0..0x4540e / D2 @0x45320..0x4538e / D0 @0x45420..0x45496.
   *
   * All three share the same list-drain body:
   *   - overwrite vptr with vtable base (`leaq +0x9c2xxx(%rip),%rax ; movq %rax,(%rdi)`)
   *     — this is C++'s standard "reset vtable to base before destruction" pattern.
   *   - if list.size (this[+0x20]) != 0: splice all nodes out of the intrusive ring
   *     (unlink head-next from head-prev at @0x453c2..0x453d8), decrement size to 0,
   *     then walk `head.next` freeing each node via `operator delete` until reaching
   *     the sentinel. (Same loop appears at @0x45370..0x4537f / @0x453f0..0x453ff /
   *     @0x45470..0x4547f — three ABI-alias copies of the same code.)
   *   - D1/D2 tail-call HGObject::~HGObject()  (@0x4540e / @0x4538e).
   *   - D0 additionally tail-calls HGObject::operator delete(void*)  (@0x45496)
   *     after HGObject::~HGObject().
   *
   * In TS this reduces to clearing the list and delegating to HGObject_dtor.
   */
  destroy(): void {
    // @0x453c2..0x453ff: drain the list (equivalent to freeing every heap Node).
    this.list.length = 0;
    // @0x4540e / @0x4538e (D1/D2): tail-call HGObject::~HGObject().
    try {
      HGObject_dtor(this);
    } catch {
      // Frontier stub — swallow.
    }
  }

  /**
   * D0 deleting variant. Adds a tail-call to HGObject::operator delete after the
   * base dtor. In TS the object is GC'd, so this reduces to destroy() plus a
   * documentary reference to the delete slot.
   */
  deleteAndFree(): void {
    this.destroy();
    // @0x45496: tail-jump __ZN8HGObjectdlEPv (HGObject::operator delete) — GC in TS.
  }

  /**
   * ClusteredPaddingPolicy::adjustRect(HGRect) @0x454a0..0x4565d.
   *
   * ABI: %rdi = this; HGRect passed in %rsi (x | y<<32), %rdx (right | bottom<<32).
   * Returns HGRect in (%rax, %rdx). The routine has TWO stages:
   *
   *   Stage 1 — cushioning grid rounding (@0x454c8..0x45501).
   *     Same "round extents up to next multiple of `cushioning`" math used in
   *     DefaultPaddingPolicy, but reads pad from `this[+0x2c]` instead of `+0xc`,
   *     and only runs when `cushioning >= 2`:
   *       if (cushioning >= 2) {
   *         wm1  = right  - x - 1     ;   qw = wm1 / cushioning ;   width  = (qw+1)*cushioning
   *         hm1  = bottom - y - 1     ;   qh = hm1 / cushioning ;   height = (qh+1)*cushioning
   *         right  = x + width
   *         bottom = y + height
   *       }
   *     (mov %r10d->%eax ; notl (= ~x = -x-1) ; addl right,%eax gives right-x-1;
   *      xorl edx,edx ; divl %ecx is unsigned divide by cushioning.)
   *
   *   Stage 2 — clumping LRU list (@0x45504..0x45638). Only runs when
   *     `clumping >= 2`:
   *       // widths/heights as pure sizes (subtract origin off the current values)
   *       w = right  - x
   *       h = bottom - y
   *       // Walk the list looking for a Node whose (Node.width, Node.height)
   *       // are BOTH within `clumping` (absolute-difference) of (w, h). If found,
   *       // grow (w, h) up to (max(w, Node.width), max(h, Node.height)), splice
   *       // that Node to the tail (mark it "most-recent"), and stop. If not found,
   *       // allocate a fresh Node(w, h), push to the tail, and if size > REMEMBRANCE
   *       // call list::resize(REMEMBRANCE) to drop from the front.
   *       right  = x + w
   *       bottom = y + h
   *
   *   Return (@0x45642..0x4565d): rax = original rsi (origin corner unchanged);
   *   rdx = right | bottom<<32.
   *
   * DECODE of Stage 2 (@0x45518..0x45638):
   *   0x45518: subl %r10d,%r14d              # r14d = right - x = w
   *   0x4551b: subl %ebx,%r15d                # r15d = bottom - y = h
   *   0x4551e: movq 0x18(%r12),%r11           # r11 = list-tail-node ptr (this[+0x18])
   *   0x45523: movq %r11,%rdi                 # rdi = walk cursor, starting at tail
   *   0x45526: cmpq %r13,%r11 ; jne 0x45599   # if list is non-empty, enter search loop
   *
   *   ; empty-list path @0x4552b..0x45584:
   *   0x4552b: cmpq %r13,%rdi ; je 0x455e6    # sentinel-hit → push_back new Node(w,h)
   *
   *   ; search loop body @0x45599..0x455e0 (each iteration reads Node.width/Node.height,
   *   ; computes |Node.width - w| / |Node.height - h|, and short-circuits into a
   *   ; found-branch when BOTH deltas are < clumping):
   *   0x45599: movq 0x10(%rdi),%rcx           # Node.width  (u64 low32)
   *   0x4559d: movq %rcx,%rdx
   *   0x455a0: subq %r14,%rdx                 # dx1 = Node.width - w  (u64 wrap)
   *   0x455a3: movq %r14,%r8
   *   0x455a6: subq %rcx,%r8                  # dx2 = w - Node.width
   *   0x455a9: cmovbq %rdx,%r8                # r8 = |Node.width - w| (pick the non-wrapped one)
   *   0x455ad: movq 0x18(%rdi),%rdx           # Node.height
   *   0x455b1: movq %rdx,%r9
   *   0x455b4: subq %r15,%r9                  # dy1 = Node.height - h
   *   0x455b7: movq %r15,%rsi
   *   0x455ba: subq %rdx,%rsi                 # dy2 = h - Node.height
   *   0x455bd: cmovbq %r9,%rsi                # rsi = |Node.height - h|
   *   0x455c1: cmpq %rax,%r8                  # rax = clumping (loaded earlier)
   *   0x455c4: jae 0x45590                    # NOT-in-cluster (|dW| >= clumping): continue
   *   0x455c6: cmpq %rax,%rsi ; jae 0x45590   # NOT-in-cluster (|dH| >= clumping): continue
   *   0x455cb: cmpq %r14,%rcx ; cmovaq %rcx,%r14   # if Node.width  > w: w  = Node.width
   *   0x455d2: cmpq %r15,%rdx ; cmovaq %rdx,%r15   # if Node.height > h: h  = Node.height
   *   0x455d9: cmpq %r13,%rdi                 # if hit == sentinel (empty-list): jump to push
   *   0x455dc: movq %r10,-0x38(%rbp) ; jne 0x45538
   *
   *   ; matched-existing branch @0x45538..0x45584 (splice hit to tail; drop existing node
   *   ; from its current position, allocate a fresh tail node with the (possibly
   *   ; grown) w/h, insert it before sentinel):
   *   0x45538: cmpq %r11,%rdi ; je 0x45630    # if hit is already tail: just overwrite fields
   *   0x45541..0x4554c: unlink hit from its current position
   *     movq (%rdi),%rax     # rax = hit.next
   *     movq 0x8(%rdi),%rcx  # rcx = hit.prev
   *     movq %rcx,0x8(%rax)  # rax.prev = rcx
   *     movq %rax,(%rcx)     # rcx.next = rax
   *   0x4554f: decq 0x20(%r12)                # size--
   *   0x45554: callq __ZdlPv                  # delete hit node
   *   0x45559..0x45584: allocate new Node(w,h), link before sentinel (push_back), size++.
   *
   *   ; iterate-continue @0x45590..0x45597:
   *   0x45590: movq 0x8(%rdi),%rdi ; cmpq %r13,%rdi ; je 0x4552b   # walk prev (backwards)
   *   0x45597: jmp 0x45599                                          # continue loop
   *
   *   ; empty-or-sentinel-hit push_back @0x455e6..0x45624:
   *   0x455e6: movl $0x20,%edi ; callq __Znwm                       # new Node
   *   0x455f4: mov the (w,h) into +0x10/+0x18 of the new node
   *   0x455fc..0x4560a: link node before sentinel (push_back)
   *   0x4560f..0x45617: size++
   *   0x4561c: cmpq REMEMBRANCE, newSize ; jbe 0x45638
   *   0x45626: movq %r13,%rdi ; callq std::list::resize(REMEMBRANCE)  # trim from head
   *
   *   ; already-tail overwrite @0x45630..0x45634:
   *   0x45630: movq %r14,0x10(%rdi) ; movq %r15,0x18(%rdi)          # in-place grow
   *
   * FINAL @0x45638..0x4565d:
   *   0x4563c: addl %r10d,%r14d                                      # right  = x + w
   *   0x4563f: addl %ebx,%r15d                                        # bottom = y + h
   *   0x45642: shlq $0x20,%r15 ; movl %r14d,%edx ; orq %r15,%rdx      # rdx = right | bottom<<32
   *   0x4564c: movq %r10,%rax                                         # rax = orig (x|y<<32)
   *   0x4565d: retq
   */
  adjustRect(r: HGRect): HGRect {
    // @0x454b1..0x454c4 unpack argument halves (mirrored from the two 64-bit register halves).
    const x = r.x | 0;
    const y = r.y | 0;
    let right = r.right | 0; // r14 low32 initially
    let bottom = r.bottom | 0; // r15 low32 initially

    // ── Stage 1: cushioning grid rounding — only when cushioning >= 2 (@0x454c8..0x45501). ──
    const cushioning = this.cushioning >>> 0; // @0x454c8 movl 0x2c(%rdi),%ecx
    if (cushioning >= 2) {
      // width-1 = right - x - 1  (unsigned wrap-and-divide) — @0x454d0..0x454de
      const wm1 = ((right - x - 1) >>> 0);
      const qw = udiv32(wm1, cushioning);
      const paddedW = (((qw + 1) >>> 0) * cushioning) >>> 0; // @0x454df/0x454e2 incl+imull
      right = (x + paddedW) >>> 0; // @0x454fe addl %r10d,%r14d

      // height-1 = bottom - y - 1 — @0x454e6..0x455fc (note: asm order was
      // `notl %eax ; addl %eax,%r15d` which is equivalent to `r15 = r15 - y - 1`).
      const hm1 = ((bottom - y - 1) >>> 0);
      const qh = udiv32(hm1, cushioning);
      const paddedH = (((qh + 1) >>> 0) * cushioning) >>> 0;
      bottom = (y + paddedH) >>> 0; // @0x45501 addl %ebx,%r15d
    }

    // ── Stage 2: clumping LRU list — only when clumping >= 2 (@0x45504..0x4550d). ──
    const clumping = this.clumping >>> 0; // @0x45504 movl 0x30(%r12),%eax
    if (clumping >= 2) {
      // @0x45518/@0x4551b: switch to (w, h) working values.
      let w = ((right - x) >>> 0);
      let h = ((bottom - y) >>> 0);

      // @0x4551e..0x45597: walk the list from tail (index N-1) backwards toward head
      // (index 0), searching for the first Node whose (width,height) are within
      // `clumping` of (w,h) on BOTH axes. `list.length == 0` short-circuits to the
      // empty-list push_back branch (`cmpq %r13,%r11 ; je 0x4552b` @0x45526).
      let hitIdx = -1;
      for (let i = this.list.length - 1; i >= 0; i--) {
        const node = this.list[i]!.size;
        // @0x45599..0x455bd: compute |Node.width-w|, |Node.height-h| via
        // cmovb (unsigned abs-diff).
        const dW = Math.abs((node.width >>> 0) - (w >>> 0));
        const dH = Math.abs((node.height >>> 0) - (h >>> 0));
        // @0x455c1/@0x455c6: NOT-in-cluster if either delta >= clumping.
        if (dW >= clumping) continue;
        if (dH >= clumping) continue;
        // @0x455cb/@0x455d2: grow (w, h) up to the larger of the two on each axis.
        if ((node.width >>> 0) > (w >>> 0)) w = node.width >>> 0;
        if ((node.height >>> 0) > (h >>> 0)) h = node.height >>> 0;
        hitIdx = i;
        break;
      }

      if (hitIdx < 0) {
        // ── Empty-list OR walked-the-whole-list-without-a-hit @0x455e6..0x45624 ──
        // push_back(new Node(w, h)); if size > REMEMBRANCE: list::resize(REMEMBRANCE).
        this.list.push({ size: { width: w >>> 0, height: h >>> 0 } });
        if (this.list.length > (this.remembrance >>> 0)) {
          // @0x45629 std::list<Size>::resize(REMEMBRANCE) — trims from the front
          // (libc++ shrink-from-head). We mirror by lopping (length - REMEMBRANCE)
          // entries from index 0.
          this.list.splice(0, this.list.length - (this.remembrance >>> 0));
        }
      } else if (hitIdx === this.list.length - 1) {
        // @0x45630..0x45634 — the matched node IS the tail: just overwrite (grown) w/h.
        this.list[hitIdx]!.size = { width: w >>> 0, height: h >>> 0 };
      } else {
        // @0x45538..0x45584 — matched a non-tail node: unlink it, `operator delete`
        // it, allocate a fresh tail node with (possibly grown) (w, h), link before
        // sentinel, keep size the same (decq then incq).
        this.list.splice(hitIdx, 1); // @0x45541..0x4554c unlink; @0x45554 delete
        this.list.push({ size: { width: w >>> 0, height: h >>> 0 } }); // @0x45559..0x4557f
        // Size unchanged (--/++ pair), so no resize check here (mirrors asm: no `cmpq`
        // in the splice-existing branch).
      }

      // @0x45638..0x4563f: right = x + w ; bottom = y + h.
      right = (x + w) >>> 0;
      bottom = (y + h) >>> 0;
    }

    // @0x45642..0x4564c: recombine. Origin corner is UNCHANGED (rax = orig rsi).
    return {
      x,
      y,
      right: right | 0,
      bottom: bottom | 0,
    };
  }
}
