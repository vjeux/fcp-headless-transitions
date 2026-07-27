__ZN14FFPMRAutoTimerD1Ev:
00000000012b5bd0	pushq	%rbp
00000000012b5bd1	movq	%rsp, %rbp
00000000012b5bd4	movsd	0x30(%rdi), %xmm0
00000000012b5bd9	movq	0x10(%rdi), %rsi
00000000012b5bdd	movq	0x18(%rdi), %rdx
00000000012b5be1	movq	0x20(%rdi), %rcx
00000000012b5be5	movq	0x28(%rdi), %r8
00000000012b5be9	callq	_FFPMRSimpleTimerStopAndReportElapsedTime
00000000012b5bee	popq	%rbp
00000000012b5bef	retq
00000000012b5bf0	movq	%rax, %rdi
00000000012b5bf3	callq	___clang_call_terminate
00000000012b5bf8	nopl	(%rax,%rax)
