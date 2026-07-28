__ZN13HGLensDistort9GetOutputEP10HGRenderer:
000000000022a280	pushq	%rbp
000000000022a281	movq	%rsp, %rbp
000000000022a284	pushq	%rbx
000000000022a285	pushq	%rax
000000000022a286	movq	%rdi, %rbx
000000000022a289	movq	%rsi, %rdi
000000000022a28c	movq	%rbx, %rsi
000000000022a28f	xorl	%edx, %edx
000000000022a291	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000022a296	movq	0x1a8(%rbx), %rdi
000000000022a29d	testq	%rdi, %rdi
000000000022a2a0	je	0x22a2b4
000000000022a2a2	movq	(%rdi), %rcx
000000000022a2a5	xorl	%esi, %esi
000000000022a2a7	movq	%rax, %rdx
000000000022a2aa	callq	*0x78(%rcx)
000000000022a2ad	movq	0x1a8(%rbx), %rax
000000000022a2b4	addq	$0x8, %rsp
000000000022a2b8	popq	%rbx
000000000022a2b9	popq	%rbp
000000000022a2ba	retq
000000000022a2bb	nopl	(%rax,%rax)
