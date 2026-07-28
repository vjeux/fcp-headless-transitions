0x00000000007c90 -- waveform_bg_pass_vertex_shader:
source_filename = "waveform_bg_pass_vertex_shader"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.waveform_state_t = type <{ %"struct.metal::matrix", %"struct.metal::matrix.0", %"struct.metal::matrix.0", float, i8, [11 x i8], <4 x float>, i32, [12 x i8] }>
%"struct.metal::matrix" = type { [4 x <4 x float>] }
%"struct.metal::matrix.0" = type { [3 x <3 x float>] }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque
%struct._rasterizer_data_t = type { <4 x float>, <4 x float>, <2 x float>, float }

@__air_sampler_state = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8
@llvm.global_ctors = appending global [0 x { i32, void ()*, i8* }] zeroinitializer

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
define <{ <4 x float>, <4 x float>, <2 x float>, float }> @waveform_bg_pass_vertex_shader(i32 noundef %0, <2 x float> addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %1, %struct.waveform_state_t addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %2, %struct._texture_2d_t addrspace(1)* nocapture readonly %3) local_unnamed_addr #0 {
  %5 = zext i32 %0 to i64
  %6 = getelementptr inbounds <2 x float>, <2 x float> addrspace(2)* %1, i64 %5
  %7 = load <2 x float>, <2 x float> addrspace(2)* %6, align 8, !alias.scope !28, !noalias !31
  %8 = tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %7, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4
  %9 = extractvalue { <4 x half>, i8 } %8, 0
  %10 = extractelement <2 x float> %7, i64 0
  %11 = tail call fastcc %struct._rasterizer_data_t @_Z19waveform_rasterizerPU11MTLconstantK16waveform_state_tfDv4_Dh(%struct.waveform_state_t addrspace(2)* noundef %2, float noundef %10, <4 x half> noundef %9) #5, !alias.scope !34, !noalias !35
  %12 = extractvalue %struct._rasterizer_data_t %11, 0
  %13 = extractvalue %struct._rasterizer_data_t %11, 2
  %14 = extractvalue %struct._rasterizer_data_t %11, 3
  %15 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> undef, <4 x float> %12, 0
  %16 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> %15, <4 x float> <float 0x3FB61615E0000000, float 0x3FB61615E0000000, float 0x3FB61615E0000000, float 1.000000e+00>, 1
  %17 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> %16, <2 x float> %13, 2
  %18 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> %17, float %14, 3
  ret <{ <4 x float>, <4 x float>, <2 x float>, float }> %18
}

; Function Attrs: argmemonly mustprogress nofree nosync nounwind readonly willreturn
define internal fastcc %struct._rasterizer_data_t @_Z19waveform_rasterizerPU11MTLconstantK16waveform_state_tfDv4_Dh(%struct.waveform_state_t addrspace(2)* nocapture noundef readonly %0, float noundef %1, <4 x half> noundef %2) unnamed_addr #1 {
  %4 = insertelement <4 x float> <float poison, float 0.000000e+00, float 0.000000e+00, float 1.000000e+00>, float %1, i64 0
  %5 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 7
  %6 = load i32, i32 addrspace(2)* %5, align 16, !tbaa !36
  switch i32 %6, label %19 [
    i32 0, label %7
    i32 1, label %11
    i32 2, label %15
  ]

7:                                                ; preds = %3
  %8 = extractelement <4 x half> %2, i64 0
  %9 = fpext half %8 to float
  %10 = insertelement <4 x float> %4, float %9, i64 1
  br label %89

11:                                               ; preds = %3
  %12 = extractelement <4 x half> %2, i64 1
  %13 = fpext half %12 to float
  %14 = insertelement <4 x float> %4, float %13, i64 1
  br label %89

15:                                               ; preds = %3
  %16 = extractelement <4 x half> %2, i64 2
  %17 = fpext half %16 to float
  %18 = insertelement <4 x float> %4, float %17, i64 1
  br label %89

19:                                               ; preds = %3
  %20 = icmp ugt i32 %6, 5
  %21 = extractelement <4 x half> %2, i64 0
  %22 = fpext half %21 to float
  %23 = insertelement <3 x float> undef, float %22, i64 0
  %24 = extractelement <4 x half> %2, i64 1
  %25 = fpext half %24 to float
  %26 = insertelement <3 x float> %23, float %25, i64 1
  %27 = extractelement <4 x half> %2, i64 2
  %28 = fpext half %27 to float
  %29 = insertelement <3 x float> %26, float %28, i64 2
  br i1 %20, label %30, label %45

