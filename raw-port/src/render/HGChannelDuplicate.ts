// raw-port/src/render/HGChannelDuplicate.ts
//
// FCP `HGChannelDuplicate` — Helium render-graph compute-kernel class
// (HGNode subclass) that implements the "select one RGBA channel and
// broadcast it into all four output channels" per-tile operation.
// Unlike its sibling `HGChannelCopy` (which is an HGNode facade owning
// an `HgcChannelCopy` kernel), `HGChannelDuplicate` IS the kernel
// itself — GetProgram/InitProgramDescriptor/RenderTile/SetParameter
// live on this class directly (no separate Hgc* kernel object; no
// +0x198 kernel pointer). The class stores a single `mode` field at
// offset 0x198 (0=R, 1=G, 2=B, 3=A).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice; fat
//             slice offset 0x4000; VAs below are unadjusted VM
//             addresses from `otool -tV`; file-offset = VA + 0x4000).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGChannelDuplicate.HGChannelDuplicate.s @0x222180 (C1)
//   raw-port/re/disasm/Helium.HGChannelDuplicate.~HGChannelDuplicate.s @0x2221e0 (D0)
//   raw-port/re/disasm/Helium.HGChannelDuplicate.GetProgram.s          @0x222200
//   raw-port/re/disasm/Helium.HGChannelDuplicate.InitProgramDescriptor.s @0x222250
//   raw-port/re/disasm/Helium.HGChannelDuplicate.RenderTile.s          @0x2229b0
//   raw-port/re/disasm/Helium.HGChannelDuplicate.SetParameter.s        @0x2230a0
//
// Ledger addresses (Helium.ledger.json):
//   0x222140  HGChannelDuplicate::HGChannelDuplicate()   [C2 base ctor]
//   0x222180  HGChannelDuplicate::HGChannelDuplicate()   [C1 complete ctor — transcribed body]
//   0x2221c0  HGChannelDuplicate::~HGChannelDuplicate()  [D2 base dtor]
//   0x2221d0  HGChannelDuplicate::~HGChannelDuplicate()  [D1 complete dtor]
//   0x2221e0  HGChannelDuplicate::~HGChannelDuplicate()  [D0 deleting dtor]
//   0x222200  HGChannelDuplicate::GetProgram(HGRenderer*)
//   0x222250  HGChannelDuplicate::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x2229b0  HGChannelDuplicate::RenderTile(HGTile*)
//   0x2230a0  HGChannelDuplicate::SetParameter(int, float, float, float, float)
//
// VTABLE INSTALLED IN THIS CLASS:
//   Single vptr write in C1 @0x22218e:
//     leaq 0x80fa93(%rip), %rax  → 0x222195 + 0x80fa93 = 0xa31c28
//   → vtable-for-HGChannelDuplicate is at Helium VM addr 0xa31c28.
//   D2/D1 do NOT re-write the vptr (they immediately tail-jmp
//   HGNode::~HGNode) — this class owns no kernel/state that needs a
//   pre-destroy vfn dispatch, so the vptr-reset defense used by
//   HGChannelCopy's dtors is unnecessary here.
//
// STRUCT LAYOUT (recovered from C1 + accessor asm):
//   HGChannelDuplicate {
//     +0x000  vptr                     (set = 0xa31c28 by C1 @0x222198)
//     +0x008..+0x00f  (HGObject base subobject — landed in HGObject.ts)
//     +0x010          u32 renderPageStrategy / flags — HGNode field
//                     C1 rewrites: (flags & ~0x600) | 0x400 @0x222198..0x2221a5
//     +0x018..+0x197  (rest of HGNode base subobject — landed in HGNode.ts;
//                      HGNode total size 0x198 confirmed by kernel-alloc
//                      calls in sibling HGChannelCopy @0x17a4ec)
//     +0x198  u32 mode                 (0=R, 1=G, 2=B, 3=A;
//                                       C1 @0x2221a8 init $0x3 (A);
//                                       SetParameter @0x2230e6 stores;
//                                       GetProgram @0x222206 reads;
//                                       InitProgramDescriptor @0x222261 reads;
//                                       RenderTile @0x2229c1 reads)
//   }
//   No +0x19c or higher fields are touched anywhere in this class's
//   asm. sizeof(HGChannelDuplicate) = 0x19c bytes (0x198 base + 4-byte
//   mode field). Note: no separate HgcChannelDuplicate kernel object
//   exists in the Helium symbol map (grep for "HgcChannelDuplicate"
//   returned nothing) — confirming this class is standalone.
//
// ─── C1 @Helium 0x222180 (complete-object ctor) ─────────────────────────────
//   __ZN18HGChannelDuplicateC1Ev:
//     0x222180  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x222186  movq  %rdi, %rbx
//     0x222189  callq __ZN6HGNodeC2Ev              ; HGNode::HGNode()  [landed]
//     0x22218e  leaq  0x80fa93(%rip), %rax         ; rax = 0xa31c28 (vtable)
//     0x222195  movq  %rax, (%rbx)                 ; this->vptr = vtable
//     0x222198  movl  $0xfffff9ff, %eax            ; eax = ~0x600
//     0x22219d  andl  0x10(%rbx), %eax             ; eax &= this->flags(+0x10)
//     0x2221a0  orl   $0x400, %eax                 ; eax |= 0x400
//     0x2221a5  movl  %eax, 0x10(%rbx)             ; this->flags = (flags & ~0x600) | 0x400
//     0x2221a8  movl  $0x3, 0x198(%rbx)            ; this->mode = 3 (default = Alpha)
//     0x2221b2..0x2221b8  epilogue / retq
//
//   The flags rewrite: bit 0x400 is set, bits 0x200 and 0x400's
//   neighbour 0x200 in mask 0x600 are cleared. This overwrites HGNode's
//   own default of renderPageStrategy=0x200 (installed by HGNode::HGNode
//   at @0x11bc3b) with 0x400 — a strategy-code distinct from the base.
//   The 0x600 mask (bits 0x200|0x400) suggests the two neighbouring
//   strategy codes are mutually exclusive; this class picks 0x400.
//
// ─── C2 @Helium 0x222140 (base-object ctor) ─────────────────────────────────
//   Body @0x222140 was not extracted separately (`disasm.sh` finds only
//   the C1 symbol at 0x222180 in the demangled map). Per Itanium ABI
//   for a class with no virtual bases, C2 and C1 do identical work; the
//   ledger's separate address exists because the compiler emits both
//   symbols. Both map to the same TS constructor.
//
// ─── D2 @Helium 0x2221c0 (base-object dtor) ─────────────────────────────────
//   __ZN18HGChannelDuplicateD2Ev:
//     0x2221c0  pushq %rbp / movq %rsp,%rbp / popq %rbp
//     0x2221c5  jmp   __ZN6HGNodeD2Ev              ; tail-chain HGNode::~HGNode
//
//   D2 does NOT reset the vptr — this class owns no destructor-side
//   state (no kernel pointer at +0x198 to release, unlike HGChannelCopy).
//   The `mode` u32 at +0x198 has trivial destruction.
//
// ─── D1 @Helium 0x2221d0 (complete-object dtor) ─────────────────────────────
//   __ZN18HGChannelDuplicateD1Ev: byte-identical body to D2 @0x2221c0
//   (independent emission — the compiler emits both slots but they do
//   the same thing).
//
// ─── D0 @Helium 0x2221e0 (deleting dtor) ────────────────────────────────────
//   __ZN18HGChannelDuplicateD0Ev:
//     0x2221e0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x2221e6  movq  %rdi, %rbx
//     0x2221e9  callq __ZN6HGNodeD2Ev              ; HGNode::~HGNode() [landed]
//     0x2221ee  movq  %rbx, %rdi
//     0x2221f1..0x2221f6  epilogue
//     0x2221f7  jmp   __ZN8HGObjectdlEPv           ; HGObject::operator delete(this)
//
//   D0 = D1's chain-to-HGNode plus a trailing operator-delete on `this`
//   — the Itanium deleting-dtor ABI pattern. In TS, GC subsumes the
//   trailing delete; provenance-cited only.
//
// ─── SetParameter @Helium 0x2230a0 ─────────────────────────────────────────
//   Signature: (this, int idx, float f0, float f1, float f2, float f3)
//              → int (1 = mode changed, 0 = unchanged, -1 = bad idx).
//   FCP call convention: idx in %esi, f0..f3 in xmm0..xmm3.
//
//   __ZN18HGChannelDuplicate12SetParameterEiffff:
//     0x2230a0  pushq %rbp / movq %rsp,%rbp
//     0x2230a4  movl  $0xffffffff, %eax          ; eax = -1 (bad-idx return)
//     0x2230a9  testl %esi, %esi
//     0x2230ab  je    0x2230af                   ; idx == 0 → decode mode
//     0x2230ad  popq  %rbp / retq                ; else return -1
//
//     0x2230af  xorl  %eax, %eax                 ; eax = 0 (unchanged return)
//     0x2230b1  xorps %xmm3, %xmm3               ; xmm3 = 0.0f
//     0x2230b4  ucomiss %xmm3, %xmm0             ; compare 0.0 with f0
//     0x2230b7  movl  $0x0, %ecx                 ; ecx = 0 (mode R)
//     0x2230bc  jne   0x2230de                   ; f0 != 0 → mode = 0
//     0x2230be  jp    0x2230de                   ; f0 == NaN → mode = 0 (unordered)
//
//     0x2230c0  movl  $0x1, %ecx                 ; ecx = 1 (mode G)
//     0x2230c5  ucomiss %xmm3, %xmm1             ; compare 0.0 with f1
//     0x2230c8  jne   0x2230de                   ; f1 != 0 → mode = 1
//     0x2230ca  jp    0x2230de                   ; f1 == NaN → mode = 1
//
//     0x2230cc  xorps %xmm0, %xmm0               ; xmm0 = 0.0f
//     0x2230cf  cmpneqss %xmm0, %xmm2            ; xmm2 = (xmm2 != xmm0) ? -1 : 0
//                                                ;   (result IN THE DEST, which is xmm2 in AT&T
//                                                ;   syntax: `cmpneqss src, dst` writes dst)
//     0x2230d4  movd  %xmm2, %ecx                ; ecx = low 32 bits of xmm2 (0 or -1)
//     0x2230d8  andl  $0x1, %ecx                 ; ecx = (f2 != 0) ? 1 : 0
//     0x2230db  xorl  $0x3, %ecx                 ; ecx = (f2 != 0) ? 2 : 3
//
//     0x2230de  cmpl  0x198(%rdi), %ecx          ; compare new mode with this->mode
//     0x2230e4  je    0x2230ad                   ; unchanged → return 0 (via 0x2230ad epilogue)
//     0x2230e6  movl  %ecx, 0x198(%rdi)          ; this->mode = new mode
//     0x2230ec  movl  $0x1, %eax                 ; eax = 1 (changed return)
//     0x2230f1  popq  %rbp / retq
//
//   Semantics: parameter #0 is a 4-vector (f0=R weight, f1=G, f2=B,
//   f3=A). The caller pushes a one-hot vector like (0,0,0,1) to select
//   the Alpha channel, (1,0,0,0) for Red, etc. FCP picks the FIRST
//   nonzero component in the order (R, G, B, A) — the same "priority"
//   scheme used by HGChannelCopy/HGChannelExtract families:
//     f0 != 0                → mode = 0 (R)
//     f0 == 0, f1 != 0       → mode = 1 (G)
//     f0 == 0, f1 == 0, f2 != 0 → mode = 2 (B)
//     f0 == f1 == f2 == 0    → mode = 3 (A) — DEFAULT
//   NOTE: f3 is loaded into xmm3 (arg-passing register) but is never
//   read — the "A" branch is the fall-through when R, G, B are all
//   zero. The compare-and-store is atomic-in-intent: return 1 only if
//   the mode actually changed, else 0 (used by HGNode's cache-invalidate
//   plumbing to skip re-encoding programs when SetParameter is a no-op).
//
//   PORTING NUMERICS: `ucomiss` is IEEE ordered compare, unordered
//   result (NaN) triggers PF, so `jne || jp` = "any-nonzero-or-NaN".
//   TS-side we use `!== 0 || Number.isNaN(x)`, wrapped in Math.fround
//   because the register values arrived via `cvtsi2ss` at the caller
//   (single-precision — see HGChannelCopy::SetCopyChannel @0x17a674).
//
// ─── GetProgram @Helium 0x222200 ───────────────────────────────────────────
//   Signature: (this, HGRenderer* r) → const char* (Metal shader source,
//              or nullptr if target format is not the expected 0x60B10).
//
//   __ZN18HGChannelDuplicate10GetProgramEP10HGRenderer:
//     0x222200  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x222206  movl  0x198(%rdi), %ebx          ; ebx = this->mode
//     0x22220c  movq  %rsi, %rdi                 ; arg1 = renderer
//     0x22220f  movl  $0x60000, %esi             ; arg2 = 0x60000 (target-idx)
//     0x222214  callq __ZN10HGRenderer9GetTargetEj ; HGRenderer::GetTarget(unsigned int)
//                                                ; returns pixel-format tag in %eax
//     0x222219  cmpq  $0x2, %rbx
//     0x22221d  ja    0x22222f                   ; mode > 2 → use A-shader literal pool
//
//     0x22221f  leaq  0x66b05a(%rip), %rcx       ; rcx = 0x88d280 (jumptable base)
//                                                ;   0x222226 + 0x66b05a = 0x88d280
//     0x222226  movslq (%rcx,%rbx,4), %rdx        ; rdx = *(int32_t*)&jt[mode] (sign-extended)
//     0x22222a  addq  %rcx, %rdx                  ; rdx = jumptable-base + offset
//     0x22222d  jmp   0x222236                    ; unconditional — jt is a data table, not jump
//
//     0x22222f  leaq  0x6f09dd(%rip), %rdx       ; rdx = &alphaShaderSrc (literal pool)
//                                                ;   0x222236 + 0x6f09dd = 0x913c13 (file)
//     0x222236  xorl  %ecx, %ecx                  ; ecx = 0
//     0x222238  cmpl  $0x60b10, %eax              ; check target format
//     0x22222d  cmoveq %rdx, %rcx                 ; if fmt == 0x60B10: rcx = rdx (shader)
//                                                ;                    else rcx stays 0 (null)
//     0x222241  movq  %rcx, %rax
//     0x222244..0x22224a  epilogue / retq
//
//   Semantics: return the pointer to the mode-specific single-channel-
//   broadcast Metal shader source, but ONLY if the render target's
//   pixel-format tag equals 0x60B10; otherwise return nullptr (the
//   caller falls back to the AVX CPU path).
//
//   The jumptable at data-VM 0x88d280 has three signed int32 entries
//   (one per mode 0/1/2), each an offset relative to the table base:
//     jt[0] = 0xFFFFF991 = -1647 → shader for mode 0 (R) at
//             file 0x88cc11 (VM) → data at 0x88cc11 + 0x4000 = 0x890c11
//     jt[1] = 0xFFFFFBB6 = -1098 → shader for mode 1 (G) at VM 0x88ce36
//     jt[2] = 0xFFFFFDDB = -549  → shader for mode 2 (B) at VM 0x88d05b
//   These were verified by reading the u64 at 0x88d280 and 0x88d288 via
//   `resolve.py Helium const` (result: 0xfffffbb6fffff991 and low32
//   0xfffffddb at 0x88d288).
//
//   Mode 3 (A) uses the "default" branch at 0x22222f, which loads
//   another RIP-relative shader source pointer (offset 0x6f09dd from
//   0x222236 → VM 0x913c13). All FOUR shader strings were byte-verified
//   in the binary via string search — see SHADER SOURCE STRINGS block
//   below.
//
//   The target-format tag 0x60B10 is HGRenderer's pixel-format code
//   returned by GetTarget(0x60000). The 0x60000 argument to GetTarget
//   is a "target-index" query; the constant appears verbatim as
//   `movl $0x60000, %esi` @0x22220f (transcribed as-is, not decoded).
//
// ─── SHADER SOURCE STRINGS (verified from binary at listed file offsets) ──
//   These are the exact Metal-shader source strings the FCP binary
//   ships, byte-for-byte, so the caller of GetProgram receives the same
//   contents as the app. They implement single-channel-broadcast:
//     r0.<ch> = hg_Texture0.sample(hg_Sampler0, uv).<ch>
//     output.color0 = r0.<ch><ch><ch><ch>
//   which is a 4-tap-broadcast of one channel to all four outputs.
//
//   Mode 0 (Red)   @VM 0x88cc11 / file 0x890c11 (548 bytes null-terminated)
//   Mode 1 (Green) @VM 0x88ce36 / file 0x890e36 (548 bytes)
//   Mode 2 (Blue)  @VM 0x88d05b / file 0x89105b (548 bytes)
//   Mode 3 (Alpha) @VM 0x913c13 (via literal-pool leaq @0x22222f — the
//                                shader that ends "//MD5=0d669a84:...")
//
//   Full contents are stored in the exported constants
//   HG_CHANNEL_DUPLICATE_SHADER_R / _G / _B / _A below. Every character
//   was byte-verified against the framework binary; the //LEN= header,
//   //MD5= trailer, and //SIG= trailer are part of Helium's shader-
//   compiler protocol (LEN = declared payload length, MD5 = cache key,
//   SIG = fragment-descriptor signature).
//
// ─── InitProgramDescriptor @Helium 0x222250 ────────────────────────────────
//   Signature: (this const, HGProgramDescriptor* pd) → void.
//   Body is 419 asm lines of HGProgramDescriptor plumbing with a
//   4-way switch on this->mode (identical layout to GetProgram):
//     mode 0 (R): "RedChannel_hgc_visible"   + Red   fragment source
//                 + SetFragmentFunctionName("RedChannel")
//     mode 1 (G): "GreenChannel_hgc_visible" + Green fragment source
//                 + SetFragmentFunctionName("GreenChannel")
//     mode 2 (B): "BlueChannel_hgc_visible"  + Blue  fragment source
//                 + SetFragmentFunctionName("BlueChannel")
//     mode 3 (A, default @0x22263f):
//                 "AlphaChannel_hgc_visible" + Alpha fragment source
//                 + SetFragmentFunctionName("AlphaChannel")
//   Each mode block calls, in order (extracted from the disasm):
//     HGProgramDescriptor::SetVisibleShaderWithSource(name, source)
//     HGProgramDescriptor::SetFragmentFunctionName(name)
//     HGProgramDescriptor::SetReturnBinding(binding@{u32=4, tag=0x16, "Fragment"→"Output"})
//     std::vector<HGBinding>::emplace_back — for two HGBinding entries
//     (u32=2, tag=0xc, "float4"...) and (u32=10, tag=0xc, "float4"...)
//   The tag/format/binding numeric constants (0x4, 0x16, 0x2, 0xa, 0xc,
//   "float4" ASCII 0x616f6c66, "Frag" ASCII 0x67617246, ...) are all
//   inline immediates in the asm; they are provenance-cited but the
//   HGProgramDescriptor/HGBinding classes themselves are NOT YET
//   TRANSCRIBED (frontier callees). Rather than build fake stand-ins,
//   we route the whole call through a single frontier stub that carries
//   this->mode. See `InitProgramDescriptor()` implementation.
//
// ─── RenderTile @Helium 0x2229b0 ───────────────────────────────────────────
//   Signature: (this, HGTile* tile) → void. Body is 467 asm lines:
//     1. Read this->mode @0x2229c1 (+0x198).
//     2. Call tile->Renderer() @0x2229cb — HGTile::Renderer() vfn.
//     3. Call renderer->GetTarget(0) @0x2229d5 to fetch a format tag.
//     4. Switch on this->mode:
//          mode 0 (R): if fmt >= 0x4700000 → GetRedChannelTile_AVX(tile, &state, node)
//                      else → inline SSE scalar broadcast loop @0x222bac
//          mode 1 (G): if fmt >= 0x4700000 → GetGreenChannelTile_AVX(tile, &state, node)
//                      else → inline SSE scalar broadcast loop @0x222a47
//          mode 2 (B): if fmt >= 0x4700000 → GetBlueChannelTile_AVX(tile, &state, node)
//                      else → inline SSE scalar broadcast loop @0x222afc
//          mode 3 (A, default): if fmt >= 0x4700000 → GetAlphaChannelTile_AVX(tile, &state, node)
//                      else → inline SSE scalar broadcast loop @0x222c5c
//     5. Join at @0x223085 (epilogue).
//
//   The four `Get<X>ChannelTile_AVX` helpers are FILE-LOCAL statics
//   (mangled with `__ZL` prefix — internal linkage) that take
//   (HGTile*, HGChannelDuplicate::State*, HGNode*). "State" is a struct
//   HGChannelDuplicate builds on the stack (not extracted here — it is
//   at %rbp-relative slots in RenderTile's prologue). These four
//   helpers are NEW FRONTIER CALLEES surfaced by this port.
//
//   The inline SSE fallback loops (per mode) each use `shufps` with an
//   imm8 mask specific to the channel (mode 1's mask is 0x55 = 0b01010101
//   which broadcasts lane 1 = Green; other modes use 0x00/0xaa/0xff for
//   R/B/A). The loop body reads two xmm registers of source pixels, does
//   the shufps broadcast, and writes back to the destination tile row.
//   The full transcription of these four loops requires decoding the
//   HGTile struct layout (fields at +0x00/+0x04/+0x08/+0x0c/+0x10/+0x18/
//   +0x50/+0x58 are all touched — pixel-buffer base, row-stride, pixel-
//   stride, width, height, count-remaining, etc.) which is out of scope
//   for this class port. RenderTile therefore ROUTES to a single frontier
//   `HGChannelDuplicate_renderTile_impl` stub that surfaces the demand
//   signal on the HGTile layout + AVX-helper family.
//
// FRONTIER CALLEES SURFACED BY THIS PORT (each throws with @0xADDR):
//   __ZL21GetRedChannelTile_AVXP6HGTilePN18HGChannelDuplicate5StateEP6HGNode   @0x2229f9
//   __ZL23GetGreenChannelTile_AVXP6HGTilePN18HGChannelDuplicate5StateEP6HGNode @0x222a0d
//   __ZL22GetBlueChannelTile_AVXP6HGTilePN18HGChannelDuplicate5StateEP6HGNode  @0x222a25
//   __ZL23GetAlphaChannelTile_AVXP6HGTilePN18HGChannelDuplicate5StateEP6HGNode @0x222a3d
//   HGProgramDescriptor::SetVisibleShaderWithSource                            @0x22229c/0x2223d7/...
//   HGProgramDescriptor::SetFragmentFunctionName                               @0x2222ab/0x2223e6/...
//   HGProgramDescriptor::SetReturnBinding                                      @0x2222e8/etc.
//   HGRenderer::GetTarget(unsigned int)                                        @0x222214/0x2229d5
//   HGTile::Renderer() const                                                   @0x2229cb
//   HGObject::operator delete(void*)                                           @0x2221f7 (D0 tail)
//   __ZN6HGNodeC2Ev / __ZN6HGNodeD2Ev — LANDED (imported from HGNode.ts)
//
// Landed callees (imported, not re-stubbed):
//   HGNode::HGNode()          @0x11baf0 → import { HGNode }        (base ctor)
//   HGNode::~HGNode()         @0x11bf20 → import { HGNode }        (base dtor)

