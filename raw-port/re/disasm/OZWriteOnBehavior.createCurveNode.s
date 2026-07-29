__ZN17OZWriteOnBehavior15createCurveNodeEP9OZChannel:
00000000004755f0	pushq	%rbp
00000000004755f1	movq	%rsp, %rbp
00000000004755f4	pushq	%r14
00000000004755f6	pushq	%rbx
00000000004755f7	movq	%rdi, %r14
00000000004755fa	movl	$0x20, %edi
00000000004755ff	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000475604	movq	%rax, %rbx
0000000000475607	movq	%rax, %rdi
000000000047560a	movq	%r14, %rsi
000000000047560d	xorl	%edx, %edx
000000000047560f	callq	__ZN18OZWriteOnCurveNodeC1EP10OZBehaviorP9OZChannel ## OZWriteOnCurveNode::OZWriteOnCurveNode(OZBehavior*, OZChannel*)
0000000000475614	movq	%rbx, %rax
0000000000475617	popq	%rbx
0000000000475618	popq	%r14
000000000047561a	popq	%rbp
000000000047561b	retq
000000000047561c	movq	%rax, %r14
000000000047561f	movq	%rbx, %rdi
0000000000475622	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000475627	movq	%r14, %rdi
000000000047562a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000047562f	nop
