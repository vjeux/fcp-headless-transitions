__ZN12HGColorGamma15Set1DLUTnumBinsEj:
00000000000fb730	pushq	%rbp
00000000000fb731	movq	%rsp, %rbp
00000000000fb734	pushq	%r14
00000000000fb736	pushq	%rbx
00000000000fb737	movl	%esi, %ebx
00000000000fb739	movq	%rdi, %r14
00000000000fb73c	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb741	movb	$0x1, 0x2e9(%r14)
00000000000fb749	movl	%ebx, 0x480(%r14)
00000000000fb750	popq	%rbx
00000000000fb751	popq	%r14
00000000000fb753	popq	%rbp
00000000000fb754	retq
00000000000fb755	nopw	%cs:(%rax,%rax)
