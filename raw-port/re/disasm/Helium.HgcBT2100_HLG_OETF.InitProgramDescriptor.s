__ZNK18HgcBT2100_HLG_OETF21InitProgramDescriptorEP19HGProgramDescriptor:
00000000003b0170	pushq	%rbp
00000000003b0171	movq	%rsp, %rbp
00000000003b0174	pushq	%r14
00000000003b0176	pushq	%rbx
00000000003b0177	subq	$0x80, %rsp
00000000003b017e	movq	%rsi, %rbx
00000000003b0181	leaq	0x62dc46(%rip), %rsi            ## literal pool for: "HgcBT2100_HLG_OETF_hgc_visible"
00000000003b0188	leaq	0x62dc8b(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=0000000300\n[[ visible ]] FragmentOut HgcBT2100_HLG_OETF_hgc_visible(const constant float4* hg_Params,\n    float4 color0)\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2;\n    FragmentOut output;\n\n    r0 = color0;\n    r1.xyz = fmax(r0.xyz, c0.xxx);\n    r2.xyz = fmax(r0.xyz, hg_Params[0].xxx);\n    r2.xyz = r2.xyz - hg_Params[1].zzz;\n    r1.x = sqrt(r1.x);\n    r1.z = sqrt(r1.z);\n    r1.y = sqrt(r1.y);\n    r1.xyz = r1.xyz*hg_Params[1].xxx;\n    r2.xyz = log2(r2.xyz);\n    r2.xyz = r2.xyz*hg_Params[1].yyy + hg_Params[1].www;\n    r0.xyz = float3(hg_Params[0].xxx < r0.xyz);\n    output.color0.xyz = select(r1.xyz, r2.xyz, -r0.xyz < 0.00000f);\n    output.color0.w = r0.w;\n    return output;\n}\n"
00000000003b018f	movq	%rbx, %rdi
00000000003b0192	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
00000000003b0197	leaq	0x62dc4f(%rip), %rsi            ## literal pool for: "HgcBT2100_HLG_OETF"
00000000003b019e	movq	%rbx, %rdi
00000000003b01a1	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
00000000003b01a6	movl	$0x4, -0x90(%rbp)
00000000003b01b0	movb	$0x16, -0x88(%rbp)
00000000003b01b7	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
00000000003b01c1	movq	%rax, -0x87(%rbp)
00000000003b01c8	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
00000000003b01cf	movb	$0x0, -0x7c(%rbp)
00000000003b01d3	movaps	0x1aeb6(%rip), %xmm0
00000000003b01da	movups	%xmm0, -0x70(%rbp)
00000000003b01de	leaq	-0x90(%rbp), %rsi
00000000003b01e5	movq	%rbx, %rdi
00000000003b01e8	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
00000000003b01ed	testb	$0x1, -0x88(%rbp)
00000000003b01f4	je	0x3b01ff
00000000003b01f6	movq	-0x78(%rbp), %rdi
00000000003b01fa	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b01ff	xorps	%xmm0, %xmm0
00000000003b0202	movaps	%xmm0, -0x30(%rbp)
00000000003b0206	movq	$0x0, -0x20(%rbp)
00000000003b020e	movl	$0x2, -0x60(%rbp)
00000000003b0215	movb	$0xc, -0x58(%rbp)
00000000003b0219	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
00000000003b0220	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
00000000003b0226	movb	$0x0, -0x51(%rbp)
00000000003b022a	movaps	0x4dc59f(%rip), %xmm0
00000000003b0231	movups	%xmm0, -0x40(%rbp)
00000000003b0235	leaq	-0x30(%rbp), %rdi
00000000003b0239	leaq	-0x60(%rbp), %rsi
00000000003b023d	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000003b0242	movq	%rax, -0x28(%rbp)
00000000003b0246	testb	$0x1, -0x58(%rbp)
00000000003b024a	je	0x3b0259
00000000003b024c	movq	-0x48(%rbp), %rdi
00000000003b0250	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b0255	movq	-0x28(%rbp), %rax
00000000003b0259	movl	$0xa, -0x60(%rbp)
00000000003b0260	movb	$0xc, -0x58(%rbp)
00000000003b0264	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
00000000003b026b	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
00000000003b0271	movb	$0x0, -0x51(%rbp)
00000000003b0275	movaps	0x1ae14(%rip), %xmm0
00000000003b027c	movups	%xmm0, -0x40(%rbp)
00000000003b0280	cmpq	-0x20(%rbp), %rax
00000000003b0284	jae	0x3b02bf
00000000003b0286	leaq	-0x58(%rbp), %rcx
00000000003b028a	movl	$0xa, (%rax)
00000000003b0290	movq	0x10(%rcx), %rdx
00000000003b0294	movq	%rdx, 0x18(%rax)
00000000003b0298	movups	(%rcx), %xmm0
00000000003b029b	movups	%xmm0, 0x8(%rax)
00000000003b029f	xorps	%xmm0, %xmm0
00000000003b02a2	movups	%xmm0, (%rcx)
00000000003b02a5	movq	$0x0, 0x10(%rcx)
00000000003b02ad	movups	0x18(%rcx), %xmm0
00000000003b02b1	movups	%xmm0, 0x20(%rax)
00000000003b02b5	addq	$0x30, %rax
00000000003b02b9	movq	%rax, -0x28(%rbp)
00000000003b02bd	jmp	0x3b02df
00000000003b02bf	leaq	-0x30(%rbp), %rdi
00000000003b02c3	leaq	-0x60(%rbp), %rsi
00000000003b02c7	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000003b02cc	testb	$0x1, -0x58(%rbp)
00000000003b02d0	movq	%rax, -0x28(%rbp)
00000000003b02d4	je	0x3b02df
00000000003b02d6	movq	-0x48(%rbp), %rdi
00000000003b02da	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b02df	leaq	-0x30(%rbp), %rsi
00000000003b02e3	movq	%rbx, %rdi
00000000003b02e6	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
00000000003b02eb	movq	-0x30(%rbp), %rbx
00000000003b02ef	testq	%rbx, %rbx
00000000003b02f2	je	0x3b0338
00000000003b02f4	movq	-0x28(%rbp), %r14
00000000003b02f8	movq	%rbx, %rdi
00000000003b02fb	cmpq	%r14, %rbx
00000000003b02fe	jne	0x3b0319
00000000003b0300	jmp	0x3b032f
00000000003b0302	nopw	%cs:(%rax,%rax)
00000000003b0310	addq	$-0x30, %r14
00000000003b0314	cmpq	%rbx, %r14
00000000003b0317	je	0x3b032b
00000000003b0319	testb	$0x1, -0x28(%r14)
00000000003b031e	je	0x3b0310
00000000003b0320	movq	-0x18(%r14), %rdi
00000000003b0324	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b0329	jmp	0x3b0310
00000000003b032b	movq	-0x30(%rbp), %rdi
00000000003b032f	movq	%rbx, -0x28(%rbp)
00000000003b0333	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b0338	addq	$0x80, %rsp
00000000003b033f	popq	%rbx
00000000003b0340	popq	%r14
00000000003b0342	popq	%rbp
00000000003b0343	retq
00000000003b0344	jmp	0x3b034b
00000000003b0346	movq	%rax, %rbx
00000000003b0349	jmp	0x3b035d
00000000003b034b	movq	%rax, %rbx
00000000003b034e	testb	$0x1, -0x58(%rbp)
00000000003b0352	je	0x3b035d
00000000003b0354	movq	-0x48(%rbp), %rdi
00000000003b0358	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b035d	leaq	-0x30(%rbp), %rdi
00000000003b0361	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
00000000003b0366	movq	%rbx, %rdi
00000000003b0369	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000003b036e	movq	%rax, %rbx
00000000003b0371	testb	$0x1, -0x88(%rbp)
00000000003b0378	je	0x3b0366
00000000003b037a	movq	-0x78(%rbp), %rdi
00000000003b037e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003b0383	movq	%rbx, %rdi
00000000003b0386	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000003b038b	nopl	(%rax,%rax)
