0x000000000305c6 -- HitIDFragmentFunc:
source_filename = "HitIDFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%"struct.metal::_atomic.25" = type { i32 }

; Function Attrs: mustprogress nounwind willreturn
define <{ i32 }> @HitIDFragmentFunc(<4 x float> %0, i32 %1, %struct._texture_2d_t addrspace(1)* %2, %"struct.metal::_atomic.25" addrspace(1)* nocapture noundef "air-buffer-no-alias" %3, i32 addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %4) local_unnamed_addr #0 !dbg !39 {
  %6 = icmp eq i32 %1, 0, !dbg !42
  br i1 %6, label %20, label %7, !dbg !43

7:                                                ; preds = %5
  %8 = getelementptr inbounds %"struct.metal::_atomic.25", %"struct.metal::_atomic.25" addrspace(1)* %3, i64 0, i32 0, !dbg !44
  %9 = tail call i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture %8, i32 1, i32 0, i32 2, i1 true) #4, !dbg !48
  %10 = load i32, i32 addrspace(2)* %4, align 4, !dbg !49, !tbaa !50, !alias.scope !54, !noalias !57
  %11 = icmp eq i32 %10, 0, !dbg !49
  br i1 %11, label %20, label %12, !dbg !49

12:                                               ; preds = %7
  %13 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %2, i32 0) #5, !dbg !60, !alias.scope !64, !noalias !65
  %14 = urem i32 %9, %13, !dbg !66
  %15 = insertelement <2 x i32> undef, i32 %14, i64 0, !dbg !67
  %16 = udiv i32 %9, %13, !dbg !68
  %17 = insertelement <2 x i32> %15, i32 %16, i64 1, !dbg !67
  %18 = insertelement <4 x i32> poison, i32 %1, i64 0, !dbg !69
  %19 = shufflevector <4 x i32> %18, <4 x i32> poison, <4 x i32> zeroinitializer, !dbg !69
  tail call void @air.write_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture %2, <2 x i32> %17, <4 x i32> %19, i32 0, i32 2) #6, !dbg !70, !alias.scope !64, !noalias !65
  br label %20, !dbg !73

20:                                               ; preds = %12, %7, %5
  %21 = insertvalue <{ i32 }> undef, i32 %1, 0, !dbg !74
  ret <{ i32 }> %21, !dbg !74
}

; Function Attrs: argmemonly mustprogress nounwind willreturn
declare void @air.write_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x i32>, i32, i32) local_unnamed_addr #1

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #2

; Function Attrs: mustprogress nounwind willreturn
declare i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture, i32, i32, i32, i1) local_unnamed_addr #3

attributes #0 = { mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly mustprogress nounwind willreturn }
attributes #2 = { argmemonly mustprogress nofree nounwind readonly willreturn }
attributes #3 = { mustprogress nounwind willreturn }
attributes #4 = { nounwind willreturn }
attributes #5 = { argmemonly nounwind readonly willreturn }
attributes #6 = { argmemonly nounwind willreturn }

!llvm.dbg.cu = !{!0}
!llvm.module.flags = !{!12, !13, !14, !15, !16, !17, !18, !19, !20, !21, !22}
!llvm.ident = !{!23}
!air.version = !{!24}
!air.language_version = !{!25}
!air.compile_options = !{!26, !27, !28}
!air.fragment = !{!29}

