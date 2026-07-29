__ZN12HGColorGamma25SetGammaFunctionSRGBGammaEv:
00000000000fcd20	pushq	%rbp
00000000000fcd21	movq	%rsp, %rbp
00000000000fcd24	pushq	%rbx
00000000000fcd25	pushq	%rax
00000000000fcd26	movq	%rdi, %rbx
00000000000fcd29	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fcd2e	movb	$0x1, 0x2e9(%rbx)
00000000000fcd35	movq	$0x4, 0x404(%rbx)
00000000000fcd40	movaps	0x2d2d39(%rip), %xmm0
00000000000fcd47	movaps	%xmm0, 0x300(%rbx)
00000000000fcd4e	movaps	0x2d2d3b(%rip), %xmm0
00000000000fcd55	movaps	%xmm0, 0x310(%rbx)
00000000000fcd5c	xorps	%xmm0, %xmm0
00000000000fcd5f	movaps	%xmm0, 0x320(%rbx)
00000000000fcd66	movaps	0x2d2d33(%rip), %xmm1
00000000000fcd6d	movaps	%xmm1, 0x330(%rbx)
00000000000fcd74	movaps	0x2d2d35(%rip), %xmm1
00000000000fcd7b	movaps	%xmm1, 0x340(%rbx)
00000000000fcd82	movaps	0x2d2d37(%rip), %xmm1
00000000000fcd89	movaps	%xmm1, 0x350(%rbx)
00000000000fcd90	movaps	%xmm0, 0x360(%rbx)
00000000000fcd97	movb	$0x1, 0x370(%rbx)
00000000000fcd9e	addq	$0x8, %rsp
00000000000fcda2	popq	%rbx
00000000000fcda3	popq	%rbp
00000000000fcda4	retq
00000000000fcda5	nopw	%cs:(%rax,%rax)
