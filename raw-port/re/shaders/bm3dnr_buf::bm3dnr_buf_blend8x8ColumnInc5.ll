0x0000000000e3fd -- bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5:
source_filename = "bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" = type { i32, i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, float addrspace(1)* nocapture "air-buffer-no-alias" %2, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = extractelement <2 x i32> %1, i64 0
  %7 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 4
  %8 = load i32, i32 addrspace(2)* %7, align 4, !tbaa !23, !alias.scope !28, !noalias !31
  %9 = icmp ult i32 %6, %8
  br i1 %9, label %10, label %170

10:                                               ; preds = %5
  %11 = extractelement <2 x i32> %1, i64 1
  %12 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 5
  %13 = load i32, i32 addrspace(2)* %12, align 4, !tbaa !35, !alias.scope !28, !noalias !31
  %14 = icmp ult i32 %11, %13
  br i1 %14, label %15, label %170

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
  %36 = insertelement <4 x float> <float undef, float undef, float undef, float 0.000000e+00>, float %35, i64 0
  %37 = add i64 %33, 1
  %38 = getelementptr inbounds float, float addrspace(1)* %2, i64 %37
  %39 = load float, float addrspace(1)* %38, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %40 = insertelement <4 x float> %36, float %39, i64 1
  %41 = add i64 %33, 2
  %42 = getelementptr inbounds float, float addrspace(1)* %2, i64 %41
  %43 = load float, float addrspace(1)* %42, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %44 = insertelement <4 x float> %40, float %43, i64 2
  %45 = sext i32 %19 to i64
  %46 = mul nsw i64 %45, %26
  %47 = add i64 %30, %46
  %48 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %47
  %49 = load <4 x float>, <4 x float> addrspace(1)* %48, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %50 = add i64 %47, 1
  %51 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %50
  %52 = load <4 x float>, <4 x float> addrspace(1)* %51, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %53 = add i64 %47, 2
  %54 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %53
  %55 = load <4 x float>, <4 x float> addrspace(1)* %54, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %56 = add i64 %47, 3
  %57 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %56
  %58 = load <4 x float>, <4 x float> addrspace(1)* %57, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %59 = add i64 %47, 4
  %60 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %59
  %61 = load <4 x float>, <4 x float> addrspace(1)* %60, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %62 = add i64 %47, 5
  %63 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %62
  %64 = load <4 x float>, <4 x float> addrspace(1)* %63, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %65 = add i64 %47, 6
  %66 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %65
  %67 = load <4 x float>, <4 x float> addrspace(1)* %66, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %68 = add i64 %47, 7
  %69 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %68
  %70 = load <4 x float>, <4 x float> addrspace(1)* %69, align 16, !tbaa !44, !alias.scope !45, !noalias !46
  %71 = shl i32 %11, 1
  %72 = and i32 %71, 14
  %73 = zext i32 %72 to i64
  %74 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %73
  %75 = load <4 x float>, <4 x float> addrspace(1)* %74, align 16, !tbaa !44, !alias.scope !47, !noalias !48
  %76 = or i32 %72, 1
  %77 = zext i32 %76 to i64
  %78 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %77
  %79 = load <4 x float>, <4 x float> addrspace(1)* %78, align 16, !tbaa !44, !alias.scope !47, !noalias !48
  %80 = fmul <4 x float> %49, %75
  %81 = fmul <4 x float> %52, %79
  %82 = fmul <4 x float> %55, %75
  %83 = fmul <4 x float> %58, %79
  %84 = fmul <4 x float> %61, %75
  %85 = fmul <4 x float> %64, %79
  %86 = fmul <4 x float> %67, %75
  %87 = fmul <4 x float> %70, %79
  %88 = fadd <4 x float> %44, %80
  %89 = extractelement <4 x float> %81, i64 1
  %90 = extractelement <4 x float> %82, i64 0
  %91 = fadd float %90, %89
  %92 = extractelement <4 x float> %81, i64 2
  %93 = extractelement <4 x float> %82, i64 1
  %94 = fadd float %93, %92
  %95 = extractelement <4 x float> %81, i64 3
  %96 = extractelement <4 x float> %82, i64 2
  %97 = fadd float %96, %95
  %98 = extractelement <4 x float> %83, i64 1
  %99 = extractelement <4 x float> %84, i64 0
  %100 = fadd float %99, %98
  %101 = extractelement <4 x float> %83, i64 2
  %102 = extractelement <4 x float> %84, i64 1
  %103 = fadd float %102, %101
  %104 = extractelement <4 x float> %83, i64 3
  %105 = extractelement <4 x float> %84, i64 2
  %106 = fadd float %105, %104
  %107 = extractelement <4 x float> %85, i64 1
  %108 = extractelement <4 x float> %86, i64 0
  %109 = fadd float %108, %107
  %110 = extractelement <4 x float> %85, i64 2
  %111 = extractelement <4 x float> %86, i64 1
  %112 = fadd float %111, %110
  %113 = extractelement <4 x float> %85, i64 3
  %114 = extractelement <4 x float> %86, i64 2
  %115 = fadd float %114, %113
  %116 = extractelement <4 x float> %88, i64 0
  store float %116, float addrspace(1)* %34, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %117 = extractelement <4 x float> %88, i64 1
  store float %117, float addrspace(1)* %38, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %118 = extractelement <4 x float> %88, i64 2
  store float %118, float addrspace(1)* %42, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %119 = extractelement <4 x float> %88, i64 3
  %120 = add i64 %33, 3
  %121 = getelementptr inbounds float, float addrspace(1)* %2, i64 %120
  store float %119, float addrspace(1)* %121, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %122 = extractelement <4 x float> %81, i64 0
  %123 = add i64 %33, 4
  %124 = getelementptr inbounds float, float addrspace(1)* %2, i64 %123
  store float %122, float addrspace(1)* %124, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %125 = add i64 %33, 5
  %126 = getelementptr inbounds float, float addrspace(1)* %2, i64 %125
  store float %91, float addrspace(1)* %126, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %127 = add i64 %33, 6
  %128 = getelementptr inbounds float, float addrspace(1)* %2, i64 %127
  store float %94, float addrspace(1)* %128, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %129 = add i64 %33, 7
  %130 = getelementptr inbounds float, float addrspace(1)* %2, i64 %129
  store float %97, float addrspace(1)* %130, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %131 = extractelement <4 x float> %82, i64 3
  %132 = add i64 %33, 8
  %133 = getelementptr inbounds float, float addrspace(1)* %2, i64 %132
  store float %131, float addrspace(1)* %133, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %134 = extractelement <4 x float> %83, i64 0
  %135 = add i64 %33, 9
  %136 = getelementptr inbounds float, float addrspace(1)* %2, i64 %135
  store float %134, float addrspace(1)* %136, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %137 = add i64 %33, 10
  %138 = getelementptr inbounds float, float addrspace(1)* %2, i64 %137
  store float %100, float addrspace(1)* %138, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %139 = add i64 %33, 11
  %140 = getelementptr inbounds float, float addrspace(1)* %2, i64 %139
  store float %103, float addrspace(1)* %140, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %141 = add i64 %33, 12
  %142 = getelementptr inbounds float, float addrspace(1)* %2, i64 %141
  store float %106, float addrspace(1)* %142, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %143 = extractelement <4 x float> %84, i64 3
  %144 = add i64 %33, 13
  %145 = getelementptr inbounds float, float addrspace(1)* %2, i64 %144
  store float %143, float addrspace(1)* %145, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %146 = extractelement <4 x float> %85, i64 0
  %147 = add i64 %33, 14
  %148 = getelementptr inbounds float, float addrspace(1)* %2, i64 %147
  store float %146, float addrspace(1)* %148, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %149 = add i64 %33, 15
  %150 = getelementptr inbounds float, float addrspace(1)* %2, i64 %149
  store float %109, float addrspace(1)* %150, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %151 = add i64 %33, 16
  %152 = getelementptr inbounds float, float addrspace(1)* %2, i64 %151
  store float %112, float addrspace(1)* %152, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %153 = add i64 %33, 17
  %154 = getelementptr inbounds float, float addrspace(1)* %2, i64 %153
  store float %115, float addrspace(1)* %154, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %155 = extractelement <4 x float> %86, i64 3
  %156 = add i64 %33, 18
  %157 = getelementptr inbounds float, float addrspace(1)* %2, i64 %156
  store float %155, float addrspace(1)* %157, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %158 = extractelement <4 x float> %87, i64 0
  %159 = add i64 %33, 19
  %160 = getelementptr inbounds float, float addrspace(1)* %2, i64 %159
  store float %158, float addrspace(1)* %160, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %161 = extractelement <4 x float> %87, i64 1
  %162 = add i64 %33, 20
  %163 = getelementptr inbounds float, float addrspace(1)* %2, i64 %162
  store float %161, float addrspace(1)* %163, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %164 = extractelement <4 x float> %87, i64 2
  %165 = add i64 %33, 21
  %166 = getelementptr inbounds float, float addrspace(1)* %2, i64 %165
  store float %164, float addrspace(1)* %166, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  %167 = extractelement <4 x float> %87, i64 3
  %168 = add i64 %33, 22
  %169 = getelementptr inbounds float, float addrspace(1)* %2, i64 %168
  store float %167, float addrspace(1)* %169, align 4, !tbaa !40, !alias.scope !42, !noalias !43
  br label %170

170:                                              ; preds = %15, %10, %5
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)*, <2 x i32>, float addrspace(1)*, <4 x float> addrspace(1)*, <4 x float> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 24, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_strideInOut", i32 4, i32 4, i32 0, !"int", !"m_strideIn", i32 8, i32 4, i32 0, !"int", !"m_stepInc", i32 12, i32 4, i32 0, !"int", !"m_offsetX", i32 16, i32 4, i32 0, !"uint", !"m_globalWidth", i32 20, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"inOut"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inNum"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"weightBuffer"}
!23 = !{!24, !25, i64 16}
!24 = !{!"_ZTSN10bm3dnr_buf36bm3dnr_buf_blend8x8ColumnInc5_paramsE", !25, i64 0, !25, i64 4, !25, i64 8, !25, i64 12, !25, i64 16, !25, i64 20}
!25 = !{!"int", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(0)"}
!30 = distinct !{!30, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5)"}
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

