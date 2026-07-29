__ZN12HGColorGamma9SetScale2EDv4_f:
00000000000fbc60	pushq	%rbp
00000000000fbc61	movq	%rsp, %rbp
00000000000fbc64	pushq	%rbx
00000000000fbc65	subq	$0x18, %rsp
00000000000fbc69	movaps	%xmm0, -0x20(%rbp)
00000000000fbc6d	movq	%rdi, %rbx
00000000000fbc70	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fbc75	movb	$0x1, 0x2e9(%rbx)
00000000000fbc7c	movaps	-0x20(%rbp), %xmm0
00000000000fbc80	movaps	%xmm0, 0x440(%rbx)
00000000000fbc87	addq	$0x18, %rsp
00000000000fbc8b	popq	%rbx
00000000000fbc8c	popq	%rbp
00000000000fbc8d	retq
00000000000fbc8e	nop
