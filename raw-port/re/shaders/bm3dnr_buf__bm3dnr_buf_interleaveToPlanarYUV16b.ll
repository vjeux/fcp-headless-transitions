0x000000000443dd -- bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV16b:
source_filename = "bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV16b"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" = type { i32, i32, i32, i32, i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly norecurse nounwind
define void @"bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV16b"(%"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %3, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %4, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %5, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %6) local_unnamed_addr #0 {
  %8 = extractelement <2 x i32> %1, i64 0
  %9 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params", %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" addrspace(2)* %0, i64 0, i32 7
  %10 = load i32, i32 addrspace(2)* %9, align 4, !tbaa !25, !alias.scope !30, !noalias !33
  %11 = icmp ult i32 %8, %10
  br i1 %11, label %12, label %112

12:                                               ; preds = %7
  %13 = extractelement <2 x i32> %1, i64 1
  %14 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params", %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" addrspace(2)* %0, i64 0, i32 8
  %15 = load i32, i32 addrspace(2)* %14, align 4, !tbaa !39, !alias.scope !30, !noalias !33
  %16 = icmp ult i32 %13, %15
  br i1 %16, label %17, label %112

17:                                               ; preds = %12
  %18 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params", %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" addrspace(2)* %0, i64 0, i32 0
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !40, !alias.scope !30, !noalias !33
  %20 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params", %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" addrspace(2)* %0, i64 0, i32 1
  %21 = load i32, i32 addrspace(2)* %20, align 4, !tbaa !41, !alias.scope !30, !noalias !33
  %22 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params", %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" addrspace(2)* %0, i64 0, i32 2
  %23 = load i32, i32 addrspace(2)* %22, align 4, !tbaa !42, !alias.scope !30, !noalias !33
  %24 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params", %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" addrspace(2)* %0, i64 0, i32 3
  %25 = load i32, i32 addrspace(2)* %24, align 4, !tbaa !43, !alias.scope !30, !noalias !33
  %26 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params", %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" addrspace(2)* %0, i64 0, i32 4
  %27 = load i32, i32 addrspace(2)* %26, align 4, !tbaa !44, !alias.scope !30, !noalias !33
  %28 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params", %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" addrspace(2)* %0, i64 0, i32 5
  %29 = load i32, i32 addrspace(2)* %28, align 4, !tbaa !45, !alias.scope !30, !noalias !33
  %30 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params", %"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" addrspace(2)* %0, i64 0, i32 6
  %31 = load i32, i32 addrspace(2)* %30, align 4, !tbaa !46, !alias.scope !30, !noalias !33
  %32 = zext i32 %8 to i64
  %33 = zext i32 %13 to i64
  %34 = shl nuw nsw i64 %32, 2
  %35 = or i64 %34, 1
  %36 = or i64 %34, 2
  %37 = or i64 %34, 3
  %38 = mul i32 %25, %13
  %39 = add i32 %38, %27
  %40 = mul i32 %39, %19
  %41 = zext i32 %40 to i64
  %42 = add nuw nsw i64 %34, %41
  %43 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %42
  %44 = load <4 x i16>, <4 x i16> addrspace(1)* %43, align 8, !tbaa !47, !alias.scope !48, !noalias !49
  %45 = add nuw nsw i64 %35, %41
  %46 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %45
  %47 = load <4 x i16>, <4 x i16> addrspace(1)* %46, align 8, !tbaa !47, !alias.scope !48, !noalias !49
  %48 = add nuw nsw i64 %36, %41
  %49 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %48
  %50 = load <4 x i16>, <4 x i16> addrspace(1)* %49, align 8, !tbaa !47, !alias.scope !48, !noalias !49
  %51 = add nuw nsw i64 %37, %41
  %52 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %51
  %53 = load <4 x i16>, <4 x i16> addrspace(1)* %52, align 8, !tbaa !47, !alias.scope !48, !noalias !49
  %54 = icmp eq i32 %31, 0
  %55 = shufflevector <4 x i16> %44, <4 x i16> %47, <4 x i32> <i32 0, i32 4, i32 undef, i32 undef>
  %56 = shufflevector <4 x i16> %55, <4 x i16> %50, <4 x i32> <i32 0, i32 1, i32 4, i32 undef>
  %57 = shufflevector <4 x i16> %56, <4 x i16> %53, <4 x i32> <i32 0, i32 1, i32 2, i32 4>
  br i1 %54, label %85, label %58

58:                                               ; preds = %17
  %59 = shufflevector <4 x i16> %44, <4 x i16> %47, <4 x i32> <i32 1, i32 5, i32 undef, i32 undef>
  %60 = shufflevector <4 x i16> %59, <4 x i16> %50, <4 x i32> <i32 0, i32 1, i32 5, i32 undef>
  %61 = shufflevector <4 x i16> %60, <4 x i16> %53, <4 x i32> <i32 0, i32 1, i32 2, i32 5>
  %62 = shufflevector <4 x i16> %44, <4 x i16> %47, <4 x i32> <i32 2, i32 6, i32 undef, i32 undef>
  %63 = shufflevector <4 x i16> %62, <4 x i16> %50, <4 x i32> <i32 0, i32 1, i32 6, i32 undef>
  %64 = shufflevector <4 x i16> %63, <4 x i16> %53, <4 x i32> <i32 0, i32 1, i32 2, i32 6>
  %65 = shufflevector <4 x i16> %44, <4 x i16> %47, <4 x i32> <i32 3, i32 7, i32 undef, i32 undef>
  %66 = shufflevector <4 x i16> %65, <4 x i16> %50, <4 x i32> <i32 0, i32 1, i32 7, i32 undef>
  %67 = shufflevector <4 x i16> %66, <4 x i16> %53, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %68 = trunc i32 %29 to i16
  %69 = insertelement <4 x i16> undef, i16 %68, i64 0
  %70 = and <4 x i16> %69, <i16 15, i16 undef, i16 undef, i16 undef>
  %71 = shufflevector <4 x i16> %70, <4 x i16> undef, <4 x i32> zeroinitializer
  %72 = lshr <4 x i16> %61, %71
  %73 = zext i32 %21 to i64
  %74 = mul nuw i64 %73, %33
  %75 = add nuw i64 %74, %32
  %76 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %3, i64 %75
  store <4 x i16> %72, <4 x i16> addrspace(1)* %76, align 8, !tbaa !47, !alias.scope !50, !noalias !51
  %77 = lshr <4 x i16> %64, %71
  %78 = zext i32 %23 to i64
  %79 = mul nuw i64 %78, %33
  %80 = add nuw i64 %79, %32
  %81 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %4, i64 %80
  store <4 x i16> %77, <4 x i16> addrspace(1)* %81, align 8, !tbaa !47, !alias.scope !52, !noalias !53
  %82 = lshr <4 x i16> %67, %71
  %83 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %5, i64 %80
  store <4 x i16> %82, <4 x i16> addrspace(1)* %83, align 8, !tbaa !47, !alias.scope !54, !noalias !55
  %84 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %6, i64 %80
  store <4 x i16> %57, <4 x i16> addrspace(1)* %84, align 8, !tbaa !47, !alias.scope !56, !noalias !57
  br label %112

85:                                               ; preds = %17
  %86 = shufflevector <4 x i16> %44, <4 x i16> %47, <4 x i32> <i32 2, i32 6, i32 undef, i32 undef>
  %87 = shufflevector <4 x i16> %86, <4 x i16> %50, <4 x i32> <i32 0, i32 1, i32 6, i32 undef>
  %88 = shufflevector <4 x i16> %87, <4 x i16> %53, <4 x i32> <i32 0, i32 1, i32 2, i32 6>
  %89 = shufflevector <4 x i16> %44, <4 x i16> %47, <4 x i32> <i32 1, i32 3, i32 5, i32 7>
  %90 = shufflevector <4 x i16> %50, <4 x i16> %53, <4 x i32> <i32 1, i32 3, i32 5, i32 7>
  %91 = shl nuw nsw i64 %32, 1
  %92 = or i64 %91, 1
  %93 = trunc i32 %29 to i16
  %94 = insertelement <4 x i16> undef, i16 %93, i64 0
  %95 = and <4 x i16> %94, <i16 15, i16 undef, i16 undef, i16 undef>
  %96 = shufflevector <4 x i16> %95, <4 x i16> undef, <4 x i32> zeroinitializer
  %97 = lshr <4 x i16> %89, %96
  %98 = zext i32 %21 to i64
  %99 = mul nuw i64 %98, %33
  %100 = add nuw i64 %99, %91
  %101 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %3, i64 %100
  store <4 x i16> %97, <4 x i16> addrspace(1)* %101, align 8, !tbaa !47, !alias.scope !50, !noalias !51
  %102 = lshr <4 x i16> %90, %96
  %103 = add i64 %92, %99
  %104 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %3, i64 %103
  store <4 x i16> %102, <4 x i16> addrspace(1)* %104, align 8, !tbaa !47, !alias.scope !50, !noalias !51
  %105 = lshr <4 x i16> %57, %96
  %106 = zext i32 %23 to i64
  %107 = mul nuw i64 %106, %33
  %108 = add nuw i64 %107, %32
  %109 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %4, i64 %108
  store <4 x i16> %105, <4 x i16> addrspace(1)* %109, align 8, !tbaa !47, !alias.scope !52, !noalias !53
  %110 = lshr <4 x i16> %88, %96
  %111 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %5, i64 %108
  store <4 x i16> %110, <4 x i16> addrspace(1)* %111, align 8, !tbaa !47, !alias.scope !54, !noalias !55
  br label %112

112:                                              ; preds = %85, %58, %12, %7
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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_haar8x8ForSInt_params" addrspace(2)*, <2 x i32>, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV16b", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 36, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV16b_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"uint", !"m_strideIn", i32 4, i32 4, i32 0, !"uint", !"m_strideY", i32 8, i32 4, i32 0, !"uint", !"m_strideUV", i32 12, i32 4, i32 0, !"uint", !"m_mul", i32 16, i32 4, i32 0, !"uint", !"m_off", i32 20, i32 4, i32 0, !"uint", !"m_shift", i32 24, i32 4, i32 0, !"uint", !"m_flag444", i32 28, i32 4, i32 0, !"uint", !"m_globalWidth", i32 32, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"input"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"outputY"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"outputU"}
!23 = !{i32 5, !"air.buffer", !"air.location_index", i32 4, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"outputV"}
!24 = !{i32 6, !"air.buffer", !"air.location_index", i32 5, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"outputA"}
!25 = !{!26, !27, i64 28}
!26 = !{!"_ZTSN10bm3dnr_buf42bm3dnr_buf_interleaveToPlanarYUV16b_paramsE", !27, i64 0, !27, i64 4, !27, i64 8, !27, i64 12, !27, i64 16, !27, i64 20, !27, i64 24, !27, i64 28, !27, i64 32}
!27 = !{!"int", !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{!31}
!31 = distinct !{!31, !32, !"air-alias-scope-arg(0)"}
!32 = distinct !{!32, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV16b)"}
!33 = !{!34, !35, !36, !37, !38}
!34 = distinct !{!34, !32, !"air-alias-scope-arg(2)"}
!35 = distinct !{!35, !32, !"air-alias-scope-arg(3)"}
!36 = distinct !{!36, !32, !"air-alias-scope-arg(4)"}
!37 = distinct !{!37, !32, !"air-alias-scope-arg(5)"}
!38 = distinct !{!38, !32, !"air-alias-scope-arg(6)"}
!39 = !{!26, !27, i64 32}
!40 = !{!26, !27, i64 0}
!41 = !{!26, !27, i64 4}
!42 = !{!26, !27, i64 8}
!43 = !{!26, !27, i64 12}
!44 = !{!26, !27, i64 16}
!45 = !{!26, !27, i64 20}
!46 = !{!26, !27, i64 24}
!47 = !{!28, !28, i64 0}
!48 = !{!34}
!49 = !{!31, !35, !36, !37, !38}
!50 = !{!35}
!51 = !{!31, !34, !36, !37, !38}
!52 = !{!36}
!53 = !{!31, !34, !35, !37, !38}
!54 = !{!37}
!55 = !{!31, !34, !35, !36, !38}
!56 = !{!38}
!57 = !{!31, !34, !35, !36, !37}

