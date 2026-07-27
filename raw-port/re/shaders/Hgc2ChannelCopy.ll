0x000000000014a6 -- Hgc2ChannelCopy:
source_filename = "Hgc2ChannelCopy"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct._texture_2d_t.0 = type opaque
%struct._sampler_t.1 = type opaque

; Function Attrs: convergent nounwind readonly
define <4 x float> @Hgc2ChannelCopy(<4 x float> %0, <4 x float> %1, <4 x float> %2, %struct._texture_2d_t.0 addrspace(1)* %3, %struct._texture_2d_t.0 addrspace(1)* %4, %struct._sampler_t.1 addrspace(2)* nocapture readonly %5, %struct._sampler_t.1 addrspace(2)* nocapture readonly %6, <4 x float> addrspace(2)* nocapture readonly "air-buffer-no-alias" %7) local_unnamed_addr #0 {
  %9 = load <4 x float>, <4 x float> addrspace(2)* %7, align 16, !tbaa !26, !alias.scope !29, !noalias !32
  %10 = shufflevector <4 x float> %1, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %11 = tail call fast <2 x float> @air.fast_floor.v2f32(<2 x float> %10) #2
  %12 = fadd fast <2 x float> %11, <float 5.000000e-01, float 5.000000e-01>
  %13 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.0 addrspace(1)* nocapture readonly %3, %struct._sampler_t.1 addrspace(2)* nocapture readonly %5, <2 x float> %12, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !32, !noalias !29
  %14 = extractvalue { <4 x float>, i8 } %13, 0
  %15 = shufflevector <4 x float> %2, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %16 = tail call fast <2 x float> @air.fast_floor.v2f32(<2 x float> %15) #2
  %17 = fadd fast <2 x float> %16, <float 5.000000e-01, float 5.000000e-01>
  %18 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.0 addrspace(1)* nocapture readonly %4, %struct._sampler_t.1 addrspace(2)* nocapture readonly %6, <2 x float> %17, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !32, !noalias !29
  %19 = extractvalue { <4 x float>, i8 } %18, 0
  %20 = fcmp fast ogt <4 x float> %9, zeroinitializer
  %21 = select reassoc nsz arcp contract afn <4 x i1> %20, <4 x float> %19, <4 x float> %14
  ret <4 x float> %21
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.0 addrspace(1)* nocapture readonly, %struct._sampler_t.1 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <2 x float> @air.fast_floor.v2f32(<2 x float>) local_unnamed_addr #2

attributes #0 = { convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { nounwind readnone }

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
!14 = !{<4 x float> (<4 x float>, <4 x float>, <4 x float>, %struct._texture_2d_t.0 addrspace(1)*, %struct._texture_2d_t.0 addrspace(1)*, %struct._sampler_t.1 addrspace(2)*, %struct._sampler_t.1 addrspace(2)*, <4 x float> addrspace(2)*)* @Hgc2ChannelCopy, !15, !17}
!15 = !{!16}
!16 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!17 = !{!18, !19, !20, !21, !22, !23, !24, !25}
!18 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!19 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!20 = !{i32 2, !"air.fragment_input", !"user(texcoord1)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord1"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture0"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture1"}
!23 = !{i32 5, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler0"}
!24 = !{i32 6, !"air.sampler", !"air.location_index", i32 1, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler1"}
!25 = !{i32 7, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"params"}
!26 = !{!27, !27, i64 0}
!27 = !{!"omnipotent char", !28, i64 0}
!28 = !{!"Simple C++ TBAA"}
!29 = !{!30}
!30 = distinct !{!30, !31, !"air-alias-scope-arg(7)"}
!31 = distinct !{!31, !"air-alias-scopes(Hgc2ChannelCopy)"}
!32 = !{!33, !34}
!33 = distinct !{!33, !31, !"air-alias-scope-textures"}
!34 = distinct !{!34, !31, !"air-alias-scope-samplers"}

