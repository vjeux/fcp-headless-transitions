__ZN15HGProfilerGuardIL19HGProfilerGuardMode0EED1Ev:
00000000001c3eb0	pushq	%rbp
00000000001c3eb1	movq	%rsp, %rbp
00000000001c3eb4	pushq	%rbx
00000000001c3eb5	pushq	%rax
00000000001c3eb6	movq	(%rdi), %rbx
00000000001c3eb9	testq	%rbx, %rbx
00000000001c3ebc	je	0x1c3eca
00000000001c3ebe	callq	0x3c540e                        ## symbol stub for: _mach_absolute_time
00000000001c3ec3	subq	(%rbx), %rax
00000000001c3ec6	addq	%rax, 0x8(%rbx)
00000000001c3eca	addq	$0x8, %rsp
00000000001c3ece	popq	%rbx
00000000001c3ecf	popq	%rbp
00000000001c3ed0	retq
00000000001c3ed1	movq	%rax, %rdi
00000000001c3ed4	callq	___clang_call_terminate
00000000001c3ed9	nopl	(%rax)
