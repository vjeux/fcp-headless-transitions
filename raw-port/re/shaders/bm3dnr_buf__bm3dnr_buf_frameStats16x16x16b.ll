0x00000000028e1d -- bm3dnr_buf::bm3dnr_buf_frameStats16x16x16b:
source_filename = "bm3dnr_buf::bm3dnr_buf_frameStats16x16x16b"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" = type { i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly nounwind
define void @"bm3dnr_buf::bm3dnr_buf_frameStats16x16x16b"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, i32 addrspace(1)* nocapture "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = alloca [64 x <4 x i32>], align 16
  %7 = extractelement <2 x i32> %1, i64 0
  %8 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 3
  %9 = load i32, i32 addrspace(2)* %8, align 4, !tbaa !23, !alias.scope !28, !noalias !31
  %10 = icmp ult i32 %7, %9
  br i1 %10, label %11, label %354

11:                                               ; preds = %5
  %12 = extractelement <2 x i32> %1, i64 1
  %13 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 4
  %14 = load i32, i32 addrspace(2)* %13, align 4, !tbaa !35, !alias.scope !28, !noalias !31
  %15 = icmp ult i32 %12, %14
  br i1 %15, label %16, label %354

16:                                               ; preds = %11
  %17 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 0
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !36, !alias.scope !28, !noalias !31
  %19 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 1
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !37, !alias.scope !28, !noalias !31
  %21 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 2
  %22 = load i32, i32 addrspace(2)* %21, align 4, !tbaa !38, !alias.scope !28, !noalias !31
  %23 = zext i32 %7 to i64
  %24 = zext i32 %12 to i64
  %25 = shl nuw nsw i64 %23, 2
  %26 = shl nuw nsw i64 %24, 4
  %27 = bitcast [64 x <4 x i32>]* %6 to i8*
  call void @llvm.lifetime.start.p0i8(i64 1024, i8* nonnull %27) #3
  %28 = sext i32 %18 to i64
  %29 = trunc i32 %22 to i16
  %30 = insertelement <4 x i16> undef, i16 %29, i64 0
  %31 = and <4 x i16> %30, <i16 15, i16 undef, i16 undef, i16 undef>
  %32 = shufflevector <4 x i16> %31, <4 x i16> undef, <4 x i32> zeroinitializer
  br label %33

33:                                               ; preds = %45, %16
  %34 = phi <4 x i32> [ zeroinitializer, %16 ], [ %68, %45 ]
  %35 = phi <4 x i32> [ zeroinitializer, %16 ], [ %70, %45 ]
  %36 = phi <4 x i32> [ zeroinitializer, %16 ], [ %75, %45 ]
  %37 = phi <4 x i32> [ zeroinitializer, %16 ], [ %71, %45 ]
  %38 = phi <4 x i32> [ zeroinitializer, %16 ], [ %73, %45 ]
  %39 = phi i32 [ 0, %16 ], [ %46, %45 ]
  %40 = zext i32 %39 to i64
  %41 = add nuw nsw i64 %26, %40
  %42 = mul i64 %41, %28
  %43 = shl nsw i32 %39, 2
  %44 = add i64 %42, %25
  br label %48

45:                                               ; preds = %48
  %46 = add nuw nsw i32 %39, 1
  %47 = icmp eq i32 %46, 16
  br i1 %47, label %78, label %33, !llvm.loop !39

