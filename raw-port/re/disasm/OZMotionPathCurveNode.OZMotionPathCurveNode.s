__ZN21OZMotionPathCurveNodeC1EP10OZBehaviorP9OZChannel:
000000000040ac60	pushq	%rbp
000000000040ac61	movq	%rsp, %rbp
000000000040ac64	pushq	%r15
000000000040ac66	pushq	%r14
000000000040ac68	pushq	%rbx
000000000040ac69	pushq	%rax
000000000040ac6a	movq	%rdx, %r14
000000000040ac6d	movq	%rdi, %rbx
000000000040ac70	callq	__ZN19OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel ## OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehavior*, OZChannel*)
000000000040ac75	leaq	0x453bc4(%rip), %rax
000000000040ac7c	movq	%rax, (%rbx)
000000000040ac7f	leaq	0x20(%rbx), %r15
000000000040ac83	movl	$0x0, 0x20(%rbx)
000000000040ac8a	leaq	0x28(%rbx), %rdi
000000000040ac8e	callq	0x6dd614                        ## symbol stub for: __ZN11PCEvaluatorC1Ev
000000000040ac93	movl	0x18(%r14), %eax
000000000040ac97	movl	%eax, 0x1c(%rbx)
000000000040ac9a	addq	$0x8, %rsp
000000000040ac9e	popq	%rbx
000000000040ac9f	popq	%r14
000000000040aca1	popq	%r15
000000000040aca3	popq	%rbp
000000000040aca4	retq
000000000040aca5	movq	%rax, %r14
000000000040aca8	movq	%r15, %rdi
000000000040acab	callq	0x6dd452                        ## symbol stub for: __ZN10PCSpinLockD1Ev
000000000040acb0	movq	%rbx, %rdi
000000000040acb3	callq	__ZN19OZBehaviorCurveNodeD2Ev   ## OZBehaviorCurveNode::~OZBehaviorCurveNode()
000000000040acb8	movq	%r14, %rdi
000000000040acbb	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
