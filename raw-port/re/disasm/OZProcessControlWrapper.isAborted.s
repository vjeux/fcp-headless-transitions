__ZNK23OZProcessControlWrapper9isAbortedEv:
00000000004db090	pushq	%rbp
00000000004db091	movq	%rsp, %rbp
00000000004db094	movq	0x38(%rdi), %rdi
00000000004db098	testq	%rdi, %rdi
00000000004db09b	je	0x4db0a4
00000000004db09d	movq	(%rdi), %rax
00000000004db0a0	popq	%rbp
00000000004db0a1	jmpq	*0x10(%rax)
00000000004db0a4	xorl	%eax, %eax
00000000004db0a6	popq	%rbp
00000000004db0a7	retq
00000000004db0a8	nopl	(%rax,%rax)
