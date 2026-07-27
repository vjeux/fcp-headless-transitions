__ZN11OZChannel2DC2EddP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
0000000000047172	pushq	%rbp
0000000000047173	movq	%rsp, %rbp
0000000000047176	pushq	%r15
0000000000047178	pushq	%r14
000000000004717a	pushq	%r12
000000000004717c	pushq	%rbx
000000000004717d	subq	$0x30, %rsp
0000000000047181	movsd	%xmm1, -0x30(%rbp)
0000000000047186	movsd	%xmm0, -0x38(%rbp)
000000000004718b	movq	%rdi, %rbx
000000000004718e	movl	0x10(%rbp), %eax
0000000000047191	movl	%eax, 0x8(%rsp)
0000000000047195	movl	$0x0, (%rsp)
000000000004719c	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
00000000000471a1	leaq	0x8f5e0(%rip), %rax
00000000000471a8	movq	%rax, (%rbx)
00000000000471ab	leaq	0x8f91e(%rip), %rax
00000000000471b2	movq	%rax, 0x10(%rbx)
00000000000471b6	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000471bb	leaq	0x9ddae(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000471c2	leaq	-0x28(%rbp), %rdi
00000000000471c6	movq	%rax, %rdx
00000000000471c9	xorl	%ecx, %ecx
00000000000471cb	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000471d0	movq	0x20(%rbp), %r12
00000000000471d4	movq	0x18(%rbp), %r15
00000000000471d8	leaq	0x88(%rbx), %r14
00000000000471df	movq	%r12, (%rsp)
00000000000471e3	leaq	-0x28(%rbp), %rsi
00000000000471e7	movq	%r14, %rdi
00000000000471ea	movsd	-0x38(%rbp), %xmm0
00000000000471ef	movq	%rbx, %rdx
00000000000471f2	movl	$0x1, %ecx
00000000000471f7	xorl	%r8d, %r8d
00000000000471fa	movq	%r15, %r9
00000000000471fd	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000047202	leaq	-0x28(%rbp), %rdi
0000000000047206	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000004720b	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000047210	leaq	0x9dd79(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000047217	leaq	-0x28(%rbp), %rdi
000000000004721b	movq	%rax, %rdx
000000000004721e	xorl	%ecx, %ecx
0000000000047220	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000047225	leaq	0x120(%rbx), %rdi
000000000004722c	movq	%r12, (%rsp)
0000000000047230	leaq	-0x28(%rbp), %rsi
0000000000047234	movsd	-0x30(%rbp), %xmm0
0000000000047239	movq	%rbx, %rdx
000000000004723c	movl	$0x2, %ecx
0000000000047241	xorl	%r8d, %r8d
0000000000047244	movq	%r15, %r9
0000000000047247	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000004724c	leaq	-0x28(%rbp), %rdi
0000000000047250	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000047255	addq	$0x30, %rsp
0000000000047259	popq	%rbx
000000000004725a	popq	%r12
000000000004725c	popq	%r14
000000000004725e	popq	%r15
0000000000047260	popq	%rbp
0000000000047261	retq
0000000000047262	movq	%rax, %r15
0000000000047265	leaq	-0x28(%rbp), %rdi
0000000000047269	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000004726e	jmp	0x47281
0000000000047270	movq	%rax, %r15
0000000000047273	leaq	-0x28(%rbp), %rdi
0000000000047277	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000004727c	jmp	0x4728e
000000000004727e	movq	%rax, %r15
0000000000047281	movq	%r14, %rdi
0000000000047284	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000047289	jmp	0x4728e
000000000004728b	movq	%rax, %r15
000000000004728e	movq	%rbx, %rdi
0000000000047291	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000047296	movq	%r15, %rdi
0000000000047299	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
