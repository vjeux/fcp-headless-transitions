0x0000000000bd7d -- bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1:
source_filename = "bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" = type { i32, i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, float addrspace(1)* nocapture "air-buffer-no-alias" %2, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = extractelement <2 x i32> %1, i64 0
  %7 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 4
  %8 = load i32, i32 addrspace(2)* %7, align 4, !tbaa !23, !alias.scope !28, !noalias !31
  %9 = icmp ult i32 %6, %8
  br i1 %9, label %10, label %117

10:                                               ; preds = %5
  %11 = extractelement <2 x i32> %1, i64 1
  %12 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 5
  %13 = load i32, i32 addrspace(2)* %12, align 4, !tbaa !35, !alias.scope !28, !noalias !31
  %14 = icmp ult i32 %11, %13
  br i1 %14, label %15, label %117

15:                                               ; preds = %10
  %16 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 0
  %17 = load i32, i32 addrspace(2)* %16, align 4, !tbaa !36, !alias.scope !28, !noalias !31
  %18 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 1
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !37, !alias.scope !28, !noalias !31
  %20 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 2
  %21 = load i32, i32 addrspace(2)* %20, align 4, !tbaa !38, !alias.scope !28, !noalias !31
  %22 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 3
  %23 = load i32, i32 addrspace(2)* %22, align 4, !tbaa !39, !alias.scope !28, !noalias !31
  %24 = add i32 %23, %6
  %25 = zext i32 %24 to i64
  %26 = zext i32 %11 to i64
  %27 = sext i32 %21 to i64
  %28 = shl nsw i64 %27, 1
  %29 = mul i64 %28, %25
  %30 = shl nuw nsw i64 %25, 2
  %31 = sext i32 %17 to i64
  %32 = mul nsw i64 %31, %26
  %33 = add i64 %29, %32
  %34 = getelementptr inbounds float, float addrspace(1)* %2, i64 %33
  %35 = load float, float addrspace(1)* %34, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %36 = insertelement <4 x float> undef, float %35, i64 0
  %37 = add i64 %33, 1
  %38 = getelementptr inbounds float, float addrspace(1)* %2, i64 %37
  %39 = load float, float addrspace(1)* %38, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %40 = insertelement <4 x float> %36, float %39, i64 1
  %41 = add i64 %33, 2
  %42 = getelementptr inbounds float, float addrspace(1)* %2, i64 %41
  %43 = load float, float addrspace(1)* %42, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %44 = insertelement <4 x float> %40, float %43, i64 2
  %45 = add i64 %33, 3
  %46 = getelementptr inbounds float, float addrspace(1)* %2, i64 %45
  %47 = load float, float addrspace(1)* %46, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %48 = insertelement <4 x float> %44, float %47, i64 3
  %49 = add i64 %33, 4
  %50 = getelementptr inbounds float, float addrspace(1)* %2, i64 %49
  %51 = load float, float addrspace(1)* %50, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %52 = insertelement <4 x float> <float undef, float undef, float undef, float 0.000000e+00>, float %51, i64 0
  %53 = add i64 %33, 5
  %54 = getelementptr inbounds float, float addrspace(1)* %2, i64 %53
  %55 = load float, float addrspace(1)* %54, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %56 = insertelement <4 x float> %52, float %55, i64 1
  %57 = add i64 %33, 6
  %58 = getelementptr inbounds float, float addrspace(1)* %2, i64 %57
  %59 = load float, float addrspace(1)* %58, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %60 = insertelement <4 x float> %56, float %59, i64 2
  %61 = sext i32 %19 to i64
  %62 = mul nsw i64 %61, %26
  %63 = add i64 %30, %62
  %64 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %63
  %65 = load <4 x float>, <4 x float> addrspace(1)* %64, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %66 = add i64 %63, 1
  %67 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %66
  %68 = load <4 x float>, <4 x float> addrspace(1)* %67, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %69 = add i64 %63, 2
  %70 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %69
  %71 = load <4 x float>, <4 x float> addrspace(1)* %70, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %72 = add i64 %63, 3
  %73 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %72
  %74 = load <4 x float>, <4 x float> addrspace(1)* %73, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %75 = shl i32 %11, 1
  %76 = and i32 %75, 14
  %77 = zext i32 %76 to i64
  %78 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %77
  %79 = load <4 x float>, <4 x float> addrspace(1)* %78, align 16, !tbaa !44, !alias.scope !47, !noalias !48
  %80 = or i32 %76, 1
  %81 = zext i32 %80 to i64
  %82 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %81
  %83 = load <4 x float>, <4 x float> addrspace(1)* %82, align 16, !tbaa !44, !alias.scope !47, !noalias !48
  %84 = fmul <4 x float> %65, %79
  %85 = fmul <4 x float> %68, %83
  %86 = fmul <4 x float> %71, %79
  %87 = fmul <4 x float> %74, %83
  %88 = fadd <4 x float> %48, %84
  %89 = fadd <4 x float> %60, %85
  %90 = extractelement <4 x float> %88, i64 1
  %91 = extractelement <4 x float> %86, i64 0
  %92 = fadd float %91, %90
  %93 = extractelement <4 x float> %88, i64 2
  %94 = extractelement <4 x float> %86, i64 1
  %95 = fadd float %94, %93
  %96 = extractelement <4 x float> %88, i64 3
  %97 = extractelement <4 x float> %86, i64 2
  %98 = fadd float %97, %96
  %99 = extractelement <4 x float> %89, i64 0
  %100 = extractelement <4 x float> %86, i64 3
  %101 = fadd float %100, %99
  %102 = extractelement <4 x float> %89, i64 1
  %103 = extractelement <4 x float> %87, i64 0
  %104 = fadd float %103, %102
  %105 = extractelement <4 x float> %89, i64 2
  %106 = extractelement <4 x float> %87, i64 1
  %107 = fadd float %106, %105
  %108 = extractelement <4 x float> %89, i64 3
  %109 = extractelement <4 x float> %87, i64 2
  %110 = fadd float %109, %108
  %111 = extractelement <4 x float> %88, i64 0
  store float %111, float addrspace(1)* %34, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  store float %92, float addrspace(1)* %38, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  store float %95, float addrspace(1)* %42, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  store float %98, float addrspace(1)* %46, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  store float %101, float addrspace(1)* %50, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  store float %104, float addrspace(1)* %54, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  store float %107, float addrspace(1)* %58, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %112 = add i64 %33, 7
  %113 = getelementptr inbounds float, float addrspace(1)* %2, i64 %112
  store float %110, float addrspace(1)* %113, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %114 = extractelement <4 x float> %87, i64 3
  %115 = add i64 %33, 8
  %116 = getelementptr inbounds float, float addrspace(1)* %2, i64 %115
  store float %114, float addrspace(1)* %116, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  br label %117

117:                                              ; preds = %15, %10, %5
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)*, <2 x i32>, float addrspace(1)*, <4 x float> addrspace(1)*, <4 x float> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 24, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_strideInOut", i32 4, i32 4, i32 0, !"int", !"m_strideIn", i32 8, i32 4, i32 0, !"int", !"m_stepInc", i32 12, i32 4, i32 0, !"int", !"m_offsetX", i32 16, i32 4, i32 0, !"uint", !"m_globalWidth", i32 20, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"inOut"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inNum"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"weightBuffer"}
!23 = !{!24, !25, i64 16}
!24 = !{!"_ZTSN10bm3dnr_buf36bm3dnr_buf_blend8x8ColumnInc1_paramsE", !25, i64 0, !25, i64 4, !25, i64 8, !25, i64 12, !25, i64 16, !25, i64 20}
!25 = !{!"int", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(0)"}
!30 = distinct !{!30, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc1)"}
!31 = !{!32, !33, !34}
!32 = distinct !{!32, !30, !"air-alias-scope-arg(2)"}
!33 = distinct !{!33, !30, !"air-alias-scope-arg(3)"}
!34 = distinct !{!34, !30, !"air-alias-scope-arg(4)"}
!35 = !{!24, !25, i64 20}
!36 = !{!24, !25, i64 0}
!37 = !{!24, !25, i64 4}
!38 = !{!24, !25, i64 8}
!39 = !{!24, !25, i64 12}
!40 = !{!41, !41, i64 0}
!41 = !{!"float", !26, i64 0}
!42 = !{!32}
!43 = !{!29, !33, !34}
!44 = !{!26, !26, i64 0}
!45 = !{!33}
!46 = !{!29, !32, !34}
!47 = !{!34}
!48 = !{!29, !32, !33}

