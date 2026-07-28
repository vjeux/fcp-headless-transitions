0x0000000009670d -- soGuidedFilter::soGuidedFilter_I1p3_Pass2:
source_filename = "soGuidedFilter::soGuidedFilter_I1p3_Pass2"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" = type { <4 x i32>, i32, i32, float }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_I1p3_Pass2"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5, %struct._texture_2d_t addrspace(1)* %6) local_unnamed_addr #0 {
  %8 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 0
  %9 = load <4 x i32>, <4 x i32> addrspace(2)* %8, align 16, !alias.scope !25, !noalias !28
  %10 = shufflevector <4 x i32> %9, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %11 = add <2 x i32> %10, %1
  %12 = extractelement <2 x i32> %11, i64 0
  %13 = extractelement <4 x i32> %9, i64 2
  %14 = extractelement <4 x i32> %9, i64 0
  %15 = sub nsw i32 %13, %14
  %16 = icmp ult i32 %12, %15
  br i1 %16, label %17, label %111

17:                                               ; preds = %7
  %18 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %11) #4
  %19 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 1
  %20 = load i32, i32 addrspace(2)* %19, align 16, !tbaa !31, !alias.scope !25, !noalias !28
  %21 = tail call float @air.convert.f.f32.s.i32(i32 %20) #4
  %22 = insertelement <2 x float> <float 0.000000e+00, float undef>, float %21, i64 1
  %23 = fsub <2 x float> %18, %22
  %24 = fadd <2 x float> %23, <float 5.000000e-01, float 5.000000e-01>
  %25 = shl nsw i32 %20, 1
  %26 = or i32 %25, 1
  %27 = icmp sgt i32 %26, 0
  br i1 %27, label %44, label %28

28:                                               ; preds = %44, %17
  %29 = phi <4 x float> [ zeroinitializer, %17 ], [ %54, %44 ]
  %30 = phi <4 x float> [ zeroinitializer, %17 ], [ %51, %44 ]
  %31 = phi <2 x float> [ %24, %17 ], [ %57, %44 ]
  %32 = extractelement <4 x i32> %9, i64 3
  %33 = extractelement <4 x i32> %9, i64 1
  %34 = sub i32 %32, %33
  %35 = icmp sgt i32 %34, 0
  br i1 %35, label %36, label %111

36:                                               ; preds = %28
  %37 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 2
  %38 = load i32, i32 addrspace(2)* %37, align 4, !tbaa !37, !alias.scope !25, !noalias !28
  %39 = tail call float @air.convert.f.f32.s.i32(i32 %38) #4
  %40 = insertelement <4 x float> undef, float %39, i64 0
  %41 = shufflevector <4 x float> %40, <4 x float> undef, <4 x i32> zeroinitializer
  %42 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 3
  %43 = load float, float addrspace(2)* %42, align 8, !tbaa !38, !alias.scope !25, !noalias !28
  br label %60

44:                                               ; preds = %44, %17
  %45 = phi <2 x float> [ %57, %44 ], [ %24, %17 ]
  %46 = phi <4 x float> [ %51, %44 ], [ zeroinitializer, %17 ]
  %47 = phi <4 x float> [ %54, %44 ], [ zeroinitializer, %17 ]
  %48 = phi i32 [ %58, %44 ], [ 0, %17 ]
  %49 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %45, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %50 = extractvalue { <4 x float>, i8 } %49, 0
  %51 = fadd <4 x float> %46, %50
  %52 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %45, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %53 = extractvalue { <4 x float>, i8 } %52, 0
  %54 = fadd <4 x float> %47, %53
  %55 = extractelement <2 x float> %45, i64 1
  %56 = fadd float %55, 1.000000e+00
  %57 = insertelement <2 x float> %45, float %56, i64 1
  %58 = add nuw nsw i32 %48, 1
  %59 = icmp eq i32 %58, %26
  br i1 %59, label %28, label %44, !llvm.loop !39

