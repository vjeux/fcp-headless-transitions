__ZNK24HgcBT2100_PQ_InverseOETF21InitProgramDescriptorEP19HGProgramDescriptor:
00000000003ac800	pushq	%rbp
00000000003ac801	movq	%rsp, %rbp
00000000003ac804	pushq	%r14
00000000003ac806	pushq	%rbx
00000000003ac807	subq	$0x80, %rsp
00000000003ac80e	movq	%rsi, %rbx
00000000003ac811	leaq	0x6306ae(%rip), %rsi            ## literal pool for: "HgcBT2100_PQ_InverseOETF_hgc_visible"
00000000003ac818	leaq	0x630705(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=0000000382\n[[ visible ]] FragmentOut HgcBT2100_PQ_InverseOETF_hgc_visible(const constant float4* hg_Params,\n    float4 color0)\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2;\n    FragmentOut output;\n\n    r0 = color0;\n    r0.xyz = clamp(r0.xyz, 0.00000f, 1.00000f);\n    r0.xyz = pow(r0.xyz, hg_Params[1].yyy);\n    r1.xyz = r0.xyz - hg_Params[0].xxx;\n    r0.xyz = r0.xyz*hg_Params[0].zzz + hg_Params[0].yyy;\n    r1.xyz = fmax(r1.xyz, c0.xxx);\n    r0.xyz = r1.xyz/r0.xyz;\n    r1.xyz = pow(r0.xyz, hg_Params[1].xxx);\n    r0.xyz = r1.xyz*hg_Params[2].xxx + hg_Params[2].yyy;\n    r2.xyz = r1.xyz*hg_Params[2].zzz;\n    r0.xyz = pow(r0.xyz, hg_Params[1].zzz);\n    r1.xyz = float3(hg_Params[2].www < r1.xyz);\n    output.color0.xyz = select(r2.xyz, r0.xyz, -r1.xyz < 0.00000f);\n    output.color0.w = r0.w;\n    return output;\n}\n"
00000000003ac81f	movq	%rbx, %rdi
00000000003ac822	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
00000000003ac827	leaq	0x6306bd(%rip), %rsi            ## literal pool for: "HgcBT2100_PQ_InverseOETF"
00000000003ac82e	movq	%rbx, %rdi
00000000003ac831	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
00000000003ac836	movl	$0x4, -0x90(%rbp)
00000000003ac840	movb	$0x16, -0x88(%rbp)
00000000003ac847	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
00000000003ac851	movq	%rax, -0x87(%rbp)
00000000003ac858	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
00000000003ac85f	movb	$0x0, -0x7c(%rbp)
00000000003ac863	movaps	0x1e826(%rip), %xmm0
00000000003ac86a	movups	%xmm0, -0x70(%rbp)
00000000003ac86e	leaq	-0x90(%rbp), %rsi
00000000003ac875	movq	%rbx, %rdi
00000000003ac878	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
00000000003ac87d	testb	$0x1, -0x88(%rbp)
00000000003ac884	je	0x3ac88f
00000000003ac886	movq	-0x78(%rbp), %rdi
00000000003ac88a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003ac88f	xorps	%xmm0, %xmm0
00000000003ac892	movaps	%xmm0, -0x30(%rbp)
00000000003ac896	movq	$0x0, -0x20(%rbp)
00000000003ac89e	movl	$0x2, -0x60(%rbp)
00000000003ac8a5	movb	$0xc, -0x58(%rbp)
00000000003ac8a9	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
00000000003ac8b0	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
00000000003ac8b6	movb	$0x0, -0x51(%rbp)
00000000003ac8ba	movaps	0x4b338f(%rip), %xmm0
00000000003ac8c1	movups	%xmm0, -0x40(%rbp)
00000000003ac8c5	leaq	-0x30(%rbp), %rdi
00000000003ac8c9	leaq	-0x60(%rbp), %rsi
00000000003ac8cd	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000003ac8d2	movq	%rax, -0x28(%rbp)
00000000003ac8d6	testb	$0x1, -0x58(%rbp)
00000000003ac8da	je	0x3ac8e9
00000000003ac8dc	movq	-0x48(%rbp), %rdi
00000000003ac8e0	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003ac8e5	movq	-0x28(%rbp), %rax
00000000003ac8e9	movl	$0xa, -0x60(%rbp)
00000000003ac8f0	movb	$0xc, -0x58(%rbp)
00000000003ac8f4	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
00000000003ac8fb	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
00000000003ac901	movb	$0x0, -0x51(%rbp)
00000000003ac905	movaps	0x1e784(%rip), %xmm0
00000000003ac90c	movups	%xmm0, -0x40(%rbp)
00000000003ac910	cmpq	-0x20(%rbp), %rax
00000000003ac914	jae	0x3ac94f
00000000003ac916	leaq	-0x58(%rbp), %rcx
00000000003ac91a	movl	$0xa, (%rax)
00000000003ac920	movq	0x10(%rcx), %rdx
00000000003ac924	movq	%rdx, 0x18(%rax)
00000000003ac928	movups	(%rcx), %xmm0
00000000003ac92b	movups	%xmm0, 0x8(%rax)
00000000003ac92f	xorps	%xmm0, %xmm0
00000000003ac932	movups	%xmm0, (%rcx)
00000000003ac935	movq	$0x0, 0x10(%rcx)
00000000003ac93d	movups	0x18(%rcx), %xmm0
00000000003ac941	movups	%xmm0, 0x20(%rax)
00000000003ac945	addq	$0x30, %rax
00000000003ac949	movq	%rax, -0x28(%rbp)
00000000003ac94d	jmp	0x3ac96f
00000000003ac94f	leaq	-0x30(%rbp), %rdi
00000000003ac953	leaq	-0x60(%rbp), %rsi
00000000003ac957	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000003ac95c	testb	$0x1, -0x58(%rbp)
00000000003ac960	movq	%rax, -0x28(%rbp)
00000000003ac964	je	0x3ac96f
00000000003ac966	movq	-0x48(%rbp), %rdi
00000000003ac96a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003ac96f	leaq	-0x30(%rbp), %rsi
00000000003ac973	movq	%rbx, %rdi
00000000003ac976	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
00000000003ac97b	movq	-0x30(%rbp), %rbx
00000000003ac97f	testq	%rbx, %rbx
00000000003ac982	je	0x3ac9c8
00000000003ac984	movq	-0x28(%rbp), %r14
00000000003ac988	movq	%rbx, %rdi
00000000003ac98b	cmpq	%r14, %rbx
00000000003ac98e	jne	0x3ac9a9
00000000003ac990	jmp	0x3ac9bf
00000000003ac992	nopw	%cs:(%rax,%rax)
00000000003ac9a0	addq	$-0x30, %r14
00000000003ac9a4	cmpq	%rbx, %r14
00000000003ac9a7	je	0x3ac9bb
00000000003ac9a9	testb	$0x1, -0x28(%r14)
00000000003ac9ae	je	0x3ac9a0
00000000003ac9b0	movq	-0x18(%r14), %rdi
00000000003ac9b4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003ac9b9	jmp	0x3ac9a0
00000000003ac9bb	movq	-0x30(%rbp), %rdi
00000000003ac9bf	movq	%rbx, -0x28(%rbp)
00000000003ac9c3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003ac9c8	addq	$0x80, %rsp
00000000003ac9cf	popq	%rbx
00000000003ac9d0	popq	%r14
00000000003ac9d2	popq	%rbp
00000000003ac9d3	retq
00000000003ac9d4	jmp	0x3ac9db
00000000003ac9d6	movq	%rax, %rbx
00000000003ac9d9	jmp	0x3ac9ed
00000000003ac9db	movq	%rax, %rbx
00000000003ac9de	testb	$0x1, -0x58(%rbp)
00000000003ac9e2	je	0x3ac9ed
00000000003ac9e4	movq	-0x48(%rbp), %rdi
00000000003ac9e8	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003ac9ed	leaq	-0x30(%rbp), %rdi
00000000003ac9f1	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
00000000003ac9f6	movq	%rbx, %rdi
00000000003ac9f9	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000003ac9fe	movq	%rax, %rbx
00000000003aca01	testb	$0x1, -0x88(%rbp)
00000000003aca08	je	0x3ac9f6
00000000003aca0a	movq	-0x78(%rbp), %rdi
00000000003aca0e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003aca13	movq	%rbx, %rdi
00000000003aca16	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000003aca1b	nopl	(%rax,%rax)
