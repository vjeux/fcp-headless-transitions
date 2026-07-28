0x0000000009dfed -- soGuidedFilter::soGuidedFilter_I1p3_Pass5_q_upsampled_out:
source_filename = "soGuidedFilter::soGuidedFilter_I1p3_Pass5_q_upsampled_out"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass5_q_upsampled_out_params" = type { <4 x i32>, float, [12 x i8] }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_I1p3_Pass5_q_upsampled_out"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass5_q_upsampled_out_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5, %struct._texture_2d_t addrspace(1)* %6) local_unnamed_addr #0 {
  %8 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass5_q_upsampled_out_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass5_q_upsampled_out_params" addrspace(2)* %0, i64 0, i32 0
  %9 = load <4 x i32>, <4 x i32> addrspace(2)* %8, align 16, !alias.scope !25, !noalias !28
  %10 = shufflevector <4 x i32> %9, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %11 = add <2 x i32> %10, %1
  %12 = extractelement <2 x i32> %11, i64 0
  %13 = extractelement <4 x i32> %9, i64 2
  %14 = extractelement <4 x i32> %9, i64 0
  %15 = sub nsw i32 %13, %14
  %16 = icmp ult i32 %12, %15
  br i1 %16, label %17, label %41

17:                                               ; preds = %7
  %18 = extractelement <2 x i32> %11, i64 1
  %19 = extractelement <4 x i32> %9, i64 3
  %20 = extractelement <4 x i32> %9, i64 1
  %21 = sub nsw i32 %19, %20
  %22 = icmp ult i32 %18, %21
  br i1 %22, label %23, label %41

23:                                               ; preds = %17
  %24 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass5_q_upsampled_out_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass5_q_upsampled_out_params" addrspace(2)* %0, i64 0, i32 1
  %25 = load float, float addrspace(2)* %24, align 16, !tbaa !31, !alias.scope !25, !noalias !28
  %26 = insertelement <2 x float> undef, float %25, i64 0
  %27 = shufflevector <2 x float> %26, <2 x float> undef, <2 x i32> zeroinitializer
  %28 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %11) #2
  %29 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %27, <2 x float> %28, <2 x float> <float 5.000000e-01, float 5.000000e-01>)
  %30 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %29, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4, !alias.scope !28, !noalias !25
  %31 = extractvalue { <4 x float>, i8 } %30, 0
  %32 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %29, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4, !alias.scope !28, !noalias !25
  %33 = extractvalue { <4 x float>, i8 } %32, 0
  %34 = fadd <2 x float> %28, <float 5.000000e-01, float 5.000000e-01>
  %35 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %34, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4, !alias.scope !28, !noalias !25
  %36 = extractvalue { <4 x float>, i8 } %35, 0
  %37 = shufflevector <4 x float> %36, <4 x float> undef, <4 x i32> zeroinitializer
  %38 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %31, <4 x float> %37, <4 x float> %33)
  %39 = insertelement <4 x float> %38, float 1.000000e+00, i64 3
  %40 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %39, <4 x float> zeroinitializer, <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>) #2
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %6, <2 x i32> %11, <4 x float> %40, i32 0, i32 2) #1, !alias.scope !36, !noalias !37
  br label %41

41:                                               ; preds = %23, %17, %7
  ret void
}

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.clamp.v4f32(<4 x float>, <4 x float>, <4 x float>) local_unnamed_addr #2

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <4 x float> @llvm.fmuladd.v4f32(<4 x float>, <4 x float>, <4 x float>) #3

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #4

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <2 x float> @llvm.fmuladd.v2f32(<2 x float>, <2 x float>, <2 x float>) #3

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32>) local_unnamed_addr #2

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly nounwind }
attributes #2 = { nounwind readnone }
attributes #3 = { nocallback nofree nosync nounwind readnone speculatable willreturn }
attributes #4 = { argmemonly convergent nounwind readonly }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!llvm.ident = !{!8}
!air.version = !{!9}
!air.language_version = !{!10}
!air.compile_options = !{!11, !12, !13}
!air.kernel = !{!14}

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
!12 = !{!"air.compile.fast_math_disable"}
!13 = !{!"air.compile.framebuffer_fetch_enable"}
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass5_q_upsampled_out_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_I1p3_Pass5_q_upsampled_out", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_I1p3_Pass5_q_upsampled_out_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"float", !"m_scaleUpsample"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_a_mean"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_b_mean"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_I"}
!24 = !{i32 6, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_q"}
!25 = !{!26}
!26 = distinct !{!26, !27, !"air-alias-scope-arg(0)"}
!27 = distinct !{!27, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_I1p3_Pass5_q_upsampled_out)"}
!28 = !{!29, !30}
!29 = distinct !{!29, !27, !"air-alias-scope-samplers"}
!30 = distinct !{!30, !27, !"air-alias-scope-textures"}
!31 = !{!32, !35, i64 16}
!32 = !{!"_ZTSN14soGuidedFilter48soGuidedFilter_I1p3_Pass5_q_upsampled_out_paramsE", !33, i64 0, !35, i64 16}
!33 = !{!"omnipotent char", !34, i64 0}
!34 = !{!"Simple C++ TBAA"}
!35 = !{!"float", !33, i64 0}
!36 = !{!30}
!37 = !{!26, !29}

