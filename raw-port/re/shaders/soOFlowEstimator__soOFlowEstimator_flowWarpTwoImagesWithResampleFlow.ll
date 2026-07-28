0x000000000ad2dd -- soOFlowEstimator::soOFlowEstimator_flowWarpTwoImagesWithResampleFlow:
source_filename = "soOFlowEstimator::soOFlowEstimator_flowWarpTwoImagesWithResampleFlow"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" = type { float, i32, i32, i32, i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_flowWarpTwoImagesWithResampleFlow"(%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5, %struct._texture_2d_t addrspace(1)* %6, %struct._texture_2d_t addrspace(1)* %7, %struct._texture_2d_t addrspace(1)* %8) local_unnamed_addr #0 {
  %10 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %1) #4
  %11 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* %0, i64 0, i32 3
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !27, !alias.scope !33, !noalias !36
  %13 = tail call float @air.convert.f.f32.s.i32(i32 %12) #4
  %14 = insertelement <2 x float> undef, float %13, i64 0
  %15 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* %0, i64 0, i32 4
  %16 = load i32, i32 addrspace(2)* %15, align 4, !tbaa !39, !alias.scope !33, !noalias !36
  %17 = tail call float @air.convert.f.f32.s.i32(i32 %16) #4
  %18 = insertelement <2 x float> %14, float %17, i64 1
  %19 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* %0, i64 0, i32 1
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !40, !alias.scope !33, !noalias !36
  %21 = tail call float @air.convert.f.f32.s.i32(i32 %20) #4
  %22 = insertelement <2 x float> undef, float %21, i64 0
  %23 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* %0, i64 0, i32 2
  %24 = load i32, i32 addrspace(2)* %23, align 4, !tbaa !41, !alias.scope !33, !noalias !36
  %25 = tail call float @air.convert.f.f32.s.i32(i32 %24) #4
  %26 = insertelement <2 x float> %22, float %25, i64 1
  %27 = extractelement <2 x i32> %1, i64 0
  %28 = tail call float @air.convert.f.f32.u.i32(i32 %27) #4
  %29 = fcmp ult float %28, %13
  br i1 %29, label %30, label %137

30:                                               ; preds = %9
  %31 = extractelement <2 x i32> %1, i64 1
  %32 = tail call float @air.convert.f.f32.u.i32(i32 %31) #4
  %33 = fcmp ult float %32, %17
  br i1 %33, label %34, label %137

