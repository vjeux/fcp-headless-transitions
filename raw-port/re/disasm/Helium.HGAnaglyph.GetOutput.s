__ZN10HGAnaglyph9GetOutputEP10HGRenderer:
000000000006f6c0	pushq	%rbp
000000000006f6c1	movq	%rsp, %rbp
000000000006f6c4	pushq	%r15
000000000006f6c6	pushq	%r14
000000000006f6c8	pushq	%rbx
000000000006f6c9	pushq	%rax
000000000006f6ca	movq	%rsi, %r14
000000000006f6cd	movq	%rdi, %rbx
000000000006f6d0	movq	%rsi, %rdi
000000000006f6d3	movq	%rbx, %rsi
000000000006f6d6	xorl	%edx, %edx
000000000006f6d8	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000006f6dd	movq	%rax, %r15
000000000006f6e0	movq	%r14, %rdi
000000000006f6e3	movq	%rbx, %rsi
000000000006f6e6	movl	$0x1, %edx
000000000006f6eb	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000006f6f0	movq	%rax, %r14
000000000006f6f3	movq	0x198(%rbx), %rdi
000000000006f6fa	movq	(%rdi), %rax
000000000006f6fd	xorl	%esi, %esi
000000000006f6ff	movq	%r15, %rdx
000000000006f702	callq	*0x78(%rax)
000000000006f705	movq	0x198(%rbx), %rdi
000000000006f70c	movq	(%rdi), %rax
000000000006f70f	movl	$0x1, %esi
000000000006f714	movq	%r14, %rdx
000000000006f717	callq	*0x78(%rax)
000000000006f71a	movq	0x198(%rbx), %rdi
000000000006f721	movss	0x1a0(%rbx), %xmm0
000000000006f729	movq	(%rdi), %rax
000000000006f72c	xorps	%xmm1, %xmm1
000000000006f72f	xorps	%xmm2, %xmm2
000000000006f732	xorps	%xmm3, %xmm3
000000000006f735	xorl	%esi, %esi
000000000006f737	callq	*0x60(%rax)
000000000006f73a	movq	0x198(%rbx), %rdi
000000000006f741	movss	0x1a4(%rbx), %xmm0
000000000006f749	movss	0x1a8(%rbx), %xmm1
000000000006f751	movss	0x1ac(%rbx), %xmm2
000000000006f759	movss	0x1b0(%rbx), %xmm3
000000000006f761	movq	(%rdi), %rax
000000000006f764	movl	$0x1, %esi
000000000006f769	callq	*0x60(%rax)
000000000006f76c	movq	0x198(%rbx), %rdi
000000000006f773	movss	0x1b4(%rbx), %xmm0
000000000006f77b	movss	0x1b8(%rbx), %xmm1
000000000006f783	movss	0x1bc(%rbx), %xmm2
000000000006f78b	movss	0x1c0(%rbx), %xmm3
000000000006f793	movq	(%rdi), %rax
000000000006f796	movl	$0x2, %esi
000000000006f79b	callq	*0x60(%rax)
000000000006f79e	movq	0x198(%rbx), %rax
000000000006f7a5	addq	$0x8, %rsp
000000000006f7a9	popq	%rbx
000000000006f7aa	popq	%r14
000000000006f7ac	popq	%r15
000000000006f7ae	popq	%rbp
000000000006f7af	retq
