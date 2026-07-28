__ZN32HGCColorGamma_2vuy_xyxz_collapse6GetROIEP10HGRendereri6HGRect:
00000000000fd890	testl	%edx, %edx
00000000000fd892	je	0xfd8a8
00000000000fd894	pushq	%rbp
00000000000fd895	movq	%rsp, %rbp
00000000000fd898	leaq	_HGRectNull(%rip), %rcx
00000000000fd89f	movq	(%rcx), %rax
00000000000fd8a2	movq	0x8(%rcx), %rdx
00000000000fd8a6	popq	%rbp
00000000000fd8a7	retq
00000000000fd8a8	movq	%rcx, %rax
00000000000fd8ab	movl	%r8d, %edx
00000000000fd8ae	andl	$0x1, %edx
00000000000fd8b1	addl	%r8d, %edx
00000000000fd8b4	movabsq	$-0x100000000, %rcx             ## imm = 0xFFFFFFFF00000000
00000000000fd8be	andq	%r8, %rcx
00000000000fd8c1	andq	$-0x2, %rax
00000000000fd8c5	orq	%rcx, %rdx
00000000000fd8c8	retq
00000000000fd8c9	nopl	(%rax)
