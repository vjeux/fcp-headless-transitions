0x00000000003a20 -- Hgc2ErodeInside:
source_filename = "Hgc2ErodeInside"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t.4 = type opaque
%struct._sampler_t.5 = type opaque

; Function Attrs: convergent mustprogress nofree nounwind readonly willreturn
define <4 x float> @Hgc2ErodeInside(<4 x float> %0, <4 x float> %1, <4 x float> %2, %struct._texture_2d_t.4 addrspace(1)* nocapture readonly %3, %struct._texture_2d_t.4 addrspace(1)* %4, %struct._sampler_t.5 addrspace(2)* nocapture readonly %5, %struct._sampler_t.5 addrspace(2)* nocapture readonly %6, <4 x float> addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %7) local_unnamed_addr #0 {
  %9 = load <4 x float>, <4 x float> addrspace(2)* %7, align 16, !tbaa !27, !alias.scope !30, !noalias !33
  %10 = shufflevector <4 x float> %1, <4 x float> poison, <2 x i32> <i32 0, i32 1>
  %11 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.4 addrspace(1)* nocapture readonly %3, %struct._sampler_t.5 addrspace(2)* nocapture readonly %5, <2 x float> %10, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !33, !noalias !30
  %12 = extractvalue { <4 x float>, i8 } %11, 0
  %13 = shufflevector <4 x float> %2, <4 x float> poison, <2 x i32> <i32 0, i32 1>
  %14 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.4 addrspace(1)* nocapture readonly %4, %struct._sampler_t.5 addrspace(2)* nocapture readonly %6, <2 x float> %13, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !33, !noalias !30
  %15 = extractvalue { <4 x float>, i8 } %14, 0
  %16 = extractelement <4 x float> %9, i64 3
  %17 = fmul fast float %16, 0x3FC99999A0000000
  %18 = tail call fast float @air.fast_fmax.f32(float %17, float 1.000000e+00) #4
  %19 = tail call fast float @air.fast_fmin.f32(float %18, float 3.000000e+00) #4
  %20 = insertelement <4 x float> poison, float %19, i64 0
  %21 = shufflevector <4 x float> %20, <4 x float> poison, <4 x i32> zeroinitializer
  %22 = tail call fast <4 x float> @air.fast_pow.v4f32(<4 x float> %15, <4 x float> %21) #4
  %23 = fmul fast <4 x float> %22, %12
  %24 = tail call fast <4 x float> @air.fast_fmin.v4f32(<4 x float> %23, <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>) #4
  %25 = tail call fast float @air.fast_fmin.f32(float %17, float 1.000000e+00) #4
  %26 = insertelement <4 x float> poison, float %25, i64 0
  %27 = shufflevector <4 x float> %26, <4 x float> poison, <4 x i32> zeroinitializer
  %28 = fmul fast <4 x float> %27, %24
  %29 = fsub fast float 1.000000e+00, %25
  %30 = insertelement <4 x float> poison, float %29, i64 0
  %31 = shufflevector <4 x float> %30, <4 x float> poison, <4 x i32> zeroinitializer
  %32 = fmul fast <4 x float> %31, %12
  %33 = fadd fast <4 x float> %32, %28
  ret <4 x float> %33
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmin.f32(float, float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <4 x float> @air.fast_fmin.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <4 x float> @air.fast_pow.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmax.f32(float, float) local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.4 addrspace(1)* nocapture readonly, %struct._sampler_t.5 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #3 = { argmemonly convergent nounwind readonly willreturn }
attributes #4 = { nounwind readnone willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.fragment = !{!15}

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
!15 = !{<4 x float> (<4 x float>, <4 x float>, <4 x float>, %struct._texture_2d_t.4 addrspace(1)*, %struct._texture_2d_t.4 addrspace(1)*, %struct._sampler_t.5 addrspace(2)*, %struct._sampler_t.5 addrspace(2)*, <4 x float> addrspace(2)*)* @Hgc2ErodeInside, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!18 = !{!19, !20, !21, !22, !23, !24, !25, !26}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!21 = !{i32 2, !"air.fragment_input", !"user(texcoord1)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord1"}
!22 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture0"}
!23 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture1"}
!24 = !{i32 5, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler0"}
!25 = !{i32 6, !"air.sampler", !"air.location_index", i32 1, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler1"}
!26 = !{i32 7, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"parameters"}
!27 = !{!28, !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{!31}
!31 = distinct !{!31, !32, !"air-alias-scope-arg(7)"}
!32 = distinct !{!32, !"air-alias-scopes(Hgc2ErodeInside)"}
!33 = !{!34, !35}
!34 = distinct !{!34, !32, !"air-alias-scope-textures"}
!35 = distinct !{!35, !32, !"air-alias-scope-samplers"}

