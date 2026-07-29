// raw-port/src/render/HGHybridQTGammaLog_Decode.ts
//
// FCP `HGHybridQTGammaLog::Decode` — nested Helium HGNode subclass.
// Inverse of HGHybridQTGammaLog::Encode. Wraps an owned
// `HgcHybridQTGammaLog_decode` compositor and configures it, via two
// SetParameter calls, to implement the HybridQTGammaLog inverse transfer
// function (a piecewise gamma+log curve) for a selected `CurveParams`
// enum value chosen from the class-static `calcParams` table (7 rows).
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY:
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_C2.s         (C2 ctor)
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_C1.s         (C1 — tail-jmp to C2)
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_D2.s         (D2)
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_D1.s         (D1)
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_D0.s         (D0)
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_GetOutput.s  (GetOutput)
//
// SYMBOLS:
//   @Helium 0x1020a0  HGHybridQTGammaLog::Decode::Decode(CurveParams)  [C2]  __ZN18HGHybridQTGammaLog6DecodeC2ENS_11CurveParamsE
//   @Helium 0x1021a0  HGHybridQTGammaLog::Decode::Decode(CurveParams)  [C1] — tail-jmp to C2
//   @Helium 0x1021b0  HGHybridQTGammaLog::Decode::~Decode()            [D2]  __ZN18HGHybridQTGammaLog6DecodeD2Ev
//   @Helium 0x1021f0  HGHybridQTGammaLog::Decode::~Decode()            [D1]  __ZN18HGHybridQTGammaLog6DecodeD1Ev
//   @Helium 0x102230  HGHybridQTGammaLog::Decode::~Decode()            [D0]  __ZN18HGHybridQTGammaLog6DecodeD0Ev
//   @Helium 0x102280  HGHybridQTGammaLog::Decode::GetOutput(HGRenderer*)  __ZN18HGHybridQTGammaLog6Decode9GetOutputEP10HGRenderer
//
// EXTERNAL DATA:
//   @Helium 0x3d1320  HGHybridQTGammaLog::calcParams  __ZN18HGHybridQTGammaLog10calcParamsE
//                     — 7 × 4-double entries (32 B stride, 224 B total, extends to 0x3d1400).
//                     Indexed in the ctor by `%esi` (the CurveParams argument) via
//                     `shl $5,%r14 ; lea calcParams(%rip),%r15 ; movsd (%r14,%r15,1),xmm0` etc.
//                     Rows (byte-exact from thin binary; see PARAM ROWS below):
//                       [0] @0x3d1320  (0.45, 0.156988586799704, 0.242153048019952, 0.911444349863366)
//                       [1] @0x3d1340  (0.65, 0.039413394636874, 0.58754407898788,  0.91163383271243)
//                       [2] @0x3d1360  (0.7,  0.032213844371303, 0.647069904476356, 0.927979840798557)
//                       [3] @0x3d1380  (0.75, 0.025473992510207, 0.706708589068692, 0.943211012261694)
//                       [4] @0x3d13a0  (0.8,  0.019206207568828, 0.766314309661166, 0.957307322378127)
//                       [5] @0x3d13c0  (0.85, 0.013433967356171, 0.825729626565662, 0.970224916230858)
//                       [6] @0x3d13e0  (0.9,  0.008201507308713, 0.884763036183495, 0.98187510020643)
//
//   @Helium 0x3d1400  HGHybridQTGammaLog::kDefaultCurveParams (u32 = 0).
//                     Not referenced from Decode's own code — captured for provenance only.
//
// VTABLE:
//   Installed pointer = 0xa18340. Recovered from ctor @0x1020b5
//     `leaq 0x916284(%rip), %rax` → (0x1020bc + 0x916284) = 0xa18340.
//   All three dtors reinstall the same target via different `leaq`
//   displacements (D2 @0x1021b6 → 0x1021bd + 0x916183 = 0xa18340;
//   D1 @0x1021f6 → 0x1021fd + 0x916143 = 0xa18340;
//   D0 @0x102239 → 0x102240 + 0x916100 = 0xa18340).
//
// CTOR ARG ORDER (@0x1020a0):
//   rdi = this
//   esi = curveParams  (CurveParams enum, u32 index into calcParams; captured into r14d)
//
// STRUCT LAYOUT (recovered from C2 @0x1020a0 + GetOutput @0x102280):
//   HGHybridQTGammaLog::Decode extends HGNode (base ctor @0x1020b0, so HGNode
//   occupies offsets 0x00..0x197 per raw-port/src/render/HGNode.ts). This
//   subclass adds:
//     0x198 : HgcHybridQTGammaLog_decode*  compositor  (alloc'd + ctor'd @0x1020c4/0x1020cf)
//     0x1a0 : float                        pow_field   (log-segment SetParameter arg #0)
//     0x1a4 : float                        invClnL     (linear-segment SetParameter arg #1)
//     0x1a8 : float                        cLo         (linear-segment SetParameter arg #2)
//     0x1ac : float                        negDivClnL  (linear-segment SetParameter arg #3)
//   Total = 0x1b0. All four floats written together via a single
//   `movapd %xmm0, 0x1a0(%rbx)` @0x102153.
//
// CTOR TAIL MATH (@0x1020db..0x102153) — verbatim decode of the packed math:
//   r14 = curveParams (u32, zero-extended)
//   r14 <<= 5                             ; ×32-byte stride
//   r15 = &calcParams                     @0x1020e2
//   xmm0 = calcParams[i].d0                @0x1020e9  (movsd (r14+r15))    ; = p.d0
//   xmm1 = calcParams[i].d1                @0x1020ef  (movsd 0x08(r14+r15)); = p.d1
//   -0x20(%rbp) = xmm1                     @0x1020f6  (save p.d1)
//   xmm1 = 0.5112474437627812              @0x1020fb  (movsd 0x2ced3d(%rip); mem @0x3d0e40)
//   callq _pow                             @0x102103   ; xmm0 = pow(p.d0, 0.5112474437627812)
//   xmm2 = p.d1  (reloaded)                @0x102108
//   xmm2 *= 0.6931471805599453             @0x10210d  (mulsd 0x2ced23(%rip); mem @0x3d0e38 = ln 2)
//     ⟹ xmm2 = p.d1 * ln2
//   xmm1 = 1.0                             @0x102115  (movsd 0x2c8143(%rip); mem @0x3ca260)
//   xmm1 /= xmm2                           @0x10211d
//     ⟹ xmm1 = 1.0 / (p.d1 * ln2)
//   xmm3 = xmm2   (= p.d1 * ln2, save)     @0x102121
//   xmm2 = p.d3                            @0x102125  (movsd 0x18(r14+r15))
//   xmm2 xor= -0.0                         @0x10212c  (xorpd 0x2c89ac(%rip); mem @0x3caae0 = -0.0)
//     ⟹ xmm2 = -p.d3            (sign-flip via xor with 0x8000000000000000 in low lane)
//   xmm2 /= xmm3                           @0x102134
//     ⟹ xmm2 = -p.d3 / (p.d1 * ln2)
//   xmm3 = p.d2                            @0x102138  (movsd 0x10(r14+r15))
//   unpcklpd xmm2, xmm3                    @0x10213f
//     ⟹ xmm3 (packed doubles) = [p.d2, -p.d3/(p.d1*ln2)]
//   unpcklpd xmm1, xmm0                    @0x102143
//     ⟹ xmm0 (packed doubles) = [pow(p.d0, 0.5112474437627812), 1.0/(p.d1*ln2)]
//   cvtpd2ps xmm0, xmm0                    @0x102147  ; two low f32 lanes
//   cvtpd2ps xmm3, xmm1                    @0x10214b  ; two low f32 lanes
//   unpcklpd xmm1, xmm0                    @0x10214f  ; xmm0 (packed) = [xmm0_lo, xmm1_lo]
//     ⟹ xmm0 as 4 f32s = [pow_field, invClnL, cLo, negDivClnL]
//   movapd xmm0, 0x1a0(%rbx)               @0x102153  ; store all four f32 fields at once
//
//   Equivalently, the four f32 subclass fields evaluate to:
//     pow_field  = f32( pow(p.d0, 0.5112474437627812) )     // stored @0x1a0
//     invClnL    = f32( 1.0 / (p.d1 * ln2) )                // stored @0x1a4
//     cLo        = f32( p.d2 )                              // stored @0x1a8
//     negDivClnL = f32( -p.d3 / (p.d1 * ln2) )              // stored @0x1ac
//   All four are packed by the C compiler via CVTPD2PS + UNPCKLPD; we compute
//   them scalar-wise in TS and pass through Math.fround to match the SIMD
//   `cvtpd2ps` narrowing (f32 rounding on each lane independently).
//
// GETOUTPUT (@0x102280..0x102309) — rendering-graph wiring:
//   1) input   = HGRenderer::GetInput(this, 0)                    @0x102299
//   2) compositor.vtable[0x78] (segment 0, input=input)           @0x1022a9
//        args: esi=0, rdx=input.
//   3) compositor.vtable[0x60] (esi=0, xmm0=pow_field,
//                                     xmm1=0.0f, xmm2=0.0f, xmm3=0.0f)   @0x1022c9
//   4) compositor.vtable[0x60] (esi=1, xmm0=1.9559999704360962f,
//                                     xmm1=invClnL, xmm2=cLo, xmm3=negDivClnL) @0x1022fb
//      (xmm0 loaded from RIP-relative constant @Helium 0x3d0fbc = 0x3ffa5e35 f32.)
//   5) return this.compositor                                     @0x1022fe
//
// UNDECODED CALLEES (throw-stubs required per PORTING_SPEC.md rule 3):
//   HgcHybridQTGammaLog_decode::HgcHybridQTGammaLog_decode()  @Helium __ZN26HgcHybridQTGammaLog_decodeC1Ev — invoked @0x1020cf
//   HgcHybridQTGammaLog_decode vtable slot *0x60             (SetParameter-like) — invoked twice from GetOutput
//   HgcHybridQTGammaLog_decode vtable slot *0x78             (SetInput-like)     — invoked once from GetOutput
//   HgcHybridQTGammaLog_decode vtable slot *0x18             (Release)           — invoked from dtors
//   HGObject::operator new(unsigned long)     @Helium __ZN8HGObjectnwEm  — invoked @0x1020c4
//   HGObject::operator delete(void*)          @Helium __ZN8HGObjectdlEPv — invoked @0x102266 (D0) / @0x10216c (C2 unwind)
//   HGRenderer::GetInput(HGNode*, int)        @Helium __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x102299
//   pow (libm)                                @Helium __stub 0x3c54ec — invoked @0x102103 in C2 (base←xmm0, exp←xmm1)
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';
