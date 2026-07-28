__ZN18HGComicColorStroke6GetDODEP10HGRendereri6HGRect:
00000000001bc170	movq	%rcx, %rax
00000000001bc173	testl	%edx, %edx
00000000001bc175	je	0x1bc18a
00000000001bc177	pushq	%rbp
00000000001bc178	movq	%rsp, %rbp
00000000001bc17b	leaq	_HGRectNull(%rip), %rcx
00000000001bc182	movq	(%rcx), %rax
00000000001bc185	movq	0x8(%rcx), %r8
00000000001bc189	popq	%rbp
00000000001bc18a	movq	%r8, %rdx
00000000001bc18d	retq
00000000001bc18e	nop
