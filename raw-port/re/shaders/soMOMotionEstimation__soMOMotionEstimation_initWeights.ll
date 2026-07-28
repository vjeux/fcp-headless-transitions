0x000000000da7ad -- soMOMotionEstimation::soMOMotionEstimation_initWeights:
source_filename = "soMOMotionEstimation::soMOMotionEstimation_initWeights"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params" = type { i32, i32, i32, i32, i32, float, i32 }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant i64 -9188470239253725184, align 8

; Function Attrs: convergent nounwind
define void @"soMOMotionEstimation::soMOMotionEstimation_initWeights"(%"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._texture_2d_t addrspace(1)* %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4) local_unnamed_addr #0 {
  %6 = extractelement <2 x i32> %1, i64 0
  %7 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params" addrspace(2)* %0, i64 0, i32 0
  %8 = load i32, i32 addrspace(2)* %7, align 4, !tbaa !24, !alias.scope !30, !noalias !33
  %9 = add i32 %8, %6
  %10 = extractelement <2 x i32> %1, i64 1
  %11 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params" addrspace(2)* %0, i64 0, i32 1
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !35, !alias.scope !30, !noalias !33
  %13 = add i32 %12, %10
  %14 = insertelement <2 x i32> undef, i32 %9, i64 0
  %15 = insertelement <2 x i32> %14, i32 %13, i64 1
  %16 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params" addrspace(2)* %0, i64 0, i32 2
  %17 = load i32, i32 addrspace(2)* %16, align 4, !tbaa !36, !alias.scope !30, !noalias !33
  %18 = icmp ult i32 %9, %17
  br i1 %18, label %19, label %60

19:                                               ; preds = %5
  %20 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params" addrspace(2)* %0, i64 0, i32 3
  %21 = load i32, i32 addrspace(2)* %20, align 4, !tbaa !37, !alias.scope !30, !noalias !33
  %22 = icmp ult i32 %13, %21
  br i1 %22, label %23, label %60

23:                                               ; preds = %19
  %24 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %15) #3
  %25 = fadd <2 x float> %24, <float 5.000000e-01, float 5.000000e-01>
  %26 = tail call { <4 x i32>, i8 } @air.sample_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %25, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2
  %27 = extractvalue { <4 x i32>, i8 } %26, 0
  %28 = extractelement <4 x i32> %27, i64 0
  %29 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params" addrspace(2)* %0, i64 0, i32 4
  %30 = load i32, i32 addrspace(2)* %29, align 4, !tbaa !38, !alias.scope !30, !noalias !33
  %31 = icmp eq i32 %30, 0
  br i1 %31, label %32, label %37

32:                                               ; preds = %23
  %33 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params" addrspace(2)* %0, i64 0, i32 6
  %34 = load i32, i32 addrspace(2)* %33, align 4, !tbaa !39, !alias.scope !30, !noalias !33
  %35 = icmp eq i32 %28, %34
  %36 = select i1 %35, float 1.000000e+00, float 0.000000e+00
  br label %37

37:                                               ; preds = %32, %23
  %38 = phi float [ 0.000000e+00, %23 ], [ %36, %32 ]
  %39 = icmp eq i32 %30, 1
  br i1 %39, label %40, label %56

40:                                               ; preds = %37
  %41 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params" addrspace(2)* %0, i64 0, i32 6
  %42 = load i32, i32 addrspace(2)* %41, align 4, !tbaa !39, !alias.scope !30, !noalias !33
  %43 = icmp eq i32 %28, %42
  br i1 %43, label %44, label %56

44:                                               ; preds = %40
  %45 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %25, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2
  %46 = extractvalue { <4 x float>, i8 } %45, 0
  %47 = extractelement <4 x float> %46, i64 0
  %48 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params" addrspace(2)* %0, i64 0, i32 5
  %49 = load float, float addrspace(2)* %48, align 4, !tbaa !40, !alias.scope !30, !noalias !33
  %50 = fmul float %49, %47
  %51 = fmul float %50, %50
  %52 = fcmp ogt float %51, 1.000000e+00
  %53 = fsub float 1.000000e+00, %51
  %54 = select i1 %52, float 0.000000e+00, float %53
  %55 = fmul float %54, %54
  br label %56

56:                                               ; preds = %44, %40, %37
  %57 = phi float [ %55, %44 ], [ %38, %40 ], [ %38, %37 ]
  %58 = insertelement <4 x float> undef, float %57, i64 0
  %59 = shufflevector <4 x float> %58, <4 x float> undef, <4 x i32> zeroinitializer
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %15, <4 x float> %59, i32 0, i32 2) #1, !alias.scope !33, !noalias !30
  br label %60

60:                                               ; preds = %56, %19, %5
  ret void
}

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x i32>, i8 } @air.sample_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32>) local_unnamed_addr #3

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
!air.sampler_states = !{!23}

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
!14 = !{void (%"struct.soMOMotionEstimation::soMOMotionEstimation_initWeights_params" addrspace(2)*, <2 x i32>, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soMOMotionEstimation::soMOMotionEstimation_initWeights", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 28, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soMOMotionEstimation::soMOMotionEstimation_initWeights_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"uint", !"m_x0", i32 4, i32 4, i32 0, !"uint", !"m_y0", i32 8, i32 4, i32 0, !"uint", !"m_x1", i32 12, i32 4, i32 0, !"uint", !"m_y1", i32 16, i32 4, i32 0, !"uint", !"m_compute", i32 20, i32 4, i32 0, !"float", !"m_invnorm", i32 24, i32 4, i32 0, !"uint", !"m_label"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!20 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<uint, sample>", !"air.arg_name", !"matte"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"pigt"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"weights"}
!23 = !{!"air.sampler_state", i64 addrspace(2)* @__air_sampler_state}
!24 = !{!25, !26, i64 0}
!25 = !{!"_ZTSN20soMOMotionEstimation39soMOMotionEstimation_initWeights_paramsE", !26, i64 0, !26, i64 4, !26, i64 8, !26, i64 12, !26, i64 16, !29, i64 20, !26, i64 24}
!26 = !{!"int", !27, i64 0}
!27 = !{!"omnipotent char", !28, i64 0}
!28 = !{!"Simple C++ TBAA"}
!29 = !{!"float", !27, i64 0}
!30 = !{!31}
!31 = distinct !{!31, !32, !"air-alias-scope-arg(0)"}
!32 = distinct !{!32, !"air-alias-scopes(soMOMotionEstimation::soMOMotionEstimation_initWeights)"}
!33 = !{!34}
!34 = distinct !{!34, !32, !"air-alias-scope-textures"}
!35 = !{!25, !26, i64 4}
!36 = !{!25, !26, i64 8}
!37 = !{!25, !26, i64 12}
!38 = !{!25, !26, i64 16}
!39 = !{!25, !26, i64 24}
!40 = !{!25, !29, i64 20}

