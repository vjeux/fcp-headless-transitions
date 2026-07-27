0x00000000002486 -- Hgc2ComputeDeltaEITP:
source_filename = "Hgc2ComputeDeltaEITP"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct.fragmentUniforms = type { <4 x float> }
%struct._texture_2d_t.2 = type opaque
%struct._sampler_t.3 = type opaque

; Function Attrs: convergent nounwind readonly
define <4 x float> @Hgc2ComputeDeltaEITP(<4 x float> %0, <4 x float> %1, <4 x float> %2, <4 x float> %3, <4 x float> %4, <4 x float> %5, <4 x float> %6, <4 x float> %7, <4 x float> %8, <4 x float> %9, %struct.fragmentUniforms addrspace(2)* nocapture readnone dereferenceable(16) "air-buffer-no-alias" %10, %struct._texture_2d_t.2 addrspace(1)* nocapture readonly %11, %struct._texture_2d_t.2 addrspace(1)* nocapture readonly %12, %struct._sampler_t.3 addrspace(2)* nocapture readonly %13, %struct._sampler_t.3 addrspace(2)* nocapture readonly %14) local_unnamed_addr #0 {
  %16 = shufflevector <4 x float> %1, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %17 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.2 addrspace(1)* nocapture readonly %11, %struct._sampler_t.3 addrspace(2)* nocapture readonly %13, <2 x float> %16, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !34
  %18 = extractvalue { <4 x float>, i8 } %17, 0
  %19 = shufflevector <4 x float> %2, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %20 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.2 addrspace(1)* nocapture readonly %12, %struct._sampler_t.3 addrspace(2)* nocapture readonly %14, <2 x float> %19, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !34
  %21 = shufflevector <4 x float> %18, <4 x float> undef, <3 x i32> <i32 0, i32 1, i32 2>
  %22 = fcmp fast olt <3 x float> %21, zeroinitializer
  %23 = tail call i1 @air.any.v3i1(<3 x i1> %22) #1
  br i1 %23, label %93, label %24

24:                                               ; preds = %15
  %25 = extractvalue { <4 x float>, i8 } %20, 0
  %26 = shufflevector <4 x float> %25, <4 x float> undef, <3 x i32> <i32 0, i32 1, i32 2>
  %27 = fcmp fast olt <3 x float> %26, zeroinitializer
  %28 = tail call i1 @air.any.v3i1(<3 x i1> %27) #1
  br i1 %28, label %93, label %29

