0x000000000010f0 -- histogram_compute:
source_filename = "histogram_compute"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%"struct.metal::_atomic" = type { i32 }
%struct.histogram_state_t = type { %"struct.metal::matrix", %"struct.metal::matrix.0", <4 x float>, i32, i32, float, float }
%"struct.metal::matrix" = type { [4 x <4 x float>] }
%"struct.metal::matrix.0" = type { [3 x <3 x float>] }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@_ZL8num_bins = internal unnamed_addr addrspace(2) global i32 undef, align 4
@_Z8num_bins.MTL_FC_INIT_0_j = internal unnamed_addr addrspace(2) externally_initialized constant i32 undef, section "air.fc_initializer", align 4
@__air_sampler_state = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8
@llvm.global_ctors = appending global [1 x { i32, void ()*, i8* }] [{ i32, void ()*, i8* } { i32 65535, void ()* @_GLOBAL__sub_I_FFVideoScopesShaders.metal, i8* null }]

; Function Attrs: mustprogress nofree norecurse nosync nounwind willreturn writeonly
define internal void @_GLOBAL__sub_I_FFVideoScopesShaders.metal() #0 section "air.static_init" {
  %1 = load i32, i32 addrspace(2)* @_Z8num_bins.MTL_FC_INIT_0_j, align 4, !tbaa !26
  store i32 %1, i32 addrspace(2)* @_ZL8num_bins, align 4, !tbaa !26
  ret void
}

; Function Attrs: convergent mustprogress nounwind willreturn
define void @histogram_compute(<2 x i32> noundef %0, %"struct.metal::_atomic" addrspace(1)* nocapture noundef "air-buffer-no-alias" %1, %struct.histogram_state_t addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %2, %struct._texture_2d_t addrspace(1)* %3) local_unnamed_addr #1 {
  %5 = extractelement <2 x i32> %0, i64 0
  %6 = tail call fast float @air.convert.f.f32.u.i32(i32 %5) #5
  %7 = fmul fast float %6, 0x3F60080400000000
  %8 = insertelement <2 x float> undef, float %7, i64 0
  %9 = extractelement <2 x i32> %0, i64 1
  %10 = tail call fast float @air.convert.f.f32.u.i32(i32 %9) #5
  %11 = fmul fast float %10, 0x3F70101020000000
  %12 = insertelement <2 x float> %8, float %11, i64 1
  %13 = tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %12, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #6
  %14 = extractvalue { <4 x half>, i8 } %13, 0
  %15 = load i32, i32 addrspace(2)* @_ZL8num_bins, align 4, !tbaa !26
  %16 = add i32 %15, -1
  %17 = tail call fast float @air.convert.f.f32.u.i32(i32 %16) #5
  %18 = getelementptr inbounds %struct.histogram_state_t, %struct.histogram_state_t addrspace(2)* %2, i64 0, i32 3
  %19 = load i32, i32 addrspace(2)* %18, align 16, !tbaa !30, !alias.scope !36, !noalias !39
  switch i32 %19, label %71 [
    i32 0, label %20
    i32 1, label %41
  ]

20:                                               ; preds = %4
  %21 = extractelement <4 x half> %14, i64 0
  %22 = fpext half %21 to float
  %23 = insertelement <3 x float> undef, float %22, i64 0
  %24 = extractelement <4 x half> %14, i64 1
  %25 = fpext half %24 to float
  %26 = insertelement <3 x float> %23, float %25, i64 1
  %27 = extractelement <4 x half> %14, i64 2
  %28 = fpext half %27 to float
  %29 = insertelement <3 x float> %26, float %28, i64 2
  %30 = getelementptr inbounds %struct.histogram_state_t, %struct.histogram_state_t addrspace(2)* %2, i64 0, i32 1, i32 0, i64 0
  %31 = load <3 x float>, <3 x float> addrspace(2)* %30, align 16, !tbaa !42, !alias.scope !36, !noalias !39
  %32 = tail call fast float @air.dot.v3f32(<3 x float> %29, <3 x float> %31) #5
  %33 = fmul fast float %32, 0x3FE5559B40000000
  %34 = fadd fast float %33, 0x3FC5555560000000
  %35 = tail call fast float @air.fast_clamp.f32(float %34, float 0.000000e+00, float 1.000000e+00) #5
  %36 = fmul fast float %35, %17
  %37 = tail call i32 @air.convert.u.i32.f.f32(float %36) #5
  %38 = zext i32 %37 to i64
  %39 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %1, i64 %38, i32 0
  %40 = tail call i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture %39, i32 1, i32 0, i32 2, i1 true) #7
  br label %71

