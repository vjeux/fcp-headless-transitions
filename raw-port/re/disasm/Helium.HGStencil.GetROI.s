__ZN9HGStencil6GetROIEP10HGRendereri6HGRect:
00000000002d2190	movq	%rcx, %rax
00000000002d2193	cmpl	$0x2, %edx
00000000002d2196	jl	0x2d21ab
00000000002d2198	pushq	%rbp
00000000002d2199	movq	%rsp, %rbp
00000000002d219c	leaq	_HGRectNull(%rip), %rcx
00000000002d21a3	movq	(%rcx), %rax
00000000002d21a6	movq	0x8(%rcx), %r8
00000000002d21aa	popq	%rbp
00000000002d21ab	movq	%r8, %rdx
00000000002d21ae	retq
00000000002d21af	nop
