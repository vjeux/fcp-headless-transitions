__ZNK26HgcBT2390_Gain_Sat_ToneAdj21InitProgramDescriptorEP19HGProgramDescriptor:
000000000035e080	pushq	%rbp
000000000035e081	movq	%rsp, %rbp
000000000035e084	pushq	%r14
000000000035e086	pushq	%rbx
000000000035e087	subq	$0x80, %rsp
000000000035e08e	movq	%rsi, %rbx
000000000035e091	leaq	0x655608(%rip), %rsi            ## literal pool for: "HgcBT2390_Gain_Sat_ToneAdj_hgc_visible"
000000000035e098	leaq	0x655665(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=000000034d\n[[ visible ]] FragmentOut HgcBT2390_Gain_Sat_ToneAdj_hgc_visible(const constant float4* hg_Params,\n    float4 color0)\n{\n    const float4 c0 = float4(0.000000000, 0.2649999857, 1.100000024, 0.6779980063);\n    const float4 c1 = float4(0.05930199847, 1.000000000, 12.00000000, 0.2626999915);\n    float4 r0, r1;\n    FragmentOut output;\n\n    r0 = color0;\n    r0 = fmax(r0, c0.xxxx);\n    r1.xyz = r0.xyz*c0.yyy;\n    r0.xy = pow(r1.xy, c0.zz);\n    r0.z = r0.y*c0.w;\n    r1.w = r0.x*c1.w + r0.z;\n    r1.y = r1.y*c0.w;\n    r1.x = r1.x*c1.w + r1.y;\n    r0.z = pow(r1.z, c0.z);\n    r1.w = r0.z*c1.x + r1.w;\n    r1.x = r1.z*c1.x + r1.x;\n    r1.x = r1.x/r1.w;\n    r1.x = select(c1.y, r1.x, -r1.w < 0.00000f);\n    r0.xyz = r0.xyz*r1.xxx;\n    output.color0.xyz = r0.xyz*c1.zzz;\n    output.color0.w = r0.w;\n    return output;\n}\n"
000000000035e09f	movq	%rbx, %rdi
000000000035e0a2	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
000000000035e0a7	leaq	0x655619(%rip), %rsi            ## literal pool for: "HgcBT2390_Gain_Sat_ToneAdj"
000000000035e0ae	movq	%rbx, %rdi
000000000035e0b1	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
000000000035e0b6	movl	$0x4, -0x90(%rbp)
000000000035e0c0	movb	$0x16, -0x88(%rbp)
000000000035e0c7	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
000000000035e0d1	movq	%rax, -0x87(%rbp)
000000000035e0d8	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
000000000035e0df	movb	$0x0, -0x7c(%rbp)
000000000035e0e3	movaps	0x6cfa6(%rip), %xmm0
000000000035e0ea	movups	%xmm0, -0x70(%rbp)
000000000035e0ee	leaq	-0x90(%rbp), %rsi
000000000035e0f5	movq	%rbx, %rdi
000000000035e0f8	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
000000000035e0fd	testb	$0x1, -0x88(%rbp)
000000000035e104	je	0x35e10f
000000000035e106	movq	-0x78(%rbp), %rdi
000000000035e10a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000035e10f	xorps	%xmm0, %xmm0
000000000035e112	movaps	%xmm0, -0x30(%rbp)
000000000035e116	movq	$0x0, -0x20(%rbp)
000000000035e11e	movl	$0x2, -0x60(%rbp)
000000000035e125	movb	$0xc, -0x58(%rbp)
000000000035e129	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000035e130	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000035e136	movb	$0x0, -0x51(%rbp)
000000000035e13a	movsd	0x52e67e(%rip), %xmm0
000000000035e142	movups	%xmm0, -0x40(%rbp)
000000000035e146	leaq	-0x30(%rbp), %rdi
000000000035e14a	leaq	-0x60(%rbp), %rsi
000000000035e14e	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000035e153	movq	%rax, -0x28(%rbp)
000000000035e157	testb	$0x1, -0x58(%rbp)
000000000035e15b	je	0x35e16a
000000000035e15d	movq	-0x48(%rbp), %rdi
000000000035e161	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000035e166	movq	-0x28(%rbp), %rax
000000000035e16a	movl	$0xa, -0x60(%rbp)
000000000035e171	movb	$0xc, -0x58(%rbp)
000000000035e175	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000035e17c	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000035e182	movb	$0x0, -0x51(%rbp)
000000000035e186	movaps	0x6cf03(%rip), %xmm0
000000000035e18d	movups	%xmm0, -0x40(%rbp)
000000000035e191	cmpq	-0x20(%rbp), %rax
000000000035e195	jae	0x35e1d0
000000000035e197	leaq	-0x58(%rbp), %rcx
000000000035e19b	movl	$0xa, (%rax)
000000000035e1a1	movq	0x10(%rcx), %rdx
000000000035e1a5	movq	%rdx, 0x18(%rax)
000000000035e1a9	movups	(%rcx), %xmm0
000000000035e1ac	movups	%xmm0, 0x8(%rax)
000000000035e1b0	xorps	%xmm0, %xmm0
000000000035e1b3	movups	%xmm0, (%rcx)
000000000035e1b6	movq	$0x0, 0x10(%rcx)
000000000035e1be	movups	0x18(%rcx), %xmm0
000000000035e1c2	movups	%xmm0, 0x20(%rax)
000000000035e1c6	addq	$0x30, %rax
000000000035e1ca	movq	%rax, -0x28(%rbp)
000000000035e1ce	jmp	0x35e1f0
000000000035e1d0	leaq	-0x30(%rbp), %rdi
000000000035e1d4	leaq	-0x60(%rbp), %rsi
000000000035e1d8	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000035e1dd	testb	$0x1, -0x58(%rbp)
000000000035e1e1	movq	%rax, -0x28(%rbp)
000000000035e1e5	je	0x35e1f0
000000000035e1e7	movq	-0x48(%rbp), %rdi
000000000035e1eb	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000035e1f0	leaq	-0x30(%rbp), %rsi
000000000035e1f4	movq	%rbx, %rdi
000000000035e1f7	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
000000000035e1fc	movq	-0x30(%rbp), %rbx
000000000035e200	testq	%rbx, %rbx
000000000035e203	je	0x35e248
000000000035e205	movq	-0x28(%rbp), %r14
000000000035e209	movq	%rbx, %rdi
000000000035e20c	cmpq	%r14, %rbx
000000000035e20f	jne	0x35e229
000000000035e211	jmp	0x35e23f
000000000035e213	nopw	%cs:(%rax,%rax)
000000000035e220	addq	$-0x30, %r14
000000000035e224	cmpq	%rbx, %r14
000000000035e227	je	0x35e23b
000000000035e229	testb	$0x1, -0x28(%r14)
000000000035e22e	je	0x35e220
000000000035e230	movq	-0x18(%r14), %rdi
000000000035e234	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000035e239	jmp	0x35e220
000000000035e23b	movq	-0x30(%rbp), %rdi
000000000035e23f	movq	%rbx, -0x28(%rbp)
000000000035e243	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000035e248	addq	$0x80, %rsp
000000000035e24f	popq	%rbx
000000000035e250	popq	%r14
000000000035e252	popq	%rbp
000000000035e253	retq
000000000035e254	jmp	0x35e25b
000000000035e256	movq	%rax, %rbx
000000000035e259	jmp	0x35e26d
000000000035e25b	movq	%rax, %rbx
000000000035e25e	testb	$0x1, -0x58(%rbp)
000000000035e262	je	0x35e26d
000000000035e264	movq	-0x48(%rbp), %rdi
000000000035e268	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000035e26d	leaq	-0x30(%rbp), %rdi
000000000035e271	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
000000000035e276	movq	%rbx, %rdi
000000000035e279	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000035e27e	movq	%rax, %rbx
000000000035e281	testb	$0x1, -0x88(%rbp)
000000000035e288	je	0x35e276
000000000035e28a	movq	-0x78(%rbp), %rdi
000000000035e28e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000035e293	movq	%rbx, %rdi
000000000035e296	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000035e29b	nopl	(%rax,%rax)