/* eslint-disable @typescript-eslint/no-unused-vars */

import { HGNode } from "./HGNode";

/**
 * Opaque handle for Helium's `HGRenderer*` — the render-graph context
 * threaded through GetProgram and (indirectly, via HGTile) RenderTile.
 * Renderer.GetTarget() and Renderer.GetInput() are @Helium symbols not
 * yet transcribed.
 */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * Opaque handle for Helium's `HGTile*` — a per-tile compute context
 * whose struct layout (pixel-buffer base at +0x10/+0x50, row-stride
 * fields at +0x18/+0x58, tile-bounds at +0x00/+0x04/+0x08/+0x0c, etc.)
 * is inline-decoded by RenderTile's SSE fallback loops but has NOT been
 * lifted to a typed struct in this port. See doc-comment on RenderTile
 * above for the fields touched.
 */
export type HGTilePtr = { readonly __brand: "HGTile" };

/**
 * Opaque handle for Helium's `HGProgramDescriptor*` — the shader-
 * program-descriptor builder consumed by InitProgramDescriptor. Its
 * methods (SetVisibleShaderWithSource, SetFragmentFunctionName,
 * SetReturnBinding, ...) and the HGBinding struct that
 * SetReturnBinding + std::vector<HGBinding>::emplace_back consume are
 * NOT YET TRANSCRIBED.
 */
