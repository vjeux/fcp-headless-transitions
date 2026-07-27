__ZN11OZChannel2DC2EddP9OZFactoryRK8PCStringS4_S4_P15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
00000000000472a8	pushq	%rbp
00000000000472a9	movq	%rsp, %rbp
00000000000472ac	pushq	%r15
00000000000472ae	pushq	%r14
00000000000472b0	pushq	%r13
00000000000472b2	pushq	%r12
00000000000472b4	pushq	%rbx
00000000000472b5	subq	$0x28, %rsp
00000000000472b9	movq	%r9, %rax
00000000000472bc	movq	%r8, %r14
00000000000472bf	movq	%rcx, %r13
00000000000472c2	movsd	%xmm1, -0x30(%rbp)
00000000000472c7	movsd	%xmm0, -0x38(%rbp)
00000000000472cc	movq	%rdi, %rbx
00000000000472cf	movq	0x30(%rbp), %r15
00000000000472d3	movl	0x10(%rbp), %r8d
00000000000472d7	movl	0x18(%rbp), %r9d
00000000000472db	movl	0x20(%rbp), %ecx
00000000000472de	movl	%ecx, 0x8(%rsp)
00000000000472e2	movl	$0x0, (%rsp)
00000000000472e9	movq	%rax, %rcx
00000000000472ec	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
00000000000472f1	leaq	0x8f490(%rip), %rax
00000000000472f8	movq	%rax, (%rbx)
00000000000472fb	leaq	0x8f7ce(%rip), %rax
0000000000047302	movq	%rax, 0x10(%rbx)
0000000000047306	leaq	0x88(%rbx), %r12
000000000004730d	movq	%r15, (%rsp)
0000000000047311	movq	%r12, %rdi
0000000000047314	movsd	-0x38(%rbp), %xmm0
0000000000047319	movq	%r13, %rsi
000000000004731c	movq	0x28(%rbp), %r13
0000000000047320	movq	%rbx, %rdx
0000000000047323	movl	$0x1, %ecx
0000000000047328	xorl	%r8d, %r8d
000000000004732b	movq	%r13, %r9
000000000004732e	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000047333	leaq	0x120(%rbx), %rdi
000000000004733a	movq	%r15, (%rsp)
000000000004733e	movsd	-0x30(%rbp), %xmm0
0000000000047343	movq	%r14, %rsi
0000000000047346	movq	%rbx, %rdx
0000000000047349	movl	$0x2, %ecx
000000000004734e	xorl	%r8d, %r8d
0000000000047351	movq	%r13, %r9
0000000000047354	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000047359	addq	$0x28, %rsp
000000000004735d	popq	%rbx
000000000004735e	popq	%r12
0000000000047360	popq	%r13
0000000000047362	popq	%r14
0000000000047364	popq	%r15
0000000000047366	popq	%rbp
0000000000047367	retq
0000000000047368	movq	%rax, %r14
000000000004736b	movq	%r12, %rdi
000000000004736e	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000047373	jmp	0x47378
0000000000047375	movq	%rax, %r14
0000000000047378	movq	%rbx, %rdi
000000000004737b	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000047380	movq	%r14, %rdi
0000000000047383	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
