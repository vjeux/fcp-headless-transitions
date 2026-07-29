__ZN19HGProgramDescriptor18SetStageInBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE:
0000000000168100	pushq	%rbp
0000000000168101	movq	%rsp, %rbp
0000000000168104	addq	$0x100, %rdi                    ## imm = 0x100
000000000016810b	cmpq	%rsi, %rdi
000000000016810e	je	0x168138
0000000000168110	movq	(%rsi), %rax
0000000000168113	movq	0x8(%rsi), %rdx
0000000000168117	movq	%rdx, %rsi
000000000016811a	subq	%rax, %rsi
000000000016811d	sarq	$0x4, %rsi
0000000000168121	movabsq	$-0x5555555555555555, %rcx      ## imm = 0xAAAAAAAAAAAAAAAB
000000000016812b	imulq	%rsi, %rcx
000000000016812f	movq	%rax, %rsi
0000000000168132	popq	%rbp
0000000000168133	jmp	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE18__assign_with_sizeB9nqe210106IPS1_S6_EEvT_T0_l ## void std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__assign_with_size[abi:nqe210106]<HGBinding*, HGBinding*>(HGBinding*, HGBinding*, long)
0000000000168138	popq	%rbp
0000000000168139	retq
000000000016813a	nopw	(%rax,%rax)
