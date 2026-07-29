__ZN12HGColorGamma9SetScale1EDv4_f:
00000000000fbc30	pushq	%rbp
00000000000fbc31	movq	%rsp, %rbp
00000000000fbc34	pushq	%rbx
00000000000fbc35	subq	$0x18, %rsp
00000000000fbc39	movaps	%xmm0, -0x20(%rbp)
00000000000fbc3d	movq	%rdi, %rbx
00000000000fbc40	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fbc45	movb	$0x1, 0x2e9(%rbx)
00000000000fbc4c	movaps	-0x20(%rbp), %xmm0
00000000000fbc50	movaps	%xmm0, 0x430(%rbx)
00000000000fbc57	addq	$0x18, %rsp
00000000000fbc5b	popq	%rbx
00000000000fbc5c	popq	%rbp
00000000000fbc5d	retq
00000000000fbc5e	nop
