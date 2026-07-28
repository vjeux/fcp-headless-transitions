0x000000000aea9d -- soOFlowEstimator::soOFlowEstimator_medianFilterFlow:
source_filename = "soOFlowEstimator::soOFlowEstimator_medianFilterFlow"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params" = type { i32, i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_medianFilterFlow"(%"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4) local_unnamed_addr #0 {
  %6 = alloca [18 x float], align 4
  %7 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params" addrspace(2)* %0, i64 0, i32 0
  %8 = load i32, i32 addrspace(2)* %7, align 4, !tbaa !23, !alias.scope !28, !noalias !31
  %9 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params" addrspace(2)* %0, i64 0, i32 1
  %10 = load i32, i32 addrspace(2)* %9, align 4, !tbaa !34, !alias.scope !28, !noalias !31
  %11 = extractelement <2 x i32> %1, i64 0
  %12 = icmp slt i32 %11, %8
  %13 = extractelement <2 x i32> %1, i64 1
  %14 = icmp slt i32 %13, %10
  %15 = select i1 %12, i1 %14, i1 false
  br i1 %15, label %16, label %107

16:                                               ; preds = %5
  %17 = insertelement <2 x i32> undef, i32 %8, i64 0
  %18 = insertelement <2 x i32> %17, i32 %10, i64 1
  %19 = bitcast [18 x float]* %6 to i8*
  call void @llvm.lifetime.start.p0i8(i64 72, i8* nonnull %19) #5
  %20 = add <2 x i32> %1, <i32 -1, i32 -1>
  %21 = add <2 x i32> %18, <i32 -1, i32 -1>
  %22 = tail call <2 x i32> @air.clamp.s.v2i32(<2 x i32> %20, <2 x i32> zeroinitializer, <2 x i32> %21) #3
  %23 = add <2 x i32> %1, <i32 1, i32 1>
  %24 = tail call <2 x i32> @air.clamp.s.v2i32(<2 x i32> %23, <2 x i32> zeroinitializer, <2 x i32> %21) #3
  %25 = extractelement <2 x i32> %22, i64 0
  %26 = extractelement <2 x i32> %24, i64 0
  %27 = icmp sgt i32 %25, %26
  br i1 %27, label %34, label %28

28:                                               ; preds = %16
  %29 = extractelement <2 x i32> %22, i64 1
  %30 = extractelement <2 x i32> %24, i64 1
  %31 = icmp sgt i32 %29, %30
  %32 = sub i32 1, %29
  %33 = add i32 %32, %30
  br label %37

34:                                               ; preds = %44, %16
  %35 = phi i32 [ 0, %16 ], [ %45, %44 ]
  %36 = icmp sgt i32 %35, 1
  br label %67

37:                                               ; preds = %44, %28
  %38 = phi i32 [ 0, %28 ], [ %45, %44 ]
  %39 = phi i32 [ %25, %28 ], [ %46, %44 ]
  br i1 %31, label %44, label %40

40:                                               ; preds = %37
  %41 = tail call float @air.convert.f.f32.s.i32(i32 %39) #3
  %42 = insertelement <2 x float> undef, float %41, i64 0
  %43 = add i32 %33, %38
  br label %48

44:                                               ; preds = %48, %37
  %45 = phi i32 [ %38, %37 ], [ %43, %48 ]
  %46 = add i32 %39, 1
  %47 = icmp eq i32 %39, %26
  br i1 %47, label %34, label %37, !llvm.loop !35

48:                                               ; preds = %48, %40
  %49 = phi i32 [ %38, %40 ], [ %64, %48 ]
  %50 = phi i32 [ %29, %40 ], [ %65, %48 ]
  %51 = tail call float @air.convert.f.f32.s.i32(i32 %50) #3
  %52 = insertelement <2 x float> %42, float %51, i64 1
  %53 = fadd <2 x float> %52, <float 5.000000e-01, float 5.000000e-01>
  %54 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %53, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4, !alias.scope !31, !noalias !28
  %55 = extractvalue { <4 x float>, i8 } %54, 0
  %56 = extractelement <4 x float> %55, i64 0
  %57 = shl nsw i32 %49, 1
  %58 = sext i32 %57 to i64
  %59 = getelementptr inbounds [18 x float], [18 x float]* %6, i64 0, i64 %58
  store float %56, float* %59, align 4, !tbaa !37
  %60 = extractelement <4 x float> %55, i64 1
  %61 = or i32 %57, 1
  %62 = sext i32 %61 to i64
  %63 = getelementptr inbounds [18 x float], [18 x float]* %6, i64 0, i64 %62
  store float %60, float* %63, align 4, !tbaa !37
  %64 = add i32 %49, 1
  %65 = add nsw i32 %50, 1
  %66 = icmp eq i32 %64, %43
  br i1 %66, label %44, label %48, !llvm.loop !39

67:                                               ; preds = %88, %34
  %68 = phi i1 [ true, %34 ], [ false, %88 ]
  %69 = phi i32 [ 0, %34 ], [ 1, %88 ]
  br i1 %36, label %86, label %88

70:                                               ; preds = %88
  %71 = tail call float @air.convert.f.f32.s.i32(i32 %35) #3
  %72 = fmul float %71, 5.000000e-01
  %73 = tail call float @air.ceil.f32(float %72) #3
  %74 = fadd float %73, -1.000000e+00
  %75 = tail call i32 @air.convert.s.i32.f.f32(float %74) #3
  %76 = shl nsw i32 %75, 1
  %77 = sext i32 %76 to i64
  %78 = getelementptr inbounds [18 x float], [18 x float]* %6, i64 0, i64 %77
  %79 = load float, float* %78, align 4, !tbaa !37
  %80 = or i32 %76, 1
  %81 = sext i32 %80 to i64
  %82 = getelementptr inbounds [18 x float], [18 x float]* %6, i64 0, i64 %81
  %83 = load float, float* %82, align 4, !tbaa !37
  %84 = insertelement <4 x float> <float undef, float undef, float 0.000000e+00, float 0.000000e+00>, float %79, i64 0
  %85 = insertelement <4 x float> %84, float %83, i64 1
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %1, <4 x float> %85, i32 0, i32 2) #2, !alias.scope !40, !noalias !41
  call void @llvm.lifetime.end.p0i8(i64 72, i8* nonnull %19) #5
  br label %107

