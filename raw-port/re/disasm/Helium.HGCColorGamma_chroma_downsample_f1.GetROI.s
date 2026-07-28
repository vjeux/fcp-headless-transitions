__ZN34HGCColorGamma_chroma_downsample_f16GetROIEP10HGRendereri6HGRect:
00000000000fd5e0	pushq	%rbp
00000000000fd5e1	movq	%rsp, %rbp
00000000000fd5e4	testl	%edx, %edx
00000000000fd5e6	je	0xfd601
00000000000fd5e8	leaq	_HGRectNull(%rip), %rax
00000000000fd5ef	movdqu	(%rax), %xmm0
00000000000fd5f3	movq	%xmm0, %rax
00000000000fd5f8	pextrq	$0x1, %xmm0, %rdx
00000000000fd5ff	popq	%rbp
00000000000fd600	retq
00000000000fd601	movq	%r8, %xmm0
00000000000fd606	movq	%rcx, %xmm1
00000000000fd60b	punpcklqdq	%xmm0, %xmm1            ## xmm1 = xmm1[0],xmm0[0]
00000000000fd60f	movdqa	0x2d24b9(%rip), %xmm0
00000000000fd617	paddq	%xmm1, %xmm0
00000000000fd61b	pblendw	$0xcc, %xmm1, %xmm0             ## xmm0 = xmm0[0,1],xmm1[2,3],xmm0[4,5],xmm1[6,7]
00000000000fd621	movq	%xmm0, %rax
00000000000fd626	pextrq	$0x1, %xmm0, %rdx
00000000000fd62d	popq	%rbp
00000000000fd62e	retq
00000000000fd62f	nop
