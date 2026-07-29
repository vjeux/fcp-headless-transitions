__ZN10HGARRILogC6DecodeD1Ev:
0000000000102a80	pushq	%rbp
0000000000102a81	movq	%rsp, %rbp
0000000000102a84	pushq	%rbx
0000000000102a85	pushq	%rax
0000000000102a86	movq	%rdi, %rbx
0000000000102a89	leaq	0x915d30(%rip), %rax
0000000000102a90	movq	%rax, (%rdi)
0000000000102a93	movq	0x198(%rdi), %rdi
0000000000102a9a	testq	%rdi, %rdi
0000000000102a9d	je	0x102aa5
0000000000102a9f	movq	(%rdi), %rax
0000000000102aa2	callq	*0x18(%rax)
0000000000102aa5	movq	0x1a0(%rbx), %rdi
0000000000102aac	testq	%rdi, %rdi
0000000000102aaf	je	0x102ab7
0000000000102ab1	movq	(%rdi), %rax
0000000000102ab4	callq	*0x18(%rax)
0000000000102ab7	movq	%rbx, %rdi
0000000000102aba	addq	$0x8, %rsp
0000000000102abe	popq	%rbx
0000000000102abf	popq	%rbp
0000000000102ac0	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000102ac5	movq	%rax, %rdi
0000000000102ac8	callq	___clang_call_terminate
0000000000102acd	nopl	(%rax)
