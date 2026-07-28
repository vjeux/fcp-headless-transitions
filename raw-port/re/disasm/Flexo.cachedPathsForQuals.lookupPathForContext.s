__ZN19cachedPathsForQuals20lookupPathForContextEP10FFProviderP11FFSVContext:
0000000000fc7520	pushq	%rbp
0000000000fc7521	movq	%rsp, %rbp
0000000000fc7524	pushq	%r15
0000000000fc7526	pushq	%r14
0000000000fc7528	pushq	%r13
0000000000fc752a	pushq	%r12
0000000000fc752c	pushq	%rbx
0000000000fc752d	subq	$0x18, %rsp
0000000000fc7531	movq	%rdx, %r14
0000000000fc7534	movq	%rsi, -0x38(%rbp)
0000000000fc7538	movq	%rdi, %rbx
0000000000fc753b	callq	_FFThreadBlockTallyGetCurrent
0000000000fc7540	movq	%rax, %rdi
0000000000fc7543	callq	_FFThreadBlockTallyStartTimer
0000000000fc7548	movq	0xc015d1(%rip), %rsi
0000000000fc754f	movq	0x92616a(%rip), %r15            ## Objc message: -[%rdi arranged]
0000000000fc7556	movq	%r14, %rdi
0000000000fc7559	callq	*%r15
0000000000fc755c	movl	%eax, %r12d
0000000000fc755f	leaq	_OBJC_CLASS_$_FFProject(%rip), %rdi
0000000000fc7566	movq	0xc034f3(%rip), %rsi
0000000000fc756d	movl	%eax, %edx
0000000000fc756f	callq	*%r15
0000000000fc7572	movq	%rax, %r14
0000000000fc7575	leaq	0x8(%rbx), %r15
0000000000fc7579	movq	0x8(%rbx), %rax
0000000000fc757d	testq	%rax, %rax
0000000000fc7580	je	0xfc75b5
0000000000fc7582	movq	%r15, %r13
0000000000fc7585	nopw	%cs:(%rax,%rax)
0000000000fc7590	xorl	%ecx, %ecx
0000000000fc7592	cmpq	%r14, 0x20(%rax)
0000000000fc7596	setb	%cl
0000000000fc7599	cmovaeq	%rax, %r13
0000000000fc759d	movq	(%rax,%rcx,8), %rax
0000000000fc75a1	testq	%rax, %rax
0000000000fc75a4	jne	0xfc7590
0000000000fc75a6	cmpq	%r15, %r13
0000000000fc75a9	je	0xfc75b5
0000000000fc75ab	cmpq	0x20(%r13), %r14
0000000000fc75af	jae	0xfc76a6
0000000000fc75b5	leaq	_OBJC_CLASS_$_FFProject(%rip), %rax
0000000000fc75bc	movq	%rax, -0x30(%rbp)
0000000000fc75c0	movq	0xbf2739(%rip), %rsi
0000000000fc75c7	movq	-0x38(%rbp), %rdi
0000000000fc75cb	movq	0x9260ee(%rip), %r13            ## Objc message: -[%rdi arranged]
0000000000fc75d2	callq	*%r13
0000000000fc75d5	movq	0xc100d4(%rip), %rsi
0000000000fc75dc	movq	-0x30(%rbp), %rdi
0000000000fc75e0	movq	%rax, %rdx
0000000000fc75e3	movl	%r12d, %ecx
0000000000fc75e6	callq	*%r13
0000000000fc75e9	movq	%rax, %r12
0000000000fc75ec	movq	%rax, %rdi
0000000000fc75ef	callq	*0x92611b(%rip)                 ## literal pool symbol address: _objc_retain
0000000000fc75f5	movq	(%r15), %rcx
0000000000fc75f8	movq	%r15, %r13
0000000000fc75fb	jmp	0xfc7607
0000000000fc75fd	nopl	(%rax)
0000000000fc7600	movq	(%r13), %rcx
0000000000fc7604	movq	%r13, %r15
0000000000fc7607	testq	%rcx, %rcx
0000000000fc760a	je	0xfc7627
0000000000fc760c	movq	%rcx, %r13
0000000000fc760f	movq	0x20(%rcx), %rcx
0000000000fc7613	cmpq	%rcx, %r14
0000000000fc7616	jb	0xfc7600
0000000000fc7618	jbe	0xfc767e
0000000000fc761a	movq	0x8(%r13), %rcx
0000000000fc761e	testq	%rcx, %rcx
0000000000fc7621	jne	0xfc760c
0000000000fc7623	leaq	0x8(%r13), %r15
0000000000fc7627	movq	%rax, -0x30(%rbp)
0000000000fc762b	movq	%r12, -0x38(%rbp)
0000000000fc762f	movq	%r13, %r12
0000000000fc7632	movl	$0x30, %edi
0000000000fc7637	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000fc763c	movq	%rax, %r13
0000000000fc763f	movq	%r14, 0x20(%rax)
0000000000fc7643	movq	$0x0, 0x28(%rax)
0000000000fc764b	xorps	%xmm0, %xmm0
0000000000fc764e	movups	%xmm0, (%rax)
0000000000fc7651	movq	%r12, 0x10(%rax)
0000000000fc7655	movq	%rax, (%r15)
0000000000fc7658	movq	(%rbx), %rax
0000000000fc765b	movq	(%rax), %rax
0000000000fc765e	testq	%rax, %rax
0000000000fc7661	je	0xfc7666
0000000000fc7663	movq	%rax, (%rbx)
0000000000fc7666	movq	0x8(%rbx), %rdi
0000000000fc766a	movq	%r13, %rsi
0000000000fc766d	callq	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_balance_after_insert[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
0000000000fc7672	incq	0x10(%rbx)
0000000000fc7676	movq	-0x38(%rbp), %r12
0000000000fc767a	movq	-0x30(%rbp), %rax
0000000000fc767e	movq	%rax, 0x28(%r13)
0000000000fc7682	callq	_FFThreadBlockTallyGetCurrent
0000000000fc7687	movq	%rax, %rdi
0000000000fc768a	movl	$0x14, %esi
0000000000fc768f	callq	_FFThreadBlockTallyStopTimer
0000000000fc7694	movq	%r12, %rax
0000000000fc7697	addq	$0x18, %rsp
0000000000fc769b	popq	%rbx
0000000000fc769c	popq	%r12
0000000000fc769e	popq	%r13
0000000000fc76a0	popq	%r14
0000000000fc76a2	popq	%r15
0000000000fc76a4	popq	%rbp
0000000000fc76a5	retq
0000000000fc76a6	callq	_FFThreadBlockTallyGetCurrent
0000000000fc76ab	movq	%rax, %rdi
0000000000fc76ae	movl	$0x14, %esi
0000000000fc76b3	callq	_FFThreadBlockTallyStopTimer
0000000000fc76b8	movq	0x28(%r13), %r12
0000000000fc76bc	jmp	0xfc7694
0000000000fc76be	nop