30:                                               ; preds = %19
  %31 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 1, i32 0, i64 1
  %32 = load <3 x float>, <3 x float> addrspace(2)* %31, align 16, !tbaa !45
  %33 = tail call fast float @air.dot.v3f32(<3 x float> %29, <3 x float> %32) #6
  %34 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 1, i32 0, i64 2
  %35 = load <3 x float>, <3 x float> addrspace(2)* %34, align 16, !tbaa !45
  %36 = tail call fast float @air.dot.v3f32(<3 x float> %29, <3 x float> %35) #6
  %37 = insertelement <4 x float> <float poison, float poison, float poison, float 0.000000e+00>, float %22, i64 0
  %38 = insertelement <4 x float> %37, float %25, i64 1
  %39 = insertelement <4 x float> %38, float %28, i64 2
  %40 = fmul fast float %33, %33
  %41 = fmul fast float %36, %36
  %42 = fadd fast float %41, %40
  %43 = tail call fast float @air.fast_sqrt.f32(float %42) #6
  %44 = insertelement <4 x float> %4, float %43, i64 1
  br label %89

45:                                               ; preds = %19
  %46 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 1, i32 0, i64 0
  %47 = load <3 x float>, <3 x float> addrspace(2)* %46, align 16, !tbaa !45
  %48 = tail call fast float @air.dot.v3f32(<3 x float> %29, <3 x float> %47) #6
  %49 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 1, i32 0, i64 1
  %50 = load <3 x float>, <3 x float> addrspace(2)* %49, align 16, !tbaa !45
  %51 = tail call fast float @air.dot.v3f32(<3 x float> %29, <3 x float> %50) #6
  %52 = insertelement <3 x float> poison, float %51, i64 1
  %53 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 1, i32 0, i64 2
  %54 = load <3 x float>, <3 x float> addrspace(2)* %53, align 16, !tbaa !45
  %55 = tail call fast float @air.dot.v3f32(<3 x float> %29, <3 x float> %54) #6
  %56 = insertelement <3 x float> %52, float %55, i64 2
  switch i32 %6, label %89 [
    i32 3, label %57
    i32 4, label %83
    i32 5, label %86
  ]

57:                                               ; preds = %45
  %58 = insertelement <4 x float> %4, float %48, i64 1
  %59 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 4
  %60 = load i8, i8 addrspace(2)* %59, align 4, !tbaa !46, !range !47
  %61 = icmp eq i8 %60, 0
  br i1 %61, label %62, label %89

62:                                               ; preds = %57
  %63 = tail call fast float @air.fast_fmax.f32(float %48, float 0x3FB99999A0000000) #6
  %64 = insertelement <3 x float> %56, float %63, i64 0
  %65 = tail call fast float @air.fast_fabs.f32(float %51) #6
  %66 = tail call fast float @air.fast_fabs.f32(float %55) #6
  %67 = fadd fast float %66, %65
  %68 = fcmp fast olt float %67, 0x3FB99999A0000000
  %69 = insertelement <3 x float> %64, float 5.000000e-01, i64 0
  %70 = select i1 %68, <3 x float> %69, <3 x float> %64
  %71 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 2, i32 0, i64 0
  %72 = load <3 x float>, <3 x float> addrspace(2)* %71, align 16, !tbaa !45
  %73 = tail call fast float @air.dot.v3f32(<3 x float> %70, <3 x float> %72) #6
  %74 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 2, i32 0, i64 1
  %75 = load <3 x float>, <3 x float> addrspace(2)* %74, align 16, !tbaa !45
  %76 = tail call fast float @air.dot.v3f32(<3 x float> %70, <3 x float> %75) #6
  %77 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 2, i32 0, i64 2
  %78 = load <3 x float>, <3 x float> addrspace(2)* %77, align 16, !tbaa !45
  %79 = tail call fast float @air.dot.v3f32(<3 x float> %70, <3 x float> %78) #6
  %80 = insertelement <4 x float> <float poison, float poison, float poison, float 0.000000e+00>, float %73, i64 0
  %81 = insertelement <4 x float> %80, float %76, i64 1
  %82 = insertelement <4 x float> %81, float %79, i64 2
  br label %89

83:                                               ; preds = %45
  %84 = fadd fast float %51, 5.000000e-01
  %85 = insertelement <4 x float> %4, float %84, i64 1
  br label %89

86:                                               ; preds = %45
  %87 = fadd fast float %55, 5.000000e-01
  %88 = insertelement <4 x float> %4, float %87, i64 1
  br label %89

