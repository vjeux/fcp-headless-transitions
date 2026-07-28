0x00000000098f7d -- soGuidedFilter::soGuidedFilter_I1p3_Pass2_I_stats:
source_filename = "soGuidedFilter::soGuidedFilter_I1p3_Pass2_I_stats"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" = type { <4 x i32>, i32, i32, float }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_I1p3_Pass2_I_stats"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5, %struct._texture_2d_t addrspace(1)* %6, %struct._texture_2d_t addrspace(1)* %7) local_unnamed_addr #0 {
  %9 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 0
  %10 = load <4 x i32>, <4 x i32> addrspace(2)* %9, align 16, !alias.scope !26, !noalias !29
  %11 = shufflevector <4 x i32> %10, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %12 = add <2 x i32> %11, %1
  %13 = extractelement <2 x i32> %12, i64 0
  %14 = extractelement <4 x i32> %10, i64 2
  %15 = extractelement <4 x i32> %10, i64 0
  %16 = sub nsw i32 %14, %15
  %17 = icmp ult i32 %13, %16
  br i1 %17, label %18, label %107

18:                                               ; preds = %8
  %19 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %12) #4
  %20 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 1
  %21 = load i32, i32 addrspace(2)* %20, align 16, !tbaa !32, !alias.scope !26, !noalias !29
  %22 = tail call float @air.convert.f.f32.s.i32(i32 %21) #4
  %23 = insertelement <2 x float> <float 0.000000e+00, float undef>, float %22, i64 1
  %24 = fsub <2 x float> %19, %23
  %25 = fadd <2 x float> %24, <float 5.000000e-01, float 5.000000e-01>
  %26 = shl nsw i32 %21, 1
  %27 = or i32 %26, 1
  %28 = icmp sgt i32 %27, 0
  br i1 %28, label %45, label %29

29:                                               ; preds = %45, %18
  %30 = phi <4 x float> [ zeroinitializer, %18 ], [ %55, %45 ]
  %31 = phi <4 x float> [ zeroinitializer, %18 ], [ %52, %45 ]
  %32 = phi <2 x float> [ %25, %18 ], [ %58, %45 ]
  %33 = extractelement <4 x i32> %10, i64 3
  %34 = extractelement <4 x i32> %10, i64 1
  %35 = sub i32 %33, %34
  %36 = icmp sgt i32 %35, 0
  br i1 %36, label %37, label %107

37:                                               ; preds = %29
  %38 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 2
  %39 = load i32, i32 addrspace(2)* %38, align 4, !tbaa !38, !alias.scope !26, !noalias !29
  %40 = tail call float @air.convert.f.f32.s.i32(i32 %39) #4
  %41 = insertelement <4 x float> undef, float %40, i64 0
  %42 = shufflevector <4 x float> %41, <4 x float> undef, <4 x i32> zeroinitializer
  %43 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 3
  %44 = load float, float addrspace(2)* %43, align 8, !tbaa !39, !alias.scope !26, !noalias !29
  br label %61

45:                                               ; preds = %45, %18
  %46 = phi <2 x float> [ %58, %45 ], [ %25, %18 ]
  %47 = phi <4 x float> [ %52, %45 ], [ zeroinitializer, %18 ]
  %48 = phi <4 x float> [ %55, %45 ], [ zeroinitializer, %18 ]
  %49 = phi i32 [ %59, %45 ], [ 0, %18 ]
  %50 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %46, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !29, !noalias !26
  %51 = extractvalue { <4 x float>, i8 } %50, 0
  %52 = fadd <4 x float> %47, %51
  %53 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %46, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !29, !noalias !26
  %54 = extractvalue { <4 x float>, i8 } %53, 0
  %55 = fadd <4 x float> %48, %54
  %56 = extractelement <2 x float> %46, i64 1
  %57 = fadd float %56, 1.000000e+00
  %58 = insertelement <2 x float> %46, float %57, i64 1
  %59 = add nuw nsw i32 %49, 1
  %60 = icmp eq i32 %59, %27
  br i1 %60, label %29, label %45, !llvm.loop !40

