__ZN4HGPQ4EOTFD2Ev:
00000000000fdc40	pushq	%rbp
00000000000fdc41	movq	%rsp, %rbp
00000000000fdc44	pushq	%rbx
00000000000fdc45	pushq	%rax
00000000000fdc46	leaq	0x9180b3(%rip), %rax
00000000000fdc4d	movq	%rax, (%rdi)
00000000000fdc50	movq	0x198(%rdi), %rax
00000000000fdc57	testq	%rax, %rax
00000000000fdc5a	je	0xfdc6b
00000000000fdc5c	movq	(%rax), %rcx
00000000000fdc5f	movq	%rdi, %rbx
00000000000fdc62	movq	%rax, %rdi
00000000000fdc65	callq	*0x18(%rcx)
00000000000fdc68	movq	%rbx, %rdi
00000000000fdc6b	addq	$0x8, %rsp
00000000000fdc6f	popq	%rbx
00000000000fdc70	popq	%rbp
00000000000fdc71	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fdc76	movq	%rax, %rdi
00000000000fdc79	callq	___clang_call_terminate
00000000000fdc7e	nop
