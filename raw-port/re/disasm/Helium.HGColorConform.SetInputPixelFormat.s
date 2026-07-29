__ZN14HGColorConform19SetInputPixelFormatE13HGYCbCrFormat:
00000000001c95a0	pushq	%rbp
00000000001c95a1	movq	%rsp, %rbp
00000000001c95a4	pushq	%r14
00000000001c95a6	pushq	%rbx
00000000001c95a7	movl	%esi, %ebx
00000000001c95a9	movq	%rdi, %r14
00000000001c95ac	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c95b1	movl	%ebx, 0x1bc(%r14)
00000000001c95b8	popq	%rbx
00000000001c95b9	popq	%r14
00000000001c95bb	popq	%rbp
00000000001c95bc	retq
00000000001c95bd	nopl	(%rax)
