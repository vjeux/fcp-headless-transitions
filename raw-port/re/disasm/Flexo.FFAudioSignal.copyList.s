__ZN13FFAudioSignal8copyListERKNSt3__16vectorIPS_NS0_9allocatorIS2_EEEE:
0000000001257fa0	pushq	%rbp
0000000001257fa1	movq	%rsp, %rbp
0000000001257fa4	pushq	%r15
0000000001257fa6	pushq	%r14
0000000001257fa8	pushq	%r13
0000000001257faa	pushq	%r12
0000000001257fac	pushq	%rbx
0000000001257fad	subq	$0x28, %rsp
0000000001257fb1	xorps	%xmm0, %xmm0
0000000001257fb4	movups	%xmm0, (%rdi)
0000000001257fb7	movq	%rdi, -0x30(%rbp)
0000000001257fbb	movq	$0x0, 0x10(%rdi)
0000000001257fc3	movq	(%rsi), %r15
0000000001257fc6	movq	%rsi, -0x48(%rbp)
0000000001257fca	cmpq	0x8(%rsi), %r15
0000000001257fce	je	0x12580d6
0000000001257fd4	xorl	%r12d, %r12d
0000000001257fd7	xorl	%ecx, %ecx
0000000001257fd9	jmp	0x125800c
0000000001257fdb	nopl	(%rax,%rax)
0000000001257fe0	movq	%r13, (%r12)
0000000001257fe4	addq	$0x8, %r12
0000000001257fe8	movq	%r12, %r13
0000000001257feb	movq	-0x38(%rbp), %rcx
0000000001257fef	movq	-0x30(%rbp), %rax
0000000001257ff3	movq	%r13, 0x8(%rax)
0000000001257ff7	addq	$0x8, %r15
0000000001257ffb	movq	%r13, %r12
0000000001257ffe	movq	-0x48(%rbp), %rax
0000000001258002	cmpq	0x8(%rax), %r15
0000000001258006	je	0x12580d8
000000000125800c	movq	%rcx, -0x38(%rbp)
0000000001258010	movq	(%r15), %rdi
0000000001258013	movq	(%rdi), %rax
0000000001258016	callq	*0x10(%rax)
0000000001258019	movq	%rax, %r13
000000000125801c	movq	-0x30(%rbp), %rax
0000000001258020	movq	0x10(%rax), %rax
0000000001258024	cmpq	%rax, %r12
0000000001258027	jb	0x1257fe0
0000000001258029	movq	-0x38(%rbp), %rdx
000000000125802d	subq	%rdx, %r12
0000000001258030	movq	%r12, %rbx
0000000001258033	sarq	$0x3, %rbx
0000000001258037	leaq	0x1(%rbx), %rcx
000000000125803b	movabsq	$0x1fffffffffffffff, %rsi       ## imm = 0x1FFFFFFFFFFFFFFF
0000000001258045	cmpq	%rsi, %rcx
0000000001258048	ja	0x12580ee
000000000125804e	subq	%rdx, %rax
0000000001258051	movq	%rax, %r14
0000000001258054	sarq	$0x2, %r14
0000000001258058	cmpq	%rcx, %r14
000000000125805b	cmovbeq	%rcx, %r14
000000000125805f	movabsq	$0x7ffffffffffffff8, %rcx       ## imm = 0x7FFFFFFFFFFFFFF8
0000000001258069	cmpq	%rcx, %rax
000000000125806c	cmovaeq	%rsi, %r14
0000000001258070	cmpq	%rsi, %r14
0000000001258073	ja	0x12580fc
0000000001258079	leaq	(,%r14,8), %rdi
0000000001258081	callq	0x1497452                       ## symbol stub for: __Znwm
0000000001258086	leaq	(%rax,%r12), %rdi
000000000125808a	leaq	(%rax,%r14,8), %r14
000000000125808e	movq	%r13, (%rax,%r12)
0000000001258092	leaq	(%rax,%r12), %r13
0000000001258096	addq	$0x8, %r13
000000000125809a	shlq	$0x3, %rbx
000000000125809e	subq	%rbx, %rdi
00000000012580a1	movq	%rdi, -0x40(%rbp)
00000000012580a5	movq	-0x38(%rbp), %rbx
00000000012580a9	movq	%rbx, %rsi
00000000012580ac	movq	%r12, %rdx
00000000012580af	callq	0x14978ba                       ## symbol stub for: _memcpy
00000000012580b4	movq	-0x30(%rbp), %rax
00000000012580b8	movq	%r13, 0x8(%rax)
00000000012580bc	movq	%r14, 0x10(%rax)
00000000012580c0	testq	%rbx, %rbx
00000000012580c3	je	0x12580cd
00000000012580c5	movq	%rbx, %rdi
00000000012580c8	callq	0x1497404                       ## symbol stub for: __ZdlPv
00000000012580cd	movq	-0x40(%rbp), %rcx
00000000012580d1	jmp	0x1257fef
00000000012580d6	xorl	%ecx, %ecx
00000000012580d8	movq	-0x30(%rbp), %rax
00000000012580dc	movq	%rcx, (%rax)
00000000012580df	addq	$0x28, %rsp
00000000012580e3	popq	%rbx
00000000012580e4	popq	%r12
00000000012580e6	popq	%r13
00000000012580e8	popq	%r14
00000000012580ea	popq	%r15
00000000012580ec	popq	%rbp
00000000012580ed	retq
00000000012580ee	movq	-0x30(%rbp), %rax
00000000012580f2	movq	%rdx, (%rax)
00000000012580f5	callq	__ZNSt3__16vectorIP13FFAudioSignalNS_9allocatorIS2_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<FFAudioSignal*, std::__1::allocator<FFAudioSignal*>>::__throw_length_error[abi:nqe210106]()
00000000012580fa	jmp	0x125810c
00000000012580fc	movq	-0x30(%rbp), %rax
0000000001258100	movq	-0x38(%rbp), %rcx
0000000001258104	movq	%rcx, (%rax)
0000000001258107	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
000000000125810c	ud2
000000000125810e	movq	%rax, %r14
0000000001258111	jmp	0x1258121
0000000001258113	movq	%rax, %r14
0000000001258116	movq	-0x30(%rbp), %rax
000000000125811a	movq	-0x38(%rbp), %rcx
000000000125811e	movq	%rcx, (%rax)
0000000001258121	cmpq	$0x0, -0x38(%rbp)
0000000001258126	je	0x1258139
0000000001258128	movq	-0x30(%rbp), %rax
000000000125812c	movq	-0x38(%rbp), %rdi
0000000001258130	movq	%rdi, 0x8(%rax)
0000000001258134	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001258139	movq	%r14, %rdi
000000000125813c	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001258141	nopw	%cs:(%rax,%rax)
