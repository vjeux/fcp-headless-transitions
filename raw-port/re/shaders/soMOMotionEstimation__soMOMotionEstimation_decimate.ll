0x000000000c504d -- soMOMotionEstimation::soMOMotionEstimation_decimate:
source_filename = "soMOMotionEstimation::soMOMotionEstimation_decimate"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant i64 -9188470239253725184, align 8

; Function Attrs: convergent nounwind
define void @"soMOMotionEstimation::soMOMotionEstimation_decimate"(<2 x i32> %0, %struct._texture_2d_t addrspace(1)* %1, %struct._texture_2d_t addrspace(1)* %2) local_unnamed_addr #0 {
  %4 = extractelement <2 x i32> %0, i64 0
  %5 = extractelement <2 x i32> %0, i64 1
  %6 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, i32 0) #4, !alias.scope !21
  %7 = icmp slt i32 %4, %6
  br i1 %7, label %8, label %21

8:                                                ; preds = %3
  %9 = tail call i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, i32 0) #4, !alias.scope !21
  %10 = icmp slt i32 %5, %9
  br i1 %10, label %11, label %21

11:                                               ; preds = %8
  %12 = shl i32 %4, 1
  %13 = tail call float @air.convert.f.f32.s.i32(i32 %12) #3
  %14 = insertelement <2 x float> undef, float %13, i64 0
  %15 = shl i32 %5, 1
  %16 = tail call float @air.convert.f.f32.s.i32(i32 %15) #3
  %17 = insertelement <2 x float> %14, float %16, i64 1
  %18 = fadd <2 x float> %17, <float 5.000000e-01, float 5.000000e-01>
  %19 = tail call { <4 x i32>, i8 } @air.sample_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture readonly %1, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %18, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2
  %20 = extractvalue { <4 x i32>, i8 } %19, 0
  tail call void @air.write_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture %2, <2 x i32> %0, <4 x i32> %20, i32 0, i32 2) #1, !alias.scope !21
  br label %21

21:                                               ; preds = %11, %8, %3
  ret void
}

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x i32>, i32, i32) local_unnamed_addr #1

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x i32>, i8 } @air.sample_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #3

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #4

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #4

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly nounwind }
attributes #2 = { argmemonly convergent nounwind readonly }
attributes #3 = { nounwind readnone }
attributes #4 = { argmemonly nounwind readonly }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!llvm.ident = !{!8}
!air.version = !{!9}
!air.language_version = !{!10}
!air.compile_options = !{!11, !12, !13}
!air.kernel = !{!14}
!air.sampler_states = !{!20}

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
!12 = !{!"air.compile.fast_math_disable"}
!13 = !{!"air.compile.framebuffer_fetch_enable"}
!14 = !{void (<2 x i32>, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*)* @"soMOMotionEstimation::soMOMotionEstimation_decimate", !15, !16}
!15 = !{}
!16 = !{!17, !18, !19}
!17 = !{i32 0, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!18 = !{i32 1, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<uint, sample>", !"air.arg_name", !"src"}
!19 = !{i32 2, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<uint, write>", !"air.arg_name", !"dst"}
!20 = !{!"air.sampler_state", i64 addrspace(2)* @__air_sampler_state}
!21 = !{!22}
!22 = distinct !{!22, !23, !"air-alias-scope-textures"}
!23 = distinct !{!23, !"air-alias-scopes(soMOMotionEstimation::soMOMotionEstimation_decimate)"}

