0x00000000017c0d -- bm3dnr_buf::bm3dnr_buf_blend8x8Weight8:
source_filename = "bm3dnr_buf::bm3dnr_buf_blend8x8Weight8"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" = type { i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly nounwind
define void @"bm3dnr_buf::bm3dnr_buf_blend8x8Weight8"(%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, <4 x i8> addrspace(1)* nocapture "air-buffer-no-alias" %2, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %3, <4 x float> addrspace(1)* nocapture readonly "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = alloca [16 x <4 x float>], align 16
  %7 = alloca [16 x <4 x float>], align 16
  %8 = extractelement <2 x i32> %1, i64 0
  %9 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 3
  %10 = load i32, i32 addrspace(2)* %9, align 4, !tbaa !23, !alias.scope !28, !noalias !31
  %11 = icmp ult i32 %8, %10
  br i1 %11, label %12, label %103

12:                                               ; preds = %5
  %13 = extractelement <2 x i32> %1, i64 1
  %14 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 4
  %15 = load i32, i32 addrspace(2)* %14, align 4, !tbaa !35, !alias.scope !28, !noalias !31
  %16 = icmp ult i32 %13, %15
  br i1 %16, label %17, label %103

17:                                               ; preds = %12
  %18 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 0
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !36, !alias.scope !28, !noalias !31
  %20 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 1
  %21 = load i32, i32 addrspace(2)* %20, align 4, !tbaa !37, !alias.scope !28, !noalias !31
  %22 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params", %"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)* %0, i64 0, i32 2
  %23 = load i32, i32 addrspace(2)* %22, align 4, !tbaa !38, !alias.scope !28, !noalias !31
  %24 = bitcast [16 x <4 x float>]* %6 to i8*
  call void @llvm.lifetime.start.p0i8(i64 256, i8* nonnull %24) #3
  %25 = bitcast [16 x <4 x float>]* %7 to i8*
  call void @llvm.lifetime.start.p0i8(i64 256, i8* nonnull %25) #3
  %26 = zext i32 %8 to i64
  %27 = zext i32 %13 to i64
  %28 = shl nuw nsw i64 %26, 1
  %29 = shl nuw nsw i64 %27, 3
  %30 = trunc i64 %28 to i32
  %31 = trunc i64 %29 to i32
  br label %32

32:                                               ; preds = %32, %17
  %33 = phi i32 [ 0, %17 ], [ %49, %32 ]
  %34 = add nuw nsw i32 %33, %31
  %35 = mul nsw i32 %34, %21
  %36 = add nsw i32 %35, %30
  %37 = sext i32 %36 to i64
  %38 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %37
  %39 = load <4 x float>, <4 x float> addrspace(1)* %38, align 16, !tbaa !39, !alias.scope !40, !noalias !41
  %40 = zext i32 %33 to i64
  %41 = getelementptr inbounds [16 x <4 x float>], [16 x <4 x float>]* %6, i64 0, i64 %40
  store <4 x float> %39, <4 x float>* %41, align 16, !tbaa !39
  %42 = add nsw i32 %36, 1
  %43 = sext i32 %42 to i64
  %44 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %3, i64 %43
  %45 = load <4 x float>, <4 x float> addrspace(1)* %44, align 16, !tbaa !39, !alias.scope !40, !noalias !41
  %46 = add nuw nsw i32 %33, 8
  %47 = zext i32 %46 to i64
  %48 = getelementptr inbounds [16 x <4 x float>], [16 x <4 x float>]* %6, i64 0, i64 %47
  store <4 x float> %45, <4 x float>* %48, align 16, !tbaa !39
  %49 = add nuw nsw i32 %33, 1
  %50 = icmp eq i32 %49, 8
  br i1 %50, label %54, label %32, !llvm.loop !42

51:                                               ; preds = %54
  %52 = sext i32 %19 to i64
  %53 = or i64 %28, 1
  br label %74

54:                                               ; preds = %54, %32
  %55 = phi i32 [ %71, %54 ], [ 0, %32 ]
  %56 = add nuw nsw i32 %55, %31
  %57 = mul nsw i32 %56, %23
  %58 = add nsw i32 %57, %30
  %59 = sext i32 %58 to i64
  %60 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %59
  %61 = load <4 x float>, <4 x float> addrspace(1)* %60, align 16, !tbaa !39, !alias.scope !44, !noalias !45
  %62 = zext i32 %55 to i64
  %63 = getelementptr inbounds [16 x <4 x float>], [16 x <4 x float>]* %7, i64 0, i64 %62
  store <4 x float> %61, <4 x float>* %63, align 16, !tbaa !39
  %64 = add nsw i32 %58, 1
  %65 = sext i32 %64 to i64
  %66 = getelementptr inbounds <4 x float>, <4 x float> addrspace(1)* %4, i64 %65
  %67 = load <4 x float>, <4 x float> addrspace(1)* %66, align 16, !tbaa !39, !alias.scope !44, !noalias !45
  %68 = add nuw nsw i32 %55, 8
  %69 = zext i32 %68 to i64
  %70 = getelementptr inbounds [16 x <4 x float>], [16 x <4 x float>]* %7, i64 0, i64 %69
  store <4 x float> %67, <4 x float>* %70, align 16, !tbaa !39
  %71 = add nuw nsw i32 %55, 1
  %72 = icmp eq i32 %71, 8
  br i1 %72, label %51, label %54, !llvm.loop !42

