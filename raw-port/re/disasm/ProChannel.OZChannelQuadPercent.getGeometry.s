__ZN20OZChannelQuadPercent11getGeometryERK6CMTimeP6PCRectIdE:
00000000000a73ec	pushq	%rbp
00000000000a73ed	movq	%rsp, %rbp
00000000000a73f0	pushq	%r15
00000000000a73f2	pushq	%r14
00000000000a73f4	pushq	%rbx
00000000000a73f5	subq	$0x38, %rsp
00000000000a73f9	movq	%rdx, %rbx
00000000000a73fc	movq	%rsi, %r14
00000000000a73ff	movq	%rdi, %r15
00000000000a7402	addq	$0x110, %rdi                    ## imm = 0x110
00000000000a7409	xorpd	%xmm0, %xmm0
00000000000a740d	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000a7412	leaq	0x1a8(%r15), %rdi
00000000000a7419	xorpd	%xmm0, %xmm0
00000000000a741d	movq	%r14, %rsi
00000000000a7420	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000a7425	leaq	0x2d0(%r15), %rdi
00000000000a742c	xorpd	%xmm0, %xmm0
00000000000a7430	movq	%r14, %rsi
00000000000a7433	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000a7438	movapd	%xmm0, -0x50(%rbp)
00000000000a743d	leaq	0x368(%r15), %rdi
00000000000a7444	xorpd	%xmm0, %xmm0
00000000000a7448	movq	%r14, %rsi
00000000000a744b	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000a7450	movapd	%xmm0, -0x40(%rbp)
00000000000a7455	leaq	0x490(%r15), %rdi
00000000000a745c	xorpd	%xmm0, %xmm0
00000000000a7460	movq	%r14, %rsi
00000000000a7463	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000a7468	leaq	0x528(%r15), %rdi
00000000000a746f	xorpd	%xmm0, %xmm0
00000000000a7473	movq	%r14, %rsi
00000000000a7476	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000a747b	leaq	0x650(%r15), %rdi
00000000000a7482	xorpd	%xmm0, %xmm0
00000000000a7486	movq	%r14, %rsi
00000000000a7489	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000a748e	movapd	%xmm0, -0x30(%rbp)
00000000000a7493	addq	$0x6e8, %r15                    ## imm = 0x6E8
00000000000a749a	xorpd	%xmm0, %xmm0
00000000000a749e	movq	%r15, %rdi
00000000000a74a1	movq	%r14, %rsi
00000000000a74a4	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000a74a9	movapd	-0x30(%rbp), %xmm2
00000000000a74ae	unpcklpd	-0x40(%rbp), %xmm2              ## xmm2 = xmm2[0],mem[0]
00000000000a74b3	movapd	-0x50(%rbp), %xmm1
00000000000a74b8	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000000a74bc	movapd	%xmm2, %xmm0
00000000000a74c0	maxpd	%xmm1, %xmm0
00000000000a74c4	minpd	%xmm2, %xmm1
00000000000a74c8	movupd	%xmm1, (%rbx)
00000000000a74cc	subpd	%xmm1, %xmm0
00000000000a74d0	movupd	%xmm0, 0x10(%rbx)
00000000000a74d5	addq	$0x38, %rsp
00000000000a74d9	popq	%rbx
00000000000a74da	popq	%r14
00000000000a74dc	popq	%r15
00000000000a74de	popq	%rbp
00000000000a74df	retq
