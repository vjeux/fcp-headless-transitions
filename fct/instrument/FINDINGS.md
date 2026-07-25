# Objects__Squares replicator reveal — DECODED via live in-process instrumentation

## Instrumentation method (lldb/dtrace/attach ALL blocked: Developer Mode off, no sudo)
In-process ARM64 inline hooking from WITHIN the render process (no external debugger):
- Resolve target fn via `dlsym(RTLD_DEFAULT, mangled)` (works: Particles.ozp loaded by engine after 1st render).
- Patch signed framework code pages with `mach_vm_protect(..., VM_PROT_COPY)` (COW) — plain mprotect FAILS on
  signed pages; VM_PROT_COPY makes a private writable copy that IS allowed.
- Trampoline: copy 4 orig instrs into MAP_JIT RWX page + `ldr x17,#8; br x17; .quad ret`; overwrite prologue
  with `ldr x17,#8; br x17; .quad replacement`. See hookshuf.c / probes.c / ni.c / pcap.c.
- Driver: init engine, render once (loads Particles.ozp), dlsym+hook engine's copy, load FRESH doc, render;
  log per-call args to /tmp.

## LIVE-CONFIRMED call counts (Objects__Squares, 5 render frames)
  getFillSeed=1120  normalizeIndex=1120  getInfluence=1120  getNumObjects=3360  applyAllSequenceBehaviors(base)=1120
  shuffleOrder=0  getValuesRemapTime=0  getCompletion=0  getNumEmissionPointsAndOrders=0
  => shuffleOrder is CACHED at emission (not called per-frame). Per-cell reveal index lives in PSParticle+0xb0.
  => normalizeIndex(index) observed: in=27,26,25,...(desc, x8 each) out=(index+0.5)/28  => N=28 for 14x8 grid.

## DECODED REVEAL PIPELINE (Particles.ozp: PSEmitter / PSReplicator / PSSequenceBehavior)
Per grid cell with raster index i (function @0x16204, shuffleOrder call site @0x16cec):
  col = i % cols;  row = (i / cols) % rows                      (0x16bd4-0x16bf4: sdiv/msub decompose)
  cellPos = normalized position along emission pattern in [0,1]  (stored emitter+0xa8; from col/row fractions)
  N   = PSEmitter::getOrderLength(time)                          (=getNumEmissionPoints for arr type; =28 here)
  index = clamp( floor(cellPos * N + 0.5), 0, N-1 )              (0x16c90-0x16cc0)
  seed  = getValueAsInt(ReplicateSeed channel @0x7c20)           (= 987639852)
  rank  = PSEmitter::shuffleOrder(index, N, seed)                (drand48 Fisher-Yates, BYTE-VERIFIED @0x1bc78)
  phase = rank / (N-1)                                           (0x16cf0-0x16cfc; stored +0xa8, rank->+0xb0)
  reveal via PSParticleType::applyAllSequenceBehaviors -> PSSequenceBehavior::getValues
       -> normalizeIndex(rank)=(rank+0.5)/N -> getInfluence -> per-cell opacity ramp

## PSEmitter::shuffleOrder(index, N, seed) @0x1bc78 — BYTE-EXACT (drand48 FY + reshuffle-if-identity)
  if N<2: return index
  cached: if (N==cache_N @+0x380 && seed==cache_seed @+0x384): return cachedArr[index]   (FORWARD map arr[index])
  else build (0x1bd0c-0x1be30):
    arr = identity[0..N)
    state = (seed<<16) | 0x330E
    for i in 1..N-1: state = state*0x5DEECE66D + 0xB;  j = (state>>17) % (i+1);  swap(arr[i],arr[j])
    // reshuffle-if-identity guard (0x1be34+): if arr==identity for ALL i, rebuild with seed+1, seed+2, ...
    cache; return arr[index]

## KEY CORRECTION vs prior black-box model
The enumeration is NOT colFold*rowFold folded classes. It is: each cell's LINEAR pattern-position
(cellPos in [0,1]) scaled to N and clamped -> integer `index`; that index is shuffled by drand48 FY.
Multiple cells map to the same `index` (via floor(cellPos*N+0.5)) => share a reveal rank (the observed
"fold" multiplicity is an artifact of position quantization to N slots, NOT a symmetry fold).
NEXT: decode getOrderLength(N) precisely + the exact cellPos formula (col/row fraction combine) for a
rectangular Arrangement -> gives the exact cell->index->rank map to implement in the TS engine.
