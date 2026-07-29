__ZN27OZChannelGradientPositionedC2EP9OZFactoryRK8PCStringj:
000000000006d32e	pushq	%rbp
000000000006d32f	movq	%rsp, %rbp
000000000006d332	pushq	%r15
000000000006d334	pushq	%r14
000000000006d336	pushq	%r12
000000000006d338	pushq	%rbx
000000000006d339	subq	$0x20, %rsp
000000000006d33d	movq	%rdi, %rbx
000000000006d340	callq	__ZN23OZChannelGradientExtrasC2EP9OZFactoryRK8PCStringj ## OZChannelGradientExtras::OZChannelGradientExtras(OZFactory*, PCString const&, unsigned int)
000000000006d345	leaq	0x6e004(%rip), %rax
000000000006d34c	movq	%rax, (%rbx)
000000000006d34f	leaq	0x6e2d2(%rip), %rax
000000000006d356	movq	%rax, 0x10(%rbx)
000000000006d35a	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000006d35f	leaq	0x7820a(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000006d366	leaq	-0x28(%rbp), %rdi
000000000006d36a	movq	%rax, %rdx
000000000006d36d	xorl	%ecx, %ecx
000000000006d36f	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000006d374	leaq	0x420(%rbx), %r14
000000000006d37b	xorps	%xmm0, %xmm0
000000000006d37e	movups	%xmm0, (%rsp)
000000000006d382	leaq	-0x28(%rbp), %rsi
000000000006d386	movq	%r14, %rdi
000000000006d389	movq	%rbx, %rdx
000000000006d38c	movl	$0x4, %ecx
000000000006d391	xorl	%r8d, %r8d
000000000006d394	movl	$0x2, %r9d
000000000006d39a	callq	__ZN17OZChannelPositionC1ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannelPosition::OZChannelPosition(PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000006d39f	leaq	-0x28(%rbp), %rdi
000000000006d3a3	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d3a8	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000006d3ad	leaq	0x781dc(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000006d3b4	leaq	-0x28(%rbp), %rdi
000000000006d3b8	movq	%rax, %rdx
000000000006d3bb	xorl	%ecx, %ecx
000000000006d3bd	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000006d3c2	leaq	0x6e0(%rbx), %r15
000000000006d3c9	xorps	%xmm0, %xmm0
000000000006d3cc	movups	%xmm0, (%rsp)
000000000006d3d0	leaq	-0x28(%rbp), %rsi
000000000006d3d4	movq	%r15, %rdi
000000000006d3d7	movq	%rbx, %rdx
000000000006d3da	movl	$0x5, %ecx
000000000006d3df	xorl	%r8d, %r8d
000000000006d3e2	movl	$0x2, %r9d
000000000006d3e8	callq	__ZN17OZChannelPositionC1ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannelPosition::OZChannelPosition(PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000006d3ed	leaq	-0x28(%rbp), %rdi
000000000006d3f1	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d3f6	movb	$0x0, 0x9a0(%rbx)
000000000006d3fd	movl	$0x10, %esi
000000000006d402	movq	%r14, %rdi
000000000006d405	xorl	%edx, %edx
000000000006d407	callq	__ZN13OZChannelBase9resetFlagEyb ## OZChannelBase::resetFlag(unsigned long long, bool)
000000000006d40c	movl	$0x10, %esi
000000000006d411	movq	%r15, %rdi
000000000006d414	xorl	%edx, %edx
000000000006d416	callq	__ZN13OZChannelBase9resetFlagEyb ## OZChannelBase::resetFlag(unsigned long long, bool)
000000000006d41b	leaq	0x4a8(%rbx), %rdi
000000000006d422	xorps	%xmm0, %xmm0
000000000006d425	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d42a	leaq	0x540(%rbx), %rdi
000000000006d431	movsd	0x43fcf(%rip), %xmm0
000000000006d439	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d43e	movq	%r14, %rdi
000000000006d441	xorl	%esi, %esi
000000000006d443	callq	__ZN13OZChannelBase5resetEb     ## OZChannelBase::reset(bool)
000000000006d448	movb	$0x0, 0x5d8(%rbx)
000000000006d44f	leaq	0x768(%rbx), %rdi
000000000006d456	xorps	%xmm0, %xmm0
000000000006d459	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d45e	leaq	0x800(%rbx), %rdi
000000000006d465	movsd	0x420ab(%rip), %xmm0
000000000006d46d	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000006d472	movq	%r15, %rdi
000000000006d475	xorl	%esi, %esi
000000000006d477	callq	__ZN13OZChannelBase5resetEb     ## OZChannelBase::reset(bool)
000000000006d47c	movb	$0x0, 0x898(%rbx)
000000000006d483	addq	$0x20, %rsp
000000000006d487	popq	%rbx
000000000006d488	popq	%r12
000000000006d48a	popq	%r14
000000000006d48c	popq	%r15
000000000006d48e	popq	%rbp
000000000006d48f	retq
000000000006d490	movq	%rax, %r12
000000000006d493	leaq	-0x28(%rbp), %rdi
000000000006d497	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d49c	jmp	0x6d4c1
000000000006d49e	movq	%rax, %r12
000000000006d4a1	leaq	-0x28(%rbp), %rdi
000000000006d4a5	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000006d4aa	jmp	0x6d4c9
000000000006d4ac	movq	%rax, %r12
000000000006d4af	jmp	0x6d4c1
000000000006d4b1	movq	%rax, %r12
000000000006d4b4	jmp	0x6d4c9
000000000006d4b6	movq	%rax, %r12
000000000006d4b9	movq	%r15, %rdi
000000000006d4bc	callq	__ZN17OZChannelPositionD1Ev     ## OZChannelPosition::~OZChannelPosition()
000000000006d4c1	movq	%r14, %rdi
000000000006d4c4	callq	__ZN17OZChannelPositionD1Ev     ## OZChannelPosition::~OZChannelPosition()
000000000006d4c9	movq	%rbx, %rdi
000000000006d4cc	callq	__ZN23OZChannelGradientExtrasD2Ev ## OZChannelGradientExtras::~OZChannelGradientExtras()
000000000006d4d1	movq	%r12, %rdi
000000000006d4d4	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000006d4d9	nop
