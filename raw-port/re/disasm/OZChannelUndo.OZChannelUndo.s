__ZN13OZChannelUndoC1ERK13OZChannelBase:
00000000000ffe70	pushq	%rbp
00000000000ffe71	movq	%rsp, %rbp
00000000000ffe74	pushq	%r14
00000000000ffe76	pushq	%rbx
00000000000ffe77	movq	%rsi, %rbx
00000000000ffe7a	movq	%rdi, %r14
00000000000ffe7d	leaq	0x73d6b4(%rip), %rax
00000000000ffe84	movq	%rax, (%rdi)
00000000000ffe87	movq	%rsi, %rdi
00000000000ffe8a	xorl	%esi, %esi
00000000000ffe8c	callq	0x6df56a                        ## symbol stub for: __ZNK13OZChannelBase6getRefEb
00000000000ffe91	movq	%rax, 0x8(%r14)
00000000000ffe95	movq	(%rbx), %rax
00000000000ffe98	movq	%rbx, %rdi
00000000000ffe9b	callq	*0xf8(%rax)
00000000000ffea1	movq	%rax, 0x10(%r14)
00000000000ffea5	popq	%rbx
00000000000ffea6	popq	%r14
00000000000ffea8	popq	%rbp
00000000000ffea9	retq
00000000000ffeaa	nopw	(%rax,%rax)
