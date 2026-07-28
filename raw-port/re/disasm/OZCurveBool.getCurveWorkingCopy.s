__ZN11OZCurveBool19getCurveWorkingCopyEv:
00000000000e0e20	pushq	%rbp
00000000000e0e21	movq	%rsp, %rbp
00000000000e0e24	pushq	%r14
00000000000e0e26	pushq	%rbx
00000000000e0e27	movq	%rdi, %r14
00000000000e0e2a	movl	$0xb0, %edi
00000000000e0e2f	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000000e0e34	movq	%rax, %rbx
00000000000e0e37	movq	%rax, %rdi
00000000000e0e3a	movq	%r14, %rsi
00000000000e0e3d	movl	$0x1, %edx
00000000000e0e42	callq	0x6dec10                        ## symbol stub for: __ZN7OZCurveC2ERKS_b
00000000000e0e47	leaq	__ZTV11OZCurveBool(%rip), %rax  ## vtable for OZCurveBool
00000000000e0e4e	addq	$0x10, %rax
00000000000e0e52	movq	%rax, (%rbx)
00000000000e0e55	movq	%rbx, %rax
00000000000e0e58	popq	%rbx
00000000000e0e59	popq	%r14
00000000000e0e5b	popq	%rbp
00000000000e0e5c	retq
00000000000e0e5d	movq	%rax, %r14
00000000000e0e60	movq	%rbx, %rdi
00000000000e0e63	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000e0e68	movq	%r14, %rdi
00000000000e0e6b	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
