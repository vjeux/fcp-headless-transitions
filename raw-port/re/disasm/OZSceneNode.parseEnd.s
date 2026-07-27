__ZN11OZSceneNode8parseEndER22PCSerializerReadStream:
00000000000919d0	pushq	%rbp
00000000000919d1	movq	%rsp, %rbp
00000000000919d4	pushq	%r14
00000000000919d6	pushq	%rbx
00000000000919d7	movq	%rdi, %rbx
00000000000919da	addq	$0x30, %rdi
00000000000919de	callq	__ZN19OZChannelObjectRoot8parseEndER22PCSerializerReadStream ## OZChannelObjectRoot::parseEnd(PCSerializerReadStream&)
00000000000919e3	leaq	0x3e0(%rbx), %r14
00000000000919ea	cmpq	0x3e8(%rbx), %r14
00000000000919f1	je	0x91a1c
00000000000919f3	nopw	%cs:(%rax,%rax)
0000000000091a00	movq	(%r14), %rax
0000000000091a03	movq	0x10(%rax), %rdi
0000000000091a07	movq	(%rdi), %rax
0000000000091a0a	callq	*0x80(%rax)
0000000000091a10	movq	(%r14), %r14
0000000000091a13	cmpq	0x3e8(%rbx), %r14
0000000000091a1a	jne	0x91a00
0000000000091a1c	movq	(%rbx), %rax
0000000000091a1f	movq	%rbx, %rdi
0000000000091a22	callq	*0x58(%rax)
0000000000091a25	movb	$0x1, %al
0000000000091a27	popq	%rbx
0000000000091a28	popq	%r14
0000000000091a2a	popq	%rbp
0000000000091a2b	retq
0000000000091a2c	nopl	(%rax)
