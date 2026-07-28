0x00000000017926 -- AALineFragmentFunc:
source_filename = "AALineFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.MDPAALineUniforms = type { %"struct.metal::matrix.14", <2 x float>, i32, float }
%"struct.metal::matrix.14" = type { [4 x <4 x float>] }
%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
define <{ <4 x float> }> @AALineFragmentFunc(<4 x float> %0, <4 x float> %1, <2 x float> %2, %struct.MDPAALineUniforms addrspace(2)* nocapture noundef readonly align 16 dereferenceable(80) "air-buffer-no-alias" %3, %struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %5) local_unnamed_addr #0 !dbg !40 {
  %7 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %4, %struct._sampler_t addrspace(2)* nocapture readonly %5, <2 x float> %2, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #3, !dbg !43, !alias.scope !47, !noalias !51
  %8 = extractvalue { <4 x float>, i8 } %7, 0, !dbg !43
  %9 = fmul fast <4 x float> %8, %1, !dbg !53
  %10 = shufflevector <4 x float> %9, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>, !dbg !54
  %11 = extractelement <4 x float> %9, i64 3, !dbg !57
  %12 = tail call fast float @air.fast_fmax.f32(float %11, float 0x3EB0C6F7A0000000) #4, !dbg !58
  %13 = insertelement <3 x float> poison, float %12, i64 0, !dbg !62
  %14 = shufflevector <3 x float> %13, <3 x float> poison, <3 x i32> zeroinitializer, !dbg !62
  %15 = fdiv fast <3 x float> %10, %14, !dbg !63
  %16 = getelementptr inbounds %struct.MDPAALineUniforms, %struct.MDPAALineUniforms addrspace(2)* %3, i64 0, i32 1, !dbg !64
  %17 = load <2 x float>, <2 x float> addrspace(2)* %16, align 16, !dbg !65, !alias.scope !51, !noalias !47
  %18 = extractelement <2 x float> %17, i64 1, !dbg !65
  %19 = extractelement <3 x float> %15, i64 0, !dbg !66
  %20 = tail call fast float @air.fast_pow.f32(float %19, float %18) #4, !dbg !69
  %21 = insertelement <3 x float> undef, float %20, i64 0
  %22 = extractelement <3 x float> %15, i64 1, !dbg !72
  %23 = tail call fast float @air.fast_pow.f32(float %22, float %18) #4, !dbg !73
  %24 = insertelement <3 x float> %21, float %23, i64 1
  %25 = extractelement <3 x float> %15, i64 2, !dbg !75
  %26 = tail call fast float @air.fast_pow.f32(float %25, float %18) #4, !dbg !76
  %27 = insertelement <3 x float> %24, float %26, i64 2
  %28 = shufflevector <4 x float> %9, <4 x float> poison, <3 x i32> <i32 3, i32 3, i32 3>, !dbg !78
  %29 = fmul fast <3 x float> %27, %28, !dbg !81
  %30 = shufflevector <3 x float> %29, <3 x float> poison, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>, !dbg !81
  %31 = shufflevector <4 x float> %30, <4 x float> %9, <4 x i32> <i32 0, i32 1, i32 2, i32 7>, !dbg !81
  %32 = insertvalue <{ <4 x float> }> undef, <4 x float> %31, 0, !dbg !82
  ret <{ <4 x float> }> %32, !dbg !82
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_pow.f32(float, float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmax.f32(float, float) local_unnamed_addr #1

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #2

attributes #0 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #3 = { argmemonly convergent nounwind readonly willreturn }
attributes #4 = { nounwind readnone willreturn }

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
!29 = !{<{ <4 x float> }> (<4 x float>, <4 x float>, <2 x float>, %struct.MDPAALineUniforms addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._sampler_t addrspace(2)*)* @AALineFragmentFunc, !30, !32}
!30 = !{!31}
!31 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!32 = !{!33, !34, !35, !36, !38, !39}
!33 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!34 = !{i32 1, !"air.fragment_input", !"generated(5colorDv4_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!35 = !{i32 2, !"air.fragment_input", !"generated(13brushTexCoordDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"brushTexCoord"}
!36 = !{i32 3, !"air.buffer", !"air.buffer_size", i32 80, !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !37, !"air.arg_type_size", i32 80, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"MDPAALineUniforms", !"air.arg_name", !"uniforms"}
!37 = !{i32 0, i32 64, i32 0, !"float4x4", !"mvp", i32 64, i32 8, i32 0, !"float2", !"gamma", i32 72, i32 4, i32 0, !"uint", !"stipplePattern", i32 76, i32 4, i32 0, !"float", !"stippleScale"}
!38 = !{i32 4, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"brush"}
!39 = !{i32 5, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"brushSampler"}
!40 = distinct !DISubprogram(name: "AALineFragmentFunc", scope: !8, file: !8, line: 108, type: !41, scopeLine: 112, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !42)
!41 = !DISubroutineType(types: !42)
!42 = !{}
!43 = !DILocation(line: 47, column: 12, scope: !44, inlinedAt: !46)
!44 = distinct !DISubprogram(name: "sample", scope: !45, file: !45, line: 44, type: !41, scopeLine: 45, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !42)
!45 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/__bits/metal_texture2d", directory: "")
!46 = distinct !DILocation(line: 113, column: 29, scope: !40)
!47 = !{!48, !50}
!48 = distinct !{!48, !49, !"air-alias-scope-textures"}
!49 = distinct !{!49, !"air-alias-scopes(AALineFragmentFunc)"}
!50 = distinct !{!50, !49, !"air-alias-scope-samplers"}
!51 = !{!52}
!52 = distinct !{!52, !49, !"air-alias-scope-arg(3)"}
!53 = !DILocation(line: 113, column: 74, scope: !40)
!54 = !DILocation(line: 54, column: 21, scope: !55, inlinedAt: !56)
!55 = distinct !DISubprogram(name: "unpremultiply", scope: !8, file: !8, line: 52, type: !41, scopeLine: 53, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagLocalToUnit | DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !42)
!56 = distinct !DILocation(line: 114, column: 9, scope: !40)
!57 = !DILocation(line: 54, column: 37, scope: !55, inlinedAt: !56)
!58 = !DILocation(line: 4751, column: 10, scope: !59, inlinedAt: !61)
!59 = distinct !DISubprogram(name: "max", scope: !60, file: !60, line: 4749, type: !41, scopeLine: 4750, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !42)
!60 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_math", directory: "")
!61 = distinct !DILocation(line: 54, column: 33, scope: !55, inlinedAt: !56)
!62 = !DILocation(line: 54, column: 33, scope: !55, inlinedAt: !56)
!63 = !DILocation(line: 54, column: 31, scope: !55, inlinedAt: !56)
!64 = !DILocation(line: 115, column: 32, scope: !40)
!65 = !DILocation(line: 115, column: 23, scope: !40)
!66 = !DILocation(line: 60, column: 27, scope: !67, inlinedAt: !68)
!67 = distinct !DISubprogram(name: "applyGamma", scope: !8, file: !8, line: 58, type: !41, scopeLine: 59, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagLocalToUnit | DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !42)
!68 = distinct !DILocation(line: 115, column: 9, scope: !40)
!69 = !DILocation(line: 4789, column: 10, scope: !70, inlinedAt: !71)
!70 = distinct !DISubprogram(name: "pow", scope: !60, file: !60, line: 4787, type: !41, scopeLine: 4788, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !42)
!71 = distinct !DILocation(line: 60, column: 23, scope: !67, inlinedAt: !68)
!72 = !DILocation(line: 61, column: 27, scope: !67, inlinedAt: !68)
!73 = !DILocation(line: 4789, column: 10, scope: !70, inlinedAt: !74)
!74 = distinct !DILocation(line: 61, column: 23, scope: !67, inlinedAt: !68)
!75 = !DILocation(line: 62, column: 27, scope: !67, inlinedAt: !68)
!76 = !DILocation(line: 4789, column: 10, scope: !70, inlinedAt: !77)
!77 = distinct !DILocation(line: 62, column: 23, scope: !67, inlinedAt: !68)
!78 = !DILocation(line: 48, column: 22, scope: !79, inlinedAt: !80)
!79 = distinct !DISubprogram(name: "premultiply", scope: !8, file: !8, line: 46, type: !41, scopeLine: 47, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagLocalToUnit | DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !42)
!80 = distinct !DILocation(line: 118, column: 17, scope: !40)
!81 = !DILocation(line: 48, column: 19, scope: !79, inlinedAt: !80)
!82 = !DILocation(line: 120, column: 1, scope: !40)

