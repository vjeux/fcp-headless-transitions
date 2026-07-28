__ZNK42HgcApply3DLUTTetrahedralUniform_basekernel21InitProgramDescriptorEP19HGProgramDescriptor:
0000000000398ee0	pushq	%rbp
0000000000398ee1	movq	%rsp, %rbp
0000000000398ee4	pushq	%r14
0000000000398ee6	pushq	%rbx
0000000000398ee7	subq	$0x80, %rsp
0000000000398eee	movq	%rsi, %rbx
0000000000398ef1	leaq	0x63ccc3(%rip), %rsi            ## literal pool for: "HgcApply3DLUTTetrahedralUniform_basekernel_hgc_visible"
0000000000398ef8	leaq	0x63cd50(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=0000000d5b\n[[ visible ]] FragmentOut HgcApply3DLUTTetrahedralUniform_basekernel_hgc_visible(const constant float4* hg_Params,\n    float4 color0, \n    texture2d< float > hg_Texture1, \n    sampler hg_Sampler1)\n{\n    const float4 c0 = float4(1.000000000, 0.000000000, 0.5000000000, 0.000000000);\n    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16, r17, r18, r19;\n    FragmentOut output;\n\n    r0 = color0;\n    r1.xyz = r0.xyz*hg_Params[0].xxx + hg_Params[0].yyy;\n    r2.xyz = hg_Params[1].yyy - c0.xxx;\n    r1.xyz = r1.xyz*r2.xyz;\n    r1.xyz = fmax(r1.xyz, c0.yyy);\n    r1.xyz = fmin(r1.xyz, r2.xyz);\n    r3.xyz = fract(r1.xyz);\n    r1.xyz = floor(r1.xyz);\n    r4.xyz = r1.xyz + c0.xxx;\n    r4.xyz = fmin(r4.xyz, r2.xyz);\n    r4.xyz = r4.xyz - r1.xyz;\n    r4.xyz = r4.xyz*hg_Params[1].xyz;\n    r2.x = dot(r1.xy, hg_Params[1].xy);\n    r2.y = r1.z;\n    r2.xy = r2.xy + c0.zz;\n    r1.xy = r2.xy + hg_Params[3].xy;\n    r1.xy = r1.xy*hg_Params[3].zw;\n    r1 = hg_Texture1.sample(hg_Sampler1, r1.xy);\n    r2.x = r2.x + r4.x;\n    r5.xy = r2.xy + hg_Params[3].xy;\n    r5.xy = r5.xy*hg_Params[3].zw;\n    r5 = hg_Texture1.sample(hg_Sampler1, r5.xy);\n    r2.x = r2.x + r4.y;\n    r6.xy = r2.xy + hg_Params[3].xy;\n    r6.xy = r6.xy*hg_Params[3].zw;\n    r6 = hg_Texture1.sample(hg_Sampler1, r6.xy);\n    r2.x = r2.x - r4.x;\n    r7.xy = r2.xy + hg_Params[3].xy;\n    r7.xy = r7.xy*hg_Params[3].zw;\n    r7 = hg_Texture1.sample(hg_Sampler1, r7.xy);\n    r2.y = r2.y + r4.z;\n    r8.xy = r2.xy + hg_Params[3].xy;\n    r8.xy = r8.xy*hg_Params[3].zw;\n    r8 = hg_Texture1.sample(hg_Sampler1, r8.xy);\n    r2.x = r2.x - r4.y;\n    r9.xy = r2.xy + hg_Params[3].xy;\n    r9.xy = r9.xy*hg_Params[3].zw;\n    r9 = hg_Texture1.sample(hg_Sampler1, r9.xy);\n    r2.x = r2.x + r4.x;\n    r10.xy = r2.xy + hg_Params[3].xy;\n    r10.xy = r10.xy*hg_Params[3].zw;\n    r10 = hg_Texture1.sample(hg_Sampler1, r10.xy);\n    r2.x = r2.x + r4.y;\n    r2.xy = r2.xy + hg_Params[3].xy;\n    r2.xy = r2.xy*hg_Params[3].zw;\n    r2 = hg_Texture1.sample(hg_Sampler1, r2.xy);\n    r4 = float4(r3.xzzy > r3.yxyz);\n    r11.x = float(r3.y > r3.x);\n    r12 = float4(r3.yxxz >= r3.xyzy);\n    r13 = r2 - r8;\n    r14 = r7 - r1;\n    r15 = r8 - r7;\n    r16 = r13*r3.xxxx;\n    r16 = r14*r3.yyyy + r16;\n    r15 = r15*r3.zzzz + r16;\n    r16 = r10 - r9;\n    r17 = r2 - r10;\n    r18 = r9 - r1;\n    r16 = r16*r3.xxxx;\n    r16 = r17*r3.yyyy + r16;\n    r16 = r18*r3.zzzz + r16;\n    r19 = fmin(r4.xxxx, r4.yyyy);\n    r15 = select(r15, r16, r19 > 0.00000f);\n    r8 = r8 - r9;\n    r13 = r13*r3.xxxx;\n    r13 = r8*r3.yyyy + r13;\n    r13 = r18*r3.zzzz + r13;\n    r19 = fmin(r12.xxxx, r4.zzzz);\n    r15 = select(r15, r13, r19 > 0.00000f);\n    r16 = r5 - r1;\n    r9 = r6 - r5;\n    r2 = r2 - r6;\n    r8 = r16*r3.xxxx;\n    r8 = r9*r3.yyyy + r8;\n    r8 = r2*r3.zzzz + r8;\n    r4 = fmin(r4.wwww, r12.yyyy);\n    r15 = select(r15, r8, r4 > 0.00000f);\n    r6 = r6 - r7;\n    r6 = r6*r3.xxxx;\n    r6 = r14*r3.yyyy + r6;\n    r6 = r2*r3.zzzz + r6;\n    r11 = fmin(r12.zzzz, r11.xxxx);\n    r15 = select(r15, r6, r11 > 0.00000f);\n    r10 = r10 - r5;\n    r16 = r16*r3.xxxx;\n    r16 = r17*r3.yyyy + r16;\n    r16 = r10*r3.zzzz + r16;\n    r12 = fmin(r12.wwww, r12.zzzz);\n    r12 = select(r15, r16, r12 > 0.00000f);\n    r12 = r12 + r1;\n    r12 = r12*hg_Params[0].zzzz + hg_Params[0].wwww;\n    output.color0 = select(r12, r0, hg_Params[2] < 0.00000f);\n    return output;\n}\n"
0000000000398eff	movq	%rbx, %rdi
0000000000398f02	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
0000000000398f07	leaq	0x63cce4(%rip), %rsi            ## literal pool for: "HgcApply3DLUTTetrahedralUniform_basekernel"
0000000000398f0e	movq	%rbx, %rdi
0000000000398f11	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
0000000000398f16	movl	$0x4, -0x90(%rbp)
0000000000398f20	movb	$0x16, -0x88(%rbp)
0000000000398f27	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
0000000000398f31	movq	%rax, -0x87(%rbp)
0000000000398f38	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
0000000000398f3f	movb	$0x0, -0x7c(%rbp)
0000000000398f43	movaps	0x32146(%rip), %xmm0
0000000000398f4a	movups	%xmm0, -0x70(%rbp)
0000000000398f4e	leaq	-0x90(%rbp), %rsi
0000000000398f55	movq	%rbx, %rdi
0000000000398f58	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
0000000000398f5d	testb	$0x1, -0x88(%rbp)
0000000000398f64	je	0x398f6f
0000000000398f66	movq	-0x78(%rbp), %rdi
0000000000398f6a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000398f6f	xorps	%xmm0, %xmm0
0000000000398f72	movaps	%xmm0, -0x30(%rbp)
0000000000398f76	movq	$0x0, -0x20(%rbp)
0000000000398f7e	movl	$0x2, -0x60(%rbp)
0000000000398f85	movb	$0xc, -0x58(%rbp)
0000000000398f89	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
0000000000398f90	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000000398f96	movb	$0x0, -0x51(%rbp)
0000000000398f9a	movaps	0x4f38af(%rip), %xmm0
0000000000398fa1	movups	%xmm0, -0x40(%rbp)
0000000000398fa5	leaq	-0x30(%rbp), %rdi
0000000000398fa9	leaq	-0x60(%rbp), %rsi
0000000000398fad	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000398fb2	movq	%rax, -0x28(%rbp)
0000000000398fb6	testb	$0x1, -0x58(%rbp)
0000000000398fba	je	0x398fc9
0000000000398fbc	movq	-0x48(%rbp), %rdi
0000000000398fc0	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000398fc5	movq	-0x28(%rbp), %rax
0000000000398fc9	movl	$0xa, -0x60(%rbp)
0000000000398fd0	leaq	-0x58(%rbp), %r14
0000000000398fd4	movb	$0xc, -0x58(%rbp)
0000000000398fd8	movl	$0x616f6c66, -0x57(%rbp)        ## imm = 0x616F6C66
0000000000398fdf	movw	$0x3474, -0x53(%rbp)            ## imm = 0x3474
0000000000398fe5	movb	$0x0, -0x51(%rbp)
0000000000398fe9	movaps	0x320a0(%rip), %xmm0
0000000000398ff0	movups	%xmm0, -0x40(%rbp)
0000000000398ff4	cmpq	-0x20(%rbp), %rax
0000000000398ff8	jae	0x399032
0000000000398ffa	movl	$0xa, (%rax)
0000000000399000	movq	0x10(%r14), %rcx
0000000000399004	movq	%rcx, 0x18(%rax)
0000000000399008	movups	(%r14), %xmm0
000000000039900c	movups	%xmm0, 0x8(%rax)
0000000000399010	xorps	%xmm0, %xmm0
0000000000399013	movups	%xmm0, (%r14)
0000000000399017	movq	$0x0, 0x10(%r14)
000000000039901f	movups	0x18(%r14), %xmm0
0000000000399024	movups	%xmm0, 0x20(%rax)
0000000000399028	addq	$0x30, %rax
000000000039902c	movq	%rax, -0x28(%rbp)
0000000000399030	jmp	0x399056
0000000000399032	leaq	-0x30(%rbp), %rdi
0000000000399036	leaq	-0x60(%rbp), %rsi
000000000039903a	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000039903f	testb	$0x1, -0x58(%rbp)
0000000000399043	movq	%rax, -0x28(%rbp)
0000000000399047	je	0x399056
0000000000399049	movq	-0x48(%rbp), %rdi
000000000039904d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000399052	movq	-0x28(%rbp), %rax
0000000000399056	movl	$0x9, -0x60(%rbp)
000000000039905d	movb	$0x20, -0x58(%rbp)
0000000000399061	movups	0x5626a9(%rip), %xmm0           ## literal pool for: "texture2d<float>"
0000000000399068	movups	%xmm0, -0x57(%rbp)
000000000039906c	movb	$0x0, -0x47(%rbp)
0000000000399070	movaps	0x32019(%rip), %xmm0
0000000000399077	movups	%xmm0, -0x40(%rbp)
000000000039907b	cmpq	-0x20(%rbp), %rax
000000000039907f	jae	0x3990b9
0000000000399081	movl	$0x9, (%rax)
0000000000399087	movq	0x10(%r14), %rcx
000000000039908b	movq	%rcx, 0x18(%rax)
000000000039908f	movups	(%r14), %xmm0
0000000000399093	movups	%xmm0, 0x8(%rax)
0000000000399097	xorps	%xmm0, %xmm0
000000000039909a	movups	%xmm0, (%r14)
000000000039909e	movq	$0x0, 0x10(%r14)
00000000003990a6	movups	0x18(%r14), %xmm0
00000000003990ab	movups	%xmm0, 0x20(%rax)
00000000003990af	addq	$0x30, %rax
00000000003990b3	movq	%rax, -0x28(%rbp)
00000000003990b7	jmp	0x3990dd
00000000003990b9	leaq	-0x30(%rbp), %rdi
00000000003990bd	leaq	-0x60(%rbp), %rsi
00000000003990c1	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000003990c6	testb	$0x1, -0x58(%rbp)
00000000003990ca	movq	%rax, -0x28(%rbp)
00000000003990ce	je	0x3990dd
00000000003990d0	movq	-0x48(%rbp), %rdi
00000000003990d4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003990d9	movq	-0x28(%rbp), %rax
00000000003990dd	movl	$0x6, -0x60(%rbp)
00000000003990e4	movb	$0xe, -0x58(%rbp)
00000000003990e8	movl	$0x706d6173, -0x57(%rbp)        ## imm = 0x706D6173
00000000003990ef	movl	$0x72656c70, -0x54(%rbp)        ## imm = 0x72656C70
00000000003990f6	movb	$0x0, -0x50(%rbp)
00000000003990fa	movaps	0x31f8f(%rip), %xmm0
0000000000399101	movups	%xmm0, -0x40(%rbp)
0000000000399105	cmpq	-0x20(%rbp), %rax
0000000000399109	jae	0x399143
000000000039910b	movl	$0x6, (%rax)
0000000000399111	movq	0x10(%r14), %rcx
0000000000399115	movq	%rcx, 0x18(%rax)
0000000000399119	movups	(%r14), %xmm0
000000000039911d	movups	%xmm0, 0x8(%rax)
0000000000399121	xorps	%xmm0, %xmm0
0000000000399124	movups	%xmm0, (%r14)
0000000000399128	movq	$0x0, 0x10(%r14)
0000000000399130	movups	0x18(%r14), %xmm0
0000000000399135	movups	%xmm0, 0x20(%rax)
0000000000399139	addq	$0x30, %rax
000000000039913d	movq	%rax, -0x28(%rbp)
0000000000399141	jmp	0x399163
0000000000399143	leaq	-0x30(%rbp), %rdi
0000000000399147	leaq	-0x60(%rbp), %rsi
000000000039914b	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000399150	testb	$0x1, -0x58(%rbp)
0000000000399154	movq	%rax, -0x28(%rbp)
0000000000399158	je	0x399163
000000000039915a	movq	-0x48(%rbp), %rdi
000000000039915e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000399163	leaq	-0x30(%rbp), %rsi
0000000000399167	movq	%rbx, %rdi
000000000039916a	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
000000000039916f	movq	-0x30(%rbp), %rbx
0000000000399173	testq	%rbx, %rbx
0000000000399176	je	0x3991b8
0000000000399178	movq	-0x28(%rbp), %r14
000000000039917c	movq	%rbx, %rdi
000000000039917f	cmpq	%r14, %rbx
0000000000399182	jne	0x399199
0000000000399184	jmp	0x3991af
0000000000399186	nopw	%cs:(%rax,%rax)
0000000000399190	addq	$-0x30, %r14
0000000000399194	cmpq	%rbx, %r14
0000000000399197	je	0x3991ab
0000000000399199	testb	$0x1, -0x28(%r14)
000000000039919e	je	0x399190
00000000003991a0	movq	-0x18(%r14), %rdi
00000000003991a4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003991a9	jmp	0x399190
00000000003991ab	movq	-0x30(%rbp), %rdi
00000000003991af	movq	%rbx, -0x28(%rbp)
00000000003991b3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003991b8	addq	$0x80, %rsp
00000000003991bf	popq	%rbx
00000000003991c0	popq	%r14
00000000003991c2	popq	%rbp
00000000003991c3	retq
00000000003991c4	jmp	0x3991cf
00000000003991c6	jmp	0x3991cf
00000000003991c8	jmp	0x3991cf
00000000003991ca	movq	%rax, %rbx
00000000003991cd	jmp	0x3991e1
00000000003991cf	movq	%rax, %rbx
00000000003991d2	testb	$0x1, -0x58(%rbp)
00000000003991d6	je	0x3991e1
00000000003991d8	movq	-0x48(%rbp), %rdi
00000000003991dc	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000003991e1	leaq	-0x30(%rbp), %rdi
00000000003991e5	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
00000000003991ea	movq	%rbx, %rdi
00000000003991ed	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000003991f2	movq	%rax, %rbx
00000000003991f5	testb	$0x1, -0x88(%rbp)
00000000003991fc	je	0x3991ea
00000000003991fe	movq	-0x78(%rbp), %rdi
0000000000399202	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000399207	movq	%rbx, %rdi
000000000039920a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000039920f	nop
