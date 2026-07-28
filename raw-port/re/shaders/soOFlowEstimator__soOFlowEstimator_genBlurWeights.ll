0x000000000a23fd -- soOFlowEstimator::soOFlowEstimator_genBlurWeights:
source_filename = "soOFlowEstimator::soOFlowEstimator_genBlurWeights"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_genBlurWeights_params" = type { i32, i32, float, float }

; Function Attrs: argmemonly nounwind
define void @"soOFlowEstimator::soOFlowEstimator_genBlurWeights"(%"struct.soOFlowEstimator::soOFlowEstimator_genBlurWeights_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, i32 %1, float addrspace(1)* nocapture "air-buffer-no-alias" %2) local_unnamed_addr #0 {
  %4 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_genBlurWeights_params", %"struct.soOFlowEstimator::soOFlowEstimator_genBlurWeights_params" addrspace(2)* %0, i64 0, i32 1
  %5 = load i32, i32 addrspace(2)* %4, align 4, !tbaa !21, !alias.scope !27, !noalias !30
  %6 = icmp ult i32 %5, %1
  br i1 %6, label %223, label %7

7:                                                ; preds = %3
  %8 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_genBlurWeights_params", %"struct.soOFlowEstimator::soOFlowEstimator_genBlurWeights_params" addrspace(2)* %0, i64 0, i32 0
  %9 = load i32, i32 addrspace(2)* %8, align 4, !tbaa !32, !alias.scope !27, !noalias !30
  %10 = mul i32 %9, %1
  %11 = zext i32 %10 to i64
  %12 = getelementptr inbounds float, float addrspace(1)* %2, i64 %11
  %13 = getelementptr inbounds float, float addrspace(1)* %12, i64 2
  %14 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_genBlurWeights_params", %"struct.soOFlowEstimator::soOFlowEstimator_genBlurWeights_params" addrspace(2)* %0, i64 0, i32 3
  %15 = load float, float addrspace(2)* %14, align 4, !tbaa !33, !alias.scope !27, !noalias !30
  %16 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_genBlurWeights_params", %"struct.soOFlowEstimator::soOFlowEstimator_genBlurWeights_params" addrspace(2)* %0, i64 0, i32 2
  %17 = load float, float addrspace(2)* %16, align 4, !tbaa !34, !alias.scope !27, !noalias !30
  %18 = fdiv float 1.000000e+00, %17
  %19 = tail call float @air.fmax.f32(float 1.000000e+00, float %18) #1
  %20 = fmul float %15, %19
  %21 = tail call float @air.convert.f.f32.u.i32(i32 %1) #1
  %22 = fadd float %21, 5.000000e-01
  %23 = fdiv float %22, %17
  %24 = fmul float %20, 2.000000e+00
  %25 = tail call float @air.fmax.f32(float 5.000000e-01, float %24) #1
  %26 = fsub float %23, %25
  %27 = fadd float %26, 5.000000e-01
  %28 = tail call i32 @air.convert.s.i32.f.f32(float %27) #1
  %29 = fadd float %25, %23
  %30 = fadd float %29, 5.000000e-01
  %31 = tail call i32 @air.convert.s.i32.f.f32(float %30) #1
  %32 = tail call float @air.convert.f.f32.s.i32(i32 %28) #1
  %33 = getelementptr inbounds float, float addrspace(1)* %13, i64 -2
  store float %32, float addrspace(1)* %33, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  %34 = tail call float @air.convert.f.f32.s.i32(i32 %31) #1
  %35 = getelementptr inbounds float, float addrspace(1)* %13, i64 -1
  store float %34, float addrspace(1)* %35, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  %36 = icmp slt i32 %28, %31
  br i1 %36, label %37, label %82

37:                                               ; preds = %77, %7
  %38 = phi float [ %79, %77 ], [ 0.000000e+00, %7 ]
  %39 = phi i32 [ %80, %77 ], [ %28, %7 ]
  %40 = tail call float @air.convert.f.f32.s.i32(i32 %39) #1
  %41 = fadd float %40, 5.000000e-01
  %42 = fsub float %41, %23
  %43 = fdiv float %42, %20
  %44 = fcmp olt float %43, -2.000000e+00
  br i1 %44, label %77, label %45

45:                                               ; preds = %37
  %46 = fcmp olt float %43, -1.000000e+00
  br i1 %46, label %47, label %53

47:                                               ; preds = %45
  %48 = fadd float %43, 1.000000e+00
  %49 = fmul float %48, 5.000000e-01
  %50 = fadd float %43, 2.000000e+00
  %51 = fmul float %50, %49
  %52 = fmul float %50, %51
  br label %77

53:                                               ; preds = %45
  %54 = fcmp olt float %43, 0.000000e+00
  br i1 %54, label %55, label %61

55:                                               ; preds = %53
  %56 = fmul float %43, -2.500000e+00
  %57 = tail call float @llvm.fmuladd.f32(float %56, float %43, float 1.000000e+00) #3
  %58 = fmul float %43, -1.500000e+00
  %59 = fmul float %43, %58
  %60 = tail call float @llvm.fmuladd.f32(float %59, float %43, float %57) #3
  br label %77

61:                                               ; preds = %53
  %62 = fcmp olt float %43, 1.000000e+00
  br i1 %62, label %63, label %69

63:                                               ; preds = %61
  %64 = fmul float %43, -2.500000e+00
  %65 = tail call float @llvm.fmuladd.f32(float %64, float %43, float 1.000000e+00) #3
  %66 = fmul float %43, 1.500000e+00
  %67 = fmul float %43, %66
  %68 = tail call float @llvm.fmuladd.f32(float %67, float %43, float %65) #3
  br label %77

69:                                               ; preds = %61
  %70 = fcmp olt float %43, 2.000000e+00
  br i1 %70, label %71, label %77

71:                                               ; preds = %69
  %72 = fadd float %43, -2.000000e+00
  %73 = fmul float %72, -5.000000e-01
  %74 = fmul float %72, %73
  %75 = fadd float %43, -1.000000e+00
  %76 = fmul float %75, %74
  br label %77

77:                                               ; preds = %71, %69, %63, %55, %47, %37
  %78 = phi float [ %52, %47 ], [ %60, %55 ], [ %68, %63 ], [ %76, %71 ], [ 0.000000e+00, %37 ], [ 0.000000e+00, %69 ]
  %79 = fadd float %38, %78
  %80 = add nsw i32 %39, 1
  %81 = icmp eq i32 %80, %31
  br i1 %81, label %82, label %37, !llvm.loop !36

82:                                               ; preds = %77, %7
  %83 = phi float [ 0.000000e+00, %7 ], [ %79, %77 ]
  %84 = fcmp oeq float %83, 0.000000e+00
  %85 = fdiv float 3.276800e+04, %83
  %86 = select i1 %84, float 3.276800e+04, float %85
  %87 = fdiv float 1.000000e+00, %83
  %88 = select i1 %84, float 1.000000e+00, float %87
  br i1 %36, label %89, label %192

89:                                               ; preds = %184, %82
  %90 = phi i32 [ %189, %184 ], [ 0, %82 ]
  %91 = phi i32 [ %188, %184 ], [ 1, %82 ]
  %92 = phi i32 [ %187, %184 ], [ 0, %82 ]
  %93 = phi i32 [ %190, %184 ], [ %28, %82 ]
  %94 = phi i32 [ %186, %184 ], [ %28, %82 ]
  %95 = phi float [ %185, %184 ], [ 0.000000e+00, %82 ]
  %96 = tail call float @air.convert.f.f32.s.i32(i32 %93) #1
  %97 = fadd float %96, 5.000000e-01
  %98 = fsub float %97, %23
  %99 = fdiv float %98, %20
  %100 = fcmp olt float %99, -2.000000e+00
  br i1 %100, label %133, label %101

101:                                              ; preds = %89
  %102 = fcmp olt float %99, -1.000000e+00
  br i1 %102, label %103, label %109

103:                                              ; preds = %101
  %104 = fadd float %99, 1.000000e+00
  %105 = fmul float %104, 5.000000e-01
  %106 = fadd float %99, 2.000000e+00
  %107 = fmul float %106, %105
  %108 = fmul float %106, %107
  br label %133

109:                                              ; preds = %101
  %110 = fcmp olt float %99, 0.000000e+00
  br i1 %110, label %111, label %117

111:                                              ; preds = %109
  %112 = fmul float %99, -2.500000e+00
  %113 = tail call float @llvm.fmuladd.f32(float %112, float %99, float 1.000000e+00) #3
  %114 = fmul float %99, -1.500000e+00
  %115 = fmul float %99, %114
  %116 = tail call float @llvm.fmuladd.f32(float %115, float %99, float %113) #3
  br label %133

117:                                              ; preds = %109
  %118 = fcmp olt float %99, 1.000000e+00
  br i1 %118, label %119, label %125

119:                                              ; preds = %117
  %120 = fmul float %99, -2.500000e+00
  %121 = tail call float @llvm.fmuladd.f32(float %120, float %99, float 1.000000e+00) #3
  %122 = fmul float %99, 1.500000e+00
  %123 = fmul float %99, %122
  %124 = tail call float @llvm.fmuladd.f32(float %123, float %99, float %121) #3
  br label %133

125:                                              ; preds = %117
  %126 = fcmp olt float %99, 2.000000e+00
  br i1 %126, label %127, label %133

127:                                              ; preds = %125
  %128 = fadd float %99, -2.000000e+00
  %129 = fmul float %128, -5.000000e-01
  %130 = fmul float %128, %129
  %131 = fadd float %99, -1.000000e+00
  %132 = fmul float %131, %130
  br label %133

133:                                              ; preds = %127, %125, %119, %111, %103, %89
  %134 = phi float [ %108, %103 ], [ %116, %111 ], [ %124, %119 ], [ %132, %127 ], [ 0.000000e+00, %89 ], [ 0.000000e+00, %125 ]
  %135 = fmul float %86, %134
  br i1 %100, label %168, label %136

136:                                              ; preds = %133
  %137 = fcmp olt float %99, -1.000000e+00
  br i1 %137, label %138, label %144

138:                                              ; preds = %136
  %139 = fadd float %99, 1.000000e+00
  %140 = fmul float %139, 5.000000e-01
  %141 = fadd float %99, 2.000000e+00
  %142 = fmul float %141, %140
  %143 = fmul float %141, %142
  br label %168

144:                                              ; preds = %136
  %145 = fcmp olt float %99, 0.000000e+00
  br i1 %145, label %146, label %152

146:                                              ; preds = %144
  %147 = fmul float %99, -2.500000e+00
  %148 = tail call float @llvm.fmuladd.f32(float %147, float %99, float 1.000000e+00) #3
  %149 = fmul float %99, -1.500000e+00
  %150 = fmul float %99, %149
  %151 = tail call float @llvm.fmuladd.f32(float %150, float %99, float %148) #3
  br label %168

152:                                              ; preds = %144
  %153 = fcmp olt float %99, 1.000000e+00
  br i1 %153, label %154, label %160

154:                                              ; preds = %152
  %155 = fmul float %99, -2.500000e+00
  %156 = tail call float @llvm.fmuladd.f32(float %155, float %99, float 1.000000e+00) #3
  %157 = fmul float %99, 1.500000e+00
  %158 = fmul float %99, %157
  %159 = tail call float @llvm.fmuladd.f32(float %158, float %99, float %156) #3
  br label %168

160:                                              ; preds = %152
  %161 = fcmp olt float %99, 2.000000e+00
  br i1 %161, label %162, label %168

162:                                              ; preds = %160
  %163 = fadd float %99, -2.000000e+00
  %164 = fmul float %163, -5.000000e-01
  %165 = fmul float %163, %164
  %166 = fadd float %99, -1.000000e+00
  %167 = fmul float %166, %165
  br label %168

168:                                              ; preds = %162, %160, %154, %146, %138, %133
  %169 = phi float [ %143, %138 ], [ %151, %146 ], [ %159, %154 ], [ %167, %162 ], [ 0.000000e+00, %133 ], [ 0.000000e+00, %160 ]
  %170 = tail call float @air.round.f32(float %135) #1
  %171 = tail call i32 @air.convert.s.i32.f.f32(float %170) #1
  %172 = icmp eq i32 %91, 0
  %173 = icmp ne i32 %171, 0
  %174 = select i1 %172, i1 true, i1 %173
  br i1 %174, label %177, label %175

175:                                              ; preds = %168
  %176 = add nsw i32 %94, 1
  br label %184

177:                                              ; preds = %168
  %178 = fmul float %88, %169
  %179 = add nsw i32 %92, 1
  %180 = sext i32 %92 to i64
  %181 = getelementptr inbounds float, float addrspace(1)* %13, i64 %180
  store float %178, float addrspace(1)* %181, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  %182 = fadd float %95, %178
  %183 = select i1 %173, i32 %93, i32 %90
  br label %184

184:                                              ; preds = %177, %175
  %185 = phi float [ %95, %175 ], [ %182, %177 ]
  %186 = phi i32 [ %176, %175 ], [ %94, %177 ]
  %187 = phi i32 [ %92, %175 ], [ %179, %177 ]
  %188 = phi i32 [ 1, %175 ], [ 0, %177 ]
  %189 = phi i32 [ %90, %175 ], [ %183, %177 ]
  %190 = add nsw i32 %93, 1
  %191 = icmp eq i32 %190, %31
  br i1 %191, label %192, label %89, !llvm.loop !38

192:                                              ; preds = %184, %82
  %193 = phi float [ 0.000000e+00, %82 ], [ %185, %184 ]
  %194 = phi i32 [ %28, %82 ], [ %186, %184 ]
  %195 = phi i32 [ 0, %82 ], [ %189, %184 ]
  %196 = fcmp oeq float %193, 0.000000e+00
  br i1 %196, label %197, label %205

197:                                              ; preds = %192
  %198 = load float, float addrspace(1)* %33, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  %199 = load float, float addrspace(1)* %35, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  %200 = fadd float %198, %199
  %201 = fmul float %200, 5.000000e-01
  store float %201, float addrspace(1)* %33, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  %202 = fadd float %199, %201
  %203 = fmul float %202, 5.000000e-01
  %204 = fadd float %203, 1.000000e+00
  store float %204, float addrspace(1)* %35, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  store float 1.000000e+00, float addrspace(1)* %13, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  br label %223

205:                                              ; preds = %192
  %206 = tail call float @air.convert.f.f32.s.i32(i32 %194) #1
  store float %206, float addrspace(1)* %33, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  %207 = add nsw i32 %195, 1
  %208 = tail call float @air.convert.f.f32.s.i32(i32 %207) #1
  store float %208, float addrspace(1)* %35, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  %209 = fcmp une float %193, 1.000000e+00
  br i1 %209, label %210, label %223

210:                                              ; preds = %205
  %211 = tail call float @air.round.f32(float %23) #1
  %212 = tail call i32 @air.convert.s.i32.f.f32(float %211) #1
  %213 = icmp slt i32 %212, %194
  %214 = icmp slt i32 %212, %195
  %215 = select i1 %214, i32 %212, i32 %195
  %216 = fsub float 1.000000e+00, %193
  %217 = sub i32 %215, %194
  %218 = select i1 %213, i32 0, i32 %217
  %219 = sext i32 %218 to i64
  %220 = getelementptr inbounds float, float addrspace(1)* %13, i64 %219
  %221 = load float, float addrspace(1)* %220, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  %222 = fadd float %216, %221
  store float %222, float addrspace(1)* %220, align 4, !tbaa !35, !alias.scope !30, !noalias !27
  br label %223

223:                                              ; preds = %210, %205, %197, %3
  ret void
}

