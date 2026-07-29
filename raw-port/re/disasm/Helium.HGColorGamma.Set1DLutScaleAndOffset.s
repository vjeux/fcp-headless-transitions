__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff:
00000000000fb6f0	pushq	%rbp
00000000000fb6f1	movq	%rsp, %rbp
00000000000fb6f4	pushq	%rbx
00000000000fb6f5	pushq	%rax
00000000000fb6f6	movss	%xmm1, -0x10(%rbp)
00000000000fb6fb	movss	%xmm0, -0xc(%rbp)
00000000000fb700	movq	%rdi, %rbx
00000000000fb703	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb708	movb	$0x1, 0x2e9(%rbx)
00000000000fb70f	movss	-0xc(%rbp), %xmm0
00000000000fb714	movss	%xmm0, 0x484(%rbx)
00000000000fb71c	movss	-0x10(%rbp), %xmm0
00000000000fb721	movss	%xmm0, 0x488(%rbx)
00000000000fb729	addq	$0x8, %rsp
00000000000fb72d	popq	%rbx
00000000000fb72e	popq	%rbp
00000000000fb72f	retq
