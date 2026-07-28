__ZNK23OZChannelObjectRootBase13getTimeExtentEv:
00000000002137d0	pushq	%rbp
00000000002137d1	movq	%rsp, %rbp
00000000002137d4	movq	%rdi, %rax
00000000002137d7	movq	0xa8(%rsi), %rcx
00000000002137de	movq	%rcx, 0x10(%rdi)
00000000002137e2	movups	0x98(%rsi), %xmm0
00000000002137e9	movups	%xmm0, (%rdi)
00000000002137ec	movups	0xb0(%rsi), %xmm0
00000000002137f3	movups	%xmm0, 0x18(%rdi)
00000000002137f7	movq	0xc0(%rsi), %rcx
00000000002137fe	movq	%rcx, 0x28(%rdi)
0000000000213802	popq	%rbp
0000000000213803	retq
0000000000213804	nopw	%cs:(%rax,%rax)
