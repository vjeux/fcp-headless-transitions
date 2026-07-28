0x0000000008c92d -- soGuidedFilter::soGuidedFilter_I1p1_Pass2:
source_filename = "soGuidedFilter::soGuidedFilter_I1p1_Pass2"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" = type { <4 x i32>, i32, i32, float }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soGuidedFilter::soGuidedFilter_I1p1_Pass2"(%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4) local_unnamed_addr #0 {
  %6 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 0
  %7 = load <4 x i32>, <4 x i32> addrspace(2)* %6, align 16, !alias.scope !23, !noalias !26
  %8 = shufflevector <4 x i32> %7, <4 x i32> undef, <2 x i32> <i32 0, i32 1>
  %9 = add <2 x i32> %8, %1
  %10 = extractelement <2 x i32> %9, i64 0
  %11 = extractelement <4 x i32> %7, i64 2
  %12 = extractelement <4 x i32> %7, i64 0
  %13 = sub nsw i32 %11, %12
  %14 = icmp ult i32 %10, %13
  br i1 %14, label %15, label %91

15:                                               ; preds = %5
  %16 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %9) #4
  %17 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 1
  %18 = load i32, i32 addrspace(2)* %17, align 16, !tbaa !29, !alias.scope !23, !noalias !26
  %19 = tail call float @air.convert.f.f32.s.i32(i32 %18) #4
  %20 = insertelement <2 x float> <float 0.000000e+00, float undef>, float %19, i64 1
  %21 = fsub <2 x float> %16, %20
  %22 = fadd <2 x float> %21, <float 5.000000e-01, float 5.000000e-01>
  %23 = shl nsw i32 %18, 1
  %24 = or i32 %23, 1
  %25 = icmp sgt i32 %24, 0
  br i1 %25, label %41, label %26

26:                                               ; preds = %41, %15
  %27 = phi <4 x float> [ zeroinitializer, %15 ], [ %47, %41 ]
  %28 = phi <2 x float> [ %22, %15 ], [ %50, %41 ]
  %29 = extractelement <4 x i32> %7, i64 3
  %30 = extractelement <4 x i32> %7, i64 1
  %31 = sub i32 %29, %30
  %32 = icmp sgt i32 %31, 0
  br i1 %32, label %33, label %91

33:                                               ; preds = %26
  %34 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 2
  %35 = load i32, i32 addrspace(2)* %34, align 4, !tbaa !35, !alias.scope !23, !noalias !26
  %36 = tail call float @air.convert.f.f32.s.i32(i32 %35) #4
  %37 = insertelement <4 x float> undef, float %36, i64 0
  %38 = shufflevector <4 x float> %37, <4 x float> undef, <4 x i32> zeroinitializer
  %39 = getelementptr inbounds %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", %"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)* %0, i64 0, i32 3
  %40 = load float, float addrspace(2)* %39, align 8, !tbaa !36, !alias.scope !23, !noalias !26
  br label %53

41:                                               ; preds = %41, %15
  %42 = phi <2 x float> [ %50, %41 ], [ %22, %15 ]
  %43 = phi <4 x float> [ %47, %41 ], [ zeroinitializer, %15 ]
  %44 = phi i32 [ %51, %41 ], [ 0, %15 ]
  %45 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %42, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %46 = extractvalue { <4 x float>, i8 } %45, 0
  %47 = fadd <4 x float> %43, %46
  %48 = extractelement <2 x float> %42, i64 1
  %49 = fadd float %48, 1.000000e+00
  %50 = insertelement <2 x float> %42, float %49, i64 1
  %51 = add nuw nsw i32 %44, 1
  %52 = icmp eq i32 %51, %24
  br i1 %52, label %26, label %41, !llvm.loop !37

