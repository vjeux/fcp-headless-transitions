__ZN11HGTransform6InvertEv:
00000000001b5a30	pushq	%rbp
00000000001b5a31	movq	%rsp, %rbp
00000000001b5a34	pushq	%r14
00000000001b5a36	pushq	%rbx
00000000001b5a37	subq	$0x50, %rsp
00000000001b5a3b	movq	0x84c816(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001b5a42	movq	(%rax), %rax
00000000001b5a45	movq	%rax, -0x18(%rbp)
00000000001b5a49	leaq	0x10(%rdi), %rsi
00000000001b5a4d	leaq	0x30(%rdi), %r11
00000000001b5a51	leaq	0x50(%rdi), %r10
00000000001b5a55	leaq	0x70(%rdi), %r9
00000000001b5a59	leaq	0x18(%rdi), %rdx
00000000001b5a5d	leaq	0x40(%rdi), %rcx
00000000001b5a61	leaq	0x68(%rdi), %rax
00000000001b5a65	movupd	0x80(%rdi), %xmm8
00000000001b5a6e	movupd	0x70(%rdi), %xmm10
00000000001b5a74	movupd	0x60(%rdi), %xmm12
00000000001b5a7a	movupd	0x50(%rdi), %xmm9
00000000001b5a80	movupd	0x10(%rdi), %xmm4
00000000001b5a85	movupd	0x20(%rdi), %xmm14
00000000001b5a8b	movupd	0x30(%rdi), %xmm13
00000000001b5a91	movupd	0x40(%rdi), %xmm11
00000000001b5a97	movapd	0x6a5161(%rip), %xmm0
00000000001b5a9f	xorl	%r8d, %r8d
00000000001b5aa2	movq	%rsi, %rbx
00000000001b5aa5	movapd	%xmm0, -0x50(%rbp)
00000000001b5aaa	movapd	%xmm0, -0x40(%rbp)
00000000001b5aaf	jmp	0x1b5b3a
00000000001b5ab4	nopw	%cs:(%rax,%rax)
00000000001b5ac0	movapd	%xmm11, %xmm5
00000000001b5ac5	movapd	%xmm9, %xmm7
00000000001b5aca	movapd	%xmm5, %xmm11
00000000001b5acf	shufpd	$0x1, %xmm3, %xmm11             ## xmm11 = xmm11[1],xmm3[0]
00000000001b5ad5	movapd	%xmm3, %xmm14
00000000001b5ada	blendpd	$0x1, %xmm5, %xmm14             ## xmm14 = xmm5[0],xmm14[1]
00000000001b5ae1	movapd	%xmm0, %xmm8
00000000001b5ae6	shufpd	$0x1, %xmm1, %xmm8              ## xmm8 = xmm8[1],xmm1[0]
00000000001b5aec	movapd	%xmm1, %xmm12
00000000001b5af1	blendpd	$0x1, %xmm0, %xmm12             ## xmm12 = xmm0[0],xmm12[1]
00000000001b5af8	movapd	%xmm6, %xmm13
00000000001b5afd	blendpd	$0x1, %xmm7, %xmm13             ## xmm13 = xmm7[0],xmm13[1]
00000000001b5b04	movapd	%xmm7, %xmm4
00000000001b5b08	shufpd	$0x1, %xmm6, %xmm4              ## xmm4 = xmm4[1],xmm6[0]
00000000001b5b0d	movapd	%xmm2, %xmm10
00000000001b5b12	blendpd	$0x1, %xmm15, %xmm10            ## xmm10 = xmm15[0],xmm10[1]
00000000001b5b19	movapd	%xmm15, %xmm9
00000000001b5b1e	shufpd	$0x1, %xmm2, %xmm9              ## xmm9 = xmm9[1],xmm2[0]
00000000001b5b24	movl	%r14d, -0x30(%rbp,%r8,4)
00000000001b5b29	incq	%r8
00000000001b5b2c	addq	$0x20, %rsi
00000000001b5b30	cmpq	$0x4, %r8
00000000001b5b34	je	0x1b5fc7
00000000001b5b3a	movapd	%xmm4, %xmm1
00000000001b5b3e	unpcklpd	%xmm14, %xmm1                   ## xmm1 = xmm1[0],xmm14[0]
00000000001b5b43	mulpd	-0x50(%rbp), %xmm1
00000000001b5b48	movapd	%xmm4, %xmm2
00000000001b5b4c	unpckhpd	%xmm14, %xmm2                   ## xmm2 = xmm2[1],xmm14[1]
00000000001b5b51	mulpd	-0x40(%rbp), %xmm2
00000000001b5b56	movapd	%xmm1, %xmm3
00000000001b5b5a	movapd	0x6a4f6e(%rip), %xmm0
00000000001b5b62	andpd	%xmm0, %xmm3
00000000001b5b66	movapd	%xmm2, %xmm5
00000000001b5b6a	andpd	%xmm0, %xmm5
00000000001b5b6e	movapd	%xmm5, %xmm0
00000000001b5b72	cmplepd	%xmm3, %xmm0
00000000001b5b77	movapd	%xmm5, %xmm6
00000000001b5b7b	blendvpd	%xmm0, %xmm3, %xmm6
00000000001b5b80	movapd	%xmm6, %xmm0
00000000001b5b84	unpckhpd	%xmm6, %xmm0                    ## xmm0 = xmm0[1],xmm6[1]
00000000001b5b88	ucomisd	%xmm0, %xmm6
00000000001b5b8c	jbe	0x1b5c90
00000000001b5b92	xorpd	%xmm0, %xmm0
00000000001b5b96	ucomisd	%xmm5, %xmm3
00000000001b5b9a	jbe	0x1b5da0
00000000001b5ba0	ucomisd	%xmm0, %xmm1
00000000001b5ba4	jne	0x1b5bac
00000000001b5ba6	jnp	0x1b5f89
00000000001b5bac	movapd	%xmm9, %xmm7
00000000001b5bb1	unpcklpd	%xmm13, %xmm7                   ## xmm7 = xmm7[0],xmm13[0]
00000000001b5bb6	movapd	0x6a7801(%rip), %xmm15
00000000001b5bbf	unpcklpd	%xmm10, %xmm15                  ## xmm15 = xmm15[0],xmm10[0]
00000000001b5bc4	movddup	%xmm4, %xmm0                    ## xmm0 = xmm4[0,0]
00000000001b5bc8	divpd	%xmm0, %xmm15
00000000001b5bcd	divpd	%xmm0, %xmm7
00000000001b5bd1	movapd	%xmm7, %xmm1
00000000001b5bd5	shufpd	$0x1, %xmm7, %xmm1              ## xmm1 = xmm1[1],xmm7[0]
00000000001b5bda	movapd	%xmm15, %xmm0
00000000001b5bdf	shufpd	$0x1, %xmm15, %xmm0             ## xmm0 = xmm0[1],xmm15[0]
00000000001b5be5	unpckhpd	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000001b5be9	movddup	%xmm14, %xmm3                   ## xmm3 = xmm14[0,0]
00000000001b5bee	unpckhpd	%xmm14, %xmm14                  ## xmm14 = xmm14[1,1]
00000000001b5bf3	movapd	%xmm3, %xmm2
00000000001b5bf7	mulpd	%xmm0, %xmm2
00000000001b5bfb	mulpd	%xmm4, %xmm0
00000000001b5bff	mulpd	%xmm1, %xmm4
00000000001b5c03	mulpd	%xmm3, %xmm1
00000000001b5c07	movapd	%xmm14, %xmm3
00000000001b5c0c	mulpd	%xmm15, %xmm3
00000000001b5c11	xorpd	%xmm6, %xmm6
00000000001b5c15	unpckhpd	%xmm6, %xmm10                   ## xmm10 = xmm10[1],xmm6[1]
00000000001b5c1a	subpd	%xmm0, %xmm10
00000000001b5c1f	movq	%xmm8, %xmm0                    ## xmm0 = xmm8[0],zero
00000000001b5c24	blendpd	$0x1, %xmm6, %xmm8              ## xmm8 = xmm6[0],xmm8[1]
00000000001b5c2b	subpd	%xmm3, %xmm8
00000000001b5c30	unpckhpd	%xmm9, %xmm13                   ## xmm13 = xmm13[1],xmm9[1]
00000000001b5c35	subpd	%xmm4, %xmm13
00000000001b5c3a	movapd	%xmm11, %xmm5
00000000001b5c3f	unpcklpd	%xmm12, %xmm5                   ## xmm5 = xmm5[0],xmm12[0]
00000000001b5c44	subpd	%xmm1, %xmm5
00000000001b5c48	unpckhpd	%xmm11, %xmm12                  ## xmm12 = xmm12[1],xmm11[1]
00000000001b5c4d	mulpd	%xmm7, %xmm14
00000000001b5c52	subpd	%xmm14, %xmm12
00000000001b5c57	subpd	%xmm2, %xmm0
00000000001b5c5b	movapd	-0x50(%rbp), %xmm1
00000000001b5c60	blendpd	$0x1, %xmm6, %xmm1              ## xmm1 = xmm6[0],xmm1[1]
00000000001b5c66	movapd	%xmm1, -0x50(%rbp)
00000000001b5c6b	xorl	%r14d, %r14d
00000000001b5c6e	movq	%rsi, %rbx
00000000001b5c71	movapd	%xmm13, %xmm6
00000000001b5c76	movapd	%xmm10, %xmm2
00000000001b5c7b	movapd	%xmm8, %xmm1
00000000001b5c80	movapd	%xmm12, %xmm3
00000000001b5c85	jmp	0x1b5aca
00000000001b5c8a	nopw	(%rax,%rax)
00000000001b5c90	cmpltpd	%xmm3, %xmm5
00000000001b5c95	pextrb	$0x8, %xmm5, %r14d
00000000001b5c9c	testb	$0x1, %r14b
00000000001b5ca0	je	0x1b5e90
00000000001b5ca6	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
00000000001b5caa	xorpd	%xmm0, %xmm0
00000000001b5cae	ucomisd	%xmm0, %xmm1
00000000001b5cb2	jne	0x1b5cba
00000000001b5cb4	jnp	0x1b5f89
00000000001b5cba	movddup	%xmm14, %xmm1                   ## xmm1 = xmm14[0,0]
00000000001b5cbf	movapd	%xmm11, %xmm5
00000000001b5cc4	unpcklpd	%xmm12, %xmm5                   ## xmm5 = xmm5[0],xmm12[0]
00000000001b5cc9	divpd	%xmm1, %xmm5
00000000001b5ccd	movapd	%xmm8, %xmm0
00000000001b5cd2	unpcklpd	0x6a76e6(%rip), %xmm0           ## xmm0 = xmm0[0],mem[0]
00000000001b5cda	divpd	%xmm1, %xmm0
00000000001b5cde	movddup	%xmm4, %xmm1                    ## xmm1 = xmm4[0,0]
00000000001b5ce2	unpckhpd	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000001b5ce6	movapd	%xmm4, %xmm2
00000000001b5cea	mulpd	%xmm0, %xmm2
00000000001b5cee	mulpd	%xmm5, %xmm4
00000000001b5cf2	movapd	%xmm13, %xmm6
00000000001b5cf7	unpckhpd	%xmm9, %xmm6                    ## xmm6 = xmm6[1],xmm9[1]
00000000001b5cfc	subpd	%xmm4, %xmm6
00000000001b5d00	xorpd	%xmm15, %xmm15
00000000001b5d05	unpcklpd	%xmm10, %xmm15                  ## xmm15 = xmm15[0],xmm10[0]
00000000001b5d0a	xorpd	%xmm3, %xmm3
00000000001b5d0e	unpckhpd	%xmm3, %xmm10                   ## xmm10 = xmm10[1],xmm3[1]
00000000001b5d13	subpd	%xmm2, %xmm10
00000000001b5d18	unpcklpd	%xmm13, %xmm9                   ## xmm9 = xmm9[0],xmm13[0]
00000000001b5d1d	movapd	%xmm1, %xmm2
00000000001b5d21	mulpd	%xmm5, %xmm1
00000000001b5d25	shufpd	$0x1, %xmm1, %xmm1              ## xmm1 = xmm1[1,0]
00000000001b5d2a	subpd	%xmm1, %xmm9
00000000001b5d2f	unpckhpd	%xmm14, %xmm14                  ## xmm14 = xmm14[1,1]
00000000001b5d34	unpckhpd	%xmm11, %xmm12                  ## xmm12 = xmm12[1],xmm11[1]
00000000001b5d39	movapd	%xmm14, %xmm1
00000000001b5d3e	mulpd	%xmm5, %xmm14
00000000001b5d43	shufpd	$0x1, %xmm14, %xmm14            ## xmm14 = xmm14[1,0]
00000000001b5d49	subpd	%xmm14, %xmm12
00000000001b5d4e	mulpd	%xmm0, %xmm2
00000000001b5d52	shufpd	$0x1, %xmm2, %xmm2              ## xmm2 = xmm2[1,0]
00000000001b5d57	subpd	%xmm2, %xmm15
00000000001b5d5c	mulpd	%xmm0, %xmm1
00000000001b5d60	blendpd	$0x1, %xmm3, %xmm8              ## xmm8 = xmm3[0],xmm8[1]
00000000001b5d67	shufpd	$0x1, %xmm1, %xmm1              ## xmm1 = xmm1[1,0]
00000000001b5d6c	subpd	%xmm1, %xmm8
00000000001b5d71	movdqa	-0x50(%rbp), %xmm1
00000000001b5d76	movq	%xmm1, %xmm1                    ## xmm1 = xmm1[0],zero
00000000001b5d7a	movdqa	%xmm1, -0x50(%rbp)
00000000001b5d7f	movl	$0x2, %r14d
00000000001b5d85	movq	%rsi, %r10
00000000001b5d88	movapd	%xmm10, %xmm2
00000000001b5d8d	movapd	%xmm8, %xmm1
00000000001b5d92	movapd	%xmm12, %xmm3
00000000001b5d97	jmp	0x1b5ac5
00000000001b5d9c	nopl	(%rax)
00000000001b5da0	ucomisd	%xmm0, %xmm2
00000000001b5da4	jne	0x1b5dac
00000000001b5da6	jnp	0x1b5f89
00000000001b5dac	movapd	%xmm9, %xmm6
00000000001b5db1	unpckhpd	%xmm13, %xmm6                   ## xmm6 = xmm6[1],xmm13[1]
00000000001b5db6	movapd	%xmm10, %xmm5
00000000001b5dbb	blendpd	$0x1, 0x6a75fb(%rip), %xmm5     ## xmm5 = mem[0],xmm5[1]
00000000001b5dc5	movddup	%xmm4, %xmm1                    ## xmm1 = xmm4[0,0]
00000000001b5dc9	unpckhpd	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000001b5dcd	divpd	%xmm4, %xmm5
00000000001b5dd1	divpd	%xmm4, %xmm6
00000000001b5dd5	movapd	%xmm5, %xmm2
00000000001b5dd9	movddup	%xmm14, %xmm4                   ## xmm4 = xmm14[0,0]
00000000001b5dde	unpckhpd	%xmm14, %xmm14                  ## xmm14 = xmm14[1,1]
00000000001b5de3	mulpd	%xmm14, %xmm5
00000000001b5de8	mulpd	%xmm6, %xmm14
00000000001b5ded	movapd	%xmm12, %xmm3
00000000001b5df2	unpckhpd	%xmm11, %xmm3                   ## xmm3 = xmm3[1],xmm11[1]
00000000001b5df7	subpd	%xmm14, %xmm3
00000000001b5dfc	movq	%xmm8, %xmm0                    ## xmm0 = xmm8[0],zero
00000000001b5e01	xorpd	%xmm7, %xmm7
00000000001b5e05	blendpd	$0x1, %xmm7, %xmm8              ## xmm8 = xmm7[0],xmm8[1]
00000000001b5e0c	subpd	%xmm5, %xmm8
00000000001b5e11	shufpd	$0x1, %xmm6, %xmm6              ## xmm6 = xmm6[1,0]
00000000001b5e16	shufpd	$0x1, %xmm2, %xmm2              ## xmm2 = xmm2[1,0]
00000000001b5e1b	unpcklpd	%xmm12, %xmm11                  ## xmm11 = xmm11[0],xmm12[0]
00000000001b5e20	movapd	%xmm2, %xmm5
00000000001b5e24	mulpd	%xmm4, %xmm5
00000000001b5e28	mulpd	%xmm6, %xmm4
00000000001b5e2c	subpd	%xmm4, %xmm11
00000000001b5e31	subpd	%xmm5, %xmm0
00000000001b5e35	unpcklpd	%xmm13, %xmm9                   ## xmm9 = xmm9[0],xmm13[0]
00000000001b5e3a	movapd	%xmm2, %xmm4
00000000001b5e3e	mulpd	%xmm1, %xmm4
00000000001b5e42	mulpd	%xmm6, %xmm1
00000000001b5e46	shufpd	$0x1, %xmm1, %xmm1              ## xmm1 = xmm1[1,0]
00000000001b5e4b	subpd	%xmm1, %xmm9
00000000001b5e50	xorpd	%xmm15, %xmm15
00000000001b5e55	unpcklpd	%xmm10, %xmm15                  ## xmm15 = xmm15[0],xmm10[0]
00000000001b5e5a	shufpd	$0x1, %xmm4, %xmm4              ## xmm4 = xmm4[1,0]
00000000001b5e5f	subpd	%xmm4, %xmm15
00000000001b5e64	movapd	-0x40(%rbp), %xmm1
00000000001b5e69	blendpd	$0x1, %xmm7, %xmm1              ## xmm1 = xmm7[0],xmm1[1]
00000000001b5e6f	movapd	%xmm1, -0x40(%rbp)
00000000001b5e74	movl	$0x1, %r14d
00000000001b5e7a	movq	%rsi, %r11
00000000001b5e7d	movapd	%xmm8, %xmm1
00000000001b5e82	jmp	0x1b5ac0
00000000001b5e87	nopw	(%rax,%rax)
00000000001b5e90	unpckhpd	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
00000000001b5e94	xorpd	%xmm0, %xmm0
00000000001b5e98	ucomisd	%xmm0, %xmm2
00000000001b5e9c	jne	0x1b5ea4
00000000001b5e9e	jnp	0x1b5f89
00000000001b5ea4	movapd	%xmm12, %xmm3
00000000001b5ea9	unpckhpd	%xmm11, %xmm3                   ## xmm3 = xmm3[1],xmm11[1]
00000000001b5eae	movapd	%xmm8, %xmm1
00000000001b5eb3	blendpd	$0x1, 0x6a7503(%rip), %xmm1     ## xmm1 = mem[0],xmm1[1]
00000000001b5ebd	movddup	%xmm14, %xmm0                   ## xmm0 = xmm14[0,0]
00000000001b5ec2	unpckhpd	%xmm14, %xmm14                  ## xmm14 = xmm14[1,1]
00000000001b5ec7	divpd	%xmm14, %xmm1
00000000001b5ecc	divpd	%xmm14, %xmm3
00000000001b5ed1	movapd	%xmm3, %xmm7
00000000001b5ed5	shufpd	$0x1, %xmm3, %xmm7              ## xmm7 = xmm7[1],xmm3[0]
00000000001b5eda	movapd	%xmm1, %xmm14
00000000001b5edf	shufpd	$0x1, %xmm1, %xmm14             ## xmm14 = xmm14[1],xmm1[0]
00000000001b5ee5	movddup	%xmm4, %xmm5                    ## xmm5 = xmm4[0,0]
00000000001b5ee9	unpckhpd	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000001b5eed	movapd	%xmm5, %xmm2
00000000001b5ef1	mulpd	%xmm14, %xmm2
00000000001b5ef6	mulpd	%xmm7, %xmm5
00000000001b5efa	movapd	%xmm0, %xmm6
00000000001b5efe	mulpd	%xmm14, %xmm6
00000000001b5f03	movapd	%xmm6, -0x60(%rbp)
00000000001b5f08	mulpd	%xmm4, %xmm14
00000000001b5f0d	mulpd	%xmm7, %xmm4
00000000001b5f11	mulpd	%xmm0, %xmm7
00000000001b5f15	movapd	%xmm13, %xmm6
00000000001b5f1a	unpckhpd	%xmm9, %xmm6                    ## xmm6 = xmm6[1],xmm9[1]
00000000001b5f1f	subpd	%xmm4, %xmm6
00000000001b5f23	unpcklpd	%xmm12, %xmm11                  ## xmm11 = xmm11[0],xmm12[0]
00000000001b5f28	subpd	%xmm7, %xmm11
00000000001b5f2d	xorpd	%xmm15, %xmm15
00000000001b5f32	unpcklpd	%xmm10, %xmm15                  ## xmm15 = xmm15[0],xmm10[0]
00000000001b5f37	xorpd	%xmm0, %xmm0
00000000001b5f3b	unpckhpd	%xmm0, %xmm10                   ## xmm10 = xmm10[1],xmm0[1]
00000000001b5f40	subpd	%xmm14, %xmm10
00000000001b5f45	movq	%xmm8, %xmm0                    ## xmm0 = xmm8[0],zero
00000000001b5f4a	subpd	-0x60(%rbp), %xmm0
00000000001b5f4f	unpcklpd	%xmm13, %xmm9                   ## xmm9 = xmm9[0],xmm13[0]
00000000001b5f54	shufpd	$0x1, %xmm5, %xmm5              ## xmm5 = xmm5[1,0]
00000000001b5f59	subpd	%xmm5, %xmm9
00000000001b5f5e	shufpd	$0x1, %xmm2, %xmm2              ## xmm2 = xmm2[1,0]
00000000001b5f63	subpd	%xmm2, %xmm15
00000000001b5f68	movdqa	-0x40(%rbp), %xmm2
00000000001b5f6d	movq	%xmm2, %xmm2                    ## xmm2 = xmm2[0],zero
00000000001b5f71	movdqa	%xmm2, -0x40(%rbp)
00000000001b5f76	movl	$0x3, %r14d
00000000001b5f7c	movq	%rsi, %r9
00000000001b5f7f	movapd	%xmm10, %xmm2
00000000001b5f84	jmp	0x1b5ac0
00000000001b5f89	movabsq	$0x3ff0000000000000, %rsi       ## imm = 0x3FF0000000000000
00000000001b5f93	movq	%rsi, 0x10(%rdi)
00000000001b5f97	xorpd	%xmm0, %xmm0
00000000001b5f9b	movupd	%xmm0, 0x10(%rdx)
00000000001b5fa0	movupd	%xmm0, (%rdx)
00000000001b5fa4	movq	%rsi, 0x38(%rdi)
00000000001b5fa8	movupd	%xmm0, 0x10(%rcx)
00000000001b5fad	movupd	%xmm0, (%rcx)
00000000001b5fb1	movq	%rsi, 0x60(%rdi)
00000000001b5fb5	movupd	%xmm0, 0x10(%rax)
00000000001b5fba	movupd	%xmm0, (%rax)
00000000001b5fbe	movq	%rsi, 0x88(%rdi)
00000000001b5fc5	jmp	0x1b6033
00000000001b5fc7	movslq	-0x30(%rbp), %rax
00000000001b5fcb	movslq	-0x2c(%rbp), %rcx
00000000001b5fcf	movslq	-0x28(%rbp), %rdx
00000000001b5fd3	movslq	-0x24(%rbp), %rsi
00000000001b5fd7	movhpd	%xmm7, (%rbx,%rax,8)
00000000001b5fdc	movlpd	%xmm6, (%rbx,%rcx,8)
00000000001b5fe1	movlpd	%xmm5, (%rbx,%rdx,8)
00000000001b5fe6	movhpd	%xmm3, (%rbx,%rsi,8)
00000000001b5feb	movlpd	%xmm7, (%r11,%rax,8)
00000000001b5ff1	movhpd	%xmm6, (%r11,%rcx,8)
00000000001b5ff7	movhpd	%xmm5, (%r11,%rdx,8)
00000000001b5ffd	movlpd	%xmm3, (%r11,%rsi,8)
00000000001b6003	movhpd	%xmm15, (%r10,%rax,8)
00000000001b6009	movlpd	%xmm2, (%r10,%rcx,8)
00000000001b600f	movlpd	%xmm0, (%r10,%rdx,8)
00000000001b6015	movhpd	%xmm1, (%r10,%rsi,8)
00000000001b601b	movlpd	%xmm15, (%r9,%rax,8)
00000000001b6021	movhpd	%xmm2, (%r9,%rcx,8)
00000000001b6027	movhpd	%xmm0, (%r9,%rdx,8)
00000000001b602d	movlpd	%xmm1, (%r9,%rsi,8)
00000000001b6033	movq	0x84c21e(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001b603a	movq	(%rax), %rax
00000000001b603d	cmpq	-0x18(%rbp), %rax
00000000001b6041	jne	0x1b604c
00000000001b6043	addq	$0x50, %rsp
00000000001b6047	popq	%rbx
00000000001b6048	popq	%r14
00000000001b604a	popq	%rbp
00000000001b604b	retq
00000000001b604c	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001b6051	nopw	%cs:(%rax,%rax)
