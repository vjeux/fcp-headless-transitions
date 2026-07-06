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
// The transition's media-ref resolver we hook (its address is patched at runtime):
extern "C" void ozimg_getHeliumGraphFromMediaRef()
    asm("__ZN14OZImageElement26getHeliumGraphFromMediaRefERK14OZRenderParamsR18FxColorDescription");

// FxApplyColorConform(const HGRef<HGNode>&, const FxColorDescription&, FxColorDescription*) -> HGRef<HGNode> (x8 sret)
extern NodeRet FxApplyColorConform(const HGRefNode& node, const void* targetDesc, void* ioDesc)
    asm("__Z19FxApplyColorConformRK5HGRefI6HGNodeERK18FxColorDescriptionPS4_");

// ============================================================================
// Runtime hook: make the two transition drop-zones return our image nodes.
//
// Rather than pre-identify each drop-zone element (which varies per template),
// we assign images by the element pointer's discovery order: the first distinct
// OZImageElement that asks for its media ref gets source A, the second gets B.
// This is transition-agnostic.
//
// We also color-conform each returned node to the drop-zone's color description
// (the caller pre-fills arg2 with the working color space). Without this, the
// injected node lacks the intrinsic color metadata that advanced compositor
// paths (replicators, reflections, 360°) require, and they crash.
// ============================================================================
static void* g_nodeA=nullptr;
static void* g_nodeB=nullptr;
static void* g_seenA=nullptr;   // first distinct element pointer
static void* g_seenB=nullptr;   // second distinct element pointer

extern "C" void oz_reset_hook(){ g_seenA=nullptr; g_seenB=nullptr; }

// C picker: hand out node A to the first drop-zone element, node B to the second,
// color-conformed to the drop-zone's color description (colorDesc = arg2 of the
// hooked function). Writes the resulting HGRef<HGNode> into *sret.
extern "C" void oz_mediaref_pick(void* self, void* colorDesc, void* sret){
    void* raw=nullptr;
    if(self==g_seenA) raw=g_nodeA;
    else if(self==g_seenB) raw=g_nodeB;
    else if(!g_seenA){ g_seenA=self; raw=g_nodeA; }
    else if(!g_seenB){ g_seenB=self; raw=g_nodeB; }
    if(!raw){ *(void**)sret=nullptr; return; }
    if(colorDesc){
        // Conform the node to the drop-zone's color space, giving it valid color metadata.
        HGRefNode in; in.p=raw;
        NodeRet r = FxApplyColorConform(in, colorDesc, colorDesc);
        *(void**)sret = r.p ? r.p : raw;
    } else {
        *(void**)sret = raw;
    }
}
// asm trampoline: pass self(x0), colorDesc(x2), sret(x8) to oz_mediaref_pick(self,colorDesc,sret).
__asm__(
".globl _oz_mediaref_trampoline\n"
".p2align 2\n"
"_oz_mediaref_trampoline:\n"
"    stp x29, x30, [sp, #-16]!\n"
"    mov x29, sp\n"
"    mov x1, x2\n"
"    mov x2, x8\n"
"    bl  _oz_mediaref_pick\n"
"    ldp x29, x30, [sp], #16\n"
"    ret\n"
);
extern "C" void oz_mediaref_trampoline();


static int oz_install_hook(void* target){
    task_t task=mach_task_self();
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
    if(!ra||!rb) return 2;
    HGRefNode nA=makeImageNode(ra,wa,ha), nB=makeImageNode(rb,wb,hb);

    void* scene=*(void**)((char*)cppDoc+8);
    // Register images by drop-zone discovery order (idA/idB unused; kept for API stability).
    (void)idA; (void)idB;
    g_nodeA=nA.p; g_nodeB=nB.p;
    oz_reset_hook();
    oz_install_hook((void*)&ozimg_getHeliumGraphFromMediaRef);


    GRRet gr=OZXGetRenderGraph(scene, params, NULL, h.glr, false, hgr);
    HGRefNode out; out.p=gr.p;
    if(!out.p){ fprintf(stderr,"[oz] render graph build failed\n"); return 3; }

    int channelOrder=*(int*)(params+0xd8);
    CGColorSpace* ws=OZRenderParams_getWorkingColorSpace(params);
    if(!ws) ws=CGColorSpaceCreateDeviceRGB();
    void* liTech=params+0x55c;                            // LiRenderingTechnology lives inside OZRenderParams
    PCRectT<int> roi={0,0,1920,1080};
    BmpRet br=PGHelium_renderNodeToBitmap(hgr,out,roi,channelOrder?channelOrder:1,ws,liTech);
    if(!br.p){ fprintf(stderr,"[oz] rasterize failed\n"); return 4; }

    vImageBuf vb; memset(&vb,0,sizeof(vb));
    PCBitmap_vimage(br.p,&vb);
    if(!vb.data) return 5;
    size_t bpp=vb.rowBytes/vb.width;                      // 8 => 16-bit half-float RGBA, else 8-bit
    CGImageRef cim=NULL;
    if(bpp==8){
        CGColorSpaceRef cs=CGColorSpaceCreateWithName(kCGColorSpaceExtendedLinearSRGB);
        CGContextRef c=CGBitmapContextCreate(vb.data,vb.width,vb.height,16,vb.rowBytes,cs,
            kCGImageAlphaPremultipliedLast|kCGBitmapByteOrder16Little|kCGBitmapFloatComponents);
        cim=CGBitmapContextCreateImage(c);
    } else {
        CGColorSpaceRef cs=CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
        CGContextRef c=CGBitmapContextCreate(vb.data,vb.width,vb.height,8,vb.rowBytes,cs,
            kCGImageAlphaPremultipliedLast|kCGBitmapByteOrder32Big);
        cim=CGBitmapContextCreateImage(c);
    }
    CFStringRef pp=CFStringCreateWithCString(NULL,outPath,kCFStringEncodingUTF8);
    CFURLRef uu=CFURLCreateWithFileSystemPath(NULL,pp,kCFURLPOSIXPathStyle,false);
    CGImageDestinationRef dst=CGImageDestinationCreateWithURL(uu,CFSTR("public.png"),1,NULL);
    CGImageDestinationAddImage(dst,cim,NULL);
    bool ok=CGImageDestinationFinalize(dst);
    return ok?0:6;
}
