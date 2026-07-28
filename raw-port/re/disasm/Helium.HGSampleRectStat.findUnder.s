__ZNK16HGSampleRectStat9findUnderEv:
0000000000148b00	pushq	%rbp
0000000000148b01	movq	%rsp, %rbp
0000000000148b04	pushq	%r15
0000000000148b06	pushq	%r14
0000000000148b08	pushq	%r13
0000000000148b0a	pushq	%r12
0000000000148b0c	pushq	%rbx
0000000000148b0d	subq	$0x18, %rsp
0000000000148b11	movq	%rdi, %rbx
0000000000148b14	movq	(%rdi), %rdi
0000000000148b17	movq	(%rdi), %rax
0000000000148b1a	callq	*0x30(%rax)
0000000000148b1d	movq	%rax, %r15
0000000000148b20	movq	%rax, %rdi
0000000000148b23	callq	0x3c5612                        ## symbol stub for: _strlen
0000000000148b28	cmpq	$-0x9, %rax
0000000000148b2c	jae	0x148ca8
0000000000148b32	movq	%rax, %r14
0000000000148b35	cmpq	$0x17, %rax
0000000000148b39	jae	0x148b4d
0000000000148b3b	leal	(%r14,%r14), %eax
0000000000148b3f	movb	%al, -0x40(%rbp)
0000000000148b42	leaq	-0x3f(%rbp), %r12
0000000000148b46	testq	%r14, %r14
0000000000148b49	jne	0x148b80
0000000000148b4b	jmp	0x148b8e
0000000000148b4d	movq	%r14, %rax
0000000000148b50	orq	$0x7, %rax
0000000000148b54	leaq	0x1(%rax), %rcx
0000000000148b58	cmpq	$0x17, %rax
0000000000148b5c	movl	$0x1a, %r13d
0000000000148b62	cmovneq	%rcx, %r13
0000000000148b66	movq	%r13, %rdi
0000000000148b69	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000148b6e	movq	%rax, %r12
0000000000148b71	movq	%rax, -0x30(%rbp)
0000000000148b75	incq	%r13
0000000000148b78	movq	%r13, -0x40(%rbp)
0000000000148b7c	movq	%r14, -0x38(%rbp)
0000000000148b80	movq	%r12, %rdi
0000000000148b83	movq	%r15, %rsi
0000000000148b86	movq	%r14, %rdx
0000000000148b89	callq	0x3c543e                        ## symbol stub for: _memmove
0000000000148b8e	movb	$0x0, (%r12,%r14)
0000000000148b93	callq	__ZN9ROIStatIO4openEv           ## ROIStatIO::open()
0000000000148b98	movq	%rax, %r14
0000000000148b9b	movq	__ZN14MotionROIFrame6_pThisE(%rip), %rax ## MotionROIFrame::_pThis
0000000000148ba2	testq	%rax, %rax
0000000000148ba5	je	0x148bab
0000000000148ba7	movl	(%rax), %edx
0000000000148ba9	jmp	0x148bc7
0000000000148bab	movl	$0x4, %edi
0000000000148bb0	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000148bb5	movl	$0xffffffff, (%rax)             ## imm = 0xFFFFFFFF
0000000000148bbb	movq	%rax, __ZN14MotionROIFrame6_pThisE(%rip) ## MotionROIFrame::_pThis
0000000000148bc2	movl	$0xffffffff, %edx               ## imm = 0xFFFFFFFF
0000000000148bc7	leaq	-0x40(%rbp), %rsi
0000000000148bcb	movq	%r14, %rdi
0000000000148bce	callq	__ZN9ROIStatIO8currNodeERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEi ## ROIStatIO::currNode(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, int)
0000000000148bd3	cmpl	$0xf423f, 0x2c(%rbx)            ## imm = 0xF423F
0000000000148bda	je	0x148c1d
0000000000148bdc	cmpb	$0x1, 0x3c(%rbx)
0000000000148be0	jne	0x148c1d
0000000000148be2	movq	__ZN14MotionROIFrame6_pThisE(%rip), %rax ## MotionROIFrame::_pThis
0000000000148be9	testq	%rax, %rax
0000000000148bec	je	0x148bf2
0000000000148bee	movl	(%rax), %edx
0000000000148bf0	jmp	0x148c0e
0000000000148bf2	movl	$0x4, %edi
0000000000148bf7	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000148bfc	movl	$0xffffffff, (%rax)             ## imm = 0xFFFFFFFF
0000000000148c02	movq	%rax, __ZN14MotionROIFrame6_pThisE(%rip) ## MotionROIFrame::_pThis
0000000000148c09	movl	$0xffffffff, %edx               ## imm = 0xFFFFFFFF
0000000000148c0e	movl	0x28(%rbx), %ecx
0000000000148c11	leaq	-0x40(%rbp), %rsi
0000000000148c15	movq	%r14, %rdi
0000000000148c18	callq	__ZN9ROIStatIO6failedERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEii ## ROIStatIO::failed(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, int, int)
0000000000148c1d	movq	0x80(%r14), %r15
0000000000148c24	testq	%r15, %r15
0000000000148c27	je	0x148c62
0000000000148c29	leaq	0x8(%r14), %r12
0000000000148c2d	movq	(%r12), %rax
0000000000148c31	movq	%r12, %rdi
0000000000148c34	callq	*0x30(%rax)
0000000000148c37	movl	%eax, %ebx
0000000000148c39	movq	%r15, %rdi
0000000000148c3c	callq	0x3c5102                        ## symbol stub for: _fclose
0000000000148c41	movl	%eax, %r15d
0000000000148c44	movq	$0x0, 0x80(%r14)
0000000000148c4f	movq	0x8(%r14), %rax
0000000000148c53	movq	%r12, %rdi
0000000000148c56	xorl	%esi, %esi
0000000000148c58	xorl	%edx, %edx
0000000000148c5a	callq	*0x18(%rax)
0000000000148c5d	orl	%ebx, %r15d
0000000000148c60	je	0x148c7c
0000000000148c62	movq	(%r14), %rax
0000000000148c65	movq	-0x18(%rax), %rax
0000000000148c69	movq	%r14, %rdi
0000000000148c6c	addq	%rax, %rdi
0000000000148c6f	movl	0x20(%r14,%rax), %esi
0000000000148c74	orl	$0x4, %esi
0000000000148c77	callq	0x3c4f5e                        ## symbol stub for: __ZNSt3__18ios_base5clearEj
0000000000148c7c	testb	$0x1, -0x40(%rbp)
0000000000148c80	jne	0x148c91
0000000000148c82	addq	$0x18, %rsp
0000000000148c86	popq	%rbx
0000000000148c87	popq	%r12
0000000000148c89	popq	%r13
0000000000148c8b	popq	%r14
0000000000148c8d	popq	%r15
0000000000148c8f	popq	%rbp
0000000000148c90	retq
0000000000148c91	movq	-0x30(%rbp), %rdi
0000000000148c95	addq	$0x18, %rsp
0000000000148c99	popq	%rbx
0000000000148c9a	popq	%r12
0000000000148c9c	popq	%r13
0000000000148c9e	popq	%r14
0000000000148ca0	popq	%r15
0000000000148ca2	popq	%rbp
0000000000148ca3	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000148ca8	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE20__throw_length_errorB9nqe210106Ev ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::__throw_length_error[abi:nqe210106]()
0000000000148cad	jmp	0x148cbc
0000000000148caf	movq	%rax, %rbx
0000000000148cb2	movq	%r15, %rdi
0000000000148cb5	callq	0x3c5102                        ## symbol stub for: _fclose
0000000000148cba	jmp	0x148cbf
0000000000148cbc	movq	%rax, %rbx
0000000000148cbf	testb	$0x1, -0x40(%rbp)
0000000000148cc3	je	0x148cce
0000000000148cc5	movq	-0x30(%rbp), %rdi
0000000000148cc9	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000148cce	movq	%rbx, %rdi
0000000000148cd1	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000148cd6	nopw	%cs:(%rax,%rax)
