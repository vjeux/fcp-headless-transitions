__ZN15OZChannelBool3DC2EP9OZFactoryRK8PCStringjj:
00000000000532f6	pushq	%rbp
00000000000532f7	movq	%rsp, %rbp
00000000000532fa	pushq	%r15
00000000000532fc	pushq	%r14
00000000000532fe	pushq	%r12
0000000000053300	pushq	%rbx
0000000000053301	subq	$0x10, %rsp
0000000000053305	movq	%rdi, %rbx
0000000000053308	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringjj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, unsigned int, unsigned int)
000000000005330d	leaq	0x84a0c(%rip), %rax
0000000000053314	movq	%rax, (%rbx)
0000000000053317	leaq	0x84d3a(%rip), %rax
000000000005331e	movq	%rax, 0x10(%rbx)
0000000000053322	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000053327	leaq	0x91c42(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000005332e	leaq	-0x28(%rbp), %rdi
0000000000053332	movq	%rax, %rdx
0000000000053335	xorl	%ecx, %ecx
0000000000053337	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000005333c	leaq	0x88(%rbx), %r14
0000000000053343	movq	$0x0, (%rsp)
000000000005334b	leaq	-0x28(%rbp), %rsi
000000000005334f	movq	%r14, %rdi
0000000000053352	movq	%rbx, %rdx
0000000000053355	movl	$0x1, %ecx
000000000005335a	xorl	%r8d, %r8d
000000000005335d	xorl	%r9d, %r9d
0000000000053360	callq	__ZN13OZChannelBoolC1ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000053365	leaq	-0x28(%rbp), %rdi
0000000000053369	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000005336e	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000053373	leaq	0x91c16(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000005337a	leaq	-0x28(%rbp), %rdi
000000000005337e	movq	%rax, %rdx
0000000000053381	xorl	%ecx, %ecx
0000000000053383	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000053388	leaq	0x120(%rbx), %r15
000000000005338f	movq	$0x0, (%rsp)
0000000000053397	leaq	-0x28(%rbp), %rsi
000000000005339b	movq	%r15, %rdi
000000000005339e	movq	%rbx, %rdx
00000000000533a1	movl	$0x2, %ecx
00000000000533a6	xorl	%r8d, %r8d
00000000000533a9	xorl	%r9d, %r9d
00000000000533ac	callq	__ZN13OZChannelBoolC1ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000533b1	leaq	-0x28(%rbp), %rdi
00000000000533b5	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000533ba	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000533bf	leaq	0x91c0a(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000533c6	leaq	-0x28(%rbp), %rdi
00000000000533ca	movq	%rax, %rdx
00000000000533cd	xorl	%ecx, %ecx
00000000000533cf	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000533d4	leaq	0x1b8(%rbx), %rdi
00000000000533db	movq	$0x0, (%rsp)
00000000000533e3	leaq	-0x28(%rbp), %rsi
00000000000533e7	movq	%rbx, %rdx
00000000000533ea	movl	$0x3, %ecx
00000000000533ef	xorl	%r8d, %r8d
00000000000533f2	xorl	%r9d, %r9d
00000000000533f5	callq	__ZN13OZChannelBoolC1ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000533fa	leaq	-0x28(%rbp), %rdi
00000000000533fe	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000053403	addq	$0x10, %rsp
0000000000053407	popq	%rbx
0000000000053408	popq	%r12
000000000005340a	popq	%r14
000000000005340c	popq	%r15
000000000005340e	popq	%rbp
000000000005340f	retq
0000000000053410	movq	%rax, %r12
0000000000053413	leaq	-0x28(%rbp), %rdi
0000000000053417	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000005341c	jmp	0x5343d
000000000005341e	movq	%rax, %r12
0000000000053421	leaq	-0x28(%rbp), %rdi
0000000000053425	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000005342a	jmp	0x5344a
000000000005342c	movq	%rax, %r12
000000000005342f	leaq	-0x28(%rbp), %rdi
0000000000053433	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000053438	jmp	0x53457
000000000005343a	movq	%rax, %r12
000000000005343d	movq	%r15, %rdi
0000000000053440	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
0000000000053445	jmp	0x5344a
0000000000053447	movq	%rax, %r12
000000000005344a	movq	%r14, %rdi
000000000005344d	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
0000000000053452	jmp	0x53457
0000000000053454	movq	%rax, %r12
0000000000053457	movq	%rbx, %rdi
000000000005345a	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
000000000005345f	movq	%r12, %rdi
0000000000053462	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000053467	nop
