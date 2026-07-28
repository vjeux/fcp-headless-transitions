__ZN13HGPremultiply9GetOutputEP10HGRenderer:
0000000000157c30	pushq	%rbp
0000000000157c31	movq	%rsp, %rbp
0000000000157c34	pushq	%rbx
0000000000157c35	pushq	%rax
0000000000157c36	movq	%rdi, %rbx
0000000000157c39	movq	%rsi, %rdi
0000000000157c3c	movq	%rbx, %rsi
0000000000157c3f	xorl	%edx, %edx
0000000000157c41	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000157c46	movq	0x198(%rbx), %rdi
0000000000157c4d	movq	(%rdi), %rcx
0000000000157c50	xorl	%esi, %esi
0000000000157c52	movq	%rax, %rdx
0000000000157c55	callq	*0x78(%rcx)
0000000000157c58	movq	0x198(%rbx), %rax
0000000000157c5f	addq	$0x8, %rsp
0000000000157c63	popq	%rbx
0000000000157c64	popq	%rbp
0000000000157c65	retq
0000000000157c66	nopw	%cs:(%rax,%rax)
