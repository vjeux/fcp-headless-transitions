__ZN21FFAudioPerfRenderHook9PreRenderEjRK14AudioTimeStampjjRK15AudioBufferList:
0000000000d02b10	pushq	%rbp
0000000000d02b11	movq	%rsp, %rbp
0000000000d02b14	pushq	%rbx
0000000000d02b15	pushq	%rax
0000000000d02b16	movq	%rdi, %rbx
0000000000d02b19	callq	0x1497848                       ## symbol stub for: _mach_absolute_time
0000000000d02b1e	movq	%rax, 0x38(%rbx)
0000000000d02b22	addq	$0x8, %rsp
0000000000d02b26	popq	%rbx
0000000000d02b27	popq	%rbp
0000000000d02b28	retq
0000000000d02b29	nopl	(%rax)
