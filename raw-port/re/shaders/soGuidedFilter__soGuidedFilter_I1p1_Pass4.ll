0x0000000008ef1d -- soGuidedFilter::soGuidedFilter_I1p1_Pass4:
source_filename = "soGuidedFilter::soGuidedFilter_I1p1_Pass4"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" = type { <4 x i32>, i32, i32, [8 x i8] }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_I1p1_Pass4"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5) local_unnamed_addr #0 {
  %7 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" addrspace(2)* %0, i64 0, i32 0
  %8 = load <4 x i32>, <4 x i32> addrspace(2)* %7, align 16, !alias.scope !24, !noalias !27
  %9 = shufflevector <4 x i32> %8, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %10 = add <2 x i32> %9, %1
  %11 = extractelement <2 x i32> %10, i64 0
  %12 = extractelement <4 x i32> %8, i64 2
  %13 = extractelement <4 x i32> %8, i64 0
  %14 = sub nsw i32 %12, %13
  %15 = icmp ult i32 %11, %14
  br i1 %15, label %16, label %86

16:                                               ; preds = %6
  %17 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %10) #3
  %18 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" addrspace(2)* %0, i64 0, i32 1
  %19 = load i32, i32 addrspace(2)* %18, align 16, !tbaa !30, !alias.scope !24, !noalias !27
  %20 = tail call float @air.convert.f.f32.s.i32(i32 %19) #3
  %21 = insertelement <2 x float> <float 0.000000e+00, float undef>, float %20, i64 1
  %22 = fsub <2 x float> %17, %21
  %23 = fadd <2 x float> %22, <float 5.000000e-01, float 5.000000e-01>
  %24 = shl nsw i32 %19, 1
  %25 = or i32 %24, 1
  %26 = icmp sgt i32 %25, 0
  br i1 %26, label %38, label %27

27:                                               ; preds = %38, %16
  %28 = phi <4 x float> [ zeroinitializer, %16 ], [ %44, %38 ]
  %29 = phi <2 x float> [ %23, %16 ], [ %47, %38 ]
  %30 = extractelement <4 x i32> %8, i64 3
  %31 = extractelement <4 x i32> %8, i64 1
  %32 = sub i32 %30, %31
  %33 = icmp sgt i32 %32, 0
  br i1 %33, label %34, label %86

34:                                               ; preds = %27
  %35 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" addrspace(2)* %0, i64 0, i32 2
  %36 = load i32, i32 addrspace(2)* %35, align 4, !tbaa !35, !alias.scope !24, !noalias !27
  %37 = tail call float @air.convert.f.f32.s.i32(i32 %36) #3
  br label %50

38:                                               ; preds = %38, %16
  %39 = phi <2 x float> [ %47, %38 ], [ %23, %16 ]
  %40 = phi <4 x float> [ %44, %38 ], [ zeroinitializer, %16 ]
  %41 = phi i32 [ %48, %38 ], [ 0, %16 ]
  %42 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %39, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !27, !noalias !24
  %43 = extractvalue { <4 x float>, i8 } %42, 0
  %44 = fadd <4 x float> %40, %43
  %45 = extractelement <2 x float> %39, i64 1
  %46 = fadd float %45, 1.000000e+00
  %47 = insertelement <2 x float> %39, float %46, i64 1
  %48 = add nuw nsw i32 %41, 1
  %49 = icmp eq i32 %48, %25
  br i1 %49, label %27, label %38, !llvm.loop !36

50:                                               ; preds = %50, %34
  %51 = phi <2 x float> [ %29, %34 ], [ %77, %50 ]
  %52 = phi <2 x float> [ %23, %34 ], [ %80, %50 ]
  %53 = phi <2 x i32> [ %10, %34 ], [ %83, %50 ]
  %54 = phi <4 x float> [ %28, %34 ], [ %74, %50 ]
  %55 = phi i32 [ 0, %34 ], [ %84, %50 ]
  %56 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %53) #3
  %57 = fadd <2 x float> %56, <float 5.000000e-01, float 5.000000e-01>
  %58 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %57, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !27, !noalias !24
  %59 = extractvalue { <4 x float>, i8 } %58, 0
  %60 = extractelement <4 x float> %59, i64 0
  %61 = extractelement <4 x float> %54, i64 0
  %62 = extractelement <4 x float> %54, i64 1
  %63 = tail call float @llvm.fmuladd.f32(float %61, float %60, float %62)
  %64 = fdiv float %63, %37
  %65 = insertelement <4 x float> <float undef, float undef, float undef, float 1.000000e+00>, float %64, i64 0
  %66 = insertelement <4 x float> %65, float %64, i64 1
  %67 = insertelement <4 x float> %66, float %64, i64 2
  %68 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %67, <4 x float> zeroinitializer, <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>) #3
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %53, <4 x float> %68, i32 0, i32 2) #2, !alias.scope !38, !noalias !39
  %69 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %51, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !27, !noalias !24
  %70 = extractvalue { <4 x float>, i8 } %69, 0
  %71 = fadd <4 x float> %54, %70
  %72 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %52, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !27, !noalias !24
  %73 = extractvalue { <4 x float>, i8 } %72, 0
  %74 = fsub <4 x float> %71, %73
  %75 = extractelement <2 x float> %51, i64 1
  %76 = fadd float %75, 1.000000e+00
  %77 = insertelement <2 x float> %51, float %76, i64 1
  %78 = extractelement <2 x float> %52, i64 1
  %79 = fadd float %78, 1.000000e+00
  %80 = insertelement <2 x float> %52, float %79, i64 1
  %81 = extractelement <2 x i32> %53, i64 1
  %82 = add i32 %81, 1
  %83 = insertelement <2 x i32> %53, i32 %82, i64 1
  %84 = add nuw nsw i32 %55, 1
  %85 = icmp eq i32 %84, %32
  br i1 %85, label %86, label %50, !llvm.loop !40

86:                                               ; preds = %50, %27, %6
  ret void
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <4 x float> @air.clamp.v4f32(<4 x float>, <4 x float>, <4 x float>) local_unnamed_addr #3

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare float @llvm.fmuladd.f32(float, float, float) #4

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32>) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #3

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { argmemonly nounwind }
attributes #3 = { nounwind readnone }
attributes #4 = { nocallback nofree nosync nounwind readnone speculatable willreturn }

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
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass4_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_I1p1_Pass4", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_I1p1_Pass4_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"int", !"m_radius", i32 20, i32 4, i32 0, !"int", !"m_numPixelsInRect"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_a_b_mean_row"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_I"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_q"}
!24 = !{!25}
!25 = distinct !{!25, !26, !"air-alias-scope-arg(0)"}
!26 = distinct !{!26, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_I1p1_Pass4)"}
!27 = !{!28, !29}
!28 = distinct !{!28, !26, !"air-alias-scope-samplers"}
!29 = distinct !{!29, !26, !"air-alias-scope-textures"}
!30 = !{!31, !34, i64 16}
!31 = !{!"_ZTSN14soGuidedFilter32soGuidedFilter_I1p1_Pass4_paramsE", !32, i64 0, !34, i64 16, !34, i64 20}
!32 = !{!"omnipotent char", !33, i64 0}
!33 = !{!"Simple C++ TBAA"}
!34 = !{!"int", !32, i64 0}
!35 = !{!31, !34, i64 20}
!36 = distinct !{!36, !37}
!37 = !{!"llvm.loop.mustprogress"}
!38 = !{!29}
!39 = !{!25, !28}
!40 = distinct !{!40, !37}

