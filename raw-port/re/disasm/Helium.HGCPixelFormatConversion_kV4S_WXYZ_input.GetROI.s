__ZN40HGCPixelFormatConversion_kV4S_WXYZ_input6GetROIEP10HGRendereri6HGRect:
00000000000f4e00	movq	%rcx, %rax
00000000000f4e03	testl	%edx, %edx
00000000000f4e05	je	0xf4e1a
00000000000f4e07	pushq	%rbp
00000000000f4e08	movq	%rsp, %rbp
00000000000f4e0b	leaq	_HGRectNull(%rip), %rcx
00000000000f4e12	movq	(%rcx), %rax
00000000000f4e15	movq	0x8(%rcx), %r8
00000000000f4e19	popq	%rbp
00000000000f4e1a	movq	%r8, %rdx
00000000000f4e1d	retq
00000000000f4e1e	nop
