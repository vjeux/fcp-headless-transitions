__ZN22HGSimpleSpatialDenoiseC1Ev:
00000000001c8240	pushq	%rbp
00000000001c8241	movq	%rsp, %rbp
00000000001c8244	pushq	%rbx
00000000001c8245	pushq	%rax
00000000001c8246	movq	%rdi, %rbx
00000000001c8249	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001c824e	leaq	0x8610eb(%rip), %rax
00000000001c8255	movq	%rax, (%rbx)
00000000001c8258	movq	$0x0, 0x1a8(%rbx)
00000000001c8263	movabsq	$0x100000000, %rax              ## imm = 0x100000000
00000000001c826d	movq	%rax, 0x198(%rbx)
00000000001c8274	movb	$0x1, 0x1a0(%rbx)
00000000001c827b	addq	$0x8, %rsp
00000000001c827f	popq	%rbx
00000000001c8280	popq	%rbp
00000000001c8281	retq
00000000001c8282	nopw	%cs:(%rax,%rax)
