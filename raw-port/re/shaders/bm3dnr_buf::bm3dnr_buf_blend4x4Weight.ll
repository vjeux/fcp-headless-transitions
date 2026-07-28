0x000000000098dd -- bm3dnr_buf::bm3dnr_buf_blend4x4Weight:
source_filename = "bm3dnr_buf::bm3dnr_buf_blend4x4Weight"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" = type { i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blend4x4Weight"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %2, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = extractelement <2 x i32> %1, i64 0
  %7 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 3
  %8 = load i32, i32 addrspace(2)* %7, align 4, !tbaa !23, !alias.scope !28, !noalias !31
  %9 = icmp ult i32 %6, %8
  br i1 %9, label %10, label %105

10:                                               ; preds = %5
  %11 = extractelement <2 x i32> %1, i64 1
  %12 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 4
  %13 = load i32, i32 addrspace(2)* %12, align 4, !tbaa !35, !alias.scope !28, !noalias !31
  %14 = icmp ult i32 %11, %13
  br i1 %14, label %15, label %105

15:                                               ; preds = %10
  %16 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 0
  %17 = load i32, i32 addrspace(2)* %16, align 4, !tbaa !36, !alias.scope !28, !noalias !31
  %18 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 1
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !37, !alias.scope !28, !noalias !31
  %20 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 2
  %21 = load i32, i32 addrspace(2)* %20, align 4, !tbaa !38, !alias.scope !28, !noalias !31
  %22 = zext i32 %6 to i64
  %23 = zext i32 %11 to i64
  %24 = shl nuw nsw i64 %23, 2
  %25 = trunc i64 %24 to i32
  %26 = mul nsw i32 %19, %25
  %27 = add nsw i32 %26, %6
  %28 = sext i32 %27 to i64
  %29 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %28
  %30 = load <4 x float>, <4 x float> addrspace(1)* %29, align 16, !tbaa !39, !alias.scope !40, !noalias !41
  %31 = or i32 %25, 1
  %32 = mul nsw i32 %19, %31
  %33 = add nsw i32 %32, %6
  %34 = sext i32 %33 to i64
  %35 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %34
  %36 = load <4 x float>, <4 x float> addrspace(1)* %35, align 16, !tbaa !39, !alias.scope !40, !noalias !41
  %37 = or i32 %25, 2
  %38 = mul nsw i32 %19, %37
  %39 = add nsw i32 %38, %6
  %40 = sext i32 %39 to i64
  %41 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %40
  %42 = load <4 x float>, <4 x float> addrspace(1)* %41, align 16, !tbaa !39, !alias.scope !40, !noalias !41
  %43 = or i32 %25, 3
  %44 = mul nsw i32 %19, %43
  %45 = add nsw i32 %44, %6
  %46 = sext i32 %45 to i64
  %47 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %46
  %48 = load <4 x float>, <4 x float> addrspace(1)* %47, align 16, !tbaa !39, !alias.scope !40, !noalias !41
  %49 = mul nsw i32 %21, %25
  %50 = add nsw i32 %49, %6
  %51 = sext i32 %50 to i64
  %52 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %51
  %53 = load <4 x float>, <4 x float> addrspace(1)* %52, align 16, !tbaa !39, !alias.scope !42, !noalias !43
  %54 = mul nsw i32 %21, %31
  %55 = add nsw i32 %54, %6
  %56 = sext i32 %55 to i64
  %57 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %56
  %58 = load <4 x float>, <4 x float> addrspace(1)* %57, align 16, !tbaa !39, !alias.scope !42, !noalias !43
  %59 = mul nsw i32 %21, %37
  %60 = add nsw i32 %59, %6
  %61 = sext i32 %60 to i64
  %62 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %61
  %63 = load <4 x float>, <4 x float> addrspace(1)* %62, align 16, !tbaa !39, !alias.scope !42, !noalias !43
  %64 = mul nsw i32 %21, %43
  %65 = add nsw i32 %64, %6
  %66 = sext i32 %65 to i64
  %67 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %66
  %68 = load <4 x float>, <4 x float> addrspace(1)* %67, align 16, !tbaa !39, !alias.scope !42, !noalias !43
  %69 = fmul <4 x float> %30, %53
  %70 = fmul <4 x float> %36, %58
  %71 = fmul <4 x float> %42, %63
  %72 = fmul <4 x float> %48, %68
  %73 = fadd <4 x float> %69, <float 5.000000e-01, float 5.000000e-01, float 5.000000e-01, float 5.000000e-01>
  %74 = tail call <4 x float> @air.floor.v4f32(<4 x float> %73) #1
  %75 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %74, <4 x float> <float -3.276800e+04, float -3.276800e+04, float -3.276800e+04, float -3.276800e+04>, <4 x float> <float 3.276700e+04, float 3.276700e+04, float 3.276700e+04, float 3.276700e+04>) #1
  %76 = tail call <4 x i16> @air.convert.s.v4i16.f.v4f32(<4 x float> %75) #1
  %77 = fadd <4 x float> %70, <float 5.000000e-01, float 5.000000e-01, float 5.000000e-01, float 5.000000e-01>
  %78 = tail call <4 x float> @air.floor.v4f32(<4 x float> %77) #1
  %79 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %78, <4 x float> <float -3.276800e+04, float -3.276800e+04, float -3.276800e+04, float -3.276800e+04>, <4 x float> <float 3.276700e+04, float 3.276700e+04, float 3.276700e+04, float 3.276700e+04>) #1
  %80 = tail call <4 x i16> @air.convert.s.v4i16.f.v4f32(<4 x float> %79) #1
  %81 = fadd <4 x float> %71, <float 5.000000e-01, float 5.000000e-01, float 5.000000e-01, float 5.000000e-01>
  %82 = tail call <4 x float> @air.floor.v4f32(<4 x float> %81) #1
  %83 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %82, <4 x float> <float -3.276800e+04, float -3.276800e+04, float -3.276800e+04, float -3.276800e+04>, <4 x float> <float 3.276700e+04, float 3.276700e+04, float 3.276700e+04, float 3.276700e+04>) #1
  %84 = tail call <4 x i16> @air.convert.s.v4i16.f.v4f32(<4 x float> %83) #1
  %85 = fadd <4 x float> %72, <float 5.000000e-01, float 5.000000e-01, float 5.000000e-01, float 5.000000e-01>
  %86 = tail call <4 x float> @air.floor.v4f32(<4 x float> %85) #1
  %87 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %86, <4 x float> <float -3.276800e+04, float -3.276800e+04, float -3.276800e+04, float -3.276800e+04>, <4 x float> <float 3.276700e+04, float 3.276700e+04, float 3.276700e+04, float 3.276700e+04>) #1
  %88 = tail call <4 x i16> @air.convert.s.v4i16.f.v4f32(<4 x float> %87) #1
  %89 = sext i32 %17 to i64
  %90 = mul i64 %24, %89
  %91 = add i64 %90, %22
  %92 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %91
  store <4 x i16> %76, <4 x i16> addrspace(1)* %92, align 8, !tbaa !39, !alias.scope !44, !noalias !45
  %93 = or i64 %24, 1
  %94 = mul i64 %93, %89
  %95 = add i64 %94, %22
  %96 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %95
  store <4 x i16> %80, <4 x i16> addrspace(1)* %96, align 8, !tbaa !39, !alias.scope !44, !noalias !45
  %97 = or i64 %24, 2
  %98 = mul i64 %97, %89
  %99 = add i64 %98, %22
  %100 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %99
  store <4 x i16> %84, <4 x i16> addrspace(1)* %100, align 8, !tbaa !39, !alias.scope !44, !noalias !45
  %101 = or i64 %24, 3
  %102 = mul i64 %101, %89
  %103 = add i64 %102, %22
  %104 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %103
  store <4 x i16> %88, <4 x i16> addrspace(1)* %104, align 8, !tbaa !39, !alias.scope !44, !noalias !45
  br label %105

