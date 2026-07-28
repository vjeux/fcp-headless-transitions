__ZN44HGCPixelFormatConversion_kV4B10Bit_BE_output6GetROIEP10HGRendereri6HGRect:
00000000000fd4c0	movq	%rcx, %rax
00000000000fd4c3	testl	%edx, %edx
00000000000fd4c5	je	0xfd4da
00000000000fd4c7	pushq	%rbp
00000000000fd4c8	movq	%rsp, %rbp
00000000000fd4cb	leaq	_HGRectNull(%rip), %rcx
00000000000fd4d2	movq	(%rcx), %rax
00000000000fd4d5	movq	0x8(%rcx), %r8
00000000000fd4d9	popq	%rbp
00000000000fd4da	movq	%r8, %rdx
00000000000fd4dd	retq
00000000000fd4de	nop
