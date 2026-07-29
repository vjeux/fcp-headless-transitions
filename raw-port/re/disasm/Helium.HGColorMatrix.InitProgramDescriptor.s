__ZNK13HGColorMatrix21InitProgramDescriptorEP19HGProgramDescriptor:
0000000000246590	pushq	%rbp
0000000000246591	movq	%rsp, %rbp
0000000000246594	pushq	%r14
0000000000246596	pushq	%rbx
0000000000246597	subq	$0x80, %rsp
000000000024659e	movq	%rsi, %rbx
00000000002465a1	leaq	0x6e31dd(%rip), %rsi            ## literal pool for: "HGColorMatrix_hgc_visible"
00000000002465a8	leaq	0x6e31fe(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=000000018e\n[[ visible ]] FragmentOut HGColorMatrix_hgc_visible(const constant float4* hg_Params,\n    float4 color0)\n{\n    float4 r0;\n    FragmentOut output;\n\n    r0 = color0;\n    output.color0.x = dot(hg_Params[0], r0);\n    output.color0.y = dot(hg_Params[1], r0);\n    output.color0.z = dot(hg_Params[2], r0);\n    output.color0.w = dot(hg_Params[3], r0);\n    return output;\n}\n"
00000000002465af	movq	%rbx, %rdi
00000000002465b2	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
00000000002465b7	leaq	0x6e31e1(%rip), %rsi            ## literal pool for: "HGColorMatrix"
00000000002465be	movq	%rbx, %rdi
00000000002465c1	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
00000000002465c6	movl	$0x4, -0x90(%rbp)
00000000002465d0	movb	$0x16, -0x88(%rbp)
00000000002465d7	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
00000000002465e1	movq	%rax, -0x87(%rbp)
00000000002465e8	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
00000000002465ef	movb	$0x0, -0x7c(%rbp)
00000000002465f3	movaps	0x184a96(%rip), %xmm0
00000000002465fa	movups	%xmm0, -0x70(%rbp)
00000000002465fe	leaq	-0x90(%rbp), %rsi
0000000000246605	movq	%rbx, %rdi
0000000000246608	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
000000000024660d	testb	$0x1, -0x88(%rbp)
0000000000246614	je	0x24661f
0000000000246616	movq	-0x78(%rbp), %rdi
000000000024661a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000024661f	xorps	%xmm0, %xmm0
0000000000246622	movaps	%xmm0, -0x30(%rbp)
0000000000246626	movq	$0x0, -0x20(%rbp)
000000000024662e	movl	$0x2, -0x60(%rbp)
0000000000246635	movb	$0xc, -0x58(%rbp)
0000000000246639	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
0000000000246640	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000000246646	movb	$0x0, -0x51(%rbp)
000000000024664a	movaps	0x6461ff(%rip), %xmm0
0000000000246651	movups	%xmm0, -0x40(%rbp)
0000000000246655	leaq	-0x30(%rbp), %rdi
0000000000246659	leaq	-0x60(%rbp), %rsi
000000000024665d	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000246662	movq	%rax, -0x28(%rbp)
0000000000246666	testb	$0x1, -0x58(%rbp)
000000000024666a	je	0x246679
000000000024666c	movq	-0x48(%rbp), %rdi
0000000000246670	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000246675	movq	-0x28(%rbp), %rax
0000000000246679	movl	$0xa, -0x60(%rbp)
0000000000246680	movb	$0xc, -0x58(%rbp)
0000000000246684	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000024668b	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000000246691	movb	$0x0, -0x51(%rbp)
0000000000246695	movaps	0x1849f4(%rip), %xmm0
000000000024669c	movups	%xmm0, -0x40(%rbp)
00000000002466a0	cmpq	-0x20(%rbp), %rax
00000000002466a4	jae	0x2466df
00000000002466a6	leaq	-0x58(%rbp), %rcx
00000000002466aa	movl	$0xa, (%rax)
00000000002466b0	movq	0x10(%rcx), %rdx
00000000002466b4	movq	%rdx, 0x18(%rax)
00000000002466b8	movups	(%rcx), %xmm0
00000000002466bb	movups	%xmm0, 0x8(%rax)
00000000002466bf	xorps	%xmm0, %xmm0
00000000002466c2	movups	%xmm0, (%rcx)
00000000002466c5	movq	$0x0, 0x10(%rcx)
00000000002466cd	movups	0x18(%rcx), %xmm0
00000000002466d1	movups	%xmm0, 0x20(%rax)
00000000002466d5	addq	$0x30, %rax
00000000002466d9	movq	%rax, -0x28(%rbp)
00000000002466dd	jmp	0x2466ff
00000000002466df	leaq	-0x30(%rbp), %rdi
00000000002466e3	leaq	-0x60(%rbp), %rsi
00000000002466e7	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000002466ec	testb	$0x1, -0x58(%rbp)
00000000002466f0	movq	%rax, -0x28(%rbp)
00000000002466f4	je	0x2466ff
00000000002466f6	movq	-0x48(%rbp), %rdi
00000000002466fa	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002466ff	leaq	-0x30(%rbp), %rsi
0000000000246703	movq	%rbx, %rdi
0000000000246706	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
000000000024670b	movq	-0x30(%rbp), %rbx
000000000024670f	testq	%rbx, %rbx
0000000000246712	je	0x246758
0000000000246714	movq	-0x28(%rbp), %r14
0000000000246718	movq	%rbx, %rdi
000000000024671b	cmpq	%r14, %rbx
000000000024671e	jne	0x246739
0000000000246720	jmp	0x24674f
0000000000246722	nopw	%cs:(%rax,%rax)
0000000000246730	addq	$-0x30, %r14
0000000000246734	cmpq	%rbx, %r14
0000000000246737	je	0x24674b
0000000000246739	testb	$0x1, -0x28(%r14)
000000000024673e	je	0x246730
0000000000246740	movq	-0x18(%r14), %rdi
0000000000246744	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000246749	jmp	0x246730
000000000024674b	movq	-0x30(%rbp), %rdi
000000000024674f	movq	%rbx, -0x28(%rbp)
0000000000246753	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000246758	addq	$0x80, %rsp
000000000024675f	popq	%rbx
0000000000246760	popq	%r14
0000000000246762	popq	%rbp
0000000000246763	retq
0000000000246764	jmp	0x24676b
0000000000246766	movq	%rax, %rbx
0000000000246769	jmp	0x24677d
000000000024676b	movq	%rax, %rbx
000000000024676e	testb	$0x1, -0x58(%rbp)
0000000000246772	je	0x24677d
0000000000246774	movq	-0x48(%rbp), %rdi
0000000000246778	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000024677d	leaq	-0x30(%rbp), %rdi
0000000000246781	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
0000000000246786	movq	%rbx, %rdi
0000000000246789	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000024678e	movq	%rax, %rbx
0000000000246791	testb	$0x1, -0x88(%rbp)
0000000000246798	je	0x246786
000000000024679a	movq	-0x78(%rbp), %rdi
000000000024679e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002467a3	movq	%rbx, %rdi
00000000002467a6	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000002467ab	nopl	(%rax,%rax)
