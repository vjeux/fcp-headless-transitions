import ctypes
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
CG = ctypes.CDLL("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")
pc = ctypes.CDLL(f"{FW}/ProCore.framework/ProCore")
# Create CGColorSpaces via named constructors
CG.CGColorSpaceCreateWithName.restype = ctypes.c_void_p
CG.CGColorSpaceCreateWithName.argtypes = [ctypes.c_void_p]
# CFStringRef constants — get via dlsym from CoreGraphics
def cfstr_const(name):
    p = ctypes.c_void_p.in_dll(CG, name)
    return p
names = {
  "sRGB": "kCGColorSpaceSRGB",
  "linearSRGB": "kCGColorSpaceLinearSRGB",
  "extLinearSRGB": "kCGColorSpaceExtendedLinearSRGB",
  "ITUR_709": "kCGColorSpaceITUR_709",
  "displayP3": "kCGColorSpaceDisplayP3",
}
# PCEstimateGamma(CGColorSpace*) -> float (via v0/s0)
fn = pc._Z15PCEstimateGammaP12CGColorSpace if hasattr(pc,'_Z15PCEstimateGammaP12CGColorSpace') else None
gfn = pc.__getattr__("_Z15PCEstimateGammaP12CGColorSpace") if False else None
# ctypes name: strip one underscore from __Z... -> _Z...
gamma = getattr(pc, "_Z15PCEstimateGammaP12CGColorSpace")
gamma.restype = ctypes.c_float
gamma.argtypes = [ctypes.c_void_p]
for label, cn in names.items():
    try:
        cs = CG.CGColorSpaceCreateWithName(cfstr_const(cn))
        if not cs:
            print(f"{label}: colorspace create failed"); continue
        g = gamma(cs)
        print(f"{label}: PCEstimateGamma = {g:.6f}")
    except Exception as e:
        print(f"{label}: err {e}")
