__ZN19OZChannelRotation3D24compoundDeleteKeypointAtEP9OZChannelRK6CMTimeb:
0000000000081ce0	pushq	%rbp
0000000000081ce1	movq	%rsp, %rbp
0000000000081ce4	pushq	%r15
0000000000081ce6	pushq	%r14
0000000000081ce8	pushq	%r13
0000000000081cea	pushq	%r12
0000000000081cec	pushq	%rbx
0000000000081ced	pushq	%rax
0000000000081cee	movl	%ecx, %r12d
0000000000081cf1	movq	%rdx, %r14
0000000000081cf4	movq	%rsi, %r15
0000000000081cf7	movq	%rdi, %rbx
0000000000081cfa	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081cff	callq	__ZNK15OZChannelFolder12testFoldFlagEj ## OZChannelFolder::testFoldFlag(unsigned int) const
0000000000081d04	testl	%r12d, %r12d
0000000000081d07	jne	0x81d2d
0000000000081d09	testb	%al, %al
0000000000081d0b	jne	0x81d2d
0000000000081d0d	movq	(%r15), %rax
0000000000081d10	movq	0x260(%rax), %rax
0000000000081d17	movq	%r15, %rdi
0000000000081d1a	movq	%r14, %rsi
0000000000081d1d	addq	$0x8, %rsp
0000000000081d21	popq	%rbx
0000000000081d22	popq	%r12
0000000000081d24	popq	%r13
0000000000081d26	popq	%r14
0000000000081d28	popq	%r15
0000000000081d2a	popq	%rbp
0000000000081d2b	jmpq	*%rax
0000000000081d2d	movq	%rbx, %rdi
0000000000081d30	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081d35	callq	__ZN15OZChannelFolder13resetFoldFlagEj ## OZChannelFolder::resetFoldFlag(unsigned int)
0000000000081d3a	leaq	0x88(%rbx), %r12
0000000000081d41	cmpq	%r15, %r12
0000000000081d44	setne	%al
0000000000081d47	leaq	0x120(%rbx), %rdx
0000000000081d4e	cmpq	%r15, %rdx
0000000000081d51	setne	%cl
0000000000081d54	andb	%al, %cl
0000000000081d56	leaq	0x1b8(%rbx), %r13
0000000000081d5d	cmpq	%r15, %r13
0000000000081d60	setne	%al
0000000000081d63	andb	%cl, %al
0000000000081d65	cmpb	$0x1, %al
0000000000081d67	jne	0x81d7a
0000000000081d69	movq	(%r15), %rax
0000000000081d6c	movq	%r15, %rdi
0000000000081d6f	movq	%r14, %rsi
0000000000081d72	callq	*0x260(%rax)
0000000000081d78	jmp	0x81dda
0000000000081d7a	leaq	0x250(%rbx), %rdi
0000000000081d81	movq	%rdi, -0x30(%rbp)
0000000000081d85	movq	0x48734(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000081d8c	xorps	%xmm0, %xmm0
0000000000081d8f	movq	%rdx, %r15
0000000000081d92	movl	$0x1, %edx
0000000000081d97	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000081d9c	movq	%r12, %rdi
0000000000081d9f	movq	%r14, %rsi
0000000000081da2	callq	__ZN9OZChannel16deleteKeypointAtERK6CMTime ## OZChannel::deleteKeypointAt(CMTime const&)
0000000000081da7	movq	%r15, %rdi
0000000000081daa	movq	%r14, %rsi
0000000000081dad	callq	__ZN9OZChannel16deleteKeypointAtERK6CMTime ## OZChannel::deleteKeypointAt(CMTime const&)
0000000000081db2	movq	%r13, %rdi
0000000000081db5	movq	%r14, %rsi
0000000000081db8	callq	__ZN9OZChannel16deleteKeypointAtERK6CMTime ## OZChannel::deleteKeypointAt(CMTime const&)
0000000000081dbd	movsd	0x2d763(%rip), %xmm0
0000000000081dc5	movq	-0x30(%rbp), %rdi
0000000000081dc9	movq	0x486f0(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000081dd0	movl	$0x1, %edx
0000000000081dd5	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000081dda	movq	%rbx, %rdi
0000000000081ddd	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081de2	addq	$0x8, %rsp
0000000000081de6	popq	%rbx
0000000000081de7	popq	%r12
0000000000081de9	popq	%r13
0000000000081deb	popq	%r14
0000000000081ded	popq	%r15
0000000000081def	popq	%rbp
0000000000081df0	jmp	__ZN15OZChannelFolder11setFoldFlagEj ## OZChannelFolder::setFoldFlag(unsigned int)
0000000000081df5	nop
