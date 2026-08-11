// HGRenderJob — Helium render job (partial port).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice). Disassembly sources:
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob10SetUserTagEy.s          (SetUserTag)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetUserNameEPKc.s       (SetUserName)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob7SetTypeENS_4TypeE.s      (SetType)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob8SetStateENS_5StateE.s    (SetState)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetPriorityENS_8PriorityE.s (SetPriority)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetResourceENS_8ResourceE.s (SetResource)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetResourceENS_8ResourceE.s (SetResource)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob23SetRenderThreadPriorityENS_20RenderThreadPriorityE.s
//                                                                       (SetRenderThreadPriority)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob17SetGPUGraphicsAPIENS_14GPUGraphicsAPIE.s
//                                                                       (SetGPUGraphicsAPI)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob19UsesOnlyGPUResourceEv.s (UsesOnlyGPUResource)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob7GetTypeEv.s              (GetType)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob23SpecifiesComputeDevicesEv.s
//                                                                       (SpecifiesComputeDevices)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob12GetTypeLabelEv.s      (GetTypeLabel)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob19UsesOnlyCPUResourceEv.s (UsesOnlyCPUResource)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob17GetGPUGraphicsAPIEv.s   (GetGPUGraphicsAPI —
//                                                                       read only to pin the
//                                                                       +0x64 offset/width; the
//                                                                       getter itself is a
//                                                                       separate ledger entry)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob24IsRequestedVirtualScreenEi.s
//                                                                       (IsRequestedVirtualScreen)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11GetUserNameEv.s         (GetUserName)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob20SetVirtualScreenMaskEj.s
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob20GetVirtualScreenMaskEv.s
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob16SetVirtualScreenEi.s    (these three read only
//                                                                       to pin the +0xbc
//                                                                       offset/width and prove it
//                                                                       is a BITMASK; each is a
//                                                                       separate ledger entry)
//
// This file ports ONLY the methods listed under "Symbols ported here" below.
// HGRenderJob is a large class (fields at offsets 0xc8 and 0xd8 imply at
// least a 0xe0-byte layout); every other method is a separate ledger entry
// and will be added to THIS file (additive extension only) when it is
// claimed. Never a rewrite / drop of a currently-landed method.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered only for the touched offsets)
// -----------------------------------------------------------------------------
// HGRenderJob {
//   ...                          // fields 0x00..0x0b not yet decoded
//   uint32_t type;      // offset 0x0c — HGRenderJob::Type enum tag.
//                       // SetType @0x54514 writes it via `movl %esi, 0xc(%rdi)`.
//                       // Values not enumerated here; opaque u32.
//   ...                          // fields 0x10..0x6b not yet decoded
//   uint32_t state;     // offset 0x6c — HGRenderJob::State enum tag.
//                       // SetState @0x54644 writes it via `movl %esi, 0x6c(%rdi)`
//                       // and GetState @0x54744 reads it back via
//                       // `movl 0x6c(%rdi), %eax` — a matched 32-bit store/load
//                       // pair, which pins both the offset and the width.
//                       // Values not enumerated here; opaque u32.
//   uint32_t renderThreadPriority; // offset 0x70 — HGRenderJob::RenderThreadPriority
//                       // enum tag. SetRenderThreadPriority @0x544b4 writes it
//                       // via `movl %esi, 0x70(%rdi)`. Values not enumerated
//                       // here; opaque u32.
//   ...                          // fields 0x74..0xc7 not yet decoded
//   uint64_t userTag;   // offset 0xc8 — a user-supplied tag word; the
//                       // SetUserTag setter @0x54650 writes to it. The
//                       // matching getter (GetUserTag) is a separate
//                       // ledger entry not in this file's scope.
//   ...                          // fields 0xd0..0xd7 not yet decoded
//   char*    userName;  // offset 0xd8 — a heap-owned C-string (strdup'd
//                       // copy of the caller's buffer). SetUserName @0x54670
//                       // frees the old string if non-null, nulls the slot,
//                       // then (if the new arg is non-null) strdup's it and
//                       // stores the new pointer. Ownership: HGRenderJob's
//                       // dtor is responsible for the final free (separate
//                       // ledger entry, not in this file's scope).
//   ...                          // fields >0xe0 not yet decoded
// }
//
// The `movq %rsi, 0xc8(%rdi)` at @0x54654 stores the argument (%rsi = 2nd
// SysV integer arg, the `y` = unsigned long long) into `this[0xc8]`.
// SetUserName @0x54670 touches only `this[0xd8]`. There are no other stores.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   SetUserTag              — none.
//   SetUserName             — `_free` @0x3c513e (libc extern, outside port scope), and
//                             `_strdup` @0x3c5606 (libc extern, outside port scope). Both
//                             are modelled as boundary stubs; see externs section below.
//   SetType                 — none.
//   SetRenderThreadPriority — none.
//   SetGPUGraphicsAPI       — none.
//   UsesOnlyGPUResource     — none.
//   GetUserName             — none (no call at all; the only non-register operand is the
//                             rip-relative "" literal at @Helium 0x8f69cc).
//   GetType                 — none (5-instruction leaf load of this+0x0c).
//   SetState                — none.
//   GetTypeLabel            — none. Reads this+0x0c and two static __TEXT literals
//                             (the offset table @0x3cb988 and the unknown-label
//                             cstring @0x8d9ee5); no calls at all.
//   UsesOnlyCPUResource     — none.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN11HGRenderJob10SetUserTagEy
//       — HGRenderJob::SetUserTag(unsigned long long) @Helium 0x54650
//   * __ZN11HGRenderJob7SetTypeENS_4TypeE
//       — HGRenderJob::SetType(HGRenderJob::Type) @Helium 0x54510
//   * __ZN11HGRenderJob11SetUserNameEPKc
//       — HGRenderJob::SetUserName(char const*) @Helium 0x54670
//   * __ZN11HGRenderJob11SetPriorityENS_8PriorityE
//       — HGRenderJob::SetPriority(HGRenderJob::Priority) @Helium 0x544a0
//   * __ZN11HGRenderJob11SetResourceENS_8ResourceE
//       — HGRenderJob::SetResource(HGRenderJob::Resource) @Helium 0x54380
//   * __ZN11HGRenderJob23SetRenderThreadPriorityENS_20RenderThreadPriorityE
//       — HGRenderJob::SetRenderThreadPriority(HGRenderJob::RenderThreadPriority) @Helium 0x544b0
//   * __ZN11HGRenderJob17SetGPUGraphicsAPIENS_14GPUGraphicsAPIE
//       — HGRenderJob::SetGPUGraphicsAPI(HGRenderJob::GPUGraphicsAPI) @Helium 0x54490
//   * __ZN11HGRenderJob19UsesOnlyGPUResourceEv
//       — HGRenderJob::UsesOnlyGPUResource() @Helium 0x54b20
//   * __ZN11HGRenderJob7GetTypeEv
//       — HGRenderJob::GetType() @Helium 0x54730
//   * __ZN11HGRenderJob12GetTypeLabelEv
//       — HGRenderJob::GetTypeLabel() @Helium 0x53f30
//   * __ZN11HGRenderJob19UsesOnlyCPUResourceEv
//       — HGRenderJob::UsesOnlyCPUResource() @Helium 0x54b90
//   * __ZN11HGRenderJob24IsRequestedVirtualScreenEi
//       — HGRenderJob::IsRequestedVirtualScreen(int) @Helium 0x54ad0
//   * __ZN11HGRenderJob11GetUserNameEv
//       — HGRenderJob::GetUserName() @Helium 0x54820
//   * __ZN11HGRenderJob8SetStateENS_5StateE
//       — HGRenderJob::SetState(HGRenderJob::State) @Helium 0x54640
//   * __ZN11HGRenderJob23SpecifiesComputeDevicesEv
//       — HGRenderJob::SpecifiesComputeDevices() @Helium 0x54bf0
//
// -----------------------------------------------------------------------------
// FULL DISASM — IsRequestedVirtualScreen @0x54ad0
// -----------------------------------------------------------------------------
//   0x54ad0  pushq  %rbp                    ; frame prologue
//   0x54ad1  movq   %rsp, %rbp
//   0x54ad4  testl  %esi, %esi              ; flags on screen & screen -> SF = sign(screen)
//   0x54ad6  js     0x54ae6                 ; SF=1 (screen < 0) -> the false tail
//   0x54ad8  movl   0xbc(%rdi), %eax        ; eax = this->virtualScreenMask (u32 load)
//   0x54ade  movl   %esi, %ecx              ; ecx = screen (only CL is used by the shift)
//   0x54ae0  shrl   %cl, %eax               ; LOGICAL right shift; x86 masks the count to
//                                           ; 5 bits for a 32-bit operand, so the machine
//                                           ; shifts by (screen & 31) — NOT a saturating or
//                                           ; zeroing shift. screen=32 re-tests bit 0.
//   0x54ae2  andb   $0x1, %al               ; keep bit 0 -> the bool return value
//   0x54ae4  popq   %rbp                    ; epilogue
//   0x54ae5  retq
//   0x54ae6  xorl   %eax, %eax              ; false tail: eax = 0
//   0x54ae8  andb   $0x1, %al               ; (redundant mask the compiler kept)
//   0x54aea  popq   %rbp                    ; epilogue
//   0x54aeb  retq
//   0x54aec  nopl   (%rax)                  ; padding
//
// `testl %esi,%esi ; js` is the standard signed-negative test: `test` ANDs the
// operand with itself, so SF is simply bit 31 of `screen`, and `js` takes the
// branch exactly when screen < 0. There is NO upper-bound check — the only
// thing that keeps screen>=32 in range is the hardware's 5-bit shift-count
// mask, which the port reproduces with JS `>>>` (ECMA-262 ToUint32 + `& 31`,
// the same masking rule). Modelling it as "return false for screen >= 32"
// would be a rewrite, and the oracle below measures the difference: 170 of
// 1,600 cases.
//
// The field at +0xbc is pinned as a u32 BITMASK by three sibling methods (each
// its own ledger entry, read here only for the layout, exactly as
// GetGPUGraphicsAPI was used for +0x64):
//   SetVirtualScreenMask(unsigned) @0x545d0  — `movl %esi, 0xbc(%rdi)`  (u32 store)
//   GetVirtualScreenMask()         @0x54af0  — `movl 0xbc(%rdi), %eax`  (u32 load)
//   SetVirtualScreen(int)          @0x545b0  — `movl $0x1,%eax ; movl %esi,%ecx ;
//                                               shll %cl,%eax ; movl %eax,0xbc(%rdi)`
//                                              i.e. mask = 1 << (screen & 31), which is
//                                              what makes "bit N = screen N" certain
//                                              rather than inferred.
//
// -----------------------------------------------------------------------------
// FULL DISASM — SetUserTag @0x54650
// -----------------------------------------------------------------------------
//   0x54650  pushq  %rbp                              ; frame prologue
//   0x54651  movq   %rsp, %rbp
//   0x54654  movq   %rsi, 0xc8(%rdi)                  ; this->userTag = arg
//                                                    ; (%rdi = this, %rsi = tag)
//   0x5465b  popq   %rbp                              ; epilogue
//   0x5465c  retq
//   0x5465d  nopl   (%rax)                            ; padding
//
// -----------------------------------------------------------------------------
// FULL DISASM — SetUserName @0x54670
// -----------------------------------------------------------------------------
//   0x54670  pushq  %rbp                              ; frame prologue
//   0x54671  movq   %rsp, %rbp
//   0x54674  pushq  %r14                              ; save callee-saved
//   0x54676  pushq  %rbx
//   0x54677  movq   %rsi, %r14                        ; r14 = name (arg, %rsi)
//   0x5467a  movq   %rdi, %rbx                        ; rbx = this (%rdi)
//   0x5467d  movq   0xd8(%rdi), %rdi                  ; rdi = this->userName
//   0x54684  testq  %rdi, %rdi                        ; if (userName == null)
//   0x54687  je     0x54699                           ;   skip the free
//   0x54689  callq  0x3c513e ## symbol stub for: _free ; free(userName)
//   0x5468e  movq   $0x0, 0xd8(%rbx)                  ; this->userName = null
//   0x54699  testq  %r14, %r14                        ; if (name == null)
//   0x5469c  je     0x546ad                           ;   skip the strdup
//   0x5469e  movq   %r14, %rdi                        ; rdi = name
//   0x546a1  callq  0x3c5606 ## symbol stub for: _strdup ; rax = strdup(name)
//   0x546a6  movq   %rax, 0xd8(%rbx)                  ; this->userName = rax
//   0x546ad  popq   %rbx                              ; epilogue
//   0x546ae  popq   %r14
//   0x546b0  popq   %rbp
//   0x546b1  retq
//   0x546b2  nopw   %cs:(%rax,%rax)                   ; padding
//
// The compare-branch pattern here is x86 `testq r,r; je L`: `testq r14,r14`
// is a bitwise-AND of the pointer with itself which sets ZF iff the pointer
// is zero, and `je` branches on ZF=1. So both `je` sites are the classic
// "if the pointer is null, skip the libc call" guard — modelled below with
// a plain JS truthiness test on the string / stored slot.
//
// -----------------------------------------------------------------------------
// FULL DISASM — SetRenderThreadPriority @0x544b0
// -----------------------------------------------------------------------------
//   0x544b0  pushq  %rbp                              ; frame prologue
//   0x544b1  movq   %rsp, %rbp
//   0x544b4  movl   %esi, 0x70(%rdi)                  ; this->renderThreadPriority = arg (u32)
//                                                    ; (%rdi = this, %esi = enum value)
//   0x544b7  popq   %rbp                              ; epilogue
//   0x544b8  retq
//   0x544b9  nopl   (%rax)                            ; padding
//
// A pure setter — 6-line body, one 32-bit store, no callees, no branches.
//
// LIBC EXTERNS (out-of-scope boundary stubs) — the two symbol stubs above
// call into libSystem (libc), NOT into any FCP framework. Per the port
// discipline (see raw-port/army/PORTING_SPEC.md Rule 3 & the DEP-WORKER
// brief) they are modelled as boundary stubs; the SetUserName body below
// uses local `_free` / `_strdup` helpers that document the ABI at the
// citation address and delegate to plain-JS equivalents (JS has GC'd
// strings, so `free` is a no-op and `strdup` returns the string as-is).

/**
 * HGRenderJob::Type — enum tag stored at +0x0c. Values are not yet enumerated
 * here; SetType passes `esi` (an unsigned 32-bit int) straight into the slot.
 * Model as an opaque u32 alias until a ctor / other setters pin the enum values.
 */
export type HGRenderJobType = number;

/**
 * HGRenderJob::Priority — enum tag stored at +0x68. Values are not yet enumerated
 * here; SetPriority @0x544a0 passes `esi` (an unsigned 32-bit int) straight into
 * the slot via `movl %esi, 0x68(%rdi)`. Model as an opaque u32 alias until a ctor
 * / other setters pin the enum values.
 */
export type HGRenderJobPriority = number;

/**
 * HGRenderJob::Resource — enum tag stored at +0x10. Values are not yet enumerated
 * here; SetResource @0x54380 passes `esi` (an unsigned 32-bit int) straight into
 * the slot via `movl %esi, 0x10(%rdi)`. Model as an opaque u32 alias until a ctor
 * / other setters pin the enum values.
 */
export type HGRenderJobResource = number;

/**
 * HGRenderJob::RenderThreadPriority — enum tag stored at +0x70. Values are not
 * yet enumerated here; SetRenderThreadPriority passes `esi` (an unsigned 32-bit
 * int) straight into the slot. Model as an opaque u32 alias until a ctor or
 * other setter pins the enum values.
 */
export type HGRenderJobRenderThreadPriority = number;

/**
 * HGRenderJob::MetalShaderPrecision — enum tag stored at +0x88. Values are not
 * yet enumerated here: `SetMetalShaderPrecision` @Helium 0x54504 passes `esi`
 * (an unsigned 32-bit int) straight into the slot with no validation, masking
 * or branching, and its reader `GetMetalShaderPrecision` @Helium 0x54794 hands
 * the same 32 bits back (`movl 0x88(%rdi), %eax`), so no decoded instruction
 * pins a single enumerator. Model as an opaque u32 alias until a ctor or a
 * comparison site reveals the values — same treatment as
 * `HGRenderJobRenderThreadPriority` above.
 */
export type HGRenderJobMetalShaderPrecision = number;

/**
 * HGRenderJob::GPUGraphicsAPI — enum tag stored at +0x64. Values are not yet
 * enumerated here: `SetGPUGraphicsAPI` @Helium 0x54494 passes `esi` (an unsigned
 * 32-bit int) straight into the slot with no validation, masking or branching,
 * and its reader `GetGPUGraphicsAPI` @Helium 0x547f4 hands the same 32 bits back
 * (`movl 0x64(%rdi), %eax`), so no decoded instruction pins a single enumerator.
 * That matched 32-bit store/load pair is what fixes both the offset and the
 * width. Model as an opaque u32 alias until a ctor or a comparison site reveals
 * the values — same treatment as `HGRenderJobMetalShaderPrecision` above.
 */
export type HGRenderJobGPUGraphicsAPI = number;

/**
 * HGRenderJob::State — enum tag stored at +0x6c. Values are not yet enumerated
 * here: `SetState` @Helium 0x54644 passes `esi` (an unsigned 32-bit int) straight
 * into the slot with no validation, masking or branching, and its reader
 * `GetState` @Helium 0x54744 hands the same 32 bits back
 * (`movl 0x6c(%rdi), %eax`), so no decoded instruction pins a single enumerator.
 * That matched 32-bit store/load pair is what fixes both the offset and the
 * width. Model as an opaque u32 alias until a ctor or a comparison site reveals
 * the values — same treatment as `HGRenderJobGPUGraphicsAPI` above.
 */
export type HGRenderJobState = number;

/**
 * The pointee shape that `UsesOnlyGPUResource` @Helium 0x54b20 dereferences — both at
 * `this+0x18` (`cmpl $0x1, 0x8(%rcx)` @0x54b40) and for every entry of the vector at
 * `this+0x28..+0x30` (`cmpl $0x0, 0x8(%rax)` @0x54b74). Only the u32 at +0x08 is read by
 * any decoded instruction, so only that word is modelled; naming the rest would be the
 * magic-offset guesswork PORTING_SPEC Rule 5 forbids.
 */
export interface HGRenderJobTaggedRef {
  /** +0x08 (u32) — compared against 1 @0x54b40 and against 0 @0x54b74. */
  tag08: number;
}

/**
 * HGRenderJob::Type -> label table, read by GetTypeLabel @Helium 0x53f30.
 *
 * The machine does NOT store 9 pointers; it stores 9 **self-relative int32
 * offsets** in `__TEXT,__const` at @Helium 0x3cb988, and reconstructs each
 * pointer as `tableBase + int32[i]` (`movslq (%rcx,%rax,4), %rax` @0x53f44
 * followed by `addq %rcx, %rax` @0x53f48, where %rcx = 0x3cb988 was formed by
 * `leaq 0x377a44(%rip), %rcx` @0x53f3d — rip after that 7-byte insn is
 * 0x53f44, and 0x53f44 + 0x377a44 = 0x3cb988). Every offset below is NEGATIVE,
 * i.e. the strings sit just *before* the table.
 *
 * Each entry is a fixed-width 30-character label, space-padded on the right in
 * the binary. The padding is part of the C string (the NUL follows the last
 * space), so it is reproduced verbatim here — trimming it would change what
 * this function returns.
 *
 * Every string address below was read out of the x86_64 slice of Helium and
 * independently confirmed by CALLING the real exported symbol (see the ORACLE
 * note on GetTypeLabel).
 */
const HG_RENDER_JOB_TYPE_LABELS: readonly string[] = [
  /** [0] table word @Helium 0x3cb988 = 0xfffffed8 (int32 -296) -> string @0x3cb860 */
  "kTypeRender                   ",
  /** [1] table word @Helium 0x3cb98c = 0xffffffb1 (int32 -79) -> string @0x3cb939 */
  "kTypeSynchronousRender        ",
  /** [2] table word @Helium 0x3cb990 = 0xfffffef7 (int32 -265) -> string @0x3cb87f */
  "kTypeCopyCPUBitmapToGPUTexture",
  /** [3] table word @Helium 0x3cb994 = 0xffffff16 (int32 -234) -> string @0x3cb89e */
  "kTypeXGMIBufferCopy           ",
  /** [4] table word @Helium 0x3cb998 = 0xffffff35 (int32 -203) -> string @0x3cb8bd */
  "kTypeDeleteHGRenderJob        ",
  /** [5] table word @Helium 0x3cb99c = 0xffffff54 (int32 -172) -> string @0x3cb8dc */
  "kTypeDeleteHGRenderNode       ",
  /** [6] table word @Helium 0x3cb9a0 = 0xffffff73 (int32 -141) -> string @0x3cb8fb */
  "kTypeDeleteHGGLTexture        ",
  /** [7] table word @Helium 0x3cb9a4 = 0xffffff92 (int32 -110) -> string @0x3cb91a */
  "kTypeCustom                   ",
  /** [8] table word @Helium 0x3cb9a8 = 0xffffffd0 (int32 -48) -> string @0x3cb958 */
  "kTypeSynchronousCustom        ",
];

/**
 * The out-of-range fallback label returned by GetTypeLabel @Helium 0x53f30.
 *
 * Loaded by `leaq 0x885f91(%rip), %rax` @0x53f4d; rip after that 7-byte insn
 * is 0x53f54, and 0x53f54 + 0x885f91 = @Helium 0x8d9ee5 (`__TEXT,__cstring`).
 * otool annotates the same instruction `## literal pool for: "?????? unknown
 * job type ???????"`, which matches the bytes read from the slice.
 *
 * NOTE the asymmetry, which is real and must not be "tidied": this string is
 * 31 characters (6 leading `?`, 7 trailing `?`) and is NOT space-padded to the
 * table's 30-character width.
 */
const HG_RENDER_JOB_UNKNOWN_TYPE_LABEL = "?????? unknown job type ???????";

/**
 * `HGRenderJob` — Helium render job. This file ports the setters listed in
 * "Symbols ported here" (see file header); every other method is a
 * separate ledger entry. Field offsets not yet decoded are omitted; the
 * visible members are `userTag` at offset 0xc8 and `userName` at 0xd8.
 */
export class HGRenderJob {
  /** @Helium HGRenderJob@0x0c — the u32 HGRenderJob::Type enum tag.
   *  Written by SetType @0x54514. Zero-initialised to a neutral tag until
   *  a ctor is transcribed to reveal the true default. */
  _type: HGRenderJobType = 0; // @Helium HGRenderJob@0x0c

  /** @Helium HGRenderJob@0x68 — the u32 HGRenderJob::Priority enum tag.
   *  Written by SetPriority @0x544a4 via `movl %esi, 0x68(%rdi)`. Zero-
   *  initialised until a ctor pins the true default. */
  _priority: HGRenderJobPriority = 0; // @Helium HGRenderJob@0x68

  /** @Helium HGRenderJob@0x6c — the u32 HGRenderJob::State enum tag.
   *  Written by SetState @0x54644 via a single `movl %esi, 0x6c(%rdi)`, and read
   *  back by GetState @0x54744 via `movl 0x6c(%rdi), %eax` — a matched 32-bit
   *  store/load pair, which is what fixes both the offset and the width.
   *  Confirmed by calling the live pair on a 0xAA-filled buffer under
   *  `arch -x86_64`: only the four bytes at +0x6c change. Zero-initialised to a
   *  neutral tag until a ctor is transcribed to reveal the true default. */
  state: HGRenderJobState = 0; // @Helium HGRenderJob@0x6c

  /** @Helium HGRenderJob@0x10 — the u32 HGRenderJob::Resource enum tag.
   *  Written by SetResource @0x54384 via `movl %esi, 0x10(%rdi)`. Zero-
   *  initialised until a ctor pins the true default. */
  _resource: HGRenderJobResource = 0; // @Helium HGRenderJob@0x10

  /** @Helium HGRenderJob@0xc8 — the user-supplied tag word. Written by
   *  SetUserTag @0x54654; read by the matching getter (separate ledger
   *  entry). Stored as bigint because it is a 64-bit value with no
   *  sign convention and callers may set values that exceed 2^53. */
  userTag: bigint = 0n; // @Helium HGRenderJob@0xc8

  /** @Helium HGRenderJob@0xd8 — a heap-owned C-string (null when unset).
   *  Written by SetUserName @0x5468e / @0x546a6; read by the matching
   *  GetUserName getter (separate ledger entry). Modelled as `string |
   *  null` because JS has GC'd strings — the machine's owning-pointer
   *  semantics reduce to "the field either holds a string or is null". */
  userName: string | null = null; // @Helium HGRenderJob@0xd8

  /** @Helium HGRenderJob@0x70 — the u32 HGRenderJob::RenderThreadPriority
   *  enum tag. Written by SetRenderThreadPriority @0x544b4 via a single
   *  `movl %esi, 0x70(%rdi)`. Zero-initialised to a neutral tag until a
   *  ctor is transcribed to reveal the true default. */
  renderThreadPriority: HGRenderJobRenderThreadPriority = 0; // @Helium HGRenderJob@0x70

  /** @Helium HGRenderJob@0x88 — the u32 HGRenderJob::MetalShaderPrecision
   *  enum tag. Written by SetMetalShaderPrecision @0x54504 via a single
   *  `movl %esi, 0x88(%rdi)`, and read back by GetMetalShaderPrecision
   *  @0x54794 via `movl 0x88(%rdi), %eax` — a matched 32-bit store/load pair,
   *  which is what fixes both the offset and the width. Zero-initialised to a
   *  neutral tag until a ctor is transcribed to reveal the true default. */
  metalShaderPrecision: HGRenderJobMetalShaderPrecision = 0; // @Helium HGRenderJob@0x88

  /** @Helium HGRenderJob@0x64 — the u32 HGRenderJob::GPUGraphicsAPI enum tag.
   *  Written by SetGPUGraphicsAPI @0x54494 via a single `movl %esi, 0x64(%rdi)`,
   *  and read back by GetGPUGraphicsAPI @0x547f4 via `movl 0x64(%rdi), %eax` — a
   *  matched 32-bit store/load pair, which is what fixes both the offset and the
   *  width. Confirmed by calling the live pair on a 0xAA-filled buffer: only the
   *  four bytes at +0x64 change. Zero-initialised to a neutral tag until a ctor is
   *  transcribed to reveal the true default. */
  gpuGraphicsAPI: HGRenderJobGPUGraphicsAPI = 0; // @Helium HGRenderJob@0x64

  /** @Helium HGRenderJob@0x18 — a nullable pointer to a tagged object whose u32 at
   *  +0x08 is compared against 1 by UsesOnlyGPUResource @0x54b40
   *  (`cmpl $0x1, 0x8(%rcx)`). Nothing else in the decoded methods touches it, so
   *  only the tag word is modelled; the pointee's remaining layout is undecoded. */
  taggedRef18: HGRenderJobTaggedRef | null = null; // @Helium HGRenderJob@0x18

  /** @Helium HGRenderJob@0x28 / +0x30 — begin/end of a std::vector of 16-BYTE entries
   *  (`addq $0x10` stride @0x54b5f/0x54b80), each of which starts with a pointer that
   *  UsesOnlyGPUResource dereferences at +0x08 (`movq -0x10(%rdx), %rax ; cmpl $0x0,
   *  0x8(%rax)` @0x54b70). Modelled as the array of pointed-to objects, so `.length`
   *  is the (end-begin)/16 the machine computes; the other 8 bytes of each entry are
   *  not read by any decoded method. */
  taggedRefs: Array<HGRenderJobTaggedRef> = []; // @Helium HGRenderJob@0x28..+0x30

  /** @Helium HGRenderJob@0x50 — an 8-byte slot that UsesOnlyGPUResource tests only for
   *  non-null (`cmpq $0x0, 0x50(%rdi)` @0x54b46). Its type is undecoded, so it is
   *  modelled as an opaque nullable reference. */
  slot50: unknown | null = null; // @Helium HGRenderJob@0x50

  /** @Helium HGRenderJob@0xbc — the u32 virtual-screen BITMASK (bit N set = virtual
   *  screen N is requested). Read by IsRequestedVirtualScreen @0x54ad8 via
   *  `movl 0xbc(%rdi), %eax`; the same dword is written by SetVirtualScreenMask
   *  @0x545d4 (`movl %esi, 0xbc(%rdi)`), read back by GetVirtualScreenMask @0x54af4
   *  (`movl 0xbc(%rdi), %eax`) — a matched 32-bit store/load pair that fixes both the
   *  offset and the width — and set to a single bit by SetVirtualScreen @0x545c1
   *  (`movl $0x1,%eax ; shll %cl,%eax ; movl %eax,0xbc(%rdi)`), which is what proves
   *  the dword is a per-screen bit set rather than a screen index. Held as an
   *  unsigned 32-bit value. Zero-initialised (no screens requested) until a ctor is
   *  transcribed to reveal the true default. */
  virtualScreenMask: number = 0; // @Helium HGRenderJob@0xbc

  /**
   * `HGRenderJob::SetUserTag(unsigned long long)` @Helium 0x54650
   * (__ZN11HGRenderJob10SetUserTagEy).
   *
   * Faithful line-for-line transcription: writes the argument to the
   * userTag field at `this+0xc8`. No callees, no side effects, no
   * threading barriers — the disasm is a single 8-byte store between
   * a frame prologue and a `retq`.
   *
   * @param tag  the tag value (SysV %rsi at call site).
   */
  SetUserTag(tag: bigint): void {
    // ------------------------------------------------------------
    // @0x54650..0x54651 — prologue (no TS-visible effect).
    // @0x54654 — movq %rsi, 0xc8(%rdi)  →  this->userTag = tag
    // @0x5465b..0x5465c — epilogue + retq.
    // ------------------------------------------------------------
    this.userTag = tag;
  }

  /**
   * `HGRenderJob::SetType(HGRenderJob::Type)` @Helium 0x54510
   * (__ZN11HGRenderJob7SetTypeENS_4TypeE).
   *
   * Faithful line-for-line transcription of a 6-line function: writes the
   * u32 argument to the +0x0c slot. No callees, no side effects. From
   * raw-port/re/disasm/Helium.__ZN11HGRenderJob7SetTypeENS_4TypeE.s:
   *
   *   0x54510  pushq %rbp                    ; frame prologue
   *   0x54511  movq  %rsp, %rbp
   *   0x54514  movl  %esi, 0xc(%rdi)         ; this->_type (u32) = esi
   *   0x54517  popq  %rbp                    ; epilogue
   *   0x54518  retq
   *   0x54519  nopl  (%rax)                  ; padding
   *
   * @param type — HGRenderJob::Type enum value (SysV %esi, u32).
   */
  SetType(type: HGRenderJobType): void {
    // ------------------------------------------------------------
    // @0x54510..0x54511 — prologue (no TS-visible effect).
    // @0x54514 — movl %esi, 0xc(%rdi) : store u32 at offset +0x0c.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x54517..0x54518 — epilogue + retq.
    // ------------------------------------------------------------
    this._type = type >>> 0;
  }

  /**
   * `HGRenderJob::SetUserName(char const*)` @Helium 0x54670
   * (__ZN11HGRenderJob11SetUserNameEPKc).
   *
   * Line-for-line transcription:
   *   1. Load old `this->userName` (0xd8 slot). If non-null,
   *      call libc `free(old)` and set the slot to null. Nulling
   *      the slot BEFORE the strdup call matches the machine
   *      (`movq $0x0, 0xd8(%rbx)` @0x5468e) — an out-of-memory /
   *      throwing strdup would leave the field observably null,
   *      not dangling at the freed pointer.
   *   2. If the new `name` argument is non-null, call libc
   *      `strdup(name)` and store the returned pointer in the
   *      0xd8 slot (`movq %rax, 0xd8(%rbx)` @0x546a6). If the
   *      argument is null, leave the slot as its post-free null.
   *
   * Signature note: the C prototype takes a `char const*` — passing
   * `null` is the "clear this field" idiom and the disasm handles it
   * (the second `je` @0x5469c). We model that as `string | null`.
   *
   * @param name  the new user name (a copy is taken via `_strdup`),
   *              or `null` to clear the field.
   */
  SetUserName(name: string | null): void {
    // ------------------------------------------------------------
    // @0x54670..0x54677 — prologue + arg saves (no TS effect).
    // @0x5467d — movq 0xd8(%rdi), %rdi   ; rdi = this->userName
    // @0x54684..0x54687 — testq %rdi,%rdi; je 0x54699
    //                     (skip the free branch if userName == null)
    // ------------------------------------------------------------
    const oldName = this.userName; // @0x5467d
    if (oldName !== null) {
      // @0x54689 — callq _free  ; free(this->userName)
      _free(oldName);
      // @0x5468e — movq $0x0, 0xd8(%rbx)  ; this->userName = null
      this.userName = null;
    }

    // ------------------------------------------------------------
    // @0x54699..0x5469c — testq %r14,%r14; je 0x546ad
    //                     (skip the strdup branch if name == null)
    // ------------------------------------------------------------
    if (name !== null) {
      // @0x5469e..0x546a1 — movq %r14,%rdi ; callq _strdup
      //                     rax = strdup(name)
      const copy = _strdup(name);
      // @0x546a6 — movq %rax, 0xd8(%rbx)  ; this->userName = rax
      this.userName = copy;
    }

    // @0x546ad..0x546b1 — epilogue + retq.
  }

  /**
   * `HGRenderJob::SetPriority(HGRenderJob::Priority)` @Helium 0x544a0
   * (__ZN11HGRenderJob11SetPriorityENS_8PriorityE).
   *
   * Faithful line-for-line transcription of a 6-line function: writes the
   * u32 argument to the +0x68 slot. No callees, no side effects. From
   * raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetPriorityENS_8PriorityE.s:
   *
   *   0x544a0  pushq %rbp                    ; frame prologue
   *   0x544a1  movq  %rsp, %rbp
   *   0x544a4  movl  %esi, 0x68(%rdi)        ; this->_priority (u32) = esi
   *   0x544a7  popq  %rbp                    ; epilogue
   *   0x544a8  retq
   *   0x544a9  nopl  (%rax)                  ; padding
   *
   * This is the exact same body-shape as SetType (above, @0x54510) — a
   * bare u32 store into a fixed offset — with a different slot (+0x68
   * vs +0x0c) and a different enum-arg tag (HGRenderJob::Priority vs
   * HGRenderJob::Type). Model 32-bit truncation with `>>> 0` so a
   * negative/oversized JS number stores the same bit-pattern the
   * machine would; the disasm uses `movl` (32-bit), not `movq`.
   *
   * @param priority — HGRenderJob::Priority enum value (SysV %esi, u32).
   */
  SetPriority(priority: HGRenderJobPriority): void {
    // ------------------------------------------------------------
    // @0x544a0..0x544a1 — prologue (no TS-visible effect).
    // @0x544a4 — movl %esi, 0x68(%rdi) : store u32 at offset +0x68.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x544a7..0x544a8 — epilogue + retq.
    // ------------------------------------------------------------
    this._priority = priority >>> 0;
  }

  /**
   * `HGRenderJob::SetResource(HGRenderJob::Resource)` @Helium 0x54380
   * (__ZN11HGRenderJob11SetResourceENS_8ResourceE).
   *
   * Faithful line-for-line transcription of a 6-line function: writes the
   * u32 argument to the +0x10 slot. No callees, no side effects. From
   * raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetResourceENS_8ResourceE.s:
   *
   *   0x54380  pushq %rbp                    ; frame prologue
   *   0x54381  movq  %rsp, %rbp
   *   0x54384  movl  %esi, 0x10(%rdi)        ; this->_resource (u32) = esi
   *   0x54387  popq  %rbp                    ; epilogue
   *   0x54388  retq
   *   0x54389  nopl  (%rax)                  ; padding
   *
   * This is the exact same body-shape as SetType (@0x54510) and SetPriority
   * (@0x544a0) — a bare u32 store into a fixed offset — with slot +0x10 and
   * the HGRenderJob::Resource enum-arg tag. Model 32-bit truncation with
   * `>>> 0` so a negative/oversized JS number stores the same bit-pattern the
   * machine would; the disasm uses `movl` (32-bit), not `movq`.
   *
   * @param resource — HGRenderJob::Resource enum value (SysV %esi, u32).
   */
  SetResource(resource: HGRenderJobResource): void {
    // ------------------------------------------------------------
    // @0x54380..0x54381 — prologue (no TS-visible effect).
    // @0x54384 — movl %esi, 0x10(%rdi) : store u32 at offset +0x10.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x54387..0x54388 — epilogue + retq.
    // ------------------------------------------------------------
    this._resource = resource >>> 0;
  }

  /**
   * `HGRenderJob::SetRenderThreadPriority(HGRenderJob::RenderThreadPriority)`
   *   @Helium 0x544b0
   *   (__ZN11HGRenderJob23SetRenderThreadPriorityENS_20RenderThreadPriorityE)
   *
   * Faithful line-for-line transcription of a 6-line function: writes the
   * u32 argument to the `renderThreadPriority` slot at `this+0x70`. No
   * callees, no side effects. From raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob23SetRenderThreadPriorityENS_20RenderThreadPriorityE.s:
   *
   *   0x544b0  pushq %rbp                    ; frame prologue
   *   0x544b1  movq  %rsp, %rbp
   *   0x544b4  movl  %esi, 0x70(%rdi)        ; this->renderThreadPriority (u32) = esi
   *   0x544b7  popq  %rbp                    ; epilogue
   *   0x544b8  retq
   *   0x544b9  nopl  (%rax)                  ; padding
   *
   * @param priority — HGRenderJob::RenderThreadPriority enum value
   *                   (SysV %esi, u32; the width is `movl`, so a 32-bit
   *                   store).
   */
  SetRenderThreadPriority(priority: HGRenderJobRenderThreadPriority): void {
    // ------------------------------------------------------------
    // @0x544b0..0x544b1 — prologue (no TS-visible effect).
    // @0x544b4 — movl %esi, 0x70(%rdi) : store u32 at offset +0x70.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x544b7..0x544b8 — epilogue + retq.
    // ------------------------------------------------------------
    this.renderThreadPriority = priority >>> 0;
  }

  /**
   * `HGRenderJob::SetGPUGraphicsAPI(HGRenderJob::GPUGraphicsAPI)` @Helium 0x54490
   *   (__ZN11HGRenderJob17SetGPUGraphicsAPIENS_14GPUGraphicsAPIE)
   *
   * Faithful line-for-line transcription of the whole 6-line function: one u32
   * store into the `gpuGraphicsAPI` slot at `this+0x64`. Structural twin of
   * `SetRenderThreadPriority` / `SetMetalShaderPrecision` above, a different slot.
   * No callees, no validation, no branches. From raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob17SetGPUGraphicsAPIENS_14GPUGraphicsAPIE.s:
   *
   *   0x54490  pushq %rbp                    ; frame prologue
   *   0x54491  movq  %rsp, %rbp
   *   0x54494  movl  %esi, 0x64(%rdi)        ; this->gpuGraphicsAPI (u32) = esi
   *   0x54497  popq  %rbp                    ; epilogue
   *   0x54498  retq
   *   0x54499  nopl  (%rax)                  ; padding
   *
   * The offset and width are pinned by the matching reader `GetGPUGraphicsAPI`
   * @Helium 0x547f4 (`movl 0x64(%rdi), %eax`), and confirmed by DIFFERENTIAL
   * against the live binary: both symbols are exported (`nm` class T), so calling
   * the pair through dlsym on a 0x200-byte buffer pre-filled with 0xAA, under
   * `arch -x86_64` (the port's addresses are x86_64 offsets), gives for each of
   * 0, 1, 2, 0x12345678, 0x80000000 and 0xffffffff: the four bytes at +0x64 hold
   * the value, `GetGPUGraphicsAPI` returns it, and EVERY other byte of the buffer
   * is still 0xAA — i.e. the setter really is this single store and touches
   * nothing else.
   *
   * @param api — HGRenderJob::GPUGraphicsAPI enum value (SysV %esi, u32).
   */
  SetGPUGraphicsAPI(api: HGRenderJobGPUGraphicsAPI): void {
    // ------------------------------------------------------------
    // @0x54490..0x54491 — prologue (no TS-visible effect).
    // @0x54494 — movl %esi, 0x64(%rdi) : store u32 at offset +0x64.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x54497..0x54498 — epilogue + retq.
    // ------------------------------------------------------------
    this.gpuGraphicsAPI = api >>> 0;
  }

  /**
   * `HGRenderJob::UsesOnlyGPUResource()` @Helium 0x54b20
   *   (__ZN11HGRenderJob19UsesOnlyGPUResourceEv)
   *
   * Full transcription of the 40-line body (raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob19UsesOnlyGPUResourceEv.s). Returns `bool` in %al.
   *
   *   0x54b20  movl  0x10(%rdi), %ecx        ; ecx = this->_resource (u32 @+0x10)
   *   0x54b23  movb  $0x1, %al               ; default answer = true
   *   0x54b25  leal  -0x2(%rcx), %edx        ; edx = resource - 2
   *   0x54b28  cmpl  $0x4, %edx
   *   0x54b2b  jae   0x54b2e                 ; UNSIGNED >= 4 -> keep going
   *   0x54b2d  retq                          ;   else return true (no frame was built)
   *   0x54b2e  cmpl  $0x6, %ecx
   *   0x54b31  jne   0x54b4f                 ; resource != 6 -> 0x54b4f: xorl %eax,%eax; ret
   *   0x54b33  pushq %rbp ; movq %rsp,%rbp
   *   0x54b37  movq  0x18(%rdi), %rcx        ; rcx = this->taggedRef18
   *   0x54b3b  testq %rcx, %rcx
   *   0x54b3e  je    0x54b46                 ; null -> skip the tag test
   *   0x54b40  cmpl  $0x1, 0x8(%rcx)
   *   0x54b44  je    0x54b4d                 ; tag08 == 1 -> return true (al still 1)
   *   0x54b46  cmpq  $0x0, 0x50(%rdi)
   *   0x54b4b  je    0x54b52                 ; slot50 == null -> walk the vector
   *   0x54b4d  popq  %rbp ; retq             ;   else return true
   *   0x54b4f  xorl  %eax, %eax ; retq       ; the resource != 6 exit -> false
   *   0x54b52  movq  0x28(%rdi), %rdx        ; rdx = vector begin
   *   0x54b56  movq  0x30(%rdi), %rcx        ; rcx = vector end
   *   0x54b5a  cmpq  %rcx, %rdx
   *   0x54b5d  je    0x54b88                 ; EMPTY vector -> 0x54b88: xorl %eax,%eax -> false
   *   0x54b5f  addq  $0x10, %rdx             ; pre-advance; entries are 16 bytes
   *   0x54b70  movq  -0x10(%rdx), %rax       ; rax = entry[i].ptr
   *   0x54b74  cmpl  $0x0, 0x8(%rax)
   *   0x54b78  setne %al                     ; al = (ptr->tag08 != 0)
   *   0x54b7b  je    0x54b4d                 ; a ZERO tag returns immediately with al = 0
   *   0x54b7d  cmpq  %rcx, %rdx
   *   0x54b80  leaq  0x10(%rdx), %rdx
   *   0x54b84  jne   0x54b70                 ; loop while the pre-increment cursor != end
   *   0x54b86  jmp   0x54b4d                 ; ran out -> return al, which is 1
   *
   * So: resource in {2,3,4,5} is unconditionally GPU-only; anything other than 6 is not;
   * and resource == 6 is GPU-only when EITHER `taggedRef18->tag08 == 1` OR `slot50` is
   * non-null, else when the +0x28 vector is non-empty and EVERY entry's `tag08` is
   * non-zero. An empty vector on that last path answers FALSE.
   *
   * Note the two branches that are easy to invert: `cmpl $0x4,%edx ; jae` is UNSIGNED, so
   * resource 0 and 1 wrap to 0xfffffffe/0xffffffff and take the `jae` (they are NOT in the
   * true set); and `je 0x54b52` fires when slot50 IS null, i.e. the vector walk is the
   * fallback, not the primary test.
   *
   * DIFFERENTIAL against the live binary (exported `T`, so dlsym reaches it; run under
   * `arch -x86_64`): raw-port/re/oracle/HGRenderJob_UsesOnlyGPUResource_oracle.py builds
   * synthetic jobs — every resource value 0..8, taggedRef18 null / tag 0 / 1 / 2, slot50
   * null or not, and vectors of length 0..3 with every tag combination — and compares the
   * live answer to this body: 2,880 cases, 1,522 TRUE / 1,358 FALSE, 0 divergences.
   *
   * @returns true when the job needs only GPU resources.
   */
  UsesOnlyGPUResource(): boolean {
    // @0x54b20/0x54b25/0x54b28 — UNSIGNED (resource - 2) < 4, i.e. resource in {2,3,4,5}
    const resource = this._resource >>> 0;
    if (((resource - 2) >>> 0) < 4) return true; // @0x54b2b jae not taken -> @0x54b2d ret al=1
    // @0x54b2e/0x54b31 — anything but 6 is false
    if (resource !== 6) return false; // @0x54b4f xorl %eax,%eax ; retq
    // @0x54b37..0x54b44 — taggedRef18 != null && taggedRef18->tag08 == 1 -> true
    const ref = this.taggedRef18;
    if (ref !== null && (ref.tag08 >>> 0) === 1) return true; // @0x54b44 je -> @0x54b4d (al=1)
    // @0x54b46/0x54b4b — slot50 non-null -> true; null -> fall through to the vector walk
    if (this.slot50 !== null && this.slot50 !== undefined) return true; // @0x54b4d (al=1)
    // @0x54b52..0x54b5d — an empty vector answers false
    const refs = this.taggedRefs;
    if (refs.length === 0) return false; // @0x54b88 xorl %eax,%eax
    // @0x54b70..0x54b84 — every entry's tag08 must be non-zero; the first zero returns false
    for (let i = 0; i < refs.length; i++) {
      if ((refs[i].tag08 >>> 0) === 0) return false; // @0x54b78 setne al=0 ; @0x54b7b je
    }
    return true; // @0x54b86 jmp 0x54b4d with al = 1 from the last setne
  }

  /**
   * `HGRenderJob::SpecifiesComputeDevices()` @Helium 0x54bf0
   *   (__ZN11HGRenderJob23SpecifiesComputeDevicesEv)
   *
   * Full transcription of the 19-line body (raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob23SpecifiesComputeDevicesEv.s). Returns `bool` in %al.
   *
   *   0x54bf0  pushq %rbp                    ; frame prologue
   *   0x54bf1  movq  %rsp, %rbp
   *   0x54bf4  cmpl  $0x6, 0x10(%rdi)        ; compare this->_resource (u32 @+0x10) with 6
   *                                          ;   -- FLAGS DEAD, see the note below
   *   0x54bf8  movq  0x18(%rdi), %rcx        ; rcx = this->taggedRef18
   *   0x54bfc  movb  $0x1, %al               ; default answer = true
   *   0x54bfe  testq %rcx, %rcx              ; (this is what actually sets the flags)
   *   0x54c01  je    0x54c05                 ; taggedRef18 == null -> keep testing
   *   0x54c03  popq  %rbp ; retq             ;   else return true
   *   0x54c05  cmpq  $0x0, 0x50(%rdi)
   *   0x54c0a  jne   0x54c03                 ; slot50 != null -> return true
   *   0x54c0c  movq  0x28(%rdi), %rcx        ; rcx = vector begin
   *   0x54c10  cmpq  0x30(%rdi), %rcx        ; AT&T: computes rcx - this->[+0x30] (begin - end)
   *   0x54c14  jne   0x54c03                 ; begin != end (NON-EMPTY vector) -> return true
   *   0x54c16  xorl  %eax, %eax              ; all three empty -> false
   *   0x54c18  popq  %rbp
   *   0x54c19  retq
   *   0x54c1a  nopw  (%rax,%rax)             ; padding — not executed
   *
   * So the predicate is a plain three-way "is anything set?": TRUE when the +0x18
   * pointer is non-null, OR the +0x50 slot is non-null, OR the +0x28..+0x30 vector is
   * non-empty; FALSE only when all three are empty. It is the same field trio that
   * `UsesOnlyGPUResource` @0x54b20 (above) reads, which is what pins the offsets — but
   * this method reads ONLY the pointers/emptiness. It never dereferences `taggedRef18`
   * and never walks the vector, so no `tag08` and no vector element participates.
   *
   * THE DEAD COMPARE @0x54bf4 IS REAL AND IS TRANSCRIBED AS A NO-OP. `cmpl $0x6,
   * 0x10(%rdi)` sets the flags from `_resource - 6`, but nothing consumes them: the two
   * instructions that follow (`movq`, `movb`) do not touch flags, and `testq %rcx, %rcx`
   * @0x54bfe overwrites them before the only conditional branch (`je` @0x54c01) reads
   * them. The `$0x6` is the same resource tag `UsesOnlyGPUResource` branches on
   * (`cmpl $0x6, %ecx` @0x54b2e), so this is the residue of an inlined predicate whose
   * result the optimiser folded away. It is kept here as a documented load-and-discard
   * rather than deleted, because the instruction IS in the body; it has no effect on the
   * return value, and the differential below proves that empirically (the answer is
   * invariant across every resource value 0..8, including 6).
   *
   * DIFFERENTIAL against the live binary (exported `T` @0x54bf0, so dlsym reaches it; run
   * under `arch -x86_64` because every address here is an x86_64 offset):
   * raw-port/re/oracle/HGRenderJob_SpecifiesComputeDevices_oracle.py builds synthetic jobs
   * over resource 0..8 x {ref18 null, tag 0, 1, 2} x {slot50 null, non-null} x vectors of
   * length 0..3 with every tag combination — 2,880 cases, 2,871 TRUE / 9 FALSE,
   * **0 divergences**. The 9 FALSE cases are exactly the all-three-empty jobs, one per
   * resource value, which is also the empirical proof that the @0x54bf4 compare is dead:
   * resource 6 answers FALSE there like every other resource.
   * NEGATIVE CONTROLS (measured on the same corpus, each a plausible mis-read of the
   * body): gating the whole thing on `_resource == 6` (i.e. treating the dead compare as
   * live) diverges on 2,552 cases; requiring ALL three fields rather than any diverges on
   * 1,818; inverting the empty-vector branch (`jne` @0x54c14) diverges on 360; and copying
   * the sibling's `taggedRef18->tag08 == 1` dereference instead of testing the pointer
   * diverges on 18 (only the 18 jobs where a non-null ref18 carries a tag other than 1 and
   * nothing else is set can tell those two models apart — few, but the corpus does contain
   * them, and the live binary sides with the pointer test).
   *
   * @returns true when the job specifies compute devices.
   */
  SpecifiesComputeDevices(): boolean {
    // @0x54bf4 — cmpl $0x6, 0x10(%rdi): the u32 at +0x10 is read and compared with 6,
    //   but the flags are dead (clobbered by `testq` @0x54bfe before the `je` @0x54c01).
    //   Transcribed as an explicit load-and-discard so the instruction is not silently
    //   dropped; `void` documents that the machine's own result is unused too.
    void (this._resource >>> 0);
    // @0x54bf8/@0x54bfc/@0x54bfe/@0x54c01 — rcx = taggedRef18; al = 1; branch if null.
    if (this.taggedRef18 !== null) return true; // @0x54c03 popq %rbp ; retq with al = 1
    // @0x54c05/@0x54c0a — cmpq $0x0, 0x50(%rdi) ; jne: a non-null slot50 returns true.
    if (this.slot50 !== null && this.slot50 !== undefined) return true; // @0x54c03 (al = 1)
    // @0x54c0c/@0x54c10/@0x54c14 — begin(+0x28) != end(+0x30), i.e. a NON-EMPTY vector,
    //   returns true. `.length !== 0` is exactly that pointer inequality: the array models
    //   the [begin, end) range, so begin == end is length 0.
    if (this.taggedRefs.length !== 0) return true; // @0x54c14 jne -> @0x54c03 (al = 1)
    // @0x54c16..0x54c19 — xorl %eax,%eax ; epilogue ; retq.
    return false;
  }

  /**
   * `HGRenderJob::UsesOnlyCPUResource()` @Helium 0x54b90
   *   (__ZN11HGRenderJob19UsesOnlyCPUResourceEv)
   *
   * Full transcription of the 34-line body (raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob19UsesOnlyCPUResourceEv.s). Returns `bool` in %al. The
   * mirror twin of `UsesOnlyGPUResource` @0x54b20 above — same three data sources
   * (`_resource` @+0x10, `taggedRef18` @+0x18, the 16-byte-stride vector @+0x28/+0x30),
   * INVERTED tag polarity (CPU wants `tag08 == 0`, GPU wanted `!= 0`), a single-value
   * fast path instead of a range, and NO `slot50` test at all.
   *
   *   0x54b90  movl  0x10(%rdi), %ecx        ; ecx = this->_resource (u32 @+0x10)
   *   0x54b93  movb  $0x1, %al               ; default answer = true
   *   0x54b95  cmpl  $0x1, %ecx              ; flags on (resource - 1)
   *   0x54b98  je    0x54bea                 ; resource == 1 -> 0x54bea retq, al still 1 -> TRUE
   *   0x54b9a  cmpl  $0x6, %ecx
   *   0x54b9d  jne   0x54be8                 ; resource != 6 -> 0x54be8 xorl %eax,%eax ; retq -> FALSE
   *   0x54b9f  pushq %rbp                    ; (frame built only on the resource == 6 path)
   *   0x54ba0  movq  %rsp, %rbp
   *   0x54ba3  movq  0x18(%rdi), %rcx        ; rcx = this->taggedRef18
   *   0x54ba7  testq %rcx, %rcx
   *   0x54baa  je    0x54bb2                 ; null -> skip the tag test, go walk the vector
   *   0x54bac  cmpl  $0x0, 0x8(%rcx)         ; flags on (taggedRef18->tag08 - 0)
   *   0x54bb0  je    0x54be6                 ; tag08 == 0 -> 0x54be6 popq/retq with al = 1 -> TRUE
   *   0x54bb2  movq  0x28(%rdi), %rdx        ; rdx = vector begin
   *   0x54bb6  movq  0x30(%rdi), %rcx        ; rcx = vector end
   *   0x54bba  cmpq  %rcx, %rdx              ; flags on (begin - end)
   *   0x54bbd  je    0x54beb                 ; EMPTY vector -> 0x54beb xorl %eax,%eax -> FALSE
   *   0x54bbf  addq  $0x10, %rdx             ; pre-advance the cursor; entries are 16 bytes
   *   0x54bc3  nopw  %cs:(%rax,%rax)         ; alignment padding — not executed
   *   0x54bd0  movq  -0x10(%rdx), %rax       ; rax = entry[i].ptr (first qword of the entry)
   *   0x54bd4  cmpl  $0x0, 0x8(%rax)         ; flags on (ptr->tag08 - 0)
   *   0x54bd8  sete  %al                     ; al = (ptr->tag08 == 0)   [sete does NOT touch flags]
   *   0x54bdb  jne   0x54be6                 ; a NON-zero tag returns immediately with al = 0 -> FALSE
   *   0x54bdd  cmpq  %rcx, %rdx              ; cursor (one entry past the one just read) vs end
   *   0x54be0  leaq  0x10(%rdx), %rdx        ; advance 16 bytes  [lea does NOT touch flags]
   *   0x54be4  jne   0x54bd0                 ; loop while that pre-increment cursor != end
   *   0x54be6  popq  %rbp
   *   0x54be7  retq                          ; returns al
   *   0x54be8  xorl  %eax, %eax              ; the resource != 6 exit (no frame was built)
   *   0x54bea  retq
   *   0x54beb  xorl  %eax, %eax              ; the empty-vector exit
   *   0x54bed  popq  %rbp
   *   0x54bee  retq
   *   0x54bef  nop                           ; padding
   *
   * So: resource == 1 is unconditionally CPU-only; anything other than 1 or 6 is not;
   * and resource == 6 is CPU-only when `taggedRef18` is non-null with `tag08 == 0`,
   * else when the +0x28 vector is NON-EMPTY and EVERY entry's `tag08` is zero. An empty
   * vector on that fallback path answers FALSE, exactly as in the GPU twin.
   *
   * Branches that are easy to invert, per the AT&T `dst - src` rule (PORTING_SPEC):
   * `cmpl $0x1, %ecx ; je` is `ecx - 1`, so it fires on resource == 1 and jumps PAST the
   * `xorl %eax,%eax` at 0x54be8 to the bare `retq` at 0x54bea — the `movb $0x1, %al` at
   * 0x54b93 is still live, so that exit is TRUE, not FALSE. And the loop's `jne 0x54be6`
   * at 0x54bdb reads the flags of the `cmpl` at 0x54bd4 (the intervening `sete` leaves
   * flags alone), so it exits on a NON-zero tag carrying the al = 0 that `sete` just wrote.
   *
   * DIFFERENTIAL against the live binary (exported `T`, so dlsym reaches it; run under
   * `arch -x86_64` because every address above is an x86_64 offset):
   * raw-port/re/oracle/HGRenderJob_UsesOnlyCPUResource_oracle.py builds synthetic jobs
   * over resource 0..8 x {taggedRef18 null, tag 0, 1, 2} x {+0x50 zero, non-zero} x
   * vectors of length 0..3 with every tag combination in {0,1,2}: 2,880 cases,
   * 418 TRUE / 2,462 FALSE, **0 divergences**.
   *
   * That corpus is measured to be DISCRIMINATING, not vacuous — five plausible mis-reads of
   * this same body are each rejected by it: the GPU twin's `tag != 0` polarity (234 wrong),
   * reading `je 0x54bea` as the FALSE exit (320 wrong), reading the empty-vector exit as
   * TRUE (6 wrong), copying the GPU twin's `(resource-2) < 4` range fast path (1,600 wrong),
   * and dropping the +0x18 short-circuit (74 wrong).
   *
   * The corpus also carries the +0x50 dimension that the GPU twin does branch on, and pairs
   * of cases differing ONLY in that byte give the same live answer in 1,440 of 1,440 pairs —
   * measured confirmation that this method really has no `slot50` test.
   *
   * @returns true when the job needs only CPU resources.
   */
  UsesOnlyCPUResource(): boolean {
    // @0x54b90/0x54b93/0x54b95/0x54b98 — resource == 1 returns the default al = 1.
    const resource = this._resource >>> 0;
    if (resource === 1) return true; // @0x54b98 je -> @0x54bea retq (al = 1)
    // @0x54b9a/0x54b9d — anything but 6 falls out through the xorl at @0x54be8.
    if (resource !== 6) return false; // @0x54be8 xorl %eax,%eax ; @0x54bea retq
    // @0x54ba3..0x54bb0 — taggedRef18 != null && taggedRef18->tag08 == 0 -> true.
    const ref = this.taggedRef18;
    if (ref !== null && (ref.tag08 >>> 0) === 0) return true; // @0x54bb0 je -> @0x54be6 (al = 1)
    // @0x54bb2..0x54bbd — an empty vector answers false.
    const refs = this.taggedRefs;
    if (refs.length === 0) return false; // @0x54bbd je -> @0x54beb xorl %eax,%eax
    // @0x54bd0..0x54be4 — every entry's tag08 must be ZERO; the first non-zero returns false.
    for (let i = 0; i < refs.length; i++) {
      if ((refs[i].tag08 >>> 0) !== 0) return false; // @0x54bd8 sete al=0 ; @0x54bdb jne
    }
    return true; // @0x54be4 falls through to @0x54be6 with al = 1 from the last sete
  }

  /**
   * `HGRenderJob::SetMetalShaderPrecision(HGRenderJob::MetalShaderPrecision)`
   *   @Helium 0x54500
   *   (__ZN11HGRenderJob23SetMetalShaderPrecisionENS_20MetalShaderPrecisionE)
   *
   * Faithful line-for-line transcription of a 7-line function: writes the u32
   * argument to the `metalShaderPrecision` slot at `this+0x88`. Structural twin
   * of `SetRenderThreadPriority` above, one slot over. No callees, no
   * validation, no side effects. From raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob23SetMetalShaderPrecisionENS_20MetalShaderPrecisionE.s:
   *
   *   0x54500  pushq %rbp                    ; frame prologue
   *   0x54501  movq  %rsp, %rbp
   *   0x54504  movl  %esi, 0x88(%rdi)        ; this->metalShaderPrecision (u32) = esi
   *   0x5450a  popq  %rbp                    ; epilogue
   *   0x5450b  retq
   *   0x5450c  nopl  (%rax)                  ; padding — not executed
   *
   * The width is `movl`, so a 32-bit store; nothing adjacent is touched and the
   * enum value is stored verbatim (no mask, no range check, no branch).
   *
   * ORACLE: verified against the live Helium binary. Both this setter and its
   * reader `GetMetalShaderPrecision` @0x54790 are EXPORTED (`nm` type `T`), so
   * the harness dlopens Helium under `arch -x86_64 /usr/bin/python3` (the port
   * is transcribed from the x86_64 slice), calls the real setter on a 0x200-byte
   * buffer pre-filled with 0xEE, and then checks (a) the raw dword at +0x88,
   * (b) the value the real getter returns, and (c) that no other byte of the
   * buffer changed. 1,536 cases over 0, 1, 2, 3, 0x7fffffff, 0x80000000,
   * 0xffffffff and random u32s: 1536/1536 agreed with this port on all three
   * checks — the stored dword, the real getter's round-trip, and the untouched
   * remainder (zero buffers showed a collateral write, so the store really is
   * the 4 bytes at +0x88 and nothing else).
   * NEGATIVE CONTROLS (measured): storing only 16 bits -> 1238 of 1536 wrong;
   * sign-extending with `| 0` instead of `>>> 0` -> 630 wrong; writing the
   * neighbouring renderThreadPriority slot instead -> 1494 wrong.
   *
   * @param precision — HGRenderJob::MetalShaderPrecision enum value
   *                    (SysV %esi, u32).
   */
  SetMetalShaderPrecision(precision: HGRenderJobMetalShaderPrecision): void {
    // ------------------------------------------------------------
    // @0x54500..0x54501 — prologue (no TS-visible effect).
    // @0x54504 — movl %esi, 0x88(%rdi) : store u32 at offset +0x88.
    //   `>>> 0` models the 32-bit truncation, so a negative / oversized JS
    //   number stores the same bit-pattern the machine would (identical
    //   treatment to SetRenderThreadPriority above).
    // @0x5450a..0x5450b — epilogue + retq.
    // ------------------------------------------------------------
    this.metalShaderPrecision = precision >>> 0;
  }

  /**
   * `HGRenderJob::SetState(HGRenderJob::State)` @Helium 0x54640
   *   (__ZN11HGRenderJob8SetStateENS_5StateE)
   *
   * Faithful line-for-line transcription of the whole 6-line function: one u32
   * store into the `state` slot at `this+0x6c`. Structural twin of
   * `SetGPUGraphicsAPI` / `SetRenderThreadPriority` above, a different slot.
   * No callees, no validation, no branches. From raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob8SetStateENS_5StateE.s:
   *
   *   0x54640  pushq %rbp                    ; frame prologue
   *   0x54641  movq  %rsp, %rbp
   *   0x54644  movl  %esi, 0x6c(%rdi)        ; this->state (u32) = esi
   *   0x54647  popq  %rbp                    ; epilogue
   *   0x54648  retq
   *   0x54649  nopl  (%rax)                  ; padding
   *
   * The offset and width are pinned by the matching reader `GetState`
   * @Helium 0x54740 (`movl 0x6c(%rdi), %eax` @0x54744), and confirmed by
   * DIFFERENTIAL against the live binary: both symbols are exported (`nm` class
   * T), so calling the pair through dlsym on a 0x200-byte buffer pre-filled with
   * 0xAA, under `arch -x86_64` (the port's addresses are x86_64 offsets, and the
   * arm64 slice can differ — a wrong-slice oracle fails silently toward
   * VERIFIED), gives across 513 cases (0, 1, 2, 3, 7, 0xaaaaaaaa, 0xffffffff,
   * 0x12345678, 0x80000000, 0xdeadbeef, 0x100000000, 0x1ffffffff,
   * 0xffffffffffffffff and 500 random 64-bit words): the four bytes at +0x6c
   * hold the LOW 32 bits little-endian, `GetState` returns exactly those 32 bits,
   * and EVERY other byte of the buffer is still 0xAA — i.e. the setter really is
   * this single 32-bit store, it truncates rather than widening, and it touches
   * nothing else. A second store overwrites the slot outright (Set(0xffffffff)
   * then Set(1) leaves `01000000`), confirming a plain `movl` and not a
   * read-modify-write.
   *
   * @param state — HGRenderJob::State enum value (SysV %esi, u32).
   */
  SetState(state: HGRenderJobState): void {
    // ------------------------------------------------------------
    // @0x54640..0x54641 — prologue (no TS-visible effect).
    // @0x54644 — movl %esi, 0x6c(%rdi) : store u32 at offset +0x6c.
    //   Model 32-bit truncation with `>>> 0` so a negative / oversized
    //   JS number stores the same bit-pattern the machine would.
    // @0x54647..0x54648 — epilogue + retq.
    // ------------------------------------------------------------
    this.state = state >>> 0;
  }

  /**
   * `HGRenderJob::IsRequestedVirtualScreen(int)` @Helium 0x54ad0
   * (__ZN11HGRenderJob24IsRequestedVirtualScreenEi).
   *
   * Tests one bit of the virtual-screen mask at `this+0xbc`: returns true iff
   * virtual screen `screen` is in the requested set. A negative index short-
   * circuits to false through the `js` tail at @0x54ae6; there is no upper-bound
   * check at all, so a large index is folded by the hardware's 5-bit shift-count
   * mask (`shrl %cl` on a 32-bit operand shifts by `screen & 31`). See the FULL
   * DISASM block in the file header for the line-by-line decode.
   *
   * ORACLE: verified against the live Helium binary. The symbol is EXPORTED
   * (`nm -arch x86_64` type `T` @0x54ad0), so the harness dlopens Helium under
   * `arch -x86_64 /usr/bin/python3` — the port is transcribed from the x86_64
   * slice and calling the arm64 image would compare against code this port did
   * not transcribe — and calls the real method on a 0x200-byte object pre-filled
   * with 0xEE, with the mask dword planted at +0xbc. 1,600 cases (32 masks: 0, 1,
   * 2, 0x80000000, 0xffffffff, 0xAAAAAAAA, 0x55555555, 0xEEEEEEEE + 24 random
   * u32s; x 50 screen indices: -4..39, 63, 64, 127, INT_MAX, INT_MIN, -1):
   * 1600/1600 bit-identical to this port, and 0 cases mutated any byte of the
   * object (it is a pure read), with the real GetVirtualScreenMask @0x54af0
   * confirming the planted dword on every call.
   * NEGATIVE CONTROLS (measured, same 1,600 cases): dropping the negative-screen
   * guard -> 84 wrong; treating screen >= 32 as false instead of masking the
   * shift count to 5 bits -> 170 wrong; always testing bit 0 -> 616 wrong;
   * reading the neighbouring dword at +0xb8 -> 750 wrong.
   *
   * @param screen — the virtual-screen index (SysV %esi, signed int).
   * @returns whether that screen's bit is set in `virtualScreenMask`.
   */
  IsRequestedVirtualScreen(screen: number): boolean {
    // ------------------------------------------------------------
    // @0x54ad0..0x54ad1 — prologue (no TS-visible effect).
    // @0x54ad4 — testl %esi, %esi : flags on `screen & screen`, so SF = bit 31.
    // @0x54ad6 — js 0x54ae6 : taken iff screen < 0.
    // ------------------------------------------------------------
    if (screen < 0) {
      // @0x54ae6 — xorl %eax, %eax ; @0x54ae8 — andb $0x1, %al : return false.
      // @0x54aea..0x54aeb — epilogue + retq.
      return false;
    }
    // ------------------------------------------------------------
    // @0x54ad8 — movl 0xbc(%rdi), %eax : load the u32 mask.
    // @0x54ade — movl %esi, %ecx      : shift count (CL) = screen.
    // @0x54ae0 — shrl %cl, %eax       : logical right shift by (screen & 31).
    //   JS `>>>` applies ToUint32 to both operands and masks the count with
    //   `& 31`, which is exactly the x86 32-bit shift-count rule — so the
    //   screen >= 32 wrap-around is reproduced, not approximated.
    // @0x54ae2 — andb $0x1, %al       : keep bit 0 as the bool result.
    // @0x54ae4..0x54ae5 — epilogue + retq.
    // ------------------------------------------------------------
    return (((this.virtualScreenMask >>> 0) >>> screen) & 1) !== 0;
  }

  /**
   * `HGRenderJob::GetType()` -> `HGRenderJob::Type`
   *   @Helium 0x54730
   *   (__ZN11HGRenderJob7GetTypeEv)
   *
   * The plain reader for the `Type` tag at `this+0x0c` — the exact slot
   * `SetType` @0x54514 writes with `movl %esi, 0xc(%rdi)`. A 5-instruction
   * leaf: no callees, no branches, no validation, no side effects, and the
   * enum value is returned verbatim (nothing is masked or range-checked, so an
   * out-of-enum value set by SetType comes straight back out).
   *
   * Full body from raw-port/re/disasm/Helium.__ZN11HGRenderJob7GetTypeEv.s:
   *
   *   0x54730  pushq %rbp                    ; frame prologue
   *   0x54731  movq  %rsp, %rbp
   *   0x54734  movl  0xc(%rdi), %eax         ; eax = this->_type (u32 @+0x0c)
   *   0x54737  popq  %rbp                    ; epilogue
   *   0x54738  retq
   *   0x54739  nopl  (%rax)                  ; padding — not executed
   *
   * The load is `movl` (32-bit) into `%eax`, and the SysV return convention
   * for a 32-bit enum is `%eax`, so the caller sees an UNSIGNED 32-bit value.
   * `>>> 0` models that; `| 0` would be wrong and the oracle below measures
   * exactly that difference.
   *
   * ORACLE — verified against the live Helium binary. Both this getter
   * (`0000000000054730 T`) and the real `SetType` (`0000000000054510 T`) are
   * exported, so the harness dlopens Helium under `arch -x86_64
   * /usr/bin/python3` (the port is transcribed from the x86_64 slice — see
   * OPS_LOG on the arm64 mismatch) and runs three checks over 3,070 cases
   * (exhaustive 0..63, plus 0x7fffffff / 0x80000000 / 0xffffffff / 0xfffffffe
   * / 0x0000ffff / 0xffff0000, plus 3,000 random u32s):
   *   (a) write the dword at +0x0c directly, call the real getter — 3070/3070
   *       equal to this port;
   *   (b) round-trip through the REAL SetType, then the real getter —
   *       3070/3070, which also confirms getter and setter share one slot;
   *   (c) repeat (a) with the rest of the 0x200-byte object poisoned 0x5A
   *       instead of 0xEE — 3070/3070 unchanged, so no other field is read.
   * NEGATIVE CONTROLS (measured): reading 16 bits instead of 32 -> 3005/3070
   * wrong; reading the neighbouring +0x10 slot -> 3070/3070 wrong; and for
   * signedness, FCP returns 2147483648 for the stored 0x80000000, so `| 0`
   * (which yields -2147483648) is measurably the wrong model.
   *
   * @returns the HGRenderJob::Type enum tag as an unsigned 32-bit value.
   */
  GetType(): HGRenderJobType {
    // ------------------------------------------------------------
    // @0x54730..0x54731 — prologue (no TS-visible effect).
    // @0x54734 — movl 0xc(%rdi), %eax : 32-bit load of the Type slot.
    //   `>>> 0` reproduces the unsigned 32-bit width of the %eax return, so
    //   a field holding 0x80000000 reads back as 2147483648 (what the binary
    //   returns), not -2147483648.
    // @0x54737..0x54738 — epilogue + retq.
    // ------------------------------------------------------------
    return this._type >>> 0;
  }

  /**
   * `HGRenderJob::GetTypeLabel()` -> `char const*`
   *   @Helium 0x53f30
   *   (__ZN11HGRenderJob12GetTypeLabelEv)
   *
   * Returns a static, non-owned C string naming this job's `Type` tag. The
   * machine reads the u32 at `this+0x0c` (the same slot `SetType` @0x54514
   * writes), rejects anything above 8 with a fixed "unknown" literal, and
   * otherwise indexes a 9-entry self-relative offset table in `__TEXT,__const`.
   * No callees, no allocation, no writes — the returned pointer is into
   * read-only `__TEXT`, so the caller must not free it (modelled here as a
   * plain immutable JS string, which has the same non-owning value semantics).
   *
   * Full body from raw-port/re/disasm/
   * Helium.__ZN11HGRenderJob12GetTypeLabelEv.s (15 lines):
   *
   *   0x53f30  pushq   %rbp                       ; frame prologue
   *   0x53f31  movq    %rsp, %rbp
   *   0x53f34  movl    0xc(%rdi), %eax            ; eax = this->_type (u32 @+0x0c)
   *                                               ;   movl ZERO-EXTENDS into rax
   *   0x53f37  cmpq    $0x8, %rax                 ; flags on (rax - 8)
   *   0x53f3b  ja      0x53f4d                    ; CF=0 & ZF=0 -> rax > 8  (UNSIGNED)
   *                                               ;   -> take the unknown-label path
   *   0x53f3d  leaq    0x377a44(%rip), %rcx       ; rcx = 0x53f44 + 0x377a44 = 0x3cb988
   *                                               ;   (the offset table base)
   *   0x53f44  movslq  (%rcx,%rax,4), %rax        ; rax = (int32)table[type]  SIGN-extended
   *   0x53f48  addq    %rcx, %rax                 ; rax = tableBase + table[type]
   *   0x53f4b  popq    %rbp                       ; epilogue
   *   0x53f4c  retq                               ; return that char*
   *   0x53f4d  leaq    0x885f91(%rip), %rax       ; rax = 0x53f54 + 0x885f91 = 0x8d9ee5
   *                                               ;   "?????? unknown job type ???????"
   *   0x53f54  popq    %rbp                       ; epilogue
   *   0x53f55  retq
   *   0x53f56  nopw    %cs:(%rax,%rax)            ; padding — not executed
   *
   * DECODE NOTES (AT&T; a compare computes `dst - src`, per PORTING_SPEC):
   *  - `cmpq $0x8, %rax` + `ja` is `rax > 8` UNSIGNED, so the in-range set is
   *    exactly {0..8} — 9 entries, matching the 9-word table. `ja` (not `jae`)
   *    means 8 is IN range; `jg` vs `ja` is moot here because the preceding
   *    `movl` zero-extends, so rax can never be negative.
   *  - `movslq` is a SIGN-extending 32-bit load: every table word is negative
   *    (0xfffffed8 … 0xffffffd0), so the strings live *below* the table base.
   *    Reading them as absolute or as unsigned would fault or return garbage.
   *  - The labels are space-padded to a fixed 30 columns in the binary and the
   *    padding is inside the NUL terminator, so it is part of the return value.
   *
   * ORACLE — verified by calling the real Helium binary. The symbol is
   * exported (`nm -arch x86_64` reports `0000000000053f30 T
   * __ZN11HGRenderJob12GetTypeLabelEv`), and it reads only `this+0x0c`, so the
   * harness dlopens Helium under `arch -x86_64 /usr/bin/python3` (the port is
   * transcribed from the x86_64 slice; the arm64 slice would be a different
   * function — see OPS_LOG) and calls it on a 0x200-byte buffer POISONED with
   * 0xEE, with only the dword at +0x0c set. 4,028 cases — exhaustive over
   * 0..1023 plus 0x7fffffff, 0x80000000, 0xfffffffe, 0xffffffff and 3,000
   * random u32s — returned 4028/4028 byte-identical to this port, including
   * the trailing padding. The in-range domain is covered EXHAUSTIVELY (all 9
   * of 9 table entries); the out-of-range class is sampled 4,019 times. The
   * 0xEE poison also confirms no other field is consulted.
   * NEGATIVE CONTROLS (measured against the same 4,028 FCP answers): reading
   * the table as ABSOLUTE pointers instead of self-relative -> 9 wrong (every
   * in-range case); assuming the strings sit in index order rather than at
   * their real addresses -> 7 wrong; trimming the trailing padding -> 8 wrong;
   * `jae` instead of `ja` (dropping type 8) -> 1 wrong.
   *
   * @returns the static label for this job's Type tag; never null.
   */
  GetTypeLabel(): string {
    // ------------------------------------------------------------
    // @0x53f30..0x53f31 — prologue (no TS-visible effect).
    // @0x53f34 — movl 0xc(%rdi), %eax : load the u32 Type tag. `>>> 0`
    //   reproduces the zero-extension of the 32-bit load, so a caller that
    //   hands us a negative JS number sees the same bit-pattern the machine
    //   would have read out of the field.
    // ------------------------------------------------------------
    const type = this._type >>> 0;

    // ------------------------------------------------------------
    // @0x53f37 — cmpq $0x8, %rax  (flags on rax - 8)
    // @0x53f3b — ja 0x53f4d : taken iff type > 8 UNSIGNED -> unknown label.
    //   Taking this branch first makes the table read below provably
    //   in-bounds for {0..8}, which is exactly the table's length.
    // @0x53f4d — leaq 0x885f91(%rip), %rax : the @0x8d9ee5 literal.
    // @0x53f54..0x53f55 — epilogue + retq.
    // ------------------------------------------------------------
    if (type > 8) {
      return HG_RENDER_JOB_UNKNOWN_TYPE_LABEL;
    }

    // ------------------------------------------------------------
    // @0x53f3d — leaq 0x377a44(%rip), %rcx : rcx = table base @0x3cb988.
    // @0x53f44 — movslq (%rcx,%rax,4), %rax : sign-extended int32 at
    //            tableBase + type*4.
    // @0x53f48 — addq %rcx, %rax : rax = tableBase + thatOffset, i.e. the
    //            char* for this Type. HG_RENDER_JOB_TYPE_LABELS holds the
    //            already-resolved strings, each carrying the table word and
    //            the resolved address it was read from.
    // @0x53f4b..0x53f4c — epilogue + retq.
    //
    // The `!` is safe and deliberate rather than defensive: `type` is a
    // `>>> 0` u32 and the branch above returned for everything above 8, so
    // the index is within the 9-element table on every path that reaches
    // here. Asserting it keeps an out-of-range read from degrading into
    // `undefined` (the silent-wrong-answer class G7 guards).
    // ------------------------------------------------------------
    return HG_RENDER_JOB_TYPE_LABELS[type]!;
  }

  /**
   * `HGRenderJob::GetUserName()` @Helium 0x54820
   *   (__ZN11HGRenderJob11GetUserNameEv)
   *
   * The reader half of `SetUserName` @0x54670 above. Full 10-line body from
   * raw-port/re/disasm/Helium.__ZN11HGRenderJob11GetUserNameEv.s:
   *
   *   0x54820  pushq   %rbp                        ; frame prologue
   *   0x54821  movq    %rsp, %rbp
   *   0x54824  movq    0xd8(%rdi), %rcx            ; rcx = this->userName
   *   0x5482b  testq   %rcx, %rcx                  ; ZF = (userName == null)
   *   0x5482e  leaq    0x8a2197(%rip), %rax        ; rax = &"" literal
   *                                                ;   ## literal pool for: ""
   *   0x54835  cmovneq %rcx, %rax                  ; if (userName != null) rax = userName
   *   0x54839  popq    %rbp                        ; epilogue
   *   0x5483a  retq                                ; returns char* in %rax
   *   0x5483b  nopl    (%rax,%rax)                 ; padding — not executed
   *
   * There is NO branch: the machine loads the "" literal unconditionally and
   * then `cmovneq` overwrites it with the field when `testq` cleared ZF (i.e.
   * the pointer is non-null). Both operands are always evaluated, so the
   * `??` below is a faithful model of the conditional move, not a shortcut
   * around a branch the binary takes.
   *
   * The returned pointer is therefore NEVER null: an unset job answers with a
   * pointer to a static empty C string, so the TS return type is `string`
   * (not `string | null`) and the unset answer is `''`. Callers that test the
   * result for null in C would never see one — modelling this as `null` would
   * invert that contract.
   *
   * The `""` literal address is the rip-relative target of @0x5482e:
   * `0x54835` (the address of the NEXT instruction) + `0x8a2197` =
   * **@Helium 0x8f69cc**. Confirmed directly in the x86_64 slice: `__TEXT`
   * has vmaddr 0 / fileoff 0, so that vmaddr is also the file offset, and the
   * byte there is `0x00` — a zero-length C string (it is the tail padding
   * after the `"…ntilCompleted"` literal).
   *
   * ORACLE — differential against the live Helium binary, 1,800 cases, 0
   * divergences (raw-port/re/oracle/HGRenderJob_GetUserName_oracle.py). The
   * symbol is exported (`nm -arch x86_64` type `T`), so the harness dlopens
   * Helium under `arch -x86_64 /usr/bin/python3` — the port cites x86_64
   * offsets, and calling the arm64 slice would compare against code this port
   * did not transcribe (see OPS_LOG "wrong architecture") — and calls the real
   * getter on a 0x200-byte object:
   *   * 1,200 cases with a real C string at +0xd8 (empty, 1-char, 255-char,
   *     embedded high bytes, random lengths 0..39 with random bytes): the
   *     returned pointer is bit-identical to the stored pointer, and every
   *     byte of the 0xAA-poisoned object outside +0xd8..+0xdf is unchanged —
   *     the getter stores nothing.
   *   * 600 cases with a NULL slot over randomly poisoned objects: the
   *     returned pointer is exactly `slide + 0x8f69cc` every time, and the
   *     byte it points at is `0x00`.
   * NEGATIVE CONTROLS (measured on 400 mixed cases, i.e. 200 that can
   * distinguish each mutant): reading +0xc8 (the neighbouring `userTag`
   * slot) instead of +0xd8 -> 200 wrong; returning null instead of the ""
   * literal when unset -> 200 wrong; always returning the "" literal
   * (ignoring the field) -> 200 wrong.
   *
   * @returns the job's user name, or `''` when the field is unset — never null,
   *          matching the never-null `char*` the machine returns.
   */
  GetUserName(): string {
    // ------------------------------------------------------------
    // @0x54820..0x54821 — prologue (no TS-visible effect).
    // @0x54824 — movq 0xd8(%rdi), %rcx : rcx = this->userName.
    // @0x5482b — testq %rcx, %rcx      : ZF = (userName == null).
    // @0x5482e — leaq 0x8a2197(%rip), %rax : rax = &"" @Helium 0x8f69cc
    //            (0x54835 + 0x8a2197), the empty C-string literal.
    // @0x54835 — cmovneq %rcx, %rax    : ZF==0 (non-null) -> rax = userName.
    // @0x54839..0x5483a — epilogue + retq, returning %rax.
    // ------------------------------------------------------------
    const userName = this.userName; // @0x54824
    return userName ?? ''; // @0x5482b/@0x5482e/@0x54835 — cmov: field, else the "" literal
  }
}

// ============================================================================
// LIBC EXTERN BOUNDARY STUBS
// ============================================================================
// These are out-of-scope externs (libSystem / libc) reached through the
// mach-o "symbol stub for" indirection at the cited addresses. Per the
// DEP-WORKER brief and PORTING_SPEC.md Rule 3, extern C-runtime calls are
// modelled as boundary stubs — they document the ABI they satisfy and
// delegate to a plain-JS equivalent (JS has GC'd strings, so `free` is a
// no-op and `strdup` returns the string as-is; a caller can never observe
// the difference through the HGRenderJob interface because the field is
// only read/written by other HGRenderJob methods that follow the same
// model).

/**
 * libc `void free(void *ptr)` — reached via the mach-o symbol stub at
 * @Helium 0x3c513e (call site: @0x54689 in SetUserName). JS strings are
 * garbage-collected; the machine's semantic guarantee is only "the
 * storage backing `ptr` is released and must not be dereferenced". At
 * the TS boundary the field that held `ptr` is nulled *by the caller*,
 * so there is nothing observable to model. This stub exists to preserve
 * the call-site provenance @0x54689.
 */
function _free(_ptr: string): void {
  // @Helium 0x3c513e (symbol stub for: _free) — libc extern, no-op in JS.
  void _ptr;
}

/**
 * libc `char *strdup(const char *s)` — reached via the mach-o symbol
 * stub at @Helium 0x3c5606 (call site: @0x546a1 in SetUserName). Copies
 * a NUL-terminated C string into a fresh heap allocation and returns
 * that pointer. At the TS boundary the "copy" is just the same
 * immutable string value; JS strings are already value-semantic.
 */
function _strdup(s: string): string {
  // @Helium 0x3c5606 (symbol stub for: _strdup) — libc extern.
  // The value semantics of a JS string equal the "returns a heap copy"
  // contract of C strdup from the caller's perspective.
  return s;
}
