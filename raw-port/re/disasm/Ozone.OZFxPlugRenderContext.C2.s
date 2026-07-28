0000000000616b0a	callq	___clang_call_terminate
0000000000616b0f	addb	%dl, 0x48(%rbp)
0000000000616b12	movl	%esp, %ebp
0000000000616b14	pushq	%r15
0000000000616b16	pushq	%r14
0000000000616b18	pushq	%r13
0000000000616b1a	pushq	%r12
0000000000616b1c	pushq	%rbx
0000000000616b1d	subq	$0x38, %rsp
0000000000616b21	movq	%rdx, %r14
0000000000616b24	movss	%xmm0, -0x2c(%rbp)
0000000000616b29	movq	%rsi, %r12
0000000000616b2c	movq	%rdi, %r15
0000000000616b2f	leaq	__ZTV21OZFxPlugRenderContext(%rip), %rax ## vtable for OZFxPlugRenderContext
0000000000616b36	addq	$0x10, %rax
0000000000616b3a	movq	%rax, (%rdi)
0000000000616b3d	movl	$0x1, 0x8(%rdi)
0000000000616b44	movq	$0x0, 0x10(%rdi)
0000000000616b4c	leaq	0x18(%rdi), %r13
0000000000616b50	movq	%r13, %rdi
0000000000616b53	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
0000000000616b58	movl	$0x0, 0x34(%r15)
0000000000616b60	movb	$0x0, 0x38(%r15)
0000000000616b65	xorps	%xmm0, %xmm0
0000000000616b68	movups	%xmm0, 0x20(%r15)
0000000000616b6d	movb	$0x0, 0x30(%r15)
0000000000616b72	movl	$0x5c0, %edi                    ## imm = 0x5C0
0000000000616b77	movq	%r13, -0x40(%rbp)
0000000000616b7b	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000616b80	movq	%rax, %rbx
0000000000616b83	movq	%rax, %rdi
0000000000616b86	callq	__ZN14OZRenderParamsC1Ev        ## OZRenderParams::OZRenderParams()
0000000000616b8b	movq	%rbx, 0x40(%r15)
0000000000616b8f	movq	%r12, %rdi
0000000000616b92	callq	0x6df660                        ## symbol stub for: __ZNK18FxColorDescription14isColorManagedEv
0000000000616b97	testb	%al, %al
0000000000616b99	je	0x616bc9
0000000000616b9b	movq	(%r12), %rdi
0000000000616b9f	movq	%rdi, -0x60(%rbp)
0000000000616ba3	testq	%rdi, %rdi
0000000000616ba6	je	0x616bad
0000000000616ba8	callq	0x6dda94                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE6retainES1_
0000000000616bad	movl	0x10(%r12), %eax
0000000000616bb2	movl	%eax, -0x50(%rbp)
0000000000616bb5	movq	0x8(%r12), %rax
0000000000616bba	movq	%rax, -0x58(%rbp)
0000000000616bbe	movzbl	0x18(%r12), %eax
0000000000616bc4	movb	%al, -0x48(%rbp)
0000000000616bc7	jmp	0x616bdd
0000000000616bc9	callq	0x6de2fe                        ## symbol stub for: __ZN17PCColorSpaceCache14cgRec709LinearEv
0000000000616bce	leaq	-0x60(%rbp), %rdi
0000000000616bd2	movq	%r12, %rsi
0000000000616bd5	movq	%rax, %rdx
0000000000616bd8	callq	0x6de3fa                        ## symbol stub for: __ZN18FxColorDescriptionC1ERKS_P12CGColorSpace
0000000000616bdd	leaq	0x48(%r15), %r12
0000000000616be1	leaq	-0x60(%rbp), %rsi
0000000000616be5	movq	%r12, %rdi
0000000000616be8	movss	-0x2c(%rbp), %xmm0
0000000000616bed	movq	%r14, %rdx
0000000000616bf0	callq	0x6de436                        ## symbol stub for: __ZN18LiRenderParametersC1ERK18FxColorDescriptionfRKNSt3__110shared_ptrIK15HGComputeDeviceEE
0000000000616bf5	movq	-0x60(%rbp), %rdi
0000000000616bf9	testq	%rdi, %rdi
0000000000616bfc	je	0x616c03
0000000000616bfe	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
0000000000616c03	leaq	0x120(%r15), %rax
0000000000616c0a	movq	%rax, -0x38(%rbp)
0000000000616c0e	leaq	0x130(%r15), %rbx
0000000000616c15	movl	$0x0, 0x14c(%r15)
0000000000616c20	leaq	0x150(%r15), %r13
0000000000616c27	movq	$0x0, 0x150(%r15)
0000000000616c32	xorps	%xmm0, %xmm0
0000000000616c35	movups	%xmm0, 0x120(%r15)
0000000000616c3d	movups	%xmm0, 0x130(%r15)
0000000000616c45	movups	%xmm0, 0x139(%r15)
0000000000616c4d	movq	0x40(%r15), %rdi
0000000000616c51	leaq	0xe8(%r15), %rsi
0000000000616c58	callq	__ZN14OZRenderParams26setWorkingColorDescriptionERK18FxColorDescription ## OZRenderParams::setWorkingColorDescription(FxColorDescription const&)
0000000000616c5d	movq	0x40(%r15), %rdi
0000000000616c61	movss	-0x2c(%rbp), %xmm0
0000000000616c66	callq	__ZN14OZRenderParams16setBlendingGammaEf ## OZRenderParams::setBlendingGamma(float)
0000000000616c6b	movq	0x40(%r15), %rdi
0000000000616c6f	movq	%r14, %rsi
0000000000616c72	callq	__ZN14OZRenderParams15setRenderDeviceERKNSt3__110shared_ptrIK15HGComputeDeviceEE ## OZRenderParams::setRenderDevice(std::__1::shared_ptr<HGComputeDevice const> const&)
0000000000616c77	addq	$0x38, %rsp
0000000000616c7b	popq	%rbx
0000000000616c7c	popq	%r12
0000000000616c7e	popq	%r13
0000000000616c80	popq	%r14
0000000000616c82	popq	%r15
0000000000616c84	popq	%rbp
0000000000616c85	retq
0000000000616c86	movq	%rax, %rdi
0000000000616c89	callq	___clang_call_terminate
0000000000616c8e	movq	%rax, %r14
0000000000616c91	leaq	-0x60(%rbp), %rdi
0000000000616c95	callq	__ZN18FxColorDescriptionD1Ev    ## FxColorDescription::~FxColorDescription()
0000000000616c9a	movq	-0x40(%rbp), %rdi
0000000000616c9e	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000616ca3	movq	%r14, %rdi
0000000000616ca6	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000616cab	movq	%rax, %r14
0000000000616cae	movq	%rbx, %rdi
0000000000616cb1	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000616cb6	movq	-0x40(%rbp), %rdi
0000000000616cba	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000616cbf	movq	%r14, %rdi
0000000000616cc2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000616cc7	jmp	0x616cc9
0000000000616cc9	movq	%rax, %r14
0000000000616ccc	movq	-0x40(%rbp), %rdi
0000000000616cd0	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000616cd5	movq	%r14, %rdi
0000000000616cd8	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000616cdd	movq	%rax, %r14
0000000000616ce0	movq	%r13, %rdi
0000000000616ce3	callq	__ZNSt3__110unique_ptrI34PGPerThreadSetCurrentContextSentryNS_14default_deleteIS1_EEED1B9nqe210106Ev ## std::__1::unique_ptr<PGPerThreadSetCurrentContextSentry, std::__1::default_delete<PGPerThreadSetCurrentContextSentry>>::~unique_ptr[abi:nqe210106]()
0000000000616ce8	movq	%rbx, %rdi
0000000000616ceb	callq	__ZNSt3__16vectorINS_10shared_ptrIK15HGComputeDeviceEENS_9allocatorIS4_EEED1B9nqe210106Ev ## std::__1::vector<std::__1::shared_ptr<HGComputeDevice const>, std::__1::allocator<std::__1::shared_ptr<HGComputeDevice const>>>::~vector[abi:nqe210106]()
0000000000616cf0	movq	-0x38(%rbp), %rdi
0000000000616cf4	callq	__ZNSt3__110shared_ptrI20Li3DEngineObjectDataED1B9nqe210106Ev ## std::__1::shared_ptr<Li3DEngineObjectData>::~shared_ptr[abi:nqe210106]()
0000000000616cf9	movq	%r12, %rdi
0000000000616cfc	callq	__ZN18LiRenderParametersD2Ev    ## LiRenderParameters::~LiRenderParameters()
0000000000616d01	movq	-0x40(%rbp), %rdi
0000000000616d05	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000616d0a	movq	%r14, %rdi
0000000000616d0d	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000616d12	nopw	%cs:(%rax,%rax)
__ZNSt3__110unique_ptrI34PGPerThreadSetCurrentContextSentryNS_14default_deleteIS1_EEED1B9nqe210106Ev:
0000000000616d20	pushq	%rbp
0000000000616d21	movq	%rsp, %rbp
0000000000616d24	pushq	%rbx
0000000000616d25	pushq	%rax
0000000000616d26	movq	(%rdi), %rbx
0000000000616d29	movq	$0x0, (%rdi)
0000000000616d30	testq	%rbx, %rbx
0000000000616d33	je	0x616d4b
0000000000616d35	movq	%rbx, %rdi
0000000000616d38	callq	0x6de910                        ## symbol stub for: __ZN34PGPerThreadSetCurrentContextSentryD1Ev
0000000000616d3d	movq	%rbx, %rdi
0000000000616d40	addq	$0x8, %rsp
0000000000616d44	popq	%rbx
0000000000616d45	popq	%rbp
0000000000616d46	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000616d4b	addq	$0x8, %rsp
0000000000616d4f	popq	%rbx
0000000000616d50	popq	%rbp
0000000000616d51	retq
0000000000616d52	nopw	%cs:(%rax,%rax)
__ZN21OZFxPlugRenderContextC1ERK18FxColorDescriptionfRKNSt3__110shared_ptrIK15HGComputeDeviceEE:
