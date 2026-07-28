0x00000000002c89 -- imgSwizzle:
source_filename = "imgSwizzle"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct.LiSwizzleInfo = type { [4 x i32] }

; Function Attrs: mustprogress nounwind willreturn
define void @imgSwizzle(%struct._texture_2d_t addrspace(1)* %0, %struct._texture_2d_t addrspace(1)* %1, %struct.LiSwizzleInfo addrspace(2)* nocapture noundef readonly align 4 dereferenceable(16) "air-buffer-no-alias" %2, <2 x i32> noundef %3) local_unnamed_addr #0 {
  %5 = alloca [4 x float], align 4
  %6 = extractelement <2 x i32> %3, i64 0
  %7 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, i32 0) #4, !alias.scope !23, !noalias !26
  %8 = icmp ult i32 %6, %7
  br i1 %8, label %9, label %49

9:                                                ; preds = %4
  %10 = extractelement <2 x i32> %3, i64 1
  %11 = tail call i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, i32 0) #4, !alias.scope !23, !noalias !26
  %12 = icmp ult i32 %10, %11
  br i1 %12, label %13, label %49

13:                                               ; preds = %9
  %14 = tail call { <4 x float>, i8 } @air.read_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, <2 x i32> %3, i32 0, i32 1) #4, !alias.scope !23, !noalias !26
  %15 = extractvalue { <4 x float>, i8 } %14, 0
  %16 = bitcast [4 x float]* %5 to i8*
  call void @llvm.lifetime.start.p0i8(i64 16, i8* nonnull %16) #5
  %17 = getelementptr inbounds [4 x float], [4 x float]* %5, i64 0, i64 0
  %18 = extractelement <4 x float> %15, i64 0
  store float %18, float* %17, align 4, !tbaa !28
  %19 = getelementptr inbounds [4 x float], [4 x float]* %5, i64 0, i64 1
  %20 = extractelement <4 x float> %15, i64 1
  store float %20, float* %19, align 4, !tbaa !28
  %21 = getelementptr inbounds [4 x float], [4 x float]* %5, i64 0, i64 2
  %22 = extractelement <4 x float> %15, i64 2
  store float %22, float* %21, align 4, !tbaa !28
  %23 = getelementptr inbounds [4 x float], [4 x float]* %5, i64 0, i64 3
  %24 = extractelement <4 x float> %15, i64 3
  store float %24, float* %23, align 4, !tbaa !28
  %25 = getelementptr inbounds %struct.LiSwizzleInfo, %struct.LiSwizzleInfo addrspace(2)* %2, i64 0, i32 0, i64 0
  %26 = load i32, i32 addrspace(2)* %25, align 4, !tbaa !32, !alias.scope !26, !noalias !23
  %27 = zext i32 %26 to i64
  %28 = getelementptr inbounds [4 x float], [4 x float]* %5, i64 0, i64 %27
  %29 = load float, float* %28, align 4, !tbaa !28
  %30 = insertelement <4 x float> undef, float %29, i64 0
  %31 = getelementptr inbounds %struct.LiSwizzleInfo, %struct.LiSwizzleInfo addrspace(2)* %2, i64 0, i32 0, i64 1
  %32 = load i32, i32 addrspace(2)* %31, align 4, !tbaa !32, !alias.scope !26, !noalias !23
  %33 = zext i32 %32 to i64
  %34 = getelementptr inbounds [4 x float], [4 x float]* %5, i64 0, i64 %33
  %35 = load float, float* %34, align 4, !tbaa !28
  %36 = insertelement <4 x float> %30, float %35, i64 1
  %37 = getelementptr inbounds %struct.LiSwizzleInfo, %struct.LiSwizzleInfo addrspace(2)* %2, i64 0, i32 0, i64 2
  %38 = load i32, i32 addrspace(2)* %37, align 4, !tbaa !32, !alias.scope !26, !noalias !23
  %39 = zext i32 %38 to i64
  %40 = getelementptr inbounds [4 x float], [4 x float]* %5, i64 0, i64 %39
  %41 = load float, float* %40, align 4, !tbaa !28
  %42 = insertelement <4 x float> %36, float %41, i64 2
  %43 = getelementptr inbounds %struct.LiSwizzleInfo, %struct.LiSwizzleInfo addrspace(2)* %2, i64 0, i32 0, i64 3
  %44 = load i32, i32 addrspace(2)* %43, align 4, !tbaa !32, !alias.scope !26, !noalias !23
  %45 = zext i32 %44 to i64
  %46 = getelementptr inbounds [4 x float], [4 x float]* %5, i64 0, i64 %45
  %47 = load float, float* %46, align 4, !tbaa !28
  %48 = insertelement <4 x float> %42, float %47, i64 3
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %1, <2 x i32> %3, <4 x float> %48, i32 0, i32 2) #6, !alias.scope !23, !noalias !26
  call void @llvm.lifetime.end.p0i8(i64 16, i8* nonnull %16) #5
  br label %49

