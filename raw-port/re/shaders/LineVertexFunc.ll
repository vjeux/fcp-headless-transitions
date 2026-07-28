0x0000000000abf6 -- LineVertexFunc:
source_filename = "LineVertexFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.MDPAliasedLineUniforms = type <{ %"struct.metal::matrix.14", i32, float, [8 x i8] }>
%"struct.metal::matrix.14" = type { [4 x <4 x float>] }
%struct.MDPAliasedLineVertex = type { <3 x float>, <4 x float>, float, [12 x i8] }

; Function Attrs: argmemonly mustprogress nofree norecurse nosync nounwind readonly willreturn
define <{ <4 x float>, <4 x float> }> @LineVertexFunc(%struct.MDPAliasedLineUniforms addrspace(2)* nocapture noundef readonly align 16 dereferenceable(72) "air-buffer-no-alias" %0, %struct.MDPAliasedLineVertex addrspace(1)* nocapture noundef readonly "air-buffer-no-alias" %1, i32 noundef %2) local_unnamed_addr #0 !dbg !39 {
  %4 = zext i32 %2 to i64, !dbg !42
  %5 = getelementptr inbounds %struct.MDPAliasedLineVertex, %struct.MDPAliasedLineVertex addrspace(1)* %1, i64 %4, i32 0, !dbg !43
  %6 = load <3 x float>, <3 x float> addrspace(1)* %5, align 16, !dbg !43, !tbaa !44, !alias.scope !47, !noalias !50
  %7 = getelementptr inbounds %struct.MDPAliasedLineUniforms, %struct.MDPAliasedLineUniforms addrspace(2)* %0, i64 0, i32 0, i32 0, i64 0, !dbg !52
  %8 = load <4 x float>, <4 x float> addrspace(2)* %7, align 16, !dbg !60, !tbaa !44, !alias.scope !50, !noalias !47
  %9 = shufflevector <3 x float> %6, <3 x float> undef, <4 x i32> zeroinitializer, !dbg !61
  %10 = fmul fast <4 x float> %8, %9, !dbg !62
  %11 = getelementptr inbounds %struct.MDPAliasedLineUniforms, %struct.MDPAliasedLineUniforms addrspace(2)* %0, i64 0, i32 0, i32 0, i64 1, !dbg !63
  %12 = load <4 x float>, <4 x float> addrspace(2)* %11, align 16, !dbg !67, !tbaa !44, !alias.scope !50, !noalias !47
  %13 = shufflevector <3 x float> %6, <3 x float> undef, <4 x i32> <i32 1, i32 1, i32 1, i32 1>, !dbg !68
  %14 = fmul fast <4 x float> %12, %13, !dbg !69
  %15 = fadd fast <4 x float> %14, %10, !dbg !70
  %16 = getelementptr inbounds %struct.MDPAliasedLineUniforms, %struct.MDPAliasedLineUniforms addrspace(2)* %0, i64 0, i32 0, i32 0, i64 2, !dbg !71
  %17 = load <4 x float>, <4 x float> addrspace(2)* %16, align 16, !dbg !75, !tbaa !44, !alias.scope !50, !noalias !47
  %18 = shufflevector <3 x float> %6, <3 x float> undef, <4 x i32> <i32 2, i32 2, i32 2, i32 2>, !dbg !76
  %19 = fmul fast <4 x float> %17, %18, !dbg !77
  %20 = fadd fast <4 x float> %15, %19, !dbg !78
  %21 = getelementptr inbounds %struct.MDPAliasedLineUniforms, %struct.MDPAliasedLineUniforms addrspace(2)* %0, i64 0, i32 0, i32 0, i64 3, !dbg !79
  %22 = load <4 x float>, <4 x float> addrspace(2)* %21, align 16, !dbg !83, !tbaa !44, !alias.scope !50, !noalias !47
  %23 = fadd fast <4 x float> %20, %22, !dbg !84
  %24 = getelementptr inbounds %struct.MDPAliasedLineVertex, %struct.MDPAliasedLineVertex addrspace(1)* %1, i64 %4, i32 1, !dbg !85
  %25 = load <4 x float>, <4 x float> addrspace(1)* %24, align 16, !dbg !85, !tbaa !44, !alias.scope !47, !noalias !50
  %26 = insertvalue <{ <4 x float>, <4 x float> }> undef, <4 x float> %23, 0, !dbg !86
  %27 = insertvalue <{ <4 x float>, <4 x float> }> %26, <4 x float> %25, 1, !dbg !86
  ret <{ <4 x float>, <4 x float> }> %27, !dbg !86
}

attributes #0 = { argmemonly mustprogress nofree norecurse nosync nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }

