__ZNK20HgcAVAMotionDilation21InitProgramDescriptorEP19HGProgramDescriptor:
00000000002153c0	pushq	%rbp
00000000002153c1	movq	%rsp, %rbp
00000000002153c4	pushq	%r14
00000000002153c6	pushq	%rbx
00000000002153c7	subq	$0x80, %rsp
00000000002153ce	movq	%rsi, %rbx
00000000002153d1	leaq	0x6f2749(%rip), %rsi            ## literal pool for: "HgcAVAMotionDilation_hgc_visible"
00000000002153d8	leaq	0x6f85a6(%rip), %rdx            ## literal pool for: "//Metal1.0     \n//LEN=0000000642\n[[ visible ]] FragmentOut HgcAVAMotionDilation_hgc_visible(const constant float4* hg_Params, \n    texture2d< float > hg_Texture0, \n    sampler hg_Sampler0, \n    texture2d< float > hg_Texture1, \n    sampler hg_Sampler1, \n    texture2d< float > hg_Texture2, \n    sampler hg_Sampler2,\n    float4 texCoord0,\n    float4 texCoord1,\n    float4 texCoord2,\n    float4 texCoord3,\n    float4 texCoord4,\n    float4 texCoord5)\n{\n    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2, r3;\n    FragmentOut output;\n\n    r0.w = hg_Texture0.sample(hg_Sampler0, texCoord0.xy).w;\n    r0.x = r0.w;\n    r1.w = hg_Texture0.sample(hg_Sampler0, texCoord3.xy).w;\n    r1.x = r1.w;\n    r2.w = hg_Texture1.sample(hg_Sampler1, texCoord4.xy).w;\n    r1.y = r2.w;\n    r2.w = hg_Texture1.sample(hg_Sampler1, texCoord1.xy).w;\n    r1.z = r2.w;\n    r2.xz = float2(r1.yy >= r1.xz);\n    r3.yz = float2(r1.xx >= r1.yz);\n    r3.x = fmin(r3.y, r3.z);\n    r2.y = fmin(r2.x, r2.z);\n    r3.y = mix(r2.y, c0.y, r3.x);\n    r3.z = fmax(r3.x, r3.y);\n    r3.z = c0.x - r3.z;\n    r3.x = dot(r1.xyz, r3.xyz);\n    r0.x = fmax(r0.x, r3.x);\n    r2.z = hg_Texture2.sample(hg_Sampler2, texCoord5.xy).z;\n    r1.x = fmax(r0.x, r2.z);\n    r2.x = r0.x + r2.z;\n    r3.z = hg_Texture2.sample(hg_Sampler2, texCoord2.xy).z;\n    r1.x = fmax(r1.x, r3.z);\n    r2.x = r2.x + r3.z;\n    r3.zw = hg_Texture2.sample(hg_Sampler2, texCoord2.xy).zw;\n    output.color0.x = fmax(r1.x, r3.w);\n    output.color0.y = r2.x;\n    output.color0.z = r0.x;\n    output.color0.w = r3.z;\n    return output;\n}\n"
00000000002153df	movq	%rbx, %rdi
00000000002153e2	callq	__ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_ ## HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)
00000000002153e7	leaq	0x6f2754(%rip), %rsi            ## literal pool for: "HgcAVAMotionDilation"
00000000002153ee	movq	%rbx, %rdi
00000000002153f1	callq	__ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc ## HGProgramDescriptor::SetFragmentFunctionName(char const*)
00000000002153f6	movl	$0x4, -0x90(%rbp)
0000000000215400	movb	$0x16, -0x88(%rbp)
0000000000215407	movabsq	$0x746e656d67617246, %rax       ## imm = 0x746E656D67617246
0000000000215411	movq	%rax, -0x87(%rbp)
0000000000215418	movl	$0x74754f74, -0x80(%rbp)        ## imm = 0x74754F74
000000000021541f	movb	$0x0, -0x7c(%rbp)
0000000000215423	movaps	0x1b5c66(%rip), %xmm0
000000000021542a	movups	%xmm0, -0x70(%rbp)
000000000021542e	leaq	-0x90(%rbp), %rsi
0000000000215435	movq	%rbx, %rdi
0000000000215438	callq	__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding ## HGProgramDescriptor::SetReturnBinding(HGBinding)
000000000021543d	testb	$0x1, -0x88(%rbp)
0000000000215444	je	0x21544f
0000000000215446	movq	-0x78(%rbp), %rdi
000000000021544a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021544f	xorps	%xmm0, %xmm0
0000000000215452	movaps	%xmm0, -0x60(%rbp)
0000000000215456	movq	$0x0, -0x50(%rbp)
000000000021545e	movl	$0x2, -0x40(%rbp)
0000000000215465	movb	$0xc, -0x38(%rbp)
0000000000215469	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
0000000000215470	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
0000000000215476	movb	$0x0, -0x31(%rbp)
000000000021547a	movsd	0x67733e(%rip), %xmm0
0000000000215482	movups	%xmm0, -0x20(%rbp)
0000000000215486	leaq	-0x60(%rbp), %rdi
000000000021548a	leaq	-0x40(%rbp), %rsi
000000000021548e	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000215493	movq	%rax, -0x58(%rbp)
0000000000215497	testb	$0x1, -0x38(%rbp)
000000000021549b	je	0x2154aa
000000000021549d	movq	-0x28(%rbp), %rdi
00000000002154a1	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002154a6	movq	-0x58(%rbp), %rax
00000000002154aa	movl	$0x9, -0x40(%rbp)
00000000002154b1	leaq	-0x38(%rbp), %r14
00000000002154b5	movb	$0x20, -0x38(%rbp)
00000000002154b9	movups	0x6e6251(%rip), %xmm0           ## literal pool for: "texture2d<float>"
00000000002154c0	movups	%xmm0, -0x37(%rbp)
00000000002154c4	movb	$0x0, -0x27(%rbp)
00000000002154c8	movaps	0x1b5bc1(%rip), %xmm0
00000000002154cf	movups	%xmm0, -0x20(%rbp)
00000000002154d3	cmpq	-0x50(%rbp), %rax
00000000002154d7	jae	0x215511
00000000002154d9	movl	$0x9, (%rax)
00000000002154df	movq	0x10(%r14), %rcx
00000000002154e3	movq	%rcx, 0x18(%rax)
00000000002154e7	movups	(%r14), %xmm0
00000000002154eb	movups	%xmm0, 0x8(%rax)
00000000002154ef	xorps	%xmm0, %xmm0
00000000002154f2	movups	%xmm0, (%r14)
00000000002154f6	movq	$0x0, 0x10(%r14)
00000000002154fe	movups	0x18(%r14), %xmm0
0000000000215503	movups	%xmm0, 0x20(%rax)
0000000000215507	addq	$0x30, %rax
000000000021550b	movq	%rax, -0x58(%rbp)
000000000021550f	jmp	0x215535
0000000000215511	leaq	-0x60(%rbp), %rdi
0000000000215515	leaq	-0x40(%rbp), %rsi
0000000000215519	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021551e	testb	$0x1, -0x38(%rbp)
0000000000215522	movq	%rax, -0x58(%rbp)
0000000000215526	je	0x215535
0000000000215528	movq	-0x28(%rbp), %rdi
000000000021552c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215531	movq	-0x58(%rbp), %rax
0000000000215535	movl	$0x6, -0x40(%rbp)
000000000021553c	movb	$0xe, -0x38(%rbp)
0000000000215540	movl	$0x706d6173, -0x37(%rbp)        ## imm = 0x706D6173
0000000000215547	movl	$0x72656c70, -0x34(%rbp)        ## imm = 0x72656C70
000000000021554e	movb	$0x0, -0x30(%rbp)
0000000000215552	movaps	0x1b5b37(%rip), %xmm0
0000000000215559	movups	%xmm0, -0x20(%rbp)
000000000021555d	cmpq	-0x50(%rbp), %rax
0000000000215561	jae	0x21559b
0000000000215563	movl	$0x6, (%rax)
0000000000215569	movq	0x10(%r14), %rcx
000000000021556d	movq	%rcx, 0x18(%rax)
0000000000215571	movups	(%r14), %xmm0
0000000000215575	movups	%xmm0, 0x8(%rax)
0000000000215579	xorps	%xmm0, %xmm0
000000000021557c	movups	%xmm0, (%r14)
0000000000215580	movq	$0x0, 0x10(%r14)
0000000000215588	movups	0x18(%r14), %xmm0
000000000021558d	movups	%xmm0, 0x20(%rax)
0000000000215591	addq	$0x30, %rax
0000000000215595	movq	%rax, -0x58(%rbp)
0000000000215599	jmp	0x2155bf
000000000021559b	leaq	-0x60(%rbp), %rdi
000000000021559f	leaq	-0x40(%rbp), %rsi
00000000002155a3	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000002155a8	testb	$0x1, -0x38(%rbp)
00000000002155ac	movq	%rax, -0x58(%rbp)
00000000002155b0	je	0x2155bf
00000000002155b2	movq	-0x28(%rbp), %rdi
00000000002155b6	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002155bb	movq	-0x58(%rbp), %rax
00000000002155bf	movl	$0x9, -0x40(%rbp)
00000000002155c6	movb	$0x20, -0x38(%rbp)
00000000002155ca	movups	0x6e6140(%rip), %xmm0           ## literal pool for: "texture2d<float>"
00000000002155d1	movups	%xmm0, -0x37(%rbp)
00000000002155d5	movb	$0x0, -0x27(%rbp)
00000000002155d9	movaps	0x1b5ab0(%rip), %xmm0
00000000002155e0	movups	%xmm0, -0x20(%rbp)
00000000002155e4	cmpq	-0x50(%rbp), %rax
00000000002155e8	jae	0x215622
00000000002155ea	movl	$0x9, (%rax)
00000000002155f0	movq	0x10(%r14), %rcx
00000000002155f4	movq	%rcx, 0x18(%rax)
00000000002155f8	movups	(%r14), %xmm0
00000000002155fc	movups	%xmm0, 0x8(%rax)
0000000000215600	xorps	%xmm0, %xmm0
0000000000215603	movups	%xmm0, (%r14)
0000000000215607	movq	$0x0, 0x10(%r14)
000000000021560f	movups	0x18(%r14), %xmm0
0000000000215614	movups	%xmm0, 0x20(%rax)
0000000000215618	addq	$0x30, %rax
000000000021561c	movq	%rax, -0x58(%rbp)
0000000000215620	jmp	0x215646
0000000000215622	leaq	-0x60(%rbp), %rdi
0000000000215626	leaq	-0x40(%rbp), %rsi
000000000021562a	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
000000000021562f	testb	$0x1, -0x38(%rbp)
0000000000215633	movq	%rax, -0x58(%rbp)
0000000000215637	je	0x215646
0000000000215639	movq	-0x28(%rbp), %rdi
000000000021563d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215642	movq	-0x58(%rbp), %rax
0000000000215646	movl	$0x6, -0x40(%rbp)
000000000021564d	movb	$0xe, -0x38(%rbp)
0000000000215651	movl	$0x706d6173, -0x37(%rbp)        ## imm = 0x706D6173
0000000000215658	movl	$0x72656c70, -0x34(%rbp)        ## imm = 0x72656C70
000000000021565f	movb	$0x0, -0x30(%rbp)
0000000000215663	movaps	0x1b5a26(%rip), %xmm0
000000000021566a	movups	%xmm0, -0x20(%rbp)
000000000021566e	cmpq	-0x50(%rbp), %rax
0000000000215672	jae	0x2156ac
0000000000215674	movl	$0x6, (%rax)
000000000021567a	movq	0x10(%r14), %rcx
000000000021567e	movq	%rcx, 0x18(%rax)
0000000000215682	movups	(%r14), %xmm0
0000000000215686	movups	%xmm0, 0x8(%rax)
000000000021568a	xorps	%xmm0, %xmm0
000000000021568d	movups	%xmm0, (%r14)
0000000000215691	movq	$0x0, 0x10(%r14)
0000000000215699	movups	0x18(%r14), %xmm0
000000000021569e	movups	%xmm0, 0x20(%rax)
00000000002156a2	addq	$0x30, %rax
00000000002156a6	movq	%rax, -0x58(%rbp)
00000000002156aa	jmp	0x2156d0
00000000002156ac	leaq	-0x60(%rbp), %rdi
00000000002156b0	leaq	-0x40(%rbp), %rsi
00000000002156b4	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000002156b9	testb	$0x1, -0x38(%rbp)
00000000002156bd	movq	%rax, -0x58(%rbp)
00000000002156c1	je	0x2156d0
00000000002156c3	movq	-0x28(%rbp), %rdi
00000000002156c7	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002156cc	movq	-0x58(%rbp), %rax
00000000002156d0	movl	$0x9, -0x40(%rbp)
00000000002156d7	movb	$0x20, -0x38(%rbp)
00000000002156db	movups	0x6e602f(%rip), %xmm0           ## literal pool for: "texture2d<float>"
00000000002156e2	movups	%xmm0, -0x37(%rbp)
00000000002156e6	movb	$0x0, -0x27(%rbp)
00000000002156ea	movaps	0x1b599f(%rip), %xmm0
00000000002156f1	movups	%xmm0, -0x20(%rbp)
00000000002156f5	cmpq	-0x50(%rbp), %rax
00000000002156f9	jae	0x215733
00000000002156fb	movl	$0x9, (%rax)
0000000000215701	movq	0x10(%r14), %rcx
0000000000215705	movq	%rcx, 0x18(%rax)
0000000000215709	movups	(%r14), %xmm0
000000000021570d	movups	%xmm0, 0x8(%rax)
0000000000215711	xorps	%xmm0, %xmm0
0000000000215714	movups	%xmm0, (%r14)
0000000000215718	movq	$0x0, 0x10(%r14)
0000000000215720	movups	0x18(%r14), %xmm0
0000000000215725	movups	%xmm0, 0x20(%rax)
0000000000215729	addq	$0x30, %rax
000000000021572d	movq	%rax, -0x58(%rbp)
0000000000215731	jmp	0x215757
0000000000215733	leaq	-0x60(%rbp), %rdi
0000000000215737	leaq	-0x40(%rbp), %rsi
000000000021573b	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000215740	testb	$0x1, -0x38(%rbp)
0000000000215744	movq	%rax, -0x58(%rbp)
0000000000215748	je	0x215757
000000000021574a	movq	-0x28(%rbp), %rdi
000000000021574e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215753	movq	-0x58(%rbp), %rax
0000000000215757	movl	$0x6, -0x40(%rbp)
000000000021575e	movb	$0xe, -0x38(%rbp)
0000000000215762	movl	$0x706d6173, -0x37(%rbp)        ## imm = 0x706D6173
0000000000215769	movl	$0x72656c70, -0x34(%rbp)        ## imm = 0x72656C70
0000000000215770	movb	$0x0, -0x30(%rbp)
0000000000215774	movaps	0x1b5915(%rip), %xmm0
000000000021577b	movups	%xmm0, -0x20(%rbp)
000000000021577f	cmpq	-0x50(%rbp), %rax
0000000000215783	jae	0x2157bd
0000000000215785	movl	$0x6, (%rax)
000000000021578b	movq	0x10(%r14), %rcx
000000000021578f	movq	%rcx, 0x18(%rax)
0000000000215793	movups	(%r14), %xmm0
0000000000215797	movups	%xmm0, 0x8(%rax)
000000000021579b	xorps	%xmm0, %xmm0
000000000021579e	movups	%xmm0, (%r14)
00000000002157a2	movq	$0x0, 0x10(%r14)
00000000002157aa	movups	0x18(%r14), %xmm0
00000000002157af	movups	%xmm0, 0x20(%rax)
00000000002157b3	addq	$0x30, %rax
00000000002157b7	movq	%rax, -0x58(%rbp)
00000000002157bb	jmp	0x2157e1
00000000002157bd	leaq	-0x60(%rbp), %rdi
00000000002157c1	leaq	-0x40(%rbp), %rsi
00000000002157c5	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000002157ca	testb	$0x1, -0x38(%rbp)
00000000002157ce	movq	%rax, -0x58(%rbp)
00000000002157d2	je	0x2157e1
00000000002157d4	movq	-0x28(%rbp), %rdi
00000000002157d8	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002157dd	movq	-0x58(%rbp), %rax
00000000002157e1	movl	$0x8, -0x40(%rbp)
00000000002157e8	movb	$0xc, -0x38(%rbp)
00000000002157ec	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
00000000002157f3	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
00000000002157f9	movb	$0x0, -0x31(%rbp)
00000000002157fd	movaps	0x1b588c(%rip), %xmm0
0000000000215804	movups	%xmm0, -0x20(%rbp)
0000000000215808	cmpq	-0x50(%rbp), %rax
000000000021580c	jae	0x215846
000000000021580e	movl	$0x8, (%rax)
0000000000215814	movq	0x10(%r14), %rcx
0000000000215818	movq	%rcx, 0x18(%rax)
000000000021581c	movups	(%r14), %xmm0
0000000000215820	movups	%xmm0, 0x8(%rax)
0000000000215824	xorps	%xmm0, %xmm0
0000000000215827	movups	%xmm0, (%r14)
000000000021582b	movq	$0x0, 0x10(%r14)
0000000000215833	movups	0x18(%r14), %xmm0
0000000000215838	movups	%xmm0, 0x20(%rax)
000000000021583c	addq	$0x30, %rax
0000000000215840	movq	%rax, -0x58(%rbp)
0000000000215844	jmp	0x21586a
0000000000215846	leaq	-0x60(%rbp), %rdi
000000000021584a	leaq	-0x40(%rbp), %rsi
000000000021584e	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000215853	testb	$0x1, -0x38(%rbp)
0000000000215857	movq	%rax, -0x58(%rbp)
000000000021585b	je	0x21586a
000000000021585d	movq	-0x28(%rbp), %rdi
0000000000215861	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215866	movq	-0x58(%rbp), %rax
000000000021586a	movl	$0x8, -0x40(%rbp)
0000000000215871	movb	$0xc, -0x38(%rbp)
0000000000215875	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
000000000021587c	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
0000000000215882	movb	$0x0, -0x31(%rbp)
0000000000215886	movaps	0x1b5803(%rip), %xmm0
000000000021588d	movups	%xmm0, -0x20(%rbp)
0000000000215891	cmpq	-0x50(%rbp), %rax
0000000000215895	jae	0x2158cf
0000000000215897	movl	$0x8, (%rax)
000000000021589d	movq	0x10(%r14), %rcx
00000000002158a1	movq	%rcx, 0x18(%rax)
00000000002158a5	movups	(%r14), %xmm0
00000000002158a9	movups	%xmm0, 0x8(%rax)
00000000002158ad	xorps	%xmm0, %xmm0
00000000002158b0	movups	%xmm0, (%r14)
00000000002158b4	movq	$0x0, 0x10(%r14)
00000000002158bc	movups	0x18(%r14), %xmm0
00000000002158c1	movups	%xmm0, 0x20(%rax)
00000000002158c5	addq	$0x30, %rax
00000000002158c9	movq	%rax, -0x58(%rbp)
00000000002158cd	jmp	0x2158f3
00000000002158cf	leaq	-0x60(%rbp), %rdi
00000000002158d3	leaq	-0x40(%rbp), %rsi
00000000002158d7	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000002158dc	testb	$0x1, -0x38(%rbp)
00000000002158e0	movq	%rax, -0x58(%rbp)
00000000002158e4	je	0x2158f3
00000000002158e6	movq	-0x28(%rbp), %rdi
00000000002158ea	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002158ef	movq	-0x58(%rbp), %rax
00000000002158f3	movl	$0x8, -0x40(%rbp)
00000000002158fa	movb	$0xc, -0x38(%rbp)
00000000002158fe	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
0000000000215905	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
000000000021590b	movb	$0x0, -0x31(%rbp)
000000000021590f	movaps	0x1b577a(%rip), %xmm0
0000000000215916	movups	%xmm0, -0x20(%rbp)
000000000021591a	cmpq	-0x50(%rbp), %rax
000000000021591e	jae	0x215958
0000000000215920	movl	$0x8, (%rax)
0000000000215926	movq	0x10(%r14), %rcx
000000000021592a	movq	%rcx, 0x18(%rax)
000000000021592e	movups	(%r14), %xmm0
0000000000215932	movups	%xmm0, 0x8(%rax)
0000000000215936	xorps	%xmm0, %xmm0
0000000000215939	movups	%xmm0, (%r14)
000000000021593d	movq	$0x0, 0x10(%r14)
0000000000215945	movups	0x18(%r14), %xmm0
000000000021594a	movups	%xmm0, 0x20(%rax)
000000000021594e	addq	$0x30, %rax
0000000000215952	movq	%rax, -0x58(%rbp)
0000000000215956	jmp	0x21597c
0000000000215958	leaq	-0x60(%rbp), %rdi
000000000021595c	leaq	-0x40(%rbp), %rsi
0000000000215960	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000215965	testb	$0x1, -0x38(%rbp)
0000000000215969	movq	%rax, -0x58(%rbp)
000000000021596d	je	0x21597c
000000000021596f	movq	-0x28(%rbp), %rdi
0000000000215973	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215978	movq	-0x58(%rbp), %rax
000000000021597c	movl	$0x8, -0x40(%rbp)
0000000000215983	movb	$0xc, -0x38(%rbp)
0000000000215987	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
000000000021598e	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
0000000000215994	movb	$0x0, -0x31(%rbp)
0000000000215998	movaps	0x1b56f1(%rip), %xmm0
000000000021599f	movups	%xmm0, -0x20(%rbp)
00000000002159a3	cmpq	-0x50(%rbp), %rax
00000000002159a7	jae	0x2159e1
00000000002159a9	movl	$0x8, (%rax)
00000000002159af	movq	0x10(%r14), %rcx
00000000002159b3	movq	%rcx, 0x18(%rax)
00000000002159b7	movups	(%r14), %xmm0
00000000002159bb	movups	%xmm0, 0x8(%rax)
00000000002159bf	xorps	%xmm0, %xmm0
00000000002159c2	movups	%xmm0, (%r14)
00000000002159c6	movq	$0x0, 0x10(%r14)
00000000002159ce	movups	0x18(%r14), %xmm0
00000000002159d3	movups	%xmm0, 0x20(%rax)
00000000002159d7	addq	$0x30, %rax
00000000002159db	movq	%rax, -0x58(%rbp)
00000000002159df	jmp	0x215a05
00000000002159e1	leaq	-0x60(%rbp), %rdi
00000000002159e5	leaq	-0x40(%rbp), %rsi
00000000002159e9	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000002159ee	testb	$0x1, -0x38(%rbp)
00000000002159f2	movq	%rax, -0x58(%rbp)
00000000002159f6	je	0x215a05
00000000002159f8	movq	-0x28(%rbp), %rdi
00000000002159fc	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215a01	movq	-0x58(%rbp), %rax
0000000000215a05	movl	$0x8, -0x40(%rbp)
0000000000215a0c	movb	$0xc, -0x38(%rbp)
0000000000215a10	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
0000000000215a17	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
0000000000215a1d	movb	$0x0, -0x31(%rbp)
0000000000215a21	movaps	0x1b5668(%rip), %xmm0
0000000000215a28	movups	%xmm0, -0x20(%rbp)
0000000000215a2c	cmpq	-0x50(%rbp), %rax
0000000000215a30	jae	0x215a6a
0000000000215a32	movl	$0x8, (%rax)
0000000000215a38	movq	0x10(%r14), %rcx
0000000000215a3c	movq	%rcx, 0x18(%rax)
0000000000215a40	movups	(%r14), %xmm0
0000000000215a44	movups	%xmm0, 0x8(%rax)
0000000000215a48	xorps	%xmm0, %xmm0
0000000000215a4b	movups	%xmm0, (%r14)
0000000000215a4f	movq	$0x0, 0x10(%r14)
0000000000215a57	movups	0x18(%r14), %xmm0
0000000000215a5c	movups	%xmm0, 0x20(%rax)
0000000000215a60	addq	$0x30, %rax
0000000000215a64	movq	%rax, -0x58(%rbp)
0000000000215a68	jmp	0x215a8e
0000000000215a6a	leaq	-0x60(%rbp), %rdi
0000000000215a6e	leaq	-0x40(%rbp), %rsi
0000000000215a72	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000215a77	testb	$0x1, -0x38(%rbp)
0000000000215a7b	movq	%rax, -0x58(%rbp)
0000000000215a7f	je	0x215a8e
0000000000215a81	movq	-0x28(%rbp), %rdi
0000000000215a85	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215a8a	movq	-0x58(%rbp), %rax
0000000000215a8e	movl	$0x8, -0x40(%rbp)
0000000000215a95	movb	$0xc, -0x38(%rbp)
0000000000215a99	movl	$0x616f6c66, -0x37(%rbp)        ## imm = 0x616F6C66
0000000000215aa0	movw	$0x3474, -0x33(%rbp)            ## imm = 0x3474
0000000000215aa6	movb	$0x0, -0x31(%rbp)
0000000000215aaa	movaps	0x1b55df(%rip), %xmm0
0000000000215ab1	movups	%xmm0, -0x20(%rbp)
0000000000215ab5	cmpq	-0x50(%rbp), %rax
0000000000215ab9	jae	0x215af3
0000000000215abb	movl	$0x8, (%rax)
0000000000215ac1	movq	0x10(%r14), %rcx
0000000000215ac5	movq	%rcx, 0x18(%rax)
0000000000215ac9	movups	(%r14), %xmm0
0000000000215acd	movups	%xmm0, 0x8(%rax)
0000000000215ad1	xorps	%xmm0, %xmm0
0000000000215ad4	movups	%xmm0, (%r14)
0000000000215ad8	movq	$0x0, 0x10(%r14)
0000000000215ae0	movups	0x18(%r14), %xmm0
0000000000215ae5	movups	%xmm0, 0x20(%rax)
0000000000215ae9	addq	$0x30, %rax
0000000000215aed	movq	%rax, -0x58(%rbp)
0000000000215af1	jmp	0x215b13
0000000000215af3	leaq	-0x60(%rbp), %rdi
0000000000215af7	leaq	-0x40(%rbp), %rsi
0000000000215afb	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000215b00	testb	$0x1, -0x38(%rbp)
0000000000215b04	movq	%rax, -0x58(%rbp)
0000000000215b08	je	0x215b13
0000000000215b0a	movq	-0x28(%rbp), %rdi
0000000000215b0e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215b13	leaq	-0x60(%rbp), %rsi
0000000000215b17	movq	%rbx, %rdi
0000000000215b1a	callq	__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE ## HGProgramDescriptor::SetArgumentBindings(std::__1::vector<HGBinding, std::__1::allocator<HGBinding>> const&)
0000000000215b1f	movq	-0x60(%rbp), %rbx
0000000000215b23	testq	%rbx, %rbx
0000000000215b26	je	0x215b68
0000000000215b28	movq	-0x58(%rbp), %r14
0000000000215b2c	movq	%rbx, %rdi
0000000000215b2f	cmpq	%r14, %rbx
0000000000215b32	jne	0x215b49
0000000000215b34	jmp	0x215b5f
0000000000215b36	nopw	%cs:(%rax,%rax)
0000000000215b40	addq	$-0x30, %r14
0000000000215b44	cmpq	%rbx, %r14
0000000000215b47	je	0x215b5b
0000000000215b49	testb	$0x1, -0x28(%r14)
0000000000215b4e	je	0x215b40
0000000000215b50	movq	-0x18(%r14), %rdi
0000000000215b54	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215b59	jmp	0x215b40
0000000000215b5b	movq	-0x60(%rbp), %rdi
0000000000215b5f	movq	%rbx, -0x58(%rbp)
0000000000215b63	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215b68	addq	$0x80, %rsp
0000000000215b6f	popq	%rbx
0000000000215b70	popq	%r14
0000000000215b72	popq	%rbp
0000000000215b73	retq
0000000000215b74	jmp	0x215b91
0000000000215b76	jmp	0x215b91
0000000000215b78	jmp	0x215b91
0000000000215b7a	jmp	0x215b91
0000000000215b7c	jmp	0x215b91
0000000000215b7e	jmp	0x215b91
0000000000215b80	jmp	0x215b91
0000000000215b82	jmp	0x215b91
0000000000215b84	jmp	0x215b91
0000000000215b86	jmp	0x215b91
0000000000215b88	jmp	0x215b91
0000000000215b8a	jmp	0x215b91
0000000000215b8c	movq	%rax, %rbx
0000000000215b8f	jmp	0x215ba3
0000000000215b91	movq	%rax, %rbx
0000000000215b94	testb	$0x1, -0x38(%rbp)
0000000000215b98	je	0x215ba3
0000000000215b9a	movq	-0x28(%rbp), %rdi
0000000000215b9e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215ba3	leaq	-0x60(%rbp), %rdi
0000000000215ba7	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
0000000000215bac	movq	%rbx, %rdi
0000000000215baf	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000215bb4	movq	%rax, %rbx
0000000000215bb7	testb	$0x1, -0x88(%rbp)
0000000000215bbe	je	0x215bac
0000000000215bc0	movq	-0x78(%rbp), %rdi
0000000000215bc4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000215bc9	movq	%rbx, %rdi
0000000000215bcc	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000215bd1	nopw	%cs:(%rax,%rax)
