__ZN34FFActiveVAMLBackgroundMattingCache21CleanupZeroedWeakRefsEv:
0000000000684720	pushq	%rbp
0000000000684721	movq	%rsp, %rbp
0000000000684724	pushq	%r15
0000000000684726	pushq	%r14
0000000000684728	pushq	%r13
000000000068472a	pushq	%r12
000000000068472c	pushq	%rbx
000000000068472d	subq	$0x28, %rsp
0000000000684731	movq	%rdi, %rbx
0000000000684734	leaq	-0x30(%rbp), %rdi
0000000000684738	callq	0x14965f4                       ## symbol stub for: __ZN17PCAutoreleasePoolC1Ev
000000000068473d	movq	%rbx, -0x40(%rbp)
0000000000684741	movb	$0x0, -0x38(%rbp)
0000000000684745	movq	%rbx, %rdi
0000000000684748	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
000000000068474d	movq	0x90(%rbx), %r14
0000000000684754	leaq	0x98(%rbx), %r13
000000000068475b	cmpq	%r13, %r14
000000000068475e	je	0x68484e
0000000000684764	movq	0x1535545(%rip), %r12
000000000068476b	movq	%r13, -0x48(%rbp)
000000000068476f	jmp	0x6847bd
0000000000684771	nopw	%cs:(%rax,%rax)
0000000000684780	leaq	0x30(%r14), %r12
0000000000684784	decq	0xa0(%rbx)
000000000068478b	movq	0x98(%rbx), %rdi
0000000000684792	movq	%r14, %rsi
0000000000684795	callq	__ZNSt3__113__tree_removeB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_remove[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
000000000068479a	movq	%r12, %rdi
000000000068479d	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
00000000006847a2	movq	%r14, %rdi
00000000006847a5	callq	0x1497404                       ## symbol stub for: __ZdlPv
00000000006847aa	movq	%r13, %r12
00000000006847ad	movq	-0x48(%rbp), %r13
00000000006847b1	movq	%r15, %r14
00000000006847b4	cmpq	%r13, %r15
00000000006847b7	je	0x684848
00000000006847bd	movq	0x30(%r14), %rdi
00000000006847c1	movq	%r12, %rsi
00000000006847c4	callq	*0x1268ef6(%rip)                ## Objc message: -[%rdi skipFcpTrackerResultSmoothing]
00000000006847ca	movq	0x8(%r14), %rcx
00000000006847ce	testq	%rax, %rax
00000000006847d1	je	0x684800
00000000006847d3	testq	%rcx, %rcx
00000000006847d6	je	0x6847f0
00000000006847d8	nopl	(%rax,%rax)
00000000006847e0	movq	%rcx, %r15
00000000006847e3	movq	(%rcx), %rcx
00000000006847e6	testq	%rcx, %rcx
00000000006847e9	jne	0x6847e0
00000000006847eb	jmp	0x6847b1
00000000006847ed	nopl	(%rax)
00000000006847f0	movq	0x10(%r14), %r15
00000000006847f4	cmpq	(%r15), %r14
00000000006847f7	movq	%r15, %r14
00000000006847fa	jne	0x6847f0
00000000006847fc	jmp	0x6847b1
00000000006847fe	nop
0000000000684800	movq	%r14, %rax
0000000000684803	testq	%rcx, %rcx
0000000000684806	je	0x684820
0000000000684808	nopl	(%rax,%rax)
0000000000684810	movq	%rcx, %r15
0000000000684813	movq	(%rcx), %rcx
0000000000684816	testq	%rcx, %rcx
0000000000684819	jne	0x684810
000000000068481b	jmp	0x68482c
000000000068481d	nopl	(%rax)
0000000000684820	movq	0x10(%rax), %r15
0000000000684824	cmpq	(%r15), %rax
0000000000684827	movq	%r15, %rax
000000000068482a	jne	0x684820
000000000068482c	movq	%r12, %r13
000000000068482f	cmpq	%r14, 0x90(%rbx)
0000000000684836	jne	0x684780
000000000068483c	movq	%r15, 0x90(%rbx)
0000000000684843	jmp	0x684780
0000000000684848	cmpb	$0x0, -0x38(%rbp)
000000000068484c	jne	0x684857
000000000068484e	movq	-0x40(%rbp), %rdi
0000000000684852	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
0000000000684857	leaq	-0x30(%rbp), %rdi
000000000068485b	callq	0x14965fa                       ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
0000000000684860	addq	$0x28, %rsp
0000000000684864	popq	%rbx
0000000000684865	popq	%r12
0000000000684867	popq	%r13
0000000000684869	popq	%r14
000000000068486b	popq	%r15
000000000068486d	popq	%rbp
000000000068486e	retq
000000000068486f	movq	%rax, %rdi
0000000000684872	callq	___clang_call_terminate
0000000000684877	movq	%rax, %rbx
000000000068487a	leaq	-0x30(%rbp), %rdi
000000000068487e	callq	0x14965fa                       ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
0000000000684883	movq	%rbx, %rdi
0000000000684886	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000068488b	movq	%rax, %rdi
000000000068488e	callq	___clang_call_terminate
0000000000684893	movq	%rax, %rbx
0000000000684896	leaq	-0x40(%rbp), %rdi
000000000068489a	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
000000000068489f	leaq	-0x30(%rbp), %rdi
00000000006848a3	callq	0x14965fa                       ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
00000000006848a8	movq	%rbx, %rdi
00000000006848ab	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
