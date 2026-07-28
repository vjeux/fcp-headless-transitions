0x00000000093e4d -- soGuidedFilter::soGuidedFilter_I1p3_Pass1_I:
source_filename = "soGuidedFilter::soGuidedFilter_I1p3_Pass1_I"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" = type { <4 x i32>, float, i32, [8 x i8] }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_I1p3_Pass1_I"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4) local_unnamed_addr #0 {
  %6 = shufflevector <2 x i32> %1, <2 x i32> undef, <2 x i32> <i32 1, i32 0>
  %7 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 0
  %8 = load <4 x i32>, <4 x i32> addrspace(2)* %7, align 16, !alias.scope !23, !noalias !26
  %9 = shufflevector <4 x i32> %8, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %10 = add <2 x i32> %9, %6
  %11 = extractelement <2 x i32> %1, i64 0
  %12 = extractelement <4 x i32> %8, i64 3
  %13 = extractelement <4 x i32> %8, i64 1
  %14 = sub nsw i32 %12, %13
  %15 = icmp ult i32 %11, %14
  br i1 %15, label %16, label %93

16:                                               ; preds = %5
  %17 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %10) #4
  %18 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 2
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !29, !alias.scope !23, !noalias !26
  %20 = tail call float @air.convert.f.f32.s.i32(i32 %19) #4
  %21 = insertelement <2 x float> <float undef, float 0.000000e+00>, float %20, i64 0
  %22 = fsub <2 x float> %17, %21
  %23 = shl nsw i32 %19, 1
  %24 = or i32 %23, 1
  %25 = icmp sgt i32 %24, 0
  br i1 %25, label %26, label %31

26:                                               ; preds = %16
  %27 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 1
  %28 = load float, float addrspace(2)* %27, align 16, !tbaa !35, !alias.scope !23, !noalias !26
  %29 = insertelement <2 x float> undef, float %28, i64 0
  %30 = shufflevector <2 x float> %29, <2 x float> undef, <2 x i32> zeroinitializer
  br label %44

31:                                               ; preds = %44, %16
  %32 = phi float [ 0.000000e+00, %16 ], [ %54, %44 ]
  %33 = phi float [ 0.000000e+00, %16 ], [ %53, %44 ]
  %34 = phi <2 x float> [ %22, %16 ], [ %57, %44 ]
  %35 = extractelement <4 x i32> %8, i64 2
  %36 = extractelement <4 x i32> %8, i64 0
  %37 = sub i32 %35, %36
  %38 = icmp sgt i32 %37, 0
  br i1 %38, label %39, label %93

39:                                               ; preds = %31
  %40 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 1
  %41 = load float, float addrspace(2)* %40, align 16, !tbaa !35, !alias.scope !23, !noalias !26
  %42 = insertelement <2 x float> undef, float %41, i64 0
  %43 = shufflevector <2 x float> %42, <2 x float> undef, <2 x i32> zeroinitializer
  br label %60

44:                                               ; preds = %44, %26
  %45 = phi <2 x float> [ %22, %26 ], [ %57, %44 ]
  %46 = phi float [ 0.000000e+00, %26 ], [ %53, %44 ]
  %47 = phi float [ 0.000000e+00, %26 ], [ %54, %44 ]
  %48 = phi i32 [ 0, %26 ], [ %58, %44 ]
  %49 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %30, <2 x float> %45, <2 x float> <float 5.000000e-01, float 5.000000e-01>)
  %50 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %49, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !26, !noalias !23
  %51 = extractvalue { <4 x float>, i8 } %50, 0
  %52 = extractelement <4 x float> %51, i64 0
  %53 = fadd float %46, %52
  %54 = tail call float @llvm.fmuladd.f32(float %52, float %52, float %47)
  %55 = extractelement <2 x float> %45, i64 0
  %56 = fadd float %55, 1.000000e+00
  %57 = insertelement <2 x float> %45, float %56, i64 0
  %58 = add nuw nsw i32 %48, 1
  %59 = icmp eq i32 %58, %24
  br i1 %59, label %31, label %44, !llvm.loop !36

