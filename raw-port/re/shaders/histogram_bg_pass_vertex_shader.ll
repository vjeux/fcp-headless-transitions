0x0000000000b0f0 -- histogram_bg_pass_vertex_shader:
source_filename = "histogram_bg_pass_vertex_shader"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%"struct.metal::_atomic" = type { i32 }
%struct.histogram_state_t = type { %"struct.metal::matrix", %"struct.metal::matrix.0", <4 x float>, i32, i32, float, float }
%"struct.metal::matrix" = type { [4 x <4 x float>] }
%"struct.metal::matrix.0" = type { [3 x <3 x float>] }
%struct._rasterizer_data_t = type { <4 x float>, <4 x float>, <2 x float>, float }

@_ZL8num_bins = internal unnamed_addr addrspace(2) global i32 undef, align 4
@_Z8num_bins.MTL_FC_INIT_0_j = internal unnamed_addr addrspace(2) externally_initialized constant i32 undef, section "air.fc_initializer", align 4
@llvm.global_ctors = appending global [1 x { i32, void ()*, i8* }] [{ i32, void ()*, i8* } { i32 65535, void ()* @_GLOBAL__sub_I_FFVideoScopesShaders.metal, i8* null }]

; Function Attrs: mustprogress nofree norecurse nosync nounwind willreturn writeonly
define internal void @_GLOBAL__sub_I_FFVideoScopesShaders.metal() #0 section "air.static_init" {
  %1 = load i32, i32 addrspace(2)* @_Z8num_bins.MTL_FC_INIT_0_j, align 4, !tbaa !28
  store i32 %1, i32 addrspace(2)* @_ZL8num_bins, align 4, !tbaa !28
  ret void
}

; Function Attrs: convergent mustprogress nounwind willreturn
define <{ <4 x float>, <4 x float>, <2 x float>, float }> @histogram_bg_pass_vertex_shader(i32 noundef %0, %"struct.metal::_atomic" addrspace(1)* nocapture noundef "air-buffer-no-alias" %1, %struct.histogram_state_t addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %2) local_unnamed_addr #1 {
  %4 = load i32, i32 addrspace(2)* @_ZL8num_bins, align 4, !tbaa !28
  %5 = add i32 %4, -1
  %6 = tail call fast float @air.convert.f.f32.u.i32(i32 %5) #5
  %7 = tail call fast float @air.convert.f.f32.u.i32(i32 %0) #5
  %8 = fmul fast float %7, 5.000000e-01
  %9 = tail call fast float @air.fast_floor.f32(float %8) #5
  %10 = fdiv fast float %9, %6
  %11 = tail call fastcc %struct._rasterizer_data_t @_Z20histogram_rasterizerPU11MTLconstantK17histogram_state_tPU9MTLdeviceKN5metal7_atomicIjvEEjf(%struct.histogram_state_t addrspace(2)* noundef %2, %"struct.metal::_atomic" addrspace(1)* noundef %1, i32 noundef %0, float noundef %10) #6
  %12 = extractvalue %struct._rasterizer_data_t %11, 0
  %13 = extractvalue %struct._rasterizer_data_t %11, 2
  %14 = extractvalue %struct._rasterizer_data_t %11, 3
  %15 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> undef, <4 x float> %12, 0
  %16 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> %15, <4 x float> <float 0x3FB61615E0000000, float 0x3FB61615E0000000, float 0x3FB61615E0000000, float 1.000000e+00>, 1
  %17 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> %16, <2 x float> %13, 2
  %18 = insertvalue <{ <4 x float>, <4 x float>, <2 x float>, float }> %17, float %14, 3
  ret <{ <4 x float>, <4 x float>, <2 x float>, float }> %18
}

; Function Attrs: mustprogress nounwind willreturn
define internal fastcc %struct._rasterizer_data_t @_Z20histogram_rasterizerPU11MTLconstantK17histogram_state_tPU9MTLdeviceKN5metal7_atomicIjvEEjf(%struct.histogram_state_t addrspace(2)* nocapture noundef readonly %0, %"struct.metal::_atomic" addrspace(1)* nocapture noundef %1, i32 noundef %2, float noundef %3) unnamed_addr #2 {
  %5 = and i32 %2, 1
  %6 = icmp eq i32 %5, 0
  br i1 %6, label %7, label %9

7:                                                ; preds = %4
  %8 = insertelement <4 x float> <float poison, float 0.000000e+00, float 0.000000e+00, float 1.000000e+00>, float %3, i64 0
  br label %27

9:                                                ; preds = %4
  %10 = add i32 %2, -1
  %11 = tail call fast float @air.convert.f.f32.u.i32(i32 %10) #5
  %12 = fmul fast float %11, 5.000000e-01
  %13 = tail call i32 @air.convert.u.i32.f.f32(float %12) #5
  %14 = getelementptr inbounds %struct.histogram_state_t, %struct.histogram_state_t addrspace(2)* %0, i64 0, i32 4
  %15 = load i32, i32 addrspace(2)* %14, align 4, !tbaa !32
  %16 = add i32 %15, %13
  %17 = zext i32 %16 to i64
  %18 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %1, i64 %17, i32 0
  %19 = tail call i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture %18, i32 0, i32 2, i1 true) #7
  %20 = tail call fast float @air.convert.f.f32.u.i32(i32 %19) #5
  %21 = getelementptr inbounds %struct.histogram_state_t, %struct.histogram_state_t addrspace(2)* %0, i64 0, i32 5
  %22 = load float, float addrspace(2)* %21, align 8, !tbaa !38
  %23 = fmul fast float %22, %20
  %24 = tail call fast float @air.fast_fmin.f32(float %23, float 1.000000e+00) #5
  %25 = insertelement <4 x float> <float poison, float poison, float 0.000000e+00, float 1.000000e+00>, float %3, i64 0
  %26 = insertelement <4 x float> %25, float %24, i64 1
  br label %27

