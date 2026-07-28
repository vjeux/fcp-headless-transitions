0x00000000004728 -- compressKernel:
source_filename = "compressKernel"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%"struct.metal::_atomic" = type { i32 }
%struct._texture_2d_t = type opaque

; Function Attrs: mustprogress nounwind
define void @compressKernel(%"struct.metal::_atomic" addrspace(1)* nocapture noundef "air-buffer-no-alias" %0, i32 addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %1, i32 addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %2, %"struct.metal::_atomic" addrspace(1)* nocapture noundef "air-buffer-no-alias" %3, %"struct.metal::_atomic" addrspace(1)* nocapture noundef "air-buffer-no-alias" %4, %struct._texture_2d_t addrspace(1)* %5, <2 x i32> noundef %6) local_unnamed_addr #0 {
  %8 = extractelement <2 x i32> %6, i64 0
  %9 = load i32, i32 addrspace(2)* %1, align 4, !tbaa !26, !alias.scope !30, !noalias !33
  %10 = add i32 %9, -1
  %11 = icmp ugt i32 %8, %10
  br i1 %11, label %52, label %12

12:                                               ; preds = %7
  %13 = extractelement <2 x i32> %6, i64 1
  %14 = load i32, i32 addrspace(2)* %2, align 4, !tbaa !26, !alias.scope !39, !noalias !40
  %15 = add i32 %14, -1
  %16 = icmp ugt i32 %13, %15
  br i1 %16, label %52, label %17

17:                                               ; preds = %12
  %18 = mul i32 %9, %13
  %19 = add i32 %18, %8
  %20 = zext i32 %19 to i64
  %21 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %0, i64 %20, i32 0
  %22 = tail call i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture %21, i32 0, i32 2, i1 true) #4
  %23 = icmp eq i32 %22, 0
  br i1 %23, label %24, label %25

24:                                               ; preds = %17
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %6, <4 x float> <float 0.000000e+00, float 0.000000e+00, float 0.000000e+00, float 1.000000e+00>, i32 0, i32 3) #5, !alias.scope !41, !noalias !42
  br label %52

25:                                               ; preds = %17
  %26 = add i32 %22, -1
  %27 = zext i32 %26 to i64
  %28 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %0, i64 %27, i32 0
  %29 = tail call i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture %28, i32 0, i32 2, i1 true) #4
  %30 = icmp eq i32 %29, %22
  br i1 %30, label %40, label %31

31:                                               ; preds = %25
  %32 = add i32 %29, -1
  br label %33

33:                                               ; preds = %33, %31
  %34 = phi i32 [ %38, %33 ], [ %32, %31 ]
  %35 = zext i32 %34 to i64
  %36 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %0, i64 %35, i32 0
  %37 = tail call i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture %36, i32 0, i32 2, i1 true) #4
  %38 = add i32 %37, -1
  %39 = icmp eq i32 %38, %34
  br i1 %39, label %40, label %33, !llvm.loop !43

40:                                               ; preds = %33, %25
  %41 = phi i64 [ %27, %25 ], [ %35, %33 ]
  %42 = phi i32 [ %26, %25 ], [ %34, %33 ]
  %43 = add i32 %42, 1
  tail call void @air.atomic.global.store.i32(i32 addrspace(1)* nocapture %21, i32 %43, i32 0, i32 2, i1 true) #4
  %44 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %3, i64 %41, i32 0
  %45 = tail call i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture %44, i32 1, i32 0, i32 2, i1 true) #4
  %46 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %4, i64 %41, i32 0
  %47 = tail call i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture %46, i32 %8, i32 0, i32 2, i1 true) #4
  %48 = tail call fast float @air.convert.f.f32.u.i32(i32 %43) #6
  %49 = insertelement <4 x float> <float poison, float poison, float poison, float 1.000000e+00>, float %48, i64 0
  %50 = insertelement <4 x float> %49, float %48, i64 1
  %51 = insertelement <4 x float> %50, float %48, i64 2
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %6, <4 x float> %51, i32 0, i32 3) #5, !alias.scope !41, !noalias !42
  br label %52

52:                                               ; preds = %40, %24, %12, %7
  ret void
}

; Function Attrs: argmemonly mustprogress nounwind willreturn
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.convert.f.f32.u.i32(i32) local_unnamed_addr #2

; Function Attrs: mustprogress nounwind willreturn
declare i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture, i32, i32, i32, i1) local_unnamed_addr #3

; Function Attrs: mustprogress nounwind willreturn
declare void @air.atomic.global.store.i32(i32 addrspace(1)* nocapture, i32, i32, i32, i1) local_unnamed_addr #3

; Function Attrs: mustprogress nounwind willreturn
declare i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture, i32, i32, i1) local_unnamed_addr #3

attributes #0 = { mustprogress nounwind "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly mustprogress nounwind willreturn }
attributes #2 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #3 = { mustprogress nounwind willreturn }
attributes #4 = { nounwind willreturn }
attributes #5 = { argmemonly nounwind willreturn }
attributes #6 = { nounwind readnone willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.kernel = !{!15}

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
!15 = !{void (%"struct.metal::_atomic" addrspace(1)*, i32 addrspace(2)*, i32 addrspace(2)*, %"struct.metal::_atomic" addrspace(1)*, %"struct.metal::_atomic" addrspace(1)*, %struct._texture_2d_t addrspace(1)*, <2 x i32>)* @compressKernel, !16, !17}
!16 = !{}
!17 = !{!18, !20, !21, !22, !23, !24, !25}
!18 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.struct_type_info", !19, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"metal::_atomic", !"air.arg_name", !"labeledImage"}
!19 = !{i32 0, i32 4, i32 0, !"uint", !"__s"}
!20 = !{i32 1, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"width"}
!21 = !{i32 2, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"height"}
!22 = !{i32 3, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.struct_type_info", !19, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"metal::_atomic", !"air.arg_name", !"componentCount"}
!23 = !{i32 4, !"air.buffer", !"air.location_index", i32 4, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.struct_type_info", !19, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"metal::_atomic", !"air.arg_name", !"centroidX"}
!24 = !{i32 5, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.read_write", !"air.arg_type_name", !"texture2d<float, read_write>", !"air.arg_name", !"labeledTexture"}
!25 = !{i32 6, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"gid"}
!26 = !{!27, !27, i64 0}
!27 = !{!"int", !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{!31}
!31 = distinct !{!31, !32, !"air-alias-scope-arg(1)"}
!32 = distinct !{!32, !"air-alias-scopes(compressKernel)"}
!33 = !{!34, !35, !36, !37, !38}
!34 = distinct !{!34, !32, !"air-alias-scope-arg(0)"}
!35 = distinct !{!35, !32, !"air-alias-scope-arg(2)"}
!36 = distinct !{!36, !32, !"air-alias-scope-arg(3)"}
!37 = distinct !{!37, !32, !"air-alias-scope-arg(4)"}
!38 = distinct !{!38, !32, !"air-alias-scope-textures"}
!39 = !{!35}
!40 = !{!34, !31, !36, !37, !38}
!41 = !{!38}
!42 = !{!34, !31, !35, !36, !37}
!43 = distinct !{!43, !44}
!44 = !{!"llvm.loop.mustprogress"}

