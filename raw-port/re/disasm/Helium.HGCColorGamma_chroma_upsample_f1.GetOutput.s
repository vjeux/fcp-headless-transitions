__ZN32HGCColorGamma_chroma_upsample_f19GetOutputEP10HGRenderer:
00000000000fd660	pushq	%rbp
00000000000fd661	movq	%rsp, %rbp
00000000000fd664	pushq	%r14
00000000000fd666	pushq	%rbx
00000000000fd667	movq	%rsi, %r14
00000000000fd66a	movq	%rdi, %rbx
00000000000fd66d	movq	%rsi, %rdi
00000000000fd670	movq	%rbx, %rsi
00000000000fd673	xorl	%edx, %edx
00000000000fd675	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fd67a	movq	%r14, %rdi
00000000000fd67d	movq	%rax, %rsi
00000000000fd680	callq	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
00000000000fd685	movl	%edx, %ecx
00000000000fd687	subl	%eax, %ecx
00000000000fd689	cvtsi2ss	%rcx, %xmm0
00000000000fd68e	cvtsi2ss	%eax, %xmm2
00000000000fd692	shrq	$0x20, %rdx
00000000000fd696	shrq	$0x20, %rax
00000000000fd69a	subl	%eax, %edx
00000000000fd69c	cvtsi2ss	%rdx, %xmm1
00000000000fd6a1	cvtsi2ss	%eax, %xmm3
00000000000fd6a5	movq	(%rbx), %rax
00000000000fd6a8	movq	%rbx, %rdi
00000000000fd6ab	xorl	%esi, %esi
00000000000fd6ad	callq	*0x60(%rax)
00000000000fd6b0	movq	%rbx, %rax
00000000000fd6b3	popq	%rbx
00000000000fd6b4	popq	%r14
00000000000fd6b6	popq	%rbp
00000000000fd6b7	retq
00000000000fd6b8	nopl	(%rax,%rax)
