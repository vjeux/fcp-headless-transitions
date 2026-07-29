__ZN24OZChannelHistogramSampleC2EP9OZFactoryRK8PCStringjj:
000000000007136c	pushq	%rbp
000000000007136d	movq	%rsp, %rbp
0000000000071370	pushq	%r15
0000000000071372	pushq	%r14
0000000000071374	pushq	%r13
0000000000071376	pushq	%r12
0000000000071378	pushq	%rbx
0000000000071379	subq	$0x28, %rsp
000000000007137d	movq	%rdi, %rbx
0000000000071380	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringjj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, unsigned int, unsigned int)
0000000000071385	leaq	0x6b4c4(%rip), %rax
000000000007138c	movq	%rax, (%rbx)
000000000007138f	leaq	0x6b7f2(%rip), %rax
0000000000071396	movq	%rax, 0x10(%rbx)
000000000007139a	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000007139f	leaq	0x7448a(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000713a6	leaq	-0x30(%rbp), %rdi
00000000000713aa	movq	%rax, %rdx
00000000000713ad	xorl	%ecx, %ecx
00000000000713af	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000713b4	leaq	0x88(%rbx), %rdi
00000000000713bb	movq	$0x0, (%rsp)
00000000000713c3	leaq	-0x30(%rbp), %rsi
00000000000713c7	xorps	%xmm0, %xmm0
00000000000713ca	movq	%rdi, -0x40(%rbp)
00000000000713ce	movq	%rbx, %rdx
00000000000713d1	movl	$0x1, %ecx
00000000000713d6	xorl	%r8d, %r8d
00000000000713d9	xorl	%r9d, %r9d
00000000000713dc	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000713e1	leaq	-0x30(%rbp), %rdi
00000000000713e5	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000713ea	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000713ef	leaq	0x7445a(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000713f6	leaq	-0x30(%rbp), %rdi
00000000000713fa	movq	%rax, %rdx
00000000000713fd	xorl	%ecx, %ecx
00000000000713ff	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000071404	leaq	0x120(%rbx), %r15
000000000007140b	movq	$0x0, (%rsp)
0000000000071413	leaq	-0x30(%rbp), %rsi
0000000000071417	xorps	%xmm0, %xmm0
000000000007141a	movq	%r15, %rdi
000000000007141d	movq	%rbx, %rdx
0000000000071420	movl	$0x2, %ecx
0000000000071425	xorl	%r8d, %r8d
0000000000071428	xorl	%r9d, %r9d
000000000007142b	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000071430	leaq	-0x30(%rbp), %rdi
0000000000071434	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000071439	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000007143e	leaq	0x7442b(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000071445	leaq	-0x30(%rbp), %rdi
0000000000071449	movq	%rax, %rdx
000000000007144c	xorl	%ecx, %ecx
000000000007144e	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000071453	leaq	0x1b8(%rbx), %r12
000000000007145a	movq	$0x0, (%rsp)
0000000000071462	movsd	0x3e0be(%rip), %xmm0
000000000007146a	leaq	-0x30(%rbp), %rsi
000000000007146e	movq	%r12, %rdi
0000000000071471	movq	%rbx, %rdx
0000000000071474	movl	$0x3, %ecx
0000000000071479	xorl	%r8d, %r8d
000000000007147c	xorl	%r9d, %r9d
000000000007147f	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000071484	leaq	-0x30(%rbp), %rdi
0000000000071488	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000007148d	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000071492	leaq	0x743f7(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000071499	leaq	-0x30(%rbp), %rdi
000000000007149d	movq	%rax, %rdx
00000000000714a0	xorl	%ecx, %ecx
00000000000714a2	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000714a7	leaq	0x250(%rbx), %r13
00000000000714ae	movq	$0x0, (%rsp)
00000000000714b6	movsd	0x3e06a(%rip), %xmm0
00000000000714be	leaq	-0x30(%rbp), %rsi
00000000000714c2	movq	%r13, %rdi
00000000000714c5	movq	%rbx, %rdx
00000000000714c8	movl	$0x4, %ecx
00000000000714cd	xorl	%r8d, %r8d
00000000000714d0	xorl	%r9d, %r9d
00000000000714d3	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000714d8	leaq	-0x30(%rbp), %rdi
00000000000714dc	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000714e1	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000714e6	leaq	0x743c3(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000714ed	leaq	-0x30(%rbp), %rdi
00000000000714f1	movq	%rax, %rdx
00000000000714f4	xorl	%ecx, %ecx
00000000000714f6	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000714fb	leaq	0x2e8(%rbx), %r14
0000000000071502	movq	$0x0, (%rsp)
000000000007150a	movsd	0x3e016(%rip), %xmm0
0000000000071512	leaq	-0x30(%rbp), %rsi
0000000000071516	movq	%r14, %rdi
0000000000071519	movq	%rbx, %rdx
000000000007151c	movl	$0x5, %ecx
0000000000071521	xorl	%r8d, %r8d
0000000000071524	xorl	%r9d, %r9d
0000000000071527	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000007152c	leaq	-0x30(%rbp), %rdi
0000000000071530	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000071535	movsd	0x3dfeb(%rip), %xmm0
000000000007153d	movq	-0x40(%rbp), %rdi
0000000000071541	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000071546	movsd	0x3dfda(%rip), %xmm0
000000000007154e	movq	%r15, %rdi
0000000000071551	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000071556	movsd	0x3dfca(%rip), %xmm0
000000000007155e	movq	%r12, %rdi
0000000000071561	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000071566	movsd	0x3dfba(%rip), %xmm0
000000000007156e	movq	%r13, %rdi
0000000000071571	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000071576	movsd	0x3ffca(%rip), %xmm0
000000000007157e	movq	%r14, %rdi
0000000000071581	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000071586	addq	$0x28, %rsp
000000000007158a	popq	%rbx
000000000007158b	popq	%r12
000000000007158d	popq	%r13
000000000007158f	popq	%r14
0000000000071591	popq	%r15
0000000000071593	popq	%rbp
0000000000071594	retq
0000000000071595	movq	%rax, -0x38(%rbp)
0000000000071599	leaq	-0x30(%rbp), %rdi
000000000007159d	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000715a2	jmp	0x7160a
00000000000715a4	movq	%rax, -0x38(%rbp)
00000000000715a8	leaq	-0x30(%rbp), %rdi
00000000000715ac	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000715b1	jmp	0x71612
00000000000715b3	movq	%rax, -0x38(%rbp)
00000000000715b7	leaq	-0x30(%rbp), %rdi
00000000000715bb	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000715c0	jmp	0x7161a
00000000000715c2	movq	%rax, -0x38(%rbp)
00000000000715c6	leaq	-0x30(%rbp), %rdi
00000000000715ca	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000715cf	jmp	0x71622
00000000000715d1	movq	%rax, -0x38(%rbp)
00000000000715d5	leaq	-0x30(%rbp), %rdi
00000000000715d9	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000715de	jmp	0x7162b
00000000000715e0	movq	%rax, -0x38(%rbp)
00000000000715e4	jmp	0x7160a
00000000000715e6	movq	%rax, -0x38(%rbp)
00000000000715ea	jmp	0x71612
00000000000715ec	movq	%rax, -0x38(%rbp)
00000000000715f0	jmp	0x7161a
00000000000715f2	movq	%rax, -0x38(%rbp)
00000000000715f6	jmp	0x71622
00000000000715f8	movq	%rax, -0x38(%rbp)
00000000000715fc	jmp	0x7162b
00000000000715fe	movq	%rax, -0x38(%rbp)
0000000000071602	movq	%r14, %rdi
0000000000071605	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000007160a	movq	%r13, %rdi
000000000007160d	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000071612	movq	%r12, %rdi
0000000000071615	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000007161a	movq	%r15, %rdi
000000000007161d	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000071622	movq	-0x40(%rbp), %rdi
0000000000071626	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000007162b	movq	%rbx, %rdi
000000000007162e	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000071633	movq	-0x38(%rbp), %rdi
0000000000071637	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
