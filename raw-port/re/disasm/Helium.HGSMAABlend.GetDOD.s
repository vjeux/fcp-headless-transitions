__ZN11HGSMAABlend6GetDODEP10HGRendereri6HGRect:
0000000000211cf0	movq	%rcx, %rax
0000000000211cf3	cmpl	$0x2, %edx
0000000000211cf6	jb	0x211d0b
0000000000211cf8	pushq	%rbp
0000000000211cf9	movq	%rsp, %rbp
0000000000211cfc	leaq	_HGRectNull(%rip), %rcx
0000000000211d03	movq	(%rcx), %rax
0000000000211d06	movq	0x8(%rcx), %r8
0000000000211d0a	popq	%rbp
0000000000211d0b	movq	%r8, %rdx
0000000000211d0e	retq
0000000000211d0f	nop
