0x000000000054bf -- noise:
source_filename = "noise"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

@llvm.compiler.used = appending global [8 x i8*] [i8* bitcast (<2 x float> (i8*)* @_ZN5metal22_stitching_traits_implIDv2_fE13load_argumentEPv to i8*), i8* bitcast (void (i8*, i8 addrspace(2)*)* @_ZN5metal22_stitching_traits_implIDv2_fE16copy_from_bufferEPvPU11MTLconstantKv to i8*), i8* bitcast (void (i8*, <2 x float>)* @_ZN5metal22_stitching_traits_implIDv2_fE18store_return_valueEPvS1_ to i8*), i8* bitcast (void (i8*)* @_ZN5metal22_stitching_traits_implIDv2_fE7destroyEPv to i8*), i8* bitcast (<4 x half> (i8*)* @_ZN5metal22_stitching_traits_implIDv4_DhE13load_argumentEPv to i8*), i8* bitcast (void (i8*, i8 addrspace(2)*)* @_ZN5metal22_stitching_traits_implIDv4_DhE16copy_from_bufferEPvPU11MTLconstantKv to i8*), i8* bitcast (void (i8*, <4 x half>)* @_ZN5metal22_stitching_traits_implIDv4_DhE18store_return_valueEPvS1_ to i8*), i8* bitcast (void (i8*)* @_ZN5metal22_stitching_traits_implIDv4_DhE7destroyEPv to i8*)], section "llvm.metadata"

; Function Attrs: alwaysinline mustprogress nounwind
define internal <2 x float> @_ZN5metal22_stitching_traits_implIDv2_fE13load_argumentEPv(i8* noundef %0) #0 align 2 {
  %2 = bitcast i8* %0 to <2 x float>*
  %3 = load <2 x float>, <2 x float>* %2, align 8, !tbaa !30
  ret <2 x float> %3
}

; Function Attrs: alwaysinline mustprogress nounwind
define internal void @_ZN5metal22_stitching_traits_implIDv2_fE16copy_from_bufferEPvPU11MTLconstantKv(i8* noundef %0, i8 addrspace(2)* noundef %1) #1 align 2 {
  %3 = bitcast i8* %0 to <2 x float>*
  %4 = bitcast i8 addrspace(2)* %1 to <2 x float> addrspace(2)*
  %5 = load <2 x float>, <2 x float> addrspace(2)* %4, align 8, !tbaa !30
  store <2 x float> %5, <2 x float>* %3, align 8, !tbaa !30
  ret void
}

; Function Attrs: alwaysinline mustprogress nounwind
define internal void @_ZN5metal22_stitching_traits_implIDv2_fE18store_return_valueEPvS1_(i8* noundef %0, <2 x float> noundef %1) #0 align 2 {
  %3 = bitcast i8* %0 to <2 x float>*
  store <2 x float> %1, <2 x float>* %3, align 8, !tbaa !30
  ret void
}

; Function Attrs: alwaysinline mustprogress nounwind
define internal void @_ZN5metal22_stitching_traits_implIDv2_fE7destroyEPv(i8* noundef %0) #1 align 2 {
  ret void
}

; Function Attrs: alwaysinline mustprogress nounwind
define internal <4 x half> @_ZN5metal22_stitching_traits_implIDv4_DhE13load_argumentEPv(i8* noundef %0) #0 align 2 {
  %2 = bitcast i8* %0 to <4 x half>*
  %3 = load <4 x half>, <4 x half>* %2, align 8, !tbaa !30
  ret <4 x half> %3
}

; Function Attrs: alwaysinline mustprogress nounwind
define internal void @_ZN5metal22_stitching_traits_implIDv4_DhE16copy_from_bufferEPvPU11MTLconstantKv(i8* noundef %0, i8 addrspace(2)* noundef %1) #1 align 2 {
  %3 = bitcast i8* %0 to <4 x half>*
  %4 = bitcast i8 addrspace(2)* %1 to <4 x half> addrspace(2)*
  %5 = load <4 x half>, <4 x half> addrspace(2)* %4, align 8, !tbaa !30
  store <4 x half> %5, <4 x half>* %3, align 8, !tbaa !30
  ret void
}

; Function Attrs: alwaysinline mustprogress nounwind
define internal void @_ZN5metal22_stitching_traits_implIDv4_DhE18store_return_valueEPvS1_(i8* noundef %0, <4 x half> noundef %1) #0 align 2 {
  %3 = bitcast i8* %0 to <4 x half>*
  store <4 x half> %1, <4 x half>* %3, align 8, !tbaa !30
  ret void
}

