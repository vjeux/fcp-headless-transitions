0x0000000009523d -- soGuidedFilter::soGuidedFilter_I1p3_Pass1_p_Ip:
source_filename = "soGuidedFilter::soGuidedFilter_I1p3_Pass1_p_Ip"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" = type { <4 x i32>, float, i32, [8 x i8] }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_I1p3_Pass1_p_Ip"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5, %struct._texture_2d_t addrspace(1)* %6) local_unnamed_addr #0 {
  %8 = shufflevector <2 x i32> %1, <2 x i32> undef, <2 x i32> <i32 1, i32 0>
  %9 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 0
  %10 = load <4 x i32>, <4 x i32> addrspace(2)* %9, align 16, !alias.scope !25, !noalias !28
  %11 = shufflevector <4 x i32> %10, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %12 = add <2 x i32> %11, %8
  %13 = extractelement <2 x i32> %1, i64 0
  %14 = extractelement <4 x i32> %10, i64 3
  %15 = extractelement <4 x i32> %10, i64 1
  %16 = sub nsw i32 %14, %15
  %17 = icmp ult i32 %13, %16
  br i1 %17, label %18, label %99

18:                                               ; preds = %7
  %19 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %12) #4
  %20 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 2
  %21 = load i32, i32 addrspace(2)* %20, align 4, !tbaa !31, !alias.scope !25, !noalias !28
  %22 = tail call float @air.convert.f.f32.s.i32(i32 %21) #4
  %23 = insertelement <2 x float> <float undef, float 0.000000e+00>, float %22, i64 0
  %24 = fsub <2 x float> %19, %23
  %25 = shl nsw i32 %21, 1
  %26 = or i32 %25, 1
  %27 = icmp sgt i32 %26, 0
  br i1 %27, label %28, label %33

28:                                               ; preds = %18
  %29 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 1
  %30 = load float, float addrspace(2)* %29, align 16, !tbaa !37, !alias.scope !25, !noalias !28
  %31 = insertelement <2 x float> undef, float %30, i64 0
  %32 = shufflevector <2 x float> %31, <2 x float> undef, <2 x i32> zeroinitializer
  br label %46

33:                                               ; preds = %46, %18
  %34 = phi <4 x float> [ zeroinitializer, %18 ], [ %58, %46 ]
  %35 = phi <4 x float> [ zeroinitializer, %18 ], [ %56, %46 ]
  %36 = phi <2 x float> [ %24, %18 ], [ %61, %46 ]
  %37 = extractelement <4 x i32> %10, i64 2
  %38 = extractelement <4 x i32> %10, i64 0
  %39 = sub i32 %37, %38
  %40 = icmp sgt i32 %39, 0
  br i1 %40, label %41, label %99

41:                                               ; preds = %33
  %42 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 1
  %43 = load float, float addrspace(2)* %42, align 16, !tbaa !37, !alias.scope !25, !noalias !28
  %44 = insertelement <2 x float> undef, float %43, i64 0
  %45 = shufflevector <2 x float> %44, <2 x float> undef, <2 x i32> zeroinitializer
  br label %64

46:                                               ; preds = %46, %28
  %47 = phi <2 x float> [ %24, %28 ], [ %61, %46 ]
  %48 = phi <4 x float> [ zeroinitializer, %28 ], [ %56, %46 ]
  %49 = phi <4 x float> [ zeroinitializer, %28 ], [ %58, %46 ]
  %50 = phi i32 [ 0, %28 ], [ %62, %46 ]
  %51 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %32, <2 x float> %47, <2 x float> <float 5.000000e-01, float 5.000000e-01>)
  %52 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %51, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !28, !noalias !25
  %53 = extractvalue { <4 x float>, i8 } %52, 0
  %54 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %51, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !28, !noalias !25
  %55 = extractvalue { <4 x float>, i8 } %54, 0
  %56 = fadd <4 x float> %48, %53
  %57 = shufflevector <4 x float> %55, <4 x float> undef, <4 x i32> zeroinitializer
  %58 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %57, <4 x float> %53, <4 x float> %49)
  %59 = extractelement <2 x float> %47, i64 0
  %60 = fadd float %59, 1.000000e+00
  %61 = insertelement <2 x float> %47, float %60, i64 0
  %62 = add nuw nsw i32 %50, 1
  %63 = icmp eq i32 %62, %26
  br i1 %63, label %33, label %46, !llvm.loop !38

