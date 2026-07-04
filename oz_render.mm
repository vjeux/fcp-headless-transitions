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
extern void* OZScene_getObject(void* scene, unsigned int id) asm("__ZN7OZScene9getObjectEj");
extern GRRet OZXGetRenderGraph(void* scene, void* params, void* svctx, void* glr, bool b, void* hgr)
    asm("__Z17OZXGetRenderGraphP7OZScene14OZRenderParamsP11FFSVContextR10GLRendererbP10HGRenderer");
// The transition's media-ref resolver we hook (its address is patched at runtime):
extern "C" void ozimg_getHeliumGraphFromMediaRef()
    asm("__ZN14OZImageElement26getHeliumGraphFromMediaRefERK14OZRenderParamsR18FxColorDescription");

// ============================================================================
// Runtime hook: make the two transition drop-zones return our image nodes.
// ============================================================================
static void* g_elemA=nullptr; static void* g_nodeA=nullptr;
static void* g_elemB=nullptr; static void* g_nodeB=nullptr;

// C picker: maps the OZImageElement `this` to our decoded image node.
extern "C" void* oz_mediaref_pick(void* self){
    return (self==g_elemA)?g_nodeA : (self==g_elemB)?g_nodeB : nullptr;
}
// asm trampoline: preserve x8 (sret), call oz_mediaref_pick(this=x0), store *x8 = node.
__asm__(
".globl _oz_mediaref_trampoline\n"
".p2align 2\n"
"_oz_mediaref_trampoline:\n"
"    stp x29, x30, [sp, #-32]!\n"
"    mov x29, sp\n"
"    str x8, [sp, #16]\n"
"    bl  _oz_mediaref_pick\n"
"    ldr x8, [sp, #16]\n"
"    str x0, [x8]\n"
"    ldp x29, x30, [sp], #32\n"
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
// Decode an image file to premultiplied ARGB8, returns malloc'd buffer + dims.
static void* loadRGBA(const char* path, int* W, int* H){
    CFStringRef p=CFStringCreateWithCString(NULL,path,kCFStringEncodingUTF8);
    CFURLRef u=CFURLCreateWithFileSystemPath(NULL,p,kCFURLPOSIXPathStyle,false);
    CGImageSourceRef src=CGImageSourceCreateWithURL(u,NULL);
    if(!src){ fprintf(stderr,"[oz] cannot open image: %s\n",path); return NULL; }
    CGImageRef img=CGImageSourceCreateImageAtIndex(src,0,NULL);
    int w=(int)CGImageGetWidth(img), h=(int)CGImageGetHeight(img);
    *W=w; *H=h;
    void* buf=malloc((size_t)w*h*4);
    CGColorSpaceRef cs=CGColorSpaceCreateDeviceRGB();
    CGContextRef ctx=CGBitmapContextCreate(buf,w,h,8,w*4,cs,kCGImageAlphaPremultipliedFirst|kCGBitmapByteOrder32Big);
    CGContextDrawImage(ctx,CGRectMake(0,0,w,h),img);
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
    void* elA=OZScene_getObject(scene,idA);
    void* elB=OZScene_getObject(scene,idB);
    // The `this` passed to getHeliumGraphFromMediaRef is getObject(id) - 0x10 (base subobject).
    g_elemA=(char*)elA-0x10; g_nodeA=nA.p;
    g_elemB=(char*)elB-0x10; g_nodeB=nB.p;
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
