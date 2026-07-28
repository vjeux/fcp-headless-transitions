__ZN31HgcBilateralFilterInterp_Divide6GetROIEP10HGRendereri6HGRect:
000000000031aae0	movq	%rcx, %rax
000000000031aae3	cmpl	$0x2, %edx
000000000031aae6	jb	0x31aafb
000000000031aae8	pushq	%rbp
000000000031aae9	movq	%rsp, %rbp
000000000031aaec	leaq	_HGRectNull(%rip), %rcx
000000000031aaf3	movq	(%rcx), %rax
000000000031aaf6	movq	0x8(%rcx), %r8
000000000031aafa	popq	%rbp
000000000031aafb	movq	%r8, %rdx
000000000031aafe	retq
000000000031aaff	nop
