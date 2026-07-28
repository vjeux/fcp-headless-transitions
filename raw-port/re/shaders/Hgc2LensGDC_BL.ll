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

