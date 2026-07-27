__ZN11OZChannel3DC2EdddP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
0000000000048c7e	pushq	%rbp
0000000000048c7f	movq	%rsp, %rbp
0000000000048c82	pushq	%r15
0000000000048c84	pushq	%r14
0000000000048c86	pushq	%rbx
0000000000048c87	subq	$0x28, %rsp
0000000000048c8b	movsd	%xmm2, -0x28(%rbp)
0000000000048c90	movq	%rdi, %rbx
0000000000048c93	movq	0x20(%rbp), %r15
0000000000048c97	movq	0x18(%rbp), %r14
0000000000048c9b	movl	0x10(%rbp), %eax
0000000000048c9e	movq	%r15, 0x10(%rsp)
0000000000048ca3	movq	%r14, 0x8(%rsp)
0000000000048ca8	movl	%eax, (%rsp)
0000000000048cab	callq	__ZN11OZChannel2DC2EddP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannel2D::OZChannel2D(double, double, OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000048cb0	leaq	0x8de89(%rip), %rax
0000000000048cb7	movq	%rax, (%rbx)
0000000000048cba	leaq	0x8e1cf(%rip), %rax
0000000000048cc1	movq	%rax, 0x10(%rbx)
0000000000048cc5	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000048cca	leaq	0x9c2ff(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000048cd1	leaq	-0x20(%rbp), %rdi
0000000000048cd5	movq	%rax, %rdx
0000000000048cd8	xorl	%ecx, %ecx
0000000000048cda	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000048cdf	leaq	0x1b8(%rbx), %rdi
0000000000048ce6	movq	%r15, (%rsp)
0000000000048cea	leaq	-0x20(%rbp), %rsi
0000000000048cee	movsd	-0x28(%rbp), %xmm0
0000000000048cf3	movq	%rbx, %rdx
0000000000048cf6	movl	$0x3, %ecx
0000000000048cfb	xorl	%r8d, %r8d
0000000000048cfe	movq	%r14, %r9
0000000000048d01	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000048d06	leaq	-0x20(%rbp), %rdi
0000000000048d0a	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000048d0f	addq	$0x28, %rsp
0000000000048d13	popq	%rbx
0000000000048d14	popq	%r14
0000000000048d16	popq	%r15
0000000000048d18	popq	%rbp
0000000000048d19	retq
0000000000048d1a	movq	%rax, %r14
0000000000048d1d	leaq	-0x20(%rbp), %rdi
0000000000048d21	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000048d26	jmp	0x48d2b
0000000000048d28	movq	%rax, %r14
0000000000048d2b	movq	%rbx, %rdi
0000000000048d2e	callq	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
0000000000048d33	movq	%r14, %rdi
0000000000048d36	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000048d3b	nop
