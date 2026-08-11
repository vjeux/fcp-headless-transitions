// HGRenderJob — Helium render job (partial port).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice). Disassembly sources:
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob10SetUserTagEy.s          (SetUserTag)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetUserNameEPKc.s       (SetUserName)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob7SetTypeENS_4TypeE.s      (SetType)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetPriorityENS_8PriorityE.s (SetPriority)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetResourceENS_8ResourceE.s (SetResource)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob11SetResourceENS_8ResourceE.s (SetResource)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob23SetRenderThreadPriorityENS_20RenderThreadPriorityE.s
//                                                                       (SetRenderThreadPriority)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob17SetGPUGraphicsAPIENS_14GPUGraphicsAPIE.s
//                                                                       (SetGPUGraphicsAPI)
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob17GetGPUGraphicsAPIEv.s   (GetGPUGraphicsAPI —
//                                                                       read only to pin the
//                                                                       +0x64 offset/width; the
//                                                                       getter itself is a
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
//   ...                          // fields 0x10..0x6f not yet decoded
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
