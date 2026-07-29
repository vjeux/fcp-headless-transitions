// raw-port/src/render/HGAppleLog_Encode.ts
//
// FCP `HGAppleLog::Encode` — nested Helium HGNode subclass. Forward Apple Log
// camera-log OETF: scene-linear light → Apple Log code value. Wraps an owned
// `HgcAppleLog_encode` compositor and, in GetOutput, optionally pre-multiplies
// the incoming linear-light plate by a source-gamut → Apple wide-gamut colour
// matrix (via an owned `HGColorMatrix`) before handing it to the compositor
// which applies the two-segment (sqrt / log) transfer via two SetParameter
// calls with byte-exact coefficients baked at data pool @Helium 0x3d0fd0..
// 0x3d0fe0 and 0x3cb6b4.
//
// The transfer coefficients are the same numbers the LANDED sibling class
// `HGAppleLogLinearizationLUTInfo` (inverse: Apple Log → linear) uses at
// bake time; see raw-port/src/render/HGAppleLogLinearizationLUTInfo.ts and
// the ANNOTATED CROSS-REFERENCE section below.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY:
//   raw-port/re/disasm/Helium.HGAppleLog.Encode.s            (C2/C1 ctor + D2/D1/D0 dtors)
//   raw-port/re/disasm/Helium.HGAppleLog.Encode_GetOutput.s  (GetOutput)
//
// SYMBOLS:
//   @Helium 0x102f30  HGAppleLog::Encode::Encode(SceneColorimetry, LogColorimetry)  [C2]  __ZN10HGAppleLog6EncodeC2ENS_16SceneColorimetryENS_14LogColorimetryE
//   @Helium 0x103030  HGAppleLog::Encode::Encode(SceneColorimetry, LogColorimetry)  [C1 — 4-instr tail-jmp to C2]  __ZN10HGAppleLog6EncodeC1ENS_16SceneColorimetryENS_14LogColorimetryE
//   @Helium 0x103040  HGAppleLog::Encode::~Encode()  [D2]  __ZN10HGAppleLog6EncodeD2Ev
//   @Helium 0x103090  HGAppleLog::Encode::~Encode()  [D1]  __ZN10HGAppleLog6EncodeD1Ev
//   @Helium 0x1030e0  HGAppleLog::Encode::~Encode()  [D0 — deleting; tail-jmp HGObject::operator delete]  __ZN10HGAppleLog6EncodeD0Ev
//   @Helium 0x103140  HGAppleLog::Encode::GetOutput(HGRenderer*)  __ZN10HGAppleLog6Encode9GetOutputEP10HGRenderer
//
//   NO .cold.* initializers exist for this class — unlike HGACEScct::Encode/Decode
//   (which use Itanium __cxa_guard_acquire static locals), HGAppleLog::Encode
//   has NO function-scope static-local constants. All six transfer coefficients
//   are RIP-relative rodata loads from GetOutput at data addresses 0x3d0fd0..
//   0x3d0fe0 and 0x3cb6b4. Grep confirms: no `__ZZN10HGAppleLog6Encode*` static
//   symbols and no `*.cold.*` entries under HGAppleLog::Encode in
//   /tmp/Helium_nm.txt.
//
// VTABLE (installed pointer = vtable_base + 0x10, per Itanium ABI):
//   @Helium C2 @0x102f49  leaq 0x915cf0(%rip),%rax → 0x102f50 + 0x915cf0 = 0xa18c40
//   @Helium D2 @0x103049  leaq 0x915bf0(%rip),%rax → 0x103050 + 0x915bf0 = 0xa18c40
//   @Helium D1 @0x103099  leaq 0x915ba0(%rip),%rax → 0x1030a0 + 0x915ba0 = 0xa18c40
//   @Helium D0 @0x1030e9  leaq 0x915b50(%rip),%rax → 0x1030f0 + 0x915b50 = 0xa18c40
//   All four sites agree: installed vtable ptr = 0xa18c40.
//
// STRUCT LAYOUT (recovered from C2 @0x102f30 + GetOutput @0x103140):
//   HGAppleLog::Encode extends HGNode (base ctor called @0x102f44, so HGNode
//   occupies offsets 0x00..0x197 per raw-port/src/render/HGNode.ts). This
//   subclass adds:
//     0x198 : HGColorMatrix*             colorMatrix       (nullable — allocated only when a
//                                                            gamut conversion is needed; see the
//                                                            ENUM-DRIVEN GAMUT DISPATCH below.
//                                                            First set to 0 unconditionally in
//                                                            the ctor @0x102f53 via `movq $0x0`.)
//     0x1a0 : HgcAppleLog_encode*        compositor        (owned; alloc+ctor @0x102f5e/0x102f6e;
//                                                            store @0x102f73. Non-null after ctor.)
//     0x1a8 : const HGColorMatrix4*      gamutMatrixData   (nullable float[4]-quad pointer into the
//                                                            static gamut tables; either 0,
//                                                            &HGColorGamma::rec709RGBToRec2020RGB,
//                                                            or &HGAppleLog::Encode::sourceToAppleWideGamut[SceneColorimetry].
//                                                            First set to 0 unconditionally in the ctor
//                                                            @0x102f7a via `movq $0x0`; overwritten
//                                                            in the two gamut-conversion branches only.)
//   sizeof HGNode = 0x198; three added qwords → total sizeof = 0x1b0
//   (though only 0x1a8+8 = 0x1b0 is actually written).
//
//   NOTE ON FIELD ORDERING (differs from HGACEScct::Encode):
//     HGACEScct::Encode packs {compositor@0x198, d_f32@0x1a0, bb_f32@0x1a4, cc_f32@0x1a8}.
//     HGAppleLog::Encode packs {colorMatrix@0x198, compositor@0x1a0, gamutMatrixData@0x1a8}.
//     Different classes with different data — the offset numeric collision is coincidence.
//     Confirmed by the D2 dtor @0x103040..0x103080 which releases BOTH 0x198 (if non-null) and
//     0x1a0 (if non-null) via vtable *0x18 (HGObject::Release semantics), and by GetOutput's
//     branch on the nullness of 0x198.
//
// ENUM-DRIVEN GAMUT DISPATCH (ctor @0x102f85..0x102fe7):
//   r14 = SceneColorimetry (esi arg), r15 = LogColorimetry (edx arg).
//   The ctor decision tree, verbatim from disasm:
//     @0x102f85 testl %r15d, %r15d
//     @0x102f88 je 0x102fbf                      ; if LogColorimetry == 0: goto L0
//     @0x102f8a cmpl $0x1, %r15d
//     @0x102f8e jne 0x102fee                     ; if LogColorimetry != 1 && != 0: goto EPILOGUE (leave 0x198/0x1a8 null)
//     @0x102f90..0x102fbd  ; LogColorimetry == 1: alloc HGColorMatrix and pick sourceToAppleWideGamut[r14]
//       @0x102f90 movl $0x1f0, %edi
//       @0x102f95 callq HGObject::operator new(unsigned long)   ; 0x1f0 = 496 bytes
//       @0x102f9d callq HGColorMatrix::HGColorMatrix()          ; placement ctor
//       @0x102fa5 movq %r15, 0x198(%rbx)                        ; this.colorMatrix = new HGColorMatrix
//       @0x102fac movl %r14d, %ecx                              ; ecx = SceneColorimetry
//       @0x102faf shlq $0x6, %rcx                               ; rcx = SceneColorimetry * 64
//       @0x102fb3 leaq __ZN10HGAppleLog6Encode22sourceToAppleWideGamutE(%rip), %rax
//       @0x102fba addq %rcx, %rax                               ; rax = &sourceToAppleWideGamut[SceneColorimetry]
//       @0x102fbd jmp 0x102fe7                                  ; goto STORE_1A8
//   L0 (LogColorimetry == 0):
//     @0x102fbf testl %r14d, %r14d
//     @0x102fc2 jne 0x102fee                     ; if SceneColorimetry != 0: goto EPILOGUE (leave nulls)
//     @0x102fc4..0x102fe0  ; LogColorimetry == 0 AND SceneColorimetry == 0:
//                          ; alloc HGColorMatrix and pick rec709RGBToRec2020RGB
//       @0x102fc4 movl $0x1f0, %edi
//       @0x102fc9 callq HGObject::operator new                  ; same 0x1f0 alloc
//       @0x102fd4 callq HGColorMatrix::HGColorMatrix()
//       @0x102fd9 movq %r15, 0x198(%rbx)                        ; this.colorMatrix = new HGColorMatrix
//       @0x102fe0 leaq __ZN12HGColorGamma21rec709RGBToRec2020RGBE(%rip), %rax
//       @0x102fe7 movq %rax, 0x1a8(%rbx)                        ; STORE_1A8: this.gamutMatrixData = rax
//     Fall through to EPILOGUE.
//   EPILOGUE @0x102fee..0x102ff6: pop regs, retq.
//
//   Symbol shapes recovered from /tmp/Helium_nm.txt:
//     00000000003d17b0 S __ZN10HGAppleLog6Encode22sourceToAppleWideGamutE
//     00000000003cfc30 S __ZN12HGColorGamma21rec709RGBToRec2020RGBE
//   Layout of each gamut matrix (16 f32 = 64 bytes; loaded via
//   HGColorMatrix::LoadMatrix(Dv4_f const*, bool) at GetOutput @0x103184
//   which takes a pointer to `float vector[4] const*` — i.e. an array of 4-wide
//   float vectors, 4 rows total = 3×3 matrix padded to 4×4 with last row (0,0,0,1)):
//     sourceToAppleWideGamut[SceneColorimetry] : 4 SIMD rows × 4 f32 = 16 f32 = 0x40 bytes stride
//         (shlq $0x6 = ×64 confirms the stride)
//     rec709RGBToRec2020RGB                     : same 16 f32 layout
//   Byte-exact matrix values are captured from the binary in the ENGINE-VISIBLE
//   MATRIX TABLES comment block below.
//
//   Summary of the two-boolean-enum dispatch:
//                    LogColorimetry=0             LogColorimetry=1
//     Scene=0    matrix := rec709RGBToRec2020RGB  matrix := sourceToAppleWideGamut[0]
//     Scene=1    (null; no matrix)                matrix := sourceToAppleWideGamut[1]
//     Scene=2    (null; no matrix)                matrix := sourceToAppleWideGamut[2]
//     Scene=3    (null; no matrix)                matrix := sourceToAppleWideGamut[3]
//     Scene>=4   (null; no matrix)                (null; no matrix — no bounds check in binary,
//                                                   but the compare cmpl $0x1 skips >=2 and the
//                                                   sourceToAppleWideGamut table's size is
//                                                   implicit to the caller; we DO NOT re-derive.)
//     LogColorimetry >= 2:  (null; no matrix, regardless of Scene)
//
//   Semantics (documenting decode, NOT deriving): a null `colorMatrix` means the
//   pipeline just runs the transfer function on the passthrough plate; a non-
//   null `colorMatrix` first colour-transforms into Apple's wide-gamut space
//   before the transfer function. LogColorimetry appears to select Apple Log
//   over Rec.2020 (LogColorimetry=0 pairs Scene=0 → 709→2020 gamut change; the
//   LogColorimetry=1 branch pairs every scene with an "Apple Wide" gamut matrix).
//
// GETOUTPUT (@0x103140..0x103201) — rendering-graph wiring:
//   Verbatim asm walk:
//     @0x10314a  movq  0x198(%rdi), %r14              ; r14 = this.colorMatrix (nullable)
//     @0x103151  movq  %rsi, %rdi                     ; rdi = renderer
//     @0x103154  movq  %rbx, %rsi                     ; rsi = this
//     @0x103157  xorl  %edx, %edx                     ; edx = 0
//     @0x103159  callq HGRenderer::GetInput(HGNode*, int)
//                                                     ; rax = renderer.GetInput(this, 0)
//     @0x10315e  movq  %rax, %rdx                     ; rdx = input  (preserved across the null test)
//     @0x103161  testq %r14, %r14
//     @0x103164  je    0x103190                       ; if colorMatrix == null: skip matrix load
//     ; --- matrix branch ---
//     @0x103166  movq  (%r14), %rax                   ; rax = colorMatrix.vtable
//     @0x103169  movq  %r14, %rdi                     ; rdi = colorMatrix
//     @0x10316c  xorl  %esi, %esi                     ; esi = 0
//     @0x10316e  callq *0x78(%rax)                    ; colorMatrix.SetInput(0, rdx=input)
//                                                     ;   (vtable slot 0x78; the same slot used
//                                                     ;    by HgcLogVideo_encode.SetInput in
//                                                     ;    HGACEScct_Encode.ts — same base ABI.)
//     @0x103171  movq  0x198(%rbx), %rdi              ; rdi = this.colorMatrix
//     @0x103178  movq  0x1a8(%rbx), %rsi              ; rsi = this.gamutMatrixData (float[4] const*)
//     @0x10317f  movl  $0x1, %edx                     ; edx = 1 (bool = true)
//     @0x103184  callq HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
//     @0x103189  movq  0x198(%rbx), %rdx              ; rdx = this.colorMatrix (pipeIn = colorMatrix)
//     ; --- join point @0x103190 ---
//     @0x103190  movq  0x1a0(%rbx), %rdi              ; rdi = this.compositor
//     @0x103197  movq  (%rdi), %rax                   ; rax = compositor.vtable
//     @0x10319a  xorl  %esi, %esi                     ; esi = 0
//     @0x10319c  callq *0x78(%rax)                    ; compositor.SetInput(0, rdx=pipeIn)
//     ; --- SetParameter call 1: esi=0 (log segment) ---
//     @0x10319f  movq  0x1a0(%rbx), %rdi              ; rdi = this.compositor
//     @0x1031a6  movq  (%rdi), %rax                   ; rax = compositor.vtable
//     @0x1031a9  movss 0x2cde1f(%rip), %xmm0          ; xmm0 = f32 @0x3d0fd0 = 0.0096405204385519028f
//     @0x1031b1  movss 0x2cde1b(%rip), %xmm1          ; xmm1 = f32 @0x3d0fd4 = 0.085504792630672455f
//     @0x1031b9  movss 0x2cde17(%rip), %xmm2          ; xmm2 = f32 @0x3d0fd8 = 0.69336944818496704f
//     @0x1031c1  xorps %xmm3, %xmm3                   ; xmm3 = 0.0f
//     @0x1031c4  xorl  %esi, %esi                     ; esi = 0
//     @0x1031c6  callq *0x60(%rax)                    ; compositor.SetParameter(0, C0.xmm0, C0.xmm1, C0.xmm2, 0.0f)
//     ; --- SetParameter call 2: esi=1 (sqrt segment) ---
//     @0x1031c9  movq  0x1a0(%rbx), %rdi              ; rdi = this.compositor
//     @0x1031d0  movq  (%rdi), %rax                   ; rax = compositor.vtable
//     @0x1031d3  movss 0x2cde01(%rip), %xmm0          ; xmm0 = f32 @0x3d0fdc = 47.287113189697266f
//     @0x1031db  movss 0x2cddfd(%rip), %xmm1          ; xmm1 = f32 @0x3d0fe0 = -0.056410878896713257f
//     @0x1031e3  movss 0x2c84c9(%rip), %xmm2          ; xmm2 = f32 @0x3cb6b4 = 0.0099999997764825821f
//     @0x1031eb  xorps %xmm3, %xmm3                   ; xmm3 = 0.0f
//     @0x1031ee  movl  $0x1, %esi                     ; esi = 1
//     @0x1031f3  callq *0x60(%rax)                    ; compositor.SetParameter(1, C1.xmm0, C1.xmm1, C1.xmm2, 0.0f)
//     @0x1031f6  movq  0x1a0(%rbx), %rax              ; rax = this.compositor
//     @0x1031fd..0x103201                             ; pop, retq  ; return this.compositor
//
//   RIP-relative address arithmetic (next-inst + disp) confirmed:
//     0x1031b1 + 0x2cde1f = 0x3d0fd0
//     0x1031b9 + 0x2cde1b = 0x3d0fd4
//     0x1031c1 + 0x2cde17 = 0x3d0fd8
//     0x1031db + 0x2cde01 = 0x3d0fdc
//     0x1031e3 + 0x2cddfd = 0x3d0fe0
//     0x1031eb + 0x2c84c9 = 0x3cb6b4
//
// ENGINE-VISIBLE FLOAT COEFFICIENTS — SIX byte-exact IEEE-754 f32 values read from
// /tmp/Helium.x86_64 at the addresses above (VA==offset):
//
//   Call 1 (esi=0) — LOG SEGMENT:
//     @0x3d0fd0  xmm0 = 0.0096405204385519028f    u32 0x3c1df346
//     @0x3d0fd4  xmm1 = 0.085504792630672455f     u32 0x3daf1d23
//     @0x3d0fd8  xmm2 = 0.69336944818496704f      u32 0x3f3180a9
//     xmm3 = 0.0f (xorps @0x1031c1)
//   Call 2 (esi=1) — SQRT SEGMENT:
//     @0x3d0fdc  xmm0 = 47.287113189697266f       u32 0x423d2601
//     @0x3d0fe0  xmm1 = -0.056410878896713257f    u32 0xbd670f18
//     @0x3cb6b4  xmm2 = 0.0099999997764825821f    u32 0x3c23d70a
//     xmm3 = 0.0f (xorps @0x1031eb)
//
// ANNOTATED CROSS-REFERENCE with HGAppleLogLinearizationLUTInfo.ts (inverse
// transfer: Apple Log → linear). These are the SAME piecewise coefficients as
// the LUT (Apple Log spec), presented in forward polarity:
//
//   Inverse (LUT, from HGAppleLogLinearizationLUTInfo.ts):
//     if X < TL=0.2085553:   y = sqrt(X / 47.28711236) + (-0.05641088)
//     else:                  y = exp((X + (-0.69336945)) * GG=8.106530412623027) + (-0.00964052)
//     then y /= 0.9.
//
//   Forward (this class's engine-visible coefficients):
//     Call 1 log segment @0x3d0fd0..0x3d0fd8:
//         xmm0 = 0.00964052  = +LOG_OUTPUT_OFFSET (opposite sign of the LUT's -0.00964052)
//         xmm1 = 0.08550479  =  a positive scale — numerically ≈ ln(2)/GG
//                              (0.08550479 * 8.10653 = 0.69315 = ln(2));
//                              likely how the shader converts between log2 and
//                              natural log for the forward direction. We do NOT
//                              re-derive that identity here — the shader's
//                              actual math lives in HgcAppleLog_encode which is
//                              not yet transcribed.
//         xmm2 = 0.69336945  = +LOG_INPUT_OFFSET (opposite sign of the LUT's -0.69336945)
//     Call 2 sqrt segment @0x3d0fdc..0x3cb6b4:
//         xmm0 = 47.28711    = SQRT_DIV (same magnitude as the LUT's 47.28711236)
//         xmm1 = -0.05641088 = SQRT_OFFSET (same sign/magnitude as the LUT's -0.05641088)
//         xmm2 = 0.01        = a small threshold/epsilon — numerically 10^-2.
//                              Not one of the LUT's named constants; likely the
//                              sqrt-region domain floor used by the HgcAppleLog_encode
//                              shader to gate transitions (undecoded).
//
//   The engine loads the SIX numbers verbatim; we ship them verbatim (Rule 1,
//   transcribe don't reimplement). The shader semantics (why these six wire
//   the Apple Log OETF) live inside HgcAppleLog_encode and are NOT re-derived
//   in this file.
//
// ENGINE-VISIBLE MATRIX TABLES — CONFIRMED byte-exact from /tmp/Helium.x86_64
// (VA==offset). Each table is a 3×3 gamut matrix padded to 4 rows × 4 floats
// (SIMD-aligned; the last row is (0,0,0,1)). This class REFERENCES these
// tables via pointer — it doesn't own them.
//
//   HGColorGamma::rec709RGBToRec2020RGB @Helium 0x3cfc30 (S in nm output):
//     row0: (0.6274039149284363, 0.3292830288410187, 0.04331306740641594, 0.0)
//     row1: (0.06909728795289993, 0.9195404052734375, 0.011362315155565739, 0.0)
//     row2: (0.016391439363360405, 0.08801330626010895, 0.8955952525138855, 0.0)
//     row3: (0.0, 0.0, 0.0, 1.0)
//
//   HGAppleLog::Encode::sourceToAppleWideGamut @Helium 0x3d17b0 (S in nm output),
//   stride 0x40 (16 f32), indexed by SceneColorimetry ∈ {0,1,2,3}:
//     [0] @0x3d17b0:
//       row0: (0.6081039905548096, 0.2593533992767334, 0.13254259526729584, 0.0)
//       row1: (0.06231553480029106, 0.8046088218688965, 0.13307560980319977, 0.0)
//       row2: (0.031132614240050316, 0.1337558478116989, 0.8351115584373474, 0.0)
//       row3: (0.0, 0.0, 0.0, 1.0)
//     [1] @0x3d17f0:
//       row0: (0.9750428795814514, -0.07685648649930954, 0.10181359201669693, 0.0)
//       row1: (0.0008445447310805321, 0.861537516117096, 0.13761794567108154, 0.0)
//       row2: (0.01987816020846367, 0.04924257844686508, 0.9308792352676392, 0.0)
//       row3: (0.0, 0.0, 0.0, 1.0)
//     [2] @0x3d1830:
//       row0: (0.5938420295715332, 0.30183732509613037, 0.10502184927463531, 0.0)
//       row1: (0.07658243924379349, 0.8609536290168762, 0.06223933771252632, 0.0)
//       row2: (0.1077018529176712, 0.3013279139995575, 0.5978294610977173, 0.0)
//       row3: (0.0, 0.0, 0.0, 1.0)
//     [3] @0x3d1870:
//       row0: (0.9465691447257996, -0.017577528953552246, 0.07170958071947098, 0.0)
//       row1: (0.018802568316459656, 0.9241113662719727, 0.056861504912376404, 0.0)
//       row2: (0.1304563581943512, 0.21795529127120972, 0.6584475636482239, 0.0)
//       row3: (0.0, 0.0, 0.0, 1.0)
//
//   These match well-known Rec.709→Rec.2020 and camera-native→Apple-Wide
//   colour-matrix coefficients. Our JS port keeps the pointer indirection to
//   preserve the C++ ABI (`Dv4_f const*` handed to LoadMatrix) rather than
//   flattening the tables into hard-coded constants — no field is dereferenced
//   in this class; the values are only ever passed by pointer to LoadMatrix.
//
// UNDECODED CALLEES (throw-stubs required per PORTING_SPEC.md rule 3):
//   HgcAppleLog_encode::HgcAppleLog_encode()      @Helium __ZN18HgcAppleLog_encodeC1Ev  — invoked @0x102f6e
//   HgcAppleLog_encode vtable slot *0x60          (SetParameter-like)                   — invoked twice from GetOutput
//   HgcAppleLog_encode vtable slot *0x78          (SetInput-like)                       — invoked once from GetOutput
//   HgcAppleLog_encode vtable slot *0x18          (Release)                             — invoked from D2/D1/D0 dtors
//   HGColorMatrix::HGColorMatrix()                @Helium __ZN13HGColorMatrixC1Ev       — invoked @0x102fa0 and @0x102fd4
//   HGColorMatrix::LoadMatrix(Dv4_f const*, bool) @Helium __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — invoked @0x103184
//   HGColorMatrix vtable slot *0x78               (SetInput-like)                       — invoked once from GetOutput
//   HGColorMatrix vtable slot *0x18               (Release)                             — invoked from D2/D1/D0 dtors
//   HGObject::operator new(unsigned long)         @Helium __ZN8HGObjectnwEm             — invoked @0x102f63, @0x102f95, @0x102fc9
//   HGObject::operator delete(void*)              @Helium __ZN8HGObjectdlEPv            — invoked @0x103128 (D0 tail-jmp)
//   HGRenderer::GetInput(HGNode*, int)            @Helium __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x103159
//   (HGNode ctor/dtor ARE ported — imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

