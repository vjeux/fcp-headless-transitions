__ZN7PCBlend23lightWrapModeMenuStringEv:
000000000001797e	pushq	%rbp
000000000001797f	movq	%rsp, %rbp
0000000000017982	pushq	%r14
0000000000017984	pushq	%rbx
0000000000017985	movq	__ZZN7PCBlend23lightWrapModeMenuStringEvE24pLightWrapModeMenuString(%rip), %rbx ## PCBlend::lightWrapModeMenuString()::pLightWrapModeMenuString
000000000001798c	testq	%rbx, %rbx
000000000001798f	jne	0x179bb
0000000000017991	movl	$0x8, %edi
0000000000017996	callq	0xde6cc                         ## symbol stub for: __Znwm
000000000001799b	movq	%rax, %rbx
000000000001799e	leaq	0x119cb7(%rip), %rsi            ## literal pool for: "Light Wrap Blend Modes"
00000000000179a5	leaq	0x119c88(%rip), %rdx            ## literal pool for: "com.apple.procore.framework"
00000000000179ac	movq	%rax, %rdi
00000000000179af	callq	__ZN8PCStringC1EPKcS1_          ## PCString::PCString(char const*, char const*)
00000000000179b4	movq	%rbx, __ZZN7PCBlend23lightWrapModeMenuStringEvE24pLightWrapModeMenuString(%rip) ## PCBlend::lightWrapModeMenuString()::pLightWrapModeMenuString
00000000000179bb	movq	%rbx, %rax
00000000000179be	popq	%rbx
00000000000179bf	popq	%r14
00000000000179c1	popq	%rbp
00000000000179c2	retq
00000000000179c3	movq	%rax, %r14
00000000000179c6	movq	%rbx, %rdi
00000000000179c9	callq	0xde6c0                         ## symbol stub for: __ZdlPv
00000000000179ce	movq	%r14, %rdi
00000000000179d1	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
