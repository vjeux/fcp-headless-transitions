__ZN19OZChannelRotation3D22compoundMoveKeypointToEP9OZChannelRK6CMTimeS4_bbb:
0000000000081b1c	pushq	%rbp
0000000000081b1d	movq	%rsp, %rbp
0000000000081b20	pushq	%r15
0000000000081b22	pushq	%r14
0000000000081b24	pushq	%r13
0000000000081b26	pushq	%r12
0000000000081b28	pushq	%rbx
0000000000081b29	subq	$0x58, %rsp
0000000000081b2d	movl	%r9d, %r13d
0000000000081b30	movq	%rcx, %rbx
0000000000081b33	movq	%rdx, %r12
0000000000081b36	movq	%rsi, %r15
0000000000081b39	movq	%rdi, -0x38(%rbp)
0000000000081b3d	movb	0x18(%rbp), %r14b
0000000000081b41	movq	0x10(%r8), %rax
0000000000081b45	movq	%rax, -0x40(%rbp)
0000000000081b49	movups	(%r8), %xmm0
0000000000081b4d	movaps	%xmm0, -0x50(%rbp)
0000000000081b51	movq	%rsi, %rdi
0000000000081b54	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081b59	callq	__ZNK15OZChannelFolder12testFoldFlagEj ## OZChannelFolder::testFoldFlag(unsigned int) const
0000000000081b5e	testb	%r14b, %r14b
0000000000081b61	jne	0x81b67
0000000000081b63	testb	%al, %al
0000000000081b65	je	0x81ba3
0000000000081b67	movq	%r15, %rdi
0000000000081b6a	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081b6f	callq	__ZN15OZChannelFolder13resetFoldFlagEj ## OZChannelFolder::resetFoldFlag(unsigned int)
0000000000081b74	leaq	0x88(%r15), %r14
0000000000081b7b	cmpq	%r12, %r14
0000000000081b7e	setne	%al
0000000000081b81	leaq	0x120(%r15), %rsi
0000000000081b88	cmpq	%r12, %rsi
0000000000081b8b	setne	%cl
0000000000081b8e	andb	%al, %cl
0000000000081b90	leaq	0x1b8(%r15), %rdx
0000000000081b97	cmpq	%r12, %rdx
0000000000081b9a	setne	%al
0000000000081b9d	andb	%cl, %al
0000000000081b9f	cmpb	$0x1, %al
0000000000081ba1	jne	0x81bcc
0000000000081ba3	movq	(%r12), %rax
0000000000081ba7	movzbl	%r13b, %r8d
0000000000081bab	movzbl	0x10(%rbp), %r9d
0000000000081bb0	leaq	-0x50(%rbp), %rcx
0000000000081bb4	movq	-0x38(%rbp), %r14
0000000000081bb8	movq	%r14, %rdi
0000000000081bbb	movq	%r12, %rsi
0000000000081bbe	movq	%rbx, %rdx
0000000000081bc1	callq	*0x268(%rax)
0000000000081bc7	jmp	0x81cce
0000000000081bcc	movq	%rsi, -0x58(%rbp)
0000000000081bd0	movq	%rdx, -0x60(%rbp)
0000000000081bd4	leaq	0x250(%r15), %rdi
0000000000081bdb	movq	0x488de(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000081be2	xorps	%xmm0, %xmm0
0000000000081be5	movq	%rdi, -0x68(%rbp)
0000000000081be9	movl	$0x1, %edx
0000000000081bee	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000081bf3	movq	(%r12), %rax
0000000000081bf7	movzbl	%r13b, %r8d
0000000000081bfb	movl	%r8d, -0x2c(%rbp)
0000000000081bff	movzbl	0x10(%rbp), %r13d
0000000000081c04	leaq	-0x80(%rbp), %rdi
0000000000081c08	leaq	-0x50(%rbp), %rcx
0000000000081c0c	movq	%r12, %rsi
0000000000081c0f	movq	%rbx, %rdx
0000000000081c12	movl	%r13d, %r9d
0000000000081c15	callq	*0x268(%rax)
0000000000081c1b	leaq	-0x80(%rbp), %rcx
0000000000081c1f	movq	0x10(%rcx), %rax
0000000000081c23	leaq	-0x50(%rbp), %rdx
0000000000081c27	movq	%rax, 0x10(%rdx)
0000000000081c2b	movups	(%rcx), %xmm0
0000000000081c2e	movaps	%xmm0, (%rdx)
0000000000081c31	cmpq	%r12, %r14
0000000000081c34	je	0x81c50
0000000000081c36	leaq	-0x80(%rbp), %rdi
0000000000081c3a	leaq	-0x50(%rbp), %rcx
0000000000081c3e	movq	%r14, %rsi
0000000000081c41	movq	%rbx, %rdx
0000000000081c44	movl	-0x2c(%rbp), %r8d
0000000000081c48	movl	%r13d, %r9d
0000000000081c4b	callq	__ZN9OZChannel14moveKeypointToERK6CMTimeS2_bb ## OZChannel::moveKeypointTo(CMTime const&, CMTime const&, bool, bool)
0000000000081c50	movq	-0x58(%rbp), %rsi
0000000000081c54	cmpq	%r12, %rsi
0000000000081c57	je	0x81c70
0000000000081c59	leaq	-0x80(%rbp), %rdi
0000000000081c5d	leaq	-0x50(%rbp), %rcx
0000000000081c61	movq	%rbx, %rdx
0000000000081c64	movl	-0x2c(%rbp), %r8d
0000000000081c68	movl	%r13d, %r9d
0000000000081c6b	callq	__ZN9OZChannel14moveKeypointToERK6CMTimeS2_bb ## OZChannel::moveKeypointTo(CMTime const&, CMTime const&, bool, bool)
0000000000081c70	movq	-0x60(%rbp), %rsi
0000000000081c74	cmpq	%r12, %rsi
0000000000081c77	movq	-0x38(%rbp), %r14
0000000000081c7b	je	0x81c94
0000000000081c7d	leaq	-0x80(%rbp), %rdi
0000000000081c81	leaq	-0x50(%rbp), %rcx
0000000000081c85	movq	%rbx, %rdx
0000000000081c88	movl	-0x2c(%rbp), %r8d
0000000000081c8c	movl	%r13d, %r9d
0000000000081c8f	callq	__ZN9OZChannel14moveKeypointToERK6CMTimeS2_bb ## OZChannel::moveKeypointTo(CMTime const&, CMTime const&, bool, bool)
0000000000081c94	movq	0x48825(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000081c9b	movsd	0x2d885(%rip), %xmm0
0000000000081ca3	movq	-0x68(%rbp), %rdi
0000000000081ca7	movl	$0x1, %edx
0000000000081cac	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000081cb1	movq	%r15, %rdi
0000000000081cb4	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081cb9	callq	__ZN15OZChannelFolder11setFoldFlagEj ## OZChannelFolder::setFoldFlag(unsigned int)
0000000000081cbe	movq	-0x40(%rbp), %rax
0000000000081cc2	movq	%rax, 0x10(%r14)
0000000000081cc6	movaps	-0x50(%rbp), %xmm0
0000000000081cca	movups	%xmm0, (%r14)
0000000000081cce	movq	%r14, %rax
0000000000081cd1	addq	$0x58, %rsp
0000000000081cd5	popq	%rbx
0000000000081cd6	popq	%r12
0000000000081cd8	popq	%r13
0000000000081cda	popq	%r14
0000000000081cdc	popq	%r15
0000000000081cde	popq	%rbp
0000000000081cdf	retq
