0x00000000020706 -- MDPDefaultLitFragmentFunc:
source_filename = "MDPDefaultLitFragmentFunc"
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v16:16:16-v24:32:32-v32:32:32-v48:64:64-v64:64:64-v96:128:128-v128:128:128-v192:256:256-v256:256:256-v512:512:512-v1024:1024:1024-n8:16:32"
target triple = "air64_v27-apple-macosx15.6.0"

%struct.MDPDefaultLitUniforms = type { %"struct.metal::matrix.14", %"struct.metal::matrix.14", %"struct.metal::matrix.0.20" }
%"struct.metal::matrix.14" = type { [4 x <4 x float>] }
%"struct.metal::matrix.0.20" = type { [3 x <3 x float>] }

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
define <{ <4 x float> }> @MDPDefaultLitFragmentFunc(<4 x float> %0, <4 x float> %1, <3 x float> %2, %struct.MDPDefaultLitUniforms addrspace(2)* nocapture noundef readnone align 16 dereferenceable(176) "air-buffer-no-alias" %3) local_unnamed_addr #0 !dbg !38 {
  %5 = alloca [3 x <3 x float>], align 16
  %6 = bitcast [3 x <3 x float>]* %5 to i8*, !dbg !41
  call void @llvm.lifetime.start.p0i8(i64 48, i8* nonnull %6) #3, !dbg !41
  %7 = getelementptr inbounds [3 x <3 x float>], [3 x <3 x float>]* %5, i64 0, i64 0, !dbg !44
  store <3 x float> <float 3.000000e+00, float 3.000000e+00, float 3.000000e+00>, <3 x float>* %7, align 16, !dbg !44
  %8 = getelementptr inbounds [3 x <3 x float>], [3 x <3 x float>]* %5, i64 0, i64 1, !dbg !44
  store <3 x float> <float 0.000000e+00, float -3.000000e+00, float -1.000000e+00>, <3 x float>* %8, align 16, !dbg !44
  %9 = getelementptr inbounds [3 x <3 x float>], [3 x <3 x float>]* %5, i64 0, i64 2, !dbg !44
  store <3 x float> <float -2.000000e+00, float 0.000000e+00, float 0.000000e+00>, <3 x float>* %9, align 16, !dbg !44
  %10 = shufflevector <4 x float> %1, <4 x float> poison, <3 x i32> <i32 0, i32 1, i32 2>
  br label %11, !dbg !45

11:                                               ; preds = %11, %4
  %12 = phi <3 x float> [ zeroinitializer, %4 ], [ %29, %11 ]
  %13 = phi i32 [ 0, %4 ], [ %30, %11 ]
  %14 = zext i32 %13 to i64, !dbg !46
  %15 = getelementptr inbounds [3 x <3 x float>], [3 x <3 x float>]* %5, i64 0, i64 %14, !dbg !46
  %16 = load <3 x float>, <3 x float>* %15, align 16, !dbg !46, !tbaa !47
  %17 = tail call fast float @air.dot.v3f32(<3 x float> %16, <3 x float> %16) #4, !dbg !50
  %18 = tail call fast float @air.fast_rsqrt.f32(float %17) #4, !dbg !60
  %19 = insertelement <3 x float> poison, float %18, i64 0, !dbg !64
  %20 = shufflevector <3 x float> %19, <3 x float> poison, <3 x i32> zeroinitializer, !dbg !64
  %21 = fmul fast <3 x float> %20, %16, !dbg !65
  %22 = tail call fast float @air.dot.v3f32(<3 x float> %2, <3 x float> %21) #4, !dbg !66
  %23 = tail call fast float @air.fast_fmax.f32(float 0.000000e+00, float %22) #4, !dbg !68
  %24 = insertelement <3 x float> poison, float %23, i64 0, !dbg !71
  %25 = fmul fast <3 x float> %24, <float 0x3FE6666660000000, float poison, float poison>, !dbg !72
  %26 = fadd fast <3 x float> %25, <float 0x3FD6666660000000, float poison, float poison>, !dbg !73
  %27 = shufflevector <3 x float> %26, <3 x float> poison, <3 x i32> zeroinitializer, !dbg !73
  %28 = fmul fast <3 x float> %27, %10, !dbg !74
  %29 = fadd fast <3 x float> %28, %12, !dbg !75
  %30 = add nuw nsw i32 %13, 1, !dbg !76
  %31 = icmp eq i32 %30, 3, !dbg !77
  br i1 %31, label %32, label %11, !dbg !45, !llvm.loop !78

32:                                               ; preds = %11
  %33 = shufflevector <3 x float> %29, <3 x float> poison, <4 x i32> <i32 0, i32 1, i32 2, i32 undef>, !dbg !81
  %34 = shufflevector <4 x float> %33, <4 x float> %1, <4 x i32> <i32 0, i32 1, i32 2, i32 7>, !dbg !81
  call void @llvm.lifetime.end.p0i8(i64 48, i8* nonnull %6) #3, !dbg !82
  %35 = insertvalue <{ <4 x float> }> undef, <4 x float> %34, 0, !dbg !83
  ret <{ <4 x float> }> %35, !dbg !83
}

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.end.p0i8(i64 immarg, i8* nocapture) #1

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_fmax.f32(float, float) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.dot.v3f32(<3 x float>, <3 x float>) local_unnamed_addr #2

