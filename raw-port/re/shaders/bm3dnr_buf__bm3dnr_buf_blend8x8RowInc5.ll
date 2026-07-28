0x0000000001391d -- bm3dnr_buf::bm3dnr_buf_blend8x8RowInc5:
source_filename = "bm3dnr_buf::bm3dnr_buf_blend8x8RowInc5"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" = type { i32, i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blend8x8RowInc5"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x float> addrspace(1)* nocapture "air-buffer-no-alias" %2, <4 x float> addrspace(1)* readonly "air-buffer-no-alias" %3) local_unnamed_addr #0 {
  %5 = extractelement <2 x i32> %1, i64 0
  %6 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 4
  %7 = load i32, i32 addrspace(2)* %6, align 4, !tbaa !22, !alias.scope !27, !noalias !30
  %8 = icmp ult i32 %5, %7
  br i1 %8, label %9, label %455

9:                                                ; preds = %4
  %10 = extractelement <2 x i32> %1, i64 1
  %11 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 5
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !33, !alias.scope !27, !noalias !30
  %13 = icmp ult i32 %10, %12
  br i1 %13, label %14, label %455

14:                                               ; preds = %9
  %15 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 0
  %16 = load i32, i32 addrspace(2)* %15, align 4, !tbaa !34, !alias.scope !27, !noalias !30
  %17 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 1
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !35, !alias.scope !27, !noalias !30
  %19 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 2
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !36, !alias.scope !27, !noalias !30
  %21 = zext i32 %5 to i64
  %22 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 3
  %23 = load i32, i32 addrspace(2)* %22, align 4, !tbaa !37, !alias.scope !27, !noalias !30
  %24 = add i32 %23, %10
  %25 = zext i32 %24 to i64
  %26 = sext i32 %20 to i64
  %27 = shl nsw i64 %26, 2
  %28 = mul i64 %27, %25
  %29 = shl nuw nsw i64 %21, 1
  %30 = shl nuw nsw i64 %25, 5
  %31 = sext i32 %16 to i64
  %32 = mul i64 %28, %31
  %33 = add i64 %32, %29
  %34 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %33
  %35 = load <4 x float>, <4 x float> addrspace(1)* %34, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %36 = or i64 %33, 1
  %37 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %36
  %38 = load <4 x float>, <4 x float> addrspace(1)* %37, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %39 = or i64 %28, 1
  %40 = mul i64 %39, %31
  %41 = add i64 %40, %29
  %42 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %41
  %43 = load <4 x float>, <4 x float> addrspace(1)* %42, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %44 = add i64 %41, 1
  %45 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %44
  %46 = load <4 x float>, <4 x float> addrspace(1)* %45, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %47 = or i64 %28, 2
  %48 = mul i64 %47, %31
  %49 = add i64 %48, %29
  %50 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %49
  %51 = load <4 x float>, <4 x float> addrspace(1)* %50, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %52 = or i64 %49, 1
  %53 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %52
  %54 = load <4 x float>, <4 x float> addrspace(1)* %53, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %55 = sext i32 %18 to i64
  %56 = mul i64 %30, %55
  %57 = add i64 %56, %29
  %58 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %57
  %59 = load <4 x float>, <4 x float> addrspace(1)* %58, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %60 = or i64 %57, 1
  %61 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %60
  %62 = load <4 x float>, <4 x float> addrspace(1)* %61, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %63 = or i64 %30, 1
  %64 = mul i64 %63, %55
  %65 = add i64 %64, %29
  %66 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %65
  %67 = load <4 x float>, <4 x float> addrspace(1)* %66, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %68 = add i64 %65, 1
  %69 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %68
  %70 = load <4 x float>, <4 x float> addrspace(1)* %69, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %71 = or i64 %30, 2
  %72 = mul i64 %71, %55
  %73 = add i64 %72, %29
  %74 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %73
  %75 = load <4 x float>, <4 x float> addrspace(1)* %74, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %76 = or i64 %73, 1
  %77 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %76
  %78 = load <4 x float>, <4 x float> addrspace(1)* %77, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %79 = or i64 %30, 3
  %80 = mul i64 %79, %55
  %81 = add i64 %80, %29
  %82 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %81
  %83 = load <4 x float>, <4 x float> addrspace(1)* %82, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %84 = add i64 %81, 1
  %85 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %84
  %86 = load <4 x float>, <4 x float> addrspace(1)* %85, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %87 = or i64 %30, 4
  %88 = mul i64 %87, %55
  %89 = add i64 %88, %29
  %90 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %89
  %91 = load <4 x float>, <4 x float> addrspace(1)* %90, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %92 = or i64 %89, 1
  %93 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %92
  %94 = load <4 x float>, <4 x float> addrspace(1)* %93, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %95 = or i64 %30, 5
  %96 = mul i64 %95, %55
  %97 = add i64 %96, %29
  %98 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %97
  %99 = load <4 x float>, <4 x float> addrspace(1)* %98, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %100 = add i64 %97, 1
  %101 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %100
  %102 = load <4 x float>, <4 x float> addrspace(1)* %101, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %103 = or i64 %30, 6
  %104 = mul i64 %103, %55
  %105 = add i64 %104, %29
  %106 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %105
  %107 = load <4 x float>, <4 x float> addrspace(1)* %106, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %108 = or i64 %105, 1
  %109 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %108
  %110 = load <4 x float>, <4 x float> addrspace(1)* %109, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %111 = or i64 %30, 7
  %112 = mul i64 %111, %55
  %113 = add i64 %112, %29
  %114 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %113
  %115 = load <4 x float>, <4 x float> addrspace(1)* %114, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %116 = add i64 %113, 1
  %117 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %116
  %118 = load <4 x float>, <4 x float> addrspace(1)* %117, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %119 = or i64 %30, 8
  %120 = mul i64 %119, %55
  %121 = add i64 %120, %29
  %122 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %121
  %123 = load <4 x float>, <4 x float> addrspace(1)* %122, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %124 = or i64 %121, 1
  %125 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %124
  %126 = load <4 x float>, <4 x float> addrspace(1)* %125, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %127 = or i64 %30, 9
  %128 = mul i64 %127, %55
  %129 = add i64 %128, %29
  %130 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %129
  %131 = load <4 x float>, <4 x float> addrspace(1)* %130, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %132 = add i64 %129, 1
  %133 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %132
  %134 = load <4 x float>, <4 x float> addrspace(1)* %133, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %135 = or i64 %30, 10
  %136 = mul i64 %135, %55
  %137 = add i64 %136, %29
  %138 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %137
  %139 = load <4 x float>, <4 x float> addrspace(1)* %138, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %140 = or i64 %137, 1
  %141 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %140
  %142 = load <4 x float>, <4 x float> addrspace(1)* %141, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %143 = or i64 %30, 11
  %144 = mul i64 %143, %55
  %145 = add i64 %144, %29
  %146 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %145
  %147 = load <4 x float>, <4 x float> addrspace(1)* %146, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %148 = add i64 %145, 1
  %149 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %148
  %150 = load <4 x float>, <4 x float> addrspace(1)* %149, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %151 = or i64 %30, 12
  %152 = mul i64 %151, %55
  %153 = add i64 %152, %29
  %154 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %153
  %155 = load <4 x float>, <4 x float> addrspace(1)* %154, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %156 = or i64 %153, 1
  %157 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %156
  %158 = load <4 x float>, <4 x float> addrspace(1)* %157, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %159 = or i64 %30, 13
  %160 = mul i64 %159, %55
  %161 = add i64 %160, %29
  %162 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %161
  %163 = load <4 x float>, <4 x float> addrspace(1)* %162, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %164 = add i64 %161, 1
  %165 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %164
  %166 = load <4 x float>, <4 x float> addrspace(1)* %165, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %167 = or i64 %30, 14
  %168 = mul i64 %167, %55
  %169 = add i64 %168, %29
  %170 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %169
  %171 = load <4 x float>, <4 x float> addrspace(1)* %170, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %172 = or i64 %169, 1
  %173 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %172
  %174 = load <4 x float>, <4 x float> addrspace(1)* %173, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %175 = or i64 %30, 15
  %176 = mul i64 %175, %55
  %177 = add i64 %176, %29
  %178 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %177
  %179 = load <4 x float>, <4 x float> addrspace(1)* %178, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %180 = add i64 %177, 1
  %181 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %180
  %182 = load <4 x float>, <4 x float> addrspace(1)* %181, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %183 = or i64 %30, 16
  %184 = mul i64 %183, %55
  %185 = add i64 %184, %29
  %186 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %185
  %187 = load <4 x float>, <4 x float> addrspace(1)* %186, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %188 = or i64 %185, 1
  %189 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %188
  %190 = load <4 x float>, <4 x float> addrspace(1)* %189, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %191 = or i64 %30, 17
  %192 = mul i64 %191, %55
  %193 = add i64 %192, %29
  %194 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %193
  %195 = load <4 x float>, <4 x float> addrspace(1)* %194, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %196 = add i64 %193, 1
  %197 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %196
  %198 = load <4 x float>, <4 x float> addrspace(1)* %197, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %199 = or i64 %30, 18
  %200 = mul i64 %199, %55
  %201 = add i64 %200, %29
  %202 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %201
  %203 = load <4 x float>, <4 x float> addrspace(1)* %202, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %204 = or i64 %201, 1
  %205 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %204
  %206 = load <4 x float>, <4 x float> addrspace(1)* %205, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %207 = or i64 %30, 19
  %208 = mul i64 %207, %55
  %209 = add i64 %208, %29
  %210 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %209
  %211 = load <4 x float>, <4 x float> addrspace(1)* %210, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %212 = add i64 %209, 1
  %213 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %212
  %214 = load <4 x float>, <4 x float> addrspace(1)* %213, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %215 = or i64 %30, 20
  %216 = mul i64 %215, %55
  %217 = add i64 %216, %29
  %218 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %217
  %219 = load <4 x float>, <4 x float> addrspace(1)* %218, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %220 = or i64 %217, 1
  %221 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %220
  %222 = load <4 x float>, <4 x float> addrspace(1)* %221, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %223 = or i64 %30, 21
  %224 = mul i64 %223, %55
  %225 = add i64 %224, %29
  %226 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %225
  %227 = load <4 x float>, <4 x float> addrspace(1)* %226, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %228 = add i64 %225, 1
  %229 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %228
  %230 = load <4 x float>, <4 x float> addrspace(1)* %229, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %231 = or i64 %30, 22
  %232 = mul i64 %231, %55
  %233 = add i64 %232, %29
  %234 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %233
  %235 = load <4 x float>, <4 x float> addrspace(1)* %234, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %236 = or i64 %233, 1
  %237 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %236
  %238 = load <4 x float>, <4 x float> addrspace(1)* %237, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %239 = or i64 %30, 23
  %240 = mul i64 %239, %55
  %241 = add i64 %240, %29
  %242 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %241
  %243 = load <4 x float>, <4 x float> addrspace(1)* %242, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %244 = add i64 %241, 1
  %245 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %244
  %246 = load <4 x float>, <4 x float> addrspace(1)* %245, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %247 = or i64 %30, 24
  %248 = mul i64 %247, %55
  %249 = add i64 %248, %29
  %250 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %249
  %251 = load <4 x float>, <4 x float> addrspace(1)* %250, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %252 = or i64 %249, 1
  %253 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %252
  %254 = load <4 x float>, <4 x float> addrspace(1)* %253, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %255 = or i64 %30, 25
  %256 = mul i64 %255, %55
  %257 = add i64 %256, %29
  %258 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %257
  %259 = load <4 x float>, <4 x float> addrspace(1)* %258, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %260 = add i64 %257, 1
  %261 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %260
  %262 = load <4 x float>, <4 x float> addrspace(1)* %261, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %263 = or i64 %30, 26
  %264 = mul i64 %263, %55
  %265 = add i64 %264, %29
  %266 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %265
  %267 = load <4 x float>, <4 x float> addrspace(1)* %266, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %268 = or i64 %265, 1
  %269 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %268
  %270 = load <4 x float>, <4 x float> addrspace(1)* %269, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %271 = or i64 %30, 27
  %272 = mul i64 %271, %55
  %273 = add i64 %272, %29
  %274 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %273
  %275 = load <4 x float>, <4 x float> addrspace(1)* %274, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %276 = add i64 %273, 1
  %277 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %276
  %278 = load <4 x float>, <4 x float> addrspace(1)* %277, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %279 = or i64 %30, 28
  %280 = mul i64 %279, %55
  %281 = add i64 %280, %29
  %282 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %281
  %283 = load <4 x float>, <4 x float> addrspace(1)* %282, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %284 = or i64 %281, 1
  %285 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %284
  %286 = load <4 x float>, <4 x float> addrspace(1)* %285, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %287 = or i64 %30, 29
  %288 = mul i64 %287, %55
  %289 = add i64 %288, %29
  %290 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %289
  %291 = load <4 x float>, <4 x float> addrspace(1)* %290, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %292 = add i64 %289, 1
  %293 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %292
  %294 = load <4 x float>, <4 x float> addrspace(1)* %293, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %295 = or i64 %30, 30
  %296 = mul i64 %295, %55
  %297 = add i64 %296, %29
  %298 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %297
  %299 = load <4 x float>, <4 x float> addrspace(1)* %298, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %300 = or i64 %297, 1
  %301 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %300
  %302 = load <4 x float>, <4 x float> addrspace(1)* %301, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %303 = or i64 %30, 31
  %304 = mul i64 %303, %55
  %305 = add i64 %304, %29
  %306 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %305
  %307 = load <4 x float>, <4 x float> addrspace(1)* %306, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %308 = add i64 %305, 1
  %309 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %308
  %310 = load <4 x float>, <4 x float> addrspace(1)* %309, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %311 = fadd <4 x float> %35, %59
  %312 = fadd <4 x float> %38, %62
  %313 = fadd <4 x float> %43, %67
  %314 = fadd <4 x float> %46, %70
  %315 = fadd <4 x float> %51, %75
  %316 = fadd <4 x float> %54, %78
  %317 = fadd <4 x float> %99, %123
  %318 = fadd <4 x float> %102, %126
  %319 = fadd <4 x float> %107, %131
  %320 = fadd <4 x float> %110, %134
  %321 = fadd <4 x float> %115, %139
  %322 = fadd <4 x float> %118, %142
  %323 = fadd <4 x float> %163, %187
  %324 = fadd <4 x float> %166, %190
  %325 = fadd <4 x float> %171, %195
  %326 = fadd <4 x float> %174, %198
  %327 = fadd <4 x float> %179, %203
  %328 = fadd <4 x float> %182, %206
  %329 = fadd <4 x float> %227, %251
  %330 = fadd <4 x float> %230, %254
  %331 = fadd <4 x float> %235, %259
  %332 = fadd <4 x float> %238, %262
  %333 = fadd <4 x float> %243, %267
  %334 = fadd <4 x float> %246, %270
  store <4 x float> %311, <4 x float> addrspace(1)* %34, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %312, <4 x float> addrspace(1)* %37, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %313, <4 x float> addrspace(1)* %42, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %314, <4 x float> addrspace(1)* %45, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %315, <4 x float> addrspace(1)* %50, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %316, <4 x float> addrspace(1)* %53, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %335 = or i64 %28, 3
  %336 = mul i64 %335, %31
  %337 = add i64 %336, %29
  %338 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %337
  store <4 x float> %83, <4 x float> addrspace(1)* %338, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %339 = add i64 %337, 1
  %340 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %339
  store <4 x float> %86, <4 x float> addrspace(1)* %340, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %341 = add i64 %28, 4
  %342 = mul i64 %341, %31
  %343 = add i64 %342, %29
  %344 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %343
  store <4 x float> %91, <4 x float> addrspace(1)* %344, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %345 = or i64 %343, 1
  %346 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %345
  store <4 x float> %94, <4 x float> addrspace(1)* %346, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %347 = add i64 %28, 5
  %348 = mul i64 %347, %31
  %349 = add i64 %348, %29
  %350 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %349
  store <4 x float> %317, <4 x float> addrspace(1)* %350, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %351 = add i64 %349, 1
  %352 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %351
  store <4 x float> %318, <4 x float> addrspace(1)* %352, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %353 = add i64 %28, 6
  %354 = mul i64 %353, %31
  %355 = add i64 %354, %29
  %356 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %355
  store <4 x float> %319, <4 x float> addrspace(1)* %356, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %357 = or i64 %355, 1
  %358 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %357
  store <4 x float> %320, <4 x float> addrspace(1)* %358, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %359 = add i64 %28, 7
  %360 = mul i64 %359, %31
  %361 = add i64 %360, %29
  %362 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %361
  store <4 x float> %321, <4 x float> addrspace(1)* %362, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %363 = add i64 %361, 1
  %364 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %363
  store <4 x float> %322, <4 x float> addrspace(1)* %364, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %365 = add i64 %28, 8
  %366 = mul i64 %365, %31
  %367 = add i64 %366, %29
  %368 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %367
  store <4 x float> %147, <4 x float> addrspace(1)* %368, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %369 = or i64 %367, 1
  %370 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %369
  store <4 x float> %150, <4 x float> addrspace(1)* %370, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %371 = add i64 %28, 9
  %372 = mul i64 %371, %31
  %373 = add i64 %372, %29
  %374 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %373
  store <4 x float> %155, <4 x float> addrspace(1)* %374, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %375 = add i64 %373, 1
  %376 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %375
  store <4 x float> %158, <4 x float> addrspace(1)* %376, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %377 = add i64 %28, 10
  %378 = mul i64 %377, %31
  %379 = add i64 %378, %29
  %380 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %379
  store <4 x float> %323, <4 x float> addrspace(1)* %380, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %381 = or i64 %379, 1
  %382 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %381
  store <4 x float> %324, <4 x float> addrspace(1)* %382, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %383 = add i64 %28, 11
  %384 = mul i64 %383, %31
  %385 = add i64 %384, %29
  %386 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %385
  store <4 x float> %325, <4 x float> addrspace(1)* %386, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %387 = add i64 %385, 1
  %388 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %387
  store <4 x float> %326, <4 x float> addrspace(1)* %388, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %389 = add i64 %28, 12
  %390 = mul i64 %389, %31
  %391 = add i64 %390, %29
  %392 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %391
  store <4 x float> %327, <4 x float> addrspace(1)* %392, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %393 = or i64 %391, 1
  %394 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %393
  store <4 x float> %328, <4 x float> addrspace(1)* %394, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %395 = add i64 %28, 13
  %396 = mul i64 %395, %31
  %397 = add i64 %396, %29
  %398 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %397
  store <4 x float> %211, <4 x float> addrspace(1)* %398, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %399 = add i64 %397, 1
  %400 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %399
  store <4 x float> %214, <4 x float> addrspace(1)* %400, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %401 = add i64 %28, 14
  %402 = mul i64 %401, %31
  %403 = add i64 %402, %29
  %404 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %403
  store <4 x float> %219, <4 x float> addrspace(1)* %404, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %405 = or i64 %403, 1
  %406 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %405
  store <4 x float> %222, <4 x float> addrspace(1)* %406, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %407 = add i64 %28, 15
  %408 = mul i64 %407, %31
  %409 = add i64 %408, %29
  %410 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %409
  store <4 x float> %329, <4 x float> addrspace(1)* %410, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %411 = add i64 %409, 1
  %412 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %411
  store <4 x float> %330, <4 x float> addrspace(1)* %412, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %413 = add i64 %28, 16
  %414 = mul i64 %413, %31
  %415 = add i64 %414, %29
  %416 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %415
  store <4 x float> %331, <4 x float> addrspace(1)* %416, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %417 = or i64 %415, 1
  %418 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %417
  store <4 x float> %332, <4 x float> addrspace(1)* %418, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %419 = add i64 %28, 17
  %420 = mul i64 %419, %31
  %421 = add i64 %420, %29
  %422 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %421
  store <4 x float> %333, <4 x float> addrspace(1)* %422, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %423 = add i64 %421, 1
  %424 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %423
  store <4 x float> %334, <4 x float> addrspace(1)* %424, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %425 = add i64 %28, 18
  %426 = mul i64 %425, %31
  %427 = add i64 %426, %29
  %428 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %427
  store <4 x float> %275, <4 x float> addrspace(1)* %428, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %429 = or i64 %427, 1
  %430 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %429
  store <4 x float> %278, <4 x float> addrspace(1)* %430, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %431 = add i64 %28, 19
  %432 = mul i64 %431, %31
  %433 = add i64 %432, %29
  %434 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %433
  store <4 x float> %283, <4 x float> addrspace(1)* %434, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %435 = add i64 %433, 1
  %436 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %435
  store <4 x float> %286, <4 x float> addrspace(1)* %436, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %437 = add i64 %28, 20
  %438 = mul i64 %437, %31
  %439 = add i64 %438, %29
  %440 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %439
  store <4 x float> %291, <4 x float> addrspace(1)* %440, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %441 = or i64 %439, 1
  %442 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %441
  store <4 x float> %294, <4 x float> addrspace(1)* %442, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %443 = add i64 %28, 21
  %444 = mul i64 %443, %31
  %445 = add i64 %444, %29
  %446 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %445
  store <4 x float> %299, <4 x float> addrspace(1)* %446, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %447 = add i64 %445, 1
  %448 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %447
  store <4 x float> %302, <4 x float> addrspace(1)* %448, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %449 = add i64 %28, 22
  %450 = mul i64 %449, %31
  %451 = add i64 %450, %29
  %452 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %451
  store <4 x float> %307, <4 x float> addrspace(1)* %452, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %453 = or i64 %451, 1
  %454 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %453
  store <4 x float> %310, <4 x float> addrspace(1)* %454, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  br label %455

