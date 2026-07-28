__ZN13OZChannelUndoC2ERK13OZChannelBase:
00000000000ffe30	pushq	%rbp
00000000000ffe31	movq	%rsp, %rbp
00000000000ffe34	pushq	%r14
00000000000ffe36	pushq	%rbx
00000000000ffe37	movq	%rsi, %rbx
00000000000ffe3a	movq	%rdi, %r14
00000000000ffe3d	leaq	0x73d6f4(%rip), %rax
00000000000ffe44	movq	%rax, (%rdi)
00000000000ffe47	movq	%rsi, %rdi
00000000000ffe4a	xorl	%esi, %esi
00000000000ffe4c	callq	0x6df56a                        ## symbol stub for: __ZNK13OZChannelBase6getRefEb
00000000000ffe51	movq	%rax, 0x8(%r14)
00000000000ffe55	movq	(%rbx), %rax
00000000000ffe58	movq	%rbx, %rdi
00000000000ffe5b	callq	*0xf8(%rax)
00000000000ffe61	movq	%rax, 0x10(%r14)
00000000000ffe65	popq	%rbx
00000000000ffe66	popq	%r14
00000000000ffe68	popq	%rbp
00000000000ffe69	retq
00000000000ffe6a	nopw	(%rax,%rax)
