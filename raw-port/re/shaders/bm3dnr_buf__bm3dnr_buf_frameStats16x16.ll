0x000000000275ed -- bm3dnr_buf::bm3dnr_buf_frameStats16x16:
source_filename = "bm3dnr_buf::bm3dnr_buf_frameStats16x16"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" = type { i32, i32, i32, i32 }

; Function Attrs: argmemonly nounwind
define void @"bm3dnr_buf::bm3dnr_buf_frameStats16x16"(%"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i8> addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, <4 x i8> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, i32 addrspace(1)* nocapture "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = alloca [64 x <4 x i32>], align 16
  %7 = extractelement <2 x i32> %1, i64 0
  %8 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params", %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)* %0, i64 0, i32 2
  %9 = load i32, i32 addrspace(2)* %8, align 4, !tbaa !23, !alias.scope !28, !noalias !31
  %10 = icmp ult i32 %7, %9
  br i1 %10, label %11, label %346

11:                                               ; preds = %5
  %12 = extractelement <2 x i32> %1, i64 1
  %13 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params", %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)* %0, i64 0, i32 3
  %14 = load i32, i32 addrspace(2)* %13, align 4, !tbaa !35, !alias.scope !28, !noalias !31
  %15 = icmp ult i32 %12, %14
  br i1 %15, label %16, label %346

16:                                               ; preds = %11
  %17 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params", %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)* %0, i64 0, i32 0
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !36, !alias.scope !28, !noalias !31
  %19 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params", %"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)* %0, i64 0, i32 1
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !37, !alias.scope !28, !noalias !31
  %21 = zext i32 %7 to i64
  %22 = zext i32 %12 to i64
  %23 = shl nuw nsw i64 %21, 2
  %24 = shl nuw nsw i64 %22, 4
  %25 = bitcast [64 x <4 x i32>]* %6 to i8*
  call void @llvm.lifetime.start.p0i8(i64 1024, i8* nonnull %25) #3
  %26 = sext i32 %18 to i64
  br label %27

27:                                               ; preds = %39, %16
  %28 = phi <4 x i32> [ zeroinitializer, %16 ], [ %60, %39 ]
  %29 = phi <4 x i32> [ zeroinitializer, %16 ], [ %62, %39 ]
  %30 = phi <4 x i32> [ zeroinitializer, %16 ], [ %67, %39 ]
  %31 = phi <4 x i32> [ zeroinitializer, %16 ], [ %63, %39 ]
  %32 = phi <4 x i32> [ zeroinitializer, %16 ], [ %65, %39 ]
  %33 = phi i32 [ 0, %16 ], [ %40, %39 ]
  %34 = zext i32 %33 to i64
  %35 = add nuw nsw i64 %24, %34
  %36 = mul i64 %35, %26
  %37 = shl nsw i32 %33, 2
  %38 = add i64 %36, %23
  br label %42

39:                                               ; preds = %42
  %40 = add nuw nsw i32 %33, 1
  %41 = icmp eq i32 %40, 16
  br i1 %41, label %70, label %27, !llvm.loop !38

