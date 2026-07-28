__ZN27OZChannelAspectRatioFootageC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo:
00000000000bfc90	pushq	%rbp
00000000000bfc91	movq	%rsp, %rbp
00000000000bfc94	pushq	%r15
00000000000bfc96	pushq	%r14
00000000000bfc98	pushq	%r13
00000000000bfc9a	pushq	%r12
00000000000bfc9c	pushq	%rbx
00000000000bfc9d	subq	$0x48, %rsp
00000000000bfca1	movq	%r9, %r15
00000000000bfca4	movl	%r8d, -0x48(%rbp)
00000000000bfca8	movl	%ecx, -0x44(%rbp)
00000000000bfcab	movq	%rdx, %r13
00000000000bfcae	movq	%rsi, %r14
00000000000bfcb1	movsd	%xmm0, -0x50(%rbp)
00000000000bfcb6	movq	%rdi, %rbx
00000000000bfcb9	movq	0x10(%rbp), %r12
00000000000bfcbd	callq	0x6dd332                        ## symbol stub for: __Z42getOZChannelAspectRatioFootage_FactoryBasev
00000000000bfcc2	movq	%r12, 0x8(%rsp)
00000000000bfcc7	movq	%r15, -0x58(%rbp)
00000000000bfccb	movq	%r15, (%rsp)
00000000000bfccf	movq	%rbx, %rdi
00000000000bfcd2	movq	%rax, %rsi
00000000000bfcd5	movq	%r14, %rdx
00000000000bfcd8	movq	%r13, %rcx
00000000000bfcdb	movl	-0x44(%rbp), %r8d
00000000000bfcdf	movl	-0x48(%rbp), %r9d
00000000000bfce3	callq	0x6df474                        ## symbol stub for: __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
00000000000bfce8	movq	0x762c19(%rip), %rax            ## literal pool symbol address: __ZTV27OZChannelAspectRatioFootage
00000000000bfcef	leaq	0x10(%rax), %rcx
00000000000bfcf3	movq	%rcx, (%rbx)
00000000000bfcf6	addq	$0x370, %rax                    ## imm = 0x370
00000000000bfcfc	movq	%rax, 0x10(%rbx)
00000000000bfd00	movq	__ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageInfoEvE37_OZChannelAspectRatioFootageInfo_once(%rip), %rax ## OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageInfo()::_OZChannelAspectRatioFootageInfo_once
00000000000bfd07	cmpq	$-0x1, %rax
00000000000bfd0b	je	0xbfd34
00000000000bfd0d	leaq	-0x29(%rbp), %rax
00000000000bfd11	movq	%rax, -0x40(%rbp)
00000000000bfd15	leaq	-0x40(%rbp), %rax
00000000000bfd19	movq	%rax, -0x38(%rbp)
00000000000bfd1d	leaq	__ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageInfoEvE37_OZChannelAspectRatioFootageInfo_once(%rip), %rdi ## OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageInfo()::_OZChannelAspectRatioFootageInfo_once
00000000000bfd24	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageInfo()::'lambda'()&&>>(void*)
00000000000bfd2b	leaq	-0x38(%rbp), %rsi
00000000000bfd2f	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000bfd34	cmpq	$0x0, 0x10(%rbp)
00000000000bfd39	je	0xbfd58
00000000000bfd3b	movq	0x88(%rbx), %rax
00000000000bfd42	movq	%rax, 0x80(%rbx)
00000000000bfd49	movq	__ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageImplEvE37_OZChannelAspectRatioFootageImpl_once(%rip), %rax ## OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageImpl()::_OZChannelAspectRatioFootageImpl_once
00000000000bfd50	cmpq	$-0x1, %rax
00000000000bfd54	jne	0xbfd7d
00000000000bfd56	jmp	0xbfda4
00000000000bfd58	movq	0x762409(%rip), %rax            ## literal pool symbol address: __ZN27OZChannelAspectRatioFootage32_OZChannelAspectRatioFootageInfoE
00000000000bfd5f	movq	(%rax), %rax
00000000000bfd62	movq	%rax, 0x88(%rbx)
00000000000bfd69	movq	%rax, 0x80(%rbx)
00000000000bfd70	movq	__ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageImplEvE37_OZChannelAspectRatioFootageImpl_once(%rip), %rax ## OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageImpl()::_OZChannelAspectRatioFootageImpl_once
00000000000bfd77	cmpq	$-0x1, %rax
00000000000bfd7b	je	0xbfda4
00000000000bfd7d	leaq	-0x29(%rbp), %rax
00000000000bfd81	movq	%rax, -0x40(%rbp)
00000000000bfd85	leaq	-0x40(%rbp), %rax
00000000000bfd89	movq	%rax, -0x38(%rbp)
00000000000bfd8d	leaq	__ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageImplEvE37_OZChannelAspectRatioFootageImpl_once(%rip), %rdi ## OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageImpl()::_OZChannelAspectRatioFootageImpl_once
00000000000bfd94	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageImpl()::'lambda'()&&>>(void*)
00000000000bfd9b	leaq	-0x38(%rbp), %rsi
00000000000bfd9f	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000000bfda4	cmpq	$0x0, -0x58(%rbp)
00000000000bfda9	je	0xbfdb1
00000000000bfdab	movq	0x78(%rbx), %rax
00000000000bfdaf	jmp	0xbfdbf
00000000000bfdb1	movq	0x7623a8(%rip), %rax            ## literal pool symbol address: __ZN27OZChannelAspectRatioFootage32_OZChannelAspectRatioFootageImplE
00000000000bfdb8	movq	(%rax), %rax
00000000000bfdbb	movq	%rax, 0x78(%rbx)
00000000000bfdbf	movq	%rax, 0x70(%rbx)
00000000000bfdc3	movq	%rbx, %rdi
00000000000bfdc6	movsd	-0x50(%rbp), %xmm0
00000000000bfdcb	callq	0x6df306                        ## symbol stub for: __ZN9OZChannel15setDefaultValueEd
00000000000bfdd0	movq	%rbx, %rdi
00000000000bfdd3	movsd	-0x50(%rbp), %xmm0
00000000000bfdd8	xorl	%esi, %esi
00000000000bfdda	callq	0x6df30c                        ## symbol stub for: __ZN9OZChannel15setInitialValueEdb
00000000000bfddf	addq	$0x48, %rsp
00000000000bfde3	popq	%rbx
00000000000bfde4	popq	%r12
00000000000bfde6	popq	%r13
00000000000bfde8	popq	%r14
00000000000bfdea	popq	%r15
00000000000bfdec	popq	%rbp
00000000000bfded	retq
00000000000bfdee	movq	%rax, %r14
00000000000bfdf1	movq	%rbx, %rdi
00000000000bfdf4	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000000bfdf9	movq	%r14, %rdi
00000000000bfdfc	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000bfe01	nopw	%cs:(%rax,%rax)
