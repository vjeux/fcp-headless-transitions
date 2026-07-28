__ZNK7OZScene12getPlayRangeEv:
000000000004fb10	pushq	%rbp
000000000004fb11	movq	%rsp, %rbp
000000000004fb14	leaq	0x4e0(%rdi), %rax
000000000004fb1b	cmpl	$-0x1, 0x20(%rdi)
000000000004fb1f	leaq	0x4b0(%rdi), %rcx
000000000004fb26	cmoveq	%rcx, %rax
000000000004fb2a	popq	%rbp
000000000004fb2b	retq
000000000004fb2c	nopl	(%rax)
