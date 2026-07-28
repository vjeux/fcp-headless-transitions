0x0000000000f85d -- bm3dnr_buf::bm3dnr_buf_blend8x8Row:
source_filename = "bm3dnr_buf::bm3dnr_buf_blend8x8Row"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" = type { i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blend8x8Row"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x float> addrspace(1)* nocapture "air-buffer-no-alias" %2, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3) local_unnamed_addr #0 {
  %5 = extractelement <2 x i32> %1, i64 0
  %6 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 3
  %7 = load i32, i32 addrspace(2)* %6, align 4, !tbaa !22, !alias.scope !27, !noalias !30
  %8 = icmp ult i32 %5, %7
  br i1 %8, label %9, label %80

9:                                                ; preds = %4
  %10 = extractelement <2 x i32> %1, i64 1
  %11 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 4
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !33, !alias.scope !27, !noalias !30
  %13 = icmp ult i32 %10, %12
  br i1 %13, label %14, label %80

14:                                               ; preds = %9
  %15 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 0
  %16 = load i32, i32 addrspace(2)* %15, align 4, !tbaa !34, !alias.scope !27, !noalias !30
  %17 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 1
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !35, !alias.scope !27, !noalias !30
  %19 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 2
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !36, !alias.scope !27, !noalias !30
  %21 = zext i32 %5 to i64
  %22 = zext i32 %10 to i64
  %23 = sext i32 %20 to i64
  %24 = mul nsw i64 %23, %22
  %25 = shl nuw nsw i64 %21, 1
  %26 = shl nuw nsw i64 %22, 3
  %27 = sext i32 %16 to i64
  %28 = sext i32 %18 to i64
  %29 = icmp eq i32 %16, 1
  br i1 %29, label %53, label %30

30:                                               ; preds = %30, %14
  %31 = phi i32 [ %51, %30 ], [ 0, %14 ]
  %32 = zext i32 %31 to i64
  %33 = add i64 %24, %32
  %34 = mul i64 %33, %27
  %35 = add i64 %34, %25
  %36 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %35
  %37 = load <4 x float>, <4 x float> addrspace(1)* %36, align 16, !tbaa !37, !alias.scope !38, !noalias !39
  %38 = add nuw nsw i64 %26, %32
  %39 = mul i64 %38, %28
  %40 = add i64 %39, %25
  %41 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %40
  %42 = load <4 x float>, <4 x float> addrspace(1)* %41, align 16, !tbaa !37, !alias.scope !40, !noalias !41
  %43 = add i64 %35, 1
  %44 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %43
  %45 = load <4 x float>, <4 x float> addrspace(1)* %44, align 16, !tbaa !37, !alias.scope !38, !noalias !39
  %46 = add i64 %40, 1
  %47 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %46
  %48 = load <4 x float>, <4 x float> addrspace(1)* %47, align 16, !tbaa !37, !alias.scope !40, !noalias !41
  %49 = fadd <4 x float> %37, %42
  %50 = fadd <4 x float> %45, %48
  store <4 x float> %49, <4 x float> addrspace(1)* %36, align 16, !tbaa !37, !alias.scope !38, !noalias !39
  store <4 x float> %50, <4 x float> addrspace(1)* %44, align 16, !tbaa !37, !alias.scope !38, !noalias !39
  %51 = add nuw nsw i32 %31, 1
  %52 = icmp eq i32 %51, 8
  br i1 %52, label %80, label %30, !llvm.loop !42

53:                                               ; preds = %14
  %54 = add i64 %24, %25
  %55 = getelementptr <4 x float>, <4 x float> addrspace(1)* %2, i64 %54
  %56 = load <4 x float>, <4 x float> addrspace(1)* %55, align 16
  br label %57

57:                                               ; preds = %57, %53
  %58 = phi <4 x float> [ %56, %53 ], [ %77, %57 ]
  %59 = phi i32 [ 0, %53 ], [ %78, %57 ]
  %60 = zext i32 %59 to i64
  %61 = add i64 %24, %60
  %62 = mul i64 %61, %27
  %63 = add i64 %62, %25
  %64 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %63
  %65 = add nuw nsw i64 %26, %60
  %66 = mul i64 %65, %28
  %67 = add i64 %66, %25
  %68 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %67
  %69 = load <4 x float>, <4 x float> addrspace(1)* %68, align 16, !tbaa !37, !alias.scope !40, !noalias !41
  %70 = add i64 %63, 1
  %71 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %70
  %72 = load <4 x float>, <4 x float> addrspace(1)* %71, align 16, !tbaa !37, !alias.scope !38, !noalias !39
  %73 = add i64 %67, 1
  %74 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %73
  %75 = load <4 x float>, <4 x float> addrspace(1)* %74, align 16, !tbaa !37, !alias.scope !40, !noalias !41
  %76 = fadd <4 x float> %58, %69
  %77 = fadd <4 x float> %72, %75
  store <4 x float> %76, <4 x float> addrspace(1)* %64, align 16, !tbaa !37, !alias.scope !38, !noalias !39
  store <4 x float> %77, <4 x float> addrspace(1)* %71, align 16, !tbaa !37, !alias.scope !38, !noalias !39
  %78 = add nuw nsw i32 %59, 1
  %79 = icmp eq i32 %78, 8
  br i1 %79, label %80, label %57, !llvm.loop !42

80:                                               ; preds = %57, %30, %9, %4
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)*, <2 x i32>, <4 x float> addrspace(1)*, <4 x float> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blend8x8Row", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 20, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blend8x8Row_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_strideInOut", i32 4, i32 4, i32 0, !"int", !"m_strideIn", i32 8, i32 4, i32 0, !"int", !"m_stepInc", i32 12, i32 4, i32 0, !"uint", !"m_globalWidth", i32 16, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inOut"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inNum"}
!22 = !{!23, !24, i64 12}
!23 = !{!"_ZTSN10bm3dnr_buf29bm3dnr_buf_blend8x8Row_paramsE", !24, i64 0, !24, i64 4, !24, i64 8, !24, i64 12, !24, i64 16}
!24 = !{!"int", !25, i64 0}
!25 = !{!"omnipotent char", !26, i64 0}
!26 = !{!"Simple C++ TBAA"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blend8x8Row)"}
!30 = !{!31, !32}
!31 = distinct !{!31, !29, !"air-alias-scope-arg(2)"}
!32 = distinct !{!32, !29, !"air-alias-scope-arg(3)"}
!33 = !{!23, !24, i64 16}
!34 = !{!23, !24, i64 0}
!35 = !{!23, !24, i64 4}
!36 = !{!23, !24, i64 8}
!37 = !{!25, !25, i64 0}
!38 = !{!31}
!39 = !{!28, !32}
!40 = !{!32}
!41 = !{!28, !31}
!42 = distinct !{!42, !43}
!43 = !{!"llvm.loop.mustprogress"}

