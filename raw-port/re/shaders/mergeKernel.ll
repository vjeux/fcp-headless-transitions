0x000000000015d8 -- mergeKernel:
source_filename = "mergeKernel"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%"struct.metal::_atomic" = type { i32 }

; Function Attrs: convergent mustprogress nounwind
define void @mergeKernel(%struct._texture_2d_t addrspace(1)* %0, %"struct.metal::_atomic" addrspace(1)* nocapture noundef "air-buffer-no-alias" %1, float addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %2, i8 addrspace(2)* nocapture noundef readonly align 1 dereferenceable(1) "air-buffer-no-alias" %3, <2 x i32> noundef %4, <2 x i32> noundef %5, <2 x i32> noundef %6, <2 x i32> noundef %7) local_unnamed_addr #0 {
  %9 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, i32 0) #4, !alias.scope !27, !noalias !30
  %10 = extractelement <2 x i32> %4, i64 0
  %11 = add i32 %9, -1
  %12 = icmp ugt i32 %10, %11
  br i1 %12, label %69, label %13

13:                                               ; preds = %8
  %14 = tail call i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, i32 0) #4, !alias.scope !27, !noalias !30
  %15 = extractelement <2 x i32> %4, i64 1
  %16 = add i32 %14, -1
  %17 = icmp ugt i32 %15, %16
  br i1 %17, label %69, label %18

18:                                               ; preds = %13
  %19 = load i8, i8 addrspace(2)* %3, align 1, !tbaa !34, !range !38, !alias.scope !39, !noalias !40
  %20 = icmp eq i8 %19, 0
  br i1 %20, label %31, label %21

21:                                               ; preds = %18
  %22 = extractelement <2 x i32> %6, i64 1
  %23 = extractelement <2 x i32> %6, i64 0
  %24 = extractelement <2 x i32> %5, i64 0
  %25 = add i32 %23, -1
  %26 = icmp eq i32 %24, %25
  %27 = extractelement <2 x i32> %5, i64 1
  %28 = add i32 %22, -1
  %29 = icmp eq i32 %27, %28
  %30 = or i1 %26, %29
  br i1 %30, label %31, label %69

31:                                               ; preds = %21, %18
  %32 = tail call { <4 x float>, i8 } @air.read_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, <2 x i32> %4, i32 0, i32 1) #4, !alias.scope !27, !noalias !30
  %33 = extractvalue { <4 x float>, i8 } %32, 0
  %34 = extractelement <4 x float> %33, i64 0
  %35 = load float, float addrspace(2)* %2, align 4, !tbaa !41, !alias.scope !43, !noalias !44
  %36 = fcmp fast olt float %34, %35
  br i1 %36, label %69, label %37

37:                                               ; preds = %31
  %38 = mul i32 %9, %15
  %39 = add i32 %38, %10
  br label %40

40:                                               ; preds = %46, %37
  %41 = phi i32 [ -1, %37 ], [ %47, %46 ]
  %42 = add i32 %41, %10
  %43 = icmp sgt i32 %42, -1
  %44 = icmp slt i32 %42, %11
  %45 = insertelement <2 x i32> undef, i32 %42, i64 0
  br label %49

46:                                               ; preds = %66
  %47 = add nsw i32 %41, 1
  %48 = icmp eq i32 %47, 2
  br i1 %48, label %69, label %40, !llvm.loop !45

49:                                               ; preds = %66, %40
  %50 = phi i32 [ -1, %40 ], [ %67, %66 ]
  %51 = add i32 %50, %15
  %52 = icmp sgt i32 %51, -1
  %53 = select i1 %43, i1 %52, i1 false
  %54 = icmp slt i32 %51, %16
  %55 = select i1 %53, i1 %54, i1 false
  %56 = select i1 %55, i1 %44, i1 false
  br i1 %56, label %57, label %66

57:                                               ; preds = %49
  %58 = insertelement <2 x i32> %45, i32 %51, i64 1
  %59 = tail call { <4 x float>, i8 } @air.read_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, <2 x i32> %58, i32 0, i32 1) #4, !alias.scope !27, !noalias !30
  %60 = extractvalue { <4 x float>, i8 } %59, 0
  %61 = extractelement <4 x float> %60, i64 0
  %62 = fcmp fast ult float %61, %35
  br i1 %62, label %66, label %63

63:                                               ; preds = %57
  %64 = mul i32 %51, %9
  %65 = add i32 %64, %42
  tail call fastcc void @_Z5mergePU9MTLdeviceN5metal7_atomicIjvEEjj(%"struct.metal::_atomic" addrspace(1)* noundef %1, i32 noundef %39, i32 noundef %65) #5
  br label %66

66:                                               ; preds = %63, %57, %49
  %67 = add nsw i32 %50, 1
  %68 = icmp eq i32 %67, 2
  br i1 %68, label %46, label %49, !llvm.loop !47

69:                                               ; preds = %46, %31, %21, %13, %8
  ret void
}

; Function Attrs: mustprogress nounwind
define internal fastcc void @_Z5mergePU9MTLdeviceN5metal7_atomicIjvEEjj(%"struct.metal::_atomic" addrspace(1)* nocapture noundef %0, i32 noundef %1, i32 noundef %2) unnamed_addr #1 {
  %4 = zext i32 %1 to i64
  %5 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %0, i64 %4, i32 0
  %6 = tail call i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture %5, i32 0, i32 2, i1 true) #6
  %7 = add i32 %6, -1
  %8 = icmp eq i32 %7, %1
  br i1 %8, label %16, label %9

