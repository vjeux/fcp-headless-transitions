__ZN10OZFrameSet8addRangeERK11PCTimeRange6CMTime:
00000000003762a0	pushq	%rbp
00000000003762a1	movq	%rsp, %rbp
00000000003762a4	pushq	%r15
00000000003762a6	pushq	%r14
00000000003762a8	pushq	%r13
00000000003762aa	pushq	%r12
00000000003762ac	pushq	%rbx
00000000003762ad	subq	$0x108, %rsp                    ## imm = 0x108
00000000003762b4	movq	%rsi, %r15
00000000003762b7	movq	%rdi, %r14
00000000003762ba	cmpq	$0x0, 0x10(%rdi)
00000000003762bf	je	0x3764f1
00000000003762c5	leaq	0x10(%rbp), %rbx
00000000003762c9	movq	0x10(%r15), %rax
00000000003762cd	movq	%rax, -0xe0(%rbp)
00000000003762d4	movups	(%r15), %xmm0
00000000003762d8	movaps	%xmm0, -0xf0(%rbp)
00000000003762df	movq	0x10(%rbx), %rax
00000000003762e3	movq	%rax, 0x28(%rsp)
00000000003762e8	movups	(%rbx), %xmm0
00000000003762eb	movups	%xmm0, 0x18(%rsp)
00000000003762f0	movq	-0xe0(%rbp), %rax
00000000003762f7	movq	%rax, 0x10(%rsp)
00000000003762fc	movaps	-0xf0(%rbp), %xmm0
0000000000376303	movups	%xmm0, (%rsp)
0000000000376307	leaq	-0x40(%rbp), %rdi
000000000037630b	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000376310	movq	0x28(%r15), %rax
0000000000376314	movq	%rax, -0x60(%rbp)
0000000000376318	movq	%r15, -0xf8(%rbp)
000000000037631f	movups	0x18(%r15), %xmm0
0000000000376324	movaps	%xmm0, -0x70(%rbp)
0000000000376328	leaq	-0x90(%rbp), %rdi
000000000037632f	movsd	0x390bb1(%rip), %xmm0
0000000000376337	movq	%rbx, %rsi
000000000037633a	callq	0x6dfc72                        ## symbol stub for: __ZmlRK6CMTimed
000000000037633f	leaq	-0xd8(%rbp), %r13
0000000000376346	movq	-0x80(%rbp), %rax
000000000037634a	movq	%rax, 0x28(%rsp)
000000000037634f	movups	-0x90(%rbp), %xmm0
0000000000376356	movups	%xmm0, 0x18(%rsp)
000000000037635b	movq	-0x60(%rbp), %rax
000000000037635f	movq	%rax, 0x10(%rsp)
0000000000376364	movaps	-0x70(%rbp), %xmm0
0000000000376368	movups	%xmm0, (%rsp)
000000000037636c	movq	%r13, %rdi
000000000037636f	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376374	movups	-0x40(%rbp), %xmm0
0000000000376378	movaps	%xmm0, -0xf0(%rbp)
000000000037637f	movq	-0x30(%rbp), %rax
0000000000376383	movq	%rax, -0xe0(%rbp)
000000000037638a	movq	(%r14), %rbx
000000000037638d	movq	%r14, -0xa0(%rbp)
0000000000376394	leaq	0x8(%r14), %r12
0000000000376398	movb	$0x1, %r15b
000000000037639b	cmpq	%r12, %rbx
000000000037639e	je	0x376575
00000000003763a4	leaq	-0x40(%rbp), %r14
00000000003763a8	jmp	0x3763bc
00000000003763aa	nopw	(%rax,%rax)
00000000003763b0	movq	%rax, %rbx
00000000003763b3	cmpq	%r12, %rax
00000000003763b6	je	0x376572
00000000003763bc	movq	0x2c(%rbx), %rax
00000000003763c0	movq	%rax, -0x60(%rbp)
00000000003763c4	movups	0x1c(%rbx), %xmm0
00000000003763c8	movaps	%xmm0, -0x70(%rbp)
00000000003763cc	movq	0x2c(%rbx), %rax
00000000003763d0	movq	%rax, -0x30(%rbp)
00000000003763d4	movups	0x1c(%rbx), %xmm0
00000000003763d8	movaps	%xmm0, -0x40(%rbp)
00000000003763dc	movq	0x44(%rbx), %rax
00000000003763e0	movq	%rax, -0x80(%rbp)
00000000003763e4	movups	0x34(%rbx), %xmm0
00000000003763e8	movaps	%xmm0, -0x90(%rbp)
00000000003763ef	movq	-0x80(%rbp), %rax
00000000003763f3	movq	%rax, 0x28(%rsp)
00000000003763f8	movaps	-0x90(%rbp), %xmm0
00000000003763ff	movups	%xmm0, 0x18(%rsp)
0000000000376404	movq	-0x30(%rbp), %rax
0000000000376408	movq	%rax, 0x10(%rsp)
000000000037640d	movaps	-0x40(%rbp), %xmm0
0000000000376411	movups	%xmm0, (%rsp)
0000000000376415	leaq	-0xb8(%rbp), %rdi
000000000037641c	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376421	movq	0x10(%r13), %rax
0000000000376425	movq	%rax, 0x28(%rsp)
000000000037642a	movups	(%r13), %xmm0
000000000037642f	movups	%xmm0, 0x18(%rsp)
0000000000376434	movq	-0xe0(%rbp), %rax
000000000037643b	movq	%rax, 0x10(%rsp)
0000000000376440	movaps	-0xf0(%rbp), %xmm0
0000000000376447	movups	%xmm0, (%rsp)
000000000037644b	movq	%r14, %rdi
000000000037644e	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376453	movq	-0x60(%rbp), %rax
0000000000376457	movq	%rax, 0x28(%rsp)
000000000037645c	movaps	-0x70(%rbp), %xmm0
0000000000376460	movups	%xmm0, 0x18(%rsp)
0000000000376465	movq	-0x30(%rbp), %rax
0000000000376469	movq	%rax, 0x10(%rsp)
000000000037646e	movups	-0x40(%rbp), %xmm0
0000000000376472	movups	%xmm0, (%rsp)
0000000000376476	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
000000000037647b	testl	%eax, %eax
000000000037647d	js	0x3764bb
000000000037647f	movq	-0xa8(%rbp), %rax
0000000000376486	movq	%rax, 0x28(%rsp)
000000000037648b	movups	-0xb8(%rbp), %xmm0
0000000000376492	movups	%xmm0, 0x18(%rsp)
0000000000376497	movq	-0xe0(%rbp), %rax
000000000037649e	movq	%rax, 0x10(%rsp)
00000000003764a3	movaps	-0xf0(%rbp), %xmm0
00000000003764aa	movups	%xmm0, (%rsp)
00000000003764ae	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
00000000003764b3	testl	%eax, %eax
00000000003764b5	jle	0x3766d1
00000000003764bb	movq	0x8(%rbx), %rcx
00000000003764bf	testq	%rcx, %rcx
00000000003764c2	je	0x3764e0
00000000003764c4	nopw	%cs:(%rax,%rax)
00000000003764d0	movq	%rcx, %rax
00000000003764d3	movq	(%rcx), %rcx
00000000003764d6	testq	%rcx, %rcx
00000000003764d9	jne	0x3764d0
00000000003764db	jmp	0x3763b0
00000000003764e0	movq	0x10(%rbx), %rax
00000000003764e4	cmpq	(%rax), %rbx
00000000003764e7	movq	%rax, %rbx
00000000003764ea	jne	0x3764e0
00000000003764ec	jmp	0x3763b0
00000000003764f1	leaq	-0xf0(%rbp), %rsi
00000000003764f8	movq	%r14, %rdi
00000000003764fb	movq	%r15, %rdx
00000000003764fe	callq	__ZNSt3__16__treeI11PCTimeRangeNS_4lessIS1_EENS_9allocatorIS1_EEE12__find_equalIS1_EERPNS_16__tree_node_baseIPvEERPNS_15__tree_end_nodeISB_EERKT_ ## std::__1::__tree_node_base<void*>*& std::__1::__tree<PCTimeRange, std::__1::less<PCTimeRange>, std::__1::allocator<PCTimeRange>>::__find_equal<PCTimeRange>(std::__1::__tree_end_node<std::__1::__tree_node_base<void*>*>*&, PCTimeRange const&)
0000000000376503	cmpq	$0x0, (%rax)
0000000000376507	jne	0x376a58
000000000037650d	movl	$0x50, %edi
0000000000376512	movq	%rax, %rbx
0000000000376515	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000037651a	movq	0x10(%r15), %rcx
000000000037651e	movq	%rcx, 0x2c(%rax)
0000000000376522	movups	(%r15), %xmm0
0000000000376526	movups	%xmm0, 0x1c(%rax)
000000000037652a	movups	0x18(%r15), %xmm0
000000000037652f	movups	%xmm0, 0x34(%rax)
0000000000376533	movq	0x28(%r15), %rcx
0000000000376537	movq	%rcx, 0x44(%rax)
000000000037653b	movq	-0xf0(%rbp), %rcx
0000000000376542	xorps	%xmm0, %xmm0
0000000000376545	movups	%xmm0, (%rax)
0000000000376548	movq	%rcx, 0x10(%rax)
000000000037654c	movq	%rax, (%rbx)
000000000037654f	movq	(%r14), %rcx
0000000000376552	movq	(%rcx), %rcx
0000000000376555	testq	%rcx, %rcx
0000000000376558	je	0x37655d
000000000037655a	movq	%rcx, (%r14)
000000000037655d	movq	0x8(%r14), %rdi
0000000000376561	movq	%rax, %rsi
0000000000376564	callq	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_balance_after_insert[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
0000000000376569	incq	0x10(%r14)
000000000037656d	jmp	0x376a58
0000000000376572	movq	%rax, %rbx
0000000000376575	movl	%r15d, -0x94(%rbp)
000000000037657c	movq	%rbx, %r14
000000000037657f	cmpq	%r12, %rbx
0000000000376582	je	0x3766e7
0000000000376588	movq	%rbx, %r15
000000000037658b	jmp	0x37659c
000000000037658d	nopl	(%rax)
0000000000376590	movq	%r14, %r15
0000000000376593	cmpq	%r12, %r14
0000000000376596	je	0x3766e7
000000000037659c	movq	0x2c(%r15), %rax
00000000003765a0	movq	%rax, -0x60(%rbp)
00000000003765a4	movups	0x1c(%r15), %xmm0
00000000003765a9	movaps	%xmm0, -0x70(%rbp)
00000000003765ad	movq	0x2c(%r15), %rax
00000000003765b1	movq	%rax, -0x30(%rbp)
00000000003765b5	movups	0x1c(%r15), %xmm0
00000000003765ba	movaps	%xmm0, -0x40(%rbp)
00000000003765be	movq	0x44(%r15), %rax
00000000003765c2	movq	%rax, -0x80(%rbp)
00000000003765c6	movups	0x34(%r15), %xmm0
00000000003765cb	movaps	%xmm0, -0x90(%rbp)
00000000003765d2	movq	-0x80(%rbp), %rax
00000000003765d6	movq	%rax, 0x28(%rsp)
00000000003765db	movaps	-0x90(%rbp), %xmm0
00000000003765e2	movups	%xmm0, 0x18(%rsp)
00000000003765e7	movq	-0x30(%rbp), %rax
00000000003765eb	movq	%rax, 0x10(%rsp)
00000000003765f0	movaps	-0x40(%rbp), %xmm0
00000000003765f4	movups	%xmm0, (%rsp)
00000000003765f8	leaq	-0xb8(%rbp), %rdi
00000000003765ff	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376604	movq	0x10(%r13), %rax
0000000000376608	movq	%rax, 0x28(%rsp)
000000000037660d	movups	(%r13), %xmm0
0000000000376612	movups	%xmm0, 0x18(%rsp)
0000000000376617	movq	-0xe0(%rbp), %rax
000000000037661e	movq	%rax, 0x10(%rsp)
0000000000376623	movaps	-0xf0(%rbp), %xmm0
000000000037662a	movups	%xmm0, (%rsp)
000000000037662e	leaq	-0x40(%rbp), %rdi
0000000000376632	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376637	movq	-0x60(%rbp), %rax
000000000037663b	movq	%rax, 0x28(%rsp)
0000000000376640	movaps	-0x70(%rbp), %xmm0
0000000000376644	movups	%xmm0, 0x18(%rsp)
0000000000376649	movq	-0x30(%rbp), %rax
000000000037664d	movq	%rax, 0x10(%rsp)
0000000000376652	movups	-0x40(%rbp), %xmm0
0000000000376656	movups	%xmm0, (%rsp)
000000000037665a	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
000000000037665f	testl	%eax, %eax
0000000000376661	js	0x376781
0000000000376667	movq	-0xa8(%rbp), %rax
000000000037666e	movq	%rax, 0x28(%rsp)
0000000000376673	movups	-0xb8(%rbp), %xmm0
000000000037667a	movups	%xmm0, 0x18(%rsp)
000000000037667f	movq	-0xe0(%rbp), %rax
0000000000376686	movq	%rax, 0x10(%rsp)
000000000037668b	movaps	-0xf0(%rbp), %xmm0
0000000000376692	movups	%xmm0, (%rsp)
0000000000376696	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
000000000037669b	testl	%eax, %eax
000000000037669d	jg	0x376a6c
00000000003766a3	movq	0x8(%r15), %rax
00000000003766a7	testq	%rax, %rax
00000000003766aa	je	0x3766c0
00000000003766ac	nopl	(%rax)
00000000003766b0	movq	%rax, %r14
00000000003766b3	movq	(%rax), %rax
00000000003766b6	testq	%rax, %rax
00000000003766b9	jne	0x3766b0
00000000003766bb	jmp	0x376590
00000000003766c0	movq	0x10(%r15), %r14
00000000003766c4	cmpq	(%r14), %r15
00000000003766c7	movq	%r14, %r15
00000000003766ca	jne	0x3766c0
00000000003766cc	jmp	0x376590
00000000003766d1	xorl	%r15d, %r15d
00000000003766d4	movl	%r15d, -0x94(%rbp)
00000000003766db	movq	%rbx, %r14
00000000003766de	cmpq	%r12, %rbx
00000000003766e1	jne	0x376588
00000000003766e7	movq	-0xf8(%rbp), %r13
00000000003766ee	leaq	0x18(%r13), %r15
00000000003766f2	cmpb	$0x0, -0x94(%rbp)
00000000003766f9	je	0x37679c
00000000003766ff	leaq	-0x70(%rbp), %rsi
0000000000376703	movq	-0xa0(%rbp), %rbx
000000000037670a	movq	%rbx, %rdi
000000000037670d	movq	%r13, %rdx
0000000000376710	callq	__ZNSt3__16__treeI11PCTimeRangeNS_4lessIS1_EENS_9allocatorIS1_EEE12__find_equalIS1_EERPNS_16__tree_node_baseIPvEERPNS_15__tree_end_nodeISB_EERKT_ ## std::__1::__tree_node_base<void*>*& std::__1::__tree<PCTimeRange, std::__1::less<PCTimeRange>, std::__1::allocator<PCTimeRange>>::__find_equal<PCTimeRange>(std::__1::__tree_end_node<std::__1::__tree_node_base<void*>*>*&, PCTimeRange const&)
0000000000376715	cmpq	$0x0, (%rax)
0000000000376719	jne	0x3769e3
000000000037671f	movq	%rax, %r14
0000000000376722	movl	$0x50, %edi
0000000000376727	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000037672c	movq	0x10(%r13), %rcx
0000000000376730	movq	%rcx, 0x2c(%rax)
0000000000376734	movups	(%r13), %xmm0
0000000000376739	movups	%xmm0, 0x1c(%rax)
000000000037673d	movups	(%r15), %xmm0
0000000000376741	movups	%xmm0, 0x34(%rax)
0000000000376745	movq	0x10(%r15), %rcx
0000000000376749	movq	%rcx, 0x44(%rax)
000000000037674d	movq	-0x70(%rbp), %rcx
0000000000376751	xorps	%xmm0, %xmm0
0000000000376754	movups	%xmm0, (%rax)
0000000000376757	movq	%rcx, 0x10(%rax)
000000000037675b	movq	%rax, (%r14)
000000000037675e	movq	(%rbx), %rcx
0000000000376761	movq	(%rcx), %rcx
0000000000376764	testq	%rcx, %rcx
0000000000376767	je	0x37676c
0000000000376769	movq	%rcx, (%rbx)
000000000037676c	movq	0x8(%rbx), %rdi
0000000000376770	movq	%rax, %rsi
0000000000376773	callq	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_balance_after_insert[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
0000000000376778	incq	0x10(%rbx)
000000000037677c	jmp	0x3769e3
0000000000376781	movq	%r15, %r14
0000000000376784	movq	-0xf8(%rbp), %r13
000000000037678b	leaq	0x18(%r13), %r15
000000000037678f	cmpb	$0x0, -0x94(%rbp)
0000000000376796	jne	0x3766ff
000000000037679c	leaq	0x1c(%rbx), %r12
00000000003767a0	movq	0x2c(%rbx), %rax
00000000003767a4	movq	%rax, -0x60(%rbp)
00000000003767a8	movups	0x1c(%rbx), %xmm0
00000000003767ac	movaps	%xmm0, -0x70(%rbp)
00000000003767b0	movq	0x10(%r13), %rax
00000000003767b4	movq	%rax, -0x30(%rbp)
00000000003767b8	movups	(%r13), %xmm0
00000000003767bd	movaps	%xmm0, -0x40(%rbp)
00000000003767c1	movq	-0x30(%rbp), %rax
00000000003767c5	movq	%rax, 0x28(%rsp)
00000000003767ca	movaps	-0x40(%rbp), %xmm0
00000000003767ce	movups	%xmm0, 0x18(%rsp)
00000000003767d3	movq	-0x60(%rbp), %rax
00000000003767d7	movq	%rax, 0x10(%rsp)
00000000003767dc	movaps	-0x70(%rbp), %xmm0
00000000003767e0	movups	%xmm0, (%rsp)
00000000003767e4	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
00000000003767e9	testl	%eax, %eax
00000000003767eb	jg	0x3768cb
00000000003767f1	movq	0x10(%r13), %rax
00000000003767f5	movq	%rax, -0x60(%rbp)
00000000003767f9	movups	(%r13), %xmm0
00000000003767fe	movaps	%xmm0, -0x70(%rbp)
0000000000376802	movq	0x10(%r15), %rax
0000000000376806	movq	%rax, -0x30(%rbp)
000000000037680a	movups	(%r15), %xmm0
000000000037680e	movaps	%xmm0, -0x40(%rbp)
0000000000376812	movq	-0x30(%rbp), %rax
0000000000376816	movq	%rax, 0x28(%rsp)
000000000037681b	movaps	-0x40(%rbp), %xmm0
000000000037681f	movups	%xmm0, 0x18(%rsp)
0000000000376824	movq	-0x60(%rbp), %rax
0000000000376828	movq	%rax, 0x10(%rsp)
000000000037682d	movaps	-0x70(%rbp), %xmm0
0000000000376831	movups	%xmm0, (%rsp)
0000000000376835	leaq	-0x90(%rbp), %rdi
000000000037683c	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376841	movq	0x10(%r12), %rax
0000000000376846	movq	%rax, -0x60(%rbp)
000000000037684a	movups	(%r12), %xmm0
000000000037684f	movaps	%xmm0, -0x70(%rbp)
0000000000376853	movq	0x44(%rbx), %rax
0000000000376857	movq	%rax, -0x30(%rbp)
000000000037685b	movups	0x34(%rbx), %xmm0
000000000037685f	movaps	%xmm0, -0x40(%rbp)
0000000000376863	movq	-0x30(%rbp), %rax
0000000000376867	movq	%rax, 0x28(%rsp)
000000000037686c	movaps	-0x40(%rbp), %xmm0
0000000000376870	movups	%xmm0, 0x18(%rsp)
0000000000376875	movq	-0x60(%rbp), %rax
0000000000376879	movq	%rax, 0x10(%rsp)
000000000037687e	movaps	-0x70(%rbp), %xmm0
0000000000376882	movups	%xmm0, (%rsp)
0000000000376886	leaq	-0xb8(%rbp), %rdi
000000000037688d	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376892	movq	-0xa8(%rbp), %rax
0000000000376899	movq	%rax, 0x28(%rsp)
000000000037689e	movups	-0xb8(%rbp), %xmm0
00000000003768a5	movups	%xmm0, 0x18(%rsp)
00000000003768aa	movq	-0x80(%rbp), %rax
00000000003768ae	movq	%rax, 0x10(%rsp)
00000000003768b3	movups	-0x90(%rbp), %xmm0
00000000003768ba	movups	%xmm0, (%rsp)
00000000003768be	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
00000000003768c3	testl	%eax, %eax
00000000003768c5	jle	0x376a58
00000000003768cb	leaq	-0x70(%rbp), %rdi
00000000003768cf	movq	%r13, %rsi
00000000003768d2	movq	%r12, %rdx
00000000003768d5	leaq	0x10(%rbp), %r13
00000000003768d9	movq	%r13, %rcx
00000000003768dc	callq	0x6df4ec                        ## symbol stub for: __ZNK11PCTimeRange12getUnionWithERKS_RK6CMTime
00000000003768e1	movq	%rbx, %r15
00000000003768e4	cmpq	%rbx, %r14
00000000003768e7	je	0x37695d
00000000003768e9	movq	(%r14), %rax
00000000003768ec	testq	%rax, %rax
00000000003768ef	je	0x376910
00000000003768f1	nopw	%cs:(%rax,%rax)
0000000000376900	movq	%rax, %r12
0000000000376903	movq	0x8(%rax), %rax
0000000000376907	testq	%rax, %rax
000000000037690a	jne	0x376900
000000000037690c	jmp	0x37691d
000000000037690e	nop
0000000000376910	movq	0x10(%r14), %r12
0000000000376914	cmpq	(%r12), %r14
0000000000376918	movq	%r12, %r14
000000000037691b	je	0x376910
000000000037691d	leaq	0x1c(%r12), %rsi
0000000000376922	leaq	-0x70(%rbp), %rdi
0000000000376926	movq	%r13, %rdx
0000000000376929	callq	0x6dd644                        ## symbol stub for: __ZN11PCTimeRange14setAsUnionWithERKS_RK6CMTime
000000000037692e	movq	0x8(%r12), %rax
0000000000376933	testq	%rax, %rax
0000000000376936	je	0x376950
0000000000376938	nopl	(%rax,%rax)
0000000000376940	movq	%rax, %r15
0000000000376943	movq	(%rax), %rax
0000000000376946	testq	%rax, %rax
0000000000376949	jne	0x376940
000000000037694b	jmp	0x37695d
000000000037694d	nopl	(%rax)
0000000000376950	movq	0x10(%r12), %r15
0000000000376955	cmpq	(%r15), %r12
0000000000376958	movq	%r15, %r12
000000000037695b	jne	0x376950
000000000037695d	cmpq	%r15, %rbx
0000000000376960	movq	-0xa0(%rbp), %r12
0000000000376967	jne	0x376a16
000000000037696d	leaq	-0x40(%rbp), %rsi
0000000000376971	leaq	-0x70(%rbp), %rdx
0000000000376975	movq	%r12, %rdi
0000000000376978	callq	__ZNSt3__16__treeI11PCTimeRangeNS_4lessIS1_EENS_9allocatorIS1_EEE12__find_equalIS1_EERPNS_16__tree_node_baseIPvEERPNS_15__tree_end_nodeISB_EERKT_ ## std::__1::__tree_node_base<void*>*& std::__1::__tree<PCTimeRange, std::__1::less<PCTimeRange>, std::__1::allocator<PCTimeRange>>::__find_equal<PCTimeRange>(std::__1::__tree_end_node<std::__1::__tree_node_base<void*>*>*&, PCTimeRange const&)
000000000037697d	cmpq	$0x0, (%rax)
0000000000376981	jne	0x3769e3
0000000000376983	movq	%rax, %r14
0000000000376986	movl	$0x50, %edi
000000000037698b	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000376990	movq	-0x60(%rbp), %rcx
0000000000376994	movq	%rcx, 0x2c(%rax)
0000000000376998	movups	-0x70(%rbp), %xmm0
000000000037699c	movups	%xmm0, 0x1c(%rax)
00000000003769a0	movups	-0x58(%rbp), %xmm0
00000000003769a4	movups	%xmm0, 0x34(%rax)
00000000003769a8	movq	-0x48(%rbp), %rcx
00000000003769ac	movq	%rcx, 0x44(%rax)
00000000003769b0	movq	-0x40(%rbp), %rcx
00000000003769b4	xorps	%xmm0, %xmm0
00000000003769b7	movups	%xmm0, (%rax)
00000000003769ba	movq	%rcx, 0x10(%rax)
00000000003769be	movq	%rax, (%r14)
00000000003769c1	movq	(%r12), %rcx
00000000003769c5	movq	(%rcx), %rcx
00000000003769c8	testq	%rcx, %rcx
00000000003769cb	je	0x3769d1
00000000003769cd	movq	%rcx, (%r12)
00000000003769d1	movq	0x8(%r12), %rdi
00000000003769d6	movq	%rax, %rsi
00000000003769d9	callq	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_balance_after_insert[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
00000000003769de	incq	0x10(%r12)
00000000003769e3	xorl	%eax, %eax
00000000003769e5	jmp	0x376a5a
00000000003769e7	nopw	(%rax,%rax)
00000000003769f0	decq	0x10(%r12)
00000000003769f5	movq	0x8(%r12), %rdi
00000000003769fa	movq	%rbx, %rsi
00000000003769fd	callq	__ZNSt3__113__tree_removeB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_remove[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
0000000000376a02	movq	%rbx, %rdi
0000000000376a05	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000376a0a	movq	%r14, %rbx
0000000000376a0d	cmpq	%r15, %r14
0000000000376a10	je	0x37696d
0000000000376a16	movq	0x8(%rbx), %rax
0000000000376a1a	movq	%rbx, %rcx
0000000000376a1d	testq	%rax, %rax
0000000000376a20	je	0x376a40
0000000000376a22	nopw	%cs:(%rax,%rax)
0000000000376a30	movq	%rax, %r14
0000000000376a33	movq	(%rax), %rax
0000000000376a36	testq	%rax, %rax
0000000000376a39	jne	0x376a30
0000000000376a3b	jmp	0x376a4c
0000000000376a3d	nopl	(%rax)
0000000000376a40	movq	0x10(%rcx), %r14
0000000000376a44	cmpq	(%r14), %rcx
0000000000376a47	movq	%r14, %rcx
0000000000376a4a	jne	0x376a40
0000000000376a4c	cmpq	%rbx, (%r12)
0000000000376a50	jne	0x3769f0
0000000000376a52	movq	%r14, (%r12)
0000000000376a56	jmp	0x3769f0
0000000000376a58	movb	$0x1, %al
0000000000376a5a	addq	$0x108, %rsp                    ## imm = 0x108
0000000000376a61	popq	%rbx
0000000000376a62	popq	%r12
0000000000376a64	popq	%r13
0000000000376a66	popq	%r14
0000000000376a68	popq	%r15
0000000000376a6a	popq	%rbp
0000000000376a6b	retq
0000000000376a6c	movq	%r15, %r14
0000000000376a6f	movq	-0xf8(%rbp), %r13
0000000000376a76	leaq	0x18(%r13), %r15
0000000000376a7a	cmpb	$0x0, -0x94(%rbp)
0000000000376a81	jne	0x3766ff
0000000000376a87	jmp	0x37679c
0000000000376a8c	nopl	(%rax)