42:                                               ; preds = %42, %27
  %43 = phi <4 x i32> [ %28, %27 ], [ %60, %42 ]
  %44 = phi <4 x i32> [ %29, %27 ], [ %62, %42 ]
  %45 = phi <4 x i32> [ %30, %27 ], [ %67, %42 ]
  %46 = phi <4 x i32> [ %31, %27 ], [ %63, %42 ]
  %47 = phi <4 x i32> [ %32, %27 ], [ %65, %42 ]
  %48 = phi i32 [ 0, %27 ], [ %68, %42 ]
  %49 = zext i32 %48 to i64
  %50 = add i64 %38, %49
  %51 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %50
  %52 = load <4 x i8>, <4 x i8> addrspace(1)* %51, align 4, !tbaa !40, !alias.scope !41, !noalias !42
  %53 = tail call <4 x i32> @air.convert.s.v4i32.u.v4i8(<4 x i8> %52) #1
  %54 = add nuw nsw i32 %48, %37
  %55 = zext i32 %54 to i64
  %56 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %55
  store <4 x i32> %53, <4 x i32>* %56, align 16, !tbaa !40
  %57 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %3, i64 %50
  %58 = load <4 x i8>, <4 x i8> addrspace(1)* %57, align 4, !tbaa !40, !alias.scope !43, !noalias !44
  %59 = tail call <4 x i32> @air.convert.s.v4i32.u.v4i8(<4 x i8> %58) #1
  %60 = add <4 x i32> %53, %43
  %61 = mul <4 x i32> %53, %53
  %62 = add <4 x i32> %61, %44
  %63 = add <4 x i32> %59, %46
  %64 = mul <4 x i32> %59, %59
  %65 = add <4 x i32> %64, %47
  %66 = mul <4 x i32> %59, %53
  %67 = add <4 x i32> %66, %45
  %68 = add nuw nsw i32 %48, 1
  %69 = icmp eq i32 %68, 4
  br i1 %69, label %39, label %42, !llvm.loop !45

70:                                               ; preds = %80, %39
  %71 = phi i32 [ %81, %80 ], [ 0, %39 ]
  %72 = phi i32 [ %132, %80 ], [ 0, %39 ]
  %73 = phi i32 [ %124, %80 ], [ 0, %39 ]
  %74 = shl nuw nsw i32 %71, 2
  %75 = or i32 %74, 4
  %76 = or i32 %74, 8
  %77 = or i32 %74, 12
  br label %83

78:                                               ; preds = %80
  %79 = add nsw i32 %124, 8
  br label %135

80:                                               ; preds = %83
  %81 = add nuw nsw i32 %71, 4
  %82 = icmp ult i32 %71, 12
  br i1 %82, label %70, label %78, !llvm.loop !46

83:                                               ; preds = %83, %70
  %84 = phi i32 [ 0, %70 ], [ %133, %83 ]
  %85 = phi i32 [ %72, %70 ], [ %132, %83 ]
  %86 = phi i32 [ %73, %70 ], [ %124, %83 ]
  %87 = add nuw nsw i32 %84, %74
  %88 = zext i32 %87 to i64
  %89 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %88
  %90 = load <4 x i32>, <4 x i32>* %89, align 16, !tbaa !40
  %91 = add nuw nsw i32 %75, %84
  %92 = zext i32 %91 to i64
  %93 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %92
  %94 = load <4 x i32>, <4 x i32>* %93, align 16, !tbaa !40
  %95 = add <4 x i32> %94, %90
  %96 = add nuw nsw i32 %76, %84
  %97 = zext i32 %96 to i64
  %98 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %97
  %99 = load <4 x i32>, <4 x i32>* %98, align 16, !tbaa !40
  %100 = add <4 x i32> %95, %99
  %101 = add nuw nsw i32 %77, %84
  %102 = zext i32 %101 to i64
  %103 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %102
  %104 = load <4 x i32>, <4 x i32>* %103, align 16, !tbaa !40
  %105 = add <4 x i32> %100, %104
  %106 = extractelement <4 x i32> %105, i64 0
  %107 = extractelement <4 x i32> %105, i64 1
  %108 = extractelement <4 x i32> %105, i64 2
  %109 = extractelement <4 x i32> %105, i64 3
  %110 = add i32 %107, 8
  %111 = add i32 %110, %106
  %112 = add i32 %111, %108
  %113 = add i32 %112, %109
  %114 = ashr i32 %113, 4
  %115 = insertelement <4 x i32> undef, i32 %114, i64 0
  %116 = shufflevector <4 x i32> %115, <4 x i32> undef, <4 x i32> zeroinitializer
  %117 = tail call <4 x i32> @air.abs_diff.s.v4i32(<4 x i32> %90, <4 x i32> %116) #1
  %118 = tail call <4 x i32> @air.abs_diff.s.v4i32(<4 x i32> %94, <4 x i32> %116) #1
  %119 = add <4 x i32> %118, %117
  %120 = tail call <4 x i32> @air.abs_diff.s.v4i32(<4 x i32> %99, <4 x i32> %116) #1
  %121 = add <4 x i32> %119, %120
  %122 = tail call <4 x i32> @air.abs_diff.s.v4i32(<4 x i32> %104, <4 x i32> %116) #1
  %123 = add <4 x i32> %121, %122
  %124 = add nsw i32 %114, %86
  %125 = extractelement <4 x i32> %123, i64 0
  %126 = extractelement <4 x i32> %123, i64 1
  %127 = extractelement <4 x i32> %123, i64 2
  %128 = extractelement <4 x i32> %123, i64 3
  %129 = add i32 %126, %85
  %130 = add i32 %129, %125
  %131 = add i32 %130, %127
  %132 = add i32 %131, %128
  %133 = add nuw nsw i32 %84, 1
  %134 = icmp eq i32 %133, 4
  br i1 %134, label %80, label %83, !llvm.loop !47

