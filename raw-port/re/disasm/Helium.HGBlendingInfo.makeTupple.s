__ZNK14HGBlendingInfo10makeTuppleEv:
00000000000253c0	pushq	%rbp
00000000000253c1	movq	%rsp, %rbp
00000000000253c4	movq	%rdi, %rax
00000000000253c7	leaq	0x8(%rsi), %rcx
00000000000253cb	leaq	0xc(%rsi), %rdx
00000000000253cf	leaq	0x10(%rsi), %rdi
00000000000253d3	leaq	0x14(%rsi), %r8
00000000000253d7	leaq	0x18(%rsi), %r9
00000000000253db	movq	%rsi, (%rax)
00000000000253de	addq	$0x1c, %rsi
00000000000253e2	movq	%rcx, 0x8(%rax)
00000000000253e6	movq	%rdx, 0x10(%rax)
00000000000253ea	movq	%rdi, 0x18(%rax)
00000000000253ee	movq	%r8, 0x20(%rax)
00000000000253f2	movq	%r9, 0x28(%rax)
00000000000253f6	movq	%rsi, 0x30(%rax)
00000000000253fa	popq	%rbp
00000000000253fb	retq
00000000000253fc	nopl	(%rax)
