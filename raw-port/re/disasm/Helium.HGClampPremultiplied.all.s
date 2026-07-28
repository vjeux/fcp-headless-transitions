__ZN20HGClampPremultipliedC1Ev:
00000000001b8ec0	pushq	%rbp
00000000001b8ec1	movq	%rsp, %rbp
00000000001b8ec4	pushq	%r15
00000000001b8ec6	pushq	%r14
00000000001b8ec8	pushq	%rbx
00000000001b8ec9	pushq	%rax
00000000001b8eca	movq	%rdi, %rbx
00000000001b8ecd	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001b8ed2	leaq	0x86e3ff(%rip), %rax
00000000001b8ed9	movq	%rax, (%rbx)
00000000001b8edc	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001b8ee1	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001b8ee6	movq	%rax, %r14
00000000001b8ee9	movq	%rax, %rdi
00000000001b8eec	callq	__ZN21HgcClampPremultipliedC1Ev ## HgcClampPremultiplied::HgcClampPremultiplied()
00000000001b8ef1	movq	%r14, 0x198(%rbx)
00000000001b8ef8	addq	$0x8, %rsp
00000000001b8efc	popq	%rbx
00000000001b8efd	popq	%r14
00000000001b8eff	popq	%r15
00000000001b8f01	popq	%rbp
00000000001b8f02	retq
00000000001b8f03	movq	%rax, %r15
00000000001b8f06	movq	%r14, %rdi
00000000001b8f09	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001b8f0e	movq	%rbx, %rdi
00000000001b8f11	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001b8f16	movq	%r15, %rdi
00000000001b8f19	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001b8f1e	movq	%rax, %r15
00000000001b8f21	movq	%rbx, %rdi
00000000001b8f24	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001b8f29	movq	%r15, %rdi
00000000001b8f2c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001b8f31	nopw	%cs:(%rax,%rax)
__ZN20HGClampPremultipliedD2Ev:
00000000001b8f40	pushq	%rbp
00000000001b8f41	movq	%rsp, %rbp
00000000001b8f44	pushq	%rbx
00000000001b8f45	pushq	%rax
00000000001b8f46	movq	%rdi, %rbx
00000000001b8f49	leaq	0x86e388(%rip), %rax
00000000001b8f50	movq	%rax, (%rdi)
00000000001b8f53	movq	0x198(%rdi), %rdi
00000000001b8f5a	movq	(%rdi), %rax
00000000001b8f5d	callq	*0x18(%rax)
00000000001b8f60	movq	%rbx, %rdi
00000000001b8f63	addq	$0x8, %rsp
00000000001b8f67	popq	%rbx
00000000001b8f68	popq	%rbp
00000000001b8f69	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001b8f6e	movq	%rax, %rdi
00000000001b8f71	callq	___clang_call_terminate
00000000001b8f76	nopw	%cs:(%rax,%rax)
__ZN20HGClampPremultipliedD1Ev:
00000000001b8f80	pushq	%rbp
00000000001b8f81	movq	%rsp, %rbp
00000000001b8f84	pushq	%rbx
00000000001b8f85	pushq	%rax
00000000001b8f86	movq	%rdi, %rbx
00000000001b8f89	leaq	0x86e348(%rip), %rax
00000000001b8f90	movq	%rax, (%rdi)
00000000001b8f93	movq	0x198(%rdi), %rdi
00000000001b8f9a	movq	(%rdi), %rax
00000000001b8f9d	callq	*0x18(%rax)
00000000001b8fa0	movq	%rbx, %rdi
00000000001b8fa3	addq	$0x8, %rsp
00000000001b8fa7	popq	%rbx
00000000001b8fa8	popq	%rbp
00000000001b8fa9	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001b8fae	movq	%rax, %rdi
00000000001b8fb1	callq	___clang_call_terminate
00000000001b8fb6	nopw	%cs:(%rax,%rax)
__ZN20HGClampPremultipliedD0Ev:
00000000001b8fc0	pushq	%rbp
00000000001b8fc1	movq	%rsp, %rbp
00000000001b8fc4	pushq	%rbx
00000000001b8fc5	pushq	%rax
00000000001b8fc6	movq	%rdi, %rbx
00000000001b8fc9	leaq	0x86e308(%rip), %rax
00000000001b8fd0	movq	%rax, (%rdi)
00000000001b8fd3	movq	0x198(%rdi), %rdi
00000000001b8fda	movq	(%rdi), %rax
00000000001b8fdd	callq	*0x18(%rax)
00000000001b8fe0	movq	%rbx, %rdi
00000000001b8fe3	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001b8fe8	movq	%rbx, %rdi
00000000001b8feb	addq	$0x8, %rsp
00000000001b8fef	popq	%rbx
00000000001b8ff0	popq	%rbp
00000000001b8ff1	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001b8ff6	movq	%rax, %rdi
00000000001b8ff9	callq	___clang_call_terminate
00000000001b8ffe	nop
__ZN20HGClampPremultiplied9GetOutputEP10HGRenderer:
00000000001b9000	pushq	%rbp
00000000001b9001	movq	%rsp, %rbp
00000000001b9004	pushq	%rbx
00000000001b9005	pushq	%rax
00000000001b9006	movq	%rdi, %rbx
00000000001b9009	movq	%rsi, %rdi
00000000001b900c	movq	%rbx, %rsi
00000000001b900f	xorl	%edx, %edx
00000000001b9011	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001b9016	movq	0x198(%rbx), %rdi
00000000001b901d	movq	(%rdi), %rcx
00000000001b9020	xorl	%esi, %esi
00000000001b9022	movq	%rax, %rdx
00000000001b9025	callq	*0x78(%rcx)
00000000001b9028	movq	0x198(%rbx), %rax
00000000001b902f	addq	$0x8, %rsp
00000000001b9033	popq	%rbx
00000000001b9034	popq	%rbp
00000000001b9035	retq
00000000001b9036	nopw	%cs:(%rax,%rax)
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
