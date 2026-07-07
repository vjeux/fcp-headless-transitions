// oz_render.mm — Headless Final Cut Pro / Motion transition renderer.
//
// Renders a Motion .motr transition between two images using FCP's real Motion
// engine (Ozone.framework), fully headless — no GUI, no Compressor, no media server.
//
// Technique: load the Motion render engine in-process, build the render graph for a
// transition template, and install a runtime hook over OZImageElement's media-ref
// resolver so the two drop-zone sources return our own decoded image nodes (bypassing
// the PMClip media pipeline that is unavailable headless). Renders each frame to PNG.
//
// Build (see build.sh). Driven from render.py.

#include <CoreMedia/CoreMedia.h>
#include <CoreGraphics/CoreGraphics.h>
#include <ImageIO/ImageIO.h>
#import  <Metal/Metal.h>
#include <mach/mach.h>
#include <libkern/OSCacheControl.h>
#include <sys/mman.h>
#include <pthread.h>
#include <dlfcn.h>
#include <cstdio>
#include <cstring>
#include <cstdint>
#include <cstdlib>

// ---- Minimal reconstructions of Motion/ProCore C++ types (layout-matched) ----
struct Vec3 { void* begin; void* end; void* cap; };   // std::vector header
struct SP2  { void* ptr; void* ctrl; };               // shared_ptr
template<class T> struct PCRectT { T x,y,w,h; };
struct HGRefNode { void* p; };
struct HGRefBmp  { void* p; };
struct OZXHandle { void* doc; void* pad8; void* glr; void* progress; void* extra[8]; };
struct HGRect { int64_t a, b; };                       // packed {x,y},{w,h}
struct vImageBuf { void* data; unsigned long height; unsigned long width; unsigned long rowBytes; };
// Return types with a non-trivial dtor force the arm64 x8 struct-return (sret) ABI.
struct NodeRet { void* p; ~NodeRet(){} };              // HGRef<HGNode>
struct BmpRet  { void* p; void* ctrl; ~BmpRet(){} };   // shared_ptr<PCBitmap>
struct GRRet   { void* p; ~GRRet(){} };                // HGRef<HGNode>

// ---- FCP framework functions (asm-labeled with their mangled symbols) ----
extern "C" HGRect HGRectMake4i(int,int,int,int) asm("_HGRectMake4i");
extern void   HG_RENDERER_ENV_Init() asm("__ZN15HG_RENDERER_ENV4InitEv");
extern Vec3*  GetGPUComputeDeviceList() asm("__ZN22HGComputeDeviceManager23GetGPUComputeDeviceListEv");
extern void   OZRenderParams_ctor(void*) asm("__ZN14OZRenderParamsC1Ev");
extern CGColorSpace* OZRenderParams_getWorkingColorSpace(void*) asm("__ZNK14OZRenderParams20getWorkingColorSpaceEv");
extern void   OZX_prepareForRender(void* handle, CMTime t, int q, bool b1, float f1, float f2,
    int depth, CGColorSpace* cs1, CGColorSpace* cs2, bool b2, int invtone, int rtype, bool b3,
    SP2* device, void* params)
    asm("__Z20OZX_prepareForRenderPv6CMTime16OZXRenderQualitybff14OZXRenderDepthP12CGColorSpaceS4_b36OZXInverseToneMapOperator_Deprecated13OZXRenderTypebNSt3__110shared_ptrIK15HGComputeDeviceEER14OZRenderParams");
extern void   HGGPURenderer_ctor_vs(void* self, unsigned long long regID, bool b) asm("__ZN13HGGPURendererC1Eyb");
extern void   HGGPURenderer_UpdateCurrentContext(void* self) asm("__ZN13HGGPURenderer20UpdateCurrentContextEv");
extern void   OZXSetThreadRenderer(void*) asm("__Z20OZXSetThreadRendererP10HGRenderer");
extern void   HGBitmap_ctor(void* self, HGRect r, unsigned long long fmt, void* data) asm("__ZN8HGBitmapC1E6HGRect8HGFormatPv");
extern unsigned long long PGHelium_makeFormat(int chanOrder) asm("__ZN8PGHelium10makeFormatEN13PCPixelFormat12ChannelOrderE");
extern NodeRet PGHelium_createBitmapNode(HGRefBmp* bmpref) asm("__ZN8PGHelium16createBitmapNodeER5HGRefI8HGBitmapE");
extern BmpRet  PGHelium_renderNodeToBitmap(void* hgr, const HGRefNode& node,
    const PCRectT<int>& roi, int channelOrder, CGColorSpace* cs, const void* liTech)
    asm("__ZN8PGHelium18renderNodeToBitmapEP10HGRendererRK5HGRefI6HGNodeERK6PCRectIiEN13PCPixelFormat12ChannelOrderEP12CGColorSpaceRK21LiRenderingTechnology");
