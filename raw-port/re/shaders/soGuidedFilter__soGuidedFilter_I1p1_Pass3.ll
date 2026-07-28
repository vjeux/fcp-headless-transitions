0x0000000008dccd -- soGuidedFilter::soGuidedFilter_I1p1_Pass3:
source_filename = "soGuidedFilter::soGuidedFilter_I1p1_Pass3"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" = type { <4 x i32>, i32, [12 x i8] }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_I1p1_Pass3"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4) local_unnamed_addr #0 {
  %6 = shufflevector <2 x i32> %1, <2 x i32> undef, <2 x i32> <i32 1, i32 0>
  %7 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)* %0, i64 0, i32 0
  %8 = load <4 x i32>, <4 x i32> addrspace(2)* %7, align 16, !alias.scope !23, !noalias !26
  %9 = shufflevector <4 x i32> %8, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %10 = add <2 x i32> %9, %6
  %11 = extractelement <2 x i32> %1, i64 0
  %12 = extractelement <4 x i32> %8, i64 3
  %13 = extractelement <4 x i32> %8, i64 1
  %14 = sub nsw i32 %12, %13
  %15 = icmp ult i32 %11, %14
  br i1 %15, label %16, label %69

16:                                               ; preds = %5
  %17 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %10) #3
  %18 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)* %0, i64 0, i32 1
  %19 = load i32, i32 addrspace(2)* %18, align 16, !tbaa !29, !alias.scope !23, !noalias !26
  %20 = tail call float @air.convert.f.f32.s.i32(i32 %19) #3
  %21 = insertelement <2 x float> <float undef, float 0.000000e+00>, float %20, i64 0
  %22 = fsub <2 x float> %17, %21
  %23 = fadd <2 x float> %22, <float 5.000000e-01, float 5.000000e-01>
  %24 = shl nsw i32 %19, 1
  %25 = or i32 %24, 1
  %26 = icmp sgt i32 %25, 0
  br i1 %26, label %34, label %27

27:                                               ; preds = %34, %16
  %28 = phi <4 x float> [ zeroinitializer, %16 ], [ %40, %34 ]
  %29 = phi <2 x float> [ %23, %16 ], [ %43, %34 ]
  %30 = extractelement <4 x i32> %8, i64 2
  %31 = extractelement <4 x i32> %8, i64 0
  %32 = sub i32 %30, %31
  %33 = icmp sgt i32 %32, 0
  br i1 %33, label %46, label %69

34:                                               ; preds = %34, %16
  %35 = phi <2 x float> [ %43, %34 ], [ %23, %16 ]
  %36 = phi i32 [ %44, %34 ], [ 0, %16 ]
  %37 = phi <4 x float> [ %40, %34 ], [ zeroinitializer, %16 ]
  %38 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %35, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %39 = extractvalue { <4 x float>, i8 } %38, 0
  %40 = fadd <4 x float> %37, %39
  %41 = extractelement <2 x float> %35, i64 0
  %42 = fadd float %41, 1.000000e+00
  %43 = insertelement <2 x float> %35, float %42, i64 0
  %44 = add nuw nsw i32 %36, 1
  %45 = icmp eq i32 %44, %25
  br i1 %45, label %27, label %34, !llvm.loop !34

46:                                               ; preds = %46, %27
  %47 = phi <2 x float> [ %60, %46 ], [ %29, %27 ]
  %48 = phi i32 [ %67, %46 ], [ 0, %27 ]
  %49 = phi <2 x float> [ %63, %46 ], [ %23, %27 ]
  %50 = phi <4 x float> [ %57, %46 ], [ %28, %27 ]
  %51 = phi <2 x i32> [ %66, %46 ], [ %10, %27 ]
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %51, <4 x float> %50, i32 0, i32 2) #2, !alias.scope !36, !noalias !37
  %52 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %47, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %53 = extractvalue { <4 x float>, i8 } %52, 0
  %54 = fadd <4 x float> %50, %53
  %55 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %49, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %56 = extractvalue { <4 x float>, i8 } %55, 0
  %57 = fsub <4 x float> %54, %56
  %58 = extractelement <2 x float> %47, i64 0
  %59 = fadd float %58, 1.000000e+00
  %60 = insertelement <2 x float> %47, float %59, i64 0
  %61 = extractelement <2 x float> %49, i64 0
  %62 = fadd float %61, 1.000000e+00
  %63 = insertelement <2 x float> %49, float %62, i64 0
  %64 = extractelement <2 x i32> %51, i64 0
  %65 = add i32 %64, 1
  %66 = insertelement <2 x i32> %51, i32 %65, i64 0
  %67 = add nuw nsw i32 %48, 1
  %68 = icmp eq i32 %67, %32
  br i1 %68, label %69, label %46, !llvm.loop !38

69:                                               ; preds = %46, %27, %5
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
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_I1p1_Pass3", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_I1p1_Pass3_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"int", !"m_radius"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_a_b"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_a_b_mean_row"}
!23 = !{!24}
!24 = distinct !{!24, !25, !"air-alias-scope-arg(0)"}
!25 = distinct !{!25, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_I1p1_Pass3)"}
!26 = !{!27, !28}
!27 = distinct !{!27, !25, !"air-alias-scope-samplers"}
!28 = distinct !{!28, !25, !"air-alias-scope-textures"}
!29 = !{!30, !33, i64 16}
!30 = !{!"_ZTSN14soGuidedFilter32soGuidedFilter_I1p1_Pass3_paramsE", !31, i64 0, !33, i64 16}
!31 = !{!"omnipotent char", !32, i64 0}
!32 = !{!"Simple C++ TBAA"}
!33 = !{!"int", !31, i64 0}
!34 = distinct !{!34, !35}
!35 = !{!"llvm.loop.mustprogress"}
!36 = !{!28}
!37 = !{!24, !27}
!38 = distinct !{!38, !35}

