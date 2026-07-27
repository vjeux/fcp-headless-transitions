__ZN19OZChannelRotation3D19compoundSetIsSplineEP9OZChannelbb:
0000000000081efe	pushq	%rbp
0000000000081eff	movq	%rsp, %rbp
0000000000081f02	pushq	%r15
0000000000081f04	pushq	%r14
0000000000081f06	pushq	%r13
0000000000081f08	pushq	%r12
0000000000081f0a	pushq	%rbx
0000000000081f0b	pushq	%rax
0000000000081f0c	movl	%ecx, %r12d
0000000000081f0f	movl	%edx, %r14d
0000000000081f12	movq	%rsi, %r15
0000000000081f15	movq	%rdi, %rbx
0000000000081f18	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081f1d	callq	__ZNK15OZChannelFolder12testFoldFlagEj ## OZChannelFolder::testFoldFlag(unsigned int) const
0000000000081f22	testl	%r12d, %r12d
0000000000081f25	jne	0x81f4c
0000000000081f27	testb	%al, %al
0000000000081f29	jne	0x81f4c
0000000000081f2b	movq	(%r15), %rax
0000000000081f2e	movq	0x1e0(%rax), %rax
0000000000081f35	movzbl	%r14b, %esi
0000000000081f39	movq	%r15, %rdi
0000000000081f3c	addq	$0x8, %rsp
0000000000081f40	popq	%rbx
0000000000081f41	popq	%r12
0000000000081f43	popq	%r13
0000000000081f45	popq	%r14
0000000000081f47	popq	%r15
0000000000081f49	popq	%rbp
0000000000081f4a	jmpq	*%rax
0000000000081f4c	movq	%rbx, %rdi
0000000000081f4f	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081f54	callq	__ZN15OZChannelFolder13resetFoldFlagEj ## OZChannelFolder::resetFoldFlag(unsigned int)
0000000000081f59	leaq	0x88(%rbx), %r12
0000000000081f60	cmpq	%r15, %r12
0000000000081f63	setne	%al
0000000000081f66	leaq	0x120(%rbx), %rdx
0000000000081f6d	cmpq	%r15, %rdx
0000000000081f70	setne	%cl
0000000000081f73	andb	%al, %cl
0000000000081f75	leaq	0x1b8(%rbx), %r13
0000000000081f7c	cmpq	%r15, %r13
0000000000081f7f	setne	%al
0000000000081f82	andb	%cl, %al
0000000000081f84	cmpb	$0x1, %al
0000000000081f86	jne	0x81f9a
0000000000081f88	movq	(%r15), %rax
0000000000081f8b	movzbl	%r14b, %esi
0000000000081f8f	movq	%r15, %rdi
0000000000081f92	callq	*0x1e0(%rax)
0000000000081f98	jmp	0x81ffe
0000000000081f9a	leaq	0x250(%rbx), %r15
0000000000081fa1	movq	0x48518(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000081fa8	xorps	%xmm0, %xmm0
0000000000081fab	movq	%rdx, -0x30(%rbp)
0000000000081faf	movq	%r15, %rdi
0000000000081fb2	movl	$0x1, %edx
0000000000081fb7	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000081fbc	movzbl	%r14b, %r14d
0000000000081fc0	movq	%r12, %rdi
0000000000081fc3	movl	%r14d, %esi
0000000000081fc6	callq	__ZN9OZChannel11setIsSplineEb   ## OZChannel::setIsSpline(bool)
0000000000081fcb	movq	-0x30(%rbp), %rdi
0000000000081fcf	movl	%r14d, %esi
0000000000081fd2	callq	__ZN9OZChannel11setIsSplineEb   ## OZChannel::setIsSpline(bool)
0000000000081fd7	movq	%r13, %rdi
0000000000081fda	movl	%r14d, %esi
0000000000081fdd	callq	__ZN9OZChannel11setIsSplineEb   ## OZChannel::setIsSpline(bool)
0000000000081fe2	movsd	0x2d53e(%rip), %xmm0
0000000000081fea	movq	%r15, %rdi
0000000000081fed	movq	0x484cc(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000081ff4	movl	$0x1, %edx
0000000000081ff9	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000081ffe	movq	%rbx, %rdi
0000000000082001	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000082006	addq	$0x8, %rsp
000000000008200a	popq	%rbx
000000000008200b	popq	%r12
000000000008200d	popq	%r13
000000000008200f	popq	%r14
0000000000082011	popq	%r15
0000000000082013	popq	%rbp
0000000000082014	jmp	__ZN15OZChannelFolder11setFoldFlagEj ## OZChannelFolder::setFoldFlag(unsigned int)
0000000000082019	nop
