__ZN12HGColorGamma26SetFixedPointPrecisionModeEb:
00000000000fbbf0	pushq	%rbp
00000000000fbbf1	movq	%rsp, %rbp
00000000000fbbf4	pushq	%r14
00000000000fbbf6	pushq	%rbx
00000000000fbbf7	movl	%esi, %ebx
00000000000fbbf9	movq	%rdi, %r14
00000000000fbbfc	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fbc01	movb	$0x1, 0x2e9(%r14)
00000000000fbc09	movb	%bl, 0x402(%r14)
00000000000fbc10	popq	%rbx
00000000000fbc11	popq	%r14
00000000000fbc13	popq	%rbp
00000000000fbc14	retq
00000000000fbc15	nopw	%cs:(%rax,%rax)
