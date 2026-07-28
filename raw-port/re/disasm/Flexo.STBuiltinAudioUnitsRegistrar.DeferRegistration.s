__ZN28STBuiltinAudioUnitsRegistrar17DeferRegistrationEPFP29AudioComponentPlugInInterfacePK25AudioComponentDescriptionEj:
00000000012519c0	pushq	%rbp
00000000012519c1	movq	%rsp, %rbp
00000000012519c4	pushq	%r15
00000000012519c6	pushq	%r14
00000000012519c8	pushq	%r13
00000000012519ca	pushq	%r12
00000000012519cc	pushq	%rbx
00000000012519cd	subq	$0x38, %rsp
00000000012519d1	movq	%rsi, %r8
00000000012519d4	cmpb	$0x1, (%rdi)
00000000012519d7	jne	0x1251a12
00000000012519d9	movl	$0x61756d78, -0x54(%rbp)        ## imm = 0x61756D78
00000000012519e0	movl	%edx, -0x50(%rbp)
00000000012519e3	movabsq	$0x37461705f, %rax              ## imm = 0x37461705F
00000000012519ed	movq	%rax, -0x4c(%rbp)
00000000012519f1	movl	$0x0, -0x44(%rbp)
00000000012519f8	leaq	0x6de1e9(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
00000000012519ff	leaq	-0x54(%rbp), %rdi
0000000001251a03	xorl	%edx, %edx
0000000001251a05	movq	%r8, %rcx
0000000001251a08	callq	0x1494512                       ## symbol stub for: _AudioComponentRegister
0000000001251a0d	jmp	0x1251afb
0000000001251a12	movq	%rdi, %rbx
0000000001251a15	movq	0x10(%rdi), %r15
0000000001251a19	movq	0x18(%rdi), %rax
0000000001251a1d	cmpq	%rax, %r15
0000000001251a20	jae	0x1251a37
0000000001251a22	movq	%r8, (%r15)
0000000001251a25	movl	%edx, 0x8(%r15)
0000000001251a29	movb	$0x0, 0xc(%r15)
0000000001251a2e	addq	$0x10, %r15
0000000001251a32	jmp	0x1251af7
0000000001251a37	movq	0x8(%rbx), %rdi
0000000001251a3b	subq	%rdi, %r15
0000000001251a3e	movq	%r15, %r14
0000000001251a41	sarq	$0x4, %r14
0000000001251a45	leaq	0x1(%r14), %rcx
0000000001251a49	movq	%rcx, %rsi
0000000001251a4c	shrq	$0x3c, %rsi
0000000001251a50	jne	0x1251b0c
0000000001251a56	movq	%r8, -0x40(%rbp)
0000000001251a5a	movl	%edx, -0x2c(%rbp)
0000000001251a5d	movabsq	$0xfffffffffffffff, %rdx        ## imm = 0xFFFFFFFFFFFFFFF
0000000001251a67	movq	%rdi, -0x38(%rbp)
0000000001251a6b	subq	%rdi, %rax
0000000001251a6e	movq	%rax, %r13
0000000001251a71	sarq	$0x3, %r13
0000000001251a75	cmpq	%rcx, %r13
0000000001251a78	cmovbeq	%rcx, %r13
0000000001251a7c	movabsq	$0x7ffffffffffffff0, %rcx       ## imm = 0x7FFFFFFFFFFFFFF0
0000000001251a86	cmpq	%rcx, %rax
0000000001251a89	cmovaeq	%rdx, %r13
0000000001251a8d	cmpq	%rdx, %r13
0000000001251a90	ja	0x1251b11
0000000001251a92	shlq	$0x4, %r13
0000000001251a96	movq	%r13, %rdi
0000000001251a99	callq	0x1497452                       ## symbol stub for: __Znwm
0000000001251a9e	leaq	(%rax,%r15), %r12
0000000001251aa2	addq	%rax, %r13
0000000001251aa5	movq	-0x40(%rbp), %rcx
0000000001251aa9	movq	%rcx, (%rax,%r15)
0000000001251aad	movl	-0x2c(%rbp), %ecx
0000000001251ab0	movl	%ecx, 0x8(%rax,%r15)
0000000001251ab5	movb	$0x0, 0xc(%rax,%r15)
0000000001251abb	addq	%r15, %rax
0000000001251abe	addq	$0x10, %rax
0000000001251ac2	shlq	$0x4, %r14
0000000001251ac6	subq	%r14, %r12
0000000001251ac9	movq	%r12, %rdi
0000000001251acc	movq	-0x38(%rbp), %r14
0000000001251ad0	movq	%r14, %rsi
0000000001251ad3	movq	%r15, %rdx
0000000001251ad6	movq	%rax, %r15
0000000001251ad9	callq	0x14978ba                       ## symbol stub for: _memcpy
0000000001251ade	movq	%r12, 0x8(%rbx)
0000000001251ae2	movq	%r15, 0x10(%rbx)
0000000001251ae6	movq	%r13, 0x18(%rbx)
0000000001251aea	testq	%r14, %r14
0000000001251aed	je	0x1251af7
0000000001251aef	movq	%r14, %rdi
0000000001251af2	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001251af7	movq	%r15, 0x10(%rbx)
0000000001251afb	movb	$0x1, %al
0000000001251afd	addq	$0x38, %rsp
0000000001251b01	popq	%rbx
0000000001251b02	popq	%r12
0000000001251b04	popq	%r13
0000000001251b06	popq	%r14
0000000001251b08	popq	%r15
0000000001251b0a	popq	%rbp
0000000001251b0b	retq
0000000001251b0c	callq	__ZNSt3__16vectorIN28STBuiltinAudioUnitsRegistrar20DeferredRegistrationENS_9allocatorIS2_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<STBuiltinAudioUnitsRegistrar::DeferredRegistration, std::__1::allocator<STBuiltinAudioUnitsRegistrar::DeferredRegistration>>::__throw_length_error[abi:nqe210106]()
0000000001251b11	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
0000000001251b16	nopw	%cs:(%rax,%rax)
