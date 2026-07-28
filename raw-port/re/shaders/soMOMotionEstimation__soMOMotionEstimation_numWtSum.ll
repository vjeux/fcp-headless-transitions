0x000000000dbafd -- soMOMotionEstimation::soMOMotionEstimation_numWtSum:
source_filename = "soMOMotionEstimation::soMOMotionEstimation_numWtSum"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" = type { i32, float, float, float, i32, float, float, float, float, float, float, float, float, float, float, float, float }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant i64 -9188470239253725184, align 8

; Function Attrs: convergent nounwind
define void @"soMOMotionEstimation::soMOMotionEstimation_numWtSum"(%"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._texture_2d_t addrspace(1)* %2, %struct._texture_2d_t addrspace(1)* %3, <4 x i32> addrspace(1)* nocapture "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = extractelement <2 x i32> %1, i64 0
  %7 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, i32 0) #4, !alias.scope !24, !noalias !27
  %8 = tail call i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, i32 0) #4, !alias.scope !24, !noalias !27
  %9 = icmp slt i32 %6, %8
  br i1 %9, label %10, label %239

10:                                               ; preds = %5
  %11 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 0
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !30, !alias.scope !36, !noalias !37
  switch i32 %12, label %230 [
    i32 2, label %13
    i32 1, label %106
    i32 0, label %178
  ]

13:                                               ; preds = %10
  %14 = tail call float @air.convert.f.f32.s.i32(i32 %6) #2
  %15 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 2
  %16 = load float, float addrspace(2)* %15, align 4, !tbaa !38, !alias.scope !36, !noalias !37
  %17 = fsub float %14, %16
  %18 = fmul float %17, %17
  %19 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 8
  %20 = load float, float addrspace(2)* %19, align 4, !tbaa !39, !alias.scope !36, !noalias !37
  %21 = fmul float %17, %20
  %22 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 10
  %23 = load float, float addrspace(2)* %22, align 4, !tbaa !40, !alias.scope !36, !noalias !37
  %24 = fmul float %17, %23
  %25 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 6
  %26 = load float, float addrspace(2)* %25, align 4, !tbaa !41, !alias.scope !36, !noalias !37
  %27 = fadd float %14, %26
  %28 = icmp sgt i32 %7, 0
  br i1 %28, label %29, label %230

29:                                               ; preds = %13
  %30 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 4
  %31 = load i32, i32 addrspace(2)* %30, align 4, !tbaa !42, !alias.scope !36, !noalias !37
  %32 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 1
  %33 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 5
  %34 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 7
  %35 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 11
  %36 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 12
  %37 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 13
  %38 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 16
  %39 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 15
  %40 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 14
  %41 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 9
  %42 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 3
  br label %43

43:                                               ; preds = %100, %29
  %44 = phi i32 [ 0, %29 ], [ %103, %100 ]
  %45 = phi i32 [ 0, %29 ], [ %102, %100 ]
  %46 = phi i32 [ 0, %29 ], [ %101, %100 ]
  %47 = phi i32 [ 0, %29 ], [ %104, %100 ]
  %48 = tail call float @air.convert.f.f32.s.i32(i32 %47) #2
  %49 = insertelement <2 x float> undef, float %48, i64 0
  %50 = insertelement <2 x float> %49, float %14, i64 1
  %51 = fadd <2 x float> %50, <float 5.000000e-01, float 5.000000e-01>
  %52 = tail call { <4 x i32>, i8 } @air.sample_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %51, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %53 = extractvalue { <4 x i32>, i8 } %52, 0
  %54 = extractelement <4 x i32> %53, i64 0
  %55 = icmp eq i32 %54, %31
  br i1 %55, label %56, label %100

