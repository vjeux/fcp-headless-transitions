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

## ARG MAPPING (from PSEmitter::initPropertiesFromShape, x86_64 slice @ 0x18983+)
Each spawn-attribute draw is: `getRandTEAf(w0, w1, w2)` where
  • w0 (edi) = a per-call value from a virtual call `*0x20(vtable)` on the emitter/particle
    object (r12) — re-fetched before EACH draw (a running per-particle counter / particle index).
  • w1 (esi) = a HARD-CODED per-ATTRIBUTE stream salt (the "which random am I" selector):
      0x3712F987  → attribute/axis 0 (X)
      0x83820093  → attribute/axis 1 (Y)
      0x39002838  → attribute/axis 2 (Z)
    (These three recur across every geometry path — rect/circle/burst — as the XYZ salts.
     Other attributes — speed, life, scale, spin — will have their OWN salts; enumerate them
     from the remaining getRandTEAf sites in initPropertiesFromShape + genPosGeometry + the
     life/scale/spin draw functions.)
  • w2 (edx) = a value from virtual call `*0x258(vtable)` on the particle-type object (-0x30) —
    the per-cell SEED (combines the emitter/cell Random Seed; e.g. Drop_In cell randomSeed=18155,
    emitterSeed=25785). Re-fetched before each draw (so it's the same seed each time, or a seed
    stream advanced per particle).
Output xmm0 = uniform [0,1); the caller maps it into the attribute range (e.g. emission cone
angle, speed±randomness, life±randomness, scale±randomness).

## STATUS
Primitive teaRand() shipped + verified in emitter-sim.ts (matches getRandTEAf bit-exactly on 5
probe triples). NEXT: decode `*0x20` (per-particle index source) + `*0x258` (seed accessor) +
enumerate the remaining attribute salts + the birth/initialNumber timing, then replace the
placeholder hash01 spawn draws with teaRand(index, salt, seed). Then Drop_In/Diagonal/Glide
particle fields become frame-matchable.

## SPAWN DRAW STRUCTURE (refined, x86_64 slice)
Function: PSEmitter::initPropertiesFromShape(uint shapeType, CMTime const& t,
          PSParticleType* pt, PSParticle* p, OZSimStateElement&, PCVector3<double>& out, bool&)
Locals: -0x38(rbp) = PSParticle* p (r15/arg4); -0x30(rbp) = PSEmitter* this (r12); -0x60 = CMTime t.
Each attribute draw compiles to:
    w0 = p->vmethod_0x20()                 // per-PARTICLE value (particle index / birth id)
    w1 = <hard-coded attribute salt>       // 0x3712F987 / 0x83820093 / 0x39002838 = X/Y/Z
    w2 = this->vmethod_0x258(CMTime t)      // emitter SEED at time t (the per-emitter RNG seed)
    u  = getRandTEAf(w0, w1, w2)           // uniform [0,1)  (TEA, above)
    → mapped into the attribute's range by the caller (cone dir, speed±rand, etc).
So the triple is (particleIndex, attributeSalt, emitterSeed). This matches a stateless
per-particle scheme: particle i's X-position random = teaRand(i, 0x3712F987, seed), etc.

## TODO to wire into emitter-sim.ts (replace hash01 spawn draws)
- [ ] Decode PSParticle::vmethod_0x20 → confirm it is the 0-based particle index (birth order).
- [ ] Decode PSEmitter::vmethod_0x258(t) → the seed value (likely emitterSeed 25785, possibly
      combined with cell randomSeed 18155; check if time-varying for continuous birth).
- [ ] Enumerate ALL attribute salts (speed, life, scale, spin, emission-angle) from the other
      getRandTEAf sites (initPropertiesFromShape has ~14; also genPosGeometry + life/scale/spin).
- [ ] Birth model: initialNumber one-shot burst at emitter `in` + birthRate accrual + life.
- [ ] Replace emitter-sim.ts spawn's hash01(seedA,seedB,i) with teaRand(i, salt, seed) per attribute.
Then verify Drop_In/Diagonal/Glide particle fields vs FCP-headless (min-gen/min-score).

## CONFIRMED (2026-07-24 cont): w0 = particle ID, w1 = salt, w2 = seed
- w0 = PSParticle::getID() = *(uint32*)(this+0xe0) — a plain field, the particle's unique ID.
  Called before each draw but returns the SAME value for all attributes of one particle, so the
  ONLY discriminator between a particle's X/Y/Z (etc.) draws is the SALT w1. => per attribute:
      u_attr = teaRand(particleID, ATTR_SALT, seed)
- w1 salts confirmed: 0x3712F987 (X), 0x83820093 (Y), 0x39002838 (Z) for the spawn-position vector.
- w2 = PSEmitter vm_0x258(CMTime) = the emitter/cell Random Seed channel value at time t (OZChannelSeed;
  the .motr "Random Seed" — Drop_In cell randomSeed=18155 / emitterSeed=25785).
- The 3 XYZ draws feed a REJECTION SAMPLER (ucomisd/subsd at 0x18a68) — a point-in-unit-sphere/box test
  that RESAMPLES if outside. So position within a spherical/box emitter region is rejection-sampled from
  the 3 uniforms; a rejected sample must advance to the NEXT draw triple (so the effective w0/seed advance
  — likely getID stays fixed and a per-attempt counter feeds one of the words; TBD which). For emitters
  that emit AT POINTS or on a line (Drop_In uses radius=100 circle) the mapping is simpler.
- Particle ID assignment / birth order (getID's +0xe0) and the birth model (initialNumber burst) are the
  last pieces before wiring: enumerate how IDs are assigned across the initialNumber=379 burst.

## SIMPLIFICATION: only 3 salts total → one 3-vector per particle + rejection sampler (2026-07-24)
Grepped the ENTIRE Particles binary: there are ONLY 3 getRandTEAf salts — 0x3712F987, 0x83820093,
0x39002838 — all inside initPropertiesFromShape. So Motion does NOT have separate salts for
direction/speed/life/scale/spin. Instead each particle draws ONE 3D random vector:
    R = ( teaRand(id, 0x3712F987, seed), teaRand(id, 0x83820093, seed), teaRand(id, 0x39002838, seed) )
and the emitter SHAPE geometry maps R → spawn position (and the emission cone direction) via a
REJECTION SAMPLER (0x18a68: xmm4 = 2·y + x <= radius²-type test; resample-region test). Speed/life/
scale/spin ±randomness must be derived from R's components too (or from a re-draw with the same salts
at a different id — TBD; but there are no other salts, so it's R-derived).
PER-SHAPE geometry branches (read from emitter channels at this+0x4f48/0x4fe0/0x5078 = Points/Columns/
Rows for the RECT/point-set path; the circle/burst path — Drop_In radius=100 — is a sibling branch).
Each Shape (0=Rect,1=Circle,2=Burst,3=Spiral,4=paint) maps R differently. Drop_In uses a circle region
(radius 100) with a WIDE 241° emission cone (emissionAngle=π, range=4.206) — the cone direction is the
dominant spatial spread, derived from R.
NEXT (the actual build): trace the CIRCLE-shape branch of initPropertiesFromShape to get R→(pos,dir)
for Drop_In; derive speed/life/scale from R; assign particle IDs across the initialNumber=379 burst;
then rebuild simulateAndCompositeCell's spawn analytically with teaRand. Do NOT half-swap hash01→teaRand
without the correct R→attribute mapping (would just move the error — RULE 2).
