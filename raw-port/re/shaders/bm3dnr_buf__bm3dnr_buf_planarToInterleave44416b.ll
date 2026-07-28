0x0000000006663d -- bm3dnr_buf::bm3dnr_buf_planarToInterleave44416b:
source_filename = "bm3dnr_buf::bm3dnr_buf_planarToInterleave44416b"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" = type { i32, i32, i32, i32, i32, i32, i32, i16, i32, i32 }

; Function Attrs: argmemonly nounwind
define void @"bm3dnr_buf::bm3dnr_buf_planarToInterleave44416b"(%"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %4, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %5) local_unnamed_addr #0 {
  %7 = extractelement <2 x i32> %1, i64 0
  %8 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 8
  %9 = load i32, i32 addrspace(2)* %8, align 4, !tbaa !24, !alias.scope !30, !noalias !33
  %10 = icmp ult i32 %7, %9
  br i1 %10, label %11, label %94

11:                                               ; preds = %6
  %12 = extractelement <2 x i32> %1, i64 1
  %13 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 9
  %14 = load i32, i32 addrspace(2)* %13, align 4, !tbaa !38, !alias.scope !30, !noalias !33
  %15 = icmp ult i32 %12, %14
  br i1 %15, label %16, label %94

16:                                               ; preds = %11
  %17 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 0
  %18 = load i32, i32 addrspace(2)* %17, align 4, !tbaa !39, !alias.scope !30, !noalias !33
  %19 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 1
  %20 = load i32, i32 addrspace(2)* %19, align 4, !tbaa !40, !alias.scope !30, !noalias !33
  %21 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 2
  %22 = load i32, i32 addrspace(2)* %21, align 4, !tbaa !41, !alias.scope !30, !noalias !33
  %23 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 3
  %24 = load i32, i32 addrspace(2)* %23, align 4, !tbaa !42, !alias.scope !30, !noalias !33
  %25 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 4
  %26 = load i32, i32 addrspace(2)* %25, align 4, !tbaa !43, !alias.scope !30, !noalias !33
  %27 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 5
  %28 = load i32, i32 addrspace(2)* %27, align 4, !tbaa !44, !alias.scope !30, !noalias !33
  %29 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 6
  %30 = load i32, i32 addrspace(2)* %29, align 4, !tbaa !45, !alias.scope !30, !noalias !33
  %31 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 7
  %32 = load i16, i16 addrspace(2)* %31, align 4, !tbaa !46, !alias.scope !30, !noalias !33
  %33 = zext i32 %7 to i64
  %34 = zext i32 %12 to i64
  %35 = zext i32 %18 to i64
  %36 = mul nuw i64 %35, %34
  %37 = add nuw i64 %36, %33
  %38 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %37
  %39 = load <4 x i16>, <4 x i16> addrspace(1)* %38, align 8, !tbaa !47, !alias.scope !48, !noalias !49
  %40 = zext i32 %20 to i64
  %41 = mul nuw i64 %40, %34
  %42 = add nuw i64 %41, %33
  %43 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %3, i64 %42
  %44 = load <4 x i16>, <4 x i16> addrspace(1)* %43, align 8, !tbaa !47, !alias.scope !50, !noalias !51
  %45 = zext i32 %22 to i64
  %46 = mul nuw i64 %45, %34
  %47 = add nuw i64 %46, %33
  %48 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %4, i64 %47
  %49 = load <4 x i16>, <4 x i16> addrspace(1)* %48, align 8, !tbaa !47, !alias.scope !52, !noalias !53
  %50 = shufflevector <4 x i16> <i16 -1, i16 undef, i16 undef, i16 undef>, <4 x i16> %39, <4 x i32> <i32 0, i32 4, i32 undef, i32 undef>
  %51 = shufflevector <4 x i16> %50, <4 x i16> %44, <4 x i32> <i32 0, i32 1, i32 4, i32 undef>
  %52 = shufflevector <4 x i16> %51, <4 x i16> %49, <4 x i32> <i32 0, i32 1, i32 2, i32 4>
  %53 = insertelement <4 x i16> %39, i16 -1, i64 0
  %54 = shufflevector <4 x i16> %53, <4 x i16> %44, <4 x i32> <i32 0, i32 1, i32 5, i32 undef>
  %55 = shufflevector <4 x i16> %54, <4 x i16> %49, <4 x i32> <i32 0, i32 1, i32 2, i32 5>
  %56 = shufflevector <4 x i16> <i16 -1, i16 undef, i16 undef, i16 undef>, <4 x i16> %39, <4 x i32> <i32 0, i32 6, i32 undef, i32 undef>
  %57 = shufflevector <4 x i16> %56, <4 x i16> %44, <4 x i32> <i32 0, i32 1, i32 6, i32 undef>
  %58 = shufflevector <4 x i16> %57, <4 x i16> %49, <4 x i32> <i32 0, i32 1, i32 2, i32 6>
  %59 = shufflevector <4 x i16> <i16 -1, i16 undef, i16 undef, i16 undef>, <4 x i16> %39, <4 x i32> <i32 0, i32 7, i32 undef, i32 undef>
  %60 = shufflevector <4 x i16> %59, <4 x i16> %44, <4 x i32> <i32 0, i32 1, i32 7, i32 undef>
  %61 = shufflevector <4 x i16> %60, <4 x i16> %49, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %62 = insertelement <4 x i16> <i16 -1, i16 undef, i16 undef, i16 undef>, i16 %32, i64 1
  %63 = insertelement <4 x i16> %62, i16 %32, i64 2
  %64 = insertelement <4 x i16> %63, i16 %32, i64 3
  %65 = trunc i32 %30 to i16
  %66 = insertelement <4 x i16> <i16 0, i16 undef, i16 undef, i16 undef>, i16 %65, i64 1
  %67 = insertelement <4 x i16> %66, i16 %65, i64 2
  %68 = insertelement <4 x i16> %67, i16 %65, i64 3
  %69 = mul i32 %26, %12
  %70 = add i32 %69, %28
  %71 = mul i32 %70, %24
  %72 = tail call <4 x i16> @air.min.u.v4i16(<4 x i16> %52, <4 x i16> %64) #1
  %73 = and <4 x i16> %68, <i16 15, i16 15, i16 15, i16 15>
  %74 = shl <4 x i16> %72, %73
  %75 = shl nuw nsw i64 %33, 2
  %76 = zext i32 %71 to i64
  %77 = add nuw nsw i64 %75, %76
  %78 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %5, i64 %77
  store <4 x i16> %74, <4 x i16> addrspace(1)* %78, align 8, !tbaa !47, !alias.scope !54, !noalias !55
  %79 = tail call <4 x i16> @air.min.u.v4i16(<4 x i16> %55, <4 x i16> %64) #1
  %80 = shl <4 x i16> %79, %73
  %81 = or i64 %75, 1
  %82 = add nuw nsw i64 %81, %76
  %83 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %5, i64 %82
  store <4 x i16> %80, <4 x i16> addrspace(1)* %83, align 8, !tbaa !47, !alias.scope !54, !noalias !55
  %84 = tail call <4 x i16> @air.min.u.v4i16(<4 x i16> %58, <4 x i16> %64) #1
  %85 = shl <4 x i16> %84, %73
  %86 = or i64 %75, 2
  %87 = add nuw nsw i64 %86, %76
  %88 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %5, i64 %87
  store <4 x i16> %85, <4 x i16> addrspace(1)* %88, align 8, !tbaa !47, !alias.scope !54, !noalias !55
  %89 = tail call <4 x i16> @air.min.u.v4i16(<4 x i16> %61, <4 x i16> %64) #1
  %90 = shl <4 x i16> %89, %73
  %91 = or i64 %75, 3
  %92 = add nuw nsw i64 %91, %76
  %93 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %5, i64 %92
  store <4 x i16> %90, <4 x i16> addrspace(1)* %93, align 8, !tbaa !47, !alias.scope !54, !noalias !55
  br label %94

94:                                               ; preds = %16, %11, %6
  ret void
}

