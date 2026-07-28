0x00000000018040 -- textureSamplingShaderWithZebras:
source_filename = "textureSamplingShaderWithZebras"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct.AAPLApplyZebra_TextureSamplerParams = type { float, float, float, float, <2 x float>, <4 x float>, <4 x float> }
%struct._sampler_t = type opaque

@_ZL8drawMode = internal unnamed_addr addrspace(2) global i32 undef, align 4
@_Z8drawMode.MTL_FC_INIT_13_i = internal unnamed_addr addrspace(2) externally_initialized constant i32 undef, section "air.fc_initializer", align 4
@_ZL6luma90 = internal unnamed_addr addrspace(2) global i8 undef, align 1
@_Z6luma90.MTL_FC_INIT_12_b = internal unnamed_addr addrspace(2) externally_initialized constant i8 undef, section "air.fc_initializer", align 1
@_ZL8oobColor = internal unnamed_addr addrspace(2) global i8 undef, align 1
@_Z8oobColor.MTL_FC_INIT_11_b = internal unnamed_addr addrspace(2) externally_initialized constant i8 undef, section "air.fc_initializer", align 1
@_ZL7oobLuma = internal unnamed_addr addrspace(2) global i8 undef, align 1
@_Z7oobLuma.MTL_FC_INIT_10_b = internal unnamed_addr addrspace(2) externally_initialized constant i8 undef, section "air.fc_initializer", align 1
@__air_sampler_state = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8
@llvm.global_ctors = appending global [1 x { i32, void ()*, i8* }] [{ i32, void ()*, i8* } { i32 65535, void ()* @_GLOBAL__sub_I_FFMetalVideoPainterShaders.metal, i8* null }]

; Function Attrs: mustprogress nofree nosync nounwind willreturn
define internal void @_GLOBAL__sub_I_FFMetalVideoPainterShaders.metal() #0 section "air.static_init" {
  %1 = load i8, i8 addrspace(2)* @_Z7oobLuma.MTL_FC_INIT_10_b, align 1, !tbaa !29, !range !33
  store i8 %1, i8 addrspace(2)* @_ZL7oobLuma, align 1, !tbaa !29
  %2 = load i8, i8 addrspace(2)* @_Z8oobColor.MTL_FC_INIT_11_b, align 1, !tbaa !29, !range !33
  store i8 %2, i8 addrspace(2)* @_ZL8oobColor, align 1, !tbaa !29
  %3 = load i8, i8 addrspace(2)* @_Z6luma90.MTL_FC_INIT_12_b, align 1, !tbaa !29, !range !33
  store i8 %3, i8 addrspace(2)* @_ZL6luma90, align 1, !tbaa !29
  %4 = load i32, i32 addrspace(2)* @_Z8drawMode.MTL_FC_INIT_13_i, align 4, !tbaa !34
  store i32 %4, i32 addrspace(2)* @_ZL8drawMode, align 4, !tbaa !34
  ret void
}

; Function Attrs: convergent mustprogress nofree nounwind readonly willreturn
define <4 x float> @textureSamplingShaderWithZebras(<4 x float> %0, <2 x float> %1, %struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* nocapture noundef readonly align 16 dereferenceable(64) "air-buffer-no-alias" %3) local_unnamed_addr #1 {
  %5 = tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %1, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4
  %6 = extractvalue { <4 x half>, i8 } %5, 0
  %7 = tail call fast <4 x float> @air.convert.f.v4f32.f.v4f16(<4 x half> %6) #5
  %8 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 4
  %9 = load <2 x float>, <2 x float> addrspace(2)* %8, align 16, !alias.scope !36, !noalias !39
  %10 = extractelement <2 x float> %9, i64 0
  %11 = extractelement <2 x float> %1, i64 0
  %12 = fmul fast float %10, %11
  %13 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 0
  %14 = load float, float addrspace(2)* %13, align 16, !tbaa !41, !alias.scope !36, !noalias !39
  %15 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 1
  %16 = load float, float addrspace(2)* %15, align 4, !tbaa !44, !alias.scope !36, !noalias !39
  %17 = fmul fast float %16, %14
  %18 = fadd fast float %17, %12
  %19 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 2
  %20 = load float, float addrspace(2)* %19, align 8, !tbaa !45, !alias.scope !36, !noalias !39
  %21 = fmul fast float %20, %16
  %22 = tail call fast float @air.fast_fmod.f32(float %18, float %21) #5
  %23 = extractelement <2 x float> %9, i64 1
  %24 = extractelement <2 x float> %1, i64 1
  %25 = fmul fast float %23, %24
  %26 = tail call fast float @air.fast_fmod.f32(float %25, float %21) #5
  %27 = load i32, i32 addrspace(2)* @_ZL8drawMode, align 4, !tbaa !34
  %28 = tail call fast float @air.convert.f.f32.s.i32(i32 %27) #5
  %29 = fcmp fast ogt float %28, 1.950000e+01
  br i1 %29, label %30, label %75

