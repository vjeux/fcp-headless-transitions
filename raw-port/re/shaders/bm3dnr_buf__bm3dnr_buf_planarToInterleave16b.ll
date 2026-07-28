0x0000000006510d -- bm3dnr_buf::bm3dnr_buf_planarToInterleave16b:
source_filename = "bm3dnr_buf::bm3dnr_buf_planarToInterleave16b"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" = type { i32, i32, i32, i32, i32, i32, i32, i16, i32, i32 }

; Function Attrs: argmemonly nounwind
define void @"bm3dnr_buf::bm3dnr_buf_planarToInterleave16b"(%"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %4, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %5, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %6) local_unnamed_addr #0 {
  %8 = extractelement <2 x i32> %1, i64 0
  %9 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 8
  %10 = load i32, i32 addrspace(2)* %9, align 4, !tbaa !25, !alias.scope !31, !noalias !34
  %11 = icmp ult i32 %8, %10
  br i1 %11, label %12, label %138

12:                                               ; preds = %7
  %13 = extractelement <2 x i32> %1, i64 1
  %14 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 9
  %15 = load i32, i32 addrspace(2)* %14, align 4, !tbaa !40, !alias.scope !31, !noalias !34
  %16 = icmp ult i32 %13, %15
  br i1 %16, label %17, label %138

17:                                               ; preds = %12
  %18 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 0
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !41, !alias.scope !31, !noalias !34
  %20 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 1
  %21 = load i32, i32 addrspace(2)* %20, align 4, !tbaa !42, !alias.scope !31, !noalias !34
  %22 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 2
  %23 = load i32, i32 addrspace(2)* %22, align 4, !tbaa !43, !alias.scope !31, !noalias !34
  %24 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 3
  %25 = load i32, i32 addrspace(2)* %24, align 4, !tbaa !44, !alias.scope !31, !noalias !34
  %26 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 4
  %27 = load i32, i32 addrspace(2)* %26, align 4, !tbaa !45, !alias.scope !31, !noalias !34
  %28 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 5
  %29 = load i32, i32 addrspace(2)* %28, align 4, !tbaa !46, !alias.scope !31, !noalias !34
  %30 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 6
  %31 = load i32, i32 addrspace(2)* %30, align 4, !tbaa !47, !alias.scope !31, !noalias !34
  %32 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", %"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)* %0, i64 0, i32 7
  %33 = load i16, i16 addrspace(2)* %32, align 4, !tbaa !48, !alias.scope !31, !noalias !34
  %34 = zext i32 %8 to i64
  %35 = zext i32 %13 to i64
  %36 = icmp eq i32 %29, 0
  br i1 %36, label %71, label %37

37:                                               ; preds = %17
  %38 = zext i32 %19 to i64
  %39 = mul nuw i64 %38, %35
  %40 = add nuw i64 %39, %34
  %41 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %40
  %42 = load <4 x i16>, <4 x i16> addrspace(1)* %41, align 8, !tbaa !49, !alias.scope !50, !noalias !51
  %43 = zext i32 %21 to i64
  %44 = mul nuw i64 %43, %35
  %45 = add nuw i64 %44, %34
  %46 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %3, i64 %45
  %47 = load <4 x i16>, <4 x i16> addrspace(1)* %46, align 8, !tbaa !49, !alias.scope !52, !noalias !53
  %48 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %4, i64 %45
  %49 = load <4 x i16>, <4 x i16> addrspace(1)* %48, align 8, !tbaa !49, !alias.scope !54, !noalias !55
  %50 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %5, i64 %45
  %51 = load <4 x i16>, <4 x i16> addrspace(1)* %50, align 8, !tbaa !49, !alias.scope !56, !noalias !57
  %52 = shufflevector <4 x i16> %51, <4 x i16> %42, <4 x i32> <i32 0, i32 4, i32 undef, i32 undef>
  %53 = shufflevector <4 x i16> %52, <4 x i16> %47, <4 x i32> <i32 0, i32 1, i32 4, i32 undef>
  %54 = shufflevector <4 x i16> %53, <4 x i16> %49, <4 x i32> <i32 0, i32 1, i32 2, i32 4>
  %55 = shufflevector <4 x i16> %51, <4 x i16> %42, <4 x i32> <i32 1, i32 5, i32 undef, i32 undef>
  %56 = shufflevector <4 x i16> %55, <4 x i16> %47, <4 x i32> <i32 0, i32 1, i32 5, i32 undef>
  %57 = shufflevector <4 x i16> %56, <4 x i16> %49, <4 x i32> <i32 0, i32 1, i32 2, i32 5>
  %58 = shufflevector <4 x i16> %51, <4 x i16> %42, <4 x i32> <i32 2, i32 6, i32 undef, i32 undef>
  %59 = shufflevector <4 x i16> %58, <4 x i16> %47, <4 x i32> <i32 0, i32 1, i32 6, i32 undef>
  %60 = shufflevector <4 x i16> %59, <4 x i16> %49, <4 x i32> <i32 0, i32 1, i32 2, i32 6>
  %61 = shufflevector <4 x i16> %51, <4 x i16> %42, <4 x i32> <i32 3, i32 7, i32 undef, i32 undef>
  %62 = shufflevector <4 x i16> %61, <4 x i16> %47, <4 x i32> <i32 0, i32 1, i32 7, i32 undef>
  %63 = shufflevector <4 x i16> %62, <4 x i16> %49, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %64 = insertelement <4 x i16> <i16 -1, i16 undef, i16 undef, i16 undef>, i16 %33, i64 1
  %65 = insertelement <4 x i16> %64, i16 %33, i64 2
  %66 = insertelement <4 x i16> %65, i16 %33, i64 3
  %67 = trunc i32 %31 to i16
  %68 = insertelement <4 x i16> <i16 0, i16 undef, i16 undef, i16 undef>, i16 %67, i64 1
  %69 = insertelement <4 x i16> %68, i16 %67, i64 2
  %70 = insertelement <4 x i16> %69, i16 %67, i64 3
  br label %106

