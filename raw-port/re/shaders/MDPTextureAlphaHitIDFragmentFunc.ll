0x0000000002c606 -- MDPTextureAlphaHitIDFragmentFunc:
source_filename = "MDPTextureAlphaHitIDFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._sampler_t = type opaque
%struct._texture_2d_t = type opaque
%"struct.metal::_atomic.25" = type { i32 }

; Function Attrs: convergent mustprogress nounwind willreturn
define <{ i32 }> @MDPTextureAlphaHitIDFragmentFunc(<4 x float> %0, <2 x float> %1, i32 %2, %struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %4, %struct._texture_2d_t addrspace(1)* %5, %"struct.metal::_atomic.25" addrspace(1)* nocapture noundef "air-buffer-no-alias" %6, i32 addrspace(2)* nocapture noundef readonly align 4 dereferenceable(4) "air-buffer-no-alias" %7) local_unnamed_addr #0 !dbg !42 {
  %9 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %4, <2 x float> %1, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #5, !dbg !45, !alias.scope !49, !noalias !53
  %10 = extractvalue { <4 x float>, i8 } %9, 0, !dbg !45
  %11 = extractelement <4 x float> %10, i64 3, !dbg !56
  %12 = fcmp fast ugt float %11, 0x3F50624DE0000000, !dbg !57
  br i1 %12, label %14, label %13, !dbg !56

13:                                               ; preds = %8
  tail call void @air.discard_fragment() #6, !dbg !58
  br label %29, !dbg !62

14:                                               ; preds = %8
  %15 = icmp eq i32 %2, 0, !dbg !63
  br i1 %15, label %29, label %16, !dbg !64

16:                                               ; preds = %14
  %17 = getelementptr inbounds %"struct.metal::_atomic.25", %"struct.metal::_atomic.25" addrspace(1)* %6, i64 0, i32 0, !dbg !65
  %18 = tail call i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture %17, i32 1, i32 0, i32 2, i1 true) #6, !dbg !69
  %19 = load i32, i32 addrspace(2)* %7, align 4, !dbg !70, !tbaa !71, !alias.scope !75, !noalias !76
  %20 = icmp eq i32 %19, 0, !dbg !70
  br i1 %20, label %29, label %21, !dbg !70

21:                                               ; preds = %16
  %22 = tail call i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, i32 0) #7, !dbg !77, !alias.scope !80, !noalias !81
  %23 = urem i32 %18, %22, !dbg !82
  %24 = insertelement <2 x i32> undef, i32 %23, i64 0, !dbg !83
  %25 = udiv i32 %18, %22, !dbg !84
  %26 = insertelement <2 x i32> %24, i32 %25, i64 1, !dbg !83
  %27 = insertelement <4 x i32> poison, i32 %2, i64 0, !dbg !85
  %28 = shufflevector <4 x i32> %27, <4 x i32> poison, <4 x i32> zeroinitializer, !dbg !85
  tail call void @air.write_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture %5, <2 x i32> %26, <4 x i32> %28, i32 0, i32 2) #8, !dbg !86, !alias.scope !80, !noalias !81
  br label %29, !dbg !89

29:                                               ; preds = %21, %16, %14, %13
  %30 = phi i32 [ 0, %13 ], [ %2, %16 ], [ %2, %21 ], [ 0, %14 ], !dbg !90
  %31 = insertvalue <{ i32 }> undef, i32 %30, 0, !dbg !91
  ret <{ i32 }> %31, !dbg !91
}

; Function Attrs: argmemonly mustprogress nounwind willreturn
declare void @air.write_texture_2d.u.v4i32(%struct._texture_2d_t addrspace(1)* nocapture, <2 x i32>, <4 x i32>, i32, i32) local_unnamed_addr #1

; Function Attrs: argmemonly mustprogress nofree nounwind readonly willreturn
declare i32 @air.get_width_texture_2d(%struct._texture_2d_t addrspace(1)* nocapture readonly, i32) local_unnamed_addr #2

; Function Attrs: mustprogress nounwind willreturn
declare i32 @air.atomic.global.add.u.i32(i32 addrspace(1)* nocapture, i32, i32, i32, i1) local_unnamed_addr #3

; Function Attrs: mustprogress nounwind willreturn
declare void @air.discard_fragment() local_unnamed_addr #3

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #4

