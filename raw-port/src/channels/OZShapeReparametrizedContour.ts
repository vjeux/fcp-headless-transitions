// OZShapeReparametrizedContour — Ozone.framework class. A single-inheritance
// derived of OZShapeContour that additionally owns:
//   - a "contour position" OZChannelPosition* (allocated in the ctor with an
//     ordinal token 0x0823000A + subord=2 + group=1).
//   - three raw dynamic-array triples (begin/end/capacity) at +0x190,
//     +0x1a8, +0x1c0 (freed as raw operator-delete pointers in D1).
//   - a "contour-impl singleton" (nested class
//     OZShapeReparametrizedContour_contourImpl) held in a global slot fetched
//     via `__ZN28OZShapeReparametrizedContour40...E`.
//
// Framework: Final Cut Pro / Ozone.framework.
//
// Exported symbols (nm evidence from FCP-shipped Ozone x86_64 slice):
//   00000000005d2fa0 t __ZN28OZShapeReparametrizedContourD1Ev
//   00000000005d3530 t __ZN28OZShapeReparametrizedContourC2E6CMTime
//
// Base class evidence: both D1 tail-jmps to `OZShapeContourD2Ev` and the ctor
// wire-up initializes the base VTABLE/state at offsets <0x180 before the
// derived-class writes at 0x180+. So `OZShapeReparametrizedContour` inherits
// (single, non-virtual) from `OZShapeContour` at offset 0.
//
// Layout inferred from the two exported methods (byte-visible fields only —
// this is not a full class shape, just the members touched by ctor+dtor):
//
//   [base OZShapeContour occupies bytes 0..0x180]
//     +0x00..0x10 CMTime {value, timescale, flags} 16B block
//                                     -- movaps 0x10(%rbp),%xmm1;movups %xmm1,(%rdi)
//     +0x10..0x18 CMTime.epoch (int64_t)
//     +0x18..0x28 zero-init           -- movups xmm0 (0.0) at +0x18
//     +0x28..0x38 (-1.0, -1.0) f64x2  -- movaps @0x7053c0 => movups @0x5d3549
//     +0x38..0x40 f64 1.0             -- movq $0x3ff0000000000000
//     +0x40..0x60 zero                -- movups xmm0
//     +0x60..0x68 f64 1.0
//     +0x68..0x88 zero                -- movups xmm0
//     +0x88..0x90 f64 1.0
//     +0x90..0xb0 zero                -- movups xmm0
//     +0xb0..0xb8 f64 1.0
//     +0xb8..0xbc uint32 0x01000000
//     +0xc0..0x180 zero (12 xmm0 stores, 0x10 bytes each)
//                                     -- movups xmm0, {c0,d0,e0,f0,100,110,120,
//                                                       130,140,150,160,170}
//   [derived OZShapeReparametrizedContour bytes 0x180..0x1d8]
//     +0x180 OZChannelPosition* (owning)
//     +0x188 uint64_t 0                  -- movq $0 written after ctor
//     +0x190 raw ptr  begin[array_0]     -- movups xmm0 zero-inits (3 x 16B)
//     +0x198 raw ptr  end[array_0]
//     +0x1a0 raw ptr  cap[array_0]
//     +0x1a8 raw ptr  begin[array_1]
//     +0x1b0 raw ptr  end[array_1]
//     +0x1b8 raw ptr  cap[array_1]
//     +0x1c0 raw ptr  begin[array_2]
//     +0x1c8 raw ptr  end[array_2]
//     +0x1d0..0x1d8 uint64_t 0 (movq $0)
//
// Source disassembly committed under
//   raw-port/re/disasm/OZShapeReparametrizedContour.OZShapeReparametrizedContour.s
//   raw-port/re/disasm/OZShapeReparametrizedContour.~OZShapeReparametrizedContour.s
//
// Static rodata references (raw bytes from /tmp/Ozone.x86_64):
//   @0x7053c0 (16B, movaps @0x5d3549)  = (-1.0, -1.0) as 2xf64. Loaded to +0x28.
//   @const imm 0x3ff0000000000000       = f64 1.0 (movabsq @0x5d35b7)
//   @const imm 0x01000000               = uint32 16777216 (movl @0x5d35f5)
//   @const imm 0x0823000A               = OZChannelPosition ordinal token
//                                         (movl $0x823000a, %r8d @0x5d3685)
//   @const imm 0x2c0                    = 704 bytes = sizeof(OZChannelPosition)
//                                         (movl $0x2c0, %edi @0x5d3626)
//   @const imm 0x30                     = 48 bytes = sizeof(*_contourImpl)
//                                         (movl $0x30, %edi @0x5d3652)
//   @literal_pool ""                    = empty PCString name (@0x5d3633)
//   @literal_pool &_contourImpl_singleton_slot (@0x5d3643)
//
// Callees:
//   0x006dfca2  -> operator new(size_t)                       (__Znwm — libc++abi stub)
//   0x006df09c  -> PCString::PCString(char const*)            (ProCore internal stub)
//   0x006de280  -> OZChannelPosition::OZChannelPosition(...)  (Ozone internal stub —
//                                                              signature per demangler:
//                                                              (PCString const&, OZChannelFolder*,
//                                                               uint32_t, uint32_t, uint32_t,
//                                                               OZChannelImpl*, OZChannelInfo*))
//   0x006df0c6  -> PCString::~PCString()                      (ProCore internal stub)
//   0x006dfc36  -> operator delete(void*)                     (__ZdlPv — libc++abi stub)
//   0x006dd07a  -> __Unwind_Resume                            (libunwind stub)
//   [internal]  -> OZShapeContour::~OZShapeContour()          (base dtor D2)
//   [internal]  -> OZShapeReparametrizedContour::
//                    OZShapeReparametrizedContour_contourImpl::
//                    OZShapeReparametrizedContour_contourImpl()
//                                                              (nested-class C2)
//   [runtime]   -> (contour_position)->vtable[+0x8]()          (called via
//                                                              `movq (%rdi),%rax; call *0x8(%rax)`
//                                                              in D1 to release the
//                                                              OZChannelPosition)

