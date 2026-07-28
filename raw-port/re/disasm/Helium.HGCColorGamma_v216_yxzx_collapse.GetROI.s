__ZN32HGCColorGamma_v216_yxzx_collapse6GetROIEP10HGRendereri6HGRect:
00000000000fda70	testl	%edx, %edx
00000000000fda72	je	0xfda88
00000000000fda74	pushq	%rbp
00000000000fda75	movq	%rsp, %rbp
00000000000fda78	leaq	_HGRectNull(%rip), %rcx
00000000000fda7f	movq	(%rcx), %rax
00000000000fda82	movq	0x8(%rcx), %rdx
00000000000fda86	popq	%rbp
00000000000fda87	retq
00000000000fda88	movq	%rcx, %rax
00000000000fda8b	movl	%r8d, %edx
00000000000fda8e	andl	$0x1, %edx
00000000000fda91	addl	%r8d, %edx
00000000000fda94	movabsq	$-0x100000000, %rcx             ## imm = 0xFFFFFFFF00000000
00000000000fda9e	andq	%r8, %rcx
00000000000fdaa1	andq	$-0x2, %rax
00000000000fdaa5	orq	%rcx, %rdx
00000000000fdaa8	retq
00000000000fdaa9	nopl	(%rax)
