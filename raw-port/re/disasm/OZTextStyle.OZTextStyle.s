__ZN11OZTextStyleC2EP9OZFactoryRK8PCStringj:
000000000014a5c0	pushq	%rbp
000000000014a5c1	movq	%rsp, %rbp
000000000014a5c4	pushq	%rbx
000000000014a5c5	pushq	%rax
000000000014a5c6	movq	%rdi, %rbx
000000000014a5c9	callq	__ZN7OZStyleC2EP9OZFactoryRK8PCStringj ## OZStyle::OZStyle(OZFactory*, PCString const&, unsigned int)
000000000014a5ce	leaq	0x6f459b(%rip), %rax
000000000014a5d5	movq	%rax, (%rbx)
000000000014a5d8	leaq	0x6f46c1(%rip), %rax
000000000014a5df	movq	%rax, 0x10(%rbx)
000000000014a5e3	leaq	0x6f490e(%rip), %rax
000000000014a5ea	movq	%rax, 0x28(%rbx)
000000000014a5ee	addq	$0x8, %rsp
000000000014a5f2	popq	%rbx
000000000014a5f3	popq	%rbp
000000000014a5f4	retq
000000000014a5f5	nopw	%cs:(%rax,%rax)
