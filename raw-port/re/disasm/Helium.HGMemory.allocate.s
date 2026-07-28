__ZN8HGMemory8allocateEmPm:
00000000001b9040	pushq	%rbp
00000000001b9041	movq	%rsp, %rbp
00000000001b9044	pushq	%r14
00000000001b9046	pushq	%rbx
00000000001b9047	subq	$0x20, %rsp
00000000001b904b	movq	%rsi, %rbx
00000000001b904e	movq	%rdi, %r14
00000000001b9051	movq	__ZZN15HGMemoryManager8INSTANCEEvE4flag(%rip), %rax ## HGMemoryManager::INSTANCE()::flag
00000000001b9058	cmpq	$-0x1, %rax
00000000001b905c	je	0x1b9085
00000000001b905e	leaq	-0x11(%rbp), %rax
00000000001b9062	movq	%rax, -0x28(%rbp)
00000000001b9066	leaq	-0x28(%rbp), %rax
00000000001b906a	movq	%rax, -0x20(%rbp)
00000000001b906e	leaq	__ZZN15HGMemoryManager8INSTANCEEvE4flag(%rip), %rdi ## HGMemoryManager::INSTANCE()::flag
00000000001b9075	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15HGMemoryManager8INSTANCEEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<HGMemoryManager::INSTANCE()::'lambda'()&&>>(void*)
00000000001b907c	leaq	-0x20(%rbp), %rsi
00000000001b9080	callq	0x3c4e26                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000001b9085	movq	__ZZN15HGMemoryManager8INSTANCEEvE2mm(%rip), %rdi ## HGMemoryManager::INSTANCE()::mm
00000000001b908c	movq	%r14, %rsi
00000000001b908f	movq	%rbx, %rdx
00000000001b9092	callq	__ZN15HGMemoryManager8allocateEmPm ## HGMemoryManager::allocate(unsigned long, unsigned long*)
00000000001b9097	addq	$0x20, %rsp
00000000001b909b	popq	%rbx
00000000001b909c	popq	%r14
00000000001b909e	popq	%rbp
00000000001b909f	retq
