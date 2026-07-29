__ZN24OZChannelHistogramSampleD2Ev:
00000000000709e8	pushq	%rbp
00000000000709e9	movq	%rsp, %rbp
00000000000709ec	pushq	%rbx
00000000000709ed	pushq	%rax
00000000000709ee	movq	%rdi, %rbx
00000000000709f1	leaq	__ZTV24OZChannelHistogramSample(%rip), %rax ## vtable for OZChannelHistogramSample
00000000000709f8	leaq	0x10(%rax), %rcx
00000000000709fc	movq	%rcx, (%rdi)
00000000000709ff	addq	$0x348, %rax                    ## imm = 0x348
0000000000070a05	movq	%rax, 0x10(%rdi)
0000000000070a09	addq	$0x2e8, %rdi                    ## imm = 0x2E8
0000000000070a10	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000070a15	leaq	0x250(%rbx), %rdi
0000000000070a1c	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000070a21	leaq	0x1b8(%rbx), %rdi
0000000000070a28	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000070a2d	leaq	0x120(%rbx), %rdi
0000000000070a34	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000070a39	leaq	0x88(%rbx), %rdi
0000000000070a40	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000070a45	movq	%rbx, %rdi
0000000000070a48	addq	$0x8, %rsp
0000000000070a4c	popq	%rbx
0000000000070a4d	popq	%rbp
0000000000070a4e	jmp	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000070a53	addb	%dl, 0x48(%rbp)
0000000000070a56	movl	%esp, %ebp
0000000000070a58	pushq	%r15
0000000000070a5a	pushq	%r14
0000000000070a5c	pushq	%r13
0000000000070a5e	pushq	%r12
0000000000070a60	pushq	%rbx
0000000000070a61	subq	$0x28, %rsp
0000000000070a65	movl	%r9d, %r14d
0000000000070a68	movl	%r8d, -0x40(%rbp)
0000000000070a6c	movl	%ecx, %r12d
0000000000070a6f	movq	%rdx, %r13
0000000000070a72	movq	%rsi, %r15
0000000000070a75	movq	%rdi, %rbx
0000000000070a78	callq	__ZN32OZChannelHistogramSample_Factory11getInstanceEv ## OZChannelHistogramSample_Factory::getInstance()
0000000000070a7d	movl	%r14d, 0x8(%rsp)
0000000000070a82	movl	$0x0, (%rsp)
0000000000070a89	movq	%rbx, %rdi
0000000000070a8c	movq	%rax, %rsi
0000000000070a8f	movq	%r15, %rdx
0000000000070a92	movq	%r13, %rcx
0000000000070a95	movl	%r12d, %r8d
0000000000070a98	movl	-0x40(%rbp), %r9d
0000000000070a9c	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
0000000000070aa1	leaq	0x6bda8(%rip), %rax
0000000000070aa8	movq	%rax, (%rbx)
0000000000070aab	leaq	0x6c0d6(%rip), %rax
0000000000070ab2	movq	%rax, 0x10(%rbx)
0000000000070ab6	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000070abb	leaq	0x74d6e(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000070ac2	leaq	-0x30(%rbp), %rdi
0000000000070ac6	movq	%rax, %rdx
0000000000070ac9	xorl	%ecx, %ecx
0000000000070acb	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000070ad0	leaq	0x88(%rbx), %rdi
0000000000070ad7	movq	$0x0, (%rsp)
0000000000070adf	leaq	-0x30(%rbp), %rsi
0000000000070ae3	xorps	%xmm0, %xmm0
0000000000070ae6	movq	%rdi, -0x40(%rbp)
0000000000070aea	movq	%rbx, %rdx
0000000000070aed	movl	$0x1, %ecx
0000000000070af2	xorl	%r8d, %r8d
0000000000070af5	xorl	%r9d, %r9d
0000000000070af8	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000070afd	leaq	-0x30(%rbp), %rdi
0000000000070b01	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070b06	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000070b0b	leaq	0x74d3e(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000070b12	leaq	-0x30(%rbp), %rdi
0000000000070b16	movq	%rax, %rdx
0000000000070b19	xorl	%ecx, %ecx
0000000000070b1b	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000070b20	leaq	0x120(%rbx), %r15
0000000000070b27	movq	$0x0, (%rsp)
0000000000070b2f	leaq	-0x30(%rbp), %rsi
0000000000070b33	xorps	%xmm0, %xmm0
0000000000070b36	movq	%r15, %rdi
0000000000070b39	movq	%rbx, %rdx
0000000000070b3c	movl	$0x2, %ecx
0000000000070b41	xorl	%r8d, %r8d
0000000000070b44	xorl	%r9d, %r9d
0000000000070b47	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000070b4c	leaq	-0x30(%rbp), %rdi
0000000000070b50	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070b55	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000070b5a	leaq	0x74d0f(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000070b61	leaq	-0x30(%rbp), %rdi
0000000000070b65	movq	%rax, %rdx
0000000000070b68	xorl	%ecx, %ecx
0000000000070b6a	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000070b6f	leaq	0x1b8(%rbx), %r12
0000000000070b76	movq	$0x0, (%rsp)
0000000000070b7e	movsd	0x3e9a2(%rip), %xmm0
0000000000070b86	leaq	-0x30(%rbp), %rsi
0000000000070b8a	movq	%r12, %rdi
0000000000070b8d	movq	%rbx, %rdx
0000000000070b90	movl	$0x3, %ecx
0000000000070b95	xorl	%r8d, %r8d
0000000000070b98	xorl	%r9d, %r9d
0000000000070b9b	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000070ba0	leaq	-0x30(%rbp), %rdi
0000000000070ba4	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070ba9	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000070bae	leaq	0x74cdb(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000070bb5	leaq	-0x30(%rbp), %rdi
0000000000070bb9	movq	%rax, %rdx
0000000000070bbc	xorl	%ecx, %ecx
0000000000070bbe	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000070bc3	leaq	0x250(%rbx), %r13
0000000000070bca	movq	$0x0, (%rsp)
0000000000070bd2	movsd	0x3e94e(%rip), %xmm0
0000000000070bda	leaq	-0x30(%rbp), %rsi
0000000000070bde	movq	%r13, %rdi
0000000000070be1	movq	%rbx, %rdx
0000000000070be4	movl	$0x4, %ecx
0000000000070be9	xorl	%r8d, %r8d
0000000000070bec	xorl	%r9d, %r9d
0000000000070bef	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000070bf4	leaq	-0x30(%rbp), %rdi
0000000000070bf8	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070bfd	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000070c02	leaq	0x74ca7(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000070c09	leaq	-0x30(%rbp), %rdi
0000000000070c0d	movq	%rax, %rdx
0000000000070c10	xorl	%ecx, %ecx
0000000000070c12	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000070c17	leaq	0x2e8(%rbx), %r14
0000000000070c1e	movq	$0x0, (%rsp)
0000000000070c26	movsd	0x3e8fa(%rip), %xmm0
0000000000070c2e	leaq	-0x30(%rbp), %rsi
0000000000070c32	movq	%r14, %rdi
0000000000070c35	movq	%rbx, %rdx
0000000000070c38	movl	$0x5, %ecx
0000000000070c3d	xorl	%r8d, %r8d
0000000000070c40	xorl	%r9d, %r9d
0000000000070c43	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000070c48	leaq	-0x30(%rbp), %rdi
0000000000070c4c	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070c51	movsd	0x3e8cf(%rip), %xmm0
0000000000070c59	movq	-0x40(%rbp), %rdi
0000000000070c5d	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000070c62	movsd	0x3e8be(%rip), %xmm0
0000000000070c6a	movq	%r15, %rdi
0000000000070c6d	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000070c72	movsd	0x3e8ae(%rip), %xmm0
0000000000070c7a	movq	%r12, %rdi
0000000000070c7d	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000070c82	movsd	0x3e89e(%rip), %xmm0
0000000000070c8a	movq	%r13, %rdi
0000000000070c8d	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000070c92	movsd	0x408ae(%rip), %xmm0
0000000000070c9a	movq	%r14, %rdi
0000000000070c9d	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
0000000000070ca2	addq	$0x28, %rsp
0000000000070ca6	popq	%rbx
0000000000070ca7	popq	%r12
0000000000070ca9	popq	%r13
0000000000070cab	popq	%r14
0000000000070cad	popq	%r15
0000000000070caf	popq	%rbp
0000000000070cb0	retq
0000000000070cb1	movq	%rax, -0x38(%rbp)
0000000000070cb5	leaq	-0x30(%rbp), %rdi
0000000000070cb9	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070cbe	jmp	0x70d26
0000000000070cc0	movq	%rax, -0x38(%rbp)
0000000000070cc4	leaq	-0x30(%rbp), %rdi
0000000000070cc8	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070ccd	jmp	0x70d2e
0000000000070ccf	movq	%rax, -0x38(%rbp)
0000000000070cd3	leaq	-0x30(%rbp), %rdi
0000000000070cd7	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070cdc	jmp	0x70d36
0000000000070cde	movq	%rax, -0x38(%rbp)
0000000000070ce2	leaq	-0x30(%rbp), %rdi
0000000000070ce6	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070ceb	jmp	0x70d3e
0000000000070ced	movq	%rax, -0x38(%rbp)
0000000000070cf1	leaq	-0x30(%rbp), %rdi
0000000000070cf5	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000070cfa	jmp	0x70d47
0000000000070cfc	movq	%rax, -0x38(%rbp)
0000000000070d00	jmp	0x70d26
0000000000070d02	movq	%rax, -0x38(%rbp)
0000000000070d06	jmp	0x70d2e
0000000000070d08	movq	%rax, -0x38(%rbp)
0000000000070d0c	jmp	0x70d36
0000000000070d0e	movq	%rax, -0x38(%rbp)
0000000000070d12	jmp	0x70d3e
0000000000070d14	movq	%rax, -0x38(%rbp)
0000000000070d18	jmp	0x70d47
0000000000070d1a	movq	%rax, -0x38(%rbp)
0000000000070d1e	movq	%r14, %rdi
0000000000070d21	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000070d26	movq	%r13, %rdi
0000000000070d29	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000070d2e	movq	%r12, %rdi
0000000000070d31	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000070d36	movq	%r15, %rdi
0000000000070d39	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000070d3e	movq	-0x40(%rbp), %rdi
0000000000070d42	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000070d47	movq	%rbx, %rdi
0000000000070d4a	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000070d4f	movq	-0x38(%rbp), %rdi
0000000000070d53	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
