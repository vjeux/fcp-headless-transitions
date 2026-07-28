0x00000000000346 -- Hgc2CombineFields:
source_filename = "Hgc2CombineFields"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

; Function Attrs: convergent mustprogress nofree nounwind readonly willreturn
define <4 x float> @Hgc2CombineFields(<4 x float> %0, <4 x float> %1, <4 x float> %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._sampler_t addrspace(2)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %6) local_unnamed_addr #0 {
  %8 = fmul fast <4 x float> %1, <float 1.000000e+00, float 5.000000e-01, float 1.000000e+00, float 1.000000e+00>
  %9 = fadd fast <4 x float> %8, <float -2.500000e-01, float -1.250000e-01, float -0.000000e+00, float -0.000000e+00>
  %10 = tail call fast <4 x float> @air.fast_floor.v4f32(<4 x float> %9) #3
  %11 = fadd fast <4 x float> %10, <float 5.000000e-01, float 5.000000e-01, float poison, float poison>
  %12 = fmul fast <4 x float> %2, <float 1.000000e+00, float 5.000000e-01, float 1.000000e+00, float 1.000000e+00>
  %13 = fadd fast <4 x float> %12, <float -2.500000e-01, float -1.250000e-01, float -0.000000e+00, float -0.000000e+00>
  %14 = tail call fast <4 x float> @air.fast_floor.v4f32(<4 x float> %13) #3
  %15 = fadd fast <4 x float> %14, <float 5.000000e-01, float 5.000000e-01, float poison, float poison>
  %16 = shufflevector <4 x float> %11, <4 x float> poison, <2 x i32> <i32 0, i32 1>
  %17 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %5, <2 x float> %16, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4, !alias.scope !26
  %18 = extractvalue { <4 x float>, i8 } %17, 0
  %19 = shufflevector <4 x float> %15, <4 x float> poison, <2 x i32> <i32 0, i32 1>
  %20 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %6, <2 x float> %19, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4, !alias.scope !26
  %21 = extractvalue { <4 x float>, i8 } %20, 0
  %22 = extractelement <4 x float> %0, i64 1
  %23 = fmul fast float %22, 5.000000e-01
  %24 = tail call fast float @air.fast_fract.f32(float %23) #3
  %25 = fadd fast float %24, -5.000000e-01
  %26 = fcmp fast olt float %25, 0.000000e+00
  %27 = insertelement <4 x i1> poison, i1 %26, i64 0
  %28 = shufflevector <4 x i1> %27, <4 x i1> poison, <4 x i32> zeroinitializer
  %29 = select reassoc nsz arcp contract afn <4 x i1> %28, <4 x float> %18, <4 x float> %21
  ret <4 x float> %29
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fract.f32(float) local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <4 x float> @air.fast_floor.v4f32(<4 x float>) local_unnamed_addr #1

attributes #0 = { convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #3 = { nounwind readnone willreturn }
attributes #4 = { argmemonly convergent nounwind readonly willreturn }

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
!15 = !{<4 x float> (<4 x float>, <4 x float>, <4 x float>, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._sampler_t addrspace(2)*, %struct._sampler_t addrspace(2)*)* @Hgc2CombineFields, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!18 = !{!19, !20, !21, !22, !23, !24, !25}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!20 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!21 = !{i32 2, !"air.fragment_input", !"user(texcoord1)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord1"}
!22 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture0"}
!23 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture1"}
!24 = !{i32 5, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler0"}
!25 = !{i32 6, !"air.sampler", !"air.location_index", i32 1, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler1"}
!26 = !{!27, !29}
!27 = distinct !{!27, !28, !"air-alias-scope-textures"}
!28 = distinct !{!28, !"air-alias-scopes(Hgc2CombineFields)"}
!29 = distinct !{!29, !28, !"air-alias-scope-samplers"}

