__ZN32HGCColorGamma_chroma_upsample_f16GetDODEP10HGRendereri6HGRect:
00000000000fd6c0	testl	%edx, %edx
00000000000fd6c2	je	0xfd6d3
00000000000fd6c4	leaq	_HGRectNull(%rip), %rcx
00000000000fd6cb	movq	(%rcx), %rax
00000000000fd6ce	movq	0x8(%rcx), %rdx
00000000000fd6d2	retq
00000000000fd6d3	pushq	%rbp
00000000000fd6d4	movq	%rsp, %rbp
00000000000fd6d7	pushq	%rbx
00000000000fd6d8	pushq	%rax
00000000000fd6d9	movq	%rdi, %rax
00000000000fd6dc	movq	%rsi, %rdi
00000000000fd6df	movq	%rsi, %rbx
00000000000fd6e2	movq	%rax, %rsi
00000000000fd6e5	xorl	%edx, %edx
00000000000fd6e7	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd6ec	movq	%rbx, %rdi
00000000000fd6ef	movq	%rax, %rsi
00000000000fd6f2	addq	$0x8, %rsp
00000000000fd6f6	popq	%rbx
00000000000fd6f7	popq	%rbp
00000000000fd6f8	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd6fd	nopl	(%rax)
