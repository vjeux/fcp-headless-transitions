__ZN17OZChannelPosition11setPositionERK6CMTimeddb:
000000000007417e	pushq	%rbp
000000000007417f	movq	%rsp, %rbp
0000000000074182	pushq	%r15
0000000000074184	pushq	%r14
0000000000074186	pushq	%rbx
0000000000074187	subq	$0x18, %rsp
000000000007418b	movl	%edx, %ebx
000000000007418d	movsd	%xmm1, -0x30(%rbp)
0000000000074192	movsd	%xmm0, -0x28(%rbp)
0000000000074197	movq	%rsi, %r14
000000000007419a	movq	%rdi, %r15
000000000007419d	addq	$0x88, %rdi
00000000000741a4	xorpd	%xmm0, %xmm0
00000000000741a8	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000741ad	movsd	%xmm0, -0x20(%rbp)
00000000000741b2	leaq	0x120(%r15), %rdi
00000000000741b9	xorpd	%xmm0, %xmm0
00000000000741bd	movq	%r14, %rsi
00000000000741c0	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000741c5	movsd	-0x28(%rbp), %xmm2
00000000000741ca	subsd	-0x20(%rbp), %xmm2
00000000000741cf	movsd	-0x30(%rbp), %xmm1
00000000000741d4	subsd	%xmm0, %xmm1
00000000000741d8	movq	%r15, %rdi
00000000000741db	movq	%r14, %rsi
00000000000741de	movapd	%xmm2, %xmm0
00000000000741e2	movl	%ebx, %edx
00000000000741e4	addq	$0x18, %rsp
00000000000741e8	popq	%rbx
00000000000741e9	popq	%r14
00000000000741eb	popq	%r15
00000000000741ed	popq	%rbp
00000000000741ee	jmp	__ZN17OZChannelPosition14offsetPositionERK6CMTimeddb ## OZChannelPosition::offsetPosition(CMTime const&, double, double, bool)
00000000000741f3	nop
