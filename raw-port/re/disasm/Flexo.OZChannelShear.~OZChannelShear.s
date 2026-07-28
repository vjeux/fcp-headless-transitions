__ZN14OZChannelShearD1Ev:
00000000006575f0	pushq	%rbp
00000000006575f1	movq	%rsp, %rbp
00000000006575f4	pushq	%rbx
00000000006575f5	pushq	%rax
00000000006575f6	movq	%rdi, %rbx
00000000006575f9	movq	0x12925f8(%rip), %rax           ## literal pool symbol address: __ZTV14OZChannelShear
0000000000657600	leaq	0x10(%rax), %rcx
0000000000657604	movq	%rcx, (%rdi)
0000000000657607	addq	$0x348, %rax                    ## imm = 0x348
000000000065760d	movq	%rax, 0x10(%rdi)
0000000000657611	addq	$0x120, %rdi                    ## imm = 0x120
0000000000657618	callq	0x1496f5a                       ## symbol stub for: __ZN9OZChannelD2Ev
000000000065761d	leaq	0x88(%rbx), %rdi
0000000000657624	callq	0x1496f5a                       ## symbol stub for: __ZN9OZChannelD2Ev
0000000000657629	movq	%rbx, %rdi
000000000065762c	addq	$0x8, %rsp
0000000000657630	popq	%rbx
0000000000657631	popq	%rbp
0000000000657632	jmp	0x14965e2                       ## symbol stub for: __ZN17OZCompoundChannelD2Ev
0000000000657637	nopw	(%rax,%rax)
