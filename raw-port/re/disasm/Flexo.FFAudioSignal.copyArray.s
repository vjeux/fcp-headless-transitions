__ZN13FFAudioSignal9copyArrayEPS_z:
0000000001257d30	pushq	%rbp
0000000001257d31	movq	%rsp, %rbp
0000000001257d34	pushq	%r15
0000000001257d36	pushq	%r14
0000000001257d38	pushq	%r13
0000000001257d3a	pushq	%r12
0000000001257d3c	pushq	%rbx
0000000001257d3d	subq	$0xf8, %rsp
0000000001257d44	movq	%rdi, %r13
0000000001257d47	movq	%rdx, -0x110(%rbp)
0000000001257d4e	movq	%rcx, -0x108(%rbp)
0000000001257d55	movq	%r8, -0x100(%rbp)
0000000001257d5c	movq	%r9, -0xf8(%rbp)
0000000001257d63	testb	%al, %al
0000000001257d65	je	0x1257d9c
0000000001257d67	movaps	%xmm0, -0xf0(%rbp)
0000000001257d6e	movaps	%xmm1, -0xe0(%rbp)
0000000001257d75	movaps	%xmm2, -0xd0(%rbp)
0000000001257d7c	movaps	%xmm3, -0xc0(%rbp)
0000000001257d83	movaps	%xmm4, -0xb0(%rbp)
0000000001257d8a	movaps	%xmm5, -0xa0(%rbp)
0000000001257d91	movaps	%xmm6, -0x90(%rbp)
0000000001257d98	movaps	%xmm7, -0x80(%rbp)
0000000001257d9c	movq	0x695e25(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000001257da3	movq	(%rax), %rax
0000000001257da6	movq	%rax, -0x30(%rbp)
0000000001257daa	xorps	%xmm0, %xmm0
0000000001257dad	movups	%xmm0, (%rdi)
0000000001257db0	movq	$0x0, 0x10(%rdi)
0000000001257db8	testq	%rsi, %rsi
0000000001257dbb	je	0x1257f23
0000000001257dc1	leaq	-0x120(%rbp), %rax
0000000001257dc8	movq	%rax, -0x40(%rbp)
0000000001257dcc	leaq	0x10(%rbp), %rax
0000000001257dd0	movq	%rax, -0x48(%rbp)
0000000001257dd4	movabsq	$0x3000000010, %rax             ## imm = 0x3000000010
0000000001257dde	movq	%rax, -0x50(%rbp)
0000000001257de2	xorl	%ebx, %ebx
0000000001257de4	xorl	%edx, %edx
0000000001257de6	movq	%r13, -0x60(%rbp)
0000000001257dea	jmp	0x1257e08
0000000001257dec	nopl	(%rax)
0000000001257df0	movq	-0x48(%rbp), %rax
0000000001257df4	leaq	0x8(%rax), %rcx
0000000001257df8	movq	%rcx, -0x48(%rbp)
0000000001257dfc	movq	(%rax), %rsi
0000000001257dff	testq	%rsi, %rsi
0000000001257e02	je	0x1257f1f
0000000001257e08	movq	%rdx, -0x58(%rbp)
0000000001257e0c	movq	(%rsi), %rax
0000000001257e0f	movq	%rsi, %rdi
0000000001257e12	callq	*0x10(%rax)
0000000001257e15	movq	%rax, %r12
0000000001257e18	movq	0x10(%r13), %rax
0000000001257e1c	cmpq	%rax, %rbx
0000000001257e1f	jae	0x1257e40
0000000001257e21	movq	%r12, (%rbx)
0000000001257e24	addq	$0x8, %rbx
0000000001257e28	movq	-0x58(%rbp), %rdx
0000000001257e2c	movq	%rbx, 0x8(%r13)
0000000001257e30	movl	-0x50(%rbp), %ecx
0000000001257e33	cmpq	$0x28, %rcx
0000000001257e37	ja	0x1257df0
0000000001257e39	jmp	0x1257f06
0000000001257e3e	nop
0000000001257e40	movq	-0x58(%rbp), %rdx
0000000001257e44	subq	%rdx, %rbx
0000000001257e47	movq	%rbx, %r15
0000000001257e4a	sarq	$0x3, %r15
0000000001257e4e	leaq	0x1(%r15), %rcx
0000000001257e52	movabsq	$0x1fffffffffffffff, %rsi       ## imm = 0x1FFFFFFFFFFFFFFF
0000000001257e5c	cmpq	%rsi, %rcx
0000000001257e5f	ja	0x1257f48
0000000001257e65	subq	%rdx, %rax
0000000001257e68	movq	%rax, %r14
0000000001257e6b	sarq	$0x2, %r14
0000000001257e6f	cmpq	%rcx, %r14
0000000001257e72	cmovbeq	%rcx, %r14
0000000001257e76	movabsq	$0x7ffffffffffffff8, %rcx       ## imm = 0x7FFFFFFFFFFFFFF8
0000000001257e80	cmpq	%rcx, %rax
0000000001257e83	cmovaeq	%rsi, %r14
0000000001257e87	cmpq	%rsi, %r14
0000000001257e8a	ja	0x1257f53
0000000001257e90	leaq	(,%r14,8), %rdi
0000000001257e98	callq	0x1497452                       ## symbol stub for: __Znwm
0000000001257e9d	leaq	(%rax,%rbx), %r13
0000000001257ea1	leaq	(%rax,%r14,8), %rcx
0000000001257ea5	movq	%rcx, -0x68(%rbp)
0000000001257ea9	movq	%r12, (%rax,%rbx)
0000000001257ead	leaq	(%rax,%rbx), %r14
0000000001257eb1	addq	$0x8, %r14
0000000001257eb5	shlq	$0x3, %r15
0000000001257eb9	subq	%r15, %r13
0000000001257ebc	movq	%r13, %rdi
0000000001257ebf	movq	-0x58(%rbp), %r15
0000000001257ec3	movq	%r15, %rsi
0000000001257ec6	movq	%rbx, %rdx
0000000001257ec9	callq	0x14978ba                       ## symbol stub for: _memcpy
0000000001257ece	movq	-0x60(%rbp), %rax
0000000001257ed2	movq	%r14, 0x8(%rax)
0000000001257ed6	movq	-0x68(%rbp), %rcx
0000000001257eda	movq	%rcx, 0x10(%rax)
0000000001257ede	testq	%r15, %r15
0000000001257ee1	je	0x1257eeb
0000000001257ee3	movq	%r15, %rdi
0000000001257ee6	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001257eeb	movq	%r13, %rdx
0000000001257eee	movq	%r14, %rbx
0000000001257ef1	movq	-0x60(%rbp), %r13
0000000001257ef5	movq	%rbx, 0x8(%r13)
0000000001257ef9	movl	-0x50(%rbp), %ecx
0000000001257efc	cmpq	$0x28, %rcx
0000000001257f00	ja	0x1257df0
0000000001257f06	movq	%rcx, %rax
0000000001257f09	addq	-0x40(%rbp), %rax
0000000001257f0d	addl	$0x8, %ecx
0000000001257f10	movl	%ecx, -0x50(%rbp)
0000000001257f13	movq	(%rax), %rsi
0000000001257f16	testq	%rsi, %rsi
0000000001257f19	jne	0x1257e08
0000000001257f1f	movq	%rdx, (%r13)
0000000001257f23	movq	0x695c9e(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000001257f2a	movq	(%rax), %rax
0000000001257f2d	cmpq	-0x30(%rbp), %rax
0000000001257f31	jne	0x1257f62
0000000001257f33	movq	%r13, %rax
0000000001257f36	addq	$0xf8, %rsp
0000000001257f3d	popq	%rbx
0000000001257f3e	popq	%r12
0000000001257f40	popq	%r13
0000000001257f42	popq	%r14
0000000001257f44	popq	%r15
0000000001257f46	popq	%rbp
0000000001257f47	retq
0000000001257f48	movq	%rdx, (%r13)
0000000001257f4c	callq	__ZNSt3__16vectorIP13FFAudioSignalNS_9allocatorIS2_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<FFAudioSignal*, std::__1::allocator<FFAudioSignal*>>::__throw_length_error[abi:nqe210106]()
0000000001257f51	jmp	0x1257f60
0000000001257f53	movq	-0x58(%rbp), %rax
0000000001257f57	movq	%rax, (%r13)
0000000001257f5b	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
0000000001257f60	ud2
0000000001257f62	callq	0x14974f4                       ## symbol stub for: ___stack_chk_fail
0000000001257f67	movq	%rax, %r15
0000000001257f6a	jmp	0x1257f77
0000000001257f6c	movq	%rax, %r15
0000000001257f6f	movq	-0x58(%rbp), %rax
0000000001257f73	movq	%rax, (%r13)
0000000001257f77	cmpq	$0x0, -0x58(%rbp)
0000000001257f7c	je	0x1257f8f
0000000001257f7e	movq	-0x60(%rbp), %rax
0000000001257f82	movq	-0x58(%rbp), %rdi
0000000001257f86	movq	%rdi, 0x8(%rax)
0000000001257f8a	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001257f8f	movq	%r15, %rdi
0000000001257f92	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001257f97	nopw	(%rax,%rax)
