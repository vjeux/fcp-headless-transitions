__ZN21OZSingleChanCurveNodeC1EP22OZSingleChanBehaviorIFP9OZChannel:
00000000003ebac0	pushq	%rbp
00000000003ebac1	movq	%rsp, %rbp
00000000003ebac4	pushq	%r15
00000000003ebac6	pushq	%r14
00000000003ebac8	pushq	%rbx
00000000003ebac9	pushq	%rax
00000000003ebaca	movq	%rdx, %rbx
00000000003ebacd	movq	%rsi, %r14
00000000003ebad0	movq	%rdi, %r15
00000000003ebad3	movq	(%rsi), %rax
00000000003ebad6	movq	%rsi, %rdi
00000000003ebad9	callq	*0x48(%rax)
00000000003ebadc	movq	%r15, %rdi
00000000003ebadf	movq	%rax, %rsi
00000000003ebae2	movq	%rbx, %rdx
00000000003ebae5	callq	__ZN19OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel ## OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehavior*, OZChannel*)
00000000003ebaea	leaq	0x470f7f(%rip), %rax
00000000003ebaf1	movq	%rax, (%r15)
00000000003ebaf4	movq	%r14, 0x20(%r15)
00000000003ebaf8	movl	0x18(%rbx), %eax
00000000003ebafb	movl	%eax, 0x28(%r15)
00000000003ebaff	addq	$0x8, %rsp
00000000003ebb03	popq	%rbx
00000000003ebb04	popq	%r14
00000000003ebb06	popq	%r15
00000000003ebb08	popq	%rbp
00000000003ebb09	retq
00000000003ebb0a	nopw	(%rax,%rax)
