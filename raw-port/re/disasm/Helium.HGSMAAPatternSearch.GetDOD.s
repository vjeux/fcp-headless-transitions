__ZN19HGSMAAPatternSearch6GetDODEP10HGRendereri6HGRect:
0000000000211bb0	movq	%rcx, %rax
0000000000211bb3	testl	%edx, %edx
0000000000211bb5	je	0x211bca
0000000000211bb7	pushq	%rbp
0000000000211bb8	movq	%rsp, %rbp
0000000000211bbb	leaq	_HGRectNull(%rip), %rcx
0000000000211bc2	movq	(%rcx), %rax
0000000000211bc5	movq	0x8(%rcx), %r8
0000000000211bc9	popq	%rbp
0000000000211bca	movq	%r8, %rdx
0000000000211bcd	retq
0000000000211bce	nop
