0x00000000013ab9 -- cocFragmentFunc:
source_filename = "cocFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%"struct.metal::matrix" = type { [4 x <4 x float>] }
%struct._sampler_t = type opaque

@__air_sampler_state.2 = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
define <4 x float> @cocFragmentFunc(<4 x float> %0, <2 x float> %1, %struct._texture_2d_t addrspace(1)* nocapture readonly %2, %"struct.metal::matrix" addrspace(2)* nocapture noundef readonly align 16 dereferenceable(64) "air-buffer-no-alias" %3, float addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %4, float addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %5, float addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %6, float addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %7, float addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %8) local_unnamed_addr #0 {
  %10 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state.2 to %struct._sampler_t addrspace(2)*), <2 x float> %1, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3
  %11 = extractvalue { <4 x float>, i8 } %10, 0
  %12 = extractelement <4 x float> %11, i64 0
  %13 = getelementptr inbounds %"struct.metal::matrix", %"struct.metal::matrix" addrspace(2)* %3, i64 0, i32 0, i64 2
  %14 = load <4 x float>, <4 x float> addrspace(2)* %13, align 16, !tbaa.struct !29, !alias.scope !33, !noalias !36
  %15 = getelementptr inbounds %"struct.metal::matrix", %"struct.metal::matrix" addrspace(2)* %3, i64 0, i32 0, i64 3
  %16 = load <4 x float>, <4 x float> addrspace(2)* %15, align 16, !tbaa.struct !43, !alias.scope !33, !noalias !36
  %17 = shufflevector <4 x float> %11, <4 x float> poison, <4 x i32> zeroinitializer
  %18 = fmul fast <4 x float> %17, %14
  %19 = fadd fast <4 x float> %18, %16
  %20 = shufflevector <4 x float> %19, <4 x float> undef, <4 x i32> <i32 undef, i32 undef, i32 3, i32 undef>
  %21 = fdiv fast <4 x float> %19, %20
  %22 = extractelement <4 x float> %21, i64 2
  %23 = fneg fast float %22
  %24 = load float, float addrspace(2)* %4, align 4, !tbaa !44, !alias.scope !46, !noalias !47
  %25 = fcmp fast ogt float %24, %23
  %26 = load float, float addrspace(2)* %5, align 4, !alias.scope !48, !noalias !49
  %27 = fcmp fast olt float %26, %23
  %28 = select i1 %25, i1 true, i1 %27
  br i1 %28, label %29, label %50

29:                                               ; preds = %9
  br i1 %25, label %30, label %32

30:                                               ; preds = %29
  %31 = fadd fast float %22, %24
  br label %40

32:                                               ; preds = %29
  %33 = tail call fast float @air.fast_fabs.f32(float %12) #4
  %34 = fcmp fast ogt float %33, 0x3FEFFF2E40000000
  br i1 %34, label %40, label %35

35:                                               ; preds = %32
  %36 = fsub fast float %23, %26
  %37 = load float, float addrspace(2)* %7, align 4, !tbaa !44, !alias.scope !50, !noalias !51
  %38 = fsub fast float %37, %26
  %39 = tail call fast float @air.fast_fmin.f32(float %36, float %38) #4
  br label %40

40:                                               ; preds = %35, %32, %30
  %41 = phi float [ %31, %30 ], [ %39, %35 ], [ 0.000000e+00, %32 ]
  %42 = load float, float addrspace(2)* %6, align 4, !tbaa !44, !alias.scope !52, !noalias !53
  %43 = fmul fast float %42, %41
  %44 = fdiv fast float %43, %23
  %45 = load float, float addrspace(2)* %8, align 4, !tbaa !44, !alias.scope !54, !noalias !55
  %46 = tail call fast float @air.fast_fmin.f32(float %44, float %45) #4
  %47 = insertelement <4 x float> <float poison, float poison, float poison, float 1.000000e+00>, float %46, i64 0
  %48 = insertelement <4 x float> %47, float %46, i64 1
  %49 = insertelement <4 x float> %48, float %46, i64 2
  br label %50

50:                                               ; preds = %40, %9
  %51 = phi <4 x float> [ %49, %40 ], [ zeroinitializer, %9 ]
  ret <4 x float> %51
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmin.f32(float, float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fabs.f32(float) local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #3 = { argmemonly convergent nounwind readonly willreturn }
attributes #4 = { nounwind readnone willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.fragment = !{!15}
!air.sampler_states = !{!28}

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
!15 = !{<4 x float> (<4 x float>, <2 x float>, %struct._texture_2d_t addrspace(1)*, %"struct.metal::matrix" addrspace(2)*, float addrspace(2)*, float addrspace(2)*, float addrspace(2)*, float addrspace(2)*, float addrspace(2)*)* @cocFragmentFunc, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!18 = !{!19, !20, !21, !22, !23, !24, !25, !26, !27}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(2uvDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"uv"}
!21 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"zBuffer"}
!22 = !{i32 3, !"air.buffer", !"air.buffer_size", i32 64, !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 64, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"float4x4", !"air.arg_name", !"invProj"}
!23 = !{i32 4, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 3, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"dofNear"}
!24 = !{i32 5, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 4, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"dofFar"}
!25 = !{i32 6, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 5, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"aperture"}
!26 = !{i32 7, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 6, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"farPlane"}
!27 = !{i32 8, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 7, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"maxRadius"}
!28 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state.2}
!29 = !{i64 0, i64 32, !30}
!30 = !{!31, !31, i64 0}
!31 = !{!"omnipotent char", !32, i64 0}
!32 = !{!"Simple C++ TBAA"}
!33 = !{!34}
!34 = distinct !{!34, !35, !"air-alias-scope-arg(3)"}
!35 = distinct !{!35, !"air-alias-scopes(cocFragmentFunc)"}
!36 = !{!37, !38, !39, !40, !41, !42}
!37 = distinct !{!37, !35, !"air-alias-scope-textures"}
!38 = distinct !{!38, !35, !"air-alias-scope-arg(4)"}
!39 = distinct !{!39, !35, !"air-alias-scope-arg(5)"}
!40 = distinct !{!40, !35, !"air-alias-scope-arg(6)"}
!41 = distinct !{!41, !35, !"air-alias-scope-arg(7)"}
!42 = distinct !{!42, !35, !"air-alias-scope-arg(8)"}
!43 = !{i64 0, i64 16, !30}
!44 = !{!45, !45, i64 0}
!45 = !{!"float", !31, i64 0}
!46 = !{!38}
!47 = !{!37, !34, !39, !40, !41, !42}
!48 = !{!39}
!49 = !{!37, !34, !38, !40, !41, !42}
!50 = !{!41}
!51 = !{!37, !34, !38, !39, !40, !42}
!52 = !{!40}
!53 = !{!37, !34, !38, !39, !41, !42}
!54 = !{!42}
!55 = !{!37, !34, !38, !39, !40, !41}

