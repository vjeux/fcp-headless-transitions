__ZN24HgcBT2100_PQ_InverseOETF14RenderTile_AVXEP6HGTile:
00000000003acb60	movl	0xc(%rsi), %eax
00000000003acb63	subl	0x4(%rsi), %eax
00000000003acb66	jle	0x3ad76c
00000000003acb6c	pushq	%rbp
00000000003acb6d	movq	%rsp, %rbp
00000000003acb70	pushq	%r14
00000000003acb72	pushq	%rbx
00000000003acb73	andq	$-0x20, %rsp
00000000003acb77	subq	$0x260, %rsp                    ## imm = 0x260
00000000003acb7e	movl	0x8(%rsi), %ecx
00000000003acb81	subl	(%rsi), %ecx
00000000003acb83	movslq	0x18(%rsi), %rdx
00000000003acb87	movq	0x10(%rsi), %r8
00000000003acb8b	movq	0x50(%rsi), %r9
00000000003acb8f	movslq	0x58(%rsi), %rsi
00000000003acb93	shlq	$0x4, %rdx
00000000003acb97	shlq	$0x4, %rsi
00000000003acb9b	xorl	%r10d, %r10d
00000000003acb9e	jmp	0x3acbb2
00000000003acba0	addq	%rsi, %r9
00000000003acba3	addq	%rdx, %r8
00000000003acba6	incl	%r10d
00000000003acba9	cmpl	%eax, %r10d
00000000003acbac	je	0x3ad764
00000000003acbb2	movl	$0x0, %r11d
00000000003acbb8	cmpl	$0x2, %ecx
00000000003acbbb	jl	0x3ad1d8
00000000003acbc1	movl	$0x10, %ebx
00000000003acbc6	xorl	%r11d, %r11d
00000000003acbc9	nopl	(%rax)
00000000003acbd0	vmovups	-0x10(%r9,%rbx), %ymm0
00000000003acbd7	movq	0x198(%rdi), %r14
00000000003acbde	vmovups	0x60(%r14), %ymm9
00000000003acbe4	vmovups	0x80(%r14), %ymm1
00000000003acbed	vmovups	0xa0(%r14), %ymm12
00000000003acbf6	vmovups	0xc0(%r14), %ymm11
00000000003acbff	vmaxps	%ymm9, %ymm0, %ymm2
00000000003acc04	vbroadcastss	0x24(%r14), %ymm0
00000000003acc0a	vcmpeqps	%ymm0, %ymm9, %ymm3
00000000003acc0f	vminps	%ymm1, %ymm2, %ymm10
00000000003acc13	vandps	%ymm1, %ymm3, %ymm2
00000000003acc17	vcmpltps	%ymm2, %ymm9, %ymm2
00000000003acc1c	vblendvps	%ymm2, %ymm1, %ymm10, %ymm2
00000000003acc22	vandps	%ymm2, %ymm12, %ymm3
00000000003acc26	vmovaps	%ymm12, 0x1a0(%rsp)
00000000003acc2f	vcmpltps	%ymm11, %ymm2, %ymm6
00000000003acc35	vmovups	0xe0(%r14), %ymm4
00000000003acc3e	vmovaps	%ymm4, 0x140(%rsp)
00000000003acc47	vorps	%ymm1, %ymm3, %ymm3
00000000003acc4b	vpsrld	$0x17, %xmm2, %xmm7
00000000003acc50	vextractf128	$0x1, %ymm2, %xmm2
00000000003acc56	vpsrld	$0x17, %xmm2, %xmm2
00000000003acc5b	vandps	%ymm4, %ymm6, %ymm6
00000000003acc5f	vinsertf128	$0x1, %xmm2, %ymm7, %ymm2
00000000003acc65	vcvtdq2ps	%ymm2, %ymm2
00000000003acc69	vmovups	0x100(%r14), %ymm15
00000000003acc72	vsubps	%ymm6, %ymm2, %ymm2
00000000003acc76	vmovups	0x120(%r14), %ymm14
00000000003acc7f	vcmpltps	%ymm3, %ymm14, %ymm6
00000000003acc84	vmovaps	%ymm14, 0x180(%rsp)
00000000003acc8d	vandps	%ymm1, %ymm6, %ymm6
00000000003acc91	vsubps	%ymm15, %ymm2, %ymm2
00000000003acc96	vmovups	0x140(%r14), %ymm4
00000000003acc9f	vmovaps	%ymm4, 0x120(%rsp)
00000000003acca8	vmulps	%ymm6, %ymm4, %ymm7
00000000003accac	vmulps	%ymm3, %ymm7, %ymm7
00000000003accb0	vaddps	%ymm2, %ymm6, %ymm2
00000000003accb4	vsubps	%ymm1, %ymm3, %ymm3
00000000003accb8	vsubps	%ymm7, %ymm3, %ymm3
00000000003accbc	vmovups	0x160(%r14), %ymm4
00000000003accc5	vmovaps	%ymm4, 0xe0(%rsp)
00000000003accce	vmulps	%ymm3, %ymm4, %ymm6
00000000003accd2	vmovups	0x180(%r14), %ymm4
00000000003accdb	vmovaps	%ymm4, 0xc0(%rsp)
00000000003acce4	vaddps	%ymm6, %ymm4, %ymm6
00000000003acce8	vmovups	0x1a0(%r14), %ymm4
00000000003accf1	vmovaps	%ymm4, 0x220(%rsp)
00000000003accfa	vmulps	%ymm3, %ymm4, %ymm7
00000000003accfe	vmovups	0x1c0(%r14), %ymm4
00000000003acd07	vmovaps	%ymm4, 0xa0(%rsp)
00000000003acd10	vaddps	%ymm7, %ymm4, %ymm7
00000000003acd14	vmulps	%ymm3, %ymm3, %ymm8
00000000003acd18	vmulps	%ymm7, %ymm8, %ymm7
00000000003acd1c	vaddps	%ymm7, %ymm6, %ymm6
00000000003acd20	vmulps	%ymm6, %ymm8, %ymm6
00000000003acd24	vmovups	0x1e0(%r14), %ymm8
00000000003acd2d	vmulps	%ymm3, %ymm8, %ymm7
00000000003acd31	vmovaps	%ymm8, 0x160(%rsp)
00000000003acd3a	vmovups	0x200(%r14), %ymm4
00000000003acd43	vmovaps	%ymm4, 0x200(%rsp)
00000000003acd4c	vaddps	%ymm7, %ymm4, %ymm7
00000000003acd50	vaddps	%ymm6, %ymm7, %ymm6
00000000003acd54	vmulps	%ymm6, %ymm3, %ymm6
00000000003acd58	vmovups	0x220(%r14), %ymm4
00000000003acd61	vmovaps	%ymm4, 0x100(%rsp)
00000000003acd6a	vaddps	%ymm6, %ymm4, %ymm6
00000000003acd6e	vmulps	%ymm6, %ymm3, %ymm3
00000000003acd72	vaddps	%ymm3, %ymm2, %ymm2
00000000003acd76	vmulps	%ymm2, %ymm0, %ymm0
00000000003acd7a	vmovups	0x240(%r14), %ymm2
00000000003acd83	vmovaps	%ymm2, 0x1e0(%rsp)
00000000003acd8c	vmaxps	%ymm2, %ymm0, %ymm0
00000000003acd90	vroundps	$0x9, %ymm0, %ymm2
00000000003acd96	vsubps	%ymm2, %ymm0, %ymm0
00000000003acd9a	vmovups	0x260(%r14), %ymm3
00000000003acda3	vmovaps	%ymm3, 0x1c0(%rsp)
00000000003acdac	vmovups	0x280(%r14), %ymm5
00000000003acdb5	vmovaps	%ymm5, 0x80(%rsp)
00000000003acdbe	vmulps	%ymm3, %ymm0, %ymm3
00000000003acdc2	vaddps	%ymm5, %ymm3, %ymm3
00000000003acdc6	vmulps	%ymm0, %ymm0, %ymm6
00000000003acdca	vmulps	%ymm3, %ymm6, %ymm3
00000000003acdce	vmovups	0x2a0(%r14), %ymm4
00000000003acdd7	vmovaps	%ymm4, 0x60(%rsp)
00000000003acddd	vmulps	%ymm4, %ymm0, %ymm6
00000000003acde1	vmovups	0x2c0(%r14), %ymm4
00000000003acdea	vmovaps	%ymm4, 0x40(%rsp)
00000000003acdf0	vaddps	%ymm4, %ymm6, %ymm6
00000000003acdf4	vaddps	%ymm6, %ymm3, %ymm3
00000000003acdf8	vmulps	%ymm3, %ymm0, %ymm3
00000000003acdfc	vmovups	0x2e0(%r14), %ymm4
00000000003ace05	vmovaps	%ymm4, 0x20(%rsp)
00000000003ace0b	vaddps	%ymm3, %ymm4, %ymm3
00000000003ace0f	vmulps	%ymm3, %ymm0, %ymm3
00000000003ace13	vcvttps2dq	%ymm2, %ymm2
00000000003ace17	vmovdqa	0x300(%r14), %xmm5
00000000003ace20	vextractf128	$0x1, %ymm2, %xmm0
00000000003ace26	vpaddd	%xmm2, %xmm5, %xmm2
00000000003ace2a	vpaddd	%xmm0, %xmm5, %xmm0
00000000003ace2e	vpslld	$0x17, %xmm2, %xmm2
00000000003ace33	vpslld	$0x17, %xmm0, %xmm0
00000000003ace38	vinsertf128	$0x1, %xmm0, %ymm2, %ymm0
00000000003ace3e	vaddps	%ymm3, %ymm1, %ymm2
00000000003ace42	vmulps	%ymm0, %ymm2, %ymm0
00000000003ace46	vbroadcastss	0x8(%r14), %ymm2
00000000003ace4c	vblendps	$0x88, %ymm10, %ymm0, %ymm0     ## ymm0 = ymm0[0,1,2],ymm10[3],ymm0[4,5,6],ymm10[7]
00000000003ace52	vmulps	%ymm0, %ymm2, %ymm2
00000000003ace56	vbroadcastss	0x4(%r14), %ymm3
00000000003ace5c	vaddps	%ymm2, %ymm3, %ymm2
00000000003ace60	vbroadcastss	(%r14), %ymm3
00000000003ace65	vsubps	%ymm3, %ymm0, %ymm0
00000000003ace69	vblendps	$0x88, %ymm10, %ymm2, %ymm3     ## ymm3 = ymm2[0,1,2],ymm10[3],ymm2[4,5,6],ymm10[7]
00000000003ace6f	vmovaps	%ymm10, (%rsp)
00000000003ace74	vrcpps	%ymm3, %ymm3
00000000003ace78	vmulps	0x320(%r14), %ymm3, %ymm3
00000000003ace81	vminps	0x340(%r14), %ymm3, %ymm3
00000000003ace8a	vmaxps	0x360(%r14), %ymm3, %ymm3
00000000003ace93	vmulps	%ymm2, %ymm3, %ymm2
00000000003ace97	vmovups	0x380(%r14), %ymm13
00000000003acea0	vsubps	%ymm2, %ymm13, %ymm2
00000000003acea4	vmulps	%ymm2, %ymm3, %ymm2
00000000003acea8	vmaxps	%ymm9, %ymm0, %ymm0
00000000003acead	vmulps	%ymm2, %ymm0, %ymm0
00000000003aceb1	vblendps	$0x88, %ymm10, %ymm0, %ymm2     ## ymm2 = ymm0[0,1,2],ymm10[3],ymm0[4,5,6],ymm10[7]
00000000003aceb7	vbroadcastss	0x20(%r14), %ymm4
00000000003acebd	vcmpeqps	%ymm4, %ymm9, %ymm3
00000000003acec2	vandps	%ymm1, %ymm3, %ymm3
00000000003acec6	vcmpltps	%ymm3, %ymm9, %ymm3
00000000003acecb	vblendvps	%ymm3, %ymm1, %ymm2, %ymm2
00000000003aced1	vandps	%ymm2, %ymm12, %ymm3
00000000003aced5	vorps	%ymm1, %ymm3, %ymm3
00000000003aced9	vcmpltps	%ymm3, %ymm14, %ymm13
00000000003acede	vandps	%ymm1, %ymm13, %ymm13
00000000003acee2	vmulps	0x120(%rsp), %ymm13, %ymm14
00000000003aceeb	vmulps	%ymm3, %ymm14, %ymm14
00000000003aceef	vsubps	%ymm1, %ymm3, %ymm3
00000000003acef3	vsubps	%ymm14, %ymm3, %ymm3
00000000003acef8	vextractf128	$0x1, %ymm2, %xmm14
00000000003acefe	vpsrld	$0x17, %xmm14, %xmm14
00000000003acf04	vpsrld	$0x17, %xmm2, %xmm12
00000000003acf09	vinsertf128	$0x1, %xmm14, %ymm12, %ymm12
00000000003acf0f	vmovaps	%ymm11, %ymm6
00000000003acf13	vcmpltps	%ymm11, %ymm2, %ymm2
00000000003acf19	vmovaps	0x140(%rsp), %ymm7
00000000003acf22	vandps	%ymm7, %ymm2, %ymm2
00000000003acf26	vcvtdq2ps	%ymm12, %ymm12
00000000003acf2b	vsubps	%ymm2, %ymm12, %ymm2
00000000003acf2f	vmulps	0xe0(%rsp), %ymm3, %ymm12
00000000003acf38	vaddps	0xc0(%rsp), %ymm12, %ymm12
00000000003acf41	vmovaps	0x220(%rsp), %ymm11
00000000003acf4a	vmulps	%ymm3, %ymm11, %ymm14
00000000003acf4e	vaddps	0xa0(%rsp), %ymm14, %ymm14
00000000003acf57	vmulps	%ymm3, %ymm3, %ymm0
00000000003acf5b	vmulps	%ymm0, %ymm14, %ymm14
00000000003acf5f	vaddps	%ymm14, %ymm12, %ymm12
00000000003acf64	vmulps	%ymm0, %ymm12, %ymm0
00000000003acf68	vmulps	%ymm3, %ymm8, %ymm12
00000000003acf6c	vmovaps	0x200(%rsp), %ymm8
00000000003acf75	vaddps	%ymm12, %ymm8, %ymm12
00000000003acf7a	vaddps	%ymm0, %ymm12, %ymm0
00000000003acf7e	vmulps	%ymm0, %ymm3, %ymm0
00000000003acf82	vaddps	0x100(%rsp), %ymm0, %ymm0
00000000003acf8b	vmulps	%ymm0, %ymm3, %ymm0
00000000003acf8f	vmovaps	%ymm15, %ymm14
00000000003acf94	vsubps	%ymm15, %ymm2, %ymm2
00000000003acf99	vaddps	%ymm2, %ymm13, %ymm2
00000000003acf9d	vaddps	%ymm0, %ymm2, %ymm0
00000000003acfa1	vmulps	%ymm0, %ymm4, %ymm0
00000000003acfa5	vmovaps	0x1e0(%rsp), %ymm10
00000000003acfae	vmaxps	%ymm10, %ymm0, %ymm0
00000000003acfb3	vroundps	$0x9, %ymm0, %ymm2
00000000003acfb9	vsubps	%ymm2, %ymm0, %ymm0
00000000003acfbd	vmovaps	0x1c0(%rsp), %ymm15
00000000003acfc6	vmulps	%ymm0, %ymm15, %ymm3
00000000003acfca	vaddps	0x80(%rsp), %ymm3, %ymm3
00000000003acfd3	vmulps	%ymm0, %ymm0, %ymm4
00000000003acfd7	vmulps	%ymm3, %ymm4, %ymm3
00000000003acfdb	vmulps	0x60(%rsp), %ymm0, %ymm4
00000000003acfe1	vaddps	0x40(%rsp), %ymm4, %ymm4
00000000003acfe7	vaddps	%ymm3, %ymm4, %ymm3
00000000003acfeb	vmulps	%ymm3, %ymm0, %ymm3
00000000003acfef	vaddps	0x20(%rsp), %ymm3, %ymm3
00000000003acff5	vmulps	%ymm3, %ymm0, %ymm0
00000000003acff9	vcvttps2dq	%ymm2, %ymm2
00000000003acffd	vpaddd	%xmm2, %xmm5, %xmm3
00000000003ad001	vextractf128	$0x1, %ymm2, %xmm2
00000000003ad007	vpaddd	%xmm2, %xmm5, %xmm2
00000000003ad00b	vpslld	$0x17, %xmm3, %xmm3
00000000003ad010	vpslld	$0x17, %xmm2, %xmm2
00000000003ad015	vinsertf128	$0x1, %xmm2, %ymm3, %ymm2
00000000003ad01b	vaddps	%ymm0, %ymm1, %ymm0
00000000003ad01f	vmulps	%ymm2, %ymm0, %ymm2
00000000003ad023	vbroadcastss	0x40(%r14), %ymm0
00000000003ad029	vbroadcastss	0x44(%r14), %ymm3
00000000003ad02f	vmulps	%ymm2, %ymm0, %ymm0
00000000003ad033	vaddps	%ymm0, %ymm3, %ymm3
00000000003ad037	vbroadcastss	0x28(%r14), %ymm0
00000000003ad03d	vcmpeqps	%ymm0, %ymm9, %ymm4
00000000003ad042	vandps	%ymm1, %ymm4, %ymm4
00000000003ad046	vcmpltps	%ymm4, %ymm9, %ymm4
00000000003ad04b	vblendps	$0x88, (%rsp), %ymm3, %ymm3     ## ymm3 = ymm3[0,1,2],mem[3],ymm3[4,5,6],mem[7]
00000000003ad052	vblendvps	%ymm4, %ymm1, %ymm3, %ymm3
00000000003ad058	vcmpltps	%ymm6, %ymm3, %ymm4
00000000003ad05d	vandps	%ymm7, %ymm4, %ymm4
00000000003ad061	vandps	0x1a0(%rsp), %ymm3, %ymm12
00000000003ad06a	vpsrld	$0x17, %xmm3, %xmm13
00000000003ad06f	vextractf128	$0x1, %ymm3, %xmm3
00000000003ad075	vpsrld	$0x17, %xmm3, %xmm3
00000000003ad07a	vinsertf128	$0x1, %xmm3, %ymm13, %ymm3
00000000003ad080	vcvtdq2ps	%ymm3, %ymm3
00000000003ad084	vsubps	%ymm4, %ymm3, %ymm3
00000000003ad088	vsubps	%ymm14, %ymm3, %ymm3
00000000003ad08d	vorps	%ymm1, %ymm12, %ymm4
00000000003ad091	vmovaps	0x180(%rsp), %ymm6
00000000003ad09a	vcmpltps	%ymm4, %ymm6, %ymm12
00000000003ad09f	vandps	%ymm1, %ymm12, %ymm12
00000000003ad0a3	vmulps	0x120(%rsp), %ymm12, %ymm13
00000000003ad0ac	vmulps	%ymm4, %ymm13, %ymm13
00000000003ad0b0	vsubps	%ymm1, %ymm4, %ymm4
00000000003ad0b4	vsubps	%ymm13, %ymm4, %ymm4
00000000003ad0b9	vaddps	%ymm3, %ymm12, %ymm3
00000000003ad0bd	vmulps	0xe0(%rsp), %ymm4, %ymm12
00000000003ad0c6	vaddps	0xc0(%rsp), %ymm12, %ymm12
00000000003ad0cf	vmulps	%ymm4, %ymm11, %ymm13
00000000003ad0d3	vaddps	0xa0(%rsp), %ymm13, %ymm13
00000000003ad0dc	vmulps	0x160(%rsp), %ymm4, %ymm14
00000000003ad0e5	vaddps	%ymm14, %ymm8, %ymm11
00000000003ad0ea	vmulps	%ymm4, %ymm4, %ymm14
00000000003ad0ee	vmulps	%ymm13, %ymm14, %ymm13
00000000003ad0f3	vaddps	%ymm13, %ymm12, %ymm12
00000000003ad0f8	vmulps	%ymm12, %ymm14, %ymm12
00000000003ad0fd	vaddps	%ymm12, %ymm11, %ymm11
00000000003ad102	vmulps	%ymm4, %ymm11, %ymm11
00000000003ad106	vaddps	0x100(%rsp), %ymm11, %ymm11
00000000003ad10f	vmulps	%ymm4, %ymm11, %ymm4
00000000003ad113	vaddps	%ymm4, %ymm3, %ymm3
00000000003ad117	vmulps	%ymm3, %ymm0, %ymm0
00000000003ad11b	vmaxps	%ymm10, %ymm0, %ymm0
00000000003ad120	vroundps	$0x9, %ymm0, %ymm3
00000000003ad126	vsubps	%ymm3, %ymm0, %ymm0
00000000003ad12a	vmulps	%ymm0, %ymm15, %ymm4
00000000003ad12e	vaddps	0x80(%rsp), %ymm4, %ymm4
00000000003ad137	vmulps	%ymm0, %ymm0, %ymm11
00000000003ad13b	vmulps	%ymm4, %ymm11, %ymm4
00000000003ad13f	vmulps	0x60(%rsp), %ymm0, %ymm8
00000000003ad145	vaddps	0x40(%rsp), %ymm8, %ymm7
00000000003ad14b	vaddps	%ymm4, %ymm7, %ymm4
00000000003ad14f	vmulps	%ymm4, %ymm0, %ymm4
00000000003ad153	vaddps	0x20(%rsp), %ymm4, %ymm4
00000000003ad159	vcvttps2dq	%ymm3, %ymm3
00000000003ad15d	vpaddd	%xmm3, %xmm5, %xmm6
00000000003ad161	vextractf128	$0x1, %ymm3, %xmm3
00000000003ad167	vpaddd	%xmm3, %xmm5, %xmm3
00000000003ad16b	vpslld	$0x17, %xmm6, %xmm5
00000000003ad170	vpslld	$0x17, %xmm3, %xmm3
00000000003ad175	vinsertf128	$0x1, %xmm3, %ymm5, %ymm3
00000000003ad17b	vmulps	%ymm4, %ymm0, %ymm0
00000000003ad17f	vbroadcastss	0x4c(%r14), %ymm4
00000000003ad185	vbroadcastss	0x48(%r14), %ymm5
00000000003ad18b	vmulps	%ymm2, %ymm5, %ymm5
00000000003ad18f	vcmpltps	%ymm2, %ymm4, %ymm2
00000000003ad194	vaddps	%ymm0, %ymm1, %ymm0
00000000003ad198	vmulps	%ymm3, %ymm0, %ymm0
00000000003ad19c	vandps	%ymm1, %ymm2, %ymm1
00000000003ad1a0	vcmpltps	%ymm1, %ymm9, %ymm1
00000000003ad1a5	vblendvps	%ymm1, %ymm0, %ymm5, %ymm0
00000000003ad1ab	vblendps	$0x88, (%rsp), %ymm0, %ymm0     ## ymm0 = ymm0[0,1,2],mem[3],ymm0[4,5,6],mem[7]
00000000003ad1b2	vmovups	%ymm0, -0x10(%r8,%rbx)
00000000003ad1b9	addq	$0x20, %rbx
00000000003ad1bd	movl	%r11d, %r14d
00000000003ad1c0	addl	$-0x2, %r11d
00000000003ad1c4	addl	%ecx, %r14d
00000000003ad1c7	addl	$-0x2, %r14d
00000000003ad1cb	cmpl	$0x1, %r14d
00000000003ad1cf	jg	0x3acbd0
00000000003ad1d5	negl	%r11d
00000000003ad1d8	cmpl	%ecx, %r11d
00000000003ad1db	jge	0x3acba0
00000000003ad1e1	movl	%r11d, %r11d
00000000003ad1e4	shlq	$0x4, %r11
00000000003ad1e8	vmovaps	(%r9,%r11), %xmm0
00000000003ad1ee	movq	0x198(%rdi), %rbx
00000000003ad1f5	vmovaps	0x60(%rbx), %xmm4
00000000003ad1fa	vmovaps	0x80(%rbx), %xmm2
00000000003ad202	vmaxps	%xmm4, %xmm0, %xmm0
00000000003ad206	vminps	%xmm2, %xmm0, %xmm9
00000000003ad20a	vbroadcastss	0x24(%rbx), %xmm0
00000000003ad210	vcmpeqps	%xmm4, %xmm0, %xmm1
00000000003ad215	vandps	%xmm2, %xmm1, %xmm1
00000000003ad219	vcmpnleps	%xmm4, %xmm1, %xmm1
00000000003ad21e	vblendvps	%xmm1, %xmm2, %xmm9, %xmm1
00000000003ad224	vmovaps	0xa0(%rbx), %xmm3
00000000003ad22c	vmovaps	%xmm3, 0x120(%rsp)
00000000003ad235	vandps	%xmm1, %xmm3, %xmm5
00000000003ad239	vorps	%xmm2, %xmm5, %xmm5
00000000003ad23d	vmovaps	0xc0(%rbx), %xmm15
00000000003ad245	vcmpltps	%xmm15, %xmm1, %xmm6
00000000003ad24b	vmovaps	0xe0(%rbx), %xmm10
00000000003ad253	vandps	%xmm6, %xmm10, %xmm6
00000000003ad257	vpsrld	$0x17, %xmm1, %xmm1
00000000003ad25c	vcvtdq2ps	%xmm1, %xmm1
00000000003ad260	vsubps	%xmm6, %xmm1, %xmm1
00000000003ad264	vmovaps	0x100(%rbx), %xmm3
00000000003ad26c	vmovaps	%xmm3, 0x220(%rsp)
00000000003ad275	vsubps	%xmm3, %xmm1, %xmm1
00000000003ad279	vmovaps	0x120(%rbx), %xmm3
00000000003ad281	vmovaps	%xmm3, 0xa0(%rsp)
00000000003ad28a	vcmpltps	%xmm5, %xmm3, %xmm6
00000000003ad28f	vandps	%xmm2, %xmm6, %xmm6
00000000003ad293	vaddps	%xmm6, %xmm1, %xmm1
00000000003ad297	vmovaps	0x140(%rbx), %xmm3
00000000003ad29f	vmovaps	%xmm3, 0x200(%rsp)
00000000003ad2a8	vmulps	%xmm6, %xmm3, %xmm6
00000000003ad2ac	vmulps	%xmm5, %xmm6, %xmm6
00000000003ad2b0	vsubps	%xmm2, %xmm5, %xmm5
00000000003ad2b4	vsubps	%xmm6, %xmm5, %xmm5
00000000003ad2b8	vmovaps	0x160(%rbx), %xmm14
00000000003ad2c0	vmulps	%xmm5, %xmm14, %xmm6
00000000003ad2c4	vmovaps	%xmm14, 0x160(%rsp)
00000000003ad2cd	vmovaps	0x180(%rbx), %xmm11
00000000003ad2d5	vaddps	%xmm6, %xmm11, %xmm6
00000000003ad2d9	vmovaps	%xmm11, 0x250(%rsp)
00000000003ad2e2	vmovaps	0x1a0(%rbx), %xmm3
00000000003ad2ea	vmovaps	%xmm3, 0x1e0(%rsp)
00000000003ad2f3	vmulps	%xmm5, %xmm3, %xmm7
00000000003ad2f7	vmovaps	0x1c0(%rbx), %xmm3
00000000003ad2ff	vmovaps	%xmm3, 0x1c0(%rsp)
00000000003ad308	vaddps	%xmm7, %xmm3, %xmm7
00000000003ad30c	vmulps	%xmm5, %xmm5, %xmm8
00000000003ad310	vmulps	%xmm7, %xmm8, %xmm7
00000000003ad314	vaddps	%xmm7, %xmm6, %xmm6
00000000003ad318	vmulps	%xmm6, %xmm8, %xmm6
00000000003ad31c	vmovaps	0x1e0(%rbx), %xmm3
00000000003ad324	vmovaps	%xmm3, 0x1a0(%rsp)
00000000003ad32d	vmulps	%xmm5, %xmm3, %xmm7
00000000003ad331	vmovaps	0x200(%rbx), %xmm3
00000000003ad339	vmovaps	%xmm3, 0x180(%rsp)
00000000003ad342	vaddps	%xmm7, %xmm3, %xmm7
00000000003ad346	vaddps	%xmm6, %xmm7, %xmm6
00000000003ad34a	vmulps	%xmm6, %xmm5, %xmm6
00000000003ad34e	vmovaps	0x220(%rbx), %xmm3
00000000003ad356	vmovaps	%xmm3, 0xe0(%rsp)
00000000003ad35f	vaddps	%xmm6, %xmm3, %xmm6
00000000003ad363	vmulps	%xmm6, %xmm5, %xmm5
00000000003ad367	vaddps	%xmm5, %xmm1, %xmm1
00000000003ad36b	vmulps	%xmm1, %xmm0, %xmm0
00000000003ad36f	vmovaps	0x240(%rbx), %xmm1
00000000003ad377	vmovaps	%xmm1, 0x100(%rsp)
00000000003ad380	vmaxps	%xmm1, %xmm0, %xmm0
00000000003ad384	vroundps	$0x9, %xmm0, %xmm1
00000000003ad38a	vsubps	%xmm1, %xmm0, %xmm0
00000000003ad38e	vmovaps	0x260(%rbx), %xmm3
00000000003ad396	vmovaps	%xmm3, 0xc0(%rsp)
00000000003ad39f	vmulps	%xmm3, %xmm0, %xmm5
00000000003ad3a3	vmovaps	0x280(%rbx), %xmm3
00000000003ad3ab	vmovaps	%xmm3, 0x80(%rsp)
00000000003ad3b4	vaddps	%xmm3, %xmm5, %xmm5
00000000003ad3b8	vmulps	%xmm0, %xmm0, %xmm6
00000000003ad3bc	vmulps	%xmm5, %xmm6, %xmm5
00000000003ad3c0	vmovaps	0x2a0(%rbx), %xmm3
00000000003ad3c8	vmovaps	%xmm3, 0x60(%rsp)
00000000003ad3ce	vmulps	%xmm3, %xmm0, %xmm6
00000000003ad3d2	vmovaps	0x2c0(%rbx), %xmm3
00000000003ad3da	vmovaps	%xmm3, 0x40(%rsp)
00000000003ad3e0	vaddps	%xmm3, %xmm6, %xmm6
00000000003ad3e4	vaddps	%xmm6, %xmm5, %xmm5
00000000003ad3e8	vmulps	%xmm5, %xmm0, %xmm5
00000000003ad3ec	vmovaps	0x2e0(%rbx), %xmm3
00000000003ad3f4	vmovaps	%xmm3, 0x20(%rsp)
00000000003ad3fa	vaddps	%xmm5, %xmm3, %xmm5
00000000003ad3fe	vmulps	%xmm5, %xmm0, %xmm0
00000000003ad402	vaddps	%xmm0, %xmm2, %xmm0
00000000003ad406	vcvttps2dq	%xmm1, %xmm1
00000000003ad40a	vmovdqa	0x300(%rbx), %xmm3
00000000003ad412	vmovdqa	%xmm3, (%rsp)
00000000003ad417	vpaddd	%xmm1, %xmm3, %xmm1
00000000003ad41b	vpslld	$0x17, %xmm1, %xmm1
00000000003ad420	vmulps	%xmm1, %xmm0, %xmm0
00000000003ad424	vblendps	$0x8, %xmm9, %xmm0, %xmm0       ## xmm0 = xmm0[0,1,2],xmm9[3]
00000000003ad42a	vbroadcastss	0x8(%rbx), %xmm1
00000000003ad430	vmulps	%xmm0, %xmm1, %xmm1
00000000003ad434	vbroadcastss	0x4(%rbx), %xmm12
00000000003ad43a	vaddps	%xmm1, %xmm12, %xmm1
00000000003ad43e	vblendps	$0x8, %xmm9, %xmm1, %xmm12      ## xmm12 = xmm1[0,1,2],xmm9[3]
00000000003ad444	vmovaps	%xmm9, 0x140(%rsp)
00000000003ad44d	vrcpps	%xmm12, %xmm12
00000000003ad452	vmulps	0x320(%rbx), %xmm12, %xmm12
00000000003ad45a	vminps	0x340(%rbx), %xmm12, %xmm12
00000000003ad462	vbroadcastss	(%rbx), %xmm13
00000000003ad467	vsubps	%xmm13, %xmm0, %xmm0
00000000003ad46c	vmaxps	0x360(%rbx), %xmm12, %xmm12
00000000003ad474	vmulps	%xmm1, %xmm12, %xmm1
00000000003ad478	vmovaps	0x380(%rbx), %xmm13
00000000003ad480	vsubps	%xmm1, %xmm13, %xmm1
00000000003ad484	vmulps	%xmm1, %xmm12, %xmm1
00000000003ad488	vmaxps	%xmm4, %xmm0, %xmm0
00000000003ad48c	vmulps	%xmm1, %xmm0, %xmm0
00000000003ad490	vblendps	$0x8, %xmm9, %xmm0, %xmm1       ## xmm1 = xmm0[0,1,2],xmm9[3]
00000000003ad496	vbroadcastss	0x20(%rbx), %xmm3
00000000003ad49c	vcmpeqps	%xmm4, %xmm3, %xmm12
00000000003ad4a1	vandps	%xmm2, %xmm12, %xmm12
00000000003ad4a5	vcmpnleps	%xmm4, %xmm12, %xmm12
00000000003ad4aa	vblendvps	%xmm12, %xmm2, %xmm1, %xmm1
00000000003ad4b0	vcmpltps	%xmm15, %xmm1, %xmm12
00000000003ad4b6	vandps	%xmm10, %xmm12, %xmm12
00000000003ad4bb	vpsrld	$0x17, %xmm1, %xmm13
00000000003ad4c0	vcvtdq2ps	%xmm13, %xmm13
00000000003ad4c5	vsubps	%xmm12, %xmm13, %xmm12
00000000003ad4ca	vandps	0x120(%rsp), %xmm1, %xmm1
00000000003ad4d3	vorps	%xmm2, %xmm1, %xmm1
00000000003ad4d7	vmovaps	0x220(%rsp), %xmm7
00000000003ad4e0	vsubps	%xmm7, %xmm12, %xmm12
00000000003ad4e4	vmovaps	0xa0(%rsp), %xmm0
00000000003ad4ed	vcmpltps	%xmm1, %xmm0, %xmm13
00000000003ad4f2	vandps	%xmm2, %xmm13, %xmm13
00000000003ad4f6	vaddps	%xmm13, %xmm12, %xmm12
00000000003ad4fb	vmovaps	0x200(%rsp), %xmm9
00000000003ad504	vmulps	%xmm13, %xmm9, %xmm13
00000000003ad509	vmulps	%xmm1, %xmm13, %xmm13
00000000003ad50d	vsubps	%xmm2, %xmm1, %xmm1
00000000003ad511	vsubps	%xmm13, %xmm1, %xmm1
00000000003ad516	vmulps	%xmm1, %xmm14, %xmm13
00000000003ad51a	vaddps	%xmm13, %xmm11, %xmm13
00000000003ad51f	vmovaps	0x1e0(%rsp), %xmm8
00000000003ad528	vmulps	%xmm1, %xmm8, %xmm14
00000000003ad52c	vmovaps	0x1c0(%rsp), %xmm11
00000000003ad535	vaddps	%xmm14, %xmm11, %xmm14
00000000003ad53a	vmulps	%xmm1, %xmm1, %xmm0
00000000003ad53e	vmulps	%xmm0, %xmm14, %xmm14
00000000003ad542	vaddps	%xmm14, %xmm13, %xmm13
00000000003ad547	vmulps	%xmm0, %xmm13, %xmm0
00000000003ad54b	vmovaps	0x1a0(%rsp), %xmm5
00000000003ad554	vmulps	%xmm1, %xmm5, %xmm13
00000000003ad558	vmovaps	0x180(%rsp), %xmm6
00000000003ad561	vaddps	%xmm6, %xmm13, %xmm13
00000000003ad565	vaddps	%xmm0, %xmm13, %xmm0
00000000003ad569	vmulps	%xmm0, %xmm1, %xmm0
00000000003ad56d	vaddps	0xe0(%rsp), %xmm0, %xmm0
00000000003ad576	vmulps	%xmm0, %xmm1, %xmm0
00000000003ad57a	vaddps	%xmm0, %xmm12, %xmm0
00000000003ad57e	vmulps	%xmm0, %xmm3, %xmm0
00000000003ad582	vmaxps	0x100(%rsp), %xmm0, %xmm0
00000000003ad58b	vroundps	$0x9, %xmm0, %xmm1
00000000003ad591	vsubps	%xmm1, %xmm0, %xmm0
00000000003ad595	vmulps	0xc0(%rsp), %xmm0, %xmm3
00000000003ad59e	vaddps	0x80(%rsp), %xmm3, %xmm3
00000000003ad5a7	vmulps	%xmm0, %xmm0, %xmm12
00000000003ad5ab	vmulps	%xmm3, %xmm12, %xmm3
00000000003ad5af	vmulps	0x60(%rsp), %xmm0, %xmm12
00000000003ad5b5	vaddps	0x40(%rsp), %xmm12, %xmm12
00000000003ad5bb	vaddps	%xmm3, %xmm12, %xmm3
00000000003ad5bf	vmulps	%xmm3, %xmm0, %xmm3
00000000003ad5c3	vaddps	0x20(%rsp), %xmm3, %xmm3
00000000003ad5c9	vmulps	%xmm3, %xmm0, %xmm0
00000000003ad5cd	vaddps	%xmm0, %xmm2, %xmm0
00000000003ad5d1	vcvttps2dq	%xmm1, %xmm1
00000000003ad5d5	vpaddd	(%rsp), %xmm1, %xmm1
00000000003ad5da	vpslld	$0x17, %xmm1, %xmm1
00000000003ad5df	vmulps	%xmm1, %xmm0, %xmm1
00000000003ad5e3	vbroadcastss	0x40(%rbx), %xmm0
00000000003ad5e9	vmulps	%xmm1, %xmm0, %xmm0
00000000003ad5ed	vbroadcastss	0x44(%rbx), %xmm3
00000000003ad5f3	vaddps	%xmm0, %xmm3, %xmm0
00000000003ad5f7	vblendps	$0x8, 0x140(%rsp), %xmm0, %xmm3 ## xmm3 = xmm0[0,1,2],mem[3]
00000000003ad602	vbroadcastss	0x28(%rbx), %xmm0
00000000003ad608	vcmpeqps	%xmm4, %xmm0, %xmm12
00000000003ad60d	vandps	%xmm2, %xmm12, %xmm12
00000000003ad611	vcmpnleps	%xmm4, %xmm12, %xmm12
00000000003ad616	vblendvps	%xmm12, %xmm2, %xmm3, %xmm3
00000000003ad61c	vcmpltps	%xmm15, %xmm3, %xmm12
00000000003ad622	vandps	%xmm10, %xmm12, %xmm12
00000000003ad627	vandps	0x120(%rsp), %xmm3, %xmm13
00000000003ad630	vpsrld	$0x17, %xmm3, %xmm3
00000000003ad635	vcvtdq2ps	%xmm3, %xmm3
00000000003ad639	vsubps	%xmm12, %xmm3, %xmm3
00000000003ad63e	vsubps	%xmm7, %xmm3, %xmm3
00000000003ad642	vorps	%xmm2, %xmm13, %xmm12
00000000003ad646	vmovaps	0xa0(%rsp), %xmm7
00000000003ad64f	vcmpltps	%xmm12, %xmm7, %xmm13
00000000003ad655	vandps	%xmm2, %xmm13, %xmm13
00000000003ad659	vaddps	%xmm3, %xmm13, %xmm3
00000000003ad65d	vmulps	%xmm13, %xmm9, %xmm13
00000000003ad662	vmulps	%xmm12, %xmm13, %xmm13
00000000003ad667	vsubps	%xmm2, %xmm12, %xmm12
00000000003ad66b	vsubps	%xmm13, %xmm12, %xmm12
00000000003ad670	vmulps	0x160(%rsp), %xmm12, %xmm13
00000000003ad679	vaddps	0x250(%rsp), %xmm13, %xmm13
00000000003ad682	vmulps	%xmm12, %xmm8, %xmm14
00000000003ad687	vaddps	%xmm14, %xmm11, %xmm14
00000000003ad68c	vmulps	%xmm5, %xmm12, %xmm15
00000000003ad690	vaddps	%xmm6, %xmm15, %xmm11
00000000003ad694	vmulps	%xmm12, %xmm12, %xmm15
00000000003ad699	vmulps	%xmm14, %xmm15, %xmm14
00000000003ad69e	vaddps	%xmm14, %xmm13, %xmm13
00000000003ad6a3	vmulps	%xmm13, %xmm15, %xmm13
00000000003ad6a8	vaddps	%xmm13, %xmm11, %xmm11
00000000003ad6ad	vmulps	%xmm11, %xmm12, %xmm11
00000000003ad6b2	vaddps	0xe0(%rsp), %xmm11, %xmm11
00000000003ad6bb	vmulps	%xmm11, %xmm12, %xmm11
00000000003ad6c0	vaddps	%xmm3, %xmm11, %xmm3
00000000003ad6c4	vmulps	%xmm3, %xmm0, %xmm0
00000000003ad6c8	vmaxps	0x100(%rsp), %xmm0, %xmm0
00000000003ad6d1	vroundps	$0x9, %xmm0, %xmm3
00000000003ad6d7	vsubps	%xmm3, %xmm0, %xmm0
00000000003ad6db	vmulps	0xc0(%rsp), %xmm0, %xmm11
00000000003ad6e4	vaddps	0x80(%rsp), %xmm11, %xmm10
00000000003ad6ed	vmulps	%xmm0, %xmm0, %xmm11
00000000003ad6f1	vmulps	%xmm10, %xmm11, %xmm10
00000000003ad6f6	vmulps	0x60(%rsp), %xmm0, %xmm8
00000000003ad6fc	vaddps	0x40(%rsp), %xmm8, %xmm7
00000000003ad702	vaddps	%xmm7, %xmm10, %xmm7
00000000003ad706	vmulps	%xmm7, %xmm0, %xmm7
00000000003ad70a	vaddps	0x20(%rsp), %xmm7, %xmm6
00000000003ad710	vmulps	%xmm6, %xmm0, %xmm0
00000000003ad714	vcvttps2dq	%xmm3, %xmm3
00000000003ad718	vpaddd	(%rsp), %xmm3, %xmm3
00000000003ad71d	vbroadcastss	0x48(%rbx), %xmm5
00000000003ad723	vmulps	%xmm1, %xmm5, %xmm5
00000000003ad727	vaddps	%xmm0, %xmm2, %xmm0
00000000003ad72b	vpslld	$0x17, %xmm3, %xmm3
00000000003ad730	vmulps	%xmm3, %xmm0, %xmm0
00000000003ad734	vbroadcastss	0x4c(%rbx), %xmm3
00000000003ad73a	vcmpltps	%xmm1, %xmm3, %xmm1
00000000003ad73f	vandps	%xmm2, %xmm1, %xmm1
00000000003ad743	vcmpnleps	%xmm4, %xmm1, %xmm1
00000000003ad748	vblendvps	%xmm1, %xmm0, %xmm5, %xmm0
00000000003ad74e	vblendps	$0x8, 0x140(%rsp), %xmm0, %xmm0 ## xmm0 = xmm0[0,1,2],mem[3]
00000000003ad759	vmovaps	%xmm0, (%r8,%r11)
00000000003ad75f	jmp	0x3acba0
00000000003ad764	leaq	-0x10(%rbp), %rsp
00000000003ad768	popq	%rbx
00000000003ad769	popq	%r14
00000000003ad76b	popq	%rbp
00000000003ad76c	vzeroupper
00000000003ad76f	xorl	%eax, %eax
00000000003ad771	retq
00000000003ad772	nopw	%cs:(%rax,%rax)