48:                                               ; preds = %48, %33
  %49 = phi <4 x i32> [ %34, %33 ], [ %68, %48 ]
  %50 = phi <4 x i32> [ %35, %33 ], [ %70, %48 ]
  %51 = phi <4 x i32> [ %36, %33 ], [ %75, %48 ]
  %52 = phi <4 x i32> [ %37, %33 ], [ %71, %48 ]
  %53 = phi <4 x i32> [ %38, %33 ], [ %73, %48 ]
  %54 = phi i32 [ 0, %33 ], [ %76, %48 ]
  %55 = zext i32 %54 to i64
  %56 = add i64 %44, %55
  %57 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %56
  %58 = load <4 x i16>, <4 x i16> addrspace(1)* %57, align 8, !tbaa !41, !alias.scope !42, !noalias !43
  %59 = lshr <4 x i16> %58, %32
  %60 = tail call <4 x i32> @air.convert.s.v4i32.u.v4i16(<4 x i16> %59) #1
  %61 = add nuw nsw i32 %54, %43
  %62 = zext i32 %61 to i64
  %63 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %62
  store <4 x i32> %60, <4 x i32>* %63, align 16, !tbaa !41
  %64 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %3, i64 %56
  %65 = load <4 x i16>, <4 x i16> addrspace(1)* %64, align 8, !tbaa !41, !alias.scope !44, !noalias !45
  %66 = lshr <4 x i16> %65, %32
  %67 = tail call <4 x i32> @air.convert.s.v4i32.u.v4i16(<4 x i16> %66) #1
  %68 = add <4 x i32> %60, %49
  %69 = mul <4 x i32> %60, %60
  %70 = add <4 x i32> %69, %50
  %71 = add <4 x i32> %67, %52
  %72 = mul <4 x i32> %67, %67
  %73 = add <4 x i32> %72, %53
  %74 = mul <4 x i32> %67, %60
  %75 = add <4 x i32> %74, %51
  %76 = add nuw nsw i32 %54, 1
  %77 = icmp eq i32 %76, 4
  br i1 %77, label %45, label %48, !llvm.loop !46

78:                                               ; preds = %88, %45
  %79 = phi i32 [ %89, %88 ], [ 0, %45 ]
  %80 = phi i32 [ %140, %88 ], [ 0, %45 ]
  %81 = phi i32 [ %132, %88 ], [ 0, %45 ]
  %82 = shl nuw nsw i32 %79, 2
  %83 = or i32 %82, 4
  %84 = or i32 %82, 8
  %85 = or i32 %82, 12
  br label %91

86:                                               ; preds = %88
  %87 = add nsw i32 %132, 8
  br label %143

88:                                               ; preds = %91
  %89 = add nuw nsw i32 %79, 4
  %90 = icmp ult i32 %79, 12
  br i1 %90, label %78, label %86, !llvm.loop !47

91:                                               ; preds = %91, %78
  %92 = phi i32 [ 0, %78 ], [ %141, %91 ]
  %93 = phi i32 [ %80, %78 ], [ %140, %91 ]
  %94 = phi i32 [ %81, %78 ], [ %132, %91 ]
  %95 = add nuw nsw i32 %92, %82
  %96 = zext i32 %95 to i64
  %97 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %96
  %98 = load <4 x i32>, <4 x i32>* %97, align 16, !tbaa !41
  %99 = add nuw nsw i32 %83, %92
  %100 = zext i32 %99 to i64
  %101 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %100
  %102 = load <4 x i32>, <4 x i32>* %101, align 16, !tbaa !41
  %103 = add <4 x i32> %102, %98
  %104 = add nuw nsw i32 %84, %92
  %105 = zext i32 %104 to i64
  %106 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %105
  %107 = load <4 x i32>, <4 x i32>* %106, align 16, !tbaa !41
  %108 = add <4 x i32> %103, %107
  %109 = add nuw nsw i32 %85, %92
  %110 = zext i32 %109 to i64
  %111 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %110
  %112 = load <4 x i32>, <4 x i32>* %111, align 16, !tbaa !41
  %113 = add <4 x i32> %108, %112
  %114 = extractelement <4 x i32> %113, i64 0
  %115 = extractelement <4 x i32> %113, i64 1
  %116 = extractelement <4 x i32> %113, i64 2
  %117 = extractelement <4 x i32> %113, i64 3
  %118 = add i32 %115, 8
  %119 = add i32 %118, %114
  %120 = add i32 %119, %116
  %121 = add i32 %120, %117
  %122 = ashr i32 %121, 4
  %123 = insertelement <4 x i32> undef, i32 %122, i64 0
  %124 = shufflevector <4 x i32> %123, <4 x i32> undef, <4 x i32> zeroinitializer
  %125 = tail call <4 x i32> @air.abs_diff.s.v4i32(<4 x i32> %98, <4 x i32> %124) #1
  %126 = tail call <4 x i32> @air.abs_diff.s.v4i32(<4 x i32> %102, <4 x i32> %124) #1
  %127 = add <4 x i32> %126, %125
  %128 = tail call <4 x i32> @air.abs_diff.s.v4i32(<4 x i32> %107, <4 x i32> %124) #1
  %129 = add <4 x i32> %127, %128
  %130 = tail call <4 x i32> @air.abs_diff.s.v4i32(<4 x i32> %112, <4 x i32> %124) #1
  %131 = add <4 x i32> %129, %130
  %132 = add nsw i32 %122, %94
  %133 = extractelement <4 x i32> %131, i64 0
  %134 = extractelement <4 x i32> %131, i64 1
  %135 = extractelement <4 x i32> %131, i64 2
  %136 = extractelement <4 x i32> %131, i64 3
  %137 = add i32 %134, %93
  %138 = add i32 %137, %133
  %139 = add i32 %138, %135
  %140 = add i32 %139, %136
  %141 = add nuw nsw i32 %92, 1
  %142 = icmp eq i32 %141, 4
  br i1 %142, label %88, label %91, !llvm.loop !48

