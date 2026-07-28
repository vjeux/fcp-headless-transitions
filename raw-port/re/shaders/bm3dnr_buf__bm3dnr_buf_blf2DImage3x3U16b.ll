0x0000000001a4bd -- bm3dnr_buf::bm3dnr_buf_blf2DImage3x3U16b:
source_filename = "bm3dnr_buf::bm3dnr_buf_blf2DImage3x3U16b"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params" = type { i32, i32, i32, i32, float, i32, i32 }

; Function Attrs: argmemonly nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blf2DImage3x3U16b"(%"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %3) local_unnamed_addr #0 {
  %5 = extractelement <2 x i32> %1, i64 0
  %6 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params" addrspace(2)* %0, i64 0, i32 5
  %7 = load i32, i32 addrspace(2)* %6, align 4, !tbaa !22, !alias.scope !28, !noalias !31
  %8 = icmp ult i32 %5, %7
  br i1 %8, label %9, label %160

9:                                                ; preds = %4
  %10 = extractelement <2 x i32> %1, i64 1
  %11 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params" addrspace(2)* %0, i64 0, i32 6
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !34, !alias.scope !28, !noalias !31
  %13 = icmp ult i32 %10, %12
  br i1 %13, label %14, label %160

14:                                               ; preds = %9
  %15 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params" addrspace(2)* %0, i64 0, i32 0
  %16 = load i32, i32 addrspace(2)* %15, align 4, !tbaa !35, !alias.scope !28, !noalias !31
  %17 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params" addrspace(2)* %0, i64 0, i32 1
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !36, !alias.scope !28, !noalias !31
  %19 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params" addrspace(2)* %0, i64 0, i32 2
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !37, !alias.scope !28, !noalias !31
  %21 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params" addrspace(2)* %0, i64 0, i32 3
  %22 = load i32, i32 addrspace(2)* %21, align 4, !tbaa !38, !alias.scope !28, !noalias !31
  %23 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params" addrspace(2)* %0, i64 0, i32 4
  %24 = load float, float addrspace(2)* %23, align 4, !tbaa !39, !alias.scope !28, !noalias !31
  %25 = add i32 %5, -1
  %26 = add nuw i32 %5, 1
  %27 = add i32 %10, -1
  %28 = add nuw i32 %10, 1
  %29 = icmp sgt i32 %25, 0
  %30 = select i1 %29, i32 %25, i32 0
  %31 = icmp slt i32 %26, %16
  %32 = add nsw i32 %16, -1
  %33 = select i1 %31, i32 %26, i32 %32
  %34 = icmp sgt i32 %27, 0
  %35 = select i1 %34, i32 %27, i32 0
  %36 = icmp slt i32 %28, %18
  %37 = add nsw i32 %18, -1
  %38 = select i1 %36, i32 %28, i32 %37
  %39 = mul nsw i32 %20, %35
  %40 = add nsw i32 %39, %30
  %41 = sext i32 %40 to i64
  %42 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %41
  %43 = load <4 x i16>, <4 x i16> addrspace(1)* %42, align 8, !tbaa !40, !alias.scope !41, !noalias !42
  %44 = tail call <4 x float> @air.convert.f.v4f32.u.v4i16(<4 x i16> %43) #1
  %45 = add nsw i32 %39, %5
  %46 = sext i32 %45 to i64
  %47 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %46
  %48 = load <4 x i16>, <4 x i16> addrspace(1)* %47, align 8, !tbaa !40, !alias.scope !41, !noalias !42
  %49 = tail call <4 x float> @air.convert.f.v4f32.u.v4i16(<4 x i16> %48) #1
  %50 = add nsw i32 %39, %33
  %51 = sext i32 %50 to i64
  %52 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %51
  %53 = load <4 x i16>, <4 x i16> addrspace(1)* %52, align 8, !tbaa !40, !alias.scope !41, !noalias !42
  %54 = tail call <4 x float> @air.convert.f.v4f32.u.v4i16(<4 x i16> %53) #1
  %55 = mul nsw i32 %20, %10
  %56 = add nsw i32 %55, %30
  %57 = sext i32 %56 to i64
  %58 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %57
  %59 = load <4 x i16>, <4 x i16> addrspace(1)* %58, align 8, !tbaa !40, !alias.scope !41, !noalias !42
  %60 = tail call <4 x float> @air.convert.f.v4f32.u.v4i16(<4 x i16> %59) #1
  %61 = add nsw i32 %55, %5
  %62 = sext i32 %61 to i64
  %63 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %62
  %64 = load <4 x i16>, <4 x i16> addrspace(1)* %63, align 8, !tbaa !40, !alias.scope !41, !noalias !42
  %65 = tail call <4 x float> @air.convert.f.v4f32.u.v4i16(<4 x i16> %64) #1
  %66 = add nsw i32 %55, %33
  %67 = sext i32 %66 to i64
  %68 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %67
  %69 = load <4 x i16>, <4 x i16> addrspace(1)* %68, align 8, !tbaa !40, !alias.scope !41, !noalias !42
  %70 = tail call <4 x float> @air.convert.f.v4f32.u.v4i16(<4 x i16> %69) #1
  %71 = mul nsw i32 %38, %20
  %72 = add nsw i32 %71, %30
  %73 = sext i32 %72 to i64
  %74 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %73
  %75 = load <4 x i16>, <4 x i16> addrspace(1)* %74, align 8, !tbaa !40, !alias.scope !41, !noalias !42
  %76 = tail call <4 x float> @air.convert.f.v4f32.u.v4i16(<4 x i16> %75) #1
  %77 = add nsw i32 %71, %5
  %78 = sext i32 %77 to i64
  %79 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %78
  %80 = load <4 x i16>, <4 x i16> addrspace(1)* %79, align 8, !tbaa !40, !alias.scope !41, !noalias !42
  %81 = tail call <4 x float> @air.convert.f.v4f32.u.v4i16(<4 x i16> %80) #1
  %82 = add nsw i32 %71, %33
  %83 = sext i32 %82 to i64
  %84 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %83
  %85 = load <4 x i16>, <4 x i16> addrspace(1)* %84, align 8, !tbaa !40, !alias.scope !41, !noalias !42
  %86 = tail call <4 x float> @air.convert.f.v4f32.u.v4i16(<4 x i16> %85) #1
  %87 = insertelement <4 x float> undef, float %24, i64 0
  %88 = shufflevector <4 x float> %87, <4 x float> undef, <4 x i32> zeroinitializer
  %89 = fsub <4 x float> %65, %49
  %90 = fsub <4 x float> %65, %81
  %91 = fmul <4 x float> %89, %89
  %92 = fmul <4 x float> %88, %91
  %93 = tail call <4 x float> @air.exp2.v4f32(<4 x float> %92) #1
  %94 = fmul <4 x float> %90, %90
  %95 = fmul <4 x float> %88, %94
  %96 = tail call <4 x float> @air.exp2.v4f32(<4 x float> %95) #1
  %97 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %49, <4 x float> %93, <4 x float> %65)
  %98 = fadd <4 x float> %93, <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>
  %99 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %81, <4 x float> %96, <4 x float> %97)
  %100 = fadd <4 x float> %98, %96
  %101 = shufflevector <4 x float> %44, <4 x float> undef, <4 x i32> <i32 3, i32 undef, i32 undef, i32 undef>
  %102 = shufflevector <4 x float> %101, <4 x float> %49, <4 x i32> <i32 0, i32 4, i32 5, i32 6>
  %103 = shufflevector <4 x float> %76, <4 x float> undef, <4 x i32> <i32 3, i32 undef, i32 undef, i32 undef>
  %104 = shufflevector <4 x float> %103, <4 x float> %81, <4 x i32> <i32 0, i32 4, i32 5, i32 6>
  %105 = fsub <4 x float> %65, %102
  %106 = fsub <4 x float> %65, %104
  %107 = fmul <4 x float> %105, %105
  %108 = fmul <4 x float> %88, %107
  %109 = tail call <4 x float> @air.exp2.v4f32(<4 x float> %108) #1
  %110 = fmul <4 x float> %106, %106
  %111 = fmul <4 x float> %88, %110
  %112 = tail call <4 x float> @air.exp2.v4f32(<4 x float> %111) #1
  %113 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %102, <4 x float> %109, <4 x float> %99)
  %114 = fadd <4 x float> %100, %109
  %115 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %104, <4 x float> %112, <4 x float> %113)
  %116 = fadd <4 x float> %114, %112
  %117 = shufflevector <4 x float> %49, <4 x float> undef, <3 x i32> <i32 1, i32 2, i32 3>
  %118 = shufflevector <3 x float> %117, <3 x float> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %119 = shufflevector <4 x float> %118, <4 x float> %54, <4 x i32> <i32 0, i32 1, i32 2, i32 4>
  %120 = shufflevector <4 x float> %81, <4 x float> undef, <3 x i32> <i32 1, i32 2, i32 3>
  %121 = shufflevector <3 x float> %120, <3 x float> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %122 = shufflevector <4 x float> %121, <4 x float> %86, <4 x i32> <i32 0, i32 1, i32 2, i32 4>
  %123 = fsub <4 x float> %65, %119
  %124 = fsub <4 x float> %65, %122
  %125 = fmul <4 x float> %123, %123
  %126 = fmul <4 x float> %88, %125
  %127 = tail call <4 x float> @air.exp2.v4f32(<4 x float> %126) #1
  %128 = fmul <4 x float> %124, %124
  %129 = fmul <4 x float> %88, %128
  %130 = tail call <4 x float> @air.exp2.v4f32(<4 x float> %129) #1
  %131 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %119, <4 x float> %127, <4 x float> %115)
  %132 = fadd <4 x float> %116, %127
  %133 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %122, <4 x float> %130, <4 x float> %131)
  %134 = fadd <4 x float> %132, %130
  %135 = shufflevector <4 x float> %60, <4 x float> undef, <4 x i32> <i32 3, i32 undef, i32 undef, i32 undef>
  %136 = shufflevector <4 x float> %135, <4 x float> %65, <4 x i32> <i32 0, i32 4, i32 5, i32 6>
  %137 = shufflevector <4 x float> %65, <4 x float> undef, <3 x i32> <i32 1, i32 2, i32 3>
  %138 = shufflevector <3 x float> %137, <3 x float> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %139 = shufflevector <4 x float> %138, <4 x float> %70, <4 x i32> <i32 0, i32 1, i32 2, i32 4>
  %140 = fsub <4 x float> %65, %136
  %141 = fsub <4 x float> %65, %139
  %142 = fmul <4 x float> %140, %140
  %143 = fmul <4 x float> %88, %142
  %144 = tail call <4 x float> @air.exp2.v4f32(<4 x float> %143) #1
  %145 = fmul <4 x float> %141, %141
  %146 = fmul <4 x float> %88, %145
  %147 = tail call <4 x float> @air.exp2.v4f32(<4 x float> %146) #1
  %148 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %136, <4 x float> %144, <4 x float> %133)
  %149 = fadd <4 x float> %134, %144
  %150 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %139, <4 x float> %147, <4 x float> %148)
  %151 = fadd <4 x float> %149, %147
  %152 = fdiv <4 x float> %150, %151
  %153 = fadd <4 x float> %152, <float 5.000000e-01, float 5.000000e-01, float 5.000000e-01, float 5.000000e-01>
  %154 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %153, <4 x float> zeroinitializer, <4 x float> <float 6.553500e+04, float 6.553500e+04, float 6.553500e+04, float 6.553500e+04>) #1
  %155 = tail call <4 x i16> @air.convert.u.v4i16.f.v4f32(<4 x float> %154) #1
  %156 = mul nsw i32 %22, %10
  %157 = add nsw i32 %156, %5
  %158 = sext i32 %157 to i64
  %159 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %3, i64 %158
  store <4 x i16> %155, <4 x i16> addrspace(1)* %159, align 8, !tbaa !40, !alias.scope !43, !noalias !44
  br label %160