extern void  PCBitmap_vimage(void*, void*) asm("__ZNK8PCBitmap15getVImageBufferEP13vImage_Buffer");
extern GRRet OZXGetRenderGraph(void* scene, void* params, void* svctx, void* glr, bool b, void* hgr)
    asm("__Z17OZXGetRenderGraphP7OZScene14OZRenderParamsP11FFSVContextR10GLRendererbP10HGRenderer");
// HGRenderer::GetDOD(HGNode*) -> HGRect : the node's Domain Of Definition (actual pixel bounds).
// Used to make the readback ROI aperture-aware: some templates (Squares, 360°) render into a
// larger canvas with the 1920x1080 content CENTERED; a hardcoded {0,0,1920,1080} then grabs a
// corner (quadrant), leaving most of the frame black. GetDOD gives the true output extent so we
// can center the 1920x1080 readback window on it.
extern HGRect HGRenderer_GetDOD(void* hgr, void* node) asm("__ZN10HGRenderer6GetDODEP6HGNode");
// OZScene::getSceneBounds(PCRect<double>* out) — writes the scene's authored aperture {x,y,w,h}
// (from sceneSettings width/height at scene+0x90/0x98) to the out pointer. Void return + out-param
// => safe ABI. Used to anchor the readback for wide equirect (360°) canvases on the FIXED aperture
// center instead of the MOVING DOD-union center (the 360° DOD is the union of two translating clone
// layers, so its center slides across the panorama and a DOD-centered window lands on empty canvas).
struct PCRectd { double x, y, w, h; };
extern void OZScene_getSceneBounds(void* scene, PCRectd* out) asm("__ZN7OZScene14getSceneBoundsEP6PCRectIdE");
// The transition's media-ref resolver we hook (its address is patched at runtime):
extern "C" void ozimg_getHeliumGraphFromMediaRef()
    asm("__ZN14OZImageElement26getHeliumGraphFromMediaRefERK14OZRenderParamsR18FxColorDescription");
// OZImageElement drop-zone identity accessors (bool, x0=self). Used to inject sources ONLY into
// the two real transition drop zones and CALL THROUGH to the original resolver for embedded media
// (curtain/leaf/veil .mov overlays), instead of relying on brittle discovery order.
extern "C" bool ozimg_isTransitionSourceA(void* self) asm("__ZNK14OZImageElement19isTransitionSourceAEv");
extern "C" bool ozimg_isTransitionSourceB(void* self) asm("__ZNK14OZImageElement19isTransitionSourceBEv");

// FxApplyColorConform(const HGRef<HGNode>&, const FxColorDescription&, FxColorDescription*) -> HGRef<HGNode> (x8 sret)
extern NodeRet FxApplyColorConform(const HGRefNode& node, const void* targetDesc, void* ioDesc)
    asm("__Z19FxApplyColorConformRK5HGRefI6HGNodeERK18FxColorDescriptionPS4_");

// ---- CGL master-context reset (fixes cross-render GL context poisoning) ----
// The render engine shares ONE process-global CGL "master" context (ProGL's
// PGLMasterCGLContext). Each oz_render_frame() builds a fresh HGGPURenderer and calls
// HGGPURenderer::UpdateCurrentContext (which binds GL state onto that shared context) but
// never restores it. Under a long batch (65 slugs × 24 frames) the leaked per-render GL
// state accumulates; once any render leaves the shared context in a bad state, EVERY
// subsequent render rasterizes all-black (observed: black from Stylized__Glide onward in
// the 65-slug batch — 11 consecutive slugs). Re-asserting the master context as the
// current CGL context at the START of each render gives every frame a clean, known GL
// binding, so a prior render can no longer poison the next. Resolved dynamically (ProGL
// is already dlopen'd by ozengine.init_engine) so we don't add a link-time dependency.
typedef void* (*PGLMasterCtxFn)(void);
typedef int   (*CGLSetCurrentFn)(void*);
static PGLMasterCtxFn  g_pglMasterCtx = NULL;
static CGLSetCurrentFn g_cglSetCurrent = NULL;
static void oz_reset_gl_context(){
    if(!g_pglMasterCtx)
        g_pglMasterCtx = (PGLMasterCtxFn)dlsym(RTLD_DEFAULT, "PGLMasterCGLContext");
    if(!g_cglSetCurrent)
        g_cglSetCurrent = (CGLSetCurrentFn)dlsym(RTLD_DEFAULT, "CGLSetCurrentContext");
    if(g_pglMasterCtx && g_cglSetCurrent){
        void* master = g_pglMasterCtx();
        if(master) g_cglSetCurrent(master);
    }
}

