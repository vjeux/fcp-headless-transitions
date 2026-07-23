
/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Resources/HeliumRenderHgcMetalShaders_derived.metallib:	file format metallib
Disassembly of section MODULE_LIST:

0x00000000000672 -- Hgc2LensGDC_BL:
source_filename = "Hgc2LensGDC_BL"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct.LensGDCShaderParameters = type { float, float, float, [15 x float], float, float, i8 }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant i64 -9188470239253722624, align 8

; Function Attrs: argmemonly convergent nounwind readonly
define <4 x float> @Hgc2LensGDC_BL(<4 x float> %0, <4 x float> %1, %struct.LensGDCShaderParameters addrspace(2)* nocapture readnone dereferenceable(84) "air-buffer-no-alias" %2, %struct._texture_2d_t addrspace(1)* nocapture readonly %3) local_unnamed_addr #0 {
  %5 = shufflevector <4 x float> %1, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %6 = tail call fast fastcc <2 x float> @_ZL3gdcRU11MTLconstantK23LensGDCShaderParametersDv2_f(%struct.LensGDCShaderParameters addrspace(2)* dereferenceable(84) %2, <2 x float> %5) #4
  %7 = fadd fast <2 x float> %6, <float 5.000000e-01, float 5.000000e-01>
  %8 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %7, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %9 = extractvalue { <4 x float>, i8 } %8, 0
  %10 = insertelement <4 x float> %9, float 1.000000e+00, i64 3
  ret <4 x float> %10
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
define internal fastcc <2 x float> @_ZL3gdcRU11MTLconstantK23LensGDCShaderParametersDv2_f(%struct.LensGDCShaderParameters addrspace(2)* nocapture readonly dereferenceable(84) %0, <2 x float> %1) unnamed_addr #2 {
  %3 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 0
  %4 = load float, float addrspace(2)* %3, align 4, !tbaa !24
  %5 = insertelement <2 x float> undef, float %4, i64 0
  %6 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 1
  %7 = load float, float addrspace(2)* %6, align 4, !tbaa !30
  %8 = insertelement <2 x float> %5, float %7, i64 1
  %9 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 2
  %10 = load float, float addrspace(2)* %9, align 4, !tbaa !31
  %11 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 0
  %12 = load float, float addrspace(2)* %11, align 4, !tbaa !32
  %13 = insertelement <4 x float> undef, float %12, i64 0
  %14 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 1
  %15 = load float, float addrspace(2)* %14, align 4, !tbaa !32
  %16 = insertelement <4 x float> %13, float %15, i64 1
  %17 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 2
  %18 = load float, float addrspace(2)* %17, align 4, !tbaa !32
  %19 = insertelement <4 x float> %16, float %18, i64 2
  %20 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 3
  %21 = load float, float addrspace(2)* %20, align 4, !tbaa !32
  %22 = insertelement <4 x float> %19, float %21, i64 3
  %23 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 4
  %24 = load float, float addrspace(2)* %23, align 4, !tbaa !32
  %25 = insertelement <4 x float> undef, float %24, i64 0
  %26 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 5
  %27 = load float, float addrspace(2)* %26, align 4, !tbaa !32
  %28 = insertelement <4 x float> %25, float %27, i64 1
  %29 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 6
  %30 = load float, float addrspace(2)* %29, align 4, !tbaa !32
  %31 = insertelement <4 x float> %28, float %30, i64 2
  %32 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 7
  %33 = load float, float addrspace(2)* %32, align 4, !tbaa !32
  %34 = insertelement <4 x float> %31, float %33, i64 3
  %35 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 8
  %36 = load float, float addrspace(2)* %35, align 4, !tbaa !32
  %37 = insertelement <4 x float> undef, float %36, i64 0
  %38 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 9
  %39 = load float, float addrspace(2)* %38, align 4, !tbaa !32
  %40 = insertelement <4 x float> %37, float %39, i64 1
  %41 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 10
  %42 = load float, float addrspace(2)* %41, align 4, !tbaa !32
  %43 = insertelement <4 x float> %40, float %42, i64 2
  %44 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 11
  %45 = load float, float addrspace(2)* %44, align 4, !tbaa !32
  %46 = insertelement <4 x float> %43, float %45, i64 3
  %47 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 12
  %48 = load float, float addrspace(2)* %47, align 4, !tbaa !32
  %49 = insertelement <3 x float> undef, float %48, i64 0
  %50 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 13
  %51 = load float, float addrspace(2)* %50, align 4, !tbaa !32
  %52 = insertelement <3 x float> %49, float %51, i64 1
  %53 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 3, i64 14
  %54 = load float, float addrspace(2)* %53, align 4, !tbaa !32
  %55 = insertelement <3 x float> %52, float %54, i64 2
  %56 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 4
  %57 = load float, float addrspace(2)* %56, align 4, !tbaa !33
  %58 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 5
  %59 = load float, float addrspace(2)* %58, align 4, !tbaa !34
  %60 = getelementptr inbounds %struct.LensGDCShaderParameters, %struct.LensGDCShaderParameters addrspace(2)* %0, i64 0, i32 6
  %61 = load i8, i8 addrspace(2)* %60, align 4, !tbaa !35, !range !36
  %62 = icmp eq i8 %61, 0
  %63 = fsub fast <2 x float> %1, %8
  %64 = tail call fast float @air.dot.v2f32(<2 x float> %63, <2 x float> %63) #3
  %65 = tail call fast float @air.fast_sqrt.f32(float %64) #3
  %66 = fmul fast float %65, %10
  %67 = tail call fast float @air.fast_clamp.f32(float %66, float %57, float %59) #3
  %68 = fmul fast float %67, %67
  %69 = fmul fast float %68, %67
  %70 = fmul fast float %68, %68
  %71 = insertelement <4 x float> <float 1.000000e+00, float undef, float undef, float undef>, float %67, i64 1
  %72 = insertelement <4 x float> %71, float %68, i64 2
  %73 = insertelement <4 x float> %72, float %69, i64 3
  %74 = shufflevector <4 x float> %72, <4 x float> undef, <3 x i32> <i32 0, i32 1, i32 2>
  %75 = tail call fast float @air.dot.v3f32(<3 x float> %55, <3 x float> %74) #3
  %76 = fmul fast float %70, %75
  %77 = tail call fast float @air.dot.v4f32(<4 x float> %46, <4 x float> %73) #3
  %78 = fadd fast float %76, %77
  %79 = fmul fast float %78, %70
  %80 = tail call fast float @air.dot.v4f32(<4 x float> %34, <4 x float> %73) #3
  %81 = fadd fast float %79, %80
  %82 = fmul fast float %81, %70
  %83 = tail call fast float @air.dot.v4f32(<4 x float> %22, <4 x float> %73) #3
  %84 = fadd fast float %82, %83
  %85 = insertelement <2 x float> undef, float %84, i64 0
  %86 = shufflevector <2 x float> %85, <2 x float> undef, <2 x i32> zeroinitializer
  br i1 %62, label %89, label %87

87:                                               ; preds = %2
  %88 = fdiv fast <2 x float> %63, %86
  br label %91

89:                                               ; preds = %2
  %90 = fmul fast <2 x float> %86, %63
  br label %91

91:                                               ; preds = %89, %87
  %92 = phi <2 x float> [ %88, %87 ], [ %90, %89 ]
  %93 = fadd fast <2 x float> %92, %8
  ret <2 x float> %93
}

; Function Attrs: nounwind readnone
declare float @air.dot.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare float @air.fast_clamp.f32(float, float, float) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare float @air.fast_sqrt.f32(float) local_unnamed_addr #3

; Function Attrs: nounwind readnone
declare float @air.dot.v2f32(<2 x float>, <2 x float>) local_unnamed_addr #3

