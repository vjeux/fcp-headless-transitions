__ZN44HgcBilateralFilterInterpSC_InterpolatorLastX6GetDODEP10HGRendereri6HGRect:
000000000031cd60	movq	%rcx, %rax
000000000031cd63	cmpl	$0x4, %edx
000000000031cd66	jb	0x31cd7b
000000000031cd68	pushq	%rbp
000000000031cd69	movq	%rsp, %rbp
000000000031cd6c	leaq	_HGRectNull(%rip), %rcx
000000000031cd73	movq	(%rcx), %rax
000000000031cd76	movq	0x8(%rcx), %r8
000000000031cd7a	popq	%rbp
000000000031cd7b	movq	%r8, %rdx
000000000031cd7e	retq
000000000031cd7f	nop
