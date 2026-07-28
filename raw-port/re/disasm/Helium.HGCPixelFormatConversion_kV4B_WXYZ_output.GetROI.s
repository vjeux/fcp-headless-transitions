__ZN41HGCPixelFormatConversion_kV4B_WXYZ_output6GetROIEP10HGRendereri6HGRect:
00000000000fd240	movq	%rcx, %rax
00000000000fd243	testl	%edx, %edx
00000000000fd245	je	0xfd25a
00000000000fd247	pushq	%rbp
00000000000fd248	movq	%rsp, %rbp
00000000000fd24b	leaq	_HGRectNull(%rip), %rcx
00000000000fd252	movq	(%rcx), %rax
00000000000fd255	movq	0x8(%rcx), %r8
00000000000fd259	popq	%rbp
00000000000fd25a	movq	%r8, %rdx
00000000000fd25d	retq
00000000000fd25e	nop
