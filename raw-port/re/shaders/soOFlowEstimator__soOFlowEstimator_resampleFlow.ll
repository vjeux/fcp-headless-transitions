0x000000000a798d -- soOFlowEstimator::soOFlowEstimator_resampleFlow:
source_filename = "soOFlowEstimator::soOFlowEstimator_resampleFlow"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params" = type { i32, i32, float, float, float }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant i64 -9188470239253725111, align 8

; Function Attrs: convergent nounwind
define void @"soOFlowEstimator::soOFlowEstimator_resampleFlow"(%"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._texture_2d_t addrspace(1)* %2, %struct._texture_2d_t addrspace(1)* %3) local_unnamed_addr #0 {
  %5 = alloca <2 x i32>, align 8
  %6 = alloca <2 x i32>, align 8
  %7 = alloca <2 x float>, align 8
  %8 = extractelement <2 x i32> %1, i64 0
  %9 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, i32 0) #7, !alias.scope !23, !noalias !26
  %10 = icmp ult i32 %8, %9
  br i1 %10, label %11, label %81

11:                                               ; preds = %4
  %12 = extractelement <2 x i32> %1, i64 1
  %13 = tail call i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, i32 0) #7, !alias.scope !23, !noalias !26
  %14 = icmp ult i32 %12, %13
  br i1 %14, label %15, label %81

15:                                               ; preds = %11
  %16 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params" addrspace(2)* %0, i64 0, i32 2
  %17 = load float, float addrspace(2)* %16, align 4, !tbaa !28, !alias.scope !26, !noalias !23
  %18 = insertelement <2 x float> undef, float %17, i64 0
  %19 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params" addrspace(2)* %0, i64 0, i32 3
  %20 = load float, float addrspace(2)* %19, align 4, !tbaa !34, !alias.scope !26, !noalias !23
  %21 = insertelement <2 x float> %18, float %20, i64 1
  %22 = tail call <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %1) #5
  %23 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params" addrspace(2)* %0, i64 0, i32 0
  %24 = load i32, i32 addrspace(2)* %23, align 4, !tbaa !35, !alias.scope !26, !noalias !23
  %25 = insertelement <2 x i32> undef, i32 %24, i64 0
  %26 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params" addrspace(2)* %0, i64 0, i32 1
  %27 = load i32, i32 addrspace(2)* %26, align 4, !tbaa !36, !alias.scope !26, !noalias !23
  %28 = insertelement <2 x i32> %25, i32 %27, i64 1
  %29 = add <2 x i32> %28, <i32 -1, i32 -1>
  %30 = fmul <2 x float> %22, %21
  %31 = bitcast <2 x i32>* %5 to i8*
  call void @llvm.lifetime.start.p0i8(i64 8, i8* nonnull %31) #8
  %32 = bitcast <2 x i32>* %6 to i8*
  call void @llvm.lifetime.start.p0i8(i64 8, i8* nonnull %32) #8
  %33 = bitcast <2 x float>* %7 to i8*
  call void @llvm.lifetime.start.p0i8(i64 8, i8* nonnull %33) #8
  call fastcc void @_ZN16soOFlowEstimator29soOFlowEstimator_clampedCoordEDv2_fDv2_iS1_PS1_S2_PS0_(<2 x float> %30, <2 x i32> zeroinitializer, <2 x i32> %29, <2 x i32>* nonnull %5, <2 x i32>* nonnull %6, <2 x float>* nonnull %7) #9
  %34 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params", %"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params" addrspace(2)* %0, i64 0, i32 4
  %35 = load float, float addrspace(2)* %34, align 4, !tbaa !37, !alias.scope !26, !noalias !23
  %36 = insertelement <2 x float> undef, float %35, i64 0
  %37 = shufflevector <2 x float> %36, <2 x float> undef, <2 x i32> zeroinitializer
  %38 = load <2 x i32>, <2 x i32>* %5, align 8, !tbaa !38
  %39 = load <2 x i32>, <2 x i32>* %6, align 8, !tbaa !38
  %40 = load <2 x float>, <2 x float>* %7, align 8, !tbaa !38
  %41 = extractelement <2 x i32> %38, i64 0
  %42 = tail call float @air.convert.f.f32.s.i32(i32 %41) #5
  %43 = insertelement <2 x float> undef, float %42, i64 0
  %44 = extractelement <2 x i32> %39, i64 0
  %45 = tail call float @air.convert.f.f32.s.i32(i32 %44) #5
  %46 = insertelement <2 x float> %43, float %45, i64 1
  %47 = fadd <2 x float> %46, <float 5.000000e-01, float 5.000000e-01>
  %48 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %47, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4
  %49 = extractvalue { <4 x float>, i8 } %48, 0
  %50 = shufflevector <4 x float> %49, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %51 = extractelement <2 x i32> %38, i64 1
  %52 = tail call float @air.convert.f.f32.s.i32(i32 %51) #5
  %53 = insertelement <2 x float> undef, float %52, i64 0
  %54 = insertelement <2 x float> %53, float %45, i64 1
  %55 = fadd <2 x float> %54, <float 5.000000e-01, float 5.000000e-01>
  %56 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %55, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4
  %57 = extractvalue { <4 x float>, i8 } %56, 0
  %58 = extractelement <2 x i32> %39, i64 1
  %59 = tail call float @air.convert.f.f32.s.i32(i32 %58) #5
  %60 = insertelement <2 x float> %43, float %59, i64 1
  %61 = fadd <2 x float> %60, <float 5.000000e-01, float 5.000000e-01>
  %62 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %61, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4
  %63 = extractvalue { <4 x float>, i8 } %62, 0
  %64 = shufflevector <4 x float> %63, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %65 = insertelement <2 x float> %53, float %59, i64 1
  %66 = fadd <2 x float> %65, <float 5.000000e-01, float 5.000000e-01>
  %67 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %66, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4
  %68 = extractvalue { <4 x float>, i8 } %67, 0
  %69 = shufflevector <2 x float> %40, <2 x float> undef, <2 x i32> zeroinitializer
  %70 = fsub <4 x float> %57, %49
  %71 = shufflevector <4 x float> %70, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %72 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %69, <2 x float> %71, <2 x float> %50) #8
  %73 = fsub <4 x float> %68, %63
  %74 = shufflevector <4 x float> %73, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %75 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %69, <2 x float> %74, <2 x float> %64) #8
  %76 = shufflevector <2 x float> %40, <2 x float> undef, <2 x i32> <i32 1, i32 1>
  %77 = fsub <2 x float> %75, %72
  %78 = tail call <2 x float> @llvm.fmuladd.v2f32(<2 x float> %76, <2 x float> %77, <2 x float> %72) #8
  %79 = fmul <2 x float> %37, %78
  %80 = shufflevector <2 x float> %79, <2 x float> undef, <4 x i32> <i32 0, i32 1, i32 0, i32 1>
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %3, <2 x i32> %1, <4 x float> %80, i32 0, i32 2) #2, !alias.scope !23, !noalias !26
  call void @llvm.lifetime.end.p0i8(i64 8, i8* nonnull %33) #8
  call void @llvm.lifetime.end.p0i8(i64 8, i8* nonnull %32) #8
  call void @llvm.lifetime.end.p0i8(i64 8, i8* nonnull %31) #8
  br label %81

