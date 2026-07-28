__ZNK15PCSimplePolygon9duplicateEv:
00000000000c3a76	pushq	%rbp
00000000000c3a77	movq	%rsp, %rbp
00000000000c3a7a	pushq	%r15
00000000000c3a7c	pushq	%r14
00000000000c3a7e	pushq	%r13
00000000000c3a80	pushq	%r12
00000000000c3a82	pushq	%rbx
00000000000c3a83	pushq	%rax
00000000000c3a84	movq	%rsi, %r14
00000000000c3a87	movq	%rdi, %rbx
00000000000c3a8a	xorps	%xmm0, %xmm0
00000000000c3a8d	movups	%xmm0, 0x28(%rdi)
00000000000c3a91	movups	%xmm0, 0x18(%rdi)
00000000000c3a95	movups	%xmm0, 0x8(%rdi)
00000000000c3a99	movq	$0x0, 0x38(%rdi)
00000000000c3aa1	movb	(%rsi), %al
00000000000c3aa3	movb	%al, (%rdi)
00000000000c3aa5	movl	0x4(%rsi), %eax
00000000000c3aa8	movl	%eax, 0x4(%rdi)
00000000000c3aab	movq	0x8(%rsi), %rcx
00000000000c3aaf	movq	0x10(%rsi), %rdx
00000000000c3ab3	cmpq	%rcx, %rdx
00000000000c3ab6	je	0xc3b04
00000000000c3ab8	leaq	0x8(%rbx), %r15
00000000000c3abc	xorl	%r12d, %r12d
00000000000c3abf	xorl	%eax, %eax
00000000000c3ac1	xorl	%r13d, %r13d
00000000000c3ac4	leaq	(%rcx,%r12), %rsi
00000000000c3ac8	cmpq	0x18(%rbx), %rax
00000000000c3acc	jae	0xc3ada
00000000000c3ace	movups	(%rsi), %xmm0
00000000000c3ad1	movups	%xmm0, (%rax)
00000000000c3ad4	addq	$0x10, %rax
00000000000c3ad8	jmp	0xc3aea
00000000000c3ada	movq	%r15, %rdi
00000000000c3add	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
00000000000c3ae2	movq	0x8(%r14), %rcx
00000000000c3ae6	movq	0x10(%r14), %rdx
00000000000c3aea	movq	%rax, 0x10(%rbx)
00000000000c3aee	incq	%r13
00000000000c3af1	movq	%rdx, %rsi
00000000000c3af4	subq	%rcx, %rsi
00000000000c3af7	sarq	$0x4, %rsi
00000000000c3afb	addq	$0x10, %r12
00000000000c3aff	cmpq	%r13, %rsi
00000000000c3b02	ja	0xc3ac4
00000000000c3b04	movups	0x20(%r14), %xmm0
00000000000c3b09	movups	0x30(%r14), %xmm1
00000000000c3b0e	movups	%xmm1, 0x30(%rbx)
00000000000c3b12	movups	%xmm0, 0x20(%rbx)
00000000000c3b16	movq	%rbx, %rax
00000000000c3b19	addq	$0x8, %rsp
00000000000c3b1d	popq	%rbx
00000000000c3b1e	popq	%r12
00000000000c3b20	popq	%r13
00000000000c3b22	popq	%r14
00000000000c3b24	popq	%r15
00000000000c3b26	popq	%rbp
00000000000c3b27	retq
00000000000c3b28	movq	%rax, %r14
00000000000c3b2b	movq	0x8(%rbx), %rdi
00000000000c3b2f	movq	%rdi, 0x10(%rbx)
00000000000c3b33	testq	%rdi, %rdi
00000000000c3b36	je	0xc3b3d
00000000000c3b38	callq	0xde6c0                         ## symbol stub for: __ZdlPv
00000000000c3b3d	movq	%r14, %rdi
00000000000c3b40	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
00000000000c3b45	nop
