0x0000000000462b -- vertex_main:
source_filename = "vertex_main"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

; Function Attrs: mustprogress nofree norecurse nosync nounwind readnone willreturn
define <{ <4 x float>, <2 x float>, i16 }> @vertex_main([4 x float] addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %0, [2 x float] addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %1, float addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %2, float addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %3, i16 noundef %4, i16 noundef %5) local_unnamed_addr #0 {
  %7 = zext i16 %4 to i64
  %8 = getelementptr inbounds [4 x float], [4 x float] addrspace(2)* %0, i64 %7, i64 0
  %9 = load float, float addrspace(2)* %8, align 4, !alias.scope !27, !noalias !30
  %10 = getelementptr inbounds [4 x float], [4 x float] addrspace(2)* %0, i64 %7, i64 1
  %11 = load float, float addrspace(2)* %10, align 4, !alias.scope !27, !noalias !30
  %12 = insertelement <4 x float> poison, float %11, i64 1
  %13 = getelementptr inbounds [4 x float], [4 x float] addrspace(2)* %0, i64 %7, i64 2
  %14 = load float, float addrspace(2)* %13, align 4, !alias.scope !27, !noalias !30
  %15 = insertelement <4 x float> %12, float %14, i64 2
  %16 = getelementptr inbounds [4 x float], [4 x float] addrspace(2)* %0, i64 %7, i64 3
  %17 = load float, float addrspace(2)* %16, align 4, !alias.scope !27, !noalias !30
  %18 = insertelement <4 x float> %15, float %17, i64 3
  %19 = load float, float addrspace(2)* %3, align 4, !tbaa !34, !alias.scope !38, !noalias !39
  %20 = fmul fast float %19, %9
  %21 = zext i16 %5 to i64
  %22 = getelementptr inbounds float, float addrspace(2)* %2, i64 %21
  %23 = load float, float addrspace(2)* %22, align 4, !tbaa !34, !alias.scope !40, !noalias !41
  %24 = fadd fast float %20, %23
  %25 = insertelement <4 x float> %18, float %24, i64 0
  %26 = getelementptr inbounds [2 x float], [2 x float] addrspace(2)* %1, i64 %7, i64 0
  %27 = load float, float addrspace(2)* %26, align 4, !alias.scope !42, !noalias !43
  %28 = insertelement <2 x float> undef, float %27, i64 0
  %29 = getelementptr inbounds [2 x float], [2 x float] addrspace(2)* %1, i64 %7, i64 1
  %30 = load float, float addrspace(2)* %29, align 4, !alias.scope !42, !noalias !43
  %31 = insertelement <2 x float> %28, float %30, i64 1
  %32 = insertvalue <{ <4 x float>, <2 x float>, i16 }> undef, <4 x float> %25, 0
  %33 = insertvalue <{ <4 x float>, <2 x float>, i16 }> %32, <2 x float> %31, 1
  %34 = insertvalue <{ <4 x float>, <2 x float>, i16 }> %33, i16 %5, 2
  ret <{ <4 x float>, <2 x float>, i16 }> %34
}

attributes #0 = { mustprogress nofree norecurse nosync nounwind readnone willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }

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
!15 = !{<{ <4 x float>, <2 x float>, i16 }> ([4 x float] addrspace(2)*, [2 x float] addrspace(2)*, float addrspace(2)*, float addrspace(2)*, i16, i16)* @vertex_main, !16, !20}
!16 = !{!17, !18, !19}
!17 = !{!"air.position", !"air.arg_type_name", !"float4", !"air.arg_name", !"m_Position"}
!18 = !{!"air.vertex_output", !"user(texturecoord)", !"air.arg_type_name", !"float2", !"air.arg_name", !"m_TexCoord"}
!19 = !{!"air.vertex_output", !"generated(4m_IDt)", !"air.arg_type_name", !"ushort", !"air.arg_name", !"m_ID"}
!20 = !{!21, !22, !23, !24, !25, !26}
!21 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"packed_float4", !"air.arg_name", !"positions"}
!22 = !{i32 1, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"packed_float2", !"air.arg_name", !"texCoords"}
!23 = !{i32 2, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"perInstanceTranslation"}
!24 = !{i32 3, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"barWidth"}
!25 = !{i32 4, !"air.vertex_id", !"air.arg_type_name", !"ushort", !"air.arg_name", !"vid"}
!26 = !{i32 5, !"air.instance_id", !"air.arg_type_name", !"ushort", !"air.arg_name", !"iid"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !"air-alias-scopes(vertex_main)"}
!30 = !{!31, !32, !33}
!31 = distinct !{!31, !29, !"air-alias-scope-arg(1)"}
!32 = distinct !{!32, !29, !"air-alias-scope-arg(2)"}
!33 = distinct !{!33, !29, !"air-alias-scope-arg(3)"}
!34 = !{!35, !35, i64 0}
!35 = !{!"float", !36, i64 0}
!36 = !{!"omnipotent char", !37, i64 0}
!37 = !{!"Simple C++ TBAA"}
!38 = !{!33}
!39 = !{!28, !31, !32}
!40 = !{!32}
!41 = !{!28, !31, !33}
!42 = !{!31}
!43 = !{!28, !32, !33}