73:                                               ; preds = %74
  call void @llvm.lifetime.end.p0i8(i64 256, i8* nonnull %25) #3
  call void @llvm.lifetime.end.p0i8(i64 256, i8* nonnull %24) #3
  br label %103

74:                                               ; preds = %74, %51
  %75 = phi i32 [ 0, %51 ], [ %101, %74 ]
  %76 = zext i32 %75 to i64
  %77 = getelementptr inbounds [16 x <4 x float>], [16 x <4 x float>]* %7, i64 0, i64 %76
  %78 = load <4 x float>, <4 x float>* %77, align 16, !tbaa !39
  %79 = add nuw nsw i32 %75, 8
  %80 = zext i32 %79 to i64
  %81 = getelementptr inbounds [16 x <4 x float>], [16 x <4 x float>]* %7, i64 0, i64 %80
  %82 = load <4 x float>, <4 x float>* %81, align 16, !tbaa !39
  %83 = getelementptr inbounds [16 x <4 x float>], [16 x <4 x float>]* %6, i64 0, i64 %76
  %84 = load <4 x float>, <4 x float>* %83, align 16, !tbaa !39
  %85 = fmul <4 x float> %78, %84
  %86 = fadd <4 x float> %85, <float 5.000000e-01, float 5.000000e-01, float 5.000000e-01, float 5.000000e-01>
  %87 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %86, <4 x float> zeroinitializer, <4 x float> <float 2.550000e+02, float 2.550000e+02, float 2.550000e+02, float 2.550000e+02>) #1
  %88 = tail call <4 x i8> @air.convert.u.v4i8.f.v4f32(<4 x float> %87) #1
  %89 = add nuw nsw i64 %29, %76
  %90 = mul i64 %89, %52
  %91 = add i64 %90, %28
  %92 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %91
  store <4 x i8> %88, <4 x i8> addrspace(1)* %92, align 4, !tbaa !39, !alias.scope !46, !noalias !47
  %93 = getelementptr inbounds [16 x <4 x float>], [16 x <4 x float>]* %6, i64 0, i64 %80
  %94 = load <4 x float>, <4 x float>* %93, align 16, !tbaa !39
  %95 = fmul <4 x float> %82, %94
  %96 = fadd <4 x float> %95, <float 5.000000e-01, float 5.000000e-01, float 5.000000e-01, float 5.000000e-01>
  %97 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %96, <4 x float> zeroinitializer, <4 x float> <float 2.550000e+02, float 2.550000e+02, float 2.550000e+02, float 2.550000e+02>) #1
  %98 = tail call <4 x i8> @air.convert.u.v4i8.f.v4f32(<4 x float> %97) #1
  %99 = add i64 %53, %90
  %100 = getelementptr inbounds <4 x i8>, <4 x i8> addrspace(1)* %2, i64 %99
  store <4 x i8> %98, <4 x i8> addrspace(1)* %100, align 4, !tbaa !39, !alias.scope !46, !noalias !47
  %101 = add nuw nsw i32 %75, 1
  %102 = icmp eq i32 %101, 8
  br i1 %102, label %73, label %74, !llvm.loop !48

103:                                              ; preds = %73, %12, %5
  ret void
}

; Function Attrs: nounwind readnone
declare <4 x i8> @air.convert.u.v4i8.f.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.clamp.v4f32(<4 x float>, <4 x float>, <4 x float>) local_unnamed_addr #1

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.end.p0i8(i64 immarg, i8* nocapture) #2

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.start.p0i8(i64 immarg, i8* nocapture) #2

attributes #0 = { argmemonly nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { nounwind readnone }
attributes #2 = { argmemonly nocallback nofree nosync nounwind willreturn }
attributes #3 = { nounwind }

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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params" addrspace(2)*, <2 x i32>, <4 x i8> addrspace(1)*, <4 x float> addrspace(1)*, <4 x float> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_blend8x8Weight8", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 20, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_blend8x8Weight8_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"int", !"m_strideOut", i32 4, i32 4, i32 0, !"int", !"m_strideIn", i32 8, i32 4, i32 0, !"int", !"m_strideOneOverDenom", i32 12, i32 4, i32 0, !"uint", !"m_globalWidth", i32 16, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uchar4", !"air.arg_name", !"output"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"inOut"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4", !"air.arg_name", !"oneOverDenom"}
!23 = !{!24, !25, i64 12}
!24 = !{!"_ZTSN10bm3dnr_buf33bm3dnr_buf_blend8x8Weight8_paramsE", !25, i64 0, !25, i64 4, !25, i64 8, !25, i64 12, !25, i64 16}
!25 = !{!"int", !26, i64 0}
!26 = !{!"omnipotent char", !27, i64 0}
!27 = !{!"Simple C++ TBAA"}
!28 = !{!29}
!29 = distinct !{!29, !30, !"air-alias-scope-arg(0)"}
!30 = distinct !{!30, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_blend8x8Weight8)"}
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
!42 = distinct !{!42, !43}
!43 = !{!"llvm.loop.mustprogress"}
!44 = !{!34}
!45 = !{!29, !32, !33}
!46 = !{!32}
!47 = !{!29, !33, !34}
!48 = distinct !{!48, !43}