135:                                              ; preds = %195, %78
  %136 = phi i1 [ true, %78 ], [ false, %195 ]
  %137 = phi i32 [ 0, %78 ], [ 32, %195 ]
  %138 = phi i32 [ 16320, %78 ], [ %345, %195 ]
  %139 = or i32 %137, 4
  %140 = or i32 %137, 8
  %141 = or i32 %137, 12
  %142 = or i32 %137, 16
  %143 = or i32 %137, 20
  %144 = or i32 %137, 24
  %145 = or i32 %137, 28
  br label %196

146:                                              ; preds = %195
  %147 = ashr i32 %79, 4
  %148 = shl nuw nsw i64 %21, 3
  %149 = getelementptr inbounds i32, i32 addrspace(1)* %4, i64 %148
  %150 = sext i32 %20 to i64
  %151 = mul nsw i64 %150, %22
  %152 = getelementptr inbounds i32, i32 addrspace(1)* %149, i64 %151
  store i32 %132, i32 addrspace(1)* %152, align 4, !tbaa !48, !alias.scope !49, !noalias !50
  %153 = getelementptr inbounds i32, i32 addrspace(1)* %152, i64 1
  store i32 %147, i32 addrspace(1)* %153, align 4, !tbaa !48, !alias.scope !49, !noalias !50
  %154 = extractelement <4 x i32> %60, i64 0
  %155 = extractelement <4 x i32> %60, i64 1
  %156 = add nsw i32 %154, %155
  %157 = extractelement <4 x i32> %60, i64 2
  %158 = add nsw i32 %156, %157
  %159 = extractelement <4 x i32> %60, i64 3
  %160 = add nsw i32 %158, %159
  %161 = getelementptr inbounds i32, i32 addrspace(1)* %152, i64 2
  store i32 %160, i32 addrspace(1)* %161, align 4, !tbaa !48, !alias.scope !49, !noalias !50
  %162 = extractelement <4 x i32> %63, i64 0
  %163 = extractelement <4 x i32> %63, i64 1
  %164 = add nsw i32 %162, %163
  %165 = extractelement <4 x i32> %63, i64 2
  %166 = add nsw i32 %164, %165
  %167 = extractelement <4 x i32> %63, i64 3
  %168 = add nsw i32 %166, %167
  %169 = getelementptr inbounds i32, i32 addrspace(1)* %152, i64 3
  store i32 %168, i32 addrspace(1)* %169, align 4, !tbaa !48, !alias.scope !49, !noalias !50
  %170 = extractelement <4 x i32> %62, i64 0
  %171 = extractelement <4 x i32> %62, i64 1
  %172 = add nsw i32 %170, %171
  %173 = extractelement <4 x i32> %62, i64 2
  %174 = add nsw i32 %172, %173
  %175 = extractelement <4 x i32> %62, i64 3
  %176 = add nsw i32 %174, %175
  %177 = getelementptr inbounds i32, i32 addrspace(1)* %152, i64 4
  store i32 %176, i32 addrspace(1)* %177, align 4, !tbaa !48, !alias.scope !49, !noalias !50
  %178 = extractelement <4 x i32> %65, i64 0
  %179 = extractelement <4 x i32> %65, i64 1
  %180 = add nsw i32 %178, %179
  %181 = extractelement <4 x i32> %65, i64 2
  %182 = add nsw i32 %180, %181
  %183 = extractelement <4 x i32> %65, i64 3
  %184 = add nsw i32 %182, %183
  %185 = getelementptr inbounds i32, i32 addrspace(1)* %152, i64 5
  store i32 %184, i32 addrspace(1)* %185, align 4, !tbaa !48, !alias.scope !49, !noalias !50
  %186 = extractelement <4 x i32> %67, i64 0
  %187 = extractelement <4 x i32> %67, i64 1
  %188 = add nsw i32 %186, %187
  %189 = extractelement <4 x i32> %67, i64 2
  %190 = add nsw i32 %188, %189
  %191 = extractelement <4 x i32> %67, i64 3
  %192 = add nsw i32 %190, %191
  %193 = getelementptr inbounds i32, i32 addrspace(1)* %152, i64 6
  store i32 %192, i32 addrspace(1)* %193, align 4, !tbaa !48, !alias.scope !49, !noalias !50
  %194 = getelementptr inbounds i32, i32 addrspace(1)* %152, i64 7
  store i32 %345, i32 addrspace(1)* %194, align 4, !tbaa !48, !alias.scope !49, !noalias !50
  call void @llvm.lifetime.end.p0i8(i64 1024, i8* nonnull %25) #3
  br label %346

