0x0000000005b92d -- bm3dnr_buf::bm3dnr_buf_mergeAlfa:
source_filename = "bm3dnr_buf::bm3dnr_buf_mergeAlfa"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" = type { i32, i32, i32, i32 }

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_mergeAlfa"(%"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %3) local_unnamed_addr #0 {
  %5 = extractelement <2 x i32> %1, i64 0
  %6 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params", %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)* %0, i64 0, i32 2
  %7 = load i32, i32 addrspace(2)* %6, align 4, !tbaa !22, !alias.scope !27, !noalias !30
  %8 = icmp ult i32 %5, %7
  br i1 %8, label %9, label %32

9:                                                ; preds = %4
  %10 = extractelement <2 x i32> %1, i64 1
  %11 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params", %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)* %0, i64 0, i32 3
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !33, !alias.scope !27, !noalias !30
  %13 = icmp ult i32 %10, %12
  br i1 %13, label %14, label %32

14:                                               ; preds = %9
  %15 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params", %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)* %0, i64 0, i32 0
  %16 = load i32, i32 addrspace(2)* %15, align 4, !tbaa !34, !alias.scope !27, !noalias !30
  %17 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params", %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)* %0, i64 0, i32 1
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !35, !alias.scope !27, !noalias !30
  %19 = zext i32 %5 to i64
  %20 = zext i32 %10 to i64
  %21 = zext i32 %16 to i64
  %22 = mul nuw i64 %21, %20
  %23 = add nuw i64 %22, %19
  %24 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %23
  %25 = load <4 x i16>, <4 x i16> addrspace(1)* %24, align 8, !tbaa !36, !alias.scope !37, !noalias !38
  %26 = zext i32 %18 to i64
  %27 = mul nuw i64 %26, %20
  %28 = add nuw i64 %27, %19
  %29 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %3, i64 %28
  %30 = load <4 x i16>, <4 x i16> addrspace(1)* %29, align 8, !tbaa !36, !alias.scope !39, !noalias !40
  %31 = shufflevector <4 x i16> %25, <4 x i16> %30, <4 x i32> <i32 0, i32 5, i32 6, i32 7>
  store <4 x i16> %31, <4 x i16> addrspace(1)* %29, align 8, !tbaa !36, !alias.scope !39, !noalias !40
  br label %32

32:                                               ; preds = %14, %9, %4
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)*, <2 x i32>, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_mergeAlfa", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_mergeAlfa_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"uint", !"m_strideIn", i32 4, i32 4, i32 0, !"uint", !"m_strideOut", i32 8, i32 4, i32 0, !"uint", !"m_globalWidth", i32 12, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"input"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"output"}
!22 = !{!23, !24, i64 8}
!23 = !{!"_ZTSN10bm3dnr_buf27bm3dnr_buf_mergeAlfa_paramsE", !24, i64 0, !24, i64 4, !24, i64 8, !24, i64 12}
!24 = !{!"int", !25, i64 0}
!25 = !{!"omnipotent char", !26, i64 0}
!26 = !{!"Simple C++ TBAA"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_mergeAlfa)"}
!30 = !{!31, !32}
!31 = distinct !{!31, !29, !"air-alias-scope-arg(2)"}
!32 = distinct !{!32, !29, !"air-alias-scope-arg(3)"}
!33 = !{!23, !24, i64 12}
!34 = !{!23, !24, i64 0}
!35 = !{!23, !24, i64 4}
!36 = !{!25, !25, i64 0}
!37 = !{!31}
!38 = !{!28, !32}
!39 = !{!32}
!40 = !{!28, !31}

