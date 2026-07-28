__ZN19HGSMAAPatternSearch6GetROIEP10HGRendereri6HGRect:
0000000000211bd0	cmpl	$0x2, %edx
0000000000211bd3	je	0x211c28
0000000000211bd5	cmpl	$0x1, %edx
0000000000211bd8	je	0x211c19
0000000000211bda	testl	%edx, %edx
0000000000211bdc	jne	0x211c37
0000000000211bde	pushq	%rbp
0000000000211bdf	movq	%rsp, %rbp
0000000000211be2	pushq	%r14
0000000000211be4	pushq	%rbx
0000000000211be5	movl	$0xfffffff5, %edi               ## imm = 0xFFFFFFF5
0000000000211bea	movl	$0xfffffff5, %esi               ## imm = 0xFFFFFFF5
0000000000211bef	movl	$0xc, %edx
0000000000211bf4	movq	%rcx, %rbx
0000000000211bf7	movl	$0xc, %ecx
0000000000211bfc	movq	%r8, %r14
0000000000211bff	callq	_HGRectMake4i
0000000000211c04	movq	%rdx, %rcx
0000000000211c07	movq	%rbx, %rdi
0000000000211c0a	movq	%r14, %rsi
0000000000211c0d	movq	%rax, %rdx
0000000000211c10	popq	%rbx
0000000000211c11	popq	%r14
0000000000211c13	popq	%rbp
0000000000211c14	jmp	_HGRectGrow
0000000000211c19	movq	0x1a0(%rdi), %rax
0000000000211c20	movq	0x1a8(%rdi), %rdx
0000000000211c27	retq
0000000000211c28	movq	0x1b0(%rdi), %rax
0000000000211c2f	movq	0x1b8(%rdi), %rdx
0000000000211c36	retq
0000000000211c37	leaq	_HGRectNull(%rip), %rcx
0000000000211c3e	movq	(%rcx), %rax
0000000000211c41	movq	0x8(%rcx), %rdx
0000000000211c45	retq
0000000000211c46	nopw	%cs:(%rax,%rax)
