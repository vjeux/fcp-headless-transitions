0x00000000005a28 -- findLargestComponentKernel:
source_filename = "findLargestComponentKernel"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

; Function Attrs: argmemonly mustprogress nofree norecurse nosync nounwind
define void @findLargestComponentKernel(i32 addrspace(1)* nocapture noundef "air-buffer-no-alias" %0, i32 addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %1, i32 addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %2, i32 addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %3, i32 noundef %4) local_unnamed_addr #0 {
  %6 = load i32, i32 addrspace(2)* %2, align 4, !tbaa !23, !alias.scope !27, !noalias !30
  %7 = add i32 %6, -1
  %8 = icmp ult i32 %7, %4
  br i1 %8, label %36, label %9

9:                                                ; preds = %5
  %10 = load i32, i32 addrspace(2)* %3, align 4, !tbaa !23, !alias.scope !34, !noalias !35
  %11 = icmp sgt i32 %10, 0
  br i1 %11, label %12, label %36

12:                                               ; preds = %9
  %13 = zext i32 %4 to i64
  %14 = getelementptr inbounds i32, i32 addrspace(1)* %0, i64 %13
  %15 = load i32, i32 addrspace(1)* %14, align 4, !tbaa !23, !alias.scope !36, !noalias !37
  br label %16

16:                                               ; preds = %32, %12
  %17 = phi i32 [ %15, %12 ], [ %33, %32 ]
  %18 = phi i32 [ 0, %12 ], [ %34, %32 ]
  %19 = mul i32 %18, %6
  %20 = add i32 %19, %4
  %21 = icmp eq i32 %17, -1
  br i1 %21, label %22, label %23

22:                                               ; preds = %16
  store i32 %20, i32 addrspace(1)* %14, align 4, !tbaa !23, !alias.scope !36, !noalias !37
  br label %32

23:                                               ; preds = %16
  %24 = sext i32 %20 to i64
  %25 = getelementptr inbounds i32, i32 addrspace(2)* %1, i64 %24
  %26 = load i32, i32 addrspace(2)* %25, align 4, !tbaa !23, !alias.scope !38, !noalias !39
  %27 = sext i32 %17 to i64
  %28 = getelementptr inbounds i32, i32 addrspace(2)* %1, i64 %27
  %29 = load i32, i32 addrspace(2)* %28, align 4, !tbaa !23, !alias.scope !38, !noalias !39
  %30 = icmp sgt i32 %26, %29
  br i1 %30, label %31, label %32

31:                                               ; preds = %23
  store i32 %20, i32 addrspace(1)* %14, align 4, !tbaa !23, !alias.scope !36, !noalias !37
  br label %32

32:                                               ; preds = %31, %23, %22
  %33 = phi i32 [ %17, %23 ], [ %20, %31 ], [ %20, %22 ]
  %34 = add nuw nsw i32 %18, 1
  %35 = icmp eq i32 %34, %10
  br i1 %35, label %36, label %16, !llvm.loop !40

36:                                               ; preds = %32, %9, %5
  ret void
}

attributes #0 = { argmemonly mustprogress nofree norecurse nosync nounwind "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }

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
!15 = !{void (i32 addrspace(1)*, i32 addrspace(2)*, i32 addrspace(2)*, i32 addrspace(2)*, i32)* @findLargestComponentKernel, !16, !17}
!16 = !{}
!17 = !{!18, !19, !20, !21, !22}
!18 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"int", !"air.arg_name", !"largestCC"}
!19 = !{i32 1, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"componentCount"}
!20 = !{i32 2, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"width"}
!21 = !{i32 3, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 3, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"height"}
!22 = !{i32 4, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint", !"air.arg_name", !"gid"}
!23 = !{!24, !24, i64 0}
!24 = !{!"int", !25, i64 0}
!25 = !{!"omnipotent char", !26, i64 0}
!26 = !{!"Simple C++ TBAA"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(2)"}
!29 = distinct !{!29, !"air-alias-scopes(findLargestComponentKernel)"}
!30 = !{!31, !32, !33}
!31 = distinct !{!31, !29, !"air-alias-scope-arg(0)"}
!32 = distinct !{!32, !29, !"air-alias-scope-arg(1)"}
!33 = distinct !{!33, !29, !"air-alias-scope-arg(3)"}
!34 = !{!33}
!35 = !{!31, !32, !28}
!36 = !{!31}
!37 = !{!32, !28, !33}
!38 = !{!32}
!39 = !{!31, !28, !33}
!40 = distinct !{!40, !41}
!41 = !{!"llvm.loop.mustprogress"}
Disassembly of section REFLECTION_LIST:
