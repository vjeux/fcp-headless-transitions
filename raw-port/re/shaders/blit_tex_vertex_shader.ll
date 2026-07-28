0x0000000000f850 -- blit_tex_vertex_shader:
source_filename = "blit_tex_vertex_shader"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%"struct.metal::matrix" = type { [4 x <4 x float>] }

@llvm.global_ctors = appending global [0 x { i32, void ()*, i8* }] zeroinitializer

; Function Attrs: argmemonly mustprogress nofree nosync nounwind willreturn
define <{ <4 x float>, <4 x float>, <2 x float>, float }> @blit_tex_vertex_shader(i32 noundef %0, <2 x float> addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %1, <2 x float> addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %2, %"struct.metal::matrix" addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %3) local_unnamed_addr #0 {
  %5 = getelementptr inbounds %"struct.metal::matrix", %"struct.metal::matrix" addrspace(2)* %3, i64 0, i32 0, i64 0
  %6 = load <4 x float>, <4 x float> addrspace(2)* %5, align 16, !tbaa.struct !26, !alias.scope !30, !noalias !33
  %7 = getelementptr inbounds %"struct.metal::matrix", %"struct.metal::matrix" addrspace(2)* %3, i64 0, i32 0, i64 1
  %8 = load <4 x float>, <4 x float> addrspace(2)* %7, align 16, !tbaa.struct !36, !alias.scope !30, !noalias !33
  %9 = getelementptr inbounds %"struct.metal::matrix", %"struct.metal::matrix" addrspace(2)* %3, i64 0, i32 0, i64 2
  %10 = load <4 x float>, <4 x float> addrspace(2)* %9, align 16, !tbaa.struct !37, !alias.scope !30, !noalias !33
  %11 = getelementptr inbounds %"struct.metal::matrix", %"struct.metal::matrix" addrspace(2)* %3, i64 0, i32 0, i64 3
  %12 = load <4 x float>, <4 x float> addrspace(2)* %11, align 16, !tbaa.struct !38, !alias.scope !30, !noalias !33
  %13 = zext i32 %0 to i64
  %14 = getelementptr inbounds <2 x float>, <2 x float> addrspace(2)* %1, i64 %13
  %15 = load <2 x float>, <2 x float> addrspace(2)* %14, align 8, !tbaa !27, !alias.scope !39, !noalias !40
  %16 = shufflevector <2 x float> %15, <2 x float> poison, <4 x i32> <i32 0, i32 1, i32 undef, i32 undef>
  %17 = shufflevector <4 x float> %16, <4 x float> <float poison, float poison, float 0.000000e+00, float 1.000000e+00>, <4 x i32> <i32 0, i32 1, i32 6, i32 7>
  %18 = tail call fast float @air.dot.v4f32(<4 x float> %17, <4 x float> %6) #2
  %19 = insertelement <4 x float> undef, float %18, i64 0
  %20 = tail call fast float @air.dot.v4f32(<4 x float> %17, <4 x float> %8) #2
  %21 = insertelement <4 x float> %19, float %20, i64 1
  %22 = tail call fast float @air.dot.v4f32(<4 x float> %17, <4 x float> %10) #2
  %23 = insertelement <4 x float> %21, float %22, i64 2
  %24 = tail call fast float @air.dot.v4f32(<4 x float> %17, <4 x float> %12) #2
  %25 = insertelement <4 x float> %23, float %24, i64 3
  %26 = getelementptr inbounds <2 x float>, <2 x float> addrspace(2)* %2, i64 %13
  %27 = load <2 x float>, <2 x float> addrspace(2)* %26, align 8, !tbaa !27, !alias.scope !41, !noalias !42
  %28 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> undef, <4 x float> %25, 0
  %29 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> %28, <2 x float> %27, 2
  ret <{ <4 x float>, <4 x float>, <2 x float>, float }> %29
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #1

attributes #0 = { argmemonly mustprogress nofree nosync nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { nounwind readnone willreturn }

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
!15 = !{<{ <4 x float>, <4 x float>, <2 x float>, float }> (i32, <2 x float> addrspace(2)*, <2 x float> addrspace(2)*, %"struct.metal::matrix" addrspace(2)*)* @blit_tex_vertex_shader, !16, !21}
!16 = !{!17, !18, !19, !20}
!17 = !{!"air.position", !"air.arg_type_name", !"float4", !"air.arg_name", !"P"}
!18 = !{!"air.vertex_output", !"generated(2CsDv4_f)", !"air.arg_type_name", !"float4", !"air.arg_name", !"Cs"}
!19 = !{!"air.vertex_output", !"generated(2stDv2_f)", !"air.arg_type_name", !"float2", !"air.arg_name", !"st"}
!20 = !{!"air.point_size", !"air.arg_type_name", !"float", !"air.arg_name", !"pointsize"}
!21 = !{!22, !23, !24, !25}
!22 = !{i32 0, !"air.vertex_id", !"air.arg_type_name", !"uint", !"air.arg_name", !"idx"}
!23 = !{i32 1, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"float2", !"air.arg_name", !"P"}
!24 = !{i32 2, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"float2", !"air.arg_name", !"st"}
!25 = !{i32 3, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 64, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4x4", !"air.arg_name", !"matrix"}
!26 = !{i64 0, i64 64, !27}
!27 = !{!28, !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{!31}
!31 = distinct !{!31, !32, !"air-alias-scope-arg(3)"}
!32 = distinct !{!32, !"air-alias-scopes(blit_tex_vertex_shader)"}
!33 = !{!34, !35}
!34 = distinct !{!34, !32, !"air-alias-scope-arg(1)"}
!35 = distinct !{!35, !32, !"air-alias-scope-arg(2)"}
!36 = !{i64 0, i64 48, !27}
!37 = !{i64 0, i64 32, !27}
!38 = !{i64 0, i64 16, !27}
!39 = !{!34}
!40 = !{!35, !31}
!41 = !{!35}
!42 = !{!34, !31}

