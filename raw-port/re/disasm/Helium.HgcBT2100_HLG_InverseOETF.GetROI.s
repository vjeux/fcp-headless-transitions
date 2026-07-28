__ZN25HgcBT2100_HLG_InverseOETF6GetROIEP10HGRendereri6HGRect:
00000000003b1d00	movq	%rcx, %rax
00000000003b1d03	testl	%edx, %edx
00000000003b1d05	je	0x3b1d1a
00000000003b1d07	pushq	%rbp
00000000003b1d08	movq	%rsp, %rbp
00000000003b1d0b	leaq	_HGRectNull(%rip), %rcx
00000000003b1d12	movq	(%rcx), %rax
00000000003b1d15	movq	0x8(%rcx), %r8
00000000003b1d19	popq	%rbp
00000000003b1d1a	movq	%r8, %rdx
00000000003b1d1d	retq
00000000003b1d1e	nop
