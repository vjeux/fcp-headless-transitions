__Z12OZBezierEvalPKdd:
00000000000a549c	pushq	%rbp
00000000000a549d	movq	%rsp, %rbp
00000000000a54a0	movupd	(%rdi), %xmm1
00000000000a54a4	movupd	0x10(%rdi), %xmm2
00000000000a54a9	movapd	0xb6bf(%rip), %xmm3
00000000000a54b1	mulpd	%xmm1, %xmm3
00000000000a54b5	movapd	%xmm3, %xmm4
00000000000a54b9	unpckhpd	%xmm3, %xmm4                    ## xmm4 = xmm4[1],xmm3[1]
00000000000a54bd	movapd	%xmm4, %xmm5
00000000000a54c1	subsd	%xmm1, %xmm5
00000000000a54c5	movapd	%xmm1, %xmm6
00000000000a54c9	shufpd	$0x1, %xmm2, %xmm6              ## xmm6 = xmm6[1],xmm2[0]
00000000000a54ce	mulpd	0xc66a(%rip), %xmm6
00000000000a54d6	subsd	%xmm3, %xmm4
00000000000a54da	unpcklpd	%xmm5, %xmm3                    ## xmm3 = xmm3[0],xmm5[0]
00000000000a54de	subpd	%xmm6, %xmm3
00000000000a54e2	unpckhpd	%xmm2, %xmm6                    ## xmm6 = xmm6[1],xmm2[1]
00000000000a54e6	addpd	%xmm3, %xmm6
00000000000a54ea	movapd	%xmm6, %xmm2
00000000000a54ee	unpckhpd	%xmm6, %xmm2                    ## xmm2 = xmm2[1],xmm6[1]
00000000000a54f2	mulsd	%xmm0, %xmm2
00000000000a54f6	addsd	%xmm6, %xmm2
00000000000a54fa	mulsd	%xmm0, %xmm2
00000000000a54fe	addsd	%xmm4, %xmm2
00000000000a5502	mulsd	%xmm2, %xmm0
00000000000a5506	addsd	%xmm1, %xmm0
00000000000a550a	popq	%rbp
00000000000a550b	retq
