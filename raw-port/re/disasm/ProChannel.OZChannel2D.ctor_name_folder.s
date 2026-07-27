__ZN11OZChannel2DC2ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
00000000000475f2	pushq	%rbp
00000000000475f3	movq	%rsp, %rbp
00000000000475f6	pushq	%r15
00000000000475f8	pushq	%r14
00000000000475fa	pushq	%r13
00000000000475fc	pushq	%r12
00000000000475fe	pushq	%rbx
00000000000475ff	subq	$0x28, %rsp
0000000000047603	movl	%r9d, %r14d
0000000000047606	movl	%r8d, -0x34(%rbp)
000000000004760a	movl	%ecx, %r15d
000000000004760d	movq	%rdx, %r13
0000000000047610	movq	%rsi, %rbx
0000000000047613	movq	%rdi, %r12
0000000000047616	callq	__ZN19OZChannel2D_Factory11getInstanceEv ## OZChannel2D_Factory::getInstance()
000000000004761b	movl	%r14d, 0x8(%rsp)
0000000000047620	movl	$0x0, (%rsp)
0000000000047627	movq	%r12, %rdi
000000000004762a	movq	%rax, %rsi
000000000004762d	movq	%rbx, %rdx
0000000000047630	movq	%r13, %rcx
0000000000047633	movl	%r15d, %r8d
0000000000047636	movl	-0x34(%rbp), %r9d
000000000004763a	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
000000000004763f	leaq	0x8f142(%rip), %rax
0000000000047646	movq	%rax, (%r12)
000000000004764a	leaq	0x8f47f(%rip), %rax
0000000000047651	movq	%rax, 0x10(%r12)
0000000000047656	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000004765b	leaq	0x9d90e(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000047662	leaq	-0x30(%rbp), %rdi
0000000000047666	movq	%rax, %rdx
0000000000047669	xorl	%ecx, %ecx
000000000004766b	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000047670	movq	0x18(%rbp), %rbx
0000000000047674	movq	0x10(%rbp), %r15
0000000000047678	leaq	0x88(%r12), %r14
0000000000047680	movq	%rbx, (%rsp)
0000000000047684	leaq	-0x30(%rbp), %rsi
0000000000047688	movq	%r14, %rdi
000000000004768b	movq	%r12, %rdx
000000000004768e	movl	$0x1, %ecx
0000000000047693	xorl	%r8d, %r8d
0000000000047696	movq	%r15, %r9
0000000000047699	callq	__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000004769e	leaq	-0x30(%rbp), %rdi
00000000000476a2	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000476a7	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000476ac	leaq	0x9d8dd(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000476b3	leaq	-0x30(%rbp), %rdi
00000000000476b7	movq	%rax, %rdx
00000000000476ba	xorl	%ecx, %ecx
00000000000476bc	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000476c1	leaq	0x120(%r12), %rdi
00000000000476c9	movq	%rbx, (%rsp)
00000000000476cd	leaq	-0x30(%rbp), %rsi
00000000000476d1	movq	%r12, %rdx
00000000000476d4	movl	$0x2, %ecx
00000000000476d9	xorl	%r8d, %r8d
00000000000476dc	movq	%r15, %r9
00000000000476df	callq	__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000476e4	leaq	-0x30(%rbp), %rdi
00000000000476e8	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000476ed	addq	$0x28, %rsp
00000000000476f1	popq	%rbx
00000000000476f2	popq	%r12
00000000000476f4	popq	%r13
00000000000476f6	popq	%r14
00000000000476f8	popq	%r15
00000000000476fa	popq	%rbp
00000000000476fb	retq
00000000000476fc	movq	%rax, %r15
00000000000476ff	leaq	-0x30(%rbp), %rdi
0000000000047703	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000047708	jmp	0x4771b
000000000004770a	movq	%rax, %r15
000000000004770d	leaq	-0x30(%rbp), %rdi
0000000000047711	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000047716	jmp	0x47728
0000000000047718	movq	%rax, %r15
000000000004771b	movq	%r14, %rdi
000000000004771e	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000047723	jmp	0x47728
0000000000047725	movq	%rax, %r15
0000000000047728	movq	%r12, %rdi
000000000004772b	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000047730	movq	%r15, %rdi
0000000000047733	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
