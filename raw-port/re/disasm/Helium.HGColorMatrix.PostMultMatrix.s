__ZN13HGColorMatrix14PostMultMatrixEPK5HGVecb:
00000000001b8340	pushq	%rbp
00000000001b8341	movq	%rsp, %rbp
00000000001b8344	movaps	(%rsi), %xmm0
00000000001b8347	movaps	0x10(%rsi), %xmm2
00000000001b834b	testl	%edx, %edx
00000000001b834d	je	0x1b837d
00000000001b834f	movaps	%xmm0, %xmm4
00000000001b8352	unpcklps	%xmm2, %xmm4                    ## xmm4 = xmm4[0],xmm2[0],xmm4[1],xmm2[1]
00000000001b8355	movaps	0x20(%rsi), %xmm1
00000000001b8359	movaps	0x30(%rsi), %xmm3
00000000001b835d	unpckhps	%xmm2, %xmm0                    ## xmm0 = xmm0[2],xmm2[2],xmm0[3],xmm2[3]
00000000001b8360	movaps	%xmm1, %xmm2
00000000001b8363	unpcklps	%xmm3, %xmm2                    ## xmm2 = xmm2[0],xmm3[0],xmm2[1],xmm3[1]
00000000001b8366	unpckhps	%xmm3, %xmm1                    ## xmm1 = xmm1[2],xmm3[2],xmm1[3],xmm3[3]
00000000001b8369	movaps	%xmm0, %xmm3
00000000001b836c	movlhps	%xmm1, %xmm3                    ## xmm3 = xmm3[0],xmm1[0]
00000000001b836f	movhlps	%xmm0, %xmm1                    ## xmm1 = xmm0[1],xmm1[1]
00000000001b8372	movaps	%xmm4, %xmm0
00000000001b8375	movlhps	%xmm2, %xmm0                    ## xmm0 = xmm0[0],xmm2[0]
00000000001b8378	movhlps	%xmm4, %xmm2                    ## xmm2 = xmm4[1],xmm2[1]
00000000001b837b	jmp	0x1b8385
00000000001b837d	movaps	0x20(%rsi), %xmm3
00000000001b8381	movaps	0x30(%rsi), %xmm1
00000000001b8385	movaps	%xmm0, %xmm8
00000000001b8389	shufps	$0x0, %xmm0, %xmm8              ## xmm8 = xmm8[0,0],xmm0[0,0]
00000000001b838e	movaps	0x1b0(%rdi), %xmm7
00000000001b8395	movaps	0x1c0(%rdi), %xmm6
00000000001b839c	movaps	0x1d0(%rdi), %xmm5
00000000001b83a3	movaps	0x1e0(%rdi), %xmm4
00000000001b83aa	mulps	%xmm7, %xmm8
00000000001b83ae	movaps	%xmm0, %xmm9
00000000001b83b2	shufps	$0x55, %xmm0, %xmm9             ## xmm9 = xmm9[1,1],xmm0[1,1]
00000000001b83b7	mulps	%xmm6, %xmm9
00000000001b83bb	addps	%xmm8, %xmm9
00000000001b83bf	movaps	%xmm0, %xmm8
00000000001b83c3	shufps	$0xaa, %xmm0, %xmm8             ## xmm8 = xmm8[2,2],xmm0[2,2]
00000000001b83c8	mulps	%xmm5, %xmm8
00000000001b83cc	addps	%xmm9, %xmm8
00000000001b83d0	shufps	$0xff, %xmm0, %xmm0             ## xmm0 = xmm0[3,3,3,3]
00000000001b83d4	mulps	%xmm4, %xmm0
00000000001b83d7	addps	%xmm8, %xmm0
00000000001b83db	movaps	%xmm2, %xmm8
00000000001b83df	shufps	$0x0, %xmm2, %xmm8              ## xmm8 = xmm8[0,0],xmm2[0,0]
00000000001b83e4	mulps	%xmm7, %xmm8
00000000001b83e8	movaps	%xmm2, %xmm9
00000000001b83ec	shufps	$0x55, %xmm2, %xmm9             ## xmm9 = xmm9[1,1],xmm2[1,1]
00000000001b83f1	mulps	%xmm6, %xmm9
00000000001b83f5	addps	%xmm8, %xmm9
00000000001b83f9	movaps	%xmm2, %xmm8
00000000001b83fd	shufps	$0xaa, %xmm2, %xmm8             ## xmm8 = xmm8[2,2],xmm2[2,2]
00000000001b8402	mulps	%xmm5, %xmm8
00000000001b8406	addps	%xmm9, %xmm8
00000000001b840a	shufps	$0xff, %xmm2, %xmm2             ## xmm2 = xmm2[3,3,3,3]
00000000001b840e	mulps	%xmm4, %xmm2
00000000001b8411	addps	%xmm8, %xmm2
00000000001b8415	movaps	%xmm3, %xmm8
00000000001b8419	shufps	$0x0, %xmm3, %xmm8              ## xmm8 = xmm8[0,0],xmm3[0,0]
00000000001b841e	mulps	%xmm7, %xmm8
00000000001b8422	movaps	%xmm3, %xmm9
00000000001b8426	shufps	$0x55, %xmm3, %xmm9             ## xmm9 = xmm9[1,1],xmm3[1,1]
00000000001b842b	mulps	%xmm6, %xmm9
00000000001b842f	addps	%xmm8, %xmm9
00000000001b8433	movaps	%xmm3, %xmm8
00000000001b8437	shufps	$0xaa, %xmm3, %xmm8             ## xmm8 = xmm8[2,2],xmm3[2,2]
00000000001b843c	mulps	%xmm5, %xmm8
00000000001b8440	addps	%xmm9, %xmm8
00000000001b8444	shufps	$0xff, %xmm3, %xmm3             ## xmm3 = xmm3[3,3,3,3]
00000000001b8448	mulps	%xmm4, %xmm3
00000000001b844b	addps	%xmm8, %xmm3
00000000001b844f	movaps	%xmm1, %xmm8
00000000001b8453	shufps	$0x0, %xmm1, %xmm8              ## xmm8 = xmm8[0,0],xmm1[0,0]
00000000001b8458	mulps	%xmm7, %xmm8
00000000001b845c	movaps	%xmm1, %xmm7
00000000001b845f	shufps	$0x55, %xmm1, %xmm7             ## xmm7 = xmm7[1,1],xmm1[1,1]
00000000001b8463	mulps	%xmm6, %xmm7
00000000001b8466	addps	%xmm8, %xmm7
00000000001b846a	movaps	%xmm1, %xmm6
00000000001b846d	shufps	$0xaa, %xmm1, %xmm6             ## xmm6 = xmm6[2,2],xmm1[2,2]
00000000001b8471	mulps	%xmm5, %xmm6
00000000001b8474	addps	%xmm7, %xmm6
00000000001b8477	shufps	$0xff, %xmm1, %xmm1             ## xmm1 = xmm1[3,3,3,3]
00000000001b847b	mulps	%xmm4, %xmm1
00000000001b847e	addps	%xmm6, %xmm1
00000000001b8481	movaps	%xmm0, 0x1b0(%rdi)
00000000001b8488	movaps	%xmm2, 0x1c0(%rdi)
00000000001b848f	movaps	%xmm3, 0x1d0(%rdi)
00000000001b8496	movaps	%xmm1, 0x1e0(%rdi)
00000000001b849d	popq	%rbp
00000000001b849e	retq
00000000001b849f	nop
