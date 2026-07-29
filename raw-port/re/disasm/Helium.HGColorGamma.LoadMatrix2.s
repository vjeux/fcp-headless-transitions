__ZN12HGColorGamma11LoadMatrix2EPKDv4_f:
00000000000fb7e0	pushq	%rbp
00000000000fb7e1	movq	%rsp, %rbp
00000000000fb7e4	pushq	%r14
00000000000fb7e6	pushq	%rbx
00000000000fb7e7	movq	%rsi, %rbx
00000000000fb7ea	movq	%rdi, %r14
00000000000fb7ed	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb7f2	movb	$0x1, 0x2e9(%r14)
00000000000fb7fa	movaps	(%rbx), %xmm0
00000000000fb7fd	movaps	%xmm0, 0x3c0(%r14)
00000000000fb805	movaps	0x10(%rbx), %xmm0
00000000000fb809	movaps	%xmm0, 0x3d0(%r14)
00000000000fb811	movaps	0x20(%rbx), %xmm0
00000000000fb815	movaps	%xmm0, 0x3e0(%r14)
00000000000fb81d	movaps	0x30(%rbx), %xmm0
00000000000fb821	movaps	%xmm0, 0x3f0(%r14)
00000000000fb829	popq	%rbx
00000000000fb82a	popq	%r14
00000000000fb82c	popq	%rbp
00000000000fb82d	retq
00000000000fb82e	nop