81:                                               ; preds = %15, %11, %4
  ret void
}

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.end.p0i8(i64 immarg, i8* nocapture) #1

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #2

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <2 x float> @llvm.fmuladd.v2f32(<2 x float>, <2 x float>, <2 x float>) #3

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #4

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #5

; Function Attrs: argmemonly nounwind
define internal fastcc void @_ZN16soOFlowEstimator29soOFlowEstimator_clampedCoordEDv2_fDv2_iS1_PS1_S2_PS0_(<2 x float> %0, <2 x i32> %1, <2 x i32> %2, <2 x i32>* nocapture %3, <2 x i32>* nocapture %4, <2 x float>* nocapture %5) unnamed_addr #6 {
  %7 = extractelement <2 x float> %0, i64 0
  %8 = extractelement <2 x i32> %1, i64 0
  %9 = extractelement <2 x i32> %2, i64 0
  %10 = tail call i32 @air.convert.s.i32.f.f32(float %7) #5
  %11 = tail call float @air.convert.f.f32.s.i32(i32 %10) #5
  %12 = fsub float %7, %11
  %13 = tail call i32 @air.min.s.i32(i32 %10, i32 %9) #5
  %14 = tail call i32 @air.max.s.i32(i32 %13, i32 %8) #5
  %15 = insertelement <2 x i32> undef, i32 %14, i64 0
  %16 = add nsw i32 %10, 1
  %17 = tail call i32 @air.min.s.i32(i32 %16, i32 %9) #5
  %18 = tail call i32 @air.max.s.i32(i32 %17, i32 %8) #5
  %19 = insertelement <2 x i32> %15, i32 %18, i64 1
  store <2 x i32> %19, <2 x i32>* %3, align 8, !tbaa !38
  %20 = extractelement <2 x float> %0, i64 1
  %21 = extractelement <2 x i32> %1, i64 1
  %22 = extractelement <2 x i32> %2, i64 1
  %23 = tail call i32 @air.convert.s.i32.f.f32(float %20) #5
  %24 = tail call float @air.convert.f.f32.s.i32(i32 %23) #5
  %25 = fsub float %20, %24
  %26 = tail call i32 @air.min.s.i32(i32 %23, i32 %22) #5
  %27 = tail call i32 @air.max.s.i32(i32 %26, i32 %21) #5
  %28 = insertelement <2 x i32> undef, i32 %27, i64 0
  %29 = add nsw i32 %23, 1
  %30 = tail call i32 @air.min.s.i32(i32 %29, i32 %22) #5
  %31 = tail call i32 @air.max.s.i32(i32 %30, i32 %21) #5
  %32 = insertelement <2 x i32> %28, i32 %31, i64 1
  store <2 x i32> %32, <2 x i32>* %4, align 8, !tbaa !38
  %33 = insertelement <2 x float> undef, float %12, i64 0
  %34 = insertelement <2 x float> %33, float %25, i64 1
  store <2 x float> %34, <2 x float>* %5, align 8, !tbaa !38
  ret void
}

