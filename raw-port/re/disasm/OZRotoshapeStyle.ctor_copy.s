__ZN16OZRotoshapeStyleC2ERKS_j:
0000000000527a00	pushq	%rbp
0000000000527a01	movq	%rsp, %rbp
0000000000527a04	pushq	%rbx
0000000000527a05	pushq	%rax
0000000000527a06	movq	%rdi, %rbx
0000000000527a09	callq	__ZN7OZStyleC2ERKS_j            ## OZStyle::OZStyle(OZStyle const&, unsigned int)
0000000000527a0e	leaq	0x354193(%rip), %rax
0000000000527a15	movq	%rax, (%rbx)
0000000000527a18	leaq	0x3542c1(%rip), %rax
0000000000527a1f	movq	%rax, 0x10(%rbx)
0000000000527a23	leaq	0x35450e(%rip), %rax
0000000000527a2a	movq	%rax, 0x28(%rbx)
0000000000527a2e	addq	$0x8, %rsp
0000000000527a32	popq	%rbx
0000000000527a33	popq	%rbp
0000000000527a34	retq
0000000000527a35	nopw	%cs:(%rax,%rax)