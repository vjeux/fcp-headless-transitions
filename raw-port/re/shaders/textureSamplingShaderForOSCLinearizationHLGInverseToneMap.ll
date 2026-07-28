0x0000000001c100 -- textureSamplingShaderForOSCLinearizationHLGInverseToneMap:
source_filename = "textureSamplingShaderForOSCLinearizationHLGInverseToneMap"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8
@llvm.global_ctors = appending global [0 x { i32, void ()*, i8* }] zeroinitializer

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
define <4 x half> @textureSamplingShaderForOSCLinearizationHLGInverseToneMap(<4 x float> %0, <2 x float> %1, %struct._texture_2d_t addrspace(1)* nocapture readonly %2) local_unnamed_addr #0 {
  %4 = tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %1, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %5 = extractvalue { <4 x half>, i8 } %4, 0
  %6 = extractelement <4 x half> %5, i64 3
  %7 = fcmp fast oge half %6, 0xH0011
  %8 = tail call fast float @air.convert.f.f32.u.i1(i1 %7) #4
  %9 = fptrunc float %8 to half
  %10 = insertelement <3 x half> poison, half %9, i64 0
  %11 = shufflevector <3 x half> %10, <3 x half> poison, <3 x i32> zeroinitializer
  %12 = shufflevector <4 x half> %5, <4 x half> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %13 = fmul fast <3 x half> %11, %12
  %14 = tail call fast half @air.fmax.f16(half %6, half 0xH0011) #4
  %15 = insertelement <3 x half> poison, half %14, i64 0
  %16 = shufflevector <3 x half> %15, <3 x half> poison, <3 x i32> zeroinitializer
  %17 = fdiv fast <3 x half> %13, %16
  %18 = tail call fast <3 x half> @air.fmin.v3f16(<3 x half> %17, <3 x half> <half 0xH4100, half 0xH4100, half 0xH4100>) #4
  %19 = tail call fast <3 x half> @air.pow.v3f16(<3 x half> %18, <3 x half> <half 0xH4066, half 0xH4066, half 0xH4066>) #4
  %20 = shufflevector <3 x half> %19, <3 x half> poison, <3 x i32> zeroinitializer
  %21 = fmul fast <3 x half> %20, <half 0xH3905, half 0xH2C6C, half 0xH2432>
  %22 = shufflevector <3 x half> %19, <3 x half> undef, <3 x i32> <i32 1, i32 1, i32 1>
  %23 = fmul fast <3 x half> %22, <half 0xH3545, half 0xH3B5B, half 0xH2DA2>
  %24 = fadd fast <3 x half> %21, %23
  %25 = shufflevector <3 x half> %19, <3 x half> undef, <3 x i32> <i32 2, i32 2, i32 2>
  %26 = fmul fast <3 x half> %25, <half 0xH298B, half 0xH21D1, half 0xH3B2A>
  %27 = fadd fast <3 x half> %24, %26
  %28 = tail call fast half @air.dot.v3f16(<3 x half> <half 0xH3434, half 0xH396D, half 0xH2B97>, <3 x half> %27) #4
  %29 = fcmp fast ogt half %28, 0xH0000
  br i1 %29, label %30, label %35

30:                                               ; preds = %3
  %31 = fpext half %28 to float
  %32 = tail call fast float @air.fast_pow.f32(float %31, float 0x3FC75122C0000000) #4
  %33 = fmul fast float %32, 1.200000e+01
  %34 = fptrunc float %33 to half
  br label %35

35:                                               ; preds = %30, %3
  %36 = phi half [ %34, %30 ], [ 0xH0000, %3 ]
  %37 = insertelement <3 x half> poison, half %36, i64 0
  %38 = shufflevector <3 x half> %37, <3 x half> poison, <3 x i32> zeroinitializer
  %39 = shufflevector <4 x half> %5, <4 x half> undef, <3 x i32> <i32 3, i32 3, i32 3>
  %40 = fmul fast <3 x half> %27, %39
  %41 = fmul fast <3 x half> %40, %38
  %42 = shufflevector <3 x half> %41, <3 x half> poison, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %43 = shufflevector <4 x half> %42, <4 x half> %5, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  ret <4 x half> %43
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_pow.f32(float, float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare half @air.dot.v3f16(<3 x half>, <3 x half>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <3 x half> @air.pow.v3f16(<3 x half>, <3 x half>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <3 x half> @air.fmin.v3f16(<3 x half>, <3 x half>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare half @air.fmax.f16(half, half) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.convert.f.f32.u.i1(i1) local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
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
!air.sampler_states = !{!22}

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
!15 = !{<4 x half> (<4 x float>, <2 x float>, %struct._texture_2d_t addrspace(1)*)* @textureSamplingShaderForOSCLinearizationHLGInverseToneMap, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"half4"}
!18 = !{!19, !20, !21}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"clipSpacePosition", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(17textureCoordinateDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"textureCoordinate"}
!21 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<half, sample>", !"air.arg_name", !"colorTexture"}
!22 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state}
Disassembly of section REFLECTION_LIST:
