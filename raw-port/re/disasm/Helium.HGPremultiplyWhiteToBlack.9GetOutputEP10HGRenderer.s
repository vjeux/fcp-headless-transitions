__ZN25HGPremultiplyWhiteToBlack9GetOutputEP10HGRenderer:
0000000000158030	pushq	%rbp
0000000000158031	movq	%rsp, %rbp
0000000000158034	pushq	%rbx
0000000000158035	pushq	%rax
0000000000158036	movq	%rdi, %rbx
0000000000158039	movq	%rsi, %rdi
000000000015803c	movq	%rbx, %rsi
000000000015803f	xorl	%edx, %edx
0000000000158041	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000158046	movq	0x198(%rbx), %rdi
000000000015804d	movq	(%rdi), %rcx
0000000000158050	xorl	%esi, %esi
0000000000158052	movq	%rax, %rdx
0000000000158055	callq	*0x78(%rcx)
0000000000158058	movq	0x198(%rbx), %rax
000000000015805f	addq	$0x8, %rsp
0000000000158063	popq	%rbx
0000000000158064	popq	%rbp
0000000000158065	retq
0000000000158066	nopw	%cs:(%rax,%rax)
