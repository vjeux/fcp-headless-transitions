0x00000000020279 -- colorDownsampleFragmentFunc:
source_filename = "colorDownsampleFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state.2 = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8

; Function Attrs: convergent mustprogress nofree nounwind readonly willreturn
define <4 x float> @colorDownsampleFragmentFunc(<4 x float> %0, <2 x float> %1, %struct._texture_2d_t addrspace(1)* %2, i32 addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %3, float addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %4, float addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %5, float addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %6) local_unnamed_addr #0 {
  %8 = load i32, i32 addrspace(2)* %3, align 4, !tbaa !27, !alias.scope !31, !noalias !34
  %9 = icmp eq i32 %8, 0
  br i1 %9, label %10, label %16

10:                                               ; preds = %16, %7
  %11 = phi <4 x float> [ zeroinitializer, %7 ], [ %38, %16 ]
  %12 = extractelement <4 x float> %11, i64 3
  %13 = tail call fast float @air.fast_fmin.f32(float %12, float 1.000000e+00) #3
  %14 = tail call fast float @air.fast_fmax.f32(float %13, float 0.000000e+00) #3
  %15 = insertelement <4 x float> %11, float %14, i64 3
  ret <4 x float> %15

16:                                               ; preds = %16, %7
  %17 = phi <4 x float> [ %38, %16 ], [ zeroinitializer, %7 ]
  %18 = phi i32 [ %39, %16 ], [ 0, %7 ]
  %19 = zext i32 %18 to i64
  %20 = getelementptr inbounds float, float addrspace(2)* %5, i64 %19
  %21 = load float, float addrspace(2)* %20, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %22 = insertelement <2 x float> undef, float %21, i64 0
  %23 = getelementptr inbounds float, float addrspace(2)* %6, i64 %19
  %24 = load float, float addrspace(2)* %23, align 4, !tbaa !39, !alias.scope !43, !noalias !44
  %25 = insertelement <2 x float> %22, float %24, i64 1
  %26 = getelementptr inbounds float, float addrspace(2)* %4, i64 %19
  %27 = load float, float addrspace(2)* %26, align 4, !tbaa !39, !alias.scope !45, !noalias !46
  %28 = fadd fast <2 x float> %25, %1
  %29 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %28, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4
  %30 = extractvalue { <4 x float>, i8 } %29, 0
  %31 = fsub fast <2 x float> %1, %25
  %32 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %31, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4
  %33 = extractvalue { <4 x float>, i8 } %32, 0
  %34 = fadd fast <4 x float> %33, %30
  %35 = insertelement <4 x float> poison, float %27, i64 0
  %36 = shufflevector <4 x float> %35, <4 x float> poison, <4 x i32> zeroinitializer
  %37 = fmul fast <4 x float> %34, %36
  %38 = fadd fast <4 x float> %37, %17
  %39 = add nuw i32 %18, 1
  %40 = icmp eq i32 %39, %8
  br i1 %40, label %10, label %16, !llvm.loop !47
}

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmax.f32(float, float) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmin.f32(float, float) local_unnamed_addr #2

attributes #0 = { convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #2 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #3 = { nounwind readnone willreturn }
attributes #4 = { argmemonly convergent nounwind readonly willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.fragment = !{!15}
!air.sampler_states = !{!26}

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
!15 = !{<4 x float> (<4 x float>, <2 x float>, %struct._texture_2d_t addrspace(1)*, i32 addrspace(2)*, float addrspace(2)*, float addrspace(2)*, float addrspace(2)*)* @colorDownsampleFragmentFunc, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!18 = !{!19, !20, !21, !22, !23, !24, !25}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(2uvDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"uv"}
!21 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"inputTex"}
!22 = !{i32 3, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"numSamples"}
!23 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"weights"}
!24 = !{i32 5, !"air.buffer", !"air.location_index", i32 4, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"xOffsets"}
!25 = !{i32 6, !"air.buffer", !"air.location_index", i32 5, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"yOffsets"}
!26 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state.2}
!27 = !{!28, !28, i64 0}
!28 = !{!"int", !29, i64 0}
!29 = !{!"omnipotent char", !30, i64 0}
!30 = !{!"Simple C++ TBAA"}
!31 = !{!32}
!32 = distinct !{!32, !33, !"air-alias-scope-arg(3)"}
!33 = distinct !{!33, !"air-alias-scopes(colorDownsampleFragmentFunc)"}
!34 = !{!35, !36, !37, !38}
!35 = distinct !{!35, !33, !"air-alias-scope-textures"}
!36 = distinct !{!36, !33, !"air-alias-scope-arg(4)"}
!37 = distinct !{!37, !33, !"air-alias-scope-arg(5)"}
!38 = distinct !{!38, !33, !"air-alias-scope-arg(6)"}
!39 = !{!40, !40, i64 0}
!40 = !{!"float", !29, i64 0}
!41 = !{!37}
!42 = !{!35, !32, !36, !38}
!43 = !{!38}
!44 = !{!35, !32, !36, !37}
!45 = !{!36}
!46 = !{!35, !32, !37, !38}
!47 = distinct !{!47, !48}
!48 = !{!"llvm.loop.mustprogress"}