41:                                               ; preds = %4
  %42 = fmul fast <4 x half> %14, <half 0xH3955, half 0xH3955, half 0xH3955, half 0xH3955>
  %43 = fadd fast <4 x half> %42, <half 0xH3155, half 0xH3155, half 0xH3155, half 0xH3155>
  %44 = tail call fast <4 x half> @air.clamp.v4f16(<4 x half> %43, <4 x half> zeroinitializer, <4 x half> <half 0xH3C00, half 0xH3C00, half 0xH3C00, half 0xH3C00>) #5
  %45 = extractelement <4 x half> %44, i64 0
  %46 = fpext half %45 to float
  %47 = fmul fast float %17, %46
  %48 = tail call i32 @air.convert.u.i32.f.f32(float %47) #5
  %49 = zext i32 %48 to i64
  %50 = extractelement <4 x half> %44, i64 1
  %51 = fpext half %50 to float
  %52 = fmul fast float %17, %51
  %53 = tail call fast float @air.convert.f.f32.u.i32(i32 %15) #5
  %54 = fadd fast float %52, %53
  %55 = tail call i32 @air.convert.u.i32.f.f32(float %54) #5
  %56 = zext i32 %55 to i64
  %57 = extractelement <4 x half> %44, i64 2
  %58 = fpext half %57 to float
  %59 = fmul fast float %17, %58
  %60 = shl i32 %15, 1
  %61 = tail call fast float @air.convert.f.f32.u.i32(i32 %60) #5
  %62 = fadd fast float %61, %59
  %63 = tail call i32 @air.convert.u.i32.f.f32(float %62) #5
  %64 = zext i32 %63 to i64
  %65 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %1, i64 %49, i32 0
  %66 = tail call i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture %65, i32 1, i32 0, i32 2, i1 true) #7
  %67 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %1, i64 %56, i32 0
  %68 = tail call i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture %67, i32 1, i32 0, i32 2, i1 true) #7
  %69 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %1, i64 %64, i32 0
  %70 = tail call i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture %69, i32 1, i32 0, i32 2, i1 true) #7
  br label %71

71:                                               ; preds = %41, %20, %4
  ret void
}

; Function Attrs: mustprogress nounwind willreturn
declare i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture, i32, i32, i32, i1) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare i32 @air.convert.u.i32.f.f32(float) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.convert.f.f32.u.i32(i32) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <4 x half> @air.clamp.v4f16(<4 x half>, <4 x half>, <4 x half>) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_clamp.f32(float, float, float) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #3

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #4

attributes #0 = { mustprogress nofree norecurse nosync nounwind willreturn writeonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { convergent mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="96" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #2 = { mustprogress nounwind willreturn }
attributes #3 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #4 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #5 = { nounwind readnone willreturn }
attributes #6 = { argmemonly convergent nounwind readonly willreturn }
attributes #7 = { nounwind willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.kernel = !{!15}
!air.function_constants = !{!24}
!air.sampler_states = !{!25}

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
!15 = !{void (<2 x i32>, %"struct.metal::_atomic" addrspace(1)*, %struct.histogram_state_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*)* @histogram_compute, !16, !17}
!16 = !{}
!17 = !{!18, !19, !21, !23}
!18 = !{i32 0, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"gid"}
!19 = !{i32 1, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.struct_type_info", !20, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"metal::_atomic", !"air.arg_name", !"histo"}
!20 = !{i32 0, i32 4, i32 0, !"uint", !"__s"}
!21 = !{i32 2, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !22, !"air.arg_type_size", i32 144, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"histogram_state_t", !"air.arg_name", !"state"}
!22 = !{i32 0, i32 64, i32 0, !"float4x4", !"mvp", i32 64, i32 48, i32 0, !"float3x3", !"rgb2ycc", i32 112, i32 16, i32 0, !"float4", !"Cs", i32 128, i32 4, i32 0, !"uint", !"computation", i32 132, i32 4, i32 0, !"uint", !"binOffset", i32 136, i32 4, i32 0, !"float", !"rangeFactor", i32 140, i32 4, i32 0, !"float", !"brightness"}
!23 = !{i32 3, !"air.texture", !"air.location_index", i32 3, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<half, sample>", !"air.arg_name", !"te"}
!24 = !{i32 addrspace(2)* @_Z8num_bins.MTL_FC_INIT_0_j, !"uint", !"num_bins", i32 0, i1 true}
!25 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state}
!26 = !{!27, !27, i64 0}
!27 = !{!"int", !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{!31, !34, i64 128}
!31 = !{!"_ZTS17histogram_state_t", !32, i64 0, !33, i64 64, !28, i64 112, !34, i64 128, !27, i64 132, !35, i64 136, !35, i64 140}
!32 = !{!"_ZTSN5metal6matrixIfLi4ELi4EvEE", !28, i64 0}
!33 = !{!"_ZTSN5metal6matrixIfLi3ELi3EvEE", !28, i64 0}
!34 = !{!"_ZTS23histogram_computation_t", !28, i64 0}
!35 = !{!"float", !28, i64 0}
!36 = !{!37}
!37 = distinct !{!37, !38, !"air-alias-scope-arg(2)"}
!38 = distinct !{!38, !"air-alias-scopes(histogram_compute)"}
!39 = !{!40, !41}
!40 = distinct !{!40, !38, !"air-alias-scope-arg(1)"}
!41 = distinct !{!41, !38, !"air-alias-scope-textures"}
!42 = !{!28, !28, i64 0}

