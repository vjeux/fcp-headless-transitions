__ZN10HGARRILogC6DecodeD2Ev:
0000000000102a30	pushq	%rbp
0000000000102a31	movq	%rsp, %rbp
0000000000102a34	pushq	%rbx
0000000000102a35	pushq	%rax
0000000000102a36	movq	%rdi, %rbx
0000000000102a39	leaq	0x915d80(%rip), %rax
0000000000102a40	movq	%rax, (%rdi)
0000000000102a43	movq	0x198(%rdi), %rdi
0000000000102a4a	testq	%rdi, %rdi
0000000000102a4d	je	0x102a55
0000000000102a4f	movq	(%rdi), %rax
0000000000102a52	callq	*0x18(%rax)
0000000000102a55	movq	0x1a0(%rbx), %rdi
0000000000102a5c	testq	%rdi, %rdi
0000000000102a5f	je	0x102a67
0000000000102a61	movq	(%rdi), %rax
0000000000102a64	callq	*0x18(%rax)
0000000000102a67	movq	%rbx, %rdi
0000000000102a6a	addq	$0x8, %rsp
0000000000102a6e	popq	%rbx
0000000000102a6f	popq	%rbp
0000000000102a70	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000102a75	movq	%rax, %rdi
0000000000102a78	callq	___clang_call_terminate
0000000000102a7d	nopl	(%rax)
