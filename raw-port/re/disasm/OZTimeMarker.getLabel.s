__ZNK12OZTimeMarker8getLabelEv:
0000000000210b20	pushq	%rbp
0000000000210b21	movq	%rsp, %rbp
0000000000210b24	pushq	%r14
0000000000210b26	pushq	%rbx
0000000000210b27	subq	$0x10, %rsp
0000000000210b2b	movl	0x4c(%rdi), %eax
0000000000210b2e	addl	$-0x3, %eax
0000000000210b31	cmpl	$0x6, %eax
0000000000210b34	ja	0x210cca
0000000000210b3a	leaq	0x58f(%rip), %rcx
0000000000210b41	movslq	(%rcx,%rax,4), %rax
0000000000210b45	addq	%rcx, %rax
0000000000210b48	jmpq	*%rax
0000000000210b4a	movzbl	__ZGVZNK12OZTimeMarker8getLabelEvE22sBuildInMandatoryLabel(%rip), %eax ## guard variable for OZTimeMarker::getLabel() const::sBuildInMandatoryLabel
0000000000210b51	testb	%al, %al
0000000000210b53	je	0x210ee0
0000000000210b59	leaq	__ZZNK12OZTimeMarker8getLabelEvE22sBuildInMandatoryLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sBuildInMandatoryLabel
0000000000210b60	movq	%rbx, %rdi
0000000000210b63	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
0000000000210b68	testb	%al, %al
0000000000210b6a	je	0x210df3
0000000000210b70	leaq	_theApp(%rip), %rax
0000000000210b77	movq	(%rax), %rax
0000000000210b7a	movq	0x48(%rax), %rdx
0000000000210b7e	leaq	0x686a8b(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000210b85	leaq	-0x18(%rbp), %r14
0000000000210b89	movq	%r14, %rdi
0000000000210b8c	xorl	%ecx, %ecx
0000000000210b8e	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000210b93	leaq	__ZZNK12OZTimeMarker8getLabelEvE22sBuildInMandatoryLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sBuildInMandatoryLabel
0000000000210b9a	movq	%rbx, %rdi
0000000000210b9d	movq	%r14, %rsi
0000000000210ba0	callq	0x6df048                        ## symbol stub for: __ZN8PCString3setERKS_
0000000000210ba5	jmp	0x210dea
0000000000210baa	movzbl	__ZGVZNK12OZTimeMarker8getLabelEvE13sLoopEndLabel(%rip), %eax ## guard variable for OZTimeMarker::getLabel() const::sLoopEndLabel
0000000000210bb1	testb	%al, %al
0000000000210bb3	je	0x210dff
0000000000210bb9	leaq	__ZZNK12OZTimeMarker8getLabelEvE13sLoopEndLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sLoopEndLabel
0000000000210bc0	movq	%rbx, %rdi
0000000000210bc3	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
0000000000210bc8	testb	%al, %al
0000000000210bca	je	0x210df3
0000000000210bd0	leaq	_theApp(%rip), %rax
0000000000210bd7	movq	(%rax), %rax
0000000000210bda	movq	0x48(%rax), %rdx
0000000000210bde	leaq	0x686aab(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000210be5	leaq	-0x18(%rbp), %r14
0000000000210be9	movq	%r14, %rdi
0000000000210bec	xorl	%ecx, %ecx
0000000000210bee	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000210bf3	leaq	__ZZNK12OZTimeMarker8getLabelEvE13sLoopEndLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sLoopEndLabel
0000000000210bfa	movq	%rbx, %rdi
0000000000210bfd	movq	%r14, %rsi
0000000000210c00	callq	0x6df048                        ## symbol stub for: __ZN8PCString3setERKS_
0000000000210c05	jmp	0x210dea
0000000000210c0a	movzbl	__ZGVZNK12OZTimeMarker8getLabelEvE23sBuildOutMandatoryLabel(%rip), %eax ## guard variable for OZTimeMarker::getLabel() const::sBuildOutMandatoryLabel
0000000000210c11	testb	%al, %al
0000000000210c13	je	0x210e4a
0000000000210c19	leaq	__ZZNK12OZTimeMarker8getLabelEvE23sBuildOutMandatoryLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sBuildOutMandatoryLabel
0000000000210c20	movq	%rbx, %rdi
0000000000210c23	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
0000000000210c28	testb	%al, %al
0000000000210c2a	je	0x210df3
0000000000210c30	leaq	_theApp(%rip), %rax
0000000000210c37	movq	(%rax), %rax
0000000000210c3a	movq	0x48(%rax), %rdx
0000000000210c3e	leaq	0x686a0b(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000210c45	leaq	-0x18(%rbp), %r14
0000000000210c49	movq	%r14, %rdi
0000000000210c4c	xorl	%ecx, %ecx
0000000000210c4e	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000210c53	leaq	__ZZNK12OZTimeMarker8getLabelEvE23sBuildOutMandatoryLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sBuildOutMandatoryLabel
0000000000210c5a	movq	%rbx, %rdi
0000000000210c5d	movq	%r14, %rsi
0000000000210c60	callq	0x6df048                        ## symbol stub for: __ZN8PCString3setERKS_
0000000000210c65	jmp	0x210dea
0000000000210c6a	movzbl	__ZGVZNK12OZTimeMarker8getLabelEvE22sBuildOutOptionalLabel(%rip), %eax ## guard variable for OZTimeMarker::getLabel() const::sBuildOutOptionalLabel
0000000000210c71	testb	%al, %al
0000000000210c73	je	0x210e95
0000000000210c79	leaq	__ZZNK12OZTimeMarker8getLabelEvE22sBuildOutOptionalLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sBuildOutOptionalLabel
0000000000210c80	movq	%rbx, %rdi
0000000000210c83	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
0000000000210c88	testb	%al, %al
0000000000210c8a	je	0x210df3
0000000000210c90	leaq	_theApp(%rip), %rax
0000000000210c97	movq	(%rax), %rax
0000000000210c9a	movq	0x48(%rax), %rdx
0000000000210c9e	leaq	0x6869cb(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000210ca5	leaq	-0x18(%rbp), %r14
0000000000210ca9	movq	%r14, %rdi
0000000000210cac	xorl	%ecx, %ecx
0000000000210cae	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000210cb3	leaq	__ZZNK12OZTimeMarker8getLabelEvE22sBuildOutOptionalLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sBuildOutOptionalLabel
0000000000210cba	movq	%rbx, %rdi
0000000000210cbd	movq	%r14, %rsi
0000000000210cc0	callq	0x6df048                        ## symbol stub for: __ZN8PCString3setERKS_
0000000000210cc5	jmp	0x210dea
0000000000210cca	movq	%rdi, %rbx
0000000000210ccd	addq	$0x38, %rbx
0000000000210cd1	jmp	0x210df3
0000000000210cd6	movzbl	__ZGVZNK12OZTimeMarker8getLabelEvE21sBuildInOptionalLabel(%rip), %eax ## guard variable for OZTimeMarker::getLabel() const::sBuildInOptionalLabel
0000000000210cdd	testb	%al, %al
0000000000210cdf	je	0x210f2b
0000000000210ce5	leaq	__ZZNK12OZTimeMarker8getLabelEvE21sBuildInOptionalLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sBuildInOptionalLabel
0000000000210cec	movq	%rbx, %rdi
0000000000210cef	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
0000000000210cf4	testb	%al, %al
0000000000210cf6	je	0x210df3
0000000000210cfc	leaq	_theApp(%rip), %rax
0000000000210d03	movq	(%rax), %rax
0000000000210d06	movq	0x48(%rax), %rdx
0000000000210d0a	leaq	0x68691f(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000210d11	leaq	-0x18(%rbp), %r14
0000000000210d15	movq	%r14, %rdi
0000000000210d18	xorl	%ecx, %ecx
0000000000210d1a	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000210d1f	leaq	__ZZNK12OZTimeMarker8getLabelEvE21sBuildInOptionalLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sBuildInOptionalLabel
0000000000210d26	movq	%rbx, %rdi
0000000000210d29	movq	%r14, %rsi
0000000000210d2c	callq	0x6df048                        ## symbol stub for: __ZN8PCString3setERKS_
0000000000210d31	jmp	0x210dea
0000000000210d36	movzbl	__ZGVZNK12OZTimeMarker8getLabelEvE17sPosterFrameLabel(%rip), %eax ## guard variable for OZTimeMarker::getLabel() const::sPosterFrameLabel
0000000000210d3d	testb	%al, %al
0000000000210d3f	je	0x210f76
0000000000210d45	leaq	__ZZNK12OZTimeMarker8getLabelEvE17sPosterFrameLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sPosterFrameLabel
0000000000210d4c	movq	%rbx, %rdi
0000000000210d4f	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
0000000000210d54	testb	%al, %al
0000000000210d56	je	0x210df3
0000000000210d5c	leaq	_theApp(%rip), %rax
0000000000210d63	movq	(%rax), %rax
0000000000210d66	movq	0x48(%rax), %rdx
0000000000210d6a	leaq	0x68693f(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000210d71	leaq	-0x18(%rbp), %r14
0000000000210d75	movq	%r14, %rdi
0000000000210d78	xorl	%ecx, %ecx
0000000000210d7a	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000210d7f	leaq	__ZZNK12OZTimeMarker8getLabelEvE17sPosterFrameLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sPosterFrameLabel
0000000000210d86	movq	%rbx, %rdi
0000000000210d89	movq	%r14, %rsi
0000000000210d8c	callq	0x6df048                        ## symbol stub for: __ZN8PCString3setERKS_
0000000000210d91	jmp	0x210dea
0000000000210d93	movzbl	__ZGVZNK12OZTimeMarker8getLabelEvE14sTextEditLabel(%rip), %eax ## guard variable for OZTimeMarker::getLabel() const::sTextEditLabel
0000000000210d9a	testb	%al, %al
0000000000210d9c	je	0x210fc1
0000000000210da2	leaq	__ZZNK12OZTimeMarker8getLabelEvE14sTextEditLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sTextEditLabel
0000000000210da9	movq	%rbx, %rdi
0000000000210dac	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
0000000000210db1	testb	%al, %al
0000000000210db3	je	0x210df3
0000000000210db5	leaq	_theApp(%rip), %rax
0000000000210dbc	movq	(%rax), %rax
0000000000210dbf	movq	0x48(%rax), %rdx
0000000000210dc3	leaq	0x686906(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000210dca	leaq	-0x18(%rbp), %r14
0000000000210dce	movq	%r14, %rdi
0000000000210dd1	xorl	%ecx, %ecx
0000000000210dd3	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000210dd8	leaq	__ZZNK12OZTimeMarker8getLabelEvE14sTextEditLabel(%rip), %rbx ## OZTimeMarker::getLabel() const::sTextEditLabel
0000000000210ddf	movq	%rbx, %rdi
0000000000210de2	movq	%r14, %rsi
0000000000210de5	callq	0x6df048                        ## symbol stub for: __ZN8PCString3setERKS_
0000000000210dea	leaq	-0x18(%rbp), %rdi
0000000000210dee	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000210df3	movq	%rbx, %rax
0000000000210df6	addq	$0x10, %rsp
0000000000210dfa	popq	%rbx
0000000000210dfb	popq	%r14
0000000000210dfd	popq	%rbp
0000000000210dfe	retq
0000000000210dff	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE13sLoopEndLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sLoopEndLabel
0000000000210e06	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
0000000000210e0b	testl	%eax, %eax
0000000000210e0d	je	0x210bb9
0000000000210e13	leaq	__ZZNK12OZTimeMarker8getLabelEvE13sLoopEndLabel(%rip), %rdi ## OZTimeMarker::getLabel() const::sLoopEndLabel
0000000000210e1a	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
0000000000210e1f	movq	0x612692(%rip), %rdi            ## literal pool symbol address: __ZN8PCStringD1Ev
0000000000210e26	leaq	__ZZNK12OZTimeMarker8getLabelEvE13sLoopEndLabel(%rip), %rsi ## OZTimeMarker::getLabel() const::sLoopEndLabel
0000000000210e2d	leaq	-0x210e34(%rip), %rdx
0000000000210e34	callq	0x6dfcc6                        ## symbol stub for: ___cxa_atexit
0000000000210e39	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE13sLoopEndLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sLoopEndLabel
0000000000210e40	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
0000000000210e45	jmp	0x210bb9
0000000000210e4a	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE23sBuildOutMandatoryLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildOutMandatoryLabel
0000000000210e51	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
0000000000210e56	testl	%eax, %eax
0000000000210e58	je	0x210c19
0000000000210e5e	leaq	__ZZNK12OZTimeMarker8getLabelEvE23sBuildOutMandatoryLabel(%rip), %rdi ## OZTimeMarker::getLabel() const::sBuildOutMandatoryLabel
0000000000210e65	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
0000000000210e6a	movq	0x612647(%rip), %rdi            ## literal pool symbol address: __ZN8PCStringD1Ev
0000000000210e71	leaq	__ZZNK12OZTimeMarker8getLabelEvE23sBuildOutMandatoryLabel(%rip), %rsi ## OZTimeMarker::getLabel() const::sBuildOutMandatoryLabel
0000000000210e78	leaq	-0x210e7f(%rip), %rdx
0000000000210e7f	callq	0x6dfcc6                        ## symbol stub for: ___cxa_atexit
0000000000210e84	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE23sBuildOutMandatoryLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildOutMandatoryLabel
0000000000210e8b	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
0000000000210e90	jmp	0x210c19
0000000000210e95	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE22sBuildOutOptionalLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildOutOptionalLabel
0000000000210e9c	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
0000000000210ea1	testl	%eax, %eax
0000000000210ea3	je	0x210c79
0000000000210ea9	leaq	__ZZNK12OZTimeMarker8getLabelEvE22sBuildOutOptionalLabel(%rip), %rdi ## OZTimeMarker::getLabel() const::sBuildOutOptionalLabel
0000000000210eb0	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
0000000000210eb5	movq	0x6125fc(%rip), %rdi            ## literal pool symbol address: __ZN8PCStringD1Ev
0000000000210ebc	leaq	__ZZNK12OZTimeMarker8getLabelEvE22sBuildOutOptionalLabel(%rip), %rsi ## OZTimeMarker::getLabel() const::sBuildOutOptionalLabel
0000000000210ec3	leaq	-0x210eca(%rip), %rdx
0000000000210eca	callq	0x6dfcc6                        ## symbol stub for: ___cxa_atexit
0000000000210ecf	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE22sBuildOutOptionalLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildOutOptionalLabel
0000000000210ed6	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
0000000000210edb	jmp	0x210c79
0000000000210ee0	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE22sBuildInMandatoryLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildInMandatoryLabel
0000000000210ee7	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
0000000000210eec	testl	%eax, %eax
0000000000210eee	je	0x210b59
0000000000210ef4	leaq	__ZZNK12OZTimeMarker8getLabelEvE22sBuildInMandatoryLabel(%rip), %rdi ## OZTimeMarker::getLabel() const::sBuildInMandatoryLabel
0000000000210efb	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
0000000000210f00	movq	0x6125b1(%rip), %rdi            ## literal pool symbol address: __ZN8PCStringD1Ev
0000000000210f07	leaq	__ZZNK12OZTimeMarker8getLabelEvE22sBuildInMandatoryLabel(%rip), %rsi ## OZTimeMarker::getLabel() const::sBuildInMandatoryLabel
0000000000210f0e	leaq	-0x210f15(%rip), %rdx
0000000000210f15	callq	0x6dfcc6                        ## symbol stub for: ___cxa_atexit
0000000000210f1a	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE22sBuildInMandatoryLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildInMandatoryLabel
0000000000210f21	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
0000000000210f26	jmp	0x210b59
0000000000210f2b	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE21sBuildInOptionalLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildInOptionalLabel
0000000000210f32	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
0000000000210f37	testl	%eax, %eax
0000000000210f39	je	0x210ce5
0000000000210f3f	leaq	__ZZNK12OZTimeMarker8getLabelEvE21sBuildInOptionalLabel(%rip), %rdi ## OZTimeMarker::getLabel() const::sBuildInOptionalLabel
0000000000210f46	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
0000000000210f4b	movq	0x612566(%rip), %rdi            ## literal pool symbol address: __ZN8PCStringD1Ev
0000000000210f52	leaq	__ZZNK12OZTimeMarker8getLabelEvE21sBuildInOptionalLabel(%rip), %rsi ## OZTimeMarker::getLabel() const::sBuildInOptionalLabel
0000000000210f59	leaq	-0x210f60(%rip), %rdx
0000000000210f60	callq	0x6dfcc6                        ## symbol stub for: ___cxa_atexit
0000000000210f65	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE21sBuildInOptionalLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildInOptionalLabel
0000000000210f6c	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
0000000000210f71	jmp	0x210ce5
0000000000210f76	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE17sPosterFrameLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sPosterFrameLabel
0000000000210f7d	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
0000000000210f82	testl	%eax, %eax
0000000000210f84	je	0x210d45
0000000000210f8a	leaq	__ZZNK12OZTimeMarker8getLabelEvE17sPosterFrameLabel(%rip), %rdi ## OZTimeMarker::getLabel() const::sPosterFrameLabel
0000000000210f91	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
0000000000210f96	movq	0x61251b(%rip), %rdi            ## literal pool symbol address: __ZN8PCStringD1Ev
0000000000210f9d	leaq	__ZZNK12OZTimeMarker8getLabelEvE17sPosterFrameLabel(%rip), %rsi ## OZTimeMarker::getLabel() const::sPosterFrameLabel
0000000000210fa4	leaq	-0x210fab(%rip), %rdx
0000000000210fab	callq	0x6dfcc6                        ## symbol stub for: ___cxa_atexit
0000000000210fb0	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE17sPosterFrameLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sPosterFrameLabel
0000000000210fb7	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
0000000000210fbc	jmp	0x210d45
0000000000210fc1	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE14sTextEditLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sTextEditLabel
0000000000210fc8	callq	0x6dfcf6                        ## symbol stub for: ___cxa_guard_acquire
0000000000210fcd	testl	%eax, %eax
0000000000210fcf	je	0x210da2
0000000000210fd5	leaq	__ZZNK12OZTimeMarker8getLabelEvE14sTextEditLabel(%rip), %rdi ## OZTimeMarker::getLabel() const::sTextEditLabel
0000000000210fdc	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
0000000000210fe1	movq	0x6124d0(%rip), %rdi            ## literal pool symbol address: __ZN8PCStringD1Ev
0000000000210fe8	leaq	__ZZNK12OZTimeMarker8getLabelEvE14sTextEditLabel(%rip), %rsi ## OZTimeMarker::getLabel() const::sTextEditLabel
0000000000210fef	leaq	-0x210ff6(%rip), %rdx
0000000000210ff6	callq	0x6dfcc6                        ## symbol stub for: ___cxa_atexit
0000000000210ffb	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE14sTextEditLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sTextEditLabel
0000000000211002	callq	0x6dfcfc                        ## symbol stub for: ___cxa_guard_release
0000000000211007	jmp	0x210da2
000000000021100c	movq	%rax, %rbx
000000000021100f	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE14sTextEditLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sTextEditLabel
0000000000211016	callq	0x6dfcf0                        ## symbol stub for: ___cxa_guard_abort
000000000021101b	movq	%rbx, %rdi
000000000021101e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000211023	movq	%rax, %rbx
0000000000211026	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE17sPosterFrameLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sPosterFrameLabel
000000000021102d	callq	0x6dfcf0                        ## symbol stub for: ___cxa_guard_abort
0000000000211032	movq	%rbx, %rdi
0000000000211035	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000021103a	movq	%rax, %rbx
000000000021103d	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE21sBuildInOptionalLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildInOptionalLabel
0000000000211044	callq	0x6dfcf0                        ## symbol stub for: ___cxa_guard_abort
0000000000211049	movq	%rbx, %rdi
000000000021104c	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000211051	movq	%rax, %rbx
0000000000211054	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE22sBuildInMandatoryLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildInMandatoryLabel
000000000021105b	callq	0x6dfcf0                        ## symbol stub for: ___cxa_guard_abort
0000000000211060	movq	%rbx, %rdi
0000000000211063	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000211068	movq	%rax, %rbx
000000000021106b	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE22sBuildOutOptionalLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildOutOptionalLabel
0000000000211072	callq	0x6dfcf0                        ## symbol stub for: ___cxa_guard_abort
0000000000211077	movq	%rbx, %rdi
000000000021107a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000021107f	movq	%rax, %rbx
0000000000211082	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE23sBuildOutMandatoryLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sBuildOutMandatoryLabel
0000000000211089	callq	0x6dfcf0                        ## symbol stub for: ___cxa_guard_abort
000000000021108e	movq	%rbx, %rdi
0000000000211091	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000211096	movq	%rax, %rbx
0000000000211099	leaq	__ZGVZNK12OZTimeMarker8getLabelEvE13sLoopEndLabel(%rip), %rdi ## guard variable for OZTimeMarker::getLabel() const::sLoopEndLabel
00000000002110a0	callq	0x6dfcf0                        ## symbol stub for: ___cxa_guard_abort
00000000002110a5	movq	%rbx, %rdi
00000000002110a8	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000002110ad	jmp	0x2110b9
00000000002110af	jmp	0x2110b9
00000000002110b1	jmp	0x2110b9
00000000002110b3	jmp	0x2110b9
00000000002110b5	jmp	0x2110b9
00000000002110b7	jmp	0x2110b9
00000000002110b9	movq	%rax, %rbx
00000000002110bc	leaq	-0x18(%rbp), %rdi
00000000002110c0	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000002110c5	movq	%rbx, %rdi
00000000002110c8	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000002110cd	nopl	(%rax)
00000000002110d0	jp	0x2110cc
00000000002110d2	.byte 0xff #bad opcode
00000000002110d3	incl	(%rsi)
00000000002110d5	cld
00000000002110d6	.byte 0xff #bad opcode
00000000002110d7	.byte 0xff #bad opcode
00000000002110d8	cmpb	%bl, %bh
00000000002110da	.byte 0xff #bad opcode
00000000002110db	lcalll	*-0x25000005(%rdx)
00000000002110e1	cli
00000000002110e2	.byte 0xff #bad opcode
00000000002110e3	jmpq	*-0x4(%rsi)
00000000002110e6	.byte 0xff #bad opcode
00000000002110e7	incl	%ebx
00000000002110e9	cld
00000000002110ea	.byte 0xff #bad opcode
00000000002110eb	decl	(%rdi)
00000000002110ed	.byte 0x1f #bad opcode
00000000002110ee	addb	%dl, 0x48(%rbp)
00000000002110f2	movl	%esp, %ebp
00000000002110f4	pushq	%rbx
00000000002110f5	pushq	%rax
00000000002110f6	movq	%rsi, %rbx
00000000002110f9	leaq	__ZL17OZTimeMarkerScope(%rip), %rsi ## OZTimeMarkerScope
0000000000211100	movq	%rbx, %rdi
0000000000211103	callq	0x6de820                        ## symbol stub for: __ZN23PCSerializerWriteStream9pushScopeEP7PCScope
0000000000211108	movq	(%rbx), %rax
000000000021110b	movq	%rbx, %rdi
000000000021110e	movl	$0x49, %esi
0000000000211113	callq	*0x10(%rax)
0000000000211116	movq	%rbx, %rdi
0000000000211119	addq	$0x8, %rsp
000000000021111d	popq	%rbx
000000000021111e	popq	%rbp
000000000021111f	jmp	0x6de81a                        ## symbol stub for: __ZN23PCSerializerWriteStream8popScopeEv
0000000000211124	nopw	%cs:(%rax,%rax)
