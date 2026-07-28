__ZN8HGMemory5clearEv:
00000000001b9920	pushq	%rbp
00000000001b9921	movq	%rsp, %rbp
00000000001b9924	pushq	%r14
00000000001b9926	pushq	%rbx
00000000001b9927	subq	$0x20, %rsp
00000000001b992b	movq	__ZZN15HGMemoryManager8INSTANCEEvE4flag(%rip), %rax ## HGMemoryManager::INSTANCE()::flag
00000000001b9932	cmpq	$-0x1, %rax
00000000001b9936	je	0x1b995f
00000000001b9938	leaq	-0x11(%rbp), %rax
00000000001b993c	movq	%rax, -0x28(%rbp)
00000000001b9940	leaq	-0x28(%rbp), %rax
00000000001b9944	movq	%rax, -0x20(%rbp)
00000000001b9948	leaq	__ZZN15HGMemoryManager8INSTANCEEvE4flag(%rip), %rdi ## HGMemoryManager::INSTANCE()::flag
00000000001b994f	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15HGMemoryManager8INSTANCEEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<HGMemoryManager::INSTANCE()::'lambda'()&&>>(void*)
00000000001b9956	leaq	-0x20(%rbp), %rsi
00000000001b995a	callq	0x3c4e26                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000001b995f	movq	__ZZN15HGMemoryManager8INSTANCEEvE2mm(%rip), %rbx ## HGMemoryManager::INSTANCE()::mm
00000000001b9966	leaq	0x40(%rbx), %r14
00000000001b996a	movq	%r14, %rdi
00000000001b996d	callq	0x3c556a                        ## symbol stub for: _pthread_mutex_lock
00000000001b9972	incq	0x38(%rbx)
00000000001b9976	movq	%rbx, %rdi
00000000001b9979	callq	__ZN15HGMemoryManager5clearEv   ## HGMemoryManager::clear()
00000000001b997e	movq	%r14, %rdi
00000000001b9981	callq	0x3c5570                        ## symbol stub for: _pthread_mutex_unlock
00000000001b9986	addq	$0x20, %rsp
00000000001b998a	popq	%rbx
00000000001b998b	popq	%r14
00000000001b998d	popq	%rbp
00000000001b998e	retq
00000000001b998f	nop
