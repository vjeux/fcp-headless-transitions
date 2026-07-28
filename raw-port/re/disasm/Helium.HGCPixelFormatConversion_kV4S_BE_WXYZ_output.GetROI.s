__ZN44HGCPixelFormatConversion_kV4S_BE_WXYZ_output6GetROIEP10HGRendereri6HGRect:
00000000000fd420	movq	%rcx, %rax
00000000000fd423	testl	%edx, %edx
00000000000fd425	je	0xfd43a
00000000000fd427	pushq	%rbp
00000000000fd428	movq	%rsp, %rbp
00000000000fd42b	leaq	_HGRectNull(%rip), %rcx
00000000000fd432	movq	(%rcx), %rax
00000000000fd435	movq	0x8(%rcx), %r8
00000000000fd439	popq	%rbp
00000000000fd43a	movq	%r8, %rdx
00000000000fd43d	retq
00000000000fd43e	nop
