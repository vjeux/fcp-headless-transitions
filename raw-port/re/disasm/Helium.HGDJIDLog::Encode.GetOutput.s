__ZN9HGDJIDLog6Encode9GetOutputEP10HGRenderer:
0000000000103de0	pushq	%rbp
0000000000103de1	movq	%rsp, %rbp
0000000000103de4	pushq	%r14
0000000000103de6	pushq	%rbx
0000000000103de7	movq	%rdi, %rbx
0000000000103dea	movq	0x198(%rdi), %r14
0000000000103df1	movq	%rsi, %rdi
0000000000103df4	movq	%rbx, %rsi
0000000000103df7	xorl	%edx, %edx
0000000000103df9	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000103dfe	movq	(%r14), %rcx
0000000000103e01	movq	%r14, %rdi
0000000000103e04	xorl	%esi, %esi
0000000000103e06	movq	%rax, %rdx
0000000000103e09	callq	*0x78(%rcx)
0000000000103e0c	movq	0x198(%rbx), %rdi
0000000000103e13	movq	0x1a8(%rbx), %rsi
0000000000103e1a	movl	$0x1, %edx
0000000000103e1f	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
0000000000103e24	movzbl	__ZGVZN9HGDJIDLog6Encode9GetOutputEP10HGRendererE1c(%rip), %eax ## guard variable for HGDJIDLog::Encode::GetOutput(HGRenderer*)::c
0000000000103e2b	testb	%al, %al
0000000000103e2d	je	0x103ead
0000000000103e2f	movq	0x198(%rbx), %rdx
0000000000103e36	movq	0x1a0(%rbx), %rdi
0000000000103e3d	movq	(%rdi), %rax
0000000000103e40	xorl	%esi, %esi
0000000000103e42	callq	*0x78(%rax)
0000000000103e45	movq	0x1a0(%rbx), %rdi
0000000000103e4c	movss	__ZZN9HGDJIDLog6Encode9GetOutputEP10HGRendererE1c(%rip), %xmm2 ## HGDJIDLog::Encode::GetOutput(HGRenderer*)::c
0000000000103e54	movq	(%rdi), %rax
0000000000103e57	movss	0x2cd1b5(%rip), %xmm0
0000000000103e5f	movss	0x2cd1b1(%rip), %xmm1
0000000000103e67	movss	0x2cd1ad(%rip), %xmm3
0000000000103e6f	xorl	%esi, %esi
0000000000103e71	callq	*0x60(%rax)
0000000000103e74	movq	0x1a0(%rbx), %rdi
0000000000103e7b	movq	(%rdi), %rax
0000000000103e7e	movss	0x2cd19a(%rip), %xmm0
0000000000103e86	movss	0x2cd196(%rip), %xmm1
0000000000103e8e	movss	0x2cd192(%rip), %xmm2
0000000000103e96	xorps	%xmm3, %xmm3
0000000000103e99	movl	$0x1, %esi
0000000000103e9e	callq	*0x60(%rax)
0000000000103ea1	movq	0x1a0(%rbx), %rax
0000000000103ea8	popq	%rbx
0000000000103ea9	popq	%r14
0000000000103eab	popq	%rbp
0000000000103eac	retq
0000000000103ead	callq	__ZN9HGDJIDLog6Encode9GetOutputEP10HGRenderer.cold.1 ## HGDJIDLog::Encode::GetOutput(HGRenderer*) (.cold.1)
0000000000103eb2	jmp	0x103e2f
0000000000103eb7	nopw	(%rax,%rax)
