__ZN11OZChannel2DC2EddRK8PCStringS2_S2_P15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
00000000000474f2	pushq	%rbp
00000000000474f3	movq	%rsp, %rbp
00000000000474f6	pushq	%r15
00000000000474f8	pushq	%r14
00000000000474fa	pushq	%r13
00000000000474fc	pushq	%r12
00000000000474fe	pushq	%rbx
00000000000474ff	subq	$0x28, %rsp
0000000000047503	movl	%r9d, %r12d
0000000000047506	movq	%r8, %r15
0000000000047509	movq	%rcx, -0x38(%rbp)
000000000004750d	movq	%rdx, %r13
0000000000047510	movq	%rsi, %r14
0000000000047513	movsd	%xmm1, -0x30(%rbp)
0000000000047518	movsd	%xmm0, -0x40(%rbp)
000000000004751d	movq	%rdi, %rbx
0000000000047520	callq	__ZN19OZChannel2D_Factory11getInstanceEv ## OZChannel2D_Factory::getInstance()
0000000000047525	movl	0x18(%rbp), %ecx
0000000000047528	movl	%ecx, 0x8(%rsp)
000000000004752c	movl	$0x0, (%rsp)
0000000000047533	movq	%rbx, %rdi
0000000000047536	movq	%rax, %rsi
0000000000047539	movq	%r14, %rdx
000000000004753c	movq	0x20(%rbp), %r14
0000000000047540	movq	%r15, %rcx
0000000000047543	movq	0x28(%rbp), %r15
0000000000047547	movl	%r12d, %r8d
000000000004754a	movl	0x10(%rbp), %r9d
000000000004754e	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
0000000000047553	leaq	0x8f22e(%rip), %rax
000000000004755a	movq	%rax, (%rbx)
000000000004755d	leaq	0x8f56c(%rip), %rax
0000000000047564	movq	%rax, 0x10(%rbx)
0000000000047568	leaq	0x88(%rbx), %r12
000000000004756f	movq	%r15, (%rsp)
0000000000047573	movq	%r12, %rdi
0000000000047576	movsd	-0x40(%rbp), %xmm0
000000000004757b	movq	%r13, %rsi
000000000004757e	movq	%rbx, %rdx
0000000000047581	movl	$0x1, %ecx
0000000000047586	xorl	%r8d, %r8d
0000000000047589	movq	%r14, %r9
000000000004758c	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000047591	leaq	0x120(%rbx), %rdi
0000000000047598	movq	%r15, (%rsp)
000000000004759c	movsd	-0x30(%rbp), %xmm0
00000000000475a1	movq	-0x38(%rbp), %rsi
00000000000475a5	movq	%rbx, %rdx
00000000000475a8	movl	$0x2, %ecx
00000000000475ad	xorl	%r8d, %r8d
00000000000475b0	movq	%r14, %r9
00000000000475b3	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000475b8	addq	$0x28, %rsp
00000000000475bc	popq	%rbx
00000000000475bd	popq	%r12
00000000000475bf	popq	%r13
00000000000475c1	popq	%r14
00000000000475c3	popq	%r15
00000000000475c5	popq	%rbp
00000000000475c6	retq
00000000000475c7	movq	%rax, %r14
00000000000475ca	movq	%r12, %rdi
00000000000475cd	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
00000000000475d2	jmp	0x475d7
00000000000475d4	movq	%rax, %r14
00000000000475d7	movq	%rbx, %rdi
00000000000475da	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
00000000000475df	movq	%r14, %rdi
00000000000475e2	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000475e7	nop
