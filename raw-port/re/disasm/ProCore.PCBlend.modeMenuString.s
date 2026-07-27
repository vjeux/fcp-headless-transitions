__ZN7PCBlend14modeMenuStringEb:
00000000000178e8	pushq	%rbp
00000000000178e9	movq	%rsp, %rbp
00000000000178ec	pushq	%r14
00000000000178ee	pushq	%rbx
00000000000178ef	testl	%edi, %edi
00000000000178f1	je	0x1792b
00000000000178f3	movq	__ZZN7PCBlend14modeMenuStringEbE22pModeMenuCombineString(%rip), %rbx ## PCBlend::modeMenuString(bool)::pModeMenuCombineString
00000000000178fa	testq	%rbx, %rbx
00000000000178fd	jne	0x17961
00000000000178ff	movl	$0x8, %edi
0000000000017904	callq	0xde6cc                         ## symbol stub for: __Znwm
0000000000017909	movq	%rax, %rbx
000000000001790c	leaq	0x119d0d(%rip), %rsi            ## literal pool for: "Blend Modes Combine"
0000000000017913	leaq	0x119d1a(%rip), %rdx            ## literal pool for: "com.apple.procore.framework"
000000000001791a	movq	%rax, %rdi
000000000001791d	callq	__ZN8PCStringC1EPKcS1_          ## PCString::PCString(char const*, char const*)
0000000000017922	movq	%rbx, __ZZN7PCBlend14modeMenuStringEbE22pModeMenuCombineString(%rip) ## PCBlend::modeMenuString(bool)::pModeMenuCombineString
0000000000017929	jmp	0x17961
000000000001792b	movq	__ZZN7PCBlend14modeMenuStringEbE15pModeMenuString(%rip), %rbx ## PCBlend::modeMenuString(bool)::pModeMenuString
0000000000017932	testq	%rbx, %rbx
0000000000017935	jne	0x17961
0000000000017937	movl	$0x8, %edi
000000000001793c	callq	0xde6cc                         ## symbol stub for: __Znwm
0000000000017941	movq	%rax, %rbx
0000000000017944	leaq	0x119d05(%rip), %rsi            ## literal pool for: "Blend Modes"
000000000001794b	leaq	0x119ce2(%rip), %rdx            ## literal pool for: "com.apple.procore.framework"
0000000000017952	movq	%rax, %rdi
0000000000017955	callq	__ZN8PCStringC1EPKcS1_          ## PCString::PCString(char const*, char const*)
000000000001795a	movq	%rbx, __ZZN7PCBlend14modeMenuStringEbE15pModeMenuString(%rip) ## PCBlend::modeMenuString(bool)::pModeMenuString
0000000000017961	movq	%rbx, %rax
0000000000017964	popq	%rbx
0000000000017965	popq	%r14
0000000000017967	popq	%rbp
0000000000017968	retq
0000000000017969	jmp	0x1796b
000000000001796b	movq	%rax, %r14
000000000001796e	movq	%rbx, %rdi
0000000000017971	callq	0xde6c0                         ## symbol stub for: __ZdlPv
0000000000017976	movq	%r14, %rdi
0000000000017979	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