60:                                               ; preds = %60, %36
  %61 = phi <2 x float> [ %31, %36 ], [ %102, %60 ]
  %62 = phi <2 x float> [ %24, %36 ], [ %105, %60 ]
  %63 = phi <2 x i32> [ %11, %36 ], [ %108, %60 ]
  %64 = phi <4 x float> [ %30, %36 ], [ %96, %60 ]
  %65 = phi <4 x float> [ %29, %36 ], [ %99, %60 ]
  %66 = phi i32 [ 0, %36 ], [ %109, %60 ]
  %67 = fdiv <4 x float> %64, %41
  %68 = fdiv <4 x float> %65, %41
  %69 = extractelement <4 x float> %68, i64 3
  %70 = extractelement <4 x float> %67, i64 3
  %71 = fsub float -0.000000e+00, %70
  %72 = tail call float @llvm.fmuladd.f32(float %71, float %70, float %69)
  %73 = shufflevector <4 x float> %68, <4 x float> undef, <3 x i32> <i32 0, i32 1, i32 2>
  %74 = shufflevector <4 x float> %67, <4 x float> undef, <3 x i32> <i32 0, i32 1, i32 2>
  %75 = shufflevector <4 x float> %67, <4 x float> undef, <3 x i32> <i32 3, i32 3, i32 3>
  %76 = fsub <3 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %74
  %77 = tail call <3 x float> @llvm.fmuladd.v3f32(<3 x float> %76, <3 x float> %75, <3 x float> %73)
  %78 = fadd float %43, %72
  %79 = insertelement <3 x float> undef, float %78, i64 0
  %80 = shufflevector <3 x float> %79, <3 x float> undef, <3 x i32> zeroinitializer
  %81 = fdiv <3 x float> %77, %80
  %82 = shufflevector <3 x float> %81, <3 x float> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %83 = insertelement <4 x float> %82, float 0.000000e+00, i64 3
  %84 = fsub <3 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %81
  %85 = tail call <3 x float> @llvm.fmuladd.v3f32(<3 x float> %84, <3 x float> %75, <3 x float> %74)
  %86 = shufflevector <3 x float> %85, <3 x float> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %87 = insertelement <4 x float> %86, float 0.000000e+00, i64 3
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %63, <4 x float> %83, i32 0, i32 2) #2, !alias.scope !41, !noalias !42
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %6, <2 x i32> %63, <4 x float> %87, i32 0, i32 2) #2, !alias.scope !41, !noalias !42
  %88 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %61, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %89 = extractvalue { <4 x float>, i8 } %88, 0
  %90 = fadd <4 x float> %64, %89
  %91 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %61, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %92 = extractvalue { <4 x float>, i8 } %91, 0
  %93 = fadd <4 x float> %65, %92
  %94 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %62, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %95 = extractvalue { <4 x float>, i8 } %94, 0
  %96 = fsub <4 x float> %90, %95
  %97 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %62, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %98 = extractvalue { <4 x float>, i8 } %97, 0
  %99 = fsub <4 x float> %93, %98
  %100 = extractelement <2 x float> %61, i64 1
  %101 = fadd float %100, 1.000000e+00
  %102 = insertelement <2 x float> %61, float %101, i64 1
  %103 = extractelement <2 x float> %62, i64 1
  %104 = fadd float %103, 1.000000e+00
  %105 = insertelement <2 x float> %62, float %104, i64 1
  %106 = extractelement <2 x i32> %63, i64 1
  %107 = add i32 %106, 1
  %108 = insertelement <2 x i32> %63, i32 %107, i64 1
  %109 = add nuw nsw i32 %66, 1
  %110 = icmp eq i32 %109, %34
  br i1 %110, label %111, label %60, !llvm.loop !43

111:                                              ; preds = %60, %28, %7
  ret void
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #2

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <3 x float> @llvm.fmuladd.v3f32(<3 x float>, <3 x float>, <3 x float>) #3

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare float @llvm.fmuladd.f32(float, float, float) #3

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32>) local_unnamed_addr #4

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
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_I1p3_Pass2", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_I1p3_Pass2_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"int", !"m_radius", i32 20, i32 4, i32 0, !"int", !"m_numPixelsInRect", i32 24, i32 4, i32 0, !"float", !"m_epsilon"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_p_I_mean_row"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_Ip_I_sq_mean_row"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_a"}
!24 = !{i32 6, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_b"}
!25 = !{!26}
!26 = distinct !{!26, !27, !"air-alias-scope-arg(0)"}
!27 = distinct !{!27, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_I1p3_Pass2)"}
!28 = !{!29, !30}
!29 = distinct !{!29, !27, !"air-alias-scope-samplers"}
!30 = distinct !{!30, !27, !"air-alias-scope-textures"}
!31 = !{!32, !35, i64 16}
!32 = !{!"_ZTSN14soGuidedFilter32soGuidedFilter_I1p3_Pass2_paramsE", !33, i64 0, !35, i64 16, !35, i64 20, !36, i64 24}
!33 = !{!"omnipotent char", !34, i64 0}
!34 = !{!"Simple C++ TBAA"}
!35 = !{!"int", !33, i64 0}
!36 = !{!"float", !33, i64 0}
!37 = !{!32, !35, i64 20}
!38 = !{!32, !36, i64 24}
!39 = distinct !{!39, !40}
!40 = !{!"llvm.loop.mustprogress"}
!41 = !{!30}
!42 = !{!26, !29}
!43 = distinct !{!43, !40}

