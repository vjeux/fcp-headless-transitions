__ZN21FFAudioPerfRenderHook10PostRenderEjRK14AudioTimeStampjjRK15AudioBufferList:
0000000000d02b30	pushq	%rbp
0000000000d02b31	movq	%rsp, %rbp
0000000000d02b34	pushq	%rbx
0000000000d02b35	pushq	%rax
0000000000d02b36	movq	%rdi, %rbx
0000000000d02b39	callq	0x1497848                       ## symbol stub for: _mach_absolute_time
0000000000d02b3e	movq	%rax, %rcx
0000000000d02b41	subq	0x38(%rbx), %rcx
0000000000d02b45	movl	$0x1, %eax
0000000000d02b4a	lock
0000000000d02b4b	xaddq	%rax, 0x28(%rbx)
0000000000d02b50	movq	0x20(%rbx), %rsi
0000000000d02b54	movq	%rax, %rdx
0000000000d02b57	orq	%rsi, %rdx
0000000000d02b5a	shrq	$0x20, %rdx
0000000000d02b5e	je	0xd02b67
0000000000d02b60	xorl	%edx, %edx
0000000000d02b62	divq	%rsi
0000000000d02b65	jmp	0xd02b6b
0000000000d02b67	xorl	%edx, %edx
0000000000d02b69	divl	%esi
0000000000d02b6b	movq	0x10(%rbx), %rax
0000000000d02b6f	movq	%rcx, (%rax,%rdx,8)
0000000000d02b73	addq	$0x8, %rsp
0000000000d02b77	popq	%rbx
0000000000d02b78	popq	%rbp
0000000000d02b79	retq
0000000000d02b7a	nopw	(%rax,%rax)
