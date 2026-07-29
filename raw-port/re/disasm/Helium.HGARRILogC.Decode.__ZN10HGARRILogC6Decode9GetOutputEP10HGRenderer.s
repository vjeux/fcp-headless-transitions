__ZN10HGARRILogC6Decode9GetOutputEP10HGRenderer:
0000000000102b30	pushq	%rbp
0000000000102b31	movq	%rsp, %rbp
0000000000102b34	pushq	%r14
0000000000102b36	pushq	%rbx
0000000000102b37	movq	%rdi, %rbx
0000000000102b3a	movq	0x198(%rdi), %r14
0000000000102b41	movq	%rsi, %rdi
0000000000102b44	movq	%rbx, %rsi
0000000000102b47	xorl	%edx, %edx
0000000000102b49	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000102b4e	movq	(%r14), %rcx
0000000000102b51	movq	%r14, %rdi
0000000000102b54	xorl	%esi, %esi
0000000000102b56	movq	%rax, %rdx
0000000000102b59	callq	*0x78(%rcx)
0000000000102b5c	movq	0x198(%rbx), %rdi
0000000000102b63	movss	0x1a8(%rbx), %xmm0
0000000000102b6b	movss	0x1ac(%rbx), %xmm1
0000000000102b73	movss	0x1b0(%rbx), %xmm2
0000000000102b7b	movss	0x1b4(%rbx), %xmm3
0000000000102b83	movq	(%rdi), %rax
0000000000102b86	xorl	%esi, %esi
0000000000102b88	callq	*0x60(%rax)
0000000000102b8b	movq	0x198(%rbx), %rdi
0000000000102b92	movss	0x1b8(%rbx), %xmm0
0000000000102b9a	movss	0x1bc(%rbx), %xmm1
0000000000102ba2	movss	0x1c0(%rbx), %xmm2
0000000000102baa	movq	(%rdi), %rax
0000000000102bad	xorps	%xmm3, %xmm3
0000000000102bb0	movl	$0x1, %esi
0000000000102bb5	callq	*0x60(%rax)
0000000000102bb8	movq	0x198(%rbx), %rdx
0000000000102bbf	movq	0x1a0(%rbx), %rdi
0000000000102bc6	movq	(%rdi), %rax
0000000000102bc9	xorl	%esi, %esi
0000000000102bcb	callq	*0x78(%rax)
0000000000102bce	movq	0x1a0(%rbx), %rdi
0000000000102bd5	movq	0x1c8(%rbx), %rsi
0000000000102bdc	movl	$0x1, %edx
0000000000102be1	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
0000000000102be6	movq	0x1a0(%rbx), %rax
0000000000102bed	popq	%rbx
0000000000102bee	popq	%r14
0000000000102bf0	popq	%rbp
0000000000102bf1	retq
0000000000102bf2	nopw	%cs:(%rax,%rax)
