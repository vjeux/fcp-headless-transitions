0x0000000000e8e6 -- LineFragmentFunc:
source_filename = "LineFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

; Function Attrs: mustprogress nofree norecurse nosync nounwind readnone willreturn
define <{ <4 x float> }> @LineFragmentFunc(<4 x float> %0, <4 x float> %1) local_unnamed_addr #0 !dbg !35 {
  %3 = insertvalue <{ <4 x float> }> undef, <4 x float> %1, 0, !dbg !38
  ret <{ <4 x float> }> %3, !dbg !38
}

attributes #0 = { mustprogress nofree norecurse nosync nounwind readnone willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }

!llvm.dbg.cu = !{!0}
!llvm.module.flags = !{!12, !13, !14, !15, !16, !17, !18, !19, !20, !21, !22}
!llvm.ident = !{!23}
!air.version = !{!24}
!air.language_version = !{!25}
!air.compile_options = !{!26, !27, !28}
!air.fragment = !{!29}

!0 = distinct !DICompileUnit(language: DW_LANG_Metal, file: !1, producer: "Apple metal version 32023.883 (metalfe-32023.883)", isOptimized: true, flags: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/bin/metal --driver-mode=metal -c --target=air64-apple-macos15.6 -gline-tables-only -frecord-sources=yes -I /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts/include -F/Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts -isysroot /AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk -fmetal-math-mode=fast -fmetal-math-fp32-functions=fast -serialize-diagnostics /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPLine-d948a4f238c236a3b484a143b0b28cda.dia -o /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPLine-d948a4f238c236a3b484a143b0b28cda.air -MMD -MT dependencies -MF /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPLine-d948a4f238c236a3b484a143b0b28cda.dat /Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPLine.metal -Wno-reorder-init-list -Wno-implicit-int-float-conversion -Wno-c99-designator -Wno-final-dtor-non-final-class -Wno-extra-semi-stmt -Wno-misleading-indentation -Wno-quoted-include-in-framework-header -Wno-implicit-fallthrough -Wno-enum-enum-conversion -Wno-enum-float-conversion -Wno-elaborated-enum-base -Wno-reserved-identifier -Wno-gnu-folding-constant -Wno-objc-load-method -Xclang -clang-vendor-feature=+disableNonDependentMemberExprInCurrentInstantiation -mllvm -disable-aligned-alloc-awareness=1 -Xclang -fno-odr-hash-protocols -Xclang -clang-vendor-feature=+enableAggressiveVLAFolding -Xclang -clang-vendor-feature=+revert09abecef7bbf -Xclang -clang-vendor-feature=+thisNoAlignAttr -Xclang -clang-vendor-feature=+thisNoNullAttr -mlinker-version=1266.8", runtimeVersion: 0, emissionKind: LineTablesOnly, imports: !2, splitDebugInlining: false, nameTableKind: None, sysroot: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk", sdk: "MacOSX26.4.sdk")
!1 = !DIFile(filename: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPLine.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!2 = !{!3, !6, !9}
!3 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !4, file: !5, line: 1)
!4 = !DIModule(scope: null, name: "metal_types", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!5 = !DIFile(filename: "<built-in>", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!6 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !7, file: !8, line: 8)
!7 = !DIModule(scope: null, name: "metal_stdlib", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!8 = !DIFile(filename: "MDPKit/Shaders/MDPLine.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
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
!29 = !{<{ <4 x float> }> (<4 x float>, <4 x float>)* @LineFragmentFunc, !30, !32}
!30 = !{!31}
!31 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!32 = !{!33, !34}
!33 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!34 = !{i32 1, !"air.fragment_input", !"generated(5colorDv4_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!35 = distinct !DISubprogram(name: "LineFragmentFunc", scope: !8, file: !8, line: 55, type: !36, scopeLine: 56, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !37)
!36 = !DISubroutineType(types: !37)
!37 = !{}
!38 = !DILocation(line: 59, column: 5, scope: !35)