455:                                              ; preds = %14, %9, %4
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)*, <2 x i32>, <4 x float> addrspace(1)*, <4 x float> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blend8x8RowInc5", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 24, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blend8x8RowInc5_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_strideInOut", i32 4, i32 4, i32 0, !"int", !"m_strideIn", i32 8, i32 4, i32 0, !"int", !"m_stepInc", i32 12, i32 4, i32 0, !"int", !"m_offsetY", i32 16, i32 4, i32 0, !"uint", !"m_globalWidth", i32 20, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inOut"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inNum"}
!22 = !{!23, !24, i64 16}
!23 = !{!"_ZTSN10bm3dnr_buf33bm3dnr_buf_blend8x8RowInc5_paramsE", !24, i64 0, !24, i64 4, !24, i64 8, !24, i64 12, !24, i64 16, !24, i64 20}
!24 = !{!"int", !25, i64 0}
!25 = !{!"omnipotent char", !26, i64 0}
!26 = !{!"Simple C++ TBAA"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blend8x8RowInc5)"}
!30 = !{!31, !32}
!31 = distinct !{!31, !29, !"air-alias-scope-arg(2)"}
!32 = distinct !{!32, !29, !"air-alias-scope-arg(3)"}
!33 = !{!23, !24, i64 20}
!34 = !{!23, !24, i64 0}
!35 = !{!23, !24, i64 4}
!36 = !{!23, !24, i64 8}
!37 = !{!23, !24, i64 12}
!38 = !{!25, !25, i64 0}
!39 = !{!31}
!40 = !{!28, !32}
!41 = !{!32}
!42 = !{!28, !31}

