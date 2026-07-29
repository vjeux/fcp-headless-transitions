__ZN14HGColorConform13SetDitherModeEb:
00000000001ccc50	pushq	%rbp
00000000001ccc51	movq	%rsp, %rbp
00000000001ccc54	pushq	%r14
00000000001ccc56	pushq	%rbx
00000000001ccc57	movl	%esi, %ebx
00000000001ccc59	cmpb	%bl, 0x1b1(%rdi)
00000000001ccc5f	je	0x1ccc70
00000000001ccc61	movq	%rdi, %r14
00000000001ccc64	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001ccc69	movb	%bl, 0x1b1(%r14)
00000000001ccc70	popq	%rbx
00000000001ccc71	popq	%r14
00000000001ccc73	popq	%rbp
00000000001ccc74	retq
00000000001ccc75	nopw	%cs:(%rax,%rax)
