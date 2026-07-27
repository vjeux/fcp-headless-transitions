__ZN19OZChannelRotation3DC2EdddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
0000000000080df8	pushq	%rbp
0000000000080df9	movq	%rsp, %rbp
0000000000080dfc	pushq	%r15
0000000000080dfe	pushq	%r14
0000000000080e00	pushq	%r13
0000000000080e02	pushq	%r12
0000000000080e04	pushq	%rbx
0000000000080e05	subq	$0x48, %rsp
0000000000080e09	movl	%r9d, %r15d
0000000000080e0c	movl	%r8d, -0x40(%rbp)
0000000000080e10	movl	%ecx, %r12d
0000000000080e13	movq	%rdx, %r13
0000000000080e16	movq	%rsi, %rbx
0000000000080e19	movsd	%xmm2, -0x50(%rbp)
0000000000080e1e	movsd	%xmm1, -0x58(%rbp)
0000000000080e23	movsd	%xmm0, -0x38(%rbp)
0000000000080e28	movq	%rdi, %r14
0000000000080e2b	callq	__ZN27OZChannelRotation3D_Factory11getInstanceEv ## OZChannelRotation3D_Factory::getInstance()
0000000000080e30	movl	%r15d, 0x8(%rsp)
0000000000080e35	movl	$0x0, (%rsp)
0000000000080e3c	movq	%r14, %rdi
0000000000080e3f	movq	%rax, %rsi
0000000000080e42	movq	%rbx, %rdx
0000000000080e45	movq	%r13, %rcx
0000000000080e48	movl	%r12d, %r8d
0000000000080e4b	movl	-0x40(%rbp), %r9d
0000000000080e4f	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
0000000000080e54	leaq	0x5d5d5(%rip), %rax
0000000000080e5b	movq	%rax, (%r14)
0000000000080e5e	leaq	0x5d90b(%rip), %rax
0000000000080e65	movq	%rax, 0x10(%r14)
0000000000080e69	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000080e6e	leaq	0x640fb(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000080e75	leaq	-0x30(%rbp), %rdi
0000000000080e79	movq	%rax, %rdx
0000000000080e7c	xorl	%ecx, %ecx
0000000000080e7e	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000080e83	movq	0x18(%rbp), %rbx
0000000000080e87	movq	0x10(%rbp), %r13
0000000000080e8b	leaq	0x88(%r14), %r15
0000000000080e92	movq	%rbx, (%rsp)
0000000000080e96	leaq	-0x30(%rbp), %rsi
0000000000080e9a	movq	%r15, %rdi
0000000000080e9d	movsd	-0x38(%rbp), %xmm0
0000000000080ea2	movq	%r14, %rdx
0000000000080ea5	movl	$0x1, %ecx
0000000000080eaa	xorl	%r8d, %r8d
0000000000080ead	movq	%r13, %r9
0000000000080eb0	callq	__ZN14OZChannelAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelAngle::OZChannelAngle(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000080eb5	movq	%r15, -0x40(%rbp)
0000000000080eb9	leaq	-0x30(%rbp), %rdi
0000000000080ebd	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080ec2	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000080ec7	leaq	0x640c2(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000080ece	leaq	-0x30(%rbp), %rdi
0000000000080ed2	movq	%rax, %rdx
0000000000080ed5	xorl	%ecx, %ecx
0000000000080ed7	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000080edc	leaq	0x120(%r14), %r15
0000000000080ee3	movq	%rbx, (%rsp)
0000000000080ee7	leaq	-0x30(%rbp), %rsi
0000000000080eeb	movq	%r15, %rdi
0000000000080eee	movsd	-0x58(%rbp), %xmm0
0000000000080ef3	movq	%r14, %rdx
0000000000080ef6	movl	$0x2, %ecx
0000000000080efb	xorl	%r8d, %r8d
0000000000080efe	movq	%r13, %r9
0000000000080f01	callq	__ZN14OZChannelAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelAngle::OZChannelAngle(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000080f06	leaq	-0x30(%rbp), %rdi
0000000000080f0a	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080f0f	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000080f14	leaq	0x640b5(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000080f1b	leaq	-0x30(%rbp), %rdi
0000000000080f1f	movq	%rax, %rdx
0000000000080f22	xorl	%ecx, %ecx
0000000000080f24	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000080f29	leaq	0x1b8(%r14), %r12
0000000000080f30	movq	%rbx, (%rsp)
0000000000080f34	leaq	-0x30(%rbp), %rsi
0000000000080f38	movq	%r12, %rdi
0000000000080f3b	movsd	-0x50(%rbp), %xmm0
0000000000080f40	movq	%r14, %rdx
0000000000080f43	movl	$0x3, %ecx
0000000000080f48	xorl	%r8d, %r8d
0000000000080f4b	movq	%r13, %r9
0000000000080f4e	callq	__ZN14OZChannelAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelAngle::OZChannelAngle(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000080f53	leaq	-0x30(%rbp), %rdi
0000000000080f57	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080f5c	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000080f61	leaq	0x64b08(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000080f68	leaq	-0x30(%rbp), %rdi
0000000000080f6c	movq	%rax, %rdx
0000000000080f6f	xorl	%ecx, %ecx
0000000000080f71	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000080f76	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000080f7b	leaq	0x64b0e(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000080f82	leaq	-0x48(%rbp), %rdi
0000000000080f86	movq	%rax, %rdx
0000000000080f89	xorl	%ecx, %ecx
0000000000080f8b	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000080f90	callq	__ZN31OZChannelEnumInterpMode_Factory11getInstanceEv ## OZChannelEnumInterpMode_Factory::getInstance()
0000000000080f95	leaq	0x250(%r14), %r13
0000000000080f9c	xorps	%xmm0, %xmm0
0000000000080f9f	movups	%xmm0, 0x8(%rsp)
0000000000080fa4	movl	$0x0, (%rsp)
0000000000080fab	leaq	-0x30(%rbp), %rsi
0000000000080faf	leaq	-0x48(%rbp), %rcx
0000000000080fb3	movq	%r13, %rdi
0000000000080fb6	movq	%rax, %rdx
0000000000080fb9	movq	%r14, %r8
0000000000080fbc	movl	$0x4, %r9d
0000000000080fc2	callq	__ZN13OZChannelEnumC2ERK8PCStringP9OZFactoryS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelEnum::OZChannelEnum(PCString const&, OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000080fc7	leaq	0x5d812(%rip), %rax
0000000000080fce	movq	%rax, 0x250(%r14)
0000000000080fd5	leaq	0x5db74(%rip), %rax
0000000000080fdc	movq	%rax, 0x260(%r14)
0000000000080fe3	leaq	-0x48(%rbp), %rdi
0000000000080fe7	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080fec	leaq	-0x30(%rbp), %rdi
0000000000080ff0	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000080ff5	movq	%r14, %rbx
0000000000080ff8	addq	$0x350, %r14                    ## imm = 0x350
0000000000080fff	movl	$0x0, 0x350(%rbx)
0000000000081009	movq	%rbx, %rdi
000000000008100c	callq	__ZN19OZChannelRotation3D22initCustomInterpolatorEv ## OZChannelRotation3D::initCustomInterpolator()
0000000000081011	addq	$0x48, %rsp
0000000000081015	popq	%rbx
0000000000081016	popq	%r12
0000000000081018	popq	%r13
000000000008101a	popq	%r14
000000000008101c	popq	%r15
000000000008101e	popq	%rbp
000000000008101f	retq
0000000000081020	movq	%rax, -0x38(%rbp)
0000000000081024	movq	%r14, %rdi
0000000000081027	callq	0xacb22                         ## symbol stub for: __ZN10PCSpinLockD1Ev
000000000008102c	movq	%r13, %rdi
000000000008102f	callq	__ZN13OZChannelEnumD2Ev         ## OZChannelEnum::~OZChannelEnum()
0000000000081034	jmp	0x81097
0000000000081036	movq	%r14, %rbx
0000000000081039	movq	%rax, -0x38(%rbp)
000000000008103d	leaq	-0x30(%rbp), %rdi
0000000000081041	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000081046	jmp	0x810a8
0000000000081048	movq	%r14, %rbx
000000000008104b	movq	%rax, -0x38(%rbp)
000000000008104f	leaq	-0x30(%rbp), %rdi
0000000000081053	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000081058	jmp	0x810b0
000000000008105a	movq	%r14, %rbx
000000000008105d	movq	%rax, -0x38(%rbp)
0000000000081061	leaq	-0x30(%rbp), %rdi
0000000000081065	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000008106a	jmp	0x810b9
000000000008106c	movq	%r14, %rbx
000000000008106f	movq	%rax, -0x38(%rbp)
0000000000081073	leaq	-0x48(%rbp), %rdi
0000000000081077	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000008107c	jmp	0x81085
000000000008107e	movq	%r14, %rbx
0000000000081081	movq	%rax, -0x38(%rbp)
0000000000081085	leaq	-0x30(%rbp), %rdi
0000000000081089	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000008108e	jmp	0x81097
0000000000081090	movq	%r14, %rbx
0000000000081093	movq	%rax, -0x38(%rbp)
0000000000081097	movq	%r12, %rdi
000000000008109a	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000008109f	jmp	0x810a8
00000000000810a1	movq	%r14, %rbx
00000000000810a4	movq	%rax, -0x38(%rbp)
00000000000810a8	movq	%r15, %rdi
00000000000810ab	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
00000000000810b0	movq	-0x40(%rbp), %rdi
00000000000810b4	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
00000000000810b9	movq	%rbx, %rdi
00000000000810bc	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
00000000000810c1	movq	-0x38(%rbp), %rdi
00000000000810c5	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000810ca	movq	%r14, %rbx
00000000000810cd	movq	%rax, -0x38(%rbp)
00000000000810d1	jmp	0x810b0
00000000000810d3	movq	%r14, %rbx
00000000000810d6	movq	%rax, -0x38(%rbp)
00000000000810da	jmp	0x810b9
