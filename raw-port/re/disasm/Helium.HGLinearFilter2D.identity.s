__ZN16HGLinearFilter2D8identityEj:
000000000010bd80	pushq	%rbp
000000000010bd81	movq	%rsp, %rbp
000000000010bd84	pushq	%r15
000000000010bd86	pushq	%r14
000000000010bd88	pushq	%r13
000000000010bd8a	pushq	%r12
000000000010bd8c	pushq	%rbx
000000000010bd8d	pushq	%rax
000000000010bd8e	movq	%rdi, %rbx
000000000010bd91	movl	0x10(%rdi), %r13d
000000000010bd95	movl	0x14(%rdi), %r12d
000000000010bd99	movl	0x8(%rdi), %r15d
000000000010bd9d	movl	0xc(%rdi), %r14d
000000000010bda1	testb	$0x2, 0x1c(%rdi)
000000000010bda5	jne	0x10bdc9
000000000010bda7	leal	(%r15,%r13), %ecx
000000000010bdab	decl	%ecx
000000000010bdad	leal	-0x1(%r12,%r14), %r8d
000000000010bdb2	movq	%rbx, %rdi
000000000010bdb5	movl	%esi, -0x2c(%rbp)
000000000010bdb8	movl	%r15d, %esi
000000000010bdbb	movl	%r14d, %edx
000000000010bdbe	xorl	%r9d, %r9d
000000000010bdc1	callq	__ZN16HGLinearFilter2D6resizeEiiiii ## HGLinearFilter2D::resize(int, int, int, int, int)
000000000010bdc6	movl	-0x2c(%rbp), %esi
000000000010bdc9	testl	%r12d, %r12d
000000000010bdcc	jle	0x10bf3d
000000000010bdd2	testl	%r13d, %r13d
000000000010bdd5	jle	0x10bf3d
000000000010bddb	negl	%r15d
000000000010bdde	negl	%r14d
000000000010bde1	movq	(%rbx), %rax
000000000010bde4	movl	%esi, %ecx
000000000010bde6	shlq	$0x4, %rcx
000000000010bdea	leaq	__ZL6g_Mask(%rip), %rdx         ## g_Mask
000000000010bdf1	movaps	(%rcx,%rdx), %xmm0
000000000010bdf5	movl	%r15d, %ecx
000000000010bdf8	movl	%r13d, %edx
000000000010bdfb	movl	%edx, %esi
000000000010bdfd	andl	$0x3, %esi
000000000010be00	movl	%edx, %edi
000000000010be02	andl	$0x7ffffffc, %edi               ## imm = 0x7FFFFFFC
000000000010be08	movl	%esi, %r8d
000000000010be0b	shll	$0x4, %r8d
000000000010be0f	shlq	$0x4, %rcx
000000000010be13	shlq	$0x4, %rdx
000000000010be17	xorl	%r9d, %r9d
000000000010be1a	movaps	0x2bbe1f(%rip), %xmm1
000000000010be21	xorps	%xmm2, %xmm2
000000000010be24	jmp	0x10be47
000000000010be26	nopw	%cs:(%rax,%rax)
000000000010be30	movslq	0x10(%rbx), %r10
000000000010be34	shlq	$0x4, %r10
000000000010be38	addq	%r10, %rax
000000000010be3b	incl	%r9d
000000000010be3e	cmpl	%r12d, %r9d
000000000010be41	je	0x10bf3d
000000000010be47	cmpl	%r14d, %r9d
000000000010be4a	jne	0x10bea0
000000000010be4c	leaq	(%rax,%rcx), %r10
000000000010be50	xorl	%r11d, %r11d
000000000010be53	jmp	0x10be76
000000000010be55	nopw	%cs:(%rax,%rax)
000000000010be60	movaps	(%r10), %xmm3
000000000010be64	blendvps	%xmm0, %xmm1, %xmm3
000000000010be69	movaps	%xmm3, (%r10)
000000000010be6d	addq	$0x10, %r11
000000000010be71	cmpq	%r11, %rdx
000000000010be74	je	0x10be30
000000000010be76	cmpq	%r11, %rcx
000000000010be79	je	0x10be60
000000000010be7b	movaps	(%rax,%r11), %xmm3
000000000010be80	blendvps	%xmm0, %xmm2, %xmm3
000000000010be85	movaps	%xmm3, (%rax,%r11)
000000000010be8a	addq	$0x10, %r11
000000000010be8e	cmpq	%r11, %rdx
000000000010be91	jne	0x10be76
000000000010be93	jmp	0x10be30
000000000010be95	nopw	%cs:(%rax,%rax)
000000000010bea0	cmpl	$0x4, %r13d
000000000010bea4	jae	0x10beb0
000000000010bea6	xorl	%r10d, %r10d
000000000010bea9	jmp	0x10bf07
000000000010beab	nopl	(%rax,%rax)
000000000010beb0	leaq	0x30(%rax), %r11
000000000010beb4	xorl	%r10d, %r10d
000000000010beb7	nopw	(%rax,%rax)
000000000010bec0	movaps	-0x30(%r11), %xmm3
000000000010bec5	movaps	-0x20(%r11), %xmm4
000000000010beca	movaps	-0x10(%r11), %xmm5
000000000010becf	movaps	(%r11), %xmm6
000000000010bed3	blendvps	%xmm0, %xmm2, %xmm3
000000000010bed8	movaps	%xmm3, -0x30(%r11)
000000000010bedd	blendvps	%xmm0, %xmm2, %xmm4
000000000010bee2	movaps	%xmm4, -0x20(%r11)
000000000010bee7	blendvps	%xmm0, %xmm2, %xmm5
000000000010beec	movaps	%xmm5, -0x10(%r11)
000000000010bef1	blendvps	%xmm0, %xmm2, %xmm6
000000000010bef6	movaps	%xmm6, (%r11)
000000000010befa	addq	$0x4, %r10
000000000010befe	addq	$0x40, %r11
000000000010bf02	cmpq	%r10, %rdi
000000000010bf05	jne	0x10bec0
000000000010bf07	testq	%rsi, %rsi
000000000010bf0a	je	0x10be30
000000000010bf10	shlq	$0x4, %r10
000000000010bf14	addq	%rax, %r10
000000000010bf17	xorl	%r11d, %r11d
000000000010bf1a	nopw	(%rax,%rax)
000000000010bf20	movaps	(%r10,%r11), %xmm3
000000000010bf25	blendvps	%xmm0, %xmm2, %xmm3
000000000010bf2a	movaps	%xmm3, (%r10,%r11)
000000000010bf2f	addq	$0x10, %r11
000000000010bf33	cmpq	%r11, %r8
000000000010bf36	jne	0x10bf20
000000000010bf38	jmp	0x10be30
000000000010bf3d	addq	$0x8, %rsp
000000000010bf41	popq	%rbx
000000000010bf42	popq	%r12
000000000010bf44	popq	%r13
000000000010bf46	popq	%r14
000000000010bf48	popq	%r15
000000000010bf4a	popq	%rbp
000000000010bf4b	retq
000000000010bf4c	nopl	(%rax)
