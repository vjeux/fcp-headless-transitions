0x000000000033a8 -- VelocityView_arrow_fs:
source_filename = "VelocityView_arrow_fs"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
define <4 x float> @VelocityView_arrow_fs(<4 x float> %0, <4 x float> %1, <3 x float> %2) local_unnamed_addr #0 {
  %4 = tail call fast float @air.dot.v3f32(<3 x float> %2, <3 x float> %2) #2
  %5 = tail call fast float @air.fast_rsqrt.f32(float %4) #2
  %6 = insertelement <3 x float> poison, float %5, i64 0
  %7 = shufflevector <3 x float> %6, <3 x float> poison, <3 x i32> zeroinitializer
  %8 = fmul fast <3 x float> %7, %2
  %9 = tail call fast float @air.dot.v3f32(<3 x float> %8, <3 x float> <float 0.000000e+00, float 0.000000e+00, float 1.000000e+00>) #2
  %10 = tail call fast float @air.fast_clamp.f32(float %9, float 0.000000e+00, float 1.000000e+00) #2
  %11 = shufflevector <4 x float> %1, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %12 = insertelement <3 x float> poison, float %10, i64 0
  %13 = shufflevector <3 x float> %12, <3 x float> poison, <3 x i32> zeroinitializer
  %14 = fmul fast <3 x float> %13, %11
  %15 = tail call fast <3 x float> @air.fast_pow.v3f32(<3 x float> %14, <3 x float> <float 4.000000e+00, float 4.000000e+00, float 4.000000e+00>) #2
  %16 = fadd fast <3 x float> %14, %15
  %17 = shufflevector <3 x float> %16, <3 x float> poison, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %18 = insertelement <4 x float> %17, float 1.000000e+00, i64 3
  ret <4 x float> %18
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <3 x float> @air.fast_pow.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_clamp.f32(float, float, float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_rsqrt.f32(float) local_unnamed_addr #1

attributes #0 = { mustprogress nofree nosync nounwind readnone willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { nounwind readnone willreturn }

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
!15 = !{<4 x float> (<4 x float>, <4 x float>, <3 x float>)* @VelocityView_arrow_fs, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!18 = !{!19, !20, !21}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(5colorDv4_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!21 = !{i32 2, !"air.fragment_input", !"generated(11worldNormalDv3_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float3", !"air.arg_name", !"worldNormal"}

