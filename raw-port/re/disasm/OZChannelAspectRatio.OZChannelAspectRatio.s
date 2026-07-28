__ZN20OZChannelAspectRatioC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo:
000000000030c150	pushq	%rbp
000000000030c151	movq	%rsp, %rbp
000000000030c154	pushq	%r15
000000000030c156	pushq	%r14
000000000030c158	pushq	%r13
000000000030c15a	pushq	%r12
000000000030c15c	pushq	%rbx
000000000030c15d	subq	$0x38, %rsp
000000000030c161	movq	%r9, %r15
000000000030c164	movl	%r8d, -0x44(%rbp)
000000000030c168	movl	%ecx, %r12d
000000000030c16b	movq	%rdx, %r13
000000000030c16e	movq	%rsi, %r14
000000000030c171	movq	%rdi, %rbx
000000000030c174	callq	0x6dd308                        ## symbol stub for: __Z35getOZChannelAspectRatio_FactoryBasev
000000000030c179	movq	0x10(%rbp), %rcx
000000000030c17d	movq	%rcx, 0x8(%rsp)
000000000030c182	movq	%r15, -0x50(%rbp)
000000000030c186	movq	%r15, (%rsp)
000000000030c18a	movq	%rbx, %rdi
000000000030c18d	movq	%rax, %rsi
000000000030c190	movq	%r14, %rdx
000000000030c193	movq	%r13, %rcx
000000000030c196	movl	%r12d, %r8d
000000000030c199	movl	-0x44(%rbp), %r9d
000000000030c19d	callq	0x6df474                        ## symbol stub for: __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
000000000030c1a2	movq	0x51673f(%rip), %rax            ## literal pool symbol address: __ZTV20OZChannelAspectRatio
000000000030c1a9	leaq	0x10(%rax), %rcx
000000000030c1ad	movq	%rcx, (%rbx)
000000000030c1b0	addq	$0x370, %rax                    ## imm = 0x370
000000000030c1b6	movq	%rax, 0x10(%rbx)
000000000030c1ba	movq	__ZZN20OZChannelAspectRatio30createOZChannelAspectRatioInfoEvE30_OZChannelAspectRatioInfo_once(%rip), %rax ## OZChannelAspectRatio::createOZChannelAspectRatioInfo()::_OZChannelAspectRatioInfo_once
000000000030c1c1	cmpq	$-0x1, %rax
000000000030c1c5	je	0x30c1ee
000000000030c1c7	leaq	-0x29(%rbp), %rax
000000000030c1cb	movq	%rax, -0x40(%rbp)
000000000030c1cf	leaq	-0x40(%rbp), %rax
000000000030c1d3	movq	%rax, -0x38(%rbp)
000000000030c1d7	leaq	__ZZN20OZChannelAspectRatio30createOZChannelAspectRatioInfoEvE30_OZChannelAspectRatioInfo_once(%rip), %rdi ## OZChannelAspectRatio::createOZChannelAspectRatioInfo()::_OZChannelAspectRatioInfo_once
000000000030c1de	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN20OZChannelAspectRatio30createOZChannelAspectRatioInfoEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAspectRatio::createOZChannelAspectRatioInfo()::'lambda'()&&>>(void*)
000000000030c1e5	leaq	-0x38(%rbp), %rsi
000000000030c1e9	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000030c1ee	cmpq	$0x0, 0x10(%rbp)
000000000030c1f3	je	0x30c212
000000000030c1f5	movq	0x88(%rbx), %rax
000000000030c1fc	movq	%rax, 0x80(%rbx)
000000000030c203	movq	__ZZN20OZChannelAspectRatio30createOZChannelAspectRatioImplEvE30_OZChannelAspectRatioImpl_once(%rip), %rax ## OZChannelAspectRatio::createOZChannelAspectRatioImpl()::_OZChannelAspectRatioImpl_once
000000000030c20a	cmpq	$-0x1, %rax
000000000030c20e	jne	0x30c237
000000000030c210	jmp	0x30c25e
000000000030c212	movq	0x515d67(%rip), %rax            ## literal pool symbol address: __ZN20OZChannelAspectRatio25_OZChannelAspectRatioInfoE
000000000030c219	movq	(%rax), %rax
000000000030c21c	movq	%rax, 0x88(%rbx)
000000000030c223	movq	%rax, 0x80(%rbx)
000000000030c22a	movq	__ZZN20OZChannelAspectRatio30createOZChannelAspectRatioImplEvE30_OZChannelAspectRatioImpl_once(%rip), %rax ## OZChannelAspectRatio::createOZChannelAspectRatioImpl()::_OZChannelAspectRatioImpl_once
000000000030c231	cmpq	$-0x1, %rax
000000000030c235	je	0x30c25e
000000000030c237	leaq	-0x29(%rbp), %rax
000000000030c23b	movq	%rax, -0x40(%rbp)
000000000030c23f	leaq	-0x40(%rbp), %rax
000000000030c243	movq	%rax, -0x38(%rbp)
000000000030c247	leaq	__ZZN20OZChannelAspectRatio30createOZChannelAspectRatioImplEvE30_OZChannelAspectRatioImpl_once(%rip), %rdi ## OZChannelAspectRatio::createOZChannelAspectRatioImpl()::_OZChannelAspectRatioImpl_once
000000000030c24e	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN20OZChannelAspectRatio30createOZChannelAspectRatioImplEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<OZChannelAspectRatio::createOZChannelAspectRatioImpl()::'lambda'()&&>>(void*)
000000000030c255	leaq	-0x38(%rbp), %rsi
000000000030c259	callq	0x6dfb2e                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
000000000030c25e	cmpq	$0x0, -0x50(%rbp)
000000000030c263	je	0x30c26b
000000000030c265	movq	0x78(%rbx), %rax
000000000030c269	jmp	0x30c279
000000000030c26b	movq	0x515d06(%rip), %rax            ## literal pool symbol address: __ZN20OZChannelAspectRatio25_OZChannelAspectRatioImplE
000000000030c272	movq	(%rax), %rax
000000000030c275	movq	%rax, 0x78(%rbx)
000000000030c279	movq	%rax, 0x70(%rbx)
000000000030c27d	addq	$0x38, %rsp
000000000030c281	popq	%rbx
000000000030c282	popq	%r12
000000000030c284	popq	%r13
000000000030c286	popq	%r14
000000000030c288	popq	%r15
000000000030c28a	popq	%rbp
000000000030c28b	retq
000000000030c28c	movq	%rax, %r14
000000000030c28f	movq	%rbx, %rdi
000000000030c292	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
000000000030c297	movq	%r14, %rdi
000000000030c29a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000030c29f	nop
