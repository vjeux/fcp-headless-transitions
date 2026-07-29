__ZN13HGLegacyBlend6GetDODEP10HGRendereri6HGRect:
0000000000241cb0	movq	%rcx, %rax
0000000000241cb3	cmpl	$0x2, %edx
0000000000241cb6	jb	0x241ccb
0000000000241cb8	pushq	%rbp
0000000000241cb9	movq	%rsp, %rbp
0000000000241cbc	leaq	_HGRectNull(%rip), %rcx
0000000000241cc3	movq	(%rcx), %rax
0000000000241cc6	movq	0x8(%rcx), %r8
0000000000241cca	popq	%rbp
0000000000241ccb	movq	%r8, %rdx
0000000000241cce	retq
0000000000241ccf	nop
