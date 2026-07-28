0x000000000a929d -- soOFlowEstimator::soOFlowEstimator_flowWarpOneImage:
source_filename = "soOFlowEstimator::soOFlowEstimator_flowWarpOneImage"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" = type { float, i32, i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_flowWarpOneImage"(%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5) local_unnamed_addr #0 {
  %7 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %1) #4
  %8 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* %0, i64 0, i32 1
  %9 = load i32, i32 addrspace(2)* %8, align 4, !tbaa !24, !alias.scope !30, !noalias !33
  %10 = tail call float @air.convert.f.f32.s.i32(i32 %9) #4
  %11 = insertelement <2 x float> undef, float %10, i64 0
  %12 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* %0, i64 0, i32 2
  %13 = load i32, i32 addrspace(2)* %12, align 4, !tbaa !36, !alias.scope !30, !noalias !33
  %14 = tail call float @air.convert.f.f32.s.i32(i32 %13) #4
  %15 = insertelement <2 x float> %11, float %14, i64 1
  %16 = extractelement <2 x i32> %1, i64 0
  %17 = tail call float @air.convert.f.f32.u.i32(i32 %16) #4
  %18 = fcmp ult float %17, %10
  br i1 %18, label %19, label %64

19:                                               ; preds = %6
  %20 = extractelement <2 x i32> %1, i64 1
  %21 = tail call float @air.convert.f.f32.u.i32(i32 %20) #4
  %22 = fcmp ult float %21, %14
  br i1 %22, label %23, label %64

23:                                               ; preds = %19
  %24 = fadd <2 x float> %7, <float 5.000000e-01, float 5.000000e-01>
  %25 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %24, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !33, !noalias !30
  %26 = extractvalue { <4 x float>, i8 } %25, 0
  %27 = shufflevector <4 x float> %26, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %28 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* %0, i64 0, i32 0
  %29 = load float, float addrspace(2)* %28, align 4, !tbaa !37, !alias.scope !30, !noalias !33
  %30 = insertelement <2 x float> undef, float %29, i64 0
  %31 = shufflevector <2 x float> %30, <2 x float> undef, <2 x i32> zeroinitializer
  %32 = fsub <2 x float> <float -0.000000e+00, float -0.000000e+00>, %31
  %33 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %32, <2 x float> %27, <2 x float> %7)
  %34 = fadd <2 x float> %15, <float -1.000000e+00, float -1.000000e+00>
  %35 = tail call <2 x float> @air.clamp.v2f32(<2 x float> %33, <2 x float> zeroinitializer, <2 x float> %34) #4
  %36 = tail call <2 x float> @air.floor.v2f32(<2 x float> %35) #4
  %37 = fsub <2 x float> %35, %36
  %38 = fadd <2 x float> %36, <float 5.000000e-01, float 5.000000e-01>
  %39 = fadd <2 x float> %38, <float 1.000000e+00, float 0.000000e+00>
  %40 = fadd <2 x float> %38, <float 0.000000e+00, float 1.000000e+00>
  %41 = fadd <2 x float> %38, <float 1.000000e+00, float 1.000000e+00>
  %42 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %38, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !33, !noalias !30
  %43 = extractvalue { <4 x float>, i8 } %42, 0
  %44 = shufflevector <4 x float> %43, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %45 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %39, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !33, !noalias !30
  %46 = extractvalue { <4 x float>, i8 } %45, 0
  %47 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %40, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !33, !noalias !30
  %48 = extractvalue { <4 x float>, i8 } %47, 0
  %49 = shufflevector <4 x float> %48, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %50 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %41, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !33, !noalias !30
  %51 = extractvalue { <4 x float>, i8 } %50, 0
  %52 = shufflevector <2 x float> %37, <2 x float> undef, <2 x i32> zeroinitializer
  %53 = fsub <4 x float> %46, %43
  %54 = shufflevector <4 x float> %53, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %55 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %52, <2 x float> %54, <2 x float> %44) #5
  %56 = fsub <4 x float> %51, %48
  %57 = shufflevector <4 x float> %56, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %58 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %52, <2 x float> %57, <2 x float> %49) #5
  %59 = shufflevector <2 x float> %37, <2 x float> undef, <2 x i32> <i32 1, i32 1>
  %60 = fsub <2 x float> %58, %55
  %61 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %59, <2 x float> %60, <2 x float> %55) #5
  %62 = shufflevector <2 x float> %61, <2 x float> undef, <4 x i32> <i32 0, i32 undef, i32 undef, i32 undef>
  %63 = shufflevector <4 x float> <float undef, float undef, float undef, float 1.000000e+00>, <4 x float> %62, <4 x i32> <i32 4, i32 4, i32 4, i32 3>
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %1, <4 x float> %63, i32 0, i32 2) #1, !alias.scope !38, !noalias !39
  br label %64

64:                                               ; preds = %23, %19, %6
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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_flowWarpOneImage", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 12, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"float", !"m_dt", i32 4, i32 4, i32 0, !"int", !"m_dimX", i32 8, i32 4, i32 0, !"int", !"m_dimY"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I1_"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"I1_flowWarped_"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"flowIn_"}
!24 = !{!25, !29, i64 4}
!25 = !{!"_ZTSN16soOFlowEstimator40soOFlowEstimator_flowWarpOneImage_paramsE", !26, i64 0, !29, i64 4, !29, i64 8}
!26 = !{!"float", !27, i64 0}
!27 = !{!"omnipotent char", !28, i64 0}
!28 = !{!"Simple C++ TBAA"}
!29 = !{!"int", !27, i64 0}
!30 = !{!31}
!31 = distinct !{!31, !32, !"air-alias-scope-arg(0)"}
!32 = distinct !{!32, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_flowWarpOneImage)"}
!33 = !{!34, !35}
!34 = distinct !{!34, !32, !"air-alias-scope-samplers"}
!35 = distinct !{!35, !32, !"air-alias-scope-textures"}
!36 = !{!25, !29, i64 8}
!37 = !{!25, !26, i64 0}
!38 = !{!35}
!39 = !{!31, !34}