attributes #0 = { argmemonly convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { nounwind readnone "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #3 = { nounwind readnone }
attributes #4 = { nobuiltin "no-builtins" }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!llvm.ident = !{!8}
!air.version = !{!9}
!air.language_version = !{!10}
!air.compile_options = !{!11, !12, !13}
!air.fragment = !{!14}
!air.sampler_states = !{!23}

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
!14 = !{<4 x float> (<4 x float>, <4 x float>, %struct.LensGDCShaderParameters addrspace(2)*, %struct._texture_2d_t addrspace(1)*)* @Hgc2LensGDC_BL, !15, !17}
!15 = !{!16}
!16 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!17 = !{!18, !19, !20, !22}
!18 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!19 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!20 = !{i32 2, !"air.buffer", !"air.buffer_size", i32 84, !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !21, !"air.arg_type_size", i32 84, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"LensGDCShaderParameters", !"air.arg_name", !"parameters"}
!21 = !{i32 0, i32 4, i32 0, !"float", !"cx", i32 4, i32 4, i32 0, !"float", !"cy", i32 8, i32 4, i32 0, !"float", !"oneOverM", i32 12, i32 4, i32 15, !"float", !"k", i32 72, i32 4, i32 0, !"float", !"minRadius", i32 76, i32 4, i32 0, !"float", !"maxRadius", i32 80, i32 1, i32 0, !"bool", !"reciprocalScaling"}
!22 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"inTexture"}
!23 = !{!"air.sampler_state", i64 addrspace(2)* @__air_sampler_state}
!24 = !{!25, !26, i64 0}
!25 = !{!"_ZTS23LensGDCShaderParameters", !26, i64 0, !26, i64 4, !26, i64 8, !27, i64 12, !26, i64 72, !26, i64 76, !29, i64 80}
!26 = !{!"float", !27, i64 0}
!27 = !{!"omnipotent char", !28, i64 0}
!28 = !{!"Simple C++ TBAA"}
!29 = !{!"bool", !27, i64 0}
!30 = !{!25, !26, i64 4}
!31 = !{!25, !26, i64 8}
!32 = !{!26, !26, i64 0}
!33 = !{!25, !26, i64 72}
!34 = !{!25, !26, i64 76}
!35 = !{!25, !29, i64 80}
!36 = !{i8 0, i8 2}

0x00000000001cf2 -- Hgc2LensGDC_BC:
source_filename = "Hgc2LensGDC_BC"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct.LensGDCShaderParameters.0 = type { float, float, float, [15 x float], float, float, i8 }
%struct._texture_2d_t.1 = type opaque
%struct._sampler_t.2 = type opaque

@__air_sampler_state.1 = internal addrspace(2) constant i64 -9188470239253725184, align 8

; Function Attrs: convergent nounwind readonly
define <4 x float> @Hgc2LensGDC_BC(<4 x float> %0, <4 x float> %1, %struct.LensGDCShaderParameters.0 addrspace(2)* nocapture readnone dereferenceable(84) "air-buffer-no-alias" %2, %struct._texture_2d_t.1 addrspace(1)* %3) local_unnamed_addr #0 {
  %5 = shufflevector <4 x float> %1, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %6 = tail call fast fastcc <2 x float> @_ZL3gdcRU11MTLconstantK23LensGDCShaderParametersDv2_f(%struct.LensGDCShaderParameters.0 addrspace(2)* dereferenceable(84) %2, <2 x float> %5) #4
  %7 = fadd fast <2 x float> %6, <float 5.000000e-01, float 5.000000e-01>
  %8 = tail call fast fastcc <4 x float> @_Z14sample_bicubicN5metal9texture2dIfLNS_6accessE0EvEEDv2_f(%struct._texture_2d_t.1 addrspace(1)* %3, <2 x float> %7) #5
  %9 = insertelement <4 x float> %8, float 1.000000e+00, i64 3
  ret <4 x float> %9
}

