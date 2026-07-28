__ZN22PixelFormatListManagerD2Ev:
0000000000e3fe10	pushq	%rbp
0000000000e3fe11	movq	%rsp, %rbp
0000000000e3fe14	pushq	%r15
0000000000e3fe16	pushq	%r14
0000000000e3fe18	pushq	%r13
0000000000e3fe1a	pushq	%r12
0000000000e3fe1c	pushq	%rbx
0000000000e3fe1d	pushq	%rax
0000000000e3fe1e	movq	%rdi, %rbx
0000000000e3fe21	leaq	0xad7448(%rip), %rax
0000000000e3fe28	movq	%rax, (%rdi)
0000000000e3fe2b	movq	0x8(%rdi), %r13
0000000000e3fe2f	leaq	0x10(%rdi), %r12
0000000000e3fe33	cmpq	%r12, %r13
0000000000e3fe36	jne	0xe3fe68
0000000000e3fe38	leaq	0x8(%rbx), %r14
0000000000e3fe3c	leaq	0x20(%rbx), %rdi
0000000000e3fe40	callq	__ZN14SynchronizableD1Ev        ## Synchronizable::~Synchronizable()
0000000000e3fe45	movq	0x10(%rbx), %rsi
0000000000e3fe49	movq	%r14, %rdi
0000000000e3fe4c	addq	$0x8, %rsp
0000000000e3fe50	popq	%rbx
0000000000e3fe51	popq	%r12
0000000000e3fe53	popq	%r13
0000000000e3fe55	popq	%r14
0000000000e3fe57	popq	%r15
0000000000e3fe59	popq	%rbp
0000000000e3fe5a	jmp	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
0000000000e3fe5f	nop
0000000000e3fe60	movq	%rax, %r13
0000000000e3fe63	cmpq	%r12, %rax
0000000000e3fe66	je	0xe3fe38
0000000000e3fe68	movq	0x28(%r13), %r14
0000000000e3fe6c	testq	%r14, %r14
0000000000e3fe6f	je	0xe3fea8
0000000000e3fe71	movq	(%r14), %r15
0000000000e3fe74	testq	%r15, %r15
0000000000e3fe77	je	0xe3fe92
0000000000e3fe79	movq	(%r15), %rdi
0000000000e3fe7c	testq	%rdi, %rdi
0000000000e3fe7f	je	0xe3fe8a
0000000000e3fe81	movq	%rdi, 0x8(%r15)
0000000000e3fe85	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000e3fe8a	movq	%r15, %rdi
0000000000e3fe8d	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000e3fe92	movq	0x8(%r14), %rdi
0000000000e3fe96	testq	%rdi, %rdi
0000000000e3fe99	je	0xe3fea0
0000000000e3fe9b	callq	0x149484e                       ## symbol stub for: _CFRelease
0000000000e3fea0	movq	%r14, %rdi
0000000000e3fea3	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000e3fea8	movq	0x8(%r13), %rcx
0000000000e3feac	testq	%rcx, %rcx
0000000000e3feaf	je	0xe3fed0
0000000000e3feb1	nopw	%cs:(%rax,%rax)
0000000000e3fec0	movq	%rcx, %rax
0000000000e3fec3	movq	(%rcx), %rcx
0000000000e3fec6	testq	%rcx, %rcx
0000000000e3fec9	jne	0xe3fec0
0000000000e3fecb	jmp	0xe3fe60
0000000000e3fecd	nopl	(%rax)
0000000000e3fed0	movq	0x10(%r13), %rax
0000000000e3fed4	cmpq	(%rax), %r13
0000000000e3fed7	movq	%rax, %r13
0000000000e3feda	jne	0xe3fed0
0000000000e3fedc	jmp	0xe3fe60
0000000000e3fede	movq	%rax, %rdi
0000000000e3fee1	callq	___clang_call_terminate
0000000000e3fee6	nopw	%cs:(%rax,%rax)
