__ZN15OZChannelBool3DC2ERK8PCStringP15OZChannelFolderjjj:
0000000000053142	pushq	%rbp
0000000000053143	movq	%rsp, %rbp
0000000000053146	pushq	%r15
0000000000053148	pushq	%r14
000000000005314a	pushq	%r13
000000000005314c	pushq	%r12
000000000005314e	pushq	%rbx
000000000005314f	subq	$0x28, %rsp
0000000000053153	movl	%r9d, %r14d
0000000000053156	movl	%r8d, -0x34(%rbp)
000000000005315a	movl	%ecx, %r12d
000000000005315d	movq	%rdx, %r13
0000000000053160	movq	%rsi, %r15
0000000000053163	movq	%rdi, %rbx
0000000000053166	callq	__ZN23OZChannelBool3D_Factory11getInstanceEv ## OZChannelBool3D_Factory::getInstance()
000000000005316b	movl	%r14d, 0x8(%rsp)
0000000000053170	movl	$0x0, (%rsp)
0000000000053177	movq	%rbx, %rdi
000000000005317a	movq	%rax, %rsi
000000000005317d	movq	%r15, %rdx
0000000000053180	movq	%r13, %rcx
0000000000053183	movl	%r12d, %r8d
0000000000053186	movl	-0x34(%rbp), %r9d
000000000005318a	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
000000000005318f	leaq	0x84b8a(%rip), %rax
0000000000053196	movq	%rax, (%rbx)
0000000000053199	leaq	0x84eb8(%rip), %rax
00000000000531a0	movq	%rax, 0x10(%rbx)
00000000000531a4	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000531a9	leaq	0x91dc0(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000531b0	leaq	-0x30(%rbp), %rdi
00000000000531b4	movq	%rax, %rdx
00000000000531b7	xorl	%ecx, %ecx
00000000000531b9	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000531be	leaq	0x88(%rbx), %r14
00000000000531c5	movq	$0x0, (%rsp)
00000000000531cd	leaq	-0x30(%rbp), %rsi
00000000000531d1	movq	%r14, %rdi
00000000000531d4	movq	%rbx, %rdx
00000000000531d7	movl	$0x1, %ecx
00000000000531dc	xorl	%r8d, %r8d
00000000000531df	xorl	%r9d, %r9d
00000000000531e2	callq	__ZN13OZChannelBoolC1ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000531e7	leaq	-0x30(%rbp), %rdi
00000000000531eb	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000531f0	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000531f5	leaq	0x91d94(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000531fc	leaq	-0x30(%rbp), %rdi
0000000000053200	movq	%rax, %rdx
0000000000053203	xorl	%ecx, %ecx
0000000000053205	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000005320a	leaq	0x120(%rbx), %r15
0000000000053211	movq	$0x0, (%rsp)
0000000000053219	leaq	-0x30(%rbp), %rsi
000000000005321d	movq	%r15, %rdi
0000000000053220	movq	%rbx, %rdx
0000000000053223	movl	$0x2, %ecx
0000000000053228	xorl	%r8d, %r8d
000000000005322b	xorl	%r9d, %r9d
000000000005322e	callq	__ZN13OZChannelBoolC1ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000053233	leaq	-0x30(%rbp), %rdi
0000000000053237	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000005323c	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000053241	leaq	0x91d88(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000053248	leaq	-0x30(%rbp), %rdi
000000000005324c	movq	%rax, %rdx
000000000005324f	xorl	%ecx, %ecx
0000000000053251	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000053256	leaq	0x1b8(%rbx), %rdi
000000000005325d	movq	$0x0, (%rsp)
0000000000053265	leaq	-0x30(%rbp), %rsi
0000000000053269	movq	%rbx, %rdx
000000000005326c	movl	$0x3, %ecx
0000000000053271	xorl	%r8d, %r8d
0000000000053274	xorl	%r9d, %r9d
0000000000053277	callq	__ZN13OZChannelBoolC1ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000005327c	leaq	-0x30(%rbp), %rdi
0000000000053280	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000053285	addq	$0x28, %rsp
0000000000053289	popq	%rbx
000000000005328a	popq	%r12
000000000005328c	popq	%r13
000000000005328e	popq	%r14
0000000000053290	popq	%r15
0000000000053292	popq	%rbp
0000000000053293	retq
0000000000053294	movq	%rax, %r12
0000000000053297	leaq	-0x30(%rbp), %rdi
000000000005329b	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000532a0	jmp	0x532c1
00000000000532a2	movq	%rax, %r12
00000000000532a5	leaq	-0x30(%rbp), %rdi
00000000000532a9	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000532ae	jmp	0x532ce
00000000000532b0	movq	%rax, %r12
00000000000532b3	leaq	-0x30(%rbp), %rdi
00000000000532b7	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000532bc	jmp	0x532db
00000000000532be	movq	%rax, %r12
00000000000532c1	movq	%r15, %rdi
00000000000532c4	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
00000000000532c9	jmp	0x532ce
00000000000532cb	movq	%rax, %r12
00000000000532ce	movq	%r14, %rdi
00000000000532d1	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
00000000000532d6	jmp	0x532db
00000000000532d8	movq	%rax, %r12
00000000000532db	movq	%rbx, %rdi
00000000000532de	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
00000000000532e3	movq	%r12, %rdi
00000000000532e6	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000532eb	nop
