__ZN4HGPQ11InverseEOTF9GetOutputEP10HGRenderer:
00000000000fe030	pushq	%rbp
00000000000fe031	movq	%rsp, %rbp
00000000000fe034	pushq	%r14
00000000000fe036	pushq	%rbx
00000000000fe037	movq	%rdi, %rbx
00000000000fe03a	movq	0x198(%rdi), %r14
00000000000fe041	movq	%rsi, %rdi
00000000000fe044	movq	%rbx, %rsi
00000000000fe047	xorl	%edx, %edx
00000000000fe049	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fe04e	movq	(%r14), %rcx
00000000000fe051	movq	%r14, %rdi
00000000000fe054	xorl	%esi, %esi
00000000000fe056	movq	%rax, %rdx
00000000000fe059	callq	*0x78(%rcx)
00000000000fe05c	movq	0x198(%rbx), %rdi
00000000000fe063	movq	(%rdi), %rax
00000000000fe066	movss	0x2d2ef6(%rip), %xmm0
00000000000fe06e	movss	0x2d2ef2(%rip), %xmm1
00000000000fe076	xorps	%xmm2, %xmm2
00000000000fe079	xorps	%xmm3, %xmm3
00000000000fe07c	xorl	%esi, %esi
00000000000fe07e	callq	*0x60(%rax)
00000000000fe081	movq	0x198(%rbx), %rdi
00000000000fe088	movss	0x1a0(%rbx), %xmm1
00000000000fe090	movss	0x1a4(%rbx), %xmm2
00000000000fe098	movq	(%rdi), %rax
00000000000fe09b	movss	0x2d2eb5(%rip), %xmm0
00000000000fe0a3	xorps	%xmm3, %xmm3
00000000000fe0a6	movl	$0x1, %esi
00000000000fe0ab	callq	*0x60(%rax)
00000000000fe0ae	movq	0x198(%rbx), %rax
00000000000fe0b5	popq	%rbx
00000000000fe0b6	popq	%r14
00000000000fe0b8	popq	%rbp
00000000000fe0b9	retq
00000000000fe0ba	nopw	(%rax,%rax)
