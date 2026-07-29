__ZNK13HGColorMatrix6GetRowEi:
00000000001b8c40	pushq	%rbp
00000000001b8c41	movq	%rsp, %rbp
00000000001b8c44	movslq	%esi, %rax
00000000001b8c47	movss	0x1b0(%rdi,%rax,4), %xmm0
00000000001b8c50	insertps	$0x10, 0x1c0(%rdi,%rax,4), %xmm0 ## xmm0 = xmm0[0],mem[0],xmm0[2,3]
00000000001b8c5b	insertps	$0x20, 0x1d0(%rdi,%rax,4), %xmm0 ## xmm0 = xmm0[0,1],mem[0],xmm0[3]
00000000001b8c66	insertps	$0x30, 0x1e0(%rdi,%rax,4), %xmm0 ## xmm0 = xmm0[0,1,2],mem[0]
00000000001b8c71	popq	%rbp
00000000001b8c72	retq
00000000001b8c73	nopw	%cs:(%rax,%rax)
