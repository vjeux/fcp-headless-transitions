__ZN24HgcBT2100_PQ_InverseOETF10RenderTileEP6HGTile:
00000000003ad780	pushq	%rbp
00000000003ad781	movq	%rsp, %rbp
00000000003ad784	pushq	%r14
00000000003ad786	pushq	%rbx
00000000003ad787	subq	$0xf0, %rsp
00000000003ad78e	movq	%rsi, %r14
00000000003ad791	movq	%rdi, %rbx
00000000003ad794	movq	%rsi, %rdi
00000000003ad797	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
00000000003ad79c	movq	%rax, %rdi
00000000003ad79f	xorl	%esi, %esi
00000000003ad7a1	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
00000000003ad7a6	cmpl	$0x4700000, %eax                ## imm = 0x4700000
00000000003ad7ab	jb	0x3ad7c6
00000000003ad7ad	movq	%rbx, %rdi
00000000003ad7b0	movq	%r14, %rsi
00000000003ad7b3	callq	__ZN24HgcBT2100_PQ_InverseOETF14RenderTile_AVXEP6HGTile ## HgcBT2100_PQ_InverseOETF::RenderTile_AVX(HGTile*)
00000000003ad7b8	xorl	%eax, %eax
00000000003ad7ba	addq	$0xf0, %rsp
00000000003ad7c1	popq	%rbx
00000000003ad7c2	popq	%r14
00000000003ad7c4	popq	%rbp
00000000003ad7c5	retq
00000000003ad7c6	movl	0x8(%r14), %r9d
00000000003ad7ca	subl	(%r14), %r9d
00000000003ad7cd	movl	0xc(%r14), %ecx
00000000003ad7d1	subl	0x4(%r14), %ecx
00000000003ad7d5	movslq	0x58(%r14), %rdx
00000000003ad7d9	movq	0x50(%r14), %rsi
00000000003ad7dd	movq	0x10(%r14), %rdi
00000000003ad7e1	movslq	0x18(%r14), %r8
00000000003ad7e5	cmpl	$0x44fffff, %eax                ## imm = 0x44FFFFF
00000000003ad7ea	jbe	0x3add12
00000000003ad7f0	testl	%ecx, %ecx
00000000003ad7f2	jle	0x3ad7b8
00000000003ad7f4	testl	%r9d, %r9d
00000000003ad7f7	jle	0x3ad7b8
00000000003ad7f9	movl	%r9d, %eax
00000000003ad7fc	shlq	$0x4, %rdx
00000000003ad800	shlq	$0x4, %r8
00000000003ad804	shlq	$0x4, %rax
00000000003ad808	xorl	%r9d, %r9d
00000000003ad80b	nopl	(%rax,%rax)
00000000003ad810	xorl	%r10d, %r10d
00000000003ad813	nopw	%cs:(%rax,%rax)
00000000003ad820	movaps	(%rsi,%r10), %xmm13
00000000003ad825	movq	0x198(%rbx), %r11
00000000003ad82c	movaps	0x20(%r11), %xmm8
00000000003ad831	movaps	%xmm8, -0xd0(%rbp)
00000000003ad839	movaps	0x60(%r11), %xmm14
00000000003ad83e	maxps	%xmm14, %xmm13
00000000003ad842	movaps	0x80(%r11), %xmm5
00000000003ad84a	shufps	$0x55, %xmm8, %xmm8             ## xmm8 = xmm8[1,1,1,1]
00000000003ad84f	minps	%xmm5, %xmm13
00000000003ad853	movaps	%xmm8, %xmm0
00000000003ad857	cmpeqps	%xmm14, %xmm0
00000000003ad85c	andps	%xmm5, %xmm0
00000000003ad85f	cmpnleps	%xmm14, %xmm0
00000000003ad864	movaps	%xmm13, %xmm1
00000000003ad868	blendvps	%xmm0, %xmm5, %xmm1
00000000003ad86d	movaps	0xa0(%r11), %xmm6
00000000003ad875	movaps	%xmm6, %xmm0
00000000003ad878	andps	%xmm1, %xmm0
00000000003ad87b	orps	%xmm5, %xmm0
00000000003ad87e	movaps	0xc0(%r11), %xmm3
00000000003ad886	movaps	%xmm3, -0x20(%rbp)
00000000003ad88a	movaps	%xmm1, %xmm2
00000000003ad88d	movaps	0xe0(%r11), %xmm4
00000000003ad895	movaps	%xmm4, -0xe0(%rbp)
00000000003ad89c	cmpltps	%xmm3, %xmm2
00000000003ad8a0	andps	%xmm4, %xmm2
00000000003ad8a3	psrld	$0x17, %xmm1
00000000003ad8a8	cvtdq2ps	%xmm1, %xmm1
00000000003ad8ab	subps	%xmm2, %xmm1
00000000003ad8ae	movaps	0x100(%r11), %xmm10
00000000003ad8b6	movaps	0x120(%r11), %xmm9
00000000003ad8be	movaps	%xmm9, %xmm2
00000000003ad8c2	subps	%xmm10, %xmm1
00000000003ad8c6	movaps	%xmm10, -0xf0(%rbp)
00000000003ad8ce	cmpltps	%xmm0, %xmm2
00000000003ad8d2	andps	%xmm5, %xmm2
00000000003ad8d5	movaps	0x140(%r11), %xmm3
00000000003ad8dd	movaps	%xmm3, -0xc0(%rbp)
00000000003ad8e4	addps	%xmm2, %xmm1
00000000003ad8e7	mulps	%xmm3, %xmm2
00000000003ad8ea	mulps	%xmm0, %xmm2
00000000003ad8ed	subps	%xmm5, %xmm0
00000000003ad8f0	subps	%xmm2, %xmm0
00000000003ad8f3	movaps	0x160(%r11), %xmm11
00000000003ad8fb	movaps	%xmm11, %xmm3
00000000003ad8ff	movaps	0x1a0(%r11), %xmm4
00000000003ad907	mulps	%xmm0, %xmm3
00000000003ad90a	movaps	%xmm4, %xmm7
00000000003ad90d	mulps	%xmm0, %xmm7
00000000003ad910	movaps	%xmm0, %xmm12
00000000003ad914	mulps	%xmm0, %xmm12
00000000003ad918	movaps	0x1c0(%r11), %xmm2
00000000003ad920	movaps	%xmm2, -0xa0(%rbp)
00000000003ad927	addps	%xmm2, %xmm7
00000000003ad92a	movaps	0x180(%r11), %xmm2
00000000003ad932	movaps	%xmm2, -0x80(%rbp)
00000000003ad936	addps	%xmm2, %xmm3
00000000003ad939	mulps	%xmm12, %xmm7
00000000003ad93d	addps	%xmm3, %xmm7
00000000003ad940	mulps	%xmm12, %xmm7
00000000003ad944	movaps	0x1e0(%r11), %xmm3
00000000003ad94c	movaps	%xmm3, %xmm12
00000000003ad950	mulps	%xmm0, %xmm12
00000000003ad954	movaps	0x200(%r11), %xmm2
00000000003ad95c	movaps	%xmm2, -0x60(%rbp)
00000000003ad960	addps	%xmm2, %xmm12
00000000003ad964	addps	%xmm12, %xmm7
00000000003ad968	mulps	%xmm0, %xmm7
00000000003ad96b	movaps	0x220(%r11), %xmm2
00000000003ad973	movaps	%xmm2, -0x90(%rbp)
00000000003ad97a	addps	%xmm2, %xmm7
00000000003ad97d	mulps	%xmm0, %xmm7
00000000003ad980	addps	%xmm1, %xmm7
00000000003ad983	mulps	%xmm8, %xmm7
00000000003ad987	movaps	0x240(%r11), %xmm0
00000000003ad98f	movaps	%xmm0, -0x70(%rbp)
00000000003ad993	maxps	%xmm0, %xmm7
00000000003ad996	roundps	$0x9, %xmm7, %xmm0
00000000003ad99c	subps	%xmm0, %xmm7
00000000003ad99f	movaps	%xmm7, %xmm1
00000000003ad9a2	mulps	%xmm7, %xmm1
00000000003ad9a5	movaps	0x260(%r11), %xmm15
00000000003ad9ad	movaps	%xmm7, %xmm12
00000000003ad9b1	mulps	%xmm15, %xmm12
00000000003ad9b5	movaps	0x280(%r11), %xmm2
00000000003ad9bd	movaps	%xmm2, -0x50(%rbp)
00000000003ad9c1	addps	%xmm2, %xmm12
00000000003ad9c5	mulps	%xmm1, %xmm12
00000000003ad9c9	movaps	0x2a0(%r11), %xmm8
00000000003ad9d1	movaps	%xmm7, %xmm1
00000000003ad9d4	mulps	%xmm8, %xmm1
00000000003ad9d8	movaps	0x2c0(%r11), %xmm2
00000000003ad9e0	movaps	%xmm2, -0x40(%rbp)
00000000003ad9e4	addps	%xmm2, %xmm1
00000000003ad9e7	addps	%xmm12, %xmm1
00000000003ad9eb	mulps	%xmm7, %xmm1
00000000003ad9ee	movaps	0x2e0(%r11), %xmm2
00000000003ad9f6	movaps	%xmm2, -0x30(%rbp)
00000000003ad9fa	addps	%xmm2, %xmm1
00000000003ad9fd	mulps	%xmm7, %xmm1
00000000003ada00	addps	%xmm5, %xmm1
00000000003ada03	cvttps2dq	%xmm0, %xmm0
00000000003ada07	movdqa	0x300(%r11), %xmm2
00000000003ada10	movdqa	%xmm2, -0xb0(%rbp)
00000000003ada18	paddd	%xmm2, %xmm0
00000000003ada1c	pslld	$0x17, %xmm0
00000000003ada21	mulps	%xmm1, %xmm0
00000000003ada24	blendps	$0x8, %xmm13, %xmm0             ## xmm0 = xmm0[0,1,2],xmm13[3]
00000000003ada2b	movaps	(%r11), %xmm12
00000000003ada2f	movaps	%xmm12, %xmm7
00000000003ada33	shufps	$0xaa, %xmm12, %xmm7            ## xmm7 = xmm7[2,2],xmm12[2,2]
00000000003ada38	mulps	%xmm0, %xmm7
00000000003ada3b	movaps	%xmm12, %xmm1
00000000003ada3f	shufps	$0x55, %xmm12, %xmm12           ## xmm12 = xmm12[1,1,1,1]
00000000003ada44	addps	%xmm7, %xmm12
00000000003ada48	movaps	%xmm12, %xmm7
00000000003ada4c	blendps	$0x8, %xmm13, %xmm7             ## xmm7 = xmm7[0,1,2],xmm13[3]
00000000003ada53	rcpps	%xmm7, %xmm7
00000000003ada56	mulps	0x320(%r11), %xmm7
00000000003ada5e	minps	0x340(%r11), %xmm7
00000000003ada66	shufps	$0x0, %xmm1, %xmm1              ## xmm1 = xmm1[0,0,0,0]
00000000003ada6a	subps	%xmm1, %xmm0
00000000003ada6d	maxps	0x360(%r11), %xmm7
00000000003ada75	mulps	%xmm7, %xmm12
00000000003ada79	movaps	0x380(%r11), %xmm1
00000000003ada81	subps	%xmm12, %xmm1
00000000003ada85	mulps	%xmm7, %xmm1
00000000003ada88	maxps	%xmm14, %xmm0
00000000003ada8c	mulps	%xmm0, %xmm1
00000000003ada8f	movaps	-0xd0(%rbp), %xmm12
00000000003ada97	shufps	$0x0, %xmm12, %xmm12            ## xmm12 = xmm12[0,0,0,0]
00000000003ada9c	movaps	%xmm12, %xmm0
00000000003adaa0	cmpeqps	%xmm14, %xmm0
00000000003adaa5	andps	%xmm5, %xmm0
00000000003adaa8	cmpnleps	%xmm14, %xmm0
00000000003adaad	blendps	$0x8, %xmm13, %xmm1             ## xmm1 = xmm1[0,1,2],xmm13[3]
00000000003adab4	blendvps	%xmm0, %xmm5, %xmm1
00000000003adab9	movaps	%xmm6, %xmm0
00000000003adabc	andps	%xmm1, %xmm0
00000000003adabf	movaps	%xmm1, %xmm7
00000000003adac2	cmpltps	-0x20(%rbp), %xmm7
00000000003adac7	andps	-0xe0(%rbp), %xmm7
00000000003adace	psrld	$0x17, %xmm1
00000000003adad3	cvtdq2ps	%xmm1, %xmm2
00000000003adad6	subps	%xmm7, %xmm2
00000000003adad9	orps	%xmm5, %xmm0
00000000003adadc	subps	%xmm10, %xmm2
00000000003adae0	movaps	%xmm9, %xmm7
00000000003adae4	cmpltps	%xmm0, %xmm7
00000000003adae8	andps	%xmm5, %xmm7
00000000003adaeb	addps	%xmm7, %xmm2
00000000003adaee	mulps	-0xc0(%rbp), %xmm7
00000000003adaf5	mulps	%xmm0, %xmm7
00000000003adaf8	subps	%xmm5, %xmm0
00000000003adafb	subps	%xmm7, %xmm0
00000000003adafe	movaps	%xmm0, %xmm1
00000000003adb01	mulps	%xmm0, %xmm1
00000000003adb04	movaps	%xmm11, %xmm10
00000000003adb08	mulps	%xmm0, %xmm10
00000000003adb0c	movaps	%xmm4, %xmm7
00000000003adb0f	mulps	%xmm0, %xmm7
00000000003adb12	addps	-0x80(%rbp), %xmm10
00000000003adb17	addps	-0xa0(%rbp), %xmm7
00000000003adb1e	mulps	%xmm1, %xmm7
00000000003adb21	addps	%xmm10, %xmm7
00000000003adb25	mulps	%xmm1, %xmm7
00000000003adb28	movaps	%xmm3, %xmm1
00000000003adb2b	mulps	%xmm0, %xmm1
00000000003adb2e	addps	-0x60(%rbp), %xmm1
00000000003adb32	addps	%xmm1, %xmm7
00000000003adb35	mulps	%xmm0, %xmm7
00000000003adb38	addps	-0x90(%rbp), %xmm7
00000000003adb3f	mulps	%xmm0, %xmm7
00000000003adb42	addps	%xmm2, %xmm7
00000000003adb45	mulps	%xmm12, %xmm7
00000000003adb49	maxps	-0x70(%rbp), %xmm7
00000000003adb4d	roundps	$0x9, %xmm7, %xmm0
00000000003adb53	subps	%xmm0, %xmm7
00000000003adb56	movaps	%xmm15, %xmm1
00000000003adb5a	mulps	%xmm7, %xmm1
00000000003adb5d	movaps	%xmm7, %xmm2
00000000003adb60	mulps	%xmm7, %xmm2
00000000003adb63	addps	-0x50(%rbp), %xmm1
00000000003adb67	mulps	%xmm2, %xmm1
00000000003adb6a	movaps	%xmm8, %xmm2
00000000003adb6e	mulps	%xmm7, %xmm2
00000000003adb71	addps	-0x40(%rbp), %xmm2
00000000003adb75	addps	%xmm1, %xmm2
00000000003adb78	mulps	%xmm7, %xmm2
00000000003adb7b	addps	-0x30(%rbp), %xmm2
00000000003adb7f	mulps	%xmm7, %xmm2
00000000003adb82	cvttps2dq	%xmm0, %xmm1
00000000003adb86	paddd	-0xb0(%rbp), %xmm1
00000000003adb8e	addps	%xmm5, %xmm2
00000000003adb91	pslld	$0x17, %xmm1
00000000003adb96	mulps	%xmm2, %xmm1
00000000003adb99	movaps	0x40(%r11), %xmm7
00000000003adb9e	movaps	%xmm7, %xmm0
00000000003adba1	shufps	$0x0, %xmm7, %xmm0              ## xmm0 = xmm0[0,0],xmm7[0,0]
00000000003adba5	movaps	%xmm7, %xmm12
00000000003adba9	shufps	$0x55, %xmm7, %xmm12            ## xmm12 = xmm12[1,1],xmm7[1,1]
00000000003adbae	mulps	%xmm1, %xmm0
00000000003adbb1	addps	%xmm0, %xmm12
00000000003adbb5	blendps	$0x8, %xmm13, %xmm12            ## xmm12 = xmm12[0,1,2],xmm13[3]
00000000003adbbc	movaps	-0xd0(%rbp), %xmm2
00000000003adbc3	shufps	$0xaa, %xmm2, %xmm2             ## xmm2 = xmm2[2,2,2,2]
00000000003adbc7	movaps	%xmm2, %xmm0
00000000003adbca	movaps	%xmm2, %xmm10
00000000003adbce	cmpeqps	%xmm14, %xmm0
00000000003adbd3	andps	%xmm5, %xmm0
00000000003adbd6	cmpnleps	%xmm14, %xmm0
00000000003adbdb	blendvps	%xmm0, %xmm5, %xmm12
00000000003adbe1	movaps	%xmm12, %xmm2
00000000003adbe5	cmpltps	-0x20(%rbp), %xmm2
00000000003adbea	andps	-0xe0(%rbp), %xmm2
00000000003adbf1	andps	%xmm12, %xmm6
00000000003adbf5	psrld	$0x17, %xmm12
00000000003adbfb	cvtdq2ps	%xmm12, %xmm0
00000000003adbff	subps	%xmm2, %xmm0
00000000003adc02	subps	-0xf0(%rbp), %xmm0
00000000003adc09	orps	%xmm5, %xmm6
00000000003adc0c	cmpltps	%xmm6, %xmm9
00000000003adc11	andps	%xmm5, %xmm9
00000000003adc15	addps	%xmm9, %xmm0
00000000003adc19	mulps	-0xc0(%rbp), %xmm9
00000000003adc21	mulps	%xmm6, %xmm9
00000000003adc25	subps	%xmm5, %xmm6
00000000003adc28	subps	%xmm9, %xmm6
00000000003adc2c	mulps	%xmm6, %xmm11
00000000003adc30	addps	-0x80(%rbp), %xmm11
00000000003adc35	mulps	%xmm6, %xmm4
00000000003adc38	addps	-0xa0(%rbp), %xmm4
00000000003adc3f	movaps	%xmm6, %xmm2
00000000003adc42	mulps	%xmm6, %xmm2
00000000003adc45	mulps	%xmm2, %xmm4
00000000003adc48	addps	%xmm11, %xmm4
00000000003adc4c	mulps	%xmm6, %xmm3
00000000003adc4f	addps	-0x60(%rbp), %xmm3
00000000003adc53	mulps	%xmm2, %xmm4
00000000003adc56	addps	%xmm3, %xmm4
00000000003adc59	mulps	%xmm6, %xmm4
00000000003adc5c	addps	-0x90(%rbp), %xmm4
00000000003adc63	mulps	%xmm6, %xmm4
00000000003adc66	addps	%xmm0, %xmm4
00000000003adc69	mulps	%xmm10, %xmm4
00000000003adc6d	maxps	-0x70(%rbp), %xmm4
00000000003adc71	roundps	$0x9, %xmm4, %xmm0
00000000003adc77	subps	%xmm0, %xmm4
00000000003adc7a	mulps	%xmm4, %xmm15
00000000003adc7e	addps	-0x50(%rbp), %xmm15
00000000003adc83	movaps	%xmm4, %xmm2
00000000003adc86	mulps	%xmm4, %xmm2
00000000003adc89	mulps	%xmm2, %xmm15
00000000003adc8d	mulps	%xmm4, %xmm8
00000000003adc91	addps	-0x40(%rbp), %xmm8
00000000003adc96	addps	%xmm15, %xmm8
00000000003adc9a	mulps	%xmm4, %xmm8
00000000003adc9e	addps	-0x30(%rbp), %xmm8
00000000003adca3	mulps	%xmm4, %xmm8
00000000003adca7	movaps	%xmm7, %xmm2
00000000003adcaa	shufps	$0xaa, %xmm7, %xmm2             ## xmm2 = xmm2[2,2],xmm7[2,2]
00000000003adcae	mulps	%xmm1, %xmm2
00000000003adcb1	shufps	$0xff, %xmm7, %xmm7             ## xmm7 = xmm7[3,3,3,3]
00000000003adcb5	cmpltps	%xmm1, %xmm7
00000000003adcb9	cvttps2dq	%xmm0, %xmm1
00000000003adcbd	paddd	-0xb0(%rbp), %xmm1
00000000003adcc5	addps	%xmm5, %xmm8
00000000003adcc9	andps	%xmm5, %xmm7
00000000003adccc	pslld	$0x17, %xmm1
00000000003adcd1	mulps	%xmm8, %xmm1
00000000003adcd5	cmpnleps	%xmm14, %xmm7
00000000003adcda	movaps	%xmm7, %xmm0
00000000003adcdd	blendvps	%xmm0, %xmm1, %xmm2
00000000003adce2	blendps	$0x8, %xmm13, %xmm2             ## xmm2 = xmm2[0,1,2],xmm13[3]
00000000003adce9	movaps	%xmm2, (%rdi,%r10)
00000000003adcee	addq	$0x10, %r10
00000000003adcf2	cmpq	%r10, %rax
00000000003adcf5	jne	0x3ad820
00000000003adcfb	incl	%r9d
00000000003adcfe	addq	%rdx, %rsi
00000000003add01	addq	%r8, %rdi
00000000003add04	cmpl	%ecx, %r9d
00000000003add07	jne	0x3ad810
00000000003add0d	jmp	0x3ad7b8
00000000003add12	testl	%ecx, %ecx
00000000003add14	jle	0x3ad7b8
00000000003add1a	testl	%r9d, %r9d
00000000003add1d	jle	0x3ad7b8
00000000003add23	movl	%r9d, %eax
00000000003add26	shlq	$0x4, %rdx
00000000003add2a	shlq	$0x4, %r8
00000000003add2e	shlq	$0x4, %rax
00000000003add32	xorl	%r9d, %r9d
00000000003add35	nopw	%cs:(%rax,%rax)
00000000003add40	xorl	%r10d, %r10d
00000000003add43	nopw	%cs:(%rax,%rax)
00000000003add50	movq	0x198(%rbx), %r11
00000000003add57	movaps	(%rsi,%r10), %xmm1
00000000003add5c	movaps	0x20(%r11), %xmm0
00000000003add61	movaps	0x60(%r11), %xmm3
00000000003add66	movaps	0x80(%r11), %xmm7
00000000003add6e	maxps	%xmm3, %xmm1
00000000003add71	movaps	%xmm0, %xmm2
00000000003add74	movaps	%xmm0, %xmm12
00000000003add78	movaps	%xmm0, -0x20(%rbp)
00000000003add7c	shufps	$0x55, %xmm0, %xmm2             ## xmm2 = xmm2[1,1],xmm0[1,1]
00000000003add80	movaps	%xmm2, %xmm0
00000000003add83	minps	%xmm7, %xmm1
00000000003add86	cmpeqps	%xmm3, %xmm0
00000000003add8a	andps	%xmm7, %xmm0
00000000003add8d	movaps	%xmm7, %xmm4
00000000003add90	cmpleps	%xmm3, %xmm0
00000000003add94	movaps	0xa0(%r11), %xmm5
00000000003add9c	blendvps	%xmm0, %xmm1, %xmm4
00000000003adda1	movaps	%xmm5, %xmm0
00000000003adda4	andps	%xmm4, %xmm0
00000000003adda7	movaps	0xc0(%r11), %xmm8
00000000003addaf	movaps	%xmm8, -0xe0(%rbp)
00000000003addb7	orps	%xmm7, %xmm0
00000000003addba	movaps	%xmm4, %xmm6
00000000003addbd	cmpltps	%xmm8, %xmm6
00000000003addc2	movaps	0xe0(%r11), %xmm8
00000000003addca	movaps	%xmm8, -0xd0(%rbp)
00000000003addd2	andps	%xmm8, %xmm6
00000000003addd6	psrld	$0x17, %xmm4
00000000003adddb	cvtdq2ps	%xmm4, %xmm9
00000000003adddf	movaps	0x100(%r11), %xmm10
00000000003adde7	movaps	%xmm10, -0xb0(%rbp)
00000000003addef	subps	%xmm6, %xmm9
00000000003addf3	movaps	0x120(%r11), %xmm8
00000000003addfb	movaps	%xmm8, %xmm4
00000000003addff	cmpltps	%xmm0, %xmm4
00000000003ade03	subps	%xmm10, %xmm9
00000000003ade07	andps	%xmm7, %xmm4
00000000003ade0a	addps	%xmm4, %xmm9
00000000003ade0e	movaps	0x140(%r11), %xmm6
00000000003ade16	movaps	%xmm6, -0xc0(%rbp)
00000000003ade1d	mulps	%xmm6, %xmm4
00000000003ade20	mulps	%xmm0, %xmm4
00000000003ade23	subps	%xmm7, %xmm0
00000000003ade26	subps	%xmm4, %xmm0
00000000003ade29	movaps	%xmm0, %xmm4
00000000003ade2c	movaps	0x160(%r11), %xmm15
00000000003ade34	movaps	%xmm15, %xmm11
00000000003ade38	mulps	%xmm0, %xmm11
00000000003ade3c	mulps	%xmm0, %xmm4
00000000003ade3f	movaps	0x180(%r11), %xmm6
00000000003ade47	movaps	%xmm6, -0xa0(%rbp)
00000000003ade4e	addps	%xmm6, %xmm11
00000000003ade52	movaps	0x1a0(%r11), %xmm6
00000000003ade5a	movaps	%xmm6, %xmm10
00000000003ade5e	mulps	%xmm0, %xmm10
00000000003ade62	movaps	0x1c0(%r11), %xmm13
00000000003ade6a	movaps	%xmm13, -0x90(%rbp)
00000000003ade72	addps	%xmm13, %xmm10
00000000003ade76	mulps	%xmm4, %xmm10
00000000003ade7a	addps	%xmm11, %xmm10
00000000003ade7e	mulps	%xmm4, %xmm10
00000000003ade82	movaps	0x1e0(%r11), %xmm4
00000000003ade8a	movaps	%xmm4, %xmm11
00000000003ade8e	mulps	%xmm0, %xmm11
00000000003ade92	movaps	0x200(%r11), %xmm13
00000000003ade9a	movaps	%xmm13, -0x60(%rbp)
00000000003ade9f	addps	%xmm13, %xmm11
00000000003adea3	addps	%xmm11, %xmm10
00000000003adea7	mulps	%xmm0, %xmm10
00000000003adeab	movaps	0x220(%r11), %xmm11
00000000003adeb3	movaps	%xmm11, -0x80(%rbp)
00000000003adeb8	addps	%xmm11, %xmm10
00000000003adebc	mulps	%xmm0, %xmm10
00000000003adec0	addps	%xmm9, %xmm10
00000000003adec4	mulps	%xmm2, %xmm10
00000000003adec8	movaps	0x240(%r11), %xmm0
00000000003aded0	movaps	%xmm0, -0x70(%rbp)
00000000003aded4	maxps	%xmm0, %xmm10
00000000003aded8	cvtps2dq	%xmm10, %xmm0
00000000003adedd	cvtdq2ps	%xmm0, %xmm2
00000000003adee0	movaps	%xmm10, %xmm0
00000000003adee4	cmpltps	%xmm2, %xmm0
00000000003adee8	cvtdq2ps	%xmm0, %xmm0
00000000003adeeb	addps	%xmm2, %xmm0
00000000003adeee	subps	%xmm0, %xmm10
00000000003adef2	movaps	0x260(%r11), %xmm13
00000000003adefa	movaps	%xmm13, %xmm2
00000000003adefe	mulps	%xmm10, %xmm2
00000000003adf02	movaps	%xmm10, %xmm9
00000000003adf06	mulps	%xmm10, %xmm9
00000000003adf0a	movaps	0x280(%r11), %xmm11
00000000003adf12	movaps	%xmm11, -0x50(%rbp)
00000000003adf17	addps	%xmm11, %xmm2
00000000003adf1b	mulps	%xmm9, %xmm2
00000000003adf1f	movaps	0x2a0(%r11), %xmm9
00000000003adf27	movaps	%xmm9, %xmm11
00000000003adf2b	mulps	%xmm10, %xmm11
00000000003adf2f	movaps	0x2c0(%r11), %xmm14
00000000003adf37	movaps	%xmm14, -0x40(%rbp)
00000000003adf3c	addps	%xmm14, %xmm11
00000000003adf40	addps	%xmm2, %xmm11
00000000003adf44	mulps	%xmm10, %xmm11
00000000003adf48	movaps	0x2e0(%r11), %xmm2
00000000003adf50	movaps	%xmm2, -0x30(%rbp)
00000000003adf54	addps	%xmm2, %xmm11
00000000003adf58	mulps	%xmm10, %xmm11
00000000003adf5c	addps	%xmm7, %xmm11
00000000003adf60	cvttps2dq	%xmm0, %xmm0
00000000003adf64	movdqa	0x300(%r11), %xmm2
00000000003adf6d	movdqa	%xmm2, -0xf0(%rbp)
00000000003adf75	paddd	%xmm2, %xmm0
00000000003adf79	pslld	$0x17, %xmm0
00000000003adf7e	mulps	%xmm11, %xmm0
00000000003adf82	movaps	0x3a0(%r11), %xmm11
00000000003adf8a	movaps	%xmm11, %xmm10
00000000003adf8e	andnps	%xmm1, %xmm10
00000000003adf92	andps	%xmm11, %xmm0
00000000003adf96	orps	%xmm10, %xmm0
00000000003adf9a	movaps	(%r11), %xmm1
00000000003adf9e	movaps	%xmm1, %xmm2
00000000003adfa1	shufps	$0x0, %xmm1, %xmm2              ## xmm2 = xmm2[0,0],xmm1[0,0]
00000000003adfa5	movaps	%xmm1, %xmm14
00000000003adfa9	shufps	$0xaa, %xmm1, %xmm14            ## xmm14 = xmm14[2,2],xmm1[2,2]
00000000003adfae	mulps	%xmm0, %xmm14
00000000003adfb2	subps	%xmm2, %xmm0
00000000003adfb5	shufps	$0x55, %xmm1, %xmm1             ## xmm1 = xmm1[1,1,1,1]
00000000003adfb9	addps	%xmm14, %xmm1
00000000003adfbd	andps	%xmm11, %xmm1
00000000003adfc1	orps	%xmm10, %xmm1
00000000003adfc5	rcpps	%xmm1, %xmm14
00000000003adfc9	mulps	0x320(%r11), %xmm14
00000000003adfd1	minps	0x340(%r11), %xmm14
00000000003adfd9	maxps	0x360(%r11), %xmm14
00000000003adfe1	mulps	%xmm14, %xmm1
00000000003adfe5	movaps	0x380(%r11), %xmm2
00000000003adfed	subps	%xmm1, %xmm2
00000000003adff0	mulps	%xmm14, %xmm2
00000000003adff4	movaps	%xmm3, -0x100(%rbp)
00000000003adffb	maxps	%xmm3, %xmm0
00000000003adffe	mulps	%xmm0, %xmm2
00000000003ae001	andps	%xmm11, %xmm2
00000000003ae005	movaps	%xmm12, %xmm14
00000000003ae009	shufps	$0x0, %xmm12, %xmm14            ## xmm14 = xmm14[0,0],xmm12[0,0]
00000000003ae00e	movaps	%xmm14, %xmm0
00000000003ae012	cmpeqps	%xmm3, %xmm0
00000000003ae016	andps	%xmm7, %xmm0
00000000003ae019	cmpleps	%xmm3, %xmm0
00000000003ae01d	orps	%xmm10, %xmm2
00000000003ae021	movaps	%xmm7, %xmm1
00000000003ae024	blendvps	%xmm0, %xmm2, %xmm1
00000000003ae029	movaps	%xmm1, %xmm0
00000000003ae02c	cmpltps	-0xe0(%rbp), %xmm0
00000000003ae034	andps	-0xd0(%rbp), %xmm0
00000000003ae03b	movaps	%xmm1, %xmm2
00000000003ae03e	psrld	$0x17, %xmm1
00000000003ae043	cvtdq2ps	%xmm1, %xmm3
00000000003ae046	subps	%xmm0, %xmm3
00000000003ae049	andps	%xmm5, %xmm2
00000000003ae04c	orps	%xmm7, %xmm2
00000000003ae04f	movaps	%xmm8, %xmm0
00000000003ae053	cmpltps	%xmm2, %xmm0
00000000003ae057	subps	-0xb0(%rbp), %xmm3
00000000003ae05e	andps	%xmm7, %xmm0
00000000003ae061	addps	%xmm0, %xmm3
00000000003ae064	mulps	-0xc0(%rbp), %xmm0
00000000003ae06b	mulps	%xmm2, %xmm0
00000000003ae06e	subps	%xmm7, %xmm2
00000000003ae071	subps	%xmm0, %xmm2
00000000003ae074	movaps	%xmm2, %xmm1
00000000003ae077	mulps	%xmm2, %xmm1
00000000003ae07a	movaps	%xmm15, %xmm12
00000000003ae07e	mulps	%xmm2, %xmm12
00000000003ae082	addps	-0xa0(%rbp), %xmm12
00000000003ae08a	movaps	%xmm6, %xmm0
00000000003ae08d	mulps	%xmm2, %xmm0
00000000003ae090	addps	-0x90(%rbp), %xmm0
00000000003ae097	mulps	%xmm1, %xmm0
00000000003ae09a	addps	%xmm12, %xmm0
00000000003ae09e	mulps	%xmm1, %xmm0
00000000003ae0a1	movaps	%xmm4, %xmm1
00000000003ae0a4	mulps	%xmm2, %xmm1
00000000003ae0a7	addps	-0x60(%rbp), %xmm1
00000000003ae0ab	addps	%xmm1, %xmm0
00000000003ae0ae	mulps	%xmm2, %xmm0
00000000003ae0b1	addps	-0x80(%rbp), %xmm0
00000000003ae0b5	mulps	%xmm2, %xmm0
00000000003ae0b8	addps	%xmm3, %xmm0
00000000003ae0bb	mulps	%xmm14, %xmm0
00000000003ae0bf	maxps	-0x70(%rbp), %xmm0
00000000003ae0c3	cvtps2dq	%xmm0, %xmm1
00000000003ae0c7	cvtdq2ps	%xmm1, %xmm1
00000000003ae0ca	movaps	%xmm0, %xmm2
00000000003ae0cd	cmpltps	%xmm1, %xmm2
00000000003ae0d1	cvtdq2ps	%xmm2, %xmm2
00000000003ae0d4	addps	%xmm1, %xmm2
00000000003ae0d7	subps	%xmm2, %xmm0
00000000003ae0da	movaps	%xmm0, %xmm1
00000000003ae0dd	mulps	%xmm0, %xmm1
00000000003ae0e0	movaps	%xmm13, %xmm3
00000000003ae0e4	mulps	%xmm0, %xmm3
00000000003ae0e7	addps	-0x50(%rbp), %xmm3
00000000003ae0eb	mulps	%xmm1, %xmm3
00000000003ae0ee	movaps	%xmm9, %xmm1
00000000003ae0f2	mulps	%xmm0, %xmm1
00000000003ae0f5	addps	-0x40(%rbp), %xmm1
00000000003ae0f9	addps	%xmm3, %xmm1
00000000003ae0fc	mulps	%xmm0, %xmm1
00000000003ae0ff	addps	-0x30(%rbp), %xmm1
00000000003ae103	mulps	%xmm0, %xmm1
00000000003ae106	addps	%xmm7, %xmm1
00000000003ae109	cvttps2dq	%xmm2, %xmm2
00000000003ae10d	paddd	-0xf0(%rbp), %xmm2
00000000003ae115	pslld	$0x17, %xmm2
00000000003ae11a	mulps	%xmm1, %xmm2
00000000003ae11d	movaps	0x40(%r11), %xmm1
00000000003ae122	movaps	%xmm1, %xmm0
00000000003ae125	shufps	$0x0, %xmm1, %xmm0              ## xmm0 = xmm0[0,0],xmm1[0,0]
00000000003ae129	mulps	%xmm2, %xmm0
00000000003ae12c	movaps	%xmm1, %xmm3
00000000003ae12f	shufps	$0x55, %xmm1, %xmm3             ## xmm3 = xmm3[1,1],xmm1[1,1]
00000000003ae133	addps	%xmm0, %xmm3
00000000003ae136	andps	%xmm11, %xmm3
00000000003ae13a	movaps	-0x20(%rbp), %xmm0
00000000003ae13e	shufps	$0xaa, %xmm0, %xmm0             ## xmm0 = xmm0[2,2,2,2]
00000000003ae142	movaps	%xmm0, -0x20(%rbp)
00000000003ae146	movaps	-0x100(%rbp), %xmm14
00000000003ae14e	cmpeqps	%xmm14, %xmm0
00000000003ae153	orps	%xmm10, %xmm3
00000000003ae157	andps	%xmm7, %xmm0
00000000003ae15a	cmpleps	%xmm14, %xmm0
00000000003ae15f	movaps	%xmm7, %xmm12
00000000003ae163	blendvps	%xmm0, %xmm3, %xmm12
00000000003ae169	movaps	%xmm12, %xmm3
00000000003ae16d	cmpltps	-0xe0(%rbp), %xmm3
00000000003ae175	andps	-0xd0(%rbp), %xmm3
00000000003ae17c	andps	%xmm12, %xmm5
00000000003ae180	psrld	$0x17, %xmm12
00000000003ae186	cvtdq2ps	%xmm12, %xmm0
00000000003ae18a	subps	%xmm3, %xmm0
00000000003ae18d	subps	-0xb0(%rbp), %xmm0
00000000003ae194	orps	%xmm7, %xmm5
00000000003ae197	cmpltps	%xmm5, %xmm8
00000000003ae19c	andps	%xmm7, %xmm8
00000000003ae1a0	addps	%xmm8, %xmm0
00000000003ae1a4	mulps	-0xc0(%rbp), %xmm8
00000000003ae1ac	mulps	%xmm5, %xmm8
00000000003ae1b0	subps	%xmm7, %xmm5
00000000003ae1b3	subps	%xmm8, %xmm5
00000000003ae1b7	mulps	%xmm5, %xmm15
00000000003ae1bb	addps	-0xa0(%rbp), %xmm15
00000000003ae1c3	mulps	%xmm5, %xmm6
00000000003ae1c6	addps	-0x90(%rbp), %xmm6
00000000003ae1cd	movaps	%xmm5, %xmm3
00000000003ae1d0	mulps	%xmm5, %xmm3
00000000003ae1d3	mulps	%xmm3, %xmm6
00000000003ae1d6	addps	%xmm15, %xmm6
00000000003ae1da	mulps	%xmm5, %xmm4
00000000003ae1dd	addps	-0x60(%rbp), %xmm4
00000000003ae1e1	mulps	%xmm3, %xmm6
00000000003ae1e4	addps	%xmm4, %xmm6
00000000003ae1e7	mulps	%xmm5, %xmm6
00000000003ae1ea	addps	-0x80(%rbp), %xmm6
00000000003ae1ee	mulps	%xmm5, %xmm6
00000000003ae1f1	addps	%xmm0, %xmm6
00000000003ae1f4	mulps	-0x20(%rbp), %xmm6
00000000003ae1f8	maxps	-0x70(%rbp), %xmm6
00000000003ae1fc	cvtps2dq	%xmm6, %xmm0
00000000003ae200	cvtdq2ps	%xmm0, %xmm0
00000000003ae203	movaps	%xmm6, %xmm3
00000000003ae206	cmpltps	%xmm0, %xmm3
00000000003ae20a	cvtdq2ps	%xmm3, %xmm3
00000000003ae20d	addps	%xmm0, %xmm3
00000000003ae210	subps	%xmm3, %xmm6
00000000003ae213	mulps	%xmm6, %xmm13
00000000003ae217	addps	-0x50(%rbp), %xmm13
00000000003ae21c	movaps	%xmm6, %xmm0
00000000003ae21f	mulps	%xmm6, %xmm0
00000000003ae222	mulps	%xmm0, %xmm13
00000000003ae226	mulps	%xmm6, %xmm9
00000000003ae22a	addps	-0x40(%rbp), %xmm9
00000000003ae22f	addps	%xmm13, %xmm9
00000000003ae233	mulps	%xmm6, %xmm9
00000000003ae237	addps	-0x30(%rbp), %xmm9
00000000003ae23c	mulps	%xmm6, %xmm9
00000000003ae240	cvttps2dq	%xmm3, %xmm4
00000000003ae244	paddd	-0xf0(%rbp), %xmm4
00000000003ae24c	addps	%xmm7, %xmm9
00000000003ae250	pslld	$0x17, %xmm4
00000000003ae255	mulps	%xmm9, %xmm4
00000000003ae259	andps	%xmm11, %xmm4
00000000003ae25d	movaps	%xmm1, %xmm3
00000000003ae260	shufps	$0xaa, %xmm1, %xmm3             ## xmm3 = xmm3[2,2],xmm1[2,2]
00000000003ae264	shufps	$0xff, %xmm1, %xmm1             ## xmm1 = xmm1[3,3,3,3]
00000000003ae268	mulps	%xmm2, %xmm3
00000000003ae26b	cmpltps	%xmm2, %xmm1
00000000003ae26f	andps	%xmm7, %xmm1
00000000003ae272	cmpleps	%xmm14, %xmm1
00000000003ae277	orps	%xmm10, %xmm4
00000000003ae27b	movaps	%xmm4, %xmm2
00000000003ae27e	movaps	%xmm1, %xmm0
00000000003ae281	blendvps	%xmm0, %xmm3, %xmm2
00000000003ae286	movaps	0x3c0(%r11), %xmm0
00000000003ae28e	andps	%xmm0, %xmm4
00000000003ae291	andnps	%xmm2, %xmm0
00000000003ae294	orps	%xmm4, %xmm0
00000000003ae297	movaps	%xmm0, (%rdi,%r10)
00000000003ae29c	addq	$0x10, %r10
00000000003ae2a0	cmpq	%r10, %rax
00000000003ae2a3	jne	0x3add50
00000000003ae2a9	incl	%r9d
00000000003ae2ac	addq	%rdx, %rsi
00000000003ae2af	addq	%r8, %rdi
00000000003ae2b2	cmpl	%ecx, %r9d
00000000003ae2b5	jne	0x3add40
00000000003ae2bb	jmp	0x3ad7b8
