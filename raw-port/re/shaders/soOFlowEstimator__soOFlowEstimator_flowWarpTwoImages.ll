0x000000000abd2d -- soOFlowEstimator::soOFlowEstimator_flowWarpTwoImages:
source_filename = "soOFlowEstimator::soOFlowEstimator_flowWarpTwoImages"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" = type { float, i32, i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_flowWarpTwoImages"(%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5, %struct._texture_2d_t addrspace(1)* %6, %struct._texture_2d_t addrspace(1)* %7) local_unnamed_addr #0 {
  %9 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %1) #4
  %10 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* %0, i64 0, i32 1
  %11 = load i32, i32 addrspace(2)* %10, align 4, !tbaa !26, !alias.scope !32, !noalias !35
  %12 = tail call float @air.convert.f.f32.s.i32(i32 %11) #4
  %13 = insertelement <2 x float> undef, float %12, i64 0
  %14 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* %0, i64 0, i32 2
  %15 = load i32, i32 addrspace(2)* %14, align 4, !tbaa !38, !alias.scope !32, !noalias !35
  %16 = tail call float @air.convert.f.f32.s.i32(i32 %15) #4
  %17 = insertelement <2 x float> %13, float %16, i64 1
  %18 = extractelement <2 x i32> %1, i64 0
  %19 = tail call float @air.convert.f.f32.u.i32(i32 %18) #4
  %20 = fcmp ult float %19, %12
  br i1 %20, label %21, label %99

21:                                               ; preds = %8
  %22 = extractelement <2 x i32> %1, i64 1
  %23 = tail call float @air.convert.f.f32.u.i32(i32 %22) #4
  %24 = fcmp ult float %23, %16
  br i1 %24, label %25, label %99

