__ZN12HGComicEdges9GetOutputEP10HGRenderer:
0000000000006c60	pushq	%rbp
0000000000006c61	movq	%rsp, %rbp
0000000000006c64	pushq	%rbx
0000000000006c65	pushq	%rax
0000000000006c66	movq	%rdi, %rbx
0000000000006c69	movss	0x198(%rdi), %xmm0
0000000000006c71	movss	0x19c(%rdi), %xmm1
0000000000006c79	movss	0x1a0(%rdi), %xmm2
0000000000006c81	movss	0x1a4(%rdi), %xmm3
0000000000006c89	xorl	%esi, %esi
0000000000006c8b	callq	__ZN6HGNode12SetParameterEiffff ## HGNode::SetParameter(int, float, float, float, float)
0000000000006c90	movq	%rbx, %rax
0000000000006c93	addq	$0x8, %rsp
0000000000006c97	popq	%rbx
0000000000006c98	popq	%rbp
0000000000006c99	retq
0000000000006c9a	nopw	(%rax,%rax)
