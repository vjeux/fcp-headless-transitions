0x00000000003812 -- Hgc2GammaMC:
source_filename = "Hgc2GammaMC"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct._texture_2d_t.3 = type opaque
%struct._sampler_t.4 = type opaque

; Function Attrs: argmemonly convergent nounwind readonly
define <4 x float> @Hgc2GammaMC(<4 x float> %0, <4 x float> %1, %struct._texture_2d_t.3 addrspace(1)* nocapture readonly %2, %struct._sampler_t.4 addrspace(2)* nocapture readonly %3, <4 x float> addrspace(2)* nocapture readonly "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = load <4 x float>, <4 x float> addrspace(2)* %4, align 16, !tbaa !23, !alias.scope !26, !noalias !29
  %7 = getelementptr inbounds <4 x float>, <4 x float> addrspace(2)* %4, i64 1
  %8 = load <4 x float>, <4 x float> addrspace(2)* %7, align 16, !tbaa !23, !alias.scope !26, !noalias !29
  %9 = shufflevector <4 x float> %1, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %10 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.3 addrspace(1)* nocapture readonly %2, %struct._sampler_t.4 addrspace(2)* nocapture readonly %3, <2 x float> %9, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !29, !noalias !26
  %11 = extractvalue { <4 x float>, i8 } %10, 0
  %12 = tail call fast <4 x float> @air.fast_fabs.v4f32(<4 x float> %11) #1
  %13 = extractelement <4 x float> %12, i64 0
  %14 = extractelement <4 x float> %6, i64 0
  %15 = tail call fast float @air.fast_pow.f32(float %13, float %14) #1
  %16 = insertelement <4 x float> undef, float %15, i64 0
  %17 = extractelement <4 x float> %12, i64 1
  %18 = extractelement <4 x float> %6, i64 1
  %19 = tail call fast float @air.fast_pow.f32(float %17, float %18) #1
  %20 = insertelement <4 x float> %16, float %19, i64 1
  %21 = extractelement <4 x float> %12, i64 2
  %22 = extractelement <4 x float> %6, i64 2
  %23 = tail call fast float @air.fast_pow.f32(float %21, float %22) #1
  %24 = insertelement <4 x float> %20, float %23, i64 2
  %25 = shufflevector <4 x float> %12, <4 x float> undef, <4 x i32> <i32 3, i32 3, i32 3, i32 3>
  %26 = tail call fast <4 x float> @air.fast_pow.v4f32(<4 x float> %25, <4 x float> %8) #1
  %27 = fcmp fast ogt <4 x float> %12, zeroinitializer
  %28 = select reassoc nsz arcp contract afn <4 x i1> %27, <4 x float> %26, <4 x float> <float 0.000000e+00, float 0.000000e+00, float 0.000000e+00, float undef>
  %29 = fmul fast <4 x float> %28, %24
  %30 = shufflevector <4 x float> %29, <4 x float> %12, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %31 = fsub fast <4 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %30
  %32 = fcmp fast olt <4 x float> %11, zeroinitializer
  %33 = select reassoc nsz arcp contract afn <4 x i1> %32, <4 x float> %31, <4 x float> %30
  ret <4 x float> %33
}

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_pow.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare float @air.fast_pow.f32(float, float) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_fabs.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.3 addrspace(1)* nocapture readonly, %struct._sampler_t.4 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { argmemonly convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { nounwind readnone }
attributes #2 = { argmemonly convergent nounwind readonly }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!llvm.ident = !{!8}
!air.version = !{!9}
!air.language_version = !{!10}
!air.compile_options = !{!11, !12, !13}
!air.fragment = !{!14}

!0 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!1 = !{i32 1, !"wchar_size", i32 4}
!2 = !{i32 7, !"air.max_device_buffers", i32 31}
!3 = !{i32 7, !"air.max_constant_buffers", i32 31}
!4 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!5 = !{i32 7, !"air.max_textures", i32 128}
!6 = !{i32 7, !"air.max_read_write_textures", i32 8}
!7 = !{i32 7, !"air.max_samplers", i32 16}
!8 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!9 = !{i32 2, i32 3, i32 0}
!10 = !{!"Metal", i32 2, i32 3, i32 0}
!11 = !{!"air.compile.denorms_disable"}
!12 = !{!"air.compile.fast_math_enable"}
!13 = !{!"air.compile.framebuffer_fetch_enable"}
!14 = !{<4 x float> (<4 x float>, <4 x float>, %struct._texture_2d_t.3 addrspace(1)*, %struct._sampler_t.4 addrspace(2)*, <4 x float> addrspace(2)*)* @Hgc2GammaMC, !15, !17}
!15 = !{!16}
!16 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!17 = !{!18, !19, !20, !21, !22}
!18 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!19 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!20 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture0"}
!21 = !{i32 3, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler0"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"params"}
!23 = !{!24, !24, i64 0}
!24 = !{!"omnipotent char", !25, i64 0}
!25 = !{!"Simple C++ TBAA"}
!26 = !{!27}
!27 = distinct !{!27, !28, !"air-alias-scope-arg(4)"}
!28 = distinct !{!28, !"air-alias-scopes(Hgc2GammaMC)"}
!29 = !{!30, !31}
!30 = distinct !{!30, !28, !"air-alias-scope-textures"}
!31 = distinct !{!31, !28, !"air-alias-scope-samplers"}

