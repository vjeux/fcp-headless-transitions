0x000000000044df -- chromaVerb_fragment_textured:
source_filename = "chromaVerb_fragment_textured"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
define <4 x half> @chromaVerb_fragment_textured(<4 x float> %0, <2 x float> %1, %struct._texture_2d_t addrspace(1)* nocapture readonly %2, float addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %3, %struct._sampler_t addrspace(2)* nocapture readonly %4) local_unnamed_addr #0 {
  %6 = load float, float addrspace(2)* %3, align 4, !tbaa !24, !alias.scope !28, !noalias !31
  %7 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly %4, <2 x float> %1, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !31, !noalias !28
  %8 = extractvalue { <4 x float>, i8 } %7, 0
  %9 = extractelement <4 x float> %8, i64 3
  %10 = fmul fast float %9, %6
  %11 = insertelement <4 x float> %8, float %10, i64 3
  %12 = tail call fast <4 x half> @air.convert.f.v4f16.f.v4f32(<4 x float> %11) #4
  ret <4 x half> %12
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <4 x half> @air.convert.f.v4f16.f.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
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
!15 = !{<4 x half> (<4 x float>, <2 x float>, %struct._texture_2d_t addrspace(1)*, float addrspace(2)*, %struct._sampler_t addrspace(2)*)* @chromaVerb_fragment_textured, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"half4"}
!18 = !{!19, !20, !21, !22, !23}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(8texCoordDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"texCoord"}
!21 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"tex0"}
!22 = !{i32 3, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"parameters"}
!23 = !{i32 4, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler2D"}
!24 = !{!25, !25, i64 0}
!25 = !{!"float", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(3)"}
!30 = distinct !{!30, !"air-alias-scopes(chromaVerb_fragment_textured)"}
!31 = !{!32, !33}
!32 = distinct !{!32, !30, !"air-alias-scope-textures"}
!33 = distinct !{!33, !30, !"air-alias-scope-samplers"}

