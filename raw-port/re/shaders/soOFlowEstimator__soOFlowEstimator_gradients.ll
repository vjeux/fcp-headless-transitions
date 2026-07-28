0x000000000aff5d -- soOFlowEstimator::soOFlowEstimator_gradients:
source_filename = "soOFlowEstimator::soOFlowEstimator_gradients"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params" = type { i32, i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_gradients"(%"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4) local_unnamed_addr #0 {
  %6 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params" addrspace(2)* %0, i64 0, i32 0
  %7 = load i32, i32 addrspace(2)* %6, align 4, !tbaa !23, !alias.scope !28, !noalias !31
  %8 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params" addrspace(2)* %0, i64 0, i32 1
  %9 = load i32, i32 addrspace(2)* %8, align 4, !tbaa !34, !alias.scope !28, !noalias !31
  %10 = extractelement <2 x i32> %1, i64 0
  %11 = icmp slt i32 %10, %7
  %12 = extractelement <2 x i32> %1, i64 1
  %13 = icmp slt i32 %12, %9
  %14 = select i1 %11, i1 %13, i1 false
  br i1 %14, label %15, label %59

15:                                               ; preds = %5
  %16 = insertelement <2 x i32> undef, i32 %7, i64 0
  %17 = insertelement <2 x i32> %16, i32 %9, i64 1
  %18 = add <2 x i32> %17, <i32 -1, i32 -1>
  %19 = add <2 x i32> %1, <i32 1, i32 0>
  %20 = tail call <2 x i32> @air.max.s.v2i32(<2 x i32> %19, <2 x i32> zeroinitializer) #3
  %21 = tail call <2 x i32> @air.min.s.v2i32(<2 x i32> %20, <2 x i32> %18) #3
  %22 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %21) #3
  %23 = fadd <2 x float> %22, <float 5.000000e-01, float 5.000000e-01>
  %24 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %23, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !31, !noalias !28
  %25 = extractvalue { <4 x float>, i8 } %24, 0
  %26 = extractelement <4 x float> %25, i64 0
  %27 = add <2 x i32> %1, <i32 -1, i32 0>
  %28 = tail call <2 x i32> @air.max.s.v2i32(<2 x i32> %27, <2 x i32> zeroinitializer) #3
  %29 = tail call <2 x i32> @air.min.s.v2i32(<2 x i32> %28, <2 x i32> %18) #3
  %30 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %29) #3
  %31 = fadd <2 x float> %30, <float 5.000000e-01, float 5.000000e-01>
  %32 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %31, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !31, !noalias !28
  %33 = extractvalue { <4 x float>, i8 } %32, 0
  %34 = extractelement <4 x float> %33, i64 0
  %35 = fsub float %26, %34
  %36 = fmul float %35, 5.000000e-01
  %37 = add <2 x i32> %1, <i32 0, i32 1>
  %38 = tail call <2 x i32> @air.max.s.v2i32(<2 x i32> %37, <2 x i32> zeroinitializer) #3
  %39 = tail call <2 x i32> @air.min.s.v2i32(<2 x i32> %38, <2 x i32> %18) #3
  %40 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %39) #3
  %41 = fadd <2 x float> %40, <float 5.000000e-01, float 5.000000e-01>
  %42 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %41, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !31, !noalias !28
  %43 = extractvalue { <4 x float>, i8 } %42, 0
  %44 = extractelement <4 x float> %43, i64 0
  %45 = add <2 x i32> %1, <i32 0, i32 -1>
  %46 = tail call <2 x i32> @air.max.s.v2i32(<2 x i32> %45, <2 x i32> zeroinitializer) #3
  %47 = tail call <2 x i32> @air.min.s.v2i32(<2 x i32> %46, <2 x i32> %18) #3
  %48 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %47) #3
  %49 = fadd <2 x float> %48, <float 5.000000e-01, float 5.000000e-01>
  %50 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %49, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !31, !noalias !28
  %51 = extractvalue { <4 x float>, i8 } %50, 0
  %52 = extractelement <4 x float> %51, i64 0
  %53 = fsub float %44, %52
  %54 = fmul float %53, 5.000000e-01
  %55 = insertelement <4 x float> undef, float %36, i64 0
  %56 = insertelement <4 x float> %55, float %54, i64 1
  %57 = insertelement <4 x float> %56, float %36, i64 2
  %58 = insertelement <4 x float> %57, float %54, i64 3
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %1, <4 x float> %58, i32 0, i32 2) #1, !alias.scope !35, !noalias !36
  br label %59

59:                                               ; preds = %15, %5
  ret void
}

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32>) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare <2 x i32> @air.min.s.v2i32(<2 x i32>, <2 x i32>) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare <2 x i32> @air.max.s.v2i32(<2 x i32>, <2 x i32>) local_unnamed_addr #3

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly nounwind }
attributes #2 = { argmemonly convergent nounwind readonly }
attributes #3 = { nounwind readnone }

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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_gradients", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_gradients_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_dimX", i32 4, i32 4, i32 0, !"int", !"m_dimY"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"grad"}
!23 = !{!24, !25, i64 0}
!24 = !{!"_ZTSN16soOFlowEstimator33soOFlowEstimator_gradients_paramsE", !25, i64 0, !25, i64 4}
!25 = !{!"int", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(0)"}
!30 = distinct !{!30, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_gradients)"}
!31 = !{!32, !33}
!32 = distinct !{!32, !30, !"air-alias-scope-samplers"}
!33 = distinct !{!33, !30, !"air-alias-scope-textures"}
!34 = !{!24, !25, i64 4}
!35 = !{!33}
!36 = !{!29, !32}

