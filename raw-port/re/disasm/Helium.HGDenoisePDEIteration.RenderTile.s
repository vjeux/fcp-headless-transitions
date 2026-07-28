__ZN21HGDenoisePDEIteration10RenderTileEP6HGTile:
00000000001c2c10	movl	0xc(%rsi), %r10d
00000000001c2c14	movl	0x8(%rsi), %eax
00000000001c2c17	subl	0x4(%rsi), %r10d
00000000001c2c1b	sete	%cl
00000000001c2c1e	subl	(%rsi), %eax
00000000001c2c20	sete	%dl
00000000001c2c23	orb	%cl, %dl
00000000001c2c25	jne	0x1c2e50
00000000001c2c2b	pushq	%rbp
00000000001c2c2c	movq	%rsp, %rbp
00000000001c2c2f	pushq	%r15
00000000001c2c31	pushq	%r14
00000000001c2c33	pushq	%r12
00000000001c2c35	pushq	%rbx
00000000001c2c36	cltq
00000000001c2c38	movslq	0x58(%rsi), %rcx
00000000001c2c3c	movslq	0x68(%rsi), %rdx
00000000001c2c40	movslq	0x18(%rsi), %r8
00000000001c2c44	movq	0x30(%rdi), %rdi
00000000001c2c48	movaps	(%rdi), %xmm0
00000000001c2c4b	movq	0x10(%rsi), %rdi
00000000001c2c4f	movq	0x50(%rsi), %r9
00000000001c2c53	movq	0x60(%rsi), %rsi
00000000001c2c57	movslq	%r10d, %r10
00000000001c2c5a	shlq	$0x4, %r8
00000000001c2c5e	shlq	$0x4, %rdx
00000000001c2c62	movq	%rdx, %r11
00000000001c2c65	negq	%r11
00000000001c2c68	shlq	$0x4, %rcx
00000000001c2c6c	movaps	0x69affd(%rip), %xmm1
00000000001c2c73	movaps	0x69b006(%rip), %xmm2
00000000001c2c7a	movaps	0x20735f(%rip), %xmm3
00000000001c2c81	movaps	0x69b008(%rip), %xmm4
00000000001c2c88	nopl	(%rax,%rax)
00000000001c2c90	movq	%r9, %rbx
00000000001c2c93	movq	%rax, %r14
00000000001c2c96	movq	%rsi, %r12
00000000001c2c99	movq	%rdi, %r15
00000000001c2c9c	nopl	(%rax)
00000000001c2ca0	movaps	(%rbx), %xmm5
00000000001c2ca3	movaps	%xmm5, %xmm7
00000000001c2ca6	movaps	%xmm5, %xmm6
00000000001c2ca9	mulps	%xmm5, %xmm7
00000000001c2cac	shufps	$0x0, %xmm5, %xmm6              ## xmm6 = xmm6[0,0],xmm5[0,0]
00000000001c2cb0	movsldup	%xmm5, %xmm8                    ## xmm8 = xmm5[0,0,2,2]
00000000001c2cb5	mulps	%xmm6, %xmm8
00000000001c2cb9	movddup	%xmm7, %xmm7                    ## xmm7 = xmm7[0,0]
00000000001c2cbd	subps	%xmm7, %xmm8
00000000001c2cc1	blendps	$0x3, %xmm5, %xmm8              ## xmm8 = xmm5[0,1],xmm8[2,3]
00000000001c2cc8	addps	%xmm5, %xmm6
00000000001c2ccb	blendps	$0xb, %xmm8, %xmm6              ## xmm6 = xmm8[0,1],xmm6[2],xmm8[3]
00000000001c2cd2	mulps	%xmm1, %xmm6
00000000001c2cd5	movaps	%xmm6, %xmm5
00000000001c2cd8	mulps	%xmm6, %xmm5
00000000001c2cdb	movsldup	%xmm5, %xmm5                    ## xmm5 = xmm5[0,0,2,2]
00000000001c2cdf	subps	%xmm6, %xmm5
00000000001c2ce2	blendps	$0x7, %xmm6, %xmm5              ## xmm5 = xmm6[0,1,2],xmm5[3]
00000000001c2ce8	rsqrtps	%xmm5, %xmm5
00000000001c2ceb	rcpps	%xmm5, %xmm9
00000000001c2cef	blendps	$0x7, %xmm6, %xmm9              ## xmm9 = xmm6[0,1,2],xmm9[3]
00000000001c2cf6	hsubps	%xmm9, %xmm9
00000000001c2cfb	mulps	%xmm2, %xmm9
00000000001c2cff	movsldup	%xmm6, %xmm5                    ## xmm5 = xmm6[0,0,2,2]
00000000001c2d03	subps	%xmm5, %xmm9
00000000001c2d07	shufps	$0x11, %xmm6, %xmm9             ## xmm9 = xmm9[1,0],xmm6[1,0]
00000000001c2d0c	shufps	$0xa2, %xmm6, %xmm9             ## xmm9 = xmm9[2,0],xmm6[2,2]
00000000001c2d11	addps	%xmm3, %xmm9
00000000001c2d15	movaps	%xmm9, %xmm7
00000000001c2d19	mulps	%xmm9, %xmm7
00000000001c2d1d	haddps	%xmm7, %xmm7
00000000001c2d21	movaps	-0x10(%r12,%r11), %xmm5
00000000001c2d27	addps	0x10(%r12,%rdx), %xmm5
00000000001c2d2d	shufps	$0xf0, %xmm9, %xmm6             ## xmm6 = xmm6[0,0],xmm9[3,3]
00000000001c2d32	movsldup	%xmm7, %xmm7                    ## xmm7 = xmm7[0,0,2,2]
00000000001c2d36	rsqrtps	%xmm7, %xmm7
00000000001c2d39	rsqrtps	%xmm6, %xmm8
00000000001c2d3d	mulps	%xmm9, %xmm7
00000000001c2d41	movaps	%xmm8, %xmm6
00000000001c2d45	movaps	%xmm7, %xmm10
00000000001c2d49	movaps	%xmm8, %xmm9
00000000001c2d4d	insertps	$0x9c, %xmm8, %xmm10            ## xmm10 = xmm10[0],xmm8[2],zero,zero
00000000001c2d54	movaps	%xmm8, %xmm11
00000000001c2d58	subps	0x10(%r12,%r11), %xmm5
00000000001c2d5e	blendps	$0x3, %xmm7, %xmm11             ## xmm11 = xmm7[0,1],xmm11[2,3]
00000000001c2d65	mulps	%xmm11, %xmm11
00000000001c2d69	subps	-0x10(%r12,%rdx), %xmm5
00000000001c2d6f	mulps	%xmm4, %xmm5
00000000001c2d72	movaps	%xmm7, %xmm8
00000000001c2d76	movhlps	%xmm9, %xmm9                    ## xmm9 = xmm9[1,1]
00000000001c2d7a	insertps	$0x9c, %xmm11, %xmm9            ## xmm9 = xmm9[0],xmm11[2],zero,zero
00000000001c2d81	mulps	%xmm7, %xmm9
00000000001c2d85	movaps	%xmm7, %xmm12
00000000001c2d89	insertps	$0x8c, %xmm11, %xmm12           ## xmm12 = xmm11[2],xmm12[1],zero,zero
00000000001c2d90	mulps	%xmm7, %xmm9
00000000001c2d94	mulps	%xmm10, %xmm12
00000000001c2d98	mulps	%xmm7, %xmm12
00000000001c2d9c	shufps	$0x55, %xmm7, %xmm7             ## xmm7 = xmm7[1,1,1,1]
00000000001c2da0	shufps	$0x0, %xmm8, %xmm8              ## xmm8 = xmm8[0,0,0,0]
00000000001c2da5	mulps	%xmm7, %xmm8
00000000001c2da9	movaps	(%r12), %xmm7
00000000001c2dae	subps	%xmm11, %xmm6
00000000001c2db2	movaps	0x10(%r12), %xmm10
00000000001c2db8	addps	-0x10(%r12), %xmm10
00000000001c2dbe	shufps	$0xaa, %xmm6, %xmm6             ## xmm6 = xmm6[2,2,2,2]
00000000001c2dc2	movaps	%xmm7, %xmm11
00000000001c2dc6	addps	%xmm7, %xmm11
00000000001c2dca	subps	%xmm11, %xmm10
00000000001c2dce	mulps	%xmm6, %xmm8
00000000001c2dd2	movshdup	%xmm9, %xmm6                    ## xmm6 = xmm9[1,1,3,3]
00000000001c2dd7	addss	%xmm9, %xmm6
00000000001c2ddc	shufps	$0x0, %xmm6, %xmm6              ## xmm6 = xmm6[0,0,0,0]
00000000001c2de0	mulps	%xmm5, %xmm8
00000000001c2de4	movaps	(%r12,%rdx), %xmm5
00000000001c2de9	addps	(%r12,%r11), %xmm5
00000000001c2dee	addps	%xmm8, %xmm8
00000000001c2df2	mulps	%xmm10, %xmm6
00000000001c2df6	subps	%xmm11, %xmm5
00000000001c2dfa	movshdup	%xmm12, %xmm9                   ## xmm9 = xmm12[1,1,3,3]
00000000001c2dff	addps	%xmm8, %xmm6
00000000001c2e03	addss	%xmm12, %xmm9
00000000001c2e08	shufps	$0x0, %xmm9, %xmm9              ## xmm9 = xmm9[0,0,0,0]
00000000001c2e0d	mulps	%xmm5, %xmm9
00000000001c2e11	addq	$0x10, %r12
00000000001c2e15	addps	%xmm6, %xmm9
00000000001c2e19	mulps	%xmm0, %xmm9
00000000001c2e1d	addps	%xmm7, %xmm9
00000000001c2e21	movaps	%xmm9, (%r15)
00000000001c2e25	addq	$0x10, %r15
00000000001c2e29	addq	$0x10, %rbx
00000000001c2e2d	decq	%r14
00000000001c2e30	jne	0x1c2ca0
00000000001c2e36	addq	%r8, %rdi
00000000001c2e39	addq	%rdx, %rsi
00000000001c2e3c	addq	%rcx, %r9
00000000001c2e3f	decq	%r10
00000000001c2e42	jne	0x1c2c90
00000000001c2e48	popq	%rbx
00000000001c2e49	popq	%r12
00000000001c2e4b	popq	%r14
00000000001c2e4d	popq	%r15
00000000001c2e4f	popq	%rbp
00000000001c2e50	xorl	%eax, %eax
00000000001c2e52	retq
00000000001c2e53	nopw	%cs:(%rax,%rax)