export type HGProgramDescriptorPtr = { readonly __brand: "HGProgramDescriptor" };

/**
 * `HGChannelDuplicate::mode` — 4-valued channel-selector enum stored as
 * a u32 at +0x198. Named for the shader-string filenames the FCP
 * binary uses (RedChannel / GreenChannel / BlueChannel / AlphaChannel).
 *
 * Values matter — they are the direct output of SetParameter's
 * priority selector and the direct input to GetProgram's mode-dispatch.
 */
export const HG_CHANNEL_MODE_R = 0; // @Helium SetParameter ecx=0 @0x2230b7
export const HG_CHANNEL_MODE_G = 1; // @Helium SetParameter ecx=1 @0x2230c0
export const HG_CHANNEL_MODE_B = 2; // @Helium SetParameter ecx=2 (via xor $0x3, $0x1) @0x2230db
export const HG_CHANNEL_MODE_A = 3; // @Helium SetParameter ecx=3 (via xor $0x3, $0x0) @0x2230db
                                     //         also C1 default @0x2221a8

/**
 * Mode-0 (Red-broadcast) fragment shader source string, byte-verified
 * from the Helium binary at file offset 0x890c11 (VM 0x88cc11), length
 * 548 bytes (null-terminated). The Metal payload broadcasts the .x
 * channel of the sole texture sample into all four output lanes.
 *
 * @Helium 0x88cc11 (data-VM; ref via GetProgram jumptable jt[0] @0x88d280
 *                   entry 0xFFFFF991 → 0x88d280 + (-1647) = 0x88cc11)
 */
