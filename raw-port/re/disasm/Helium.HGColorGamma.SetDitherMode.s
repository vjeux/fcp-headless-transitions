__ZN12HGColorGamma13SetDitherModeEb:
00000000000fbbc0	pushq	%rbp
00000000000fbbc1	movq	%rsp, %rbp
00000000000fbbc4	pushq	%r14
00000000000fbbc6	pushq	%rbx
00000000000fbbc7	movl	%esi, %ebx
00000000000fbbc9	movq	%rdi, %r14
00000000000fbbcc	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fbbd1	movb	$0x1, 0x2e9(%r14)
00000000000fbbd9	movb	%bl, 0x401(%r14)
00000000000fbbe0	popq	%rbx
00000000000fbbe1	popq	%r14
00000000000fbbe3	popq	%rbp
00000000000fbbe4	retq
00000000000fbbe5	nopw	%cs:(%rax,%rax)