; Function Attrs: nounwind readnone
declare i32 @air.max.s.i32(i32, i32) local_unnamed_addr #5

; Function Attrs: nounwind readnone
declare i32 @air.min.s.i32(i32, i32) local_unnamed_addr #5

; Function Attrs: nounwind readnone
declare i32 @air.convert.s.i32.f.f32(float) local_unnamed_addr #5

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.start.p0i8(i64 immarg, i8* nocapture) #1

; Function Attrs: nounwind readnone
declare <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32>) local_unnamed_addr #5

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #7

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #7

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly nocallback nofree nosync nounwind willreturn }
attributes #2 = { argmemonly nounwind }
attributes #3 = { nocallback nofree nosync nounwind readnone speculatable willreturn }
attributes #4 = { argmemonly convergent nounwind readonly }
attributes #5 = { nounwind readnone }
attributes #6 = { argmemonly nounwind "frame-pointer"="all" "min-legal-vector-width"="64" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #7 = { argmemonly nounwind readonly }
attributes #8 = { nounwind }
attributes #9 = { nobuiltin "no-builtins" }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!llvm.ident = !{!8}
!air.version = !{!9}
!air.language_version = !{!10}
!air.compile_options = !{!11, !12, !13}
!air.kernel = !{!14}
!air.sampler_states = !{!22}

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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_resampleFlow_params" addrspace(2)*, <2 x i32>, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_resampleFlow", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 20, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_resampleFlow_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_prevDimX", i32 4, i32 4, i32 0, !"int", !"m_prevDimY", i32 8, i32 4, i32 0, !"float", !"m_flowInScaleX", i32 12, i32 4, i32 0, !"float", !"m_flowInScaleY", i32 16, i32 4, i32 0, !"float", !"m_scaleFlow"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coordOut"}
!20 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"flowIn"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"flowOut"}
!22 = !{!"air.sampler_state", i64 addrspace(2)* @__air_sampler_state}
!23 = !{!24}
!24 = distinct !{!24, !25, !"air-alias-scope-textures"}
!25 = distinct !{!25, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_resampleFlow)"}
!26 = !{!27}
!27 = distinct !{!27, !25, !"air-alias-scope-arg(0)"}
!28 = !{!29, !33, i64 8}
!29 = !{!"_ZTSN16soOFlowEstimator36soOFlowEstimator_resampleFlow_paramsE", !30, i64 0, !30, i64 4, !33, i64 8, !33, i64 12, !33, i64 16}
!30 = !{!"int", !31, i64 0}
!31 = !{!"omnipotent char", !32, i64 0}
!32 = !{!"Simple C++ TBAA"}
!33 = !{!"float", !31, i64 0}
!34 = !{!29, !33, i64 12}
!35 = !{!29, !30, i64 0}
!36 = !{!29, !30, i64 4}
!37 = !{!29, !33, i64 16}
!38 = !{!31, !31, i64 0}

