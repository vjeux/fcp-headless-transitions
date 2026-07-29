__ZN12HGColorGamma29SetGammaFunctionSRGBLinearizeEv:
00000000000fcc90	pushq	%rbp
00000000000fcc91	movq	%rsp, %rbp
00000000000fcc94	pushq	%rbx
00000000000fcc95	pushq	%rax
00000000000fcc96	movq	%rdi, %rbx
00000000000fcc99	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fcc9e	movb	$0x1, 0x2e9(%rbx)
00000000000fcca5	movq	$0x3, 0x404(%rbx)
00000000000fccb0	movaps	0x2d2d79(%rip), %xmm0
00000000000fccb7	movaps	%xmm0, 0x300(%rbx)
00000000000fccbe	movaps	0x2d2d7b(%rip), %xmm0
00000000000fccc5	movaps	%xmm0, 0x310(%rbx)
00000000000fcccc	movaps	0x2d2d7d(%rip), %xmm0
00000000000fccd3	movaps	%xmm0, 0x320(%rbx)
00000000000fccda	movaps	0x2d2d7f(%rip), %xmm0
00000000000fcce1	movaps	%xmm0, 0x330(%rbx)
00000000000fcce8	movaps	0x2d2d81(%rip), %xmm0
00000000000fccef	movaps	%xmm0, 0x340(%rbx)
00000000000fccf6	xorps	%xmm0, %xmm0
00000000000fccf9	movaps	%xmm0, 0x350(%rbx)
00000000000fcd00	movaps	%xmm0, 0x360(%rbx)
00000000000fcd07	movb	$0x1, 0x370(%rbx)
00000000000fcd0e	addq	$0x8, %rsp
00000000000fcd12	popq	%rbx
00000000000fcd13	popq	%rbp
00000000000fcd14	retq
00000000000fcd15	nopw	%cs:(%rax,%rax)
