0x0000000000678d -- bm3dnr_buf::bm3dnr_buf_blend4x4Column:
source_filename = "bm3dnr_buf::bm3dnr_buf_blend4x4Column"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" = type { i32, i32, i32, i32, i32, i32 }

@_ZN10bm3dnr_bufL9weight4x4E = internal unnamed_addr addrspace(2) constant [4 x <4 x float>] [<4 x float> <float 0x3F5F212D80000000, float 0x3F9FBE76C0000000, float 0x3F9FBE76C0000000, float 0x3F5F212D80000000>, <4 x float> <float 0x3F9FBE76C0000000, float 0x3FDFF62B60000000, float 0x3FDFF62B60000000, float 0x3F9FBE76C0000000>, <4 x float> <float 0x3F9FBE76C0000000, float 0x3FDFF62B60000000, float 0x3FDFF62B60000000, float 0x3F9FBE76C0000000>, <4 x float> <float 0x3F5F212D80000000, float 0x3F9FBE76C0000000, float 0x3F9FBE76C0000000, float 0x3F5F212D80000000>], align 16

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blend4x4Column"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, float addrspace(1)* nocapture "air-buffer-no-alias" %2, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3) local_unnamed_addr #0 {
  %5 = extractelement <2 x i32> %1, i64 0
  %6 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 4
  %7 = load i32, i32 addrspace(2)* %6, align 4, !tbaa !22, !alias.scope !27, !noalias !30
  %8 = icmp ult i32 %5, %7
  br i1 %8, label %9, label %164

9:                                                ; preds = %4
  %10 = extractelement <2 x i32> %1, i64 1
  %11 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 5
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !33, !alias.scope !27, !noalias !30
  %13 = icmp ult i32 %10, %12
  br i1 %13, label %14, label %164

