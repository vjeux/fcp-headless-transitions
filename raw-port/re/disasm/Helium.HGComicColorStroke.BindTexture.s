__ZN18HGComicColorStroke11BindTextureEP9HGHandleri:
00000000001bcaf0	pushq	%rbp
00000000001bcaf1	movq	%rsp, %rbp
00000000001bcaf4	pushq	%r15
00000000001bcaf6	pushq	%r14
00000000001bcaf8	pushq	%rbx
00000000001bcaf9	pushq	%rax
00000000001bcafa	movl	%edx, %r14d
00000000001bcafd	movq	%rsi, %rbx
00000000001bcb00	cmpl	$0x1, %edx
00000000001bcb03	je	0x1bcb1d
00000000001bcb05	testl	%r14d, %r14d
00000000001bcb08	jne	0x1bcb55
00000000001bcb0a	movq	%rbx, %rdi
00000000001bcb0d	xorl	%esi, %esi
00000000001bcb0f	xorl	%edx, %edx
00000000001bcb11	xorl	%ecx, %ecx
00000000001bcb13	xorl	%r8d, %r8d
00000000001bcb16	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
00000000001bcb1b	jmp	0x1bcb55
00000000001bcb1d	movq	%rdi, %r15
00000000001bcb20	movq	%rbx, %rdi
00000000001bcb23	movl	$0x1, %esi
00000000001bcb28	xorl	%edx, %edx
00000000001bcb2a	xorl	%ecx, %ecx
00000000001bcb2c	xorl	%r8d, %r8d
00000000001bcb2f	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
00000000001bcb34	movss	0x198(%r15), %xmm0
00000000001bcb3d	cvtss2sd	%xmm0, %xmm0
00000000001bcb41	movq	(%rbx), %rax
00000000001bcb44	movsd	0x20d714(%rip), %xmm2
00000000001bcb4c	movq	%rbx, %rdi
00000000001bcb4f	movaps	%xmm0, %xmm1
00000000001bcb52	callq	*0x68(%rax)
00000000001bcb55	movq	(%rbx), %rax
00000000001bcb58	movq	%rbx, %rdi
00000000001bcb5b	movl	%r14d, %esi
00000000001bcb5e	xorl	%edx, %edx
00000000001bcb60	callq	*0x48(%rax)
00000000001bcb63	movq	(%rbx), %rax
00000000001bcb66	movq	%rbx, %rdi
00000000001bcb69	xorl	%esi, %esi
00000000001bcb6b	callq	*0x38(%rax)
00000000001bcb6e	movq	(%rbx), %rax
00000000001bcb71	movq	%rbx, %rdi
00000000001bcb74	movl	$0x1, %esi
00000000001bcb79	movl	$0x1, %edx
00000000001bcb7e	callq	*0x30(%rax)
00000000001bcb81	xorl	%eax, %eax
00000000001bcb83	addq	$0x8, %rsp
00000000001bcb87	popq	%rbx
00000000001bcb88	popq	%r14
00000000001bcb8a	popq	%r15
00000000001bcb8c	popq	%rbp
00000000001bcb8d	retq
00000000001bcb8e	nop
