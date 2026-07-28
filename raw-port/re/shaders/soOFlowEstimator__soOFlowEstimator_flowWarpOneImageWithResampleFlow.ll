0x000000000aa6cd -- soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow:
source_filename = "soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" = type { float, i32, i32, i32, i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow"(%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5, %struct._texture_2d_t addrspace(1)* %6) local_unnamed_addr #0 {
  %8 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %1) #4
  %9 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* %0, i64 0, i32 3
  %10 = load i32, i32 addrspace(2)* %9, align 4, !tbaa !25, !alias.scope !31, !noalias !34
  %11 = tail call float @air.convert.f.f32.s.i32(i32 %10) #4
  %12 = insertelement <2 x float> undef, float %11, i64 0
  %13 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* %0, i64 0, i32 4
  %14 = load i32, i32 addrspace(2)* %13, align 4, !tbaa !37, !alias.scope !31, !noalias !34
  %15 = tail call float @air.convert.f.f32.s.i32(i32 %14) #4
  %16 = insertelement <2 x float> %12, float %15, i64 1
  %17 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* %0, i64 0, i32 1
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !38, !alias.scope !31, !noalias !34
  %19 = tail call float @air.convert.f.f32.s.i32(i32 %18) #4
  %20 = insertelement <2 x float> undef, float %19, i64 0
  %21 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* %0, i64 0, i32 2
  %22 = load i32, i32 addrspace(2)* %21, align 4, !tbaa !39, !alias.scope !31, !noalias !34
  %23 = tail call float @air.convert.f.f32.s.i32(i32 %22) #4
  %24 = insertelement <2 x float> %20, float %23, i64 1
  %25 = extractelement <2 x i32> %1, i64 0
  %26 = tail call float @air.convert.f.f32.u.i32(i32 %25) #4
  %27 = fcmp ult float %26, %11
  br i1 %27, label %28, label %102

28:                                               ; preds = %7
  %29 = extractelement <2 x i32> %1, i64 1
  %30 = tail call float @air.convert.f.f32.u.i32(i32 %29) #4
  %31 = fcmp ult float %30, %15
  br i1 %31, label %32, label %102

