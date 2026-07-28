__ZN25CustomPixelFormatRegistry23registerCustomRAWFormatEj:
00000000012e2a40	pushq	%rbp
00000000012e2a41	movq	%rsp, %rbp
00000000012e2a44	pushq	%r15
00000000012e2a46	pushq	%r14
00000000012e2a48	pushq	%r13
00000000012e2a4a	pushq	%r12
00000000012e2a4c	pushq	%rbx
00000000012e2a4d	subq	$0x38, %rsp
00000000012e2a51	movl	%esi, %r15d
00000000012e2a54	movq	%rdi, %r12
00000000012e2a57	movq	(%rdi), %rbx
00000000012e2a5a	movq	%rbx, -0x50(%rbp)
00000000012e2a5e	movb	$0x0, -0x48(%rbp)
00000000012e2a62	movq	%rbx, %rdi
00000000012e2a65	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
00000000012e2a6a	leaq	0x10(%r12), %r14
00000000012e2a6f	movq	%r12, -0x40(%rbp)
00000000012e2a73	movq	0x10(%r12), %rcx
00000000012e2a78	testq	%rcx, %rcx
00000000012e2a7b	je	0x12e2aa5
00000000012e2a7d	movq	%r14, %rax
00000000012e2a80	xorl	%edx, %edx
00000000012e2a82	cmpl	%r15d, 0x20(%rcx)
00000000012e2a86	setb	%dl
00000000012e2a89	cmovaeq	%rcx, %rax
00000000012e2a8d	movq	(%rcx,%rdx,8), %rcx
00000000012e2a91	testq	%rcx, %rcx
00000000012e2a94	jne	0x12e2a80
00000000012e2a96	cmpq	%r14, %rax
00000000012e2a99	je	0x12e2aa5
00000000012e2a9b	cmpl	0x20(%rax), %r15d
00000000012e2a9f	jae	0x12e2c2c
00000000012e2aa5	movq	0x60cb5c(%rip), %rax            ## literal pool symbol address: _kCFAllocatorDefault
00000000012e2aac	movq	(%rax), %rdi
00000000012e2aaf	movl	%r15d, %esi
00000000012e2ab2	callq	0x1495484                       ## symbol stub for: _CVPixelFormatDescriptionCreateWithPixelFormatType
00000000012e2ab7	movq	%rax, %r12
00000000012e2aba	testq	%rax, %rax
00000000012e2abd	je	0x12e2c2c
00000000012e2ac3	movq	0x60d116(%rip), %rax            ## literal pool symbol address: _kCVPixelFormatBlockWidth
00000000012e2aca	movq	(%rax), %rsi
00000000012e2acd	movq	%r12, %rdi
00000000012e2ad0	callq	0x14947b2                       ## symbol stub for: _CFDictionaryGetValue
00000000012e2ad5	movq	0x8d8404(%rip), %r13
00000000012e2adc	movq	%rax, %rdi
00000000012e2adf	movq	%r13, %rsi
00000000012e2ae2	callq	*0x60abd8(%rip)                 ## Objc message: -[%rdi setTopMargin:]
00000000012e2ae8	movl	%eax, -0x30(%rbp)
00000000012e2aeb	movq	0x60d0de(%rip), %rax            ## literal pool symbol address: _kCVPixelFormatBitsPerBlock
00000000012e2af2	movq	(%rax), %rsi
00000000012e2af5	movq	%r12, %rdi
00000000012e2af8	callq	0x14947b2                       ## symbol stub for: _CFDictionaryGetValue
00000000012e2afd	movq	%rax, %rdi
00000000012e2b00	movq	%r13, %rsi
00000000012e2b03	callq	*0x60abb7(%rip)                 ## Objc message: -[%rdi setTopMargin:]
00000000012e2b09	movl	%eax, %r13d
00000000012e2b0c	cmpl	$0x3f, %eax
00000000012e2b0f	movq	%rbx, -0x38(%rbp)
00000000012e2b13	jg	0x12e2b2c
00000000012e2b15	cmpl	$0x8, %r13d
00000000012e2b19	je	0x12e2b57
00000000012e2b1b	cmpl	$0x10, %r13d
00000000012e2b1f	jne	0x12e2b49
00000000012e2b21	movl	$0x3, %ebx
00000000012e2b26	movl	%r13d, -0x2c(%rbp)
00000000012e2b2a	jmp	0x12e2b6e
00000000012e2b2c	cmpl	$0x40, %r13d
00000000012e2b30	je	0x12e2b62
00000000012e2b32	cmpl	$0x80, %r13d
00000000012e2b39	jne	0x12e2b49
00000000012e2b3b	movl	$0x10, -0x2c(%rbp)
00000000012e2b42	movl	$0x1b, %ebx
00000000012e2b47	jmp	0x12e2b6e
00000000012e2b49	movl	$0x10, -0x2c(%rbp)
00000000012e2b50	movl	$0xb, %ebx
00000000012e2b55	jmp	0x12e2b6e
00000000012e2b57	movl	$0x1, %ebx
00000000012e2b5c	movl	%r13d, -0x2c(%rbp)
00000000012e2b60	jmp	0x12e2b6e
00000000012e2b62	movl	$0x10, -0x2c(%rbp)
00000000012e2b69	movl	$0x19, %ebx
00000000012e2b6e	movq	%r12, %rdi
00000000012e2b71	callq	0x149484e                       ## symbol stub for: _CFRelease
00000000012e2b76	leaq	_OBJC_CLASS_$_FFPixelFormat_unknownRAW(%rip), %rdi
00000000012e2b7d	callq	0x14978fc                       ## symbol stub for: _objc_alloc
00000000012e2b82	movq	0x91dfaf(%rip), %rsi
00000000012e2b89	movl	%ebx, (%rsp)
00000000012e2b8c	movq	%rax, %rdi
00000000012e2b8f	movl	%r15d, %edx
00000000012e2b92	movl	-0x30(%rbp), %ecx
00000000012e2b95	movl	%r13d, %r8d
00000000012e2b98	movl	-0x2c(%rbp), %r9d
00000000012e2b9c	callq	*0x60ab1e(%rip)                 ## Objc message: -[%rdi setTopMargin:]
00000000012e2ba2	movq	%rax, %r12
00000000012e2ba5	movq	(%r14), %rax
00000000012e2ba8	movq	%r14, %rbx
00000000012e2bab	jmp	0x12e2bb6
00000000012e2bad	nopl	(%rax)
00000000012e2bb0	movq	(%rbx), %rax
00000000012e2bb3	movq	%rbx, %r14
00000000012e2bb6	testq	%rax, %rax
00000000012e2bb9	je	0x12e2bd5
00000000012e2bbb	movq	%rax, %rbx
00000000012e2bbe	movl	0x20(%rax), %eax
00000000012e2bc1	cmpl	%eax, %r15d
00000000012e2bc4	jb	0x12e2bb0
00000000012e2bc6	jbe	0x12e2c21
00000000012e2bc8	movq	0x8(%rbx), %rax
00000000012e2bcc	testq	%rax, %rax
00000000012e2bcf	jne	0x12e2bbb
00000000012e2bd1	leaq	0x8(%rbx), %r14
00000000012e2bd5	movl	$0x30, %edi
00000000012e2bda	callq	0x1497452                       ## symbol stub for: __Znwm
00000000012e2bdf	movq	%rax, %r13
00000000012e2be2	movl	%r15d, 0x20(%rax)
00000000012e2be6	movq	$0x0, 0x28(%rax)
00000000012e2bee	xorps	%xmm0, %xmm0
00000000012e2bf1	movups	%xmm0, (%rax)
00000000012e2bf4	movq	%rbx, 0x10(%rax)
00000000012e2bf8	movq	%rax, (%r14)
00000000012e2bfb	movq	-0x40(%rbp), %rbx
00000000012e2bff	movq	0x8(%rbx), %rax
00000000012e2c03	movq	(%rax), %rax
00000000012e2c06	testq	%rax, %rax
00000000012e2c09	je	0x12e2c0f
00000000012e2c0b	movq	%rax, 0x8(%rbx)
00000000012e2c0f	movq	0x10(%rbx), %rdi
00000000012e2c13	movq	%r13, %rsi
00000000012e2c16	callq	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_balance_after_insert[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
00000000012e2c1b	incq	0x18(%rbx)
00000000012e2c1f	jmp	0x12e2c24
00000000012e2c21	movq	%rbx, %r13
00000000012e2c24	movq	-0x38(%rbp), %rbx
00000000012e2c28	movq	%r12, 0x28(%r13)
00000000012e2c2c	movq	%rbx, %rdi
00000000012e2c2f	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
00000000012e2c34	addq	$0x38, %rsp
00000000012e2c38	popq	%rbx
00000000012e2c39	popq	%r12
00000000012e2c3b	popq	%r13
00000000012e2c3d	popq	%r14
00000000012e2c3f	popq	%r15
00000000012e2c41	popq	%rbp
00000000012e2c42	retq
00000000012e2c43	jmp	0x12e2c53
00000000012e2c45	jmp	0x12e2c53
00000000012e2c47	movq	%rax, %rdi
00000000012e2c4a	callq	___clang_call_terminate
00000000012e2c4f	jmp	0x12e2c53
00000000012e2c51	jmp	0x12e2c53
00000000012e2c53	movq	%rax, %rbx
00000000012e2c56	leaq	-0x50(%rbp), %rdi
00000000012e2c5a	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
00000000012e2c5f	movq	%rbx, %rdi
00000000012e2c62	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
00000000012e2c67	nopw	(%rax,%rax)
