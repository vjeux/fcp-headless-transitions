__ZN21OZSimulationCurveNode9cloneNodeEv:
0000000000208ff0	pushq	%rbp
0000000000208ff1	movq	%rsp, %rbp
0000000000208ff4	pushq	%r14
0000000000208ff6	pushq	%rbx
0000000000208ff7	movq	%rdi, %r14
0000000000208ffa	movl	$0x18, %edi
0000000000208fff	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000209004	movq	%rax, %rbx
0000000000209007	movq	%rax, %rdi
000000000020900a	movq	%r14, %rsi
000000000020900d	callq	0x6dd596                        ## symbol stub for: __ZN11OZCurveNodeC2ERKS_
0000000000209012	leaq	0x63cdc7(%rip), %rax
0000000000209019	movq	%rax, (%rbx)
000000000020901c	movq	0x8(%r14), %rax
0000000000209020	movq	%rax, 0x8(%rbx)
0000000000209024	movq	%rbx, %rax
0000000000209027	popq	%rbx
0000000000209028	popq	%r14
000000000020902a	popq	%rbp
000000000020902b	retq
000000000020902c	movq	%rax, %r14
000000000020902f	movq	%rbx, %rdi
0000000000209032	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000209037	movq	%r14, %rdi
000000000020903a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000020903f	nop