30:                                               ; preds = %4
  %31 = extractelement <4 x float> %7, i64 3
  %32 = fmul fast float %31, 2.550000e+02
  %33 = tail call i32 @air.convert.s.i32.f.f32(float %32) #5
  %34 = insertelement <4 x float> %7, float 1.000000e+00, i64 3
  %35 = icmp sgt i32 %33, 127
  %36 = load i8, i8 addrspace(2)* @_ZL7oobLuma, align 1
  %37 = icmp ne i8 %36, 0
  %38 = select i1 %35, i1 %37, i1 false
  %39 = extractelement <4 x float> %7, i64 0
  %40 = extractelement <4 x float> %7, i64 1
  %41 = fadd fast float %39, %40
  %42 = extractelement <4 x float> %7, i64 2
  %43 = fadd fast float %41, %42
  %44 = fmul fast float %43, 0x3FD554C980000000
  %45 = insertelement <4 x float> <float poison, float poison, float poison, float 1.000000e+00>, float %44, i64 0
  %46 = insertelement <4 x float> %45, float %44, i64 1
  %47 = insertelement <4 x float> %46, float %44, i64 2
  br i1 %38, label %48, label %51

48:                                               ; preds = %30
  %49 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 6
  %50 = load <4 x float>, <4 x float> addrspace(2)* %49, align 16, !tbaa !46, !alias.scope !36, !noalias !39
  br label %199

51:                                               ; preds = %30
  %52 = add nsw i32 %33, -128
  %53 = select i1 %35, i32 %52, i32 %33
  %54 = icmp sgt i32 %53, 63
  %55 = load i8, i8 addrspace(2)* @_ZL8oobColor, align 1
  %56 = icmp ne i8 %55, 0
  %57 = select i1 %54, i1 %56, i1 false
  br i1 %57, label %58, label %199

58:                                               ; preds = %51
  %59 = fcmp fast ogt float %28, 2.050000e+01
  br i1 %59, label %60, label %72

60:                                               ; preds = %58
  %61 = fsub fast <4 x float> %34, %47
  %62 = tail call fast <4 x float> @air.fast_fabs.v4f32(<4 x float> %61) #5
  %63 = extractelement <4 x float> %62, i64 0
  %64 = extractelement <4 x float> %62, i64 1
  %65 = fadd fast float %63, %64
  %66 = extractelement <4 x float> %62, i64 2
  %67 = fadd fast float %65, %66
  %68 = fcmp fast olt float %67, 2.500000e-01
  %69 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 6
  %70 = load <4 x float>, <4 x float> addrspace(2)* %69, align 16, !alias.scope !36, !noalias !39
  %71 = select i1 %68, <4 x float> %70, <4 x float> %34
  br label %199

72:                                               ; preds = %58
  %73 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 6
  %74 = load <4 x float>, <4 x float> addrspace(2)* %73, align 16, !tbaa !46, !alias.scope !36, !noalias !39
  br label %199

75:                                               ; preds = %4
  %76 = fcmp fast ogt float %28, 9.500000e+00
  br i1 %76, label %77, label %142

