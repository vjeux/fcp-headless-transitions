__ZN11OZChannel3D25setValueOffsetByBehaviorsERK6CMTimeddd:
0000000000049274	pushq	%rbp
0000000000049275	movq	%rsp, %rbp
0000000000049278	pushq	%r15
000000000004927a	pushq	%r14
000000000004927c	pushq	%r13
000000000004927e	pushq	%r12
0000000000049280	pushq	%rbx
0000000000049281	subq	$0xb8, %rsp
0000000000049288	movsd	%xmm2, -0x30(%rbp)
000000000004928d	movsd	%xmm1, -0x68(%rbp)
0000000000049292	movsd	%xmm0, -0x60(%rbp)
0000000000049297	movq	%rsi, %rbx
000000000004929a	movq	%rdi, %r14
000000000004929d	leaq	0x88(%rdi), %r12
00000000000492a4	xorpd	%xmm0, %xmm0
00000000000492a8	movq	%r12, %rdi
00000000000492ab	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000492b0	movsd	-0x60(%rbp), %xmm1
00000000000492b5	subsd	%xmm0, %xmm1
00000000000492b9	movsd	%xmm1, -0x60(%rbp)
00000000000492be	leaq	0x120(%r14), %rdi
00000000000492c5	movq	%rdi, -0x70(%rbp)
00000000000492c9	xorpd	%xmm0, %xmm0
00000000000492cd	movq	%rbx, %rsi
00000000000492d0	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000492d5	movsd	-0x68(%rbp), %xmm1
00000000000492da	subsd	%xmm0, %xmm1
00000000000492de	movsd	%xmm1, -0x68(%rbp)
00000000000492e3	leaq	0x1b8(%r14), %r13
00000000000492ea	xorpd	%xmm0, %xmm0
00000000000492ee	movq	%r13, %rdi
00000000000492f1	movq	%rbx, %rsi
00000000000492f4	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000492f9	movsd	-0x30(%rbp), %xmm1
00000000000492fe	subsd	%xmm0, %xmm1
0000000000049302	movsd	%xmm1, -0x30(%rbp)
0000000000049307	leaq	-0x98(%rbp), %r15
000000000004930e	movq	%r15, %rdi
0000000000049311	movq	%r12, -0x80(%rbp)
0000000000049315	movq	%r12, %rsi
0000000000049318	callq	__ZNK13OZChannelBase13getTimeOffsetEv ## OZChannelBase::getTimeOffset() const
000000000004931d	movq	0x10(%rbx), %rax
0000000000049321	movq	%rax, -0x40(%rbp)
0000000000049325	movups	(%rbx), %xmm0
0000000000049328	movaps	%xmm0, -0x50(%rbp)
000000000004932c	movq	0x10(%r15), %rax
0000000000049330	movq	%rax, 0x28(%rsp)
0000000000049335	movups	(%r15), %xmm0
0000000000049339	movups	%xmm0, 0x18(%rsp)
000000000004933e	movq	-0x40(%rbp), %rax
0000000000049342	movq	%rax, 0x10(%rsp)
0000000000049347	movaps	-0x50(%rbp), %xmm0
000000000004934b	movups	%xmm0, (%rsp)
000000000004934f	leaq	-0xb0(%rbp), %r15
0000000000049356	movq	%r15, %rdi
0000000000049359	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000004935e	movq	%r12, %rdi
0000000000049361	movq	%r15, %rsi
0000000000049364	xorl	%edx, %edx
0000000000049366	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
000000000004936b	movsd	%xmm0, -0x78(%rbp)
0000000000049370	leaq	-0x98(%rbp), %r15
0000000000049377	movq	%r15, %rdi
000000000004937a	movq	-0x70(%rbp), %r12
000000000004937e	movq	%r12, %rsi
0000000000049381	callq	__ZNK13OZChannelBase13getTimeOffsetEv ## OZChannelBase::getTimeOffset() const
0000000000049386	movq	0x10(%rbx), %rax
000000000004938a	movq	%rax, -0x40(%rbp)
000000000004938e	movups	(%rbx), %xmm0
0000000000049391	movaps	%xmm0, -0x50(%rbp)
0000000000049395	movq	0x10(%r15), %rax
0000000000049399	movq	%rax, 0x28(%rsp)
000000000004939e	movups	(%r15), %xmm0
00000000000493a2	movups	%xmm0, 0x18(%rsp)
00000000000493a7	movq	-0x40(%rbp), %rax
00000000000493ab	movq	%rax, 0x10(%rsp)
00000000000493b0	movaps	-0x50(%rbp), %xmm0
00000000000493b4	movups	%xmm0, (%rsp)
00000000000493b8	leaq	-0xb0(%rbp), %r15
00000000000493bf	movq	%r15, %rdi
00000000000493c2	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000493c7	movq	%r12, %rdi
00000000000493ca	movq	%r15, %rsi
00000000000493cd	xorl	%edx, %edx
00000000000493cf	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
00000000000493d4	movsd	%xmm0, -0x58(%rbp)
00000000000493d9	leaq	-0x98(%rbp), %r15
00000000000493e0	movq	%r15, %rdi
00000000000493e3	movq	%r13, %rsi
00000000000493e6	callq	__ZNK13OZChannelBase13getTimeOffsetEv ## OZChannelBase::getTimeOffset() const
00000000000493eb	movq	0x10(%rbx), %rax
00000000000493ef	movq	%rax, -0x40(%rbp)
00000000000493f3	movups	(%rbx), %xmm0
00000000000493f6	movaps	%xmm0, -0x50(%rbp)
00000000000493fa	movq	0x10(%r15), %rax
00000000000493fe	movq	%rax, 0x28(%rsp)
0000000000049403	movups	(%r15), %xmm0
0000000000049407	movups	%xmm0, 0x18(%rsp)
000000000004940c	movq	-0x40(%rbp), %rax
0000000000049410	movq	%rax, 0x10(%rsp)
0000000000049415	movapd	-0x50(%rbp), %xmm0
000000000004941a	movupd	%xmm0, (%rsp)
000000000004941f	leaq	-0xb0(%rbp), %r15
0000000000049426	movq	%r15, %rdi
0000000000049429	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000004942e	movq	%r13, %rdi
0000000000049431	movq	%r15, %rsi
0000000000049434	xorl	%edx, %edx
0000000000049436	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
000000000004943b	movapd	%xmm0, %xmm2
000000000004943f	movsd	-0x78(%rbp), %xmm0
0000000000049444	addsd	-0x60(%rbp), %xmm0
0000000000049449	movsd	-0x58(%rbp), %xmm1
000000000004944e	addsd	-0x68(%rbp), %xmm1
0000000000049453	movsd	%xmm1, -0x58(%rbp)
0000000000049458	addsd	-0x30(%rbp), %xmm2
000000000004945d	movsd	%xmm2, -0x30(%rbp)
0000000000049462	movq	0x88(%r14), %rax
0000000000049469	movq	-0x80(%rbp), %rdi
000000000004946d	movq	%rbx, %rsi
0000000000049470	xorl	%edx, %edx
0000000000049472	callq	*0x2c8(%rax)
0000000000049478	movq	0x120(%r14), %rax
000000000004947f	movq	%r12, %rdi
0000000000049482	movq	%rbx, %rsi
0000000000049485	movsd	-0x58(%rbp), %xmm0
000000000004948a	xorl	%edx, %edx
000000000004948c	callq	*0x2c8(%rax)
0000000000049492	movq	0x1b8(%r14), %rax
0000000000049499	movq	%r13, %rdi
000000000004949c	movq	%rbx, %rsi
000000000004949f	movsd	-0x30(%rbp), %xmm0
00000000000494a4	xorl	%edx, %edx
00000000000494a6	callq	*0x2c8(%rax)
00000000000494ac	addq	$0xb8, %rsp
00000000000494b3	popq	%rbx
00000000000494b4	popq	%r12
00000000000494b6	popq	%r13
00000000000494b8	popq	%r14
00000000000494ba	popq	%r15
00000000000494bc	popq	%rbp
00000000000494bd	retq