// ---------------------------------------------------------------------------
// Public enum types (matching the C++ mangled names
// `HGAppleLog::SceneColorimetry` and `HGAppleLog::LogColorimetry`). The
// numeric values are integer selectors read from esi/edx by the ctor at
// @Helium 0x102f85 (testl %r15d) and @0x102fbf (testl %r14d); the ctor only
// distinguishes the concrete cases {LogColorimetry∈{0,1}} × {SceneColorimetry∈{0,1,2,3}},
// with all other enum values yielding a null colorMatrix (i.e. skip the
// gamut-conversion prelude). Enumerand names are NOT recovered from the
// binary — we surface only the numeric identities the ctor actually branches
// on. See raw-port/re/disasm/Helium.HGAppleLog.Encode.s for the full table.
// ---------------------------------------------------------------------------

/**
 * `HGAppleLog::SceneColorimetry` — first enum arg to the ctor. Passed in
 * register esi (32-bit). The ctor uses this value only to compute the
 * sourceToAppleWideGamut offset via `shlq $0x6, %rcx` @0x102faf (i.e.
 * ×64 = stride of one 16-float matrix); no bounds check emitted. Values
 * 0..3 select the four documented matrix rows @Helium 0x3d17b0..0x3d1870;
 * values ≥4 read past the four-row table into whatever rodata follows —
 * we do NOT model those out-of-range reads (they are UB in the C++
 * source too, hidden by the caller-side type invariant).
 */
