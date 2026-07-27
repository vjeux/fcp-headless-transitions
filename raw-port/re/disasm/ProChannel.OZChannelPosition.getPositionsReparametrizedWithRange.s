__ZN17OZChannelPosition35getPositionsReparametrizedWithRangeERK6CMTimedRNSt3__16vectorIdNS3_9allocatorIdEEEES8_S8_P14PCMatrix44TmplIdE:
0000000000076362	pushq	%rbp
0000000000076363	movq	%rsp, %rbp
0000000000076366	pushq	%r15
0000000000076368	pushq	%r14
000000000007636a	pushq	%r13
000000000007636c	pushq	%r12
000000000007636e	pushq	%rbx
000000000007636f	subq	$0x98, %rsp
0000000000076376	movq	%r9, %r14
0000000000076379	movq	%r8, -0x48(%rbp)
000000000007637d	movq	%rcx, -0x58(%rbp)
0000000000076381	movq	%rdx, -0x50(%rbp)
0000000000076385	movapd	%xmm0, -0x70(%rbp)
000000000007638a	movq	%rdi, %r15
000000000007638d	leaq	-0x7c(%rbp), %rax
0000000000076391	movl	$0x0, (%rax)
0000000000076397	xorl	%r12d, %r12d
000000000007639a	leaq	-0xa8(%rbp), %rax
00000000000763a1	movq	%r12, (%rax)
00000000000763a4	leaq	-0xa0(%rbp), %rax
00000000000763ab	movq	%r12, (%rax)
00000000000763ae	leaq	-0x98(%rbp), %rax
00000000000763b5	movq	%r12, (%rax)
00000000000763b8	leaq	-0xb8(%rbp), %r13
00000000000763bf	movq	%r12, (%r13)
00000000000763c3	leaq	0x2bc(%rdi), %rbx
00000000000763ca	movq	%rbx, %rdi
00000000000763cd	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
00000000000763d2	movq	%r14, (%rsp)
00000000000763d6	movq	%r15, %rdi
00000000000763d9	leaq	-0x98(%rbp), %rsi
00000000000763e0	leaq	-0xa8(%rbp), %rdx
00000000000763e7	leaq	-0xa0(%rbp), %rcx
00000000000763ee	movq	%r13, %r8
00000000000763f1	leaq	-0x7c(%rbp), %r14
00000000000763f5	movq	%r14, %r9
00000000000763f8	callq	__ZN17OZChannelPosition16getCachedVectorsEPPdS1_S1_S1_PiP14PCMatrix44TmplIdE ## OZChannelPosition::getCachedVectors(double**, double**, double**, double**, int*, PCMatrix44Tmpl<double>*)
00000000000763fd	movq	%rbx, %rdi
0000000000076400	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
0000000000076405	movslq	(%r14), %r15
0000000000076408	movq	(%r13), %r14
000000000007640c	xorpd	%xmm0, %xmm0
0000000000076410	cmpq	$0x2, %r15
0000000000076414	jl	0x7641d
0000000000076416	movsd	-0x8(%r14,%r15,8), %xmm0
000000000007641d	movsd	%xmm0, -0x90(%rbp)
0000000000076425	movapd	-0x70(%rbp), %xmm1
000000000007642a	divsd	%xmm1, %xmm0
000000000007642e	movsd	%xmm0, -0xb0(%rbp)
0000000000076436	cvttsd2si	%xmm1, %rax
000000000007643b	movq	%rax, %rcx
000000000007643e	sarq	$0x3f, %rcx
0000000000076442	subsd	0x3b14e(%rip), %xmm1
000000000007644a	cvttsd2si	%xmm1, %rbx
000000000007644f	andq	%rcx, %rbx
0000000000076452	orq	%rax, %rbx
0000000000076455	movq	-0x50(%rbp), %rdi
0000000000076459	movq	%rbx, %rsi
000000000007645c	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE7reserveEm ## std::__1::vector<double, std::__1::allocator<double>>::reserve(unsigned long)
0000000000076461	movq	-0x58(%rbp), %rdi
0000000000076465	movq	%rbx, %rsi
0000000000076468	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE7reserveEm ## std::__1::vector<double, std::__1::allocator<double>>::reserve(unsigned long)
000000000007646d	movq	-0x48(%rbp), %rdi
0000000000076471	movq	%rbx, %rsi
0000000000076474	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE7reserveEm ## std::__1::vector<double, std::__1::allocator<double>>::reserve(unsigned long)
0000000000076479	movsd	-0x90(%rbp), %xmm1
0000000000076481	movq	-0x98(%rbp), %rbx
0000000000076488	movq	-0xa8(%rbp), %rax
000000000007648f	movq	%rax, -0x38(%rbp)
0000000000076493	movb	$0x1, %al
0000000000076495	movq	-0xa0(%rbp), %rcx
000000000007649c	movq	%rcx, -0x40(%rbp)
00000000000764a0	movapd	0x39ee8(%rip), %xmm4
00000000000764a8	movsd	0x39f00(%rip), %xmm5
00000000000764b0	movq	%rbx, -0x78(%rbp)
00000000000764b4	movq	%r15, -0x88(%rbp)
00000000000764bb	xorpd	%xmm3, %xmm3
00000000000764bf	ucomisd	%xmm3, %xmm1
00000000000764c3	ja	0x764db
00000000000764c5	movapd	%xmm3, %xmm0
00000000000764c9	subsd	%xmm1, %xmm0
00000000000764cd	andpd	%xmm4, %xmm0
00000000000764d1	ucomisd	%xmm0, %xmm5
00000000000764d5	jbe	0x767e5
00000000000764db	movslq	%r12d, %r13
00000000000764de	movsd	(%r14,%r13,8), %xmm0
00000000000764e4	movapd	%xmm3, %xmm1
00000000000764e8	subsd	%xmm0, %xmm1
00000000000764ec	movapd	%xmm1, %xmm2
00000000000764f0	andpd	%xmm4, %xmm2
00000000000764f4	ucomisd	%xmm2, %xmm5
00000000000764f8	ja	0x76542
00000000000764fa	cmpl	%r15d, %r12d
00000000000764fd	jge	0x76522
00000000000764ff	leaq	(%r14,%r13,8), %rax
0000000000076503	movq	%r15, %rdx
0000000000076506	subq	%r13, %rdx
0000000000076509	xorl	%ecx, %ecx
000000000007650b	ucomisd	(%rax,%rcx,8), %xmm3
0000000000076510	jbe	0x7651f
0000000000076512	incq	%rcx
0000000000076515	cmpq	%rcx, %rdx
0000000000076518	jne	0x7650b
000000000007651a	movl	%r15d, %r12d
000000000007651d	jmp	0x76522
000000000007651f	addl	%ecx, %r12d
0000000000076522	movslq	%r12d, %r13
0000000000076525	decl	%r12d
0000000000076528	movsd	-0x8(%r14,%r13,8), %xmm0
000000000007652f	decq	%r13
0000000000076532	movapd	%xmm3, %xmm1
0000000000076536	subsd	%xmm0, %xmm1
000000000007653a	movapd	%xmm1, %xmm2
000000000007653e	andpd	%xmm4, %xmm2
0000000000076542	ucomisd	%xmm2, %xmm5
0000000000076546	jbe	0x76596
0000000000076548	leaq	(%rbx,%r13,8), %rsi
000000000007654c	movq	-0x48(%rbp), %rdi
0000000000076550	movsd	%xmm3, -0x70(%rbp)
0000000000076555	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
000000000007655a	movq	-0x38(%rbp), %rax
000000000007655e	leaq	(%rax,%r13,8), %rsi
0000000000076562	movq	-0x50(%rbp), %rdi
0000000000076566	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
000000000007656b	movq	-0x40(%rbp), %rax
000000000007656f	leaq	(%rax,%r13,8), %rsi
0000000000076573	movq	-0x58(%rbp), %rdi
0000000000076577	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
000000000007657c	movsd	0x39e2c(%rip), %xmm5
0000000000076584	movapd	0x39e04(%rip), %xmm4
000000000007658c	movsd	-0x70(%rbp), %xmm3
0000000000076591	jmp	0x767ce
0000000000076596	ucomisd	%xmm3, %xmm0
000000000007659a	jbe	0x76683
00000000000765a0	movslq	%r12d, %rbx
00000000000765a3	movsd	-0x8(%r14,%rbx,8), %xmm1
00000000000765aa	subsd	%xmm1, %xmm0
00000000000765ae	movapd	%xmm0, %xmm2
00000000000765b2	andpd	%xmm4, %xmm2
00000000000765b6	ucomisd	%xmm2, %xmm5
00000000000765ba	movsd	%xmm3, -0x70(%rbp)
00000000000765bf	ja	0x766ae
00000000000765c5	decq	%rbx
00000000000765c8	movapd	%xmm3, %xmm2
00000000000765cc	subsd	%xmm1, %xmm2
00000000000765d0	movq	-0x78(%rbp), %r15
00000000000765d4	movsd	(%r15,%r13,8), %xmm1
00000000000765da	movsd	(%r15,%rbx,8), %xmm3
00000000000765e0	subsd	%xmm3, %xmm1
00000000000765e4	divsd	%xmm0, %xmm1
00000000000765e8	mulsd	%xmm2, %xmm1
00000000000765ec	addsd	%xmm3, %xmm1
00000000000765f0	movsd	%xmm1, -0x30(%rbp)
00000000000765f5	movq	-0x48(%rbp), %rdi
00000000000765f9	leaq	-0x30(%rbp), %rsi
00000000000765fd	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
0000000000076602	movsd	(%r14,%rbx,8), %xmm0
0000000000076608	movsd	-0x70(%rbp), %xmm1
000000000007660d	subsd	%xmm0, %xmm1
0000000000076611	movq	-0x38(%rbp), %rax
0000000000076615	movsd	(%rax,%r13,8), %xmm2
000000000007661b	movsd	(%rax,%rbx,8), %xmm3
0000000000076620	subsd	%xmm3, %xmm2
0000000000076624	movsd	(%r14,%r13,8), %xmm4
000000000007662a	subsd	%xmm0, %xmm4
000000000007662e	divsd	%xmm4, %xmm2
0000000000076632	mulsd	%xmm1, %xmm2
0000000000076636	addsd	%xmm3, %xmm2
000000000007663a	movsd	%xmm2, -0x30(%rbp)
000000000007663f	movq	-0x50(%rbp), %rdi
0000000000076643	leaq	-0x30(%rbp), %rsi
0000000000076647	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
000000000007664c	movsd	(%r14,%rbx,8), %xmm0
0000000000076652	movsd	-0x70(%rbp), %xmm1
0000000000076657	subsd	%xmm0, %xmm1
000000000007665b	movq	-0x40(%rbp), %rax
000000000007665f	movsd	(%rax,%r13,8), %xmm2
0000000000076665	movsd	(%rax,%rbx,8), %xmm3
000000000007666a	movq	%r15, %rbx
000000000007666d	movq	-0x88(%rbp), %r15
0000000000076674	subsd	%xmm3, %xmm2
0000000000076678	movsd	(%r14,%r13,8), %xmm4
000000000007667e	jmp	0x76797
0000000000076683	ucomisd	%xmm0, %xmm3
0000000000076687	jbe	0x767ce
000000000007668d	movsd	%xmm3, -0x70(%rbp)
0000000000076692	movslq	%r12d, %rbx
0000000000076695	movsd	0x8(%r14,%rbx,8), %xmm2
000000000007669c	subsd	%xmm0, %xmm2
00000000000766a0	movapd	%xmm2, %xmm0
00000000000766a4	andpd	%xmm4, %xmm0
00000000000766a8	ucomisd	%xmm0, %xmm5
00000000000766ac	jbe	0x766e6
00000000000766ae	movq	-0x78(%rbp), %rbx
00000000000766b2	leaq	(%rbx,%r13,8), %rsi
00000000000766b6	movq	-0x48(%rbp), %rdi
00000000000766ba	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
00000000000766bf	movq	-0x38(%rbp), %rax
00000000000766c3	leaq	(%rax,%r13,8), %rsi
00000000000766c7	movq	-0x50(%rbp), %rdi
00000000000766cb	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
00000000000766d0	movq	-0x40(%rbp), %rax
00000000000766d4	leaq	(%rax,%r13,8), %rsi
00000000000766d8	movq	-0x58(%rbp), %rdi
00000000000766dc	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
00000000000766e1	jmp	0x767b9
00000000000766e6	incq	%rbx
00000000000766e9	movq	-0x78(%rbp), %r15
00000000000766ed	movsd	(%r15,%rbx,8), %xmm0
00000000000766f3	movsd	(%r15,%r13,8), %xmm3
00000000000766f9	subsd	%xmm3, %xmm0
00000000000766fd	divsd	%xmm2, %xmm0
0000000000076701	mulsd	%xmm0, %xmm1
0000000000076705	addsd	%xmm3, %xmm1
0000000000076709	movsd	%xmm1, -0x30(%rbp)
000000000007670e	movq	-0x48(%rbp), %rdi
0000000000076712	leaq	-0x30(%rbp), %rsi
0000000000076716	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
000000000007671b	movsd	(%r14,%r13,8), %xmm0
0000000000076721	movsd	-0x70(%rbp), %xmm1
0000000000076726	subsd	%xmm0, %xmm1
000000000007672a	movq	-0x38(%rbp), %rax
000000000007672e	movsd	(%rax,%rbx,8), %xmm2
0000000000076733	movsd	(%rax,%r13,8), %xmm3
0000000000076739	subsd	%xmm3, %xmm2
000000000007673d	movsd	(%r14,%rbx,8), %xmm4
0000000000076743	subsd	%xmm0, %xmm4
0000000000076747	divsd	%xmm4, %xmm2
000000000007674b	mulsd	%xmm1, %xmm2
000000000007674f	addsd	%xmm3, %xmm2
0000000000076753	movsd	%xmm2, -0x30(%rbp)
0000000000076758	movq	-0x50(%rbp), %rdi
000000000007675c	leaq	-0x30(%rbp), %rsi
0000000000076760	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
0000000000076765	movsd	(%r14,%r13,8), %xmm0
000000000007676b	movsd	-0x70(%rbp), %xmm1
0000000000076770	subsd	%xmm0, %xmm1
0000000000076774	movq	-0x40(%rbp), %rax
0000000000076778	movsd	(%rax,%rbx,8), %xmm2
000000000007677d	movsd	(%rax,%r13,8), %xmm3
0000000000076783	subsd	%xmm3, %xmm2
0000000000076787	movsd	(%r14,%rbx,8), %xmm4
000000000007678d	movq	%r15, %rbx
0000000000076790	movq	-0x88(%rbp), %r15
0000000000076797	subsd	%xmm0, %xmm4
000000000007679b	divsd	%xmm4, %xmm2
000000000007679f	mulsd	%xmm1, %xmm2
00000000000767a3	addsd	%xmm3, %xmm2
00000000000767a7	movsd	%xmm2, -0x30(%rbp)
00000000000767ac	movq	-0x58(%rbp), %rdi
00000000000767b0	leaq	-0x30(%rbp), %rsi
00000000000767b4	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
00000000000767b9	movsd	-0x70(%rbp), %xmm3
00000000000767be	movapd	0x39bca(%rip), %xmm4
00000000000767c6	movsd	0x39be2(%rip), %xmm5
00000000000767ce	addsd	-0xb0(%rbp), %xmm3
00000000000767d6	xorl	%eax, %eax
00000000000767d8	movsd	-0x90(%rbp), %xmm1
00000000000767e0	jmp	0x764bf
00000000000767e5	testl	%r15d, %r15d
00000000000767e8	setne	%cl
00000000000767eb	testb	%al, %cl
00000000000767ed	je	0x7681d
00000000000767ef	movq	-0x48(%rbp), %rdi
00000000000767f3	movq	%rbx, %rsi
00000000000767f6	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
00000000000767fb	movq	-0x50(%rbp), %rdi
00000000000767ff	movq	-0x38(%rbp), %r12
0000000000076803	movq	%r12, %rsi
0000000000076806	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
000000000007680b	movq	-0x58(%rbp), %rdi
000000000007680f	movq	-0x40(%rbp), %r15
0000000000076813	movq	%r15, %rsi
0000000000076816	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
000000000007681b	jmp	0x7682a
000000000007681d	movq	-0x38(%rbp), %r12
0000000000076821	testq	%r12, %r12
0000000000076824	movq	-0x40(%rbp), %r15
0000000000076828	je	0x76832
000000000007682a	movq	%r12, %rdi
000000000007682d	callq	0xacdfe                         ## symbol stub for: __ZdaPv
0000000000076832	testq	%r15, %r15
0000000000076835	je	0x7683f
0000000000076837	movq	%r15, %rdi
000000000007683a	callq	0xacdfe                         ## symbol stub for: __ZdaPv
000000000007683f	testq	%rbx, %rbx
0000000000076842	je	0x7684c
0000000000076844	movq	%rbx, %rdi
0000000000076847	callq	0xacdfe                         ## symbol stub for: __ZdaPv
000000000007684c	testq	%r14, %r14
000000000007684f	je	0x76859
0000000000076851	movq	%r14, %rdi
0000000000076854	callq	0xacdfe                         ## symbol stub for: __ZdaPv
0000000000076859	xorl	%eax, %eax
000000000007685b	addq	$0x98, %rsp
0000000000076862	popq	%rbx
0000000000076863	popq	%r12
0000000000076865	popq	%r13
0000000000076867	popq	%r14
0000000000076869	popq	%r15
000000000007686b	popq	%rbp
000000000007686c	retq
000000000007686d	nop
