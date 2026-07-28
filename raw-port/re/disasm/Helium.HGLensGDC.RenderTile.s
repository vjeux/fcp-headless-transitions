__ZN9HGLensGDC10RenderTileEP6HGTile:
00000000001e33b0	movl	0xc(%rsi), %eax
00000000001e33b3	subl	0x4(%rsi), %eax
00000000001e33b6	jle	0x1e36aa
00000000001e33bc	movl	0x8(%rsi), %edx
00000000001e33bf	subl	(%rsi), %edx
00000000001e33c1	testl	%edx, %edx
00000000001e33c3	jle	0x1e36aa
00000000001e33c9	pushq	%rbp
00000000001e33ca	movq	%rsp, %rbp
00000000001e33cd	pushq	%r15
00000000001e33cf	pushq	%r14
00000000001e33d1	pushq	%rbx
00000000001e33d2	cvtdq2ps	(%rsi), %xmm2
00000000001e33d5	mulps	0x1e6cd4(%rip), %xmm2
00000000001e33dc	addps	0x1e6cdd(%rip), %xmm2
00000000001e33e3	movshdup	%xmm2, %xmm0                    ## xmm0 = xmm2[1,1,3,3]
00000000001e33e7	movaps	%xmm0, -0x30(%rbp)
00000000001e33eb	movq	0x10(%rsi), %rcx
00000000001e33ef	movl	%edx, %edx
00000000001e33f1	xorl	%r8d, %r8d
00000000001e33f4	xorps	%xmm6, %xmm6
00000000001e33f7	movdqa	0x1e7d31(%rip), %xmm7
00000000001e33ff	pcmpeqd	%xmm8, %xmm8
00000000001e3404	movaps	0x1e6bd4(%rip), %xmm9
00000000001e340c	jmp	0x1e3427
00000000001e340e	nop
00000000001e3410	movslq	0x18(%rsi), %r9
00000000001e3414	shlq	$0x4, %r9
00000000001e3418	addq	%r9, %rcx
00000000001e341b	incl	%r8d
00000000001e341e	cmpl	%eax, %r8d
00000000001e3421	je	0x1e36a4
00000000001e3427	cvtsi2ss	%r8d, %xmm10
00000000001e342c	addss	-0x30(%rbp), %xmm10
00000000001e3432	movq	%rcx, %r9
00000000001e3435	xorl	%r10d, %r10d
00000000001e3438	jmp	0x1e3450
00000000001e343a	nopw	(%rax,%rax)
00000000001e3440	movaps	%xmm0, (%r9)
00000000001e3444	incq	%r10
00000000001e3447	addq	$0x10, %r9
00000000001e344b	cmpq	%r10, %rdx
00000000001e344e	je	0x1e3410
00000000001e3450	xorps	%xmm12, %xmm12
00000000001e3454	cvtsi2ss	%r10d, %xmm12
00000000001e3459	addss	%xmm2, %xmm12
00000000001e345e	insertps	$0x10, %xmm10, %xmm12           ## xmm12 = xmm12[0],xmm10[0],xmm12[2,3]
00000000001e3465	movsd	0x19c(%rdi), %xmm11
00000000001e346e	movups	0x1a8(%rdi), %xmm13
00000000001e3476	movups	0x1b8(%rdi), %xmm14
00000000001e347e	movups	0x1c8(%rdi), %xmm3
00000000001e3485	movsd	0x1dc(%rdi), %xmm0
00000000001e348d	movss	0x1d8(%rdi), %xmm15
00000000001e3496	movlhps	%xmm0, %xmm15                   ## xmm15 = xmm15[0],xmm0[0]
00000000001e349a	shufps	$0xd8, %xmm0, %xmm15            ## xmm15 = xmm15[0,2],xmm0[1,3]
00000000001e349f	movss	0x1e4(%rdi), %xmm5
00000000001e34a7	movss	0x1e8(%rdi), %xmm4
00000000001e34af	subps	%xmm11, %xmm12
00000000001e34b3	movaps	%xmm12, %xmm0
00000000001e34b7	mulps	%xmm12, %xmm0
00000000001e34bb	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
00000000001e34bf	addss	%xmm0, %xmm1
00000000001e34c3	xorps	%xmm0, %xmm0
00000000001e34c6	sqrtss	%xmm1, %xmm0
00000000001e34ca	mulss	0x1a4(%rdi), %xmm0
00000000001e34d2	movaps	%xmm5, %xmm1
00000000001e34d5	maxss	%xmm0, %xmm1
00000000001e34d9	cmpunordss	%xmm0, %xmm0
00000000001e34de	blendvps	%xmm0, %xmm5, %xmm1
00000000001e34e3	movaps	%xmm4, %xmm5
00000000001e34e6	minss	%xmm1, %xmm5
00000000001e34ea	cmpunordss	%xmm1, %xmm1
00000000001e34ef	movaps	%xmm1, %xmm0
00000000001e34f2	blendvps	%xmm0, %xmm4, %xmm5
00000000001e34f7	movaps	%xmm5, %xmm1
00000000001e34fa	mulss	%xmm5, %xmm1
00000000001e34fe	movss	0x1e47ba(%rip), %xmm0
00000000001e3506	insertps	$0x10, %xmm5, %xmm0             ## xmm0 = xmm0[0],xmm5[0],xmm0[2,3]
00000000001e350c	mulss	%xmm1, %xmm5
00000000001e3510	insertps	$0x20, %xmm1, %xmm0             ## xmm0 = xmm0[0,1],xmm1[0],xmm0[3]
00000000001e3516	mulss	%xmm1, %xmm1
00000000001e351a	mulps	%xmm0, %xmm15
00000000001e351e	insertps	$0x30, %xmm5, %xmm0             ## xmm0 = xmm0[0,1,2],xmm5[0]
00000000001e3524	mulps	%xmm0, %xmm3
00000000001e3527	movaps	%xmm3, %xmm4
00000000001e352a	unpckhpd	%xmm3, %xmm4                    ## xmm4 = xmm4[1],xmm3[1]
00000000001e352e	addps	%xmm3, %xmm4
00000000001e3531	movshdup	%xmm15, %xmm3                   ## xmm3 = xmm15[1,1,3,3]
00000000001e3536	addps	%xmm15, %xmm3
00000000001e353a	blendps	$0x3, %xmm4, %xmm15             ## xmm15 = xmm4[0,1],xmm15[2,3]
00000000001e3541	shufps	$0xe2, %xmm15, %xmm15           ## xmm15 = xmm15[2,0,2,3]
00000000001e3546	blendps	$0x2, %xmm4, %xmm3              ## xmm3 = xmm3[0],xmm4[1],xmm3[2,3]
00000000001e354c	addps	%xmm15, %xmm3
00000000001e3550	movaps	%xmm1, %xmm4
00000000001e3553	mulss	%xmm3, %xmm4
00000000001e3557	movshdup	%xmm3, %xmm3                    ## xmm3 = xmm3[1,1,3,3]
00000000001e355b	addss	%xmm4, %xmm3
00000000001e355f	mulss	%xmm1, %xmm3
00000000001e3563	mulps	%xmm0, %xmm14
00000000001e3567	movaps	%xmm14, %xmm4
00000000001e356b	unpckhpd	%xmm14, %xmm4                   ## xmm4 = xmm4[1],xmm14[1]
00000000001e3570	addps	%xmm14, %xmm4
00000000001e3574	movshdup	%xmm4, %xmm5                    ## xmm5 = xmm4[1,1,3,3]
00000000001e3578	addss	%xmm4, %xmm5
00000000001e357c	addss	%xmm3, %xmm5
00000000001e3580	mulss	%xmm1, %xmm5
00000000001e3584	mulps	%xmm13, %xmm0
00000000001e3588	movaps	%xmm0, %xmm1
00000000001e358b	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
00000000001e358f	addps	%xmm0, %xmm1
00000000001e3592	movshdup	%xmm1, %xmm0                    ## xmm0 = xmm1[1,1,3,3]
00000000001e3596	addss	%xmm1, %xmm0
00000000001e359a	addss	%xmm5, %xmm0
00000000001e359e	movsldup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,2,2]
00000000001e35a2	cmpb	$0x0, 0x1ec(%rdi)
00000000001e35a9	jne	0x1e35c0
00000000001e35ab	mulps	%xmm0, %xmm12
00000000001e35af	jmp	0x1e35c4
00000000001e35b1	nopw	%cs:(%rax,%rax)
00000000001e35c0	divps	%xmm0, %xmm12
00000000001e35c4	addps	%xmm12, %xmm11
00000000001e35c8	movaps	%xmm11, %xmm0
00000000001e35cc	addps	0x1e6a2d(%rip), %xmm0
00000000001e35d3	cvttps2dq	%xmm0, %xmm1
00000000001e35d7	cmpltps	%xmm6, %xmm0
00000000001e35db	paddd	%xmm1, %xmm0
00000000001e35df	movdqa	0xd0(%rsi), %xmm1
00000000001e35e7	paddd	%xmm7, %xmm1
00000000001e35eb	pshufd	$0xee, %xmm1, %xmm3             ## xmm3 = xmm1[2,3,2,3]
00000000001e35f0	pcmpgtd	%xmm0, %xmm1
00000000001e35f4	pcmpgtd	%xmm0, %xmm3
00000000001e35f8	pxor	%xmm8, %xmm3
00000000001e35fd	punpcklqdq	%xmm3, %xmm1            ## xmm1 = xmm1[0],xmm3[0]
00000000001e3601	movmskps	%xmm1, %r11d
00000000001e3605	movaps	%xmm9, %xmm0
00000000001e3609	testl	%r11d, %r11d
00000000001e360c	jne	0x1e3440
00000000001e3612	movq	%xmm11, %xmm0                   ## xmm0 = xmm11[0],zero
00000000001e3617	movq	0x50(%rsi), %rbx
00000000001e361b	movslq	0x58(%rsi), %r11
00000000001e361f	subps	%xmm2, %xmm0
00000000001e3622	cvttps2dq	%xmm0, %xmm1
00000000001e3626	movaps	%xmm0, %xmm3
00000000001e3629	cmpltps	%xmm6, %xmm3
00000000001e362d	paddd	%xmm1, %xmm3
00000000001e3631	cvtdq2ps	%xmm3, %xmm1
00000000001e3634	subps	%xmm1, %xmm0
00000000001e3637	movd	%xmm3, %r14d
00000000001e363c	pextrd	$0x1, %xmm3, %r15d
00000000001e3643	imull	%r11d, %r15d
00000000001e3647	addl	%r14d, %r15d
00000000001e364a	movslq	%r15d, %r14
00000000001e364d	shlq	$0x4, %r14
00000000001e3651	leaq	(%rbx,%r14), %r15
00000000001e3655	movaps	%xmm0, %xmm1
00000000001e3658	shufps	$0x0, %xmm0, %xmm1              ## xmm1 = xmm1[0,0],xmm0[0,0]
00000000001e365c	movaps	(%rbx,%r14), %xmm3
00000000001e3661	movaps	0x10(%rbx,%r14), %xmm4
00000000001e3667	subps	%xmm3, %xmm4
00000000001e366a	mulps	%xmm1, %xmm4
00000000001e366d	addps	%xmm3, %xmm4
00000000001e3670	shlq	$0x4, %r11
00000000001e3674	movaps	(%r11,%r15), %xmm3
00000000001e3679	movaps	0x10(%r11,%r15), %xmm5
00000000001e367f	subps	%xmm3, %xmm5
00000000001e3682	mulps	%xmm1, %xmm5
00000000001e3685	addps	%xmm3, %xmm5
00000000001e3688	subps	%xmm4, %xmm5
00000000001e368b	shufps	$0x55, %xmm0, %xmm0             ## xmm0 = xmm0[1,1,1,1]
00000000001e368f	mulps	%xmm5, %xmm0
00000000001e3692	addps	%xmm4, %xmm0
00000000001e3695	insertps	$0x30, 0x1e4621(%rip), %xmm0    ## xmm0 = xmm0[0,1,2],mem[0]
00000000001e369f	jmp	0x1e3440
00000000001e36a4	popq	%rbx
00000000001e36a5	popq	%r14
00000000001e36a7	popq	%r15
00000000001e36a9	popq	%rbp
00000000001e36aa	xorl	%eax, %eax
00000000001e36ac	retq
00000000001e36ad	nopl	(%rax)