export const HG_CHANNEL_DUPLICATE_SHADER_R: string =
  "//Metal1.0     \n" +
  "//LEN=0000000224\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    float4 r0;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0.x = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).x;\n" +
  "    output.color0 = r0.xxxx;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=afe150a7:d1fa7b3c:7b54c672:6f0b4d06\n" +
  "//SIG=00000000:00000001:00000001:00000000:0000:0000:0001:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * Mode-1 (Green-broadcast) fragment shader source, @Helium VM 0x88ce36
 * (file 0x890e36). Broadcasts the .y channel.
 *
 * @Helium 0x88ce36 (data-VM; ref via GetProgram jumptable jt[1] @0x88d284
 *                   entry 0xFFFFFBB6 → 0x88d280 + (-1098) = 0x88ce36)
 */
export const HG_CHANNEL_DUPLICATE_SHADER_G: string =
  "//Metal1.0     \n" +
  "//LEN=0000000224\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    float4 r0;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0.y = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).y;\n" +
  "    output.color0 = r0.yyyy;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=a629e940:823b4839:1a08014d:4943d094\n" +
  "//SIG=00000000:00000001:00000001:00000000:0000:0000:0001:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * Mode-2 (Blue-broadcast) fragment shader source, @Helium VM 0x88d05b
 * (file 0x89105b). Broadcasts the .z channel.
 *
 * @Helium 0x88d05b (data-VM; ref via GetProgram jumptable jt[2] @0x88d288
 *                   entry 0xFFFFFDDB → 0x88d280 + (-549) = 0x88d05b)
 */
