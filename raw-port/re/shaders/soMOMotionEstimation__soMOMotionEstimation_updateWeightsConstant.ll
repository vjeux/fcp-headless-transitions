0x000000000d674d -- soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant:
source_filename = "soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params" = type { float, i32, i32, i32, i32, float, float, float }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant i64 -9188470239253725184, align 8

; Function Attrs: convergent nounwind
define void @"soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant"(%"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._texture_2d_t addrspace(1)* %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5) local_unnamed_addr #0 {
  %7 = extractelement <2 x i32> %1, i64 0
  %8 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params" addrspace(2)* %0, i64 0, i32 1
  %9 = load i32, i32 addrspace(2)* %8, align 4, !tbaa !25, !alias.scope !31, !noalias !34
  %10 = add i32 %9, %7
  %11 = extractelement <2 x i32> %1, i64 1
  %12 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params" addrspace(2)* %0, i64 0, i32 2
  %13 = load i32, i32 addrspace(2)* %12, align 4, !tbaa !36, !alias.scope !31, !noalias !34
  %14 = add i32 %13, %11
  %15 = insertelement <2 x i32> undef, i32 %10, i64 0
  %16 = insertelement <2 x i32> %15, i32 %14, i64 1
  %17 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params" addrspace(2)* %0, i64 0, i32 3
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !37, !alias.scope !31, !noalias !34
  %19 = icmp ult i32 %10, %18
  br i1 %19, label %20, label %56

20:                                               ; preds = %6
  %21 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params" addrspace(2)* %0, i64 0, i32 4
  %22 = load i32, i32 addrspace(2)* %21, align 4, !tbaa !38, !alias.scope !31, !noalias !34
  %23 = icmp ult i32 %14, %22
  br i1 %23, label %24, label %56

24:                                               ; preds = %20
  %25 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %16) #4
  %26 = fadd <2 x float> %25, <float 5.000000e-01, float 5.000000e-01>
  %27 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %26, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %28 = extractvalue { <4 x float>, i8 } %27, 0
  %29 = extractelement <4 x float> %28, i64 0
  %30 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %26, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %31 = extractvalue { <4 x float>, i8 } %30, 0
  %32 = extractelement <4 x float> %31, i64 0
  %33 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %26, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %34 = extractvalue { <4 x float>, i8 } %33, 0
  %35 = extractelement <4 x float> %34, i64 0
  %36 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params" addrspace(2)* %0, i64 0, i32 5
  %37 = load float, float addrspace(2)* %36, align 4, !tbaa !39, !alias.scope !31, !noalias !34
  %38 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params" addrspace(2)* %0, i64 0, i32 6
  %39 = load float, float addrspace(2)* %38, align 4, !tbaa !40, !alias.scope !31, !noalias !34
  %40 = fmul float %32, %39
  %41 = tail call float @llvm.fmuladd.f32(float %29, float %37, float %40)
  %42 = fadd float %35, %41
  %43 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params" addrspace(2)* %0, i64 0, i32 7
  %44 = load float, float addrspace(2)* %43, align 4, !tbaa !41, !alias.scope !31, !noalias !34
  %45 = fadd float %44, %42
  %46 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params" addrspace(2)* %0, i64 0, i32 0
  %47 = load float, float addrspace(2)* %46, align 4, !tbaa !42, !alias.scope !31, !noalias !34
  %48 = fmul float %47, %45
  %49 = fmul float %48, %48
  %50 = fcmp ogt float %49, 1.000000e+00
  %51 = fsub float 1.000000e+00, %49
  %52 = select i1 %50, float 0.000000e+00, float %51
  %53 = fmul float %52, %52
  %54 = insertelement <4 x float> undef, float %53, i64 0
  %55 = shufflevector <4 x float> %54, <4 x float> undef, <4 x i32> zeroinitializer
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %16, <4 x float> %55, i32 0, i32 2) #1, !alias.scope !34, !noalias !31
  br label %56

56:                                               ; preds = %24, %20, %6
  ret void
}

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #1

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare float @llvm.fmuladd.f32(float, float, float) #2

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32>) local_unnamed_addr #4

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
!air.sampler_states = !{!24}

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
!14 = !{void (%"struct.soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params" addrspace(2)*, <2 x i32>, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"float", !"m_inv", i32 4, i32 4, i32 0, !"uint", !"m_x0", i32 8, i32 4, i32 0, !"uint", !"m_y0", i32 12, i32 4, i32 0, !"uint", !"m_x1", i32 16, i32 4, i32 0, !"uint", !"m_y1", i32 20, i32 4, i32 0, !"float", !"m_coe0", i32 24, i32 4, i32 0, !"float", !"m_coe1", i32 28, i32 4, i32 0, !"float", !"m_coe12"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!20 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"pigx"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"pigy"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"pigt"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"weights"}
!24 = !{!"air.sampler_state", i64 addrspace(2)* @__air_sampler_state}
!25 = !{!26, !30, i64 4}
!26 = !{!"_ZTSN20soMOMotionEstimation49soMOMotionEstimation_updateWeightsConstant_paramsE", !27, i64 0, !30, i64 4, !30, i64 8, !30, i64 12, !30, i64 16, !27, i64 20, !27, i64 24, !27, i64 28}
!27 = !{!"float", !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{!"int", !28, i64 0}
!31 = !{!32}
!32 = distinct !{!32, !33, !"air-alias-scope-arg(0)"}
!33 = distinct !{!33, !"air-alias-scopes(soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant)"}
!34 = !{!35}
!35 = distinct !{!35, !33, !"air-alias-scope-textures"}
!36 = !{!26, !30, i64 8}
!37 = !{!26, !30, i64 12}
!38 = !{!26, !30, i64 16}
!39 = !{!26, !27, i64 20}
!40 = !{!26, !27, i64 24}
!41 = !{!26, !27, i64 28}
!42 = !{!26, !27, i64 0}

