__ZN30HGCColorGamma_v216_yxzx_expand6GetROIEP10HGRendereri6HGRect:
00000000000fd180	testl	%edx, %edx
00000000000fd182	je	0xfd198
00000000000fd184	pushq	%rbp
00000000000fd185	movq	%rsp, %rbp
00000000000fd188	leaq	_HGRectNull(%rip), %rcx
00000000000fd18f	movq	(%rcx), %rax
00000000000fd192	movq	0x8(%rcx), %rdx
00000000000fd196	popq	%rbp
00000000000fd197	retq
00000000000fd198	movq	%rcx, %rax
00000000000fd19b	movl	%r8d, %edx
00000000000fd19e	andl	$0x1, %edx
00000000000fd1a1	addl	%r8d, %edx
00000000000fd1a4	movabsq	$-0x100000000, %rcx             ## imm = 0xFFFFFFFF00000000
00000000000fd1ae	andq	%r8, %rcx
00000000000fd1b1	andq	$-0x2, %rax
00000000000fd1b5	orq	%rcx, %rdx
00000000000fd1b8	retq
00000000000fd1b9	nopl	(%rax)
