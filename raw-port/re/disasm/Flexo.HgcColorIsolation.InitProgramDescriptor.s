__ZNK17HgcColorIsolation21InitProgramDescriptorEP19HGProgramDescriptor:
000000000145af20	pushq	%rbp
000000000145af21	movq	%rsp, %rbp
000000000145af24	pushq	%r14
000000000145af26	pushq	%rbx
000000000145af27	subq	$0x80, %rsp
000000000145af2e	movq	%rsi, %rbx
000000000145af31	leaq	0x24b6cd(%rip), %rsi            ## literal pool for: "HgcColorIsolation_hgc_visible"
000000000145af38	leaq	0x24b728(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=00000005f6\n[[ visible ]] FragmentOut HgcColorIsolation_hgc_visible(const constant float4* hg_Params,\n    float4 color0, \n    texture2d< float > hg_Texture1, \n    sampler hg_Sampler1)\n{\n    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 1.000000000);\n    float4 r0, r1, r2, r3, r4, r5;\n    FragmentOut output;\n\n    r0.xyz = clamp(color0.xyz, 0.00000f, 1.00000f);\n    r0.w = c0.w;\n    r1.x = dot(r0, hg_Params[0]);\n    r2.x = dot(r0, hg_Params[1]);\n    r3.x = dot(r0, hg_Params[2]);\n    r4.x = dot(r0, hg_Params[3]);\n    r5.x = dot(r0, hg_Params[4]);\n    r0.x = dot(r0, hg_Params[5]);\n    r1.x = pow(fabs(r1.x), hg_Params[6].x);\n    r2.x = pow(fabs(r2.x), hg_Params[6].x);\n    r3.x = pow(fabs(r3.x), hg_Params[6].x);\n    r1.x = r1.x + r2.x;\n    r1.x = r1.x + r3.x;\n    r1.xw = pow(r1.xx, hg_Params[6].yy);\n    r4.x = pow(fabs(r4.x), hg_Params[6].x);\n    r5.x = pow(fabs(r5.x), hg_Params[6].x);\n    r0.x = pow(fabs(r0.x), hg_Params[6].x);\n    r4.x = r4.x + r5.x;\n    r4.x = r4.x + r0.x;\n    r4.xw = pow(r4.xx, hg_Params[6].yy);\n    r2.w = r4.w*r1.w + -r4.w;\n    r1.x = r1.x - r4.x;\n    r2.w = clamp(r2.w/r1.x, 0.00000f, 1.00000f);\n    r2.w = c0.w - r2.w;\n    r2.w = clamp(r2.w*hg_Params[8].w + hg_Params[7].w, 0.00000f, 1.00000f);\n    r2.x = r2.w*hg_Params[9].x;\n    r2.x = fmax(r2.x, c0.x);\n    r3.x = hg_Params[9].x - c0.x;\n    r2.x = fmin(r2.x, r3.x);\n    r2.y = c0.x;\n    output.color0.w = hg_Texture1.sample(hg_Sampler1, r2.xy).w;\n    output.color0.xyz = c0.www;\n    return output;\n}\n"
000000000145af3f	movq	%rbx, %rdi
000000000145af42	callq	0x14966d8                       ## symbol stub for: __ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_
000000000145af47	leaq	0x24b6d5(%rip), %rsi            ## literal pool for: "HgcColorIsolation"
000000000145af4e	movq	%rbx, %rdi
000000000145af51	callq	0x14966d2                       ## symbol stub for: __ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc
000000000145af56	movl	$0x4, -0x90(%rbp)
000000000145af60	movb	$0x16, -0x88(%rbp)
000000000145af67	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
000000000145af71	movq	%rax, -0x87(%rbp)
000000000145af78	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
000000000145af7f	movb	$0x0, -0x7c(%rbp)
000000000145af83	movaps	0x128596(%rip), %xmm0
000000000145af8a	movups	%xmm0, -0x70(%rbp)
000000000145af8e	leaq	-0x90(%rbp), %rsi
000000000145af95	movq	%rbx, %rdi
000000000145af98	callq	0x14966c6                       ## symbol stub for: __ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding
000000000145af9d	testb	$0x1, -0x88(%rbp)
000000000145afa4	je	0x145afaf
000000000145afa6	movq	-0x78(%rbp), %rdi
000000000145afaa	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000145afaf	xorps	%xmm0, %xmm0
000000000145afb2	movaps	%xmm0, -0x30(%rbp)
000000000145afb6	movq	$0x0, -0x20(%rbp)
000000000145afbe	movl	$0x2, -0x60(%rbp)
000000000145afc5	movb	$0xc, -0x58(%rbp)
000000000145afc9	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000145afd0	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000145afd6	movb	$0x0, -0x51(%rbp)
000000000145afda	movaps	0x12e02f(%rip), %xmm0
000000000145afe1	movups	%xmm0, -0x40(%rbp)
000000000145afe5	leaq	-0x30(%rbp), %rdi
000000000145afe9	leaq	-0x60(%rbp), %rsi
000000000145afed	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000145aff2	movq	%rax, -0x28(%rbp)
000000000145aff6	testb	$0x1, -0x58(%rbp)
000000000145affa	je	0x145b009
000000000145affc	movq	-0x48(%rbp), %rdi
000000000145b000	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000145b005	movq	-0x28(%rbp), %rax
000000000145b009	movl	$0xa, -0x60(%rbp)
000000000145b010	leaq	-0x58(%rbp), %r14
000000000145b014	movb	$0xc, -0x58(%rbp)
000000000145b018	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000145b01f	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000145b025	movb	$0x0, -0x51(%rbp)
000000000145b029	movaps	0x1284f0(%rip), %xmm0
000000000145b030	movups	%xmm0, -0x40(%rbp)
000000000145b034	cmpq	-0x20(%rbp), %rax
000000000145b038	jae	0x145b072
000000000145b03a	movl	$0xa, (%rax)
000000000145b040	movq	0x10(%r14), %rcx
000000000145b044	movq	%rcx, 0x18(%rax)
000000000145b048	movups	(%r14), %xmm0
000000000145b04c	movups	%xmm0, 0x8(%rax)
000000000145b050	xorps	%xmm0, %xmm0
000000000145b053	movups	%xmm0, (%r14)
000000000145b057	movq	$0x0, 0x10(%r14)
000000000145b05f	movups	0x18(%r14), %xmm0
000000000145b064	movups	%xmm0, 0x20(%rax)
000000000145b068	addq	$0x30, %rax
000000000145b06c	movq	%rax, -0x28(%rbp)
000000000145b070	jmp	0x145b096
000000000145b072	leaq	-0x30(%rbp), %rdi
000000000145b076	leaq	-0x60(%rbp), %rsi
000000000145b07a	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000145b07f	testb	$0x1, -0x58(%rbp)
000000000145b083	movq	%rax, -0x28(%rbp)
000000000145b087	je	0x145b096
000000000145b089	movq	-0x48(%rbp), %rdi
000000000145b08d	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000145b092	movq	-0x28(%rbp), %rax
000000000145b096	movl	$0x9, -0x60(%rbp)
000000000145b09d	movb	$0x20, -0x58(%rbp)
000000000145b0a1	movups	0x24b58d(%rip), %xmm0           ## literal pool for: "texture2d<float>"
000000000145b0a8	movups	%xmm0, -0x57(%rbp)
000000000145b0ac	movb	$0x0, -0x47(%rbp)
000000000145b0b0	movaps	0x128469(%rip), %xmm0
000000000145b0b7	movups	%xmm0, -0x40(%rbp)
000000000145b0bb	cmpq	-0x20(%rbp), %rax
000000000145b0bf	jae	0x145b0f9
000000000145b0c1	movl	$0x9, (%rax)
000000000145b0c7	movq	0x10(%r14), %rcx
000000000145b0cb	movq	%rcx, 0x18(%rax)
000000000145b0cf	movups	(%r14), %xmm0
000000000145b0d3	movups	%xmm0, 0x8(%rax)
000000000145b0d7	xorps	%xmm0, %xmm0
000000000145b0da	movups	%xmm0, (%r14)
000000000145b0de	movq	$0x0, 0x10(%r14)
000000000145b0e6	movups	0x18(%r14), %xmm0
000000000145b0eb	movups	%xmm0, 0x20(%rax)
000000000145b0ef	addq	$0x30, %rax
000000000145b0f3	movq	%rax, -0x28(%rbp)
000000000145b0f7	jmp	0x145b11d
000000000145b0f9	leaq	-0x30(%rbp), %rdi
000000000145b0fd	leaq	-0x60(%rbp), %rsi
000000000145b101	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000145b106	testb	$0x1, -0x58(%rbp)
000000000145b10a	movq	%rax, -0x28(%rbp)
000000000145b10e	je	0x145b11d
000000000145b110	movq	-0x48(%rbp), %rdi
000000000145b114	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000145b119	movq	-0x28(%rbp), %rax
000000000145b11d	movl	$0x6, -0x60(%rbp)
000000000145b124	movb	$0xe, -0x58(%rbp)
000000000145b128	movl	$0x706d6173, -0x57(%rbp)        ## imm = 0x706D6173
000000000145b12f	movl	$0x72656c70, -0x54(%rbp)        ## imm = 0x72656C70
000000000145b136	movb	$0x0, -0x50(%rbp)
000000000145b13a	movaps	0x1283df(%rip), %xmm0
000000000145b141	movups	%xmm0, -0x40(%rbp)
000000000145b145	cmpq	-0x20(%rbp), %rax
000000000145b149	jae	0x145b183
000000000145b14b	movl	$0x6, (%rax)
000000000145b151	movq	0x10(%r14), %rcx
000000000145b155	movq	%rcx, 0x18(%rax)
000000000145b159	movups	(%r14), %xmm0
000000000145b15d	movups	%xmm0, 0x8(%rax)
000000000145b161	xorps	%xmm0, %xmm0
000000000145b164	movups	%xmm0, (%r14)
000000000145b168	movq	$0x0, 0x10(%r14)
000000000145b170	movups	0x18(%r14), %xmm0
000000000145b175	movups	%xmm0, 0x20(%rax)
000000000145b179	addq	$0x30, %rax
000000000145b17d	movq	%rax, -0x28(%rbp)
000000000145b181	jmp	0x145b1a3
000000000145b183	leaq	-0x30(%rbp), %rdi
000000000145b187	leaq	-0x60(%rbp), %rsi
000000000145b18b	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000145b190	testb	$0x1, -0x58(%rbp)
000000000145b194	movq	%rax, -0x28(%rbp)
000000000145b198	je	0x145b1a3
000000000145b19a	movq	-0x48(%rbp), %rdi
000000000145b19e	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000145b1a3	leaq	-0x30(%rbp), %rsi
000000000145b1a7	movq	%rbx, %rdi
000000000145b1aa	callq	0x14966cc                       ## symbol stub for: __ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE
000000000145b1af	movq	-0x30(%rbp), %rbx
000000000145b1b3	testq	%rbx, %rbx
000000000145b1b6	je	0x145b1f8
000000000145b1b8	movq	-0x28(%rbp), %r14
000000000145b1bc	movq	%rbx, %rdi
000000000145b1bf	cmpq	%r14, %rbx
000000000145b1c2	jne	0x145b1d9
000000000145b1c4	jmp	0x145b1ef
000000000145b1c6	nopw	%cs:(%rax,%rax)
000000000145b1d0	addq	$-0x30, %r14
000000000145b1d4	cmpq	%rbx, %r14
000000000145b1d7	je	0x145b1eb
000000000145b1d9	testb	$0x1, -0x28(%r14)
000000000145b1de	je	0x145b1d0
000000000145b1e0	movq	-0x18(%r14), %rdi
000000000145b1e4	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000145b1e9	jmp	0x145b1d0
000000000145b1eb	movq	-0x30(%rbp), %rdi
000000000145b1ef	movq	%rbx, -0x28(%rbp)
000000000145b1f3	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000145b1f8	addq	$0x80, %rsp
000000000145b1ff	popq	%rbx
000000000145b200	popq	%r14
000000000145b202	popq	%rbp
000000000145b203	retq
000000000145b204	jmp	0x145b20f
000000000145b206	jmp	0x145b20f
000000000145b208	jmp	0x145b20f
000000000145b20a	movq	%rax, %rbx
000000000145b20d	jmp	0x145b221
000000000145b20f	movq	%rax, %rbx
000000000145b212	testb	$0x1, -0x58(%rbp)
000000000145b216	je	0x145b221
000000000145b218	movq	-0x48(%rbp), %rdi
000000000145b21c	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000145b221	leaq	-0x30(%rbp), %rdi
000000000145b225	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
000000000145b22a	movq	%rbx, %rdi
000000000145b22d	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000145b232	movq	%rax, %rbx
000000000145b235	testb	$0x1, -0x88(%rbp)
000000000145b23c	je	0x145b22a
000000000145b23e	movq	-0x78(%rbp), %rdi
000000000145b242	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000145b247	movq	%rbx, %rdi
000000000145b24a	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000145b24f	nop
