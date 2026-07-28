0x00000000001c59 -- bicubicDownscale:
source_filename = "bicubicDownscale"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant [2 x i64] [i64 34901797601023049, i64 0], align 8

; Function Attrs: convergent mustprogress nounwind willreturn
define void @bicubicDownscale(%struct._texture_2d_t addrspace(1)* %0, %struct._texture_2d_t addrspace(1)* %1, <2 x i16> noundef %2) local_unnamed_addr #0 {
  %4 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %1, i32 0) #5, !alias.scope !22
  %5 = tail call fast float @air.convert.f.f32.u.i32(i32 %4) #6
  %6 = insertelement <2 x float> undef, float %5, i64 0
  %7 = tail call i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %1, i32 0) #5, !alias.scope !22
  %8 = tail call fast float @air.convert.f.f32.u.i32(i32 %7) #6
  %9 = insertelement <2 x float> %6, float %8, i64 1
  %10 = tail call fast <2 x float> @air.convert.f.v2f32.u.v2i16(<2 x i16> %2) #6
  %11 = fadd fast <2 x float> %10, <float 5.000000e-01, float 5.000000e-01>
  %12 = fdiv fast <2 x float> %11, %9
  %13 = tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %12, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #7
  %14 = extractvalue { <4 x half>, i8 } %13, 0
  tail call void @air.write_texture_2d.i16.v4f16(%struct._texture_2d_t addrspace(1)* nocapture %1, <2 x i16> %2, <4 x half> %14, i16 0, i32 2) #8, !alias.scope !22
  ret void
}

; Function Attrs: argmemonly mustprogress nounwind willreturn
declare void @air.write_texture_2d.i16.v4f16(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i16>, <4 x half>, i16, i32) local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <2 x float> @air.convert.f.v2f32.u.v2i16(<2 x i16>) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.convert.f.f32.u.i32(i32) local_unnamed_addr #3

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #4

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #4

attributes #0 = { convergent mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="64" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly mustprogress nounwind willreturn }
attributes #2 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #3 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #4 = { argmemonly mustprogress nofree nounwind readonly willreturn }
attributes #5 = { argmemonly nounwind readonly willreturn }
attributes #6 = { nounwind readnone willreturn }
attributes #7 = { argmemonly convergent nounwind readonly willreturn }
attributes #8 = { argmemonly nounwind willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.kernel = !{!15}
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
!15 = !{void (%struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, <2 x i16>)* @bicubicDownscale, !16, !17}
!16 = !{}
!17 = !{!18, !19, !20}
!18 = !{i32 0, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<half, sample>", !"air.arg_name", !"inTex"}
!19 = !{i32 1, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<half, write>", !"air.arg_name", !"outTex"}
!20 = !{i32 2, !"air.thread_position_in_grid", !"air.arg_type_name", !"ushort2", !"air.arg_name", !"gid"}
!21 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state}
!22 = !{!23}
!23 = distinct !{!23, !24, !"air-alias-scope-textures"}
!24 = distinct !{!24, !"air-alias-scopes(bicubicDownscale)"}

