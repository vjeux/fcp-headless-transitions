0x000000000a609d -- soOFlowEstimator::soOFlowEstimator_normalizeToLuma:
source_filename = "soOFlowEstimator::soOFlowEstimator_normalizeToLuma"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" = type { i32, float, float, i32, float, float, float, i32, i32, i32, i32, i32 }
%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_normalizeToLuma"(%"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._sampler_t addrspace(2)* nocapture readonly %2, %struct._texture_2d_t addrspace(1)* %3, %struct._texture_2d_t addrspace(1)* %4, float addrspace(1)* nocapture readonly "air-buffer-no-alias" %5) local_unnamed_addr #0 {
  %7 = extractelement <2 x i32> %1, i64 0
  %8 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, i32 0) #4, !alias.scope !24, !noalias !27
  %9 = icmp ult i32 %7, %8
  br i1 %9, label %10, label %117

10:                                               ; preds = %6
  %11 = extractelement <2 x i32> %1, i64 1
  %12 = tail call i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, i32 0) #4, !alias.scope !24, !noalias !27
  %13 = icmp ult i32 %11, %12
  br i1 %13, label %14, label %117

14:                                               ; preds = %10
  %15 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 0
  %16 = load i32, i32 addrspace(2)* %15, align 4, !tbaa !31, !alias.scope !37, !noalias !38
  %17 = add i32 %16, -1
  %18 = tail call float @air.convert.f.f32.u.i32(i32 %17) #2
  %19 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 7
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !39, !alias.scope !37, !noalias !38
  %21 = insertelement <2 x i32> undef, i32 %20, i64 0
  %22 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 8
  %23 = load i32, i32 addrspace(2)* %22, align 4, !tbaa !40, !alias.scope !37, !noalias !38
  %24 = insertelement <2 x i32> %21, i32 %23, i64 1
  %25 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 11
  %26 = load i32, i32 addrspace(2)* %25, align 4, !tbaa !41, !alias.scope !37, !noalias !38
  %27 = insertelement <2 x i32> undef, i32 %26, i64 0
  %28 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 9
  %29 = load i32, i32 addrspace(2)* %28, align 4, !tbaa !42, !alias.scope !37, !noalias !38
  %30 = insertelement <2 x i32> undef, i32 %29, i64 0
  %31 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 10
  %32 = load i32, i32 addrspace(2)* %31, align 4, !tbaa !43, !alias.scope !37, !noalias !38
  %33 = insertelement <2 x i32> %30, i32 %32, i64 1
  %34 = add <2 x i32> %24, %1
  %35 = sub <2 x i32> <i32 0, i32 undef>, %27
  %36 = shufflevector <2 x i32> %35, <2 x i32> undef, <2 x i32> zeroinitializer
  %37 = add <2 x i32> %34, %36
  %38 = add <2 x i32> %33, %24
  %39 = tail call <2 x i32> @air.clamp.s.v2i32(<2 x i32> %37, <2 x i32> %24, <2 x i32> %38) #2
  %40 = tail call <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32> %39) #2
  %41 = fadd <2 x float> %40, <float 5.000000e-01, float 5.000000e-01>
  %42 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %2, <2 x float> %41, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !44, !noalias !45
  %43 = extractvalue { <4 x float>, i8 } %42, 0
  %44 = insertelement <4 x float> undef, float %18, i64 0
  %45 = shufflevector <4 x float> %44, <4 x float> undef, <4 x i32> zeroinitializer
  %46 = fmul <4 x float> %45, %43
  %47 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %46, <4 x float> zeroinitializer, <4 x float> %45) #2
  %48 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 3
  %49 = load i32, i32 addrspace(2)* %48, align 4, !tbaa !46, !alias.scope !37, !noalias !38
  %50 = icmp eq i32 %49, 0
  %51 = shufflevector <4 x float> %47, <4 x float> undef, <4 x i32> <i32 1, i32 2, i32 3, i32 0>
  %52 = select i1 %50, <4 x float> %47, <4 x float> %51
  %53 = tail call <4 x i32> @air.convert.s.v4i32.f.v4f32(<4 x float> %52) #2
  %54 = add <4 x i32> %53, <i32 1, i32 1, i32 1, i32 1>
  %55 = tail call i32 @air.convert.s.i32.f.f32(float %18) #2
  %56 = insertelement <4 x i32> undef, i32 %55, i64 0
  %57 = shufflevector <4 x i32> %56, <4 x i32> undef, <4 x i32> zeroinitializer
  %58 = tail call <4 x i32> @air.min.s.v4i32(<4 x i32> %54, <4 x i32> %57) #2
  %59 = zext i32 %16 to i64
  %60 = getelementptr inbounds float, float addrspace(1)* %5, i64 %59
  %61 = shl i32 %16, 1
  %62 = zext i32 %61 to i64
  %63 = getelementptr inbounds float, float addrspace(1)* %5, i64 %62
  %64 = extractelement <4 x i32> %53, i64 0
  %65 = sext i32 %64 to i64
  %66 = getelementptr inbounds float, float addrspace(1)* %5, i64 %65
  %67 = load float, float addrspace(1)* %66, align 4, !tbaa !47, !alias.scope !48, !noalias !49
  %68 = insertelement <4 x float> undef, float %67, i64 0
  %69 = extractelement <4 x i32> %53, i64 1
  %70 = sext i32 %69 to i64
  %71 = getelementptr inbounds float, float addrspace(1)* %60, i64 %70
  %72 = load float, float addrspace(1)* %71, align 4, !tbaa !47, !alias.scope !48, !noalias !49
  %73 = insertelement <4 x float> %68, float %72, i64 1
  %74 = extractelement <4 x i32> %53, i64 2
  %75 = sext i32 %74 to i64
  %76 = getelementptr inbounds float, float addrspace(1)* %63, i64 %75
  %77 = load float, float addrspace(1)* %76, align 4, !tbaa !47, !alias.scope !48, !noalias !49
  %78 = insertelement <4 x float> %73, float %77, i64 2
  %79 = extractelement <4 x i32> %58, i64 0
  %80 = sext i32 %79 to i64
  %81 = getelementptr inbounds float, float addrspace(1)* %5, i64 %80
  %82 = load float, float addrspace(1)* %81, align 4, !tbaa !47, !alias.scope !48, !noalias !49
  %83 = insertelement <4 x float> undef, float %82, i64 0
  %84 = extractelement <4 x i32> %58, i64 1
  %85 = sext i32 %84 to i64
  %86 = getelementptr inbounds float, float addrspace(1)* %60, i64 %85
  %87 = load float, float addrspace(1)* %86, align 4, !tbaa !47, !alias.scope !48, !noalias !49
  %88 = insertelement <4 x float> %83, float %87, i64 1
  %89 = extractelement <4 x i32> %58, i64 2
  %90 = sext i32 %89 to i64
  %91 = getelementptr inbounds float, float addrspace(1)* %63, i64 %90
  %92 = load float, float addrspace(1)* %91, align 4, !tbaa !47, !alias.scope !48, !noalias !49
  %93 = insertelement <4 x float> %88, float %92, i64 2
  %94 = tail call <4 x float> @air.convert.f.v4f32.s.v4i32(<4 x i32> %53) #2
  %95 = fsub <4 x float> %52, %94
  %96 = tail call <4 x float> @air.mix.v4f32(<4 x float> %78, <4 x float> %93, <4 x float> %95) #2
  %97 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 4
  %98 = load float, float addrspace(2)* %97, align 4, !tbaa !50, !alias.scope !37, !noalias !38
  %99 = insertelement <3 x float> undef, float %98, i64 0
  %100 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 5
  %101 = load float, float addrspace(2)* %100, align 4, !tbaa !51, !alias.scope !37, !noalias !38
  %102 = insertelement <3 x float> %99, float %101, i64 1
  %103 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 6
  %104 = load float, float addrspace(2)* %103, align 4, !tbaa !52, !alias.scope !37, !noalias !38
  %105 = insertelement <3 x float> %102, float %104, i64 2
  %106 = shufflevector <4 x float> %96, <4 x float> undef, <3 x i32> <i32 0, i32 1, i32 2>
  %107 = tail call float @air.dot.v3f32(<3 x float> %105, <3 x float> %106) #2
  %108 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 1
  %109 = load float, float addrspace(2)* %108, align 4, !tbaa !53, !alias.scope !37, !noalias !38
  %110 = fsub float %107, %109
  %111 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", %"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)* %0, i64 0, i32 2
  %112 = load float, float addrspace(2)* %111, align 4, !tbaa !54, !alias.scope !37, !noalias !38
  %113 = fmul float %110, %112
  %114 = insertelement <4 x float> <float undef, float undef, float undef, float 1.000000e+00>, float %113, i64 0
  %115 = insertelement <4 x float> %114, float %113, i64 1
  %116 = insertelement <4 x float> %115, float %113, i64 2
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %4, <2 x i32> %1, <4 x float> %116, i32 0, i32 2) #1, !alias.scope !24, !noalias !27
  br label %117

