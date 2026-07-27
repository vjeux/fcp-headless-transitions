__ZN13OZChannelBase12parseElementER22PCSerializerReadStreamR15PCStreamElement:
000000000004bf1a	cmpl	$0x70, 0x8(%rdx)
000000000004bf1e	jne	0x4bf6f
000000000004bf20	pushq	%rbp
000000000004bf21	movq	%rsp, %rbp
000000000004bf24	pushq	%r14
000000000004bf26	pushq	%rbx
000000000004bf27	subq	$0x10, %rsp
000000000004bf2b	movq	%rdi, %rbx
000000000004bf2e	movq	(%rdx), %rax
000000000004bf31	leaq	-0x18(%rbp), %rsi
000000000004bf35	movq	%rdx, %rdi
000000000004bf38	callq	*0x30(%rax)
000000000004bf3b	testb	%al, %al
000000000004bf3d	je	0x4bf67
000000000004bf3f	movq	-0x18(%rbp), %r14
000000000004bf43	movabsq	$-0x2135b307a, %rax             ## imm = 0xFFFFFFFDECA4CF86
000000000004bf4d	testq	%rax, %r14
000000000004bf50	je	0x4bf63
000000000004bf52	movq	(%rbx), %rax
000000000004bf55	movq	%rbx, %rdi
000000000004bf58	movl	$0x2, %esi
000000000004bf5d	callq	*0x1d0(%rax)
000000000004bf63	movq	%r14, 0x38(%rbx)
000000000004bf67	addq	$0x10, %rsp
000000000004bf6b	popq	%rbx
000000000004bf6c	popq	%r14
000000000004bf6e	popq	%rbp
000000000004bf6f	movb	$0x1, %al
000000000004bf71	retq