61:                                               ; preds = %61, %37
  %62 = phi <2 x float> [ %32, %37 ], [ %98, %61 ]
  %63 = phi <2 x float> [ %25, %37 ], [ %101, %61 ]
  %64 = phi <2 x i32> [ %12, %37 ], [ %104, %61 ]
  %65 = phi <4 x float> [ %31, %37 ], [ %92, %61 ]
  %66 = phi <4 x float> [ %30, %37 ], [ %95, %61 ]
  %67 = phi i32 [ 0, %37 ], [ %105, %61 ]
  %68 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %64) #4
  %69 = fadd <2 x float> %68, <float 5.000000e-01, float 5.000000e-01>
  %70 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %69, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !29, !noalias !26
  %71 = extractvalue { <4 x float>, i8 } %70, 0
  %72 = extractelement <4 x float> %71, i64 1
  %73 = fdiv <4 x float> %65, %42
  %74 = fdiv <4 x float> %66, %42
  %75 = shufflevector <4 x float> %71, <4 x float> undef, <4 x i32> zeroinitializer
  %76 = fsub <4 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %75
  %77 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %76, <4 x float> %73, <4 x float> %74)
  %78 = fadd float %44, %72
  %79 = insertelement <4 x float> undef, float %78, i64 0
  %80 = shufflevector <4 x float> %79, <4 x float> undef, <4 x i32> zeroinitializer
  %81 = fdiv <4 x float> %77, %80
  %82 = fsub <4 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %81
  %83 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %82, <4 x float> %75, <4 x float> %73)
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %6, <2 x i32> %64, <4 x float> %81, i32 0, i32 2) #2, !alias.scope !42, !noalias !43
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %7, <2 x i32> %64, <4 x float> %83, i32 0, i32 2) #2, !alias.scope !42, !noalias !43
  %84 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %62, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !29, !noalias !26
  %85 = extractvalue { <4 x float>, i8 } %84, 0
  %86 = fadd <4 x float> %65, %85
  %87 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %62, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !29, !noalias !26
  %88 = extractvalue { <4 x float>, i8 } %87, 0
  %89 = fadd <4 x float> %66, %88
  %90 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %63, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !29, !noalias !26
  %91 = extractvalue { <4 x float>, i8 } %90, 0
  %92 = fsub <4 x float> %86, %91
  %93 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %63, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !29, !noalias !26
  %94 = extractvalue { <4 x float>, i8 } %93, 0
  %95 = fsub <4 x float> %89, %94
  %96 = extractelement <2 x float> %62, i64 1
  %97 = fadd float %96, 1.000000e+00
  %98 = insertelement <2 x float> %62, float %97, i64 1
  %99 = extractelement <2 x float> %63, i64 1
  %100 = fadd float %99, 1.000000e+00
  %101 = insertelement <2 x float> %63, float %100, i64 1
  %102 = extractelement <2 x i32> %64, i64 1
  %103 = add i32 %102, 1
  %104 = insertelement <2 x i32> %64, i32 %103, i64 1
  %105 = add nuw nsw i32 %67, 1
  %106 = icmp eq i32 %105, %35
  br i1 %106, label %107, label %61, !llvm.loop !44

107:                                              ; preds = %61, %29, %8
  ret void
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #2

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <4 x float> @llvm.fmuladd.v4f32(<4 x float>, <4 x float>, <4 x float>) #3

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32>) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #4

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { argmemonly nounwind }
attributes #3 = { nocallback nofree nosync nounwind readnone speculatable willreturn }
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
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_I1p3_Pass2_I_stats", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24, !25}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_I1p3_Pass2_I_stats_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"int", !"m_radius", i32 20, i32 4, i32 0, !"int", !"m_numPixelsInRect", i32 24, i32 4, i32 0, !"float", !"m_epsilon"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_p_mean_row"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_Ip_mean_row"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_I_stats"}
!24 = !{i32 6, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_a"}
!25 = !{i32 7, !"air.texture", !"air.location_index", i32 4, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_b"}
!26 = !{!27}
!27 = distinct !{!27, !28, !"air-alias-scope-arg(0)"}
!28 = distinct !{!28, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_I1p3_Pass2_I_stats)"}
!29 = !{!30, !31}
!30 = distinct !{!30, !28, !"air-alias-scope-samplers"}
!31 = distinct !{!31, !28, !"air-alias-scope-textures"}
!32 = !{!33, !36, i64 16}
!33 = !{!"_ZTSN14soGuidedFilter40soGuidedFilter_I1p3_Pass2_I_stats_paramsE", !34, i64 0, !36, i64 16, !36, i64 20, !37, i64 24}
!34 = !{!"omnipotent char", !35, i64 0}
!35 = !{!"Simple C++ TBAA"}
!36 = !{!"int", !34, i64 0}
!37 = !{!"float", !34, i64 0}
!38 = !{!33, !36, i64 20}
!39 = !{!33, !37, i64 24}
!40 = distinct !{!40, !41}
!41 = !{!"llvm.loop.mustprogress"}
!42 = !{!31}
!43 = !{!27, !30}
!44 = distinct !{!44, !41}

