__ZN12HGColorGamma24SetARRILogCExposureIndexEj:
00000000000fb760	pushq	%rbp
00000000000fb761	movq	%rsp, %rbp
00000000000fb764	pushq	%r14
00000000000fb766	pushq	%rbx
00000000000fb767	movl	%esi, %ebx
00000000000fb769	movq	%rdi, %r14
00000000000fb76c	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb771	movb	$0x1, 0x2e9(%r14)
00000000000fb779	movl	%ebx, 0x48c(%r14)
00000000000fb780	popq	%rbx
00000000000fb781	popq	%r14
00000000000fb783	popq	%rbp
00000000000fb784	retq
00000000000fb785	nopw	%cs:(%rax,%rax)
