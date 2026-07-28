0x00000000013f50 -- triangleVertexShader:
source_filename = "triangleVertexShader"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.AAPLTriangleVertexWithColor = type { <2 x float>, <4 x float> }

@llvm.global_ctors = appending global [0 x { i32, void ()*, i8* }] zeroinitializer

; Function Attrs: argmemonly mustprogress nofree nosync nounwind readonly willreturn
define <{ <4 x float>, <4 x float> }> @triangleVertexShader(i32 noundef %0, %struct.AAPLTriangleVertexWithColor addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %1, <2 x i32> addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %2) local_unnamed_addr #0 {
  %4 = zext i32 %0 to i64
  %5 = getelementptr inbounds %struct.AAPLTriangleVertexWithColor, %struct.AAPLTriangleVertexWithColor addrspace(2)* %1, i64 %4, i32 0
  %6 = load <2 x float>, <2 x float> addrspace(2)* %5, align 16, !alias.scope !24, !noalias !27
  %7 = load <2 x i32>, <2 x i32> addrspace(2)* %2, align 8, !tbaa !29, !alias.scope !27, !noalias !24
  %8 = tail call fast <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32> %7) #2
  %9 = fmul fast <2 x float> %8, <float 5.000000e-01, float 5.000000e-01>
  %10 = fdiv fast <2 x float> %6, %9
  %11 = shufflevector <2 x float> %10, <2 x float> poison, <4 x i32> <i32 0, i32 1, i32 undef, i32 undef>
  %12 = shufflevector <4 x float> %11, <4 x float> <float poison, float poison, float 0.000000e+00, float 1.000000e+00>, <4 x i32> <i32 0, i32 1, i32 6, i32 7>
  %13 = getelementptr inbounds %struct.AAPLTriangleVertexWithColor, %struct.AAPLTriangleVertexWithColor addrspace(2)* %1, i64 %4, i32 1
  %14 = load <4 x float>, <4 x float> addrspace(2)* %13, align 16, !tbaa !29, !alias.scope !24, !noalias !27
  %15 = insertvalue <{ <4 x float>, <4 x float> }> undef, <4 x float> %12, 0
  %16 = insertvalue <{ <4 x float>, <4 x float> }> %15, <4 x float> %14, 1
  ret <{ <4 x float>, <4 x float> }> %16
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <2 x float> @air.convert.f.v2f32.u.v2i32(<2 x i32>) local_unnamed_addr #1

attributes #0 = { argmemonly mustprogress nofree nosync nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
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
!15 = !{<{ <4 x float>, <4 x float> }> (i32, %struct.AAPLTriangleVertexWithColor addrspace(2)*, <2 x i32> addrspace(2)*)* @triangleVertexShader, !16, !19}
!16 = !{!17, !18}
!17 = !{!"air.position", !"air.arg_type_name", !"float4", !"air.arg_name", !"clipSpacePosition"}
!18 = !{!"air.vertex_output", !"generated(5colorDv4_f)", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!19 = !{!20, !21, !23}
!20 = !{i32 0, !"air.vertex_id", !"air.arg_type_name", !"uint", !"air.arg_name", !"vertexID"}
!21 = !{i32 1, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !22, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"AAPLTriangleVertexWithColor", !"air.arg_name", !"vertices"}
!22 = !{i32 0, i32 8, i32 0, !"float2", !"position", i32 16, i32 16, i32 0, !"float4", !"color"}
!23 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"uint2", !"air.arg_name", !"viewportSizePointer"}
!24 = !{!25}
!25 = distinct !{!25, !26, !"air-alias-scope-arg(1)"}
!26 = distinct !{!26, !"air-alias-scopes(triangleVertexShader)"}
!27 = !{!28}
!28 = distinct !{!28, !26, !"air-alias-scope-arg(2)"}
!29 = !{!30, !30, i64 0}
!30 = !{!"omnipotent char", !31, i64 0}
!31 = !{!"Simple C++ TBAA"}