195:                                              ; preds = %196
  br i1 %136, label %135, label %146, !llvm.loop !51

196:                                              ; preds = %196, %135
  %197 = phi i1 [ true, %135 ], [ false, %196 ]
  %198 = phi i32 [ 0, %135 ], [ 2, %196 ]
  %199 = phi i32 [ %138, %135 ], [ %345, %196 ]
  %200 = or i32 %198, %137
  %201 = zext i32 %200 to i64
  %202 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %201
  %203 = load <4 x i32>, <4 x i32>* %202, align 16, !tbaa !40
  %204 = or i32 %198, %139
  %205 = zext i32 %204 to i64
  %206 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %205
  %207 = load <4 x i32>, <4 x i32>* %206, align 16, !tbaa !40
  %208 = add <4 x i32> %207, %203
  %209 = or i32 %198, %140
  %210 = zext i32 %209 to i64
  %211 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %210
  %212 = load <4 x i32>, <4 x i32>* %211, align 16, !tbaa !40
  %213 = add <4 x i32> %208, %212
  %214 = or i32 %198, %141
  %215 = zext i32 %214 to i64
  %216 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %215
  %217 = load <4 x i32>, <4 x i32>* %216, align 16, !tbaa !40
  %218 = add <4 x i32> %213, %217
  %219 = or i32 %198, %142
  %220 = zext i32 %219 to i64
  %221 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %220
  %222 = load <4 x i32>, <4 x i32>* %221, align 16, !tbaa !40
  %223 = add <4 x i32> %218, %222
  %224 = or i32 %198, %143
  %225 = zext i32 %224 to i64
  %226 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %225
  %227 = load <4 x i32>, <4 x i32>* %226, align 16, !tbaa !40
  %228 = add <4 x i32> %223, %227
  %229 = or i32 %198, %144
  %230 = zext i32 %229 to i64
  %231 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %230
  %232 = load <4 x i32>, <4 x i32>* %231, align 16, !tbaa !40
  %233 = add <4 x i32> %228, %232
  %234 = or i32 %198, %145
  %235 = zext i32 %234 to i64
  %236 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %235
  %237 = load <4 x i32>, <4 x i32>* %236, align 16, !tbaa !40
  %238 = add <4 x i32> %233, %237
  %239 = or i32 %200, 1
  %240 = zext i32 %239 to i64
  %241 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %240
  %242 = load <4 x i32>, <4 x i32>* %241, align 16, !tbaa !40
  %243 = add <4 x i32> %238, %242
  %244 = or i32 %204, 1
  %245 = zext i32 %244 to i64
  %246 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %245
  %247 = load <4 x i32>, <4 x i32>* %246, align 16, !tbaa !40
  %248 = add <4 x i32> %243, %247
  %249 = or i32 %209, 1
  %250 = zext i32 %249 to i64
  %251 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %250
  %252 = load <4 x i32>, <4 x i32>* %251, align 16, !tbaa !40
  %253 = add <4 x i32> %248, %252
  %254 = or i32 %214, 1
  %255 = zext i32 %254 to i64
  %256 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %255
  %257 = load <4 x i32>, <4 x i32>* %256, align 16, !tbaa !40
  %258 = add <4 x i32> %253, %257
  %259 = or i32 %219, 1
  %260 = zext i32 %259 to i64
  %261 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %260
  %262 = load <4 x i32>, <4 x i32>* %261, align 16, !tbaa !40
  %263 = add <4 x i32> %258, %262
  %264 = or i32 %224, 1
  %265 = zext i32 %264 to i64
  %266 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %265
  %267 = load <4 x i32>, <4 x i32>* %266, align 16, !tbaa !40
  %268 = add <4 x i32> %263, %267
  %269 = or i32 %229, 1
  %270 = zext i32 %269 to i64
  %271 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %270
  %272 = load <4 x i32>, <4 x i32>* %271, align 16, !tbaa !40
  %273 = add <4 x i32> %268, %272
  %274 = or i32 %234, 1
  %275 = zext i32 %274 to i64
  %276 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %275
  %277 = load <4 x i32>, <4 x i32>* %276, align 16, !tbaa !40
  %278 = add <4 x i32> %273, %277
  %279 = extractelement <4 x i32> %278, i64 0
  %280 = extractelement <4 x i32> %278, i64 1
  %281 = extractelement <4 x i32> %278, i64 2
  %282 = extractelement <4 x i32> %278, i64 3
  %283 = add i32 %280, 32
  %284 = add i32 %283, %279
  %285 = add i32 %284, %281
  %286 = add i32 %285, %282
  %287 = ashr i32 %286, 6
  %288 = insertelement <4 x i32> undef, i32 %287, i64 0
  %289 = shufflevector <4 x i32> %288, <4 x i32> undef, <4 x i32> zeroinitializer
  %290 = sub <4 x i32> %203, %289
  %291 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %290) #1
  %292 = sub <4 x i32> %207, %289
  %293 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %292) #1
  %294 = add <4 x i32> %293, %291
  %295 = sub <4 x i32> %212, %289
  %296 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %295) #1
  %297 = add <4 x i32> %294, %296
  %298 = sub <4 x i32> %217, %289
  %299 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %298) #1
  %300 = add <4 x i32> %297, %299
  %301 = sub <4 x i32> %222, %289
  %302 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %301) #1
  %303 = add <4 x i32> %300, %302
  %304 = sub <4 x i32> %227, %289
  %305 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %304) #1
  %306 = add <4 x i32> %303, %305
  %307 = sub <4 x i32> %232, %289
  %308 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %307) #1
  %309 = add <4 x i32> %306, %308
  %310 = sub <4 x i32> %237, %289
  %311 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %310) #1
  %312 = add <4 x i32> %309, %311
  %313 = sub <4 x i32> %242, %289
  %314 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %313) #1
  %315 = add <4 x i32> %312, %314
  %316 = sub <4 x i32> %247, %289
  %317 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %316) #1
  %318 = add <4 x i32> %315, %317
  %319 = sub <4 x i32> %252, %289
  %320 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %319) #1
  %321 = add <4 x i32> %318, %320
  %322 = sub <4 x i32> %257, %289
  %323 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %322) #1
  %324 = add <4 x i32> %321, %323
  %325 = sub <4 x i32> %262, %289
  %326 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %325) #1
  %327 = add <4 x i32> %324, %326
  %328 = sub <4 x i32> %267, %289
  %329 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %328) #1
  %330 = add <4 x i32> %327, %329
  %331 = sub <4 x i32> %272, %289
  %332 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %331) #1
  %333 = add <4 x i32> %330, %332
  %334 = sub <4 x i32> %277, %289
  %335 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %334) #1
  %336 = add <4 x i32> %333, %335
  %337 = extractelement <4 x i32> %336, i64 0
  %338 = extractelement <4 x i32> %336, i64 1
  %339 = add nsw i32 %337, %338
  %340 = extractelement <4 x i32> %336, i64 2
  %341 = add nsw i32 %339, %340
  %342 = extractelement <4 x i32> %336, i64 3
  %343 = add nsw i32 %341, %342
  %344 = icmp slt i32 %199, %343
  %345 = select i1 %344, i32 %199, i32 %343
  br i1 %197, label %196, label %195, !llvm.loop !52

