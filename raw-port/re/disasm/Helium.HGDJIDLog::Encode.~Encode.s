__ZN9HGDJIDLog6EncodeD0Ev:
0000000000103d80	pushq	%rbp
0000000000103d81	movq	%rsp, %rbp
0000000000103d84	pushq	%rbx
0000000000103d85	pushq	%rax
0000000000103d86	movq	%rdi, %rbx
0000000000103d89	leaq	0x9157b0(%rip), %rax
0000000000103d90	movq	%rax, (%rdi)
0000000000103d93	movq	0x198(%rdi), %rdi
0000000000103d9a	testq	%rdi, %rdi
0000000000103d9d	je	0x103da5
0000000000103d9f	movq	(%rdi), %rax
0000000000103da2	callq	*0x18(%rax)
0000000000103da5	movq	0x1a0(%rbx), %rdi
0000000000103dac	testq	%rdi, %rdi
0000000000103daf	je	0x103db7
0000000000103db1	movq	(%rdi), %rax
0000000000103db4	callq	*0x18(%rax)
0000000000103db7	movq	%rbx, %rdi
0000000000103dba	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000103dbf	movq	%rbx, %rdi
0000000000103dc2	addq	$0x8, %rsp
0000000000103dc6	popq	%rbx
0000000000103dc7	popq	%rbp
0000000000103dc8	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000103dcd	movq	%rax, %rdi
0000000000103dd0	callq	___clang_call_terminate
0000000000103dd5	nopw	%cs:(%rax,%rax)
