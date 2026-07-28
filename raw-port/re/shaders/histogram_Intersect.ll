0x000000000029f0 -- histogram_Intersect:
source_filename = "histogram_Intersect"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%"struct.metal::_atomic" = type { i32 }

@_ZL8num_bins = internal unnamed_addr addrspace(2) global i32 undef, align 4
@_Z8num_bins.MTL_FC_INIT_0_j = internal unnamed_addr addrspace(2) externally_initialized constant i32 undef, section "air.fc_initializer", align 4
@llvm.global_ctors = appending global [1 x { i32, void ()*, i8* }] [{ i32, void ()*, i8* } { i32 65535, void ()* @_GLOBAL__sub_I_FFVideoScopesShaders.metal, i8* null }]

; Function Attrs: mustprogress nofree norecurse nosync nounwind willreturn writeonly
define internal void @_GLOBAL__sub_I_FFVideoScopesShaders.metal() #0 section "air.static_init" {
  %1 = load i32, i32 addrspace(2)* @_Z8num_bins.MTL_FC_INIT_0_j, align 4, !tbaa !22
  store i32 %1, i32 addrspace(2)* @_ZL8num_bins, align 4, !tbaa !22
  ret void
}

; Function Attrs: mustprogress nounwind willreturn
define void @histogram_Intersect(i32 noundef %0, %"struct.metal::_atomic" addrspace(1)* nocapture noundef "air-buffer-no-alias" %1) local_unnamed_addr #1 {
  %3 = zext i32 %0 to i64
  %4 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %1, i64 %3
  %5 = load i32, i32 addrspace(2)* @_ZL8num_bins, align 4, !tbaa !22
  %6 = zext i32 %5 to i64
  %7 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %4, i64 %6
  %8 = shl i32 %5, 1
  %9 = zext i32 %8 to i64
  %10 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %4, i64 %9
  %11 = mul i32 %5, 3
  %12 = zext i32 %11 to i64
  %13 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %4, i64 %12
  %14 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %4, i64 0, i32 0
  %15 = tail call i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture %14, i32 0, i32 2, i1 true) #4
  %16 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %7, i64 0, i32 0
  %17 = tail call i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture %16, i32 0, i32 2, i1 true) #4
  %18 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %10, i64 0, i32 0
  %19 = tail call i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture %18, i32 0, i32 2, i1 true) #4
  %20 = tail call i32 @air.min.u.i32(i32 %15, i32 %17) #5
  %21 = tail call i32 @air.min.u.i32(i32 %20, i32 %19) #5
  %22 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %13, i64 0, i32 0
  tail call void @air.atomic.global.store.i32(i32 addrspace(1)* nocapture %22, i32 %21, i32 0, i32 2, i1 true) #4
  ret void
}

; Function Attrs: mustprogress nounwind willreturn
declare void @air.atomic.global.store.i32(i32 addrspace(1)* nocapture, i32, i32, i32, i1) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare i32 @air.min.u.i32(i32, i32) local_unnamed_addr #3

; Function Attrs: mustprogress nounwind willreturn
declare i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture, i32, i32, i1) local_unnamed_addr #2

attributes #0 = { mustprogress nofree norecurse nosync nounwind willreturn writeonly "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #2 = { mustprogress nounwind willreturn }
attributes #3 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #4 = { nounwind willreturn }
attributes #5 = { nounwind readnone willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.kernel = !{!15}
!air.function_constants = !{!21}

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
!15 = !{void (i32, %"struct.metal::_atomic" addrspace(1)*)* @histogram_Intersect, !16, !17}
!16 = !{}
!17 = !{!18, !19}
!18 = !{i32 0, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint", !"air.arg_name", !"gid"}
!19 = !{i32 1, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.struct_type_info", !20, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"metal::_atomic", !"air.arg_name", !"histo"}
!20 = !{i32 0, i32 4, i32 0, !"uint", !"__s"}
!21 = !{i32 addrspace(2)* @_Z8num_bins.MTL_FC_INIT_0_j, !"uint", !"num_bins", i32 0, i1 true}
!22 = !{!23, !23, i64 0}
!23 = !{!"int", !24, i64 0}
!24 = !{!"omnipotent char", !25, i64 0}
!25 = !{!"Simple C++ TBAA"}

