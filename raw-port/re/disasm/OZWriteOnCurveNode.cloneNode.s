__ZN18OZWriteOnCurveNode9cloneNodeEv:
0000000000477990	pushq	%rbp
0000000000477991	movq	%rsp, %rbp
0000000000477994	pushq	%r14
0000000000477996	pushq	%rbx
0000000000477997	movq	%rdi, %r14
000000000047799a	movl	$0x20, %edi
000000000047799f	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000004779a4	movq	%rax, %rbx
00000000004779a7	movq	%rax, %rdi
00000000004779aa	movq	%r14, %rsi
00000000004779ad	callq	__ZN19OZBehaviorCurveNodeC2ERKS_ ## OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehaviorCurveNode const&)
00000000004779b2	leaq	0x3f17b7(%rip), %rax
00000000004779b9	movq	%rax, (%rbx)
00000000004779bc	movq	%rbx, %rax
00000000004779bf	popq	%rbx
00000000004779c0	popq	%r14
00000000004779c2	popq	%rbp
00000000004779c3	retq
00000000004779c4	movq	%rax, %r14
00000000004779c7	movq	%rbx, %rdi
00000000004779ca	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004779cf	movq	%r14, %rdi
00000000004779d2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004779d7	nopw	(%rax,%rax)
