0x000000000198b6 -- AAStippledLineFragmentFunc:
source_filename = "AAStippledLineFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.MDPAALineUniforms = type { %"struct.metal::matrix.14", <2 x float>, i32, float }
%"struct.metal::matrix.14" = type { [4 x <4 x float>] }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

; Function Attrs: convergent mustprogress nounwind willreturn
define <{ <4 x float> }> @AAStippledLineFragmentFunc(<4 x float> %0, <4 x float> %1, <2 x float> %2, float %3, %struct.MDPAALineUniforms addrspace(2)* nocapture noundef readonly align 16 dereferenceable(80) "air-buffer-no-alias" %4, %struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %6) local_unnamed_addr #0 !dbg !41 {
  %8 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %6, <2 x float> %2, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #4, !dbg !44, !alias.scope !48, !noalias !52
  %9 = getelementptr inbounds %struct.MDPAALineUniforms, %struct.MDPAALineUniforms addrspace(2)* %4, i64 0, i32 1, !dbg !54
  %10 = load <2 x float>, <2 x float> addrspace(2)* %9, align 16, !dbg !55, !alias.scope !52, !noalias !48
  %11 = getelementptr inbounds %struct.MDPAALineUniforms, %struct.MDPAALineUniforms addrspace(2)* %4, i64 0, i32 2, !dbg !56
  %12 = load i32, i32 addrspace(2)* %11, align 8, !dbg !56, !tbaa !57, !alias.scope !52, !noalias !48
  %13 = getelementptr inbounds %struct.MDPAALineUniforms, %struct.MDPAALineUniforms addrspace(2)* %4, i64 0, i32 3, !dbg !64
  %14 = load float, float addrspace(2)* %13, align 4, !dbg !64, !tbaa !65, !alias.scope !52, !noalias !48
  %15 = icmp eq i32 %12, -1, !dbg !66
  br i1 %15, label %45, label %16, !dbg !69

16:                                               ; preds = %7
  %17 = tail call fast float @air.fwidth.f32(float %3) #5, !dbg !70
  %18 = fmul fast float %17, 5.000000e-01, !dbg !74
  %19 = fsub fast float %3, %18, !dbg !75
  %20 = fadd fast float %19, %17, !dbg !76
  %21 = fdiv fast float %19, %14, !dbg !77
  %22 = tail call i32 @air.convert.s.i32.f.f32(float %21) #6, !dbg !78
  %23 = fdiv fast float %20, %14, !dbg !79
  %24 = tail call i32 @air.convert.s.i32.f.f32(float %23) #6, !dbg !80
  %25 = and i32 %22, 31, !dbg !81
  %26 = shl nuw i32 1, %25, !dbg !81
  %27 = and i32 %26, %12, !dbg !82
  %28 = icmp ne i32 %27, 0, !dbg !83
  %29 = fcmp fast ogt float %14, 1.000000e+00, !dbg !84
  br i1 %29, label %30, label %43, !dbg !85

30:                                               ; preds = %16
  %31 = and i32 %24, 31, !dbg !86
  %32 = shl nuw i32 1, %31, !dbg !87
  %33 = and i32 %32, %12, !dbg !87
  %34 = icmp eq i32 %33, 0, !dbg !87
  %35 = xor i1 %28, %34, !dbg !87
  br i1 %35, label %43, label %36, !dbg !88

36:                                               ; preds = %30
  %37 = tail call fast float @air.convert.f.f32.s.i32(i32 %24) #6, !dbg !89
  %38 = fmul fast float %37, %14, !dbg !90
  %39 = fsub fast float %38, %19, !dbg !91
  %40 = fsub fast float %20, %38, !dbg !92
  %41 = select fast i1 %28, float %39, float %40, !dbg !93
  %42 = fdiv fast float %41, %17, !dbg !94
  br label %45

43:                                               ; preds = %30, %16
  %44 = select fast i1 %28, float 1.000000e+00, float 0.000000e+00, !dbg !95
  br label %45, !dbg !96

