0x00000000097c2d -- soGuidedFilter::soGuidedFilter_I1p3_Pass2_I:
source_filename = "soGuidedFilter::soGuidedFilter_I1p3_Pass2_I"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" = type { <4 x i32>, i32, i32, [8 x i8] }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_I1p3_Pass2_I"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4) local_unnamed_addr #0 {
  %6 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" addrspace(2)* %0, i64 0, i32 0
  %7 = load <4 x i32>, <4 x i32> addrspace(2)* %6, align 16, !alias.scope !23, !noalias !26
  %8 = shufflevector <4 x i32> %7, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %9 = add <2 x i32> %8, %1
  %10 = extractelement <2 x i32> %9, i64 0
  %11 = extractelement <4 x i32> %7, i64 2
  %12 = extractelement <4 x i32> %7, i64 0
  %13 = sub nsw i32 %11, %12
  %14 = icmp ult i32 %10, %13
  br i1 %14, label %15, label %84

15:                                               ; preds = %5
  %16 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %9) #4
  %17 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" addrspace(2)* %0, i64 0, i32 1
  %18 = load i32, i32 addrspace(2)* %17, align 16, !tbaa !29, !alias.scope !23, !noalias !26
  %19 = tail call float @air.convert.f.f32.s.i32(i32 %18) #4
  %20 = insertelement <2 x float> <float 0.000000e+00, float undef>, float %19, i64 1
  %21 = fsub <2 x float> %16, %20
  %22 = fadd <2 x float> %21, <float 5.000000e-01, float 5.000000e-01>
  %23 = shl nsw i32 %18, 1
  %24 = or i32 %23, 1
  %25 = icmp sgt i32 %24, 0
  br i1 %25, label %39, label %26

26:                                               ; preds = %39, %15
  %27 = phi <2 x float> [ zeroinitializer, %15 ], [ %46, %39 ]
  %28 = phi <2 x float> [ %22, %15 ], [ %49, %39 ]
  %29 = extractelement <4 x i32> %7, i64 3
  %30 = extractelement <4 x i32> %7, i64 1
  %31 = sub i32 %29, %30
  %32 = icmp sgt i32 %31, 0
  br i1 %32, label %33, label %84

33:                                               ; preds = %26
  %34 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" addrspace(2)* %0, i64 0, i32 2
  %35 = load i32, i32 addrspace(2)* %34, align 4, !tbaa !34, !alias.scope !23, !noalias !26
  %36 = tail call float @air.convert.f.f32.s.i32(i32 %35) #4
  %37 = insertelement <2 x float> undef, float %36, i64 0
  %38 = shufflevector <2 x float> %37, <2 x float> undef, <2 x i32> zeroinitializer
  br label %52

39:                                               ; preds = %39, %15
  %40 = phi <2 x float> [ %49, %39 ], [ %22, %15 ]
  %41 = phi <2 x float> [ %46, %39 ], [ zeroinitializer, %15 ]
  %42 = phi i32 [ %50, %39 ], [ 0, %15 ]
  %43 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %40, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %44 = extractvalue { <4 x float>, i8 } %43, 0
  %45 = shufflevector <4 x float> %44, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %46 = fadd <2 x float> %41, %45
  %47 = extractelement <2 x float> %40, i64 1
  %48 = fadd float %47, 1.000000e+00
  %49 = insertelement <2 x float> %40, float %48, i64 1
  %50 = add nuw nsw i32 %42, 1
  %51 = icmp eq i32 %50, %24
  br i1 %51, label %26, label %39, !llvm.loop !35

52:                                               ; preds = %52, %33
  %53 = phi <2 x float> [ %28, %33 ], [ %75, %52 ]
  %54 = phi <2 x float> [ %22, %33 ], [ %78, %52 ]
  %55 = phi <2 x i32> [ %9, %33 ], [ %81, %52 ]
  %56 = phi <2 x float> [ %27, %33 ], [ %72, %52 ]
  %57 = phi i32 [ 0, %33 ], [ %82, %52 ]
  %58 = fdiv <2 x float> %56, %38
  %59 = extractelement <2 x float> %58, i64 1
  %60 = extractelement <2 x float> %58, i64 0
  %61 = fsub float -0.000000e+00, %60
  %62 = tail call float @llvm.fmuladd.f32(float %61, float %60, float %59)
  %63 = insertelement <4 x float> <float undef, float undef, float 0.000000e+00, float 0.000000e+00>, float %60, i64 0
  %64 = insertelement <4 x float> %63, float %62, i64 1
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %55, <4 x float> %64, i32 0, i32 2) #2, !alias.scope !37, !noalias !38
  %65 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %53, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %66 = extractvalue { <4 x float>, i8 } %65, 0
  %67 = shufflevector <4 x float> %66, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %68 = fadd <2 x float> %56, %67
  %69 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %54, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %70 = extractvalue { <4 x float>, i8 } %69, 0
  %71 = shufflevector <4 x float> %70, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %72 = fsub <2 x float> %68, %71
  %73 = extractelement <2 x float> %53, i64 1
  %74 = fadd float %73, 1.000000e+00
  %75 = insertelement <2 x float> %53, float %74, i64 1
  %76 = extractelement <2 x float> %54, i64 1
  %77 = fadd float %76, 1.000000e+00
  %78 = insertelement <2 x float> %54, float %77, i64 1
  %79 = extractelement <2 x i32> %55, i64 1
  %80 = add i32 %79, 1
  %81 = insertelement <2 x i32> %55, i32 %80, i64 1
  %82 = add nuw nsw i32 %57, 1
  %83 = icmp eq i32 %82, %31
  br i1 %83, label %84, label %52, !llvm.loop !39

84:                                               ; preds = %52, %26, %5
  ret void
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #2

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
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_I1p3_Pass2_I", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_I1p3_Pass2_I_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"int", !"m_radius", i32 20, i32 4, i32 0, !"int", !"m_numPixelsInRect"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_I_I_sq_mean_row"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_I_stats"}
!23 = !{!24}
!24 = distinct !{!24, !25, !"air-alias-scope-arg(0)"}
!25 = distinct !{!25, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_I1p3_Pass2_I)"}
!26 = !{!27, !28}
!27 = distinct !{!27, !25, !"air-alias-scope-samplers"}
!28 = distinct !{!28, !25, !"air-alias-scope-textures"}
!29 = !{!30, !33, i64 16}
!30 = !{!"_ZTSN14soGuidedFilter34soGuidedFilter_I1p3_Pass2_I_paramsE", !31, i64 0, !33, i64 16, !33, i64 20}
!31 = !{!"omnipotent char", !32, i64 0}
!32 = !{!"Simple C++ TBAA"}
!33 = !{!"int", !31, i64 0}
!34 = !{!30, !33, i64 20}
!35 = distinct !{!35, !36}
!36 = !{!"llvm.loop.mustprogress"}
!37 = !{!28}
!38 = !{!24, !27}
!39 = distinct !{!39, !36}

