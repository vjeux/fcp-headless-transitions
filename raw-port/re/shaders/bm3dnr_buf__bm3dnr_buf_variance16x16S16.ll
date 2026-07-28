0x0000000007bb1d -- bm3dnr_buf::bm3dnr_buf_variance16x16S16:
source_filename = "bm3dnr_buf::bm3dnr_buf_variance16x16S16"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params" = type { i32, i32, i32, float, i32, i32 }

; Function Attrs: argmemonly nounwind
define void @"bm3dnr_buf::bm3dnr_buf_variance16x16S16"(%"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i16> addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, i16 addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, i16 addrspace(1)* nocapture "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = extractelement <2 x i32> %1, i64 0
  %7 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params" addrspace(2)* %0, i64 0, i32 4
  %8 = load i32, i32 addrspace(2)* %7, align 4, !tbaa !23, !alias.scope !29, !noalias !32
  %9 = icmp ult i32 %6, %8
  br i1 %9, label %10, label %87

10:                                               ; preds = %5
  %11 = extractelement <2 x i32> %1, i64 1
  %12 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params" addrspace(2)* %0, i64 0, i32 5
  %13 = load i32, i32 addrspace(2)* %12, align 4, !tbaa !36, !alias.scope !29, !noalias !32
  %14 = icmp ult i32 %11, %13
  br i1 %14, label %15, label %87

15:                                               ; preds = %10
  %16 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params" addrspace(2)* %0, i64 0, i32 0
  %17 = load i32, i32 addrspace(2)* %16, align 4, !tbaa !37, !alias.scope !29, !noalias !32
  %18 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params" addrspace(2)* %0, i64 0, i32 1
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !38, !alias.scope !29, !noalias !32
  %20 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params" addrspace(2)* %0, i64 0, i32 2
  %21 = load i32, i32 addrspace(2)* %20, align 4, !tbaa !39, !alias.scope !29, !noalias !32
  %22 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params", %"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params" addrspace(2)* %0, i64 0, i32 3
  %23 = load float, float addrspace(2)* %22, align 4, !tbaa !40, !alias.scope !29, !noalias !32
  %24 = zext i32 %6 to i64
  %25 = shl nuw nsw i64 %24, 1
  %26 = getelementptr inbounds i16, i16 addrspace(1)* %3, i64 %25
  %27 = load i16, i16 addrspace(1)* %26, align 2, !tbaa !41, !alias.scope !43, !noalias !44
  %28 = or i64 %25, 1
  %29 = getelementptr inbounds i16, i16 addrspace(1)* %3, i64 %28
  %30 = load i16, i16 addrspace(1)* %29, align 2, !tbaa !41, !alias.scope !43, !noalias !44
  %31 = zext i16 %30 to i32
  %32 = and i32 %21, 31
  %33 = lshr i32 %31, %32
  %34 = zext i32 %33 to i64
  %35 = zext i16 %27 to i32
  %36 = and i32 %19, 31
  %37 = lshr i32 %35, %36
  %38 = zext i32 %37 to i64
  %39 = sext i32 %17 to i64
  br label %40

40:                                               ; preds = %71, %15
  %41 = phi <4 x float> [ zeroinitializer, %15 ], [ %83, %71 ]
  %42 = phi <4 x float> [ zeroinitializer, %15 ], [ %84, %71 ]
  %43 = phi i32 [ 0, %15 ], [ %72, %71 ]
  %44 = zext i32 %43 to i64
  %45 = add nuw nsw i64 %44, %34
  %46 = mul i64 %45, %39
  %47 = add i64 %46, %38
  br label %74

48:                                               ; preds = %71
  %49 = shufflevector <4 x float> %83, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %50 = shufflevector <4 x float> %83, <4 x float> undef, <2 x i32> <i32 2, i32 3>
  %51 = fadd <2 x float> %49, %50
  %52 = extractelement <2 x float> %51, i64 0
  %53 = extractelement <2 x float> %51, i64 1
  %54 = fadd float %52, %53
  %55 = shufflevector <4 x float> %84, <4 x float> undef, <2 x i32> <i32 0, i32 1>
  %56 = shufflevector <4 x float> %84, <4 x float> undef, <2 x i32> <i32 2, i32 3>
  %57 = fadd <2 x float> %55, %56
  %58 = extractelement <2 x float> %57, i64 0
  %59 = extractelement <2 x float> %57, i64 1
  %60 = fadd float %58, %59
  %61 = fmul float %54, 3.906250e-03
  %62 = fmul float %60, 3.906250e-03
  %63 = fsub float -0.000000e+00, %61
  %64 = tail call float @llvm.fmuladd.f32(float %63, float %61, float %62)
  %65 = fcmp olt float %64, 0.000000e+00
  %66 = select i1 %65, float 0.000000e+00, float %64
  %67 = fmul float %23, %66
  %68 = tail call float @air.clamp.f32(float %67, float 0.000000e+00, float 6.553500e+04) #2
  %69 = tail call i16 @air.convert.u.i16.f.f32(float %68) #2
  %70 = getelementptr inbounds i16, i16 addrspace(1)* %4, i64 %24
  store i16 %69, i16 addrspace(1)* %70, align 2, !tbaa !41, !alias.scope !45, !noalias !46
  br label %87

71:                                               ; preds = %74
  %72 = add nuw nsw i32 %43, 1
  %73 = icmp eq i32 %72, 16
  br i1 %73, label %48, label %40, !llvm.loop !47

74:                                               ; preds = %74, %40
  %75 = phi <4 x float> [ %41, %40 ], [ %83, %74 ]
  %76 = phi <4 x float> [ %42, %40 ], [ %84, %74 ]
  %77 = phi i32 [ 0, %40 ], [ %85, %74 ]
  %78 = zext i32 %77 to i64
  %79 = add i64 %47, %78
  %80 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %2, i64 %79
  %81 = load <4 x i16>, <4 x i16> addrspace(1)* %80, align 8, !tbaa !49, !alias.scope !50, !noalias !51
  %82 = tail call <4 x float> @air.convert.f.v4f32.s.v4i16(<4 x i16> %81) #2
  %83 = fadd <4 x float> %75, %82
  %84 = tail call <4 x float> @llvm.fmuladd.v4f32(<4 x float> %82, <4 x float> %82, <4 x float> %76)
  %85 = add nuw nsw i32 %77, 1
  %86 = icmp eq i32 %85, 4
  br i1 %86, label %71, label %74, !llvm.loop !52

87:                                               ; preds = %48, %10, %5
  ret void
}

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare <4 x float> @llvm.fmuladd.v4f32(<4 x float>, <4 x float>, <4 x float>) #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.convert.f.v4f32.s.v4i16(<4 x i16>) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare i16 @air.convert.u.i16.f.f32(float) local_unnamed_addr #2

