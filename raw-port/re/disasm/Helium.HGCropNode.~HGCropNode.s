__ZN10HGCropNodeD0Ev:
0000000000247c70	pushq	%rbp
0000000000247c71	movq	%rsp, %rbp
0000000000247c74	pushq	%rbx
0000000000247c75	pushq	%rax
0000000000247c76	movq	%rdi, %rbx
0000000000247c79	leaq	0x7eec18(%rip), %rax
0000000000247c80	movq	%rax, (%rdi)
0000000000247c83	movq	0x198(%rdi), %rdi
0000000000247c8a	testq	%rdi, %rdi
0000000000247c8d	je	0x247c94
0000000000247c8f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000247c94	movq	%rbx, %rdi
0000000000247c97	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000247c9c	movq	%rbx, %rdi
0000000000247c9f	addq	$0x8, %rsp
0000000000247ca3	popq	%rbx
0000000000247ca4	popq	%rbp
0000000000247ca5	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000247caa	nopw	(%rax,%rax)
