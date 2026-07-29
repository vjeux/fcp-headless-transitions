__ZN14HGColorConform24SetARRILogCExposureIndexEj:
00000000001c9de0	cmpl	%esi, 0x348(%rdi)
00000000001c9de6	je	0x1c9e04
00000000001c9de8	pushq	%rbp
00000000001c9de9	movq	%rsp, %rbp
00000000001c9dec	pushq	%r14
00000000001c9dee	pushq	%rbx
00000000001c9def	movl	%esi, %ebx
00000000001c9df1	movq	%rdi, %r14
00000000001c9df4	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c9df9	movl	%ebx, 0x348(%r14)
00000000001c9e00	popq	%rbx
00000000001c9e01	popq	%r14
00000000001c9e03	popq	%rbp
00000000001c9e04	retq
00000000001c9e05	nopw	%cs:(%rax,%rax)