export const HG_CHANNEL_DUPLICATE_SHADER_B: string =
  "//Metal1.0     \n" +
  "//LEN=0000000224\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    float4 r0;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0.z = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).z;\n" +
  "    output.color0 = r0.zzzz;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=b917e04b:4d04ed2f:73f1229d:13796e91\n" +
  "//SIG=00000000:00000001:00000001:00000000:0000:0000:0001:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * Mode-3 (Alpha-broadcast) fragment shader source, @Helium VM 0x913c13
 * (loaded via RIP-relative literal-pool leaq @0x22222f in GetProgram).
 * This is the DEFAULT branch (mode > 2) — it broadcasts the .w channel.
 *
 * The `.wwww` swizzle at the end shows this is the alpha-broadcast
 * variant used for compositing masks / opacity channels.
 *
 * @Helium 0x913c13 (data-VM; via `leaq 0x6f09dd(%rip)` @0x22222f →
 *                   0x222236 + 0x6f09dd = 0x913c13)
 */
export const HG_CHANNEL_DUPLICATE_SHADER_A: string =
  "//Metal1.0     \n" +
  "//LEN=0000000224\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    float4 r0;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0.w = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).w;\n" +
  "    output.color0 = r0.wwww;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=0d669a84:74d52223:5a1f273b:8c5af334\n" +
  "//SIG=00000000:00000001:00000001:00000000:0000:0000:0001:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * HGRenderer target-format tag `HGChannelDuplicate::GetProgram` requires
 * for the Metal path. Any other format returned by GetTarget(0x60000)
 * causes GetProgram to return null (forcing the CPU/AVX fallback).
 *
 * @Helium 0x222238 `cmpl $0x60b10, %eax`
 */
export const HG_CHANNEL_DUPLICATE_TARGET_TAG: number = 0x60b10;

/**
 * HGRenderer target-index passed to GetTarget in GetProgram.
 *
 * @Helium 0x22220f `movl $0x60000, %esi`
 */
export const HG_CHANNEL_DUPLICATE_TARGET_INDEX: number = 0x60000;

/**
 * HGRenderer format threshold RenderTile compares against to pick
 * between the AVX helpers and the SSE scalar fallback loops.
 *
 * @Helium 0x2229eb / 0x222a03 / 0x222a17 / 0x222a2f `cmpl $0x4700000`
 */
export const HG_CHANNEL_DUPLICATE_AVX_FORMAT_MIN: number = 0x4700000;

/**
 * Frontier: `GetRedChannelTile_AVX(HGTile*, HGChannelDuplicate::State*,
 * HGNode*)` — file-local static (mangled `__ZL21GetRedChannelTile_AVX
 * P6HGTilePN18HGChannelDuplicate5StateEP6HGNode`). AVX fast-path for
 * mode 0, taken when the renderer target format tag ≥ 0x4700000. Not
 * yet transcribed at @0x2229f9.
 */
function GetRedChannelTile_AVX(
  _tile: HGTilePtr,
  _state: unknown,
  _node: HGNode,
): void {
  // @0x2229f9 callq __ZL21GetRedChannelTile_AVX...
  throw new Error(
    "GetRedChannelTile_AVX @Helium __ZL21GetRedChannelTile_AVXP6HGTilePN18HGChannelDuplicate5StateEP6HGNode @0x2229f9 not yet transcribed",
  );
}

/**
 * Frontier: `GetGreenChannelTile_AVX(HGTile*, HGChannelDuplicate::State*,
 * HGNode*)` — file-local static (mangled `__ZL23GetGreenChannelTile_AVX
 * P6HGTilePN18HGChannelDuplicate5StateEP6HGNode`). AVX fast-path for
 * mode 1. Not yet transcribed at @0x222a0d.
 */
function GetGreenChannelTile_AVX(
  _tile: HGTilePtr,
  _state: unknown,
  _node: HGNode,
): void {
  // @0x222a0d callq __ZL23GetGreenChannelTile_AVX...
  throw new Error(
    "GetGreenChannelTile_AVX @Helium __ZL23GetGreenChannelTile_AVXP6HGTilePN18HGChannelDuplicate5StateEP6HGNode @0x222a0d not yet transcribed",
  );
}

/**
 * Frontier: `GetBlueChannelTile_AVX(HGTile*, HGChannelDuplicate::State*,
 * HGNode*)` — file-local static (mangled `__ZL22GetBlueChannelTile_AVX
 * P6HGTilePN18HGChannelDuplicate5StateEP6HGNode`). AVX fast-path for
 * mode 2. Not yet transcribed at @0x222a25.
 */
function GetBlueChannelTile_AVX(
  _tile: HGTilePtr,
  _state: unknown,
  _node: HGNode,
): void {
  // @0x222a25 callq __ZL22GetBlueChannelTile_AVX...
  throw new Error(
    "GetBlueChannelTile_AVX @Helium __ZL22GetBlueChannelTile_AVXP6HGTilePN18HGChannelDuplicate5StateEP6HGNode @0x222a25 not yet transcribed",
  );
}

/**
 * Frontier: `GetAlphaChannelTile_AVX(HGTile*, HGChannelDuplicate::State*,
 * HGNode*)` — file-local static (mangled `__ZL23GetAlphaChannelTile_AVX
 * P6HGTilePN18HGChannelDuplicate5StateEP6HGNode`). AVX fast-path for
 * mode 3. Not yet transcribed at @0x222a3d.
 */
function GetAlphaChannelTile_AVX(
  _tile: HGTilePtr,
  _state: unknown,
  _node: HGNode,
): void {
  // @0x222a3d callq __ZL23GetAlphaChannelTile_AVX...
  throw new Error(
    "GetAlphaChannelTile_AVX @Helium __ZL23GetAlphaChannelTile_AVXP6HGTilePN18HGChannelDuplicate5StateEP6HGNode @0x222a3d not yet transcribed",
  );
}

/**
 * Frontier: `HGRenderer::GetTarget(unsigned int idx)` — used by
 * GetProgram (idx=0x60000) and RenderTile (idx=0) to fetch the current
 * render-target's pixel-format tag. Not yet transcribed at @0x222214 /
 * @0x2229d5.
 */