9:                                                ; preds = %9, %3
  %10 = phi i32 [ %14, %9 ], [ %7, %3 ]
  %11 = zext i32 %10 to i64
  %12 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %0, i64 %11, i32 0
  %13 = tail call i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture %12, i32 0, i32 2, i1 true) #6
  %14 = add i32 %13, -1
  %15 = icmp eq i32 %14, %10
  br i1 %15, label %16, label %9, !llvm.loop !48

16:                                               ; preds = %9, %3
  %17 = phi i32 [ %1, %3 ], [ %10, %9 ]
  %18 = zext i32 %2 to i64
  %19 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %0, i64 %18, i32 0
  %20 = tail call i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture %19, i32 0, i32 2, i1 true) #6
  %21 = add i32 %20, -1
  %22 = icmp eq i32 %21, %2
  br i1 %22, label %30, label %23

23:                                               ; preds = %23, %16
  %24 = phi i32 [ %28, %23 ], [ %21, %16 ]
  %25 = zext i32 %24 to i64
  %26 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %0, i64 %25, i32 0
  %27 = tail call i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture %26, i32 0, i32 2, i1 true) #6
  %28 = add i32 %27, -1
  %29 = icmp eq i32 %28, %24
  br i1 %29, label %30, label %23, !llvm.loop !48

30:                                               ; preds = %23, %16
  %31 = phi i32 [ %2, %16 ], [ %24, %23 ]
  %32 = icmp ult i32 %17, %31
  br i1 %32, label %33, label %38

33:                                               ; preds = %30
  %34 = zext i32 %31 to i64
  %35 = add nuw i32 %17, 1
  %36 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %0, i64 %34, i32 0
  %37 = tail call i32 @air.atomic.global.min.u.i32(i32 addrspace(1)* nocapture %36, i32 %35, i32 0, i32 2, i1 true) #6
  br label %45

38:                                               ; preds = %30
  %39 = icmp ugt i32 %17, %31
  br i1 %39, label %40, label %45

40:                                               ; preds = %38
  %41 = zext i32 %17 to i64
  %42 = getelementptr inbounds %"struct.metal::_atomic", %"struct.metal::_atomic" addrspace(1)* %0, i64 %41, i32 0
  %43 = add nuw i32 %31, 1
  %44 = tail call i32 @air.atomic.global.min.u.i32(i32 addrspace(1)* nocapture %42, i32 %43, i32 0, i32 2, i1 true) #6
  br label %45

45:                                               ; preds = %40, %38, %33
  ret void
}

; Function Attrs: mustprogress nounwind willreturn
declare i32 @air.atomic.global.min.u.i32(i32 addrspace(1)* nocapture, i32, i32, i32, i1) local_unnamed_addr #2

; Function Attrs: mustprogress nounwind willreturn
declare i32 @air.atomic.global.load.i32(i32 addrspace(1)* nocapture, i32, i32, i1) local_unnamed_addr #2

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.read_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, <2 x i32>, i32, i32) local_unnamed_addr #3

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #3

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #3

attributes #0 = { convergent mustprogress nounwind "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nounwind "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #2 = { mustprogress nounwind willreturn }
attributes #3 = { argmemonly mustprogress nofree nounwind readonly willreturn }
attributes #4 = { argmemonly nounwind readonly willreturn }
attributes #5 = { nobuiltin "no-builtins" }
attributes #6 = { nounwind willreturn }

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
!15 = !{void (%struct._texture_2d_t addrspace(1)*, %"struct.metal::_atomic" addrspace(1)*, float addrspace(2)*, i8 addrspace(2)*, <2 x i32>, <2 x i32>, <2 x i32>, <2 x i32>)* @mergeKernel, !16, !17}
!16 = !{}
!17 = !{!18, !19, !21, !22, !23, !24, !25, !26}
!18 = !{i32 0, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.read", !"air.arg_type_name", !"texture2d<float, read>", !"air.arg_name", !"sourceTexture"}
!19 = !{i32 1, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.struct_type_info", !20, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"metal::_atomic", !"air.arg_name", !"labeledImage"}
!20 = !{i32 0, i32 4, i32 0, !"uint", !"__s"}
!21 = !{i32 2, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"threshold"}
!22 = !{i32 3, !"air.buffer", !"air.buffer_size", i32 1, !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 1, !"air.arg_type_align_size", i32 1, !"air.arg_type_name", !"bool", !"air.arg_name", !"onlyBorders"}
!23 = !{i32 4, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"gid"}
!24 = !{i32 5, !"air.thread_position_in_threadgroup", !"air.arg_type_name", !"uint2", !"air.arg_name", !"pid"}
!25 = !{i32 6, !"air.threads_per_threadgroup", !"air.arg_type_name", !"uint2", !"air.arg_name", !"threads_per_threadgroup"}
!26 = !{i32 7, !"air.threads_per_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"threads_per_grid", !"air.arg_unused"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-textures"}
!29 = distinct !{!29, !"air-alias-scopes(mergeKernel)"}
!30 = !{!31, !32, !33}
!31 = distinct !{!31, !29, !"air-alias-scope-arg(1)"}
!32 = distinct !{!32, !29, !"air-alias-scope-arg(2)"}
!33 = distinct !{!33, !29, !"air-alias-scope-arg(3)"}
!34 = !{!35, !35, i64 0}
!35 = !{!"bool", !36, i64 0}
!36 = !{!"omnipotent char", !37, i64 0}
!37 = !{!"Simple C++ TBAA"}
!38 = !{i8 0, i8 2}
!39 = !{!33}
!40 = !{!28, !31, !32}
!41 = !{!42, !42, i64 0}
!42 = !{!"float", !36, i64 0}
!43 = !{!32}
!44 = !{!28, !31, !33}
!45 = distinct !{!45, !46}
!46 = !{!"llvm.loop.mustprogress"}
!47 = distinct !{!47, !46}
!48 = distinct !{!48, !46}

