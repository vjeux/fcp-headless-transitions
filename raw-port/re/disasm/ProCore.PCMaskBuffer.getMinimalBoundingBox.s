__ZNK12PCMaskBuffer21getMinimalBoundingBoxEPiS0_S0_S0_:
00000000000c4a0a	pushq	%rbp
00000000000c4a0b	movq	%rsp, %rbp
00000000000c4a0e	pushq	%r15
00000000000c4a10	pushq	%r14
00000000000c4a12	pushq	%r13
00000000000c4a14	pushq	%r12
00000000000c4a16	pushq	%rbx
00000000000c4a17	movq	%r8, -0x60(%rbp)
00000000000c4a1b	movq	%rcx, -0x50(%rbp)
00000000000c4a1f	movq	%rdx, -0x58(%rbp)
00000000000c4a23	movq	%rsi, -0x48(%rbp)
00000000000c4a27	movl	0x14(%rdi), %r14d
00000000000c4a2b	movl	0x18(%rdi), %r8d
00000000000c4a2f	movl	0x1c(%rdi), %esi
00000000000c4a32	movl	0x20(%rdi), %edx
00000000000c4a35	movl	%r14d, %eax
00000000000c4a38	xorl	%r8d, %eax
00000000000c4a3b	movl	%esi, %ecx
00000000000c4a3d	xorl	%edx, %ecx
00000000000c4a3f	orl	%eax, %ecx
00000000000c4a41	sete	%al
00000000000c4a44	cmpl	%edx, %esi
00000000000c4a46	setg	%cl
00000000000c4a49	orb	%al, %cl
00000000000c4a4b	movl	%edx, -0x2c(%rbp)
00000000000c4a4e	movl	%esi, -0x30(%rbp)
00000000000c4a51	je	0xc4a5e
00000000000c4a53	movl	%r8d, %ecx
00000000000c4a56	movl	%r14d, %r11d
00000000000c4a59	jmp	0xc4b3f
00000000000c4a5e	movslq	%esi, %rsi
00000000000c4a61	movq	(%rdi), %rcx
00000000000c4a64	movslq	0x10(%rdi), %rdi
00000000000c4a68	leal	0x1(%r8), %r15d
00000000000c4a6c	incl	%edx
00000000000c4a6e	movl	%edx, -0x38(%rbp)
00000000000c4a71	movq	%rsi, %rax
00000000000c4a74	movq	%rdi, -0x40(%rbp)
00000000000c4a78	imulq	%rdi, %rax
00000000000c4a7c	movq	%rcx, -0x68(%rbp)
00000000000c4a80	leaq	(%rax,%rcx), %r13
00000000000c4a84	incq	%r13
00000000000c4a87	movl	%r8d, %r10d
00000000000c4a8a	negl	%r10d
00000000000c4a8d	movl	$0x0, -0x34(%rbp)
00000000000c4a94	movl	%r14d, %r11d
00000000000c4a97	movl	%r8d, %ecx
00000000000c4a9a	movl	%r8d, %r12d
00000000000c4a9d	movl	%r14d, %r9d
00000000000c4aa0	cmpl	%r8d, %r14d
00000000000c4aa3	jg	0xc4b07
00000000000c4aa5	movq	%rsi, %rbx
00000000000c4aa8	imulq	-0x40(%rbp), %rbx
00000000000c4aad	addq	-0x68(%rbp), %rbx
00000000000c4ab1	movl	%r14d, %edx
00000000000c4ab4	movl	%r14d, %r9d
00000000000c4ab7	movl	%r8d, %r12d
00000000000c4aba	movslq	%edx, %rax
00000000000c4abd	cmpb	$0x0, (%rbx,%rax)
00000000000c4ac1	je	0xc4afd
00000000000c4ac3	cmpl	%r8d, %edx
00000000000c4ac6	jge	0xc4af2
00000000000c4ac8	addq	%r13, %rax
00000000000c4acb	leal	0x1(%rdx), %r12d
00000000000c4acf	movl	%edx, %r9d
00000000000c4ad2	cmpb	$0x0, (%rax)
00000000000c4ad5	cmovnel	%r12d, %r9d
00000000000c4ad9	incq	%rax
00000000000c4adc	leal	(%r10,%r12), %edi
00000000000c4ae0	incl	%edi
00000000000c4ae2	incl	%r12d
00000000000c4ae5	cmpl	$0x1, %edi
00000000000c4ae8	jne	0xc4ad2
00000000000c4aea	movl	%edx, %r12d
00000000000c4aed	movl	%r15d, %edx
00000000000c4af0	jmp	0xc4afd
00000000000c4af2	movl	%edx, %r12d
00000000000c4af5	movl	%edx, %r9d
00000000000c4af8	leal	0x1(%rdx), %eax
00000000000c4afb	movl	%eax, %edx
00000000000c4afd	cmpl	%r8d, %edx
00000000000c4b00	leal	0x1(%rdx), %eax
00000000000c4b03	movl	%eax, %edx
00000000000c4b05	jl	0xc4aba
00000000000c4b07	cmpl	%r9d, %r12d
00000000000c4b0a	jg	0xc4b2f
00000000000c4b0c	cmpl	%ecx, %r12d
00000000000c4b0f	cmovll	%r12d, %ecx
00000000000c4b13	cmpl	%r9d, %r11d
00000000000c4b16	cmovlel	%r9d, %r11d
00000000000c4b1a	cmpb	$0x0, -0x34(%rbp)
00000000000c4b1e	movl	-0x2c(%rbp), %eax
00000000000c4b21	cmovel	%esi, %eax
00000000000c4b24	movl	%eax, -0x2c(%rbp)
00000000000c4b27	movb	$0x1, %al
00000000000c4b29	movl	%eax, -0x34(%rbp)
00000000000c4b2c	movl	%esi, -0x30(%rbp)
00000000000c4b2f	incq	%rsi
00000000000c4b32	addq	-0x40(%rbp), %r13
00000000000c4b36	cmpl	%esi, -0x38(%rbp)
00000000000c4b39	jne	0xc4a9a
00000000000c4b3f	movq	-0x48(%rbp), %rax
00000000000c4b43	movl	%ecx, (%rax)
00000000000c4b45	movq	-0x50(%rbp), %rax
00000000000c4b49	movl	-0x2c(%rbp), %ecx
00000000000c4b4c	movl	%ecx, (%rax)
00000000000c4b4e	movq	-0x58(%rbp), %rax
00000000000c4b52	movl	%r11d, (%rax)
00000000000c4b55	movq	-0x60(%rbp), %rax
00000000000c4b59	movl	-0x30(%rbp), %ecx
00000000000c4b5c	movl	%ecx, (%rax)
00000000000c4b5e	popq	%rbx
00000000000c4b5f	popq	%r12
00000000000c4b61	popq	%r13
00000000000c4b63	popq	%r14
00000000000c4b65	popq	%r15
00000000000c4b67	popq	%rbp
00000000000c4b68	retq
00000000000c4b69	nop