45:                                               ; preds = %43, %36, %7
  %46 = phi float [ 1.000000e+00, %7 ], [ %42, %36 ], [ %44, %43 ], !dbg !97
  %47 = extractvalue { <4 x float>, i8 } %8, 0, !dbg !44
  %48 = fmul fast <4 x float> %47, %1, !dbg !98
  %49 = shufflevector <4 x float> %48, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>, !dbg !99
  %50 = extractelement <4 x float> %48, i64 3, !dbg !102
  %51 = tail call fast float @air.fast_fmax.f32(float %50, float 0x3EB0C6F7A0000000) #6, !dbg !103
  %52 = insertelement <3 x float> poison, float %51, i64 0, !dbg !107
  %53 = shufflevector <3 x float> %52, <3 x float> poison, <3 x i32> zeroinitializer, !dbg !107
  %54 = fdiv fast <3 x float> %49, %53, !dbg !108
  %55 = extractelement <3 x float> %54, i64 0, !dbg !109
  %56 = extractelement <2 x float> %10, i64 1, !dbg !55
  %57 = tail call fast float @air.fast_pow.f32(float %55, float %56) #6, !dbg !112
  %58 = insertelement <3 x float> undef, float %57, i64 0
  %59 = extractelement <3 x float> %54, i64 1, !dbg !115
  %60 = tail call fast float @air.fast_pow.f32(float %59, float %56) #6, !dbg !116
  %61 = insertelement <3 x float> %58, float %60, i64 1
  %62 = extractelement <3 x float> %54, i64 2, !dbg !118
  %63 = tail call fast float @air.fast_pow.f32(float %62, float %56) #6, !dbg !119
  %64 = insertelement <3 x float> %61, float %63, i64 2
  %65 = fmul fast float %46, %50, !dbg !121
  %66 = insertelement <3 x float> undef, float %65, i64 0, !dbg !122
  %67 = shufflevector <3 x float> %66, <3 x float> poison, <3 x i32> zeroinitializer, !dbg !122
  %68 = fmul fast <3 x float> %64, %67, !dbg !125
  %69 = shufflevector <3 x float> %68, <3 x float> poison, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>, !dbg !125
  %70 = insertelement <4 x float> %69, float %65, i64 3, !dbg !125
  %71 = insertvalue <{ <4 x float> }> undef, <4 x float> %70, 0, !dbg !126
  ret <{ <4 x float> }> %71, !dbg !126
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_pow.f32(float, float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmax.f32(float, float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.convert.f.f32.s.i32(i32) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare i32 @air.convert.s.i32.f.f32(float) local_unnamed_addr #1

; Function Attrs: convergent mustprogress nounwind willreturn
declare float @air.fwidth.f32(float) local_unnamed_addr #2

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #3

attributes #0 = { convergent mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { convergent mustprogress nounwind willreturn }
attributes #3 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #4 = { argmemonly convergent nounwind readonly willreturn }
attributes #5 = { convergent nounwind willreturn }
attributes #6 = { nounwind readnone willreturn }

!llvm.dbg.cu = !{!0}
!llvm.module.flags = !{!12, !13, !14, !15, !16, !17, !18, !19, !20, !21, !22}
!llvm.ident = !{!23}
!air.version = !{!24}
!air.language_version = !{!25}
!air.compile_options = !{!26, !27, !28}
!air.fragment = !{!29}

!0 = distinct !DICompileUnit(language: DW_LANG_Metal, file: !1, producer: "Apple metal version 32023.883 (metalfe-32023.883)", isOptimized: true, flags: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/bin/metal --driver-mode=metal -c --target=air64-apple-macos15.6 -gline-tables-only -frecord-sources=yes -I /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts/include -F/Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts -isysroot /AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk -fmetal-math-mode=fast -fmetal-math-fp32-functions=fast -serialize-diagnostics /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPAALine.dia -o /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPAALine.air -MMD -MT dependencies -MF /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPAALine.dat /Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPAALine.metal -Wno-reorder-init-list -Wno-implicit-int-float-conversion -Wno-c99-designator -Wno-final-dtor-non-final-class -Wno-extra-semi-stmt -Wno-misleading-indentation -Wno-quoted-include-in-framework-header -Wno-implicit-fallthrough -Wno-enum-enum-conversion -Wno-enum-float-conversion -Wno-elaborated-enum-base -Wno-reserved-identifier -Wno-gnu-folding-constant -Wno-objc-load-method -Xclang -clang-vendor-feature=+disableNonDependentMemberExprInCurrentInstantiation -mllvm -disable-aligned-alloc-awareness=1 -Xclang -fno-odr-hash-protocols -Xclang -clang-vendor-feature=+enableAggressiveVLAFolding -Xclang -clang-vendor-feature=+revert09abecef7bbf -Xclang -clang-vendor-feature=+thisNoAlignAttr -Xclang -clang-vendor-feature=+thisNoNullAttr -mlinker-version=1266.8", runtimeVersion: 0, emissionKind: LineTablesOnly, imports: !2, splitDebugInlining: false, nameTableKind: None, sysroot: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk", sdk: "MacOSX26.4.sdk")
!1 = !DIFile(filename: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPAALine.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!2 = !{!3, !6, !9}
!3 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !4, file: !5, line: 1)
!4 = !DIModule(scope: null, name: "metal_types", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!5 = !DIFile(filename: "<built-in>", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!6 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !7, file: !8, line: 8)
!7 = !DIModule(scope: null, name: "metal_stdlib", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!8 = !DIFile(filename: "MDPKit/Shaders/MDPAALine.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!9 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !10, file: !11, line: 29)
!10 = !DIModule(scope: null, name: "metal_matrix", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!11 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/simd/matrix_types.h", directory: "")
!12 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!13 = !{i32 7, !"Dwarf Version", i32 4}
!14 = !{i32 2, !"Debug Info Version", i32 3}
!15 = !{i32 1, !"wchar_size", i32 4}
!16 = !{i32 7, !"frame-pointer", i32 2}
!17 = !{i32 7, !"air.max_device_buffers", i32 31}
!18 = !{i32 7, !"air.max_constant_buffers", i32 31}
!19 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!20 = !{i32 7, !"air.max_textures", i32 128}
!21 = !{i32 7, !"air.max_read_write_textures", i32 8}
!22 = !{i32 7, !"air.max_samplers", i32 16}
!23 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!24 = !{i32 2, i32 7, i32 0}
!25 = !{!"Metal", i32 3, i32 2, i32 0}
!26 = !{!"air.compile.denorms_disable"}
!27 = !{!"air.compile.fast_math_enable"}
!28 = !{!"air.compile.framebuffer_fetch_enable"}
!29 = !{<{ <4 x float> }> (<4 x float>, <4 x float>, <2 x float>, float, %struct.MDPAALineUniforms addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._sampler_t addrspace(2)*)* @AAStippledLineFragmentFunc, !30, !32}
!30 = !{!31}
!31 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!32 = !{!33, !34, !35, !36, !37, !39, !40}
!33 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!34 = !{i32 1, !"air.fragment_input", !"generated(5colorDv4_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!35 = !{i32 2, !"air.fragment_input", !"generated(13brushTexCoordDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"brushTexCoord"}
!36 = !{i32 3, !"air.fragment_input", !"generated(10stipplePosf)", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float", !"air.arg_name", !"stipplePos"}
!37 = !{i32 4, !"air.buffer", !"air.buffer_size", i32 80, !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !38, !"air.arg_type_size", i32 80, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"MDPAALineUniforms", !"air.arg_name", !"uniforms"}
!38 = !{i32 0, i32 64, i32 0, !"float4x4", !"mvp", i32 64, i32 8, i32 0, !"float2", !"gamma", i32 72, i32 4, i32 0, !"uint", !"stipplePattern", i32 76, i32 4, i32 0, !"float", !"stippleScale"}
!39 = !{i32 5, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"brush"}
!40 = !{i32 6, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"brushSampler"}
!41 = distinct !DISubprogram(name: "AAStippledLineFragmentFunc", scope: !8, file: !8, line: 137, type: !42, scopeLine: 141, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !43)
!42 = !DISubroutineType(types: !43)
!43 = !{}
!44 = !DILocation(line: 47, column: 12, scope: !45, inlinedAt: !47)
!45 = distinct !DISubprogram(name: "sample", scope: !46, file: !46, line: 44, type: !42, scopeLine: 45, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !43)
!46 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/__bits/metal_texture2d", directory: "")
!47 = distinct !DILocation(line: 142, column: 29, scope: !41)
!48 = !{!49, !51}
!49 = distinct !{!49, !50, !"air-alias-scope-textures"}
!50 = distinct !{!50, !"air-alias-scopes(AAStippledLineFragmentFunc)"}
!51 = distinct !{!51, !50, !"air-alias-scope-samplers"}
!52 = !{!53}
!53 = distinct !{!53, !50, !"air-alias-scope-arg(4)"}
!54 = !DILocation(line: 144, column: 32, scope: !41)
!55 = !DILocation(line: 144, column: 23, scope: !41)
!56 = !DILocation(line: 145, column: 50, scope: !41)
!57 = !{!58, !62, i64 72}
!58 = !{!"_ZTS17MDPAALineUniforms", !59, i64 0, !60, i64 64, !62, i64 72, !63, i64 76}
!59 = !{!"_ZTSN5metal6matrixIfLi4ELi4EvEE", !60, i64 0}
!60 = !{!"omnipotent char", !61, i64 0}
!61 = !{!"Simple C++ TBAA"}
!62 = !{!"int", !60, i64 0}
!63 = !{!"float", !60, i64 0}
!64 = !DILocation(line: 145, column: 75, scope: !41)
!65 = !{!58, !63, i64 76}
!66 = !DILocation(line: 68, column: 28, scope: !67, inlinedAt: !68)
!67 = distinct !DISubprogram(name: "calcStipple", scope: !8, file: !8, line: 66, type: !42, scopeLine: 67, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagLocalToUnit | DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !43)
!68 = distinct !DILocation(line: 145, column: 12, scope: !41)
!69 = !DILocation(line: 68, column: 13, scope: !67, inlinedAt: !68)
!70 = !DILocation(line: 101, column: 10, scope: !71, inlinedAt: !73)
!71 = distinct !DISubprogram(name: "fwidth", scope: !72, file: !72, line: 99, type: !42, scopeLine: 100, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !43)
!72 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_graphics", directory: "")
!73 = distinct !DILocation(line: 70, column: 25, scope: !67, inlinedAt: !68)
!74 = !DILocation(line: 71, column: 47, scope: !67, inlinedAt: !68)
!75 = !DILocation(line: 71, column: 43, scope: !67, inlinedAt: !68)
!76 = !DILocation(line: 72, column: 39, scope: !67, inlinedAt: !68)
!77 = !DILocation(line: 74, column: 46, scope: !67, inlinedAt: !68)
!78 = !DILocation(line: 74, column: 37, scope: !67, inlinedAt: !68)
!79 = !DILocation(line: 75, column: 42, scope: !67, inlinedAt: !68)
!80 = !DILocation(line: 75, column: 35, scope: !67, inlinedAt: !68)
!81 = !DILocation(line: 77, column: 46, scope: !67, inlinedAt: !68)
!82 = !DILocation(line: 77, column: 40, scope: !67, inlinedAt: !68)
!83 = !DILocation(line: 77, column: 63, scope: !67, inlinedAt: !68)
!84 = !DILocation(line: 80, column: 26, scope: !67, inlinedAt: !68)
!85 = !DILocation(line: 80, column: 32, scope: !67, inlinedAt: !68)
!86 = !DILocation(line: 78, column: 44, scope: !67, inlinedAt: !68)
!87 = !DILocation(line: 80, column: 43, scope: !67, inlinedAt: !68)
!88 = !DILocation(line: 80, column: 13, scope: !67, inlinedAt: !68)
!89 = !DILocation(line: 82, column: 30, scope: !67, inlinedAt: !68)
!90 = !DILocation(line: 82, column: 57, scope: !67, inlinedAt: !68)
!91 = !DILocation(line: 83, column: 40, scope: !67, inlinedAt: !68)
!92 = !DILocation(line: 84, column: 38, scope: !67, inlinedAt: !68)
!93 = !DILocation(line: 86, column: 21, scope: !67, inlinedAt: !68)
!94 = !DILocation(line: 86, column: 52, scope: !67, inlinedAt: !68)
!95 = !DILocation(line: 89, column: 16, scope: !67, inlinedAt: !68)
!96 = !DILocation(line: 89, column: 9, scope: !67, inlinedAt: !68)
!97 = !DILocation(line: 0, scope: !67, inlinedAt: !68)
!98 = !DILocation(line: 142, column: 74, scope: !41)
!99 = !DILocation(line: 54, column: 21, scope: !100, inlinedAt: !101)
!100 = distinct !DISubprogram(name: "unpremultiply", scope: !8, file: !8, line: 52, type: !42, scopeLine: 53, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagLocalToUnit | DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !43)
!101 = distinct !DILocation(line: 143, column: 9, scope: !41)
!102 = !DILocation(line: 54, column: 37, scope: !100, inlinedAt: !101)
!103 = !DILocation(line: 4751, column: 10, scope: !104, inlinedAt: !106)
!104 = distinct !DISubprogram(name: "max", scope: !105, file: !105, line: 4749, type: !42, scopeLine: 4750, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !43)
!105 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_math", directory: "")
!106 = distinct !DILocation(line: 54, column: 33, scope: !100, inlinedAt: !101)
!107 = !DILocation(line: 54, column: 33, scope: !100, inlinedAt: !101)
!108 = !DILocation(line: 54, column: 31, scope: !100, inlinedAt: !101)
!109 = !DILocation(line: 60, column: 27, scope: !110, inlinedAt: !111)
!110 = distinct !DISubprogram(name: "applyGamma", scope: !8, file: !8, line: 58, type: !42, scopeLine: 59, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagLocalToUnit | DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !43)
!111 = distinct !DILocation(line: 144, column: 9, scope: !41)
!112 = !DILocation(line: 4789, column: 10, scope: !113, inlinedAt: !114)
!113 = distinct !DISubprogram(name: "pow", scope: !105, file: !105, line: 4787, type: !42, scopeLine: 4788, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !43)
!114 = distinct !DILocation(line: 60, column: 23, scope: !110, inlinedAt: !111)
!115 = !DILocation(line: 61, column: 27, scope: !110, inlinedAt: !111)
!116 = !DILocation(line: 4789, column: 10, scope: !113, inlinedAt: !117)
!117 = distinct !DILocation(line: 61, column: 23, scope: !110, inlinedAt: !111)
!118 = !DILocation(line: 62, column: 27, scope: !110, inlinedAt: !111)
!119 = !DILocation(line: 4789, column: 10, scope: !113, inlinedAt: !120)
!120 = distinct !DILocation(line: 62, column: 23, scope: !110, inlinedAt: !111)
!121 = !DILocation(line: 145, column: 9, scope: !41)
!122 = !DILocation(line: 48, column: 22, scope: !123, inlinedAt: !124)
!123 = distinct !DISubprogram(name: "premultiply", scope: !8, file: !8, line: 46, type: !42, scopeLine: 47, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagLocalToUnit | DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !43)
!124 = distinct !DILocation(line: 148, column: 17, scope: !41)
!125 = !DILocation(line: 48, column: 19, scope: !123, inlinedAt: !124)
!126 = !DILocation(line: 150, column: 1, scope: !41)

