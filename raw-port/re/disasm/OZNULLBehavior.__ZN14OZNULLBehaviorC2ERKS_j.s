__ZN14OZNULLBehaviorC2ERKS_j:
0000000000354100	pushq	%rbp
0000000000354101	movq	%rsp, %rbp
0000000000354104	pushq	%rbx
0000000000354105	pushq	%rax
0000000000354106	movq	%rdi, %rbx
0000000000354109	callq	__ZN10OZBehaviorC2ERKS_j        ## OZBehavior::OZBehavior(OZBehavior const&, unsigned int)
000000000035410e	leaq	0x4fe24b(%rip), %rax
0000000000354115	movq	%rax, (%rbx)
0000000000354118	leaq	0x4fe4c9(%rip), %rax
000000000035411f	movq	%rax, 0x10(%rbx)
0000000000354123	leaq	0x4fe716(%rip), %rax
000000000035412a	movq	%rax, 0x28(%rbx)
000000000035412e	addq	$0x8, %rsp
0000000000354132	popq	%rbx
0000000000354133	popq	%rbp
0000000000354134	retq
0000000000354135	nopw	%cs:(%rax,%rax)
