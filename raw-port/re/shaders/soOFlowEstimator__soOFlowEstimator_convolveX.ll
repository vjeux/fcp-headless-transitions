0x000000000b11cd -- soOFlowEstimator::soOFlowEstimator_convolveX:
source_filename = "soOFlowEstimator::soOFlowEstimator_convolveX"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_convolveX_params" = type { i32, i32, i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_convolveX"(%"struct.soOFlowEstimator::soOFlowEstimator_convolveX_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, float addrspace(1)* nocapture readonly "air-buffer-no-alias" %5) local_unnamed_addr #0 {
  %7 = extractelement <2 x i32> %1, i64 0
  %8 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_convolveX_params", %"struct.soOFlowEstimator::soOFlowEstimator_convolveX_params" addrspace(2)* %0, i64 0, i32 1
  %9 = load i32, i32 addrspace(2)* %8, align 4, !tbaa !24, !alias.scope !29, !noalias !32
  %10 = icmp slt i32 %7, %9
  br i1 %10, label %11, label %52

11:                                               ; preds = %6
  %12 = extractelement <2 x i32> %1, i64 1
  %13 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_convolveX_params", %"struct.soOFlowEstimator::soOFlowEstimator_convolveX_params" addrspace(2)* %0, i64 0, i32 2
  %14 = load i32, i32 addrspace(2)* %13, align 4, !tbaa !36, !alias.scope !29, !noalias !32
  %15 = icmp slt i32 %12, %14
  br i1 %15, label %16, label %52

16:                                               ; preds = %11
  %17 = add <2 x i32> %1, <i32 -1, i32 -1>
  %18 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_convolveX_params", %"struct.soOFlowEstimator::soOFlowEstimator_convolveX_params" addrspace(2)* %0, i64 0, i32 0
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !37, !alias.scope !29, !noalias !32
  %20 = sub i32 1, %19
  %21 = icmp slt i32 %20, %19
  br i1 %21, label %22, label %26

22:                                               ; preds = %16
  %23 = add nsw i32 %19, -1
  %24 = insertelement <2 x i32> <i32 undef, i32 0>, i32 %23, i64 0
  %25 = sub <2 x i32> %1, %24
  br label %28

26:                                               ; preds = %28, %16
  %27 = phi <4 x float> [ zeroinitializer, %16 ], [ %48, %28 ]
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %1, <4 x float> %27, i32 0, i32 2) #4, !alias.scope !38, !noalias !39
  br label %52

28:                                               ; preds = %28, %22
  %29 = phi <2 x i32> [ %49, %28 ], [ %25, %22 ]
  %30 = phi <4 x float> [ %48, %28 ], [ zeroinitializer, %22 ]
  %31 = phi i32 [ %50, %28 ], [ %20, %22 ]
  %32 = tail call i32 @air.abs.s.i32(i32 %31) #3
  %33 = sext i32 %32 to i64
  %34 = getelementptr inbounds float, float addrspace(1)* %5, i64 %33
  %35 = load float, float addrspace(1)* %34, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %36 = tail call <2 x i32> @air.max.s.v2i32(<2 x i32> %29, <2 x i32> zeroinitializer) #3
  %37 = tail call <2 x i32> @air.min.s.v2i32(<2 x i32> %36, <2 x i32> %17) #3
  %38 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %37) #3
  %39 = fadd <2 x float> %38, <float 5.000000e-01, float 5.000000e-01>
  %40 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %39, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !44, !noalias !45
  %41 = extractvalue { <4 x float>, i8 } %40, 0
  %42 = shufflevector <4 x float> %41, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %43 = insertelement <2 x float> undef, float %35, i64 0
  %44 = shufflevector <2 x float> %43, <2 x float> undef, <2 x i32> zeroinitializer
  %45 = shufflevector <4 x float> %30, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %46 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %42, <2 x float> %44, <2 x float> %45)
  %47 = shufflevector <2 x float> %46, <2 x float> undef, <4 x i32> <i32 0, i32 1, i32 undef, i32 undef>
  %48 = shufflevector <4 x float> %47, <4 x float> %30, <4 x i32> <i32 0, i32 1, i32 6, i32 7>
  %49 = add <2 x i32> %29, <i32 1, i32 0>
  %50 = add nsw i32 %31, 1
  %51 = icmp eq i32 %50, %19
  br i1 %51, label %26, label %28, !llvm.loop !46

52:                                               ; preds = %26, %11, %6
  ret void
}

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <2 x float> @llvm.fmuladd.v2f32(<2 x float>, <2 x float>, <2 x float>) #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32>) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare <2 x i32> @air.min.s.v2i32(<2 x i32>, <2 x i32>) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare <2 x i32> @air.max.s.v2i32(<2 x i32>, <2 x i32>) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare i32 @air.abs.s.i32(i32) local_unnamed_addr #3

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #4

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { nocallback nofree nosync nounwind readnone speculatable willreturn }
attributes #2 = { argmemonly convergent nounwind readonly }
attributes #3 = { nounwind readnone }
attributes #4 = { argmemonly nounwind }

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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_convolveX_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, float addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_convolveX", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 12, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_convolveX_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_numWeights", i32 4, i32 4, i32 0, !"int", !"m_dimX", i32 8, i32 4, i32 0, !"int", !"m_dimY"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output"}
!23 = !{i32 5, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"weights"}
!24 = !{!25, !26, i64 4}
!25 = !{!"_ZTSN16soOFlowEstimator33soOFlowEstimator_convolveX_paramsE", !26, i64 0, !26, i64 4, !26, i64 8}
!26 = !{!"int", !27, i64 0}
!27 = !{!"omnipotent char", !28, i64 0}
!28 = !{!"Simple C++ TBAA"}
!29 = !{!30}
!30 = distinct !{!30, !31, !"air-alias-scope-arg(0)"}
!31 = distinct !{!31, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_convolveX)"}
!32 = !{!33, !34, !35}
!33 = distinct !{!33, !31, !"air-alias-scope-samplers"}
!34 = distinct !{!34, !31, !"air-alias-scope-textures"}
!35 = distinct !{!35, !31, !"air-alias-scope-arg(5)"}
!36 = !{!25, !26, i64 8}
!37 = !{!25, !26, i64 0}
!38 = !{!34}
!39 = !{!30, !33, !35}
!40 = !{!41, !41, i64 0}
!41 = !{!"float", !27, i64 0}
!42 = !{!35}
!43 = !{!30, !33, !34}
!44 = !{!33, !34}
!45 = !{!30, !35}
!46 = distinct !{!46, !47}
!47 = !{!"llvm.loop.mustprogress"}

