__ZN31HgcBilateralFilterInterp_Divide6GetDODEP10HGRendereri6HGRect:
000000000031aac0	movq	%rcx, %rax
000000000031aac3	cmpl	$0x2, %edx
000000000031aac6	jb	0x31aadb
000000000031aac8	pushq	%rbp
000000000031aac9	movq	%rsp, %rbp
000000000031aacc	leaq	_HGRectNull(%rip), %rcx
000000000031aad3	movq	(%rcx), %rax
000000000031aad6	movq	0x8(%rcx), %r8
000000000031aada	popq	%rbp
000000000031aadb	movq	%r8, %rdx
000000000031aade	retq
000000000031aadf	nop
