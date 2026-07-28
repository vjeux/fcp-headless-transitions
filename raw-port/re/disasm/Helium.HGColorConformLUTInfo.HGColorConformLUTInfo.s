__ZN21HGColorConformLUTInfoC2E5HGRefI21HGColorConformLUTDataEmmNSt3__16vectorIhNS3_9allocatorIhEEEEffN16HGApplyNDLUTInfo16LUTStorageFormatE:
00000000001d2a10	pushq	%rbp
00000000001d2a11	movq	%rsp, %rbp
00000000001d2a14	pushq	%r15
00000000001d2a16	pushq	%r14
00000000001d2a18	pushq	%r13
00000000001d2a1a	pushq	%r12
00000000001d2a1c	pushq	%rbx
00000000001d2a1d	pushq	%rax
00000000001d2a1e	movq	%r8, %r14
00000000001d2a21	movq	%rsi, %r15
00000000001d2a24	movq	%rdi, %rbx
00000000001d2a27	movq	%rdx, %rsi
00000000001d2a2a	movq	%rcx, %rdx
00000000001d2a2d	movl	%r9d, %ecx
00000000001d2a30	callq	__ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE ## HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000001d2a35	leaq	0x8575ec(%rip), %rax
00000000001d2a3c	movq	%rax, (%rbx)
00000000001d2a3f	movq	(%r15), %rdi
00000000001d2a42	movq	%rdi, 0x28(%rbx)
00000000001d2a46	testq	%rdi, %rdi
00000000001d2a49	je	0x1d2a51
00000000001d2a4b	movq	(%rdi), %rax
00000000001d2a4e	callq	*0x10(%rax)
00000000001d2a51	movb	$0x1, 0x30(%rbx)
00000000001d2a55	xorps	%xmm0, %xmm0
00000000001d2a58	movups	%xmm0, 0x38(%rbx)
00000000001d2a5c	movq	$0x0, 0x48(%rbx)
00000000001d2a64	movq	(%r14), %r12
00000000001d2a67	movq	0x8(%r14), %rax
00000000001d2a6b	movq	%rax, %r15
00000000001d2a6e	subq	%r12, %r15
00000000001d2a71	je	0x1d2af2
00000000001d2a73	leaq	0x38(%rbx), %r13
00000000001d2a77	testq	%r15, %r15
00000000001d2a7a	js	0x1d2b55
00000000001d2a80	movq	%rax, -0x30(%rbp)
00000000001d2a84	movq	%r15, %rdi
00000000001d2a87	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001d2a8c	movq	%rax, %r14
00000000001d2a8f	movq	%rax, 0x38(%rbx)
00000000001d2a93	movq	%rax, 0x40(%rbx)
00000000001d2a97	movq	%rax, %r13
00000000001d2a9a	addq	%r15, %r13
00000000001d2a9d	movq	%r13, 0x48(%rbx)
00000000001d2aa1	movq	%rax, %rdi
00000000001d2aa4	movq	%r12, %rsi
00000000001d2aa7	movq	%r15, %rdx
00000000001d2aaa	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000001d2aaf	movq	%r13, 0x40(%rbx)
00000000001d2ab3	movl	%r15d, %eax
00000000001d2ab6	andl	$0x3, %eax
00000000001d2ab9	subq	-0x30(%rbp), %r12
00000000001d2abd	cmpq	$-0x4, %r12
00000000001d2ac1	jbe	0x1d2b01
00000000001d2ac3	movb	$0x1, %cl
00000000001d2ac5	testq	%rax, %rax
00000000001d2ac8	je	0x1d2aef
00000000001d2aca	xorl	%edx, %edx
00000000001d2acc	jmp	0x1d2ae0
00000000001d2ace	nop
00000000001d2ad0	cmpb	$0x0, (%r14,%rdx)
00000000001d2ad5	sete	%cl
00000000001d2ad8	incq	%rdx
00000000001d2adb	cmpq	%rdx, %rax
00000000001d2ade	je	0x1d2aef
00000000001d2ae0	testb	$0x1, %cl
00000000001d2ae3	jne	0x1d2ad0
00000000001d2ae5	xorl	%ecx, %ecx
00000000001d2ae7	incq	%rdx
00000000001d2aea	cmpq	%rdx, %rax
00000000001d2aed	jne	0x1d2ae0
00000000001d2aef	movb	%cl, 0x30(%rbx)
00000000001d2af2	addq	$0x8, %rsp
00000000001d2af6	popq	%rbx
00000000001d2af7	popq	%r12
00000000001d2af9	popq	%r13
00000000001d2afb	popq	%r14
00000000001d2afd	popq	%r15
00000000001d2aff	popq	%rbp
00000000001d2b00	retq
00000000001d2b01	movabsq	$0x7ffffffffffffffc, %rcx       ## imm = 0x7FFFFFFFFFFFFFFC
00000000001d2b0b	andq	%rcx, %r15
00000000001d2b0e	movb	$0x1, %cl
00000000001d2b10	testb	$0x1, %cl
00000000001d2b13	je	0x1d2b30
00000000001d2b15	cmpb	$0x0, (%r14)
00000000001d2b19	jne	0x1d2b30
00000000001d2b1b	cmpb	$0x0, 0x1(%r14)
00000000001d2b20	jne	0x1d2b30
00000000001d2b22	cmpb	$0x0, 0x2(%r14)
00000000001d2b27	je	0x1d2b3e
00000000001d2b29	nopl	(%rax)
00000000001d2b30	xorl	%ecx, %ecx
00000000001d2b32	addq	$0x4, %r14
00000000001d2b36	addq	$-0x4, %r15
00000000001d2b3a	jne	0x1d2b10
00000000001d2b3c	jmp	0x1d2ac5
00000000001d2b3e	cmpb	$0x0, 0x3(%r14)
00000000001d2b43	sete	%cl
00000000001d2b46	addq	$0x4, %r14
00000000001d2b4a	addq	$-0x4, %r15
00000000001d2b4e	jne	0x1d2b10
00000000001d2b50	jmp	0x1d2ac5
00000000001d2b55	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::__throw_length_error[abi:nqe210106]()
00000000001d2b5a	ud2
00000000001d2b5c	movq	%rax, %r14
00000000001d2b5f	movq	(%r13), %rdi
00000000001d2b63	testq	%rdi, %rdi
00000000001d2b66	je	0x1d2b71
00000000001d2b68	movq	%rdi, 0x40(%rbx)
00000000001d2b6c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d2b71	movq	0x28(%rbx), %rdi
00000000001d2b75	testq	%rdi, %rdi
00000000001d2b78	je	0x1d2b80
00000000001d2b7a	movq	(%rdi), %rax
00000000001d2b7d	callq	*0x18(%rax)
00000000001d2b80	movq	%r14, %rdi
00000000001d2b83	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d2b88	movq	%rax, %rdi
00000000001d2b8b	callq	___clang_call_terminate
