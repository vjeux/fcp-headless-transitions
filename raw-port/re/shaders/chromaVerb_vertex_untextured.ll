0x0000000000160f -- chromaVerb_vertex_untextured:
source_filename = "chromaVerb_vertex_untextured"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.ChromaVerbPointData = type { <2 x float>, float, float }

; Function Attrs: mustprogress nofree norecurse nosync nounwind readnone willreturn
define <{ <4 x float>, float, <4 x half>, i16 }> @chromaVerb_vertex_untextured(%struct.ChromaVerbPointData addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %0, float addrspace(2)* nocapture noundef readonly "air-buffer-no-alias" %1, i32 noundef %2) local_unnamed_addr #0 {
  %4 = load float, float addrspace(2)* %1, align 4, !tbaa !26, !alias.scope !30, !noalias !33
  %5 = zext i32 %2 to i64
  %6 = getelementptr inbounds %struct.ChromaVerbPointData, %struct.ChromaVerbPointData addrspace(2)* %0, i64 %5, i32 0
  %7 = load <2 x float>, <2 x float> addrspace(2)* %6, align 8, !tbaa !35, !alias.scope !33, !noalias !30
  %8 = getelementptr inbounds %struct.ChromaVerbPointData, %struct.ChromaVerbPointData addrspace(2)* %0, i64 %5, i32 1
  %9 = load float, float addrspace(2)* %8, align 8, !tbaa !36, !alias.scope !33, !noalias !30
  %10 = extractelement <2 x float> %7, i64 0
  %11 = fcmp fast olt float %10, 0xBFDB333340000000
  br i1 %11, label %12, label %22

12:                                               ; preds = %3
  %13 = fsub fast float 0xBFDB333340000000, %10
  %14 = fmul fast float %13, 0xC0002AE320000000
  %15 = fadd fast float %14, 0x3FECDD2F20000000
  %16 = fptrunc float %15 to half
  %17 = insertelement <4 x half> <half 0xH3B37, half poison, half 0xH0000, half poison>, half %16, i64 1
  %18 = getelementptr inbounds %struct.ChromaVerbPointData, %struct.ChromaVerbPointData addrspace(2)* %0, i64 %5, i32 2
  %19 = load float, float addrspace(2)* %18, align 4, !tbaa !38, !alias.scope !33, !noalias !30
  %20 = fptrunc float %19 to half
  %21 = insertelement <4 x half> %17, half %20, i64 3
  br label %92

22:                                               ; preds = %3
  %23 = fcmp fast olt float %10, 0.000000e+00
  br i1 %23, label %24, label %42

24:                                               ; preds = %22
  %25 = fmul fast float %10, 0x4002D2D2C0000000
  %26 = fadd fast float %25, 1.000000e+00
  %27 = fmul fast float %10, 0xC000FA9420000000
  %28 = fmul fast float %26, 0x3FD3126EA0000000
  %29 = fadd fast float %28, %27
  %30 = fptrunc float %29 to half
  %31 = insertelement <4 x half> undef, half %30, i64 0
  %32 = fmul fast float %26, 0x3FEEFEC560000000
  %33 = fadd fast float %32, %27
  %34 = fptrunc float %33 to half
  %35 = insertelement <4 x half> %31, half %34, i64 1
  %36 = fptrunc float %28 to half
  %37 = insertelement <4 x half> %35, half %36, i64 2
  %38 = getelementptr inbounds %struct.ChromaVerbPointData, %struct.ChromaVerbPointData addrspace(2)* %0, i64 %5, i32 2
  %39 = load float, float addrspace(2)* %38, align 4, !tbaa !38, !alias.scope !33, !noalias !30
  %40 = fptrunc float %39 to half
  %41 = insertelement <4 x half> %37, half %40, i64 3
  br label %92

42:                                               ; preds = %22
  %43 = fcmp fast olt float %10, 0x3FDB333340000000
  br i1 %43, label %44, label %65

44:                                               ; preds = %42
  %45 = fsub fast float 0x3FDB333340000000, %10
  %46 = fmul fast float %45, 0x4002D2D2C0000000
  %47 = fsub fast float 1.000000e+00, %46
  %48 = fmul fast float %45, 0x3FE67009A0000000
  %49 = fmul fast float %47, 0x3FD71758E0000000
  %50 = fadd fast float %49, %48
  %51 = fptrunc float %50 to half
  %52 = insertelement <4 x half> undef, half %51, i64 0
  %53 = fmul fast float %45, 0x40023B8320000000
  %54 = fmul fast float %47, 0x3FE979A6C0000000
  %55 = fadd fast float %54, %53
  %56 = fptrunc float %55 to half
  %57 = insertelement <4 x half> %52, half %56, i64 1
  %58 = fadd fast float %47, %48
  %59 = fptrunc float %58 to half
  %60 = insertelement <4 x half> %57, half %59, i64 2
  %61 = getelementptr inbounds %struct.ChromaVerbPointData, %struct.ChromaVerbPointData addrspace(2)* %0, i64 %5, i32 2
  %62 = load float, float addrspace(2)* %61, align 4, !tbaa !38, !alias.scope !33, !noalias !30
  %63 = fptrunc float %62 to half
  %64 = insertelement <4 x half> %60, half %63, i64 3
  br label %92

