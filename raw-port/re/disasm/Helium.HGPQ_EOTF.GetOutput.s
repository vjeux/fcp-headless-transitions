__ZN4HGPQ4EOTF9GetOutputEP10HGRenderer:
00000000000fdd10	pushq	%rbp
00000000000fdd11	movq	%rsp, %rbp
00000000000fdd14	pushq	%r14
00000000000fdd16	pushq	%rbx
00000000000fdd17	movq	%rdi, %rbx
00000000000fdd1a	movq	0x198(%rdi), %r14
00000000000fdd21	movq	%rsi, %rdi
00000000000fdd24	movq	%rbx, %rsi
00000000000fdd27	xorl	%edx, %edx
00000000000fdd29	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fdd2e	movq	(%r14), %rcx
00000000000fdd31	movq	%r14, %rdi
00000000000fdd34	xorl	%esi, %esi
00000000000fdd36	movq	%rax, %rdx
00000000000fdd39	callq	*0x78(%rcx)
00000000000fdd3c	movq	0x198(%rbx), %rdi
00000000000fdd43	movq	(%rdi), %rax
00000000000fdd46	movss	0x2d3202(%rip), %xmm0
00000000000fdd4e	movss	0x2d31fe(%rip), %xmm1
00000000000fdd56	xorps	%xmm2, %xmm2
00000000000fdd59	xorps	%xmm3, %xmm3
00000000000fdd5c	xorl	%esi, %esi
00000000000fdd5e	callq	*0x60(%rax)
00000000000fdd61	movq	0x198(%rbx), %rdi
00000000000fdd68	movss	0x1a0(%rbx), %xmm3
00000000000fdd70	movq	(%rdi), %rax
00000000000fdd73	movss	0x2d31dd(%rip), %xmm0
00000000000fdd7b	movss	0x2d31d9(%rip), %xmm1
00000000000fdd83	movss	0x2d31d5(%rip), %xmm2
00000000000fdd8b	movl	$0x1, %esi
00000000000fdd90	callq	*0x60(%rax)
00000000000fdd93	movq	0x198(%rbx), %rax
00000000000fdd9a	popq	%rbx
00000000000fdd9b	popq	%r14
00000000000fdd9d	popq	%rbp
00000000000fdd9e	retq
00000000000fdd9f	nop
