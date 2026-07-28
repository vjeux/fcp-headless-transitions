0x00000000019e60 -- textureSamplingShaderForOSCLinearization:
source_filename = "textureSamplingShaderForOSCLinearization"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8
@llvm.global_ctors = appending global [0 x { i32, void ()*, i8* }] zeroinitializer

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
define <4 x half> @textureSamplingShaderForOSCLinearization(<4 x float> %0, <2 x float> %1, %struct._texture_2d_t addrspace(1)* nocapture readonly %2) local_unnamed_addr #0 {
  %4 = tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %1, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %5 = extractvalue { <4 x half>, i8 } %4, 0
  %6 = extractelement <4 x half> %5, i64 3
  %7 = fcmp fast ogt half %6, 0xH0000
  br i1 %7, label %8, label %12

8:                                                ; preds = %3
  %9 = fmul fast half %6, 0xH45C8
  %10 = tail call fast half @air.tanh.f16(half %9) #4
  %11 = tail call fast half @air.fmin.f16(half %10, half 0xH3C00) #4
  br label %12

12:                                               ; preds = %8, %3
  %13 = phi half [ %11, %8 ], [ 0xH0000, %3 ]
  %14 = fcmp fast oge half %6, 0xH0011
  %15 = tail call fast float @air.convert.f.f32.u.i1(i1 %14) #4
  %16 = fptrunc float %15 to half
  %17 = insertelement <3 x half> poison, half %16, i64 0
  %18 = shufflevector <3 x half> %17, <3 x half> poison, <3 x i32> zeroinitializer
  %19 = shufflevector <4 x half> %5, <4 x half> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %20 = fmul fast <3 x half> %18, %19
  %21 = tail call fast half @air.fmax.f16(half %6, half 0xH0011) #4
  %22 = insertelement <3 x half> poison, half %21, i64 0
  %23 = shufflevector <3 x half> %22, <3 x half> poison, <3 x i32> zeroinitializer
  %24 = fdiv fast <3 x half> %20, %23
  %25 = tail call fast <3 x half> @air.fmin.v3f16(<3 x half> %24, <3 x half> <half 0xH3E00, half 0xH3E00, half 0xH3E00>) #4
  %26 = tail call fast <3 x half> @air.pow.v3f16(<3 x half> %25, <3 x half> <half 0xH4066, half 0xH4066, half 0xH4066>) #4
  %27 = shufflevector <3 x half> %26, <3 x half> poison, <3 x i32> zeroinitializer
  %28 = fmul fast <3 x half> %27, <half 0xH3905, half 0xH2C6C, half 0xH2432>
  %29 = shufflevector <3 x half> %26, <3 x half> undef, <3 x i32> <i32 1, i32 1, i32 1>
  %30 = fmul fast <3 x half> %29, <half 0xH3545, half 0xH3B5B, half 0xH2DA2>
  %31 = fadd fast <3 x half> %28, %30
  %32 = shufflevector <3 x half> %26, <3 x half> undef, <3 x i32> <i32 2, i32 2, i32 2>
  %33 = fmul fast <3 x half> %32, <half 0xH298B, half 0xH21D1, half 0xH3B2A>
  %34 = fadd fast <3 x half> %31, %33
  %35 = shufflevector <4 x half> %5, <4 x half> undef, <3 x i32> <i32 3, i32 3, i32 3>
  %36 = fmul fast <3 x half> %35, <half 0xH4000, half 0xH4000, half 0xH4000>
  %37 = fmul fast <3 x half> %36, %34
  %38 = shufflevector <3 x half> %37, <3 x half> poison, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %39 = insertelement <4 x half> %38, half %13, i64 3
  ret <4 x half> %39
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <3 x half> @air.pow.v3f16(<3 x half>, <3 x half>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <3 x half> @air.fmin.v3f16(<3 x half>, <3 x half>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare half @air.fmax.f16(half, half) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.convert.f.f32.u.i1(i1) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare half @air.fmin.f16(half, half) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare half @air.tanh.f16(half) local_unnamed_addr #1

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
!15 = !{<4 x half> (<4 x float>, <2 x float>, %struct._texture_2d_t addrspace(1)*)* @textureSamplingShaderForOSCLinearization, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"half4"}
!18 = !{!19, !20, !21}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"clipSpacePosition", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(17textureCoordinateDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"textureCoordinate"}
!21 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<half, sample>", !"air.arg_name", !"colorTexture"}
!22 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state}

