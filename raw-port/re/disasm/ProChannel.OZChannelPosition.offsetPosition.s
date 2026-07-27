__ZN17OZChannelPosition14offsetPositionERK6CMTimeddb:
00000000000741f4	pushq	%rbp
00000000000741f5	movq	%rsp, %rbp
00000000000741f8	pushq	%r15
00000000000741fa	pushq	%r14
00000000000741fc	pushq	%r13
00000000000741fe	pushq	%r12
0000000000074200	pushq	%rbx
0000000000074201	subq	$0x38, %rsp
0000000000074205	movl	%edx, %ebx
0000000000074207	movsd	%xmm1, -0x40(%rbp)
000000000007420c	movsd	%xmm0, -0x38(%rbp)
0000000000074211	movq	%rsi, %r14
0000000000074214	movq	%rdi, %r15
0000000000074217	leaq	0x88(%rdi), %r12
000000000007421e	leaq	-0x58(%rbp), %r13
0000000000074222	movq	%r13, %rdi
0000000000074225	movq	%r12, %rsi
0000000000074228	movq	%r14, %rdx
000000000007422b	callq	__ZNK13OZChannelBase17globalToLocalTimeERK6CMTime ## OZChannelBase::globalToLocalTime(CMTime const&) const
0000000000074230	movq	%r12, %rdi
0000000000074233	movq	%r13, %rsi
0000000000074236	xorl	%edx, %edx
0000000000074238	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
000000000007423d	movsd	%xmm0, -0x30(%rbp)
0000000000074242	leaq	0x120(%r15), %r12
0000000000074249	movq	%r13, %rdi
000000000007424c	movq	%r12, %rsi
000000000007424f	movq	%r14, %rdx
0000000000074252	callq	__ZNK13OZChannelBase17globalToLocalTimeERK6CMTime ## OZChannelBase::globalToLocalTime(CMTime const&) const
0000000000074257	movq	%r12, %rdi
000000000007425a	movq	%r13, %rsi
000000000007425d	xorl	%edx, %edx
000000000007425f	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000074264	movsd	-0x30(%rbp), %xmm2
0000000000074269	addsd	-0x38(%rbp), %xmm2
000000000007426e	movsd	-0x40(%rbp), %xmm1
0000000000074273	addsd	%xmm0, %xmm1
0000000000074277	movq	%r15, %rdi
000000000007427a	movq	%r14, %rsi
000000000007427d	movapd	%xmm2, %xmm0
0000000000074281	movl	%ebx, %edx
0000000000074283	callq	__ZN11OZChannel2D8setValueERK6CMTimeddb ## OZChannel2D::setValue(CMTime const&, double, double, bool)
0000000000074288	addq	$0x38, %rsp
000000000007428c	popq	%rbx
000000000007428d	popq	%r12
000000000007428f	popq	%r13
0000000000074291	popq	%r14
0000000000074293	popq	%r15
0000000000074295	popq	%rbp
0000000000074296	retq
0000000000074297	nop
