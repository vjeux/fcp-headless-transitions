__ZN12HGColorGamma8SetBias1EDv4_f:
00000000000fbc90	pushq	%rbp
00000000000fbc91	movq	%rsp, %rbp
00000000000fbc94	pushq	%rbx
00000000000fbc95	subq	$0x18, %rsp
00000000000fbc99	movaps	%xmm0, -0x20(%rbp)
00000000000fbc9d	movq	%rdi, %rbx
00000000000fbca0	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fbca5	movb	$0x1, 0x2e9(%rbx)
00000000000fbcac	movaps	-0x20(%rbp), %xmm0
00000000000fbcb0	movaps	%xmm0, 0x450(%rbx)
00000000000fbcb7	addq	$0x18, %rsp
00000000000fbcbb	popq	%rbx
00000000000fbcbc	popq	%rbp
00000000000fbcbd	retq
00000000000fbcbe	nop
