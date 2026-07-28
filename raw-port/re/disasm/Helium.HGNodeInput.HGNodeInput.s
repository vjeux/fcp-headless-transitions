__ZN11HGNodeInputC1EP6HGNodei:
000000000011ba50	pushq	%rbp
000000000011ba51	movq	%rsp, %rbp
000000000011ba54	movq	%rsi, (%rdi)
000000000011ba57	movl	%edx, 0x8(%rdi)
000000000011ba5a	xorps	%xmm0, %xmm0
000000000011ba5d	movups	%xmm0, 0xc(%rdi)
000000000011ba61	movl	$0x0, 0x1c(%rdi)
000000000011ba68	leaq	_HGRectNull(%rip), %rax
000000000011ba6f	movups	(%rax), %xmm0
000000000011ba72	movups	%xmm0, 0x20(%rdi)
000000000011ba76	movq	$0x0, 0x30(%rdi)
000000000011ba7e	popq	%rbp
000000000011ba7f	retq
