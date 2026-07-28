__ZN17HGYUVPlanarToRGBAC1EN11HGYUVPlanar11SubSamplingEb:
00000000000e4a40	pushq	%rbp
00000000000e4a41	movq	%rsp, %rbp
00000000000e4a44	pushq	%r15
00000000000e4a46	pushq	%r14
00000000000e4a48	pushq	%rbx
00000000000e4a49	pushq	%rax
00000000000e4a4a	movl	%edx, %ebx
00000000000e4a4c	movl	%esi, %r14d
00000000000e4a4f	movq	%rdi, %r15
00000000000e4a52	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000e4a57	leaq	0x92977a(%rip), %rax
00000000000e4a5e	movq	%rax, (%r15)
00000000000e4a61	movq	$0x0, 0x198(%r15)
00000000000e4a6c	movl	%r14d, 0x1a0(%r15)
00000000000e4a73	movabsq	$0x300000001, %rax              ## imm = 0x300000001
00000000000e4a7d	movq	%rax, 0x1a4(%r15)
00000000000e4a84	movb	$0x0, 0x1b0(%r15)
00000000000e4a8c	movb	%bl, 0x1b1(%r15)
00000000000e4a93	movabsq	$0x100000000, %rax              ## imm = 0x100000000
00000000000e4a9d	movq	%rax, 0x1b4(%r15)
00000000000e4aa4	addq	$0x8, %rsp
00000000000e4aa8	popq	%rbx
00000000000e4aa9	popq	%r14
00000000000e4aab	popq	%r15
00000000000e4aad	popq	%rbp
00000000000e4aae	retq
00000000000e4aaf	nop
