__ZN12HGDefinition9GetOutputEP10HGRenderer:
0000000000106e10	pushq	%rbp
0000000000106e11	movq	%rsp, %rbp
0000000000106e14	pushq	%rbx
0000000000106e15	pushq	%rax
0000000000106e16	movq	%rdi, %rbx
0000000000106e19	movq	%rsi, %rdi
0000000000106e1c	movq	%rbx, %rsi
0000000000106e1f	xorl	%edx, %edx
0000000000106e21	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000106e26	movq	0x198(%rbx), %rdi
0000000000106e2d	movq	(%rdi), %rcx
0000000000106e30	xorl	%esi, %esi
0000000000106e32	movq	%rax, %rdx
0000000000106e35	callq	*0x78(%rcx)
0000000000106e38	movq	0x1b0(%rbx), %rax
0000000000106e3f	addq	$0x8, %rsp
0000000000106e43	popq	%rbx
0000000000106e44	popq	%rbp
0000000000106e45	retq
0000000000106e46	nopw	%cs:(%rax,%rax)
