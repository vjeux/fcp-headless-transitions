__ZN32HGCColorGamma_2vuy_yxzx_collapse6GetROIEP10HGRendereri6HGRect:
00000000000fd7d0	testl	%edx, %edx
00000000000fd7d2	je	0xfd7e8
00000000000fd7d4	pushq	%rbp
00000000000fd7d5	movq	%rsp, %rbp
00000000000fd7d8	leaq	_HGRectNull(%rip), %rcx
00000000000fd7df	movq	(%rcx), %rax
00000000000fd7e2	movq	0x8(%rcx), %rdx
00000000000fd7e6	popq	%rbp
00000000000fd7e7	retq
00000000000fd7e8	movq	%rcx, %rax
00000000000fd7eb	movl	%r8d, %edx
00000000000fd7ee	andl	$0x1, %edx
00000000000fd7f1	addl	%r8d, %edx
00000000000fd7f4	movabsq	$-0x100000000, %rcx             ## imm = 0xFFFFFFFF00000000
00000000000fd7fe	andq	%r8, %rcx
00000000000fd801	andq	$-0x2, %rax
00000000000fd805	orq	%rcx, %rdx
00000000000fd808	retq
00000000000fd809	nopl	(%rax)
