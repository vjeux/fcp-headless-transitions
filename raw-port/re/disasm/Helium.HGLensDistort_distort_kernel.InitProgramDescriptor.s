__ZNK28HGLensDistort_distort_kernel21InitProgramDescriptorEP19HGProgramDescriptor:
000000000022a860	pushq	%rbp
000000000022a861	movq	%rsp, %rbp
000000000022a864	pushq	%r14
000000000022a866	pushq	%rbx
000000000022a867	subq	$0x80, %rsp
000000000022a86e	movq	%rsi, %rbx
000000000022a871	leaq	0x6ebaac(%rip), %rsi            ## literal pool for: "Distort_hgc_visible"
000000000022a878	leaq	0x6ebac1(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=0000000395\n[[ visible ]] FragmentOut Distort_hgc_visible(const constant float4* hg_Params, \n    texture2d< float > hg_Texture0, \n    sampler hg_Sampler0,\n    float4 texCoord0)\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2, r3;\n    FragmentOut output;\n\n    r0.xy = texCoord0.xy - hg_Params[1].xy;\n    r0.xy = r0.xy*hg_Params[0].zw;\n    r1.x = dot(r0.xy, r0.xy);\n    r1.x = rsqrt(r1.x);\n    r2.x = 1.00000f / r1.x;\n    r3.x = r2.x*hg_Params[2].x;\n    r3.y = tan(r3.x);\n    r3.z = hg_Params[2].z*r1.x;\n    r3.x = r3.y*r3.z;\n    r0.xy = r0.xy*r3.xx;\n    r0.xy = r0.xy*hg_Params[0].xy + hg_Params[1].xy;\n    r2 = r2.xxxx - hg_Params[2].yyyy;\n    r0.xy = r0.xy + hg_Params[4].xy;\n    r0.xy = r0.xy*hg_Params[4].zw;\n    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);\n    output.color0 = select(c0.xxxx, r0, r2 < 0.00000f);\n    return output;\n}\n"
000000000022a87f	movq	%rbx, %rdi
000000000022a882	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
000000000022a887	leaq	0x6ebaaa(%rip), %rsi            ## literal pool for: "Distort"
000000000022a88e	movq	%rbx, %rdi
000000000022a891	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
000000000022a896	movl	$0x4, -0x90(%rbp)
000000000022a8a0	movb	$0x16, -0x88(%rbp)
000000000022a8a7	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
000000000022a8b1	movq	%rax, -0x87(%rbp)
000000000022a8b8	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
000000000022a8bf	movb	$0x0, -0x7c(%rbp)
000000000022a8c3	movaps	0x1a07c6(%rip), %xmm0
000000000022a8ca	movups	%xmm0, -0x70(%rbp)
000000000022a8ce	leaq	-0x90(%rbp), %rsi
000000000022a8d5	movq	%rbx, %rdi
000000000022a8d8	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
000000000022a8dd	testb	$0x1, -0x88(%rbp)
000000000022a8e4	je	0x22a8ef
000000000022a8e6	movq	-0x78(%rbp), %rdi
000000000022a8ea	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000022a8ef	xorps	%xmm0, %xmm0
000000000022a8f2	movaps	%xmm0, -0x30(%rbp)
000000000022a8f6	movq	$0x0, -0x20(%rbp)
000000000022a8fe	movl	$0x2, -0x60(%rbp)
000000000022a905	movb	$0xc, -0x58(%rbp)
000000000022a909	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000022a910	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000022a916	movb	$0x0, -0x51(%rbp)
000000000022a91a	movaps	0x662b3f(%rip), %xmm0
000000000022a921	movups	%xmm0, -0x40(%rbp)
000000000022a925	leaq	-0x30(%rbp), %rdi
000000000022a929	leaq	-0x60(%rbp), %rsi
000000000022a92d	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000022a932	movq	%rax, -0x28(%rbp)
000000000022a936	testb	$0x1, -0x58(%rbp)
000000000022a93a	je	0x22a949
000000000022a93c	movq	-0x48(%rbp), %rdi
000000000022a940	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000022a945	movq	-0x28(%rbp), %rax
000000000022a949	movl	$0x9, -0x60(%rbp)
000000000022a950	leaq	-0x58(%rbp), %r14
000000000022a954	movb	$0x20, -0x58(%rbp)
000000000022a958	movups	0x6d0db2(%rip), %xmm0           ## literal pool for: "texture2d<float>"
000000000022a95f	movups	%xmm0, -0x57(%rbp)
000000000022a963	movb	$0x0, -0x47(%rbp)
000000000022a967	movaps	0x1a0722(%rip), %xmm0
000000000022a96e	movups	%xmm0, -0x40(%rbp)
000000000022a972	cmpq	-0x20(%rbp), %rax
000000000022a976	jae	0x22a9b0
000000000022a978	movl	$0x9, (%rax)
000000000022a97e	movq	0x10(%r14), %rcx
000000000022a982	movq	%rcx, 0x18(%rax)
000000000022a986	movups	(%r14), %xmm0
000000000022a98a	movups	%xmm0, 0x8(%rax)
000000000022a98e	xorps	%xmm0, %xmm0
000000000022a991	movups	%xmm0, (%r14)
000000000022a995	movq	$0x0, 0x10(%r14)
000000000022a99d	movups	0x18(%r14), %xmm0
000000000022a9a2	movups	%xmm0, 0x20(%rax)
000000000022a9a6	addq	$0x30, %rax
000000000022a9aa	movq	%rax, -0x28(%rbp)
000000000022a9ae	jmp	0x22a9d4
000000000022a9b0	leaq	-0x30(%rbp), %rdi
000000000022a9b4	leaq	-0x60(%rbp), %rsi
000000000022a9b8	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000022a9bd	testb	$0x1, -0x58(%rbp)
000000000022a9c1	movq	%rax, -0x28(%rbp)
000000000022a9c5	je	0x22a9d4
000000000022a9c7	movq	-0x48(%rbp), %rdi
000000000022a9cb	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000022a9d0	movq	-0x28(%rbp), %rax
000000000022a9d4	movl	$0x6, -0x60(%rbp)
000000000022a9db	movb	$0xe, -0x58(%rbp)
000000000022a9df	movl	$0x706d6173, -0x57(%rbp)        ## imm = 0x706D6173
000000000022a9e6	movl	$0x72656c70, -0x54(%rbp)        ## imm = 0x72656C70
000000000022a9ed	movb	$0x0, -0x50(%rbp)
000000000022a9f1	movaps	0x1a0698(%rip), %xmm0
000000000022a9f8	movups	%xmm0, -0x40(%rbp)
000000000022a9fc	cmpq	-0x20(%rbp), %rax
000000000022aa00	jae	0x22aa3a
000000000022aa02	movl	$0x6, (%rax)
000000000022aa08	movq	0x10(%r14), %rcx
000000000022aa0c	movq	%rcx, 0x18(%rax)
000000000022aa10	movups	(%r14), %xmm0
000000000022aa14	movups	%xmm0, 0x8(%rax)
000000000022aa18	xorps	%xmm0, %xmm0
000000000022aa1b	movups	%xmm0, (%r14)
000000000022aa1f	movq	$0x0, 0x10(%r14)
000000000022aa27	movups	0x18(%r14), %xmm0
000000000022aa2c	movups	%xmm0, 0x20(%rax)
000000000022aa30	addq	$0x30, %rax
000000000022aa34	movq	%rax, -0x28(%rbp)
000000000022aa38	jmp	0x22aa5e
000000000022aa3a	leaq	-0x30(%rbp), %rdi
000000000022aa3e	leaq	-0x60(%rbp), %rsi
000000000022aa42	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000022aa47	testb	$0x1, -0x58(%rbp)
000000000022aa4b	movq	%rax, -0x28(%rbp)
000000000022aa4f	je	0x22aa5e
000000000022aa51	movq	-0x48(%rbp), %rdi
000000000022aa55	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000022aa5a	movq	-0x28(%rbp), %rax
000000000022aa5e	movl	$0x8, -0x60(%rbp)
000000000022aa65	movb	$0xc, -0x58(%rbp)
000000000022aa69	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000022aa70	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000022aa76	movb	$0x0, -0x51(%rbp)
000000000022aa7a	movaps	0x1a060f(%rip), %xmm0
000000000022aa81	movups	%xmm0, -0x40(%rbp)
000000000022aa85	cmpq	-0x20(%rbp), %rax
000000000022aa89	jae	0x22aac3
000000000022aa8b	movl	$0x8, (%rax)
000000000022aa91	movq	0x10(%r14), %rcx
000000000022aa95	movq	%rcx, 0x18(%rax)
000000000022aa99	movups	(%r14), %xmm0
000000000022aa9d	movups	%xmm0, 0x8(%rax)
000000000022aaa1	xorps	%xmm0, %xmm0
000000000022aaa4	movups	%xmm0, (%r14)
000000000022aaa8	movq	$0x0, 0x10(%r14)
000000000022aab0	movups	0x18(%r14), %xmm0
000000000022aab5	movups	%xmm0, 0x20(%rax)
000000000022aab9	addq	$0x30, %rax
000000000022aabd	movq	%rax, -0x28(%rbp)
000000000022aac1	jmp	0x22aae3
000000000022aac3	leaq	-0x30(%rbp), %rdi
000000000022aac7	leaq	-0x60(%rbp), %rsi
000000000022aacb	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000022aad0	testb	$0x1, -0x58(%rbp)
000000000022aad4	movq	%rax, -0x28(%rbp)
000000000022aad8	je	0x22aae3
000000000022aada	movq	-0x48(%rbp), %rdi
000000000022aade	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000022aae3	leaq	-0x30(%rbp), %rsi
000000000022aae7	movq	%rbx, %rdi
000000000022aaea	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
000000000022aaef	movq	-0x30(%rbp), %rbx
000000000022aaf3	testq	%rbx, %rbx
000000000022aaf6	je	0x22ab38
000000000022aaf8	movq	-0x28(%rbp), %r14
000000000022aafc	movq	%rbx, %rdi
000000000022aaff	cmpq	%r14, %rbx
000000000022ab02	jne	0x22ab19
000000000022ab04	jmp	0x22ab2f
000000000022ab06	nopw	%cs:(%rax,%rax)
000000000022ab10	addq	$-0x30, %r14
000000000022ab14	cmpq	%rbx, %r14
000000000022ab17	je	0x22ab2b
000000000022ab19	testb	$0x1, -0x28(%r14)
000000000022ab1e	je	0x22ab10
000000000022ab20	movq	-0x18(%r14), %rdi
000000000022ab24	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000022ab29	jmp	0x22ab10
000000000022ab2b	movq	-0x30(%rbp), %rdi
000000000022ab2f	movq	%rbx, -0x28(%rbp)
000000000022ab33	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000022ab38	addq	$0x80, %rsp
000000000022ab3f	popq	%rbx
000000000022ab40	popq	%r14
000000000022ab42	popq	%rbp
000000000022ab43	retq
000000000022ab44	jmp	0x22ab4f
000000000022ab46	jmp	0x22ab4f
000000000022ab48	jmp	0x22ab4f
000000000022ab4a	movq	%rax, %rbx
000000000022ab4d	jmp	0x22ab61
000000000022ab4f	movq	%rax, %rbx
000000000022ab52	testb	$0x1, -0x58(%rbp)
000000000022ab56	je	0x22ab61
000000000022ab58	movq	-0x48(%rbp), %rdi
000000000022ab5c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000022ab61	leaq	-0x30(%rbp), %rdi
000000000022ab65	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
000000000022ab6a	movq	%rbx, %rdi
000000000022ab6d	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000022ab72	movq	%rax, %rbx
000000000022ab75	testb	$0x1, -0x88(%rbp)
000000000022ab7c	je	0x22ab6a
000000000022ab7e	movq	-0x78(%rbp), %rdi
000000000022ab82	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000022ab87	movq	%rbx, %rdi
000000000022ab8a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000022ab8f	nop
