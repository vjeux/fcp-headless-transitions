0x000000000123c9 -- filter12FragmentFunc:
source_filename = "filter12FragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state.2 = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8

; Function Attrs: convergent mustprogress nofree nounwind readonly willreturn
define <4 x float> @filter12FragmentFunc(<4 x float> %0, <2 x float> %1, <2 x float> %2, <2 x float> %3, <2 x float> %4, <2 x float> %5, <2 x float> %6, <2 x float> %7, <2 x float> %8, <2 x float> %9, <2 x float> %10, <2 x float> %11, <2 x float> %12, <2 x float> %13, <2 x float> %14, <2 x float> %15, <2 x float> %16, <2 x float> %17, <2 x float> %18, <2 x float> %19, <2 x float> %20, <2 x float> %21, <2 x float> %22, <2 x float> %23, <2 x float> %24, %struct._texture_2d_t addrspace(1)* %25) local_unnamed_addr #0 {
  %27 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %1, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %28 = extractvalue { <4 x float>, i8 } %27, 0
  %29 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %13, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %30 = extractvalue { <4 x float>, i8 } %29, 0
  %31 = fadd fast <4 x float> %30, %28
  %32 = fmul fast <4 x float> %31, <float 0x3FC4D38CE0000000, float 0x3FC4D38CE0000000, float 0x3FC4D38CE0000000, float 0x3FC4D38CE0000000>
  %33 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %2, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %34 = extractvalue { <4 x float>, i8 } %33, 0
  %35 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %14, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %36 = extractvalue { <4 x float>, i8 } %35, 0
  %37 = fadd fast <4 x float> %36, %34
  %38 = fmul fast <4 x float> %37, <float 0x3FC2891180000000, float 0x3FC2891180000000, float 0x3FC2891180000000, float 0x3FC2891180000000>
  %39 = fadd fast <4 x float> %38, %32
  %40 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %3, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %41 = extractvalue { <4 x float>, i8 } %40, 0
  %42 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %15, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %43 = extractvalue { <4 x float>, i8 } %42, 0
  %44 = fadd fast <4 x float> %43, %41
  %45 = fmul fast <4 x float> %44, <float 0x3FBD000CA0000000, float 0x3FBD000CA0000000, float 0x3FBD000CA0000000, float 0x3FBD000CA0000000>
  %46 = fadd fast <4 x float> %39, %45
  %47 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %4, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %48 = extractvalue { <4 x float>, i8 } %47, 0
  %49 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %16, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %50 = extractvalue { <4 x float>, i8 } %49, 0
  %51 = fadd fast <4 x float> %50, %48
  %52 = fmul fast <4 x float> %51, <float 0x3FB3485280000000, float 0x3FB3485280000000, float 0x3FB3485280000000, float 0x3FB3485280000000>
  %53 = fadd fast <4 x float> %46, %52
  %54 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %5, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %55 = extractvalue { <4 x float>, i8 } %54, 0
  %56 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %17, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %57 = extractvalue { <4 x float>, i8 } %56, 0
  %58 = fadd fast <4 x float> %57, %55
  %59 = fmul fast <4 x float> %58, <float 0x3FA3E35FC0000000, float 0x3FA3E35FC0000000, float 0x3FA3E35FC0000000, float 0x3FA3E35FC0000000>
  %60 = fadd fast <4 x float> %53, %59
  %61 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %6, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %62 = extractvalue { <4 x float>, i8 } %61, 0
  %63 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %18, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %64 = extractvalue { <4 x float>, i8 } %63, 0
  %65 = fadd fast <4 x float> %64, %62
  %66 = fmul fast <4 x float> %65, <float 0x3F84EAF900000000, float 0x3F84EAF900000000, float 0x3F84EAF900000000, float 0x3F84EAF900000000>
  %67 = fadd fast <4 x float> %60, %66
  %68 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %7, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %69 = extractvalue { <4 x float>, i8 } %68, 0
  %70 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %19, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %71 = extractvalue { <4 x float>, i8 } %70, 0
  %72 = fadd fast <4 x float> %71, %69
  %73 = fmul fast <4 x float> %72, <float 0xBF7DF416E0000000, float 0xBF7DF416E0000000, float 0xBF7DF416E0000000, float 0xBF7DF416E0000000>
  %74 = fadd fast <4 x float> %67, %73
  %75 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %8, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %76 = extractvalue { <4 x float>, i8 } %75, 0
  %77 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %20, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %78 = extractvalue { <4 x float>, i8 } %77, 0
  %79 = fadd fast <4 x float> %78, %76
  %80 = fmul fast <4 x float> %79, <float 0xBF8CA39740000000, float 0xBF8CA39740000000, float 0xBF8CA39740000000, float 0xBF8CA39740000000>
  %81 = fadd fast <4 x float> %74, %80
  %82 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %9, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %83 = extractvalue { <4 x float>, i8 } %82, 0
  %84 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %21, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %85 = extractvalue { <4 x float>, i8 } %84, 0
  %86 = fadd fast <4 x float> %85, %83
  %87 = fmul fast <4 x float> %86, <float 0xBF8A27A120000000, float 0xBF8A27A120000000, float 0xBF8A27A120000000, float 0xBF8A27A120000000>
  %88 = fadd fast <4 x float> %81, %87
  %89 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %10, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %90 = extractvalue { <4 x float>, i8 } %89, 0
  %91 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %22, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %92 = extractvalue { <4 x float>, i8 } %91, 0
  %93 = fadd fast <4 x float> %92, %90
  %94 = fmul fast <4 x float> %93, <float 0xBF80110A20000000, float 0xBF80110A20000000, float 0xBF80110A20000000, float 0xBF80110A20000000>
  %95 = fadd fast <4 x float> %88, %94
  %96 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %11, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %97 = extractvalue { <4 x float>, i8 } %96, 0
  %98 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %23, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %99 = extractvalue { <4 x float>, i8 } %98, 0
  %100 = fadd fast <4 x float> %99, %97
  %101 = fmul fast <4 x float> %100, <float 0xBF6835A120000000, float 0xBF6835A120000000, float 0xBF6835A120000000, float 0xBF6835A120000000>
  %102 = fadd fast <4 x float> %95, %101
  %103 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %12, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %104 = extractvalue { <4 x float>, i8 } %103, 0
  %105 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %25, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %24, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %106 = extractvalue { <4 x float>, i8 } %105, 0
  %107 = fadd fast <4 x float> %106, %104
  %108 = fmul fast <4 x float> %107, <float 0xBF34283800000000, float 0xBF34283800000000, float 0xBF34283800000000, float 0xBF34283800000000>
  %109 = fadd fast <4 x float> %102, %108
  %110 = extractelement <4 x float> %109, i64 3
  %111 = tail call fast float @air.fast_fmin.f32(float %110, float 1.000000e+00) #4
  %112 = tail call fast float @air.fast_fmax.f32(float %111, float 0.000000e+00) #4
  %113 = insertelement <4 x float> %109, float %112, i64 3
  ret <4 x float> %113
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmax.f32(float, float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmin.f32(float, float) local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
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
!air.sampler_states = !{!45}

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
!15 = !{<4 x float> (<4 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, <2 x float>, %struct._texture_2d_t addrspace(1)*)* @filter12FragmentFunc, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!18 = !{!19, !20, !21, !22, !23, !24, !25, !26, !27, !28, !29, !30, !31, !32, !33, !34, !35, !36, !37, !38, !39, !40, !41, !42, !43, !44}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(6left00Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left00"}
!21 = !{i32 2, !"air.fragment_input", !"generated(6left01Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left01"}
!22 = !{i32 3, !"air.fragment_input", !"generated(6left02Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left02"}
!23 = !{i32 4, !"air.fragment_input", !"generated(6left03Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left03"}
!24 = !{i32 5, !"air.fragment_input", !"generated(6left04Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left04"}
!25 = !{i32 6, !"air.fragment_input", !"generated(6left05Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left05"}
!26 = !{i32 7, !"air.fragment_input", !"generated(6left06Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left06"}
!27 = !{i32 8, !"air.fragment_input", !"generated(6left07Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left07"}
!28 = !{i32 9, !"air.fragment_input", !"generated(6left08Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left08"}
!29 = !{i32 10, !"air.fragment_input", !"generated(6left09Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left09"}
!30 = !{i32 11, !"air.fragment_input", !"generated(6left10Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left10"}
!31 = !{i32 12, !"air.fragment_input", !"generated(6left11Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"left11"}
!32 = !{i32 13, !"air.fragment_input", !"generated(7right00Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right00"}
!33 = !{i32 14, !"air.fragment_input", !"generated(7right01Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right01"}
!34 = !{i32 15, !"air.fragment_input", !"generated(7right02Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right02"}
!35 = !{i32 16, !"air.fragment_input", !"generated(7right03Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right03"}
!36 = !{i32 17, !"air.fragment_input", !"generated(7right04Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right04"}
!37 = !{i32 18, !"air.fragment_input", !"generated(7right05Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right05"}
!38 = !{i32 19, !"air.fragment_input", !"generated(7right06Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right06"}
!39 = !{i32 20, !"air.fragment_input", !"generated(7right07Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right07"}
!40 = !{i32 21, !"air.fragment_input", !"generated(7right08Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right08"}
!41 = !{i32 22, !"air.fragment_input", !"generated(7right09Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right09"}
!42 = !{i32 23, !"air.fragment_input", !"generated(7right10Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right10"}
!43 = !{i32 24, !"air.fragment_input", !"generated(7right11Dv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"right11"}
!44 = !{i32 25, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"tex"}
!45 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state.2}

