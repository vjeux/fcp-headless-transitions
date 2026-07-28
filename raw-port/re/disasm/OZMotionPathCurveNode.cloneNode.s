__ZN21OZMotionPathCurveNode9cloneNodeEv:
000000000040d650	pushq	%rbp
000000000040d651	movq	%rsp, %rbp
000000000040d654	pushq	%r15
000000000040d656	pushq	%r14
000000000040d658	pushq	%rbx
000000000040d659	pushq	%rax
000000000040d65a	movq	%rdi, %r14
000000000040d65d	movl	$0x88, %edi
000000000040d662	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000040d667	movq	%rax, %rbx
000000000040d66a	movq	%rax, %rdi
000000000040d66d	movq	%r14, %rsi
000000000040d670	callq	__ZN19OZBehaviorCurveNodeC2ERKS_ ## OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehaviorCurveNode const&)
000000000040d675	leaq	0x4511c4(%rip), %rax
000000000040d67c	movq	%rax, (%rbx)
000000000040d67f	leaq	0x20(%rbx), %r15
000000000040d683	movl	$0x0, 0x20(%rbx)
000000000040d68a	movq	%rbx, %rdi
000000000040d68d	addq	$0x28, %rdi
000000000040d691	callq	0x6dd614                        ## symbol stub for: __ZN11PCEvaluatorC1Ev
000000000040d696	movl	0x1c(%r14), %eax
000000000040d69a	movl	%eax, 0x1c(%rbx)
000000000040d69d	movq	%rbx, %rax
000000000040d6a0	addq	$0x8, %rsp
000000000040d6a4	popq	%rbx
000000000040d6a5	popq	%r14
000000000040d6a7	popq	%r15
000000000040d6a9	popq	%rbp
000000000040d6aa	retq
000000000040d6ab	movq	%rax, %r14
000000000040d6ae	movq	%r15, %rdi
000000000040d6b1	callq	0x6dd452                        ## symbol stub for: __ZN10PCSpinLockD1Ev
000000000040d6b6	movq	%rbx, %rdi
000000000040d6b9	callq	__ZN19OZBehaviorCurveNodeD2Ev   ## OZBehaviorCurveNode::~OZBehaviorCurveNode()
000000000040d6be	movq	%rbx, %rdi
000000000040d6c1	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000040d6c6	movq	%r14, %rdi
000000000040d6c9	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000040d6ce	movq	%rax, %r14
000000000040d6d1	movq	%rbx, %rdi
000000000040d6d4	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000040d6d9	movq	%r14, %rdi
000000000040d6dc	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000040d6e1	nopw	%cs:(%rax,%rax)
