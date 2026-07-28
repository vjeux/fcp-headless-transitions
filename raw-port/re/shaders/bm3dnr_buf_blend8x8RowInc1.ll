0x0000000001090d -- bm3dnr_buf::bm3dnr_buf_blend8x8RowInc1:
source_filename = "bm3dnr_buf::bm3dnr_buf_blend8x8RowInc1"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" = type { i32, i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blend8x8RowInc1"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x float> addrspace(1)* nocapture "air-buffer-no-alias" %2, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3) local_unnamed_addr #0 {
  %5 = extractelement <2 x i32> %1, i64 0
  %6 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 4
  %7 = load i32, i32 addrspace(2)* %6, align 4, !tbaa !22, !alias.scope !27, !noalias !30
  %8 = icmp ult i32 %5, %7
  br i1 %8, label %9, label %255

9:                                                ; preds = %4
  %10 = extractelement <2 x i32> %1, i64 1
  %11 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 5
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !33, !alias.scope !27, !noalias !30
  %13 = icmp ult i32 %10, %12
  br i1 %13, label %14, label %255

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
  %27 = shl nsw i64 %26, 1
  %28 = mul i64 %27, %25
  %29 = shl nuw nsw i64 %21, 1
  %30 = shl nuw nsw i64 %25, 4
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
  %47 = add i64 %28, 2
  %48 = mul i64 %47, %31
  %49 = add i64 %48, %29
  %50 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %49
  %51 = load <4 x float>, <4 x float> addrspace(1)* %50, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %52 = or i64 %49, 1
  %53 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %52
  %54 = load <4 x float>, <4 x float> addrspace(1)* %53, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %55 = add i64 %28, 3
  %56 = mul i64 %55, %31
  %57 = add i64 %56, %29
  %58 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %57
  %59 = load <4 x float>, <4 x float> addrspace(1)* %58, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %60 = add i64 %57, 1
  %61 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %60
  %62 = load <4 x float>, <4 x float> addrspace(1)* %61, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %63 = add i64 %28, 4
  %64 = mul i64 %63, %31
  %65 = add i64 %64, %29
  %66 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %65
  %67 = load <4 x float>, <4 x float> addrspace(1)* %66, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %68 = or i64 %65, 1
  %69 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %68
  %70 = load <4 x float>, <4 x float> addrspace(1)* %69, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %71 = add i64 %28, 5
  %72 = mul i64 %71, %31
  %73 = add i64 %72, %29
  %74 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %73
  %75 = load <4 x float>, <4 x float> addrspace(1)* %74, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %76 = add i64 %73, 1
  %77 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %76
  %78 = load <4 x float>, <4 x float> addrspace(1)* %77, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %79 = add i64 %28, 6
  %80 = mul i64 %79, %31
  %81 = add i64 %80, %29
  %82 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %81
  %83 = load <4 x float>, <4 x float> addrspace(1)* %82, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %84 = or i64 %81, 1
  %85 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %84
  %86 = load <4 x float>, <4 x float> addrspace(1)* %85, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %87 = sext i32 %18 to i64
  %88 = mul i64 %30, %87
  %89 = add i64 %88, %29
  %90 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %89
  %91 = load <4 x float>, <4 x float> addrspace(1)* %90, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %92 = or i64 %89, 1
  %93 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %92
  %94 = load <4 x float>, <4 x float> addrspace(1)* %93, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %95 = or i64 %30, 1
  %96 = mul i64 %95, %87
  %97 = add i64 %96, %29
  %98 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %97
  %99 = load <4 x float>, <4 x float> addrspace(1)* %98, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %100 = add i64 %97, 1
  %101 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %100
  %102 = load <4 x float>, <4 x float> addrspace(1)* %101, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %103 = or i64 %30, 2
  %104 = mul i64 %103, %87
  %105 = add i64 %104, %29
  %106 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %105
  %107 = load <4 x float>, <4 x float> addrspace(1)* %106, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %108 = or i64 %105, 1
  %109 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %108
  %110 = load <4 x float>, <4 x float> addrspace(1)* %109, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %111 = or i64 %30, 3
  %112 = mul i64 %111, %87
  %113 = add i64 %112, %29
  %114 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %113
  %115 = load <4 x float>, <4 x float> addrspace(1)* %114, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %116 = add i64 %113, 1
  %117 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %116
  %118 = load <4 x float>, <4 x float> addrspace(1)* %117, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %119 = or i64 %30, 4
  %120 = mul i64 %119, %87
  %121 = add i64 %120, %29
  %122 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %121
  %123 = load <4 x float>, <4 x float> addrspace(1)* %122, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %124 = or i64 %121, 1
  %125 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %124
  %126 = load <4 x float>, <4 x float> addrspace(1)* %125, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %127 = or i64 %30, 5
  %128 = mul i64 %127, %87
  %129 = add i64 %128, %29
  %130 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %129
  %131 = load <4 x float>, <4 x float> addrspace(1)* %130, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %132 = add i64 %129, 1
  %133 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %132
  %134 = load <4 x float>, <4 x float> addrspace(1)* %133, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %135 = or i64 %30, 6
  %136 = mul i64 %135, %87
  %137 = add i64 %136, %29
  %138 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %137
  %139 = load <4 x float>, <4 x float> addrspace(1)* %138, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %140 = or i64 %137, 1
  %141 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %140
  %142 = load <4 x float>, <4 x float> addrspace(1)* %141, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %143 = or i64 %30, 7
  %144 = mul i64 %143, %87
  %145 = add i64 %144, %29
  %146 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %145
  %147 = load <4 x float>, <4 x float> addrspace(1)* %146, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %148 = add i64 %145, 1
  %149 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %148
  %150 = load <4 x float>, <4 x float> addrspace(1)* %149, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %151 = or i64 %30, 8
  %152 = mul i64 %151, %87
  %153 = add i64 %152, %29
  %154 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %153
  %155 = load <4 x float>, <4 x float> addrspace(1)* %154, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %156 = or i64 %153, 1
  %157 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %156
  %158 = load <4 x float>, <4 x float> addrspace(1)* %157, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %159 = or i64 %30, 9
  %160 = mul i64 %159, %87
  %161 = add i64 %160, %29
  %162 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %161
  %163 = load <4 x float>, <4 x float> addrspace(1)* %162, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %164 = add i64 %161, 1
  %165 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %164
  %166 = load <4 x float>, <4 x float> addrspace(1)* %165, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %167 = or i64 %30, 10
  %168 = mul i64 %167, %87
  %169 = add i64 %168, %29
  %170 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %169
  %171 = load <4 x float>, <4 x float> addrspace(1)* %170, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %172 = or i64 %169, 1
  %173 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %172
  %174 = load <4 x float>, <4 x float> addrspace(1)* %173, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %175 = or i64 %30, 11
  %176 = mul i64 %175, %87
  %177 = add i64 %176, %29
  %178 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %177
  %179 = load <4 x float>, <4 x float> addrspace(1)* %178, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %180 = add i64 %177, 1
  %181 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %180
  %182 = load <4 x float>, <4 x float> addrspace(1)* %181, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %183 = or i64 %30, 12
  %184 = mul i64 %183, %87
  %185 = add i64 %184, %29
  %186 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %185
  %187 = load <4 x float>, <4 x float> addrspace(1)* %186, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %188 = or i64 %185, 1
  %189 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %188
  %190 = load <4 x float>, <4 x float> addrspace(1)* %189, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %191 = or i64 %30, 13
  %192 = mul i64 %191, %87
  %193 = add i64 %192, %29
  %194 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %193
  %195 = load <4 x float>, <4 x float> addrspace(1)* %194, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %196 = add i64 %193, 1
  %197 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %196
  %198 = load <4 x float>, <4 x float> addrspace(1)* %197, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %199 = or i64 %30, 14
  %200 = mul i64 %199, %87
  %201 = add i64 %200, %29
  %202 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %201
  %203 = load <4 x float>, <4 x float> addrspace(1)* %202, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %204 = or i64 %201, 1
  %205 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %204
  %206 = load <4 x float>, <4 x float> addrspace(1)* %205, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %207 = or i64 %30, 15
  %208 = mul i64 %207, %87
  %209 = add i64 %208, %29
  %210 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %209
  %211 = load <4 x float>, <4 x float> addrspace(1)* %210, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %212 = add i64 %209, 1
  %213 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %212
  %214 = load <4 x float>, <4 x float> addrspace(1)* %213, align 16, !tbaa !38, !alias.scope !41, !noalias !42
  %215 = fadd <4 x float> %35, %91
  %216 = fadd <4 x float> %38, %94
  %217 = fadd <4 x float> %43, %99
  %218 = fadd <4 x float> %46, %102
  %219 = fadd <4 x float> %51, %107
  %220 = fadd <4 x float> %54, %110
  %221 = fadd <4 x float> %59, %115
  %222 = fadd <4 x float> %62, %118
  %223 = fadd <4 x float> %67, %123
  %224 = fadd <4 x float> %70, %126
  %225 = fadd <4 x float> %75, %131
  %226 = fadd <4 x float> %78, %134
  %227 = fadd <4 x float> %83, %139
  %228 = fadd <4 x float> %86, %142
  %229 = fadd <4 x float> %217, %155
  %230 = fadd <4 x float> %218, %158
  %231 = fadd <4 x float> %219, %163
  %232 = fadd <4 x float> %220, %166
  %233 = fadd <4 x float> %221, %171
  %234 = fadd <4 x float> %222, %174
  %235 = fadd <4 x float> %223, %179
  %236 = fadd <4 x float> %224, %182
  %237 = fadd <4 x float> %225, %187
  %238 = fadd <4 x float> %226, %190
  %239 = fadd <4 x float> %227, %195
  %240 = fadd <4 x float> %228, %198
  %241 = fadd <4 x float> %147, %203
  %242 = fadd <4 x float> %150, %206
  store <4 x float> %215, <4 x float> addrspace(1)* %34, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %216, <4 x float> addrspace(1)* %37, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %229, <4 x float> addrspace(1)* %42, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %230, <4 x float> addrspace(1)* %45, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %231, <4 x float> addrspace(1)* %50, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %232, <4 x float> addrspace(1)* %53, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %233, <4 x float> addrspace(1)* %58, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %234, <4 x float> addrspace(1)* %61, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %235, <4 x float> addrspace(1)* %66, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %236, <4 x float> addrspace(1)* %69, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %237, <4 x float> addrspace(1)* %74, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %238, <4 x float> addrspace(1)* %77, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %239, <4 x float> addrspace(1)* %82, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  store <4 x float> %240, <4 x float> addrspace(1)* %85, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %243 = add i64 %28, 7
  %244 = mul i64 %243, %31
  %245 = add i64 %244, %29
  %246 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %245
  store <4 x float> %241, <4 x float> addrspace(1)* %246, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %247 = add i64 %245, 1
  %248 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %247
  store <4 x float> %242, <4 x float> addrspace(1)* %248, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %249 = add i64 %28, 8
  %250 = mul i64 %249, %31
  %251 = add i64 %250, %29
  %252 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %251
  store <4 x float> %211, <4 x float> addrspace(1)* %252, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %253 = or i64 %251, 1
  %254 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %253
  store <4 x float> %214, <4 x float> addrspace(1)* %254, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  br label %255

255:                                              ; preds = %14, %9, %4
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)*, <2 x i32>, <4 x float> addrspace(1)*, <4 x float> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blend8x8RowInc1", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 24, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blend8x8RowInc1_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_strideInOut", i32 4, i32 4, i32 0, !"int", !"m_strideIn", i32 8, i32 4, i32 0, !"int", !"m_stepInc", i32 12, i32 4, i32 0, !"int", !"m_offsetY", i32 16, i32 4, i32 0, !"uint", !"m_globalWidth", i32 20, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inOut"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inNum"}
!22 = !{!23, !24, i64 16}
!23 = !{!"_ZTSN10bm3dnr_buf33bm3dnr_buf_blend8x8RowInc1_paramsE", !24, i64 0, !24, i64 4, !24, i64 8, !24, i64 12, !24, i64 16, !24, i64 20}
!24 = !{!"int", !25, i64 0}
!25 = !{!"omnipotent char", !26, i64 0}
!26 = !{!"Simple C++ TBAA"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blend8x8RowInc1)"}
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