56:                                               ; preds = %43
  %57 = load float, float addrspace(2)* %32, align 4, !tbaa !43, !alias.scope !36, !noalias !37
  %58 = fsub float %48, %57
  %59 = fmul float %58, %58
  %60 = fmul float %17, %58
  %61 = add nsw i32 %44, 1
  %62 = load float, float addrspace(2)* %33, align 4, !tbaa !44, !alias.scope !36, !noalias !37
  %63 = load float, float addrspace(2)* %34, align 4, !tbaa !45, !alias.scope !36, !noalias !37
  %64 = tail call float @llvm.fmuladd.f32(float %58, float %63, float %62)
  %65 = fadd float %21, %64
  %66 = load float, float addrspace(2)* %35, align 4, !tbaa !46, !alias.scope !36, !noalias !37
  %67 = tail call float @llvm.fmuladd.f32(float %59, float %66, float %65)
  %68 = load float, float addrspace(2)* %36, align 4, !tbaa !47, !alias.scope !36, !noalias !37
  %69 = tail call float @llvm.fmuladd.f32(float %60, float %68, float %67)
  %70 = load float, float addrspace(2)* %37, align 4, !tbaa !48, !alias.scope !36, !noalias !37
  %71 = tail call float @llvm.fmuladd.f32(float %18, float %70, float %69)
  %72 = fadd float %48, %71
  %73 = tail call i32 @air.convert.s.i32.f.f32(float %72) #2
  %74 = icmp sgt i32 %73, -1
  br i1 %74, label %75, label %100

75:                                               ; preds = %56
  %76 = load float, float addrspace(2)* %38, align 4, !tbaa !49, !alias.scope !36, !noalias !37
  %77 = load float, float addrspace(2)* %39, align 4, !tbaa !50, !alias.scope !36, !noalias !37
  %78 = load float, float addrspace(2)* %40, align 4, !tbaa !51, !alias.scope !36, !noalias !37
  %79 = load float, float addrspace(2)* %41, align 4, !tbaa !52, !alias.scope !36, !noalias !37
  %80 = tail call float @llvm.fmuladd.f32(float %58, float %79, float %27)
  %81 = fadd float %24, %80
  %82 = tail call float @llvm.fmuladd.f32(float %59, float %78, float %81)
  %83 = tail call float @llvm.fmuladd.f32(float %60, float %77, float %82)
  %84 = tail call float @llvm.fmuladd.f32(float %18, float %76, float %83)
  %85 = tail call i32 @air.convert.s.i32.f.f32(float %84) #2
  %86 = icmp slt i32 %73, %7
  %87 = icmp sgt i32 %85, -1
  %88 = select i1 %86, i1 %87, i1 false
  %89 = icmp slt i32 %85, %8
  %90 = select i1 %88, i1 %89, i1 false
  br i1 %90, label %91, label %100

91:                                               ; preds = %75
  %92 = add nsw i32 %45, 1
  %93 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %51, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %94 = extractvalue { <4 x float>, i8 } %93, 0
  %95 = extractelement <4 x float> %94, i64 0
  %96 = load float, float addrspace(2)* %42, align 4, !tbaa !53, !alias.scope !36, !noalias !37
  %97 = fcmp ogt float %95, %96
  %98 = zext i1 %97 to i32
  %99 = add nsw i32 %46, %98
  br label %100

100:                                              ; preds = %91, %75, %56, %43
  %101 = phi i32 [ %46, %43 ], [ %99, %91 ], [ %46, %75 ], [ %46, %56 ]
  %102 = phi i32 [ %45, %43 ], [ %92, %91 ], [ %45, %75 ], [ %45, %56 ]
  %103 = phi i32 [ %44, %43 ], [ %61, %91 ], [ %61, %75 ], [ %61, %56 ]
  %104 = add nuw nsw i32 %47, 1
  %105 = icmp eq i32 %104, %7
  br i1 %105, label %230, label %43, !llvm.loop !54

106:                                              ; preds = %10
  %107 = tail call float @air.convert.f.f32.s.i32(i32 %6) #2
  %108 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 2
  %109 = load float, float addrspace(2)* %108, align 4, !tbaa !38, !alias.scope !36, !noalias !37
  %110 = fsub float %107, %109
  %111 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 8
  %112 = load float, float addrspace(2)* %111, align 4, !tbaa !39, !alias.scope !36, !noalias !37
  %113 = fmul float %110, %112
  %114 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 10
  %115 = load float, float addrspace(2)* %114, align 4, !tbaa !40, !alias.scope !36, !noalias !37
  %116 = fmul float %110, %115
  %117 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 6
  %118 = load float, float addrspace(2)* %117, align 4, !tbaa !41, !alias.scope !36, !noalias !37
  %119 = fadd float %107, %118
  %120 = icmp sgt i32 %7, 0
  br i1 %120, label %121, label %230

121:                                              ; preds = %106
  %122 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 4
  %123 = load i32, i32 addrspace(2)* %122, align 4, !tbaa !42, !alias.scope !36, !noalias !37
  %124 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 1
  %125 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 5
  %126 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 7
  %127 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 9
  %128 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 3
  br label %129

