__ZN18HgcBT2100_HLG_OETF6GetDODEP10HGRendereri6HGRect:
00000000003b0e90	movq	%rcx, %rax
00000000003b0e93	testl	%edx, %edx
00000000003b0e95	je	0x3b0eaa
00000000003b0e97	pushq	%rbp
00000000003b0e98	movq	%rsp, %rbp
00000000003b0e9b	leaq	_HGRectNull(%rip), %rcx
00000000003b0ea2	movq	(%rcx), %rax
00000000003b0ea5	movq	0x8(%rcx), %r8
00000000003b0ea9	popq	%rbp
00000000003b0eaa	movq	%r8, %rdx
00000000003b0ead	retq
00000000003b0eae	nop
