0x000000000003c8 -- initializeKernel:
source_filename = "initializeKernel"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque

; Function Attrs: mustprogress nounwind willreturn
define void @initializeKernel(%struct._texture_2d_t addrspace(1)* %0, i32 addrspace(1)* nocapture noundef writeonly "air-buffer-no-alias" %1, float addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %2, i32 addrspace(1)* nocapture noundef writeonly "air-buffer-no-alias" %3, i32 addrspace(1)* nocapture noundef writeonly "air-buffer-no-alias" %4, <2 x i16> noundef %5, <2 x i32> noundef %6) local_unnamed_addr #0 {
  %8 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, i32 0) #3, !alias.scope !25, !noalias !28
  %9 = extractelement <2 x i16> %5, i64 0
  %10 = zext i16 %9 to i32
  %11 = add i32 %8, -1
  %12 = icmp ult i32 %11, %10
  br i1 %12, label %35, label %13

13:                                               ; preds = %7
  %14 = tail call i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, i32 0) #3, !alias.scope !25, !noalias !28
  %15 = extractelement <2 x i16> %5, i64 1
  %16 = zext i16 %15 to i32
  %17 = add i32 %14, -1
  %18 = icmp ult i32 %17, %16
  br i1 %18, label %35, label %19

19:                                               ; preds = %13
  %20 = mul i32 %8, %16
  %21 = add i32 %20, %10
  %22 = zext i32 %21 to i64
  %23 = getelementptr inbounds i32, i32 addrspace(1)* %3, i64 %22
  store i32 0, i32 addrspace(1)* %23, align 4, !tbaa !33, !alias.scope !37, !noalias !38
  %24 = getelementptr inbounds i32, i32 addrspace(1)* %4, i64 %22
  store i32 0, i32 addrspace(1)* %24, align 4, !tbaa !33, !alias.scope !39, !noalias !40
  %25 = tail call { <4 x float>, i8 } @air.read_texture_2d.i16.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, <2 x i16> %5, i16 0, i32 3) #3, !alias.scope !25, !noalias !28
  %26 = extractvalue { <4 x float>, i8 } %25, 0
  %27 = extractelement <4 x float> %26, i64 0
  %28 = load float, float addrspace(2)* %2, align 4, !tbaa !41, !alias.scope !43, !noalias !44
  %29 = fcmp fast ult float %27, %28
  br i1 %29, label %33, label %30

30:                                               ; preds = %19
  %31 = add i32 %21, 1
  %32 = getelementptr inbounds i32, i32 addrspace(1)* %1, i64 %22
  store i32 %31, i32 addrspace(1)* %32, align 4, !tbaa !33, !alias.scope !45, !noalias !46
  tail call void @air.write_texture_2d.i16.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %0, <2 x i16> %5, <4 x float> <float 1.000000e+00, float 1.000000e+00, float 1.000000e+00, float 1.000000e+00>, i16 0, i32 3) #4, !alias.scope !25, !noalias !28
  br label %35

33:                                               ; preds = %19
  %34 = getelementptr inbounds i32, i32 addrspace(1)* %1, i64 %22
  store i32 0, i32 addrspace(1)* %34, align 4, !tbaa !33, !alias.scope !45, !noalias !46
  tail call void @air.write_texture_2d.i16.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %0, <2 x i16> %5, <4 x float> <float 0.000000e+00, float 0.000000e+00, float 0.000000e+00, float 1.000000e+00>, i16 0, i32 3) #4, !alias.scope !25, !noalias !28
  br label %35

35:                                               ; preds = %33, %30, %13, %7
  ret void
}

; Function Attrs: argmemonly mustprogress nounwind willreturn
declare void @air.write_texture_2d.i16.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i16>, <4 x float>, i16, i32) local_unnamed_addr #1

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.read_texture_2d.i16.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, <2 x i16>, i16, i32) local_unnamed_addr #2

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #2

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #2

attributes #0 = { mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly mustprogress nounwind willreturn }
attributes #2 = { argmemonly mustprogress nofree nounwind readonly willreturn }
attributes #3 = { argmemonly nounwind readonly willreturn }
attributes #4 = { argmemonly nounwind willreturn }

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
!15 = !{void (%struct._texture_2d_t addrspace(1)*, i32 addrspace(1)*, float addrspace(2)*, i32 addrspace(1)*, i32 addrspace(1)*, <2 x i16>, <2 x i32>)* @initializeKernel, !16, !17}
!16 = !{}
!17 = !{!18, !19, !20, !21, !22, !23, !24}
!18 = !{i32 0, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.read_write", !"air.arg_type_name", !"texture2d<float, read_write>", !"air.arg_name", !"sourceTexture"}
!19 = !{i32 1, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"labeledImage"}
!20 = !{i32 2, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"threshold"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"componentCount"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"centroidX"}
!23 = !{i32 5, !"air.thread_position_in_grid", !"air.arg_type_name", !"ushort2", !"air.arg_name", !"gid"}
!24 = !{i32 6, !"air.thread_position_in_threadgroup", !"air.arg_type_name", !"uint2", !"air.arg_name", !"pid", !"air.arg_unused"}
!25 = !{!26}
!26 = distinct !{!26, !27, !"air-alias-scope-textures"}
!27 = distinct !{!27, !"air-alias-scopes(initializeKernel)"}
!28 = !{!29, !30, !31, !32}
!29 = distinct !{!29, !27, !"air-alias-scope-arg(1)"}
!30 = distinct !{!30, !27, !"air-alias-scope-arg(2)"}
!31 = distinct !{!31, !27, !"air-alias-scope-arg(3)"}
!32 = distinct !{!32, !27, !"air-alias-scope-arg(4)"}
!33 = !{!34, !34, i64 0}
!34 = !{!"int", !35, i64 0}
!35 = !{!"omnipotent char", !36, i64 0}
!36 = !{!"Simple C++ TBAA"}
!37 = !{!31}
!38 = !{!26, !29, !30, !32}
!39 = !{!32}
!40 = !{!26, !29, !30, !31}
!41 = !{!42, !42, i64 0}
!42 = !{!"float", !35, i64 0}
!43 = !{!30}
!44 = !{!26, !29, !31, !32}
!45 = !{!29}
!46 = !{!26, !30, !31, !32}

