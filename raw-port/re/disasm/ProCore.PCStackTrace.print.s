__ZNK12PCStackTrace5printERNSt3__113basic_ostreamIcNS0_11char_traitsIcEEEE:
000000000006fc3a	movq	0x8(%rdi), %rax
000000000006fc3e	cmpq	(%rdi), %rax
000000000006fc41	je	0x6fceb
000000000006fc47	pushq	%rbp
000000000006fc48	movq	%rsp, %rbp
000000000006fc4b	pushq	%r15
000000000006fc4d	pushq	%r14
000000000006fc4f	pushq	%r13
000000000006fc51	pushq	%r12
000000000006fc53	pushq	%rbx
000000000006fc54	pushq	%rax
000000000006fc55	movq	%rsi, %rbx
000000000006fc58	movq	%rdi, %r14
000000000006fc5b	movl	$0x1, %r13d
000000000006fc61	xorl	%r12d, %r12d
000000000006fc64	movabsq	$-0x5555555555555555, %r15      ## imm = 0xAAAAAAAAAAAAAAAB
000000000006fc6e	movl	$0x2, %edx
000000000006fc73	movq	%rbx, %rdi
000000000006fc76	leaq	0xc3466(%rip), %rsi             ## literal pool for: "  "
000000000006fc7d	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006fc82	movq	(%r14), %rcx
000000000006fc85	leaq	(%r12,%r12,2), %rdi
000000000006fc89	movzbl	(%rcx,%rdi,8), %edx
000000000006fc8d	testb	$0x1, %dl
000000000006fc90	je	0x6fc9e
000000000006fc92	movq	0x10(%rcx,%rdi,8), %rsi
000000000006fc97	movq	0x8(%rcx,%rdi,8), %rdx
000000000006fc9c	jmp	0x6fca7
000000000006fc9e	shrl	%edx
000000000006fca0	leaq	(%rcx,%rdi,8), %rsi
000000000006fca4	incq	%rsi
000000000006fca7	movq	%rax, %rdi
000000000006fcaa	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006fcaf	movl	$0x1, %edx
000000000006fcb4	movq	%rax, %rdi
000000000006fcb7	leaq	0xc1756(%rip), %rsi             ## literal pool for: "\n"
000000000006fcbe	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006fcc3	movl	%r13d, %r12d
000000000006fcc6	movq	0x8(%r14), %rax
000000000006fcca	subq	(%r14), %rax
000000000006fccd	sarq	$0x3, %rax
000000000006fcd1	imulq	%r15, %rax
000000000006fcd5	incl	%r13d
000000000006fcd8	cmpq	%r12, %rax
000000000006fcdb	jne	0x6fc6e
000000000006fcdd	addq	$0x8, %rsp
000000000006fce1	popq	%rbx
000000000006fce2	popq	%r12
000000000006fce4	popq	%r13
000000000006fce6	popq	%r14
000000000006fce8	popq	%r15
000000000006fcea	popq	%rbp
000000000006fceb	retq
