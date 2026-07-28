__ZN43HGCPixelFormatConversion_kV4S_BE_WXYZ_input6GetROIEP10HGRendereri6HGRect:
00000000000f4f20	movq	%rcx, %rax
00000000000f4f23	testl	%edx, %edx
00000000000f4f25	je	0xf4f3a
00000000000f4f27	pushq	%rbp
00000000000f4f28	movq	%rsp, %rbp
00000000000f4f2b	leaq	_HGRectNull(%rip), %rcx
00000000000f4f32	movq	(%rcx), %rax
00000000000f4f35	movq	0x8(%rcx), %r8
00000000000f4f39	popq	%rbp
00000000000f4f3a	movq	%r8, %rdx
00000000000f4f3d	retq
00000000000f4f3e	nop
