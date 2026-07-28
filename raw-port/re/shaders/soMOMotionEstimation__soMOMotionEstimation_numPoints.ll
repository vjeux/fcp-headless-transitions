0x000000000d53ed -- soMOMotionEstimation::soMOMotionEstimation_numPoints:
source_filename = "soMOMotionEstimation::soMOMotionEstimation_numPoints"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" = type { i32, i32, i32, i32, i32 }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant i64 -9188470239253725184, align 8

; Function Attrs: convergent nounwind
define void @"soMOMotionEstimation::soMOMotionEstimation_numPoints"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <2 x i32> %2, %struct._texture_2d_t addrspace(1)* %3, i32 addrspace(1)* nocapture "air-buffer-no-alias" %4, i32 addrspace(3)* nocapture "air-buffer-no-alias" %5) local_unnamed_addr #0 {
  %7 = extractelement <2 x i32> %2, i64 0
  %8 = extractelement <2 x i32> %1, i64 0
  %9 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 3
  %10 = load i32, i32 addrspace(2)* %9, align 4, !tbaa !25, !alias.scope !30, !noalias !33
  %11 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 4
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !37, !alias.scope !30, !noalias !33
  %13 = icmp slt i32 %10, %12
  br i1 %13, label %14, label %22

14:                                               ; preds = %6
  %15 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 1
  %16 = load i32, i32 addrspace(2)* %15, align 4, !tbaa !38, !alias.scope !30, !noalias !33
  %17 = add nsw i32 %16, %7
  %18 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 2
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !39, !alias.scope !30, !noalias !33
  %20 = icmp slt i32 %17, %19
  %21 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 0
  br label %29

22:                                               ; preds = %35, %6
  %23 = phi i32 [ 0, %6 ], [ %36, %35 ]
  %24 = sext i32 %7 to i64
  %25 = getelementptr inbounds i32, i32 addrspace(3)* %5, i64 %24
  store i32 %23, i32 addrspace(3)* %25, align 4, !tbaa !40, !alias.scope !41, !noalias !42
  tail call void @air.wg.barrier(i32 2, i32 1) #3
  %26 = icmp eq i32 %7, 0
  br i1 %26, label %27, label %65

27:                                               ; preds = %22
  %28 = icmp sgt i32 %8, 1
  br i1 %28, label %56, label %54

29:                                               ; preds = %35, %14
  %30 = phi i32 [ 0, %14 ], [ %36, %35 ]
  %31 = phi i32 [ %10, %14 ], [ %37, %35 ]
  br i1 %20, label %32, label %35

32:                                               ; preds = %29
  %33 = tail call float @air.convert.f.f32.s.i32(i32 %31) #2
  %34 = load i32, i32 addrspace(2)* %21, align 4, !tbaa !43, !alias.scope !30, !noalias !33
  br label %39

35:                                               ; preds = %39, %29
  %36 = phi i32 [ %30, %29 ], [ %51, %39 ]
  %37 = add nsw i32 %31, 1
  %38 = icmp eq i32 %37, %12
  br i1 %38, label %22, label %29, !llvm.loop !44

39:                                               ; preds = %39, %32
  %40 = phi i32 [ %30, %32 ], [ %51, %39 ]
  %41 = phi i32 [ %17, %32 ], [ %52, %39 ]
  %42 = tail call float @air.convert.f.f32.s.i32(i32 %41) #2
  %43 = insertelement <2 x float> undef, float %42, i64 0
  %44 = insertelement <2 x float> %43, float %33, i64 1
  %45 = fadd <2 x float> %44, <float 5.000000e-01, float 5.000000e-01>
  %46 = tail call { <4 x i32>, i8 } @air.sample_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %45, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %47 = extractvalue { <4 x i32>, i8 } %46, 0
  %48 = extractelement <4 x i32> %47, i64 0
  %49 = icmp eq i32 %48, %34
  %50 = zext i1 %49 to i32
  %51 = add nsw i32 %40, %50
  %52 = add nsw i32 %41, %8
  %53 = icmp slt i32 %52, %19
  br i1 %53, label %39, label %35, !llvm.loop !46

