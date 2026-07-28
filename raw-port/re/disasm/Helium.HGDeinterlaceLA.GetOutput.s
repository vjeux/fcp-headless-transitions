__ZN15HGDeinterlaceLA9GetOutputEP10HGRenderer:
000000000003e8c0	pushq	%rbp
000000000003e8c1	movq	%rsp, %rbp
000000000003e8c4	pushq	%r15
000000000003e8c6	pushq	%r14
000000000003e8c8	pushq	%rbx
000000000003e8c9	pushq	%rax
000000000003e8ca	movq	%rsi, %r14
000000000003e8cd	movq	%rdi, %rbx
000000000003e8d0	cvtsi2ssl	0x198(%rdi), %xmm0
000000000003e8d8	movq	0x1a8(%rdi), %rdi
000000000003e8df	cvtsi2ssl	0x19c(%rbx), %xmm1
000000000003e8e7	cvtsi2ssl	0x1a0(%rbx), %xmm2
000000000003e8ef	movq	(%rdi), %rax
000000000003e8f2	xorps	%xmm3, %xmm3
000000000003e8f5	xorl	%esi, %esi
000000000003e8f7	callq	*0x60(%rax)
000000000003e8fa	movq	0x1a8(%rbx), %r15
000000000003e901	movq	%r14, %rdi
000000000003e904	movq	%rbx, %rsi
000000000003e907	xorl	%edx, %edx
000000000003e909	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000003e90e	movq	(%r15), %rcx
000000000003e911	movq	%r15, %rdi
000000000003e914	xorl	%esi, %esi
000000000003e916	movq	%rax, %rdx
000000000003e919	callq	*0x78(%rcx)
000000000003e91c	movq	0x1a8(%rbx), %rax
000000000003e923	addq	$0x8, %rsp
000000000003e927	popq	%rbx
000000000003e928	popq	%r14
000000000003e92a	popq	%r15
000000000003e92c	popq	%rbp
000000000003e92d	retq
000000000003e92e	nop
