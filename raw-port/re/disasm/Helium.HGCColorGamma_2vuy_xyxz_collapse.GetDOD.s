__ZN32HGCColorGamma_2vuy_xyxz_collapse6GetDODEP10HGRendereri6HGRect:
00000000000fd850	testl	%edx, %edx
00000000000fd852	je	0xfd863
00000000000fd854	leaq	_HGRectNull(%rip), %rcx
00000000000fd85b	movq	(%rcx), %rax
00000000000fd85e	movq	0x8(%rcx), %rdx
00000000000fd862	retq
00000000000fd863	pushq	%rbp
00000000000fd864	movq	%rsp, %rbp
00000000000fd867	pushq	%rbx
00000000000fd868	pushq	%rax
00000000000fd869	movq	%rdi, %rax
00000000000fd86c	movq	%rsi, %rdi
00000000000fd86f	movq	%rsi, %rbx
00000000000fd872	movq	%rax, %rsi
00000000000fd875	xorl	%edx, %edx
00000000000fd877	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd87c	movq	%rbx, %rdi
00000000000fd87f	movq	%rax, %rsi
00000000000fd882	addq	$0x8, %rsp
00000000000fd886	popq	%rbx
00000000000fd887	popq	%rbp
00000000000fd888	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd88d	nopl	(%rax)
