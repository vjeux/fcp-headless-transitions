__ZN24FFAudioUnitParameterList20CollectParameterInfoEP23ComponentInstanceRecordjj:
0000000000532b10	pushq	%rbp
0000000000532b11	movq	%rsp, %rbp
0000000000532b14	pushq	%r15
0000000000532b16	pushq	%r14
0000000000532b18	pushq	%r13
0000000000532b1a	pushq	%r12
0000000000532b1c	pushq	%rbx
0000000000532b1d	subq	$0xd8, %rsp
0000000000532b24	movq	%rsi, %r14
0000000000532b27	movq	%rdi, %rbx
0000000000532b2a	movq	0x13bb097(%rip), %rax           ## literal pool symbol address: ___stack_chk_guard
0000000000532b31	movq	(%rax), %rax
0000000000532b34	movq	%rax, -0x30(%rbp)
0000000000532b38	movq	(%rdi), %r15
0000000000532b3b	movq	0x8(%rdi), %r12
0000000000532b3f	cmpq	%r12, %r15
0000000000532b42	jne	0x532c1d
0000000000532b48	movq	%r15, 0x8(%rbx)
0000000000532b4c	movl	$0x0, -0x9c(%rbp)
0000000000532b56	leaq	-0x9c(%rbp), %r8
0000000000532b5d	leaq	-0x9d(%rbp), %r9
0000000000532b64	movq	%r14, %rdi
0000000000532b67	movl	$0x3, %esi
0000000000532b6c	xorl	%edx, %edx
0000000000532b6e	xorl	%ecx, %ecx
0000000000532b70	callq	0x149461a                       ## symbol stub for: _AudioUnitGetPropertyInfo
0000000000532b75	movl	%eax, %r12d
0000000000532b78	testl	%eax, %eax
0000000000532b7a	sete	%al
0000000000532b7d	movl	-0x9c(%rbp), %r15d
0000000000532b84	testl	%r15d, %r15d
0000000000532b87	setne	%cl
0000000000532b8a	andb	%al, %cl
0000000000532b8c	cmpb	$0x1, %cl
0000000000532b8f	jne	0x532bde
0000000000532b91	movl	%r15d, %edi
0000000000532b94	callq	0x149788a                       ## symbol stub for: _malloc
0000000000532b99	testq	%rax, %rax
0000000000532b9c	je	0x532c2e
0000000000532ba2	movl	%r15d, -0xa4(%rbp)
0000000000532ba9	leaq	-0xa4(%rbp), %r9
0000000000532bb0	movq	%r14, %rdi
0000000000532bb3	movl	$0x3, %esi
0000000000532bb8	xorl	%edx, %edx
0000000000532bba	xorl	%ecx, %ecx
0000000000532bbc	movq	%rax, -0xd8(%rbp)
0000000000532bc3	movq	%rax, %r8
0000000000532bc6	callq	0x1494614                       ## symbol stub for: _AudioUnitGetProperty
0000000000532bcb	movl	%eax, %r12d
0000000000532bce	testl	%eax, %eax
0000000000532bd0	je	0x532c49
0000000000532bd2	movq	-0xd8(%rbp), %rdi
0000000000532bd9	callq	0x149776a                       ## symbol stub for: _free
0000000000532bde	movq	0x13bafe3(%rip), %rax           ## literal pool symbol address: ___stack_chk_guard
0000000000532be5	movq	(%rax), %rax
0000000000532be8	cmpq	-0x30(%rbp), %rax
0000000000532bec	jne	0x532c44
0000000000532bee	movl	%r12d, %eax
0000000000532bf1	addq	$0xd8, %rsp
0000000000532bf8	popq	%rbx
0000000000532bf9	popq	%r12
0000000000532bfb	popq	%r13
0000000000532bfd	popq	%r14
0000000000532bff	popq	%r15
0000000000532c01	popq	%rbp
0000000000532c02	retq
0000000000532c03	nopw	%cs:(%rax,%rax)
0000000000532c10	addq	$-0x28, %r12
0000000000532c14	cmpq	%r15, %r12
0000000000532c17	je	0x532b48
0000000000532c1d	movq	-0x20(%r12), %rdi
0000000000532c22	testq	%rdi, %rdi
0000000000532c25	je	0x532c10
0000000000532c27	callq	0x149484e                       ## symbol stub for: _CFRelease
0000000000532c2c	jmp	0x532c10
0000000000532c2e	movl	$0xffffff94, %r12d              ## imm = 0xFFFFFF94
0000000000532c34	movq	0x13baf8d(%rip), %rax           ## literal pool symbol address: ___stack_chk_guard
0000000000532c3b	movq	(%rax), %rax
0000000000532c3e	cmpq	-0x30(%rbp), %rax
0000000000532c42	je	0x532bee
0000000000532c44	callq	0x14974f4                       ## symbol stub for: ___stack_chk_fail
0000000000532c49	movl	-0xa4(%rbp), %r15d
0000000000532c50	cmpl	%r15d, -0x9c(%rbp)
0000000000532c57	jbe	0x532c60
0000000000532c59	movl	%r15d, -0x9c(%rbp)
0000000000532c60	testl	%r15d, %r15d
0000000000532c63	je	0x532e89
0000000000532c69	movq	%r14, %rdi
0000000000532c6c	callq	0x1494500                       ## symbol stub for: _AudioComponentInstanceGetComponent
0000000000532c71	leaq	-0xf4(%rbp), %rsi
0000000000532c78	movq	%rax, %rdi
0000000000532c7b	callq	0x14944f4                       ## symbol stub for: _AudioComponentGetDescription
0000000000532c80	movl	%eax, %r12d
0000000000532c83	testl	%eax, %eax
0000000000532c85	jne	0x532bd2
0000000000532c8b	movq	%r15, %rax
0000000000532c8e	xorl	%r12d, %r12d
0000000000532c91	cmpl	$0x4, %eax
0000000000532c94	jb	0x532bd2
0000000000532c9a	shrl	$0x2, %eax
0000000000532c9d	xorl	%r15d, %r15d
0000000000532ca0	xorl	%r12d, %r12d
0000000000532ca3	movq	%rax, -0xe0(%rbp)
0000000000532caa	jmp	0x532cc3
0000000000532cac	nopl	(%rax)
0000000000532cb0	incq	%r15
0000000000532cb3	movq	-0xe0(%rbp), %rax
0000000000532cba	cmpq	%r15, %rax
0000000000532cbd	je	0x532bd2
0000000000532cc3	movq	-0xd8(%rbp), %rax
0000000000532cca	movl	(%rax,%r15,4), %r13d
0000000000532cce	cmpl	$0x766f6973, -0xf0(%rbp)        ## imm = 0x766F6973
0000000000532cd8	jne	0x532cf0
0000000000532cda	cmpl	$0x1, %r13d
0000000000532cde	jne	0x532cf0
0000000000532ce0	cmpl	$0x6170706c, -0xec(%rbp)        ## imm = 0x6170706C
0000000000532cea	je	0x532cb0
0000000000532cec	nopl	(%rax)
0000000000532cf0	movl	$0x68, -0x9c(%rbp)
0000000000532cfa	movq	%r14, %rdi
0000000000532cfd	movl	$0x4, %esi
0000000000532d02	xorl	%edx, %edx
0000000000532d04	movl	%r13d, %ecx
0000000000532d07	leaq	-0x98(%rbp), %r8
0000000000532d0e	leaq	-0x9c(%rbp), %r9
0000000000532d15	callq	0x1494614                       ## symbol stub for: _AudioUnitGetProperty
0000000000532d1a	movl	%eax, %r12d
0000000000532d1d	testl	%eax, %eax
0000000000532d1f	jne	0x532cb0
0000000000532d21	movl	%r13d, -0xd0(%rbp)
0000000000532d28	movq	$0x0, -0xc8(%rbp)
0000000000532d33	movl	-0x38(%rbp), %eax
0000000000532d36	movl	%eax, -0xc0(%rbp)
0000000000532d3c	movl	-0x58(%rbp), %ecx
0000000000532d3f	movl	-0x48(%rbp), %edx
0000000000532d42	movl	%ecx, -0xbc(%rbp)
0000000000532d48	movl	%edx, -0xb8(%rbp)
0000000000532d4e	movsd	-0x44(%rbp), %xmm0
0000000000532d53	movsd	%xmm0, -0xb4(%rbp)
0000000000532d5b	movss	-0x3c(%rbp), %xmm0
0000000000532d60	movss	%xmm0, -0xac(%rbp)
0000000000532d68	testl	$0x100000, %eax                 ## imm = 0x100000
0000000000532d6d	jne	0x532d79
0000000000532d6f	movl	$0x0, -0xbc(%rbp)
0000000000532d79	testl	$0x8000000, %eax                ## imm = 0x8000000
0000000000532d7e	jne	0x532d9c
0000000000532d80	xorl	%edi, %edi
0000000000532d82	leaq	-0x98(%rbp), %rsi
0000000000532d89	movl	$0x8000100, %edx                ## imm = 0x8000100
0000000000532d8e	callq	0x1494902                       ## symbol stub for: _CFStringCreateWithCString
0000000000532d93	movq	%rax, -0xc8(%rbp)
0000000000532d9a	jmp	0x532db1
0000000000532d9c	movq	-0x50(%rbp), %rdi
0000000000532da0	movq	%rdi, -0xc8(%rbp)
0000000000532da7	testq	%rdi, %rdi
0000000000532daa	je	0x532db1
0000000000532dac	callq	0x1494854                       ## symbol stub for: _CFRetain
0000000000532db1	movl	-0xc0(%rbp), %eax
0000000000532db7	movl	$0xf7ffffef, %ecx               ## imm = 0xF7FFFFEF
0000000000532dbc	andl	%ecx, %eax
0000000000532dbe	movl	%eax, -0xc0(%rbp)
0000000000532dc4	movq	0x8(%rbx), %r13
0000000000532dc8	cmpq	0x10(%rbx), %r13
0000000000532dcc	jae	0x532e32
0000000000532dce	movl	-0xd0(%rbp), %ecx
0000000000532dd4	movl	%ecx, (%r13)
0000000000532dd8	movq	-0xc8(%rbp), %rdi
0000000000532ddf	movq	%rdi, 0x8(%r13)
0000000000532de3	movl	%eax, 0x10(%r13)
0000000000532de7	movq	-0xbc(%rbp), %rax
0000000000532dee	movq	%rax, 0x14(%r13)
0000000000532df2	movsd	-0xb4(%rbp), %xmm0
0000000000532dfa	movsd	%xmm0, 0x1c(%r13)
0000000000532e00	movss	-0xac(%rbp), %xmm0
0000000000532e08	movss	%xmm0, 0x24(%r13)
0000000000532e0e	testq	%rdi, %rdi
0000000000532e11	je	0x532e18
0000000000532e13	callq	0x1494854                       ## symbol stub for: _CFRetain
0000000000532e18	addq	$0x28, %r13
0000000000532e1c	movq	%r13, 0x8(%rbx)
0000000000532e20	movq	%r13, 0x8(%rbx)
0000000000532e24	movq	-0xc8(%rbp), %rdi
0000000000532e2b	testq	%rdi, %rdi
0000000000532e2e	jne	0x532e54
0000000000532e30	jmp	0x532e59
0000000000532e32	movq	%rbx, %rdi
0000000000532e35	leaq	-0xd0(%rbp), %rsi
0000000000532e3c	callq	__ZNSt3__16vectorI24FFAudioUnitParameterInfoNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## FFAudioUnitParameterInfo* std::__1::vector<FFAudioUnitParameterInfo, std::__1::allocator<FFAudioUnitParameterInfo>>::__emplace_back_slow_path<FFAudioUnitParameterInfo>(FFAudioUnitParameterInfo&&)
0000000000532e41	movq	%rax, %r13
0000000000532e44	movq	%r13, 0x8(%rbx)
0000000000532e48	movq	-0xc8(%rbp), %rdi
0000000000532e4f	testq	%rdi, %rdi
0000000000532e52	je	0x532e59
0000000000532e54	callq	0x149484e                       ## symbol stub for: _CFRelease
0000000000532e59	movl	-0x38(%rbp), %eax
0000000000532e5c	testl	$0x8000000, %eax                ## imm = 0x8000000
0000000000532e61	je	0x532cb0
0000000000532e67	shrb	$0x4, %al
0000000000532e6a	movq	-0x50(%rbp), %rdi
0000000000532e6e	testq	%rdi, %rdi
0000000000532e71	setne	%cl
0000000000532e74	andb	%al, %cl
0000000000532e76	cmpb	$0x1, %cl
0000000000532e79	jne	0x532cb0
0000000000532e7f	callq	0x149484e                       ## symbol stub for: _CFRelease
0000000000532e84	jmp	0x532cb0
0000000000532e89	xorl	%r12d, %r12d
0000000000532e8c	jmp	0x532bd2
0000000000532e91	movq	%rax, %r14
0000000000532e94	movq	%r13, 0x8(%rbx)
0000000000532e98	leaq	-0xd0(%rbp), %rdi
0000000000532e9f	callq	__ZN24FFAudioUnitParameterInfoD1Ev ## FFAudioUnitParameterInfo::~FFAudioUnitParameterInfo()
0000000000532ea4	movq	%r14, %rdi
0000000000532ea7	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000532eac	movq	%rax, %r14
0000000000532eaf	leaq	-0xd0(%rbp), %rdi
0000000000532eb6	callq	__ZN24FFAudioUnitParameterInfoD1Ev ## FFAudioUnitParameterInfo::~FFAudioUnitParameterInfo()
0000000000532ebb	movq	%r14, %rdi
0000000000532ebe	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000532ec3	jmp	0x532ed0
0000000000532ec5	movq	%rax, %r14
0000000000532ec8	movq	%r14, %rdi
0000000000532ecb	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000532ed0	movq	%rax, %r14
0000000000532ed3	testl	%edx, %edx
0000000000532ed5	jne	0x532edf
0000000000532ed7	movq	%r14, %rdi
0000000000532eda	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000532edf	movq	%r14, %rdi
0000000000532ee2	callq	___clang_call_terminate
0000000000532ee7	nopw	(%rax,%rax)