49:                                               ; preds = %13, %9, %4
  ret void
}

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.end.p0i8(i64 immarg, i8* nocapture) #1

; Function Attrs: argmemonly mustprogress nounwind willreturn
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #2

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.start.p0i8(i64 immarg, i8* nocapture) #1

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.read_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, <2 x i32>, i32, i32) local_unnamed_addr #3

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #3

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #3

attributes #0 = { mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly nocallback nofree nosync nounwind willreturn }
attributes #2 = { argmemonly mustprogress nounwind willreturn }
attributes #3 = { argmemonly mustprogress nofree nounwind readonly willreturn }
attributes #4 = { argmemonly nounwind readonly willreturn }
attributes #5 = { nounwind }
attributes #6 = { argmemonly nounwind willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.kernel = !{!15}

!0 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!1 = !{i32 1, !"wchar_size", i32 4}
!2 = !{i32 7, !"frame-pointer", i32 2}
!3 = !{i32 7, !"air.max_device_buffers", i32 31}
!4 = !{i32 7, !"air.max_constant_buffers", i32 31}
!5 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!6 = !{i32 7, !"air.max_textures", i32 128}
!7 = !{i32 7, !"air.max_read_write_textures", i32 8}
!8 = !{i32 7, !"air.max_samplers", i32 16}
!9 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!10 = !{i32 2, i32 7, i32 0}
!11 = !{!"Metal", i32 3, i32 2, i32 0}
!12 = !{!"air.compile.denorms_disable"}
!13 = !{!"air.compile.fast_math_enable"}
!14 = !{!"air.compile.framebuffer_fetch_enable"}
!15 = !{void (%struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, %struct.LiSwizzleInfo addrspace(2)*, <2 x i32>)* @imgSwizzle, !16, !17}
!16 = !{}
!17 = !{!18, !19, !20, !22}
!18 = !{i32 0, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.read", !"air.arg_type_name", !"texture2d<float, read>", !"air.arg_name", !"input"}
!19 = !{i32 1, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"output"}
!20 = !{i32 2, !"air.buffer", !"air.buffer_size", i32 16, !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !21, !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"LiSwizzleInfo", !"air.arg_name", !"info"}
!21 = !{i32 0, i32 4, i32 4, !"uint", !"pattern"}
!22 = !{i32 3, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"gid"}
!23 = !{!24}
!24 = distinct !{!24, !25, !"air-alias-scope-textures"}
!25 = distinct !{!25, !"air-alias-scopes(imgSwizzle)"}
!26 = !{!27}
!27 = distinct !{!27, !25, !"air-alias-scope-arg(2)"}
!28 = !{!29, !29, i64 0}
!29 = !{!"float", !30, i64 0}
!30 = !{!"omnipotent char", !31, i64 0}
!31 = !{!"Simple C++ TBAA"}
!32 = !{!33, !33, i64 0}
!33 = !{!"int", !30, i64 0}

