__ZN32HGCColorGamma_2vuy_yxzx_collapse6GetDODEP10HGRendereri6HGRect:
00000000000fd790	testl	%edx, %edx
00000000000fd792	je	0xfd7a3
00000000000fd794	leaq	_HGRectNull(%rip), %rcx
00000000000fd79b	movq	(%rcx), %rax
00000000000fd79e	movq	0x8(%rcx), %rdx
00000000000fd7a2	retq
00000000000fd7a3	pushq	%rbp
00000000000fd7a4	movq	%rsp, %rbp
00000000000fd7a7	pushq	%rbx
00000000000fd7a8	pushq	%rax
00000000000fd7a9	movq	%rdi, %rax
00000000000fd7ac	movq	%rsi, %rdi
00000000000fd7af	movq	%rsi, %rbx
00000000000fd7b2	movq	%rax, %rsi
00000000000fd7b5	xorl	%edx, %edx
00000000000fd7b7	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd7bc	movq	%rbx, %rdi
00000000000fd7bf	movq	%rax, %rsi
00000000000fd7c2	addq	$0x8, %rsp
00000000000fd7c6	popq	%rbx
00000000000fd7c7	popq	%rbp
00000000000fd7c8	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd7cd	nopl	(%rax)
