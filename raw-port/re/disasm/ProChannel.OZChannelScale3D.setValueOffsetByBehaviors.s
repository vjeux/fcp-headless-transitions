__ZN16OZChannelScale3D25setValueOffsetByBehaviorsERK6CMTimeddd:
0000000000086e9c	pushq	%rbp
0000000000086e9d	movq	%rsp, %rbp
0000000000086ea0	pushq	%r15
0000000000086ea2	pushq	%r14
0000000000086ea4	pushq	%r13
0000000000086ea6	pushq	%r12
0000000000086ea8	pushq	%rbx
0000000000086ea9	subq	$0xb8, %rsp
0000000000086eb0	movsd	%xmm2, -0x30(%rbp)
0000000000086eb5	movsd	%xmm1, -0x68(%rbp)
0000000000086eba	movsd	%xmm0, -0x60(%rbp)
0000000000086ebf	movq	%rsi, %rbx
0000000000086ec2	movq	%rdi, %r14
0000000000086ec5	leaq	0x88(%rdi), %r12
0000000000086ecc	xorpd	%xmm0, %xmm0
0000000000086ed0	movq	%r12, %rdi
0000000000086ed3	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000086ed8	movsd	-0x60(%rbp), %xmm1
0000000000086edd	subsd	%xmm0, %xmm1
0000000000086ee1	movsd	%xmm1, -0x60(%rbp)
0000000000086ee6	leaq	0x120(%r14), %rdi
0000000000086eed	movq	%rdi, -0x70(%rbp)
0000000000086ef1	xorpd	%xmm0, %xmm0
0000000000086ef5	movq	%rbx, %rsi
0000000000086ef8	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000086efd	movsd	-0x68(%rbp), %xmm1
0000000000086f02	subsd	%xmm0, %xmm1
0000000000086f06	movsd	%xmm1, -0x68(%rbp)
0000000000086f0b	leaq	0x1b8(%r14), %r13
0000000000086f12	xorpd	%xmm0, %xmm0
0000000000086f16	movq	%r13, %rdi
0000000000086f19	movq	%rbx, %rsi
0000000000086f1c	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000086f21	movsd	-0x30(%rbp), %xmm1
0000000000086f26	subsd	%xmm0, %xmm1
0000000000086f2a	movsd	%xmm1, -0x30(%rbp)
0000000000086f2f	leaq	-0x98(%rbp), %r15
0000000000086f36	movq	%r15, %rdi
0000000000086f39	movq	%r12, -0x80(%rbp)
0000000000086f3d	movq	%r12, %rsi
0000000000086f40	callq	__ZNK13OZChannelBase13getTimeOffsetEv ## OZChannelBase::getTimeOffset() const
0000000000086f45	movq	0x10(%rbx), %rax
0000000000086f49	movq	%rax, -0x40(%rbp)
0000000000086f4d	movups	(%rbx), %xmm0
0000000000086f50	movaps	%xmm0, -0x50(%rbp)
0000000000086f54	movq	0x10(%r15), %rax
0000000000086f58	movq	%rax, 0x28(%rsp)
0000000000086f5d	movups	(%r15), %xmm0
0000000000086f61	movups	%xmm0, 0x18(%rsp)
0000000000086f66	movq	-0x40(%rbp), %rax
0000000000086f6a	movq	%rax, 0x10(%rsp)
0000000000086f6f	movaps	-0x50(%rbp), %xmm0
0000000000086f73	movups	%xmm0, (%rsp)
0000000000086f77	leaq	-0xb0(%rbp), %r15
0000000000086f7e	movq	%r15, %rdi
0000000000086f81	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000086f86	movq	%r12, %rdi
0000000000086f89	movq	%r15, %rsi
0000000000086f8c	xorl	%edx, %edx
0000000000086f8e	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000086f93	movsd	%xmm0, -0x78(%rbp)
0000000000086f98	leaq	-0x98(%rbp), %r15
0000000000086f9f	movq	%r15, %rdi
0000000000086fa2	movq	-0x70(%rbp), %r12
0000000000086fa6	movq	%r12, %rsi
0000000000086fa9	callq	__ZNK13OZChannelBase13getTimeOffsetEv ## OZChannelBase::getTimeOffset() const
0000000000086fae	movq	0x10(%rbx), %rax
0000000000086fb2	movq	%rax, -0x40(%rbp)
0000000000086fb6	movups	(%rbx), %xmm0
0000000000086fb9	movaps	%xmm0, -0x50(%rbp)
0000000000086fbd	movq	0x10(%r15), %rax
0000000000086fc1	movq	%rax, 0x28(%rsp)
0000000000086fc6	movups	(%r15), %xmm0
0000000000086fca	movups	%xmm0, 0x18(%rsp)
0000000000086fcf	movq	-0x40(%rbp), %rax
0000000000086fd3	movq	%rax, 0x10(%rsp)
0000000000086fd8	movaps	-0x50(%rbp), %xmm0
0000000000086fdc	movups	%xmm0, (%rsp)
0000000000086fe0	leaq	-0xb0(%rbp), %r15
0000000000086fe7	movq	%r15, %rdi
0000000000086fea	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000086fef	movq	%r12, %rdi
0000000000086ff2	movq	%r15, %rsi
0000000000086ff5	xorl	%edx, %edx
0000000000086ff7	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000086ffc	movsd	%xmm0, -0x58(%rbp)
0000000000087001	leaq	-0x98(%rbp), %r15
0000000000087008	movq	%r15, %rdi
000000000008700b	movq	%r13, %rsi
000000000008700e	callq	__ZNK13OZChannelBase13getTimeOffsetEv ## OZChannelBase::getTimeOffset() const
0000000000087013	movq	0x10(%rbx), %rax
0000000000087017	movq	%rax, -0x40(%rbp)
000000000008701b	movups	(%rbx), %xmm0
000000000008701e	movaps	%xmm0, -0x50(%rbp)
0000000000087022	movq	0x10(%r15), %rax
0000000000087026	movq	%rax, 0x28(%rsp)
000000000008702b	movups	(%r15), %xmm0
000000000008702f	movups	%xmm0, 0x18(%rsp)
0000000000087034	movq	-0x40(%rbp), %rax
0000000000087038	movq	%rax, 0x10(%rsp)
000000000008703d	movapd	-0x50(%rbp), %xmm0
0000000000087042	movupd	%xmm0, (%rsp)
0000000000087047	leaq	-0xb0(%rbp), %r15
000000000008704e	movq	%r15, %rdi
0000000000087051	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000087056	movq	%r13, %rdi
0000000000087059	movq	%r15, %rsi
000000000008705c	xorl	%edx, %edx
000000000008705e	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000087063	movapd	%xmm0, %xmm2
0000000000087067	movsd	-0x78(%rbp), %xmm0
000000000008706c	addsd	-0x60(%rbp), %xmm0
0000000000087071	movsd	-0x58(%rbp), %xmm1
0000000000087076	addsd	-0x68(%rbp), %xmm1
000000000008707b	movsd	%xmm1, -0x58(%rbp)
0000000000087080	addsd	-0x30(%rbp), %xmm2
0000000000087085	movsd	%xmm2, -0x30(%rbp)
000000000008708a	movq	0x88(%r14), %rax
0000000000087091	movq	-0x80(%rbp), %rdi
0000000000087095	movq	%rbx, %rsi
0000000000087098	xorl	%edx, %edx
000000000008709a	callq	*0x2c8(%rax)
00000000000870a0	movq	0x120(%r14), %rax
00000000000870a7	movq	%r12, %rdi
00000000000870aa	movq	%rbx, %rsi
00000000000870ad	movsd	-0x58(%rbp), %xmm0
00000000000870b2	xorl	%edx, %edx
00000000000870b4	callq	*0x2c8(%rax)
00000000000870ba	movq	0x1b8(%r14), %rax
00000000000870c1	movq	%r13, %rdi
00000000000870c4	movq	%rbx, %rsi
00000000000870c7	movsd	-0x30(%rbp), %xmm0
00000000000870cc	xorl	%edx, %edx
00000000000870ce	callq	*0x2c8(%rax)
00000000000870d4	addq	$0xb8, %rsp
00000000000870db	popq	%rbx
00000000000870dc	popq	%r12
00000000000870de	popq	%r13
00000000000870e0	popq	%r14
00000000000870e2	popq	%r15
00000000000870e4	popq	%rbp
00000000000870e5	retq
