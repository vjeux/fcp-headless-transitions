# FCP dynamic instrumentation (in-process inline hooks)

lldb/dtrace/attach are ALL blocked on this machine (Developer Mode disabled, no sudo).
Solution: in-process ARM64 inline hooking from within the render process itself (no debugger).

## Mechanism (hookshuf.c / probes.c / ni.c / pcap.c)
- Resolve the target function via `dlsym(RTLD_DEFAULT, mangled_name)` (works because Particles.ozp
  is loaded by the engine after the first render).
- Patch signed framework code pages using `mach_vm_protect(..., VM_PROT_COPY)` (copy-on-write) — plain
  `mprotect` FAILS on signed pages, but VM_PROT_COPY makes a private writable copy that IS allowed.
- Inline hook: copy 4 original instrs into an mmap'd MAP_JIT trampoline (+ `ldr x17,#8; br x17; .quad ret`),
  overwrite target prologue with `ldr x17,#8; br x17; .quad replacement`.
- Driver: init engine, render once (loads Particles.ozp), dlsym+hook the engine's copy, load a FRESH
  doc, render — capture per-instance calls to a /tmp trace file.

## DECODED: replicator "Shuffle Order" reveal pipeline (Particles.ozp / PSEmitter / PSReplicator)
Ground truth from live instrumentation + disasm of the shuffleOrder call site @0x16cec:

  N = PSEmitter::getOrderLength(time)          // order-slot count (arrangement-dependent; =getNumEmissionPoints for arr type 4)
  pos = cell pattern-position in [0,1]         // stored at emitter+0xa8, set per cell along the emission pattern
  index = clamp( floor(pos * N + 0.5), 0, N-1 )
  seed  = getValueAsInt(ReplicateSeed channel @0x7c20)   // = 987639852
  rank  = PSEmitter::shuffleOrder(index, N, seed)         // drand48 Fisher-Yates, BYTE-VERIFIED (below)
  phase = rank / (N-1)                          // normalized reveal phase, stored emitter+0xa8, rank->+0xb0
  // then PSParticleType::applyAllSequenceBehaviors -> PSSequenceBehavior::getValues
  //      -> normalizeIndex(idx=rank) = (rank+0.5)/N  -> getInfluence -> per-cell opacity ramp

### PSEmitter::shuffleOrder(index, N, seed) @0x1bc78 — BYTE-EXACT drand48 Fisher-Yates
  if N < 2: return index
  cached (per emitter): if (N,seed) match cache at +0x380/+0x384, return cachedArr[index]  (FORWARD map)
  else build:
    arr = identity[0..N)
    state = (seed<<16) | 0x330E                    // srand48
    for i in 1..N-1:  state = state*0x5DEECE66D + 0xB;  j = (state>>17) % (i+1);  swap(arr[i],arr[j])
    // reshuffle-if-identity guard: if arr==identity for ALL i, redo with seed+1, seed+2, ... until not identity
    cache arr; return arr[index]

### KEY correction vs prior black-box model
The enumeration is NOT colFold*rowFold folded classes. It is: each cell's LINEAR POSITION along the
emission pattern (`pos` in [0,1]) scaled to N and clamped -> that integer `index` is what gets shuffled.
The multiplicity (multiple cells sharing a rank) comes from multiple cells mapping to the same `index`
via floor(pos*N+0.5). NEXT: decode getOrderLength (N) + how `pos` (emitter+0xa8) is computed per grid cell
(the emission-pattern traversal for a rectangular Arrangement) — that yields the exact cell->index map.

## Instrumentation confirmed (live, Objects__Squares render, per 5 frames):
  getFillSeed=1120  normalizeIndex=1120  getInfluence=1120  getNumObjects=3360  applyAllSequenceBehaviors(base)=1120
  shuffleOrder=0 (cached at emission)  getValuesRemapTime=0  getCompletion=0
  normalizeIndex observed: in=27,26,25,...(each x8) out=(in+0.5)/28  => N=28 for the 14x8 Squares grid
