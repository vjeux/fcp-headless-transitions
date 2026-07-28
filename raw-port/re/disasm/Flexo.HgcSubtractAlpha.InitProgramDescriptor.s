__ZNK16HgcSubtractAlpha21InitProgramDescriptorEP19HGProgramDescriptor:
000000000146df90	pushq	%rbp
000000000146df91	movq	%rsp, %rbp
000000000146df94	pushq	%r14
000000000146df96	pushq	%rbx
000000000146df97	subq	$0x80, %rsp
000000000146df9e	movq	%rsi, %rbx
000000000146dfa1	leaq	0x241b9e(%rip), %rsi            ## literal pool for: "HgcSubtractAlpha_hgc_visible"
000000000146dfa8	leaq	0x241bdd(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=00000001a2\n[[ visible ]] FragmentOut HgcSubtractAlpha_hgc_visible(const constant float4* hg_Params,\n    float4 color0,\n    float4 color1)\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1;\n    FragmentOut output;\n\n    r0.w = color0.w;\n    r1.w = color1.w;\n    r0 = r0.wwww - r1.wwww;\n    output.color0 = fmax(c0.xxxx, r0);\n    return output;\n}\n"
000000000146dfaf	movq	%rbx, %rdi
000000000146dfb2	callq	0x14966d8                       ## symbol stub for: __ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_
000000000146dfb7	leaq	0x241ba5(%rip), %rsi            ## literal pool for: "HgcSubtractAlpha"
000000000146dfbe	movq	%rbx, %rdi
000000000146dfc1	callq	0x14966d2                       ## symbol stub for: __ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc
000000000146dfc6	movl	$0x4, -0x90(%rbp)
000000000146dfd0	movb	$0x16, -0x88(%rbp)
000000000146dfd7	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
000000000146dfe1	movq	%rax, -0x87(%rbp)
000000000146dfe8	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
000000000146dfef	movb	$0x0, -0x7c(%rbp)
000000000146dff3	movaps	0x115526(%rip), %xmm0
000000000146dffa	movups	%xmm0, -0x70(%rbp)
000000000146dffe	leaq	-0x90(%rbp), %rsi
000000000146e005	movq	%rbx, %rdi
000000000146e008	callq	0x14966c6                       ## symbol stub for: __ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding
000000000146e00d	testb	$0x1, -0x88(%rbp)
000000000146e014	je	0x146e01f
000000000146e016	movq	-0x78(%rbp), %rdi
000000000146e01a	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146e01f	xorps	%xmm0, %xmm0
000000000146e022	movaps	%xmm0, -0x30(%rbp)
000000000146e026	movq	$0x0, -0x20(%rbp)
000000000146e02e	movl	$0x2, -0x60(%rbp)
000000000146e035	movb	$0xc, -0x58(%rbp)
000000000146e039	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000146e040	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000146e046	movb	$0x0, -0x51(%rbp)
000000000146e04a	movsd	0x11af9e(%rip), %xmm0
000000000146e052	movups	%xmm0, -0x40(%rbp)
000000000146e056	leaq	-0x30(%rbp), %rdi
000000000146e05a	leaq	-0x60(%rbp), %rsi
000000000146e05e	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000146e063	movq	%rax, -0x28(%rbp)
000000000146e067	testb	$0x1, -0x58(%rbp)
000000000146e06b	je	0x146e07a
000000000146e06d	movq	-0x48(%rbp), %rdi
000000000146e071	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146e076	movq	-0x28(%rbp), %rax
000000000146e07a	movl	$0xa, -0x60(%rbp)
000000000146e081	leaq	-0x58(%rbp), %r14
000000000146e085	movb	$0xc, -0x58(%rbp)
000000000146e089	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000146e090	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000146e096	movb	$0x0, -0x51(%rbp)
000000000146e09a	movaps	0x11547f(%rip), %xmm0
000000000146e0a1	movups	%xmm0, -0x40(%rbp)
000000000146e0a5	cmpq	-0x20(%rbp), %rax
000000000146e0a9	jae	0x146e0e3
000000000146e0ab	movl	$0xa, (%rax)
000000000146e0b1	movq	0x10(%r14), %rcx
000000000146e0b5	movq	%rcx, 0x18(%rax)
000000000146e0b9	movups	(%r14), %xmm0
000000000146e0bd	movups	%xmm0, 0x8(%rax)
000000000146e0c1	xorps	%xmm0, %xmm0
000000000146e0c4	movups	%xmm0, (%r14)
000000000146e0c8	movq	$0x0, 0x10(%r14)
000000000146e0d0	movups	0x18(%r14), %xmm0
000000000146e0d5	movups	%xmm0, 0x20(%rax)
000000000146e0d9	addq	$0x30, %rax
000000000146e0dd	movq	%rax, -0x28(%rbp)
000000000146e0e1	jmp	0x146e107
000000000146e0e3	leaq	-0x30(%rbp), %rdi
000000000146e0e7	leaq	-0x60(%rbp), %rsi
000000000146e0eb	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000146e0f0	testb	$0x1, -0x58(%rbp)
000000000146e0f4	movq	%rax, -0x28(%rbp)
000000000146e0f8	je	0x146e107
000000000146e0fa	movq	-0x48(%rbp), %rdi
000000000146e0fe	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146e103	movq	-0x28(%rbp), %rax
000000000146e107	movl	$0xa, -0x60(%rbp)
000000000146e10e	movb	$0xc, -0x58(%rbp)
000000000146e112	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000146e119	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000146e11f	movb	$0x0, -0x51(%rbp)
000000000146e123	movaps	0x1153f6(%rip), %xmm0
000000000146e12a	movups	%xmm0, -0x40(%rbp)
000000000146e12e	cmpq	-0x20(%rbp), %rax
000000000146e132	jae	0x146e16c
000000000146e134	movl	$0xa, (%rax)
000000000146e13a	movq	0x10(%r14), %rcx
000000000146e13e	movq	%rcx, 0x18(%rax)
000000000146e142	movups	(%r14), %xmm0
000000000146e146	movups	%xmm0, 0x8(%rax)
000000000146e14a	xorps	%xmm0, %xmm0
000000000146e14d	movups	%xmm0, (%r14)
000000000146e151	movq	$0x0, 0x10(%r14)
000000000146e159	movups	0x18(%r14), %xmm0
000000000146e15e	movups	%xmm0, 0x20(%rax)
000000000146e162	addq	$0x30, %rax
000000000146e166	movq	%rax, -0x28(%rbp)
000000000146e16a	jmp	0x146e18c
000000000146e16c	leaq	-0x30(%rbp), %rdi
000000000146e170	leaq	-0x60(%rbp), %rsi
000000000146e174	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000146e179	testb	$0x1, -0x58(%rbp)
000000000146e17d	movq	%rax, -0x28(%rbp)
000000000146e181	je	0x146e18c
000000000146e183	movq	-0x48(%rbp), %rdi
000000000146e187	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146e18c	leaq	-0x30(%rbp), %rsi
000000000146e190	movq	%rbx, %rdi
000000000146e193	callq	0x14966cc                       ## symbol stub for: __ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE
000000000146e198	movq	-0x30(%rbp), %rbx
000000000146e19c	testq	%rbx, %rbx
000000000146e19f	je	0x146e1d8
000000000146e1a1	movq	-0x28(%rbp), %r14
000000000146e1a5	movq	%rbx, %rdi
000000000146e1a8	cmpq	%r14, %rbx
000000000146e1ab	jne	0x146e1b9
000000000146e1ad	jmp	0x146e1cf
000000000146e1af	nop
000000000146e1b0	addq	$-0x30, %r14
000000000146e1b4	cmpq	%rbx, %r14
000000000146e1b7	je	0x146e1cb
000000000146e1b9	testb	$0x1, -0x28(%r14)
000000000146e1be	je	0x146e1b0
000000000146e1c0	movq	-0x18(%r14), %rdi
000000000146e1c4	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146e1c9	jmp	0x146e1b0
000000000146e1cb	movq	-0x30(%rbp), %rdi
000000000146e1cf	movq	%rbx, -0x28(%rbp)
000000000146e1d3	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146e1d8	addq	$0x80, %rsp
000000000146e1df	popq	%rbx
000000000146e1e0	popq	%r14
000000000146e1e2	popq	%rbp
000000000146e1e3	retq
000000000146e1e4	jmp	0x146e1ed
000000000146e1e6	jmp	0x146e1ed
000000000146e1e8	movq	%rax, %rbx
000000000146e1eb	jmp	0x146e1ff
000000000146e1ed	movq	%rax, %rbx
000000000146e1f0	testb	$0x1, -0x58(%rbp)
000000000146e1f4	je	0x146e1ff
000000000146e1f6	movq	-0x48(%rbp), %rdi
000000000146e1fa	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146e1ff	leaq	-0x30(%rbp), %rdi
000000000146e203	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
000000000146e208	movq	%rbx, %rdi
000000000146e20b	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000146e210	movq	%rax, %rbx
000000000146e213	testb	$0x1, -0x88(%rbp)
000000000146e21a	je	0x146e208
000000000146e21c	movq	-0x78(%rbp), %rdi
000000000146e220	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146e225	movq	%rbx, %rdi
000000000146e228	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000146e22d	nopl	(%rax)