77:                                               ; preds = %75
  %78 = extractelement <4 x float> %7, i64 3
  %79 = fmul fast float %78, 2.550000e+02
  %80 = tail call i32 @air.convert.s.i32.f.f32(float %79) #5
  %81 = insertelement <4 x float> %7, float 1.000000e+00, i64 3
  %82 = icmp sgt i32 %80, 127
  %83 = add nsw i32 %80, -128
  %84 = load i8, i8 addrspace(2)* @_ZL7oobLuma, align 1
  %85 = icmp ne i8 %84, 0
  %86 = select i1 %82, i32 %83, i32 %80
  %87 = select i1 %82, i1 %85, i1 false
  %88 = icmp sgt i32 %86, 63
  %89 = add nsw i32 %86, -64
  %90 = load i8, i8 addrspace(2)* @_ZL8oobColor, align 1
  %91 = icmp ne i8 %90, 0
  %92 = select i1 %88, i32 %89, i32 %86
  %93 = icmp sgt i32 %92, 31
  %94 = load i8, i8 addrspace(2)* @_ZL6luma90, align 1
  %95 = icmp ne i8 %94, 0
  %96 = select i1 %93, i1 %95, i1 false
  %97 = select i1 %88, i1 %91, i1 false
  %98 = select i1 %97, i1 true, i1 %87
  %99 = or i1 %98, %96
  br i1 %99, label %100, label %199

100:                                              ; preds = %77
  %101 = fmul fast float %14, 2.000000e+00
  %102 = fdiv fast float %101, %20
  %103 = fsub fast float 1.000000e+00, %102
  %104 = tail call fast float @air.fast_fabs.f32(float %103) #5
  %105 = fmul fast float %104, 0x3FF6666660000000
  %106 = fadd fast float %105, 0xBFD3333340000000
  %107 = fcmp fast olt float %106, 0.000000e+00
  br i1 %107, label %111, label %108

108:                                              ; preds = %100
  %109 = fcmp fast ogt float %106, 1.000000e+00
  br i1 %109, label %110, label %111

110:                                              ; preds = %108
  br label %111

111:                                              ; preds = %110, %108, %100
  %112 = phi float [ 1.000000e+00, %110 ], [ %106, %108 ], [ 0.000000e+00, %100 ]
  %113 = insertelement <4 x float> poison, float %112, i64 0
  %114 = shufflevector <4 x float> %113, <4 x float> poison, <4 x i32> <i32 0, i32 0, i32 0, i32 undef>
  %115 = fmul fast <4 x float> %114, %81
  %116 = fcmp fast olt float %28, 0x4027CCCCC0000000
  br i1 %116, label %117, label %123

117:                                              ; preds = %111
  %118 = fsub fast <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, %81
  %119 = fsub fast float 1.000000e+00, %112
  %120 = insertelement <4 x float> poison, float %119, i64 0
  %121 = shufflevector <4 x float> %120, <4 x float> poison, <4 x i32> zeroinitializer
  %122 = fmul fast <4 x float> %121, %118
  br label %138

123:                                              ; preds = %111
  br i1 %98, label %124, label %131

124:                                              ; preds = %123
  %125 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 6
  %126 = load <4 x float>, <4 x float> addrspace(2)* %125, align 16, !tbaa !46, !alias.scope !36, !noalias !39
  %127 = fsub fast float 1.000000e+00, %112
  %128 = insertelement <4 x float> poison, float %127, i64 0
  %129 = shufflevector <4 x float> %128, <4 x float> poison, <4 x i32> zeroinitializer
  %130 = fmul fast <4 x float> %126, %129
  br label %138

131:                                              ; preds = %123
  %132 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 5
  %133 = load <4 x float>, <4 x float> addrspace(2)* %132, align 16, !tbaa !46, !alias.scope !36, !noalias !39
  %134 = fsub fast float 1.000000e+00, %112
  %135 = insertelement <4 x float> poison, float %134, i64 0
  %136 = shufflevector <4 x float> %135, <4 x float> poison, <4 x i32> zeroinitializer
  %137 = fmul fast <4 x float> %133, %136
  br label %138

138:                                              ; preds = %131, %124, %117
  %139 = phi <4 x float> [ %122, %117 ], [ %130, %124 ], [ %137, %131 ]
  %140 = fadd fast <4 x float> %139, %115
  %141 = insertelement <4 x float> %140, float 1.000000e+00, i64 3
  br label %199

