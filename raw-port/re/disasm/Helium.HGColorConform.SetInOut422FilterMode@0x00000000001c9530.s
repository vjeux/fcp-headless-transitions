__ZN14HGColorConform21SetInOut422FilterModeENS_32hgColorConformInOut422FilterModeE:
00000000001c9530	cmpl	%esi, 0x1c4(%rdi)
00000000001c9536	je	0x1c9554
00000000001c9538	pushq	%rbp
00000000001c9539	movq	%rsp, %rbp
00000000001c953c	pushq	%r14
00000000001c953e	pushq	%rbx
00000000001c953f	movl	%esi, %ebx
00000000001c9541	movq	%rdi, %r14
00000000001c9544	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c9549	movl	%ebx, 0x1c4(%r14)
00000000001c9550	popq	%rbx
00000000001c9551	popq	%r14
00000000001c9553	popq	%rbp
00000000001c9554	retq
00000000001c9555	nopw	%cs:(%rax,%rax)
