0x000000000218ed -- bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b:
source_filename = "bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" = type { i32, i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly nounwind
define void @"bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %3) local_unnamed_addr #0 {
  %5 = extractelement <2 x i32> %1, i64 0
  %6 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 4
  %7 = load i32, i32 addrspace(2)* %6, align 4, !tbaa !22, !alias.scope !27, !noalias !30
  %8 = icmp ult i32 %5, %7
  br i1 %8, label %9, label %120

9:                                                ; preds = %4
  %10 = extractelement <2 x i32> %1, i64 1
  %11 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)* %0, i64 0, i32 5
  %12 = load i32, i32 addrspace(2)* %11, align 4, !tbaa !33, !alias.scope !27, !noalias !30
  %13 = icmp ult i32 %10, %12
  br i1 %13, label %14, label %120

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
  %42 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %41
  %43 = load <4 x i16>, <4 x i16> addrspace(1)* %42, align 8, !tbaa !38, !alias.scope !39, !noalias !40
  %44 = tail call <4 x i32> @air.convert.u.v4i32.s.v4i16(<4 x i16> %43) #1
  %45 = zext i32 %39 to i64
  %46 = add nuw nsw i64 %45, %23
  %47 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %46
  %48 = load <4 x i16>, <4 x i16> addrspace(1)* %47, align 8, !tbaa !38, !alias.scope !39, !noalias !40
  %49 = tail call <4 x i32> @air.convert.u.v4i32.s.v4i16(<4 x i16> %48) #1
  %50 = add i32 %34, %39
  %51 = zext i32 %50 to i64
  %52 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %51
  %53 = load <4 x i16>, <4 x i16> addrspace(1)* %52, align 8, !tbaa !38, !alias.scope !39, !noalias !40
  %54 = tail call <4 x i32> @air.convert.u.v4i32.s.v4i16(<4 x i16> %53) #1
  %55 = sext i32 %27 to i64
  %56 = zext i32 %16 to i64
  %57 = mul nuw i64 %56, %24
  %58 = add i64 %57, %55
  %59 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %58
  %60 = load <4 x i16>, <4 x i16> addrspace(1)* %59, align 8, !tbaa !38, !alias.scope !39, !noalias !40
  %61 = tail call <4 x i32> @air.convert.u.v4i32.s.v4i16(<4 x i16> %60) #1
  %62 = add nuw i64 %57, %23
  %63 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %62
  %64 = load <4 x i16>, <4 x i16> addrspace(1)* %63, align 8, !tbaa !38, !alias.scope !39, !noalias !40
  %65 = tail call <4 x i32> @air.convert.u.v4i32.s.v4i16(<4 x i16> %64) #1
  %66 = sext i32 %34 to i64
  %67 = add i64 %57, %66
  %68 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %67
  %69 = load <4 x i16>, <4 x i16> addrspace(1)* %68, align 8, !tbaa !38, !alias.scope !39, !noalias !40
  %70 = tail call <4 x i32> @air.convert.u.v4i32.s.v4i16(<4 x i16> %69) #1
  %71 = mul i32 %38, %16
  %72 = add i32 %71, %27
  %73 = zext i32 %72 to i64
  %74 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %73
  %75 = load <4 x i16>, <4 x i16> addrspace(1)* %74, align 8, !tbaa !38, !alias.scope !39, !noalias !40
  %76 = tail call <4 x i32> @air.convert.u.v4i32.s.v4i16(<4 x i16> %75) #1
  %77 = zext i32 %71 to i64
  %78 = add nuw nsw i64 %77, %23
  %79 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %78
  %80 = load <4 x i16>, <4 x i16> addrspace(1)* %79, align 8, !tbaa !38, !alias.scope !39, !noalias !40
  %81 = tail call <4 x i32> @air.convert.u.v4i32.s.v4i16(<4 x i16> %80) #1
  %82 = add i32 %71, %34
  %83 = zext i32 %82 to i64
  %84 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %83
  %85 = load <4 x i16>, <4 x i16> addrspace(1)* %84, align 8, !tbaa !38, !alias.scope !39, !noalias !40
  %86 = tail call <4 x i32> @air.convert.u.v4i32.s.v4i16(<4 x i16> %85) #1
  %87 = add <4 x i32> %61, %44
  %88 = add <4 x i32> %87, %76
  %89 = add <4 x i32> %65, %49
  %90 = add <4 x i32> %89, %81
  %91 = add <4 x i32> %70, %54
  %92 = add <4 x i32> %91, %86
  %93 = extractelement <4 x i32> %88, i64 3
  %94 = extractelement <4 x i32> %90, i64 0
  %95 = extractelement <4 x i32> %90, i64 1
  %96 = add i32 %95, %94
  %97 = add i32 %96, %93
  %98 = extractelement <4 x i32> %90, i64 2
  %99 = add i32 %96, %98
  %100 = extractelement <4 x i32> %90, i64 3
  %101 = add i32 %95, %98
  %102 = add i32 %101, %100
  %103 = add i32 %98, %100
  %104 = extractelement <4 x i32> %92, i64 0
  %105 = add i32 %103, %104
  %106 = udiv i32 %97, 9
  %107 = udiv i32 %99, 9
  %108 = udiv i32 %102, 9
  %109 = udiv i32 %105, 9
  %110 = insertelement <4 x i32> undef, i32 %106, i64 0
  %111 = insertelement <4 x i32> %110, i32 %107, i64 1
  %112 = insertelement <4 x i32> %111, i32 %108, i64 2
  %113 = insertelement <4 x i32> %112, i32 %109, i64 3
  %114 = tail call <4 x i32> @air.clamp.u.v4i32(<4 x i32> %113, <4 x i32> <i32 -32768, i32 -32768, i32 -32768, i32 -32768>, <4 x i32> <i32 32767, i32 32767, i32 32767, i32 32767>) #1
  %115 = tail call <4 x i16> @air.convert.s.v4i16.u.v4i32(<4 x i32> %114) #1
  %116 = zext i32 %18 to i64
  %117 = mul nuw i64 %116, %24
  %118 = add nuw i64 %117, %23
  %119 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %3, i64 %118
  store <4 x i16> %115, <4 x i16> addrspace(1)* %119, align 8, !tbaa !38, !alias.scope !41, !noalias !42
  br label %120

