0x00000000019ad9 -- blurDepthFragmentFunc:
source_filename = "blurDepthFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._depth_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state.2 = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8

; Function Attrs: convergent mustprogress nofree nounwind readonly willreturn
define <{ float }> @blurDepthFragmentFunc(<4 x float> %0, <2 x float> %1, %struct._depth_2d_t addrspace(1)* %2, <2 x float> addrspace(2)* nocapture noundef readonly align 8 dereferenceable(8) "air-buffer-no-alias" %3, i8 addrspace(2)* nocapture noundef readonly align 1 dereferenceable(1) "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = alloca [7 x float], align 4
  %7 = bitcast [7 x float]* %6 to i8*
  call void @llvm.lifetime.start.p0i8(i64 28, i8* nonnull %7) #4
  %8 = getelementptr inbounds [7 x float], [7 x float]* %6, i64 0, i64 0
  store float 1.562500e-02, float* %8, align 4
  %9 = getelementptr inbounds [7 x float], [7 x float]* %6, i64 0, i64 1
  store float 9.375000e-02, float* %9, align 4
  %10 = getelementptr inbounds [7 x float], [7 x float]* %6, i64 0, i64 2
  store float 2.343750e-01, float* %10, align 4
  %11 = getelementptr inbounds [7 x float], [7 x float]* %6, i64 0, i64 3
  store float 3.125000e-01, float* %11, align 4
  %12 = getelementptr inbounds [7 x float], [7 x float]* %6, i64 0, i64 4
  store float 2.343750e-01, float* %12, align 4
  %13 = getelementptr inbounds [7 x float], [7 x float]* %6, i64 0, i64 5
  store float 9.375000e-02, float* %13, align 4
  %14 = getelementptr inbounds [7 x float], [7 x float]* %6, i64 0, i64 6
  store float 1.562500e-02, float* %14, align 4
  %15 = load <2 x float>, <2 x float> addrspace(2)* %3, align 8, !tbaa !25, !alias.scope !28, !noalias !31
  br label %19

16:                                               ; preds = %19
  %17 = load i8, i8 addrspace(2)* %4, align 1, !tbaa !34, !range !36, !alias.scope !37, !noalias !38
  %18 = icmp eq i8 %17, 0
  br i1 %18, label %37, label %41

19:                                               ; preds = %19, %5
  %20 = phi float [ 0.000000e+00, %5 ], [ %34, %19 ]
  %21 = phi i32 [ 0, %5 ], [ %35, %19 ]
  %22 = add nsw i32 %21, -3
  %23 = tail call fast float @air.convert.f.f32.s.i32(i32 %22) #5
  %24 = insertelement <2 x float> poison, float %23, i64 0
  %25 = shufflevector <2 x float> %24, <2 x float> poison, <2 x i32> zeroinitializer
  %26 = fmul fast <2 x float> %25, %15
  %27 = zext i32 %21 to i64
  %28 = getelementptr inbounds [7 x float], [7 x float]* %6, i64 0, i64 %27
  %29 = load float, float* %28, align 4, !tbaa !39
  %30 = fadd fast <2 x float> %26, %1
  %31 = tail call { float, i8 } @air.sample_depth_2d.f32(%struct._depth_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), i32 1, <2 x float> %30, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #6
  %32 = extractvalue { float, i8 } %31, 0
  %33 = fmul fast float %32, %29
  %34 = fadd fast float %33, %20
  %35 = add nuw nsw i32 %21, 1
  %36 = icmp eq i32 %35, 7
  br i1 %36, label %16, label %19, !llvm.loop !41

37:                                               ; preds = %16
  %38 = tail call { float, i8 } @air.sample_depth_2d.f32(%struct._depth_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), i32 1, <2 x float> %1, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #6
  %39 = extractvalue { float, i8 } %38, 0
  %40 = tail call fast float @air.fast_fmax.f32(float %34, float %39) #5
  br label %41

41:                                               ; preds = %37, %16
  %42 = phi float [ %40, %37 ], [ %34, %16 ]
  call void @llvm.lifetime.end.p0i8(i64 28, i8* nonnull %7) #4
  %43 = insertvalue <{ float }> undef, float %42, 0
  ret <{ float }> %43
}

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.end.p0i8(i64 immarg, i8* nocapture) #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmax.f32(float, float) local_unnamed_addr #2

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { float, i8 } @air.sample_depth_2d.f32(%struct._depth_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, i32, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #2

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.start.p0i8(i64 immarg, i8* nocapture) #1

attributes #0 = { convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly nocallback nofree nosync nounwind willreturn }
attributes #2 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #3 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #4 = { nounwind }
attributes #5 = { nounwind readnone willreturn }
attributes #6 = { argmemonly convergent nounwind readonly willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.fragment = !{!15}
!air.sampler_states = !{!24}

!0 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!1 = !{i32 1, !"wchar_size", i32 4}
!2 = !{i32 7, !"frame-pointer", i32 2}
!3 = !{i32 7, !"air.max_device_buffers", i32 31}
!4 = !{i32 7, !"air.max_constant_buffers", i32 31}
!5 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!6 = !{i32 7, !"air.max_textures", i32 128}
!7 = !{i32 7, !"air.max_read_write_textures", i32 8}
!8 = !{i32 7, !"air.max_samplers", i32 16}
!9 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!10 = !{i32 2, i32 7, i32 0}
!11 = !{!"Metal", i32 3, i32 2, i32 0}
!12 = !{!"air.compile.denorms_disable"}
!13 = !{!"air.compile.fast_math_enable"}
!14 = !{!"air.compile.framebuffer_fetch_enable"}
!15 = !{<{ float }> (<4 x float>, <2 x float>, %struct._depth_2d_t addrspace(1)*, <2 x float> addrspace(2)*, i8 addrspace(2)*)* @blurDepthFragmentFunc, !16, !18}
!16 = !{!17}
!17 = !{!"air.depth", !"air.depth_qualifier", !"air.any", !"air.arg_type_name", !"float", !"air.arg_name", !"z"}
!18 = !{!19, !20, !21, !22, !23}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(2uvDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"uv"}
!21 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"depth2d<float, sample>", !"air.arg_name", !"tex"}
!22 = !{i32 3, !"air.buffer", !"air.buffer_size", i32 8, !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"float2", !"air.arg_name", !"directionUV"}
!23 = !{i32 4, !"air.buffer", !"air.buffer_size", i32 1, !"air.location_index", i32 3, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 1, !"air.arg_type_align_size", i32 1, !"air.arg_type_name", !"bool", !"air.arg_name", !"preserveEnergy"}
!24 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state.2}
!25 = !{!26, !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(3)"}
!30 = distinct !{!30, !"air-alias-scopes(blurDepthFragmentFunc)"}
!31 = !{!32, !33}
!32 = distinct !{!32, !30, !"air-alias-scope-textures"}
!33 = distinct !{!33, !30, !"air-alias-scope-arg(4)"}
!34 = !{!35, !35, i64 0}
!35 = !{!"bool", !26, i64 0}
!36 = !{i8 0, i8 2}
!37 = !{!33}
!38 = !{!32, !29}
!39 = !{!40, !40, i64 0}
!40 = !{!"float", !26, i64 0}
!41 = distinct !{!41, !42}
!42 = !{!"llvm.loop.mustprogress"}

