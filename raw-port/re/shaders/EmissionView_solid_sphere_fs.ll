0x00000000001835 -- EmissionView_solid_sphere_fs:
source_filename = "EmissionView_solid_sphere_fs"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.PSEmissionViewSolidSphereUniforms = type <{ %"struct.metal::matrix", %"struct.metal::matrix", <4 x float>, <4 x float>, <4 x float>, <4 x float>, <2 x float>, float, float, float, [12 x i8] }>
%"struct.metal::matrix" = type { [4 x <4 x float>] }

; Function Attrs: convergent mustprogress nounwind willreturn
define <4 x float> @EmissionView_solid_sphere_fs(<4 x float> %0, <4 x float> %1, <3 x float> %2, <3 x float> %3, <3 x float> %4, float %5, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* nocapture noundef readonly align 16 dereferenceable(212) "air-buffer-no-alias" %6) local_unnamed_addr #0 {
  %8 = tail call fast <3 x float> @air.dfdx.v3f32(<3 x float> %2) #3
  %9 = tail call fast <3 x float> @air.dfdy.v3f32(<3 x float> %2) #3
  %10 = extractelement <3 x float> %8, i64 1
  %11 = extractelement <3 x float> %9, i64 2
  %12 = fmul fast float %11, %10
  %13 = extractelement <3 x float> %9, i64 1
  %14 = extractelement <3 x float> %8, i64 2
  %15 = fmul fast float %13, %14
  %16 = fsub fast float %12, %15
  %17 = insertelement <3 x float> undef, float %16, i64 0
  %18 = extractelement <3 x float> %9, i64 0
  %19 = fmul fast float %18, %14
  %20 = extractelement <3 x float> %8, i64 0
  %21 = fmul fast float %11, %20
  %22 = fsub fast float %19, %21
  %23 = insertelement <3 x float> %17, float %22, i64 1
  %24 = fmul fast float %13, %20
  %25 = fmul fast float %18, %10
  %26 = fsub fast float %24, %25
  %27 = insertelement <3 x float> %23, float %26, i64 2
  %28 = tail call fast float @air.dot.v3f32(<3 x float> %27, <3 x float> %27) #4
  %29 = tail call fast float @air.fast_rsqrt.f32(float %28) #4
  %30 = insertelement <3 x float> poison, float %29, i64 0
  %31 = fmul fast <3 x float> %30, <float -1.000000e+00, float poison, float poison>
  %32 = shufflevector <3 x float> %31, <3 x float> poison, <3 x i32> zeroinitializer
  %33 = fmul fast <3 x float> %32, %27
  %34 = fadd fast float %5, 0xBFE99999A0000000
  %35 = fmul fast float %34, 0x4014000020000000
  %36 = tail call fast float @air.fast_clamp.f32(float %35, float 0.000000e+00, float 1.000000e+00) #4
  %37 = fmul fast float %36, %36
  %38 = fmul fast float %36, 2.000000e+00
  %39 = fsub fast float 3.000000e+00, %38
  %40 = fmul fast float %37, %39
  %41 = insertelement <3 x float> poison, float %40, i64 0
  %42 = shufflevector <3 x float> %41, <3 x float> poison, <3 x i32> zeroinitializer
  %43 = tail call fast <3 x float> @air.mix.v3f32(<3 x float> %33, <3 x float> %3, <3 x float> %42) #4
  %44 = tail call fast float @air.dot.v3f32(<3 x float> %43, <3 x float> %43) #4
  %45 = tail call fast float @air.fast_rsqrt.f32(float %44) #4
  %46 = insertelement <3 x float> poison, float %45, i64 0
  %47 = shufflevector <3 x float> %46, <3 x float> poison, <3 x i32> zeroinitializer
  %48 = fmul fast <3 x float> %47, %43
  %49 = tail call fast float @air.dot.v3f32(<3 x float> %48, <3 x float> <float 0.000000e+00, float 0.000000e+00, float 1.000000e+00>) #4
  %50 = tail call fast float @air.fast_clamp.f32(float %49, float 0.000000e+00, float 1.000000e+00) #4
  %51 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %6, i64 0, i32 6
  %52 = load <2 x float>, <2 x float> addrspace(2)* %51, align 16, !alias.scope !27
  %53 = extractelement <2 x float> %52, i64 0
  %54 = extractelement <2 x float> %52, i64 1
  %55 = extractelement <4 x float> %0, i64 2
  %56 = fsub fast float %55, %53
  %57 = fsub fast float %54, %53
  %58 = fdiv fast float %56, %57
  %59 = tail call fast float @air.fast_clamp.f32(float %58, float 0.000000e+00, float 1.000000e+00) #4
  %60 = fmul fast float %59, %59
  %61 = fmul fast float %59, 2.000000e+00
  %62 = fsub fast float 3.000000e+00, %61
  %63 = fmul fast float %60, %62
  %64 = shufflevector <4 x float> %1, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %65 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %6, i64 0, i32 8
  %66 = load float, float addrspace(2)* %65, align 4, !tbaa !30, !alias.scope !27
  %67 = fadd fast float %66, 0xBFEE666660000000
  %68 = fmul fast float %67, 0x4033FFFFC0000000
  %69 = tail call fast float @air.fast_clamp.f32(float %68, float 0.000000e+00, float 1.000000e+00) #4
  %70 = fmul fast float %69, 2.000000e+00
  %71 = fsub fast float 3.000000e+00, %70
  %72 = tail call fast float @air.dot.v3f32(<3 x float> %4, <3 x float> <float 0.000000e+00, float 0.000000e+00, float -1.000000e+00>) #4
  %73 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %6, i64 0, i32 9
  %74 = load float, float addrspace(2)* %73, align 16, !tbaa !36, !alias.scope !27
  %75 = tail call fast float @air.fast_cos.f32(float %74) #4
  %76 = fsub fast float %72, %75
  %77 = fsub fast float 1.000000e+00, %75
  %78 = fdiv fast float %76, %77
  %79 = tail call fast float @air.fast_clamp.f32(float %78, float 0.000000e+00, float 1.000000e+00) #4
  %80 = fmul fast float %79, 2.000000e+00
  %81 = fsub fast float 3.000000e+00, %80
  %82 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %6, i64 0, i32 3
  %83 = load <4 x float>, <4 x float> addrspace(2)* %82, align 16, !alias.scope !27
  %84 = shufflevector <4 x float> %83, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %85 = fmul fast float %79, %69
  %86 = fmul fast float %85, %85
  %87 = fmul fast float %86, %71
  %88 = fmul fast float %87, %81
  %89 = insertelement <3 x float> poison, float %88, i64 0
  %90 = shufflevector <3 x float> %89, <3 x float> poison, <3 x i32> zeroinitializer
  %91 = tail call fast <3 x float> @air.mix.v3f32(<3 x float> %64, <3 x float> %84, <3 x float> %90) #4
  %92 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %6, i64 0, i32 4
  %93 = load <4 x float>, <4 x float> addrspace(2)* %92, align 16, !alias.scope !27
  %94 = shufflevector <4 x float> %93, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %95 = getelementptr inbounds %struct.PSEmissionViewSolidSphereUniforms, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)* %6, i64 0, i32 5
  %96 = load <4 x float>, <4 x float> addrspace(2)* %95, align 16, !alias.scope !27
  %97 = shufflevector <4 x float> %96, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %98 = insertelement <3 x float> poison, float %50, i64 0
  %99 = fsub fast float 1.000000e+00, %63
  %100 = insertelement <3 x float> poison, float %99, i64 0
  %101 = fmul fast <3 x float> %100, %98
  %102 = shufflevector <3 x float> %101, <3 x float> poison, <3 x i32> zeroinitializer
  %103 = fmul fast <3 x float> %102, %97
  %104 = fadd fast <3 x float> %103, %94
  %105 = fmul fast <3 x float> %104, %91
  %106 = shufflevector <3 x float> %105, <3 x float> poison, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %107 = insertelement <4 x float> %106, float 1.000000e+00, i64 3
  ret <4 x float> %107
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <3 x float> @air.mix.v3f32(<3 x float>, <3 x float>, <3 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_clamp.f32(float, float, float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_cos.f32(float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_rsqrt.f32(float) local_unnamed_addr #1

; Function Attrs: convergent mustprogress nounwind willreturn
declare <3 x float> @air.dfdy.v3f32(<3 x float>) local_unnamed_addr #2

; Function Attrs: convergent mustprogress nounwind willreturn
declare <3 x float> @air.dfdx.v3f32(<3 x float>) local_unnamed_addr #2

attributes #0 = { convergent mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { convergent mustprogress nounwind willreturn }
attributes #3 = { convergent nounwind willreturn }
attributes #4 = { nounwind readnone willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.fragment = !{!15}

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
!15 = !{<4 x float> (<4 x float>, <4 x float>, <3 x float>, <3 x float>, <3 x float>, float, %struct.PSEmissionViewSolidSphereUniforms addrspace(2)*)* @EmissionView_solid_sphere_fs, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!18 = !{!19, !20, !21, !22, !23, !24, !25}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!20 = !{i32 1, !"air.fragment_input", !"generated(5colorDv4_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!21 = !{i32 2, !"air.fragment_input", !"generated(13worldPositionDv3_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float3", !"air.arg_name", !"worldPosition"}
!22 = !{i32 3, !"air.fragment_input", !"generated(11worldNormalDv3_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float3", !"air.arg_name", !"worldNormal"}
!23 = !{i32 4, !"air.fragment_input", !"generated(12objectNormalDv3_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float3", !"air.arg_name", !"objectNormal"}
!24 = !{i32 5, !"air.fragment_input", !"generated(17worldNormalWeightf)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float", !"air.arg_name", !"worldNormalWeight"}
!25 = !{i32 6, !"air.buffer", !"air.buffer_size", i32 224, !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !26, !"air.arg_type_size", i32 224, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"PSEmissionViewSolidSphereUniforms", !"air.arg_name", !"uniforms"}
!26 = !{i32 0, i32 64, i32 0, !"float4x4", !"projection", i32 64, i32 64, i32 0, !"float4x4", !"modelview", i32 128, i32 16, i32 0, !"float4", !"color", i32 144, i32 16, i32 0, !"float4", !"southPoleColor", i32 160, i32 16, i32 0, !"float4", !"ambientLight", i32 176, i32 16, i32 0, !"float4", !"light", i32 192, i32 8, i32 0, !"float2", !"lightRange", i32 200, i32 4, i32 0, !"float", !"scale", i32 204, i32 4, i32 0, !"float", !"spread", i32 208, i32 4, i32 0, !"float", !"southPoleMarkerBreadthRadians"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(6)"}
!29 = distinct !{!29, !"air-alias-scopes(EmissionView_solid_sphere_fs)"}
!30 = !{!31, !35, i64 204}
!31 = !{!"_ZTS33PSEmissionViewSolidSphereUniforms", !32, i64 0, !32, i64 64, !33, i64 128, !33, i64 144, !33, i64 160, !33, i64 176, !33, i64 192, !35, i64 200, !35, i64 204, !35, i64 208}
!32 = !{!"_ZTSN5metal6matrixIfLi4ELi4EvEE", !33, i64 0}
!33 = !{!"omnipotent char", !34, i64 0}
!34 = !{!"Simple C++ TBAA"}
!35 = !{!"float", !33, i64 0}
!36 = !{!31, !35, i64 208}
Disassembly of section REFLECTION_LIST:
