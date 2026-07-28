__ZN24HgcBT2100_PQ_InverseOETF6GetROIEP10HGRendereri6HGRect:
00000000003ae2e0	movq	%rcx, %rax
00000000003ae2e3	testl	%edx, %edx
00000000003ae2e5	je	0x3ae2fa
00000000003ae2e7	pushq	%rbp
00000000003ae2e8	movq	%rsp, %rbp
00000000003ae2eb	leaq	_HGRectNull(%rip), %rcx
00000000003ae2f2	movq	(%rcx), %rax
00000000003ae2f5	movq	0x8(%rcx), %r8
00000000003ae2f9	popq	%rbp
00000000003ae2fa	movq	%r8, %rdx
00000000003ae2fd	retq
00000000003ae2fe	nop