346:                                              ; preds = %146, %11, %5
  ret void
}

; Function Attrs: nounwind readnone
declare <4 x i32> @air.abs.s.v4i32(<4 x i32>) local_unnamed_addr #1

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.end.p0i8(i64 immarg, i8* nocapture) #2

; Function Attrs: nounwind readnone
declare <4 x i32> @air.abs_diff.s.v4i32(<4 x i32>, <4 x i32>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x i32> @air.convert.s.v4i32.u.v4i8(<4 x i8>) local_unnamed_addr #1

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.start.p0i8(i64 immarg, i8* nocapture) #2

attributes #0 = { argmemonly nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { nounwind readnone }
attributes #2 = { argmemonly nocallback nofree nosync nounwind willreturn }
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_frameStats16x16_params" addrspace(2)*, <2 x i32>, <4 x i8> addrspace(1)*, <4 x i8> addrspace(1)*, i32 addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_frameStats16x16", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_frameStats16x16_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_inStride", i32 4, i32 4, i32 0, !"int", !"m_outStride", i32 8, i32 4, i32 0, !"uint", !"m_globalWidth", i32 12, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uchar4", !"air.arg_name", !"input"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uchar4", !"air.arg_name", !"inputPrev"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"outputStat"}
!23 = !{!24, !25, i64 8}
!24 = !{!"_ZTSN10bm3dnr_buf33bm3dnr_buf_frameStats16x16_paramsE", !25, i64 0, !25, i64 4, !25, i64 8, !25, i64 12}
!25 = !{!"int", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(0)"}
!30 = distinct !{!30, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_frameStats16x16)"}
!31 = !{!32, !33, !34}
!32 = distinct !{!32, !30, !"air-alias-scope-arg(2)"}
!33 = distinct !{!33, !30, !"air-alias-scope-arg(3)"}
!34 = distinct !{!34, !30, !"air-alias-scope-arg(4)"}
!35 = !{!24, !25, i64 12}
!36 = !{!24, !25, i64 0}
!37 = !{!24, !25, i64 4}
!38 = distinct !{!38, !39}
!39 = !{!"llvm.loop.mustprogress"}
!40 = !{!26, !26, i64 0}
!41 = !{!32}
!42 = !{!29, !33, !34}
!43 = !{!33}
!44 = !{!29, !32, !34}
!45 = distinct !{!45, !39}
!46 = distinct !{!46, !39}
!47 = distinct !{!47, !39}
!48 = !{!25, !25, i64 0}
!49 = !{!34}
!50 = !{!29, !32, !33}
!51 = distinct !{!51, !39}
!52 = distinct !{!52, !39}

