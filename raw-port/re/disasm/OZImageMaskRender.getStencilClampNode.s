__ZN17OZImageMaskRender19getStencilClampNodeER7LiAgent:
000000000046f010	pushq	%rbp
000000000046f011	movq	%rsp, %rbp
000000000046f014	pushq	%r15
000000000046f016	pushq	%r14
000000000046f018	pushq	%r13
000000000046f01a	pushq	%r12
000000000046f01c	pushq	%rbx
000000000046f01d	subq	$0x148, %rsp                    ## imm = 0x148
000000000046f024	movq	%rdx, -0x38(%rbp)
000000000046f028	movq	%rsi, %r15
000000000046f02b	movq	%rdi, -0x60(%rbp)
000000000046f02f	movabsq	$0x3ff0000000000000, %r14       ## imm = 0x3FF0000000000000
000000000046f039	movq	%r14, -0xf8(%rbp)
000000000046f040	movq	%r14, -0x120(%rbp)
000000000046f047	movq	%r14, -0x148(%rbp)
000000000046f04e	movq	%r14, -0x170(%rbp)
000000000046f055	xorpd	%xmm0, %xmm0
000000000046f059	movupd	%xmm0, -0x168(%rbp)
000000000046f061	movupd	%xmm0, -0x158(%rbp)
000000000046f069	movupd	%xmm0, -0x140(%rbp)
000000000046f071	movupd	%xmm0, -0x130(%rbp)
000000000046f079	movupd	%xmm0, -0x118(%rbp)
000000000046f081	movupd	%xmm0, -0x108(%rbp)
000000000046f089	movq	0x5d8(%rsi), %rdi
000000000046f090	movl	$0x1, %esi
000000000046f095	callq	__ZN11OZImageMask13getMaskSourceEb ## OZImageMask::getMaskSource(bool)
000000000046f09a	movq	%rax, %r13
000000000046f09d	movq	0x5d8(%r15), %rax
000000000046f0a4	movq	0x3b8(%rax), %rdi
000000000046f0ab	testq	%rdi, %rdi
000000000046f0ae	je	0x46f0ca
000000000046f0b0	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000046f0b7	leaq	__ZTI15OZTransformNode(%rip), %rdx ## typeinfo for OZTransformNode
000000000046f0be	xorl	%ecx, %ecx
000000000046f0c0	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046f0c5	movq	%rax, %r12
000000000046f0c8	jmp	0x46f0cd
000000000046f0ca	xorl	%r12d, %r12d
000000000046f0cd	movsd	0x29630b(%rip), %xmm1
000000000046f0d5	xorpd	%xmm2, %xmm2
000000000046f0d9	movsd	%xmm1, -0x30(%rbp)
000000000046f0de	testq	%r13, %r13
000000000046f0e1	je	0x46f1da
000000000046f0e7	leaq	__ZTI11OZImageNode(%rip), %rsi  ## typeinfo for OZImageNode
000000000046f0ee	leaq	__ZTI9OZElement(%rip), %rdx     ## typeinfo for OZElement
000000000046f0f5	movl	$0x1978, %ecx                   ## imm = 0x1978
000000000046f0fa	movq	%r13, %rdi
000000000046f0fd	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046f102	xorpd	%xmm2, %xmm2
000000000046f106	movsd	0x2962d2(%rip), %xmm1
000000000046f10e	testq	%rax, %rax
000000000046f111	je	0x46f1da
000000000046f117	movq	%rax, %r13
000000000046f11a	movq	0x8(%rax), %rdi
000000000046f11e	movapd	0x2984ea(%rip), %xmm0
000000000046f126	movapd	%xmm0, -0xf0(%rbp)
000000000046f12e	leaq	-0xf0(%rbp), %rsi
000000000046f135	callq	0x6dfab6                        ## symbol stub for: __ZNK9OZFactory13isKindOfClassE6PCUUID
000000000046f13a	xorpd	%xmm2, %xmm2
000000000046f13e	movsd	0x29629a(%rip), %xmm1
000000000046f146	testb	%al, %al
000000000046f148	je	0x46f1da
000000000046f14e	movq	(%r13), %rax
000000000046f152	movq	%r13, %rdi
000000000046f155	callq	*0x678(%rax)
000000000046f15b	testb	%al, %al
000000000046f15d	je	0x46f176
000000000046f15f	xorl	%r13d, %r13d
000000000046f162	testq	%r12, %r12
000000000046f165	je	0x46f18b
000000000046f167	movq	(%r12), %rax
000000000046f16b	movq	%r12, %rdi
000000000046f16e	callq	*0x548(%rax)
000000000046f174	jmp	0x46f191
000000000046f176	movq	(%r13), %rax
000000000046f17a	movq	%r13, %rdi
000000000046f17d	callq	*0x698(%rax)
000000000046f183	movl	%eax, %r13d
000000000046f186	testq	%r12, %r12
000000000046f189	jne	0x46f167
000000000046f18b	movsd	0x38(%r15), %xmm0
000000000046f191	movsd	0x296247(%rip), %xmm1
000000000046f199	ucomisd	%xmm1, %xmm0
000000000046f19d	setp	%al
000000000046f1a0	setne	%cl
000000000046f1a3	orb	%al, %cl
000000000046f1a5	andb	%cl, %r13b
000000000046f1a8	xorpd	%xmm2, %xmm2
000000000046f1ac	cmpb	$0x1, %r13b
000000000046f1b0	jne	0x46f1da
000000000046f1b2	movsd	%xmm0, -0x170(%rbp)
000000000046f1ba	mulsd	%xmm0, %xmm2
000000000046f1be	movsd	%xmm2, -0x150(%rbp)
000000000046f1c6	movsd	%xmm2, -0x130(%rbp)
000000000046f1ce	movsd	%xmm2, -0x110(%rbp)
000000000046f1d6	movapd	%xmm0, %xmm1
000000000046f1da	movsd	%xmm2, -0x50(%rbp)
000000000046f1df	movsd	%xmm1, -0x58(%rbp)
000000000046f1e4	movq	0x5d8(%r15), %r13
000000000046f1eb	movq	0x20(%r15), %rax
000000000046f1ef	movq	%rax, -0xe0(%rbp)
000000000046f1f6	movupd	0x10(%r15), %xmm0
000000000046f1fc	movapd	%xmm0, -0xf0(%rbp)
000000000046f204	leaq	0x750(%r13), %rdi
000000000046f20b	leaq	-0xf0(%rbp), %rbx
000000000046f212	xorpd	%xmm0, %xmm0
000000000046f216	movq	%rbx, %rsi
000000000046f219	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000046f21e	movsd	%xmm0, -0x68(%rbp)
000000000046f223	addq	$0x7e8, %r13                    ## imm = 0x7E8
000000000046f22a	xorpd	%xmm0, %xmm0
000000000046f22e	movq	%r13, %rdi
000000000046f231	movq	%rbx, %rsi
000000000046f234	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000046f239	movsd	-0x68(%rbp), %xmm4
000000000046f23e	xorpd	%xmm3, %xmm3
000000000046f242	ucomisd	%xmm3, %xmm4
000000000046f246	xorpd	%xmm1, %xmm1
000000000046f24a	jne	0x46f24e
000000000046f24c	jnp	0x46f295
000000000046f24e	movsd	-0x58(%rbp), %xmm1
000000000046f253	mulsd	%xmm4, %xmm1
000000000046f257	addsd	%xmm3, %xmm1
000000000046f25b	movsd	%xmm1, -0x158(%rbp)
000000000046f263	movsd	-0x50(%rbp), %xmm2
000000000046f268	mulsd	%xmm4, %xmm2
000000000046f26c	addsd	%xmm2, %xmm3
000000000046f270	movsd	%xmm3, -0x138(%rbp)
000000000046f278	addsd	0x296160(%rip), %xmm2
000000000046f280	movsd	%xmm3, -0x118(%rbp)
000000000046f288	movsd	%xmm2, -0xf8(%rbp)
000000000046f290	movsd	%xmm2, -0x30(%rbp)
000000000046f295	xorpd	%xmm2, %xmm2
000000000046f299	ucomisd	%xmm2, %xmm0
000000000046f29d	movq	-0x38(%rbp), %r13
000000000046f2a1	jne	0x46f2a5
000000000046f2a3	jnp	0x46f2de
000000000046f2a5	mulsd	%xmm0, %xmm2
000000000046f2a9	addsd	%xmm2, %xmm1
000000000046f2ad	movsd	%xmm1, -0x158(%rbp)
000000000046f2b5	addsd	%xmm3, %xmm0
000000000046f2b9	movsd	%xmm0, -0x138(%rbp)
000000000046f2c1	addsd	%xmm2, %xmm3
000000000046f2c5	movsd	%xmm3, -0x118(%rbp)
000000000046f2cd	movsd	-0x30(%rbp), %xmm0
000000000046f2d2	addsd	%xmm2, %xmm0
000000000046f2d6	movsd	%xmm0, -0xf8(%rbp)
000000000046f2de	leaq	-0x170(%rbp), %rsi
000000000046f2e5	movq	%r13, %rdi
000000000046f2e8	callq	0x6deb68                        ## symbol stub for: __ZN7LiAgent13loadTransformERK14PCMatrix44TmplIdE
000000000046f2ed	cmpq	$0x0, 0x618(%r15)
000000000046f2f5	je	0x46f483
000000000046f2fb	testq	%r12, %r12
000000000046f2fe	je	0x46f483
000000000046f304	movl	$0x218, %edi                    ## imm = 0x218
000000000046f309	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000046f30e	movq	%rax, %r12
000000000046f311	movq	%rax, %rdi
000000000046f314	callq	0x6ddc5c                        ## symbol stub for: __ZN14LiSimpleCameraC1Ev
000000000046f319	movq	%r12, -0x48(%rbp)
000000000046f31d	movq	(%r12), %rax
000000000046f321	movq	-0x18(%rax), %rsi
000000000046f325	addq	%r12, %rsi
000000000046f328	leaq	-0x40(%rbp), %r12
000000000046f32c	movq	%r12, %rdi
000000000046f32f	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
000000000046f334	movq	-0x48(%rbp), %rdi
000000000046f338	testq	%rdi, %rdi
000000000046f33b	jne	0x46f34b
000000000046f33d	movl	$0x1, %edi
000000000046f342	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
000000000046f347	movq	-0x48(%rbp), %rdi
000000000046f34b	movq	0x30(%r13), %rax
000000000046f34f	movq	(%rax), %rsi
000000000046f352	movq	(%rdi), %rax
000000000046f355	callq	*0xa8(%rax)
000000000046f35b	movq	0x628(%r15), %rdi
000000000046f362	testq	%rdi, %rdi
000000000046f365	jne	0x46f378
000000000046f367	movl	$0x1, %edi
000000000046f36c	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
000000000046f371	movq	0x628(%r15), %rdi
000000000046f378	movq	-0x48(%rbp), %rsi
000000000046f37c	movq	(%rdi), %rax
000000000046f37f	callq	*0xb8(%rax)
000000000046f385	leaq	0x10(%r15), %rdx
000000000046f389	movq	%r14, -0x78(%rbp)
000000000046f38d	movq	%r14, -0xa0(%rbp)
000000000046f394	movq	%r14, -0xc8(%rbp)
000000000046f39b	movq	%r14, -0xf0(%rbp)
000000000046f3a2	xorpd	%xmm0, %xmm0
000000000046f3a6	movupd	%xmm0, -0xe8(%rbp)
000000000046f3ae	movupd	%xmm0, -0xd8(%rbp)
000000000046f3b6	movapd	%xmm0, -0xc0(%rbp)
000000000046f3be	movapd	%xmm0, -0xb0(%rbp)
000000000046f3c6	movupd	%xmm0, -0x98(%rbp)
000000000046f3ce	movupd	%xmm0, -0x88(%rbp)
000000000046f3d6	movq	-0x48(%rbp), %rsi
000000000046f3da	leaq	-0xf0(%rbp), %r13
000000000046f3e1	movq	%r15, %rdi
000000000046f3e4	movq	%r13, %rcx
000000000046f3e7	callq	__ZN17OZImageMaskRender23calculateBackProjectionEPK8LiCameraRK13OZRenderStateP14PCMatrix44TmplIdE ## OZImageMaskRender::calculateBackProjection(LiCamera const*, OZRenderState const&, PCMatrix44Tmpl<double>*)
000000000046f3ec	testb	%al, %al
000000000046f3ee	je	0x46f477
000000000046f3f4	movq	0x618(%r15), %rax
000000000046f3fb	testq	%rax, %rax
000000000046f3fe	jne	0x46f411
000000000046f400	movl	$0x1, %edi
000000000046f405	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
000000000046f40a	movq	0x618(%r15), %rax
000000000046f411	leaq	0x28(%rax), %rcx
000000000046f415	cmpq	%rcx, %r13
000000000046f418	je	0x46f477
000000000046f41a	movaps	-0xf0(%rbp), %xmm0
000000000046f421	movups	%xmm0, 0x28(%rax)
000000000046f425	movaps	-0xe0(%rbp), %xmm0
000000000046f42c	movups	%xmm0, 0x38(%rax)
000000000046f430	movaps	-0xd0(%rbp), %xmm0
000000000046f437	movups	%xmm0, 0x48(%rax)
000000000046f43b	movaps	-0xc0(%rbp), %xmm0
000000000046f442	movups	%xmm0, 0x58(%rax)
000000000046f446	movaps	-0xb0(%rbp), %xmm0
000000000046f44d	movups	%xmm0, 0x68(%rax)
000000000046f451	movaps	-0xa0(%rbp), %xmm0
000000000046f458	movups	%xmm0, 0x78(%rax)
000000000046f45c	movaps	-0x90(%rbp), %xmm0
000000000046f463	movups	%xmm0, 0x88(%rax)
000000000046f46a	movapd	-0x80(%rbp), %xmm0
000000000046f46f	movupd	%xmm0, 0x98(%rax)
000000000046f477	movq	%r12, %rdi
000000000046f47a	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046f47f	movq	-0x38(%rbp), %r13
000000000046f483	movq	0x5e0(%r15), %rdx
000000000046f48a	movq	-0x60(%rbp), %rbx
000000000046f48e	movq	%rbx, %rdi
000000000046f491	movq	%r13, %rsi
000000000046f494	callq	0x6debb0                        ## symbol stub for: __ZN7LiAgent9getHeliumEP13LiImageSource
000000000046f499	movq	%rbx, %rax
000000000046f49c	addq	$0x148, %rsp                    ## imm = 0x148
000000000046f4a3	popq	%rbx
000000000046f4a4	popq	%r12
000000000046f4a6	popq	%r13
000000000046f4a8	popq	%r14
000000000046f4aa	popq	%r15
000000000046f4ac	popq	%rbp
000000000046f4ad	retq
000000000046f4ae	movq	%rax, %rbx
000000000046f4b1	movq	%r12, %rdi
000000000046f4b4	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000046f4b9	movq	%rbx, %rdi
000000000046f4bc	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000046f4c1	jmp	0x46f4c3
000000000046f4c3	movq	%rax, %rbx
000000000046f4c6	movq	%r12, %rdi
000000000046f4c9	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000046f4ce	movq	%rbx, %rdi
000000000046f4d1	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000046f4d6	nopw	%cs:(%rax,%rax)