14:                                               ; preds = %9
  %15 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 0
  %16 = load i32, i32 addrspace(2)* %15, align 4, !tbaa !34, !alias.scope !27, !noalias !30
  %17 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 1
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !35, !alias.scope !27, !noalias !30
  %19 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 2
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !36, !alias.scope !27, !noalias !30
  %21 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 3
  %22 = load i32, i32 addrspace(2)* %21, align 4, !tbaa !37, !alias.scope !27, !noalias !30
  %23 = add i32 %22, %5
  %24 = zext i32 %23 to i64
  %25 = zext i32 %10 to i64
  %26 = sext i32 %20 to i64
  %27 = shl nsw i64 %26, 3
  %28 = mul i64 %27, %24
  %29 = and i32 %10, 3
  %30 = sext i32 %16 to i64
  %31 = mul nsw i64 %30, %25
  %32 = add i64 %28, %31
  %33 = getelementptr inbounds float, float addrspace(1)* %2, i64 %32
  %34 = load float, float addrspace(1)* %33, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %35 = insertelement <4 x float> <float undef, float 0.000000e+00, float 0.000000e+00, float 0.000000e+00>, float %34, i64 0
  %36 = zext i32 %29 to i64
  %37 = getelementptr inbounds [4 x <4 x float>], [4 x <4 x float>] addrspace(2)* @_ZN10bm3dnr_bufL9weight4x4E, i64 0, i64 %36
  %38 = load <4 x float>, <4 x float> addrspace(2)* %37, align 16, !tbaa !42
  %39 = sext i32 %18 to i64
  %40 = mul nsw i64 %39, %25
  %41 = shl nuw nsw i64 %24, 3
  %42 = add i64 %41, %40
  %43 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %42
  %44 = load <4 x float>, <4 x float> addrspace(1)* %43, align 16, !tbaa !42, !alias.scope !43, !noalias !44
  %45 = fmul <4 x float> %38, %44
  %46 = add i64 %42, 1
  %47 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %46
  %48 = load <4 x float>, <4 x float> addrspace(1)* %47, align 16, !tbaa !42, !alias.scope !43, !noalias !44
  %49 = fmul <4 x float> %38, %48
  %50 = add i64 %42, 2
  %51 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %50
  %52 = load <4 x float>, <4 x float> addrspace(1)* %51, align 16, !tbaa !42, !alias.scope !43, !noalias !44
  %53 = fmul <4 x float> %38, %52
  %54 = add i64 %42, 3
  %55 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %54
  %56 = load <4 x float>, <4 x float> addrspace(1)* %55, align 16, !tbaa !42, !alias.scope !43, !noalias !44
  %57 = fmul <4 x float> %38, %56
  %58 = add i64 %42, 4
  %59 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %58
  %60 = load <4 x float>, <4 x float> addrspace(1)* %59, align 16, !tbaa !42, !alias.scope !43, !noalias !44
  %61 = fmul <4 x float> %38, %60
  %62 = add i64 %42, 5
  %63 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %62
  %64 = load <4 x float>, <4 x float> addrspace(1)* %63, align 16, !tbaa !42, !alias.scope !43, !noalias !44
  %65 = fmul <4 x float> %38, %64
  %66 = add i64 %42, 6
  %67 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %66
  %68 = load <4 x float>, <4 x float> addrspace(1)* %67, align 16, !tbaa !42, !alias.scope !43, !noalias !44
  %69 = fmul <4 x float> %38, %68
  %70 = add i64 %42, 7
  %71 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %70
  %72 = load <4 x float>, <4 x float> addrspace(1)* %71, align 16, !tbaa !42, !alias.scope !43, !noalias !44
  %73 = fmul <4 x float> %38, %72
  %74 = extractelement <4 x float> %45, i64 3
  %75 = extractelement <4 x float> %49, i64 0
  %76 = fadd float %74, %75
  %77 = insertelement <4 x float> %45, float %76, i64 3
  %78 = extractelement <4 x float> %49, i64 3
  %79 = extractelement <4 x float> %53, i64 0
  %80 = fadd float %78, %79
  %81 = extractelement <4 x float> %53, i64 3
  %82 = extractelement <4 x float> %57, i64 0
  %83 = fadd float %81, %82
  %84 = extractelement <4 x float> %57, i64 3
  %85 = extractelement <4 x float> %61, i64 0
  %86 = fadd float %84, %85
  %87 = extractelement <4 x float> %61, i64 3
  %88 = extractelement <4 x float> %65, i64 0
  %89 = fadd float %87, %88
  %90 = extractelement <4 x float> %65, i64 3
  %91 = extractelement <4 x float> %69, i64 0
  %92 = fadd float %90, %91
  %93 = extractelement <4 x float> %69, i64 3
  %94 = extractelement <4 x float> %73, i64 0
  %95 = fadd float %93, %94
  %96 = fadd <4 x float> %35, %77
  %97 = extractelement <4 x float> %96, i64 0
  store float %97, float addrspace(1)* %33, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %98 = extractelement <4 x float> %96, i64 1
  %99 = add i64 %32, 1
  %100 = getelementptr inbounds float, float addrspace(1)* %2, i64 %99
  store float %98, float addrspace(1)* %100, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %101 = extractelement <4 x float> %96, i64 2
  %102 = add i64 %32, 2
  %103 = getelementptr inbounds float, float addrspace(1)* %2, i64 %102
  store float %101, float addrspace(1)* %103, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %104 = extractelement <4 x float> %96, i64 3
  %105 = add i64 %32, 3
  %106 = getelementptr inbounds float, float addrspace(1)* %2, i64 %105
  store float %104, float addrspace(1)* %106, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %107 = extractelement <4 x float> %49, i64 1
  %108 = add i64 %32, 4
  %109 = getelementptr inbounds float, float addrspace(1)* %2, i64 %108
  store float %107, float addrspace(1)* %109, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %110 = extractelement <4 x float> %49, i64 2
  %111 = add i64 %32, 5
  %112 = getelementptr inbounds float, float addrspace(1)* %2, i64 %111
  store float %110, float addrspace(1)* %112, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %113 = add i64 %32, 6
  %114 = getelementptr inbounds float, float addrspace(1)* %2, i64 %113
  store float %80, float addrspace(1)* %114, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %115 = extractelement <4 x float> %53, i64 1
  %116 = add i64 %32, 7
  %117 = getelementptr inbounds float, float addrspace(1)* %2, i64 %116
  store float %115, float addrspace(1)* %117, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %118 = extractelement <4 x float> %53, i64 2
  %119 = add i64 %32, 8
  %120 = getelementptr inbounds float, float addrspace(1)* %2, i64 %119
  store float %118, float addrspace(1)* %120, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %121 = add i64 %32, 9
  %122 = getelementptr inbounds float, float addrspace(1)* %2, i64 %121
  store float %83, float addrspace(1)* %122, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %123 = extractelement <4 x float> %57, i64 1
  %124 = add i64 %32, 10
  %125 = getelementptr inbounds float, float addrspace(1)* %2, i64 %124
  store float %123, float addrspace(1)* %125, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %126 = extractelement <4 x float> %57, i64 2
  %127 = add i64 %32, 11
  %128 = getelementptr inbounds float, float addrspace(1)* %2, i64 %127
  store float %126, float addrspace(1)* %128, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %129 = add i64 %32, 12
  %130 = getelementptr inbounds float, float addrspace(1)* %2, i64 %129
  store float %86, float addrspace(1)* %130, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %131 = extractelement <4 x float> %61, i64 1
  %132 = add i64 %32, 13
  %133 = getelementptr inbounds float, float addrspace(1)* %2, i64 %132
  store float %131, float addrspace(1)* %133, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %134 = extractelement <4 x float> %61, i64 2
  %135 = add i64 %32, 14
  %136 = getelementptr inbounds float, float addrspace(1)* %2, i64 %135
  store float %134, float addrspace(1)* %136, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %137 = add i64 %32, 15
  %138 = getelementptr inbounds float, float addrspace(1)* %2, i64 %137
  store float %89, float addrspace(1)* %138, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %139 = extractelement <4 x float> %65, i64 1
  %140 = add i64 %32, 16
  %141 = getelementptr inbounds float, float addrspace(1)* %2, i64 %140
  store float %139, float addrspace(1)* %141, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %142 = extractelement <4 x float> %65, i64 2
  %143 = add i64 %32, 17
  %144 = getelementptr inbounds float, float addrspace(1)* %2, i64 %143
  store float %142, float addrspace(1)* %144, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %145 = add i64 %32, 18
  %146 = getelementptr inbounds float, float addrspace(1)* %2, i64 %145
  store float %92, float addrspace(1)* %146, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %147 = extractelement <4 x float> %69, i64 1
  %148 = add i64 %32, 19
  %149 = getelementptr inbounds float, float addrspace(1)* %2, i64 %148
  store float %147, float addrspace(1)* %149, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %150 = extractelement <4 x float> %69, i64 2
  %151 = add i64 %32, 20
  %152 = getelementptr inbounds float, float addrspace(1)* %2, i64 %151
  store float %150, float addrspace(1)* %152, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %153 = add i64 %32, 21
  %154 = getelementptr inbounds float, float addrspace(1)* %2, i64 %153
  store float %95, float addrspace(1)* %154, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %155 = extractelement <4 x float> %73, i64 1
  %156 = add i64 %32, 22
  %157 = getelementptr inbounds float, float addrspace(1)* %2, i64 %156
  store float %155, float addrspace(1)* %157, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %158 = extractelement <4 x float> %73, i64 2
  %159 = add i64 %32, 23
  %160 = getelementptr inbounds float, float addrspace(1)* %2, i64 %159
  store float %158, float addrspace(1)* %160, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  %161 = extractelement <4 x float> %73, i64 3
  %162 = add i64 %32, 24
  %163 = getelementptr inbounds float, float addrspace(1)* %2, i64 %162
  store float %161, float addrspace(1)* %163, align 4, !tbaa !38, !alias.scope !40, !noalias !41
  br label %164

