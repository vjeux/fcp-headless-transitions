0x000000000004c8 -- VelocityView_trackball_vs:
source_filename = "VelocityView_trackball_vs"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.OZVelocityViewTrackballVertex = type { <3 x float>, <4 x float> }
%struct.OZVelocityViewTrackballUniforms = type { %"struct.metal::matrix", %"struct.metal::matrix", float, float, <4 x float>, <4 x float> }
%"struct.metal::matrix" = type { [4 x <4 x float>] }

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
define <{ <4 x float>, <4 x float>, <3 x float> }> @VelocityView_trackball_vs(i32 noundef %0, %struct.OZVelocityViewTrackballVertex addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %1, %struct.OZVelocityViewTrackballUniforms addrspace(2)* nocapture noundef readonly align 16 dereferenceable(176) "air-buffer-no-alias" %2) local_unnamed_addr #0 {
  %4 = zext i32 %0 to i64
  %5 = getelementptr inbounds %struct.OZVelocityViewTrackballVertex, %struct.OZVelocityViewTrackballVertex addrspace(2)* %1, i64 %4, i32 0
  %6 = load <3 x float>, <3 x float> addrspace(2)* %5, align 16, !alias.scope !26, !noalias !29
  %7 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 1, i32 0, i64 0
  %8 = load <4 x float>, <4 x float> addrspace(2)* %7, align 16, !tbaa !31, !alias.scope !29, !noalias !26
  %9 = shufflevector <3 x float> %6, <3 x float> undef, <4 x i32> zeroinitializer
  %10 = fmul fast <4 x float> %8, %9
  %11 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 1, i32 0, i64 1
  %12 = load <4 x float>, <4 x float> addrspace(2)* %11, align 16, !tbaa !31, !alias.scope !29, !noalias !26
  %13 = shufflevector <3 x float> %6, <3 x float> undef, <4 x i32> <i32 1, i32 1, i32 1, i32 1>
  %14 = fmul fast <4 x float> %12, %13
  %15 = fadd fast <4 x float> %14, %10
  %16 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 1, i32 0, i64 2
  %17 = load <4 x float>, <4 x float> addrspace(2)* %16, align 16, !tbaa !31, !alias.scope !29, !noalias !26
  %18 = shufflevector <3 x float> %6, <3 x float> undef, <4 x i32> <i32 2, i32 2, i32 2, i32 2>
  %19 = fmul fast <4 x float> %17, %18
  %20 = fadd fast <4 x float> %15, %19
  %21 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 1, i32 0, i64 3
  %22 = load <4 x float>, <4 x float> addrspace(2)* %21, align 16, !tbaa !31, !alias.scope !29, !noalias !26
  %23 = fadd fast <4 x float> %20, %22
  %24 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 0, i32 0, i64 0
  %25 = load <4 x float>, <4 x float> addrspace(2)* %24, align 16, !tbaa !31, !alias.scope !29, !noalias !26
  %26 = shufflevector <4 x float> %23, <4 x float> poison, <4 x i32> zeroinitializer
  %27 = fmul fast <4 x float> %26, %25
  %28 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 0, i32 0, i64 1
  %29 = load <4 x float>, <4 x float> addrspace(2)* %28, align 16, !tbaa !31, !alias.scope !29, !noalias !26
  %30 = shufflevector <4 x float> %23, <4 x float> undef, <4 x i32> <i32 1, i32 1, i32 1, i32 1>
  %31 = fmul fast <4 x float> %30, %29
  %32 = fadd fast <4 x float> %27, %31
  %33 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 0, i32 0, i64 2
  %34 = load <4 x float>, <4 x float> addrspace(2)* %33, align 16, !tbaa !31, !alias.scope !29, !noalias !26
  %35 = shufflevector <4 x float> %23, <4 x float> undef, <4 x i32> <i32 2, i32 2, i32 2, i32 2>
  %36 = fmul fast <4 x float> %34, %35
  %37 = fadd fast <4 x float> %32, %36
  %38 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 0, i32 0, i64 3
  %39 = load <4 x float>, <4 x float> addrspace(2)* %38, align 16, !tbaa !31, !alias.scope !29, !noalias !26
  %40 = shufflevector <4 x float> %23, <4 x float> undef, <4 x i32> <i32 3, i32 3, i32 3, i32 3>
  %41 = fmul fast <4 x float> %39, %40
  %42 = fadd fast <4 x float> %37, %41
  %43 = getelementptr inbounds %struct.OZVelocityViewTrackballVertex, %struct.OZVelocityViewTrackballVertex addrspace(2)* %1, i64 %4, i32 1
  %44 = load <4 x float>, <4 x float> addrspace(2)* %43, align 16, !tbaa !31, !alias.scope !26, !noalias !29
  %45 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 2
  %46 = load float, float addrspace(2)* %45, align 16, !tbaa !34, !alias.scope !29, !noalias !26
  %47 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 3
  %48 = load float, float addrspace(2)* %47, align 4, !tbaa !38, !alias.scope !29, !noalias !26
  %49 = extractelement <4 x float> %23, i64 2
  %50 = fsub fast float %49, %46
  %51 = fsub fast float %48, %46
  %52 = fdiv fast float %50, %51
  %53 = tail call fast float @air.fast_clamp.f32(float %52, float 0.000000e+00, float 1.000000e+00) #2
  %54 = fmul fast float %53, %53
  %55 = fmul fast float %53, 2.000000e+00
  %56 = fsub fast float 3.000000e+00, %55
  %57 = fmul fast float %54, %56
  %58 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 4
  %59 = load <4 x float>, <4 x float> addrspace(2)* %58, align 16, !tbaa !31, !alias.scope !29, !noalias !26
  %60 = getelementptr inbounds %struct.OZVelocityViewTrackballUniforms, %struct.OZVelocityViewTrackballUniforms addrspace(2)* %2, i64 0, i32 5
  %61 = load <4 x float>, <4 x float> addrspace(2)* %60, align 16, !tbaa !31, !alias.scope !29, !noalias !26
  %62 = insertelement <4 x float> poison, float %57, i64 0
  %63 = shufflevector <4 x float> %62, <4 x float> poison, <4 x i32> zeroinitializer
  %64 = tail call fast <4 x float> @air.mix.v4f32(<4 x float> %59, <4 x float> %61, <4 x float> %63) #2
  %65 = fmul fast <4 x float> %64, %44
  %66 = insertelement <4 x float> %65, float 1.000000e+00, i64 3
  %67 = insertvalue <{ <4 x float>, <4 x float>, <3 x float> }> undef, <4 x float> %42, 0
  %68 = insertvalue <{ <4 x float>, <4 x float>, <3 x float> }> %67, <4 x float> %66, 1
  ret <{ <4 x float>, <4 x float>, <3 x float> }> %68
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <4 x float> @air.mix.v4f32(<4 x float>, <4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_clamp.f32(float, float, float) local_unnamed_addr #1

attributes #0 = { mustprogress nofree nosync nounwind readnone willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
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
!15 = !{<{ <4 x float>, <4 x float>, <3 x float> }> (i32, %struct.OZVelocityViewTrackballVertex addrspace(2)*, %struct.OZVelocityViewTrackballUniforms addrspace(2)*)* @VelocityView_trackball_vs, !16, !20}
!16 = !{!17, !18, !19}
!17 = !{!"air.position", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!18 = !{!"air.vertex_output", !"generated(5colorDv4_f)", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!19 = !{!"air.vertex_output", !"generated(11worldNormalDv3_f)", !"air.arg_type_name", !"float3", !"air.arg_name", !"worldNormal"}
!20 = !{!21, !22, !24}
!21 = !{i32 0, !"air.vertex_id", !"air.arg_type_name", !"uint", !"air.arg_name", !"vertexID"}
!22 = !{i32 1, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !23, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"OZVelocityViewTrackballVertex", !"air.arg_name", !"vertexArray"}
!23 = !{i32 0, i32 16, i32 0, !"float3", !"position", i32 16, i32 16, i32 0, !"float4", !"color"}
!24 = !{i32 2, !"air.buffer", !"air.buffer_size", i32 176, !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !25, !"air.arg_type_size", i32 176, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"OZVelocityViewTrackballUniforms", !"air.arg_name", !"uniforms"}
!25 = !{i32 0, i32 64, i32 0, !"float4x4", !"projection", i32 64, i32 64, i32 0, !"float4x4", !"modelview", i32 128, i32 4, i32 0, !"float", !"trackballDepthShadeRangeFar", i32 132, i32 4, i32 0, !"float", !"trackballDepthShadeRangeNear", i32 144, i32 16, i32 0, !"float4", !"trackballDarkColor", i32 160, i32 16, i32 0, !"float4", !"trackballLightColor"}
!26 = !{!27}
!27 = distinct !{!27, !28, !"air-alias-scope-arg(1)"}
!28 = distinct !{!28, !"air-alias-scopes(VelocityView_trackball_vs)"}
!29 = !{!30}
!30 = distinct !{!30, !28, !"air-alias-scope-arg(2)"}
!31 = !{!32, !32, i64 0}
!32 = !{!"omnipotent char", !33, i64 0}
!33 = !{!"Simple C++ TBAA"}
!34 = !{!35, !37, i64 128}
!35 = !{!"_ZTS31OZVelocityViewTrackballUniforms", !36, i64 0, !36, i64 64, !37, i64 128, !37, i64 132, !32, i64 144, !32, i64 160}
!36 = !{!"_ZTSN5metal6matrixIfLi4ELi4EvEE", !32, i64 0}
!37 = !{!"float", !32, i64 0}
!38 = !{!35, !37, i64 132}

