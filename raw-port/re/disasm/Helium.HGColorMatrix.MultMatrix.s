__ZN13HGColorMatrix10MultMatrixEPK5HGVecb:
00000000001b84a0	pushq	%rbp
00000000001b84a1	movq	%rsp, %rbp
00000000001b84a4	movaps	(%rsi), %xmm1
00000000001b84a7	movaps	0x10(%rsi), %xmm3
00000000001b84ab	testl	%edx, %edx
00000000001b84ad	je	0x1b84dd
00000000001b84af	movaps	%xmm1, %xmm4
00000000001b84b2	unpcklps	%xmm3, %xmm4                    ## xmm4 = xmm4[0],xmm3[0],xmm4[1],xmm3[1]
00000000001b84b5	movaps	0x20(%rsi), %xmm0
00000000001b84b9	movaps	0x30(%rsi), %xmm2
00000000001b84bd	unpckhps	%xmm3, %xmm1                    ## xmm1 = xmm1[2],xmm3[2],xmm1[3],xmm3[3]
00000000001b84c0	movaps	%xmm0, %xmm3
00000000001b84c3	unpcklps	%xmm2, %xmm3                    ## xmm3 = xmm3[0],xmm2[0],xmm3[1],xmm2[1]
00000000001b84c6	unpckhps	%xmm2, %xmm0                    ## xmm0 = xmm0[2],xmm2[2],xmm0[3],xmm2[3]
00000000001b84c9	movaps	%xmm1, %xmm2
00000000001b84cc	movlhps	%xmm0, %xmm2                    ## xmm2 = xmm2[0],xmm0[0]
00000000001b84cf	movhlps	%xmm1, %xmm0                    ## xmm0 = xmm1[1],xmm0[1]
00000000001b84d2	movaps	%xmm4, %xmm1
00000000001b84d5	movlhps	%xmm3, %xmm1                    ## xmm1 = xmm1[0],xmm3[0]
00000000001b84d8	movhlps	%xmm4, %xmm3                    ## xmm3 = xmm4[1],xmm3[1]
00000000001b84db	jmp	0x1b84e5
00000000001b84dd	movaps	0x20(%rsi), %xmm2
00000000001b84e1	movaps	0x30(%rsi), %xmm0
00000000001b84e5	movaps	0x1b0(%rdi), %xmm7
00000000001b84ec	movaps	0x1c0(%rdi), %xmm6
00000000001b84f3	movaps	0x1d0(%rdi), %xmm5
00000000001b84fa	movaps	0x1e0(%rdi), %xmm4
00000000001b8501	movaps	%xmm7, %xmm8
00000000001b8505	shufps	$0x0, %xmm7, %xmm8              ## xmm8 = xmm8[0,0],xmm7[0,0]
00000000001b850a	mulps	%xmm1, %xmm8
00000000001b850e	movaps	%xmm7, %xmm9
00000000001b8512	shufps	$0x55, %xmm7, %xmm9             ## xmm9 = xmm9[1,1],xmm7[1,1]
00000000001b8517	mulps	%xmm3, %xmm9
00000000001b851b	addps	%xmm8, %xmm9
00000000001b851f	movaps	%xmm7, %xmm8
00000000001b8523	shufps	$0xaa, %xmm7, %xmm8             ## xmm8 = xmm8[2,2],xmm7[2,2]
00000000001b8528	mulps	%xmm2, %xmm8
00000000001b852c	addps	%xmm9, %xmm8
00000000001b8530	shufps	$0xff, %xmm7, %xmm7             ## xmm7 = xmm7[3,3,3,3]
00000000001b8534	mulps	%xmm0, %xmm7
00000000001b8537	addps	%xmm8, %xmm7
00000000001b853b	movaps	%xmm7, 0x1b0(%rdi)
00000000001b8542	movaps	%xmm6, %xmm7
00000000001b8545	shufps	$0x0, %xmm6, %xmm7              ## xmm7 = xmm7[0,0],xmm6[0,0]
00000000001b8549	mulps	%xmm1, %xmm7
00000000001b854c	movaps	%xmm6, %xmm8
00000000001b8550	shufps	$0x55, %xmm6, %xmm8             ## xmm8 = xmm8[1,1],xmm6[1,1]
00000000001b8555	mulps	%xmm3, %xmm8
00000000001b8559	addps	%xmm7, %xmm8
00000000001b855d	movaps	%xmm6, %xmm7
00000000001b8560	shufps	$0xaa, %xmm6, %xmm7             ## xmm7 = xmm7[2,2],xmm6[2,2]
00000000001b8564	mulps	%xmm2, %xmm7
00000000001b8567	addps	%xmm8, %xmm7
00000000001b856b	shufps	$0xff, %xmm6, %xmm6             ## xmm6 = xmm6[3,3,3,3]
00000000001b856f	mulps	%xmm0, %xmm6
00000000001b8572	addps	%xmm7, %xmm6
00000000001b8575	movaps	%xmm6, 0x1c0(%rdi)
00000000001b857c	movaps	%xmm5, %xmm6
00000000001b857f	shufps	$0x0, %xmm5, %xmm6              ## xmm6 = xmm6[0,0],xmm5[0,0]
00000000001b8583	mulps	%xmm1, %xmm6
00000000001b8586	movaps	%xmm5, %xmm7
00000000001b8589	shufps	$0x55, %xmm5, %xmm7             ## xmm7 = xmm7[1,1],xmm5[1,1]
00000000001b858d	mulps	%xmm3, %xmm7
00000000001b8590	addps	%xmm6, %xmm7
00000000001b8593	movaps	%xmm5, %xmm6
00000000001b8596	shufps	$0xaa, %xmm5, %xmm6             ## xmm6 = xmm6[2,2],xmm5[2,2]
00000000001b859a	mulps	%xmm2, %xmm6
00000000001b859d	addps	%xmm7, %xmm6
00000000001b85a0	shufps	$0xff, %xmm5, %xmm5             ## xmm5 = xmm5[3,3,3,3]
00000000001b85a4	mulps	%xmm0, %xmm5
00000000001b85a7	addps	%xmm6, %xmm5
00000000001b85aa	movaps	%xmm5, 0x1d0(%rdi)
00000000001b85b1	movaps	%xmm4, %xmm5
00000000001b85b4	shufps	$0x0, %xmm4, %xmm5              ## xmm5 = xmm5[0,0],xmm4[0,0]
00000000001b85b8	mulps	%xmm1, %xmm5
00000000001b85bb	movaps	%xmm4, %xmm1
00000000001b85be	shufps	$0x55, %xmm4, %xmm1             ## xmm1 = xmm1[1,1],xmm4[1,1]
00000000001b85c2	mulps	%xmm3, %xmm1
00000000001b85c5	addps	%xmm5, %xmm1
00000000001b85c8	movaps	%xmm4, %xmm3
00000000001b85cb	shufps	$0xaa, %xmm4, %xmm3             ## xmm3 = xmm3[2,2],xmm4[2,2]
00000000001b85cf	mulps	%xmm2, %xmm3
00000000001b85d2	addps	%xmm1, %xmm3
00000000001b85d5	shufps	$0xff, %xmm4, %xmm4             ## xmm4 = xmm4[3,3,3,3]
00000000001b85d9	mulps	%xmm0, %xmm4
00000000001b85dc	addps	%xmm3, %xmm4
00000000001b85df	movaps	%xmm4, 0x1e0(%rdi)
00000000001b85e6	popq	%rbp
00000000001b85e7	retq
00000000001b85e8	nopl	(%rax,%rax)
