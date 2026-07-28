__ZN20HGAVATemporalAverage9GetOutputEP10HGRenderer:
0000000000212e80	pushq	%rbp
0000000000212e81	movq	%rsp, %rbp
0000000000212e84	pushq	%r15
0000000000212e86	pushq	%r14
0000000000212e88	pushq	%rbx
0000000000212e89	pushq	%rax
0000000000212e8a	movq	%rsi, %r14
0000000000212e8d	movq	%rdi, %rbx
0000000000212e90	movq	0x198(%rdi), %r15
0000000000212e97	movq	%rsi, %rdi
0000000000212e9a	movq	%rbx, %rsi
0000000000212e9d	xorl	%edx, %edx
0000000000212e9f	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000212ea4	movq	(%r15), %rcx
0000000000212ea7	movq	%r15, %rdi
0000000000212eaa	xorl	%esi, %esi
0000000000212eac	movq	%rax, %rdx
0000000000212eaf	callq	*0x78(%rcx)
0000000000212eb2	movq	0x198(%rbx), %r15
0000000000212eb9	movq	%r14, %rdi
0000000000212ebc	movq	%rbx, %rsi
0000000000212ebf	movl	$0x1, %edx
0000000000212ec4	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000212ec9	movq	(%r15), %rcx
0000000000212ecc	movq	%r15, %rdi
0000000000212ecf	movl	$0x1, %esi
0000000000212ed4	movq	%rax, %rdx
0000000000212ed7	callq	*0x78(%rcx)
0000000000212eda	movq	0x198(%rbx), %rax
0000000000212ee1	addq	$0x8, %rsp
0000000000212ee5	popq	%rbx
0000000000212ee6	popq	%r14
0000000000212ee8	popq	%r15
0000000000212eea	popq	%rbp
0000000000212eeb	retq
0000000000212eec	nopl	(%rax)
