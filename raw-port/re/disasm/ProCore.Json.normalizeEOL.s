__ZN4JsonL12normalizeEOLEPKcS1_:
00000000000c7d1a	pushq	%rbp
00000000000c7d1b	movq	%rsp, %rbp
00000000000c7d1e	pushq	%r15
00000000000c7d20	pushq	%r14
00000000000c7d22	pushq	%r12
00000000000c7d24	pushq	%rbx
00000000000c7d25	movq	%rdx, %r14
00000000000c7d28	movq	%rsi, %r15
00000000000c7d2b	movq	%rdi, %rbx
00000000000c7d2e	xorps	%xmm0, %xmm0
00000000000c7d31	movups	%xmm0, (%rdi)
00000000000c7d34	movq	$0x0, 0x10(%rdi)
00000000000c7d3c	movq	%rdx, %rsi
00000000000c7d3f	subq	%r15, %rsi
00000000000c7d42	callq	0xde588                         ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm
00000000000c7d47	cmpq	%r14, %r15
00000000000c7d4a	je	0xc7d8c
00000000000c7d4c	leaq	0x1(%r15), %r12
00000000000c7d50	movb	(%r15), %al
00000000000c7d53	cmpb	$0xd, %al
00000000000c7d55	jne	0xc7d79
00000000000c7d57	cmpq	%r14, %r12
00000000000c7d5a	je	0xc7d6a
00000000000c7d5c	cmpb	$0xa, 0x1(%r15)
00000000000c7d61	jne	0xc7d6a
00000000000c7d63	addq	$0x2, %r15
00000000000c7d67	movq	%r15, %r12
00000000000c7d6a	movq	%rbx, %rdi
00000000000c7d6d	movl	$0xa, %esi
00000000000c7d72	callq	0xde594                         ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc
00000000000c7d77	jmp	0xc7d84
00000000000c7d79	movsbl	%al, %esi
00000000000c7d7c	movq	%rbx, %rdi
00000000000c7d7f	callq	0xde594                         ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc
00000000000c7d84	movq	%r12, %r15
00000000000c7d87	cmpq	%r14, %r12
00000000000c7d8a	jne	0xc7d4c
00000000000c7d8c	movq	%rbx, %rax
00000000000c7d8f	popq	%rbx
00000000000c7d90	popq	%r12
00000000000c7d92	popq	%r14
00000000000c7d94	popq	%r15
00000000000c7d96	popq	%rbp
00000000000c7d97	retq
00000000000c7d98	jmp	0xc7d9a
00000000000c7d9a	movq	%rax, %r14
00000000000c7d9d	testb	$0x1, (%rbx)
00000000000c7da0	je	0xc7dab
00000000000c7da2	movq	0x10(%rbx), %rdi
00000000000c7da6	callq	0xde6c0                         ## symbol stub for: __ZdlPv
00000000000c7dab	movq	%r14, %rdi
00000000000c7dae	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
00000000000c7db3	nop
