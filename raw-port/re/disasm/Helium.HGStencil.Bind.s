__ZN9HGStencil4BindEP9HGHandler:
00000000002d21e0	pushq	%rbp
00000000002d21e1	movq	%rsp, %rbp
00000000002d21e4	movq	0x198(%rdi), %rax
00000000002d21eb	movq	(%rax), %rdx
00000000002d21ee	movq	(%rsi), %rax
00000000002d21f1	movq	%rsi, %rdi
00000000002d21f4	xorl	%esi, %esi
00000000002d21f6	movl	$0x1, %ecx
00000000002d21fb	callq	*0x90(%rax)
00000000002d2201	xorl	%eax, %eax
00000000002d2203	popq	%rbp
00000000002d2204	retq
00000000002d2205	nopw	%cs:(%rax,%rax)