25:                                               ; preds = %21
  %26 = fadd <2 x float> %9, <float 5.000000e-01, float 5.000000e-01>
  %27 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %7, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %26, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !35, !noalias !32
  %28 = extractvalue { <4 x float>, i8 } %27, 0
  %29 = shufflevector <4 x float> %28, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %30 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)* %0, i64 0, i32 0
  %31 = load float, float addrspace(2)* %30, align 4, !tbaa !39, !alias.scope !32, !noalias !35
  %32 = insertelement <2 x float> undef, float %31, i64 0
  %33 = shufflevector <2 x float> %32, <2 x float> undef, <2 x i32> zeroinitializer
  %34 = fsub <2 x float> <float -0.000000e+00, float -0.000000e+00>, %33
  %35 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %34, <2 x float> %29, <2 x float> %9)
  %36 = fadd <2 x float> %17, <float -1.000000e+00, float -1.000000e+00>
  %37 = tail call <2 x float> @air.clamp.v2f32(<2 x float> %35, <2 x float> zeroinitializer, <2 x float> %36) #4
  %38 = tail call <2 x float> @air.floor.v2f32(<2 x float> %37) #4
  %39 = fsub <2 x float> %37, %38
  %40 = fadd <2 x float> %38, <float 5.000000e-01, float 5.000000e-01>
  %41 = fadd <2 x float> %40, <float 1.000000e+00, float 0.000000e+00>
  %42 = fadd <2 x float> %40, <float 0.000000e+00, float 1.000000e+00>
  %43 = fadd <2 x float> %40, <float 1.000000e+00, float 1.000000e+00>
  %44 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %40, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !35, !noalias !32
  %45 = extractvalue { <4 x float>, i8 } %44, 0
  %46 = shufflevector <4 x float> %45, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %47 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %41, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !35, !noalias !32
  %48 = extractvalue { <4 x float>, i8 } %47, 0
  %49 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %42, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !35, !noalias !32
  %50 = extractvalue { <4 x float>, i8 } %49, 0
  %51 = shufflevector <4 x float> %50, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %52 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %43, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !35, !noalias !32
  %53 = extractvalue { <4 x float>, i8 } %52, 0
  %54 = shufflevector <2 x float> %39, <2 x float> undef, <2 x i32> zeroinitializer
  %55 = fsub <4 x float> %48, %45
  %56 = shufflevector <4 x float> %55, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %57 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %54, <2 x float> %56, <2 x float> %46) #5
  %58 = fsub <4 x float> %53, %50
  %59 = shufflevector <4 x float> %58, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %60 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %54, <2 x float> %59, <2 x float> %51) #5
  %61 = shufflevector <2 x float> %39, <2 x float> undef, <2 x i32> <i32 1, i32 1>
  %62 = fsub <2 x float> %60, %57
  %63 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %61, <2 x float> %62, <2 x float> %57) #5
  %64 = shufflevector <2 x float> %63, <2 x float> undef, <4 x i32> <i32 0, i32 undef, i32 undef, i32 undef>
  %65 = shufflevector <4 x float> <float undef, float undef, float undef, float 1.000000e+00>, <4 x float> %64, <4 x i32> <i32 4, i32 4, i32 4, i32 3>
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %1, <4 x float> %65, i32 0, i32 2) #1, !alias.scope !40, !noalias !41
  %66 = fsub float 1.000000e+00, %31
  %67 = insertelement <2 x float> undef, float %66, i64 0
  %68 = shufflevector <2 x float> %67, <2 x float> undef, <2 x i32> zeroinitializer
  %69 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %68, <2 x float> %29, <2 x float> %9)
  %70 = tail call <2 x float> @air.clamp.v2f32(<2 x float> %69, <2 x float> zeroinitializer, <2 x float> %36) #4
  %71 = tail call <2 x float> @air.floor.v2f32(<2 x float> %70) #4
  %72 = fsub <2 x float> %70, %71
  %73 = fadd <2 x float> %71, <float 5.000000e-01, float 5.000000e-01>
  %74 = fadd <2 x float> %73, <float 1.000000e+00, float 0.000000e+00>
  %75 = fadd <2 x float> %73, <float 0.000000e+00, float 1.000000e+00>
  %76 = fadd <2 x float> %73, <float 1.000000e+00, float 1.000000e+00>
  %77 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %73, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !35, !noalias !32
  %78 = extractvalue { <4 x float>, i8 } %77, 0
  %79 = shufflevector <4 x float> %78, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %80 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %74, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !35, !noalias !32
  %81 = extractvalue { <4 x float>, i8 } %80, 0
  %82 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %75, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !35, !noalias !32
  %83 = extractvalue { <4 x float>, i8 } %82, 0
  %84 = shufflevector <4 x float> %83, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %85 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %76, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !35, !noalias !32
  %86 = extractvalue { <4 x float>, i8 } %85, 0
  %87 = shufflevector <2 x float> %72, <2 x float> undef, <2 x i32> zeroinitializer
  %88 = fsub <4 x float> %81, %78
  %89 = shufflevector <4 x float> %88, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %90 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %87, <2 x float> %89, <2 x float> %79) #5
  %91 = fsub <4 x float> %86, %83
  %92 = shufflevector <4 x float> %91, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %93 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %87, <2 x float> %92, <2 x float> %84) #5
  %94 = shufflevector <2 x float> %72, <2 x float> undef, <2 x i32> <i32 1, i32 1>
  %95 = fsub <2 x float> %93, %90
  %96 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %94, <2 x float> %95, <2 x float> %90) #5
  %97 = shufflevector <2 x float> %96, <2 x float> undef, <4 x i32> <i32 0, i32 undef, i32 undef, i32 undef>
  %98 = shufflevector <4 x float> <float undef, float undef, float undef, float 1.000000e+00>, <4 x float> %97, <4 x i32> <i32 4, i32 4, i32 4, i32 3>
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %6, <2 x i32> %1, <4 x float> %98, i32 0, i32 2) #1, !alias.scope !40, !noalias !41
  br label %99

99:                                               ; preds = %25, %21, %8
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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_flowWarpTwoImages", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24, !25}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 12, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_flowWarpTwoImages_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"float", !"m_dt", i32 4, i32 4, i32 0, !"int", !"m_dimX", i32 8, i32 4, i32 0, !"int", !"m_dimY"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I1_"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I2_"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"I1_flowWarped_"}
!24 = !{i32 6, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"I2_flowWarped_"}
!25 = !{i32 7, !"air.texture", !"air.location_index", i32 4, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"flowIn_"}
!26 = !{!27, !31, i64 4}
!27 = !{!"_ZTSN16soOFlowEstimator41soOFlowEstimator_flowWarpTwoImages_paramsE", !28, i64 0, !31, i64 4, !31, i64 8}
!28 = !{!"float", !29, i64 0}
!29 = !{!"omnipotent char", !30, i64 0}
!30 = !{!"Simple C++ TBAA"}
!31 = !{!"int", !29, i64 0}
!32 = !{!33}
!33 = distinct !{!33, !34, !"air-alias-scope-arg(0)"}
!34 = distinct !{!34, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_flowWarpTwoImages)"}
!35 = !{!36, !37}
!36 = distinct !{!36, !34, !"air-alias-scope-samplers"}
!37 = distinct !{!37, !34, !"air-alias-scope-textures"}
!38 = !{!27, !31, i64 8}
!39 = !{!27, !28, i64 0}
!40 = !{!37}
!41 = !{!33, !36}

