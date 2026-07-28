__ZN17HGCameraLogEncodeD0Ev:
0000000000105d60	pushq	%rbp
0000000000105d61	movq	%rsp, %rbp
0000000000105d64	pushq	%rbx
0000000000105d65	pushq	%rax
0000000000105d66	movq	%rdi, %rbx
0000000000105d69	leaq	0x914c10(%rip), %rax
0000000000105d70	movq	%rax, (%rdi)
0000000000105d73	movq	0x198(%rdi), %rdi
0000000000105d7a	testq	%rdi, %rdi
0000000000105d7d	je	0x105d85
0000000000105d7f	movq	(%rdi), %rax
0000000000105d82	callq	*0x18(%rax)
0000000000105d85	movq	%rbx, %rdi
0000000000105d88	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000105d8d	movq	%rbx, %rdi
0000000000105d90	addq	$0x8, %rsp
0000000000105d94	popq	%rbx
0000000000105d95	popq	%rbp
0000000000105d96	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000105d9b	movq	%rax, %rdi
0000000000105d9e	callq	___clang_call_terminate
0000000000105da3	nopw	%cs:(%rax,%rax)