29:                                               ; preds = %24
  %30 = shufflevector <4 x float> %18, <4 x float> undef, <3 x i32> zeroinitializer
  %31 = fmul fast <3 x float> %30, <float 0x3FDA600000000000, float 0x3FC5580000000000, float 0x3F98C00000000000>
  %32 = shufflevector <4 x float> %18, <4 x float> undef, <3 x i32> <i32 1, i32 1, i32 1>
  %33 = fmul fast <3 x float> %32, <float 0x3FE0C40000000000, float 0x3FE70E0000000000, float 0x3FB3500000000000>
  %34 = fadd fast <3 x float> %31, %33
  %35 = shufflevector <4 x float> %18, <4 x float> undef, <3 x i32> <i32 2, i32 2, i32 2>
  %36 = fmul fast <3 x float> %35, <float 0x3FB0600000000000, float 0x3FBCE00000000000, float 0x3FECD00000000000>
  %37 = fadd fast <3 x float> %34, %36
  %38 = shufflevector <4 x float> %25, <4 x float> undef, <3 x i32> zeroinitializer
  %39 = fmul fast <3 x float> %38, <float 0x3FDA600000000000, float 0x3FC5580000000000, float 0x3F98C00000000000>
  %40 = shufflevector <4 x float> %25, <4 x float> undef, <3 x i32> <i32 1, i32 1, i32 1>
  %41 = fmul fast <3 x float> %40, <float 0x3FE0C40000000000, float 0x3FE70E0000000000, float 0x3FB3500000000000>
  %42 = fadd fast <3 x float> %39, %41
  %43 = shufflevector <4 x float> %25, <4 x float> undef, <3 x i32> <i32 2, i32 2, i32 2>
  %44 = fmul fast <3 x float> %43, <float 0x3FB0600000000000, float 0x3FBCE00000000000, float 0x3FECD00000000000>
  %45 = fadd fast <3 x float> %42, %44
  %46 = fmul fast <3 x float> %37, <float 0x3F1A36E2E0000000, float 0x3F1A36E2E0000000, float 0x3F1A36E2E0000000>
  %47 = fmul fast <3 x float> %45, <float 0x3F1A36E2E0000000, float 0x3F1A36E2E0000000, float 0x3F1A36E2E0000000>
  %48 = tail call fast <3 x float> @air.fast_pow.v3f32(<3 x float> %46, <3 x float> <float 0x3FC4640000000000, float 0x3FC4640000000000, float 0x3FC4640000000000>) #1
  %49 = tail call fast <3 x float> @air.fast_pow.v3f32(<3 x float> %47, <3 x float> <float 0x3FC4640000000000, float 0x3FC4640000000000, float 0x3FC4640000000000>) #1
  %50 = fmul fast <3 x float> %48, <float 0x4032DA0000000000, float 0x4032DA0000000000, float 0x4032DA0000000000>
  %51 = fadd fast <3 x float> %50, <float 0x3FEAC00000000000, float 0x3FEAC00000000000, float 0x3FEAC00000000000>
  %52 = fmul fast <3 x float> %48, <float 1.868750e+01, float 1.868750e+01, float 1.868750e+01>
  %53 = fadd fast <3 x float> %52, <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>
  %54 = fdiv fast <3 x float> %51, %53
  %55 = tail call fast <3 x float> @air.fast_pow.v3f32(<3 x float> %54, <3 x float> <float 0x4053B60000000000, float 0x4053B60000000000, float 0x4053B60000000000>) #1
  %56 = fmul fast <3 x float> %49, <float 0x4032DA0000000000, float 0x4032DA0000000000, float 0x4032DA0000000000>
  %57 = fadd fast <3 x float> %56, <float 0x3FEAC00000000000, float 0x3FEAC00000000000, float 0x3FEAC00000000000>
  %58 = fmul fast <3 x float> %49, <float 1.868750e+01, float 1.868750e+01, float 1.868750e+01>
  %59 = fadd fast <3 x float> %58, <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>
  %60 = fdiv fast <3 x float> %57, %59
  %61 = tail call fast <3 x float> @air.fast_pow.v3f32(<3 x float> %60, <3 x float> <float 0x4053B60000000000, float 0x4053B60000000000, float 0x4053B60000000000>) #1
  %62 = shufflevector <3 x float> %55, <3 x float> undef, <3 x i32> zeroinitializer
  %63 = fmul fast <3 x float> %62, <float 5.000000e-01, float 0x3FF9D20000000000, float 0x4011834000000000>
  %64 = shufflevector <3 x float> %55, <3 x float> undef, <3 x i32> <i32 1, i32 1, i32 1>
  %65 = fmul fast <3 x float> %64, <float 5.000000e-01, float 0xC00A968000000000, float 0xC010FB8000000000>
  %66 = fadd fast <3 x float> %63, %65
  %67 = shufflevector <3 x float> %55, <3 x float> undef, <3 x i32> <i32 2, i32 2, i32 2>
  %68 = fmul fast <3 x float> %67, <float 0.000000e+00, float 0x3FFB5B0000000000, float 0xBFC0F80000000000>
  %69 = fadd fast <3 x float> %66, %68
  %70 = shufflevector <3 x float> %61, <3 x float> undef, <3 x i32> zeroinitializer
  %71 = fmul fast <3 x float> %70, <float 5.000000e-01, float 0x3FF9D20000000000, float 0x4011834000000000>
  %72 = shufflevector <3 x float> %61, <3 x float> undef, <3 x i32> <i32 1, i32 1, i32 1>
  %73 = fmul fast <3 x float> %72, <float 5.000000e-01, float 0xC00A968000000000, float 0xC010FB8000000000>
  %74 = fadd fast <3 x float> %71, %73
  %75 = shufflevector <3 x float> %61, <3 x float> undef, <3 x i32> <i32 2, i32 2, i32 2>
  %76 = fmul fast <3 x float> %75, <float 0.000000e+00, float 0x3FFB5B0000000000, float 0xBFC0F80000000000>
  %77 = fadd fast <3 x float> %74, %76
  %78 = extractelement <3 x float> %69, i64 1
  %79 = fmul fast float %78, 5.000000e-01
  %80 = insertelement <3 x float> %69, float %79, i64 1
  %81 = shufflevector <3 x float> %80, <3 x float> %69, <3 x i32> <i32 0, i32 1, i32 5>
  %82 = extractelement <3 x float> %77, i64 1
  %83 = fmul fast float %82, 5.000000e-01
  %84 = insertelement <3 x float> %77, float %83, i64 1
  %85 = shufflevector <3 x float> %84, <3 x float> %77, <3 x i32> <i32 0, i32 1, i32 5>
  %86 = fsub fast <3 x float> %81, %85
  %87 = tail call fast float @air.dot.v3f32(<3 x float> %86, <3 x float> %86) #1
  %88 = tail call fast float @air.fast_sqrt.f32(float %87) #1
  %89 = fmul fast float %88, 7.200000e+02
  %90 = insertelement <4 x float> <float undef, float undef, float undef, float 1.000000e+00>, float %89, i64 0
  %91 = insertelement <4 x float> %90, float %89, i64 1
  %92 = insertelement <4 x float> %91, float %89, i64 2
  br label %93

