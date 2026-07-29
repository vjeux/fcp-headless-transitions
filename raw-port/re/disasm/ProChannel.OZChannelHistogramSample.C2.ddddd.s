__ZN24OZChannelHistogramSampleC2EdddddRK8PCStringP15OZChannelFolderjjj:
000000000007104a	pushq	%rbp
000000000007104b	movq	%rsp, %rbp
000000000007104e	pushq	%r15
0000000000071050	pushq	%r14
0000000000071052	pushq	%r13
0000000000071054	pushq	%r12
0000000000071056	pushq	%rbx
0000000000071057	subq	$0x48, %rsp
000000000007105b	movl	%r9d, %r14d
000000000007105e	movl	%r8d, -0x40(%rbp)
0000000000071062	movl	%ecx, %r12d
0000000000071065	movq	%rdx, %r13
0000000000071068	movq	%rsi, %r15
000000000007106b	movsd	%xmm4, -0x48(%rbp)
0000000000071070	movsd	%xmm3, -0x50(%rbp)
0000000000071075	movsd	%xmm2, -0x58(%rbp)
000000000007107a	movsd	%xmm1, -0x60(%rbp)
000000000007107f	movsd	%xmm0, -0x38(%rbp)
0000000000071084	movq	%rdi, %rbx
0000000000071087	callq	__ZN32OZChannelHistogramSample_Factory11getInstanceEv ## OZChannelHistogramSample_Factory::getInstance()
000000000007108c	movl	%r14d, 0x8(%rsp)
0000000000071091	movl	$0x0, (%rsp)
0000000000071098	movq	%rbx, %rdi
000000000007109b	movq	%rax, %rsi
000000000007109e	movq	%r15, %rdx
00000000000710a1	movq	%r13, %rcx
00000000000710a4	movl	%r12d, %r8d
00000000000710a7	movl	-0x40(%rbp), %r9d
00000000000710ab	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
00000000000710b0	leaq	0x6b799(%rip), %rax
00000000000710b7	movq	%rax, (%rbx)
00000000000710ba	leaq	0x6bac7(%rip), %rax
00000000000710c1	movq	%rax, 0x10(%rbx)
00000000000710c5	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000710ca	leaq	0x7475f(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000710d1	leaq	-0x30(%rbp), %rdi
00000000000710d5	movq	%rax, %rdx
00000000000710d8	xorl	%ecx, %ecx
00000000000710da	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000710df	leaq	0x88(%rbx), %rdi
00000000000710e6	movq	$0x0, (%rsp)
00000000000710ee	leaq	-0x30(%rbp), %rsi
00000000000710f2	movq	%rdi, -0x40(%rbp)
00000000000710f6	movsd	-0x38(%rbp), %xmm0
00000000000710fb	movq	%rbx, %rdx
00000000000710fe	movl	$0x1, %ecx
0000000000071103	xorl	%r8d, %r8d
0000000000071106	xorl	%r9d, %r9d
0000000000071109	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000007110e	leaq	-0x30(%rbp), %rdi
0000000000071112	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000071117	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000007111c	leaq	0x7472d(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000071123	leaq	-0x30(%rbp), %rdi
0000000000071127	movq	%rax, %rdx
000000000007112a	xorl	%ecx, %ecx
000000000007112c	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000071131	leaq	0x120(%rbx), %r15
0000000000071138	movq	$0x0, (%rsp)
0000000000071140	leaq	-0x30(%rbp), %rsi
0000000000071144	movq	%r15, %rdi
0000000000071147	movsd	-0x60(%rbp), %xmm0
000000000007114c	movq	%rbx, %rdx
000000000007114f	movl	$0x2, %ecx
0000000000071154	xorl	%r8d, %r8d
0000000000071157	xorl	%r9d, %r9d
000000000007115a	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000007115f	leaq	-0x30(%rbp), %rdi
0000000000071163	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000071168	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000007116d	leaq	0x746fc(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000071174	leaq	-0x30(%rbp), %rdi
0000000000071178	movq	%rax, %rdx
000000000007117b	xorl	%ecx, %ecx
000000000007117d	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000071182	leaq	0x1b8(%rbx), %r12
0000000000071189	movq	$0x0, (%rsp)
0000000000071191	leaq	-0x30(%rbp), %rsi
0000000000071195	movq	%r12, %rdi
0000000000071198	movsd	-0x58(%rbp), %xmm0
000000000007119d	movq	%rbx, %rdx
00000000000711a0	movl	$0x3, %ecx
00000000000711a5	xorl	%r8d, %r8d
00000000000711a8	xorl	%r9d, %r9d
00000000000711ab	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000711b0	leaq	-0x30(%rbp), %rdi
00000000000711b4	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000711b9	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000711be	leaq	0x746cb(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000711c5	leaq	-0x30(%rbp), %rdi
00000000000711c9	movq	%rax, %rdx
00000000000711cc	xorl	%ecx, %ecx
00000000000711ce	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000711d3	leaq	0x250(%rbx), %r13
00000000000711da	movq	$0x0, (%rsp)
00000000000711e2	leaq	-0x30(%rbp), %rsi
00000000000711e6	movq	%r13, %rdi
00000000000711e9	movsd	-0x50(%rbp), %xmm0
00000000000711ee	movq	%rbx, %rdx
00000000000711f1	movl	$0x4, %ecx
00000000000711f6	xorl	%r8d, %r8d
00000000000711f9	xorl	%r9d, %r9d
00000000000711fc	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000071201	leaq	-0x30(%rbp), %rdi
0000000000071205	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000007120a	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000007120f	leaq	0x7469a(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000071216	leaq	-0x30(%rbp), %rdi
000000000007121a	movq	%rax, %rdx
000000000007121d	xorl	%ecx, %ecx
000000000007121f	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000071224	leaq	0x2e8(%rbx), %r14
000000000007122b	movq	$0x0, (%rsp)
0000000000071233	leaq	-0x30(%rbp), %rsi
0000000000071237	movq	%r14, %rdi
000000000007123a	movsd	-0x48(%rbp), %xmm0
000000000007123f	movq	%rbx, %rdx
0000000000071242	movl	$0x5, %ecx
0000000000071247	xorl	%r8d, %r8d
000000000007124a	xorl	%r9d, %r9d
000000000007124d	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000071252	leaq	-0x30(%rbp), %rdi
0000000000071256	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000007125b	movsd	0x3e2c5(%rip), %xmm0
0000000000071263	movq	-0x40(%rbp), %rdi
0000000000071267	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
000000000007126c	movsd	0x3e2b4(%rip), %xmm0
0000000000071274	movq	%r15, %rdi
0000000000071277	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
000000000007127c	movsd	0x3e2a4(%rip), %xmm0
0000000000071284	movq	%r12, %rdi
0000000000071287	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
000000000007128c	movsd	0x3e294(%rip), %xmm0
0000000000071294	movq	%r13, %rdi
0000000000071297	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
000000000007129c	movsd	0x402a4(%rip), %xmm0
00000000000712a4	movq	%r14, %rdi
00000000000712a7	callq	__ZN9OZChannel12setSliderMaxEd  ## OZChannel::setSliderMax(double)
00000000000712ac	addq	$0x48, %rsp
00000000000712b0	popq	%rbx
00000000000712b1	popq	%r12
00000000000712b3	popq	%r13
00000000000712b5	popq	%r14
00000000000712b7	popq	%r15
00000000000712b9	popq	%rbp
00000000000712ba	retq
00000000000712bb	movq	%rax, -0x38(%rbp)
00000000000712bf	leaq	-0x30(%rbp), %rdi
00000000000712c3	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000712c8	jmp	0x71330
00000000000712ca	movq	%rax, -0x38(%rbp)
00000000000712ce	leaq	-0x30(%rbp), %rdi
00000000000712d2	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000712d7	jmp	0x71338
00000000000712d9	movq	%rax, -0x38(%rbp)
00000000000712dd	leaq	-0x30(%rbp), %rdi
00000000000712e1	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000712e6	jmp	0x71340
00000000000712e8	movq	%rax, -0x38(%rbp)
00000000000712ec	leaq	-0x30(%rbp), %rdi
00000000000712f0	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000712f5	jmp	0x71348
00000000000712f7	movq	%rax, -0x38(%rbp)
00000000000712fb	leaq	-0x30(%rbp), %rdi
00000000000712ff	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000071304	jmp	0x71351
0000000000071306	movq	%rax, -0x38(%rbp)
000000000007130a	jmp	0x71330
000000000007130c	movq	%rax, -0x38(%rbp)
0000000000071310	jmp	0x71338
0000000000071312	movq	%rax, -0x38(%rbp)
0000000000071316	jmp	0x71340
0000000000071318	movq	%rax, -0x38(%rbp)
000000000007131c	jmp	0x71348
000000000007131e	movq	%rax, -0x38(%rbp)
0000000000071322	jmp	0x71351
0000000000071324	movq	%rax, -0x38(%rbp)
0000000000071328	movq	%r14, %rdi
000000000007132b	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000071330	movq	%r13, %rdi
0000000000071333	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000071338	movq	%r12, %rdi
000000000007133b	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000071340	movq	%r15, %rdi
0000000000071343	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000071348	movq	-0x40(%rbp), %rdi
000000000007134c	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000071351	movq	%rbx, %rdi
0000000000071354	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000071359	movq	-0x38(%rbp), %rdi
000000000007135d	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
