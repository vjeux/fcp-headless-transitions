__ZN13HGColorMatrix12SetParameterEiffff:
00000000001b7b20	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001b7b25	cmpl	$0x3, %esi
00000000001b7b28	ja	0x1b7b90
00000000001b7b2a	movl	%esi, %ecx
00000000001b7b2c	shlq	$0x4, %rcx
00000000001b7b30	leaq	(%rdi,%rcx), %rax
00000000001b7b34	addq	$0x1b0, %rax                    ## imm = 0x1B0
00000000001b7b3a	movss	0x1b0(%rdi,%rcx), %xmm4
00000000001b7b43	ucomiss	%xmm0, %xmm4
00000000001b7b46	jne	0x1b7b6e
00000000001b7b48	jp	0x1b7b6e
00000000001b7b4a	movss	0x4(%rax), %xmm4
00000000001b7b4f	ucomiss	%xmm1, %xmm4
00000000001b7b52	jne	0x1b7b6e
00000000001b7b54	jp	0x1b7b6e
00000000001b7b56	movss	0x8(%rax), %xmm4
00000000001b7b5b	ucomiss	%xmm2, %xmm4
00000000001b7b5e	jne	0x1b7b6e
00000000001b7b60	jp	0x1b7b6e
00000000001b7b62	movss	0xc(%rax), %xmm4
00000000001b7b67	ucomiss	%xmm3, %xmm4
00000000001b7b6a	jne	0x1b7b6e
00000000001b7b6c	jnp	0x1b7b91
00000000001b7b6e	pushq	%rbp
00000000001b7b6f	movq	%rsp, %rbp
00000000001b7b72	movss	%xmm0, (%rax)
00000000001b7b76	movss	%xmm1, 0x4(%rax)
00000000001b7b7b	movss	%xmm2, 0x8(%rax)
00000000001b7b80	movss	%xmm3, 0xc(%rax)
00000000001b7b85	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001b7b8a	movl	$0x1, %eax
00000000001b7b8f	popq	%rbp
00000000001b7b90	retq
00000000001b7b91	xorl	%eax, %eax
00000000001b7b93	retq
00000000001b7b94	nopw	%cs:(%rax,%rax)
