__ZN10PCLMSolverC1Ev:
00000000000b6c78	pushq	%rbp
00000000000b6c79	movq	%rsp, %rbp
00000000000b6c7c	leaq	0x95afd(%rip), %rax
00000000000b6c83	movq	%rax, (%rdi)
00000000000b6c86	movabsq	$0x100000000, %rax              ## imm = 0x100000000
00000000000b6c90	movq	%rax, 0x18(%rdi)
00000000000b6c94	xorps	%xmm0, %xmm0
00000000000b6c97	movups	%xmm0, 0x20(%rdi)
00000000000b6c9b	movq	%rax, 0x30(%rdi)
00000000000b6c9f	movups	%xmm0, 0x38(%rdi)
00000000000b6ca3	movq	%rax, 0x48(%rdi)
00000000000b6ca7	movups	%xmm0, 0x50(%rdi)
00000000000b6cab	movq	%rax, 0x60(%rdi)
00000000000b6caf	movups	%xmm0, 0x68(%rdi)
00000000000b6cb3	xorl	%eax, %eax
00000000000b6cb5	movq	%rax, 0x78(%rdi)
00000000000b6cb9	movabsq	$0x100000001, %rcx              ## imm = 0x100000001
00000000000b6cc3	movq	%rcx, 0x80(%rdi)
00000000000b6cca	movq	%rax, 0x88(%rdi)
00000000000b6cd1	movups	%xmm0, 0x8(%rdi)
00000000000b6cd5	movabsq	$0x4b00000006, %rax             ## imm = 0x4B00000006
00000000000b6cdf	movq	%rax, 0x98(%rdi)
00000000000b6ce6	movsd	0x714c2(%rip), %xmm0
00000000000b6cee	movsd	%xmm0, 0xa0(%rdi)
00000000000b6cf6	movb	$0x0, 0xa8(%rdi)
00000000000b6cfd	popq	%rbp
00000000000b6cfe	retq
00000000000b6cff	nop
