__ZN21HGDenoisePDEIteration6GetDODEP10HGRendereri6HGRect:
00000000001c2b80	movq	%rcx, %rax
00000000001c2b83	cmpl	$0x2, %edx
00000000001c2b86	jb	0x1c2b9b
00000000001c2b88	pushq	%rbp
00000000001c2b89	movq	%rsp, %rbp
00000000001c2b8c	leaq	_HGRectNull(%rip), %rcx
00000000001c2b93	movq	(%rcx), %rax
00000000001c2b96	movq	0x8(%rcx), %r8
00000000001c2b9a	popq	%rbp
00000000001c2b9b	movq	%r8, %rdx
00000000001c2b9e	retq
00000000001c2b9f	nop
