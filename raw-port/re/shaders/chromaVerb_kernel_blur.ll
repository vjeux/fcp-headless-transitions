0x0000000000048f -- chromaVerb_kernel_blur:
source_filename = "chromaVerb_kernel_blur"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__air_sampler_state = internal addrspace(2) constant [2 x i64] [i64 34901797601050624, i64 0], align 8

; Function Attrs: convergent mustprogress nounwind
define void @chromaVerb_kernel_blur(%struct._texture_2d_t addrspace(1)* %0, %struct._texture_2d_t addrspace(1)* %1, float addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %2, <2 x i32> noundef %3) local_unnamed_addr #0 {
  %5 = load float, float addrspace(2)* %2, align 4, !tbaa !23, !alias.scope !27, !noalias !30
  %6 = getelementptr inbounds float, float addrspace(2)* %2, i64 1
  %7 = load float, float addrspace(2)* %6, align 4, !tbaa !23, !alias.scope !27, !noalias !30
  %8 = fdiv fast float %7, %5
  %9 = insertelement <4 x float> poison, float %8, i64 0
  %10 = shufflevector <4 x float> %9, <4 x float> poison, <4 x i32> zeroinitializer
  %11 = getelementptr inbounds float, float addrspace(2)* %2, i64 2
  %12 = load float, float addrspace(2)* %11, align 4, !tbaa !23, !alias.scope !27, !noalias !30
  %13 = fsub fast float 1.000000e+00, %12
  %14 = fmul fast float %5, 5.000000e-01
  %15 = tail call i32 @air.convert.s.i32.f.f32(float %14) #4
  %16 = icmp slt i32 %15, 0
  br i1 %16, label %23, label %17

17:                                               ; preds = %4
  %18 = sub nsw i32 0, %15
  %19 = extractelement <2 x i32> %3, i64 0
  %20 = tail call fast float @air.convert.f.f32.u.i32(i32 %19) #4
  %21 = extractelement <2 x i32> %3, i64 1
  %22 = tail call fast float @air.convert.f.f32.u.i32(i32 %21) #4
  br label %25

23:                                               ; preds = %25, %4
  %24 = phi <4 x float> [ zeroinitializer, %4 ], [ %38, %25 ]
  tail call void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture %1, <2 x i32> %3, <4 x float> %24, i32 0, i32 2) #5, !alias.scope !30, !noalias !27
  ret void

25:                                               ; preds = %25, %17
  %26 = phi <4 x float> [ zeroinitializer, %17 ], [ %38, %25 ]
  %27 = phi i32 [ %18, %17 ], [ %39, %25 ]
  %28 = tail call fast float @air.convert.f.f32.s.i32(i32 %27) #4
  %29 = fmul fast float %28, %12
  %30 = fsub fast float %20, %29
  %31 = insertelement <2 x float> undef, float %30, i64 0
  %32 = fmul fast float %28, %13
  %33 = fsub fast float %22, %32
  %34 = insertelement <2 x float> %31, float %33, i64 1
  %35 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %0, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %34, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #6
  %36 = extractvalue { <4 x float>, i8 } %35, 0
  %37 = fmul fast <4 x float> %36, %10
  %38 = fadd fast <4 x float> %37, %26
  %39 = add i32 %27, 1
  %40 = icmp eq i32 %27, %15
  br i1 %40, label %23, label %25, !llvm.loop !32
}

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #2

; Function Attrs: argmemonly mustprogress nounwind willreturn
declare void @air.write_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x float>, i32, i32) local_unnamed_addr #3

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.convert.f.f32.u.i32(i32) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare i32 @air.convert.s.i32.f.f32(float) local_unnamed_addr #2

attributes #0 = { convergent mustprogress nounwind "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #2 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #3 = { argmemonly mustprogress nounwind willreturn }
attributes #4 = { nounwind readnone willreturn }
attributes #5 = { argmemonly nounwind willreturn }
attributes #6 = { argmemonly convergent nounwind readonly willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.kernel = !{!15}
!air.sampler_states = !{!22}

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
!15 = !{void (%struct._texture_2d_t addrspace(1)*, %struct._texture_2d_t addrspace(1)*, float addrspace(2)*, <2 x i32>)* @chromaVerb_kernel_blur, !16, !17}
!16 = !{}
!17 = !{!18, !19, !20, !21}
!18 = !{i32 0, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"inTexture"}
!19 = !{i32 1, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<float, write>", !"air.arg_name", !"outTexture"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"parameters"}
!21 = !{i32 3, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"gid"}
!22 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state}
!23 = !{!24, !24, i64 0}
!24 = !{!"float", !25, i64 0}
!25 = !{!"omnipotent char", !26, i64 0}
!26 = !{!"Simple C++ TBAA"}
!27 = !{!28}
!28 = distinct !{!28, !29, !"air-alias-scope-arg(2)"}
!29 = distinct !{!29, !"air-alias-scopes(chromaVerb_kernel_blur)"}
!30 = !{!31}
!31 = distinct !{!31, !29, !"air-alias-scope-textures"}
!32 = distinct !{!32, !33}
!33 = !{!"llvm.loop.mustprogress"}

