__ZN8HGRetimeC1Ev:
0000000000193de0	pushq	%rbp
0000000000193de1	movq	%rsp, %rbp
0000000000193de4	pushq	%rbx
0000000000193de5	pushq	%rax
0000000000193de6	movq	%rdi, %rbx
0000000000193de9	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000193dee	leaq	0x88fdeb(%rip), %rax
0000000000193df5	movq	%rax, (%rbx)
0000000000193df8	movl	$0x0, 0x1a0(%rbx)
0000000000193e02	movq	$0x0, 0x198(%rbx)
0000000000193e0d	movq	$0x1, 0x1a4(%rbx)
0000000000193e18	movsd	0x236290(%rip), %xmm0
0000000000193e20	movsd	%xmm0, 0x1ac(%rbx)
0000000000193e28	movq	$0x0, 0x1b8(%rbx)
0000000000193e33	addq	$0x8, %rsp
0000000000193e37	popq	%rbx
0000000000193e38	popq	%rbp
0000000000193e39	retq
0000000000193e3a	nopw	(%rax,%rax)
