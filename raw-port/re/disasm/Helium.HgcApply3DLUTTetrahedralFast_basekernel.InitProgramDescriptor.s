__ZNK39HgcApply3DLUTTetrahedralFast_basekernel21InitProgramDescriptorEP19HGProgramDescriptor:
000000000038a0a0	pushq	%rbp
000000000038a0a1	movq	%rsp, %rbp
000000000038a0a4	pushq	%r14
000000000038a0a6	pushq	%rbx
000000000038a0a7	subq	$0x80, %rsp
000000000038a0ae	movq	%rsi, %rbx
000000000038a0b1	leaq	0x644015(%rip), %rsi            ## literal pool for: "HgcApply3DLUTTetrahedralFast_basekernel_hgc_visible"
000000000038a0b8	leaq	0x644099(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=0000000e0b\n[[ visible ]] FragmentOut HgcApply3DLUTTetrahedralFast_basekernel_hgc_visible(const constant float4* hg_Params,\n    float4 color0, \n    texture2d< float > hg_Texture1, \n    sampler hg_Sampler1)\n{\n    const float4 c0 = float4(0.000000000, 1.000000000, 0.5000000000, 0.000000000);\n    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16, r17, r18, r19;\n    FragmentOut output;\n\n    r0 = color0;\n    r1.xyz = r0.xyz*hg_Params[0].xxx + hg_Params[0].yyy;\n    r2.xyz = r1.xyz*r1.xyz;\n    r3.xyz = r2.xyz*r1.xyz;\n    r1.xyz = r1.xyz*hg_Params[3].yyy + hg_Params[3].xxx;\n    r1.xyz = r2.xyz*hg_Params[3].zzz + r1.xyz;\n    r1.xyz = r3.xyz*hg_Params[3].www + r1.xyz;\n    r1.xyz = fmax(r1.xyz, c0.xxx);\n    r2.xyz = hg_Params[1].yyy - c0.yyy;\n    r1.xyz = fmin(r1.xyz, r2.xyz);\n    r3.xyz = fract(r1.xyz);\n    r1.xyz = floor(r1.xyz);\n    r4.xyz = r1.xyz + c0.yyy;\n    r4.xyz = fmin(r4.xyz, r2.xyz);\n    r4.xyz = r4.xyz - r1.xyz;\n    r4.xyz = r4.xyz*hg_Params[1].xyz;\n    r2.x = dot(r1.xy, hg_Params[1].xy);\n    r2.y = r1.z;\n    r2.xy = r2.xy + c0.zz;\n    r1.xy = r2.xy + hg_Params[4].xy;\n    r1.xy = r1.xy*hg_Params[4].zw;\n    r1 = hg_Texture1.sample(hg_Sampler1, r1.xy);\n    r2.x = r2.x + r4.x;\n    r5.xy = r2.xy + hg_Params[4].xy;\n    r5.xy = r5.xy*hg_Params[4].zw;\n    r5 = hg_Texture1.sample(hg_Sampler1, r5.xy);\n    r2.x = r2.x + r4.y;\n    r6.xy = r2.xy + hg_Params[4].xy;\n    r6.xy = r6.xy*hg_Params[4].zw;\n    r6 = hg_Texture1.sample(hg_Sampler1, r6.xy);\n    r2.x = r2.x - r4.x;\n    r7.xy = r2.xy + hg_Params[4].xy;\n    r7.xy = r7.xy*hg_Params[4].zw;\n    r7 = hg_Texture1.sample(hg_Sampler1, r7.xy);\n    r2.y = r2.y + r4.z;\n    r8.xy = r2.xy + hg_Params[4].xy;\n    r8.xy = r8.xy*hg_Params[4].zw;\n    r8 = hg_Texture1.sample(hg_Sampler1, r8.xy);\n    r2.x = r2.x - r4.y;\n    r9.xy = r2.xy + hg_Params[4].xy;\n    r9.xy = r9.xy*hg_Params[4].zw;\n    r9 = hg_Texture1.sample(hg_Sampler1, r9.xy);\n    r2.x = r2.x + r4.x;\n    r10.xy = r2.xy + hg_Params[4].xy;\n    r10.xy = r10.xy*hg_Params[4].zw;\n    r10 = hg_Texture1.sample(hg_Sampler1, r10.xy);\n    r2.x = r2.x + r4.y;\n    r2.xy = r2.xy + hg_Params[4].xy;\n    r2.xy = r2.xy*hg_Params[4].zw;\n    r2 = hg_Texture1.sample(hg_Sampler1, r2.xy);\n    r4 = float4(r3.xzzy > r3.yxyz);\n    r11.x = float(r3.y > r3.x);\n    r12 = float4(r3.yxxz >= r3.xyzy);\n    r13 = r2 - r8;\n    r14 = r7 - r1;\n    r15 = r8 - r7;\n    r16 = r13*r3.xxxx;\n    r16 = r14*r3.yyyy + r16;\n    r15 = r15*r3.zzzz + r16;\n    r16 = r10 - r9;\n    r17 = r2 - r10;\n    r18 = r9 - r1;\n    r16 = r16*r3.xxxx;\n    r16 = r17*r3.yyyy + r16;\n    r16 = r18*r3.zzzz + r16;\n    r19 = fmin(r4.xxxx, r4.yyyy);\n    r15 = select(r15, r16, r19 > 0.00000f);\n    r8 = r8 - r9;\n    r13 = r13*r3.xxxx;\n    r13 = r8*r3.yyyy + r13;\n    r13 = r18*r3.zzzz + r13;\n    r19 = fmin(r12.xxxx, r4.zzzz);\n    r15 = select(r15, r13, r19 > 0.00000f);\n    r16 = r5 - r1;\n    r9 = r6 - r5;\n    r2 = r2 - r6;\n    r8 = r16*r3.xxxx;\n    r8 = r9*r3.yyyy + r8;\n    r8 = r2*r3.zzzz + r8;\n    r4 = fmin(r4.wwww, r12.yyyy);\n    r15 = select(r15, r8, r4 > 0.00000f);\n    r6 = r6 - r7;\n    r6 = r6*r3.xxxx;\n    r6 = r14*r3.yyyy + r6;\n    r6 = r2*r3.zzzz + r6;\n    r11 = fmin(r12.zzzz, r11.xxxx);\n    r15 = select(r15, r6, r11 > 0.00000f);\n    r10 = r10 - r5;\n    r16 = r16*r3.xxxx;\n    r16 = r17*r3.yyyy + r16;\n    r16 = r10*r3.zzzz + r16;\n    r12 = fmin(r12.wwww, r12.zzzz);\n    r12 = select(r15, r16, r12 > 0.00000f);\n    r12 = r12 + r1;\n    r12 = r12*hg_Params[0].zzzz + hg_Params[0].wwww;\n    output.color0 = select(r12, r0, hg_Params[2] < 0.00000f);\n    return output;\n}\n"
000000000038a0bf	movq	%rbx, %rdi
000000000038a0c2	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
000000000038a0c7	leaq	0x644033(%rip), %rsi            ## literal pool for: "HgcApply3DLUTTetrahedralFast_basekernel"
000000000038a0ce	movq	%rbx, %rdi
000000000038a0d1	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
000000000038a0d6	movl	$0x4, -0x90(%rbp)
000000000038a0e0	movb	$0x16, -0x88(%rbp)
000000000038a0e7	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
000000000038a0f1	movq	%rax, -0x87(%rbp)
000000000038a0f8	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
000000000038a0ff	movb	$0x0, -0x7c(%rbp)
000000000038a103	movaps	0x40f86(%rip), %xmm0
000000000038a10a	movups	%xmm0, -0x70(%rbp)
000000000038a10e	leaq	-0x90(%rbp), %rsi
000000000038a115	movq	%rbx, %rdi
000000000038a118	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
000000000038a11d	testb	$0x1, -0x88(%rbp)
000000000038a124	je	0x38a12f
000000000038a126	movq	-0x78(%rbp), %rdi
000000000038a12a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000038a12f	xorps	%xmm0, %xmm0
000000000038a132	movaps	%xmm0, -0x30(%rbp)
000000000038a136	movq	$0x0, -0x20(%rbp)
000000000038a13e	movl	$0x2, -0x60(%rbp)
000000000038a145	movb	$0xc, -0x58(%rbp)
000000000038a149	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000038a150	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000038a156	movb	$0x0, -0x51(%rbp)
000000000038a15a	movaps	0x5032ff(%rip), %xmm0
000000000038a161	movups	%xmm0, -0x40(%rbp)
000000000038a165	leaq	-0x30(%rbp), %rdi
000000000038a169	leaq	-0x60(%rbp), %rsi
000000000038a16d	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000038a172	movq	%rax, -0x28(%rbp)
000000000038a176	testb	$0x1, -0x58(%rbp)
000000000038a17a	je	0x38a189
000000000038a17c	movq	-0x48(%rbp), %rdi
000000000038a180	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000038a185	movq	-0x28(%rbp), %rax
000000000038a189	movl	$0xa, -0x60(%rbp)
000000000038a190	leaq	-0x58(%rbp), %r14
000000000038a194	movb	$0xc, -0x58(%rbp)
000000000038a198	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
000000000038a19f	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
000000000038a1a5	movb	$0x0, -0x51(%rbp)
000000000038a1a9	movaps	0x40ee0(%rip), %xmm0
000000000038a1b0	movups	%xmm0, -0x40(%rbp)
000000000038a1b4	cmpq	-0x20(%rbp), %rax
000000000038a1b8	jae	0x38a1f2
000000000038a1ba	movl	$0xa, (%rax)
000000000038a1c0	movq	0x10(%r14), %rcx
000000000038a1c4	movq	%rcx, 0x18(%rax)
000000000038a1c8	movups	(%r14), %xmm0
000000000038a1cc	movups	%xmm0, 0x8(%rax)
000000000038a1d0	xorps	%xmm0, %xmm0
000000000038a1d3	movups	%xmm0, (%r14)
000000000038a1d7	movq	$0x0, 0x10(%r14)
000000000038a1df	movups	0x18(%r14), %xmm0
000000000038a1e4	movups	%xmm0, 0x20(%rax)
000000000038a1e8	addq	$0x30, %rax
000000000038a1ec	movq	%rax, -0x28(%rbp)
000000000038a1f0	jmp	0x38a216
000000000038a1f2	leaq	-0x30(%rbp), %rdi
000000000038a1f6	leaq	-0x60(%rbp), %rsi
000000000038a1fa	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000038a1ff	testb	$0x1, -0x58(%rbp)
000000000038a203	movq	%rax, -0x28(%rbp)
000000000038a207	je	0x38a216
000000000038a209	movq	-0x48(%rbp), %rdi
000000000038a20d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000038a212	movq	-0x28(%rbp), %rax
000000000038a216	movl	$0x9, -0x60(%rbp)
000000000038a21d	movb	$0x20, -0x58(%rbp)
000000000038a221	movups	0x5714e9(%rip), %xmm0           ## literal pool for: "texture2d<float>"
000000000038a228	movups	%xmm0, -0x57(%rbp)
000000000038a22c	movb	$0x0, -0x47(%rbp)
000000000038a230	movaps	0x40e59(%rip), %xmm0
000000000038a237	movups	%xmm0, -0x40(%rbp)
000000000038a23b	cmpq	-0x20(%rbp), %rax
000000000038a23f	jae	0x38a279
000000000038a241	movl	$0x9, (%rax)
000000000038a247	movq	0x10(%r14), %rcx
000000000038a24b	movq	%rcx, 0x18(%rax)
000000000038a24f	movups	(%r14), %xmm0
000000000038a253	movups	%xmm0, 0x8(%rax)
000000000038a257	xorps	%xmm0, %xmm0
000000000038a25a	movups	%xmm0, (%r14)
000000000038a25e	movq	$0x0, 0x10(%r14)
000000000038a266	movups	0x18(%r14), %xmm0
000000000038a26b	movups	%xmm0, 0x20(%rax)
000000000038a26f	addq	$0x30, %rax
000000000038a273	movq	%rax, -0x28(%rbp)
000000000038a277	jmp	0x38a29d
000000000038a279	leaq	-0x30(%rbp), %rdi
000000000038a27d	leaq	-0x60(%rbp), %rsi
000000000038a281	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000038a286	testb	$0x1, -0x58(%rbp)
000000000038a28a	movq	%rax, -0x28(%rbp)
000000000038a28e	je	0x38a29d
000000000038a290	movq	-0x48(%rbp), %rdi
000000000038a294	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000038a299	movq	-0x28(%rbp), %rax
000000000038a29d	movl	$0x6, -0x60(%rbp)
000000000038a2a4	movb	$0xe, -0x58(%rbp)
000000000038a2a8	movl	$0x706d6173, -0x57(%rbp)        ## imm = 0x706D6173
000000000038a2af	movl	$0x72656c70, -0x54(%rbp)        ## imm = 0x72656C70
000000000038a2b6	movb	$0x0, -0x50(%rbp)
000000000038a2ba	movaps	0x40dcf(%rip), %xmm0
000000000038a2c1	movups	%xmm0, -0x40(%rbp)
000000000038a2c5	cmpq	-0x20(%rbp), %rax
000000000038a2c9	jae	0x38a303
000000000038a2cb	movl	$0x6, (%rax)
000000000038a2d1	movq	0x10(%r14), %rcx
000000000038a2d5	movq	%rcx, 0x18(%rax)
000000000038a2d9	movups	(%r14), %xmm0
000000000038a2dd	movups	%xmm0, 0x8(%rax)
000000000038a2e1	xorps	%xmm0, %xmm0
000000000038a2e4	movups	%xmm0, (%r14)
000000000038a2e8	movq	$0x0, 0x10(%r14)
000000000038a2f0	movups	0x18(%r14), %xmm0
000000000038a2f5	movups	%xmm0, 0x20(%rax)
000000000038a2f9	addq	$0x30, %rax
000000000038a2fd	movq	%rax, -0x28(%rbp)
000000000038a301	jmp	0x38a323
000000000038a303	leaq	-0x30(%rbp), %rdi
000000000038a307	leaq	-0x60(%rbp), %rsi
000000000038a30b	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000038a310	testb	$0x1, -0x58(%rbp)
000000000038a314	movq	%rax, -0x28(%rbp)
000000000038a318	je	0x38a323
000000000038a31a	movq	-0x48(%rbp), %rdi
000000000038a31e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000038a323	leaq	-0x30(%rbp), %rsi
000000000038a327	movq	%rbx, %rdi
000000000038a32a	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
000000000038a32f	movq	-0x30(%rbp), %rbx
000000000038a333	testq	%rbx, %rbx
000000000038a336	je	0x38a378
000000000038a338	movq	-0x28(%rbp), %r14
000000000038a33c	movq	%rbx, %rdi
000000000038a33f	cmpq	%r14, %rbx
000000000038a342	jne	0x38a359
000000000038a344	jmp	0x38a36f
000000000038a346	nopw	%cs:(%rax,%rax)
000000000038a350	addq	$-0x30, %r14
000000000038a354	cmpq	%rbx, %r14
000000000038a357	je	0x38a36b
000000000038a359	testb	$0x1, -0x28(%r14)
000000000038a35e	je	0x38a350
000000000038a360	movq	-0x18(%r14), %rdi
000000000038a364	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000038a369	jmp	0x38a350
000000000038a36b	movq	-0x30(%rbp), %rdi
000000000038a36f	movq	%rbx, -0x28(%rbp)
000000000038a373	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000038a378	addq	$0x80, %rsp
000000000038a37f	popq	%rbx
000000000038a380	popq	%r14
000000000038a382	popq	%rbp
000000000038a383	retq
000000000038a384	jmp	0x38a38f
000000000038a386	jmp	0x38a38f
000000000038a388	jmp	0x38a38f
000000000038a38a	movq	%rax, %rbx
000000000038a38d	jmp	0x38a3a1
000000000038a38f	movq	%rax, %rbx
000000000038a392	testb	$0x1, -0x58(%rbp)
000000000038a396	je	0x38a3a1
000000000038a398	movq	-0x48(%rbp), %rdi
000000000038a39c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000038a3a1	leaq	-0x30(%rbp), %rdi
000000000038a3a5	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
000000000038a3aa	movq	%rbx, %rdi
000000000038a3ad	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000038a3b2	movq	%rax, %rbx
000000000038a3b5	testb	$0x1, -0x88(%rbp)
000000000038a3bc	je	0x38a3aa
000000000038a3be	movq	-0x78(%rbp), %rdi
000000000038a3c2	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000038a3c7	movq	%rbx, %rdi
000000000038a3ca	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000038a3cf	nop
