__ZN13HGConvolution7SetSizeEii:
0000000000166d70	pushq	%rbp
0000000000166d71	movq	%rsp, %rbp
0000000000166d74	pushq	%rbx
0000000000166d75	pushq	%rax
0000000000166d76	movq	%rdi, %rbx
0000000000166d79	testl	%esi, %esi
0000000000166d7b	setle	%al
0000000000166d7e	testl	%edx, %edx
0000000000166d80	setle	%cl
0000000000166d83	orb	%al, %cl
0000000000166d85	jne	0x166dd4
0000000000166d87	movl	0x1a0(%rbx), %eax
0000000000166d8d	cmpl	$0x2, 0x200(%rbx)
0000000000166d94	jl	0x166df0
0000000000166d96	addl	0x1c0(%rbx), %eax
0000000000166d9c	movl	0x1c4(%rbx), %r9d
0000000000166da3	addl	0x1a4(%rbx), %r9d
0000000000166daa	movl	0x1a8(%rbx), %ecx
0000000000166db0	movl	0x1c8(%rbx), %edi
0000000000166db6	addl	%edi, %ecx
0000000000166db8	decl	%ecx
0000000000166dba	cmpl	%ecx, %esi
0000000000166dbc	jne	0x166e0d
0000000000166dbe	movl	0x1ac(%rbx), %ecx
0000000000166dc4	movl	0x1cc(%rbx), %edi
0000000000166dca	addl	%edi, %ecx
0000000000166dcc	decl	%ecx
0000000000166dce	cmpl	%ecx, %edx
0000000000166dd0	jne	0x166e0d
0000000000166dd2	jmp	0x166e09
0000000000166dd4	cmpq	$0x0, 0x198(%rbx)
0000000000166ddc	je	0x166e09
0000000000166dde	leaq	0x198(%rbx), %rdi
0000000000166de5	xorl	%esi, %esi
0000000000166de7	xorl	%edx, %edx
0000000000166de9	callq	__ZN16HGLinearFilter2D5resetEii ## HGLinearFilter2D::reset(int, int)
0000000000166dee	jmp	0x166e2d
0000000000166df0	movl	0x1a4(%rbx), %r9d
0000000000166df7	cmpl	0x1a8(%rbx), %esi
0000000000166dfd	jne	0x166e0d
0000000000166dff	movl	0x1ac(%rbx), %ecx
0000000000166e05	cmpl	%ecx, %edx
0000000000166e07	jne	0x166e0d
0000000000166e09	xorl	%eax, %eax
0000000000166e0b	jmp	0x166e44
0000000000166e0d	leaq	0x198(%rbx), %rdi
0000000000166e14	leal	(%rsi,%rax), %ecx
0000000000166e17	decl	%ecx
0000000000166e19	leal	(%rdx,%r9), %r8d
0000000000166e1d	decl	%r8d
0000000000166e20	movl	%eax, %esi
0000000000166e22	movl	%r9d, %edx
0000000000166e25	xorl	%r9d, %r9d
0000000000166e28	callq	__ZN16HGLinearFilter2D6resizeEiiiii ## HGLinearFilter2D::resize(int, int, int, int, int)
0000000000166e2d	movl	$0xffffffff, 0x1d8(%rbx)        ## imm = 0xFFFFFFFF
0000000000166e37	movq	%rbx, %rdi
0000000000166e3a	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000166e3f	movl	$0x1, %eax
0000000000166e44	movl	$0x1, 0x200(%rbx)
0000000000166e4e	addq	$0x8, %rsp
0000000000166e52	popq	%rbx
0000000000166e53	popq	%rbp
0000000000166e54	retq
0000000000166e55	nopw	%cs:(%rax,%rax)
