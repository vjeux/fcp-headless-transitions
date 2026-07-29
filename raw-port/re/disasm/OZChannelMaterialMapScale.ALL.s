__ZN25OZChannelMaterialMapScaleC2ERK8PCStringP15OZChannelFolderjj:
0000000000282be0	pushq	%rbp
0000000000282be1	movq	%rsp, %rbp
0000000000282be4	pushq	%r15
0000000000282be6	pushq	%r14
0000000000282be8	pushq	%r13
0000000000282bea	pushq	%r12
0000000000282bec	pushq	%rbx
0000000000282bed	subq	$0x38, %rsp
0000000000282bf1	movl	%r8d, %r14d
0000000000282bf4	movl	%ecx, %r15d
0000000000282bf7	movq	%rdx, %r12
0000000000282bfa	movq	%rsi, %r13
0000000000282bfd	movq	%rdi, %rbx
0000000000282c00	movq	__ZN33OZChannelMaterialMapScale_Factory13_instanceOnceE(%rip), %rax ## OZChannelMaterialMapScale_Factory::_instanceOnce
0000000000282c07	cmpq	$-0x1, %rax
0000000000282c0b	je	0x282c34
0000000000282c0d	leaq	-0x31(%rbp), %rax
0000000000282c11	movq	%rax, -0x30(%rbp)
0000000000282c15	leaq	-0x30(%rbp), %rax
0000000000282c19	movq	%rax, -0x40(%rbp)
0000000000282c1d	leaq	__ZN33OZChannelMaterialMapScale_Factory13_instanceOnceE(%rip), %rdi ## OZChannelMaterialMapScale_Factory::_instanceOnce
0000000000282c24	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN33OZChannelMaterialMapScale_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelMaterialMapScale_Factory::getInstance()::'lambda'()&&>>(void*)
0000000000282c2b	leaq	-0x40(%rbp), %rsi
0000000000282c2f	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
0000000000282c34	movq	__ZN33OZChannelMaterialMapScale_Factory9_instanceE(%rip), %rsi ## OZChannelMaterialMapScale_Factory::_instance
0000000000282c3b	xorps	%xmm0, %xmm0
0000000000282c3e	movups	%xmm0, 0x8(%rsp)
0000000000282c43	movl	$0x2, (%rsp)
0000000000282c4a	movq	%rbx, %rdi
0000000000282c4d	movq	%r13, %rdx
0000000000282c50	movq	%r12, %rcx
0000000000282c53	movl	%r15d, %r8d
0000000000282c56	movl	%r14d, %r9d
0000000000282c59	callq	0x6ddd64                        ## symbol stub for: __ZN14OZChannelScaleC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
0000000000282c5e	leaq	0x5c862b(%rip), %rax
0000000000282c65	movq	%rax, (%rbx)
0000000000282c68	leaq	0x5c8969(%rip), %rax
0000000000282c6f	movq	%rax, 0x10(%rbx)
0000000000282c73	leaq	_theApp(%rip), %r12
0000000000282c7a	movq	(%r12), %rax
0000000000282c7e	movq	0x48(%rax), %rdx
0000000000282c82	leaq	0x616a27(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000282c89	leaq	-0x30(%rbp), %rdi
0000000000282c8d	xorl	%ecx, %ecx
0000000000282c8f	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000282c94	leaq	0x1b8(%rbx), %r14
0000000000282c9b	xorps	%xmm0, %xmm0
0000000000282c9e	movups	%xmm0, (%rsp)
0000000000282ca2	leaq	-0x30(%rbp), %rdx
0000000000282ca6	movq	%r14, %rdi
0000000000282ca9	movl	$0x1, %esi
0000000000282cae	movq	%rbx, %rcx
0000000000282cb1	movl	$0xa, %r8d
0000000000282cb7	xorl	%r9d, %r9d
0000000000282cba	callq	0x6dd950                        ## symbol stub for: __ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
0000000000282cbf	leaq	-0x30(%rbp), %rdi
0000000000282cc3	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282cc8	movq	(%r12), %rax
0000000000282ccc	movq	0x48(%rax), %rdx
0000000000282cd0	leaq	0x6169f9(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000282cd7	leaq	-0x30(%rbp), %rdi
0000000000282cdb	xorl	%ecx, %ecx
0000000000282cdd	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000282ce2	leaq	0x250(%rbx), %r15
0000000000282ce9	movq	$0x0, (%rsp)
0000000000282cf1	movsd	0x48826f(%rip), %xmm0
0000000000282cf9	leaq	-0x30(%rbp), %rsi
0000000000282cfd	movq	%r15, %rdi
0000000000282d00	movq	%rbx, %rdx
0000000000282d03	movl	$0xb, %ecx
0000000000282d08	movl	$0x2, %r8d
0000000000282d0e	xorl	%r9d, %r9d
0000000000282d11	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000282d16	leaq	-0x30(%rbp), %rdi
0000000000282d1a	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282d1f	movq	(%r12), %rax
0000000000282d23	movq	0x48(%rax), %rdx
0000000000282d27	leaq	0x6169c2(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000282d2e	leaq	-0x30(%rbp), %rdi
0000000000282d32	xorl	%ecx, %ecx
0000000000282d34	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000282d39	leaq	0x2e8(%rbx), %rdi
0000000000282d40	xorps	%xmm0, %xmm0
0000000000282d43	movups	%xmm0, (%rsp)
0000000000282d47	movsd	0x482691(%rip), %xmm0
0000000000282d4f	leaq	-0x30(%rbp), %rsi
0000000000282d53	movaps	%xmm0, %xmm1
0000000000282d56	movq	%rbx, %rdx
0000000000282d59	movl	$0xc, %ecx
0000000000282d5e	movl	$0x2, %r8d
0000000000282d64	movl	$0x2, %r9d
0000000000282d6a	callq	0x6ddd5e                        ## symbol stub for: __ZN14OZChannelScaleC1EddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
0000000000282d6f	leaq	-0x30(%rbp), %rdi
0000000000282d73	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282d78	addq	$0x38, %rsp
0000000000282d7c	popq	%rbx
0000000000282d7d	popq	%r12
0000000000282d7f	popq	%r13
0000000000282d81	popq	%r14
0000000000282d83	popq	%r15
0000000000282d85	popq	%rbp
0000000000282d86	retq
0000000000282d87	movq	%rax, %r12
0000000000282d8a	leaq	-0x30(%rbp), %rdi
0000000000282d8e	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282d93	jmp	0x282d98
0000000000282d95	movq	%rax, %r12
0000000000282d98	movq	%r15, %rdi
0000000000282d9b	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000282da0	jmp	0x282db3
0000000000282da2	movq	%rax, %r12
0000000000282da5	leaq	-0x30(%rbp), %rdi
0000000000282da9	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282dae	jmp	0x282db3
0000000000282db0	movq	%rax, %r12
0000000000282db3	movq	%r14, %rdi
0000000000282db6	callq	0x6dd956                        ## symbol stub for: __ZN13OZChannelBoolD1Ev
0000000000282dbb	movq	%rbx, %rdi
0000000000282dbe	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
0000000000282dc3	movq	%r12, %rdi
0000000000282dc6	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000282dcb	movq	%rax, %r12
0000000000282dce	leaq	-0x30(%rbp), %rdi
0000000000282dd2	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282dd7	movq	%rbx, %rdi
0000000000282dda	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
0000000000282ddf	movq	%r12, %rdi
0000000000282de2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000282de7	movq	%rax, %r12
0000000000282dea	movq	%rbx, %rdi
0000000000282ded	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
0000000000282df2	movq	%r12, %rdi
0000000000282df5	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000282dfa	nopw	(%rax,%rax)
__ZN25OZChannelMaterialMapScaleC1ERK8PCStringP15OZChannelFolderjj:
0000000000282e00	pushq	%rbp
0000000000282e01	movq	%rsp, %rbp
0000000000282e04	popq	%rbp
0000000000282e05	jmp	__ZN25OZChannelMaterialMapScaleC2ERK8PCStringP15OZChannelFolderjj ## OZChannelMaterialMapScale::OZChannelMaterialMapScale(PCString const&, OZChannelFolder*, unsigned int, unsigned int)
0000000000282e0a	nopw	(%rax,%rax)
__ZN25OZChannelMaterialMapScaleC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj:
0000000000282e10	pushq	%rbp
0000000000282e11	movq	%rsp, %rbp
0000000000282e14	pushq	%r15
0000000000282e16	pushq	%r14
0000000000282e18	pushq	%r12
0000000000282e1a	pushq	%rbx
0000000000282e1b	subq	$0x20, %rsp
0000000000282e1f	movq	%rdi, %rbx
0000000000282e22	xorps	%xmm0, %xmm0
0000000000282e25	movups	%xmm0, 0x8(%rsp)
0000000000282e2a	movl	$0x2, (%rsp)
0000000000282e31	callq	0x6ddd64                        ## symbol stub for: __ZN14OZChannelScaleC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
0000000000282e36	leaq	0x5c8453(%rip), %rax
0000000000282e3d	movq	%rax, (%rbx)
0000000000282e40	leaq	0x5c8791(%rip), %rax
0000000000282e47	movq	%rax, 0x10(%rbx)
0000000000282e4b	leaq	_theApp(%rip), %r12
0000000000282e52	movq	(%r12), %rax
0000000000282e56	movq	0x48(%rax), %rdx
0000000000282e5a	leaq	0x61684f(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000282e61	leaq	-0x28(%rbp), %rdi
0000000000282e65	xorl	%ecx, %ecx
0000000000282e67	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000282e6c	leaq	0x1b8(%rbx), %r14
0000000000282e73	xorps	%xmm0, %xmm0
0000000000282e76	movups	%xmm0, (%rsp)
0000000000282e7a	leaq	-0x28(%rbp), %rdx
0000000000282e7e	movq	%r14, %rdi
0000000000282e81	movl	$0x1, %esi
0000000000282e86	movq	%rbx, %rcx
0000000000282e89	movl	$0xa, %r8d
0000000000282e8f	xorl	%r9d, %r9d
0000000000282e92	callq	0x6dd950                        ## symbol stub for: __ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
0000000000282e97	leaq	-0x28(%rbp), %rdi
0000000000282e9b	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282ea0	movq	(%r12), %rax
0000000000282ea4	movq	0x48(%rax), %rdx
0000000000282ea8	leaq	0x616821(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000282eaf	leaq	-0x28(%rbp), %rdi
0000000000282eb3	xorl	%ecx, %ecx
0000000000282eb5	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000282eba	leaq	0x250(%rbx), %r15
0000000000282ec1	movq	$0x0, (%rsp)
0000000000282ec9	movsd	0x488097(%rip), %xmm0
0000000000282ed1	leaq	-0x28(%rbp), %rsi
0000000000282ed5	movq	%r15, %rdi
0000000000282ed8	movq	%rbx, %rdx
0000000000282edb	movl	$0xb, %ecx
0000000000282ee0	movl	$0x2, %r8d
0000000000282ee6	xorl	%r9d, %r9d
0000000000282ee9	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000282eee	leaq	-0x28(%rbp), %rdi
0000000000282ef2	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282ef7	movq	(%r12), %rax
0000000000282efb	movq	0x48(%rax), %rdx
0000000000282eff	leaq	0x6167ea(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000282f06	leaq	-0x28(%rbp), %rdi
0000000000282f0a	xorl	%ecx, %ecx
0000000000282f0c	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000282f11	leaq	0x2e8(%rbx), %rdi
0000000000282f18	xorps	%xmm0, %xmm0
0000000000282f1b	movups	%xmm0, (%rsp)
0000000000282f1f	movsd	0x4824b9(%rip), %xmm0
0000000000282f27	leaq	-0x28(%rbp), %rsi
0000000000282f2b	movaps	%xmm0, %xmm1
0000000000282f2e	movq	%rbx, %rdx
0000000000282f31	movl	$0xc, %ecx
0000000000282f36	movl	$0x2, %r8d
0000000000282f3c	movl	$0x2, %r9d
0000000000282f42	callq	0x6ddd5e                        ## symbol stub for: __ZN14OZChannelScaleC1EddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
0000000000282f47	leaq	-0x28(%rbp), %rdi
0000000000282f4b	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282f50	addq	$0x20, %rsp
0000000000282f54	popq	%rbx
0000000000282f55	popq	%r12
0000000000282f57	popq	%r14
0000000000282f59	popq	%r15
0000000000282f5b	popq	%rbp
0000000000282f5c	retq
0000000000282f5d	movq	%rax, %r12
0000000000282f60	leaq	-0x28(%rbp), %rdi
0000000000282f64	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282f69	jmp	0x282f6e
0000000000282f6b	movq	%rax, %r12
0000000000282f6e	movq	%r15, %rdi
0000000000282f71	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000282f76	jmp	0x282f89
0000000000282f78	movq	%rax, %r12
0000000000282f7b	leaq	-0x28(%rbp), %rdi
0000000000282f7f	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282f84	jmp	0x282f89
0000000000282f86	movq	%rax, %r12
0000000000282f89	movq	%r14, %rdi
0000000000282f8c	callq	0x6dd956                        ## symbol stub for: __ZN13OZChannelBoolD1Ev
0000000000282f91	movq	%rbx, %rdi
0000000000282f94	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
0000000000282f99	movq	%r12, %rdi
0000000000282f9c	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000282fa1	movq	%rax, %r12
0000000000282fa4	leaq	-0x28(%rbp), %rdi
0000000000282fa8	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000282fad	movq	%rbx, %rdi
0000000000282fb0	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
0000000000282fb5	movq	%r12, %rdi
0000000000282fb8	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000282fbd	movq	%rax, %r12
0000000000282fc0	movq	%rbx, %rdi
0000000000282fc3	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
0000000000282fc8	movq	%r12, %rdi
0000000000282fcb	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
__ZN25OZChannelMaterialMapScaleC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj:
0000000000282fd0	pushq	%rbp
0000000000282fd1	movq	%rsp, %rbp
0000000000282fd4	popq	%rbp
0000000000282fd5	jmp	__ZN25OZChannelMaterialMapScaleC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj ## OZChannelMaterialMapScale::OZChannelMaterialMapScale(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
0000000000282fda	nopw	(%rax,%rax)
__ZN25OZChannelMaterialMapScaleC2EddRK8PCStringP15OZChannelFolderjj:
0000000000282fe0	pushq	%rbp
0000000000282fe1	movq	%rsp, %rbp
0000000000282fe4	pushq	%r15
0000000000282fe6	pushq	%r14
0000000000282fe8	pushq	%r13
0000000000282fea	pushq	%r12
0000000000282fec	pushq	%rbx
0000000000282fed	subq	$0x48, %rsp
0000000000282ff1	movl	%r8d, %r14d
0000000000282ff4	movl	%ecx, %r15d
0000000000282ff7	movq	%rdx, %r12
0000000000282ffa	movq	%rsi, %r13
0000000000282ffd	movq	%rdi, %rbx
0000000000283000	movq	__ZN33OZChannelMaterialMapScale_Factory13_instanceOnceE(%rip), %rax ## OZChannelMaterialMapScale_Factory::_instanceOnce
0000000000283007	cmpq	$-0x1, %rax
000000000028300b	je	0x283048
000000000028300d	leaq	-0x31(%rbp), %rax
0000000000283011	movq	%rax, -0x30(%rbp)
0000000000283015	leaq	-0x30(%rbp), %rax
0000000000283019	movq	%rax, -0x50(%rbp)
000000000028301d	leaq	__ZN33OZChannelMaterialMapScale_Factory13_instanceOnceE(%rip), %rdi ## OZChannelMaterialMapScale_Factory::_instanceOnce
0000000000283024	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN33OZChannelMaterialMapScale_Factory11getInstanceEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelMaterialMapScale_Factory::getInstance()::'lambda'()&&>>(void*)
000000000028302b	leaq	-0x50(%rbp), %rsi
000000000028302f	movsd	%xmm1, -0x48(%rbp)
0000000000283034	movsd	%xmm0, -0x40(%rbp)
0000000000283039	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000028303e	movsd	-0x40(%rbp), %xmm0
0000000000283043	movsd	-0x48(%rbp), %xmm1
0000000000283048	movq	__ZN33OZChannelMaterialMapScale_Factory9_instanceE(%rip), %rsi ## OZChannelMaterialMapScale_Factory::_instance
000000000028304f	xorps	%xmm2, %xmm2
0000000000283052	movups	%xmm2, 0x8(%rsp)
0000000000283057	movl	$0x2, (%rsp)
000000000028305e	movq	%rbx, %rdi
0000000000283061	movq	%r13, %rdx
0000000000283064	movq	%r12, %rcx
0000000000283067	movl	%r15d, %r8d
000000000028306a	movl	%r14d, %r9d
000000000028306d	callq	0x6ddd76                        ## symbol stub for: __ZN14OZChannelScaleC2EddP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
0000000000283072	leaq	0x5c8217(%rip), %rax
0000000000283079	movq	%rax, (%rbx)
000000000028307c	leaq	0x5c8555(%rip), %rax
0000000000283083	movq	%rax, 0x10(%rbx)
0000000000283087	leaq	_theApp(%rip), %r12
000000000028308e	movq	(%r12), %rax
0000000000283092	movq	0x48(%rax), %rdx
0000000000283096	leaq	0x616613(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000028309d	leaq	-0x30(%rbp), %rdi
00000000002830a1	xorl	%ecx, %ecx
00000000002830a3	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000002830a8	leaq	0x1b8(%rbx), %r14
00000000002830af	xorps	%xmm0, %xmm0
00000000002830b2	movups	%xmm0, (%rsp)
00000000002830b6	leaq	-0x30(%rbp), %rdx
00000000002830ba	movq	%r14, %rdi
00000000002830bd	movl	$0x1, %esi
00000000002830c2	movq	%rbx, %rcx
00000000002830c5	movl	$0xa, %r8d
00000000002830cb	xorl	%r9d, %r9d
00000000002830ce	callq	0x6dd950                        ## symbol stub for: __ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000002830d3	leaq	-0x30(%rbp), %rdi
00000000002830d7	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000002830dc	movq	(%r12), %rax
00000000002830e0	movq	0x48(%rax), %rdx
00000000002830e4	leaq	0x6165e5(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
00000000002830eb	leaq	-0x30(%rbp), %rdi
00000000002830ef	xorl	%ecx, %ecx
00000000002830f1	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000002830f6	leaq	0x250(%rbx), %r15
00000000002830fd	movq	$0x0, (%rsp)
0000000000283105	movsd	0x487e5b(%rip), %xmm0
000000000028310d	leaq	-0x30(%rbp), %rsi
0000000000283111	movq	%r15, %rdi
0000000000283114	movq	%rbx, %rdx
0000000000283117	movl	$0xb, %ecx
000000000028311c	movl	$0x2, %r8d
0000000000283122	xorl	%r9d, %r9d
0000000000283125	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000028312a	leaq	-0x30(%rbp), %rdi
000000000028312e	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000283133	movq	(%r12), %rax
0000000000283137	movq	0x48(%rax), %rdx
000000000028313b	leaq	0x6165ae(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000283142	leaq	-0x30(%rbp), %rdi
0000000000283146	xorl	%ecx, %ecx
0000000000283148	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000028314d	leaq	0x2e8(%rbx), %rdi
0000000000283154	xorps	%xmm0, %xmm0
0000000000283157	movups	%xmm0, (%rsp)
000000000028315b	movsd	0x48227d(%rip), %xmm0
0000000000283163	leaq	-0x30(%rbp), %rsi
0000000000283167	movaps	%xmm0, %xmm1
000000000028316a	movq	%rbx, %rdx
000000000028316d	movl	$0xc, %ecx
0000000000283172	movl	$0x2, %r8d
0000000000283178	movl	$0x2, %r9d
000000000028317e	callq	0x6ddd5e                        ## symbol stub for: __ZN14OZChannelScaleC1EddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
0000000000283183	leaq	-0x30(%rbp), %rdi
0000000000283187	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000028318c	addq	$0x48, %rsp
0000000000283190	popq	%rbx
0000000000283191	popq	%r12
0000000000283193	popq	%r13
0000000000283195	popq	%r14
0000000000283197	popq	%r15
0000000000283199	popq	%rbp
000000000028319a	retq
000000000028319b	movq	%rax, %r12
000000000028319e	leaq	-0x30(%rbp), %rdi
00000000002831a2	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000002831a7	jmp	0x2831ac
00000000002831a9	movq	%rax, %r12
00000000002831ac	movq	%r15, %rdi
00000000002831af	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000002831b4	jmp	0x2831c7
00000000002831b6	movq	%rax, %r12
00000000002831b9	leaq	-0x30(%rbp), %rdi
00000000002831bd	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000002831c2	jmp	0x2831c7
00000000002831c4	movq	%rax, %r12
00000000002831c7	movq	%r14, %rdi
00000000002831ca	callq	0x6dd956                        ## symbol stub for: __ZN13OZChannelBoolD1Ev
00000000002831cf	movq	%rbx, %rdi
00000000002831d2	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
00000000002831d7	movq	%r12, %rdi
00000000002831da	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000002831df	movq	%rax, %r12
00000000002831e2	leaq	-0x30(%rbp), %rdi
00000000002831e6	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000002831eb	movq	%rbx, %rdi
00000000002831ee	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
00000000002831f3	movq	%r12, %rdi
00000000002831f6	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000002831fb	movq	%rax, %r12
00000000002831fe	movq	%rbx, %rdi
0000000000283201	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
0000000000283206	movq	%r12, %rdi
0000000000283209	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000028320e	nop
__ZN25OZChannelMaterialMapScaleC1EddRK8PCStringP15OZChannelFolderjj:
0000000000283210	pushq	%rbp
0000000000283211	movq	%rsp, %rbp
0000000000283214	popq	%rbp
0000000000283215	jmp	__ZN25OZChannelMaterialMapScaleC2EddRK8PCStringP15OZChannelFolderjj ## OZChannelMaterialMapScale::OZChannelMaterialMapScale(double, double, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
000000000028321a	nopw	(%rax,%rax)
__ZN25OZChannelMaterialMapScaleC2EP9OZFactoryRK8PCStringj:
0000000000283220	pushq	%rbp
0000000000283221	movq	%rsp, %rbp
0000000000283224	pushq	%r15
0000000000283226	pushq	%r14
0000000000283228	pushq	%r12
000000000028322a	pushq	%rbx
000000000028322b	subq	$0x20, %rsp
000000000028322f	movq	%rdi, %rbx
0000000000283232	callq	0x6ddd6a                        ## symbol stub for: __ZN14OZChannelScaleC2EP9OZFactoryRK8PCStringj
0000000000283237	leaq	0x5c8052(%rip), %rax
000000000028323e	movq	%rax, (%rbx)
0000000000283241	leaq	0x5c8390(%rip), %rax
0000000000283248	movq	%rax, 0x10(%rbx)
000000000028324c	leaq	_theApp(%rip), %r12
0000000000283253	movq	(%r12), %rax
0000000000283257	movq	0x48(%rax), %rdx
000000000028325b	leaq	0x61644e(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000283262	leaq	-0x28(%rbp), %rdi
0000000000283266	xorl	%ecx, %ecx
0000000000283268	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000028326d	leaq	0x1b8(%rbx), %r14
0000000000283274	xorps	%xmm0, %xmm0
0000000000283277	movups	%xmm0, (%rsp)
000000000028327b	leaq	-0x28(%rbp), %rdx
000000000028327f	movq	%r14, %rdi
0000000000283282	movl	$0x1, %esi
0000000000283287	movq	%rbx, %rcx
000000000028328a	movl	$0xa, %r8d
0000000000283290	xorl	%r9d, %r9d
0000000000283293	callq	0x6dd950                        ## symbol stub for: __ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
0000000000283298	leaq	-0x28(%rbp), %rdi
000000000028329c	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000002832a1	movq	(%r12), %rax
00000000002832a5	movq	0x48(%rax), %rdx
00000000002832a9	leaq	0x616420(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
00000000002832b0	leaq	-0x28(%rbp), %rdi
00000000002832b4	xorl	%ecx, %ecx
00000000002832b6	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000002832bb	leaq	0x250(%rbx), %r15
00000000002832c2	movq	$0x0, (%rsp)
00000000002832ca	movsd	0x487c96(%rip), %xmm0
00000000002832d2	leaq	-0x28(%rbp), %rsi
00000000002832d6	movq	%r15, %rdi
00000000002832d9	movq	%rbx, %rdx
00000000002832dc	movl	$0xb, %ecx
00000000002832e1	movl	$0x2, %r8d
00000000002832e7	xorl	%r9d, %r9d
00000000002832ea	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000002832ef	leaq	-0x28(%rbp), %rdi
00000000002832f3	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000002832f8	movq	(%r12), %rax
00000000002832fc	movq	0x48(%rax), %rdx
0000000000283300	leaq	0x6163e9(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000283307	leaq	-0x28(%rbp), %rdi
000000000028330b	xorl	%ecx, %ecx
000000000028330d	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000283312	leaq	0x2e8(%rbx), %rdi
0000000000283319	xorps	%xmm0, %xmm0
000000000028331c	movups	%xmm0, (%rsp)
0000000000283320	movsd	0x4820b8(%rip), %xmm0
0000000000283328	leaq	-0x28(%rbp), %rsi
000000000028332c	movaps	%xmm0, %xmm1
000000000028332f	movq	%rbx, %rdx
0000000000283332	movl	$0xc, %ecx
0000000000283337	movl	$0x2, %r8d
000000000028333d	movl	$0x2, %r9d
0000000000283343	callq	0x6ddd5e                        ## symbol stub for: __ZN14OZChannelScaleC1EddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
0000000000283348	leaq	-0x28(%rbp), %rdi
000000000028334c	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000283351	addq	$0x20, %rsp
0000000000283355	popq	%rbx
0000000000283356	popq	%r12
0000000000283358	popq	%r14
000000000028335a	popq	%r15
000000000028335c	popq	%rbp
000000000028335d	retq
000000000028335e	movq	%rax, %r12
0000000000283361	leaq	-0x28(%rbp), %rdi
0000000000283365	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000028336a	jmp	0x28336f
000000000028336c	movq	%rax, %r12
000000000028336f	movq	%r15, %rdi
0000000000283372	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000283377	jmp	0x28338a
0000000000283379	movq	%rax, %r12
000000000028337c	leaq	-0x28(%rbp), %rdi
0000000000283380	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000283385	jmp	0x28338a
0000000000283387	movq	%rax, %r12
000000000028338a	movq	%r14, %rdi
000000000028338d	callq	0x6dd956                        ## symbol stub for: __ZN13OZChannelBoolD1Ev
0000000000283392	movq	%rbx, %rdi
0000000000283395	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
000000000028339a	movq	%r12, %rdi
000000000028339d	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000002833a2	movq	%rax, %r12
00000000002833a5	leaq	-0x28(%rbp), %rdi
00000000002833a9	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000002833ae	movq	%rbx, %rdi
00000000002833b1	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
00000000002833b6	movq	%r12, %rdi
00000000002833b9	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000002833be	movq	%rax, %r12
00000000002833c1	movq	%rbx, %rdi
00000000002833c4	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
00000000002833c9	movq	%r12, %rdi
00000000002833cc	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000002833d1	nopw	%cs:(%rax,%rax)
__ZN25OZChannelMaterialMapScaleC1EP9OZFactoryRK8PCStringj:
00000000002833e0	pushq	%rbp
00000000002833e1	movq	%rsp, %rbp
00000000002833e4	popq	%rbp
00000000002833e5	jmp	__ZN25OZChannelMaterialMapScaleC2EP9OZFactoryRK8PCStringj ## OZChannelMaterialMapScale::OZChannelMaterialMapScale(OZFactory*, PCString const&, unsigned int)
00000000002833ea	nopw	(%rax,%rax)
__ZN25OZChannelMaterialMapScaleC2ERKS_P15OZChannelFolder:
00000000002833f0	pushq	%rbp
00000000002833f1	movq	%rsp, %rbp
00000000002833f4	pushq	%r15
00000000002833f6	pushq	%r14
00000000002833f8	pushq	%r12
00000000002833fa	pushq	%rbx
00000000002833fb	movq	%rsi, %r15
00000000002833fe	movq	%rdi, %rbx
0000000000283401	callq	0x6ddd70                        ## symbol stub for: __ZN14OZChannelScaleC2ERKS_P15OZChannelFolder
0000000000283406	leaq	0x5c7e83(%rip), %rax
000000000028340d	movq	%rax, (%rbx)
0000000000283410	leaq	0x5c81c1(%rip), %rax
0000000000283417	movq	%rax, 0x10(%rbx)
000000000028341b	leaq	0x1b8(%rbx), %r14
0000000000283422	leaq	0x1b8(%r15), %rsi
0000000000283429	movq	%r14, %rdi
000000000028342c	movq	%rbx, %rdx
000000000028342f	callq	0x6dd94a                        ## symbol stub for: __ZN13OZChannelBoolC1ERKS_P15OZChannelFolder
0000000000283434	leaq	0x250(%rbx), %r12
000000000028343b	leaq	0x250(%r15), %rsi
0000000000283442	movq	%r12, %rdi
0000000000283445	movq	%rbx, %rdx
0000000000283448	callq	0x6df47a                        ## symbol stub for: __ZN9OZChannelC2ERKS_P15OZChannelFolder
000000000028344d	movq	0x59f46c(%rip), %rax            ## literal pool symbol address: __ZTV15OZChannelDouble
0000000000283454	leaq	0x10(%rax), %rcx
0000000000283458	movq	%rcx, 0x250(%rbx)
000000000028345f	addq	$0x370, %rax                    ## imm = 0x370
0000000000283465	movq	%rax, 0x260(%rbx)
000000000028346c	leaq	0x2e8(%rbx), %rdi
0000000000283473	addq	$0x2e8, %r15                    ## imm = 0x2E8
000000000028347a	movq	%r15, %rsi
000000000028347d	movq	%rbx, %rdx
0000000000283480	callq	0x6ddd58                        ## symbol stub for: __ZN14OZChannelScaleC1ERKS_P15OZChannelFolder
0000000000283485	popq	%rbx
0000000000283486	popq	%r12
0000000000283488	popq	%r14
000000000028348a	popq	%r15
000000000028348c	popq	%rbp
000000000028348d	retq
000000000028348e	movq	%rax, %r15
0000000000283491	movq	%r12, %rdi
0000000000283494	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000283499	jmp	0x28349e
000000000028349b	movq	%rax, %r15
000000000028349e	movq	%r14, %rdi
00000000002834a1	callq	0x6dd956                        ## symbol stub for: __ZN13OZChannelBoolD1Ev
00000000002834a6	movq	%rbx, %rdi
00000000002834a9	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
00000000002834ae	movq	%r15, %rdi
00000000002834b1	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000002834b6	movq	%rax, %r15
00000000002834b9	movq	%rbx, %rdi
00000000002834bc	callq	__ZN14OZChannelScaleD2Ev        ## OZChannelScale::~OZChannelScale()
00000000002834c1	movq	%r15, %rdi
00000000002834c4	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000002834c9	nopl	(%rax)
__ZN25OZChannelMaterialMapScaleC1ERKS_P15OZChannelFolder:
00000000002834d0	pushq	%rbp
00000000002834d1	movq	%rsp, %rbp
00000000002834d4	popq	%rbp
00000000002834d5	jmp	__ZN25OZChannelMaterialMapScaleC2ERKS_P15OZChannelFolder ## OZChannelMaterialMapScale::OZChannelMaterialMapScale(OZChannelMaterialMapScale const&, OZChannelFolder*)
00000000002834da	nopw	(%rax,%rax)
__ZNK25OZChannelMaterialMapScale5cloneEv:
00000000002834e0	pushq	%rbp
00000000002834e1	movq	%rsp, %rbp
00000000002834e4	pushq	%r14
00000000002834e6	pushq	%rbx
00000000002834e7	movq	%rdi, %r14
00000000002834ea	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000002834ef	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000002834f4	movq	%rax, %rbx
00000000002834f7	movq	%rax, %rdi
00000000002834fa	movq	%r14, %rsi
00000000002834fd	xorl	%edx, %edx
00000000002834ff	callq	__ZN25OZChannelMaterialMapScaleC2ERKS_P15OZChannelFolder ## OZChannelMaterialMapScale::OZChannelMaterialMapScale(OZChannelMaterialMapScale const&, OZChannelFolder*)
0000000000283504	movq	%rbx, %rax
0000000000283507	popq	%rbx
0000000000283508	popq	%r14
000000000028350a	popq	%rbp
000000000028350b	retq
000000000028350c	movq	%rax, %r14
000000000028350f	movq	%rbx, %rdi
0000000000283512	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000283517	movq	%r14, %rdi
000000000028351a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000028351f	nop
__ZN25OZChannelMaterialMapScale4copyEPK13OZChannelBaseb:
0000000000283520	pushq	%rbp
0000000000283521	movq	%rsp, %rbp
0000000000283524	pushq	%r15
0000000000283526	pushq	%r14
0000000000283528	pushq	%rbx
0000000000283529	pushq	%rax
000000000028352a	movl	%edx, %r14d
000000000028352d	movq	%rsi, %r15
0000000000283530	movq	%rdi, %rbx
0000000000283533	callq	0x6dd560                        ## symbol stub for: __ZN11OZChannel2D4copyEPK13OZChannelBaseb
0000000000283538	testq	%r15, %r15
000000000028353b	je	0x28355a
000000000028353d	movq	0x59f1ec(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
0000000000283544	leaq	__ZTI25OZChannelMaterialMapScale(%rip), %rdx ## typeinfo for OZChannelMaterialMapScale
000000000028354b	movq	%r15, %rdi
000000000028354e	xorl	%ecx, %ecx
0000000000283550	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000283555	movq	%rax, %r15
0000000000283558	jmp	0x28355d
000000000028355a	xorl	%r15d, %r15d
000000000028355d	leaq	0x1b8(%rbx), %rdi
0000000000283564	leaq	0x1b8(%r15), %rsi
000000000028356b	movzbl	%r14b, %r14d
000000000028356f	movl	%r14d, %edx
0000000000283572	callq	0x6df426                        ## symbol stub for: __ZN9OZChannel4copyEPK13OZChannelBaseb
0000000000283577	leaq	0x250(%rbx), %rdi
000000000028357e	leaq	0x250(%r15), %rsi
0000000000283585	movl	%r14d, %edx
0000000000283588	callq	0x6df426                        ## symbol stub for: __ZN9OZChannel4copyEPK13OZChannelBaseb
000000000028358d	addq	$0x2e8, %rbx                    ## imm = 0x2E8
0000000000283594	addq	$0x2e8, %r15                    ## imm = 0x2E8
000000000028359b	movq	%rbx, %rdi
000000000028359e	movq	%r15, %rsi
00000000002835a1	movl	%r14d, %edx
00000000002835a4	addq	$0x8, %rsp
00000000002835a8	popq	%rbx
00000000002835a9	popq	%r14
00000000002835ab	popq	%r15
00000000002835ad	popq	%rbp
00000000002835ae	jmp	0x6dd560                        ## symbol stub for: __ZN11OZChannel2D4copyEPK13OZChannelBaseb
00000000002835b3	nopw	%cs:(%rax,%rax)
__ZN25OZChannelMaterialMapScale13setBasisScaleEdd:
00000000002835c0	pushq	%rbp
00000000002835c1	movq	%rsp, %rbp
00000000002835c4	pushq	%rbx
00000000002835c5	subq	$0x18, %rsp
00000000002835c9	movsd	%xmm1, -0x18(%rbp)
00000000002835ce	movsd	%xmm0, -0x10(%rbp)
00000000002835d3	movq	%rdi, %rbx
00000000002835d6	addq	$0x2e8, %rbx                    ## imm = 0x2E8
00000000002835dd	movq	%rbx, %rdi
00000000002835e0	xorl	%esi, %esi
00000000002835e2	callq	0x6dd8f6                        ## symbol stub for: __ZN13OZChannelBase5resetEb
00000000002835e7	movq	0x5a0f22(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000002835ee	movq	%rbx, %rdi
00000000002835f1	movsd	-0x10(%rbp), %xmm0
00000000002835f6	movsd	-0x18(%rbp), %xmm1
00000000002835fb	xorl	%edx, %edx
00000000002835fd	addq	$0x18, %rsp
0000000000283601	popq	%rbx
0000000000283602	popq	%rbp
0000000000283603	jmp	0x6dd566                        ## symbol stub for: __ZN11OZChannel2D8setValueERK6CMTimeddb
0000000000283608	nopl	(%rax,%rax)
__ZN25OZChannelMaterialMapScaleD1Ev:
0000000000283610	pushq	%rbp
0000000000283611	movq	%rsp, %rbp
0000000000283614	pushq	%r15
0000000000283616	pushq	%r14
0000000000283618	pushq	%r12
000000000028361a	pushq	%rbx
000000000028361b	movq	%rdi, %rbx
000000000028361e	leaq	0x5c7c6b(%rip), %rax
0000000000283625	movq	%rax, (%rdi)
0000000000283628	leaq	0x5c7fa9(%rip), %rax
000000000028362f	movq	%rax, 0x10(%rdi)
0000000000283633	leaq	0x2e8(%rdi), %r14
000000000028363a	movq	0x59f23f(%rip), %r15            ## literal pool symbol address: __ZTV11OZChannel2D
0000000000283641	leaq	0x10(%r15), %r12
0000000000283645	movq	%r12, 0x2e8(%rdi)
000000000028364c	addq	$0x358, %r15                    ## imm = 0x358
0000000000283653	movq	%r15, 0x2f8(%rdi)
000000000028365a	addq	$0x408, %rdi                    ## imm = 0x408
0000000000283661	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000283666	leaq	0x370(%rbx), %rdi
000000000028366d	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000283672	movq	%r14, %rdi
0000000000283675	callq	0x6de2b6                        ## symbol stub for: __ZN17OZCompoundChannelD2Ev
000000000028367a	leaq	0x250(%rbx), %rdi
0000000000283681	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000283686	leaq	0x1b8(%rbx), %rdi
000000000028368d	callq	0x6dd956                        ## symbol stub for: __ZN13OZChannelBoolD1Ev
0000000000283692	movq	%r12, (%rbx)
0000000000283695	movq	%r15, 0x10(%rbx)
0000000000283699	leaq	0x120(%rbx), %rdi
00000000002836a0	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000002836a5	leaq	0x88(%rbx), %rdi
00000000002836ac	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000002836b1	movq	%rbx, %rdi
00000000002836b4	popq	%rbx
00000000002836b5	popq	%r12
00000000002836b7	popq	%r14
00000000002836b9	popq	%r15
00000000002836bb	popq	%rbp
00000000002836bc	jmp	0x6de2b6                        ## symbol stub for: __ZN17OZCompoundChannelD2Ev
00000000002836c1	nopw	%cs:(%rax,%rax)
__ZN25OZChannelMaterialMapScaleD0Ev:
00000000002836d0	pushq	%rbp
00000000002836d1	movq	%rsp, %rbp
00000000002836d4	pushq	%r15
00000000002836d6	pushq	%r14
00000000002836d8	pushq	%r12
00000000002836da	pushq	%rbx
00000000002836db	movq	%rdi, %rbx
00000000002836de	leaq	0x5c7bab(%rip), %rax
00000000002836e5	movq	%rax, (%rdi)
00000000002836e8	leaq	0x5c7ee9(%rip), %rax
00000000002836ef	movq	%rax, 0x10(%rdi)
00000000002836f3	leaq	0x2e8(%rdi), %r14
00000000002836fa	movq	0x59f17f(%rip), %r15            ## literal pool symbol address: __ZTV11OZChannel2D
0000000000283701	leaq	0x10(%r15), %r12
0000000000283705	movq	%r12, 0x2e8(%rdi)
000000000028370c	addq	$0x358, %r15                    ## imm = 0x358
0000000000283713	movq	%r15, 0x2f8(%rdi)
000000000028371a	addq	$0x408, %rdi                    ## imm = 0x408
0000000000283721	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000283726	leaq	0x370(%rbx), %rdi
000000000028372d	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000283732	movq	%r14, %rdi
0000000000283735	callq	0x6de2b6                        ## symbol stub for: __ZN17OZCompoundChannelD2Ev
000000000028373a	leaq	0x250(%rbx), %rdi
0000000000283741	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000283746	leaq	0x1b8(%rbx), %rdi
000000000028374d	callq	0x6dd956                        ## symbol stub for: __ZN13OZChannelBoolD1Ev
0000000000283752	movq	%r12, (%rbx)
0000000000283755	movq	%r15, 0x10(%rbx)
0000000000283759	leaq	0x120(%rbx), %rdi
0000000000283760	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000283765	leaq	0x88(%rbx), %rdi
000000000028376c	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
0000000000283771	movq	%rbx, %rdi
0000000000283774	callq	0x6de2b6                        ## symbol stub for: __ZN17OZCompoundChannelD2Ev
0000000000283779	movq	%rbx, %rdi
000000000028377c	popq	%rbx
000000000028377d	popq	%r12
000000000028377f	popq	%r14
0000000000283781	popq	%r15
0000000000283783	popq	%rbp
0000000000283784	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000283789	nopl	(%rax)
__ZNK17OZCompoundChannel17isCompoundChannelEv:
0000000000283790	pushq	%rbp
0000000000283791	movq	%rsp, %rbp
0000000000283794	movb	$0x1, %al
0000000000283796	popq	%rbp
0000000000283797	retq
0000000000283798	nopl	(%rax,%rax)
__ZN17OZCompoundChannel24setKeypointInterpolationEP9OZChannelPvjb:
00000000002837a0	pushq	%rbp
00000000002837a1	movq	%rsp, %rbp
00000000002837a4	xorl	%eax, %eax
00000000002837a6	popq	%rbp
00000000002837a7	retq
