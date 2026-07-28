0x0000000000e560 -- debug_vertex_shader:
source_filename = "debug_vertex_shader"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.waveform_state_t = type <{ %"struct.metal::matrix", %"struct.metal::matrix.0", %"struct.metal::matrix.0", float, i8, [11 x i8], <4 x float>, i32, [12 x i8] }>
%"struct.metal::matrix" = type { [4 x <4 x float>] }
%"struct.metal::matrix.0" = type { [3 x <3 x float>] }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8
@llvm.global_ctors = appending global [0 x { i32, void ()*, i8* }] zeroinitializer

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
define <{ <4 x float>, <4 x float>, <2 x float>, float }> @debug_vertex_shader(i32 noundef %0, <2 x float> addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %1, %struct.waveform_state_t addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %2, %struct._texture_2d_t addrspace(1)* nocapture readonly %3) local_unnamed_addr #0 {
  %5 = zext i32 %0 to i64
  %6 = getelementptr inbounds <2 x float>, <2 x float> addrspace(2)* %1, i64 %5
  %7 = load <2 x float>, <2 x float> addrspace(2)* %6, align 8, !tbaa !28, !alias.scope !31, !noalias !34
  %8 = tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %7, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %9 = extractvalue { <4 x half>, i8 } %8, 0
  %10 = shufflevector <2 x float> %7, <2 x float> poison, <4 x i32> <i32 0, i32 1, i32 undef, i32 undef>
  %11 = shufflevector <4 x float> %10, <4 x float> <float poison, float poison, float 0.000000e+00, float 1.000000e+00>, <4 x i32> <i32 0, i32 1, i32 6, i32 7>
  %12 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %2, i64 0, i32 0, i32 0, i64 0
  %13 = load <4 x float>, <4 x float> addrspace(2)* %12, align 16, !tbaa !28, !alias.scope !37, !noalias !38
  %14 = tail call fast float @air.dot.v4f32(<4 x float> %11, <4 x float> %13) #4
  %15 = insertelement <2 x float> undef, float %14, i64 0
  %16 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %2, i64 0, i32 0, i32 0, i64 1
  %17 = load <4 x float>, <4 x float> addrspace(2)* %16, align 16, !tbaa !28, !alias.scope !37, !noalias !38
  %18 = tail call fast float @air.dot.v4f32(<4 x float> %11, <4 x float> %17) #4
  %19 = insertelement <2 x float> %15, float %18, i64 1
  %20 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %2, i64 0, i32 0, i32 0, i64 2
  %21 = load <4 x float>, <4 x float> addrspace(2)* %20, align 16, !tbaa !28, !alias.scope !37, !noalias !38
  %22 = tail call fast float @air.dot.v4f32(<4 x float> %11, <4 x float> %21) #4
  %23 = insertelement <4 x float> poison, float %22, i64 2
  %24 = getelementptr inbounds %struct.waveform_state_t, %struct.waveform_state_t addrspace(2)* %2, i64 0, i32 0, i32 0, i64 3
  %25 = load <4 x float>, <4 x float> addrspace(2)* %24, align 16, !tbaa !28, !alias.scope !37, !noalias !38
  %26 = tail call fast float @air.dot.v4f32(<4 x float> %11, <4 x float> %25) #4
  %27 = insertelement <4 x float> %23, float %26, i64 3
  %28 = fadd fast <2 x float> %19, <float -1.000000e+00, float -1.000000e+00>
  %29 = shufflevector <2 x float> %28, <2 x float> poison, <4 x i32> <i32 0, i32 1, i32 undef, i32 undef>
  %30 = shufflevector <4 x float> %29, <4 x float> %27, <4 x i32> <i32 0, i32 1, i32 6, i32 7>
  %31 = extractelement <4 x half> %9, i64 0
  %32 = fpext half %31 to float
  %33 = extractelement <4 x half> %9, i64 1
  %34 = fpext half %33 to float
  %35 = extractelement <4 x half> %9, i64 2
  %36 = fpext half %35 to float
  %37 = insertelement <4 x float> <float poison, float poison, float poison, float 1.000000e+00>, float %32, i64 0
  %38 = insertelement <4 x float> %37, float %34, i64 1
  %39 = insertelement <4 x float> %38, float %36, i64 2
  %40 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> undef, <4 x float> %30, 0
  %41 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> %40, <4 x float> %39, 1
  ret <{ <4 x float>, <4 x float>, <2 x float>, float }> %41
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #3 = { argmemonly convergent nounwind readonly willreturn }
attributes #4 = { nounwind readnone willreturn }

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
!15 = !{<{ <4 x float>, <4 x float>, <2 x float>, float }> (i32, <2 x float> addrspace(2)*, %struct.waveform_state_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*)* @debug_vertex_shader, !16, !21}
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
!28 = !{!29, !29, i64 0}
!29 = !{!"omnipotent char", !30, i64 0}
!30 = !{!"Simple C++ TBAA"}
!31 = !{!32}
!32 = distinct !{!32, !33, !"air-alias-scope-arg(1)"}
!33 = distinct !{!33, !"air-alias-scopes(debug_vertex_shader)"}
!34 = !{!35, !36}
!35 = distinct !{!35, !33, !"air-alias-scope-arg(2)"}
!36 = distinct !{!36, !33, !"air-alias-scope-textures"}
!37 = !{!35}
!38 = !{!32, !36}