attributes #0 = { convergent mustprogress nounwind willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly mustprogress nounwind willreturn }
attributes #2 = { argmemonly mustprogress nofree nounwind readonly willreturn }
attributes #3 = { mustprogress nounwind willreturn }
attributes #4 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #5 = { argmemonly convergent nounwind readonly willreturn }
attributes #6 = { nounwind willreturn }
attributes #7 = { argmemonly nounwind readonly willreturn }
attributes #8 = { argmemonly nounwind willreturn }

!llvm.dbg.cu = !{!0}
!llvm.module.flags = !{!12, !13, !14, !15, !16, !17, !18, !19, !20, !21, !22}
!llvm.ident = !{!23}
!air.version = !{!24}
!air.language_version = !{!25}
!air.compile_options = !{!26, !27, !28}
!air.fragment = !{!29}

!0 = distinct !DICompileUnit(language: DW_LANG_Metal, file: !1, producer: "Apple metal version 32023.883 (metalfe-32023.883)", isOptimized: true, flags: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/bin/metal --driver-mode=metal -c --target=air64-apple-macos15.6 -gline-tables-only -frecord-sources=yes -I /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts/include -F/Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts -isysroot /AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk -fmetal-math-mode=fast -fmetal-math-fp32-functions=fast -serialize-diagnostics /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPTextureAlphaHitID.dia -o /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPTextureAlphaHitID.air -MMD -MT dependencies -MF /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPTextureAlphaHitID.dat /Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPTextureAlphaHitID.metal -Wno-reorder-init-list -Wno-implicit-int-float-conversion -Wno-c99-designator -Wno-final-dtor-non-final-class -Wno-extra-semi-stmt -Wno-misleading-indentation -Wno-quoted-include-in-framework-header -Wno-implicit-fallthrough -Wno-enum-enum-conversion -Wno-enum-float-conversion -Wno-elaborated-enum-base -Wno-reserved-identifier -Wno-gnu-folding-constant -Wno-objc-load-method -Xclang -clang-vendor-feature=+disableNonDependentMemberExprInCurrentInstantiation -mllvm -disable-aligned-alloc-awareness=1 -Xclang -fno-odr-hash-protocols -Xclang -clang-vendor-feature=+enableAggressiveVLAFolding -Xclang -clang-vendor-feature=+revert09abecef7bbf -Xclang -clang-vendor-feature=+thisNoAlignAttr -Xclang -clang-vendor-feature=+thisNoNullAttr -mlinker-version=1266.8", runtimeVersion: 0, emissionKind: LineTablesOnly, imports: !2, splitDebugInlining: false, nameTableKind: None, sysroot: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk", sdk: "MacOSX26.4.sdk")
!1 = !DIFile(filename: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPTextureAlphaHitID.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!2 = !{!3, !6, !9}
!3 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !4, file: !5, line: 1)
!4 = !DIModule(scope: null, name: "metal_types", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!5 = !DIFile(filename: "<built-in>", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!6 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !7, file: !8, line: 8)
!7 = !DIModule(scope: null, name: "metal_stdlib", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!8 = !DIFile(filename: "MDPKit/Shaders/MDPTextureAlphaHitID.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
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
!29 = !{<{ i32 }> (<4 x float>, <2 x float>, i32, %struct._texture_2d_t addrspace(1)*, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %"struct.metal::_atomic.25" addrspace(1)*, i32 addrspace(2)*)* @MDPTextureAlphaHitIDFragmentFunc, !30, !32}
!30 = !{!31}
!31 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"uint", !"air.arg_name", !"hitID"}
!32 = !{!33, !34, !35, !36, !37, !38, !39, !41}
!33 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!34 = !{i32 1, !"air.fragment_input", !"generated(8texCoordDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"texCoord"}
!35 = !{i32 2, !"air.fragment_input", !"generated(5hitIDj)", !"air.flat", !"air.arg_type_name", !"uint", !"air.arg_name", !"hitID"}
!36 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"tex"}
!37 = !{i32 4, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"texSampler"}
!38 = !{i32 5, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.write", !"air.arg_type_name", !"texture2d<uint, write>", !"air.arg_name", !"listTexture"}
!39 = !{i32 6, !"air.buffer", !"air.location_index", i32 1, i32 1, !"air.read_write", !"air.address_space", i32 1, !"air.struct_type_info", !40, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"metal::_atomic", !"air.arg_name", !"listIndex"}
!40 = !{i32 0, i32 4, i32 0, !"uint", !"__s"}
!41 = !{i32 7, !"air.buffer", !"air.buffer_size", i32 4, !"air.location_index", i32 2, i32 1, !"air.read", !"air.address_space", i32 2, !"air.arg_type_size", i32 4, !"air.arg_type_align_size", i32 4, !"air.arg_type_name", !"uint", !"air.arg_name", !"listWrite"}
!42 = distinct !DISubprogram(name: "MDPTextureAlphaHitIDFragmentFunc", scope: !8, file: !8, line: 40, type: !43, scopeLine: 46, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !44)
!43 = !DISubroutineType(types: !44)
!44 = !{}
!45 = !DILocation(line: 47, column: 12, scope: !46, inlinedAt: !48)
!46 = distinct !DISubprogram(name: "sample", scope: !47, file: !47, line: 44, type: !43, scopeLine: 45, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !44)
!47 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/__bits/metal_texture2d", directory: "")
!48 = distinct !DILocation(line: 50, column: 29, scope: !42)
!49 = !{!50, !52}
!50 = distinct !{!50, !51, !"air-alias-scope-textures"}
!51 = distinct !{!51, !"air-alias-scopes(MDPTextureAlphaHitIDFragmentFunc)"}
!52 = distinct !{!52, !51, !"air-alias-scope-samplers"}
!53 = !{!54, !55}
!54 = distinct !{!54, !51, !"air-alias-scope-arg(6)"}
!55 = distinct !{!55, !51, !"air-alias-scope-arg(7)"}
!56 = !DILocation(line: 52, column: 9, scope: !42)
!57 = !DILocation(line: 52, column: 15, scope: !42)
!58 = !DILocation(line: 184, column: 3, scope: !59, inlinedAt: !61)
!59 = distinct !DISubprogram(name: "discard_fragment", scope: !60, file: !60, line: 182, type: !43, scopeLine: 183, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !44)
!60 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_graphics", directory: "")
!61 = distinct !DILocation(line: 54, column: 9, scope: !42)
!62 = !DILocation(line: 55, column: 9, scope: !42)
!63 = !DILocation(line: 58, column: 20, scope: !42)
!64 = !DILocation(line: 58, column: 9, scope: !42)
!65 = !DILocation(line: 509, column: 53, scope: !66, inlinedAt: !68)
!66 = distinct !DISubprogram(name: "atomic_fetch_add_explicit<unsigned int, int, void>", scope: !67, file: !67, line: 500, type: !43, scopeLine: 508, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !44)
!67 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_atomic", directory: "")
!68 = distinct !DILocation(line: 62, column: 27, scope: !42)
!69 = !DILocation(line: 509, column: 10, scope: !66, inlinedAt: !68)
!70 = !DILocation(line: 64, column: 13, scope: !42)
!71 = !{!72, !72, i64 0}
!72 = !{!"int", !73, i64 0}
!73 = !{!"omnipotent char", !74, i64 0}
!74 = !{!"Simple C++ TBAA"}
!75 = !{!55}
!76 = !{!50, !52, !54}
!77 = !DILocation(line: 2231, column: 12, scope: !78, inlinedAt: !79)
!78 = distinct !DISubprogram(name: "get_width", scope: !47, file: !47, line: 2228, type: !43, scopeLine: 2229, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !44)
!79 = distinct !DILocation(line: 66, column: 45, scope: !42)
!80 = !{!50}
!81 = !{!52, !54, !55}
!82 = !DILocation(line: 67, column: 49, scope: !42)
!83 = !DILocation(line: 67, column: 32, scope: !42)
!84 = !DILocation(line: 67, column: 76, scope: !42)
!85 = !DILocation(line: 68, column: 31, scope: !42)
!86 = !DILocation(line: 942, column: 5, scope: !87, inlinedAt: !88)
!87 = distinct !DISubprogram(name: "write", scope: !47, file: !47, line: 939, type: !43, scopeLine: 940, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !44)
!88 = distinct !DILocation(line: 68, column: 25, scope: !42)
!89 = !DILocation(line: 69, column: 9, scope: !42)
!90 = !DILocation(line: 0, scope: !42)
!91 = !DILocation(line: 74, column: 1, scope: !42)