53:                                               ; preds = %53, %33
  %54 = phi <2 x float> [ %28, %33 ], [ %82, %53 ]
  %55 = phi <2 x float> [ %22, %33 ], [ %85, %53 ]
  %56 = phi <2 x i32> [ %9, %33 ], [ %88, %53 ]
  %57 = phi <4 x float> [ %27, %33 ], [ %79, %53 ]
  %58 = phi i32 [ 0, %33 ], [ %89, %53 ]
  %59 = fdiv <4 x float> %57, %38
  %60 = extractelement <4 x float> %59, i64 3
  %61 = extractelement <4 x float> %59, i64 1
  %62 = fsub float -0.000000e+00, %61
  %63 = tail call float @llvm.fmuladd.f32(float %62, float %61, float %60)
  %64 = extractelement <4 x float> %59, i64 2
  %65 = extractelement <4 x float> %59, i64 0
  %66 = fsub float -0.000000e+00, %65
  %67 = tail call float @llvm.fmuladd.f32(float %66, float %61, float %64)
  %68 = fadd float %40, %63
  %69 = fdiv float %67, %68
  %70 = insertelement <4 x float> <float undef, float undef, float 0.000000e+00, float 0.000000e+00>, float %69, i64 0
  %71 = fsub float -0.000000e+00, %69
  %72 = tail call float @llvm.fmuladd.f32(float %71, float %61, float %65)
  %73 = insertelement <4 x float> %70, float %72, i64 1
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %56, <4 x float> %73, i32 0, i32 2) #2, !alias.scope !39, !noalias !40
  %74 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %54, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %75 = extractvalue { <4 x float>, i8 } %74, 0
  %76 = fadd <4 x float> %57, %75
  %77 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %55, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !26, !noalias !23
  %78 = extractvalue { <4 x float>, i8 } %77, 0
  %79 = fsub <4 x float> %76, %78
  %80 = extractelement <2 x float> %54, i64 1
  %81 = fadd float %80, 1.000000e+00
  %82 = insertelement <2 x float> %54, float %81, i64 1
  %83 = extractelement <2 x float> %55, i64 1
  %84 = fadd float %83, 1.000000e+00
  %85 = insertelement <2 x float> %55, float %84, i64 1
  %86 = extractelement <2 x i32> %56, i64 1
  %87 = add i32 %86, 1
  %88 = insertelement <2 x i32> %56, i32 %87, i64 1
  %89 = add nuw nsw i32 %58, 1
  %90 = icmp eq i32 %89, %31
  br i1 %90, label %91, label %53, !llvm.loop !41

91:                                               ; preds = %53, %26, %5
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
!14 = !{void (%"struct.soGuidedFilter::soGuidedFilter_I1p1_Pass2_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soGuidedFilter::soGuidedFilter_I1p1_Pass2", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soGuidedFilter::soGuidedFilter_I1p1_Pass2_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"int4", !"m_rect_in", i32 16, i32 4, i32 0, !"int", !"m_radius", i32 20, i32 4, i32 0, !"int", !"m_numPixelsInRect", i32 24, i32 4, i32 0, !"float", !"m_epsilon"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input_p_I_Ip_I_sq_mean_row"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output_a_b"}
!23 = !{!24}
!24 = distinct !{!24, !25, !"air-alias-scope-arg(0)"}
!25 = distinct !{!25, !"air-alias-scopes(soGuidedFilter::soGuidedFilter_I1p1_Pass2)"}
!26 = !{!27, !28}
!27 = distinct !{!27, !25, !"air-alias-scope-samplers"}
!28 = distinct !{!28, !25, !"air-alias-scope-textures"}
!29 = !{!30, !33, i64 16}
!30 = !{!"_ZTSN14soGuidedFilter32soGuidedFilter_I1p1_Pass2_paramsE", !31, i64 0, !33, i64 16, !33, i64 20, !34, i64 24}
!31 = !{!"omnipotent char", !32, i64 0}
!32 = !{!"Simple C++ TBAA"}
!33 = !{!"int", !31, i64 0}
!34 = !{!"float", !31, i64 0}
!35 = !{!30, !33, i64 20}
!36 = !{!30, !34, i64 24}
!37 = distinct !{!37, !38}
!38 = !{!"llvm.loop.mustprogress"}
!39 = !{!28}
!40 = !{!24, !27}
!41 = distinct !{!41, !38}