// ============================================================================
// Runtime hook: make the two transition drop-zones return our image nodes.
//
// Rather than pre-identify each drop-zone element (which varies per template),
// ============================================================================
// Runtime hook: make the two transition drop-zones return our image nodes, while
// letting embedded media (.mov overlays / mattes) resolve through the ORIGINAL resolver.
//
// We identify the two real drop zones via OZImageElement::isTransitionSourceA/B()
// (robust, no reliance on discovery order) and inject source A / source B into them.
// ANY OTHER element (embedded <relativeURL>Media/*.mov overlays like the curtain/leaf/
// veil footage) is passed through to the ORIGINAL getHeliumGraphFromMediaRef via a
// detour trampoline, so Motion decodes the real footage. Templates with only 2 drop
// zones are unaffected; templates with extra .mov overlays (Curtains/Leaves/Veil) now
// feed A/B to the correct drop zones AND render their overlay footage (no more starved
// drop zones showing A instead of B, and no more .mov-decode hangs from a broken shim).
//
// We also color-conform each injected node to the drop-zone's color description (arg2 of
// the hooked function). Without this the injected node lacks the intrinsic color metadata
// advanced compositor paths (replicators, reflections, 360°) require, and they crash.
// ============================================================================
static void* g_nodeA=nullptr;
static void* g_nodeB=nullptr;

// Detour trampoline: a small executable buffer holding the ORIGINAL function's first 4
// instructions (16 bytes) followed by a jump back to (target+16). Calling this reproduces
// the original getHeliumGraphFromMediaRef. Installed by oz_install_hook.
typedef void (*orig_fn_t)();
extern "C" void* g_orig_detour;
void* g_orig_detour=nullptr;

// No-op: A/B assignment is now stateless (bound by authored isTransitionSourceA/B identity per
// element), so there is no per-render discovery state to reset. Kept for call-site ABI stability.
extern "C" void oz_reset_hook(){ }

