__ZN11OZChannel2DC2EddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
0000000000047392	pushq	%rbp
0000000000047393	movq	%rsp, %rbp
0000000000047396	pushq	%r15
0000000000047398	pushq	%r14
000000000004739a	pushq	%r13
000000000004739c	pushq	%r12
000000000004739e	pushq	%rbx
000000000004739f	subq	$0x38, %rsp
00000000000473a3	movl	%r9d, %r14d
00000000000473a6	movl	%r8d, -0x34(%rbp)
00000000000473aa	movl	%ecx, %r12d
00000000000473ad	movq	%rdx, %r13
00000000000473b0	movq	%rsi, %r15
00000000000473b3	movsd	%xmm1, -0x40(%rbp)
00000000000473b8	movsd	%xmm0, -0x48(%rbp)
00000000000473bd	movq	%rdi, %rbx
00000000000473c0	callq	__ZN19OZChannel2D_Factory11getInstanceEv ## OZChannel2D_Factory::getInstance()
00000000000473c5	movl	%r14d, 0x8(%rsp)
00000000000473ca	movl	$0x0, (%rsp)
00000000000473d1	movq	%rbx, %rdi
00000000000473d4	movq	%rax, %rsi
00000000000473d7	movq	%r15, %rdx
00000000000473da	movq	%r13, %rcx
00000000000473dd	movl	%r12d, %r8d
00000000000473e0	movl	-0x34(%rbp), %r9d
00000000000473e4	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
00000000000473e9	leaq	0x8f398(%rip), %rax
00000000000473f0	movq	%rax, (%rbx)
00000000000473f3	leaq	0x8f6d6(%rip), %rax
00000000000473fa	movq	%rax, 0x10(%rbx)
00000000000473fe	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000047403	leaq	0x9db66(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000004740a	leaq	-0x30(%rbp), %rdi
000000000004740e	movq	%rax, %rdx
0000000000047411	xorl	%ecx, %ecx
0000000000047413	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000047418	movq	0x18(%rbp), %r12
000000000004741c	movq	0x10(%rbp), %r15
0000000000047420	leaq	0x88(%rbx), %r14
0000000000047427	movq	%r12, (%rsp)
000000000004742b	leaq	-0x30(%rbp), %rsi
000000000004742f	movq	%r14, %rdi
0000000000047432	movsd	-0x48(%rbp), %xmm0
0000000000047437	movq	%rbx, %rdx
000000000004743a	movl	$0x1, %ecx
000000000004743f	xorl	%r8d, %r8d
0000000000047442	movq	%r15, %r9
0000000000047445	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000004744a	leaq	-0x30(%rbp), %rdi
000000000004744e	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000047453	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000047458	leaq	0x9db31(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000004745f	leaq	-0x30(%rbp), %rdi
0000000000047463	movq	%rax, %rdx
0000000000047466	xorl	%ecx, %ecx
0000000000047468	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000004746d	leaq	0x120(%rbx), %rdi
0000000000047474	movq	%r12, (%rsp)
0000000000047478	leaq	-0x30(%rbp), %rsi
000000000004747c	movsd	-0x40(%rbp), %xmm0
0000000000047481	movq	%rbx, %rdx
0000000000047484	movl	$0x2, %ecx
0000000000047489	xorl	%r8d, %r8d
000000000004748c	movq	%r15, %r9
000000000004748f	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000047494	leaq	-0x30(%rbp), %rdi
0000000000047498	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000004749d	addq	$0x38, %rsp
00000000000474a1	popq	%rbx
00000000000474a2	popq	%r12
00000000000474a4	popq	%r13
00000000000474a6	popq	%r14
00000000000474a8	popq	%r15
00000000000474aa	popq	%rbp
00000000000474ab	retq
00000000000474ac	movq	%rax, %r15
00000000000474af	leaq	-0x30(%rbp), %rdi
00000000000474b3	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000474b8	jmp	0x474cb
00000000000474ba	movq	%rax, %r15
00000000000474bd	leaq	-0x30(%rbp), %rdi
00000000000474c1	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000474c6	jmp	0x474d8
00000000000474c8	movq	%rax, %r15
00000000000474cb	movq	%r14, %rdi
00000000000474ce	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
00000000000474d3	jmp	0x474d8
00000000000474d5	movq	%rax, %r15
00000000000474d8	movq	%rbx, %rdi
00000000000474db	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
00000000000474e0	movq	%r15, %rdi
00000000000474e3	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