!llvm.dbg.cu = !{!0}
!llvm.module.flags = !{!12, !13, !14, !15, !16, !17, !18, !19, !20, !21, !22}
!llvm.ident = !{!23}
!air.version = !{!24}
!air.language_version = !{!25}
!air.compile_options = !{!26, !27, !28}
!air.vertex = !{!29}

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
!29 = !{<{ <4 x float>, <4 x float> }> (%struct.MDPAliasedLineUniforms addrspace(2)*, %struct.MDPAliasedLineVertex addrspace(1)*, i32)* @LineVertexFunc, !30, !33}
!30 = !{!31, !32}
!31 = !{!"air.position", !"air.arg_type_name", !"float4", !"air.arg_name", !"position"}
!32 = !{!"air.vertex_output", !"generated(5colorDv4_f)", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!33 = !{!34, !36, !38}
!34 = !{i32 0, !"air.buffer", !"air.buffer_size", i32 80, !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !35, !"air.arg_type_size", i32 80, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"MDPAliasedLineUniforms", !"air.arg_name", !"uniforms"}
!35 = !{i32 0, i32 64, i32 0, !"float4x4", !"mvp", i32 64, i32 4, i32 0, !"uint", !"stipplePattern", i32 68, i32 4, i32 0, !"float", !"stippleScale"}
!36 = !{i32 1, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read", !"air.address_space", i32 1, !"air.struct_type_info", !37, !"air.arg_type_size", i32 48, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"MDPAliasedLineVertex", !"air.arg_name", !"verts"}
!37 = !{i32 0, i32 16, i32 0, !"float3", !"position", i32 16, i32 16, i32 0, !"float4", !"color", i32 32, i32 4, i32 0, !"float", !"stipplePos"}
!38 = !{i32 2, !"air.vertex_id", !"air.arg_type_name", !"uint", !"air.arg_name", !"vert"}
!39 = distinct !DISubprogram(name: "LineVertexFunc", scope: !8, file: !8, line: 44, type: !40, scopeLine: 47, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !41)
!40 = !DISubroutineType(types: !41)
!41 = !{}
!42 = !DILocation(line: 49, column: 25, scope: !39)
!43 = !DILocation(line: 49, column: 37, scope: !39)
!44 = !{!45, !45, i64 0}
!45 = !{!"omnipotent char", !46, i64 0}
!46 = !{!"Simple C++ TBAA"}
!47 = !{!48}
!48 = distinct !{!48, !49, !"air-alias-scope-arg(1)"}
!49 = distinct !{!49, !"air-alias-scopes(LineVertexFunc)"}
!50 = !{!51}
!51 = distinct !{!51, !49, !"air-alias-scope-arg(0)"}
!52 = !DILocation(line: 689, column: 12, scope: !53, inlinedAt: !55)
!53 = distinct !DISubprogram(name: "operator[]", scope: !54, file: !54, line: 687, type: !40, scopeLine: 688, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !41)
!54 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_matrix", directory: "")
!55 = distinct !DILocation(line: 2672, column: 44, scope: !56, inlinedAt: !57)
!56 = distinct !DISubprogram(name: "_matrix_vector_product_impl<float, 4, 4, 0, 1, 2, 3>", scope: !54, file: !54, line: 2670, type: !40, scopeLine: 2671, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !41)
!57 = distinct !DILocation(line: 2500, column: 10, scope: !58, inlinedAt: !59)
!58 = distinct !DISubprogram(name: "operator*<float, 4, 4>", scope: !54, file: !54, line: 2498, type: !40, scopeLine: 2499, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !41)
!59 = distinct !DILocation(line: 50, column: 33, scope: !39)
!60 = !DILocation(line: 2672, column: 44, scope: !56, inlinedAt: !57)
!61 = !DILocation(line: 2672, column: 66, scope: !56, inlinedAt: !57)
!62 = !DILocation(line: 2672, column: 64, scope: !56, inlinedAt: !57)
!63 = !DILocation(line: 689, column: 12, scope: !53, inlinedAt: !64)
!64 = distinct !DILocation(line: 2672, column: 44, scope: !65, inlinedAt: !66)
!65 = distinct !DISubprogram(name: "_matrix_vector_product_impl<float, 4, 4, 0, 1, 2>", scope: !54, file: !54, line: 2670, type: !40, scopeLine: 2671, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !41)
!66 = distinct !DILocation(line: 2672, column: 10, scope: !56, inlinedAt: !57)
!67 = !DILocation(line: 2672, column: 44, scope: !65, inlinedAt: !66)
!68 = !DILocation(line: 2672, column: 66, scope: !65, inlinedAt: !66)
!69 = !DILocation(line: 2672, column: 64, scope: !65, inlinedAt: !66)
!70 = !DILocation(line: 2672, column: 42, scope: !65, inlinedAt: !66)
!71 = !DILocation(line: 689, column: 12, scope: !53, inlinedAt: !72)
!72 = distinct !DILocation(line: 2672, column: 44, scope: !73, inlinedAt: !74)
!73 = distinct !DISubprogram(name: "_matrix_vector_product_impl<float, 4, 4, 0, 1>", scope: !54, file: !54, line: 2670, type: !40, scopeLine: 2671, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !41)
!74 = distinct !DILocation(line: 2672, column: 10, scope: !65, inlinedAt: !66)
!75 = !DILocation(line: 2672, column: 44, scope: !73, inlinedAt: !74)
!76 = !DILocation(line: 2672, column: 66, scope: !73, inlinedAt: !74)
!77 = !DILocation(line: 2672, column: 64, scope: !73, inlinedAt: !74)
!78 = !DILocation(line: 2672, column: 42, scope: !73, inlinedAt: !74)
!79 = !DILocation(line: 689, column: 12, scope: !53, inlinedAt: !80)
!80 = distinct !DILocation(line: 2677, column: 16, scope: !81, inlinedAt: !82)
!81 = distinct !DISubprogram(name: "_matrix_vector_product_impl<float, 4, 4>", scope: !54, file: !54, line: 2675, type: !40, scopeLine: 2676, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !41)
!82 = distinct !DILocation(line: 2672, column: 10, scope: !73, inlinedAt: !74)
!83 = !DILocation(line: 2677, column: 16, scope: !81, inlinedAt: !82)
!84 = !DILocation(line: 2677, column: 14, scope: !81, inlinedAt: !82)
!85 = !DILocation(line: 51, column: 29, scope: !39)
!86 = !DILocation(line: 53, column: 1, scope: !39)

