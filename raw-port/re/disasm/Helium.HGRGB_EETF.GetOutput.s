__ZN10HGRGB_EETF9GetOutputEP10HGRenderer:
0000000000105ba0	pushq	%rbp
0000000000105ba1	movq	%rsp, %rbp
0000000000105ba4	pushq	%r14
0000000000105ba6	pushq	%rbx
0000000000105ba7	movq	%rdi, %rbx
0000000000105baa	movq	0x198(%rdi), %r14
0000000000105bb1	movq	%rsi, %rdi
0000000000105bb4	movq	%rbx, %rsi
0000000000105bb7	xorl	%edx, %edx
0000000000105bb9	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000105bbe	movq	(%r14), %rcx
0000000000105bc1	movq	%r14, %rdi
0000000000105bc4	xorl	%esi, %esi
0000000000105bc6	movq	%rax, %rdx
0000000000105bc9	callq	*0x78(%rcx)
0000000000105bcc	movq	0x198(%rbx), %rdx
0000000000105bd3	movq	0x1a0(%rbx), %rdi
0000000000105bda	movq	(%rdi), %rax
0000000000105bdd	xorl	%esi, %esi
0000000000105bdf	callq	*0x78(%rax)
0000000000105be2	movq	0x1a0(%rbx), %rdi
0000000000105be9	movss	0x1b0(%rbx), %xmm0
0000000000105bf1	movss	0x1b4(%rbx), %xmm1
0000000000105bf9	movq	(%rdi), %rax
0000000000105bfc	xorps	%xmm2, %xmm2
0000000000105bff	xorps	%xmm3, %xmm3
0000000000105c02	xorl	%esi, %esi
0000000000105c04	callq	*0x60(%rax)
0000000000105c07	movq	0x1a0(%rbx), %rdi
0000000000105c0e	movss	0x1b8(%rbx), %xmm0
0000000000105c16	movss	0x1bc(%rbx), %xmm1
0000000000105c1e	movss	0x1c0(%rbx), %xmm2
0000000000105c26	movss	0x1c4(%rbx), %xmm3
0000000000105c2e	movq	(%rdi), %rax
0000000000105c31	movl	$0x1, %esi
0000000000105c36	callq	*0x60(%rax)
0000000000105c39	movq	0x1a0(%rbx), %rdx
0000000000105c40	movq	0x1a8(%rbx), %rdi
0000000000105c47	movq	(%rdi), %rax
0000000000105c4a	xorl	%esi, %esi
0000000000105c4c	callq	*0x78(%rax)
0000000000105c4f	movq	0x1a8(%rbx), %rax
0000000000105c56	popq	%rbx
0000000000105c57	popq	%r14
0000000000105c59	popq	%rbp
0000000000105c5a	retq
0000000000105c5b	nopl	(%rax,%rax)
