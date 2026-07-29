__ZN14HGColorConform26SetFixedPointPrecisionModeEb:
00000000001ccc80	pushq	%rbp
00000000001ccc81	movq	%rsp, %rbp
00000000001ccc84	pushq	%r14
00000000001ccc86	pushq	%rbx
00000000001ccc87	movl	%esi, %ebx
00000000001ccc89	cmpb	%bl, 0x1b2(%rdi)
00000000001ccc8f	je	0x1ccca0
00000000001ccc91	movq	%rdi, %r14
00000000001ccc94	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001ccc99	movb	%bl, 0x1b2(%r14)
00000000001ccca0	popq	%rbx
00000000001ccca1	popq	%r14
00000000001ccca3	popq	%rbp
00000000001ccca4	retq
00000000001ccca5	nopw	%cs:(%rax,%rax)