export enum SceneColorimetry {
  /** @Helium 0x102fbf branch — the only SceneColorimetry that pairs with
   *  LogColorimetry=0 to install the rec709→2020 matrix. */
  Scene0 = 0,
  Scene1 = 1,
  Scene2 = 2,
  Scene3 = 3,
}

/**
 * `HGAppleLog::LogColorimetry` — second enum arg to the ctor. Passed in
 * register edx (32-bit). The ctor uses this value only to select the
 * gamut-matrix branch: value 0 → the rec709→2020 branch (further gated on
 * SceneColorimetry==0), value 1 → the sourceToAppleWideGamut branch, all
 * other values → skip matrix installation entirely (0x198 and 0x1a8 stay
 * null). Confirmed at @0x102f85..0x102f8e.
 */
export enum LogColorimetry {
  /** @Helium 0x102f88 `je 0x102fbf` — the "rec709→2020" branch entry. */
  Log0 = 0,
  /** @Helium 0x102f8e `jne 0x102fee` inverted → equal-to-1 falls through
   *  into the sourceToAppleWideGamut branch. */
  Log1 = 1,
}

// ---------------------------------------------------------------------------
// Undecoded callee stubs (Rule 3 — loud gap, not silent approximation).
// ---------------------------------------------------------------------------