54:                                               ; preds = %56, %27
  %55 = phi i32 [ %23, %27 ], [ %62, %56 ]
  store i32 %55, i32 addrspace(1)* %4, align 4, !tbaa !40, !alias.scope !47, !noalias !48
  br label %65

56:                                               ; preds = %56, %27
  %57 = phi i32 [ %63, %56 ], [ 1, %27 ]
  %58 = phi i32 [ %62, %56 ], [ %23, %27 ]
  %59 = zext i32 %57 to i64
  %60 = getelementptr inbounds i32, i32 addrspace(3)* %5, i64 %59
  %61 = load i32, i32 addrspace(3)* %60, align 4, !tbaa !40, !alias.scope !41, !noalias !42
  %62 = add nsw i32 %61, %58
  %63 = add nuw nsw i32 %57, 1
  %64 = icmp eq i32 %63, %8
  br i1 %64, label %54, label %56, !llvm.loop !49

65:                                               ; preds = %54, %22
  ret void
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x i32>, i8 } @air.sample_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #2

; Function Attrs: convergent nounwind
declare void @air.wg.barrier(i32, i32) local_unnamed_addr #3

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { nounwind readnone }
attributes #3 = { convergent nounwind }

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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)*, <2 x i32>, <2 x i32>, %struct._texture_2d_t addrspace(1)*, i32 addrspace(1)*, i32 addrspace(3)*)* @"soMOMotionEstimation::soMOMotionEstimation_numPoints", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 20, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soMOMotionEstimation::soMOMotionEstimation_numPoints_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"uint", !"m_label", i32 4, i32 4, i32 0, !"int", !"m_x_1", i32 8, i32 4, i32 0, !"int", !"m_x_2", i32 12, i32 4, i32 0, !"int", !"m_y_1", i32 16, i32 4, i32 0, !"int", !"m_y_2"}
!19 = !{i32 1, !"air.threads_per_threadgroup", !"air.arg_type_name", !"uint2", !"air.arg_name", !"gSize_"}
!20 = !{i32 2, !"air.thread_position_in_threadgroup", !"air.arg_type_name", !"uint2", !"air.arg_name", !"lid_"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<uint, sample>", !"air.arg_name", !"_pval"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"int", !"air.arg_name", !"sum_global"}
!23 = !{i32 5, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"int", !"air.arg_name", !"local_mem"}
!24 = !{!"air.sampler_state", i64 addrspace(2)* @__air_sampler_state}
!25 = !{!26, !27, i64 12}
!26 = !{!"_ZTSN20soMOMotionEstimation37soMOMotionEstimation_numPoints_paramsE", !27, i64 0, !27, i64 4, !27, i64 8, !27, i64 12, !27, i64 16}
!27 = !{!"int", !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{!31}
!31 = distinct !{!31, !32, !"air-alias-scope-arg(0)"}
!32 = distinct !{!32, !"air-alias-scopes(soMOMotionEstimation::soMOMotionEstimation_numPoints)"}
!33 = !{!34, !35, !36}
!34 = distinct !{!34, !32, !"air-alias-scope-textures"}
!35 = distinct !{!35, !32, !"air-alias-scope-arg(4)"}
!36 = distinct !{!36, !32, !"air-alias-scope-arg(5)"}
!37 = !{!26, !27, i64 16}
!38 = !{!26, !27, i64 4}
!39 = !{!26, !27, i64 8}
!40 = !{!27, !27, i64 0}
!41 = !{!36}
!42 = !{!31, !34, !35}
!43 = !{!26, !27, i64 0}
!44 = distinct !{!44, !45}
!45 = !{!"llvm.loop.mustprogress"}
!46 = distinct !{!46, !45}
!47 = !{!35}
!48 = !{!31, !34, !36}
!49 = distinct !{!49, !45}

