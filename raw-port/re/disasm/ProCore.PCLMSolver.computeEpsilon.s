__ZN10PCLMSolver14computeEpsilonERK11PCGenVectorIfE:
00000000000b6e9e	pushq	%rbp
00000000000b6e9f	movq	%rsp, %rbp
00000000000b6ea2	pushq	%r15
00000000000b6ea4	pushq	%r14
00000000000b6ea6	pushq	%r12
00000000000b6ea8	pushq	%rbx
00000000000b6ea9	subq	$0x20, %rsp
00000000000b6ead	movq	%rsi, %r14
00000000000b6eb0	movq	%rdi, %r15
00000000000b6eb3	movl	0x8(%rsi), %ebx
00000000000b6eb6	leaq	-0x40(%rbp), %r12
00000000000b6eba	movq	%r12, %rdi
00000000000b6ebd	movl	%ebx, %esi
00000000000b6ebf	callq	__ZN13PCGenBlockRefIfEC2Ei      ## PCGenBlockRef<float>::PCGenBlockRef(int)
00000000000b6ec4	movl	%ebx, 0x8(%r12)
00000000000b6ec9	movl	$0x1, 0xc(%r12)
00000000000b6ed2	movq	(%r12), %rdi
00000000000b6ed6	movq	%rdi, 0x10(%r12)
00000000000b6edb	movl	0x8(%r14), %eax
00000000000b6edf	movq	0x10(%r14), %rcx
00000000000b6ee3	movslq	0xc(%r14), %rsi
00000000000b6ee7	movq	0x38(%r15), %rdx
00000000000b6eeb	movslq	0x34(%r15), %r8
00000000000b6eef	movl	%esi, %r9d
00000000000b6ef2	xorl	$0x1, %r9d
00000000000b6ef6	movl	%r8d, %r10d
00000000000b6ef9	xorl	$0x1, %r10d
00000000000b6efd	orl	%r9d, %r10d
00000000000b6f00	jne	0xb6f21
00000000000b6f02	testl	%eax, %eax
00000000000b6f04	jle	0xb6f4c
00000000000b6f06	xorl	%esi, %esi
00000000000b6f08	movss	(%rcx,%rsi,4), %xmm0
00000000000b6f0d	subss	(%rdx,%rsi,4), %xmm0
00000000000b6f12	movss	%xmm0, (%rdi,%rsi,4)
00000000000b6f17	incq	%rsi
00000000000b6f1a	cmpq	%rsi, %rax
00000000000b6f1d	jne	0xb6f08
00000000000b6f1f	jmp	0xb6f4c
00000000000b6f21	testl	%eax, %eax
00000000000b6f23	jle	0xb6f4c
00000000000b6f25	shlq	$0x2, %r8
00000000000b6f29	shlq	$0x2, %rsi
00000000000b6f2d	xorl	%r9d, %r9d
00000000000b6f30	movss	(%rcx), %xmm0
00000000000b6f34	subss	(%rdx), %xmm0
00000000000b6f38	movss	%xmm0, (%rdi,%r9,4)
00000000000b6f3e	incq	%r9
00000000000b6f41	addq	%r8, %rdx
00000000000b6f44	addq	%rsi, %rcx
00000000000b6f47	cmpq	%r9, %rax
00000000000b6f4a	jne	0xb6f30
00000000000b6f4c	movl	%ebx, %esi
00000000000b6f4e	callq	__Z13_vector_norm2IKfET_PS1_i   ## float const _vector_norm2<float const>(float const*, int)
00000000000b6f53	movq	-0x40(%rbp), %rdi
00000000000b6f57	testq	%rdi, %rdi
00000000000b6f5a	je	0xb6f74
00000000000b6f5c	decl	-0x4(%rdi)
00000000000b6f5f	jne	0xb6f74
00000000000b6f61	addq	$-0x8, %rdi
00000000000b6f65	movss	%xmm0, -0x24(%rbp)
00000000000b6f6a	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b6f6f	movss	-0x24(%rbp), %xmm0
00000000000b6f74	sqrtss	%xmm0, %xmm0
00000000000b6f78	addq	$0x20, %rsp
00000000000b6f7c	popq	%rbx
00000000000b6f7d	popq	%r12
00000000000b6f7f	popq	%r14
00000000000b6f81	popq	%r15
00000000000b6f83	popq	%rbp
00000000000b6f84	retq
00000000000b6f85	movq	%rax, %rbx
00000000000b6f88	movq	-0x40(%rbp), %rdi
00000000000b6f8c	testq	%rdi, %rdi
00000000000b6f8f	je	0xb6f96
00000000000b6f91	callq	__ZN11PCMatchmove10solveFrameEi.cold.1 ## PCMatchmove::solveFrame(int) (.cold.1)
00000000000b6f96	movq	%rbx, %rdi
00000000000b6f99	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
