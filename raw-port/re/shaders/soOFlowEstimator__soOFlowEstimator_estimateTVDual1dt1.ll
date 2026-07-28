0x000000000bb39d -- soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt1:
source_filename = "soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt1"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params" = type { float, float, float, i32, i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt1"(%"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5, %struct._texture_2d_t addrspace(1)* %6, %struct._texture_2d_t addrspace(1)* %7, %struct._texture_2d_t addrspace(1)* %8, %struct._texture_2d_t addrspace(1)* %9) local_unnamed_addr #0 {
  %11 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params" addrspace(2)* %0, i64 0, i32 3
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !28, !alias.scope !34, !noalias !37
  %13 = insertelement <2 x i32> undef, i32 %12, i64 0
  %14 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params" addrspace(2)* %0, i64 0, i32 4
  %15 = load i32, i32 addrspace(2)* %14, align 4, !tbaa !40, !alias.scope !34, !noalias !37
  %16 = insertelement <2 x i32> %13, i32 %15, i64 1
  %17 = extractelement <2 x i32> %1, i64 0
  %18 = icmp slt i32 %17, %12
  br i1 %18, label %19, label %127

19:                                               ; preds = %10
  %20 = extractelement <2 x i32> %1, i64 1
  %21 = icmp slt i32 %20, %15
  br i1 %21, label %22, label %127

22:                                               ; preds = %19
  %23 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %1) #4
  %24 = fadd <2 x float> %23, <float 5.000000e-01, float 5.000000e-01>
  %25 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %6, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %24, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !37, !noalias !34
  %26 = extractvalue { <4 x float>, i8 } %25, 0
  %27 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %7, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %24, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !37, !noalias !34
  %28 = extractvalue { <4 x float>, i8 } %27, 0
  %29 = shufflevector <4 x float> %28, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %30 = fsub <4 x float> %28, %26
  %31 = shufflevector <4 x float> %30, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %32 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %24, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !37, !noalias !34
  %33 = extractvalue { <4 x float>, i8 } %32, 0
  %34 = extractelement <4 x float> %33, i64 0
  %35 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %24, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !37, !noalias !34
  %36 = extractvalue { <4 x float>, i8 } %35, 0
  %37 = extractelement <4 x float> %36, i64 0
  %38 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %24, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !37, !noalias !34
  %39 = extractvalue { <4 x float>, i8 } %38, 0
  %40 = shufflevector <4 x float> %39, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %41 = tail call float @air.dot.v2f32(<2 x float> %40, <2 x float> %31) #4
  %42 = fsub float %37, %34
  %43 = fadd float %41, %42
  %44 = tail call float @air.dot.v2f32(<2 x float> %40, <2 x float> %40) #4
  %45 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params" addrspace(2)* %0, i64 0, i32 1
  %46 = load float, float addrspace(2)* %45, align 4, !tbaa !41, !alias.scope !34, !noalias !37
  %47 = fmul float %44, %46
  %48 = insertelement <2 x float> undef, float %46, i64 0
  %49 = shufflevector <2 x float> %48, <2 x float> undef, <2 x i32> zeroinitializer
  %50 = fmul <2 x float> %40, %49
  %51 = fsub float -0.000000e+00, %47
  %52 = fcmp ugt float %43, %51
  br i1 %52, label %55, label %53

53:                                               ; preds = %22
  %54 = fadd <2 x float> %29, %50
  br label %69

55:                                               ; preds = %22
  %56 = fcmp ogt float %43, %51
  %57 = fcmp olt float %43, %47
  %58 = and i1 %56, %57
  br i1 %58, label %59, label %67

59:                                               ; preds = %55
  %60 = insertelement <2 x float> undef, float %43, i64 0
  %61 = shufflevector <2 x float> %60, <2 x float> undef, <2 x i32> zeroinitializer
  %62 = fmul <2 x float> %40, %61
  %63 = insertelement <2 x float> undef, float %44, i64 0
  %64 = shufflevector <2 x float> %63, <2 x float> undef, <2 x i32> zeroinitializer
  %65 = fdiv <2 x float> %62, %64
  %66 = fsub <2 x float> %29, %65
  br label %69

67:                                               ; preds = %55
  %68 = fsub <2 x float> %29, %50
  br label %69

69:                                               ; preds = %67, %59, %53
  %70 = phi <2 x float> [ %54, %53 ], [ %66, %59 ], [ %68, %67 ]
  %71 = add <2 x i32> %1, <i32 0, i32 -1>
  %72 = add <2 x i32> %16, <i32 -1, i32 -1>
  %73 = tail call <2 x i32> @air.clamp.s.v2i32(<2 x i32> %71, <2 x i32> zeroinitializer, <2 x i32> %72) #4
  %74 = add <2 x i32> %1, <i32 -1, i32 0>
  %75 = tail call <2 x i32> @air.clamp.s.v2i32(<2 x i32> %74, <2 x i32> zeroinitializer, <2 x i32> %72) #4
  %76 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %9, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %24, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !37, !noalias !34
  %77 = extractvalue { <4 x float>, i8 } %76, 0
  %78 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %73) #4
  %79 = fadd <2 x float> %78, <float 5.000000e-01, float 5.000000e-01>
  %80 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %9, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %79, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !37, !noalias !34
  %81 = extractvalue { <4 x float>, i8 } %80, 0
  %82 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %75) #4
  %83 = fadd <2 x float> %82, <float 5.000000e-01, float 5.000000e-01>
  %84 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %9, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %83, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !37, !noalias !34
  %85 = extractvalue { <4 x float>, i8 } %84, 0
  %86 = icmp eq i32 %17, 0
  br i1 %86, label %87, label %89

