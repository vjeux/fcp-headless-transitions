0x00000000008f26 -- MDPLayeredTextureFragmentFunc:
source_filename = "MDPLayeredTextureFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct._texture_2d_t = type opaque
%struct._sampler_t = type opaque

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
define <{ <4 x float> }> @MDPLayeredTextureFragmentFunc(<4 x float> %0, <4 x float> %1, <2 x float> %2, %struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %4, %struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %6, %struct._texture_2d_t addrspace(1)* nocapture readonly %7, %struct._sampler_t addrspace(2)* nocapture readonly %8) local_unnamed_addr #0 !dbg !42 {
  %10 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %3, %struct._sampler_t addrspace(2)* nocapture readonly %4, <2 x float> %2, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !dbg !45, !alias.scope !49
  %11 = extractvalue { <4 x float>, i8 } %10, 0, !dbg !45
  %12 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %5, %struct._sampler_t addrspace(2)* nocapture readonly %6, <2 x float> %2, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !dbg !53, !alias.scope !49
  %13 = extractvalue { <4 x float>, i8 } %12, 0, !dbg !53
  %14 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly %7, %struct._sampler_t addrspace(2)* nocapture readonly %8, <2 x float> %2, i1 true, <2 x i32> zeroinitializer, i1 false, float 0.000000e+00, float 0.000000e+00, i32 0) #2, !dbg !55, !alias.scope !49
  %15 = extractvalue { <4 x float>, i8 } %14, 0, !dbg !55
  %16 = extractelement <4 x float> %15, i64 0, !dbg !57
  %17 = extractelement <4 x float> %15, i64 3, !dbg !58
  %18 = fsub fast float 1.000000e+00, %17, !dbg !59
  %19 = extractelement <4 x float> %13, i64 3, !dbg !60
  %20 = fmul fast float %18, %19, !dbg !61
  %21 = extractelement <4 x float> %11, i64 0, !dbg !62
  %22 = fmul fast float %20, %21, !dbg !63
  %23 = fadd fast float %22, %16, !dbg !64
  %24 = insertelement <4 x float> undef, float %23, i64 0, !dbg !65
  %25 = extractelement <4 x float> %15, i64 1, !dbg !66
  %26 = extractelement <4 x float> %11, i64 1, !dbg !67
  %27 = fmul fast float %20, %26, !dbg !68
  %28 = fadd fast float %27, %25, !dbg !69
  %29 = insertelement <4 x float> %24, float %28, i64 1, !dbg !65
  %30 = extractelement <4 x float> %15, i64 2, !dbg !70
  %31 = extractelement <4 x float> %11, i64 2, !dbg !71
  %32 = fmul fast float %20, %31, !dbg !72
  %33 = fadd fast float %32, %30, !dbg !73
  %34 = insertelement <4 x float> %29, float %33, i64 2, !dbg !65
  %35 = extractelement <4 x float> %11, i64 3, !dbg !74
  %36 = fmul fast float %20, %35, !dbg !75
  %37 = fadd fast float %36, %17, !dbg !76
  %38 = insertelement <4 x float> %34, float %37, i64 3, !dbg !65
  %39 = fmul fast <4 x float> %38, %1, !dbg !77
  %40 = insertvalue <{ <4 x float> }> undef, <4 x float> %39, 0, !dbg !78
  ret <{ <4 x float> }> %40, !dbg !78
}

; Function Attrs: argmemonly convergent mustprogress nofree nounwind readonly willreturn
declare { <4 x float>, i8 } @air.sample_texture_2d.v4f32(%struct._texture_2d_t addrspace(1)* nocapture readonly, %struct._sampler_t addrspace(2)* nocapture readonly, <2 x float>, i1, <2 x i32>, i1, float, float, i32) local_unnamed_addr #1

attributes #0 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly convergent mustprogress nofree nounwind readonly willreturn }
attributes #2 = { argmemonly convergent nounwind readonly willreturn }

!llvm.dbg.cu = !{!0}
!llvm.module.flags = !{!12, !13, !14, !15, !16, !17, !18, !19, !20, !21, !22}
!llvm.ident = !{!23}
!air.version = !{!24}
!air.language_version = !{!25}
!air.compile_options = !{!26, !27, !28}
!air.fragment = !{!29}

