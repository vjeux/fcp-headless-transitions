__ZN19HGSMAAPatternSearchD0Ev:
0000000000211b60	pushq	%rbp
0000000000211b61	movq	%rsp, %rbp
0000000000211b64	pushq	%rbx
0000000000211b65	pushq	%rax
0000000000211b66	movq	%rdi, %rbx
0000000000211b69	leaq	0x81cea0(%rip), %rax
0000000000211b70	movq	%rax, (%rdi)
0000000000211b73	movq	0x198(%rdi), %rax
0000000000211b7a	testq	%rax, %rax
0000000000211b7d	je	0x211b8d
0000000000211b7f	movq	-0x8(%rax), %rdi
0000000000211b83	testq	%rdi, %rdi
0000000000211b86	je	0x211b8d
0000000000211b88	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000211b8d	movq	%rbx, %rdi
0000000000211b90	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000211b95	movq	%rbx, %rdi
0000000000211b98	addq	$0x8, %rsp
0000000000211b9c	popq	%rbx
0000000000211b9d	popq	%rbp
0000000000211b9e	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000211ba3	nopw	%cs:(%rax,%rax)
