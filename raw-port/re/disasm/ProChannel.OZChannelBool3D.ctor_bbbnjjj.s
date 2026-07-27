__ZN15OZChannelBool3DC2EbbbRK8PCStringP15OZChannelFolderjjj:
0000000000052f86	pushq	%rbp
0000000000052f87	movq	%rsp, %rbp
0000000000052f8a	pushq	%r15
0000000000052f8c	pushq	%r14
0000000000052f8e	pushq	%r13
0000000000052f90	pushq	%r12
0000000000052f92	pushq	%rbx
0000000000052f93	subq	$0x28, %rsp
0000000000052f97	movq	%r9, %r14
0000000000052f9a	movq	%r8, %r15
0000000000052f9d	movl	%ecx, -0x34(%rbp)
0000000000052fa0	movl	%edx, -0x38(%rbp)
0000000000052fa3	movl	%esi, -0x3c(%rbp)
0000000000052fa6	movq	%rdi, %rbx
0000000000052fa9	movl	0x18(%rbp), %r13d
0000000000052fad	movl	0x20(%rbp), %r12d
0000000000052fb1	callq	__ZN23OZChannelBool3D_Factory11getInstanceEv ## OZChannelBool3D_Factory::getInstance()
0000000000052fb6	movl	%r12d, 0x8(%rsp)
0000000000052fbb	movl	$0x0, (%rsp)
0000000000052fc2	movq	%rbx, %rdi
0000000000052fc5	movq	%rax, %rsi
0000000000052fc8	movq	%r15, %rdx
0000000000052fcb	movq	%r14, %rcx
0000000000052fce	movl	0x10(%rbp), %r8d
0000000000052fd2	movl	%r13d, %r9d
0000000000052fd5	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
0000000000052fda	leaq	0x84d3f(%rip), %rax
0000000000052fe1	movq	%rax, (%rbx)
0000000000052fe4	leaq	0x8506d(%rip), %rax
0000000000052feb	movq	%rax, 0x10(%rbx)
0000000000052fef	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000052ff4	leaq	0x91f75(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000052ffb	leaq	-0x30(%rbp), %rdi
0000000000052fff	movq	%rax, %rdx
0000000000053002	xorl	%ecx, %ecx
0000000000053004	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000053009	leaq	0x88(%rbx), %r14
0000000000053010	xorps	%xmm0, %xmm0
0000000000053013	movups	%xmm0, (%rsp)
0000000000053017	leaq	-0x30(%rbp), %rdx
000000000005301b	movq	%r14, %rdi
000000000005301e	movl	-0x3c(%rbp), %esi
0000000000053021	movq	%rbx, %rcx
0000000000053024	movl	$0x1, %r8d
000000000005302a	xorl	%r9d, %r9d
000000000005302d	callq	__ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(int, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000053032	leaq	-0x30(%rbp), %rdi
0000000000053036	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000005303b	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000053040	leaq	0x91f49(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000053047	leaq	-0x30(%rbp), %rdi
000000000005304b	movq	%rax, %rdx
000000000005304e	xorl	%ecx, %ecx
0000000000053050	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000053055	leaq	0x120(%rbx), %r13
000000000005305c	movzbl	-0x38(%rbp), %esi
0000000000053060	xorps	%xmm0, %xmm0
0000000000053063	movups	%xmm0, (%rsp)
0000000000053067	leaq	-0x30(%rbp), %rdx
000000000005306b	movq	%r13, %rdi
000000000005306e	movq	%rbx, %rcx
0000000000053071	movl	$0x2, %r8d
0000000000053077	xorl	%r9d, %r9d
000000000005307a	callq	__ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(int, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000005307f	leaq	-0x30(%rbp), %rdi
0000000000053083	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000053088	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000005308d	leaq	0x91f3c(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000053094	leaq	-0x30(%rbp), %rdi
0000000000053098	movq	%rax, %rdx
000000000005309b	xorl	%ecx, %ecx
000000000005309d	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000530a2	leaq	0x1b8(%rbx), %rdi
00000000000530a9	movzbl	-0x34(%rbp), %esi
00000000000530ad	xorps	%xmm0, %xmm0
00000000000530b0	movups	%xmm0, (%rsp)
00000000000530b4	leaq	-0x30(%rbp), %rdx
00000000000530b8	movq	%rbx, %rcx
00000000000530bb	movl	$0x3, %r8d
00000000000530c1	xorl	%r9d, %r9d
00000000000530c4	callq	__ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(int, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000530c9	leaq	-0x30(%rbp), %rdi
00000000000530cd	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000530d2	addq	$0x28, %rsp
00000000000530d6	popq	%rbx
00000000000530d7	popq	%r12
00000000000530d9	popq	%r13
00000000000530db	popq	%r14
00000000000530dd	popq	%r15
00000000000530df	popq	%rbp
00000000000530e0	retq
00000000000530e1	movq	%rax, %r15
00000000000530e4	leaq	-0x30(%rbp), %rdi
00000000000530e8	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000530ed	jmp	0x5310e
00000000000530ef	movq	%rax, %r15
00000000000530f2	leaq	-0x30(%rbp), %rdi
00000000000530f6	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000530fb	jmp	0x5311b
00000000000530fd	movq	%rax, %r15
0000000000053100	leaq	-0x30(%rbp), %rdi
0000000000053104	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000053109	jmp	0x53128
000000000005310b	movq	%rax, %r15
000000000005310e	movq	%r13, %rdi
0000000000053111	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
0000000000053116	jmp	0x5311b
0000000000053118	movq	%rax, %r15
000000000005311b	movq	%r14, %rdi
000000000005311e	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
0000000000053123	jmp	0x53128
0000000000053125	movq	%rax, %r15
0000000000053128	movq	%rbx, %rdi
000000000005312b	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000053130	movq	%r15, %rdi
0000000000053133	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
