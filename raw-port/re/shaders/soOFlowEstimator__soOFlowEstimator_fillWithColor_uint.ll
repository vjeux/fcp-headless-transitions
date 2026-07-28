0x000000000a14bd -- soOFlowEstimator::soOFlowEstimator_fillWithColor_uint:
source_filename = "soOFlowEstimator::soOFlowEstimator_fillWithColor_uint"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.soOFlowEstimator::soOFlowEstimator_fillWithColor_params_uint" = type { <4 x i32> }
%struct._texture_2d_t = type opaque

; Function Attrs: nounwind
define void @"soOFlowEstimator::soOFlowEstimator_fillWithColor_uint"(%"struct.soOFlowEstimator::soOFlowEstimator_fillWithColor_params_uint" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, %struct._texture_2d_t addrspace(1)* %2) local_unnamed_addr #0 {
  %4 = extractelement <2 x i32> %1, i64 0
  %5 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, i32 0) #2, !alias.scope !21, !noalias !24
  %6 = icmp ult i32 %4, %5
  br i1 %6, label %7, label %14

7:                                                ; preds = %3
  %8 = extractelement <2 x i32> %1, i64 1
  %9 = tail call i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, i32 0) #2, !alias.scope !21, !noalias !24
  %10 = icmp ult i32 %8, %9
  br i1 %10, label %11, label %14

11:                                               ; preds = %7
  %12 = getelementptr inbounds %"struct.soOFlowEstimator::soOFlowEstimator_fillWithColor_params_uint", %"struct.soOFlowEstimator::soOFlowEstimator_fillWithColor_params_uint" addrspace(2)* %0, i64 0, i32 0
  %13 = load <4 x i32>, <4 x i32> addrspace(2)* %12, align 16, !tbaa !26, !alias.scope !24, !noalias !21
  tail call void @air.write_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture %2, <2 x i32> %1, <4 x i32> %13, i32 0, i32 2) #1, !alias.scope !21, !noalias !24
  br label %14

14:                                               ; preds = %11, %7, %3
  ret void
}

; Function Attrs: argmemonly nounwind
declare void @air.write_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x i32>, i32, i32) local_unnamed_addr #1

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_height_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #2

; Function Attrs: argmemonly nounwind readonly
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #2

attributes #0 = { nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { argmemonly nounwind }
attributes #2 = { argmemonly nounwind readonly }

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
!14 = !{void (%"struct.soOFlowEstimator::soOFlowEstimator_fillWithColor_params_uint" addrspace(2)*, <2 x i32>, %struct._texture_2d_t addrspace(1)*)* @"soOFlowEstimator::soOFlowEstimator_fillWithColor_uint", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"soOFlowEstimator::soOFlowEstimator_fillWithColor_params_uint", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 16, i32 0, !"uint4", !"m_color"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"coord"}
!20 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<uint, write>", !"air.arg_name", !"output"}
!21 = !{!22}
!22 = distinct !{!22, !23, !"air-alias-scope-textures"}
!23 = distinct !{!23, !"air-alias-scopes(soOFlowEstimator::soOFlowEstimator_fillWithColor_uint)"}
!24 = !{!25}
!25 = distinct !{!25, !23, !"air-alias-scope-arg(0)"}
!26 = !{!27, !27, i64 0}
!27 = !{!"omnipotent char", !28, i64 0}
!28 = !{!"Simple C++ TBAA"}

