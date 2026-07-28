0x000000000a4d2d -- soOFlowEstimator::soOFlowEstimator_resampleImageY:
source_filename = "soOFlowEstimator::soOFlowEstimator_resampleImageY"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_resampleImageX_params" = type { i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_resampleImageY"(%"struct.soOFlowEstimator::soOFlowEstimator_resampleImageX_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, float addrspace(1)* nocapture readonly "air-buffer-no-alias" %5) local_unnamed_addr #0 {
  %7 = extractelement <2 x i32> %1, i64 0
  %8 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, i32 0) #5, !alias.scope !24, !noalias !27
  %9 = icmp ult i32 %7, %8
  br i1 %9, label %10, label %48

10:                                               ; preds = %6
  %11 = extractelement <2 x i32> %1, i64 1
  %12 = tail call i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, i32 0) #5, !alias.scope !24, !noalias !27
  %13 = icmp ult i32 %11, %12
  br i1 %13, label %14, label %48

14:                                               ; preds = %10
  %15 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_resampleImageX_params", %"struct.soOFlowEstimator::soOFlowEstimator_resampleImageX_params" addrspace(2)* %0, i64 0, i32 0
  %16 = load i32, i32 addrspace(2)* %15, align 4, !tbaa !31, !alias.scope !36, !noalias !37
  %17 = mul nsw i32 %16, %11
  %18 = sext i32 %17 to i64
  %19 = getelementptr inbounds float, float addrspace(1)* %5, i64 %18
  %20 = getelementptr inbounds float, float addrspace(1)* %19, i64 2
  %21 = getelementptr inbounds float, float addrspace(1)* %20, i64 -2
  %22 = load float, float addrspace(1)* %21, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %23 = tail call i32 @air.convert.s.i32.f.f32(float %22) #3
  %24 = getelementptr inbounds float, float addrspace(1)* %20, i64 -1
  %25 = load float, float addrspace(1)* %24, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %26 = tail call i32 @air.convert.s.i32.f.f32(float %25) #3
  %27 = icmp slt i32 %23, %26
  br i1 %27, label %30, label %28

28:                                               ; preds = %30, %14
  %29 = phi <4 x float> [ zeroinitializer, %14 ], [ %45, %30 ]
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %1, <4 x float> %29, i32 0, i32 2) #4, !alias.scope !24, !noalias !27
  br label %48

30:                                               ; preds = %30, %14
  %31 = phi <2 x i32> [ %34, %30 ], [ %1, %14 ]
  %32 = phi i32 [ %46, %30 ], [ %23, %14 ]
  %33 = phi <4 x float> [ %45, %30 ], [ zeroinitializer, %14 ]
  %34 = insertelement <2 x i32> %31, i32 %32, i64 1
  %35 = sub nsw i32 %32, %23
  %36 = sext i32 %35 to i64
  %37 = getelementptr inbounds float, float addrspace(1)* %20, i64 %36
  %38 = load float, float addrspace(1)* %37, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %39 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %34) #3
  %40 = fadd <2 x float> %39, <float 5.000000e-01, float 5.000000e-01>
  %41 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %40, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !42, !noalias !43
  %42 = extractvalue { <4 x float>, i8 } %41, 0
  %43 = insertelement <4 x float> undef, float %38, i64 0
  %44 = shufflevector <4 x float> %43, <4 x float> undef, <4 x i32> zeroinitializer
  %45 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %42, <4 x float> %44, <4 x float> %33)
  %46 = add nsw i32 %32, 1
  %47 = icmp eq i32 %46, %26
  br i1 %47, label %28, label %30, !llvm.loop !44

48:                                               ; preds = %28, %10, %6
  ret void
}

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <4 x float> @llvm.fmuladd.v4f32(<4 x float>, <4 x float>, <4 x float>) #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32>) local_unnamed_addr #3

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare i32 @air.convert.s.i32.f.f32(float) local_unnamed_addr #3

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #5

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #5

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { nocallback nofree nosync nounwind readnone speculatable willreturn }
attributes #2 = { argmemonly convergent nounwind readonly }
attributes #3 = { nounwind readnone }
attributes #4 = { argmemonly nounwind }
attributes #5 = { argmemonly nounwind readonly }

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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_resampleImageX_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, float addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_resampleImageY", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_resampleImageY_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_weightArrayDimsX"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output"}
!23 = !{i32 5, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"weights"}
!24 = !{!25}
!25 = distinct !{!25, !26, !"air-alias-scope-textures"}
!26 = distinct !{!26, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_resampleImageY)"}
!27 = !{!28, !29, !30}
!28 = distinct !{!28, !26, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !26, !"air-alias-scope-samplers"}
!30 = distinct !{!30, !26, !"air-alias-scope-arg(5)"}
!31 = !{!32, !33, i64 0}
!32 = !{!"_ZTSN16soOFlowEstimator38soOFlowEstimator_resampleImageY_paramsE", !33, i64 0}
!33 = !{!"int", !34, i64 0}
!34 = !{!"omnipotent char", !35, i64 0}
!35 = !{!"Simple C++ TBAA"}
!36 = !{!28}
!37 = !{!29, !25, !30}
!38 = !{!39, !39, i64 0}
!39 = !{!"float", !34, i64 0}
!40 = !{!30}
!41 = !{!28, !29, !25}
!42 = !{!29, !25}
!43 = !{!28, !30}
!44 = distinct !{!44, !45}
!45 = !{!"llvm.loop.mustprogress"}

