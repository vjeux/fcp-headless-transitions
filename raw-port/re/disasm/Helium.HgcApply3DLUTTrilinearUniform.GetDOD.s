__ZN29HgcApply3DLUTTrilinearUniform6GetDODEP10HGRendereri6HGRect:
0000000000073ce0	movq	%rcx, %rax
0000000000073ce3	testl	%edx, %edx
0000000000073ce5	je	0x73cfa
0000000000073ce7	pushq	%rbp
0000000000073ce8	movq	%rsp, %rbp
0000000000073ceb	leaq	_HGRectNull(%rip), %rcx
0000000000073cf2	movq	(%rcx), %rax
0000000000073cf5	movq	0x8(%rcx), %r8
0000000000073cf9	popq	%rbp
0000000000073cfa	movq	%r8, %rdx
0000000000073cfd	retq
0000000000073cfe	nop
