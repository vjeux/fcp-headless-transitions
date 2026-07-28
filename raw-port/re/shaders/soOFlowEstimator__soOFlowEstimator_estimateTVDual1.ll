0x000000000b872d -- soOFlowEstimator::soOFlowEstimator_estimateTVDual1:
source_filename = "soOFlowEstimator::soOFlowEstimator_estimateTVDual1"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params" = type { float, float, float, float, i32, i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_estimateTVDual1"(%"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5, %struct._texture_2d_t addrspace(1)* %6, %struct._texture_2d_t addrspace(1)* %7, %struct._texture_2d_t addrspace(1)* %8, %struct._texture_2d_t addrspace(1)* %9, %struct._texture_2d_t addrspace(1)* %10) local_unnamed_addr #0 {
  %12 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params" addrspace(2)* %0, i64 0, i32 4
  %13 = load i32, i32 addrspace(2)* %12, align 4, !tbaa !29, !alias.scope !35, !noalias !38
  %14 = insertelement <2 x i32> undef, i32 %13, i64 0
  %15 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params" addrspace(2)* %0, i64 0, i32 5
  %16 = load i32, i32 addrspace(2)* %15, align 4, !tbaa !41, !alias.scope !35, !noalias !38
  %17 = insertelement <2 x i32> %14, i32 %16, i64 1
  %18 = extractelement <2 x i32> %1, i64 0
  %19 = icmp slt i32 %18, %13
  br i1 %19, label %20, label %144

20:                                               ; preds = %11
  %21 = extractelement <2 x i32> %1, i64 1
  %22 = icmp slt i32 %21, %16
  br i1 %22, label %23, label %144

23:                                               ; preds = %20
  %24 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %1) #4
  %25 = fadd <2 x float> %24, <float 5.000000e-01, float 5.000000e-01>
  %26 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %7, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %25, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !38, !noalias !35
  %27 = extractvalue { <4 x float>, i8 } %26, 0
  %28 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %8, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %25, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !38, !noalias !35
  %29 = extractvalue { <4 x float>, i8 } %28, 0
  %30 = shufflevector <4 x float> %29, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %31 = fsub <4 x float> %29, %27
  %32 = shufflevector <4 x float> %31, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %33 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %25, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !38, !noalias !35
  %34 = extractvalue { <4 x float>, i8 } %33, 0
  %35 = extractelement <4 x float> %34, i64 0
  %36 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %25, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !38, !noalias !35
  %37 = extractvalue { <4 x float>, i8 } %36, 0
  %38 = extractelement <4 x float> %37, i64 0
  %39 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %25, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !38, !noalias !35
  %40 = extractvalue { <4 x float>, i8 } %39, 0
  %41 = shufflevector <4 x float> %40, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %42 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %6, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %25, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !38, !noalias !35
  %43 = extractvalue { <4 x float>, i8 } %42, 0
  %44 = shufflevector <4 x float> %43, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %45 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params" addrspace(2)* %0, i64 0, i32 0
  %46 = load float, float addrspace(2)* %45, align 4, !tbaa !42, !alias.scope !35, !noalias !38
  %47 = fsub float 1.000000e+00, %46
  %48 = tail call float @air.dot.v2f32(<2 x float> %41, <2 x float> %32) #4
  %49 = fmul float %46, %48
  %50 = tail call float @air.dot.v2f32(<2 x float> %44, <2 x float> %32) #4
  %51 = fmul float %47, %50
  %52 = fsub float %38, %35
  %53 = fadd float %52, %49
  %54 = fadd float %53, %51
  %55 = insertelement <2 x float> undef, float %46, i64 0
  %56 = shufflevector <2 x float> %55, <2 x float> undef, <2 x i32> zeroinitializer
  %57 = insertelement <2 x float> undef, float %47, i64 0
  %58 = shufflevector <2 x float> %57, <2 x float> undef, <2 x i32> zeroinitializer
  %59 = fmul <2 x float> %44, %58
  %60 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %56, <2 x float> %41, <2 x float> %59)
  %61 = tail call float @air.dot.v2f32(<2 x float> %60, <2 x float> %60) #4
  %62 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params" addrspace(2)* %0, i64 0, i32 2
  %63 = load float, float addrspace(2)* %62, align 4, !tbaa !43, !alias.scope !35, !noalias !38
  %64 = fmul float %61, %63
  %65 = insertelement <2 x float> undef, float %63, i64 0
  %66 = shufflevector <2 x float> %65, <2 x float> undef, <2 x i32> zeroinitializer
  %67 = fmul <2 x float> %60, %66
  %68 = fsub float -0.000000e+00, %64
  %69 = fcmp ugt float %54, %68
  br i1 %69, label %72, label %70

