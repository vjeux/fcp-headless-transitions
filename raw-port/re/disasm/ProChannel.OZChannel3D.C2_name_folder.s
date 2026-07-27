__ZN11OZChannel3DC2ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
0000000000048f44	pushq	%rbp
0000000000048f45	movq	%rsp, %rbp
0000000000048f48	pushq	%r15
0000000000048f4a	pushq	%r14
0000000000048f4c	pushq	%r13
0000000000048f4e	pushq	%r12
0000000000048f50	pushq	%rbx
0000000000048f51	subq	$0x28, %rsp
0000000000048f55	movl	%r9d, %r15d
0000000000048f58	movl	%r8d, -0x34(%rbp)
0000000000048f5c	movl	%ecx, %r13d
0000000000048f5f	movq	%rdx, %r14
0000000000048f62	movq	%rsi, %r12
0000000000048f65	movq	%rdi, %rbx
0000000000048f68	callq	__ZN19OZChannel3D_Factory11getInstanceEv ## OZChannel3D_Factory::getInstance()
0000000000048f6d	movq	0x18(%rbp), %rcx
0000000000048f71	movq	%rcx, 0x10(%rsp)
0000000000048f76	movq	0x10(%rbp), %rcx
0000000000048f7a	movq	%rcx, 0x8(%rsp)
0000000000048f7f	movl	%r15d, (%rsp)
0000000000048f83	movq	%rbx, %rdi
0000000000048f86	movq	%rax, %rsi
0000000000048f89	movq	%r12, %rdx
0000000000048f8c	movq	%r14, %rcx
0000000000048f8f	movl	%r13d, %r8d
0000000000048f92	movl	-0x34(%rbp), %r9d
0000000000048f96	callq	__ZN11OZChannel2DC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannel2D::OZChannel2D(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000048f9b	leaq	0x8db9e(%rip), %rax
0000000000048fa2	movq	%rax, (%rbx)
0000000000048fa5	leaq	0x8dee4(%rip), %rax
0000000000048fac	movq	%rax, 0x10(%rbx)
0000000000048fb0	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000048fb5	leaq	0x9c014(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000048fbc	leaq	-0x30(%rbp), %rdi
0000000000048fc0	movq	%rax, %rdx
0000000000048fc3	xorl	%ecx, %ecx
0000000000048fc5	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000048fca	leaq	0x1b8(%rbx), %rdi
0000000000048fd1	movq	0x18(%rbp), %rax
0000000000048fd5	movq	%rax, (%rsp)
0000000000048fd9	leaq	-0x30(%rbp), %rsi
0000000000048fdd	movq	%rbx, %rdx
0000000000048fe0	movl	$0x3, %ecx
0000000000048fe5	xorl	%r8d, %r8d
0000000000048fe8	movq	0x10(%rbp), %r9
0000000000048fec	callq	__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000048ff1	leaq	-0x30(%rbp), %rdi
0000000000048ff5	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000048ffa	addq	$0x28, %rsp
0000000000048ffe	popq	%rbx
0000000000048fff	popq	%r12
0000000000049001	popq	%r13
0000000000049003	popq	%r14
0000000000049005	popq	%r15
0000000000049007	popq	%rbp
0000000000049008	retq
0000000000049009	movq	%rax, %r14
000000000004900c	leaq	-0x30(%rbp), %rdi
0000000000049010	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000049015	jmp	0x4901a
0000000000049017	movq	%rax, %r14
000000000004901a	movq	%rbx, %rdi
000000000004901d	callq	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
0000000000049022	movq	%r14, %rdi
0000000000049025	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
