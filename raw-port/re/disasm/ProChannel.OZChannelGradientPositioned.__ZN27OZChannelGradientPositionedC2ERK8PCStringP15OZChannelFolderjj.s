__ZN27OZChannelGradientPositionedC2ERK8PCStringP15OZChannelFolderjj:
000000000006d4e4	pushq	%rbp
000000000006d4e5	movq	%rsp, %rbp
000000000006d4e8	pushq	%r15
000000000006d4ea	pushq	%r14
000000000006d4ec	pushq	%r13
000000000006d4ee	pushq	%r12
000000000006d4f0	pushq	%rbx
000000000006d4f1	subq	$0x18, %rsp
000000000006d4f5	movl	%r8d, %r14d
000000000006d4f8	movl	%ecx, %r15d
000000000006d4fb	movq	%rdx, %r12
000000000006d4fe	movq	%rsi, %r13
000000000006d501	movq	%rdi, %rbx
000000000006d504	callq	__ZN35OZChannelGradientPositioned_Factory11getInstanceEv ## OZChannelGradientPositioned_Factory::getInstance()
000000000006d509	movq	%rbx, %rdi
000000000006d50c	movq	%rax, %rsi
000000000006d50f	movq	%r13, %rdx
000000000006d512	movq	%r12, %rcx
000000000006d515	movl	%r15d, %r8d
000000000006d518	movl	%r14d, %r9d
000000000006d51b	callq	__ZN23OZChannelGradientExtrasC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj ## OZChannelGradientExtras::OZChannelGradientExtras(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
000000000006d520	leaq	0x6de29(%rip), %rax
000000000006d527	movq	%rax, (%rbx)
000000000006d52a	leaq	0x6e0f7(%rip), %rax
000000000006d531	movq	%rax, 0x10(%rbx)
000000000006d535	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000006d53a	leaq	0x7802f(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000006d541	leaq	-0x30(%rbp), %rdi
000000000006d545	movq	%rax, %rdx
000000000006d548	xorl	%ecx, %ecx
000000000006d54a	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000006d54f	leaq	0x420(%rbx), %r14
000000000006d556	xorps	%xmm0, %xmm0
000000000006d559	movups	%xmm0, (%rsp)
000000000006d55d	leaq	-0x30(%rbp), %rsi
000000000006d561	movq	%r14, %rdi
000000000006d564	movq	%rbx, %rdx
000000000006d567	movl	$0x4, %ecx
000000000006d56c	xorl	%r8d, %r8d
000000000006d56f	movl	$0x2, %r9d
000000000006d575	callq	__ZN17OZChannelPositionC1ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannelPosition::OZChannelPosition(PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000006d57a	leaq	-0x30(%rbp), %rdi
000000000006d57e	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d583	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000006d588	leaq	0x78001(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000006d58f	leaq	-0x30(%rbp), %rdi
000000000006d593	movq	%rax, %rdx
000000000006d596	xorl	%ecx, %ecx
000000000006d598	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000006d59d	leaq	0x6e0(%rbx), %r15
000000000006d5a4	xorps	%xmm0, %xmm0
000000000006d5a7	movups	%xmm0, (%rsp)
000000000006d5ab	leaq	-0x30(%rbp), %rsi
000000000006d5af	movq	%r15, %rdi
000000000006d5b2	movq	%rbx, %rdx
000000000006d5b5	movl	$0x5, %ecx
000000000006d5ba	xorl	%r8d, %r8d
000000000006d5bd	movl	$0x2, %r9d
000000000006d5c3	callq	__ZN17OZChannelPositionC1ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannelPosition::OZChannelPosition(PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000006d5c8	leaq	-0x30(%rbp), %rdi
000000000006d5cc	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d5d1	movb	$0x0, 0x9a0(%rbx)
000000000006d5d8	movl	$0x10, %esi
000000000006d5dd	movq	%r14, %rdi
000000000006d5e0	xorl	%edx, %edx
000000000006d5e2	callq	__ZN13OZChannelBase9resetFlagEyb ## OZChannelBase::resetFlag(unsigned long long, bool)
000000000006d5e7	movl	$0x10, %esi
000000000006d5ec	movq	%r15, %rdi
000000000006d5ef	xorl	%edx, %edx
000000000006d5f1	callq	__ZN13OZChannelBase9resetFlagEyb ## OZChannelBase::resetFlag(unsigned long long, bool)
000000000006d5f6	leaq	0x4a8(%rbx), %rdi
000000000006d5fd	xorps	%xmm0, %xmm0
000000000006d600	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d605	leaq	0x540(%rbx), %rdi
000000000006d60c	movsd	0x41f04(%rip), %xmm0
000000000006d614	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d619	movq	%r14, %rdi
000000000006d61c	xorl	%esi, %esi
000000000006d61e	callq	__ZN13OZChannelBase5resetEb     ## OZChannelBase::reset(bool)
000000000006d623	movb	$0x0, 0x5d8(%rbx)
000000000006d62a	leaq	0x768(%rbx), %rdi
000000000006d631	xorps	%xmm0, %xmm0
000000000006d634	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d639	leaq	0x800(%rbx), %rdi
000000000006d640	movsd	0x43dc0(%rip), %xmm0
000000000006d648	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d64d	movq	%r15, %rdi
000000000006d650	xorl	%esi, %esi
000000000006d652	callq	__ZN13OZChannelBase5resetEb     ## OZChannelBase::reset(bool)
000000000006d657	movb	$0x0, 0x898(%rbx)
000000000006d65e	addq	$0x18, %rsp
000000000006d662	popq	%rbx
000000000006d663	popq	%r12
000000000006d665	popq	%r13
000000000006d667	popq	%r14
000000000006d669	popq	%r15
000000000006d66b	popq	%rbp
000000000006d66c	retq
000000000006d66d	movq	%rax, %r12
000000000006d670	leaq	-0x30(%rbp), %rdi
000000000006d674	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d679	jmp	0x6d69e
000000000006d67b	movq	%rax, %r12
000000000006d67e	leaq	-0x30(%rbp), %rdi
000000000006d682	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d687	jmp	0x6d6a6
000000000006d689	movq	%rax, %r12
000000000006d68c	jmp	0x6d69e
000000000006d68e	movq	%rax, %r12
000000000006d691	jmp	0x6d6a6
000000000006d693	movq	%rax, %r12
000000000006d696	movq	%r15, %rdi
000000000006d699	callq	__ZN17OZChannelPositionD1Ev     ## OZChannelPosition::~OZChannelPosition()
000000000006d69e	movq	%r14, %rdi
000000000006d6a1	callq	__ZN17OZChannelPositionD1Ev     ## OZChannelPosition::~OZChannelPosition()
000000000006d6a6	movq	%rbx, %rdi
000000000006d6a9	callq	__ZN23OZChannelGradientExtrasD2Ev ## OZChannelGradientExtras::~OZChannelGradientExtras()
000000000006d6ae	movq	%r12, %rdi
000000000006d6b1	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
