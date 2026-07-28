__ZN12FlushManager18setImageSegmentMD5EiP22FFMD5AndOffsetWithInfo:
0000000000ab7160	pushq	%rbp
0000000000ab7161	movq	%rsp, %rbp
0000000000ab7164	pushq	%r15
0000000000ab7166	pushq	%r14
0000000000ab7168	pushq	%rbx
0000000000ab7169	pushq	%rax
0000000000ab716a	movq	%rdx, %r15
0000000000ab716d	movl	%esi, %r14d
0000000000ab7170	movq	%rdi, %rbx
0000000000ab7173	callq	0x14973b0                       ## symbol stub for: __ZNSt3__15mutex4lockEv
0000000000ab7178	movq	%r15, %rdi
0000000000ab717b	callq	*0xe3658f(%rip)                 ## literal pool symbol address: _objc_retain
0000000000ab7181	movslq	%r14d, %rcx
0000000000ab7184	movq	0x40(%rbx), %rdx
0000000000ab7188	movq	0x48(%rbx), %rsi
0000000000ab718c	subq	%rdx, %rsi
0000000000ab718f	sarq	$0x6, %rsi
0000000000ab7193	cmpq	%rcx, %rsi
0000000000ab7196	jbe	0xab71b3
0000000000ab7198	shlq	$0x6, %rcx
0000000000ab719c	movq	%rax, 0x30(%rdx,%rcx)
0000000000ab71a1	movq	%rbx, %rdi
0000000000ab71a4	addq	$0x8, %rsp
0000000000ab71a8	popq	%rbx
0000000000ab71a9	popq	%r14
0000000000ab71ab	popq	%r15
0000000000ab71ad	popq	%rbp
0000000000ab71ae	jmp	0x14973b6                       ## symbol stub for: __ZNSt3__15mutex6unlockEv
0000000000ab71b3	callq	__ZNSt3__16vectorI12StreamRecordNS_9allocatorIS1_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<StreamRecord, std::__1::allocator<StreamRecord>>::__throw_out_of_range[abi:nqe210106]()
0000000000ab71b8	ud2
0000000000ab71ba	movq	%rax, %r14
0000000000ab71bd	movq	%rbx, %rdi
0000000000ab71c0	callq	0x14973b6                       ## symbol stub for: __ZNSt3__15mutex6unlockEv
0000000000ab71c5	movq	%r14, %rdi
0000000000ab71c8	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000ab71cd	nopl	(%rax)
