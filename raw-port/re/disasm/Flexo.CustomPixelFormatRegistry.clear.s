__ZN25CustomPixelFormatRegistry5clearEv:
00000000012e2970	pushq	%rbp
00000000012e2971	movq	%rsp, %rbp
00000000012e2974	pushq	%r15
00000000012e2976	pushq	%r14
00000000012e2978	pushq	%r13
00000000012e297a	pushq	%r12
00000000012e297c	pushq	%rbx
00000000012e297d	subq	$0x18, %rsp
00000000012e2981	movq	%rdi, %r14
00000000012e2984	movq	(%rdi), %rbx
00000000012e2987	movq	%rbx, -0x38(%rbp)
00000000012e298b	movb	$0x0, -0x30(%rbp)
00000000012e298f	movq	%rbx, %rdi
00000000012e2992	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
00000000012e2997	movq	0x8(%r14), %r13
00000000012e299b	leaq	0x10(%r14), %r15
00000000012e299f	cmpq	%r15, %r13
00000000012e29a2	je	0x12e29ee
00000000012e29a4	movq	0x60ad5d(%rip), %r12            ## literal pool symbol address: _objc_release
00000000012e29ab	jmp	0x12e29b8
00000000012e29ad	nopl	(%rax)
00000000012e29b0	movq	%rax, %r13
00000000012e29b3	cmpq	%r15, %rax
00000000012e29b6	je	0x12e29ee
00000000012e29b8	movq	0x28(%r13), %rdi
00000000012e29bc	callq	*%r12
00000000012e29bf	movq	0x8(%r13), %rcx
00000000012e29c3	testq	%rcx, %rcx
00000000012e29c6	je	0x12e29e0
00000000012e29c8	nopl	(%rax,%rax)
00000000012e29d0	movq	%rcx, %rax
00000000012e29d3	movq	(%rcx), %rcx
00000000012e29d6	testq	%rcx, %rcx
00000000012e29d9	jne	0x12e29d0
00000000012e29db	jmp	0x12e29b0
00000000012e29dd	nopl	(%rax)
00000000012e29e0	movq	0x10(%r13), %rax
00000000012e29e4	cmpq	(%rax), %r13
00000000012e29e7	movq	%rax, %r13
00000000012e29ea	jne	0x12e29e0
00000000012e29ec	jmp	0x12e29b0
00000000012e29ee	leaq	0x8(%r14), %rdi
00000000012e29f2	movq	0x10(%r14), %rsi
00000000012e29f6	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
00000000012e29fb	movq	%r15, 0x8(%r14)
00000000012e29ff	xorps	%xmm0, %xmm0
00000000012e2a02	movups	%xmm0, 0x10(%r14)
00000000012e2a07	movq	%rbx, %rdi
00000000012e2a0a	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
00000000012e2a0f	addq	$0x18, %rsp
00000000012e2a13	popq	%rbx
00000000012e2a14	popq	%r12
00000000012e2a16	popq	%r13
00000000012e2a18	popq	%r14
00000000012e2a1a	popq	%r15
00000000012e2a1c	popq	%rbp
00000000012e2a1d	retq
00000000012e2a1e	movq	%rax, %rdi
00000000012e2a21	callq	___clang_call_terminate
00000000012e2a26	movq	%rax, %rbx
00000000012e2a29	leaq	-0x38(%rbp), %rdi
00000000012e2a2d	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
00000000012e2a32	movq	%rbx, %rdi
00000000012e2a35	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
00000000012e2a3a	nopw	(%rax,%rax)