129:                                              ; preds = %172, %121
  %130 = phi i32 [ 0, %121 ], [ %175, %172 ]
  %131 = phi i32 [ 0, %121 ], [ %174, %172 ]
  %132 = phi i32 [ 0, %121 ], [ %173, %172 ]
  %133 = phi i32 [ 0, %121 ], [ %176, %172 ]
  %134 = tail call float @air.convert.f.f32.s.i32(i32 %133) #2
  %135 = insertelement <2 x float> undef, float %134, i64 0
  %136 = insertelement <2 x float> %135, float %107, i64 1
  %137 = fadd <2 x float> %136, <float 5.000000e-01, float 5.000000e-01>
  %138 = tail call { <4 x i32>, i8 } @air.sample_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %137, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %139 = extractvalue { <4 x i32>, i8 } %138, 0
  %140 = extractelement <4 x i32> %139, i64 0
  %141 = icmp eq i32 %140, %123
  br i1 %141, label %142, label %172

142:                                              ; preds = %129
  %143 = load float, float addrspace(2)* %124, align 4, !tbaa !43, !alias.scope !36, !noalias !37
  %144 = fsub float %134, %143
  %145 = add nsw i32 %130, 1
  %146 = load float, float addrspace(2)* %125, align 4, !tbaa !44, !alias.scope !36, !noalias !37
  %147 = load float, float addrspace(2)* %126, align 4, !tbaa !45, !alias.scope !36, !noalias !37
  %148 = tail call float @llvm.fmuladd.f32(float %144, float %147, float %146)
  %149 = fadd float %113, %148
  %150 = fadd float %134, %149
  %151 = tail call i32 @air.convert.s.i32.f.f32(float %150) #2
  %152 = icmp sgt i32 %151, -1
  br i1 %152, label %153, label %172

153:                                              ; preds = %142
  %154 = load float, float addrspace(2)* %127, align 4, !tbaa !52, !alias.scope !36, !noalias !37
  %155 = tail call float @llvm.fmuladd.f32(float %144, float %154, float %119)
  %156 = fadd float %116, %155
  %157 = tail call i32 @air.convert.s.i32.f.f32(float %156) #2
  %158 = icmp slt i32 %151, %7
  %159 = icmp sgt i32 %157, -1
  %160 = select i1 %158, i1 %159, i1 false
  %161 = icmp slt i32 %157, %8
  %162 = select i1 %160, i1 %161, i1 false
  br i1 %162, label %163, label %172

163:                                              ; preds = %153
  %164 = add nsw i32 %131, 1
  %165 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %137, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %166 = extractvalue { <4 x float>, i8 } %165, 0
  %167 = extractelement <4 x float> %166, i64 0
  %168 = load float, float addrspace(2)* %128, align 4, !tbaa !53, !alias.scope !36, !noalias !37
  %169 = fcmp ogt float %167, %168
  %170 = zext i1 %169 to i32
  %171 = add nsw i32 %132, %170
  br label %172

172:                                              ; preds = %163, %153, %142, %129
  %173 = phi i32 [ %132, %129 ], [ %171, %163 ], [ %132, %153 ], [ %132, %142 ]
  %174 = phi i32 [ %131, %129 ], [ %164, %163 ], [ %131, %153 ], [ %131, %142 ]
  %175 = phi i32 [ %130, %129 ], [ %145, %163 ], [ %145, %153 ], [ %145, %142 ]
  %176 = add nuw nsw i32 %133, 1
  %177 = icmp eq i32 %176, %7
  br i1 %177, label %230, label %129, !llvm.loop !56

178:                                              ; preds = %10
  %179 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 6
  %180 = load float, float addrspace(2)* %179, align 4, !tbaa !41, !alias.scope !36, !noalias !37
  %181 = tail call float @air.convert.f.f32.s.i32(i32 %6) #2
  %182 = fadd float %180, %181
  %183 = icmp sgt i32 %7, 0
  br i1 %183, label %184, label %230

184:                                              ; preds = %178
  %185 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 4
  %186 = load i32, i32 addrspace(2)* %185, align 4, !tbaa !42, !alias.scope !36, !noalias !37
  %187 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 5
  %188 = getelementptr inbounds %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", %"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)* %0, i64 0, i32 3
  br label %189