93:                                               ; preds = %29, %24, %15
  %94 = phi <4 x float> [ %92, %29 ], [ <float 0.000000e+00, float 0.000000e+00, float 0.000000e+00, float 1.000000e+00>, %24 ], [ <float 0.000000e+00, float 0.000000e+00, float 0.000000e+00, float 1.000000e+00>, %15 ]
  ret <4 x float> %94
}

; Function Attrs: nounwind readnone
declare float @air.fast_sqrt.f32(float) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <3 x float> @air.fast_pow.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare i1 @air.any.v3i1(<3 x i1>) local_unnamed_addr #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.2 addrspace(1)* nocapture readonly, %struct._sampler_t.3 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { nounwind readnone }
attributes #2 = { argmemonly convergent nounwind readonly }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!llvm.ident = !{!8}
!air.version = !{!9}
!air.language_version = !{!10}
!air.compile_options = !{!11, !12, !13}
!air.fragment = !{!14}

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
!12 = !{!"air.compile.fast_math_enable"}
!13 = !{!"air.compile.framebuffer_fetch_enable"}
!14 = !{<4 x float> (<4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, <4 x float>, %struct.fragmentUniforms addrspace(2)*, %struct._texture_2d_t.2 addrspace(1)*, %struct._texture_2d_t.2 addrspace(1)*, %struct._sampler_t.3 addrspace(2)*, %struct._sampler_t.3 addrspace(2)*)* @Hgc2ComputeDeltaEITP, !15, !17}
!15 = !{!16}
!16 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!17 = !{!18, !19, !20, !21, !22, !23, !24, !25, !26, !27, !28, !30, !31, !32, !33}
!18 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!19 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!20 = !{i32 2, !"air.fragment_input", !"user(texcoord1)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord1"}
!21 = !{i32 3, !"air.fragment_input", !"user(texcoord2)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord2"}
!22 = !{i32 4, !"air.fragment_input", !"user(texcoord3)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord3"}
!23 = !{i32 5, !"air.fragment_input", !"user(texcoord4)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord4"}
!24 = !{i32 6, !"air.fragment_input", !"user(texcoord5)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord5"}
!25 = !{i32 7, !"air.fragment_input", !"user(texcoord6)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord6"}
!26 = !{i32 8, !"air.fragment_input", !"user(texcoord7)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord7"}
!27 = !{i32 9, !"air.fragment_input", !"user(primary)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!28 = !{i32 10, !"air.buffer", !"air.buffer_size", i32 16, !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !29, !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"fragmentUniforms", !"air.arg_name", !"uniforms"}
!29 = !{i32 0, i32 16, i32 0, !"float4", !"outputModeAndThesholds"}
!30 = !{i32 11, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"tex0"}
!31 = !{i32 12, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"tex1"}
!32 = !{i32 13, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"smplr0"}
!33 = !{i32 14, !"air.sampler", !"air.location_index", i32 1, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"smplr1"}
!34 = !{!35, !37}
!35 = distinct !{!35, !36, !"air-alias-scope-textures"}
!36 = distinct !{!36, !"air-alias-scopes(Hgc2ComputeDeltaEITP)"}
!37 = distinct !{!37, !36, !"air-alias-scope-samplers"}