27:                                               ; preds = %9, %7
  %28 = phi <4 x float> [ %8, %7 ], [ %26, %9 ]
  %29 = getelementptr inbounds %struct.histogram_state_t, %struct.histogram_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 0
  %30 = load <4 x float>, <4 x float> addrspace(2)* %29, align 16, !tbaa !39
  %31 = tail call fast float @air.dot.v4f32(<4 x float> %28, <4 x float> %30) #5
  %32 = insertelement <4 x float> undef, float %31, i64 0
  %33 = getelementptr inbounds %struct.histogram_state_t, %struct.histogram_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 1
  %34 = load <4 x float>, <4 x float> addrspace(2)* %33, align 16, !tbaa !39
  %35 = tail call fast float @air.dot.v4f32(<4 x float> %28, <4 x float> %34) #5
  %36 = insertelement <4 x float> %32, float %35, i64 1
  %37 = getelementptr inbounds %struct.histogram_state_t, %struct.histogram_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 2
  %38 = load <4 x float>, <4 x float> addrspace(2)* %37, align 16, !tbaa !39
  %39 = tail call fast float @air.dot.v4f32(<4 x float> %28, <4 x float> %38) #5
  %40 = insertelement <4 x float> %36, float %39, i64 2
  %41 = getelementptr inbounds %struct.histogram_state_t, %struct.histogram_state_t addrspace(2)* %0, i64 0, i32 0, i32 0, i64 3
  %42 = load <4 x float>, <4 x float> addrspace(2)* %41, align 16, !tbaa !39
  %43 = tail call fast float @air.dot.v4f32(<4 x float> %28, <4 x float> %42) #5
  %44 = insertelement <4 x float> %40, float %43, i64 3
  %45 = insertvalue %struct._rasterizer_data_t poison, <4 x float> %44, 0
  ret %struct._rasterizer_data_t %45
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v4f32(<4 x float>, <4 x float>) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmin.f32(float, float) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.convert.f.f32.u.i32(i32) local_unnamed_addr #3

; Function Attrs: mustprogress nounwind willreturn
declare i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture, i32, i32, i1) local_unnamed_addr #4

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare i32 @air.convert.u.i32.f.f32(float) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_floor.f32(float) local_unnamed_addr #3

attributes #0 = { mustprogress nofree norecurse nosync nounwind willreturn writeonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { convergent mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #2 = { mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #3 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #4 = { mustprogress nounwind willreturn }
attributes #5 = { nounwind readnone willreturn }
attributes #6 = { nobuiltin "no-builtins" }
attributes #7 = { nounwind willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.vertex = !{!15}
!air.function_constants = !{!27}

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
!15 = !{<{ <4 x float>, <4 x float>, <2 x float>, float }> (i32, %"struct.metal::_atomic" addrspace(1)*, %struct.histogram_state_t addrspace(2)*)* @histogram_bg_pass_vertex_shader, !16, !21}
!16 = !{!17, !18, !19, !20}
!17 = !{!"air.position", !"air.arg_type_name", !"float4", !"air.arg_name", !"P"}
!18 = !{!"air.vertex_output", !"generated(2CsDv4_f)", !"air.arg_type_name", !"float4", !"air.arg_name", !"Cs"}
!19 = !{!"air.vertex_output", !"generated(2stDv2_f)", !"air.arg_type_name", !"float2", !"air.arg_name", !"st"}
!20 = !{!"air.point_size", !"air.arg_type_name", !"float", !"air.arg_name", !"pointsize"}
!21 = !{!22, !23, !25}
!22 = !{i32 0, !"air.vertex_id", !"air.arg_type_name", !"uint", !"air.arg_name", !"idx"}
!23 = !{i32 1, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 1, !"air.struct_type_info", !24, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"metal::_atomic", !"air.arg_name", !"histo"}
!24 = !{i32 0, i32 4, i32 0, !"uint", !"__s"}
!25 = !{i32 2, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !26, !"air.arg_type_size", i32 144, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"histogram_state_t", !"air.arg_name", !"state"}
!26 = !{i32 0, i32 64, i32 0, !"float4x4", !"mvp", i32 64, i32 48, i32 0, !"float3x3", !"rgb2ycc", i32 112, i32 16, i32 0, !"float4", !"Cs", i32 128, i32 4, i32 0, !"uint", !"computation", i32 132, i32 4, i32 0, !"uint", !"binOffset", i32 136, i32 4, i32 0, !"float", !"rangeFactor", i32 140, i32 4, i32 0, !"float", !"brightness"}
!27 = !{i32 addrspace(2)* @_Z8num_bins.MTL_FC_INIT_0_j, !"uint", !"num_bins", i32 0, i1 true}
!28 = !{!29, !29, i64 0}
!29 = !{!"int", !30, i64 0}
!30 = !{!"omnipotent char", !31, i64 0}
!31 = !{!"Simple C++ TBAA"}
!32 = !{!33, !29, i64 132}
!33 = !{!"_ZTS17histogram_state_t", !34, i64 0, !35, i64 64, !30, i64 112, !36, i64 128, !29, i64 132, !37, i64 136, !37, i64 140}
!34 = !{!"_ZTSN5metal6matrixIfLi4ELi4EvEE", !30, i64 0}
!35 = !{!"_ZTSN5metal6matrixIfLi3ELi3EvEE", !30, i64 0}
!36 = !{!"_ZTS23histogram_computation_t", !30, i64 0}
!37 = !{!"float", !30, i64 0}
!38 = !{!33, !37, i64 136}
!39 = !{!30, !30, i64 0}

