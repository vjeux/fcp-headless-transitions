__ZN7PCBlendL28initializeMaskModeNameVectorEv:
0000000000017ca0	pushq	%rbp
0000000000017ca1	movq	%rsp, %rbp
0000000000017ca4	pushq	%r15
0000000000017ca6	pushq	%r14
0000000000017ca8	pushq	%r13
0000000000017caa	pushq	%r12
0000000000017cac	pushq	%rbx
0000000000017cad	pushq	%rax
0000000000017cae	callq	__ZN7PCBlendL21getMaskModeNameVectorEv ## PCBlend::getMaskModeNameVector()
0000000000017cb3	callq	__ZN7PCBlend18maskModeMenuStringEv ## PCBlend::maskModeMenuString()
0000000000017cb8	movq	%rax, %rbx
0000000000017cbb	movq	%rax, %rdi
0000000000017cbe	callq	__ZNK8PCString6cf_strEv         ## PCString::cf_str() const
0000000000017cc3	leaq	0x13538e(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000017cca	movq	%rax, %rdi
0000000000017ccd	xorl	%edx, %edx
0000000000017ccf	callq	0xde096                         ## symbol stub for: _CFStringFind
0000000000017cd4	movq	%rax, %r14
0000000000017cd7	movq	%rbx, %rdi
0000000000017cda	callq	__ZNK8PCString6cf_strEv         ## PCString::cf_str() const
0000000000017cdf	cmpq	$-0x1, %r14
0000000000017ce3	je	0x17cee
0000000000017ce5	leaq	0x13536c(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000017cec	jmp	0x17d18
0000000000017cee	leaq	0x135383(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000017cf5	movq	%rax, %rdi
0000000000017cf8	xorl	%edx, %edx
0000000000017cfa	callq	0xde096                         ## symbol stub for: _CFStringFind
0000000000017cff	cmpq	$-0x1, %rax
0000000000017d03	je	0x17d90
0000000000017d09	movq	%rbx, %rdi
0000000000017d0c	callq	__ZNK8PCString6cf_strEv         ## PCString::cf_str() const
0000000000017d11	leaq	0x135360(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000017d18	xorl	%edi, %edi
0000000000017d1a	movq	%rax, %rsi
0000000000017d1d	callq	0xde048                         ## symbol stub for: _CFStringCreateArrayBySeparatingStrings
0000000000017d22	movq	%rax, %rbx
0000000000017d25	testq	%rax, %rax
0000000000017d28	je	0x17d81
0000000000017d2a	movq	%rbx, %rdi
0000000000017d2d	callq	0xddef2                         ## symbol stub for: _CFArrayGetCount
0000000000017d32	testq	%rax, %rax
0000000000017d35	jle	0x17d79
0000000000017d37	movq	%rax, %r14
0000000000017d3a	xorl	%r15d, %r15d
0000000000017d3d	leaq	-0x30(%rbp), %r12
0000000000017d41	leaq	__ZZN7PCBlendL21getMaskModeNameVectorEvE18maskModeNameVector(%rip), %r13 ## PCBlend::getMaskModeNameVector()::maskModeNameVector
0000000000017d48	movq	%rbx, %rdi
0000000000017d4b	movq	%r15, %rsi
0000000000017d4e	callq	0xddefe                         ## symbol stub for: _CFArrayGetValueAtIndex
0000000000017d53	movq	%r12, %rdi
0000000000017d56	movq	%rax, %rsi
0000000000017d59	callq	__ZN8PCStringC1EPK10__CFString  ## PCString::PCString(__CFString const*)
0000000000017d5e	movq	%r13, %rdi
0000000000017d61	movq	%r12, %rsi
0000000000017d64	callq	__ZNSt3__16vectorI8PCStringNS_9allocatorIS1_EEE9push_backB9nqe210106EOS1_ ## std::__1::vector<PCString, std::__1::allocator<PCString>>::push_back[abi:nqe210106](PCString&&)
0000000000017d69	movq	%r12, %rdi
0000000000017d6c	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000017d71	incq	%r15
0000000000017d74	cmpq	%r15, %r14
0000000000017d77	jne	0x17d48
0000000000017d79	movq	%rbx, %rdi
0000000000017d7c	callq	0xde012                         ## symbol stub for: _CFRelease
0000000000017d81	addq	$0x8, %rsp
0000000000017d85	popq	%rbx
0000000000017d86	popq	%r12
0000000000017d88	popq	%r13
0000000000017d8a	popq	%r14
0000000000017d8c	popq	%r15
0000000000017d8e	popq	%rbp
0000000000017d8f	retq
0000000000017d90	leaq	__ZZN7PCBlendL21getMaskModeNameVectorEvE18maskModeNameVector(%rip), %rdi ## PCBlend::getMaskModeNameVector()::maskModeNameVector
0000000000017d97	movq	%rbx, %rsi
0000000000017d9a	addq	$0x8, %rsp
0000000000017d9e	popq	%rbx
0000000000017d9f	popq	%r12
0000000000017da1	popq	%r13
0000000000017da3	popq	%r14
0000000000017da5	popq	%r15
0000000000017da7	popq	%rbp
0000000000017da8	jmp	__ZNSt3__16vectorI8PCStringNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<PCString, std::__1::allocator<PCString>>::push_back[abi:nqe210106](PCString const&)
0000000000017dad	movq	%rax, %rbx
0000000000017db0	leaq	-0x30(%rbp), %rdi
0000000000017db4	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000017db9	movq	%rbx, %rdi
0000000000017dbc	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
