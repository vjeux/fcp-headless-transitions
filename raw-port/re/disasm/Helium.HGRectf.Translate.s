__ZN7HGRectf9TranslateEff:
0000000000107840	pushq	%rbp
0000000000107841	movq	%rsp, %rbp
0000000000107844	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
000000000010784a	movsd	(%rdi), %xmm1
000000000010784e	movsd	0x8(%rdi), %xmm2
0000000000107853	addps	%xmm0, %xmm1
0000000000107856	addps	%xmm0, %xmm2
0000000000107859	movaps	%xmm2, %xmm3
000000000010785c	minps	%xmm1, %xmm3
000000000010785f	movaps	%xmm2, %xmm4
0000000000107862	maxps	%xmm1, %xmm4
0000000000107865	cmpunordps	%xmm1, %xmm1
0000000000107869	movaps	%xmm1, %xmm0
000000000010786c	blendvps	%xmm0, %xmm2, %xmm3
0000000000107871	blendvps	%xmm0, %xmm2, %xmm4
0000000000107876	movlhps	%xmm4, %xmm3                    ## xmm3 = xmm3[0],xmm4[0]
0000000000107879	movups	%xmm3, (%rdi)
000000000010787c	popq	%rbp
000000000010787d	retq
000000000010787e	nop
