__ZN8HGMemory9renderEndEv:
00000000001b9500	pushq	%rbp
00000000001b9501	movq	%rsp, %rbp
00000000001b9504	pushq	%r14
00000000001b9506	pushq	%rbx
00000000001b9507	subq	$0x20, %rsp
00000000001b950b	movq	__ZZN15HGMemoryManager8INSTANCEEvE4flag(%rip), %rax ## HGMemoryManager::INSTANCE()::flag
00000000001b9512	cmpq	$-0x1, %rax
00000000001b9516	je	0x1b953f
00000000001b9518	leaq	-0x11(%rbp), %rax
00000000001b951c	movq	%rax, -0x28(%rbp)
00000000001b9520	leaq	-0x28(%rbp), %rax
00000000001b9524	movq	%rax, -0x20(%rbp)
00000000001b9528	leaq	__ZZN15HGMemoryManager8INSTANCEEvE4flag(%rip), %rdi ## HGMemoryManager::INSTANCE()::flag
00000000001b952f	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15HGMemoryManager8INSTANCEEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<HGMemoryManager::INSTANCE()::'lambda'()&&>>(void*)
00000000001b9536	leaq	-0x20(%rbp), %rsi
00000000001b953a	callq	0x3c4e26                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000001b953f	movq	__ZZN15HGMemoryManager8INSTANCEEvE2mm(%rip), %rbx ## HGMemoryManager::INSTANCE()::mm
00000000001b9546	leaq	0x40(%rbx), %r14
00000000001b954a	movq	%r14, %rdi
00000000001b954d	callq	0x3c556a                        ## symbol stub for: _pthread_mutex_lock
00000000001b9552	incq	0x38(%rbx)
00000000001b9556	movq	%rbx, %rdi
00000000001b9559	callq	__ZN15HGMemoryManager7cleanupEv ## HGMemoryManager::cleanup()
00000000001b955e	movq	%r14, %rdi
00000000001b9561	callq	0x3c5570                        ## symbol stub for: _pthread_mutex_unlock
00000000001b9566	addq	$0x20, %rsp
00000000001b956a	popq	%rbx
00000000001b956b	popq	%r14
00000000001b956d	popq	%rbp
00000000001b956e	retq
00000000001b956f	nop
