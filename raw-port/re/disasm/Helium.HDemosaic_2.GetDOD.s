__ZN11HDemosaic_26GetDODEP10HGRendereri6HGRect:
00000000000dd810	movq	%rcx, %rax
00000000000dd813	testl	%edx, %edx
00000000000dd815	je	0xdd82a
00000000000dd817	pushq	%rbp
00000000000dd818	movq	%rsp, %rbp
00000000000dd81b	leaq	_HGRectNull(%rip), %rcx
00000000000dd822	movq	(%rcx), %rax
00000000000dd825	movq	0x8(%rcx), %r8
00000000000dd829	popq	%rbp
00000000000dd82a	movq	%r8, %rdx
00000000000dd82d	retq
00000000000dd82e	nop
