0x0000000008b44d -- soGuidedFilter::soGuidedFilter_I1p1_Pass1:
source_filename = "soGuidedFilter::soGuidedFilter_I1p1_Pass1"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" = type { <4 x i32>, float, i32, [8 x i8] }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_I1p1_Pass1"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5) local_unnamed_addr #0 {
  %7 = shufflevector <2 x i32> %1, <2 x i32> undef, <2 x i32> <i32 1, i32 0>
  %8 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 0
  %9 = load <4 x i32>, <4 x i32> addrspace(2)* %8, align 16, !alias.scope !24, !noalias !27
  %10 = shufflevector <4 x i32> %9, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %11 = add <2 x i32> %10, %7
  %12 = extractelement <2 x i32> %1, i64 0
  %13 = extractelement <4 x i32> %9, i64 3
  %14 = extractelement <4 x i32> %9, i64 1
  %15 = sub nsw i32 %13, %14
  %16 = icmp ult i32 %12, %15
  br i1 %16, label %17, label %120

17:                                               ; preds = %6
  %18 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %11) #4
  %19 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 2
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !30, !alias.scope !24, !noalias !27
  %21 = tail call float @air.convert.f.f32.s.i32(i32 %20) #4
  %22 = insertelement <2 x float> <float undef, float 0.000000e+00>, float %21, i64 0
  %23 = fsub <2 x float> %18, %22
  %24 = shl nsw i32 %20, 1
  %25 = or i32 %24, 1
  %26 = icmp sgt i32 %25, 0
  br i1 %26, label %27, label %32

27:                                               ; preds = %17
  %28 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 1
  %29 = load float, float addrspace(2)* %28, align 16, !tbaa !36, !alias.scope !24, !noalias !27
  %30 = insertelement <2 x float> undef, float %29, i64 0
  %31 = shufflevector <2 x float> %30, <2 x float> undef, <2 x i32> zeroinitializer
  br label %44

32:                                               ; preds = %44, %17
  %33 = phi <4 x float> [ zeroinitializer, %17 ], [ %66, %44 ]
  %34 = phi <2 x float> [ %23, %17 ], [ %69, %44 ]
  %35 = extractelement <4 x i32> %9, i64 2
  %36 = extractelement <4 x i32> %9, i64 0
  %37 = sub i32 %35, %36
  %38 = icmp sgt i32 %37, 0
  br i1 %38, label %39, label %120

39:                                               ; preds = %32
  %40 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)* %0, i64 0, i32 1
  %41 = load float, float addrspace(2)* %40, align 16, !tbaa !36, !alias.scope !24, !noalias !27
  %42 = insertelement <2 x float> undef, float %41, i64 0
  %43 = shufflevector <2 x float> %42, <2 x float> undef, <2 x i32> zeroinitializer
  br label %72

44:                                               ; preds = %44, %27
  %45 = phi <2 x float> [ %23, %27 ], [ %69, %44 ]
  %46 = phi <4 x float> [ zeroinitializer, %27 ], [ %66, %44 ]
  %47 = phi i32 [ 0, %27 ], [ %70, %44 ]
  %48 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %31, <2 x float> %45, <2 x float> <float 5.000000e-01, float 5.000000e-01>)
  %49 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %48, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !27, !noalias !24
  %50 = extractvalue { <4 x float>, i8 } %49, 0
  %51 = extractelement <4 x float> %50, i64 0
  %52 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %48, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !27, !noalias !24
  %53 = extractvalue { <4 x float>, i8 } %52, 0
  %54 = extractelement <4 x float> %53, i64 0
  %55 = extractelement <4 x float> %46, i64 0
  %56 = fadd float %55, %51
  %57 = insertelement <4 x float> undef, float %56, i64 0
  %58 = extractelement <4 x float> %46, i64 1
  %59 = fadd float %58, %54
  %60 = insertelement <4 x float> %57, float %59, i64 1
  %61 = extractelement <4 x float> %46, i64 2
  %62 = tail call float @llvm.fmuladd.f32(float %54, float %51, float %61)
  %63 = insertelement <4 x float> %60, float %62, i64 2
  %64 = extractelement <4 x float> %46, i64 3
  %65 = tail call float @llvm.fmuladd.f32(float %54, float %54, float %64)
  %66 = insertelement <4 x float> %63, float %65, i64 3
  %67 = extractelement <2 x float> %45, i64 0
  %68 = fadd float %67, 1.000000e+00
  %69 = insertelement <2 x float> %45, float %68, i64 0
  %70 = add nuw nsw i32 %47, 1
  %71 = icmp eq i32 %70, %25
  br i1 %71, label %32, label %44, !llvm.loop !37

