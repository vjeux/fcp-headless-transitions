__ZN21OZSingleChanCurveNode9cloneNodeEv:
00000000003ebd50	pushq	%rbp
00000000003ebd51	movq	%rsp, %rbp
00000000003ebd54	pushq	%r14
00000000003ebd56	pushq	%rbx
00000000003ebd57	movq	%rdi, %r14
00000000003ebd5a	movl	$0x30, %edi
00000000003ebd5f	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003ebd64	movq	%rax, %rbx
00000000003ebd67	movq	%rax, %rdi
00000000003ebd6a	movq	%r14, %rsi
00000000003ebd6d	callq	__ZN19OZBehaviorCurveNodeC2ERKS_ ## OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehaviorCurveNode const&)
00000000003ebd72	leaq	0x470cf7(%rip), %rax
00000000003ebd79	movq	%rax, (%rbx)
00000000003ebd7c	movq	0x20(%r14), %rax
00000000003ebd80	movq	%rax, 0x20(%rbx)
00000000003ebd84	movl	0x28(%r14), %eax
00000000003ebd88	movl	%eax, 0x28(%rbx)
00000000003ebd8b	movq	%rbx, %rax
00000000003ebd8e	popq	%rbx
00000000003ebd8f	popq	%r14
00000000003ebd91	popq	%rbp
00000000003ebd92	retq
00000000003ebd93	movq	%rax, %r14
00000000003ebd96	movq	%rbx, %rdi
00000000003ebd99	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003ebd9e	movq	%r14, %rdi
00000000003ebda1	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000003ebda6	nopw	%cs:(%rax,%rax)
