__ZN10PCLMSolver8setStateERK11PCGenVectorIfE:
00000000000b6e24	pushq	%rbp
00000000000b6e25	movq	%rsp, %rbp
00000000000b6e28	pushq	%r14
00000000000b6e2a	pushq	%rbx
00000000000b6e2b	movq	%rdi, %rbx
00000000000b6e2e	addq	$0x10, %rdi
00000000000b6e32	cmpq	%rdi, %rsi
00000000000b6e35	je	0xb6e52
00000000000b6e37	movq	%rsi, %r14
00000000000b6e3a	movq	0x8(%rsi), %rax
00000000000b6e3e	movq	%rax, 0x18(%rbx)
00000000000b6e42	movq	(%rsi), %rsi
00000000000b6e45	callq	__ZN13PCGenBlockRefIPcE6assignEPS0_ ## PCGenBlockRef<char*>::assign(char**)
00000000000b6e4a	movq	0x10(%r14), %rax
00000000000b6e4e	movq	%rax, 0x20(%rbx)
00000000000b6e52	movl	0x18(%rbx), %eax
00000000000b6e55	movl	%eax, 0x90(%rbx)
00000000000b6e5b	popq	%rbx
00000000000b6e5c	popq	%r14
00000000000b6e5e	popq	%rbp
00000000000b6e5f	retq
