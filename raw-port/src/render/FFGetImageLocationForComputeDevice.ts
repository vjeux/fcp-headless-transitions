// FFGetImageLocationForComputeDevice.ts — Flexo free function that maps a
// (nullable) HGComputeDevice smart pointer to the corresponding FxPlug
// FxDevice pointer, or NULL/CPU-device as a fallback.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Flexo.framework/Versions/A/Flexo (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/Flexo.__Z34FFGetImageLocationForComputeDeviceRKNSt3__110shared_ptrIK15HGComputeDeviceEE.s
//
// Symbols ported (mangled → address)
//   * __Z34FFGetImageLocationForComputeDeviceRKNSt3__110shared_ptrIK15HGComputeDeviceEE
//       — FFGetImageLocationForComputeDevice(shared_ptr<HGComputeDevice const> const&)
//         @Flexo 0x744b40
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs — FxPlug/FCP framework)
// -----------------------------------------------------------------------------
//   * __Z28FxDeviceGetDeviceForHGDeviceRKNSt3__110shared_ptrIK15HGComputeDeviceEE
//       — FxDeviceGetDeviceForHGDevice(shared_ptr<HGComputeDevice const> const&)
//       — FxPlug SDK / FinalCutProXFxAPI framework. TRUE out-of-scope
//         extern (not ProCore/ProChannel/Helium/Ozone/Flexo internal —
//         this is Apple's FxPlug host API). Jumped to via Flexo stub
//         0x1495dd2 @0x744b53.
//
//   * _FxDeviceGetCPUDevice
//       — FxDeviceGetCPUDevice(void). Same framework, same policy.
//         Jumped to via Flexo stub 0x14955c2 @0x744b5d.
//
// -----------------------------------------------------------------------------
// SEMANTICS (decoded from the 16-line body)
// -----------------------------------------------------------------------------
// The function takes `shared_ptr<HGComputeDevice const> const&` — one
// pointer-sized arg in %rdi that points to the shared_ptr control block.
// The libc++ shared_ptr layout stores the raw pointer at offset 0 (see
// HGComputeDevice.ts for the analogous decoded struct layouts). The
// disasm dereferences that:
//
//   rax = *(rdi+0)                    ; the raw HGComputeDevice*
//   if (rax == nullptr) return 0;     ; jz @0x744b58 → xor eax,eax; ret
//   ecx = *(rax+0x8)                  ; HGComputeDevice::type (u32 @+0x8;
//                                       see HGComputeDevice.ts layout)
//   if (ecx == 0)                     ; type == 0 (the CPU-device enum)
//       tail-jmp _FxDeviceGetCPUDevice ; @0x744b5d
//   else
//       tail-jmp __Z28FxDeviceGetDeviceForHGDeviceRKNSt3__110shared_ptrIK15HGComputeDeviceEE
//                                     ; @0x744b53 — passes rdi (the
//                                       shared_ptr&) straight through.
//
// I.e. "NULL device -> NULL; CPU device -> ask FxPlug for the CPU
// FxDevice; anything else -> ask FxPlug to look up the FxDevice bound to
// that HGComputeDevice smart pointer."
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Flexo.__Z34FFGetImageLocationForComputeDeviceRKNSt3__110shared_ptrIK15HGComputeDeviceEE.s)
// -----------------------------------------------------------------------------
//   0x744b40  pushq  %rbp
//   0x744b41  movq   %rsp, %rbp
//   0x744b44  movq   (%rdi), %rax                      ; rax = shared_ptr->raw
//   0x744b47  testq  %rax, %rax
//   0x744b4a  je     0x744b58                          ; -> return NULL
//   0x744b4c  cmpl   $0x0, 0x8(%rax)                   ; type == 0 ?
//   0x744b50  je     0x744b5c                          ; -> CPU device
//   0x744b52  popq   %rbp
//   0x744b53  jmp    0x1495dd2                          ; tail-jmp FxDeviceGetDeviceForHGDevice
//   0x744b58  xorl   %eax, %eax                        ; NULL return
//   0x744b5a  popq   %rbp
//   0x744b5b  retq
//   0x744b5c  popq   %rbp
//   0x744b5d  jmp    0x14955c2                          ; tail-jmp FxDeviceGetCPUDevice
//   0x744b62  nopw   %cs:(%rax,%rax)                   ; padding

// ═════════════════════════════════════════════════════════════════════════
// Types
// ═════════════════════════════════════════════════════════════════════════

/**
 * `shared_ptr<HGComputeDevice const> const&` — the one and only arg.
 * libc++ shared_ptr's public layout stores the raw pointer at offset 0
 * of the control-block-adjacent object (the 16-byte {raw*, ctrl*} pair);
 * this port only reads offset 0 (`(rdi)` @0x744b44), which is the raw
 * HGComputeDevice* the caller pointed at.
 */