; Function Attrs: convergent nounwind readonly
define internal fastcc <4 x float> @_Z14sample_bicubicN5metal9texture2dIfLNS_6accessE0EvEEDv2_f(%struct._texture_2d_t.1 addrspace(1)* %0, <2 x float> %1) unnamed_addr #0 {
  %3 = fadd fast <2 x float> %1, <float -5.000000e-01, float -5.000000e-01>
  %4 = tail call fast <2 x float> @air.fast_floor.v2f32(<2 x float> %3) #2
  %5 = fsub fast <2 x float> %3, %4
  %6 = shufflevector <2 x float> %5, <2 x float> undef, <4 x i32> zeroinitializer
  %7 = fmul fast <4 x float> %6, <float -5.000000e-01, float 1.500000e+00, float -1.500000e+00, float 5.000000e-01>
  %8 = fadd fast <4 x float> %7, <float 1.000000e+00, float -2.500000e+00, float 2.000000e+00, float -5.000000e-01>
  %9 = fmul fast <4 x float> %8, %6
  %10 = fadd fast <4 x float> %9, <float -5.000000e-01, float 0.000000e+00, float 5.000000e-01, float 0.000000e+00>
  %11 = fmul fast <4 x float> %10, %6
  %12 = fadd fast <4 x float> %11, <float 0.000000e+00, float 1.000000e+00, float 0.000000e+00, float 0.000000e+00>
  %13 = fadd fast <2 x float> %4, <float 5.000000e-01, float 5.000000e-01>
  %14 = shufflevector <2 x float> %13, <2 x float> undef, <4 x i32> zeroinitializer
  %15 = fadd fast <4 x float> %14, <float -1.000000e+00, float 0.000000e+00, float 1.000000e+00, float 2.000000e+00>
  %16 = shufflevector <2 x float> %13, <2 x float> undef, <4 x i32> <i32 1, i32 1, i32 1, i32 1>
  %17 = fadd fast <4 x float> %16, <float -1.000000e+00, float 0.000000e+00, float 1.000000e+00, float 2.000000e+00>
  %18 = shufflevector <4 x float> %15, <4 x float> undef, <2 x i32> <i32 0, i32 undef>
  %19 = extractelement <4 x float> %17, i64 0
  %20 = insertelement <2 x float> %18, float %19, i64 1
  %21 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %20, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %22 = extractvalue { <4 x float>, i8 } %21, 0
  %23 = shufflevector <4 x float> %15, <4 x float> undef, <2 x i32> <i32 1, i32 undef>
  %24 = insertelement <2 x float> %23, float %19, i64 1
  %25 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %24, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %26 = extractvalue { <4 x float>, i8 } %25, 0
  %27 = shufflevector <4 x float> %15, <4 x float> undef, <2 x i32> <i32 2, i32 undef>
  %28 = insertelement <2 x float> %27, float %19, i64 1
  %29 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %28, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %30 = extractvalue { <4 x float>, i8 } %29, 0
  %31 = shufflevector <4 x float> %15, <4 x float> undef, <2 x i32> <i32 3, i32 undef>
  %32 = insertelement <2 x float> %31, float %19, i64 1
  %33 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %32, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %34 = extractvalue { <4 x float>, i8 } %33, 0
  %35 = shufflevector <4 x float> %12, <4 x float> undef, <4 x i32> zeroinitializer
  %36 = fmul fast <4 x float> %35, %22
  %37 = shufflevector <4 x float> %12, <4 x float> undef, <4 x i32> <i32 1, i32 1, i32 1, i32 1>
  %38 = fmul fast <4 x float> %37, %26
  %39 = fadd fast <4 x float> %36, %38
  %40 = shufflevector <4 x float> %12, <4 x float> undef, <4 x i32> <i32 2, i32 2, i32 2, i32 2>
  %41 = fmul fast <4 x float> %40, %30
  %42 = fadd fast <4 x float> %39, %41
  %43 = shufflevector <4 x float> %12, <4 x float> undef, <4 x i32> <i32 3, i32 3, i32 3, i32 3>
  %44 = fmul fast <4 x float> %43, %34
  %45 = fadd fast <4 x float> %42, %44
  %46 = extractelement <4 x float> %17, i64 1
  %47 = insertelement <2 x float> %18, float %46, i64 1
  %48 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %47, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %49 = extractvalue { <4 x float>, i8 } %48, 0
  %50 = insertelement <2 x float> %23, float %46, i64 1
  %51 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %50, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %52 = extractvalue { <4 x float>, i8 } %51, 0
  %53 = insertelement <2 x float> %27, float %46, i64 1
  %54 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %53, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %55 = extractvalue { <4 x float>, i8 } %54, 0
  %56 = insertelement <2 x float> %31, float %46, i64 1
  %57 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %56, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %58 = extractvalue { <4 x float>, i8 } %57, 0
  %59 = fmul fast <4 x float> %35, %49
  %60 = fmul fast <4 x float> %37, %52
  %61 = fadd fast <4 x float> %59, %60
  %62 = fmul fast <4 x float> %40, %55
  %63 = fadd fast <4 x float> %61, %62
  %64 = fmul fast <4 x float> %43, %58
  %65 = fadd fast <4 x float> %63, %64
  %66 = extractelement <4 x float> %17, i64 2
  %67 = insertelement <2 x float> %18, float %66, i64 1
  %68 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %67, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %69 = extractvalue { <4 x float>, i8 } %68, 0
  %70 = insertelement <2 x float> %23, float %66, i64 1
  %71 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %70, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %72 = extractvalue { <4 x float>, i8 } %71, 0
  %73 = insertelement <2 x float> %27, float %66, i64 1
  %74 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %73, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %75 = extractvalue { <4 x float>, i8 } %74, 0
  %76 = insertelement <2 x float> %31, float %66, i64 1
  %77 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %76, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %78 = extractvalue { <4 x float>, i8 } %77, 0
  %79 = fmul fast <4 x float> %69, %35
  %80 = fmul fast <4 x float> %72, %37
  %81 = fadd fast <4 x float> %80, %79
  %82 = fmul fast <4 x float> %75, %40
  %83 = fadd fast <4 x float> %81, %82
  %84 = fmul fast <4 x float> %78, %43
  %85 = fadd fast <4 x float> %83, %84
  %86 = extractelement <4 x float> %17, i64 3
  %87 = insertelement <2 x float> %18, float %86, i64 1
  %88 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %87, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %89 = extractvalue { <4 x float>, i8 } %88, 0
  %90 = insertelement <2 x float> %23, float %86, i64 1
  %91 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %90, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %92 = extractvalue { <4 x float>, i8 } %91, 0
  %93 = insertelement <2 x float> %27, float %86, i64 1
  %94 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %93, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %95 = extractvalue { <4 x float>, i8 } %94, 0
  %96 = insertelement <2 x float> %31, float %86, i64 1
  %97 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly %0, %struct._sampler_t.2 addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state.1 to %struct._sampler_t.2 addrspace(2)*), <2 x float> %96, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %98 = extractvalue { <4 x float>, i8 } %97, 0
  %99 = fmul fast <4 x float> %89, %35
  %100 = fmul fast <4 x float> %92, %37
  %101 = fadd fast <4 x float> %100, %99
  %102 = fmul fast <4 x float> %95, %40
  %103 = fadd fast <4 x float> %101, %102
  %104 = fmul fast <4 x float> %98, %43
  %105 = fadd fast <4 x float> %103, %104
  %106 = shufflevector <2 x float> %5, <2 x float> undef, <4 x i32> <i32 1, i32 1, i32 1, i32 1>
  %107 = fmul fast <4 x float> %106, <float -5.000000e-01, float 1.500000e+00, float -1.500000e+00, float 5.000000e-01>
  %108 = fadd fast <4 x float> %107, <float 1.000000e+00, float -2.500000e+00, float 2.000000e+00, float -5.000000e-01>
  %109 = fmul fast <4 x float> %108, %106
  %110 = fadd fast <4 x float> %109, <float -5.000000e-01, float 0.000000e+00, float 5.000000e-01, float 0.000000e+00>
  %111 = fmul fast <4 x float> %110, %106
  %112 = fadd fast <4 x float> %111, <float 0.000000e+00, float 1.000000e+00, float 0.000000e+00, float 0.000000e+00>
  %113 = shufflevector <4 x float> %112, <4 x float> undef, <4 x i32> zeroinitializer
  %114 = fmul fast <4 x float> %45, %113
  %115 = shufflevector <4 x float> %112, <4 x float> undef, <4 x i32> <i32 1, i32 1, i32 1, i32 1>
  %116 = fmul fast <4 x float> %65, %115
  %117 = fadd fast <4 x float> %114, %116
  %118 = shufflevector <4 x float> %112, <4 x float> undef, <4 x i32> <i32 2, i32 2, i32 2, i32 2>
  %119 = fmul fast <4 x float> %85, %118
  %120 = fadd fast <4 x float> %117, %119
  %121 = shufflevector <4 x float> %112, <4 x float> undef, <4 x i32> <i32 3, i32 3, i32 3, i32 3>
  %122 = fmul fast <4 x float> %105, %121
  %123 = fadd fast <4 x float> %120, %122
  ret <4 x float> %123
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.1 addrspace(1)* nocapture readonly, %struct._sampler_t.2 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <2 x float> @air.fast_floor.v2f32(<2 x float>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
define internal fastcc <2 x float> @_ZL3gdcRU11MTLconstantK23LensGDCShaderParametersDv2_f(%struct.LensGDCShaderParameters.0 addrspace(2)* nocapture readonly dereferenceable(84) %0, <2 x float> %1) unnamed_addr #3 {
  %3 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 0
  %4 = load float, float addrspace(2)* %3, align 4, !tbaa !24
  %5 = insertelement <2 x float> undef, float %4, i64 0
  %6 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 1
  %7 = load float, float addrspace(2)* %6, align 4, !tbaa !30
  %8 = insertelement <2 x float> %5, float %7, i64 1
  %9 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 2
  %10 = load float, float addrspace(2)* %9, align 4, !tbaa !31
  %11 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 0
  %12 = load float, float addrspace(2)* %11, align 4, !tbaa !32
  %13 = insertelement <4 x float> undef, float %12, i64 0
  %14 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 1
  %15 = load float, float addrspace(2)* %14, align 4, !tbaa !32
  %16 = insertelement <4 x float> %13, float %15, i64 1
  %17 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 2
  %18 = load float, float addrspace(2)* %17, align 4, !tbaa !32
  %19 = insertelement <4 x float> %16, float %18, i64 2
  %20 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 3
  %21 = load float, float addrspace(2)* %20, align 4, !tbaa !32
  %22 = insertelement <4 x float> %19, float %21, i64 3
  %23 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 4
  %24 = load float, float addrspace(2)* %23, align 4, !tbaa !32
  %25 = insertelement <4 x float> undef, float %24, i64 0
  %26 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 5
  %27 = load float, float addrspace(2)* %26, align 4, !tbaa !32
  %28 = insertelement <4 x float> %25, float %27, i64 1
  %29 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 6
  %30 = load float, float addrspace(2)* %29, align 4, !tbaa !32
  %31 = insertelement <4 x float> %28, float %30, i64 2
  %32 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 7
  %33 = load float, float addrspace(2)* %32, align 4, !tbaa !32
  %34 = insertelement <4 x float> %31, float %33, i64 3
  %35 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 8
  %36 = load float, float addrspace(2)* %35, align 4, !tbaa !32
  %37 = insertelement <4 x float> undef, float %36, i64 0
  %38 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 9
  %39 = load float, float addrspace(2)* %38, align 4, !tbaa !32
  %40 = insertelement <4 x float> %37, float %39, i64 1
  %41 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 10
  %42 = load float, float addrspace(2)* %41, align 4, !tbaa !32
  %43 = insertelement <4 x float> %40, float %42, i64 2
  %44 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 11
  %45 = load float, float addrspace(2)* %44, align 4, !tbaa !32
  %46 = insertelement <4 x float> %43, float %45, i64 3
  %47 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 12
  %48 = load float, float addrspace(2)* %47, align 4, !tbaa !32
  %49 = insertelement <3 x float> undef, float %48, i64 0
  %50 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 13
  %51 = load float, float addrspace(2)* %50, align 4, !tbaa !32
  %52 = insertelement <3 x float> %49, float %51, i64 1
  %53 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 3, i64 14
  %54 = load float, float addrspace(2)* %53, align 4, !tbaa !32
  %55 = insertelement <3 x float> %52, float %54, i64 2
  %56 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 4
  %57 = load float, float addrspace(2)* %56, align 4, !tbaa !33
  %58 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 5
  %59 = load float, float addrspace(2)* %58, align 4, !tbaa !34
  %60 = getelementptr inbounds %struct.LensGDCShaderParameters.0, %struct.LensGDCShaderParameters.0 addrspace(2)* %0, i64 0, i32 6
  %61 = load i8, i8 addrspace(2)* %60, align 4, !tbaa !35, !range !36
  %62 = icmp eq i8 %61, 0
  %63 = fsub fast <2 x float> %1, %8
  %64 = tail call fast float @air.dot.v2f32(<2 x float> %63, <2 x float> %63) #2
  %65 = tail call fast float @air.fast_sqrt.f32(float %64) #2
  %66 = fmul fast float %65, %10
  %67 = tail call fast float @air.fast_clamp.f32(float %66, float %57, float %59) #2
  %68 = fmul fast float %67, %67
  %69 = fmul fast float %68, %67
  %70 = fmul fast float %68, %68
  %71 = insertelement <4 x float> <float 1.000000e+00, float undef, float undef, float undef>, float %67, i64 1
  %72 = insertelement <4 x float> %71, float %68, i64 2
  %73 = insertelement <4 x float> %72, float %69, i64 3
  %74 = shufflevector <4 x float> %72, <4 x float> undef, <3 x i32> <i32 0, i32 1, i32 2>
  %75 = tail call fast float @air.dot.v3f32(<3 x float> %55, <3 x float> %74) #2
  %76 = fmul fast float %70, %75
  %77 = tail call fast float @air.dot.v4f32(<4 x float> %46, <4 x float> %73) #2
  %78 = fadd fast float %76, %77
  %79 = fmul fast float %78, %70
  %80 = tail call fast float @air.dot.v4f32(<4 x float> %34, <4 x float> %73) #2
  %81 = fadd fast float %79, %80
  %82 = fmul fast float %81, %70
  %83 = tail call fast float @air.dot.v4f32(<4 x float> %22, <4 x float> %73) #2
  %84 = fadd fast float %82, %83
  %85 = insertelement <2 x float> undef, float %84, i64 0
  %86 = shufflevector <2 x float> %85, <2 x float> undef, <2 x i32> zeroinitializer
  br i1 %62, label %89, label %87

87:                                               ; preds = %2
  %88 = fdiv fast <2 x float> %63, %86
  br label %91

89:                                               ; preds = %2
  %90 = fmul fast <2 x float> %86, %63
  br label %91

91:                                               ; preds = %89, %87
  %92 = phi <2 x float> [ %88, %87 ], [ %90, %89 ]
  %93 = fadd fast <2 x float> %92, %8
  ret <2 x float> %93
}

