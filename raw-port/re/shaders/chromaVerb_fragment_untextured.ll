0x0000000000356f -- chromaVerb_fragment_untextured:
source_filename = "chromaVerb_fragment_untextured"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
define <4 x half> @chromaVerb_fragment_untextured(<4 x float> %0, <4 x half> %1, i16 %2, float addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %3, <2 x float> noundef %4) local_unnamed_addr #0 {
  %6 = load float, float addrspace(2)* %3, align 4, !tbaa !24, !alias.scope !28
  %7 = fadd fast <2 x float> %4, <float -5.000000e-01, float -5.000000e-01>
  %8 = tail call fast float @air.dot.v2f32(<2 x float> %7, <2 x float> %7) #2
  %9 = tail call fast float @air.fast_sqrt.f32(float %8) #2
  %10 = extractelement <4 x half> %1, i64 3
  %11 = fpext half %10 to float
  %12 = fmul fast float %6, %11
  %13 = fadd fast float %9, 0xBFD99999A0000000
  %14 = fmul fast float %13, 0x4024000020000000
  %15 = tail call fast float @air.fast_clamp.f32(float %14, float 0.000000e+00, float 1.000000e+00) #2
  %16 = fmul fast float %15, %15
  %17 = fmul fast float %15, 2.000000e+00
  %18 = fsub fast float 3.000000e+00, %17
  %19 = fmul fast float %16, %18
  %20 = fsub fast float %12, %19
  %21 = fptrunc float %20 to half
  %22 = insertelement <4 x half> %1, half %21, i64 3
  ret <4 x half> %22
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_clamp.f32(float, float, float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_sqrt.f32(float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v2f32(<2 x float>, <2 x float>) local_unnamed_addr #1

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
!15 = !{<4 x half> (<4 x float>, <4 x half>, i16, float addrspace(2)*, <2 x float>)* @chromaVerb_fragment_untextured, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"half4"}
!18 = !{!19, !20, !21, !22, !23}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(5colorDv4_Dh)", !"air.center", !"air.perspective", !"air.arg_type_name", !"half4", !"air.arg_name", !"color"}
!21 = !{i32 2, !"air.fragment_input", !"generated(4m_IDt)", !"air.flat", !"air.arg_type_name", !"ushort", !"air.arg_name", !"m_ID", !"air.arg_unused"}
!22 = !{i32 3, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"parameters"}
!23 = !{i32 4, !"air.point_coord", !"air.arg_type_name", !"float2", !"air.arg_name", !"pointCoord"}
!24 = !{!25, !25, i64 0}
!25 = !{!"float", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(3)"}
!30 = distinct !{!30, !"air-alias-scopes(chromaVerb_fragment_untextured)"}

