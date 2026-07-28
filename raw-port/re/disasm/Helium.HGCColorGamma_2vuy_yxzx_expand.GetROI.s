__ZN30HGCColorGamma_2vuy_yxzx_expand6GetROIEP10HGRendereri6HGRect:
00000000000fcee0	testl	%edx, %edx
00000000000fcee2	je	0xfcef8
00000000000fcee4	pushq	%rbp
00000000000fcee5	movq	%rsp, %rbp
00000000000fcee8	leaq	_HGRectNull(%rip), %rcx
00000000000fceef	movq	(%rcx), %rax
00000000000fcef2	movq	0x8(%rcx), %rdx
00000000000fcef6	popq	%rbp
00000000000fcef7	retq
00000000000fcef8	movq	%rcx, %rax
00000000000fcefb	movl	%r8d, %edx
00000000000fcefe	andl	$0x1, %edx
00000000000fcf01	addl	%r8d, %edx
00000000000fcf04	movabsq	$-0x100000000, %rcx             ## imm = 0xFFFFFFFF00000000
00000000000fcf0e	andq	%r8, %rcx
00000000000fcf11	andq	$-0x2, %rax
00000000000fcf15	orq	%rcx, %rdx
00000000000fcf18	retq
00000000000fcf19	nopl	(%rax)
