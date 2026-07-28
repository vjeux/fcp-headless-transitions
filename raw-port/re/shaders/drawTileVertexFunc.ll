0x00000000003e39 -- drawTileVertexFunc:
source_filename = "drawTileVertexFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%"struct.metal::matrix" = type { [4 x <4 x float>] }

; Function Attrs: mustprogress nofree norecurse nosync nounwind readnone willreturn
define <{ <4 x float>, <2 x float> }> @drawTileVertexFunc(<2 x float> %0, <2 x float> %1, %"struct.metal::matrix" addrspace(2)* nocapture noundef readonly align 16 dereferenceable(64) "air-buffer-no-alias" %2) local_unnamed_addr #0 {
  %4 = getelementptr inbounds %"struct.metal::matrix", %"struct.metal::matrix" addrspace(2)* %2, i64 0, i32 0, i64 0
  %5 = load <4 x float>, <4 x float> addrspace(2)* %4, align 16, !tbaa !23, !alias.scope !26
  %6 = shufflevector <2 x float> %0, <2 x float> undef, <4 x i32> zeroinitializer
  %7 = fmul fast <4 x float> %5, %6
  %8 = getelementptr inbounds %"struct.metal::matrix", %"struct.metal::matrix" addrspace(2)* %2, i64 0, i32 0, i64 1
  %9 = load <4 x float>, <4 x float> addrspace(2)* %8, align 16, !tbaa !23, !alias.scope !26
  %10 = shufflevector <2 x float> %0, <2 x float> undef, <4 x i32> <i32 1, i32 1, i32 1, i32 1>
  %11 = fmul fast <4 x float> %9, %10
  %12 = fadd fast <4 x float> %11, %7
  %13 = getelementptr inbounds %"struct.metal::matrix", %"struct.metal::matrix" addrspace(2)* %2, i64 0, i32 0, i64 3
  %14 = load <4 x float>, <4 x float> addrspace(2)* %13, align 16, !tbaa !23, !alias.scope !26
  %15 = fadd fast <4 x float> %12, %14
  %16 = insertvalue <{ <4 x float>, <2 x float> }> undef, <4 x float> %15, 0
  %17 = insertvalue <{ <4 x float>, <2 x float> }> %16, <2 x float> %1, 1
  ret <{ <4 x float>, <2 x float> }> %17
}

attributes #0 = { mustprogress nofree norecurse nosync nounwind readnone willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.vertex = !{!15}

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
!15 = !{<{ <4 x float>, <2 x float> }> (<2 x float>, <2 x float>, %"struct.metal::matrix" addrspace(2)*)* @drawTileVertexFunc, !16, !19}
!16 = !{!17, !18}
!17 = !{!"air.position", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!18 = !{!"air.vertex_output", !"generated(2uvDv2_f)", !"air.arg_type_name", !"float2", !"air.arg_name", !"uv"}
!19 = !{!20, !21, !22}
!20 = !{i32 0, !"air.vertex_input", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"float2", !"air.arg_name", !"position"}
!21 = !{i32 1, !"air.vertex_input", !"air.location_index", i32 1, i32 1, !"air.arg_type_name", !"float2", !"air.arg_name", !"texCoord"}
!22 = !{i32 2, !"air.buffer", !"air.buffer_size", i32 64, !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 64, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4x4", !"air.arg_name", !"mvp"}
!23 = !{!24, !24, i64 0}
!24 = !{!"omnipotent char", !25, i64 0}
!25 = !{!"Simple C++ TBAA"}
!26 = !{!27}
!27 = distinct !{!27, !28, !"air-alias-scope-arg(2)"}
!28 = distinct !{!28, !"air-alias-scopes(drawTileVertexFunc)"}