117:                                              ; preds = %14, %10, %6
  ret void
}

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <4 x float> @air.mix.v4f32(<4 x float>, <4 x float>, <4 x float>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <4 x float> @air.convert.f.v4f32.s.v4i32(<4 x i32>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <4 x i32> @air.min.s.v4i32(<4 x i32>, <4 x i32>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare i32 @air.convert.s.i32.f.f32(float) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <4 x i32> @air.convert.s.v4i32.f.v4f32(<4 x float>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <4 x float> @air.clamp.v4f32(<4 x float>, <4 x float>, <4 x float>) local_unnamed_addr #2

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.s.v2i32(<2 x i32>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <2 x i32> @air.clamp.s.v2i32(<2 x i32>, <2 x i32>, <2 x i32>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.u.i32(i32) local_unnamed_addr #2

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #4

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #4

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly nounwind }
attributes #2 = { nounwind readnone }
attributes #3 = { argmemonly convergent nounwind readonly }
attributes #4 = { argmemonly nounwind readonly }

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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params" addrspace(2)*, <2 x i32>, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, float addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_normalizeToLuma", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 48, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_normalizeToLuma_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"uint", !"m_LUT_length", i32 4, i32 4, i32 0, !"float", !"m_remapOffset", i32 8, i32 4, i32 0, !"float", !"m_remapScale", i32 12, i32 4, i32 0, !"int", !"m_isAlphaFirstChannel", i32 16, i32 4, i32 0, !"float", !"m_RGBtoLuma_r", i32 20, i32 4, i32 0, !"float", !"m_RGBtoLuma_g", i32 24, i32 4, i32 0, !"float", !"m_RGBtoLuma_b", i32 28, i32 4, i32 0, !"int", !"m_originX", i32 32, i32 4, i32 0, !"int", !"m_originY", i32 36, i32 4, i32 0, !"int", !"m_width", i32 40, i32 4, i32 0, !"int", !"m_height", i32 44, i32 4, i32 0, !"int", !"m_inputPaddingXY"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord"}
!20 = !{i32 2, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sam"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"input"}
!22 = !{i32 4, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output"}
!23 = !{i32 5, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"LUT"}
!24 = !{!25}
!25 = distinct !{!25, !26, !"air-alias-scope-textures"}
!26 = distinct !{!26, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_normalizeToLuma)"}
!27 = !{!28, !29, !30}
!28 = distinct !{!28, !26, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !26, !"air-alias-scope-samplers"}
!30 = distinct !{!30, !26, !"air-alias-scope-arg(5)"}
!31 = !{!32, !33, i64 0}
!32 = !{!"_ZTSN16soOFlowEstimator39soOFlowEstimator_normalizeToLuma_paramsE", !33, i64 0, !36, i64 4, !36, i64 8, !33, i64 12, !36, i64 16, !36, i64 20, !36, i64 24, !33, i64 28, !33, i64 32, !33, i64 36, !33, i64 40, !33, i64 44}
!33 = !{!"int", !34, i64 0}
!34 = !{!"omnipotent char", !35, i64 0}
!35 = !{!"Simple C++ TBAA"}
!36 = !{!"float", !34, i64 0}
!37 = !{!28}
!38 = !{!29, !25, !30}
!39 = !{!32, !33, i64 28}
!40 = !{!32, !33, i64 32}
!41 = !{!32, !33, i64 44}
!42 = !{!32, !33, i64 36}
!43 = !{!32, !33, i64 40}
!44 = !{!29, !25}
!45 = !{!28, !30}
!46 = !{!32, !33, i64 12}
!47 = !{!36, !36, i64 0}
!48 = !{!30}
!49 = !{!28, !29, !25}
!50 = !{!32, !36, i64 16}
!51 = !{!32, !36, i64 20}
!52 = !{!32, !36, i64 24}
!53 = !{!32, !36, i64 4}
!54 = !{!32, !36, i64 8}

