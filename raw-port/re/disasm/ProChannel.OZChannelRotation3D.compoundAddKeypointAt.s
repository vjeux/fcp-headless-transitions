__ZN19OZChannelRotation3D21compoundAddKeypointAtEP9OZChannelRK6CMTimeb:
0000000000081a06	pushq	%rbp
0000000000081a07	movq	%rsp, %rbp
0000000000081a0a	pushq	%r15
0000000000081a0c	pushq	%r14
0000000000081a0e	pushq	%r13
0000000000081a10	pushq	%r12
0000000000081a12	pushq	%rbx
0000000000081a13	pushq	%rax
0000000000081a14	movl	%ecx, %r12d
0000000000081a17	movq	%rdx, %r14
0000000000081a1a	movq	%rsi, %r15
0000000000081a1d	movq	%rdi, %rbx
0000000000081a20	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081a25	callq	__ZNK15OZChannelFolder12testFoldFlagEj ## OZChannelFolder::testFoldFlag(unsigned int) const
0000000000081a2a	testl	%r12d, %r12d
0000000000081a2d	jne	0x81a53
0000000000081a2f	testb	%al, %al
0000000000081a31	jne	0x81a53
0000000000081a33	movq	(%r15), %rax
0000000000081a36	movq	0x258(%rax), %rax
0000000000081a3d	movq	%r15, %rdi
0000000000081a40	movq	%r14, %rsi
0000000000081a43	addq	$0x8, %rsp
0000000000081a47	popq	%rbx
0000000000081a48	popq	%r12
0000000000081a4a	popq	%r13
0000000000081a4c	popq	%r14
0000000000081a4e	popq	%r15
0000000000081a50	popq	%rbp
0000000000081a51	jmpq	*%rax
0000000000081a53	movq	%rbx, %rdi
0000000000081a56	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081a5b	callq	__ZN15OZChannelFolder13resetFoldFlagEj ## OZChannelFolder::resetFoldFlag(unsigned int)
0000000000081a60	leaq	0x88(%rbx), %r12
0000000000081a67	cmpq	%r15, %r12
0000000000081a6a	setne	%al
0000000000081a6d	leaq	0x120(%rbx), %rdx
0000000000081a74	cmpq	%r15, %rdx
0000000000081a77	setne	%cl
0000000000081a7a	andb	%al, %cl
0000000000081a7c	leaq	0x1b8(%rbx), %r13
0000000000081a83	cmpq	%r15, %r13
0000000000081a86	setne	%al
0000000000081a89	andb	%cl, %al
0000000000081a8b	cmpb	$0x1, %al
0000000000081a8d	jne	0x81aa0
0000000000081a8f	movq	(%r15), %rax
0000000000081a92	movq	%r15, %rdi
0000000000081a95	movq	%r14, %rsi
0000000000081a98	callq	*0x258(%rax)
0000000000081a9e	jmp	0x81b00
0000000000081aa0	leaq	0x250(%rbx), %rdi
0000000000081aa7	movq	%rdi, -0x30(%rbp)
0000000000081aab	movq	0x48a0e(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000081ab2	xorps	%xmm0, %xmm0
0000000000081ab5	movq	%rdx, %r15
0000000000081ab8	movl	$0x1, %edx
0000000000081abd	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000081ac2	movq	%r12, %rdi
0000000000081ac5	movq	%r14, %rsi
0000000000081ac8	callq	__ZN9OZChannel13addKeypointAtERK6CMTime ## OZChannel::addKeypointAt(CMTime const&)
0000000000081acd	movq	%r15, %rdi
0000000000081ad0	movq	%r14, %rsi
0000000000081ad3	callq	__ZN9OZChannel13addKeypointAtERK6CMTime ## OZChannel::addKeypointAt(CMTime const&)
0000000000081ad8	movq	%r13, %rdi
0000000000081adb	movq	%r14, %rsi
0000000000081ade	callq	__ZN9OZChannel13addKeypointAtERK6CMTime ## OZChannel::addKeypointAt(CMTime const&)
0000000000081ae3	movsd	0x2da3d(%rip), %xmm0
0000000000081aeb	movq	-0x30(%rbp), %rdi
0000000000081aef	movq	0x489ca(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000081af6	movl	$0x1, %edx
0000000000081afb	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000081b00	movq	%rbx, %rdi
0000000000081b03	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081b08	addq	$0x8, %rsp
0000000000081b0c	popq	%rbx
0000000000081b0d	popq	%r12
0000000000081b0f	popq	%r13
0000000000081b11	popq	%r14
0000000000081b13	popq	%r15
0000000000081b15	popq	%rbp
0000000000081b16	jmp	__ZN15OZChannelFolder11setFoldFlagEj ## OZChannelFolder::setFoldFlag(unsigned int)
0000000000081b1b	nop