34:                                               ; preds = %30
  %35 = fdiv <2 x float> %26, %18
  %36 = fmul <2 x float> %10, %35
  %37 = fadd <2 x float> %26, <float -1.000000e+00, float -1.000000e+00>
  %38 = tail call <2 x float> @air.clamp.v2f32(<2 x float> %36, <2 x float> zeroinitializer, <2 x float> %37) #4
  %39 = tail call <2 x float> @air.floor.v2f32(<2 x float> %38) #4
  %40 = fsub <2 x float> %38, %39
  %41 = fadd <2 x float> %39, <float 5.000000e-01, float 5.000000e-01>
  %42 = fadd <2 x float> %41, <float 1.000000e+00, float 0.000000e+00>
  %43 = fadd <2 x float> %41, <float 0.000000e+00, float 1.000000e+00>
  %44 = fadd <2 x float> %41, <float 1.000000e+00, float 1.000000e+00>
  %45 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %7, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %41, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %46 = extractvalue { <4 x float>, i8 } %45, 0
  %47 = shufflevector <4 x float> %46, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %48 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %7, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %42, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %49 = extractvalue { <4 x float>, i8 } %48, 0
  %50 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %7, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %43, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %51 = extractvalue { <4 x float>, i8 } %50, 0
  %52 = shufflevector <4 x float> %51, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %53 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %7, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %44, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %54 = extractvalue { <4 x float>, i8 } %53, 0
  %55 = shufflevector <2 x float> %40, <2 x float> undef, <2 x i32> zeroinitializer
  %56 = fsub <4 x float> %49, %46
  %57 = shufflevector <4 x float> %56, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %58 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %55, <2 x float> %57, <2 x float> %47) #5
  %59 = fsub <4 x float> %54, %51
  %60 = shufflevector <4 x float> %59, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %61 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %55, <2 x float> %60, <2 x float> %52) #5
  %62 = shufflevector <2 x float> %40, <2 x float> undef, <2 x i32> <i32 1, i32 1>
  %63 = fsub <2 x float> %61, %58
  %64 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %62, <2 x float> %63, <2 x float> %58) #5
  %65 = fdiv <2 x float> %64, %35
  %66 = shufflevector <2 x float> %65, <2 x float> undef, <4 x i32> <i32 0, i32 1, i32 undef, i32 undef>
  %67 = shufflevector <4 x float> %66, <4 x float> <float undef, float undef, float 0.000000e+00, float 0.000000e+00>, <4 x i32> <i32 0, i32 1, i32 6, i32 7>
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %8, <2 x i32> %1, <4 x float> %67, i32 0, i32 2) #1, !alias.scope !42, !noalias !43
  %68 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)* %0, i64 0, i32 0
  %69 = load float, float addrspace(2)* %68, align 4, !tbaa !44, !alias.scope !33, !noalias !36
  %70 = insertelement <2 x float> undef, float %69, i64 0
  %71 = shufflevector <2 x float> %70, <2 x float> undef, <2 x i32> zeroinitializer
  %72 = fsub <2 x float> <float -0.000000e+00, float -0.000000e+00>, %71
  %73 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %72, <2 x float> %65, <2 x float> %10)
  %74 = fadd <2 x float> %18, <float -1.000000e+00, float -1.000000e+00>
  %75 = tail call <2 x float> @air.clamp.v2f32(<2 x float> %73, <2 x float> zeroinitializer, <2 x float> %74) #4
  %76 = tail call <2 x float> @air.floor.v2f32(<2 x float> %75) #4
  %77 = fsub <2 x float> %75, %76
  %78 = fadd <2 x float> %76, <float 5.000000e-01, float 5.000000e-01>
  %79 = fadd <2 x float> %78, <float 1.000000e+00, float 0.000000e+00>
  %80 = fadd <2 x float> %78, <float 0.000000e+00, float 1.000000e+00>
  %81 = fadd <2 x float> %78, <float 1.000000e+00, float 1.000000e+00>
  %82 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %78, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %83 = extractvalue { <4 x float>, i8 } %82, 0
  %84 = shufflevector <4 x float> %83, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %85 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %79, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %86 = extractvalue { <4 x float>, i8 } %85, 0
  %87 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %80, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %88 = extractvalue { <4 x float>, i8 } %87, 0
  %89 = shufflevector <4 x float> %88, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %90 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %81, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %91 = extractvalue { <4 x float>, i8 } %90, 0
  %92 = shufflevector <2 x float> %77, <2 x float> undef, <2 x i32> zeroinitializer
  %93 = fsub <4 x float> %86, %83
  %94 = shufflevector <4 x float> %93, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %95 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %92, <2 x float> %94, <2 x float> %84) #5
  %96 = fsub <4 x float> %91, %88
  %97 = shufflevector <4 x float> %96, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %98 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %92, <2 x float> %97, <2 x float> %89) #5
  %99 = shufflevector <2 x float> %77, <2 x float> undef, <2 x i32> <i32 1, i32 1>
  %100 = fsub <2 x float> %98, %95
  %101 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %99, <2 x float> %100, <2 x float> %95) #5
  %102 = shufflevector <2 x float> %101, <2 x float> undef, <4 x i32> <i32 0, i32 undef, i32 undef, i32 undef>
  %103 = shufflevector <4 x float> <float undef, float undef, float undef, float 1.000000e+00>, <4 x float> %102, <4 x i32> <i32 4, i32 4, i32 4, i32 3>
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %1, <4 x float> %103, i32 0, i32 2) #1, !alias.scope !42, !noalias !43
  %104 = fsub float 1.000000e+00, %69
  %105 = insertelement <2 x float> undef, float %104, i64 0
  %106 = shufflevector <2 x float> %105, <2 x float> undef, <2 x i32> zeroinitializer
  %107 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %106, <2 x float> %65, <2 x float> %10)
  %108 = tail call <2 x float> @air.clamp.v2f32(<2 x float> %107, <2 x float> zeroinitializer, <2 x float> %74) #4
  %109 = tail call <2 x float> @air.floor.v2f32(<2 x float> %108) #4
  %110 = fsub <2 x float> %108, %109
  %111 = fadd <2 x float> %109, <float 5.000000e-01, float 5.000000e-01>
  %112 = fadd <2 x float> %111, <float 1.000000e+00, float 0.000000e+00>
  %113 = fadd <2 x float> %111, <float 0.000000e+00, float 1.000000e+00>
  %114 = fadd <2 x float> %111, <float 1.000000e+00, float 1.000000e+00>
  %115 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %111, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %116 = extractvalue { <4 x float>, i8 } %115, 0
  %117 = shufflevector <4 x float> %116, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %118 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %112, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %119 = extractvalue { <4 x float>, i8 } %118, 0
  %120 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %113, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %121 = extractvalue { <4 x float>, i8 } %120, 0
  %122 = shufflevector <4 x float> %121, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %123 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %114, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !36, !noalias !33
  %124 = extractvalue { <4 x float>, i8 } %123, 0
  %125 = shufflevector <2 x float> %110, <2 x float> undef, <2 x i32> zeroinitializer
  %126 = fsub <4 x float> %119, %116
  %127 = shufflevector <4 x float> %126, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %128 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %125, <2 x float> %127, <2 x float> %117) #5
  %129 = fsub <4 x float> %124, %121
  %130 = shufflevector <4 x float> %129, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %131 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %125, <2 x float> %130, <2 x float> %122) #5
  %132 = shufflevector <2 x float> %110, <2 x float> undef, <2 x i32> <i32 1, i32 1>
  %133 = fsub <2 x float> %131, %128
  %134 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %132, <2 x float> %133, <2 x float> %128) #5
  %135 = shufflevector <2 x float> %134, <2 x float> undef, <4 x i32> <i32 0, i32 undef, i32 undef, i32 undef>
  %136 = shufflevector <4 x float> <float undef, float undef, float undef, float 1.000000e+00>, <4 x float> %135, <4 x i32> <i32 4, i32 4, i32 4, i32 3>
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %6, <2 x i32> %1, <4 x float> %136, i32 0, i32 2) #1, !alias.scope !42, !noalias !43
  br label %137

