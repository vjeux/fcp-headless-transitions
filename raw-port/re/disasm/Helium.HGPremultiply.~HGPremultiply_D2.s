__ZN13HGPremultiplyD2Ev:
0000000000157b70	pushq	%rbp
0000000000157b71	movq	%rsp, %rbp
0000000000157b74	pushq	%rbx
0000000000157b75	pushq	%rax
0000000000157b76	movq	%rdi, %rbx
0000000000157b79	leaq	0x8c8608(%rip), %rax
0000000000157b80	movq	%rax, (%rdi)
0000000000157b83	movq	0x198(%rdi), %rdi
0000000000157b8a	movq	(%rdi), %rax
0000000000157b8d	callq	*0x18(%rax)
0000000000157b90	movq	%rbx, %rdi
0000000000157b93	addq	$0x8, %rsp
0000000000157b97	popq	%rbx
0000000000157b98	popq	%rbp
0000000000157b99	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157b9e	movq	%rax, %rdi
0000000000157ba1	callq	___clang_call_terminate
0000000000157ba6	nopw	%cs:(%rax,%rax)
__ZN13HGPremultiplyD1Ev:
