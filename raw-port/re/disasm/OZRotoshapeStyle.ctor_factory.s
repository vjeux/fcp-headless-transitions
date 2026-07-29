__ZN16OZRotoshapeStyleC2EP9OZFactoryRK8PCStringj:
0000000000527980	pushq	%rbp
0000000000527981	movq	%rsp, %rbp
0000000000527984	pushq	%rbx
0000000000527985	pushq	%rax
0000000000527986	movq	%rdi, %rbx
0000000000527989	callq	__ZN7OZStyleC2EP9OZFactoryRK8PCStringj ## OZStyle::OZStyle(OZFactory*, PCString const&, unsigned int)
000000000052798e	leaq	0x354213(%rip), %rax
0000000000527995	movq	%rax, (%rbx)
0000000000527998	leaq	0x354341(%rip), %rax
000000000052799f	movq	%rax, 0x10(%rbx)
00000000005279a3	leaq	0x35458e(%rip), %rax
00000000005279aa	movq	%rax, 0x28(%rbx)
00000000005279ae	addq	$0x8, %rsp
00000000005279b2	popq	%rbx
00000000005279b3	popq	%rbp
00000000005279b4	retq
00000000005279b5	nopw	%cs:(%rax,%rax)