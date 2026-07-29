__ZN27OZChannelGradientPositionedC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj:
000000000006d178	pushq	%rbp
000000000006d179	movq	%rsp, %rbp
000000000006d17c	pushq	%r15
000000000006d17e	pushq	%r14
000000000006d180	pushq	%r12
000000000006d182	pushq	%rbx
000000000006d183	subq	$0x20, %rsp
000000000006d187	movq	%rdi, %rbx
000000000006d18a	callq	__ZN23OZChannelGradientExtrasC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj ## OZChannelGradientExtras::OZChannelGradientExtras(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
000000000006d18f	leaq	0x6e1ba(%rip), %rax
000000000006d196	movq	%rax, (%rbx)
000000000006d199	leaq	0x6e488(%rip), %rax
000000000006d1a0	movq	%rax, 0x10(%rbx)
000000000006d1a4	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000006d1a9	leaq	0x783c0(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000006d1b0	leaq	-0x28(%rbp), %rdi
000000000006d1b4	movq	%rax, %rdx
000000000006d1b7	xorl	%ecx, %ecx
000000000006d1b9	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000006d1be	leaq	0x420(%rbx), %r14
000000000006d1c5	xorps	%xmm0, %xmm0
000000000006d1c8	movups	%xmm0, (%rsp)
000000000006d1cc	leaq	-0x28(%rbp), %rsi
000000000006d1d0	movq	%r14, %rdi
000000000006d1d3	movq	%rbx, %rdx
000000000006d1d6	movl	$0x4, %ecx
000000000006d1db	xorl	%r8d, %r8d
000000000006d1de	movl	$0x2, %r9d
000000000006d1e4	callq	__ZN17OZChannelPositionC1ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannelPosition::OZChannelPosition(PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000006d1e9	leaq	-0x28(%rbp), %rdi
000000000006d1ed	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d1f2	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000006d1f7	leaq	0x78392(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000006d1fe	leaq	-0x28(%rbp), %rdi
000000000006d202	movq	%rax, %rdx
000000000006d205	xorl	%ecx, %ecx
000000000006d207	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000006d20c	leaq	0x6e0(%rbx), %r15
000000000006d213	xorps	%xmm0, %xmm0
000000000006d216	movups	%xmm0, (%rsp)
000000000006d21a	leaq	-0x28(%rbp), %rsi
000000000006d21e	movq	%r15, %rdi
000000000006d221	movq	%rbx, %rdx
000000000006d224	movl	$0x5, %ecx
000000000006d229	xorl	%r8d, %r8d
000000000006d22c	movl	$0x2, %r9d
000000000006d232	callq	__ZN17OZChannelPositionC1ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannelPosition::OZChannelPosition(PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000006d237	leaq	-0x28(%rbp), %rdi
000000000006d23b	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d240	movb	$0x0, 0x9a0(%rbx)
000000000006d247	movl	$0x10, %esi
000000000006d24c	movq	%r14, %rdi
000000000006d24f	xorl	%edx, %edx
000000000006d251	callq	__ZN13OZChannelBase9resetFlagEyb ## OZChannelBase::resetFlag(unsigned long long, bool)
000000000006d256	movl	$0x10, %esi
000000000006d25b	movq	%r15, %rdi
000000000006d25e	xorl	%edx, %edx
000000000006d260	callq	__ZN13OZChannelBase9resetFlagEyb ## OZChannelBase::resetFlag(unsigned long long, bool)
000000000006d265	leaq	0x4a8(%rbx), %rdi
000000000006d26c	xorps	%xmm0, %xmm0
000000000006d26f	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d274	leaq	0x540(%rbx), %rdi
000000000006d27b	movsd	0x44185(%rip), %xmm0
000000000006d283	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d288	movq	%r14, %rdi
000000000006d28b	xorl	%esi, %esi
000000000006d28d	callq	__ZN13OZChannelBase5resetEb     ## OZChannelBase::reset(bool)
000000000006d292	movb	$0x0, 0x5d8(%rbx)
000000000006d299	leaq	0x768(%rbx), %rdi
000000000006d2a0	xorps	%xmm0, %xmm0
000000000006d2a3	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d2a8	leaq	0x800(%rbx), %rdi
000000000006d2af	movsd	0x42261(%rip), %xmm0
000000000006d2b7	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d2bc	movq	%r15, %rdi
000000000006d2bf	xorl	%esi, %esi
000000000006d2c1	callq	__ZN13OZChannelBase5resetEb     ## OZChannelBase::reset(bool)
000000000006d2c6	movb	$0x0, 0x898(%rbx)
000000000006d2cd	addq	$0x20, %rsp
000000000006d2d1	popq	%rbx
000000000006d2d2	popq	%r12
000000000006d2d4	popq	%r14
000000000006d2d6	popq	%r15
000000000006d2d8	popq	%rbp
000000000006d2d9	retq
000000000006d2da	movq	%rax, %r12
000000000006d2dd	leaq	-0x28(%rbp), %rdi
000000000006d2e1	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d2e6	jmp	0x6d30b
000000000006d2e8	movq	%rax, %r12
000000000006d2eb	leaq	-0x28(%rbp), %rdi
000000000006d2ef	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d2f4	jmp	0x6d313
000000000006d2f6	movq	%rax, %r12
000000000006d2f9	jmp	0x6d30b
000000000006d2fb	movq	%rax, %r12
000000000006d2fe	jmp	0x6d313
000000000006d300	movq	%rax, %r12
000000000006d303	movq	%r15, %rdi
000000000006d306	callq	__ZN17OZChannelPositionD1Ev     ## OZChannelPosition::~OZChannelPosition()
000000000006d30b	movq	%r14, %rdi
000000000006d30e	callq	__ZN17OZChannelPositionD1Ev     ## OZChannelPosition::~OZChannelPosition()
000000000006d313	movq	%rbx, %rdi
000000000006d316	callq	__ZN23OZChannelGradientExtrasD2Ev ## OZChannelGradientExtras::~OZChannelGradientExtras()
000000000006d31b	movq	%r12, %rdi
000000000006d31e	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000006d323	nop
