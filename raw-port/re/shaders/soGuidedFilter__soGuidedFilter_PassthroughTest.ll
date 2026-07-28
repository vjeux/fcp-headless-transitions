0x0000000009f2cd -- soGuidedFilter::soGuidedFilter_PassthroughTest:
source_filename = "soGuidedFilter::soGuidedFilter_PassthroughTest"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" = type { <4 x i32>, i32, [12 x i8] }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_PassthroughTest"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4) local_unnamed_addr #0 {
  %6 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)* %0, i64 0, i32 0
  %7 = load <4 x i32>, <4 x i32> addrspace(2)* %6, align 16, !alias.scope !23, !noalias !26
  %8 = shufflevector <4 x i32> %7, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %9 = add <2 x i32> %8, %1
  %10 = extractelement <2 x i32> %1, i64 1
  %11 = extractelement <4 x i32> %7, i64 3
  %12 = extractelement <4 x i32> %7, i64 1
  %13 = sub nsw i32 %11, %12
  %14 = icmp ult i32 %10, %13
  br i1 %14, label %15, label %73

15:                                               ; preds = %5
  %16 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %9) #4
  %17 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)* %0, i64 0, i32 1
  %18 = load i32, i32 addrspace(2)* %17, align 16, !tbaa !29, !alias.scope !23, !noalias !26
  %19 = tail call float @air.convert.f.f32.s.i32(i32 %18) #4
  %20 = insertelement <2 x float> <float undef, float 0.000000e+00>, float %19, i64 0
  %21 = fsub <2 x float> %16, %20
  %22 = fadd <2 x float> %21, <float 5.000000e-01, float 5.000000e-01>
  %23 = shl nsw i32 %18, 1
  %24 = or i32 %23, 1
  %25 = icmp sgt i32 %24, 0
  br i1 %25, label %37, label %26

26:                                               ; preds = %37, %15
  %27 = phi <4 x float> [ zeroinitializer, %15 ], [ %43, %37 ]
  %28 = phi <2 x float> [ %22, %15 ], [ %46, %37 ]
  %29 = extractelement <4 x i32> %7, i64 2
  %30 = extractelement <4 x i32> %7, i64 0
  %31 = sub i32 %29, %30
  %32 = icmp sgt i32 %31, 0
  br i1 %32, label %33, label %73

33:                                               ; preds = %26
  %34 = tail call float @llvm.fmuladd.f32(float %19, float 2.000000e+00, float 1.000000e+00)
  %35 = insertelement <4 x float> undef, float %34, i64 0
  %36 = shufflevector <4 x float> %35, <4 x float> undef, <4 x i32> zeroinitializer
  br label %49

37:                                               ; preds = %37, %15
  %38 = phi <2 x float> [ %46, %37 ], [ %22, %15 ]
  %39 = phi i32 [ %47, %37 ], [ 0, %15 ]
  %40 = phi <4 x float> [ %43, %37 ], [ zeroinitializer, %15 ]
  %41 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %38, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %42 = extractvalue { <4 x float>, i8 } %41, 0
  %43 = fadd <4 x float> %40, %42
  %44 = extractelement <2 x float> %38, i64 0
  %45 = fadd float %44, 1.000000e+00
  %46 = insertelement <2 x float> %38, float %45, i64 0
  %47 = add nuw nsw i32 %39, 1
  %48 = icmp eq i32 %47, %24
  br i1 %48, label %26, label %37, !llvm.loop !34

49:                                               ; preds = %49, %33
  %50 = phi <2 x float> [ %28, %33 ], [ %64, %49 ]
  %51 = phi i32 [ 0, %33 ], [ %71, %49 ]
  %52 = phi <2 x i32> [ %9, %33 ], [ %70, %49 ]
  %53 = phi <2 x float> [ %22, %33 ], [ %67, %49 ]
  %54 = phi <4 x float> [ %27, %33 ], [ %61, %49 ]
  %55 = fdiv <4 x float> %54, %36
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %52, <4 x float> %55, i32 0, i32 2) #2, !alias.scope !36, !noalias !37
  %56 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %50, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %57 = extractvalue { <4 x float>, i8 } %56, 0
  %58 = fadd <4 x float> %54, %57
  %59 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %53, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %60 = extractvalue { <4 x float>, i8 } %59, 0
  %61 = fsub <4 x float> %58, %60
  %62 = extractelement <2 x float> %50, i64 0
  %63 = fadd float %62, 1.000000e+00
  %64 = insertelement <2 x float> %50, float %63, i64 0
  %65 = extractelement <2 x float> %53, i64 0
  %66 = fadd float %65, 1.000000e+00
  %67 = insertelement <2 x float> %53, float %66, i64 0
  %68 = extractelement <2 x i32> %52, i64 0
  %69 = add i32 %68, 1
  %70 = insertelement <2 x i32> %52, i32 %69, i64 0
  %71 = add nuw nsw i32 %51, 1
  %72 = icmp eq i32 %71, %31
  br i1 %72, label %73, label %49, !llvm.loop !38

73:                                               ; preds = %49, %26, %5
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
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass3_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_PassthroughTest", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_PassthroughTest_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"int", !"m_radius"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output"}
!23 = !{!24}
!24 = distinct !{!24, !25, !"air-alias-scope-arg(0)"}
!25 = distinct !{!25, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_PassthroughTest)"}
!26 = !{!27, !28}
!27 = distinct !{!27, !25, !"air-alias-scope-samplers"}
!28 = distinct !{!28, !25, !"air-alias-scope-textures"}
!29 = !{!30, !33, i64 16}
!30 = !{!"_ZTSN14soGuidedFilter37soGuidedFilter_PassthroughTest_paramsE", !31, i64 0, !33, i64 16}
!31 = !{!"omnipotent char", !32, i64 0}
!32 = !{!"Simple C++ TBAA"}
!33 = !{!"int", !31, i64 0}
!34 = distinct !{!34, !35}
!35 = !{!"llvm.loop.mustprogress"}
!36 = !{!28}
!37 = !{!24, !27}
!38 = distinct !{!38, !35}

