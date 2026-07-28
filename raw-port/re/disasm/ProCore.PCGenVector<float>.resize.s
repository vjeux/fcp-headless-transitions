__ZN11PCGenVectorIfE6resizeEi:
00000000000b80fc	pushq	%rbp
00000000000b80fd	movq	%rsp, %rbp
00000000000b8100	pushq	%r15
00000000000b8102	pushq	%r14
00000000000b8104	pushq	%r12
00000000000b8106	pushq	%rbx
00000000000b8107	subq	$0x10, %rsp
00000000000b810b	cmpl	%esi, 0x8(%rdi)
00000000000b810e	je	0xb81ca
00000000000b8114	movl	%esi, %r14d
00000000000b8117	movq	%rdi, %rbx
00000000000b811a	leaq	-0x28(%rbp), %r15
00000000000b811e	movq	%r15, %rdi
00000000000b8121	callq	__ZN13PCGenBlockRefIfEC2Ei      ## PCGenBlockRef<float>::PCGenBlockRef(int)
00000000000b8126	movl	0x8(%rbx), %r12d
00000000000b812a	cmpl	%r12d, %r14d
00000000000b812d	cmovll	%r14d, %r12d
00000000000b8131	movq	(%r15), %r15
00000000000b8134	movslq	%r14d, %rsi
00000000000b8137	shlq	$0x2, %rsi
00000000000b813b	movq	%r15, %rdi
00000000000b813e	callq	0xde79e                         ## symbol stub for: _bzero
00000000000b8143	movslq	0xc(%rbx), %rax
00000000000b8147	movq	0x10(%rbx), %rsi
00000000000b814b	cmpq	$0x1, %rax
00000000000b814f	jne	0xb8167
00000000000b8151	testq	%rsi, %rsi
00000000000b8154	je	0xb8198
00000000000b8156	movslq	%r12d, %rdx
00000000000b8159	shlq	$0x2, %rdx
00000000000b815d	movq	%r15, %rdi
00000000000b8160	callq	0xde960                         ## symbol stub for: _memcpy
00000000000b8165	jmp	0xb8198
00000000000b8167	testq	%rsi, %rsi
00000000000b816a	setne	%cl
00000000000b816d	testl	%r12d, %r12d
00000000000b8170	setg	%dl
00000000000b8173	andb	%cl, %dl
00000000000b8175	cmpb	$0x1, %dl
00000000000b8178	jne	0xb8198
00000000000b817a	movl	%r12d, %ecx
00000000000b817d	shlq	$0x2, %rax
00000000000b8181	xorl	%edx, %edx
00000000000b8183	movss	(%rsi), %xmm0
00000000000b8187	movss	%xmm0, (%r15,%rdx,4)
00000000000b818d	incq	%rdx
00000000000b8190	addq	%rax, %rsi
00000000000b8193	cmpq	%rdx, %rcx
00000000000b8196	jne	0xb8183
00000000000b8198	movq	-0x28(%rbp), %rsi
00000000000b819c	movq	%rbx, %rdi
00000000000b819f	callq	__ZN13PCGenBlockRefIPcE6assignEPS0_ ## PCGenBlockRef<char*>::assign(char**)
00000000000b81a4	movq	%r15, 0x10(%rbx)
00000000000b81a8	movl	%r14d, 0x8(%rbx)
00000000000b81ac	movl	$0x1, 0xc(%rbx)
00000000000b81b3	movq	-0x28(%rbp), %rdi
00000000000b81b7	testq	%rdi, %rdi
00000000000b81ba	je	0xb81ca
00000000000b81bc	decl	-0x4(%rdi)
00000000000b81bf	jne	0xb81ca
00000000000b81c1	addq	$-0x8, %rdi
00000000000b81c5	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b81ca	addq	$0x10, %rsp
00000000000b81ce	popq	%rbx
00000000000b81cf	popq	%r12
00000000000b81d1	popq	%r14
00000000000b81d3	popq	%r15
00000000000b81d5	popq	%rbp
00000000000b81d6	retq
00000000000b81d7	movq	%rax, %rbx
00000000000b81da	movq	-0x28(%rbp), %rdi
00000000000b81de	testq	%rdi, %rdi
00000000000b81e1	je	0xb81e8
00000000000b81e3	callq	__ZN11PCMatchmove10solveFrameEi.cold.1 ## PCMatchmove::solveFrame(int) (.cold.1)
00000000000b81e8	movq	%rbx, %rdi
00000000000b81eb	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