/**
 * Placeholder for HGRenderer used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for the HGRenderer class.
 * The `GetInput` method is invoked at @Helium 0x103159 with (this, 0).
 */
export interface HGRendererStub {
  /** @Helium 0x103159 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the compositor object owned at `this.field_1a0`. Not
 * yet transcribed — see raw-port/army/ledger for HgcAppleLog_encode.
 * Only the three vtable slots vcalled from HGAppleLog::Encode are exposed
 * here; each throws until the class is ported.
 */
export interface HgcAppleLog_encode {
  /** vtable *0x18 @Helium — invoked from ~HGAppleLog::Encode (D2 @0x103074, D1 @0x1030c4, D0 @0x103114). */
  Release(): void;
  /** vtable *0x60 @Helium — invoked twice from GetOutput (@0x1031c6, @0x1031f3). Argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x78 @Helium — invoked once from GetOutput (@0x10319c). Argument order (esi, rdx). */
  SetInput(idx: number, input: HGNode): void;
}

/**
 * Placeholder for the optional gamut colour-matrix node owned at
 * `this.field_198`. Not yet transcribed — see raw-port/army/ledger for
 * HGColorMatrix.
 *
 * The exposed vtable slots and the concrete `LoadMatrix` method match what
 * this class needs; each throws until the class is ported.
 *
 * Note: HGColorMatrix appears to itself be an HGNode subclass (its instance
 * is passed as an input to the compositor via `SetInput(0, colorMatrix)`
 * @0x10319c, and it exposes the same vtable *0x78 SetInput slot). This
 * matches the Helium pattern where every render-graph filter both HAS an
 * input and IS a possible input to the next filter.
 */
export interface HGColorMatrix {
  /** vtable *0x18 @Helium — invoked from ~HGAppleLog::Encode (D2 @0x103062, D1 @0x1030b2, D0 @0x103102). */
  Release(): void;
  /** vtable *0x78 @Helium — invoked once from GetOutput (@0x10316e). Argument order (esi, rdx). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * `HGColorMatrix::LoadMatrix(Dv4_f const*, bool)` — @Helium
   * __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb, invoked @0x103184 with
   * (rsi = this.gamutMatrixData, edx = 1). Signature per demangled name:
   * a pointer to a `Dv4_f` (float vector of 4) const array + a bool flag.
   * Body not yet decoded.
   */
  LoadMatrix(data: HGColorMatrix4, flag: boolean): void;
}

/**
 * `HGColorMatrix4` — a 4-row × 4-column column-major-or-row-major matrix,
 * flattened as 16 IEEE-754 f32 values. This class only ever passes a
 * pointer to one of these tables through to `HGColorMatrix::LoadMatrix`;
 * the exact ordering convention is a property of HGColorMatrix::LoadMatrix
 * itself and is not observable here.
 *
 * Provenance: computed 16-float layout is confirmed by the ctor's
 * `shlq $0x6, %rcx` @0x102faf (stride = 0x40 bytes = 16 × f32) and by
 * the LoadMatrix signature `(Dv4_f const*, bool)` (Dv4_f = 4-wide float
 * SIMD vector, so `Dv4_f const*` is an array of such vectors).
 */
export type HGColorMatrix4 = readonly [
  // row 0
  number, number, number, number,
  // row 1
  number, number, number, number,
  // row 2
  number, number, number, number,
  // row 3
  number, number, number, number,
];

/**
 * `HGColorGamma::rec709RGBToRec2020RGB` — read from Helium data segment
 * @0x3cfc30 (symbol __ZN12HGColorGamma21rec709RGBToRec2020RGBE). Values
 * are the byte-exact f32 array unpacked from /tmp/Helium.x86_64. The ctor
 * takes the ADDRESS of this table (@0x102fe0) and stores it in
 * this.gamutMatrixData; no per-element access occurs in this class.
 */
export const HGColorGamma_rec709RGBToRec2020RGB: HGColorMatrix4 = [
  // @Helium 0x3cfc30 row 0
  0.6274039149284363, 0.3292830288410187, 0.04331306740641594, 0.0,
  // @Helium 0x3cfc40 row 1
  0.06909728795289993, 0.9195404052734375, 0.011362315155565739, 0.0,
  // @Helium 0x3cfc50 row 2
  0.016391439363360405, 0.08801330626010895, 0.8955952525138855, 0.0,
  // @Helium 0x3cfc60 row 3
  0.0, 0.0, 0.0, 1.0,
] as const;

/**
 * `HGAppleLog::Encode::sourceToAppleWideGamut` — read from Helium data
 * segment @0x3d17b0 (symbol __ZN10HGAppleLog6Encode22sourceToAppleWideGamutE).
 * Array indexed by SceneColorimetry ∈ {0,1,2,3}; each entry is a
 * 16-float HGColorMatrix4 (0x40 bytes). Stride 0x40 confirmed by the
 * ctor's `shlq $0x6, %rcx` @0x102faf and `leaq …(%rip), %rax` + `addq %rcx,
 * %rax` @0x102fb3..0x102fba.
 *
 * The ctor takes the ADDRESS of `sourceToAppleWideGamut[SceneColorimetry]`
 * and stores it in this.gamutMatrixData; no per-element access occurs in
 * this class.
 */
export const HGAppleLog_Encode_sourceToAppleWideGamut: readonly HGColorMatrix4[] = [
  // @Helium 0x3d17b0 [0]
  [
    0.6081039905548096, 0.2593533992767334, 0.13254259526729584, 0.0,
    0.06231553480029106, 0.8046088218688965, 0.13307560980319977, 0.0,
    0.031132614240050316, 0.1337558478116989, 0.8351115584373474, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ] as const,
  // @Helium 0x3d17f0 [1]
  [
    0.9750428795814514, -0.07685648649930954, 0.10181359201669693, 0.0,
    0.0008445447310805321, 0.861537516117096, 0.13761794567108154, 0.0,
    0.01987816020846367, 0.04924257844686508, 0.9308792352676392, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ] as const,
  // @Helium 0x3d1830 [2]
  [
    0.5938420295715332, 0.30183732509613037, 0.10502184927463531, 0.0,
    0.07658243924379349, 0.8609536290168762, 0.06223933771252632, 0.0,
    0.1077018529176712, 0.3013279139995575, 0.5978294610977173, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ] as const,
  // @Helium 0x3d1870 [3]
  [
    0.9465691447257996, -0.017577528953552246, 0.07170958071947098, 0.0,
    0.018802568316459656, 0.9241113662719727, 0.056861504912376404, 0.0,
    0.1304563581943512, 0.21795529127120972, 0.6584475636482239, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ] as const,
] as const;

/**
 * `newHgcAppleLog_encode()` — placeholder for the compositor allocation +
 * ctor sequence at @Helium 0x102f5e..0x102f6e.
 *
 * The binary emits:
 *   0x102f5e  movl  $0x1a0, %edi                         ; alloc size = 0x1A0 = 416 bytes
 *   0x102f63  callq __ZN8HGObjectnwEm                    ; HGObject::operator new(unsigned long)
 *   0x102f6e  callq __ZN18HgcAppleLog_encodeC1Ev         ; placement-ctor
 * — i.e. `new HgcAppleLog_encode()`. Both callees are undecoded, so this
 * stub throws (rule 3: loud gap, not silent approximation).
 */
function newHgcAppleLog_encode(): HgcAppleLog_encode {
  throw new Error(
    "HGAppleLog::Encode: HgcAppleLog_encode ctor + HGObject::operator new @Helium 0x102f63/0x102f6e not yet transcribed"
  );
}

/**
 * `newHGColorMatrix()` — placeholder for the HGColorMatrix allocation +
 * ctor at @Helium 0x102f90..0x102fa0 (LogColorimetry=1 branch) and
 * @0x102fc4..0x102fd4 (LogColorimetry=0 & SceneColorimetry=0 branch).
 *
 * Both call sites emit the same sequence:
 *   movl  $0x1f0, %edi              ; alloc size = 0x1F0 = 496 bytes
 *   callq __ZN8HGObjectnwEm         ; HGObject::operator new(unsigned long)
 *   callq __ZN13HGColorMatrixC1Ev   ; HGColorMatrix::HGColorMatrix()
 * — both callees are undecoded, so this stub throws.
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGAppleLog::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x102f95/0x102fa0 (or @0x102fc9/0x102fd4) not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// GetOutput SetParameter constants (RIP-relative rodata loads).
// ---------------------------------------------------------------------------

/**
 * Call 1 (esi=0, log segment) xmm0 argument to
 * `HgcAppleLog_encode.SetParameter`. @Helium `movss 0x2cde1f(%rip), %xmm0`
 * @0x1031a9; effective address = 0x1031b1 + 0x2cde1f = 0x3d0fd0. Byte-
 * exact f32 read from /tmp/Helium.x86_64 @0x3d0fd0:
 *   u32 = 0x3c1df346  →  0.0096405204385519028f
 * Semantics: forward-polarity Apple Log LOG_OUTPUT_OFFSET (see
 * ANNOTATED CROSS-REFERENCE above; opposite sign of the LUT's -0.00964052).
 */
const HGAppleLog_Encode_getOutput_call0_xmm0_f32: number = Math.fround(0.0096405204385519028);

/**
 * Call 1 (esi=0, log segment) xmm1 argument. @Helium `movss 0x2cde1b(%rip),
 * %xmm1` @0x1031b1; effective address = 0x1031b9 + 0x2cde1b = 0x3d0fd4.
 * Byte-exact f32 @0x3d0fd4:
 *   u32 = 0x3daf1d23  →  0.085504792630672455f
 * Semantics: a log-segment scale — numerically ≈ ln(2)/GG where
 * GG=8.106530412623027 is the LUT's log-region multiplier
 * (0.085504792 × 8.10653 ≈ ln 2 = 0.69315). The exact identity is not
 * re-derived here; the shader math lives in HgcAppleLog_encode.
 */
const HGAppleLog_Encode_getOutput_call0_xmm1_f32: number = Math.fround(0.085504792630672455);

/**
 * Call 1 (esi=0, log segment) xmm2 argument. @Helium `movss 0x2cde17(%rip),
 * %xmm2` @0x1031b9; effective address = 0x1031c1 + 0x2cde17 = 0x3d0fd8.
 * Byte-exact f32 @0x3d0fd8:
 *   u32 = 0x3f3180a9  →  0.69336944818496704f
 * Semantics: forward-polarity Apple Log LOG_INPUT_OFFSET (see
 * ANNOTATED CROSS-REFERENCE above; opposite sign of the LUT's -0.69336945).
 */
const HGAppleLog_Encode_getOutput_call0_xmm2_f32: number = Math.fround(0.69336944818496704);

/**
 * Call 2 (esi=1, sqrt segment) xmm0 argument. @Helium `movss 0x2cde01(%rip),
 * %xmm0` @0x1031d3; effective address = 0x1031db + 0x2cde01 = 0x3d0fdc.
 * Byte-exact f32 @0x3d0fdc:
 *   u32 = 0x423d2601  →  47.287113189697266f
 * Semantics: Apple Log SQRT_DIV (matches the LUT's 47.28711236 in double).
 */
const HGAppleLog_Encode_getOutput_call1_xmm0_f32: number = Math.fround(47.287113189697266);

/**
 * Call 2 (esi=1, sqrt segment) xmm1 argument. @Helium `movss 0x2cddfd(%rip),
 * %xmm1` @0x1031db; effective address = 0x1031e3 + 0x2cddfd = 0x3d0fe0.
 * Byte-exact f32 @0x3d0fe0:
 *   u32 = 0xbd670f18  →  -0.056410878896713257f
 * Semantics: Apple Log SQRT_OFFSET (matches the LUT's -0.05641088 in double).
 */
const HGAppleLog_Encode_getOutput_call1_xmm1_f32: number = Math.fround(-0.056410878896713257);

/**
 * Call 2 (esi=1, sqrt segment) xmm2 argument. @Helium `movss 0x2c84c9(%rip),
 * %xmm2` @0x1031e3; effective address = 0x1031eb + 0x2c84c9 = 0x3cb6b4.
 * Byte-exact f32 @0x3cb6b4:
 *   u32 = 0x3c23d70a  →  0.0099999997764825821f
 * Semantics: a small threshold/epsilon (nominally 10^-2). Not one of the
 * LUT's named constants; likely a sqrt-region domain floor used by the
 * HgcAppleLog_encode shader (undecoded).
 */
const HGAppleLog_Encode_getOutput_call1_xmm2_f32: number = Math.fround(0.0099999997764825821);

/**
 * `HGAppleLog::Encode` — Helium HGNode subclass. Wraps an owned
 * `HgcAppleLog_encode` compositor configured for Apple Log forward encoding,
 * optionally pre-multiplied by a source-gamut → Apple-wide-gamut
 * `HGColorMatrix` selected by the ctor's `(SceneColorimetry, LogColorimetry)`
 * enum pair.
 *
 * @Helium ctors  @0x102f30 (C2) / @0x103030 (C1);
 *         dtors  @0x103040 (D2) / @0x103090 (D1) / @0x1030e0 (D0);
 *         GetOutput @0x103140.
 */
export class HGAppleLogEncode extends HGNode {
  /**
   * Owned optional `HGColorMatrix`. Field @0x198 in the C++ layout.
   * Unconditionally zeroed by the ctor @0x102f53 (`movq $0x0, 0x198(%rbx)`),
   * then optionally overwritten in the LogColorimetry=1 branch @0x102fa5 or
   * the LogColorimetry=0 & SceneColorimetry=0 branch @0x102fd9 with a
   * freshly-constructed HGColorMatrix.
   */
  colorMatrix: HGColorMatrix | null;