// -----------------------------------------------------------------------------
// External stubs. Each stub's throw string carries an @0xADDR on the same
// line, per PORTING_SPEC.md P4.
// -----------------------------------------------------------------------------

// libc++abi operator new. Stub — no body yet @0x006dfca2 (__Znwm).
function operator_new_size(_size: number): OZChannelPosition | ContourImpl {
  throw new Error("operator new(size_t) has no body yet @0x006dfca2 (__Znwm)");
}

// libc++abi operator delete. Stub — no body yet @0x006dfc36 (__ZdlPv).
function operator_delete_void(_p: unknown): void {
  throw new Error("operator delete(void*) has no body yet @0x006dfc36 (__ZdlPv)");
}

// libunwind __Unwind_Resume. Stub — no body yet @0x006dd07a.
function Unwind_Resume(_exn: unknown): never {
  throw new Error("__Unwind_Resume has no body yet @0x006dd07a");
}

// OZChannelPosition::OZChannelPosition(PCString const&, OZChannelFolder*, u32, u32, u32, OZChannelImpl*, OZChannelInfo*).
// The asm at 0x5d3691 passes 6 register args (rdi=this, rsi=&name, edx=0,
// ecx=1, r8d=0x0823000A, r9d=2) PLUS two stack-passed args at [rsp], [rsp+8]
// = (impl_singleton, 0) for the 7th and 8th demangler params (OZChannelImpl*,
// OZChannelInfo*). Stub — no body yet @0x006de280.
function OZChannelPosition_ctor(
  _self: OZChannelPosition,
  _name: PCStringHandle,
  _folder: null,
  _arg3: number,
  _arg4: number,
  _arg5: number,
  _arg6: number,
  _stack_arg7: ContourImpl | null,
  _stack_arg8: number,
): void {
  throw new Error(
    "OZChannelPosition::OZChannelPosition(PCString const&, OZChannelFolder*, u32, u32, u32, OZChannelImpl*, OZChannelInfo*) has no body yet @0x006de280",
  );
}

// PCString::PCString(char const*). Stub — no body yet @0x006df09c.
function PCString_ctor_from_cstr(_self: PCStringHandle, _cstr: string): void {
  throw new Error("PCString::PCString(char const*) has no body yet @0x006df09c");
}

// PCString::~PCString(). Stub — no body yet @0x006df0c6.
function PCString_dtor(_self: PCStringHandle): void {
  throw new Error("PCString::~PCString() has no body yet @0x006df0c6");
}

// OZShapeContour::~OZShapeContour() [D2]. Stub — no body yet @0x5d3017/@0x5d3721/@0x5d3751 (internal, no stub-table entry).
function OZShapeContour_D2(_self: OZShapeReparametrizedContour): void {
  throw new Error(
    "OZShapeContour::~OZShapeContour() [D2] has no body yet @0x5d3017 (internal call — no stub table entry)",
  );
}

