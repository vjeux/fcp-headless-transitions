0x0000000009a46d -- soGuidedFilter::soGuidedFilter_I1p3_Pass3:
source_filename = "soGuidedFilter::soGuidedFilter_I1p3_Pass3"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" = type { <4 x i32>, i32, [12 x i8] }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_I1p3_Pass3"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, %struct._texture_2d_t addrspace(1)* %5, %struct._texture_2d_t addrspace(1)* %6) local_unnamed_addr #0 {
  %8 = shufflevector <2 x i32> %1, <2 x i32> undef, <2 x i32> <i32 1, i32 0>
  %9 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)* %0, i64 0, i32 0
  %10 = load <4 x i32>, <4 x i32> addrspace(2)* %9, align 16, !alias.scope !25, !noalias !28
  %11 = shufflevector <4 x i32> %10, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %12 = add <2 x i32> %11, %8
  %13 = extractelement <2 x i32> %1, i64 0
  %14 = extractelement <4 x i32> %10, i64 3
  %15 = extractelement <4 x i32> %10, i64 1
  %16 = sub nsw i32 %14, %15
  %17 = icmp ult i32 %13, %16
  br i1 %17, label %18, label %83

18:                                               ; preds = %7
  %19 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %12) #3
  %20 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)* %0, i64 0, i32 1
  %21 = load i32, i32 addrspace(2)* %20, align 16, !tbaa !31, !alias.scope !25, !noalias !28
  %22 = tail call float @air.convert.f.f32.s.i32(i32 %21) #3
  %23 = insertelement <2 x float> <float undef, float 0.000000e+00>, float %22, i64 0
  %24 = fsub <2 x float> %19, %23
  %25 = fadd <2 x float> %24, <float 5.000000e-01, float 5.000000e-01>
  %26 = shl nsw i32 %21, 1
  %27 = or i32 %26, 1
  %28 = icmp sgt i32 %27, 0
  br i1 %28, label %37, label %29

29:                                               ; preds = %37, %18
  %30 = phi <4 x float> [ zeroinitializer, %18 ], [ %47, %37 ]
  %31 = phi <4 x float> [ zeroinitializer, %18 ], [ %44, %37 ]
  %32 = phi <2 x float> [ %25, %18 ], [ %50, %37 ]
  %33 = extractelement <4 x i32> %10, i64 2
  %34 = extractelement <4 x i32> %10, i64 0
  %35 = sub i32 %33, %34
  %36 = icmp sgt i32 %35, 0
  br i1 %36, label %53, label %83

37:                                               ; preds = %37, %18
  %38 = phi <2 x float> [ %50, %37 ], [ %25, %18 ]
  %39 = phi <4 x float> [ %44, %37 ], [ zeroinitializer, %18 ]
  %40 = phi <4 x float> [ %47, %37 ], [ zeroinitializer, %18 ]
  %41 = phi i32 [ %51, %37 ], [ 0, %18 ]
  %42 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %38, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %43 = extractvalue { <4 x float>, i8 } %42, 0
  %44 = fadd <4 x float> %39, %43
  %45 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %38, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %46 = extractvalue { <4 x float>, i8 } %45, 0
  %47 = fadd <4 x float> %40, %46
  %48 = extractelement <2 x float> %38, i64 0
  %49 = fadd float %48, 1.000000e+00
  %50 = insertelement <2 x float> %38, float %49, i64 0
  %51 = add nuw nsw i32 %41, 1
  %52 = icmp eq i32 %51, %27
  br i1 %52, label %29, label %37, !llvm.loop !36

53:                                               ; preds = %53, %29
  %54 = phi <2 x float> [ %74, %53 ], [ %32, %29 ]
  %55 = phi <2 x float> [ %77, %53 ], [ %25, %29 ]
  %56 = phi <2 x i32> [ %80, %53 ], [ %12, %29 ]
  %57 = phi i32 [ %81, %53 ], [ 0, %29 ]
  %58 = phi <4 x float> [ %68, %53 ], [ %31, %29 ]
  %59 = phi <4 x float> [ %71, %53 ], [ %30, %29 ]
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %56, <4 x float> %58, i32 0, i32 2) #2, !alias.scope !38, !noalias !39
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %6, <2 x i32> %56, <4 x float> %59, i32 0, i32 2) #2, !alias.scope !38, !noalias !39
  %60 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %54, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %61 = extractvalue { <4 x float>, i8 } %60, 0
  %62 = fadd <4 x float> %58, %61
  %63 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %54, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %64 = extractvalue { <4 x float>, i8 } %63, 0
  %65 = fadd <4 x float> %59, %64
  %66 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %55, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %67 = extractvalue { <4 x float>, i8 } %66, 0
  %68 = fsub <4 x float> %62, %67
  %69 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %55, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %70 = extractvalue { <4 x float>, i8 } %69, 0
  %71 = fsub <4 x float> %65, %70
  %72 = extractelement <2 x float> %54, i64 0
  %73 = fadd float %72, 1.000000e+00
  %74 = insertelement <2 x float> %54, float %73, i64 0
  %75 = extractelement <2 x float> %55, i64 0
  %76 = fadd float %75, 1.000000e+00
  %77 = insertelement <2 x float> %55, float %76, i64 0
  %78 = extractelement <2 x i32> %56, i64 0
  %79 = add i32 %78, 1
  %80 = insertelement <2 x i32> %56, i32 %79, i64 0
  %81 = add nuw nsw i32 %57, 1
  %82 = icmp eq i32 %81, %35
  br i1 %82, label %83, label %53, !llvm.loop !40

83:                                               ; preds = %53, %29, %7
  ret void
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32>) local_unnamed_addr #3

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { argmemonly nounwind }
attributes #3 = { nounwind readnone }

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
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_I1p3_Pass3", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_I1p3_Pass3_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"int", !"m_radius"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_a"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_b"}
!23 = !{i32 5, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_a_mean_row"}
!24 = !{i32 6, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_b_mean_row"}
!25 = !{!26}
!26 = distinct !{!26, !27, !"air-alias-scope-arg(0)"}
!27 = distinct !{!27, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_I1p3_Pass3)"}
!28 = !{!29, !30}
!29 = distinct !{!29, !27, !"air-alias-scope-samplers"}
!30 = distinct !{!30, !27, !"air-alias-scope-textures"}
!31 = !{!32, !35, i64 16}
!32 = !{!"_ZTSN14soGuidedFilter32soGuidedFilter_I1p3_Pass3_paramsE", !33, i64 0, !35, i64 16}
!33 = !{!"omnipotent char", !34, i64 0}
!34 = !{!"Simple C++ TBAA"}
!35 = !{!"int", !33, i64 0}
!36 = distinct !{!36, !37}
!37 = !{!"llvm.loop.mustprogress"}
!38 = !{!30}
!39 = !{!26, !29}
!40 = distinct !{!40, !37}

