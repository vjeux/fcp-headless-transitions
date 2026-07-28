__ZN17HGApplyNDLUTEntry8CopyDataEPK16HGApplyNDLUTInfo:
000000000003d9b0	pushq	%rbp
000000000003d9b1	movq	%rsp, %rbp
000000000003d9b4	pushq	%r15
000000000003d9b6	pushq	%r14
000000000003d9b8	pushq	%r13
000000000003d9ba	pushq	%r12
000000000003d9bc	pushq	%rbx
000000000003d9bd	subq	$0xa8, %rsp
000000000003d9c4	movq	%rsi, %rbx
000000000003d9c7	movq	%rdi, -0x70(%rbp)
000000000003d9cb	movq	0x8(%rsi), %r14
000000000003d9cf	movq	0x10(%rsi), %rcx
000000000003d9d3	movss	0x18(%rsi), %xmm1
000000000003d9d8	movq	%r14, %rax
000000000003d9db	decq	%rax
000000000003d9de	js	0x3d9e7
000000000003d9e0	cvtsi2ss	%rax, %xmm0
000000000003d9e5	jmp	0x3d9fc
000000000003d9e7	movq	%rax, %rdx
000000000003d9ea	shrq	%rdx
000000000003d9ed	andl	$0x1, %eax
000000000003d9f0	orq	%rdx, %rax
000000000003d9f3	cvtsi2ss	%rax, %xmm0
000000000003d9f8	addss	%xmm0, %xmm0
000000000003d9fc	divss	%xmm0, %xmm1
000000000003da00	movss	0x1c(%rbx), %xmm5
000000000003da05	movl	$0x0, -0x38(%rbp)
000000000003da0c	movl	$0x0, -0x34(%rbp)
000000000003da13	movl	$0x0, -0x2c(%rbp)
000000000003da1a	movl	$0x0, -0x30(%rbp)
000000000003da21	movq	-0x70(%rbp), %rax
000000000003da25	movq	0x18(%rax), %rax
000000000003da29	movl	0x10(%rax), %edx
000000000003da2c	cmpq	$0x1, %rcx
000000000003da30	movaps	%xmm1, -0xc0(%rbp)
000000000003da37	movaps	%xmm5, -0xb0(%rbp)
000000000003da3e	jne	0x3db40
000000000003da44	movq	0x50(%rax), %r15
000000000003da48	cmpl	$0x1b, %edx
000000000003da4b	jne	0x3dd0a
000000000003da51	testq	%r14, %r14
000000000003da54	je	0x3e099
000000000003da5a	xorps	%xmm2, %xmm2
000000000003da5d	leaq	-0x30(%rbp), %r13
000000000003da61	movq	%r15, %r12
000000000003da64	nopw	%cs:(%rax,%rax)
000000000003da70	movss	%xmm2, -0x48(%rbp)
000000000003da75	movaps	%xmm1, %xmm0
000000000003da78	mulss	%xmm2, %xmm0
000000000003da7c	addss	%xmm5, %xmm0
000000000003da80	movq	(%rbx), %rax
000000000003da83	xorps	%xmm1, %xmm1
000000000003da86	xorps	%xmm2, %xmm2
000000000003da89	movq	%rbx, %rdi
000000000003da8c	leaq	-0x38(%rbp), %rsi
000000000003da90	leaq	-0x34(%rbp), %rdx
000000000003da94	leaq	-0x2c(%rbp), %rcx
000000000003da98	movq	%r13, %r8
000000000003da9b	callq	*0x20(%rax)
000000000003da9e	movss	-0x38(%rbp), %xmm0
000000000003daa3	insertps	$0x10, -0x34(%rbp), %xmm0       ## xmm0 = xmm0[0],mem[0],xmm0[2,3]
000000000003daaa	insertps	$0x20, -0x2c(%rbp), %xmm0       ## xmm0 = xmm0[0,1],mem[0],xmm0[3]
000000000003dab1	insertps	$0x30, -0x30(%rbp), %xmm0       ## xmm0 = xmm0[0,1,2],mem[0]
000000000003dab8	leaq	0x8(%r12), %r15
000000000003dabd	movaps	0x38d02c(%rip), %xmm1
000000000003dac4	maxps	%xmm0, %xmm1
000000000003dac7	movaps	0x38d032(%rip), %xmm2
000000000003dace	minps	%xmm1, %xmm2
000000000003dad1	mulps	0x38d038(%rip), %xmm2
000000000003dad8	movaps	%xmm2, %xmm1
000000000003dadb	psrld	$0xd, %xmm1
000000000003dae0	psrld	$0x10, %xmm2
000000000003dae5	movdqa	%xmm2, %xmm3
000000000003dae9	pblendw	$0xcc, %xmm1, %xmm3             ## xmm3 = xmm3[0,1],xmm1[2,3],xmm3[4,5],xmm1[6,7]
000000000003daef	pand	0x38d029(%rip), %xmm3
000000000003daf7	pblendw	$0x33, %xmm1, %xmm2             ## xmm2 = xmm1[0,1],xmm2[2,3],xmm1[4,5],xmm2[6,7]
000000000003dafd	movaps	-0xc0(%rbp), %xmm1
000000000003db04	pand	0x38d024(%rip), %xmm2
000000000003db0c	por	%xmm3, %xmm2
000000000003db10	packusdw	%xmm2, %xmm2
000000000003db15	movq	%xmm2, (%r12)
000000000003db1b	movss	-0x48(%rbp), %xmm2
000000000003db20	movaps	-0xb0(%rbp), %xmm5
000000000003db27	addss	0x38a191(%rip), %xmm2
000000000003db2f	movq	%r15, %r12
000000000003db32	decq	%r14
000000000003db35	jne	0x3da70
000000000003db3b	jmp	0x3e09c
000000000003db40	cmpl	$0x19, %edx
000000000003db43	movq	%r14, -0x48(%rbp)
000000000003db47	movq	%rbx, -0x78(%rbp)
000000000003db4b	je	0x3df16
000000000003db51	cmpl	$0x1c, %edx
000000000003db54	je	0x3dda1
000000000003db5a	cmpl	$0x1b, %edx
000000000003db5d	jne	0x3e11d
000000000003db63	cmpq	$0x0, -0x48(%rbp)
000000000003db68	je	0x3e11d
000000000003db6e	movq	0x50(%rax), %rax
000000000003db72	movq	%rax, -0x50(%rbp)
000000000003db76	xorl	%edx, %edx
000000000003db78	leaq	-0x38(%rbp), %r14
000000000003db7c	leaq	-0x34(%rbp), %rbx
000000000003db80	leaq	-0x2c(%rbp), %r12
000000000003db84	leaq	-0x30(%rbp), %r13
000000000003db88	nopl	(%rax,%rax)
000000000003db90	movq	-0x70(%rbp), %rax
000000000003db94	movq	0x18(%rax), %rax
000000000003db98	movq	0x40(%rax), %rax
000000000003db9c	imulq	%rdx, %rax
000000000003dba0	movq	%rdx, -0x58(%rbp)
000000000003dba4	xorps	%xmm2, %xmm2
000000000003dba7	cvtsi2ss	%edx, %xmm2
000000000003dbab	addq	-0x50(%rbp), %rax
000000000003dbaf	mulss	%xmm1, %xmm2
000000000003dbb3	addss	%xmm5, %xmm2
000000000003dbb7	xorl	%edx, %edx
000000000003dbb9	movss	%xmm2, -0xa0(%rbp)
000000000003dbc1	nopw	%cs:(%rax,%rax)
000000000003dbd0	movq	%rdx, -0x90(%rbp)
000000000003dbd7	xorps	%xmm0, %xmm0
000000000003dbda	cvtsi2ss	%edx, %xmm0
000000000003dbde	mulss	%xmm1, %xmm0
000000000003dbe2	addss	%xmm5, %xmm0
000000000003dbe6	movss	%xmm0, -0x3c(%rbp)
000000000003dbeb	xorl	%esi, %esi
000000000003dbed	xorl	%r15d, %r15d
000000000003dbf0	movq	%rax, -0x60(%rbp)
000000000003dbf4	nopw	%cs:(%rax,%rax)
000000000003dc00	movq	%rsi, -0x68(%rbp)
000000000003dc04	xorps	%xmm0, %xmm0
000000000003dc07	cvtsi2ss	%r15d, %xmm0
000000000003dc0c	mulss	%xmm1, %xmm0
000000000003dc10	addss	%xmm5, %xmm0
000000000003dc14	movq	-0x78(%rbp), %rdi
000000000003dc18	movq	(%rdi), %rax
000000000003dc1b	movss	-0x3c(%rbp), %xmm1
000000000003dc20	movq	%r14, %rsi
000000000003dc23	movq	%rbx, %rdx
000000000003dc26	movq	%r12, %rcx
000000000003dc29	movq	%r13, %r8
000000000003dc2c	callq	*0x20(%rax)
000000000003dc2f	movq	-0x68(%rbp), %rsi
000000000003dc33	movq	-0x60(%rbp), %rax
000000000003dc37	movaps	0x38ced2(%rip), %xmm3
000000000003dc3e	movaps	0x38cebb(%rip), %xmm2
000000000003dc45	movaps	0x38cea4(%rip), %xmm1
000000000003dc4c	movss	-0x38(%rbp), %xmm0
000000000003dc51	insertps	$0x10, -0x34(%rbp), %xmm0       ## xmm0 = xmm0[0],mem[0],xmm0[2,3]
000000000003dc58	insertps	$0x20, -0x2c(%rbp), %xmm0       ## xmm0 = xmm0[0,1],mem[0],xmm0[3]
000000000003dc5f	insertps	$0x30, -0x30(%rbp), %xmm0       ## xmm0 = xmm0[0,1,2],mem[0]
000000000003dc66	maxps	%xmm0, %xmm1
000000000003dc69	movaps	%xmm2, %xmm0
000000000003dc6c	minps	%xmm1, %xmm0
000000000003dc6f	mulps	%xmm3, %xmm0
000000000003dc72	movdqa	0x38cea6(%rip), %xmm3
000000000003dc7a	movaps	%xmm0, %xmm1
000000000003dc7d	psrld	$0xd, %xmm1
000000000003dc82	psrld	$0x10, %xmm0
000000000003dc87	movdqa	%xmm0, %xmm4
000000000003dc8b	pblendw	$0xcc, %xmm1, %xmm4             ## xmm4 = xmm4[0,1],xmm1[2,3],xmm4[4,5],xmm1[6,7]
000000000003dc91	pand	%xmm3, %xmm4
000000000003dc95	movdqa	0x38ce93(%rip), %xmm3
000000000003dc9d	pblendw	$0x33, %xmm1, %xmm0             ## xmm0 = xmm1[0,1],xmm0[2,3],xmm1[4,5],xmm0[6,7]
000000000003dca3	movaps	-0xc0(%rbp), %xmm1
000000000003dcaa	pand	%xmm3, %xmm0
000000000003dcae	movss	-0xa0(%rbp), %xmm2
000000000003dcb6	por	%xmm4, %xmm0
000000000003dcba	movaps	-0xb0(%rbp), %xmm5
000000000003dcc1	packusdw	%xmm0, %xmm0
000000000003dcc6	movq	%xmm0, (%rax,%r15,8)
000000000003dccc	incq	%r15
000000000003dccf	addq	$-0x8, %rsi
000000000003dcd3	cmpq	%r15, -0x48(%rbp)
000000000003dcd7	jne	0x3dc00
000000000003dcdd	movq	-0x90(%rbp), %rdx
000000000003dce4	incq	%rdx
000000000003dce7	subq	%rsi, %rax
000000000003dcea	cmpq	-0x48(%rbp), %rdx
000000000003dcee	jne	0x3dbd0
000000000003dcf4	movq	-0x58(%rbp), %rdx
000000000003dcf8	incq	%rdx
000000000003dcfb	cmpq	-0x48(%rbp), %rdx
000000000003dcff	jne	0x3db90
000000000003dd05	jmp	0x3e11d
000000000003dd0a	testq	%r14, %r14
000000000003dd0d	je	0x3e0f4
000000000003dd13	xorps	%xmm2, %xmm2
000000000003dd16	leaq	-0x2c(%rbp), %r12
000000000003dd1a	leaq	-0x30(%rbp), %r13
000000000003dd1e	nop
000000000003dd20	movss	%xmm2, -0x48(%rbp)
000000000003dd25	movaps	%xmm1, %xmm0
000000000003dd28	mulss	%xmm2, %xmm0
000000000003dd2c	addss	%xmm5, %xmm0
000000000003dd30	movq	(%rbx), %rax
000000000003dd33	xorps	%xmm1, %xmm1
000000000003dd36	xorps	%xmm2, %xmm2
000000000003dd39	movq	%rbx, %rdi
000000000003dd3c	leaq	-0x38(%rbp), %rsi
000000000003dd40	leaq	-0x34(%rbp), %rdx
000000000003dd44	movq	%r12, %rcx
000000000003dd47	movq	%r13, %r8
000000000003dd4a	callq	*0x20(%rax)
000000000003dd4d	movss	-0x48(%rbp), %xmm2
000000000003dd52	movaps	-0xb0(%rbp), %xmm5
000000000003dd59	movss	-0x38(%rbp), %xmm0
000000000003dd5e	movss	%xmm0, (%r15)
000000000003dd63	movss	-0x34(%rbp), %xmm1
000000000003dd68	movss	%xmm1, 0x4(%r15)
000000000003dd6e	movss	-0x2c(%rbp), %xmm1
000000000003dd73	movss	%xmm1, 0x8(%r15)
000000000003dd79	movss	-0x30(%rbp), %xmm1
000000000003dd7e	movss	%xmm1, 0xc(%r15)
000000000003dd84	movaps	-0xc0(%rbp), %xmm1
000000000003dd8b	addq	$0x10, %r15
000000000003dd8f	addss	0x389f29(%rip), %xmm2
000000000003dd97	decq	%r14
000000000003dd9a	jne	0x3dd20
000000000003dd9c	jmp	0x3e0f7
000000000003dda1	testq	%r14, %r14
000000000003dda4	je	0x3e11d
000000000003ddaa	movq	0x50(%rax), %rax
000000000003ddae	movq	%rax, -0xc8(%rbp)
000000000003ddb5	movsldup	%xmm5, %xmm3                    ## xmm3 = xmm5[0,0,2,2]
000000000003ddb9	movsldup	%xmm1, %xmm4                    ## xmm4 = xmm1[0,0,2,2]
000000000003ddbd	xorl	%edx, %edx
000000000003ddbf	leaq	-0x38(%rbp), %r13
000000000003ddc3	leaq	-0x34(%rbp), %r14
000000000003ddc7	leaq	-0x2c(%rbp), %rcx
000000000003ddcb	leaq	-0x30(%rbp), %rbx
000000000003ddcf	movaps	%xmm3, -0xa0(%rbp)
000000000003ddd6	movaps	%xmm4, -0x90(%rbp)
000000000003dddd	movq	-0x78(%rbp), %r15
000000000003dde1	nopw	%cs:(%rax,%rax)
000000000003ddf0	movq	-0x70(%rbp), %rax
000000000003ddf4	movq	0x18(%rax), %rax
000000000003ddf8	movq	0x40(%rax), %rsi
000000000003ddfc	imulq	%rdx, %rsi
000000000003de00	movq	%rdx, -0x50(%rbp)
000000000003de04	xorps	%xmm2, %xmm2
000000000003de07	cvtsi2ss	%edx, %xmm2
000000000003de0b	addq	-0xc8(%rbp), %rsi
000000000003de12	mulss	%xmm1, %xmm2
000000000003de16	addss	%xmm5, %xmm2
000000000003de1a	xorl	%edx, %edx
000000000003de1c	movss	%xmm2, -0x3c(%rbp)
000000000003de21	nopw	%cs:(%rax,%rax)
000000000003de30	movq	%rdx, -0x58(%rbp)
000000000003de34	xorps	%xmm0, %xmm0
000000000003de37	cvtsi2ss	%edx, %xmm0
000000000003de3b	mulss	%xmm1, %xmm0
000000000003de3f	addss	%xmm5, %xmm0
000000000003de43	movss	%xmm0, -0x60(%rbp)
000000000003de48	xorl	%r12d, %r12d
000000000003de4b	nopl	(%rax,%rax)
000000000003de50	movq	%rsi, -0x68(%rbp)
000000000003de54	xorps	%xmm0, %xmm0
000000000003de57	cvtsi2ss	%r12d, %xmm0
000000000003de5c	mulss	%xmm1, %xmm0
000000000003de60	addss	%xmm5, %xmm0
000000000003de64	movq	(%r15), %rax
000000000003de67	movq	%r15, %rdi
000000000003de6a	movss	-0x60(%rbp), %xmm1
000000000003de6f	movss	-0x3c(%rbp), %xmm2
000000000003de74	movq	%r13, %rsi
000000000003de77	movq	%r14, %rdx
000000000003de7a	movq	%rbx, %r8
000000000003de7d	callq	*0x20(%rax)
000000000003de80	movq	-0x68(%rbp), %rsi
000000000003de84	movq	-0x48(%rbp), %rax
000000000003de88	leaq	-0x2c(%rbp), %rcx
000000000003de8c	movaps	-0x90(%rbp), %xmm4
000000000003de93	movaps	-0xa0(%rbp), %xmm3
000000000003de9a	movaps	-0xb0(%rbp), %xmm5
000000000003dea1	movaps	-0xc0(%rbp), %xmm1
000000000003dea8	movss	-0x38(%rbp), %xmm0
000000000003dead	subss	%xmm5, %xmm0
000000000003deb1	divss	%xmm1, %xmm0
000000000003deb5	movss	%xmm0, (%rsi)
000000000003deb9	movss	-0x34(%rbp), %xmm0
000000000003debe	insertps	$0x10, -0x2c(%rbp), %xmm0       ## xmm0 = xmm0[0],mem[0],xmm0[2,3]
000000000003dec5	subps	%xmm3, %xmm0
000000000003dec8	divps	%xmm4, %xmm0
000000000003decb	movlps	%xmm0, 0x4(%rsi)
000000000003decf	movss	-0x30(%rbp), %xmm0
000000000003ded4	subss	%xmm5, %xmm0
000000000003ded8	divss	%xmm1, %xmm0
000000000003dedc	movss	%xmm0, 0xc(%rsi)
000000000003dee1	addq	$0x10, %rsi
000000000003dee5	incq	%r12
000000000003dee8	cmpq	%r12, %rax
000000000003deeb	jne	0x3de50
000000000003def1	movq	-0x58(%rbp), %rdx
000000000003def5	incq	%rdx
000000000003def8	cmpq	%rax, %rdx
000000000003defb	jne	0x3de30
000000000003df01	movq	-0x50(%rbp), %rdx
000000000003df05	incq	%rdx
000000000003df08	cmpq	%rax, %rdx
000000000003df0b	jne	0x3ddf0
000000000003df11	jmp	0x3e11d
000000000003df16	testq	%r14, %r14
000000000003df19	je	0x3e11d
000000000003df1f	movq	0x50(%rax), %rax
000000000003df23	movq	%rax, -0x50(%rbp)
000000000003df27	xorl	%edx, %edx
000000000003df29	leaq	-0x38(%rbp), %r14
000000000003df2d	leaq	-0x34(%rbp), %r15
000000000003df31	leaq	-0x2c(%rbp), %rcx
000000000003df35	leaq	-0x30(%rbp), %r12
000000000003df39	movq	-0x78(%rbp), %rbx
000000000003df3d	nopl	(%rax)
000000000003df40	movq	-0x70(%rbp), %rax
000000000003df44	movq	0x18(%rax), %rax
000000000003df48	movq	0x40(%rax), %rax
000000000003df4c	imulq	%rdx, %rax
000000000003df50	movq	%rdx, -0x58(%rbp)
000000000003df54	xorps	%xmm2, %xmm2
000000000003df57	cvtsi2ss	%edx, %xmm2
000000000003df5b	addq	-0x50(%rbp), %rax
000000000003df5f	mulss	%xmm1, %xmm2
000000000003df63	addss	%xmm5, %xmm2
000000000003df67	xorl	%edx, %edx
000000000003df69	movss	%xmm2, -0xa0(%rbp)
000000000003df71	nopw	%cs:(%rax,%rax)
000000000003df80	movq	%rdx, -0x90(%rbp)
000000000003df87	xorps	%xmm0, %xmm0
000000000003df8a	cvtsi2ss	%edx, %xmm0
000000000003df8e	mulss	%xmm1, %xmm0
000000000003df92	addss	%xmm5, %xmm0
000000000003df96	movss	%xmm0, -0x3c(%rbp)
000000000003df9b	xorl	%edi, %edi
000000000003df9d	xorl	%r13d, %r13d
000000000003dfa0	movq	%rax, -0x60(%rbp)
000000000003dfa4	nopw	%cs:(%rax,%rax)
000000000003dfb0	movq	%rdi, -0x68(%rbp)
000000000003dfb4	xorps	%xmm0, %xmm0
000000000003dfb7	cvtsi2ss	%r13d, %xmm0
000000000003dfbc	mulss	%xmm1, %xmm0
000000000003dfc0	addss	%xmm5, %xmm0
000000000003dfc4	movq	(%rbx), %rax
000000000003dfc7	movq	%rbx, %rdi
000000000003dfca	movss	-0x3c(%rbp), %xmm1
000000000003dfcf	movss	-0xa0(%rbp), %xmm2
000000000003dfd7	movq	%r14, %rsi
000000000003dfda	movq	%r15, %rdx
000000000003dfdd	movq	%r12, %r8
000000000003dfe0	callq	*0x20(%rax)
000000000003dfe3	movq	-0x68(%rbp), %rdi
000000000003dfe7	movq	-0x48(%rbp), %rsi
000000000003dfeb	movq	-0x60(%rbp), %rax
000000000003dfef	movaps	0x389c4a(%rip), %xmm3
000000000003dff6	leaq	-0x2c(%rbp), %rcx
000000000003dffa	movaps	-0xb0(%rbp), %xmm5
000000000003e001	movaps	-0xc0(%rbp), %xmm1
000000000003e008	movss	-0x38(%rbp), %xmm0
000000000003e00d	insertps	$0x10, -0x34(%rbp), %xmm0       ## xmm0 = xmm0[0],mem[0],xmm0[2,3]
000000000003e014	insertps	$0x20, -0x2c(%rbp), %xmm0       ## xmm0 = xmm0[0,1],mem[0],xmm0[3]
000000000003e01b	insertps	$0x30, -0x30(%rbp), %xmm0       ## xmm0 = xmm0[0,1,2],mem[0]
000000000003e022	minps	%xmm3, %xmm0
000000000003e025	xorps	%xmm3, %xmm3
000000000003e028	maxps	%xmm3, %xmm0
000000000003e02b	movaps	0x38d21e(%rip), %xmm3
000000000003e032	mulps	%xmm3, %xmm0
000000000003e035	extractps	$0x1, %xmm0, -0x34(%rbp)
000000000003e03c	extractps	$0x2, %xmm0, -0x2c(%rbp)
000000000003e043	extractps	$0x3, %xmm0, -0x30(%rbp)
000000000003e04a	movss	%xmm0, -0x38(%rbp)
000000000003e04f	cvttps2dq	%xmm0, %xmm0
000000000003e053	packusdw	%xmm0, %xmm0
000000000003e058	movq	%xmm0, (%rax,%r13,8)
000000000003e05e	incq	%r13
000000000003e061	addq	$-0x8, %rdi
000000000003e065	cmpq	%r13, %rsi
000000000003e068	jne	0x3dfb0
000000000003e06e	movq	-0x90(%rbp), %rdx
000000000003e075	incq	%rdx
000000000003e078	subq	%rdi, %rax
000000000003e07b	cmpq	%rsi, %rdx
000000000003e07e	jne	0x3df80
000000000003e084	movq	-0x58(%rbp), %rdx
000000000003e088	incq	%rdx
000000000003e08b	cmpq	%rsi, %rdx
000000000003e08e	jne	0x3df40
000000000003e094	jmp	0x3e11d
000000000003e099	xorps	%xmm0, %xmm0
000000000003e09c	movaps	0x38ca4d(%rip), %xmm1
000000000003e0a3	maxps	%xmm0, %xmm1
000000000003e0a6	movaps	0x38ca53(%rip), %xmm0
000000000003e0ad	minps	%xmm1, %xmm0
000000000003e0b0	mulps	0x38ca59(%rip), %xmm0
000000000003e0b7	movaps	%xmm0, %xmm1
000000000003e0ba	psrld	$0xd, %xmm1
000000000003e0bf	psrld	$0x10, %xmm0
000000000003e0c4	movdqa	%xmm0, %xmm2
000000000003e0c8	pblendw	$0xcc, %xmm1, %xmm2             ## xmm2 = xmm2[0,1],xmm1[2,3],xmm2[4,5],xmm1[6,7]
000000000003e0ce	pand	0x38ca4a(%rip), %xmm2
000000000003e0d6	pblendw	$0x33, %xmm1, %xmm0             ## xmm0 = xmm1[0,1],xmm0[2,3],xmm1[4,5],xmm0[6,7]
000000000003e0dc	pand	0x38ca4c(%rip), %xmm0
000000000003e0e4	por	%xmm2, %xmm0
000000000003e0e8	packusdw	%xmm0, %xmm0
000000000003e0ed	movq	%xmm0, (%r15)
000000000003e0f2	jmp	0x3e11d
000000000003e0f4	xorps	%xmm0, %xmm0
000000000003e0f7	movss	%xmm0, (%r15)
000000000003e0fc	movss	-0x34(%rbp), %xmm0
000000000003e101	movss	%xmm0, 0x4(%r15)
000000000003e107	movss	-0x2c(%rbp), %xmm0
000000000003e10c	movss	%xmm0, 0x8(%r15)
000000000003e112	movss	-0x30(%rbp), %xmm0
000000000003e117	movss	%xmm0, 0xc(%r15)
000000000003e11d	addq	$0xa8, %rsp
000000000003e124	popq	%rbx
000000000003e125	popq	%r12
000000000003e127	popq	%r13
000000000003e129	popq	%r14
000000000003e12b	popq	%r15
000000000003e12d	popq	%rbp
000000000003e12e	retq
000000000003e12f	nop
