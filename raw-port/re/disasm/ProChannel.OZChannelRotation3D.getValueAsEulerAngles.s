__ZNK19OZChannelRotation3D21getValueAsEulerAnglesERK6CMTimeP9PCVector3IdEd:
0000000000082684	pushq	%rbp
0000000000082685	movq	%rsp, %rbp
0000000000082688	pushq	%r15
000000000008268a	pushq	%r14
000000000008268c	pushq	%rbx
000000000008268d	subq	$0x18, %rsp
0000000000082691	movsd	%xmm0, -0x20(%rbp)
0000000000082696	movq	%rdx, %rbx
0000000000082699	movq	%rsi, %r14
000000000008269c	movq	%rdi, %r15
000000000008269f	addq	$0x88, %rdi
00000000000826a6	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000826ab	movsd	%xmm0, -0x30(%rbp)
00000000000826b0	leaq	0x120(%r15), %rdi
00000000000826b7	movq	%r14, %rsi
00000000000826ba	movsd	-0x20(%rbp), %xmm0
00000000000826bf	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000826c4	movsd	%xmm0, -0x28(%rbp)
00000000000826c9	addq	$0x1b8, %r15                    ## imm = 0x1B8
00000000000826d0	movq	%r15, %rdi
00000000000826d3	movq	%r14, %rsi
00000000000826d6	movsd	-0x20(%rbp), %xmm0
00000000000826db	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000826e0	movsd	-0x30(%rbp), %xmm1
00000000000826e5	movsd	%xmm1, (%rbx)
00000000000826e9	movsd	-0x28(%rbp), %xmm1
00000000000826ee	movsd	%xmm1, 0x8(%rbx)
00000000000826f3	movsd	%xmm0, 0x10(%rbx)
00000000000826f8	addq	$0x18, %rsp
00000000000826fc	popq	%rbx
00000000000826fd	popq	%r14
00000000000826ff	popq	%r15
0000000000082701	popq	%rbp
0000000000082702	retq
0000000000082703	nop
