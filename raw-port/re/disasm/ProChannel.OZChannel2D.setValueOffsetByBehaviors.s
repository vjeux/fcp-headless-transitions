__ZN11OZChannel2D25setValueOffsetByBehaviorsERK6CMTimedd:
0000000000047fbe	pushq	%rbp
0000000000047fbf	movq	%rsp, %rbp
0000000000047fc2	pushq	%r15
0000000000047fc4	pushq	%r14
0000000000047fc6	pushq	%r13
0000000000047fc8	pushq	%r12
0000000000047fca	pushq	%rbx
0000000000047fcb	subq	$0x38, %rsp
0000000000047fcf	movsd	%xmm1, -0x30(%rbp)
0000000000047fd4	movsd	%xmm0, -0x38(%rbp)
0000000000047fd9	movq	%rsi, %rbx
0000000000047fdc	movq	%rdi, %r14
0000000000047fdf	leaq	0x88(%rdi), %r15
0000000000047fe6	xorpd	%xmm0, %xmm0
0000000000047fea	movq	%r15, %rdi
0000000000047fed	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000047ff2	movsd	-0x38(%rbp), %xmm1
0000000000047ff7	subsd	%xmm0, %xmm1
0000000000047ffb	movsd	%xmm1, -0x38(%rbp)
0000000000048000	leaq	0x120(%r14), %r12
0000000000048007	xorpd	%xmm0, %xmm0
000000000004800b	movq	%r12, %rdi
000000000004800e	movq	%rbx, %rsi
0000000000048011	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000048016	movsd	-0x30(%rbp), %xmm1
000000000004801b	subsd	%xmm0, %xmm1
000000000004801f	movsd	%xmm1, -0x30(%rbp)
0000000000048024	leaq	-0x58(%rbp), %r13
0000000000048028	movq	%r13, %rdi
000000000004802b	movq	%r15, %rsi
000000000004802e	movq	%rbx, %rdx
0000000000048031	callq	__ZNK13OZChannelBase17globalToLocalTimeERK6CMTime ## OZChannelBase::globalToLocalTime(CMTime const&) const
0000000000048036	movq	%r15, %rdi
0000000000048039	movq	%r13, %rsi
000000000004803c	xorl	%edx, %edx
000000000004803e	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000048043	movsd	%xmm0, -0x40(%rbp)
0000000000048048	movq	%r13, %rdi
000000000004804b	movq	%r12, %rsi
000000000004804e	movq	%rbx, %rdx
0000000000048051	callq	__ZNK13OZChannelBase17globalToLocalTimeERK6CMTime ## OZChannelBase::globalToLocalTime(CMTime const&) const
0000000000048056	movq	%r12, %rdi
0000000000048059	movq	%r13, %rsi
000000000004805c	xorl	%edx, %edx
000000000004805e	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000048063	movapd	%xmm0, %xmm1
0000000000048067	movsd	-0x40(%rbp), %xmm0
000000000004806c	addsd	-0x38(%rbp), %xmm0
0000000000048071	addsd	-0x30(%rbp), %xmm1
0000000000048076	movsd	%xmm1, -0x30(%rbp)
000000000004807b	movq	0x88(%r14), %rax
0000000000048082	movq	%r15, %rdi
0000000000048085	movq	%rbx, %rsi
0000000000048088	xorl	%edx, %edx
000000000004808a	callq	*0x2c8(%rax)
0000000000048090	movq	0x120(%r14), %rax
0000000000048097	movq	%r12, %rdi
000000000004809a	movq	%rbx, %rsi
000000000004809d	movsd	-0x30(%rbp), %xmm0
00000000000480a2	xorl	%edx, %edx
00000000000480a4	callq	*0x2c8(%rax)
00000000000480aa	addq	$0x38, %rsp
00000000000480ae	popq	%rbx
00000000000480af	popq	%r12
00000000000480b1	popq	%r13
00000000000480b3	popq	%r14
00000000000480b5	popq	%r15
00000000000480b7	popq	%rbp
00000000000480b8	retq
00000000000480b9	nop
