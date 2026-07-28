__ZN11PCGenVectorIfE6uniqueEv:
00000000000b7d6c	pushq	%rbp
00000000000b7d6d	movq	%rsp, %rbp
00000000000b7d70	pushq	%r15
00000000000b7d72	pushq	%r14
00000000000b7d74	pushq	%rbx
00000000000b7d75	subq	$0x18, %rsp
00000000000b7d79	movq	%rdi, %rbx
00000000000b7d7c	movq	(%rdi), %rax
00000000000b7d7f	testq	%rax, %rax
00000000000b7d82	je	0xb7d8a
00000000000b7d84	cmpl	$0x1, -0x4(%rax)
00000000000b7d88	je	0xb7df3
00000000000b7d8a	movl	0x8(%rbx), %r15d
00000000000b7d8e	leaq	-0x30(%rbp), %r14
00000000000b7d92	movq	%r14, %rdi
00000000000b7d95	movl	%r15d, %esi
00000000000b7d98	callq	__ZN13PCGenBlockRefIfEC2Ei      ## PCGenBlockRef<float>::PCGenBlockRef(int)
00000000000b7d9d	movl	%r15d, 0x8(%r14)
00000000000b7da1	movl	$0x1, 0xc(%r14)
00000000000b7da9	movq	(%r14), %rax
00000000000b7dac	movq	%rax, 0x10(%r14)
00000000000b7db0	movq	%r14, %rdi
00000000000b7db3	movq	%rbx, %rsi
00000000000b7db6	callq	__ZN11PCGenVectorIfE3setIfEERS0_RKS_IT_E ## PCGenVector<float>& PCGenVector<float>::set<float>(PCGenVector<float> const&)
00000000000b7dbb	cmpq	%rbx, %r14
00000000000b7dbe	je	0xb7ddc
00000000000b7dc0	movq	-0x28(%rbp), %rax
00000000000b7dc4	movq	%rax, 0x8(%rbx)
00000000000b7dc8	movq	-0x30(%rbp), %rsi
00000000000b7dcc	movq	%rbx, %rdi
00000000000b7dcf	callq	__ZN13PCGenBlockRefIPcE6assignEPS0_ ## PCGenBlockRef<char*>::assign(char**)
00000000000b7dd4	movq	-0x20(%rbp), %rax
00000000000b7dd8	movq	%rax, 0x10(%rbx)
00000000000b7ddc	movq	-0x30(%rbp), %rdi
00000000000b7de0	testq	%rdi, %rdi
00000000000b7de3	je	0xb7df3
00000000000b7de5	decl	-0x4(%rdi)
00000000000b7de8	jne	0xb7df3
00000000000b7dea	addq	$-0x8, %rdi
00000000000b7dee	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7df3	addq	$0x18, %rsp
00000000000b7df7	popq	%rbx
00000000000b7df8	popq	%r14
00000000000b7dfa	popq	%r15
00000000000b7dfc	popq	%rbp
00000000000b7dfd	retq
00000000000b7dfe	movq	%rax, %rbx
00000000000b7e01	movq	-0x30(%rbp), %rdi
00000000000b7e05	testq	%rdi, %rdi
00000000000b7e08	je	0xb7e2b
00000000000b7e0a	callq	__ZN11PCMatchmove10solveFrameEi.cold.1 ## PCMatchmove::solveFrame(int) (.cold.1)
00000000000b7e0f	jmp	0xb7e2b
00000000000b7e11	movq	%rax, %rbx
00000000000b7e14	movq	-0x30(%rbp), %rdi
00000000000b7e18	testq	%rdi, %rdi
00000000000b7e1b	je	0xb7e2b
00000000000b7e1d	decl	-0x4(%rdi)
00000000000b7e20	jne	0xb7e2b
00000000000b7e22	addq	$-0x8, %rdi
00000000000b7e26	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b7e2b	movq	%rbx, %rdi
00000000000b7e2e	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
00000000000b7e33	nop