70:                                               ; preds = %23
  %71 = fadd <2 x float> %30, %67
  br label %86

72:                                               ; preds = %23
  %73 = fcmp ogt float %54, %68
  %74 = fcmp olt float %54, %64
  %75 = and i1 %73, %74
  br i1 %75, label %76, label %84

76:                                               ; preds = %72
  %77 = insertelement <2 x float> undef, float %54, i64 0
  %78 = shufflevector <2 x float> %77, <2 x float> undef, <2 x i32> zeroinitializer
  %79 = fmul <2 x float> %60, %78
  %80 = insertelement <2 x float> undef, float %61, i64 0
  %81 = shufflevector <2 x float> %80, <2 x float> undef, <2 x i32> zeroinitializer
  %82 = fdiv <2 x float> %79, %81
  %83 = fsub <2 x float> %30, %82
  br label %86

84:                                               ; preds = %72
  %85 = fsub <2 x float> %30, %67
  br label %86

86:                                               ; preds = %84, %76, %70
  %87 = phi <2 x float> [ %71, %70 ], [ %83, %76 ], [ %85, %84 ]
  %88 = add <2 x i32> %1, <i32 0, i32 -1>
  %89 = add <2 x i32> %17, <i32 -1, i32 -1>
  %90 = tail call <2 x i32> @air.clamp.s.v2i32(<2 x i32> %88, <2 x i32> zeroinitializer, <2 x i32> %89) #4
  %91 = add <2 x i32> %1, <i32 -1, i32 0>
  %92 = tail call <2 x i32> @air.clamp.s.v2i32(<2 x i32> %91, <2 x i32> zeroinitializer, <2 x i32> %89) #4
  %93 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %10, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %25, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !38, !noalias !35
  %94 = extractvalue { <4 x float>, i8 } %93, 0
  %95 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %90) #4
  %96 = fadd <2 x float> %95, <float 5.000000e-01, float 5.000000e-01>
  %97 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %10, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %96, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !38, !noalias !35
  %98 = extractvalue { <4 x float>, i8 } %97, 0
  %99 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %92) #4
  %100 = fadd <2 x float> %99, <float 5.000000e-01, float 5.000000e-01>
  %101 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %10, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %100, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !38, !noalias !35
  %102 = extractvalue { <4 x float>, i8 } %101, 0
  %103 = icmp eq i32 %18, 0
  br i1 %103, label %104, label %106

104:                                              ; preds = %86
  %105 = shufflevector <4 x float> %94, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  br label %115

106:                                              ; preds = %86
  %107 = add nsw i32 %13, -1
  %108 = icmp eq i32 %18, %107
  br i1 %108, label %109, label %112

109:                                              ; preds = %106
  %110 = shufflevector <4 x float> %102, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %111 = fsub <2 x float> <float -0.000000e+00, float -0.000000e+00>, %110
  br label %115

112:                                              ; preds = %106
  %113 = fsub <4 x float> %94, %102
  %114 = shufflevector <4 x float> %113, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  br label %115

115:                                              ; preds = %112, %109, %104
  %116 = phi <2 x float> [ %105, %104 ], [ %111, %109 ], [ %114, %112 ]
  %117 = icmp eq i32 %21, 0
  br i1 %117, label %118, label %120

118:                                              ; preds = %115
  %119 = shufflevector <4 x float> %94, <4 x float> undef, <2 x i32> <i32 2, i32 3>
  br label %129

120:                                              ; preds = %115
  %121 = add nsw i32 %16, -1
  %122 = icmp eq i32 %21, %121
  br i1 %122, label %123, label %126

