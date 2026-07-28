__ZN10PCLMSolver8setTrustERK11PCGenVectorIfE:
00000000000b6e6a	pushq	%rbp
00000000000b6e6b	movq	%rsp, %rbp
00000000000b6e6e	pushq	%r14
00000000000b6e70	pushq	%rbx
00000000000b6e71	movq	%rdi, %rbx
00000000000b6e74	addq	$0x58, %rdi
00000000000b6e78	cmpq	%rdi, %rsi
00000000000b6e7b	je	0xb6e98
00000000000b6e7d	movq	%rsi, %r14
00000000000b6e80	movq	0x8(%rsi), %rax
00000000000b6e84	movq	%rax, 0x60(%rbx)
00000000000b6e88	movq	(%rsi), %rsi
00000000000b6e8b	callq	__ZN13PCGenBlockRefIPcE6assignEPS0_ ## PCGenBlockRef<char*>::assign(char**)
00000000000b6e90	movq	0x10(%r14), %rax
00000000000b6e94	movq	%rax, 0x68(%rbx)
00000000000b6e98	popq	%rbx
00000000000b6e99	popq	%r14
00000000000b6e9b	popq	%rbp
00000000000b6e9c	retq
00000000000b6e9d	nop
