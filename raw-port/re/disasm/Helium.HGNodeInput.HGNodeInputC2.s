__ZN11HGNodeInputC2EP6HGNodei:
000000000011ba20	pushq	%rbp
000000000011ba21	movq	%rsp, %rbp
000000000011ba24	movq	%rsi, (%rdi)
000000000011ba27	movl	%edx, 0x8(%rdi)
000000000011ba2a	xorps	%xmm0, %xmm0
000000000011ba2d	movups	%xmm0, 0xc(%rdi)
000000000011ba31	movl	$0x0, 0x1c(%rdi)
000000000011ba38	leaq	_HGRectNull(%rip), %rax
000000000011ba3f	movups	(%rax), %xmm0
000000000011ba42	movups	%xmm0, 0x20(%rdi)
000000000011ba46	movq	$0x0, 0x30(%rdi)
000000000011ba4e	popq	%rbp
000000000011ba4f	retq
