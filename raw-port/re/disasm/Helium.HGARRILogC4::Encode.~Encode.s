__ZN11HGARRILogC46EncodeD0Ev:
0000000000102d60	pushq	%rbp
0000000000102d61	movq	%rsp, %rbp
0000000000102d64	pushq	%rbx
0000000000102d65	pushq	%rax
0000000000102d66	movq	%rdi, %rbx
0000000000102d69	leaq	0x915c90(%rip), %rax
0000000000102d70	movq	%rax, (%rdi)
0000000000102d73	movq	0x198(%rdi), %rdi
0000000000102d7a	testq	%rdi, %rdi
0000000000102d7d	je	0x102d85
0000000000102d7f	movq	(%rdi), %rax
0000000000102d82	callq	*0x18(%rax)
0000000000102d85	movq	0x1a0(%rbx), %rdi
0000000000102d8c	testq	%rdi, %rdi
0000000000102d8f	je	0x102d97
0000000000102d91	movq	(%rdi), %rax
0000000000102d94	callq	*0x18(%rax)
0000000000102d97	movq	%rbx, %rdi
0000000000102d9a	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000102d9f	movq	%rbx, %rdi
0000000000102da2	addq	$0x8, %rsp
0000000000102da6	popq	%rbx
0000000000102da7	popq	%rbp
0000000000102da8	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000102dad	movq	%rax, %rdi
0000000000102db0	callq	___clang_call_terminate
0000000000102db5	nopw	%cs:(%rax,%rax)
