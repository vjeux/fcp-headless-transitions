__ZNK21HGColorConformLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
00000000001d2570	pushq	%rbp
00000000001d2571	movq	%rsp, %rbp
00000000001d2574	pushq	%r15
00000000001d2576	pushq	%r14
00000000001d2578	pushq	%r12
00000000001d257a	pushq	%rbx
00000000001d257b	testq	%rsi, %rsi
00000000001d257e	je	0x1d2630
00000000001d2584	movq	%rdi, %rbx
00000000001d2587	movq	0x82fd52(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
00000000001d258e	leaq	__ZTI21HGColorConformLUTInfo(%rip), %rdx ## typeinfo for HGColorConformLUTInfo
00000000001d2595	xorl	%r14d, %r14d
00000000001d2598	movq	%rsi, %rdi
00000000001d259b	movq	%rax, %rsi
00000000001d259e	xorl	%ecx, %ecx
00000000001d25a0	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000001d25a5	testq	%rax, %rax
00000000001d25a8	je	0x1d2633
00000000001d25ae	cmpb	$0x0, 0x30(%rbx)
00000000001d25b2	jne	0x1d2630
00000000001d25b4	cmpb	$0x0, 0x30(%rax)
00000000001d25b8	jne	0x1d2630
00000000001d25ba	movq	%rbx, %rdi
00000000001d25bd	movq	%rax, %r15
00000000001d25c0	callq	__ZNK16HGApplyNDLUTInfo10getNumDimsEv ## HGApplyNDLUTInfo::getNumDims() const
00000000001d25c5	movq	%rax, %r12
00000000001d25c8	movq	%r15, %r14
00000000001d25cb	movq	%r15, %rdi
00000000001d25ce	callq	__ZNK16HGApplyNDLUTInfo10getNumDimsEv ## HGApplyNDLUTInfo::getNumDims() const
00000000001d25d3	cmpq	%rax, %r12
00000000001d25d6	jne	0x1d2630
00000000001d25d8	movq	%rbx, %rdi
00000000001d25db	callq	__ZNK16HGApplyNDLUTInfo10getNumBinsEv ## HGApplyNDLUTInfo::getNumBins() const
00000000001d25e0	movq	%rax, %r15
00000000001d25e3	movq	%r14, %rdi
00000000001d25e6	callq	__ZNK16HGApplyNDLUTInfo10getNumBinsEv ## HGApplyNDLUTInfo::getNumBins() const
00000000001d25eb	cmpq	%rax, %r15
00000000001d25ee	jne	0x1d2630
00000000001d25f0	movq	%rbx, %rdi
00000000001d25f3	callq	__ZNK16HGApplyNDLUTInfo19getLUTStorageFormatEv ## HGApplyNDLUTInfo::getLUTStorageFormat() const
00000000001d25f8	movl	%eax, %r15d
00000000001d25fb	movq	%r14, %rdi
00000000001d25fe	callq	__ZNK16HGApplyNDLUTInfo19getLUTStorageFormatEv ## HGApplyNDLUTInfo::getLUTStorageFormat() const
00000000001d2603	cmpl	%eax, %r15d
00000000001d2606	jne	0x1d2630
00000000001d2608	movq	0x38(%rbx), %rdi
00000000001d260c	movq	0x40(%rbx), %rdx
00000000001d2610	subq	%rdi, %rdx
00000000001d2613	movq	0x38(%r14), %rsi
00000000001d2617	movq	0x40(%r14), %rax
00000000001d261b	subq	%rsi, %rax
00000000001d261e	cmpq	%rax, %rdx
00000000001d2621	jne	0x1d2630
00000000001d2623	callq	0x3c5432                        ## symbol stub for: _memcmp
00000000001d2628	testl	%eax, %eax
00000000001d262a	sete	%r14b
00000000001d262e	jmp	0x1d2633
00000000001d2630	xorl	%r14d, %r14d
00000000001d2633	movl	%r14d, %eax
00000000001d2636	popq	%rbx
00000000001d2637	popq	%r12
00000000001d2639	popq	%r14
00000000001d263b	popq	%r15
00000000001d263d	popq	%rbp
00000000001d263e	retq
00000000001d263f	nop
