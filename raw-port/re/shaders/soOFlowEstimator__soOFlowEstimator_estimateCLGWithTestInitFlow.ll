0x000000000b38cd -- soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow:
source_filename = "soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params" = type { float, float, float, i32, i32, i32, i32 }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant i64 -9188470239253725111, align 8

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow"(%"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._texture_2d_t addrspace(1)* %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5, float addrspace(1)* nocapture "air-buffer-no-alias" %6) local_unnamed_addr #0 {
  %8 = extractelement <2 x i32> %1, i64 0
  %9 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params" addrspace(2)* %0, i64 0, i32 3
  %10 = load i32, i32 addrspace(2)* %9, align 4, !tbaa !26, !alias.scope !32, !noalias !35
  %11 = icmp slt i32 %8, %10
  br i1 %11, label %12, label %56

12:                                               ; preds = %7
  %13 = extractelement <2 x i32> %1, i64 1
  %14 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params" addrspace(2)* %0, i64 0, i32 4
  %15 = load i32, i32 addrspace(2)* %14, align 4, !tbaa !38, !alias.scope !32, !noalias !35
  %16 = icmp slt i32 %13, %15
  br i1 %16, label %17, label %56

17:                                               ; preds = %12
  %18 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %1) #3
  %19 = fadd <2 x float> %18, <float 5.000000e-01, float 5.000000e-01>
  %20 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %19, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2
  %21 = extractvalue { <4 x float>, i8 } %20, 0
  %22 = extractelement <4 x float> %21, i64 0
  %23 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %19, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2
  %24 = extractvalue { <4 x float>, i8 } %23, 0
  %25 = extractelement <4 x float> %24, i64 0
  %26 = fsub float %22, %25
  %27 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %19, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2
  %28 = extractvalue { <4 x float>, i8 } %27, 0
  %29 = shufflevector <4 x float> %28, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %30 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params" addrspace(2)* %0, i64 0, i32 1
  %31 = load float, float addrspace(2)* %30, align 4, !tbaa !39, !alias.scope !32, !noalias !35
  %32 = insertelement <2 x float> undef, float %31, i64 0
  %33 = shufflevector <2 x float> %32, <2 x float> undef, <2 x i32> zeroinitializer
  %34 = fsub float -0.000000e+00, %26
  %35 = insertelement <2 x float> undef, float %34, i64 0
  %36 = shufflevector <2 x float> %35, <2 x float> undef, <2 x i32> zeroinitializer
  %37 = fmul <2 x float> %29, %36
  %38 = fmul <2 x float> %33, %37
  %39 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params" addrspace(2)* %0, i64 0, i32 2
  %40 = load float, float addrspace(2)* %39, align 4, !tbaa !40, !alias.scope !32, !noalias !35
  %41 = insertelement <2 x float> undef, float %40, i64 0
  %42 = shufflevector <2 x float> %41, <2 x float> undef, <2 x i32> zeroinitializer
  %43 = fmul <2 x float> %42, %38
  %44 = shufflevector <2 x float> %43, <2 x float> undef, <4 x i32> <i32 0, i32 1, i32 0, i32 1>
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %1, <4 x float> %44, i32 0, i32 2) #1, !alias.scope !41, !noalias !42
  %45 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params" addrspace(2)* %0, i64 0, i32 5
  %46 = load i32, i32 addrspace(2)* %45, align 4, !tbaa !43, !alias.scope !32, !noalias !35
  %47 = icmp eq i32 %46, 0
  br i1 %47, label %56, label %48

48:                                               ; preds = %17
  %49 = fmul float %26, %26
  %50 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params" addrspace(2)* %0, i64 0, i32 6
  %51 = load i32, i32 addrspace(2)* %50, align 4, !tbaa !44, !alias.scope !32, !noalias !35
  %52 = mul nsw i32 %51, %13
  %53 = add nsw i32 %52, %8
  %54 = sext i32 %53 to i64
  %55 = getelementptr inbounds float, float addrspace(1)* %6, i64 %54
  store float %49, float addrspace(1)* %55, align 4, !tbaa !45, !alias.scope !46, !noalias !47
  br label %56

56:                                               ; preds = %48, %17, %12, %7
  ret void
}

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32>) local_unnamed_addr #3

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
!air.sampler_states = !{!25}

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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params" addrspace(2)*, <2 x i32>, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, float addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 28, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"float", !"m_smooth", i32 4, i32 4, i32 0, !"float", !"m_dt", i32 8, i32 4, i32 0, !"float", !"m_denom", i32 12, i32 4, i32 0, !"int", !"m_dimX", i32 16, i32 4, i32 0, !"int", !"m_dimY", i32 20, i32 4, i32 0, !"uint", !"m_writeE", i32 24, i32 4, i32 0, !"int", !"m_rowSizeE"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord"}
!20 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"image0"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"image1"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"grad"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"flowOut"}
!24 = !{i32 6, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"E"}
!25 = !{!"air.sampler_state", i64 addrspace(2)* @__air_sampler_state}
!26 = !{!27, !31, i64 12}
!27 = !{!"_ZTSN16soOFlowEstimator51soOFlowEstimator_estimateCLGWithTestInitFlow_paramsE", !28, i64 0, !28, i64 4, !28, i64 8, !31, i64 12, !31, i64 16, !31, i64 20, !31, i64 24}
!28 = !{!"float", !29, i64 0}
!29 = !{!"omnipotent char", !30, i64 0}
!30 = !{!"Simple C++ TBAA"}
!31 = !{!"int", !29, i64 0}
!32 = !{!33}
!33 = distinct !{!33, !34, !"air-alias-scope-arg(0)"}
!34 = distinct !{!34, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow)"}
!35 = !{!36, !37}
!36 = distinct !{!36, !34, !"air-alias-scope-textures"}
!37 = distinct !{!37, !34, !"air-alias-scope-arg(6)"}
!38 = !{!27, !31, i64 16}
!39 = !{!27, !28, i64 4}
!40 = !{!27, !28, i64 8}
!41 = !{!36}
!42 = !{!33, !37}
!43 = !{!27, !31, i64 20}
!44 = !{!27, !31, i64 24}
!45 = !{!28, !28, i64 0}
!46 = !{!37}
!47 = !{!33, !36}