// C picker. Returns 1 if it injected a node into *sret (a real drop zone), 0 if the caller
// should CALL THROUGH to the original resolver (embedded media). self=x0, colorDesc=arg2.
//
// Drop-zone A/B assignment is by DISCOVERY ORDER among drop-zone elements (identical to the
// original hook's behavior — preserves the exact rendering of every pure 2-drop-zone template,
// no regression). We use isTransitionSourceA/B ONLY to decide whether an element IS a transition
// drop zone (inject A/B) or is embedded media (call through to the original resolver so Motion
// decodes the real .mov overlay/matte). This unblocks Curtains/Leaves/Veil (extra .mov elements
// no longer steal the A/B slots and no longer hang the shim) while leaving the 56 non-Objects
// transitions byte-identical.
extern "C" int oz_mediaref_pick(void* self, void* colorDesc, void* sret){
    bool isDZ = ozimg_isTransitionSourceA(self) || ozimg_isTransitionSourceB(self);
    if(getenv("OZ_HOOK_DEBUG")) fprintf(stderr,"[oz] pick self=%p isDropZone=%d\n",self,(int)isDZ);
    if(!isDZ) return 0;                       // embedded media -> call through to original resolver
    // A/B assignment by DISCOVERY ORDER among drop-zone elements (identical to the original hook's
    // behavior for pure 2-drop-zone templates -> the 56 non-Objects transitions render byte-identical,
    // no regression). isTransitionSourceA/B is used ONLY to distinguish a real drop zone (inject A/B)
    // from embedded media (call through). This unblocks Curtains/Leaves/Veil (their extra .mov overlays
    // no longer steal the A/B slots and no longer hang the broken shim). NOTE: identity-based A/B
    // (isTransitionSourceA->A) is more semantically correct and further improves the Objects .mov
    // transitions AND several directional transitions (Flip +4, Scale +12.8), but it regresses
    // Wipes__Mask -3.78 (Mask's GUI GT matches the SWAPPED render due to the separate rig-direction
    // A/B bug that g1 owns). Discovery-order is the provably-clean choice that regresses nothing;
    // identity should be revisited once the rig-direction A/B swap is fixed pool-wide.
    // IDENTITY-based A/B assignment: bind by the AUTHORED drop-zone role
    // isTransitionSourceA()->nodeA(start.jpg), isTransitionSourceB()->nodeB(end.jpg). Robust to
    // the compositor's visitation order (Mask/Scale/Duplicate visit their B-role drop zone FIRST,
    // so the old discovery-order fed start.jpg into the B slot -> swapped). Verified against the
    // CORRECTED (settle-anchored) GUI GT: Scale 13.2->28.2, Duplicate 11.6->24.1, Mask 11.0->27.3,
    // Flip 23.7->26.8, Concentric 16.7->20.8, Directional 28.3->31.5; Push 31.45 unchanged (Push
    // visits A-first so identity==discovery). The earlier "Mask regresses under identity" was an
    // artifact of the OLD broken GT (which ended mid-transition); with the corrected GT identity is
    // unambiguously correct pool-wide.
    void* raw=nullptr;
    if(ozimg_isTransitionSourceA(self)) raw=g_nodeA;
    else if(ozimg_isTransitionSourceB(self)) raw=g_nodeB;
    if(!raw){ *(void**)sret=nullptr; return 1; }
    if(colorDesc){
        HGRefNode in; in.p=raw;
        NodeRet r = FxApplyColorConform(in, colorDesc, colorDesc);
        *(void**)sret = r.p ? r.p : raw;
    } else {
        *(void**)sret = raw;
    }
    return 1;
}
// asm trampoline. Preserves the ABI: x0=self(this), x1=OZRenderParams&, x2=FxColorDescription&,
// x8=sret(HGRef<HGNode>*). Stashes all 4, calls oz_mediaref_pick(self,colorDesc,sret). If it
// returns nonzero (injected), return. Else restore the original x0/x1/x2/x8 and TAIL-CALL the
// original detour so Motion resolves the embedded media itself.
__asm__(
".globl _oz_mediaref_trampoline\n"
".p2align 2\n"
"_oz_mediaref_trampoline:\n"
"    stp x29, x30, [sp, #-64]!\n"
"    mov x29, sp\n"
"    stp x0, x1, [sp, #16]\n"       // save self, params
"    stp x2, x8, [sp, #32]\n"       // save colorDesc, sret
"    mov x1, x2\n"                  // pick arg2 = colorDesc
"    mov x2, x8\n"                  // pick arg3 = sret
"    bl  _oz_mediaref_pick\n"       // x0 already = self
"    cbz w0, 1f\n"                  // if pick returned 0 -> call through
"    ldp x29, x30, [sp], #64\n"
"    ret\n"
"1:\n"                              // call-through path: restore regs, jump to original detour
"    ldp x0, x1, [sp, #16]\n"
"    ldp x2, x8, [sp, #32]\n"
"    ldp x29, x30, [sp], #64\n"
"    adrp x16, _g_orig_detour@PAGE\n"
"    ldr  x16, [x16, _g_orig_detour@PAGEOFF]\n"
"    br   x16\n"
);
extern "C" void oz_mediaref_trampoline();


