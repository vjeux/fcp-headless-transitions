# Motion particle PRNG = TEA (Tiny Encryption Algorithm) — RECOVERED 2026-07-24

## BREAKTHROUGH
The particle spawn RNG that I (and prior notes) called an "unrecoverable host RNG"
(shared blocker with Noise/Static) is in fact **TEA**, a fully deterministic,
stateless, recoverable hash. Recovered from the FCP Particles plugin:
  /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles
Symbol: `PCRandom::getRandTEAf(unsigned int, unsigned int, unsigned int)`
(__ZN8PCRandom11getRandTEAfEjjj) — calls the inlined `PCRandom::hashTEA(uint,uint,uint)`.

## EXACT ALGORITHM (from the x86_64 slice disassembly @ 0x178e0)
Inputs: v0 (arg1/edi), v1 (arg2/esi), k0 (arg3/edx).
Key constants (PCRandom::hashTEA::kK1/kK2/kK3, __data @ 0xe1c60/64/68):
  kK1 = 0x000004a7, kK2 = 0x80100000, kK3 = 0x0000d410
Delta = 0x9E3779B9, 32 rounds. All math is uint32 (mask 0xFFFFFFFF).

  sum = 0x9E3779B9
  repeat 32 times:
    v0 += ( ((v1<<4)+k0) ^ (sum+v1) ^ ((v1>>>5)+kK1) )
    v1 += ( ((v0<<4)+kK2) ^ (sum+v0) ^ ((v0>>>5)+kK3) )
    sum += 0x9E3779B9
  out_u32 = v1 ^ v0
  return out_u32 / 2^32     // uniform [0,1)

NOTE: the disasm writes the FIRST half into v0 (edi) and the SECOND half into v1
(esi), then returns (v1 ^ v0). The k0 (arg3) participates ONLY in the first half's
(v1<<4)+k0 term — i.e. arg3 is TEA key-word 0, kK1/kK2/kK3 are key-words 1/2/3.
Verified TS impl produces well-distributed uniform values (see emitter-sim TEA).

## REMAINING WORK (to actually match FCP particle frames)
1. Confirm the (arg1,arg2,arg3) → (seed, particleIndex, attributeStream) mapping by
   reading `PSEmitter::initPropertiesFromShape` + `genPosGeometry` (the callers).
   The binary is FAT (x86_64 + arm64e); disassemble the SAME slice consistently.
2. Per-particle attribute draw order (position, velocity dir, speed, life, scale,
   spin) — each is a getRandTEAf call with a specific stream index.
3. Birth model: initialNumber burst at emitter `in`, birthRate accrual, life+randomness.
4. Emitter seed = emitterSeed (25785 for Drop_In) combined with cell randomSeed (18155).
Once wired, the 4 particle transitions (Drop_In 12.03, Wipes/Stylized Diagonal 16.6,
Glide 18.31) become matchable. This DOWNGRADES the "unrecoverable PRNG" blocker to a
"recoverable TEA + spawn-logic wiring" task.