; Function Attrs: nounwind readnone
declare float @air.dot.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare float @air.fast_clamp.f32(float, float, float) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare float @air.fast_sqrt.f32(float) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare float @air.dot.v2f32(<2 x float>, <2 x float>) local_unnamed_addr #2

attributes #0 = { convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { nounwind readnone }
attributes #3 = { nounwind readnone "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #4 = { nobuiltin "no-builtins" }
attributes #5 = { convergent nobuiltin "no-builtins" }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!llvm.ident = !{!8}
!air.version = !{!9}
!air.language_version = !{!10}
!air.compile_options = !{!11, !12, !13}
!air.fragment = !{!14}
!air.sampler_states = !{!23}

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
!14 = !{<4 x float> (<4 x float>, <4 x float>, %struct.LensGDCShaderParameters.0 addrspace(2)*, %struct._texture_2d_t.1 addrspace(1)*)* @Hgc2LensGDC_BC, !15, !17}
!15 = !{!16}
!16 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!17 = !{!18, !19, !20, !22}
!18 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!19 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!20 = !{i32 2, !"air.buffer", !"air.buffer_size", i32 84, !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !21, !"air.arg_type_size", i32 84, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"LensGDCShaderParameters", !"air.arg_name", !"parameters"}
!21 = !{i32 0, i32 4, i32 0, !"float", !"cx", i32 4, i32 4, i32 0, !"float", !"cy", i32 8, i32 4, i32 0, !"float", !"oneOverM", i32 12, i32 4, i32 15, !"float", !"k", i32 72, i32 4, i32 0, !"float", !"minRadius", i32 76, i32 4, i32 0, !"float", !"maxRadius", i32 80, i32 1, i32 0, !"bool", !"reciprocalScaling"}
!22 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"inTexture"}
!23 = !{!"air.sampler_state", i64 addrspace(2)* @__air_sampler_state.1}
!24 = !{!25, !26, i64 0}
!25 = !{!"_ZTS23LensGDCShaderParameters", !26, i64 0, !26, i64 4, !26, i64 8, !27, i64 12, !26, i64 72, !26, i64 76, !29, i64 80}
!26 = !{!"float", !27, i64 0}
!27 = !{!"omnipotent char", !28, i64 0}
!28 = !{!"Simple C++ TBAA"}
!29 = !{!"bool", !27, i64 0}
!30 = !{!25, !26, i64 4}
!31 = !{!25, !26, i64 8}
!32 = !{!26, !26, i64 0}
!33 = !{!25, !26, i64 72}
!34 = !{!25, !26, i64 76}
!35 = !{!25, !29, i64 80}
!36 = !{i8 0, i8 2}

0x00000000003812 -- Hgc2GammaMC:
source_filename = "Hgc2GammaMC"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct._texture_2d_t.3 = type opaque
%struct._sampler_t.4 = type opaque

