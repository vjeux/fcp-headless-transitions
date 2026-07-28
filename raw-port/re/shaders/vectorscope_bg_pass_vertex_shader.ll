0x00000000004bf0 -- vectorscope_bg_pass_vertex_shader:
source_filename = "vectorscope_bg_pass_vertex_shader"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.vectorscope_state_t = type <{ %"struct.metal::matrix", %"struct.metal::matrix.0", %"struct.metal::matrix.0", float, float, i8, [7 x i8] }>
%"struct.metal::matrix" = type { [4 x <4 x float>] }
%"struct.metal::matrix.0" = type { [3 x <3 x float>] }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque
%struct._rasterizer_data_t = type { <4 x float>, <4 x float>, <2 x float>, float }

@__air_sampler_state = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8
@llvm.global_ctors = appending global [0 x { i32, void ()*, i8* }] zeroinitializer

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
define <{ <4 x float>, <4 x float>, <2 x float>, float }> @vectorscope_bg_pass_vertex_shader(i32 noundef %0, <2 x float> addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %1, %struct.vectorscope_state_t addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %2, %struct._texture_2d_t addrspace(1)* nocapture readonly %3) local_unnamed_addr #0 {
  %5 = zext i32 %0 to i64
  %6 = getelementptr inbounds <2 x float>, <2 x float> addrspace(2)* %1, i64 %5
  %7 = load <2 x float>, <2 x float> addrspace(2)* %6, align 8, !tbaa !28, !alias.scope !31, !noalias !34
  %8 = tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %7, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4
  %9 = extractvalue { <4 x half>, i8 } %8, 0
  %10 = tail call fastcc %struct._rasterizer_data_t @_Z22vectorscope_rasterizerPU11MTLconstantK19vectorscope_state_tDv4_Dh(%struct.vectorscope_state_t addrspace(2)* noundef %2, <4 x half> noundef %9) #5, !alias.scope !37, !noalias !38
  %11 = extractvalue %struct._rasterizer_data_t %10, 0
  %12 = extractvalue %struct._rasterizer_data_t %10, 2
  %13 = getelementptr inbounds %struct.vectorscope_state_t, %struct.vectorscope_state_t addrspace(2)* %2, i64 0, i32 3
  %14 = load float, float addrspace(2)* %13, align 16, !tbaa !39, !alias.scope !37, !noalias !38
  %15 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> undef, <4 x float> %11, 0
  %16 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> %15, <4 x float> <float 0x3FB61615E0000000, float 0x3FB61615E0000000, float 0x3FB61615E0000000, float 1.000000e+00>, 1
  %17 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> %16, <2 x float> %12, 2
  %18 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> %17, float %14, 3
  ret <{ <4 x float>, <4 x float>, <2 x float>, float }> %18
}

