__ZN11OZChannel3DC2EdddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
0000000000048d46	pushq	%rbp
0000000000048d47	movq	%rsp, %rbp
0000000000048d4a	pushq	%r15
0000000000048d4c	pushq	%r14
0000000000048d4e	pushq	%r13
0000000000048d50	pushq	%r12
0000000000048d52	pushq	%rbx
0000000000048d53	subq	$0x48, %rsp
0000000000048d57	movl	%r9d, %r15d
0000000000048d5a	movl	%r8d, -0x38(%rbp)
0000000000048d5e	movl	%ecx, -0x34(%rbp)
0000000000048d61	movq	%rdx, -0x58(%rbp)
0000000000048d65	movq	%rsi, %r12
0000000000048d68	movsd	%xmm2, -0x40(%rbp)
0000000000048d6d	movsd	%xmm1, -0x50(%rbp)
0000000000048d72	movsd	%xmm0, -0x48(%rbp)
0000000000048d77	movq	%rdi, %rbx
0000000000048d7a	movq	0x18(%rbp), %r14
0000000000048d7e	movq	0x10(%rbp), %r13
0000000000048d82	callq	__ZN19OZChannel3D_Factory11getInstanceEv ## OZChannel3D_Factory::getInstance()
0000000000048d87	movq	%r14, 0x10(%rsp)
0000000000048d8c	movq	%r13, 0x8(%rsp)
0000000000048d91	movl	%r15d, (%rsp)
0000000000048d95	movq	%rbx, %rdi
0000000000048d98	movsd	-0x48(%rbp), %xmm0
0000000000048d9d	movsd	-0x50(%rbp), %xmm1
0000000000048da2	movq	%rax, %rsi
0000000000048da5	movq	%r12, %rdx
0000000000048da8	movq	-0x58(%rbp), %rcx
0000000000048dac	movl	-0x34(%rbp), %r8d
0000000000048db0	movl	-0x38(%rbp), %r9d
0000000000048db4	callq	__ZN11OZChannel2DC2EddP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannel2D::OZChannel2D(double, double, OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000048db9	leaq	0x8dd80(%rip), %rax
0000000000048dc0	movq	%rax, (%rbx)
0000000000048dc3	leaq	0x8e0c6(%rip), %rax
0000000000048dca	movq	%rax, 0x10(%rbx)
0000000000048dce	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000048dd3	leaq	0x9c1f6(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000048dda	leaq	-0x30(%rbp), %rdi
0000000000048dde	movq	%rax, %rdx
0000000000048de1	xorl	%ecx, %ecx
0000000000048de3	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000048de8	leaq	0x1b8(%rbx), %rdi
0000000000048def	movq	0x18(%rbp), %rax
0000000000048df3	movq	%rax, (%rsp)
0000000000048df7	leaq	-0x30(%rbp), %rsi
0000000000048dfb	movsd	-0x40(%rbp), %xmm0
0000000000048e00	movq	%rbx, %rdx
0000000000048e03	movl	$0x3, %ecx
0000000000048e08	xorl	%r8d, %r8d
0000000000048e0b	movq	0x10(%rbp), %r9
0000000000048e0f	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000048e14	leaq	-0x30(%rbp), %rdi
0000000000048e18	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000048e1d	addq	$0x48, %rsp
0000000000048e21	popq	%rbx
0000000000048e22	popq	%r12
0000000000048e24	popq	%r13
0000000000048e26	popq	%r14
0000000000048e28	popq	%r15
0000000000048e2a	popq	%rbp
0000000000048e2b	retq
0000000000048e2c	movq	%rax, %r14
0000000000048e2f	leaq	-0x30(%rbp), %rdi
0000000000048e33	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000048e38	jmp	0x48e3d
0000000000048e3a	movq	%rax, %r14
0000000000048e3d	movq	%rbx, %rdi
0000000000048e40	callq	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
0000000000048e45	movq	%r14, %rdi
0000000000048e48	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000048e4d	nop
