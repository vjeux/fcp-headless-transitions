__ZN19OZChannelRotation3D8setValueEP9OZChannelRK6CMTimed:
000000000008186a	pushq	%rbp
000000000008186b	movq	%rsp, %rbp
000000000008186e	pushq	%r15
0000000000081870	pushq	%r14
0000000000081872	pushq	%r13
0000000000081874	pushq	%r12
0000000000081876	pushq	%rbx
0000000000081877	subq	$0x38, %rsp
000000000008187b	movsd	%xmm0, -0x30(%rbp)
0000000000081880	movq	%rdx, %r14
0000000000081883	movq	%rsi, %r15
0000000000081886	movq	%rdi, %rbx
0000000000081889	movl	$0x100000, %esi                 ## imm = 0x100000
000000000008188e	callq	__ZNK15OZChannelFolder12testFoldFlagEj ## OZChannelFolder::testFoldFlag(unsigned int) const
0000000000081893	testb	%al, %al
0000000000081895	je	0x818ee
0000000000081897	movq	%rbx, %rdi
000000000008189a	movl	$0x100000, %esi                 ## imm = 0x100000
000000000008189f	callq	__ZN15OZChannelFolder13resetFoldFlagEj ## OZChannelFolder::resetFoldFlag(unsigned int)
00000000000818a4	leaq	0x88(%rbx), %r12
00000000000818ab	cmpq	%r15, %r12
00000000000818ae	setne	%al
00000000000818b1	leaq	0x120(%rbx), %rdx
00000000000818b8	cmpq	%r15, %rdx
00000000000818bb	setne	%cl
00000000000818be	andb	%al, %cl
00000000000818c0	leaq	0x1b8(%rbx), %r13
00000000000818c7	cmpq	%r15, %r13
00000000000818ca	setne	%al
00000000000818cd	andb	%cl, %al
00000000000818cf	cmpb	$0x1, %al
00000000000818d1	jne	0x81915
00000000000818d3	movq	(%r15), %rax
00000000000818d6	movq	%r15, %rdi
00000000000818d9	movq	%r14, %rsi
00000000000818dc	movsd	-0x30(%rbp), %xmm0
00000000000818e1	xorl	%edx, %edx
00000000000818e3	callq	*0x2c8(%rax)
00000000000818e9	jmp	0x819ea
00000000000818ee	movq	(%r15), %rax
00000000000818f1	movq	0x2c8(%rax), %rax
00000000000818f8	movq	%r15, %rdi
00000000000818fb	movq	%r14, %rsi
00000000000818fe	movsd	-0x30(%rbp), %xmm0
0000000000081903	xorl	%edx, %edx
0000000000081905	addq	$0x38, %rsp
0000000000081909	popq	%rbx
000000000008190a	popq	%r12
000000000008190c	popq	%r13
000000000008190e	popq	%r14
0000000000081910	popq	%r15
0000000000081912	popq	%rbp
0000000000081913	jmpq	*%rax
0000000000081915	xorps	%xmm0, %xmm0
0000000000081918	movq	%r13, -0x38(%rbp)
000000000008191c	movq	%rdx, %r13
000000000008191f	movq	%r12, %rdi
0000000000081922	movq	%r14, %rsi
0000000000081925	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000008192a	movsd	%xmm0, -0x40(%rbp)
000000000008192f	xorps	%xmm0, %xmm0
0000000000081932	movq	%r13, -0x58(%rbp)
0000000000081936	movq	%r13, %rdi
0000000000081939	movq	%r14, %rsi
000000000008193c	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000081941	movsd	%xmm0, -0x48(%rbp)
0000000000081946	xorps	%xmm0, %xmm0
0000000000081949	movq	-0x38(%rbp), %rdi
000000000008194d	movq	%r14, %rsi
0000000000081950	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000081955	movsd	%xmm0, -0x50(%rbp)
000000000008195a	leaq	0x250(%rbx), %r13
0000000000081961	movq	0x48b58(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000081968	xorps	%xmm0, %xmm0
000000000008196b	movq	%r13, %rdi
000000000008196e	movl	$0x1, %edx
0000000000081973	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000081978	movsd	-0x30(%rbp), %xmm0
000000000008197d	cmpq	%r15, %r12
0000000000081980	je	0x81987
0000000000081982	movsd	-0x40(%rbp), %xmm0
0000000000081987	movq	%r12, %rdi
000000000008198a	movq	%r14, %rsi
000000000008198d	xorl	%edx, %edx
000000000008198f	callq	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
0000000000081994	movsd	-0x30(%rbp), %xmm0
0000000000081999	movq	-0x58(%rbp), %rdi
000000000008199d	cmpq	%r15, %rdi
00000000000819a0	je	0x819a7
00000000000819a2	movsd	-0x48(%rbp), %xmm0
00000000000819a7	movq	%r14, %rsi
00000000000819aa	xorl	%edx, %edx
00000000000819ac	callq	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
00000000000819b1	movq	-0x38(%rbp), %rdi
00000000000819b5	cmpq	%r15, %rdi
00000000000819b8	movsd	-0x30(%rbp), %xmm0
00000000000819bd	je	0x819c4
00000000000819bf	movsd	-0x50(%rbp), %xmm0
00000000000819c4	movq	%r14, %rsi
00000000000819c7	xorl	%edx, %edx
00000000000819c9	callq	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
00000000000819ce	movsd	0x2db52(%rip), %xmm0
00000000000819d6	movq	%r13, %rdi
00000000000819d9	movq	0x48ae0(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
00000000000819e0	movl	$0x1, %edx
00000000000819e5	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
00000000000819ea	movq	%rbx, %rdi
00000000000819ed	movl	$0x100000, %esi                 ## imm = 0x100000
00000000000819f2	addq	$0x38, %rsp
00000000000819f6	popq	%rbx
00000000000819f7	popq	%r12
00000000000819f9	popq	%r13
00000000000819fb	popq	%r14
00000000000819fd	popq	%r15
00000000000819ff	popq	%rbp
0000000000081a00	jmp	__ZN15OZChannelFolder11setFoldFlagEj ## OZChannelFolder::setFoldFlag(unsigned int)
0000000000081a05	nop
