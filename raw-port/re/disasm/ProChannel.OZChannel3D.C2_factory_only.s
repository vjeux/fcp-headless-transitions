__ZN11OZChannel3DC2EP9OZFactoryRK8PCStringjjP13OZChannelImplP13OZChannelInfo:
0000000000049034	pushq	%rbp
0000000000049035	movq	%rsp, %rbp
0000000000049038	pushq	%r15
000000000004903a	pushq	%r14
000000000004903c	pushq	%rbx
000000000004903d	subq	$0x18, %rsp
0000000000049041	movq	%r9, %r14
0000000000049044	movq	%rdi, %rbx
0000000000049047	movq	0x10(%rbp), %r15
000000000004904b	movq	%r15, (%rsp)
000000000004904f	callq	__ZN11OZChannel2DC2EP9OZFactoryRK8PCStringjjP13OZChannelImplP13OZChannelInfo ## OZChannel2D::OZChannel2D(OZFactory*, PCString const&, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000049054	leaq	0x8dae5(%rip), %rax
000000000004905b	movq	%rax, (%rbx)
000000000004905e	leaq	0x8de2b(%rip), %rax
0000000000049065	movq	%rax, 0x10(%rbx)
0000000000049069	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000004906e	leaq	0x9bf5b(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000049075	leaq	-0x20(%rbp), %rdi
0000000000049079	movq	%rax, %rdx
000000000004907c	xorl	%ecx, %ecx
000000000004907e	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000049083	leaq	0x1b8(%rbx), %rdi
000000000004908a	movq	%r15, (%rsp)
000000000004908e	leaq	-0x20(%rbp), %rsi
0000000000049092	movq	%rbx, %rdx
0000000000049095	movl	$0x3, %ecx
000000000004909a	xorl	%r8d, %r8d
000000000004909d	movq	%r14, %r9
00000000000490a0	callq	__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000490a5	leaq	-0x20(%rbp), %rdi
00000000000490a9	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000490ae	addq	$0x18, %rsp
00000000000490b2	popq	%rbx
00000000000490b3	popq	%r14
00000000000490b5	popq	%r15
00000000000490b7	popq	%rbp
00000000000490b8	retq
00000000000490b9	movq	%rax, %r14
00000000000490bc	leaq	-0x20(%rbp), %rdi
00000000000490c0	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000490c5	jmp	0x490ca
00000000000490c7	movq	%rax, %r14
00000000000490ca	movq	%rbx, %rdi
00000000000490cd	callq	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
00000000000490d2	movq	%r14, %rdi
00000000000490d5	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