60:                                               ; preds = %60, %39
  %61 = phi <2 x float> [ %34, %39 ], [ %84, %60 ]
  %62 = phi <2 x float> [ %22, %39 ], [ %87, %60 ]
  %63 = phi <2 x i32> [ %10, %39 ], [ %90, %60 ]
  %64 = phi float [ %33, %39 ], [ %79, %60 ]
  %65 = phi float [ %32, %39 ], [ %81, %60 ]
  %66 = phi i32 [ 0, %39 ], [ %91, %60 ]
  %67 = insertelement <4 x float> <float undef, float undef, float 0.000000e+00, float 0.000000e+00>, float %64, i64 0
  %68 = insertelement <4 x float> %67, float %65, i64 1
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %63, <4 x float> %68, i32 0, i32 2) #3, !alias.scope !38, !noalias !39
  %69 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %43, <2 x float> %61, <2 x float> <float 5.000000e-01, float 5.000000e-01>)
  %70 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %69, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !26, !noalias !23
  %71 = extractvalue { <4 x float>, i8 } %70, 0
  %72 = extractelement <4 x float> %71, i64 0
  %73 = fadd float %64, %72
  %74 = tail call float @llvm.fmuladd.f32(float %72, float %72, float %65)
  %75 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %43, <2 x float> %62, <2 x float> <float 5.000000e-01, float 5.000000e-01>)
  %76 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %75, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !26, !noalias !23
  %77 = extractvalue { <4 x float>, i8 } %76, 0
  %78 = extractelement <4 x float> %77, i64 0
  %79 = fsub float %73, %78
  %80 = fsub float -0.000000e+00, %78
  %81 = tail call float @llvm.fmuladd.f32(float %80, float %78, float %74)
  %82 = extractelement <2 x float> %61, i64 0
  %83 = fadd float %82, 1.000000e+00
  %84 = insertelement <2 x float> %61, float %83, i64 0
  %85 = extractelement <2 x float> %62, i64 0
  %86 = fadd float %85, 1.000000e+00
  %87 = insertelement <2 x float> %62, float %86, i64 0
  %88 = extractelement <2 x i32> %63, i64 0
  %89 = add i32 %88, 1
  %90 = insertelement <2 x i32> %63, i32 %89, i64 0
  %91 = add nuw nsw i32 %66, 1
  %92 = icmp eq i32 %91, %37
  br i1 %92, label %93, label %60, !llvm.loop !40

93:                                               ; preds = %60, %31, %5
  ret void
}

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare float @llvm.fmuladd.f32(float, float, float) #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <2 x float> @llvm.fmuladd.v2f32(<2 x float>, <2 x float>, <2 x float>) #1

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32>) local_unnamed_addr #4

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { nocallback nofree nosync nounwind readnone speculatable willreturn }
attributes #2 = { argmemonly convergent nounwind readonly }
attributes #3 = { argmemonly nounwind }
attributes #4 = { nounwind readnone }

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
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_I1p3_Pass1_I", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_I1p3_Pass1_I_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"float", !"m_scaleDownsample", i32 20, i32 4, i32 0, !"int", !"m_radius"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_I"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_I_I_sq_mean_row"}
!23 = !{!24}
!24 = distinct !{!24, !25, !"air-alias-scope-arg(0)"}
!25 = distinct !{!25, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_I1p3_Pass1_I)"}
!26 = !{!27, !28}
!27 = distinct !{!27, !25, !"air-alias-scope-samplers"}
!28 = distinct !{!28, !25, !"air-alias-scope-textures"}
!29 = !{!30, !34, i64 20}
!30 = !{!"_ZTSN14soGuidedFilter34soGuidedFilter_I1p3_Pass1_I_paramsE", !31, i64 0, !33, i64 16, !34, i64 20}
!31 = !{!"omnipotent char", !32, i64 0}
!32 = !{!"Simple C++ TBAA"}
!33 = !{!"float", !31, i64 0}
!34 = !{!"int", !31, i64 0}
!35 = !{!30, !33, i64 16}
!36 = distinct !{!36, !37}
!37 = !{!"llvm.loop.mustprogress"}
!38 = !{!28}
!39 = !{!24, !27}
!40 = distinct !{!40, !37}