  /**
   * Owned `HgcAppleLog_encode` compositor. Field @0x1a0 in the C++ layout.
   * Assigned once in the ctor @0x102f73: `movq %r12, 0x1a0(%rbx)`. No
   * pre-existing-pointer check — this is a fresh HGNode subclass whose
   * base ctor leaves 0x1a0 uninitialized (though the ctor also writes 0
   * to 0x198 and 0x1a8 explicitly; 0x1a0 gets the compositor unconditionally).
   */
  compositor: HgcAppleLog_encode | null;

  /**
   * Pointer to the gamut matrix data (a 16-float `HGColorMatrix4`). Field
   * @0x1a8. Unconditionally zeroed by the ctor @0x102f7a (`movq $0x0,
   * 0x1a8(%rbx)`), then optionally overwritten @0x102fe7 in either gamut
   * branch (LogColorimetry=1 → sourceToAppleWideGamut[SceneColorimetry];
   * LogColorimetry=0 & SceneColorimetry=0 → rec709RGBToRec2020RGB).
   *
   * The field is a RAW POINTER into static rodata (the tables themselves
   * live at @Helium 0x3d17b0 and 0x3cfc30 respectively). We model that with
   * a JS reference to the corresponding `HGColorMatrix4` array — the
   * observable behaviour (pass-by-pointer into HGColorMatrix::LoadMatrix)
   * is preserved.
   */
  gamutMatrixData: HGColorMatrix4 | null;