; Function Attrs: mustprogress nofree nosync nounwind readnone willreturn
declare float @air.fast_rsqrt.f32(float) local_unnamed_addr #2

; Function Attrs: argmemonly nocallback nofree nosync nounwind willreturn
declare void @llvm.lifetime.start.p0i8(i64 immarg, i8* nocapture) #1

attributes #0 = { mustprogress nofree nosync nounwind readnone willreturn "approx-func-fp-math"="true" "frame-pointer"="all" "min-legal-vector-width"="128" "no-builtins" "no-infs-fp-math"="true" "no-nans-fp-math"="true" "no-signed-zeros-fp-math"="true" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "unsafe-fp-math"="true" }
attributes #1 = { argmemonly nocallback nofree nosync nounwind willreturn }
attributes #2 = { mustprogress nofree nosync nounwind readnone willreturn }
attributes #3 = { nounwind }
attributes #4 = { nounwind readnone willreturn }

!llvm.dbg.cu = !{!0}
!llvm.module.flags = !{!12, !13, !14, !15, !16, !17, !18, !19, !20, !21, !22}
!llvm.ident = !{!23}
!air.version = !{!24}
!air.language_version = !{!25}
!air.compile_options = !{!26, !27, !28}
!air.fragment = !{!29}

!0 = distinct !DICompileUnit(language: DW_LANG_Metal, file: !1, producer: "Apple metal version 32023.883 (metalfe-32023.883)", isOptimized: true, flags: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/bin/metal --driver-mode=metal -c --target=air64-apple-macos15.6 -gline-tables-only -frecord-sources=yes -I /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts/include -F/Library/Caches/com.apple.xbs/Binaries/MDPKit/install/Symbols/BuiltProducts -isysroot /AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk -fmetal-math-mode=fast -fmetal-math-fp32-functions=fast -serialize-diagnostics /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPDefaultLit.dia -o /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPDefaultLit.air -MMD -MT dependencies -MF /Library/Caches/com.apple.xbs/Binaries/MDPKit/install/TempContent/Objects/MDPKit.build/MDPKit.build/Metal/MDPDefaultLit.dat /Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPDefaultLit.metal -Wno-reorder-init-list -Wno-implicit-int-float-conversion -Wno-c99-designator -Wno-final-dtor-non-final-class -Wno-extra-semi-stmt -Wno-misleading-indentation -Wno-quoted-include-in-framework-header -Wno-implicit-fallthrough -Wno-enum-enum-conversion -Wno-enum-float-conversion -Wno-elaborated-enum-base -Wno-reserved-identifier -Wno-gnu-folding-constant -Wno-objc-load-method -Xclang -clang-vendor-feature=+disableNonDependentMemberExprInCurrentInstantiation -mllvm -disable-aligned-alloc-awareness=1 -Xclang -fno-odr-hash-protocols -Xclang -clang-vendor-feature=+enableAggressiveVLAFolding -Xclang -clang-vendor-feature=+revert09abecef7bbf -Xclang -clang-vendor-feature=+thisNoAlignAttr -Xclang -clang-vendor-feature=+thisNoNullAttr -mlinker-version=1266.8", runtimeVersion: 0, emissionKind: LineTablesOnly, imports: !2, splitDebugInlining: false, nameTableKind: None, sysroot: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.4.sdk", sdk: "MacOSX26.4.sdk")
!1 = !DIFile(filename: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPDefaultLit.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!2 = !{!3, !6, !9}
!3 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !4, file: !5, line: 1)
!4 = !DIModule(scope: null, name: "metal_types", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!5 = !DIFile(filename: "<built-in>", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
!6 = !DIImportedEntity(tag: DW_TAG_imported_declaration, scope: !0, entity: !7, file: !8, line: 8)
!7 = !DIModule(scope: null, name: "metal_stdlib", includePath: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal")
!8 = !DIFile(filename: "MDPKit/Shaders/MDPDefaultLit.metal", directory: "/Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1")
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
!29 = !{<{ <4 x float> }> (<4 x float>, <4 x float>, <3 x float>, %struct.MDPDefaultLitUniforms addrspace(2)*)* @MDPDefaultLitFragmentFunc, !30, !32}
!30 = !{!31}
!31 = !{!"air.render_target", i32 0, i32 0, !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!32 = !{!33, !34, !35, !36}
!33 = !{i32 0, !"air.position", !"air.center", !"air.no_perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"position", !"air.arg_unused"}
!34 = !{i32 1, !"air.fragment_input", !"generated(5colorDv4_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float4", !"air.arg_name", !"color"}
!35 = !{i32 2, !"air.fragment_input", !"generated(6normalDv3_f)", !"air.center", !"air.perspective", !"air.arg_type_name", !"float3", !"air.arg_name", !"normal"}
!36 = !{i32 3, !"air.buffer", !"air.buffer_size", i32 176, !"air.location_index", i32 0, i32 1, !"air.read", !"air.address_space", i32 2, !"air.struct_type_info", !37, !"air.arg_type_size", i32 176, !"air.arg_type_align_size", i32 16, !"air.arg_type_name", !"MDPDefaultLitUniforms", !"air.arg_name", !"uniforms", !"air.arg_unused"}
!37 = !{i32 0, i32 64, i32 0, !"float4x4", !"modelViewMatrix", i32 64, i32 64, i32 0, !"float4x4", !"projectionMatrix", i32 128, i32 48, i32 0, !"float3x3", !"normalMatrix"}
!38 = distinct !DISubprogram(name: "MDPDefaultLitFragmentFunc", scope: !8, file: !8, line: 59, type: !39, scopeLine: 61, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!39 = !DISubroutineType(types: !40)
!40 = !{}
!41 = !DILocation(line: 30, column: 5, scope: !42, inlinedAt: !43)
!42 = distinct !DISubprogram(name: "calcLighting", scope: !8, file: !8, line: 28, type: !39, scopeLine: 29, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!43 = distinct !DILocation(line: 62, column: 21, scope: !38)
!44 = !DILocation(line: 30, column: 18, scope: !42, inlinedAt: !43)
!45 = !DILocation(line: 37, column: 5, scope: !42, inlinedAt: !43)
!46 = !DILocation(line: 39, column: 37, scope: !42, inlinedAt: !43)
!47 = !{!48, !48, i64 0}
!48 = !{!"omnipotent char", !49, i64 0}
!49 = !{!"Simple C++ TBAA"}
!50 = !DILocation(line: 106, column: 10, scope: !51, inlinedAt: !53)
!51 = distinct !DISubprogram(name: "dot", scope: !52, file: !52, line: 104, type: !39, scopeLine: 105, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!52 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_geometric", directory: "")
!53 = distinct !DILocation(line: 110, column: 10, scope: !54, inlinedAt: !55)
!54 = distinct !DISubprogram(name: "length_squared", scope: !52, file: !52, line: 108, type: !39, scopeLine: 109, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!55 = distinct !DILocation(line: 214, column: 26, scope: !56, inlinedAt: !57)
!56 = distinct !DISubprogram(name: "normalize", scope: !52, file: !52, line: 212, type: !39, scopeLine: 213, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!57 = distinct !DILocation(line: 686, column: 12, scope: !58, inlinedAt: !59)
!58 = distinct !DISubprogram(name: "normalize", scope: !52, file: !52, line: 683, type: !39, scopeLine: 684, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!59 = distinct !DILocation(line: 39, column: 27, scope: !42, inlinedAt: !43)
!60 = !DILocation(line: 235, column: 10, scope: !61, inlinedAt: !63)
!61 = distinct !DISubprogram(name: "rsqrt", scope: !62, file: !62, line: 233, type: !39, scopeLine: 234, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!62 = !DIFile(filename: "/AppleInternal/Toolchains/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/metal/32023/lib/clang/32023.883/include/metal/metal_math", directory: "")
!63 = distinct !DILocation(line: 214, column: 14, scope: !56, inlinedAt: !57)
!64 = !DILocation(line: 214, column: 14, scope: !56, inlinedAt: !57)
!65 = !DILocation(line: 214, column: 12, scope: !56, inlinedAt: !57)
!66 = !DILocation(line: 106, column: 10, scope: !51, inlinedAt: !67)
!67 = distinct !DILocation(line: 40, column: 34, scope: !42, inlinedAt: !43)
!68 = !DILocation(line: 4751, column: 10, scope: !69, inlinedAt: !70)
!69 = distinct !DISubprogram(name: "max", scope: !62, file: !62, line: 4749, type: !39, scopeLine: 4750, flags: DIFlagPrototyped | DIFlagAllCallsDescribed, spFlags: DISPFlagDefinition | DISPFlagOptimized, unit: !0, retainedNodes: !40)
!70 = distinct !DILocation(line: 40, column: 25, scope: !42, inlinedAt: !43)
!71 = !DILocation(line: 41, column: 70, scope: !42, inlinedAt: !43)
!72 = !DILocation(line: 41, column: 68, scope: !42, inlinedAt: !43)
!73 = !DILocation(line: 41, column: 52, scope: !42, inlinedAt: !43)
!74 = !DILocation(line: 41, column: 35, scope: !42, inlinedAt: !43)
!75 = !DILocation(line: 41, column: 15, scope: !42, inlinedAt: !43)
!76 = !DILocation(line: 37, column: 29, scope: !42, inlinedAt: !43)
!77 = !DILocation(line: 37, column: 23, scope: !42, inlinedAt: !43)
!78 = distinct !{!78, !45, !79, !80}
!79 = !DILocation(line: 42, column: 5, scope: !42, inlinedAt: !43)
!80 = !{!"llvm.loop.mustprogress"}
!81 = !DILocation(line: 44, column: 12, scope: !42, inlinedAt: !43)
!82 = !DILocation(line: 45, column: 1, scope: !42, inlinedAt: !43)
!83 = !DILocation(line: 67, column: 1, scope: !38)

