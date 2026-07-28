0x00000000000b0b -- kernel_fade:
source_filename = "kernel_fade"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque

; Function Attrs: mustprogress nounwind willreturn
define void @kernel_fade(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, %struct._texture_2d_t addrspace(1)* %1, float addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %2, <2 x i32> noundef %3) local_unnamed_addr #0 {
  %5 = tail call { <4 x float>, i8 } @air.read_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, <2 x i32> %3, i32 0, i32 1) #3, !alias.scope !22, !noalias !25
  %6 = extractvalue { <4 x float>, i8 } %5, 0
  %7 = load float, float addrspace(2)* %2, align 4, !tbaa !27, !alias.scope !25, !noalias !22
  %8 = extractelement <4 x float> %6, i64 3
  %9 = fsub fast float %8, %7
  %10 = insertelement <4 x float> %6, float %9, i64 3
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %1, <2 x i32> %3, <4 x float> %10, i32 0, i32 2) #4, !alias.scope !22, !noalias !25
  ret void
}

; Function Attrs: argmemonly mustprogress nounwind willreturn
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #1

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.read_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, <2 x i32>, i32, i32) local_unnamed_addr #2

attributes #0 = { mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly mustprogress nounwind willreturn }
attributes #2 = { argmemonly mustprogress nofree nounwind readonly willreturn }
attributes #3 = { argmemonly nounwind readonly willreturn }
attributes #4 = { argmemonly nounwind willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.kernel = !{!15}

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
!15 = !{void (%struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, float addrspace(2)*, <2 x i32>)* @kernel_fade, !16, !17}
!16 = !{}
!17 = !{!18, !19, !20, !21}
!18 = !{i32 0, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.read", !"air.arg_type_name", !"texture2d<float, read>", !"air.arg_name", !"inTexture"}
!19 = !{i32 1, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"outTexture"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"parameters"}
!21 = !{i32 3, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"gid"}
!22 = !{!23}
!23 = distinct !{!23, !24, !"air-alias-scope-textures"}
!24 = distinct !{!24, !"air-alias-scopes(kernel_fade)"}
!25 = !{!26}
!26 = distinct !{!26, !24, !"air-alias-scope-arg(2)"}
!27 = !{!28, !28, i64 0}
!28 = !{!"float", !29, i64 0}
!29 = !{!"omnipotent char", !30, i64 0}
!30 = !{!"Simple C++ TBAA"}