143:                                              ; preds = %203, %86
  %144 = phi i1 [ true, %86 ], [ false, %203 ]
  %145 = phi i32 [ 0, %86 ], [ 32, %203 ]
  %146 = phi i32 [ 16320, %86 ], [ %353, %203 ]
  %147 = or i32 %145, 4
  %148 = or i32 %145, 8
  %149 = or i32 %145, 12
  %150 = or i32 %145, 16
  %151 = or i32 %145, 20
  %152 = or i32 %145, 24
  %153 = or i32 %145, 28
  br label %204

154:                                              ; preds = %203
  %155 = ashr i32 %87, 4
  %156 = shl nuw nsw i64 %23, 3
  %157 = getelementptr inbounds i32, i32 addrspace(1)* %4, i64 %156
  %158 = sext i32 %20 to i64
  %159 = mul nsw i64 %158, %24
  %160 = getelementptr inbounds i32, i32 addrspace(1)* %157, i64 %159
  store i32 %140, i32 addrspace(1)* %160, align 4, !tbaa !49, !alias.scope !50, !noalias !51
  %161 = getelementptr inbounds i32, i32 addrspace(1)* %160, i64 1
  store i32 %155, i32 addrspace(1)* %161, align 4, !tbaa !49, !alias.scope !50, !noalias !51
  %162 = extractelement <4 x i32> %68, i64 0
  %163 = extractelement <4 x i32> %68, i64 1
  %164 = add nsw i32 %162, %163
  %165 = extractelement <4 x i32> %68, i64 2
  %166 = add nsw i32 %164, %165
  %167 = extractelement <4 x i32> %68, i64 3
  %168 = add nsw i32 %166, %167
  %169 = getelementptr inbounds i32, i32 addrspace(1)* %160, i64 2
  store i32 %168, i32 addrspace(1)* %169, align 4, !tbaa !49, !alias.scope !50, !noalias !51
  %170 = extractelement <4 x i32> %71, i64 0
  %171 = extractelement <4 x i32> %71, i64 1
  %172 = add nsw i32 %170, %171
  %173 = extractelement <4 x i32> %71, i64 2
  %174 = add nsw i32 %172, %173
  %175 = extractelement <4 x i32> %71, i64 3
  %176 = add nsw i32 %174, %175
  %177 = getelementptr inbounds i32, i32 addrspace(1)* %160, i64 3
  store i32 %176, i32 addrspace(1)* %177, align 4, !tbaa !49, !alias.scope !50, !noalias !51
  %178 = extractelement <4 x i32> %70, i64 0
  %179 = extractelement <4 x i32> %70, i64 1
  %180 = add nsw i32 %178, %179
  %181 = extractelement <4 x i32> %70, i64 2
  %182 = add nsw i32 %180, %181
  %183 = extractelement <4 x i32> %70, i64 3
  %184 = add nsw i32 %182, %183
  %185 = getelementptr inbounds i32, i32 addrspace(1)* %160, i64 4
  store i32 %184, i32 addrspace(1)* %185, align 4, !tbaa !49, !alias.scope !50, !noalias !51
  %186 = extractelement <4 x i32> %73, i64 0
  %187 = extractelement <4 x i32> %73, i64 1
  %188 = add nsw i32 %186, %187
  %189 = extractelement <4 x i32> %73, i64 2
  %190 = add nsw i32 %188, %189
  %191 = extractelement <4 x i32> %73, i64 3
  %192 = add nsw i32 %190, %191
  %193 = getelementptr inbounds i32, i32 addrspace(1)* %160, i64 5
  store i32 %192, i32 addrspace(1)* %193, align 4, !tbaa !49, !alias.scope !50, !noalias !51
  %194 = extractelement <4 x i32> %75, i64 0
  %195 = extractelement <4 x i32> %75, i64 1
  %196 = add nsw i32 %194, %195
  %197 = extractelement <4 x i32> %75, i64 2
  %198 = add nsw i32 %196, %197
  %199 = extractelement <4 x i32> %75, i64 3
  %200 = add nsw i32 %198, %199
  %201 = getelementptr inbounds i32, i32 addrspace(1)* %160, i64 6
  store i32 %200, i32 addrspace(1)* %201, align 4, !tbaa !49, !alias.scope !50, !noalias !51
  %202 = getelementptr inbounds i32, i32 addrspace(1)* %160, i64 7
  store i32 %353, i32 addrspace(1)* %202, align 4, !tbaa !49, !alias.scope !50, !noalias !51
  call void @llvm.lifetime.end.p0i8(i64 1024, i8* nonnull %27) #3
  br label %354