!0 = distinct !DICompileUnit(language: DW_LANG_Metal, file: !1, producer: "Apple metal version 32023.883 (metalfe-32023.883)", isOptimized: true, flags: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/bin/metal --driver-mode=metal -c --target=air64-apple-macos15.6 -gline-tables-only -frecord-sources=yes -I /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts/include -F/Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts -isysroot /AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk -fmetal-math-mode=fast -fmetal-math-fp32-functions=fast -serialize-diagnostics /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPHitID.dia -o /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPHitID.air -MMD -MT dependencies -MF /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPHitID.dat /Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPHitID.metal -Wno-reorder-init-list -Wno-implicit-int-float-conversion -Wno-c99-designator -Wno-final-dtor-non-final-class -Wno-extra-semi-stmt -Wno-misleading-indentation -Wno-quoted-include-in-framework-header -Wno-implicit-fallthrough -Wno-enum-enum-conversion -Wno-enum-float-conversion -Wno-elaborated-enum-base -Wno-reserved-identifier -Wno-gnu-folding-constant -Wno-objc-load-method -Xclang -clang-vendor-feature=+disableNonDependentMemberExprInCurrentInstantiation -mllvm -disable-aligned-alloc-awareness=1 -Xclang -fno-odr-hash-protocols -Xclang -clang-vendor-feature=+enableAggressiveVLAFolding -Xclang -clang-vendor-feature=+revert09abecef7bbf -Xclang -clang-vendor-feature=+thisNoAlignAttr -Xclang -clang-vendor-feature=+thisNoNullAttr -mlinker-version=1266.8", runtimeVersion: 0, emissionKind: LineTablesOnly, imports: !2, splitDebugInlining: false, nameTableKind: None, sysroot: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk", sdk: "MacOSX26.4.sdk")
!1 = !DIFile(filename: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPHitID.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!2 = !{!3, !6, !9}
!3 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !4, file: !5, line: 1)
!4 = !DIModule(scope: null, name: "metal_types", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!5 = !DIFile(filename: "<built-in>", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!6 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !7, file: !8, line: 8)
!7 = !DIModule(scope: null, name: "metal_stdlib", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!8 = !DIFile(filename: "MDPKit/Shaders/MDPHitID.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
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
!29 = !{<{ i32 }> (<4 x float>, i32, %struct._texture_2d_t addrspace(1)*, %"struct.metal::_atomic.25" addrspace(1)*, i32 addrspace(2)*)* @HitIDFragmentFunc, !30, !32}
!30 = !{!31}
!31 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"uint", !"air.arg_name", !"hitID"}
!32 = !{!33, !34, !35, !36, !38}
!33 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!34 = !{i32 1, !"air.fragment_input", !"generated(5hitIDj)", !"air.flat", !"air.arg_type_name", !"uint", !"air.arg_name", !"hitID"}
!35 = !{i32 2, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<uint, write>", !"air.arg_name", !"listTexture"}
!36 = !{i32 3, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.struct_type_info", !37, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"metal::_atomic", !"air.arg_name", !"listIndex"}
!37 = !{i32 0, i32 4, i32 0, !"uint", !"__s"}
!38 = !{i32 4, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"listWrite"}
!39 = distinct !DISubprogram(name: "HitIDFragmentFunc", scope: !8, file: !8, line: 37, type: !40, scopeLine: 41, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !41)
!40 = !DISubroutineType(types: !41)
!41 = !{}
!42 = !DILocation(line: 42, column: 20, scope: !39)
!43 = !DILocation(line: 42, column: 9, scope: !39)
!44 = !DILocation(line: 509, column: 53, scope: !45, inlinedAt: !47)
!45 = distinct !DISubprogram(name: "atomic_fetch_add_explicit<unsigned int, int, void>", scope: !46, file: !46, line: 500, type: !40, scopeLine: 508, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !41)
!46 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_atomic", directory: "")
!47 = distinct !DILocation(line: 46, column: 27, scope: !39)
!48 = !DILocation(line: 509, column: 10, scope: !45, inlinedAt: !47)
!49 = !DILocation(line: 48, column: 13, scope: !39)
!50 = !{!51, !51, i64 0}
!51 = !{!"int", !52, i64 0}
!52 = !{!"omnipotent char", !53, i64 0}
!53 = !{!"Simple C++ TBAA"}
!54 = !{!55}
!55 = distinct !{!55, !56, !"air-alias-scope-arg(4)"}
!56 = distinct !{!56, !"air-alias-scopes(HitIDFragmentFunc)"}
!57 = !{!58, !59}
!58 = distinct !{!58, !56, !"air-alias-scope-textures"}
!59 = distinct !{!59, !56, !"air-alias-scope-arg(3)"}
!60 = !DILocation(line: 2231, column: 12, scope: !61, inlinedAt: !63)
!61 = distinct !DISubprogram(name: "get_width", scope: !62, file: !62, line: 2228, type: !40, scopeLine: 2229, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !41)
!62 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/__bits/metal_texture2d", directory: "")
!63 = distinct !DILocation(line: 50, column: 45, scope: !39)
!64 = !{!58}
!65 = !{!59, !55}
!66 = !DILocation(line: 51, column: 49, scope: !39)
!67 = !DILocation(line: 51, column: 32, scope: !39)
!68 = !DILocation(line: 51, column: 76, scope: !39)
!69 = !DILocation(line: 52, column: 31, scope: !39)
!70 = !DILocation(line: 942, column: 5, scope: !71, inlinedAt: !72)
!71 = distinct !DISubprogram(name: "write", scope: !62, file: !62, line: 939, type: !40, scopeLine: 940, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !41)
!72 = distinct !DILocation(line: 52, column: 25, scope: !39)
!73 = !DILocation(line: 53, column: 9, scope: !39)
!74 = !DILocation(line: 58, column: 5, scope: !39)

