0x00000000004b80 -- Hgc2ColorBalanceNoClip:
source_filename = "Hgc2ColorBalanceNoClip"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t.6 = type opaque
%struct._sampler_t.7 = type opaque

; Function Attrs: convergent mustprogress nofree nounwind readonly willreturn
define <4 x float> @Hgc2ColorBalanceNoClip(<4 x float> %0, <4 x float> %1, <4 x float> %2, <4 x float> %3, <4 x float> %4, <4 x float> %5, <4 x float> %6, <4 x float> %7, <4 x float> %8, <4 x float> %9, float addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %10, %struct._texture_2d_t.6 addrspace(1)* %11, %struct._sampler_t.7 addrspace(2)* nocapture readonly %12) local_unnamed_addr #0 {
  %14 = getelementptr inbounds float, float addrspace(2)* %10, i64 1
  %15 = load float, float addrspace(2)* %14, align 4, !tbaa !32, !alias.scope !36, !noalias !39
  %16 = insertelement <4 x float> poison, float %15, i64 0
  %17 = getelementptr inbounds float, float addrspace(2)* %10, i64 2
  %18 = load float, float addrspace(2)* %17, align 4, !tbaa !32, !alias.scope !36, !noalias !39
  %19 = insertelement <4 x float> poison, float %18, i64 0
  %20 = getelementptr inbounds float, float addrspace(2)* %10, i64 3
  %21 = load float, float addrspace(2)* %20, align 4, !tbaa !32, !alias.scope !36, !noalias !39
  %22 = insertelement <4 x float> poison, float %21, i64 0
  %23 = shufflevector <4 x float> %22, <4 x float> poison, <4 x i32> zeroinitializer
  %24 = shufflevector <4 x float> %1, <4 x float> poison, <2 x i32> <i32 0, i32 1>
  %25 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.6 addrspace(1)* nocapture readonly %11, %struct._sampler_t.7 addrspace(2)* nocapture readonly %12, <2 x float> %24, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !alias.scope !39, !noalias !36
  %26 = extractvalue { <4 x float>, i8 } %25, 0
  %27 = shufflevector <4 x float> %26, <4 x float> undef, <4 x i32> <i32 3, i32 3, i32 3, i32 3>
  %28 = fmul fast <4 x float> %16, <float 2.000000e+00, float poison, float poison, float poison>
  %29 = shufflevector <4 x float> %28, <4 x float> poison, <4 x i32> zeroinitializer
  %30 = fmul fast <4 x float> %29, %27
  %31 = tail call fast <4 x float> @air.fast_fabs.v4f32(<4 x float> %30) #4
  %32 = shufflevector <4 x float> %31, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %33 = shufflevector <4 x float> %19, <4 x float> poison, <3 x i32> zeroinitializer
  %34 = tail call fast <3 x float> @air.fast_pow.v3f32(<3 x float> %32, <3 x float> %33) #4
  %35 = fneg fast <3 x float> %34
  %36 = shufflevector <4 x float> %30, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %37 = fcmp fast olt <3 x float> %36, zeroinitializer
  %38 = select reassoc nsz arcp contract afn <3 x i1> %37, <3 x float> %35, <3 x float> %34
  %39 = shufflevector <3 x float> %38, <3 x float> poison, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %40 = shufflevector <4 x float> %39, <4 x float> %30, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %41 = fsub fast <4 x float> %40, %26
  %42 = fmul fast <4 x float> %41, %23
  %43 = fadd fast <4 x float> %42, %26
  ret <4 x float> %43
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <3 x float> @air.fast_pow.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <4 x float> @air.fast_fabs.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.6 addrspace(1)* nocapture readonly, %struct._sampler_t.7 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #3 = { argmemonly convergent nounwind readonly willreturn }
attributes #4 = { nounwind readnone willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.fragment = !{!15}

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
!15 = !{<4 x float> (<4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, float addrspace(2)*, %struct._texture_2d_t.6 addrspace(1)*, %struct._sampler_t.7 addrspace(2)*)* @Hgc2ColorBalanceNoClip, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!18 = !{!19, !20, !21, !22, !23, !24, !25, !26, !27, !28, !29, !30, !31}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!21 = !{i32 2, !"air.fragment_input", !"user(texcoord1)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord1", !"air.arg_unused"}
!22 = !{i32 3, !"air.fragment_input", !"user(texcoord2)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord2", !"air.arg_unused"}
!23 = !{i32 4, !"air.fragment_input", !"user(texcoord3)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord3", !"air.arg_unused"}
!24 = !{i32 5, !"air.fragment_input", !"user(texcoord4)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord4", !"air.arg_unused"}
!25 = !{i32 6, !"air.fragment_input", !"user(texcoord5)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord5", !"air.arg_unused"}
!26 = !{i32 7, !"air.fragment_input", !"user(texcoord6)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord6", !"air.arg_unused"}
!27 = !{i32 8, !"air.fragment_input", !"user(texcoord7)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord7", !"air.arg_unused"}
!28 = !{i32 9, !"air.fragment_input", !"user(primary)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"color", !"air.arg_unused"}
!29 = !{i32 10, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"buffer"}
!30 = !{i32 11, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture0"}
!31 = !{i32 12, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler0"}
!32 = !{!33, !33, i64 0}
!33 = !{!"float", !34, i64 0}
!34 = !{!"omnipotent char", !35, i64 0}
!35 = !{!"Simple C++ TBAA"}
!36 = !{!37}
!37 = distinct !{!37, !38, !"air-alias-scope-arg(10)"}
!38 = distinct !{!38, !"air-alias-scopes(Hgc2ColorBalanceNoClip)"}
!39 = !{!40, !41}
!40 = distinct !{!40, !38, !"air-alias-scope-textures"}
!41 = distinct !{!41, !38, !"air-alias-scope-samplers"}

