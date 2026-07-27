__ZN7PCBlend24reflectionModeMenuStringEv:
00000000000179d6	pushq	%rbp
00000000000179d7	movq	%rsp, %rbp
00000000000179da	pushq	%r14
00000000000179dc	pushq	%rbx
00000000000179dd	movq	__ZZN7PCBlend24reflectionModeMenuStringEvE25pReflectionModeMenuString(%rip), %rbx ## PCBlend::reflectionModeMenuString()::pReflectionModeMenuString
00000000000179e4	testq	%rbx, %rbx
00000000000179e7	jne	0x17a13
00000000000179e9	movl	$0x8, %edi
00000000000179ee	callq	0xde6cc                         ## symbol stub for: __Znwm
00000000000179f3	movq	%rax, %rbx
00000000000179f6	leaq	0x119c76(%rip), %rsi            ## literal pool for: "Blend Modes Reflection"
00000000000179fd	leaq	0x119c30(%rip), %rdx            ## literal pool for: "com.apple.procore.framework"
0000000000017a04	movq	%rax, %rdi
0000000000017a07	callq	__ZN8PCStringC1EPKcS1_          ## PCString::PCString(char const*, char const*)
0000000000017a0c	movq	%rbx, __ZZN7PCBlend24reflectionModeMenuStringEvE25pReflectionModeMenuString(%rip) ## PCBlend::reflectionModeMenuString()::pReflectionModeMenuString
0000000000017a13	movq	%rbx, %rax
0000000000017a16	popq	%rbx
0000000000017a17	popq	%r14
0000000000017a19	popq	%rbp
0000000000017a1a	retq
0000000000017a1b	movq	%rax, %r14
0000000000017a1e	movq	%rbx, %rdi
0000000000017a21	callq	0xde6c0                         ## symbol stub for: __ZdlPv
0000000000017a26	movq	%r14, %rdi
0000000000017a29	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
