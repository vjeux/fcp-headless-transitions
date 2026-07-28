__ZNK15PCSimplePolygon8centroidEv:
00000000000c423a	pushq	%rbp
00000000000c423b	movq	%rsp, %rbp
00000000000c423e	movq	%rdi, %rax
00000000000c4241	movq	0x8(%rsi), %rcx
00000000000c4245	movq	0x10(%rsi), %rdx
00000000000c4249	subq	%rcx, %rdx
00000000000c424c	sarq	$0x4, %rdx
00000000000c4250	decq	%rdx
00000000000c4253	je	0xc42a9
00000000000c4255	movupd	(%rcx), %xmm0
00000000000c4259	leaq	0x10(%rcx), %rsi
00000000000c425d	xorpd	%xmm1, %xmm1
00000000000c4261	xorpd	%xmm2, %xmm2
00000000000c4265	movq	%rdx, %rdi
00000000000c4268	movapd	%xmm0, %xmm3
00000000000c426c	movupd	(%rsi), %xmm4
00000000000c4270	movapd	%xmm4, %xmm5
00000000000c4274	shufpd	$0x1, %xmm4, %xmm5              ## xmm5 = xmm5[1],xmm4[0]
00000000000c4279	mulpd	%xmm3, %xmm5
00000000000c427d	hsubpd	%xmm5, %xmm5
00000000000c4281	addsd	%xmm5, %xmm2
00000000000c4285	addpd	%xmm4, %xmm3
00000000000c4289	mulpd	%xmm5, %xmm3
00000000000c428d	addpd	%xmm3, %xmm1
00000000000c4291	addq	$0x10, %rsi
00000000000c4295	movapd	%xmm4, %xmm3
00000000000c4299	decq	%rdi
00000000000c429c	jne	0xc426c
00000000000c429e	shlq	$0x4, %rdx
00000000000c42a2	movupd	(%rcx,%rdx), %xmm3
00000000000c42a7	jmp	0xc42b9
00000000000c42a9	movupd	(%rcx), %xmm0
00000000000c42ad	xorpd	%xmm1, %xmm1
00000000000c42b1	xorpd	%xmm2, %xmm2
00000000000c42b5	movapd	%xmm0, %xmm3
00000000000c42b9	movapd	%xmm0, %xmm4
00000000000c42bd	shufpd	$0x1, %xmm0, %xmm4              ## xmm4 = xmm4[1],xmm0[0]
00000000000c42c2	mulpd	%xmm3, %xmm4
00000000000c42c6	hsubpd	%xmm4, %xmm4
00000000000c42ca	addsd	%xmm4, %xmm2
00000000000c42ce	addpd	%xmm3, %xmm0
00000000000c42d2	mulsd	0x5e34e(%rip), %xmm2
00000000000c42da	movsd	0x5e24e(%rip), %xmm3
00000000000c42e2	divsd	%xmm2, %xmm3
00000000000c42e6	mulpd	%xmm4, %xmm0
00000000000c42ea	addpd	%xmm1, %xmm0
00000000000c42ee	movddup	%xmm3, %xmm1                    ## xmm1 = xmm3[0,0]
00000000000c42f2	mulpd	%xmm0, %xmm1
00000000000c42f6	movupd	%xmm1, (%rax)
00000000000c42fa	popq	%rbp
00000000000c42fb	retq