// Nested class OZShapeReparametrizedContour_contourImpl::_contourImpl() default ctor.
// Stub — no body yet @0x5d3662 (nested class C2 — internal call).
function ContourImpl_ctor(_self: ContourImpl): void {
  throw new Error(
    "OZShapeReparametrizedContour::OZShapeReparametrizedContour_contourImpl::OZShapeReparametrizedContour_contourImpl() has no body yet @0x5d3662",
  );
}

// (*p->vtable[+0x8])(p) — OZChannelPosition virtual "release" slot called by D1.
// Stub — no body yet @0x5d2fb8.
function OZChannelPosition_vslot_0x8(_p: OZChannelPosition): void {
  throw new Error(
    "OZChannelPosition virtual (*p->vtable[+0x8])(p) has no body yet @0x5d2fb8",
  );
}

// Singleton slot for the nested contourImpl (RIP-relative access @0x5d3643).
// Un-ported global — modeled as a mutable module-scope binding so the ctor's
// write is observable to callers.
const contourImpl_singleton_slot: { value: ContourImpl | null } = {
  // @slot Ozone (RIP-computed from @0x5d3643) — initialized null by static init
  value: null,
};

// -----------------------------------------------------------------------------
// Static rodata — verbatim byte-level.
// -----------------------------------------------------------------------------

// @const 0x7053c0 — f64x2 (-1.0, -1.0); loaded by movaps @0x5d3549
const CONST_NEG_ONE_PAIR_F64: Readonly<[number, number]> = [-1.0, -1.0] as const;

// @const imm 0x3ff0000000000000 — f64 1.0; movabsq @0x5d35b7
const CONST_F64_ONE = 1.0;

// @const imm 0x01000000 — uint32 16777216; movl @0x5d35f5
const CONST_U32_0x01000000 = 0x01000000 >>> 0;

// @const imm 0x0823000A — OZChannelPosition ordinal token (arg5)
const OZCHANNEL_POSITION_ORDINAL_TOKEN = 0x0823000a >>> 0;

// @const imm 0x2c0 — 704B, size of OZChannelPosition passed to operator new
const SIZEOF_OZChannelPosition = 0x2c0;

// @const imm 0x30 — 48B, size of ContourImpl passed to operator new
const SIZEOF_ContourImpl = 0x30;

// -----------------------------------------------------------------------------
// Structural types for referenced but un-ported classes.
// -----------------------------------------------------------------------------

interface PCStringHandle {
  readonly __brand: "PCString";
}
function makePCStringHandle(): PCStringHandle {
  return { __brand: "PCString" } as PCStringHandle;
}

interface OZChannelPosition {
  readonly __brand: "OZChannelPosition";
  slot_0x8: (self: OZChannelPosition) => void;
}

interface ContourImpl {
  readonly __brand: "ContourImpl";
}

import type { CMTime } from "../infra/CMTime";

// -----------------------------------------------------------------------------
// OZShapeReparametrizedContour
// -----------------------------------------------------------------------------

export class OZShapeReparametrizedContour {
  // +0x00..0x10 — CMTime {value,timescale,flags} first 16 bytes.
  //   Written by `movaps 0x10(%rbp), %xmm1; movups %xmm1, (%rdi)` @0x5d35a8-0x5d35ac.
  public cmtime_lo16: [bigint, number, number] = [0n, 0, 0];

  // +0x10..0x18 — CMTime.epoch (int64).
  //   Written by `movq 0x20(%rbp), %rax; movq %rax, 0x10(%rdi)` @0x5d35af-0x5d35b3.
  public cmtime_epoch: bigint = 0n;

  // +0x18..0x28 — zero-initialized f64x2 (movups %xmm0 @0x5d3545)
  public block_18: [number, number] = [0.0, 0.0];

  // +0x28..0x38 — (-1.0, -1.0) f64x2 (movaps @0x7053c0 -> movups @0x5d3549-0x5d3550)
  public block_28: [number, number] = [0.0, 0.0];

  // f64 1.0 slots (movabsq $0x3ff0000000000000 splatted into +0x38/+0x60/+0x88/+0xb0)
  public f64_slot_38: number = 0.0;
  public f64_slot_60: number = 0.0;
  public f64_slot_88: number = 0.0;
  public f64_slot_b0: number = 0.0;

