__ZN22PixelFormatListManager19getPixelFormatListsEy:
0000000000e3ff30	pushq	%rbp
0000000000e3ff31	movq	%rsp, %rbp
0000000000e3ff34	pushq	%r15
0000000000e3ff36	pushq	%r14
0000000000e3ff38	pushq	%r13
0000000000e3ff3a	pushq	%r12
0000000000e3ff3c	pushq	%rbx
0000000000e3ff3d	subq	$0x58, %rsp
0000000000e3ff41	movq	%rsi, %r14
0000000000e3ff44	movq	%rdi, %rbx
0000000000e3ff47	addq	$0x20, %rdi
0000000000e3ff4b	movq	%rdi, -0x68(%rbp)
0000000000e3ff4f	movb	$0x0, -0x60(%rbp)
0000000000e3ff53	callq	__ZN14Synchronizable4LockEv     ## Synchronizable::Lock()
0000000000e3ff58	leaq	0x10(%rbx), %rax
0000000000e3ff5c	movq	%rax, -0x48(%rbp)
0000000000e3ff60	movq	0x10(%rbx), %rcx
0000000000e3ff64	testq	%rcx, %rcx
0000000000e3ff67	je	0xe3ff96
0000000000e3ff69	movq	-0x48(%rbp), %rax
0000000000e3ff6d	nopl	(%rax)
0000000000e3ff70	xorl	%edx, %edx
0000000000e3ff72	cmpq	%r14, 0x20(%rcx)
0000000000e3ff76	setb	%dl
0000000000e3ff79	cmovaeq	%rcx, %rax
0000000000e3ff7d	movq	(%rcx,%rdx,8), %rcx
0000000000e3ff81	testq	%rcx, %rcx
0000000000e3ff84	jne	0xe3ff70
0000000000e3ff86	cmpq	-0x48(%rbp), %rax
0000000000e3ff8a	je	0xe3ff96
0000000000e3ff8c	cmpq	0x20(%rax), %r14
0000000000e3ff90	jae	0xe40287
0000000000e3ff96	movq	%rbx, -0x78(%rbp)
0000000000e3ff9a	movl	$0x18, %edi
0000000000e3ff9f	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000e3ffa4	movq	%rax, -0x40(%rbp)
0000000000e3ffa8	xorps	%xmm0, %xmm0
0000000000e3ffab	movq	-0x40(%rbp), %rax
0000000000e3ffaf	movups	%xmm0, (%rax)
0000000000e3ffb2	movq	$0x0, 0x10(%rax)
0000000000e3ffba	movl	%r14d, %r13d
0000000000e3ffbd	shrl	$0x8, %r13d
0000000000e3ffc1	andb	$0x3, %r13b
0000000000e3ffc5	movl	%r14d, %edx
0000000000e3ffc8	shrb	$0x6, %dl
0000000000e3ffcb	movl	%r14d, %esi
0000000000e3ffce	shrb	$0x4, %sil
0000000000e3ffd2	andb	$0x3, %sil
0000000000e3ffd6	movl	%r14d, %edi
0000000000e3ffd9	shrb	$0x2, %dil
0000000000e3ffdd	andb	$0x3, %dil
0000000000e3ffe1	movq	%r14, -0x50(%rbp)
0000000000e3ffe5	movl	%r14d, %r8d
0000000000e3ffe8	andb	$0x3, %r8b
0000000000e3ffec	movl	$0x8, %r14d
0000000000e3fff2	xorl	%ebx, %ebx
0000000000e3fff4	leaq	_kSupportedPixelFormats(%rip), %r15
0000000000e3fffb	movabsq	$0x3fffffffffffffff, %r9        ## imm = 0x3FFFFFFFFFFFFFFF
0000000000e40005	movabsq	$0x7ffffffffffffffc, %r10       ## imm = 0x7FFFFFFFFFFFFFFC
0000000000e4000f	xorl	%r11d, %r11d
0000000000e40012	xorl	%r12d, %r12d
0000000000e40015	jmp	0xe40041
0000000000e40017	movl	-0x8(%r14,%r15), %eax
0000000000e4001c	movl	%eax, (%r12)
0000000000e40020	addq	$0x4, %r12
0000000000e40024	movq	-0x40(%rbp), %rax
0000000000e40028	movq	%r12, 0x8(%rax)
0000000000e4002c	nopl	(%rax)
0000000000e40030	addq	$0xc, %r14
0000000000e40034	cmpq	$0x140, %r14                    ## imm = 0x140
0000000000e4003b	je	0xe401a3
0000000000e40041	cmpb	$0x2, %r13b
0000000000e40045	je	0xe40056
0000000000e40047	movzbl	-0x4(%r14,%r15), %eax
0000000000e4004d	cmpb	$0x2, %al
0000000000e4004f	je	0xe40056
0000000000e40051	cmpb	%al, %r13b
0000000000e40054	jne	0xe40030
0000000000e40056	cmpb	$0x2, %dl
0000000000e40059	je	0xe40069
0000000000e4005b	movzbl	-0x3(%r14,%r15), %eax
0000000000e40061	cmpb	$0x2, %al
0000000000e40063	je	0xe40069
0000000000e40065	cmpb	%al, %dl
0000000000e40067	jne	0xe40030
0000000000e40069	cmpb	$0x2, %sil
0000000000e4006d	je	0xe4007e
0000000000e4006f	movzbl	-0x2(%r14,%r15), %eax
0000000000e40075	cmpb	$0x2, %al
0000000000e40077	je	0xe4007e
0000000000e40079	cmpb	%al, %sil
0000000000e4007c	jne	0xe40030
0000000000e4007e	cmpb	$0x2, %dil
0000000000e40082	je	0xe40093
0000000000e40084	movzbl	-0x1(%r14,%r15), %eax
0000000000e4008a	cmpb	$0x2, %al
0000000000e4008c	je	0xe40093
0000000000e4008e	cmpb	%al, %dil
0000000000e40091	jne	0xe40030
0000000000e40093	cmpb	$0x2, %r8b
0000000000e40097	je	0xe400a7
0000000000e40099	movzbl	(%r14,%r15), %eax
0000000000e4009e	cmpb	$0x2, %al
0000000000e400a0	je	0xe400a7
0000000000e400a2	cmpb	%al, %r8b
0000000000e400a5	jne	0xe40030
0000000000e400a7	cmpq	%r11, %r12
0000000000e400aa	jb	0xe40017
0000000000e400b0	subq	%rbx, %r12
0000000000e400b3	movq	%r12, %rax
0000000000e400b6	sarq	$0x2, %rax
0000000000e400ba	movq	%rax, -0x38(%rbp)
0000000000e400be	incq	%rax
0000000000e400c1	movq	%rax, %rcx
0000000000e400c4	shrq	$0x3e, %rcx
0000000000e400c8	jne	0xe40364
0000000000e400ce	movb	%r8b, -0x29(%rbp)
0000000000e400d2	movb	%dil, -0x2a(%rbp)
0000000000e400d6	movb	%sil, -0x2b(%rbp)
0000000000e400da	movb	%dl, -0x2c(%rbp)
0000000000e400dd	subq	%rbx, %r11
0000000000e400e0	movq	%r11, %r15
0000000000e400e3	sarq	%r15
0000000000e400e6	cmpq	%rax, %r15
0000000000e400e9	cmovbeq	%rax, %r15
0000000000e400ed	cmpq	%r10, %r11
0000000000e400f0	cmovaeq	%r9, %r15
0000000000e400f4	cmpq	%r9, %r15
0000000000e400f7	ja	0xe4035d
0000000000e400fd	leaq	(,%r15,4), %rdi
0000000000e40105	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000e4010a	leaq	(%rax,%r12), %rdi
0000000000e4010e	leaq	(%rax,%r15,4), %rcx
0000000000e40112	movq	%rcx, -0x70(%rbp)
0000000000e40116	leaq	_kSupportedPixelFormats(%rip), %r15
0000000000e4011d	movl	-0x8(%r14,%r15), %ecx
0000000000e40122	movl	%ecx, (%rax,%r12)
0000000000e40126	leaq	(%rax,%r12), %rcx
0000000000e4012a	addq	$0x4, %rcx
0000000000e4012e	movq	-0x38(%rbp), %rax
0000000000e40132	shlq	$0x2, %rax
0000000000e40136	subq	%rax, %rdi
0000000000e40139	movq	%rdi, -0x38(%rbp)
0000000000e4013d	movq	%rbx, %rsi
0000000000e40140	movq	%r12, %rdx
0000000000e40143	movq	%rcx, %r12
0000000000e40146	callq	0x14978ba                       ## symbol stub for: _memcpy
0000000000e4014b	movq	-0x70(%rbp), %r11
0000000000e4014f	movq	-0x40(%rbp), %rax
0000000000e40153	movq	-0x38(%rbp), %rcx
0000000000e40157	movq	%rcx, (%rax)
0000000000e4015a	movq	%r12, 0x8(%rax)
0000000000e4015e	movq	%r11, 0x10(%rax)
0000000000e40162	testq	%rbx, %rbx
0000000000e40165	je	0xe40175
0000000000e40167	movq	%rbx, %rdi
0000000000e4016a	movq	%r11, %rbx
0000000000e4016d	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000e40172	movq	%rbx, %r11
0000000000e40175	movq	-0x38(%rbp), %rbx
0000000000e40179	movzbl	-0x2c(%rbp), %edx
0000000000e4017d	movzbl	-0x2b(%rbp), %esi
0000000000e40181	movzbl	-0x2a(%rbp), %edi
0000000000e40185	movzbl	-0x29(%rbp), %r8d
0000000000e4018a	movabsq	$0x3fffffffffffffff, %r9        ## imm = 0x3FFFFFFFFFFFFFFF
0000000000e40194	movabsq	$0x7ffffffffffffffc, %r10       ## imm = 0x7FFFFFFFFFFFFFFC
0000000000e4019e	jmp	0xe40024
0000000000e401a3	movl	$0x10, %edi
0000000000e401a8	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000e401ad	movq	%rax, -0x38(%rbp)
0000000000e401b1	movq	-0x50(%rbp), %r14
0000000000e401b5	subq	%rbx, %r12
0000000000e401b8	sarq	$0x2, %r12
0000000000e401bc	testl	%r12d, %r12d
0000000000e401bf	jle	0xe40283
0000000000e401c5	andl	$0x7fffffff, %r12d              ## imm = 0x7FFFFFFF
0000000000e401cc	leaq	(,%r12,8), %rdi
0000000000e401d4	callq	0x1497446                       ## symbol stub for: __Znam
0000000000e401d9	movq	%rax, %r13
0000000000e401dc	movq	0xaaf425(%rip), %rax            ## literal pool symbol address: _kCFAllocatorDefault
0000000000e401e3	movq	(%rax), %r15
0000000000e401e6	xorl	%r14d, %r14d
0000000000e401e9	nopl	(%rax)
0000000000e401f0	movl	$0x3, %esi
0000000000e401f5	movq	%r15, %rdi
0000000000e401f8	movq	%rbx, %rdx
0000000000e401fb	callq	0x149480c                       ## symbol stub for: _CFNumberCreate
0000000000e40200	movq	%rax, (%r13,%r14,8)
0000000000e40205	incq	%r14
0000000000e40208	addq	$0x4, %rbx
0000000000e4020c	cmpq	%r14, %r12
0000000000e4020f	jne	0xe401f0
0000000000e40211	movq	0xaaf468(%rip), %rcx            ## literal pool symbol address: _kCFTypeArrayCallBacks
0000000000e40218	movq	%r15, %rdi
0000000000e4021b	movq	%r13, %rsi
0000000000e4021e	movq	%r12, %rdx
0000000000e40221	callq	0x14946a4                       ## symbol stub for: _CFArrayCreate
0000000000e40226	movq	%rax, %rbx
0000000000e40229	movq	%rax, -0x58(%rbp)
0000000000e4022d	xorl	%r14d, %r14d
0000000000e40230	movq	(%r13,%r14,8), %rdi
0000000000e40235	callq	0x149484e                       ## symbol stub for: _CFRelease
0000000000e4023a	incq	%r14
0000000000e4023d	cmpq	%r14, %r12
0000000000e40240	jne	0xe40230
0000000000e40242	movq	%r13, %rdi
0000000000e40245	callq	0x14973fe                       ## symbol stub for: __ZdaPv
0000000000e4024a	testq	%rbx, %rbx
0000000000e4024d	je	0xe4029a
0000000000e4024f	movq	0xaaf962(%rip), %rsi            ## literal pool symbol address: _kCVPixelBufferPixelFormatTypeKey
0000000000e40256	movq	0xaaf42b(%rip), %r8             ## literal pool symbol address: _kCFTypeDictionaryKeyCallBacks
0000000000e4025d	movq	0xaaf42c(%rip), %r9             ## literal pool symbol address: _kCFTypeDictionaryValueCallBacks
0000000000e40264	leaq	-0x58(%rbp), %rdx
0000000000e40268	movl	$0x1, %ecx
0000000000e4026d	movq	%r15, %rdi
0000000000e40270	callq	0x149478e                       ## symbol stub for: _CFDictionaryCreate
0000000000e40275	movq	%rax, %rbx
0000000000e40278	movq	-0x58(%rbp), %rdi
0000000000e4027c	callq	0x149484e                       ## symbol stub for: _CFRelease
0000000000e40281	jmp	0xe4029c
0000000000e40283	xorl	%ebx, %ebx
0000000000e40285	jmp	0xe402a0
0000000000e40287	movq	0x28(%rax), %r14
0000000000e4028b	cmpb	$0x0, -0x60(%rbp)
0000000000e4028f	je	0xe40342
0000000000e40295	jmp	0xe4034b
0000000000e4029a	xorl	%ebx, %ebx
0000000000e4029c	movq	-0x50(%rbp), %r14
0000000000e402a0	movq	-0x40(%rbp), %rax
0000000000e402a4	movq	-0x38(%rbp), %rcx
0000000000e402a8	movq	%rax, (%rcx)
0000000000e402ab	movq	%rbx, 0x8(%rcx)
0000000000e402af	movq	-0x48(%rbp), %rcx
0000000000e402b3	movq	(%rcx), %rax
0000000000e402b6	movq	%rcx, %rbx
0000000000e402b9	jmp	0xe402c6
0000000000e402bb	nopl	(%rax,%rax)
0000000000e402c0	movq	(%rbx), %rax
0000000000e402c3	movq	%rbx, %rcx
0000000000e402c6	testq	%rax, %rax
0000000000e402c9	je	0xe402e6
0000000000e402cb	movq	%rax, %rbx
0000000000e402ce	movq	0x20(%rax), %rax
0000000000e402d2	cmpq	%rax, %r14
0000000000e402d5	jb	0xe402c0
0000000000e402d7	jbe	0xe40338
0000000000e402d9	movq	0x8(%rbx), %rax
0000000000e402dd	testq	%rax, %rax
0000000000e402e0	jne	0xe402cb
0000000000e402e2	leaq	0x8(%rbx), %rcx
0000000000e402e6	movq	%rcx, %r15
0000000000e402e9	movl	$0x30, %edi
0000000000e402ee	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000e402f3	movq	%r14, 0x20(%rax)
0000000000e402f7	movq	-0x38(%rbp), %r14
0000000000e402fb	movq	%r14, 0x28(%rax)
0000000000e402ff	xorps	%xmm0, %xmm0
0000000000e40302	movups	%xmm0, (%rax)
0000000000e40305	movq	%rbx, 0x10(%rax)
0000000000e40309	movq	%rax, (%r15)
0000000000e4030c	movq	-0x78(%rbp), %rbx
0000000000e40310	movq	0x8(%rbx), %rcx
0000000000e40314	movq	(%rcx), %rcx
0000000000e40317	testq	%rcx, %rcx
0000000000e4031a	je	0xe40320
0000000000e4031c	movq	%rcx, 0x8(%rbx)
0000000000e40320	movq	0x10(%rbx), %rdi
0000000000e40324	movq	%rax, %rsi
0000000000e40327	callq	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_balance_after_insert[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
0000000000e4032c	incq	0x18(%rbx)
0000000000e40330	cmpb	$0x0, -0x60(%rbp)
0000000000e40334	je	0xe40342
0000000000e40336	jmp	0xe4034b
0000000000e40338	movq	-0x38(%rbp), %r14
0000000000e4033c	cmpb	$0x0, -0x60(%rbp)
0000000000e40340	jne	0xe4034b
0000000000e40342	movq	-0x68(%rbp), %rdi
0000000000e40346	callq	__ZN14Synchronizable6UnlockEv   ## Synchronizable::Unlock()
0000000000e4034b	movq	%r14, %rax
0000000000e4034e	addq	$0x58, %rsp
0000000000e40352	popq	%rbx
0000000000e40353	popq	%r12
0000000000e40355	popq	%r13
0000000000e40357	popq	%r14
0000000000e40359	popq	%r15
0000000000e4035b	popq	%rbp
0000000000e4035c	retq
0000000000e4035d	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
0000000000e40362	jmp	0xe40369
0000000000e40364	callq	__ZNSt3__16vectorIjNS_9allocatorIjEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned int, std::__1::allocator<unsigned int>>::__throw_length_error[abi:nqe210106]()
0000000000e40369	ud2
0000000000e4036b	jmp	0xe40379
0000000000e4036d	movq	%rax, %rdi
0000000000e40370	callq	___clang_call_terminate
0000000000e40375	jmp	0xe40379
0000000000e40377	jmp	0xe4038f
0000000000e40379	movq	%rax, %rbx
0000000000e4037c	leaq	-0x68(%rbp), %rdi
0000000000e40380	callq	__ZN12SynchronizerD1Ev          ## Synchronizer::~Synchronizer()
0000000000e40385	movq	%rbx, %rdi
0000000000e40388	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000e4038d	jmp	0xe4038f
0000000000e4038f	movq	%rax, %rbx
0000000000e40392	movq	-0x38(%rbp), %rdi
0000000000e40396	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000e4039b	leaq	-0x68(%rbp), %rdi
0000000000e4039f	callq	__ZN12SynchronizerD1Ev          ## Synchronizer::~Synchronizer()
0000000000e403a4	movq	%rbx, %rdi
0000000000e403a7	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000e403ac	nopl	(%rax)
