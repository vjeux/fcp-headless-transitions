__ZN20OZImageNodeRender36011getBoundaryER7LiAgentP6PCRectIdE:
000000000041dc80	pushq	%rbp
000000000041dc81	movq	%rsp, %rbp
000000000041dc84	movq	0x10(%rdi), %rax
000000000041dc88	leaq	0x18(%rdi), %rcx
000000000041dc8c	movq	0x1978(%rax), %r8
000000000041dc93	addq	$0x1978, %rax                   ## imm = 0x1978
000000000041dc99	movq	%rax, %rdi
000000000041dc9c	movq	%rdx, %rsi
000000000041dc9f	movq	%rcx, %rdx
000000000041dca2	callq	*0x20(%r8)
000000000041dca6	movb	$0x1, %al
000000000041dca8	popq	%rbp
000000000041dca9	retq
000000000041dcaa	nopw	(%rax,%rax)