; Function Attrs: argmemonly convergent nounwind readonly
define <4 x float> @Hgc2GammaMC(<4 x float> %0, <4 x float> %1, %struct._texture_2d_t.3 addrspace(1)* nocapture readonly %2, %struct._sampler_t.4 addrspace(2)* nocapture readonly %3, <4 x float> addrspace(2)* nocapture readonly "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = load <4 x float>, <4 x float> addrspace(2)* %4, align 16, !tbaa !23, !alias.scope !26, !noalias !29
  %7 = getelementptr inbounds <4 x float>, <4 x float> addrspace(2)* %4, i64 1
  %8 = load <4 x float>, <4 x float> addrspace(2)* %7, align 16, !tbaa !23, !alias.scope !26, !noalias !29
  %9 = shufflevector <4 x float> %1, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %10 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.3 addrspace(1)* nocapture readonly %2, %struct._sampler_t.4 addrspace(2)* nocapture readonly %3, <2 x float> %9, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !29, !noalias !26
  %11 = extractvalue { <4 x float>, i8 } %10, 0
  %12 = tail call fast <4 x float> @air.fast_fabs.v4f32(<4 x float> %11) #1
  %13 = extractelement <4 x float> %12, i64 0
  %14 = extractelement <4 x float> %6, i64 0
  %15 = tail call fast float @air.fast_pow.f32(float %13, float %14) #1
  %16 = insertelement <4 x float> undef, float %15, i64 0
  %17 = extractelement <4 x float> %12, i64 1
  %18 = extractelement <4 x float> %6, i64 1
  %19 = tail call fast float @air.fast_pow.f32(float %17, float %18) #1
  %20 = insertelement <4 x float> %16, float %19, i64 1
  %21 = extractelement <4 x float> %12, i64 2
  %22 = extractelement <4 x float> %6, i64 2
  %23 = tail call fast float @air.fast_pow.f32(float %21, float %22) #1
  %24 = insertelement <4 x float> %20, float %23, i64 2
  %25 = shufflevector <4 x float> %12, <4 x float> undef, <4 x i32> <i32 3, i32 3, i32 3, i32 3>
  %26 = tail call fast <4 x float> @air.fast_pow.v4f32(<4 x float> %25, <4 x float> %8) #1
  %27 = fcmp fast ogt <4 x float> %12, zeroinitializer
  %28 = select reassoc nsz arcp contract afn <4 x i1> %27, <4 x float> %26, <4 x float> <float 0.000000e+00, float 0.000000e+00, float 0.000000e+00, float undef>
  %29 = fmul fast <4 x float> %28, %24
  %30 = shufflevector <4 x float> %29, <4 x float> %12, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %31 = fsub fast <4 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %30
  %32 = fcmp fast olt <4 x float> %11, zeroinitializer
  %33 = select reassoc nsz arcp contract afn <4 x i1> %32, <4 x float> %31, <4 x float> %30
  ret <4 x float> %33
}

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_pow.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare float @air.fast_pow.f32(float, float) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_fabs.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.3 addrspace(1)* nocapture readonly, %struct._sampler_t.4 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { argmemonly convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
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
!14 = !{<4 x float> (<4 x float>, <4 x float>, %struct._texture_2d_t.3 addrspace(1)*, %struct._sampler_t.4 addrspace(2)*, <4 x float> addrspace(2)*)* @Hgc2GammaMC, !15, !17}
!15 = !{!16}
!16 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!17 = !{!18, !19, !20, !21, !22}
!18 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!19 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!20 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture0"}
!21 = !{i32 3, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler0"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"params"}
!23 = !{!24, !24, i64 0}
!24 = !{!"omnipotent char", !25, i64 0}
!25 = !{!"Simple C++ TBAA"}
!26 = !{!27}
!27 = distinct !{!27, !28, !"air-alias-scope-arg(4)"}
!28 = distinct !{!28, !"air-alias-scopes(Hgc2GammaMC)"}
!29 = !{!30, !31}
!30 = distinct !{!30, !28, !"air-alias-scope-textures"}
!31 = distinct !{!31, !28, !"air-alias-scope-samplers"}

0x00000000004872 -- Hgc2Gamma:
source_filename = "Hgc2Gamma"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct._texture_2d_t.5 = type opaque
%struct._sampler_t.6 = type opaque

; Function Attrs: argmemonly convergent nounwind readonly
define <4 x float> @Hgc2Gamma(<4 x float> %0, <4 x float> %1, %struct._texture_2d_t.5 addrspace(1)* nocapture readonly %2, %struct._sampler_t.6 addrspace(2)* nocapture readonly %3, <4 x float> addrspace(2)* nocapture readonly "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = load <4 x float>, <4 x float> addrspace(2)* %4, align 16, !tbaa !23, !alias.scope !26, !noalias !29
  %7 = shufflevector <4 x float> %1, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %8 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.5 addrspace(1)* nocapture readonly %2, %struct._sampler_t.6 addrspace(2)* nocapture readonly %3, <2 x float> %7, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !29, !noalias !26
  %9 = extractvalue { <4 x float>, i8 } %8, 0
  %10 = tail call fast <4 x float> @air.fast_fabs.v4f32(<4 x float> %9) #1
  %11 = shufflevector <4 x float> %10, <4 x float> undef, <3 x i32> <i32 3, i32 3, i32 3>
  %12 = tail call fast <3 x float> @air.fast_fmax.v3f32(<3 x float> %11, <3 x float> <float 0x3EB0C6F7A0000000, float 0x3EB0C6F7A0000000, float 0x3EB0C6F7A0000000>) #1
  %13 = shufflevector <3 x float> %12, <3 x float> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %14 = insertelement <4 x float> %13, float 1.000000e+00, i64 3
  %15 = fdiv fast <4 x float> %10, %14
  %16 = tail call fast <4 x float> @air.fast_pow.v4f32(<4 x float> %15, <4 x float> %6) #1
  %17 = shufflevector <4 x float> %15, <4 x float> undef, <3 x i32> <i32 3, i32 3, i32 3>
  %18 = shufflevector <4 x float> %16, <4 x float> undef, <3 x i32> <i32 0, i32 1, i32 2>
  %19 = fmul fast <3 x float> %17, %18
  %20 = shufflevector <3 x float> %19, <3 x float> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %21 = shufflevector <4 x float> %20, <4 x float> %15, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %22 = fsub fast <4 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %21
  %23 = fcmp fast olt <4 x float> %9, zeroinitializer
  %24 = select reassoc nsz arcp contract afn <4 x i1> %23, <4 x float> %22, <4 x float> %21
  ret <4 x float> %24
}

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_pow.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <3 x float> @air.fast_fmax.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_fabs.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.5 addrspace(1)* nocapture readonly, %struct._sampler_t.6 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { argmemonly convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
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
!14 = !{<4 x float> (<4 x float>, <4 x float>, %struct._texture_2d_t.5 addrspace(1)*, %struct._sampler_t.6 addrspace(2)*, <4 x float> addrspace(2)*)* @Hgc2Gamma, !15, !17}
!15 = !{!16}
!16 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!17 = !{!18, !19, !20, !21, !22}
!18 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!19 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!20 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture0"}
!21 = !{i32 3, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler0"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"params"}
!23 = !{!24, !24, i64 0}
!24 = !{!"omnipotent char", !25, i64 0}
!25 = !{!"Simple C++ TBAA"}
!26 = !{!27}
!27 = distinct !{!27, !28, !"air-alias-scope-arg(4)"}
!28 = distinct !{!28, !"air-alias-scopes(Hgc2Gamma)"}
!29 = !{!30, !31}
!30 = distinct !{!30, !28, !"air-alias-scope-textures"}
!31 = distinct !{!31, !28, !"air-alias-scope-samplers"}

0x000000000058b2 -- Hgc2GammaNoPremult:
source_filename = "Hgc2GammaNoPremult"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct._texture_2d_t.7 = type opaque
%struct._sampler_t.8 = type opaque

; Function Attrs: argmemonly convergent nounwind readonly
define <4 x float> @Hgc2GammaNoPremult(<4 x float> %0, <4 x float> %1, %struct._texture_2d_t.7 addrspace(1)* nocapture readonly %2, %struct._sampler_t.8 addrspace(2)* nocapture readonly %3, <4 x float> addrspace(2)* nocapture readonly "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = load <4 x float>, <4 x float> addrspace(2)* %4, align 16, !tbaa !23, !alias.scope !26, !noalias !29
  %7 = shufflevector <4 x float> %1, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %8 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.7 addrspace(1)* nocapture readonly %2, %struct._sampler_t.8 addrspace(2)* nocapture readonly %3, <2 x float> %7, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !alias.scope !29, !noalias !26
  %9 = extractvalue { <4 x float>, i8 } %8, 0
  %10 = tail call fast <4 x float> @air.fast_fabs.v4f32(<4 x float> %9) #1
  %11 = tail call fast <4 x float> @air.fast_pow.v4f32(<4 x float> %10, <4 x float> %6) #1
  %12 = shufflevector <4 x float> %11, <4 x float> %10, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %13 = fsub fast <4 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %12
  %14 = fcmp fast olt <4 x float> %9, zeroinitializer
  %15 = select reassoc nsz arcp contract afn <4 x i1> %14, <4 x float> %13, <4 x float> %12
  ret <4 x float> %15
}

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_pow.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_fabs.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.7 addrspace(1)* nocapture readonly, %struct._sampler_t.8 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { argmemonly convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
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
!14 = !{<4 x float> (<4 x float>, <4 x float>, %struct._texture_2d_t.7 addrspace(1)*, %struct._sampler_t.8 addrspace(2)*, <4 x float> addrspace(2)*)* @Hgc2GammaNoPremult, !15, !17}
!15 = !{!16}
!16 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!17 = !{!18, !19, !20, !21, !22}
!18 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!19 = !{i32 1, !"air.fragment_input", !"user(texcoord0)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"texcoord0"}
!20 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"texture0"}
!21 = !{i32 3, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"sampler0"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"params"}
!23 = !{!24, !24, i64 0}
!24 = !{!"omnipotent char", !25, i64 0}
!25 = !{!"Simple C++ TBAA"}
!26 = !{!27}
!27 = distinct !{!27, !28, !"air-alias-scope-arg(4)"}
!28 = distinct !{!28, !"air-alias-scopes(Hgc2GammaNoPremult)"}
!29 = !{!30, !31}
!30 = distinct !{!30, !28, !"air-alias-scope-textures"}
!31 = distinct !{!31, !28, !"air-alias-scope-samplers"}

0x00000000006862 -- Hgc2LensGDC_BL_hgc_visible:
source_filename = "/Library/Caches/com.apple.xbs/Binaries/Helium/install/TempContent/Objects/Helium.build/HeliumRender_hgcCompile.build/DerivedSources/Hgc2LensGDC_BL_hgc_visible.metal"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct.LensGDCShaderParameters.11 = type { float, float, float, [15 x float], float, float, i8 }
%struct._texture_2d_t.12 = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant i64 -9188470239253722624, align 8

; Function Attrs: argmemonly convergent nounwind readonly
define <4 x float> @Hgc2LensGDC_BL_hgc_visible(<4 x float> %0, %struct.LensGDCShaderParameters.11 addrspace(2)* nocapture readnone dereferenceable(84) "air-buffer-no-alias" %1, %struct._texture_2d_t.12 addrspace(1)* nocapture readonly %2) local_unnamed_addr #0 {
  %4 = shufflevector <4 x float> undef, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %5 = tail call fast fastcc <2 x float> @_ZL3gdcRU11MTLconstantK23LensGDCShaderParametersDv2_f(%struct.LensGDCShaderParameters.11 addrspace(2)* dereferenceable(84) %1, <2 x float> %4) #3
  %6 = fadd fast <2 x float> %5, <float 5.000000e-01, float 5.000000e-01>
  %7 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.12 addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %6, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2
  %8 = extractvalue { <4 x float>, i8 } %7, 0
  %9 = insertelement <4 x float> %8, float 1.000000e+00, i64 3
  ret <4 x float> %9
}

; Function Attrs: nounwind readnone
declare internal <2 x float> @_ZL3gdcRU11MTLconstantK23LensGDCShaderParametersDv2_f(%struct.LensGDCShaderParameters.11 addrspace(2)* nocapture readonly dereferenceable(84), <2 x float>) unnamed_addr #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.12 addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { argmemonly convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { nounwind readnone }
attributes #2 = { argmemonly convergent nounwind readonly }
attributes #3 = { nobuiltin "no-builtins" }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!air.visible = !{!8}
!air.compile_options = !{!15, !16, !17}
!llvm.ident = !{!18}
!air.version = !{!19}
!air.language_version = !{!20}
!air.source_file_name = !{!21}

!0 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!1 = !{i32 1, !"wchar_size", i32 4}
!2 = !{i32 7, !"air.max_device_buffers", i32 31}
!3 = !{i32 7, !"air.max_constant_buffers", i32 31}
!4 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!5 = !{i32 7, !"air.max_textures", i32 128}
!6 = !{i32 7, !"air.max_read_write_textures", i32 8}
!7 = !{i32 7, !"air.max_samplers", i32 16}
!8 = !{<4 x float> (<4 x float>, %struct.LensGDCShaderParameters.11 addrspace(2)*, %struct._texture_2d_t.12 addrspace(1)*)* @Hgc2LensGDC_BL_hgc_visible, !9, !11}
!9 = !{!10}
!10 = !{!"air.visible_output", !"air.arg_type_name", !"float4"}
!11 = !{!12, !13, !14}
!12 = !{i32 0, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!13 = !{i32 1, !"air.visible_input", !"air.arg_type_name", !"LensGDCShaderParameters", !"air.arg_name", !"parameters"}
!14 = !{i32 2, !"air.visible_input", !"air.arg_type_name", !"__metal_texture_2d_t", !"air.arg_name", !"t"}
!15 = !{!"air.compile.denorms_disable"}
!16 = !{!"air.compile.fast_math_enable"}
!17 = !{!"air.compile.framebuffer_fetch_enable"}
!18 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!19 = !{i32 2, i32 3, i32 0}
!20 = !{!"Metal", i32 2, i32 3, i32 0}
!21 = !{!"/Library/Caches/com.apple.xbs/Binaries/Helium/install/TempContent/Objects/Helium.build/HeliumRender_hgcCompile.build/DerivedSources/Hgc2LensGDC_BL_hgc_visible.metal"}

0x00000000007872 -- Hgc2LensGDC_BC_hgc_visible:
source_filename = "/Library/Caches/com.apple.xbs/Binaries/Helium/install/TempContent/Objects/Helium.build/HeliumRender_hgcCompile.build/DerivedSources/Hgc2LensGDC_BC_hgc_visible.metal"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct.LensGDCShaderParameters.14 = type { float, float, float, [15 x float], float, float, i8 }
%struct._texture_2d_t.1 = type opaque

@__air_sampler_state.1 = internal addrspace(2) constant i64 -9188470239253725184, align 8

; Function Attrs: convergent nounwind readonly
define <4 x float> @Hgc2LensGDC_BC_hgc_visible(<4 x float> %0, %struct.LensGDCShaderParameters.14 addrspace(2)* nocapture readnone dereferenceable(84) "air-buffer-no-alias" %1, <4 x float> %2) local_unnamed_addr #0 {
  %4 = shufflevector <4 x float> undef, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %5 = tail call fast fastcc <2 x float> @_ZL3gdcRU11MTLconstantK23LensGDCShaderParametersDv2_f(%struct.LensGDCShaderParameters.14 addrspace(2)* dereferenceable(84) %1, <2 x float> %4) #3
  %6 = fadd fast <2 x float> %5, <float 5.000000e-01, float 5.000000e-01>
  %7 = tail call fast fastcc <4 x float> @_Z14sample_bicubicN5metal9texture2dIfLNS_6accessE0EvEEDv2_f(%struct._texture_2d_t.1 addrspace(1)* undef, <2 x float> %6) #4
  %8 = insertelement <4 x float> %2, float 1.000000e+00, i64 3
  ret <4 x float> %8
}

; Function Attrs: nounwind readnone
declare internal <2 x float> @_ZL3gdcRU11MTLconstantK23LensGDCShaderParametersDv2_f(%struct.LensGDCShaderParameters.14 addrspace(2)* nocapture readonly dereferenceable(84), <2 x float>) unnamed_addr #1

; Function Attrs: convergent nounwind readonly
declare internal <4 x float> @_Z14sample_bicubicN5metal9texture2dIfLNS_6accessE0EvEEDv2_f(%struct._texture_2d_t.1 addrspace(1)*, <2 x float>) unnamed_addr #2

attributes #0 = { convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { nounwind readnone }
attributes #2 = { convergent nounwind readonly }
attributes #3 = { nobuiltin "no-builtins" }
attributes #4 = { convergent nobuiltin "no-builtins" }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!air.visible = !{!8}
!air.compile_options = !{!15, !16, !17}
!llvm.ident = !{!18}
!air.version = !{!19}
!air.language_version = !{!20}
!air.source_file_name = !{!21}

!0 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!1 = !{i32 1, !"wchar_size", i32 4}
!2 = !{i32 7, !"air.max_device_buffers", i32 31}
!3 = !{i32 7, !"air.max_constant_buffers", i32 31}
!4 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!5 = !{i32 7, !"air.max_textures", i32 128}
!6 = !{i32 7, !"air.max_read_write_textures", i32 8}
!7 = !{i32 7, !"air.max_samplers", i32 16}
!8 = !{<4 x float> (<4 x float>, %struct.LensGDCShaderParameters.14 addrspace(2)*, <4 x float>)* @Hgc2LensGDC_BC_hgc_visible, !9, !11}
!9 = !{!10}
!10 = !{!"air.visible_output", !"air.arg_type_name", !"float4"}
!11 = !{!12, !13, !14}
!12 = !{i32 0, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!13 = !{i32 1, !"air.visible_input", !"air.arg_type_name", !"LensGDCShaderParameters", !"air.arg_name", !"parameters"}
!14 = !{i32 2, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"concat0"}
!15 = !{!"air.compile.denorms_disable"}
!16 = !{!"air.compile.fast_math_enable"}
!17 = !{!"air.compile.framebuffer_fetch_enable"}
!18 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!19 = !{i32 2, i32 3, i32 0}
!20 = !{!"Metal", i32 2, i32 3, i32 0}
!21 = !{!"/Library/Caches/com.apple.xbs/Binaries/Helium/install/TempContent/Objects/Helium.build/HeliumRender_hgcCompile.build/DerivedSources/Hgc2LensGDC_BC_hgc_visible.metal"}

0x00000000008862 -- Hgc2GammaMC_hgc_visible:
source_filename = "/Library/Caches/com.apple.xbs/Binaries/Helium/install/TempContent/Objects/Helium.build/HeliumRender_hgcCompile.build/DerivedSources/Hgc2GammaMC_hgc_visible.metal"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct._texture_2d_t.3 = type opaque
%struct._sampler_t.4 = type opaque

; Function Attrs: argmemonly convergent nounwind readonly
define <4 x float> @Hgc2GammaMC_hgc_visible(<4 x float> %0, <4 x float> %1, <4 x float> addrspace(2)* nocapture readonly "air-buffer-no-alias" %2) local_unnamed_addr #0 {
  %4 = load <4 x float>, <4 x float> addrspace(2)* %2, align 16, !tbaa !22, !alias.scope !25, !noalias !28
  %5 = getelementptr inbounds <4 x float>, <4 x float> addrspace(2)* %2, i64 1
  %6 = load <4 x float>, <4 x float> addrspace(2)* %5, align 16, !tbaa !22, !alias.scope !25, !noalias !28
  %7 = shufflevector <4 x float> undef, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %8 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.3 addrspace(1)* nocapture readonly undef, %struct._sampler_t.4 addrspace(2)* nocapture readonly undef, <2 x float> %7, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %9 = tail call fast <4 x float> @air.fast_fabs.v4f32(<4 x float> %1) #2
  %10 = extractelement <4 x float> %9, i64 0
  %11 = extractelement <4 x float> %4, i64 0
  %12 = tail call fast float @air.fast_pow.f32(float %10, float %11) #2
  %13 = insertelement <4 x float> undef, float %12, i64 0
  %14 = extractelement <4 x float> %9, i64 1
  %15 = extractelement <4 x float> %4, i64 1
  %16 = tail call fast float @air.fast_pow.f32(float %14, float %15) #2
  %17 = insertelement <4 x float> %13, float %16, i64 1
  %18 = extractelement <4 x float> %9, i64 2
  %19 = extractelement <4 x float> %4, i64 2
  %20 = tail call fast float @air.fast_pow.f32(float %18, float %19) #2
  %21 = insertelement <4 x float> %17, float %20, i64 2
  %22 = shufflevector <4 x float> %9, <4 x float> undef, <4 x i32> <i32 3, i32 3, i32 3, i32 3>
  %23 = tail call fast <4 x float> @air.fast_pow.v4f32(<4 x float> %22, <4 x float> %6) #2
  %24 = fcmp fast ogt <4 x float> %9, zeroinitializer
  %25 = select reassoc nsz arcp contract afn <4 x i1> %24, <4 x float> %23, <4 x float> <float 0.000000e+00, float 0.000000e+00, float 0.000000e+00, float undef>
  %26 = fmul fast <4 x float> %25, %21
  %27 = shufflevector <4 x float> %26, <4 x float> %9, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %28 = fsub fast <4 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %27
  %29 = fcmp fast olt <4 x float> %1, zeroinitializer
  %30 = select reassoc nsz arcp contract afn <4 x i1> %29, <4 x float> %28, <4 x float> %27
  ret <4 x float> %30
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.3 addrspace(1)* nocapture readonly, %struct._sampler_t.4 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_fabs.v4f32(<4 x float>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare float @air.fast_pow.f32(float, float) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_pow.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #2

attributes #0 = { argmemonly convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { nounwind readnone }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!air.visible = !{!8}
!air.compile_options = !{!15, !16, !17}
!llvm.ident = !{!18}
!air.version = !{!19}
!air.language_version = !{!20}
!air.source_file_name = !{!21}

!0 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!1 = !{i32 1, !"wchar_size", i32 4}
!2 = !{i32 7, !"air.max_device_buffers", i32 31}
!3 = !{i32 7, !"air.max_constant_buffers", i32 31}
!4 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!5 = !{i32 7, !"air.max_textures", i32 128}
!6 = !{i32 7, !"air.max_read_write_textures", i32 8}
!7 = !{i32 7, !"air.max_samplers", i32 16}
!8 = !{<4 x float> (<4 x float>, <4 x float>, <4 x float> addrspace(2)*)* @Hgc2GammaMC_hgc_visible, !9, !11}
!9 = !{!10}
!10 = !{!"air.visible_output", !"air.arg_type_name", !"float4"}
!11 = !{!12, !13, !14}
!12 = !{i32 0, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!13 = !{i32 1, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"concat0"}
!14 = !{i32 2, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"params"}
!15 = !{!"air.compile.denorms_disable"}
!16 = !{!"air.compile.fast_math_enable"}
!17 = !{!"air.compile.framebuffer_fetch_enable"}
!18 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!19 = !{i32 2, i32 3, i32 0}
!20 = !{!"Metal", i32 2, i32 3, i32 0}
!21 = !{!"/Library/Caches/com.apple.xbs/Binaries/Helium/install/TempContent/Objects/Helium.build/HeliumRender_hgcCompile.build/DerivedSources/Hgc2GammaMC_hgc_visible.metal"}
!22 = !{!23, !23, i64 0}
!23 = !{!"omnipotent char", !24, i64 0}
!24 = !{!"Simple C++ TBAA"}
!25 = !{!26}
!26 = distinct !{!26, !27, !"air-alias-scope-arg(4)"}
!27 = distinct !{!27, !"air-alias-scopes(Hgc2GammaMC)"}
!28 = !{!29, !30}
!29 = distinct !{!29, !27, !"air-alias-scope-textures"}
!30 = distinct !{!30, !27, !"air-alias-scope-samplers"}

0x00000000009972 -- Hgc2Gamma_hgc_visible:
source_filename = "/Library/Caches/com.apple.xbs/Binaries/Helium/install/TempContent/Objects/Helium.build/HeliumRender_hgcCompile.build/DerivedSources/Hgc2Gamma_hgc_visible.metal"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct._texture_2d_t.5 = type opaque
%struct._sampler_t.6 = type opaque

; Function Attrs: argmemonly convergent nounwind readonly
define <4 x float> @Hgc2Gamma_hgc_visible(<4 x float> %0, <4 x float> %1, <4 x float> addrspace(2)* nocapture readonly "air-buffer-no-alias" %2) local_unnamed_addr #0 {
  %4 = load <4 x float>, <4 x float> addrspace(2)* %2, align 16, !tbaa !22, !alias.scope !25, !noalias !28
  %5 = shufflevector <4 x float> undef, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %6 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.5 addrspace(1)* nocapture readonly undef, %struct._sampler_t.6 addrspace(2)* nocapture readonly undef, <2 x float> %5, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %7 = tail call fast <4 x float> @air.fast_fabs.v4f32(<4 x float> %1) #2
  %8 = shufflevector <4 x float> %7, <4 x float> undef, <3 x i32> <i32 3, i32 3, i32 3>
  %9 = tail call fast <3 x float> @air.fast_fmax.v3f32(<3 x float> %8, <3 x float> <float 0x3EB0C6F7A0000000, float 0x3EB0C6F7A0000000, float 0x3EB0C6F7A0000000>) #2
  %10 = shufflevector <3 x float> %9, <3 x float> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %11 = insertelement <4 x float> %10, float 1.000000e+00, i64 3
  %12 = fdiv fast <4 x float> %7, %11
  %13 = tail call fast <4 x float> @air.fast_pow.v4f32(<4 x float> %12, <4 x float> %4) #2
  %14 = shufflevector <4 x float> %12, <4 x float> undef, <3 x i32> <i32 3, i32 3, i32 3>
  %15 = shufflevector <4 x float> %13, <4 x float> undef, <3 x i32> <i32 0, i32 1, i32 2>
  %16 = fmul fast <3 x float> %14, %15
  %17 = shufflevector <3 x float> %16, <3 x float> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %18 = shufflevector <4 x float> %17, <4 x float> %12, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %19 = fsub fast <4 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %18
  %20 = fcmp fast olt <4 x float> %1, zeroinitializer
  %21 = select reassoc nsz arcp contract afn <4 x i1> %20, <4 x float> %19, <4 x float> %18
  ret <4 x float> %21
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.5 addrspace(1)* nocapture readonly, %struct._sampler_t.6 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_fabs.v4f32(<4 x float>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <3 x float> @air.fast_fmax.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_pow.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #2

attributes #0 = { argmemonly convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { nounwind readnone }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!air.visible = !{!8}
!air.compile_options = !{!15, !16, !17}
!llvm.ident = !{!18}
!air.version = !{!19}
!air.language_version = !{!20}
!air.source_file_name = !{!21}

!0 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!1 = !{i32 1, !"wchar_size", i32 4}
!2 = !{i32 7, !"air.max_device_buffers", i32 31}
!3 = !{i32 7, !"air.max_constant_buffers", i32 31}
!4 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!5 = !{i32 7, !"air.max_textures", i32 128}
!6 = !{i32 7, !"air.max_read_write_textures", i32 8}
!7 = !{i32 7, !"air.max_samplers", i32 16}
!8 = !{<4 x float> (<4 x float>, <4 x float>, <4 x float> addrspace(2)*)* @Hgc2Gamma_hgc_visible, !9, !11}
!9 = !{!10}
!10 = !{!"air.visible_output", !"air.arg_type_name", !"float4"}
!11 = !{!12, !13, !14}
!12 = !{i32 0, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!13 = !{i32 1, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"concat0"}
!14 = !{i32 2, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"params"}
!15 = !{!"air.compile.denorms_disable"}
!16 = !{!"air.compile.fast_math_enable"}
!17 = !{!"air.compile.framebuffer_fetch_enable"}
!18 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!19 = !{i32 2, i32 3, i32 0}
!20 = !{!"Metal", i32 2, i32 3, i32 0}
!21 = !{!"/Library/Caches/com.apple.xbs/Binaries/Helium/install/TempContent/Objects/Helium.build/HeliumRender_hgcCompile.build/DerivedSources/Hgc2Gamma_hgc_visible.metal"}
!22 = !{!23, !23, i64 0}
!23 = !{!"omnipotent char", !24, i64 0}
!24 = !{!"Simple C++ TBAA"}
!25 = !{!26}
!26 = distinct !{!26, !27, !"air-alias-scope-arg(4)"}
!27 = distinct !{!27, !"air-alias-scopes(Hgc2Gamma)"}
!28 = !{!29, !30}
!29 = distinct !{!29, !27, !"air-alias-scope-textures"}
!30 = distinct !{!30, !27, !"air-alias-scope-samplers"}

0x0000000000aa62 -- Hgc2GammaNoPremult_hgc_visible:
source_filename = "/Library/Caches/com.apple.xbs/Binaries/Helium/install/TempContent/Objects/Helium.build/HeliumRender_hgcCompile.build/DerivedSources/Hgc2GammaNoPremult_hgc_visible.metal"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct._texture_2d_t.7 = type opaque
%struct._sampler_t.8 = type opaque

; Function Attrs: argmemonly convergent nounwind readonly
define <4 x float> @Hgc2GammaNoPremult_hgc_visible(<4 x float> %0, <4 x float> %1, <4 x float> addrspace(2)* nocapture readonly "air-buffer-no-alias" %2) local_unnamed_addr #0 {
  %4 = load <4 x float>, <4 x float> addrspace(2)* %2, align 16, !tbaa !22, !alias.scope !25, !noalias !28
  %5 = shufflevector <4 x float> undef, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %6 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.7 addrspace(1)* nocapture readonly undef, %struct._sampler_t.8 addrspace(2)* nocapture readonly undef, <2 x float> %5, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1, !alias.scope !28, !noalias !25
  %7 = tail call fast <4 x float> @air.fast_fabs.v4f32(<4 x float> %1) #2
  %8 = tail call fast <4 x float> @air.fast_pow.v4f32(<4 x float> %7, <4 x float> %4) #2
  %9 = shufflevector <4 x float> %8, <4 x float> %7, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %10 = fsub fast <4 x float> <float -0.000000e+00, float -0.000000e+00, float -0.000000e+00, float -0.000000e+00>, %9
  %11 = fcmp fast olt <4 x float> %1, zeroinitializer
  %12 = select reassoc nsz arcp contract afn <4 x i1> %11, <4 x float> %10, <4 x float> %9
  ret <4 x float> %12
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t.7 addrspace(1)* nocapture readonly, %struct._sampler_t.8 addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_fabs.v4f32(<4 x float>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare <4 x float> @air.fast_pow.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #2

attributes #0 = { argmemonly convergent nounwind readonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { nounwind readnone }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!air.visible = !{!8}
!air.compile_options = !{!15, !16, !17}
!llvm.ident = !{!18}
!air.version = !{!19}
!air.language_version = !{!20}
!air.source_file_name = !{!21}

!0 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!1 = !{i32 1, !"wchar_size", i32 4}
!2 = !{i32 7, !"air.max_device_buffers", i32 31}
!3 = !{i32 7, !"air.max_constant_buffers", i32 31}
!4 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!5 = !{i32 7, !"air.max_textures", i32 128}
!6 = !{i32 7, !"air.max_read_write_textures", i32 8}
!7 = !{i32 7, !"air.max_samplers", i32 16}
!8 = !{<4 x float> (<4 x float>, <4 x float>, <4 x float> addrspace(2)*)* @Hgc2GammaNoPremult_hgc_visible, !9, !11}
!9 = !{!10}
!10 = !{!"air.visible_output", !"air.arg_type_name", !"float4"}
!11 = !{!12, !13, !14}
!12 = !{i32 0, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!13 = !{i32 1, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"concat0"}
!14 = !{i32 2, !"air.visible_input", !"air.arg_type_name", !"float4", !"air.arg_name", !"params"}
!15 = !{!"air.compile.denorms_disable"}
!16 = !{!"air.compile.fast_math_enable"}
!17 = !{!"air.compile.framebuffer_fetch_enable"}
!18 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!19 = !{i32 2, i32 3, i32 0}
!20 = !{!"Metal", i32 2, i32 3, i32 0}
!21 = !{!"/Library/Caches/com.apple.xbs/Binaries/Helium/install/TempContent/Objects/Helium.build/HeliumRender_hgcCompile.build/DerivedSources/Hgc2GammaNoPremult_hgc_visible.metal"}
!22 = !{!23, !23, i64 0}
!23 = !{!"omnipotent char", !24, i64 0}
!24 = !{!"Simple C++ TBAA"}
!25 = !{!26}
!26 = distinct !{!26, !27, !"air-alias-scope-arg(4)"}
!27 = distinct !{!27, !"air-alias-scopes(Hgc2GammaNoPremult)"}
!28 = !{!29, !30}
!29 = distinct !{!29, !27, !"air-alias-scope-textures"}
!30 = distinct !{!30, !27, !"air-alias-scope-samplers"}
