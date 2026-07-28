0x00000000025729 -- depthPeel:
source_filename = "depthPeel"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._depth_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state.2 = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8

; Function Attrs: convergent mustprogress nounwind willreturn
define float @depthPeel(<3 x float> noundef %0, %struct._depth_2d_t addrspace(1)* nocapture readonly %1) local_unnamed_addr #0 {
  %3 = shufflevector <3 x float> %0, <3 x float> poison, <2 x i32> <i32 0, i32 1>
  %4 = tail call { float, i8 } @air.sample_depth_2d.f32(%struct._depth_2d_t addrspace(1)* nocapture readonly %1, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), i32 1, <2 x float> %3, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %5 = extractvalue { float, i8 } %4, 0
  %6 = fmul fast float %5, %5
  %7 = fsub fast float 1.000000e+00, %6
  %8 = fmul fast float %7, 0x3F647AE140000000
  %9 = extractelement <3 x float> %0, i64 2
  %10 = fsub fast float %9, %8
  %11 = fcmp fast olt float %10, %5
  br i1 %11, label %12, label %13

12:                                               ; preds = %2
  tail call void @air.discard_fragment() #4
  br label %13

13:                                               ; preds = %12, %2
  %14 = phi float [ 0.000000e+00, %12 ], [ 1.000000e+00, %2 ]
  ret float %14
}

; Function Attrs: mustprogress nounwind willreturn
declare void @air.discard_fragment() local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { float, i8 } @air.sample_depth_2d.f32(%struct._depth_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, i32, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { convergent mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="96" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nounwind willreturn }
attributes #2 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #3 = { argmemonly convergent nounwind readonly willreturn }
attributes #4 = { nounwind willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.visible = !{!15}
!air.sampler_states = !{!21}

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
!15 = !{float (<3 x float>, %struct._depth_2d_t addrspace(1)*)* @depthPeel, !16, !18}
!16 = !{!17}
!17 = !{!"air.visible_output", !"air.arg_type_name", !"float"}
!18 = !{!19, !20}
!19 = !{i32 0, !"air.visible_input", !"air.arg_type_name", !"float3", !"air.arg_name", !"screenNDC"}
!20 = !{i32 1, !"air.visible_input", !"air.arg_type_name", !"__metal_depth_2d_t", !"air.arg_name", !"t"}
!21 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state.2}
Disassembly of section REFLECTION_LIST:
