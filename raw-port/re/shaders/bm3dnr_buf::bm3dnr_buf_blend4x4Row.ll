0x00000000007bcd -- bm3dnr_buf::bm3dnr_buf_blend4x4Row:
source_filename = "bm3dnr_buf::bm3dnr_buf_blend4x4Row"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" = type { i32, i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly convergent nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blend4x4Row"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x float> addrspace(1)* nocapture "air-buffer-no-alias" %2, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3) local_unnamed_addr #0 {
  %5 = alloca [32 x <4 x float>], align 16
  %6 = extractelement <2 x i32> %1, i64 0
  %7 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 4
  %8 = load i32, i32 addrspace(2)* %7, align 4, !tbaa !22, !alias.scope !27, !noalias !30
  %9 = icmp ult i32 %6, %8
  br i1 %9, label %10, label %205

10:                                               ; preds = %4
  %11 = extractelement <2 x i32> %1, i64 1
  %12 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 5
  %13 = load i32, i32 addrspace(2)* %12, align 4, !tbaa !33, !alias.scope !27, !noalias !30
  %14 = icmp ult i32 %11, %13
  br i1 %14, label %15, label %205

15:                                               ; preds = %10
  %16 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 0
  %17 = load i32, i32 addrspace(2)* %16, align 4, !tbaa !34, !alias.scope !27, !noalias !30
  %18 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 1
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !35, !alias.scope !27, !noalias !30
  %20 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 2
  %21 = load i32, i32 addrspace(2)* %20, align 4, !tbaa !36, !alias.scope !27, !noalias !30
  %22 = bitcast [32 x <4 x float>]* %5 to i8*
  call void @llvm.lifetime.start.p0i8(i64 512, i8* nonnull %22) #3
  %23 = zext i32 %6 to i64
  %24 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 3
  %25 = load i32, i32 addrspace(2)* %24, align 4, !tbaa !37, !alias.scope !27, !noalias !30
  %26 = add i32 %25, %11
  %27 = zext i32 %26 to i64
  %28 = sext i32 %21 to i64
  %29 = shl nsw i64 %28, 3
  %30 = mul i64 %29, %27
  %31 = shl i32 %26, 5
  %32 = sext i32 %17 to i64
  %33 = mul i64 %30, %32
  %34 = add i64 %33, %23
  %35 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %34
  %36 = load <4 x float>, <4 x float> addrspace(1)* %35, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %37 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 0
  call fastcc void @_ZN10bm3dnr_buf17read32x4Float4MemEPU9MTLdeviceDv4_fPS0_iii(<4 x float> addrspace(1)* %3, <4 x float>* nonnull %37, i32 %6, i32 %31, i32 %19) #4
  %38 = load <4 x float>, <4 x float>* %37, align 16, !tbaa !38
  %39 = fadd <4 x float> %36, %38
  store <4 x float> %39, <4 x float>* %37, align 16, !tbaa !38
  %40 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 3
  %41 = load <4 x float>, <4 x float>* %40, align 16, !tbaa !38
  %42 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 4
  %43 = load <4 x float>, <4 x float>* %42, align 16, !tbaa !38
  %44 = fadd <4 x float> %41, %43
  store <4 x float> %44, <4 x float>* %40, align 16, !tbaa !38
  %45 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 7
  %46 = load <4 x float>, <4 x float>* %45, align 16, !tbaa !38
  %47 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 8
  %48 = load <4 x float>, <4 x float>* %47, align 16, !tbaa !38
  %49 = fadd <4 x float> %46, %48
  store <4 x float> %49, <4 x float>* %45, align 16, !tbaa !38
  %50 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 11
  %51 = load <4 x float>, <4 x float>* %50, align 16, !tbaa !38
  %52 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 12
  %53 = load <4 x float>, <4 x float>* %52, align 16, !tbaa !38
  %54 = fadd <4 x float> %51, %53
  %55 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 15
  %56 = load <4 x float>, <4 x float>* %55, align 16, !tbaa !38
  %57 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 16
  %58 = load <4 x float>, <4 x float>* %57, align 16, !tbaa !38
  %59 = fadd <4 x float> %56, %58
  %60 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 19
  %61 = load <4 x float>, <4 x float>* %60, align 16, !tbaa !38
  %62 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 20
  %63 = load <4 x float>, <4 x float>* %62, align 16, !tbaa !38
  %64 = fadd <4 x float> %61, %63
  %65 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 23
  %66 = load <4 x float>, <4 x float>* %65, align 16, !tbaa !38
  %67 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 24
  %68 = load <4 x float>, <4 x float>* %67, align 16, !tbaa !38
  %69 = fadd <4 x float> %66, %68
  %70 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 27
  %71 = load <4 x float>, <4 x float>* %70, align 16, !tbaa !38
  %72 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 28
  %73 = load <4 x float>, <4 x float>* %72, align 16, !tbaa !38
  %74 = fadd <4 x float> %71, %73
  store <4 x float> %39, <4 x float> addrspace(1)* %35, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %75 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 1
  %76 = load <4 x float>, <4 x float>* %75, align 16, !tbaa !38
  %77 = or i64 %30, 1
  %78 = mul i64 %77, %32
  %79 = add i64 %78, %23
  %80 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %79
  store <4 x float> %76, <4 x float> addrspace(1)* %80, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %81 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 2
  %82 = load <4 x float>, <4 x float>* %81, align 16, !tbaa !38
  %83 = or i64 %30, 2
  %84 = mul i64 %83, %32
  %85 = add i64 %84, %23
  %86 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %85
  store <4 x float> %82, <4 x float> addrspace(1)* %86, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %87 = or i64 %30, 3
  %88 = mul i64 %87, %32
  %89 = add i64 %88, %23
  %90 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %89
  store <4 x float> %44, <4 x float> addrspace(1)* %90, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %91 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 5
  %92 = load <4 x float>, <4 x float>* %91, align 16, !tbaa !38
  %93 = or i64 %30, 4
  %94 = mul i64 %93, %32
  %95 = add i64 %94, %23
  %96 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %95
  store <4 x float> %92, <4 x float> addrspace(1)* %96, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %97 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 6
  %98 = load <4 x float>, <4 x float>* %97, align 16, !tbaa !38
  %99 = or i64 %30, 5
  %100 = mul i64 %99, %32
  %101 = add i64 %100, %23
  %102 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %101
  store <4 x float> %98, <4 x float> addrspace(1)* %102, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %103 = or i64 %30, 6
  %104 = mul i64 %103, %32
  %105 = add i64 %104, %23
  %106 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %105
  store <4 x float> %49, <4 x float> addrspace(1)* %106, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %107 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 9
  %108 = load <4 x float>, <4 x float>* %107, align 16, !tbaa !38
  %109 = or i64 %30, 7
  %110 = mul i64 %109, %32
  %111 = add i64 %110, %23
  %112 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %111
  store <4 x float> %108, <4 x float> addrspace(1)* %112, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %113 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 10
  %114 = load <4 x float>, <4 x float>* %113, align 16, !tbaa !38
  %115 = add i64 %30, 8
  %116 = mul i64 %115, %32
  %117 = add i64 %116, %23
  %118 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %117
  store <4 x float> %114, <4 x float> addrspace(1)* %118, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %119 = add i64 %30, 9
  %120 = mul i64 %119, %32
  %121 = add i64 %120, %23
  %122 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %121
  store <4 x float> %54, <4 x float> addrspace(1)* %122, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %123 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 13
  %124 = load <4 x float>, <4 x float>* %123, align 16, !tbaa !38
  %125 = add i64 %30, 10
  %126 = mul i64 %125, %32
  %127 = add i64 %126, %23
  %128 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %127
  store <4 x float> %124, <4 x float> addrspace(1)* %128, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %129 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 14
  %130 = load <4 x float>, <4 x float>* %129, align 16, !tbaa !38
  %131 = add i64 %30, 11
  %132 = mul i64 %131, %32
  %133 = add i64 %132, %23
  %134 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %133
  store <4 x float> %130, <4 x float> addrspace(1)* %134, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %135 = add i64 %30, 12
  %136 = mul i64 %135, %32
  %137 = add i64 %136, %23
  %138 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %137
  store <4 x float> %59, <4 x float> addrspace(1)* %138, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %139 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 17
  %140 = load <4 x float>, <4 x float>* %139, align 16, !tbaa !38
  %141 = add i64 %30, 13
  %142 = mul i64 %141, %32
  %143 = add i64 %142, %23
  %144 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %143
  store <4 x float> %140, <4 x float> addrspace(1)* %144, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %145 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 18
  %146 = load <4 x float>, <4 x float>* %145, align 16, !tbaa !38
  %147 = add i64 %30, 14
  %148 = mul i64 %147, %32
  %149 = add i64 %148, %23
  %150 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %149
  store <4 x float> %146, <4 x float> addrspace(1)* %150, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %151 = add i64 %30, 15
  %152 = mul i64 %151, %32
  %153 = add i64 %152, %23
  %154 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %153
  store <4 x float> %64, <4 x float> addrspace(1)* %154, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %155 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 21
  %156 = load <4 x float>, <4 x float>* %155, align 16, !tbaa !38
  %157 = add i64 %30, 16
  %158 = mul i64 %157, %32
  %159 = add i64 %158, %23
  %160 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %159
  store <4 x float> %156, <4 x float> addrspace(1)* %160, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %161 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 22
  %162 = load <4 x float>, <4 x float>* %161, align 16, !tbaa !38
  %163 = add i64 %30, 17
  %164 = mul i64 %163, %32
  %165 = add i64 %164, %23
  %166 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %165
  store <4 x float> %162, <4 x float> addrspace(1)* %166, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %167 = add i64 %30, 18
  %168 = mul i64 %167, %32
  %169 = add i64 %168, %23
  %170 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %169
  store <4 x float> %69, <4 x float> addrspace(1)* %170, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %171 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 25
  %172 = load <4 x float>, <4 x float>* %171, align 16, !tbaa !38
  %173 = add i64 %30, 19
  %174 = mul i64 %173, %32
  %175 = add i64 %174, %23
  %176 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %175
  store <4 x float> %172, <4 x float> addrspace(1)* %176, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %177 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 26
  %178 = load <4 x float>, <4 x float>* %177, align 16, !tbaa !38
  %179 = add i64 %30, 20
  %180 = mul i64 %179, %32
  %181 = add i64 %180, %23
  %182 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %181
  store <4 x float> %178, <4 x float> addrspace(1)* %182, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %183 = add i64 %30, 21
  %184 = mul i64 %183, %32
  %185 = add i64 %184, %23
  %186 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %185
  store <4 x float> %74, <4 x float> addrspace(1)* %186, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %187 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 29
  %188 = load <4 x float>, <4 x float>* %187, align 16, !tbaa !38
  %189 = add i64 %30, 22
  %190 = mul i64 %189, %32
  %191 = add i64 %190, %23
  %192 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %191
  store <4 x float> %188, <4 x float> addrspace(1)* %192, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %193 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 30
  %194 = load <4 x float>, <4 x float>* %193, align 16, !tbaa !38
  %195 = add i64 %30, 23
  %196 = mul i64 %195, %32
  %197 = add i64 %196, %23
  %198 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %197
  store <4 x float> %194, <4 x float> addrspace(1)* %198, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  %199 = getelementptr inbounds [32 x <4 x float>], [32 x <4 x float>]* %5, i64 0, i64 31
  %200 = load <4 x float>, <4 x float>* %199, align 16, !tbaa !38
  %201 = add i64 %30, 24
  %202 = mul i64 %201, %32
  %203 = add i64 %202, %23
  %204 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %2, i64 %203
  store <4 x float> %200, <4 x float> addrspace(1)* %204, align 16, !tbaa !38, !alias.scope !39, !noalias !40
  call void @llvm.lifetime.end.p0i8(i64 512, i8* nonnull %22) #3
  br label %205