  // zero-init f64x2 slots at +0x40, +0x50, +0x68, +0x78, +0x90, +0xa0
  public block_40: [number, number] = [0.0, 0.0];
  public block_50: [number, number] = [0.0, 0.0];
  public block_68: [number, number] = [0.0, 0.0];
  public block_78: [number, number] = [0.0, 0.0];
  public block_90: [number, number] = [0.0, 0.0];
  public block_a0: [number, number] = [0.0, 0.0];

  // +0xb8 — uint32 (movl $0x01000000)
  public u32_b8: number = 0;

  // +0xc0..0x180 — 12 zeroed 16B slots (movups %xmm0 @0x5d35ff..0x5d360d
  //   for slots c0/d0/e0/f0/100/110/120/130/140/150/160/170).
  public block_c0_to_180: Array<[number, number]> = new Array(12)
    .fill(0)
    .map(() => [0.0, 0.0] as [number, number]);

  // +0x180 — OZChannelPosition* (owning)
  public contour_position: OZChannelPosition | null = null;

  // +0x188 — uint64 (set to 0 after ctor @0x5d36a6)
  public u64_188: bigint = 0n;

  // +0x190..0x1a8 — {begin,end,cap} raw ptrs (array 0)
  public arr0_begin: Uint8Array | null = null;
  public arr0_end: Uint8Array | null = null;
  public arr0_cap: Uint8Array | null = null;

  // +0x1a8..0x1c0 — {begin,end,cap} raw ptrs (array 1)
  public arr1_begin: Uint8Array | null = null;
  public arr1_end: Uint8Array | null = null;
  public arr1_cap: Uint8Array | null = null;

  // +0x1c0..0x1d0 — {begin,end} raw ptrs (array 2)
  public arr2_begin: Uint8Array | null = null;
  public arr2_end: Uint8Array | null = null;

  // +0x1d0 — uint64 (movq $0 @0x5d361b)
  public u64_1d0: bigint = 0n;

