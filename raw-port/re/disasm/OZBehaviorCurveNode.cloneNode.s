__ZN19OZBehaviorCurveNode9cloneNodeEv:
000000000020ba30	pushq	%rbp
000000000020ba31	movq	%rsp, %rbp
000000000020ba34	pushq	%r14
000000000020ba36	pushq	%rbx
000000000020ba37	movq	%rdi, %r14
000000000020ba3a	movl	$0x20, %edi
000000000020ba3f	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000020ba44	movq	%rax, %rbx
000000000020ba47	movq	%rax, %rdi
000000000020ba4a	movq	%r14, %rsi
000000000020ba4d	callq	0x6dd596                        ## symbol stub for: __ZN11OZCurveNodeC2ERKS_
000000000020ba52	leaq	0x63ae3f(%rip), %rax
000000000020ba59	movq	%rax, (%rbx)
000000000020ba5c	movq	0x8(%r14), %rax
000000000020ba60	movq	%rax, 0x8(%rbx)
000000000020ba64	movq	%rbx, %rax
000000000020ba67	popq	%rbx
000000000020ba68	popq	%r14
000000000020ba6a	popq	%rbp
000000000020ba6b	retq
000000000020ba6c	movq	%rax, %r14
000000000020ba6f	movq	%rbx, %rdi
000000000020ba72	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000020ba77	movq	%r14, %rdi
000000000020ba7a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000020ba7f	nop
