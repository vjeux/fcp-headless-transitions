__ZN19OZChannelRotation3DC2EP9OZFactoryRK8PCStringjj:
00000000000810e6	pushq	%rbp
00000000000810e7	movq	%rsp, %rbp
00000000000810ea	pushq	%r15
00000000000810ec	pushq	%r14
00000000000810ee	pushq	%r13
00000000000810f0	pushq	%r12
00000000000810f2	pushq	%rbx
00000000000810f3	subq	$0x38, %rsp
00000000000810f7	movq	%rdi, %rbx
00000000000810fa	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringjj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, unsigned int, unsigned int)
00000000000810ff	leaq	0x5d32a(%rip), %rax
0000000000081106	movq	%rax, (%rbx)
0000000000081109	leaq	0x5d660(%rip), %rax
0000000000081110	movq	%rax, 0x10(%rbx)
0000000000081114	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000081119	leaq	0x63e50(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000081120	leaq	-0x30(%rbp), %rdi
0000000000081124	movq	%rax, %rdx
0000000000081127	xorl	%ecx, %ecx
0000000000081129	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000008112e	leaq	0x88(%rbx), %r14
0000000000081135	movq	$0x0, (%rsp)
000000000008113d	leaq	-0x30(%rbp), %rsi
0000000000081141	xorps	%xmm0, %xmm0
0000000000081144	movq	%r14, %rdi
0000000000081147	movq	%rbx, %rdx
000000000008114a	movl	$0x1, %ecx
000000000008114f	xorl	%r8d, %r8d
0000000000081152	xorl	%r9d, %r9d
0000000000081155	callq	__ZN14OZChannelAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelAngle::OZChannelAngle(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000008115a	leaq	-0x30(%rbp), %rdi
000000000008115e	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000081163	movq	%r14, -0x48(%rbp)
0000000000081167	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000008116c	leaq	0x63e1d(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000081173	leaq	-0x30(%rbp), %rdi
0000000000081177	movq	%rax, %rdx
000000000008117a	xorl	%ecx, %ecx
000000000008117c	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000081181	leaq	0x120(%rbx), %r15
0000000000081188	movq	$0x0, (%rsp)
0000000000081190	leaq	-0x30(%rbp), %rsi
0000000000081194	xorps	%xmm0, %xmm0
0000000000081197	movq	%r15, %rdi
000000000008119a	movq	%rbx, %rdx
000000000008119d	movl	$0x2, %ecx
00000000000811a2	xorl	%r8d, %r8d
00000000000811a5	xorl	%r9d, %r9d
00000000000811a8	callq	__ZN14OZChannelAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelAngle::OZChannelAngle(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000811ad	leaq	-0x30(%rbp), %rdi
00000000000811b1	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000811b6	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000811bb	leaq	0x63e0e(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000811c2	leaq	-0x30(%rbp), %rdi
00000000000811c6	movq	%rax, %rdx
00000000000811c9	xorl	%ecx, %ecx
00000000000811cb	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000811d0	leaq	0x1b8(%rbx), %r12
00000000000811d7	movq	$0x0, (%rsp)
00000000000811df	leaq	-0x30(%rbp), %rsi
00000000000811e3	xorps	%xmm0, %xmm0
00000000000811e6	movq	%r12, %rdi
00000000000811e9	movq	%rbx, %rdx
00000000000811ec	movl	$0x3, %ecx
00000000000811f1	xorl	%r8d, %r8d
00000000000811f4	xorl	%r9d, %r9d
00000000000811f7	callq	__ZN14OZChannelAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelAngle::OZChannelAngle(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000811fc	leaq	-0x30(%rbp), %rdi
0000000000081200	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000081205	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000008120a	leaq	0x6485f(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000081211	leaq	-0x30(%rbp), %rdi
0000000000081215	movq	%rax, %rdx
0000000000081218	xorl	%ecx, %ecx
000000000008121a	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000008121f	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000081224	leaq	0x64865(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
000000000008122b	leaq	-0x40(%rbp), %rdi
000000000008122f	movq	%rax, %rdx
0000000000081232	xorl	%ecx, %ecx
0000000000081234	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000081239	callq	__ZN31OZChannelEnumInterpMode_Factory11getInstanceEv ## OZChannelEnumInterpMode_Factory::getInstance()
000000000008123e	leaq	0x250(%rbx), %r13
0000000000081245	xorps	%xmm0, %xmm0
0000000000081248	movups	%xmm0, 0x8(%rsp)
000000000008124d	movl	$0x0, (%rsp)
0000000000081254	leaq	-0x30(%rbp), %rsi
0000000000081258	leaq	-0x40(%rbp), %rcx
000000000008125c	movq	%r13, %rdi
000000000008125f	movq	%rax, %rdx
0000000000081262	movq	%rbx, %r8
0000000000081265	movl	$0x4, %r9d
000000000008126b	callq	__ZN13OZChannelEnumC2ERK8PCStringP9OZFactoryS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelEnum::OZChannelEnum(PCString const&, OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000081270	leaq	0x5d569(%rip), %rax
0000000000081277	movq	%rax, 0x250(%rbx)
000000000008127e	leaq	0x5d8cb(%rip), %rax
0000000000081285	movq	%rax, 0x260(%rbx)
000000000008128c	leaq	-0x40(%rbp), %rdi
0000000000081290	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000081295	leaq	-0x30(%rbp), %rdi
0000000000081299	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000008129e	leaq	0x350(%rbx), %r14
00000000000812a5	movl	$0x0, 0x350(%rbx)
00000000000812af	movq	%rbx, %rdi
00000000000812b2	callq	__ZN19OZChannelRotation3D22initCustomInterpolatorEv ## OZChannelRotation3D::initCustomInterpolator()
00000000000812b7	addq	$0x38, %rsp
00000000000812bb	popq	%rbx
00000000000812bc	popq	%r12
00000000000812be	popq	%r13
00000000000812c0	popq	%r14
00000000000812c2	popq	%r15
00000000000812c4	popq	%rbp
00000000000812c5	retq
00000000000812c6	movq	%rax, -0x38(%rbp)
00000000000812ca	movq	%r14, %rdi
00000000000812cd	callq	0xacb22                         ## symbol stub for: __ZN10PCSpinLockD1Ev
00000000000812d2	movq	%r13, %rdi
00000000000812d5	callq	__ZN13OZChannelEnumD2Ev         ## OZChannelEnum::~OZChannelEnum()
00000000000812da	jmp	0x8132b
00000000000812dc	movq	%rax, -0x38(%rbp)
00000000000812e0	leaq	-0x30(%rbp), %rdi
00000000000812e4	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000812e9	jmp	0x81339
00000000000812eb	movq	%rax, -0x38(%rbp)
00000000000812ef	leaq	-0x30(%rbp), %rdi
00000000000812f3	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000812f8	jmp	0x81341
00000000000812fa	movq	%rax, -0x38(%rbp)
00000000000812fe	leaq	-0x30(%rbp), %rdi
0000000000081302	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000081307	jmp	0x8134a
0000000000081309	movq	%rax, -0x38(%rbp)
000000000008130d	leaq	-0x40(%rbp), %rdi
0000000000081311	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000081316	jmp	0x8131c
0000000000081318	movq	%rax, -0x38(%rbp)
000000000008131c	leaq	-0x30(%rbp), %rdi
0000000000081320	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000081325	jmp	0x8132b
0000000000081327	movq	%rax, -0x38(%rbp)
000000000008132b	movq	%r12, %rdi
000000000008132e	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000081333	jmp	0x81339
0000000000081335	movq	%rax, -0x38(%rbp)
0000000000081339	movq	%r15, %rdi
000000000008133c	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000081341	movq	-0x48(%rbp), %rdi
0000000000081345	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000008134a	movq	%rbx, %rdi
000000000008134d	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000081352	movq	-0x38(%rbp), %rdi
0000000000081356	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000008135b	movq	%rax, -0x38(%rbp)
000000000008135f	jmp	0x81341
0000000000081361	movq	%rax, -0x38(%rbp)
0000000000081365	jmp	0x8134a
0000000000081367	nop
