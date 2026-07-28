__ZN11HGColorBias9GetOutputEP10HGRenderer:
00000000001a0d40	pushq	%rbp
00000000001a0d41	movq	%rsp, %rbp
00000000001a0d44	pushq	%r14
00000000001a0d46	pushq	%rbx
00000000001a0d47	movq	%rdi, %rbx
00000000001a0d4a	movq	0x198(%rdi), %r14
00000000001a0d51	movq	%rsi, %rdi
00000000001a0d54	movq	%rbx, %rsi
00000000001a0d57	xorl	%edx, %edx
00000000001a0d59	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001a0d5e	movq	(%r14), %rcx
00000000001a0d61	movq	%r14, %rdi
00000000001a0d64	xorl	%esi, %esi
00000000001a0d66	movq	%rax, %rdx
00000000001a0d69	callq	*0x78(%rcx)
00000000001a0d6c	movq	0x198(%rbx), %rax
00000000001a0d73	popq	%rbx
00000000001a0d74	popq	%r14
00000000001a0d76	popq	%rbp
00000000001a0d77	retq
00000000001a0d78	nopl	(%rax,%rax)
