__ZN17OZSimStateElement8stepFromEPS_S0_dd14PCMatrix33TmplIdE:
0000000000284be0	movsd	0x48(%rdx), %xmm3
0000000000284be5	mulsd	%xmm0, %xmm3
0000000000284be9	addsd	0x10(%rsi), %xmm3
0000000000284bee	movupd	0x38(%rdx), %xmm4
0000000000284bf3	movddup	%xmm0, %xmm2                    ## xmm2 = xmm0[0,0]
0000000000284bf7	mulpd	%xmm2, %xmm4
0000000000284bfb	movupd	(%rsi), %xmm5
0000000000284bff	addpd	%xmm4, %xmm5
0000000000284c03	movupd	%xmm5, (%rdi)
0000000000284c07	movsd	%xmm3, 0x10(%rdi)
0000000000284c0c	mulsd	%xmm0, %xmm1
0000000000284c10	movddup	%xmm1, %xmm3                    ## xmm3 = xmm1[0,0]
0000000000284c14	mulsd	0x90(%rdx), %xmm1
0000000000284c1c	addsd	0x48(%rsi), %xmm1
0000000000284c21	movupd	0x80(%rdx), %xmm4
0000000000284c29	mulpd	%xmm3, %xmm4
0000000000284c2d	movupd	0x38(%rsi), %xmm3
0000000000284c32	addpd	%xmm4, %xmm3
0000000000284c36	movupd	%xmm3, 0x38(%rdi)
0000000000284c3b	movsd	0x482265(%rip), %xmm3
0000000000284c43	mulsd	%xmm0, %xmm3
0000000000284c47	mulsd	0x485931(%rip), %xmm3
0000000000284c4f	movsd	%xmm1, 0x48(%rdi)
0000000000284c54	xorpd	%xmm1, %xmm1
0000000000284c58	movsd	0x50(%rdx), %xmm8
0000000000284c5e	mulsd	%xmm3, %xmm8
0000000000284c63	movupd	0x58(%rdx), %xmm6
0000000000284c68	movddup	%xmm3, %xmm9                    ## xmm9 = xmm3[0,0]
0000000000284c6d	mulpd	%xmm6, %xmm9
0000000000284c72	movapd	%xmm8, %xmm6
0000000000284c77	mulsd	%xmm8, %xmm6
0000000000284c7c	movapd	%xmm9, %xmm7
0000000000284c81	mulpd	%xmm9, %xmm7
0000000000284c86	addsd	%xmm7, %xmm6
0000000000284c8a	unpckhpd	%xmm7, %xmm7                    ## xmm7 = xmm7[1,1]
0000000000284c8e	addsd	%xmm6, %xmm7
0000000000284c92	ucomisd	%xmm1, %xmm7
0000000000284c96	jne	0x284cc4
0000000000284c98	jp	0x284cc4
0000000000284c9a	cmpq	%rdi, %rsi
0000000000284c9d	je	0x284e7f
0000000000284ca3	movsd	0x18(%rsi), %xmm1
0000000000284ca8	movsd	%xmm1, 0x18(%rdi)
0000000000284cad	movupd	0x20(%rsi), %xmm1
0000000000284cb2	movupd	%xmm1, 0x20(%rdi)
0000000000284cb7	movq	0x30(%rsi), %rax
0000000000284cbb	movq	%rax, 0x30(%rdi)
0000000000284cbf	jmp	0x284e7f
0000000000284cc4	pushq	%rbp
0000000000284cc5	movq	%rsp, %rbp
0000000000284cc8	movapd	%xmm2, -0x10(%rbp)
0000000000284ccd	mulsd	%xmm1, %xmm3
0000000000284cd1	movupd	0x18(%rsi), %xmm11
0000000000284cd7	movupd	0x28(%rsi), %xmm12
0000000000284cdd	movddup	%xmm3, %xmm2                    ## xmm2 = xmm3[0,0]
0000000000284ce1	movapd	%xmm9, %xmm7
0000000000284ce6	shufpd	$0x1, %xmm8, %xmm7              ## xmm7 = xmm7[1],xmm8[0]
0000000000284cec	movapd	%xmm8, %xmm1
0000000000284cf1	unpcklpd	%xmm9, %xmm1                    ## xmm1 = xmm1[0],xmm9[0]
0000000000284cf6	movapd	%xmm9, %xmm10
0000000000284cfb	unpckhpd	%xmm9, %xmm10                   ## xmm10 = xmm10[1],xmm9[1]
0000000000284d00	movl	$0x8, %eax
0000000000284d05	jmp	0x284d18
0000000000284d07	nopw	(%rax,%rax)
0000000000284d10	decl	%eax
0000000000284d12	je	0x284e6d
0000000000284d18	movapd	%xmm12, %xmm13
0000000000284d1d	movapd	%xmm3, %xmm12
0000000000284d22	mulsd	%xmm11, %xmm12
0000000000284d27	movapd	%xmm11, %xmm14
0000000000284d2c	unpckhpd	%xmm11, %xmm14                  ## xmm14 = xmm14[1],xmm11[1]
0000000000284d31	movapd	%xmm8, %xmm15
0000000000284d36	mulsd	%xmm14, %xmm15
0000000000284d3b	movapd	%xmm9, %xmm5
0000000000284d40	mulsd	%xmm13, %xmm5
0000000000284d45	addsd	%xmm15, %xmm5
0000000000284d4a	movapd	%xmm13, %xmm15
0000000000284d4f	unpckhpd	%xmm13, %xmm15                  ## xmm15 = xmm15[1],xmm13[1]
0000000000284d54	mulpd	%xmm9, %xmm15
0000000000284d59	mulsd	%xmm3, %xmm14
0000000000284d5e	movapd	%xmm2, %xmm6
0000000000284d62	mulpd	%xmm13, %xmm6
0000000000284d67	movapd	%xmm8, %xmm4
0000000000284d6c	mulsd	%xmm11, %xmm4
0000000000284d71	addsd	%xmm14, %xmm4
0000000000284d76	movapd	%xmm10, %xmm14
0000000000284d7b	mulpd	%xmm13, %xmm14
0000000000284d80	movddup	%xmm5, %xmm5                    ## xmm5 = xmm5[0,0]
0000000000284d84	addpd	%xmm15, %xmm5
0000000000284d89	subpd	%xmm14, %xmm15
0000000000284d8e	shufpd	$0x1, %xmm15, %xmm5             ## xmm5 = xmm5[1],xmm15[0]
0000000000284d94	xorpd	%xmm15, %xmm15
0000000000284d99	movddup	%xmm4, %xmm14                   ## xmm14 = xmm4[0,0]
0000000000284d9e	subpd	%xmm5, %xmm12
0000000000284da3	addpd	%xmm5, %xmm14
0000000000284da8	blendpd	$0x1, %xmm12, %xmm14            ## xmm14 = xmm12[0],xmm14[1]
0000000000284daf	addpd	%xmm11, %xmm14
0000000000284db4	movddup	%xmm11, %xmm4                   ## xmm4 = xmm11[0,0]
0000000000284db9	mulpd	%xmm9, %xmm4
0000000000284dbe	addpd	%xmm6, %xmm4
0000000000284dc2	movapd	%xmm13, %xmm5
0000000000284dc7	unpckhpd	%xmm11, %xmm5                   ## xmm5 = xmm5[1],xmm11[1]
0000000000284dcc	shufpd	$0x1, %xmm13, %xmm11            ## xmm11 = xmm11[1],xmm13[0]
0000000000284dd2	mulpd	%xmm7, %xmm11
0000000000284dd7	mulpd	%xmm1, %xmm5
0000000000284ddb	subpd	%xmm5, %xmm11
0000000000284de0	addpd	%xmm4, %xmm11
0000000000284de5	movapd	%xmm11, %xmm12
0000000000284dea	addpd	%xmm13, %xmm12
0000000000284def	movapd	%xmm12, %xmm4
0000000000284df4	blendpd	$0x1, %xmm14, %xmm4             ## xmm4 = xmm14[0],xmm4[1]
0000000000284dfb	movapd	%xmm14, %xmm5
0000000000284e00	shufpd	$0x1, %xmm12, %xmm5             ## xmm5 = xmm5[1],xmm12[0]
0000000000284e06	mulpd	%xmm5, %xmm5
0000000000284e0a	mulpd	%xmm4, %xmm4
0000000000284e0e	movapd	%xmm5, %xmm6
0000000000284e12	unpckhpd	%xmm5, %xmm6                    ## xmm6 = xmm6[1],xmm5[1]
0000000000284e16	addsd	%xmm5, %xmm6
0000000000284e1a	movapd	%xmm4, %xmm5
0000000000284e1e	unpckhpd	%xmm4, %xmm5                    ## xmm5 = xmm5[1],xmm4[1]
0000000000284e22	addsd	%xmm6, %xmm5
0000000000284e26	addsd	%xmm4, %xmm5
0000000000284e2a	ucomisd	%xmm15, %xmm5
0000000000284e2f	movapd	%xmm14, %xmm11
0000000000284e34	xorps	%xmm4, %xmm4
0000000000284e37	sqrtsd	%xmm5, %xmm4
0000000000284e3b	movddup	%xmm4, %xmm13                   ## xmm13 = xmm4[0,0]
0000000000284e40	divpd	%xmm13, %xmm11
0000000000284e45	jne	0x284e52
0000000000284e47	jp	0x284e52
0000000000284e49	movsd	0x48058e(%rip), %xmm11
0000000000284e52	divpd	%xmm13, %xmm12
0000000000284e57	jne	0x284d10
0000000000284e5d	jp	0x284d10
0000000000284e63	xorpd	%xmm12, %xmm12
0000000000284e68	jmp	0x284d10
0000000000284e6d	movupd	%xmm11, 0x18(%rdi)
0000000000284e73	movupd	%xmm12, 0x28(%rdi)
0000000000284e79	movapd	-0x10(%rbp), %xmm2
0000000000284e7e	popq	%rbp
0000000000284e7f	mulsd	0xa8(%rdx), %xmm0
0000000000284e87	addsd	0x78(%rsi), %xmm0
0000000000284e8c	movupd	0x98(%rdx), %xmm1
0000000000284e94	mulpd	%xmm1, %xmm2
0000000000284e98	movupd	0x68(%rsi), %xmm1
0000000000284e9d	addpd	%xmm2, %xmm1
0000000000284ea1	movupd	%xmm1, 0x68(%rdi)
0000000000284ea6	movsd	%xmm0, 0x78(%rdi)
0000000000284eab	movq	0x78(%rdi), %rax
0000000000284eaf	movq	%rax, 0x60(%rdi)
0000000000284eb3	movups	0x68(%rdi), %xmm0
0000000000284eb7	movups	%xmm0, 0x50(%rdi)
0000000000284ebb	movq	0xe8(%rsi), %rax
0000000000284ec2	movq	%rax, 0xe8(%rdi)
0000000000284ec9	retq
0000000000284eca	addb	%al, (%rax)
0000000000284ecc	addb	%al, (%rax)
0000000000284ece	addb	%al, (%rax)