205:                                              ; preds = %15, %10, %4
  ret void
}

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.end.p0i8(i64 immarg, i8* nocapture) #1

; Function Attrs: argmemonly norecurse nounwind
define internal fastcc void @_ZN10bm3dnr_buf17read32x4Float4MemEPU9MTLdeviceDv4_fPS0_iii(<4 x float> addrspace(1)* nocapture readonly %0, <4 x float>* nocapture %1, i32 %2, i32 %3, i32 %4) unnamed_addr #2 {
  %6 = mul nsw i32 %4, %3
  %7 = add nsw i32 %6, %2
  %8 = sext i32 %7 to i64
  %9 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %8
  %10 = load <4 x float>, <4 x float> addrspace(1)* %9, align 16, !tbaa !38
  store <4 x float> %10, <4 x float>* %1, align 16, !tbaa !38
  %11 = add nsw i32 %3, 1
  %12 = mul nsw i32 %11, %4
  %13 = add nsw i32 %12, %2
  %14 = sext i32 %13 to i64
  %15 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %14
  %16 = load <4 x float>, <4 x float> addrspace(1)* %15, align 16, !tbaa !38
  %17 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 1
  store <4 x float> %16, <4 x float>* %17, align 16, !tbaa !38
  %18 = add nsw i32 %3, 2
  %19 = mul nsw i32 %18, %4
  %20 = add nsw i32 %19, %2
  %21 = sext i32 %20 to i64
  %22 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %21
  %23 = load <4 x float>, <4 x float> addrspace(1)* %22, align 16, !tbaa !38
  %24 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 2
  store <4 x float> %23, <4 x float>* %24, align 16, !tbaa !38
  %25 = add nsw i32 %3, 3
  %26 = mul nsw i32 %25, %4
  %27 = add nsw i32 %26, %2
  %28 = sext i32 %27 to i64
  %29 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %28
  %30 = load <4 x float>, <4 x float> addrspace(1)* %29, align 16, !tbaa !38
  %31 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 3
  store <4 x float> %30, <4 x float>* %31, align 16, !tbaa !38
  %32 = add nsw i32 %3, 4
  %33 = mul nsw i32 %32, %4
  %34 = add nsw i32 %33, %2
  %35 = sext i32 %34 to i64
  %36 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %35
  %37 = load <4 x float>, <4 x float> addrspace(1)* %36, align 16, !tbaa !38
  %38 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 4
  store <4 x float> %37, <4 x float>* %38, align 16, !tbaa !38
  %39 = add nsw i32 %3, 5
  %40 = mul nsw i32 %39, %4
  %41 = add nsw i32 %40, %2
  %42 = sext i32 %41 to i64
  %43 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %42
  %44 = load <4 x float>, <4 x float> addrspace(1)* %43, align 16, !tbaa !38
  %45 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 5
  store <4 x float> %44, <4 x float>* %45, align 16, !tbaa !38
  %46 = add nsw i32 %3, 6
  %47 = mul nsw i32 %46, %4
  %48 = add nsw i32 %47, %2
  %49 = sext i32 %48 to i64
  %50 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %49
  %51 = load <4 x float>, <4 x float> addrspace(1)* %50, align 16, !tbaa !38
  %52 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 6
  store <4 x float> %51, <4 x float>* %52, align 16, !tbaa !38
  %53 = add nsw i32 %3, 7
  %54 = mul nsw i32 %53, %4
  %55 = add nsw i32 %54, %2
  %56 = sext i32 %55 to i64
  %57 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %56
  %58 = load <4 x float>, <4 x float> addrspace(1)* %57, align 16, !tbaa !38
  %59 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 7
  store <4 x float> %58, <4 x float>* %59, align 16, !tbaa !38
  %60 = add nsw i32 %3, 8
  %61 = mul nsw i32 %60, %4
  %62 = add nsw i32 %61, %2
  %63 = sext i32 %62 to i64
  %64 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %63
  %65 = load <4 x float>, <4 x float> addrspace(1)* %64, align 16, !tbaa !38
  %66 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 8
  store <4 x float> %65, <4 x float>* %66, align 16, !tbaa !38
  %67 = add nsw i32 %3, 9
  %68 = mul nsw i32 %67, %4
  %69 = add nsw i32 %68, %2
  %70 = sext i32 %69 to i64
  %71 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %70
  %72 = load <4 x float>, <4 x float> addrspace(1)* %71, align 16, !tbaa !38
  %73 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 9
  store <4 x float> %72, <4 x float>* %73, align 16, !tbaa !38
  %74 = add nsw i32 %3, 10
  %75 = mul nsw i32 %74, %4
  %76 = add nsw i32 %75, %2
  %77 = sext i32 %76 to i64
  %78 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %77
  %79 = load <4 x float>, <4 x float> addrspace(1)* %78, align 16, !tbaa !38
  %80 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 10
  store <4 x float> %79, <4 x float>* %80, align 16, !tbaa !38
  %81 = add nsw i32 %3, 11
  %82 = mul nsw i32 %81, %4
  %83 = add nsw i32 %82, %2
  %84 = sext i32 %83 to i64
  %85 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %84
  %86 = load <4 x float>, <4 x float> addrspace(1)* %85, align 16, !tbaa !38
  %87 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 11
  store <4 x float> %86, <4 x float>* %87, align 16, !tbaa !38
  %88 = add nsw i32 %3, 12
  %89 = mul nsw i32 %88, %4
  %90 = add nsw i32 %89, %2
  %91 = sext i32 %90 to i64
  %92 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %91
  %93 = load <4 x float>, <4 x float> addrspace(1)* %92, align 16, !tbaa !38
  %94 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 12
  store <4 x float> %93, <4 x float>* %94, align 16, !tbaa !38
  %95 = add nsw i32 %3, 13
  %96 = mul nsw i32 %95, %4
  %97 = add nsw i32 %96, %2
  %98 = sext i32 %97 to i64
  %99 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %98
  %100 = load <4 x float>, <4 x float> addrspace(1)* %99, align 16, !tbaa !38
  %101 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 13
  store <4 x float> %100, <4 x float>* %101, align 16, !tbaa !38
  %102 = add nsw i32 %3, 14
  %103 = mul nsw i32 %102, %4
  %104 = add nsw i32 %103, %2
  %105 = sext i32 %104 to i64
  %106 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %105
  %107 = load <4 x float>, <4 x float> addrspace(1)* %106, align 16, !tbaa !38
  %108 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 14
  store <4 x float> %107, <4 x float>* %108, align 16, !tbaa !38
  %109 = add nsw i32 %3, 15
  %110 = mul nsw i32 %109, %4
  %111 = add nsw i32 %110, %2
  %112 = sext i32 %111 to i64
  %113 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %112
  %114 = load <4 x float>, <4 x float> addrspace(1)* %113, align 16, !tbaa !38
  %115 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 15
  store <4 x float> %114, <4 x float>* %115, align 16, !tbaa !38
  %116 = add nsw i32 %3, 16
  %117 = mul nsw i32 %116, %4
  %118 = add nsw i32 %117, %2
  %119 = sext i32 %118 to i64
  %120 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %119
  %121 = load <4 x float>, <4 x float> addrspace(1)* %120, align 16, !tbaa !38
  %122 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 16
  store <4 x float> %121, <4 x float>* %122, align 16, !tbaa !38
  %123 = add nsw i32 %3, 17
  %124 = mul nsw i32 %123, %4
  %125 = add nsw i32 %124, %2
  %126 = sext i32 %125 to i64
  %127 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %126
  %128 = load <4 x float>, <4 x float> addrspace(1)* %127, align 16, !tbaa !38
  %129 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 17
  store <4 x float> %128, <4 x float>* %129, align 16, !tbaa !38
  %130 = add nsw i32 %3, 18
  %131 = mul nsw i32 %130, %4
  %132 = add nsw i32 %131, %2
  %133 = sext i32 %132 to i64
  %134 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %133
  %135 = load <4 x float>, <4 x float> addrspace(1)* %134, align 16, !tbaa !38
  %136 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 18
  store <4 x float> %135, <4 x float>* %136, align 16, !tbaa !38
  %137 = add nsw i32 %3, 19
  %138 = mul nsw i32 %137, %4
  %139 = add nsw i32 %138, %2
  %140 = sext i32 %139 to i64
  %141 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %140
  %142 = load <4 x float>, <4 x float> addrspace(1)* %141, align 16, !tbaa !38
  %143 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 19
  store <4 x float> %142, <4 x float>* %143, align 16, !tbaa !38
  %144 = add nsw i32 %3, 20
  %145 = mul nsw i32 %144, %4
  %146 = add nsw i32 %145, %2
  %147 = sext i32 %146 to i64
  %148 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %147
  %149 = load <4 x float>, <4 x float> addrspace(1)* %148, align 16, !tbaa !38
  %150 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 20
  store <4 x float> %149, <4 x float>* %150, align 16, !tbaa !38
  %151 = add nsw i32 %3, 21
  %152 = mul nsw i32 %151, %4
  %153 = add nsw i32 %152, %2
  %154 = sext i32 %153 to i64
  %155 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %154
  %156 = load <4 x float>, <4 x float> addrspace(1)* %155, align 16, !tbaa !38
  %157 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 21
  store <4 x float> %156, <4 x float>* %157, align 16, !tbaa !38
  %158 = add nsw i32 %3, 22
  %159 = mul nsw i32 %158, %4
  %160 = add nsw i32 %159, %2
  %161 = sext i32 %160 to i64
  %162 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %161
  %163 = load <4 x float>, <4 x float> addrspace(1)* %162, align 16, !tbaa !38
  %164 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 22
  store <4 x float> %163, <4 x float>* %164, align 16, !tbaa !38
  %165 = add nsw i32 %3, 23
  %166 = mul nsw i32 %165, %4
  %167 = add nsw i32 %166, %2
  %168 = sext i32 %167 to i64
  %169 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %168
  %170 = load <4 x float>, <4 x float> addrspace(1)* %169, align 16, !tbaa !38
  %171 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 23
  store <4 x float> %170, <4 x float>* %171, align 16, !tbaa !38
  %172 = add nsw i32 %3, 24
  %173 = mul nsw i32 %172, %4
  %174 = add nsw i32 %173, %2
  %175 = sext i32 %174 to i64
  %176 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %175
  %177 = load <4 x float>, <4 x float> addrspace(1)* %176, align 16, !tbaa !38
  %178 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 24
  store <4 x float> %177, <4 x float>* %178, align 16, !tbaa !38
  %179 = add nsw i32 %3, 25
  %180 = mul nsw i32 %179, %4
  %181 = add nsw i32 %180, %2
  %182 = sext i32 %181 to i64
  %183 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %182
  %184 = load <4 x float>, <4 x float> addrspace(1)* %183, align 16, !tbaa !38
  %185 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 25
  store <4 x float> %184, <4 x float>* %185, align 16, !tbaa !38
  %186 = add nsw i32 %3, 26
  %187 = mul nsw i32 %186, %4
  %188 = add nsw i32 %187, %2
  %189 = sext i32 %188 to i64
  %190 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %189
  %191 = load <4 x float>, <4 x float> addrspace(1)* %190, align 16, !tbaa !38
  %192 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 26
  store <4 x float> %191, <4 x float>* %192, align 16, !tbaa !38
  %193 = add nsw i32 %3, 27
  %194 = mul nsw i32 %193, %4
  %195 = add nsw i32 %194, %2
  %196 = sext i32 %195 to i64
  %197 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %196
  %198 = load <4 x float>, <4 x float> addrspace(1)* %197, align 16, !tbaa !38
  %199 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 27
  store <4 x float> %198, <4 x float>* %199, align 16, !tbaa !38
  %200 = add nsw i32 %3, 28
  %201 = mul nsw i32 %200, %4
  %202 = add nsw i32 %201, %2
  %203 = sext i32 %202 to i64
  %204 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %203
  %205 = load <4 x float>, <4 x float> addrspace(1)* %204, align 16, !tbaa !38
  %206 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 28
  store <4 x float> %205, <4 x float>* %206, align 16, !tbaa !38
  %207 = add nsw i32 %3, 29
  %208 = mul nsw i32 %207, %4
  %209 = add nsw i32 %208, %2
  %210 = sext i32 %209 to i64
  %211 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %210
  %212 = load <4 x float>, <4 x float> addrspace(1)* %211, align 16, !tbaa !38
  %213 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 29
  store <4 x float> %212, <4 x float>* %213, align 16, !tbaa !38
  %214 = add nsw i32 %3, 30
  %215 = mul nsw i32 %214, %4
  %216 = add nsw i32 %215, %2
  %217 = sext i32 %216 to i64
  %218 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %217
  %219 = load <4 x float>, <4 x float> addrspace(1)* %218, align 16, !tbaa !38
  %220 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 30
  store <4 x float> %219, <4 x float>* %220, align 16, !tbaa !38
  %221 = add nsw i32 %3, 31
  %222 = mul nsw i32 %221, %4
  %223 = add nsw i32 %222, %2
  %224 = sext i32 %223 to i64
  %225 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %0, i64 %224
  %226 = load <4 x float>, <4 x float> addrspace(1)* %225, align 16, !tbaa !38
  %227 = getelementptr inbounds <4 x float>, <4 x float>* %1, i64 31
  store <4 x float> %226, <4 x float>* %227, align 16, !tbaa !38
  ret void
}

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.start.p0i8(i64 immarg, i8* nocapture) #1

attributes #0 = { argmemonly convergent nounwind "frame-pointer"="all" "min-legal-vector-width"="64" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly nocallback nofree nosync nounwind willreturn }
attributes #2 = { argmemonly norecurse nounwind "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #3 = { nounwind }
attributes #4 = { nobuiltin "no-builtins" }

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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)*, <2 x i32>, <4 x float> addrspace(1)*, <4 x float> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blend4x4Row", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 24, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blend4x4Row_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_strideInOut", i32 4, i32 4, i32 0, !"int", !"m_strideIn", i32 8, i32 4, i32 0, !"int", !"m_stepInc", i32 12, i32 4, i32 0, !"int", !"m_offsetY", i32 16, i32 4, i32 0, !"uint", !"m_globalWidth", i32 20, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inOut"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inNum"}
!22 = !{!23, !24, i64 16}
!23 = !{!"_ZTSN10bm3dnr_buf29bm3dnr_buf_blend4x4Row_paramsE", !24, i64 0, !24, i64 4, !24, i64 8, !24, i64 12, !24, i64 16, !24, i64 20}
!24 = !{!"int", !25, i64 0}
!25 = !{!"omnipotent char", !26, i64 0}
!26 = !{!"Simple C++ TBAA"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blend4x4Row)"}
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