  //
  // Constructor. Takes CMTime by value (SysV ABI: 24-byte struct passed via
  // stack at [rbp+0x10..rbp+0x28]; our TS shim receives it as a struct).
  //
  // Body — exact mirror of asm @0x5d3530..0x5d36bd, plus the two cleanup
  // landing pads @0x5d36be..0x5d3759.
  //
  //   1. Zero-init +0x18..+0x28 (movups %xmm0=0 at +0x18).
  //   2. Load @0x7053c0 = (-1.0,-1.0) into xmm1; store to +0x28.
  //   3. Zero-init the 12 slots @+0xc0..+0x180.
  //   4. Copy CMTime: {value,timescale,flags} at +0x00, epoch at +0x10.
  //   5. Splat f64 1.0 into +0xb0, +0x88, +0x60, +0x38.
  //   6. Zero-init +0x40..0x60, +0x68..0x88, +0x90..0xb0.
  //   7. Store 0x01000000 at +0xb8 (movl).
  //   8. Zero-init +0x190..+0x1d0 (4 movups %xmm0) and set +0x1d0 = 0.
  //   9. operator new(0x2c0) -> allocate OZChannelPosition.
  //  10. Build temporary empty PCString name = "" on stack at [rbp-0x28].
  //  11. Lazy-init _contourImpl_singleton_slot: if null, operator new(0x30),
  //      run its C2, store into slot.
  //  12. OZChannelPosition::OZChannelPosition(name, nullptr, 0, 1,
  //      0x0823000A, 2).
  //  13. Store cp into this+0x180.
  //  14. Destroy the temporary PCString.
  //  15. Store 0 at this+0x188.
  //  16. Return.
  //
  // Cleanup pads:
  //   (A) @0x5d36be — ContourImpl allocation succeeded but its C2 threw:
  //         operator delete(the new ContourImpl); fall into (B).
  //   (B) @0x5d36cb / @0x5d36ce — OZChannelPosition ctor or later threw:
  //         destroy the local PCString; operator delete(cp); fall into (D).
  //   (C) @0x5d36d0 — PCString ctor threw before OZChannelPosition alloc:
  //         rdi=null (nothing to delete[]); fall straight into (D).
  //   (D) @0x5d36eb..0x5d3759 — release the three arrays at +0x1c0/+0x1a8/
  //         +0x190 (each "if non-null, canonicalize end-ptr, delete begin"),
  //         chain OZShapeContour::~OZShapeContour(), and rethrow via
  //         __Unwind_Resume.
  //
  // @from OZShapeReparametrizedContour::OZShapeReparametrizedContour(CMTime) @0x5d3530 (C2)
  //
  constructor(cmtime: CMTime) {
    // @0x5d3542-0x5d3545 — xmm0 = (0,0)
    const zero: [number, number] = [0.0, 0.0];
    // @0x5d3549-0x5d3550 — xmm1 = (-1,-1) from @0x7053c0
    const negOnePair: [number, number] = [CONST_NEG_ONE_PAIR_F64[0], CONST_NEG_ONE_PAIR_F64[1]];

    try {
      // @0x5d3545 — movups xmm0, 0x18(%rdi)
      this.block_18 = [zero[0], zero[1]];
      // @0x5d3550 — movups xmm1, 0x28(%rdi)
      this.block_28 = [negOnePair[0], negOnePair[1]];
      // @0x5d3554..0x5d35a1 — 12 x movups xmm0 at +0xc0..+0x170
      for (let i = 0; i < 12; i++) {
        this.block_c0_to_180[i] = [zero[0], zero[1]];
      }
      // @0x5d35a8-0x5d35ac — CMTime low 16B
      this.cmtime_lo16 = [cmtime.value, cmtime.timescale | 0, cmtime.flags >>> 0];
      // @0x5d35af-0x5d35b3 — CMTime.epoch
      this.cmtime_epoch = cmtime.epoch;
      // @0x5d35b7-0x5d35d3 — four splats of f64 1.0
      this.f64_slot_b0 = CONST_F64_ONE;
      this.f64_slot_88 = CONST_F64_ONE;
      this.f64_slot_60 = CONST_F64_ONE;
      this.f64_slot_38 = CONST_F64_ONE;
      // @0x5d35d7-0x5d35ee — 6 zero movups
      this.block_40 = [zero[0], zero[1]];
      this.block_50 = [zero[0], zero[1]];
      this.block_68 = [zero[0], zero[1]];
      this.block_78 = [zero[0], zero[1]];
      this.block_90 = [zero[0], zero[1]];
      this.block_a0 = [zero[0], zero[1]];
      // @0x5d35f5 — movl 0x01000000, 0xb8
      this.u32_b8 = CONST_U32_0x01000000;
      // @0x5d35ff..0x5d3614 — zero the three array triples (movups xmm0=0)
      this.arr0_begin = null;
      this.arr0_end = null;
      this.arr0_cap = null;
      this.arr1_begin = null;
      this.arr1_end = null;
      this.arr1_cap = null;
      this.arr2_begin = null;
      this.arr2_end = null;
      // @0x5d361b — movq $0, 0x1d0
      this.u64_1d0 = 0n;

      // @0x5d3626-0x5d362b — operator new(0x2c0)
      let cp: OZChannelPosition;
      try {
        cp = operator_new_size(SIZEOF_OZChannelPosition) as OZChannelPosition;
      } catch (e_new_cp) {
        // Compiler emits no local pad here — unwind bubbles to caller after
        // base OZShapeContour dtor runs implicitly. We match that by
        // chaining base D2 and rethrowing.
        OZShapeContour_D2(this);
        Unwind_Resume(e_new_cp);
      }
      // Give it a virtual-slot handle so D1 can call slot_0x8 uniformly.
      cp!.slot_0x8 = OZChannelPosition_vslot_0x8;

      // @0x5d3633-0x5d363e — PCString name = ""
      const name = makePCStringHandle();
      try {
        PCString_ctor_from_cstr(name, "");
      } catch (e_pcstring) {
        // Pad (C) @0x5d36d0 — PCString ctor threw. delete cp then fall
        // through into shared arrays-cleanup.
        operator_delete_void(cp!);
        this.freeArraysAndRethrow(e_pcstring);
      }

      try {
        // @0x5d3643-0x5d3667 — lazy-init _contourImpl_singleton_slot
        if (contourImpl_singleton_slot.value === null) {
          // @0x5d3652-0x5d3657 — operator new(0x30)
          const impl = operator_new_size(SIZEOF_ContourImpl) as ContourImpl;
          try {
            // @0x5d3662 — ContourImpl::ContourImpl(impl)
            ContourImpl_ctor(impl);
          } catch (e_impl_ctor) {
            // Pad (A) @0x5d36be — operator delete(impl); fall into (B).
            operator_delete_void(impl);
            throw e_impl_ctor;
          }
          // @0x5d3667 — *slot = impl
          contourImpl_singleton_slot.value = impl;
        }

        // @0x5d366a-0x5d3691 — OZChannelPosition ctor:
        //   rdi=cp, rsi=&name, edx=0, ecx=1, r8d=0x823000A, r9d=2
        //   plus two stack args at [rsp], [rsp+8] = (impl-singleton, 0)
        //   for the 7th/8th demangler params (OZChannelImpl*, OZChannelInfo*).
        // We pass all 8 to preserve the call shape.
        OZChannelPosition_ctor(
          cp!,
          name,
          null,
          0,
          1,
          OZCHANNEL_POSITION_ORDINAL_TOKEN,
          2,
          contourImpl_singleton_slot.value,
          0,
        );
      } catch (e_pos_ctor) {
        // Pad (B) @0x5d36cb — ~PCString(name); operator delete(cp); (D).
        PCString_dtor(name);
        operator_delete_void(cp!);
        this.freeArraysAndRethrow(e_pos_ctor);
      }

      // @0x5d3696 — this+0x180 = cp
      this.contour_position = cp!;

      // @0x5d369d-0x5d36a1 — ~PCString(&name)
      PCString_dtor(name);

      // @0x5d36a6 — this+0x188 = 0
      this.u64_188 = 0n;

      // @0x5d36b1..0x5d36bd — epilogue, retq
    } catch (e_outer) {
      // Any un-handled throw bubbling out of the top-level try lands here.
      // Sub-catches above already ran their local cleanup. Chain base D2
      // and rethrow — matching the C++ ABI's caller-visible unwind entry.
      OZShapeContour_D2(this);
      throw e_outer;
    }
  }

