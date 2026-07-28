0x00000000028526 -- MDPSpecularLitFragmentFunc:
source_filename = "MDPSpecularLitFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.MDPSpecularLitUniforms = type <{ %"struct.metal::matrix.14", %"struct.metal::matrix.14", %"struct.metal::matrix.0.20", float, [12 x i8] }>
%"struct.metal::matrix.14" = type { [4 x <4 x float>] }
%"struct.metal::matrix.0.20" = type { [3 x <3 x float>] }

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
define <{ <4 x float> }> @MDPSpecularLitFragmentFunc(<4 x float> %0, <4 x float> %1, <4 x float> %2, <3 x float> %3, %struct.MDPSpecularLitUniforms addrspace(2)* nocapture noundef readonly align 16 dereferenceable(180) "air-buffer-no-alias" %4) local_unnamed_addr #0 !dbg !38 {
  %6 = tail call fast float @air.dot.v3f32(<3 x float> <float 1.000000e+00, float 1.000000e+00, float -1.000000e+00>, <3 x float> <float 1.000000e+00, float 1.000000e+00, float -1.000000e+00>) #2, !dbg !41
  %7 = tail call fast float @air.fast_rsqrt.f32(float %6) #2, !dbg !51
  %8 = insertelement <3 x float> poison, float %7, i64 0, !dbg !55
  %9 = shufflevector <3 x float> %8, <3 x float> poison, <3 x i32> zeroinitializer, !dbg !55
  %10 = fmul fast <3 x float> %9, <float 1.000000e+00, float 1.000000e+00, float -1.000000e+00>, !dbg !56
  %11 = tail call fast float @air.dot.v3f32(<3 x float> %3, <3 x float> %3) #2, !dbg !57
  %12 = tail call fast float @air.fast_rsqrt.f32(float %11) #2, !dbg !62
  %13 = insertelement <3 x float> poison, float %12, i64 0, !dbg !64
  %14 = shufflevector <3 x float> %13, <3 x float> poison, <3 x i32> zeroinitializer, !dbg !64
  %15 = fmul fast <3 x float> %14, %3, !dbg !65
  %16 = tail call fast float @air.dot.v3f32(<3 x float> %15, <3 x float> %10) #2, !dbg !66
  %17 = tail call fast float @air.fast_saturate.f32(float %16) #2, !dbg !68
  %18 = insertelement <3 x float> poison, float %17, i64 0, !dbg !72
  %19 = fmul fast <3 x float> %18, <float 0x3FE6666660000000, float poison, float poison>, !dbg !73
  %20 = fneg fast <3 x float> %10, !dbg !74
  %21 = tail call fast float @air.dot.v3f32(<3 x float> %15, <3 x float> %20) #2, !dbg !75
  %22 = fmul fast float %21, 2.000000e+00, !dbg !79
  %23 = insertelement <3 x float> poison, float %22, i64 0, !dbg !80
  %24 = shufflevector <3 x float> %23, <3 x float> poison, <3 x i32> zeroinitializer, !dbg !80
  %25 = fmul fast <3 x float> %24, %15, !dbg !81
  %26 = fsub fast <3 x float> %20, %25, !dbg !82
  %27 = tail call fast float @air.dot.v3f32(<3 x float> %26, <3 x float> <float 0.000000e+00, float 0.000000e+00, float -1.000000e+00>) #2, !dbg !83
  %28 = tail call fast float @air.fast_saturate.f32(float %27) #2, !dbg !85
  %29 = tail call fast float @air.fast_pow.f32(float %28, float 3.200000e+01) #2, !dbg !87
  %30 = insertelement <3 x float> poison, float %29, i64 0, !dbg !90
  %31 = shufflevector <3 x float> %30, <3 x float> poison, <3 x i32> zeroinitializer, !dbg !90
  %32 = fadd fast <3 x float> %19, <float 0x3FD99999A0000000, float poison, float poison>, !dbg !91
  %33 = shufflevector <3 x float> %32, <3 x float> poison, <3 x i32> zeroinitializer, !dbg !91
  %34 = shufflevector <4 x float> %2, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>, !dbg !92
  %35 = fmul fast <3 x float> %33, %34, !dbg !93
  %36 = fadd fast <3 x float> %31, %35, !dbg !94
  %37 = tail call fast <3 x float> @air.fast_saturate.v3f32(<3 x float> %36) #2, !dbg !95
  %38 = getelementptr inbounds %struct.MDPSpecularLitUniforms, %struct.MDPSpecularLitUniforms addrspace(2)* %4, i64 0, i32 3, !dbg !98
  %39 = load float, float addrspace(2)* %38, align 16, !dbg !98, !tbaa !99, !alias.scope !106
  %40 = fdiv fast float 1.000000e+00, %39, !dbg !109
  %41 = insertelement <3 x float> poison, float %40, i64 0, !dbg !110
  %42 = shufflevector <3 x float> %41, <3 x float> poison, <3 x i32> zeroinitializer, !dbg !110
  %43 = tail call fast <3 x float> @air.fast_pow.v3f32(<3 x float> %37, <3 x float> %42) #2, !dbg !111
  %44 = shufflevector <3 x float> %43, <3 x float> poison, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>, !dbg !114
  %45 = shufflevector <4 x float> %44, <4 x float> %2, <4 x i32> <i32 0, i32 1, i32 2, i32 7>, !dbg !114
  %46 = insertvalue <{ <4 x float> }> undef, <4 x float> %45, 0, !dbg !115
  ret <{ <4 x float> }> %46, !dbg !115
}

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <3 x float> @air.fast_pow.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare <3 x float> @air.fast_saturate.v3f32(<3 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_pow.f32(float, float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_saturate.f32(float) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_rsqrt.f32(float) local_unnamed_addr #1

attributes #0 = { mustprogress nofree nosync nounwind readnone willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #2 = { nounwind readnone willreturn }

!llvm.dbg.cu = !{!0}
!llvm.module.flags = !{!11, !12, !13, !14, !15, !16, !17, !18, !19, !20, !21}
!llvm.ident = !{!22}
!air.version = !{!23}
!air.language_version = !{!24}
!air.compile_options = !{!25, !26, !27}
!air.fragment = !{!28}

!0 = distinct !DICompileUnit(language: DW_LANG_Metal, file: !1, producer: "Apple metal version 32023.883 (metalfe-32023.883)", isOptimized: true, flags: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/bin/metal --driver-mode=metal -c --target=air64-apple-macos15.6 -gline-tables-only -frecord-sources=yes -I /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts/include -F/Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts -isysroot /AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk -fmetal-math-mode=fast -fmetal-math-fp32-functions=fast -serialize-diagnostics /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPSpecularLit.dia -o /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPSpecularLit.air -MMD -MT dependencies -MF /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPSpecularLit.dat /Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPSpecularLit.metal -Wno-reorder-init-list -Wno-implicit-int-float-conversion -Wno-c99-designator -Wno-final-dtor-non-final-class -Wno-extra-semi-stmt -Wno-misleading-indentation -Wno-quoted-include-in-framework-header -Wno-implicit-fallthrough -Wno-enum-enum-conversion -Wno-enum-float-conversion -Wno-elaborated-enum-base -Wno-reserved-identifier -Wno-gnu-folding-constant -Wno-objc-load-method -Xclang -clang-vendor-feature=+disableNonDependentMemberExprInCurrentInstantiation -mllvm -disable-aligned-alloc-awareness=1 -Xclang -fno-odr-hash-protocols -Xclang -clang-vendor-feature=+enableAggressiveVLAFolding -Xclang -clang-vendor-feature=+revert09abecef7bbf -Xclang -clang-vendor-feature=+thisNoAlignAttr -Xclang -clang-vendor-feature=+thisNoNullAttr -mlinker-version=1266.8", runtimeVersion: 0, emissionKind: LineTablesOnly, imports: !2, splitDebugInlining: false, nameTableKind: None, sysroot: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk", sdk: "MacOSX26.4.sdk")
!1 = !DIFile(filename: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPSpecularLit.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!2 = !{!3, !6, !9}
!3 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !4, file: !5, line: 1)
!4 = !DIModule(scope: null, name: "metal_types", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!5 = !DIFile(filename: "<built-in>", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!6 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !7, file: !8, line: 8)
!7 = !DIModule(scope: null, name: "metal_stdlib", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!8 = !DIFile(filename: "MDPKit/Shaders/MDPSpecularLit.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!9 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !10, file: !8, line: 9)
!10 = !DIModule(scope: null, name: "metal_matrix", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!11 = !{i32 2, !"SDK Version", [2 x i32] [i32 26, i32 4]}
!12 = !{i32 7, !"Dwarf Version", i32 4}
!13 = !{i32 2, !"Debug Info Version", i32 3}
!14 = !{i32 1, !"wchar_size", i32 4}
!15 = !{i32 7, !"frame-pointer", i32 2}
!16 = !{i32 7, !"air.max_device_buffers", i32 31}
!17 = !{i32 7, !"air.max_constant_buffers", i32 31}
!18 = !{i32 7, !"air.max_threadgroup_buffers", i32 31}
!19 = !{i32 7, !"air.max_textures", i32 128}
!20 = !{i32 7, !"air.max_read_write_textures", i32 8}
!21 = !{i32 7, !"air.max_samplers", i32 16}
!22 = !{!"Apple metal version 32023.883 (metalfe-32023.883)"}
!23 = !{i32 2, i32 7, i32 0}
!24 = !{!"Metal", i32 3, i32 2, i32 0}
!25 = !{!"air.compile.denorms_disable"}
!26 = !{!"air.compile.fast_math_enable"}
!27 = !{!"air.compile.framebuffer_fetch_enable"}
!28 = !{<{ <4 x float> }> (<4 x float>, <4 x float>, <4 x float>, <3 x float>, %struct.MDPSpecularLitUniforms addrspace(2)*)* @MDPSpecularLitFragmentFunc, !29, !31}
!29 = !{!30}
!30 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!31 = !{!32, !33, !34, !35, !36}
!32 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!33 = !{i32 1, !"air.fragment_input", !"generated(12viewPositionDv4_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"viewPosition", !"air.arg_unused"}
!34 = !{i32 2, !"air.fragment_input", !"generated(5colorDv4_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!35 = !{i32 3, !"air.fragment_input", !"generated(6normalDv3_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float3", !"air.arg_name", !"normal"}
!36 = !{i32 4, !"air.buffer", !"air.buffer_size", i32 192, !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !37, !"air.arg_type_size", i32 192, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"MDPSpecularLitUniforms", !"air.arg_name", !"uniforms"}
!37 = !{i32 0, i32 64, i32 0, !"float4x4", !"projectionMatrix", i32 64, i32 64, i32 0, !"float4x4", !"modelViewMatrix", i32 128, i32 48, i32 0, !"float3x3", !"normalMatrix", i32 176, i32 4, i32 0, !"float", !"gamma"}
!38 = distinct !DISubprogram(name: "MDPSpecularLitFragmentFunc", scope: !8, file: !8, line: 57, type: !39, scopeLine: 59, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!39 = !DISubroutineType(types: !40)
!40 = !{}
!41 = !DILocation(line: 106, column: 10, scope: !42, inlinedAt: !44)
!42 = distinct !DISubprogram(name: "dot", scope: !43, file: !43, line: 104, type: !39, scopeLine: 105, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!43 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_geometric", directory: "")
!44 = distinct !DILocation(line: 110, column: 10, scope: !45, inlinedAt: !46)
!45 = distinct !DISubprogram(name: "length_squared", scope: !43, file: !43, line: 108, type: !39, scopeLine: 109, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!46 = distinct !DILocation(line: 214, column: 26, scope: !47, inlinedAt: !48)
!47 = distinct !DISubprogram(name: "normalize", scope: !43, file: !43, line: 212, type: !39, scopeLine: 213, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!48 = distinct !DILocation(line: 686, column: 12, scope: !49, inlinedAt: !50)
!49 = distinct !DISubprogram(name: "normalize", scope: !43, file: !43, line: 683, type: !39, scopeLine: 684, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!50 = distinct !DILocation(line: 60, column: 36, scope: !38)
!51 = !DILocation(line: 235, column: 10, scope: !52, inlinedAt: !54)
!52 = distinct !DISubprogram(name: "rsqrt", scope: !53, file: !53, line: 233, type: !39, scopeLine: 234, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!53 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_math", directory: "")
!54 = distinct !DILocation(line: 214, column: 14, scope: !47, inlinedAt: !48)
!55 = !DILocation(line: 214, column: 14, scope: !47, inlinedAt: !48)
!56 = !DILocation(line: 214, column: 12, scope: !47, inlinedAt: !48)
!57 = !DILocation(line: 106, column: 10, scope: !42, inlinedAt: !58)
!58 = distinct !DILocation(line: 110, column: 10, scope: !45, inlinedAt: !59)
!59 = distinct !DILocation(line: 214, column: 26, scope: !47, inlinedAt: !60)
!60 = distinct !DILocation(line: 686, column: 12, scope: !49, inlinedAt: !61)
!61 = distinct !DILocation(line: 66, column: 24, scope: !38)
!62 = !DILocation(line: 235, column: 10, scope: !52, inlinedAt: !63)
!63 = distinct !DILocation(line: 214, column: 14, scope: !47, inlinedAt: !60)
!64 = !DILocation(line: 214, column: 14, scope: !47, inlinedAt: !60)
!65 = !DILocation(line: 214, column: 12, scope: !47, inlinedAt: !60)
!66 = !DILocation(line: 106, column: 10, scope: !42, inlinedAt: !67)
!67 = distinct !DILocation(line: 68, column: 42, scope: !38)
!68 = !DILocation(line: 189, column: 10, scope: !69, inlinedAt: !71)
!69 = distinct !DISubprogram(name: "saturate", scope: !70, file: !70, line: 187, type: !39, scopeLine: 188, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!70 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_common", directory: "")
!71 = distinct !DILocation(line: 68, column: 33, scope: !38)
!72 = !DILocation(line: 68, column: 33, scope: !38)
!73 = !DILocation(line: 68, column: 68, scope: !38)
!74 = !DILocation(line: 70, column: 39, scope: !38)
!75 = !DILocation(line: 106, column: 10, scope: !42, inlinedAt: !76)
!76 = distinct !DILocation(line: 709, column: 25, scope: !77, inlinedAt: !78)
!77 = distinct !DISubprogram(name: "reflect", scope: !43, file: !43, line: 707, type: !39, scopeLine: 708, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!78 = distinct !DILocation(line: 70, column: 31, scope: !38)
!79 = !DILocation(line: 709, column: 23, scope: !77, inlinedAt: !78)
!80 = !DILocation(line: 709, column: 14, scope: !77, inlinedAt: !78)
!81 = !DILocation(line: 709, column: 35, scope: !77, inlinedAt: !78)
!82 = !DILocation(line: 709, column: 12, scope: !77, inlinedAt: !78)
!83 = !DILocation(line: 106, column: 10, scope: !42, inlinedAt: !84)
!84 = distinct !DILocation(line: 72, column: 44, scope: !38)
!85 = !DILocation(line: 189, column: 10, scope: !69, inlinedAt: !86)
!86 = distinct !DILocation(line: 72, column: 35, scope: !38)
!87 = !DILocation(line: 4789, column: 10, scope: !88, inlinedAt: !89)
!88 = distinct !DISubprogram(name: "pow", scope: !53, file: !53, line: 4787, type: !39, scopeLine: 4788, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!89 = distinct !DILocation(line: 72, column: 31, scope: !38)
!90 = !DILocation(line: 73, column: 30, scope: !38)
!91 = !DILocation(line: 76, column: 41, scope: !38)
!92 = !DILocation(line: 76, column: 59, scope: !38)
!93 = !DILocation(line: 76, column: 57, scope: !38)
!94 = !DILocation(line: 76, column: 72, scope: !38)
!95 = !DILocation(line: 205, column: 10, scope: !96, inlinedAt: !97)
!96 = distinct !DISubprogram(name: "saturate", scope: !70, file: !70, line: 203, type: !39, scopeLine: 204, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!97 = distinct !DILocation(line: 77, column: 45, scope: !38)
!98 = !DILocation(line: 77, column: 75, scope: !38)
!99 = !{!100, !105, i64 176}
!100 = !{!"_ZTS22MDPSpecularLitUniforms", !101, i64 0, !101, i64 64, !104, i64 128, !105, i64 176}
!101 = !{!"_ZTSN5metal6matrixIfLi4ELi4EvEE", !102, i64 0}
!102 = !{!"omnipotent char", !103, i64 0}
!103 = !{!"Simple C++ TBAA"}
!104 = !{!"_ZTSN5metal6matrixIfLi3ELi3EvEE", !102, i64 0}
!105 = !{!"float", !102, i64 0}
!106 = !{!107}
!107 = distinct !{!107, !108, !"air-alias-scope-arg(4)"}
!108 = distinct !{!108, !"air-alias-scopes(MDPSpecularLitFragmentFunc)"}
!109 = !DILocation(line: 77, column: 64, scope: !38)
!110 = !DILocation(line: 77, column: 62, scope: !38)
!111 = !DILocation(line: 5295, column: 10, scope: !112, inlinedAt: !113)
!112 = distinct !DISubprogram(name: "pow", scope: !53, file: !53, line: 5293, type: !39, scopeLine: 5294, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!113 = distinct !DILocation(line: 77, column: 41, scope: !38)
!114 = !DILocation(line: 77, column: 33, scope: !38)
!115 = !DILocation(line: 83, column: 1, scope: !38)

