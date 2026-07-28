__ZN43HGCPixelFormatConversion_kV4B10Bit_BE_input6GetROIEP10HGRendereri6HGRect:
00000000000f4fb0	movq	%rcx, %rax
00000000000f4fb3	testl	%edx, %edx
00000000000f4fb5	je	0xf4fca
00000000000f4fb7	pushq	%rbp
00000000000f4fb8	movq	%rsp, %rbp
00000000000f4fbb	leaq	_HGRectNull(%rip), %rcx
00000000000f4fc2	movq	(%rcx), %rax
00000000000f4fc5	movq	0x8(%rcx), %r8
00000000000f4fc9	popq	%rbp
00000000000f4fca	movq	%r8, %rdx
00000000000f4fcd	retq
00000000000f4fce	nop