  //
  // Shared cleanup helper used by ctor landing pads (B) and (C). Mirrors
  // @0x5d36eb..0x5d3759: frees arrays at +0x1c0/+0x1a8/+0x190 (each with
  // the "canonicalize end-ptr then delete begin" idiom), chains base dtor,
  // rethrows via __Unwind_Resume.
  //
  private freeArraysAndRethrow(exn: unknown): never {
    // @0x5d36eb-0x5d36fe — arr2
    if (this.arr2_begin !== null) {
      // @0x5d36f7 — canonicalize (skipped; dead before delete)
      operator_delete_void(this.arr2_begin);
    }
    // @0x5d3703-0x5d3735 — arr1
    if (this.arr1_begin !== null) {
      // @0x5d372e — canonicalize
      operator_delete_void(this.arr1_begin);
    }
    // @0x5d373a-0x5d3749 — arr0
    if (this.arr0_begin !== null) {
      // @0x5d3742 — canonicalize
      operator_delete_void(this.arr0_begin);
    }
    // @0x5d371e-0x5d3721 / @0x5d374e-0x5d3751 — chain base dtor
    OZShapeContour_D2(this);
    // @0x5d3726-0x5d3729 / @0x5d3756-0x5d3759 — rethrow
    Unwind_Resume(exn);
  }

  //
  // Complete-object destructor.
  //
  // Body — exact mirror of asm @0x5d2fa0..0x5d3017:
  //   1. If contour_position non-null: call its virtual slot @+0x8 (release),
  //      then null the pointer.
  //   2. Free arr2/arr1/arr0 (if non-null) with the "canonicalize + delete
  //      begin" idiom.
  //   3. Tail-jmp to OZShapeContour::~OZShapeContour() (base D2).
  //
  // @from OZShapeReparametrizedContour::~OZShapeReparametrizedContour() @0x5d2fa0 (D1)
  //
  destroy(): void {
    // @0x5d2fa9-0x5d2fc6
    const cp = this.contour_position;
    if (cp !== null) {
      // @0x5d2fb5-0x5d2fb8 — movq (%rdi), %rax; callq *0x8(%rax)
      cp.slot_0x8(cp);
      // @0x5d2fbb — movq $0, 0x180
      this.contour_position = null;
    }
    // @0x5d2fc6-0x5d2fd9 — arr2
    if (this.arr2_begin !== null) {
      // @0x5d2fd2 — canonicalize
      operator_delete_void(this.arr2_begin);
    }
    // @0x5d2fde-0x5d2ff1 — arr1
    if (this.arr1_begin !== null) {
      // @0x5d2fea — canonicalize
      operator_delete_void(this.arr1_begin);
    }
    // @0x5d2ff6-0x5d3009 — arr0
    if (this.arr0_begin !== null) {
      // @0x5d3002 — canonicalize
      operator_delete_void(this.arr0_begin);
    }
    // @0x5d300e-0x5d3017 — jmp OZShapeContour::~OZShapeContour()
    OZShapeContour_D2(this);
  }
}
