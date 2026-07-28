0x00000000010056 -- StippledLineFragmentFunc:
source_filename = "StippledLineFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.MDPAliasedLineUniforms = type <{ %"struct.metal::matrix.14", i32, float, [8 x i8] }>
%"struct.metal::matrix.14" = type { [4 x <4 x float>] }

; Function Attrs: mustprogress nounwind willreturn
define <{ <4 x float> }> @StippledLineFragmentFunc(<4 x float> %0, <4 x float> %1, float %2, %struct.MDPAliasedLineUniforms addrspace(2)* nocapture noundef readonly align 16 dereferenceable(72) "air-buffer-no-alias" %3) local_unnamed_addr #0 !dbg !38 {
  %5 = getelementptr inbounds %struct.MDPAliasedLineUniforms, %struct.MDPAliasedLineUniforms addrspace(2)* %3, i64 0, i32 1, !dbg !41
  %6 = load i32, i32 addrspace(2)* %5, align 16, !dbg !41, !tbaa !42, !alias.scope !49
  %7 = getelementptr inbounds %struct.MDPAliasedLineUniforms, %struct.MDPAliasedLineUniforms addrspace(2)* %3, i64 0, i32 2, !dbg !52
  %8 = load float, float addrspace(2)* %7, align 4, !dbg !52, !tbaa !53, !alias.scope !49
  %9 = fdiv fast float %2, %8, !dbg !54
  %10 = tail call i32 @air.convert.s.i32.f.f32(float %9) #3, !dbg !57
  %11 = and i32 %10, 31, !dbg !58
  %12 = shl nuw i32 1, %11, !dbg !58
  %13 = and i32 %12, %6, !dbg !59
  %14 = icmp eq i32 %13, 0, !dbg !60
  br i1 %14, label %15, label %16, !dbg !61

15:                                               ; preds = %4
  tail call void @air.discard_fragment() #4, !dbg !62
  br label %16, !dbg !66

16:                                               ; preds = %15, %4
  %17 = insertvalue <{ <4 x float> }> undef, <4 x float> %1, 0, !dbg !67
  ret <{ <4 x float> }> %17, !dbg !67
}

; Function Attrs: mustprogress nounwind willreturn
declare void @air.discard_fragment() local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare i32 @air.convert.s.i32.f.f32(float) local_unnamed_addr #2

attributes #0 = { mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nounwind willreturn }
attributes #2 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #3 = { nounwind readnone willreturn }
attributes #4 = { nounwind willreturn }

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
!29 = !{<{ <4 x float> }> (<4 x float>, <4 x float>, float, %struct.MDPAliasedLineUniforms addrspace(2)*)* @StippledLineFragmentFunc, !30, !32}
!30 = !{!31}
!31 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!32 = !{!33, !34, !35, !36}
!33 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!34 = !{i32 1, !"air.fragment_input", !"generated(5colorDv4_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!35 = !{i32 2, !"air.fragment_input", !"generated(10stipplePosf)", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float", !"air.arg_name", !"stipplePos"}
!36 = !{i32 3, !"air.buffer", !"air.buffer_size", i32 80, !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !37, !"air.arg_type_size", i32 80, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"MDPAliasedLineUniforms", !"air.arg_name", !"uniforms"}
!37 = !{i32 0, i32 64, i32 0, !"float4x4", !"mvp", i32 64, i32 4, i32 0, !"uint", !"stipplePattern", i32 68, i32 4, i32 0, !"float", !"stippleScale"}
!38 = distinct !DISubprogram(name: "StippledLineFragmentFunc", scope: !8, file: !8, line: 76, type: !39, scopeLine: 78, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!39 = !DISubroutineType(types: !40)
!40 = !{}
!41 = !DILocation(line: 79, column: 48, scope: !38)
!42 = !{!43, !47, i64 64}
!43 = !{!"_ZTS22MDPAliasedLineUniforms", !44, i64 0, !47, i64 64, !48, i64 68}
!44 = !{!"_ZTSN5metal6matrixIfLi4ELi4EvEE", !45, i64 0}
!45 = !{!"omnipotent char", !46, i64 0}
!46 = !{!"Simple C++ TBAA"}
!47 = !{!"int", !45, i64 0}
!48 = !{!"float", !45, i64 0}
!49 = !{!50}
!50 = distinct !{!50, !51, !"air-alias-scope-arg(3)"}
!51 = distinct !{!51, !"air-alias-scopes(StippledLineFragmentFunc)"}
!52 = !DILocation(line: 79, column: 73, scope: !38)
!53 = !{!43, !48, i64 68}
!54 = !DILocation(line: 37, column: 43, scope: !55, inlinedAt: !56)
!55 = distinct !DISubprogram(name: "calcStipple", scope: !8, file: !8, line: 35, type: !39, scopeLine: 36, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagLocalToUnit | DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!56 = distinct !DILocation(line: 79, column: 10, scope: !38)
!57 = !DILocation(line: 37, column: 32, scope: !55, inlinedAt: !56)
!58 = !DILocation(line: 38, column: 38, scope: !55, inlinedAt: !56)
!59 = !DILocation(line: 38, column: 32, scope: !55, inlinedAt: !56)
!60 = !DILocation(line: 38, column: 50, scope: !55, inlinedAt: !56)
!61 = !DILocation(line: 79, column: 9, scope: !38)
!62 = !DILocation(line: 184, column: 3, scope: !63, inlinedAt: !65)
!63 = distinct !DISubprogram(name: "discard_fragment", scope: !64, file: !64, line: 182, type: !39, scopeLine: 183, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!64 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_graphics", directory: "")
!65 = distinct !DILocation(line: 81, column: 9, scope: !38)
!66 = !DILocation(line: 82, column: 5, scope: !38)
!67 = !DILocation(line: 86, column: 5, scope: !38)