137:                                              ; preds = %34, %30, %9
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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_flowWarpTwoImagesWithResampleFlow", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24, !25, !26}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 20, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_flowWarpTwoImagesWithResampleFlow_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"float", !"m_dt", i32 4, i32 4, i32 0, !"int", !"m_prevDimX", i32 8, i32 4, i32 0, !"int", !"m_prevDimY", i32 12, i32 4, i32 0, !"int", !"m_dimX", i32 16, i32 4, i32 0, !"int", !"m_dimY"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I1"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"I2"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"I1_flowWarped"}
!24 = !{i32 6, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"I2_flowWarped"}
!25 = !{i32 7, !"air.texture", !"air.location_index", i32 4, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"flowIn"}
!26 = !{i32 8, !"air.texture", !"air.location_index", i32 5, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"flowOut"}
!27 = !{!28, !32, i64 12}
!28 = !{!"_ZTSN16soOFlowEstimator57soOFlowEstimator_flowWarpTwoImagesWithResampleFlow_paramsE", !29, i64 0, !32, i64 4, !32, i64 8, !32, i64 12, !32, i64 16}
!29 = !{!"float", !30, i64 0}
!30 = !{!"omnipotent char", !31, i64 0}
!31 = !{!"Simple C++ TBAA"}
!32 = !{!"int", !30, i64 0}
!33 = !{!34}
!34 = distinct !{!34, !35, !"air-alias-scope-arg(0)"}
!35 = distinct !{!35, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_flowWarpTwoImagesWithResampleFlow)"}
!36 = !{!37, !38}
!37 = distinct !{!37, !35, !"air-alias-scope-samplers"}
!38 = distinct !{!38, !35, !"air-alias-scope-textures"}
!39 = !{!28, !32, i64 16}
!40 = !{!28, !32, i64 4}
!41 = !{!28, !32, i64 8}
!42 = !{!38}
!43 = !{!34, !37}
!44 = !{!28, !29, i64 0}

