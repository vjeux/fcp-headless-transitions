__ZN14HGColorConform26SetAntiSymmetricToneCurvesEb:
00000000001cccb0	pushq	%rbp
00000000001cccb1	movq	%rsp, %rbp
00000000001cccb4	pushq	%r14
00000000001cccb6	pushq	%rbx
00000000001cccb7	movl	%esi, %ebx
00000000001cccb9	cmpb	%bl, 0x1da(%rdi)
00000000001cccbf	je	0x1cccd0
00000000001cccc1	movq	%rdi, %r14
00000000001cccc4	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001cccc9	movb	%bl, 0x1da(%r14)
00000000001cccd0	popq	%rbx
00000000001cccd1	popq	%r14
00000000001cccd3	popq	%rbp
00000000001cccd4	retq
00000000001cccd5	nopw	%cs:(%rax,%rax)
