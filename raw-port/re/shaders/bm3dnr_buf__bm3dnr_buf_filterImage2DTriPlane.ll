0x000000000262dd -- bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane:
source_filename = "bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" = type { i32, i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly nounwind
define void @"bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i8> addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, <4 x i8> addrspace(1)* nocapture "air-buffer-no-alias" %3) local_unnamed_addr #0 {
  %5 = extractelement <2 x i32> %1, i64 0
  %6 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 4
  %7 = load i32, i32 addrspace(2)* %6, align 4, !tbaa !22, !alias.scope !27, !noalias !30
  %8 = icmp ult i32 %5, %7
  br i1 %8, label %9, label %119

9:                                                ; preds = %4
  %10 = extractelement <2 x i32> %1, i64 1
  %11 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 5
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !33, !alias.scope !27, !noalias !30
  %13 = icmp ult i32 %10, %12
  br i1 %13, label %14, label %119

14:                                               ; preds = %9
  %15 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 0
  %16 = load i32, i32 addrspace(2)* %15, align 4, !tbaa !34, !alias.scope !27, !noalias !30
  %17 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 1
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !35, !alias.scope !27, !noalias !30
  %19 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 2
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !36, !alias.scope !27, !noalias !30
  %21 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 3
  %22 = load i32, i32 addrspace(2)* %21, align 4, !tbaa !37, !alias.scope !27, !noalias !30
  %23 = zext i32 %5 to i64
  %24 = zext i32 %10 to i64
  %25 = icmp eq i32 %5, 0
  %26 = add i32 %5, -1
  %27 = select i1 %25, i32 0, i32 %26
  %28 = icmp eq i32 %10, 0
  %29 = add i32 %10, -1
  %30 = select i1 %28, i32 0, i32 %29
  %31 = add i32 %20, -1
  %32 = icmp ult i32 %5, %31
  %33 = add nuw i32 %5, 1
  %34 = select i1 %32, i32 %33, i32 %31
  %35 = add i32 %22, -1
  %36 = icmp ult i32 %10, %35
  %37 = add nuw i32 %10, 1
  %38 = select i1 %36, i32 %37, i32 %35
  %39 = mul i32 %16, %30
  %40 = add i32 %39, %27
  %41 = zext i32 %40 to i64
  %42 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %41
  %43 = load <4 x i8>, <4 x i8> addrspace(1)* %42, align 4, !tbaa !38, !alias.scope !39, !noalias !40
  %44 = zext i32 %39 to i64
  %45 = add nuw nsw i64 %44, %23
  %46 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %45
  %47 = load <4 x i8>, <4 x i8> addrspace(1)* %46, align 4, !tbaa !38, !alias.scope !39, !noalias !40
  %48 = add i32 %34, %39
  %49 = zext i32 %48 to i64
  %50 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %49
  %51 = load <4 x i8>, <4 x i8> addrspace(1)* %50, align 4, !tbaa !38, !alias.scope !39, !noalias !40
  %52 = sext i32 %27 to i64
  %53 = zext i32 %16 to i64
  %54 = mul nuw i64 %53, %24
  %55 = add i64 %54, %52
  %56 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %55
  %57 = load <4 x i8>, <4 x i8> addrspace(1)* %56, align 4, !tbaa !38, !alias.scope !39, !noalias !40
  %58 = add nuw i64 %54, %23
  %59 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %58
  %60 = load <4 x i8>, <4 x i8> addrspace(1)* %59, align 4, !tbaa !38, !alias.scope !39, !noalias !40
  %61 = sext i32 %34 to i64
  %62 = add i64 %54, %61
  %63 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %62
  %64 = load <4 x i8>, <4 x i8> addrspace(1)* %63, align 4, !tbaa !38, !alias.scope !39, !noalias !40
  %65 = mul i32 %38, %16
  %66 = add i32 %65, %27
  %67 = zext i32 %66 to i64
  %68 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %67
  %69 = load <4 x i8>, <4 x i8> addrspace(1)* %68, align 4, !tbaa !38, !alias.scope !39, !noalias !40
  %70 = zext i32 %65 to i64
  %71 = add nuw nsw i64 %70, %23
  %72 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %71
  %73 = load <4 x i8>, <4 x i8> addrspace(1)* %72, align 4, !tbaa !38, !alias.scope !39, !noalias !40
  %74 = add i32 %65, %34
  %75 = zext i32 %74 to i64
  %76 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %75
  %77 = load <4 x i8>, <4 x i8> addrspace(1)* %76, align 4, !tbaa !38, !alias.scope !39, !noalias !40
  %78 = shufflevector <4 x i8> %43, <4 x i8> undef, <4 x i32> <i32 3, i32 undef, i32 undef, i32 undef>
  %79 = shufflevector <4 x i8> %78, <4 x i8> %47, <4 x i32> <i32 0, i32 4, i32 5, i32 6>
  %80 = shufflevector <4 x i8> %57, <4 x i8> undef, <4 x i32> <i32 3, i32 undef, i32 undef, i32 undef>
  %81 = shufflevector <4 x i8> %80, <4 x i8> %60, <4 x i32> <i32 0, i32 4, i32 5, i32 6>
  %82 = shufflevector <4 x i8> %69, <4 x i8> undef, <4 x i32> <i32 3, i32 undef, i32 undef, i32 undef>
  %83 = shufflevector <4 x i8> %82, <4 x i8> %73, <4 x i32> <i32 0, i32 4, i32 5, i32 6>
  %84 = shufflevector <4 x i8> %47, <4 x i8> undef, <3 x i32> <i32 1, i32 2, i32 3>
  %85 = shufflevector <3 x i8> %84, <3 x i8> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %86 = shufflevector <4 x i8> %85, <4 x i8> %51, <4 x i32> <i32 0, i32 1, i32 2, i32 4>
  %87 = shufflevector <4 x i8> %60, <4 x i8> undef, <3 x i32> <i32 1, i32 2, i32 3>
  %88 = shufflevector <3 x i8> %87, <3 x i8> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %89 = shufflevector <4 x i8> %88, <4 x i8> %64, <4 x i32> <i32 0, i32 1, i32 2, i32 4>
  %90 = shufflevector <4 x i8> %73, <4 x i8> undef, <3 x i32> <i32 1, i32 2, i32 3>
  %91 = shufflevector <3 x i8> %90, <3 x i8> undef, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>
  %92 = shufflevector <4 x i8> %91, <4 x i8> %77, <4 x i32> <i32 0, i32 1, i32 2, i32 4>
  %93 = tail call <4 x float> @air.convert.f.v4f32.u.v4i8(<4 x i8> %79) #1
  %94 = tail call <4 x float> @air.convert.f.v4f32.u.v4i8(<4 x i8> %83) #1
  %95 = fadd <4 x float> %93, %94
  %96 = tail call <4 x float> @air.convert.f.v4f32.u.v4i8(<4 x i8> %47) #1
  %97 = tail call <4 x float> @air.convert.f.v4f32.u.v4i8(<4 x i8> %73) #1
  %98 = fadd <4 x float> %96, %97
  %99 = tail call <4 x float> @air.convert.f.v4f32.u.v4i8(<4 x i8> %86) #1
  %100 = tail call <4 x float> @air.convert.f.v4f32.u.v4i8(<4 x i8> %92) #1
  %101 = fadd <4 x float> %99, %100
  %102 = tail call <4 x float> @air.convert.f.v4f32.u.v4i8(<4 x i8> %81) #1
  %103 = tail call <4 x float> @air.convert.f.v4f32.u.v4i8(<4 x i8> %60) #1
  %104 = tail call <4 x float> @air.convert.f.v4f32.u.v4i8(<4 x i8> %89) #1
  %105 = fadd <4 x float> %95, %101
  %106 = fmul <4 x float> %105, <float 6.250000e-02, float 6.250000e-02, float 6.250000e-02, float 6.250000e-02>
  %107 = fadd <4 x float> %98, %102
  %108 = fadd <4 x float> %107, %104
  %109 = fmul <4 x float> %108, <float 1.250000e-01, float 1.250000e-01, float 1.250000e-01, float 1.250000e-01>
  %110 = fmul <4 x float> %103, <float 2.500000e-01, float 2.500000e-01, float 2.500000e-01, float 2.500000e-01>
  %111 = fadd <4 x float> %110, %109
  %112 = fadd <4 x float> %106, %111
  %113 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %112, <4 x float> zeroinitializer, <4 x float> <float 2.550000e+02, float 2.550000e+02, float 2.550000e+02, float 2.550000e+02>) #1
  %114 = tail call <4 x i8> @air.convert.u.v4i8.f.v4f32(<4 x float> %113) #1
  %115 = zext i32 %18 to i64
  %116 = mul nuw i64 %115, %24
  %117 = add nuw i64 %116, %23
  %118 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %3, i64 %117
  store <4 x i8> %114, <4 x i8> addrspace(1)* %118, align 4, !tbaa !38, !alias.scope !41, !noalias !42
  br label %119

