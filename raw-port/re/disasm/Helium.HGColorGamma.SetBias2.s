__ZN12HGColorGamma8SetBias2EDv4_f:
00000000000fbcc0	pushq	%rbp
00000000000fbcc1	movq	%rsp, %rbp
00000000000fbcc4	pushq	%rbx
00000000000fbcc5	subq	$0x18, %rsp
00000000000fbcc9	movaps	%xmm0, -0x20(%rbp)
00000000000fbccd	movq	%rdi, %rbx
00000000000fbcd0	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fbcd5	movb	$0x1, 0x2e9(%rbx)
00000000000fbcdc	movaps	-0x20(%rbp), %xmm0
00000000000fbce0	movaps	%xmm0, 0x460(%rbx)
00000000000fbce7	addq	$0x18, %rsp
00000000000fbceb	popq	%rbx
00000000000fbcec	popq	%rbp
00000000000fbced	retq
00000000000fbcee	nop
