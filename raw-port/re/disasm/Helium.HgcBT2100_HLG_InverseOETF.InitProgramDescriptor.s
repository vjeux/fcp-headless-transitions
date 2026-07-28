__ZNK25HgcBT2100_HLG_InverseOETF21InitProgramDescriptorEP19HGProgramDescriptor:
00000000003b1320	pushq	%rbp
00000000003b1321	movq	%rsp, %rbp
00000000003b1324	pushq	%r14
00000000003b1326	pushq	%rbx
00000000003b1327	subq	$0x80, %rsp
00000000003b132e	movq	%rsi, %rbx
00000000003b1331	leaq	0x62d1eb(%rip), %rsi            ## literal pool for: "HgcBT2100_HLG_InverseOETF_hgc_visible"
00000000003b1338	leaq	0x62d245(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=00000002ea\n[[ visible ]] FragmentOut HgcBT2100_HLG_InverseOETF_hgc_visible(const constant float4* hg_Params,\n    float4 color0)\n{\n    const float4 c0 = float4(0.000000000, 0.004999999888, 0.000000000, 0.000000000);\n    float4 r0, r1, r2;\n    FragmentOut output;\n\n    r0 = color0;\n    r1.xyz = fmax(r0.xyz, c0.xxx);\n    r0.xyz = r1.xyz*hg_Params[1].xxx + hg_Params[1].yyy;\n    r2.xyz = r1.xyz*r1.xyz;\n    r1.w = float(r0.w >= c0.y);\n    r2.xyz = r2.xyz*hg_Params[0].yyy;\n    r0.xyz = exp2(r0.xyz);\n    r0.xyz = r0.xyz*hg_Params[1].zzz + hg_Params[1].www;\n    r1.xyz = float3(hg_Params[0].xxx < r1.xyz);\n    output.color0.xyz = select(r2.xyz, r0.xyz, -r1.xyz < 0.00000f);\n    output.color0.w = r1.w*r0.w;\n    return output;\n}\n"
00000000003b133f	movq	%rbx, %rdi
00000000003b1342	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
00000000003b1347	leaq	0x62d1fb(%rip), %rsi            ## literal pool for: "HgcBT2100_HLG_InverseOETF"
00000000003b134e	movq	%rbx, %rdi
00000000003b1351	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
00000000003b1356	movl	$0x4, -0x90(%rbp)
00000000003b1360	movb	$0x16, -0x88(%rbp)
00000000003b1367	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
00000000003b1371	movq	%rax, -0x87(%rbp)
00000000003b1378	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
00000000003b137f	movb	$0x0, -0x7c(%rbp)
00000000003b1383	movaps	0x19d06(%rip), %xmm0
00000000003b138a	movups	%xmm0, -0x70(%rbp)
00000000003b138e	leaq	-0x90(%rbp), %rsi
00000000003b1395	movq	%rbx, %rdi
00000000003b1398	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
00000000003b139d	testb	$0x1, -0x88(%rbp)
00000000003b13a4	je	0x3b13af
00000000003b13a6	movq	-0x78(%rbp), %rdi
00000000003b13aa	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b13af	xorps	%xmm0, %xmm0
00000000003b13b2	movaps	%xmm0, -0x30(%rbp)
00000000003b13b6	movq	$0x0, -0x20(%rbp)
00000000003b13be	movl	$0x2, -0x60(%rbp)
00000000003b13c5	movb	$0xc, -0x58(%rbp)
00000000003b13c9	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
00000000003b13d0	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
00000000003b13d6	movb	$0x0, -0x51(%rbp)
00000000003b13da	movaps	0x4db3ef(%rip), %xmm0
00000000003b13e1	movups	%xmm0, -0x40(%rbp)
00000000003b13e5	leaq	-0x30(%rbp), %rdi
00000000003b13e9	leaq	-0x60(%rbp), %rsi
00000000003b13ed	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000003b13f2	movq	%rax, -0x28(%rbp)
00000000003b13f6	testb	$0x1, -0x58(%rbp)
00000000003b13fa	je	0x3b1409
00000000003b13fc	movq	-0x48(%rbp), %rdi
00000000003b1400	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b1405	movq	-0x28(%rbp), %rax
00000000003b1409	movl	$0xa, -0x60(%rbp)
00000000003b1410	movb	$0xc, -0x58(%rbp)
00000000003b1414	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
00000000003b141b	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
00000000003b1421	movb	$0x0, -0x51(%rbp)
00000000003b1425	movaps	0x19c64(%rip), %xmm0
00000000003b142c	movups	%xmm0, -0x40(%rbp)
00000000003b1430	cmpq	-0x20(%rbp), %rax
00000000003b1434	jae	0x3b146f
00000000003b1436	leaq	-0x58(%rbp), %rcx
00000000003b143a	movl	$0xa, (%rax)
00000000003b1440	movq	0x10(%rcx), %rdx
00000000003b1444	movq	%rdx, 0x18(%rax)
00000000003b1448	movups	(%rcx), %xmm0
00000000003b144b	movups	%xmm0, 0x8(%rax)
00000000003b144f	xorps	%xmm0, %xmm0
00000000003b1452	movups	%xmm0, (%rcx)
00000000003b1455	movq	$0x0, 0x10(%rcx)
00000000003b145d	movups	0x18(%rcx), %xmm0
00000000003b1461	movups	%xmm0, 0x20(%rax)
00000000003b1465	addq	$0x30, %rax
00000000003b1469	movq	%rax, -0x28(%rbp)
00000000003b146d	jmp	0x3b148f
00000000003b146f	leaq	-0x30(%rbp), %rdi
00000000003b1473	leaq	-0x60(%rbp), %rsi
00000000003b1477	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000003b147c	testb	$0x1, -0x58(%rbp)
00000000003b1480	movq	%rax, -0x28(%rbp)
00000000003b1484	je	0x3b148f
00000000003b1486	movq	-0x48(%rbp), %rdi
00000000003b148a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b148f	leaq	-0x30(%rbp), %rsi
00000000003b1493	movq	%rbx, %rdi
00000000003b1496	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
00000000003b149b	movq	-0x30(%rbp), %rbx
00000000003b149f	testq	%rbx, %rbx
00000000003b14a2	je	0x3b14e8
00000000003b14a4	movq	-0x28(%rbp), %r14
00000000003b14a8	movq	%rbx, %rdi
00000000003b14ab	cmpq	%r14, %rbx
00000000003b14ae	jne	0x3b14c9
00000000003b14b0	jmp	0x3b14df
00000000003b14b2	nopw	%cs:(%rax,%rax)
00000000003b14c0	addq	$-0x30, %r14
00000000003b14c4	cmpq	%rbx, %r14
00000000003b14c7	je	0x3b14db
00000000003b14c9	testb	$0x1, -0x28(%r14)
00000000003b14ce	je	0x3b14c0
00000000003b14d0	movq	-0x18(%r14), %rdi
00000000003b14d4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b14d9	jmp	0x3b14c0
00000000003b14db	movq	-0x30(%rbp), %rdi
00000000003b14df	movq	%rbx, -0x28(%rbp)
00000000003b14e3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b14e8	addq	$0x80, %rsp
00000000003b14ef	popq	%rbx
00000000003b14f0	popq	%r14
00000000003b14f2	popq	%rbp
00000000003b14f3	retq
00000000003b14f4	jmp	0x3b14fb
00000000003b14f6	movq	%rax, %rbx
00000000003b14f9	jmp	0x3b150d
00000000003b14fb	movq	%rax, %rbx
00000000003b14fe	testb	$0x1, -0x58(%rbp)
00000000003b1502	je	0x3b150d
00000000003b1504	movq	-0x48(%rbp), %rdi
00000000003b1508	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b150d	leaq	-0x30(%rbp), %rdi
00000000003b1511	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
00000000003b1516	movq	%rbx, %rdi
00000000003b1519	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000003b151e	movq	%rax, %rbx
00000000003b1521	testb	$0x1, -0x88(%rbp)
00000000003b1528	je	0x3b1516
00000000003b152a	movq	-0x78(%rbp), %rdi
00000000003b152e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b1533	movq	%rbx, %rdi
00000000003b1536	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000003b153b	nopl	(%rax,%rax)
