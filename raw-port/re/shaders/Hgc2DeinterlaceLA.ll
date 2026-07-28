0x00000000000426 -- Hgc2DeinterlaceLA:
source_filename = "Hgc2DeinterlaceLA"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant i64 -9188470239253725111, align 8

; Function Attrs: convergent nounwind readonly
define <4 x float> @Hgc2DeinterlaceLA(<4 x float> %0, <4 x float> %1, %struct._texture_2d_t addrspace(1)* %2, <4 x float> addrspace(2)* nocapture readonly "air-buffer-no-alias" %3) local_unnamed_addr #0 {
  %5 = load <4 x float>, <4 x float> addrspace(2)* %3, align 16, !alias.scope !23, !noalias !26
  %6 = extractelement <4 x float> %5, i64 0
  %7 = extractelement <4 x float> %5, i64 2
  %8 = extractelement <4 x float> %1, i64 1
  %9 = tail call fast float @air.fast_floor.f32(float %8) #2
  %10 = tail call fast float @air.fast_fmod.f32(float %9, float 2.000000e+00) #2
  %11 = fcmp fast oeq float %10, %6
  br i1 %11, label %12, label %16

12:                                               ; preds = %4
  %13 = shufflevector <4 x float> %1, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %14 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %13, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %15 = extractvalue { <4 x float>, i8 } %14, 0
  br label %48

16:                                               ; preds = %4
  %17 = extractelement <4 x float> %5, i64 1
  %18 = fcmp fast ugt float %9, %17
  br i1 %18, label %26, label %19

19:                                               ; preds = %16
  %20 = extractelement <4 x float> %1, i64 0
  %21 = insertelement <2 x float> undef, float %20, i64 0
  %22 = fadd fast float %8, 1.000000e+00
  %23 = insertelement <2 x float> %21, float %22, i64 1
  %24 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %23, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %25 = extractvalue { <4 x float>, i8 } %24, 0
  br label %48

26:                                               ; preds = %16
  %27 = fadd fast float %7, -1.000000e+00
  %28 = fcmp fast ult float %9, %27
  br i1 %28, label %36, label %29

29:                                               ; preds = %26
  %30 = extractelement <4 x float> %1, i64 0
  %31 = insertelement <2 x float> undef, float %30, i64 0
  %32 = fadd fast float %8, -1.000000e+00
  %33 = insertelement <2 x float> %31, float %32, i64 1
  %34 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %33, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %35 = extractvalue { <4 x float>, i8 } %34, 0
  br label %48

36:                                               ; preds = %26
  %37 = shufflevector <4 x float> %1, <4 x float> undef, <2 x i32> <i32 0, i32 undef>
  %38 = fadd fast float %8, 1.000000e+00
  %39 = insertelement <2 x float> %37, float %38, i64 1
  %40 = fadd fast float %8, -1.000000e+00
  %41 = insertelement <2 x float> %37, float %40, i64 1
  %42 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %39, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %43 = extractvalue { <4 x float>, i8 } %42, 0
  %44 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %41, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %45 = extractvalue { <4 x float>, i8 } %44, 0
  %46 = fadd fast <4 x float> %45, %43
  %47 = fmul fast <4 x float> %46, <float 5.000000e-01, float 5.000000e-01, float 5.000000e-01, float 5.000000e-01>
  br label %48

48:                                               ; preds = %36, %29, %19, %12
  %49 = phi <4 x float> [ %15, %12 ], [ %25, %19 ], [ %35, %29 ], [ %47, %36 ]
  ret <4 x float> %49
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare float @air.fast_fmod.f32(float, float) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare float @air.fast_floor.f32(float) local_unnamed_addr #2

attributes #0 = { convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { nounwind readnone }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!llvm.ident = !{!8}
!air.version = !{!9}
!air.language_version = !{!10}
!air.compile_options = !{!11, !12, !13}
!air.fragment = !{!14}
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
!12 = !{!"air.compile.fast_math_enable"}
!13 = !{!"air.compile.framebuffer_fetch_enable"}
!14 = !{<4 x float> (<4 x float>, <4 x float>, %struct._texture_2d_t addrspace(1)*, <4 x float> addrspace(2)*)* @Hgc2DeinterlaceLA, !15, !17}
!15 = !{!16}
!16 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!17 = !{!18, !19, !20, !21}
!18 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!19 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!20 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture0"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"params"}
!22 = !{!"air.sampler_state", i64 addrspace(2)* @__air_sampler_state}
!23 = !{!24}
!24 = distinct !{!24, !25, !"air-alias-scope-arg(3)"}
!25 = distinct !{!25, !"air-alias-scopes(Hgc2DeinterlaceLA)"}
!26 = !{!27}
!27 = distinct !{!27, !25, !"air-alias-scope-textures"}

