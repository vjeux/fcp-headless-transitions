__ZN30HGCRetimeWithFlowInterpFullRez6GetDODEP10HGRendereri6HGRect:
00000000000e13a0	movq	%rcx, %rax
00000000000e13a3	cmpl	$0x3, %edx
00000000000e13a6	jb	0xe13bb
00000000000e13a8	pushq	%rbp
00000000000e13a9	movq	%rsp, %rbp
00000000000e13ac	leaq	_HGRectNull(%rip), %rcx
00000000000e13b3	movq	(%rcx), %rax
00000000000e13b6	movq	0x8(%rcx), %r8
00000000000e13ba	popq	%rbp
00000000000e13bb	movq	%r8, %rdx
00000000000e13be	retq
00000000000e13bf	nop
