__ZN29DisconnectAudioDestWorkerTaskD1Ev:
0000000000d16d00	pushq	%rbp
0000000000d16d01	movq	%rsp, %rbp
0000000000d16d04	movq	%rdi, %rax
0000000000d16d07	leaq	0xbfac3a(%rip), %rcx
0000000000d16d0e	movq	%rcx, (%rdi)
0000000000d16d11	movq	0x8(%rdi), %rdi
0000000000d16d15	movq	$0x0, 0x8(%rax)
0000000000d16d1d	testq	%rdi, %rdi
0000000000d16d20	je	0xd16d29
0000000000d16d22	movq	(%rdi), %rax
0000000000d16d25	popq	%rbp
0000000000d16d26	jmpq	*0x8(%rax)
0000000000d16d29	popq	%rbp
0000000000d16d2a	retq
0000000000d16d2b	nopl	(%rax,%rax)
