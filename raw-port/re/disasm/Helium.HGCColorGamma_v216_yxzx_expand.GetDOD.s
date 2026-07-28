__ZN30HGCColorGamma_v216_yxzx_expand6GetDODEP10HGRendereri6HGRect:
00000000000fd140	testl	%edx, %edx
00000000000fd142	je	0xfd153
00000000000fd144	leaq	_HGRectNull(%rip), %rcx
00000000000fd14b	movq	(%rcx), %rax
00000000000fd14e	movq	0x8(%rcx), %rdx
00000000000fd152	retq
00000000000fd153	pushq	%rbp
00000000000fd154	movq	%rsp, %rbp
00000000000fd157	pushq	%rbx
00000000000fd158	pushq	%rax
00000000000fd159	movq	%rdi, %rax
00000000000fd15c	movq	%rsi, %rdi
00000000000fd15f	movq	%rsi, %rbx
00000000000fd162	movq	%rax, %rsi
00000000000fd165	xorl	%edx, %edx
00000000000fd167	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd16c	movq	%rbx, %rdi
00000000000fd16f	movq	%rax, %rsi
00000000000fd172	addq	$0x8, %rsp
00000000000fd176	popq	%rbx
00000000000fd177	popq	%rbp
00000000000fd178	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd17d	nopl	(%rax)
