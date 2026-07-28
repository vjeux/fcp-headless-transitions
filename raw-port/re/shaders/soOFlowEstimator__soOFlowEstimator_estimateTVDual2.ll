0x000000000bc97d -- soOFlowEstimator::soOFlowEstimator_estimateTVDual2:
source_filename = "soOFlowEstimator::soOFlowEstimator_estimateTVDual2"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" = type { float, i32, i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_estimateTVDual2"(%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5) local_unnamed_addr #0 {
  %7 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* %0, i64 0, i32 1
  %8 = load i32, i32 addrspace(2)* %7, align 4, !tbaa !24, !alias.scope !30, !noalias !33
  %9 = insertelement <2 x i32> undef, i32 %8, i64 0
  %10 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* %0, i64 0, i32 2
  %11 = load i32, i32 addrspace(2)* %10, align 4, !tbaa !36, !alias.scope !30, !noalias !33
  %12 = insertelement <2 x i32> %9, i32 %11, i64 1
  %13 = extractelement <2 x i32> %1, i64 0
  %14 = icmp slt i32 %13, %8
  br i1 %14, label %15, label %67

15:                                               ; preds = %6
  %16 = extractelement <2 x i32> %1, i64 1
  %17 = icmp slt i32 %16, %11
  br i1 %17, label %18, label %67

18:                                               ; preds = %15
  %19 = add <2 x i32> %1, <i32 0, i32 1>
  %20 = add <2 x i32> %12, <i32 -1, i32 -1>
  %21 = tail call <2 x i32> @air.clamp.s.v2i32(<2 x i32> %19, <2 x i32> zeroinitializer, <2 x i32> %20) #4
  %22 = add <2 x i32> %1, <i32 1, i32 0>
  %23 = tail call <2 x i32> @air.clamp.s.v2i32(<2 x i32> %22, <2 x i32> zeroinitializer, <2 x i32> %20) #4
  %24 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %1) #4
  %25 = fadd <2 x float> %24, <float 5.000000e-01, float 5.000000e-01>
  %26 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %25, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !33, !noalias !30
  %27 = extractvalue { <4 x float>, i8 } %26, 0
  %28 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %23) #4
  %29 = fadd <2 x float> %28, <float 5.000000e-01, float 5.000000e-01>
  %30 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %29, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !33, !noalias !30
  %31 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %21) #4
  %32 = fadd <2 x float> %31, <float 5.000000e-01, float 5.000000e-01>
  %33 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %32, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !33, !noalias !30
  %34 = extractvalue { <4 x float>, i8 } %33, 0
  %35 = fsub <4 x float> %34, %27
  %36 = shufflevector <4 x float> %35, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %37 = icmp eq i32 %13, 0
  %38 = extractvalue { <4 x float>, i8 } %30, 0
  %39 = fsub <4 x float> %38, %27
  %40 = shufflevector <4 x float> %39, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %41 = add nsw i32 %8, -1
  %42 = icmp eq i32 %13, %41
  %43 = select i1 %37, i1 true, i1 %42
  %44 = select i1 %43, <2 x float> zeroinitializer, <2 x float> %40
  %45 = icmp eq i32 %16, 0
  %46 = add nsw i32 %11, -1
  %47 = icmp eq i32 %16, %46
  %48 = select i1 %45, i1 true, i1 %47
  %49 = select i1 %48, <2 x float> zeroinitializer, <2 x float> %36
  %50 = fmul <2 x float> %49, %49
  %51 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %44, <2 x float> %44, <2 x float> %50)
  %52 = tail call <2 x float> @air.sqrt.v2f32(<2 x float> %51) #4
  %53 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %25, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !33, !noalias !30
  %54 = extractvalue { <4 x float>, i8 } %53, 0
  %55 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* %0, i64 0, i32 0
  %56 = load float, float addrspace(2)* %55, align 4, !tbaa !37, !alias.scope !30, !noalias !33
  %57 = insertelement <2 x float> undef, float %56, i64 0
  %58 = shufflevector <2 x float> %57, <2 x float> undef, <2 x i32> zeroinitializer
  %59 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %58, <2 x float> %52, <2 x float> <float 1.000000e+00, float 1.000000e+00>)
  %60 = fdiv <2 x float> <float 1.000000e+00, float 1.000000e+00>, %59
  %61 = shufflevector <2 x float> %60, <2 x float> undef, <4 x i32> <i32 0, i32 1, i32 0, i32 1>
  %62 = insertelement <4 x float> undef, float %56, i64 0
  %63 = shufflevector <4 x float> %62, <4 x float> undef, <4 x i32> zeroinitializer
  %64 = shufflevector <2 x float> %44, <2 x float> %49, <4 x i32> <i32 0, i32 1, i32 2, i32 3>
  %65 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %63, <4 x float> %64, <4 x float> %54)
  %66 = fmul <4 x float> %65, %61
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %1, <4 x float> %66, i32 0, i32 2) #1, !alias.scope !38, !noalias !39
  br label %67

67:                                               ; preds = %18, %15, %6
  ret void
}

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #1

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <4 x float> @llvm.fmuladd.v4f32(<4 x float>, <4 x float>, <4 x float>) #2

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <2 x float> @llvm.fmuladd.v2f32(<2 x float>, <2 x float>, <2 x float>) #2

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare <2 x float> @air.sqrt.v2f32(<2 x float>) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32>) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare <2 x i32> @air.clamp.s.v2i32(<2 x i32>, <2 x i32>, <2 x i32>) local_unnamed_addr #4

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly nounwind }
attributes #2 = { nocallback nofree nosync nounwind readnone speculatable willreturn }
attributes #3 = { argmemonly convergent nounwind readonly }
attributes #4 = { nounwind readnone }

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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_estimateTVDual2", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 12, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_estimateTVDual2_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"float", !"m_tauDivTheta", i32 4, i32 4, i32 0, !"int", !"m_dimX", i32 8, i32 4, i32 0, !"int", !"m_dimY"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler_nearest"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"flowIn_"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"P_k_"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"P_kp1_"}
!24 = !{!25, !29, i64 4}
!25 = !{!"_ZTSN16soOFlowEstimator39soOFlowEstimator_estimateTVDual2_paramsE", !26, i64 0, !29, i64 4, !29, i64 8}
!26 = !{!"float", !27, i64 0}
!27 = !{!"omnipotent char", !28, i64 0}
!28 = !{!"Simple C++ TBAA"}
!29 = !{!"int", !27, i64 0}
!30 = !{!31}
!31 = distinct !{!31, !32, !"air-alias-scope-arg(0)"}
!32 = distinct !{!32, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_estimateTVDual2)"}
!33 = !{!34, !35}
!34 = distinct !{!34, !32, !"air-alias-scope-samplers"}
!35 = distinct !{!35, !32, !"air-alias-scope-textures"}
!36 = !{!25, !29, i64 8}
!37 = !{!25, !26, i64 0}
!38 = !{!35}
!39 = !{!31, !34}

