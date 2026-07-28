__ZN18HgcBT2100_HLG_OETF14RenderTile_AVXEP6HGTile:
00000000003b04b0	movl	0xc(%rsi), %eax
00000000003b04b3	subl	0x4(%rsi), %eax
00000000003b04b6	jle	0x3b091c
00000000003b04bc	pushq	%rbp
00000000003b04bd	movq	%rsp, %rbp
00000000003b04c0	pushq	%r14
00000000003b04c2	pushq	%rbx
00000000003b04c3	movl	0x8(%rsi), %ecx
00000000003b04c6	subl	(%rsi), %ecx
00000000003b04c8	movslq	0x18(%rsi), %rdx
00000000003b04cc	movq	0x10(%rsi), %r8
00000000003b04d0	movq	0x50(%rsi), %r9
00000000003b04d4	movslq	0x58(%rsi), %rsi
00000000003b04d8	shlq	$0x4, %rdx
00000000003b04dc	shlq	$0x4, %rsi
00000000003b04e0	xorl	%r10d, %r10d
00000000003b04e3	jmp	0x3b0502
00000000003b04e5	nopw	%cs:(%rax,%rax)
00000000003b04f0	addq	%rsi, %r9
00000000003b04f3	addq	%rdx, %r8
00000000003b04f6	incl	%r10d
00000000003b04f9	cmpl	%eax, %r10d
00000000003b04fc	je	0x3b0918
00000000003b0502	movl	$0x0, %r11d
00000000003b0508	cmpl	$0x2, %ecx
00000000003b050b	jl	0x3b0733
00000000003b0511	movl	$0x10, %ebx
00000000003b0516	xorl	%r11d, %r11d
00000000003b0519	nopl	(%rax)
00000000003b0520	vmovups	-0x10(%r9,%rbx), %ymm0
00000000003b0527	movq	0x198(%rdi), %r14
00000000003b052e	vmovups	0x40(%r14), %ymm1
00000000003b0534	vmovups	0x60(%r14), %ymm4
00000000003b053a	vmovups	0x80(%r14), %ymm5
00000000003b0543	vmovups	0xa0(%r14), %ymm3
00000000003b054c	vmaxps	%ymm1, %ymm0, %ymm7
00000000003b0550	vbroadcastss	(%r14), %ymm2
00000000003b0555	vbroadcastss	0x28(%r14), %ymm6
00000000003b055b	vmaxps	%ymm4, %ymm7, %ymm8
00000000003b055f	vrsqrtps	%ymm8, %ymm9
00000000003b0564	vmaxps	%ymm2, %ymm0, %ymm10
00000000003b0568	vsubps	%ymm6, %ymm10, %ymm6
00000000003b056c	vmulps	%ymm5, %ymm9, %ymm9
00000000003b0570	vmulps	%ymm9, %ymm8, %ymm10
00000000003b0575	vmulps	%ymm10, %ymm9, %ymm10
00000000003b057a	vmulps	%ymm3, %ymm9, %ymm9
00000000003b057e	vmovups	0xc0(%r14), %ymm11
00000000003b0587	vsubps	%ymm10, %ymm11, %ymm10
00000000003b058c	vmulps	%ymm10, %ymm9, %ymm9
00000000003b0591	vmulps	%ymm9, %ymm8, %ymm8
00000000003b0596	vblendps	$0x11, %ymm8, %ymm7, %ymm7      ## ymm7 = ymm8[0],ymm7[1,2,3],ymm8[4],ymm7[5,6,7]
00000000003b059c	vmaxps	%ymm4, %ymm7, %ymm8
00000000003b05a0	vrsqrtps	%ymm8, %ymm9
00000000003b05a5	vmulps	%ymm5, %ymm9, %ymm9
00000000003b05a9	vmulps	%ymm9, %ymm8, %ymm10
00000000003b05ae	vmulps	%ymm10, %ymm9, %ymm10
00000000003b05b3	vmulps	%ymm9, %ymm11, %ymm9
00000000003b05b8	vsubps	%ymm10, %ymm3, %ymm10
00000000003b05bd	vmulps	%ymm10, %ymm9, %ymm9
00000000003b05c2	vmulps	%ymm9, %ymm8, %ymm8
00000000003b05c7	vblendps	$0x44, %ymm8, %ymm7, %ymm7      ## ymm7 = ymm7[0,1],ymm8[2],ymm7[3,4,5],ymm8[6],ymm7[7]
00000000003b05cd	vmaxps	%ymm4, %ymm7, %ymm8
00000000003b05d1	vrsqrtps	%ymm8, %ymm9
00000000003b05d6	vmulps	%ymm5, %ymm9, %ymm5
00000000003b05da	vmulps	%ymm5, %ymm8, %ymm9
00000000003b05de	vmulps	%ymm5, %ymm9, %ymm9
00000000003b05e2	vmulps	%ymm5, %ymm11, %ymm5
00000000003b05e6	vsubps	%ymm9, %ymm3, %ymm3
00000000003b05eb	vmulps	%ymm3, %ymm5, %ymm3
00000000003b05ef	vmulps	%ymm3, %ymm8, %ymm3
00000000003b05f3	vbroadcastss	0x20(%r14), %ymm5
00000000003b05f9	vblendps	$0x22, %ymm3, %ymm7, %ymm3      ## ymm3 = ymm7[0],ymm3[1],ymm7[2,3,4],ymm3[5],ymm7[6,7]
00000000003b05ff	vmulps	%ymm3, %ymm5, %ymm3
00000000003b0603	vandps	0xe0(%r14), %ymm6, %ymm7
00000000003b060c	vmovups	0x100(%r14), %ymm5
00000000003b0615	vcmpltps	%ymm4, %ymm6, %ymm4
00000000003b061a	vandps	0x120(%r14), %ymm4, %ymm4
00000000003b0623	vpsrld	$0x17, %xmm6, %xmm8
00000000003b0628	vextractf128	$0x1, %ymm6, %xmm6
00000000003b062e	vpsrld	$0x17, %xmm6, %xmm6
00000000003b0633	vinsertf128	$0x1, %xmm6, %ymm8, %ymm6
00000000003b0639	vcvtdq2ps	%ymm6, %ymm6
00000000003b063d	vsubps	%ymm4, %ymm6, %ymm4
00000000003b0641	vsubps	0x140(%r14), %ymm4, %ymm4
00000000003b064a	vorps	%ymm5, %ymm7, %ymm6
00000000003b064e	vmovups	0x160(%r14), %ymm7
00000000003b0657	vcmpltps	%ymm6, %ymm7, %ymm7
00000000003b065c	vandps	%ymm5, %ymm7, %ymm7
00000000003b0660	vaddps	%ymm7, %ymm4, %ymm4
00000000003b0664	vmulps	0x180(%r14), %ymm7, %ymm7
00000000003b066d	vmulps	%ymm6, %ymm7, %ymm7
00000000003b0671	vsubps	%ymm5, %ymm6, %ymm6
00000000003b0675	vsubps	%ymm7, %ymm6, %ymm6
00000000003b0679	vmulps	0x1a0(%r14), %ymm6, %ymm7
00000000003b0682	vaddps	0x1c0(%r14), %ymm7, %ymm7
00000000003b068b	vmulps	0x1e0(%r14), %ymm6, %ymm8
00000000003b0694	vaddps	0x200(%r14), %ymm8, %ymm8
00000000003b069d	vmulps	0x220(%r14), %ymm6, %ymm9
00000000003b06a6	vmulps	%ymm6, %ymm6, %ymm10
00000000003b06aa	vaddps	0x240(%r14), %ymm9, %ymm9
00000000003b06b3	vmulps	%ymm8, %ymm10, %ymm8
00000000003b06b8	vaddps	%ymm7, %ymm8, %ymm7
00000000003b06bc	vmulps	%ymm7, %ymm10, %ymm7
00000000003b06c0	vaddps	%ymm7, %ymm9, %ymm7
00000000003b06c4	vmulps	%ymm7, %ymm6, %ymm7
00000000003b06c8	vaddps	0x260(%r14), %ymm7, %ymm7
00000000003b06d1	vmulps	%ymm7, %ymm6, %ymm6
00000000003b06d5	vaddps	%ymm6, %ymm4, %ymm4
00000000003b06d9	vbroadcastss	0x24(%r14), %ymm6
00000000003b06df	vbroadcastss	0x2c(%r14), %ymm7
00000000003b06e5	vmulps	%ymm4, %ymm6, %ymm4
00000000003b06e9	vaddps	%ymm4, %ymm7, %ymm4
00000000003b06ed	vcmpltps	%ymm0, %ymm2, %ymm2
00000000003b06f2	vandps	%ymm5, %ymm2, %ymm2
00000000003b06f6	vblendps	$0x88, %ymm0, %ymm2, %ymm2      ## ymm2 = ymm2[0,1,2],ymm0[3],ymm2[4,5,6],ymm0[7]
00000000003b06fc	vcmpltps	%ymm2, %ymm1, %ymm1
00000000003b0701	vblendvps	%ymm1, %ymm4, %ymm3, %ymm1
00000000003b0707	vblendps	$0x88, %ymm0, %ymm1, %ymm0      ## ymm0 = ymm1[0,1,2],ymm0[3],ymm1[4,5,6],ymm0[7]
00000000003b070d	vmovups	%ymm0, -0x10(%r8,%rbx)
00000000003b0714	addq	$0x20, %rbx
00000000003b0718	movl	%r11d, %r14d
00000000003b071b	addl	$-0x2, %r11d
00000000003b071f	addl	%ecx, %r14d
00000000003b0722	addl	$-0x2, %r14d
00000000003b0726	cmpl	$0x1, %r14d
00000000003b072a	jg	0x3b0520
00000000003b0730	negl	%r11d
00000000003b0733	cmpl	%ecx, %r11d
00000000003b0736	jge	0x3b04f0
00000000003b073c	movl	%r11d, %r11d
00000000003b073f	shlq	$0x4, %r11
00000000003b0743	vmovaps	(%r9,%r11), %xmm0
00000000003b0749	movq	0x198(%rdi), %rbx
00000000003b0750	vmovaps	0x40(%rbx), %xmm1
00000000003b0755	vmovaps	0x60(%rbx), %xmm3
00000000003b075a	vmovaps	0x80(%rbx), %xmm6
00000000003b0762	vmovaps	0xa0(%rbx), %xmm4
00000000003b076a	vmaxps	%xmm1, %xmm0, %xmm7
00000000003b076e	vbroadcastss	(%rbx), %xmm2
00000000003b0773	vmaxps	%xmm2, %xmm0, %xmm5
00000000003b0777	vbroadcastss	0x28(%rbx), %xmm8
00000000003b077d	vsubps	%xmm8, %xmm5, %xmm5
00000000003b0782	vmaxps	%xmm3, %xmm7, %xmm8
00000000003b0786	vrsqrtps	%xmm8, %xmm9
00000000003b078b	vmulps	%xmm6, %xmm9, %xmm9
00000000003b078f	vmulps	%xmm9, %xmm8, %xmm10
00000000003b0794	vmulps	%xmm10, %xmm9, %xmm10
00000000003b0799	vmulps	%xmm4, %xmm9, %xmm9
00000000003b079d	vmovaps	0xc0(%rbx), %xmm11
00000000003b07a5	vsubps	%xmm10, %xmm11, %xmm10
00000000003b07aa	vmulps	%xmm10, %xmm9, %xmm9
00000000003b07af	vmulps	%xmm9, %xmm8, %xmm8
00000000003b07b4	vblendps	$0x1, %xmm8, %xmm7, %xmm7       ## xmm7 = xmm8[0],xmm7[1,2,3]
00000000003b07ba	vmaxps	%xmm3, %xmm7, %xmm8
00000000003b07be	vrsqrtps	%xmm8, %xmm9
00000000003b07c3	vmulps	%xmm6, %xmm9, %xmm9
00000000003b07c7	vmulps	%xmm9, %xmm8, %xmm10
00000000003b07cc	vmulps	%xmm10, %xmm9, %xmm10
00000000003b07d1	vmulps	%xmm9, %xmm11, %xmm9
00000000003b07d6	vsubps	%xmm10, %xmm4, %xmm10
00000000003b07db	vmulps	%xmm10, %xmm9, %xmm9
00000000003b07e0	vmulps	%xmm9, %xmm8, %xmm8
00000000003b07e5	vblendps	$0x4, %xmm8, %xmm7, %xmm7       ## xmm7 = xmm7[0,1],xmm8[2],xmm7[3]
00000000003b07eb	vmaxps	%xmm3, %xmm7, %xmm8
00000000003b07ef	vrsqrtps	%xmm8, %xmm9
00000000003b07f4	vmulps	%xmm6, %xmm9, %xmm6
00000000003b07f8	vmulps	%xmm6, %xmm8, %xmm9
00000000003b07fc	vmulps	%xmm6, %xmm9, %xmm9
00000000003b0800	vmulps	%xmm6, %xmm11, %xmm6
00000000003b0804	vsubps	%xmm9, %xmm4, %xmm4
00000000003b0809	vmulps	%xmm4, %xmm6, %xmm4
00000000003b080d	vmulps	%xmm4, %xmm8, %xmm4
00000000003b0811	vblendps	$0x2, %xmm4, %xmm7, %xmm4       ## xmm4 = xmm7[0],xmm4[1],xmm7[2,3]
00000000003b0817	vbroadcastss	0x20(%rbx), %xmm6
00000000003b081d	vmulps	%xmm4, %xmm6, %xmm4
00000000003b0821	vandps	0xe0(%rbx), %xmm5, %xmm7
00000000003b0829	vmovaps	0x100(%rbx), %xmm6
00000000003b0831	vcmpltps	%xmm3, %xmm5, %xmm3
00000000003b0836	vandps	0x120(%rbx), %xmm3, %xmm3
00000000003b083e	vpsrld	$0x17, %xmm5, %xmm5
00000000003b0843	vcvtdq2ps	%xmm5, %xmm5
00000000003b0847	vsubps	%xmm3, %xmm5, %xmm3
00000000003b084b	vsubps	0x140(%rbx), %xmm3, %xmm3
00000000003b0853	vorps	%xmm6, %xmm7, %xmm5
00000000003b0857	vmovaps	0x160(%rbx), %xmm7
00000000003b085f	vcmpltps	%xmm5, %xmm7, %xmm7
00000000003b0864	vandps	%xmm6, %xmm7, %xmm7
00000000003b0868	vaddps	%xmm7, %xmm3, %xmm3
00000000003b086c	vmulps	0x180(%rbx), %xmm7, %xmm7
00000000003b0874	vmulps	%xmm5, %xmm7, %xmm7
00000000003b0878	vsubps	%xmm6, %xmm5, %xmm5
00000000003b087c	vsubps	%xmm7, %xmm5, %xmm5
00000000003b0880	vmulps	0x1a0(%rbx), %xmm5, %xmm7
00000000003b0888	vaddps	0x1c0(%rbx), %xmm7, %xmm7
00000000003b0890	vmulps	0x1e0(%rbx), %xmm5, %xmm8
00000000003b0898	vaddps	0x200(%rbx), %xmm8, %xmm8
00000000003b08a0	vmulps	0x220(%rbx), %xmm5, %xmm9
00000000003b08a8	vmulps	%xmm5, %xmm5, %xmm10
00000000003b08ac	vaddps	0x240(%rbx), %xmm9, %xmm9
00000000003b08b4	vmulps	%xmm8, %xmm10, %xmm8
00000000003b08b9	vaddps	%xmm7, %xmm8, %xmm7
00000000003b08bd	vmulps	%xmm7, %xmm10, %xmm7
00000000003b08c1	vaddps	%xmm7, %xmm9, %xmm7
00000000003b08c5	vmulps	%xmm7, %xmm5, %xmm7
00000000003b08c9	vaddps	0x260(%rbx), %xmm7, %xmm7
00000000003b08d1	vmulps	%xmm7, %xmm5, %xmm5
00000000003b08d5	vaddps	%xmm5, %xmm3, %xmm3
00000000003b08d9	vbroadcastss	0x24(%rbx), %xmm5
00000000003b08df	vmulps	%xmm3, %xmm5, %xmm3
00000000003b08e3	vbroadcastss	0x2c(%rbx), %xmm5
00000000003b08e9	vaddps	%xmm3, %xmm5, %xmm3
00000000003b08ed	vcmpltps	%xmm0, %xmm2, %xmm2
00000000003b08f2	vandps	%xmm6, %xmm2, %xmm2
00000000003b08f6	vblendps	$0x8, %xmm0, %xmm2, %xmm2       ## xmm2 = xmm2[0,1,2],xmm0[3]
00000000003b08fc	vcmpnleps	%xmm1, %xmm2, %xmm1
00000000003b0901	vblendvps	%xmm1, %xmm3, %xmm4, %xmm1
00000000003b0907	vblendps	$0x8, %xmm0, %xmm1, %xmm0       ## xmm0 = xmm1[0,1,2],xmm0[3]
00000000003b090d	vmovaps	%xmm0, (%r8,%r11)
00000000003b0913	jmp	0x3b04f0
00000000003b0918	popq	%rbx
00000000003b0919	popq	%r14
00000000003b091b	popq	%rbp
00000000003b091c	vzeroupper
00000000003b091f	xorl	%eax, %eax
00000000003b0921	retq
00000000003b0922	nopw	%cs:(%rax,%rax)
