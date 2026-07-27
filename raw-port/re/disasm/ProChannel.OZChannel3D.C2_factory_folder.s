__ZN11OZChannel3DC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
0000000000048bc0	pushq	%rbp
0000000000048bc1	movq	%rsp, %rbp
0000000000048bc4	pushq	%r15
0000000000048bc6	pushq	%r14
0000000000048bc8	pushq	%rbx
0000000000048bc9	subq	$0x28, %rsp
0000000000048bcd	movq	%rdi, %rbx
0000000000048bd0	movq	0x20(%rbp), %r15
0000000000048bd4	movq	0x18(%rbp), %r14
0000000000048bd8	movl	0x10(%rbp), %eax
0000000000048bdb	movq	%r15, 0x10(%rsp)
0000000000048be0	movq	%r14, 0x8(%rsp)
0000000000048be5	movl	%eax, (%rsp)
0000000000048be8	callq	__ZN11OZChannel2DC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannel2D::OZChannel2D(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000048bed	leaq	0x8df4c(%rip), %rax
0000000000048bf4	movq	%rax, (%rbx)
0000000000048bf7	leaq	0x8e292(%rip), %rax
0000000000048bfe	movq	%rax, 0x10(%rbx)
0000000000048c02	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000048c07	leaq	0x9c3c2(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000048c0e	leaq	-0x20(%rbp), %rdi
0000000000048c12	movq	%rax, %rdx
0000000000048c15	xorl	%ecx, %ecx
0000000000048c17	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000048c1c	leaq	0x1b8(%rbx), %rdi
0000000000048c23	movq	%r15, (%rsp)
0000000000048c27	leaq	-0x20(%rbp), %rsi
0000000000048c2b	movq	%rbx, %rdx
0000000000048c2e	movl	$0x3, %ecx
0000000000048c33	xorl	%r8d, %r8d
0000000000048c36	movq	%r14, %r9
0000000000048c39	callq	__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000048c3e	leaq	-0x20(%rbp), %rdi
0000000000048c42	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000048c47	addq	$0x28, %rsp
0000000000048c4b	popq	%rbx
0000000000048c4c	popq	%r14
0000000000048c4e	popq	%r15
0000000000048c50	popq	%rbp
0000000000048c51	retq
0000000000048c52	movq	%rax, %r14
0000000000048c55	leaq	-0x20(%rbp), %rdi
0000000000048c59	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000048c5e	jmp	0x48c63
0000000000048c60	movq	%rax, %r14
0000000000048c63	movq	%rbx, %rdi
0000000000048c66	callq	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
0000000000048c6b	movq	%r14, %rdi
0000000000048c6e	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000048c73	nop