123:                                              ; preds = %120
  %124 = shufflevector <4 x float> %98, <4 x float> undef, <2 x i32> <i32 2, i32 3>
  %125 = fsub <2 x float> <float -0.000000e+00, float -0.000000e+00>, %124
  br label %129

126:                                              ; preds = %120
  %127 = fsub <4 x float> %94, %98
  %128 = shufflevector <4 x float> %127, <4 x float> undef, <2 x i32> <i32 2, i32 3>
  br label %129

129:                                              ; preds = %126, %123, %118
  %130 = phi <2 x float> [ %119, %118 ], [ %125, %123 ], [ %128, %126 ]
  %131 = fadd <2 x float> %116, %130
  %132 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params" addrspace(2)* %0, i64 0, i32 1
  %133 = load float, float addrspace(2)* %132, align 4, !tbaa !44, !alias.scope !35, !noalias !38
  %134 = insertelement <2 x float> undef, float %133, i64 0
  %135 = shufflevector <2 x float> %134, <2 x float> undef, <2 x i32> zeroinitializer
  %136 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %135, <2 x float> %131, <2 x float> %87)
  %137 = shufflevector <2 x float> %136, <2 x float> undef, <4 x i32> <i32 0, i32 1, i32 undef, i32 undef>
  %138 = shufflevector <4 x float> %137, <4 x float> <float undef, float undef, float 0.000000e+00, float 0.000000e+00>, <4 x i32> <i32 0, i32 1, i32 6, i32 7>
  %139 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params" addrspace(2)* %0, i64 0, i32 3
  %140 = load float, float addrspace(2)* %139, align 4, !tbaa !45, !alias.scope !35, !noalias !38
  %141 = insertelement <4 x float> undef, float %140, i64 0
  %142 = shufflevector <4 x float> %141, <4 x float> undef, <4 x i32> zeroinitializer
  %143 = fmul <4 x float> %142, %138
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %9, <2 x i32> %1, <4 x float> %143, i32 0, i32 2) #1, !alias.scope !46, !noalias !47
  br label %144

144:                                              ; preds = %129, %20, %11
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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_estimateTVDual1", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24, !25, !26, !27, !28}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 24, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_estimateTVDual1_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"float", !"m_dt", i32 4, i32 4, i32 0, !"float", !"m_theta", i32 8, i32 4, i32 0, !"float", !"m_lambdaTheta", i32 12, i32 4, i32 0, !"float", !"m_scaleFlowOut", i32 16, i32 4, i32 0, !"int", !"m_dimX", i32 20, i32 4, i32 0, !"int", !"m_dimY"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler_nearest"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I1_flowWarped_"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I2_flowWarped_"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I1_flowWarpedGrad_"}
!24 = !{i32 6, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I2_flowWarpedGrad_"}
!25 = !{i32 7, !"air.texture", !"air.location_index", i32 4, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"flow_k0_"}
!26 = !{i32 8, !"air.texture", !"air.location_index", i32 5, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"flow_k_"}
!27 = !{i32 9, !"air.texture", !"air.location_index", i32 6, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"flow_kp1_"}
!28 = !{i32 10, !"air.texture", !"air.location_index", i32 7, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"P_"}
!29 = !{!30, !34, i64 16}
!30 = !{!"_ZTSN16soOFlowEstimator39soOFlowEstimator_estimateTVDual1_paramsE", !31, i64 0, !31, i64 4, !31, i64 8, !31, i64 12, !34, i64 16, !34, i64 20}
!31 = !{!"float", !32, i64 0}
!32 = !{!"omnipotent char", !33, i64 0}
!33 = !{!"Simple C++ TBAA"}
!34 = !{!"int", !32, i64 0}
!35 = !{!36}
!36 = distinct !{!36, !37, !"air-alias-scope-arg(0)"}
!37 = distinct !{!37, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_estimateTVDual1)"}
!38 = !{!39, !40}
!39 = distinct !{!39, !37, !"air-alias-scope-samplers"}
!40 = distinct !{!40, !37, !"air-alias-scope-textures"}
!41 = !{!30, !34, i64 20}
!42 = !{!30, !31, i64 0}
!43 = !{!30, !31, i64 8}
!44 = !{!30, !31, i64 4}
!45 = !{!30, !31, i64 12}
!46 = !{!40}
!47 = !{!36, !39}

