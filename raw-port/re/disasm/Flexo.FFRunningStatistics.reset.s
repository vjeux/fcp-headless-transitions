__ZN19FFRunningStatistics5resetEv:
00000000012ed270	pushq	%rbp
00000000012ed271	movq	%rsp, %rbp
00000000012ed274	movq	$0x0, (%rdi)
00000000012ed27b	movabsq	$0x7fefffffffffffff, %rax       ## imm = 0x7FEFFFFFFFFFFFFF
00000000012ed285	movq	%rax, 0x8(%rdi)
00000000012ed289	xorps	%xmm0, %xmm0
00000000012ed28c	movups	%xmm0, 0x10(%rdi)
00000000012ed290	movups	%xmm0, 0x20(%rdi)
00000000012ed294	popq	%rbp
00000000012ed295	retq
00000000012ed296	nopw	%cs:(%rax,%rax)
