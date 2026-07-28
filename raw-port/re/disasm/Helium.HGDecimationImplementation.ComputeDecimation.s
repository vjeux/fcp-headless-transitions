__ZN26HGDecimationImplementation17ComputeDecimationEfffbPfPiPbS2_:
00000000001eecb0	pushq	%rbp
00000000001eecb1	movq	%rsp, %rbp
00000000001eecb4	movaps	%xmm0, %xmm3
00000000001eecb7	mulss	%xmm1, %xmm1
00000000001eecbb	mulss	%xmm0, %xmm3
00000000001eecbf	movaps	%xmm1, %xmm0
00000000001eecc2	subss	%xmm2, %xmm0
00000000001eecc6	xorps	%xmm4, %xmm4
00000000001eecc9	maxss	%xmm4, %xmm0
00000000001eeccd	movaps	%xmm0, %xmm5
00000000001eecd0	testl	%edi, %edi
00000000001eecd2	jne	0x1eecd7
00000000001eecd4	movaps	%xmm1, %xmm5
00000000001eecd7	movaps	%xmm2, %xmm4
00000000001eecda	mulss	%xmm2, %xmm4
00000000001eecde	ucomiss	%xmm5, %xmm3
00000000001eece1	jbe	0x1eed38
00000000001eece3	testb	%dil, %dil
00000000001eece6	je	0x1eed99
00000000001eecec	xorl	%edi, %edi
00000000001eecee	movss	0x1d8fca(%rip), %xmm5
00000000001eecf6	movss	0x1db5ee(%rip), %xmm6
00000000001eecfe	xorps	%xmm7, %xmm7
00000000001eed01	nopw	%cs:(%rax,%rax)
00000000001eed10	subss	%xmm0, %xmm3
00000000001eed14	leal	0x1(%rdi), %eax
00000000001eed17	mulss	%xmm6, %xmm5
00000000001eed1b	movaps	%xmm1, %xmm0
00000000001eed1e	mulss	%xmm5, %xmm0
00000000001eed22	subss	%xmm2, %xmm0
00000000001eed26	maxss	%xmm7, %xmm0
00000000001eed2a	ucomiss	%xmm0, %xmm3
00000000001eed2d	jbe	0x1eed42
00000000001eed2f	cmpl	$0xe, %edi
00000000001eed32	movl	%eax, %edi
00000000001eed34	jb	0x1eed10
00000000001eed36	jmp	0x1eed42
00000000001eed38	movss	0x1d8f80(%rip), %xmm5
00000000001eed40	xorl	%eax, %eax
00000000001eed42	movaps	%xmm3, %xmm1
00000000001eed45	divss	%xmm5, %xmm1
00000000001eed49	movaps	%xmm4, %xmm0
00000000001eed4c	mulss	%xmm5, %xmm0
00000000001eed50	movaps	%xmm3, %xmm6
00000000001eed53	subss	%xmm0, %xmm6
00000000001eed57	movaps	%xmm4, %xmm0
00000000001eed5a	cmpless	%xmm1, %xmm0
00000000001eed5f	blendvps	%xmm0, %xmm6, %xmm3
00000000001eed64	xorps	%xmm0, %xmm0
00000000001eed67	ucomiss	%xmm0, %xmm3
00000000001eed6a	movaps	%xmm3, %xmm6
00000000001eed6d	jbe	0x1eed84
00000000001eed6f	movaps	%xmm3, %xmm6
00000000001eed72	divss	%xmm5, %xmm6
00000000001eed76	xorps	%xmm5, %xmm5
00000000001eed79	sqrtss	%xmm6, %xmm5
00000000001eed7d	minss	%xmm5, %xmm2
00000000001eed81	movaps	%xmm2, %xmm6
00000000001eed84	ucomiss	%xmm4, %xmm1
00000000001eed87	movss	%xmm6, (%rsi)
00000000001eed8b	movl	%eax, (%rdx)
00000000001eed8d	setae	(%rcx)
00000000001eed90	ucomiss	%xmm0, %xmm3
00000000001eed93	seta	(%r8)
00000000001eed97	popq	%rbp
00000000001eed98	retq
00000000001eed99	xorl	%edi, %edi
00000000001eed9b	movss	0x1d8f1d(%rip), %xmm5
00000000001eeda3	movss	0x1db541(%rip), %xmm0
00000000001eedab	nopl	(%rax,%rax)
00000000001eedb0	movaps	%xmm5, %xmm6
00000000001eedb3	mulss	%xmm1, %xmm6
00000000001eedb7	subss	%xmm6, %xmm3
00000000001eedbb	leal	0x1(%rdi), %eax
00000000001eedbe	mulss	%xmm0, %xmm5
00000000001eedc2	movaps	%xmm1, %xmm6
00000000001eedc5	mulss	%xmm5, %xmm6
00000000001eedc9	ucomiss	%xmm6, %xmm3
00000000001eedcc	jbe	0x1eed42
00000000001eedd2	cmpl	$0xe, %edi
00000000001eedd5	movl	%eax, %edi
00000000001eedd7	jb	0x1eedb0
00000000001eedd9	jmp	0x1eed42
00000000001eedde	nop