function HGRenderer_GetTarget(_renderer: HGRendererPtr, _idx: number): number {
  // @0x222214 callq __ZN10HGRenderer9GetTargetEj (%esi = 0x60000)
  // @0x2229d5 callq __ZN10HGRenderer9GetTargetEj (%esi = 0)
  throw new Error(
    "HGRenderer::GetTarget(unsigned int) @Helium __ZN10HGRenderer9GetTargetEj @0x222214/@0x2229d5 not yet transcribed",
  );
}

/**
 * Frontier: `HGTile::Renderer() const` — accessor returning the tile's
 * owning HGRenderer. Called at RenderTile @0x2229cb. Not yet
 * transcribed.
 */
function HGTile_Renderer(_tile: HGTilePtr): HGRendererPtr {
  // @0x2229cb callq __ZNK6HGTile8RendererEv
  throw new Error(
    "HGTile::Renderer() const @Helium __ZNK6HGTile8RendererEv @0x2229cb not yet transcribed",
  );
}

/**
 * Frontier: end-to-end HGProgramDescriptor plumbing for InitProgram-
 * Descriptor's mode-N block. The FCP body performs, per mode:
 *   pd->SetVisibleShaderWithSource("<Mode>Channel_hgc_visible",
 *                                  "<Mode>Channel visible-fragment src")
 *   pd->SetFragmentFunctionName("<Mode>Channel")
 *   pd->SetReturnBinding({tag=0x16, u32=4, name="FragmentOutput"})
 *   pd->fragmentBindings.emplace_back({tag=0xc, u32=2 , "float4"...})
 *   pd->fragmentBindings.emplace_back({tag=0xc, u32=10, "float4"...})
 *
 * Because HGProgramDescriptor, HGBinding, and the std::vector<HGBinding>
 * emplace-back path are all frontier classes, this single stub carries
 * the full call at once (surfacing the demand signal without inventing
 * a fake HGProgramDescriptor).
 *
 * @Helium InitProgramDescriptor per-mode call chains:
 *   mode 0 (R): @0x22229c/@0x2222ab/@0x2222e8/@0x22233e/@0x22238b
 *   mode 1 (G): @0x2223d7/@0x2223e6/... (mirror layout starting @0x2223c7)
 *   mode 2 (B): @0x222513/@0x222522/... (mirror layout starting @0x222503)
 *   mode 3 (A, default): @0x22264f/@0x22265e/... (mirror layout starting @0x22263f)
 */
function HGChannelDuplicate_configureProgramDescriptor(
  _pd: HGProgramDescriptorPtr,
  _mode: number,
): void {
  throw new Error(
    "HGProgramDescriptor::{SetVisibleShaderWithSource,SetFragmentFunctionName,SetReturnBinding,fragmentBindings.emplace_back} plumbing @Helium InitProgramDescriptor per-mode chains @0x22229c/@0x2223d7/@0x222513/@0x22264f not yet transcribed",
  );
}

/**
 * Frontier: end-to-end RenderTile SSE-scalar-fallback body. Taken when
 * the renderer target format tag < 0x4700000 (AVX threshold not met).
 * The per-mode fallback loops (@0x222bac / @0x222a47 / @0x222afc /
 * @0x222c5c) inline the channel-broadcast math using `shufps` with
 * mode-specific imm8 masks:
 *   R (0x00 = 0b00000000): broadcast lane 0
 *   G (0x55 = 0b01010101): broadcast lane 1
 *   B (0xaa = 0b10101010): broadcast lane 2
 *   A (0xff = 0b11111111): broadcast lane 3
 * over the pixel-buffer at HGTile+0x10 (destination) and HGTile+0x50
 * (source), with row strides at HGTile+0x18/+0x58 and bounds at
 * HGTile+0x00..+0x0c. Full transcription requires an HGTile struct
 * decode — separate port unit.
 *
 * @Helium RenderTile SSE-fallback branch anchors @0x222a47/@0x222afc/
 *          @0x222bac/@0x222c5c
 */
function HGChannelDuplicate_renderTile_impl(
  _self: HGChannelDuplicate,
  _tile: HGTilePtr,
  _mode: number,
  _targetFormat: number,
): void {
  throw new Error(
    "HGChannelDuplicate SSE-scalar fallback RenderTile branches @Helium @0x222a47/@0x222afc/@0x222bac/@0x222c5c not yet transcribed (HGTile struct decode required)",
  );
}

/**
 * `HGChannelDuplicate` — Helium's render-graph compute kernel for the
 * single-channel-broadcast operation (a 1-input filter that picks one
 * of the source's RGBA channels and replicates it into all four output
 * channels; used e.g. to visualize an alpha mask as grayscale RGB, or
 * to extract a single channel into a display-ready RGBA texture).
 *
 * @Helium symbols owned by this class:
 *   C2                    @0x222140  (aliased to C1 body per Itanium ABI)
 *   C1                    @0x222180
 *   D2                    @0x2221c0
 *   D1                    @0x2221d0
 *   D0                    @0x2221e0
 *   GetProgram            @0x222200
 *   InitProgramDescriptor @0x222250
 *   RenderTile            @0x2229b0
 *   SetParameter          @0x2230a0
 *
 * VTable installed at @Helium VM 0xa31c28. Inherits HGNode's vtable
 * slots (Retain/Release/GetInput/SetInput/...) — this class overrides
 * only the ctor/dtor slots plus the compute-kernel virtuals
 * (GetProgram/InitProgramDescriptor/RenderTile/SetParameter,
 * corresponding to the vtable slots HGProgramDescriptor-family kernels
 * use — see sibling HGChannelCopy vtable analysis @0xa22aa8).
 */
export class HGChannelDuplicate extends HGNode {
  /**
   * Channel-selector mode at +0x198. u32. One of HG_CHANNEL_MODE_R/G/B/A.
   *
   * - Initialized to HG_CHANNEL_MODE_A (3) by C1 @0x2221a8.
   * - Read by GetProgram @0x222206 to pick the Metal shader.
   * - Read by InitProgramDescriptor @0x222261 to pick the visible
   *   fragment shader + function name.
   * - Read by RenderTile @0x2229c1 to pick the AVX helper or SSE loop.
   * - Written by SetParameter @0x2230e6 (only when the newly-computed
   *   mode differs from the current one).
   *
   * The field is declared `number` (u32 in TS) — the C++ compare
   * (`cmpl 0x198(%rdi), %ecx` @0x2230de) is a full 32-bit compare so
   * TS's plain-number semantics are exact here.
   */
  mode: number;

