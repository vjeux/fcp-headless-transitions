__ZNK31HgcBilateralFilterInterp_Divide21InitProgramDescriptorEP19HGProgramDescriptor:
000000000031a360	pushq	%rbp
000000000031a361	movq	%rsp, %rbp
000000000031a364	pushq	%r14
000000000031a366	pushq	%rbx
000000000031a367	subq	$0x80, %rsp
000000000031a36e	movq	%rsi, %rbx
000000000031a371	leaq	0x67c4b9(%rip), %rsi            ## literal pool for: "HgcBilateralFilterInterp_Divide_hgc_visible"
000000000031a378	leaq	0x67c525(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=000000020f\n[[ visible ]] FragmentOut HgcBilateralFilterInterp_Divide_hgc_visible(const constant float4* hg_Params,\n    float4 color0,\n    float4 color1)\n{\n    const float4 c0 = float4(1.844674407e+19, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1;\n    FragmentOut output;\n\n    r0 = color0;\n    r1 = color1;\n    r1 = fmin(r1, c0.xxxx);\n    r1 = fmax(r1, -c0.xxxx);\n    r1 = 1.00000f / r1;\n    r1 = fmin(r1, c0.xxxx);\n    r1 = fmax(r1, -c0.xxxx);\n    output.color0 = r0*r1;\n    return output;\n}\n"
000000000031a37f	movq	%rbx, %rdi
000000000031a382	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
000000000031a387	leaq	0x67c4cf(%rip), %rsi            ## literal pool for: "HgcBilateralFilterInterp_Divide"
000000000031a38e	movq	%rbx, %rdi
000000000031a391	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
000000000031a396	movl	$0x4, -0x90(%rbp)
000000000031a3a0	movb	$0x16, -0x88(%rbp)
000000000031a3a7	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
000000000031a3b1	movq	%rax, -0x87(%rbp)
000000000031a3b8	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
000000000031a3bf	movb	$0x0, -0x7c(%rbp)
000000000031a3c3	movaps	0xb0cc6(%rip), %xmm0
000000000031a3ca	movups	%xmm0, -0x70(%rbp)
000000000031a3ce	leaq	-0x90(%rbp), %rsi
000000000031a3d5	movq	%rbx, %rdi
000000000031a3d8	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
000000000031a3dd	testb	$0x1, -0x88(%rbp)
000000000031a3e4	je	0x31a3ef
000000000031a3e6	movq	-0x78(%rbp), %rdi
000000000031a3ea	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000031a3ef	xorps	%xmm0, %xmm0
000000000031a3f2	movaps	%xmm0, -0x30(%rbp)
000000000031a3f6	movq	$0x0, -0x20(%rbp)
000000000031a3fe	movl	$0x2, -0x60(%rbp)
000000000031a405	movb	$0xc, -0x58(%rbp)
000000000031a409	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000031a410	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000031a416	movb	$0x0, -0x51(%rbp)
000000000031a41a	movsd	0x57239e(%rip), %xmm0
000000000031a422	movups	%xmm0, -0x40(%rbp)
000000000031a426	leaq	-0x30(%rbp), %rdi
000000000031a42a	leaq	-0x60(%rbp), %rsi
000000000031a42e	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000031a433	movq	%rax, -0x28(%rbp)
000000000031a437	testb	$0x1, -0x58(%rbp)
000000000031a43b	je	0x31a44a
000000000031a43d	movq	-0x48(%rbp), %rdi
000000000031a441	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000031a446	movq	-0x28(%rbp), %rax
000000000031a44a	movl	$0xa, -0x60(%rbp)
000000000031a451	leaq	-0x58(%rbp), %r14
000000000031a455	movb	$0xc, -0x58(%rbp)
000000000031a459	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000031a460	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000031a466	movb	$0x0, -0x51(%rbp)
000000000031a46a	movaps	0xb0c1f(%rip), %xmm0
000000000031a471	movups	%xmm0, -0x40(%rbp)
000000000031a475	cmpq	-0x20(%rbp), %rax
000000000031a479	jae	0x31a4b3
000000000031a47b	movl	$0xa, (%rax)
000000000031a481	movq	0x10(%r14), %rcx
000000000031a485	movq	%rcx, 0x18(%rax)
000000000031a489	movups	(%r14), %xmm0
000000000031a48d	movups	%xmm0, 0x8(%rax)
000000000031a491	xorps	%xmm0, %xmm0
000000000031a494	movups	%xmm0, (%r14)
000000000031a498	movq	$0x0, 0x10(%r14)
000000000031a4a0	movups	0x18(%r14), %xmm0
000000000031a4a5	movups	%xmm0, 0x20(%rax)
000000000031a4a9	addq	$0x30, %rax
000000000031a4ad	movq	%rax, -0x28(%rbp)
000000000031a4b1	jmp	0x31a4d7
000000000031a4b3	leaq	-0x30(%rbp), %rdi
000000000031a4b7	leaq	-0x60(%rbp), %rsi
000000000031a4bb	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000031a4c0	testb	$0x1, -0x58(%rbp)
000000000031a4c4	movq	%rax, -0x28(%rbp)
000000000031a4c8	je	0x31a4d7
000000000031a4ca	movq	-0x48(%rbp), %rdi
000000000031a4ce	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000031a4d3	movq	-0x28(%rbp), %rax
000000000031a4d7	movl	$0xa, -0x60(%rbp)
000000000031a4de	movb	$0xc, -0x58(%rbp)
000000000031a4e2	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000031a4e9	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000031a4ef	movb	$0x0, -0x51(%rbp)
000000000031a4f3	movaps	0xb0b96(%rip), %xmm0
000000000031a4fa	movups	%xmm0, -0x40(%rbp)
000000000031a4fe	cmpq	-0x20(%rbp), %rax
000000000031a502	jae	0x31a53c
000000000031a504	movl	$0xa, (%rax)
000000000031a50a	movq	0x10(%r14), %rcx
000000000031a50e	movq	%rcx, 0x18(%rax)
000000000031a512	movups	(%r14), %xmm0
000000000031a516	movups	%xmm0, 0x8(%rax)
000000000031a51a	xorps	%xmm0, %xmm0
000000000031a51d	movups	%xmm0, (%r14)
000000000031a521	movq	$0x0, 0x10(%r14)
000000000031a529	movups	0x18(%r14), %xmm0
000000000031a52e	movups	%xmm0, 0x20(%rax)
000000000031a532	addq	$0x30, %rax
000000000031a536	movq	%rax, -0x28(%rbp)
000000000031a53a	jmp	0x31a55c
000000000031a53c	leaq	-0x30(%rbp), %rdi
000000000031a540	leaq	-0x60(%rbp), %rsi
000000000031a544	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000031a549	testb	$0x1, -0x58(%rbp)
000000000031a54d	movq	%rax, -0x28(%rbp)
000000000031a551	je	0x31a55c
000000000031a553	movq	-0x48(%rbp), %rdi
000000000031a557	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000031a55c	leaq	-0x30(%rbp), %rsi
000000000031a560	movq	%rbx, %rdi
000000000031a563	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
000000000031a568	movq	-0x30(%rbp), %rbx
000000000031a56c	testq	%rbx, %rbx
000000000031a56f	je	0x31a5a8
000000000031a571	movq	-0x28(%rbp), %r14
000000000031a575	movq	%rbx, %rdi
000000000031a578	cmpq	%r14, %rbx
000000000031a57b	jne	0x31a589
000000000031a57d	jmp	0x31a59f
000000000031a57f	nop
000000000031a580	addq	$-0x30, %r14
000000000031a584	cmpq	%rbx, %r14
000000000031a587	je	0x31a59b
000000000031a589	testb	$0x1, -0x28(%r14)
000000000031a58e	je	0x31a580
000000000031a590	movq	-0x18(%r14), %rdi
000000000031a594	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000031a599	jmp	0x31a580
000000000031a59b	movq	-0x30(%rbp), %rdi
000000000031a59f	movq	%rbx, -0x28(%rbp)
000000000031a5a3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000031a5a8	addq	$0x80, %rsp
000000000031a5af	popq	%rbx
000000000031a5b0	popq	%r14
000000000031a5b2	popq	%rbp
000000000031a5b3	retq
000000000031a5b4	jmp	0x31a5bd
000000000031a5b6	jmp	0x31a5bd
000000000031a5b8	movq	%rax, %rbx
000000000031a5bb	jmp	0x31a5cf
000000000031a5bd	movq	%rax, %rbx
000000000031a5c0	testb	$0x1, -0x58(%rbp)
000000000031a5c4	je	0x31a5cf
000000000031a5c6	movq	-0x48(%rbp), %rdi
000000000031a5ca	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000031a5cf	leaq	-0x30(%rbp), %rdi
000000000031a5d3	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
000000000031a5d8	movq	%rbx, %rdi
000000000031a5db	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000031a5e0	movq	%rax, %rbx
000000000031a5e3	testb	$0x1, -0x88(%rbp)
000000000031a5ea	je	0x31a5d8
000000000031a5ec	movq	-0x78(%rbp), %rdi
000000000031a5f0	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000031a5f5	movq	%rbx, %rdi
000000000031a5f8	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000031a5fd	nopl	(%rax)