export interface HGComputeDeviceSharedPtrRef {
  /** *(rdi+0) — the raw HGComputeDevice pointer (or null). */
  raw: HGComputeDeviceMin | null;
}

/**
 * Minimal HGComputeDevice view — this function only touches the `type`
 * field @+0x8 (a u32 enum where 0 = CPU device). Full class layout lives
 * in raw-port/src/render/HGComputeDevice.ts.
 */
export interface HGComputeDeviceMin {
  /** HGComputeDevice::Type @+0x8. Enum: 0 = CPU device (see @0x744b50). */
  type: number;
}

// ═════════════════════════════════════════════════════════════════════════
// Frontier externs (FxPlug SDK / FinalCutProXFxAPI framework — TRUE
// OUT-OF-SCOPE — throw with cited @0xADDR per the porting spec)
// ═════════════════════════════════════════════════════════════════════════

/** `FxDeviceGetDeviceForHGDevice(shared_ptr<HGComputeDevice const> const&)`
 *  — FxPlug SDK extern. Called via Flexo stub @0x1495dd2, entered by a
 *  tail-jump from @0x744b53. Returns the FxDevice* bound to the given
 *  HGComputeDevice smart pointer (or NULL if the FxPlug host doesn't
 *  know about that device). NOT a ProCore/ProChannel/Helium/Ozone/Flexo
 *  internal symbol. */
function FxDeviceGetDeviceForHGDevice(_ref: HGComputeDeviceSharedPtrRef): unknown {
  throw new Error(
    "FxDeviceGetDeviceForHGDevice @Flexo stub 0x1495dd2 (tail-called " +
      "from FFGetImageLocationForComputeDevice @0x744b53) not yet " +
      "transcribed — TRUE out-of-scope extern (FxPlug SDK / " +
      "FinalCutProXFxAPI framework, not one of the 5 in-scope FCP " +
      "framework libs).",
  );
}

/** `FxDeviceGetCPUDevice()` — FxPlug SDK extern. Called via Flexo stub
 *  @0x14955c2, entered by a tail-jump from @0x744b5d. Returns the
 *  process-global FxDevice* representing the CPU. Same framework as the
 *  peer above; same policy. */
function FxDeviceGetCPUDevice(): unknown {
  throw new Error(
    "FxDeviceGetCPUDevice @Flexo stub 0x14955c2 (tail-called from " +
      "FFGetImageLocationForComputeDevice @0x744b5d) not yet " +
      "transcribed — TRUE out-of-scope extern (FxPlug SDK / " +
      "FinalCutProXFxAPI framework).",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The function
// ═════════════════════════════════════════════════════════════════════════

/**
 * `FFGetImageLocationForComputeDevice(shared_ptr<HGComputeDevice const>
 * const&)` — @Flexo 0x744b40
 * (__Z34FFGetImageLocationForComputeDeviceRKNSt3__110shared_ptrIK15HGComputeDeviceEE).
 *
 * Faithful line-for-line transcription of the 16-instruction disasm
 * quoted above. Three-way dispatch on the shared_ptr's raw pointer and
 * (if non-null) its HGComputeDevice::type @+0x8:
 *
 *   - NULL raw pointer            → return NULL  (@0x744b58)
 *   - type == 0 (CPU device)      → tail-call FxDeviceGetCPUDevice()  (@0x744b5d)
 *   - anything else               → tail-call FxDeviceGetDeviceForHGDevice(ref)  (@0x744b53)
 *
 * The `popq %rbp` before each `jmp` is a standard x86-64 tail-call
 * epilogue restoring the frame pointer before the branch; it has no
 * TS-visible effect.
 */
export function FFGetImageLocationForComputeDevice(
  ref: HGComputeDeviceSharedPtrRef,
): unknown {
  // @0x744b40..0x744b41 — prologue. No TS-visible effect.

  // @0x744b44 — rax = *(rdi+0) = the raw HGComputeDevice*.
  const raw = ref.raw;

  // @0x744b47..0x744b4a — if raw == NULL, jump to the xor-eax-eax return.
  if (raw === null) {
    // @0x744b58..0x744b5b — xor eax, eax; pop rbp; ret. Return NULL.
    return null;
  }

  // @0x744b4c..0x744b50 — cmpl $0, 0x8(%rax); je 0x744b5c.
  // I.e. if HGComputeDevice::type == 0, dispatch to the CPU-device path.
  if ((raw.type | 0) === 0) {
    // @0x744b5c..0x744b5d — pop rbp; jmp _FxDeviceGetCPUDevice (tail call).
    return FxDeviceGetCPUDevice();
  }

  // @0x744b52..0x744b53 — pop rbp; jmp FxDeviceGetDeviceForHGDevice
  // (tail call). The shared_ptr& (%rdi) is passed straight through
  // untouched; the ABI has already placed it in %rdi from our own arg.
  return FxDeviceGetDeviceForHGDevice(ref);
}
