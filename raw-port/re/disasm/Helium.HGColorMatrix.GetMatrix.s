__ZNK13HGColorMatrix9GetMatrixEPDv4_fbb:
00000000001b8970	pushq	%rbp
00000000001b8971	movq	%rsp, %rbp
00000000001b8974	movaps	0x1b0(%rdi), %xmm0
00000000001b897b	testl	%ecx, %ecx
00000000001b897d	je	0x1b8ad4
00000000001b8983	movaps	%xmm0, %xmm6
00000000001b8986	shufps	$0xff, %xmm0, %xmm6             ## xmm6 = xmm6[3,3],xmm0[3,3]
00000000001b898a	movaps	0x2122af(%rip), %xmm1
00000000001b8991	mulps	%xmm1, %xmm6
00000000001b8994	movaps	0x1c0(%rdi), %xmm3
00000000001b899b	movaps	0x1d0(%rdi), %xmm8
00000000001b89a3	movaps	0x1e0(%rdi), %xmm12
00000000001b89ab	movaps	%xmm3, %xmm9
00000000001b89af	shufps	$0xff, %xmm3, %xmm9             ## xmm9 = xmm9[3,3],xmm3[3,3]
00000000001b89b4	mulps	%xmm1, %xmm9
00000000001b89b8	movaps	%xmm8, %xmm10
00000000001b89bc	shufps	$0xff, %xmm8, %xmm10            ## xmm10 = xmm10[3,3],xmm8[3,3]
00000000001b89c1	mulps	%xmm1, %xmm10
00000000001b89c5	movaps	%xmm12, %xmm7
00000000001b89c9	shufps	$0xff, %xmm12, %xmm7            ## xmm7 = xmm7[3,3],xmm12[3,3]
00000000001b89ce	mulps	%xmm1, %xmm7
00000000001b89d1	movaps	%xmm0, %xmm2
00000000001b89d4	shufps	$0x49, %xmm0, %xmm2             ## xmm2 = xmm2[1,2],xmm0[0,1]
00000000001b89d8	movaps	%xmm3, %xmm1
00000000001b89db	shufps	$0x49, %xmm3, %xmm1             ## xmm1 = xmm1[1,2],xmm3[0,1]
00000000001b89df	movaps	%xmm8, %xmm14
00000000001b89e3	shufps	$0x49, %xmm8, %xmm14            ## xmm14 = xmm14[1,2],xmm8[0,1]
00000000001b89e8	movaps	%xmm12, %xmm11
00000000001b89ec	shufps	$0x49, %xmm12, %xmm11           ## xmm11 = xmm11[1,2],xmm12[0,1]
00000000001b89f1	movaps	%xmm3, %xmm4
00000000001b89f4	mulps	%xmm14, %xmm4
00000000001b89f8	movaps	%xmm8, %xmm5
00000000001b89fc	mulps	%xmm1, %xmm5
00000000001b89ff	subps	%xmm5, %xmm4
00000000001b8a02	movaps	%xmm12, %xmm15
00000000001b8a06	mulps	%xmm14, %xmm15
00000000001b8a0a	movaps	%xmm8, %xmm5
00000000001b8a0e	mulps	%xmm11, %xmm5
00000000001b8a12	subps	%xmm5, %xmm15
00000000001b8a16	movaps	%xmm2, %xmm13
00000000001b8a1a	mulps	%xmm12, %xmm13
00000000001b8a1e	movaps	%xmm0, %xmm5
00000000001b8a21	movaps	%xmm11, -0x10(%rbp)
00000000001b8a26	mulps	%xmm11, %xmm5
00000000001b8a2a	subps	%xmm5, %xmm13
00000000001b8a2e	movaps	%xmm3, %xmm11
00000000001b8a32	mulps	%xmm2, %xmm11
00000000001b8a36	movaps	%xmm0, %xmm5
00000000001b8a39	mulps	%xmm1, %xmm5
00000000001b8a3c	subps	%xmm5, %xmm11
00000000001b8a40	shufps	$0x49, %xmm4, %xmm4             ## xmm4 = xmm4[1,2,0,1]
00000000001b8a44	shufps	$0x49, %xmm15, %xmm15           ## xmm15 = xmm15[1,2,0,1]
00000000001b8a49	movaps	%xmm7, -0x50(%rbp)
00000000001b8a4d	mulps	%xmm4, %xmm7
00000000001b8a50	movaps	%xmm6, -0x80(%rbp)
00000000001b8a54	mulps	%xmm15, %xmm6
00000000001b8a58	movaps	%xmm0, %xmm5
00000000001b8a5b	movaps	%xmm7, -0x60(%rbp)
00000000001b8a5f	mulps	%xmm7, %xmm5
00000000001b8a62	movaps	%xmm3, %xmm7
00000000001b8a65	movaps	%xmm6, -0x30(%rbp)
00000000001b8a69	mulps	%xmm6, %xmm7
00000000001b8a6c	addps	%xmm5, %xmm7
00000000001b8a6f	shufps	$0x49, %xmm13, %xmm13           ## xmm13 = xmm13[1,2,0,1]
00000000001b8a74	movaps	%xmm9, -0x70(%rbp)
00000000001b8a79	mulps	%xmm13, %xmm9
00000000001b8a7d	movaps	%xmm8, -0x20(%rbp)
00000000001b8a82	mulps	%xmm9, %xmm8
00000000001b8a86	addps	%xmm7, %xmm8
00000000001b8a8a	shufps	$0x49, %xmm11, %xmm11           ## xmm11 = xmm11[1,2,0,1]
00000000001b8a8f	movaps	%xmm10, -0x40(%rbp)
00000000001b8a94	movaps	%xmm10, %xmm5
00000000001b8a98	mulps	%xmm11, %xmm5
00000000001b8a9c	movaps	%xmm12, %xmm7
00000000001b8aa0	mulps	%xmm5, %xmm7
00000000001b8aa3	addps	%xmm8, %xmm7
00000000001b8aa7	movaps	%xmm7, %xmm8
00000000001b8aab	shufps	$0x0, %xmm7, %xmm8              ## xmm8 = xmm8[0,0],xmm7[0,0]
00000000001b8ab0	movaps	%xmm7, %xmm6
00000000001b8ab3	shufps	$0x55, %xmm7, %xmm6             ## xmm6 = xmm6[1,1],xmm7[1,1]
00000000001b8ab7	addps	%xmm8, %xmm6
00000000001b8abb	shufps	$0xaa, %xmm7, %xmm7             ## xmm7 = xmm7[2,2,2,2]
00000000001b8abf	addps	%xmm6, %xmm7
00000000001b8ac2	xorps	%xmm6, %xmm6
00000000001b8ac5	cmpeqps	%xmm7, %xmm6
00000000001b8ac9	movmskps	%xmm6, %eax
00000000001b8acc	testl	%eax, %eax
00000000001b8ace	je	0x1b8b4c
00000000001b8ad0	xorl	%eax, %eax
00000000001b8ad2	popq	%rbp
00000000001b8ad3	retq
00000000001b8ad4	testb	%dl, %dl
00000000001b8ad6	je	0x1b8b24
00000000001b8ad8	movaps	0x1c0(%rdi), %xmm1
00000000001b8adf	movaps	0x1d0(%rdi), %xmm5
00000000001b8ae6	movaps	0x1e0(%rdi), %xmm2
00000000001b8aed	movaps	%xmm0, %xmm3
00000000001b8af0	unpcklps	%xmm1, %xmm3                    ## xmm3 = xmm3[0],xmm1[0],xmm3[1],xmm1[1]
00000000001b8af3	movaps	%xmm5, %xmm4
00000000001b8af6	unpcklps	%xmm2, %xmm4                    ## xmm4 = xmm4[0],xmm2[0],xmm4[1],xmm2[1]
00000000001b8af9	unpckhps	%xmm1, %xmm0                    ## xmm0 = xmm0[2],xmm1[2],xmm0[3],xmm1[3]
00000000001b8afc	unpckhps	%xmm2, %xmm5                    ## xmm5 = xmm5[2],xmm2[2],xmm5[3],xmm2[3]
00000000001b8aff	movaps	%xmm3, %xmm1
00000000001b8b02	movlhps	%xmm4, %xmm1                    ## xmm1 = xmm1[0],xmm4[0]
00000000001b8b05	movaps	%xmm1, (%rsi)
00000000001b8b08	movhlps	%xmm3, %xmm4                    ## xmm4 = xmm3[1],xmm4[1]
00000000001b8b0b	movaps	%xmm4, 0x10(%rsi)
00000000001b8b0f	movaps	%xmm0, %xmm1
00000000001b8b12	movlhps	%xmm5, %xmm1                    ## xmm1 = xmm1[0],xmm5[0]
00000000001b8b15	movaps	%xmm1, 0x20(%rsi)
00000000001b8b19	movhlps	%xmm0, %xmm5                    ## xmm5 = xmm0[1],xmm5[1]
00000000001b8b1c	movaps	%xmm5, 0x30(%rsi)
00000000001b8b20	movb	$0x1, %al
00000000001b8b22	popq	%rbp
00000000001b8b23	retq
00000000001b8b24	movaps	%xmm0, (%rsi)
00000000001b8b27	movaps	0x1c0(%rdi), %xmm0
00000000001b8b2e	movaps	%xmm0, 0x10(%rsi)
00000000001b8b32	movaps	0x1d0(%rdi), %xmm0
00000000001b8b39	movaps	%xmm0, 0x20(%rsi)
00000000001b8b3d	movaps	0x1e0(%rdi), %xmm5
00000000001b8b44	movaps	%xmm5, 0x30(%rsi)
00000000001b8b48	movb	$0x1, %al
00000000001b8b4a	popq	%rbp
00000000001b8b4b	retq
00000000001b8b4c	mulps	%xmm14, %xmm0
00000000001b8b50	mulps	-0x20(%rbp), %xmm2
00000000001b8b54	subps	%xmm2, %xmm0
00000000001b8b57	mulps	-0x10(%rbp), %xmm3
00000000001b8b5b	mulps	%xmm12, %xmm1
00000000001b8b5f	subps	%xmm1, %xmm3
00000000001b8b62	rcpps	%xmm7, %xmm1
00000000001b8b65	mulps	%xmm1, %xmm7
00000000001b8b68	mulps	%xmm1, %xmm7
00000000001b8b6b	addps	%xmm1, %xmm1
00000000001b8b6e	subps	%xmm7, %xmm1
00000000001b8b71	shufps	$0x49, %xmm3, %xmm3             ## xmm3 = xmm3[1,2,0,1]
00000000001b8b75	movaps	-0x70(%rbp), %xmm6
00000000001b8b79	mulps	%xmm6, %xmm15
00000000001b8b7d	movaps	-0x60(%rbp), %xmm7
00000000001b8b81	subps	%xmm15, %xmm7
00000000001b8b85	movaps	-0x40(%rbp), %xmm8
00000000001b8b8a	movaps	%xmm8, %xmm2
00000000001b8b8e	mulps	%xmm3, %xmm2
00000000001b8b91	subps	%xmm2, %xmm7
00000000001b8b94	mulps	%xmm8, %xmm13
00000000001b8b98	shufps	$0x49, %xmm0, %xmm0             ## xmm0 = xmm0[1,2,0,1]
00000000001b8b9c	movaps	-0x30(%rbp), %xmm10
00000000001b8ba1	subps	%xmm13, %xmm10
00000000001b8ba5	movaps	-0x50(%rbp), %xmm8
00000000001b8baa	movaps	%xmm8, %xmm2
00000000001b8bae	mulps	%xmm0, %xmm2
00000000001b8bb1	subps	%xmm2, %xmm10
00000000001b8bb5	mulps	%xmm8, %xmm11
00000000001b8bb9	subps	%xmm11, %xmm9
00000000001b8bbd	movaps	-0x80(%rbp), %xmm2
00000000001b8bc1	mulps	%xmm2, %xmm3
00000000001b8bc4	addps	%xmm3, %xmm9
00000000001b8bc8	mulps	%xmm6, %xmm0
00000000001b8bcb	mulps	%xmm2, %xmm4
00000000001b8bce	subps	%xmm4, %xmm5
00000000001b8bd1	addps	%xmm0, %xmm5
00000000001b8bd4	mulps	%xmm1, %xmm7
00000000001b8bd7	mulps	%xmm1, %xmm10
00000000001b8bdb	mulps	%xmm1, %xmm9
00000000001b8bdf	mulps	%xmm1, %xmm5
00000000001b8be2	testb	%dl, %dl
00000000001b8be4	je	0x1b8bfb
00000000001b8be6	movaps	%xmm7, (%rsi)
00000000001b8be9	movaps	%xmm10, 0x10(%rsi)
00000000001b8bee	movaps	%xmm9, 0x20(%rsi)
00000000001b8bf3	movaps	%xmm5, 0x30(%rsi)
00000000001b8bf7	movb	$0x1, %al
00000000001b8bf9	popq	%rbp
00000000001b8bfa	retq
00000000001b8bfb	movaps	%xmm7, %xmm0
00000000001b8bfe	unpcklps	%xmm10, %xmm0                   ## xmm0 = xmm0[0],xmm10[0],xmm0[1],xmm10[1]
00000000001b8c02	movaps	%xmm9, %xmm1
00000000001b8c06	unpcklps	%xmm5, %xmm1                    ## xmm1 = xmm1[0],xmm5[0],xmm1[1],xmm5[1]
00000000001b8c09	unpckhps	%xmm10, %xmm7                   ## xmm7 = xmm7[2],xmm10[2],xmm7[3],xmm10[3]
00000000001b8c0d	unpckhps	%xmm5, %xmm9                    ## xmm9 = xmm9[2],xmm5[2],xmm9[3],xmm5[3]
00000000001b8c11	movaps	%xmm0, %xmm2
00000000001b8c14	movlhps	%xmm1, %xmm2                    ## xmm2 = xmm2[0],xmm1[0]
00000000001b8c17	movaps	%xmm2, (%rsi)
00000000001b8c1a	movhlps	%xmm0, %xmm1                    ## xmm1 = xmm0[1],xmm1[1]
00000000001b8c1d	movaps	%xmm1, 0x10(%rsi)
00000000001b8c21	movaps	%xmm7, %xmm0
00000000001b8c24	movlhps	%xmm9, %xmm0                    ## xmm0 = xmm0[0],xmm9[0]
00000000001b8c28	movaps	%xmm0, 0x20(%rsi)
00000000001b8c2c	movhlps	%xmm7, %xmm9                    ## xmm9 = xmm7[1],xmm9[1]
00000000001b8c30	movaps	%xmm9, %xmm5
00000000001b8c34	movaps	%xmm5, 0x30(%rsi)
00000000001b8c38	movb	$0x1, %al
00000000001b8c3a	popq	%rbp
00000000001b8c3b	retq
00000000001b8c3c	nopl	(%rax)
