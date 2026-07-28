0x0000000000d00d -- bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc3:
source_filename = "bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc3"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" = type { i32, i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc3"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, float addrspace(1)* nocapture "air-buffer-no-alias" %2, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = extractelement <2 x i32> %1, i64 0
  %7 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 4
  %8 = load i32, i32 addrspace(2)* %7, align 4, !tbaa !23, !alias.scope !28, !noalias !31
  %9 = icmp ult i32 %6, %8
  br i1 %9, label %10, label %169

10:                                               ; preds = %5
  %11 = extractelement <2 x i32> %1, i64 1
  %12 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 5
  %13 = load i32, i32 addrspace(2)* %12, align 4, !tbaa !35, !alias.scope !28, !noalias !31
  %14 = icmp ult i32 %11, %13
  br i1 %14, label %15, label %169

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
  %28 = shl nsw i64 %27, 2
  %29 = mul i64 %28, %25
  %30 = shl nuw nsw i64 %25, 3
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
  %52 = insertelement <4 x float> <float undef, float 0.000000e+00, float 0.000000e+00, float 0.000000e+00>, float %51, i64 0
  %53 = sext i32 %19 to i64
  %54 = mul nsw i64 %53, %26
  %55 = add i64 %30, %54
  %56 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %55
  %57 = load <4 x float>, <4 x float> addrspace(1)* %56, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %58 = add i64 %55, 1
  %59 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %58
  %60 = load <4 x float>, <4 x float> addrspace(1)* %59, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %61 = add i64 %55, 2
  %62 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %61
  %63 = load <4 x float>, <4 x float> addrspace(1)* %62, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %64 = add i64 %55, 3
  %65 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %64
  %66 = load <4 x float>, <4 x float> addrspace(1)* %65, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %67 = add i64 %55, 4
  %68 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %67
  %69 = load <4 x float>, <4 x float> addrspace(1)* %68, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %70 = add i64 %55, 5
  %71 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %70
  %72 = load <4 x float>, <4 x float> addrspace(1)* %71, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %73 = add i64 %55, 6
  %74 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %73
  %75 = load <4 x float>, <4 x float> addrspace(1)* %74, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %76 = add i64 %55, 7
  %77 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %76
  %78 = load <4 x float>, <4 x float> addrspace(1)* %77, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %79 = shl i32 %11, 1
  %80 = and i32 %79, 14
  %81 = zext i32 %80 to i64
  %82 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %81
  %83 = load <4 x float>, <4 x float> addrspace(1)* %82, align 16, !tbaa !44, !alias.scope !47, !noalias !48
  %84 = or i32 %80, 1
  %85 = zext i32 %84 to i64
  %86 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %85
  %87 = load <4 x float>, <4 x float> addrspace(1)* %86, align 16, !tbaa !44, !alias.scope !47, !noalias !48
  %88 = fmul <4 x float> %57, %83
  %89 = fmul <4 x float> %60, %87
  %90 = fmul <4 x float> %63, %83
  %91 = fmul <4 x float> %66, %87
  %92 = fmul <4 x float> %69, %83
  %93 = fmul <4 x float> %72, %87
  %94 = fmul <4 x float> %75, %83
  %95 = fmul <4 x float> %78, %87
  %96 = fadd <4 x float> %48, %88
  %97 = fadd <4 x float> %52, %89
  %98 = extractelement <4 x float> %96, i64 3
  %99 = extractelement <4 x float> %90, i64 0
  %100 = fadd float %99, %98
  %101 = extractelement <4 x float> %97, i64 0
  %102 = extractelement <4 x float> %90, i64 1
  %103 = fadd float %102, %101
  %104 = extractelement <4 x float> %97, i64 1
  %105 = extractelement <4 x float> %90, i64 2
  %106 = fadd float %105, %104
  %107 = extractelement <4 x float> %97, i64 2
  %108 = extractelement <4 x float> %90, i64 3
  %109 = fadd float %108, %107
  %110 = extractelement <4 x float> %92, i64 0
  %111 = fadd float %110, %109
  %112 = extractelement <4 x float> %97, i64 3
  %113 = extractelement <4 x float> %91, i64 0
  %114 = fadd float %113, %112
  %115 = extractelement <4 x float> %92, i64 1
  %116 = fadd float %115, %114
  %117 = extractelement <4 x float> %91, i64 1
  %118 = extractelement <4 x float> %92, i64 2
  %119 = fadd float %118, %117
  %120 = extractelement <4 x float> %91, i64 2
  %121 = extractelement <4 x float> %92, i64 3
  %122 = fadd float %121, %120
  %123 = extractelement <4 x float> %94, i64 0
  %124 = fadd float %123, %122
  %125 = extractelement <4 x float> %91, i64 3
  %126 = extractelement <4 x float> %93, i64 0
  %127 = fadd float %125, %126
  %128 = extractelement <4 x float> %94, i64 1
  %129 = fadd float %128, %127
  %130 = extractelement <4 x float> %93, i64 1
  %131 = extractelement <4 x float> %94, i64 2
  %132 = fadd float %131, %130
  %133 = extractelement <4 x float> %93, i64 2
  %134 = extractelement <4 x float> %94, i64 3
  %135 = fadd float %134, %133
  %136 = extractelement <4 x float> %93, i64 3
  %137 = extractelement <4 x float> %95, i64 0
  %138 = fadd float %136, %137
  %139 = extractelement <4 x float> %96, i64 0
  store float %139, float addrspace(1)* %34, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %140 = extractelement <4 x float> %96, i64 1
  store float %140, float addrspace(1)* %38, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %141 = extractelement <4 x float> %96, i64 2
  store float %141, float addrspace(1)* %42, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  store float %100, float addrspace(1)* %46, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  store float %103, float addrspace(1)* %50, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %142 = add i64 %33, 5
  %143 = getelementptr inbounds float, float addrspace(1)* %2, i64 %142
  store float %106, float addrspace(1)* %143, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %144 = add i64 %33, 6
  %145 = getelementptr inbounds float, float addrspace(1)* %2, i64 %144
  store float %111, float addrspace(1)* %145, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %146 = add i64 %33, 7
  %147 = getelementptr inbounds float, float addrspace(1)* %2, i64 %146
  store float %116, float addrspace(1)* %147, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %148 = add i64 %33, 8
  %149 = getelementptr inbounds float, float addrspace(1)* %2, i64 %148
  store float %119, float addrspace(1)* %149, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %150 = add i64 %33, 9
  %151 = getelementptr inbounds float, float addrspace(1)* %2, i64 %150
  store float %124, float addrspace(1)* %151, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %152 = add i64 %33, 10
  %153 = getelementptr inbounds float, float addrspace(1)* %2, i64 %152
  store float %129, float addrspace(1)* %153, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %154 = add i64 %33, 11
  %155 = getelementptr inbounds float, float addrspace(1)* %2, i64 %154
  store float %132, float addrspace(1)* %155, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %156 = add i64 %33, 12
  %157 = getelementptr inbounds float, float addrspace(1)* %2, i64 %156
  store float %135, float addrspace(1)* %157, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %158 = add i64 %33, 13
  %159 = getelementptr inbounds float, float addrspace(1)* %2, i64 %158
  store float %138, float addrspace(1)* %159, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %160 = extractelement <4 x float> %95, i64 1
  %161 = add i64 %33, 14
  %162 = getelementptr inbounds float, float addrspace(1)* %2, i64 %161
  store float %160, float addrspace(1)* %162, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %163 = extractelement <4 x float> %95, i64 2
  %164 = add i64 %33, 15
  %165 = getelementptr inbounds float, float addrspace(1)* %2, i64 %164
  store float %163, float addrspace(1)* %165, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %166 = extractelement <4 x float> %95, i64 3
  %167 = add i64 %33, 16
  %168 = getelementptr inbounds float, float addrspace(1)* %2, i64 %167
  store float %166, float addrspace(1)* %168, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  br label %169

169:                                              ; preds = %15, %10, %5
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)*, <2 x i32>, float addrspace(1)*, <4 x float> addrspace(1)*, <4 x float> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc3", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 24, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc3_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_strideInOut", i32 4, i32 4, i32 0, !"int", !"m_strideIn", i32 8, i32 4, i32 0, !"int", !"m_stepInc", i32 12, i32 4, i32 0, !"int", !"m_offsetX", i32 16, i32 4, i32 0, !"uint", !"m_globalWidth", i32 20, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"inOut"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inNum"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"weightBuffer"}
!23 = !{!24, !25, i64 16}
!24 = !{!"_ZTSN10bm3dnr_buf36bm3dnr_buf_blend8x8ColumnInc3_paramsE", !25, i64 0, !25, i64 4, !25, i64 8, !25, i64 12, !25, i64 16, !25, i64 20}
!25 = !{!"int", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(0)"}
!30 = distinct !{!30, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc3)"}
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