142:                                              ; preds = %75
  %143 = fsub fast float %22, %26
  %144 = tail call fast float @air.fast_fabs.f32(float %143) #5
  %145 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 3
  %146 = load float, float addrspace(2)* %145, align 4, !tbaa !47, !alias.scope !36, !noalias !39
  %147 = fmul fast float %146, %16
  %148 = fcmp fast olt float %144, %147
  br i1 %148, label %149, label %197

149:                                              ; preds = %142
  %150 = extractelement <4 x float> %7, i64 3
  %151 = fmul fast float %150, 2.550000e+02
  %152 = tail call i32 @air.convert.s.i32.f.f32(float %151) #5
  %153 = insertelement <4 x float> %7, float 1.000000e+00, i64 3
  %154 = icmp sgt i32 %152, 127
  %155 = add nsw i32 %152, -128
  %156 = load i8, i8 addrspace(2)* @_ZL7oobLuma, align 1
  %157 = icmp ne i8 %156, 0
  %158 = select i1 %154, i32 %155, i32 %152
  %159 = select i1 %154, i1 %157, i1 false
  %160 = zext i1 %159 to i8
  %161 = icmp sgt i32 %158, 63
  %162 = add nsw i32 %158, -64
  %163 = load i8, i8 addrspace(2)* @_ZL8oobColor, align 1
  %164 = icmp eq i8 %163, 0
  %165 = select i1 %164, i8 %160, i8 1
  %166 = select i1 %161, i32 %162, i32 %158
  %167 = select i1 %161, i8 %165, i8 %160
  %168 = icmp sgt i32 %166, 31
  %169 = load i8, i8 addrspace(2)* @_ZL6luma90, align 1
  %170 = icmp ne i8 %169, 0
  %171 = select i1 %168, i1 %170, i1 false
  %172 = fcmp fast ogt float %28, 5.000000e-01
  %173 = icmp eq i8 %167, 0
  br i1 %172, label %174, label %191

174:                                              ; preds = %149
  br i1 %173, label %186, label %175

175:                                              ; preds = %174
  %176 = fcmp fast ogt float %28, 0x4007333340000000
  br i1 %176, label %177, label %182

177:                                              ; preds = %175
  %178 = shufflevector <4 x float> %7, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %179 = fsub fast <3 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, %178
  %180 = shufflevector <3 x float> %179, <3 x float> poison, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %181 = insertelement <4 x float> %180, float 1.000000e+00, i64 3
  br label %199

182:                                              ; preds = %175
  %183 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 6
  %184 = load <4 x float>, <4 x float> addrspace(2)* %183, align 16, !alias.scope !36, !noalias !39
  %185 = insertelement <4 x float> %184, float 1.000000e+00, i64 3
  br label %199

186:                                              ; preds = %174
  br i1 %171, label %187, label %199

187:                                              ; preds = %186
  %188 = getelementptr inbounds %struct.AAPLApplyZebra_TextureSamplerParams, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)* %3, i64 0, i32 5
  %189 = load <4 x float>, <4 x float> addrspace(2)* %188, align 16, !alias.scope !36, !noalias !39
  %190 = insertelement <4 x float> %189, float 1.000000e+00, i64 3
  br label %199

191:                                              ; preds = %149
  %192 = shufflevector <4 x float> %7, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  %193 = fsub fast <3 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, %192
  %194 = shufflevector <3 x float> %193, <3 x float> poison, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %195 = insertelement <4 x float> %194, float 1.000000e+00, i64 3
  %196 = select i1 %173, <4 x float> %153, <4 x float> %195
  br label %199

197:                                              ; preds = %142
  %198 = insertelement <4 x float> %7, float 1.000000e+00, i64 3
  br label %199

199:                                              ; preds = %197, %191, %187, %186, %182, %177, %138, %77, %72, %60, %51, %48
  %200 = phi <4 x float> [ %198, %197 ], [ %50, %48 ], [ %71, %60 ], [ %74, %72 ], [ %47, %51 ], [ %141, %138 ], [ %81, %77 ], [ %181, %177 ], [ %185, %182 ], [ %190, %187 ], [ %153, %186 ], [ %196, %191 ]
  ret <4 x float> %200
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare i32 @air.convert.s.i32.f.f32(float) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fabs.f32(float) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <4 x float> @air.fast_fabs.v4f32(<4 x float>) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmod.f32(float, float) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <4 x float> @air.convert.f.v4f32.f.v4f16(<4 x half>) local_unnamed_addr #2

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #3

