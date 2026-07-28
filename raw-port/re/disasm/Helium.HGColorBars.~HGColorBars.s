__ZN11HGColorBarsD0Ev:
0000000000030d80	pushq	%rbp
0000000000030d81	movq	%rsp, %rbp
0000000000030d84	pushq	%rbx
0000000000030d85	pushq	%rax
0000000000030d86	movq	%rdi, %rbx
0000000000030d89	leaq	0x9d4818(%rip), %rax
0000000000030d90	movq	%rax, (%rdi)
0000000000030d93	movq	0x198(%rdi), %rdi
0000000000030d9a	testq	%rdi, %rdi
0000000000030d9d	je	0x30da5
0000000000030d9f	movq	(%rdi), %rax
0000000000030da2	callq	*0x18(%rax)
0000000000030da5	movq	%rbx, %rdi
0000000000030da8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000030dad	movq	%rbx, %rdi
0000000000030db0	addq	$0x8, %rsp
0000000000030db4	popq	%rbx
0000000000030db5	popq	%rbp
0000000000030db6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000030dbb	movq	%rax, %rdi
0000000000030dbe	callq	___clang_call_terminate
0000000000030dc3	nopw	%cs:(%rax,%rax)