64:                                               ; preds = %64, %41
  %65 = phi <2 x float> [ %36, %41 ], [ %90, %64 ]
  %66 = phi <2 x float> [ %24, %41 ], [ %93, %64 ]
  %67 = phi <2 x i32> [ %12, %41 ], [ %96, %64 ]
  %68 = phi <4 x float> [ %35, %41 ], [ %84, %64 ]
  %69 = phi <4 x float> [ %34, %41 ], [ %87, %64 ]
  %70 = phi i32 [ 0, %41 ], [ %97, %64 ]
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %67, <4 x float> %68, i32 0, i32 2) #3, !alias.scope !40, !noalias !41
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %6, <2 x i32> %67, <4 x float> %69, i32 0, i32 2) #3, !alias.scope !40, !noalias !41
  %71 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %45, <2 x float> %65, <2 x float> <float 5.000000e-01, float 5.000000e-01>)
  %72 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %71, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !28, !noalias !25
  %73 = extractvalue { <4 x float>, i8 } %72, 0
  %74 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %71, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !28, !noalias !25
  %75 = extractvalue { <4 x float>, i8 } %74, 0
  %76 = fadd <4 x float> %68, %73
  %77 = shufflevector <4 x float> %75, <4 x float> undef, <4 x i32> zeroinitializer
  %78 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %77, <4 x float> %73, <4 x float> %69)
  %79 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %45, <2 x float> %66, <2 x float> <float 5.000000e-01, float 5.000000e-01>)
  %80 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %79, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !28, !noalias !25
  %81 = extractvalue { <4 x float>, i8 } %80, 0
  %82 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %79, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !28, !noalias !25
  %83 = extractvalue { <4 x float>, i8 } %82, 0
  %84 = fsub <4 x float> %76, %81
  %85 = shufflevector <4 x float> %83, <4 x float> undef, <4 x i32> zeroinitializer
  %86 = fsub <4 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %85
  %87 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %86, <4 x float> %81, <4 x float> %78)
  %88 = extractelement <2 x float> %65, i64 0
  %89 = fadd float %88, 1.000000e+00
  %90 = insertelement <2 x float> %65, float %89, i64 0
  %91 = extractelement <2 x float> %66, i64 0
  %92 = fadd float %91, 1.000000e+00
  %93 = insertelement <2 x float> %66, float %92, i64 0
  %94 = extractelement <2 x i32> %67, i64 0
  %95 = add i32 %94, 1
  %96 = insertelement <2 x i32> %67, i32 %95, i64 0
  %97 = add nuw nsw i32 %70, 1
  %98 = icmp eq i32 %97, %39
  br i1 %98, label %99, label %64, !llvm.loop !42

99:                                               ; preds = %64, %33, %7
  ret void
}

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <4 x float> @llvm.fmuladd.v4f32(<4 x float>, <4 x float>, <4 x float>) #1

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
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_I1p3_Pass1_p_Ip", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_I1p3_Pass1_p_Ip_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"float", !"m_scaleDownsample", i32 20, i32 4, i32 0, !"int", !"m_radius"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_p"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_I"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_p_mean_row"}
!24 = !{i32 6, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_Ip_mean_row"}
!25 = !{!26}
!26 = distinct !{!26, !27, !"air-alias-scope-arg(0)"}
!27 = distinct !{!27, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_I1p3_Pass1_p_Ip)"}
!28 = !{!29, !30}
!29 = distinct !{!29, !27, !"air-alias-scope-samplers"}
!30 = distinct !{!30, !27, !"air-alias-scope-textures"}
!31 = !{!32, !36, i64 20}
!32 = !{!"_ZTSN14soGuidedFilter37soGuidedFilter_I1p3_Pass1_p_Ip_paramsE", !33, i64 0, !35, i64 16, !36, i64 20}
!33 = !{!"omnipotent char", !34, i64 0}
!34 = !{!"Simple C++ TBAA"}
!35 = !{!"float", !33, i64 0}
!36 = !{!"int", !33, i64 0}
!37 = !{!32, !35, i64 16}
!38 = distinct !{!38, !39}
!39 = !{!"llvm.loop.mustprogress"}
!40 = !{!30}
!41 = !{!26, !29}
!42 = distinct !{!42, !39}