; Function Attrs: alwaysinline mustprogress nounwind
define internal void @_ZN5metal22_stitching_traits_implIDv4_DhE7destroyEPv(i8* noundef %0) #1 align 2 {
  ret void
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
define <4 x half> @noise(<2 x float> noundef %0, <4 x half> noundef %1) local_unnamed_addr #2 {
  %3 = tail call fast float @air.dot.v2f32(<2 x float> %0, <2 x float> <float 0x3FFFD63880000000, float 0x40538EE980000000>) #4
  %4 = tail call fast float @air.fast_sin.f32(float %3) #4
  %5 = fmul fast float %4, 0x40E55DD180000000
  %6 = tail call fast float @air.fast_fract.f32(float %5) #4
  %7 = fptrunc float %6 to half
  %8 = insertelement <4 x half> <half poison, half poison, half poison, half 0xH3C00>, half %7, i64 0
  %9 = insertelement <4 x half> %8, half %7, i64 1
  %10 = insertelement <4 x half> %9, half %7, i64 2
  %11 = shufflevector <4 x half> %1, <4 x half> undef, <4 x i32> <i32 3, i32 3, i32 3, i32 3>
  %12 = fmul fast <4 x half> %10, %11
  ret <4 x half> %12
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fract.f32(float) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_sin.f32(float) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v2f32(<2 x float>, <2 x float>) local_unnamed_addr #3

attributes #0 = { alwaysinline mustprogress nounwind "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="64" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { alwaysinline mustprogress nounwind "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #2 = { mustprogress nofree nosync nounwind readnone willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="64" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #3 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #4 = { nounwind readnone willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.visible = !{!15}

!0 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!1 = !{i32 1, !"wchar_size", i32 4}
!2 = !{i32 7, !"frame-pointer", i32 2}
!3 = !{i32 7, !"air.max_device_buffers", i32 31}
!4 = !{i32 7, !"air.max_constant_buffers", i32 31}
!5 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!6 = !{i32 7, !"air.max_textures", i32 128}
!7 = !{i32 7, !"air.max_read_write_textures", i32 8}
!8 = !{i32 7, !"air.max_samplers", i32 16}
!9 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!10 = !{i32 2, i32 7, i32 0}
!11 = !{!"Metal", i32 3, i32 2, i32 0}
!12 = !{!"air.compile.denorms_disable"}
!13 = !{!"air.compile.fast_math_enable"}
!14 = !{!"air.compile.framebuffer_fetch_enable"}
!15 = !{<4 x half> (<2 x float>, <4 x half>)* @noise, !16, !18, !21}
!16 = !{!17}
!17 = !{!"air.visible_output", !"air.arg_type_name", !"half4"}
!18 = !{!19, !20}
!19 = !{i32 0, !"air.visible_input", !"air.arg_type_name", !"float2", !"air.arg_name", !"position"}
!20 = !{i32 1, !"air.visible_input", !"air.arg_type_name", !"half4", !"air.arg_name", !"currentColor"}
!21 = !{!"air.stitching_info", !22, !25, !29}
!22 = !{!"air.stitching_type", !23, <4 x half> (i8*)* @_ZN5metal22_stitching_traits_implIDv4_DhE13load_argumentEPv, void (i8*, <4 x half>)* @_ZN5metal22_stitching_traits_implIDv4_DhE18store_return_valueEPvS1_, void (i8*)* @_ZN5metal22_stitching_traits_implIDv4_DhE7destroyEPv, void (i8*, i8 addrspace(2)*)* @_ZN5metal22_stitching_traits_implIDv4_DhE16copy_from_bufferEPvPU11MTLconstantKv}
!23 = !{!"air.vector_type", i32 8, i32 8, null, !24, i32 4}
!24 = !{!"air.half_type", i32 2, i32 2, null}
!25 = !{!"air.stitching_argument", !26, !"position"}
!26 = !{!"air.stitching_type", !27, <2 x float> (i8*)* @_ZN5metal22_stitching_traits_implIDv2_fE13load_argumentEPv, void (i8*, <2 x float>)* @_ZN5metal22_stitching_traits_implIDv2_fE18store_return_valueEPvS1_, void (i8*)* @_ZN5metal22_stitching_traits_implIDv2_fE7destroyEPv, void (i8*, i8 addrspace(2)*)* @_ZN5metal22_stitching_traits_implIDv2_fE16copy_from_bufferEPvPU11MTLconstantKv}
!27 = !{!"air.vector_type", i32 8, i32 8, null, !28, i32 2}
!28 = !{!"air.float_type", i32 4, i32 4, null}
!29 = !{!"air.stitching_argument", !22, !"currentColor"}
!30 = !{!31, !31, i64 0}
!31 = !{!"omnipotent char", !32, i64 0}
!32 = !{!"Simple C++ TBAA"}
Disassembly of section REFLECTION_LIST:
