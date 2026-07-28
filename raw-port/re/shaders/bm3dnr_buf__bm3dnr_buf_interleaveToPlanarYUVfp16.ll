0x00000000048e6d -- bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16:
source_filename = "bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v23-apple-macosx11.5.1"

%"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params" = type { i32, i32, i32, i32, i32, i32, i32, i32 }

; Function Attrs: argmemonly nounwind
define void @"bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16"(%"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params" addrspace(2)* nocapture readonly "air-buffer-no-alias" %0, <2 x i32> %1, half addrspace(1)* nocapture readonly "air-buffer-no-alias" %2, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %3, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %4, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %5, <4 x i16> addrspace(1)* nocapture "air-buffer-no-alias" %6) local_unnamed_addr #0 {
  %8 = extractelement <2 x i32> %1, i64 0
  %9 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params" addrspace(2)* %0, i64 0, i32 6
  %10 = load i32, i32 addrspace(2)* %9, align 4, !tbaa !25, !alias.scope !30, !noalias !33
  %11 = icmp ult i32 %8, %10
  br i1 %11, label %12, label %161

12:                                               ; preds = %7
  %13 = extractelement <2 x i32> %1, i64 1
  %14 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params" addrspace(2)* %0, i64 0, i32 7
  %15 = load i32, i32 addrspace(2)* %14, align 4, !tbaa !39, !alias.scope !30, !noalias !33
  %16 = icmp ult i32 %13, %15
  br i1 %16, label %17, label %161

17:                                               ; preds = %12
  %18 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params" addrspace(2)* %0, i64 0, i32 0
  %19 = load i32, i32 addrspace(2)* %18, align 4, !tbaa !40, !alias.scope !30, !noalias !33
  %20 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params" addrspace(2)* %0, i64 0, i32 1
  %21 = load i32, i32 addrspace(2)* %20, align 4, !tbaa !41, !alias.scope !30, !noalias !33
  %22 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params" addrspace(2)* %0, i64 0, i32 2
  %23 = load i32, i32 addrspace(2)* %22, align 4, !tbaa !42, !alias.scope !30, !noalias !33
  %24 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params" addrspace(2)* %0, i64 0, i32 3
  %25 = load i32, i32 addrspace(2)* %24, align 4, !tbaa !43, !alias.scope !30, !noalias !33
  %26 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params" addrspace(2)* %0, i64 0, i32 4
  %27 = load i32, i32 addrspace(2)* %26, align 4, !tbaa !44, !alias.scope !30, !noalias !33
  %28 = getelementptr inbounds %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params", %"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params" addrspace(2)* %0, i64 0, i32 5
  %29 = load i32, i32 addrspace(2)* %28, align 4, !tbaa !45, !alias.scope !30, !noalias !33
  %30 = zext i32 %8 to i64
  %31 = zext i32 %13 to i64
  %32 = shl nuw nsw i64 %30, 2
  %33 = or i64 %32, 1
  %34 = or i64 %32, 2
  %35 = or i64 %32, 3
  %36 = mul i32 %25, %13
  %37 = add i32 %36, %27
  %38 = mul i32 %37, %19
  %39 = zext i32 %38 to i64
  %40 = add nuw nsw i64 %32, %39
  %41 = getelementptr inbounds half, half addrspace(1)* %2, i64 %40
  %42 = load half, half addrspace(1)* %41, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %43 = fpext half %42 to float
  %44 = insertelement <4 x float> undef, float %43, i64 0
  %45 = add nuw nsw i64 %40, 1
  %46 = getelementptr inbounds half, half addrspace(1)* %2, i64 %45
  %47 = load half, half addrspace(1)* %46, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %48 = fpext half %47 to float
  %49 = insertelement <4 x float> %44, float %48, i64 1
  %50 = add nuw nsw i64 %40, 2
  %51 = getelementptr inbounds half, half addrspace(1)* %2, i64 %50
  %52 = load half, half addrspace(1)* %51, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %53 = fpext half %52 to float
  %54 = insertelement <4 x float> %49, float %53, i64 2
  %55 = add nuw nsw i64 %40, 3
  %56 = getelementptr inbounds half, half addrspace(1)* %2, i64 %55
  %57 = load half, half addrspace(1)* %56, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %58 = fpext half %57 to float
  %59 = insertelement <4 x float> %54, float %58, i64 3
  %60 = add nuw nsw i64 %33, %39
  %61 = getelementptr inbounds half, half addrspace(1)* %2, i64 %60
  %62 = load half, half addrspace(1)* %61, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %63 = fpext half %62 to float
  %64 = insertelement <4 x float> undef, float %63, i64 0
  %65 = add nuw nsw i64 %60, 1
  %66 = getelementptr inbounds half, half addrspace(1)* %2, i64 %65
  %67 = load half, half addrspace(1)* %66, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %68 = fpext half %67 to float
  %69 = insertelement <4 x float> %64, float %68, i64 1
  %70 = add nuw nsw i64 %60, 2
  %71 = getelementptr inbounds half, half addrspace(1)* %2, i64 %70
  %72 = load half, half addrspace(1)* %71, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %73 = fpext half %72 to float
  %74 = insertelement <4 x float> %69, float %73, i64 2
  %75 = add nuw nsw i64 %60, 3
  %76 = getelementptr inbounds half, half addrspace(1)* %2, i64 %75
  %77 = load half, half addrspace(1)* %76, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %78 = fpext half %77 to float
  %79 = insertelement <4 x float> %74, float %78, i64 3
  %80 = add nuw nsw i64 %34, %39
  %81 = getelementptr inbounds half, half addrspace(1)* %2, i64 %80
  %82 = load half, half addrspace(1)* %81, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %83 = fpext half %82 to float
  %84 = insertelement <4 x float> undef, float %83, i64 0
  %85 = add nuw nsw i64 %80, 1
  %86 = getelementptr inbounds half, half addrspace(1)* %2, i64 %85
  %87 = load half, half addrspace(1)* %86, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %88 = fpext half %87 to float
  %89 = insertelement <4 x float> %84, float %88, i64 1
  %90 = add nuw nsw i64 %80, 2
  %91 = getelementptr inbounds half, half addrspace(1)* %2, i64 %90
  %92 = load half, half addrspace(1)* %91, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %93 = fpext half %92 to float
  %94 = insertelement <4 x float> %89, float %93, i64 2
  %95 = add nuw nsw i64 %80, 3
  %96 = getelementptr inbounds half, half addrspace(1)* %2, i64 %95
  %97 = load half, half addrspace(1)* %96, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %98 = fpext half %97 to float
  %99 = insertelement <4 x float> %94, float %98, i64 3
  %100 = add nuw nsw i64 %35, %39
  %101 = getelementptr inbounds half, half addrspace(1)* %2, i64 %100
  %102 = load half, half addrspace(1)* %101, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %103 = fpext half %102 to float
  %104 = insertelement <4 x float> undef, float %103, i64 0
  %105 = add nuw nsw i64 %100, 1
  %106 = getelementptr inbounds half, half addrspace(1)* %2, i64 %105
  %107 = load half, half addrspace(1)* %106, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %108 = fpext half %107 to float
  %109 = insertelement <4 x float> %104, float %108, i64 1
  %110 = add nuw nsw i64 %100, 2
  %111 = getelementptr inbounds half, half addrspace(1)* %2, i64 %110
  %112 = load half, half addrspace(1)* %111, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %113 = fpext half %112 to float
  %114 = insertelement <4 x float> %109, float %113, i64 2
  %115 = add nuw nsw i64 %100, 3
  %116 = getelementptr inbounds half, half addrspace(1)* %2, i64 %115
  %117 = load half, half addrspace(1)* %116, align 2, !tbaa !46, !alias.scope !48, !noalias !49
  %118 = fpext half %117 to float
  %119 = insertelement <4 x float> %114, float %118, i64 3
  %120 = fmul <4 x float> %59, <float 6.553500e+04, float 6.553500e+04, float 6.553500e+04, float 6.553500e+04>
  %121 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %120, <4 x float> zeroinitializer, <4 x float> <float 6.553500e+04, float 6.553500e+04, float 6.553500e+04, float 6.553500e+04>) #1
  %122 = tail call <4 x i16> @air.convert.u.v4i16.f.v4f32(<4 x float> %121) #1
  %123 = fmul <4 x float> %79, <float 6.553500e+04, float 6.553500e+04, float 6.553500e+04, float 6.553500e+04>
  %124 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %123, <4 x float> zeroinitializer, <4 x float> <float 6.553500e+04, float 6.553500e+04, float 6.553500e+04, float 6.553500e+04>) #1
  %125 = tail call <4 x i16> @air.convert.u.v4i16.f.v4f32(<4 x float> %124) #1
  %126 = fmul <4 x float> %99, <float 6.553500e+04, float 6.553500e+04, float 6.553500e+04, float 6.553500e+04>
  %127 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %126, <4 x float> zeroinitializer, <4 x float> <float 6.553500e+04, float 6.553500e+04, float 6.553500e+04, float 6.553500e+04>) #1
  %128 = tail call <4 x i16> @air.convert.u.v4i16.f.v4f32(<4 x float> %127) #1
  %129 = fmul <4 x float> %119, <float 6.553500e+04, float 6.553500e+04, float 6.553500e+04, float 6.553500e+04>
  %130 = tail call <4 x float> @air.clamp.v4f32(<4 x float> %129, <4 x float> zeroinitializer, <4 x float> <float 6.553500e+04, float 6.553500e+04, float 6.553500e+04, float 6.553500e+04>) #1
  %131 = tail call <4 x i16> @air.convert.u.v4i16.f.v4f32(<4 x float> %130) #1
  %132 = shufflevector <4 x i16> %122, <4 x i16> %125, <4 x i32> <i32 0, i32 4, i32 undef, i32 undef>
  %133 = shufflevector <4 x i16> %132, <4 x i16> %128, <4 x i32> <i32 0, i32 1, i32 4, i32 undef>
  %134 = shufflevector <4 x i16> %133, <4 x i16> %131, <4 x i32> <i32 0, i32 1, i32 2, i32 4>
  %135 = shufflevector <4 x i16> %122, <4 x i16> %125, <4 x i32> <i32 1, i32 5, i32 undef, i32 undef>
  %136 = shufflevector <4 x i16> %135, <4 x i16> %128, <4 x i32> <i32 0, i32 1, i32 5, i32 undef>
  %137 = shufflevector <4 x i16> %136, <4 x i16> %131, <4 x i32> <i32 0, i32 1, i32 2, i32 5>
  %138 = shufflevector <4 x i16> %122, <4 x i16> %125, <4 x i32> <i32 2, i32 6, i32 undef, i32 undef>
  %139 = shufflevector <4 x i16> %138, <4 x i16> %128, <4 x i32> <i32 0, i32 1, i32 6, i32 undef>
  %140 = shufflevector <4 x i16> %139, <4 x i16> %131, <4 x i32> <i32 0, i32 1, i32 2, i32 6>
  %141 = shufflevector <4 x i16> %122, <4 x i16> %125, <4 x i32> <i32 3, i32 7, i32 undef, i32 undef>
  %142 = shufflevector <4 x i16> %141, <4 x i16> %128, <4 x i32> <i32 0, i32 1, i32 7, i32 undef>
  %143 = shufflevector <4 x i16> %142, <4 x i16> %131, <4 x i32> <i32 0, i32 1, i32 2, i32 7>
  %144 = trunc i32 %29 to i16
  %145 = insertelement <4 x i16> undef, i16 %144, i64 0
  %146 = and <4 x i16> %145, <i16 15, i16 undef, i16 undef, i16 undef>
  %147 = shufflevector <4 x i16> %146, <4 x i16> undef, <4 x i32> zeroinitializer
  %148 = lshr <4 x i16> %137, %147
  %149 = zext i32 %21 to i64
  %150 = mul nuw i64 %149, %31
  %151 = add nuw i64 %150, %30
  %152 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %3, i64 %151
  store <4 x i16> %148, <4 x i16> addrspace(1)* %152, align 8, !tbaa !50, !alias.scope !51, !noalias !52
  %153 = lshr <4 x i16> %140, %147
  %154 = zext i32 %23 to i64
  %155 = mul nuw i64 %154, %31
  %156 = add nuw i64 %155, %30
  %157 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %4, i64 %156
  store <4 x i16> %153, <4 x i16> addrspace(1)* %157, align 8, !tbaa !50, !alias.scope !53, !noalias !54
  %158 = lshr <4 x i16> %143, %147
  %159 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %5, i64 %156
  store <4 x i16> %158, <4 x i16> addrspace(1)* %159, align 8, !tbaa !50, !alias.scope !55, !noalias !56
  %160 = getelementptr inbounds <4 x i16>, <4 x i16> addrspace(1)* %6, i64 %156
  store <4 x i16> %134, <4 x i16> addrspace(1)* %160, align 8, !tbaa !50, !alias.scope !57, !noalias !58
  br label %161

161:                                              ; preds = %17, %12, %7
  ret void
}

; Function Attrs: nounwind readnone
declare <4 x i16> @air.convert.u.v4i16.f.v4f32(<4 x float>) local_unnamed_addr #1

; Function Attrs: nounwind readnone
declare <4 x float> @air.clamp.v4f32(<4 x float>, <4 x float>, <4 x float>) local_unnamed_addr #1

attributes #0 = { argmemonly nounwind "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-trapping-math"="true" "stack-protector-buffer-size"="8" }
attributes #1 = { nounwind readnone }

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
!14 = !{void (%"struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params" addrspace(2)*, <2 x i32>, half addrspace(1)*, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*, <4 x i16> addrspace(1)*)* @"bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16", !15, !16}
!15 = !{}
!16 = !{!17, !19, !20, !21, !22, !23, !24}
!17 = !{i32 0, !"air.buffer", !"air.location_index", i32 0, i32 1, !"air.read", !"air.struct_type_info", !18, !"air.arg_type_size", i32 32, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16_params", !"air.arg_name", !"params"}
!18 = !{i32 0, i32 4, i32 0, !"uint", !"m_strideIn", i32 4, i32 4, i32 0, !"uint", !"m_strideY", i32 8, i32 4, i32 0, !"uint", !"m_strideUVA", i32 12, i32 4, i32 0, !"uint", !"m_mul", i32 16, i32 4, i32 0, !"uint", !"m_off", i32 20, i32 4, i32 0, !"int", !"m_shift", i32 24, i32 4, i32 0, !"uint", !"m_globalWidth", i32 28, i32 4, i32 0, !"uint", !"m_globalHeight"}
!19 = !{i32 1, !"air.thread_position_in_grid", !"air.arg_type_name", !"uint2", !"air.arg_name", !"grid_in"}
!20 = !{i32 2, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.arg_type_size", i32 2, !"air.arg_type_align_size", i32 2, !"air.arg_type_name", !"half", !"air.arg_name", !"input"}
!21 = !{i32 3, !"air.buffer", !"air.location_index", i32 2, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"outputY"}
!22 = !{i32 4, !"air.buffer", !"air.location_index", i32 3, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"outputU"}
!23 = !{i32 5, !"air.buffer", !"air.location_index", i32 4, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"outputV"}
!24 = !{i32 6, !"air.buffer", !"air.location_index", i32 5, i32 1, !"air.read_write", !"air.arg_type_size", i32 8, !"air.arg_type_align_size", i32 8, !"air.arg_type_name", !"ushort4", !"air.arg_name", !"outputA"}
!25 = !{!26, !27, i64 24}
!26 = !{!"_ZTSN10bm3dnr_buf43bm3dnr_buf_interleaveToPlanarYUVfp16_paramsE", !27, i64 0, !27, i64 4, !27, i64 8, !27, i64 12, !27, i64 16, !27, i64 20, !27, i64 24, !27, i64 28}
!27 = !{!"int", !28, i64 0}
!28 = !{!"omnipotent char", !29, i64 0}
!29 = !{!"Simple C++ TBAA"}
!30 = !{!31}
!31 = distinct !{!31, !32, !"air-alias-scope-arg(0)"}
!32 = distinct !{!32, !"air-alias-scopes(bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16)"}
!33 = !{!34, !35, !36, !37, !38}
!34 = distinct !{!34, !32, !"air-alias-scope-arg(2)"}
!35 = distinct !{!35, !32, !"air-alias-scope-arg(3)"}
!36 = distinct !{!36, !32, !"air-alias-scope-arg(4)"}
!37 = distinct !{!37, !32, !"air-alias-scope-arg(5)"}
!38 = distinct !{!38, !32, !"air-alias-scope-arg(6)"}
!39 = !{!26, !27, i64 28}
!40 = !{!26, !27, i64 0}
!41 = !{!26, !27, i64 4}
!42 = !{!26, !27, i64 8}
!43 = !{!26, !27, i64 12}
!44 = !{!26, !27, i64 16}
!45 = !{!26, !27, i64 20}
!46 = !{!47, !47, i64 0}
!47 = !{!"half", !28, i64 0}
!48 = !{!34}
!49 = !{!31, !35, !36, !37, !38}
!50 = !{!28, !28, i64 0}
!51 = !{!35}
!52 = !{!31, !34, !36, !37, !38}
!53 = !{!36}
!54 = !{!31, !34, !35, !37, !38}
!55 = !{!37}
!56 = !{!31, !34, !35, !36, !38}
!57 = !{!38}
!58 = !{!31, !34, !35, !36, !37}

