__ZNK9PCHash1289getStringEv:
000000000001c16c	pushq	%rbp
000000000001c16d	movq	%rsp, %rbp
000000000001c170	pushq	%r14
000000000001c172	pushq	%rbx
000000000001c173	subq	$0x60, %rsp
000000000001c177	movq	%rdi, %rbx
000000000001c17a	movq	0x12c09f(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
000000000001c181	movq	(%rax), %rax
000000000001c184	movq	%rax, -0x18(%rbp)
000000000001c188	movl	(%rsi), %ecx
000000000001c18a	movl	0x4(%rsi), %r8d
000000000001c18e	movl	0x8(%rsi), %r9d
000000000001c192	movl	0xc(%rsi), %eax
000000000001c195	movl	%eax, (%rsp)
000000000001c198	leaq	0x1155ac(%rip), %rdx            ## literal pool for: "%08x%08x%08x%08x"
000000000001c19f	leaq	-0x60(%rbp), %r14
000000000001c1a3	movl	$0x40, %esi
000000000001c1a8	movq	%r14, %rdi
000000000001c1ab	xorl	%eax, %eax
000000000001c1ad	callq	0xdeb3a                         ## symbol stub for: _snprintf
000000000001c1b2	movq	%rbx, %rdi
000000000001c1b5	movq	%r14, %rsi
000000000001c1b8	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
000000000001c1bd	movq	0x12c05c(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
000000000001c1c4	movq	(%rax), %rax
000000000001c1c7	cmpq	-0x18(%rbp), %rax
000000000001c1cb	jne	0x1c1d9
000000000001c1cd	movq	%rbx, %rax
000000000001c1d0	addq	$0x60, %rsp
000000000001c1d4	popq	%rbx
000000000001c1d5	popq	%r14
000000000001c1d7	popq	%rbp
000000000001c1d8	retq
000000000001c1d9	callq	0xde744                         ## symbol stub for: ___stack_chk_fail
