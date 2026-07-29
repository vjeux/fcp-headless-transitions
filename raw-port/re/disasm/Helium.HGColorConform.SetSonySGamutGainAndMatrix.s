__ZN14HGColorConform26SetSonySGamutGainAndMatrixEfb:
00000000001c9e10	pushq	%rbp
00000000001c9e11	movq	%rsp, %rbp
00000000001c9e14	pushq	%r14
00000000001c9e16	pushq	%rbx
00000000001c9e17	subq	$0x10, %rsp
00000000001c9e1b	movl	%esi, %ebx
00000000001c9e1d	movq	%rdi, %r14
00000000001c9e20	movss	0x34c(%rdi), %xmm1
00000000001c9e28	ucomiss	%xmm0, %xmm1
00000000001c9e2b	jne	0x1c9e2f
00000000001c9e2d	jnp	0x1c9e4a
00000000001c9e2f	movq	%r14, %rdi
00000000001c9e32	movss	%xmm0, -0x14(%rbp)
00000000001c9e37	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c9e3c	movss	-0x14(%rbp), %xmm0
00000000001c9e41	movss	%xmm0, 0x34c(%r14)
00000000001c9e4a	cmpb	%bl, 0x350(%r14)
00000000001c9e51	je	0x1c9e62
00000000001c9e53	movq	%r14, %rdi
00000000001c9e56	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c9e5b	movb	%bl, 0x350(%r14)
00000000001c9e62	addq	$0x10, %rsp
00000000001c9e66	popq	%rbx
00000000001c9e67	popq	%r14
00000000001c9e69	popq	%rbp
00000000001c9e6a	retq
00000000001c9e6b	nopl	(%rax,%rax)