71:                                               ; preds = %17
  %72 = shl nuw nsw i64 %34, 1
  %73 = or i64 %72, 1
  %74 = zext i32 %19 to i64
  %75 = mul nuw i64 %74, %35
  %76 = add nuw i64 %75, %72
  %77 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %76
  %78 = load <4 x i16>, <4 x i16> addrspace(1)* %77, align 8, !tbaa !49, !alias.scope !50, !noalias !51
  %79 = add i64 %73, %75
  %80 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %79
  %81 = load <4 x i16>, <4 x i16> addrspace(1)* %80, align 8, !tbaa !49, !alias.scope !50, !noalias !51
  %82 = zext i32 %21 to i64
  %83 = mul nuw i64 %82, %35
  %84 = add nuw i64 %83, %34
  %85 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %3, i64 %84
  %86 = load <4 x i16>, <4 x i16> addrspace(1)* %85, align 8, !tbaa !49, !alias.scope !52, !noalias !53
  %87 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %4, i64 %84
  %88 = load <4 x i16>, <4 x i16> addrspace(1)* %87, align 8, !tbaa !49, !alias.scope !54, !noalias !55
  %89 = shufflevector <4 x i16> %86, <4 x i16> %78, <4 x i32> <i32 0, i32 4, i32 undef, i32 undef>
  %90 = shufflevector <4 x i16> %89, <4 x i16> %88, <4 x i32> <i32 0, i32 1, i32 4, i32 undef>
  %91 = shufflevector <4 x i16> %90, <4 x i16> %78, <4 x i32> <i32 0, i32 1, i32 2, i32 5>
  %92 = shufflevector <4 x i16> %86, <4 x i16> %78, <4 x i32> <i32 1, i32 6, i32 undef, i32 undef>
  %93 = shufflevector <4 x i16> %92, <4 x i16> %88, <4 x i32> <i32 0, i32 1, i32 5, i32 undef>
  %94 = shufflevector <4 x i16> %93, <4 x i16> %78, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %95 = shufflevector <4 x i16> %86, <4 x i16> %81, <4 x i32> <i32 2, i32 4, i32 undef, i32 undef>
  %96 = shufflevector <4 x i16> %95, <4 x i16> %88, <4 x i32> <i32 0, i32 1, i32 6, i32 undef>
  %97 = shufflevector <4 x i16> %96, <4 x i16> %81, <4 x i32> <i32 0, i32 1, i32 2, i32 5>
  %98 = shufflevector <4 x i16> %86, <4 x i16> %81, <4 x i32> <i32 3, i32 6, i32 undef, i32 undef>
  %99 = shufflevector <4 x i16> %98, <4 x i16> %88, <4 x i32> <i32 0, i32 1, i32 7, i32 undef>
  %100 = shufflevector <4 x i16> %99, <4 x i16> %81, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %101 = insertelement <4 x i16> undef, i16 %33, i64 0
  %102 = shufflevector <4 x i16> %101, <4 x i16> undef, <4 x i32> zeroinitializer
  %103 = trunc i32 %31 to i16
  %104 = insertelement <4 x i16> undef, i16 %103, i64 0
  %105 = shufflevector <4 x i16> %104, <4 x i16> undef, <4 x i32> zeroinitializer
  br label %106

