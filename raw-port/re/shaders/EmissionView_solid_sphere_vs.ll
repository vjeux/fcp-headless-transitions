0x00000000000215 -- EmissionView_solid_sphere_vs:
source_filename = "EmissionView_solid_sphere_vs"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.PSEmissionViewSolidSphereUniforms = type <{ %"struct.metal::matrix", %"struct.metal::matrix", <4 x float>, <4 x float>, <4 x float>, <4 x float>, <2 x float>, float, float, float, [12 x i8] }>
%"struct.metal::matrix" = type { [4 x <4 x float>] }

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
define <{ <4 x float>, <4 x float>, <3 x float>, <3 x float>, <3 x float>, float }> @EmissionView_solid_sphere_vs(<3 x float> %0, <3 x float> %1, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* nocapture noundef readonly align 16 dereferenceable(212) "air-buffer-no-alias" %2) local_unnamed_addr #0 {
  %4 = tail call fast float @air.dot.v3f32(<3 x float> %0, <3 x float> <float 0.000000e+00, float 0.000000e+00, float 1.000000e+00>) #2
  %5 = fcmp fast oeq float %4, -1.000000e+00
  br i1 %5, label %6, label %27

6:                                                ; preds = %3
  %7 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 8
  %8 = load float, float addrspace(2)* %7, align 4, !tbaa !28, !alias.scope !34
  %9 = fadd fast float %8, 0xBFEE666660000000
  %10 = fmul fast float %9, 0x4033FFFFC0000000
  %11 = tail call fast float @air.fast_clamp.f32(float %10, float 0.000000e+00, float 1.000000e+00) #2
  %12 = fmul fast float %11, %11
  %13 = fmul fast float %11, 2.000000e+00
  %14 = fsub fast float 3.000000e+00, %13
  %15 = fmul fast float %12, %14
  %16 = insertelement <3 x float> poison, float %15, i64 0
  %17 = shufflevector <3 x float> %16, <3 x float> poison, <3 x i32> zeroinitializer
  %18 = tail call fast <3 x float> @air.mix.v3f32(<3 x float> zeroinitializer, <3 x float> %0, <3 x float> %17) #2
  %19 = tail call fast <3 x float> @air.mix.v3f32(<3 x float> <float 0.000000e+00, float 0.000000e+00, float -1.000000e+00>, <3 x float> %18, <3 x float> %17) #2
  %20 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 2
  %21 = load <4 x float>, <4 x float> addrspace(2)* %20, align 16, !tbaa !37, !alias.scope !34
  %22 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 3
  %23 = load <4 x float>, <4 x float> addrspace(2)* %22, align 16, !tbaa !37, !alias.scope !34
  %24 = insertelement <4 x float> poison, float %15, i64 0
  %25 = shufflevector <4 x float> %24, <4 x float> poison, <4 x i32> zeroinitializer
  %26 = tail call fast <4 x float> @air.mix.v4f32(<4 x float> %21, <4 x float> %23, <4 x float> %25) #2
  br label %57

27:                                               ; preds = %3
  %28 = tail call fast float @air.fast_acos.f32(float %4) #2
  %29 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 8
  %30 = load float, float addrspace(2)* %29, align 4, !tbaa !28, !alias.scope !34
  %31 = fmul fast float %30, %28
  %32 = tail call fast float @air.dot.v3f32(<3 x float> %1, <3 x float> %1) #2
  %33 = tail call fast float @air.fast_rsqrt.f32(float %32) #2
  %34 = insertelement <3 x float> poison, float %33, i64 0
  %35 = shufflevector <3 x float> %34, <3 x float> poison, <3 x i32> zeroinitializer
  %36 = fmul fast <3 x float> %35, %1
  %37 = tail call fast float @air.fast_sin.f32(float %31) #2
  %38 = tail call fast float @air.fast_cos.f32(float %31) #2
  %39 = fsub fast float 1.000000e+00, %38
  %40 = extractelement <3 x float> %36, i64 0
  %41 = extractelement <3 x float> %36, i64 1
  %42 = extractelement <3 x float> %36, i64 2
  %43 = fmul fast float %42, %39
  %44 = fmul fast float %43, %40
  %45 = fmul fast float %41, %37
  %46 = fmul fast float %43, %41
  %47 = fmul fast float %40, %37
  %48 = fsub fast float %44, %45
  %49 = fadd fast float %46, %47
  %50 = fmul fast float %43, %42
  %51 = fadd fast float %50, %38
  %52 = insertelement <3 x float> undef, float %48, i64 0
  %53 = insertelement <3 x float> %52, float %49, i64 1
  %54 = insertelement <3 x float> %53, float %51, i64 2
  %55 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 2
  %56 = load <4 x float>, <4 x float> addrspace(2)* %55, align 16, !tbaa !37, !alias.scope !34
  br label %57

