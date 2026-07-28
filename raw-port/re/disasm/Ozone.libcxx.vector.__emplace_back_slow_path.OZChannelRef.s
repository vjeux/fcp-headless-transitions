__ZNSt3__16vectorI12OZChannelRefNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJRKS1_EEEPS1_DpOT_:
000000000004b280	pushq	%rbp
000000000004b281	movq	%rsp, %rbp
000000000004b284	pushq	%r15
000000000004b286	pushq	%r14
000000000004b288	pushq	%r13
000000000004b28a	pushq	%r12
000000000004b28c	pushq	%rbx
000000000004b28d	subq	$0x48, %rsp
000000000004b291	movabsq	$0xaaaaaaaaaaaaaaa, %rax        ## imm = 0xAAAAAAAAAAAAAAA
000000000004b29b	movq	(%rdi), %rcx
000000000004b29e	movq	0x8(%rdi), %r14
000000000004b2a2	subq	%rcx, %r14
000000000004b2a5	movq	%r14, %r15
000000000004b2a8	sarq	$0x3, %r15
000000000004b2ac	movabsq	$-0x5555555555555555, %rdx      ## imm = 0xAAAAAAAAAAAAAAAB
000000000004b2b6	imulq	%rdx, %r15
000000000004b2ba	incq	%r15
000000000004b2bd	cmpq	%rax, %r15
000000000004b2c0	ja	0x4b3fc
000000000004b2c6	movq	%rdi, %rbx
000000000004b2c9	movq	0x10(%rdi), %rdi
000000000004b2cd	subq	%rcx, %rdi
000000000004b2d0	sarq	$0x3, %rdi
000000000004b2d4	imulq	%rdx, %rdi
000000000004b2d8	leaq	(%rdi,%rdi), %rcx
000000000004b2dc	cmpq	%r15, %rcx
000000000004b2df	cmovaq	%rcx, %r15
000000000004b2e3	leaq	0x10(%rbx), %rcx
000000000004b2e7	movabsq	$0x555555555555555, %rdx        ## imm = 0x555555555555555
000000000004b2f1	cmpq	%rdx, %rdi
000000000004b2f4	cmovaeq	%rax, %r15
000000000004b2f8	movq	%rcx, -0x48(%rbp)
000000000004b2fc	testq	%r15, %r15
000000000004b2ff	je	0x4b323
000000000004b301	cmpq	%rax, %r15
000000000004b304	ja	0x4b401
000000000004b30a	movq	%rsi, %r12
000000000004b30d	leaq	(,%r15,8), %rax
000000000004b315	leaq	(%rax,%rax,2), %rdi
000000000004b319	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000004b31e	movq	%r12, %rsi
000000000004b321	jmp	0x4b325
000000000004b323	xorl	%eax, %eax
000000000004b325	movq	%rax, -0x68(%rbp)
000000000004b329	addq	%rax, %r14
000000000004b32c	movq	%r14, -0x58(%rbp)
000000000004b330	movq	%r14, -0x60(%rbp)
000000000004b334	leaq	(%r15,%r15,2), %rcx
000000000004b338	leaq	(%rax,%rcx,8), %r13
000000000004b33c	movq	%r13, -0x50(%rbp)
000000000004b340	movq	%r14, %rdi
000000000004b343	callq	0x6dd710                        ## symbol stub for: __ZN12OZChannelRefC1ERKS_
000000000004b348	leaq	0x18(%r14), %rax
000000000004b34c	movq	%rax, -0x30(%rbp)
000000000004b350	movq	%rax, -0x58(%rbp)
000000000004b354	movq	(%rbx), %r12
000000000004b357	movq	0x8(%rbx), %r15
000000000004b35b	movq	%r12, %rax
000000000004b35e	subq	%r15, %rax
000000000004b361	leaq	(%r14,%rax), %rax
000000000004b365	je	0x4b3ce
000000000004b367	movq	%r13, -0x40(%rbp)
000000000004b36b	xorl	%r13d, %r13d
000000000004b36e	movq	%rax, -0x38(%rbp)
000000000004b372	movq	%rax, %r14
000000000004b375	nopw	%cs:(%rax,%rax)
000000000004b380	leaq	(%r12,%r13), %rsi
000000000004b384	movq	%r14, %rdi
000000000004b387	callq	0x6dd710                        ## symbol stub for: __ZN12OZChannelRefC1ERKS_
000000000004b38c	addq	$0x18, %r14
000000000004b390	leaq	(%r12,%r13), %rax
000000000004b394	addq	$0x18, %rax
000000000004b398	addq	$0x18, %r13
000000000004b39c	cmpq	%r15, %rax
000000000004b39f	jne	0x4b380
000000000004b3a1	movq	-0x40(%rbp), %r13
000000000004b3a5	nopw	%cs:(%rax,%rax)
000000000004b3b0	movq	%r12, %rdi
000000000004b3b3	callq	0x6dd71c                        ## symbol stub for: __ZN12OZChannelRefD1Ev
000000000004b3b8	addq	$0x18, %r12
000000000004b3bc	cmpq	%r15, %r12
000000000004b3bf	jne	0x4b3b0
000000000004b3c1	movq	(%rbx), %r12
000000000004b3c4	movq	-0x30(%rbp), %r14
000000000004b3c8	movq	-0x38(%rbp), %rax
000000000004b3cc	jmp	0x4b3d2
000000000004b3ce	movq	-0x30(%rbp), %r14
000000000004b3d2	movq	%rax, (%rbx)
000000000004b3d5	movq	%r14, 0x8(%rbx)
000000000004b3d9	movq	%r13, 0x10(%rbx)
000000000004b3dd	testq	%r12, %r12
000000000004b3e0	je	0x4b3ea
000000000004b3e2	movq	%r12, %rdi
000000000004b3e5	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000004b3ea	movq	%r14, %rax
000000000004b3ed	addq	$0x48, %rsp
000000000004b3f1	popq	%rbx
000000000004b3f2	popq	%r12
000000000004b3f4	popq	%r13
000000000004b3f6	popq	%r14
000000000004b3f8	popq	%r15
000000000004b3fa	popq	%rbp
000000000004b3fb	retq
000000000004b3fc	callq	__ZNSt3__16vectorI12OZChannelRefNS_9allocatorIS1_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<OZChannelRef, std::__1::allocator<OZChannelRef>>::__throw_length_error[abi:nqe210106]()
000000000004b401	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
000000000004b406	movq	%rax, %rbx
000000000004b409	leaq	-0x68(%rbp), %rdi
000000000004b40d	callq	__ZNSt3__114__split_bufferI12OZChannelRefRNS_9allocatorIS1_EEED1Ev ## std::__1::__split_buffer<OZChannelRef, std::__1::allocator<OZChannelRef>&>::~__split_buffer()
000000000004b412	movq	%rbx, %rdi
000000000004b415	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000004b41a	movq	%rax, %rbx
000000000004b41d	testq	%r13, %r13
000000000004b420	je	0x4b442
000000000004b422	addq	$-0x18, %r14
000000000004b426	negq	%r13
000000000004b429	nopl	(%rax)
000000000004b430	movq	%r14, %rdi
000000000004b433	callq	0x6dd71c                        ## symbol stub for: __ZN12OZChannelRefD1Ev
000000000004b438	addq	$-0x18, %r14
000000000004b43c	addq	$0x18, %r13
000000000004b440	jne	0x4b430
000000000004b442	leaq	-0x68(%rbp), %rdi
000000000004b446	callq	__ZNSt3__114__split_bufferI12OZChannelRefRNS_9allocatorIS1_EEED1Ev ## std::__1::__split_buffer<OZChannelRef, std::__1::allocator<OZChannelRef>&>::~__split_buffer()
000000000004b44b	movq	%rbx, %rdi
000000000004b44e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000004b453	nopw	%cs:(%rax,%rax)
__ZNSt3__114__split_bufferI12OZChannelRefRNS_9allocatorIS1_EEED1Ev:
000000000004b460	pushq	%rbp
000000000004b461	movq	%rsp, %rbp
000000000004b464	pushq	%r14
000000000004b466	pushq	%rbx
000000000004b467	movq	%rdi, %rbx
000000000004b46a	movq	0x8(%rdi), %r14
000000000004b46e	movq	0x10(%rdi), %rdi
000000000004b472	cmpq	%rdi, %r14
000000000004b475	je	0x4b496
000000000004b477	nopw	(%rax,%rax)
000000000004b480	addq	$-0x18, %rdi
000000000004b484	movq	%rdi, 0x10(%rbx)
000000000004b488	callq	0x6dd71c                        ## symbol stub for: __ZN12OZChannelRefD1Ev
000000000004b48d	movq	0x10(%rbx), %rdi
000000000004b491	cmpq	%rdi, %r14
000000000004b494	jne	0x4b480
000000000004b496	movq	(%rbx), %rdi
000000000004b499	testq	%rdi, %rdi
000000000004b49c	je	0x4b4a7
000000000004b49e	popq	%rbx
000000000004b49f	popq	%r14
000000000004b4a1	popq	%rbp
000000000004b4a2	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000004b4a7	popq	%rbx
000000000004b4a8	popq	%r14
000000000004b4aa	popq	%rbp
000000000004b4ab	retq
000000000004b4ac	nopl	(%rax)
__ZNSt3__16vectorI12OZChannelRefNS_9allocatorIS1_EEE20__throw_length_errorB9nqe210106Ev:
000000000004b4b0	pushq	%rbp
000000000004b4b1	movq	%rsp, %rbp
000000000004b4b4	leaq	0x77bfb6(%rip), %rdi            ## literal pool for: "vector"
000000000004b4bb	callq	__ZNSt3__120__throw_length_errorB9nqe210106EPKc ## std::__1::__throw_length_error[abi:nqe210106](char const*)
__ZNSt3__16vectorIP12OZAudioTrackNS_9allocatorIS2_EEE20__throw_length_errorB9nqe210106Ev:
000000000004b4c0	pushq	%rbp
000000000004b4c1	movq	%rsp, %rbp
000000000004b4c4	leaq	0x77bfa6(%rip), %rdi            ## literal pool for: "vector"
000000000004b4cb	callq	__ZNSt3__120__throw_length_errorB9nqe210106EPKc ## std::__1::__throw_length_error[abi:nqe210106](char const*)
-[OZNotificationStub initWithOZDocument:useTimer:]:
000000000004b4d0	pushq	%rbp
000000000004b4d1	movq	%rsp, %rbp