  /**
   * `HGChannelDuplicate::HGChannelDuplicate()` — Helium C1 @0x222180
   * (C2 @0x222140 shares this body per Itanium ABI alias).
   *
   * Faithful transcription:
   *   0x222189  HGNode::HGNode()               ; super() — handled by TS `extends`
   *   0x22218e  vptr = 0xa31c28                ; TS: virtual dispatch via class shape
   *   0x222198  flags = (flags & ~0x600) | 0x400   ; rewrite HGNode's default 0x200
   *   0x2221a8  mode  = HG_CHANNEL_MODE_A (3)  ; default channel = Alpha
   *
   * @Helium 0x222180 __ZN18HGChannelDuplicateC1Ev
   */
  constructor() {
    super();
    // @0x22218e vptr install — virtual dispatch is class-shape in TS.
    // @0x222198..0x2221a5 rewrite renderPageStrategy: (flags & ~0x600) | 0x400
    this.renderPageStrategy = (this.renderPageStrategy & ~0x600) | 0x400;
    // @0x2221a8 movl $0x3, 0x198(%rbx) — mode defaults to Alpha (broadcast .w)
    this.mode = HG_CHANNEL_MODE_A;
  }

  /**
   * `HGChannelDuplicate::SetParameter(int idx, float f0, float f1,
   * float f2, float f3)` — Helium @0x2230a0. Returns 1 if `mode` was
   * mutated, 0 if the compare-and-set was a no-op, -1 for a bad idx.
   *
   * The FCP body decodes a 4-vec "priority one-hot" into the compact
   * `mode` enum:
   *   f0 != 0 (or NaN)              → mode = 0 (R)
   *   f0 == 0, f1 != 0 (or NaN)     → mode = 1 (G)
   *   f0 == 0, f1 == 0, f2 != 0     → mode = 2 (B)
   *   f0 == 0, f1 == 0, f2 == 0     → mode = 3 (A)  — DEFAULT
   * f3 is loaded into xmm3 by the caller ABI but never inspected —
   * the "A" mode is the fall-through of the R/G/B priority ladder.
   *
   * @Helium 0x2230a0 __ZN18HGChannelDuplicate12SetParameterEiffff
   */
  SetParameter(
    idx: number,
    f0: number,
    f1: number,
    f2: number,
    // f3 is present in the C++ signature but the disasm never reads it
    // (loaded into xmm3, then discarded when the priority ladder falls
    // through to mode=3). Preserved here for signature fidelity.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    f3: number,
  ): number {
    // @0x2230a4..0x2230ae: bad-idx guard
    if (idx !== 0) {
      return -1;
    }
    // @0x2230af..0x2230cb: R/G ladder using `ucomiss xmm3(=0), xmm{0,1}`
    //   `jne || jp` = f != 0 OR f is NaN
    // Match FCP single-precision numerics: the caller arrives via
    // `cvtsi2ss` at HGChannelCopy::SetCopyChannel @0x17a674 (and
    // sibling call sites), so the incoming floats are already
    // single-precision-representable. We still fround the comparison
    // input for Rule 4 (Match the machine's numerics) faithfulness —
    // it matters when a JS caller supplies a value that is nonzero as
    // double but rounds to zero as float32.
    const g0 = Math.fround(f0);
    const g1 = Math.fround(f1);
    const g2 = Math.fround(f2);
    let newMode: number;
    if (g0 !== 0 || Number.isNaN(g0)) {
      // @0x2230b7 mov ecx, 0 ; @0x2230bc/be jne/jp → skip further compares
      newMode = HG_CHANNEL_MODE_R;
    } else if (g1 !== 0 || Number.isNaN(g1)) {
      // @0x2230c0 mov ecx, 1 ; @0x2230c8/ca jne/jp
      newMode = HG_CHANNEL_MODE_G;
    } else {
      // @0x2230cc..0x2230db:
      //   xorps xmm0,xmm0 ; cmpneqss xmm0,xmm2 ; movd xmm2,ecx
      //   and ecx,1       ; xor ecx,3
      // → ecx = (f2 != 0) ? 2 : 3
      //   (`cmpneqss` writes to the DEST (xmm2 in AT&T `cmpneqss %xmm0,%xmm2`),
      //   yielding all-ones for "not equal", all-zeros for "equal"; movd
      //   drops the low 32 bits into ecx as 0xFFFFFFFF or 0; `and 1` folds
      //   to 1 or 0; `xor 3` flips to 2 or 3.)
      // NOTE: unlike the R/G branches, the B branch's cmpneqss is
      //   ordered-and-non-NaN-tests-true (any NaN also yields "not
      //   equal" for cmpneqss because NaN compares unordered), so we
      //   treat NaN as "nonzero" here too — matching the R/G branches.
      newMode =
        g2 !== 0 || Number.isNaN(g2) ? HG_CHANNEL_MODE_B : HG_CHANNEL_MODE_A;
    }

    // @0x2230de..0x2230f2: cmp with current mode; store if changed.
    if (newMode === this.mode) {
      // @0x2230e4 je → the shared "return 0" epilogue via 0x2230ad,
      //   but ONLY after eax was cleared at 0x2230af. So the retval
      //   here is 0, not -1.
      return 0;
    }
    // @0x2230e6 movl %ecx, 0x198(%rdi) ; @0x2230ec movl $0x1, %eax
    this.mode = newMode;
    return 1;
  }

  /**
   * `HGChannelDuplicate::GetProgram(HGRenderer* renderer)` — Helium
   * @0x222200. Returns the Metal shader source string for the current
   * `mode`, or `null` if the render target's pixel-format tag isn't
   * HG_CHANNEL_DUPLICATE_TARGET_TAG (0x60B10).
   *
   * The C++ returns `const char*`, so we mirror with `string | null`.
   * The four shader source strings are byte-verified constants (see
   * HG_CHANNEL_DUPLICATE_SHADER_{R,G,B,A}).
   *
   * @Helium 0x222200 __ZN18HGChannelDuplicate10GetProgramEP10HGRenderer
   */
  GetProgram(renderer: HGRendererPtr): string | null {
    // @0x222206 movl 0x198(%rdi), %ebx — read mode
    const m = this.mode;
    // @0x22220f/@0x222214: renderer->GetTarget(0x60000)
    const targetFormat = HGRenderer_GetTarget(
      renderer,
      HG_CHANNEL_DUPLICATE_TARGET_INDEX,
    );

    // @0x222219..0x22222d: switch on mode → pick shader
    //   mode ∈ {0,1,2} : jumptable at data-VM 0x88d280 selects R/G/B
    //   mode > 2 (i.e. 3) : literal-pool default at data-VM 0x913c13 = A
    let shader: string;
    if (m > 2) {
      // @0x22222f leaq 0x6f09dd(%rip), %rdx → 0x913c13
      shader = HG_CHANNEL_DUPLICATE_SHADER_A;
    } else {
      // @0x22221f jumptable base 0x88d280; sign-extended int32 offsets
      // resolved above (see class-level SHADER SOURCE STRINGS block).
      // TS switch mirrors the three-entry table one-to-one.
      switch (m) {
        case HG_CHANNEL_MODE_R:
          shader = HG_CHANNEL_DUPLICATE_SHADER_R;
          break;
        case HG_CHANNEL_MODE_G:
          shader = HG_CHANNEL_DUPLICATE_SHADER_G;
          break;
        case HG_CHANNEL_MODE_B:
          shader = HG_CHANNEL_DUPLICATE_SHADER_B;
          break;
        default:
          // mode < 0 is unreachable via SetParameter (which clamps to
          // {0,1,2,3}) and the ctor default is 3, so this branch is
          // unreachable from within the class. The FCP asm would
          // interpret it as an out-of-bounds jumptable read (undefined
          // in the binary); we mirror that as an assertion-throw
          // rather than inventing a fallback string.
          throw new Error(
            "HGChannelDuplicate.mode out of range (expected 0..3) @Helium 0x222226 jumptable read",
          );
      }
    }

    // @0x222236..0x22223d: return shader iff target format matches.
    //   xorl ecx,ecx ; cmp eax,0x60b10 ; cmoveq rdx,rcx ; mov rax,rcx
    return targetFormat === HG_CHANNEL_DUPLICATE_TARGET_TAG ? shader : null;
  }

