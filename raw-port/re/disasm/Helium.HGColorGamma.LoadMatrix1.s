__ZN12HGColorGamma11LoadMatrix1EPKDv4_f:
00000000000fb790	pushq	%rbp
00000000000fb791	movq	%rsp, %rbp
00000000000fb794	pushq	%r14
00000000000fb796	pushq	%rbx
00000000000fb797	movq	%rsi, %rbx
00000000000fb79a	movq	%rdi, %r14
00000000000fb79d	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb7a2	movb	$0x1, 0x2e9(%r14)
00000000000fb7aa	movaps	(%rbx), %xmm0
00000000000fb7ad	movaps	%xmm0, 0x380(%r14)
00000000000fb7b5	movaps	0x10(%rbx), %xmm0
00000000000fb7b9	movaps	%xmm0, 0x390(%r14)
00000000000fb7c1	movaps	0x20(%rbx), %xmm0
00000000000fb7c5	movaps	%xmm0, 0x3a0(%r14)
00000000000fb7cd	movaps	0x30(%rbx), %xmm0
00000000000fb7d1	movaps	%xmm0, 0x3b0(%r14)
00000000000fb7d9	popq	%rbx
00000000000fb7da	popq	%r14
00000000000fb7dc	popq	%rbp
00000000000fb7dd	retq
00000000000fb7de	nop
