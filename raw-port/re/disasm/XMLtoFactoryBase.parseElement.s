__ZN16XMLtoFactoryBase12parseElementER22PCSerializerReadStreamR15PCStreamElement:
000000000033d1d0	pushq	%rbp
000000000033d1d1	movq	%rsp, %rbp
000000000033d1d4	pushq	%r15
000000000033d1d6	pushq	%r14
000000000033d1d8	pushq	%r13
000000000033d1da	pushq	%r12
000000000033d1dc	pushq	%rbx
000000000033d1dd	subq	$0x48, %rsp
000000000033d1e1	movq	%rdx, %r15
000000000033d1e4	movq	%rsi, %rbx
000000000033d1e7	movq	%rdi, %r14
000000000033d1ea	movl	$0x0, -0x30(%rbp)
000000000033d1f1	movl	0x8(%rdx), %eax
000000000033d1f4	addl	$-0x3c, %eax
000000000033d1f7	cmpl	$0x20, %eax
000000000033d1fa	ja	0x33d4c4
000000000033d200	leaq	0x4d9(%rip), %rcx
000000000033d207	movslq	(%rcx,%rax,4), %rax
000000000033d20b	addq	%rcx, %rax
000000000033d20e	jmpq	*%rax
000000000033d210	movq	%rbx, %rdi
000000000033d213	movq	%r15, %rsi
000000000033d216	callq	__ZL12checkVersionR22PCSerializerReadStreamR15PCStreamElement ## checkVersion(PCSerializerReadStream&, PCStreamElement&)
000000000033d21b	jmp	0x33d684
000000000033d220	leaq	-0x34(%rbp), %rcx
000000000033d224	movq	%rbx, %rdi
000000000033d227	movq	%r15, %rsi
000000000033d22a	movl	$0x6f, %edx
000000000033d22f	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000033d234	leaq	_theApp(%rip), %rax
000000000033d23b	movq	(%rax), %rax
000000000033d23e	movaps	0x3c82fb(%rip), %xmm0
000000000033d245	jmp	0x33d352
000000000033d24a	leaq	-0x34(%rbp), %rcx
000000000033d24e	movq	%rbx, %rdi
000000000033d251	movq	%r15, %rsi
000000000033d254	movl	$0x6f, %edx
000000000033d259	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000033d25e	leaq	_theApp(%rip), %rax
000000000033d265	movq	(%rax), %rax
000000000033d268	movaps	0x3c82a1(%rip), %xmm0
000000000033d26f	jmp	0x33d352
000000000033d274	leaq	-0x34(%rbp), %rcx
000000000033d278	movq	%rbx, %rdi
000000000033d27b	movq	%r15, %rsi
000000000033d27e	movl	$0x6f, %edx
000000000033d283	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000033d288	leaq	_theApp(%rip), %rax
000000000033d28f	movq	(%rax), %rax
000000000033d292	movaps	0x3c8297(%rip), %xmm0
000000000033d299	jmp	0x33d352
000000000033d29e	leaq	-0x34(%rbp), %rcx
000000000033d2a2	movq	%rbx, %rdi
000000000033d2a5	movq	%r15, %rsi
000000000033d2a8	movl	$0x6f, %edx
000000000033d2ad	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000033d2b2	leaq	_theApp(%rip), %rax
000000000033d2b9	movq	(%rax), %rax
000000000033d2bc	movaps	0x3c829d(%rip), %xmm0
000000000033d2c3	jmp	0x33d352
000000000033d2c8	leaq	-0x30(%rbp), %rcx
000000000033d2cc	movq	%rbx, %rdi
000000000033d2cf	movq	%r15, %rsi
000000000033d2d2	movl	$0x6f, %edx
000000000033d2d7	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000033d2dc	movq	%rbx, %rdi
000000000033d2df	movq	%r15, %rsi
000000000033d2e2	movl	$0x75, %edx
000000000033d2e7	callq	0x6df780                        ## symbol stub for: __ZNK22PCSerializerReadStream18getAttributeAsUUIDERK15PCStreamElementj
000000000033d2ec	testq	%rax, %rax
000000000033d2ef	je	0x33d50e
000000000033d2f5	leaq	_theApp(%rip), %r15
000000000033d2fc	movq	(%r15), %rcx
000000000033d2ff	movq	0x20(%rcx), %rdi
000000000033d303	movq	%rax, %rsi
000000000033d306	movq	%rax, %r14
000000000033d309	callq	0x6dd5ae                        ## symbol stub for: __ZN11OZFactories11findFactoryERK6PCUUID
000000000033d30e	movq	(%r15), %rcx
000000000033d311	movl	-0x30(%rbp), %esi
000000000033d314	movq	0x20(%rcx), %rdi
000000000033d318	movq	%rax, %rdx
000000000033d31b	callq	0x6dd5c6                        ## symbol stub for: __ZN11OZFactories16setFactoryLoadIDEjP9OZFactory
000000000033d320	movq	%r14, %rdi
000000000033d323	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000033d328	jmp	0x33d50e
000000000033d32d	leaq	-0x34(%rbp), %rcx
000000000033d331	movq	%rbx, %rdi
000000000033d334	movq	%r15, %rsi
000000000033d337	movl	$0x6f, %edx
000000000033d33c	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000033d341	leaq	_theApp(%rip), %rax
000000000033d348	movq	(%rax), %rax
000000000033d34b	movaps	0x3c81fe(%rip), %xmm0
000000000033d352	movaps	%xmm0, -0x60(%rbp)
000000000033d356	movq	0x20(%rax), %rdi
000000000033d35a	leaq	-0x60(%rbp), %rsi
000000000033d35e	callq	0x6dd5ae                        ## symbol stub for: __ZN11OZFactories11findFactoryERK6PCUUID
000000000033d363	movq	%rax, %r12
000000000033d366	testq	%rax, %rax
000000000033d369	je	0x33d50e
000000000033d36f	leaq	-0x60(%rbp), %rdi
000000000033d373	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
000000000033d378	leaq	-0x40(%rbp), %rdi
000000000033d37c	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
000000000033d381	leaq	-0x48(%rbp), %rdi
000000000033d385	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
000000000033d38a	movl	$0x0, -0x64(%rbp)
000000000033d391	movb	$0x0, -0x29(%rbp)
000000000033d395	movl	$0x0, -0x30(%rbp)
000000000033d39c	leaq	-0x60(%rbp), %rcx
000000000033d3a0	movq	%rbx, %rdi
000000000033d3a3	movq	%r15, %rsi
000000000033d3a6	movl	$0x6e, %edx
000000000033d3ab	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
000000000033d3b0	leaq	-0x30(%rbp), %rcx
000000000033d3b4	movq	%rbx, %rdi
000000000033d3b7	movq	%r15, %rsi
000000000033d3ba	movl	$0x6f, %edx
000000000033d3bf	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000033d3c4	leaq	-0x29(%rbp), %rcx
000000000033d3c8	movq	%rbx, %rdi
000000000033d3cb	movq	%r15, %rsi
000000000033d3ce	movl	$0x9, %edx
000000000033d3d3	callq	0x6df77a                        ## symbol stub for: __ZNK22PCSerializerReadStream18getAttributeAsBoolERK15PCStreamElementjPb
000000000033d3d8	leaq	-0x64(%rbp), %rcx
000000000033d3dc	movq	%rbx, %rdi
000000000033d3df	movq	%r15, %rsi
000000000033d3e2	movl	$0x8, %edx
000000000033d3e7	callq	0x6df786                        ## symbol stub for: __ZNK22PCSerializerReadStream19getAttributeAsInt32ERK15PCStreamElementjPi
000000000033d3ec	leaq	-0x48(%rbp), %rcx
000000000033d3f0	movq	%rbx, %rdi
000000000033d3f3	movq	%r15, %rsi
000000000033d3f6	movl	$0x7, %edx
000000000033d3fb	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
000000000033d400	testb	%al, %al
000000000033d402	jne	0x33d420
000000000033d404	leaq	-0x40(%rbp), %rcx
000000000033d408	movq	%rbx, %rdi
000000000033d40b	movq	%r15, %rsi
000000000033d40e	movl	$0x76, %edx
000000000033d413	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
000000000033d418	testb	%al, %al
000000000033d41a	je	0x33d51c
000000000033d420	movq	0x4e5451(%rip), %rsi            ## literal pool symbol address: __ZTI9OZFactory
000000000033d427	movq	0x4e9b0a(%rip), %rdx            ## literal pool symbol address: __ZTI21OZFxGenerator_Factory
000000000033d42e	movq	%r12, %rdi
000000000033d431	xorl	%ecx, %ecx
000000000033d433	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000033d438	testq	%rax, %rax
000000000033d43b	je	0x33d476
000000000033d43d	movq	%rax, %r13
000000000033d440	leaq	-0x48(%rbp), %rdi
000000000033d444	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
000000000033d449	movl	-0x30(%rbp), %edx
000000000033d44c	movl	-0x64(%rbp), %ecx
000000000033d44f	movzbl	-0x29(%rbp), %esi
000000000033d453	movq	(%r13), %rdi
000000000033d457	movq	0xc8(%rdi), %r9
000000000033d45e	testb	%al, %al
000000000033d460	je	0x33d559
000000000033d466	movzbl	%sil, %r8d
000000000033d46a	leaq	-0x40(%rbp), %rsi
000000000033d46e	movq	%r13, %rdi
000000000033d471	callq	*%r9
000000000033d474	jmp	0x33d4b9
000000000033d476	movq	0x4e53fb(%rip), %rsi            ## literal pool symbol address: __ZTI9OZFactory
000000000033d47d	movq	0x4e9a8c(%rip), %rdx            ## literal pool symbol address: __ZTI18OZSceneNodeFactory
000000000033d484	movq	%r12, %rdi
000000000033d487	xorl	%ecx, %ecx
000000000033d489	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000033d48e	movq	%rax, %r12
000000000033d491	leaq	-0x48(%rbp), %rdi
000000000033d495	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
000000000033d49a	movl	-0x30(%rbp), %edx
000000000033d49d	movq	(%r12), %rcx
000000000033d4a1	movq	0xa8(%rcx), %rcx
000000000033d4a8	testb	%al, %al
000000000033d4aa	je	0x33d58c
000000000033d4b0	leaq	-0x40(%rbp), %rsi
000000000033d4b4	movq	%r12, %rdi
000000000033d4b7	callq	*%rcx
000000000033d4b9	movq	%rax, %r12
000000000033d4bc	movq	%rax, %r15
000000000033d4bf	jmp	0x33d610
000000000033d4c4	leaq	-0x34(%rbp), %rcx
000000000033d4c8	movq	%rbx, %rdi
000000000033d4cb	movq	%r15, %rsi
000000000033d4ce	movl	$0x6f, %edx
000000000033d4d3	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000033d4d8	leaq	-0x30(%rbp), %rcx
000000000033d4dc	movq	%rbx, %rdi
000000000033d4df	movq	%r15, %rsi
000000000033d4e2	movl	$0x71, %edx
000000000033d4e7	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000033d4ec	leaq	_theApp(%rip), %rax
000000000033d4f3	movq	(%rax), %rax
000000000033d4f6	movl	-0x30(%rbp), %esi
000000000033d4f9	movq	0x20(%rax), %rdi
000000000033d4fd	callq	0x6dd5ba                        ## symbol stub for: __ZN11OZFactories13lookupFactoryEj
000000000033d502	movq	%rax, %r12
000000000033d505	testq	%rax, %rax
000000000033d508	jne	0x33d36f
000000000033d50e	movq	(%rbx), %rax
000000000033d511	movq	%rbx, %rdi
000000000033d514	callq	*0x28(%rax)
000000000033d517	jmp	0x33d684
000000000033d51c	movl	-0x30(%rbp), %edx
000000000033d51f	movq	(%r12), %rax
000000000033d523	leaq	-0x60(%rbp), %rsi
000000000033d527	movq	%r12, %rdi
000000000033d52a	callq	*0x10(%rax)
000000000033d52d	movq	%rax, %r12
000000000033d530	testq	%rax, %rax
000000000033d533	je	0x33d5ba
000000000033d539	movq	0x4e9948(%rip), %rsi            ## literal pool symbol address: __ZTI13OZFactoryBase
000000000033d540	leaq	__ZTI11OZSceneNode(%rip), %rdx  ## typeinfo for OZSceneNode
000000000033d547	movq	%r12, %rdi
000000000033d54a	xorl	%ecx, %ecx
000000000033d54c	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000033d551	movq	%rax, %r15
000000000033d554	jmp	0x33d610
000000000033d559	movzbl	%sil, %r8d
000000000033d55d	leaq	-0x48(%rbp), %rsi
000000000033d561	movq	%r13, %rdi
000000000033d564	callq	*%r9
000000000033d567	movq	%rax, %r12
000000000033d56a	testq	%rax, %rax
000000000033d56d	je	0x33d5c2
000000000033d56f	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000033d576	leaq	__ZTI13OZFxGenerator(%rip), %rdx ## typeinfo for OZFxGenerator
000000000033d57d	movq	%r12, %rdi
000000000033d580	xorl	%ecx, %ecx
000000000033d582	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000033d587	movq	%rax, %r13
000000000033d58a	jmp	0x33d5c5
000000000033d58c	leaq	-0x48(%rbp), %rsi
000000000033d590	movq	%r12, %rdi
000000000033d593	callq	*%rcx
000000000033d595	movq	%rax, %r12
000000000033d598	testq	%rax, %rax
000000000033d59b	je	0x33d5ea
000000000033d59d	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000033d5a4	leaq	__ZTI13OZFxGenerator(%rip), %rdx ## typeinfo for OZFxGenerator
000000000033d5ab	movq	%r12, %rdi
000000000033d5ae	xorl	%ecx, %ecx
000000000033d5b0	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000033d5b5	movq	%rax, %r13
000000000033d5b8	jmp	0x33d5ed
000000000033d5ba	xorl	%r12d, %r12d
000000000033d5bd	xorl	%r15d, %r15d
000000000033d5c0	jmp	0x33d610
000000000033d5c2	xorl	%r13d, %r13d
000000000033d5c5	leaq	-0x40(%rbp), %rcx
000000000033d5c9	movq	%rbx, %rdi
000000000033d5cc	movq	%r15, %rsi
000000000033d5cf	movl	$0x76, %edx
000000000033d5d4	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
000000000033d5d9	leaq	-0x40(%rbp), %rsi
000000000033d5dd	movq	%r13, %rdi
000000000033d5e0	callq	__ZN13OZFxGenerator15setInternalNameERK8PCString ## OZFxGenerator::setInternalName(PCString const&)
000000000033d5e5	movq	%r12, %r15
000000000033d5e8	jmp	0x33d610
000000000033d5ea	xorl	%r13d, %r13d
000000000033d5ed	leaq	-0x40(%rbp), %rcx
000000000033d5f1	movq	%rbx, %rdi
000000000033d5f4	movq	%r15, %rsi
000000000033d5f7	movl	$0x76, %edx
000000000033d5fc	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
000000000033d601	leaq	-0x40(%rbp), %rsi
000000000033d605	movq	%r13, %rdi
000000000033d608	callq	__ZN13OZFxGenerator15setInternalNameERK8PCString ## OZFxGenerator::setInternalName(PCString const&)
000000000033d60d	movq	%r12, %r15
000000000033d610	cmpq	$0x0, 0x10(%r14)
000000000033d615	je	0x33d61e
000000000033d617	testq	%r15, %r15
000000000033d61a	jne	0x33d627
000000000033d61c	jmp	0x33d644
000000000033d61e	movq	%r12, 0x10(%r14)
000000000033d622	testq	%r15, %r15
000000000033d625	je	0x33d644
000000000033d627	movl	-0x34(%rbp), %esi
000000000033d62a	leaq	0x30(%r15), %rdi
000000000033d62e	callq	0x6dd8fc                        ## symbol stub for: __ZN13OZChannelBase5setIDEj
000000000033d633	movq	0x8(%r14), %rdi
000000000033d637	testq	%rdi, %rdi
000000000033d63a	je	0x33d644
000000000033d63c	movq	%r15, %rsi
000000000033d63f	callq	__ZN7OZScene11addRootNodeEP11OZSceneNode ## OZScene::addRootNode(OZSceneNode*)
000000000033d644	testq	%r12, %r12
000000000033d647	je	0x33d660
000000000033d649	movq	(%r12), %rax
000000000033d64d	movq	%r12, %rdi
000000000033d650	callq	*0x40(%rax)
000000000033d653	movq	%rbx, %rdi
000000000033d656	movq	%rax, %rsi
000000000033d659	callq	0x6de790                        ## symbol stub for: __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
000000000033d65e	jmp	0x33d669
000000000033d660	movq	(%rbx), %rax
000000000033d663	movq	%rbx, %rdi
000000000033d666	callq	*0x28(%rax)
000000000033d669	leaq	-0x48(%rbp), %rdi
000000000033d66d	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000033d672	leaq	-0x40(%rbp), %rdi
000000000033d676	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000033d67b	leaq	-0x60(%rbp), %rdi
000000000033d67f	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000033d684	movb	$0x1, %al
000000000033d686	addq	$0x48, %rsp
000000000033d68a	popq	%rbx
000000000033d68b	popq	%r12
000000000033d68d	popq	%r13
000000000033d68f	popq	%r14
000000000033d691	popq	%r15
000000000033d693	popq	%rbp
000000000033d694	retq
000000000033d695	jmp	0x33d6b8
000000000033d697	jmp	0x33d6b8
000000000033d699	movq	%rax, %rbx
000000000033d69c	jmp	0x33d6c4
000000000033d69e	movq	%rax, %rbx
000000000033d6a1	leaq	-0x60(%rbp), %rdi
000000000033d6a5	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000033d6aa	movq	%rbx, %rdi
000000000033d6ad	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000033d6b2	jmp	0x33d6b8
000000000033d6b4	jmp	0x33d6b8
000000000033d6b6	jmp	0x33d6b8
000000000033d6b8	movq	%rax, %rbx
000000000033d6bb	leaq	-0x48(%rbp), %rdi
000000000033d6bf	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000033d6c4	leaq	-0x40(%rbp), %rdi
000000000033d6c8	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000033d6cd	leaq	-0x60(%rbp), %rdi
000000000033d6d1	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000033d6d6	movq	%rbx, %rdi
000000000033d6d9	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000033d6de	nop
000000000033d6e0	.byte 0x2e #bad opcode
000000000033d6e1	.byte 0xfe #bad opcode
000000000033d6e2	.byte 0xff #bad opcode
000000000033d6e3	callq	*-0x21b0001(%rbx,%rdi,8)
000000000033d6ea	.byte 0xff #bad opcode
000000000033d6eb	incl	-0x5(%rax)
000000000033d6ee	.byte 0xff #bad opcode
000000000033d6ef	.byte 0xff #bad opcode
000000000033d6f0	movl	$0xe4fffffb, %esi               ## imm = 0xE4FFFFFB
000000000033d6f5	std
000000000033d6f6	.byte 0xff #bad opcode
000000000033d6f7	decl	-0x4(%rbp)
000000000033d6fa	.byte 0xff #bad opcode
000000000033d6fb	ljmpl	*-0x5(%rdx)
000000000033d6fe	.byte 0xff #bad opcode
000000000033d6ff	jmpq	*%rsp
000000000033d701	std
000000000033d702	.byte 0xff #bad opcode
000000000033d703	jmpq	*%rsp
000000000033d705	std
000000000033d706	.byte 0xff #bad opcode
000000000033d707	jmpq	*%rsp
000000000033d709	std
000000000033d70a	.byte 0xff #bad opcode
000000000033d70b	jmpq	*%rsp
000000000033d70d	std
000000000033d70e	.byte 0xff #bad opcode
000000000033d70f	jmpq	*%rsp
000000000033d711	std
000000000033d712	.byte 0xff #bad opcode
000000000033d713	jmpq	*%rsp
000000000033d715	std
000000000033d716	.byte 0xff #bad opcode
000000000033d717	jmpq	*%rsp
000000000033d719	std
000000000033d71a	.byte 0xff #bad opcode
000000000033d71b	jmpq	*%rsp
000000000033d71d	std
000000000033d71e	.byte 0xff #bad opcode
000000000033d71f	jmpq	*%rsp
000000000033d721	std
000000000033d722	.byte 0xff #bad opcode
000000000033d723	jmpq	*%rsp
000000000033d725	std
000000000033d726	.byte 0xff #bad opcode
000000000033d727	jmpq	*%rsp
000000000033d729	std
000000000033d72a	.byte 0xff #bad opcode
000000000033d72b	jmpq	*%rsp
000000000033d72d	std
000000000033d72e	.byte 0xff #bad opcode
000000000033d72f	jmpq	*%rsp
000000000033d731	std
000000000033d732	.byte 0xff #bad opcode
000000000033d733	jmpq	*%rsp
000000000033d735	std
000000000033d736	.byte 0xff #bad opcode
000000000033d737	jmpq	*%rsp
000000000033d739	std
000000000033d73a	.byte 0xff #bad opcode
000000000033d73b	jmpq	*%rsp
000000000033d73d	std
000000000033d73e	.byte 0xff #bad opcode
000000000033d73f	jmpq	*%rsp
000000000033d741	std
000000000033d742	.byte 0xff #bad opcode
000000000033d743	jmpq	*%rsp
000000000033d745	std
000000000033d746	.byte 0xff #bad opcode
000000000033d747	jmpq	*%rsp
000000000033d749	std
000000000033d74a	.byte 0xff #bad opcode
000000000033d74b	jmpq	*%rsp
000000000033d74d	std
000000000033d74e	.byte 0xff #bad opcode
000000000033d74f	jmpq	*%rsp
000000000033d751	std
000000000033d752	.byte 0xff #bad opcode
000000000033d753	jmpq	*%rsp
000000000033d755	std
000000000033d756	.byte 0xff #bad opcode
000000000033d757	pushq	(%rax)
000000000033d759	sti
000000000033d75a	.byte 0xff #bad opcode
000000000033d75b	pushq	(%rax)
000000000033d75d	sti
000000000033d75e	.byte 0xff #bad opcode
000000000033d75f	.byte 0xff #bad opcode
000000000033d760	callq	0x6733d760
000000000033d765	nopw	%cs:(%rax,%rax)
