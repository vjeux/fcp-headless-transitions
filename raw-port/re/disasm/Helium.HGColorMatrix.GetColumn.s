__ZNK13HGColorMatrix9GetColumnEi:
00000000001b8c80	pushq	%rbp
00000000001b8c81	movq	%rsp, %rbp
00000000001b8c84	movslq	%esi, %rax
00000000001b8c87	shlq	$0x4, %rax
00000000001b8c8b	movaps	0x1b0(%rdi,%rax), %xmm0
00000000001b8c93	popq	%rbp
00000000001b8c94	retq
00000000001b8c95	nopw	%cs:(%rax,%rax)
