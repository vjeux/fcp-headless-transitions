__ZN15HGProfilerGuardIL19HGProfilerGuardMode0EED2Ev:
00000000001c3e80	pushq	%rbp
00000000001c3e81	movq	%rsp, %rbp
00000000001c3e84	pushq	%rbx
00000000001c3e85	pushq	%rax
00000000001c3e86	movq	(%rdi), %rbx
00000000001c3e89	testq	%rbx, %rbx
00000000001c3e8c	je	0x1c3e9a
00000000001c3e8e	callq	0x3c540e                        ## symbol stub for: _mach_absolute_time
00000000001c3e93	subq	(%rbx), %rax
00000000001c3e96	addq	%rax, 0x8(%rbx)
00000000001c3e9a	addq	$0x8, %rsp
00000000001c3e9e	popq	%rbx
00000000001c3e9f	popq	%rbp
00000000001c3ea0	retq
00000000001c3ea1	movq	%rax, %rdi
00000000001c3ea4	callq	___clang_call_terminate
00000000001c3ea9	nopl	(%rax)
