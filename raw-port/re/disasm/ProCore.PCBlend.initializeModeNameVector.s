__ZN7PCBlendL24initializeModeNameVectorEv:
0000000000017a90	pushq	%rbp
0000000000017a91	movq	%rsp, %rbp
0000000000017a94	pushq	%r15
0000000000017a96	pushq	%r14
0000000000017a98	pushq	%r13
0000000000017a9a	pushq	%r12
0000000000017a9c	pushq	%rbx
0000000000017a9d	pushq	%rax
0000000000017a9e	callq	__ZN7PCBlendL17getModeNameVectorEv ## PCBlend::getModeNameVector()
0000000000017aa3	movl	$0x1, %edi
0000000000017aa8	callq	__ZN7PCBlend14modeMenuStringEb  ## PCBlend::modeMenuString(bool)
0000000000017aad	movq	%rax, %rbx
0000000000017ab0	movq	%rax, %rdi
0000000000017ab3	callq	__ZNK8PCString6cf_strEv         ## PCString::cf_str() const
0000000000017ab8	leaq	0x135599(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000017abf	movq	%rax, %rdi
0000000000017ac2	xorl	%edx, %edx
0000000000017ac4	callq	0xde096                         ## symbol stub for: _CFStringFind
0000000000017ac9	movq	%rax, %r14
0000000000017acc	movq	%rbx, %rdi
0000000000017acf	callq	__ZNK8PCString6cf_strEv         ## PCString::cf_str() const
0000000000017ad4	cmpq	$-0x1, %r14
0000000000017ad8	je	0x17ae3
0000000000017ada	leaq	0x135577(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000017ae1	jmp	0x17b0d
0000000000017ae3	leaq	0x13558e(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000017aea	movq	%rax, %rdi
0000000000017aed	xorl	%edx, %edx
0000000000017aef	callq	0xde096                         ## symbol stub for: _CFStringFind
0000000000017af4	cmpq	$-0x1, %rax
0000000000017af8	je	0x17b85
0000000000017afe	movq	%rbx, %rdi
0000000000017b01	callq	__ZNK8PCString6cf_strEv         ## PCString::cf_str() const
0000000000017b06	leaq	0x13556b(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000017b0d	xorl	%edi, %edi
0000000000017b0f	movq	%rax, %rsi
0000000000017b12	callq	0xde048                         ## symbol stub for: _CFStringCreateArrayBySeparatingStrings
0000000000017b17	movq	%rax, %rbx
0000000000017b1a	testq	%rax, %rax
0000000000017b1d	je	0x17b76
0000000000017b1f	movq	%rbx, %rdi
0000000000017b22	callq	0xddef2                         ## symbol stub for: _CFArrayGetCount
0000000000017b27	testq	%rax, %rax
0000000000017b2a	jle	0x17b6e
0000000000017b2c	movq	%rax, %r14
0000000000017b2f	xorl	%r15d, %r15d
0000000000017b32	leaq	-0x30(%rbp), %r12
0000000000017b36	leaq	__ZZN7PCBlendL17getModeNameVectorEvE14modeNameVector(%rip), %r13 ## PCBlend::getModeNameVector()::modeNameVector
0000000000017b3d	movq	%rbx, %rdi
0000000000017b40	movq	%r15, %rsi
0000000000017b43	callq	0xddefe                         ## symbol stub for: _CFArrayGetValueAtIndex
0000000000017b48	movq	%r12, %rdi
0000000000017b4b	movq	%rax, %rsi
0000000000017b4e	callq	__ZN8PCStringC1EPK10__CFString  ## PCString::PCString(__CFString const*)
0000000000017b53	movq	%r13, %rdi
0000000000017b56	movq	%r12, %rsi
0000000000017b59	callq	__ZNSt3__16vectorI8PCStringNS_9allocatorIS1_EEE9push_backB9nqe210106EOS1_ ## std::__1::vector<PCString, std::__1::allocator<PCString>>::push_back[abi:nqe210106](PCString&&)
0000000000017b5e	movq	%r12, %rdi
0000000000017b61	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000017b66	incq	%r15
0000000000017b69	cmpq	%r15, %r14
0000000000017b6c	jne	0x17b3d
0000000000017b6e	movq	%rbx, %rdi
0000000000017b71	callq	0xde012                         ## symbol stub for: _CFRelease
0000000000017b76	addq	$0x8, %rsp
0000000000017b7a	popq	%rbx
0000000000017b7b	popq	%r12
0000000000017b7d	popq	%r13
0000000000017b7f	popq	%r14
0000000000017b81	popq	%r15
0000000000017b83	popq	%rbp
0000000000017b84	retq
0000000000017b85	leaq	__ZZN7PCBlendL17getModeNameVectorEvE14modeNameVector(%rip), %rdi ## PCBlend::getModeNameVector()::modeNameVector
0000000000017b8c	movq	%rbx, %rsi
0000000000017b8f	addq	$0x8, %rsp
0000000000017b93	popq	%rbx
0000000000017b94	popq	%r12
0000000000017b96	popq	%r13
0000000000017b98	popq	%r14
0000000000017b9a	popq	%r15
0000000000017b9c	popq	%rbp
0000000000017b9d	jmp	__ZNSt3__16vectorI8PCStringNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<PCString, std::__1::allocator<PCString>>::push_back[abi:nqe210106](PCString const&)
0000000000017ba2	movq	%rax, %rbx
0000000000017ba5	leaq	-0x30(%rbp), %rdi
0000000000017ba9	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000017bae	movq	%rbx, %rdi
0000000000017bb1	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
