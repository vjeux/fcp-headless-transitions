__ZN24OZChannelHistogramSampleC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjj:
0000000000070d62	pushq	%rbp
0000000000070d63	movq	%rsp, %rbp
0000000000070d66	pushq	%r15
0000000000070d68	pushq	%r14
0000000000070d6a	pushq	%r13
0000000000070d6c	pushq	%r12
0000000000070d6e	pushq	%rbx
0000000000070d6f	subq	$0x28, %rsp
0000000000070d73	movq	%rdi, %rbx
0000000000070d76	movl	0x10(%rbp), %eax
0000000000070d79	movl	%eax, 0x8(%rsp)
0000000000070d7d	movl	$0x0, (%rsp)
0000000000070d84	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
0000000000070d89	leaq	0x6bac0(%rip), %rax
0000000000070d90	movq	%rax, (%rbx)
0000000000070d93	leaq	0x6bdee(%rip), %rax
0000000000070d9a	movq	%rax, 0x10(%rbx)
0000000000070d9e	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000070da3	leaq	0x74a86(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000070daa	leaq	-0x30(%rbp), %rdi
0000000000070dae	movq	%rax, %rdx
0000000000070db1	xorl	%ecx, %ecx
0000000000070db3	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000070db8	leaq	0x88(%rbx), %rdi
0000000000070dbf	movq	$0x0, (%rsp)
0000000000070dc7	leaq	-0x30(%rbp), %rsi
0000000000070dcb	xorps	%xmm0, %xmm0
0000000000070dce	movq	%rdi, -0x40(%rbp)
0000000000070dd2	movq	%rbx, %rdx
0000000000070dd5	movl	$0x1, %ecx
0000000000070dda	xorl	%r8d, %r8d
0000000000070ddd	xorl	%r9d, %r9d
0000000000070de0	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000070de5	leaq	-0x30(%rbp), %rdi
0000000000070de9	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070dee	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000070df3	leaq	0x74a56(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000070dfa	leaq	-0x30(%rbp), %rdi
0000000000070dfe	movq	%rax, %rdx
0000000000070e01	xorl	%ecx, %ecx
0000000000070e03	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000070e08	leaq	0x120(%rbx), %r15
0000000000070e0f	movq	$0x0, (%rsp)
0000000000070e17	leaq	-0x30(%rbp), %rsi
0000000000070e1b	xorps	%xmm0, %xmm0
0000000000070e1e	movq	%r15, %rdi
0000000000070e21	movq	%rbx, %rdx
0000000000070e24	movl	$0x2, %ecx
0000000000070e29	xorl	%r8d, %r8d
0000000000070e2c	xorl	%r9d, %r9d
0000000000070e2f	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000070e34	leaq	-0x30(%rbp), %rdi
0000000000070e38	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070e3d	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000070e42	leaq	0x74a27(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000070e49	leaq	-0x30(%rbp), %rdi
0000000000070e4d	movq	%rax, %rdx
0000000000070e50	xorl	%ecx, %ecx
0000000000070e52	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000070e57	leaq	0x1b8(%rbx), %r12
0000000000070e5e	movq	$0x0, (%rsp)
0000000000070e66	movsd	0x3e6ba(%rip), %xmm0
0000000000070e6e	leaq	-0x30(%rbp), %rsi
0000000000070e72	movq	%r12, %rdi
0000000000070e75	movq	%rbx, %rdx
0000000000070e78	movl	$0x3, %ecx
0000000000070e7d	xorl	%r8d, %r8d
0000000000070e80	xorl	%r9d, %r9d
0000000000070e83	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000070e88	leaq	-0x30(%rbp), %rdi
0000000000070e8c	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070e91	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000070e96	leaq	0x749f3(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000070e9d	leaq	-0x30(%rbp), %rdi
0000000000070ea1	movq	%rax, %rdx
0000000000070ea4	xorl	%ecx, %ecx
0000000000070ea6	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000070eab	leaq	0x250(%rbx), %r13
0000000000070eb2	movq	$0x0, (%rsp)
0000000000070eba	movsd	0x3e666(%rip), %xmm0
0000000000070ec2	leaq	-0x30(%rbp), %rsi
0000000000070ec6	movq	%r13, %rdi
0000000000070ec9	movq	%rbx, %rdx
0000000000070ecc	movl	$0x4, %ecx
0000000000070ed1	xorl	%r8d, %r8d
0000000000070ed4	xorl	%r9d, %r9d
0000000000070ed7	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000070edc	leaq	-0x30(%rbp), %rdi
0000000000070ee0	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070ee5	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000070eea	leaq	0x749bf(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000070ef1	leaq	-0x30(%rbp), %rdi
0000000000070ef5	movq	%rax, %rdx
0000000000070ef8	xorl	%ecx, %ecx
0000000000070efa	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000070eff	leaq	0x2e8(%rbx), %r14
0000000000070f06	movq	$0x0, (%rsp)
0000000000070f0e	movsd	0x3e612(%rip), %xmm0
0000000000070f16	leaq	-0x30(%rbp), %rsi
0000000000070f1a	movq	%r14, %rdi
0000000000070f1d	movq	%rbx, %rdx
0000000000070f20	movl	$0x5, %ecx
0000000000070f25	xorl	%r8d, %r8d
0000000000070f28	xorl	%r9d, %r9d
0000000000070f2b	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000070f30	leaq	-0x30(%rbp), %rdi
0000000000070f34	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070f39	movsd	0x3e5e7(%rip), %xmm0
0000000000070f41	movq	-0x40(%rbp), %rdi
0000000000070f45	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000070f4a	movsd	0x3e5d6(%rip), %xmm0
0000000000070f52	movq	%r15, %rdi
0000000000070f55	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000070f5a	movsd	0x3e5c6(%rip), %xmm0
0000000000070f62	movq	%r12, %rdi
0000000000070f65	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000070f6a	movsd	0x3e5b6(%rip), %xmm0
0000000000070f72	movq	%r13, %rdi
0000000000070f75	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000070f7a	movsd	0x405c6(%rip), %xmm0
0000000000070f82	movq	%r14, %rdi
0000000000070f85	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000070f8a	addq	$0x28, %rsp
0000000000070f8e	popq	%rbx
0000000000070f8f	popq	%r12
0000000000070f91	popq	%r13
0000000000070f93	popq	%r14
0000000000070f95	popq	%r15
0000000000070f97	popq	%rbp
0000000000070f98	retq
0000000000070f99	movq	%rax, -0x38(%rbp)
0000000000070f9d	leaq	-0x30(%rbp), %rdi
0000000000070fa1	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070fa6	jmp	0x7100e
0000000000070fa8	movq	%rax, -0x38(%rbp)
0000000000070fac	leaq	-0x30(%rbp), %rdi
0000000000070fb0	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070fb5	jmp	0x71016
0000000000070fb7	movq	%rax, -0x38(%rbp)
0000000000070fbb	leaq	-0x30(%rbp), %rdi
0000000000070fbf	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070fc4	jmp	0x7101e
0000000000070fc6	movq	%rax, -0x38(%rbp)
0000000000070fca	leaq	-0x30(%rbp), %rdi
0000000000070fce	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070fd3	jmp	0x71026
0000000000070fd5	movq	%rax, -0x38(%rbp)
0000000000070fd9	leaq	-0x30(%rbp), %rdi
0000000000070fdd	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070fe2	jmp	0x7102f
0000000000070fe4	movq	%rax, -0x38(%rbp)
0000000000070fe8	jmp	0x7100e
0000000000070fea	movq	%rax, -0x38(%rbp)
0000000000070fee	jmp	0x71016
0000000000070ff0	movq	%rax, -0x38(%rbp)
0000000000070ff4	jmp	0x7101e
0000000000070ff6	movq	%rax, -0x38(%rbp)
0000000000070ffa	jmp	0x71026
0000000000070ffc	movq	%rax, -0x38(%rbp)
0000000000071000	jmp	0x7102f
0000000000071002	movq	%rax, -0x38(%rbp)
0000000000071006	movq	%r14, %rdi
0000000000071009	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000007100e	movq	%r13, %rdi
0000000000071011	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000071016	movq	%r12, %rdi
0000000000071019	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000007101e	movq	%r15, %rdi
0000000000071021	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000071026	movq	-0x40(%rbp), %rdi
000000000007102a	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000007102f	movq	%rbx, %rdi
0000000000071032	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000071037	movq	-0x38(%rbp), %rdi
000000000007103b	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
