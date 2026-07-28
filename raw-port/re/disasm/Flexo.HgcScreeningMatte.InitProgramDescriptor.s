__ZNK17HgcScreeningMatte21InitProgramDescriptorEP19HGProgramDescriptor:
000000000146c8d0	pushq	%rbp
000000000146c8d1	movq	%rsp, %rbp
000000000146c8d4	pushq	%r14
000000000146c8d6	pushq	%rbx
000000000146c8d7	subq	$0x80, %rsp
000000000146c8de	movq	%rsi, %rbx
000000000146c8e1	leaq	0x24264e(%rip), %rsi            ## literal pool for: "HgcScreeningMatte_hgc_visible"
000000000146c8e8	leaq	0x242690(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=000000024b\n[[ visible ]] FragmentOut HgcScreeningMatte_hgc_visible(const constant float4* hg_Params,\n    float4 color0,\n    float4 color1)\n{\n    const float4 c0 = float4(0.5000000000, 0.2117599994, 0.7699999809, 0.3411799967);\n    float4 r0, r1, r2, r3, r4;\n    FragmentOut output;\n\n    r0 = color0;\n    r1.w = color1.w;\n    r2.w = r0.w;\n    r3.xyz = r0.yyy*c0.xxx + c0.yyy;\n    r4.xyz = r0.yyy*c0.zzz + c0.www;\n    r3.xyz = select(r4.xyz, r3.xyz, hg_Params[0].xyz < 0.00000f);\n    r2.xyz = mix(r3.xyz, r0.xyz, r1.www);\n    output.color0 = r2;\n    return output;\n}\n"
000000000146c8ef	movq	%rbx, %rdi
000000000146c8f2	callq	0x14966d8                       ## symbol stub for: __ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_
000000000146c8f7	leaq	0x242656(%rip), %rsi            ## literal pool for: "HgcScreeningMatte"
000000000146c8fe	movq	%rbx, %rdi
000000000146c901	callq	0x14966d2                       ## symbol stub for: __ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc
000000000146c906	movl	$0x4, -0x90(%rbp)
000000000146c910	movb	$0x16, -0x88(%rbp)
000000000146c917	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
000000000146c921	movq	%rax, -0x87(%rbp)
000000000146c928	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
000000000146c92f	movb	$0x0, -0x7c(%rbp)
000000000146c933	movaps	0x116be6(%rip), %xmm0
000000000146c93a	movups	%xmm0, -0x70(%rbp)
000000000146c93e	leaq	-0x90(%rbp), %rsi
000000000146c945	movq	%rbx, %rdi
000000000146c948	callq	0x14966c6                       ## symbol stub for: __ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding
000000000146c94d	testb	$0x1, -0x88(%rbp)
000000000146c954	je	0x146c95f
000000000146c956	movq	-0x78(%rbp), %rdi
000000000146c95a	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146c95f	xorps	%xmm0, %xmm0
000000000146c962	movaps	%xmm0, -0x30(%rbp)
000000000146c966	movq	$0x0, -0x20(%rbp)
000000000146c96e	movl	$0x2, -0x60(%rbp)
000000000146c975	movb	$0xc, -0x58(%rbp)
000000000146c979	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000146c980	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000146c986	movb	$0x0, -0x51(%rbp)
000000000146c98a	movaps	0x11ce2f(%rip), %xmm0
000000000146c991	movups	%xmm0, -0x40(%rbp)
000000000146c995	leaq	-0x30(%rbp), %rdi
000000000146c999	leaq	-0x60(%rbp), %rsi
000000000146c99d	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000146c9a2	movq	%rax, -0x28(%rbp)
000000000146c9a6	testb	$0x1, -0x58(%rbp)
000000000146c9aa	je	0x146c9b9
000000000146c9ac	movq	-0x48(%rbp), %rdi
000000000146c9b0	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146c9b5	movq	-0x28(%rbp), %rax
000000000146c9b9	movl	$0xa, -0x60(%rbp)
000000000146c9c0	leaq	-0x58(%rbp), %r14
000000000146c9c4	movb	$0xc, -0x58(%rbp)
000000000146c9c8	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000146c9cf	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000146c9d5	movb	$0x0, -0x51(%rbp)
000000000146c9d9	movaps	0x116b40(%rip), %xmm0
000000000146c9e0	movups	%xmm0, -0x40(%rbp)
000000000146c9e4	cmpq	-0x20(%rbp), %rax
000000000146c9e8	jae	0x146ca22
000000000146c9ea	movl	$0xa, (%rax)
000000000146c9f0	movq	0x10(%r14), %rcx
000000000146c9f4	movq	%rcx, 0x18(%rax)
000000000146c9f8	movups	(%r14), %xmm0
000000000146c9fc	movups	%xmm0, 0x8(%rax)
000000000146ca00	xorps	%xmm0, %xmm0
000000000146ca03	movups	%xmm0, (%r14)
000000000146ca07	movq	$0x0, 0x10(%r14)
000000000146ca0f	movups	0x18(%r14), %xmm0
000000000146ca14	movups	%xmm0, 0x20(%rax)
000000000146ca18	addq	$0x30, %rax
000000000146ca1c	movq	%rax, -0x28(%rbp)
000000000146ca20	jmp	0x146ca46
000000000146ca22	leaq	-0x30(%rbp), %rdi
000000000146ca26	leaq	-0x60(%rbp), %rsi
000000000146ca2a	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000146ca2f	testb	$0x1, -0x58(%rbp)
000000000146ca33	movq	%rax, -0x28(%rbp)
000000000146ca37	je	0x146ca46
000000000146ca39	movq	-0x48(%rbp), %rdi
000000000146ca3d	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146ca42	movq	-0x28(%rbp), %rax
000000000146ca46	movl	$0xa, -0x60(%rbp)
000000000146ca4d	movb	$0xc, -0x58(%rbp)
000000000146ca51	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000146ca58	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000146ca5e	movb	$0x0, -0x51(%rbp)
000000000146ca62	movaps	0x116ab7(%rip), %xmm0
000000000146ca69	movups	%xmm0, -0x40(%rbp)
000000000146ca6d	cmpq	-0x20(%rbp), %rax
000000000146ca71	jae	0x146caab
000000000146ca73	movl	$0xa, (%rax)
000000000146ca79	movq	0x10(%r14), %rcx
000000000146ca7d	movq	%rcx, 0x18(%rax)
000000000146ca81	movups	(%r14), %xmm0
000000000146ca85	movups	%xmm0, 0x8(%rax)
000000000146ca89	xorps	%xmm0, %xmm0
000000000146ca8c	movups	%xmm0, (%r14)
000000000146ca90	movq	$0x0, 0x10(%r14)
000000000146ca98	movups	0x18(%r14), %xmm0
000000000146ca9d	movups	%xmm0, 0x20(%rax)
000000000146caa1	addq	$0x30, %rax
000000000146caa5	movq	%rax, -0x28(%rbp)
000000000146caa9	jmp	0x146cacb
000000000146caab	leaq	-0x30(%rbp), %rdi
000000000146caaf	leaq	-0x60(%rbp), %rsi
000000000146cab3	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000146cab8	testb	$0x1, -0x58(%rbp)
000000000146cabc	movq	%rax, -0x28(%rbp)
000000000146cac0	je	0x146cacb
000000000146cac2	movq	-0x48(%rbp), %rdi
000000000146cac6	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146cacb	leaq	-0x30(%rbp), %rsi
000000000146cacf	movq	%rbx, %rdi
000000000146cad2	callq	0x14966cc                       ## symbol stub for: __ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE
000000000146cad7	movq	-0x30(%rbp), %rbx
000000000146cadb	testq	%rbx, %rbx
000000000146cade	je	0x146cb18
000000000146cae0	movq	-0x28(%rbp), %r14
000000000146cae4	movq	%rbx, %rdi
000000000146cae7	cmpq	%r14, %rbx
000000000146caea	jne	0x146caf9
000000000146caec	jmp	0x146cb0f
000000000146caee	nop
000000000146caf0	addq	$-0x30, %r14
000000000146caf4	cmpq	%rbx, %r14
000000000146caf7	je	0x146cb0b
000000000146caf9	testb	$0x1, -0x28(%r14)
000000000146cafe	je	0x146caf0
000000000146cb00	movq	-0x18(%r14), %rdi
000000000146cb04	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146cb09	jmp	0x146caf0
000000000146cb0b	movq	-0x30(%rbp), %rdi
000000000146cb0f	movq	%rbx, -0x28(%rbp)
000000000146cb13	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146cb18	addq	$0x80, %rsp
000000000146cb1f	popq	%rbx
000000000146cb20	popq	%r14
000000000146cb22	popq	%rbp
000000000146cb23	retq
000000000146cb24	jmp	0x146cb2d
000000000146cb26	jmp	0x146cb2d
000000000146cb28	movq	%rax, %rbx
000000000146cb2b	jmp	0x146cb3f
000000000146cb2d	movq	%rax, %rbx
000000000146cb30	testb	$0x1, -0x58(%rbp)
000000000146cb34	je	0x146cb3f
000000000146cb36	movq	-0x48(%rbp), %rdi
000000000146cb3a	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146cb3f	leaq	-0x30(%rbp), %rdi
000000000146cb43	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
000000000146cb48	movq	%rbx, %rdi
000000000146cb4b	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000146cb50	movq	%rax, %rbx
000000000146cb53	testb	$0x1, -0x88(%rbp)
000000000146cb5a	je	0x146cb48
000000000146cb5c	movq	-0x78(%rbp), %rdi
000000000146cb60	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146cb65	movq	%rbx, %rdi
000000000146cb68	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000146cb6d	nopl	(%rax)
