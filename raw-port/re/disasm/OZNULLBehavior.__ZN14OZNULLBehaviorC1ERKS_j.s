__ZN14OZNULLBehaviorC1ERKS_j:
0000000000354140	pushq	%rbp
0000000000354141	movq	%rsp, %rbp
0000000000354144	pushq	%rbx
0000000000354145	pushq	%rax
0000000000354146	movq	%rdi, %rbx
0000000000354149	callq	__ZN10OZBehaviorC2ERKS_j        ## OZBehavior::OZBehavior(OZBehavior const&, unsigned int)
000000000035414e	leaq	0x4fe20b(%rip), %rax
0000000000354155	movq	%rax, (%rbx)
0000000000354158	leaq	0x4fe489(%rip), %rax
000000000035415f	movq	%rax, 0x10(%rbx)
0000000000354163	leaq	0x4fe6d6(%rip), %rax
000000000035416a	movq	%rax, 0x28(%rbx)
000000000035416e	addq	$0x8, %rsp
0000000000354172	popq	%rbx
0000000000354173	popq	%rbp
0000000000354174	retq
0000000000354175	nopw	%cs:(%rax,%rax)