106:                                              ; preds = %71, %37
  %107 = phi <4 x i16> [ %70, %37 ], [ %105, %71 ]
  %108 = phi <4 x i16> [ %66, %37 ], [ %102, %71 ]
  %109 = phi <4 x i16> [ %63, %37 ], [ %100, %71 ]
  %110 = phi <4 x i16> [ %60, %37 ], [ %97, %71 ]
  %111 = phi <4 x i16> [ %57, %37 ], [ %94, %71 ]
  %112 = phi <4 x i16> [ %54, %37 ], [ %91, %71 ]
  %113 = mul i32 %25, %13
  %114 = add i32 %113, %27
  %115 = mul i32 %114, %23
  %116 = tail call <4 x i16> @air.min.u.v4i16(<4 x i16> %112, <4 x i16> %108) #1
  %117 = and <4 x i16> %107, <i16 15, i16 15, i16 15, i16 15>
  %118 = shl <4 x i16> %116, %117
  %119 = tail call <4 x i16> @air.min.u.v4i16(<4 x i16> %111, <4 x i16> %108) #1
  %120 = shl <4 x i16> %119, %117
  %121 = tail call <4 x i16> @air.min.u.v4i16(<4 x i16> %110, <4 x i16> %108) #1
  %122 = shl <4 x i16> %121, %117
  %123 = tail call <4 x i16> @air.min.u.v4i16(<4 x i16> %109, <4 x i16> %108) #1
  %124 = shl <4 x i16> %123, %117
  %125 = shl nuw nsw i64 %34, 2
  %126 = zext i32 %115 to i64
  %127 = add nuw nsw i64 %125, %126
  %128 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %6, i64 %127
  store <4 x i16> %118, <4 x i16> addrspace(1)* %128, align 8, !tbaa !49, !alias.scope !58, !noalias !59
  %129 = or i64 %125, 1
  %130 = add nuw nsw i64 %129, %126
  %131 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %6, i64 %130
  store <4 x i16> %120, <4 x i16> addrspace(1)* %131, align 8, !tbaa !49, !alias.scope !58, !noalias !59
  %132 = or i64 %125, 2
  %133 = add nuw nsw i64 %132, %126
  %134 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %6, i64 %133
  store <4 x i16> %122, <4 x i16> addrspace(1)* %134, align 8, !tbaa !49, !alias.scope !58, !noalias !59
  %135 = or i64 %125, 3
  %136 = add nuw nsw i64 %135, %126
  %137 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %6, i64 %136
  store <4 x i16> %124, <4 x i16> addrspace(1)* %137, align 8, !tbaa !49, !alias.scope !58, !noalias !59
  br label %138

138:                                              ; preds = %106, %12, %7
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params" addrspace(2)*, <2 x i32>, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_planarToInterleave16b", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 40, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"uint", !"m_strideInY", i32 4, i32 4, i32 0, !"uint", !"m_strideInUVA", i32 8, i32 4, i32 0, !"uint", !"m_strideYUV", i32 12, i32 4, i32 0, !"uint", !"m_mul", i32 16, i32 4, i32 0, !"uint", !"m_off", i32 20, i32 4, i32 0, !"uint", !"m_flag444", i32 24, i32 4, i32 0, !"uint", !"m_shift", i32 28, i32 2, i32 0, !"ushort", !"m_clamp", i32 32, i32 4, i32 0, !"uint", !"m_globalWidth", i32 36, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"inputY"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"inputU"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"inputV"}
!23 = !{i32 5, !"air.buffer", !"air.location_index", i32 4, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"inputA"}
!24 = !{i32 6, !"air.buffer", !"air.location_index", i32 5, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"outputYUV"}
!25 = !{!26, !27, i64 32}
!26 = !{!"_ZTSN10bm3dnr_buf39bm3dnr_buf_planarToInterleave16b_paramsE", !27, i64 0, !27, i64 4, !27, i64 8, !27, i64 12, !27, i64 16, !27, i64 20, !27, i64 24, !30, i64 28, !27, i64 32, !27, i64 36}
!27 = !{!"int", !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{!"short", !28, i64 0}
!31 = !{!32}
!32 = distinct !{!32, !33, !"air-alias-scope-arg(0)"}
!33 = distinct !{!33, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_planarToInterleave16b)"}
!34 = !{!35, !36, !37, !38, !39}
!35 = distinct !{!35, !33, !"air-alias-scope-arg(2)"}
!36 = distinct !{!36, !33, !"air-alias-scope-arg(3)"}
!37 = distinct !{!37, !33, !"air-alias-scope-arg(4)"}
!38 = distinct !{!38, !33, !"air-alias-scope-arg(5)"}
!39 = distinct !{!39, !33, !"air-alias-scope-arg(6)"}
!40 = !{!26, !27, i64 36}
!41 = !{!26, !27, i64 0}
!42 = !{!26, !27, i64 4}
!43 = !{!26, !27, i64 8}
!44 = !{!26, !27, i64 12}
!45 = !{!26, !27, i64 16}
!46 = !{!26, !27, i64 20}
!47 = !{!26, !27, i64 24}
!48 = !{!26, !30, i64 28}
!49 = !{!28, !28, i64 0}
!50 = !{!35}
!51 = !{!32, !36, !37, !38, !39}
!52 = !{!36}
!53 = !{!32, !35, !37, !38, !39}
!54 = !{!37}
!55 = !{!32, !35, !36, !38, !39}
!56 = !{!38}
!57 = !{!32, !35, !36, !37, !39}
!58 = !{!39}
!59 = !{!32, !35, !36, !37, !38}

