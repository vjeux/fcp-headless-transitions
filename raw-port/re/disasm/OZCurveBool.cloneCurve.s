__ZN11OZCurveBool10cloneCurveEv:
00000000000e0e70	pushq	%rbp
00000000000e0e71	movq	%rsp, %rbp
00000000000e0e74	pushq	%r14
00000000000e0e76	pushq	%rbx
00000000000e0e77	movq	%rdi, %r14
00000000000e0e7a	movl	$0xb0, %edi
00000000000e0e7f	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000000e0e84	movq	%rax, %rbx
00000000000e0e87	movq	%rax, %rdi
00000000000e0e8a	movq	%r14, %rsi
00000000000e0e8d	xorl	%edx, %edx
00000000000e0e8f	callq	0x6dec10                        ## symbol stub for: __ZN7OZCurveC2ERKS_b
00000000000e0e94	leaq	__ZTV11OZCurveBool(%rip), %rax  ## vtable for OZCurveBool
00000000000e0e9b	addq	$0x10, %rax
00000000000e0e9f	movq	%rax, (%rbx)
00000000000e0ea2	movq	%rbx, %rax
00000000000e0ea5	popq	%rbx
00000000000e0ea6	popq	%r14
00000000000e0ea8	popq	%rbp
00000000000e0ea9	retq
00000000000e0eaa	movq	%rax, %r14
00000000000e0ead	movq	%rbx, %rdi
00000000000e0eb0	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000e0eb5	movq	%r14, %rdi
00000000000e0eb8	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000e0ebd	nopl	(%rax)