119:                                              ; preds = %14, %9, %4
  ret void
}

; Function Attrs: nounwind readnone
declare <4 x i8> @air.convert.u.v4i8.f.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.clamp.v4f32(<4 x float>, <4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.convert.f.v4f32.u.v4i8(<4 x i8>) local_unnamed_addr #1

attributes #0 = { argmemonly nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { nounwind readnone }

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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)*, <2 x i32>, <4 x i8> addrspace(1)*, <4 x i8> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 24, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"uint", !"m_strideIn", i32 4, i32 4, i32 0, !"uint", !"m_strideOut", i32 8, i32 4, i32 0, !"uint", !"m_width", i32 12, i32 4, i32 0, !"uint", !"m_height", i32 16, i32 4, i32 0, !"uint", !"m_globalWidth", i32 20, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uchar4", !"air.arg_name", !"input"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uchar4", !"air.arg_name", !"output"}
!22 = !{!23, !24, i64 16}
!23 = !{!"_ZTSN10bm3dnr_buf39bm3dnr_buf_filterImage2DTriPlane_paramsE", !24, i64 0, !24, i64 4, !24, i64 8, !24, i64 12, !24, i64 16, !24, i64 20}
!24 = !{!"int", !25, i64 0}
!25 = !{!"omnipotent char", !26, i64 0}
!26 = !{!"Simple C++ TBAA"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_filterImage2DTriPlane)"}
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

