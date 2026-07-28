__ZN18OZChannelSceneNode7compareEPK13OZChannelBase:
0000000000213c20	pushq	%rbp
0000000000213c21	movq	%rsp, %rbp
0000000000213c24	pushq	%r14
0000000000213c26	pushq	%rbx
0000000000213c27	testq	%rsi, %rsi
0000000000213c2a	je	0x213c72
0000000000213c2c	movq	%rdi, %r14
0000000000213c2f	movq	0x60eafa(%rip), %rax            ## literal pool symbol address: __ZTI13OZChannelBase
0000000000213c36	leaq	__ZTI18OZChannelSceneNode(%rip), %rdx ## typeinfo for OZChannelSceneNode
0000000000213c3d	xorl	%ebx, %ebx
0000000000213c3f	movq	%rsi, %rdi
0000000000213c42	movq	%rax, %rsi
0000000000213c45	xorl	%ecx, %ecx
0000000000213c47	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000213c4c	testq	%rax, %rax
0000000000213c4f	je	0x213c74
0000000000213c51	movq	0x100(%r14), %rcx
0000000000213c58	cmpq	0x100(%rax), %rcx
0000000000213c5f	jne	0x213c72
0000000000213c61	movq	%r14, %rdi
0000000000213c64	movq	%rax, %rsi
0000000000213c67	callq	0x6df636                        ## symbol stub for: __ZNK15OZChannelFolder7compareEPK13OZChannelBase
0000000000213c6c	movb	$0x1, %bl
0000000000213c6e	testb	%al, %al
0000000000213c70	jne	0x213c74
0000000000213c72	xorl	%ebx, %ebx
0000000000213c74	movl	%ebx, %eax
0000000000213c76	popq	%rbx
0000000000213c77	popq	%r14
0000000000213c79	popq	%rbp
0000000000213c7a	retq
0000000000213c7b	nopl	(%rax,%rax)
