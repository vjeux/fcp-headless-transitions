__ZN14HGColorConform20SetOutputPixelFormatE8HGFormat13HGYCbCrFormat:
00000000001c95c0	pushq	%rbp
00000000001c95c1	movq	%rsp, %rbp
00000000001c95c4	pushq	%r15
00000000001c95c6	pushq	%r14
00000000001c95c8	pushq	%rbx
00000000001c95c9	pushq	%rax
00000000001c95ca	movl	%edx, %ebx
00000000001c95cc	movl	%esi, %r14d
00000000001c95cf	movq	%rdi, %r15
00000000001c95d2	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c95d7	movl	%r14d, 0x1b8(%r15)
00000000001c95de	movl	%ebx, 0x1c0(%r15)
00000000001c95e5	addq	$0x8, %rsp
00000000001c95e9	popq	%rbx
00000000001c95ea	popq	%r14
00000000001c95ec	popq	%r15
00000000001c95ee	popq	%rbp
00000000001c95ef	retq
