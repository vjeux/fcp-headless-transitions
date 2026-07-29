__ZN14HGColorConform22Set1DLutScaleAndOffsetEff:
00000000001c9640	pushq	%rbp
00000000001c9641	movq	%rsp, %rbp
00000000001c9644	pushq	%rbx
00000000001c9645	pushq	%rax
00000000001c9646	movq	%rdi, %rbx
00000000001c9649	movss	0x1dc(%rdi), %xmm2
00000000001c9651	ucomiss	%xmm0, %xmm2
00000000001c9654	movss	%xmm1, -0xc(%rbp)
00000000001c9659	jne	0x1c965d
00000000001c965b	jnp	0x1c967c
00000000001c965d	movq	%rbx, %rdi
00000000001c9660	movss	%xmm0, -0x10(%rbp)
00000000001c9665	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c966a	movss	-0xc(%rbp), %xmm1
00000000001c966f	movss	-0x10(%rbp), %xmm0
00000000001c9674	movss	%xmm0, 0x1dc(%rbx)
00000000001c967c	movss	0x1e0(%rbx), %xmm0
00000000001c9684	ucomiss	%xmm1, %xmm0
00000000001c9687	jne	0x1c968b
00000000001c9689	jnp	0x1c96a0
00000000001c968b	movq	%rbx, %rdi
00000000001c968e	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c9693	movss	-0xc(%rbp), %xmm0
00000000001c9698	movss	%xmm0, 0x1e0(%rbx)
00000000001c96a0	addq	$0x8, %rsp
00000000001c96a4	popq	%rbx
00000000001c96a5	popq	%rbp
00000000001c96a6	retq
00000000001c96a7	nopw	(%rax,%rax)
