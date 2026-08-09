// raw-port/src/render/HGDotGraph.ts
//
// Helium `HGDotGraph` — the graphviz-style ".dot" debug-graph emitter used by the
// Helium render engine to dump its render-node graph for diagnostics. Only the
// `footnode` setter is decoded here (the append-only frontier grows one method at
// a time); other members are not yet transcribed.
//
// FRAMEWORK: Helium.framework
// FAT slice: thin binary /tmp/Helium.x86_64 (segment __TEXT vmaddr == file offset).
//
// DISASSEMBLY:
//   raw-port/re/disasm/Helium.__ZN10HGDotGraph8footnodeEb.s
//
// SYMBOLS:
//   @Helium 0x8deb0  HGDotGraph::footnode(bool)   __ZN10HGDotGraph8footnodeEb
//
// STRUCT LAYOUT (recovered from footnode @0x8deb0):
//   0x39 : bool  footnode   (the "emit a foot/sink node" flag; store @0x8deb4
//                            `movb %sil, 0x39(%rdi)`)
//   No other fields are touched by any ported entry point.

export class HGDotGraph {
  /**
   * `footnode` flag — offset 0x39. Written by HGDotGraph::footnode(bool)
   * (@Helium 0x8deb4 `movb %sil, 0x39(%rdi)`). Default not decoded here (set
   * by the — not-yet-transcribed — ctor); leave `undefined` until observed.
   */
  footnodeFlag?: boolean;

  /**
   * HGDotGraph::footnode(bool) @Helium 0x8deb0  (mangled __ZN10HGDotGraph8footnodeEb)
   *
   * Disassembly (5 real instructions after the frame prologue):
   *   0x8deb0  pushq %rbp
   *   0x8deb1  movq  %rsp, %rbp
   *   0x8deb4  movb  %sil, 0x39(%rdi)   ; this->footnodeFlag = (bool)arg
   *   0x8deb8  popq  %rbp
   *   0x8deb9  retq
   *
   * A plain 1-byte setter: store the low byte of the bool argument (%sil, from
   * the incoming `bool` in %esi) into `this + 0x39`.
   */
  footnode(value: boolean): void {
    // @Helium 0x8deb4  movb %sil, 0x39(%rdi)
    this.footnodeFlag = value;
  }
}