87:                                               ; preds = %69
  %88 = shufflevector <4 x float> %77, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  br label %98

89:                                               ; preds = %69
  %90 = add nsw i32 %12, -1
  %91 = icmp eq i32 %17, %90
  br i1 %91, label %92, label %95

92:                                               ; preds = %89
  %93 = shufflevector <4 x float> %85, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %94 = fsub <2 x float> <float -0.000000e+00, float -0.000000e+00>, %93
  br label %98

95:                                               ; preds = %89
  %96 = fsub <4 x float> %77, %85
  %97 = shufflevector <4 x float> %96, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  br label %98

98:                                               ; preds = %95, %92, %87
  %99 = phi <2 x float> [ %88, %87 ], [ %94, %92 ], [ %97, %95 ]
  %100 = icmp eq i32 %20, 0
  br i1 %100, label %101, label %103

101:                                              ; preds = %98
  %102 = shufflevector <4 x float> %77, <4 x float> undef, <2 x i32> <i32 2, i32 3>
  br label %112

103:                                              ; preds = %98
  %104 = add nsw i32 %15, -1
  %105 = icmp eq i32 %20, %104
  br i1 %105, label %106, label %109

106:                                              ; preds = %103
  %107 = shufflevector <4 x float> %81, <4 x float> undef, <2 x i32> <i32 2, i32 3>
  %108 = fsub <2 x float> <float -0.000000e+00, float -0.000000e+00>, %107
  br label %112

109:                                              ; preds = %103
  %110 = fsub <4 x float> %77, %81
  %111 = shufflevector <4 x float> %110, <4 x float> undef, <2 x i32> <i32 2, i32 3>
  br label %112

112:                                              ; preds = %109, %106, %101
  %113 = phi <2 x float> [ %102, %101 ], [ %108, %106 ], [ %111, %109 ]
  %114 = fadd <2 x float> %99, %113
  %115 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params" addrspace(2)* %0, i64 0, i32 0
  %116 = load float, float addrspace(2)* %115, align 4, !tbaa !42, !alias.scope !34, !noalias !37
  %117 = insertelement <2 x float> undef, float %116, i64 0
  %118 = shufflevector <2 x float> %117, <2 x float> undef, <2 x i32> zeroinitializer
  %119 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %118, <2 x float> %114, <2 x float> %70)
  %120 = shufflevector <2 x float> %119, <2 x float> undef, <4 x i32> <i32 0, i32 1, i32 undef, i32 undef>
  %121 = shufflevector <4 x float> %120, <4 x float> <float undef, float undef, float 0.000000e+00, float 0.000000e+00>, <4 x i32> <i32 0, i32 1, i32 6, i32 7>
  %122 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params" addrspace(2)* %0, i64 0, i32 2
  %123 = load float, float addrspace(2)* %122, align 4, !tbaa !43, !alias.scope !34, !noalias !37
  %124 = insertelement <4 x float> undef, float %123, i64 0
  %125 = shufflevector <4 x float> %124, <4 x float> undef, <4 x i32> zeroinitializer
  %126 = fmul <4 x float> %125, %121
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %8, <2 x i32> %1, <4 x float> %126, i32 0, i32 2) #1, !alias.scope !44, !noalias !45
  br label %127

127:                                              ; preds = %112, %19, %10
  ret void
}

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #1

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <2 x float> @llvm.fmuladd.v2f32(<2 x float>, <2 x float>, <2 x float>) #2

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32>) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare <2 x i32> @air.clamp.s.v2i32(<2 x i32>, <2 x i32>, <2 x i32>) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare float @air.dot.v2f32(<2 x float>, <2 x float>) local_unnamed_addr #4

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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt1", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24, !25, !26, !27}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 20, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt1_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"float", !"m_theta", i32 4, i32 4, i32 0, !"float", !"m_lambdaTheta", i32 8, i32 4, i32 0, !"float", !"m_scaleFlowOut", i32 12, i32 4, i32 0, !"int", !"m_dimX", i32 16, i32 4, i32 0, !"int", !"m_dimY"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler_nearest"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I1_flowWarped_"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I2_"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I1_flowWarpedGrad_"}
!24 = !{i32 6, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"flow_k0_"}
!25 = !{i32 7, !"air.texture", !"air.location_index", i32 4, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"flow_k_"}
!26 = !{i32 8, !"air.texture", !"air.location_index", i32 5, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"flow_kp1_"}
!27 = !{i32 9, !"air.texture", !"air.location_index", i32 6, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"P_"}
!28 = !{!29, !33, i64 12}
!29 = !{!"_ZTSN16soOFlowEstimator42soOFlowEstimator_estimateTVDual1dt1_paramsE", !30, i64 0, !30, i64 4, !30, i64 8, !33, i64 12, !33, i64 16}
!30 = !{!"float", !31, i64 0}
!31 = !{!"omnipotent char", !32, i64 0}
!32 = !{!"Simple C++ TBAA"}
!33 = !{!"int", !31, i64 0}
!34 = !{!35}
!35 = distinct !{!35, !36, !"air-alias-scope-arg(0)"}
!36 = distinct !{!36, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt1)"}
!37 = !{!38, !39}
!38 = distinct !{!38, !36, !"air-alias-scope-samplers"}
!39 = distinct !{!39, !36, !"air-alias-scope-textures"}
!40 = !{!29, !33, i64 16}
!41 = !{!29, !30, i64 4}
!42 = !{!29, !30, i64 0}
!43 = !{!29, !30, i64 8}
!44 = !{!39}
!45 = !{!35, !38}

