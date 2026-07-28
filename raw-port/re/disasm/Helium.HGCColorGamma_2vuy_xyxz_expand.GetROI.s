__ZN30HGCColorGamma_2vuy_xyxz_expand6GetROIEP10HGRendereri6HGRect:
00000000000fcfa0	testl	%edx, %edx
00000000000fcfa2	je	0xfcfb8
00000000000fcfa4	pushq	%rbp
00000000000fcfa5	movq	%rsp, %rbp
00000000000fcfa8	leaq	_HGRectNull(%rip), %rcx
00000000000fcfaf	movq	(%rcx), %rax
00000000000fcfb2	movq	0x8(%rcx), %rdx
00000000000fcfb6	popq	%rbp
00000000000fcfb7	retq
00000000000fcfb8	movq	%rcx, %rax
00000000000fcfbb	movl	%r8d, %edx
00000000000fcfbe	andl	$0x1, %edx
00000000000fcfc1	addl	%r8d, %edx
00000000000fcfc4	movabsq	$-0x100000000, %rcx             ## imm = 0xFFFFFFFF00000000
00000000000fcfce	andq	%r8, %rcx
00000000000fcfd1	andq	$-0x2, %rax
00000000000fcfd5	orq	%rcx, %rdx
00000000000fcfd8	retq
00000000000fcfd9	nopl	(%rax)