65:                                               ; preds = %42
  %66 = fcmp fast olt float %10, 0x3FEB333340000000
  br i1 %66, label %67, label %87

67:                                               ; preds = %65
  %68 = fsub fast float 0x3FEB333340000000, %10
  %69 = fmul fast float %68, 0x4002D2D2C0000000
  %70 = fsub fast float 1.000000e+00, %69
  %71 = fmul fast float %68, 0x3FEB2A86A0000000
  %72 = fmul fast float %70, 0x3FECDD2F20000000
  %73 = fadd fast float %72, %71
  %74 = fptrunc float %73 to half
  %75 = insertelement <4 x half> undef, half %74, i64 0
  %76 = fmul fast float %68, 0x3FFDF887E0000000
  %77 = fptrunc float %76 to half
  %78 = insertelement <4 x half> %75, half %77, i64 1
  %79 = fmul fast float %70, 0x3FE3532620000000
  %80 = fadd fast float %79, %69
  %81 = fptrunc float %80 to half
  %82 = insertelement <4 x half> %78, half %81, i64 2
  %83 = getelementptr inbounds %struct.ChromaVerbPointData, %struct.ChromaVerbPointData addrspace(2)* %0, i64 %5, i32 2
  %84 = load float, float addrspace(2)* %83, align 4, !tbaa !38, !alias.scope !33, !noalias !30
  %85 = fptrunc float %84 to half
  %86 = insertelement <4 x half> %82, half %85, i64 3
  br label %92

87:                                               ; preds = %65
  %88 = getelementptr inbounds %struct.ChromaVerbPointData, %struct.ChromaVerbPointData addrspace(2)* %0, i64 %5, i32 2
  %89 = load float, float addrspace(2)* %88, align 4, !tbaa !38, !alias.scope !33, !noalias !30
  %90 = fptrunc float %89 to half
  %91 = insertelement <4 x half> <half 0xH3B37, half 0xH0000, half 0xH38D5, half poison>, half %90, i64 3
  br label %92

92:                                               ; preds = %87, %67, %44, %24, %12
  %93 = phi <4 x half> [ %21, %12 ], [ %41, %24 ], [ %64, %44 ], [ %86, %67 ], [ %91, %87 ]
  %94 = fmul fast float %9, %4
  %95 = shufflevector <2 x float> %7, <2 x float> poison, <4 x i32> <i32 0, i32 1, i32 undef, i32 undef>
  %96 = shufflevector <4 x float> %95, <4 x float> <float poison, float poison, float 0.000000e+00, float 1.000000e+00>, <4 x i32> <i32 0, i32 1, i32 6, i32 7>
  %97 = insertvalue <{ <4 x float>, float, <4 x half>, i16 }> undef, <4 x float> %96, 0
  %98 = insertvalue <{ <4 x float>, float, <4 x half>, i16 }> %97, float %94, 1
  %99 = insertvalue <{ <4 x float>, float, <4 x half>, i16 }> %98, <4 x half> %93, 2
  ret <{ <4 x float>, float, <4 x half>, i16 }> %99
}

attributes #0 = { mustprogress nofree norecurse nosync nounwind readnone willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="0" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }

!llvm.module.flags = !{!0, !1, !2, !3, !4, !5, !6, !7, !8}
!llvm.ident = !{!9}
!air.version = !{!10}
!air.language_version = !{!11}
!air.compile_options = !{!12, !13, !14}
!air.vertex = !{!15}

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
!15 = !{<{ <4 x float>, float, <4 x half>, i16 }> (%struct.ChromaVerbPointData addrspace(2)*, float addrspace(2)*, i32)* @chromaVerb_vertex_untextured, !16, !21}
!16 = !{!17, !18, !19, !20}
!17 = !{!"air.position", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!18 = !{!"air.point_size", !"air.arg_type_name", !"float", !"air.arg_name", !"pointSize"}
!19 = !{!"air.vertex_output", !"generated(5colorDv4_Dh)", !"air.arg_type_name", !"half4", !"air.arg_name", !"color"}
!20 = !{!"air.vertex_output", !"generated(4m_IDt)", !"air.arg_type_name", !"ushort", !"air.arg_name", !"m_ID"}
!21 = !{!22, !24, !25}
!22 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !23, !"air.arg_type_size", i32 16, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ChromaVerbPointData", !"air.arg_name", !"pointData"}
!23 = !{i32 0, i32 8, i32 0, !"float2", !"position", i32 8, i32 4, i32 0, !"float", !"radius", i32 12, i32 4, i32 0, !"float", !"alpha"}
!24 = !{i32 1, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"float", !"air.arg_name", !"parameters"}
!25 = !{i32 2, !"air.vertex_id", !"air.arg_type_name", !"uint", !"air.arg_name", !"vid"}
!26 = !{!27, !27, i64 0}
!27 = !{!"float", !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{!31}
!31 = distinct !{!31, !32, !"air-alias-scope-arg(1)"}
!32 = distinct !{!32, !"air-alias-scopes(chromaVerb_vertex_untextured)"}
!33 = !{!34}
!34 = distinct !{!34, !32, !"air-alias-scope-arg(0)"}
!35 = !{!28, !28, i64 0}
!36 = !{!37, !27, i64 8}
!37 = !{!"_ZTS19ChromaVerbPointData", !28, i64 0, !27, i64 8, !27, i64 12}
!38 = !{!37, !27, i64 12}

