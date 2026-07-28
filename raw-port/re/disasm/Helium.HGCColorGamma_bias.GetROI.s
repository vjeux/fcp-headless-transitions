__ZN18HGCColorGamma_bias6GetROIEP10HGRendereri6HGRect:
00000000000fd550	movq	%rcx, %rax
00000000000fd553	testl	%edx, %edx
00000000000fd555	je	0xfd56a
00000000000fd557	pushq	%rbp
00000000000fd558	movq	%rsp, %rbp
00000000000fd55b	leaq	_HGRectNull(%rip), %rcx
00000000000fd562	movq	(%rcx), %rax
00000000000fd565	movq	0x8(%rcx), %r8
00000000000fd569	popq	%rbp
00000000000fd56a	movq	%r8, %rdx
00000000000fd56d	retq
00000000000fd56e	nop