  /**
   * `HGAppleLog::Encode::Encode(SceneColorimetry, LogColorimetry)` —
   * Helium @0x102f30 (C2 base-object ctor). C1 @0x103030 is a 4-instruction
   * tail-`jmp` to C2, so only C2's body needs modelling.
   *
   * Verbatim asm (prologue/epilogue elided):
   *   0x102f44  callq __ZN6HGNodeC2Ev                            ; base ctor
   *   0x102f49  leaq  0x915cf0(%rip), %rax   ; = 0xa18c40         ; own installed vtable ptr
   *   0x102f50  movq  %rax, (%rbx)                               ; *this = vtable
   *   0x102f53  movq  $0x0, 0x198(%rbx)                          ; this.colorMatrix = null
   *   0x102f5e  movl  $0x1a0, %edi                               ; alloc size 0x1a0
   *   0x102f63  callq __ZN8HGObjectnwEm                          ; HGObject::operator new(...)
   *   0x102f68  movq  %rax, %r12
   *   0x102f6b  movq  %rax, %rdi
   *   0x102f6e  callq __ZN18HgcAppleLog_encodeC1Ev                ; placement ctor
   *   0x102f73  movq  %r12, 0x1a0(%rbx)                          ; this.compositor = new HgcAppleLog_encode
   *   0x102f7a  movq  $0x0, 0x1a8(%rbx)                          ; this.gamutMatrixData = null
   *   0x102f85..0x102fe7                                          ; enum-driven dispatch (see below)
   *   0x102fee  retq
   *
   * Enum dispatch (@0x102f85..0x102fe7) — see ENUM-DRIVEN GAMUT DISPATCH
   * block at the top of this file for the branch-by-branch walk. The
   * TS below reproduces the two cases that actually allocate/install
   * a matrix; all other enum values leave both `colorMatrix` and
   * `gamutMatrixData` at their pre-set `null` values.
   *
   * The exception-cleanup path @0x102ff9..0x10302a (delete + HGNode dtor +
   * __Unwind_Resume for both the HgcAppleLog_encode ctor throw and the
   * HGColorMatrix ctor throw) exists only to handle allocation failure or a
   * throwing sub-ctor; it never executes on a successful construction and is
   * not modelled explicitly (TS exceptions unwind naturally).
   */
  constructor(scene: SceneColorimetry, log: LogColorimetry) {
    // @Helium 0x102f44: HGNode base ctor.
    super();
    // @Helium 0x102f50: install this class's vtable (installed ptr = 0xa18c40).
    this.vtable = 0xa18c40;
    // @Helium 0x102f53: this.colorMatrix = null (unconditional pre-init).
    this.colorMatrix = null;
    // @Helium 0x102f5e..0x102f73: alloc 0x1a0 bytes + HgcAppleLog_encode ctor;
    // store to this.compositor. Throws until HgcAppleLog_encode is transcribed.
    this.compositor = newHgcAppleLog_encode();
    // @Helium 0x102f7a: this.gamutMatrixData = null (unconditional pre-init).
    this.gamutMatrixData = null;

    // @Helium 0x102f85..0x102fe7: enum-driven gamut branch.
    //
    // testl %r15d, %r15d ; je 0x102fbf  → if (log == 0) goto Log0
    // cmpl $0x1, %r15d   ; jne 0x102fee → if (log != 1 && log != 0) goto EPILOGUE
    if (log === LogColorimetry.Log1) {
      // @Helium 0x102f90..0x102fbd: LogColorimetry=1 branch.
      // @Helium 0x102f95..0x102fa0: alloc 0x1f0-byte HGColorMatrix.
      this.colorMatrix = newHGColorMatrix();
      // @Helium 0x102fa5: store to this.colorMatrix.
      //   (already assigned above; the store @0x102fa5 is the actual
      //    `movq %r15, 0x198(%rbx)` — modelled by the .colorMatrix
      //    assignment above.)
      // @Helium 0x102fac..0x102fba: pointer arithmetic on sourceToAppleWideGamut.
      //   ecx = SceneColorimetry * 64 = SceneColorimetry * sizeof(HGColorMatrix4)
      //   rax = &sourceToAppleWideGamut[SceneColorimetry]
      // Model with array indexing (the JS array element is the same 16 f32
      // block; passing it by reference into LoadMatrix preserves the
      // pass-by-pointer ABI).
      //
      // We do NOT bounds-check `scene` here: the binary does not; going
      // out-of-range in C++ would UB into adjacent rodata. In JS we
      // accept undefined and fault loudly on the read below if the caller
      // passes a value outside {0,1,2,3}.
      const idx = scene as number;
      const table = HGAppleLog_Encode_sourceToAppleWideGamut[idx];
      if (table === undefined) {
        throw new Error(
          `HGAppleLog::Encode ctor @Helium 0x102fb3: SceneColorimetry=${idx} out of range [0,3] — the binary emits no bounds check and would UB-read past the four-row sourceToAppleWideGamut table @0x3d17b0`,
        );
      }
      // @Helium 0x102fbd jmp 0x102fe7 → STORE_1A8: this.gamutMatrixData = rax.
      this.gamutMatrixData = table;
    } else if (log === LogColorimetry.Log0) {
      // @Helium 0x102fbf..0x102fe0: LogColorimetry=0 branch.
      // @Helium 0x102fc2 testl %r14d, %r14d ; jne 0x102fee
      if (scene === SceneColorimetry.Scene0) {
        // @Helium 0x102fc4..0x102fd9: alloc 0x1f0-byte HGColorMatrix + install.
        this.colorMatrix = newHGColorMatrix();
        // @Helium 0x102fe0..0x102fe7: this.gamutMatrixData = &rec709RGBToRec2020RGB.
        this.gamutMatrixData = HGColorGamma_rec709RGBToRec2020RGB;
      }
      // else: SceneColorimetry != 0 with LogColorimetry=0 — leave both null.
    }
    // else: LogColorimetry >= 2 — leave both null (jne @0x102f8e).
    // @Helium 0x102fee: retq.
  }

