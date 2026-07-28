__ZN22HgcApply3DLUTTrilinear6GetDODEP10HGRendereri6HGRect:
0000000000073e40	movq	%rcx, %rax
0000000000073e43	testl	%edx, %edx
0000000000073e45	je	0x73e5a
0000000000073e47	pushq	%rbp
0000000000073e48	movq	%rsp, %rbp
0000000000073e4b	leaq	_HGRectNull(%rip), %rcx
0000000000073e52	movq	(%rcx), %rax
0000000000073e55	movq	0x8(%rcx), %r8
0000000000073e59	popq	%rbp
0000000000073e5a	movq	%r8, %rdx
0000000000073e5d	retq
0000000000073e5e	nop
