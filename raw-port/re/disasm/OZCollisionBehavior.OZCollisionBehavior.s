__ZN19OZCollisionBehaviorC1EP9OZFactoryRK8PCStringj:
00000000001db650	pushq	%rbp
00000000001db651	movq	%rsp, %rbp
00000000001db654	pushq	%rbx
00000000001db655	pushq	%rax
00000000001db656	movq	%rdi, %rbx
00000000001db659	callq	__ZN19OZReflexiveBehaviorC2EP9OZFactoryRK8PCStringj ## OZReflexiveBehavior::OZReflexiveBehavior(OZFactory*, PCString const&, unsigned int)
00000000001db65e	leaq	0x667073(%rip), %rax
00000000001db665	movq	%rax, (%rbx)
00000000001db668	leaq	0x667369(%rip), %rax
00000000001db66f	movq	%rax, 0x10(%rbx)
00000000001db673	leaq	0x6675b6(%rip), %rax
00000000001db67a	movq	%rax, 0x28(%rbx)
00000000001db67e	leaq	0x667603(%rip), %rax
00000000001db685	movq	%rax, 0x148(%rbx)
00000000001db68c	addq	$0x8, %rsp
00000000001db690	popq	%rbx
00000000001db691	popq	%rbp
00000000001db692	retq
00000000001db693	nopw	%cs:(%rax,%rax)
