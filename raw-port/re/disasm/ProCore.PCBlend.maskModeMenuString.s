__ZN7PCBlend18maskModeMenuStringEv:
0000000000017bfa	pushq	%rbp
0000000000017bfb	movq	%rsp, %rbp
0000000000017bfe	pushq	%r14
0000000000017c00	pushq	%rbx
0000000000017c01	movq	__ZZN7PCBlend18maskModeMenuStringEvE19pMaskModeMenuString(%rip), %rbx ## PCBlend::maskModeMenuString()::pMaskModeMenuString
0000000000017c08	testq	%rbx, %rbx
0000000000017c0b	jne	0x17c37
0000000000017c0d	movl	$0x8, %edi
0000000000017c12	callq	0xde6cc                         ## symbol stub for: __Znwm
0000000000017c17	movq	%rax, %rbx
0000000000017c1a	leaq	0x119a69(%rip), %rsi            ## literal pool for: "Mask Blend Modes"
0000000000017c21	leaq	0x119a0c(%rip), %rdx            ## literal pool for: "com.apple.procore.framework"
0000000000017c28	movq	%rax, %rdi
0000000000017c2b	callq	__ZN8PCStringC1EPKcS1_          ## PCString::PCString(char const*, char const*)
0000000000017c30	movq	%rbx, __ZZN7PCBlend18maskModeMenuStringEvE19pMaskModeMenuString(%rip) ## PCBlend::maskModeMenuString()::pMaskModeMenuString
0000000000017c37	movq	%rbx, %rax
0000000000017c3a	popq	%rbx
0000000000017c3b	popq	%r14
0000000000017c3d	popq	%rbp
0000000000017c3e	retq
0000000000017c3f	movq	%rax, %r14
0000000000017c42	movq	%rbx, %rdi
0000000000017c45	callq	0xde6c0                         ## symbol stub for: __ZdlPv
0000000000017c4a	movq	%r14, %rdi
0000000000017c4d	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
