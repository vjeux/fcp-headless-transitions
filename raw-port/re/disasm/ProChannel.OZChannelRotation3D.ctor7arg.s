0000000000080986	movl	%esp, %ebp
0000000000080988	pushq	%r15
000000000008098a	pushq	%r14
000000000008098c	pushq	%r13
000000000008098e	pushq	%r12
0000000000080990	pushq	%rbx
0000000000080991	subq	$0x38, %rsp
0000000000080995	movl	%r9d, %r15d
0000000000080998	movl	%r8d, -0x40(%rbp)
000000000008099c	movl	%ecx, %r12d
000000000008099f	movq	%rdx, %r13
00000000000809a2	movq	%rsi, %rbx
00000000000809a5	movq	%rdi, %r14
00000000000809a8	callq	__ZN27OZChannelRotation3D_Factory11getInstanceEv ## OZChannelRotation3D_Factory::getInstance()
00000000000809ad	movl	%r15d, 0x8(%rsp)
00000000000809b2	movl	$0x0, (%rsp)
00000000000809b9	movq	%r14, %rdi
00000000000809bc	movq	%rax, %rsi
00000000000809bf	movq	%rbx, %rdx
00000000000809c2	movq	%r13, %rcx
00000000000809c5	movl	%r12d, %r8d
00000000000809c8	movl	-0x40(%rbp), %r9d
00000000000809cc	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
00000000000809d1	leaq	0x5da58(%rip), %rax
00000000000809d8	movq	%rax, (%r14)
00000000000809db	leaq	0x5dd8e(%rip), %rax
00000000000809e2	movq	%rax, 0x10(%r14)
00000000000809e6	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000809eb	leaq	0x6457e(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000809f2	leaq	-0x30(%rbp), %rdi
00000000000809f6	movq	%rax, %rdx
00000000000809f9	xorl	%ecx, %ecx
00000000000809fb	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000080a00	movq	0x18(%rbp), %rbx
0000000000080a04	movq	0x10(%rbp), %r13
0000000000080a08	leaq	0x88(%r14), %r15
0000000000080a0f	movq	%rbx, (%rsp)
0000000000080a13	leaq	-0x30(%rbp), %rsi
0000000000080a17	xorps	%xmm0, %xmm0
0000000000080a1a	movq	%r15, %rdi
0000000000080a1d	movq	%r14, %rdx
0000000000080a20	movl	$0x1, %ecx
0000000000080a25	xorl	%r8d, %r8d
0000000000080a28	movq	%r13, %r9
0000000000080a2b	callq	__ZN14OZChannelAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelAngle::OZChannelAngle(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000080a30	movq	%r15, -0x40(%rbp)
0000000000080a34	leaq	-0x30(%rbp), %rdi
0000000000080a38	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080a3d	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000080a42	leaq	0x64547(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000080a49	leaq	-0x30(%rbp), %rdi
0000000000080a4d	movq	%rax, %rdx
0000000000080a50	xorl	%ecx, %ecx
0000000000080a52	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000080a57	leaq	0x120(%r14), %r15
0000000000080a5e	movq	%rbx, (%rsp)
0000000000080a62	leaq	-0x30(%rbp), %rsi
0000000000080a66	xorps	%xmm0, %xmm0
0000000000080a69	movq	%r15, %rdi
0000000000080a6c	movq	%r14, %rdx
0000000000080a6f	movl	$0x2, %ecx
0000000000080a74	xorl	%r8d, %r8d
0000000000080a77	movq	%r13, %r9
0000000000080a7a	callq	__ZN14OZChannelAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelAngle::OZChannelAngle(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000080a7f	leaq	-0x30(%rbp), %rdi
0000000000080a83	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080a88	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000080a8d	leaq	0x6453c(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000080a94	leaq	-0x30(%rbp), %rdi
0000000000080a98	movq	%rax, %rdx
0000000000080a9b	xorl	%ecx, %ecx
0000000000080a9d	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000080aa2	leaq	0x1b8(%r14), %r12
0000000000080aa9	movq	%rbx, (%rsp)
0000000000080aad	leaq	-0x30(%rbp), %rsi
0000000000080ab1	xorps	%xmm0, %xmm0
0000000000080ab4	movq	%r12, %rdi
0000000000080ab7	movq	%r14, %rdx
0000000000080aba	movl	$0x3, %ecx
0000000000080abf	xorl	%r8d, %r8d
0000000000080ac2	movq	%r13, %r9
0000000000080ac5	callq	__ZN14OZChannelAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelAngle::OZChannelAngle(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000080aca	leaq	-0x30(%rbp), %rdi
0000000000080ace	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080ad3	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000080ad8	leaq	0x64f91(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000080adf	leaq	-0x30(%rbp), %rdi
0000000000080ae3	movq	%rax, %rdx
0000000000080ae6	xorl	%ecx, %ecx
0000000000080ae8	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000080aed	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000080af2	leaq	0x64f97(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000080af9	leaq	-0x48(%rbp), %rdi
0000000000080afd	movq	%rax, %rdx
0000000000080b00	xorl	%ecx, %ecx
0000000000080b02	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000080b07	callq	__ZN31OZChannelEnumInterpMode_Factory11getInstanceEv ## OZChannelEnumInterpMode_Factory::getInstance()
0000000000080b0c	leaq	0x250(%r14), %r13
0000000000080b13	xorps	%xmm0, %xmm0
0000000000080b16	movups	%xmm0, 0x8(%rsp)
0000000000080b1b	movl	$0x0, (%rsp)
0000000000080b22	leaq	-0x30(%rbp), %rsi
0000000000080b26	leaq	-0x48(%rbp), %rcx
0000000000080b2a	movq	%r13, %rdi
0000000000080b2d	movq	%rax, %rdx
0000000000080b30	movq	%r14, %r8
0000000000080b33	movl	$0x4, %r9d
0000000000080b39	callq	__ZN13OZChannelEnumC2ERK8PCStringP9OZFactoryS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelEnum::OZChannelEnum(PCString const&, OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000080b3e	leaq	0x5dc9b(%rip), %rax
0000000000080b45	movq	%rax, 0x250(%r14)
0000000000080b4c	leaq	0x5dffd(%rip), %rax
0000000000080b53	movq	%rax, 0x260(%r14)
0000000000080b5a	leaq	-0x48(%rbp), %rdi
0000000000080b5e	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080b63	leaq	-0x30(%rbp), %rdi
0000000000080b67	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080b6c	movq	%r14, %rbx
0000000000080b6f	addq	$0x350, %r14                    ## imm = 0x350
0000000000080b76	movl	$0x0, 0x350(%rbx)
0000000000080b80	movq	%rbx, %rdi
0000000000080b83	callq	__ZN19OZChannelRotation3D22initCustomInterpolatorEv ## OZChannelRotation3D::initCustomInterpolator()
0000000000080b88	addq	$0x38, %rsp
0000000000080b8c	popq	%rbx
0000000000080b8d	popq	%r12
0000000000080b8f	popq	%r13
0000000000080b91	popq	%r14
0000000000080b93	popq	%r15
0000000000080b95	popq	%rbp
0000000000080b96	retq
0000000000080b97	movq	%rax, -0x38(%rbp)
0000000000080b9b	movq	%r14, %rdi
0000000000080b9e	callq	0xacb22                         ## symbol stub for: __ZN10PCSpinLockD1Ev
0000000000080ba3	movq	%r13, %rdi
0000000000080ba6	callq	__ZN13OZChannelEnumD2Ev         ## OZChannelEnum::~OZChannelEnum()
0000000000080bab	jmp	0x80c0e
0000000000080bad	movq	%r14, %rbx
0000000000080bb0	movq	%rax, -0x38(%rbp)
0000000000080bb4	leaq	-0x30(%rbp), %rdi
0000000000080bb8	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080bbd	jmp	0x80c1f
0000000000080bbf	movq	%r14, %rbx
0000000000080bc2	movq	%rax, -0x38(%rbp)
0000000000080bc6	leaq	-0x30(%rbp), %rdi
0000000000080bca	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080bcf	jmp	0x80c27
0000000000080bd1	movq	%r14, %rbx
0000000000080bd4	movq	%rax, -0x38(%rbp)
0000000000080bd8	leaq	-0x30(%rbp), %rdi
0000000000080bdc	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080be1	jmp	0x80c30
0000000000080be3	movq	%r14, %rbx
0000000000080be6	movq	%rax, -0x38(%rbp)
0000000000080bea	leaq	-0x48(%rbp), %rdi
0000000000080bee	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080bf3	jmp	0x80bfc
0000000000080bf5	movq	%r14, %rbx
0000000000080bf8	movq	%rax, -0x38(%rbp)
0000000000080bfc	leaq	-0x30(%rbp), %rdi
0000000000080c00	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080c05	jmp	0x80c0e
0000000000080c07	movq	%r14, %rbx
0000000000080c0a	movq	%rax, -0x38(%rbp)
0000000000080c0e	movq	%r12, %rdi
0000000000080c11	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000080c16	jmp	0x80c1f
0000000000080c18	movq	%r14, %rbx
0000000000080c1b	movq	%rax, -0x38(%rbp)
0000000000080c1f	movq	%r15, %rdi
0000000000080c22	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000080c27	movq	-0x40(%rbp), %rdi
0000000000080c2b	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000080c30	movq	%rbx, %rdi
0000000000080c33	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000080c38	movq	-0x38(%rbp), %rdi
0000000000080c3c	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000080c41	movq	%r14, %rbx
0000000000080c44	movq	%rax, -0x38(%rbp)
0000000000080c48	jmp	0x80c27
0000000000080c4a	movq	%r14, %rbx
0000000000080c4d	movq	%rax, -0x38(%rbp)
0000000000080c51	jmp	0x80c30
0000000000080c53	nop
__ZN27OZChannelRotation3D_Factory11getInstanceEv:
0000000000080c54	movq	__ZN27OZChannelRotation3D_Factory13_instanceOnceE(%rip), %rax ## OZChannelRotation3D_Factory::_instanceOnce
0000000000080c5b	cmpq	$-0x1, %rax
0000000000080c5f	je	0x80c93
0000000000080c61	pushq	%rbp
0000000000080c62	movq	%rsp, %rbp
0000000000080c65	subq	$0x20, %rsp
0000000000080c69	leaq	-0x1(%rbp), %rax
0000000000080c6d	leaq	-0x18(%rbp), %rcx
0000000000080c71	movq	%rax, (%rcx)
0000000000080c74	leaq	-0x10(%rbp), %rsi
0000000000080c78	movq	%rcx, (%rsi)
0000000000080c7b	leaq	__ZN27OZChannelRotation3D_Factory13_instanceOnceE(%rip), %rdi ## OZChannelRotation3D_Factory::_instanceOnce
0000000000080c82	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN27OZChannelRotation3D_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelRotation3D_Factory::getInstance()::'lambda'()&&>>(void*)
0000000000080c89	callq	0xacdc8                         ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
0000000000080c8e	addq	$0x20, %rsp
0000000000080c92	popq	%rbp
0000000000080c93	movq	__ZN27OZChannelRotation3D_Factory9_instanceE(%rip), %rax ## OZChannelRotation3D_Factory::_instance
0000000000080c9a	retq
0000000000080c9b	nop
__ZN23OZChannelEnumInterpModeC1ERK8PCStringS2_P15OZChannelFolderjj:
0000000000080c9c	pushq	%rbp
0000000000080c9d	movq	%rsp, %rbp
0000000000080ca0	pushq	%r15
0000000000080ca2	pushq	%r14
0000000000080ca4	pushq	%r13
0000000000080ca6	pushq	%r12
0000000000080ca8	pushq	%rbx
0000000000080ca9	subq	$0x28, %rsp
0000000000080cad	movl	%r9d, %ebx
0000000000080cb0	movl	%r8d, -0x2c(%rbp)
0000000000080cb4	movq	%rcx, %r15
0000000000080cb7	movq	%rdx, %r12
0000000000080cba	movq	%rsi, %r13
0000000000080cbd	movq	%rdi, %r14
0000000000080cc0	callq	__ZN31OZChannelEnumInterpMode_Factory11getInstanceEv ## OZChannelEnumInterpMode_Factory::getInstance()
0000000000080cc5	xorps	%xmm0, %xmm0
0000000000080cc8	movups	%xmm0, 0x8(%rsp)
0000000000080ccd	movl	%ebx, (%rsp)
0000000000080cd0	movq	%r14, %rdi
0000000000080cd3	movq	%r13, %rsi
0000000000080cd6	movq	%rax, %rdx
0000000000080cd9	movq	%r12, %rcx
0000000000080cdc	movq	%r15, %r8
0000000000080cdf	movl	-0x2c(%rbp), %r9d
0000000000080ce3	callq	__ZN13OZChannelEnumC2ERK8PCStringP9OZFactoryS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelEnum::OZChannelEnum(PCString const&, OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000080ce8	leaq	0x5daf1(%rip), %rax
0000000000080cef	movq	%rax, (%r14)
0000000000080cf2	leaq	0x5de57(%rip), %rax
0000000000080cf9	movq	%rax, 0x10(%r14)
0000000000080cfd	addq	$0x28, %rsp
0000000000080d01	popq	%rbx
0000000000080d02	popq	%r12
0000000000080d04	popq	%r13
0000000000080d06	popq	%r14
0000000000080d08	popq	%r15
0000000000080d0a	popq	%rbp
0000000000080d0b	retq
