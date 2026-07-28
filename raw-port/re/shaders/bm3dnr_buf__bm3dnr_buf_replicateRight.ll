0x0000000006ccad -- bm3dnr_buf::bm3dnr_buf_replicateRight:
source_filename = "bm3dnr_buf::bm3dnr_buf_replicateRight"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" = type { i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_replicateRight"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, i8 addrspace(1)* nocapture "air-buffer-no-alias" %2) local_unnamed_addr #0 {
  %4 = extractelement <2 x i32> %1, i64 0
  %5 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 3
  %6 = load i32, i32 addrspace(2)* %5, align 4, !tbaa !21, !alias.scope !26, !noalias !29
  %7 = icmp ult i32 %4, %6
  br i1 %7, label %8, label %55

8:                                                ; preds = %3
  %9 = extractelement <2 x i32> %1, i64 1
  %10 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 4
  %11 = load i32, i32 addrspace(2)* %10, align 4, !tbaa !31, !alias.scope !26, !noalias !29
  %12 = icmp ult i32 %9, %11
  br i1 %12, label %13, label %55

13:                                               ; preds = %8
  %14 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 0
  %15 = load i32, i32 addrspace(2)* %14, align 4, !tbaa !32, !alias.scope !26, !noalias !29
  %16 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 1
  %17 = load i32, i32 addrspace(2)* %16, align 4, !tbaa !33, !alias.scope !26, !noalias !29
  %18 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 2
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !34, !alias.scope !26, !noalias !29
  %20 = zext i32 %9 to i64
  %21 = bitcast i8 addrspace(1)* %2 to <4 x i8> addrspace(1)*
  %22 = bitcast i8 addrspace(1)* %2 to <4 x i16> addrspace(1)*
  %23 = icmp eq i32 %19, 0
  %24 = sext i32 %17 to i64
  %25 = mul nsw i64 %24, %20
  %26 = sext i32 %15 to i64
  %27 = add nsw i64 %25, %26
  %28 = add nsw i64 %27, -1
  br i1 %23, label %42, label %29

29:                                               ; preds = %13
  %30 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %21, i64 %28
  %31 = load <4 x i8>, <4 x i8> addrspace(1)* %30, align 4, !tbaa !35, !alias.scope !29, !noalias !26
  %32 = shufflevector <4 x i8> %31, <4 x i8> undef, <4 x i32> <i32 3, i32 3, i32 3, i32 3>
  %33 = sub i32 %17, %15
  %34 = icmp sgt i32 %33, 0
  br i1 %34, label %35, label %55

35:                                               ; preds = %35, %29
  %36 = phi i32 [ %40, %35 ], [ 0, %29 ]
  %37 = zext i32 %36 to i64
  %38 = add i64 %27, %37
  %39 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %21, i64 %38
  store <4 x i8> %32, <4 x i8> addrspace(1)* %39, align 4, !tbaa !35, !alias.scope !29, !noalias !26
  %40 = add nuw nsw i32 %36, 1
  %41 = icmp eq i32 %40, %33
  br i1 %41, label %55, label %35, !llvm.loop !36

42:                                               ; preds = %13
  %43 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %22, i64 %28
  %44 = load <4 x i16>, <4 x i16> addrspace(1)* %43, align 8, !tbaa !35, !alias.scope !29, !noalias !26
  %45 = shufflevector <4 x i16> %44, <4 x i16> undef, <4 x i32> <i32 3, i32 3, i32 3, i32 3>
  %46 = sub i32 %17, %15
  %47 = icmp sgt i32 %46, 0
  br i1 %47, label %48, label %55

48:                                               ; preds = %48, %42
  %49 = phi i32 [ %53, %48 ], [ 0, %42 ]
  %50 = zext i32 %49 to i64
  %51 = add i64 %27, %50
  %52 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %22, i64 %51
  store <4 x i16> %45, <4 x i16> addrspace(1)* %52, align 8, !tbaa !35, !alias.scope !29, !noalias !26
  %53 = add nuw nsw i32 %49, 1
  %54 = icmp eq i32 %53, %46
  br i1 %54, label %55, label %48, !llvm.loop !38

55:                                               ; preds = %48, %42, %35, %29, %8, %3
  ret void
}

attributes #0 = { argmemonly norecurse nounwind "frame-pointer"="all" "min-legal-vector-width"="64" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!llvm.ident = !{!8}
!air.version = !{!9}
!air.language_version = !{!10}
!air.compile_options = !{!11, !12, !13}
!air.kernel = !{!14}

!0 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!1 = !{i32 1, !"wchar_size", i32 4}
!2 = !{i32 7, !"air.max_device_buffers", i32 31}
!3 = !{i32 7, !"air.max_constant_buffers", i32 31}
!4 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!5 = !{i32 7, !"air.max_textures", i32 128}
!6 = !{i32 7, !"air.max_read_write_textures", i32 8}
!7 = !{i32 7, !"air.max_samplers", i32 16}
!8 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!9 = !{i32 2, i32 3, i32 0}
!10 = !{!"Metal", i32 2, i32 3, i32 0}
!11 = !{!"air.compile.denorms_disable"}
!12 = !{!"air.compile.fast_math_disable"}
!13 = !{!"air.compile.framebuffer_fetch_enable"}
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)*, <2 x i32>, i8 addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_replicateRight", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 20, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_replicateRight_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_width", i32 4, i32 4, i32 0, !"int", !"m_stride", i32 8, i32 4, i32 0, !"int", !"m_flag8bit", i32 12, i32 4, i32 0, !"uint", !"m_globalWidth", i32 16, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_name", !"void", !"air.arg_name", !"buffer"}
!21 = !{!22, !23, i64 12}
!22 = !{!"_ZTSN10bm3dnr_buf32bm3dnr_buf_replicateRight_paramsE", !23, i64 0, !23, i64 4, !23, i64 8, !23, i64 12, !23, i64 16}
!23 = !{!"int", !24, i64 0}
!24 = !{!"omnipotent char", !25, i64 0}
!25 = !{!"Simple C++ TBAA"}
!26 = !{!27}
!27 = distinct !{!27, !28, !"air-alias-scope-arg(0)"}
!28 = distinct !{!28, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_replicateRight)"}
!29 = !{!30}
!30 = distinct !{!30, !28, !"air-alias-scope-arg(2)"}
!31 = !{!22, !23, i64 16}
!32 = !{!22, !23, i64 0}
!33 = !{!22, !23, i64 4}
!34 = !{!22, !23, i64 8}
!35 = !{!24, !24, i64 0}
!36 = distinct !{!36, !37}
!37 = !{!"llvm.loop.mustprogress"}
!38 = distinct !{!38, !37}

