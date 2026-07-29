__ZN11HGTransform9Adjoint2DEv:
00000000001b6230	pushq	%rbp
00000000001b6231	movq	%rsp, %rbp
00000000001b6234	movsd	0x38(%rdi), %xmm0
00000000001b6239	movsd	0x88(%rdi), %xmm1
00000000001b6241	movsd	0x48(%rdi), %xmm10
00000000001b6247	movapd	%xmm10, %xmm9
00000000001b624c	unpcklpd	%xmm1, %xmm9                    ## xmm9 = xmm9[0],xmm1[0]
00000000001b6251	movupd	0x10(%rdi), %xmm2
00000000001b6256	movupd	0x28(%rdi), %xmm5
00000000001b625b	movsd	0x30(%rdi), %xmm3
00000000001b6260	movddup	%xmm10, %xmm6                   ## xmm6 = xmm10[0,0]
00000000001b6265	movapd	%xmm0, %xmm7
00000000001b6269	unpcklpd	%xmm1, %xmm7                    ## xmm7 = xmm7[0],xmm1[0]
00000000001b626d	mulpd	%xmm5, %xmm7
00000000001b6271	movapd	%xmm3, %xmm4
00000000001b6275	mulsd	%xmm5, %xmm4
00000000001b6279	movapd	%xmm1, %xmm11
00000000001b627e	unpcklpd	%xmm5, %xmm11                   ## xmm11 = xmm11[0],xmm5[0]
00000000001b6283	movupd	0x70(%rdi), %xmm8
00000000001b6289	mulsd	%xmm2, %xmm1
00000000001b628d	mulsd	%xmm2, %xmm10
00000000001b6292	subsd	%xmm10, %xmm4
00000000001b6297	movapd	%xmm0, %xmm12
00000000001b629c	movhpd	0x10(%rdi), %xmm12              ## xmm12 = xmm12[0],mem[0]
00000000001b62a2	mulpd	%xmm8, %xmm12
00000000001b62a7	movapd	%xmm8, %xmm10
00000000001b62ac	blendpd	$0x1, %xmm0, %xmm10             ## xmm10 = xmm0[0],xmm10[1]
00000000001b62b3	mulsd	%xmm2, %xmm0
00000000001b62b7	mulpd	%xmm11, %xmm10
00000000001b62bc	movapd	%xmm8, %xmm11
00000000001b62c1	unpckhpd	%xmm2, %xmm11                   ## xmm11 = xmm11[1],xmm2[1]
00000000001b62c6	mulpd	%xmm9, %xmm11
00000000001b62cb	subpd	%xmm11, %xmm10
00000000001b62d0	movapd	%xmm8, %xmm9
00000000001b62d5	shufpd	$0x1, %xmm8, %xmm9              ## xmm9 = xmm9[1],xmm8[0]
00000000001b62db	movapd	%xmm5, %xmm11
00000000001b62e0	unpckhpd	%xmm2, %xmm11                   ## xmm11 = xmm11[1],xmm2[1]
00000000001b62e5	mulpd	%xmm9, %xmm11
00000000001b62ea	subpd	%xmm12, %xmm11
00000000001b62ef	shufpd	$0x1, %xmm8, %xmm2              ## xmm2 = xmm2[1],xmm8[0]
00000000001b62f5	mulpd	%xmm6, %xmm2
00000000001b62f9	subpd	%xmm7, %xmm2
00000000001b62fd	mulsd	%xmm5, %xmm8
00000000001b6302	subsd	%xmm8, %xmm1
00000000001b6307	mulsd	0x18(%rdi), %xmm3
00000000001b630c	subsd	%xmm3, %xmm0
00000000001b6310	movupd	%xmm10, 0x10(%rdi)
00000000001b6316	movupd	%xmm2, 0x28(%rdi)
00000000001b631b	movsd	%xmm1, 0x38(%rdi)
00000000001b6320	movsd	%xmm4, 0x48(%rdi)
00000000001b6325	movupd	%xmm11, 0x70(%rdi)
00000000001b632b	movsd	%xmm0, 0x88(%rdi)
00000000001b6333	movq	$0x0, 0x80(%rdi)
00000000001b633e	movq	$0x0, 0x40(%rdi)
00000000001b6346	movq	$0x0, 0x20(%rdi)
00000000001b634e	xorpd	%xmm0, %xmm0
00000000001b6352	movupd	%xmm0, 0x50(%rdi)
00000000001b6357	movsd	0x213f01(%rip), %xmm0
00000000001b635f	movups	%xmm0, 0x60(%rdi)
00000000001b6363	popq	%rbp
00000000001b6364	retq
00000000001b6365	nopw	%cs:(%rax,%rax)
