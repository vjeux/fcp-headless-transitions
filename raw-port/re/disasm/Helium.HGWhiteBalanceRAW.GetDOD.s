__ZN17HGWhiteBalanceRAW6GetDODEP10HGRendereri6HGRect:
00000000001d2bc0	movq	%rcx, %rax
00000000001d2bc3	testl	%edx, %edx
00000000001d2bc5	je	0x1d2bda
00000000001d2bc7	pushq	%rbp
00000000001d2bc8	movq	%rsp, %rbp
00000000001d2bcb	leaq	_HGRectNull(%rip), %rcx
00000000001d2bd2	movq	(%rcx), %rax
00000000001d2bd5	movq	0x8(%rcx), %r8
00000000001d2bd9	popq	%rbp
00000000001d2bda	movq	%r8, %rdx
00000000001d2bdd	retq
00000000001d2bde	nop