; Function Attrs: argmemonly mustprogress nofree nosync nounwind readonly willreturn
define internal fastcc %struct._rasterizer_data_t @_Z22vectorscope_rasterizerPU11MTLconstantK19vectorscope_state_tDv4_Dh(%struct.vectorscope_state_t addrspace(2)* nocapture noundef readonly %0, <4 x half> noundef %1) unnamed_addr #1 {
  %3 = extractelement <4 x half> %1, i64 0
  %4 = fpext half %3 to float
  %5 = insertelement <3 x float> undef, float %4, i64 0
  %6 = extractelement <4 x half> %1, i64 1
  %7 = fpext half %6 to float
  %8 = insertelement <3 x float> %5, float %7, i64 1
  %9 = extractelement <4 x half> %1, i64 2
  %10 = fpext half %9 to float
  %11 = insertelement <3 x float> %8, float %10, i64 2
  %12 = getelementptr inbounds %struct.vectorscope_state_t, %struct.vectorscope_state_t addrspace(2)* %0, i64 0, i32 1, i32 0, i64 0
  %13 = load <3 x float>, <3 x float> addrspace(2)* %12, align 16, !tbaa !28
  %14 = tail call fast float @air.dot.v3f32(<3 x float> %11, <3 x float> %13) #6
  %15 = getelementptr inbounds %struct.vectorscope_state_t, %struct.vectorscope_state_t addrspace(2)* %0, i64 0, i32 1, i32 0, i64 1
  %16 = load <3 x float>, <3 x float> addrspace(2)* %15, align 16, !tbaa !28
  %17 = tail call fast float @air.dot.v3f32(<3 x float> %11, <3 x float> %16) #6
  %18 = insertelement <3 x float> poison, float %17, i64 1
  %19 = getelementptr inbounds %struct.vectorscope_state_t, %struct.vectorscope_state_t addrspace(2)* %0, i64 0, i32 1, i32 0, i64 2
  %20 = load <3 x float>, <3 x float> addrspace(2)* %19, align 16, !tbaa !28
  %21 = tail call fast float @air.dot.v3f32(<3 x float> %11, <3 x float> %20) #6
  %22 = insertelement <3 x float> %18, float %21, i64 2
  %23 = tail call fast float @air.fast_fmax.f32(float %14, float 0x3FB99999A0000000) #6
  %24 = insertelement <3 x float> %22, float %23, i64 0
  %25 = insertelement <4 x float> <float poison, float poison, float 0.000000e+00, float 1.000000e+00>, float %17, i64 0
  %26 = insertelement <4 x float> %25, float %21, i64 1
  %27 = tail call fast float @air.fast_fabs.f32(float %17) #6
  %28 = tail call fast float @air.fast_fabs.f32(float %21) #6
  %29 = fadd fast float %28, %27
  %30 = fcmp fast olt float %29, 0x3FB99999A0000000
  %31 = insertelement <3 x float> %24, float 5.000000e-01, i64 0
  %32 = select i1 %30, <3 x float> %31, <3 x float> %24
  %33 = getelementptr inbounds %struct.vectorscope_state_t, %struct.vectorscope_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 0
  %34 = load <4 x float>, <4 x float> addrspace(2)* %33, align 16, !tbaa !28
  %35 = tail call fast float @air.dot.v4f32(<4 x float> %26, <4 x float> %34) #6
  %36 = insertelement <4 x float> undef, float %35, i64 0
  %37 = getelementptr inbounds %struct.vectorscope_state_t, %struct.vectorscope_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 1
  %38 = load <4 x float>, <4 x float> addrspace(2)* %37, align 16, !tbaa !28
  %39 = tail call fast float @air.dot.v4f32(<4 x float> %26, <4 x float> %38) #6
  %40 = insertelement <4 x float> %36, float %39, i64 1
  %41 = getelementptr inbounds %struct.vectorscope_state_t, %struct.vectorscope_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 2
  %42 = load <4 x float>, <4 x float> addrspace(2)* %41, align 16, !tbaa !28
  %43 = tail call fast float @air.dot.v4f32(<4 x float> %26, <4 x float> %42) #6
  %44 = insertelement <4 x float> %40, float %43, i64 2
  %45 = getelementptr inbounds %struct.vectorscope_state_t, %struct.vectorscope_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 3
  %46 = load <4 x float>, <4 x float> addrspace(2)* %45, align 16, !tbaa !28
  %47 = tail call fast float @air.dot.v4f32(<4 x float> %26, <4 x float> %46) #6
  %48 = insertelement <4 x float> %44, float %47, i64 3
  %49 = getelementptr inbounds %struct.vectorscope_state_t, %struct.vectorscope_state_t addrspace(2)* %0, i64 0, i32 2, i32 0, i64 0
  %50 = load <3 x float>, <3 x float> addrspace(2)* %49, align 16, !tbaa !28
  %51 = tail call fast float @air.dot.v3f32(<3 x float> %32, <3 x float> %50) #6
  %52 = getelementptr inbounds %struct.vectorscope_state_t, %struct.vectorscope_state_t addrspace(2)* %0, i64 0, i32 2, i32 0, i64 1
  %53 = load <3 x float>, <3 x float> addrspace(2)* %52, align 16, !tbaa !28
  %54 = tail call fast float @air.dot.v3f32(<3 x float> %32, <3 x float> %53) #6
  %55 = getelementptr inbounds %struct.vectorscope_state_t, %struct.vectorscope_state_t addrspace(2)* %0, i64 0, i32 2, i32 0, i64 2
  %56 = load <3 x float>, <3 x float> addrspace(2)* %55, align 16, !tbaa !28
  %57 = tail call fast float @air.dot.v3f32(<3 x float> %32, <3 x float> %56) #6
  %58 = insertelement <4 x float> <float poison, float poison, float poison, float 1.000000e+00>, float %51, i64 0
  %59 = insertelement <4 x float> %58, float %54, i64 1
  %60 = insertelement <4 x float> %59, float %57, i64 2
  %61 = insertvalue %struct._rasterizer_data_t poison, <4 x float> %48, 0
  %62 = insertvalue %struct._rasterizer_data_t %61, <4 x float> %60, 1
  ret %struct._rasterizer_data_t %62
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fabs.f32(float) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmax.f32(float, float) local_unnamed_addr #2

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
!15 = !{<{ <4 x float>, <4 x float>, <2 x float>, float }> (i32, <2 x float> addrspace(2)*, %struct.vectorscope_state_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*)* @vectorscope_bg_pass_vertex_shader, !16, !21}
!16 = !{!17, !18, !19, !20}
!17 = !{!"air.position", !"air.arg_type_name", !"float4", !"air.arg_name", !"P"}
!18 = !{!"air.vertex_output", !"generated(2CsDv4_f)", !"air.arg_type_name", !"float4", !"air.arg_name", !"Cs"}
!19 = !{!"air.vertex_output", !"generated(2stDv2_f)", !"air.arg_type_name", !"float2", !"air.arg_name", !"st"}
!20 = !{!"air.point_size", !"air.arg_type_name", !"float", !"air.arg_name", !"pointsize"}
!21 = !{!22, !23, !24, !26}
!22 = !{i32 0, !"air.vertex_id", !"air.arg_type_name", !"uint", !"air.arg_name", !"idx"}
!23 = !{i32 1, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"float2", !"air.arg_name", !"st"}
!24 = !{i32 2, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !25, !"air.arg_type_size", i32 176, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"vectorscope_state_t", !"air.arg_name", !"state"}
!25 = !{i32 0, i32 64, i32 0, !"float4x4", !"mvp", i32 64, i32 48, i32 0, !"float3x3", !"rgb2ycc", i32 112, i32 48, i32 0, !"float3x3", !"ycc2rgb", i32 160, i32 4, i32 0, !"float", !"pointsize", i32 164, i32 4, i32 0, !"float", !"brightness", i32 168, i32 1, i32 0, !"bool", !"monochrome"}
!26 = !{i32 3, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<half, sample>", !"air.arg_name", !"te"}
!27 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state}
!28 = !{!29, !29, i64 0}
!29 = !{!"omnipotent char", !30, i64 0}
!30 = !{!"Simple C++ TBAA"}
!31 = !{!32}
!32 = distinct !{!32, !33, !"air-alias-scope-arg(1)"}
!33 = distinct !{!33, !"air-alias-scopes(vectorscope_bg_pass_vertex_shader)"}
!34 = !{!35, !36}
!35 = distinct !{!35, !33, !"air-alias-scope-arg(2)"}
!36 = distinct !{!36, !33, !"air-alias-scope-textures"}
!37 = !{!35}
!38 = !{!32, !36}
!39 = !{!40, !43, i64 160}
!40 = !{!"_ZTS19vectorscope_state_t", !41, i64 0, !42, i64 64, !42, i64 112, !43, i64 160, !43, i64 164, !44, i64 168}
!41 = !{!"_ZTSN5metal6matrixIfLi4ELi4EvEE", !29, i64 0}
!42 = !{!"_ZTSN5metal6matrixIfLi3ELi3EvEE", !29, i64 0}
!43 = !{!"float", !29, i64 0}
!44 = !{!"bool", !29, i64 0}

