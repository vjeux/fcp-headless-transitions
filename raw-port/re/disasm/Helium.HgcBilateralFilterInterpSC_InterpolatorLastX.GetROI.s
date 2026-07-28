__ZN44HgcBilateralFilterInterpSC_InterpolatorLastX6GetROIEP10HGRendereri6HGRect:
000000000031cd80	movq	%rcx, %rax
000000000031cd83	cmpl	$0x4, %edx
000000000031cd86	jb	0x31cd9b
000000000031cd88	pushq	%rbp
000000000031cd89	movq	%rsp, %rbp
000000000031cd8c	leaq	_HGRectNull(%rip), %rcx
000000000031cd93	movq	(%rcx), %rax
000000000031cd96	movq	0x8(%rcx), %r8
000000000031cd9a	popq	%rbp
000000000031cd9b	movq	%r8, %rdx
000000000031cd9e	retq
000000000031cd9f	nop