  /**
   * `HGChannelDuplicate::InitProgramDescriptor(HGProgramDescriptor* pd)
   * const` — Helium @0x222250. Configures the render pipeline's
   * program descriptor with the mode-specific visible-fragment shader,
   * function name, return binding, and constant-buffer/texture
   * bindings.
   *
   * The FCP body does a 4-way switch on `this->mode` (structurally
   * identical to GetProgram's switch) and, per mode, calls a sequence
   * of HGProgramDescriptor methods with mode-specific string operands.
   * Because HGProgramDescriptor + HGBinding + std::vector<HGBinding>
   * are all frontier classes not yet transcribed, we route the whole
   * per-mode call chain through a single frontier stub so the demand
   * signal is unambiguous on the ledger.
   *
   * @Helium 0x222250 __ZNK18HGChannelDuplicate21InitProgramDescriptorEP19HGProgramDescriptor
   */
  InitProgramDescriptor(pd: HGProgramDescriptorPtr): void {
    // @0x222261 movl 0x198(%rdi), %eax — read mode.
    // @0x222271..0x222285: 4-way switch (mode 2 → 0x222503,
    //   mode 1 → 0x2223c7, mode 0 → 0x22228b (fall-through of
    //   test/jne), else mode 3 default → 0x22263f).
    const m = this.mode;
    // The four per-mode chains do the same shape of work with different
    // string constants; we route via the mode selector.
    HGChannelDuplicate_configureProgramDescriptor(pd, m);
  }

  /**
   * `HGChannelDuplicate::RenderTile(HGTile* tile)` — Helium @0x2229b0.
   * Executes the per-tile channel-broadcast compute. Selects among:
   *   1. Metal shader (already returned by GetProgram) — handled
   *      elsewhere in the render pipeline; this method is the CPU-side
   *      fallback that runs when Metal is not the active backend.
   *   2. Four `Get<X>ChannelTile_AVX` file-local statics (AVX 8-lane
   *      fast path) when the target format tag ≥ 0x4700000.
   *   3. Four inline SSE-scalar `shufps`-based broadcast loops when
   *      the format tag < 0x4700000.
   *
   * Steps 1-4 (mode read, renderer/target lookup, mode dispatch,
   * AVX-vs-SSE choice) are transcribed here as control flow. The four
   * AVX helpers are individual frontier stubs above; the four SSE
   * fallback loops are routed via a single frontier stub since they
   * require an HGTile struct decode.
   *
   * @Helium 0x2229b0 __ZN18HGChannelDuplicate10RenderTileEP6HGTile
   */
  RenderTile(tile: HGTilePtr): void {
    // @0x2229c1 movl 0x198(%rdi), %r14d — read mode.
    const m = this.mode;
    // @0x2229cb callq HGTile::Renderer() — fetch renderer from tile.
    const renderer = HGTile_Renderer(tile);
    // @0x2229d5 renderer->GetTarget(0) — fetch pixel-format tag.
    const targetFormat = HGRenderer_GetTarget(renderer, 0);

    // @0x2229da..0x222a42: 4-way switch on mode with AVX/SSE choice.
    //   mode 2  (B) : @0x222a17 cmp 0x4700000 ; AVX branch → GetBlueChannelTile_AVX
    //                                          SSE branch → @0x222afc (fallback)
    //   mode 1  (G) : @0x222a03 cmp 0x4700000 ; AVX → GetGreenChannelTile_AVX
    //                                          SSE → @0x222a47
    //   mode 0  (R) : @0x2229eb cmp 0x4700000 ; AVX → GetRedChannelTile_AVX
    //                                          SSE → @0x222bac
    //   mode 3  (A, default @0x222a2f):
    //                @0x222a2f cmp 0x4700000 ; AVX → GetAlphaChannelTile_AVX
    //                                          SSE → @0x222c5c
    // "self" (`this` — %rbx in the SSE loop prologues) is passed as
    // the third arg to the AVX helpers, cast to HGNode* in the mangling.
    const isAvxPath = targetFormat >= HG_CHANNEL_DUPLICATE_AVX_FORMAT_MIN;
    if (m > 2) {
      // Default (A) branch @0x222a2f
      if (isAvxPath) {
        // @0x222a3d callq GetAlphaChannelTile_AVX
        GetAlphaChannelTile_AVX(tile, {}, this);
      } else {
        // @0x222c5c SSE fallback for A
        HGChannelDuplicate_renderTile_impl(this, tile, m, targetFormat);
      }
      return;
    }
    switch (m) {
      case HG_CHANNEL_MODE_R:
        if (isAvxPath) {
          // @0x2229f9 callq GetRedChannelTile_AVX
          GetRedChannelTile_AVX(tile, {}, this);
        } else {
          // @0x222bac SSE fallback for R
          HGChannelDuplicate_renderTile_impl(this, tile, m, targetFormat);
        }
        return;
      case HG_CHANNEL_MODE_G:
        if (isAvxPath) {
          // @0x222a0d callq GetGreenChannelTile_AVX
          GetGreenChannelTile_AVX(tile, {}, this);
        } else {
          // @0x222a47 SSE fallback for G
          HGChannelDuplicate_renderTile_impl(this, tile, m, targetFormat);
        }
        return;
      case HG_CHANNEL_MODE_B:
        if (isAvxPath) {
          // @0x222a25 callq GetBlueChannelTile_AVX
          GetBlueChannelTile_AVX(tile, {}, this);
        } else {
          // @0x222afc SSE fallback for B
          HGChannelDuplicate_renderTile_impl(this, tile, m, targetFormat);
        }
        return;
      default:
        // Same unreachable-in-practice guard as GetProgram — cited to
        // the jumptable address rather than inventing a fallback.
        throw new Error(
          "HGChannelDuplicate.mode out of range (expected 0..3) @Helium 0x2229da RenderTile switch",
        );
    }
  }
}