89:                                               ; preds = %86, %83, %62, %57, %45, %30, %15, %11, %7
  %90 = phi <4 x float> [ %39, %30 ], [ undef, %45 ], [ undef, %86 ], [ undef, %83 ], [ %82, %62 ], [ undef, %15 ], [ undef, %11 ], [ undef, %7 ], [ <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 0.000000e+00>, %57 ]
  %91 = phi <4 x float> [ %44, %30 ], [ %4, %45 ], [ %88, %86 ], [ %85, %83 ], [ %58, %62 ], [ %18, %15 ], [ %14, %11 ], [ %10, %7 ], [ %58, %57 ]
  %92 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 0
  %93 = load <4 x float>, <4 x float> addrspace(2)* %92, align 16, !tbaa !45
  %94 = tail call fast float @air.dot.v4f32(<4 x float> %91, <4 x float> %93) #6
  %95 = insertelement <4 x float> undef, float %94, i64 0
  %96 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 1
  %97 = load <4 x float>, <4 x float> addrspace(2)* %96, align 16, !tbaa !45
  %98 = tail call fast float @air.dot.v4f32(<4 x float> %91, <4 x float> %97) #6
  %99 = insertelement <4 x float> %95, float %98, i64 1
  %100 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 2
  %101 = load <4 x float>, <4 x float> addrspace(2)* %100, align 16, !tbaa !45
  %102 = tail call fast float @air.dot.v4f32(<4 x float> %91, <4 x float> %101) #6
  %103 = insertelement <4 x float> %99, float %102, i64 2
  %104 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 3
  %105 = load <4 x float>, <4 x float> addrspace(2)* %104, align 16, !tbaa !45
  %106 = tail call fast float @air.dot.v4f32(<4 x float> %91, <4 x float> %105) #6
  %107 = insertelement <4 x float> %103, float %106, i64 3
  %108 = insertvalue %struct._rasterizer_data_t poison, <4 x float> %107, 0
  %109 = insertvalue %struct._rasterizer_data_t %108, <4 x float> %90, 1
  ret %struct._rasterizer_data_t %109
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fabs.f32(float) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmax.f32(float, float) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_sqrt.f32(float) local_unnamed_addr #2

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #3

attributes #0 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly mustprogress nofree nosync nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #2 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #3 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #4 = { argmemonly convergent nounwind readonly willreturn }
attributes #5 = { nobuiltin "no-builtins" }
attributes #6 = { nounwind readnone willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.vertex = !{!15}
!air.sampler_states = !{!27}

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
!15 = !{<{ <4 x float>, <4 x float>, <2 x float>, float }> (i32, <2 x float> addrspace(2)*, %struct.waveform_state_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*)* @waveform_bg_pass_vertex_shader, !16, !21}
!16 = !{!17, !18, !19, !20}
!17 = !{!"air.position", !"air.arg_type_name", !"float4", !"air.arg_name", !"P"}
!18 = !{!"air.vertex_output", !"generated(2CsDv4_f)", !"air.arg_type_name", !"float4", !"air.arg_name", !"Cs"}
!19 = !{!"air.vertex_output", !"generated(2stDv2_f)", !"air.arg_type_name", !"float2", !"air.arg_name", !"st"}
!20 = !{!"air.point_size", !"air.arg_type_name", !"float", !"air.arg_name", !"pointsize"}
!21 = !{!22, !23, !24, !26}
!22 = !{i32 0, !"air.vertex_id", !"air.arg_type_name", !"uint", !"air.arg_name", !"idx"}
!23 = !{i32 1, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"float2", !"air.arg_name", !"st"}
!24 = !{i32 2, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !25, !"air.arg_type_size", i32 208, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"waveform_state_t", !"air.arg_name", !"state"}
!25 = !{i32 0, i32 64, i32 0, !"float4x4", !"mvp", i32 64, i32 48, i32 0, !"float3x3", !"rgb2ycc", i32 112, i32 48, i32 0, !"float3x3", !"ycc2rgb", i32 160, i32 4, i32 0, !"float", !"brightness", i32 164, i32 1, i32 0, !"bool", !"monochrome", i32 176, i32 16, i32 0, !"float4", !"Cs", i32 192, i32 4, i32 0, !"uint", !"computation"}
!26 = !{i32 3, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<half, sample>", !"air.arg_name", !"te"}
!27 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(1)"}
!30 = distinct !{!30, !"air-alias-scopes(waveform_bg_pass_vertex_shader)"}
!31 = !{!32, !33}
!32 = distinct !{!32, !30, !"air-alias-scope-arg(2)"}
!33 = distinct !{!33, !30, !"air-alias-scope-textures"}
!34 = !{!32}
!35 = !{!29, !33}
!36 = !{!37, !44, i64 192}
!37 = !{!"_ZTS16waveform_state_t", !38, i64 0, !41, i64 64, !41, i64 112, !42, i64 160, !43, i64 164, !39, i64 176, !44, i64 192}
!38 = !{!"_ZTSN5metal6matrixIfLi4ELi4EvEE", !39, i64 0}
!39 = !{!"omnipotent char", !40, i64 0}
!40 = !{!"Simple C++ TBAA"}
!41 = !{!"_ZTSN5metal6matrixIfLi3ELi3EvEE", !39, i64 0}
!42 = !{!"float", !39, i64 0}
!43 = !{!"bool", !39, i64 0}
!44 = !{!"_ZTS22waveform_computation_t", !39, i64 0}
!45 = !{!39, !39, i64 0}
!46 = !{!37, !43, i64 164}
!47 = !{i8 0, i8 2}