; Function Attrs: nounwind readnone
declare float @air.clamp.f32(float, float, float) local_unnamed_addr #2

; Function Attrs: nocallback nofree nosync nounwind readnone speculatable willreturn
declare float @llvm.fmuladd.f32(float, float, float) #1

attributes #0 = { argmemonly nounwind "frame-pointer"="all" "min-legal-vector-width"="64" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { nocallback nofree nosync nounwind readnone speculatable willreturn }
attributes #2 = { nounwind readnone }

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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_variance16x16S16_params" addrspace(2)*, <2 x i32>, <4 x i16> addrspace(1)*, i16 addrspace(1)*, i16 addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_variance16x16S16", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 24, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_variance16x16S16_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_inStride", i32 4, i32 4, i32 0, !"int", !"m_shiftX", i32 8, i32 4, i32 0, !"int", !"m_shiftY", i32 12, i32 4, i32 0, !"float", !"m_scale", i32 16, i32 4, i32 0, !"uint", !"m_globalWidth", i32 20, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"short4", !"air.arg_name", !"input"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 2, !"air.arg_type_align_size", i32 2, !"air.arg_type_name", !"ushort", !"air.arg_name", !"inputCoord"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 2, !"air.arg_type_align_size", i32 2, !"air.arg_type_name", !"ushort", !"air.arg_name", !"outputVariance"}
!23 = !{!24, !25, i64 16}
!24 = !{!"_ZTSN10bm3dnr_buf34bm3dnr_buf_variance16x16S16_paramsE", !25, i64 0, !25, i64 4, !25, i64 8, !28, i64 12, !25, i64 16, !25, i64 20}
!25 = !{!"int", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!"float", !26, i64 0}
!29 = !{!30}
!30 = distinct !{!30, !31, !"air-alias-scope-arg(0)"}
!31 = distinct !{!31, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_variance16x16S16)"}
!32 = !{!33, !34, !35}
!33 = distinct !{!33, !31, !"air-alias-scope-arg(2)"}
!34 = distinct !{!34, !31, !"air-alias-scope-arg(3)"}
!35 = distinct !{!35, !31, !"air-alias-scope-arg(4)"}
!36 = !{!24, !25, i64 20}
!37 = !{!24, !25, i64 0}
!38 = !{!24, !25, i64 4}
!39 = !{!24, !25, i64 8}
!40 = !{!24, !28, i64 12}
!41 = !{!42, !42, i64 0}
!42 = !{!"short", !26, i64 0}
!43 = !{!34}
!44 = !{!30, !33, !35}
!45 = !{!35}
!46 = !{!30, !33, !34}
!47 = distinct !{!47, !48}
!48 = !{!"llvm.loop.mustprogress"}
!49 = !{!26, !26, i64 0}
!50 = !{!33}
!51 = !{!30, !34, !35}
!52 = distinct !{!52, !48}

