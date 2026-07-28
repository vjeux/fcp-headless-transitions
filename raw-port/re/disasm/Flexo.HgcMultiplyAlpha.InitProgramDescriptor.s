__ZNK16HgcMultiplyAlpha21InitProgramDescriptorEP19HGProgramDescriptor:
00000000014689d0	pushq	%rbp
00000000014689d1	movq	%rsp, %rbp
00000000014689d4	pushq	%r14
00000000014689d6	pushq	%rbx
00000000014689d7	subq	$0x80, %rsp
00000000014689de	movq	%rsi, %rbx
00000000014689e1	leaq	0x244344(%rip), %rsi            ## literal pool for: "HgcMultiplyAlpha_hgc_visible"
00000000014689e8	leaq	0x244383(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=0000000132\n[[ visible ]] FragmentOut HgcMultiplyAlpha_hgc_visible(const constant float4* hg_Params,\n    float4 color0,\n    float4 color1)\n{\n    float4 r0, r1;\n    FragmentOut output;\n\n    r0.w = color0.w;\n    r1.w = color1.w;\n    output.color0 = r0.wwww*r1.wwww;\n    return output;\n}\n"
00000000014689ef	movq	%rbx, %rdi
00000000014689f2	callq	0x14966d8                       ## symbol stub for: __ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_
00000000014689f7	leaq	0x24434b(%rip), %rsi            ## literal pool for: "HgcMultiplyAlpha"
00000000014689fe	movq	%rbx, %rdi
0000000001468a01	callq	0x14966d2                       ## symbol stub for: __ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc
0000000001468a06	movl	$0x4, -0x90(%rbp)
0000000001468a10	movb	$0x16, -0x88(%rbp)
0000000001468a17	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
0000000001468a21	movq	%rax, -0x87(%rbp)
0000000001468a28	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
0000000001468a2f	movb	$0x0, -0x7c(%rbp)
0000000001468a33	movaps	0x11aae6(%rip), %xmm0
0000000001468a3a	movups	%xmm0, -0x70(%rbp)
0000000001468a3e	leaq	-0x90(%rbp), %rsi
0000000001468a45	movq	%rbx, %rdi
0000000001468a48	callq	0x14966c6                       ## symbol stub for: __ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding
0000000001468a4d	testb	$0x1, -0x88(%rbp)
0000000001468a54	je	0x1468a5f
0000000001468a56	movq	-0x78(%rbp), %rdi
0000000001468a5a	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001468a5f	xorps	%xmm0, %xmm0
0000000001468a62	movaps	%xmm0, -0x30(%rbp)
0000000001468a66	movq	$0x0, -0x20(%rbp)
0000000001468a6e	movl	$0x2, -0x60(%rbp)
0000000001468a75	movb	$0xc, -0x58(%rbp)
0000000001468a79	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
0000000001468a80	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000001468a86	movb	$0x0, -0x51(%rbp)
0000000001468a8a	movsd	0x12055e(%rip), %xmm0
0000000001468a92	movups	%xmm0, -0x40(%rbp)
0000000001468a96	leaq	-0x30(%rbp), %rdi
0000000001468a9a	leaq	-0x60(%rbp), %rsi
0000000001468a9e	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000001468aa3	movq	%rax, -0x28(%rbp)
0000000001468aa7	testb	$0x1, -0x58(%rbp)
0000000001468aab	je	0x1468aba
0000000001468aad	movq	-0x48(%rbp), %rdi
0000000001468ab1	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001468ab6	movq	-0x28(%rbp), %rax
0000000001468aba	movl	$0xa, -0x60(%rbp)
0000000001468ac1	leaq	-0x58(%rbp), %r14
0000000001468ac5	movb	$0xc, -0x58(%rbp)
0000000001468ac9	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
0000000001468ad0	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000001468ad6	movb	$0x0, -0x51(%rbp)
0000000001468ada	movaps	0x11aa3f(%rip), %xmm0
0000000001468ae1	movups	%xmm0, -0x40(%rbp)
0000000001468ae5	cmpq	-0x20(%rbp), %rax
0000000001468ae9	jae	0x1468b23
0000000001468aeb	movl	$0xa, (%rax)
0000000001468af1	movq	0x10(%r14), %rcx
0000000001468af5	movq	%rcx, 0x18(%rax)
0000000001468af9	movups	(%r14), %xmm0
0000000001468afd	movups	%xmm0, 0x8(%rax)
0000000001468b01	xorps	%xmm0, %xmm0
0000000001468b04	movups	%xmm0, (%r14)
0000000001468b08	movq	$0x0, 0x10(%r14)
0000000001468b10	movups	0x18(%r14), %xmm0
0000000001468b15	movups	%xmm0, 0x20(%rax)
0000000001468b19	addq	$0x30, %rax
0000000001468b1d	movq	%rax, -0x28(%rbp)
0000000001468b21	jmp	0x1468b47
0000000001468b23	leaq	-0x30(%rbp), %rdi
0000000001468b27	leaq	-0x60(%rbp), %rsi
0000000001468b2b	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000001468b30	testb	$0x1, -0x58(%rbp)
0000000001468b34	movq	%rax, -0x28(%rbp)
0000000001468b38	je	0x1468b47
0000000001468b3a	movq	-0x48(%rbp), %rdi
0000000001468b3e	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001468b43	movq	-0x28(%rbp), %rax
0000000001468b47	movl	$0xa, -0x60(%rbp)
0000000001468b4e	movb	$0xc, -0x58(%rbp)
0000000001468b52	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
0000000001468b59	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000001468b5f	movb	$0x0, -0x51(%rbp)
0000000001468b63	movaps	0x11a9b6(%rip), %xmm0
0000000001468b6a	movups	%xmm0, -0x40(%rbp)
0000000001468b6e	cmpq	-0x20(%rbp), %rax
0000000001468b72	jae	0x1468bac
0000000001468b74	movl	$0xa, (%rax)
0000000001468b7a	movq	0x10(%r14), %rcx
0000000001468b7e	movq	%rcx, 0x18(%rax)
0000000001468b82	movups	(%r14), %xmm0
0000000001468b86	movups	%xmm0, 0x8(%rax)
0000000001468b8a	xorps	%xmm0, %xmm0
0000000001468b8d	movups	%xmm0, (%r14)
0000000001468b91	movq	$0x0, 0x10(%r14)
0000000001468b99	movups	0x18(%r14), %xmm0
0000000001468b9e	movups	%xmm0, 0x20(%rax)
0000000001468ba2	addq	$0x30, %rax
0000000001468ba6	movq	%rax, -0x28(%rbp)
0000000001468baa	jmp	0x1468bcc
0000000001468bac	leaq	-0x30(%rbp), %rdi
0000000001468bb0	leaq	-0x60(%rbp), %rsi
0000000001468bb4	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000001468bb9	testb	$0x1, -0x58(%rbp)
0000000001468bbd	movq	%rax, -0x28(%rbp)
0000000001468bc1	je	0x1468bcc
0000000001468bc3	movq	-0x48(%rbp), %rdi
0000000001468bc7	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001468bcc	leaq	-0x30(%rbp), %rsi
0000000001468bd0	movq	%rbx, %rdi
0000000001468bd3	callq	0x14966cc                       ## symbol stub for: __ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE
0000000001468bd8	movq	-0x30(%rbp), %rbx
0000000001468bdc	testq	%rbx, %rbx
0000000001468bdf	je	0x1468c18
0000000001468be1	movq	-0x28(%rbp), %r14
0000000001468be5	movq	%rbx, %rdi
0000000001468be8	cmpq	%r14, %rbx
0000000001468beb	jne	0x1468bf9
0000000001468bed	jmp	0x1468c0f
0000000001468bef	nop
0000000001468bf0	addq	$-0x30, %r14
0000000001468bf4	cmpq	%rbx, %r14
0000000001468bf7	je	0x1468c0b
0000000001468bf9	testb	$0x1, -0x28(%r14)
0000000001468bfe	je	0x1468bf0
0000000001468c00	movq	-0x18(%r14), %rdi
0000000001468c04	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001468c09	jmp	0x1468bf0
0000000001468c0b	movq	-0x30(%rbp), %rdi
0000000001468c0f	movq	%rbx, -0x28(%rbp)
0000000001468c13	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001468c18	addq	$0x80, %rsp
0000000001468c1f	popq	%rbx
0000000001468c20	popq	%r14
0000000001468c22	popq	%rbp
0000000001468c23	retq
0000000001468c24	jmp	0x1468c2d
0000000001468c26	jmp	0x1468c2d
0000000001468c28	movq	%rax, %rbx
0000000001468c2b	jmp	0x1468c3f
0000000001468c2d	movq	%rax, %rbx
0000000001468c30	testb	$0x1, -0x58(%rbp)
0000000001468c34	je	0x1468c3f
0000000001468c36	movq	-0x48(%rbp), %rdi
0000000001468c3a	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001468c3f	leaq	-0x30(%rbp), %rdi
0000000001468c43	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
0000000001468c48	movq	%rbx, %rdi
0000000001468c4b	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001468c50	movq	%rax, %rbx
0000000001468c53	testb	$0x1, -0x88(%rbp)
0000000001468c5a	je	0x1468c48
0000000001468c5c	movq	-0x78(%rbp), %rdi
0000000001468c60	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001468c65	movq	%rbx, %rdi
0000000001468c68	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001468c6d	nopl	(%rax)
