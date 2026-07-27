__ZN15OZChannelBool3DC2EbbbP9OZFactoryRK8PCStringP15OZChannelFolderjjj:
0000000000052dd6	pushq	%rbp
0000000000052dd7	movq	%rsp, %rbp
0000000000052dda	pushq	%r15
0000000000052ddc	pushq	%r14
0000000000052dde	pushq	%r13
0000000000052de0	pushq	%r12
0000000000052de2	pushq	%rbx
0000000000052de3	subq	$0x18, %rsp
0000000000052de7	movq	%r9, %r10
0000000000052dea	movq	%r8, %rax
0000000000052ded	movl	%ecx, %r15d
0000000000052df0	movl	%edx, %r12d
0000000000052df3	movl	%esi, %r13d
0000000000052df6	movq	%rdi, %rbx
0000000000052df9	movq	0x10(%rbp), %rcx
0000000000052dfd	movl	0x18(%rbp), %r8d
0000000000052e01	movl	0x20(%rbp), %r9d
0000000000052e05	movl	0x28(%rbp), %edx
0000000000052e08	movl	%edx, 0x8(%rsp)
0000000000052e0c	movl	$0x0, (%rsp)
0000000000052e13	movq	%rax, %rsi
0000000000052e16	movq	%r10, %rdx
0000000000052e19	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
0000000000052e1e	leaq	0x84efb(%rip), %rax
0000000000052e25	movq	%rax, (%rbx)
0000000000052e28	leaq	0x85229(%rip), %rax
0000000000052e2f	movq	%rax, 0x10(%rbx)
0000000000052e33	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000052e38	leaq	0x92131(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000052e3f	leaq	-0x30(%rbp), %rdi
0000000000052e43	movq	%rax, %rdx
0000000000052e46	xorl	%ecx, %ecx
0000000000052e48	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000052e4d	leaq	0x88(%rbx), %r14
0000000000052e54	xorps	%xmm0, %xmm0
0000000000052e57	movups	%xmm0, (%rsp)
0000000000052e5b	leaq	-0x30(%rbp), %rdx
0000000000052e5f	movq	%r14, %rdi
0000000000052e62	movl	%r13d, %esi
0000000000052e65	movq	%rbx, %rcx
0000000000052e68	movl	$0x1, %r8d
0000000000052e6e	xorl	%r9d, %r9d
0000000000052e71	callq	__ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(int, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000052e76	leaq	-0x30(%rbp), %rdi
0000000000052e7a	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000052e7f	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000052e84	leaq	0x92105(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000052e8b	leaq	-0x30(%rbp), %rdi
0000000000052e8f	movq	%rax, %rdx
0000000000052e92	xorl	%ecx, %ecx
0000000000052e94	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000052e99	leaq	0x120(%rbx), %r13
0000000000052ea0	movzbl	%r12b, %esi
0000000000052ea4	xorps	%xmm0, %xmm0
0000000000052ea7	movups	%xmm0, (%rsp)
0000000000052eab	leaq	-0x30(%rbp), %rdx
0000000000052eaf	movq	%r13, %rdi
0000000000052eb2	movq	%rbx, %rcx
0000000000052eb5	movl	$0x2, %r8d
0000000000052ebb	xorl	%r9d, %r9d
0000000000052ebe	callq	__ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(int, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000052ec3	leaq	-0x30(%rbp), %rdi
0000000000052ec7	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000052ecc	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
0000000000052ed1	leaq	0x920f8(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000052ed8	leaq	-0x30(%rbp), %rdi
0000000000052edc	movq	%rax, %rdx
0000000000052edf	xorl	%ecx, %ecx
0000000000052ee1	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000052ee6	leaq	0x1b8(%rbx), %rdi
0000000000052eed	movzbl	%r15b, %esi
0000000000052ef1	xorps	%xmm0, %xmm0
0000000000052ef4	movups	%xmm0, (%rsp)
0000000000052ef8	leaq	-0x30(%rbp), %rdx
0000000000052efc	movq	%rbx, %rcx
0000000000052eff	movl	$0x3, %r8d
0000000000052f05	xorl	%r9d, %r9d
0000000000052f08	callq	__ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelBool::OZChannelBool(int, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000052f0d	leaq	-0x30(%rbp), %rdi
0000000000052f11	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000052f16	addq	$0x18, %rsp
0000000000052f1a	popq	%rbx
0000000000052f1b	popq	%r12
0000000000052f1d	popq	%r13
0000000000052f1f	popq	%r14
0000000000052f21	popq	%r15
0000000000052f23	popq	%rbp
0000000000052f24	retq
0000000000052f25	movq	%rax, %r15
0000000000052f28	leaq	-0x30(%rbp), %rdi
0000000000052f2c	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000052f31	jmp	0x52f52
0000000000052f33	movq	%rax, %r15
0000000000052f36	leaq	-0x30(%rbp), %rdi
0000000000052f3a	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000052f3f	jmp	0x52f5f
0000000000052f41	movq	%rax, %r15
0000000000052f44	leaq	-0x30(%rbp), %rdi
0000000000052f48	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000052f4d	jmp	0x52f6c
0000000000052f4f	movq	%rax, %r15
0000000000052f52	movq	%r13, %rdi
0000000000052f55	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
0000000000052f5a	jmp	0x52f5f
0000000000052f5c	movq	%rax, %r15
0000000000052f5f	movq	%r14, %rdi
0000000000052f62	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
0000000000052f67	jmp	0x52f6c
0000000000052f69	movq	%rax, %r15
0000000000052f6c	movq	%rbx, %rdi
0000000000052f6f	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000052f74	movq	%r15, %rdi
0000000000052f77	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
