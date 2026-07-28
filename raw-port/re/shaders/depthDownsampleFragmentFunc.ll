0x0000000001f1b9 -- depthDownsampleFragmentFunc:
source_filename = "depthDownsampleFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._depth_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state.3 = internal addrspace(2) constant [2 x i64] [i64 34901797601017929, i64 0], align 8

; Function Attrs: convergent mustprogress nofree nounwind readonly willreturn
define <{ float }> @depthDownsampleFragmentFunc(<4 x float> %0, <2 x float> %1, %struct._depth_2d_t addrspace(1)* %2, i32 addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %3, <2 x float> addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %4) local_unnamed_addr #0 {
  %6 = load i32, i32 addrspace(2)* %3, align 4, !tbaa !25, !alias.scope !29, !noalias !32
  %7 = icmp sgt i32 %6, 0
  br i1 %7, label %11, label %8

8:                                                ; preds = %11, %5
  %9 = phi float [ 1.000000e+00, %5 ], [ %26, %11 ]
  %10 = insertvalue <{ float }> undef, float %9, 0
  ret <{ float }> %10

11:                                               ; preds = %11, %5
  %12 = phi float [ %26, %11 ], [ 1.000000e+00, %5 ]
  %13 = phi i32 [ %27, %11 ], [ 0, %5 ]
  %14 = zext i32 %13 to i64
  %15 = getelementptr inbounds <2 x float>, <2 x float> addrspace(2)* %4, i64 %14
  %16 = load <2 x float>, <2 x float> addrspace(2)* %15, align 8, !tbaa !35, !alias.scope !36, !noalias !37
  %17 = fadd fast <2 x float> %16, %1
  %18 = tail call { float, i8 } @air.sample_depth_2d.f32(%struct._depth_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.3 to %struct._sampler_t addrspace(2)*), i32 1, <2 x float> %17, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2
  %19 = extractvalue { float, i8 } %18, 0
  %20 = fcmp fast olt float %19, %12
  %21 = select i1 %20, float %19, float %12
  %22 = fsub fast <2 x float> %1, %16
  %23 = tail call { float, i8 } @air.sample_depth_2d.f32(%struct._depth_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.3 to %struct._sampler_t addrspace(2)*), i32 1, <2 x float> %22, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2
  %24 = extractvalue { float, i8 } %23, 0
  %25 = fcmp fast olt float %24, %21
  %26 = select i1 %25, float %24, float %21
  %27 = add nuw nsw i32 %13, 1
  %28 = icmp eq i32 %27, %6
  br i1 %28, label %8, label %11, !llvm.loop !38
}

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { float, i8 } @air.sample_depth_2d.f32(%struct._depth_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, i32, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

attributes #0 = { convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #2 = { argmemonly convergent nounwind readonly willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.fragment = !{!15}
!air.sampler_states = !{!24}

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
!15 = !{<{ float }> (<4 x float>, <2 x float>, %struct._depth_2d_t addrspace(1)*, i32 addrspace(2)*, <2 x float> addrspace(2)*)* @depthDownsampleFragmentFunc, !16, !18}
!16 = !{!17}
!17 = !{!"air.depth", !"air.depth_qualifier", !"air.any", !"air.arg_type_name", !"float", !"air.arg_name", !"z"}
!18 = !{!19, !20, !21, !22, !23}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(2uvDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"uv"}
!21 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"depth2d<float, sample>", !"air.arg_name", !"inputtex"}
!22 = !{i32 3, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"int", !"air.arg_name", !"numSamples"}
!23 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"float2", !"air.arg_name", !"offsets"}
!24 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state.3}
!25 = !{!26, !26, i64 0}
!26 = !{!"int", !27, i64 0}
!27 = !{!"omnipotent char", !28, i64 0}
!28 = !{!"Simple C++ TBAA"}
!29 = !{!30}
!30 = distinct !{!30, !31, !"air-alias-scope-arg(3)"}
!31 = distinct !{!31, !"air-alias-scopes(depthDownsampleFragmentFunc)"}
!32 = !{!33, !34}
!33 = distinct !{!33, !31, !"air-alias-scope-textures"}
!34 = distinct !{!34, !31, !"air-alias-scope-arg(4)"}
!35 = !{!27, !27, i64 0}
!36 = !{!34}
!37 = !{!33, !30}
!38 = distinct !{!38, !39}
!39 = !{!"llvm.loop.mustprogress"}

