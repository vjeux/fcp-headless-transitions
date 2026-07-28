__ZN32HGCColorGamma_chroma_upsample_f16GetROIEP10HGRendereri6HGRect:
00000000000fd700	pushq	%rbp
00000000000fd701	movq	%rsp, %rbp
00000000000fd704	testl	%edx, %edx
00000000000fd706	je	0xfd721
00000000000fd708	leaq	_HGRectNull(%rip), %rax
00000000000fd70f	movdqu	(%rax), %xmm0
00000000000fd713	movq	%xmm0, %rax
00000000000fd718	pextrq	$0x1, %xmm0, %rdx
00000000000fd71f	popq	%rbp
00000000000fd720	retq
00000000000fd721	movq	%r8, %xmm0
00000000000fd726	movq	%rcx, %xmm1
00000000000fd72b	punpcklqdq	%xmm0, %xmm1            ## xmm1 = xmm1[0],xmm0[0]
00000000000fd72f	movdqa	0x2d2399(%rip), %xmm0
00000000000fd737	paddq	%xmm1, %xmm0
00000000000fd73b	pblendw	$0xcc, %xmm1, %xmm0             ## xmm0 = xmm0[0,1],xmm1[2,3],xmm0[4,5],xmm1[6,7]
00000000000fd741	movq	%xmm0, %rax
00000000000fd746	pextrq	$0x1, %xmm0, %rdx
00000000000fd74d	popq	%rbp
00000000000fd74e	retq
00000000000fd74f	nop
