__ZN11HGToneCurve4BindEP9HGHandler:
0000000000248ba0	cmpl	$0x0, 0x1a8(%rdi)
0000000000248ba7	je	0x248bac
0000000000248ba9	xorl	%eax, %eax
0000000000248bab	retq
0000000000248bac	pushq	%rbp
0000000000248bad	movq	%rsp, %rbp
0000000000248bb0	pushq	%r14
0000000000248bb2	pushq	%rbx
0000000000248bb3	movq	%rsi, %rbx
0000000000248bb6	movq	%rdi, %r14
0000000000248bb9	movl	0x198(%rdi), %eax
0000000000248bbf	decl	%eax
0000000000248bc1	cmpl	$0x3, %eax
0000000000248bc4	ja	0x248c18
0000000000248bc6	leaq	0x6f(%rip), %rcx
0000000000248bcd	movslq	(%rcx,%rax,4), %rax
0000000000248bd1	addq	%rcx, %rax
0000000000248bd4	jmpq	*%rax
0000000000248bd6	movq	0x1b0(%r14), %rdx
0000000000248bdd	addq	$0x40, %rdx
0000000000248be1	movq	(%rbx), %rax
0000000000248be4	movq	%rbx, %rdi
0000000000248be7	movl	$0x2, %esi
0000000000248bec	movl	$0x1, %ecx
0000000000248bf1	callq	*0x90(%rax)
0000000000248bf7	movq	0x1b0(%r14), %rdx
0000000000248bfe	addq	$0x20, %rdx
0000000000248c02	movq	(%rbx), %rax
0000000000248c05	movq	%rbx, %rdi
0000000000248c08	movl	$0x1, %esi
0000000000248c0d	movl	$0x1, %ecx
0000000000248c12	callq	*0x90(%rax)
0000000000248c18	movq	0x1b0(%r14), %rdx
0000000000248c1f	movq	(%rbx), %rax
0000000000248c22	movq	%rbx, %rdi
0000000000248c25	xorl	%esi, %esi
0000000000248c27	movl	$0x1, %ecx
0000000000248c2c	callq	*0x90(%rax)
0000000000248c32	popq	%rbx
0000000000248c33	popq	%r14
0000000000248c35	popq	%rbp
0000000000248c36	xorl	%eax, %eax
0000000000248c38	retq
0000000000248c39	nopl	(%rax)
0000000000248c3c	movl	$0x9affffff, %ebx               ## imm = 0x9AFFFFFF
0000000000248c41	.byte 0xff #bad opcode
0000000000248c42	.byte 0xff #bad opcode
0000000000248c43	.byte 0xff #bad opcode
0000000000248c44	movl	$0x9affffff, %ebx               ## imm = 0x9AFFFFFF
0000000000248c49	.byte 0xff #bad opcode
0000000000248c4a	.byte 0xff #bad opcode
0000000000248c4b	decl	(%rdi)
0000000000248c4d	.byte 0x1f #bad opcode
0000000000248c4e	addb	%dl, 0x48(%rbp)
0000000000248c52	movl	%esp, %ebp
0000000000248c54	movl	0x1a4(%rdi), %eax
0000000000248c5a	leaq	__ZL22hgtonecurve_getprogram(%rip), %rcx ## hgtonecurve_getprogram
0000000000248c61	cmpb	$0x0, 0x1a0(%rdi)
0000000000248c68	leaq	__ZL32hgtonecurve_getprogram_unpremult(%rip), %rdx ## hgtonecurve_getprogram_unpremult
0000000000248c6f	cmovneq	%rcx, %rdx
0000000000248c73	movq	%rsi, %rdi
0000000000248c76	popq	%rbp
0000000000248c77	jmpq	*(%rdx,%rax,8)
0000000000248c7a	nopw	(%rax,%rax)
