__ZN14HGColorConform13SetConversionENS_30hgColorConformConversionPresetE:
00000000001cc5d0	pushq	%rbp
00000000001cc5d1	movq	%rsp, %rbp
00000000001cc5d4	pushq	%r14
00000000001cc5d6	pushq	%rbx
00000000001cc5d7	movl	%esi, %eax
00000000001cc5d9	andl	$-0x2, %eax
00000000001cc5dc	xorl	%ecx, %ecx
00000000001cc5de	cmpl	$0x16, %eax
00000000001cc5e1	movl	%esi, %r14d
00000000001cc5e4	cmovel	%ecx, %r14d
00000000001cc5e8	leal	-0x1(%rsi), %eax
00000000001cc5eb	cmpl	$0x4, %eax
00000000001cc5ee	cmovbl	%ecx, %r14d
00000000001cc5f2	cmpl	$0x18, %esi
00000000001cc5f5	cmovel	%ecx, %r14d
00000000001cc5f9	cmpl	$0x5, %esi
00000000001cc5fc	cmovel	%ecx, %r14d
00000000001cc600	cmpl	%r14d, 0x1e4(%rdi)
00000000001cc607	je	0x1cc620
00000000001cc609	movq	%rdi, %rbx
00000000001cc60c	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001cc611	movl	%r14d, 0x1e4(%rbx)
00000000001cc618	movq	%rbx, %rdi
00000000001cc61b	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001cc620	movb	$0x1, %al
00000000001cc622	popq	%rbx
00000000001cc623	popq	%r14
00000000001cc625	popq	%rbp
00000000001cc626	retq
00000000001cc627	nopw	(%rax,%rax)
