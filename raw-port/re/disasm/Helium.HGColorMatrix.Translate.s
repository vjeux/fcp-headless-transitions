__ZN13HGColorMatrix9TranslateEfff:
00000000001b8830	pushq	%rbp
00000000001b8831	movq	%rsp, %rbp
00000000001b8834	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
00000000001b883a	insertps	$0x20, %xmm2, %xmm0             ## xmm0 = xmm0[0,1],xmm2[0],xmm0[3]
00000000001b8840	insertps	$0x30, 0x20f476(%rip), %xmm0    ## xmm0 = xmm0[0,1,2],mem[0]
00000000001b884a	movaps	0x1b0(%rdi), %xmm7
00000000001b8851	movaps	0x1c0(%rdi), %xmm6
00000000001b8858	movaps	0x1d0(%rdi), %xmm3
00000000001b885f	movaps	0x1e0(%rdi), %xmm1
00000000001b8866	movaps	%xmm7, %xmm5
00000000001b8869	shufps	$0x0, %xmm7, %xmm5              ## xmm5 = xmm5[0,0],xmm7[0,0]
00000000001b886d	movss	0x20f44b(%rip), %xmm2
00000000001b8875	mulps	%xmm2, %xmm5
00000000001b8878	movaps	%xmm7, %xmm8
00000000001b887c	shufps	$0x55, %xmm7, %xmm8             ## xmm8 = xmm8[1,1],xmm7[1,1]
00000000001b8881	movsd	0x20f427(%rip), %xmm4
00000000001b8889	mulps	%xmm4, %xmm8
00000000001b888d	addps	%xmm5, %xmm8
00000000001b8891	movaps	%xmm7, %xmm9
00000000001b8895	shufps	$0xaa, %xmm7, %xmm9             ## xmm9 = xmm9[2,2],xmm7[2,2]
00000000001b889a	movaps	0x2121cf(%rip), %xmm5
00000000001b88a1	mulps	%xmm5, %xmm9
00000000001b88a5	addps	%xmm8, %xmm9
00000000001b88a9	shufps	$0xff, %xmm7, %xmm7             ## xmm7 = xmm7[3,3,3,3]
00000000001b88ad	mulps	%xmm0, %xmm7
00000000001b88b0	addps	%xmm9, %xmm7
00000000001b88b4	movaps	%xmm7, 0x1b0(%rdi)
00000000001b88bb	movaps	%xmm6, %xmm7
00000000001b88be	shufps	$0x0, %xmm6, %xmm7              ## xmm7 = xmm7[0,0],xmm6[0,0]
00000000001b88c2	mulps	%xmm2, %xmm7
00000000001b88c5	movaps	%xmm6, %xmm8
00000000001b88c9	shufps	$0x55, %xmm6, %xmm8             ## xmm8 = xmm8[1,1],xmm6[1,1]
00000000001b88ce	mulps	%xmm4, %xmm8
00000000001b88d2	addps	%xmm7, %xmm8
00000000001b88d6	movaps	%xmm6, %xmm7
00000000001b88d9	shufps	$0xaa, %xmm6, %xmm7             ## xmm7 = xmm7[2,2],xmm6[2,2]
00000000001b88dd	mulps	%xmm5, %xmm7
00000000001b88e0	addps	%xmm8, %xmm7
00000000001b88e4	shufps	$0xff, %xmm6, %xmm6             ## xmm6 = xmm6[3,3,3,3]
00000000001b88e8	mulps	%xmm0, %xmm6
00000000001b88eb	addps	%xmm7, %xmm6
00000000001b88ee	movaps	%xmm6, 0x1c0(%rdi)
00000000001b88f5	movaps	%xmm3, %xmm6
00000000001b88f8	shufps	$0x0, %xmm3, %xmm6              ## xmm6 = xmm6[0,0],xmm3[0,0]
00000000001b88fc	mulps	%xmm2, %xmm6
00000000001b88ff	movaps	%xmm3, %xmm7
00000000001b8902	shufps	$0x55, %xmm3, %xmm7             ## xmm7 = xmm7[1,1],xmm3[1,1]
00000000001b8906	mulps	%xmm4, %xmm7
00000000001b8909	addps	%xmm6, %xmm7
00000000001b890c	movaps	%xmm3, %xmm6
00000000001b890f	shufps	$0xaa, %xmm3, %xmm6             ## xmm6 = xmm6[2,2],xmm3[2,2]
00000000001b8913	mulps	%xmm5, %xmm6
00000000001b8916	addps	%xmm7, %xmm6
00000000001b8919	shufps	$0xff, %xmm3, %xmm3             ## xmm3 = xmm3[3,3,3,3]
00000000001b891d	mulps	%xmm0, %xmm3
00000000001b8920	addps	%xmm6, %xmm3
00000000001b8923	movaps	%xmm3, 0x1d0(%rdi)
00000000001b892a	movaps	%xmm1, %xmm3
00000000001b892d	shufps	$0x0, %xmm1, %xmm3              ## xmm3 = xmm3[0,0],xmm1[0,0]
00000000001b8931	mulps	%xmm2, %xmm3
00000000001b8934	movaps	%xmm1, %xmm2
00000000001b8937	shufps	$0x55, %xmm1, %xmm2             ## xmm2 = xmm2[1,1],xmm1[1,1]
00000000001b893b	mulps	%xmm4, %xmm2
00000000001b893e	addps	%xmm3, %xmm2
00000000001b8941	movaps	%xmm1, %xmm3
00000000001b8944	shufps	$0xaa, %xmm1, %xmm3             ## xmm3 = xmm3[2,2],xmm1[2,2]
00000000001b8948	mulps	%xmm5, %xmm3
00000000001b894b	addps	%xmm2, %xmm3
00000000001b894e	shufps	$0xff, %xmm1, %xmm1             ## xmm1 = xmm1[3,3,3,3]
00000000001b8952	mulps	%xmm0, %xmm1
00000000001b8955	addps	%xmm3, %xmm1
00000000001b8958	movaps	%xmm1, 0x1e0(%rdi)
00000000001b895f	popq	%rbp
00000000001b8960	retq
00000000001b8961	nopw	%cs:(%rax,%rax)