; Function Attrs: nounwind readnone
declare i32 @air.convert.s.i32.f.f32(float) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare float @air.round.f32(float) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #1

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare float @llvm.fmuladd.f32(float, float, float) #2

; Function Attrs: nounwind readnone
declare float @air.fmax.f32(float, float) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.u.i32(i32) local_unnamed_addr #1

attributes #0 = { argmemonly nounwind "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { nounwind readnone }
attributes #2 = { nocallback nofree nosync nounwind readnone speculatable willreturn }
attributes #3 = { nounwind }

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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_genBlurWeights_params" addrspace(2)*, i32, float addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_genBlurWeights", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_genBlurWeights_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_weightArrayDimX", i32 4, i32 4, i32 0, !"int", !"m_weightArrayDimY", i32 8, i32 4, i32 0, !"float", !"m_imageScale", i32 12, i32 4, i32 0, !"float", !"m_sigma"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint", !"air.arg_name", !"x"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"weights"}
!21 = !{!22, !23, i64 4}
!22 = !{!"_ZTSN16soOFlowEstimator38soOFlowEstimator_genBlurWeights_paramsE", !23, i64 0, !23, i64 4, !26, i64 8, !26, i64 12}
!23 = !{!"int", !24, i64 0}
!24 = !{!"omnipotent char", !25, i64 0}
!25 = !{!"Simple C++ TBAA"}
!26 = !{!"float", !24, i64 0}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_genBlurWeights)"}
!30 = !{!31}
!31 = distinct !{!31, !29, !"air-alias-scope-arg(2)"}
!32 = !{!22, !23, i64 0}
!33 = !{!22, !26, i64 12}
!34 = !{!22, !26, i64 8}
!35 = !{!26, !26, i64 0}
!36 = distinct !{!36, !37}
!37 = !{!"llvm.loop.mustprogress"}
!38 = distinct !{!38, !37}