  /**
   * `HGAppleLog::Encode::~Encode()` — Helium @0x103040 (D2, base-object)
   * / @0x103090 (D1, complete-object) / @0x1030e0 (D0, deleting).
   *
   * All three share the same body up through the base-dtor call; D0
   * additionally tail-calls `HGObject::operator delete`. Body per D2 (which
   * D1 mirrors byte-for-byte modulo the leaq displacement) verbatim:
   *
   * D2 @0x103040..0x103080:
   *   0x103049  leaq  0x915bf0(%rip), %rax    ; = 0xa18c40 (own installed vtable ptr)
   *   0x103050  movq  %rax, (%rdi)            ; *this = vtable (reinstall)
   *   0x103053  movq  0x198(%rdi), %rdi       ; rdi = this.colorMatrix
   *   0x10305a  testq %rdi, %rdi
   *   0x10305d  je    0x103065                ; skip if null
   *   0x10305f  movq  (%rdi), %rax            ; rax = colorMatrix.vtable
   *   0x103062  callq *0x18(%rax)             ; colorMatrix.Release()
   *   0x103065  movq  0x1a0(%rbx), %rdi       ; rdi = this.compositor
   *   0x10306c  testq %rdi, %rdi
   *   0x10306f  je    0x103077                ; skip if null (unreachable after ctor)
   *   0x103071  movq  (%rdi), %rax            ; rax = compositor.vtable
   *   0x103074  callq *0x18(%rax)             ; compositor.Release()
   *   0x103077..0x103080                       ; tail-jmp HGNode::~HGNode()
   *
   * D0 @0x1030e0 differs from D2 in TWO ways: (i) the leaq displacement is
   * 0x915b50 (different PC, same target 0xa18c40); (ii) after HGNode::~HGNode()
   * the epilogue tail-`jmp __ZN8HGObjectdlEPv` frees `this` via
   * HGObject::operator delete. We model D0's operator-delete step at the JS
   * caller (dropping the reference).
   */
  destruct(): void {
    // @Helium 0x103050: vtable reinstall — modeled by assignment.
    this.vtable = 0xa18c40;
    // @Helium 0x103053..0x103062: release colorMatrix if present.
    if (this.colorMatrix != null) {
      this.colorMatrix.Release();
      this.colorMatrix = null;
    }
    // @Helium 0x103065..0x103074: release compositor if present (unreachable-null after ctor).
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x103080: tail-jmp HGNode::~HGNode()
    super.destruct();
  }