203:                                              ; preds = %204
  br i1 %144, label %143, label %154, !llvm.loop !52

204:                                              ; preds = %204, %143
  %205 = phi i1 [ true, %143 ], [ false, %204 ]
  %206 = phi i32 [ 0, %143 ], [ 2, %204 ]
  %207 = phi i32 [ %146, %143 ], [ %353, %204 ]
  %208 = or i32 %206, %145
  %209 = zext i32 %208 to i64
  %210 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %209
  %211 = load <4 x i32>, <4 x i32>* %210, align 16, !tbaa !41
  %212 = or i32 %206, %147
  %213 = zext i32 %212 to i64
  %214 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %213
  %215 = load <4 x i32>, <4 x i32>* %214, align 16, !tbaa !41
  %216 = add <4 x i32> %215, %211
  %217 = or i32 %206, %148
  %218 = zext i32 %217 to i64
  %219 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %218
  %220 = load <4 x i32>, <4 x i32>* %219, align 16, !tbaa !41
  %221 = add <4 x i32> %216, %220
  %222 = or i32 %206, %149
  %223 = zext i32 %222 to i64
  %224 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %223
  %225 = load <4 x i32>, <4 x i32>* %224, align 16, !tbaa !41
  %226 = add <4 x i32> %221, %225
  %227 = or i32 %206, %150
  %228 = zext i32 %227 to i64
  %229 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %228
  %230 = load <4 x i32>, <4 x i32>* %229, align 16, !tbaa !41
  %231 = add <4 x i32> %226, %230
  %232 = or i32 %206, %151
  %233 = zext i32 %232 to i64
  %234 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %233
  %235 = load <4 x i32>, <4 x i32>* %234, align 16, !tbaa !41
  %236 = add <4 x i32> %231, %235
  %237 = or i32 %206, %152
  %238 = zext i32 %237 to i64
  %239 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %238
  %240 = load <4 x i32>, <4 x i32>* %239, align 16, !tbaa !41
  %241 = add <4 x i32> %236, %240
  %242 = or i32 %206, %153
  %243 = zext i32 %242 to i64
  %244 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %243
  %245 = load <4 x i32>, <4 x i32>* %244, align 16, !tbaa !41
  %246 = add <4 x i32> %241, %245
  %247 = or i32 %208, 1
  %248 = zext i32 %247 to i64
  %249 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %248
  %250 = load <4 x i32>, <4 x i32>* %249, align 16, !tbaa !41
  %251 = add <4 x i32> %246, %250
  %252 = or i32 %212, 1
  %253 = zext i32 %252 to i64
  %254 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %253
  %255 = load <4 x i32>, <4 x i32>* %254, align 16, !tbaa !41
  %256 = add <4 x i32> %251, %255
  %257 = or i32 %217, 1
  %258 = zext i32 %257 to i64
  %259 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %258
  %260 = load <4 x i32>, <4 x i32>* %259, align 16, !tbaa !41
  %261 = add <4 x i32> %256, %260
  %262 = or i32 %222, 1
  %263 = zext i32 %262 to i64
  %264 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %263
  %265 = load <4 x i32>, <4 x i32>* %264, align 16, !tbaa !41
  %266 = add <4 x i32> %261, %265
  %267 = or i32 %227, 1
  %268 = zext i32 %267 to i64
  %269 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %268
  %270 = load <4 x i32>, <4 x i32>* %269, align 16, !tbaa !41
  %271 = add <4 x i32> %266, %270
  %272 = or i32 %232, 1
  %273 = zext i32 %272 to i64
  %274 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %273
  %275 = load <4 x i32>, <4 x i32>* %274, align 16, !tbaa !41
  %276 = add <4 x i32> %271, %275
  %277 = or i32 %237, 1
  %278 = zext i32 %277 to i64
  %279 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %278
  %280 = load <4 x i32>, <4 x i32>* %279, align 16, !tbaa !41
  %281 = add <4 x i32> %276, %280
  %282 = or i32 %242, 1
  %283 = zext i32 %282 to i64
  %284 = getelementptr inbounds [64 x <4 x i32>], [64 x <4 x i32>]* %6, i64 0, i64 %283
  %285 = load <4 x i32>, <4 x i32>* %284, align 16, !tbaa !41
  %286 = add <4 x i32> %281, %285
  %287 = extractelement <4 x i32> %286, i64 0
  %288 = extractelement <4 x i32> %286, i64 1
  %289 = extractelement <4 x i32> %286, i64 2
  %290 = extractelement <4 x i32> %286, i64 3
  %291 = add i32 %288, 32
  %292 = add i32 %291, %287
  %293 = add i32 %292, %289
  %294 = add i32 %293, %290
  %295 = ashr i32 %294, 6
  %296 = insertelement <4 x i32> undef, i32 %295, i64 0
  %297 = shufflevector <4 x i32> %296, <4 x i32> undef, <4 x i32> zeroinitializer
  %298 = sub <4 x i32> %211, %297
  %299 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %298) #1
  %300 = sub <4 x i32> %215, %297
  %301 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %300) #1
  %302 = add <4 x i32> %301, %299
  %303 = sub <4 x i32> %220, %297
  %304 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %303) #1
  %305 = add <4 x i32> %302, %304
  %306 = sub <4 x i32> %225, %297
  %307 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %306) #1
  %308 = add <4 x i32> %305, %307
  %309 = sub <4 x i32> %230, %297
  %310 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %309) #1
  %311 = add <4 x i32> %308, %310
  %312 = sub <4 x i32> %235, %297
  %313 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %312) #1
  %314 = add <4 x i32> %311, %313
  %315 = sub <4 x i32> %240, %297
  %316 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %315) #1
  %317 = add <4 x i32> %314, %316
  %318 = sub <4 x i32> %245, %297
  %319 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %318) #1
  %320 = add <4 x i32> %317, %319
  %321 = sub <4 x i32> %250, %297
  %322 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %321) #1
  %323 = add <4 x i32> %320, %322
  %324 = sub <4 x i32> %255, %297
  %325 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %324) #1
  %326 = add <4 x i32> %323, %325
  %327 = sub <4 x i32> %260, %297
  %328 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %327) #1
  %329 = add <4 x i32> %326, %328
  %330 = sub <4 x i32> %265, %297
  %331 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %330) #1
  %332 = add <4 x i32> %329, %331
  %333 = sub <4 x i32> %270, %297
  %334 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %333) #1
  %335 = add <4 x i32> %332, %334
  %336 = sub <4 x i32> %275, %297
  %337 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %336) #1
  %338 = add <4 x i32> %335, %337
  %339 = sub <4 x i32> %280, %297
  %340 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %339) #1
  %341 = add <4 x i32> %338, %340
  %342 = sub <4 x i32> %285, %297
  %343 = tail call <4 x i32> @air.abs.s.v4i32(<4 x i32> %342) #1
  %344 = add <4 x i32> %341, %343
  %345 = extractelement <4 x i32> %344, i64 0
  %346 = extractelement <4 x i32> %344, i64 1
  %347 = add nsw i32 %345, %346
  %348 = extractelement <4 x i32> %344, i64 2
  %349 = add nsw i32 %347, %348
  %350 = extractelement <4 x i32> %344, i64 3
  %351 = add nsw i32 %349, %350
  %352 = icmp slt i32 %207, %351
  %353 = select i1 %352, i32 %207, i32 %351
  br i1 %205, label %204, label %203, !llvm.loop !53

