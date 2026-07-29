__ZN13HGConvolution9SetBoundsEiiii:
0000000000166e60	pushq	%rbp
0000000000166e61	movq	%rsp, %rbp
0000000000166e64	pushq	%rbx
0000000000166e65	pushq	%rax
0000000000166e66	movq	%rdi, %rbx
0000000000166e69	movl	%ecx, %edi
0000000000166e6b	subl	%esi, %edi
0000000000166e6d	movl	%r8d, %eax
0000000000166e70	subl	%edx, %eax
0000000000166e72	movl	%edi, %r9d
0000000000166e75	orl	%eax, %r9d
0000000000166e78	js	0x166eb7
0000000000166e7a	cmpl	$0x2, 0x200(%rbx)
0000000000166e81	jl	0x166ed7
0000000000166e83	movl	0x1a8(%rbx), %r9d
0000000000166e8a	movl	0x1c8(%rbx), %r10d
0000000000166e91	addl	%r10d, %r9d
0000000000166e94	addl	$-0x2, %r9d
0000000000166e98	cmpl	%r9d, %edi
0000000000166e9b	jne	0x166f1a
0000000000166e9d	movl	0x1ac(%rbx), %edi
0000000000166ea3	movl	0x1cc(%rbx), %r9d
0000000000166eaa	addl	%r9d, %edi
0000000000166ead	decl	%edi
0000000000166eaf	incl	%eax
0000000000166eb1	cmpl	%edi, %eax
0000000000166eb3	je	0x166eed
0000000000166eb5	jmp	0x166f1a
0000000000166eb7	cmpq	$0x0, 0x198(%rbx)
0000000000166ebf	je	0x166f47
0000000000166ec5	leaq	0x198(%rbx), %rdi
0000000000166ecc	xorl	%esi, %esi
0000000000166ece	xorl	%edx, %edx
0000000000166ed0	callq	__ZN16HGLinearFilter2D5resetEii ## HGLinearFilter2D::reset(int, int)
0000000000166ed5	jmp	0x166f29
0000000000166ed7	incl	%edi
0000000000166ed9	cmpl	0x1a8(%rbx), %edi
0000000000166edf	jne	0x166f1a
0000000000166ee1	movl	0x1ac(%rbx), %edi
0000000000166ee7	incl	%eax
0000000000166ee9	cmpl	%edi, %eax
0000000000166eeb	jne	0x166f1a
0000000000166eed	movl	0x1a0(%rbx), %eax
0000000000166ef3	movl	0x1a4(%rbx), %ecx
0000000000166ef9	movl	%esi, %edi
0000000000166efb	xorl	%eax, %edi
0000000000166efd	movl	%edx, %r8d
0000000000166f00	xorl	%ecx, %r8d
0000000000166f03	orl	%edi, %r8d
0000000000166f06	je	0x166f47
0000000000166f08	leaq	0x198(%rbx), %rdi
0000000000166f0f	subl	%ecx, %edx
0000000000166f11	subl	%eax, %esi
0000000000166f13	callq	__ZN16HGLinearFilter2D9translateEii ## HGLinearFilter2D::translate(int, int)
0000000000166f18	jmp	0x166f33
0000000000166f1a	leaq	0x198(%rbx), %rdi
0000000000166f21	xorl	%r9d, %r9d
0000000000166f24	callq	__ZN16HGLinearFilter2D6resizeEiiiii ## HGLinearFilter2D::resize(int, int, int, int, int)
0000000000166f29	movl	$0xffffffff, 0x1d8(%rbx)        ## imm = 0xFFFFFFFF
0000000000166f33	movq	%rbx, %rdi
0000000000166f36	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000166f3b	movl	$0x1, %eax
0000000000166f40	addq	$0x8, %rsp
0000000000166f44	popq	%rbx
0000000000166f45	popq	%rbp
0000000000166f46	retq
0000000000166f47	xorl	%eax, %eax
0000000000166f49	addq	$0x8, %rsp
0000000000166f4d	popq	%rbx
0000000000166f4e	popq	%rbp
0000000000166f4f	retq
