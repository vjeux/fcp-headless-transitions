__ZN11HDemosaic_16GetDODEP10HGRendereri6HGRect:
00000000000dd7a0	movq	%rcx, %rax
00000000000dd7a3	testl	%edx, %edx
00000000000dd7a5	je	0xdd7ba
00000000000dd7a7	pushq	%rbp
00000000000dd7a8	movq	%rsp, %rbp
00000000000dd7ab	leaq	_HGRectNull(%rip), %rcx
00000000000dd7b2	movq	(%rcx), %rax
00000000000dd7b5	movq	0x8(%rcx), %r8
00000000000dd7b9	popq	%rbp
00000000000dd7ba	movq	%r8, %rdx
00000000000dd7bd	retq
00000000000dd7be	nop
