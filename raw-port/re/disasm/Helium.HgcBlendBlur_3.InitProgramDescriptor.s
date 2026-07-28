__ZNK14HgcBlendBlur_321InitProgramDescriptorEP19HGProgramDescriptor:
0000000000235a20	pushq	%rbp
0000000000235a21	movq	%rsp, %rbp
0000000000235a24	pushq	%r14
0000000000235a26	pushq	%rbx
0000000000235a27	subq	$0x80, %rsp
0000000000235a2e	movq	%rsi, %rbx
0000000000235a31	leaq	0x6e8ba7(%rip), %rsi            ## literal pool for: "HgcBlendBlur_3_hgc_visible"
0000000000235a38	leaq	0x6eb336(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=00000002ed\n[[ visible ]] FragmentOut HgcBlendBlur_3_hgc_visible(const constant float4* hg_Params,\n    float4 color0,\n    float4 color1,\n    float4 color2,\n    float4 color3)\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2, r3, r4;\n    FragmentOut output;\n\n    r0.x = color0.x;\n    r1 = color1;\n    r2 = color2;\n    r3 = color3;\n    r0.x = fmax(r0.x, c0.x);\n    r0.x = r0.x*hg_Params[0].x;\n    r4.x = r0.x + hg_Params[1].x;\n    r4.x = clamp(r4.x*hg_Params[2].x, 0.00000f, 1.00000f);\n    r4 = mix(r1, r2, r4.xxxx);\n    r0.x = r0.x + hg_Params[3].x;\n    r0.x = clamp(r0.x*hg_Params[4].x, 0.00000f, 1.00000f);\n    output.color0 = mix(r4, r3, r0.xxxx);\n    return output;\n}\n"
0000000000235a3f	movq	%rbx, %rdi
0000000000235a42	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
0000000000235a47	leaq	0x6e8bac(%rip), %rsi            ## literal pool for: "HgcBlendBlur_3"
0000000000235a4e	movq	%rbx, %rdi
0000000000235a51	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
0000000000235a56	movl	$0x4, -0x90(%rbp)
0000000000235a60	movb	$0x16, -0x88(%rbp)
0000000000235a67	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
0000000000235a71	movq	%rax, -0x87(%rbp)
0000000000235a78	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
0000000000235a7f	movb	$0x0, -0x7c(%rbp)
0000000000235a83	movaps	0x195606(%rip), %xmm0
0000000000235a8a	movups	%xmm0, -0x70(%rbp)
0000000000235a8e	leaq	-0x90(%rbp), %rsi
0000000000235a95	movq	%rbx, %rdi
0000000000235a98	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
0000000000235a9d	testb	$0x1, -0x88(%rbp)
0000000000235aa4	je	0x235aaf
0000000000235aa6	movq	-0x78(%rbp), %rdi
0000000000235aaa	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000235aaf	xorps	%xmm0, %xmm0
0000000000235ab2	movaps	%xmm0, -0x30(%rbp)
0000000000235ab6	movq	$0x0, -0x20(%rbp)
0000000000235abe	movl	$0x2, -0x60(%rbp)
0000000000235ac5	movb	$0xc, -0x58(%rbp)
0000000000235ac9	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
0000000000235ad0	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000000235ad6	movb	$0x0, -0x51(%rbp)
0000000000235ada	movaps	0x65797f(%rip), %xmm0
0000000000235ae1	movups	%xmm0, -0x40(%rbp)
0000000000235ae5	leaq	-0x30(%rbp), %rdi
0000000000235ae9	leaq	-0x60(%rbp), %rsi
0000000000235aed	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000235af2	movq	%rax, -0x28(%rbp)
0000000000235af6	testb	$0x1, -0x58(%rbp)
0000000000235afa	je	0x235b09
0000000000235afc	movq	-0x48(%rbp), %rdi
0000000000235b00	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000235b05	movq	-0x28(%rbp), %rax
0000000000235b09	movl	$0xa, -0x60(%rbp)
0000000000235b10	leaq	-0x58(%rbp), %r14
0000000000235b14	movb	$0xc, -0x58(%rbp)
0000000000235b18	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
0000000000235b1f	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000000235b25	movb	$0x0, -0x51(%rbp)
0000000000235b29	movaps	0x195560(%rip), %xmm0
0000000000235b30	movups	%xmm0, -0x40(%rbp)
0000000000235b34	cmpq	-0x20(%rbp), %rax
0000000000235b38	jae	0x235b72
0000000000235b3a	movl	$0xa, (%rax)
0000000000235b40	movq	0x10(%r14), %rcx
0000000000235b44	movq	%rcx, 0x18(%rax)
0000000000235b48	movups	(%r14), %xmm0
0000000000235b4c	movups	%xmm0, 0x8(%rax)
0000000000235b50	xorps	%xmm0, %xmm0
0000000000235b53	movups	%xmm0, (%r14)
0000000000235b57	movq	$0x0, 0x10(%r14)
0000000000235b5f	movups	0x18(%r14), %xmm0
0000000000235b64	movups	%xmm0, 0x20(%rax)
0000000000235b68	addq	$0x30, %rax
0000000000235b6c	movq	%rax, -0x28(%rbp)
0000000000235b70	jmp	0x235b96
0000000000235b72	leaq	-0x30(%rbp), %rdi
0000000000235b76	leaq	-0x60(%rbp), %rsi
0000000000235b7a	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000235b7f	testb	$0x1, -0x58(%rbp)
0000000000235b83	movq	%rax, -0x28(%rbp)
0000000000235b87	je	0x235b96
0000000000235b89	movq	-0x48(%rbp), %rdi
0000000000235b8d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000235b92	movq	-0x28(%rbp), %rax
0000000000235b96	movl	$0xa, -0x60(%rbp)
0000000000235b9d	movb	$0xc, -0x58(%rbp)
0000000000235ba1	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
0000000000235ba8	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000000235bae	movb	$0x0, -0x51(%rbp)
0000000000235bb2	movaps	0x1954d7(%rip), %xmm0
0000000000235bb9	movups	%xmm0, -0x40(%rbp)
0000000000235bbd	cmpq	-0x20(%rbp), %rax
0000000000235bc1	jae	0x235bfb
0000000000235bc3	movl	$0xa, (%rax)
0000000000235bc9	movq	0x10(%r14), %rcx
0000000000235bcd	movq	%rcx, 0x18(%rax)
0000000000235bd1	movups	(%r14), %xmm0
0000000000235bd5	movups	%xmm0, 0x8(%rax)
0000000000235bd9	xorps	%xmm0, %xmm0
0000000000235bdc	movups	%xmm0, (%r14)
0000000000235be0	movq	$0x0, 0x10(%r14)
0000000000235be8	movups	0x18(%r14), %xmm0
0000000000235bed	movups	%xmm0, 0x20(%rax)
0000000000235bf1	addq	$0x30, %rax
0000000000235bf5	movq	%rax, -0x28(%rbp)
0000000000235bf9	jmp	0x235c1f
0000000000235bfb	leaq	-0x30(%rbp), %rdi
0000000000235bff	leaq	-0x60(%rbp), %rsi
0000000000235c03	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000235c08	testb	$0x1, -0x58(%rbp)
0000000000235c0c	movq	%rax, -0x28(%rbp)
0000000000235c10	je	0x235c1f
0000000000235c12	movq	-0x48(%rbp), %rdi
0000000000235c16	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000235c1b	movq	-0x28(%rbp), %rax
0000000000235c1f	movl	$0xa, -0x60(%rbp)
0000000000235c26	movb	$0xc, -0x58(%rbp)
0000000000235c2a	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
0000000000235c31	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000000235c37	movb	$0x0, -0x51(%rbp)
0000000000235c3b	movaps	0x19544e(%rip), %xmm0
0000000000235c42	movups	%xmm0, -0x40(%rbp)
0000000000235c46	cmpq	-0x20(%rbp), %rax
0000000000235c4a	jae	0x235c84
0000000000235c4c	movl	$0xa, (%rax)
0000000000235c52	movq	0x10(%r14), %rcx
0000000000235c56	movq	%rcx, 0x18(%rax)
0000000000235c5a	movups	(%r14), %xmm0
0000000000235c5e	movups	%xmm0, 0x8(%rax)
0000000000235c62	xorps	%xmm0, %xmm0
0000000000235c65	movups	%xmm0, (%r14)
0000000000235c69	movq	$0x0, 0x10(%r14)
0000000000235c71	movups	0x18(%r14), %xmm0
0000000000235c76	movups	%xmm0, 0x20(%rax)
0000000000235c7a	addq	$0x30, %rax
0000000000235c7e	movq	%rax, -0x28(%rbp)
0000000000235c82	jmp	0x235ca8
0000000000235c84	leaq	-0x30(%rbp), %rdi
0000000000235c88	leaq	-0x60(%rbp), %rsi
0000000000235c8c	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000235c91	testb	$0x1, -0x58(%rbp)
0000000000235c95	movq	%rax, -0x28(%rbp)
0000000000235c99	je	0x235ca8
0000000000235c9b	movq	-0x48(%rbp), %rdi
0000000000235c9f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000235ca4	movq	-0x28(%rbp), %rax
0000000000235ca8	movl	$0xa, -0x60(%rbp)
0000000000235caf	movb	$0xc, -0x58(%rbp)
0000000000235cb3	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
0000000000235cba	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000000235cc0	movb	$0x0, -0x51(%rbp)
0000000000235cc4	movaps	0x1953c5(%rip), %xmm0
0000000000235ccb	movups	%xmm0, -0x40(%rbp)
0000000000235ccf	cmpq	-0x20(%rbp), %rax
0000000000235cd3	jae	0x235d0d
0000000000235cd5	movl	$0xa, (%rax)
0000000000235cdb	movq	0x10(%r14), %rcx
0000000000235cdf	movq	%rcx, 0x18(%rax)
0000000000235ce3	movups	(%r14), %xmm0
0000000000235ce7	movups	%xmm0, 0x8(%rax)
0000000000235ceb	xorps	%xmm0, %xmm0
0000000000235cee	movups	%xmm0, (%r14)
0000000000235cf2	movq	$0x0, 0x10(%r14)
0000000000235cfa	movups	0x18(%r14), %xmm0
0000000000235cff	movups	%xmm0, 0x20(%rax)
0000000000235d03	addq	$0x30, %rax
0000000000235d07	movq	%rax, -0x28(%rbp)
0000000000235d0b	jmp	0x235d2d
0000000000235d0d	leaq	-0x30(%rbp), %rdi
0000000000235d11	leaq	-0x60(%rbp), %rsi
0000000000235d15	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000235d1a	testb	$0x1, -0x58(%rbp)
0000000000235d1e	movq	%rax, -0x28(%rbp)
0000000000235d22	je	0x235d2d
0000000000235d24	movq	-0x48(%rbp), %rdi
0000000000235d28	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000235d2d	leaq	-0x30(%rbp), %rsi
0000000000235d31	movq	%rbx, %rdi
0000000000235d34	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
0000000000235d39	movq	-0x30(%rbp), %rbx
0000000000235d3d	testq	%rbx, %rbx
0000000000235d40	je	0x235d78
0000000000235d42	movq	-0x28(%rbp), %r14
0000000000235d46	movq	%rbx, %rdi
0000000000235d49	cmpq	%r14, %rbx
0000000000235d4c	jne	0x235d59
0000000000235d4e	jmp	0x235d6f
0000000000235d50	addq	$-0x30, %r14
0000000000235d54	cmpq	%rbx, %r14
0000000000235d57	je	0x235d6b
0000000000235d59	testb	$0x1, -0x28(%r14)
0000000000235d5e	je	0x235d50
0000000000235d60	movq	-0x18(%r14), %rdi
0000000000235d64	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000235d69	jmp	0x235d50
0000000000235d6b	movq	-0x30(%rbp), %rdi
0000000000235d6f	movq	%rbx, -0x28(%rbp)
0000000000235d73	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000235d78	addq	$0x80, %rsp
0000000000235d7f	popq	%rbx
0000000000235d80	popq	%r14
0000000000235d82	popq	%rbp
0000000000235d83	retq
0000000000235d84	jmp	0x235d91
0000000000235d86	jmp	0x235d91
0000000000235d88	jmp	0x235d91
0000000000235d8a	jmp	0x235d91
0000000000235d8c	movq	%rax, %rbx
0000000000235d8f	jmp	0x235da3
0000000000235d91	movq	%rax, %rbx
0000000000235d94	testb	$0x1, -0x58(%rbp)
0000000000235d98	je	0x235da3
0000000000235d9a	movq	-0x48(%rbp), %rdi
0000000000235d9e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000235da3	leaq	-0x30(%rbp), %rdi
0000000000235da7	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
0000000000235dac	movq	%rbx, %rdi
0000000000235daf	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000235db4	movq	%rax, %rbx
0000000000235db7	testb	$0x1, -0x88(%rbp)
0000000000235dbe	je	0x235dac
0000000000235dc0	movq	-0x78(%rbp), %rdi
0000000000235dc4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000235dc9	movq	%rbx, %rdi
0000000000235dcc	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000235dd1	nopw	%cs:(%rax,%rax)