; Function Attrs: nounwind readnone
declare <4 x i16> @air.min.u.v4i16(<4 x i16>, <4 x i16>) local_unnamed_addr #1

attributes #0 = { argmemonly nounwind "frame-pointer"="all" "min-legal-vector-width"="64" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)*, <2 x i32>, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_planarToInterleave44416b", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 40, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_planarToInterleave44416b_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"uint", !"m_strideY", i32 4, i32 4, i32 0, !"uint", !"m_strideU", i32 8, i32 4, i32 0, !"uint", !"m_strideV", i32 12, i32 4, i32 0, !"uint", !"m_strideYUV", i32 16, i32 4, i32 0, !"uint", !"m_mul", i32 20, i32 4, i32 0, !"uint", !"m_off", i32 24, i32 4, i32 0, !"uint", !"m_shift", i32 28, i32 2, i32 0, !"ushort", !"m_clamp", i32 32, i32 4, i32 0, !"uint", !"m_globalWidth", i32 36, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"inputY"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"inputU"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"inputV"}
!23 = !{i32 5, !"air.buffer", !"air.location_index", i32 4, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"outputYUV"}
!24 = !{!25, !26, i64 32}
!25 = !{!"_ZTSN10bm3dnr_buf42bm3dnr_buf_planarToInterleave44416b_paramsE", !26, i64 0, !26, i64 4, !26, i64 8, !26, i64 12, !26, i64 16, !26, i64 20, !26, i64 24, !29, i64 28, !26, i64 32, !26, i64 36}
!26 = !{!"int", !27, i64 0}
!27 = !{!"omnipotent char", !28, i64 0}
!28 = !{!"Simple C++ TBAA"}
!29 = !{!"short", !27, i64 0}
!30 = !{!31}
!31 = distinct !{!31, !32, !"air-alias-scope-arg(0)"}
!32 = distinct !{!32, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_planarToInterleave44416b)"}
!33 = !{!34, !35, !36, !37}
!34 = distinct !{!34, !32, !"air-alias-scope-arg(2)"}
!35 = distinct !{!35, !32, !"air-alias-scope-arg(3)"}
!36 = distinct !{!36, !32, !"air-alias-scope-arg(4)"}
!37 = distinct !{!37, !32, !"air-alias-scope-arg(5)"}
!38 = !{!25, !26, i64 36}
!39 = !{!25, !26, i64 0}
!40 = !{!25, !26, i64 4}
!41 = !{!25, !26, i64 8}
!42 = !{!25, !26, i64 12}
!43 = !{!25, !26, i64 16}
!44 = !{!25, !26, i64 20}
!45 = !{!25, !26, i64 24}
!46 = !{!25, !29, i64 28}
!47 = !{!27, !27, i64 0}
!48 = !{!34}
!49 = !{!31, !35, !36, !37}
!50 = !{!35}
!51 = !{!31, !34, !36, !37}
!52 = !{!36}
!53 = !{!31, !34, !35, !37}
!54 = !{!37}
!55 = !{!31, !34, !35, !36}

