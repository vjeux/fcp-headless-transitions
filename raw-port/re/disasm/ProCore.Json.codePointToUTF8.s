__ZN4JsonL15codePointToUTF8Ej:
00000000000c8a55	pushq	%rbp
00000000000c8a56	movq	%rsp, %rbp
00000000000c8a59	pushq	%r14
00000000000c8a5b	pushq	%rbx
00000000000c8a5c	movl	%esi, %r14d
00000000000c8a5f	movq	%rdi, %rbx
00000000000c8a62	xorps	%xmm0, %xmm0
00000000000c8a65	movups	%xmm0, (%rdi)
00000000000c8a68	movq	$0x0, 0x10(%rdi)
00000000000c8a70	cmpl	$0x7f, %esi
00000000000c8a73	ja	0xc8a96
00000000000c8a75	movl	$0x1, %esi
00000000000c8a7a	movq	%rbx, %rdi
00000000000c8a7d	xorl	%edx, %edx
00000000000c8a7f	callq	0xde576                         ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEmc
00000000000c8a84	testb	$0x1, (%rbx)
00000000000c8a87	jne	0xc8ba7
00000000000c8a8d	leaq	0x1(%rbx), %rax
00000000000c8a91	jmp	0xc8bab
00000000000c8a96	cmpl	$0x7ff, %r14d                   ## imm = 0x7FF
00000000000c8a9d	ja	0xc8ad7
00000000000c8a9f	movl	$0x2, %esi
00000000000c8aa4	movq	%rbx, %rdi
00000000000c8aa7	xorl	%edx, %edx
00000000000c8aa9	callq	0xde576                         ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEmc
00000000000c8aae	movl	%r14d, %ecx
00000000000c8ab1	andb	$0x3f, %cl
00000000000c8ab4	orb	$-0x80, %cl
00000000000c8ab7	leaq	0x1(%rbx), %rax
00000000000c8abb	testb	$0x1, (%rbx)
00000000000c8abe	movq	%rax, %rdx
00000000000c8ac1	je	0xc8ac7
00000000000c8ac3	movq	0x10(%rbx), %rdx
00000000000c8ac7	movb	%cl, 0x1(%rdx)
00000000000c8aca	shrl	$0x6, %r14d
00000000000c8ace	orb	$-0x40, %r14b
00000000000c8ad2	jmp	0xc8ba2
00000000000c8ad7	cmpl	$0xffff, %r14d                  ## imm = 0xFFFF
00000000000c8ade	ja	0xc8b30
00000000000c8ae0	movl	$0x3, %esi
00000000000c8ae5	movq	%rbx, %rdi
00000000000c8ae8	xorl	%edx, %edx
00000000000c8aea	callq	0xde576                         ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEmc
00000000000c8aef	movl	%r14d, %ecx
00000000000c8af2	andb	$0x3f, %cl
00000000000c8af5	orb	$-0x80, %cl
00000000000c8af8	leaq	0x1(%rbx), %rax
00000000000c8afc	testb	$0x1, (%rbx)
00000000000c8aff	movq	%rax, %rdx
00000000000c8b02	je	0xc8b08
00000000000c8b04	movq	0x10(%rbx), %rdx
00000000000c8b08	movb	%cl, 0x2(%rdx)
00000000000c8b0b	movl	%r14d, %ecx
00000000000c8b0e	shrl	$0x6, %ecx
00000000000c8b11	andb	$0x3f, %cl
00000000000c8b14	orb	$-0x80, %cl
00000000000c8b17	testb	$0x1, (%rbx)
00000000000c8b1a	movq	%rax, %rdx
00000000000c8b1d	je	0xc8b23
00000000000c8b1f	movq	0x10(%rbx), %rdx
00000000000c8b23	movb	%cl, 0x1(%rdx)
00000000000c8b26	shrl	$0xc, %r14d
00000000000c8b2a	orb	$-0x20, %r14b
00000000000c8b2e	jmp	0xc8ba2
00000000000c8b30	cmpl	$0x10ffff, %r14d                ## imm = 0x10FFFF
00000000000c8b37	ja	0xc8bae
00000000000c8b39	movl	$0x4, %esi
00000000000c8b3e	movq	%rbx, %rdi
00000000000c8b41	xorl	%edx, %edx
00000000000c8b43	callq	0xde576                         ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEmc
00000000000c8b48	movl	%r14d, %ecx
00000000000c8b4b	andb	$0x3f, %cl
00000000000c8b4e	orb	$-0x80, %cl
00000000000c8b51	leaq	0x1(%rbx), %rax
00000000000c8b55	testb	$0x1, (%rbx)
00000000000c8b58	movq	%rax, %rdx
00000000000c8b5b	je	0xc8b61
00000000000c8b5d	movq	0x10(%rbx), %rdx
00000000000c8b61	movb	%cl, 0x3(%rdx)
00000000000c8b64	movl	%r14d, %ecx
00000000000c8b67	shrl	$0x6, %ecx
00000000000c8b6a	andb	$0x3f, %cl
00000000000c8b6d	orb	$-0x80, %cl
00000000000c8b70	testb	$0x1, (%rbx)
00000000000c8b73	movq	%rax, %rdx
00000000000c8b76	je	0xc8b7c
00000000000c8b78	movq	0x10(%rbx), %rdx
00000000000c8b7c	movb	%cl, 0x2(%rdx)
00000000000c8b7f	movl	%r14d, %ecx
00000000000c8b82	shrl	$0xc, %ecx
00000000000c8b85	andb	$0x3f, %cl
00000000000c8b88	orb	$-0x80, %cl
00000000000c8b8b	testb	$0x1, (%rbx)
00000000000c8b8e	movq	%rax, %rdx
00000000000c8b91	je	0xc8b97
00000000000c8b93	movq	0x10(%rbx), %rdx
00000000000c8b97	movb	%cl, 0x1(%rdx)
00000000000c8b9a	shrl	$0x12, %r14d
00000000000c8b9e	orb	$-0x10, %r14b
00000000000c8ba2	testb	$0x1, (%rbx)
00000000000c8ba5	je	0xc8bab
00000000000c8ba7	movq	0x10(%rbx), %rax
00000000000c8bab	movb	%r14b, (%rax)
00000000000c8bae	movq	%rbx, %rax
00000000000c8bb1	popq	%rbx
00000000000c8bb2	popq	%r14
00000000000c8bb4	popq	%rbp
00000000000c8bb5	retq
00000000000c8bb6	movq	%rax, %r14
00000000000c8bb9	testb	$0x1, (%rbx)
00000000000c8bbc	je	0xc8bc7
00000000000c8bbe	movq	0x10(%rbx), %rdi
00000000000c8bc2	callq	0xde6c0                         ## symbol stub for: __ZdlPv
00000000000c8bc7	movq	%r14, %rdi
00000000000c8bca	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
00000000000c8bcf	nop