86:                                               ; preds = %104, %67
  %87 = phi i32 [ %105, %104 ], [ 1, %67 ]
  br label %89

88:                                               ; preds = %104, %67
  br i1 %68, label %67, label %70, !llvm.loop !42

89:                                               ; preds = %101, %86
  %90 = phi i32 [ %87, %86 ], [ %102, %101 ]
  %91 = shl nuw nsw i32 %90, 1
  %92 = or i32 %91, %69
  %93 = sext i32 %92 to i64
  %94 = getelementptr inbounds [18 x float], [18 x float]* %6, i64 0, i64 %93
  %95 = load float, float* %94, align 4, !tbaa !37
  %96 = add i32 %92, -2
  %97 = sext i32 %96 to i64
  %98 = getelementptr inbounds [18 x float], [18 x float]* %6, i64 0, i64 %97
  %99 = load float, float* %98, align 4, !tbaa !37
  %100 = fcmp olt float %95, %99
  br i1 %100, label %101, label %104

101:                                              ; preds = %89
  store float %99, float* %94, align 4, !tbaa !37
  store float %95, float* %98, align 4, !tbaa !37
  %102 = add nsw i32 %90, -1
  %103 = icmp sgt i32 %90, 1
  br i1 %103, label %89, label %104, !llvm.loop !43

104:                                              ; preds = %101, %89
  %105 = add nuw nsw i32 %87, 1
  %106 = icmp eq i32 %105, %35
  br i1 %106, label %88, label %86, !llvm.loop !44

107:                                              ; preds = %70, %5
  ret void
}

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.end.p0i8(i64 immarg, i8* nocapture) #1

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare i32 @air.convert.s.i32.f.f32(float) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare float @air.ceil.f32(float) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #3

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare <2 x i32> @air.clamp.s.v2i32(<2 x i32>, <2 x i32>, <2 x i32>) local_unnamed_addr #3

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.start.p0i8(i64 immarg, i8* nocapture) #1

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly nocallback nofree nosync nounwind willreturn }
attributes #2 = { argmemonly nounwind }
attributes #3 = { nounwind readnone }
attributes #4 = { argmemonly convergent nounwind readonly }
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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_medianFilterFlow", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_dimX", i32 4, i32 4, i32 0, !"int", !"m_dimY"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"flowIn"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"flowOut"}
!23 = !{!24, !25, i64 0}
!24 = !{!"_ZTSN16soOFlowEstimator40soOFlowEstimator_medianFilterFlow_paramsE", !25, i64 0, !25, i64 4}
!25 = !{!"int", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(0)"}
!30 = distinct !{!30, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_medianFilterFlow)"}
!31 = !{!32, !33}
!32 = distinct !{!32, !30, !"air-alias-scope-samplers"}
!33 = distinct !{!33, !30, !"air-alias-scope-textures"}
!34 = !{!24, !25, i64 4}
!35 = distinct !{!35, !36}
!36 = !{!"llvm.loop.mustprogress"}
!37 = !{!38, !38, i64 0}
!38 = !{!"float", !26, i64 0}
!39 = distinct !{!39, !36}
!40 = !{!33}
!41 = !{!29, !32}
!42 = distinct !{!42, !36}
!43 = distinct !{!43, !36}
!44 = distinct !{!44, !36}

