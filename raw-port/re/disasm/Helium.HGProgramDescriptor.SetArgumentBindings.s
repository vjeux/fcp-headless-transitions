__ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE:
0000000000167f70	pushq	%rbp
0000000000167f71	movq	%rsp, %rbp
0000000000167f74	pushq	%r15
0000000000167f76	pushq	%r14
0000000000167f78	pushq	%r13
0000000000167f7a	pushq	%r12
0000000000167f7c	pushq	%rbx
0000000000167f7d	subq	$0x18, %rsp
0000000000167f81	movq	%rsi, %rbx
0000000000167f84	movq	%rdi, %r14
0000000000167f87	addq	$0xe8, %rdi
0000000000167f8e	movabsq	$-0x5555555555555555, %r15      ## imm = 0xAAAAAAAAAAAAAAAB
0000000000167f98	cmpq	%rsi, %rdi
0000000000167f9b	je	0x167fb7
0000000000167f9d	movq	(%rbx), %rsi
0000000000167fa0	movq	0x8(%rbx), %rdx
0000000000167fa4	movq	%rdx, %rcx
0000000000167fa7	subq	%rsi, %rcx
0000000000167faa	sarq	$0x4, %rcx
0000000000167fae	imulq	%r15, %rcx
0000000000167fb2	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE18__assign_with_sizeB9nqe210106IPS1_S6_EEvT_T0_l ## void std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__assign_with_size[abi:nqe210106]<HGBinding*, HGBinding*>(HGBinding*, HGBinding*, long)
0000000000167fb7	movq	0x8(%rbx), %r13
0000000000167fbb	subq	(%rbx), %r13
0000000000167fbe	je	0x16809f
0000000000167fc4	sarq	$0x4, %r13
0000000000167fc8	imulq	%r15, %r13
0000000000167fcc	leaq	0x70(%r14), %r15
0000000000167fd0	xorl	%r12d, %r12d
0000000000167fd3	jmp	0x167ff8
0000000000167fd5	movl	$0x1, (%rax)
0000000000167fdb	movq	$0x0, 0x8(%rax)
0000000000167fe3	addq	$0x10, %rax
0000000000167fe7	movq	%rax, 0x78(%r14)
0000000000167feb	addq	$0x30, %r12
0000000000167fef	decq	%r13
0000000000167ff2	je	0x16809f
0000000000167ff8	movq	(%rbx), %rax
0000000000167ffb	movl	(%rax,%r12), %eax
0000000000167fff	cmpl	$0x9, %eax
0000000000168002	je	0x168050
0000000000168004	cmpl	$0xa, %eax
0000000000168007	jne	0x167feb
0000000000168009	movl	$0x1, -0x38(%rbp)
0000000000168010	movq	$0x0, -0x30(%rbp)
0000000000168018	movq	0x78(%r14), %rax
000000000016801c	cmpq	0x80(%r14), %rax
0000000000168023	jb	0x167fd5
0000000000168025	movq	%r15, %rdi
0000000000168028	leaq	-0x38(%rbp), %rsi
000000000016802c	callq	__ZNSt3__16vectorINS_4pairIN19HGProgramDescriptor9InputTypeE5HGRefIS2_EEENS_9allocatorIS6_EEE24__emplace_back_slow_pathIJS6_EEEPS6_DpOT_ ## std::__1::pair<HGProgramDescriptor::InputType, HGRef<HGProgramDescriptor>>* std::__1::vector<std::__1::pair<HGProgramDescriptor::InputType, HGRef<HGProgramDescriptor>>, std::__1::allocator<std::__1::pair<HGProgramDescriptor::InputType, HGRef<HGProgramDescriptor>>>>::__emplace_back_slow_path<std::__1::pair<HGProgramDescriptor::InputType, HGRef<HGProgramDescriptor>>>(std::__1::pair<HGProgramDescriptor::InputType, HGRef<HGProgramDescriptor>>&&)
0000000000168031	movq	-0x30(%rbp), %rdi
0000000000168035	movq	%rax, 0x78(%r14)
0000000000168039	testq	%rdi, %rdi
000000000016803c	je	0x167feb
000000000016803e	movq	(%rdi), %rax
0000000000168041	callq	*0x18(%rax)
0000000000168044	jmp	0x167feb
0000000000168046	nopw	%cs:(%rax,%rax)
0000000000168050	movl	$0x2, -0x38(%rbp)
0000000000168057	movq	$0x0, -0x30(%rbp)
000000000016805f	movq	0x78(%r14), %rax
0000000000168063	cmpq	0x80(%r14), %rax
000000000016806a	jae	0x168077
000000000016806c	movl	$0x2, (%rax)
0000000000168072	jmp	0x167fdb
0000000000168077	movq	%r15, %rdi
000000000016807a	leaq	-0x38(%rbp), %rsi
000000000016807e	callq	__ZNSt3__16vectorINS_4pairIN19HGProgramDescriptor9InputTypeE5HGRefIS2_EEENS_9allocatorIS6_EEE24__emplace_back_slow_pathIJS6_EEEPS6_DpOT_ ## std::__1::pair<HGProgramDescriptor::InputType, HGRef<HGProgramDescriptor>>* std::__1::vector<std::__1::pair<HGProgramDescriptor::InputType, HGRef<HGProgramDescriptor>>, std::__1::allocator<std::__1::pair<HGProgramDescriptor::InputType, HGRef<HGProgramDescriptor>>>>::__emplace_back_slow_path<std::__1::pair<HGProgramDescriptor::InputType, HGRef<HGProgramDescriptor>>>(std::__1::pair<HGProgramDescriptor::InputType, HGRef<HGProgramDescriptor>>&&)
0000000000168083	movq	-0x30(%rbp), %rdi
0000000000168087	movq	%rax, 0x78(%r14)
000000000016808b	testq	%rdi, %rdi
000000000016808e	je	0x167feb
0000000000168094	movq	(%rdi), %rax
0000000000168097	callq	*0x18(%rax)
000000000016809a	jmp	0x167feb
000000000016809f	addq	$0x18, %rsp
00000000001680a3	popq	%rbx
00000000001680a4	popq	%r12
00000000001680a6	popq	%r13
00000000001680a8	popq	%r14
00000000001680aa	popq	%r15
00000000001680ac	popq	%rbp
00000000001680ad	retq
00000000001680ae	movq	%rax, %rdi
00000000001680b1	callq	___clang_call_terminate
00000000001680b6	movq	%rax, %rdi
00000000001680b9	callq	___clang_call_terminate
00000000001680be	movq	%rax, %rbx
00000000001680c1	movq	-0x30(%rbp), %rdi
00000000001680c5	testq	%rdi, %rdi
00000000001680c8	je	0x1680ec
00000000001680ca	movq	(%rdi), %rax
00000000001680cd	callq	*0x18(%rax)
00000000001680d0	jmp	0x1680ec
00000000001680d2	movq	%rax, %rdi
00000000001680d5	callq	___clang_call_terminate
00000000001680da	movq	%rax, %rbx
00000000001680dd	movq	-0x30(%rbp), %rdi
00000000001680e1	testq	%rdi, %rdi
00000000001680e4	je	0x1680ec
00000000001680e6	movq	(%rdi), %rax
00000000001680e9	callq	*0x18(%rax)
00000000001680ec	movq	%rbx, %rdi
00000000001680ef	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001680f4	movq	%rax, %rdi
00000000001680f7	callq	___clang_call_terminate
00000000001680fc	nopl	(%rax)
