__ZN21FFAudioBufferListBase14teardownBufferEv:
0000000001255ac0	pushq	%rbp
0000000001255ac1	movq	%rsp, %rbp
0000000001255ac4	pushq	%rbx
0000000001255ac5	pushq	%rax
0000000001255ac6	movq	%rdi, %rbx
0000000001255ac9	movq	$0x0, 0x28(%rdi)
0000000001255ad1	movq	(%rdi), %rax
0000000001255ad4	callq	*0x28(%rax)
0000000001255ad7	movq	(%rbx), %rax
0000000001255ada	movq	%rbx, %rdi
0000000001255add	addq	$0x8, %rsp
0000000001255ae1	popq	%rbx
0000000001255ae2	popq	%rbp
0000000001255ae3	jmpq	*0x20(%rax)
0000000001255ae6	nopw	%cs:(%rax,%rax)
