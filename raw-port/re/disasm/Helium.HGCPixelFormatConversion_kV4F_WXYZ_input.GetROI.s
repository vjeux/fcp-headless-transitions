__ZN40HGCPixelFormatConversion_kV4F_WXYZ_input6GetROIEP10HGRendereri6HGRect:
00000000000f4e90	movq	%rcx, %rax
00000000000f4e93	testl	%edx, %edx
00000000000f4e95	je	0xf4eaa
00000000000f4e97	pushq	%rbp
00000000000f4e98	movq	%rsp, %rbp
00000000000f4e9b	leaq	_HGRectNull(%rip), %rcx
00000000000f4ea2	movq	(%rcx), %rax
00000000000f4ea5	movq	0x8(%rcx), %r8
00000000000f4ea9	popq	%rbp
00000000000f4eaa	movq	%r8, %rdx
00000000000f4ead	retq
00000000000f4eae	nop