32:                                               ; preds = %28
  %33 = fdiv <2 x float> %24, %16
  %34 = fmul <2 x float> %8, %33
  %35 = fadd <2 x float> %24, <float -1.000000e+00, float -1.000000e+00>
  %36 = tail call <2 x float> @air.clamp.v2f32(<2 x float> %34, <2 x float> zeroinitializer, <2 x float> %35) #4
  %37 = tail call <2 x float> @air.floor.v2f32(<2 x float> %36) #4
  %38 = fsub <2 x float> %36, %37
  %39 = fadd <2 x float> %37, <float 5.000000e-01, float 5.000000e-01>
  %40 = fadd <2 x float> %39, <float 1.000000e+00, float 0.000000e+00>
  %41 = fadd <2 x float> %39, <float 0.000000e+00, float 1.000000e+00>
  %42 = fadd <2 x float> %39, <float 1.000000e+00, float 1.000000e+00>
  %43 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %39, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !34, !noalias !31
  %44 = extractvalue { <4 x float>, i8 } %43, 0
  %45 = shufflevector <4 x float> %44, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %46 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %40, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !34, !noalias !31
  %47 = extractvalue { <4 x float>, i8 } %46, 0
  %48 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %41, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !34, !noalias !31
  %49 = extractvalue { <4 x float>, i8 } %48, 0
  %50 = shufflevector <4 x float> %49, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %51 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %42, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !34, !noalias !31
  %52 = extractvalue { <4 x float>, i8 } %51, 0
  %53 = shufflevector <2 x float> %38, <2 x float> undef, <2 x i32> zeroinitializer
  %54 = fsub <4 x float> %47, %44
  %55 = shufflevector <4 x float> %54, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %56 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %53, <2 x float> %55, <2 x float> %45) #5
  %57 = fsub <4 x float> %52, %49
  %58 = shufflevector <4 x float> %57, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %59 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %53, <2 x float> %58, <2 x float> %50) #5
  %60 = shufflevector <2 x float> %38, <2 x float> undef, <2 x i32> <i32 1, i32 1>
  %61 = fsub <2 x float> %59, %56
  %62 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %60, <2 x float> %61, <2 x float> %56) #5
  %63 = fdiv <2 x float> %62, %33
  %64 = shufflevector <2 x float> %63, <2 x float> undef, <4 x i32> <i32 0, i32 1, i32 undef, i32 undef>
  %65 = shufflevector <4 x float> %64, <4 x float> <float undef, float undef, float 0.000000e+00, float 0.000000e+00>, <4 x i32> <i32 0, i32 1, i32 6, i32 7>
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %6, <2 x i32> %1, <4 x float> %65, i32 0, i32 2) #1, !alias.scope !40, !noalias !41
  %66 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* %0, i64 0, i32 0
  %67 = load float, float addrspace(2)* %66, align 4, !tbaa !42, !alias.scope !31, !noalias !34
  %68 = insertelement <2 x float> undef, float %67, i64 0
  %69 = shufflevector <2 x float> %68, <2 x float> undef, <2 x i32> zeroinitializer
  %70 = fsub <2 x float> <float -0.000000e+00, float -0.000000e+00>, %69
  %71 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %70, <2 x float> %63, <2 x float> %8)
  %72 = fadd <2 x float> %16, <float -1.000000e+00, float -1.000000e+00>
  %73 = tail call <2 x float> @air.clamp.v2f32(<2 x float> %71, <2 x float> zeroinitializer, <2 x float> %72) #4
  %74 = tail call <2 x float> @air.floor.v2f32(<2 x float> %73) #4
  %75 = fsub <2 x float> %73, %74
  %76 = fadd <2 x float> %74, <float 5.000000e-01, float 5.000000e-01>
  %77 = fadd <2 x float> %76, <float 1.000000e+00, float 0.000000e+00>
  %78 = fadd <2 x float> %76, <float 0.000000e+00, float 1.000000e+00>
  %79 = fadd <2 x float> %76, <float 1.000000e+00, float 1.000000e+00>
  %80 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %76, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !34, !noalias !31
  %81 = extractvalue { <4 x float>, i8 } %80, 0
  %82 = shufflevector <4 x float> %81, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %83 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %77, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !34, !noalias !31
  %84 = extractvalue { <4 x float>, i8 } %83, 0
  %85 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %78, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !34, !noalias !31
  %86 = extractvalue { <4 x float>, i8 } %85, 0
  %87 = shufflevector <4 x float> %86, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %88 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %79, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !34, !noalias !31
  %89 = extractvalue { <4 x float>, i8 } %88, 0
  %90 = shufflevector <2 x float> %75, <2 x float> undef, <2 x i32> zeroinitializer
  %91 = fsub <4 x float> %84, %81
  %92 = shufflevector <4 x float> %91, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %93 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %90, <2 x float> %92, <2 x float> %82) #5
  %94 = fsub <4 x float> %89, %86
  %95 = shufflevector <4 x float> %94, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %96 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %90, <2 x float> %95, <2 x float> %87) #5
  %97 = shufflevector <2 x float> %75, <2 x float> undef, <2 x i32> <i32 1, i32 1>
  %98 = fsub <2 x float> %96, %93
  %99 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %97, <2 x float> %98, <2 x float> %93) #5
  %100 = shufflevector <2 x float> %99, <2 x float> undef, <4 x i32> <i32 0, i32 undef, i32 undef, i32 undef>
  %101 = shufflevector <4 x float> <float undef, float undef, float undef, float 1.000000e+00>, <4 x float> %100, <4 x i32> <i32 4, i32 4, i32 4, i32 3>
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %1, <4 x float> %101, i32 0, i32 2) #1, !alias.scope !40, !noalias !41
  br label %102

102:                                              ; preds = %32, %28, %7
  ret void
}

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #1

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <2 x float> @llvm.fmuladd.v2f32(<2 x float>, <2 x float>, <2 x float>) #2

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare <2 x float> @air.floor.v2f32(<2 x float>) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare <2 x float> @air.clamp.v2f32(<2 x float>, <2 x float>, <2 x float>) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.u.i32(i32) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32>) local_unnamed_addr #4

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly nounwind }
attributes #2 = { nocallback nofree nosync nounwind readnone speculatable willreturn }
attributes #3 = { argmemonly convergent nounwind readonly }
attributes #4 = { nounwind readnone }
attributes #5 = { nounwind }

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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 20, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"float", !"m_dt", i32 4, i32 4, i32 0, !"int", !"m_prevDimX", i32 8, i32 4, i32 0, !"int", !"m_prevDimY", i32 12, i32 4, i32 0, !"int", !"m_dimX", i32 16, i32 4, i32 0, !"int", !"m_dimY"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I1_"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"I1_flowWarped_"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"flowIn_"}
!24 = !{i32 6, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"flowOut_"}
!25 = !{!26, !30, i64 12}
!26 = !{!"_ZTSN16soOFlowEstimator56soOFlowEstimator_flowWarpOneImageWithResampleFlow_paramsE", !27, i64 0, !30, i64 4, !30, i64 8, !30, i64 12, !30, i64 16}
!27 = !{!"float", !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{!"int", !28, i64 0}
!31 = !{!32}
!32 = distinct !{!32, !33, !"air-alias-scope-arg(0)"}
!33 = distinct !{!33, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow)"}
!34 = !{!35, !36}
!35 = distinct !{!35, !33, !"air-alias-scope-samplers"}
!36 = distinct !{!36, !33, !"air-alias-scope-textures"}
!37 = !{!26, !30, i64 16}
!38 = !{!26, !30, i64 4}
!39 = !{!26, !30, i64 8}
!40 = !{!36}
!41 = !{!32, !35}
!42 = !{!26, !27, i64 0}

