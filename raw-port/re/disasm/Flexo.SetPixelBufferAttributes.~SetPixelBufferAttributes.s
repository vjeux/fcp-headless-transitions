__ZN24SetPixelBufferAttributesD1Ev:
0000000000e03020	pushq	%rbp
0000000000e03021	movq	%rsp, %rbp
0000000000e03024	movq	(%rdi), %rdi
0000000000e03027	testq	%rdi, %rdi
0000000000e0302a	je	0xe03031
0000000000e0302c	callq	0x149484e                       ## symbol stub for: _CFRelease
0000000000e03031	popq	%rbp
0000000000e03032	retq
0000000000e03033	movq	%rax, %rdi
0000000000e03036	callq	___clang_call_terminate
0000000000e0303b	nopl	(%rax,%rax)