189:                                              ; preds = %224, %184
  %190 = phi i32 [ 0, %184 ], [ %227, %224 ]
  %191 = phi i32 [ 0, %184 ], [ %226, %224 ]
  %192 = phi i32 [ 0, %184 ], [ %225, %224 ]
  %193 = phi i32 [ 0, %184 ], [ %228, %224 ]
  %194 = tail call float @air.convert.f.f32.s.i32(i32 %193) #2
  %195 = insertelement <2 x float> undef, float %194, i64 0
  %196 = insertelement <2 x float> %195, float %181, i64 1
  %197 = fadd <2 x float> %196, <float 5.000000e-01, float 5.000000e-01>
  %198 = tail call { <4 x i32>, i8 } @air.sample_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %197, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %199 = extractvalue { <4 x i32>, i8 } %198, 0
  %200 = extractelement <4 x i32> %199, i64 0
  %201 = icmp eq i32 %200, %186
  br i1 %201, label %202, label %224

202:                                              ; preds = %189
  %203 = add nsw i32 %190, 1
  %204 = load float, float addrspace(2)* %187, align 4, !tbaa !44, !alias.scope !36, !noalias !37
  %205 = fadd float %194, %204
  %206 = tail call i32 @air.convert.s.i32.f.f32(float %205) #2
  %207 = icmp sgt i32 %206, -1
  br i1 %207, label %208, label %224

208:                                              ; preds = %202
  %209 = tail call i32 @air.convert.s.i32.f.f32(float %182) #2
  %210 = icmp slt i32 %206, %7
  %211 = icmp sgt i32 %209, -1
  %212 = select i1 %210, i1 %211, i1 false
  %213 = icmp slt i32 %209, %8
  %214 = select i1 %212, i1 %213, i1 false
  br i1 %214, label %215, label %224

215:                                              ; preds = %208
  %216 = add nsw i32 %191, 1
  %217 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast (i64 addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %197, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #1
  %218 = extractvalue { <4 x float>, i8 } %217, 0
  %219 = extractelement <4 x float> %218, i64 0
  %220 = load float, float addrspace(2)* %188, align 4, !tbaa !53, !alias.scope !36, !noalias !37
  %221 = fcmp ogt float %219, %220
  %222 = zext i1 %221 to i32
  %223 = add nsw i32 %192, %222
  br label %224

224:                                              ; preds = %215, %208, %202, %189
  %225 = phi i32 [ %192, %189 ], [ %223, %215 ], [ %192, %208 ], [ %192, %202 ]
  %226 = phi i32 [ %191, %189 ], [ %216, %215 ], [ %191, %208 ], [ %191, %202 ]
  %227 = phi i32 [ %190, %189 ], [ %203, %215 ], [ %203, %208 ], [ %203, %202 ]
  %228 = add nuw nsw i32 %193, 1
  %229 = icmp eq i32 %228, %7
  br i1 %229, label %230, label %189, !llvm.loop !57

230:                                              ; preds = %224, %178, %172, %106, %100, %13, %10
  %231 = phi i32 [ 0, %10 ], [ 0, %13 ], [ 0, %106 ], [ 0, %178 ], [ %101, %100 ], [ %173, %172 ], [ %225, %224 ]
  %232 = phi i32 [ 0, %10 ], [ 0, %13 ], [ 0, %106 ], [ 0, %178 ], [ %102, %100 ], [ %174, %172 ], [ %226, %224 ]
  %233 = phi i32 [ 0, %10 ], [ 0, %13 ], [ 0, %106 ], [ 0, %178 ], [ %103, %100 ], [ %175, %172 ], [ %227, %224 ]
  %234 = insertelement <4 x i32> <i32 undef, i32 undef, i32 undef, i32 0>, i32 %233, i64 0
  %235 = insertelement <4 x i32> %234, i32 %231, i64 1
  %236 = insertelement <4 x i32> %235, i32 %232, i64 2
  %237 = sext i32 %6 to i64
  %238 = getelementptr inbounds <4 x i32>, <4 x i32> addrspace(1)* %4, i64 %237
  store <4 x i32> %236, <4 x i32> addrspace(1)* %238, align 16, !tbaa !58, !alias.scope !59, !noalias !60
  br label %239

239:                                              ; preds = %230, %5
  ret void
}

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare i32 @air.convert.s.i32.f.f32(float) local_unnamed_addr #2

; Function Attrs: argmemonly convergent nounwind readonly
declare { <4 x i32>, i8 } @air.sample_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #2

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare float @llvm.fmuladd.f32(float, float, float) #3

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #4

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #4

