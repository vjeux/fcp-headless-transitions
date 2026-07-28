__ZN10PCLMSolver7setGoalERK11PCGenVectorIfE:
00000000000b6de8	pushq	%rbp
00000000000b6de9	movq	%rsp, %rbp
00000000000b6dec	pushq	%r14
00000000000b6dee	pushq	%rbx
00000000000b6def	movq	%rdi, %rbx
00000000000b6df2	addq	$0x28, %rdi
00000000000b6df6	cmpq	%rdi, %rsi
00000000000b6df9	je	0xb6e16
00000000000b6dfb	movq	%rsi, %r14
00000000000b6dfe	movq	0x8(%rsi), %rax
00000000000b6e02	movq	%rax, 0x30(%rbx)
00000000000b6e06	movq	(%rsi), %rsi
00000000000b6e09	callq	__ZN13PCGenBlockRefIPcE6assignEPS0_ ## PCGenBlockRef<char*>::assign(char**)
00000000000b6e0e	movq	0x10(%r14), %rax
00000000000b6e12	movq	%rax, 0x38(%rbx)
00000000000b6e16	movl	0x30(%rbx), %eax
00000000000b6e19	movl	%eax, 0x94(%rbx)
00000000000b6e1f	popq	%rbx
00000000000b6e20	popq	%r14
00000000000b6e22	popq	%rbp
00000000000b6e23	retq
