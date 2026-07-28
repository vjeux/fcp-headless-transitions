0x0000000000abbd -- bm3dnr_buf::bm3dnr_buf_blend8x8Column:
source_filename = "bm3dnr_buf::bm3dnr_buf_blend8x8Column"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" = type { i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blend8x8Column"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, float addrspace(1)* nocapture "air-buffer-no-alias" %2, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = extractelement <2 x i32> %1, i64 0
  %7 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 3
  %8 = load i32, i32 addrspace(2)* %7, align 4, !tbaa !23, !alias.scope !28, !noalias !31
  %9 = icmp ult i32 %6, %8
  br i1 %9, label %10, label %90

10:                                               ; preds = %5
  %11 = extractelement <2 x i32> %1, i64 1
  %12 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 4
  %13 = load i32, i32 addrspace(2)* %12, align 4, !tbaa !35, !alias.scope !28, !noalias !31
  %14 = icmp ult i32 %11, %13
  br i1 %14, label %15, label %90

15:                                               ; preds = %10
  %16 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 0
  %17 = load i32, i32 addrspace(2)* %16, align 4, !tbaa !36, !alias.scope !28, !noalias !31
  %18 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 1
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !37, !alias.scope !28, !noalias !31
  %20 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 2
  %21 = load i32, i32 addrspace(2)* %20, align 4, !tbaa !38, !alias.scope !28, !noalias !31
  %22 = zext i32 %6 to i64
  %23 = zext i32 %11 to i64
  %24 = sext i32 %21 to i64
  %25 = mul nsw i64 %24, %22
  %26 = shl nuw nsw i64 %22, 1
  %27 = sext i32 %17 to i64
  %28 = mul nsw i64 %27, %23
  %29 = add i64 %25, %28
  %30 = getelementptr inbounds float, float addrspace(1)* %2, i64 %29
  %31 = load float, float addrspace(1)* %30, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %32 = insertelement <4 x float> undef, float %31, i64 0
  %33 = add i64 %29, 1
  %34 = getelementptr inbounds float, float addrspace(1)* %2, i64 %33
  %35 = load float, float addrspace(1)* %34, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %36 = insertelement <4 x float> %32, float %35, i64 1
  %37 = add i64 %29, 2
  %38 = getelementptr inbounds float, float addrspace(1)* %2, i64 %37
  %39 = load float, float addrspace(1)* %38, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %40 = insertelement <4 x float> %36, float %39, i64 2
  %41 = add i64 %29, 3
  %42 = getelementptr inbounds float, float addrspace(1)* %2, i64 %41
  %43 = load float, float addrspace(1)* %42, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %44 = insertelement <4 x float> %40, float %43, i64 3
  %45 = add i64 %29, 4
  %46 = getelementptr inbounds float, float addrspace(1)* %2, i64 %45
  %47 = load float, float addrspace(1)* %46, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %48 = insertelement <4 x float> undef, float %47, i64 0
  %49 = add i64 %29, 5
  %50 = getelementptr inbounds float, float addrspace(1)* %2, i64 %49
  %51 = load float, float addrspace(1)* %50, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %52 = insertelement <4 x float> %48, float %51, i64 1
  %53 = add i64 %29, 6
  %54 = getelementptr inbounds float, float addrspace(1)* %2, i64 %53
  %55 = load float, float addrspace(1)* %54, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %56 = insertelement <4 x float> %52, float %55, i64 2
  %57 = add i64 %29, 7
  %58 = getelementptr inbounds float, float addrspace(1)* %2, i64 %57
  %59 = load float, float addrspace(1)* %58, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %60 = insertelement <4 x float> %56, float %59, i64 3
  %61 = sext i32 %19 to i64
  %62 = mul nsw i64 %61, %23
  %63 = add nsw i64 %62, %26
  %64 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %63
  %65 = load <4 x float>, <4 x float> addrspace(1)* %64, align 16, !tbaa !43, !alias.scope !44, !noalias !45
  %66 = add nsw i64 %63, 1
  %67 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %66
  %68 = load <4 x float>, <4 x float> addrspace(1)* %67, align 16, !tbaa !43, !alias.scope !44, !noalias !45
  %69 = shl i32 %11, 1
  %70 = and i32 %69, 14
  %71 = zext i32 %70 to i64
  %72 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %71
  %73 = load <4 x float>, <4 x float> addrspace(1)* %72, align 16, !tbaa !43, !alias.scope !46, !noalias !47
  %74 = or i32 %70, 1
  %75 = zext i32 %74 to i64
  %76 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %75
  %77 = load <4 x float>, <4 x float> addrspace(1)* %76, align 16, !tbaa !43, !alias.scope !46, !noalias !47
  %78 = fmul <4 x float> %65, %73
  %79 = fmul <4 x float> %68, %77
  %80 = fadd <4 x float> %44, %78
  %81 = fadd <4 x float> %60, %79
  %82 = extractelement <4 x float> %80, i64 0
  store float %82, float addrspace(1)* %30, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %83 = extractelement <4 x float> %80, i64 1
  store float %83, float addrspace(1)* %34, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %84 = extractelement <4 x float> %80, i64 2
  store float %84, float addrspace(1)* %38, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %85 = extractelement <4 x float> %80, i64 3
  store float %85, float addrspace(1)* %42, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %86 = extractelement <4 x float> %81, i64 0
  store float %86, float addrspace(1)* %46, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %87 = extractelement <4 x float> %81, i64 1
  store float %87, float addrspace(1)* %50, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %88 = extractelement <4 x float> %81, i64 2
  store float %88, float addrspace(1)* %54, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  %89 = extractelement <4 x float> %81, i64 3
  store float %89, float addrspace(1)* %58, align 4, !tbaa !39, !alias.scope !41, !noalias !42
  br label %90

90:                                               ; preds = %15, %10, %5
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)*, <2 x i32>, float addrspace(1)*, <4 x float> addrspace(1)*, <4 x float> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blend8x8Column", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 20, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blend8x8Column_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_strideInOut", i32 4, i32 4, i32 0, !"int", !"m_strideIn", i32 8, i32 4, i32 0, !"int", !"m_stepInc", i32 12, i32 4, i32 0, !"uint", !"m_globalWidth", i32 16, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"inOut"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inNum"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"weightBuffer"}
!23 = !{!24, !25, i64 12}
!24 = !{!"_ZTSN10bm3dnr_buf32bm3dnr_buf_blend8x8Column_paramsE", !25, i64 0, !25, i64 4, !25, i64 8, !25, i64 12, !25, i64 16}
!25 = !{!"int", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(0)"}
!30 = distinct !{!30, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blend8x8Column)"}
!31 = !{!32, !33, !34}
!32 = distinct !{!32, !30, !"air-alias-scope-arg(2)"}
!33 = distinct !{!33, !30, !"air-alias-scope-arg(3)"}
!34 = distinct !{!34, !30, !"air-alias-scope-arg(4)"}
!35 = !{!24, !25, i64 16}
!36 = !{!24, !25, i64 0}
!37 = !{!24, !25, i64 4}
!38 = !{!24, !25, i64 8}
!39 = !{!40, !40, i64 0}
!40 = !{!"float", !26, i64 0}
!41 = !{!32}
!42 = !{!29, !33, !34}
!43 = !{!26, !26, i64 0}
!44 = !{!33}
!45 = !{!29, !32, !34}
!46 = !{!34}
!47 = !{!29, !32, !33}

