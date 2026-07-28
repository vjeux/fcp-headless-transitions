__ZNK21HGColorConformLUTInfo9duplicateEv:
00000000001d23e0	pushq	%rbp
00000000001d23e1	movq	%rsp, %rbp
00000000001d23e4	pushq	%r15
00000000001d23e6	pushq	%r14
00000000001d23e8	pushq	%r13
00000000001d23ea	pushq	%r12
00000000001d23ec	pushq	%rbx
00000000001d23ed	subq	$0x48, %rsp
00000000001d23f1	movq	%rdi, %r14
00000000001d23f4	movl	$0x50, %edi
00000000001d23f9	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001d23fe	movq	%rax, %r15
00000000001d2401	movq	0x28(%r14), %rdi
00000000001d2405	movq	%rdi, -0x38(%rbp)
00000000001d2409	testq	%rdi, %rdi
00000000001d240c	je	0x1d2414
00000000001d240e	movq	(%rdi), %rax
00000000001d2411	callq	*0x10(%rax)
00000000001d2414	movq	%r14, %rdi
00000000001d2417	callq	__ZNK16HGApplyNDLUTInfo10getNumBinsEv ## HGApplyNDLUTInfo::getNumBins() const
00000000001d241c	movq	%rax, -0x68(%rbp)
00000000001d2420	movq	%r14, %rdi
00000000001d2423	callq	__ZNK16HGApplyNDLUTInfo10getNumDimsEv ## HGApplyNDLUTInfo::getNumDims() const
00000000001d2428	movq	%rax, %r12
00000000001d242b	xorps	%xmm0, %xmm0
00000000001d242e	movaps	%xmm0, -0x60(%rbp)
00000000001d2432	movq	$0x0, -0x50(%rbp)
00000000001d243a	movq	0x38(%r14), %r13
00000000001d243e	movq	0x40(%r14), %rbx
00000000001d2442	subq	%r13, %rbx
00000000001d2445	je	0x1d247d
00000000001d2447	movq	%r15, -0x30(%rbp)
00000000001d244b	js	0x1d24f6
00000000001d2451	movq	%rbx, %rdi
00000000001d2454	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001d2459	movq	%rax, -0x60(%rbp)
00000000001d245d	movq	%rax, %r15
00000000001d2460	addq	%rbx, %r15
00000000001d2463	movq	%r15, -0x50(%rbp)
00000000001d2467	movq	%rax, %rdi
00000000001d246a	movq	%r13, %rsi
00000000001d246d	movq	%rbx, %rdx
00000000001d2470	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000001d2475	movq	%r15, -0x58(%rbp)
00000000001d2479	movq	-0x30(%rbp), %r15
00000000001d247d	movq	%r14, %rdi
00000000001d2480	callq	__ZNK16HGApplyNDLUTInfo13getRangeScaleEv ## HGApplyNDLUTInfo::getRangeScale() const
00000000001d2485	movss	%xmm0, -0x40(%rbp)
00000000001d248a	movq	%r14, %rdi
00000000001d248d	callq	__ZNK21HGComicImplementation24GetEdgeThresholdCoeffAdjEv ## HGComicImplementation::GetEdgeThresholdCoeffAdj() const
00000000001d2492	movss	%xmm0, -0x3c(%rbp)
00000000001d2497	movq	%r14, %rdi
00000000001d249a	callq	__ZNK16HGApplyNDLUTInfo19getLUTStorageFormatEv ## HGApplyNDLUTInfo::getLUTStorageFormat() const
00000000001d249f	leaq	-0x38(%rbp), %rsi
00000000001d24a3	leaq	-0x60(%rbp), %r8
00000000001d24a7	movq	%r15, %rdi
00000000001d24aa	movq	-0x68(%rbp), %rdx
00000000001d24ae	movq	%r12, %rcx
00000000001d24b1	movss	-0x40(%rbp), %xmm0
00000000001d24b6	movss	-0x3c(%rbp), %xmm1
00000000001d24bb	movl	%eax, %r9d
00000000001d24be	callq	__ZN21HGColorConformLUTInfoC2E5HGRefI21HGColorConformLUTDataEmmNSt3__16vectorIhNS3_9allocatorIhEEEEffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGColorConformLUTInfo::HGColorConformLUTInfo(HGRef<HGColorConformLUTData>, unsigned long, unsigned long, std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000001d24c3	movq	-0x60(%rbp), %rdi
00000000001d24c7	testq	%rdi, %rdi
00000000001d24ca	je	0x1d24d5
00000000001d24cc	movq	%rdi, -0x58(%rbp)
00000000001d24d0	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d24d5	movq	-0x38(%rbp), %rdi
00000000001d24d9	testq	%rdi, %rdi
00000000001d24dc	je	0x1d24e4
00000000001d24de	movq	(%rdi), %rax
00000000001d24e1	callq	*0x18(%rax)
00000000001d24e4	movq	%r15, %rax
00000000001d24e7	addq	$0x48, %rsp
00000000001d24eb	popq	%rbx
00000000001d24ec	popq	%r12
00000000001d24ee	popq	%r13
00000000001d24f0	popq	%r14
00000000001d24f2	popq	%r15
00000000001d24f4	popq	%rbp
00000000001d24f5	retq
00000000001d24f6	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::__throw_length_error[abi:nqe210106]()
00000000001d24fb	ud2
00000000001d24fd	movq	%rax, %rdi
00000000001d2500	callq	___clang_call_terminate
00000000001d2505	movq	%r15, -0x30(%rbp)
00000000001d2509	movq	%rax, %r14
00000000001d250c	movq	-0x30(%rbp), %rdi
00000000001d2510	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d2515	movq	%r14, %rdi
00000000001d2518	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d251d	movq	%rax, %r14
00000000001d2520	jmp	0x1d2544
00000000001d2522	movq	%r15, -0x30(%rbp)
00000000001d2526	movq	%rax, %r14
00000000001d2529	jmp	0x1d2544
00000000001d252b	movq	%r15, -0x30(%rbp)
00000000001d252f	movq	%rax, %r14
00000000001d2532	movq	-0x60(%rbp), %rdi
00000000001d2536	testq	%rdi, %rdi
00000000001d2539	je	0x1d2544
00000000001d253b	movq	%rdi, -0x58(%rbp)
00000000001d253f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d2544	movq	-0x38(%rbp), %rdi
00000000001d2548	testq	%rdi, %rdi
00000000001d254b	je	0x1d2553
00000000001d254d	movq	(%rdi), %rax
00000000001d2550	callq	*0x18(%rax)
00000000001d2553	movq	-0x30(%rbp), %rdi
00000000001d2557	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d255c	movq	%r14, %rdi
00000000001d255f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d2564	movq	%rax, %rdi
00000000001d2567	callq	___clang_call_terminate
00000000001d256c	nopl	(%rax)