354:                                              ; preds = %154, %11, %5
  ret void
}

; Function Attrs: nounwind readnone
declare <4 x i32> @air.abs.s.v4i32(<4 x i32>) local_unnamed_addr #1

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.end.p0i8(i64 immarg, i8* nocapture) #2

; Function Attrs: nounwind readnone
declare <4 x i32> @air.abs_diff.s.v4i32(<4 x i32>, <4 x i32>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x i32> @air.convert.s.v4i32.u.v4i16(<4 x i16>) local_unnamed_addr #1

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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)*, <2 x i32>, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*, i32 addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_frameStats16x16x16b", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 20, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_frameStats16x16x16b", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_inStride", i32 4, i32 4, i32 0, !"int", !"m_outStride", i32 8, i32 4, i32 0, !"int", !"m_shift", i32 12, i32 4, i32 0, !"uint", !"m_globalWidth", i32 16, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"input"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"inputPrev"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"outputStat"}
!23 = !{!24, !25, i64 12}
!24 = !{!"_ZTSN10bm3dnr_buf30bm3dnr_buf_frameStats16x16x16bE", !25, i64 0, !25, i64 4, !25, i64 8, !25, i64 12, !25, i64 16}
!25 = !{!"int", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(0)"}
!30 = distinct !{!30, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_frameStats16x16x16b)"}
!31 = !{!32, !33, !34}
!32 = distinct !{!32, !30, !"air-alias-scope-arg(2)"}
!33 = distinct !{!33, !30, !"air-alias-scope-arg(3)"}
!34 = distinct !{!34, !30, !"air-alias-scope-arg(4)"}
!35 = !{!24, !25, i64 16}
!36 = !{!24, !25, i64 0}
!37 = !{!24, !25, i64 4}
!38 = !{!24, !25, i64 8}
!39 = distinct !{!39, !40}
!40 = !{!"llvm.loop.mustprogress"}
!41 = !{!26, !26, i64 0}
!42 = !{!32}
!43 = !{!29, !33, !34}
!44 = !{!33}
!45 = !{!29, !32, !34}
!46 = distinct !{!46, !40}
!47 = distinct !{!47, !40}
!48 = distinct !{!48, !40}
!49 = !{!25, !25, i64 0}
!50 = !{!34}
!51 = !{!29, !32, !33}
!52 = distinct !{!52, !40}
!53 = distinct !{!53, !40}

