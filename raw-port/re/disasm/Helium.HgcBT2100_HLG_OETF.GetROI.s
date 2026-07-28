__ZN18HgcBT2100_HLG_OETF6GetROIEP10HGRendereri6HGRect:
00000000003b0eb0	movq	%rcx, %rax
00000000003b0eb3	testl	%edx, %edx
00000000003b0eb5	je	0x3b0eca
00000000003b0eb7	pushq	%rbp
00000000003b0eb8	movq	%rsp, %rbp
00000000003b0ebb	leaq	_HGRectNull(%rip), %rcx
00000000003b0ec2	movq	(%rcx), %rax
00000000003b0ec5	movq	0x8(%rcx), %r8
00000000003b0ec9	popq	%rbp
00000000003b0eca	movq	%r8, %rdx
00000000003b0ecd	retq
00000000003b0ece	nop