120:                                              ; preds = %14, %9, %4
  ret void
}

; Function Attrs: nounwind readnone
declare <4 x i16> @air.convert.s.v4i16.u.v4i32(<4 x i32>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x i32> @air.clamp.u.v4i32(<4 x i32>, <4 x i32>, <4 x i32>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x i32> @air.convert.u.v4i32.s.v4i16(<4 x i16>) local_unnamed_addr #1

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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Column_params" addrspace(2)*, <2 x i32>, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 24, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"uint", !"m_strideIn", i32 4, i32 4, i32 0, !"uint", !"m_strideOut", i32 8, i32 4, i32 0, !"uint", !"m_width", i32 12, i32 4, i32 0, !"uint", !"m_height", i32 16, i32 4, i32 0, !"uint", !"m_globalWidth", i32 20, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"short4", !"air.arg_name", !"input"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"short4", !"air.arg_name", !"output"}
!22 = !{!23, !24, i64 16}
!23 = !{!"_ZTSN10bm3dnr_buf42bm3dnr_buf_filterImage2D3x3Plane16b_paramsE", !24, i64 0, !24, i64 4, !24, i64 8, !24, i64 12, !24, i64 16, !24, i64 20}
!24 = !{!"int", !25, i64 0}
!25 = !{!"omnipotent char", !26, i64 0}
!26 = !{!"Simple C++ TBAA"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(0)"}
!29 = distinct !{!29, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane16b)"}
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

