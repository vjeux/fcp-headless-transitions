0x00000000014ec0 -- textureSamplingShader:
source_filename = "textureSamplingShader"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

@__metal_implicit_fc_pred_0 = internal addrspace(2) global i8 0, align 1
@_ZL23channel_to_dupe_defined = internal unnamed_addr addrspace(2) global i8 0, align 1
@_Z15channel_to_dupe.MTL_FC_INIT_0_b = internal addrspace(2) externally_initialized constant i8 undef, section "air.fc_initializer", align 1
@_ZL15channel_to_dupe = internal unnamed_addr addrspace(2) global i8 undef, align 1
@__air_sampler_state = internal addrspace(2) constant [2 x i64] [i64 34901797601020489, i64 0], align 8
@llvm.global_ctors = appending global [1 x { i32, void ()*, i8* }] [{ i32, void ()*, i8* } { i32 65535, void ()* @_GLOBAL__sub_I_FFMetalVideoPainterShaders.metal, i8* null }]
@llvm.compiler.used = appending global [1 x i8*] [i8* addrspacecast (i8 addrspace(2)* @__metal_implicit_fc_pred_0 to i8*)], section "llvm.metadata"

; Function Attrs: mustprogress nofree nosync nounwind willreturn
define internal void @_GLOBAL__sub_I_FFMetalVideoPainterShaders.metal() #0 section "air.static_init" {
  %1 = load i8, i8 addrspace(2)* @_Z15channel_to_dupe.MTL_FC_INIT_0_b, align 1, !tbaa !26, !range !30
  store i8 %1, i8 addrspace(2)* @_ZL15channel_to_dupe, align 1, !tbaa !26
  %2 = tail call i1 @air.is_function_constant_defined(i8 addrspace(2)* nocapture @_Z15channel_to_dupe.MTL_FC_INIT_0_b) #4
  %3 = zext i1 %2 to i8
  store i8 %3, i8 addrspace(2)* @_ZL23channel_to_dupe_defined, align 1, !tbaa !26
  %4 = tail call i8 @air.normalize_function_constant_predicate.i8(i8 %3) #4
  store i8 %4, i8 addrspace(2)* @__metal_implicit_fc_pred_0, align 1
  ret void
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare i8 @air.normalize_function_constant_predicate.i8(i8) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare i1 @air.is_function_constant_defined(i8 addrspace(2)* nocapture) local_unnamed_addr #1

; Function Attrs: convergent mustprogress nofree nounwind readonly willreturn
define <4 x float> @textureSamplingShader(<4 x float> %0, <2 x float> %1, %struct._texture_2d_t addrspace(1)* nocapture readonly %2, <4 x i32> addrspace(2)* nocapture noundef readonly align 16 dereferenceable(16) "air-buffer-no-alias" %3) local_unnamed_addr #2 {
  %5 = tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, %struct._sampler_t addrspace(2)* nocapture readonly bitcast ([2 x i64] addrspace(2)* @__air_sampler_state to %struct._sampler_t addrspace(2)*), <2 x float> %1, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #5
  %6 = extractvalue { <4 x half>, i8 } %5, 0
  %7 = load i8, i8 addrspace(2)* @_ZL23channel_to_dupe_defined, align 1, !tbaa !26, !range !30
  %8 = icmp eq i8 %7, 0
  %9 = load i8, i8 addrspace(2)* @_ZL15channel_to_dupe, align 1
  %10 = icmp eq i8 %9, 0
  %11 = select i1 %8, i1 true, i1 %10
  br i1 %11, label %26, label %12

12:                                               ; preds = %4
  %13 = load <4 x i32>, <4 x i32> addrspace(2)* %3, align 16, !alias.scope !31, !noalias !34
  %14 = extractelement <4 x i32> %13, i64 0
  %15 = extractelement <4 x half> %6, i32 %14
  %16 = insertelement <4 x half> undef, half %15, i64 0
  %17 = extractelement <4 x i32> %13, i64 1
  %18 = extractelement <4 x half> %6, i32 %17
  %19 = insertelement <4 x half> %16, half %18, i64 1
  %20 = extractelement <4 x i32> %13, i64 2
  %21 = extractelement <4 x half> %6, i32 %20
  %22 = insertelement <4 x half> %19, half %21, i64 2
  %23 = extractelement <4 x i32> %13, i64 3
  %24 = extractelement <4 x half> %6, i32 %23
  %25 = insertelement <4 x half> %22, half %24, i64 3
  br label %26

26:                                               ; preds = %12, %4
  %27 = phi <4 x half> [ %25, %12 ], [ %6, %4 ]
  %28 = tail call fast <4 x float> @air.convert.f.v4f32.f.v4f16(<4 x half> %27) #4
  ret <4 x float> %28
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <4 x float> @air.convert.f.v4f32.f.v4f16(<4 x half>) local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x half>, i8 } @air.sample_texture_2d.v4f16(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #3

attributes #0 = { mustprogress nofree nosync nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #3 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #4 = { nounwind readnone willreturn }
attributes #5 = { argmemonly convergent nounwind readonly willreturn }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.fragment = !{!15}
!air.function_constants = !{!24}
!air.sampler_states = !{!25}

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
!15 = !{<4 x float> (<4 x float>, <2 x float>, %struct._texture_2d_t addrspace(1)*, <4 x i32> addrspace(2)*)* @textureSamplingShader, !16, !18}
!16 = !{!17}
!17 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4"}
!18 = !{!19, !20, !21, !22}
!19 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"clipSpacePosition", !"air.arg_unused"}
!20 = !{i32 1, !"air.fragment_input", !"generated(17textureCoordinateDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"textureCoordinate"}
!21 = !{i32 2, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<half, sample>", !"air.arg_name", !"colorTexture"}
!22 = !{i32 3, !"air.function_constant", !23, !"air.buffer", !"air.buffer_size", i32 16, !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"int4", !"air.arg_name", !"colorChannelToDup"}
!23 = !{i8 addrspace(2)* @__metal_implicit_fc_pred_0, !"bool", !"channel_to_dupe_defined"}
!24 = !{i8 addrspace(2)* @_Z15channel_to_dupe.MTL_FC_INIT_0_b, !"bool", !"channel_to_dupe", i32 0, i1 false}
!25 = !{!"air.sampler_state", [2 x i64] addrspace(2)* @__air_sampler_state}
!26 = !{!27, !27, i64 0}
!27 = !{!"bool", !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{i8 0, i8 2}
!31 = !{!32}
!32 = distinct !{!32, !33, !"air-alias-scope-arg(3)"}
!33 = distinct !{!33, !"air-alias-scopes(textureSamplingShader)"}
!34 = !{!35}
!35 = distinct !{!35, !33, !"air-alias-scope-textures"}