72:                                               ; preds = %72, %39
  %73 = phi <2 x float> [ %34, %39 ], [ %111, %72 ]
  %74 = phi <2 x float> [ %23, %39 ], [ %114, %72 ]
  %75 = phi <2 x i32> [ %11, %39 ], [ %117, %72 ]
  %76 = phi <4 x float> [ %33, %39 ], [ %108, %72 ]
  %77 = phi i32 [ 0, %39 ], [ %118, %72 ]
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %75, <4 x float> %76, i32 0, i32 2) #3, !alias.scope !39, !noalias !40
  %78 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %43, <2 x float> %73, <2 x float> <float 5.000000e-01, float 5.000000e-01>)
  %79 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %78, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !27, !noalias !24
  %80 = extractvalue { <4 x float>, i8 } %79, 0
  %81 = extractelement <4 x float> %80, i64 0
  %82 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %78, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !27, !noalias !24
  %83 = extractvalue { <4 x float>, i8 } %82, 0
  %84 = extractelement <4 x float> %83, i64 0
  %85 = extractelement <4 x float> %76, i64 0
  %86 = fadd float %85, %81
  %87 = extractelement <4 x float> %76, i64 1
  %88 = fadd float %87, %84
  %89 = extractelement <4 x float> %76, i64 2
  %90 = tail call float @llvm.fmuladd.f32(float %84, float %81, float %89)
  %91 = extractelement <4 x float> %76, i64 3
  %92 = tail call float @llvm.fmuladd.f32(float %84, float %84, float %91)
  %93 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %43, <2 x float> %74, <2 x float> <float 5.000000e-01, float 5.000000e-01>)
  %94 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %93, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !27, !noalias !24
  %95 = extractvalue { <4 x float>, i8 } %94, 0
  %96 = extractelement <4 x float> %95, i64 0
  %97 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %93, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !27, !noalias !24
  %98 = extractvalue { <4 x float>, i8 } %97, 0
  %99 = extractelement <4 x float> %98, i64 0
  %100 = fsub float %86, %96
  %101 = insertelement <4 x float> undef, float %100, i64 0
  %102 = fsub float %88, %99
  %103 = insertelement <4 x float> %101, float %102, i64 1
  %104 = fsub float -0.000000e+00, %99
  %105 = tail call float @llvm.fmuladd.f32(float %104, float %96, float %90)
  %106 = insertelement <4 x float> %103, float %105, i64 2
  %107 = tail call float @llvm.fmuladd.f32(float %104, float %99, float %92)
  %108 = insertelement <4 x float> %106, float %107, i64 3
  %109 = extractelement <2 x float> %73, i64 0
  %110 = fadd float %109, 1.000000e+00
  %111 = insertelement <2 x float> %73, float %110, i64 0
  %112 = extractelement <2 x float> %74, i64 0
  %113 = fadd float %112, 1.000000e+00
  %114 = insertelement <2 x float> %74, float %113, i64 0
  %115 = extractelement <2 x i32> %75, i64 0
  %116 = add i32 %115, 1
  %117 = insertelement <2 x i32> %75, i32 %116, i64 0
  %118 = add nuw nsw i32 %77, 1
  %119 = icmp eq i32 %118, %37
  br i1 %119, label %120, label %72, !llvm.loop !41

120:                                              ; preds = %72, %32, %6
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
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass1_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_I1p1_Pass1", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_I1p1_Pass1_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"float", !"m_scaleDownsample", i32 20, i32 4, i32 0, !"int", !"m_radius"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_p"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_I"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_p_I_Ip_I_sq_mean_row"}
!24 = !{!25}
!25 = distinct !{!25, !26, !"air-alias-scope-arg(0)"}
!26 = distinct !{!26, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_I1p1_Pass1)"}
!27 = !{!28, !29}
!28 = distinct !{!28, !26, !"air-alias-scope-samplers"}
!29 = distinct !{!29, !26, !"air-alias-scope-textures"}
!30 = !{!31, !35, i64 20}
!31 = !{!"_ZTSN14soGuidedFilter32soGuidedFilter_I1p1_Pass1_paramsE", !32, i64 0, !34, i64 16, !35, i64 20}
!32 = !{!"omnipotent char", !33, i64 0}
!33 = !{!"Simple C++ TBAA"}
!34 = !{!"float", !32, i64 0}
!35 = !{!"int", !32, i64 0}
!36 = !{!31, !34, i64 16}
!37 = distinct !{!37, !38}
!38 = !{!"llvm.loop.mustprogress"}
!39 = !{!29}
!40 = !{!25, !28}
!41 = distinct !{!41, !38}