static int oz_install_hook(void* target){
    task_t task=mach_task_self();
    // Build the ORIGINAL detour BEFORE overwriting the prologue: copy the first 16 bytes
    // (4 instructions — all stack stores, no PC-relative refs, safe to relocate) into an
    // executable buffer, then append LDR x16,#8; BR x16; .quad (target+16).
    if(!g_orig_detour){
        size_t sz=16 /*orig*/ + 8 /*ldr+br*/ + 8 /*.quad*/;
        void* buf=mmap(NULL, sz, PROT_READ|PROT_WRITE, MAP_ANON|MAP_PRIVATE|MAP_JIT, -1, 0);
        if(buf==MAP_FAILED){
            buf=mmap(NULL, sz, PROT_READ|PROT_WRITE, MAP_ANON|MAP_PRIVATE, -1, 0);
            if(buf==MAP_FAILED){ fprintf(stderr,"[oz] detour mmap failed\n"); return 1; }
        }
        pthread_jit_write_protect_np(0);
        memcpy(buf, target, 16);                         // original 4 instructions
        uint32_t* q=(uint32_t*)((char*)buf+16);
        q[0]=0x58000050;                                 // LDR x16, #8
        q[1]=0xD61F0200;                                 // BR  x16
        *(void**)(q+2)=(void*)((char*)target+16);        // .quad target+16 (resume after prologue)
        pthread_jit_write_protect_np(1);
        mprotect(buf, sz, PROT_READ|PROT_EXEC);
        sys_icache_invalidate(buf, sz);
        g_orig_detour=buf;
    }
    uintptr_t page=(uintptr_t)target & ~0x3fffULL;      // 16K pages on arm64
    if(vm_protect(task,page,0x8000,false,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS) return 1;
    uint32_t* p=(uint32_t*)target;
    p[0]=0x58000050;                                     // LDR x16, #8
    p[1]=0xD61F0200;                                     // BR  x16
    *(void**)(p+2)=(void*)oz_mediaref_trampoline;        // .quad trampoline
    vm_protect(task,page,0x8000,false,VM_PROT_READ|VM_PROT_EXECUTE);
    sys_icache_invalidate(target,16);
    return 0;
}

// ---- Helpers ----
// Output (sequence) resolution the sources are conformed to. FCP applies a Spatial
// Conform to each drop-zone source so it maps into the sequence frame; headless must
// do the same or the source renders at native size, centered — leaving black borders
// (the ~18dB "geometric floor" vs the GUI). See GUI_GT_STATUS.md 2026-07-06.
static int g_outW = 1920;
static int g_outH = 1080;

// Decode an image file to premultiplied ARGB8, CONFORMED to the sequence frame
// (g_outW x g_outH), returns malloc'd buffer + conformed dims. Conform = Fit:
// scale preserving aspect so the whole image is visible, centered (letterbox only
// when the source aspect differs from the frame; for matching aspects this fills).
static void* loadRGBA(const char* path, int* W, int* H){
    CFStringRef p=CFStringCreateWithCString(NULL,path,kCFStringEncodingUTF8);
    CFURLRef u=CFURLCreateWithFileSystemPath(NULL,p,kCFURLPOSIXPathStyle,false);
    CGImageSourceRef src=CGImageSourceCreateWithURL(u,NULL);
    if(!src){ fprintf(stderr,"[oz] cannot open image: %s\n",path); return NULL; }
    CGImageRef img=CGImageSourceCreateImageAtIndex(src,0,NULL);
    int sw=(int)CGImageGetWidth(img), sh=(int)CGImageGetHeight(img);
    int ow=g_outW, oh=g_outH;
    *W=ow; *H=oh;
    void* buf=malloc((size_t)ow*oh*4);
    memset(buf,0,(size_t)ow*oh*4);
    CGColorSpaceRef cs=CGColorSpaceCreateDeviceRGB();
    CGContextRef ctx=CGBitmapContextCreate(buf,ow,oh,8,ow*4,cs,kCGImageAlphaPremultipliedFirst|kCGBitmapByteOrder32Big);
    CGContextSetInterpolationQuality(ctx,kCGInterpolationHigh);
    // Spatial Conform = Fit: max scale s.t. the whole source fits inside the frame.
    double s = fmin((double)ow/sw, (double)oh/sh);
    double dw = sw*s, dh = sh*s;
    double dx = (ow-dw)*0.5, dy = (oh-dh)*0.5;
    CGContextDrawImage(ctx,CGRectMake(dx,dy,dw,dh),img);
    return buf;
}
// Build a Motion render-graph image node from RGBA8 pixels, centered at the frame origin.
static HGRefNode makeImageNode(void* rgba, int w, int h){
    HGRect r = HGRectMake4i(-w/2,-h/2,w-w/2,h-h/2);      // Motion coord origin = frame center
    unsigned long long fmt = PGHelium_makeFormat(4);     // 4 = 8-bit RGBA
    void* hgbmp = malloc(0x200); memset(hgbmp,0,0x200);
    HGBitmap_ctor(hgbmp, r, fmt, rgba);
    HGRefBmp bref; bref.p=hgbmp;
    NodeRet nr = PGHelium_createBitmapNode(&bref);
    HGRefNode out; out.p=nr.p; return out;
}

// ============================================================================
// Public entry point. Called from Python (after the doc is loaded).
//   cppDoc    : the C++ OZDocument* ( [OZObjCDocument getDocument] )
//   idA,idB   : scene object IDs of the transition's two drop-zone image elements
//   imgA,imgB : file paths for source A / source B
//   timeSec, timescale : frame time = CMTimeMake(timeSec*timescale, timescale)
//   outPath   : output PNG path
// Returns 0 on success.
// ============================================================================
extern "C" int oz_render_frame(void* cppDoc, unsigned int idA, unsigned int idB,
                               const char* imgA, const char* imgB,
                               double timeSec, int timescale, const char* outPath){
    HG_RENDERER_ENV_Init();
    // Reset the shared CGL master context to a clean binding BEFORE this render so a prior
    // frame's leaked GL state cannot poison this one (see oz_reset_gl_context above). This
    // is what makes a long single-process batch stable instead of going all-black partway.
    oz_reset_gl_context();
    Vec3* dl=GetGPUComputeDeviceList();
    if(!dl || !dl->begin){ fprintf(stderr,"[oz] no GPU compute device\n"); return 1; }
    SP2 device=((SP2*)dl->begin)[0];

    OZXHandle h; memset(&h,0,sizeof(h)); h.doc=cppDoc;
    CMTime t=CMTimeMake((long long)(timeSec*timescale),timescale);

    static char params[0x800]; memset(params,0,sizeof(params));
    OZRenderParams_ctor(params);
    OZX_prepareForRender(&h,t,0,false,1,1,0,NULL,NULL,false,0,0,false,&device,params);

    id<MTLDevice> mtl=MTLCreateSystemDefaultDevice();
    unsigned long long regID=[mtl registryID];
    void* hgr=malloc(0x2000); memset(hgr,0,0x2000);
    HGGPURenderer_ctor_vs(hgr,regID,false);
    HGGPURenderer_UpdateCurrentContext(hgr);
    OZXSetThreadRenderer(hgr);

    int wa,ha,wb,hb;
    void* ra=loadRGBA(imgA,&wa,&ha); void* rb=loadRGBA(imgB,&wb,&hb);
    if(!ra||!rb){ OZXSetThreadRenderer(NULL); free(hgr); return 2; }
    HGRefNode nA=makeImageNode(ra,wa,ha), nB=makeImageNode(rb,wb,hb);

    void* scene=*(void**)((char*)cppDoc+8);
    // Register images by drop-zone discovery order (idA/idB unused; kept for API stability).
    (void)idA; (void)idB;
    g_nodeA=nA.p; g_nodeB=nB.p;
    oz_reset_hook();
    oz_install_hook((void*)&ozimg_getHeliumGraphFromMediaRef);


    GRRet gr=OZXGetRenderGraph(scene, params, NULL, h.glr, false, hgr);
    HGRefNode out; out.p=gr.p;
    if(!out.p){ fprintf(stderr,"[oz] render graph build failed\n"); OZXSetThreadRenderer(NULL); free(hgr); return 3; }

    int channelOrder=*(int*)(params+0xd8);
    CGColorSpace* ws=OZRenderParams_getWorkingColorSpace(params);
    if(!ws) ws=CGColorSpaceCreateDeviceRGB();
    void* liTech=params+0x55c;                            // LiRenderingTechnology lives inside OZRenderParams
    // Aperture-aware readback: query the output node's Domain-Of-Definition (true pixel bounds)
    // and center a 1920x1080 readback window on the DOD center. Most transitions have a DOD centered
    // at the frame center (~960,540, possibly with a small filter bleed margin) -> ROI {0,0,...}.
    // But some templates (Squares, and 360°) use Object3DEnvironments / a large canvas that places
    // the 1920x1080 content OFF-CENTER (Squares DOD = [1088,540..3008,1620], center (2048,1080));
    // a hardcoded {0,0,1920,1080} then reads a corner quadrant (78% black, ~7dB). Centering on the
    // DOD center captures the full composite for both cases with no per-template special-casing.
    PCRectT<int> roi={0,0,1920,1080};
    {
        HGRect dod = HGRenderer_GetDOD(hgr, out.p);
        // HGRect packs two int32 corner pairs: a={x0,y0}(min), b={x1,y1}(max).
        int dx0=(int)(int32_t)(dod.a & 0xffffffff), dy0=(int)(int32_t)(dod.a >> 32);
        int dx1=(int)(int32_t)(dod.b & 0xffffffff), dy1=(int)(int32_t)(dod.b >> 32);
        int dw=dx1-dx0, dh=dy1-dy0;
        if(getenv("OZ_DOD_DEBUG")) fprintf(stderr,"[oz] DOD x0=%d y0=%d x1=%d y1=%d (w=%d h=%d)\n",dx0,dy0,dx1,dy1,dw,dh);
        // WIDE EQUIRECT CANVAS (360° family): the scene aperture is a 2:1 panorama (e.g. 4096x2048) and
        // the DOD is the UNION of two clone layers translating across it — so the DOD center SLIDES with
        // the animation (f0 center~2048, f12~2073, f23~3974) and a DOD-centered readback lands on empty
        // canvas => black. For these, anchor a 1920x1080 window on the FIXED aperture center (front-facing
        // view of the panorama). Detect via the authored scene aperture (getSceneBounds), not per-template.
        PCRectd sb; memset(&sb,0,sizeof(sb)); OZScene_getSceneBounds(scene,&sb);
        if(getenv("OZ_DOD_DEBUG")) fprintf(stderr,"[oz] sceneBounds x=%.0f y=%.0f w=%.0f h=%.0f\n",sb.x,sb.y,sb.w,sb.h);
        if(sb.w >= 3072.0 && sb.h > 0){
            // Equirect panorama: front-facing window centered on the aperture center.
            // getSceneBounds reports the aperture centered on the ORIGIN (e.g. x=-2048,y=-1024,w=4096,
            // h=2048 => center (0,0)), but the renderNodeToBitmap ROI is in READBACK space whose origin
            // is the aperture's top-left corner. So the aperture center in readback space is
            // (-sb.x, -sb.y) (= (2048,1024) for the 4096x2048 canvas). Anchor the 1920x1080 window there.
            int cx=(int)(-sb.x), cy=(int)(-sb.y);
            roi.x = cx - 960; roi.y = cy - 540; roi.w = 1920; roi.h = 1080;
            if(getenv("OZ_DOD_DEBUG")) fprintf(stderr,"[oz] equirect: aperture-center ROI %d,%d,1920,1080\n",roi.x,roi.y);
        }
        // FLAT NON-1920x1080 APERTURE (e.g. Dissolves/Divide + Drop_In 1280x720; Color_Panels/
        // Light_Sweep 1967x1080; Switch 2160x1080): FCP authors the transition at its own aperture and
        // NORMALIZES that whole canvas to the 1920x1080 output frame. Our fixed 1920x1080 readback then
        // grabs only a sub-region (content squished into a corner with black borders). Read back the FULL
        // authored aperture instead; the output PNG is aperture-sized and the scorer/consumer scales it to
        // 1920x1080 (matching FCP's normalize). Aperture origin in readback space = (-sb.x,-sb.y).
        else if(sb.w > 0 && sb.h > 0 && sb.w < 3072 && (abs((int)sb.w-1920) > 2 || abs((int)sb.h-1080) > 2)
                && dw <= (int)(sb.w*1.15) && dh <= (int)(sb.h*1.15)){
            // Flat scenes whose content is CONTAINED within the authored aperture: FCP normalizes that
            // aperture to the 1920x1080 output. Read the full aperture (content sits at readback origin
            // (0,0); verified OZ_ROI=0,0,1280,720 recovers Dissolves/Divide). Scaled to 1920x1080
            // downstream. GATED on DOD <= 1.15*aperture so we DON'T clip transitions whose animation
            // spills OUTSIDE the aperture (e.g. Movements/Drop_In: aperture 1280x720 but DOD 1962x1122 —
            // the dropping image moves beyond the canvas; those keep the default/DOD-centered readback).
            roi.x=0; roi.y=0; roi.w=(int)sb.w; roi.h=(int)sb.h;
            if(getenv("OZ_DOD_DEBUG")) fprintf(stderr,"[oz] flat-aperture ROI 0,0,%d,%d (scaled to 1920x1080 downstream)\n",roi.w,roi.h);
        }
        // Otherwise: trust the DOD center for bounded off-center canvases (e.g. Squares, whose DOD is a
        // STATIC off-center block). Sanity-gate on a plausible DOD. IMPORTANT: only re-center when the
        // authored aperture is NOT the standard 1920x1080 frame. For a normal 1920x1080 aperture the
        // output frame is FIXED at the aperture origin; content that bleeds OUTSIDE the frame (e.g.
        // Stylized/Heart's heart-curve sweeps far past the frame -> DOD 2701x2230 off-center) must be
        // CLIPPED by the frame, NOT chased — chasing the off-center DOD shifts the window off the real
        // frame and squishes the content with black borders (Heart was 10.1dB from this). Squares-type
        // off-center canvases have a >1920x1080 aperture and are handled here.
        else if(dw > 0 && dh > 0 && dw <= 8192 && dh <= 8192
                && (abs((int)sb.w-1920) > 2 || abs((int)sb.h-1080) > 2)){
            int cx = dx0 + dw/2, cy = dy0 + dh/2;
            // Only re-center when the DOD center is clearly off the normal frame center (960,540).
            // Off-center canvases (Squares center (2048,1080)) get corrected.
            if(abs(cx-960) > 32 || abs(cy-540) > 32){
                roi.x = cx - 960;
                roi.y = cy - 540;
                roi.w = 1920; roi.h = 1080;
                if(getenv("OZ_DOD_DEBUG")) fprintf(stderr,"[oz] centered ROI %d,%d,1920,1080 (dod center %d,%d)\n",roi.x,roi.y,cx,cy);
            }
        }
    }
    { const char* e=getenv("OZ_ROI"); if(e){ int x,y,w,h; if(sscanf(e,"%d,%d,%d,%d",&x,&y,&w,&h)==4){ roi.x=x;roi.y=y;roi.w=w;roi.h=h; fprintf(stderr,"[oz] OZ_ROI override %d,%d,%d,%d\n",x,y,w,h);} } }  // debug-only manual override
    BmpRet br=PGHelium_renderNodeToBitmap(hgr,out,roi,channelOrder?channelOrder:1,ws,liTech);
    if(!br.p){ fprintf(stderr,"[oz] rasterize failed\n"); OZXSetThreadRenderer(NULL); free(hgr); return 4; }

    vImageBuf vb; memset(&vb,0,sizeof(vb));
    PCBitmap_vimage(br.p,&vb);
    if(!vb.data){ OZXSetThreadRenderer(NULL); free(hgr); return 5; }
    size_t bpp=vb.rowBytes/vb.width;                      // 8 => 16-bit half-float RGBA, else 8-bit
    CGImageRef cim=NULL;
    CGColorSpaceRef cs=NULL; CGContextRef c=NULL;
    if(bpp==8){
        cs=CGColorSpaceCreateWithName(kCGColorSpaceExtendedLinearSRGB);
        c=CGBitmapContextCreate(vb.data,vb.width,vb.height,16,vb.rowBytes,cs,
            kCGImageAlphaPremultipliedLast|kCGBitmapByteOrder16Little|kCGBitmapFloatComponents);
        cim=CGBitmapContextCreateImage(c);
    } else {
        cs=CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
        c=CGBitmapContextCreate(vb.data,vb.width,vb.height,8,vb.rowBytes,cs,
            kCGImageAlphaPremultipliedLast|kCGBitmapByteOrder32Big);
        cim=CGBitmapContextCreateImage(c);
    }
    CFStringRef pp=CFStringCreateWithCString(NULL,outPath,kCFStringEncodingUTF8);
    CFURLRef uu=CFURLCreateWithFileSystemPath(NULL,pp,kCFURLPOSIXPathStyle,false);
    CGImageDestinationRef dst=CGImageDestinationCreateWithURL(uu,CFSTR("public.png"),1,NULL);
    CGImageDestinationAddImage(dst,cim,NULL);
    bool ok=CGImageDestinationFinalize(dst);
    // Release every per-render CoreGraphics/CoreFoundation object. Without this each of the
    // ~1560 frames in a full batch leaks a CGImage + CGContext + CGColorSpace + CFString +
    // CFURL + CGImageDestination; that unbounded growth is what eventually starves the
    // process and turns renders black. Free the per-render HGGPURenderer too (malloc'd above).
    if(dst) CFRelease(dst);
    if(uu)  CFRelease(uu);
    if(pp)  CFRelease(pp);
    if(cim) CGImageRelease(cim);
    if(c)   CGContextRelease(c);
    if(cs)  CGColorSpaceRelease(cs);
    OZXSetThreadRenderer(NULL);   // unbind our per-render renderer from this thread
    free(hgr);
    return ok?0:6;
}
