__ZN21OZMotionPathCurveNodeD0Ev:
000000000040ae00	pushq	%rbp
000000000040ae01	movq	%rsp, %rbp
000000000040ae04	pushq	%rbx
000000000040ae05	pushq	%rax
000000000040ae06	movq	%rdi, %rbx
000000000040ae09	leaq	0x453a30(%rip), %rax
000000000040ae10	movq	%rax, (%rdi)
000000000040ae13	addq	$0x28, %rdi
000000000040ae17	callq	0x6dd61a                        ## symbol stub for: __ZN11PCEvaluatorD1Ev
000000000040ae1c	leaq	0x20(%rbx), %rdi
000000000040ae20	callq	0x6dd452                        ## symbol stub for: __ZN10PCSpinLockD1Ev
000000000040ae25	movq	%rbx, %rdi
000000000040ae28	callq	__ZN19OZBehaviorCurveNodeD2Ev   ## OZBehaviorCurveNode::~OZBehaviorCurveNode()
000000000040ae2d	movq	%rbx, %rdi
000000000040ae30	addq	$0x8, %rsp
000000000040ae34	popq	%rbx
000000000040ae35	popq	%rbp
000000000040ae36	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000040ae3b	nopl	(%rax,%rax)
