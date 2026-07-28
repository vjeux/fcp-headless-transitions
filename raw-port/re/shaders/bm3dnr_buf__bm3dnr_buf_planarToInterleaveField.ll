0x00000000068bfd -- bm3dnr_buf::bm3dnr_buf_planarToInterleaveField:
source_filename = "bm3dnr_buf::bm3dnr_buf_planarToInterleaveField"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params" = type { i32, i32, i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_planarToInterleaveField"(%"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i8> addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, <4 x i8> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, <4 x i8> addrspace(1)* nocapture readonly "air-buffer-no-alias" %4, <4 x i8> addrspace(1)* nocapture "air-buffer-no-alias" %5) local_unnamed_addr #0 {
  %7 = extractelement <2 x i32> %1, i64 0
  %8 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params" addrspace(2)* %0, i64 0, i32 5
  %9 = load i32, i32 addrspace(2)* %8, align 4, !tbaa !24, !alias.scope !29, !noalias !32
  %10 = icmp ult i32 %7, %9
  br i1 %10, label %11, label %78

11:                                               ; preds = %6
  %12 = extractelement <2 x i32> %1, i64 1
  %13 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params" addrspace(2)* %0, i64 0, i32 6
  %14 = load i32, i32 addrspace(2)* %13, align 4, !tbaa !37, !alias.scope !29, !noalias !32
  %15 = icmp ult i32 %12, %14
  br i1 %15, label %16, label %78

16:                                               ; preds = %11
  %17 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params" addrspace(2)* %0, i64 0, i32 0
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !38, !alias.scope !29, !noalias !32
  %19 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params" addrspace(2)* %0, i64 0, i32 1
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !39, !alias.scope !29, !noalias !32
  %21 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params" addrspace(2)* %0, i64 0, i32 2
  %22 = load i32, i32 addrspace(2)* %21, align 4, !tbaa !40, !alias.scope !29, !noalias !32
  %23 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params" addrspace(2)* %0, i64 0, i32 3
  %24 = load i32, i32 addrspace(2)* %23, align 4, !tbaa !41, !alias.scope !29, !noalias !32
  %25 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params" addrspace(2)* %0, i64 0, i32 4
  %26 = load i32, i32 addrspace(2)* %25, align 4, !tbaa !42, !alias.scope !29, !noalias !32
  %27 = zext i32 %7 to i64
  %28 = zext i32 %12 to i64
  %29 = shl nuw nsw i64 %27, 1
  %30 = or i64 %29, 1
  %31 = zext i32 %18 to i64
  %32 = mul nuw i64 %31, %28
  %33 = add nuw i64 %32, %29
  %34 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %33
  %35 = load <4 x i8>, <4 x i8> addrspace(1)* %34, align 4, !tbaa !43, !alias.scope !44, !noalias !45
  %36 = add i64 %30, %32
  %37 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %36
  %38 = load <4 x i8>, <4 x i8> addrspace(1)* %37, align 4, !tbaa !43, !alias.scope !44, !noalias !45
  %39 = zext i32 %20 to i64
  %40 = mul nuw i64 %39, %28
  %41 = add nuw i64 %40, %27
  %42 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %3, i64 %41
  %43 = load <4 x i8>, <4 x i8> addrspace(1)* %42, align 4, !tbaa !43, !alias.scope !46, !noalias !47
  %44 = zext i32 %22 to i64
  %45 = mul nuw i64 %44, %28
  %46 = add nuw i64 %45, %27
  %47 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %4, i64 %46
  %48 = load <4 x i8>, <4 x i8> addrspace(1)* %47, align 4, !tbaa !43, !alias.scope !48, !noalias !49
  %49 = shufflevector <4 x i8> %43, <4 x i8> %35, <4 x i32> <i32 0, i32 4, i32 undef, i32 undef>
  %50 = shufflevector <4 x i8> %49, <4 x i8> %48, <4 x i32> <i32 0, i32 1, i32 4, i32 undef>
  %51 = shufflevector <4 x i8> %50, <4 x i8> %35, <4 x i32> <i32 0, i32 1, i32 2, i32 5>
  %52 = shufflevector <4 x i8> %43, <4 x i8> %35, <4 x i32> <i32 1, i32 6, i32 undef, i32 undef>
  %53 = shufflevector <4 x i8> %52, <4 x i8> %48, <4 x i32> <i32 0, i32 1, i32 5, i32 undef>
  %54 = shufflevector <4 x i8> %53, <4 x i8> %35, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %55 = shufflevector <4 x i8> %43, <4 x i8> %38, <4 x i32> <i32 2, i32 4, i32 undef, i32 undef>
  %56 = shufflevector <4 x i8> %55, <4 x i8> %48, <4 x i32> <i32 0, i32 1, i32 6, i32 undef>
  %57 = shufflevector <4 x i8> %56, <4 x i8> %38, <4 x i32> <i32 0, i32 1, i32 2, i32 5>
  %58 = shufflevector <4 x i8> %43, <4 x i8> %38, <4 x i32> <i32 3, i32 6, i32 undef, i32 undef>
  %59 = shufflevector <4 x i8> %58, <4 x i8> %48, <4 x i32> <i32 0, i32 1, i32 7, i32 undef>
  %60 = shufflevector <4 x i8> %59, <4 x i8> %38, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %61 = shl nuw nsw i64 %27, 2
  %62 = zext i32 %24 to i64
  %63 = shl nuw nsw i64 %28, 1
  %64 = sext i32 %26 to i64
  %65 = add nsw i64 %63, %64
  %66 = mul i64 %65, %62
  %67 = add i64 %66, %61
  %68 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %5, i64 %67
  store <4 x i8> %51, <4 x i8> addrspace(1)* %68, align 4, !tbaa !43, !alias.scope !50, !noalias !51
  %69 = or i64 %61, 1
  %70 = add i64 %69, %66
  %71 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %5, i64 %70
  store <4 x i8> %54, <4 x i8> addrspace(1)* %71, align 4, !tbaa !43, !alias.scope !50, !noalias !51
  %72 = or i64 %61, 2
  %73 = add i64 %72, %66
  %74 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %5, i64 %73
  store <4 x i8> %57, <4 x i8> addrspace(1)* %74, align 4, !tbaa !43, !alias.scope !50, !noalias !51
  %75 = or i64 %61, 3
  %76 = add i64 %75, %66
  %77 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %5, i64 %76
  store <4 x i8> %60, <4 x i8> addrspace(1)* %77, align 4, !tbaa !43, !alias.scope !50, !noalias !51
  br label %78

78:                                               ; preds = %16, %11, %6
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params" addrspace(2)*, <2 x i32>, <4 x i8> addrspace(1)*, <4 x i8> addrspace(1)*, <4 x i8> addrspace(1)*, <4 x i8> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_planarToInterleaveField", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 28, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_planarToInterleaveField_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"uint", !"m_strideY", i32 4, i32 4, i32 0, !"uint", !"m_strideU", i32 8, i32 4, i32 0, !"uint", !"m_strideV", i32 12, i32 4, i32 0, !"uint", !"m_strideYUV", i32 16, i32 4, i32 0, !"int", !"m_off", i32 20, i32 4, i32 0, !"uint", !"m_globalWidth", i32 24, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uchar4", !"air.arg_name", !"inputY"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uchar4", !"air.arg_name", !"inputU"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uchar4", !"air.arg_name", !"inputV"}
!23 = !{i32 5, !"air.buffer", !"air.location_index", i32 4, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uchar4", !"air.arg_name", !"outputYUV"}
!24 = !{!25, !26, i64 20}
!25 = !{!"_ZTSN10bm3dnr_buf41bm3dnr_buf_planarToInterleaveField_paramsE", !26, i64 0, !26, i64 4, !26, i64 8, !26, i64 12, !26, i64 16, !26, i64 20, !26, i64 24}
!26 = !{!"int", !27, i64 0}
!27 = !{!"omnipotent char", !28, i64 0}
!28 = !{!"Simple C++ TBAA"}
!29 = !{!30}
!30 = distinct !{!30, !31, !"air-alias-scope-arg(0)"}
!31 = distinct !{!31, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_planarToInterleaveField)"}
!32 = !{!33, !34, !35, !36}
!33 = distinct !{!33, !31, !"air-alias-scope-arg(2)"}
!34 = distinct !{!34, !31, !"air-alias-scope-arg(3)"}
!35 = distinct !{!35, !31, !"air-alias-scope-arg(4)"}
!36 = distinct !{!36, !31, !"air-alias-scope-arg(5)"}
!37 = !{!25, !26, i64 24}
!38 = !{!25, !26, i64 0}
!39 = !{!25, !26, i64 4}
!40 = !{!25, !26, i64 8}
!41 = !{!25, !26, i64 12}
!42 = !{!25, !26, i64 16}
!43 = !{!27, !27, i64 0}
!44 = !{!33}
!45 = !{!30, !34, !35, !36}
!46 = !{!34}
!47 = !{!30, !33, !35, !36}
!48 = !{!35}
!49 = !{!30, !33, !34, !36}
!50 = !{!36}
!51 = !{!30, !33, !34, !35}

