__ZN34HGCColorGamma_chroma_downsample_f16GetDODEP10HGRendereri6HGRect:
00000000000fd5a0	testl	%edx, %edx
00000000000fd5a2	je	0xfd5b3
00000000000fd5a4	leaq	_HGRectNull(%rip), %rcx
00000000000fd5ab	movq	(%rcx), %rax
00000000000fd5ae	movq	0x8(%rcx), %rdx
00000000000fd5b2	retq
00000000000fd5b3	pushq	%rbp
00000000000fd5b4	movq	%rsp, %rbp
00000000000fd5b7	pushq	%rbx
00000000000fd5b8	pushq	%rax
00000000000fd5b9	movq	%rdi, %rax
00000000000fd5bc	movq	%rsi, %rdi
00000000000fd5bf	movq	%rsi, %rbx
00000000000fd5c2	movq	%rax, %rsi
00000000000fd5c5	xorl	%edx, %edx
00000000000fd5c7	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd5cc	movq	%rbx, %rdi
00000000000fd5cf	movq	%rax, %rsi
00000000000fd5d2	addq	$0x8, %rsp
00000000000fd5d6	popq	%rbx
00000000000fd5d7	popq	%rbp
00000000000fd5d8	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd5dd	nopl	(%rax)