  /**
   * `HGAppleLog::Encode::GetOutput(HGRenderer*)` — Helium @0x103140.
   *
   * Rendering-graph wiring:
   *   1) input   = renderer.GetInput(this, 0)
   *   2) if this.colorMatrix != null:
   *        this.colorMatrix.SetInput(0, input)
   *        this.colorMatrix.LoadMatrix(this.gamutMatrixData, true)   // bool flag = 1 (edx = 0x1)
   *        pipeIn = this.colorMatrix
   *      else:
   *        pipeIn = input
   *   3) this.compositor.SetInput(0, pipeIn)
   *   4) this.compositor.SetParameter(0, C0.xmm0, C0.xmm1, C0.xmm2, 0.0f)      // log segment
   *   5) this.compositor.SetParameter(1, C1.xmm0, C1.xmm1, C1.xmm2, 0.0f)      // sqrt segment
   *   6) return this.compositor
   *
   * See the GETOUTPUT block at the top of this file for the verbatim asm
   * and the derivation of each RIP-relative constant.
   *
   * @param renderer  the containing HGRenderer (undecoded; only its
   *                  `GetInput` method is touched).
   * @returns         the compositor node this class wraps (i.e. the
   *                  output of the node graph for this filter).
   *
   * Throws if the compositor field is null (should be impossible after a
   * successful ctor), if `colorMatrix != null` and `gamutMatrixData == null`
   * (impossible per ctor invariants — the two fields are set together), or
   * if the compositor/matrix vtable slots aren't yet transcribed.
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x10314a: r14 = this.colorMatrix (nullable).
    const cm = this.colorMatrix;

    // @Helium 0x103159: input = renderer.GetInput(this, 0).
    const input = renderer.GetInput(this, 0);

    // @Helium 0x103161..0x103164: testq r14; je 0x103190 (skip matrix load).
    // @Helium 0x10315e: rdx = input (preserved across the null-test as the
    //                    fall-through's SetInput arg).
    let pipeIn: HGNode = input;
    if (cm != null) {
      // @Helium 0x10316e: colorMatrix.SetInput(0, input) via vtable *0x78.
      cm.SetInput(0, input);
      // @Helium 0x103171..0x103184: colorMatrix.LoadMatrix(this.gamutMatrixData, true).
      // gamutMatrixData is set atomically with colorMatrix in the ctor —
      // if colorMatrix != null then gamutMatrixData != null. But surface
      // that invariant as an explicit throw rather than a `!` shorthand.
      const data = this.gamutMatrixData;
      if (data == null) {
        throw new Error(
          "HGAppleLog::Encode::GetOutput @Helium 0x103178 — gamutMatrixData null while colorMatrix non-null (ctor invariant violated)",
        );
      }
      cm.LoadMatrix(data, true);
      // @Helium 0x103189: pipeIn = colorMatrix (rdx becomes this.colorMatrix).
      pipeIn = cm as unknown as HGNode;
    }

    // @Helium 0x103190: rdi = this.compositor.
    const comp = this.compositor;
    if (comp == null) {
      // Unreachable after successful ctor — but TS type-narrowing wants it
      // and a loud fault beats a `!` shorthand (rule 3).
      throw new Error(
        "HGAppleLog::Encode::GetOutput @Helium 0x103190 — compositor null (should be unreachable after ctor)",
      );
    }

    // @Helium 0x10319c: compositor.SetInput(0, pipeIn) via vtable *0x78.
    comp.SetInput(0, pipeIn);

    // @Helium 0x1031c6: compositor.SetParameter(0, C0.xmm0, C0.xmm1, C0.xmm2, 0.0f)
    // via vtable *0x60 — the LOG segment.
    comp.SetParameter(
      0,
      HGAppleLog_Encode_getOutput_call0_xmm0_f32,
      HGAppleLog_Encode_getOutput_call0_xmm1_f32,
      HGAppleLog_Encode_getOutput_call0_xmm2_f32,
      Math.fround(0.0),
    );

    // @Helium 0x1031f3: compositor.SetParameter(1, C1.xmm0, C1.xmm1, C1.xmm2, 0.0f)
    // via vtable *0x60 — the SQRT segment.
    comp.SetParameter(
      1,
      HGAppleLog_Encode_getOutput_call1_xmm0_f32,
      HGAppleLog_Encode_getOutput_call1_xmm1_f32,
      HGAppleLog_Encode_getOutput_call1_xmm2_f32,
      Math.fround(0.0),
    );

    // @Helium 0x1031f6..0x103201: return this.compositor (cast to HGNode by C++ inheritance).
    return comp as unknown as HGNode;
  }
}