164:                                              ; preds = %14, %9, %4
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)*, <2 x i32>, float addrspace(1)*, <4 x float> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blend4x4Column", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 24, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_strideInOut", i32 4, i32 4, i32 0, !"int", !"m_strideIn", i32 8, i32 4, i32 0, !"int", !"m_stepInc", i32 12, i32 4, i32 0, !"int", !"m_offsetX", i32 16, i32 4, i32 0, !"uint", !"m_globalWidth", i32 20, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"inOut"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"input"}
!22 = !{!23, !24, i64 16}
!23 = !{!"_ZTSN10bm3dnr_buf32bm3dnr_buf_blend4x4Column_paramsE", !24, i64 0, !24, i64 4, !24, i64 8, !24, i64 12, !24, i64 16, !24, i64 20}
!24 = !{!"int", !25, i64 0}
!25 = !{!"omnipotent char", !26, i64 0}
!26 = !{!"Simple C++ TBAA"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blend4x4Column)"}
!30 = !{!31, !32}
!31 = distinct !{!31, !29, !"air-alias-scope-arg(2)"}
!32 = distinct !{!32, !29, !"air-alias-scope-arg(3)"}
!33 = !{!23, !24, i64 20}
!34 = !{!23, !24, i64 0}
!35 = !{!23, !24, i64 4}
!36 = !{!23, !24, i64 8}
!37 = !{!23, !24, i64 12}
!38 = !{!39, !39, i64 0}
!39 = !{!"float", !25, i64 0}
!40 = !{!31}
!41 = !{!28, !32}
!42 = !{!25, !25, i64 0}
!43 = !{!32}
!44 = !{!28, !31}