!0 = distinct !DICompileUnit(language: DW_LANG_Metal, file: !1, producer: "Apple metal version 32023.883 (metalfe-32023.883)", isOptimized: true, flags: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/bin/metal --driver-mode=metal -c --target=air64-apple-macos15.6 -gline-tables-only -frecord-sources=yes -I /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts/include -F/Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts -isysroot /AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk -fmetal-math-mode=fast -fmetal-math-fp32-functions=fast -serialize-diagnostics /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPLayeredTexture.dia -o /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPLayeredTexture.air -MMD -MT dependencies -MF /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPLayeredTexture.dat /Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPLayeredTexture.metal -Wno-reorder-init-list -Wno-implicit-int-float-conversion -Wno-c99-designator -Wno-final-dtor-non-final-class -Wno-extra-semi-stmt -Wno-misleading-indentation -Wno-quoted-include-in-framework-header -Wno-implicit-fallthrough -Wno-enum-enum-conversion -Wno-enum-float-conversion -Wno-elaborated-enum-base -Wno-reserved-identifier -Wno-gnu-folding-constant -Wno-objc-load-method -Xclang -clang-vendor-feature=+disableNonDependentMemberExprInCurrentInstantiation -mllvm -disable-aligned-alloc-awareness=1 -Xclang -fno-odr-hash-protocols -Xclang -clang-vendor-feature=+enableAggressiveVLAFolding -Xclang -clang-vendor-feature=+revert09abecef7bbf -Xclang -clang-vendor-feature=+thisNoAlignAttr -Xclang -clang-vendor-feature=+thisNoNullAttr -mlinker-version=1266.8", runtimeVersion: 0, emissionKind: LineTablesOnly, imports: !2, splitDebugInlining: false, nameTableKind: None, sysroot: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk", sdk: "MacOSX26.4.sdk")
!1 = !DIFile(filename: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPLayeredTexture.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!2 = !{!3, !6, !9}
!3 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !4, file: !5, line: 1)
!4 = !DIModule(scope: null, name: "metal_types", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!5 = !DIFile(filename: "<built-in>", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!6 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !7, file: !8, line: 8)
!7 = !DIModule(scope: null, name: "metal_stdlib", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!8 = !DIFile(filename: "MDPKit/Shaders/MDPLayeredTexture.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
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
!29 = !{<{ <4 x float> }> (<4 x float>, <4 x float>, <2 x float>, %struct._texture_2d_t addrspace(1)*, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._sampler_t addrspace(2)*, %struct._texture_2d_t addrspace(1)*, %struct._sampler_t addrspace(2)*)* @MDPLayeredTextureFragmentFunc, !30, !32}
!30 = !{!31}
!31 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!32 = !{!33, !34, !35, !36, !37, !38, !39, !40, !41}
!33 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!34 = !{i32 1, !"air.fragment_input", !"generated(5colorDv4_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!35 = !{i32 2, !"air.fragment_input", !"generated(8texCoordDv2_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float2", !"air.arg_name", !"texCoord"}
!36 = !{i32 3, !"air.texture", !"air.location_index", i32 0, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"tex"}
!37 = !{i32 4, !"air.sampler", !"air.location_index", i32 0, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"texSampler"}
!38 = !{i32 5, !"air.texture", !"air.location_index", i32 1, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"maskTex"}
!39 = !{i32 6, !"air.sampler", !"air.location_index", i32 1, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"maskTexSampler"}
!40 = !{i32 7, !"air.texture", !"air.location_index", i32 2, i32 1, !"air.sample", !"air.arg_type_name", !"texture2d<float, sample>", !"air.arg_name", !"outlineTex"}
!41 = !{i32 8, !"air.sampler", !"air.location_index", i32 2, i32 1, !"air.arg_type_name", !"sampler", !"air.arg_name", !"outlineTexSampler"}
!42 = distinct !DISubprogram(name: "MDPLayeredTextureFragmentFunc", scope: !8, file: !8, line: 40, type: !43, scopeLine: 47, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !44)
!43 = !DISubroutineType(types: !44)
!44 = !{}
!45 = !DILocation(line: 47, column: 12, scope: !46, inlinedAt: !48)
!46 = distinct !DISubprogram(name: "sample", scope: !47, file: !47, line: 44, type: !43, scopeLine: 45, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !44)
!47 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/__bits/metal_texture2d", directory: "")
!48 = distinct !DILocation(line: 50, column: 30, scope: !42)
!49 = !{!50, !52}
!50 = distinct !{!50, !51, !"air-alias-scope-textures"}
!51 = distinct !{!51, !"air-alias-scopes(MDPLayeredTextureFragmentFunc)"}
!52 = distinct !{!52, !51, !"air-alias-scope-samplers"}
!53 = !DILocation(line: 47, column: 12, scope: !46, inlinedAt: !54)
!54 = distinct !DILocation(line: 51, column: 34, scope: !42)
!55 = !DILocation(line: 47, column: 12, scope: !46, inlinedAt: !56)
!56 = distinct !DILocation(line: 52, column: 40, scope: !42)
!57 = !DILocation(line: 54, column: 33, scope: !42)
!58 = !DILocation(line: 54, column: 52, scope: !42)
!59 = !DILocation(line: 54, column: 50, scope: !42)
!60 = !DILocation(line: 54, column: 65, scope: !42)
!61 = !DILocation(line: 54, column: 63, scope: !42)
!62 = !DILocation(line: 54, column: 74, scope: !42)
!63 = !DILocation(line: 54, column: 72, scope: !42)
!64 = !DILocation(line: 54, column: 43, scope: !42)
!65 = !DILocation(line: 54, column: 26, scope: !42)
!66 = !DILocation(line: 55, column: 33, scope: !42)
!67 = !DILocation(line: 55, column: 74, scope: !42)
!68 = !DILocation(line: 55, column: 72, scope: !42)
!69 = !DILocation(line: 55, column: 43, scope: !42)
!70 = !DILocation(line: 56, column: 33, scope: !42)
!71 = !DILocation(line: 56, column: 74, scope: !42)
!72 = !DILocation(line: 56, column: 72, scope: !42)
!73 = !DILocation(line: 56, column: 43, scope: !42)
!74 = !DILocation(line: 57, column: 74, scope: !42)
!75 = !DILocation(line: 57, column: 72, scope: !42)
!76 = !DILocation(line: 57, column: 43, scope: !42)
!77 = !DILocation(line: 58, column: 29, scope: !42)
!78 = !DILocation(line: 60, column: 1, scope: !42)

