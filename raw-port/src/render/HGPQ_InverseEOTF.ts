// raw-port/src/render/HGPQ_InverseEOTF.ts
//
// FCP `HGPQ::InverseEOTF` — nested facade in the `HGPQ` namespace. This
// is the FORWARD SMPTE ST 2084 (PQ) direction: it takes physical
// luminance (cd/m²) and produces the PQ signal codeword N in [0,1].
// It is the exact inverse of `HGPQ::EOTF` (see raw-port/src/render/
// HGPQ_EOTF.ts) and shares the same facade-wraps-HgcST2084_* pattern.
//
// Skeleton commit — @0xADDRs and constants decoded; bodies land next.
//
// Methods (Helium x86_64):
//   0x000fdda0  HGPQ::InverseEOTF::N(double)             [static, pure math]
//   0x000fde00  HGPQ::InverseEOTF::InverseEOTF(double)   [C2]
//   0x000fdeb0  HGPQ::InverseEOTF::InverseEOTF(double)   [C1]
//   0x000fdf60  HGPQ::InverseEOTF::~InverseEOTF()        [D2]
//   0x000fdfa0  HGPQ::InverseEOTF::~InverseEOTF()        [D1]
//   0x000fdfe0  HGPQ::InverseEOTF::~InverseEOTF()        [D0]
//   0x000fe030  HGPQ::InverseEOTF::GetOutput(HGRenderer*)

export class HGPQ_InverseEOTF {} // skeleton — full port next commit
