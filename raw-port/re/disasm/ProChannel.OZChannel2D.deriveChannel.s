__ZN11OZChannel2D13deriveChannelERK6CMTime:
00000000000479d2	pushq	%rbp
00000000000479d3	movq	%rsp, %rbp
00000000000479d6	pushq	%r15
00000000000479d8	pushq	%r14
00000000000479da	pushq	%r13
00000000000479dc	pushq	%r12
00000000000479de	pushq	%rbx
00000000000479df	subq	$0xe8, %rsp
00000000000479e6	movq	%rsi, %r13
00000000000479e9	movq	%rdi, %rbx
00000000000479ec	xorl	%eax, %eax
00000000000479ee	movq	%rax, -0x68(%rbp)
00000000000479f2	movq	%rax, -0x60(%rbp)
00000000000479f6	movq	%rax, -0x80(%rbp)
00000000000479fa	movq	%rax, -0x58(%rbp)
00000000000479fe	movq	%rax, -0x78(%rbp)
0000000000047a02	movq	%rax, -0x50(%rbp)
0000000000047a06	movq	0x82ab3(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
0000000000047a0d	movq	0x10(%rcx), %rdx
0000000000047a11	movq	%rdx, -0x100(%rbp)
0000000000047a18	movups	(%rcx), %xmm0
0000000000047a1b	movaps	%xmm0, -0x110(%rbp)
0000000000047a22	movq	0x10(%rcx), %rdx
0000000000047a26	movq	%rdx, -0xe0(%rbp)
0000000000047a2d	movups	(%rcx), %xmm0
0000000000047a30	movaps	%xmm0, -0xf0(%rbp)
0000000000047a37	movq	0x10(%rcx), %rdx
0000000000047a3b	movq	%rdx, -0xc0(%rbp)
0000000000047a42	movups	(%rcx), %xmm0
0000000000047a45	movaps	%xmm0, -0xd0(%rbp)
0000000000047a4c	movq	0x10(%rcx), %rdx
0000000000047a50	movq	%rdx, -0xa0(%rbp)
0000000000047a57	movups	(%rcx), %xmm0
0000000000047a5a	movaps	%xmm0, -0xb0(%rbp)
0000000000047a61	movq	%rax, -0x98(%rbp)
0000000000047a68	leaq	0x88(%rdi), %r15
0000000000047a6f	movq	%r15, %rdi
0000000000047a72	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047a77	movq	%rax, %r12
0000000000047a7a	addq	$0x120, %rbx                    ## imm = 0x120
0000000000047a81	movq	%rbx, %rdi
0000000000047a84	movq	%r13, %rsi
0000000000047a87	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047a8c	movq	%rax, %r14
0000000000047a8f	testq	%r12, %r12
0000000000047a92	je	0x47aa7
0000000000047a94	leaq	-0x68(%rbp), %rcx
0000000000047a98	movq	%r15, %rdi
0000000000047a9b	movq	%r12, %rsi
0000000000047a9e	xorl	%edx, %edx
0000000000047aa0	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000047aa5	jmp	0x47ada
0000000000047aa7	movq	%r15, %rdi
0000000000047aaa	movq	%r13, %rsi
0000000000047aad	movl	$0x1, %edx
0000000000047ab2	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000047ab7	movsd	%xmm0, -0x68(%rbp)
0000000000047abc	movq	%r15, %rdi
0000000000047abf	movq	%r13, %rsi
0000000000047ac2	movl	$0x1, %edx
0000000000047ac7	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000047acc	movq	%r15, %rdi
0000000000047acf	movq	%r13, %rsi
0000000000047ad2	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047ad7	movq	%rax, %r12
0000000000047ada	testq	%r14, %r14
0000000000047add	movq	%r12, -0x48(%rbp)
0000000000047ae1	je	0x47afa
0000000000047ae3	leaq	-0x60(%rbp), %rcx
0000000000047ae7	movq	%rbx, %rdi
0000000000047aea	movq	%r14, -0x70(%rbp)
0000000000047aee	movq	%r14, %rsi
0000000000047af1	xorl	%edx, %edx
0000000000047af3	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000047af8	jmp	0x47b2e
0000000000047afa	movq	%rbx, %rdi
0000000000047afd	movq	%r13, %rsi
0000000000047b00	movl	$0x1, %edx
0000000000047b05	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000047b0a	movsd	%xmm0, -0x60(%rbp)
0000000000047b0f	movq	%rbx, %rdi
0000000000047b12	movq	%r13, %rsi
0000000000047b15	movl	$0x1, %edx
0000000000047b1a	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000047b1f	movq	%rbx, %rdi
0000000000047b22	movq	%r13, %rsi
0000000000047b25	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047b2a	movq	%rax, -0x70(%rbp)
0000000000047b2e	leaq	-0x110(%rbp), %r14
0000000000047b35	leaq	-0x80(%rbp), %rcx
0000000000047b39	movq	%r15, %rdi
0000000000047b3c	movq	%r13, %rsi
0000000000047b3f	movq	%r14, %rdx
0000000000047b42	callq	__ZNK9OZChannel19getPreviousKeyframeERK6CMTimePS0_Pd ## OZChannel::getPreviousKeyframe(CMTime const&, CMTime*, double*) const
0000000000047b47	movq	%r15, %rdi
0000000000047b4a	movq	%r14, %rsi
0000000000047b4d	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047b52	movq	%rax, %r12
0000000000047b55	leaq	-0xf0(%rbp), %r14
0000000000047b5c	leaq	-0x78(%rbp), %rcx
0000000000047b60	movq	%rbx, %rdi
0000000000047b63	movq	%r13, %rsi
0000000000047b66	movq	%r14, %rdx
0000000000047b69	callq	__ZNK9OZChannel19getPreviousKeyframeERK6CMTimePS0_Pd ## OZChannel::getPreviousKeyframe(CMTime const&, CMTime*, double*) const
0000000000047b6e	movq	%rbx, %rdi
0000000000047b71	movq	%r14, %rsi
0000000000047b74	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047b79	testq	%r12, %r12
0000000000047b7c	sete	%dl
0000000000047b7f	testq	%rax, %rax
0000000000047b82	setne	%cl
0000000000047b85	andb	%dl, %cl
0000000000047b87	cmpb	$0x1, %cl
0000000000047b8a	movq	%r15, -0x30(%rbp)
0000000000047b8e	movq	%rax, -0x90(%rbp)
0000000000047b95	jne	0x47bb4
0000000000047b97	leaq	-0xf0(%rbp), %rsi
0000000000047b9e	movq	%r15, %rdi
0000000000047ba1	movl	$0x1, %edx
0000000000047ba6	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000047bab	movsd	%xmm0, -0x80(%rbp)
0000000000047bb0	xorl	%ecx, %ecx
0000000000047bb2	jmp	0x47be1
0000000000047bb4	testq	%rax, %rax
0000000000047bb7	sete	%al
0000000000047bba	testq	%r12, %r12
0000000000047bbd	setne	%cl
0000000000047bc0	andb	%cl, %al
0000000000047bc2	cmpb	$0x1, %al
0000000000047bc4	jne	0x47be1
0000000000047bc6	leaq	-0x110(%rbp), %rsi
0000000000047bcd	movq	%rbx, %rdi
0000000000047bd0	movl	$0x1, %edx
0000000000047bd5	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000047bda	movsd	%xmm0, -0x78(%rbp)
0000000000047bdf	movb	$0x1, %cl
0000000000047be1	movl	%ecx, -0x84(%rbp)
0000000000047be7	leaq	-0xd0(%rbp), %r12
0000000000047bee	leaq	-0x58(%rbp), %rcx
0000000000047bf2	movq	-0x30(%rbp), %r15
0000000000047bf6	movq	%r15, %rdi
0000000000047bf9	movq	%r13, %rsi
0000000000047bfc	movq	%r12, %rdx
0000000000047bff	callq	__ZNK9OZChannel15getNextKeyframeERK6CMTimePS0_Pd ## OZChannel::getNextKeyframe(CMTime const&, CMTime*, double*) const
0000000000047c04	movq	%r15, %rdi
0000000000047c07	movq	%r12, %rsi
0000000000047c0a	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047c0f	movq	%rax, %r12
0000000000047c12	leaq	-0xb0(%rbp), %r14
0000000000047c19	leaq	-0x50(%rbp), %rcx
0000000000047c1d	movq	%rbx, %rdi
0000000000047c20	movq	%r13, %rsi
0000000000047c23	movq	%r14, %rdx
0000000000047c26	callq	__ZNK9OZChannel15getNextKeyframeERK6CMTimePS0_Pd ## OZChannel::getNextKeyframe(CMTime const&, CMTime*, double*) const
0000000000047c2b	movq	%rbx, -0x40(%rbp)
0000000000047c2f	movq	%rbx, %rdi
0000000000047c32	movq	%r14, %rsi
0000000000047c35	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047c3a	movq	%rax, %r13
0000000000047c3d	testq	%r12, %r12
0000000000047c40	sete	%al
0000000000047c43	testq	%r13, %r13
0000000000047c46	setne	%cl
0000000000047c49	andb	%al, %cl
0000000000047c4b	cmpb	$0x1, %cl
0000000000047c4e	jne	0x47c72
0000000000047c50	leaq	-0xb0(%rbp), %rsi
0000000000047c57	movq	%r15, %rdi
0000000000047c5a	movl	$0x1, %edx
0000000000047c5f	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000047c64	movsd	%xmm0, -0x58(%rbp)
0000000000047c69	xorl	%r14d, %r14d
0000000000047c6c	movq	-0x40(%rbp), %rbx
0000000000047c70	jmp	0x47ca6
0000000000047c72	testq	%r13, %r13
0000000000047c75	sete	%al
0000000000047c78	testq	%r12, %r12
0000000000047c7b	setne	%r14b
0000000000047c7f	andb	%r14b, %al
0000000000047c82	cmpb	$0x1, %al
0000000000047c84	movq	-0x40(%rbp), %rbx
0000000000047c88	jne	0x47ca6
0000000000047c8a	leaq	-0xd0(%rbp), %rsi
0000000000047c91	movq	%rbx, %rdi
0000000000047c94	movl	$0x1, %edx
0000000000047c99	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000047c9e	movsd	%xmm0, -0x50(%rbp)
0000000000047ca3	movb	$0x1, %r14b
0000000000047ca6	testq	%r13, %r13
0000000000047ca9	setne	%r12b
0000000000047cad	cmpq	$0x0, -0x90(%rbp)
0000000000047cb5	setne	%r13b
0000000000047cb9	movq	-0x30(%rbp), %rdi
0000000000047cbd	movq	-0x48(%rbp), %rsi
0000000000047cc1	callq	__ZN9OZChannel14deriveKeyframeEPv ## OZChannel::deriveKeyframe(void*)
0000000000047cc6	movq	%rbx, %rdi
0000000000047cc9	movq	-0x70(%rbp), %rsi
0000000000047ccd	callq	__ZN9OZChannel14deriveKeyframeEPv ## OZChannel::deriveKeyframe(void*)
0000000000047cd2	movl	-0x84(%rbp), %eax
0000000000047cd8	orb	%r13b, %al
0000000000047cdb	orb	%r14b, %r12b
0000000000047cde	testb	%al, %al
0000000000047ce0	je	0x47d0d
0000000000047ce2	movsd	-0x80(%rbp), %xmm0
0000000000047ce7	movsd	-0x78(%rbp), %xmm1
0000000000047cec	testb	%r12b, %r12b
0000000000047cef	je	0x47d3d
0000000000047cf1	movsd	-0x58(%rbp), %xmm2
0000000000047cf6	movhpd	-0x50(%rbp), %xmm2              ## xmm2 = xmm2[0],mem[0]
0000000000047cfb	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000000047cff	subpd	%xmm0, %xmm2
0000000000047d03	divpd	0x68e35(%rip), %xmm2
0000000000047d0b	jmp	0x47d57
0000000000047d0d	testb	%r12b, %r12b
0000000000047d10	je	0x47e40
0000000000047d16	movsd	-0x58(%rbp), %xmm1
0000000000047d1b	movhpd	-0x50(%rbp), %xmm1              ## xmm1 = xmm1[0],mem[0]
0000000000047d20	movsd	-0x68(%rbp), %xmm0
0000000000047d25	movhpd	-0x60(%rbp), %xmm0              ## xmm0 = xmm0[0],mem[0]
0000000000047d2a	subpd	%xmm0, %xmm1
0000000000047d2e	divpd	0x68e3a(%rip), %xmm1
0000000000047d36	movapd	%xmm1, -0x40(%rbp)
0000000000047d3b	jmp	0x47d5c
0000000000047d3d	movsd	-0x68(%rbp), %xmm2
0000000000047d42	movhpd	-0x60(%rbp), %xmm2              ## xmm2 = xmm2[0],mem[0]
0000000000047d47	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000000047d4b	subpd	%xmm0, %xmm2
0000000000047d4f	divpd	0x68e19(%rip), %xmm2
0000000000047d57	movapd	%xmm2, -0x40(%rbp)
0000000000047d5c	movq	-0x30(%rbp), %r15
0000000000047d60	movq	-0x48(%rbp), %r12
0000000000047d64	leaq	-0x98(%rbp), %r14
0000000000047d6b	movq	%r15, %rdi
0000000000047d6e	movq	%r12, %rsi
0000000000047d71	movq	%r14, %rdx
0000000000047d74	xorl	%ecx, %ecx
0000000000047d76	movl	$0x1, %r8d
0000000000047d7c	callq	__ZN9OZChannel25getKeyframeOutputTangentsEPvPdS1_b ## OZChannel::getKeyframeOutputTangents(void*, double*, double*, bool)
0000000000047d81	movsd	(%r14), %xmm0
0000000000047d86	movq	%r15, %rdi
0000000000047d89	movq	%r12, %rsi
0000000000047d8c	movaps	-0x40(%rbp), %xmm1
0000000000047d90	movl	$0x1, %edx
0000000000047d95	callq	__ZN9OZChannel25setKeyframeOutputTangentsEPvddb ## OZChannel::setKeyframeOutputTangents(void*, double, double, bool)
0000000000047d9a	movq	%r15, %rdi
0000000000047d9d	movq	%r12, %rsi
0000000000047da0	movq	%r14, %rdx
0000000000047da3	xorl	%ecx, %ecx
0000000000047da5	movl	$0x1, %r8d
0000000000047dab	callq	__ZN9OZChannel24getKeyframeInputTangentsEPvPdS1_b ## OZChannel::getKeyframeInputTangents(void*, double*, double*, bool)
0000000000047db0	movsd	(%r14), %xmm0
0000000000047db5	movaps	-0x40(%rbp), %xmm1
0000000000047db9	xorps	0x68880(%rip), %xmm1
0000000000047dc0	movq	%r15, %rdi
0000000000047dc3	movq	%r12, %rsi
0000000000047dc6	movl	$0x1, %edx
0000000000047dcb	callq	__ZN9OZChannel24setKeyframeInputTangentsEPvddb ## OZChannel::setKeyframeInputTangents(void*, double, double, bool)
0000000000047dd0	movq	%rbx, %rdi
0000000000047dd3	movq	-0x70(%rbp), %r15
0000000000047dd7	movq	%r15, %rsi
0000000000047dda	movq	%r14, %rdx
0000000000047ddd	xorl	%ecx, %ecx
0000000000047ddf	movl	$0x1, %r8d
0000000000047de5	callq	__ZN9OZChannel25getKeyframeOutputTangentsEPvPdS1_b ## OZChannel::getKeyframeOutputTangents(void*, double*, double*, bool)
0000000000047dea	movsd	(%r14), %xmm0
0000000000047def	movaps	-0x40(%rbp), %xmm1
0000000000047df3	movhlps	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
0000000000047df6	movaps	%xmm1, -0x40(%rbp)
0000000000047dfa	movq	%rbx, %rdi
0000000000047dfd	movq	%r15, %rsi
0000000000047e00	movl	$0x1, %edx
0000000000047e05	callq	__ZN9OZChannel25setKeyframeOutputTangentsEPvddb ## OZChannel::setKeyframeOutputTangents(void*, double, double, bool)
0000000000047e0a	movq	%rbx, %rdi
0000000000047e0d	movq	%r15, %rsi
0000000000047e10	movq	%r14, %rdx
0000000000047e13	xorl	%ecx, %ecx
0000000000047e15	movl	$0x1, %r8d
0000000000047e1b	callq	__ZN9OZChannel24getKeyframeInputTangentsEPvPdS1_b ## OZChannel::getKeyframeInputTangents(void*, double*, double*, bool)
0000000000047e20	movsd	(%r14), %xmm0
0000000000047e25	movaps	-0x40(%rbp), %xmm1
0000000000047e29	xorps	0x68810(%rip), %xmm1
0000000000047e30	movq	%rbx, %rdi
0000000000047e33	movq	%r15, %rsi
0000000000047e36	movl	$0x1, %edx
0000000000047e3b	callq	__ZN9OZChannel24setKeyframeInputTangentsEPvddb ## OZChannel::setKeyframeInputTangents(void*, double, double, bool)
0000000000047e40	addq	$0xe8, %rsp
0000000000047e47	popq	%rbx
0000000000047e48	popq	%r12
0000000000047e4a	popq	%r13
0000000000047e4c	popq	%r14
0000000000047e4e	popq	%r15
0000000000047e50	popq	%rbp
0000000000047e51	retq
