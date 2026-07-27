__ZN11OZChannel2DC2EP9OZFactoryRK8PCStringjjP13OZChannelImplP13OZChannelInfo:
0000000000047742	pushq	%rbp
0000000000047743	movq	%rsp, %rbp
0000000000047746	pushq	%r15
0000000000047748	pushq	%r14
000000000004774a	pushq	%r12
000000000004774c	pushq	%rbx
000000000004774d	subq	$0x10, %rsp
0000000000047751	movq	%r9, %r14
0000000000047754	movq	%rdi, %rbx
0000000000047757	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringjj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, unsigned int, unsigned int)
000000000004775c	leaq	0x8f025(%rip), %rax
0000000000047763	movq	%rax, (%rbx)
0000000000047766	leaq	0x8f363(%rip), %rax
000000000004776d	movq	%rax, 0x10(%rbx)
0000000000047771	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000047776	leaq	0x9d7f3(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000004777d	leaq	-0x28(%rbp), %rdi
0000000000047781	movq	%rax, %rdx
0000000000047784	xorl	%ecx, %ecx
0000000000047786	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000004778b	movq	0x10(%rbp), %r12
000000000004778f	leaq	0x88(%rbx), %r15
0000000000047796	movq	%r12, (%rsp)
000000000004779a	leaq	-0x28(%rbp), %rsi
000000000004779e	movq	%r15, %rdi
00000000000477a1	movq	%rbx, %rdx
00000000000477a4	movl	$0x1, %ecx
00000000000477a9	xorl	%r8d, %r8d
00000000000477ac	movq	%r14, %r9
00000000000477af	callq	__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000477b4	leaq	-0x28(%rbp), %rdi
00000000000477b8	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000477bd	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000477c2	leaq	0x9d7c7(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000477c9	leaq	-0x28(%rbp), %rdi
00000000000477cd	movq	%rax, %rdx
00000000000477d0	xorl	%ecx, %ecx
00000000000477d2	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000477d7	leaq	0x120(%rbx), %rdi
00000000000477de	movq	%r12, (%rsp)
00000000000477e2	leaq	-0x28(%rbp), %rsi
00000000000477e6	movq	%rbx, %rdx
00000000000477e9	movl	$0x2, %ecx
00000000000477ee	xorl	%r8d, %r8d
00000000000477f1	movq	%r14, %r9
00000000000477f4	callq	__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000477f9	leaq	-0x28(%rbp), %rdi
00000000000477fd	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000047802	addq	$0x10, %rsp
0000000000047806	popq	%rbx
0000000000047807	popq	%r12
0000000000047809	popq	%r14
000000000004780b	popq	%r15
000000000004780d	popq	%rbp
000000000004780e	retq
000000000004780f	movq	%rax, %r14
0000000000047812	leaq	-0x28(%rbp), %rdi
0000000000047816	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000004781b	jmp	0x4782e
000000000004781d	movq	%rax, %r14
0000000000047820	leaq	-0x28(%rbp), %rdi
0000000000047824	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000047829	jmp	0x4783b
000000000004782b	movq	%rax, %r14
000000000004782e	movq	%r15, %rdi
0000000000047831	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000047836	jmp	0x4783b
0000000000047838	movq	%rax, %r14
000000000004783b	movq	%rbx, %rdi
000000000004783e	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000047843	movq	%r14, %rdi
0000000000047846	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000004784b	nop