57:                                               ; preds = %27, %6
  %58 = phi <3 x float> [ %19, %6 ], [ %54, %27 ]
  %59 = phi <3 x float> [ %18, %6 ], [ %54, %27 ]
  %60 = phi <4 x float> [ %26, %6 ], [ %56, %27 ]
  %61 = phi float [ 0.000000e+00, %6 ], [ 1.000000e+00, %27 ]
  %62 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 7
  %63 = load float, float addrspace(2)* %62, align 8, !tbaa !38, !alias.scope !34
  %64 = insertelement <3 x float> poison, float %63, i64 0
  %65 = shufflevector <3 x float> %64, <3 x float> poison, <3 x i32> zeroinitializer
  %66 = fmul fast <3 x float> %65, %59
  %67 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 1, i32 0, i64 0
  %68 = load <4 x float>, <4 x float> addrspace(2)* %67, align 16, !tbaa !37, !alias.scope !34
  %69 = shufflevector <3 x float> %66, <3 x float> undef, <4 x i32> zeroinitializer
  %70 = fmul fast <4 x float> %69, %68
  %71 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 1, i32 0, i64 1
  %72 = load <4 x float>, <4 x float> addrspace(2)* %71, align 16, !tbaa !37, !alias.scope !34
  %73 = shufflevector <3 x float> %66, <3 x float> undef, <4 x i32> <i32 1, i32 1, i32 1, i32 1>
  %74 = fmul fast <4 x float> %73, %72
  %75 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 1, i32 0, i64 2
  %76 = load <4 x float>, <4 x float> addrspace(2)* %75, align 16, !tbaa !37, !alias.scope !34
  %77 = shufflevector <3 x float> %66, <3 x float> undef, <4 x i32> <i32 2, i32 2, i32 2, i32 2>
  %78 = fmul fast <4 x float> %77, %76
  %79 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 1, i32 0, i64 3
  %80 = load <4 x float>, <4 x float> addrspace(2)* %79, align 16, !tbaa !37, !alias.scope !34
  %81 = fadd fast <4 x float> %74, %80
  %82 = fadd fast <4 x float> %81, %70
  %83 = fadd fast <4 x float> %82, %78
  %84 = shufflevector <4 x float> %83, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %85 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 0, i32 0, i64 0
  %86 = load <4 x float>, <4 x float> addrspace(2)* %85, align 16, !tbaa !37, !alias.scope !34
  %87 = shufflevector <4 x float> %83, <4 x float> poison, <4 x i32> zeroinitializer
  %88 = fmul fast <4 x float> %87, %86
  %89 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 0, i32 0, i64 1
  %90 = load <4 x float>, <4 x float> addrspace(2)* %89, align 16, !tbaa !37, !alias.scope !34
  %91 = shufflevector <4 x float> %83, <4 x float> undef, <4 x i32> <i32 1, i32 1, i32 1, i32 1>
  %92 = fmul fast <4 x float> %91, %90
  %93 = fadd fast <4 x float> %88, %92
  %94 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 0, i32 0, i64 2
  %95 = load <4 x float>, <4 x float> addrspace(2)* %94, align 16, !tbaa !37, !alias.scope !34
  %96 = shufflevector <4 x float> %83, <4 x float> undef, <4 x i32> <i32 2, i32 2, i32 2, i32 2>
  %97 = fmul fast <4 x float> %96, %95
  %98 = fadd fast <4 x float> %93, %97
  %99 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %2, i64 0, i32 0, i32 0, i64 3
  %100 = load <4 x float>, <4 x float> addrspace(2)* %99, align 16, !tbaa !37, !alias.scope !34
  %101 = shufflevector <4 x float> %83, <4 x float> undef, <4 x i32> <i32 3, i32 3, i32 3, i32 3>
  %102 = fmul fast <4 x float> %101, %100
  %103 = fadd fast <4 x float> %98, %102
  %104 = shufflevector <4 x float> %68, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %105 = shufflevector <4 x float> %72, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %106 = shufflevector <4 x float> %76, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %107 = shufflevector <3 x float> %58, <3 x float> poison, <3 x i32> zeroinitializer
  %108 = fmul fast <3 x float> %104, %107
  %109 = shufflevector <3 x float> %58, <3 x float> undef, <3 x i32> <i32 1, i32 1, i32 1>
  %110 = fmul fast <3 x float> %105, %109
  %111 = fadd fast <3 x float> %110, %108
  %112 = shufflevector <3 x float> %58, <3 x float> undef, <3 x i32> <i32 2, i32 2, i32 2>
  %113 = fmul fast <3 x float> %106, %112
  %114 = fadd fast <3 x float> %111, %113
  %115 = insertvalue <{ <4 x float>, <4 x float>, <3 x float>, <3 x float>, <3 x float>, float }> undef, <4 x float> %103, 0
  %116 = insertvalue <{ <4 x float>, <4 x float>, <3 x float>, <3 x float>, <3 x float>, float }> %115, <4 x float> %60, 1
  %117 = insertvalue <{ <4 x float>, <4 x float>, <3 x float>, <3 x float>, <3 x float>, float }> %116, <3 x float> %84, 2
  %118 = insertvalue <{ <4 x float>, <4 x float>, <3 x float>, <3 x float>, <3 x float>, float }> %117, <3 x float> %114, 3
  %119 = insertvalue <{ <4 x float>, <4 x float>, <3 x float>, <3 x float>, <3 x float>, float }> %118, <3 x float> %58, 4
  %120 = insertvalue <{ <4 x float>, <4 x float>, <3 x float>, <3 x float>, <3 x float>, float }> %119, float %61, 5
  ret <{ <4 x float>, <4 x float>, <3 x float>, <3 x float>, <3 x float>, float }> %120
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_cos.f32(float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_sin.f32(float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_rsqrt.f32(float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_acos.f32(float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <4 x float> @air.mix.v4f32(<4 x float>, <4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <3 x float> @air.mix.v3f32(<3 x float>, <3 x float>, <3 x float>) local_unnamed_addr #1

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
!15 = !{<{ <4 x float>, <4 x float>, <3 x float>, <3 x float>, <3 x float>, float }> (<3 x float>, <3 x float>, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)*)* @EmissionView_solid_sphere_vs, !16, !23}
!16 = !{!17, !18, !19, !20, !21, !22}
!17 = !{!"air.position", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!18 = !{!"air.vertex_output", !"generated(5colorDv4_f)", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!19 = !{!"air.vertex_output", !"generated(13worldPositionDv3_f)", !"air.arg_type_name", !"float3", !"air.arg_name", !"worldPosition"}
!20 = !{!"air.vertex_output", !"generated(11worldNormalDv3_f)", !"air.arg_type_name", !"float3", !"air.arg_name", !"worldNormal"}
!21 = !{!"air.vertex_output", !"generated(12objectNormalDv3_f)", !"air.arg_type_name", !"float3", !"air.arg_name", !"objectNormal"}
!22 = !{!"air.vertex_output", !"generated(17worldNormalWeightf)", !"air.arg_type_name", !"float", !"air.arg_name", !"worldNormalWeight"}
!23 = !{!24, !25, !26}
!24 = !{i32 0, !"air.vertex_input", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"float3", !"air.arg_name", !"position"}
!25 = !{i32 1, !"air.vertex_input", !"air.location_index", i32 1, i32 1, !"air.arg_type_name", !"float3", !"air.arg_name", !"pivotAxis"}
!26 = !{i32 2, !"air.buffer", !"air.buffer_size", i32 224, !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !27, !"air.arg_type_size", i32 224, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"PSEmissionViewSolidSphereUniforms", !"air.arg_name", !"uniforms"}
!27 = !{i32 0, i32 64, i32 0, !"float4x4", !"projection", i32 64, i32 64, i32 0, !"float4x4", !"modelview", i32 128, i32 16, i32 0, !"float4", !"color", i32 144, i32 16, i32 0, !"float4", !"southPoleColor", i32 160, i32 16, i32 0, !"float4", !"ambientLight", i32 176, i32 16, i32 0, !"float4", !"light", i32 192, i32 8, i32 0, !"float2", !"lightRange", i32 200, i32 4, i32 0, !"float", !"scale", i32 204, i32 4, i32 0, !"float", !"spread", i32 208, i32 4, i32 0, !"float", !"southPoleMarkerBreadthRadians"}
!28 = !{!29, !33, i64 204}
!29 = !{!"_ZTS33PSEmissionViewSolidSphereUniforms", !30, i64 0, !30, i64 64, !31, i64 128, !31, i64 144, !31, i64 160, !31, i64 176, !31, i64 192, !33, i64 200, !33, i64 204, !33, i64 208}
!30 = !{!"_ZTSN5metal6matrixIfLi4ELi4EvEE", !31, i64 0}
!31 = !{!"omnipotent char", !32, i64 0}
!32 = !{!"Simple C++ TBAA"}
!33 = !{!"float", !31, i64 0}
!34 = !{!35}
!35 = distinct !{!35, !36, !"air-alias-scope-arg(2)"}
!36 = distinct !{!36, !"air-alias-scopes(EmissionView_solid_sphere_vs)"}
!37 = !{!31, !31, i64 0}
!38 = !{!29, !33, i64 200}

