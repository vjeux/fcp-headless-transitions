__ZN8HGMemory7releaseEPv:
00000000001b92d0	pushq	%rbp
00000000001b92d1	movq	%rsp, %rbp
00000000001b92d4	pushq	%rbx
00000000001b92d5	subq	$0x18, %rsp
00000000001b92d9	movq	%rdi, %rbx
00000000001b92dc	movq	__ZZN15HGMemoryManager8INSTANCEEvE4flag(%rip), %rax ## HGMemoryManager::INSTANCE()::flag
00000000001b92e3	cmpq	$-0x1, %rax
00000000001b92e7	je	0x1b9310
00000000001b92e9	leaq	-0x9(%rbp), %rax
00000000001b92ed	movq	%rax, -0x20(%rbp)
00000000001b92f1	leaq	-0x20(%rbp), %rax
00000000001b92f5	movq	%rax, -0x18(%rbp)
00000000001b92f9	leaq	__ZZN15HGMemoryManager8INSTANCEEvE4flag(%rip), %rdi ## HGMemoryManager::INSTANCE()::flag
00000000001b9300	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15HGMemoryManager8INSTANCEEvEUlvE_EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<HGMemoryManager::INSTANCE()::'lambda'()&&>>(void*)
00000000001b9307	leaq	-0x18(%rbp), %rsi
00000000001b930b	callq	0x3c4e26                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
00000000001b9310	movq	__ZZN15HGMemoryManager8INSTANCEEvE2mm(%rip), %rdi ## HGMemoryManager::INSTANCE()::mm
00000000001b9317	movq	%rbx, %rsi
00000000001b931a	callq	__ZN15HGMemoryManager7releaseEPv ## HGMemoryManager::release(void*)
00000000001b931f	addq	$0x18, %rsp
00000000001b9323	popq	%rbx
00000000001b9324	popq	%rbp
00000000001b9325	retq
00000000001b9326	nopw	%cs:(%rax,%rax)