attributes #0 = { convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly convergent nounwind readonly }
attributes #2 = { nounwind readnone }
attributes #3 = { nocallback nofree nosync nounwind readnone speculatable willreturn }
attributes #4 = { argmemonly nounwind readonly }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7}
!llvm.ident = !{!8}
!air.version = !{!9}
!air.language_version = !{!10}
!air.compile_options = !{!11, !12, !13}
!air.kernel = !{!14}
!air.sampler_states = !{!23}

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
!14 = !{void (%"struct.soMOMotionEstimation::soMOMotionEstimation_numWtSum_params" addrspace(2)*, <2 x i32>, %struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, <4 x i32> addrspace(1)*)* @"soMOMotionEstimation::soMOMotionEstimation_numWtSum", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 68, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"soMOMotionEstimation::soMOMotionEstimation_numWtSum_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_order", i32 4, i32 4, i32 0, !"float", !"m_xg", i32 8, i32 4, i32 0, !"float", !"m_yg", i32 12, i32 4, i32 0, !"float", !"m_threshold", i32 16, i32 4, i32 0, !"uint", !"m_label", i32 20, i32 4, i32 0, !"float", !"m_tx", i32 24, i32 4, i32 0, !"float", !"m_ty", i32 28, i32 4, i32 0, !"float", !"m_a", i32 32, i32 4, i32 0, !"float", !"m_b", i32 36, i32 4, i32 0, !"float", !"m_c", i32 40, i32 4, i32 0, !"float", !"m_d", i32 44, i32 4, i32 0, !"float", !"m_q1", i32 48, i32 4, i32 0, !"float", !"m_q2", i32 52, i32 4, i32 0, !"float", !"m_q3", i32 56, i32 4, i32 0, !"float", !"m_q4", i32 60, i32 4, i32 0, !"float", !"m_q5", i32 64, i32 4, i32 0, !"float", !"m_q6"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord_"}
!20 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"weight"}
!21 = !{i32 3, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<uint, sample>", !"air.arg_name", !"matte"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"int4", !"air.arg_name", !"numPt"}
!23 = !{!"air.sampler_state", i64 addrspace(2)* @__air_sampler_state}
!24 = !{!25}
!25 = distinct !{!25, !26, !"air-alias-scope-textures"}
!26 = distinct !{!26, !"air-alias-scopes(soMOMotionEstimation::soMOMotionEstimation_numWtSum)"}
!27 = !{!28, !29}
!28 = distinct !{!28, !26, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !26, !"air-alias-scope-arg(4)"}
!30 = !{!31, !32, i64 0}
!31 = !{!"_ZTSN20soMOMotionEstimation36soMOMotionEstimation_numWtSum_paramsE", !32, i64 0, !35, i64 4, !35, i64 8, !35, i64 12, !32, i64 16, !35, i64 20, !35, i64 24, !35, i64 28, !35, i64 32, !35, i64 36, !35, i64 40, !35, i64 44, !35, i64 48, !35, i64 52, !35, i64 56, !35, i64 60, !35, i64 64}
!32 = !{!"int", !33, i64 0}
!33 = !{!"omnipotent char", !34, i64 0}
!34 = !{!"Simple C++ TBAA"}
!35 = !{!"float", !33, i64 0}
!36 = !{!28}
!37 = !{!25, !29}
!38 = !{!31, !35, i64 8}
!39 = !{!31, !35, i64 32}
!40 = !{!31, !35, i64 40}
!41 = !{!31, !35, i64 24}
!42 = !{!31, !32, i64 16}
!43 = !{!31, !35, i64 4}
!44 = !{!31, !35, i64 20}
!45 = !{!31, !35, i64 28}
!46 = !{!31, !35, i64 44}
!47 = !{!31, !35, i64 48}
!48 = !{!31, !35, i64 52}
!49 = !{!31, !35, i64 64}
!50 = !{!31, !35, i64 60}
!51 = !{!31, !35, i64 56}
!52 = !{!31, !35, i64 36}
!53 = !{!31, !35, i64 12}
!54 = distinct !{!54, !55}
!55 = !{!"llvm.loop.mustprogress"}
!56 = distinct !{!56, !55}
!57 = distinct !{!57, !55}
!58 = !{!33, !33, i64 0}
!59 = !{!29}
!60 = !{!28, !25}
