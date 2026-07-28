__ZN13PCSharedMutex11lock_sharedEv:
00000000000ad086	pushq	%rbp
00000000000ad087	movq	%rsp, %rbp
00000000000ad08a	pushq	%r15
00000000000ad08c	pushq	%r14
00000000000ad08e	pushq	%rbx
00000000000ad08f	subq	$0x18, %rsp
00000000000ad093	movq	%rdi, %rbx
00000000000ad096	callq	0xdeada                         ## symbol stub for: _pthread_self
00000000000ad09b	movq	%rax, %r14
00000000000ad09e	movq	%rbx, %rdi
00000000000ad0a1	callq	0xde654                         ## symbol stub for: __ZNSt3__15mutex4lockEv
00000000000ad0a6	movq	0x40(%rbx), %rax
00000000000ad0aa	cmpq	%rax, %r14
00000000000ad0ad	je	0xad10d
00000000000ad0af	movq	0x50(%rbx), %rax
00000000000ad0b3	movq	0x58(%rbx), %rcx
00000000000ad0b7	cmpq	%rcx, %rax
00000000000ad0ba	je	0xad0c7
00000000000ad0bc	cmpq	(%rax), %r14
00000000000ad0bf	je	0xad112
00000000000ad0c1	addq	$0x10, %rax
00000000000ad0c5	jmp	0xad0b7
00000000000ad0c7	leaq	0x50(%rbx), %r15
00000000000ad0cb	movq	%rbx, %rdi
00000000000ad0ce	callq	0xde65a                         ## symbol stub for: __ZNSt3__15mutex6unlockEv
00000000000ad0d3	movq	%rbx, %rdi
00000000000ad0d6	callq	0xde654                         ## symbol stub for: __ZNSt3__15mutex4lockEv
00000000000ad0db	movq	0x40(%rbx), %rax
00000000000ad0df	testq	%rax, %rax
00000000000ad0e2	jne	0xad0cb
00000000000ad0e4	leaq	-0x28(%rbp), %rsi
00000000000ad0e8	movq	%r14, (%rsi)
00000000000ad0eb	movl	$0x1, 0x8(%rsi)
00000000000ad0f2	movq	%r15, %rdi
00000000000ad0f5	callq	__ZNSt3__16vectorIN13PCSharedMutex10ReaderInfoENS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<PCSharedMutex::ReaderInfo, std::__1::allocator<PCSharedMutex::ReaderInfo>>::push_back[abi:nqe210106](PCSharedMutex::ReaderInfo const&)
00000000000ad0fa	movq	%rbx, %rdi
00000000000ad0fd	callq	0xde65a                         ## symbol stub for: __ZNSt3__15mutex6unlockEv
00000000000ad102	addq	$0x18, %rsp
00000000000ad106	popq	%rbx
00000000000ad107	popq	%r14
00000000000ad109	popq	%r15
00000000000ad10b	popq	%rbp
00000000000ad10c	retq
00000000000ad10d	incl	0x48(%rbx)
00000000000ad110	jmp	0xad115
00000000000ad112	incl	0x8(%rax)
00000000000ad115	movq	%rbx, %rdi
00000000000ad118	addq	$0x18, %rsp
00000000000ad11c	popq	%rbx
00000000000ad11d	popq	%r14
00000000000ad11f	popq	%r15
00000000000ad121	popq	%rbp
00000000000ad122	jmp	0xde65a                         ## symbol stub for: __ZNSt3__15mutex6unlockEv
00000000000ad127	movq	%rax, %r14
00000000000ad12a	movq	%rbx, %rdi
00000000000ad12d	callq	0xde65a                         ## symbol stub for: __ZNSt3__15mutex6unlockEv
00000000000ad132	movq	%r14, %rdi
00000000000ad135	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
00000000000ad13a	movq	%rax, %rdi
00000000000ad13d	callq	___clang_call_terminate
