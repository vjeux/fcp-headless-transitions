__ZN19STBuiltinAudioUnits8DescribeEj:
0000000001251b20	movq	%rdi, %rax
0000000001251b23	cmpq	$-0x1, __ZZN19STBuiltinAudioUnits8DescribeEjE22sBuiltinAURegistration(%rip) ## STBuiltinAudioUnits::Describe(unsigned int)::sBuiltinAURegistration
0000000001251b2b	jne	0x1251b46
0000000001251b2d	movl	$0x61756d78, (%rax)             ## imm = 0x61756D78
0000000001251b33	movl	%esi, 0x4(%rax)
0000000001251b36	movq	$0x7461705f, 0x8(%rax)          ## imm = 0x7461705F
0000000001251b3e	movl	$0x0, 0x10(%rax)
0000000001251b45	retq
0000000001251b46	pushq	%rbp
0000000001251b47	movq	%rsp, %rbp
0000000001251b4a	pushq	%r14
0000000001251b4c	pushq	%rbx
0000000001251b4d	movq	%rax, %rbx
0000000001251b50	movl	%esi, %r14d
0000000001251b53	callq	__ZN19STBuiltinAudioUnits8DescribeEj.cold.1 ## STBuiltinAudioUnits::Describe(unsigned int) (.cold.1)
0000000001251b58	movl	%r14d, %esi
0000000001251b5b	movq	%rbx, %rax
0000000001251b5e	popq	%rbx
0000000001251b5f	popq	%r14
0000000001251b61	popq	%rbp
0000000001251b62	jmp	0x1251b2d
0000000001251b64	nopw	%cs:(%rax,%rax)
