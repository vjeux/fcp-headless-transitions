__ZN19OZChannelRotation3D13compoundResetEP9OZChannelb:
0000000000081df6	pushq	%rbp
0000000000081df7	movq	%rsp, %rbp
0000000000081dfa	pushq	%r15
0000000000081dfc	pushq	%r14
0000000000081dfe	pushq	%r13
0000000000081e00	pushq	%r12
0000000000081e02	pushq	%rbx
0000000000081e03	pushq	%rax
0000000000081e04	movl	%edx, %r15d
0000000000081e07	movq	%rsi, %r14
0000000000081e0a	movq	%rdi, %rbx
0000000000081e0d	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081e12	callq	__ZNK15OZChannelFolder12testFoldFlagEj ## OZChannelFolder::testFoldFlag(unsigned int) const
0000000000081e17	testl	%r15d, %r15d
0000000000081e1a	jne	0x81e3f
0000000000081e1c	testb	%al, %al
0000000000081e1e	jne	0x81e3f
0000000000081e20	movq	(%r14), %rax
0000000000081e23	movq	0x120(%rax), %rax
0000000000081e2a	movq	%r14, %rdi
0000000000081e2d	xorl	%esi, %esi
0000000000081e2f	addq	$0x8, %rsp
0000000000081e33	popq	%rbx
0000000000081e34	popq	%r12
0000000000081e36	popq	%r13
0000000000081e38	popq	%r14
0000000000081e3a	popq	%r15
0000000000081e3c	popq	%rbp
0000000000081e3d	jmpq	*%rax
0000000000081e3f	movq	%rbx, %rdi
0000000000081e42	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081e47	callq	__ZN15OZChannelFolder13resetFoldFlagEj ## OZChannelFolder::resetFoldFlag(unsigned int)
0000000000081e4c	leaq	0x88(%rbx), %r13
0000000000081e53	cmpq	%r14, %r13
0000000000081e56	setne	%al
0000000000081e59	leaq	0x120(%rbx), %r15
0000000000081e60	cmpq	%r14, %r15
0000000000081e63	setne	%cl
0000000000081e66	andb	%al, %cl
0000000000081e68	leaq	0x1b8(%rbx), %r12
0000000000081e6f	cmpq	%r14, %r12
0000000000081e72	setne	%al
0000000000081e75	andb	%cl, %al
0000000000081e77	cmpb	$0x1, %al
0000000000081e79	jne	0x81e8b
0000000000081e7b	movq	(%r14), %rax
0000000000081e7e	movq	%r14, %rdi
0000000000081e81	xorl	%esi, %esi
0000000000081e83	callq	*0x120(%rax)
0000000000081e89	jmp	0x81ee3
0000000000081e8b	leaq	0x250(%rbx), %r14
0000000000081e92	movq	0x48627(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000081e99	xorps	%xmm0, %xmm0
0000000000081e9c	movq	%r14, %rdi
0000000000081e9f	movl	$0x1, %edx
0000000000081ea4	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000081ea9	movq	%r13, %rdi
0000000000081eac	xorl	%esi, %esi
0000000000081eae	callq	__ZN13OZChannelBase5resetEb     ## OZChannelBase::reset(bool)
0000000000081eb3	movq	%r15, %rdi
0000000000081eb6	xorl	%esi, %esi
0000000000081eb8	callq	__ZN13OZChannelBase5resetEb     ## OZChannelBase::reset(bool)
0000000000081ebd	movq	%r12, %rdi
0000000000081ec0	xorl	%esi, %esi
0000000000081ec2	callq	__ZN13OZChannelBase5resetEb     ## OZChannelBase::reset(bool)
0000000000081ec7	movsd	0x2d659(%rip), %xmm0
0000000000081ecf	movq	%r14, %rdi
0000000000081ed2	movq	0x485e7(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000081ed9	movl	$0x1, %edx
0000000000081ede	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000081ee3	movq	%rbx, %rdi
0000000000081ee6	movl	$0x100000, %esi                 ## imm = 0x100000
0000000000081eeb	addq	$0x8, %rsp
0000000000081eef	popq	%rbx
0000000000081ef0	popq	%r12
0000000000081ef2	popq	%r13
0000000000081ef4	popq	%r14
0000000000081ef6	popq	%r15
0000000000081ef8	popq	%rbp
0000000000081ef9	jmp	__ZN15OZChannelFolder11setFoldFlagEj ## OZChannelFolder::setFoldFlag(unsigned int)
