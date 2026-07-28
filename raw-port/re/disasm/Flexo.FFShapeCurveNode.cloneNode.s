__ZN16FFShapeCurveNode9cloneNodeEv:
000000000065a950	pushq	%rbp
000000000065a951	movq	%rsp, %rbp
000000000065a954	pushq	%r14
000000000065a956	pushq	%rbx
000000000065a957	movq	%rdi, %r14
000000000065a95a	movl	$0x18, %edi
000000000065a95f	callq	0x1497452                       ## symbol stub for: __Znwm
000000000065a964	movq	%rax, %rbx
000000000065a967	movq	%rax, %rdi
000000000065a96a	movq	%r14, %rsi
000000000065a96d	callq	0x1495fb8                       ## symbol stub for: __ZN11OZCurveNodeC2ERKS_
000000000065a972	leaq	0x12a678f(%rip), %rax
000000000065a979	movq	%rax, (%rbx)
000000000065a97c	movups	0x8(%r14), %xmm0
000000000065a981	movups	%xmm0, 0x8(%rbx)
000000000065a985	movq	%rbx, %rax
000000000065a988	popq	%rbx
000000000065a989	popq	%r14
000000000065a98b	popq	%rbp
000000000065a98c	retq
000000000065a98d	movq	%rax, %r14
000000000065a990	movq	%rbx, %rdi
000000000065a993	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000065a998	movq	%r14, %rdi
000000000065a99b	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
