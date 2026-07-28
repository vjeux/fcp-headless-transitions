__ZN13OZOrthoCamera5resetEv:
0000000000040a80	pushq	%rbp
0000000000040a81	movq	%rsp, %rbp
0000000000040a84	pushq	%rbx
0000000000040a85	subq	$0x18, %rsp
0000000000040a89	movq	%rdi, %rbx
0000000000040a8c	movq	(%rdi), %rax
0000000000040a8f	movl	$0x1, %esi
0000000000040a94	callq	*0x280(%rax)
0000000000040a9a	movq	(%rbx), %rax
0000000000040a9d	xorps	%xmm0, %xmm0
0000000000040aa0	movq	%rbx, %rdi
0000000000040aa3	callq	*0x200(%rax)
0000000000040aa9	movq	(%rbx), %rax
0000000000040aac	movq	%rbx, %rdi
0000000000040aaf	callq	*0x3a0(%rax)
0000000000040ab5	xorps	%xmm0, %xmm0
0000000000040ab8	movaps	%xmm0, -0x20(%rbp)
0000000000040abc	movq	$0x0, -0x10(%rbp)
0000000000040ac4	movq	(%rbx), %rax
0000000000040ac7	leaq	-0x20(%rbp), %rsi
0000000000040acb	movq	%rbx, %rdi
0000000000040ace	callq	*0x1c0(%rax)
0000000000040ad4	leaq	0x230(%rbx), %rsi
0000000000040adb	movq	(%rbx), %rax
0000000000040ade	movq	%rbx, %rdi
0000000000040ae1	callq	*0x120(%rax)
0000000000040ae7	addq	$0x18, %rsp
0000000000040aeb	popq	%rbx
0000000000040aec	popq	%rbp
0000000000040aed	retq
0000000000040aee	nop
