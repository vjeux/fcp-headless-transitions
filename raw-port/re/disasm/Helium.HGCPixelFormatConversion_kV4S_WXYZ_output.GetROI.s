__ZN41HGCPixelFormatConversion_kV4S_WXYZ_output6GetROIEP10HGRendereri6HGRect:
00000000000fd2e0	movq	%rcx, %rax
00000000000fd2e3	testl	%edx, %edx
00000000000fd2e5	je	0xfd2fa
00000000000fd2e7	pushq	%rbp
00000000000fd2e8	movq	%rsp, %rbp
00000000000fd2eb	leaq	_HGRectNull(%rip), %rcx
00000000000fd2f2	movq	(%rcx), %rax
00000000000fd2f5	movq	0x8(%rcx), %r8
00000000000fd2f9	popq	%rbp
00000000000fd2fa	movq	%r8, %rdx
00000000000fd2fd	retq
00000000000fd2fe	nop
