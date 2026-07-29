__ZN12HGColorGamma6GetDODEP10HGRendereri6HGRect:
00000000000f5fb0	movq	%rcx, %rax
00000000000f5fb3	testl	%edx, %edx
00000000000f5fb5	je	0xf5fca
00000000000f5fb7	pushq	%rbp
00000000000f5fb8	movq	%rsp, %rbp
00000000000f5fbb	leaq	_HGRectNull(%rip), %rcx
00000000000f5fc2	movq	(%rcx), %rax
00000000000f5fc5	movq	0x8(%rcx), %r8
00000000000f5fc9	popq	%rbp
00000000000f5fca	movq	%r8, %rdx
00000000000f5fcd	retq
00000000000f5fce	nop
