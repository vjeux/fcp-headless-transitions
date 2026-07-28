__ZN29DisconnectAudioDestWorkerTaskD0Ev:
0000000000d16d30	leaq	0xbfac11(%rip), %rax
0000000000d16d37	movq	%rax, (%rdi)
0000000000d16d3a	movq	0x8(%rdi), %rax
0000000000d16d3e	movq	$0x0, 0x8(%rdi)
0000000000d16d46	testq	%rax, %rax
0000000000d16d49	je	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d16d4f	pushq	%rbp
0000000000d16d50	movq	%rsp, %rbp
0000000000d16d53	pushq	%rbx
0000000000d16d54	pushq	%rax
0000000000d16d55	movq	(%rax), %rcx
0000000000d16d58	movq	%rdi, %rbx
0000000000d16d5b	movq	%rax, %rdi
0000000000d16d5e	callq	*0x8(%rcx)
0000000000d16d61	movq	%rbx, %rdi
0000000000d16d64	addq	$0x8, %rsp
0000000000d16d68	popq	%rbx
0000000000d16d69	popq	%rbp
0000000000d16d6a	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d16d6f	nop