105:                                              ; preds = %15, %10, %5
  ret void
}

; Function Attrs: nounwind readnone
declare <4 x i16> @air.convert.s.v4i16.f.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.clamp.v4f32(<4 x float>, <4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.floor.v4f32(<4 x float>) local_unnamed_addr #1

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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)*, <2 x i32>, <4 x i16> addrspace(1)*, <4 x float> addrspace(1)*, <4 x float> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blend4x4Weight", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 20, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_strideOut", i32 4, i32 4, i32 0, !"int", !"m_strideIn", i32 8, i32 4, i32 0, !"int", !"m_strideOneOverDenom", i32 12, i32 4, i32 0, !"uint", !"m_globalWidth", i32 16, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"short4", !"air.arg_name", !"output"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inOut"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"oneOverDenom"}
!23 = !{!24, !25, i64 12}
!24 = !{!"_ZTSN10bm3dnr_buf32bm3dnr_buf_blend4x4Weight_paramsE", !25, i64 0, !25, i64 4, !25, i64 8, !25, i64 12, !25, i64 16}
!25 = !{!"int", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(0)"}
!30 = distinct !{!30, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blend4x4Weight)"}
!31 = !{!32, !33, !34}
!32 = distinct !{!32, !30, !"air-alias-scope-arg(2)"}
!33 = distinct !{!33, !30, !"air-alias-scope-arg(3)"}
!34 = distinct !{!34, !30, !"air-alias-scope-arg(4)"}
!35 = !{!24, !25, i64 16}
!36 = !{!24, !25, i64 0}
!37 = !{!24, !25, i64 4}
!38 = !{!24, !25, i64 8}
!39 = !{!26, !26, i64 0}
!40 = !{!33}
!41 = !{!29, !32, !34}
!42 = !{!34}
!43 = !{!29, !32, !33}
!44 = !{!32}
!45 = !{!29, !33, !34}

