__ZN23FFRecentAverageInterval10push_valueEd:
0000000000d5b510	pushq	%rbp
0000000000d5b511	movq	%rsp, %rbp
0000000000d5b514	pushq	%r14
0000000000d5b516	pushq	%rbx
0000000000d5b517	subq	$0x10, %rsp
0000000000d5b51b	movsd	%xmm0, -0x18(%rbp)
0000000000d5b520	movq	%rdi, %r14
0000000000d5b523	leaq	0x8(%rdi), %rbx
0000000000d5b527	movq	%rbx, %rdi
0000000000d5b52a	callq	0x14973b0                       ## symbol stub for: __ZNSt3__15mutex4lockEv
0000000000d5b52f	movq	0x80(%r14), %rax
0000000000d5b536	cmpq	0x48(%r14), %rax
0000000000d5b53a	jne	0xd5b5c0
0000000000d5b540	movq	0x60(%r14), %rcx
0000000000d5b544	movq	0x78(%r14), %rdx
0000000000d5b548	movq	%rdx, %rsi
0000000000d5b54b	shrq	$0x9, %rsi
0000000000d5b54f	movq	(%rcx,%rsi,8), %rsi
0000000000d5b553	movl	%edx, %edi
0000000000d5b555	andl	$0x1ff, %edi                    ## imm = 0x1FF
0000000000d5b55b	movsd	(%rsi,%rdi,8), %xmm1
0000000000d5b560	decq	%rax
0000000000d5b563	movq	%rax, 0x80(%r14)
0000000000d5b56a	incq	%rdx
0000000000d5b56d	movq	%rdx, 0x78(%r14)
0000000000d5b571	cmpq	$0x400, %rdx                    ## imm = 0x400
0000000000d5b578	jb	0xd5b5ae
0000000000d5b57a	movq	(%rcx), %rdi
0000000000d5b57d	movsd	%xmm1, -0x20(%rbp)
0000000000d5b582	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d5b587	movsd	-0x20(%rbp), %xmm1
0000000000d5b58c	movq	0x60(%r14), %rcx
0000000000d5b590	movq	0x80(%r14), %rax
0000000000d5b597	addq	$0x8, %rcx
0000000000d5b59b	movq	%rcx, 0x60(%r14)
0000000000d5b59f	movq	$-0x200, %rdx                   ## imm = 0xFE00
0000000000d5b5a6	addq	0x78(%r14), %rdx
0000000000d5b5aa	movq	%rdx, 0x78(%r14)
0000000000d5b5ae	movsd	0x50(%r14), %xmm0
0000000000d5b5b4	subsd	%xmm1, %xmm0
0000000000d5b5b8	movsd	%xmm0, 0x50(%r14)
0000000000d5b5be	jmp	0xd5b5ce
0000000000d5b5c0	movsd	0x50(%r14), %xmm0
0000000000d5b5c6	movq	0x60(%r14), %rcx
0000000000d5b5ca	movq	0x78(%r14), %rdx
0000000000d5b5ce	movq	0x68(%r14), %rsi
0000000000d5b5d2	movq	%rsi, %rdi
0000000000d5b5d5	subq	%rcx, %rdi
0000000000d5b5d8	shlq	$0x6, %rdi
0000000000d5b5dc	decq	%rdi
0000000000d5b5df	xorl	%r8d, %r8d
0000000000d5b5e2	cmpq	%rcx, %rsi
0000000000d5b5e5	addsd	-0x18(%rbp), %xmm0
0000000000d5b5ea	movsd	%xmm0, 0x50(%r14)
0000000000d5b5f0	cmovneq	%rdi, %r8
0000000000d5b5f4	addq	%rax, %rdx
0000000000d5b5f7	cmpq	%rdx, %r8
0000000000d5b5fa	jne	0xd5b617
0000000000d5b5fc	leaq	0x58(%r14), %rdi
0000000000d5b600	callq	__ZNSt3__15dequeIdNS_9allocatorIdEEE19__add_back_capacityEv ## std::__1::deque<double, std::__1::allocator<double>>::__add_back_capacity()
0000000000d5b605	movq	0x60(%r14), %rcx
0000000000d5b609	movq	0x80(%r14), %rax
0000000000d5b610	movq	0x78(%r14), %rdx
0000000000d5b614	addq	%rax, %rdx
0000000000d5b617	movq	%rdx, %rsi
0000000000d5b61a	shrq	$0x9, %rsi
0000000000d5b61e	movq	(%rcx,%rsi,8), %rcx
0000000000d5b622	andl	$0x1ff, %edx                    ## imm = 0x1FF
0000000000d5b628	movsd	-0x18(%rbp), %xmm0
0000000000d5b62d	movsd	%xmm0, (%rcx,%rdx,8)
0000000000d5b632	incq	%rax
0000000000d5b635	movq	%rax, 0x80(%r14)
0000000000d5b63c	movq	%rbx, %rdi
0000000000d5b63f	addq	$0x10, %rsp
0000000000d5b643	popq	%rbx
0000000000d5b644	popq	%r14
0000000000d5b646	popq	%rbp
0000000000d5b647	jmp	0x14973b6                       ## symbol stub for: __ZNSt3__15mutex6unlockEv
0000000000d5b64c	movq	%rax, %r14
0000000000d5b64f	movq	%rbx, %rdi
0000000000d5b652	callq	0x14973b6                       ## symbol stub for: __ZNSt3__15mutex6unlockEv
0000000000d5b657	movq	%r14, %rdi
0000000000d5b65a	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000d5b65f	nop