160:                                              ; preds = %14, %9, %4
  ret void
}

; Function Attrs: nounwind readnone
declare <4 x i16> @air.convert.u.v4i16.f.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.clamp.v4f32(<4 x float>, <4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <4 x float> @llvm.fmuladd.v4f32(<4 x float>, <4 x float>, <4 x float>) #2

; Function Attrs: nounwind readnone
declare <4 x float> @air.exp2.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.convert.f.v4f32.u.v4i16(<4 x i16>) local_unnamed_addr #1

attributes #0 = { argmemonly nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { nounwind readnone }
attributes #2 = { nocallback nofree nosync nounwind readnone speculatable willreturn }

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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params" addrspace(2)*, <2 x i32>, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blf2DImage3x3U16b", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 28, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blf2DImage3x3U16b_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_width", i32 4, i32 4, i32 0, !"int", !"m_height", i32 8, i32 4, i32 0, !"int", !"m_inputStride", i32 12, i32 4, i32 0, !"int", !"m_outputStride", i32 16, i32 4, i32 0, !"float", !"m_sigma", i32 20, i32 4, i32 0, !"uint", !"m_globalWidth", i32 24, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"input"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"output"}
!22 = !{!23, !24, i64 20}
!23 = !{!"_ZTSN10bm3dnr_buf35bm3dnr_buf_blf2DImage3x3U16b_paramsE", !24, i64 0, !24, i64 4, !24, i64 8, !24, i64 12, !27, i64 16, !24, i64 20, !24, i64 24}
!24 = !{!"int", !25, i64 0}
!25 = !{!"omnipotent char", !26, i64 0}
!26 = !{!"Simple C++ TBAA"}
!27 = !{!"float", !25, i64 0}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(0)"}
!30 = distinct !{!30, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blf2DImage3x3U16b)"}
!31 = !{!32, !33}
!32 = distinct !{!32, !30, !"air-alias-scope-arg(2)"}
!33 = distinct !{!33, !30, !"air-alias-scope-arg(3)"}
!34 = !{!23, !24, i64 24}
!35 = !{!23, !24, i64 0}
!36 = !{!23, !24, i64 4}
!37 = !{!23, !24, i64 8}
!38 = !{!23, !24, i64 12}
!39 = !{!23, !27, i64 16}
!40 = !{!25, !25, i64 0}
!41 = !{!32}
!42 = !{!29, !33}
!43 = !{!33}
!44 = !{!29, !32}

