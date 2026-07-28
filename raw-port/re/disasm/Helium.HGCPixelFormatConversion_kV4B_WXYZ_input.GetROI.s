__ZN40HGCPixelFormatConversion_kV4B_WXYZ_input6GetROIEP10HGRendereri6HGRect:
00000000000f4d70	movq	%rcx, %rax
00000000000f4d73	testl	%edx, %edx
00000000000f4d75	je	0xf4d8a
00000000000f4d77	pushq	%rbp
00000000000f4d78	movq	%rsp, %rbp
00000000000f4d7b	leaq	_HGRectNull(%rip), %rcx
00000000000f4d82	movq	(%rcx), %rax
00000000000f4d85	movq	0x8(%rcx), %r8
00000000000f4d89	popq	%rbp
00000000000f4d8a	movq	%r8, %rdx
00000000000f4d8d	retq
00000000000f4d8e	nop