attributes #0 = { mustprogress nofree nosync nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #2 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #3 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #4 = { argmemonly convergent nounwind readonly willreturn }
attributes #5 = { nounwind readnone willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.fragment = !{!15}
!air.function_constants = !{!24, !25, !26, !27}
!air.sampler_states = !{!28}

!0 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!1 = !{i32 1, !"wchar_size", i32 4}
!2 = !{i32 7, !"frame-pointer", i32 2}
!3 = !{i32 7, !"air.max_device_buffers", i32 31}
!4 = !{i32 7, !"air.max_constant_buffers", i32 31}
!5 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!6 = !{i32 7, !"air.max_textures", i32 128}
!7 = !{i32 7, !"air.max_read_write_textures", i32 8}
!8 = !{i32 7, !"air.max_samplers", i32 16}
!9 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!10 = !{i32 2, i32 7, i32 0}
!11 = !{!"Metal", i32 3, i32 2, i32 0}
!12 = !{!"air.compile.denorms_disable"}
!13 = !{!"air.compile.fast_math_enable"}
!14 = !{!"air.compile.framebuffer_fetch_enable"}
!15 = !{<4 x float> (<4 x float>, <2 x float>, %struct._texture_2d_t addrspace(1)*, %struct.AAPLApplyZebra_TextureSamplerParams addrspace(2)*)* @textureSamplingShaderWithZebras, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!18 = !{!19, !20, !21, !22}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"clipSpacePosition", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(17textureCoordinateDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"textureCoordinate"}
!21 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<half, sample>", !"air.arg_name", !"colorTexture"}
!22 = !{i32 3, !"air.buffer", !"air.buffer_size", i32 64, !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !23, !"air.arg_type_size", i32 64, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"AAPLApplyZebra_TextureSamplerParams", !"air.arg_name", !"params"}
!23 = !{i32 0, i32 4, i32 0, !"float", !"phase", i32 4, i32 4, i32 0, !"float", !"patternScale", i32 8, i32 4, i32 0, !"float", !"spacing", i32 12, i32 4, i32 0, !"float", !"widthFactor", i32 16, i32 8, i32 0, !"float2", !"textureSize", i32 32, i32 16, i32 0, !"float4", !"greenColor", i32 48, i32 16, i32 0, !"float4", !"redColor"}
!24 = !{i8 addrspace(2)* @_Z7oobLuma.MTL_FC_INIT_10_b, !"bool", !"oobLuma", i32 10, i1 true}
!25 = !{i8 addrspace(2)* @_Z8oobColor.MTL_FC_INIT_11_b, !"bool", !"oobColor", i32 11, i1 true}
!26 = !{i8 addrspace(2)* @_Z6luma90.MTL_FC_INIT_12_b, !"bool", !"luma90", i32 12, i1 true}
!27 = !{i32 addrspace(2)* @_Z8drawMode.MTL_FC_INIT_13_i, !"int", !"drawMode", i32 13, i1 true}
!28 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state}
!29 = !{!30, !30, i64 0}
!30 = !{!"bool", !31, i64 0}
!31 = !{!"omnipotent char", !32, i64 0}
!32 = !{!"Simple C++ TBAA"}
!33 = !{i8 0, i8 2}
!34 = !{!35, !35, i64 0}
!35 = !{!"int", !31, i64 0}
!36 = !{!37}
!37 = distinct !{!37, !38, !"air-alias-scope-arg(3)"}
!38 = distinct !{!38, !"air-alias-scopes(textureSamplingShaderWithZebras)"}
!39 = !{!40}
!40 = distinct !{!40, !38, !"air-alias-scope-textures"}
!41 = !{!42, !43, i64 0}
!42 = !{!"_ZTS35AAPLApplyZebra_TextureSamplerParams", !43, i64 0, !43, i64 4, !43, i64 8, !43, i64 12, !31, i64 16, !31, i64 32, !31, i64 48}
!43 = !{!"float", !31, i64 0}
!44 = !{!42, !43, i64 4}
!45 = !{!42, !43, i64 8}
!46 = !{!31, !31, i64 0}
!47 = !{!42, !43, i64 12}

